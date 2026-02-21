import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillow gerekli: pip install Pillow")
    sys.exit(1)

script_dir = os.path.dirname(os.path.abspath(__file__))
logo_path = os.path.join(script_dir, "..", "backend", "LOGO.png")
ico_path = os.path.join(script_dir, "siteyvm.ico")

if not os.path.exists(logo_path):
    img = Image.new("RGBA", (256, 256), (37, 99, 235, 255))
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 180)
    except Exception:
        font = ImageFont.load_default()
    draw.text((60, 20), "S", fill=(255, 255, 255, 255), font=font)
else:
    img = Image.open(logo_path)

sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
img.save(ico_path, format="ICO", sizes=sizes)
print("[OK] Ikon olusturuldu: {}".format(ico_path))
