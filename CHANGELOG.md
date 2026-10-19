# Changelog

## Unreleased — 0.2.1 foundation preview

- Complete CAT-001 planning triage: public coverage/disposition matrix, 22 equivalence decisions and a precise 16-variation authoring batch. Keep candidate-level mappings private and all unresolved identities explicit; no exercise records or approvals are added by the plan.

- Add a standalone catalogue JSON Schema and generate the readonly `Catalogue` type from it. Keep existing record/envelope generation 2 and preserve all exercise content.
- Validate distribution metadata and both channels before building; reject drafts in published data while allowing empty distributions.
- Serve byte-identical package/site feeds. Validate schemas and data extracted from an installed archive, and expose the catalogue schema through the package, website and draft-release workflow.
- Document schema/domain validation boundaries and the compatibility decision. No release or deployment has been performed.

### Earlier foundation work (0.2.0)

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
