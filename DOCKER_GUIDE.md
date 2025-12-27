# Hướng Dẫn Chạy Bằng Docker

Tài liệu này hướng dẫn cách chạy toàn bộ hệ thống (Backend, Frontend, Database) sử dụng Docker Compose.

## Yêu Cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã được cài đặt và đang chạy.

## Cách Chạy

1.  **Mở terminal** tại thư mục gốc của dự án (`e:\hung\prj\CNWEB\Web_20251`).
2.  **Chạy lệnh sau** để build và khởi động hệ thống:
    ```bash
    docker-compose up --build
    ```
    *Lưu ý: Lần chạy đầu tiên sẽ mất vài phút để tải images và build.*

3.  **Truy cập ứng dụng**:
    - **Frontend (Web App)**: [http://localhost](http://localhost) (Chạy ở cổng 80)
    - **Backend (API)**: [http://localhost:5000](http://localhost:5000)
    - **Database**: Ứng dụng tự động kết nối qua network nội bộ Docker. Nếu muốn kết nối từ tool ngoài (ví dụ DBeaver):
        - Host: `localhost`
        - Port: `5432`
        - *Lưu ý: Nếu máy bạn đang chạy Postgres local ở cổng 5432, hãy tắt nó trước khi chạy Docker để tránh xung đột.*

## Dừng Ứng Dụng
- Nhấn `Ctrl + C` trong terminal đang chạy.
- Hoặc mở terminal mới và chạy:
    ```bash
    docker-compose down
    ```

## Xử Lý Sự Cố (Troubleshooting)

### 1. Cổng bị chiếm (Port conflicts)
Nếu bạn thấy lỗi `Bind for 0.0.0.0:80 failed: port is already allocated`:
- Có thể IIS hoặc Skype hoặc một web server khác đang chiếm cổng 80.
- Giải pháp:
    1. Tắt ứng dụng đang chiếm cổng 80.
    2. Sửa `docker-compose.yml`:
       ```yaml
       frontend:
         ports:
           - "8080:80" # Đổi cổng ngoài thành 8080
       ```
    3. Truy cập Web tại `http://localhost:8080`.

### 2. Database không kết nối được
- Kiểm tra log của `backend` trong terminal.
- Đảm bảo service `db` đã khởi động xong (Healthy).
- Dữ liệu DB được lưu trong volume `postgres_data`. Nếu muốn reset sạch DB, chạy:
    ```bash
    docker-compose down -v
    ```
    *(Lưu ý: Lệnh này xoá sạch dữ liệu DB!)*

## Nạp Dữ Liệu (Tự động)

Hệ thống đã được cấu hình container `seed` để tự động chạy khi khởi động Docker.
- Container này sẽ kết nối vào Database và tải dữ liệu mẫu (mặc định lấy 20 cuốn sách để khởi động nhanh).
- Nếu bạn muốn chạy lại hoặc tải nhiều sách hơn, bạn có thể chạy thủ công theo hướng dẫn bên dưới.

## Nạp Dữ Liệu (Thủ công)

Nếu muốn nạp nhiều dữ liệu hơn:

### Yêu cầu
- Python 3.10+ đã được cài đặt.

### Cách chạy
1.  Mở terminal tại thư mục `Data`:
    ```powershell
    cd e:\hung\prj\CNWEB\Web_20251\Data
    ```
2.  Cài đặt thư viện (nếu chưa làm):
    ```powershell
    python -m venv .venv
    .\.venv\Scripts\activate
    pip install requests psycopg2-binary bcrypt
    ```
3.  Chạy script:
    ```powershell
    python books-1.py
    ```
    *Script sử dụng mật khẩu mặc định `hung2004`, đã khớp với cấu hình trong `docker-compose.yml`.*
