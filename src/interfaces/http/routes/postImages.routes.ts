import { Router } from "express";
import { authMiddleware } from "@middlewares/auth.middleware.js";
import { validate } from "@middlewares/validate.middleware.js";
import { PostImagesController } from "../controllers/postImages.controller.js";
import {
  presignUploadSchema,
  confirmUploadSchema,
  deleteImageSchema,
  getPostImagesSchema,
  reorderImagesSchema,
} from "../validators/postImages.validator.js";
import {
  createPresignUploadUseCase,
  createConfirmUploadUseCase,
  createDeletePostImageUseCase,
  createReorderPostImagesUseCase,
  createGetPostImagesUseCase,
} from "@infrastructure/di/factory.js";

const router = Router();
const controller = new PostImagesController(
  createPresignUploadUseCase(),
  createConfirmUploadUseCase(),
  createDeletePostImageUseCase(),
  createReorderPostImagesUseCase(),
  createGetPostImagesUseCase()
);

router.post("/images/presign", authMiddleware, validate(presignUploadSchema), (req, res) => controller.presignUpload(req, res));
router.post("/:postId/images/confirm", authMiddleware, validate(confirmUploadSchema), (req, res) => controller.confirmUpload(req, res));
router.get("/:postId/images", validate(getPostImagesSchema), (req, res) => controller.getPostImages(req, res));
router.delete("/images/:imageId", authMiddleware, validate(deleteImageSchema), (req, res) => controller.deleteImage(req, res));
router.put("/:postId/images/reorder", authMiddleware, validate(reorderImagesSchema), (req, res) => controller.reorderImages(req, res));

export default router;
