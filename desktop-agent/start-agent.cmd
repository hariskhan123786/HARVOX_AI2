@echo off
title HARVOX Desktop Agent v2.0
color 0A
echo.
echo  ==========================================
echo    HARVOX Desktop Agent v2.0
echo    Listening on http://127.0.0.1:8765
echo  ==========================================
echo.
echo  Keep this window open while using HARVOX.
echo  Close it to stop desktop automation.
echo.
node "%~dp0agent.mjs"
pause
