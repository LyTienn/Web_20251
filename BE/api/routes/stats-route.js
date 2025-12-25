import express from "express";
import StatsController from "../controllers/stats-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// All stats routes require admin authentication
router.use(authenticate, authorizeRoles("ADMIN"));

// GET /api/admin/stats - Dashboard overview
router.get("/", StatsController.getDashboardStats);

// GET /api/admin/stats/registrations - User registration trend
router.get("/registrations", StatsController.getUserRegistrationStats);

// GET /api/admin/stats/books-by-subject - Books distribution by subject
router.get("/books-by-subject", StatsController.getBooksBySubject);

// GET /api/admin/stats/recent-users - Recent registered users
router.get("/recent-users", StatsController.getRecentUsers);

// GET /api/admin/stats/recent-comments - Recent comments
router.get("/recent-comments", StatsController.getRecentComments);

// GET /api/admin/stats/top-books - Top books by download
router.get("/top-books", StatsController.getTopBooks);

// GET /api/admin/stats/user-tiers - User tier distribution
router.get("/user-tiers", StatsController.getUserTierStats);

export default router;
