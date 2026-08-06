"""Upscale pass + localised detail passes on face and both hands."""
import sys, time, numpy as np, torch
from PIL import Image, ImageDraw, ImageFilter
torch.set_num_threads(4)
from diffusers import (StableDiffusionControlNetImg2ImgPipeline, ControlNetModel,
                       AutoencoderKL, UniPCMultistepScheduler)

cn  = ControlNetModel.from_pretrained('lllyasviel/control_v11p_sd15_lineart', torch_dtype=torch.float32)
vae = AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse', torch_dtype=torch.float32)
pipe = StableDiffusionControlNetImg2ImgPipeline.from_pretrained(
    'SG161222/Realistic_Vision_V6.0_B1_noVAE', controlnet=cn, vae=vae,
    torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
print('models loaded', flush=True)

CROP = (40, 22, 1020, 1586)
ink_full = np.load('ink2.npy')[CROP[1]:CROP[3], CROP[0]:CROP[2]]
CW, CH = 980, 1564
ctrl_full = Image.fromarray((np.clip((ink_full-0.12)/0.62,0,1)*255).astype('uint8')).convert('RGB')

NEG = ("illustration, drawing, sketch, cartoon, anime, painting, 3d render, deformed, bad anatomy, "
 "extra fingers, fused fingers, mutated hands, poorly drawn face, blurry, lowres, watermark, "
 "text, oversaturated, plastic skin")

def run(init, control, prompt, strength, steps, cscale, seed, neg=None):
    return pipe(prompt=prompt, negative_prompt=neg or NEG, image=init, control_image=control,
                strength=strength, num_inference_steps=steps, guidance_scale=6.5,
                controlnet_conditioning_scale=cscale,
                generator=torch.Generator('cpu').manual_seed(seed)).images[0]

def snap8(v): return int(round(v/8)*8)

def detail(img, box, prompt, strength=0.42, steps=20, cscale=0.75, size=512, feather=26, seed=7, neg=None):
    """img2img a crop at higher effective resolution, then blend it back."""
    x0,y0,x1,y1 = box
    crop = img.crop(box).resize((size,size), Image.LANCZOS)
    cctl = ctrl_full.crop((int(x0*CW/img.width), int(y0*CH/img.height),
                           int(x1*CW/img.width), int(y1*CH/img.height))).resize((size,size), Image.LANCZOS)
    out  = run(crop, cctl, prompt, strength, steps, cscale, seed, neg).resize((x1-x0, y1-y0), Image.LANCZOS)
    mask = Image.new('L', (x1-x0, y1-y0), 0)
    ImageDraw.Draw(mask).rectangle([feather,feather,(x1-x0)-feather,(y1-y0)-feather], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather*0.6))
    base = img.copy(); base.paste(out, (x0,y0), mask)
    return base

PROMPT = ("RAW full body studio photo of a young man on a plain grey backdrop, olive green field "
 "jacket, white t-shirt, dog tags, black fingerless leather gloves, brown belt, baggy blue jeans, "
 "black sneakers, canvas bag on his shoulder, 85mm, detailed skin and fabric texture, "
 "photorealistic, dslr, film grain")

t0 = time.time()
base = Image.open('sd_base.png').convert('RGB')
UW, UH = snap8(base.width*1.5), snap8(base.height*1.5)
up = base.resize((UW, UH), Image.LANCZOS)
img = run(up, ctrl_full.resize((UW,UH), Image.LANCZOS), PROMPT, 0.34, 16, 0.55, 4242)
img.save('sd_up.png'); print(f'[{time.time()-t0:6.1f}s] upscaled to {UW}x{UH}', flush=True)

def px(nx0,ny0,nx1,ny1): return (int(nx0*UW), int(ny0*UH), int(nx1*UW), int(ny1*UH))
FACE = ("RAW close-up portrait of a young man, short messy black hair, looking at the camera, "
 "realistic skin with pores, catchlights in the eyes, soft studio light, sharp focus, "
 "photorealistic, dslr")
HAND = ("RAW close-up of a hand in a black fingerless leather glove cut off at the knuckles, "
 "bare fingers and fingertips exposed, five correct fingers, leather grain, natural skin, "
 "sharp focus, photorealistic, dslr")
HAND_NEG = ("full finger gloves, covered fingertips, mittens, illustration, drawing, cartoon, anime, "
 "3d render, deformed, bad anatomy, extra fingers, fused fingers, missing fingers, mutated hand, "
 "blurry, lowres, watermark, text")

t0 = time.time()
img = detail(img, px(0.30,0.00,0.60,0.17), FACE, 0.40, 20, 0.70, seed=1001)
print(f'[{time.time()-t0:6.1f}s] face pass', flush=True); t0=time.time()
img = detail(img, px(0.16,0.06,0.36,0.20), HAND, 0.60, 22, 0.88, seed=1002, neg=HAND_NEG)
img = detail(img, px(0.47,0.34,0.73,0.53), HAND, 0.62, 22, 0.88, seed=1003, neg=HAND_NEG)
print(f'[{time.time()-t0:6.1f}s] hand passes', flush=True)
img.save('sd_refined.png')
img.resize((980,1564), Image.LANCZOS).save('hiperrealista.png')
print('done', img.size, flush=True)
