@echo off
title NeuroVitals AI - 1-Click Bulletproof Launcher
cls
echo ==============================================================
echo           NEUROVITALS AI - ICU EARLY WARNING SYSTEM
echo               Bulletproof Keep-Alive Launcher
echo ==============================================================
echo.

rem 1. Check if Watchdog / Server is running
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "python.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] NeuroVitals AI Server and Watchdog are active!
) else (
    echo [..] Starting NeuroVitals AI Unbreakable Watchdog Engine...
    start /min python "C:\Users\tamru\.gemini\antigravity\scratch\neurovitals-ai\watchdog_service.py"
    timeout /t 3 /nobreak >nul
)

echo.
echo Launching Clinical Dashboard in your browser...
start http://localhost:8000

echo.
echo ==============================================================
if exist "V:\Desktop\ACTIVE_PUBLIC_LINK.txt" (
    echo [LIVE PUBLIC LINK FOR MOBILE / OUTSIDE USE]:
    type "V:\Desktop\ACTIVE_PUBLIC_LINK.txt"
) else (
    echo System active locally at: http://localhost:8000
)
echo ==============================================================
echo.
echo You can close this window. The server continues running safely in background.
timeout /t 5 >nul
exit