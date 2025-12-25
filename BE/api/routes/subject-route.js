import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getBooksBySubject
} from "../controllers/subject-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.get("/:id/books", getBooksBySubject);

// Admin routes
router.post("/", authenticate, authorizeRoles("ADMIN"), createSubject);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateSubject);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteSubject);

export default router;
