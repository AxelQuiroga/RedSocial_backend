import { describe, it, expect, beforeEach } from 'vitest';
import { GetMyPostsUseCase } from '../../../src/application/use-cases/post/GetMyPostsUseCase.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { MockLikeRepository } from '../../mocks/MockLikeRepository.js';

describe('GetMyPostsUseCase', () => {
  let postRepo: MockPostRepository;
  let likeRepo: MockLikeRepository;
  let useCase: GetMyPostsUseCase;
  let authorId: string;

  beforeEach(() => {
    postRepo = new MockPostRepository();
    likeRepo = new MockLikeRepository();
    useCase = new GetMyPostsUseCase(postRepo, likeRepo);

    authorId = crypto.randomUUID();
    const authorMap = new Map([
      [authorId, { id: authorId, username: 'author' }],
    ]);

    postRepo.seed(
      [
        {
          id: crypto.randomUUID(),
          title: 'My Post 1',
          content: 'Content for my post that is long enough.',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          title: 'My Post 2',
          content: 'Content for my post that is long enough.',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      authorMap
    );
  });

  it('should return posts for the authenticated user', async () => {
    const result = await useCase.execute(authorId);

    expect(result).toHaveLength(2);
    expect(result[0].author.username).toBe('author');
  });

  it('should throw when userId is not provided', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'Usuario no autenticado'
    );
  });

  it('should return empty array when user has no posts', async () => {
    const result = await useCase.execute(crypto.randomUUID());
    expect(result).toHaveLength(0);
  });

  it('should include likes count', async () => {
    const result = await useCase.execute(authorId);

    for (const post of result) {
      expect(post.likesCount).toBeDefined();
      expect(typeof post.likesCount).toBe('number');
    }
  });
});
