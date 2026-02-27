"""SİTEY-VM Demo - Başlatıcı"""
import os
import sys
import uvicorn

sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    print("=" * 60)
    print("  SİTEY-VM Demo Sürümü v1.3.0")
    print("  Kurumsal sürüm: satis@siteyvm.com | siteyvm.com")
    print("=" * 60)
    print()
    print("  Tarayıcıda açın: http://localhost:5000")
    print("  Varsayılan giriş: admin / Demo2025!")
    print()
    uvicorn.run("backend.app:app", host="0.0.0.0", port=5000, reload=False)
