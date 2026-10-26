# Uniform 3D demonstration pilot

Production direction selected by the maintainer on **2026-10-21**: uniform 3D animation. The visual details below are a proposed production specification, not a claim that a character, rig, animation or reviewed asset exists. No renderer, paid service or production supplier has been selected.

## First production cohort

Start with three existing variations before producing the full catalogue. This is a visual-production sample, distinct from the original eight-record data pilot. The remaining library scope is unchanged.

| Identity                                | Why include it                                         | Required views and review points                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grv_000000000009` — `squat-bodyweight` | Bilateral standing movement with no handheld equipment | Three-quarter main view plus side check: whole feet, knees, hips and head visible. Verify the record's approximate-parallel depth, full standing return and consistent floor contact. |
| `grv_000000000014` — `push-up`          | Closed-chain support and ground clearance              | Side/three-quarter main view showing both hands and feet. Verify chest clearance, body moving as one unit, extended-arm return and no knee contact or wrist penetration.              |
| `grv_000000000021` — `ring-row`         | Suspended equipment, grip and body-angle consistency   | Three-quarter main view plus side check. Show ring straps and anchors in a supplementary setup view. Check neutral grip, stable heels, ring-to-rib endpoint and straight body line.   |

The ring-row draft is available in main through integrated PR #10. Before these records are used as final animation scripts, a qualified reviewer must resolve their existing technical questions in the B001 specification. The prototype may expose problems in those drafts; correct the source and regenerate its packet before signing off.

## Shared art direction

- One adult character and rig, with neutral expression and consistent proportions across all three movements. Avoid exaggerated musculature. Character appearance does not imply an ideal body type.
- Matte fitted athletic clothing with clear limb separation: charcoal main material and restrained teal accent. No logos covering joints or equipment contact.
- A light neutral studio background, a visible ground plane and soft contact shadows. Lighting, materials and color treatment stay consistent across clips.
- Fixed camera during each complete cycle. Use perspective with limited distortion; frame the full body, relevant equipment and travel margins. A secondary angle supplements an uninterrupted main take, rather than cutting away at a critical endpoint.
- Use real scale for the rig and equipment. Show hand-to-handle contact, joint alignment, support points and load path clearly. Do not fake technique by sliding contact points, stretching limbs or moving the camera to hide errors.
- Optional muscle highlighting is deferred until anatomy review and a consistent highlighting convention are available. Text and numeric overlays are separate localized layers; the base demonstration is language-neutral.

## Prototype deliverables per movement

1. Editable scene, rig, equipment and animation source; document software/version and any third-party asset provenance. Keep production binaries outside Git.
2. A neutral-pose character sheet plus front/side rig views for art-direction review. This is visual review only.
3. A normal-speed full sequence with entry/setup, at least two complete repetitions and controlled finish. Include a timecode/frame-number review copy. Do not speed up the reviewed motion to fit a target duration.
4. A separate loop derived from a complete repeatable cycle, with matching initial/final pose and velocity. A smooth seam must not hide a reset, omit an endpoint or change the counting convention. Preserve the full sequence for technical review even if a loop is used in the product.
5. Proposed delivery target: silent MP4 (H.264), 1080 × 1080 at 30 fps, plus a still poster. Keep the master at its authored quality. These are pilot targets to measure, not existing player requirements or a promise of a fixed byte budget. GIF/WebP derivatives may be assessed later from the same approved master.
6. Bilingual descriptions written after viewing the final asset. Record actual creator, asset version, SHA-256, proposed license and the location of rights evidence. A vendor's renderer license is not automatically a license to redistribute its character, rig or other source assets.

Use measured file sizes, visible detail at mobile display sizes and actual playback to decide delivery encoding. Hosting/CDN selection is separate work. Do not add placeholder media URLs or imply an asset has been approved merely because it renders.

## Review and iteration

Generate a [review packet](review-packets.md) before handing off the prototype. The packet preserves the exact bilingual text, recording conventions, taxonomy and production context; editable review forms are separate from those snapshots.

The reviewer checks the entire sequence, including setup and finish, at normal speed and frame by frame where needed. Record time/frame references for corrections, the actual asset version/hash and the scope of the decision. Art-direction acceptance, technical approval and reuse-rights confirmation are distinct decisions. A person may review more than one area if appropriately qualified, but none is inferred from another.

If the text, anatomy labels, recording conventions, guidance or asset changes, check what needs re-review. `review:verify` detects source/context drift only; asset bytes and rights evidence must be checked separately. The tool cannot certify movement quality or recognize a reviewer's authority. Preserve previous packets and decisions; generate a new destination for each revision.

## Exit criteria before scaling production

- All three exact variations have reviewed written instructions and full animation sequences that agree with them.
- The same rig/style works for standing, floor support and suspended-equipment movement without hiding contact or introducing joint artifacts.
- Creator, source-asset rights and permitted redistribution are documented; reviewer attribution is recorded with consent.
- A real consumer has been tested for mobile framing, normal-speed playback, controls and the difference between full sequence and loop.
- The maintainer accepts the pilot's visual direction and production cost/time before commissioning the wider catalogue.

Current state: **specification prepared; no prototype assets or human approvals**. The next production action is to select/create a rig and prepare the three prototype sequences with a named technical reviewer. This document does not authorize purchases, commissioning or publication.
