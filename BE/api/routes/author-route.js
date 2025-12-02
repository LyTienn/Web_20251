import express from "express";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getBooksByAuthor
} from "../controllers/author-controller.js";

const router = express.Router();

router.get("/", getAllAuthors);
router.get("/:id", getAuthorById);
router.get("/:id/books", getBooksByAuthor);
router.post("/", createAuthor);
router.put("/:id", updateAuthor);
router.delete("/:id", deleteAuthor);

export default router;
