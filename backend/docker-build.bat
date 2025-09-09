@echo off
REM Build and run WellDoc Backend Docker Container
REM Usage: docker-build.bat [--rebuild]

echo 🏗️  WellDoc Backend Docker Setup
echo ==================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Build the Docker image
echo 📦 Building Docker image...
if "%1"=="--rebuild" (
    echo 🔄 Rebuilding from scratch (no cache)...
    docker-compose build --no-cache
) else (
    docker-compose build
)

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    exit /b 1
)

REM Start the container
echo 🚀 Starting WellDoc Backend...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start containers!
    exit /b 1
)

REM Wait for the service to be ready
echo ⏳ Waiting for service to be ready...
timeout /t 10 /nobreak >nul

REM Check if the service is running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ WellDoc Backend is running successfully!
    echo.
    echo 📡 API Information:
    echo    - API URL: http://localhost:8000
    echo    - Health Check: http://localhost:8000/health
    echo    - API Docs: http://localhost:8000/docs
    echo    - Redoc: http://localhost:8000/redoc
    echo.
    echo 🛠️  Docker Commands:
    echo    - View logs: docker-compose logs -f
    echo    - Stop service: docker-compose down
    echo    - Restart: docker-compose restart
    echo    - Shell access: docker-compose exec welldoc-backend /bin/bash
    echo.
    
    REM Test the health endpoint
    echo 🏥 Testing health endpoint...
    curl -s http://localhost:8000/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Health check passed!
    ) else (
        echo ❌ Health check failed. Check logs with: docker-compose logs
    )
) else (
    echo ❌ Failed to start WellDoc Backend. Check logs with: docker-compose logs
    exit /b 1
)
