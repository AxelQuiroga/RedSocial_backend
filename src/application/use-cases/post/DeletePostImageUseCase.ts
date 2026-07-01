import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import type { PostRepository } from "@domain/repositories/PostRepository.js";
import { eventBus } from "@config/eventBus.js";

export class DeletePostImageUseCase {
  constructor(
    private imageRepo: PostImageRepository,
    private postRepo: PostRepository
  ) {}

  async execute(imageId: string, userId: string): Promise<void> {
    const image = await this.imageRepo.findById(imageId);
    if (!image) throw new Error("Imagen no encontrada");
    if (image.deletedAt) throw new Error("Ya eliminada");

    const post = await this.postRepo.findById(image.postId);
    if (!post) throw new Error("Post no encontrado");
    if (post.authorId !== userId) throw new Error("No autorizado");

    await this.imageRepo.softDelete(imageId);
    eventBus.emit("image.hard_delete", { imageId, key: image.key });
  }
}
