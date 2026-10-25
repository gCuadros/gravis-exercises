export { Ajv2020 } from 'ajv/dist/2020.js';
import formats from 'ajv-formats';
import type { FormatsPlugin } from 'ajv-formats';
// CJS default export is callable at runtime; NodeNext describes the module namespace.
// Keep this compatibility assertion at the dependency boundary, not in consumers.
export const addFormats = formats as unknown as FormatsPlugin;
