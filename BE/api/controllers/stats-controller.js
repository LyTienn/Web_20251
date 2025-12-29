import { User } from "../models/user-model.js";
import Book from "../models/book-model.js";
import Comment from "../models/comment-model.js";
import Subject from "../models/subject-model.js";
import Author from "../models/author-model.js";
import sequelize from "../config/db-config.js";
import { Op, fn, col, literal } from "sequelize";

class StatsController {
  // Get dashboard overview stats
  static async getDashboardStats(req, res) {
    try {
      // Total users (không bị xóa)
      const totalUsers = await User.count({
        where: { is_deleted: 0 }
      });

      // Total books
      const totalBooks = await Book.count();

      // Total comments
      const totalComments = await Comment.count();

      // Users registered in last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const newUsers24h = await User.count({
        where: {
          is_deleted: 0,
          created_at: {
            [Op.gte]: yesterday
          }
        }
      });

      // Users registered in last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const newUsersWeek = await User.count({
        where: {
          is_deleted: 0,
          created_at: {
            [Op.gte]: lastWeek
          }
        }
      });

      // Premium users
      const premiumUsers = await User.count({
        where: {
          is_deleted: 0,
          tier: "PREMIUM"
        }
      });

      // Books by type
      const freeBooks = await Book.count({
        where: { type: "FREE" }
      });
      const premiumBooks = await Book.count({
        where: { type: "PREMIUM" }
      });

      // Total authors
      const totalAuthors = await Author.count();

      // Total subjects
      const totalSubjects = await Subject.count();

      res.status(200).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            newLast24h: newUsers24h,
            newLastWeek: newUsersWeek,
            premium: premiumUsers,
            free: totalUsers - premiumUsers
          },
          books: {
            total: totalBooks,
            free: freeBooks,
            premium: premiumBooks
          },
          comments: {
            total: totalComments
          },
          authors: {
            total: totalAuthors
          },
          subjects: {
            total: totalSubjects
          }
        }
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get user registration stats by period
  static async getUserRegistrationStats(req, res) {
    try {
      const { period = "30" } = req.query; // days
      const days = parseInt(period) || 30;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get daily registration count
      const registrations = await User.findAll({
        attributes: [
          [fn('DATE', col('created_at')), 'date'],
          [fn('COUNT', col('user_id')), 'count']
        ],
        where: {
          is_deleted: 0,
          created_at: {
            [Op.gte]: startDate
          }
        },
        group: [fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'ASC']],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          period: days,
          registrations
        }
      });
    } catch (error) {
      console.error("Get user registration stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get books by subject distribution
  static async getBooksBySubject(req, res) {
    try {
      const stats = await sequelize.query(`
        SELECT s.name, COUNT(bs.book_id) as count
        FROM subjects s
        LEFT JOIN book_subjects bs ON s.id = bs.subject_id
        GROUP BY s.id, s.name
        ORDER BY count DESC
        LIMIT 10
      `, { type: sequelize.QueryTypes.SELECT });

      const total = stats.reduce((sum, s) => sum + parseInt(s.count || 0), 0);

      const distribution = stats.map(s => ({
        name: s.name,
        count: parseInt(s.count || 0),
        percent: total > 0 ? Math.round((parseInt(s.count || 0) / total) * 100) : 0
      }));

      res.status(200).json({
        success: true,
        data: {
          total,
          distribution
        }
      });
    } catch (error) {
      console.error("Get books by subject error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get recent users
  static async getRecentUsers(req, res) {
    try {
      const { limit = 5 } = req.query;

      const users = await User.findAll({
        where: { is_deleted: 0 },
        attributes: ["user_id", "email", "full_name", "role", "tier", "created_at"],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        raw: true
      });

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error) {
      console.error("Get recent users error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get recent comments
  static async getRecentComments(req, res) {
    try {
      const { limit = 5 } = req.query;

      const comments = await sequelize.query(`
        SELECT 
          c.comment_id,
          c.content,
          c.rating,
          c.created_at,
          u.full_name as user_name,
          u.email as user_email,
          b.title as book_title
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        JOIN books b ON c.book_id = b.id
        WHERE u.is_deleted = 0
        ORDER BY c.created_at DESC
        LIMIT :limit
      `, {
        replacements: { limit: parseInt(limit) },
        type: sequelize.QueryTypes.SELECT
      });

      res.status(200).json({
        success: true,
        data: { comments }
      });
    } catch (error) {
      console.error("Get recent comments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get top books by download/popularity
  static async getTopBooks(req, res) {
    try {
      const { limit = 10 } = req.query;

      const books = await Book.findAll({
        attributes: ["id", "title", "image_url", "download_count", "type"],
        order: [["download_count", "DESC"]],
        limit: parseInt(limit),
        raw: true
      });

      res.status(200).json({
        success: true,
        data: { books }
      });
    } catch (error) {
      console.error("Get top books error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get user tier distribution
  static async getUserTierStats(req, res) {
    try {
      const freeUsers = await User.count({
        where: { is_deleted: 0, tier: "FREE" }
      });

      const premiumUsers = await User.count({
        where: { is_deleted: 0, tier: "PREMIUM" }
      });

      const total = freeUsers + premiumUsers;

      res.status(200).json({
        success: true,
        data: {
          total,
          free: {
            count: freeUsers,
            percent: total > 0 ? Math.round((freeUsers / total) * 100) : 0
          },
          premium: {
            count: premiumUsers,
            percent: total > 0 ? Math.round((premiumUsers / total) * 100) : 0
          }
        }
      });
    } catch (error) {
      console.error("Get user tier stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  // Get public stats for homepage (no auth required)
  static async getPublicStats(req, res) {
    try {
      // Total users
      const totalUsers = await User.count({
        where: { is_deleted: 0 }
      });

      // Total books
      const totalBooks = await Book.count();

      // Total authors
      const totalAuthors = await Author.count();

      // Average rating from comments
      const avgRatingResult = await Comment.findOne({
        attributes: [
          [fn('AVG', col('rating')), 'avgRating'],
          [fn('COUNT', col('comment_id')), 'totalReviews']
        ],
        where: {
          status: 'APPROVED'
        },
        raw: true
      });

      const avgRating = avgRatingResult?.avgRating
        ? parseFloat(avgRatingResult.avgRating).toFixed(1)
        : "4.5";
      const totalReviews = avgRatingResult?.totalReviews || 0;

      // Total downloads/reads (sum of download_count from books)
      const downloadResult = await Book.findOne({
        attributes: [
          [fn('SUM', col('download_count')), 'totalDownloads']
        ],
        raw: true
      });

      const totalDownloads = downloadResult?.totalDownloads || 0;

      res.status(200).json({
        success: true,
        data: {
          books: totalBooks,
          users: totalUsers,
          authors: totalAuthors,
          avgRating: avgRating,
          totalReviews: totalReviews,
          totalReads: totalDownloads
        }
      });
    } catch (error) {
      console.error("Get public stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
}

export default StatsController;
