import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { LoginUserUseCase } from '../../../src/application/use-cases/user/LoginUserUseCase.js';
import { MockUserRepository } from '../../mocks/MockUserRepository.js';

describe('LoginUserUseCase', () => {
  let userRepo: MockUserRepository;
  let useCase: LoginUserUseCase;

  beforeEach(async () => {
    userRepo = new MockUserRepository();

    // Seed a valid user
    const hashedPassword = await bcrypt.hash('validPassword123', 4);
    userRepo.seed([
      {
        id: crypto.randomUUID(),
        email: 'valid@example.com',
        password: hashedPassword,
        username: 'validuser',
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

    useCase = new LoginUserUseCase(userRepo);
  });

  it('should login successfully with valid credentials', async () => {
    const result = await useCase.execute({
      email: 'valid@example.com',
      password: 'validPassword123',
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
  });

  it('should throw with invalid email format', async () => {
    await expect(
      useCase.execute({ email: 'invalid', password: 'password123' })
    ).rejects.toThrow('Email inválido');
  });

  it('should throw with short password', async () => {
    await expect(
      useCase.execute({ email: 'test@example.com', password: '12345' })
    ).rejects.toThrow('Password inválida');
  });

  it('should throw when user does not exist', async () => {
    await expect(
      useCase.execute({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('should throw with wrong password', async () => {
    await expect(
      useCase.execute({
        email: 'valid@example.com',
        password: 'wrongPassword',
      })
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('should not leak whether user exists (anti timing attack)', async () => {
    // Both should throw the same error message
    const nonExistentError = await useCase
      .execute({ email: 'ghost@example.com', password: 'anyPassword123' })
      .catch((e) => e.message);

    const wrongPasswordError = await useCase
      .execute({ email: 'valid@example.com', password: 'wrongPassword456' })
      .catch((e) => e.message);

    expect(nonExistentError).toBe('Credenciales inválidas');
    expect(wrongPasswordError).toBe('Credenciales inválidas');
  });

  it('should return a valid JWT token on success', async () => {
    const result = await useCase.execute({
      email: 'valid@example.com',
      password: 'validPassword123',
    });

    // JWT has 3 parts separated by dots
    const parts = result.token.split('.');
    expect(parts).toHaveLength(3);

    // Decode payload to check claims
    const payload = JSON.parse(atob(parts[1]));
    expect(payload.userId).toBeDefined();
    expect(payload.role).toBe('USER');
    expect(payload.exp).toBeDefined();
  });
});
