import { describe, it, expect, beforeEach } from 'vitest';
import { UnlikePostUseCase } from '../../../src/application/use-cases/like/UnlikePostUseCase.js';
import { MockLikeRepository } from '../../mocks/MockLikeRepository.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { InMemoryEventBus } from '../../mocks/InMemoryEventBus.js';

describe('UnlikePostUseCase', () => {
  let likeRepo: MockLikeRepository;
  let postRepo: MockPostRepository;
  let eventBus: InMemoryEventBus;
  let useCase: UnlikePostUseCase;
  let postId: string;
  let authorId: string;

  beforeEach(() => {
    likeRepo = new MockLikeRepository();
    postRepo = new MockPostRepository();
    eventBus = new InMemoryEventBus();

    authorId = crypto.randomUUID();
    postId = crypto.randomUUID();

    postRepo.seed(
      [
        {
          id: postId,
          title: 'Test Post',
          content: 'Content that is long enough for testing purposes',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Map([[authorId, { id: authorId, username: 'author' }]])
    );

    useCase = new UnlikePostUseCase(likeRepo, postRepo, eventBus);
  });

  it('should remove a like successfully and emit event', async () => {
    const likerId = crypto.randomUUID();
    await likeRepo.create(likerId, postId);

    const result = await useCase.execute(likerId, { postId });

    expect(result).toBe(true);
    expect(eventBus.emittedEvents).toHaveLength(1);
    expect(eventBus.emittedEvents[0].event).toBe('like.removed');
  });

  it('should return false when like does not exist (idempotent)', async () => {
    const result = await useCase.execute(crypto.randomUUID(), { postId });

    expect(result).toBe(false);
    expect(eventBus.emittedEvents).toHaveLength(0);
  });

  it('should throw when post does not exist', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        postId: 'non-existent-id',
      })
    ).rejects.toThrow('Post no encontrado');
  });

  it('should not emit event when like does not exist', async () => {
    await useCase.execute(crypto.randomUUID(), { postId });
    expect(eventBus.emittedEvents).toHaveLength(0);
  });
});
