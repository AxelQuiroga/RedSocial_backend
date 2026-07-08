import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCommentUseCase } from '../../../src/application/use-cases/comment/CreateCommentUseCase.js';
import { MockCommentRepository } from '../../mocks/MockCommentRepository.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { InMemoryEventBus } from '../../mocks/InMemoryEventBus.js';

describe('CreateCommentUseCase', () => {
  let commentRepo: MockCommentRepository;
  let postRepo: MockPostRepository;
  let eventBus: InMemoryEventBus;
  let useCase: CreateCommentUseCase;
  let postId: string;
  let authorId: string;

  beforeEach(() => {
    commentRepo = new MockCommentRepository();
    postRepo = new MockPostRepository();
    eventBus = new InMemoryEventBus();

    authorId = crypto.randomUUID();
    postId = crypto.randomUUID();

    postRepo.seed(
      [
        {
          id: postId,
          title: 'Test Post',
          content: 'Content that is long enough for testing',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Map([[authorId, { id: authorId, username: 'author' }]])
    );

    useCase = new CreateCommentUseCase(commentRepo, postRepo, eventBus);
  });

  it('should create a root comment successfully', async () => {
    const userId = crypto.randomUUID();
    const result = await useCase.execute(userId, {
      content: 'Great post!',
      postId,
      parentId: null,
    });

    expect(result.content).toBe('Great post!');
    expect(result.postId).toBe(postId);
    expect(result.authorId).toBe(userId);
    expect(result.parentId).toBeNull();
  });

  it('should emit comment.created event', async () => {
    const userId = crypto.randomUUID();
    await useCase.execute(userId, {
      content: 'Nice!',
      postId,
      parentId: null,
    });

    expect(eventBus.emittedEvents).toHaveLength(1);
    expect(eventBus.emittedEvents[0].event).toBe('comment.created');
  });

  it('should throw when content is empty', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        content: '',
        postId,
        parentId: null,
      })
    ).rejects.toThrow('El contenido es requerido');
  });

  it('should throw when content is only whitespace', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        content: '   ',
        postId,
        parentId: null,
      })
    ).rejects.toThrow('El contenido es requerido');
  });

  it('should throw when post does not exist', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        content: 'Comment content',
        postId: 'non-existent-id',
        parentId: null,
      })
    ).rejects.toThrow('Post no encontrado');
  });

  it('should create a reply to a comment successfully', async () => {
    const commenterId = crypto.randomUUID();
    const parentComment = await commentRepo.create({
      content: 'Parent comment',
      authorId: commenterId,
      postId,
      parentId: null,
    });

    const reply = await useCase.execute(crypto.randomUUID(), {
      content: 'This is a reply',
      postId,
      parentId: parentComment.id,
    });

    expect(reply.parentId).toBe(parentComment.id);
    expect(reply.content).toBe('This is a reply');
  });

  it('should throw when parent comment does not exist', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        content: 'Reply content',
        postId,
        parentId: 'non-existent-parent',
      })
    ).rejects.toThrow('Comentario padre no encontrado');
  });

  it('should throw when parent comment belongs to a different post', async () => {
    const otherPostId = crypto.randomUUID();
    postRepo.seed(
      [
        {
          id: otherPostId,
          title: 'Other Post',
          content: 'Other post content that is long enough',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Map([[authorId, { id: authorId, username: 'author' }]])
    );

    const parentComment = await commentRepo.create({
      content: 'Parent on other post',
      authorId: crypto.randomUUID(),
      postId: otherPostId,
      parentId: null,
    });

    await expect(
      useCase.execute(crypto.randomUUID(), {
        content: 'Reply',
        postId,
        parentId: parentComment.id,
      })
    ).rejects.toThrow('El comentario padre no pertenece a este post');
  });

  it('should throw when trying to reply to a reply (1 level nesting max)', async () => {
    const commenterId = crypto.randomUUID();
    const parentComment = await commentRepo.create({
      content: 'Root comment',
      authorId: commenterId,
      postId,
      parentId: null,
    });

    const reply = await commentRepo.create({
      content: 'First reply',
      authorId: commenterId,
      postId,
      parentId: parentComment.id,
    });

    await expect(
      useCase.execute(crypto.randomUUID(), {
        content: 'Reply to a reply',
        postId,
        parentId: reply.id,
      })
    ).rejects.toThrow('No se puede responder a una respuesta');
  });
});
