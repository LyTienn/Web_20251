import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";
import bcrypt from "bcryptjs";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "user_id",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: "users_email_key",
        msg: "Email already exists",
      },
      validate: {
        isEmail: {
          msg: "Must be a valid email address",
        },
      },
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "password_hash",
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "full_name",
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "refresh_token",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "users",
    timestamps: false,
    underscored: true,
  }
);

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password_hash;
  delete values.refresh_token;
  return values;
};

class UserModel {
  static async create({ email, password, fullName, role = "USER" }) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
    });

    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
    };
  }

  static async findByEmail(email) {
    return await User.findOne({
      where: { email },
      raw: true,
    });
  }

  static async findById(userId) {
    return await User.findByPk(userId, {
      attributes: ["user_id", "email", "full_name", "role", "created_at"],
      raw: true,
    });
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Lưu refresh token
  static async saveRefreshToken(userId, refreshToken) {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }
    user.refresh_token = refreshToken;
    await user.save();
    return true;
  }

  // Xóa refresh token (logout)
  static async clearRefreshToken(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }
    user.refresh_token = null;
    await user.save();
    return true;
  }

  // Kiểm tra refresh token
  static async findByRefreshToken(refreshToken) {
    return await User.findOne({
      where: { refresh_token: refreshToken },
      raw: true,
    });
  }

  static async update(userId, updates) {
    const user = await User.findByPk(userId);

    if (!user) {
      return null;
    }

    if (updates.fullName !== undefined) {
      user.full_name = updates.fullName;
    }
    if (updates.email !== undefined) {
      user.email = updates.email;
    }

    await user.save();

    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
    };
  }

  static async updatePassword(userId, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return false;
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.password_hash = passwordHash;
      await user.save();

      return true;
    } catch (error) {
      console.error("Update password error:", error);
      return false;
    }
  }

  static async delete(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }
    await user.destroy();
    return true;
  }

  static async count(conditions = {}) {
    return await User.count({ where: conditions });
  }

  static async findAll({ page = 1, limit = 10, role = null }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ["user_id", "email", "full_name", "role", "created_at"],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      users: rows,
    };
  }

  static async search(searchTerm) {
    const { Op } = await import("sequelize");

    return await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${searchTerm}%` } },
          { full_name: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      attributes: ["user_id", "email", "full_name", "role", "created_at"],
      limit: 10,
    });
  }
}

export default UserModel;
export { User };
