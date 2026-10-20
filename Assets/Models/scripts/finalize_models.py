"""Verify GLB round trips and prepare usable opening views in the source files."""
import bpy, json, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
assets=[('CoffeePackaging','coffee-packaging'),('CoffeeBeans','coffee-bean'),('CoffeeCup','coffee-cup'),('CoffeeGrinder','coffee-grinder'),('EspressoMachine','espresso-machine')]
requested=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if requested:assets=[item for item in assets if item[1] in requested]
report=ROOT/'round-trip-validation.json'
records=json.loads(report.read_text()) if requested and report.exists() else []
records=[r for r in records if r['model'] not in [name for folder,name in assets]]
for folder,name in assets:
    out=ROOT/folder
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(out/(name+'.glb')))
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    assert meshes and all(o.data.materials for o in meshes)
    assert not any(o.type in {'LIGHT','CAMERA'} for o in bpy.context.scene.objects)
    points=[o.matrix_world @ Vector(v) for o in meshes for v in o.bound_box]
    dimensions=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
    for im in bpy.data.images:
        if im.name not in {'Render Result','Viewer Node'}:
            # Blender lazily decodes embedded images; requesting pixels loads it.
            assert len(im.pixels)>0 and im.size[0]>0, (im.name,im.filepath, bool(im.packed_file))
    records.append({'model':name,'imported_meshes':len(meshes),'dimensions_m':dimensions,'round_trip':'passed','studio_excluded_from_glb':True})
    bpy.ops.wm.open_mainfile(filepath=str(out/(name+'.blend')))
    scene=bpy.context.scene;cam=scene.camera
    # The whole asset is available in a named model collection; render fixtures
    # stay hidden in the editing viewport but remain available for rendering.
    root=bpy.data.objects[name]
    models=[o for o in root.children_recursive if o.type=='MESH']
    collection=bpy.data.collections.get('Collection')
    if collection:collection.name='MODEL - '+name
    studio=bpy.data.collections.get('STUDIO - preview only')
    if studio:studio.hide_viewport=True
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True);bpy.context.view_layer.objects.active=root
    points=[o.matrix_world @ Vector(v) for o in models for v in o.bound_box]
    center=Vector(tuple((max(p[i] for p in points)+min(p[i] for p in points))/2 for i in range(3)))
    extent=max(max(p[i] for p in points)-min(p[i] for p in points) for i in range(3))
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                space=area.spaces.active
                space.clip_start=.00001;space.clip_end=100
                space.overlay.show_overlays=False
                space.shading.type='MATERIAL'
                space.region_3d.view_location=center
                space.region_3d.view_distance=extent*2
                space.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
                space.region_3d.view_perspective='PERSP'
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
(ROOT/'round-trip-validation.json').write_text(json.dumps(records,indent=2))
print(json.dumps(records,indent=2))
