#!/usr/bin/env python3
"""Six Peaks Games, Direction A2 (Bug Hunt): pixel asset kit generator.

    python3 tools/a2-pixel-kit.py            # rebuild assets/web/pixel/ + qa/pixel-kit-sheet.png,
                                             # then run tools/a2-pixel-kit-check.mjs (exit 1 on a miss)
    python3 tools/a2-pixel-kit.py --preview  # also save the 1x style frame to $KIT_SCRATCH

Outputs (assets/web/pixel/): palette.json, sprites.png + sprites.json, peaks.json, sky.png,
bg-far.png, bg-mid.png, level-terrain.png (optional pre-render of the ground), billboard-<slug>.png
(13 shipped titles), sign-<partner>.png (15 partners), title-logo.png + title-logo-blocks.json,
style-frame.png (384x216 composed from the kit, shown x4).

Sprites are authored below as readable string maps (one character per pixel, legend in CHARS);
boards, frames and signs are drawn with small helpers. Palette = the DIRECTION-A2 tokens only.
Light comes from the upper left. Characters and props carry a 1px ink outline; `outline()` adds
it around every non-ink opaque pixel so silhouettes stay consistent between frames. The build is
deterministic (same inputs, same bytes).
"""
from __future__ import annotations

import json
import math
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "assets" / "web"
OUT = WEB / "pixel"
QA = ROOT / "qa"
SCRATCH = Path(os.environ.get("KIT_SCRATCH", "/tmp/a2-pixel-kit-preview"))

# --------------------------------------------------------------------------------------
# Palette: exactly the DIRECTION-A2 tokens (21 of the 24 allowed)
# --------------------------------------------------------------------------------------
PALETTE = {
    "night": "#0B0E17",
    "deep": "#141B2B",
    "ridge-far": "#3A4A66",
    "ridge-mid": "#2A3650",
    "ridge-near": "#1B2436",
    "snow": "#F2F5F8",
    "snow-shade": "#B9C6D6",
    "rock": "#59667A",
    "grass": "#3E8E4E",
    "grass-dark": "#245C35",
    "wood": "#8A5A3B",
    "wood-dark": "#4C3125",
    "paper": "#F3E8D2",
    "ink": "#1A1420",
    "red": "#E02B20",
    "red-light": "#FF6A4D",
    "gold": "#F2B33D",
    "sky-dawn": "#F08A5D",
    "magenta": "#FF2BD6",
    "cyan": "#46D9FF",
    "white": "#FFFFFF",
}


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


RGB = {k: hex_rgb(v) for k, v in PALETTE.items()}
PAL_SET = set(RGB.values())

# One character per pixel. 'x'/'X' = the missing-texture checker (magenta + ink, 2px squares).
CHARS = {
    ".": None,
    "k": "ink",
    "n": "night",
    "d": "deep",
    "1": "ridge-near",
    "2": "ridge-mid",
    "3": "ridge-far",
    "r": "rock",
    "s": "snow-shade",
    "S": "snow",
    "W": "white",
    "g": "grass",
    "G": "grass-dark",
    "w": "wood",
    "b": "wood-dark",
    "p": "paper",
    "R": "red",
    "L": "red-light",
    "y": "gold",
    "o": "sky-dawn",
    "m": "magenta",
    "c": "cyan",
}
INK = RGB["ink"] + (255,)


def rgba(token: str) -> tuple[int, int, int, int]:
    return RGB[token] + (255,)


def parse(art: str, w: int | None = None, h: int | None = None, name: str = "?") -> Image.Image:
    """String map -> RGBA image. Rows are stripped of surrounding whitespace; blank lines skipped."""
    rows = [r.strip() for r in art.strip("\n").splitlines()]
    rows = [r for r in rows if r]
    hh = len(rows)
    ww = max(len(r) for r in rows)
    for i, r in enumerate(rows):
        if len(r) != ww:
            raise ValueError(f"{name}: row {i} has {len(r)} chars, expected {ww}: {r!r}")
    if w is not None and ww != w or h is not None and hh != h:
        raise ValueError(f"{name}: size {ww}x{hh}, expected {w}x{h}")
    im = Image.new("RGBA", (ww, hh), (0, 0, 0, 0))
    px = im.load()
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in ("x", "X"):
                phase = ((x // 2) + (y // 2)) % 2
                if ch == "X":
                    phase ^= 1
                px[x, y] = rgba("magenta") if phase == 0 else INK
                continue
            if ch not in CHARS:
                raise ValueError(f"{name}: unknown char {ch!r} at {x},{y}")
            tok = CHARS[ch]
            if tok:
                px[x, y] = rgba(tok)
    return im


def outline(im: Image.Image, diagonal: bool = False) -> Image.Image:
    """Add a 1px ink outline around every opaque non-ink pixel (ink details stay 1px)."""
    a = np.array(im)
    op = a[:, :, 3] > 0
    is_ink = op & (a[:, :, 0] == INK[0]) & (a[:, :, 1] == INK[1]) & (a[:, :, 2] == INK[2])
    src = op & ~is_ink
    h, w = op.shape
    nb = np.zeros_like(op)
    shifts = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    if diagonal:
        shifts += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    for dy, dx in shifts:
        s = np.zeros_like(op)
        ys0, ys1 = max(0, dy), h + min(0, dy)
        xs0, xs1 = max(0, dx), w + min(0, dx)
        s[ys0:ys1, xs0:xs1] = src[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
        nb |= s
    add = nb & ~op
    a[add] = INK
    return Image.fromarray(a, "RGBA").copy()


def paste(dst: Image.Image, src: Image.Image, x: int, y: int) -> None:
    dst.alpha_composite(src, (x, y))


def blank(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def scale(im: Image.Image, k: int) -> Image.Image:
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def assert_palette(im: Image.Image, name: str, extra_ok: bool = False) -> None:
    a = np.array(im.convert("RGBA"))
    op = a[:, :, 3] > 0
    if np.any((a[:, :, 3] > 0) & (a[:, :, 3] < 255)):
        raise ValueError(f"{name}: semi-transparent pixels (anti-aliasing) found")
    cols = {tuple(c) for c in a[op][:, :3].tolist()}
    bad = cols - PAL_SET
    if bad and not extra_ok:
        raise ValueError(f"{name}: off-palette colours {sorted(bad)[:6]}")



def part(art: str, name: str = "part") -> Image.Image:
    """Like parse(), but rows may be ragged (right-padded with transparency)."""
    rows = [r.strip() for r in art.strip("\n").splitlines()]
    rows = [r for r in rows if r]
    w = max(len(r) for r in rows)
    return parse("\n".join(r.ljust(w, ".") for r in rows), name=name)


def rimmed(art: str) -> str:
    """Checker cells within 2px of the outside turn solid magenta: the silhouette keeps a 2px magenta
    band and reads against the darkest night backgrounds, the checker stays inside as a patch."""
    rows = [r.strip() for r in art.strip("\n").splitlines() if r.strip()]
    w = max(len(r) for r in rows)
    g = [list(r.ljust(w, ".")) for r in rows]
    h = len(g)
    out = [row[:] for row in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] != "x":
                continue
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    yy, xx = y + dy, x + dx
                    if not (0 <= yy < h and 0 <= xx < w) or g[yy][xx] == ".":
                        out[y][x] = "m"
    return "\n".join("".join(r) for r in out)


def comp(size: tuple[int, int], layers, do_outline: bool = True) -> Image.Image:
    """Stack (image, dx, dy) layers back to front, then add the ink outline."""
    im = blank(*size)
    for art, dx, dy in layers:
        paste(im, art, dx, dy)
    return outline(im) if do_outline else im


# --------------------------------------------------------------------------------------
# 3x5 pixel font for in-world signs (Tom Thumb style)
# --------------------------------------------------------------------------------------
FONT3 = {
    "A": "010 101 111 101 101", "B": "110 101 110 101 110", "C": "011 100 100 100 011",
    "D": "110 101 101 101 110", "E": "111 100 111 100 111", "F": "111 100 111 100 100",
    "G": "011 100 101 101 011", "H": "101 101 111 101 101", "I": "111 010 010 010 111",
    "J": "001 001 001 101 010", "K": "101 101 110 101 101", "L": "100 100 100 100 111",
    "M": "10001 11011 10101 10001 10001", "N": "1001 1101 1011 1001 1001", "O": "010 101 101 101 010",
    "P": "110 101 110 100 100", "Q": "010 101 101 111 011", "R": "110 101 110 101 101",
    "S": "011 100 010 001 110", "T": "111 010 010 010 010", "U": "101 101 101 101 011",
    "V": "101 101 101 010 010", "W": "10001 10001 10101 11011 10001", "X": "101 101 010 101 101",
    "Y": "101 101 010 010 010", "Z": "111 001 010 100 111", " ": "000 000 000 000 000",
    ">": "100 110 111 110 100", "-": "000 000 111 000 000", ".": "000 000 000 000 010",
}


def glyph_w(ch: str) -> int:
    return len(FONT3[ch].split()[0])


def text_width(s: str) -> int:
    return sum(glyph_w(c) + 1 for c in s) - 1 if s else 0


def draw_text(im: Image.Image, s: str, x: int, y: int, token: str = "ink") -> None:
    px = im.load()
    col = rgba(token)
    cx = x
    for ch in s:
        rows = FONT3[ch].split()
        for yy, r in enumerate(rows):
            for xx, b in enumerate(r):
                if b == "1":
                    X, Y = cx + xx, y + yy
                    if 0 <= X < im.width and 0 <= Y < im.height:
                        px[X, Y] = col
        cx += len(rows[0]) + 1


def fill_rect(im: Image.Image, x0: int, y0: int, x1: int, y1: int, token: str) -> None:
    """Inclusive rectangle fill."""
    d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x1, y1], fill=rgba(token))


def put(im: Image.Image, pts, token: str) -> None:
    px = im.load()
    for x, y in pts:
        if 0 <= x < im.width and 0 <= y < im.height:
            px[x, y] = rgba(token)


# --------------------------------------------------------------------------------------
# The tester: generic avatar, red cap, headset with mic, gold jacket, small backpack.
# Built from layers (legs, body+arm, head) so every frame shares one head and outline.
# --------------------------------------------------------------------------------------
T_HEAD = """
................
................
......kkkkk.....
.....kLLRRRk....
....kLLkRRRRk...
....kLRkRRRRRkk.
...kRRRkRRRRRRRk
...kbkrkoooookkk
...kbksrkppkpk..
...kbkrrkppkppk.
...kbkrrkppppk..
....kbkkkkkspk..
"""
T_BODY = {
    "down": """
....kkkkyyyykk..
..kkwbkyyyyyyk..
..kwwbkyyoyyok..
..kwbbkyyoyyok..
..kbbbkyyoyook..
...kkkkooppkkk..
""",
    "fwd": """
....kkkkyyyykk..
..kkwbkyyyyyyk..
..kwwbkyyyoyokk.
..kwbbkyyyyoopk.
..kbbbkyyyyookk.
...kkkkoooookk..
""",
    "back": """
....kkkkyyyykk..
..kkwbkyyyyyyk..
..kwwbkoyyyyok..
..kwwkoyyyyyok..
..kbkpkyyyyook..
...kkkkoooookk..
""",
    "up": """
....kkkkyyyykkk.
..kkwbkyyyyyokpk
..kwwbkyyyyokkpk
..kwbbkyyyyyokk.
..kbbbkyyyyook..
...kkkkoooookk..
""",
    "out": """
....kkkkyyyykk..
..kkwbkyyyyyykkk
..kwwbkyyyyooopk
..kwbbkyyyyykkkk
..kbbbkyyyyook..
...kkkkoooookk..
""",
    "inspect": """
....kkkkyyyykkk.
..kkwbkyyyyykpk.
..kwwbkyyyookk..
..kwbbkyyoook...
..kbbbkyyyyook..
...kkkkooookkk..
""",
}
T_LEGS = {
    "stand": """
.....k3333kk....
....k3332kk.....
....k332k2k.....
....k32kk2k.....
....k32kk22k....
...kbbwkkbbwk...
...kkkkkkkkkk...
""",
    "contactA": """
.....k33322k....
....k22kk33k....
...k22k..k33k...
..k22k....k33k..
.kbbk.....kbbwk.
.kbk......kbbwwk
..k.......kkkkkk
""",
    "downA": """
.....k33322k....
....k22kk33k....
...k22kk333k....
..kbbk.k33k.....
..kbk..k33k.....
...k..kbbwwk....
......kkkkkk....
""",
    "passA": """
.....k33322k....
.....k33k22k....
.....k33k22bk...
.....k33kkbbk...
.....k33k.kk....
....kbbwwk......
....kkkkkk......
""",
    "contactB": """
.....k22333k....
....k33kk22k....
...k33k..k22k...
..k33k....k22k..
.kbbk.....kbbwk.
.kbk......kbbwwk
..k.......kkkkkk
""",
    "downB": """
.....k22333k....
....k33kk22k....
...k33kk222k....
..kbbk.k22k.....
..kbk..k22k.....
...k..kbbwwk....
......kkkkkk....
""",
    "passB": """
.....k22333k....
.....k22k33k....
.....k22k33bk...
.....k22kkbbk...
.....k22k.kk....
....kbbwwk......
....kkkkkk......
""",
    "tuck": """
.....k33322k....
....k333k22kk...
....k33kk222k...
...kbbwkkbbwk...
...kkkkkkkkkk...
................
................
""",
    "fall": """
.....k33322k....
....k332kk22k...
...k332k..k22k..
...k33k...k22k..
..kbbwk...kbbwk.
..kkkkk...kkkkk.
................
""",
}
T_LENS = """
.kkkk.
kSsSWk
kskksk
kskksk
kSsssk
.kkkk.
"""


def tester_frames() -> dict[str, Image.Image]:
    head = parse(T_HEAD, 16, 12, "t-head")
    body = {k: parse(v, 16, 6, "t-body-" + k) for k, v in T_BODY.items()}
    legs = {k: parse(v, 16, 7, "t-legs-" + k) for k, v in T_LEGS.items()}
    lens = parse(T_LENS, 6, 6, "t-lens")

    def frame(lg: str, bd: str, dy: int, inspect: bool = False, glint: bool = False) -> Image.Image:
        im = blank(16, 24)
        paste(im, legs[lg], 0, 17)
        paste(im, body[bd], 0, 12 + dy)
        paste(im, head, 0, dy)
        if inspect:
            put(im, [(12, 13 + dy)], "wood")  # magnifier handle into the hand
            ln = lens.copy()
            if glint:  # the glint travels across the glass on the second frame
                put(ln, [(4, 1)], "snow-shade")
                put(ln, [(1, 1)], "white")
            paste(im, ln, 10, 7 + dy)
        return im

    return {
        "tester_idle_0": frame("stand", "down", 0),
        "tester_idle_1": frame("stand", "down", 1),
        "tester_run_0": frame("contactA", "back", 0),
        "tester_run_1": frame("downA", "down", 1),
        "tester_run_2": frame("passA", "fwd", -1),
        "tester_run_3": frame("contactB", "fwd", 0),
        "tester_run_4": frame("downB", "down", 1),
        "tester_run_5": frame("passB", "back", -1),
        "tester_jump_0": frame("tuck", "up", -1),
        "tester_jump_1": frame("fall", "out", 0),
        "tester_inspect_0": frame("stand", "inspect", 0, inspect=True),
        "tester_inspect_1": frame("stand", "inspect", 1, inspect=True, glint=True),
    }


# --------------------------------------------------------------------------------------
# The eight demo bugs (bestiary = services). Family traits: magenta body, the
# missing-texture checker (magenta + ink, 2px squares), two white eyes looking left,
# ink legs and antennae, a white highlight upper left. 16x16, two frames each.
# --------------------------------------------------------------------------------------
def bug_frames() -> dict[str, Image.Image]:
    B: dict[str, Image.Image] = {}
    S = (16, 16)
    # 1 Functional QA, "Clipper": round dome beetle
    dome = part(rimmed("""
......mmmmm...
....mmWxxxxmm.
...mWmxxxxxxxm
..mmmmxxxxxxxm
.mWWmWWxxxxxxm
.mkWmkWxxxxxxm
.mmmmmmmmmmmmm
"""))
    B["bug_functional_0"] = comp(S, [(part(".k..k...k..k.\nk..k...k..k.."), 1, 12), (dome, 0, 5), (part("k..\n.k.\n..k"), 1, 2)])
    B["bug_functional_1"] = comp(S, [(part("k..k...k..k..\n.k..k...k..k."), 1, 12), (dome, 0, 4), (part(".k.\n.k.\n..k"), 1, 1)])
    # 2 Compliance QA, "Wrong Glyph": gamepad crab with a d-pad and the wrong button glyph
    pad = part("""
..mmmmmmmmmmmm..
.mmmkmmmmmmSSSm.
.mmkkkmmmmSSRSm.
.mmmkmmmmmmSSSm.
.mxxxxxxxxxxxxm.
.mxxmm....mmxxm.
..mmm......mmm..
""")
    eyes0 = part("WW...WW\nkW...kW\n.k...k.\n.k...k.")
    eyes1 = part(".WW.WW.\n.kW.kW.\n.k...k.\nk.....k")
    B["bug_compliance_0"] = comp(S, [(pad, 0, 6), (eyes0, 4, 2), (part(".k..........k.\nk............k"), 1, 13)])
    B["bug_compliance_1"] = comp(S, [(pad, 0, 7), (eyes1, 4, 3), (part("k............k\n.k..........k."), 1, 14)])
    # 3 Functional Localisation QA, "Overflow": caterpillar whose body runs out of its box
    cat = part("""
..mmm..mmmmmmmmmmmmmm
.mWmmmmxxxxmxxxxmxxxx
mWWmWWmxxxxmxxxxmxxxx
mkWmkWmxxxxmxxxxmxxxx
mmmmmmmxxxxmxxxxmxxxx
.mmmmmmmmmmmmmmmmmmmm
""")
    B["bug_localisation_0"] = comp(S, [(part(".k.k.k.k.k.k.k"), 2, 12), (cat, 0, 6), (part("k.\n.k\n.k"), 1, 3)])
    B["bug_localisation_1"] = comp(S, [(part("k.k.k.k.k.k.k."), 2, 12), (cat, 0, 5), (part(".k\n.k\n.k"), 1, 2)])
    # 4 Bug Reporting & Environment Management, "Ghost": floats, shows only now and then
    ghost = part("""
...mmmmmm...
..mWmmmmmmm.
.mWmmmmmmmmm
.mmWWmmWWmmm
.mmkWmmkWmmm
.mmmmmmmmmmm
.mxxxxxxxxxm
.mxxxxxxxxxm
.mxxxxxxxxxm
.mmxmmxmmxmm
""")
    B["bug_reporting_0"] = comp(S, [(ghost, 2, 2), (part(".m..m..m..m"), 3, 12), (part("k...k\n.k.k."), 5, 0)])
    B["bug_reporting_1"] = comp(S, [(ghost, 2, 1), (part("..m..m..m.."), 3, 11), (part(".k.k.\nk...k"), 5, -1)])
    # 5 Test Case Management, "Missing Step": carries a checklist, the last box is missing texture
    board = part("""
...www...
.ppbbbpp.
.pkppkkp.
.pppppkp.
.pkppkkp.
.pppppkp.
.pxxpkkp.
.pxxpppp.
.ppppppp.
""")
    bodyT = part("""
.....mmmmmmmmm
..mmmmmmmmmmmm
.mWWmWWmxxxxxm
.mkWmkWmxxxxxm
.mmmmmmmmmmmmm
""")
    B["bug_testcase_0"] = comp(S, [(part(".k..k...k..k.\nk..k...k..k.."), 1, 13), (board, 6, 1), (bodyT, 0, 8), (part("k.\n.k"), 1, 6)])
    B["bug_testcase_1"] = comp(S, [(part("k..k...k..k..\n.k..k...k..k."), 1, 13), (board, 6, 0), (bodyT, 0, 7), (part(".k\nk."), 1, 5)])
    # 6 Usability Testing, "Tiny Text": small beetle in oversized round glasses
    glasses = part("""
.kkkk.kkkk.
kSWSSkSWSSk
kSSkkSSkkSk
kSSkkSSkkSk
kSSSSkSSSSk
.kkkk.kkkk.
""")
    small = part("""
....mmmmmm..
..mmWxxxxxm.
.mmmxxxxxxxm
mmmmxxxxxxxm
mmmmxxxxxxxm
.mmmmmmmmmm.
""")
    B["bug_usability_0"] = comp(S, [(part(".k..k..k..k\nk..k..k..k."), 4, 13), (small, 4, 7), (glasses, 0, 6), (part("k.\n.k"), 2, 4)])
    B["bug_usability_1"] = comp(S, [(part("k..k..k..k.\n.k..k..k..k"), 4, 13), (small, 4, 6), (glasses, 0, 5), (part(".k\nk."), 2, 3)])
    # 7 Performance Testing, "Stutter": snail with a spiral shell; one band of the sprite tears
    shell = part(rimmed("""
...mmmmm..
.mmxxxxxmm
.mxxkkkxxm
mxxkxxxkxm
mxxkxkxkxm
mxxkxkkkxm
.mxxkxxxm.
..mmmmmm..
"""))
    slug = part("""
.WW.....
.kW.W...
..k.kW..
..mmmmmmmmmmmmm
.mmmmmmmmmmmmm.
""")

    def snail(rows: tuple[int, int], shift: int) -> Image.Image:
        im = blank(16, 16)
        paste(im, slug, 0, 7)
        paste(im, shell, 5, 3)
        band = im.crop((0, rows[0], 16, rows[1]))
        im.paste(blank(16, rows[1] - rows[0]), (0, rows[0]))
        im.alpha_composite(band, (shift, rows[0]))
        return outline(im)

    B["bug_performance_0"] = snail((5, 7), 1)
    B["bug_performance_1"] = snail((8, 10), -1)
    # 8 Release Candidate Oversight, "Last-minute Regression": a moth (the first logged bug was one)
    wings_up = part("""
mmm..........mmm
mxxm........mxxm
mxxxm..kk..mxxxm
mxxxxmkWWkmxxxxm
.mxxxmkkkkmxxxm.
..mxxmkrrkmxxm..
...mmmkrrkmmm...
......k33k......
.......kk.......
""")
    wings_dn = part("""
................
................
......kWWk......
.mmmmmkkkkmmmmm.
mxxxxxkrrkxxxxxm
mxxxxxkrrkxxxxxm
.mxxxxk33kxxxxm.
..mmmm.kk.mmmm..
""")
    feelers = part("k.....k\n.k...k.\n..k.k..")
    B["bug_rc_0"] = comp(S, [(wings_up, 0, 4), (feelers, 4, 1)])
    B["bug_rc_1"] = comp(S, [(wings_dn, 0, 4), (feelers, 4, 3)])
    return B


# --------------------------------------------------------------------------------------
# Six power-ups, one per pillar (16x16). Ink outline, light from the upper left.
# --------------------------------------------------------------------------------------
def power_frames() -> dict[str, Image.Image]:
    P: dict[str, Image.Image] = {}
    S = (16, 16)
    star = part("""
......W......
.....Wyy.....
.....yyy.....
....Wyyyo....
WWWyyyyyyyooo
.Wyyyyyyyyyo.
..yyyyyyyyo..
...yyyyyyo...
...yyyyyyyo..
..yyyo.oyyo..
..yyo...oyo..
.yo.......oo.
""")
    P["power_excellent"] = comp(S, [(star, 1, 2)])  # Technically Excellent: a star
    coin = part("""
.....yyyyy......
...yyWWyyyyy....
..yWWyyyyyyyo...
..yWyyyyyyyyo...
.yyyyyyyyyyyyo..
.yyyywyyyyyyyo..
.yyywwyywyyyyo..
.yyywwwwwwyyyo..
.yywwwwwwwwyyo..
..yyyyyyyyyyo...
..yyyyyyyyyoo...
...oyyyyyyoo....
.....ooooo......
""")
    P["power_priced"] = comp(S, [(coin, 0, 1)])  # Competitively Priced: a coin stamped with peaks
    bubble = part("""
..WWSSSSSSSSS...
.WSSSSSSSSSSSs..
.SSkkkSkkSSkSs..
.SSkSSSkSkSkSs..
.SSkkSSkSkSkSs..
.SSkSSSkSkSkSs..
.SSkkkSkSSkkSs..
.sSSSSSSSSSSss..
..sSSsssssssss..
...Ss...........
...s............
""")
    P["power_english"] = comp(S, [(bubble, 0, 2)])  # Native English Speaking: an EN speech bubble
    clock = part("""
..yy.......yy...
.yWyo.....yyyo..
.yyo.ppppp.yyo..
....pSSSSSp.....
...pSSSkSSSp....
...pSSSkSSSs....
...pSSSkkkSs....
...pSSSSSSSs....
...pSSSSSSSs....
....pSSSSSs.....
.....ppppp......
....w.....w.....
""")
    P["power_timezone"] = comp(S, [(clock, 0, 1)])  # Western Europe Time Zone: an alarm clock
    stick = part("""
......LLL.......
.....LWLRR......
.....LLRRR......
......RRR.......
.......k........
.......k........
.......k........
...rrrrrrrrr....
..rsssrRRryyy...
..rrrrrRRryyy...
..3333333333....
""")
    P["power_culture"] = comp(S, [(stick, 0, 2)])  # Culturally Aligned: lifelong gamers, an arcade stick
    head = part(".LRR.\nLRRRR\nRRRRR\npkpkp\nppppp\n.ppp.")
    shoulders = part(".yyyyy.\nyyyyyyy\nyyyyyyo")
    team = blank(16, 16)
    for hx, hy, bx, by in [(1, 1, 0, 7), (10, 1, 9, 7)]:
        team.alpha_composite(comp(S, [(shoulders, bx, by), (head, hx, hy)]))
    front_body = part(".yyyyyyy.\nyyyyyyyyy\nyyyyyyyyo\nyyyyyyyyo")
    team.alpha_composite(comp(S, [(front_body, 3, 10), (head, 5, 4)]))
    P["power_team"] = team  # Consistent Dedicated Teams: the same three testers
    return P


# --------------------------------------------------------------------------------------
# Props
# --------------------------------------------------------------------------------------
def wood_board(w: int, h: int, face: str = "deep", frame: int = 1) -> Image.Image:
    """Outlined wooden board: ink outline, wood frame lit top/left, dark bottom/right,
    an inner ink line, then the face colour."""
    im = blank(w, h)
    fill_rect(im, 0, 0, w - 1, h - 1, "ink")
    fill_rect(im, 1, 1, w - 2, h - 2, "wood")
    for i in range(frame):
        put(im, [(x, 1 + i) for x in range(1 + i, w - 1 - i)], "sky-dawn" if i == 0 else "wood")
        put(im, [(1 + i, y) for y in range(2 + i, h - 1 - i)], "wood")
        put(im, [(x, h - 2 - i) for x in range(1 + i, w - 1 - i)], "wood-dark")
        put(im, [(w - 2 - i, y) for y in range(2 + i, h - 1 - i)], "wood-dark")
    f = 1 + frame
    fill_rect(im, f, f, w - 1 - f, h - 1 - f, "ink")
    fill_rect(im, f + 1, f + 1, w - 2 - f, h - 2 - f, face)
    return im


def post(h: int) -> Image.Image:
    """A 4px wooden post whose last row is a clean cross-section (repeat it to extend)."""
    im = blank(4, h)
    for y in range(h):
        put(im, [(0, y), (3, y)], "ink")
        put(im, [(1, y)], "wood")
        put(im, [(2, y)], "wood-dark")
    put(im, [(1, 0), (2, 0)], "ink")
    return im


def prop_frames() -> tuple[dict[str, Image.Image], dict]:
    P: dict[str, Image.Image] = {}
    meta: dict = {}

    # Signpost (24x32): a route post with a blank arrow board pointing up the route.
    sp = blank(24, 32)
    paste(sp, post(26), 10, 6)
    arrow = part("""
kkkkkkkkkkkkkkkkkk...
koooooooooooooooowk..
kwwwwwwwwwwwwwwwwwwk.
kwwwwwwwwwwwwwwwwwwwk
kwbwwwwwwwwwwwwwwwbk.
kbbbbbbbbbbbbbbbbbk..
kkkkkkkkkkkkkkkkkk...
""")
    paste(sp, arrow, 1, 1)
    put(sp, [(3, 3), (17, 3)], "snow-shade")  # nails
    P["prop_signpost"] = sp

    # Signboard (52x24, kit addition): dark slate for a partner's 1-bit logo, mounted on the signpost.
    sb = wood_board(52, 24, "deep")
    put(sb, [(2, 2), (49, 2), (2, 21), (49, 21)], "snow-shade")
    P["prop_signboard"] = sb
    meta["signboardWindow"] = {"x": 3, "y": 3, "w": 46, "h": 18}
    meta["signpostMount"] = {"x": -14, "y": -6, "note": "partner signpost = prop_signpost, then prop_signboard at (signpost.x-14, signpost.y-6), then sign-<partner>.png centred in signboardWindow"}

    # Billboard (80x44): wooden frame, transparent 72x30 art window, two lamps, extendable legs.
    bb = blank(80, 44)
    paste(bb, post(8), 12, 36)
    paste(bb, post(8), 64, 36)
    frame = blank(80, 37)
    fill_rect(frame, 0, 0, 79, 36, "ink")
    fill_rect(frame, 1, 1, 78, 35, "wood")
    put(frame, [(x, 1) for x in range(1, 79)], "sky-dawn")
    put(frame, [(x, 34) for x in range(2, 79)], "wood-dark")
    put(frame, [(x, 35) for x in range(1, 79)], "wood-dark")
    put(frame, [(77, y) for y in range(2, 35)], "wood-dark")
    put(frame, [(78, y) for y in range(2, 36)], "wood-dark")
    fill_rect(frame, 3, 2, 76, 33, "ink")
    paste(bb, frame, 0, 3)
    a = np.array(bb)
    a[6:36, 4:76] = 0  # transparent art window: draw the art before or after the frame
    bb = Image.fromarray(a, "RGBA").copy()
    put(bb, [(2, 5), (77, 5), (2, 37), (77, 37)], "snow-shade")  # bolts
    lamp = part("""
..kkkkk..
.kk...k..
.k...kkkk
.k..kyyyyk
kk..kkkkk.
""")
    paste(bb, lamp, 16, 0)
    paste(bb, lamp, 52, 0)
    P["prop_billboard"] = bb
    meta["billboardWindow"] = {"x": 4, "y": 6, "w": 72, "h": 30}
    meta["billboardLegs"] = {"x": [12, 64], "w": 4, "note": "4px posts; repeat the last sprite row (y=43) to extend a leg down a slope"}

    # Boarded-up sign (48x32) for underway titles: two planks nailed across, a notice between.
    bd = blank(48, 32)
    paste(bd, post(9), 8, 23)
    paste(bd, post(9), 36, 23)
    board = wood_board(48, 24, "wood-dark")

    def plank(x0: int, y0: int, x1: int, y1: int) -> Image.Image:
        """A 3px plank between two points (shallow tilt), lit top edge, ink outline."""
        im = blank(48, 24)
        n = x1 - x0
        for i in range(n + 1):
            x = x0 + i
            y = y0 + round((y1 - y0) * i / n)
            put(im, [(x, y)], "sky-dawn")
            put(im, [(x, y + 1), (x, y + 2)], "wood")
            put(im, [(x, y + 3)], "wood-dark")
        return outline(im)

    board.alpha_composite(plank(2, 3, 45, 5))
    board.alpha_composite(plank(2, 15, 45, 13))
    notice = part("""
kkkkkkkkkkkkkk
kppppppppppppk
kp333p333pppsk
kppppppppppssk
kp33p3333p33sk
kssssssssssssk
kkkkkkkkkkkkkk
""")
    paste(board, notice, 17, 8)
    put(board, [(4, 5), (43, 7), (4, 17), (43, 15), (19, 9), (28, 9)], "snow-shade")  # nails
    paste(bd, board, 0, 0)
    P["prop_boarded"] = bd

    # Polaroid pickup (12x14): a generic mountain snapshot, never a person.
    P["prop_polaroid"] = parse("""
.kkkLLLkkkk.
kWWWLoLWWWWk
kW22222222sk
kW222S2222sk
kW22SSs2S2sk
kW2SSSsSSssk
kWSSsssssssk
kWGGgGGgGGsk
kWWWWWWWWWsk
kWW33W33WWsk
kWWWWWWWWWsk
kssssssssssk
kkkkkkkkkkkk
............
""", 12, 14, "prop_polaroid")

    # Summit flag (16x24), two frames: brand red with a white peak emblem; the tip lifts and dips.
    def flag(cloth: str) -> Image.Image:
        im = blank(16, 24)
        paste(im, part(".yy.\nyWyo\n.yo."), 0, 0)
        for y in range(3, 24):
            put(im, [(1, y)], "snow")
            put(im, [(2, y)], "snow-shade")
        paste(im, part(cloth), 3, 3)
        return outline(im)

    P["prop_flag_0"] = flag("""
RRLRRRRRR....
RLLRRRRRRRRR.
RRRRRSRRRRRRR
RRRRSSSRRRRR.
RRRSSSSSRRR..
RRRRRRRRRR...
bbRRRRbb.....
""")
    P["prop_flag_1"] = flag("""
RRLRRR.......
RLLRRRRRR....
RRRRRSRRRRR..
RRRRSSSRRRRRR
RRRSSSSSRRRRR
RRRRRRRRRRRRR
bbRRRRRRbbbb.
.....bbb.....
""")

    # Base-camp tent (32x24): brand-red A-frame, lit left face, lantern glow in the door, guy ropes.
    tent = blank(32, 24)
    apex_y, base_y, cx = 3, 21, 16
    for y in range(apex_y, base_y + 1):
        half = round((y - apex_y) * 14 / (base_y - apex_y))
        for x in range(cx - half - 1, cx + half + 1):
            put(tent, [(x, y)], "red-light" if x < cx else "red")
        dh = y - 10
        if dh >= 0:
            dhalf = round(dh * 6 / (base_y - 10))
            for x in range(cx - dhalf - 1, cx + dhalf + 1):
                put(tent, [(x, y)], "deep")
            put(tent, [(cx - dhalf - 2, y)], "wood-dark")
            put(tent, [(cx + dhalf + 1, y)], "wood-dark")
    put(tent, [(cx - 1, y) for y in range(apex_y + 1, 10)], "red")  # seam
    put(tent, [(x, 21) for x in range(cx - 4, cx + 4)], "gold")  # lantern light on the floor
    put(tent, [(x, 20) for x in range(cx - 3, cx + 3)], "gold")
    put(tent, [(cx - 1, 19), (cx, 19)], "gold")
    put(tent, [(cx - 1, 18)], "paper")
    put(tent, [(x, base_y) for x in range(cx - 15, cx - 4)], "red")  # hem
    put(tent, [(x, base_y) for x in range(cx + 4, cx + 15)], "wood-dark")
    tent = outline(tent)
    # pennant on a short pole at the apex
    pen = blank(32, 24)
    put(pen, [(cx + 1, 1), (cx + 2, 1), (cx + 1, 2)], "gold")
    pen = outline(pen)
    tent.alpha_composite(pen)
    put(tent, [(cx - 1, 0), (cx - 1, 1), (cx - 1, 2), (cx, 0), (cx, 1), (cx, 2)], "ink")
    # guy ropes to pegs (1px snow-shade lines, outside the outline pass)
    for i in range(0, 12):
        put(tent, [(cx - 8 - i, 10 + i)], "snow-shade") if 10 + i <= 21 else None
        put(tent, [(cx + 7 + i, 10 + i)], "snow-shade") if 10 + i <= 21 else None
    put(tent, [(cx - 20, 22), (cx + 19, 22)], "wood")
    put(tent, [(cx - 20, 23), (cx + 19, 23)], "ink")
    P["prop_tent"] = tent

    # Trees: tiered pines drawn bottom tier first so upper tiers overlap; droopy tips, shade
    # under each tier on the lit side, optional snow on the upper faces.
    def pine(w: int, h: int, tiers, trunk_h: int, snow: bool = False) -> Image.Image:
        im = blank(w, h)
        cx = w // 2
        for (y0, th, a, b) in reversed(tiers):
            for r in range(th):
                half = round(a + (b - a) * r / max(1, th - 1))
                for x in range(cx - half, cx + half):
                    put(im, [(x, y0 + r)], "grass" if x < cx else "grass-dark")
                if snow and r < th - 1:
                    put(im, [(cx - half, y0 + r)], "snow")
                    put(im, [(cx + half - 1, y0 + r)], "snow-shade")
            # droopy tips and notches on the bottom edge
            yb = y0 + th
            put(im, [(cx - b - 1, yb - 1), (cx - b, yb)], "snow" if snow else "grass")
            put(im, [(cx + b, yb - 1), (cx + b - 1, yb)], "snow-shade" if snow else "grass-dark")
            for nx in (cx - b // 2 - 1, cx + b // 2):
                if 0 <= nx < w:
                    im.putpixel((nx, yb - 1), (0, 0, 0, 0))
            # shade cast on the tier below, lit side
            for x in range(cx - b + 1, cx):
                if im.getpixel((x, yb))[3] and (x + yb) % 2 == 0:
                    put(im, [(x, yb)], "grass-dark")
        top = tiers[0][0]
        put(im, [(cx - 1, top - 1)], "snow" if snow else "grass")
        for y in range(h - trunk_h, h):
            put(im, [(cx - 1, y)], "wood")
            put(im, [(cx, y)], "wood-dark")
        return outline(im)

    P["prop_tree_0"] = pine(16, 32, [(2, 6, 0, 3), (6, 7, 1, 5), (11, 8, 2, 6), (17, 8, 3, 7)], 7)
    P["prop_tree_1"] = pine(16, 24, [(2, 5, 0, 3), (5, 6, 1, 5), (9, 8, 2, 7)], 6)
    P["prop_tree_2"] = pine(24, 40, [(2, 7, 0, 3), (7, 8, 1, 6), (13, 9, 2, 8), (20, 9, 3, 10), (26, 9, 4, 11)], 5, snow=True)

    # Rocks
    P["prop_rock_0"] = comp((16, 12), [(part("""
....rrrrr.....
..srrrrrrr3...
.ssrrrrrrr33..
.srrrrrrrr333.
srrrrrrrr3333.
rrrrrrrr333333
r333333333333.
"""), 1, 3)])
    P["prop_rock_1"] = comp((24, 16), [(part("""
.......SSSSS..........
.....WSSSSSSSs........
....SSSrrrSSssss......
...Ssrrrrrrrssr33.....
..srrrrrrrrrrr333.....
..srrrrrrrrrrrr333....
.srrrrrrrrrrrrr3333...
.rrrrrrrrrrrrr333333..
srrrrrrrrrrrr3333333..
rrrrrrrrrrr33333333333
r33333333333333333333.
"""), 1, 3)])

    # Crate (16x16): a kit box stamped with a check mark.
    cr = blank(16, 16)
    fill_rect(cr, 0, 2, 15, 15, "ink")
    fill_rect(cr, 1, 3, 14, 14, "wood")
    put(cr, [(x, 3) for x in range(1, 15)], "sky-dawn")
    put(cr, [(x, 14) for x in range(1, 15)], "wood-dark")
    put(cr, [(14, y) for y in range(4, 15)], "wood-dark")
    fill_rect(cr, 2, 4, 13, 13, "ink")
    fill_rect(cr, 3, 5, 12, 12, "wood")
    put(cr, [(x, 12) for x in range(3, 13)], "wood-dark")
    put(cr, [(4, 9), (5, 10), (6, 11), (7, 10), (8, 9), (9, 8), (10, 7), (11, 6), (5, 9), (6, 10), (7, 9), (8, 8), (9, 7), (10, 6)], "wood-dark")
    put(cr, [(2, 4), (13, 4), (2, 13), (13, 13)], "snow-shade")
    P["prop_crate"] = cr

    # Reticle (16x16, cyan = UI selection only): open, then locked.
    def reticle(inset: int, arm: int) -> Image.Image:
        """Four corner brackets; the lock frame pulls them in and lengthens the arms (centre stays clear)."""
        im = blank(16, 16)
        a, b = 1 + inset, 14 - inset
        for (cx, cy, dx, dy) in ((a, a, 1, 1), (b, a, -1, 1), (a, b, 1, -1), (b, b, -1, -1)):
            put(im, [(cx + dx * i, cy) for i in range(arm)], "cyan")
            put(im, [(cx, cy + dy * i) for i in range(arm)], "cyan")
        return outline(im)

    P["reticle_0"] = reticle(0, 4)
    P["reticle_1"] = reticle(1, 5)
    return P, meta


# --------------------------------------------------------------------------------------
# Tiles (8x8, seamless in both directions)
# --------------------------------------------------------------------------------------
def tile_frames() -> dict[str, Image.Image]:
    T = {}
    T["tile_grass"] = parse("""
gggggggg
gGgggggg
gGggGggg
ggggGggg
gggggggg
ggggggGg
gGggggGg
gGgggggg
""", 8, 8, "tile_grass")
    T["tile_dirt"] = parse("""
bbbbbbbb
bbwbbbbb
bbbbbbbb
bbbbbkbb
bbbbbbbb
bkbbbbbw
bbbbbbbb
bbbbwbbb
""", 8, 8, "tile_dirt")
    T["tile_rock"] = parse("""
rrrrrrrr
rrrrrr3r
rrrrr3rr
rrrrrrrr
rrrrrrrr
rr3rrrrr
r3rrrrrr
rrrrrrrr
""", 8, 8, "tile_rock")
    T["tile_snow"] = parse("""
SSSSSSSS
SSSSSSSS
SSSsSSSS
SSSSSSSS
SSSSSSSS
SSSSSSSs
SSSSSSSS
SsSSSSSS
""", 8, 8, "tile_snow")
    T["tile_checker"] = parse("\n".join(["xxxxxxxx"] * 8), 8, 8, "tile_checker")
    return T


# --------------------------------------------------------------------------------------
# Demo faults (our own level only). Each has a *_fixed twin on the same canvas and anchor,
# so logging a bug swaps one frame for the other in place.
# --------------------------------------------------------------------------------------
SAVE_KEY = "E"  # the keyboard key the fixed save sign shows; match the builder's Inspect key


def sign_on_post(w: int, h: int, board: Image.Image, bx: int, posts=(None,)) -> Image.Image:
    im = blank(w, h)
    for px_ in posts:
        x = (bx + board.width // 2 - 2) if px_ is None else px_
        paste(im, post(h - board.height + 1), x, board.height - 1)
    paste(im, board, bx, 0)
    return im


def fault_frames() -> tuple[dict[str, Image.Image], dict]:
    F: dict[str, Image.Image] = {}
    anchors: dict = {}

    # 1 Clipper: the beetle half sunk through the ground, in a void with a missing-texture rim.
    clip = blank(24, 20)
    hole = part("""
..mmmmmmmmmmmmmmmmmm..
.mkkkkkkkkkkkkkkkkkkm.
mkkkkkkkkkkkkkkkkkkkkm
.mkkkkkkkkkkkkkkkkkkm.
...mmkkkkkkkkkkkkmm...
.......mmmmmmmm.......
""")
    hole_o = blank(24, 20)
    paste(hole_o, hole, 1, 12)
    hole_o = outline(hole_o)
    clip.alpha_composite(hole_o)
    dome = part(rimmed("""
......mmmmm...
....mmWxxxxmm.
...mWmxxxxxxxm
..mmmmxxxxxxxm
.mWWmWWxxxxxxm
.mkWmkWxxxxxxm
.mmmmmmmmmmmmm
"""))
    beetle = blank(24, 20)
    paste(beetle, dome, 5, 5)
    paste(beetle, part("k..\n.k.\n..k"), 6, 2)
    beetle = outline(beetle)
    a = np.array(beetle)
    a[12:, :] = 0  # everything below the ground line is inside the hole
    clip.alpha_composite(Image.fromarray(a, "RGBA").copy())
    put(clip, [(3, 11), (4, 10), (20, 11), (21, 10)], "ink")  # legs flailing at the surface
    F["fault_clip_ground"] = clip
    fixed = blank(24, 20)
    paste(fixed, outline(part("""
.......g.........
..g...gG...g.....
..gG.ggG..gG..s..
.rgGgsrrs.gGgrrs.
""")), 3, 8)
    F["fault_clip_ground_fixed"] = fixed
    anchors["fault_clip_ground"] = anchors["fault_clip_ground_fixed"] = {"x": 12, "y": 12, "note": "row 12 = ground surface; the hole draws over the terrain below it"}

    # 2 Wrong Glyph: a save sign showing another platform's round face button.
    def save_sign(right: bool) -> Image.Image:
        board = wood_board(30, 16, "deep")
        draw_text(board, "SAVE", 4, 5, "paper")
        if right:  # a keycap, as the web build is played on a keyboard
            cap = part("""
kkkkkkkk
kSSSSSSk
kSSSSSsk
kSSSSSsk
kSSSSSsk
kSSSSSsk
ksssssrk
kkkkkkkk
""")
            draw_text(cap, SAVE_KEY, 2, 1, "ink")
            paste(board, cap, 20, 4)
        else:  # the wrong platform's glyph: a round face button with a triangle
            btn = part("""
..kkkk..
.krrrrk.
krrrWrrk
krrWrWrk
krWWWWWk
krrrrrrk
.k3333k.
..kkkk..
""")
            paste(board, btn, 20, 4)
        return sign_on_post(32, 28, board, 1)

    F["fault_wrong_glyph_sign"] = save_sign(False)
    F["fault_wrong_glyph_sign_fixed"] = save_sign(True)

    # 3 Overflow: a German trail sign whose text runs out of its box.
    def trail_sign(fit: bool) -> Image.Image:
        board = wood_board(30, 19, "gold")
        im = blank(48, 28)
        paste(im, post(10), 14, 18)
        paste(im, board, 1, 0)
        if fit:
            draw_text(im, "ZUM", 16 - text_width("ZUM") // 2, 4, "ink")
            draw_text(im, "GIPFEL", 16 - text_width("GIPFEL") // 2, 10, "ink")
        else:
            txt = blank(48, 28)
            draw_text(txt, "ZUM GIPFEL", 5, 7, "ink")
            a = np.array(txt)
            spill = a[:, :, 3] > 0
            spill[:, :29] = False
            # letters past the board keep a 1px paper edge so the spill reads on any background
            halo = np.zeros_like(spill)
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    halo |= np.roll(np.roll(spill, dy, 0), dx, 1)
            halo &= ~spill
            halo[:, :29] = False
            h = np.zeros_like(a)
            h[halo] = rgba("paper")
            im.alpha_composite(Image.fromarray(h, "RGBA").copy())
            im.alpha_composite(txt)
        return im

    F["fault_overflow_sign"] = trail_sign(False)
    F["fault_overflow_sign_fixed"] = trail_sign(True)

    # 5 Missing Step: a stone staircase, one step gone (the hole shows missing texture).
    def stairs(missing: int | None) -> Image.Image:
        im = blank(40, 24)
        for i in range(5):
            x0, top = 8 * i, 20 - 4 * i
            step = blank(40, 24)
            if i == missing:
                fill_rect(step, x0, top, x0 + 7, 23, "ink")
                for y in range(top, 24):
                    for x in range(x0, x0 + 8):
                        if (((x - x0) // 2) + ((y - top) // 2)) % 2 == 0:
                            put(step, [(x, y)], "magenta")
            else:
                fill_rect(step, x0, top, x0 + 7, 23, "rock")
                put(step, [(x, top) for x in range(x0, x0 + 8)], "snow")
                put(step, [(x, top + 1) for x in range(x0, x0 + 8)], "snow-shade")
                put(step, [(x0 + 7, y) for y in range(top + 2, 24)], "ridge-far")
                put(step, [(x0 + 2, top + 3), (x0 + 5, top + 5)], "ridge-far")
            im.alpha_composite(step)
        # mortar lines between steps
        for i in range(1, 5):
            put(im, [(8 * i - 1, y) for y in range(20 - 4 * i + 2, 24)], "ridge-far") if i - 1 != missing and i != missing else None
        return outline(im)

    F["fault_stairs_missing"] = stairs(2)
    F["fault_stairs_missing_fixed"] = stairs(None)
    anchors["fault_stairs_missing"] = anchors["fault_stairs_missing_fixed"] = {
        "x": 0, "y": 24, "note": "bottom-left sits at the foot of a 20px ledge; steps are 8 wide x 4 high, step index 2 is the missing one",
        "steps": [{"x": 8 * i, "top": 20 - 4 * i, "w": 8} for i in range(5)], "missing": 2}

    # 6 Tiny Text: a notice whose text is far too small; the fix makes it readable.
    def notice(readable: bool) -> Image.Image:
        board = wood_board(30, 18, "paper")
        if readable:
            draw_text(board, "THIS", 15 - text_width("THIS") // 2, 3, "ink")
            draw_text(board, "WAY >", 15 - text_width("WAY >") // 2, 9, "ink")
        else:
            for row, xs in ((6, range(9, 21)), (8, range(10, 20)), (10, range(9, 19))):
                put(board, [(x, row) for x in xs if x % 2 == 0 or x % 5 == 1], "ridge-far")
        return sign_on_post(32, 28, board, 1)

    F["fault_tiny_text_sign"] = notice(False)
    F["fault_tiny_text_sign_fixed"] = notice(True)

    # 8 Last-minute Regression: the summit sign reads SIX PAEKS, with a spell-check squiggle.
    def summit(text: str, squiggle: bool) -> Image.Image:
        board = wood_board(46, 14, "wood-dark")
        x0 = 23 - text_width(text) // 2
        draw_text(board, text, x0, 4, "paper")
        if squiggle:
            sx = x0 + 4 * 4
            put(board, [(sx + i, 10 + (i % 2)) for i in range(text_width("PAEKS"))], "magenta")
        return sign_on_post(48, 28, board, 1, posts=(6, 38))

    F["fault_typo_flag_sign"] = summit("SIX PAEKS", True)
    F["fault_typo_flag_sign_fixed"] = summit("SIX PEAKS", False)
    return F, anchors


# --------------------------------------------------------------------------------------
# Atlas: shelf-pack every frame into sprites.png (2px gutters) and write sprites.json
# --------------------------------------------------------------------------------------
ANIMS = {
    "tester_idle": ["tester_idle_0", "tester_idle_1"],
    "tester_run": [f"tester_run_{i}" for i in range(6)],
    "tester_jump": ["tester_jump_0", "tester_jump_1"],
    "tester_inspect": ["tester_inspect_0", "tester_inspect_1"],
    **{f"bug_{s}": [f"bug_{s}_0", f"bug_{s}_1"] for s in
       ("functional", "compliance", "localisation", "reporting", "testcase", "usability", "performance", "rc")},
    "prop_flag": ["prop_flag_0", "prop_flag_1"],
    "reticle": ["reticle_0", "reticle_1"],
}
ANIM_FPS = {"tester_idle": 2, "tester_run": 12, "tester_jump": 0, "tester_inspect": 3, "prop_flag": 4, "reticle": 6,
            **{f"bug_{s}": 4 for s in ("functional", "compliance", "localisation", "reporting", "testcase", "usability", "performance", "rc")}}
BUG_SERVICES = {
    "functional": ("Functional QA", "Clipper"),
    "compliance": ("Compliance QA", "Wrong Glyph"),
    "localisation": ("Functional Localisation QA", "Overflow"),
    "reporting": ("Bug Reporting & Environment Management", "Ghost"),
    "testcase": ("Test Case Management", "Missing Step"),
    "usability": ("Usability Testing", "Tiny Text"),
    "performance": ("Performance Testing", "Stutter"),
    "rc": ("Release Candidate Oversight", "Last-minute Regression"),
}
POWER_PILLARS = {
    "power_excellent": "Technically Excellent", "power_priced": "Competitively Priced",
    "power_english": "Native English Speaking", "power_timezone": "Western Europe Time Zone",
    "power_culture": "Culturally Aligned", "power_team": "Consistent Dedicated Teams",
}


def all_sprites():
    frames: dict[str, Image.Image] = {}
    frames.update(tester_frames())
    frames.update(bug_frames())
    frames.update(power_frames())
    props, meta = prop_frames()
    frames.update(props)
    frames.update(tile_frames())
    faults, fanchors = fault_frames()
    frames.update(faults)
    return frames, meta, fanchors


def feet_row(im: Image.Image) -> int:
    a = np.array(im)[:, :, 3]
    rows = np.where(a.any(axis=1))[0]
    return int(rows.max()) + 1 if len(rows) else im.height


def pack(frames: dict[str, Image.Image], width: int = 512, pad: int = 2):
    order = sorted(frames, key=lambda n: (-frames[n].height, -frames[n].width, n))
    x = y = pad
    shelf_h = 0
    rects = {}
    for n in order:
        w, h = frames[n].size
        if x + w + pad > width:
            x = pad
            y += shelf_h + pad
            shelf_h = 0
        rects[n] = {"x": x, "y": y, "w": w, "h": h}
        x += w + pad
        shelf_h = max(shelf_h, h)
    height = y + shelf_h + pad
    atlas = blank(width, height)
    for n, r in rects.items():
        paste(atlas, frames[n], r["x"], r["y"])
    return atlas, dict(sorted(rects.items(), key=lambda kv: list(frames).index(kv[0])))


def build_sprites() -> tuple[dict[str, Image.Image], dict]:
    frames, meta, fanchors = all_sprites()
    for n, im in frames.items():
        assert_palette(im, n)
    atlas, rects = pack(frames)
    atlas.save(OUT / "sprites.png", optimize=True)
    anchors = {}
    for n, im in frames.items():
        if n.startswith("tile_"):
            continue
        anim = next((a for a, fl in ANIMS.items() if n in fl), None)
        ref = frames[ANIMS[anim][0]] if anim else im
        anchors[n] = {"x": im.width // 2, "y": feet_row(ref)}
    anchors.update(fanchors)
    anchors["tester_jump_0"] = anchors["tester_jump_1"] = {"x": 8, "y": 24}
    data = {
        "image": "sprites.png",
        "size": {"w": atlas.width, "h": atlas.height},
        "frames": rects,
        "anims": ANIMS,
        "animFps": ANIM_FPS,
        "anchors": anchors,
        "anchorsNote": "anchor = the pixel inside the frame that sits on the ground point (x centre, y = first row below the feet). Faults with a hole or a ledge give their own.",
        "billboardWindow": meta["billboardWindow"],
        "billboardLegs": meta["billboardLegs"],
        "signboardWindow": meta["signboardWindow"],
        "signpostMount": meta["signpostMount"],
        "bugs": {f"bug_{k}": {"service": v[0], "name": v[1]} for k, v in BUG_SERVICES.items()},
        "powerups": POWER_PILLARS,
        "faultSwap": {n: n + "_fixed" for n in frames if n.startswith("fault_") and not n.endswith("_fixed")},
        "facing": "characters and crawling bugs face left except the tester (faces right); flip horizontally for the other way",
        "saveKey": SAVE_KEY,
    }
    (OUT / "sprites.json").write_text(json.dumps(data, indent=1) + "\n")
    return frames, data


# --------------------------------------------------------------------------------------
# Level heightmap: derived from the Six Peaks logo silhouette
# --------------------------------------------------------------------------------------
LEVEL_W, LEVEL_H = 3840, 216          # 10 screens of 384x216
BASE_Y = 192                           # base camp ground line
TOP_Y = 64                             # highest peak (logo peak 3)
BASE_CAMP_W = 360
MAX_SLOPE = 0.62                       # walkable facets never exceed this (px down per px across)


def logo_polyline() -> list[tuple[float, float]]:
    """Top edge of the bright mountain shapes in logo-white.webp, simplified (Douglas-Peucker)."""
    im = Image.open(WEB / "brand" / "logo-white.webp").convert("RGBA")
    al = np.array(im)[:410, :, 3].astype(float) / 255.0  # mountain band sits above the wordmark
    pts = []
    for x in range(al.shape[1]):
        col = al[:, x]
        idx = np.where(col >= 0.5)[0]
        if not len(idx):
            continue
        y = idx[0]
        yy = y - 1 + (0.5 - col[y - 1]) / (col[y] - col[y - 1]) if y > 0 and col[y] != col[y - 1] else float(y)
        pts.append((float(x), yy))
    pts = np.array(pts)

    def dp(p, eps):
        if len(p) < 3:
            return p
        a, b = p[0], p[-1]
        ab = b - a
        d = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / np.hypot(*ab)
        i = int(np.argmax(d))
        if d[i] > eps:
            return np.vstack([dp(p[: i + 1], eps)[:-1], dp(p[i:], eps)])
        return np.vstack([a, b])

    v = dp(pts, 2.0)
    return [(float(x), float(y)) for x, y in v]


def build_level() -> dict:
    verts = logo_polyline()
    base = max(y for _, y in verts)
    R = [base - y for _, y in verts]  # relief above the logo baseline
    n = len(verts)
    peaks = [i for i in range(1, n - 1) if R[i] > R[i - 1] and R[i] > R[i + 1]]
    assert len(peaks) == 6, f"expected six peaks in the logo, found {len(peaks)}"
    # cols = the higher neighbouring vertex of each peak (the saddle you climb from)
    prom = {i: R[i] - max(R[i - 1], R[i + 1]) for i in peaks}
    pmin, pmax = min(prom.values()), max(prom.values())
    f_min, f_max = 34.0, 56.0          # every peak stands at least 34px above its saddle
    top_i = max(peaks, key=lambda i: R[i])
    alpha = ((BASE_Y - TOP_Y) - f_max) / max(R[top_i - 1], R[top_i + 1])
    rel = []
    for i in range(n):
        if i in peaks:
            col = max(R[i - 1], R[i + 1])
            rel.append(alpha * col + f_min + (prom[i] - pmin) / (pmax - pmin) * (f_max - f_min))
        else:
            rel.append(alpha * R[i])
    rel[0] = rel[-1] = 0.0
    # Horizontal layout: each logo facet keeps its relative steepness, mapped into a climbable
    # range; saddles and shoulders become flats (room for billboards and signposts).
    segs = []  # (kind, dx, rise[, tag]); kind: 'slope' | 'flat' | 'step'
    segs.append(("flat", BASE_CAMP_W, 0.0))
    summit_i = peaks[-1]
    stairs_peak = peaks[3]  # the climb to peak 4 carries the 20px staircase ledge
    for i in range(n - 1):
        (x0, y0), (x1, y1) = verts[i], verts[i + 1]
        s_logo = abs(y1 - y0) / max(1.0, x1 - x0)
        slope = min(MAX_SLOPE, max(0.16, 0.06 + 0.42 * s_logo))
        rise = rel[i + 1] - rel[i]
        j = i + 1
        if j == stairs_peak:
            # a flat foot for the 40px stairs prop, a 20px cliff, then the pitch to the top
            a = (rise - 20) * 0.35
            segs.append(("slope", abs(a) / slope, a))
            segs.append(("flat", 44, 0.0, "stairs"))
            segs.append(("step", 0, 20.0))
            segs.append(("flat", 6, 0.0, "ledge-top"))
            segs.append(("slope", abs(rise - 20 - a) / slope, rise - 20 - a))
        elif rise > 30 and j in peaks:
            # climbs to a peak: walk, a short landing, a rock ledge to jump, the last pitch
            step = 12 if rise < 45 else 16
            a = (rise - step) * 0.6
            segs.append(("slope", abs(a) / slope, a))
            segs.append(("flat", 10, 0.0))
            segs.append(("step", 0, float(step)))
            segs.append(("slope", abs(rise - step - a) / slope, rise - step - a))
        else:
            segs.append(("slope", abs(rise) / slope, rise))
        if j in peaks:
            segs.append(("flat", 80 if j == summit_i else 12, 0.0, "summit" if j == summit_i else "top"))
        elif 0 < j < n - 1 and R[j] < R[j - 1] and R[j] < R[j + 1]:
            segs.append(("flat", -1, 0.0, "meadow"))   # saddle meadow, width solved below
        elif j == 2:
            segs.append(("flat", -1, 0.0, "meadow"))   # the shoulder above base camp
        elif j == n - 3:
            segs.append(("flat", 48, 0.0))             # far shoulder, past the summit
    segs = [sg if len(sg) == 4 else (*sg, "") for sg in segs]
    tail = 40
    fixed = sum(sg[1] for sg in segs if sg[1] >= 0)
    flex = [k for k, sg in enumerate(segs) if sg[1] < 0]
    room = LEVEL_W - fixed - tail
    for k in flex:
        segs[k] = ("flat", room / len(flex), 0.0, segs[k][3])
    segs.append(("flat", tail, 0.0, "end"))
    # walk the segments into a polyline, then rasterise one ground y per column
    pts = [(0.0, float(BASE_Y))]
    marks = []
    for kind, dx, rise, tag in segs:
        x, y = pts[-1]
        if kind == "step":
            pts.append((x, y - rise))
        else:
            pts.append((x + dx, y - rise))
        marks.append((kind, tag, pts[-2], pts[-1]))
    sx_ = (LEVEL_W - 1) / max(p[0] for p in pts)
    tagged = {}
    for kind, tag, a, b in marks:
        if tag:
            tagged.setdefault(tag, []).append((int(round(a[0] * sx_)), int(round(b[0] * sx_)), int(round(a[1]))))
    xs = np.array([p[0] for p in pts]) * sx_
    ys = np.array([p[1] for p in pts])
    ground = []
    for X in range(LEVEL_W):
        k = int(np.searchsorted(xs, X, side="right")) - 1
        k = max(0, min(k, len(xs) - 2))
        # at a vertical step the later point wins (the ledge top)
        while k + 1 < len(xs) - 1 and xs[k + 1] <= X:
            k += 1
        x0, x1 = xs[k], xs[k + 1]
        t = 0.0 if x1 == x0 else (X - x0) / (x1 - x0)
        ground.append(int(round(ys[k] + (ys[k + 1] - ys[k]) * t)))
    ground = [min(LEVEL_H - 8, max(8, g)) for g in ground]
    # saddle meadows sag into shallow bowls (an echo of the logo's V notches), flat at the bottom
    for (m0, m1, my) in tagged.get("meadow", []):
        wdt = m1 - m0
        for X in range(m0, m1 + 1):
            t = (X - m0) / wdt
            if t < 0.3:
                u = t / 0.3
            elif t > 0.7:
                u = (1 - t) / 0.3
            else:
                u = 1.0
            u = u * u * (3 - 2 * u)  # smoothstep
            ground[X] = my + int(round(6 * u))
    tops = [((x0 + x1) // 2, y) for (x0, x1, y) in tagged.get("top", []) + tagged.get("summit", [])]
    tops.sort()
    assert len(tops) == 6, tops
    flats, ledges = [], []
    run0 = 0
    for X in range(1, LEVEL_W + 1):
        if X == LEVEL_W or ground[X] != ground[run0]:
            if X - run0 >= 24:
                flats.append({"x0": run0, "x1": X - 1, "y": ground[run0], "w": X - run0})
            run0 = X
    for X in range(1, LEVEL_W):
        d = ground[X - 1] - ground[X]
        if abs(d) > 3:
            ledges.append({"x": X, "from": ground[X - 1], "to": ground[X], "up": d > 0, "h": abs(d)})
    return {
        "verts": verts, "rel": rel, "peaks_logo": peaks, "alpha": alpha, "ground": ground,
        "tops": tops, "flats": flats, "ledges": ledges, "tagged": tagged,
    }


BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0


def surface_zones(L: dict) -> str:
    """One char per column: 's' snow, 'g' grass, 'r' rock. Every peak wears a snow cap,
    the two high saddles are snowfields, low meadows and base camp are grass, flanks are rock."""
    g = L["ground"]
    W = len(g)
    tops = L["tops"]
    hi = min(t[1] for t in tops)
    out = []
    for x in range(W):
        y = g[x]
        px_, py_ = min(tops, key=lambda t: abs(t[0] - x))
        cap = 34 if py_ == hi else 28
        slope = abs(g[min(W - 1, x + 8)] - g[max(0, x - 8)]) / 16
        if (y - py_ <= cap and abs(px_ - x) < 220) or y < 130:
            out.append("s")
        elif y > 166 or (slope < 0.2 and y >= 130):
            out.append("g")
        else:
            out.append("r")
    s = list(out)
    run = 0
    for x in range(1, W + 1):  # no zone run shorter than 6px
        if x == W or s[x] != s[run]:
            if x - run < 6 and run > 0:
                for k in range(run, x):
                    s[k] = s[run - 1]
            run = x
    return "".join(s)


def _h(x: int) -> int:
    """Small deterministic hash for ragged edges and sparse details."""
    x = (x * 2654435761) & 0xFFFFFFFF
    return (x >> 13) ^ (x >> 7)


def render_terrain(L: dict, zones: str, x0: int = 0, x1: int | None = None) -> Image.Image:
    """The ground drawn from the kit: one continuous rock body (lit facets in rock, shaded facets
    a step darker, both dithering down to the ridge blues with depth), a surface band that follows
    the ground line (snow caps thickest at the peaks, grass over a dirt seam, rock edges), lit and
    shaded ledge faces, grass blades and the odd flower at base camp."""
    g = L["ground"]
    W = len(g)
    x1 = W if x1 is None else x1
    tops = L["tops"]
    hi = min(t[1] for t in tops)
    rock = np.array(tile_frames()["tile_rock"])[:, :, :3]
    grass = np.array(tile_frames()["tile_grass"])[:, :, :3]
    C = {k: np.array(RGB[k], np.uint8) for k in RGB}
    dark_of = {RGB["rock"]: C["ridge-mid"], RGB["ridge-far"]: C["ridge-near"], RGB["snow-shade"]: C["rock"]}
    mid_of = {RGB["rock"]: C["ridge-far"], RGB["ridge-far"]: C["ridge-mid"], RGB["snow-shade"]: C["rock"]}
    im = np.zeros((LEVEL_H, x1 - x0, 4), np.uint8)
    # light from the upper left: faces that fall away to the right sit in shade. Classify with a
    # wide window, then drop runs shorter than 10px so flanks shade as one mass.
    cls = []
    for X in range(W):
        sl = g[max(0, X - 6)] - g[min(W - 1, X + 6)]
        cls.append(-1 if sl < -1 else (1 if sl > 1 else 0))
    run = 0
    for X in range(1, W + 1):
        if X == W or cls[X] != cls[run]:
            if X - run < 10 and run > 0:
                for k in range(run, X):
                    cls[k] = cls[run - 1]
            run = X
    for X in range(x0, x1):
        y0 = g[X]
        z = zones[X]
        shade = cls[X] < 0
        px_, py_ = min(tops, key=lambda t: abs(t[0] - X))
        cap = 34 if py_ == hi else 28
        if z == "s":
            if y0 < 130 and abs(y0 - py_) > cap:
                sd = 5
            else:
                sd = int(max(3, min(12, 3 + (cap - (y0 - py_)) * 0.33)))
            sd += _h(X) % 2
        col = np.zeros((LEVEL_H, 4), np.uint8)
        wave = int(round(3 * math.sin(X / 37.0) + 2 * math.sin(X / 13.0 + 1.7)))
        for Y in range(y0, LEVEL_H):
            d = Y - y0
            b = BAYER4[Y % 4, X % 4]
            c = rock[Y % 8, X % 8]
            # light classes: lit facets in rock, flats a step down, shaded facets two steps down;
            # the split slants down-right inside the body, like a lit ridge edge
            k = cls[max(0, X - int(d * 0.7))] if d > 3 else cls[X]
            shade = k < 0
            if k < 0:
                c = dark_of.get(tuple(c), c)
            elif k == 0 and d > 1:
                c = mid_of.get(tuple(c), c)
            dd = d + wave
            lim = (10, 30, 52) if k > 0 else (6, 26, 48)
            if dd > lim[0] and (dd - lim[0]) / 12 > b:
                c = C["ridge-far"] if k > 0 else C["ridge-mid"]
            if dd > lim[1] and (dd - lim[1]) / 14 > b:
                c = C["ridge-mid"] if k > 0 else C["ridge-near"]
            if dd > lim[2] and (dd - lim[2]) / 16 > b:
                c = C["ridge-near"] if k > 0 else C["deep"]
            if z == "s" and d < sd:
                if d == 0:
                    c = C["white"] if not shade else C["snow"]
                elif d >= sd - 2 and b < (0.5 if d == sd - 2 else 0.25):
                    c = C["snow-shade"] if not shade else C["rock"]
                elif d < sd - 2 or b < 0.75:
                    c = C["snow"] if not shade else C["snow-shade"]
            elif z == "g" and d <= 5:
                if d == 0:
                    c = C["grass"]
                elif d == 1:
                    c = grass[Y % 8, X % 8]
                elif d == 2:
                    c = C["grass-dark"]
                elif d == 3:
                    c = C["grass-dark"] if b < 0.6 else C["wood-dark"]
                elif d == 4:
                    c = C["wood-dark"]
                elif b < 0.5:
                    c = C["wood-dark"]
            elif z == "r" and d == 0:
                c = C["snow-shade"] if not shade else C["rock"]
            col[Y] = (*c, 255)
        # ledge faces
        if X > 0 and g[X - 1] - y0 > 3:      # step up: a lit cliff face
            for Y in range(y0 + 2, g[X - 1] + 1):
                col[Y] = (*C["snow-shade"], 255)
        if X < W - 1 and g[X + 1] - y0 > 3:  # step down: a shaded cliff face
            for Y in range(y0 + 2, g[X + 1] + 1):
                col[Y] = (*C["ridge-mid"], 255)
        im[:, X - x0] = col
    out = Image.fromarray(im, "RGBA").copy()
    px = out.load()
    for X in range(x0, x1):
        y0 = g[X]
        if zones[X] == "g" and y0 > 1:
            hv = _h(X)
            if hv % 4 == 0:
                px[X - x0, y0 - 1] = rgba("grass")
                if hv % 12 == 0:
                    px[X - x0, y0 - 2] = rgba("grass")
            elif hv % 4 == 1:
                px[X - x0, y0 - 1] = rgba("grass-dark")
            if y0 >= BASE_Y - 1 and hv % 37 == 5:  # a few flowers at base camp
                px[X - x0, y0 - 2] = rgba("gold" if hv % 2 else "paper")
                px[X - x0, y0 - 1] = rgba("grass-dark")
        if zones[X] == "s" and _h(X) % 23 == 0 and y0 + 2 < LEVEL_H:
            px[X - x0, y0 + 1] = rgba("white")
    # a few embedded stones under the surface band (lit top-left, shade bottom-right)
    for X in range(x0 + 2, x1 - 3):
        hv = _h(X * 31 + 5)
        if hv % 41 == 0 and all(abs(g[X + i] - g[X]) <= 1 for i in range(-2, 4)):
            sy = g[X] + 7 + hv % 9
            if sy + 2 < LEVEL_H:
                for (dx, dy, tok) in ((0, 0, "rock"), (1, 0, "rock"), (2, 0, "ridge-far"), (0, 1, "ridge-far"), (1, 1, "ridge-far"),
                                      (2, 1, "ridge-mid"), (1, 2, "ridge-mid"), (2, 2, "ridge-near"), (3, 1, "ridge-near")):
                    px[X - x0 + dx, sy + dy] = rgba(tok)
    return out


# --------------------------------------------------------------------------------------
# Sky and parallax ridges (ordered dithering only, palette blues, horizontally tileable)
# --------------------------------------------------------------------------------------
def dither_mix(a: str, b: str, t: float, x: int, y: int) -> tuple[int, int, int]:
    """Ordered (Bayer 4x4) mix: returns colour b where the threshold says so."""
    return RGB[b] if t > BAYER4[y % 4, x % 4] else RGB[a]


def build_sky() -> Image.Image:
    """Night at the top, a blue-hour horizon with a faint dawn (sparse sky-dawn) behind the ridges."""
    W, H = 384, 216
    im = Image.new("RGBA", (W, H))
    px = im.load()
    bands = [(0, 22, "night", "night"), (22, 50, "night", "deep"), (50, 72, "deep", "ridge-near"),
             (72, 92, "ridge-near", "ridge-mid"), (92, 114, "ridge-mid", "ridge-far"), (114, 217, "ridge-far", "ridge-far")]
    for y in range(H):
        for (y0, y1, a, b) in bands:
            if y0 <= y < y1:
                t = (y - y0) / (y1 - y0)
                break
        for x in range(W):
            c = dither_mix(a, b, t, x, y)
            if y >= 128:  # faint dawn: ordered dither, densest low on the horizon behind the ridges
                tt = min(0.5, (y - 128) / 88 * 0.5)
                if tt > BAYER4[(y + 1) % 4, (x + 2) % 4]:
                    c = RGB["sky-dawn"]
            px[x, y] = c + (255,)
    for i in range(70):  # stars: deterministic, sparse, dimmer toward the horizon
        h = _h(i * 7919 + 13)
        x, y = h % W, (h >> 9) % 90
        px[x, y] = rgba("white" if (h >> 3) % 5 == 0 else ("snow-shade" if y < 60 else "rock"))
        if (h >> 5) % 13 == 0 and 2 < x < W - 2 and 2 < y < 80:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                px[x + dx, y + dy] = rgba("rock")
            px[x, y] = rgba("white")
    return im


def ridge_profile(W: int, base: float, terms) -> list[int]:
    """Periodic ridged profile (sharp peaks): sum of a*(1-|sin|) terms with integer cycles."""
    ys = []
    for x in range(W):
        v = base
        for amp, k, ph in terms:
            v -= amp * (1 - abs(math.sin(math.pi * k * x / W + ph)))
        ys.append(int(round(v)))
    return ys


def build_ridges(W: int = 768, H: int = 216):
    """Two horizontally tileable ranges (period W). Far: ridge-mid silhouettes, lit faces and faint
    snow on the highest summits. Mid: darker, closer, a fringe of pine silhouettes on the crest."""
    far = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fp = far.load()
    fy = ridge_profile(W, 140, [(44, 3, 1.4), (18, 7, 1.3), (7, 15, 2.2), (3, 31, 0.7)])
    top = min(fy)
    for x in range(W):
        y0 = fy[x]
        lit = fy[(x - 2) % W] > fy[(x + 2) % W]  # rising to the right: faces the light
        for y in range(y0, H):
            d = y - y0
            c = RGB["ridge-mid"]
            if lit and d < 10:
                c = dither_mix("ridge-far", "ridge-mid", d / 10, x, y)
            if y0 - top < 18 and d < 3 + (18 - (y0 - top)) // 3:
                c = RGB["snow-shade"] if lit else RGB["rock"]
                if d >= 2 and BAYER4[y % 4, x % 4] < 0.5:
                    c = RGB["ridge-far"] if lit else RGB["ridge-mid"]
            if d > 22:
                c = dither_mix("ridge-mid", "ridge-near", min(1, (d - 22) / 30), x, y)
            fp[x, y] = c + (255,)
    mid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mp = mid.load()
    my = ridge_profile(W, 174, [(36, 2, 1.1), (16, 5, 0.2), (6, 11, 2.0), (2, 23, 0.9)])
    for x in range(W):
        y0 = my[x]
        lit = my[(x - 2) % W] > my[(x + 2) % W]
        for y in range(y0, H):
            d = y - y0
            c = RGB["ridge-near"]
            if lit and d < 6:
                c = dither_mix("ridge-mid", "ridge-near", d / 6, x, y)
            if d > 14:
                c = dither_mix("ridge-near", "deep", min(1, (d - 14) / 20), x, y)
            mp[x, y] = c + (255,)
    for i in range(46):  # pines rooted on the crest
        h = _h(i * 104729 + 7)
        x = (i * W // 46 + h % 11) % W
        th = 4 + h % 5
        y0 = my[x]
        for r in range(th):
            half = (r * 3) // th
            for dx in range(-half, half + 1):
                yy = y0 - th + r + 1
                if 0 <= yy < H:
                    mp[(x + dx) % W, yy] = rgba("deep")
    return far, mid


# --------------------------------------------------------------------------------------
# Real art in pixel frames: billboards, partner signs, the title logo
# --------------------------------------------------------------------------------------
def released_slugs() -> list[str]:
    games = json.loads((ROOT / "research" / "games.json").read_text())
    return [g["slug"] for g in games if g.get("status") == "released"]


def build_billboard(slug: str) -> Image.Image:
    """The game's real key art, area-averaged to 72x30 with a mild colour lift (so it holds up in
    a night scene), then an adaptive 32-colour median cut with no dithering."""
    from PIL import ImageEnhance
    im = Image.open(WEB / "games" / slug / "key.webp").convert("RGB")
    s = im.resize((72, 30), Image.BOX)
    s = ImageEnhance.Color(s).enhance(1.25)
    s = ImageEnhance.Contrast(s).enhance(1.12)
    q = s.quantize(colors=32, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return q.convert("RGBA")


# per-logo fit box, threshold, ink mask and smallest kept speck, chosen by eye for legibility at 1x.
# mask "max": alpha x brightest channel of the supplied white logo; "white": only near-white pixels
# (for logos whose white file keeps a colour icon). min_part drops illegible sub-line remnants.
SIGN_PARAMS = {
    "auroch-digital": (46, 16, 0.5, "max", 1), "balor-games": (46, 16, 0.5, "max", 3),
    "bossa-games": (46, 16, 0.5, "max", 1), "chuhai-labs": (46, 18, 0.5, "max", 1),
    "firestoke": (46, 16, 0.45, "max", 1), "hardball": (46, 16, 0.5, "max", 3),
    "humble-games": (46, 18, 0.65, "max", 1), "impossible-home": (46, 18, 0.4, "white", 1),
    "microids": (46, 16, 0.5, "max", 6), "playtonic-friends": (46, 16, 0.45, "max", 1),
    "powell-group": (46, 16, 0.5, "max", 6), "silver-lining": (46, 16, 0.45, "max", 1),
    "supercell": (46, 18, 0.65, "max", 1), "thunderful": (46, 18, 0.4, "max", 1),
    "torpor-games": (46, 16, 0.45, "max", 1),
}


def partner_keys() -> list[str]:
    return sorted({f.name.replace("-colour", "").replace(".webp", "") for f in (WEB / "partners").glob("*.webp")})


def onebit_logo(mask: np.ndarray, W: int, H: int, thr: float, min_part: int = 1) -> np.ndarray:
    ys, xs = np.where(mask > 0.2)
    m = mask[ys.min(): ys.max() + 1, xs.min(): xs.max() + 1]
    h, w = m.shape
    s = min(W / w, H / h)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    big = Image.fromarray((m * 255).astype(np.uint8)).resize((nw * 4, nh * 4), Image.BOX)
    a = (np.array(big) / 255.0).reshape(nh, 4, nw, 4).mean(axis=(1, 3))
    b = a > thr
    # drop specks (illegible remnants of tiny sub-lines): 8-connected parts below min_part pixels,
    # and always lone pixels
    out = b.copy()
    seen = np.zeros_like(b)
    for y in range(nh):
        for x in range(nw):
            if b[y, x] and not seen[y, x]:
                stack, comp = [(y, x)], []
                seen[y, x] = True
                while stack:
                    cy, cx = stack.pop()
                    comp.append((cy, cx))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            yy, xx = cy + dy, cx + dx
                            if 0 <= yy < nh and 0 <= xx < nw and b[yy, xx] and not seen[yy, xx]:
                                seen[yy, xx] = True
                                stack.append((yy, xx))
                if len(comp) < max(2, min_part):
                    for cy, cx in comp:
                        out[cy, cx] = False
    return out


def build_sign(key: str) -> Image.Image:
    im = Image.open(WEB / "partners" / f"{key}.webp").convert("RGBA")
    a = np.array(im).astype(float)
    W, H, thr, mode, min_part = SIGN_PARAMS.get(key, (46, 16, 0.5, "max", 1))
    if mode == "white":  # only near-white ink (the white file keeps a colour icon we cannot hold in 1 bit)
        mask = a[:, :, 3] / 255 * (a[:, :, :3].min(axis=2) > 200)
    else:  # the white (dark-background) logo: ink = alpha x brightest channel, coloured accents count
        mask = a[:, :, 3] / 255 * (a[:, :, :3].max(axis=2) / 255)
    b = onebit_logo(mask, W, H, thr, min_part)
    out = blank(b.shape[1], b.shape[0])
    arr = np.array(out)
    arr[b] = rgba("white")
    return Image.fromarray(arr, "RGBA").copy()


def build_title_logo(width: int = 128):
    """The Six Peaks logo rebuilt in white pixels, plus 4x4 assembly blocks for the title animation."""
    im = Image.open(WEB / "brand" / "logo-white.webp").convert("RGBA")
    a = np.array(im).astype(float)
    m = a[:, :, 3] / 255 * (a[:, :, :3].mean(axis=2) / 255)
    ys, xs = np.where(m > 0.2)
    m = m[ys.min(): ys.max() + 1, xs.min(): xs.max() + 1]
    h, w = m.shape
    H = round(h * width / w)
    big = Image.fromarray((m * 255).astype(np.uint8)).resize((width * 4, H * 4), Image.BOX)
    b = (np.array(big) / 255.0).reshape(H, 4, width, 4).mean(axis=(1, 3)) > 0.5
    logo = blank(width, H)
    arr = np.array(logo)
    arr[b] = rgba("white")
    logo = Image.fromarray(arr, "RGBA").copy()
    # parts by the empty rows between them: peaks, wordmark, GAMES
    rows = b.any(axis=1)
    bands, y = [], 0
    while y < H:
        if rows[y]:
            y0 = y
            while y < H and rows[y]:
                y += 1
            bands.append((y0, y))
        y += 1
    names = ["peaks", "wordmark", "games"]
    part_of = {}
    for i, (y0, y1) in enumerate(bands[:3]):
        for yy in range(y0, y1):
            part_of[yy] = names[i]
    blocks = []
    for by in range(0, H, 4):
        for bx in range(0, width, 4):
            cell = b[by: by + 4, bx: bx + 4]
            if cell.any():
                cy = by + int(np.argmax(cell.any(axis=1)))
                blocks.append({"x": bx, "y": by, "w": min(4, width - bx), "h": min(4, H - by),
                               "part": part_of.get(cy, "wordmark")})
    order_key = {"peaks": 0, "wordmark": 1, "games": 2}
    blocks.sort(key=lambda k: (order_key[k["part"]], k["x"] + k["y"] * 0.5))
    for i, k in enumerate(blocks):
        k["order"] = i
    meta = {
        "image": "title-logo.png", "width": width, "height": H, "block": 4,
        "note": "draw each block by copying its rect from title-logo.png; 'order' assembles peaks left to right, then the wordmark, then GAMES",
        "parts": {n: {"y0": b0, "y1": b1} for n, (b0, b1) in zip(names, bands[:3])},
        "blocks": blocks,
    }
    return logo, meta


# --------------------------------------------------------------------------------------
# Level JSON, style frame, proof sheet
# --------------------------------------------------------------------------------------
def build_peaks_json(L: dict, zones: str) -> dict:
    stairs = L["tagged"]["stairs"][0]
    ledge_x = next(l["x"] for l in L["ledges"] if l["h"] == 20)
    sp0, sp1, _ = L["tagged"]["summit"][0]
    summit_x, summit_y = L["tops"][-1]
    meadows = [{"x0": a, "x1": b, "y": L["ground"][(a + b) // 2]} for a, b, _ in L["tagged"]["meadow"]]
    shoulder = meadows[0]
    data = {
        "width": LEVEL_W,
        "height": LEVEL_H,
        "ground": L["ground"],
        "peaks": [{"x": x, "y": y} for x, y in L["tops"]],
        "baseCamp": BASE_CAMP_W // 2,
        "summit": summit_x,
        # --- additions (optional helpers; the contract fields above are unchanged) ---
        "baseCampRange": [0, BASE_CAMP_W],
        "summitPlateau": {"x0": L["tagged"]["summit"][0][0], "x1": L["tagged"]["summit"][0][1], "y": summit_y},
        "meadows": meadows,
        "flats": L["flats"],
        "ledges": L["ledges"],
        "surface": zones,
        "sites": {
            "stairs": {"x": ledge_x - 40, "y": L["ground"][ledge_x - 20], "ledgeX": ledge_x, "ledgeH": 20,
                       "note": "fault_stairs_missing: bottom-left at (x, y), flush against the 20px ledge at ledgeX; its top step meets the ledge top"},
            "clipGround": {"x": (shoulder["x0"] + shoulder["x1"]) // 2 + 60, "note": "grass meadow above base camp; fault_clip_ground anchor row on the ground"},
            "summitSign": {"x": sp0 + 26, "note": "centre x of fault_typo_flag_sign on the summit plateau"},
            "summitFlag": {"x": sp0 + 64, "note": "centre x of prop_flag on the summit plateau"},
            "powerUps": [{"x": x, "y": y - 22} for x, y in L["tops"][:5]] + [{"x": summit_x, "y": summit_y - 46, "note": "above the summit sign"}],
        },
        "parallax": {"sky": 0.0, "bgFar": 0.2, "bgMid": 0.45, "level": 1.0},
        "physicsHints": {"maxWalkStepPx": 3, "maxLedgePx": 20, "suggestedJumpApexPx": 34,
                         "note": "ground[x] is the y of the walking surface; steps of more than 3px are ledges to jump"},
        "derivation": (
            "Sampled the top edge of the bright mountain shapes in assets/web/brand/logo-white.webp (alpha 0.5 "
            "crossing, rows above the wordmark), simplified to the logo's 17-vertex polyline (Douglas-Peucker, "
            "2px). Its six local maxima are the six peaks. Vertical: saddle and shoulder heights keep the logo's "
            "profile at %.3f px per logo px; each peak then stands above its higher saddle by 34-56px in "
            "proportion to its prominence in the logo, so the order of heights is the logo's (peak 3 highest, "
            "peak 6 lowest). Horizontal: every facet keeps the logo's relative steepness mapped to 0.16-0.62 "
            "slope; climbs to a peak get a 12-16px rock ledge; saddles become meadows (shallow 6px bowls) that "
            "share the remaining width; base camp is a %dpx flat; the summit (peak 6) is an 80px plateau; one "
            "20px ledge before peak 4 carries the staircase fault." % (L["alpha"], BASE_CAMP_W)),
    }
    return data


def build_style_frame(frames: dict, sky: Image.Image, far: Image.Image, mid: Image.Image, L: dict, zones: str,
                      billboards: dict, signs: dict, meta: dict) -> Image.Image:
    """A 384x216 frame composed only from the kit: the meadow below peak 2 and the climb to it."""
    cam = 1104
    g = L["ground"]
    frame = sky.copy()
    for layer, k in ((far, 0.2), (mid, 0.45)):
        off = int(cam * k) % layer.width
        strip = Image.new("RGBA", (layer.width * 2, layer.height))
        strip.paste(layer, (0, 0))
        strip.paste(layer, (layer.width, 0))
        frame.alpha_composite(strip.crop((off, 0, off + 384, 216)))

    def at(im: Image.Image, wx: int, dy: int = 0, ay: int | None = None) -> None:
        ay = im.height if ay is None else ay
        frame.alpha_composite(im, (wx - cam - im.width // 2, g[wx] - ay + dy))

    # trees are planted a pixel into the ground, so draw them before the terrain
    at(frames["prop_tree_1"], 1196, 1)
    at(frames["prop_tree_2"], 1452, 2)
    frame.alpha_composite(render_terrain(L, zones, cam, cam + 384))
    bb = frames["prop_billboard"].copy()
    w = meta["billboardWindow"]
    bb.alpha_composite(billboards["cattle-country"], (w["x"], w["y"]))
    at(bb, 1146, 1)
    at(frames["prop_tree_0"], 1110, 1)
    # partner signpost: post, slate board, the partner's 1-bit logo
    sp_x = 1252
    post_im = frames["prop_signpost"]
    px0, py0 = sp_x - cam - post_im.width // 2, g[sp_x] - post_im.height + 1
    frame.alpha_composite(post_im, (px0, py0))
    mnt = meta["signpostMount"]
    board = frames["prop_signboard"].copy()
    lg = signs["playtonic-friends"]
    sw = meta["signboardWindow"]
    board.alpha_composite(lg, (sw["x"] + (sw["w"] - lg.width) // 2, sw["y"] + (sw["h"] - lg.height) // 2))
    frame.alpha_composite(board, (px0 + mnt["x"], py0 + mnt["y"]))
    # the Clipper, half sunk in the meadow, the reticle locked on it
    cx = 1206
    frame.alpha_composite(frames["fault_clip_ground"], (cx - cam - 12, g[cx] - 12))
    frame.alpha_composite(frames["reticle_1"], (cx - cam - 8, g[cx] - 12))  # framed on the visible beetle
    at(frames["prop_rock_0"], 1276, 2)
    # the tester jumping the rock ledge on the way up to peak 2 (placed from the level data)
    p2x, p2y = L["tops"][1]
    lx = max(l["x"] for l in L["ledges"] if l["up"] and l["x"] < p2x)
    tj = frames["tester_jump_0"]
    frame.alpha_composite(tj, (lx - 9 - cam - 8, g[lx - 9] - 24 - 14))
    # the pillar power-up over peak 2
    frame.alpha_composite(frames["power_english"], (p2x - cam - 8, p2y - 22 - 8))
    # a team-photo polaroid pickup floating over the climb
    frame.alpha_composite(frames["prop_polaroid"], (lx - 40 - cam - 6, g[lx - 40] - 30))
    return frame


def label_font(size: int = 12):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def build_sheet(frames: dict, billboards: dict, signs: dict, title: Image.Image, sky: Image.Image,
                far: Image.Image, mid: Image.Image, path: Path) -> None:
    """Every sprite and frame at x4 on mid-grey, labelled; then the art-in-frames and backgrounds."""
    K = 4
    GREY = (128, 128, 128)
    font, hfont = label_font(12), label_font(18)
    groups = [
        ("Tester (16x24)", [n for n in frames if n.startswith("tester_")]),
        ("Bugs (16x16, two frames each)", [n for n in frames if n.startswith("bug_")]),
        ("Power-ups (16x16)", [n for n in frames if n.startswith("power_")]),
        ("Props", [n for n in frames if n.startswith("prop_") or n.startswith("reticle_")]),
        ("Tiles (8x8)", [n for n in frames if n.startswith("tile_")]),
        ("Demo faults and their fixed twins", [n for n in frames if n.startswith("fault_")]),
        ("billboard-<slug>.png (72x30, key art, adaptive 32 colours)", [f"billboard-{s}" for s in billboards]),
        ("sign-<partner>.png (1-bit white)", [f"sign-{s}" for s in signs]),
        ("title-logo.png", ["title-logo"]),
        ("sky.png, bg-far.png, bg-mid.png (x1)", ["sky", "bg-far", "bg-mid"]),
    ]
    extra = {f"billboard-{k}": v for k, v in billboards.items()}
    extra.update({f"sign-{k}": v for k, v in signs.items()})
    extra["title-logo"] = title
    extra["sky"], extra["bg-far"], extra["bg-mid"] = sky, far, mid
    W = 1900
    pad, gap = 24, 18
    d_measure = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    # layout pass
    items = []
    y = pad
    for title_txt, names in groups:
        items.append(("h", title_txt, pad, y))
        y += 30
        x, row_h = pad, 0
        for n in names:
            im = frames.get(n) or extra[n]
            k = 1 if n in ("sky", "bg-far", "bg-mid") else K
            w, h = im.width * k, im.height * k
            if x + w > W - pad:
                x = pad
                y += row_h + 22 + gap
                row_h = 0
            lw = int(d_measure.textlength(f"{n}  {im.width}x{im.height}", font=font))
            if x + max(w, lw) > W - pad and x > pad:
                x = pad
                y += row_h + 22 + gap
                row_h = 0
            items.append(("i", n, x, y, k))
            x += max(w, lw) + gap
            row_h = max(row_h, h)
        y += row_h + 22 + gap + 10
    sheet = Image.new("RGB", (W, y + pad), GREY)
    d = ImageDraw.Draw(sheet)
    for it in items:
        if it[0] == "h":
            d.text((it[2], it[3]), it[1], fill=(255, 255, 255), font=hfont)
        else:
            _, n, x, yy, k = it
            im = frames.get(n) or extra[n]
            big = scale(im, k)
            tile = Image.new("RGBA", big.size, GREY + (255,))
            tile.alpha_composite(big)
            sheet.paste(tile.convert("RGB"), (x, yy))
            d.text((x, yy + big.height + 4), f"{n}  {im.width}x{im.height}", fill=(16, 16, 16), font=font)
    sheet.save(path, optimize=True)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "palette.json").write_text(json.dumps(PALETTE, indent=1) + "\n")
    frames, sprite_data = build_sprites()
    props_meta = {k: sprite_data[k] for k in ("billboardWindow", "signboardWindow", "signpostMount")}
    L = build_level()
    zones = surface_zones(L)
    (OUT / "peaks.json").write_text(json.dumps(build_peaks_json(L, zones), separators=(",", ":")) + "\n")
    sky = build_sky()
    far, mid = build_ridges()
    for im, n in ((sky, "sky.png"), (far, "bg-far.png"), (mid, "bg-mid.png")):
        assert_palette(im, n)
        im.save(OUT / n, optimize=True)
    terrain = render_terrain(L, zones)
    assert_palette(terrain, "level-terrain.png")
    terrain.save(OUT / "level-terrain.png", optimize=True)
    billboards = {s: build_billboard(s) for s in released_slugs()}
    for s, im in billboards.items():
        assert im.size == (72, 30)
        im.save(OUT / f"billboard-{s}.png", optimize=True)
    signs = {k: build_sign(k) for k in partner_keys()}
    for k, im in signs.items():
        assert_palette(im, f"sign-{k}")
        im.save(OUT / f"sign-{k}.png", optimize=True)
    title, title_meta = build_title_logo()
    title.save(OUT / "title-logo.png", optimize=True)
    (OUT / "title-logo-blocks.json").write_text(json.dumps(title_meta, indent=1) + "\n")
    sf = build_style_frame(frames, sky, far, mid, L, zones, billboards, signs, props_meta)
    scale(sf, 4).save(OUT / "style-frame.png", optimize=True)
    build_sheet(frames, billboards, signs, title, sky, far, mid, QA / "pixel-kit-sheet.png")
    if "--preview" in sys.argv:
        SCRATCH.mkdir(parents=True, exist_ok=True)
        sf.save(SCRATCH / "style-frame-1x.png")
    # the contract check (fails loudly if any name or file is missing)
    r = subprocess.run(["node", str(ROOT / "tools" / "a2-pixel-kit-check.mjs")], cwd=ROOT)
    return r.returncode


if __name__ == "__main__":
    sys.exit(main())
