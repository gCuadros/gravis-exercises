# Repository working agreement

## Portable entry point

Before work, read [plan.md](plan.md) and [status.md](status.md). These are the tool-independent plan and handoff; do not assume access to the original conversation or persistent agent memory. Verify their snapshot against the current checkout. Keep task states, evidence, limitations and the next action current in `status.md`; update `plan.md` when scope, dependencies or acceptance criteria change. Human maintainers and harnesses that do not discover AGENTS automatically should follow the same entry links in README.

## Working rules

- Never implement or commit directly on `main`. Inspect the current branch and working tree before edits. Use a focused feature/fix/chore branch and preserve user changes.
- Treat the reusable library as the product. The website is one consumer. Keep the runtime independent of UI frameworks, Node-only APIs, network access and runtime dependencies.
- Keep `schema/exercise.schema.json` as the canonical record contract. Generate consumer types during the build; do not hand-maintain a second model. Document breaking changes and identity migrations.
- Never expose drafts through the default package entry point. Preview content requires the explicit preview entry point. Keep dataset identities stable.
- Source text/code is MIT licensed. Media requires its own truthful provenance, permission and technical review. Never invent approval, copy competitor media or commit private research/account exports.
- Keep generated outputs, `.local/`, secrets and large production media out of Git and the package. Audit the actual archive, not only the source directory.
- Use `npm ci`. Before completing a change, run `npm run check`; run `npm run test:e2e` for changes to the website/browser runtime. Fix failures rather than bypassing a gate. Report checks that could not run.
- Pin workflow actions to immutable commits, use minimal permissions and maintain lockfile consistency. Do not add auto-merge, deploy or registry publication without a defined release decision.
- Keep changes reviewable through a pull request. Do not merge, push to main, create a release tag or publish a package as part of ordinary implementation work.
