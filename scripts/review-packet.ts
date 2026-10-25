import type { Exercise } from '../src/index.js';
import type { TaxonomyGroup, Term } from '../src/taxonomy.types.ts';
interface ReviewContext {
  version: string;
  files: Record<string, string>;
}
interface ReviewPacket {
  files: Map<string, string>;
  forms: Map<string, string>;
}
interface ReviewManifest {
  packetVersion: 1;
  packageVersion: string;
  context: Record<string, string>;
  exercises: { id: string; slug: string; sourceSha256: string; reportSha256: string }[];
}
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadCatalogue, root, validateCatalogue } from './lib.ts';
import { taxonomy } from '../src/taxonomy.ts';

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const escape = (text: string) =>
  text.replace(/[\\`*_{}[\]()<>#!|~&]/g, (char) => `&#${char.codePointAt(0)};`);
const contextPaths = [
  'schema/exercise.schema.json',
  'docs/media-production.md',
  'docs/animation-pilot.md',
  'docs/review-packets.md',
  'docs/batches/001-foundations.md',
];

function renderRecord(e: Exercise) {
  const lines = [
    `# ${escape(e.names.en)} / ${escape(e.names.es)}`,
    '',
    `ID: ${e.id} · Slug: ${e.slug}`,
    '',
    `Source status: ${e.status}; technical review: ${e.review.technical}.`,
    'This snapshot is not an approval. Record the human assessment in review.md.',
  ];
  for (const lang of ['en', 'es'] as const) {
    const label = (group: TaxonomyGroup, key: string) =>
      escape((taxonomy.groups[group] as Readonly<Record<string, Term>>)[key].labels[lang]);
    lines.push(
      '',
      `## ${lang === 'en' ? 'English' : 'Español'}`,
      '',
      escape(e.summary[lang]),
      '',
      `- ${lang === 'en' ? 'Family' : 'Familia'}: ${label('families', e.family)}`,
      `- ${lang === 'en' ? 'Equipment' : 'Material'}: ${e.equipment.map((k) => label('equipment', k)).join(', ')}`,
      `- ${lang === 'en' ? 'Proposed primary muscles' : 'Músculos principales propuestos'}: ${e.muscles.primary.map((k) => label('muscles', k)).join(', ')}`,
      `- ${lang === 'en' ? 'Proposed secondary muscles' : 'Músculos secundarios propuestos'}: ${e.muscles.secondary.map((k) => label('muscles', k)).join(', ') || '—'}`,
      '',
      `### ${lang === 'en' ? 'Movement' : 'Movimiento'}`,
      '',
      ...e.instructions[lang].map((step, i) => `${i + 1}. ${escape(step)}`),
      '',
      `### ${lang === 'en' ? 'Cues' : 'Indicaciones'}`,
      '',
      ...e.cues[lang].map((cue) => `- ${escape(cue)}`),
      '',
      `### ${lang === 'en' ? 'Recording' : 'Registro'}`,
      '',
      `- ${lang === 'en' ? 'Required' : 'Obligatorio'}: ${e.tracking.required.map((k) => label('metrics', k)).join(', ')}`,
      `- ${lang === 'en' ? 'Optional' : 'Opcional'}: ${e.tracking.optional.map((k) => label('metrics', k)).join(', ') || '—'}`,
      `- loadConvention: ${e.tracking.loadConvention}`,
      '',
      escape(e.tracking.notes[lang]),
    );
  }
  lines.push(
    '',
    '## Complete source and context',
    '',
    '[Exercise JSON](exercise.json) includes names, aliases, disciplines, review, media and provenance.',
    '[Production workflow](../../context/docs/media-production.md) · [3D pilot](../../context/docs/animation-pilot.md) · [B001 review points](../../context/docs/batches/001-foundations.md)',
    '',
    'Existing media entries are metadata only; this tool does not fetch, inspect or approve any asset.',
    '',
  );
  return lines.join('\n');
}

function reviewForm(e: Exercise) {
  return `# Human review — ${e.id}\n\nStatus: pending. This editable form does not update exercise data or authorize publication.\n\n- Public reviewer attribution: unassigned\n- Relevant expertise / scope: unassigned\n- Review date (YYYY-MM-DD): pending\n- Exercise ID: ${e.id}\n- Source SHA-256: see manifest.json\n- Text / anatomy / recording decision: pending\n- English / Spanish terminology decision: pending\n- Animation asset filename and version: not supplied\n- SHA-256 of the actual reviewed asset bytes: not supplied\n- Full clip / frame review decision: pending\n- Creator and proposed reuse license: unverified\n- Rights evidence reference (keep private documents outside this packet): pending\n\n## Observations to complete\n\n- Exact variation, starting position and endpoints:\n- Main and supporting muscle proposals:\n- Counting, load, duration, distance or side conventions:\n- Rig anatomy, joints, grip and equipment contact:\n- Foot/hand support, balance, load path and full cycle:\n- Loop seam versus real start/finish; camera occlusion:\n- Agreement of the full clip with both languages:\n- Corrections, with frame/time references:\n- Outstanding questions and explicit scope of any decision:\n\nLeave unresolved items pending. An automated check, unchecked box or elapsed time is not a review.\n`;
}

// Development tooling only; none of these Node APIs enter the consumer runtime.
export function buildReviewPacket(
  entries: readonly Exercise[],
  context: ReviewContext,
  selectors: readonly string[],
): ReviewPacket {
  const errors = validateCatalogue(entries);
  if (errors.length) throw new Error(errors.join('\n'));
  if (!Array.isArray(selectors) || !selectors.length)
    throw new Error('Select at least one exercise');
  const selected = selectors.map((selector) => {
    const entry = entries.find((e) => e.id === selector || e.slug === selector);
    if (!entry) throw new Error(`Unknown exercise: ${selector}`);
    return entry;
  });
  if (new Set(selected.map((e) => e.id)).size !== selected.length)
    throw new Error('Duplicate exercise selection');
  selected.sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const files = new Map();
  const manifest: ReviewManifest = {
    packetVersion: 1,
    packageVersion: context.version,
    context: {},
    exercises: [],
  };
  for (const [name, content] of Object.entries(context.files).sort(([a], [b]) =>
    a.localeCompare(b, 'en'),
  )) {
    if (
      name.startsWith('/') ||
      name.split('/').some((part) => part === '..' || !part) ||
      name.includes('\\')
    )
      throw new Error('Invalid context path');
    const filename = `context/${name}`;
    files.set(filename, content);
    manifest.context[filename] = digest(content);
  }
  for (const entry of selected) {
    const dir = `exercises/${entry.slug}`;
    const snapshot = json(entry);
    const report = renderRecord(entry);
    files.set(`${dir}/exercise.json`, snapshot);
    files.set(`${dir}/snapshot.md`, report);
    manifest.exercises.push({
      id: entry.id,
      slug: entry.slug,
      sourceSha256: digest(snapshot),
      reportSha256: digest(report),
    });
  }
  files.set('manifest.json', json(manifest));
  files.set(
    'README.md',
    `# Gravis review packet\n\nPackage: ${context.version}. No reviews are granted by generating this packet.\n\n${selected.map((e) => `- [${escape(e.names.en)} / ${escape(e.names.es)}](exercises/${e.slug}/snapshot.md) — [review form](exercises/${e.slug}/review.md)`).join('\n')}\n\nRead the preserved context before reviewing. Copied context documents retain their original repository-relative reference links; the index and exercise snapshot links work within this packet, but references to unselected records or other repository documents require the checkout. Keep snapshot.md, exercise.json, context/ and manifest.json unchanged; write decisions only in review.md. The exercise JSON is a complete normalized snapshot, not the original file bytes. Its SHA-256 includes all fields; context fingerprints include vocabulary, schema and production guidance.\n\nFrom a checkout with the same content and locked toolchain, run:\n\n    npm run review:verify -- --packet /path/to/this-packet\n\nVerification compares every generated snapshot/context byte with the current checkout. It detects drift or edits, not reviewer identity, correctness, asset changes or permission. It is not a signature. The editable forms are never parsed as approvals. No media is downloaded or inspected. Before recording a human decision, verify the packet and separately check the actual asset version/hash. Transfer decisions through a reviewed content PR, preserving pending states where evidence is missing.\n`,
  );
  return {
    files,
    forms: new Map(selected.map((e) => [`exercises/${e.slug}/review.md`, reviewForm(e)])),
  };
}

export async function writeReviewPacket(destination: string, packet: ReviewPacket) {
  // Never overwrite a previous packet or a reviewer's notes, including empty existing dirs.
  await mkdir(path.dirname(destination), { recursive: true });
  await mkdir(destination);
  try {
    for (const [name, content] of [...packet.files, ...packet.forms]) {
      const filename = path.join(destination, name);
      await mkdir(path.dirname(filename), { recursive: true });
      await writeFile(filename, content, { flag: 'wx' });
    }
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}

export async function verifyReviewPacket(
  destination: string,
  entries: readonly Exercise[],
  context: ReviewContext,
) {
  const manifest: unknown = JSON.parse(
    await readFile(path.join(destination, 'manifest.json'), 'utf8'),
  );
  if (
    !manifest ||
    typeof manifest !== 'object' ||
    !('packetVersion' in manifest) ||
    !('exercises' in manifest) ||
    manifest.packetVersion !== 1 ||
    !Array.isArray(manifest.exercises) ||
    !manifest.exercises.every(
      (e) => e && typeof e === 'object' && 'id' in e && typeof e.id === 'string',
    )
  )
    throw new Error('Invalid review manifest');
  // Only current validated IDs choose paths. Never read a path supplied by a manifest.
  const expected = buildReviewPacket(
    entries,
    context,
    manifest.exercises.map((e) => e.id),
  );
  for (const [name, content] of expected.files) {
    if ((await readFile(path.join(destination, name), 'utf8')) !== content)
      throw new Error(`Review packet changed or is stale: ${name}`);
  }
  return expected.forms.size;
}

export function parseReviewArgs(args: string[]) {
  const [mode, ...rest] = args;
  if (!['prepare', 'verify'].includes(mode)) throw new Error('Expected prepare or verify');
  const selectors = [];
  let destination;
  for (let i = 0; i < rest.length; i += 2) {
    const flag = rest[i];
    const value = rest[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag === '--exercise' && mode === 'prepare') selectors.push(value);
    else if (flag === (mode === 'prepare' ? '--output' : '--packet') && !destination)
      destination = value;
    else throw new Error(`Unknown or repeated argument: ${flag}`);
  }
  if (!destination || (mode === 'prepare' && !selectors.length))
    throw new Error('Specify a destination and, for prepare, at least one --exercise ID-or-slug');
  return { mode, selectors, destination: path.resolve(destination) };
}

export async function loadReviewContext() {
  const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const files = Object.fromEntries(
    await Promise.all(
      contextPaths.map(async (name) => [name, await readFile(path.join(root, name), 'utf8')]),
    ),
  );
  files['taxonomy.json'] = json(taxonomy);
  return { version, files };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { mode, selectors, destination } = parseReviewArgs(process.argv.slice(2));
    const entries = await loadCatalogue();
    const context = await loadReviewContext();
    if (mode === 'prepare') {
      const packet = buildReviewPacket(entries, context, selectors);
      await writeReviewPacket(destination, packet);
      console.log(
        `Prepared ${packet.forms.size} review forms in ${destination}. All decisions remain pending.`,
      );
    } else {
      const count = await verifyReviewPacket(destination, entries, context);
      console.log(
        `Verified ${count} snapshots against this checkout. Human decisions, media and rights were not validated.`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
