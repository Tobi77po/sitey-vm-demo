import os
import sys
import json
import time
import signal
import socket
import logging
import threading
import webbrowser
import subprocess
import importlib
from pathlib import Path
from datetime import datetime

if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

_NO_WINDOW = 0x08000000 if sys.platform == "win32" else 0

APP_NAME = "SiteyVM"
APP_DISPLAY_NAME = "SITEY-VM"
APP_VERSION = "1.3.0-demo"
TASK_NAME = "SiteyVM"
SERVICE_PORT = 5000
CONFIG_FILENAME = "siteyvm_config.json"
LOG_FILENAME = "siteyvm.log"


def get_base_dir():
    return os.path.dirname(os.path.abspath(__file__))


def get_app_dir():
    local = os.environ.get("LOCALAPPDATA", os.path.expanduser("~"))
    app_dir = os.path.join(local, APP_NAME)
    os.makedirs(app_dir, exist_ok=True)
    return app_dir


def setup_logging():
    app_dir = get_app_dir()
    log_path = os.path.join(app_dir, LOG_FILENAME)
    handlers = [logging.FileHandler(log_path, encoding="utf-8")]
    try:
        if sys.stdout and sys.stdout.name != os.devnull:
            sys.stdout.write("")
            handlers.append(logging.StreamHandler(sys.stdout))
    except Exception:
        pass
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=handlers,
    )
    return logging.getLogger(APP_NAME)


def _safe_print(msg):
    try:
        if sys.stdout and sys.stdout.name != os.devnull:
            print(msg)
    except Exception:
        pass


def _run_cmd(args, timeout=15):
    return subprocess.run(
        args, capture_output=True, encoding="utf-8",
        errors="replace", timeout=timeout, creationflags=_NO_WINDOW,
    )


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
        result = _run_cmd(["ipconfig"], timeout=5)
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
            "last_ip": "",
            "installed_at": datetime.now().isoformat(),
            "open_browser_on_start": True,
            "auto_start": True,
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


class IPMonitor:
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self.current_ip = get_primary_ip()
        self._running = False

    def start(self):
        self._running = True
        t = threading.Thread(target=self._loop, daemon=True)
        t.start()
        self.logger.info("IP Izleyici baslatildi. Mevcut IP: %s", self.current_ip)

    def stop(self):
        self._running = False

    def _loop(self):
        while self._running:
            try:
                new_ip = get_primary_ip()
                if new_ip != self.current_ip:
                    old = self.current_ip
                    self.current_ip = new_ip
                    self.config.last_ip = new_ip
                    self.logger.info("IP degisikligi: %s -> %s", old, new_ip)
            except Exception:
                pass
            time.sleep(30)


class ServerManager:
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._server = None
        self._ready = threading.Event()
        self._should_run = True
        self._thread = None

    def start(self):
        self._should_run = True
        self._thread = threading.Thread(target=self._run_forever, daemon=False, name="SiteyVM-Server")
        self._thread.start()

    def wait_ready(self, timeout=60):
        return self._ready.wait(timeout)

    def is_alive(self):
        return self._thread is not None and self._thread.is_alive()

    def _run_forever(self):
        restart_delay = 2
        max_delay = 60
        while self._should_run:
            try:
                self._run_once()
            except Exception as e:
                self.logger.error("Sunucu hatasi: %s", e, exc_info=True)
            if not self._should_run:
                break
            self.logger.warning("Sunucu kapandi, %d sn sonra yeniden baslatiliyor...", restart_delay)
            time.sleep(restart_delay)
            restart_delay = min(restart_delay * 2, max_delay)
            self._ready.clear()

    def _run_once(self):
        base = get_base_dir()
        backend_dir = os.path.join(base, "app", "backend")
        if not os.path.isdir(backend_dir):
            backend_dir = os.path.join(base, "backend")

        site_packages = os.path.join(base, "python", "Lib", "site-packages")
        if os.path.isdir(site_packages) and site_packages not in sys.path:
            sys.path.insert(0, site_packages)
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)

        os.environ["SITEYVM_DATA_DIR"] = get_app_dir()
        os.chdir(backend_dir)

        importlib.invalidate_caches()
        import uvicorn
        from app import app as fastapi_app

        port = self.config.port
        self.logger.info("Sunucu baslatiliyor: 0.0.0.0:%d", port)

        config = uvicorn.Config(
            fastapi_app, host="0.0.0.0", port=port,
            log_level="warning", access_log=False,
        )
        self._server = uvicorn.Server(config)

        ready_thread = threading.Thread(target=self._check_ready, daemon=True)
        ready_thread.start()
        self._server.run()

    def _check_ready(self):
        port = self.config.port
        for _ in range(120):
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(1)
                s.connect(("127.0.0.1", port))
                s.close()
                self._ready.set()
                return
            except Exception:
                time.sleep(1)

    def stop(self):
        self._should_run = False
        if self._server:
            self._server.should_exit = True


def add_firewall_rule(port, logger):
    try:
        rule_name = "{}-Port-{}".format(APP_DISPLAY_NAME, port)
        check = _run_cmd(
            ["netsh", "advfirewall", "firewall", "show", "rule",
             "name={}".format(rule_name)], timeout=10,
        )
        if "No rules match" in check.stdout or check.returncode != 0:
            _run_cmd(
                ["netsh", "advfirewall", "firewall", "add", "rule",
                 "name={}".format(rule_name), "dir=in", "action=allow",
                 "protocol=TCP", "localport={}".format(port)], timeout=10,
            )
            logger.info("Firewall kurali eklendi: %s", rule_name)
        else:
            logger.info("Firewall kurali zaten mevcut: %s", rule_name)
    except Exception as e:
        logger.warning("Firewall kurali eklenemedi: %s", e)


def _cleanup_old_sc_service(logger):
    try:
        r = _run_cmd(["sc", "query", "SiteyVM"], timeout=10)
        if r.returncode == 0:
            logger.info("Eski sc servisi bulundu, kaldiriliyor...")
            _run_cmd(["sc", "stop", "SiteyVM"])
            time.sleep(2)
            _run_cmd(["sc", "delete", "SiteyVM"], timeout=10)
            logger.info("Eski sc servisi kaldirildi.")
    except Exception:
        pass


def _cleanup_old_registry(logger):
    try:
        import winreg
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
        try:
            winreg.DeleteValue(key, APP_NAME)
            logger.info("Eski registry autostart kaldirildi.")
        except FileNotFoundError:
            pass
        winreg.CloseKey(key)
    except Exception:
        pass


def register_scheduled_task(logger):
    base = get_base_dir()
    pythonw = os.path.join(base, "python", "pythonw.exe")
    launcher = os.path.join(base, "launcher.py")

    if not os.path.exists(pythonw):
        pythonw = os.path.join(base, "python", "python.exe")
    if not os.path.exists(pythonw):
        logger.error("Python exe bulunamadi!")
        return False

    try:
        _run_cmd(["schtasks", "/Delete", "/TN", TASK_NAME, "/F"], timeout=10)
    except Exception:
        pass

    xml_content = '''<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>SITEY-VM Zafiyet Yonetim Platformu</Description>
  </RegistrationInfo>
  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>
    </LogonTrigger>
  </Triggers>
  <Principals>
    <Principal>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>7</Priority>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>3</Count>
    </RestartOnFailure>
  </Settings>
  <Actions>
    <Exec>
      <Command>{exe}</Command>
      <Arguments>"{launcher}" --background</Arguments>
      <WorkingDirectory>{workdir}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>'''.format(exe=pythonw, launcher=launcher, workdir=base)

    xml_path = os.path.join(get_app_dir(), "siteyvm_task.xml")
    with open(xml_path, "w", encoding="utf-16") as f:
        f.write(xml_content)

    result = _run_cmd(
        ["schtasks", "/Create", "/TN", TASK_NAME, "/XML", xml_path, "/F"],
        timeout=15,
    )

    try:
        os.remove(xml_path)
    except Exception:
        pass

    if result.returncode == 0:
        logger.info("Gorev Zamanlayici kaydedildi: %s", TASK_NAME)
        return True
    else:
        logger.error("Gorev Zamanlayici kaydi basarisiz: %s", result.stderr or result.stdout)
        return False


def unregister_scheduled_task(logger):
    result = _run_cmd(["schtasks", "/Delete", "/TN", TASK_NAME, "/F"], timeout=10)
    if result.returncode == 0:
        logger.info("Gorev Zamanlayici kaydı silindi: %s", TASK_NAME)
        return True
    return False


def start_scheduled_task(logger):
    result = _run_cmd(["schtasks", "/Run", "/TN", TASK_NAME], timeout=15)
    if result.returncode == 0:
        logger.info("Gorev baslatildi: %s", TASK_NAME)
        return True
    logger.warning("Gorev baslatma hatasi: %s", result.stderr or result.stdout)
    return False


def stop_scheduled_task(logger):
    result = _run_cmd(["schtasks", "/End", "/TN", TASK_NAME], timeout=15)
    return result.returncode == 0


class TrayApp:
    def __init__(self, config, logger, server, ip_monitor):
        self.config = config
        self.logger = logger
        self.server = server
        self.ip_monitor = ip_monitor
        self.icon = None
        self._user_quit = False

    def run(self):
        try:
            import pystray
            from PIL import Image
        except ImportError:
            self.logger.info("pystray/Pillow yuklu degil, tray ikonsuz calisiliyor")
            self._wait_without_tray()
            return

        while not self._user_quit and self.server.is_alive():
            try:
                self._run_tray(pystray, Image)
            except Exception as e:
                self.logger.warning("Tray hatasi: %s - yeniden baslatiliyor", e)
                time.sleep(3)
            if not self._user_quit:
                self.logger.info("Tray kapandi, sunucu hala calisiyor - tray yeniden baslatiliyor")

    def _run_tray(self, pystray, Image):
        icon_path = os.path.join(get_base_dir(), "icon.ico")
        if not os.path.exists(icon_path):
            icon_path = os.path.join(get_base_dir(), "app", "icon.ico")
        if not os.path.exists(icon_path):
            icon_path = os.path.join(get_base_dir(), "app", "backend", "icon.ico")

        png_path = None
        if not os.path.exists(icon_path):
            for candidate in [
                os.path.join(get_base_dir(), "app", "backend", "LOGO.png"),
                os.path.join(get_base_dir(), "LOGO.png"),
                os.path.join(get_base_dir(), "logo.png"),
                os.path.join(get_base_dir(), "app", "frontend", "build", "logo192.png"),
            ]:
                if os.path.exists(candidate):
                    png_path = candidate
                    break

        if os.path.exists(icon_path):
            image = Image.open(icon_path)
        elif png_path:
            image = Image.open(png_path)
            image = image.resize((64, 64), Image.LANCZOS)
        else:
            image = Image.new("RGB", (64, 64), color=(37, 99, 235))

        ip = self.ip_monitor.current_ip
        port = self.config.port

        menu = pystray.Menu(
            pystray.MenuItem(
                "{}:{}".format(ip, port),
                lambda: None, enabled=False,
            ),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Arayuzu Ac", self._open_browser, default=True),
            pystray.MenuItem("IP Adresini Kopyala", self._copy_ip),
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
            subprocess.run(["clip"], input=url.encode("utf-8"),
                           check=True, timeout=5, creationflags=_NO_WINDOW)
        except Exception:
            pass

    def _quit(self, *_):
        self._user_quit = True
        self.server.stop()
        self.ip_monitor.stop()
        if self.icon:
            self.icon.stop()

    def _wait_without_tray(self):
        try:
            while self.server.is_alive():
                time.sleep(1)
        except KeyboardInterrupt:
            self.server.stop()
            self.ip_monitor.stop()


def _setup_environment(logger):
    try:
        base = get_base_dir()

        site_packages = os.path.join(base, "python", "Lib", "site-packages")
        if os.path.isdir(site_packages) and site_packages not in sys.path:
            sys.path.insert(0, site_packages)
            logger.info("sys.path'e eklendi: %s", site_packages)
        importlib.invalidate_caches()

        wizard_path = os.path.join(base, "setup_wizard.py")
        if os.path.exists(wizard_path):
            if base not in sys.path:
                sys.path.insert(0, base)
            from setup_wizard import run_setup, install_dependencies, is_first_run

            needs_deps = False
            try:
                import uvicorn
            except ImportError:
                needs_deps = True

            first_run = is_first_run()

            if needs_deps or first_run:
                if needs_deps:
                    logger.info("Bagimliliklar eksik - kurulum baslatiliyor")
                    _safe_print("\n  Bagimliliklar eksik, kuruluyor...\n")
                    if not install_dependencies():
                        logger.error("Bagimlilik kurulumu basarisiz!")
                        _safe_print("\n  [HATA] Bagimliliklar kurulamadi!")
                        _safe_print("  Internet baglantinizi kontrol edin.\n")
                        return
                    logger.info("Bagimliliklar hazir.")
                    _safe_print("  Bagimliliklar hazir.\n")
                    importlib.invalidate_caches()

                if first_run:
                    logger.info("Ilk calistirma - Kurulum Sihirbazi baslatiliyor")
                    _safe_print("\n  Ilk kurulum baslatiliyor...\n")
                    password = run_setup()
                    if password is None:
                        logger.info("Kurulum iptal edildi")
                        _safe_print("\n  Kurulum iptal edildi.\n")
                        sys.exit(0)
                    elif password is True:
                        pass
                    else:
                        logger.info("Admin sifresi belirlendi")
                        os.environ["SITEYVM_ADMIN_PASSWORD"] = password
        else:
            logger.warning("setup_wizard.py bulunamadi")
    except Exception as e:
        logger.warning("Kurulum sihirbazi hatasi: %s", e)


def _wait_for_port(port, timeout=60):
    for _ in range(timeout):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1)
            s.connect(("127.0.0.1", port))
            s.close()
            return True
        except Exception:
            time.sleep(1)
    return False


def main():
    logger = setup_logging()
    logger.info("=" * 60)
    logger.info("%s Demo v%s baslatiliyor...", APP_DISPLAY_NAME, APP_VERSION)
    logger.info("Kurulum dizini: %s", get_base_dir())
    logger.info("Veri dizini: %s", get_app_dir())
    logger.info("Argumanlar: %s", sys.argv[1:])

    _cleanup_old_sc_service(logger)
    _cleanup_old_registry(logger)

    _setup_environment(logger)

    config = AppConfig()
    primary_ip = get_primary_ip()
    all_ips = get_local_ips()
    config.last_ip = primary_ip

    logger.info("Algilanan IP'ler: %s", all_ips)
    logger.info("Birincil IP: %s", primary_ip)

    add_firewall_rule(config.port, logger)

    _safe_print("\n  Gorev Zamanlayici'ya kaydediliyor...\n")
    register_scheduled_task(logger)

    server = ServerManager(config, logger)
    server.start()

    ip_monitor = IPMonitor(config, logger)
    ip_monitor.start()

    logger.info("Sunucu baslatiliyor, lutfen bekleyin...")
    if server.wait_ready(timeout=60):
        logger.info("Sunucu hazir! (http://0.0.0.0:%d)", config.port)
    else:
        logger.error("Sunucu 60 saniye icinde baslatilamadi!")
        _safe_print("\n  [HATA] Sunucu baslatilamadi. Log: {}".format(
            os.path.join(get_app_dir(), LOG_FILENAME)))
        return

    url = "http://{}:{}".format(primary_ip, config.port)

    background = "--background" in sys.argv
    if not background and config.data.get("open_browser_on_start", True):
        logger.info("Tarayici aciliyor: %s", url)
        webbrowser.open(url)

    logger.info("Yerel: http://localhost:%d | Ag: http://%s:%d",
                config.port, primary_ip, config.port)

    tray = TrayApp(config, logger, server, ip_monitor)
    try:
        tray.run()
    except Exception as e:
        logger.warning("Tray hatasi: %s", e)

    if not tray._user_quit and server.is_alive():
        logger.info("Tray kapandi ama sunucu hala calisiyor, bekleniyor...")
        while server.is_alive():
            time.sleep(1)

    logger.info("Kapatiliyor...")
    server.stop()
    ip_monitor.stop()
    if server._thread and server._thread.is_alive():
        server._thread.join(timeout=10)
    logger.info("%s kapatildi.", APP_DISPLAY_NAME)


if __name__ == "__main__":
    main()
