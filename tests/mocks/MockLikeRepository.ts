import type { LikeRepository } from "../../src/domain/repositories/LikeRepository.js";
import type { Like } from "../../src/domain/entities/Like.js";

export class MockLikeRepository implements LikeRepository {
  private likes: Like[] = [];

  seed(likes: Like[]): void {
    this.likes.push(...likes);
  }

  clear(): void {
    this.likes = [];
  }

  async create(userId: string, postId: string): Promise<Like | null> {
    const exists = this.likes.some(
      (l) => l.userId === userId && l.postId === postId
    );
    if (exists) return null;

    const like: Like = {
      id: crypto.randomUUID(),
      userId,
      postId,
      createdAt: new Date(),
    };
    this.likes.push(like);
    return like;
  }

  async delete(userId: string, postId: string): Promise<boolean> {
    const index = this.likes.findIndex(
      (l) => l.userId === userId && l.postId === postId
    );
    if (index === -1) return false;
    this.likes.splice(index, 1);
    return true;
  }

  async countByPostId(postId: string): Promise<number> {
    return this.likes.filter((l) => l.postId === postId).length;
  }

  async countByPostIdsBatch(postIds: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    for (const postId of postIds) {
      result.set(postId, await this.countByPostId(postId));
    }
    return result;
  }

  async exists(userId: string, postId: string): Promise<boolean> {
    return this.likes.some((l) => l.userId === userId && l.postId === postId);
  }

  async existsBatch(userId: string, postIds: string[]): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();
    for (const postId of postIds) {
      result.set(postId, await this.exists(userId, postId));
    }
    return result;
  }

  async findByPostId(postId: string): Promise<Like[]> {
    return this.likes.filter((l) => l.postId === postId);
  }
}
