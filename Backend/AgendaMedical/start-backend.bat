@echo off
echo Killing any Java processes using port 8080...
for /f "tokens=1,2 delims=," %%a in ('tasklist /fi "IMAGENAME eq java.exe" /fo csv ^| findstr /i "Console"') do (
    taskkill /PID %%a /F 2>nul
)

echo Waiting 2 seconds...
timeout /t 2 >nul

echo Starting Spring Boot backend...
mvn spring-boot:run

pause
