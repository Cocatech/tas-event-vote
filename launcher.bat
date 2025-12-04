@echo off
REM TAS Event Vote - Quick Launcher

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║      TAS EVENT VOTE SYSTEM - Quick Launcher               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Choose what to do:
echo.
echo 1. Start PHP Server (localhost:8000)
echo 2. Start Node Server (localhost:3000)
echo 3. Open Admin Dashboard
echo 4. Open Voting Page
echo 5. Open Results Page
echo 6. Open Home Page
echo 7. Start Both Servers (opens in separate windows)
echo 0. Exit
echo.

set /p choice="Enter your choice (0-7): "

if "%choice%"=="1" goto start_php
if "%choice%"=="2" goto start_node
if "%choice%"=="3" goto open_admin
if "%choice%"=="4" goto open_vote
if "%choice%"=="5" goto open_results
if "%choice%"=="6" goto open_home
if "%choice%"=="7" goto start_both
if "%choice%"=="0" goto exit
goto invalid

:start_php
cls
echo Starting PHP Server on localhost:8000...
echo.
cd /d c:\Project\TAS-Event-Vote
php -S localhost:8000 -t api/
goto end

:start_node
cls
echo Starting Node Server on localhost:3000...
echo Make sure PHP server is running in another terminal!
echo.
cd /d c:\Project\TAS-Event-Vote
npm start
goto end

:open_admin
start http://localhost:3000/admin
echo Opening Admin Dashboard...
timeout /t 2 /nobreak
goto menu

:open_vote
start http://localhost:3000/vote
echo Opening Voting Page...
timeout /t 2 /nobreak
goto menu

:open_results
start http://localhost:3000/results
echo Opening Results Page...
timeout /t 2 /nobreak
goto menu

:open_home
start http://localhost:3000
echo Opening Home Page...
timeout /t 2 /nobreak
goto menu

:start_both
cls
echo.
echo Starting both servers in separate windows...
echo.
echo If this is first time, npm install will run first.
echo.
echo ⚠️ IMPORTANT: Keep both windows open!
echo   - Window 1: PHP Server (localhost:8000)
echo   - Window 2: Node Server (localhost:3000)
echo.
echo Opening in 3 seconds...
timeout /t 3 /nobreak

start "PHP Server" cmd /k "cd /d c:\Project\TAS-Event-Vote && php -S localhost:8000 -t api/"
timeout /t 2 /nobreak
start "Node Server" cmd /k "cd /d c:\Project\TAS-Event-Vote && npm start"

echo.
echo Both servers starting...
echo Opening Admin Dashboard in 5 seconds...
timeout /t 5 /nobreak

start http://localhost:3000/admin
goto exit

:invalid
cls
echo Invalid choice. Please try again.
timeout /t 2 /nobreak
goto menu

:menu
goto :menu

:end
pause
exit /b 0

:exit
echo.
echo Thank you for using TAS Event Vote System!
echo.
exit /b 0
