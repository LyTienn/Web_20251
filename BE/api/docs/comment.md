# COMMENT API DOCUMENTATION

Base URL: `http://localhost:5000/api/comments`

---

## Authentication

Tất cả các endpoints liên quan đến việc tạo, sửa, xóa comment đều yêu cầu authentication thông qua **HttpOnly Cookies**.

---

## 1. COMMENT ENDPOINTS

### 1.1. Tạo Comment cho Sách

Tạo comment và đánh giá cho một cuốn sách.

**Endpoint:** `POST /books/:bookId/comments`

**Authentication:** Required

**Path Parameters:**

- `bookId` (required): ID của sách

**Headers:**

```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:**

```json
{
  "rating": 5,
  "content": "Cuốn sách rất hay và bổ ích!"
}
```

**Validation Rules:**

- `rating` (required): Số nguyên từ 1-5
- `content` (optional): Nội dung bình luận

**Response Success (201):**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "comment_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Cuốn sách rất hay và bổ ích!",
    "rating": 5,
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "book_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "full_name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Rating must be between 1 and 5"
}
```

**Response Error (409):**

```json
{
  "success": false,
  "message": "You have already commented on this book"
}
```

---

### 1.2. Lấy Comments của Sách

Lấy danh sách tất cả comments của một cuốn sách với phân trang.

**Endpoint:** `GET /books/:bookId/comments`

**Authentication:** Not Required

**Path Parameters:**

- `bookId` (required): ID của sách

**Query Parameters:**

- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số lượng comments mỗi trang

**Example Request:**

```
GET /comments/books/1/comments?page=1&limit=10
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "comment_id": "550e8400-e29b-41d4-a716-446655440000",
        "content": "Cuốn sách rất hay!",
        "rating": 5,
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "book_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "user": {
          "user_id": "550e8400-e29b-41d4-a716-446655440001",
          "full_name": "John Doe"
        }
      },
      {
        "comment_id": "550e8400-e29b-41d4-a716-446655440002",
        "content": "Nội dung sâu sắc",
        "rating": 4,
        "user_id": "550e8400-e29b-41d4-a716-446655440003",
        "book_id": 1,
        "created_at": "2024-01-14T09:20:00.000Z",
        "user": {
          "user_id": "550e8400-e29b-41d4-a716-446655440003",
          "full_name": "Jane Smith"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    },
    "averageRating": "4.5",
    "totalComments": 25
  }
}
```

---

### 1.3. Lấy Comments của User Hiện Tại

Lấy tất cả comments mà user đã viết.

**Endpoint:** `GET /my-comments`

**Authentication:** Required

**Headers:**

```
Cookie: accessToken=<token>
```

**Query Parameters:**

- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số lượng comments mỗi trang

**Example Request:**

```
GET /comments/my-comments?page=1&limit=10
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "comment_id": "550e8400-e29b-41d4-a716-446655440000",
        "content": "Cuốn sách rất hay!",
        "rating": 5,
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "book_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "book": {
          "id": 1,
          "title": "Nhà Giả Kim",
          "image_url": "https://example.com/book.jpg"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 1.4. Cập Nhật Comment

Cập nhật nội dung hoặc rating của comment.

**Endpoint:** `PUT /comments/:commentId`

**Authentication:** Required

**Path Parameters:**

- `commentId` (required): UUID của comment

**Headers:**

```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:**

```json
{
  "content": "Sau khi đọc lại, tôi thấy sách còn hay hơn nữa!",
  "rating": 5
}
```

**Validation Rules:**

- `content` (optional): Nội dung mới
- `rating` (optional): Số nguyên từ 1-5

**Response Success (200):**

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "comment_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Sau khi đọc lại, tôi thấy sách còn hay hơn nữa!",
    "rating": 5,
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "book_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "full_name": "John Doe"
    }
  }
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "You can only update your own comments"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Comment not found"
}
```

---

### 1.5. Xóa Comment

Xóa comment của user hoặc admin xóa bất kỳ comment nào.

**Endpoint:** `DELETE /comments/:commentId`

**Authentication:** Required

**Path Parameters:**

- `commentId` (required): UUID của comment

**Headers:**

```
Cookie: accessToken=<token>
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "You can only delete your own comments"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Comment not found"
}
```

**Note:** Admin có thể xóa bất kỳ comment nào, user chỉ có thể xóa comment của chính mình.

---

## 2. ERROR RESPONSES

### 2.1. Validation Error (400)
```json
{
  "success": false,
  "message": "Rating must be between 1 and 5"
}
```

### 2.2. Unauthorized (401)
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 2.3. Forbidden (403)
```json
{
  "success": false,
  "message": "You can only update your own comments"
}
```

### 2.4. Not Found (404)
```json
{
  "success": false,
  "message": "Comment not found"
}
```

### 2.5. Conflict (409)
```json
{
  "success": false,
  "message": "You have already commented on this book"
}
```

### 2.6. Server Error (500)
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## 3. NOTES

1. **One Comment Per Book**: Mỗi user chỉ có thể comment một lần cho mỗi cuốn sách
2. **Rating Range**: Rating phải từ 1-5
3. **Average Rating**: Được tính tự động khi lấy comments của sách
4. **Pagination**: Default là page=1, limit=10
5. **Sorting**: Comments được sắp xếp theo thời gian tạo (mới nhất trước)
6. **Admin Privileges**: Admin có thể xóa bất kỳ comment nào

---
