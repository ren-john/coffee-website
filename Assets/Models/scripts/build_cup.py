import bpy,sys,math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from studio import *
reset()
OUT=Path(__file__).resolve().parents[1]/'CoffeeCup'
ceramic=material('Glazed ivory porcelain','#fff9ef',.18)
ceramic.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.28
wine=material('Burgundy enamel accent','#480817',.23)
coffee=material('Fresh espresso','#241007',.18)
coffee.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.3
crema=material('Crema at the meniscus','#a96f32',.42)

def smooth_profile(points,steps=4):
    result=[]
    for i in range(len(points)-1):
        p0,p1,p2,p3=points[max(i-1,0)],points[i],points[i+1],points[min(i+2,len(points)-1)]
        for k in range(steps):
            t=k/steps
            co=tuple(.5*((2*p1[a])+(-p0[a]+p2[a])*t+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*t*t+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*t*t*t) for a in (0,1))
            result.append((max(0,co[0]),co[1]))
    return result+[points[-1]]

def lathe(name,profile,mat,N=128,smooth=True):
    profile=smooth_profile(profile) if smooth else profile
    verts=[];rings=[]
    for r,z in profile:
        if r<1e-8:
            rings.append([len(verts)]);verts.append((0,0,z))
        else:
            rings.append(list(range(len(verts),len(verts)+N)))
            verts.extend((r*math.cos(i*2*math.pi/N),r*math.sin(i*2*math.pi/N),z) for i in range(N))
    faces=[]
    for a,b in zip(rings,rings[1:]):
        if len(a)==len(b)==1:continue
        for i in range(N):
            k=(i+1)%N
            if len(a)==1:faces.append((a[0],b[k],b[i]))
            elif len(b)==1:faces.append((a[i],a[k],b[0]))
            else:faces.append((a[i],a[k],b[k],b[i]))
    return mesh(name,verts,faces,mat)

# A continuous cross section includes the underside, foot, exterior, rounded lip,
# inner wall and interior floor. The cup remains hollow if coffee is hidden.
cup=lathe('Cup - solid ceramic walls and hollow interior',[
 (0,.009),(.020,.009),(.025,.009),(.026,.010),(.0265,.013),
 (.029,.018),(.032,.024),(.035,.033),(.038,.045),(.040,.059),
 (.0414,.075),(.042,.0855),(.0419,.0875),(.0411,.0887),(.0398,.089),
 (.0387,.0885),(.0382,.0874),(.0381,.0845),(.0376,.073),(.0362,.058),
 (.034,.045),(.0305,.033),(.026,.024),(.019,.0195),(.008,.0185),(0,.0185)
 ],ceramic)
saucer=lathe('Saucer - recessed well and raised rim',[
 (0,.003),(.025,.003),(.028,.002),(.030,.001),(.035,.001),(.037,.0025),
 (.048,.004),(.060,.006),(.070,.009),(.074,.011),(.075,.0125),
 (.0745,.014),(.073,.0145),(.069,.0135),(.060,.011),(.049,.008),
 (.039,.0065),(.033,.0065),(.030,.0075),(.027,.008),(.018,.008),(0,.008)
 ],ceramic)

# Smooth swept oval handle, intersecting the cup wall at both attachments.
verts=[];faces=[];K,N=80,24
for j in range(K+1):
    t=-math.pi/2+math.pi*j/K
    x=.0375+.028*math.cos(t);z=.054+.027*math.sin(t)
    tx=-.028*math.sin(t);tz=.027*math.cos(t);ln=math.hypot(tx,tz)
    nx,nz=tz/ln,-tx/ln
    thickness=.0048+.0009*abs(math.sin(t))**8
    for i in range(N):
        a=2*math.pi*i/N
        verts.append((x+nx*thickness*math.cos(a),thickness*.86*math.sin(a),z+nz*thickness*math.cos(a)))
for j in range(K):
    for i in range(N):faces.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
faces.extend([tuple(reversed(range(N))),tuple(K*N+i for i in range(N))])
handle=mesh('Handle - rounded porcelain loop',verts,faces,ceramic);handle.parent=cup
band=lathe('Cup rim - fine burgundy enamel',[(.04204,.0849),(.04209,.0851),(.04213,.0857),(.04203,.086),(.04204,.0849)],wine,smooth=False)
band.parent=cup
saucerband=lathe('Saucer - burgundy pinstripe',[(.0711,.01407),(.0719,.01428)],wine,smooth=False)
saucerband.parent=saucer

# Separate filled coffee surface with a shallow meniscus.
liquid=lathe('Coffee - removable liquid surface',[(0,.0796),(.032,.0796),(.036,.0797),(.0379,.0802),(.038,.0804)],coffee)
liquid.parent=cup
verts=[];faces=[];N=192
for row in range(2):
    for i in range(N):
        t=i*2*math.pi/N
        r=(.03715+.00032*math.sin(t*11)+.00011*math.sin(t*31)) if row==0 else .03793
        z=.07985+(r-.037)/.001*.00045
        verts.append((r*math.cos(t),r*math.sin(t),z))
for i in range(N):faces.append((i,(i+1)%N,N+(i+1)%N,N+i))
foam=mesh('Coffee - delicate crema edge',verts,faces,crema);foam.parent=cup
objects=[cup,handle,band,liquid,foam,saucer,saucerband]
# Ensure normals point outward; the surface-only coffee disks point up.
for ob in objects:
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
finish('coffee-cup',OUT,objects,(0,0,.043),(.19,-.32,.22),.205,
       'Ivory ceramic cup inspired by CoffeeCup_1-2.jpg, with a thin burgundy enamel accent. Approximately 84 mm rim diameter, 80 mm cup height; 150 mm saucer diameter. Cup, handle, saucer, coffee and crema remain named parts. Hide coffee to reveal real hollow interior. No spoon or loose beans included.')
