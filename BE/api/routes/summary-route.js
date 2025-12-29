import { Router } from "express";
import { summarizeChapter } from "../controllers/summary-controller.js";

const router = Router();

router.post("/", summarizeChapter);

export default router;
