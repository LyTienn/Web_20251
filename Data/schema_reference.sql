-- Kích hoạt extension để dùng UUID (chạy một lần duy nhất cho mỗi DB)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- 1. Tạo các kiểu ENUM tùy chỉnh
-- ---
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE book_access_level AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE bookshelf_status AS ENUM ('FAVORITE', 'READING');


-- 2. Bảng USERS (Người dùng)
-- ---
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. Bảng BOOKS (Sách)
-- ---
CREATE TABLE books (
    book_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    author VARCHAR(255),
    description TEXT,
    cover_image_url TEXT,
    pdf_url TEXT,
    access_level book_access_level NOT NULL DEFAULT 'FREE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4. Bảng PLAYLISTS (Danh sách phát nhạc nền)
-- (Bảng mới cho UC Nhạc nền)
-- ---
CREATE TABLE playlists (
    playlist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- Tên playlist, ví dụ: "Nhạc Piano Lãng mạn"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---
-- 5. Bảng CATEGORIES (Thể loại)
-- ---
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    
    -- Khóa ngoại trỏ đến playlist (có thể rỗng nếu thể loại đó không có nhạc)
    playlist_id UUID REFERENCES playlists(playlist_id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---
-- 6. Bảng TRACKS (Các bản nhạc)
-- (Bảng mới cho UC Nhạc nền)
-- ---
CREATE TABLE tracks (
    track_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL, -- Tên bản nhạc
    audio_url TEXT NOT NULL, -- Đường dẫn đến file MP3 (trên S3)
    
    -- Khóa ngoại: Một bản nhạc thuộc về một playlist
    playlist_id UUID NOT NULL REFERENCES playlists(playlist_id) ON DELETE CASCADE
);

-- ---
-- 7. Bảng COMMENTS (Bình luận & Đánh giá *cho toàn bộ sách*)
-- ---
CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT, -- Có thể rỗng (NULL) nếu chỉ rating
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Khóa ngoại
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---
-- 8. Bảng SUBSCRIPTIONS (Gói hội viên)
-- ---
CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_details VARCHAR(100), -- Ví dụ: '6_THANG'
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL,
    payment_transaction_id VARCHAR(255),
    
    -- Khóa ngoại
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---
-- 9. Bảng BOOK_CATEGORIES (Bảng trung gian Sách - Thể loại, M:N)
-- ---
CREATE TABLE book_categories (
    book_id UUID NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    
    -- Khóa chính phức hợp
    PRIMARY KEY (book_id, category_id)
);

-- ---
-- 10. Bảng USER_BOOKSHELF (Tủ sách cá nhân, M:N)
-- ---
CREATE TABLE user_bookshelf (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    status bookshelf_status NOT NULL, -- 'FAVORITE' hoặc 'READING'
    
    -- Khóa chính phức hợp
    PRIMARY KEY (user_id, book_id, status)
);

-- ---
-- 11. Bảng HIGHLIGHTS (Ghi chú/Bình luận *cho đoạn văn*)
-- ---
CREATE TABLE highlights (
    highlight_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Khóa ngoại
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    
    -- Dữ liệu vị trí (dùng JSONB)
    location_data JSONB NOT NULL,
    
    -- Dữ liệu nghiệp vụ
    highlight_color VARCHAR(10), -- Ví dụ: '#FFFF00'
    comment TEXT, -- Ghi chú (có thể rỗng)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. (Tùy chọn) Tạo Indexes để tăng tốc độ truy vấn
-- ---
CREATE INDEX idx_highlights_book_id ON highlights(book_id);
CREATE INDEX idx_comments_book_id ON comments(book_id);
CREATE INDEX idx_tracks_playlist_id ON tracks(playlist_id);