import express from "express";
import BookshelfController from "../controllers/bookshelf-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";
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

// Xóa sách khỏi bookshelf
router.delete(
  "/books/:bookId",
  authenticate,
  BookshelfController.removeFromBookshelf
);

router.get("/books/:bookId/progress", authenticate, BookshelfController.getReadingProgress);
router.put("/books/:bookId/progress", authenticate, BookshelfController.saveReadingProgress);

export default router;

// Admin endpoints for managing any user's bookshelf
const adminRouter = express.Router();

// GET: Admin fetch a user's bookshelf (favorites + reading)
adminRouter.get(
  "/users/:userId",
  authenticate,
  authorizeRoles("ADMIN"),
  BookshelfController.getBookshelfByUserId
);

// POST: Admin add book to a user's bookshelf
adminRouter.post(
  "/users/:userId/books/:bookId",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    body("status")
      .isIn(["FAVORITE", "READING"]) 
      .withMessage("Status must be FAVORITE or READING"),
  ],
  BookshelfController.adminAddToBookshelf
);

// DELETE: Admin remove book from a user's bookshelf
adminRouter.delete(
  "/users/:userId/books/:bookId",
  authenticate,
  authorizeRoles("ADMIN"),
  BookshelfController.adminRemoveFromBookshelf
);

export { adminRouter as bookshelfAdminRouter };
