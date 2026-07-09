import type { Request, Response } from "express";
import type { PresignUploadUseCase } from "@application/use-cases/post/PresignUploadUseCase.js";
import type { ConfirmUploadUseCase } from "@application/use-cases/post/ConfirmUploadUseCase.js";
import type { DeletePostImageUseCase } from "@application/use-cases/post/DeletePostImageUseCase.js";
import type { ReorderPostImagesUseCase } from "@application/use-cases/post/ReorderPostImagesUseCase.js";
import type { GetPostImagesUseCase } from "@application/use-cases/post/GetPostImagesUseCase.js";
import type { PresignUploadInput } from "@application/contracts/post/PresignUploadInput.js";
import type { ConfirmUploadInput } from "@application/contracts/post/ConfirmUploadInput.js";

export class PostImagesController {
  constructor(
    private presign: PresignUploadUseCase,
    private confirm: ConfirmUploadUseCase,
    private deleteImg: DeletePostImageUseCase,
    private reorder: ReorderPostImagesUseCase,
    private getImages: GetPostImagesUseCase
  ) {}

  async presignUpload(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const input = res.locals.validated.body as PresignUploadInput;
    const result = await this.presign.execute(req.user.userId, input);
    res.json(result);
  }

  async confirmUpload(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { postId } = res.locals.validated.params as { postId: string };
    const input = res.locals.validated.body as ConfirmUploadInput;
    const result = await this.confirm.execute(postId, req.user.userId, input);
    res.status(201).json(result);
  }

  async getPostImages(req: Request, res: Response) {
    const { postId } = res.locals.validated.params as { postId: string };
    const result = await this.getImages.execute(postId);
    res.json(result);
  }

  async deleteImage(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { imageId } = res.locals.validated.params as { imageId: string };
    await this.deleteImg.execute(imageId, req.user.userId);
    res.status(204).send();
  }

  async reorderImages(req: Request, res: Response) {
    if (!req.user?.userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const { postId } = res.locals.validated.params as { postId: string };
    const body = res.locals.validated.body as { images: { imageId: string; order: number }[] };
    await this.reorder.execute(req.user.userId, { postId, images: body.images });
    res.json({ ok: true });
  }
}
