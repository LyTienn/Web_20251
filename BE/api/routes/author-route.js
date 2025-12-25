import express from "express";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getBooksByAuthor
} from "../controllers/author-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllAuthors);
router.get("/:id", getAuthorById);
router.get("/:id/books", getBooksByAuthor);

// Admin routes
router.post("/", authenticate, authorizeRoles("ADMIN"), createAuthor);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateAuthor);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteAuthor);

export default router;
