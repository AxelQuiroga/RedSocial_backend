import sharp from "sharp";
import type { ImageProcessingService, ProcessedImage } from "@domain/services/ImageProcessingService.js";
import { env } from "@config/env.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/png": [0x89, 0x50, 0x4E, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF... necesita más check
  "image/gif": [0x47, 0x49, 0x46], // GIF
};

export class SharpImageProcessingService implements ImageProcessingService {
  async validateImage(buffer: Buffer) {
    if (buffer.length > env.IMAGE_MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `Archivo supera ${env.IMAGE_MAX_SIZE_MB}MB` };
    }

    // Magic bytes check
    const header = buffer.subarray(0, 12);
    let detectedMime: string | null = null;

    for (const [mime, bytes] of Object.entries(MAGIC_BYTES)) {
      if (bytes.every((b, i) => header[i] === b)) {
        detectedMime = mime;
        break;
      }
    }
    // WebP necesita check extra (RIFF....WEBP)
    if (!detectedMime && header.subarray(0,4).toString() === "RIFF" && header.subarray(8,12).toString() === "WEBP") {
      detectedMime = "image/webp";
    }

    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      return { valid: false, error: "Tipo de archivo no permitido (solo JPG, PNG, WebP, GIF)" };
    }

    // Validación extra con Sharp
    try {
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.width > env.IMAGE_MAX_DIMENSION) {
        return { valid: false, error: `Ancho máximo ${env.IMAGE_MAX_DIMENSION}px` };
      }
      if (metadata.height && metadata.height > env.IMAGE_MAX_DIMENSION) {
        return { valid: false, error: `Alto máximo ${env.IMAGE_MAX_DIMENSION}px` };
      }
    } catch {
      return { valid: false, error: "Archivo de imagen inválido o corrupto" };
    }

    return { valid: true, mimeType: detectedMime };
  }

  async processToWebP(buffer: Buffer, options = {}): Promise<ProcessedImage> {
    const { maxDimension = env.IMAGE_MAX_DIMENSION, quality = env.IMAGE_QUALITY } = options;

    const processed = await sharp(buffer)
      .rotate() // Auto-orient por EXIF
      .resize(maxDimension, maxDimension, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processed.data,
      width: processed.info.width,
      height: processed.info.height,
      size: processed.info.size,
      mimeType: "image/webp",
    };
  }
}