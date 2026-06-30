import type { PostImageRepository } from "@domain/repositories/PostImageRepository.js";
import type { StorageService } from "@domain/services/StorageService.js";
import { eventBus } from "@config/events.config.js"; // o tu queue

export class DeletePostImageUseCase {
  constructor(
    private imageRepo: PostImageRepository,
    private storage: StorageService
  ) {}

  async execute(imageId: string, userId: string): Promise<void> {
    const image = await this.imageRepo.findById(imageId);
    if (!image) throw new Error("Imagen no encontrada");
    if (image.deletedAt) throw new Error("Ya eliminada");

    // Verificar ownership (el post pertenece al user)
    // Necesitás access al PostRepo o agregar userId a PostImage
    // Opción simple: agregar postId y validar por ahí

    // Soft delete en BD
    await this.imageRepo.softDelete(imageId);

    // Encolar hard delete asíncrono (Outbox pattern o RabbitMQ directo)
    eventBus.emit("image.hard_delete", { imageId, key: image.key });
  }
}// ReorderPostImagesUseCase.ts / GetPostImagesUseCase.ts — Simples, delegando al repo.
