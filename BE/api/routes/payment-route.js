import express from "express";
import PaymentController from "../controllers/payment-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Tạo URL thanh toán
router.post(
  "/create-payment-url",
  authenticate,
  [
    body("package_details")
      .isIn(["3_THANG", "6_THANG", "12_THANG"])
      .withMessage("Invalid package"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
  ],
  PaymentController.createPaymentUrl
);

// VNPay callback
router.get("/vnpay-return", PaymentController.vnpayReturn);
// router.get("/vnpay-ipn", PaymentController.vnpayIPN);

export default router;
