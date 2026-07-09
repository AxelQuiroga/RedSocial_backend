import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageService } from "@domain/services/StorageService.js";
import { env } from "@config/env.js";
import type { Readable } from "stream";

export class S3StorageService implements StorageService {
  private client: S3Client;
  private presignClient: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const s3Config = {
      region: env.STORAGE_REGION,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY,
        secretAccessKey: env.STORAGE_SECRET_KEY,
      },
      forcePathStyle: true, // Necesario para MinIO
    };

    // Cliente interno: usa el hostname de Docker para operaciones del backend
    this.client = new S3Client({ ...s3Config, endpoint: env.STORAGE_ENDPOINT });

    // Cliente para presigned URLs: usa un endpoint accesible desde el navegador
    this.presignClient = new S3Client({ ...s3Config, endpoint: env.STORAGE_PUBLIC_ENDPOINT });

    this.bucket = env.STORAGE_BUCKET;
    this.publicUrl = env.STORAGE_PUBLIC_URL;
  }

  async generatePresignedPutUrl(key: string, contentType: string, expiresInSec = 3600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.presignClient, command, { expiresIn: expiresInSec });
    return { url };
  }

  async generatePresignedGetUrl(key: string, expiresInSec = 3600) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSec });
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  async deleteObject(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async copyObject(sourceKey: string, destKey: string) {
    await this.client.send(new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourceKey}`,
      Key: destKey,
    }));
  }

  async objectExists(key: string) {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

   private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  }

  async getObject(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const response = await this.client.send(command);
    if (!response.Body) throw new Error(`Objeto vacío: ${key}`);
    return this.streamToBuffer(response.Body as Readable);
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await this.client.send(command);
  }
}