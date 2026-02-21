import os
import sys
import time
import socket
import logging
import threading
from pathlib import Path

try:
    import win32serviceutil
    import win32service
    import win32event
    import servicemanager
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False


def get_app_dir():
    local = os.environ.get("LOCALAPPDATA", os.path.expanduser("~"))
    app_dir = os.path.join(local, "SiteyVM")
    os.makedirs(app_dir, exist_ok=True)
    return app_dir


def get_base_dir():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


def setup_service_logging():
    app_dir = get_app_dir()
    log_path = os.path.join(app_dir, "siteyvm_service.log")
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.FileHandler(log_path, encoding="utf-8")],
    )
    return logging.getLogger("SiteyVM-Service")


if HAS_WIN32:
    class SiteyVMService(win32serviceutil.ServiceFramework):
        _svc_name_ = "SiteyVMDemo"
        _svc_display_name_ = "SITEY-VM Zafiyet Yonetimi"
        _svc_description_ = "SITEY-VM Demo zafiyet yonetim platformu. Web arayuzu ve API sunucusu."
        _svc_deps_ = None

        def __init__(self, args):
            win32serviceutil.ServiceFramework.__init__(self, args)
            self.stop_event = win32event.CreateEvent(None, 0, 0, None)
            self.server = None
            self.logger = setup_service_logging()

        def SvcStop(self):
            self.logger.info("Servis durduruluyor...")
            self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
            win32event.SetEvent(self.stop_event)
            if self.server:
                self.server.should_exit = True

        def SvcDoRun(self):
            self.logger.info("SITEY-VM Servisi baslatiliyor...")
            servicemanager.LogMsg(
                servicemanager.EVENTLOG_INFORMATION_TYPE,
                servicemanager.PYS_SERVICE_STARTED,
                (self._svc_name_, ""),
            )
            self.main()

        def main(self):
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

                config = uvicorn.Config(
                    fastapi_app,
                    host="0.0.0.0",
                    port=5000,
                    log_level="warning",
                    access_log=False,
                )
                self.server = uvicorn.Server(config)

                server_thread = threading.Thread(target=self.server.run, daemon=True)
                server_thread.start()

                self.logger.info("Sunucu baslatildi: 0.0.0.0:5000")

                while True:
                    rc = win32event.WaitForSingleObject(self.stop_event, 5000)
                    if rc == win32event.WAIT_OBJECT_0:
                        break

                self.server.should_exit = True
                self.logger.info("Servis durduruldu")

            except Exception as e:
                self.logger.error("Servis hatasi: %s", e, exc_info=True)


def install_service():
    if not HAS_WIN32:
        print("HATA: pywin32 kutuphanesi yuklu degil. Servis modu kullanilamaz.")
        return False
    try:
        win32serviceutil.InstallService(
            SiteyVMService._svc_name_,
            SiteyVMService._svc_name_,
            SiteyVMService._svc_display_name_,
            startType=win32service.SERVICE_AUTO_START,
            description=SiteyVMService._svc_description_,
        )
        print("Servis kuruldu: {}".format(SiteyVMService._svc_display_name_))
        return True
    except Exception as e:
        print("Servis kurulum hatasi: {}".format(e))
        return False


def handle_service_command():
    if len(sys.argv) > 1 and HAS_WIN32:
        cmd = sys.argv[1].lower()
        if cmd in ("install", "remove", "start", "stop", "restart", "update"):
            win32serviceutil.HandleCommandLine(SiteyVMService)
            return True
    return False
