@echo off
title HARVOX Desktop Agent v2.0 - AI Automation
cls

echo.
echo [95m  ================================================[0m
echo [95m            HARVOX Desktop Agent[0m
echo [95m  ================================================[0m
echo.
echo [96m   Version   [0m [97m: 2.0.0[0m
echo [96m   Status    [0m [92m: RUNNING[0m
echo [96m   Endpoint  [0m [97m: http://127.0.0.1:8765[0m
echo [96m   Mode      [0m [95m: Automation Ready[0m
echo [96m   Commands  [0m [97m: 60+ Supported[0m
echo.
echo [95m  ------------------------------------------------[0m
echo [93m    Keep this window open while HARVOX AI is in use[0m
echo [93m    Closing it will stop all desktop automation[0m
echo [95m  ------------------------------------------------[0m
echo.
echo [90m  Starting HARVOX AI Desktop Agent ...[0m
echo.

node "%~dp0agent.mjs"

echo.
echo [91m  Agent stopped.[0m
echo.
echo [95m  ------------------------------------------------[0m
echo [96m   (c) Haris Khan - All Rights Reserved[0m
echo [95m  ------------------------------------------------[0m
echo.
pause