import express from "express";
import { generateComic, getComic } from "../controllers/comic-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/generate", authenticate, generateComic);
router.get("/:chapterId", getComic);

export default router;
