import express from "express";
import { translateChapter, getTranslation } from "../controllers/translation-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Create translation task (protected, or optional based on requirements)
// Assuming user needs to be logged in to request expensive AI tasks, but for now I'll use authenticate
router.post("/", authenticate, translateChapter);

// Get translation
router.get("/:chapterId", getTranslation);

export default router;
