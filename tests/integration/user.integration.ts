import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../src/application/use-cases/user/RegisterUserUseCase';
import { LoginUserUseCase } from '../../src/application/use-cases/user/LoginUserUseCase';
import { UpdateUserProfileUseCase } from '../../src/application/use-cases/user/UpdateUserProfileUseCase';
import { PrismaUserRepository } from '../../src/infrastructure/repositories/PrismaUserRepository';
import { cleanupDb, prisma } from '../setup';
import { createUser } from '../factories';

let userRepo: PrismaUserRepository;

beforeEach(async () => {
  await cleanupDb();
  userRepo = new PrismaUserRepository(prisma);
});

describe('RegisterUserUseCase Integration', () => {
  it('should create a new user successfully', async () => {
    const useCase = new RegisterUserUseCase(userRepo);
    const result = await useCase.execute({
      email: 'newuser@test.com',
      password: 'password123',
      username: 'newuser',
    });

    expect(result.email).toBe('newuser@test.com');
    expect(result.username).toBe('newuser');
    expect(result.role).toBe('USER');
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw when email already exists', async () => {
    await createUser(prisma, { email: 'existing@test.com' });
    const useCase = new RegisterUserUseCase(userRepo);

    await expect(
      useCase.execute({
        email: 'existing@test.com',
        password: 'password123',
        username: 'another',
      })
    ).rejects.toThrow('El usuario ya existe');
  });
});

describe('LoginUserUseCase Integration', () => {
  it('should return token with valid credentials', async () => {
    await createUser(prisma, {
      email: 'login@test.com',
      password: 'password123',
      username: 'loginuser',
    });

    const useCase = new LoginUserUseCase(userRepo);
    const result = await useCase.execute({
      email: 'login@test.com',
      password: 'password123',
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    // JWT tiene 3 partes separadas por puntos
    expect(result.token.split('.')).toHaveLength(3);
  });

  it('should throw on invalid email format', async () => {
    const useCase = new LoginUserUseCase(userRepo);

    await expect(
      useCase.execute({
        email: 'notanemail',
        password: 'password123',
      })
    ).rejects.toThrow('Email inválido');
  });

  it('should throw on wrong password', async () => {
    await createUser(prisma, {
      email: 'wrongpw@test.com',
      password: 'password123',
      username: 'wrongpw',
    });

    const useCase = new LoginUserUseCase(userRepo);

    await expect(
      useCase.execute({
        email: 'wrongpw@test.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('should throw on non-existent email', async () => {
    const useCase = new LoginUserUseCase(userRepo);

    await expect(
      useCase.execute({
        email: 'nobody@test.com',
        password: 'password123',
      })
    ).rejects.toThrow('Credenciales inválidas');
  });
});

describe('UpdateUserProfileUseCase Integration', () => {
  it('should update displayName and bio', async () => {
    const user = await createUser(prisma);
    const useCase = new UpdateUserProfileUseCase(userRepo);

    const result = await useCase.execute(user.id, {
      displayName: 'New Display Name',
      bio: 'My updated bio',
    });

    expect(result.displayName).toBe('New Display Name');
    expect(result.bio).toBe('My updated bio');
  });

  it('should throw on empty data', async () => {
    const user = await createUser(prisma);
    const useCase = new UpdateUserProfileUseCase(userRepo);

    await expect(useCase.execute(user.id, {})).rejects.toThrow(
      'No hay datos para actualizar'
    );
  });

  it('should throw when email already in use', async () => {
    // Crear dos usuarios
    const userA = await createUser(prisma, {
      email: 'userA@test.com',
      username: 'userA',
    });
    await createUser(prisma, {
      email: 'userB@test.com',
      username: 'userB',
    });

    const useCase = new UpdateUserProfileUseCase(userRepo);

    await expect(
      useCase.execute(userA.id, { email: 'userB@test.com' })
    ).rejects.toThrow('El email ya está en uso');
  });

  it('should throw when username already in use', async () => {
    const userA = await createUser(prisma, {
      email: 'userC@test.com',
      username: 'userC',
    });
    await createUser(prisma, {
      email: 'userD@test.com',
      username: 'userD',
    });

    const useCase = new UpdateUserProfileUseCase(userRepo);

    await expect(
      useCase.execute(userA.id, { username: 'userD' })
    ).rejects.toThrow('El username ya está en uso');
  });
});
