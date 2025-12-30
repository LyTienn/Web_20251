# Hướng dẫn Deploy dự án trên Windows

Tài liệu này hướng dẫn cách chạy dự án trên môi trường Windows sử dụng Docker Desktop.

## 1. Cài đặt Docker Desktop

1. Tải Docker Desktop cho Windows tại: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Cài đặt file `.exe` vừa tải về.
3. Sau khi cài đặt, mở Docker Desktop và đợi Docker Engine khởi động (icon cá voi màu xanh ở taskbar).

## 2. Chuẩn bị mã nguồn

Mở Terminal (PowerShell hoặc Command Prompt) và đi tới thư mục gốc của dự án.
Ví dụ:
```powershell
cd e:\hung\prj\CNWEB\Web_20251
```

## 3. Cấu hình biến môi trường

Kiểm tra file `.env` tại thư mục gốc.
Đảm bảo các thông số cấu hình chính xác:
- `DB_HOST=db`
- `DB_PORT=5432`
- Các API Keys (Gemini, Cloudinary, SePay) đã được điền.

## 4. Chạy dự án

Tại thư mục gốc dự án, chạy lệnh:

```powershell
docker-compose up -d --build
```

Docker sẽ tự động:
- Pull các image cần thiết (Postgres, Node, Nginx).
- Build image cho Backend và Frontend.
- Tạo network và volumes.
- Start các container.

## 5. Kiểm tra

1. Mở Docker Desktop dashboard, bạn sẽ thấy một group tên `web20251` (hoặc tên thư mục chứa dự án).
2. Click vào để xem 3 container: `db`, `backend`, `frontend` đang chạy (màu xanh).
3. Truy cập ứng dụng:
   - **Frontend**: Mở trình duyệt vào [http://localhost](http://localhost)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)
   - **Database**: Kết nối qua cổng `5432` với user/pass trong file `.env`.

## 6. Các lệnh thường dùng

- **Xem logs**:
  ```powershell
  docker-compose logs -f
  ```
- **Dừng dự án**:
  ```powershell
  docker-compose down
  ```
- **Khởi động lại**:
  ```powershell
  docker-compose restart
  ```
