"""One-off media prep: navbar badge, favicon, faculty photo crop,
transparent team diamonds, certificate recompression."""
from pathlib import Path

from PIL import Image, ImageDraw

MEDIA = Path(__file__).resolve().parent.parent / "media"


def dark_row_profile(img, limit=200):
    gray = img.convert("L")
    w, h = gray.size
    px = gray.load()
    rows = []
    for y in range(h):
        count = sum(1 for x in range(0, w, 2) if px[x, y] < limit)
        rows.append(count * 2)
    return rows


def contiguous_blocks(rows, min_count):
    blocks, start = [], None
    for y, c in enumerate(rows):
        if c >= min_count and start is None:
            start = y
        elif c < min_count and start is not None:
            blocks.append((start, y - 1))
            start = None
    if start is not None:
        blocks.append((start, len(rows) - 1))
    return blocks


# --- 1. CSI badge: crop octagonal emblem (drop the text band below it) ---
logo = Image.open(MEDIA / "csisaulogo.jpg").convert("RGB")
rows = dark_row_profile(logo)
badge_block = max(contiguous_blocks(rows, 60), key=lambda b: b[1] - b[0])
y0, y1 = badge_block
band = logo.crop((0, y0, logo.width, y1 + 1))
cols = dark_row_profile(band.rotate(90, expand=True))
x0, x1 = max(contiguous_blocks(cols, 60), key=lambda b: b[1] - b[0])
side = max(x1 - x0, y1 - y0) + 24
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
sq = logo.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))
sq.save(MEDIA / "csi-badge.jpg", quality=90, optimize=True)
sq.resize((64, 64), Image.LANCZOS).save(MEDIA / "csi-badge.png", optimize=True)
print("badge block rows", y0, y1, "cols", x0, x1, "-> csi-badge.jpg", sq.size)

# --- 2. Faculty photo: circular source -> inscribed rectangle ---
src = Image.open(MEDIA / "rrastogi.jpeg").convert("RGB")
w, h = src.size
gray = src.convert("L")
px = gray.load()


def is_content(x, y):
    return px[x, y] > 24  # photo sits on a black field


xs = [x for x in range(w) if any(is_content(x, y) for y in range(0, h, 8))]
ys = [y for y in range(h) if any(is_content(x, y) for x in range(0, w, 8))]
cx, cy = (xs[0] + xs[-1]) // 2, (ys[0] + ys[-1]) // 2
d = min(xs[-1] - xs[0], ys[-1] - ys[0])
side = int(d * 0.7071 * 0.985)  # inscribed square, slight safety inset
crop = src.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))
crop.save(MEDIA / "rrastogi-crop.jpg", quality=90, optimize=True)
print("rrastogi", src.size, "->", crop.size)

# --- 3. Team diamonds: knock out the white field -> transparent PNGs ---
names = ["tech", "rnd", "fin", "des", "pr", "em", "doc"]
for name in names:
    im = Image.open(MEDIA / f"{name}.jpg").convert("RGB")
    w, h = im.size
    KEY = (255, 0, 255)
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if im.getpixel(corner) != KEY:
            ImageDraw.floodfill(im, corner, KEY, thresh=55)
    out = Image.new("RGBA", im.size)
    out.putalpha(8)
    rgba = out.load()
    src_px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src_px[x, y]
            rgba[x, y] = (r, g, b, 255) if (r, g, b) != KEY else (r, g, b, 0)
    plain = MEDIA / f"{name}.png"
    out.save(plain, optimize=True)
    quant = out.quantize(colors=255, method=Image.FASTOCTREE)
    quant.save(MEDIA / f"{name}-q.png", optimize=True)
    sizes = {p.name: p.stat().st_size for p in [plain, MEDIA / f"{name}-q.png"]}
    print(name, im.size, sizes)

# --- 4. Certificate: recompress ---
cert_path = MEDIA / "certificate.jpg"
cert = Image.open(cert_path).convert("RGB")
before = cert_path.stat().st_size
if cert.width > 1600:
    cert = cert.resize((1600, int(cert.height * 1600 / cert.width)), Image.LANCZOS)
cert.save(cert_path, quality=85, optimize=True, progressive=True)
print("certificate", before // 1024, "KB ->", cert_path.stat().st_size // 1024, "KB", cert.size)
