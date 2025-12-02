# Book API

## Lấy danh sách sách (kèm tên tác giả và chủ đề)
- **GET** `/api/books`
- Query param: `subjectId`, `authorId` (tùy chọn)
- Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Tên sách",
      "author": { "name": "Tên tác giả" },
      "subjects": [ { "name": "Chủ đề 1" }, { "name": "Chủ đề 2" } ],
      ...
    },
    ...
  ]
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
- Response:
```json
{
  "success": true,
  "data": [ ... ]
}
```
