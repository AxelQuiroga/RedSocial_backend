import { describe, it, expect, beforeEach } from 'vitest';
import { GetPostLikesCountUseCase } from '../../../src/application/use-cases/like/GetPostLikesCountUseCase.js';
import { MockLikeRepository } from '../../mocks/MockLikeRepository.js';

describe('GetPostLikesCountUseCase', () => {
  let likeRepo: MockLikeRepository;
  let useCase: GetPostLikesCountUseCase;

  beforeEach(() => {
    likeRepo = new MockLikeRepository();
    useCase = new GetPostLikesCountUseCase(likeRepo);
  });

  it('should return count 0 when no likes', async () => {
    const result = await useCase.execute('post-123');

    expect(result.count).toBe(0);
    expect(result.userHasLiked).toBe(false);
  });

  it('should return correct like count', async () => {
    const postId = crypto.randomUUID();
    await likeRepo.create('user-1', postId);
    await likeRepo.create('user-2', postId);
    await likeRepo.create('user-3', postId);

    const result = await useCase.execute(postId);

    expect(result.count).toBe(3);
  });

  it('should return userHasLiked true when user liked the post', async () => {
    const postId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    await likeRepo.create(userId, postId);

    const result = await useCase.execute(postId, userId);

    expect(result.count).toBe(1);
    expect(result.userHasLiked).toBe(true);
  });

  it('should return userHasLiked false when userId not provided', async () => {
    const postId = crypto.randomUUID();
    await likeRepo.create('user-1', postId);

    const result = await useCase.execute(postId);

    expect(result.count).toBe(1);
    expect(result.userHasLiked).toBe(false);
  });
});
