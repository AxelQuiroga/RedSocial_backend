export interface PostImage {
    id: string;
  postId: string;
  key: string;           // Clave en S3 (ej: posts/uuid.webp)
  url: string;           // URL pública (CDN o storage directo)
  width: number;
  height: number;
  size: number;          // Bytes
  mimeType: string;      // Siempre 'image/webp' tras procesar
  order: number;         // Para reordenar
  deletedAt: Date | null; // Soft delete
  createdAt: Date;
}