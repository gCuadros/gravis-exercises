# Project status — Gravis Exercise Library

Snapshot date: **2026-10-21 (Europe/Madrid)**. This is a handoff snapshot, not a live dashboard. Read [plan.md](plan.md) for acceptance criteria and execution order, and verify the checkout/PR before acting. Newer commits are not automatically covered by older test evidence.

## Current handoff

- **Repository:** [gCuadros/gravis-exercises](https://github.com/gCuadros/gravis-exercises).
- **Working branch:** `feat/review-production-packets`; base: `feat/exercise-batch-b` at `3112b770ae01cad26274414fc0df00c603bdb82d`.
- **Scope:** MED-001 preparation: portable review packets with source/context drift verification, plus the maintainer-selected uniform 3D pilot. No exercise content, approval, schema or consumer API changes.
- **Dependency:** [PR #10](https://github.com/gCuadros/gravis-exercises/pull/10) is still open as of this snapshot. This PR targets its branch so the diff contains only review/production preparation. The 3D cohort includes Group B's ring row. Integrate #10 first, then retarget this PR to main and recheck its diff and CI; do not merge this work into the Group B branch.
- **Verified baseline:** #10 head `3112b77` passed [CI run 39463226886](https://github.com/gCuadros/gravis-exercises/actions/runs/39463226886), including Node 22/24, browser checks and changelog policy. That evidence covers the prerequisite, not this new change.
- **Worktree at initial inspection:** clean on the Group B head, matching its remote branch. Main remains `5b3068e`; PRs #2–#9 are integrated and PR #1 is superseded.
- **Production decision:** maintainer chose uniform 3D animation on 2026-10-21. Proposed initial visual cohort: bodyweight squat, floor push-up and ring row. No character/rig, animator or technical reviewer has been selected; no assets exist.
- **Next action:** review the preparation PR (head `feat/review-production-packets`) and verify its current CI; then use its generated pilot packet to select/create the rig and review three prototypes. Record actual human and asset evidence before any approval. No purchases, commissioning, publication or deployment are included in this task.

## Task states

| ID       | State       | Evidence / next action                                                                                              |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| FND-001  | done        | Foundation integrated through PR #2; package and CI evidence below                                                  |
| FND-002  | done        | Portable handoff integrated through PR #3                                                                           |
| TST-001  | done        | Growth regression coverage integrated through PR #4                                                                 |
| TAX-001  | done        | Controlled vocabulary and exports integrated through PR #5; Group B adds scoped terms                               |
| DATA-001 | done        | Versioned envelope integrated through PR #6                                                                         |
| CAT-001  | done        | Planning audit and B001 specification integrated through PR #7; source-equivalence holds remain                     |
| MED-001  | in_progress | Uniform 3D pilot and review tools prepared; no original assets or human approval                                    |
| CAT-002  | in_progress | Group A drafts merged via PR #8; Group B implemented under review; local checks passed (36 unit / 24 browser tests) |
| WEB-001  | not_started | Responsive preview exists; reviewed-media and wider launch validation remain                                        |
| REL-001  | deferred    | No publication or deployment decision                                                                               |

`done` above refers to the named software/planning work, not content approval or release. The scoped-PR/changelog workflow was integrated through PR #9. Historical evidence below retains original pre-rebase commit IDs; use the current baseline above to resume.

## What actually exists

- **Package:** version `0.4.0`, ESM, generated TypeScript record declarations and plain JSON; zero runtime dependencies. Consumers can install a verified archive into another project.
- **Exports:** published default API, explicit `/preview` API, `/data`, `/data/preview`, `/schema`, `/schema/catalogue`, `/taxonomy`, `/taxonomy/data`, `/taxonomy/schema`, `/package.json`.
- **Runtime:** immutable records, stable-ID/slug lookups and bilingual accent-insensitive search over exercise/vocabulary aliases and families, with discipline/equipment filters. Vocabulary lookups return undefined for unknown keys; the site refuses invalid labels.
- **Content:** 24 original ES/EN drafts; zero published records; zero approved media; zero completed technical reviews. Published imports/JSON are intentionally empty.
- **Contract:** JSON Schema draft 2020-12 executed by Ajv; domain validation adds identity, filename, metric and media-URL checks. Record types are generated from version 2 of the schema. The catalogue envelope schema reuses that record contract and is bundled without external refs; its generated readonly type replaces the handwritten model. Empty distributions are valid and published-channel drafts are rejected. Taxonomy JSON shape version 1 is independently validated; explicit enum synchronization and drift checks keep the standalone record contract aligned.
- **Build:** `dist/package/` and `dist/site/` are separate. The archive excludes the website, tests and private research. Verified archives/checksums are generated under `artifacts/`.
- **Reference site:** bilingual catalogue, search, combined filters, exercise pages, JSON downloads, visible draft/review states and responsive layouts. It has no production demonstrations and remains `noindex,nofollow`.
- **Repository tooling:** locked development tools, formatting, ESLint, unit/type/package tests, Playwright desktop/mobile tests, Node 22/24 CI, Dependabot configuration, CODEOWNERS, templates and a draft-release workflow.
- **Coverage planning:** [CAT-001 matrix](docs/catalogue-coverage.md) accounts for all 517 candidates, 22 review groups and explicit unresolved evidence. [B001](docs/batches/001-foundations.md) specifies 16 new variations in two groups of eight; both groups are authored as drafts. The 517-candidate audit is a historical planning snapshot, not a live content count.
- **Private research:** the optional `.local/research/gravis-catalogue-v0.1.json` contains 517 candidates (457 references plus 60 proposals). `.local/research/reconciliation-2026-10-19.json` records per-row planning dispositions, flags, proposed batch scope links and a source checksum; `.local/research/reconcile-cat001.py` reproduces that local audit. These are ignored and not distributed. No source identities were merged or verified as equivalent; a fresh clone will not contain these files.

## Verification evidence and its limits

### Foundation baseline `4feee05e7e45c1b483e888540539057950039c80`

- `npm run check`: passed locally; formatting, lint, schema/domain validation, **11 unit tests**, build, TypeScript consumer checks and isolated package install.
- Package test: actual offline installation of the built archive into a temporary unrelated project; verifies ESM/JSON exports, lookups/search, nested immutability, channel separation, installed declarations, archive allowlist and repeated-pack integrity.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`: **10 tests passed** locally, across desktop/mobile configurations.
- [GitHub CI run 39166758634](https://github.com/gCuadros/gravis-exercises/actions/runs/39166758634): **Quality (Node 22), Quality (Node 24), Browser tests and CI gate all succeeded**. GitHub used Playwright-managed Chromium.
- Test counts describe this baseline, not permanent target numbers. Passing software checks does not approve exercise technique, translations or media rights.

### Portable handoff baseline `a91a71fd6965bc1b9f190a4be1a651598b47dad4`

[CI run 39167952157](https://github.com/gCuadros/gravis-exercises/actions/runs/39167952157) passed the Node 22/24 matrix and browser checks. This verifies the preceding documentation commit, not subsequent test changes.

### TST-001 baseline `8110b0a5c71121aa7d0a0402250660dcd4fab512`

On 2026-10-18:

- `npm ci --offline --no-audit --no-fund` restored the locked development tools successfully from the available cache.
- `npm run check` passed: **17 unit tests**, schema validation over all real source records, build, types and isolated archive installation.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` passed: **20 tests**, exercising desktop/mobile against both the original catalogue and an expanded browser-only payload.
- Four synthetic fixtures include three matching pull-up variants and an unrelated movement. Tests assert explicit expected identities, translations/aliases, multiword matching, AND filters, absence of mutation and additional matches.
- Browser navigation chooses the stable real exercise identity, not an ambiguous set of search results. It also verifies combined filters after reload, clearing and language persistence.
- Expanded payloads are intercepted only in each test browser. Real source records, generated exports and archive contents stay unchanged; dataset tests assert exact source equality and missing synthetic detail routes.

[CI run 39169500102](https://github.com/gCuadros/gravis-exercises/actions/runs/39169500102) passed Node 22/24 and browser checks for this baseline. Synthetic fixtures are not public exercise content and remain excluded from distribution.

### TAX-001 baseline `fc29949f808dfbf63cc26a4e0de54ce4b2927053`

On 2026-10-19:

- Locked development tools restored successfully with `npm ci --offline --no-audit --no-fund`.
- `npm run check`: passed with **23 unit tests**, schema/domain and vocabulary-drift checks, build, consumer types and actual isolated offline archive installation.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`: **20 tests passed**, desktop/mobile across source and expanded catalogues. Browser runtime now loads the same taxonomy module as the package.
- Vocabulary covers the pilot's **43 scoped terms**: 3 disciplines, 10 equipment/surfaces, 14 muscles/groups, 8 families and 8 metrics. All have ES/EN labels, definitions and alias lists. This is a coverage snapshot, not the final catalogue scope or technical approval.
- Negative tests cover missing translations, blank definitions, ambiguous aliases, invalid keys, unknown references, overlapping muscle roles, schema drift, prototype-property lookup, mutation and version 1 rejection.
- Public `/taxonomy`, `/taxonomy/data` and `/taxonomy/schema` exports are tested from the real archive, including generated record-key types. Archive allowlisting, channel isolation and deterministic packing still pass.
- All eight pilot records retain IDs, slugs, instructions and draft/review states; only `schemaVersion` changed from 1 to 2. Package version is 0.2.0 with a [migration guide](docs/migrations/0.2.0.md); no version tag or registry release was created.

[CI run 39238356786](https://github.com/gCuadros/gravis-exercises/actions/runs/39238356786) passed Node 22/24, browser tests and the CI gate for this baseline. Taxonomy workflow and migration documentation remain part of the repository handoff.

### DATA-001 baseline `2800464da051bd5a74407e421b60befd0224d11d`

On 2026-10-19:

- `npm ci --offline --no-audit --no-fund` restored locked dependencies. No new dependencies were introduced.
- `npm run check`: passed with **31 unit tests**, format/lint, record/taxonomy/envelope checks, both builds, TypeScript consumers and isolated archive installation.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`: **20 tests passed**. Served preview/published JSON is validated against the schema fetched from the website, alongside the existing desktop/mobile and expanded-catalogue flows.
- Unit coverage includes empty channels, malformed/missing/extra metadata, SemVer versions, draft exclusion, retained publication gates, record-reference integrity, duplicate IDs/slugs, cross-field conflicts and equivalence of source versus bundled schemas.
- The isolated package test resolves `/schema/catalogue` from the installed archive and compiles it with a fresh offline validator, with no source-schema registration. It validates both installed feeds, rejects an injected draft and invalid license, verifies manifest version and checks byte equality with the site feeds.
- Envelope types are generated from the bundled schema and checked from the installed archive, including readonly nested records, known channels/license/version and compatibility with the public exercise type.
- No exercise JSON or taxonomy keys changed. Version 0.2.1 adds the schema export and validation while preserving the existing format and record/envelope generation 2. See [catalogue contract](docs/catalogue-contract.md) for the compatibility decision and validation limits.

[CI run 39273710887](https://github.com/gCuadros/gravis-exercises/actions/runs/39273710887) passed Node 22/24, browser tests and the CI gate for this baseline. No merge, release tag, registry publication or deployment was performed.

### CAT-001 verified baseline — b275950

On 2026-10-19:

- The original inventory was available. Every one of its 517 unique candidate IDs received one coverage area and one disposition in a new ignored ledger; the original file was preserved and its checksum recorded. Both exclusive count tables sum to 517.
- The audit found 19 activities/session labels, 102 undefined exact source families, 75 equipment-specification flags, eight undefined metric profiles, two step/floor tracking gaps and six unconfirmed custom-origin flags. Flags overlap; the public document explains routing precedence.
- One repeated-label pair remains separate. All 22 original review groups have a documented decision and remaining evidence. No source equivalence or technical approval was fabricated.
- Seven candidate scopes relate to seven existing pilot records without claiming verified source identity. Generic L-sit support remains unresolved relative to the eighth pilot. All eight authored records are untouched.
- B001 specifies 16 collision-free proposed slugs and work items, English/Spanish names, exact scope, equipment, required/optional metrics and loading/counting conventions. Group A requires four proposed families and two equipment terms; Group B adds five families and two equipment terms. Muscle proposals must be assessed during authoring, not inherited from source labels.
- `npm ci --offline --no-audit --no-fund` restored the locked toolchain. Public changes are planning/documentation only; no runtime, schema, package version or authored data changed.
- `npm run check`: passed with **31 unit tests**, formatting/lint, record/taxonomy/envelope validation, builds, types and isolated package installation. The archive allowlist still excludes private research and planning files.
- Audit consistency checks passed: both public count tables total 517, all 22 decisions are linked in the private ledger, all 16 batch work items/slugs are unique and collision-free, the source checksum is unchanged, and public documentation contains no source/candidate IDs. The local audit refuses a changed input checksum rather than silently reusing index-based decisions.
- Browser behavior was not changed. The previous DATA-001 browser evidence remains labeled above; CI still runs browser checks for this documentation commit.

[CI run 39301560223](https://github.com/gCuadros/gravis-exercises/actions/runs/39301560223) passed the Node 22/24 matrix, browser tests and CI gate for CAT-001 commit `b275950473e70ff98672d42c4c5b171737b09864`. Local source mappings and custom-origin details must remain outside Git, the site and the archive. The public B001 specification is sufficient to continue when those files are unavailable.

### CAT-002 / B001 Group A working-tree evidence

On 2026-10-19:

- Authored eight original bilingual records with stable IDs `grv_000000000009` through `grv_000000000016`: bodyweight squat, high-bar back squat, conventional deadlift, flat dumbbell press, strict pronated pull-up, floor push-up, forearm plank and single-under. The [batch map](docs/batches/001-foundations.md#group-a-delivery-and-review-handoff) links each file, editorial references and review questions.
- Added seven scoped vocabulary terms: two equipment terms, four families and spinal erectors. Total: **50 terms** (3 disciplines, 12 equipment/surfaces, 15 muscles/groups, 12 families, 8 metrics). Record enums were explicitly synchronized; no existing key or pilot record changed.
- Added eight production briefs, with exact framing and review criteria. All 16 records remain drafts with pending technical review, null reviewer/date and empty media. No video was produced or reviewed; references are not approvals or media licenses.
- Version 0.3.0 flags expanded closed consumer unions. JSON record/envelope generation 2 and taxonomy shape generation 1 are unchanged. See [compatibility guidance](docs/migrations/0.3.0.md).
- Added regression coverage for related-variation identity lookup, equipment distinctions, plank versus planche, generated vocabulary/filter types and bilingual mobile-width navigation through the new equipment filters.
- `npm ci --offline --no-audit --no-fund` restored the locked toolchain. `npm run check` passed: **33 unit tests**, formatting/lint, schema/domain/taxonomy/envelope validation, site/library builds, generated consumer types and isolated archive installation for `gravis-exercises-0.3.0.tgz`.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`: **22 tests passed**, desktop/mobile, including new equipment-filter navigation, long headings at 320 px, both languages and existing source/expanded catalogue regressions. Local runs used installed Chrome; CI uses Playwright-managed Chromium.
- Review checks confirmed all eight pilot records are byte-for-byte unchanged; the schema's only semantic changes are vocabulary enum additions. New local documentation links resolve. Actual package tests preserve the allowlist, channel separation and site/package feed equality; private research is not distributed.

Remote evidence for this change must match its resulting commit; older CI above is not evidence for these new records. No merge, tag, registry publication or deployment is authorized by this handoff.

### PR boundary repair — 2026-10-20

- Seven original implementation commits were assigned separate branch/PR boundaries; each incremental diff includes `CHANGELOG.md`. The cumulative implementation remains byte-for-byte the same at the Group A tip.
- Updated `AGENTS.md`, `plan.md`, the PR template and release guidance to require one logical change per branch/PR and its own changelog update. Historical evidence retains original commit IDs; old branch/PR instructions are superseded by this handoff.
- Added a PR-only changelog check to CI and included its outcome in the required gate. Policy checks passed on five temporary Git histories (added/modified pass; unchanged/deleted/inherited-only fail), and six event/job-result combinations verified that the final gate blocks software or PR-policy failures. `npm ci --offline --no-audit --no-fund` and `npm run check` passed with 33 unit tests, generated types and isolated package installation. Browser/runtime source is unchanged in this process correction.
- All seven split PRs passed fresh CI on their preserved commit heads, including Node 22/24, browser tests and the final gate; run links are recorded in `docs/pr-workflow.md`. The process-correction PR needs its own current-head CI result.
- No merge, force push, release, registry publication or deployment is part of the repair.

### CAT-002 / B001 Group B working-tree evidence — 2026-10-20

The following checks cover this Group B change from baseline `5b3068e`; they are local evidence, not a claim about a future commit's CI. Use the PR checks for its exact remote head.

- Eight original ES/EN drafts, IDs `grv_000000000017`–`grv_000000000024`; 24 total, zero published, zero media and zero completed technical reviews. Both B001 groups are authored, not approved for launch.
- Seven new vocabulary keys: rings/kettlebell equipment and five families, totaling **57 terms** (3 disciplines, 14 equipment, 15 muscles, 17 families, 8 metrics). Existing 16 exercise files are byte-identical to main; the schema changes only equipment/family enums.
- Package version 0.4.0 and matching lockfile metadata; [migration note](docs/migrations/0.4.0.md) explains closed-union additions. No dependencies, runtime APIs or schema generations changed.
- Eight new production briefs and primary editorial references/review decisions in [B001](docs/batches/001-foundations.md#group-b-delivery-and-review-handoff). All review and asset-rights decisions remain pending.
- `npm ci --offline --no-audit --no-fund` succeeded. `npm run check` passed: **36 unit tests**, format/lint, record/taxonomy/envelope validation, 25 generated pages, consumer types and isolated archive installation (`gravis-exercises-0.4.0.tgz`).
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`: **24 passed** across desktop/mobile, including rings/kettlebell filters, bilingual notes and headings at 320 px. The first run caught an incorrect test assumption that `lang=es` selected language; the test now uses the actual language control and verifies persistence through reload. No website behavior was changed.
- Audit passed for existing-record preservation, unique IDs, draft/review/media states, changed-document relative links and clean diff whitespace. Package checks verify channel isolation, the allowlist, offline consumption and site/package feed equality; private research stays excluded.

### MED-001 review and 3D preparation — 2026-10-21

Local evidence covers this change from Group B baseline `3112b77`; use the new PR's checks for its final remote commit.

- Added `review:prepare` and `review:verify`, repository-only Node tooling. Selected IDs/slugs produce complete JSON and readable EN/ES snapshots, preserved taxonomy/schema/production documents, SHA-256 fingerprints and separate pending human forms. The generator never writes exercise source or imports approval decisions.
- Uniform 3D is the maintainer's selected direction. `docs/animation-pilot.md` specifies bodyweight squat, floor push-up and ring row as the initial visual cohort, with common art direction, full-sequence/loop deliverables and explicit review criteria. No animation has been created or approved.
- Generated and verified a real three-exercise packet at `.local/reviews/3d-pilot-2026-10-21-v1/`. It is ignored and not distributed; a fresh clone can reproduce it using `docs/review-packets.md`. No private research or account data was read into it.
- `npm ci --offline --no-audit --no-fund` and `npm run check` passed: **43 unit tests**, including seven preparation/verification regressions, schema validation, build, types and isolated archive installation. Tests cover stale text/tracking/context, tampered or missing snapshots, preserved reviewer notes, deterministic selection, markup escaping, packet links and CLI use outside the repository working directory.
- All 24 exercise files, schema, taxonomy, runtime and website source are unchanged from the dependency branch. Existing package allowlist checks exclude the tooling and generated review data. No new dependency, package version or consumer export is needed.
- Local browser tests were not repeated for this tooling-only change. The PR's CI still runs the full browser suite. Automated verification checks source/context consistency only; it does not inspect assets, review decisions or rights evidence.

### Repository settings observed

`main` was protected on 2026-10-18: PR required, up-to-date `CI gate` required from GitHub Actions, resolved conversations and linear history required, force pushes/deletion blocked, rules enforced for administrators. Required external approvals are zero because there is one maintainer. These are server-side settings, not guarantees supplied by CODEOWNERS or a clone; recheck if access is available.

The npm registry publication guard remains `private: true`. Draft-release automation is implemented but has **not** been exercised by creating a version tag/release. Dependabot configuration is committed in the PR; scheduled operation depends on it reaching the default branch. No release, deployment or merge has been performed.

## Known gaps and external dependencies

1. **Content coverage remains early.** The catalogue contains the eight pilot drafts and both B001 groups. Subsequent batches still need specification and authorship; all current records need technical/media review; 369 other candidates remain in the specification backlog and the explicit holds need evidence. No anatomical hierarchy or exercise suitability inference is implemented.
2. **Schema checks have explicit limits.** The bundled schema enforces metadata, record structure and channel gates. Duplicate identities, muscle/metric overlap and media delivery constraints also require the documented domain checks when consumers edit their own catalogues. Automated validation never certifies technique or licensing.
3. **No media production or technical reviewer yet.** Uniform 3D is selected and preparation tooling exists, but briefs and packets do not count as assets or approval. Models can prepare content; actual technical/licensing evidence must come from the appropriate people.
4. **Launch checks are incomplete.** The current tests do not establish full accessibility, all browsers, large-catalogue performance or actual video/animation behavior.
5. **External distribution decisions remain.** Confirm registry name/scope ownership and publication method, media delivery and website hosting before launch. No paid service or credential setup is implied.
6. **Source inventory is optional/private.** Its absence blocks reconciliation of those particular references, not build/test work or independent research and authorship.

## Resume checklist

1. Read `AGENTS.md` → `plan.md` → this file → `docs/architecture.md`.
2. Confirm branch, worktree and actual PR base/head. Use `docs/pr-workflow.md` to locate the scoped change. PR #1 is superseded. Start a new branch and PR for a new task; only corrections within the same declared scope reuse a PR.
3. Run `npm ci` and inspect the package scripts. Do not depend on this machine's caches or SSH aliases.
4. Verify the PR dependency/base and current CI. Both B001 groups are authored. Use `docs/animation-pilot.md` and `docs/review-packets.md` to prepare the three selected 3D prototypes with a qualified reviewer. Regenerate stale packets in a new destination; never copy approval across changed content by assumption. A later B002 needs its own bounded specification and PR.
5. Run `npm run check` and `npm run test:e2e`; review the diff/package boundary.
6. Update task states and evidence, then commit/push the relevant branch and inspect its CI. Leave merge/release decisions to the maintainer.

## Continuity notes

Broader product decisions and the routine-specific “Previous” feedback are preserved in [docs/product-context.md](docs/product-context.md). They must survive a handoff but are not features to add to this public library.

This file intentionally avoids model-specific tools, absolute filesystem paths and secrets. There is no hidden requirement to access the original chat. When evidence or access is missing, say exactly what remains unverified and continue independent tasks from the plan.
