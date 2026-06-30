import type { ReorderPostImagesInput } from "@application/contracts/post/ReorderPostImagesInput.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";

export class ReorderPostImagesUseCase {
  constructor(private imageRepo: PostImageRepository) {}

  async execute(input: ReorderPostImagesInput): Promise<void> {
    await this.imageRepo.reorder(
      input.postId,
      input.images.map((image) => ({
        id: image.imageId,
        order: image.order,
      }))
    );
  }
}
