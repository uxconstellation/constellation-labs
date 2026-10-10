# Contact sheet: python3 qa/sheet.py <out.jpg> <img1> <img2> ... [--cols N] [--w W]
# Tiles screenshots in a grid with filename labels so a whole run can be judged in one look.
import sys, os
from PIL import Image, ImageDraw
args = sys.argv[1:]
cols, w = 4, 360
if '--cols' in args: i = args.index('--cols'); cols = int(args[i+1]); del args[i:i+2]
if '--w' in args: i = args.index('--w'); w = int(args[i+1]); del args[i:i+2]
out, files = args[0], args[1:]
ims = []
for f in files:
    im = Image.open(f).convert('RGB'); h = int(im.size[1] * w / im.size[0])
    ims.append((os.path.basename(f), im.resize((w, h))))
rowh = []
for r in range(0, len(ims), cols):
    rowh.append(max(im.size[1] for _, im in ims[r:r+cols]) + 22)
sheet = Image.new('RGB', (cols * (w + 10) + 10, sum(rowh) + 10), (40, 40, 44))
d = ImageDraw.Draw(sheet); y = 10
for ri, r in enumerate(range(0, len(ims), cols)):
    for ci, (name, im) in enumerate(ims[r:r+cols]):
        x = 10 + ci * (w + 10); sheet.paste(im, (x, y + 18)); d.text((x, y + 3), name, fill=(230, 230, 230))
    y += rowh[ri]
sheet.save(out, quality=78); print(out, sheet.size)
