import Comment from "../models/comment-model.js";
import Book from "../models/book-model.js";
import { User } from "../models/index.js";

class CommentController {
  // Tạo comment mới
  static async createComment(req, res) {
    try {
      const { content, rating } = req.body;
      const userId = req.user.userId;
      const { bookId } = req.params;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      // Kiểm tra xem user đã comment cho sách này chưa
      const existingComment = await Comment.findOne({
        where: {
          user_id: userId,
          book_id: bookId,
        },
      });

      if (existingComment) {
        return res.status(409).json({
          success: false,
          message: "You have already commented on this book",
        });
      }

      // Tạo comment mới
      const comment = await Comment.create({
        content,
        rating,
        user_id: userId,
        book_id: bookId,
      });

      // Lấy comment với thông tin user
      const commentWithUser = await Comment.findByPk(comment.comment_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: commentWithUser,
      });
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Lấy tất cả comments của một sách
  static async getBookComments(req, res) {
    try {
      const { bookId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows } = await Comment.findAndCountAll({
        where: { book_id: bookId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "full_name"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      // Tính average rating
      const allComments = await Comment.findAll({
        where: { book_id: bookId },
        attributes: ["rating"],
      });

      const averageRating =
        allComments.length > 0
          ? allComments.reduce((sum, c) => sum + c.rating, 0) /
            allComments.length
          : 0;

      res.status(200).json({
        success: true,
        data: {
          comments: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
          },
          averageRating: averageRating.toFixed(1),
          totalComments: count,
        },
      });
    } catch (error) {
      console.error("Get book comments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Cập nhật comment
  static async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content, rating } = req.body;
      const userId = req.user.userId;

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Kiểm tra quyền sở hữu
      if (comment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own comments",
        });
      }

      // Validate rating nếu có
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      // Cập nhật
      if (content !== undefined) comment.content = content;
      if (rating !== undefined) comment.rating = rating;

      await comment.save();

      const updatedComment = await Comment.findByPk(commentId, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "full_name"],
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Xóa comment
  static async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Chỉ cho phép user xóa comment của mình hoặc admin xóa bất kỳ comment nào
      if (comment.user_id !== userId && userRole !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own comments",
        });
      }

      await comment.destroy();

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Lấy comments của user
  static async getUserComments(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows } = await Comment.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: {
          comments: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get user comments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
}

export default CommentController;
