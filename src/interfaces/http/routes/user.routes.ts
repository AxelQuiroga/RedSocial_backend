import { Router } from "express";
import { UserController } from "../controllers/user.controllers.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateUserSchema
} from "../validators/user.validator.js";


const router = Router();
const controller = new UserController();

router.get("/me", authMiddleware, (req, res) => controller.me(req, res));
router.post("/register", validate(registerSchema), (req, res) =>
  controller.register(req, res)
);
router.post("/login", validate(loginSchema), (req, res) =>
  controller.login(req, res)
);
router.put("/me", authMiddleware, validate(updateUserSchema), (req, res) =>
  controller.update(req, res)
);

export default router;