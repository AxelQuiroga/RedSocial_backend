import { describe, it, expect, beforeEach } from 'vitest';
import { GetUnreadCountUseCase } from '../../../src/application/use-cases/notification/GetUnreadCountUseCase.js';
import { MockNotificationRepository } from '../../mocks/MockNotificationRepository.js';

describe('GetUnreadCountUseCase', () => {
  let notifRepo: MockNotificationRepository;
  let useCase: GetUnreadCountUseCase;
  let userId: string;

  beforeEach(() => {
    notifRepo = new MockNotificationRepository();
    useCase = new GetUnreadCountUseCase(notifRepo);

    userId = crypto.randomUUID();

    notifRepo.seed([
      {
        id: crypto.randomUUID(),
        userId,
        type: 'LIKE_ON_POST',
        title: 'Like',
        message: 'Like message',
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
        read: true,
        actorId: crypto.randomUUID(),
        createdAt: new Date(),
      },
    ]);
  });

  it('should count only unread notifications', async () => {
    const count = await useCase.execute(userId);
    expect(count).toBe(1);
  });

  it('should return 0 when all notifications are read', async () => {
    await notifRepo.markAllAsRead(userId);
    const count = await useCase.execute(userId);
    expect(count).toBe(0);
  });
});
