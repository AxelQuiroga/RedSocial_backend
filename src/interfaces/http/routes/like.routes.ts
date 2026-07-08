import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { createLikeController } from "../../../infrastructure/di/factory.js";
import { likePostParamsSchema } from "../validators/like.schema.js";

const router = Router();
const likeController = createLikeController();

/**
 * POST /posts/:id/like
 * Da like a un post (requiere autenticación)
 */
router.post(
  "/:id/like",
  authMiddleware,
  validate({ params: likePostParamsSchema }),
  (req, res) => likeController.like(req, res)
);

/**
 * DELETE /posts/:id/like
 * Quita like a un post (requiere autenticación)
 */
router.delete(
  "/:id/like",
  authMiddleware,
  validate({ params: likePostParamsSchema }),
  (req, res) => likeController.unlike(req, res)
);

/**
 * GET /posts/:id/likes
 * Obtiene conteo de likes (opcional: autenticación para saber si el usuario dio like)
 */
router.get(
  "/:id/likes",
  authMiddleware, // Opcional: si no hay auth, userHasLiked será false
  validate({ params: likePostParamsSchema }),
  (req, res) => likeController.getLikes(req, res)
);

export default router;
