import os, sys, time, numpy as np, torch
from PIL import Image
torch.set_num_threads(4)
from diffusers import (StableDiffusionControlNetImg2ImgPipeline, ControlNetModel,
                       AutoencoderKL, UniPCMultistepScheduler)

SMOKE = '--smoke' in sys.argv
W, Hh = (384, 608) if SMOKE else (512, 816)
STEPS = 8 if SMOKE else 26

t0 = time.time()
cn  = ControlNetModel.from_pretrained('lllyasviel/control_v11p_sd15_lineart', torch_dtype=torch.float32)
vae = AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse', torch_dtype=torch.float32)
pipe = StableDiffusionControlNetImg2ImgPipeline.from_pretrained(
    'SG161222/Realistic_Vision_V6.0_B1_noVAE', controlnet=cn, vae=vae,
    torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
print(f'[{time.time()-t0:6.1f}s] models loaded', flush=True)

CROP = (40, 22, 1020, 1586)
ink  = np.load('ink2.npy')[CROP[1]:CROP[3], CROP[0]:CROP[2]]
ctrl = np.clip((ink-0.12)/0.62, 0, 1)                       # white lines on black
control = Image.fromarray((ctrl*255).astype('uint8')).convert('RGB').resize((W,Hh), Image.LANCZOS)
init    = Image.open('real.png').convert('RGB').resize((W,Hh), Image.LANCZOS)
control.save('ctrl_preview.png')

PROMPT = ("RAW full body studio photo of a young man on a plain grey backdrop, olive green field "
 "jacket, white t-shirt, dog tags, black fingerless leather gloves on both hands, brown leather belt, "
 "baggy blue jeans, black sneakers, canvas bag on his shoulder, soft key light, 85mm, "
 "detailed skin and fabric texture, photorealistic, dslr, film grain")
NEG = ("illustration, drawing, sketch, cartoon, anime, painting, 3d render, indoor room, door, "
 "window, furniture, deformed, bad anatomy, extra fingers, fused fingers, mutated hands, "
 "poorly drawn face, blurry, lowres, watermark, text, oversaturated, plastic skin")

t0 = time.time()
img = pipe(prompt=PROMPT, negative_prompt=NEG, image=init, control_image=control,
           strength=0.80, num_inference_steps=STEPS, guidance_scale=7.0,
           controlnet_conditioning_scale=0.90,
           generator=torch.Generator('cpu').manual_seed(12345)).images[0]
img.save('sd_smoke.png' if SMOKE else 'sd_base.png')
print(f'[{time.time()-t0:6.1f}s] {STEPS} steps at {W}x{Hh} -> {"sd_smoke.png" if SMOKE else "sd_base.png"}', flush=True)
