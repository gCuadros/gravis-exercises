# Gravis Exercise Library

[![CI](https://github.com/gCuadros/gravis-exercises/actions/workflows/ci.yml/badge.svg)](https://github.com/gCuadros/gravis-exercises/actions/workflows/ci.yml)

Open exercise data for **any project** building around strength, calisthenics and functional training. Original English/Spanish content, stable identities, recording metadata and an explicit review workflow.

The library is independent of Gravis's application and website. Consume it as a dependency-free JavaScript module, with TypeScript declarations, or as plain JSON from another language. The website is a reference consumer of the same data and search utilities.

**Status:** foundation preview. Twenty-four original draft entries; no technically reviewed entries or approved demonstrations yet. The default package and published dataset are intentionally empty until entries meet the publication gate. Preview data must be selected explicitly. The research inventory of 517 candidates is local and excluded from distribution. A public [coverage audit](docs/catalogue-coverage.md) and [16-variation authoring batch](docs/batches/001-foundations.md) define the expansion work; Groups A and B are authored as drafts; technical review and demonstrations remain pending.

## Use the library

There is no npm registry release yet. The package remains `private: true` to prevent accidental publication before the package name, release ownership and initial content are approved. Use pnpm 12.15.0 ([setup](docs/package-management.md)). Build a local archive, or download the `library-package` artifact from a successful CI run:

```sh
# In this repository
pnpm install --frozen-lockfile
pnpm run build
pnpm run test:package

# In a separate project, using the resulting archive
pnpm add /path/to/gravis-exercises/artifacts/gravis-exercises-0.4.0.tgz
```

```js
// Default: approved, published exercises only (currently an empty collection).
import { catalogue, exercises, getExerciseById, findExercises } from 'gravis-exercises';

const matches = findExercises({ discipline: 'calisthenics', query: 'pull up' });
const exercise = getExerciseById('grv_000000000002'); // undefined until published
```

```js
// Explicit opt-in for editorial previews and development.
import { findExercises, getExerciseBySlug } from 'gravis-exercises/preview';

const matches = findExercises({ query: 'dominada', equipment: 'band' });
const exercise = getExerciseBySlug('band-assisted-pull-up');
console.log(exercise.names.es);
```

```ts
import type { Exercise, SearchOptions } from 'gravis-exercises';

const options: SearchOptions = { discipline: 'strength', query: 'press' };
// Exercise, nested fields and returned collections are readonly.
```

The runtime uses standard ESM and works in Node.js 22.13+ and modern browsers/bundlers without a UI framework or network connection. The catalogue is deeply frozen; copy a record into your own model before modifying it. Lookups return `undefined` for unknown IDs/slugs. Search matches all query words across both languages, exercise/vocabulary aliases, muscles, equipment and families, ignoring case and accents. Discipline and equipment filters are combined.

| Export                              | Contents                                                   |
| ----------------------------------- | ---------------------------------------------------------- |
| `gravis-exercises`                  | Published catalogue, exercises and lookup/search functions |
| `gravis-exercises/preview`          | Same API, with all authored entries including drafts       |
| `gravis-exercises/data`             | Published JSON envelope                                    |
| `gravis-exercises/data/preview`     | Preview JSON envelope                                      |
| `gravis-exercises/schema/catalogue` | Self-contained catalogue envelope + record schema          |
| `gravis-exercises/schema`           | Canonical exercise JSON Schema, draft 2020-12              |
| `gravis-exercises/taxonomy`         | Readonly vocabulary, `getTerm` and `getLabel`              |
| `gravis-exercises/taxonomy/data`    | Portable bilingual vocabulary JSON                         |
| `gravis-exercises/taxonomy/schema`  | Vocabulary structure JSON Schema                           |

JSON files can also be extracted from the archive or consumed directly from `dist/package/`, without JavaScript or npm at runtime. Each envelope has `schemaVersion`, `version`, `channel`, `license` and `exercises`. The [catalogue contract](docs/catalogue-contract.md) validates the whole document, allows empty distributions and rejects drafts in the published channel. The public `Catalogue` type is generated from it. Preserve `id` as the identity; display names and slugs may change under a documented migration.

The controlled [taxonomy](docs/taxonomy.md) covers equipment, muscles, families, disciplines and metrics. For example, `getLabel('metrics', 'assistance', 'es')` from `/taxonomy` returns `Asistencia`. All keys have English/Spanish labels and definitions; unknown references fail record validation. For the latest vocabulary additions, see the [0.4.0 compatibility note](docs/migrations/0.4.0.md). See the [0.2.0 migration](docs/migrations/0.2.0.md) before using older preview data with record schema version 2.

## Continue this project

Start with [plan.md](plan.md) for the scope, ordered tasks and acceptance criteria, then [status.md](status.md) for the verified baseline, outstanding work and exact next action. [AGENTS.md](AGENTS.md) contains the working rules. These Markdown documents are the portable handoff for any contributor, model or harness; no access to the original chat is required.

## Develop

Use a branch; never work directly on `main`. Node 22 is the default in `.nvmrc`; CI also exercises Node 24.

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run dev
```

Implementation, tooling and tests use strict TypeScript 7.0.2 (the stable Go-native compiler). Oxlint 1.89.0 provides Rust-based linting. See [the toolchain](docs/typescript-toolchain.md) for clean-checkout generation and distribution boundaries. Development uses pnpm 12.15.0 with a frozen lockfile; see [package management](docs/package-management.md).

Open http://127.0.0.1:4371. Development builds once and starts a local server; restart after source changes. `PORT=4372 pnpm run dev` selects another port.

```sh
pnpm run format         # Apply repository formatting
pnpm run check          # Format, lint, strict source types, schema, tests, build, consumer checks
pnpm exec playwright install chromium
pnpm run test:e2e       # Desktop/mobile browser tests; starts and stops its own server
```

For local testing with an installed Chrome, use `PLAYWRIGHT_CHANNEL=chrome pnpm run test:e2e`. CI installs the Playwright-managed Chromium version.

`pnpm run test:package` checks the archive allowlist, byte-identical repeated packing, and real offline installs into separate pnpm and npm consumer projects. Both consumers import ESM/JSON, exercise the API, verify channel isolation and immutability, and compile TypeScript against the installed declarations. No source-tree shortcuts are used for that test.

## Structure

| Path            | Purpose                                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| `exercises/`    | Authored JSON, one precise movement variation per record                        |
| `schema/`       | Exercise, catalogue and vocabulary contracts for validation and generated types |
| `src/`          | Framework-independent search/catalogue runtime and public API declarations      |
| `website/`      | Reference web catalogue, English/Spanish, filters and exercise pages            |
| `scripts/`      | Schema/domain checks, builds, package verification and local server             |
| `tests/`        | Unit, TypeScript consumer and browser tests                                     |
| `docs/`         | Content, architecture, release and production decisions                         |
| `dist/package/` | Generated distributable library, JSON and schema                                |
| `dist/site/`    | Generated static website; excluded from the npm archive                         |
| `.local/`       | Ignored research and local QA; never distributed                                |
| `artifacts/`    | Verified package archive and SHA-256 checksum; ignored by Git                   |

The site exposes `/data/catalogue.preview.json`, `/data/catalogue.published.json`, `/data/manifest.json` `/data/taxonomy.json`, `/schema/taxonomy.schema.json`, `/schema/catalogue.schema.json` and `/schema/exercise.schema.json`. Static hosting uses build command `pnpm run build` and output `dist/site`, served at the domain root. Pages remain `noindex,nofollow` during editorial preview. No deployment or analytics is configured.

## Prepare technical review and 3D production

Use `pnpm run review:prepare --exercise push-up --output .local/reviews/push-up-v1` to create a portable bilingual packet with preserved source/context and a pending human review form. Run `pnpm run review:verify --packet .local/reviews/push-up-v1` before recording a decision. See [review packets](docs/review-packets.md) and the [uniform 3D pilot](docs/animation-pilot.md). Generation and verification do not approve content or produce media.

## Quality and contribution

CI requires formatting, Oxlint, strict TypeScript source checking, canonical schema validation, unit tests, type checks and isolated package consumption on Node 22/24, plus desktop/mobile browser tests. A single `CI gate` aggregates these results for branch protection. Actions use immutable commit pins and minimal permissions; Dependabot proposes dependency and Action updates weekly.

Read [CONTRIBUTING.md](CONTRIBUTING.md), [architecture](docs/architecture.md), [data model](docs/data-model.md), [catalogue contract](docs/catalogue-contract.md), [taxonomy](docs/taxonomy.md), [release policy](docs/releases.md) and [media production](docs/media-production.md). [The expansion plan](docs/catalogue-expansion.md) explains how the eight-entry pilot grows into the broader library.

## License

Code and original exercise text/data are [MIT licensed](LICENSE), including reuse by other projects and commercial applications. Media has separate explicit licensing and attribution per asset; no media is included yet. Research references do not grant permission to redistribute other apps' text, imagery or private account exports.
