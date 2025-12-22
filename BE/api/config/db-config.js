import { Sequelize } from "sequelize";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const {
  DATABASE_URL,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  NODE_ENV,
} = process.env;

// Build database URL from discrete envs if not provided
let databaseUrl = DATABASE_URL;
if (!databaseUrl && DB_NAME && DB_USER && DB_PASS && DB_HOST && DB_PORT) {
  databaseUrl = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

// Ensure database exists when discrete envs are provided
const ensureDatabaseExists = async () => {
  if (!DB_NAME || !DB_USER || !DB_PASS || !DB_HOST || !DB_PORT) {
    // Not enough info to attempt creation; skip
    return;
  }

  const adminClient = new Client({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASS,
    database: "postgres", // connect to default maintenance DB
  });

  try {
    await adminClient.connect();
    const { rows } = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_NAME]
    );
    if (rows.length === 0) {
      await adminClient.query(
        `CREATE DATABASE "${DB_NAME}" WITH ENCODING 'UTF8' TEMPLATE template0`
      );
      console.log(`Database '${DB_NAME}' created successfully.`);
    }
  } catch (error) {
    console.error("❌ Failed to ensure database exists:", error);
  } finally {
    await adminClient.end().catch(() => {});
  }
};

// Try to ensure DB exists before initializing Sequelize
await ensureDatabaseExists();

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions:
    NODE_ENV === "production"
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
