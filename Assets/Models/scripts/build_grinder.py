import bpy,sys,math,random
from pathlib import Path
from mathutils import Vector,Euler
sys.path.insert(0,str(Path(__file__).resolve().parent))
from studio import *
from hardware import *
reset();random.seed(488)
OUT=Path(__file__).resolve().parents[1]/'CoffeeGrinder'
black=material('Satin graphite housing','#242628',.32,.3)
rubber=material('Black rubber and polymer','#141515',.5)
steel=material('Brushed stainless steel','#b9bec3',.3,.85)
chrome=material('Polished chrome','#d5d9dc',.16,1)
dark=material('Control markings','#252a2b',.4)
screen=material('LCD glass','#344b4d',.2,.15)
white=material('LCD lettering','#b5d9ce',.4)
led=material('Status light','#b2d74d',.3)
glass=material('Clear hopper acrylic','#fafbff',.08)
p=glass.node_tree.nodes.get('Principled BSDF');p.inputs['Transmission Weight'].default_value=1;p.inputs['IOR'].default_value=1.46
# Base and inset front catch tray.
bevel_box('Rubber foot',(0,.015,.006),(.17,.17,.012),rubber,.008)
lathe('Cast metal base',[(0,.012),(.092,.012),(.101,.018),(.102,.028),(.097,.033),(0,.033)],black,center=(0,.015,0))
bevel_box('Grounds catch tray',(0,-.073,.028),(.17,.13,.012),black,.012)
bevel_box('Catch tray inner surface',(0,-.085,.034),(.145,.095,.002),rubber,.008)
body=lathe('Motor housing with recessed work bay',[(0,.028),(.09,.028),(.094,.037),(.094,.223),(.091,.232),(0,.232)],black,center=(0,.015,0))
cut_box(body,(0,-.074,.13),(.13,.13,.175))
bevel_box('Stainless work bay back',(0,-.009,.132),(.127,.003,.167),steel,.001)
for x in [-.066,.066]:bevel_box('Work bay stainless cheek',(x,-.043,.132),(.004,.068,.167),steel,.001)
# Head and adjustment collar.
lathe('Control head',[(0,.222),(.092,.222),(.097,.226),(.098,.277),(.096,.287),(0,.287)],steel,center=(0,.015,0))
lathe('Adjustment seam',[(0,.287),(.096,.287),(.097,.289),(.097,.292),(0,.292)],rubber,center=(0,.015,0))
lathe('Grind adjustment dial',[(0,.291),(.096,.291),(.098,.295),(.098,.307),(.094,.311),(0,.311)],steel,center=(0,.015,0))
bevel_box('Adjustment pointer',(-.042,-.073,.305),(.008,.022,.019),chrome,.001)
for i in range(11):
    x=(i-5)*.013;y=.015-math.sqrt(.098**2-x*x)-.0005
    text('Grind setting '+str(i),str(i),(x,y,.278),.0042,dark)
    bevel_box('Scale tick',(x,y,.285),(.00045,.0005,.004),dark,.0001)
bevel_box('LCD bezel',(-.017,-.084,.264),(.043,.005,.018),chrome,.002)
bevel_box('LCD screen',(-.017,-.087,.264),(.036,.001,.011),screen,.001)
text('Dose display','08.5 s',(-.017,-.0878,.264),.006,white)
text('Grinder label','GRIND ON DEMAND',(.025,-.081,.25),.0034,dark)
for x in [-.057,.057]:
    y=.015-math.sqrt(.098**2-x*x)
    cylinder('Dose button surround',(x,y,.238),(x,y-.004,.238),.011,chrome)
    cylinder('Dose button',(x,y-.004,.238),(x,y-.005,.238),.008,rubber)
    cylinder('Dose indicator',(x,y-.005,.242),(x,y-.006,.242),.0014,led,N=16)
for x in [-.022,.014]:cylinder('Dose adjustment knob',(x,-.083,.239),(x,-.096,.239),.0055,chrome)
# Chute, fork, basket and removable handle.
cylinder('Ground coffee outlet',(0,-.04,.225),(0,-.075,.177),.013,steel,r2=.011)
for x in [-.031,.031]:
    bevel_box('Portafilter fork',(x,-.069,.12),(.008,.112,.009),chrome,.002)
lathe('Portafilter basket',[(0,.11),(.028,.11),(.032,.115),(.033,.144),(.035,.147),(.035,.151),(.03,.151),(.029,.12),(0,.12)],chrome,center=(0,-.105,0))
grounds=material('Ground coffee','#352016',.95)
lathe('Dose of ground coffee',[(0,.161),(.009,.159),(.02,.153),(.03,.149)],grounds,center=(0,-.105,0),N=48)
cylinder('Portafilter neck',(0,-.13,.128),(0,-.16,.12),.009,chrome)
cylinder('Portafilter grip',(0,-.155,.121),(0,-.254,.092),.013,rubber,r2=.016)
cylinder('Handle end cap',(0,-.253,.092),(0,-.257,.091),.015,black)
# Hopper bayonet and true thin-wall clear funnel.
lathe('Hopper mounting collar',[(0,.31),(.03,.31),(.032,.317),(.032,.337),(.028,.341),(0,.341)],rubber)
cylinder('Hopper lock lever',(-.025,0,.326),(-.043,0,.326),.005,rubber)
profile=[(.025,.337),(.027,.348),(.041,.37),(.056,.399),(.072,.435),(.085,.48),(.091,.513),(.0895,.513),(.0835,.48),(.0705,.435),(.0545,.399),(.0395,.37),(.0255,.348),(.0235,.337),(.025,.337)]
lathe('Transparent acrylic hopper',profile,glass,N=96)
lathe('Hopper lid',[(0,.514),(.089,.514),(.093,.517),(.093,.528),(.09,.532),(.084,.533),(0,.531)],rubber,N=96)
lathe('Hopper lid outer bead',[(.091,.516),(.0935,.516),(.0935,.519),(.091,.519)],black,N=96)
# Many low-poly beans share one mesh rather than hundreds of scene nodes.
beanmats=[material('Roasted beans '+str(i),col,.46) for i,col in enumerate(['#4a2818','#603a23','#352016'])]
vs=[];fs=[];mi=[]
positions=[]
for level in range(8):
    z=.35+level*.0072;r=.025+level*.0037
    count=15+level*4
    for k in range(count):
        a=2*math.pi*(k/count+level*.037);positions.append((r*math.cos(a),r*math.sin(a),z+random.uniform(-.002,.002)))
for k in range(100):
    r=.048*math.sqrt(random.random());a=random.random()*6.283;positions.append((r*math.cos(a),r*math.sin(a),.402+random.uniform(-.002,.002)))
for center in positions:
    base=len(vs);rot=Euler((random.random()*3,random.random()*3,random.random()*6)).to_matrix();m=random.randrange(3)
    N,M=12,8
    for j in range(M+1):
        ph=math.pi*(.015+.97*j/M);s=math.sin(ph)
        for i in range(N):
            t=i*2*math.pi/N;x=.0038*s*math.cos(t);y=.0058*math.cos(ph);z=.0025*s*math.sin(t)
            z-=.0011*math.exp(-(math.cos(t)*s/.15)**2)*max(0,math.sin(t))**8
            vs.append(tuple(Vector(center)+rot@Vector((x,y,z))))
    for j in range(M):
        for i in range(N):fs.append((base+j*N+i,base+j*N+(i+1)%N,base+(j+1)*N+(i+1)%N,base+(j+1)*N+i));mi.append(m)
beans=normals(mesh('Beans inside hopper',vs,fs,beanmats[0]))
for mat in beanmats[1:]:beans.data.materials.append(mat)
for p,m in zip(beans.data.polygons,mi):p.material_index=m
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
finish('coffee-grinder',OUT,objects,(0,-.025,.267),(.69,-1.1,.69),.65,
       'Reference-guided commercial on-demand grinder based on CoffeeGrinder_1.jpg. Dark motor housing, stainless dial and controls, clear tapered hopper with low-poly beans, work bay, fork and portafilter. Approximate dimensions; not an engineering replica. Acrylic uses glTF transmission.')
