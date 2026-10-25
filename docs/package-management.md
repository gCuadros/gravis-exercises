# Package management

## Decision

Development uses **pnpm 12.15.0**, pinned in `package.json` and verified against the registry on 2026-10-25. Its content-addressable store reuses downloaded packages; the isolated dependency layout makes undeclared imports easier to detect. We retain Node as the execution target and test Node 22/24. Bun is not required for any workflow. See [pnpm installation](https://pnpm.io/installation) and [frozen installs](https://pnpm.io/cli/install).

`pnpm-lock.yaml` is the only development lockfile. It was imported from the preceding npm lockfile: all 67 locked dependency versions and integrity values are preserved. The additional package-manager section pins pnpm and its platform binaries. Native TypeScript/Oxlint binaries resolve through their existing optional dependencies; no dependency build-script approval is needed by the current graph.

## Setup and daily work

Install the pinned pnpm version using the official installation instructions, then verify `pnpm --version`. An older Corepack shim on the maintainer's machine could not launch pnpm 12's native entry point; do not assume a bundled Corepack supports it. A self-contained bootstrap, without replacing global tools, is:

```sh
npx --yes pnpm@12.15.0 install --frozen-lockfile
npx --yes pnpm@12.15.0 run check
```

Here npm only bootstraps pnpm; pnpm resolves and installs project dependencies. When the matching pnpm executable is on PATH, use:

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm exec playwright install chromium
pnpm run test:e2e
```

Use `pnpm add --save-dev --save-exact <package>@<version>` for deliberate tool updates; commit the manifest and lockfile together. Use `pnpm exec` to run installed tools. pnpm forwards script arguments directly: `pnpm run review:verify --packet <directory>`.

Never regenerate `package-lock.json` or maintain competing lockfiles. `--frozen-lockfile` must reject manifest/lock disagreement. After the store has been populated, `pnpm install --offline --frozen-lockfile` can restore the graph without downloads; a cold store requires network access.

## CI and distribution

CI and draft-release preparation install pnpm through commit-pinned `pnpm/action-setup`, reading the version from the manifest. Node setup caches the pnpm store with `pnpm-lock.yaml` as the cache key; every install is frozen. The Node 22/24 matrix, browser job, changelog policy and aggregate gate remain required. Dependabot's ecosystem key remains `npm`, which identifies the package ecosystem rather than the chosen CLI.

`test:package` uses `pnpm pack`, checks the actual file allowlist and hashes each archive immediately to verify repeatable packing. It then installs that archive offline into **two unrelated temporary consumers**, one using pnpm and one using npm. Both use empty caches and exercise ESM/JSON exports, generated types, immutability and published/preview separation. The pnpm consumer reuses the exact invoking executable and disables manager auto-resolution inside that temporary project; installing a local dependency-free archive must not depend on cached registry metadata. npm is retained only for this consumer compatibility test and optional pnpm bootstrap, not repository dependency management.

The source package-manager choice is not imposed on users of the library. pnpm's packed manifest omits development package-manager metadata and publish lifecycle hooks. Package runtime, declarations, schemas and feeds retain their existing paths; no runtime dependency is introduced. No package is published by these tests.

Review-packet command examples/context changed. Previously prepared packets may now fail drift verification; regenerate into a new destination and preserve any reviewer notes instead of overwriting them.
