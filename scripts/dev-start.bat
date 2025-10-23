@echo off
REM DMOC Development Server Startup Script
REM Automatically kills processes on ports 3000/3001 and starts the dev server

echo 🚀 Starting DMOC development server...

REM Kill processes on port 3000
echo 🔍 Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo 🔪 Killing process %%a on port 3000...
        taskkill /PID %%a >nul 2>&1
        if errorlevel 1 (
            echo 🔪 Force killing process %%a on port 3000...
            taskkill /PID %%a /F >nul 2>&1
        )
    )
)

REM Kill processes on port 3001
echo 🔍 Checking for processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo 🔪 Killing process %%a on port 3001...
        taskkill /PID %%a >nul 2>&1
        if errorlevel 1 (
            echo 🔪 Force killing process %%a on port 3001...
            taskkill /PID %%a /F >nul 2>&1
        )
    )
)

REM Wait a moment for ports to be released
echo ⏳ Waiting for ports to be released...
timeout /t 2 /nobreak >nul

REM Start the development server
echo 🔄 Starting development server...
npm run dev

pause

