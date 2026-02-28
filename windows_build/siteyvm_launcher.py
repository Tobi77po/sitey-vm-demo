import os
import sys
import json
import time
import socket
import winreg
import logging
import threading
import webbrowser
import subprocess
from pathlib import Path
from datetime import datetime

APP_NAME = "SiteyVM"
APP_DISPLAY_NAME = "SITEY-VM"
APP_VERSION = "1.4.0-demo"
SERVICE_PORT = 5000
CONFIG_FILENAME = "siteyvm_config.json"
LOG_FILENAME = "siteyvm.log"


def get_app_dir():
    local = os.environ.get("LOCALAPPDATA", os.path.expanduser("~"))
    app_dir = os.path.join(local, APP_NAME)
    os.makedirs(app_dir, exist_ok=True)
    return app_dir


def get_base_dir():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


def setup_logging():
    app_dir = get_app_dir()
    log_path = os.path.join(app_dir, LOG_FILENAME)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(log_path, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger(APP_NAME)


def get_local_ips():
    ips = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("8.8.8.8", 80))
            ips.add(s.getsockname()[0])
        except Exception:
            pass
        finally:
            s.close()
    except Exception:
        pass

    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip = info[4][0]
            if not ip.startswith("127."):
                ips.add(ip)
    except Exception:
        pass

    try:
        result = subprocess.run(
            ["ipconfig"],
            capture_output=True,
            timeout=5,
            encoding="utf-8",
            errors="replace",
        )
        for line in result.stdout.split("\n"):
            line = line.strip()
            if "IPv4" in line and ":" in line:
                ip = line.split(":")[-1].strip()
                if ip and not ip.startswith("127."):
                    ips.add(ip)
    except Exception:
        pass

    if not ips:
        ips.add("127.0.0.1")
    return sorted(ips)


def get_primary_ip():
    ips = get_local_ips()
    for ip in ips:
        if ip.startswith("192.168.") or ip.startswith("10."):
            return ip
    return ips[0] if ips else "127.0.0.1"


class AppConfig:
    def __init__(self):
        self.config_path = os.path.join(get_app_dir(), CONFIG_FILENAME)
        self.data = self._load()

    def _load(self):
        defaults = {
            "port": SERVICE_PORT,
            "auto_start": True,
            "last_ip": "",
            "installed_at": datetime.now().isoformat(),
            "open_browser_on_start": True,
            "first_run": True,
            "setup_completed": False,
        }
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                defaults.update(saved)
                return defaults
            except Exception:
                pass
        return defaults

    def save(self):
        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)

    @property
    def port(self):
        return self.data.get("port", SERVICE_PORT)

    @property
    def last_ip(self):
        return self.data.get("last_ip", "")

    @last_ip.setter
    def last_ip(self, value):
        self.data["last_ip"] = value
        self.save()

    @property
    def auto_start(self):
        return self.data.get("auto_start", True)

    @auto_start.setter
    def auto_start(self, value):
        self.data["auto_start"] = value
        self.save()

    @property
    def first_run(self):
        return self.data.get("first_run", True)

    @first_run.setter
    def first_run(self, value):
        self.data["first_run"] = value
        self.save()


def set_autostart(enable=True):
    key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
        if enable:
            if getattr(sys, "frozen", False):
                exe_path = sys.executable
            else:
                exe_path = f'"{sys.executable}" "{os.path.abspath(__file__)}"'
            winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, f'"{exe_path}" --background')
        else:
            try:
                winreg.DeleteValue(key, APP_NAME)
            except FileNotFoundError:
                pass
        winreg.CloseKey(key)
        return True
    except Exception:
        return False


def add_firewall_rule(port, logger):
    try:
        subprocess.run(
            ["netsh", "advfirewall", "firewall", "delete", "rule",
             "name={}-Port-{}".format(APP_DISPLAY_NAME, port)],
            capture_output=True, encoding="utf-8", errors="replace", timeout=10,
        )
        result = subprocess.run(
            ["netsh", "advfirewall", "firewall", "add", "rule",
             "name={}-Port-{}".format(APP_DISPLAY_NAME, port),
             "dir=in", "action=allow", "protocol=TCP",
             "localport={}".format(port)],
            capture_output=True, encoding="utf-8", errors="replace", timeout=10,
        )
        if result.returncode == 0:
            logger.info("Firewall kurali eklendi: %s-Port-%s", APP_DISPLAY_NAME, port)
        else:
            logger.warning("Firewall kurali eklenemedi: %s", result.stderr.strip())
    except Exception as e:
        logger.warning("Firewall isleminde hata: %s", e)


class IPMonitor:
    def __init__(self, config, logger, callback=None):
        self.config = config
        self.logger = logger
        self.callback = callback
        self.current_ip = get_primary_ip()
        self._running = False
        self._thread = None
        self.check_interval = 30

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()
        self.logger.info("IP Izleyici baslatildi. Mevcut IP: %s", self.current_ip)

    def stop(self):
        self._running = False

    def _monitor_loop(self):
        while self._running:
            try:
                new_ip = get_primary_ip()
                if new_ip != self.current_ip:
                    old_ip = self.current_ip
                    self.current_ip = new_ip
                    self.config.last_ip = new_ip
                    self.logger.info("IP degisikligi algilandi: %s -> %s", old_ip, new_ip)
                    if self.callback:
                        self.callback(old_ip, new_ip)
            except Exception:
                pass
            time.sleep(self.check_interval)


class ServerManager:
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._thread = None
        self._server = None
        self._ready = threading.Event()

    @property
    def is_ready(self):
        return self._ready.is_set()

    def start(self):
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def wait_ready(self, timeout=60):
        return self._ready.wait(timeout)

    def _run(self):
        try:
            base = get_base_dir()
            backend_dir = os.path.join(base, "backend")

            if os.path.isdir(backend_dir):
                if backend_dir not in sys.path:
                    sys.path.insert(0, backend_dir)
                if base not in sys.path:
                    sys.path.insert(0, base)
            else:
                if base not in sys.path:
                    sys.path.insert(0, base)

            os.environ["SITEYVM_DATA_DIR"] = get_app_dir()

            import uvicorn
            from app import app as fastapi_app

            port = self.config.port
            self.logger.info("Sunucu baslatiliyor: 0.0.0.0:%d", port)

            config = uvicorn.Config(
                fastapi_app,
                host="0.0.0.0",
                port=port,
                log_level="info",
                access_log=False,
            )
            self._server = uvicorn.Server(config)

            ready_thread = threading.Thread(target=self._check_ready, daemon=True)
            ready_thread.start()

            self._server.run()
        except Exception as e:
            self.logger.error("Sunucu baslatma hatasi: %s", e, exc_info=True)

    def _check_ready(self):
        port = self.config.port
        for _ in range(60):
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(1)
                s.connect(("127.0.0.1", port))
                s.close()
                self._ready.set()
                self.logger.info("Sunucu hazir!")
                return
            except Exception:
                time.sleep(1)
        self.logger.error("Sunucu 60 saniye icinde baslatilamadi!")

    def stop(self):
        if self._server:
            self._server.should_exit = True
        self.logger.info("Sunucu durduruldu")


class SetupWizard:
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger

    def run(self):
        if not self.config.first_run:
            return

        self.logger.info("Ilk calistirma algilandi - yapilandirma uygulaniyor")

        admin_password = os.environ.get("SITEYVM_ADMIN_PASSWORD", "")
        if admin_password:
            self.logger.info("Admin sifresi belirlendi")

        primary_ip = get_primary_ip()
        all_ips = get_local_ips()
        self.logger.info("Algilanan IP'ler: %s", all_ips)
        self.logger.info("Birincil IP: %s", primary_ip)

        add_firewall_rule(self.config.port, self.logger)

        if self.config.auto_start:
            set_autostart(True)

        self.config.last_ip = primary_ip
        self.config.first_run = False


class TrayApp:
    def __init__(self, config, logger, server, ip_monitor):
        self.config = config
        self.logger = logger
        self.server = server
        self.ip_monitor = ip_monitor
        self.icon = None

    def run(self):
        try:
            import pystray
            from PIL import Image
        except ImportError:
            self.logger.warning("pystray/Pillow yuklu degil, tray ikonsuz calisiliyor")
            self._wait_without_tray()
            return

        icon_path = os.path.join(get_base_dir(), "icon.ico")
        if os.path.exists(icon_path):
            image = Image.open(icon_path)
        else:
            image = Image.new("RGB", (64, 64), color=(37, 99, 235))

        ip = self.ip_monitor.current_ip
        port = self.config.port

        menu = pystray.Menu(
            pystray.MenuItem(
                "{}:{}".format(ip, port),
                lambda: None,
                enabled=False,
            ),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Arayuzu Ac", self._open_browser, default=True),
            pystray.MenuItem("IP Adresini Kopyala", self._copy_ip),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem(
                "Windows Baslangicindan Calistir",
                self._toggle_autostart,
                checked=lambda _: self.config.auto_start,
            ),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Cikis", self._quit),
        )

        tooltip = "{} ({}:{})".format(APP_DISPLAY_NAME, ip, port)
        self.icon = pystray.Icon(APP_NAME, image, tooltip, menu)
        self.icon.run()

    def _open_browser(self, *_):
        ip = self.ip_monitor.current_ip
        webbrowser.open("http://{}:{}".format(ip, self.config.port))

    def _copy_ip(self, *_):
        ip = self.ip_monitor.current_ip
        url = "http://{}:{}".format(ip, self.config.port)
        try:
            subprocess.run(["clip"], input=url.encode("utf-8"), check=True, timeout=5)
        except Exception:
            pass

    def _toggle_autostart(self, *_):
        self.config.auto_start = not self.config.auto_start
        set_autostart(self.config.auto_start)

    def _quit(self, *_):
        self.server.stop()
        self.ip_monitor.stop()
        if self.icon:
            self.icon.stop()

    def _wait_without_tray(self):
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.server.stop()
            self.ip_monitor.stop()


def main():
    logger = setup_logging()
    logger.info("=" * 60)
    logger.info("%s Demo v%s baslatiliyor...", APP_DISPLAY_NAME, APP_VERSION)
    logger.info("Kurulum dizini: %s", get_base_dir())
    logger.info("Veri dizini: %s", get_app_dir())

    config = AppConfig()

    wizard = SetupWizard(config, logger)
    wizard.run()

    primary_ip = get_primary_ip()
    all_ips = get_local_ips()
    config.last_ip = primary_ip
    logger.info("Algilanan IP adresleri: %s", all_ips)
    logger.info("Birincil IP: %s", primary_ip)
    logger.info("Sunucu portu: %d", config.port)

    server = ServerManager(config, logger)
    server.start()

    def on_ip_change(old_ip, new_ip):
        logger.info("IP degisti: %s -> %s", old_ip, new_ip)

    ip_monitor = IPMonitor(config, logger, callback=on_ip_change)
    ip_monitor.start()

    if config.auto_start:
        set_autostart(True)

    logger.info("Sunucu baslatiliyor, lutfen bekleyin...")
    if server.wait_ready(timeout=60):
        logger.info("Sunucu basariyla baslatildi")
    else:
        logger.error("Sunucu 60 saniye icinde baslatilamadi!")

    background = "--background" in sys.argv or "--service" in sys.argv

    if not background and config.data.get("open_browser_on_start", True):
        url = "http://{}:{}".format(primary_ip, config.port)
        logger.info("Tarayici aciliyor: %s", url)
        webbrowser.open(url)

    print("")
    print("=" * 60)
    print("  {} Demo v{}".format(APP_DISPLAY_NAME, APP_VERSION))
    print("=" * 60)
    print("  Yerel erisim:    http://localhost:{}".format(config.port))
    print("  Ag erisimi:      http://{}:{}".format(primary_ip, config.port))
    if len(all_ips) > 1:
        print("  Diger IP'ler:    {}".format(", ".join(all_ips)))
    print("  Kullanici:       admin")
    print("=" * 60)
    print("  Cikmak icin Ctrl+C")
    print("")

    tray = TrayApp(config, logger, server, ip_monitor)
    try:
        tray.run()
    except KeyboardInterrupt:
        logger.info("Kapatiliyor...")
        server.stop()
        ip_monitor.stop()


if __name__ == "__main__":
    main()
