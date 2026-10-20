import bpy, sys, math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from studio import *
reset()
OUT=Path(__file__).resolve().parents[1]/'CoffeePackaging'
paper=material('Printed matte paper - HTML cream and burgundy','#fff9ef',.72)
tex=paper.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(OUT/'textures/packaging_basecolor.png'))
paper.node_tree.links.new(tex.outputs['Color'],paper.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
ivory=material('Folded paper - cream #FFF9EF','#fff9ef',.74)
wine=material('Seal - burgundy #651F2B','#651f2b',.68)
N,Z,H=128,72,.234
def interp(t,points):
    for (a,x),(b,y) in zip(points,points[1:]):
        if t<=b:
            f=(t-a)/(b-a);f=f*f*(3-2*f);return x+(y-x)*f
    return points[-1][1]
def surface(u,t):
    theta=2*math.pi*(u-.5)
    s,c=math.sin(theta),math.cos(theta)
    w=interp(t,[(0,.064),(.06,.072),(.2,.075),(.65,.072),(.88,.069),(1,.071)])
    depth=interp(t,[(0,.027),(.08,.037),(.35,.038),(.65,.031),(.84,.016),(1,.004)])
    x=w*math.copysign(abs(s)**.52,s)
    y=-depth*math.copysign(abs(c)**.52,c)
    # Side gussets pull inward, most visibly near top and bottom folds.
    side=abs(s)**18
    x*=1-side*(.09+.16*t**5+.10*math.exp(-((t-.08)/.06)**2))
    wrinkle=(.0005*math.sin(t*42+theta*13)+.00024*math.sin(t*87-theta*19))
    wrinkle*=math.sin(math.pi*t)**.6*(.25+.75*abs(s)**3)
    y+=math.copysign(wrinkle,c)
    z=.003+H*t+.0007*math.sin(theta*5)*math.sin(math.pi*t)
    return x,y,z
vs=[surface(i/N,j/Z) for j in range(Z+1) for i in range(N)]
fs=[];uv=[]
def tex_u(i):
    u=i/N;theta=2*math.pi*(u-.5)
    s=math.copysign(abs(math.sin(theta))**.52,math.sin(theta))
    if .25<=u<=.75: return .5+.25*s
    if u<.25: return -.25*s
    return 1-.25*s
for j in range(Z):
    for i in range(N):
        k=(i+1)%N
        fs.append((j*N+i,j*N+k,(j+1)*N+k,(j+1)*N+i))
        uv.append(((tex_u(i),j/Z),(tex_u(i+1),j/Z),(tex_u(i+1),(j+1)/Z),(tex_u(i),(j+1)/Z)))
fs.extend([tuple(reversed(range(N))),tuple(Z*N+i for i in range(N))])
uv.extend([tuple((i/N,0) for i in reversed(range(N))),tuple((i/N,1) for i in range(N))])
body=mesh('Pouch - folded gussets',vs,fs,paper,uv)
# A folded-over top with a thin darker underside, as in the paper bag references.
fold=bevel_box('Rolled top closure',(0,-.001,.237),(.145,.012,.012),ivory,.0025)
lip=bevel_box('Burgundy closure edge',(0,-.0068,.2325),(.14,.0015,.002),wine,.0005)
objects=[body,fold,lip]
finish('coffee-packaging',OUT,objects,(0,0,.122),(.32,-.64,.32),.323,
       'Original Mr. Bean artwork. Pouch shape inspired by CoffeePackaging_1-3.jpg; HTML palette #FFF9EF, #480817, #651F2B. Approximately 150 x 76 x 243 mm. Geometry and artwork are authored, not photogrammetric reconstruction.')
