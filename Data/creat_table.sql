-- Database schema for Postgres based on Sequelize models
-- Safe to run on a fresh database. Types and tables are created if missing.

-- Use DO blocks for compatibility with older Postgres (no IF NOT EXISTS for CREATE TYPE)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM ('USER', 'ADMIN');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_tier_enum') THEN
    CREATE TYPE user_tier_enum AS ENUM ('FREE', 'PREMIUM');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_type_enum') THEN
    CREATE TYPE book_type_enum AS ENUM ('FREE', 'PREMIUM');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
    CREATE TYPE subscription_status_enum AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_bookshelf_status_enum') THEN
    CREATE TYPE user_bookshelf_status_enum AS ENUM ('FAVORITE', 'READING');
  END IF;
END $$;

-- =============================
-- Tables
-- =============================

-- authors
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

-- subjects
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

-- bookshelves
CREATE TABLE IF NOT EXISTS bookshelves (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- users
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  role user_role_enum NOT NULL DEFAULT 'USER',
  tier user_tier_enum DEFAULT 'FREE',
  refresh_token TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_key UNIQUE (email)
);

-- books
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  gutenberg_id INTEGER,
  title TEXT,
  author_id INTEGER,
  language VARCHAR(10),
  download_count INTEGER,
  summary TEXT,
  image_url TEXT,
  txt_url TEXT,
  created_at TIMESTAMP,
  type book_type_enum NOT NULL DEFAULT 'FREE',
  CONSTRAINT fk_books_author FOREIGN KEY (author_id) REFERENCES authors(id)
);

-- comments
CREATE TABLE IF NOT EXISTS comments (
  comment_id UUID PRIMARY KEY,
  content TEXT,
  rating INTEGER NOT NULL,
  user_id UUID NOT NULL,
  book_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_comments_book FOREIGN KEY (book_id) REFERENCES books(id),
  CONSTRAINT comments_rating_check CHECK (rating BETWEEN 1 AND 5)
);

-- chapters
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  book_id INTEGER,
  chapter_number INTEGER,
  title TEXT,
  content TEXT,
  CONSTRAINT fk_chapters_book FOREIGN KEY (book_id) REFERENCES books(id)
);

-- book_subjects (junction)
CREATE TABLE IF NOT EXISTS book_subjects (
  id SERIAL PRIMARY KEY,
  book_id INTEGER,
  subject_id INTEGER,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_book_subjects_book FOREIGN KEY (book_id) REFERENCES books(id),
  CONSTRAINT fk_book_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- book_bookshelves (junction)
CREATE TABLE IF NOT EXISTS book_bookshelves (
  id SERIAL PRIMARY KEY,
  book_id INTEGER,
  bookshelf_id INTEGER,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_book_bookshelves_book FOREIGN KEY (book_id) REFERENCES books(id),
  CONSTRAINT fk_book_bookshelves_shelf FOREIGN KEY (bookshelf_id) REFERENCES bookshelves(id)
);

-- subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  subscription_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  package_details VARCHAR(100) NOT NULL,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP NOT NULL,
  payment_transaction_id VARCHAR(255),
  status subscription_status_enum DEFAULT 'PENDING',
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- user_bookshelf (junction with composite PK)
CREATE TABLE IF NOT EXISTS user_bookshelf (
  user_id UUID NOT NULL,
  book_id INTEGER NOT NULL,
  status user_bookshelf_status_enum NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id, status),
  CONSTRAINT fk_user_bookshelf_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_user_bookshelf_book FOREIGN KEY (book_id) REFERENCES books(id)
);

-- =============================
-- Indexes (optional but recommended for FK lookups)
-- =============================
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_book_id ON comments(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_subjects_book_id ON book_subjects(book_id);
CREATE INDEX IF NOT EXISTS idx_book_subjects_subject_id ON book_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_book_bookshelves_book_id ON book_bookshelves(book_id);
CREATE INDEX IF NOT EXISTS idx_book_bookshelves_shelf_id ON book_bookshelves(bookshelf_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookshelf_user_id ON user_bookshelf(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookshelf_book_id ON user_bookshelf(book_id);
