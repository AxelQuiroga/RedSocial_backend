import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteCommentUseCase } from '../../../src/application/use-cases/comment/DeleteCommentUseCase.js';
import { MockCommentRepository } from '../../mocks/MockCommentRepository.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';

describe('DeleteCommentUseCase', () => {
  let commentRepo: MockCommentRepository;
  let postRepo: MockPostRepository;
  let useCase: DeleteCommentUseCase;
  let postId: string;
  let authorId: string;

  beforeEach(() => {
    commentRepo = new MockCommentRepository();
    postRepo = new MockPostRepository();

    authorId = crypto.randomUUID();
    postId = crypto.randomUUID();

    postRepo.seed(
      [
        {
          id: postId,
          title: 'Test Post',
          content: 'Content that is long enough for testing',
          authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Map([[authorId, { id: authorId, username: 'author' }]])
    );

    useCase = new DeleteCommentUseCase(commentRepo, postRepo);
  });

  it('should delete a comment (author of comment)', async () => {
    const comment = await commentRepo.create({
      content: 'Comment to delete',
      authorId,
      postId,
      parentId: null,
    });

    const result = await useCase.execute(authorId, comment.id);
    expect(result).toBe(true);

    const deleted = await commentRepo.findById(comment.id);
    expect(deleted).toBeNull();
  });

  it('should delete a comment (author of post)', async () => {
    const otherUser = crypto.randomUUID();
    const comment = await commentRepo.create({
      content: 'Comment by other user',
      authorId: otherUser,
      postId,
      parentId: null,
    });

    const result = await useCase.execute(authorId, comment.id);
    expect(result).toBe(true);
  });

  it('should return false when comment does not exist (idempotent)', async () => {
    const result = await useCase.execute(authorId, 'non-existent-id');
    expect(result).toBe(false);
  });

  it('should throw when user is neither comment author nor post author', async () => {
    const comment = await commentRepo.create({
      content: 'Comment',
      authorId: crypto.randomUUID(),
      postId,
      parentId: null,
    });

    await expect(
      useCase.execute(crypto.randomUUID(), comment.id)
    ).rejects.toThrow('No autorizado para eliminar este comentario');
  });

  it('should delete replies when deleting a root comment (cascade)', async () => {
    const rootComment = await commentRepo.create({
      content: 'Root comment',
      authorId,
      postId,
      parentId: null,
    });

    const reply1 = await commentRepo.create({
      content: 'Reply 1',
      authorId: crypto.randomUUID(),
      postId,
      parentId: rootComment.id,
    });

    const reply2 = await commentRepo.create({
      content: 'Reply 2',
      authorId: crypto.randomUUID(),
      postId,
      parentId: rootComment.id,
    });

    await useCase.execute(authorId, rootComment.id);

    expect(await commentRepo.findById(rootComment.id)).toBeNull();
    expect(await commentRepo.findById(reply1.id)).toBeNull();
    expect(await commentRepo.findById(reply2.id)).toBeNull();
  });
});
