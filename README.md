# Gravis Exercise Library

[![CI](https://github.com/gCuadros/gravis-exercises/actions/workflows/ci.yml/badge.svg)](https://github.com/gCuadros/gravis-exercises/actions/workflows/ci.yml)

Open exercise data for **any project** building around strength, calisthenics and functional training. Original English/Spanish content, stable identities, recording metadata and an explicit review workflow.

The library is independent of Gravis's application and website. Consume it as a dependency-free JavaScript module, with TypeScript declarations, or as plain JSON from another language. The website is a reference consumer of the same data and search utilities.

**Status:** foundation preview. Eight original draft entries; no technically reviewed entries or approved demonstrations yet. The default package and published dataset are intentionally empty until entries meet the publication gate. Preview data must be selected explicitly. The research inventory of 517 candidates is local and excluded from distribution.

## Use the library

There is no npm registry release yet. The package remains `private: true` to prevent accidental publication before the package name, release ownership and initial content are approved. Build a local archive, or download the `library-package` artifact from a successful CI run:

```sh
# In this repository
npm ci
npm run build
npm run test:package

# In a separate project, using the resulting archive
npm install /path/to/gravis-exercises/artifacts/gravis-exercises-0.1.0.tgz
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

The runtime uses standard ESM and works in Node.js 22.13+ and modern browsers/bundlers without a UI framework or network connection. The catalogue is deeply frozen; copy a record into your own model before modifying it. Lookups return `undefined` for unknown IDs/slugs. Search matches all query words across both languages, aliases, muscles and equipment, ignoring case and accents. Discipline and equipment filters are combined.

| Export                          | Contents                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| `gravis-exercises`              | Published catalogue, exercises and lookup/search functions |
| `gravis-exercises/preview`      | Same API, with all authored entries including drafts       |
| `gravis-exercises/data`         | Published JSON envelope                                    |
| `gravis-exercises/data/preview` | Preview JSON envelope                                      |
| `gravis-exercises/schema`       | Canonical JSON Schema, draft 2020-12                       |

JSON files can also be extracted from the archive or consumed directly from `dist/package/`, without JavaScript or npm at runtime. Each envelope has `schemaVersion`, `version`, `channel`, `license` and `exercises`. Preserve `id` as the identity; display names and slugs may change under a documented migration.

## Develop

Use a branch; never work directly on `main`. Node 22 is the default in `.nvmrc`; CI also exercises Node 24.

```sh
npm ci
npm run check
npm run dev
```

Open http://127.0.0.1:4371. Development builds once and starts a local server; restart after source changes. `PORT=4372 npm run dev` selects another port.

```sh
npm run format         # Apply repository formatting
npm run check          # Format, lint, schema, unit tests, build, types, package consumer
npx playwright install chromium
npm run test:e2e       # Desktop/mobile browser tests; starts and stops its own server
```

For local testing with an installed Chrome, use `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`. CI installs the Playwright-managed Chromium version.

`npm run test:package` checks the archive allowlist, byte-identical repeated packing, and a real offline install into a temporary external project. That consumer imports ESM/JSON, exercises the API, verifies channel isolation and immutability, and compiles TypeScript against the installed declarations. No source-tree shortcuts are used for that test.

## Structure

| Path            | Purpose                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| `exercises/`    | Authored JSON, one precise movement variation per record                   |
| `schema/`       | Single record contract for validation and generated types                  |
| `src/`          | Framework-independent search/catalogue runtime and public API declarations |
| `website/`      | Reference web catalogue, English/Spanish, filters and exercise pages       |
| `scripts/`      | Schema/domain checks, builds, package verification and local server        |
| `tests/`        | Unit, TypeScript consumer and browser tests                                |
| `docs/`         | Content, architecture, release and production decisions                    |
| `dist/package/` | Generated distributable library, JSON and schema                           |
| `dist/site/`    | Generated static website; excluded from the npm archive                    |
| `.local/`       | Ignored research and local QA; never distributed                           |
| `artifacts/`    | Verified package archive and SHA-256 checksum; ignored by Git              |

The site exposes `/data/catalogue.preview.json`, `/data/catalogue.published.json`, `/data/manifest.json` and `/schema/exercise.schema.json`. Static hosting uses build command `npm run build` and output `dist/site`, served at the domain root. Pages remain `noindex,nofollow` during editorial preview. No deployment or analytics is configured.

## Quality and contribution

CI requires formatting, ESLint, canonical schema validation, unit tests, type checks and isolated package consumption on Node 22/24, plus desktop/mobile browser tests. A single `CI gate` aggregates these results for branch protection. Actions use immutable commit pins and minimal permissions; Dependabot proposes dependency and Action updates weekly.

Read [CONTRIBUTING.md](CONTRIBUTING.md), [architecture](docs/architecture.md), [data model](docs/data-model.md), [release policy](docs/releases.md) and [media production](docs/media-production.md). [The expansion plan](docs/catalogue-expansion.md) explains how the eight-entry pilot grows into the broader library.

## License

Code and original exercise text/data are [MIT licensed](LICENSE), including reuse by other projects and commercial applications. Media has separate explicit licensing and attribution per asset; no media is included yet. Research references do not grant permission to redistribute other apps' text, imagery or private account exports.
