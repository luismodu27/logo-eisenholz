"""Photorealistic pass: Stable Diffusion 1.5 + ControlNet lineart, driven by the drawing.

    python3 dibujo/generate.py          # from the repo root

Runs on CPU (~30 min on 4 cores) and downloads ~6 GB of weights on first use.
"""
import os, sys, time, numpy as np, torch
from PIL import Image, ImageDraw, ImageFilter
torch.set_num_threads(os.cpu_count() or 4)
from diffusers import (StableDiffusionControlNetImg2ImgPipeline, ControlNetModel,
                       AutoencoderKL, UniPCMultistepScheduler)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geom

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)))
CROP = (40, 22, 1020, 1586)
SEED = 12345

PROMPT = ("RAW full body studio photo of a young man on a plain grey backdrop, olive green field "
 "jacket, white t-shirt, dog tags, black fingerless leather gloves on both hands, brown leather belt, "
 "baggy blue jeans, black sneakers, canvas bag on his shoulder, soft key light, 85mm, "
 "detailed skin and fabric texture, photorealistic, dslr, film grain")
NEG = ("illustration, drawing, sketch, cartoon, anime, painting, 3d render, indoor room, door, "
 "window, furniture, deformed, bad anatomy, extra fingers, fused fingers, mutated hands, "
 "poorly drawn face, blurry, lowres, watermark, text, oversaturated, plastic skin")
FACE = ("RAW close-up portrait of a young man, short messy black hair, looking at the camera, "
 "realistic skin with pores, catchlights in the eyes, soft studio light, sharp focus, "
 "photorealistic, dslr")
HAND = ("RAW close-up of a man's hand wearing a black fingerless leather glove, bare fingertips, "
 "five correct fingers, leather grain, natural skin, soft studio light, sharp focus, "
 "photorealistic, dslr")

def build():
    cn  = ControlNetModel.from_pretrained('lllyasviel/control_v11p_sd15_lineart', torch_dtype=torch.float32)
    vae = AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse', torch_dtype=torch.float32)
    p = StableDiffusionControlNetImg2ImgPipeline.from_pretrained(
        'SG161222/Realistic_Vision_V6.0_B1_noVAE', controlnet=cn, vae=vae,
        torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
    p.scheduler = UniPCMultistepScheduler.from_config(p.scheduler.config)
    p.set_progress_bar_config(disable=True)
    return p

def main():
    pipe = build()
    ink = geom.load(os.path.join(OUT, 'original.png'))[0][CROP[1]:CROP[3], CROP[0]:CROP[2]]
    ctrl_full = Image.fromarray((np.clip((ink-0.12)/0.62, 0, 1)*255).astype('uint8')).convert('RGB')
    CW, CH = ctrl_full.size

    def run(init, control, prompt, strength, steps, cscale, seed, cfg=6.8):
        return pipe(prompt=prompt, negative_prompt=NEG, image=init, control_image=control,
                    strength=strength, num_inference_steps=steps, guidance_scale=cfg,
                    controlnet_conditioning_scale=cscale,
                    generator=torch.Generator('cpu').manual_seed(seed)).images[0]

    def detail(img, box, prompt, strength, steps, cscale, seed, size=512, feather=26):
        x0, y0, x1, y1 = box
        crop = img.crop(box).resize((size, size), Image.LANCZOS)
        cc = ctrl_full.crop((int(x0*CW/img.width), int(y0*CH/img.height),
                             int(x1*CW/img.width), int(y1*CH/img.height))).resize((size, size), Image.LANCZOS)
        out = run(crop, cc, prompt, strength, steps, cscale, seed).resize((x1-x0, y1-y0), Image.LANCZOS)
        mask = Image.new('L', (x1-x0, y1-y0), 0)
        ImageDraw.Draw(mask).rectangle([feather, feather, (x1-x0)-feather, (y1-y0)-feather], fill=255)
        base = img.copy(); base.paste(out, (x0, y0), mask.filter(ImageFilter.GaussianBlur(feather*0.6)))
        return base

    W, Hh = 512, 816
    init = Image.open(os.path.join(OUT, 'version-render.png')).convert('RGB').resize((W, Hh), Image.LANCZOS)
    t = time.time()
    img = run(init, ctrl_full.resize((W, Hh), Image.LANCZOS), PROMPT, 0.80, 26, 0.90, SEED, 7.0)
    print(f'[{time.time()-t:6.1f}s] base {W}x{Hh}', flush=True)

    snap8 = lambda v: int(round(v/8)*8)
    UW, UH = snap8(W*1.5), snap8(Hh*1.5)
    t = time.time()
    img = run(img.resize((UW, UH), Image.LANCZOS), ctrl_full.resize((UW, UH), Image.LANCZOS),
              PROMPT, 0.34, 16, 0.55, SEED+1)
    print(f'[{time.time()-t:6.1f}s] upscale {UW}x{UH}', flush=True)

    px = lambda a, b, c, d: (int(a*UW), int(b*UH), int(c*UW), int(d*UH))
    for box, pr, st, sd in ((px(0.30, 0.00, 0.60, 0.17), FACE, 0.40, SEED+2),
                            (px(0.16, 0.06, 0.36, 0.20), HAND, 0.44, SEED+3),
                            (px(0.48, 0.33, 0.72, 0.52), HAND, 0.46, SEED+4)):
        t = time.time()
        img = detail(img, box, pr, st, 18, 0.78, sd)
        print(f'[{time.time()-t:6.1f}s] detail pass', flush=True)

    final = img.resize((980, 1564), Image.LANCZOS)
    final.save(os.path.join(OUT, 'version-hiperrealista.png'))
    final.save(os.path.join(OUT, 'version-hiperrealista.jpg'), quality=95, subsampling=0)
    print('done', final.size)

if __name__ == '__main__':
    main()
