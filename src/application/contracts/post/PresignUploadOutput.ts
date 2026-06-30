export interface PresignedUpload {
  key: string;        // key final en storage (ej: posts/{postId}/{uuid}.webp)
  tempKey: string;    // key temporal para subir (ej: temp/{userId}/{uuid}.original)
  uploadUrl: string;  // URL firmada para PUT directo
  publicUrl: string;  // URL pública final
}

export interface PresignUploadOutput {
  uploads: PresignedUpload[];
}