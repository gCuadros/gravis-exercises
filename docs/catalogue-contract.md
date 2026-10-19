# Catalogue envelope contract

The distribution wraps exercise records with metadata. Its source contract is `schema/catalogue.schema.json`, which references the canonical exercise schema. The build bundles those references into one self-contained `catalogue.schema.json`, exported as **`gravis-exercises/schema/catalogue`** and served at `/schema/catalogue.schema.json`. A consumer can validate the entire JSON document offline without fetching another schema.

## Fields and channels

| Field           | Contract                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `schemaVersion` | The record/envelope contract generation, currently `2`; reused from the exercise schema          |
| `version`       | The package distribution version, a SemVer string (including valid prerelease/build identifiers) |
| `channel`       | Exactly `published` or `preview`                                                                 |
| `license`       | `MIT` for original text/data; individual media licenses still apply                              |
| `exercises`     | An array of valid records; empty is valid for either distribution channel                        |

All five fields are required. Additional root fields are rejected. Every record must satisfy the same exercise schema, including taxonomy keys and publication requirements.

- `published` accepts only records whose status is `published`, with technical approval and approved media as required by the record contract.
- `preview` accepts drafts and published entries. A record claiming `published` must still meet the publication gate, even in preview.
- An empty published collection is an honest result while no content has been approved. An empty source directory remains an authoring error; source validation and distribution validation have different purposes.

For example, the current published JSON has this shape:

```json
{
  "schemaVersion": 2,
  "version": "0.2.1",
  "channel": "published",
  "license": "MIT",
  "exercises": []
}
```

## Consumer validation

Use a JSON Schema draft 2020-12 validator with date/URI format assertions enabled. With Ajv installed in the **consumer's** toolchain:

```js
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import schema from 'gravis-exercises/schema/catalogue' with { type: 'json' };
import data from 'gravis-exercises/data' with { type: 'json' };

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(data)) throw new Error(JSON.stringify(validate.errors));
```

Ajv is a development dependency of this repository, not a runtime dependency of the distributed library. Other languages can extract the schema and data from the archive and use their own validator. The source schema references its sibling exercise schema; use the **bundled export**, rather than copying the source envelope file alone, for a standalone consumer.

`Catalogue` TypeScript declarations are generated from the bundled contract and exposed as deeply readonly data. Types describe the shape; they do not prove SemVer validity, date validity, identity uniqueness or conditional publication requirements. Validate untrusted JSON at runtime. The lightweight library lookup/search API assumes build-validated records and does not bundle a validator.

## Domain checks and limits

Repository validation additionally checks unique IDs and slugs, disjoint primary/secondary muscles, disjoint required/optional metrics and HTTPS media URLs with a hostname and no credentials. These cross-field/domain checks supplement JSON Schema; schema validation alone does not prove them. Consumers accepting independently edited catalogues must enforce these documented constraints too. Filename/slug agreement applies only to the source files.

Validation checks the presence and consistency of recorded review evidence. It cannot establish that a reviewer actually approved technique or that an asset license is authentic.

## Build and compatibility

`createDistribution` validates the complete preview before filtering the published subset, then validates that subset. Invalid records cannot disappear silently through filtering. The package and site use exactly the same serialized JSON files. Package verification reads the schema and data from an actual isolated archive installation, compiles the schema with no other registered schemas, validates both channels and checks byte equality with the website feeds.

Version **0.2.1** adds this schema export and generated envelope types without changing the five-field format, exercise records or schema version 2 from 0.2.0. Existing library-generated data remains valid, so no record migration is needed. The new schema explicitly rejects invalid custom metadata such as a non-SemVer version. Envelope validation does not require `version` to equal today's package version; older compatible distributions remain valid. The build/package checks separately ensure each artifact matches its own manifest version.

The envelope and exercise schema share contract generation 2; the envelope's version constraint derives from the record schema. A future incompatible change to either must review both contracts, increment the shared generation deliberately and document the migration. Taxonomy JSON retains its independent shape version 1. Distribution versions identify content releases and do not represent exercise identity.
