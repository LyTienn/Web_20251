# Hướng dẫn Deploy dự án trên Ubuntu (Linux)

Tài liệu này hướng dẫn cách cài đặt và chạy dự án trên môi trường Ubuntu Server.

## 1. Cài đặt Docker & Docker Compose

Cập nhật package index và cài đặt các dependencies:

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
```

Thêm Docker GPG key chính thức:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Thiết lập repository:

```bash
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Cài đặt Docker Engine:

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Kiểm tra cài đặt:

```bash
sudo docker --version
sudo docker compose version
```

## 2. Chuẩn bị mã nguồn

Clone source code về server hoặc copy thư mục dự án lên server.
Đảm bảo bạn đứng ở thư mục gốc của dự án (nơi chứa file `docker-compose.yml`).

## 3. Cấu hình biến môi trường

Đảm bảo file `.env` đã được cấu hình chính xác.
Nếu chưa có, tạo file `.env` từ file mẫu (nếu có) hoặc copy file `.env` từ development lên.

Lưu ý:
- `DB_HOST` phải set là `db` (trùng tên service trong docker-compose.yml).
- `DB_USER`, `DB_PASS`, `DB_NAME` phải khớp với cấu hình database bạn muốn.

## 4. Chạy dự án

Chạy lệnh sau để build và start các container:

```bash
sudo docker compose up -d --build
```

- `-d`: Chạy background (detached mode).
- `--build`: Build lại ảnh nếu có thay đổi code.

## 5. Kiểm tra

- Xem danh sách container đang chạy:
  ```bash
  sudo docker compose ps
  ```

- Xem logs của backend:
  ```bash
  sudo docker compose logs -f backend
  ```

- Truy cập web:
  Mở trình duyệt và truy cập IP của server (ví dụ: `http://<YOUR_SERVER_IP>`).



## 6. Khôi phục dữ liệu (Restore Database)

Nếu bạn có file backup database (file `.sql`), bạn có thể khôi phục dữ liệu mẫu.
**Link tải dữ liệu**: [Google Drive Link](https://drive.google.com/file/d/1msWUk-Q4kyaug3sD0OpXtdHehCc5jug4/view?usp=drive_link)

**Lưu ý**: Vì file có kích thước lớn, bạn nên dùng công cụ `gdown` để tải trực tiếp trên server:

1. Cài đặt gdown (cần Python):
   ```bash
   sudo apt install python3-pip
   pip3 install gdown
   ```
   *(Nếu server báo lỗi break system packages, dùng `pip3 install gdown --break-system-packages` hoặc dùng `venv`)*



2. Tải file:
   ```bash
   gdown 1msWUk-Q4kyaug3sD0OpXtdHehCc5jug4 -O data_5500.backup
   ```

3. Copy file vào container và khôi phục (định dạng `.backup` thường cần `pg_restore`):

```bash
# Copy file vào container
sudo docker cp data_5500.backup web20251_db:/tmp/data_5500.backup

# Chạy lệnh restore
sudo docker exec web20251_db pg_restore -U postgres -d CNWEB -v /tmp/data_5500.backup
```

*Lưu ý: Nếu lệnh trên báo lỗi về định dạng, có thể file là dạng text SQL. Hãy thử dùng:*
```bash
cat data_5500.backup | sudo docker exec -i web20251_db psql -U postgres -d CNWEB
```

Lưu ý:
- `web20251_db` là tên container database (được định nghĩa trong docker-compose.yml).
- `CNWEB` là tên database.

## 7. Dừng dự án

```bash
sudo docker compose down
```
Để xóa cả volumes (dữ liệu database sẽ mất nếu không mount ra ngoài):
```bash
sudo docker compose down -v
```
