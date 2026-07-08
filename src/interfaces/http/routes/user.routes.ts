import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  publicProfileSchema
} from "../validators/user.validator.js";
import { createUserController } from "../../../infrastructure/di/factory.js";

const router = Router();
const controller = createUserController();


router.get("/me", authMiddleware, (req, res) => controller.me(req, res));
router.post("/register", validate(registerSchema), (req, res) =>
  controller.register(req, res)
);
router.post("/login", validate(loginSchema), (req, res) =>
  controller.login(req, res)
);
router.put("/me", authMiddleware, validate(updateProfileSchema), (req, res) =>
  controller.update(req, res)
);
router.get("/u/:username", validate(publicProfileSchema), (req, res) => controller.publicProfile(req, res));

export default router;