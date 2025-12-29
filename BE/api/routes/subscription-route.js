import express from "express";
import SubscriptionController from "../controllers/subscription-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// User Routes
router.post("/", authenticate, SubscriptionController.createSubscription);
router.get("/current", authenticate, SubscriptionController.getUserSubscription);
router.put("/:subscriptionId/cancel", authenticate, SubscriptionController.cancelSubscription);

// Admin Routes
router.get("/admin/all", authenticate, authorizeRoles("ADMIN"), SubscriptionController.adminGetAllSubscriptions);
router.put("/admin/:subscriptionId", authenticate, authorizeRoles("ADMIN"), SubscriptionController.adminUpdateSubscription);

export default router;
