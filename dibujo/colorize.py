import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import (gaussian_filter, maximum_filter, binary_dilation,
                           binary_erosion, binary_closing, binary_fill_holes, label)
from skimage.segmentation import watershed

SRC = 'dibujo/original.png'

# ---------------------------------------------------------------- 1. line art
g = np.asarray(Image.open(SRC).convert('L')).astype(np.float32)/255.0
bg = gaussian_filter(maximum_filter(g, size=61), 30)
flat = np.clip(g/np.maximum(bg, 1e-3), 0, 1.0)
lv = np.clip((flat-0.45)/(0.93-0.45), 0, 1)
ink = 1.0 - lv
ink = np.clip((ink-0.13)/0.87, 0, 1)          # kill scan halo
H, W = ink.shape

# ---------------------------------------------------------------- 2. geometry
POLY = {}
POLY['bag']   = [(106,290),(300,248),(345,264),(348,305),(332,458),(112,464)]
POLY['jacket']= [(345,250),(400,214),(470,228),(540,214),(600,194),(670,189),(722,205),
                 (752,246),(773,340),(786,452),(776,532),(746,602),(704,662),(658,666),
                 (640,618),(600,608),(500,616),(430,620),(358,622),(334,560),(329,430),(332,300)]
POLY['sleeve']= [(248,232),(342,228),(400,286),(432,378),(422,452),(350,456),(300,400),(252,300)]
POLY['collar']= [(384,214),(430,234),(520,222),(600,196),(670,189),(724,208),(748,250),
                 (700,264),(640,242),(560,252),(480,260),(420,264),(386,250)]
POLY['shirt'] = [(452,240),(520,238),(546,290),(553,380),(566,460),(573,545),(560,596),
                 (430,600),(390,584),(401,470),(418,380),(430,300)]
POLY['neck']  = [(458,204),(520,204),(529,250),(505,263),(465,259),(451,234)]
POLY['glove_up']= [(246,216),(338,214),(342,262),(300,278),(252,272)]
POLY['hand_up'] = [(256,166),(330,164),(336,214),(252,216)]
POLY['glove_dn']= [(596,594),(706,598),(710,650),(660,668),(600,664)]
POLY['hand_dn'] = [(592,660),(660,650),(682,690),(670,746),(630,776),(600,760),(584,700)]
POLY['belt']  = [(346,626),(470,616),(560,624),(620,638),(614,674),(470,662),(348,670)]
POLY['pants'] = [(340,654),(630,658),(662,760),(682,900),(702,1100),(722,1300),(716,1400),
                 (660,1424),(562,1382),(530,1200),(516,1420),(470,1436),(390,1428),
                 (348,1330),(334,1100),(330,850)]
POLY['pouch'] = [(492,700),(548,694),(562,760),(556,802),(530,842),(500,830),(486,760)]
POLY['tag']   = [(452,318),(480,316),(484,398),(456,402)]
POLY['shoeL'] = [(345,1425),(400,1408),(455,1414),(495,1450),(501,1492),(486,1522),
                 (400,1546),(350,1546),(329,1500),(330,1454)]
POLY['shoeR'] = [(508,1442),(560,1412),(622,1418),(680,1430),(701,1470),(696,1522),
                 (650,1556),(558,1563),(504,1540),(494,1488)]
POLY['soleL'] = [(331,1506),(501,1490),(492,1522),(420,1548),(352,1548),(329,1530)]
POLY['soleR'] = [(494,1520),(700,1506),(696,1536),(650,1560),(555,1566),(499,1546)]
ELL  = {'hair': (398,16,568,134), 'face': (444,116,540,224)}
HOLE = [[(138,468),(332,466),(312,560),(250,594),(188,562),(138,502)]]   # inside strap loop

ORDER = ['bag','jacket','sleeve','collar','shirt','neck','hair','face','glove_up','hand_up',
         'glove_dn','hand_dn','belt','pants','pouch','tag','shoeL','shoeR','soleL','soleR']
IDS = {n:i+1 for i,n in enumerate(ORDER)}

# ---------------------------------------------------------------- 3. silhouette
wall = binary_closing(ink > 0.26, np.ones((7,7)))
wall = binary_dilation(wall, np.ones((3,3)), iterations=2)
lab, _ = label(~wall)
border = set(lab[0,:]) | set(lab[-1,:]) | set(lab[:,0]) | set(lab[:,-1]); border.discard(0)
sil = binary_fill_holes(~np.isin(lab, list(border)))
hm = Image.new('L', (W,H), 0); hd = ImageDraw.Draw(hm)
for p in HOLE: hd.polygon(p, fill=255)
sil &= ~(np.array(hm) > 0)

# ---------------------------------------------------------------- 4. segmentation
lay = Image.new('I', (W,H), 0); d = ImageDraw.Draw(lay)
for n in ORDER:
    if n in POLY: d.polygon(POLY[n], fill=IDS[n])
    else:         d.ellipse(ELL[n],  fill=IDS[n])
lab0 = np.array(lay).astype(np.int32); lab0[~sil] = 0

markers = np.zeros_like(lab0)
for n in ORDER:
    m = lab0 == IDS[n]
    if not m.any(): continue
    for it in (5,3,1):
        e = binary_erosion(m, np.ones((3,3)), iterations=it)
        if e.any(): break
    markers[e if e.any() else m] = IDS[n]

seg = watershed(gaussian_filter(ink, 1.2), markers, mask=sil)

# keep every label near its own polygon, then hand orphans to the closest label
from scipy.ndimage import distance_transform_edt
keep = np.zeros_like(seg, bool)
for n in ORDER:
    m = seg == IDS[n]
    if not m.any(): continue
    zone = binary_dilation(lab0 == IDS[n], np.ones((3,3)), iterations=11)
    keep |= (m & zone)
orphan = (seg > 0) & ~keep
if orphan.any():
    seed = np.where(keep, seg, 0)
    _, idx = distance_transform_edt(seed == 0, return_indices=True)
    near = seed[tuple(idx)]
    deep = binary_erosion(sil, np.ones((3,3)), iterations=4)
    seg = np.where(orphan & deep, near, np.where(orphan, 0, seg))

# ---------------------------------------------------------------- 5. palette
def hx(s):
    s = s.lstrip('#'); return np.array([int(s[i:i+2],16) for i in (0,2,4)], np.float32)/255.
BASE = {
 'bag':'#7B6A4C','jacket':'#6E7357','sleeve':'#6E7357','collar':'#555A43','shirt':'#E7E2D6',
 'neck':'#E4B492','hair':'#2F2C34','face':'#F3C7A6','glove_up':'#34353C','hand_up':'#F0C09E',
 'glove_dn':'#34353C','hand_dn':'#F0C09E','belt':'#6B4A33','pants':'#6E87A9','pouch':'#4A453F',
 'tag':'#C6C9D0','shoeL':'#2B2E35','shoeR':'#2B2E35','soleL':'#DFDACC','soleR':'#DFDACC'}
TINT = {  # colour the deepest shadows drift toward
 'face':'#8C4F3A','hand_up':'#8C4F3A','hand_dn':'#8C4F3A','neck':'#8C4F3A','hair':'#161A2A',
 'shirt':'#6E6A78','pants':'#1E2B47','jacket':'#232616','sleeve':'#232616','collar':'#232616',
 'bag':'#2B2314','soleL':'#8C8878','soleR':'#8C8878'}
PAPER, PAPER_TINT = hx('#F5F2EA'), hx('#4A4640')

C = np.zeros((H,W,3), np.float32); C[:] = PAPER
T = np.zeros((H,W,3), np.float32); T[:] = PAPER_TINT
for n in ORDER:
    m = seg == IDS[n]
    C[m] = hx(BASE[n]); T[m] = hx(TINT.get(n, '#2A2A32'))
C = gaussian_filter(C, (0.8,0.8,0))          # soften flat edges
T = gaussian_filter(T, (0.8,0.8,0))

# ---------------------------------------------------------------- 6. composite
from scipy.ndimage import distance_transform_edt as _dt
edge = np.clip(_dt(seg > 0)/3.0, 0, 1)[...,None]
C = C*edge + PAPER*(1-edge)
T = T*edge + PAPER_TINT*(1-edge)

t = (ink**0.92)[...,None]
shade = C*0.20 + T*0.30
out = C*(1-t) + shade*t

# gentle top-left key light over the figure
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
key = 1.0 + 0.055*np.clip(1.0-((xx-330)**2/(620.0**2)+(yy-260)**2/(760.0**2)), 0, 1)
figm = gaussian_filter(sil.astype(np.float32), 6)[...,None]
out = out*(1 + (key[...,None]-1)*figm)

# soft contact shadow on the paper under the feet
sh = np.zeros((H,W), np.float32)
Image.fromarray((sh*255).astype(np.uint8))
shimg = Image.new('L',(W,H),0); ImageDraw.Draw(shimg).ellipse((300,1500,730,1585), fill=90)
sh = gaussian_filter(np.asarray(shimg).astype(np.float32)/255., 18)
out *= (1 - 0.34*sh[...,None]*(~sil)[...,None])

# warm vignette so the figure sits on the page instead of floating
vg = 1.0 - 0.13*np.clip(((xx-W*0.47)**2/(W*0.72)**2 + (yy-H*0.46)**2/(H*0.70)**2) - 0.35, 0, 1)
out *= vg[...,None]
out = out*np.array([1.005,1.0,0.992], np.float32)        # a hair of warmth
m = out.mean(-1, keepdims=True)
out = m + (out-m)*1.06                                    # gentle saturation lift

out = np.clip(out, 0, 1)
img = Image.fromarray((out*255+0.5).astype(np.uint8)).crop((40,22,1020,1586))
img.save('dibujo/version-color.png')
img.save('dibujo/version-color.jpg', quality=95, subsampling=0)

print('saved', img.size)
