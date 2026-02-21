@echo off
REM SİTEY-VM Demo - Windows Kurulum Scripti
echo =============================================
echo   SİTEY-VM Demo Surumu - Kurulum
echo   Kurumsal: satis@siteyvm.com ^| siteyvm.com
echo =============================================
echo.

cd /d "%~dp0"

REM Python kontrolu
python --version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Python bulunamadi! Python 3.9+ yukleyin.
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Node.js kontrolu
node --version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Node.js bulunamadi! Node.js 18+ yukleyin.
    echo https://nodejs.org/
    pause
    exit /b 1
)

echo Python sanal ortam olusturuluyor...
python -m venv venv
call venv\Scripts\activate.bat

echo Python bagimliliklari yukleniyor...
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo.
echo Frontend derleniyor...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo =============================================
echo   Kurulum tamamlandi!
echo.
echo   Baslatmak icin: start.bat
echo   Tarayici:       http://localhost:5000
echo   Giris:          admin / Demo2025!
echo =============================================
pause
