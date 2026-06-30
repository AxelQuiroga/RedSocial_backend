import type { PostImage } from "@domain/entities/PostImage.js";

export interface GetPostImagesOutput {
  images: PostImage[];
}