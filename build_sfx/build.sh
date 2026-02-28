#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SETUP_DIR="$(dirname "$SCRIPT_DIR")/SiteyVM_Setup"
BUILD_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$(dirname "$SCRIPT_DIR")"
VERSION="1.4.0"

SFX_C="$BUILD_DIR/siteyvm_sfx.c"
STUB_EXE="$BUILD_DIR/siteyvm_stub.exe"
PAYLOAD_ZIP="$BUILD_DIR/payload.zip"
FINAL_EXE="$OUTPUT_DIR/SiteyVM_Setup_v${VERSION}.exe"

echo ""
echo "  ================================================"
echo "    SITEY-VM Self-Extracting EXE Builder"
echo "    Version: $VERSION"
echo "  ================================================"
echo ""

echo "  [1/5] On kosullar kontrol ediliyor..."

if ! command -v x86_64-w64-mingw32-gcc &>/dev/null; then
    echo "  HATA: MinGW-w64 bulunamadi!"
    echo "  Kur: sudo apt install gcc-mingw-w64-x86-64"
    exit 1
fi

if [ ! -d "$SETUP_DIR" ]; then
    echo "  HATA: SiteyVM_Setup dizini bulunamadi: $SETUP_DIR"
    exit 1
fi

echo "  MinGW-w64 mevcut"
echo "  SiteyVM_Setup dizini mevcut"
echo ""

echo "  [2/5] SFX stub derleniyor..."

cp "$SETUP_DIR/icon.ico" "$BUILD_DIR/icon.ico" 2>/dev/null || true

x86_64-w64-mingw32-windres "$BUILD_DIR/siteyvm.rc" -o "$BUILD_DIR/siteyvm_res.o" 2>&1

x86_64-w64-mingw32-gcc -o "$STUB_EXE" "$SFX_C" "$BUILD_DIR/siteyvm_res.o" \
    -mwindows -lcomctl32 -lshlwapi -lshell32 -lole32 -luuid -static -O2 2>&1

STUB_SIZE=$(stat -c%s "$STUB_EXE")
echo "  Stub EXE: $(( STUB_SIZE / 1024 )) KB"
echo ""

echo "  [3/5] Payload ZIP olusturuluyor..."

rm -f "$PAYLOAD_ZIP"

cd "$SETUP_DIR"
zip -r -0 "$PAYLOAD_ZIP" . \
    -x "*.pyc" \
    -x "__pycache__/*" \
    -x "SiteyVM.exe" \
    > /dev/null 2>&1

cd "$SCRIPT_DIR"

PAYLOAD_SIZE=$(stat -c%s "$PAYLOAD_ZIP")
echo "  Payload ZIP: $(( PAYLOAD_SIZE / 1024 )) KB ($PAYLOAD_SIZE bytes)"
echo ""

echo "  [4/5] Self-extracting EXE olusturuluyor..."

cp "$STUB_EXE" "$FINAL_EXE"
cat "$PAYLOAD_ZIP" >> "$FINAL_EXE"

# Footer: [4 byte zip_size LE] [4 byte magic 0x564D5346 "FSMV"]
python3 -c "
import struct, sys
zs = $PAYLOAD_SIZE
sys.stdout.buffer.write(struct.pack('<II', zs, 0x564D5346))
" >> "$FINAL_EXE"

FINAL_SIZE=$(stat -c%s "$FINAL_EXE")
echo "  Final EXE: $(( FINAL_SIZE / 1024 / 1024 )) MB ($FINAL_SIZE bytes)"
echo ""

echo "  [5/5] Dogrulama..."

FILE_TYPE=$(file "$FINAL_EXE")
if echo "$FILE_TYPE" | grep -q "PE32+"; then
    echo "  PE32+ Windows executable"
else
    echo "  HATA: Gecerli PE dosyasi degil!"
    exit 1
fi

SHA=$(sha256sum "$FINAL_EXE" | awk '{print $1}')

echo ""
echo "  ================================================"
echo "    BUILD TAMAMLANDI!"
echo "  ================================================"
echo ""
echo "    Dosya   : $FINAL_EXE"
echo "    Boyut   : $(( FINAL_SIZE / 1024 / 1024 )) MB"
echo "    SHA256  : $SHA"
echo ""
echo "    Icerik:"
echo "    SFX Stub   : $(( STUB_SIZE / 1024 )) KB"
echo "    Payload ZIP: $(( PAYLOAD_SIZE / 1024 )) KB"
echo ""
echo "    Windows'ta kullanim:"
echo "    1. SiteyVM_Setup_v${VERSION}.exe cift tiklayin"
echo "    2. Kurulum otomatik baslar"
echo "    3. Admin sifrenizi belirleyin"
echo "    4. Uygulama baslatilir"
echo ""

rm -f "$STUB_EXE" "$PAYLOAD_ZIP" "$BUILD_DIR/siteyvm_res.o" "$BUILD_DIR/icon.ico"
echo "  Gecici dosyalar temizlendi."
echo ""
