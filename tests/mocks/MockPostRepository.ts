import type { PostRepository } from "../../src/domain/repositories/PostRepository.js";
import type { Post } from "../../src/domain/entities/Post.js";
import type { PostWithAuthor } from "../../src/domain/entities/PostWithAuthor.js";

export class MockPostRepository implements PostRepository {
  private posts: Map<string, Post> = new Map();
  private authors: Map<string, { id: string; username: string }> = new Map();

  seed(posts: Post[], authorMap?: Map<string, { id: string; username: string }>): void {
    for (const post of posts) {
      this.posts.set(post.id, post);
    }
    if (authorMap) {
      for (const [key, val] of authorMap) {
        this.authors.set(key, val);
      }
    }
  }

  clear(): void {
    this.posts.clear();
    this.authors.clear();
  }

  async create(data: {
    title: string;
    content: string;
    authorId: string;
  }): Promise<Post> {
    const post: Post = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(post.id, post);
    return post;
  }

  async findAll(page: number, limit: number): Promise<{ posts: PostWithAuthor[]; total: number }> {
    const all = Array.from(this.posts.values());
    const total = all.length;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return {
      posts: paginated.map((p) => ({
        ...p,
        author: this.authors.get(p.authorId) ?? { id: p.authorId, username: "unknown" },
      })),
      total,
    };
  }

  async findByAuthorId(authorId: string): Promise<PostWithAuthor[]> {
    return Array.from(this.posts.values())
      .filter((p) => p.authorId === authorId)
      .map((p) => ({
        ...p,
        author: this.authors.get(p.authorId) ?? { id: p.authorId, username: "unknown" },
      }));
  }

  async findByAuthorIdPaginated(
    authorId: string,
    page: number,
    limit: number
  ): Promise<{ posts: PostWithAuthor[]; total: number }> {
    const authorPosts = Array.from(this.posts.values()).filter(
      (p) => p.authorId === authorId
    );
    const total = authorPosts.length;
    const start = (page - 1) * limit;
    const paginated = authorPosts.slice(start, start + limit);

    return {
      posts: paginated.map((p) => ({
        ...p,
        author: this.authors.get(p.authorId) ?? { id: p.authorId, username: "unknown" },
      })),
      total,
    };
  }

  async findById(id: string): Promise<Post | null> {
    return this.posts.get(id) ?? null;
  }

  async deleteById(id: string): Promise<void> {
    this.posts.delete(id);
  }

  async update(id: string, data: { title?: string; content?: string }): Promise<Post | null> {
    const existing = this.posts.get(id);
    if (!existing) return null;

    const updated: Post = { ...existing, ...data, updatedAt: new Date() };
    this.posts.set(id, updated);
    return updated;
  }
}
