"""Photoreal render pass over the pencil drawing."""
import sys, numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, binary_erosion, binary_dilation, distance_transform_edt
sys.path.insert(0, '.')
import geom
from geom import IDS, ORDER

ink, form, lines, sil, seg = geom.load(sys.argv[1] if len(sys.argv) > 1 else 'src.png')
H, W = ink.shape
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(7)

def hx(s):
    s = s.lstrip('#'); return np.array([int(s[i:i+2],16) for i in (0,2,4)], np.float32)/255.
def noise(sig, seed=None, shape=(H,W)):
    r = np.random.default_rng(seed).standard_normal(shape).astype(np.float32)
    n = gaussian_filter(r, sig)
    return n/(np.abs(n).max()+1e-6)

# ---------------------------------------------------------------- glove detail on the right hand
det = Image.new('L', (W*2, H*2), 0); dd = ImageDraw.Draw(det)
def stroke(pts, w):  dd.line([(x*2,y*2) for x,y in pts], fill=255, width=int(w*2), joint='curve')
stroke([(556,691),(582,682),(612,679),(641,690),(658,703)], 3.2)   # fingerless cut edge
stroke([(578,660),(608,666),(645,676)], 2.0)                        # knuckle seam
stroke([(590,624),(648,636),(706,648)], 2.2)                        # wrist strap
stroke([(594,687),(597,700)], 2.0); stroke([(621,686),(624,700)], 2.0)
stroke([(646,692),(648,704)], 1.8)                                  # finger slots
dd.rectangle([(674*2,632*2),(690*2,646*2)], outline=255, width=3)    # strap buckle
glove_det = np.asarray(det.resize((W,H), Image.LANCZOS)).astype(np.float32)/255.
lines = np.clip(lines + glove_det*0.85, 0, 1)

# ---------------------------------------------------------------- materials
M = {   # base colour, shadow tint, relief, spec strength, spec power, texture
 'bag':     ('#7A6A4E','#2A2317', 1.5, .10, 18, 'canvas'),
 'jacket':  ('#5E6547','#1A1D12', 1.9, .13, 22, 'twillfine'),
 'sleeve':  ('#5E6547','#1A1D12', 1.9, .13, 22, 'twillfine'),
 'collar':  ('#4B5138','#141709', 2.2, .10, 16, 'twillfine'),
 'shirt':   ('#DCD8CD','#5E5B58', 1.4, .07, 14, 'jersey'),
 'neck':    ('#D9A683','#7A2E23', 0.9, .16, 26, 'skin'),
 'hair':    ('#241F24','#08070C', 1.2, .34, 42, 'hair'),
 'face':    ('#EBBB98','#8E3226', 0.9, .18, 28, 'skin'),
 'glove_up':('#26262B','#07070A', 1.3, .30, 40, 'leather'),
 'hand_up': ('#E7B189','#8E3226', 0.9, .18, 28, 'skin'),
 'glove_dn':('#26262B','#07070A', 1.3, .30, 40, 'leather'),
 'hand_dn': ('#E3AC85','#8E3226', 0.9, .18, 28, 'skin'),
 'belt':    ('#5E4029','#180D06', 1.1, .26, 34, 'leather'),
 'pants':   ('#5E7699','#141F36', 2.1, .07, 14, 'denim'),
 'pouch':   ('#3B3730','#0C0B09', 1.2, .22, 30, 'leather'),
 'tag':     ('#B9BDC6','#3A3D46', 0.8, .55, 70, 'metal'),
 'shoeL':   ('#22252B','#06070A', 1.4, .28, 36, 'leather'),
 'shoeR':   ('#22252B','#06070A', 1.4, .28, 36, 'leather'),
 'soleL':   ('#D3CDBC','#4A473F', 1.0, .14, 20, 'rubber'),
 'soleR':   ('#D3CDBC','#4A473F', 1.0, .14, 20, 'rubber'),
}
BACKDROP = hx('#3A3E45')

# texture fields
u = xx*0.72 + yy*0.72
TEX = {
 'denim':     (np.sin(u*2.15)*0.55 + np.sin(u*0.83+1.1)*0.25 + noise(0.7,1)*0.6, 0.075),
 'twillfine': (np.sin((xx*0.6-yy*0.6)*1.9)*0.35 + noise(0.9,2)*0.9, 0.045),
 'canvas':    (np.sin(xx*1.55)*0.45 + np.sin(yy*1.55)*0.45 + noise(0.8,3)*0.5, 0.060),
 'jersey':    (noise(0.7,4)*1.0 + noise(2.2,5)*0.5, 0.035),
 'leather':   (noise(1.1,6)*0.8 + noise(3.5,7)*0.7, 0.055),
 'skin':      (noise(1.3,8)*0.5 + noise(6.0,9)*0.8, 0.022),
 'hair':      (gaussian_filter(np.random.default_rng(10).standard_normal((H,W)).astype(np.float32),(3.5,0.7))*9, 0.090),
 'metal':     (noise(1.0,11)*0.6, 0.030),
 'rubber':    (noise(1.4,12)*0.8, 0.040),
}
WEAR = noise(26, 13)                      # large-scale fabric fading

albedo = np.repeat(BACKDROP[None,None,:], H, 0).repeat(W, 1).copy()
tint   = np.zeros((H,W,3), np.float32); tint[:] = hx('#101216')
relief = np.full((H,W), 1.0, np.float32)
ks     = np.zeros((H,W), np.float32)
sp     = np.full((H,W), 20.0, np.float32)
bump   = np.zeros((H,W), np.float32)

for n in ORDER:
    m = seg == IDS[n]
    if not m.any(): continue
    base, sh, rel, kk, pw, tx = M[n]
    t, amp = TEX[tx]
    c = hx(base)[None,:] * (1 + t[m][:,None]*amp)
    if tx in ('denim','twillfine','canvas'):        # worn, sun-faded patches
        c *= (1 + WEAR[m][:,None]*0.10)
    albedo[m] = np.clip(c, 0, 1)
    tint[m]   = hx(sh); relief[m] = rel; ks[m] = kk; sp[m] = pw
    bump[m]   = t[m]*amp*1.6

# ---------------------------------------------------------------- normals + lighting
soft  = np.clip(form**1.12, 0, 1)
h = gaussian_filter((1-soft)*relief, 2.8) + bump*0.45
gy, gx = np.gradient(gaussian_filter(h, 1.0))
S = 2.1
nx, ny, nz = -gx*S, -gy*S, np.ones_like(h)
nl = np.sqrt(nx*nx+ny*ny+nz*nz); nx, ny, nz = nx/nl, ny/nl, nz/nl

def lit(d):
    d = np.array(d, np.float32); return d/np.linalg.norm(d)
Lk, Lf, Lb = lit((-0.46,-0.70,0.85)), lit((0.86,-0.12,0.62)), lit((0.10,0.55,-0.72))
KEY, FILL = hx('#FFF3E2')*0.66, hx('#9FB6D8')*0.26

ndl_k = np.clip(nx*Lk[0]+ny*Lk[1]+nz*Lk[2], 0, 1)
ndl_f = np.clip(nx*Lf[0]+ny*Lf[1]+nz*Lf[2], 0, 1)
ndl_b = np.clip(nx*Lb[0]+ny*Lb[1]+nz*Lb[2], 0, 1)

occ = 1.0 - 0.78*soft                                   # the artist's own modelling
occ *= 1.0 - 0.80*np.clip(lines*1.5, 0, 1)              # strokes become creases/seams

amb  = tint*0.85 + hx('#7C8CA6')*0.26                   # shadows take the material's own tint
diff = amb + KEY*(ndl_k**0.9)[...,None] + FILL*(ndl_f**0.95)[...,None]
col  = albedo*diff*occ[...,None]

def spec(L, strength, colr):
    Hv = lit((L[0], L[1], L[2]+1.0))
    nh = np.clip(nx*Hv[0]+ny*Hv[1]+nz*Hv[2], 0, 1)
    return (ks*strength*np.power(nh, sp))[...,None]*colr*occ[...,None]
col += spec(Lk, 0.45, hx('#FFF6E8')) + spec(Lf, 0.30, hx('#B9CCEA'))

# rim light hugging the silhouette
edge = np.clip(1 - distance_transform_edt(sil)/9.0, 0, 1)**2.2
col += (edge*(ndl_b**1.4)*0.42)[...,None]*hx('#CFE0FF')*sil[...,None]

# ---------------------------------------------------------------- backdrop + composite
bd = np.zeros((H,W,3), np.float32)
pool = np.exp(-(((xx-W*0.46)/(W*0.60))**2 + ((yy-H*0.30)/(H*0.55))**2))
grad = np.clip(0.30 + 0.42*pool + 0.16*(1-yy/H), 0, 1)
bd[:] = hx('#4A5058')[None,None,:]*grad[...,None]
bd *= 1 + noise(9, 14)[...,None]*0.05
bd = gaussian_filter(bd, (2,2,0))
cast = Image.new('L', (W,H), 0)
ImageDraw.Draw(cast).ellipse((262,1494,760,1596), fill=200)
cast = gaussian_filter(np.asarray(cast).astype(np.float32)/255., 22)
bd *= (1 - 0.62*cast[...,None])

alpha = gaussian_filter(sil.astype(np.float32), 0.9)[...,None]
img = col*alpha + bd*(1-alpha)

# ---------------------------------------------------------------- camera finish
bloom = gaussian_filter(np.clip(img-0.80, 0, None), (11,11,0))
img = img + bloom*0.14
r = np.sqrt(((xx-W/2)/(W/2))**2 + ((yy-H/2)/(H/2))**2)
img *= (1 - 0.20*np.clip(r-0.45, 0, 1)**1.6)[...,None]
sh = (1.0 + 0.0012*r)                                     # chromatic aberration
def warp(ch, s):
    ys = np.clip((yy-H/2)/s + H/2, 0, H-1).astype(np.int32)
    xs = np.clip((xx-W/2)/s + W/2, 0, W-1).astype(np.int32)
    return ch[ys, xs]
img[...,0] = warp(img[...,0], sh); img[...,2] = warp(img[...,2], 1/sh)
img = np.clip(img, 0, None)
a,b,c,d,e = 2.51, 0.03, 2.43, 0.59, 0.14                 # ACES-ish filmic curve
img = np.clip((img*(a*img+b))/(img*(c*img+d)+e), 0, 1)
m = img.mean(-1, keepdims=True); img = np.clip(m + (img-m)*1.06, 0, 1)
img = np.clip(img + (img - gaussian_filter(img,(1.3,1.3,0)))*0.26, 0, 1)   # unsharp
g = np.random.default_rng(21).standard_normal((H,W,1)).astype(np.float32)
img = np.clip(img + g*0.010*(1.25-img.mean(-1,keepdims=True)), 0, 1)

out = Image.fromarray((img*255+0.5).astype(np.uint8)).crop((40,22,1020,1586))
out.save('real.png'); out.save('real.jpg', quality=95, subsampling=0)
print('saved', out.size)
