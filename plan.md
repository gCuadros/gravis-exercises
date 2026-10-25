# Execution plan — Gravis Exercise Library

This is the portable implementation plan. It requires only this repository, Git and the documented Node toolchain, not the originating chat, a particular model, an IDE or an MCP server. Read [status.md](status.md) for the current task states and verified evidence. Read [AGENTS.md](AGENTS.md) for working rules.

## 1. Product and scope

Build an open, reusable exercise library for third-party projects as well as Gravis. Ship original English/Spanish exercise records, stable identities, explicit recording conventions, reviewed demonstrations and clear reuse rights. Consumers can use JavaScript/TypeScript or plain JSON. The public website is a reference consumer and discovery surface, not the boundary of the product.

Coverage must grow across strength, calisthenics and functional/CrossFit-style training. The first eight draft entries form the production pilot; B001 Groups A and B add sixteen more, for 24 authored drafts. This is not the intended catalogue size. A local research inventory contains 517 candidates; this is not a verified unique exercise count or approved content. See [expansion](docs/catalogue-expansion.md).

The fitness application, accounts, user sessions, subscriptions, AI coaching and the future nutrition product are outside this repository. Preserve relevant context in [product context](docs/product-context.md); do not implement application history in the public dataset.

## 2. Invariants

- Give every logical change or authoring batch its own branch, PR and changelog update; never implement directly on `main` or append a later task to an earlier PR.
- Keep the public runtime framework-independent and free of runtime dependencies, Node-only APIs and network requirements.
- Use the exercise JSON Schema as the record contract. Generate record types from it; add domain checks only for constraints outside that schema.
- Default imports and published JSON expose approved entries only. Preview imports are explicit. An empty published dataset is correct while review is incomplete.
- Stable IDs survive wording/translation changes. A different movement variation needs its own identity; names from another app are research references, not automatic equivalence.
- Record technical review and asset rights truthfully. Never fabricate approval, reviewer attribution or media. Automated checks do not certify technique.
- Keep private research, account exports, credentials and large production media out of Git and distributable artifacts.
- Separate software delivery, content approval, registry publication and website deployment. Completion of one does not imply completion of the others.

## 3. Start or resume in any harness

1. Open the repository root. Read `AGENTS.md`, `plan.md`, `status.md`, then the documents linked by the selected task.
2. Inspect `git status --short`, `git branch --show-current` and `git log -5 --oneline`. Preserve uncommitted work. Reuse an existing branch only for corrections inside that PR's exact scope. Start every new task or authoring batch on a new focused branch, normally from updated `main`. For an unmerged dependency, explicitly document it and use its branch as the PR base so the diff includes only the new change. Never reset, overwrite or merge another person's changes to make the setup convenient.
3. Compare the checkout with the evidence in `status.md`. If there are newer commits, recheck the relevant facts rather than treating the snapshot as live state.
4. Use Node from `.nvmrc` (minimum package version is in `package.json`) and run `pnpm install --frozen-lockfile`. Keep `pnpm-lock.yaml`; do not substitute unpinned tools.
5. Select the first ready task in dependency order below. Mark it `in_progress` in `status.md`, describing the intended outcome. Do not reopen completed work without a concrete defect or requirement.
6. Implement a bounded change and its meaningful checks. Run `pnpm run check`. For website/browser-runtime changes, also run `pnpm run test:e2e` after installing Chromium with `pnpm exec playwright install chromium`.
7. Inspect the diff and package boundary. Update the status, relevant documentation and changelog; commit on the working branch. Open the new task's own PR, including its `CHANGELOG.md` update. Update an existing PR only for corrections within that PR's scope. Verify base/head and changed files against the declared scope. Recheck CI on the resulting commit.
8. Leave a handoff with completed work, evidence, remaining risks and the exact next action. Do not merge, tag, publish or deploy without a release/merge decision from the maintainer.

### Tool independence and unavailable capabilities

- GitHub CLI is optional. PRs, checks and repository settings can be inspected through the GitHub website/API. The canonical remote is `https://github.com/gCuadros/gravis-exercises`; do not depend on another machine's SSH alias.
- If GitHub access is unavailable, finish and validate local work, record the branch/commit and mark remote verification pending. Do not claim CI passed or a push happened.
- Network is needed to install uncached development tools/browser binaries. If unavailable, use an already installed locked toolchain when valid; otherwise report the specific missing prerequisite. Never disable a check to work around access.
- Browser tests start and stop their own local server on port 4173. The manual preview uses 4371 and supports `PORT`. Stop servers you start. Do not terminate another process just to free a port.
- `.local/` is optional and absent in a fresh clone. Its absence must not block builds, tests, taxonomy work or independently authored additions. If a task specifically needs the founder's research, record that dependency and continue unrelated ready work; do not reconstruct private records from guesses.
- No persistent agent memory is assumed. These files and the repository history are the handoff.

## 4. Ordered work packages

Task IDs are permanent. The table defines order and dependencies; `status.md` is the source of current execution state. Acceptance criteria describe completion, not promises that the work is already done.

| ID       | Work package                                    | Depends on                                                       | Completion evidence                                                                                                                                |
| -------- | ----------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| FND-001  | Reusable package and project quality foundation | None                                                             | Isolated package installation, generated types, canonical validation, reference site, green Node/browser CI and protected main                     |
| FND-002  | Portable plan and status                        | FND-001                                                          | A fresh contributor can locate scope, prerequisites, current branch/evidence and next work without chat history                                    |
| TST-001  | Tests that tolerate catalogue growth            | FND-002                                                          | Adding another matching exercise does not break tests through hard-coded result counts; search and navigation regressions are still detected       |
| TAX-001  | Controlled bilingual taxonomy                   | TST-001                                                          | Equipment/muscle/family keys have documented semantics and labels; validation rejects unknown or inconsistent references                           |
| DATA-001 | Versioned catalogue-envelope contract           | TAX-001                                                          | JSON consumers can validate the envelope as well as each record; exported schema/types/docs and package tests agree                                |
| CAT-001  | Coverage reconciliation and batch plan          | TAX-001                                                          | Candidate groups, duplicates, exact variations, unresolved items and the next authoring batch are documented without private metadata              |
| TYP-001  | Strict TypeScript and native quality tools      | Current authored catalogue and review tooling                    | Strict source gate, compiled ESM, output parity and passing unit/browser/package checks                                                            |
| PKG-001  | pnpm package management                         | TYP-001                                                          | Frozen lockfile install, updated Actions/docs, deterministic archive and isolated consumption                                                      |
| MED-001  | Pilot visual specification and production       | FND-002                                                          | Style/format conventions are documented; actual pilot assets have creator, rights, bilingual descriptions and technical review                     |
| CAT-002  | Author and review successive batches            | CAT-001, DATA-001                                                | Each batch has valid original bilingual content, recording conventions and explicit review status; publish only entries with approved media        |
| WEB-001  | Catalogue readiness for broader public use      | TAX-001, actual reviewed entries from CAT-002/MED-001            | Accurate mixed draft/published states, usable mobile/keyboard flows, reviewed media behavior and measured payload/search performance               |
| REL-001  | First deliberate public distribution            | FND-001–002, TST-001, TAX-001, DATA-001; approved launch content | Maintainer selects name/ownership, release scope and channels; versioned artifacts and license review completed; publication explicitly authorized |

### TYP-001 and PKG-001 — Maintainer priority before media production

Complete TYP-001 first: strict TypeScript implementation/tooling/tests, current stable native compiler, Rust-based linting, generated schema types and compiled dependency-free JavaScript. Verify source checking, unit/browser tests, isolated package installation and output-data parity. See [toolchain](docs/typescript-toolchain.md).

PKG-001 follows in its own branch/PR (see [package management](docs/package-management.md)): pin pnpm, replace the npm lockfile, migrate Actions/scripts/documentation, require frozen installs, and test the actual archive with independent consumers. Preserve dependency versions unless a concrete compatibility issue requires a separate decision. Resume the uniform 3D pilot after this priority work.

### TST-001 — Catalogue growth regression coverage

Tests must tolerate multiple exercises matching `dominada` and select a deliberate identity when navigating. The original tests assumed one match; this task defines the regression coverage that prevents that assumption from returning. Consult `status.md` for completion and the current next task.

- Test search semantics against small explicit synthetic fixtures in unit tests, including multiple matching variations, accents, aliases and combined filters.
- Keep a separate validation test over every real source record.
- Make browser assertions test useful results and deliberate selection of an exercise identity, without assuming the production catalogue has only one matching result or exactly eight records.
- Ensure expected results are not simply computed by the same function being tested.
- Validate a temporary extra matching fixture in tests; do not add fictitious records to the released catalogue.
- Run `pnpm run check` and both browser projects. Preserve current behavior and the package allowlist.

### TAX-001 and DATA-001 — Contracts before scaling

TAX-001 defines one maintainable vocabulary with ES/EN labels, definitions and search aliases. The runtime, website, record enums and public vocabulary exports must agree. Reject unknown references and exact primary/secondary muscle overlap. Document additions, synonyms and compatibility changes; do not silently rename stored identities or conflate muscle groups. Implementation details and the extension workflow are in [taxonomy](docs/taxonomy.md); `status.md` identifies its verification state.

DATA-001 specifies the full envelope: `schemaVersion`, package version, channel, license and record collection. Its acceptance criteria include empty collections, rejection of drafts in published data, reuse of the canonical exercise schema, generated envelope types and offline validation of actual archive exports. The site and package must serve the same JSON. See the [catalogue contract](docs/catalogue-contract.md) for implementation and compatibility rules; consult `status.md` for verified evidence.

### CAT-001 and CAT-002 — Coverage and authorship

Use the local inventory only if available. If it is not available, prepare an independently authored coverage proposal and mark source reconciliation pending. Never claim that a fresh clone includes all 517 candidates. Keep source-to-canonical mappings private when they contain account-linked references.

The [CAT-001 coverage audit](docs/catalogue-coverage.md) records every candidate’s planning disposition, equivalence decisions and unresolved evidence. [B001](docs/batches/001-foundations.md) is the first public authoring specification: two groups of eight exact variations. Planning triage does not claim every source identity has been resolved.

Resolve exact variations and duplicates before assigning new stable IDs. Work in reviewable batches; record proposed anatomy as pending until professionally reviewed. Preserve all requested disciplines and the full coverage ambition rather than treating the pilot as the final limit. Detailed workflow: [contributing](CONTRIBUTING.md), [expansion](docs/catalogue-expansion.md), [data model](docs/data-model.md).

### MED-001 and WEB-001 — Visual assets and real use

Follow [media production](docs/media-production.md), the maintainer-selected [uniform 3D pilot](docs/animation-pilot.md) and [portable review packets](docs/review-packets.md). The first visual cohort is bodyweight squat, floor push-up and ring row; it samples different contact patterns before scaling the same style across the catalogue. Preparation/verification tooling supports the review process but does not complete MED-001. A model can prepare style proposals, scripts and production briefs. Technical approval, performer permissions and license decisions need actual evidence from the appropriate people; elapsed time or a successful build is not approval. Obtain the chosen production method and reviewer before representing anything as approved.

The initial site is editorial preview, with no demonstrations. Before public launch, test mixed review states, video/animation controls, mobile sizing, keyboard access and understandable status labels. Add measurements before proposing pagination, a CDN or other infrastructure; do not invent scale requirements.

### REL-001 — External decisions

Use [release policy](docs/releases.md). The package is currently private to block accidental registry publication, but local/CI archives are usable. Registry name/scope ownership, publication identity, first approved content set, hosting and media delivery remain decisions to settle. No credentials, tags, package publishing, paid hosting or deployment should be inferred from this roadmap alone.

## 5. Definition of done and handoff format

A software task is complete when its acceptance criteria are met, relevant checks pass, the diff has been inspected, documentation is consistent and evidence identifies the tested revision or working-tree change. Mark whether it is implemented, under review, merged or released; those are different states.

A content task is complete only at its stated review level. A well-formed draft is not an approved demonstration or launch-ready exercise.

At every handoff, update `status.md` with:

- Date, branch/PR, implementation baseline and worktree state at inspection.
- Task IDs and states: `not_started`, `in_progress`, `implemented_under_review`, `done`, `blocked` or `deferred`.
- Commands/results and CI links, with the exact revision they cover when known.
- Files/decisions changed, limitations, external dependencies and the next concrete action.
- Whether a task needs maintainer or technical-review input, and what independent work remains available.

Do not copy secrets, private exports, machine-specific absolute paths or conversational transcripts into these public handoff files. Keep historical evidence labeled so it is not mistaken for a later checkout's status.
