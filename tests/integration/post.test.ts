import { describe, it, expect, beforeEach } from 'vitest';
import { DeletePostUseCase } from '../../src/application/use-cases/post/DeletePostUseCase';
import { PrismaPostRepository } from '../../src/infrastructure/repositories/PrismaPostRepository';
import { InMemoryEventBus } from '../mocks/InMemoryEventBus';
import { cleanupDb, prisma } from '../setup';
import { createUser, createPost } from '../factories';
import { PrismaNotificationRepository } from '../../src/infrastructure/repositories/PrismaNotificationRepository';
import { NotificationListeners } from '../../src/infrastructure/events/NotificationListeners';
import { NotificationService } from '../../src/application/services/NotificationService';
import { PrismaCommentRepository } from '../../src/infrastructure/repositories/PrismaCommentRepository';

let eventBus: InMemoryEventBus;
let postRepo: PrismaPostRepository;
let notificationRepo: PrismaNotificationRepository;

beforeEach(async () => {
  await cleanupDb();
  eventBus = new InMemoryEventBus();
  postRepo = new PrismaPostRepository(prisma);
  notificationRepo = new PrismaNotificationRepository(prisma);

  // Registrar listeners para cleanup de notificaciones
  const commentRepo = new PrismaCommentRepository(prisma);
  const notificationService = new NotificationService(notificationRepo, commentRepo);
  new NotificationListeners(notificationService, eventBus);
});

describe('DeletePostUseCase Integration', () => {
  it('should delete post and cleanup notifications', async () => {
    const author = await createUser(prisma);
    const liker = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    // Setup: crear notificación directamente (no vía eventBus para evitar race conditions)
    const notification = await prisma.notification.create({
      data: {
        userId: author.id,
        type: 'LIKE_ON_POST',
        title: 'Nuevo me gusta',
        message: 'Alguien dio me gusta a tu post',
        actorId: liker.id,
        postId: post.id,
      }
    });

    expect(notification).toBeDefined();

    // Act: borrar likes (por FK restrict) y borrar post
    await prisma.like.deleteMany({ where: { postId: post.id } });
    
    const deleteUseCase = new DeletePostUseCase(postRepo, eventBus);
    await deleteUseCase.execute(post.id, author.id);

    // Assert: post eliminado
    const deletedPost = await prisma.post.findUnique({ where: { id: post.id } });
    expect(deletedPost).toBeNull();

    // Assert: notificaciones limpiadas
    const notifications = await prisma.notification.findMany({
      where: { postId: post.id }
    });
    expect(notifications).toHaveLength(0);
  });

  it('should throw when post not found', async () => {
    const author = await createUser(prisma);
    const deleteUseCase = new DeletePostUseCase(postRepo, eventBus);

    await expect(deleteUseCase.execute('non-existent-id', author.id)).rejects.toThrow('Post no encontrado');
  });

  it('should throw when user is not author', async () => {
    const author = await createUser(prisma);
    const otherUser = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    const deleteUseCase = new DeletePostUseCase(postRepo, eventBus);

    await expect(deleteUseCase.execute(post.id, otherUser.id)).rejects.toThrow('No autorizado');
  });
});
