import type { Request, Response } from "express";
import type { PresignUploadUseCase } from "@application/use-cases/post/PresignUploadUseCase.js";
import type { ConfirmUploadUseCase } from "@application/use-cases/post/ConfirmUploadUseCase.js";
import type { DeletePostImageUseCase } from "@application/use-cases/post/DeletePostImageUseCase.js";
import type { ReorderPostImagesUseCase } from "@application/use-cases/post/ReorderPostImagesUseCase.js";

export class PostImagesController {
  constructor(
    private presign: PresignUploadUseCase,
    private confirm: ConfirmUploadUseCase,
    private deleteImg: DeletePostImageUseCase,
    private reorder: ReorderPostImagesUseCase
  ) {}

  async presignUpload(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await this.presign.execute(userId, req.body);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async confirmUpload(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const postId = req.params.postId; // o viene en body
      const result = await this.confirm.execute(postId, userId, req.body);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      await this.deleteImg.execute(req.params.imageId, userId);
      res.status(204).send();
    } catch (e: any) {
      const status = e.message === "Imagen no encontrada" ? 404 : 400;
      res.status(status).json({ error: e.message });
    }
  }

  async reorderImages(req: Request, res: Response) {
    try {
      await this.reorder.execute(req.body.imageOrders);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}