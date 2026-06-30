export interface StorageService {
  generatePresignedPutUrl(key: string, contentType: string, expiresInSec: number): Promise<{ url: string; fields?: Record<string, string> }>;
  generatePresignedGetUrl(key: string, expiresInSec: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
  copyObject(sourceKey: string, destKey: string): Promise<void>;
  objectExists(key: string): Promise<boolean>;
}