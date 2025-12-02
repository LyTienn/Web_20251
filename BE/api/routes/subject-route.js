import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getBooksBySubject
} from "../controllers/subject-controller.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.get("/:id/books", getBooksBySubject);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
