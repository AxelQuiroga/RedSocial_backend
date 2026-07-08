import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../../src/application/use-cases/user/RegisterUserUseCase.js';
import { MockUserRepository } from '../../mocks/MockUserRepository.js';
import type { User } from '../../../src/domain/entities/user.js';

describe('RegisterUserUseCase', () => {
  let userRepo: MockUserRepository;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    useCase = new RegisterUserUseCase(userRepo);
  });

  it('should register a new user successfully', async () => {
    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    });

    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
    expect(result.username).toBe('testuser');
    expect(result.role).toBe('USER');
    expect(result.id).toBeDefined();
  });

  it('should throw when email already exists', async () => {
    // Seed existing user
    const existingId = crypto.randomUUID();
    userRepo.seed([
      {
        id: existingId,
        email: 'existing@example.com',
        password: 'hashed',
        username: 'existinguser',
        role: 'USER',
        displayName: null,
        bio: null,
        avatarUrl: null,
        coverUrl: null,
        location: null,
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await expect(
      useCase.execute({
        email: 'existing@example.com',
        password: 'password123',
        username: 'newuser',
      })
    ).rejects.toThrow('El usuario ya existe');
  });

  it('should store hashed password (not plain text)', async () => {
    await useCase.execute({
      email: 'hashcheck@example.com',
      password: 'myPlainPassword',
      username: 'hashcheck',
    });

    const stored = await userRepo.findByEmail('hashcheck@example.com');
    expect(stored).toBeDefined();
    expect(stored!.password).not.toBe('myPlainPassword');
    expect(stored!.password).toContain('$2'); // bcrypt hash prefix
  });
});
