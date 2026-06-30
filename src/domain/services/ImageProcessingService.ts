export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  mimeType: string; // 'image/webp'
}

export interface ImageProcessingService {
  processToWebP(buffer: Buffer, options?: { maxDimension?: number; quality?: number }): Promise<ProcessedImage>;
  validateImage(buffer: Buffer): Promise<{ valid: boolean; error?: string; mimeType?: string }>;
}