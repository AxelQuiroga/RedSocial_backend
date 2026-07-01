import { PrismaClient } from "@prisma/client";
import type { PostImage } from "@domain/entities/PostImage.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";

export class PrismaPostImageRepository implements PostImageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Omit<PostImage, "id" | "createdAt">): Promise<PostImage> {
    return this.prisma.postImage.create({ data });
  }

  async findByPostId(postId: string): Promise<PostImage[]> {
    return this.prisma.postImage.findMany({
      where: { postId, deletedAt: null },
      orderBy: { order: "asc" },
    });
  }

  async findById(id: string): Promise<PostImage | null> {
    return this.prisma.postImage.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<PostImage>): Promise<PostImage> {
    return this.prisma.postImage.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.postImage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.postImage.delete({ where: { id } });
  }

  async reorder(postId: string, imageOrders: { id: string; order: number }[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const { id, order } of imageOrders) {
        const result = await tx.postImage.updateMany({
          where: { id, postId, deletedAt: null },
          data: { order },
        });

        if (result.count !== 1) {
          throw new Error(`Imagen ${id} no pertenece al post ${postId}`);
        }
      }
    });
  }
}
