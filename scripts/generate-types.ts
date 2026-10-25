import { writeFile } from 'node:fs/promises';
import { compile, type JSONSchema } from 'json-schema-to-typescript';
import { schema } from './lib.ts';
import { catalogueSchema } from './catalogue-contract.ts';
for (const [name, contract] of [
  ['exercise', schema],
  ['catalogue', catalogueSchema],
] as const) {
  const generated = await compile(
    contract as unknown as JSONSchema,
    name === 'exercise' ? 'Exercise' : 'Catalogue',
    {
      bannerComment:
        name === 'exercise'
          ? '/* Generated from schema/exercise.schema.json. Do not edit. */'
          : '/* Generated from the bundled catalogue schema. Do not edit. */',
      additionalProperties: false,
    },
  );
  await writeFile(new URL(`../src/${name}.generated.d.ts`, import.meta.url), generated);
}
