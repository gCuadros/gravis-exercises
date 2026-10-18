// Synthetic, schema-valid records for tests only. Never write these into exercises/.
export function exerciseFixture(overrides = {}) {
  return structuredClone({
    schemaVersion: 1,
    id: 'grv_test00000001',
    slug: 'test-band-pull-up',
    status: 'draft',
    names: { en: 'Synthetic band-assisted pull-up', es: 'Dominada sintética con banda' },
    aliases: { en: ['BAPU'], es: ['Tracción de prueba'] },
    summary: {
      en: 'Synthetic test record, not coaching content.',
      es: 'Registro sintético para pruebas, no contenido de entrenamiento.',
    },
    disciplines: ['strength', 'calisthenics'],
    family: 'pull_up',
    equipment: ['pull-up-bar', 'band'],
    muscles: { primary: ['lats'], secondary: ['biceps'] },
    tracking: {
      required: ['repetitions'],
      optional: [],
      loadConvention: 'none',
      notes: { en: 'Test recording convention.', es: 'Convención de registro de prueba.' },
    },
    instructions: { en: ['Synthetic test instruction.'], es: ['Instrucción sintética de prueba.'] },
    cues: { en: ['Synthetic test cue.'], es: ['Indicación sintética de prueba.'] },
    review: { technical: 'pending', reviewer: null, reviewedAt: null },
    media: [],
    license: 'MIT',
    provenance: {
      kind: 'gravis-authored',
      note: 'Original synthetic fixture used only in automated tests.',
    },
    ...overrides,
  });
}

export function searchFixtures() {
  return [
    exerciseFixture(),
    exerciseFixture({
      id: 'grv_test00000002',
      slug: 'test-bodyweight-pull-up',
      names: { en: 'Synthetic bodyweight pull-up', es: 'Dominada sintética sin asistencia' },
      aliases: { en: ['BWPU'], es: ['Dominada libre de prueba'] },
      disciplines: ['calisthenics'],
      equipment: ['pull-up-bar'],
    }),
    exerciseFixture({
      id: 'grv_test00000003',
      slug: 'test-functional-pull-up',
      names: { en: 'Synthetic functional pull-up', es: 'Dominada sintética funcional' },
      aliases: { en: ['FPU'], es: [] },
      disciplines: ['functional'],
    }),
    exerciseFixture({
      id: 'grv_test00000004',
      slug: 'test-rowing-ergometer',
      names: { en: 'Synthetic rowing ergometer', es: 'Ergómetro de remo sintético' },
      aliases: { en: ['ERG'], es: ['Remo de prueba'] },
      disciplines: ['functional'],
      family: 'ergometer_row',
      equipment: ['rowing-ergometer'],
      muscles: { primary: ['quadriceps'], secondary: [] },
      tracking: {
        required: ['duration'],
        optional: ['distance'],
        loadConvention: 'none',
        notes: { en: 'Synthetic duration.', es: 'Duración sintética.' },
      },
    }),
  ];
}
