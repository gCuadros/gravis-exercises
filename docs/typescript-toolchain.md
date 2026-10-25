# TypeScript toolchain

## Decision and scope

Implementation, Node tools, website code and tests are TypeScript with `strict`, `verbatimModuleSyntax` and `erasableSyntaxOnly`. The canonical exercise/envelope schemas still own the data model. Generated record declarations are ignored under `src/`; `src/index.d.ts` supplies the readonly public API, and `src/taxonomy.types.ts` derives vocabulary keys from those generated types. A compile-only contract test checks the implementation against the public declarations.

TypeScript **7.0.2**, verified against the registry on 2026-10-25, is the stable Go-native compiler distributed as `typescript`. Use its normal `tsc` command, not `@typescript/native-preview`. See the [official TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/). Oxlint **1.89.0** supplies Rust-based linting with correctness checks and an explicit-any ban; `tsc` owns type checking. See [Oxlint configuration](https://oxc.rs/docs/guide/usage/linter/config).

This does not rewrite the consumer runtime in Go or Rust. Consumers receive standard JavaScript ESM, declarations and JSON, with zero runtime dependencies. No local speedup ratio is claimed without a representative benchmark.

## Clean checkout and build

1. Restore the pinned development dependencies with `pnpm install --frozen-lockfile`.
2. `pnpm run generate:types` validates source contracts and generates declarations directly from the schemas. It runs with Node type stripping, so missing generated type-only imports do not create a bootstrap cycle.
3. `pnpm run typecheck` generates those declarations then checks runtime, scripts, website, tests and Playwright configuration with `tsconfig.json`.
4. `pnpm run build` regenerates declarations and uses `tsconfig.runtime.json` to compile browser/library sources to ignored `.local/compiled/`, rewriting relative `.ts` imports to `.js`. Packaging copies only the expected runtime and declaration files into `dist/package/`; website output is separate.
5. `pnpm run check` gates formatting, lint, strict implementation checking, validation, unit tests, build, public consumer types and actual isolated archive installation. Browser tests exercise the compiled JavaScript on desktop/mobile.

Node tools/tests use `--experimental-strip-types`, compatible with the existing Node 22.13 minimum. Stripping types is execution, not type checking; the separate strict gate is required. Playwright transforms its TypeScript configuration/tests. Generated build files are never authored or committed.

## Boundaries

Untrusted validation inputs start as `unknown`; Ajv validation narrows their shape. Negative tests use narrowly scoped, explained `@ts-expect-error` directives for deliberate invalid inputs and forbidden mutations. Dependency interoperability assertions are localized (Ajv formats' CommonJS export and JSON Schema compiler input), not used to disable source checking.

The migration preserves exercise JSON, schema semantics, vocabulary, published/preview separation and public exports. Source paths change from `.js`/`.mjs` to `.ts`; internal contributors must use the documented scripts. The stable consumer entry points do not change.

Package management now uses pinned pnpm; see [package management](package-management.md) for setup, frozen installs and archive compatibility.
