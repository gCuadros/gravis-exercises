# Architecture

## Product boundary

The reusable exercise library is the primary product. Gravis's fitness app, the reference web catalogue and third-party projects are consumers. No authentication, user history, AI service, UI framework or Gravis backend is required to use the library.

This repository intentionally remains one package with one reference website. A monorepo/task orchestrator would add overhead without a second independently released package.

## Data flow

1. Authors maintain records in `exercises/` and the contract in `schema/exercise.schema.json`.
2. Ajv validates the actual JSON Schema, including review/publication conditions and calendar formats. Additional domain checks cover identity uniqueness, filenames, metric/muscle role overlap and delivery URLs.
3. The build generates TypeScript record declarations from that same schema and envelope declarations from the bundled catalogue schema and combines them with the small handwritten API declarations. TypeScript describes shapes; the build-time validator enforces constraints that types cannot express, such as calendar validity and review conditions.
4. The build validates complete preview/published envelopes, then emits isolated entry points and JSON envelopes in `dist/package/`. Both use the same dependency-free runtime. The default entry point does not import or load preview data.
5. The reference website is built into `dist/site/` from the same authored records and runtime. It deliberately displays preview status. It serves byte-identical copies of the package feeds and exposes the bundled catalogue schema. Its pages/assets never enter the library archive.
6. Package verification installs the actual archive into a temporary unrelated project, then checks its public exports and declarations. CI retains the verified archive and checksum for inspection.

## Contract and ownership

- IDs survive translation and wording changes. Source-app IDs and personal workout history do not belong in this public identity space.
- An exercise represents a precise variation. Family keys relate movements without merging their instructions or tracking conventions.
- Consumers receive immutable shared records. User-specific changes should live in a separate application model or a cloned object.
- Review state and media provenance are visible data, not implied by presence in Git. A published record needs technical approval and an approved demonstration. Automation validates the recorded decision; it cannot replace professional review.
- English and Spanish are required in v2. Adding languages, fields or tracking semantics requires contract and consumer impact review.

## Current boundaries

The catalogue has 24 drafts (eight pilot records plus B001 Groups A and B) and no media. The [controlled vocabulary](taxonomy.md) is authored in `src/taxonomy.ts`, shared by runtime and website and exported as plain JSON. Its structure has a separate schema; record enums are synchronized explicitly and drift fails validation/build. Vocabulary TypeScript keys reuse generated record types. The data is distributed in full and searched in memory, which suits the current catalogue. Benchmark payload size and search latency before expanding to very large collections.

Build tooling is allowed development dependencies; consumers have zero runtime dependencies. The supported JavaScript API is ESM, with Node 22.13+ and modern browser/bundler consumption tested. JSON is the language-independent interchange format. Other runtimes, CommonJS-only toolchains and assistive technologies are not implied to have been exhaustively tested.

The [catalogue contract](catalogue-contract.md) keeps authored schemas reusable: the envelope references the exercise contract, while the build rebases those references into a single offline schema. Conditional publication requirements are enforced by validation, not assumed from TypeScript types.
