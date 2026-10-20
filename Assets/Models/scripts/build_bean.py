import bpy,sys,math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from studio import *
reset()
OUT=Path(__file__).resolve().parents[1]/'CoffeeBeans'
mat=material('Roasted arabica - textured skin','#6c3a21',.43)
nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes.get('Principled BSDF')
for file,socket in [('bean_basecolor.png','Base Color'),('bean_roughness.png','Roughness')]:
    n=nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(OUT/'textures'/file))
    if socket=='Roughness':n.image.colorspace_settings.name='Non-Color'
    links.new(n.outputs['Color'],p.inputs[socket])
n=nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(OUT/'textures/bean_normal.png'));n.image.colorspace_settings.name='Non-Color'
normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.55
links.new(n.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],p.inputs['Normal'])
N,M=128,80
def pos(i,j):
    th=i/N*2*math.pi;ph=j/M*math.pi
    s=math.sin(ph);y=.0062*math.cos(ph)
    top=max(0,math.sin(th))
    base_x=math.cos(th)*s
    x=.0041*base_x*(1+.065*math.sin(ph*2+.5))
    x+=.00029*math.sin(y*510+.3)*s*top**4
    groove=math.exp(-(base_x/.085)**2)*top**12*s**.5
    z=.0028+.00265*math.sin(th)*s-.00155*groove
    z+=.000045*math.sin(th*19+ph*31)*math.sin(ph*7+th*11)*s
    y+=.00012*math.sin(th*3)*s*s
    return x,y,z
vs=[pos(0,0)]+[pos(i,j) for j in range(1,M) for i in range(N)]+[pos(0,M)]
fs=[];uv=[]
def ix(i,j):return 1+(j-1)*N+i%N
for i in range(N):
    fs.append((0,ix(i+1,1),ix(i,1)))
    uv.append((((i+.5)/N,0),((i+1)/N,1/M),(i/N,1/M)))
for j in range(1,M-1):
    for i in range(N):
        fs.append((ix(i,j),ix(i+1,j),ix(i+1,j+1),ix(i,j+1)))
        uv.append(((i/N,j/M),((i+1)/N,j/M),((i+1)/N,(j+1)/M),(i/N,(j+1)/M)))
for i in range(N):
    fs.append((ix(i,M-1),ix(i+1,M-1),len(vs)-1))
    uv.append(((i/N,(M-1)/M),((i+1)/N,(M-1)/M),((i+.5)/N,1)))
ob=mesh('Arabica bean - sculpted center crease',vs,fs,mat,uv)
# Recalculate the closed mesh normals consistently outward.
bpy.context.view_layer.objects.active=ob;ob.select_set(True)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
finish('coffee-bean',OUT,[ob],(0,0,.0027),(.013,-.018,.022),.0175,
       'One reusable roasted arabica bean, approximately 8 x 12.4 x 5.5 mm. Sculpted curved crease, asymmetry, chaff flecks, embedded base-color, roughness and normal maps. Inspired by CoffeeBeans_1-3.jpg.')
