import type { PostImage } from "../entities/PostImage.js";

export interface PostImageRepository {
  create(data: Omit<PostImage, "id" | "createdAt">): Promise<PostImage>;
  findByPostId(postId: string): Promise<PostImage[]>;
  findById(id: string): Promise<PostImage | null>;
  update(id: string, data: Partial<PostImage>): Promise<PostImage>;
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  reorder(postId: string, imageOrders: { id: string; order: number }[]): Promise<void>;
}