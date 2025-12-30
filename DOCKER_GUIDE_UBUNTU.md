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

## 6. Dừng dự án

```bash
sudo docker compose down
```
Để xóa cả volumes (dữ liệu database sẽ mất nếu không mount ra ngoài):
```bash
sudo docker compose down -v
```
