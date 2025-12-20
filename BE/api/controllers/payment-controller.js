import crypto from "crypto";
import { User } from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";

class PaymentController {
  static sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    keys.forEach((key) => {
      sorted[key] = obj[key];
    });

    return sorted;
  }

  static getVNPayMessage(responseCode) {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      75: "Ngân hàng thanh toán đang bảo trì",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      99: "Các lỗi khác",
    };

    return messages[responseCode] || "Lỗi không xác định";
  }

  static async createPaymentUrl(req, res) {
    try {
      const { package_details, amount } = req.body;
      const userId = req.user.userId;

      // VNPay config
      const vnp_TmnCode = process.env.VNP_TMN_CODE;
      const vnp_HashSecret = process.env.VNP_HASH_SECRET;
      const vnp_Url = process.env.VNP_URL;
      const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

      if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
        return res.status(500).json({
          success: false,
          message: "VNPay environment variables missing",
        });
      }

      if (!package_details || !amount) {
        return res.status(400).json({
          success: false,
          message: "Missing package_details or amount",
        });
      }

      // Validate amount
      const amountNumber = Number(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount",
        });
      }

      // Order ID
      const orderId = Date.now().toString();

      // IP Address (fix IPv6)
      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        "127.0.0.1";

      if (ipAddr.includes("::ffff:")) {
        ipAddr = ipAddr.replace("::ffff:", "");
      }
      ipAddr = ipAddr.split(",")[0].trim();

      // Create date: yyyyMMddHHmmss
      const date = new Date();
      const createDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
        String(date.getSeconds()).padStart(2, "0"),
      ].join("");

      let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: vnp_TmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan goi ${package_details}`,
        vnp_OrderType: "other",
        vnp_Amount: Math.floor(amountNumber * 100),
        vnp_ReturnUrl: vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

    //   if (vnp_IpnUrl) {
    //     vnp_Params.vnp_IpnUrl = vnp_IpnUrl;
    //   }

      vnp_Params = PaymentController.sortObject(vnp_Params);

      const signData = new URLSearchParams(vnp_Params).toString();
      const hmac = crypto.createHmac("sha512", vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      vnp_Params["vnp_SecureHash"] = signed;

      const paymentUrl =
        vnp_Url + "?" + new URLSearchParams(vnp_Params).toString();

      // Save subscription (PENDING)
      await Subscription.create({
        user_id: userId,
        package_details,
        start_date: new Date(),
        expiry_date: PaymentController.calculateExpiryDate(package_details),
        payment_transaction_id: orderId,
        status: "PENDING",
      });

      console.log("✅ Created payment URL for order:", orderId);

      return res.status(200).json({
        success: true,
        data: { paymentUrl },
      });
    } catch (error) {
      console.error("❌ Create payment error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  static async vnpayReturn(req, res) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params["vnp_SecureHash"];

      // Remove hash từ params trước khi verify
      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      // Sort params
      vnp_Params = PaymentController.sortObject(vnp_Params);

      // Tạo chữ ký để verify
      const signData = new URLSearchParams(vnp_Params).toString();
      const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      console.log("🔐 VNPay Callback - Received Hash:", secureHash);
      console.log("🔐 VNPay Callback - Calculated Hash:", signed);

      // Kiểm tra chữ ký
      if (secureHash !== signed) {
        console.error("❌ Invalid signature");
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/failed?reason=invalid_signature`
        );
      }

      const orderId = vnp_Params["vnp_TxnRef"];
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const transactionNo = vnp_Params["vnp_TransactionNo"];
      const bankCode = vnp_Params["vnp_BankCode"];
      const amount = vnp_Params["vnp_Amount"];

      console.log("📋 Order ID:", orderId);
      console.log("📋 Response Code:", responseCode);
      console.log("📋 Transaction No:", transactionNo);
      console.log("📋 Bank:", bankCode);

      // Tìm subscription
      const subscription = await Subscription.findOne({
        where: { payment_transaction_id: orderId },
      });

      if (!subscription) {
        console.error("❌ Subscription not found:", orderId);
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/failed?reason=order_not_found`
        );
      }

      //  Kiểm tra đã xử lý chưa (idempotency)
      if (subscription.status === "ACTIVE") {
        console.log("⚠️ Order already processed:", orderId);
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/success?already_processed=true`
        );
      }

      if (subscription.status === "CANCELLED") {
        console.log("⚠️ Order already cancelled:", orderId);
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/failed?reason=already_cancelled`
        );
      }

      if (responseCode === "00") {
        // ========== THANH TOÁN THÀNH CÔNG ==========
        subscription.status = "ACTIVE";
        await subscription.save();

        await User.update(
          { tier: "PREMIUM" },
          { where: { user_id: subscription.user_id } }
        );

        console.log("✅ Payment successful:", orderId);
        console.log("✅ User upgraded to PREMIUM:", subscription.user_id);

        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}&amount=${amount}`
        );
      } else {
        // ========== THANH TOÁN THẤT BẠI ==========
        subscription.status = "CANCELLED";
        await subscription.save();

        const errorMessage = PaymentController.getVNPayMessage(responseCode);

        console.error("❌ Payment failed:", orderId);
        console.error("❌ Response Code:", responseCode);
        console.error("❌ Reason:", errorMessage);

        // Xử lý các trường hợp thất bại cụ thể
        let reason = "unknown";

        if (responseCode === "24") {
          reason = "user_cancelled"; // User hủy
        } else if (responseCode === "11") {
          reason = "timeout"; // Hết hạn
        } else if (responseCode === "51") {
          reason = "insufficient_funds"; // Không đủ tiền
        } else if (responseCode === "12") {
          reason = "card_locked"; // Thẻ bị khóa
        } else if (responseCode === "13" || responseCode === "79") {
          reason = "wrong_otp"; // Sai OTP
        } else if (responseCode === "09") {
          reason = "card_not_registered"; // Chưa đăng ký internet banking
        } else if (responseCode === "75") {
          reason = "bank_maintenance"; // Ngân hàng bảo trì
        }

        return res.redirect(
          `${
            process.env.FRONTEND_URL
          }/payment/failed?reason=${reason}&code=${responseCode}&message=${encodeURIComponent(
            errorMessage
          )}`
        );
      }
    } catch (error) {
      console.error("❌ VNPay return error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failed?reason=server_error`
      );
    }
  }

  //   static async vnpayIPN(req, res) {
  //     try {
  //       let vnp_Params = req.query;
  //       const secureHash = vnp_Params["vnp_SecureHash"];

  //       delete vnp_Params["vnp_SecureHash"];
  //       delete vnp_Params["vnp_SecureHashType"];

  //       vnp_Params = PaymentController.sortObject(vnp_Params);

  //       const signData = new URLSearchParams(vnp_Params).toString();
  //       const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
  //       const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  //       if (secureHash !== signed) {
  //         return res
  //           .status(200)
  //           .json({ RspCode: "97", Message: "Invalid signature" });
  //       }

  //       const orderId = vnp_Params["vnp_TxnRef"];
  //       const responseCode = vnp_Params["vnp_ResponseCode"];

  //       const subscription = await Subscription.findOne({
  //         where: { payment_transaction_id: orderId },
  //       });

  //       if (!subscription) {
  //         return res
  //           .status(200)
  //           .json({ RspCode: "01", Message: "Order not found" });
  //       }

  //       if (subscription.status === "ACTIVE") {
  //         return res
  //           .status(200)
  //           .json({ RspCode: "02", Message: "Order already confirmed" });
  //       }

  //       if (responseCode === "00") {
  //         subscription.status = "ACTIVE";
  //         await subscription.save();

  //         await User.update(
  //           { tier: "PREMIUM" },
  //           { where: { user_id: subscription.user_id } }
  //         );

  //         return res.status(200).json({ RspCode: "00", Message: "Success" });
  //       } else {
  //         subscription.status = "CANCELLED";
  //         await subscription.save();

  //         return res.status(200).json({ RspCode: "00", Message: "Success" });
  //       }
  //     } catch (error) {
  //       console.error("❌ VNPay IPN error:", error);
  //       return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  //     }
  //   }

  static calculateExpiryDate(package_details) {
    const now = new Date();

    if (package_details === "3_THANG") {
      now.setMonth(now.getMonth() + 3);
    } else if (package_details === "6_THANG") {
      now.setMonth(now.getMonth() + 6);
    } else if (package_details === "12_THANG") {
      now.setMonth(now.getMonth() + 12);
    }

    return now;
  }
}

export default PaymentController;
