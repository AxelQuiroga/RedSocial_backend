import type { PresignUploadInput } from "@application/contracts/post/PresignUploadInput.js";
import type { PresignUploadOutput, PresignedUpload } from "@application/contracts/post/PresignUploadOutput.js";
import type { StorageService } from "@domain/services/StorageService.js";
import type { UserRepository } from "@domain/repositories/UserRepository.js"; // para validar user existe
import { v4 as uuidv4 } from "uuid"; // npm i uuid @types/uuid

export class PresignUploadUseCase {
  constructor(
    private storage: StorageService,
    private userRepo: UserRepository
  ) {}

  async execute(userId: string, input: PresignUploadInput): Promise<PresignUploadOutput> {
    // Validar usuario existe
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // Validar cantidad
    if (input.files.length > 5) throw new Error("Máximo 5 imágenes por post");

    // Validar cada archivo (tipo y tamaño básico)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB - coincidir con env

    for (const f of input.files) {
      if (!allowedTypes.includes(f.type)) throw new Error(`Tipo no permitido: ${f.type}`);
      if (f.size > maxSize) throw new Error(`Archivo ${f.name} supera 5MB`);
    }

    // Generar presigned URLs
    const uploads: PresignedUpload[] = [];

    for (const f of input.files) {
      const ext = f.type === "image/jpeg" ? "jpg" : f.type.split("/")[1];
      const uuid = uuidv4();
      const tempKey = `temp/${userId}/${uuid}.${ext}`;
      const finalKey = `posts/${uuid}.webp`; // postId se asigna al confirmar

      const { url } = await this.storage.generatePresignedPutUrl(tempKey, f.type);
      const publicUrl = this.storage.getPublicUrl(finalKey);

      uploads.push({ key: finalKey, tempKey, uploadUrl: url, publicUrl });
    }

    return { uploads };
  }
}