#!/usr/bin/env python3
"""Six Peaks Games, Direction A2 (Bug Hunt): pixel asset kit generator.

Regenerates everything in assets/web/pixel/ plus the QA proof sheet:

    python3 tools/a2-pixel-kit.py            # build the kit, the proofs, run the contract check
    python3 tools/a2-pixel-kit.py --preview  # also write zoomed previews to the scratch dir

Sprites are authored below as readable string maps (one character per pixel, legend in
CHARS). Palette = the DIRECTION-A2 tokens only. Light comes from the upper left.
Characters and props carry a 1px ink outline; the `outline` helper adds it automatically
around any non-ink opaque pixel, so silhouettes stay consistent between frames.
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
    return Image.fromarray(a, "RGBA")


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


if __name__ == "__main__" and "--selftest" in sys.argv:
    print("ok")
