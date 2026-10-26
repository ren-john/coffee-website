import bpy, sys, math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from studio import *
reset()
OUT=Path(__file__).resolve().parents[1]/'CoffeePackaging'
paper=material('Printed matte paper - brown #733E24 and deep burgundy','#733e24',.82)
tex=paper.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(OUT/'textures/packaging_basecolor.png'))
paper.node_tree.links.new(tex.outputs['Color'],paper.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
ivory=material('Folded paper - brown #733E24','#733e24',.84)
wine=material('Seal - deep burgundy #300916','#300916',.8)
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
# Use the original JPEG directly. A circular UV window keeps the seal intact,
# including its cream border; no raster redraw or recoloring is involved.
logo_mat=material('MR BEAN 2026 - supplied logo, matte print','#fff9ef',.88)
logo_tex=logo_mat.node_tree.nodes.new('ShaderNodeTexImage')
logo_tex.image=bpy.data.images.load(str(OUT.parents[1]/'MR BEAN - LOGO - 2026 (1).jpeg'))
logo_mat.node_tree.links.new(logo_tex.outputs['Color'],logo_mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
def logo_point(a,b):
    x=.029*a; t=(.182+.029*b-.003)/H
    lo,hi=.25,.75
    for _ in range(28):
        u=(lo+hi)/2
        if surface(u,t)[0]<x:lo=u
        else:hi=u
    px,py,pz=surface((lo+hi)/2,t)
    return (px,py-.00012,pz)
def logo_uv(a,b):return ((586+426*a)/1149,1-(455-426*b)/912)
lv=[logo_point(0,0)];luv=[logo_uv(0,0)];lf=[]
rings,segments=12,96
for r in range(1,rings+1):
    for i in range(segments):
        angle=2*math.pi*i/segments;a=r/rings*math.cos(angle);b=r/rings*math.sin(angle)
        lv.append(logo_point(a,b));luv.append(logo_uv(a,b))
for i in range(segments):lf.append((0,1+i,1+(i+1)%segments))
for r in range(1,rings):
    lower=1+(r-1)*segments;upper=1+r*segments
    for i in range(segments):
        k=(i+1)%segments;lf.append((lower+i,upper+i,upper+k,lower+k))
logo=mesh('MR BEAN 2026 logo',lv,lf,logo_mat,[tuple(luv[i] for i in f) for f in lf])
# A folded-over top with a thin darker underside, as in the paper bag references.
fold=bevel_box('Rolled top closure',(0,-.001,.237),(.145,.012,.012),ivory,.0025)
lip=bevel_box('Burgundy closure edge',(0,-.0068,.2325),(.14,.0015,.002),wine,.0005)
objects=[body,fold,lip,logo]
finish('coffee-packaging',OUT,objects,(0,0,.122),(.32,-.64,.32),.323,
       'Supplied MR BEAN 2026 logo mapped to a curved matte badge. Pouch shape inspired by CoffeePackaging_1-3.jpg; brown paper #733E24, deep burgundy #300916, cream lettering #FFF9EF. Approximately 150 x 76 x 243 mm. Authored geometry, not photogrammetric reconstruction.')
