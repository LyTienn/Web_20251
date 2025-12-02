import { Router } from "express";
import { getAllBooks, getBookById, getBookChapters } from "../controllers/book-controller.js";

const router = Router();

// GET /books - lấy toàn bộ sách

// GET /books - lấy toàn bộ sách
router.get("/", getAllBooks);
// GET /books/:id - lấy chi tiết sách
router.get("/:id", getBookById);
// GET /books/:id/chapters - lấy danh sách chương của sách
router.get("/:id/chapters", getBookChapters);

export default router;
