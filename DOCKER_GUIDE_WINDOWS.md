# Hướng Dẫn Chạy Bằng Docker (Windows)

Tài liệu này dành riêng cho người dùng Windows sử dụng **PowerShell**.

## Yêu Cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã được cài đặt và đang chạy.

## Cách Chạy

1.  **Chuẩn bị Dữ Liệu (QUAN TRỌNG)**:
    *   Do file lớn (>900MB) nên Google Drive chặn tải trực tiếp. Bạn cần dùng `gdown` để tải:
        ```powershell
        pip install gdown
        gdown --id 1ohxEbwJbPrNUw0cFp9NJ5IJPhZ8uYyOa -O Data\data.backup
        ```
    *   *Lưu ý: Nếu bạn tải về thấy file chỉ vài KB (là file HTML lỗi), hãy xóa đi và chạy lại lệnh trên.*

2.  **Mở PowerShell** tại thư mục gốc của dự án.

3.  **Chạy lệnh sau** để khởi động:
    ```powershell
    docker-compose up --build
    ```
    *Hệ thống sẽ chạy và container `restore` sẽ tự động tìm file backup để nạp vào database.*

4.  **Hoàn Tất & Trải Nghiệm**:
    *   Khi thấy log báo `Server is running on port 5000` và `Restore completed successfully!`.
    *   🎉 **Hệ thống đã sẵn sàng!**
    *   👉 **Truy cập ngay**: [http://localhost](http://localhost) để vào trang chủ.
    *   Trang quản lý (nếu có): [http://localhost/admin](http://localhost/admin)

4.  **Truy cập ứng dụng**:
    - **Frontend (Web App)**: [http://localhost](http://localhost) (Chạy ở cổng 80)
    - **Backend (API)**: [http://localhost:5000](http://localhost:5000)
    - **Database**:
        - Host: `localhost`
        - Port: `5432`
        - *Lưu ý: Tắt Postgres local (nếu có) để tránh xung đột cổng 5432.*

## Dừng Ứng Dụng
- Nhấn `Ctrl + C` trong terminal.
- Hoặc mở PowerShell mới và chạy:
    ```powershell
    docker-compose down
    ```

## Làm Sạch & Chạy Lại Từ Đầu (Reset)
Nếu bạn muốn xóa sạch dữ liệu cũ để hệ thống tự động nạp lại từ đầu (Auto-Restore):

1.  **Xóa container và volume chứa dữ liệu**:
    ```powershell
    docker-compose down -v
    ```
    *Lưu ý: `-v` sẽ xóa toàn bộ dữ liệu database.*

2.  **Khởi động lại**:
    ```powershell
    docker-compose up --build
    ```
    *Hệ thống sẽ tự phát hiện database trống và tải lại backup mới nhất.*

## Xử Lý Sự Cố (Troubleshooting)

### 1. Cổng bị chiếm (Port conflicts)
Lỗi: `Bind for 0.0.0.0:80 failed: port is already allocated`.
- Nguyên nhân: IIS, Skype hoặc ứng dụng khác đang chiếm cổng 80.
- Giải pháp:
    1. Tắt ứng dụng đó.
    2. Hoặc sửa `docker-compose.yml` đổi cổng Frontend thành `8080:80`.

### 2. Database không kết nối được
- Kiểm tra log container `backend`.
- Reset sạch dữ liệu nếu cần (Thận trọng: XÓA HẾT DỮ LIỆU):
    ```powershell
    docker-compose down -v
    ```

## Nạp Dữ Liệu Mẫu (Thủ công)
Nếu chưa có dữ liệu, bạn có thể chạy script Python để lấy dữ liệu mẫu.

1.  Mở PowerShell tại thư mục `Data`.
2.  Cài đặt và chạy:
    ```powershell
    python -m venv .venv
    .\.venv\Scripts\activate
    pip install requests psycopg2-binary bcrypt
    python books-1.py
    ```
    *Script sẽ hỏi bạn số lượng sách và thông tin database. Nhấn Enter để dùng cấu hình mặc định.*



## Khôi Phục Dữ Liệu Thủ Công (Nếu cần)

Nếu tính năng tự động bị lỗi hoặc bạn muốn nạp lại từ đầu:

### 1. Tải file backup
Chạy lệnh sau trong PowerShell để tải file về thư mục `Data`:
```powershell
Invoke-WebRequest -Uri "https://drive.google.com/uc?export=download&id=1ohxEbwJbPrNUw0cFp9NJ5IJPhZ8uYyOa" -OutFile "Data\data.backup"
```
*Hoặc tải thủ công và lưu vào `Data\data.backup`.*

### 2. Restore Database
Chạy lệnh bên dưới để nạp dữ liệu vào container (sử dụng `pg_restore` cho file `.backup`):

```powershell
Get-Content Data\data.backup | docker exec -i cnweb_db pg_restore -U postgres -d CNWEB -v --clean --if-exists
```
