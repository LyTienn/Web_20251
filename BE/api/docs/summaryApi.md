# AI Summary API Documentation

Base URL: `http://backend:5000/api/summary`

---

## 1. Summarize Content
Tóm tắt nội dung văn bản hoặc một chương sách.

**Endpoint:** `POST /summarize`

**Headers:**
```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:**
```json
{
  "text": "Nội dung dài cần tóm tắt...",
  "chapterId": "UUID-of-chapter"
}
```
- `text`: Nội dung cần tóm tắt (hoặc dùng `chapterId` để lấy nội dung từ DB).
- `chapterId`: UUID của chương sách.

**Response (Success - 202 Accepted):**
```json
{
  "taskId": 124,
  "message": "Summary generation started",
  "status": "PENDING"
}
```

**Response (Cached Success - 200 OK):**
```json
{
  "summary": "Nội dung tóm tắt...",
  "message": "Retrieved from cache",
  "status": "COMPLETED"
}
```

---

## Notes
- Summary generation là tác vụ nặng nên thường xử lý bất đồng bộ (Background Task). user check trạng thái qua Task API (nếu có) hoặc poll lại endpoint này (nếu logic hỗ trợ trả về kết quả ngay khi xong).
- Hiện tại endpoint trả về 202 và taskId để tracking.
