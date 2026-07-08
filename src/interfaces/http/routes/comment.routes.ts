import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { commentUpdateRateLimit } from "../../../middlewares/rate-limit.middleware.js";
import { createCommentController } from "../../../infrastructure/di/factory.js";
import {
  commentIdParamsSchema,
  updateCommentSchema,
  paginationQuerySchema
} from "../validators/comment.schema.js";

const router = Router();
const commentController = createCommentController();

/**
 * PUT /comments/:id
 * Actualiza un comentario (solo el autor).
 * Rate limit: 20 ediciones por minuto por IP.
 */
router.put(
  "/:id",
  authMiddleware,
  commentUpdateRateLimit,
  validate({ params: commentIdParamsSchema, body: updateCommentSchema }),
  (req, res) => commentController.update(req, res)
);

/**
 * DELETE /comments/:id
 * Elimina un comentario (solo el autor, con cascada).
 */
router.delete(
  "/:id",
  authMiddleware,
  validate({ params: commentIdParamsSchema }),
  (req, res) => commentController.delete(req, res)
);

/**
 * GET /comments/:id/replies
 * Lista respuestas de un comentario (paginado).
 */
router.get(
  "/:id/replies",
  validate({ params: commentIdParamsSchema, query: paginationQuerySchema }),
  (req, res) => commentController.getReplies(req, res)
);

export default router;
