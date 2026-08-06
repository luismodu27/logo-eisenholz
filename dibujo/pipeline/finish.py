"""Final assembly: open the fingers of the right glove, clean the backdrop, output."""
import sys, time, numpy as np, torch
from PIL import Image, ImageDraw, ImageFilter
torch.set_num_threads(4)
from diffusers import (StableDiffusionControlNetImg2ImgPipeline, ControlNetModel,
                       AutoencoderKL, UniPCMultistepScheduler)
from scipy.ndimage import gaussian_filter, binary_dilation, label
sys.path.insert(0,'.'); import geom
from geom import IDS

CROP=(40,22,1020,1586)
ink, form, lines, sil, seg = geom.load()
ink = ink[CROP[1]:CROP[3], CROP[0]:CROP[2]]; seg = seg[CROP[1]:CROP[3], CROP[0]:CROP[2]]
sil = sil[CROP[1]:CROP[3], CROP[0]:CROP[2]]

img = Image.open('sd_hands.png').convert('RGB'); OW, OH = img.size
A = np.asarray(img).astype(np.float32)/255.
ctrl = Image.fromarray((np.clip((ink-0.12)/0.62,0,1)*255).astype('uint8')).convert('RGB').resize((OW,OH), Image.LANCZOS)

def rmask(labels):
    m = np.isin(seg, [IDS[n] for n in labels])
    return np.asarray(Image.fromarray((m*255).astype('uint8')).resize((OW,OH), Image.LANCZOS)) > 110
SKIN = np.median(A[rmask(['face'])], 0)
print('skin', SKIN.round(3), flush=True)

def poly(pts, blur=1.5):
    m = Image.new('L',(OW,OH),0); ImageDraw.Draw(m).polygon(pts, fill=255)
    return gaussian_filter(np.asarray(m).astype(np.float32)/255., blur)

# --- fingers below the knuckle line become bare skin
FING = [(437,525),(468,518),(500,512),(516,523),(512,556),(488,577),(455,573),(435,549)]
fm  = poly(FING, 1.6)[...,None]
reg = fm[...,0] > 0.45
lum = A.mean(-1)
lo, hi = np.percentile(lum[reg], 8), np.percentile(lum[reg], 92)
t = np.clip((lum-lo)/max(hi-lo, 1e-3), 0, 1)
skin = SKIN[None,None,:]*(0.62 + 0.62*t)[...,None]
A = np.clip(A*(1-fm) + skin*fm, 0, 1)

# knuckle cut edge of the glove
det = Image.new('L',(OW,OH),0); dd = ImageDraw.Draw(det)
dd.line([(435,526),(468,519),(500,513),(517,524)], fill=255, width=3)
dd.line([(452,548),(455,572)], fill=110, width=2)      # finger separations
dd.line([(474,545),(478,574)], fill=110, width=2)
dd.line([(496,540),(500,566)], fill=110, width=2)
D = gaussian_filter(np.asarray(det).astype(np.float32)/255., 0.9)[...,None]
A = np.clip(A*(1-D*0.55), 0, 1)
Image.fromarray((A*255).astype('uint8')).save('finish_guide.png')

cn  = ControlNetModel.from_pretrained('lllyasviel/control_v11p_sd15_lineart', torch_dtype=torch.float32)
vae = AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse', torch_dtype=torch.float32)
pipe = StableDiffusionControlNetImg2ImgPipeline.from_pretrained(
    'SG161222/Realistic_Vision_V6.0_B1_noVAE', controlnet=cn, vae=vae,
    torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)

BOX = (398, 452, 558, 612); x0,y0,x1,y1 = BOX
guide = Image.fromarray((A*255).astype('uint8'))
P = ("close up photo of a hand in a black fingerless leather glove, bare fingers below the knuckles, "
     "skin visible on the fingers, blue jeans behind, soft light, sharp focus, photorealistic, dslr")
N = ("illustration, drawing, cartoon, 3d render, deformed, extra fingers, fused fingers, mutated hand, "
     "blurry, nail polish, watermark, text")
blend = Image.new('L',(OW,OH),0)
ImageDraw.Draw(blend).rounded_rectangle((408,462,548,602), radius=22, fill=255)
blend = blend.crop(BOX).resize((x1-x0,y1-y0), Image.LANCZOS).filter(ImageFilter.GaussianBlur(11))
t0=time.time()
out = pipe(prompt=P, negative_prompt=N,
           image=guide.crop(BOX).resize((512,512), Image.LANCZOS),
           control_image=ctrl.crop(BOX).resize((512,512), Image.LANCZOS),
           strength=0.33, num_inference_steps=24, guidance_scale=7.0,
           controlnet_conditioning_scale=0.30,
           generator=torch.Generator('cpu').manual_seed(9501)).images[0].resize((x1-x0,y1-y0), Image.LANCZOS)
res = guide.copy(); res.paste(out, (x0,y0), blend)
print(f'[{time.time()-t0:6.1f}s] hand harmonised', flush=True)
A = np.asarray(res).astype(np.float32)/255.

# --- clean studio backdrop
figm = binary_dilation(sil, np.ones((3,3)), iterations=12)
lab, n = label(figm)
if n > 1:
    sz = np.bincount(lab.ravel()); sz[0] = 0; figm = lab == sz.argmax()
fig = np.asarray(Image.fromarray((figm*255).astype('uint8')).resize((OW,OH), Image.LANCZOS)) > 110
w = (~fig).astype(np.float32)
bg = gaussian_filter(A*w[...,None], (34,34,0))/np.maximum(gaussian_filter(w, 34), 1e-4)[...,None]
rg = np.random.default_rng(5)
bg = np.clip(bg + (gaussian_filter(rg.standard_normal((OH,OW)), 1.1)*0.030
                 + gaussian_filter(rg.standard_normal((OH,OW)), 11)*0.055)[...,None], 0, 1)
fa = np.clip(gaussian_filter(fig.astype(np.float32), 2.0)*1.25, 0, 1)[...,None]
A = np.clip(A*fa + bg*(1-fa), 0, 1)

final = Image.fromarray((A*255+0.5).astype('uint8'))
final.save('sd_master.png')
final.resize((980,1564), Image.LANCZOS).save('hiperrealista.png')
final.crop((390,440,570,620)).resize((450,450), Image.LANCZOS).save('final_handzoom.png')
print('done', final.size, flush=True)
