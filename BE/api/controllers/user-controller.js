import UserModel, { User } from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";
class UserController {
  // Lấy thông tin profile của user hiện tại
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId; // Lấy từ token đã decode

      // 1. Lấy thông tin User cơ bản
      // Sử dụng raw: true (hoặc user.get({ plain: true }) nếu dùng instance) để dễ gán thuộc tính
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password_hash", "refresh_token"] },
        raw: true
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      let packageDetails = null;

      if (user.tier === 'PREMIUM') {
        const activeSub = await Subscription.findOne({
          where: {
            user_id: userId,
            status: 'ACTIVE'
          },
          order: [['expiry_date', 'DESC']], // Lấy gói mới nhất
          raw: true
        });

        if (activeSub) {
          packageDetails = activeSub.package_details;
        }
      }

      // 3. Gán vào object user trả về
      user.package_details = packageDetails;

      // 4. Trả về Frontend
      res.status(200).json({
        success: true,
        data: user, // User lúc này đã có tier và package_details đầy đủ
      });

    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Cập nhật profile của user hiện tại
  static async updateProfile(req, res) {
    try {
      const { fullName, email } = req.body;
      const userId = req.user.userId;

      // Validate input
      if (!fullName && !email) {
        return res.status(400).json({
          success: false,
          message: "At least one field (fullName or email) is required",
        });
      }

      // Kiểm tra email đã tồn tại (nếu có thay đổi email)
      if (email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser && existingUser.user_id !== userId) {
          return res.status(409).json({
            success: false,
            message: "Email already in use",
          });
        }
      }

      const updatedUser = await UserModel.update(userId, { fullName, email });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Đổi mật khẩu
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      // Lấy thông tin user với password hash
      const user = await UserModel.findByEmail(
        (
          await UserModel.findById(userId)
        ).email
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isPasswordValid = await UserModel.comparePassword(
        currentPassword,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      const success = await UserModel.updatePassword(userId, newPassword);

      if (!success) {
        return res.status(500).json({
          success: false,
          message: "Failed to update password",
        });
      }

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Xóa tài khoản (optional)
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.userId;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required to delete account",
        });
      }

      // Verify password trước khi xóa
      const user = await UserModel.findByEmail(
        (
          await UserModel.findById(userId)
        ).email
      );

      const isPasswordValid = await UserModel.comparePassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }

      const deleted = await UserModel.delete(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Admin: Lấy danh sách users
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, tier, q } = req.query;

      const result = await UserModel.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        tier,
        q
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Admin: Lấy thông tin user theo ID
  static async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Admin: Tìm kiếm users
  static async searchUsers(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Search query must be at least 2 characters",
        });
      }

      const users = await UserModel.search(q.trim());

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Admin: Xóa user
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Không cho phép admin tự xóa chính mình
      if (userId === req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      const deleted = await UserModel.delete(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Admin: Cập nhật user (role, tier)
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { role, tier, fullName } = req.body;

      // Không cho phép admin tự hạ quyền chính mình
      if (userId === req.user.userId && role && role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "You cannot demote your own account",
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Import User sequelize model to do raw update
      const { User } = await import("../models/user-model.js");
      const userInstance = await User.findByPk(userId);

      if (role && ["USER", "ADMIN"].includes(role)) {
        userInstance.role = role;
      }
      if (tier && ["FREE", "PREMIUM"].includes(tier)) {
        userInstance.tier = tier;
      }
      if (fullName) {
        userInstance.full_name = fullName;
      }

      // Handle password reset by Admin
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
          });
        }
        await UserModel.updatePassword(userId, req.body.password);
      }

      await userInstance.save();

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: { user: userInstance.toJSON() },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
  // Admin: Tạo user mới
  static async createUser(req, res) {
    try {
      const { email, password, fullName, role, tier } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Check if email exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      const newUser = await UserModel.create({
        email,
        password,
        fullName,
        role: role || "USER",
        tier: tier || "FREE",
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: { user: newUser },
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
}

export default UserController;
