import type { EventBus } from "../../domain/events/EventBus.js";
import type { StorageService } from "@domain/services/StorageService.js";
import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";

interface HardDeletePayload {
  imageId: string;
  key: string;
}

export class ImageCleanupListener {
  constructor(
    private storage: StorageService,
    private imageRepo: PostImageRepository,
    private eventBus: EventBus
  ) {
    this.register();
  }

  private register() {
    this.eventBus.on("image.hard_delete", async (payload: unknown) => {
      try {
        const { imageId, key } = payload as HardDeletePayload;

        if (!imageId || !key) {
          console.error("[ImageCleanup] Payload inválido:", payload);
          return;
        }

        // 1. Borrar archivo físico de MinIO
        await this.storage.deleteObject(key);
        console.log(`[ImageCleanup] Archivo eliminado de storage: ${key}`);

        // 2. Hard delete en BD
        await this.imageRepo.hardDelete(imageId);
        console.log(`[ImageCleanup] Registro eliminado de BD: ${imageId}`);
      } catch (error) {
        console.error("[ImageCleanup] Error al procesar hard delete:", error);
      }
    });
  }
}
