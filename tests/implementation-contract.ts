// Compile-only bridge: public declarations must describe the actual runtime.
import { createCatalogue } from '../src/catalogue.ts';
import * as vocabulary from '../src/taxonomy.ts';
import type * as Public from '../src/index.js';
import type * as PublicTaxonomy from '../src/taxonomy.types.ts';

const empty: Public.Catalogue = {
  schemaVersion: 2,
  version: '0.4.0',
  channel: 'published',
  license: 'MIT',
  exercises: [],
};
const api: typeof Public = createCatalogue(empty);
const terms: typeof PublicTaxonomy = vocabulary;
void api;
void terms;
