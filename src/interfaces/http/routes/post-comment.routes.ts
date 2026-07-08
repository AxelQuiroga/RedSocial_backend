import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { commentCreateRateLimit } from "../../../middlewares/rate-limit.middleware.js";
import { createCommentController } from "../../../infrastructure/di/factory.js";
import {
  commentIdParamsSchema,
  createCommentSchema,
  paginationQuerySchema
} from "../validators/comment.schema.js";

const router = Router();
const commentController = createCommentController();

router.post(
  "/:id/comments",
  authMiddleware,
  commentCreateRateLimit,
  validate({ params: commentIdParamsSchema, body: createCommentSchema }),
  (req, res) => commentController.create(req, res)
);

router.get(
  "/:id/comments",
  validate({ params: commentIdParamsSchema, query: paginationQuerySchema }),
  (req, res) => commentController.getByPost(req, res)
);

export default router;