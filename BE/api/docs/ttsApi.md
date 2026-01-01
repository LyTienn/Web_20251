# Text-to-Speech (TTS) API Documentation

Base URL: `http://backend:5000/api/tts`

---

## 1. Generate Speech
Chuyển đổi văn bản thành giọng nói (hoặc đọc một chương sách).

**Endpoint:** `POST /generate`

**Headers:**
```
Content-Type: application/json
Cookie: accessToken=<token> (Optional/Required depending on usage)
```

**Request Body:**
```json
{
  "text": "Nội dung cần đọc...", 
  "voiceName": "Kore",
  "chapterId": "UUID-of-chapter"
}
```
- `text` (optional): Nếu không có `chapterId`, `text` là bắt buộc.
- `chapterId` (optional): Nếu có, hệ thống sẽ lấy nội dung của chương để đọc.
- `voiceName` (optional, default: 'Kore'): Tên giọng đọc (xem danh sách giọng ở dưới).

**Response (Success - 202 Accepted):**
```json
{
  "taskId": 123,
  "message": "TTS generation started",
  "status": "PENDING"
}
```
*Note: Quá trình tạo file âm thanh diễn ra dưới nền. Frontend cần poll API kiểm tra trạng thái task hoặc chờ sự kiện.*

**Response (Cached Success - 200 OK):**
```json
{
  "audioUrl": "https://res.cloudinary.com/...",
  "message": "Retrieved from cache",
  "voice": "Kore"
}
```

---

## 2. Get Available Voices
Lấy danh sách các giọng đọc hỗ trợ và trạng thái sẵn có cho một chương (nếu đã được generate trước đó).

**Endpoint:** `GET /voices`

**Query Parameters:**
- `chapterId` (optional): Kiểm tra xem giọng nào đã có audio sẵn cho chương này.

**Response:**
```json
[
  {
    "name": "Zephyr",
    "description": "Nam giọng sáng trẻ trung linh hoạt",
    "isAvailable": false,
    "audioUrl": null
  },
  {
    "name": "Kore",
    "description": "Nữ giọng trầm vững chắc điềm tĩnh",
    "isAvailable": true,
    "audioUrl": "https://res.cloudinary.com/..."
  },
  ...
]
```

---

## 3. Data Models
### Voicenames (Sample)
- `Zephyr`, `Puck`, `Charon` (Nam)
- `Kore`, `Leda`, `Aoede` (Nữ)
... (và nhiều giọng khác)
