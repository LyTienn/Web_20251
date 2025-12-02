# Subject API

## Lấy danh sách chủ đề
- **GET** `/api/subjects`
- Response:
```json
{
  "success": true,
  "data": [ ... ]
}
```

## Lấy chi tiết chủ đề
- **GET** `/api/subjects/:id`
- Response:
```json
{
  "success": true,
  "data": { ... }
}
```

## Tạo chủ đề mới
- **POST** `/api/subjects`
- Body:
```json
{
  "name": "Tên chủ đề"
}
```
- Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Tạo chủ đề thành công"
}
```

## Sửa chủ đề
- **PUT** `/api/subjects/:id`
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
  "message": "Cập nhật chủ đề thành công"
}
```

## Xóa chủ đề
- **DELETE** `/api/subjects/:id`
- Response:
```json
{
  "success": true,
  "message": "Xóa chủ đề thành công"
}
```

## Lấy sách theo chủ đề
- **GET** `/api/subjects/:id/books`
- Response:
```json
{
  "success": true,
  "data": [ ... ]
}
```
