# Mr. Bean coffee models

Five original, reference-guided 3D assets, completed in order: packaging, bean, cup, grinder, espresso machine.

| Asset | Editable source | Web asset | Preview |
| --- | --- | --- | --- |
| Coffee packaging | CoffeePackaging/coffee-packaging.blend | CoffeePackaging/coffee-packaging.glb | CoffeePackaging/preview.png |
| One coffee bean | CoffeeBeans/coffee-bean.blend | CoffeeBeans/coffee-bean.glb | CoffeeBeans/preview.png |
| Coffee cup and saucer | CoffeeCup/coffee-cup.blend | CoffeeCup/coffee-cup.glb | CoffeeCup/preview.png |
| Coffee grinder | CoffeeGrinder/coffee-grinder.blend | CoffeeGrinder/coffee-grinder.glb | CoffeeGrinder/preview.png |
| Manual lever espresso machine | EspressoMachine/espresso-machine.blend | EspressoMachine/espresso-machine.glb | EspressoMachine/preview.png |

## Design

- Packaging: folded paper pouch with side gussets and a rolled top, inspired by all three packaging references. Original Mr. Bean / Dawn Blend label uses the supplied HTML palette: cream `#FFF9EF`, burgundy `#480817`, and burgundy container `#651F2B`. The product name, flavor notes, and weight are editable design text from the supplied storefront concept.
- Bean: one reusable roasted arabica bean, with an asymmetric profile, sculpted center crease, chaff flecks, and generated color, roughness, and tangent-space normal textures. Duplicate or instance it for a group of beans.
- Cup: glazed ivory ceramic with a burgundy rim, inspired primarily by CoffeeCup_1.jpg and CoffeeCup_2.jpg. Includes a hollow interior, rounded handle, removable coffee/crema surfaces, and a saucer. The wooden finish and floating objects in CoffeeCup_3.jpg were not used.
- Grinder: commercial on-demand design based on CoffeeGrinder_1.jpg, with dark motor housing, a recessed stainless work bay, grind adjustment dial, dose controls, portafilter, clear hopper and a combined mesh of low-poly beans. Original reference proportions and materials guide the model; third-party logos are omitted.
- Espresso machine: manual lever design based on EspressoMachine_1.webp, with charcoal enamel, walnut panels and grips, chrome hardware, a steam wand, and actual holes in its drip plate. The reference's cup and surrounding room are excluded.
- These are authored approximations guided by the photos, not scans or exact dimensional reconstructions. No third-party model downloads or copied photo labels were used.

## Using the files

- GLBs contain only model geometry and materials. Packaging and bean textures are embedded; no external texture files are required at runtime.
- Blender sources include packed textures and a separate `STUDIO - preview only` collection with camera, lighting, and floor. This collection is hidden in the editing viewport but remains enabled for rendering.
- Models use meters. GLB export uses Y up; Blender uses Z up. The bean is intentionally much smaller than the pouch and cup.
- The cup's handle, enamel rim, coffee, and crema are children of the cup body; the saucer and its pinstripe form a separate assembly. Animate the cup body to move its contents and handle together, or animate the root to move the entire asset.
- Hide the two coffee parts to inspect the empty cup. Duplicate the bean via instancing for a later website animation.
- Models are static and ready for animation; this task did not implement website code or animation clips.
- The bean has detailed textures and about 20k triangles. For a large mobile particle scene, create a lower-detail version and use instancing as part of website integration.
- The grinder's acrylic uses `KHR_materials_transmission` and should be displayed with a compatible glTF renderer and environment lighting. The grinder contains about 87k triangles including its beans; the espresso machine contains about 27k triangles.
- The espresso machine's `Lever pivot - animate local X` empty provides a pivot for its lever. `Portafilter assembly` groups the wooden handle and steel neck. These are static transform groups, with no animation clips included. The walnut image is embedded in the GLB and packed into the Blender source.

## Validation

Each GLB has structural checks in its `validation.json`: correct GLB header, embedded resources, finite positions, valid triangle indices and unit normals. `round-trip-validation.json` records successful Blender re-import, dimensions and exclusion of studio fixtures. Preview images were rendered and visually reviewed.

## Regeneration

Use Blender 5.2 and Python with Pillow/NumPy. Run from the project root:

1. `python Assets/Models/scripts/make_packaging_texture.py`
2. `blender --background --python Assets/Models/scripts/build_packaging.py`
3. `python Assets/Models/scripts/make_bean_textures.py`
4. `blender --background --python Assets/Models/scripts/build_bean.py`
5. `blender --background --python Assets/Models/scripts/build_cup.py`
6. `blender --background --python Assets/Models/scripts/build_grinder.py`
7. `python Assets/Models/scripts/make_walnut_texture.py`
8. `blender --background --python Assets/Models/scripts/build_espresso.py`
9. `blender --background --python Assets/Models/scripts/finalize_models.py`

To prepare only newly generated models, append `-- coffee-grinder espresso-machine` to the finalization command.

Blender's GLB exporter needs access to its normal temporary directory when packing the bean's roughness texture. Packaging typography scripts use Georgia and Arial from the Windows fonts folder.
