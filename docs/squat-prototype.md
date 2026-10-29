# Squat 3D blocking prototype v1

This is an **unreviewed geometric blocking study**, not a finished anatomical character or a coaching demonstration. It implements the first part of MED-001. All 24 exercise records remain drafts with empty media arrays. Nothing here enters the library archive or reference catalogue.

## Reproduce and inspect

Use the pinned pnpm toolchain, then:

```sh
pnpm install --frozen-lockfile
pnpm run media:dev
```

Open `http://127.0.0.1:4372`. Stop the server with Ctrl+C when finished. The viewer runs entirely locally; there are no CDN imports, account dependencies or external assets. It needs WebGL 2. It starts paused; hidden tabs pause playback. Select front/side/three-quarter, full sequence/loop, scrub by frame or step one frame. Playback speed is real time at the authored 30 fps. The fixed cameras are review angles, not shots cut within a take.

`pnpm run media:build` compiles the original TypeScript and copies the pinned Three.js renderer into ignored `.local/media-preview/`. `pnpm run test:media` starts/stops its own server at 4174 and tests desktop/mobile playback controls and GLB downloads. `pnpm run check` includes strict typing and geometry/clip tests; browser CI runs both the existing catalogue tests and this separate studio suite.

## Editable source and delivery

- `prototypes/squat/motion.ts`: dimensions in metres, explicit contact points, quintic timing and joint positions. A 10-second full take has one second of standing preparation, two four-second cycles and one second of standing finish. This is a ready stance, **not** a walk-in/setup demonstration. Each cycle has 1.6 s descent, 0.3 s bottom hold, 1.4 s ascent and 0.7 s standing hold.
- `prototypes/squat/rig.ts`: original procedural rigid mannequin, named parent/child nodes, matte clothing colors and sampled local transform animation. No imported character, mocap, texture or competitor media. This is an articulated rig, **not a skinned deforming mesh**; its joint boundaries and simplified pelvis/shoulders need artist review. There is no claim of validated anatomy, balance or biomechanics.
- `prototypes/squat/app.ts`: local review studio and animated GLB export. The GLB contains both full and single-cycle animations, meshes/materials and explicit unreviewed metadata. It excludes studio floor/lighting/cameras; recreate those from the source for matching renders. GLB import in Blender or another DCC has not been verified. Three.js [GLTFExporter](https://threejs.org/docs/pages/GLTFExporter.html) provides the exporter.

The generated GLB is an interchange artifact; TypeScript remains the editable procedural source. Generated media belongs under ignored `.local/` or external versioned storage, never Git or the package. There is no MP4 master, approved poster or finalized character sheet yet. Those follow visual iteration and technical review. The three camera angles permit initial proportion/contact inspection without pretending to be final renders.

## Provenance and review boundaries

Original geometry, motion parameters and studio code were authored with Codex assistance for Gravis on 2026-10-29. Source code follows this repository's MIT license. Runtime generation uses Three.js 0.186.1 (MIT); its license is copied beside the local renderer. Type declarations use @types/three 0.186.0. Neither this tool license nor AI-assisted authorship is recorded as human clearance of the generated asset. Proposed generated-asset license: MIT, **pending maintainer rights review**. No third-party character/performer evidence is needed for the current primitive-only scene; adding assets changes that evidence requirement.

Before a media decision, preserve the exact exported bytes, SHA-256, source revision, tool versions, date, reviewer attribution and decision scope. Regenerate a fresh review packet after changing production-context docs:

```sh
pnpm run review:prepare --exercise squat-bodyweight --exercise push-up --exercise ring-row --output .local/reviews/3d-pilot-2026-10-29-v1
pnpm run review:verify --packet .local/reviews/3d-pilot-2026-10-29-v1
```

Use a new destination for subsequent attempts; never overwrite previous review notes. A packet verifies source/context drift, not animation safety or authority. The first review should address body proportions, joint intersections, lateral depth, knee/toe directions, stable foot geometry, arm path, center of mass and standing return. Automated length/contact/clip tests are numerical guards only. Visual, technical and rights decisions all remain pending.

## Next bounded task

Review this blocking study with the maintainer and a qualified technique reviewer, refine the character/rig and motion, then reuse the accepted rig for push-up and ring row in their own focused changes. Produce the full 1080-square/30-fps silent MP4, separate loop, poster and neutral front/side character sheet with measured sizes and hashes before treating MED-001 as complete. No supplier, paid tooling, hosting, deployment or publication has been selected.
