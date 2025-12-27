FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install python dependencies
RUN pip install requests psycopg2-binary bcrypt

# Copy script
COPY books-1.py .

# Run script
CMD ["python", "books-1.py"]
