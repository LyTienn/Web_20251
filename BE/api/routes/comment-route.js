import express from "express";
import CommentController from "../controllers/comment-controller.js";
import { authenticate, authorizeRoles, optionalAuth } from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Admin: Lấy tất cả comments
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.getAllComments
);

// Get Moderation Mode
router.get(
  "/moderation-mode",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.getModerationMode
);

// Update Moderation Mode
router.put(
  "/moderation-mode",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.updateModerationMode
);

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
router.get("/books/:bookId/comments", optionalAuth, CommentController.getBookComments);

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

// Duyệt comment
router.patch(
  "/:commentId/approve",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.approveComment
);

// Từ chối comment
router.patch(
  "/:commentId/reject",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.rejectComment
);

// Change Status
router.patch(
  "/:commentId/status",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.changeCommentStatus
);

// Bulk Check Pending (triggered by Admin)
router.post(
  "/bulk-check-pending",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.bulkCheckPendingComments
);

// Bulk Approve (Manual)
router.post(
  "/bulk-approve",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.bulkApprove
);

// Bulk Reject (Manual)
router.post(
  "/bulk-reject",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.bulkReject
);

// Get Sentiment Stats
router.get(
  "/sentiment-stats",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.getSentimentStats
);

// Bulk Classify (Manual Trigger)
router.post(
  "/bulk-classify",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.bulkClassifySentiment
);

// Get Books with Comments (Admin Filter)
router.get(
  "/books-with-comments",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.getBooksWithComments
);

// Moderation routes moved to top

export default router;
