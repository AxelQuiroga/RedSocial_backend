import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateCommentUseCase } from '../../../src/application/use-cases/comment/UpdateCommentUseCase.js';
import { MockCommentRepository } from '../../mocks/MockCommentRepository.js';

describe('UpdateCommentUseCase', () => {
  let commentRepo: MockCommentRepository;
  let useCase: UpdateCommentUseCase;
  let commentId: string;
  let authorId: string;

  beforeEach(async () => {
    commentRepo = new MockCommentRepository();
    authorId = crypto.randomUUID();
    const postId = crypto.randomUUID();

    const comment = await commentRepo.create({
      content: 'Original content',
      authorId,
      postId,
      parentId: null,
    });
    commentId = comment.id;

    useCase = new UpdateCommentUseCase(commentRepo);
  });

  it('should update comment successfully', async () => {
    const result = await useCase.execute(authorId, commentId, {
      content: 'Updated content',
    });

    expect(result.content).toBe('Updated content');
    expect(result.id).toBe(commentId);
  });

  it('should throw when comment does not exist', async () => {
    await expect(
      useCase.execute(authorId, 'non-existent-id', {
        content: 'Updated',
      })
    ).rejects.toThrow('Comentario no encontrado');
  });

  it('should throw when user is not the author', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), commentId, {
        content: 'Updated',
      })
    ).rejects.toThrow('No autorizado para editar este comentario');
  });

  it('should throw when content is empty', async () => {
    await expect(
      useCase.execute(authorId, commentId, { content: '' })
    ).rejects.toThrow('El contenido es requerido');
  });

  it('should throw when content is only whitespace', async () => {
    await expect(
      useCase.execute(authorId, commentId, { content: '   ' })
    ).rejects.toThrow('El contenido es requerido');
  });
});
