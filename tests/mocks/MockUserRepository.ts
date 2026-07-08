import type { UserRepository } from "../../src/domain/repositories/UserRepository.js";
import type { User } from "../../src/domain/entities/user.js";

export class MockUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  seed(users: User[]): void {
    for (const user of users) {
      this.users.set(user.id, user);
    }
  }

  clear(): void {
    this.users.clear();
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async create(data: {
    email: string;
    password: string;
    username: string;
    role: "USER" | "ADMIN";
  }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      password: data.password,
      username: data.username,
      role: data.role,
      displayName: null,
      bio: null,
      avatarUrl: null,
      coverUrl: null,
      location: null,
      website: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async update(
    id: string,
    data: {
      email?: string;
      username?: string;
      displayName?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
      location?: string | null;
      website?: string | null;
    }
  ): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error("User not found");

    const updated: User = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }
}
