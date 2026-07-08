import type { ReorderPostImagesInput } from "@application/contracts/post/ReorderPostImagesInput.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import type { PostRepository } from "@domain/repositories/PostRepository.js";
import { ForbiddenError } from "@domain/errors/ForbiddenError.js";
import { NotFoundError } from "@domain/errors/NotFoundError.js";

export class ReorderPostImagesUseCase {
  constructor(
    private imageRepo: PostImageRepository,
    private postRepo: PostRepository
  ) {}

  async execute(userId: string, input: ReorderPostImagesInput): Promise<void> {
    const post = await this.postRepo.findById(input.postId);
    if (!post) throw new NotFoundError("Post no encontrado", "POST_NOT_FOUND");
    if (post.authorId !== userId) throw new ForbiddenError("No autorizado para reordenar imágenes", "REORDER_IMAGES_FORBIDDEN");

    await this.imageRepo.reorder(
      input.postId,
      input.images.map((image) => ({
        id: image.imageId,
        order: image.order,
      }))
    );
  }
}
