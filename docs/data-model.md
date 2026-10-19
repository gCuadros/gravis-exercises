# Exercise data model · v2

The unit is a specific exercise variation, not a workout performed by a user. Sessions, sets, personal loads, recommendations and coach conversations belong in the future application, outside this public dataset.

| Field                         | Meaning                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `schemaVersion`               | Record contract version, currently 2                                                 |
| `id`                          | Stable identity, independent of names and source apps                                |
| `slug`                        | Readable URL/file identifier; unique in the catalogue                                |
| `status`                      | `draft` or `published`                                                               |
| `names`, `aliases`, `summary` | English and Spanish discovery content                                                |
| `disciplines`                 | One or more of strength, calisthenics, functional                                    |
| `family`                      | Groups related variations without merging their identities                           |
| `equipment`                   | Normalized equipment keys                                                            |
| `muscles`                     | Primary and secondary muscle proposals, subject to technical review                  |
| `tracking`                    | Required/optional metrics, load convention and bilingual recording notes             |
| `instructions`, `cues`        | Authored bilingual movement guidance                                                 |
| `review`                      | Technical state, reviewer attribution and date                                       |
| `media`                       | Demonstrations with URL, type, bilingual alt text, creator, license and review state |
| `license`, `provenance`       | MIT text/data license and original authorship statement                              |

## Tracking conventions

`repetitions`, `load`, `duration`, `distance`, `machine_calories`, `assistance`, `band` and `ascent_height` identify what a future logger should capture. The library describes fields; it does not contain user measurements.

Load conventions distinguish total barbell load including the bar, external load, separately recorded assistance and movements with no numeric load. Do not encode band assistance as negative kilograms or machine calories as a person's measured energy expenditure. Each exercise's recording notes explain what a repetition or unit means for that variation.

The future app should store canonical units alongside numeric values and convert for user display. A workout-set schema with unit conversion, unilateral counting, failure, tempo, RPE/RIR and set types is outside this first library contract.

## Identity and coverage

A band-assisted pull-up is distinct from a machine-assisted pull-up. A foot-assisted rope climb is distinct from a legless rope climb. These can share a family while retaining separate instructions, demonstrations and metrics. Do not turn a generic research label into a precise canonical variation without an editorial decision.

Equipment, muscles, families, disciplines and metrics use the [controlled bilingual vocabulary](taxonomy.md). Author terms in `src/taxonomy.js` and run `npm run taxonomy:sync` to update the standalone record schema enums. Validation and builds reject unknown keys and schema/vocabulary drift. Exact primary/secondary muscle overlap is rejected; broad and narrow muscle groups remain distinct, pending technical review.

## Validation and release

Ajv executes the canonical JSON Schema to check record structure, real calendar dates and publication requirements. TypeScript record declarations are generated from the same schema during the build. Additional domain checks handle duplicate IDs/slugs, filename agreement, metric/muscle role overlap and delivery URLs; these checks supplement the contract rather than duplicating its structural rules.

An approved technical review requires reviewer attribution and date. Published records additionally need at least one approved video/animation and cannot contain media awaiting review. Technical approval alone does not publish an entry. Media licensing is recorded per asset; the dataset envelope's MIT license applies to the authored text/data, not an override of asset licensing.

The preview dataset includes drafts; the published dataset does not. The website currently exposes the preview deliberately, with review status visible. Do not substitute this preview feed for the published feed in a consumer application.

Dataset release versions follow `package.json`. Increment the release version when distributing changed data. Breaking record contracts require a new schema version and a migration note. Retain IDs across wording and translation corrections.

Version 1 preview consumers should follow the [0.2.0 migration](migrations/0.2.0.md). The [catalogue envelope](catalogue-contract.md) uses the same contract generation 2 and has a bundled schema for offline validation. Its metadata, channel gate and generated types reuse the record contract.
