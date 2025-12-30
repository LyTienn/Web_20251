import { Router } from "express";
import { getChapterById, updateChapter, deleteChapter, createChapter } from "../controllers/chapter-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = Router();

// Chapter routes - Protected & Admin only for edits
router.get("/:id", authenticate, getChapterById);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateChapter);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteChapter);
router.post("/", authenticate, authorizeRoles("ADMIN"), createChapter);

export default router;
