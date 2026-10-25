# Portable exercise review packets

Generate an offline handoff for a movement professional and animator from the current validated source. It contains readable English/Spanish instructions, complete JSON snapshots, vocabulary/schema and production guidance. The selected [uniform 3D pilot](animation-pilot.md) uses squat, push-up and ring row.

## Prepare

From the repository root, restore the locked tools with `pnpm install --frozen-lockfile`, then:

```sh
pnpm run review:prepare \
  --exercise squat-bodyweight \
  --exercise push-up \
  --exercise ring-row \
  --output .local/reviews/3d-pilot-v1
```

Repeat `--exercise` for each exact slug or stable ID. Unknown exercises, duplicate selections, malformed source data and unknown CLI options fail. The output directory must not exist, even if empty: reruns never overwrite a reviewer's notes. Use a new destination for a revision.

The generator does not use the private research inventory, GitHub or the originating chat. It runs with the local locked Node toolchain. Output is generated only when requested and stays outside the library package and website. `.local/` is ignored; inspect a packet before sharing it, and never add private consent documents or personal contact details to public Git history.

## Contents and editable boundaries

| Path                             | Purpose                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `README.md`                      | Exercise index and handoff instructions                                                           |
| `manifest.json`                  | Packet format version, package version, selected IDs/slugs and SHA-256 fingerprints               |
| `exercises/<slug>/exercise.json` | Complete normalized source snapshot, including review/media/provenance                            |
| `exercises/<slug>/snapshot.md`   | Readable bilingual movement, cues, proposed muscles and recording conventions                     |
| `exercises/<slug>/review.md`     | Editable human observations; starts pending and is never imported automatically                   |
| `context/`                       | Exact copies of schema, vocabulary, media workflow, 3D pilot and B001 references/review questions |

The index and exercise snapshot links resolve within the packet. Context documents are preserved byte-for-byte and retain repository-relative reference links; follow references to unselected records or other repository documents in the checkout. Only selected exercise JSON is included.

Only `review.md` is intended to change inside a packet. Store asset files and sensitive rights evidence separately and reference their version/hash or evidence location in that form. Context and record snapshots remain untouched. The generated JSON is normalized using the tool's serializer; hashes do not claim to reproduce original source-file whitespace.

## Verify before recording a decision

```sh
pnpm run review:verify --packet .local/reviews/3d-pilot-v1
```

Verification compares the packet's generated snapshots, manifest, index and context against the current validated checkout. It fails on changed wording, source status, metric conventions, taxonomy, schema, preserved guidance, package version, deleted snapshot files or tampered fingerprints. It does not require an unchanged Git commit: unrelated changes outside the packet context do not invalidate it. Unselected exercise additions do not change the selection, though changes to shared vocabulary/guidance do.

A successful result means the preserved source/context still matches. It **does not** approve technique, translations, media, reviewer identity or reuse rights. The hashes are drift detection, not digital signatures. Review forms are deliberately excluded from automated approval logic; changing a form to say “approved” cannot publish an exercise. The tool does not download or inspect any media URL, and cannot detect a server replacing media at the same URL. Check the actual reviewed asset bytes/version independently.

If verification fails because source content changed, keep the old packet and prepare a new revision. Compare the changed material with the reviewer; do not silently copy a prior approval across versions. A missing or mistyped ID is an error, never a fallback to another movement.

## Transfer real decisions

After a qualified human has supplied evidence, open a separate content PR for the exact reviewed exercises/assets. Record only agreed public reviewer attribution and the real review date. Retain unresolved fields as pending. Publication still needs the existing technical and approved-demonstration gates, validation and a maintainer decision. The packet generator never modifies `exercises/`, assigns a reviewer, creates assets or changes published exports.

Package version remains unchanged: this is repository authoring tooling, with no new consumer export or data-contract change. Packet format `packetVersion: 1` is local workflow metadata, separate from exercise schema generation 2.
