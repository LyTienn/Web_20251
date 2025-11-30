# USER API DOCUMENTATION

Base URL: `http://localhost:5000/api`

---

## Authentication

Tất cả các endpoints dưới đây đều yêu cầu authentication thông qua **HttpOnly Cookies**.
Access token được gửi tự động trong cookie với mỗi request.

---

## 1. USER ENDPOINTS (Yêu cầu Authentication)

### 1.1. Get User Profile

Lấy thông tin profile của user hiện tại.

**Endpoint:** `GET /users/profile`

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
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "USER",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "No token provided"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 1.2. Update User Profile

Cập nhật thông tin profile của user hiện tại.

**Endpoint:** `PUT /users/profile`

**Authentication:** Required

**Headers:**

```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:**

```json
{
  "email": "newemail@example.com",
  "fullName": "John Smith"
}
```

**Validation Rules:**

- `email` (optional): Phải là email hợp lệ
- `fullName` (optional): 2-255 ký tự
- Ít nhất một trong hai field phải được cung cấp

**Response Success (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "newemail@example.com",
      "full_name": "John Smith",
      "role": "USER",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "At least one field (fullName or email) is required"
}
```

**Response Error (409):**

```json
{
  "success": false,
  "message": "Email already in use"
}
```

---

### 1.3. Change Password

Đổi mật khẩu của user hiện tại.

**Endpoint:** `POST /users/change-password`

**Authentication:** Required

**Headers:**

```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Validation Rules:**

- `currentPassword` (required): Mật khẩu hiện tại
- `newPassword` (required): Tối thiểu 6 ký tự

**Response Success (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "New password must be at least 6 characters long"
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

### 1.4. Delete Account

Xóa tài khoản của user hiện tại.

**Endpoint:** `DELETE /users/account`

**Authentication:** Required

**Headers:**

```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:**

```json
{
  "password": "mypassword123"
}
```

**Validation Rules:**

- `password` (required): Mật khẩu để xác nhận xóa tài khoản

**Response Success (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Password is required to delete account"
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "Incorrect password"
}
```

**Note:** Sau khi xóa tài khoản thành công, cookies sẽ được clear tự động.

---

## 2. ADMIN ENDPOINTS (Yêu cầu ADMIN Role)

### 2.1. Get All Users

Lấy danh sách tất cả users với phân trang.

**Endpoint:** `GET /users`

**Authentication:** Required (ADMIN only)

**Query Parameters:**

- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số lượng users mỗi trang
- `role` (optional): Lọc theo role (USER hoặc ADMIN)

**Example Request:**

```
GET /users?page=1&limit=10&role=USER
Cookie: accessToken=<admin_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "users": [
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user1@example.com",
        "full_name": "John Doe",
        "role": "USER",
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "email": "user2@example.com",
        "full_name": "Jane Smith",
        "role": "USER",
        "created_at": "2024-01-14T09:20:00.000Z"
      }
    ]
  }
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "Role USER is not authorized to access this resource"
}
```

---

### 2.2. Search Users

Tìm kiếm users theo email hoặc tên.

**Endpoint:** `GET /users/search`

**Authentication:** Required (ADMIN only)

**Query Parameters:**

- `q` (required): Từ khóa tìm kiếm (tối thiểu 2 ký tự)

**Example Request:**

```
GET /users/search?q=john
Cookie: accessToken=<admin_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john@example.com",
        "full_name": "John Doe",
        "role": "USER",
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "email": "johnny@example.com",
        "full_name": "Johnny Smith",
        "role": "USER",
        "created_at": "2024-01-14T09:20:00.000Z"
      }
    ]
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Search query must be at least 2 characters"
}
```

---

### 2.3. Get User By ID

Lấy thông tin chi tiết của một user theo ID.

**Endpoint:** `GET /users/:userId`

**Authentication:** Required (ADMIN only)

**Path Parameters:**

- `userId` (required): UUID của user

**Example Request:**

```
GET /users/550e8400-e29b-41d4-a716-446655440000
Cookie: accessToken=<admin_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "USER",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 2.4. Delete User

Xóa một user (chỉ admin có thể xóa).

**Endpoint:** `DELETE /users/:userId`

**Authentication:** Required (ADMIN only)

**Path Parameters:**

- `userId` (required): UUID của user cần xóa

**Example Request:**

```
DELETE /users/550e8400-e29b-41d4-a716-446655440000
Cookie: accessToken=<admin_token>
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "You cannot delete your own account"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "User not found"
}
```

**Note:** Admin không thể tự xóa chính mình.

---

## 3. ERROR RESPONSES

### 3.1. Validation Error (400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 3.2. Unauthorized (401)

```json
{
  "success": false,
  "message": "No token provided"
}
```

hoặc

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 3.3. Forbidden (403)

```json
{
  "success": false,
  "message": "Role USER is not authorized to access this resource"
}
```

### 3.4. Not Found (404)

```json
{
  "success": false,
  "message": "User not found"
}
```

hoặc

```json
{
  "success": false,
  "message": "Route not found"
}
```

### 3.5. Conflict (409)

```json
{
  "success": false,
  "message": "Email already in use"
}
```

### 3.6. Server Error (500)

```json
{
  "success": false,
  "message": "Server error"
}
```

---

## 4. TESTING WITH CURL

### 4.1. Get Profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Cookie: accessToken=YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4.2. Update Profile

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Cookie: accessToken=YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "New Name",
    "email": "newemail@example.com"
  }'
```

### 4.3. Change Password

```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Cookie: accessToken=YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass123",
    "newPassword": "newpass123"
  }'
```

### 4.4. Delete Account

```bash
curl -X DELETE http://localhost:5000/api/users/account \
  -H "Cookie: accessToken=YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "mypassword123"
  }'
```

### 4.5. Admin - Get All Users

```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Cookie: accessToken=ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4.6. Admin - Search Users

```bash
curl -X GET "http://localhost:5000/api/users/search?q=john" \
  -H "Cookie: accessToken=ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4.7. Admin - Get User By ID

```bash
curl -X GET http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: accessToken=ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4.8. Admin - Delete User

```bash
curl -X DELETE http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: accessToken=ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## 5. NOTES

1. **Authentication**: Tất cả endpoints sử dụng HttpOnly cookies để bảo mật
2. **Token Expiry**: Access token hết hạn sau 15 phút
3. **Refresh Token**: Sử dụng endpoint `/api/auth/refresh` để lấy token mới
4. **Role-Based Access**: Admin endpoints chỉ cho phép users có role "ADMIN"
5. **Pagination**: Default là page=1, limit=10
6. **Search**: Kết quả tìm kiếm giới hạn 10 users

---
