@echo off
REM TAS Event Vote System - Docker Setup for Windows

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   TAS EVENT VOTE SYSTEM - Docker Setup (Windows)          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Docker is not installed!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo ✓ Docker is installed
docker --version
echo.

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Docker Compose is not installed!
    echo Please install Docker Desktop which includes Docker Compose
    echo.
    pause
    exit /b 1
)

echo ✓ Docker Compose is installed
docker-compose --version
echo.

REM Create data directory
echo Creating data directory...
if not exist "data" mkdir data
echo ✓ Data directory created
echo.

REM Build images
echo Building Docker images...
echo This may take a few minutes on first run...
echo.
call docker-compose build

if %errorlevel% equ 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║                    Setup Complete!                        ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo 📝 To start the application, run:
    echo.
    echo    docker-compose up
    echo.
    echo Then open your browser:
    echo    - Home:    http://localhost:3000
    echo    - Admin:   http://localhost:3000/admin
    echo    - Vote:    http://localhost:3000/vote
    echo    - Results: http://localhost:3000/results
    echo.
    echo 📚 Documentation:
    echo    - Setup: See DOCKER_SETUP.md
    echo    - Quick Start: See QUICK_START.md
    echo.
    pause
) else (
    echo.
    echo ✗ Build failed!
    echo.
    pause
    exit /b 1
)
