import { describe, it, expect, beforeEach } from 'vitest';
import { MarkAsReadUseCase } from '../../../src/application/use-cases/notification/MarkAsReadUseCase.js';
import { MockNotificationRepository } from '../../mocks/MockNotificationRepository.js';

describe('MarkAsReadUseCase', () => {
  let notifRepo: MockNotificationRepository;
  let useCase: MarkAsReadUseCase;
  let userId: string;
  let notifId: string;

  beforeEach(() => {
    notifRepo = new MockNotificationRepository();
    useCase = new MarkAsReadUseCase(notifRepo);

    userId = crypto.randomUUID();
    notifId = crypto.randomUUID();

    notifRepo.seed([
      {
        id: notifId,
        userId,
        type: 'LIKE_ON_POST',
        title: 'New like',
        message: 'Someone liked your post',
        read: false,
        actorId: crypto.randomUUID(),
        createdAt: new Date(),
      },
    ]);
  });

  it('should mark a notification as read', async () => {
    const success = await useCase.execute(userId, notifId);
    expect(success).toBe(true);

    const notifs = await notifRepo.findByUserId(userId, 1, 10);
    expect(notifs.notifications[0].read).toBe(true);
  });

  it('should return false when notification belongs to another user', async () => {
    const otherUserId = crypto.randomUUID();
    const success = await useCase.execute(otherUserId, notifId);
    expect(success).toBe(false);
  });

  it('should return false when notification does not exist', async () => {
    const success = await useCase.execute(userId, 'non-existent-id');
    expect(success).toBe(false);
  });
});
