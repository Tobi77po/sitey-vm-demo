#!/bin/bash
# SİTEY-VM Demo - Başlatma Scripti
DEMO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEMO_DIR"

echo "============================================="
echo "  SİTEY-VM Demo Sürümü v1.0.0"
echo "  Kurumsal: satis@siteyvm.com | siteyvm.com"
echo "============================================="
echo ""
echo "  Tarayıcıda açın: http://localhost:5000"
echo "  Giriş:           admin / Demo2025!"
echo ""

# venv varsa aktive et
if [ -d "venv" ]; then
    source venv/bin/activate
fi

python run.py
