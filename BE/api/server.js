import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import "./models/index.js";
import sequelize from "./config/db-config.js";
import authRoutes from "./routes/auth-route.js";
import userRoutes from "./routes/user-route.js";
import bookRoutes from "./routes/book-route.js";
import subjectRoutes from "./routes/subject-route.js";
import authorRoutes from "./routes/author-route.js";
import commentRoutes from "./routes/comment-route.js";
import bookshelfRoutes from "./routes/bookshelf-route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_SYNC = process.env.DB_SYNC || "alter"; // options: 'alter' | 'force' | 'none'

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/bookshelf", bookshelfRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      message: "Server is running",
      database: "Connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Server is running but database is disconnected",
      database: "Disconnected",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models to database (create/update tables)
    if (DB_SYNC !== "none") {
      const syncOptions = DB_SYNC === "force" ? { force: true } : { alter: true };
      await sequelize.sync(syncOptions);
      console.log(
        `Sequelize sync completed with option: ${DB_SYNC} (${JSON.stringify(syncOptions)})`
      );
    } else {
      console.log("Sequelize sync skipped (DB_SYNC=none).");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
