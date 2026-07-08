import { describe, it, expect, beforeEach } from 'vitest';
import { GetPostsUseCase } from '../../../src/application/use-cases/post/GetPostsUseCase.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { MockLikeRepository } from '../../mocks/MockLikeRepository.js';

describe('GetPostsUseCase', () => {
  let postRepo: MockPostRepository;
  let likeRepo: MockLikeRepository;
  let useCase: GetPostsUseCase;
  let authorId: string;

  beforeEach(() => {
    postRepo = new MockPostRepository();
    likeRepo = new MockLikeRepository();
    useCase = new GetPostsUseCase(postRepo, likeRepo);

    authorId = crypto.randomUUID();
    const authorMap = new Map([
      [authorId, { id: authorId, username: 'testuser' }],
    ]);

    postRepo.seed(
      [
        {
          id: crypto.randomUUID(),
          title: 'Post 1',
          content: 'Content for post 1 that is long enough.',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          title: 'Post 2',
          content: 'Content for post 2 that is long enough.',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      authorMap
    );
  });

  it('should return paginated posts', async () => {
    const result = await useCase.execute(1, 10);

    expect(result.posts).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should return posts with author info', async () => {
    const result = await useCase.execute(1, 10);

    expect(result.posts[0].author).toBeDefined();
    expect(result.posts[0].author.username).toBe('testuser');
  });

  it('should include userHasLiked when userId is provided', async () => {
    const userId = crypto.randomUUID();
    const posts = await postRepo.findAll(1, 10);
    await likeRepo.create(userId, posts.posts[0].id);

    const result = await useCase.execute(1, 10, userId);

    expect(result.posts[0].userHasLiked).toBe(true);
    expect(result.posts[1].userHasLiked).toBe(false);
  });

  it('should return userHasLiked as false when no userId', async () => {
    const result = await useCase.execute(1, 10);

    for (const post of result.posts) {
      expect(post.userHasLiked).toBe(false);
    }
  });

  it('should return empty array when no posts exist', async () => {
    postRepo.clear();
    const result = await useCase.execute(1, 10);

    expect(result.posts).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
