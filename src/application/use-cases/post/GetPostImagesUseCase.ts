import type { PostImage } from "@domain/entities/PostImage.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";

export class GetPostImagesUseCase {
  constructor(private imageRepo: PostImageRepository) {}

  async execute(postId: string): Promise<PostImage[]> {
    return this.imageRepo.findByPostId(postId);
  }
}
