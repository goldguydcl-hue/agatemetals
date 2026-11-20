"""Build Devvit catalog assets for the Agate Metals Checker app.
Uses the real Agate logo (~/workspace/apm-site/logo-transparent.png).
Palette matches agatepreciousmetals.com: ink #0b172b, gold #d4af37.
Outputs (PNG):
  icon.png       512x512   Promotional icon
  tile.png       512x512   Tile image
  featuring.png  1200x600  Featuring asset
  fallback.png   1200x600  Fallback asset
Sizes are the standard Devvit/portal sizes; the portal validates on upload
and will flag any size it wants changed.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = "/home/hatch/workspace/reddit-devvit-app/assets"
LOGO = "/home/hatch/workspace/apm-site/logo-transparent.png"
INK = (11, 23, 43)          # #0b172b
INK2 = (16, 32, 58)         # slightly lighter panel
GOLD = (212, 175, 55)       # #d4af37
GOLD_DARK = (138, 109, 31)  # #8a6d1f
SILVER = (192, 198, 208)
WHITE = (255, 255, 255)
MUTED = (160, 170, 185)

SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

logo = Image.open(LOGO).convert("RGBA")


def font(path, size):
    return ImageFont.truetype(path, size)


def bg(size, vertical=True):
    """Dark gradient background with a faint gold glow."""
    w, h = size
    base = Image.new("RGB", size, INK)
    # vertical gradient ink -> ink2
    grad = Image.new("L", (1, h))
    for y in range(h):
        grad.putpixel((0, y), int(255 * (1 - 0.35 * y / h)))
    grad = grad.resize(size)
    overlay = Image.new("RGB", size, INK2)
    base = Image.composite(overlay, base, grad)
    # soft gold glow, top center
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([w * 0.5 - 260, -260, w * 0.5 + 260, 260], fill=(212, 175, 55, 28))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    base = Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB")
    return base


def paste_logo(canvas, box, scale_to=None):
    """Paste logo scaled to fit box (x0,y0,x1,y1), centered."""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    s = min(bw / logo.width, bh / logo.height)
    lw, lh = int(logo.width * s), int(logo.height * s)
    small = logo.resize((lw, lh), Image.LANCZOS)
    canvas.paste(small, (x0 + (bw - lw) // 2, y0 + (bh - lh) // 2), small)
    return (x0 + (bw - lw) // 2, y0 + (bh - lh) // 2, lw, lh)


def gold_rule(draw, x0, y, x1, w=3):
    draw.line([(x0, y), (x1, y)], fill=GOLD, width=w)


def text_center(draw, cx, y, s, fnt, fill):
    w = draw.textlength(s, font=fnt)
    draw.text((cx - w / 2, y), s, font=fnt, fill=fill)
    return y + fnt.size


# ---- 1. icon 512x512 -------------------------------------------------------
im = bg((512, 512))
d = ImageDraw.Draw(im)
d.rectangle([6, 6, 505, 505], outline=GOLD, width=4)
paste_logo(im, (66, 46, 446, 426))
d = ImageDraw.Draw(im)
y = text_center(d, 256, 436, "METALS CHECKER", font(SANS_B, 30), GOLD)
im.save(f"{OUT}/icon.png")

# ---- 2. tile 512x512 -------------------------------------------------------
im = bg((512, 512))
d = ImageDraw.Draw(im)
paste_logo(im, (86, 30, 426, 370))
d = ImageDraw.Draw(im)
y = text_center(d, 256, 380, "AGATE METALS CHECKER", font(SANS_B, 27), WHITE)
gold_rule(d, 156, 428, 356, 3)
y = text_center(d, 256, 444, "GOLD  •  SILVER  •  PLATINUM", font(SANS_B, 19), GOLD)
im.save(f"{OUT}/tile.png")

# ---- 3. featuring 1200x600 --------------------------------------------------
im = bg((1200, 600))
d = ImageDraw.Draw(im)
paste_logo(im, (60, 90, 480, 510))
d = ImageDraw.Draw(im)
x = 540
d.text((x, 150), "What's your", font=font(SERIF_B, 76), fill=WHITE)
d.text((x, 235), "metal worth?", font=font(SERIF_B, 76), fill=GOLD)
gold_rule(d, x, 345, x + 180, 4)
d.text((x, 375), "Live gold, silver & platinum values —", font=font(SANS, 30), fill=SILVER)
d.text((x, 415), "right inside Reddit.", font=font(SANS, 30), fill=SILVER)
d.text((x, 480), "AGATE METALS CHECKER  •  AGATE PRECIOUS METALS",
       font=font(SANS_B, 20), fill=MUTED)
im.save(f"{OUT}/featuring.png")

# ---- 4. fallback 1200x600 ----------------------------------------------------
im = bg((1200, 600))
d = ImageDraw.Draw(im)
paste_logo(im, (380, 40, 820, 480))
d = ImageDraw.Draw(im)
y = text_center(d, 600, 480, "AGATE METALS CHECKER", font(SERIF_B, 44), WHITE)
gold_rule(d, 480, 545, 720, 3)
im.save(f"{OUT}/fallback.png")

for f in sorted(os.listdir(OUT)):
    p = os.path.join(OUT, f)
    print(f, Image.open(p).size, os.path.getsize(p), "bytes")
