@echo off
REM TAS Event Vote - Windows Setup Script

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║        TAS EVENT VOTE SYSTEM - Windows Setup              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ✗ Node.js not found!
    echo Please download and install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node --version

REM Check PHP
echo.
echo Checking PHP...
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ✗ PHP not found!
    echo Please download and install PHP from https://www.php.net
    echo.
    pause
    exit /b 1
)

echo ✓ PHP is installed
php --version | findstr /R "^PHP"

REM Create data folder
echo.
echo Creating data folder...
if not exist "data" mkdir data
echo ✓ Data folder created

REM Install npm dependencies
echo.
echo Installing npm dependencies...
echo This may take a few minutes...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ✗ Failed to install dependencies
    echo Please check your internet connection and try again
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    Setup Complete!                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📝 Next steps:
echo.
echo 1. Open PowerShell/CMD Window 1 and run:
echo    cd c:\Project\TAS-Event-Vote
echo    php -S localhost:8000 -t api/
echo.
echo 2. Open PowerShell/CMD Window 2 and run:
echo    cd c:\Project\TAS-Event-Vote
echo    npm start
echo.
echo 3. Open your browser and go to:
echo    http://localhost:3000
echo.
echo 4. Or directly access:
echo    - Admin Dashboard: http://localhost:3000/admin
echo    - Voting Page:     http://localhost:3000/vote
echo    - Results Page:    http://localhost:3000/results
echo.
echo 📖 See QUICK_START.md for usage guide
echo 📚 See README.md for detailed documentation
echo.
pause
