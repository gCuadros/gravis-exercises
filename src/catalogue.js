export const normalize = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_]/g, ' ');
export function filterExercises(
  exercises,
  { query = '', discipline = 'all', equipment = 'all' } = {},
) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return exercises.filter((e) => {
    const categories = [
      ...e.equipment,
      ...e.disciplines,
      ...e.muscles.primary,
      ...e.muscles.secondary,
    ];
    const haystack = normalize(
      [
        e.names.en,
        e.names.es,
        ...e.aliases.en,
        ...e.aliases.es,
        ...categories,
        ...categories.flatMap((k) => [label(k, 'en'), label(k, 'es')]),
      ].join(' '),
    );
    return (
      (discipline === 'all' || e.disciplines.includes(discipline)) &&
      (equipment === 'all' || e.equipment.includes(equipment)) &&
      words.every((w) => haystack.includes(w))
    );
  });
}
export const labels = {
  strength: { en: 'Strength', es: 'Fuerza' },
  calisthenics: { en: 'Calisthenics', es: 'Calistenia' },
  functional: { en: 'Functional', es: 'Funcional' },
  barbell: { en: 'Barbell', es: 'Barra' },
  bench: { en: 'Bench', es: 'Banco' },
  'pull-up-bar': { en: 'Pull-up bar', es: 'Barra de dominadas' },
  band: { en: 'Resistance band', es: 'Banda elástica' },
  parallettes: { en: 'Parallettes', es: 'Paralelas bajas' },
  rope: { en: 'Climbing rope', es: 'Cuerda de trepa' },
  'jump-rope': { en: 'Jump rope', es: 'Comba' },
  wall: { en: 'Wall', es: 'Pared' },
  floor: { en: 'Floor', es: 'Suelo' },
  'rowing-ergometer': { en: 'Rowing ergometer', es: 'Ergómetro de remo' },
  repetitions: { en: 'Repetitions', es: 'Repeticiones' },
  load: { en: 'Load', es: 'Carga' },
  duration: { en: 'Time', es: 'Tiempo' },
  distance: { en: 'Distance', es: 'Distancia' },
  machine_calories: { en: 'Machine calories', es: 'Calorías del monitor' },
  ascent_height: { en: 'Ascent height', es: 'Altura de ascenso' },
  pectorals: { en: 'Chest', es: 'Pectorales' },
  triceps: { en: 'Triceps', es: 'Tríceps' },
  'anterior-deltoids': { en: 'Front delts', es: 'Deltoides anterior' },
  lats: { en: 'Lats', es: 'Dorsales' },
  biceps: { en: 'Biceps', es: 'Bíceps' },
  'upper-back': { en: 'Upper back', es: 'Espalda alta' },
  abdominals: { en: 'Abdominals', es: 'Abdominales' },
  'hip-flexors': { en: 'Hip flexors', es: 'Flexores de cadera' },
  calves: { en: 'Calves', es: 'Gemelos' },
  quadriceps: { en: 'Quadriceps', es: 'Cuádriceps' },
  glutes: { en: 'Glutes', es: 'Glúteos' },
  hamstrings: { en: 'Hamstrings', es: 'Isquiosurales' },
  forearms: { en: 'Forearms', es: 'Antebrazos' },
  shoulders: { en: 'Shoulders', es: 'Hombros' },
};
export const label = (key, lang = 'en') => labels[key]?.[lang] || key.replaceAll('-', ' ');

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeDeep(child);
    Object.freeze(value);
  }
  return value;
}

// Each entry point owns its dataset; importing the default never loads preview data.
export function createCatalogue(data) {
  const catalogue = freezeDeep(data);
  const byId = new Map(catalogue.exercises.map((exercise) => [exercise.id, exercise]));
  const bySlug = new Map(catalogue.exercises.map((exercise) => [exercise.slug, exercise]));
  return Object.freeze({
    catalogue,
    exercises: catalogue.exercises,
    getExerciseById: (id) => byId.get(id),
    getExerciseBySlug: (slug) => bySlug.get(slug),
    findExercises: (options = {}) => Object.freeze(filterExercises(catalogue.exercises, options)),
  });
}
