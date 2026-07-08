import type { ConfirmUploadInput } from "@application/contracts/post/ConfirmUploadInput.js";
import type { ConfirmUploadOutput } from "@application/contracts/post/ConfirmUploadOutput.js";
import type { PostImage } from "@domain/entities/PostImage.js";
import type { StorageService } from "@domain/services/StorageService.js";
import type { ImageProcessingService } from "@domain/services/ImageProcessingService.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import { NotFoundError } from "@domain/errors/NotFoundError.js";
import { ValidationError } from "@domain/errors/ValidationError.js";
import { randomUUID } from "node:crypto";

export class ConfirmUploadUseCase {
  constructor(
    private storage: StorageService,
    private imageProcessor: ImageProcessingService,
    private imageRepo: PostImageRepository
  ) {}

  async execute(postId: string, userId: string, input: ConfirmUploadInput): Promise<ConfirmUploadOutput> {
    const images: PostImage[] = [];

    for (let i = 0; i < input.images.length; i++) {
      const imageInput = input.images[i];
      if (!imageInput) continue;
      const { tempKey } = imageInput;

      const object = await this.storage.getObject(tempKey);
      if (!object) throw new NotFoundError(`Archivo temporal no encontrado`, "TEMP_FILE_NOT_FOUND");

      const validation = await this.imageProcessor.validateImage(object);
      if (!validation.valid) {
        await this.storage.deleteObject(tempKey);
        throw new ValidationError(validation.error ?? "Error de validación de imagen", "IMAGE_VALIDATION_FAILED");
      }

      const processed = await this.imageProcessor.processToWebP(object);
      const finalKey = `posts/${postId}/${randomUUID()}.webp`;
      await this.storage.putObject(finalKey, processed.buffer, processed.mimeType);
      await this.storage.deleteObject(tempKey);

      const image = await this.imageRepo.create({
        postId,
        key: finalKey,
        url: this.storage.getPublicUrl(finalKey),
        width: processed.width,
        height: processed.height,
        size: processed.size,
        mimeType: processed.mimeType,
        order: i,
        deletedAt: null,
      });

      images.push(image);
    }

    return { images };
  }
}
