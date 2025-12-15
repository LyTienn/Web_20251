import express from "express";
import CommentController from "../controllers/comment-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Tạo comment cho sách
router.post(
  "/books/:bookId/comments",
  authenticate,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("content").optional().trim(),
  ],
  CommentController.createComment
);

// Lấy comments của sách
router.get("/books/:bookId/comments", CommentController.getBookComments);

// Lấy comments của user hiện tại
router.get("/my-comments", authenticate, CommentController.getUserComments);

// Cập nhật comment
router.put(
  "/:commentId",
  authenticate,
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("content").optional().trim(),
  ],
  CommentController.updateComment
);

// Xóa comment
router.delete(
  "/:commentId",
  authenticate,
  CommentController.deleteComment
);

export default router;
