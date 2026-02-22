<p align="center">
  <img src="logo.png" alt="SITEY-VM" width="460">
</p>

<h1 align="center">SITEY-VM — Vulnerability Management Platform</h1>

<p align="center">
  <strong>Centralized vulnerability management for networks and web applications</strong>
  <br>
  <em>Free &amp; open-source demo — try it in minutes</em>
</p>

<p align="center">
  <a href="https://github.com/pcx1997/sitey-vm-demo/actions/workflows/build.yml"><img src="https://github.com/pcx1997/sitey-vm-demo/actions/workflows/build.yml/badge.svg" alt="Build"></a>
  <a href="https://github.com/pcx1997/sitey-vm-demo/releases/latest"><img src="https://img.shields.io/github/v/release/pcx1997/sitey-vm-demo?label=release&color=blue" alt="Release"></a>
  <a href="https://github.com/pcx1997/sitey-vm-demo/releases/latest"><img src="https://img.shields.io/github/downloads/pcx1997/sitey-vm-demo/total?color=green&label=downloads" alt="Downloads"></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux-informational" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-success" alt="License">
  <img src="https://img.shields.io/badge/language-TR%20%7C%20EN-blueviolet" alt="Language">
</p>

<p align="center">
  <a href="https://siteyvm.com">🌐 Website</a> •
  <a href="https://github.com/pcx1997/sitey-vm-demo/releases/latest">⬇️ Download</a> •
  <a href="#-installation">📦 Install</a> •
  <a href="#-screenshots">📸 Screenshots</a> •
  <a href="#-türkçe">🇹🇷 Türkçe</a>
</p>

---

## ✨ What is SITEY-VM?

**SITEY-VM** is a vulnerability management platform that helps security teams discover, track, prioritize, and remediate vulnerabilities across their infrastructure. It integrates with popular scanners like **OpenVAS/GVM**, **Nessus**, and more.

This repository contains the **free demo version** — fully functional, no time limit, no registration required.

### 🎯 Key Features

| Feature | Demo | Enterprise |
|---------|:----:|:----------:|
| Executive dashboard with risk metrics | ✅ | ✅ |
| Vulnerability list with filtering & search | ✅ | ✅ |
| Detailed vulnerability view with CVSS scoring | ✅ | ✅ |
| Manual vulnerability entry & editing | ✅ | ✅ |
| PDF & Excel report generation | ✅ | ✅ |
| OpenVAS/GVM scan import (XML) | ✅ | ✅ |
| Multi-language UI (Turkish / English) | ✅ | ✅ |
| Single user with password management | ✅ | ✅ |
| 16+ scanner integration (Nessus, Burp, Nuclei…) | — | ✅ |
| Agent-based asset management (3000+ agents) | — | ✅ |
| RBAC multi-user & LDAP/AD SSO | — | ✅ |
| AI-powered triage & security assistant | — | ✅ |
| 6-stage team workflow & task management | — | ✅ |
| Automated patch management | — | ✅ |
| Attack surface management (ASM) | — | ✅ |
| Jira, ServiceNow, Slack integrations | — | ✅ |
| SLA tracking & multi-channel notifications | — | ✅ |

### 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Chart.js, React Router |
| **Backend** | Python, FastAPI, SQLite |
| **Scanner** | OpenVAS / GVM integration |
| **Packaging** | Custom SFX installer (Windows), shell scripts (Linux) |
| **CI/CD** | GitHub Actions — automated build & release |

---

## 📦 Installation

### Windows (Recommended)

1. Download **[SiteyVM_Setup.exe](https://github.com/pcx1997/sitey-vm-demo/releases/latest)** from the latest release
2. Double-click to run (Administrator privileges required)
3. Follow the setup wizard → choose install directory → set admin password
4. SITEY-VM starts automatically and opens in your browser

> **Note:** Python dependencies are installed automatically on first run. Internet connection required.

### Linux

```bash
git clone https://github.com/pcx1997/sitey-vm-demo.git
cd sitey-vm-demo
chmod +x install.sh
./install.sh
./start.sh
```

Open in browser: `http://localhost:5000`

### Default Credentials

| | |
|---|---|
| **Username** | `admin` |
| **Password** | `admin` (change on first login) |

---

## 📸 Screenshots

> Enterprise feature previews are built into the demo — explore them from the sidebar!

<details>
<summary><strong>📊 Dashboard — Executive Overview</strong></summary>
<br>
Risk distribution charts, severity breakdown, recent vulnerabilities at a glance.
</details>

<details>
<summary><strong>📋 Vulnerability List — Filter, Search, Bulk Actions</strong></summary>
<br>
Search by CVE, IP, name. Bulk status change, archive, PDF/Excel export.
</details>

<details>
<summary><strong>🔍 Vulnerability Detail — Full Analysis</strong></summary>
<br>
CVSS score, description, solution, technical details, status management.
</details>

<details>
<summary><strong>🚀 Enterprise Preview — AI, Workflow, Agents</strong></summary>
<br>
Interactive previews of all Enterprise features with live mockups.
</details>

---

## 🏗 Project Structure

```
sitey-vm-demo/
├── backend/            # FastAPI Python backend
│   ├── app.py          # Main API application
│   ├── models.py       # SQLAlchemy models
│   ├── database.py     # Database configuration
│   └── security.py     # Authentication & security
├── frontend/           # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Layout & shared components
│   │   └── i18n/       # Internationalization (TR/EN)
│   └── build/          # Production build
├── build_sfx/          # Windows SFX installer builder
├── SiteyVM_Setup/      # Windows distribution package
└── .github/workflows/  # CI/CD pipeline
```

---

## 🔧 Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
uvicorn app:app --host 0.0.0.0 --port 5000

# Frontend
cd frontend
npm install
npm start        # Dev server on :3000
npm run build    # Production build
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- ⭐ Star the repo if you find it useful
- 🐛 Open issues for bugs or feature requests
- 🔀 Submit pull requests

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🏢 Enterprise Version

Need the full-featured version for your organization?

| | |
|---|---|
| 🌐 **Website** | [siteyvm.com](https://siteyvm.com) |
| 📧 **Sales** | [satis@siteyvm.com](mailto:satis@siteyvm.com) |

Enterprise includes: AI assistant, agent management, patch automation, team workflows, RBAC, SSO, Jira/Slack integrations, SLA tracking, and more.

---

<br>

<h1 align="center" id="-türkçe">🇹🇷 Türkçe</h1>

<br>

## SITEY-VM Nedir?

**SITEY-VM**, güvenlik ekiplerinin ağ altyapısı ve web uygulamalarındaki güvenlik açıklarını merkezi olarak keşfetmesini, takip etmesini, önceliklendirmesini ve çözmesini sağlayan bir zafiyet yönetim platformudur.

Bu depo, platformun **ücretsiz demo sürümünü** içerir — tamamen işlevsel, süre sınırı yok, kayıt gerektirmez.

---

## 📦 Kurulum

### Windows (Önerilen)

1. [Releases](https://github.com/pcx1997/sitey-vm-demo/releases/latest) sayfasından **SiteyVM_Setup.exe** dosyasını indirin
2. Çift tıklayarak çalıştırın (Yönetici yetkisi gerekir)
3. Kurulum sihirbazını takip edin → kurulum dizinini seçin → admin şifresini belirleyin
4. SITEY-VM otomatik başlar ve tarayıcıda açılır

> **Not:** İlk çalıştırmada Python bağımlılıkları otomatik kurulur. İnternet bağlantısı gereklidir.

### Linux

```bash
git clone https://github.com/pcx1997/sitey-vm-demo.git
cd sitey-vm-demo
chmod +x install.sh
./install.sh
./start.sh
```

Tarayıcıda açın: `http://localhost:5000`

### Varsayılan Giriş Bilgileri

| | |
|---|---|
| **Kullanıcı Adı** | `admin` |
| **Şifre** | `admin` (ilk girişte değiştirin) |

---

## 🎯 Demo Özellikleri

| Özellik | Demo | Kurumsal |
|---------|:----:|:--------:|
| Zafiyet gösterge paneli (Dashboard) | ✅ | ✅ |
| Zafiyet listesi — filtreleme, arama, toplu işlem | ✅ | ✅ |
| Detaylı zafiyet görünümü — CVSS skorlama | ✅ | ✅ |
| Manuel zafiyet ekleme ve düzenleme | ✅ | ✅ |
| PDF ve Excel rapor oluşturma | ✅ | ✅ |
| OpenVAS/GVM tarama içe aktarma (XML) | ✅ | ✅ |
| Çoklu dil desteği (Türkçe / İngilizce) | ✅ | ✅ |
| Tek kullanıcı ve şifre yönetimi | ✅ | ✅ |
| 16+ tarayıcı entegrasyonu (Nessus, Burp, Nuclei…) | — | ✅ |
| Agent tabanlı varlık yönetimi (3000+ agent) | — | ✅ |
| RBAC çoklu kullanıcı ve LDAP/AD SSO | — | ✅ |
| AI destekli değerlendirme ve güvenlik asistanı | — | ✅ |
| 6 aşamalı takım iş akışı ve görev yönetimi | — | ✅ |
| Otomatik yama yönetimi | — | ✅ |
| Atak yüzey yönetimi (ASM) | — | ✅ |
| Jira, ServiceNow, Slack entegrasyonları | — | ✅ |
| SLA takibi ve çok kanallı bildirimler | — | ✅ |

---

## 🏢 Kurumsal Sürüm

Tam özellikli kurumsal sürüm için:

| | |
|---|---|
| 🌐 **Web** | [siteyvm.com](https://siteyvm.com) |
| 📧 **E-posta** | [satis@siteyvm.com](mailto:satis@siteyvm.com) |

---

<p align="center">
  <img src="logo.png" alt="SITEY-VM" width="200">
  <br>
  <sub>SITEY-VM — Vulnerability Management Platform | Zafiyet Yönetim Platformu</sub>
  <br><br>
  <a href="https://siteyvm.com">siteyvm.com</a>
</p>
