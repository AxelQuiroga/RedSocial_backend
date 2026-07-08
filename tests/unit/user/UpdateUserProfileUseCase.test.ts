import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { UpdateUserProfileUseCase } from '../../../src/application/use-cases/user/UpdateUserProfileUseCase.js';
import { MockUserRepository } from '../../mocks/MockUserRepository.js';

describe('UpdateUserProfileUseCase', () => {
  let userRepo: MockUserRepository;
  let useCase: UpdateUserProfileUseCase;
  let userId: string;

  beforeEach(async () => {
    userRepo = new MockUserRepository();
    const hashedPassword = await bcrypt.hash('password123', 4);

    const [user1, user2] = await Promise.all([
      userRepo.create({
        email: 'user1@example.com',
        password: hashedPassword,
        username: 'user1',
        role: 'USER',
      }),
      userRepo.create({
        email: 'user2@example.com',
        password: hashedPassword,
        username: 'user2',
        role: 'USER',
      }),
    ]);

    userId = user1.id;
    useCase = new UpdateUserProfileUseCase(userRepo);
  });

  it('should update display name and bio successfully', async () => {
    const result = await useCase.execute(userId, {
      displayName: 'New Name',
      bio: 'This is my bio',
    });

    expect(result.displayName).toBe('New Name');
    expect(result.bio).toBe('This is my bio');
    expect(result.username).toBe('user1');
  });

  it('should throw when no data provided', async () => {
    await expect(useCase.execute(userId, {})).rejects.toThrow(
      'No hay datos para actualizar'
    );
  });

  it('should throw when email is already taken by another user', async () => {
    await expect(
      useCase.execute(userId, { email: 'user2@example.com' })
    ).rejects.toThrow('El email ya está en uso');
  });

  it('should throw when username is already taken by another user', async () => {
    await expect(
      useCase.execute(userId, { username: 'user2' })
    ).rejects.toThrow('El username ya está en uso');
  });

  it('should allow updating email to the same email (no duplicate detection for self)', async () => {
    const result = await useCase.execute(userId, {
      email: 'user1@example.com',
    });
    expect(result.email).toBe('user1@example.com');
  });

  it('should allow updating username to the same username (no duplicate detection for self)', async () => {
    const result = await useCase.execute(userId, {
      username: 'user1',
    });
    expect(result.username).toBe('user1');
  });
});
