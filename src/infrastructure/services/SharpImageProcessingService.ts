import sharp from "sharp";
import type { ImageProcessingService, ProcessedImage } from "@domain/services/ImageProcessingService.js";
import { env } from "@config/env.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "image/gif": [0x47, 0x49, 0x46],
};

export class SharpImageProcessingService implements ImageProcessingService {
  async validateImage(buffer: Buffer) {
    if (buffer.length > env.IMAGE_MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `Archivo supera ${env.IMAGE_MAX_SIZE_MB}MB` };
    }

    const header = buffer.subarray(0, 12);
    let detectedMime: string | null = null;

    for (const [mime, bytes] of Object.entries(MAGIC_BYTES)) {
      if (bytes.every((b, i) => header[i] === b)) {
        detectedMime = mime;
        break;
      }
    }

    if (
      !detectedMime &&
      header[0] === 0x52 &&
      header[1] === 0x49 &&
      header[2] === 0x46 &&
      header[3] === 0x46 &&
      header[8] === 0x57 &&
      header[9] === 0x45 &&
      header[10] === 0x42 &&
      header[11] === 0x50
    ) {
      detectedMime = "image/webp";
    }

    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      return { valid: false, error: "Tipo de archivo no permitido (solo JPG, PNG, WebP, GIF)" };
    }

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

  async processToWebP(
    buffer: Buffer,
    options: { maxDimension?: number; quality?: number } = {}
  ): Promise<ProcessedImage> {
    const { maxDimension = env.IMAGE_MAX_DIMENSION, quality = env.IMAGE_QUALITY } = options;

    const processed = await sharp(buffer)
      .rotate()
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
