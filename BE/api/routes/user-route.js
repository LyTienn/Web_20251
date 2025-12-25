import express from "express";
import UserController from "../controllers/user-controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

// User routes (protected - require authentication)
router.get("/profile", authenticate, UserController.getProfile);
router.put(
  "/profile",
  authenticate,
  [
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("fullName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Full name must be between 2 and 255 characters"),
  ],
  UserController.updateProfile
);

router.post(
  "/change-password",
  authenticate,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  UserController.changePassword
);

router.delete("/account", authenticate, UserController.deleteAccount);

// Admin routes (protected - require ADMIN role)
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.getAllUsers
);

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  UserController.createUser
);

router.get(
  "/search",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.searchUsers
);

router.get(
  "/:userId",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.getUserById
);

router.put(
  "/:userId",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.updateUser
);

router.delete(
  "/:userId",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.deleteUser
);

export default router;
