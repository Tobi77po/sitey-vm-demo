import os
import sys
import subprocess
import json
from pathlib import Path

APP_NAME = "SiteyVM"
CONFIG_FILENAME = "siteyvm_config.json"
MIN_PASSWORD_LENGTH = 8


def get_base_dir():
    return os.path.dirname(os.path.abspath(__file__))


def get_app_dir():
    local = os.environ.get("LOCALAPPDATA", os.path.expanduser("~"))
    app_dir = os.path.join(local, APP_NAME)
    os.makedirs(app_dir, exist_ok=True)
    return app_dir


def get_config_path():
    return os.path.join(get_app_dir(), CONFIG_FILENAME)


def is_first_run():
    config_path = get_config_path()
    if not os.path.exists(config_path):
        return True
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return not data.get("setup_completed", False)
    except Exception:
        return True


def mark_setup_completed():
    config_path = get_config_path()
    data = {}
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass
    data["setup_completed"] = True
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def validate_password(password):
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, "Sifre en az {} karakter olmali".format(MIN_PASSWORD_LENGTH)
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    if not (has_upper and has_lower and has_digit):
        return False, "Sifre buyuk harf, kucuk harf ve rakam icermeli"
    return True, ""


def install_dependencies():
    base = get_base_dir()
    python_dir = os.path.join(base, "python")
    python_exe = os.path.join(python_dir, "python.exe")

    if not os.path.exists(python_exe):
        python_exe = sys.executable
        python_dir = os.path.dirname(python_exe)

    site_packages = os.path.join(python_dir, "Lib", "site-packages")
    os.makedirs(site_packages, exist_ok=True)

    pth_files = [f for f in os.listdir(python_dir) if f.endswith("._pth")]
    for pth_file in pth_files:
        pth_path = os.path.join(python_dir, pth_file)
        try:
            with open(pth_path, "r", encoding="utf-8") as f:
                content = f.read()
            needs_write = False
            if "import site" not in content:
                content = content.rstrip("\n") + "\nimport site\n"
                needs_write = True
            if "Lib\\site-packages" not in content and "Lib/site-packages" not in content:
                content = content.rstrip("\n") + "\nLib\\site-packages\n"
                needs_write = True
            if needs_write:
                with open(pth_path, "w", encoding="utf-8") as f:
                    f.write(content)
        except Exception:
            pass

    packages = [
        "fastapi", "uvicorn[standard]", "sqlalchemy", "pydantic",
        "python-jose[cryptography]", "passlib[bcrypt]",
        "python-multipart", "aiofiles", "httpx",
        "reportlab", "openpyxl",
        "pystray", "Pillow",
    ]

    has_pip = False
    try:
        r = subprocess.run(
            [python_exe, "-m", "pip", "--version"],
            capture_output=True, encoding="utf-8", errors="replace", timeout=30,
        )
        has_pip = (r.returncode == 0)
    except Exception:
        pass

    if not has_pip:
        print("  pip kuruluyor (get-pip.py indiriliyor)...")
        get_pip_path = os.path.join(python_dir, "get-pip.py")
        try:
            import urllib.request
            urllib.request.urlretrieve(
                "https://bootstrap.pypa.io/get-pip.py", get_pip_path
            )
            r = subprocess.run(
                [python_exe, get_pip_path, "--no-warn-script-location"],
                capture_output=True, encoding="utf-8", errors="replace", timeout=120,
            )
            if r.returncode != 0:
                print("  get-pip hatasi: {}".format(
                    (r.stderr or r.stdout or "")[:300]))
        except Exception as e:
            print("  get-pip indirme hatasi: {}".format(e))
        finally:
            try:
                os.remove(get_pip_path)
            except Exception:
                pass

        try:
            r = subprocess.run(
                [python_exe, "-m", "pip", "--version"],
                capture_output=True, encoding="utf-8", errors="replace", timeout=30,
            )
            has_pip = (r.returncode == 0)
        except Exception:
            pass

    if not has_pip:
        print("  [HATA] pip kurulamadi!")
        return False

    print("  Paketler kuruluyor (bu islem birkac dakika surebilir)...")
    try:
        result = subprocess.run(
            [python_exe, "-m", "pip", "install", "--no-warn-script-location"] + packages,
            capture_output=True, encoding="utf-8", errors="replace", timeout=600,
        )
        if result.returncode != 0:
            err = result.stderr or result.stdout or ""
            print("  pip ciktisi: {}".format(err[:500]))
            return False
        return True
    except Exception as e:
        print("  Bagimlilik kurulum hatasi: {}".format(e))
        return False


def run_setup():
    if not is_first_run():
        return True

    try:
        return _run_gui_setup()
    except Exception:
        return _run_console_setup()


def _run_gui_setup():
    import tkinter as tk
    from tkinter import messagebox

    result = {"password": None, "cancelled": False}

    root = tk.Tk()
    root.title("SITEY-VM Kurulum")
    root.geometry("480x360")
    root.resizable(False, False)
    root.configure(bg="#1e293b")

    try:
        icon_path = os.path.join(get_base_dir(), "icon.ico")
        if os.path.exists(icon_path):
            root.iconbitmap(icon_path)
    except Exception:
        pass

    frame = tk.Frame(root, bg="#1e293b", padx=30, pady=20)
    frame.pack(fill="both", expand=True)

    tk.Label(
        frame, text="SITEY-VM Kurulum Sihirbazi",
        font=("Segoe UI", 16, "bold"), fg="#e2e8f0", bg="#1e293b",
    ).pack(pady=(0, 5))

    tk.Label(
        frame, text="Zafiyet Yonetim Platformu - Demo Surumu",
        font=("Segoe UI", 10), fg="#94a3b8", bg="#1e293b",
    ).pack(pady=(0, 20))

    tk.Label(
        frame, text="Yonetici sifresi belirleyin:",
        font=("Segoe UI", 11), fg="#cbd5e1", bg="#1e293b", anchor="w",
    ).pack(fill="x")

    pass1 = tk.Entry(frame, show="*", font=("Segoe UI", 12), bg="#334155", fg="#e2e8f0",
                     insertbackground="#e2e8f0", relief="flat", bd=5)
    pass1.pack(fill="x", pady=(5, 10))

    tk.Label(
        frame, text="Sifre tekrar:",
        font=("Segoe UI", 11), fg="#cbd5e1", bg="#1e293b", anchor="w",
    ).pack(fill="x")

    pass2 = tk.Entry(frame, show="*", font=("Segoe UI", 12), bg="#334155", fg="#e2e8f0",
                     insertbackground="#e2e8f0", relief="flat", bd=5)
    pass2.pack(fill="x", pady=(5, 15))

    error_label = tk.Label(frame, text="", font=("Segoe UI", 9), fg="#f87171", bg="#1e293b")
    error_label.pack()

    def on_submit():
        p1 = pass1.get()
        p2 = pass2.get()
        if p1 != p2:
            error_label.config(text="Sifreler eslesmiyor!")
            return
        valid, msg = validate_password(p1)
        if not valid:
            error_label.config(text=msg)
            return
        result["password"] = p1
        mark_setup_completed()
        root.destroy()

    def on_cancel():
        result["cancelled"] = True
        root.destroy()

    btn_frame = tk.Frame(frame, bg="#1e293b")
    btn_frame.pack(fill="x", pady=(10, 0))

    tk.Button(
        btn_frame, text="Iptal", command=on_cancel,
        font=("Segoe UI", 11), bg="#475569", fg="#e2e8f0",
        activebackground="#64748b", activeforeground="#ffffff",
        relief="flat", padx=20, pady=5, cursor="hand2",
    ).pack(side="left")

    tk.Button(
        btn_frame, text="Kurulumu Tamamla", command=on_submit,
        font=("Segoe UI", 11, "bold"), bg="#2563eb", fg="#ffffff",
        activebackground="#1d4ed8", activeforeground="#ffffff",
        relief="flat", padx=20, pady=5, cursor="hand2",
    ).pack(side="right")

    root.protocol("WM_DELETE_WINDOW", on_cancel)
    pass1.focus_set()
    root.eval("tk::PlaceWindow . center")
    root.mainloop()

    if result["cancelled"]:
        return None
    return result["password"]


def _run_console_setup():
    import getpass

    print("")
    print("  " + "=" * 50)
    print("    SITEY-VM Kurulum Sihirbazi")
    print("  " + "=" * 50)
    print("")

    for _ in range(3):
        p1 = getpass.getpass("  Yonetici sifresi: ")
        p2 = getpass.getpass("  Sifre tekrar    : ")
        if p1 != p2:
            print("  Sifreler eslesmiyor! Tekrar deneyin.\n")
            continue
        valid, msg = validate_password(p1)
        if not valid:
            print("  {}. Tekrar deneyin.\n".format(msg))
            continue
        mark_setup_completed()
        return p1

    print("  3 basarisiz deneme. Kurulum iptal edildi.")
    return None


if __name__ == "__main__":
    if is_first_run():
        deps_ok = install_dependencies()
        if not deps_ok:
            print("Bagimlilik kurulumu basarisiz!")
            sys.exit(1)
        pwd = run_setup()
        if pwd is None:
            print("Kurulum iptal edildi.")
        elif pwd is True:
            print("Kurulum zaten tamamlanmis.")
        else:
            print("Kurulum basariyla tamamlandi.")
    else:
        print("Kurulum zaten tamamlanmis.")
