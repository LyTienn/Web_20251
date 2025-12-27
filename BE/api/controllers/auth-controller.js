import UserModel from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt-utils.js";

class AuthController {
  // Helper function để set cookies
  static setCookies(res, accessToken, refreshToken) {
    // Access Token cookie - short lived
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 60 minutes
    });

    // Refresh Token cookie - long lived
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  // Đăng ký
  static async register(req, res) {
    try {
      const { email, password, fullName } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      const newUser = await UserModel.create({ email, password, fullName });

      // Generate tokens
      const accessToken = generateAccessToken(
        newUser.user_id,
        newUser.email,
        newUser.role
      );
      const refreshToken = generateRefreshToken(newUser.user_id);

      // Lưu refresh token vào database
      await UserModel.saveRefreshToken(newUser.user_id, refreshToken);

      // Set cookies
      AuthController.setCookies(res, accessToken, refreshToken);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            userId: newUser.user_id,
            email: newUser.email,
            fullName: newUser.full_name,
            role: newUser.role,
          },
        },
      });
    } catch (error) {
      console.error("Register error:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error during registration",
      });
    }
  }

  // Đăng nhập
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await UserModel.comparePassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken(
        user.user_id,
        user.email,
        user.role
      );
      const refreshToken = generateRefreshToken(user.user_id);

      // Lưu refresh token vào database
      await UserModel.saveRefreshToken(user.user_id, refreshToken);

      // Set cookies
      AuthController.setCookies(res, accessToken, refreshToken);

      let packageDetails = null;
      if (user.tier === 'PREMIUM') {
          const activeSub = await Subscription.findOne({
              where: { 
                  user_id: user.user_id, 
                  status: 'ACTIVE' 
              },
              order: [['expiry_date', 'DESC']], 
              raw: true 
          });

          if (activeSub) {
              packageDetails = activeSub.package_details;
          }
      }

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            tier: user.tier,
            package_details: packageDetails,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token not found",
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Kiểm tra refresh token trong database
      const user = await UserModel.findByRefreshToken(refreshToken);
      if (!user || user.user_id !== decoded.userId) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(
        user.user_id,
        user.email,
        user.role
      );

      // Set new access token cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Đăng xuất
  static async logout(req, res) {
    try {
      const userId = req.user?.userId;

      if (userId) {
        // Xóa refresh token từ database
        await UserModel.clearRefreshToken(userId);
      }

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Verify email (optional - for future implementation)
  static async verifyEmail(req, res) {
    // TODO: Implement email verification
    res.status(501).json({
      success: false,
      message: "Email verification not implemented yet",
    });
  }

  // Forgot password (optional - for future implementation)
  static async forgotPassword(req, res) {
    // TODO: Implement forgot password
    res.status(501).json({
      success: false,
      message: "Forgot password not implemented yet",
    });
  }

  // Reset password (optional - for future implementation)
  static async resetPassword(req, res) {
    // TODO: Implement reset password
    res.status(501).json({
      success: false,
      message: "Reset password not implemented yet",
    });
  }
}

export default AuthController;
