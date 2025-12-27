@echo off
echo Setting up CNWEB Environment...

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo Please edit .env and add your API keys!
) else (
    echo .env file already exists.
)

echo.
echo Starting Docker Containers...
docker-compose up --build
