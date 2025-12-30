# --- Helper to get all book IDs from the database ---
def get_all_book_ids(conn):
    with conn.cursor() as cur:
        cur.execute('SELECT id FROM books')
        return [row[0] for row in cur.fetchall()]

# --- Helper to extract image URL from Gutendex formats dict ---
def extract_image_url(formats):
    # Gutendex usually provides image/jpeg or image/png
    for key in formats:
        if key.startswith('image/'):
            return formats[key]
    return None

# --- Helper to extract plain text URL from Gutendex formats dict ---
def gutendex_to_txt_url(formats):
    # Prefer text/plain; charset=utf-8, then text/plain
    for key in formats:
        if key.startswith('text/plain'):
            return formats[key]
    return None
# Lưu ý: Mật khẩu mặc định cho người dùng mẫu là "Password123!"; cấu hình DB đọc từ biến môi trường (mặc định DB_NAME=CNWEB, DB_PASS=hung2004).
GEMINI_API_KEY = ""  # <-- Nhập API key Gemini của bạn ở đây. VD: "AIza..."
import requests
from google import genai
import json
import psycopg2

import re
import os
import uuid
import random
import bcrypt
import time
from datetime import datetime, timedelta


# =============================================================================
# CẤU HÌNH CHẠY (USER SETTINGS)
# =============================================================================
# Số lượng sách muốn lấy (đặt số nhỏ để test, số lớn để chạy thật)
MAX_BOOKS_TO_FETCH = 5500

# Tiếp tục chạy nếu gặp lỗi khi xử lý một cuốn sách (True/False)
CONTINUE_ON_ERROR = True

# Thời gian nghỉ giữa các request để tránh bị chặn (giây)
SLEEP_BETWEEN_REQUESTS = 0.5 

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "CNWEB3"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASS", "hung2004"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
}


def connect_db():
    return psycopg2.connect(**DB_CONFIG)

# Helper to count rows in a table
def table_count(conn, table_name):
    with conn.cursor() as cur:
        cur.execute(f'SELECT COUNT(*) FROM {table_name}')
        return cur.fetchone()[0]

def ensure_timestamp_defaults(cur, table_name):
    # Ensure createdAt and updatedAt columns have DEFAULT CURRENT_TIMESTAMP if they already exist
    for col in ("createdAt", "updatedAt"):
        cur.execute(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name=%s AND column_name=%s)",
            (table_name, col),
        )
        exists = cur.fetchone()[0]
        if exists:
            cur.execute(f'ALTER TABLE {table_name} ALTER COLUMN "{col}" SET DEFAULT CURRENT_TIMESTAMP')

def create_tables(conn):
    with conn.cursor() as cur:
        # Ensure ENUM type for books.type matches Sequelize enum ('FREE','PREMIUM')
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_type')")
        exists = cur.fetchone()[0]
        if not exists:
            cur.execute("CREATE TYPE book_type AS ENUM ('FREE','PREMIUM')")

        # Core tables aligned with Sequelize models
        cur.execute("""
        CREATE TABLE IF NOT EXISTS authors (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            birth_year INTEGER,
            death_year INTEGER,
            is_deleted INTEGER DEFAULT 0
        );
        """)
        # Allow adding columns if table exists (idempotency for existing DBs)
        cur.execute('ALTER TABLE authors ADD COLUMN IF NOT EXISTS birth_year INTEGER')
        cur.execute('ALTER TABLE authors ADD COLUMN IF NOT EXISTS death_year INTEGER')
        cur.execute('ALTER TABLE authors ADD COLUMN IF NOT EXISTS is_deleted INTEGER DEFAULT 0')

        cur.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id SERIAL PRIMARY KEY,
            gutenberg_id INTEGER UNIQUE NOT NULL,
            title TEXT NOT NULL,
            author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL,
            language VARCHAR(10),
            download_count INTEGER,
            summary TEXT,
            image_url TEXT,
            txt_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            type book_type DEFAULT 'FREE',
            embedding TEXT,
            is_deleted INTEGER DEFAULT 0
        );
        """)
        cur.execute('ALTER TABLE books ADD COLUMN IF NOT EXISTS embedding TEXT')
        cur.execute('ALTER TABLE books ADD COLUMN IF NOT EXISTS is_deleted INTEGER DEFAULT 0')

        cur.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            is_deleted INTEGER DEFAULT 0
        );
        """)
        cur.execute('ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_deleted INTEGER DEFAULT 0')

        cur.execute("""
        CREATE TABLE IF NOT EXISTS bookshelves (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE
        );
        """)

        # Ensure timestamps for bookshelves (Sequelize default timestamps=true in model)
        cur.execute(
            'ALTER TABLE bookshelves ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        )
        cur.execute(
            'ALTER TABLE bookshelves ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        )
        ensure_timestamp_defaults(cur, "bookshelves")
        # Ensure unique indexes exist even if tables were created earlier without constraints
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS ux_books_gutenberg_id ON books (gutenberg_id)"
        )
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS ux_subjects_name ON subjects (name)"
        )
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS ux_bookshelves_name ON bookshelves (name)"
        )

        # Relation tables with id PK to match Sequelize definitions
        cur.execute("""
        CREATE TABLE IF NOT EXISTS book_subjects (
            id SERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE
        );
        """)
        # Ensure timestamp columns exist and have defaults to satisfy Sequelize's defaults
        cur.execute(
            'ALTER TABLE book_subjects ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        )
        cur.execute(
            'ALTER TABLE book_subjects ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        )
        ensure_timestamp_defaults(cur, "book_subjects")
        # Add unique index to prevent duplicates (supports ON CONFLICT DO NOTHING)
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS ux_book_subjects ON book_subjects (book_id, subject_id)"
        )

        cur.execute("""
        CREATE TABLE IF NOT EXISTS book_bookshelves (
            id SERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            bookshelf_id INTEGER REFERENCES bookshelves(id) ON DELETE CASCADE
        );
        """)
        cur.execute(
            'ALTER TABLE book_bookshelves ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        )
        cur.execute(
            'ALTER TABLE book_bookshelves ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        )
        ensure_timestamp_defaults(cur, "book_bookshelves")
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS ux_book_bookshelves ON book_bookshelves (book_id, bookshelf_id)"
        )

        cur.execute("""
        CREATE TABLE IF NOT EXISTS chapters (
            id SERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            chapter_number INTEGER,
            title TEXT,
            content TEXT,
            audio_links JSON DEFAULT '[]',
            summary TEXT,
            comic_data JSON DEFAULT '[]'
        );
        """)
        cur.execute("ALTER TABLE chapters ADD COLUMN IF NOT EXISTS audio_links JSON DEFAULT '[]'")
        cur.execute("ALTER TABLE chapters ADD COLUMN IF NOT EXISTS summary TEXT")
        cur.execute("ALTER TABLE chapters ADD COLUMN IF NOT EXISTS comic_data JSON DEFAULT '[]'")

        # Users
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role')")
        if not cur.fetchone()[0]:
            cur.execute("CREATE TYPE user_role AS ENUM ('USER', 'ADMIN')")
        
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_tier')")
        if not cur.fetchone()[0]:
            cur.execute("CREATE TYPE user_tier AS ENUM ('FREE', 'PREMIUM')")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name VARCHAR(255),
            role user_role DEFAULT 'USER',
            tier user_tier DEFAULT 'FREE',
            refresh_token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_deleted INTEGER DEFAULT 0
        );
        """)
        # Idempotency for users
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS tier user_tier DEFAULT 'FREE'")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted INTEGER DEFAULT 0")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)")
        
        # Comments - sentiment enum
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_sentiment')")
        if not cur.fetchone()[0]:
            cur.execute("CREATE TYPE comment_sentiment AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE')")
        
        # Comments
        cur.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            comment_id UUID PRIMARY KEY,
            content TEXT,
            rating INTEGER,
            user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(20) DEFAULT 'PENDING',
            sentiment comment_sentiment,
            is_deleted INTEGER DEFAULT 0
        );
        """)
        cur.execute("ALTER TABLE comments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING'")
        cur.execute("ALTER TABLE comments ADD COLUMN IF NOT EXISTS sentiment comment_sentiment")
        cur.execute("ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_deleted INTEGER DEFAULT 0")

        # User Bookshelf - updated schema with is_favorite/is_reading instead of status enum
        cur.execute("""
        CREATE TABLE IF NOT EXISTS user_bookshelf (
            user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            is_favorite BOOLEAN DEFAULT FALSE,
            is_reading BOOLEAN DEFAULT FALSE,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_read_chapter_id INTEGER,
            last_read_at TIMESTAMP,
            last_read_scroll_position FLOAT DEFAULT 0,
            PRIMARY KEY (user_id, book_id)
        );
        """)
        cur.execute("ALTER TABLE user_bookshelf ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE")
        cur.execute("ALTER TABLE user_bookshelf ADD COLUMN IF NOT EXISTS is_reading BOOLEAN DEFAULT FALSE")
        cur.execute("ALTER TABLE user_bookshelf ADD COLUMN IF NOT EXISTS last_read_chapter_id INTEGER")
        cur.execute("ALTER TABLE user_bookshelf ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP")
        cur.execute("ALTER TABLE user_bookshelf ADD COLUMN IF NOT EXISTS last_read_scroll_position FLOAT DEFAULT 0")

        # Subscriptions
        # Status enum
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status')")
        if not cur.fetchone()[0]:
            cur.execute("CREATE TYPE subscription_status AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED')")
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            subscription_id UUID PRIMARY KEY,
            user_id UUID NOT NULL, 
            package_details VARCHAR(100) NOT NULL,
            start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expiry_date TIMESTAMP NOT NULL,
            payment_transaction_id VARCHAR(255),
            status subscription_status DEFAULT 'PENDING'
        );
        """)

        # Tasks table - for TTS, SUMMARY, TRANSLATION, COMIC
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type')")
        if not cur.fetchone()[0]:
            cur.execute("CREATE TYPE task_type AS ENUM ('TTS', 'SUMMARY', 'TRANSLATION', 'COMIC')")
        
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status')")
        if not cur.fetchone()[0]:
            cur.execute("CREATE TYPE task_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id UUID PRIMARY KEY,
            type task_type NOT NULL,
            status task_status DEFAULT 'PENDING' NOT NULL,
            result JSON,
            error TEXT,
            progress JSON,
            chapter_id INTEGER,
            book_id INTEGER,
            book_title TEXT,
            chapter_title TEXT,
            voice_name VARCHAR(50),
            user_id INTEGER,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        cur.execute('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS result JSON')
        cur.execute('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS error TEXT')
        cur.execute('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress JSON')
        cur.execute('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS book_title TEXT')
        cur.execute('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS chapter_title TEXT')
        cur.execute('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS voice_name VARCHAR(50)')
        cur.execute('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id INTEGER')

        # Translations table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS translations (
            translation_id SERIAL PRIMARY KEY,
            chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
            language VARCHAR(50) NOT NULL,
            translated_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_translations_chapter_language ON translations (chapter_id, language)")

        # System settings table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            id SERIAL PRIMARY KEY,
            key VARCHAR(255) UNIQUE NOT NULL,
            value TEXT
        );
        """)
        
        conn.commit()


def clean_gutenberg_text(text):
    start_match = re.search(r"\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK [^*]* \*\*\*", text, re.IGNORECASE)
    if start_match:
        text = text[start_match.end():]

    end_match = re.search(r"\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK [^*]* \*\*\*", text, re.IGNORECASE)
    if end_match:
        text = text[:end_match.start()]

    # Bỏ các dòng meta ngắn đầu file
    lines = text.split('\n')
    for i, line in enumerate(lines[:100]):
        if len(line.strip()) > 80 and not re.search(r"(Project Gutenberg|EBook|Copyright|Produced by|Transcriber)", line, re.IGNORECASE):
            text = "\n".join(lines[i:])
            break

    return text.strip()


def insert_author(conn, name, birth_year, death_year):
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM authors WHERE name = %s", (name,))
        result = cur.fetchone()
        if result:
            return result[0]
        cur.execute(
            "INSERT INTO authors (name, birth_year, death_year) VALUES (%s, %s, %s) RETURNING id;",
            (name, birth_year, death_year)
        )
        conn.commit()
        return cur.fetchone()[0]

def insert_book(conn, gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url, book_type='FREE'):
    # Insert book first (without embedding)
    with conn.cursor() as cur:
        cur.execute(""" 
            INSERT INTO books (gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url, type, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (gutenberg_id) DO NOTHING
            RETURNING id;
        """, (gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url, book_type))
        result = cur.fetchone()
        if result:
            book_id = result[0]
        else:
            cur.execute("SELECT id FROM books WHERE gutenberg_id = %s", (gutenberg_id,))
            row = cur.fetchone()
            book_id = row[0] if row else None
        conn.commit()
    if not book_id:
        return None

    # Sinh embedding cho book title (và summary nếu có)
    embedding = None
    embed_text = title
    if summary:
        embed_text += ". " + summary
    if GEMINI_API_KEY and embed_text:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            for attempt in range(3):
                try:
                    result = client.models.embed_content(
                        model="text-embedding-004",
                        contents=embed_text
                    )
                    embedding = result.embeddings[0].values if result and result.embeddings else None
                    if embedding:
                        break
                except Exception as e:
                    print(f"[WARN] Lần thử embedding {attempt+1} cho book {title} thất bại: {e}")
                    time.sleep(1)
            if embedding is None:
                print(f"[WARN] Không lấy được embedding cho book {title} sau 3 lần thử!")
        except Exception as e:
            print(f"[ERROR] Lỗi import hoặc khởi tạo Gemini SDK: {e}")

    # Lưu embedding vào DB nếu có
    if embedding is not None:
        with conn.cursor() as cur:
            cur.execute("UPDATE books SET embedding = %s WHERE id = %s", (json.dumps(embedding), book_id))
            conn.commit()
        print(f"    ✨ Đã tạo và lưu embedding cho: {title}")
    else:
        print(f"    ⚠️ Không có embedding nào được lưu cho: {title}")
    return book_id


def insert_relation(conn, table, book_id, values):
    if not values:
        return
    
    # Determine junction table and FK column
    junction_table = f"book_{table}"
    fk_column = "subject_id" if table == "subjects" else "bookshelf_id"
    
    with conn.cursor() as cur:
        for name in values:
            if not name.strip():
                continue
            
            # 1. Upsert Entity
            cur.execute(
                f"INSERT INTO {table} (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id;",
                (name,),
            )
            result = cur.fetchone()
            
            entity_id = None
            if result:
                entity_id = result[0]
            else:
                cur.execute(f"SELECT id FROM {table} WHERE name = %s", (name,))
                row = cur.fetchone()
                if row:
                    entity_id = row[0]
            
            # 2. Insert Junction
            if entity_id:
                cur.execute(
                    f"""
                    INSERT INTO {junction_table} (book_id, {fk_column}) 
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING;
                    """,
                    (book_id, entity_id)
                )
        conn.commit()

def insert_chapter(conn, book_id, chapter_number, title, content):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO chapters (book_id, chapter_number, title, content)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
            """,
            (book_id, chapter_number, title, content)
        )
        conn.commit()


def split_chapters(text, min_content_length=150):
    pattern = re.compile(
        r"^\s*(?:CHAPTER|Chapter|CH\.|Ch\.|CHUONG|Chương)\s*([0-9IVXLCDM]+|[A-Za-z]+)(?:[.\s:—–-]*\s*(.*))?$",
        re.MULTILINE | re.IGNORECASE
    )
    chapters = []
    matches = list(pattern.finditer(text))

    if not matches:
        text_strip = text.strip()
        if text_strip:
            return [(1, "Full Book", text_strip)]
        return []

    preface_content = text[:matches[0].start()].strip()
    if preface_content:
        chapters.append({'title': "Preface / Introduction", 'content': preface_content})

    epilogue_keywords = ['epilogue', 'conclusion', 'postscript']

    for i, match in enumerate(matches):
        start_index = match.end()
        end_index = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        chapter_title = match.group(0).strip()
        content = text[start_index:end_index].strip()
        content = re.sub(r'\\n\\s*\\n', '\\n\\n', content).strip()

        first_lines = "\\n".join(content.split('\\n', 2)[:2]).lower()
        for kw in epilogue_keywords:
            if kw in first_lines:
                chapter_title = kw.capitalize()
                break

        if content and len(content) >= min_content_length:
            chapters.append({'title': chapter_title, 'content': content})
        elif chapters:
            chapters[-1]['content'] += "\\n\\n--- " + chapter_title + " ---\\n\\n" + content

    return [(i + 1, ch['title'], ch['content']) for i, ch in enumerate(chapters)]


def fetch_books_paginated(max_books=1000, page_limit=100, sleep_seconds=0.5):
    # Gutendex allows up to 100 per request; use 'next' for pagination
    page_limit = max(1, min(page_limit, 100))
    url = f"https://gutendex.com/books/?languages=en&limit={page_limit}"
    results = []
    count = 0
    
    while url and count < max_books:
        print(f"📥 Đang tải trang sách... (Đã lấy {count}/{max_books})")
        attempts = 0
        max_retries = 3
        success = False
        batch = []
        
        while attempts < max_retries:
            try:
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                
                batch = data.get('results', [])
                url = data.get('next')
                success = True
                
                if sleep_seconds:
                    time.sleep(sleep_seconds)
                break
            except Exception as e:
                attempts += 1
                print(f"⚠️ Lỗi khi gọi Gutendex (Lần {attempts}/{max_retries}): {e}")
                time.sleep(2 * attempts)
        
        if not success:
            print("❌ Không thể tải thêm sau nhiều lần thử. Dừng tại đây.")
            return results
        
        # Add batch to results and update count
        results.extend(batch)
        count += len(batch)
    
    return results

def insert_user(conn, email, plain_password, full_name, role):
    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    with conn.cursor() as cur:
        # Try insert by email uniqueness
        cur.execute(
            """
            INSERT INTO users (user_id, email, password_hash, full_name, role, created_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (email) DO NOTHING
            RETURNING user_id;
            """,
            (user_id, email, password_hash, full_name, role),
        )
        res = cur.fetchone()
        if res:
            conn.commit()
            return res[0]
        # Fallback: fetch existing
        cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        conn.commit()
        return row[0] if row else None

def insert_comment(conn, user_id, book_id, content, rating):
    comment_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO comments (comment_id, user_id, book_id, content, rating, created_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING;
            """,
            (comment_id, user_id, book_id, content, rating),
        )
        conn.commit()

def insert_user_bookshelf(conn, user_id, book_id, is_favorite=False, is_reading=False):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO user_bookshelf (user_id, book_id, is_favorite, is_reading, added_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, book_id) DO UPDATE SET is_favorite = EXCLUDED.is_favorite, is_reading = EXCLUDED.is_reading;
            """,
            (user_id, book_id, is_favorite, is_reading),
        )
        conn.commit()

def seed_users(conn):
    if table_count(conn, "users") == 0:
        base_users = [
            ("admin@example.com", "Admin User", "ADMIN"),
            ("user1@example.com", "User One", "USER"),
            ("user2@example.com", "User Two", "USER"),
            ("reader@example.com", "Avid Reader", "USER"),
            ("guest@example.com", "Guest User", "USER"),
        ]
        created_users = []
        for email, name, role in base_users:
            uid = insert_user(conn, email, "Password123!", name, role)
            if uid:
                created_users.append(uid)
        print(f"✅ Tạo người dùng mẫu: {len(created_users)}")
    else:
        print("ℹ️ Người dùng đã tồn tại (skip).")

def seed_engagement(conn):
    book_ids = get_all_book_ids(conn)
    if not book_ids:
        print("⚠️ Không có sách để tạo dữ liệu bình luận/kệ sách.")
        return

    # Fetch existing users
    with conn.cursor() as cur:
        cur.execute("SELECT user_id FROM users LIMIT 10")
        created_users = [r[0] for r in cur.fetchall()]
    
    if not created_users:
        print("⚠️ Không có user để tạo engagement.")
        return

    # Seed comments if empty
    if table_count(conn, "comments") == 0:
        for _ in range(min(30, len(book_ids) * 2)):
            uid = random.choice(created_users)
            bid = random.choice(book_ids)
            rating = random.randint(3, 5)
            content = random.choice([
                "Great read!",
                "Loved the characters.",
                "Interesting plot, a bit slow in parts.",
                None,
            ])
            insert_comment(conn, uid, bid, content, rating)
        print("✅ Tạo bình luận mẫu")

    # Seed user_bookshelf if empty
    if table_count(conn, "user_bookshelf") == 0:
        for uid in created_users:
            picks = random.sample(book_ids, k=min(8, len(book_ids)))
            for bid in picks[:4]:
                insert_user_bookshelf(conn, uid, bid, is_favorite=True, is_reading=False)
            for bid in picks[4:8]:
                insert_user_bookshelf(conn, uid, bid, is_favorite=False, is_reading=True)
        print("✅ Tạo user_bookshelf mẫu")

    # Không seed dữ liệu cho bảng tasks

    # Không seed dữ liệu cho bảng translations

    # Không seed dữ liệu cho bảng system_settings
    # if table_count(conn, "system_settings") == 0:
    #     with conn.cursor() as cur:
    #         cur.execute("INSERT INTO system_settings (key, value) VALUES (%s, %s) ON CONFLICT DO NOTHING;", ("site_name", "CNWEB Library"))
    #         cur.execute("INSERT INTO system_settings (key, value) VALUES (%s, %s) ON CONFLICT DO NOTHING;", ("maintenance_mode", "off"))
    #         conn.commit()
    #     print("✅ Tạo system_settings mẫu")

def insert_subscription(conn, user_id, package_details, duration_days, status, transaction_id=None):
    sub_id = str(uuid.uuid4())
    start_date = datetime.now()
    expiry_date = start_date + timedelta(days=duration_days)
    
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO subscriptions (subscription_id, user_id, package_details, start_date, expiry_date, payment_transaction_id, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (subscription_id) DO NOTHING;
            """,
            (sub_id, user_id, package_details, start_date, expiry_date, transaction_id, status)
        )
        conn.commit()

def seed_subscriptions(conn):
    # Không seed dữ liệu cho bảng subscriptions
    pass


import sys

def check_database_exists():
    """
    Connect to the default 'postgres' database to check if the target database exists.
    If not, exit with error.
    """
    target_db = DB_CONFIG["dbname"]
    print(f"Checking database '{target_db}'...")
    
    # 1. Connect to default 'postgres' db
    try:
        # Create a copy of config for postgres connection
        pg_config = DB_CONFIG.copy()
        pg_config["dbname"] = "postgres"
        
        conn = psycopg2.connect(**pg_config)
        
        with conn.cursor() as cur:
            # 2. Check existence
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
            exists = cur.fetchone()
            
            if not exists:
                print(f"❌ Error: Database '{target_db}' does not exist.")
                print("➡️  Please create it manually using: CREATE DATABASE CNWEB2;")
                sys.exit(1)
            else:
                print(f"✅ Database '{target_db}' exists. Proceeding...")
                
        conn.close()
    except Exception as e:
        print(f"❌ Error checking database existence: {e}")
        sys.exit(1)

def main():
    check_database_exists()
    conn = connect_db()
    create_tables(conn)
    
    # 1. Seed Users (Move to top as requested)
    seed_users(conn)

    # Controls via environment variables
    # Controls via environment variables or constants
    max_books = MAX_BOOKS_TO_FETCH
    page_limit = int(os.getenv("SEED_PAGE_LIMIT", "100"))
    sleep_seconds = SLEEP_BETWEEN_REQUESTS

    print(f"🚀 Bắt đầu lấy {max_books} sách...")
    books = fetch_books_paginated(max_books=max_books, page_limit=page_limit, sleep_seconds=sleep_seconds)

    for book in books:
        try:
            title = book['title']
            gutenberg_id = book['id']
            
            # Author details
            author_data = book['authors'][0] if book['authors'] else None
            author_name = author_data['name'] if author_data else "Unknown"
            birth_year = author_data.get('birth_year') if author_data else None
            death_year = author_data.get('death_year') if author_data else None

            language = book['languages'][0] if book['languages'] else None
            download_count = book['download_count']
            summary = book['summaries'][0] if book.get('summaries') else None
            image_url = extract_image_url(book['formats'])
            subjects = book.get('subjects', [])
            shelves = book.get('bookshelves', [])

            txt_url = gutendex_to_txt_url(book['formats'])
            if not txt_url:
                print(f"❌ {title}: Không có TXT")
                continue

            print(f"    ⬇️ Downloading content for: {title}...")
            text = requests.get(txt_url, timeout=60).text
            cleaned_text = clean_gutenberg_text(text)
            if len(cleaned_text) < 500:
                print(f"⚠️ {title}: nội dung quá ngắn")
                continue

            author_id = insert_author(conn, author_name, birth_year, death_year)
            
            # Randomize book type
            book_type = random.choice(['FREE', 'PREMIUM'])
            
            book_id = insert_book(conn, gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url, book_type)
            insert_relation(conn, "subjects", book_id, subjects)
            insert_relation(conn, "bookshelves", book_id, shelves)

            chapters = split_chapters(cleaned_text)
            for num, ch_title, ch_content in chapters:
                insert_chapter(conn, book_id, num, ch_title, ch_content)

            print(f"✅ {title}: {len(chapters)} chương đã lưu")

        except Exception as e:
            print(f"❌ LỖI khi xử lý sách: {e}")
            if not CONTINUE_ON_ERROR:
                raise e
            print("➡️ Đang bỏ qua và tiếp tục sách tiếp theo...")

    # 2. Seed Engagement (Depends on books)
    seed_engagement(conn)

    # 3. Seed Subscriptions
    seed_subscriptions(conn)

    conn.close()
    print("🎉 Hoàn tất!")


if __name__ == "__main__":
    main()
