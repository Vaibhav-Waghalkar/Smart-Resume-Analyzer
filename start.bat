@echo off
title Smart Resume Analyzer - Launcher
color 0A

echo ============================================
echo    Smart Resume Analyzer - Starting Up...
echo ============================================
echo.

:: Start Backend in a new window
echo [1/2] Starting FastAPI Backend on port 8000...
start "Smart Resume Analyzer - Backend" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Small delay before starting frontend
timeout /t 2 /nobreak >nul

:: Start Frontend in a new window
echo [2/2] Starting React Frontend on port 5173...
start "Smart Resume Analyzer - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait for servers to be ready
echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

:: Open browser
echo Opening app in browser...
start "" "http://localhost:5173"

echo.
echo ============================================
echo  Backend  : http://localhost:8000
echo  Frontend : http://localhost:5173
echo  API Docs : http://localhost:8000/docs
echo ============================================
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
