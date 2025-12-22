import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Subscription = sequelize.define(
  "Subscription",
  {
    subscription_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "subscription_id",
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    package_details: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "start_date",
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expiry_date",
    },
    payment_transaction_id: {
      type: DataTypes.STRING(255),
      field: "payment_transaction_id",
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "EXPIRED", "CANCELLED"),
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "subscriptions",
    timestamps: false,
    underscored: true,
  }
);

export default Subscription;
