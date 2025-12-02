import requests
import psycopg2
import re

DB_CONFIG = {
    "dbname": "ebook",
    "user": "postgres",
    "password": "thanh2004",
    "host": "localhost",
    "port": 5432
}


def connect_db():
    return psycopg2.connect(**DB_CONFIG)

def create_tables(conn):
    with conn.cursor() as cur:
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS subjects (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE
        );

        CREATE TABLE IF NOT EXISTS bookshelves (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE
        );

        CREATE TABLE IF NOT EXISTS book_subjects (
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
            PRIMARY KEY (book_id, subject_id)
        );

        CREATE TABLE IF NOT EXISTS book_bookshelves (
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            bookshelf_id INTEGER REFERENCES bookshelves(id) ON DELETE CASCADE,
            PRIMARY KEY (book_id, bookshelf_id)
        );

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
            cur.execute(f"INSERT INTO {table} (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id;", (name,))
            result = cur.fetchone()
            if result:
                ref_id = result[0]
            else:
                cur.execute(f"SELECT id FROM {table} WHERE name = %s", (name,))
                ref_id = cur.fetchone()[0]
            rel_table = "book_subjects" if table == "subjects" else "book_bookshelves"
            ref_field = "subject_id" if table == "subjects" else "bookshelf_id"
            cur.execute(f"INSERT INTO {rel_table} (book_id, {ref_field}) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (book_id, ref_id))
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


def fetch_books_from_api():
    url = "https://gutendex.com/books/?languages=en"
    return requests.get(url).json()['results']

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

    books = fetch_books_from_api()

    for book in books[1:10]:
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

    conn.close()
    print("🎉 Hoàn tất!")


if __name__ == "__main__":
    main()
