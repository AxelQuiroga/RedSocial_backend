import { describe, it, expect, beforeEach } from 'vitest';
import { GetCommentRepliesUseCase } from '../../../src/application/use-cases/comment/GetCommentRepliesUseCase.js';
import { MockCommentRepository } from '../../mocks/MockCommentRepository.js';

describe('GetCommentRepliesUseCase', () => {
  let commentRepo: MockCommentRepository;
  let useCase: GetCommentRepliesUseCase;
  let parentId: string;

  beforeEach(async () => {
    commentRepo = new MockCommentRepository();
    useCase = new GetCommentRepliesUseCase(commentRepo);

    const postId = crypto.randomUUID();
    const authorId = crypto.randomUUID();

    const parent = await commentRepo.create({
      content: 'Parent comment',
      authorId,
      postId,
      parentId: null,
    });
    parentId = parent.id;

    for (let i = 0; i < 3; i++) {
      await commentRepo.create({
        content: `Reply ${i}`,
        authorId,
        postId,
        parentId,
      });
    }
  });

  it('should return replies for a parent comment', async () => {
    const result = await useCase.execute(parentId, 1, 10);

    expect(result.comments).toHaveLength(3);
    expect(result.meta.total).toBe(3);
  });

  it('should throw when parent comment does not exist', async () => {
    await expect(
      useCase.execute('non-existent-id', 1, 10)
    ).rejects.toThrow('Comentario padre no encontrado');
  });

  it('should return empty array when parent has no replies', async () => {
    const lonelyComment = await commentRepo.create({
      content: 'Lonely comment',
      authorId: crypto.randomUUID(),
      postId: crypto.randomUUID(),
      parentId: null,
    });

    const result = await useCase.execute(lonelyComment.id, 1, 10);

    expect(result.comments).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});
