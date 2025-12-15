# BOOKSHELF API DOCUMENTATION

Base URL: `http://localhost:5000/api/bookshelf`

---

## Authentication

Tất cả các endpoints đều yêu cầu authentication thông qua **HttpOnly Cookies**.

---

## 1. BOOKSHELF ENDPOINTS

### 1.1. Lấy Bookshelf của User

Lấy tất cả sách trong tủ sách của user hiện tại.

**Endpoint:** `GET /`

**Authentication:** Required

**Headers:**

```
Cookie: accessToken=<token>
```

**Query Parameters:**

- `status` (optional): Filter theo status ('FAVORITE' hoặc 'READING')

**Example Request:**

```
GET /bookshelf?status=FAVORITE
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": 1,
        "title": "Nhà Giả Kim",
        "image_url": "https://example.com/book.jpg",
        "summary": "Câu chuyện về...",
        "addedAt": "2024-01-15T10:30:00.000Z",
        "author": {
          "name": "Paulo Coelho"
        },
        "subjects": [
          {
            "name": "Văn học"
          }
        ]
      }
    ],
    "reading": [
      {
        "id": 2,
        "title": "Đắc Nhân Tâm",
        "image_url": "https://example.com/book2.jpg",
        "summary": "Nghệ thuật...",
        "addedAt": "2024-01-14T09:20:00.000Z",
        "author": {
          "name": "Dale Carnegie"
        },
        "subjects": [
          {
            "name": "Kỹ năng sống"
          }
        ]
      }
    ],
    "total": 2
  }
}
```

---

### 1.2. Thêm Sách vào Bookshelf

Thêm một cuốn sách vào danh sách yêu thích hoặc đang đọc.

**Endpoint:** `POST /books/:bookId`

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
  "status": "FAVORITE"
}
```

**Validation Rules:**

- `status` (required): Phải là 'FAVORITE' hoặc 'READING'

**Response Success (201):**

```json
{
  "success": true,
  "message": "Book added to favorite successfully"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Status must be either FAVORITE or READING"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Book not found"
}
```

**Response Error (409):**

```json
{
  "success": false,
  "message": "Book already in your favorite list"
}
```

---

### 1.3. Kiểm Tra Sách trong Bookshelf

Kiểm tra xem một cuốn sách có trong bookshelf của user không.

**Endpoint:** `GET /books/:bookId/check`

**Authentication:** Required

**Path Parameters:**

- `bookId` (required): ID của sách

**Headers:**

```
Cookie: accessToken=<token>
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "inBookshelf": true,
    "statuses": ["FAVORITE", "READING"],
    "isFavorite": true,
    "isReading": true
  }
}
```

**Response (Không có trong bookshelf):**

```json
{
  "success": true,
  "data": {
    "inBookshelf": false,
    "statuses": [],
    "isFavorite": false,
    "isReading": false
  }
}
```

### 1.4. Xóa Sách khỏi Bookshelf

Xóa sách khỏi danh sách yêu thích hoặc đang đọc.

**Endpoint:** `DELETE /books/:bookId`

**Authentication:** Required

**Path Parameters:**

- `bookId` (required): ID của sách

**Query Parameters:**

- `status` (required): 'FAVORITE' hoặc 'READING'

**Headers:**

```
Cookie: accessToken=<token>
```

**Example Request:**

```
DELETE /bookshelf/books/1?status=FAVORITE
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Book removed from favorite successfully"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Status query parameter is required (FAVORITE or READING)"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Book not found in your bookshelf"
}
```

## 2. ERROR RESPONSES

### 2.1. Validation Error (400)

```json
{
  "success": false,
  "message": "Status must be either FAVORITE or READING"
}
```

### 2.2. Unauthorized (401)

```json
{
  "success": false,
  "message": "No token provided"
}
```

### 2.3. Not Found (404)

```json
{
  "success": false,
  "message": "Book not found"
}
```

### 2.4. Conflict (409)

```json
{
  "success": false,
  "message": "Book already in your favorite list"
}
```

### 2.5. Server Error (500)

```json
{
  "success": false,
  "message": "Server error"
}
```

---

## 3. NOTES

1. **Multiple Status**: Một sách có thể vừa ở FAVORITE vừa ở READING
2. **Status Values**: Chỉ có 2 giá trị: 'FAVORITE' và 'READING'
3. **Auto Delete**: Khi xóa sách, tất cả liên kết với user cũng bị xóa (CASCADE)
4. **Sorting**: Sách được sắp xếp theo thời gian thêm vào (mới nhất trước)
5. **Book Info**: Bao gồm thông tin đầy đủ về tác giả và chủ đề

---
