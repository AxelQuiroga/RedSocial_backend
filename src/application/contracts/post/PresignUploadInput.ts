export interface PresignUploadInput {
  files: { name: string; type: string; size: number }[];
}