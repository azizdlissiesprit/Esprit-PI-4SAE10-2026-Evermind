@echo off
echo Starting EverMind Digital Memory Bank (AI Microservice)...
cd /d %~dp0
call .\venv\Scripts\activate
uvicorn main:app --port 8000
pause
