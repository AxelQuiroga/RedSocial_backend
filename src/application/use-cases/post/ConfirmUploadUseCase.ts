import type { ConfirmUploadInput } from "@application/contracts/post/ConfirmUploadInput.js";
import type { ConfirmUploadOutput } from "@application/contracts/post/ConfirmUploadOutput.js";
import type { PostImage } from "@domain/entities/PostImage.js";
import type { StorageService } from "@domain/services/StorageService.js";
import type { ImageProcessingService } from "@domain/services/ImageProcessingService.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import { v4 as uuidv4 } from "uuid";

export class ConfirmUploadUseCase {
  constructor(
    private storage: StorageService,
    private imageProcessor: ImageProcessingService,
    private imageRepo: PostImageRepository
  ) {}

  async execute(postId: string, userId: string, input: ConfirmUploadInput): Promise<ConfirmUploadOutput> {
    const images: PostImage[] = [];

    for (let i = 0; i < input.images.length; i++) {
      const { tempKey, key } = input.images[i];

      // 1. Descargar archivo temporal de MinIO
      // Nota: necesitas un método getObject en StorageService, o usa SDK directo
      // Para simplificar, asumamos que agregamos getObject al StorageService
      const object = await this.storage.getObject(tempKey); // Implementar en S3StorageService
      if (!object) throw new Error(`Archivo temporal no encontrado: ${tempKey}`);

      // 2. Validar magic bytes + dimensiones (segunda barrera)
      const validation = await this.imageProcessor.validateImage(object.Body);
      if (!validation.valid) {
        await this.storage.deleteObject(tempKey); // Cleanup
        throw new Error(validation.error);
      }

      // 3. Procesar a WebP optimizado
      const processed = await this.imageProcessor.processToWebP(object.Body);

      // 4. Subir archivo final a key definitiva (posts/{postId}/{uuid}.webp)
      const finalKey = `posts/${postId}/${uuidv4()}.webp`;
      await this.storage.putObject(finalKey, processed.buffer, processed.mimeType); // Agregar putObject

      // 5. Borrar temporal
      await this.storage.deleteObject(tempKey);

      // 6. Guardar en BD
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
//Nota: Tenés que agregar getObject(key) y putObject(key, buffer, contentType) a StorageService interface y S3StorageService.