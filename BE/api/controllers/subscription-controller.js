import Subscription from "../models/subscription-model.js";

import { Op } from "sequelize";

class SubscriptionController {



    // Create Subscription
    static async createSubscription(req, res) {
        try {
            const userId = req.user.userId;
            const { packageDetails, txnId, startDate, expiryDate } = req.body;

            const subscription = await Subscription.create({
                user_id: userId,
                package_details: packageDetails || 'Premium',
                payment_transaction_id: txnId,
                start_date: startDate || new Date(),
                expiry_date: expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                status: 'ACTIVE'
            });

            res.status(201).json({ success: true, data: subscription });
        } catch (error) {
            console.error("Create subscription error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    // Get Current User Subscription
    static async getUserSubscription(req, res) {
        try {
            const userId = req.user.userId;
            const subscription = await Subscription.findOne({
                where: { user_id: userId, status: 'ACTIVE' },
                order: [['expiry_date', 'DESC']]
            });
            res.status(200).json({ success: true, data: subscription });
        } catch (error) {
            console.error("Get user subscription error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    // Cancel Subscription
    static async cancelSubscription(req, res) {
        try {
            const userId = req.user.userId;
            const { subscriptionId } = req.params;
            const subscription = await Subscription.findOne({
                where: { subscription_id: subscriptionId, user_id: userId }
            });

            if (!subscription) {
                return res.status(404).json({ success: false, message: "Subscription not found" });
            }

            subscription.status = 'CANCELLED';
            await subscription.save();

            res.status(200).json({ success: true, message: "Subscription cancelled", data: subscription });
        } catch (error) {
            console.error("Cancel subscription error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    // Admin: Get all subscriptions
    static async adminGetAllSubscriptions(req, res) {
        try {
            const { status, userId, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;
            if (userId) where.user_id = userId;

            const { count, rows } = await Subscription.findAndCountAll({
                where,
                include: [{
                    model: (await import("../models/user-model.js")).User,
                    as: 'user',
                    attributes: ['full_name', 'email']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['start_date', 'DESC']]
            });

            res.status(200).json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            console.error("Admin get subscriptions error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    // Admin: Update subscription
    static async adminUpdateSubscription(req, res) {
        try {
            const { subscriptionId } = req.params;
            const { status, expiryDate } = req.body;

            const subscription = await Subscription.findByPk(subscriptionId);
            if (!subscription) {
                return res.status(404).json({ success: false, message: "Subscription not found" });
            }

            if (status) subscription.status = status;
            if (expiryDate) subscription.expiry_date = expiryDate;

            await subscription.save();

            res.status(200).json({
                success: true,
                message: "Subscription updated successfully",
                data: subscription
            });

        } catch (error) {
            console.error("Admin update subscription error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
}

export default SubscriptionController;
