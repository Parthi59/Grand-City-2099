# Grand City 2099 original city materials

The coastal facade and surface atlases in `dist/public/assets` were generated
specifically for this original fictional city on 2026-09-20. They are not extracted
from GTA or any other game. The source PNGs were encoded as WebP for delivery.

`coastal-facades-atlas.webp` contains four facade studies: ivory apartment,
blue-grey curtain glass, brick, and limestone. The geometry maps windows to
approximately 3.2-metre storeys. Doors, awnings, balconies, roof equipment and
setbacks are separate geometry.

`coastal-materials-atlas.webp` contains asphalt, concrete paving, stucco and
limestone. The surface atlas is pre-tiled at runtime to keep road aggregate and
paving slabs at pedestrian scale without adding dense geometry.

All city geometry and fictional shop signs are original procedural work. Three.js
is distributed under the included MIT license in `dist/public/THREE-LICENSE.txt`.

## Character and vehicle update

The articulated player body and Idle/Walk/Run clips use the Mixamo Vanguard
character distributed as Soldier.glb in the official Three.js skeletal-animation
example. The helmet is removed at load time and replaced with an original exposed
head. Hand targets, vehicle seating, weapon poses and integration are original.
This is a fictional avatar, not a reconstruction of the user's face.

- Source: https://threejs.org/examples/models/gltf/Soldier.glb
- Demonstration and attribution: https://threejs.org/examples/webgl_animation_skinning_blending.html
- Adobe's stated permitted uses include video games: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html

The model is embedded as part of this game, not offered as a standalone asset
download. GLTFLoader, SkeletonUtils and BufferGeometryUtils are Three.js r180
modules under the included MIT license; imports are adjusted for the local vendor
folder. Vehicle geometry, NPC geometry, weapon geometry and combat effects are
original procedural work.

## Close-up civilians
Michelle is a Mixamo character distributed with the official Three.js retargeting example:
https://threejs.org/examples/models/gltf/Michelle.glb
https://threejs.org/examples/webgpu_animation_retargeting.html
Use terms: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html
The character is embedded for use in this game, not supplied as a standalone asset product.
Street routines and procedural hand/foot targeting are original integration work.

## Photographic human face (September 2026 update)
The close-range male heads use **Infinite, 3D Head Scan by Lee Perry-Smith**,
Infinite Realities / www.triplegangers.com, under **Creative Commons Attribution
3.0 Unported** (https://creativecommons.org/licenses/by/3.0/).
Source: https://threejs.org/examples/models/gltf/LeePerrySmith/ .
The mesh is cropped below the neck, rescaled to human proportions, and fitted to
our original articulated clothed body. Original diffuse and tangent-space normal
maps are included. The original license is bundled at assets/human/LICENSE.txt.
There is one base scanned face with complexion and hair variants, not separate
scans for every pedestrian. It does not represent the player personally.
The previous Vanguard body remains bundled but is not used by the current player.
