#!/bin/sh

# Config
BACKUP_FILE="/data/data.backup"
BACKUP_ID="1ohxEbwJbPrNUw0cFp9NJ5IJPhZ8uYyOa" # Google Drive ID
DB_HOST="${DB_HOST:-db}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-CNWEB}"

echo "⏳ Waiting for database to be ready..."
until pg_isready -h "$DB_HOST" -U "$DB_USER"; do
  sleep 2
done

# Check if users table exists (simple check for existing data)
TABLE_EXISTS=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "✅ Database already contains data. Skipping restore."
else
    echo "⚡ Database appears empty. Starting auto-restore process..."

    # Check if backup file exists locally
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "⚠️  File $BACKUP_FILE not found."
        echo "ℹ️  Please download the backup file and save it as 'Data/data.backup' in your project folder, then restart."
        exit 0
    else
        echo "📂 Found backup file at $BACKUP_FILE."
        echo "🔄 Restoring database from $BACKUP_FILE..."
        pg_restore -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v --clean --if-exists "$BACKUP_FILE"
        echo "🎉 Restore completed successfully!"
    fi
fi
