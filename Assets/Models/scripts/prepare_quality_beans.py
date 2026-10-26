"""Export matching close-up and pile LODs without modifying the original model."""
import bpy, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/models'
DERIV = ROOT / 'Assets/Models/AnimationReady'

def prepare_quality_beans(render_preview=False):
    DERIV.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=str(ROOT / 'Assets/Models/CoffeeBeans/coffee-bean.blend'))
    bean = bpy.data.objects['Arabica bean - sculpted center crease']
    material = bean.data.materials[0]
    texture_dir = DERIV / 'matte-bean-textures'
    if not (texture_dir / 'bean_roughness.png').exists():
        raise RuntimeError('Run make_bean_textures.py --matte --output Assets/Models/AnimationReady/matte-bean-textures with Python + NumPy/Pillow first.')
    for node in material.node_tree.nodes:
        if node.type == 'TEX_IMAGE' and node.image:
            filename = Path(node.image.filepath).name or node.image.name
            if (texture_dir / filename).is_file():
                node.image = bpy.data.images.load(str(texture_dir / filename), check_existing=False)
                if 'basecolor' not in filename:
                    node.image.colorspace_settings.name = 'Non-Color'
    principled = material.node_tree.nodes.get('Principled BSDF')
    principled.inputs['Specular IOR Level'].default_value = .18
    principled.inputs['IOR'].default_value = 1.38
    principled.inputs['Coat Weight'].default_value = 0
    normal = next(n for n in material.node_tree.nodes if n.type == 'NORMAL_MAP')
    normal.inputs['Strength'].default_value = .65
    # Full-resolution roasted skin with a genuinely rough, dry response.
    original = bean.data.copy()
    bpy.ops.object.select_all(action='DESELECT')
    bean.select_set(True)
    bpy.context.view_layer.objects.active = bean
    manifest = {}
    for filename, ratio in [('bean', .30), ('bean-pile', .028)]:
        bean.data = original.copy()
        modifier = bean.modifiers.new('Preserve curved crease - ' + filename, 'DECIMATE')
        modifier.ratio = ratio
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        for polygon in bean.data.polygons:
            polygon.use_smooth = True
        if filename == 'bean-pile':
            # Runtime reuses the hero material and textures; UVs stay identical.
            bean.data.materials.clear()
        bpy.ops.export_scene.gltf(filepath=str(OUT / (filename + '.glb')),
            export_format='GLB', use_selection=True, export_apply=True,
            export_yup=True, export_texcoords=True, export_normals=True)
        manifest[filename] = {
            'triangles': sum(len(p.vertices) - 2 for p in bean.data.polygons),
            'bytes': (OUT / (filename + '.glb')).stat().st_size,
        }
        if filename == 'bean':
            hero = bean.data.copy()
    bean.data = hero
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(DERIV / 'bean-quality.blend'))
    (DERIV / 'bean-quality.json').write_text(json.dumps(manifest, indent=2))
    if render_preview:
        scene = bpy.context.scene
        scene.render.resolution_x = 960
        scene.render.resolution_y = 960
        scene.cycles.samples = 32
        scene.render.filepath = str(DERIV / 'bean-quality-preview.png')
        bpy.ops.render.render(write_still=True)
    print('QUALITY_BEANS_COMPLETE', json.dumps(manifest), flush=True)

if __name__ == '__main__':
    prepare_quality_beans(render_preview=True)
