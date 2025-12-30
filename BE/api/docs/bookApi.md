# Book API

- **GET** `/api/books`
- **Query Parameters:**
  - `page` (optional, default: 1): Số trang (bắt đầu từ 1).
  - `limit` (optional, default: 10): Số lượng sách mỗi trang.
  - `subjectId` (optional): Lọc theo ID chủ đề.
  - `authorId` (optional): Lọc theo ID tác giả.
  - `keyword` hoặc `q` (optional): Tìm kiếm theo tên sách hoặc tên tác giả.
  - `type` (optional): Lọc theo loại sách, ví dụ: `FREE`, `PREMIUM`.
  - `sort` (optional): Sắp xếp danh sách. Các giá trị hỗ trợ:
    - `newest` (mặc định): Mới nhất trước.
    - `oldest`: Cũ nhất trước.
    - `a-z`: Tên sách A->Z.
    - `z-a`: Tên sách Z->A.
    - `views`: Phổ biến nhất (theo lượt xem/download).
- **Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "totalPages": 10,
    "currentPage": 1,
    "books": [
      {
        "id": 1,
        "title": "Tên sách",
        "image_url": "http://...",
        "type": "FREE",
        "author": { "name": "Tên tác giả" },
        "subjects": [ { "name": "Chủ đề 1" }, { "name": "Chủ đề 2" } ],
        "chapter_count": 10,
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      ...
    ]
  }
}
```

## Lấy chi tiết sách
- **GET** `/api/books/:id`
- Response:
```json
{
  "success": true,
  "data": { ... }
}
```


## Tạo sách mới
- **POST** `/api/books`
- Body:
```json
{
  "title": "Tên sách",
  "author_id": 1,
  "description": "...",
  "published_year": 2023
}
```
- Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tên sách",
    "author": { "name": "Tên tác giả" },
    "subjects": [ { "name": "Chủ đề 1" }, { "name": "Chủ đề 2" } ],
    ...
  },
  "message": "Tạo sách thành công"
}
```


## Xóa sách
- **DELETE** `/api/books/:id`
- Response:
```json
{
  "success": true,
  "message": "Xóa sách thành công",
  "data": {
    "id": 1,
    "title": "Tên sách",
    "author": { "name": "Tên tác giả" },
    "subjects": [ { "name": "Chủ đề 1" }, { "name": "Chủ đề 2" } ],
    ...
  }
}
```

## Lấy danh sách chương
- **GET** `/api/books/:id/chapters`
- **Authentication:** Optional (Required for full access to Premium books).
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "book_id": 1,
      "title": "Chương 1",
      "content": "Nội dung chương...",
      "isLocked": false
    },
    {
      "id": 4,
      "book_id": 1,
      "title": "Chương 4",
      "content": "Nội dung dành riêng cho hội viên Premium.",
      "isLocked": true
    },
    ...
  ]
}
```
*Note: Đối với sách Premium, user chưa đăng ký gói Premium chỉ xem được 3 chương đầu. Các chương sau sẽ có `isLocked: true` và nội dung bị ẩn.*
