# Coverage reconciliation — CAT-001

Snapshot: **2026-10-19**. This is an editorial planning audit, not a published exercise dataset or a technical review. The 517-candidate local inventory was available and every row was assigned one coverage area and one next-action disposition. The original inventory was not modified. No source identities were merged or assigned automatically to public IDs.

The public outcome is this coverage matrix and the [first authoring batch](batches/001-foundations.md). The private row-level ledger and reproducible local audit are in `.local/research/reconciliation-2026-10-19.json` and `.local/research/reconcile-cat001.py`. Those files contain source mappings, stay ignored and are not necessary to build the package or execute the public batch specification. A fresh clone will not contain them.

## Coverage matrix

Counts are **candidate rows**, not unique movements. Areas are exclusive planning buckets, not anatomy classifications, canonical family keys or nonexclusive discipline tags. Ambiguous labels remain ambiguous even when their broad area is recognizable.

| Planning area                         | Candidates | Existing authored pilot coverage                         | Next gaps to address                                                                                     |
| ------------------------------------- | ---------: | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Squat, lunge, step and leg press      |         52 | None                                                     | Bodyweight/high-bar squat, reverse lunge; later unilateral and machine variants                          |
| Hinge, hip and posterior-chain work   |         38 | None                                                     | Conventional and Romanian deadlift; later bridges, hip thrusts and leg curls                             |
| Upper-body pushing                    |         59 | Barbell bench press                                      | Dumbbell bench, strict overhead press, push-up; later dips and machine presses                           |
| Upper-body pulling                    |         71 | Band-assisted pull-up                                    | Strict pronated/supinated pull-ups, barbell/ring rows; later cable and machine variants                  |
| Isolation and accessories             |        133 | None                                                     | Curl, triceps, shoulder, calf and other accessory batches with precise equipment                         |
| Trunk movements and holds             |         49 | None in this planning bucket                             | Forearm plank; later hanging, rotational and loaded variations                                           |
| Calisthenics skills and supports      |         35 | L-sit on parallettes, tuck planche, wall walk            | Ring supports, lever progressions, handstands and muscle-up variants                                     |
| Weightlifting and compound skills     |         24 | None                                                     | Precisely specified swing first; later clean, snatch, jerk and thruster variations                       |
| Conditioning, locomotion and climbing |         33 | Double-under, rowing ergometer, foot-assisted rope climb | Single-under, suitcase carry; later sleds, jumps, ball work and other ergometers                         |
| General activities / session labels   |         19 | None                                                     | Preserve for a separate activity/import representation; do not fabricate a single-movement demonstration |
| Movement identity still unclear       |          4 | None                                                     | Establish movement/equipment before choosing a family or authoring instructions                          |
| **Total**                             |    **517** | **8 draft records; 0 published**                         | The pilot and first batch do not cap coverage                                                            |

All 102 rows whose original exact-family field was unclassified received an area for planning or the explicit movement-unknown bucket. This does **not** resolve their canonical family or technique. Existing draft labels can also be wrong; they are research hints, not authoritative taxonomy.

## Candidate disposition

Each row appears once in this table. Flags can overlap, so their counts below must not be added to these totals.

| Disposition                              | Candidates | Meaning / next action                                                                              |
| ---------------------------------------- | ---------: | -------------------------------------------------------------------------------------------------- |
| Existing pilot covers the proposed scope |          7 | Coverage association only; source-to-Gravis identity equivalence is still unconfirmed              |
| First authoring batch                    |         16 | Independently specified variations in B001; source labels are not import aliases                   |
| Equivalence or exact-scope hold          |         90 | Compare suspected aliases, related proposals, supports, grips and execution before mapping         |
| Tracking or movement-definition hold     |         10 | Eight undefined recording profiles plus two step/floor machine variants                            |
| Possible custom-origin hold              |          5 | Confirm exact execution and origin; keep source details private                                    |
| Activity-contract hold                   |         19 | General activities/session labels; one also has an unconfirmed custom-origin flag                  |
| Protocol-model hold                      |          1 | A repetition protocol is embedded in the name; decide the model before adding a duplicate movement |
| Remaining specification backlog          |        369 | Routed for later specification; not assumed unique, ready to author or technically approved        |
| **Total**                                |    **517** | **No identity merges performed**                                                                   |

Overlapping evidence flags include **75** candidates with unspecified/alternative equipment, **102** without an exact source family, **71** associated with the existing equivalence/scope review groups and **40** with related-candidate links. All **six** possible custom origins remain unconfirmed: five are in the custom queue and one is in the activity queue. Do not relabel them as confirmed user-created exercises.

There is **one repeated-label group containing two rows** in both draft languages. Equal labels do not establish equal laterality, cable height, grip or execution. Both source rows remain distinct in the private ledger. The 22 existing review groups have the dispositions below; unresolved evidence is deliberately retained.

## Equivalence decisions and evidence still needed

These decisions govern authoring and future imports. “Hold” means that a source identity cannot yet be mapped safely; it does not prevent authoring a separate, precisely specified variation.

| Decision | Movement group                                           | Disposition / evidence needed                                                                                                                                                                               |
| -------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EQ-01    | Rear-delt cable movements, including the repeated labels | **Hold.** Need unilateral/bilateral setup, pulley height and trajectory. Retain both repeated-label records; do not publish account-linked names or mappings.                                               |
| EQ-02    | Triceps pressdown / pushdown / cable extension           | **Conditional alias only.** Match arm position, attachment and grip first. Rope, reverse-grip and overhead versions are not automatic synonyms.                                                             |
| EQ-03    | Dumbbell squeeze / hex press                             | **Conditional alias only.** Confirm bench angle, contact between bells and trajectory before one identity receives both discovery names.                                                                    |
| EQ-04    | Dragon flag / dragonfly                                  | **Hold.** A name is insufficient; establish support, body position and movement endpoints.                                                                                                                  |
| EQ-05    | Generic goblet squat / kettlebell goblet squat           | **Keep generic input unresolved.** A dumbbell or kettlebell choice must be explicit. Do not infer equipment from the family.                                                                                |
| EQ-06    | Overhead barbell press / standing military press         | **Specify standing strict press independently.** Do not map the generic source until stance, posture and absence of leg drive are established.                                                              |
| EQ-07    | Dumbbell overhead / shoulder / seated press              | **Keep seated and standing scopes distinct.** Resolve bench support and bilateral/alternating execution before aliasing.                                                                                    |
| EQ-08    | Pec deck / machine chest fly                             | **Hold.** Match machine support and hand/forearm contact; a generic machine label is insufficient.                                                                                                          |
| EQ-09    | Machine glute kickback / rear kick                       | **Hold.** Match posture, contact points and machine motion.                                                                                                                                                 |
| EQ-10    | Generic muscle-up                                        | **Split precise targets by support and execution.** Bar/rings and strict/kipping are independent specifications; keep generic input unresolved.                                                             |
| EQ-11    | Handstand hold / push-up                                 | **Split precise targets.** Wall/freestanding, hold/repetition, range and leg drive must be explicit.                                                                                                        |
| EQ-12    | Clean / hang clean / snatch / hang snatch                | **Hold broad names.** Specify starting height, receiving position and implement before linking power/full and floor/hang variants.                                                                          |
| EQ-13    | Chest/triceps dip labels and loading variants            | **Retain pending comparison.** A claimed emphasis alone does not prove a different identity; support, execution, assistance and loading must be compared. Do not merge or duplicate solely by muscle label. |
| EQ-14    | Assisted pulling/dips                                    | **Keep band and numeric machine assistance distinct.** An unspecified assisted label cannot become either automatically; no band-color-to-kilogram conversion.                                              |
| EQ-15    | Generic toes-to-bar                                      | **Keep strict/kipping targets distinct.** Resolve swing/impulse before mapping the generic entry.                                                                                                           |
| EQ-16    | Generic rope jumping / single-under / double-under       | **Keep pass counts explicit.** Do not assume the generic activity means single-under or merge it with double-under.                                                                                         |
| EQ-17    | Broad or unfamiliar movement names                       | **Hold.** Require implement, start/end position and execution. No translation-based guess becomes a canonical movement.                                                                                     |
| EQ-18    | General activities / session labels                      | **Preserve separately.** Training styles, sports, warm-up and stretching sessions are not one exact demonstrated variation. An activity/import contract is a follow-up, not a reason to delete references.  |
| EQ-19    | Bayesian/katana/cable pullover terminology               | **Conditional alias or separate variation.** Resolve cable height, upper-arm position, laterality and attachment first. Nicknames alone do not justify new identities.                                      |
| EQ-20    | Calf and leg-press machines                              | **Specify mechanism and loading.** Distinguish support, joint position and load convention; do not imply that numeric loads are comparable across machines.                                                 |
| EQ-21    | “21s” curl protocol                                      | **Hold protocol modeling.** Decide whether partial/full repetition sequencing belongs in a routine protocol or a separately specified exercise. Do not silently discard the sequence.                       |
| EQ-22    | Stair-machine floors / steps                             | **Retain both recording meanings.** Current metrics do not express either. Propose explicit metrics and machine-dependent semantics; never substitute distance or assume a conversion.                      |

Additional checks identified during this audit:

- **Generic L-sit versus the existing parallettes record:** support is unspecified in the reference, so it is a related scope, not a verified match. The other seven pilot scopes have candidate coverage associations. All eight authored pilot records remain intact.
- **Lever, planche and ring-support progressions:** tuck, advanced tuck, straddle and full positions need separate exact specifications. Bar and ring supports are not interchangeable. Do not collapse progressions into the generic hold names.
- **Curl and row family names:** wrist/arm curls and ergometer/resistance/upright rows must not inherit one family merely because the source string contains “curl” or “row”. Planning buckets are not canonical family assignments.
- **Carries, crawls and holds:** choose recording semantics from the exact variation. Do not force a movement into repetitions solely because its draft source profile used repetitions.

## Batch order and priority basis

1. **B001 foundations — 16 authoring targets**, split into two reviewable groups of eight. Cover basic squat/hinge, horizontal/vertical push/pull, holds, rope skill, rings and locomotion. See the complete bilingual specification in [B001](batches/001-foundations.md).
2. **B002 gym expansion**, after B001: cable pulling, unilateral rows, adjustable benches, arm/shoulder accessories, hip thrusts, leg curls/extensions and clearly described machines. Resolve machine/grip/attachment identity before choosing counts or assigning IDs.
3. **B003 calisthenics progression**, after support/loading conventions are established: dips, rings, levers, support holds and strict/inverted skills. Preserve band, numeric assistance and external-load distinctions.
4. **B004 functional and weightlifting expansion:** receiving/start-position variants, kipping versus strict skills, jumps, ball work, sleds and ergometers. Specify endpoints and recorded outputs independently of any competition ruleset.
5. **Parallel unresolved queues:** custom-origin confirmation, activity/import representation, protocol modeling, missing metrics and source equivalence. A queue is not a deletion list; work through all candidates and add newly evidenced gaps.

This ordering is an editorial decision based on missing foundational patterns, implement reuse, distinct tracking modes and manageable review batches. It is **not a measured “most demanded” ranking**. Existing research popularity signals are not re-published as global demand evidence. Future prioritization should use actual requests, searches and usage, with source/date/limitations attached to any external ranking.

## Completion and continuation

CAT-001 completes **planning triage**, not all identity resolution, content authoring or launch coverage. Every candidate has a next action, ambiguity is recorded, and B001 can be authored from its public specification without private research access. CAT-002 must add original bilingual drafts and valid vocabulary as needed; MED-001 must produce and review actual demonstrations before publication. The published channel stays empty until real approvals exist.
