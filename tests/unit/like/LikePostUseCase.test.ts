import { describe, it, expect, beforeEach } from 'vitest';
import { LikePostUseCase } from '../../../src/application/use-cases/like/LikePostUseCase.js';
import { MockLikeRepository } from '../../mocks/MockLikeRepository.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { InMemoryEventBus } from '../../mocks/InMemoryEventBus.js';

describe('LikePostUseCase', () => {
  let likeRepo: MockLikeRepository;
  let postRepo: MockPostRepository;
  let eventBus: InMemoryEventBus;
  let useCase: LikePostUseCase;
  let postId: string;
  let authorId: string;

  beforeEach(() => {
    likeRepo = new MockLikeRepository();
    postRepo = new MockPostRepository();
    eventBus = new InMemoryEventBus();

    authorId = crypto.randomUUID();
    postId = crypto.randomUUID();

    // Seed a post
    postRepo.seed(
      [
        {
          id: postId,
          title: 'Test Post',
          content: 'Content of the test post that is long enough',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Map([[authorId, { id: authorId, username: 'author' }]])
    );

    useCase = new LikePostUseCase(likeRepo, postRepo, eventBus);
  });

  it('should create a like successfully and emit event', async () => {
    const likerId = crypto.randomUUID();
    const result = await useCase.execute(likerId, { postId });

    expect(result.postId).toBe(postId);
    expect(result.userId).toBe(likerId);

    expect(eventBus.emittedEvents).toHaveLength(1);
    expect(eventBus.emittedEvents[0].event).toBe('like.created');
  });

  it('should throw when post does not exist', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        postId: 'non-existent-id',
      })
    ).rejects.toThrow('Post no encontrado');
  });

  it('should throw when user already liked the post', async () => {
    const likerId = crypto.randomUUID();
    await useCase.execute(likerId, { postId });

    await expect(
      useCase.execute(likerId, { postId })
    ).rejects.toThrow('Ya has dado like a este post');
  });

  it('should allow liking a post by its author (self-like)', async () => {
    const result = await useCase.execute(authorId, { postId });

    expect(result.userId).toBe(authorId);
    expect(result.postId).toBe(postId);
  });
});
