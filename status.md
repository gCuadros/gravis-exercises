# Project status — Gravis Exercise Library

Snapshot date: **2026-10-18 (Europe/Madrid)**. This is a handoff snapshot, not a live dashboard. Read [plan.md](plan.md) for acceptance criteria and execution order, and verify the checkout/PR before acting. Newer commits are not automatically covered by older test evidence.

## Current handoff

- **Repository:** [gCuadros/gravis-exercises](https://github.com/gCuadros/gravis-exercises).
- **Working branch:** `chore/project-foundation`; base: `main`.
- **PR:** [#1 — Establish reusable exercise library and project quality gates](https://github.com/gCuadros/gravis-exercises/pull/1), open in draft at inspection. Not merged.
- **Verified implementation baseline:** `4feee05e7e45c1b483e888540539057950039c80` (`chore: establish reusable exercise library foundation`).
- **This handoff change:** adds `plan.md`, `status.md`, portable product context and discovery/update instructions. No runtime, schema or exercise-content change is intended. It follows the baseline above; do not confuse that baseline SHA with the commit containing these documents.
- **Worktree at initial inspection:** clean on the foundation branch. Recheck after reading; this fact is timestamped, not a guarantee for another session.
- **Next implementation:** TST-001, making tests resilient to new matching exercise variations. Concrete steps and acceptance criteria are in `plan.md`.

## Task states

| ID       | State                    | Evidence / next action                                                                                                  |
| -------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| FND-001  | implemented_under_review | Foundation commit and successful CI below; PR #1 awaits maintainer review/merge decision                                |
| FND-002  | implemented_under_review | These handoff documents plus entry links in README/AGENTS; latest PR checks must be inspected for this follow-up commit |
| TST-001  | not_started              | Remove assumptions of one pull-up search result; preserve real search regression coverage                               |
| TAX-001  | not_started              | Inventory keys and replace ad hoc label/fallback behavior with a controlled bilingual vocabulary                        |
| DATA-001 | not_started              | Add catalogue-envelope contract; current canonical schema covers records only                                           |
| CAT-001  | not_started              | Research inventory exists locally on the originating machine; reconciliation and batch plan are not complete            |
| MED-001  | not_started              | Eight production briefs exist, but no original media or technical approvals exist                                       |
| CAT-002  | not_started              | Eight pilot drafts exist; broader batches and human review are outstanding                                              |
| WEB-001  | not_started              | Initial responsive preview works; broader launch validation and actual reviewed-media behavior remain                   |
| REL-001  | deferred                 | No release decision, npm publication, domain setup or hosted deployment performed                                       |

`implemented_under_review` means the code/documents exist and are reviewable; it does not mean merged, content-approved or published.

## What actually exists

- **Package:** version `0.1.0`, ESM, generated TypeScript record declarations and plain JSON; zero runtime dependencies. Consumers can install a verified archive into another project.
- **Exports:** published default API, explicit `/preview` API, `/data`, `/data/preview`, `/schema`, `/package.json`.
- **Runtime:** immutable records, stable-ID/slug lookups and bilingual accent-insensitive search with discipline/equipment filters.
- **Content:** eight original ES/EN drafts; zero published records; zero approved media; zero completed technical reviews. Published imports/JSON are intentionally empty.
- **Contract:** JSON Schema draft 2020-12 executed by Ajv; domain validation adds identity, filename, metric and media-URL checks. Record types are generated from the schema.
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

### Handoff follow-up

`npm run check` passed locally on 2026-10-18 for the handoff working-tree change, including 11 unit tests, build, types and isolated package installation. Local links in the new/updated documents were also checked. This result was recorded after the check; the new commit's remote CI must be read from PR #1 rather than inferred from the historical run above. No additional local browser run was needed for documentation-only changes; the unchanged CI workflow still runs browser tests on PR updates.

### Repository settings observed

`main` was protected on 2026-10-18: PR required, up-to-date `CI gate` required from GitHub Actions, resolved conversations and linear history required, force pushes/deletion blocked, rules enforced for administrators. Required external approvals are zero because there is one maintainer. These are server-side settings, not guarantees supplied by CODEOWNERS or a clone; recheck if access is available.

The npm registry publication guard remains `private: true`. Draft-release automation is implemented but has **not** been exercised by creating a version tag/release. Dependabot configuration is committed in the PR; scheduled operation depends on it reaching the default branch. No release, deployment or merge has been performed.

## Known gaps and external dependencies

1. **Catalogue-growth assumptions in tests.** Some tests expect exactly one result for `dominada`, and a browser locator assumes a single matching card. This is the immediate software task, TST-001.
2. **Taxonomy is not fully controlled.** Labels live in `src/catalogue.js`; some stored keys accept arbitrary text. Taxonomy semantics and validation need consolidation before large authoring batches.
3. **No envelope schema.** JSON consumers have a record schema, but not a full versioned catalogue-envelope contract yet.
4. **No media production or technical reviewer yet.** Briefs do not count as assets or approval. Models can prepare content; actual technical/licensing evidence must come from the appropriate people.
5. **Launch checks are incomplete.** The current tests do not establish full accessibility, all browsers, large-catalogue performance or actual video/animation behavior.
6. **External distribution decisions remain.** Confirm registry name/scope ownership and publication method, media delivery and website hosting before launch. No paid service or credential setup is implied.
7. **Source inventory is optional/private.** Its absence blocks reconciliation of those particular references, not build/test work or independent research and authorship.

## Resume checklist

1. Read `AGENTS.md` → `plan.md` → this file → `docs/architecture.md`.
2. Confirm branch, worktree and PR state. If PR #1 is still open, continue the appropriate branch; if it has merged, start a new focused branch for the next task.
3. Run `npm ci` and inspect the package scripts. Do not depend on this machine's caches or SSH aliases.
4. Start TST-001; use synthetic fixtures and identity-based selection, not extra fictitious release records.
5. Run `npm run check` and `npm run test:e2e`; review the diff/package boundary.
6. Update task states and evidence, then commit/push the relevant branch and inspect its CI. Leave merge/release decisions to the maintainer.

## Continuity notes

Broader product decisions and the routine-specific “Previous” feedback are preserved in [docs/product-context.md](docs/product-context.md). They must survive a handoff but are not features to add to this public library.

This file intentionally avoids model-specific tools, absolute filesystem paths and secrets. There is no hidden requirement to access the original chat. When evidence or access is missing, say exactly what remains unverified and continue independent tasks from the plan.
