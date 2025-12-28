# Hướng Dẫn Chạy Bằng Docker (Ubuntu / Linux / macOS)

Tài liệu này dành riêng cho người dùng Ubuntu, Linux hoặc macOS sử dụng terminal (Bash/Zsh).

## Yêu Cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) hoặc Docker Engine đã được cài đặt và đang chạy.
- `docker-compose` (nếu dùng version cũ) hoặc `docker compose` (plugin mới).

## Cách Chạy

1.  **Chuẩn bị Dữ Liệu (QUAN TRỌNG)**:
    *   Do file lớn (>900MB) nên Google Drive chặn tải trực tiếp. Bạn cần dùng `gdown` để tải:
        ```bash
        pip install gdown
        gdown --id 1ohxEbwJbPrNUw0cFp9NJ5IJPhZ8uYyOa -O Data/data.backup
        ```
    *   *Lưu ý: Nếu bạn tải về thấy file chỉ vài KB (là file HTML lỗi), hãy xóa đi và chạy lại lệnh trên.*

2.  **Mở Terminal** tại thư mục gốc của dự án.

3.  **Chạy lệnh sau** để khởi động:
    ```bash
    docker-compose up --build
    ```
    *Hệ thống sẽ chạy và container `restore` sẽ tự động tìm file backup để nạp vào database.*

4.  **Hoàn Tất & Trải Nghiệm**:
    *   Khi thấy log báo `Server is running on port 5000` và `Restore completed successfully!`.
    *   🎉 **Hệ thống đã sẵn sàng!**
    *   👉 **Truy cập ngay**: [http://localhost](http://localhost) để vào trang chủ.
    *   Trang quản lý (nếu có): [http://localhost/admin](http://localhost/admin)

4.  **Truy cập ứng dụng**:
    - **Frontend**: [http://localhost](http://localhost) (Cổng 80)
    - **Backend**: [http://localhost:5000](http://localhost:5000)
    - **Database**:
        - Host: `localhost`
        - Port: `5432`

## Dừng Ứng Dụng
- Nhấn `Ctrl + C` trong terminal.
- Hoặc mở terminal mới và chạy:
    ```bash
    docker-compose down
    ```

## Làm Sạch & Chạy Lại Từ Đầu (Reset)
Nếu bạn muốn xóa sạch dữ liệu cũ để hệ thống tự động nạp lại từ đầu (Auto-Restore):

1.  **Xóa container và volume chứa dữ liệu**:
    ```bash
    docker-compose down -v
    ```
    *Lưu ý: `-v` sẽ xóa toàn bộ dữ liệu database.*

2.  **Khởi động lại**:
    ```bash
    docker-compose up --build
    ```
    *Hệ thống sẽ tự phát hiện database trống và tải lại backup mới nhất.*

## Xử Lý Sự Cố (Troubleshooting)

### 1. Cổng bị chiếm
Lỗi: `Bind for 0.0.0.0:80 failed: port is already allocated`.
- Giải pháp:
    1. Kiểm tra tiến trình đang chiếm cổng: `sudo lsof -i :80`
    2. Kill tiến trình đó hoặc sửa `docker-compose.yml` đổi cổng Frontend thành `8080:80`.

### 2. Database không kết nối được
- Kiểm tra log: `docker-compose logs -f backend`
- Reset sạch dữ liệu (XÓA HẾT DỮ LIỆU):
    ```bash
    docker-compose down -v
    ```

## Nạp Dữ Liệu Mẫu (Thủ công)
Nếu chưa có dữ liệu, chạy script Python:
```bash
cd Data
python3 -m venv .venv
source .venv/bin/activate
pip install requests psycopg2-binary bcrypt
python3 books-1.py
```
*Script sẽ hỏi bạn số lượng sách và thông tin database. Nhấn Enter để dùng cấu hình mặc định.*



## Khôi Phục Dữ Liệu Thủ Công (Nếu cần)

Nếu tính năng tự động bị lỗi hoặc bạn muốn nạp lại từ đầu:

### 1. Tải file backup
Chạy lệnh sau trong Terminal để tải file về thư mục `Data`:
```bash
wget "https://drive.google.com/uc?export=download&id=1ohxEbwJbPrNUw0cFp9NJ5IJPhZ8uYyOa" -O Data/data.backup
```
*Hoặc nếu dùng curl:*
```bash
curl -L "https://drive.google.com/uc?export=download&id=1ohxEbwJbPrNUw0cFp9NJ5IJPhZ8uYyOa" -o Data/data.backup
```

### 2. Restore Database
Chạy lệnh bên dưới để nạp dữ liệu vào container (sử dụng `pg_restore` cho file `.backup`):

```bash
docker exec -i cnweb_db pg_restore -U postgres -d CNWEB -v --clean --if-exists < Data/data.backup
```
