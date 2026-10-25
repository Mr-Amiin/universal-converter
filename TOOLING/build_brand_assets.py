#!/usr/bin/env python3
"""Generate Universal Converter brand assets (SVG, PNG, ICO).

Run:  python3 build_brand.py <output_dir> [path/to/Montserrat-ExtraBold.ttf]
Requires: fonttools, cairosvg, Pillow.
The wordmark is converted to outlines, so the SVGs need no web font.
"""
import math, os, sys, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import cairosvg
from PIL import Image

SW, SH = 262, 222
OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
FONT = sys.argv[2] if len(sys.argv) > 2 else "Montserrat.ttf"
os.makedirs(OUT, exist_ok=True)

# ---- palette (brand kit) ----------------------------------------------------
BLUE, BLUE_D, BLUE_L = "#2F8BFF", "#1565E0", "#5BA8FF"
GREEN, GREEN_D = "#22C55E", "#16A34A"
NAVY, SLATE, BG = "#0F2D5B", "#6B7280", "#F1F5F9"
# dark-mode accents (>= 4.5:1 on the site's dark surfaces)
BLUE_DK, BLUE_DK_D = "#5AA9FF", "#2F8BFF"
GREEN_DK, GREEN_DK_D = "#34D17A", "#22C55E"


def f(n):
    return ("%.2f" % n).rstrip("0").rstrip(".")


def pt(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def arc_arrow(cx, cy, R, a0, a1, sw, fill_id, head_len, head_w):
    """Clockwise (screen) arc from a0..a1 degrees with an arrowhead at a1.
    The stroke stops where the head begins so there is no overlap artefact."""
    # shorten the arc so the arrowhead base sits at the stroke end
    shorten = math.degrees(head_len * 0.35 / R)
    e = a1 - shorten
    x0, y0 = pt(cx, cy, R, a0)
    x1, y1 = pt(cx, cy, R, e)
    large = 1 if (e - a0) % 360 > 180 else 0
    d = f"M{f(x0)} {f(y0)}A{R} {R} 0 {large} 1 {f(x1)} {f(y1)}"
    # arrowhead
    th = math.radians(e)
    tx, ty = -math.sin(th), math.cos(th)      # tangent (clockwise)
    nx, ny = math.cos(th), math.sin(th)       # radial
    bx, by = x1, y1
    tip = (bx + tx * head_len, by + ty * head_len)
    p1 = (bx + nx * head_w, by + ny * head_w)
    p2 = (bx - nx * head_w, by - ny * head_w)
    head = f"M{f(p1[0])} {f(p1[1])}L{f(tip[0])} {f(tip[1])}L{f(p2[0])} {f(p2[1])}Z"
    return (f'<path d="{d}" fill="none" stroke="url(#{fill_id})" stroke-width="{sw}" stroke-linecap="round"/>'
            f'<path d="{head}" fill="url(#{fill_id})" stroke="url(#{fill_id})" stroke-width="2" stroke-linejoin="round"/>')


CONTINENTS = (
    # North America
    "M-52-12C-50-32-34-46-14-46C-4-46 4-40-2-33C-8-28-6-22-13-18C-18-13-12-7-21-3C-27 1-31-3-36 4C-43 9-53 1-52-12Z"
    # South America
    "M-25 9C-16 4-6 8-7 17C-8 27-14 35-18 46C-22 52-30 48-30 40C-30 30-35 22-32 15C-30 11-28 10-25 9Z"
    # Europe + Africa
    "M8-44C19-48 29-42 27-33C25-27 17-27 17-21C26-17 38-14 42-3C44 8 36 15 31 25C27 35 23 44 14 47C8 43 10 30 8 21C6 11-3 5 1-6C5-13 3-24 5-33Z"
    # Asia
    "M30-36C41-37 54-26 57-13C52-9 45-12 40-19C35-23 29-25 30-36Z"
)


def defs(dark, uid=""):
    b0, b1 = (BLUE_DK, BLUE_DK_D) if dark else (BLUE_L, BLUE_D)
    g0, g1 = (GREEN_DK, GREEN_DK_D) if dark else (GREEN, GREEN_D)
    globe0, globe1 = ("#4DA3FF", "#1565E0") if dark else ("#3D9BFF", "#0F55D0")
    return (
        f'<linearGradient id="b{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{b0}"/><stop offset="1" stop-color="{b1}"/></linearGradient>'
        f'<linearGradient id="g{uid}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{g0}"/><stop offset="1" stop-color="{g1}"/></linearGradient>'
        f'<radialGradient id="w{uid}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="{globe0}"/><stop offset="1" stop-color="{globe1}"/></radialGradient>'
    )


def tools(dark, uid=""):
    """Ruler, thermometer, weight, balance scale (viewBox 240x210 space)."""
    c = BLUE_DK if dark else BLUE_D
    c2 = BLUE_DK_D if dark else BLUE
    # ruler
    ticks = "".join(
        f'<rect x="{f(-27 + i * 6.2)}" y="{-10 if i % 2 == 0 else -10}" width="2" height="{9 if i % 2 == 0 else 5}" rx="1" fill="#fff"/>'
        for i in range(9)
    )
    ruler = (f'<g transform="translate(38 60) rotate(-42)"><rect x="-33" y="-11" width="66" height="22" rx="4" fill="url(#b{uid})"/>'
             f'{ticks}</g>')
    # thermometer
    thermo = (f'<g transform="translate(216 36) scale(.92)" fill="none" stroke="{c}" stroke-linecap="round" stroke-linejoin="round">'
              f'<path d="M-6-22a6 6 0 0 1 12 0V6.5a13 13 0 1 1-12 0Z" stroke-width="5"/>'
              f'<path d="M0-10V12" stroke-width="5"/><circle cx="0" cy="17" r="6" fill="{c}" stroke="none"/></g>')
    # weight
    weight = (f'<g transform="translate(236 130) scale(.9)"><path d="M-8-13a8 8 0 1 1 16 0" fill="none" stroke="{c2}" stroke-width="5" stroke-linecap="round"/>'
              f'<path d="M-12-12h24l9 28a4 4 0 0 1-3.8 5.2H-17.2A4 4 0 0 1-21 16Z" fill="url(#b{uid})"/></g>')
    # balance scale
    scale = (f'<g transform="translate(36 190) scale(.86)" fill="none" stroke="{c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">'
             f'<path d="M0-24V22M-14 24H14M-24-18H24"/>'
             f'<path d="M-24-18L-33 0M-24-18L-15 0M-36 0H-12M24-18L15 0M24-18L33 0M12 0H36" stroke-width="3.6"/>'
             f'<path d="M-37 0a13 8 0 0 0 26 0M11 0a13 8 0 0 0 26 0" stroke-width="3.6"/></g>')
    return ruler + thermo + weight + scale


def symbol_body(dark=False, uid="", with_tools=True):
    """The full symbol, drawn in a 240x210 box."""
    cx, cy, R = 128, 112, 78
    globe = (f'<g transform="translate({cx} {cy})"><circle r="60" fill="url(#w{uid})"/>'
             f'<clipPath id="cl{uid}"><circle r="60"/></clipPath>'
             f'<g clip-path="url(#cl{uid})"><path d="{CONTINENTS}" fill="#fff" fill-opacity=".94"/></g></g>')
    ring = (arc_arrow(cx, cy, R, 172, 306, 13, f"b{uid}", 26, 18)
            + arc_arrow(cx, cy, R, 352, 486, 13, f"g{uid}", 26, 18))
    return (tools(dark, uid) if with_tools else "") + globe + ring


# ---- simplified mark for favicons (viewBox 0 0 64 64) --------------------------
MINI_CONT = (
    "M-52-12C-50-32-34-46-14-46C-4-46 4-40-2-33C-8-28-6-22-13-18C-18-13-12-7-21-3C-27 1-31-3-36 4C-43 9-53 1-52-12Z"
    "M8-44C19-48 29-42 27-33C25-27 17-27 17-21C26-17 38-14 42-3C44 8 36 15 31 25C27 35 23 44 14 47C8 43 10 30 8 21C6 11-3 5 1-6C5-13 3-24 5-33Z"
)


def mini_body(dark=False, uid="m"):
    """Simplified mark: darker globe, two continents, bold arrows (tuned for 16-48px)."""
    cx = cy = 32
    globe_fill = "#1B66E8" if not dark else "#2F8BFF"
    globe = (f'<g transform="translate(32 32)"><circle r="18.5" fill="{globe_fill}"/>'
             f'<clipPath id="cl{uid}"><circle r="18.5"/></clipPath>'
             f'<g clip-path="url(#cl{uid})"><path d="{MINI_CONT}" transform="scale(.3)" fill="#fff" fill-opacity=".92"/></g></g>')
    ring = (arc_arrow(cx, cy, 26.5, 176, 308, 6.4, f"b{uid}", 11, 8.8)
            + arc_arrow(cx, cy, 26.5, 356, 488, 6.4, f"g{uid}", 11, 8.8))
    return '<g transform="translate(32 32) scale(.9) translate(-32 -32)">' + globe + ring + '</g>'


# ---- wordmark as outlines ------------------------------------------------------
font = TTFont(FONT)
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
UPM = font["head"].unitsPerEm
CAP = font["OS/2"].sCapHeight


def text_path(txt, size, x, baseline, track=-0.012):
    s = size / UPM
    pen = SVGPathPen(gs, ntos=lambda v: f(v))
    cur = 0.0
    for ch in txt:
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, x + cur * s, baseline))
        gs[g].draw(tp)
        cur += hmtx[g][0] + track * UPM
    return pen.getCommands(), cur * s


def wordmark(dark=False, size=88):
    l1, l2 = ("Universal", "Converter")
    c1 = "#FFFFFF" if dark else NAVY
    c2 = BLUE_DK if dark else BLUE
    x = 286
    d1, w1 = text_path(l1, size, x, 108)
    d2, w2 = text_path(l2, size, x, 186)
    return (f'<path d="{d1}" fill="{c1}"/><path d="{d2}" fill="{c2}"/>'), x + max(w1, w2)


def svg(w, h, body, defs_="", title="", desc=""):
    t = f'<title>{title}</title>' if title else ""
    d = f'<desc>{desc}</desc>' if desc else ""
    aria = ' role="img"' if title else ' aria-hidden="true"'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" width="{f(w)}" height="{f(h)}"{aria}>'
            f'{t}{d}<defs>{defs_}</defs>{body}</svg>')


def write(name, s):
    with open(os.path.join(OUT, name), "w") as fh:
        fh.write(s)


# ---- horizontal logos ------------------------------------------------------------
for dark, name in ((False, "logo.svg"), (True, "logo-dark.svg")):
    wm, right = wordmark(dark)
    W = math.ceil(right + 6)
    write(name, svg(W, SH, symbol_body(dark) + wm, defs(dark),
                    "Universal Converter",
                    "Universal Converter logo: a globe wrapped in conversion arrows with a ruler, thermometer, weight and balance scale."))
    if not dark:
        LOGO_W = W

# ---- symbol only ------------------------------------------------------------------
write("logo-icon.svg", svg(SW, SH, symbol_body(False), defs(False), "Universal Converter",
                           "Universal Converter symbol: a globe wrapped in conversion arrows."))
write("logo-icon-dark.svg", svg(SW, SH, symbol_body(True), defs(True), "Universal Converter",
                                "Universal Converter symbol for dark backgrounds."))

# ---- favicon.svg (adapts to the browser's own light/dark UI) ------------------------
fav_defs = defs(False, "m") + (
    '<style>.t{fill:#fff;stroke:#d9e1ea;stroke-width:1}'
    '@media (prefers-color-scheme:dark){.t{fill:#0F2D5B;stroke:#2a4a7d}}</style>')
dark_defs_fav = defs(True, "n")
fav_light = f'<g class="lt">{mini_body(False, "m")}</g>'
fav_dark = f'<g class="dk" style="display:none">{mini_body(True, "n")}</g>'
fav_defs += ('<style>@media (prefers-color-scheme:dark){.lt{display:none}.dk{display:inline!important}}</style>')
write("favicon.svg", svg(64, 64, '<rect class="t" x=".5" y=".5" width="63" height="63" rx="14"/>' + fav_light + fav_dark,
                         fav_defs + dark_defs_fav, "Universal Converter"))


# ---- raster helpers --------------------------------------------------------------
def render(svg_str, size, path, bg=None):
    png = cairosvg.svg2png(bytestring=svg_str.encode(), output_width=size, output_height=size)
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    if bg:
        base = Image.new("RGBA", im.size, bg)
        base.alpha_composite(im)
        im = base
    im.save(path, optimize=True)
    return im


def square_icon(size_units, bg, mark_scale, dark=False, tile_radius=0, detailed=True):
    """Return an SVG string: background tile + centred symbol."""
    uid = "i"
    if detailed:
        body = symbol_body(dark, uid)
        bw, bh = SW, SH
    else:
        body = mini_body(dark, uid)
        bw, bh = 64, 64
    s = size_units * mark_scale / max(bw, bh)
    tx = (size_units - bw * s) / 2
    ty = (size_units - bh * s) / 2
    rect = (f'<rect width="{size_units}" height="{size_units}" rx="{tile_radius}" fill="{bg}"/>' if bg else "")
    return svg(size_units, size_units, f'{rect}<g transform="translate({f(tx)} {f(ty)}) scale({f(s)})">{body}</g>',
               defs(dark, uid))


# transparent small favicons use the simplified mark
mini_transparent = svg(64, 64, mini_body(False, "m"), defs(False, "m"))
render(mini_transparent, 16, os.path.join(OUT, "favicon-16x16.png"))
render(mini_transparent, 32, os.path.join(OUT, "favicon-32x32.png"))
render(mini_transparent, 48, os.path.join(OUT, "favicon-48x48.png"))
imgs = [Image.open(os.path.join(OUT, n)).convert("RGBA") for n in ("favicon-16x16.png", "favicon-32x32.png", "favicon-48x48.png")]
imgs[2].save(os.path.join(OUT, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=imgs[:2])
os.remove(os.path.join(OUT, "favicon-48x48.png"))

# apple touch icon: opaque (iOS rounds the corners itself)
render(square_icon(180, "#FFFFFF", 0.94), 180, os.path.join(OUT, "apple-touch-icon.png"), bg="#FFFFFF")
# android: 'any' icons on a rounded white tile, plus maskable (safe zone = inner 80%)
for n in (192, 512):
    render(square_icon(n, "#FFFFFF", 0.90, tile_radius=round(n * 0.22)), n, os.path.join(OUT, f"android-chrome-{n}x{n}.png"))
render(square_icon(512, "#FFFFFF", 0.74), 512, os.path.join(OUT, "android-chrome-maskable-512x512.png"), bg="#FFFFFF")

# social sharing card 1200x630
wm, right = wordmark(False)
LW = right + 6
scale = 960 / LW
card = svg(1200, 630,
           f'<rect width="1200" height="630" fill="#FFFFFF"/><rect y="590" width="1200" height="40" fill="{NAVY}"/>'
           f'<rect x="780" y="590" width="260" height="40" fill="{BLUE}"/><rect x="1040" y="590" width="160" height="40" fill="{GREEN}"/>'
           f'<g transform="translate({f((1200 - LW * scale) / 2)} 130) scale({f(scale)})">{symbol_body(False, "s")}{wm}</g>'
           f'<text x="600" y="470" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-size="34" fill="{SLATE}">'
           f'Convert Anything, Anywhere</text>', defs(False, "s"))
png = cairosvg.svg2png(bytestring=card.encode(), output_width=1200, output_height=630)
Image.open(io.BytesIO(png)).convert("RGB").save(os.path.join(OUT, "og-image.png"), optimize=True)

# previews for review only (not shipped)
os.makedirs(os.path.join(OUT, "_preview"), exist_ok=True)
for name, bg in (("logo.svg", "#FFFFFF"), ("logo-dark.svg", "#1a1f24")):
    s = open(os.path.join(OUT, name)).read()
    png = cairosvg.svg2png(bytestring=s.encode(), output_width=1100, background_color=bg)
    open(os.path.join(OUT, "_preview", name.replace(".svg", ".png")), "wb").write(png)
print("logo viewBox width:", LOGO_W)
