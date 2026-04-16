@echo off
setlocal enabledelayedexpansion

cd /d "c:\Users\iskandar\Downloads\EverMind-main\EverMind-main\Backend\Formation\Formation"

set "JAVA_HOME=C:\Users\iskandar\AppData\Local\Programs\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
set "PATH=!JAVA_HOME!\bin;!PATH!"

echo Starting Backend on port 9087 with H2 Database...
echo JAVA_HOME: !JAVA_HOME!

call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=port9087

endlocal
