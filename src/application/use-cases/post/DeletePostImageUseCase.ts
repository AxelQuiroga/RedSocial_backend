import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import type { PostRepository } from "@domain/repositories/PostRepository.js";
import { ConflictError } from "@domain/errors/ConflictError.js";
import { ForbiddenError } from "@domain/errors/ForbiddenError.js";
import { NotFoundError } from "@domain/errors/NotFoundError.js";
import { eventBus } from "@config/eventBus.js";

export class DeletePostImageUseCase {
  constructor(
    private imageRepo: PostImageRepository,
    private postRepo: PostRepository
  ) {}

  async execute(imageId: string, userId: string): Promise<void> {
    const image = await this.imageRepo.findById(imageId);
    if (!image) throw new NotFoundError("Imagen no encontrada", "IMAGE_NOT_FOUND");
    if (image.deletedAt) throw new ConflictError("La imagen ya fue eliminada", "ALREADY_DELETED");

    const post = await this.postRepo.findById(image.postId);
    if (!post) throw new NotFoundError("Post no encontrado", "POST_NOT_FOUND");
    if (post.authorId !== userId) throw new ForbiddenError("No autorizado para eliminar esta imagen", "DELETE_IMAGE_FORBIDDEN");

    await this.imageRepo.softDelete(imageId);
    eventBus.emit("image.hard_delete", { imageId, key: image.key });
  }
}
