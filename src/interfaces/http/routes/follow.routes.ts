import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { createFollowController } from "@infrastructure/di/factory.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  followUserSchema,
  unfollowUserSchema,
  getFollowersSchema,
  getFollowingSchema,
  getFollowCountsSchema,
  followStatusSchema,
  followStatusBatchSchema
} from "../validators/follow.validator.js";

const router = Router();

const followController = createFollowController();

// Follow/unfollow (requieren auth)
router.post("/:userId/follow", authMiddleware, validate(followUserSchema), (req, res) =>
  followController.follow(req, res)
);

router.delete("/:userId/follow", authMiddleware, validate(unfollowUserSchema), (req, res) =>
  followController.unfollow(req, res)
);

// Status (requiere auth - check if current user follows target)
router.get("/:userId/follow/status", authMiddleware, validate(followStatusSchema), (req, res) =>
  followController.status(req, res)
);

// Listas públicas (con paginación)
router.get("/:userId/followers", validate(getFollowersSchema), (req, res) =>
  followController.getFollowers(req, res)
);

router.get("/:userId/following", validate(getFollowingSchema), (req, res) =>
  followController.getFollowing(req, res)
);

// Batch status (requiere auth)
router.post("/status/batch", authMiddleware, validate(followStatusBatchSchema), (req, res) =>
  followController.statusBatch(req, res)
);

// Counts
router.get("/:userId/follow/counts", validate(getFollowCountsSchema), (req, res) =>
  followController.getCounts(req, res)
);

export default router;
