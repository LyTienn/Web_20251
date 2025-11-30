import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(-1);
  }
};

testConnection();

export default sequelize;
