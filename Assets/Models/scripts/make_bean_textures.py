from pathlib import Path
import numpy as np
from PIL import Image
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--output', type=Path)
parser.add_argument('--matte', action='store_true')
args=parser.parse_args()
OUT=args.output or Path(__file__).resolve().parents[1]/'CoffeeBeans'/'textures'
OUT.mkdir(parents=True,exist_ok=True)
S=1024
u,v=np.meshgrid(np.linspace(0,1,S),np.linspace(1,0,S))
th=u*2*np.pi;ph=v*np.pi
rng=np.random.default_rng(488)
def field(count,low,high):
    out=np.zeros((S,S))
    for k in range(count):
        a=int(rng.integers(low,high));b=int(rng.integers(low,high))
        out+=np.sin(a*th+b*ph+rng.uniform(0,6.28))
    return out/np.sqrt(count)
broad=field(16,2,12);skin=field(24,35,110);fine=field(20,140,330)
x=np.cos(th)*np.sin(ph)
top=np.maximum(0,np.sin(th))
groove=np.exp(-(x/.085)**2)*top**12*np.sin(ph)**.5
chaff=(np.abs(x+.012*np.sin(ph*19)+.005*np.sin(ph*81))<(.012+.004*np.sin(ph*43))) & (top>.9) & (np.sin(ph)>.35)
chaff &= (skin>-.65)
cracks=np.clip((-.8-skin)*.18,0,.32)
tone=np.clip(1+broad*.10+skin*.045+fine*.022-cracks,.5,1.4)
roast=(78,39,22) if args.matte else (108,58,33)
base=np.stack([channel*tone for channel in roast],axis=-1)
base*=1-.60*groove[:,:,None]
base[chaff]=np.stack([159+skin[chaff]*10,112+skin[chaff]*8,64+skin[chaff]*5],axis=-1)
Image.fromarray(np.uint8(np.clip(base,0,255))).save(OUT/'bean_basecolor.png')
rough=np.clip(.87+broad*.035+skin*.035+groove*.10,.77,.98) if args.matte else np.clip(.43+broad*.035+skin*.025+groove*.22,.3,.8)
Image.fromarray(np.uint8(rough*255)).save(OUT/'bean_roughness.png')
# Tangent-space normal map: tiny irregular wrinkles and pits, portable to glTF.
height=skin*.35+fine*.11+cracks*2
dy,dx=np.gradient(height)
nx=-dx*.8;ny=dy*.8;nz=np.ones_like(nx)
norm=np.sqrt(nx*nx+ny*ny+nz*nz)
normal=np.stack([nx/norm,ny/norm,nz/norm],axis=-1)*.5+.5
Image.fromarray(np.uint8(np.clip(normal*255,0,255))).save(OUT/'bean_normal.png')
print('Bean base color, roughness and tangent normal textures created.')
