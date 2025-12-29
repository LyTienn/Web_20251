import Comment from "../models/comment-model.js";
import sequelize from "../config/db-config.js";
import Book from "../models/book-model.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";
import SystemSettings from "../models/system-settings-model.js";
import { checkSpam } from "../services/comment-ai-service.js";

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

      // Kiểm tra chế độ kiểm duyệt
      const setting = await SystemSettings.findOne({ where: { key: 'MODERATION_MODE' } });
      const mode = setting ? setting.value : 'DEFAULT';

      let status = 'PENDING';
      let aiAnalysis = null;
      let sentiment = null;

      if (mode === 'AI_AUTO') {
        aiAnalysis = await checkSpam(content, rating);
        if (aiAnalysis.isSpam) {
          status = 'REJECTED';
        } else {
          status = 'APPROVED';
        }
        sentiment = aiAnalysis.sentiment;
      } else if (mode === 'AUTO_APPROVE') {
        status = 'APPROVED';
        // Auto-approve doesn't automatically imply sentiment check unless we mistakenly want to run AI just for sentiment?
        // User request: "AI tự động phân loại". 
        // So even if AUTO_APPROVE, we might want to run AI for sentiment?
        // For cost saving, maybe only if AI mode is on? 
        // Let's assume User wants sentiment ALWAYS if AI is available.
        // But for now, stick to AI_AUTO mode for AI features or add a background check.
        // Let's keep it simple: If AI_AUTO, we get sentiment. If DEFAULT/AUTO_APPROVE, sentiment is null unless we explicitly run it.
        // Wait, user said "AI tự động phân loại" (AI auto classify).
        // Let's call AI even in AUTO_APPROVE if we want classification, OR let's treat AI_AUTO as the mode that does everything.
        // I will assume AI_AUTO handles both. If mode is AUTO_APPROVE, we skip AI (fast path).
      }

      // Tạo comment mới
      const comment = await Comment.create({
        content,
        rating,
        user_id: userId,
        book_id: bookId,
        status: status,
        sentiment: sentiment
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

      // Background Sentiment Analysis for Auto-Approve mode
      if (mode === 'AUTO_APPROVE') {
        checkSpam(content, rating)
          .then(async (analysis) => {
            if (analysis.sentiment) {
              await Comment.update({ sentiment: analysis.sentiment }, { where: { comment_id: comment.comment_id } });
            }
          })
          .catch(err => console.error("Background sentiment check failed:", err));
      }
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

      const userId = req.user?.userId;
      const isAdmin = req.user?.role === 'ADMIN';

      // Build where clause - Admin can see all comments, regular users only see APPROVED or their own PENDING
      let statusFilter = {};
      if (!isAdmin) {
        statusFilter = {
          [Op.or]: [
            { status: "APPROVED" },
            ...(userId ? [{ status: "PENDING", user_id: userId }] : [])
          ]
        };
      }

      const { count, rows } = await Comment.findAndCountAll({
        where: {
          book_id: bookId,
          is_deleted: 0,
          ...statusFilter,
          ...(req.query.sentiment ? { sentiment: req.query.sentiment } : {})
        },
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
        where: { book_id: bookId, is_deleted: 0, status: "APPROVED" },
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
          totalComments: allComments.length,
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

      const comment = await Comment.findOne({ where: { comment_id: commentId, is_deleted: 0 } });

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

      const comment = await Comment.findOne({ where: { comment_id: commentId, is_deleted: 0 } });

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

      // Soft Delete
      comment.is_deleted = 1;
      await comment.save();

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

  // Admin: Lấy tất cả comments (có phân trang, filter)
  static async getAllComments(req, res) {
    try {
      const { page = 1, limit = 10, rating, bookId, userId } = req.query;
      const offset = (page - 1) * limit;

      const where = { is_deleted: 0 };
      if (rating) where.rating = rating;
      if (bookId) where.book_id = bookId;
      if (userId) where.user_id = userId;

      // New filter for status
      if (req.query.status) where.status = req.query.status;
      // Filter by Sentiment
      if (req.query.sentiment) where.sentiment = req.query.sentiment;

      const { count, rows } = await Comment.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "full_name", "email"],
          },
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
      console.error("Get all comments error:", error);
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
        where: { user_id: userId, is_deleted: 0 },
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

  // Duyệt comment (Admin)
  static async approveComment(req, res) {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
      }

      comment.status = "APPROVED";
      await comment.save();

      res.json({ success: true, message: "Comment approved", data: comment });
    } catch (error) {
      console.error("Approve comment error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Từ chối comment (Admin)
  static async rejectComment(req, res) {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
      }

      comment.status = "REJECTED";
      await comment.save();

      res.json({ success: true, message: "Comment rejected", data: comment });
    } catch (error) {
      console.error("Reject comment error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
  // Change Status (Approve/Reject/Pending)
  static async changeCommentStatus(req, res) {
    try {
      const { commentId } = req.params;
      const { status } = req.body;

      if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid or missing status" });
      }

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
      }

      comment.status = status;
      await comment.save();

      res.json({ success: true, message: `Comment status changed to ${status}`, data: comment });
    } catch (error) {
      console.error("Change status error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Bulk AI Check
  static async bulkCheckPendingComments(req, res) {
    try {
      const pendingComments = await Comment.findAll({ where: { status: 'PENDING', is_deleted: 0 } });

      if (pendingComments.length === 0) {
        return res.json({ success: true, message: "No pending comments to check", data: { processed: 0 } });
      }

      let processedCount = 0;
      let spamCount = 0;

      // Limit concurrency using simple loop or map with limit if needed. For now simple parallel.
      // Process in batches of 3 to avoid rate limits
      const BATCH_SIZE = 3;
      for (let i = 0; i < pendingComments.length; i += BATCH_SIZE) {
        const batch = pendingComments.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (comment) => {
          try {
            const analysis = await checkSpam(comment.content, comment.rating);
            console.log(`[BulkCheck] Comment ${comment.comment_id}: IsSpam=${analysis.isSpam}, Reason=${analysis.reason}`);

            if (analysis.isSpam) {
              comment.status = 'REJECTED';
              spamCount++;
            } else {
              comment.status = 'APPROVED';
            }
            if (analysis.sentiment) comment.sentiment = analysis.sentiment;
            await comment.save();
            processedCount++;
          } catch (err) {
            console.error(`[BulkCheck] Error processing comment ${comment.comment_id}:`, err);
            // Continue processing others even if one fails
          }
        });
        await Promise.all(batchPromises);
      }

      res.json({ success: true, message: "Bulk check completed", data: { processed: processedCount, spamDetected: spamCount } });

    } catch (error) {
      console.error("Bulk check error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Get Moderation Mode
  static async getModerationMode(req, res) {
    try {
      const setting = await SystemSettings.findOne({ where: { key: 'MODERATION_MODE' } });
      res.json({ success: true, mode: setting ? setting.value : 'DEFAULT' });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Update Moderation Mode
  static async updateModerationMode(req, res) {
    try {
      console.log("DEBUG: updateModerationMode called");
      console.log("DEBUG Body:", req.body);
      const { mode } = req.body; // DEFAULT or AI_AUTO
      if (!['DEFAULT', 'AI_AUTO', 'AUTO_APPROVE'].includes(mode)) {
        return res.status(400).json({ success: false, message: "Invalid mode" });
      }

      console.log("DEBUG: Finding setting...");
      let setting = await SystemSettings.findOne({ where: { key: 'MODERATION_MODE' } });
      console.log("DEBUG: Setting found:", setting ? "YES" : "NO");
      if (setting) {
        setting.value = mode;
        await setting.save();
      } else {
        await SystemSettings.create({ key: 'MODERATION_MODE', value: mode });
      }

      res.json({ success: true, message: "Mode updated", mode });
    } catch (error) {
      console.error("DEBUG: Update mode error:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Bulk Approve All Pending
  static async bulkApprove(req, res) {
    try {
      const [updatedCount] = await Comment.update(
        { status: 'APPROVED' },
        { where: { status: 'PENDING', is_deleted: 0 } }
      );
      res.json({ success: true, message: "All pending comments approved", data: { processed: updatedCount } });
    } catch (error) {
      console.error("Bulk approve error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Bulk Reject All Pending
  static async bulkReject(req, res) {
    try {
      const [updatedCount] = await Comment.update(
        { status: 'REJECTED' },
        { where: { status: 'PENDING', is_deleted: 0 } }
      );
      res.json({ success: true, message: "All pending comments rejected", data: { processed: updatedCount } });
    } catch (error) {
      console.error("Bulk reject error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Get Sentiment Stats
  static async getSentimentStats(req, res) {
    try {
      const { bookId } = req.query;
      const where = { is_deleted: 0 };
      if (bookId) where.book_id = bookId;

      const stats = await Comment.findAll({
        where,
        attributes: [
          'sentiment',
          [Comment.sequelize.fn('COUNT', Comment.sequelize.col('sentiment')), 'count']
        ],
        group: ['sentiment']
      });

      const formattedStats = {
        POSITIVE: 0,
        NEUTRAL: 0,
        NEGATIVE: 0,
        UNKNOWN: 0
      };

      stats.forEach(s => {
        const sentiment = s.get('sentiment');
        const count = parseInt(s.get('count'));
        if (sentiment && formattedStats[sentiment] !== undefined) {
          formattedStats[sentiment] = count;
        } else {
          formattedStats.UNKNOWN += count;
        }
      });

      res.json({ success: true, data: formattedStats });

    } catch (error) {
      console.error("Get sentiment stats error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Bulk Classify Sentiment (for comments with null sentiment)
  static async bulkClassifySentiment(req, res) {
    try {
      // Find all comments where sentiment is NULL (and not deleted)
      const unclassifiedComments = await Comment.findAll({
        where: { is_deleted: 0, sentiment: null }
      });

      if (unclassifiedComments.length === 0) {
        return res.json({ success: true, message: "No unclassified comments found", data: { processed: 0 } });
      }

      let processedCount = 0;
      const BATCH_SIZE = 3;

      for (let i = 0; i < unclassifiedComments.length; i += BATCH_SIZE) {
        const batch = unclassifiedComments.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (comment) => {
          try {
            // Re-use checkSpam service which returns sentiment
            const analysis = await checkSpam(comment.content, comment.rating);
            if (analysis.sentiment) {
              comment.sentiment = analysis.sentiment;
              await comment.save();
              processedCount++;
            }
          } catch (err) {
            console.error(`[BulkClassify] Error processing comment ${comment.comment_id}:`, err);
          }
        });
        await Promise.all(batchPromises);
      }

      res.json({ success: true, message: "Bulk classification completed", data: { processed: processedCount } });

    } catch (error) {
      console.error("Bulk classify error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Get Books that have comments (for Admin Analytics)
  static async getBooksWithComments(req, res) {
    try {
      const { limit = 100 } = req.query;

      // Find books that have at least one non-deleted comment
      const books = await Book.findAll({
        attributes: [
          'id',
          'title',
          ['image_url', 'cover_image'],
          [sequelize.fn('COUNT', sequelize.col('comments.comment_id')), 'commentCount']
        ],
        include: [{
          model: Comment,
          as: 'comments',
          attributes: [],
          where: { is_deleted: 0 },
          required: true // Inner join ensures only books with comments are returned
        }],
        group: ['id', 'title', 'image_url'],
        limit: parseInt(limit),
        order: [[sequelize.literal('"commentCount"'), 'DESC']],
        subQuery: false
      });

      // Map response to match standard book structure if needed, or return as is
      // Frontend expects: id, title (book_title in model?), cover_image
      // Model Book defines 'book_title' as 'title' field? Let's check model.
      // Checking Book model usage in Line 311: attributes: ["id", "title"]. 
      // Wait, is Book model using 'title' or 'book_title'?
      // Line 354: attributes: ["id", "title"].
      // So I should select 'title'.

      // Re-doing query to match likely schema 'title'

      res.json({
        success: true,
        data: books
      });

    } catch (error) {
      console.error("Get books with comments error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}


export default CommentController;
