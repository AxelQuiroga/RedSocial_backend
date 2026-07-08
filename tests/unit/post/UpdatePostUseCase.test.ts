import { describe, it, expect, beforeEach } from 'vitest';
import { UpdatePostUseCase } from '../../../src/application/use-cases/post/UpdatePostUseCase.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';

describe('UpdatePostUseCase', () => {
  let postRepo: MockPostRepository;
  let useCase: UpdatePostUseCase;
  let postId: string;
  let authorId: string;

  beforeEach(() => {
    postRepo = new MockPostRepository();
    authorId = crypto.randomUUID();
    postId = crypto.randomUUID();

    postRepo.seed([
      {
        id: postId,
        title: 'Original Title',
        content: 'Original content that is long enough for the post.',
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    useCase = new UpdatePostUseCase(postRepo);
  });

  it('should update post title successfully', async () => {
    const result = await useCase.execute(postId, authorId, {
      title: 'Updated Title',
    });

    expect(result.title).toBe('Updated Title');
    expect(result.content).toBe(
      'Original content that is long enough for the post.'
    );
  });

  it('should update post content successfully', async () => {
    const result = await useCase.execute(postId, authorId, {
      content: 'Updated content that is even longer than before.',
    });

    expect(result.content).toBe('Updated content that is even longer than before.');
  });

  it('should throw when post does not exist', async () => {
    await expect(
      useCase.execute('non-existent-id', authorId, { title: 'New Title' })
    ).rejects.toThrow('Post no encontrado');
  });

  it('should throw when user is not the author', async () => {
    const otherUserId = crypto.randomUUID();
    await expect(
      useCase.execute(postId, otherUserId, { title: 'New Title' })
    ).rejects.toThrow('No autorizado para editar este post');
  });

  it('should throw when no fields provided to update', async () => {
    await expect(
      useCase.execute(postId, authorId, {})
    ).rejects.toThrow(
      'Debe proporcionar al menos título o contenido para actualizar'
    );
  });
});
