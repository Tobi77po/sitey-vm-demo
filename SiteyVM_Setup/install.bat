@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo    SITEY-VM Bagimlilik Kurulumu
echo ============================================================
echo.

set BASE_DIR=%~dp0
set PYTHON_DIR=%BASE_DIR%python
set PYTHON_EXE=%PYTHON_DIR%\python.exe

if not exist "%PYTHON_EXE%" (
    echo [HATA] Python bulunamadi: %PYTHON_EXE%
    echo Lutfen SiteyVM_Setup klasorunun python alt klasorunu kontrol edin.
    echo.
    pause
    exit /b 1
)

echo Python: %PYTHON_EXE%
echo.

if not exist "%PYTHON_DIR%\Lib\site-packages" (
    mkdir "%PYTHON_DIR%\Lib\site-packages"
)

echo [1/3] pip hazirlaniyor...
"%PYTHON_EXE%" -m pip --version >nul 2>&1
if errorlevel 1 (
    echo pip bulunamadi, get-pip.py indiriliyor...
    "%PYTHON_EXE%" -c "import urllib.request; urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', r'%PYTHON_DIR%\get-pip.py')"
    "%PYTHON_EXE%" "%PYTHON_DIR%\get-pip.py" --no-warn-script-location
    del /f "%PYTHON_DIR%\get-pip.py" 2>nul
)
"%PYTHON_EXE%" -m pip install --upgrade pip --no-warn-script-location 2>nul

echo.
echo [2/3] Temel bagimliklar kuruluyor...
"%PYTHON_EXE%" -m pip install fastapi uvicorn[standard] sqlalchemy pydantic
if errorlevel 1 (
    echo [HATA] Temel paketler kurulamadi!
    pause
    exit /b 1
)

echo.
echo [3/3] Ek bagimliklar kuruluyor...
"%PYTHON_EXE%" -m pip install python-jose[cryptography] passlib[bcrypt] python-multipart aiofiles httpx pystray Pillow
if errorlevel 1 (
    echo [UYARI] Bazi ek paketler kurulamadi. Temel islevler yine de calisabilir.
)

echo.
echo ============================================================
echo    Kurulum tamamlandi!
echo ============================================================
echo.
echo Simdi SiteyVM.bat dosyasini calistirarak uygulamayi baslatin.
echo.
pause
