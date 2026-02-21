@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo.
echo ================================================================
echo   SITEY-VM Demo - Windows EXE Build Otomasyonu
echo ================================================================
echo.

echo [1/6] Python kontrol ediliyor...
python --version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Python bulunamadi! https://python.org adresinden kurun.
    echo    Kurulumda "Add Python to PATH" secenegini isaretleyin.
    pause
    exit /b 1
)
python --version
echo [OK] Python mevcut
echo.

echo [2/6] Sanal ortam hazirlaniyor...
if not exist "venv" (
    python -m venv venv
    echo    Sanal ortam olusturuldu
) else (
    echo    Mevcut sanal ortam kullaniliyor
)
call venv\Scripts\activate.bat

echo.
echo [3/6] Bagimliliklar kurulur...
pip install --quiet --upgrade pip
pip install --quiet -r requirements_windows.txt
if errorlevel 1 (
    echo [HATA] Bagimlilik kurulumu basarisiz!
    pause
    exit /b 1
)
echo [OK] Bagimliliklar kuruldu
echo.

echo [3.5/6] Uygulama ikonu olusturuluyor...
if not exist "siteyvm.ico" (
    python create_icon.py
    if errorlevel 1 (
        echo [UYARI] Ikon olusturulamadi, varsayilan ikon kullanilacak
    )
) else (
    echo    Mevcut ikon kullaniliyor
)
echo.

echo [4/6] Frontend build kontrol ediliyor...
if not exist "..\frontend\build\index.html" (
    echo [UYARI] Frontend build bulunamadi!
    echo    Lutfen once: cd ..\frontend ^&^& npm run build
    echo    Ardindan bu scripti tekrar calistirin.
    pause
    exit /b 1
)
echo [OK] Frontend build mevcut
echo.

echo [5/6] EXE olusturuluyor (bu biraz surebilir)...
python build_exe.py
if errorlevel 1 (
    echo [HATA] EXE build basarisiz!
    pause
    exit /b 1
)
echo [OK] EXE olusturuldu
echo.

echo [6/6] Installer kontrol ediliyor...
where makensis >nul 2>&1
if errorlevel 1 (
    echo [UYARI] NSIS bulunamadi - Installer olusturulmayacak.
    echo    Isterseniz https://nsis.sourceforge.io/ adresinden kurun.
    echo    Tasinabilir EXE olarak dist\SiteyVM\ klasorunu kullanabilirsiniz.
) else (
    echo    NSIS ile installer olusturuluyor...
    copy /Y LICENSE.txt dist\SiteyVM\LICENSE.txt >nul
    copy /Y KULLANIM.txt dist\SiteyVM\KULLANIM.txt >nul 2>nul
    makensis installer.nsi
    if errorlevel 1 (
        echo [UYARI] Installer olusturulamadi, tasinabilir EXE kullanilabilir
    ) else (
        echo [OK] Installer olusturuldu: SiteyVM_Demo_Setup_v1.0.0.exe
    )
)

echo.
echo ================================================================
echo   BUILD TAMAMLANDI!
echo ================================================================
echo.
echo   Tasinabilir EXE:  dist\SiteyVM\SiteyVM.exe
echo   Installer:        SiteyVM_Demo_Setup_v1.0.0.exe (NSIS varsa)
echo.
echo   Test etmek icin:
echo     cd dist\SiteyVM
echo     SiteyVM.exe
echo.
pause
