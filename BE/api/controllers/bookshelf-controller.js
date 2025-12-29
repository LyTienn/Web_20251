import UserBookshelf from "../models/user-bookshelf-model.js";
import Book from "../models/book-model.js";
import Author from "../models/author-model.js";
import Subject from "../models/subject-model.js";
import { Op } from "sequelize";

class BookshelfController {
  // Thêm sách vào bookshelf
  static async addToBookshelf(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.params;
      const { status } = req.body; // 'FAVORITE' hoặc 'READING'

      // Validate status
      if (!["FAVORITE", "READING"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either FAVORITE or READING",
        });
      }

      // Kiểm tra sách có tồn tại không
      const book = await Book.findByPk(bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      // Find or Create the row
      const [item, created] = await UserBookshelf.findOrCreate({
        where: { user_id: userId, book_id: bookId },
        defaults: {
          is_favorite: status === 'FAVORITE',
          is_reading: status === 'READING',
          added_at: new Date()
        }
      });

      if (!created) {
        // Row exists, update the specific flag
        if (status === 'FAVORITE') {
          if (item.is_favorite) {
            return res.status(409).json({ success: false, message: "Book already in favorite list" });
          }
          item.is_favorite = true;
        } else if (status === 'READING') {
          if (item.is_reading) {
            return res.status(409).json({ success: false, message: "Book already in reading list" });
          }
          item.is_reading = true;
          // Ensure we initialize tracking info if it wasn't there? (e.g. if it was only favorite before)
          // But defaults should handle it or it stays null until saveReadingProgress is called.
        }
        await item.save();
      }

      res.status(201).json({
        success: true,
        message: `Book added to ${status.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error("Add to bookshelf error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Lấy bookshelf của user
  static async getUserBookshelf(req, res) {
    try {
      const userId = req.user.userId;
      const { status } = req.query; // optional filter

      const where = { user_id: userId };

      if (status === 'FAVORITE') {
        where.is_favorite = true;
      } else if (status === 'READING') {
        where.is_reading = true;
      } else {
        // If no status, get items that are EITHER favorite OR reading
        where[Op.or] = [
          { is_favorite: true },
          { is_reading: true }
        ];
      }

      const bookshelfItems = await UserBookshelf.findAll({
        where,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "image_url", "summary", "type"],
            include: [
              {
                model: Author,
                as: "author",
                attributes: ["name"],
              },
              {
                model: Subject,
                as: "subjects",
                attributes: ["name"],
                through: { attributes: [] },
              },
            ],
          },
        ],
        order: [["added_at", "DESC"]],
      });

      // Group manually to match API response format
      const grouped = {
        FAVORITE: [],
        READING: [],
      };

      bookshelfItems.forEach((item) => {
        if (item.is_favorite) {
          grouped.FAVORITE.push({
            ...item.book.toJSON(),
            addedAt: item.added_at,
          });
        }
        if (item.is_reading) {
          grouped.READING.push({
            ...item.book.toJSON(),
            addedAt: item.added_at,
          });
        }
      });

      // If filtering by status, we might only want to return that specific list in the structure roughly
      // But the original API returned { favorites: [], reading: [] } regardless of filter maybe?
      // Actually previous impl filtered the DB rows, then grouped. So if filtered by FAVORITE, READING list was empty.

      res.status(200).json({
        success: true,
        data: {
          favorites: grouped.FAVORITE,
          reading: grouped.READING,
          total: bookshelfItems.length, // Total unique books
        },
      });
    } catch (error) {
      console.error("Get user bookshelf error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Admin: Lấy bookshelf theo userId (favorites + reading)
  static async getBookshelfByUserId(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.query; // optional filter

      const where = { user_id: userId };
      if (status === 'FAVORITE') {
        where.is_favorite = true;
      } else if (status === 'READING') {
        where.is_reading = true;
      } else {
        where[Op.or] = [
          { is_favorite: true },
          { is_reading: true }
        ];
      }

      const bookshelfItems = await UserBookshelf.findAll({
        where,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "image_url", "summary", "type"],
            include: [
              {
                model: Author,
                as: "author",
                attributes: ["name"],
              },
              {
                model: Subject,
                as: "subjects",
                attributes: ["name"],
                through: { attributes: [] },
              },
            ],
          },
        ],
        order: [["added_at", "DESC"]],
      });

      const grouped = {
        FAVORITE: [],
        READING: [],
      };

      bookshelfItems.forEach((item) => {
        if (item.is_favorite) {
          grouped.FAVORITE.push({
            ...item.book.toJSON(),
            addedAt: item.added_at,
          });
        }
        if (item.is_reading) {
          grouped.READING.push({
            ...item.book.toJSON(),
            addedAt: item.added_at,
          });
        }
      });

      res.status(200).json({
        success: true,
        data: {
          favorites: grouped.FAVORITE,
          reading: grouped.READING,
          total: bookshelfItems.length,
        },
      });
    } catch (error) {
      console.error("Admin get user bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Admin: Thêm sách vào bookshelf của user
  static async adminAddToBookshelf(req, res) {
    try {
      const { userId, bookId } = req.params;
      const { status } = req.body; // 'FAVORITE' hoặc 'READING'

      if (!["FAVORITE", "READING"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Status must be either FAVORITE or READING" });
      }

      const book = await Book.findByPk(bookId);
      if (!book) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      const [item, created] = await UserBookshelf.findOrCreate({
        where: { user_id: userId, book_id: bookId },
        defaults: {
          is_favorite: status === 'FAVORITE',
          is_reading: status === 'READING',
          added_at: new Date()
        }
      });

      if (!created) {
        if (status === 'FAVORITE') {
          if (item.is_favorite) {
            return res.status(409).json({ success: false, message: `Book already in ${status.toLowerCase()} list` });
          }
          item.is_favorite = true;
        } else if (status === 'READING') {
          if (item.is_reading) {
            return res.status(409).json({ success: false, message: `Book already in ${status.toLowerCase()} list` });
          }
          item.is_reading = true;
        }
        await item.save();
      }

      res
        .status(201)
        .json({ success: true, message: `Book added to ${status.toLowerCase()} successfully` });
    } catch (error) {
      console.error("Admin add to bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Admin: Xóa sách khỏi bookshelf của user
  static async adminRemoveFromBookshelf(req, res) {
    try {
      const { userId, bookId } = req.params;
      const { status } = req.query; // 'FAVORITE' hoặc 'READING'

      if (!status || !["FAVORITE", "READING"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Status query parameter is required (FAVORITE or READING)" });
      }

      const item = await UserBookshelf.findOne({
        where: { user_id: userId, book_id: bookId }
      });

      if (!item) {
        return res.status(404).json({ success: false, message: "Book not found in bookshelf" });
      }

      let updated = false;
      if (status === 'FAVORITE' && item.is_favorite) {
        item.is_favorite = false;
        updated = true;
      } else if (status === 'READING' && item.is_reading) {
        item.is_reading = false;
        updated = true;
      }

      if (updated) {
        // If both false, delete row? Or keep history?
        // Let's delete row to keep table clean if no relationship left.
        if (!item.is_favorite && !item.is_reading) {
          await item.destroy();
        } else {
          await item.save();
        }
        res
          .status(200)
          .json({ success: true, message: `Book removed from ${status.toLowerCase()} successfully` });
      } else {
        return res.status(404).json({ success: false, message: `Book not found in ${status.toLowerCase()} list` });
      }

    } catch (error) {
      console.error("Admin remove from bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Xóa sách khỏi bookshelf
  static async removeFromBookshelf(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.params;
      const { status } = req.query; // 'FAVORITE' hoặc 'READING'

      if (!status || !["FAVORITE", "READING"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status query parameter is required (FAVORITE or READING)",
        });
      }

      const item = await UserBookshelf.findOne({
        where: { user_id: userId, book_id: bookId }
      });

      if (!item) {
        return res.status(404).json({ success: false, message: "Book not found in your bookshelf" });
      }

      let updated = false;
      if (status === 'FAVORITE' && item.is_favorite) {
        item.is_favorite = false;
        updated = true;
      } else if (status === 'READING' && item.is_reading) {
        item.is_reading = false;
        updated = true;
      }

      if (updated) {
        if (!item.is_favorite && !item.is_reading) {
          await item.destroy();
        } else {
          await item.save();
        }
        res.status(200).json({
          success: true,
          message: `Book removed from ${status.toLowerCase()} successfully`,
        });
      } else {
        return res.status(404).json({ success: false, message: `Book not found in your ${status.toLowerCase()} list` });
      }

    } catch (error) {
      console.error("Remove from bookshelf error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Kiểm tra sách có trong bookshelf không
  static async checkBookInBookshelf(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.params;

      const item = await UserBookshelf.findOne({
        where: {
          user_id: userId,
          book_id: bookId,
        },
      });

      let statuses = [];
      if (item) {
        if (item.is_favorite) statuses.push("FAVORITE");
        if (item.is_reading) statuses.push("READING");
      }

      res.status(200).json({
        success: true,
        data: {
          inBookshelf: statuses.length > 0,
          statuses: statuses,
          isFavorite: item ? item.is_favorite : false,
          isReading: item ? item.is_reading : false,
        },
      });
    } catch (error) {
      console.error("Check book in bookshelf error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  //LƯU TIẾN ĐỘ ĐỌC (PUT)
  static async saveReadingProgress(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.params;
      const { chapterId, scrollPosition } = req.body;

      if (!chapterId) {
        return res.status(400).json({ success: false, message: "Chapter ID is required" });
      }

      // Find or Create
      // If saving progress, implicitly implies status should include READING?
      // Logic: Typically logic implies adding to reading list implicitly if you read it.

      const [item, created] = await UserBookshelf.findOrCreate({
        where: { user_id: userId, book_id: bookId },
        defaults: {
          is_reading: true, // Implicitly add to reading
          is_favorite: false,
          added_at: new Date(),
          last_read_chapter_id: chapterId,
          last_read_scroll_position: scrollPosition !== undefined ? scrollPosition : 0,
          last_read_at: new Date()
        }
      });

      // Update logic
      item.last_read_chapter_id = chapterId;
      if (scrollPosition !== undefined) {
        item.last_read_scroll_position = scrollPosition;
      }
      item.last_read_at = new Date();
      if (!item.is_reading) {
        item.is_reading = true; // Implicitly mark as reading
      }

      await item.save();

      return res.status(200).json({
        success: true,
        message: "Progress saved successfully"
      });

    } catch (error) {
      console.error("Save progress error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  //LẤY TIẾN ĐỘ ĐỌC (GET)
  static async getReadingProgress(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.params;

      const item = await UserBookshelf.findOne({
        where: {
          user_id: userId,
          book_id: bookId,
          // Removed status: 'READING' check to allow getting progress even if not explicitly in "list" 
          // (though saving it adds it to list, so practically same)
        },
        attributes: ['last_read_chapter_id', 'last_read_at']
      });

      if (!item || !item.last_read_chapter_id) {
        return res.status(200).json({
          success: true,
          data: { lastChapterId: null }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          lastChapterId: item.last_read_chapter_id,
          lastReadAt: item.last_read_at
        }
      });

    } catch (error) {
      console.error("Get progress error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default BookshelfController;
