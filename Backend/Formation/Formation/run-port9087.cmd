@echo off
REM Run Formation backend on port 9087 (when 9086 is already in use)
REM Utilise le profil Spring "port9087"
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=port9087
