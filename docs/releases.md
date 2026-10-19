# Changes and releases

## Branch workflow

Implement changes on a focused branch and open a pull request against `main`. Every PR runs the `CI` workflow. Configure branch protection to require pull requests, the successful `CI gate`, resolved conversations and no force pushes/deletions. With one maintainer, requiring another approving reviewer would block every PR; automated checks remain mandatory.

`AGENTS.md` records the working rules for coding agents. The PR template and CODEOWNERS make expected validation and ownership visible. They supplement branch protection; a file alone cannot enforce repository settings.

## Version policy

`package.json` is the distribution version; update its lockfile metadata together. `schemaVersion` is the data contract version, currently 2. For pre-1.0 releases, use a minor version for incompatible API/schema changes and a patch version for compatible fixes. Every intentionally distributed data change gets a release version. Preserve IDs; record replacements, removals and slug redirects in a migration note.

The taxonomy JSON shape has its own `schemaVersion` (currently 1); vocabulary contents use the package distribution version. See the [0.2.0 migration](migrations/0.2.0.md).

Version 0.2.1 adds the [catalogue contract](catalogue-contract.md) without changing the existing data shape or record version. Future incompatible envelope or record changes must review the shared contract generation.

Add relevant changes to `CHANGELOG.md`. Include content status and migrations, not only implementation details. Never claim a reviewed catalogue merely because the package's software checks pass.

## Package availability

The package is intentionally private to prevent accidental npm registry publication. It can still be built, packed and installed from a local archive or CI artifact. Before a registry launch, confirm the final package name/scope and ownership, choose registry authentication/provenance, and remove the publication guard in a reviewed PR. No registry token or automated npm publication is configured.

## Draft release workflow

A maintainer may push a version tag such as `v0.2.1` after a reviewed merge and an explicit release decision. The `Prepare release` workflow:

1. Runs the same reusable CI checks against the tagged commit.
2. Verifies the tag matches the package version.
3. Rebuilds and tests the distributable archive in an isolated consumer.
4. Creates a **draft** GitHub release with the archive, SHA-256 checksum, separate preview/published JSON, exercise and bundled catalogue schemas, vocabulary JSON and its schema.

It does not publish to npm, deploy the site or publish the draft release automatically. A maintainer reviews release notes, licenses, content status and artifacts before publication. Tags and release publication are not part of ordinary development tasks.

## Validation commands

- `npm ci`: restore the locked development tools.
- `npm run check`: formatting, lint, schema/domain validation, unit tests, build, consumer types and actual package installation.
- `npm run test:e2e`: Chromium desktop/mobile flows, browser runtime, language persistence, private path isolation and narrow-screen layout.

The `CI gate` fails when either the Node matrix or browser job fails or is cancelled. Workflow runs use minimal permissions and pinned Action commits. Dependency updates are reviewed as PRs; there is no auto-merge policy.
