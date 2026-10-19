# Changelog

## Unreleased — 0.2.0 foundation preview

- Introduce a controlled bilingual vocabulary for disciplines, equipment, muscles, families and metrics; share it across search, the reference site and public JS/JSON exports.
- Reject unknown taxonomy keys, missing vocabulary translations, ambiguous aliases, primary/secondary muscle overlap and schema/vocabulary drift. Add generated filter-key types and isolated-consumer coverage.
- **Breaking:** exercise schema version 2 replaces free-text category fields with closed keys. Preserve every pilot ID/slug and review state. See [migration instructions](docs/migrations/0.2.0.md).
- Display the actual package version in the reference site and distinguish band equipment from band tracking metadata. All content remains draft; no release has been published.

- Make search and browser regression tests resilient to catalogue growth using isolated synthetic fixtures and explicit exercise selection.

- Add a tool-independent execution plan, status handoff and deferred product context, discoverable from README and AGENTS.

- Establish a framework-independent exercise library with ESM, generated TypeScript declarations and plain JSON exports.
- Keep published and editorial-preview channels explicit and separate; the first eight authored entries remain drafts with no demonstrations.
- Add the bilingual reference catalogue, canonical schema validation and stable exercise identities.
- Add isolated package installation tests, browser coverage, formatting, linting, locked development tools and CI for Node 22/24.
- Define contribution, media review, versioning and draft-release workflows.
