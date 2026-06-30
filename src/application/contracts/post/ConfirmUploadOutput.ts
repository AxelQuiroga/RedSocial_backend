import type { PostImage } from "@domain/entities/PostImage.js";

export interface ConfirmUploadOutput {
  images: PostImage[];
}