# Lưu ý: Mật khẩu mặc định cho người dùng mẫu là "Password123!"; cấu hình DB đọc từ biến môi trường (mặc định DB_NAME=CNWEB, DB_PASS=hung2004).
import requests
import psycopg2
import re
import os
import uuid
import random
import bcrypt
import time

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "CNWEB"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASS", "hung2004"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
}


def connect_db():
    return psycopg2.connect(**DB_CONFIG)

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
            name TEXT NOT NULL
        );

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
            type book_type DEFAULT 'FREE'
        );

        CREATE TABLE IF NOT EXISTS subjects (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE
        );

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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


def insert_author(conn, name):
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM authors WHERE name = %s", (name,))
        result = cur.fetchone()
        if result:
            return result[0]
        cur.execute("INSERT INTO authors (name) VALUES (%s) RETURNING id;", (name,))
        conn.commit()
        return cur.fetchone()[0]

def insert_book(conn, gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO books (gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (gutenberg_id) DO NOTHING
            RETURNING id;
        """, (gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url))
        result = cur.fetchone()
        if result:
            book_id = result[0]
        else:
            cur.execute("SELECT id FROM books WHERE gutenberg_id = %s", (gutenberg_id,))
            book_id = cur.fetchone()[0]
        conn.commit()
        return book_id

def insert_relation(conn, table, book_id, values):
    if not values:
        return
    with conn.cursor() as cur:
        for name in values:
            if not name.strip():
                continue
            # Upsert the reference (subject/bookshelf)
            cur.execute(
                f"INSERT INTO {table} (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id;",
                (name,),
            )
            result = cur.fetchone()
            if result:
                ref_id = result[0]
            else:
                cur.execute(f"SELECT id FROM {table} WHERE name = %s", (name,))
                ref_row = cur.fetchone()
                if not ref_row:
                    # Fallback: create explicitly if RETURNING id was not provided
                    cur.execute(f"INSERT INTO {table} (name) VALUES (%s) RETURNING id;", (name,))
                    ref_id = cur.fetchone()[0]
                else:
                    ref_id = ref_row[0]

            rel_table = "book_subjects" if table == "subjects" else "book_bookshelves"
            ref_field = "subject_id" if table == "subjects" else "bookshelf_id"
            # Prevent duplicates using unique index, and ensure timestamps for Sequelize-managed tables
            cur.execute(
                f"INSERT INTO {rel_table} (book_id, {ref_field}, \"createdAt\", \"updatedAt\") VALUES (%s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;",
                (book_id, ref_id),
            )
        conn.commit()

def insert_chapter(conn, book_id, chapter_number, title, content):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO chapters (book_id, chapter_number, title, content)
            VALUES (%s, %s, %s, %s)
        """, (book_id, chapter_number, title, content))
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
        content = re.sub(r'\n\s*\n', '\n\n', content).strip()

        first_lines = "\n".join(content.split('\n', 2)[:2]).lower()
        for kw in epilogue_keywords:
            if kw in first_lines:
                chapter_title = kw.capitalize()
                break

        if content and len(content) >= min_content_length:
            chapters.append({'title': chapter_title, 'content': content})
        elif chapters:
            chapters[-1]['content'] += "\n\n--- " + chapter_title + " ---\n\n" + content

    return [(i + 1, ch['title'], ch['content']) for i, ch in enumerate(chapters)]


def fetch_books_paginated(max_books=1000, page_limit=100, sleep_seconds=0.5):
    # Gutendex allows up to 100 per request; use 'next' for pagination
    page_limit = max(1, min(page_limit, 100))
    url = f"https://gutendex.com/books/?languages=en&limit={page_limit}"
    results = []
    try:
        while url and len(results) < max_books:
            resp = requests.get(url, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            batch = data.get('results', [])
            results.extend(batch)
            url = data.get('next')
            if sleep_seconds:
                time.sleep(sleep_seconds)
    except Exception as e:
        print(f"⚠️ Lỗi khi gọi Gutendex phân trang: {e}")
    return results[:max_books]

def gutendex_to_txt_url(formats):
    for fmt, link in formats.items():
        if 'text/plain' in fmt.lower():
            if '/files/' in link:
                return link
            m = re.search(r'/ebooks/(\d+)', link)
            if m:
                book_id = m.group(1)
                return f"https://www.gutenberg.org/files/{book_id}/{book_id}-0.txt"
    return None

def extract_image_url(formats):
    return formats.get("image/jpeg", None)


def main():
    conn = connect_db()
    create_tables(conn)
    # Controls via environment variables
    max_books = int(os.getenv("SEED_MAX_BOOKS", "1000"))
    page_limit = int(os.getenv("SEED_PAGE_LIMIT", "100"))
    sleep_seconds = float(os.getenv("SEED_SLEEP_SECONDS", "0.5"))

    books = fetch_books_paginated(max_books=max_books, page_limit=page_limit, sleep_seconds=sleep_seconds)

    for book in books:
        title = book['title']
        gutenberg_id = book['id']
        author_name = book['authors'][0]['name'] if book['authors'] else "Unknown"
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

        text = requests.get(txt_url).text
        cleaned_text = clean_gutenberg_text(text)
        if len(cleaned_text) < 500:
            print(f"⚠️ {title}: nội dung quá ngắn")
            continue

        author_id = insert_author(conn, author_name)
        book_id = insert_book(conn, gutenberg_id, title, author_id, language, download_count, txt_url, summary, image_url)
        insert_relation(conn, "subjects", book_id, subjects)
        insert_relation(conn, "bookshelves", book_id, shelves)

        chapters = split_chapters(cleaned_text)
        for num, ch_title, ch_content in chapters:
            insert_chapter(conn, book_id, num, ch_title, ch_content)

        print(f"✅ {title}: {len(chapters)} chương đã lưu")

    # ---- Seed users, comments, and user_bookshelf if empty ----
    def get_all_book_ids(conn):
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM books")
            return [row[0] for row in cur.fetchall()]

    def table_count(conn, table):
        with conn.cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            return cur.fetchone()[0]

    def insert_user(conn, email, plain_password, full_name, role="USER"):
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

    def insert_user_bookshelf(conn, user_id, book_id, status):
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_bookshelf (user_id, book_id, status, added_at)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT DO NOTHING;
                """,
                (user_id, book_id, status),
            )
            conn.commit()

    book_ids = get_all_book_ids(conn)
    if not book_ids:
        print("⚠️ Không có sách để tạo dữ liệu người dùng/bình luận.")
    else:
        # Seed users if table is empty
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
            # Fetch existing users
            with conn.cursor() as cur:
                cur.execute("SELECT user_id FROM users LIMIT 10")
                created_users = [r[0] for r in cur.fetchall()]

        # Seed comments if empty
        if table_count(conn, "comments") == 0 and created_users:
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
        if table_count(conn, "user_bookshelf") == 0 and created_users:
            statuses = ["FAVORITE", "READING"]
            for uid in created_users:
                picks = random.sample(book_ids, k=min(8, len(book_ids)))
                for bid in picks[:4]:
                    insert_user_bookshelf(conn, uid, bid, statuses[0])
                for bid in picks[4:8]:
                    insert_user_bookshelf(conn, uid, bid, statuses[1])
            print("✅ Tạo user_bookshelf mẫu")

    conn.close()
    print("🎉 Hoàn tất!")


if __name__ == "__main__":
    main()
