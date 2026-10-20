import bpy, bmesh, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/models'
DERIV=ROOT/'Assets/Models/AnimationReady'
DERIV.mkdir(parents=True,exist_ok=True)

def export(name,objects):
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:ob.hide_set(False);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=False,export_yup=True)

bpy.ops.wm.open_mainfile(filepath=str(ROOT/'Assets/Models/CoffeePackaging/coffee-packaging.blend'))
body=bpy.data.objects['Pouch - folded gussets']
bm=bmesh.new();bm.from_mesh(body.data)
caps=[f for f in bm.faces if len(f.verts)>8 and all(v.co.z>.23 for v in f.verts)]
bmesh.ops.delete(bm,geom=caps,context='FACES');bm.to_mesh(body.data);bm.free()
body.shape_key_add(name='Basis');key=body.shape_key_add(name='MouthOpen')
for v in key.data:
    t=max(0,min(1,(v.co.z-.17)/.067));t=t*t*(3-2*t)
    v.co.y+=(-1 if v.co.y<0 else 1)*.022*t
inner=body.copy();inner.data=body.data.copy();bpy.context.collection.objects.link(inner);inner.name='Pouch interior'
inner.scale=(.985,.985,.999)
mat=bpy.data.materials.new('Warm paper interior');mat.diffuse_color=(.53,.39,.26,1);mat.use_nodes=True
mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.53,.39,.26,1)
mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.9
inner.data.materials.clear();inner.data.materials.append(mat)
root=bpy.data.objects['coffee-packaging']
hinge=bpy.data.objects.new('ClosurePivot',None);bpy.context.collection.objects.link(hinge);hinge.parent=root;hinge.location=(0,.005,.237)
bpy.context.view_layer.update()
for name in ['Rolled top closure','Burgundy closure edge']:
    ob=bpy.data.objects[name];world=ob.matrix_world.copy();ob.parent=hinge;ob.matrix_world=world
anchor=bpy.data.objects.new('BeanRelease',None);bpy.context.collection.objects.link(anchor);anchor.parent=root;anchor.location=(0,0,.237)
objects=[root,body,inner,hinge,anchor,bpy.data.objects['Rolled top closure'],bpy.data.objects['Burgundy closure edge']]
export('packaging',objects)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(DERIV/'packaging-openable.blend'))

bpy.ops.wm.open_mainfile(filepath=str(ROOT/'Assets/Models/CoffeeBeans/coffee-bean.blend'))
bean=bpy.data.objects['Arabica bean - sculpted center crease']
bpy.context.view_layer.objects.active=bean
mod=bean.modifiers.new('Flying bean lightweight mesh','DECIMATE');mod.ratio=.045
bpy.ops.object.modifier_apply(modifier=mod.name)
mat=bean.data.materials[0];nodes=mat.node_tree.nodes;p=nodes.get('Principled BSDF')
for socket in ['Normal','Roughness']:
    for link in list(p.inputs[socket].links):mat.node_tree.links.remove(link)
p.inputs['Roughness'].default_value=.48
img=next(n.image for n in nodes if n.type=='TEX_IMAGE' and 'basecolor' in n.image.name)
img.scale(512,512);img.filepath_raw=str(DERIV/'bean-basecolor.png');img.file_format='PNG';img.save();img.reload()
export('bean',[bpy.data.objects['coffee-bean'],bean])
bpy.ops.wm.save_as_mainfile(filepath=str(DERIV/'bean-lightweight.blend'))

bpy.ops.wm.open_mainfile(filepath=str(ROOT/'Assets/Models/CoffeeGrinder/coffee-grinder.blend'))
names=['Portafilter basket','Portafilter neck','Portafilter grip','Handle end cap','Dose of ground coffee']
objects=[]
for name in names:
    ob=bpy.data.objects[name];world=ob.matrix_world.copy();ob.parent=None;ob.matrix_world=world;ob.location-=Vector((0,-.105,.13));objects.append(ob)
export('portafilter',objects)
(DERIV/'README.md').write_text('Animation derivatives: openable pouch with MouthOpen shape key and ClosurePivot; lightweight bean; centered transferable portafilter. Original model sources preserved. Runtime copies are in public/models.\n')
print('STORY_ASSETS_COMPLETE',flush=True)
