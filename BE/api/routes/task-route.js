import express from "express";
import { getTaskStatus } from "../controllers/task-controller.js";

const router = express.Router();

router.get("/:taskId", getTaskStatus);

export default router;
