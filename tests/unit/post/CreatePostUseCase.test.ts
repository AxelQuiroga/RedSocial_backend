import { describe, it, expect, beforeEach } from 'vitest';
import { CreatePostUseCase } from '../../../src/application/use-cases/post/CreatePostUseCase.js';
import { MockPostRepository } from '../../mocks/MockPostRepository.js';
import { InMemoryEventBus } from '../../mocks/InMemoryEventBus.js';

describe('CreatePostUseCase', () => {
  let postRepo: MockPostRepository;
  let eventBus: InMemoryEventBus;
  let useCase: CreatePostUseCase;

  beforeEach(() => {
    postRepo = new MockPostRepository();
    eventBus = new InMemoryEventBus();
    useCase = new CreatePostUseCase(postRepo, eventBus);
  });

  it('should create a post successfully', async () => {
    const userId = crypto.randomUUID();
    const result = await useCase.execute(userId, {
      title: 'My First Post',
      content: 'This is the content of my first post, it is long enough.',
    });

    expect(result.title).toBe('My First Post');
    expect(result.content).toBe(
      'This is the content of my first post, it is long enough.'
    );
    expect(result.authorId).toBe(userId);
  });

  it('should emit post.created event', async () => {
    const userId = crypto.randomUUID();
    await useCase.execute(userId, {
      title: 'My Post',
      content: 'Content that is long enough for the post right here.',
    });

    expect(eventBus.emittedEvents).toHaveLength(1);
    expect(eventBus.emittedEvents[0].event).toBe('post.created');
  });

  it('should throw when title is missing', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        title: '',
        content: 'Valid content that is long enough for the test.',
      })
    ).rejects.toThrow('Faltan campos obligatorios');
  });

  it('should throw when content is missing', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        title: 'Valid Title',
        content: '',
      })
    ).rejects.toThrow('Faltan campos obligatorios');
  });

  it('should throw when title is too short (< 3 chars)', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        title: 'AB',
        content: 'Valid content that is long enough for the test.',
      })
    ).rejects.toThrow('El título es muy corto');
  });

  it('should throw when content is too short (< 10 chars)', async () => {
    await expect(
      useCase.execute(crypto.randomUUID(), {
        title: 'Valid Title',
        content: 'Short',
      })
    ).rejects.toThrow('El contenido es muy corto');
  });
});
