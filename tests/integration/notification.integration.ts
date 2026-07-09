import { describe, it, expect, beforeEach } from 'vitest';
import { GetNotificationsUseCase } from '../../src/application/use-cases/notification/GetNotificationsUseCase';
import { MarkAsReadUseCase } from '../../src/application/use-cases/notification/MarkAsReadUseCase';
import { MarkAllAsReadUseCase } from '../../src/application/use-cases/notification/MarkAllAsReadUseCase';
import { GetUnreadCountUseCase } from '../../src/application/use-cases/notification/GetUnreadCountUseCase';
import { PrismaNotificationRepository } from '../../src/infrastructure/repositories/PrismaNotificationRepository';
import { cleanupDb, prisma } from '../setup';
import { createUser, createPost } from '../factories';

let notificationRepo: PrismaNotificationRepository;

beforeEach(async () => {
  await cleanupDb();
  notificationRepo = new PrismaNotificationRepository(prisma);
});

describe('GetNotificationsUseCase Integration', () => {
  it('should return paginated notifications for user', async () => {
    const user = await createUser(prisma);
    const actor = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: user.id });

    // Crear notificaciones directamente via Prisma
    for (let i = 0; i < 3; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'LIKE_ON_POST',
          title: 'Nuevo me gusta',
          message: `Like ${i + 1}`,
          actorId: actor.id,
          postId: post.id,
        },
      });
    }

    const useCase = new GetNotificationsUseCase(notificationRepo);
    const result = await useCase.execute(user.id, 1, 10);

    expect(result.notifications).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('should only return notifications for the specified user', async () => {
    const userA = await createUser(prisma, {
      email: 'userA@test.com',
      username: 'userA',
    });
    const userB = await createUser(prisma, {
      email: 'userB@test.com',
      username: 'userB',
    });
    const actor = await createUser(prisma, {
      email: 'actor@test.com',
      username: 'actor',
    });
    const { post } = await createPost(prisma, { authorId: userA.id });

    // Una notificación para userA
    await prisma.notification.create({
      data: {
        userId: userA.id,
        type: 'LIKE_ON_POST',
        title: 'Like for A',
        message: 'Someone liked your post',
        actorId: actor.id,
        postId: post.id,
      },
    });

    const useCase = new GetNotificationsUseCase(notificationRepo);

    const resultA = await useCase.execute(userA.id, 1, 10);
    expect(resultA.notifications).toHaveLength(1);

    const resultB = await useCase.execute(userB.id, 1, 10);
    expect(resultB.notifications).toHaveLength(0);
    expect(resultB.total).toBe(0);
  });

  it('should return paginated results correctly', async () => {
    const user = await createUser(prisma);
    const actor = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: user.id });

    for (let i = 0; i < 5; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'LIKE_ON_POST',
          title: 'Notification',
          message: `Notification ${i + 1}`,
          actorId: actor.id,
          postId: post.id,
        },
      });
    }

    const useCase = new GetNotificationsUseCase(notificationRepo);

    // Página 1 con 2 elementos
    const page1 = await useCase.execute(user.id, 1, 2);
    expect(page1.notifications).toHaveLength(2);
    expect(page1.total).toBe(5);

    // Página 2 con 2 elementos
    const page2 = await useCase.execute(user.id, 2, 2);
    expect(page2.notifications).toHaveLength(2);

    // Página 3 con 1 elemento
    const page3 = await useCase.execute(user.id, 3, 2);
    expect(page3.notifications).toHaveLength(1);
  });
});

describe('MarkAsReadUseCase Integration', () => {
  it('should mark notification as read and return true', async () => {
    const user = await createUser(prisma);
    const actor = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: user.id });

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'LIKE_ON_POST',
        title: 'Unread notification',
        message: 'Unread',
        actorId: actor.id,
        postId: post.id,
        read: false,
      },
    });

    const useCase = new MarkAsReadUseCase(notificationRepo);
    const result = await useCase.execute(user.id, notification.id);

    expect(result).toBe(true);

    // Verificar en DB que se marcó como leída
    const updated = await prisma.notification.findUnique({
      where: { id: notification.id },
    });
    expect(updated?.read).toBe(true);
  });

  it('should return false for notification not belonging to user', async () => {
    const owner = await createUser(prisma, {
      email: 'owner@test.com',
      username: 'owner',
    });
    const otherUser = await createUser(prisma, {
      email: 'other@test.com',
      username: 'other',
    });
    const actor = await createUser(prisma, {
      email: 'actor@test.com',
      username: 'actor',
    });
    const { post } = await createPost(prisma, { authorId: owner.id });

    const notification = await prisma.notification.create({
      data: {
        userId: owner.id,
        type: 'LIKE_ON_POST',
        title: 'Not yours',
        message: 'This notification belongs to owner',
        actorId: actor.id,
        postId: post.id,
        read: false,
      },
    });

    const useCase = new MarkAsReadUseCase(notificationRepo);
    const result = await useCase.execute(otherUser.id, notification.id);

    expect(result).toBe(false);

    // Verificar que no se marcó como leída
    const unchanged = await prisma.notification.findUnique({
      where: { id: notification.id },
    });
    expect(unchanged?.read).toBe(false);
  });

  it('should return false for non-existent notification', async () => {
    const user = await createUser(prisma);
    const useCase = new MarkAsReadUseCase(notificationRepo);

    const result = await useCase.execute(user.id, 'non-existent-id');
    expect(result).toBe(false);
  });
});

describe('MarkAllAsReadUseCase Integration', () => {
  it('should mark all unread notifications as read and return count', async () => {
    const user = await createUser(prisma);
    const actor = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: user.id });

    // Crear 3 notificaciones no leídas
    for (let i = 0; i < 3; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'LIKE_ON_POST',
          title: 'Unread',
          message: `Unread ${i + 1}`,
          actorId: actor.id,
          postId: post.id,
          read: false,
        },
      });
    }

    const useCase = new MarkAllAsReadUseCase(notificationRepo);
    const count = await useCase.execute(user.id);

    expect(count).toBe(3);

    // Verificar que ya no hay no leídas
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });
    expect(unreadCount).toBe(0);
  });

  it('should return 0 when no unread notifications', async () => {
    const user = await createUser(prisma);

    const useCase = new MarkAllAsReadUseCase(notificationRepo);
    const count = await useCase.execute(user.id);

    expect(count).toBe(0);
  });

  it('should only affect the specified user', async () => {
    const userA = await createUser(prisma, {
      email: 'userA@test.com',
      username: 'userA',
    });
    const userB = await createUser(prisma, {
      email: 'userB@test.com',
      username: 'userB',
    });
    const actor = await createUser(prisma, {
      email: 'actor@test.com',
      username: 'actor',
    });
    const { post } = await createPost(prisma, { authorId: userA.id });

    // Notificaciones para ambos usuarios
    for (const user of [userA, userB]) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'LIKE_ON_POST',
          title: 'Unread',
          message: 'Unread',
          actorId: actor.id,
          postId: post.id,
          read: false,
        },
      });
    }

    const useCase = new MarkAllAsReadUseCase(notificationRepo);

    // Marcar solo las de userA
    const count = await useCase.execute(userA.id);
    expect(count).toBe(1);

    // userB debería seguir teniendo su no leída
    const userBUnread = await prisma.notification.count({
      where: { userId: userB.id, read: false },
    });
    expect(userBUnread).toBe(1);
  });
});

describe('GetUnreadCountUseCase Integration', () => {
  it('should return count of unread notifications', async () => {
    const user = await createUser(prisma);
    const actor = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: user.id });

    // 2 no leídas + 1 leída
    for (let i = 0; i < 2; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'LIKE_ON_POST',
          title: 'Unread',
          message: `Unread ${i + 1}`,
          actorId: actor.id,
          postId: post.id,
          read: false,
        },
      });
    }
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'LIKE_ON_POST',
        title: 'Read',
        message: 'Already read',
        actorId: actor.id,
        postId: post.id,
        read: true,
      },
    });

    const useCase = new GetUnreadCountUseCase(notificationRepo);
    const count = await useCase.execute(user.id);

    expect(count).toBe(2);
  });

  it('should return 0 when all notifications are read', async () => {
    const user = await createUser(prisma);
    const actor = await createUser(prisma);
    const { post } = await createPost(prisma, { authorId: user.id });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'LIKE_ON_POST',
        title: 'Read',
        message: 'Read notification',
        actorId: actor.id,
        postId: post.id,
        read: true,
      },
    });

    const useCase = new GetUnreadCountUseCase(notificationRepo);
    const count = await useCase.execute(user.id);

    expect(count).toBe(0);
  });

  it('should return 0 when user has no notifications', async () => {
    const user = await createUser(prisma);
    const useCase = new GetUnreadCountUseCase(notificationRepo);

    const count = await useCase.execute(user.id);
    expect(count).toBe(0);
  });
});
