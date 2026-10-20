import bpy, math, json
from pathlib import Path
from mathutils import Vector

def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for c in list(bpy.data.collections):
        if c.name != 'Collection' and c.users == 0: bpy.data.collections.remove(c)
    bpy.context.scene.unit_settings.system='METRIC'

def linear(hexcolor):
    rgb=[int(hexcolor[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)+(1,)

def material(name, color, roughness=.45, metallic=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=linear(color)
    p.inputs['Roughness'].default_value=roughness
    p.inputs['Metallic'].default_value=metallic
    m.diffuse_color=linear(color)
    return m

def mesh(name, vertices, faces, mat, uv=None):
    data=bpy.data.meshes.new(name);data.from_pydata(vertices,[],faces);data.update()
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj)
    if mat: data.materials.append(mat)
    for p in data.polygons:p.use_smooth=True
    if uv:
        layer=data.uv_layers.new(name='UVMap')
        for p,coords in zip(data.polygons,uv):
            for idx,co in zip(p.loop_indices,coords):layer.data[idx].uv=co
    return obj

def bevel_box(name, location, dimensions, mat, radius=.002):
    bpy.ops.mesh.primitive_cube_add(size=1,location=location)
    ob=bpy.context.object;ob.name=name;ob.dimensions=dimensions
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.append(mat)
    mod=ob.modifiers.new('Soft folded edges','BEVEL');mod.width=radius;mod.segments=3
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in ob.data.polygons:p.use_smooth=True
    ob.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return ob

def finish(name, out, objects, target, camera, ortho, notes):
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    # GLB contains only asset geometry, with a stable root at the ground origin.
    bpy.ops.object.select_all(action='DESELECT')
    root=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(root)
    for ob in objects:
        if ob.parent is None:ob.parent=root
        ob.select_set(True)
    root.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
    verts=sum(len(o.data.vertices) for o in objects if o.type=='MESH')
    tris=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects if o.type=='MESH')
    (out/'model-info.json').write_text(json.dumps(dict(name=name,units='meters',vertices=verts,triangles=tris,notes=notes),indent=2))
    # Studio objects are kept in their own collection and excluded from GLB.
    studio=bpy.data.collections.new('STUDIO - preview only');bpy.context.scene.collection.children.link(studio)
    def move(ob):
        for c in list(ob.users_collection):c.objects.unlink(ob)
        studio.objects.link(ob)
    floor=material('Studio warm grey','#ded6ca',.7)
    scale=ortho/.34
    floor_z=min((o.matrix_world @ v.co).z for o in objects if o.type=='MESH' for v in o.data.vertices)-.00005*scale
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,floor_z))
    bpy.context.object.name='Studio floor';bpy.context.object.data.materials.append(floor);move(bpy.context.object)
    bpy.ops.object.camera_add(location=camera)
    cam=bpy.context.object;cam.name='Preview camera';cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.type='ORTHO';cam.data.ortho_scale=ortho;cam.data.clip_start=.0001;bpy.context.scene.camera=cam;move(cam)
    for name,loc,power,size in [('Key',(-.3,-.4,.6),35,.42),('Fill',(.4,-.2,.3),15,.3),('Rim',(.2,.35,.45),45,.3)]:
        bpy.ops.object.light_add(type='AREA',location=tuple(x*scale for x in loc))
        ob=bpy.context.object;ob.name=name;ob.data.energy=power*scale*scale*.15;ob.data.shape='DISK';ob.data.size=size*scale
        ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();move(ob)
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48
    scene.cycles.use_denoising=True
    scene.world.color=(.06,.06,.06)
    scene.render.resolution_x=1200;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
    scene.view_settings.view_transform='AgX'
    scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'preview.png')
    # Pack texture files so each .blend is portable.
    bpy.ops.file.pack_all()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(out/(root.name+'.blend')))
    bpy.ops.render.render(write_still=True)
    print('MODEL_COMPLETE',str(out),verts,tris,flush=True)
