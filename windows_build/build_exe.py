import os
import sys
import shutil
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_BUILD = PROJECT_ROOT / "frontend" / "build"
DIST_DIR = SCRIPT_DIR / "dist"
BUILD_DIR = SCRIPT_DIR / "build_temp"

APP_NAME = "SiteyVM"
ICON_FILE = SCRIPT_DIR / "siteyvm.ico"


def check_prerequisites():
    errors = []

    if not BACKEND_DIR.exists():
        errors.append("Backend dizini bulunamadi: {}".format(BACKEND_DIR))
    if not FRONTEND_BUILD.exists():
        errors.append("Frontend build dizini bulunamadi: {}".format(FRONTEND_BUILD))
        errors.append("Once: cd frontend && npm run build")
    if not (BACKEND_DIR / "app.py").exists():
        errors.append("Backend app.py bulunamadi")

    try:
        subprocess.run([sys.executable, "-m", "PyInstaller", "--version"],
                      capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        errors.append("PyInstaller yuklu degil. Kur: pip install pyinstaller")

    if errors:
        print("On kosul hatalari:")
        for e in errors:
            print("   - {}".format(e))
        sys.exit(1)

    print("[OK] Tum on kosullar saglandi")


def prepare_staging():
    staging = BUILD_DIR / "staging"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)

    backend_dest = staging / "backend"
    backend_dest.mkdir()
    for f in ["app.py", "models.py", "database.py", "security.py", "__init__.py"]:
        src = BACKEND_DIR / f
        if src.exists():
            shutil.copy2(src, backend_dest / f)

    logo_src = BACKEND_DIR / "LOGO.png"
    if logo_src.exists():
        shutil.copy2(logo_src, backend_dest / "LOGO.png")

    frontend_dest = staging / "frontend" / "build"
    shutil.copytree(FRONTEND_BUILD, frontend_dest)

    shutil.copy2(SCRIPT_DIR / "siteyvm_launcher.py", staging / "siteyvm_launcher.py")
    shutil.copy2(SCRIPT_DIR / "service_wrapper.py", staging / "service_wrapper.py")

    if ICON_FILE.exists():
        shutil.copy2(ICON_FILE, staging / "icon.ico")

    print("[OK] Staging hazirlandi: {}".format(staging))
    return staging


def create_spec_file(staging):
    icon_exists = ICON_FILE.exists()
    version_file = SCRIPT_DIR / "version_info.txt"
    version_exists = version_file.exists()

    spec_content = """# -*- mode: python ; coding: utf-8 -*-

import os

block_cipher = None

a = Analysis(
    [r'{launcher}'],
    pathex=[r'{staging_path}', r'{backend_path}'],
    binaries=[],
    datas=[
        (r'{backend_dir}', 'backend'),
        (r'{frontend_dir}', 'frontend/build'),
        (r'{service_file}', '.'),
    ],
    hiddenimports=[
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
        'fastapi',
        'fastapi.middleware',
        'fastapi.middleware.cors',
        'starlette',
        'starlette.responses',
        'starlette.staticfiles',
        'sqlalchemy',
        'sqlalchemy.sql.default_comparator',
        'sqlalchemy.dialects.sqlite',
        'pydantic',
        'jose',
        'jose.jwt',
        'bcrypt',
        'multipart',
        'python_multipart',
        'reportlab',
        'reportlab.lib',
        'reportlab.pdfgen',
        'reportlab.platypus',
        'openpyxl',
        'pystray',
        'PIL',
        'PIL.Image',
        'app',
        'models',
        'database',
        'security',
    ],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'numpy', 'pandas', 'scipy'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='{app_name}',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon={icon_ref},
    version={version_ref},
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='{app_name}',
)
""".format(
        launcher=staging / "siteyvm_launcher.py",
        staging_path=staging,
        backend_path=staging / "backend",
        backend_dir=staging / "backend",
        frontend_dir=staging / "frontend" / "build",
        service_file=staging / "service_wrapper.py",
        app_name=APP_NAME,
        icon_ref="r'{}'".format(ICON_FILE) if icon_exists else "None",
        version_ref="r'{}'".format(version_file) if version_exists else "None",
    )

    spec_path = BUILD_DIR / "{}.spec".format(APP_NAME)
    spec_path.parent.mkdir(parents=True, exist_ok=True)
    with open(spec_path, "w", encoding="utf-8") as f:
        f.write(spec_content)

    print("[OK] Spec dosyasi olusturuldu: {}".format(spec_path))
    return spec_path


def run_pyinstaller(spec_path):
    print("")
    print("PyInstaller calistiriliyor...")
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--clean",
        "--distpath", str(DIST_DIR),
        "--workpath", str(BUILD_DIR / "work"),
        str(spec_path),
    ]
    print("Komut: {}".format(" ".join(cmd)))
    result = subprocess.run(cmd, cwd=str(SCRIPT_DIR))
    if result.returncode != 0:
        print("[HATA] PyInstaller basarisiz!")
        sys.exit(1)
    print("[OK] EXE olusturuldu: {}".format(DIST_DIR / APP_NAME / "{}.exe".format(APP_NAME)))


def create_portable_bat():
    bat_content = "@echo off\r\nchcp 65001 >nul\r\ntitle SITEY-VM Zafiyet Yonetimi\r\necho.\r\necho Baslatiliyor...\r\nstart \"\" \"%~dp0{}.exe\"\r\n".format(APP_NAME)
    bat_path = DIST_DIR / APP_NAME / "Baslat_SiteyVM.bat"
    with open(bat_path, "w", encoding="utf-8") as f:
        f.write(bat_content)
    print("[OK] BAT dosyasi: {}".format(bat_path))


def create_readme():
    readme = """
================================================================
  SITEY-VM Demo - Kurumsal Zafiyet Yonetim Platformu
================================================================

KURULUM
---------
  1. Bu klasoru istediginiz yere kopyalayin
  2. SiteyVM.exe'yi calistirin
  3. Tarayiciniz otomatik acilacaktir

ERISIM
---------
  Yerel:  http://localhost:5000
  Ag:     http://<MAKINENIN_IP>:5000

  Kullanici: admin
  Sifre:     Demo2025!

OZELLIKLER
------------
  - Otomatik IP algilama
  - Windows baslangicindan otomatik calisma
  - IP degisiklik algilama
  - System tray ikonu
  - Tasinabilir - kurulum gerektirmez

WINDOWS SERVISI (Opsiyonel)
-----------------------------
  Yonetici olarak CMD acin:
    SiteyVM.exe install   -> Servis kur
    SiteyVM.exe start     -> Servis baslat
    SiteyVM.exe stop      -> Servis durdur
    SiteyVM.exe remove    -> Servis kaldir

NOT
-----
  Veriler %LOCALAPPDATA%/SiteyVM/ altinda saklanir

  (c) 2025-2026 SITEY Bilisim - www.siteyvm.com
"""
    readme_path = DIST_DIR / APP_NAME / "KULLANIM.txt"
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(readme)
    print("[OK] README: {}".format(readme_path))


def main():
    print("=" * 60)
    print("  SITEY-VM EXE Build Tool")
    print("=" * 60)
    print("")

    check_prerequisites()
    staging = prepare_staging()
    spec_path = create_spec_file(staging)
    run_pyinstaller(spec_path)
    create_portable_bat()
    create_readme()

    exe_path = DIST_DIR / APP_NAME / "{}.exe".format(APP_NAME)
    print("")
    print("=" * 60)
    print("  BUILD TAMAMLANDI!")
    print("  Cikti: {}".format(DIST_DIR / APP_NAME))
    print("  EXE:   {}".format(exe_path))
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print("  Boyut: {:.1f} MB".format(size_mb))
    print("=" * 60)


if __name__ == "__main__":
    main()
