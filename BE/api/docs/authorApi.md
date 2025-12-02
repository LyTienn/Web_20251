# Author API

## Lấy danh sách tác giả
- **GET** `/api/authors`
- Response:
```json
{
  "success": true,
  "data": [ ... ]
}
```

## Lấy chi tiết tác giả
- **GET** `/api/authors/:id`
- Response:
```json
{
  "success": true,
  "data": { ... }
}
```


## Tạo tác giả mới
- **POST** `/api/authors`
- Body:
```json
{
  "name": "Tên tác giả"
}
```
- Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Tạo tác giả thành công"
}
```


## Sửa tác giả
- **PUT** `/api/authors/:id`
- Body:
```json
{
  "name": "Tên mới"
}
```
- Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Cập nhật tác giả thành công"
}
```

## Xóa tác giả
- **DELETE** `/api/authors/:id`
- Response:
```json
{
  "success": true,
  "message": "Xóa tác giả thành công"
}
```

## Lấy sách của tác giả
- **GET** `/api/authors/:id/books`
- Response:
```json
{
  "success": true,
  "data": [ ... ]
}
```
