import { Router } from "express";
import { authMiddleware } from "@middlewares/auth.middleware.js";
import { validate } from "@middlewares/validate.middleware.js";
import { PostImagesController } from "../controllers/postImages.controller.js";
import {
  presignUploadSchema,
  confirmUploadSchema,
  deleteImageSchema,
  reorderImagesSchema,
} from "../validators/postImages.validator.js";
import { createPresignUploadUseCase, createConfirmUploadUseCase, createDeletePostImageUseCase, createReorderPostImagesUseCase } from "@infrastructure/di/factory.js";

const router = Router();
const controller = new PostImagesController(
  createPresignUploadUseCase(),
  createConfirmUploadUseCase(),
  createDeletePostImageUseCase(),
  createReorderPostImagesUseCase()
);

router.post("/images/presign", authMiddleware, validate(presignUploadSchema), (req, res) => controller.presignUpload(req, res));
router.post("/posts/:postId/images/confirm", authMiddleware, validate(confirmUploadSchema), (req, res) => controller.confirmUpload(req, res));
router.delete("/images/:imageId", authMiddleware, validate(deleteImageSchema), (req, res) => controller.deleteImage(req, res));
router.put("/images/reorder", authMiddleware, validate(reorderImagesSchema), (req, res) => controller.reorderImages(req, res));

export default router;