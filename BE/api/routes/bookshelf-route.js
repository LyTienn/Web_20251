import express from "express";
import BookshelfController from "../controllers/bookshelf-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Lấy bookshelf của user
router.get("/", authenticate, BookshelfController.getUserBookshelf);

// Thêm sách vào bookshelf
router.post(
  "/books/:bookId",
  authenticate,
  [
    body("status")
      .isIn(["FAVORITE", "READING"])
      .withMessage("Status must be FAVORITE or READING"),
  ],
  BookshelfController.addToBookshelf
);

// Kiểm tra sách có trong bookshelf không
router.get(
  "/books/:bookId/check",
  authenticate,
  BookshelfController.checkBookInBookshelf
);

// Cập nhật status
router.put(
  "/books/:bookId/status",
  authenticate,
  [
    body("oldStatus")
      .isIn(["FAVORITE", "READING"])
      .withMessage("Old status must be FAVORITE or READING"),
    body("newStatus")
      .isIn(["FAVORITE", "READING"])
      .withMessage("New status must be FAVORITE or READING"),
  ],
  BookshelfController.updateBookshelfStatus
);

// Xóa sách khỏi bookshelf
router.delete(
  "/books/:bookId",
  authenticate,
  BookshelfController.removeFromBookshelf
);

export default router;
