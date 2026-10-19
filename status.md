# Project status — Gravis Exercise Library

Snapshot date: **2026-10-19 (Europe/Madrid)**. This is a handoff snapshot, not a live dashboard. Read [plan.md](plan.md) for acceptance criteria and execution order, and verify the checkout/PR before acting. Newer commits are not automatically covered by older test evidence.

## Current handoff

- **Repository:** [gCuadros/gravis-exercises](https://github.com/gCuadros/gravis-exercises).
- **Working branch:** `chore/project-foundation`; base: `main`.
- **PR:** [#1 — Establish reusable exercise library and project quality gates](https://github.com/gCuadros/gravis-exercises/pull/1), open in draft at inspection. Not merged.
- **Verified parent baseline:** `8110b0a5c71121aa7d0a0402250660dcd4fab512` (TST-001), with successful [CI run 39169500102](https://github.com/gCuadros/gravis-exercises/actions/runs/39169500102). The foundation implementation is `4feee05e7e45c1b483e888540539057950039c80`.
- **This handoff change:** implements TAX-001: shared ES/EN vocabulary, controlled record keys, typed taxonomy/JSON exports, search integration, version 2 records and a 0.2.0 migration guide. Use Git history and PR checks to identify the resulting commit; this document does not claim its own future commit hash.
- **Worktree at initial inspection:** clean on the foundation branch before TAX-001 authoring. Recheck before continuing; preserve any newer work.
- **Next implementation:** DATA-001, the standalone catalogue-envelope contract. Define its version/channel/license/exercise constraints, export schema and generated types, and test actual archived JSON against it. Keep published collections empty until content approval.

## Task states

| ID       | State                    | Evidence / next action                                                                                                  |
| -------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| FND-001  | implemented_under_review | Foundation commit and successful CI below; PR #1 awaits maintainer review/merge decision                                |
| FND-002  | implemented_under_review | Handoff documents committed in a91a71f; its Node/browser CI passed                                                      |
| TST-001  | implemented_under_review | Synthetic search fixtures and identity-based browser navigation pass with extra matching variations; see evidence below |
| TAX-001  | implemented_under_review | Controlled scoped vocabulary, record enums, public JS/JSON/types and migration; local evidence below                    |
| DATA-001 | not_started              | Add catalogue-envelope contract; current canonical schema covers records only                                           |
| CAT-001  | not_started              | Research inventory exists locally on the originating machine; reconciliation and batch plan are not complete            |
| MED-001  | not_started              | Eight production briefs exist, but no original media or technical approvals exist                                       |
| CAT-002  | not_started              | Eight pilot drafts exist; broader batches and human review are outstanding                                              |
| WEB-001  | not_started              | Initial responsive preview works; broader launch validation and actual reviewed-media behavior remain                   |
| REL-001  | deferred                 | No release decision, npm publication, domain setup or hosted deployment performed                                       |

`implemented_under_review` means the code/documents exist and are reviewable; it does not mean merged, content-approved or published.

## What actually exists

- **Package:** version `0.2.0`, ESM, generated TypeScript record declarations and plain JSON; zero runtime dependencies. Consumers can install a verified archive into another project.
- **Exports:** published default API, explicit `/preview` API, `/data`, `/data/preview`, `/schema`, `/taxonomy`, `/taxonomy/data`, `/taxonomy/schema`, `/package.json`.
- **Runtime:** immutable records, stable-ID/slug lookups and bilingual accent-insensitive search over exercise/vocabulary aliases and families, with discipline/equipment filters. Vocabulary lookups return undefined for unknown keys; the site refuses invalid labels.
- **Content:** eight original ES/EN drafts; zero published records; zero approved media; zero completed technical reviews. Published imports/JSON are intentionally empty.
- **Contract:** JSON Schema draft 2020-12 executed by Ajv; domain validation adds identity, filename, metric and media-URL checks. Record types are generated from version 2 of the schema. Taxonomy JSON shape version 1 is independently validated; explicit enum synchronization and drift checks keep the standalone record contract aligned.
- **Build:** `dist/package/` and `dist/site/` are separate. The archive excludes the website, tests and private research. Verified archives/checksums are generated under `artifacts/`.
- **Reference site:** bilingual catalogue, search, combined filters, exercise pages, JSON downloads, visible draft/review states and responsive layouts. It has no production demonstrations and remains `noindex,nofollow`.
- **Repository tooling:** locked development tools, formatting, ESLint, unit/type/package tests, Playwright desktop/mobile tests, Node 22/24 CI, Dependabot configuration, CODEOWNERS, templates and a draft-release workflow.
- **Private research:** an optional `.local/research/gravis-catalogue-v0.1.json` contains 517 candidate records (457 references plus 60 proposals). It is not tracked, distributed, fully deduplicated or technically approved. A fresh clone will not contain it.

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

### TAX-001 working-tree validation

On 2026-10-19:

- Locked development tools restored successfully with `npm ci --offline --no-audit --no-fund`.
- `npm run check`: passed with **23 unit tests**, schema/domain and vocabulary-drift checks, build, consumer types and actual isolated offline archive installation.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`: **20 tests passed**, desktop/mobile across source and expanded catalogues. Browser runtime now loads the same taxonomy module as the package.
- Vocabulary covers the pilot's **43 scoped terms**: 3 disciplines, 10 equipment/surfaces, 14 muscles/groups, 8 families and 8 metrics. All have ES/EN labels, definitions and alias lists. This is a coverage snapshot, not the final catalogue scope or technical approval.
- Negative tests cover missing translations, blank definitions, ambiguous aliases, invalid keys, unknown references, overlapping muscle roles, schema drift, prototype-property lookup, mutation and version 1 rejection.
- Public `/taxonomy`, `/taxonomy/data` and `/taxonomy/schema` exports are tested from the real archive, including generated record-key types. Archive allowlisting, channel isolation and deterministic packing still pass.
- All eight pilot records retain IDs, slugs, instructions and draft/review states; only `schemaVersion` changed from 1 to 2. Package version is 0.2.0 with a [migration guide](docs/migrations/0.2.0.md); no version tag or registry release was created.

This evidence covers the local TAX-001 change. Check the resulting commit's PR checks for remote confirmation; the preceding CI links cover earlier commits only. Updated README, [taxonomy workflow](docs/taxonomy.md), plan and migration documentation are part of this handoff.

### Repository settings observed

`main` was protected on 2026-10-18: PR required, up-to-date `CI gate` required from GitHub Actions, resolved conversations and linear history required, force pushes/deletion blocked, rules enforced for administrators. Required external approvals are zero because there is one maintainer. These are server-side settings, not guarantees supplied by CODEOWNERS or a clone; recheck if access is available.

The npm registry publication guard remains `private: true`. Draft-release automation is implemented but has **not** been exercised by creating a version tag/release. Dependabot configuration is committed in the PR; scheduled operation depends on it reaching the default branch. No release, deployment or merge has been performed.

## Known gaps and external dependencies

1. **Vocabulary coverage is still a pilot.** The current controlled terms describe the existing records; broader batches need new terms and editorial review through the documented workflow. No anatomical hierarchy or exercise suitability inference is implemented.
2. **No envelope schema.** JSON consumers have a record schema, but not a full versioned catalogue-envelope contract yet.
3. **No media production or technical reviewer yet.** Briefs do not count as assets or approval. Models can prepare content; actual technical/licensing evidence must come from the appropriate people.
4. **Launch checks are incomplete.** The current tests do not establish full accessibility, all browsers, large-catalogue performance or actual video/animation behavior.
5. **External distribution decisions remain.** Confirm registry name/scope ownership and publication method, media delivery and website hosting before launch. No paid service or credential setup is implied.
6. **Source inventory is optional/private.** Its absence blocks reconciliation of those particular references, not build/test work or independent research and authorship.

## Resume checklist

1. Read `AGENTS.md` → `plan.md` → this file → `docs/architecture.md`.
2. Confirm branch, worktree and PR state. If PR #1 is still open, continue the appropriate branch; if it has merged, start a new focused branch for the next task.
3. Run `npm ci` and inspect the package scripts. Do not depend on this machine's caches or SSH aliases.
4. Start DATA-001: add a standalone schema for the generated catalogue envelope, reuse the exercise schema, generate matching types and test both channels (including an empty published collection). Decide compatibility/version impact explicitly. Preserve controlled taxonomy and catalogue-growth coverage.
5. Run `npm run check` and `npm run test:e2e`; review the diff/package boundary.
6. Update task states and evidence, then commit/push the relevant branch and inspect its CI. Leave merge/release decisions to the maintainer.

## Continuity notes

Broader product decisions and the routine-specific “Previous” feedback are preserved in [docs/product-context.md](docs/product-context.md). They must survive a handoff but are not features to add to this public library.

This file intentionally avoids model-specific tools, absolute filesystem paths and secrets. There is no hidden requirement to access the original chat. When evidence or access is missing, say exactly what remains unverified and continue independent tasks from the plan.
