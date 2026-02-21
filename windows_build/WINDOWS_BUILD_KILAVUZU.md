# SİTEY-VM Demo — Windows EXE Build Kılavuzu

## 📋 Genel Bakış

SİTEY-VM Demo'yu Windows'ta çalışan tek bir EXE'ye dönüştürmek için gerekli tüm dosyalar `windows_build/` klasöründedir.

### Ne yapar?
- ✅ **Tek EXE** — çift tıkla çalıştır, kurulum sihirbazı
- ✅ **Windows Servisi** — makine kapanıp açılsa bile otomatik başlar
- ✅ **LAN Yayını** — 0.0.0.0:5000'de dinler, ağdaki herkes erişir
- ✅ **IP Algılama** — hangi IP aldıysa otomatik bulur
- ✅ **IP Değişiklik İzleme** — DHCP ile IP değişirse 30 sn içinde algılar
- ✅ **System Tray** — bildirim alanında ikon, sağ tıkla menü
- ✅ **Tarayıcı Otomatik Açma** — ilk çalıştırmada tarayıcıda açılır
- ✅ **Firewall Kuralı** — installer otomatik ekler
- ✅ **Başlat Menüsü + Masaüstü Kısayolu**

---

## 🏗️ Build Adımları (Windows Makinede)

### Ön Koşullar
1. **Python 3.10+** — [python.org](https://python.org) (PATH'e ekleyin)
2. **Node.js 18+** — [nodejs.org](https://nodejs.org) (frontend build için)
3. **NSIS** (opsiyonel) — [nsis.sourceforge.io](https://nsis.sourceforge.io) (installer için)

### Adım 1: Projeyi Windows'a Kopyalayın
```
Tüm demo/ klasörünü Windows makineye kopyalayın (USB, ağ paylaşımı, zip)
```

### Adım 2: Frontend Build
```cmd
cd demo\frontend
npm install
npm run build
```

### Adım 3: EXE Build (Otomatik)
```cmd
cd demo\windows_build
BUILD.bat
```

Bu komut:
1. Python sanal ortam oluşturur
2. Bağımlılıkları kurar
3. PyInstaller ile EXE oluşturur
4. NSIS ile installer oluşturur (NSIS kurulu ise)

### Sonuç
```
windows_build/
├── dist/
│   └── SiteyVM/
│       ├── SiteyVM.exe          ← Ana çalıştırılabilir
│       ├── KULLANIM.txt         ← Kullanım kılavuzu
│       └── ...                  ← Bağımlılık DLL'leri
└── SiteyVM_Demo_Setup_v1.0.0.exe  ← Installer (NSIS varsa)
```

---

## 🖥️ Kurulum ve Kullanım

### A) Taşınabilir Mod (Kurulum Gerektirmez)
1. `dist/SiteyVM/` klasörünü istediğiniz yere kopyalayın
2. `SiteyVM.exe` çift tıklayın
3. Tarayıcı otomatik açılır

### B) Installer ile Kurulum
1. `SiteyVM_Demo_Setup_v1.0.0.exe` çalıştırın
2. Kurulum sihirbazını takip edin
3. Otomatik olarak:
   - Program Files'a kurulur
   - Başlat menüsü kısayolu eklenir
   - Masaüstü kısayolu eklenir
   - Windows başlangıcına eklenir
   - Firewall kuralı eklenir

### C) Windows Servisi Olarak
```cmd
# Yönetici CMD'de:
SiteyVM.exe install    # Servisi kur
SiteyVM.exe start      # Servisi başlat
SiteyVM.exe stop       # Servisi durdur
SiteyVM.exe remove     # Servisi kaldır
```

---

## 🌐 Ağ Erişimi

### Otomatik IP Algılama
Uygulama başladığında:
1. Makinenin tüm IPv4 adreslerini tespit eder
2. Birincil LAN IP'sini (192.168.x.x / 10.x.x.x) seçer
3. Konsola ve system tray'e yazdırır

### IP Değişiklik Takibi
- Her 30 saniyede IP kontrolü yapar
- DHCP ile IP değişirse:
  - Log'a kaydeder
  - System tray tooltip güncellenir
  - API (`/api/system/info`) güncel IP döndürür

### Diğer Cihazlardan Erişim
```
http://<MAKINE_IP>:5000
Örnek: http://192.168.1.100:5000
```

### Firewall
Installer otomatik kural ekler. Manuel eklemek için:
```cmd
netsh advfirewall firewall add rule name="SiteyVM" dir=in action=allow protocol=TCP localport=5000
```

---

## 📁 Dosya Yapısı

```
windows_build/
├── BUILD.bat                   ← Tek tıkla build (bunu çalıştırın)
├── build_exe.py                ← PyInstaller build scripti
├── siteyvm_launcher.py         ← Ana giriş noktası (tray, IP izleme)
├── service_wrapper.py          ← Windows Service wrapper
├── installer.nsi               ← NSIS installer scripti
├── requirements_windows.txt    ← Python bağımlılıkları
├── version_info.txt            ← Windows EXE versiyon bilgisi
├── LICENSE.txt                 ← Lisans
└── siteyvm.ico                 ← Uygulama ikonu (oluşturmanız gerekir)
```

---

## 🔧 Veri Dizini

Windows'ta uygulama verileri:
```
%LOCALAPPDATA%\SiteyVM\
├── demo.db              ← SQLite veritabanı
├── siteyvm_config.json  ← Konfigürasyon
├── siteyvm.log          ← Uygulama logları
└── siteyvm_service.log  ← Servis logları
```

> Not: Dev modunda (Python ile doğrudan çalıştırma) veritabanı hala `backend/demo.db`'de kalır.

---

## ⚙️ Mimari

```
┌─────────────────────────────────────────┐
│           SiteyVM.exe                    │
│  ┌────────────────┐  ┌───────────────┐  │
│  │  IP Monitor     │  │  System Tray  │  │
│  │  (30s interval) │  │  (pystray)    │  │
│  └────────┬───────┘  └───────┬───────┘  │
│           │                  │           │
│  ┌────────▼──────────────────▼────────┐  │
│  │       FastAPI + Uvicorn            │  │
│  │       0.0.0.0:5000                 │  │
│  │  ┌──────────┐  ┌───────────────┐   │  │
│  │  │ API      │  │ Static Files  │   │  │
│  │  │ Backend  │  │ (React Build) │   │  │
│  │  └──────────┘  └───────────────┘   │  │
│  └────────────────────────────────────┘  │
│           │                              │
│  ┌────────▼───────┐                      │
│  │  SQLite DB     │                      │
│  │  (AppData)     │                      │
│  └────────────────┘                      │
└─────────────────────────────────────────┘
```

---

## 🔑 Erişim Bilgileri
- **Kullanıcı:** admin
- **Şifre:** Demo2025!

---

## ❓ Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| Port 5000 meşgul | Başka bir SiteyVM/uygulama çalışıyor olabilir. Task Manager'dan kapatın |
| Firewall engelliyor | `netsh advfirewall firewall add rule...` komutunu çalıştırın |
| Tray ikonu görünmüyor | `pystray` ve `Pillow` kurulu olduğundan emin olun |
| EXE antivirüse takılıyor | PyInstaller EXE'leri bazen false positive verir. İstisna ekleyin |
| IP değişince erişim kesildi | Tarayıcıda yeni IP adresini kullanın. `/api/system/info` endpoint'inden kontrol edin |

