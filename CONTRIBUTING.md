# Contributing

## Start on a branch

Never edit or commit on `main`. Start a focused branch, run `npm ci`, and open a pull request with the resulting change. Follow [AGENTS.md](AGENTS.md) and the [release policy](docs/releases.md). Keep the reusable package independent of the website and application.

## Add or refine an exercise

1. Check for an existing identity and variation. Translate names and add search aliases without creating duplicate movements.
2. Select canonical equipment, muscle, family, discipline and metric keys from the [controlled vocabulary](docs/taxonomy.md). Add any genuinely missing terms there first and run `npm run taxonomy:sync`. Create `exercises/<slug>.json` using the schema and an existing record as a structural example. Author the content yourself. Preserve stable IDs when editing; new IDs must be unique and match `grv_` followed by 12 lowercase letters or digits.
3. Describe the exact variation in English and Spanish: equipment, start position, movement, return, control cues and recording convention. Distinguish load, repetitions, hold time, assistance, distance and machine output.
4. Set `status: "draft"`, technical review to `pending`, reviewer/date to `null`, and `media: []` until actual evidence is available. Do not invent a reviewer, source license or demonstration URL.
5. Prepare an offline [review packet](docs/review-packets.md) for the selected identities and verify it against the current checkout before recording a decision. Have a qualified movement professional review technique, muscle assignments, translations and tracking. Record their agreed attribution and review date. Any material movement change requires a new review; set the entry back to draft until completed.
6. Produce and review the visual demonstration using [the media workflow](docs/media-production.md). Keep assets explicit about authorship and reuse rights.
7. Set `status: "published"` only when the technical and media gates pass. Automated validation checks the recorded evidence; it cannot establish biomechanical correctness or verify permission on its own.
8. Run `npm run check` and `npm run test:e2e`; inspect the page on mobile and desktop in both languages. A contract/API change also needs an updated consumer example, version/migration decision and changelog entry.

## Content boundaries

Use competitors to identify coverage gaps, not as a source of copied instructions or media. Do not add private account exports, workout history, credentials, participant contact details or unlicensed assets to tracked files. Keep local research in `.local/`, which is excluded from Git and generated output.

Submission of original text/code is under the repository MIT license. Media must specify its own compatible reuse terms and necessary attribution. Put only public reviewer attribution in published records.

## Propose a change

Explain the movement or user problem, why existing records do not cover it, and what you checked. Include the resulting record ID and screenshots for visible changes. Stable IDs must not be recycled for different exercises. A slug rename requires a redirect plan before a public release.
