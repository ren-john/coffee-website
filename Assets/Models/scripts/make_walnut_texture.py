import numpy as np
from PIL import Image
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'EspressoMachine'/'textures';out.mkdir(parents=True,exist_ok=True)
u,v=np.meshgrid(np.linspace(0,1,512),np.linspace(0,1,1024))
rng=np.random.default_rng(74)
warp=u+.014*np.sin(v*9+u*7)+.008*np.sin(v*19-u*9)
grain=np.sin(warp*320+np.sin(warp*75)*3)
fine=np.sin(warp*1200+v*4)*.1
tone=.95+.15*grain+.09*np.sin(warp*86)+fine+rng.normal(0,.018,u.shape)
rgb=np.stack([105*tone,62*tone,36*tone],axis=-1)
Image.fromarray(np.uint8(np.clip(rgb,0,255))).save(out/'walnut_basecolor.png')
print(out/'walnut_basecolor.png')
