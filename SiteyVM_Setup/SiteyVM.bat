@echo off
setlocal enabledelayedexpansion

set BASE_DIR=%~dp0
set PYTHONW_EXE=%BASE_DIR%python\pythonw.exe
set PYTHON_EXE=%BASE_DIR%python\python.exe
set LAUNCHER=%BASE_DIR%launcher.py

if not exist "%PYTHON_EXE%" (
    echo [HATA] Python bulunamadi: %PYTHON_EXE%
    echo Kurulum dosyalari eksik. Lutfen tekrar kurun.
    pause
    exit /b 1
)

if not exist "%LAUNCHER%" (
    echo [HATA] launcher.py bulunamadi: %LAUNCHER%
    echo Kurulum dosyalari eksik. Lutfen tekrar kurun.
    pause
    exit /b 1
)

set SITEYVM_DATA_DIR=%LOCALAPPDATA%\SiteyVM
if not exist "%SITEYVM_DATA_DIR%" mkdir "%SITEYVM_DATA_DIR%"

cd /d "%BASE_DIR%"

set PYTHONPATH=%BASE_DIR%app\backend;%BASE_DIR%app;%PYTHONPATH%
set PYTHONIOENCODING=utf-8

REM İlk çalıştırma kontrolü: config yoksa veya setup tamamlanmadıysa python.exe (konsollu)
set CONFIG_FILE=%SITEYVM_DATA_DIR%\siteyvm_config.json
set USE_CONSOLE=0

if not exist "%CONFIG_FILE%" set USE_CONSOLE=1
if exist "%CONFIG_FILE%" (
    findstr /C:"\"setup_completed\": true" "%CONFIG_FILE%" >nul 2>&1
    if errorlevel 1 set USE_CONSOLE=1
)

REM site-packages yoksa bağımlılık kurulumu gerekli
if not exist "%BASE_DIR%python\Lib\site-packages\uvicorn" set USE_CONSOLE=1

if "%USE_CONSOLE%"=="1" (
    echo.
    echo   SITEY-VM ilk kurulum baslatiliyor...
    echo   Bu pencere kurulum tamamlaninca kapanacak.
    echo.
    "%PYTHON_EXE%" "%LAUNCHER%" %*
) else (
    if exist "%PYTHONW_EXE%" (
        start "" "%PYTHONW_EXE%" "%LAUNCHER%" %*
    ) else (
        start /min "" "%PYTHON_EXE%" "%LAUNCHER%" %*
    )
)
