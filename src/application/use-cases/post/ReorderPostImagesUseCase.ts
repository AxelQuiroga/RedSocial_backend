import type { ReorderPostImagesInput } from "@application/contracts/post/ReorderPostImagesInput.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import type { PostRepository } from "@domain/repositories/PostRepository.js";

export class ReorderPostImagesUseCase {
  constructor(
    private imageRepo: PostImageRepository,
    private postRepo: PostRepository
  ) {}

  async execute(userId: string, input: ReorderPostImagesInput): Promise<void> {
    const post = await this.postRepo.findById(input.postId);
    if (!post) throw new Error("Post no encontrado");
    if (post.authorId !== userId) throw new Error("No autorizado");

    await this.imageRepo.reorder(
      input.postId,
      input.images.map((image) => ({
        id: image.imageId,
        order: image.order,
      }))
    );
  }
}
