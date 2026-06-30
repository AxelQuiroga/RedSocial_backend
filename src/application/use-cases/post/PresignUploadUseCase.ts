import type { PresignUploadInput } from "@application/contracts/post/PresignUploadInput.js";
import type { PresignUploadOutput, PresignedUpload } from "@application/contracts/post/PresignUploadOutput.js";
import type { StorageService } from "@domain/services/StorageService.js";
import type { UserRepository } from "@domain/repositories/UserRepository.js";
import { randomUUID } from "node:crypto";
import { env } from "@config/env.js";

export class PresignUploadUseCase {
  constructor(
    private storage: StorageService,
    private userRepo: UserRepository
  ) {}

  async execute(userId: string, input: PresignUploadInput): Promise<PresignUploadOutput> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    if (input.files.length > env.IMAGE_MAX_PER_POST) {
      throw new Error(`Máximo ${env.IMAGE_MAX_PER_POST} imágenes por post`);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = env.IMAGE_MAX_SIZE_MB * 1024 * 1024;

    for (const file of input.files) {
      if (!allowedTypes.includes(file.type)) throw new Error(`Tipo no permitido: ${file.type}`);
      if (file.size > maxSize) throw new Error(`Archivo ${file.name} supera ${env.IMAGE_MAX_SIZE_MB}MB`);
    }

    const uploads: PresignedUpload[] = [];

    for (const file of input.files) {
      const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const uuid = randomUUID();
      const tempKey = `temp/${userId}/${uuid}.${ext}`;
      const finalKey = `posts/${uuid}.webp`;

      const { url } = await this.storage.generatePresignedPutUrl(tempKey, file.type, 3600);
      const publicUrl = this.storage.getPublicUrl(finalKey);

      uploads.push({ key: finalKey, tempKey, uploadUrl: url, publicUrl });
    }

    return { uploads };
  }
}
