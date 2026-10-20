# Pull request workflow and split index

Every logical change or exercise-authoring batch has its own branch, PR and `CHANGELOG.md` update. Its implementation, necessary tests and documentation belong together. A later roadmap task is a new change even when earlier PRs are still open. Corrections inside an existing PR's declared scope can remain on that branch.

## Selecting a base

Start from updated `main` when prerequisites have merged. If the change needs an unmerged prerequisite, create a new branch from it and target that prerequisite branch in the PR. State the dependency and review only the incremental diff. Check the actual base/head, changed files and changelog before submitting; simply renaming an accumulated branch does not split a change.

## Initial repair — 2026-10-20

PR #1 accumulated seven distinct changes and is superseded by the following scoped PRs. Original commits and the old branch are retained for traceability; no force push, source rewrite, merge or release is part of this repair. References to PR #1 in historical status snapshots identify the old delivery context, not a branch to continue.

| Order | Task                   | PR                                                                                                                            | Branch                     | Base                       | Verified CI                                                                     |
| ----- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| 1     | FND-001                | [#2: Establish the reusable exercise library foundation](https://github.com/gCuadros/gravis-exercises/pull/2)                 | `chore/library-foundation` | `main`                     | [Passed](https://github.com/gCuadros/gravis-exercises/actions/runs/39397534402) |
| 2     | FND-002                | [#3: Add portable project plan and status](https://github.com/gCuadros/gravis-exercises/pull/3)                               | `docs/portable-handoff`    | `chore/library-foundation` | [Passed](https://github.com/gCuadros/gravis-exercises/actions/runs/39397538670) |
| 3     | TST-001                | [#4: Make catalogue tests resilient to multiple exercise matches](https://github.com/gCuadros/gravis-exercises/pull/4)        | `test/catalogue-growth`    | `docs/portable-handoff`    | [Passed](https://github.com/gCuadros/gravis-exercises/actions/runs/39397542406) |
| 4     | TAX-001                | [#5: Add controlled bilingual exercise taxonomy](https://github.com/gCuadros/gravis-exercises/pull/5)                         | `feat/bilingual-taxonomy`  | `test/catalogue-growth`    | [Passed](https://github.com/gCuadros/gravis-exercises/actions/runs/39397548281) |
| 5     | DATA-001               | [#6: Validate and export the catalogue envelope contract](https://github.com/gCuadros/gravis-exercises/pull/6)                | `feat/catalogue-envelope`  | `feat/bilingual-taxonomy`  | [Passed](https://github.com/gCuadros/gravis-exercises/actions/runs/39397552105) |
| 6     | CAT-001                | [#7: Reconcile catalogue coverage and specify the first authoring batch](https://github.com/gCuadros/gravis-exercises/pull/7) | `docs/catalogue-coverage`  | `feat/catalogue-envelope`  | [Passed](https://github.com/gCuadros/gravis-exercises/actions/runs/39397559216) |
| 7     | CAT-002 / B001 Group A | [#8: Author eight bilingual exercises for foundation batch A](https://github.com/gCuadros/gravis-exercises/pull/8)            | `feat/exercise-batch-a`    | `docs/catalogue-coverage`  | [Passed](https://github.com/gCuadros/gravis-exercises/actions/runs/39397562648) |

The process correction itself is a separate change on `chore/scoped-change-workflow`, based on `feat/exercise-batch-a`. It updates the working agreement, portable handoff, PR template and CI changelog gate. Its PR is discoverable by that unique branch; consult live PR checks for current validation rather than treating this dated index as live state.

## Integration order

1. Review and integrate the first dependency before its child; the table's order follows the current implementation history.
2. Before retargeting a child to `main`, confirm that the prerequisite's changes are present and inspect the resulting diff. Keep parent branches while open PRs still target them.
3. Squash/rebase merges can change commit ancestry. If the child diff then includes already integrated work, reconcile its branch against the new base and revalidate before requesting review. Do not silently force-push shared branches or assume changing the base is sufficient.
4. Every resulting PR must still show only its intended change, include its own changelog update and pass CI on its current revision. Merging and publication require the maintainer's decision.

## Gates and their limits

The `Change policy` CI job checks the PR's three-dot diff for an added or modified `CHANGELOG.md`; deletion, an unchanged inherited changelog or unrelated inherited history do not satisfy it. The required `CI gate` also requires that job to succeed on pull requests. Push/manual/reusable release runs keep the software gates and skip the PR-only check.

Scope quality still needs review: CI cannot decide whether a PR contains one coherent change or whether its changelog is meaningful. The PR template records scope, base, dependency and changelog evidence. No automation merges, retargets, releases or publishes changes.
