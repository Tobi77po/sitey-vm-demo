"""SİTEY-VM Demo - Veritabanı (SQLite)"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


def _get_db_path():
    """Veritabanı dosya yolunu belirle.
    
    EXE modunda: %LOCALAPPDATA%/SiteyVM/demo.db  (veri kalıcı olur)
    Dev modunda:  backend/demo.db  (mevcut davranış)
    """
    data_dir = os.environ.get("SITEYVM_DATA_DIR")
    if data_dir:
        os.makedirs(data_dir, exist_ok=True)
        return os.path.join(data_dir, "demo.db")
    return os.path.join(os.path.dirname(__file__), "demo.db")


DB_PATH = _get_db_path()
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Tabloları oluştur ve varsayılan admin kullanıcısını ekle."""
    import models
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from models import User
        from security import get_password_hash

        admin_password = os.environ.get("SITEYVM_ADMIN_PASSWORD", "Demo2025!")

        admin = db.query(User).filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                password_hash=get_password_hash(admin_password),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
        _seed_demo_vulns(db)
    finally:
        db.close()


def _seed_demo_vulns(db):
    """Demo ortamı için örnek zafiyet verileri."""
    from models import Vulnerability
    if db.query(Vulnerability).count() > 0:
        return

    import uuid
    from datetime import datetime, timezone

    samples = [
        {
            "name": "Apache HTTP Server RCE (CVE-2021-41773)",
            "cve": "CVE-2021-41773",
            "risk": "Critical",
            "description": "Apache HTTP Server 2.4.49 sürümünde path traversal ve uzaktan kod çalıştırma zafiyeti tespit edildi. Saldırgan, özel hazırlanmış bir URL ile sunucudaki dosyalara erişebilir ve CGI betiklerini çalıştırabilir.",
            "solution": "Apache HTTP Server 2.4.51 veya üzeri sürüme güncelleyin. mod_cgi/mod_cgid modüllerini devre dışı bırakın.",
            "target_ip": "192.168.1.10",
            "port": "80",
            "service": "http",
            "scanner": "OpenVAS",
            "cvss_score": "9.8",
            "status": "open",
        },
        {
            "name": "Log4Shell - Remote Code Execution (CVE-2021-44228)",
            "cve": "CVE-2021-44228",
            "risk": "Critical",
            "description": "Apache Log4j2 2.0-beta9 ile 2.15.0 arasındaki sürümlerde JNDI lookup özelliğindeki kritik zafiyet. Saldırgan, log mesajlarına özel JNDI referansları enjekte ederek uzaktan kod çalıştırabilir.",
            "solution": "Log4j 2.17.0 veya üzeri sürüme güncelleyin. JndiLookup sınıfını classpath'ten kaldırın.",
            "target_ip": "192.168.1.20",
            "port": "8080",
            "service": "http",
            "scanner": "OpenVAS",
            "cvss_score": "10.0",
            "status": "open",
        },
        {
            "name": "OpenSSH Kullanıcı Numaralandırma (CVE-2018-15473)",
            "cve": "CVE-2018-15473",
            "risk": "Medium",
            "description": "OpenSSH 7.7 ve öncesi sürümlerde kullanıcı numaralandırma zafiyeti. Saldırgan, kimlik doğrulama isteği göndererek geçerli kullanıcı adlarını tespit edebilir.",
            "solution": "OpenSSH'i en güncel sürüme yükseltin.",
            "target_ip": "192.168.1.30",
            "port": "22",
            "service": "ssh",
            "scanner": "OpenVAS",
            "cvss_score": "5.3",
            "status": "open",
        },
        {
            "name": "SSL/TLS Zayıf Cipher Suite Kullanımı",
            "cve": "",
            "risk": "Medium",
            "description": "Hedef sunucu, zayıf şifreleme algoritmalarını (RC4, DES, 3DES) desteklemektedir. Bu algoritmalar bilinen kriptografik saldırılara karşı savunmasızdır.",
            "solution": "Zayıf cipher suite'leri devre dışı bırakın. TLS 1.2+ ve güçlü algoritmalar (AES-GCM, ChaCha20) kullanın.",
            "target_ip": "192.168.1.40",
            "port": "443",
            "service": "https",
            "scanner": "OpenVAS",
            "cvss_score": "5.9",
            "status": "open",
        },
        {
            "name": "Microsoft SMBv1 Protokolü Aktif (MS17-010)",
            "cve": "CVE-2017-0144",
            "risk": "Critical",
            "description": "Hedef sistemde SMBv1 protokolü aktif durumda. EternalBlue exploit'i ile uzaktan kod çalıştırma mümkün. WannaCry ve NotPetya saldırıları bu zafiyeti kullanmıştır.",
            "solution": "SMBv1 protokolünü devre dışı bırakın. MS17-010 güvenlik yamasını uygulayın.",
            "target_ip": "192.168.1.50",
            "port": "445",
            "service": "microsoft-ds",
            "scanner": "OpenVAS",
            "cvss_score": "9.3",
            "status": "in_progress",
        },
        {
            "name": "Nginx Bilgi İfşası",
            "cve": "",
            "risk": "Low",
            "description": "Nginx web sunucusu HTTP yanıt başlıklarında versiyon bilgisini ifşa etmektedir. Bu bilgi saldırganlara hedef sistem hakkında detay sağlar.",
            "solution": "Nginx konfigürasyonunda 'server_tokens off;' ayarını etkinleştirin.",
            "target_ip": "192.168.1.60",
            "port": "80",
            "service": "http",
            "scanner": "OpenVAS",
            "cvss_score": "2.1",
            "status": "open",
        },
        {
            "name": "WordPress XML-RPC Brute Force (CVE-2015-5623)",
            "cve": "CVE-2015-5623",
            "risk": "High",
            "description": "WordPress XML-RPC arayüzü üzerinden çoklu giriş denemesi yapılabilmektedir. system.multicall yöntemi ile tek istekte birden fazla kimlik doğrulama denemesi gerçekleştirilebilir.",
            "solution": "XML-RPC arayüzünü devre dışı bırakın veya IP tabanlı erişim kontrolü uygulayın.",
            "target_ip": "192.168.1.70",
            "port": "80",
            "service": "http",
            "scanner": "OpenVAS",
            "cvss_score": "7.5",
            "status": "open",
        },
        {
            "name": "PostgreSQL Zayıf Şifre Politikası",
            "cve": "",
            "risk": "High",
            "description": "PostgreSQL veritabanı sunucusu varsayılan veya zayıf şifrelerle erişime açıktır. Brute-force saldırıları ile yetkisiz erişim sağlanabilir.",
            "solution": "Güçlü şifre politikası uygulayın. pg_hba.conf dosyasında erişim kontrolünü sıkılaştırın.",
            "target_ip": "192.168.1.80",
            "port": "5432",
            "service": "postgresql",
            "scanner": "OpenVAS",
            "cvss_score": "8.1",
            "status": "open",
        },
        {
            "name": "FTP Anonim Erişim Açık",
            "cve": "",
            "risk": "Medium",
            "description": "FTP sunucusu anonim (anonymous) erişime izin vermektedir. Yetkisiz kullanıcılar dosya sistemi içeriğine erişebilir.",
            "solution": "Anonim FTP erişimini devre dışı bırakın. Gerekli ise sadece salt okunur erişime izin verin.",
            "target_ip": "192.168.1.90",
            "port": "21",
            "service": "ftp",
            "scanner": "OpenVAS",
            "cvss_score": "6.5",
            "status": "open",
        },
        {
            "name": "Self-Signed SSL Sertifikası",
            "cve": "",
            "risk": "Info",
            "description": "Hedef sunucu self-signed (kendinden imzalı) SSL sertifikası kullanmaktadır. Bu durum MITM saldırılarına karşı risk oluşturur.",
            "solution": "Güvenilir bir Sertifika Otoritesinden (CA) SSL sertifikası edinin.",
            "target_ip": "192.168.1.100",
            "port": "443",
            "service": "https",
            "scanner": "OpenVAS",
            "cvss_score": "0.0",
            "status": "open",
        },
        {
            "name": "DNS Zone Transfer Açık (AXFR)",
            "cve": "",
            "risk": "High",
            "description": "DNS sunucusu zone transfer isteklerine yanıt vermektedir. Saldırgan, tüm DNS kayıtlarını elde ederek iç ağ yapısını haritalayabilir.",
            "solution": "DNS zone transfer'ı yalnızca yetkili slave DNS sunucularına izin verecek şekilde kısıtlayın.",
            "target_ip": "192.168.1.1",
            "port": "53",
            "service": "dns",
            "scanner": "OpenVAS",
            "cvss_score": "7.5",
            "status": "open",
        },
        {
            "name": "SNMP Community String Varsayılan (public)",
            "cve": "",
            "risk": "High",
            "description": "SNMP servisi varsayılan 'public' community string ile erişilebilir durumda. Saldırgan, ağ cihazı konfigürasyonlarına ve hassas bilgilere erişebilir.",
            "solution": "Varsayılan community string'leri değiştirin. SNMPv3 ile kimlik doğrulama ve şifreleme kullanın.",
            "target_ip": "192.168.1.1",
            "port": "161",
            "service": "snmp",
            "scanner": "OpenVAS",
            "cvss_score": "7.5",
            "status": "open",
        },
    ]

    for s in samples:
        v = Vulnerability(
            id=str(uuid.uuid4()),
            name=s["name"],
            cve=s.get("cve", ""),
            risk=s["risk"],
            description=s["description"],
            solution=s.get("solution", ""),
            target_ip=s.get("target_ip", ""),
            port=s.get("port", ""),
            service=s.get("service", ""),
            scanner=s.get("scanner", "OpenVAS"),
            cvss_score=s.get("cvss_score", ""),
            status=s.get("status", "open"),
            agent_uuid="demo-agent",
            timestamp=datetime.now(timezone.utc),
        )
        db.add(v)
    db.commit()
