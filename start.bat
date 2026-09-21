@echo off
title CogniCare NER (স্মৃতি-সেতু) - SIH 2026
color 0A

echo =======================================================================
echo          🌿 CogniCare NER (স্মৃতি-সেতু) - Smart India Hackathon 2026
echo     MDoNER & LGBRIMH Tezpur Geriatric Cognitive Care Platform
echo =======================================================================
echo.
echo [1/3] Checking environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [2/3] Preparing application...
cd /d "%~dp0apps\cognicare-app"

echo [3/3] Launching CogniCare NER Dev Server on http://localhost:5173...
echo.
echo TIP: You can test on your mobile phone on the same Wi-Fi using the Network URL shown below!
echo.

npm run dev -- --open
