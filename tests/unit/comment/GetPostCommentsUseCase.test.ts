import { describe, it, expect, beforeEach } from 'vitest';
import { GetPostCommentsUseCase } from '../../../src/application/use-cases/comment/GetPostCommentsUseCase.js';
import { MockCommentRepository } from '../../mocks/MockCommentRepository.js';

describe('GetPostCommentsUseCase', () => {
  let commentRepo: MockCommentRepository;
  let useCase: GetPostCommentsUseCase;
  let postId: string;

  beforeEach(async () => {
    commentRepo = new MockCommentRepository();
    useCase = new GetPostCommentsUseCase(commentRepo);

    postId = crypto.randomUUID();
    const authorId = crypto.randomUUID();

    // Create root comments (most recent first since we sort DESC in mock)
    for (let i = 0; i < 3; i++) {
      await commentRepo.create({
        content: `Root comment ${i}`,
        authorId,
        postId,
        parentId: null,
      });
    }

    // Create a reply (should not appear in root comments)
    const root = (await commentRepo.findByPostId(postId, 1, 10)).comments[0];
    await commentRepo.create({
      content: 'A reply',
      authorId,
      postId,
      parentId: root.id,
    });
  });

  it('should return only root comments (no replies)', async () => {
    const result = await useCase.execute(postId, 1, 10);

    expect(result.comments).toHaveLength(3);
    for (const comment of result.comments) {
      expect(comment.parentId).toBeNull();
    }
  });

  it('should return paginated results', async () => {
    const result = await useCase.execute(postId, 1, 2);

    expect(result.comments).toHaveLength(2);
    expect(result.meta.total).toBe(3);
    expect(result.meta.totalPages).toBe(2);
  });
});
