# PAYMENT API DOCUMENTATION

Base URL: `http://backend:5000/api`

---

## Authentication

Tất cả payment endpoints yêu cầu user đã đăng nhập (cookie `accessToken`).

---

## 1. PAYMENT ENDPOINTS

### 1.1. Tạo URL Thanh Toán VNPay

Tạo URL thanh toán VNPay để user nâng cấp lên Premium.

**Endpoint:** `POST /payment/create-payment-url`

**Authentication:** Required

**Headers:**

```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:**

```json
{
  "package_details": "6_THANG",
  "amount": 179000
}
```

**Validation Rules:**

- `package_details` (required): Phải là một trong `"3_THANG"`, `"6_THANG"`, `"12_THANG"`
- `amount` (required): Số tiền (VND), phải là số dương

**Các Gói Hội Viên:**

| Gói      | `package_details` | Giá đề xuất | Thời hạn |
| -------- | ----------------- | ----------- | -------- |
| 3 tháng  | `"3_THANG"`       | 99,000 VND  | 3 tháng  |
| 6 tháng  | `"6_THANG"`       | 179,000 VND | 6 tháng  |
| 12 tháng | `"12_THANG"`      | 299,000 VND | 12 tháng |

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=17900000&vnp_Command=pay&vnp_CreateDate=20240115103045&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+goi+6_THANG&vnp_OrderType=other&vnp_ReturnUrl=http://backend:5000/api/payment/vnpay-return&vnp_TmnCode=JC7PF7YK&vnp_TxnRef=1705308645000&vnp_Version=2.1.0&vnp_SecureHash=abc123..."
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Missing package_details or amount"
}
```

hoặc

```json
{
  "success": false,
  "message": "Invalid amount"
}
```

**Response Error (500):**

```json
{
  "success": false,
  "message": "VNPay environment variables missing"
}
```

**Luồng sử dụng:**

1. Frontend gọi API này để lấy `paymentUrl`
2. Redirect user đến `paymentUrl` (trang VNPay)
3. User thanh toán trên VNPay
4. VNPay redirect về `vnp_ReturnUrl` với kết quả

**Example Request (Postman):**

```bash
POST http://backend:5000/api/payment/create-payment-url
Content-Type: application/json
Cookie: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "package_details": "6_THANG",
  "amount": 179000
}
```

---

### 1.2. VNPay Return URL (Callback)

Endpoint mà VNPay redirect về sau khi user hoàn tất thanh toán.

**Endpoint:** `GET /payment/vnpay-return`

**Authentication:** Not required (VNPay callback)

**Query Parameters (từ VNPay):**

```
vnp_Amount=17900000
vnp_BankCode=NCB
vnp_BankTranNo=VNP14234567
vnp_CardType=ATM
vnp_OrderInfo=Thanh toan goi 6_THANG
vnp_PayDate=20240115103045
vnp_ResponseCode=00
vnp_TmnCode=JC7PF7YK
vnp_TransactionNo=14234567
vnp_TransactionStatus=00
vnp_TxnRef=1705308645000
vnp_SecureHash=abc123def456...
```

**Response Codes từ VNPay:**

| Code | Ý nghĩa                  | Action                                            |
| ---- | ------------------------ | ------------------------------------------------- |
| `00` | Giao dịch thành công     | Kích hoạt Premium, chuyển sang `/payment/success` |
| `24` | Khách hàng hủy giao dịch | Hủy subscription, chuyển sang `/payment/failed`   |
| `11` | Timeout                  | Hủy subscription, chuyển sang `/payment/failed`   |
| Khác | Lỗi khác                 | Hủy subscription, chuyển sang `/payment/failed`   |

**Redirect Success:**

```
302 Redirect → http://localhost:5173/payment/success
```

**Redirect Failed:**

```
302 Redirect → http://localhost:5173/payment/failed
```

**Database Changes:**

Khi thanh toán thành công (`vnp_ResponseCode=00`):

- `subscriptions.status`: `PENDING` → `ACTIVE`
- `users.tier`: `FREE` → `PREMIUM`

Khi thanh toán thất bại:

- `subscriptions.status`: `PENDING` → `CANCELLED`
- `users.tier`: Không đổi

**Console Logs:**

```
🔐 Received Hash: abc123def456...
🔐 Calculated Hash: abc123def456...
✅ Payment successful: 1705308645000
```

hoặc

```
❌ Invalid signature
```

hoặc

```
❌ Payment failed: 1705308645000 Code: 24
```

### 1.3. Lấy Lịch Sử Giao Dịch

Lấy toàn bộ lịch sử giao dịch thanh toán của user hiện tại.

**Endpoint:** `GET /payment/history`

**Authentication:** Required

**Headers:**

```
Cookie: accessToken=<token>
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "transactionId": "1705308645000",
        "package": "6_THANG",
        "amount": 179000,
        "status": "ACTIVE",
        "statusText": "Thành công",
        "startDate": "2024-01-15T10:30:45.000Z",
        "expiryDate": "2024-07-15T10:30:45.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "transactionId": "1702716645000",
        "package": "3_THANG",
        "amount": 99000,
        "status": "CANCELLED",
        "statusText": "Thanh toán thất bại",
        "startDate": "2023-12-16T08:10:45.000Z",
        "expiryDate": "2024-03-16T08:10:45.000Z"
      }
    ]
  }
}
```

---

## 2. DATABASE SCHEMA

### Bảng `subscriptions`

```sql
CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    package_details VARCHAR(100) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL,
    payment_transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'))
);
```

### Bảng `users` (thêm cột `tier`)

```sql
ALTER TABLE users
ADD COLUMN tier VARCHAR(20) DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PREMIUM'));
```

---

## 3. PAYMENT FLOW

```
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│ Client  │         │ Backend  │         │  VNPay  │         │ Database │
└────┬────┘         └─────┬────┘         └────┬────┘         └─────┬────┘
     │                    │                   │                    │
     │ POST /create-      │                   │                    │
     │ payment-url        │                   │                    │
     ├───────────────────>│                   │                    │
     │                    │                   │                    │
     │                    │ INSERT subscription (PENDING)          │
     │                    ├──────────────────────────────────────>│
     │                    │                   │                    │
     │                    │ Generate VNPay URL with signature      │
     │                    │                   │                    │
     │ { paymentUrl }     │                   │                    │
     │<───────────────────┤                   │                    │
     │                    │                   │                    │
     │ Redirect to VNPay  │                   │                    │
     ├──────────────────────────────────────>│                    │
     │                    │                   │                    │
     │ User completes payment on VNPay        │                    │
     │<───────────────────────────────────────┤                    │
     │                    │                   │                    │
     │                    │ GET /vnpay-return │                    │
     │                    │<──────────────────┤                    │
     │                    │                   │                    │
     │                    │ Verify signature  │                    │
     │                    │                   │                    │
     │                    │ UPDATE subscription (ACTIVE)           │
     │                    ├──────────────────────────────────────>│
     │                    │                   │                    │
     │                    │ UPDATE user (tier=PREMIUM)             │
     │                    ├──────────────────────────────────────>│
     │                    │                   │                    │
     │ Redirect to /payment/success          │                    │
     │<───────────────────┤                   │                    │
     │                    │                   │                    │
```

---

## 4. ENVIRONMENT VARIABLES

Cần thiết lập trong [`.env`](Web_20251/BE/api/.env):

```env
# VNPay Sandbox Config
VNP_TMN_CODE=JC7PF7YK
VNP_HASH_SECRET=56RG4CZBOCWVXY738TNGP1BCR9LO2DRL
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://backend:5000/api/payment/vnpay-return
FRONTEND_URL=http://localhost:5173
```

**Lấy credentials:**

1. Đăng ký tài khoản tại https://sandbox.vnpayment.vn/
2. Vào **Cấu hình** → Copy `TMN Code` và `Hash Secret`

---

## 5. TESTING

### 5.1. Test với Postman

#### Bước 1: Login

```bash
POST http://backend:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Bước 2: Tạo Payment URL

```bash
POST http://backend:5000/api/payment/create-payment-url
Content-Type: application/json
Cookie: accessToken=<from_login>

{
  "package_details": "6_THANG",
  "amount": 179000
}
```

#### Bước 3: Test thanh toán

Copy `paymentUrl` từ response → Mở trong browser → Thanh toán với thẻ test VNPay:

**Thẻ test VNPay Sandbox:**

```
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mật khẩu OTP: 123456
```

### 5.2. Kiểm tra Database

```sql
-- Kiểm tra subscription
SELECT * FROM subscriptions WHERE user_id = '<your_user_id>';

-- Kiểm tra user tier
SELECT user_id, email, tier FROM users WHERE user_id = '<your_user_id>';
```

### 5.3. Test Failed Payment

Trên trang VNPay, click **"Hủy giao dịch"** thay vì thanh toán → Kiểm tra redirect về `/payment/failed`.

---

## 6. ERROR RESPONSES

### 6.1. Invalid Package (400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "package_details",
      "message": "Invalid package"
    }
  ]
}
```

### 6.2. Unauthorized (401)

```json
{
  "success": false,
  "message": "No token provided"
}
```

### 6.3. VNPay Configuration Missing (500)

```json
{
  "success": false,
  "message": "VNPay environment variables missing"
}
```

### 6.4. Invalid Signature (Redirect)

```
302 Redirect → http://localhost:5173/payment/failed
```
