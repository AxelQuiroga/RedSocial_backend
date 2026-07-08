import { describe, it, expect, beforeEach } from 'vitest';
import { GetNotificationsUseCase } from '../../../src/application/use-cases/notification/GetNotificationsUseCase.js';
import { MockNotificationRepository } from '../../mocks/MockNotificationRepository.js';

describe('GetNotificationsUseCase', () => {
  let notifRepo: MockNotificationRepository;
  let useCase: GetNotificationsUseCase;
  let userId: string;

  beforeEach(() => {
    notifRepo = new MockNotificationRepository();
    useCase = new GetNotificationsUseCase(notifRepo);

    userId = crypto.randomUUID();

    notifRepo.seed([
      {
        id: crypto.randomUUID(),
        userId,
        type: 'LIKE_ON_POST',
        title: 'New like',
        message: 'Someone liked your post',
        read: false,
        actorId: crypto.randomUUID(),
        postId: crypto.randomUUID(),
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        userId,
        type: 'COMMENT_ON_POST',
        title: 'New comment',
        message: 'Someone commented on your post',
        read: false,
        actorId: crypto.randomUUID(),
        postId: crypto.randomUUID(),
        createdAt: new Date(),
      },
    ]);
  });

  it('should return paginated notifications', async () => {
    const result = await useCase.execute(userId, 1, 10);

    expect(result.notifications).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should return only notifications for the specified user', async () => {
    const otherUserId = crypto.randomUUID();
    const result = await useCase.execute(otherUserId, 1, 10);

    expect(result.notifications).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
