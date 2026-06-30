import { z } from "zod";

export const presignUploadSchema = {
  body: z.object({
    files: z.array(z.object({
      name: z.string(),
      type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
      size: z.number().max(5 * 1024 * 1024),
    })).max(5),
  }).strict(),
};

export const confirmUploadSchema = {
  body: z.object({
    images: z.array(z.object({
      tempKey: z.string(),
      key: z.string(),
    })).max(5),
  }).strict(),
};

export const deleteImageSchema = {
  params: z.object({ imageId: z.string().uuid() }),
};

export const reorderImagesSchema = {
  body: z.object({
    imageOrders: z.array(z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
    })),
  }).strict(),
};