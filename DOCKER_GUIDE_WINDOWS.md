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



## 6. Khôi phục dữ liệu (Restore Database)

Nếu bạn có file backup database (file `.sql`), bạn có thể khôi phục dữ liệu mẫu.
**Link tải dữ liệu**: [Google Drive Link](https://drive.google.com/file/d/1msWUk-Q4kyaug3sD0OpXtdHehCc5jug4/view?usp=drive_link)

**Cách tải file lớn bằng dòng lệnh (nếu trình duyệt bị chậm/ngắt):**
1. Cài đặt Python (nếu chưa có).
2. Mở Terminal và cài `gdown`:
   ```powershell
   pip install gdown
   ```


3. Tải file:
   ```powershell
   gdown 1msWUk-Q4kyaug3sD0OpXtdHehCc5jug4 -O data_5500.backup
   ```

   **Lưu ý:** Nếu `gdown` báo lỗi (quota exceeded/permission), hãy tải thủ công từ link trên trình duyệt, sau đó lưu file vào thư mục dự án với tên `data_5500.backup`.

4. Sau khi tải xong, copy file vào container và restore:

```powershell
# Copy file vào container
docker cp data_5500.backup web20251_db:/tmp/data_5500.backup

# Chạy lệnh restore
docker exec web20251_db pg_restore -U postgres -d CNWEB -v /tmp/data_5500.backup
```

*Nếu lệnh trên báo lỗi định dạng (input file appears to be a text format dump), hãy dùng lệnh sau để restore:*
```powershell
Get-Content data_5500.backup | docker exec -i web20251_db psql -U postgres -d CNWEB
```
*(Nếu dùng Command Prompt (cmd), dùng lệnh: `type data_5500.backup | docker exec -i web20251_db psql -U postgres -d CNWEB`)*

## 7. Các lệnh thường dùng

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

## 8. Xử lý lỗi thường gặp (Troubleshooting)

### Lỗi kết nối mạng (context deadline exceeded / Client.Timeout)
Nếu bạn gặp lỗi không thể pull image từ Docker Hub (timeout) mặc dù máy có mạng:
1. Mở **Docker Desktop**.
2. Vào **Settings** (biểu tượng bánh răng) -> **Docker Engine**.
3. Sửa lại file JSON như sau (copy toàn bộ):
   ```json
   {
     "builder": {
       "gc": {
         "defaultKeepStorage": "20GB",
         "enabled": true
       }
     },
     "experimental": false,
     "dns": [
       "8.8.8.8"
     ]
   }
   ```
4. Click **Apply & restart**.
5. Thử chạy lại lệnh `docker-compose up -d --build`.

**Cách khác:**
- Nếu đổi DNS ko được, hãy thử bật **VPN** (hoặc `1.1.1.1` WARP) rồi pull lại. Docker Hub đôi khi bị chặn/chậm tại VN.
