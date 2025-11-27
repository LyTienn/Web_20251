import express from "express";
import AuthController from "../controllers/auth-controller.js";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validation-middleware.js";
import { optionalAuth } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", optionalAuth, AuthController.logout);

export default router;
