# PIXEL BIBLE: Bug Hunt art clean-up (round 3)

**Trigger:** Aldo, 2026-10-11, verbatim: "the pixel version is very basic and not CLEAN at all! So we need to really clean that up"
**Aldo's rulings (2026-10-11):** art source = AI-generated + cleanup pass; billboards = HD key art in a pixel frame (screen in the world).
**Scope:** the art and its rendering only. Game logic, content, routes, manual and QA fixes stay. Press Start stays frozen.

## Diagnosis of v1 (evidence: `research/pixel-cleanup/diagnosis-v1.jpg`, from proof frames 01 and 04)
1. **Noise, not dither.** Mountain faces and sky use random speckle in bands. That reads as dirt, not texture.
2. **Jaggies and orphan pixels.** The snowline is a ragged random edge. Slopes don't hold a constant step ratio. The peak has a hard vertical seam where two shapes meet.
3. **Mixels (mixed pixel sizes).** There are four grids on one screen:
   - the game canvas at 4 px;
   - the title logo at its own scale;
   - the Pixelify heading at another;
   - the Silkscreen HUD at a size that isn't a multiple of the game pixel.
   The "QA" start control also has an empty block where its play glyph should sit.
4. **Photos squeezed to 72x30.** Real key art downsampled into a pixel grid comes out as mud (see the Suzerain billboard).
5. **No form.** Each peak is one flat triangle in two tones. There is no ground layer, no ledges, no light source, and no foreground.
6. **Weak depth.** Far and mid ridges are low-contrast silhouettes with the same value as the playfield.
7. **Flat sprites.** Outlines are inconsistent: some objects have black outlines, some have none, and none are shaded.
8. **Variable framing.** The internal resolution changes with the viewport (360x225 on desktop, 195x143 on a phone), so nothing is composed for a fixed frame.

## Rules for v2 (every asset and the renderer must pass these)
- **R1, one grid.** A fixed internal resolution of **320x180**, which is 16:9 and the resolution Celeste uses. It is scaled by an integer factor only.
  - Extra viewport is filled with more level, never by rescaling.
  - On a portrait phone the frame is a crop window of the same grid, at the same pixel size.
- **R2, one pixel size on screen.** Any pixel-styled text or graphic outside the canvas (title logo, HUD, buttons) is drawn at exactly the canvas scale, or at an integer multiple of it.
  - Body copy uses Atkinson (not a pixel face), so it never pretends to be on the grid.
- **R3, palette.** A maximum of 32 colours in hue-shifted ramps: shadows go cooler and toward blue-violet, highlights go warmer.
  - Ramps: sky, far ridge, mid ridge, rock, snow, grass, wood, skin, cloth, UI.
  - Brand red `#E02B20` and bug magenta `#FF2BD6` are reserved: red for the route, flag and CTAs; magenta for bugs only.
- **R4, no random dither.** Gradients use ordered 2x2 or 4x4 patterns, only where two ramp steps meet, and at most 4 px deep. Large areas are flat ramp bands.
- **R5, clean lines.**
  - Slopes use the step ratios 1:1, 2:1, 3:1 or 4:1, and hold one ratio per run.
  - No jaggies, no doubled corners and no orphan pixels.
  - A cleanup script flags any pixel whose 4 neighbours are all one other colour.
- **R6, light.** One light source, low dawn from the right (east, over the summit). Every sprite and tile is lit from it.
- **R7, outlines.** Sprites and props get a 1 px outline in the darkest step of their own ramp, never pure black. Terrain has no outline; it is defined by value.
- **R8, tiles.** The ground is a 16x16 tileset with flat, 1:1 slope, 2:1 slope, cap, edge, inner corner and fill tiles. Snow caps, grass and rock are variants of the tileset.
  - The playfield is assembled from tiles on a grid, not drawn as a polygon.
- **R9, depth.** There are 4 parallax planes (sky, far range, mid range, near treeline), plus the playfield and a sparse foreground layer.
  - Each plane steps clearly in value: far is lighter and cooler, near is darker.
  - Atmospheric haze uses flat bands, not blur.
- **R10, sprites.**
  - The tester is 16x24 on the grid, with a clear silhouette, 2-tone shading and a readable 6-frame run.
  - Bugs are 16x16, magenta on dark, each with a distinct silhouette and a 2-frame idle.
- **R11, billboards (Aldo's ruling).** A pixel-art frame (posts, lamp, bezel) sits on the grid. The **real key art** plays inside the bezel at native resolution, as a screen in the world.
  - In the run it shows clean at the bezel size.
  - The card opens to full size.
  - The art is never palette-reduced or squeezed into the grid.
- **R12, camera.** The camera position snaps to whole game pixels. There is no sub-pixel drawing, so nothing shimmers.

## AI generation and cleanup pipeline
1. **Generate.** Use Krea or Magnific (connected; they use Aldo's credits) with a brief that names the resolution, palette, light, step ratios and "no dithering noise".
2. **Detect the grid.** Estimate the source's pixel size, then downsample nearest-neighbour using the modal colour per cell.
3. **Snap the palette.** Map each colour to the R3 palette in OKLab.
4. **Lint.** Count orphan pixels, colours outside the palette, and slope-ratio breaks.
5. **Hand-fix.** The pixel-art lead fixes what the lint flags.
6. Only assets with zero lint errors enter the kit.

## Steps (one at a time, Aldo says "next")
1. **Diagnosis and bible** (this file). Done.
2. **Style frame:** one 320x180 frame of base camp and the first peak, generated and cleaned. It shows the tester, one bug, one partner sign and one billboard with HD art inside, plus the HUD on the same grid. Aldo approves the look.
3. **Full kit:** the parallax planes, tileset, props, tester and 8 bugs, 15 partner signs, the billboard frame, and the title logo on the grid.
4. **Integration:** a fixed-grid renderer, a tile-built level, billboard screens and the HUD and title on the grid. The play-test and QA tools are kept.
5. **Proof and QA:** the builder's play-test, then an independent qa-verifier pass (AA, truth, the R1 to R12 lint). Then republish to the Direction A link.
