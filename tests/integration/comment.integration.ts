import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCommentUseCase } from '../../src/application/use-cases/comment/CreateCommentUseCase';
import { GetPostCommentsUseCase } from '../../src/application/use-cases/comment/GetPostCommentsUseCase';
import { GetCommentRepliesUseCase } from '../../src/application/use-cases/comment/GetCommentRepliesUseCase';
import { UpdateCommentUseCase } from '../../src/application/use-cases/comment/UpdateCommentUseCase';
import { DeleteCommentUseCase } from '../../src/application/use-cases/comment/DeleteCommentUseCase';
import { PrismaCommentRepository } from '../../src/infrastructure/repositories/PrismaCommentRepository';
import { PrismaPostRepository } from '../../src/infrastructure/repositories/PrismaPostRepository';
import { PrismaNotificationRepository } from '../../src/infrastructure/repositories/PrismaNotificationRepository';
import { NotificationListeners } from '../../src/infrastructure/events/NotificationListeners';
import { NotificationService } from '../../src/application/services/NotificationService';
import { InMemoryEventBus } from '../mocks/InMemoryEventBus';
import { cleanupDb, prisma } from '../setup';
import { createUser, createPost } from '../factories';

let eventBus: InMemoryEventBus;
let commentRepo: PrismaCommentRepository;
let postRepo: PrismaPostRepository;

beforeEach(async () => {
  await cleanupDb();
  eventBus = new InMemoryEventBus();

  commentRepo = new PrismaCommentRepository(prisma);
  postRepo = new PrismaPostRepository(prisma);

  // Registrar listeners para notificaciones
  const notificationRepo = new PrismaNotificationRepository(prisma);
  const notificationService = new NotificationService(notificationRepo, commentRepo);
  new NotificationListeners(notificationService, eventBus);
});

describe('CreateCommentUseCase Integration', () => {
  it('should create a root comment', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const useCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);
    const result = await useCase.execute(author.id, {
      content: 'Great post!',
      postId: post.id,
      parentId: null,
    });

    expect(result.content).toBe('Great post!');
    expect(result.postId).toBe(post.id);
    expect(result.authorId).toBe(author.id);
    expect(result.parentId).toBeNull();
    expect(eventBus.emittedEvents).toHaveLength(1);
    expect(eventBus.emittedEvents[0].event).toBe('comment.created');
  });

  it('should create a reply to a comment', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    // Crear comentario raíz primero
    const createUseCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);
    const parent = await createUseCase.execute(author.id, {
      content: 'Parent comment',
      postId: post.id,
      parentId: null,
    });

    eventBus.emittedEvents = []; // limpiar eventos del setup

    // Crear respuesta
    const reply = await createUseCase.execute(author.id, {
      content: 'This is a reply',
      postId: post.id,
      parentId: parent.id,
    });

    expect(reply.content).toBe('This is a reply');
    expect(reply.parentId).toBe(parent.id);
    expect(reply.postId).toBe(post.id);
  });

  it('should create notification for post author on comment', async () => {
    const author = await createUser(prisma);
    const commenter = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const useCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);
    await useCase.execute(commenter.id, {
      content: 'Nice post!',
      postId: post.id,
      parentId: null,
    });

    // Esperar a que el evento asíncrono se procese
    await new Promise((resolve) => setTimeout(resolve, 100));

    const notifications = await prisma.notification.findMany({
      where: { userId: author.id, type: 'COMMENT_ON_POST' },
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0].actorId).toBe(commenter.id);
    expect(notifications[0].postId).toBe(post.id);
  });

  it('should not create notification on self-comment', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const useCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);
    await useCase.execute(author.id, {
      content: 'My own comment',
      postId: post.id,
      parentId: null,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const notifications = await prisma.notification.findMany({
      where: { userId: author.id },
    });

    expect(notifications).toHaveLength(0);
  });

  it('should throw on empty content', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const useCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);

    await expect(
      useCase.execute(author.id, {
        content: '',
        postId: post.id,
        parentId: null,
      })
    ).rejects.toThrow('El contenido es requerido');
  });

  it('should throw on non-existent post', async () => {
    const user = await createUser(prisma);
    const useCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);

    await expect(
      useCase.execute(user.id, {
        content: 'Comment on missing post',
        postId: 'non-existent-id',
        parentId: null,
      })
    ).rejects.toThrow('Post no encontrado');
  });

  it('should throw on non-existent parent comment', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const useCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);

    await expect(
      useCase.execute(author.id, {
        content: 'Reply to missing comment',
        postId: post.id,
        parentId: 'non-existent-parent',
      })
    ).rejects.toThrow('Comentario padre no encontrado');
  });

  it('should throw when parent comment belongs to different post', async () => {
    const author = await createUser(prisma);
    const { post: postA } = await createPost(prisma, { authorId: author.id });
    const { post: postB } = await createPost(prisma, { authorId: author.id });

    // Crear comentario en postA
    const createUseCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);
    const parent = await createUseCase.execute(author.id, {
      content: 'Parent in post A',
      postId: postA.id,
      parentId: null,
    });

    // Intentar responder desde postB
    await expect(
      createUseCase.execute(author.id, {
        content: 'Reply from post B',
        postId: postB.id,
        parentId: parent.id,
      })
    ).rejects.toThrow('El comentario padre no pertenece a este post');
  });

  it('should throw on nested reply (reply to a reply)', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const createUseCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);

    // Crear comentario raíz
    const parent = await createUseCase.execute(author.id, {
      content: 'Root comment',
      postId: post.id,
      parentId: null,
    });

    eventBus.emittedEvents = [];

    // Crear respuesta
    const reply = await createUseCase.execute(author.id, {
      content: 'First level reply',
      postId: post.id,
      parentId: parent.id,
    });

    // Intentar responder a la respuesta (nested reply)
    await expect(
      createUseCase.execute(author.id, {
        content: 'Second level reply',
        postId: post.id,
        parentId: reply.id,
      })
    ).rejects.toThrow('No se puede responder a una respuesta');
  });
});

describe('GetPostCommentsUseCase Integration', () => {
  it('should return paginated root comments', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    // Crear varios comentarios via Prisma directo
    for (let i = 0; i < 3; i++) {
      await prisma.comment.create({
        data: {
          content: `Comment ${i + 1}`,
          authorId: author.id,
          postId: post.id,
        },
      });
    }

    const useCase = new GetPostCommentsUseCase(commentRepo);
    const result = await useCase.execute(post.id, 1, 10);

    expect(result.comments).toHaveLength(3);
    expect(result.meta.total).toBe(3);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });

  it('should return empty for post with no comments', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const useCase = new GetPostCommentsUseCase(commentRepo);
    const result = await useCase.execute(post.id, 1, 10);

    expect(result.comments).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });

  it('should only return root comments (not replies)', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    // Crear un comentario raíz
    const rootComment = await prisma.comment.create({
      data: { content: 'Root', authorId: author.id, postId: post.id },
    });

    // Crear una respuesta
    await prisma.comment.create({
      data: {
        content: 'Reply',
        authorId: author.id,
        postId: post.id,
        parentId: rootComment.id,
      },
    });

    const useCase = new GetPostCommentsUseCase(commentRepo);
    const result = await useCase.execute(post.id, 1, 10);

    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].id).toBe(rootComment.id);
    expect(result.meta.total).toBe(1);
  });
});

describe('GetCommentRepliesUseCase Integration', () => {
  it('should return paginated replies', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    // Crear comentario raíz
    const parentComment = await prisma.comment.create({
      data: { content: 'Parent', authorId: author.id, postId: post.id },
    });

    // Crear respuestas
    for (let i = 0; i < 2; i++) {
      await prisma.comment.create({
        data: {
          content: `Reply ${i + 1}`,
          authorId: author.id,
          postId: post.id,
          parentId: parentComment.id,
        },
      });
    }

    const useCase = new GetCommentRepliesUseCase(commentRepo);
    const result = await useCase.execute(parentComment.id, 1, 10);

    expect(result.comments).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(result.comments.every((c) => c.parentId === parentComment.id)).toBe(
      true
    );
  });

  it('should throw on non-existent parent comment', async () => {
    const useCase = new GetCommentRepliesUseCase(commentRepo);

    await expect(
      useCase.execute('non-existent-id', 1, 10)
    ).rejects.toThrow('Comentario padre no encontrado');
  });
});

describe('UpdateCommentUseCase Integration', () => {
  it('should update own comment', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const comment = await prisma.comment.create({
      data: { content: 'Original content', authorId: author.id, postId: post.id },
    });

    const useCase = new UpdateCommentUseCase(commentRepo);
    const result = await useCase.execute(author.id, comment.id, {
      content: 'Updated content',
    });

    expect(result.content).toBe('Updated content');
  });

  it('should throw on non-existent comment', async () => {
    const user = await createUser(prisma);
    const useCase = new UpdateCommentUseCase(commentRepo);

    await expect(
      useCase.execute(user.id, 'non-existent-id', { content: 'Updated' })
    ).rejects.toThrow('Comentario no encontrado');
  });

  it('should throw when not the author', async () => {
    const author = await createUser(prisma, {
      email: 'author@test.com',
      username: 'author',
    });
    const otherUser = await createUser(prisma, {
      email: 'other@test.com',
      username: 'other',
    });
    const { post } = await createPost(prisma, { authorId: author.id });

    const comment = await prisma.comment.create({
      data: { content: 'Original', authorId: author.id, postId: post.id },
    });

    const useCase = new UpdateCommentUseCase(commentRepo);

    await expect(
      useCase.execute(otherUser.id, comment.id, { content: 'Hacked!' })
    ).rejects.toThrow('No autorizado para editar este comentario');
  });

  it('should throw on empty content', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const comment = await prisma.comment.create({
      data: { content: 'Original', authorId: author.id, postId: post.id },
    });

    const useCase = new UpdateCommentUseCase(commentRepo);

    await expect(
      useCase.execute(author.id, comment.id, { content: '' })
    ).rejects.toThrow('El contenido es requerido');
  });
});

describe('DeleteCommentUseCase Integration', () => {
  it('should delete own root comment', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    const comment = await prisma.comment.create({
      data: { content: 'To delete', authorId: author.id, postId: post.id },
    });

    const useCase = new DeleteCommentUseCase(commentRepo, postRepo);
    const result = await useCase.execute(author.id, comment.id);

    expect(result).toBe(true);

    const deleted = await prisma.comment.findUnique({
      where: { id: comment.id },
    });
    expect(deleted).toBeNull();
  });

  it('should delete comment and its replies', async () => {
    const author = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: author.id });

    // Crear comentario raíz
    const rootComment = await prisma.comment.create({
      data: { content: 'Root', authorId: author.id, postId: post.id },
    });

    // Crear respuestas
    await prisma.comment.create({
      data: {
        content: 'Reply 1',
        authorId: author.id,
        postId: post.id,
        parentId: rootComment.id,
      },
    });
    await prisma.comment.create({
      data: {
        content: 'Reply 2',
        authorId: author.id,
        postId: post.id,
        parentId: rootComment.id,
      },
    });

    const useCase = new DeleteCommentUseCase(commentRepo, postRepo);
    const result = await useCase.execute(author.id, rootComment.id);

    expect(result).toBe(true);

    const remaining = await prisma.comment.findMany({
      where: { OR: [{ id: rootComment.id }, { parentId: rootComment.id }] },
    });
    expect(remaining).toHaveLength(0);
  });

  it('should return false on non-existent comment', async () => {
    const user = await createUser(prisma);
    const useCase = new DeleteCommentUseCase(commentRepo, postRepo);

    const result = await useCase.execute(user.id, 'non-existent-id');
    expect(result).toBe(false);
  });

  it('should throw when not the author and not post author', async () => {
    const author = await createUser(prisma, {
      email: 'author@test.com',
      username: 'author',
    });
    const stranger = await createUser(prisma, {
      email: 'stranger@test.com',
      username: 'stranger',
    });
    const { post } = await createPost(prisma, { authorId: author.id });

    const comment = await prisma.comment.create({
      data: { content: 'My comment', authorId: author.id, postId: post.id },
    });

    const useCase = new DeleteCommentUseCase(commentRepo, postRepo);

    await expect(
      useCase.execute(stranger.id, comment.id)
    ).rejects.toThrow('No autorizado para eliminar este comentario');
  });

  it('should allow post author to delete any comment', async () => {
    const postAuthor = await createUser(prisma, {
      email: 'postauthor@test.com',
      username: 'postauthor',
    });
    const commenter = await createUser(prisma, {
      email: 'commenter@test.com',
      username: 'commenter',
    });
    const { post } = await createPost(prisma, { authorId: postAuthor.id });

    const comment = await prisma.comment.create({
      data: { content: 'Comment by other', authorId: commenter.id, postId: post.id },
    });

    const useCase = new DeleteCommentUseCase(commentRepo, postRepo);
    const result = await useCase.execute(postAuthor.id, comment.id);

    expect(result).toBe(true);
  });
});
