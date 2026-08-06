"""Regions, silhouette and the line/shading split shared by both renders."""
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import (gaussian_filter, maximum_filter, median_filter, binary_dilation,
                           binary_erosion, binary_closing, binary_fill_holes, label,
                           distance_transform_edt)
from skimage.segmentation import watershed

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
# --- left hand: fingerless glove, bare fingertips above the cuff
POLY['hand_up'] = [(254,161),(332,159),(338,200),(250,203)]
POLY['glove_up']= [(248,199),(340,197),(345,258),(300,281),(249,273)]
# --- right hand: OUTSIDE the pocket, same fingerless glove, bare fingers below
POLY['glove_dn']= [(594,588),(700,594),(715,644),(694,684),(652,708),(600,702),(575,668),(577,622)]
POLY['hand_dn'] = [(558,686),(618,677),(659,694),(651,748),(620,789),(580,786),(555,739)]
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
HOLE = [[(138,468),(332,466),(312,560),(250,594),(188,562),(138,502)]]

ORDER = ['bag','jacket','sleeve','collar','shirt','neck','hair','face','glove_up','hand_up',
         'glove_dn','hand_dn','belt','pants','pouch','tag','shoeL','shoeR','soleL','soleR']
IDS = {n:i+1 for i,n in enumerate(ORDER)}


def load(src='src.png'):
    g = np.asarray(Image.open(src).convert('L')).astype(np.float32)/255.0
    bg = gaussian_filter(maximum_filter(g, size=61), 30)
    flat = np.clip(g/np.maximum(bg, 1e-3), 0, 1.0)
    ink = np.clip((1-np.clip((flat-0.45)/0.48, 0, 1)-0.13)/0.87, 0, 1)
    H, W = ink.shape

    wall = binary_closing(ink > 0.26, np.ones((7,7)))
    wall = binary_dilation(wall, np.ones((3,3)), iterations=2)
    lab, _ = label(~wall)
    b = set(lab[0,:])|set(lab[-1,:])|set(lab[:,0])|set(lab[:,-1]); b.discard(0)
    sil = binary_fill_holes(~np.isin(lab, list(b)))
    hm = Image.new('L', (W,H), 0); hd = ImageDraw.Draw(hm)
    for p in HOLE: hd.polygon(p, fill=255)
    sil &= ~(np.asarray(hm) > 0)

    lay = Image.new('I', (W,H), 0); d = ImageDraw.Draw(lay)
    for n in ORDER:
        if n in POLY: d.polygon(POLY[n], fill=IDS[n])
        else:         d.ellipse(ELL[n],  fill=IDS[n])
    lab0 = np.asarray(lay).astype(np.int32); lab0[~sil] = 0

    markers = np.zeros_like(lab0)
    for n in ORDER:
        m = lab0 == IDS[n]
        if not m.any(): continue
        for it in (5,3,1):
            e = binary_erosion(m, np.ones((3,3)), iterations=it)
            if e.any(): break
        markers[e if e.any() else m] = IDS[n]

    seg = watershed(gaussian_filter(ink, 1.2), markers, mask=sil)
    keep = np.zeros_like(seg, bool)
    for n in ORDER:
        m = seg == IDS[n]
        if not m.any(): continue
        keep |= m & binary_dilation(lab0 == IDS[n], np.ones((3,3)), iterations=11)
    orphan = (seg > 0) & ~keep
    if orphan.any():
        seed = np.where(keep, seg, 0)
        _, idx = distance_transform_edt(seed == 0, return_indices=True)
        near = seed[tuple(idx)]
        deep = binary_erosion(sil, np.ones((3,3)), iterations=4)
        seg = np.where(orphan & deep, near, np.where(orphan, 0, seg))

    # split the graphite into broad form shading and thin strokes
    form  = gaussian_filter(median_filter(ink, size=9), 2.0)
    lines = np.clip(ink - median_filter(ink, size=9), 0, 1)
    return ink, form, lines, sil, seg
