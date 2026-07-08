import { describe, it, expect, beforeEach } from 'vitest';
import { DeletePostUseCase } from '../../../src/application/use-cases/post/DeletePostUseCase.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { InMemoryEventBus } from '../../mocks/InMemoryEventBus.js';

describe('DeletePostUseCase', () => {
  let postRepo: MockPostRepository;
  let eventBus: InMemoryEventBus;
  let useCase: DeletePostUseCase;
  let postId: string;
  let authorId: string;

  beforeEach(() => {
    postRepo = new MockPostRepository();
    eventBus = new InMemoryEventBus();

    authorId = crypto.randomUUID();
    postId = crypto.randomUUID();

    postRepo.seed([
      {
        id: postId,
        title: 'Post to delete',
        content: 'Content that is long enough for the test post.',
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    useCase = new DeletePostUseCase(postRepo, eventBus);
  });

  it('should delete post successfully and emit event', async () => {
    await useCase.execute(postId, authorId);

    const deleted = await postRepo.findById(postId);
    expect(deleted).toBeNull();

    expect(eventBus.emittedEvents).toHaveLength(1);
    expect(eventBus.emittedEvents[0].event).toBe('post.deleted');
  });

  it('should throw when post does not exist', async () => {
    await expect(
      useCase.execute('non-existent-id', authorId)
    ).rejects.toThrow('Post no encontrado');
  });

  it('should throw when user is not the author', async () => {
    const otherUserId = crypto.randomUUID();
    await expect(
      useCase.execute(postId, otherUserId)
    ).rejects.toThrow('No autorizado');
  });

  it('should not emit event when delete fails', async () => {
    await expect(
      useCase.execute('non-existent-id', authorId)
    ).rejects.toThrow();

    expect(eventBus.emittedEvents).toHaveLength(0);
  });
});
