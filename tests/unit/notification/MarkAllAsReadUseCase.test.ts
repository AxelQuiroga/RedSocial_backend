import { describe, it, expect, beforeEach } from 'vitest';
import { MarkAllAsReadUseCase } from '../../../src/application/use-cases/notification/MarkAllAsReadUseCase.js';
import { MockNotificationRepository } from '../../mocks/MockNotificationRepository.js';

describe('MarkAllAsReadUseCase', () => {
  let notifRepo: MockNotificationRepository;
  let useCase: MarkAllAsReadUseCase;
  let userId: string;

  beforeEach(() => {
    notifRepo = new MockNotificationRepository();
    useCase = new MarkAllAsReadUseCase(notifRepo);

    userId = crypto.randomUUID();

    notifRepo.seed([
      {
        id: crypto.randomUUID(),
        userId,
        type: 'LIKE_ON_POST',
        title: 'Like 1',
        message: 'Like message 1',
        read: false,
        actorId: crypto.randomUUID(),
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        userId,
        type: 'LIKE_ON_POST',
        title: 'Like 2',
        message: 'Like message 2',
        read: false,
        actorId: crypto.randomUUID(),
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        userId,
        type: 'COMMENT_ON_POST',
        title: 'Comment',
        message: 'Comment message',
        read: true, // Already read
        actorId: crypto.randomUUID(),
        createdAt: new Date(),
      },
    ]);
  });

  it('should mark all unread notifications as read', async () => {
    const count = await useCase.execute(userId);
    expect(count).toBe(2);

    const unread = await notifRepo.countUnread(userId);
    expect(unread).toBe(0);
  });

  it('should return 0 when no unread notifications', async () => {
    await notifRepo.markAllAsRead(userId);
    const count = await useCase.execute(userId);
    expect(count).toBe(0);
  });

  it('should only affect the specified user', async () => {
    const otherUser = crypto.randomUUID();
    notifRepo.seed([
      {
        id: crypto.randomUUID(),
        userId: otherUser,
        type: 'LIKE_ON_POST',
        title: 'Other like',
        message: 'Other like message',
        read: false,
        actorId: crypto.randomUUID(),
        createdAt: new Date(),
      },
    ]);

    await useCase.execute(userId);

    const otherUnread = await notifRepo.countUnread(otherUser);
    expect(otherUnread).toBe(1);
  });
});
