#!/bin/bash
# SİTEY-VM Demo - Linux Kurulum Scripti
set -e

echo "============================================="
echo "  SİTEY-VM Demo Sürümü - Kurulum"
echo "  Kurumsal: satis@siteyvm.com | siteyvm.com"
echo "============================================="
echo ""

DEMO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEMO_DIR"

# Python kontrolü
if command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    echo "❌ Python bulunamadı! Python 3.9+ yükleyin."
    exit 1
fi

echo "🐍 Python: $($PYTHON --version)"

# Node.js kontrolü
if ! command -v node &>/dev/null; then
    echo "❌ Node.js bulunamadı! Node.js 18+ yükleyin."
    exit 1
fi
echo "📦 Node.js: $(node --version)"

# Python venv oluştur
echo ""
echo "📦 Python sanal ortam oluşturuluyor..."
$PYTHON -m venv venv
source venv/bin/activate

# Python bağımlılıkları
echo "📦 Python bağımlılıkları yükleniyor..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

# Frontend bağımlılıkları ve build
echo ""
echo "🔨 Frontend derleniyor..."
cd frontend
npm install --silent 2>/dev/null || npm install
npm run build
cd ..

echo ""
echo "============================================="
echo "  ✅ Kurulum tamamlandı!"
echo ""
echo "  Başlatmak için: ./start.sh"
echo "  Tarayıcı:       http://localhost:5000"
echo "  Giriş:          admin / Demo2025!"
echo "============================================="
