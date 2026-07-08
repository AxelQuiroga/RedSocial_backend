import type { Request, Response } from "express";
import type { PresignUploadUseCase } from "@application/use-cases/post/PresignUploadUseCase.js";
import type { ConfirmUploadUseCase } from "@application/use-cases/post/ConfirmUploadUseCase.js";
import type { DeletePostImageUseCase } from "@application/use-cases/post/DeletePostImageUseCase.js";
import type { ReorderPostImagesUseCase } from "@application/use-cases/post/ReorderPostImagesUseCase.js";
import type { GetPostImagesUseCase } from "@application/use-cases/post/GetPostImagesUseCase.js";

export class PostImagesController {
  constructor(
    private presign: PresignUploadUseCase,
    private confirm: ConfirmUploadUseCase,
    private deleteImg: DeletePostImageUseCase,
    private reorder: ReorderPostImagesUseCase,
    private getImages: GetPostImagesUseCase
  ) {}

  async presignUpload(req: Request, res: Response) {
    const userId = req.user!.userId;
    const result = await this.presign.execute(userId, req.body);
    res.json(result);
  }

  async confirmUpload(req: Request, res: Response) {
    const userId = req.user!.userId;
    const postId = req.params.postId;
    if (!postId || Array.isArray(postId)) throw new Error("postId inválido");
    const result = await this.confirm.execute(postId, userId, req.body);
    res.status(201).json(result);
  }

  async getPostImages(req: Request, res: Response) {
    const postId = req.params.postId;
    if (!postId || Array.isArray(postId)) throw new Error("postId inválido");
    const result = await this.getImages.execute(postId);
    res.json(result);
  }

  async deleteImage(req: Request, res: Response) {
    const userId = req.user!.userId;
    const imageId = req.params.imageId;
    if (!imageId || Array.isArray(imageId)) throw new Error("imageId inválido");
    await this.deleteImg.execute(imageId, userId);
    res.status(204).send();
  }

  async reorderImages(req: Request, res: Response) {
    const userId = req.user!.userId;
    const postId = req.params.postId;
    if (!postId || Array.isArray(postId)) throw new Error("postId inválido");
    await this.reorder.execute(userId, { postId, images: req.body.images });
    res.json({ ok: true });
  }
}
