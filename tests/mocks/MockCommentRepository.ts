import type { CommentRepository } from "../../src/domain/repositories/CommentRepository.js";
import type { Comment } from "../../src/domain/entities/Comment.js";

export class MockCommentRepository implements CommentRepository {
  private comments: Map<string, Comment> = new Map();

  seed(comments: Comment[]): void {
    for (const comment of comments) {
      this.comments.set(comment.id, comment);
    }
  }

  clear(): void {
    this.comments.clear();
  }

  async create(data: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string | null;
  }): Promise<Comment> {
    const comment: Comment = {
      id: crypto.randomUUID(),
      content: data.content,
      authorId: data.authorId,
      postId: data.postId,
      parentId: data.parentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  async update(id: string, content: string): Promise<Comment | null> {
    const existing = this.comments.get(id);
    if (!existing) return null;

    const updated: Comment = { ...existing, content, updatedAt: new Date() };
    this.comments.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  async findById(id: string): Promise<Comment | null> {
    return this.comments.get(id) ?? null;
  }

  async findByPostId(
    postId: string,
    page: number,
    limit: number
  ): Promise<{ comments: Comment[]; total: number }> {
    const rootComments = Array.from(this.comments.values())
      .filter((c) => c.postId === postId && c.parentId === null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = rootComments.length;
    const start = (page - 1) * limit;
    const paginated = rootComments.slice(start, start + limit);

    return { comments: paginated, total };
  }

  async findRepliesByParentId(
    parentId: string,
    page: number,
    limit: number
  ): Promise<{ comments: Comment[]; total: number }> {
    const replies = Array.from(this.comments.values())
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const total = replies.length;
    const start = (page - 1) * limit;
    const paginated = replies.slice(start, start + limit);

    return { comments: paginated, total };
  }

  async countByPostId(postId: string): Promise<number> {
    return Array.from(this.comments.values()).filter(
      (c) => c.postId === postId
    ).length;
  }

  async isAuthor(commentId: string, userId: string): Promise<boolean> {
    const comment = this.comments.get(commentId);
    return comment?.authorId === userId;
  }
}
