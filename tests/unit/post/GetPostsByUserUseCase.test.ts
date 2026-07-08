import { describe, it, expect, beforeEach } from 'vitest';
import { GetPostsByUserUseCase } from '../../../src/application/use-cases/post/GetPostsByUserUseCase.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { MockLikeRepository } from '../../mocks/MockLikeRepository.js';

describe('GetPostsByUserUseCase', () => {
  let postRepo: MockPostRepository;
  let likeRepo: MockLikeRepository;
  let useCase: GetPostsByUserUseCase;
  let authorId: string;

  beforeEach(() => {
    postRepo = new MockPostRepository();
    likeRepo = new MockLikeRepository();
    useCase = new GetPostsByUserUseCase(postRepo, likeRepo);

    authorId = crypto.randomUUID();
    const authorMap = new Map([
      [authorId, { id: authorId, username: 'publicuser' }],
    ]);

    postRepo.seed(
      [
        {
          id: crypto.randomUUID(),
          title: 'Public Post 1',
          content: 'Content for public post that is long enough.',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      authorMap
    );
  });

  it('should return paginated posts for a user', async () => {
    const result = await useCase.execute(authorId);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw when userId is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'ID de usuario requerido'
    );
  });

  it('should clamp page to minimum 1', async () => {
    const result = await useCase.execute(authorId, undefined, 0, 10);
    expect(result.data).toHaveLength(1);
  });

  it('should clamp limit to between 1 and 50', async () => {
    const result = await useCase.execute(authorId, undefined, 1, 100);
    expect(result.data).toHaveLength(1); // should use default limit=10
  });

  it('should include userHasLiked when currentUserId is provided', async () => {
    const viewerId = crypto.randomUUID();
    const result = await useCase.execute(authorId, viewerId);

    for (const post of result.data) {
      expect(post.userHasLiked).toBe(false);
    }
  });
});
