"""Regenerate both hands (and clean a backdrop artefact) with masked inpainting."""
import sys, time, numpy as np, torch
from PIL import Image, ImageFilter
torch.set_num_threads(4)
from diffusers import (StableDiffusionControlNetInpaintPipeline, ControlNetModel,
                       AutoencoderKL, UniPCMultistepScheduler)
from scipy.ndimage import binary_dilation
sys.path.insert(0, '.')
import geom
from geom import IDS

cn  = ControlNetModel.from_pretrained('lllyasviel/control_v11p_sd15_lineart', torch_dtype=torch.float32)
vae = AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse', torch_dtype=torch.float32)
pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
    'SG161222/Realistic_Vision_V6.0_B1_noVAE', controlnet=cn, vae=vae,
    torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
print('inpaint pipeline ready', flush=True)

CROP = (40, 22, 1020, 1586)
ink, form, lines, sil, seg = geom.load()
ink  = ink[CROP[1]:CROP[3], CROP[0]:CROP[2]]
seg  = seg[CROP[1]:CROP[3], CROP[0]:CROP[2]]
sil  = sil[CROP[1]:CROP[3], CROP[0]:CROP[2]]

img = Image.open('sd_refined.png').convert('RGB')
OW, OH = img.size
ctrl_full = Image.fromarray((np.clip((ink-0.12)/0.62,0,1)*255).astype('uint8')).convert('RGB').resize((OW,OH), Image.LANCZOS)

def region_mask(labels, grow):
    m = np.isin(seg, [IDS[n] for n in labels])
    m = binary_dilation(m, np.ones((3,3)), iterations=grow)
    return np.asarray(Image.fromarray((m*255).astype('uint8')).resize((OW,OH), Image.LANCZOS)) > 110

def square_box(mask, pad=0.34):
    ys, xs = np.where(mask)
    x0,x1,y0,y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cx, cy = (x0+x1)//2, (y0+y1)//2
    r = int(max(x1-x0, y1-y0)*(0.5+pad))
    x0, y0 = max(0, cx-r), max(0, cy-r)
    x1, y1 = min(OW, cx+r), min(OH, cy+r)
    return (x0, y0, x1, y1)

NEG_HAND = ("full finger gloves, covered fingertips, mittens, long gloves, illustration, drawing, "
 "cartoon, anime, 3d render, deformed, bad anatomy, extra fingers, fused fingers, missing fingers, "
 "mutated hand, blurry, lowres, watermark, text")
P_HAND = ("RAW close-up photo of a hand in a black fingerless leather glove cut off at the knuckles, "
 "bare fingers and fingertips exposed, five correct fingers, leather grain and stitching, "
 "natural skin, sharp focus, photorealistic, dslr")

def inpaint(img, mask_np, prompt, neg, steps=28, cscale=1.0, seed=7, feather=10, cfg=7.5):
    box = square_box(mask_np)
    x0,y0,x1,y1 = box
    crop = img.crop(box).resize((512,512), Image.LANCZOS)
    mimg = Image.fromarray((mask_np[y0:y1, x0:x1]*255).astype('uint8')).resize((512,512), Image.LANCZOS)
    mimg = mimg.filter(ImageFilter.GaussianBlur(feather))
    cctl = ctrl_full.crop(box).resize((512,512), Image.LANCZOS)
    out = pipe(prompt=prompt, negative_prompt=neg, image=crop, mask_image=mimg, control_image=cctl,
               num_inference_steps=steps, guidance_scale=cfg, controlnet_conditioning_scale=cscale,
               generator=torch.Generator('cpu').manual_seed(seed)).images[0]
    out = out.resize((x1-x0, y1-y0), Image.LANCZOS)
    blend = mimg.resize((x1-x0, y1-y0), Image.LANCZOS).filter(ImageFilter.GaussianBlur(6))
    base = img.copy(); base.paste(out, (x0,y0), blend)
    return base, box

t=time.time()
m_r = region_mask(['glove_dn','hand_dn'], 5)
img, b = inpaint(img, m_r, P_HAND, NEG_HAND, seed=2201)
print(f'[{time.time()-t:6.1f}s] right hand inpainted {b}', flush=True)

t=time.time()
m_l = region_mask(['glove_up','hand_up'], 5)
img, b = inpaint(img, m_l, P_HAND, NEG_HAND, seed=2202)
print(f'[{time.time()-t:6.1f}s] left hand inpainted {b}', flush=True)

# clean the smeared backdrop left of the raised arm
t=time.time()
bgm = np.zeros((OH,OW), bool)
bgm[int(0.05*OH):int(0.24*OH), int(0.10*OW):int(0.36*OW)] = True
figure = np.asarray(Image.fromarray((binary_dilation(sil, np.ones((3,3)), iterations=7)*255)
                                    .astype('uint8')).resize((OW,OH), Image.LANCZOS)) > 110
bgm &= ~figure
if bgm.sum() > 500:
    img, b = inpaint(img, bgm, "plain smooth grey studio backdrop, soft even light, photographic",
                     "person, hand, arm, object, texture, pattern, text, watermark",
                     steps=20, cscale=0.2, seed=2203, feather=16, cfg=6.0)
    print(f'[{time.time()-t:6.1f}s] backdrop cleaned {b}', flush=True)

img.save('sd_hands.png')
img.resize((980,1564), Image.LANCZOS).save('hiperrealista.png')
print('done', img.size, flush=True)
