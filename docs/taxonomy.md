# Controlled vocabulary

The authored vocabulary lives in `src/taxonomy.js`. It contains stable keys, English/Spanish labels, definitions and search aliases, grouped by meaning. The dependency-free runtime and reference website use this same source. The build exports its plain JSON representation for consumers in any language; JavaScript is not required to read the distributed data.

## Namespaces and semantics

| Group         | Pilot terms | Meaning                                                                        |
| ------------- | ----------- | ------------------------------------------------------------------------------ |
| `disciplines` | 3           | Nonexclusive training categories; an exercise may belong to several            |
| `equipment`   | 10          | Equipment and supporting surfaces, including floor/wall                        |
| `muscles`     | 14          | Editorial muscle/group assignments, still pending technical review             |
| `families`    | 8           | Related movement variations; never a replacement for a specific exercise ID    |
| `metrics`     | 8           | Fields a logger can capture; no personal measurements or units are stored here |

These counts describe the initial vocabulary, not a cap on coverage. New movements may need new terms. Definitions are available alongside every label. They delimit editorial meaning; they do not certify a record's anatomy, technique or suitability for a person.

Keys are namespaced. `equipment/band` means the elastic equipment; `metrics/band` means the identity/specification of the band used. Band colors are not universal resistance values. `metrics/assistance` is separate numeric assistance, not negative load. Broad groups such as `shoulders` and the narrower `anterior-deltoids` retain separate meanings; there is no implicit parent/child inference or muscle aggregation. Exact duplication across primary/secondary muscles is rejected, but the validator does not decide biomechanical correctness.

## Consumption

```js
import { taxonomy, getTerm, getLabel } from 'gravis-exercises/taxonomy';

const equipmentKeys = Object.keys(taxonomy.groups.equipment);
const spanish = getLabel('equipment', 'band', 'es'); // Banda elástica
const metric = getLabel('metrics', 'band', 'es'); // Banda utilizada
const definition = getTerm('families', 'pull_up').definition.en;
```

All returned data is deeply readonly. Unknown keys return `undefined`, including inherited object-property names. The supported languages are `en` and `es`; unknown languages do not fall back silently. The website treats an unknown label as a build/render error so invalid references cannot appear as plausible display names.

`gravis-exercises/taxonomy/data` exports JSON with `{ schemaVersion: 1, groups }`; `/taxonomy/schema` exports its structural JSON Schema. This vocabulary **shape** version is independent of exercise record version 2. Vocabulary contents travel with the package distribution version; pair taxonomy and exercise files from the same archive. The exercise schema embeds closed enums, so record validation needs no network or external taxonomy resolver. The taxonomy schema checks the dictionary structure; release-specific allowed exercise keys are enforced by the exercise schema. Authoring checks additionally reject ambiguous normalized labels/aliases within a group and language.

Search includes equipment, muscle, discipline and family keys, labels and aliases in both languages, alongside exercise names/aliases. Definition prose and metric names are not indexed. Aliases help discovery; they never automatically rewrite stored keys or merge exercise identities.

## Extending the vocabulary

1. Look for an existing term and read its definition before proposing another. A wording synonym normally belongs in aliases, not a new key.
2. Add a term in `src/taxonomy.js`, including both labels, both definitions and explicit bilingual alias lists (empty lists are valid).
3. Preserve existing keys. Equipment/muscle keys use hyphens; existing family/metric compound keys use underscores. Continue each group's convention. Do not silently normalize persisted keys or translate them.
4. Run `npm run taxonomy:sync` to update only the vocabulary-controlled parts of `schema/exercise.schema.json`. Review and commit the schema diff. Builds and validation fail on drift; they do not rewrite source files.
5. Update records with canonical keys, check migration/version impact and document it. IDs and slugs must not change just because a term's wording changes. Unknown legacy terms require an explicit editorial mapping or a new reviewed term, never a guessed substitution.
6. Run `npm run check` and browser tests. Consumer record and filter types derive from the schema, and taxonomy types reuse those keys. Update relevant semantic tests for the addition.

Labels and aliases may be corrected without changing identity. Renaming/removing a key or changing its meaning requires a migration and compatibility decision. Adding keys also requires checking exhaustive consumer logic and catalogue coverage; do not assume all consumers accept new categories automatically.
