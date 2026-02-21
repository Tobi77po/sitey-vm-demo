@echo off
setlocal enabledelayedexpansion

set BASE_DIR=%~dp0
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

"%PYTHON_EXE%" "%LAUNCHER%" %*
