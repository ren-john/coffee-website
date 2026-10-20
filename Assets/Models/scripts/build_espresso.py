import bpy,sys,math
from pathlib import Path
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
from studio import *
from hardware import *
reset()
OUT=Path(__file__).resolve().parents[1]/'EspressoMachine'
black=material('Satin charcoal enamel','#172226',.32,.4)
rubber=material('Black grip and feet','#101819',.53)
steel=material('Brushed steel','#b5bec1',.28,.9)
chrome=material('Polished group head and tubing','#d1d7d9',.14,1)
brass=material('Brass hardware','#b8a47a',.26,.8)
wood=material('Oiled walnut','#693e24',.33)
n=wood.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(OUT/'textures/walnut_basecolor.png'))
wood.node_tree.links.new(n.outputs['Color'],wood.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

def wood_uv(ob):
    if not ob.data.uv_layers:ob.data.uv_layers.new(name='UVMap')
    uv=ob.data.uv_layers.active.data
    for p in ob.data.polygons:
        for li in p.loop_indices:
            co=ob.data.vertices[ob.data.loops[li].vertex_index].co
            u=co.y/.13+.5 if abs(p.normal.x)>.5 else co.x/.12+.5
            uv[li].uv=(u,co.z/.32+.5)

# Broad low base and slim upright boiler enclosure.
bevel_box('Cast foot',(0,-.035,.011),(.22,.285,.018),black,.012)
for x in [-.084,.084]:
    for y in [-.143,.073]:cylinder('Non-slip foot',(x,y,.001),(x,y,.006),.012,rubber,N=24)
bevel_box('Upright boiler housing',(0,.042,.182),(.105,.124,.329),black,.015)
for x in [-.054,.054]:
    panel=bevel_box('Walnut side panel',(x,.042,.18),(.008,.098,.301),wood,.003);wood_uv(panel)
    # Thin dark edge rails frame the inset timber.
    for y in [-.01,.094]:bevel_box('Panel edge rail',(x,y,.18),(.01,.005,.316),black,.001)
bevel_box('Upper support bridge',(0,-.002,.35),(.115,.205,.012),black,.006)
for x in [-.060,.060]:
    cylinder('Side control spindle',(x,.005,.316),(x*1.18,.005,.316),.007,chrome)
    cylinder('Side control cap',(x*1.18,.005,.316),(x*1.24,.005,.316),.009,brass)
# Manual piston and flared group housing.
lathe('Group bell',[(0,.346),(.052,.346),(.058,.35),(.058,.36),(.052,.366),(.035,.386),(.034,.39),(0,.39)],black,center=(0,-.052,0))
lathe('Lever piston cylinder',[(0,.384),(.033,.384),(.034,.39),(.034,.456),(.032,.46),(0,.46)],black,center=(0,-.052,0))
lathe('Piston top cap',[(0,.459),(.033,.459),(.034,.461),(.034,.465),(.031,.467),(0,.467)],black,center=(0,-.052,0))
lathe('Chrome brew group',[(0,.328),(.037,.328),(.041,.331),(.042,.346),(.039,.35),(0,.35)],chrome,center=(0,-.052,0))
lathe('Filter basket rim',[(.029,.326),(.041,.326),(.043,.328),(.042,.332),(.029,.332),(.029,.326)],chrome,center=(0,-.052,0))
# Portafilter handle assembly, separately named and parented.
portroot=bpy.data.objects.new('Portafilter assembly',None);bpy.context.collection.objects.link(portroot);portroot.location=(0,-.052,.332)
before=set(bpy.context.scene.objects)
cylinder('Portafilter steel neck',(0,-.081,.336),(0,-.114,.331),.01,chrome)
grip=cylinder('Walnut portafilter handle',(0,-.111,.331),(0,-.232,.309),.013,wood,r2=.018,N=64)
cylinder('Portafilter end grain cap',(0,-.231,.309),(0,-.235,.3085),.017,wood,N=64)
for ob in set(bpy.context.scene.objects)-before:
    ob.parent=portroot;ob.matrix_parent_inverse=portroot.matrix_world.inverted()
# Twin spouts below the basket.
for x in [-.013,.013]:
    tube('Coffee outlet spout',[(x*.4,-.052,.327),(x,-.052,.316),(x,-.061,.313)],.0035,chrome)
# Exposed rear return tubing, visible above the upper bridge.
for x in [-.02,.02]:tube('Boiler return pipe',[(x,.055,.348),(x,.05,.382),(x,-.012,.384),(x,-.025,.373)],.003,chrome)
# Lever rotates around this named pivot for future animation.
pivot=Vector((0,-.052,.472))
leverroot=bpy.data.objects.new('Lever pivot - animate local X',None);bpy.context.collection.objects.link(leverroot);leverroot.location=pivot
before=set(bpy.context.scene.objects)
for x in [-.013,.013]:bevel_box('Lever clevis ear',(x,-.052,.472),(.009,.025,.03),black,.004)
cylinder('Lever hinge pin',(-.024,-.052,.478),(.024,-.052,.478),.0055,chrome)
start=(0,-.052,.48);end=(0,-.255,.586)
cylinder('Lever steel shaft',start,end,.0055,steel)
direction=(Vector(end)-Vector(start)).normalized()
handle_end=Vector(end)+direction*.11
cylinder('Walnut lever grip',Vector(end)-direction*.007,handle_end,.013,wood,r2=.015,N=64)
cylinder('Lever grip end',handle_end,handle_end+direction*.003,.014,wood,N=64)
for ob in set(bpy.context.scene.objects)-before:
    ob.parent=leverroot;ob.matrix_parent_inverse=leverroot.matrix_world.inverted()
# Steam valve, insulating ribbed elbow and angled wand.
cylinder('Steam valve mount',(.043,-.002,.236),(.064,-.002,.236),.01,chrome)
tube('Steam elbow',[(.06,-.002,.236),(.079,-.025,.239),(.085,-.047,.225)],.006,rubber)
for k in range(7):
    y=-.017-k*.004;z=.237-(k/6)**2*.008
    cylinder('Steam grip rib',(.075,y,z),(.079,y-.002,z-.001),.007,rubber,N=24)
tube('Polished steam wand',[(.084,-.045,.227),(.091,-.062,.211),(.105,-.099,.158),(.108,-.102,.153)],.004,chrome)
cylinder('Steam nozzle',(.106,-.10,.157),(.11,-.106,.145),.0052,chrome)
# Cup pedestal, deep drip bowl and a genuinely perforated metal plate.
lathe('Drip pedestal',[(0,.019),(.031,.019),(.034,.025),(.034,.048),(.029,.053),(0,.053)],chrome,center=(0,-.102,0))
lathe('Drip bowl',[(0,.047),(.028,.047),(.037,.053),(.055,.077),(.061,.082),(.062,.086),(.059,.088),(.054,.082),(.032,.056),(0,.056)],black,center=(0,-.102,0))
plate=cylinder('Perforated stainless drip plate',(0,-.102,.084),(0,-.102,.087),.059,steel,N=96)
cutters=[]
for ring,count in [(0,1),(.011,6),(.023,12),(.035,18),(.047,24)]:
    for k in range(count):
        angle=k*math.tau/count
        bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.0021,depth=.012,location=(ring*math.cos(angle),-.102+ring*math.sin(angle),.086))
        cutters.append(bpy.context.object)
bpy.ops.object.select_all(action='DESELECT')
for ob in cutters:ob.select_set(True)
bpy.context.view_layer.objects.active=cutters[0];bpy.ops.object.join();cutter=bpy.context.object
bpy.context.view_layer.objects.active=plate;mod=plate.modifiers.new('Actual drainage perforations','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
lathe('Drip tray polished edge',[(.058,.086),(.060,.086),(.0605,.088),(.059,.089),(.058,.088),(.058,.086)],chrome,center=(0,-.102,0),N=96)
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']+[portroot,leverroot]
finish('espresso-machine',OUT,objects,(0,-.085,.31),(-.75,-1.05,.74),.76,
       'Reference-guided manual lever espresso machine based on EspressoMachine_1.webp. Charcoal housing, walnut panels and grips, exposed piston and pivot, chrome portafilter, steam wand, perforated drip platform. Lever and portafilter have named pivot assemblies. Approximate proportions; no branded cup or background scenery.')
