# Realistic character production study

## Decision and current quality

On 2026-10-30 the maintainer accepted a **hyperrealistic fitness athlete with optional red muscle highlighting** as the visual direction. The accepted reference is an AI-generated still concept, not a rigged model, finished asset or anatomical approval. The rigid mannequin from PR #15 remains historical blocking evidence; it is not the intended character style.

This change introduces a reproducible **native Blender development study** with a continuous human mesh, weighted skeleton, fitted garments, skin/eye/hair textures, a full squat take and a review-only color layer. **Its current render does not meet the accepted hyperrealistic reference.** Face/skin detail, hair, garment fit/deformation, athletic shape and precise muscle boundaries need further work. Do not call this model production-ready or replace public exercise demonstrations with it.

## Reproduce

The library and website still use only the pinned Node/pnpm toolchain. Native character production is optional and requires Blender **4.5.15 LTS**, `tar` and `unzip`. Tested on macOS ARM64; other platforms have not been verified. Use the [official Blender release downloads](https://download.blender.org/release/Blender4.5/) and its SHA-256 file. No global Blender settings are modified by the runner.

```sh
pnpm install --frozen-lockfile
pnpm run character:prepare
BLENDER_BIN=/absolute/path/to/blender pnpm run character:build .local/character-builds/new-version
pnpm exec playwright install chromium
pnpm run character:verify .local/character-builds/new-version/character-base.glb
```

`character:prepare` downloads approximately 371 MB of four pinned archives into `.local/character-cache/`, verifies their SHA-256 and reuses matching downloads. It rejects changed bytes rather than silently accepting a new upstream archive. It never installs Blender. `character:build` verifies the archives again and unpacks a fresh isolated set for each build. The output directory must be new and inside ignored `.local/`; earlier evidence is preserved. Blender runs offline with factory settings and isolated user resources. Failed builds may retain partial output for diagnosis; use a new directory after correcting a failure.

The orchestration, provenance checks and motion sampling are strict TypeScript. `prototypes/character/blender_recipe.py` is a narrowly scoped native adapter because Blender's scene API is Python. It does not add Python to the library runtime. `pnpm run character:syntax` checks syntax without importing Blender; actual scene execution must also be checked in the pinned Blender version. The adapter is formatted with Black 26.10.1. CI checks TypeScript, archive-integrity regression and Python syntax; it does **not** imply that Blender renders ran in CI.

## Outputs and boundaries

- `gravis-athlete-v2.blend`: editable scene with packed textures, weighted rig, full timeline, lights, camera and material nodes. Select `Gravis_Athlete_rig` and toggle its `highlight_regions` custom property. The red layer is an initial broad region mask, **not precise individual muscles or measured activation**. It must be replaced/refined and anatomically reviewed.
- `character-base.glb`: portable skinned character with full animation and neutral materials. The Blender-specific highlight shader is intentionally excluded; no claim of portable highlight controls. Procedural fabric/skin shading may differ between renderers. The optional `character:verify` command loads it in Chromium/Three.js and checks skin presence, finite animated bounds, descent, standing return and clip timing. This does not certify visual parity or Blender import in another DCC.
- `standing.png`, `squat-front.png`, `squat-rear.png`: actual Blender renders for visual inspection, not generated concept imagery.
- `native-validation.json`: sampled foot-bone drift, approximate-parallel thigh endpoint, highlight toggle and scene counts. This does not prove planted shoe geometry, collision-free clothes, correct biomechanics or anatomical accuracy.
- `manifest.json`: source versions/archive hashes, recipe and timing-source hashes, output sizes/hashes and explicit unreviewed state. `blender.log` preserves native build output, including failures. The exact native recipe is copied alongside the outputs. `browser-validation.json` records the GLB hash and independent consumer checks; it requires a fresh destination and is produced by `character:verify`.

The original TypeScript squat timing remains the source of 301 samples at 30 fps. Blender retargeting uses the generated character's own bone lengths. A separate production loop and encoded MP4 master are still pending. Generated scenes, textures, archives and images never enter Git, the package or exercise records. All 24 records remain unchanged drafts.

## Source provenance

| Resource                                                                      | Author/source                  | License evidence                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MPFB 2.0.18 generator                                                         | MakeHuman Community            | [Source](https://github.com/makehumancommunity/mpfb2/tree/v2.0.18), GPL-3.0-or-later; executed externally, not copied into MIT source or distributed package                                          |
| Core basemesh, targets, rig/weights, skin, eyes, eyebrow008, short01, shoes05 | MakeHuman Community            | [Core asset license](https://static.makehumancommunity.org/about/license.html) and [system pack inventory](https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html), CC0 |
| Crude male shirt                                                              | MakeHuman, edited by Elvaerwyn | [Shirts pack](https://static.makehumancommunity.org/assets/assetpacks/shirts01.html), CC0; material overridden for this development study                                                             |
| Jean shorts                                                                   | Cortu                          | [Pants pack](https://static.makehumancommunity.org/assets/assetpacks/pants01.html), CC0; material overridden for this development study                                                               |
| Scene, retargeting and review masks                                           | AI-assisted Gravis authoring   | Repository MIT source; reviewed distribution decision for final generated assets remains pending                                                                                                      |

`sources.json` pins the exact archive bytes inspected. Licenses differ between software and assets; do not describe the whole character as entirely original Gravis geometry. The accepted still concept supplies no mesh, texture or anatomical evidence and is not used as a texture projection.

## Remaining acceptance work

1. Match the approved reference with a convincingly athletic character, realistic skin/hair and suitable fitted sportswear. These source assets are a development baseline, not an accepted final identity or wardrobe.
2. Inspect setup, bottom and return in side/front/rear views; correct mesh intersections, joint deformation, hand pose and shoe support. Bone tests cannot substitute for this.
3. Replace broad region masks with reviewed muscle-specific geometry/masks, preserve toggling and label the layer truthfully.
4. Validate the exported character in a real consumer, produce the separate loop and full MP4/poster, then measure and record each approved asset's provenance. Maintain distinct visual, technical and rights decisions.
