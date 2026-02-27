@echo off
REM SİTEY-VM Demo - Windows Baslat
echo =============================================
echo   SİTEY-VM Demo Surumu v1.3.0
echo   Kurumsal: satis@siteyvm.com ^| siteyvm.com
echo =============================================
echo.
echo   Tarayicida acin: http://localhost:5000
echo   Giris:           admin / Demo2025!
echo.

cd /d "%~dp0"

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

python run.py
pause
