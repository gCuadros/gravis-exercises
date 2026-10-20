// Authored vocabulary. Record enums and consumer types are derived from these keys.
const term = (en, es, definitionEn, definitionEs, aliasesEn = [], aliasesEs = []) => ({
  labels: { en, es },
  definition: { en: definitionEn, es: definitionEs },
  aliases: { en: aliasesEn, es: aliasesEs },
});

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

export const taxonomy = freezeDeep({
  schemaVersion: 1,
  groups: {
    disciplines: {
      strength: term(
        'Strength',
        'Fuerza',
        'Training organized around developing muscular strength.',
        'Entrenamiento orientado al desarrollo de la fuerza muscular.',
      ),
      calisthenics: term(
        'Calisthenics',
        'Calistenia',
        'Bodyweight movements and skills, including assisted and weighted variations.',
        'Movimientos y habilidades con peso corporal, incluidas variantes asistidas y lastradas.',
      ),
      functional: term(
        'Functional',
        'Funcional',
        'Conditioning and mixed movement training; not a certification or brand affiliation.',
        'Acondicionamiento y entrenamiento de movimientos combinados; no implica certificación ni afiliación a una marca.',
      ),
    },
    equipment: {
      rings: term(
        'Gymnastics rings',
        'Anillas',
        'Two suspended rings with adjustable straps; the exercise defines support and body position.',
        'Dos anillas suspendidas con correas ajustables; el ejercicio define apoyos y posición corporal.',
      ),
      kettlebell: term(
        'Kettlebell',
        'Kettlebell',
        'A free weight with an arched handle; the exercise specifies quantity and grip.',
        'Peso libre con asa arqueada; el ejercicio especifica cantidad y agarre.',
        ['Kettlebells'],
        ['Pesa rusa', 'Pesas rusas'],
      ),
      band: term(
        'Resistance band',
        'Banda elástica',
        'Elastic equipment providing resistance or assistance.',
        'Material elástico que aporta resistencia o asistencia.',
        ['Exercise band'],
        ['Goma elástica'],
      ),
      barbell: term(
        'Barbell',
        'Barra',
        'A bar held with both hands that can carry weight plates.',
        'Barra que se sujeta con ambas manos y puede cargar discos.',
      ),
      bench: term(
        'Bench',
        'Banco',
        'A supporting exercise bench; the variation specifies its angle.',
        'Banco de apoyo; la variante especifica su inclinación.',
      ),
      dumbbell: term(
        'Dumbbell',
        'Mancuerna',
        'A handheld free weight. The exercise specifies how many are used and how their mass is recorded.',
        'Peso libre de mano. El ejercicio especifica cuántas se utilizan y cómo se registra su masa.',
        ['Dumbbells'],
        ['Mancuernas'],
      ),
      floor: term(
        'Floor',
        'Suelo',
        'The ground or training surface used as support.',
        'Suelo o superficie de entrenamiento utilizada como apoyo.',
      ),
      'jump-rope': term(
        'Jump rope',
        'Comba',
        'A handheld rope swung around the body for jumping.',
        'Cuerda de mano que gira alrededor del cuerpo para saltar.',
        ['Skipping rope'],
        ['Cuerda de saltar'],
      ),
      parallettes: term(
        'Parallettes',
        'Paralelas bajas',
        'A pair of low parallel handles for supported bodyweight skills.',
        'Dos apoyos paralelos bajos para habilidades con peso corporal.',
        [],
        ['Paralelas de suelo'],
      ),
      'pull-up-bar': term(
        'Pull-up bar',
        'Barra de dominadas',
        'An overhead fixed bar used for hanging and pulling movements.',
        'Barra fija elevada para suspensiones y movimientos de tracción.',
      ),
      rope: term(
        'Climbing rope',
        'Cuerda de trepa',
        'A suspended rope intended for climbing.',
        'Cuerda suspendida destinada a la trepa.',
      ),
      'rowing-ergometer': term(
        'Rowing ergometer',
        'Ergómetro de remo',
        'A stationary machine that simulates rowing.',
        'Máquina estática que simula el remo.',
        ['Rowing machine', 'Row erg'],
        ['Máquina de remo'],
      ),
      'squat-rack': term(
        'Squat rack',
        'Soporte de sentadillas',
        'A structure for supporting and unracking a free barbell; the setup must specify suitable safety supports.',
        'Estructura para apoyar y sacar una barra libre; el montaje debe especificar los soportes de seguridad adecuados.',
        ['Power rack'],
        ['Rack de sentadillas', 'Jaula de potencia'],
      ),
      wall: term(
        'Wall',
        'Pared',
        'A vertical surface used as support or a movement reference.',
        'Superficie vertical utilizada como apoyo o referencia del movimiento.',
      ),
    },
    muscles: {
      abdominals: term(
        'Abdominals',
        'Abdominales',
        'Broad abdominal muscle grouping; not a single anatomical muscle.',
        'Agrupación general de la musculatura abdominal; no es un músculo anatómico único.',
        ['Abs'],
      ),
      'anterior-deltoids': term(
        'Front delts',
        'Deltoides anterior',
        'The anterior portion of the deltoid, distinct from the broader shoulders group.',
        'Porción anterior del deltoides, distinta del grupo general de hombros.',
        ['Anterior deltoids'],
      ),
      biceps: term(
        'Biceps',
        'Bíceps',
        'The biceps brachii of the upper arm.',
        'Bíceps braquial del brazo.',
      ),
      calves: term(
        'Calves',
        'Gemelos',
        'Broad calf grouping, including gastrocnemius and soleus.',
        'Agrupación de la pantorrilla, incluidos gastrocnemio y sóleo.',
        [],
        ['Pantorrillas'],
      ),
      forearms: term(
        'Forearms',
        'Antebrazos',
        'Broad forearm musculature grouping, including grip-related muscles.',
        'Agrupación de la musculatura del antebrazo, incluidos músculos relacionados con el agarre.',
      ),
      glutes: term('Glutes', 'Glúteos', 'The gluteal muscle group.', 'Grupo de músculos glúteos.', [
        'Gluteals',
      ]),
      hamstrings: term(
        'Hamstrings',
        'Isquiosurales',
        'The posterior-thigh hamstring muscle group.',
        'Grupo muscular isquiosural de la parte posterior del muslo.',
        [],
        ['Isquiotibiales'],
      ),
      'hip-flexors': term(
        'Hip flexors',
        'Flexores de cadera',
        'Functional grouping of muscles that flex the hip.',
        'Agrupación funcional de músculos que flexionan la cadera.',
      ),
      lats: term('Lats', 'Dorsales', 'The latissimus dorsi muscles.', 'Músculos dorsales anchos.', [
        'Latissimus dorsi',
      ]),
      pectorals: term(
        'Chest',
        'Pectorales',
        'The pectoral muscle group.',
        'Grupo de músculos pectorales.',
        ['Pecs', 'Pectorals'],
      ),
      quadriceps: term(
        'Quadriceps',
        'Cuádriceps',
        'The quadriceps femoris muscle group.',
        'Grupo muscular cuádriceps femoral.',
        ['Quads'],
      ),
      shoulders: term(
        'Shoulders',
        'Hombros',
        'Broad shoulder musculature grouping; not an alias for anterior-deltoids.',
        'Agrupación general de la musculatura del hombro; no es un alias de anterior-deltoids.',
      ),
      'spinal-erectors': term(
        'Spinal erectors',
        'Erectores espinales',
        'The erector spinae muscle group along the spine; not a synonym for all back muscles.',
        'Grupo muscular erector de la columna; no es un sinónimo de toda la musculatura de la espalda.',
        ['Erector spinae'],
        ['Erectores de la columna'],
      ),
      triceps: term(
        'Triceps',
        'Tríceps',
        'The triceps brachii of the upper arm.',
        'Tríceps braquial del brazo.',
      ),
      'upper-back': term(
        'Upper back',
        'Espalda alta',
        'Broad upper-back grouping; lats are represented separately.',
        'Agrupación general de la espalda alta; los dorsales se representan por separado.',
      ),
    },
    families: {
      overhead_press: term(
        'Overhead press',
        'Press sobre la cabeza',
        'Pressing a load from shoulder level to overhead; stance and leg assistance are variation-specific.',
        'Empuje de una carga desde los hombros por encima de la cabeza; postura y ayuda de piernas dependen de la variante.',
      ),
      horizontal_row: term(
        'Resistance row',
        'Remo de fuerza',
        'Pulling resistance toward the torso or the body toward a support; distinct from rowing an ergometer.',
        'Tracción de una resistencia hacia el tronco o del cuerpo hacia un apoyo; distinta del remo en ergómetro.',
      ),
      kettlebell_swing: term(
        'Kettlebell swing',
        'Balanceo de kettlebell',
        'Hip-driven swings of a kettlebell; hand arrangement and endpoint belong to the exact variation.',
        'Balanceos de kettlebell impulsados por la cadera; el agarre y el punto final pertenecen a la variante concreta.',
      ),
      lunge: term(
        'Lunge',
        'Zancada',
        'Stepping into a split stance and bending the legs; direction, return and load are variation-specific.',
        'Paso hacia una postura dividida y flexión de piernas; dirección, regreso y carga dependen de la variante.',
      ),
      carry: term(
        'Loaded carry',
        'Transporte de carga',
        'Walking while supporting an external load; hand arrangement and load position define the variation.',
        'Caminata sosteniendo carga externa; disposición de manos y posición de carga definen la variante.',
      ),
      bench_press: term(
        'Bench press',
        'Press de banca',
        'Pressing variations performed while supported on a bench.',
        'Variantes de empuje realizadas con apoyo en un banco.',
      ),
      deadlift: term(
        'Deadlift',
        'Peso muerto',
        'Loaded lifting and hip-hinge variations; each record defines the start, endpoints and reset rather than implying floor contact.',
        'Variantes de levantamiento y bisagra de cadera con carga; cada ficha define el inicio, el recorrido y el reinicio sin presuponer contacto con el suelo.',
      ),
      ergometer_row: term(
        'Ergometer rowing',
        'Remo en ergómetro',
        'Cyclic rowing on an ergometer, distinct from resistance-training rows.',
        'Remo cíclico en ergómetro, distinto de los remos de fuerza.',
      ),
      handstand: term(
        'Handstand',
        'Pino',
        'Hand-supported inversion skills and their entry or progression movements.',
        'Habilidades invertidas con apoyo de manos y movimientos de entrada o progresión.',
        [],
        ['Parada de manos'],
      ),
      jump_rope: term(
        'Rope jumping',
        'Salto de comba',
        'Jumping variations involving a rope rotating around the body.',
        'Variantes de salto con una cuerda que gira alrededor del cuerpo.',
      ),
      l_sit: term(
        'L-sit',
        'L-sit',
        'Supported holds with the legs extended forward and their progressions.',
        'Suspensiones con apoyo y piernas extendidas hacia delante y sus progresiones.',
      ),
      planche: term(
        'Planche',
        'Plancha de calistenia',
        'Hand-supported forward-lean balance skills and their progressions; distinct from a floor plank.',
        'Equilibrios sobre las manos con inclinación hacia delante y sus progresiones; distintos de la plancha abdominal.',
      ),
      plank: term(
        'Plank',
        'Plancha abdominal',
        'Trunk holds supported on the arms and feet or knees; distinct from feet-free calisthenics planche balances.',
        'Posiciones de tronco con apoyo de brazos y pies o rodillas; distintas de los equilibrios de planche sin apoyo de pies.',
      ),
      pull_up: term(
        'Pull-up',
        'Dominada',
        'Vertical pulling variations from a suspended position.',
        'Variantes de tracción vertical desde una posición suspendida.',
      ),
      push_up: term(
        'Push-up',
        'Flexión de brazos',
        'Bodyweight pressing variations with hand support; each record defines other contact points and movement range.',
        'Variantes de empuje con peso corporal y apoyo de manos; cada ficha define los demás apoyos y el recorrido.',
        ['Press-up'],
        ['Lagartija'],
      ),
      rope_climb: term(
        'Rope climb',
        'Trepa de cuerda',
        'Ascending a suspended rope, with or without leg assistance.',
        'Ascenso por una cuerda suspendida, con o sin ayuda de las piernas.',
      ),
      squat: term(
        'Squat',
        'Sentadilla',
        'Lowering and rising through hip and knee flexion and extension; stance, load and depth belong to the exact variation.',
        'Descenso y ascenso mediante flexión y extensión de cadera y rodilla; la postura, la carga y la profundidad pertenecen a la variante concreta.',
      ),
    },
    metrics: {
      repetitions: term(
        'Repetitions',
        'Repeticiones',
        'Count of completed cycles as defined by the exercise recording notes.',
        'Número de ciclos completados según las notas de registro del ejercicio.',
      ),
      load: term(
        'Load',
        'Carga',
        'Numeric load interpreted using the exercise load convention.',
        'Carga numérica interpretada según la convención del ejercicio.',
      ),
      duration: term(
        'Time',
        'Tiempo',
        'Elapsed time or hold duration, as specified by the exercise.',
        'Tiempo transcurrido o duración de la posición, según el ejercicio.',
      ),
      distance: term(
        'Distance',
        'Distancia',
        'Distance traveled or reported by the machine.',
        'Distancia recorrida o indicada por la máquina.',
      ),
      machine_calories: term(
        'Machine calories',
        'Calorías del monitor',
        'The machine display reading, not measured personal energy expenditure.',
        'Lectura del monitor de la máquina, no gasto energético personal medido.',
      ),
      assistance: term(
        'Assistance',
        'Asistencia',
        'Numeric assistance recorded separately from external load; not negative load.',
        'Asistencia numérica registrada por separado de la carga externa; no es carga negativa.',
      ),
      band: term(
        'Band used',
        'Banda utilizada',
        'Band identity or specification; colors and nominal resistance are not standardized across brands.',
        'Identidad o especificación de la banda; los colores y la resistencia nominal no están estandarizados entre marcas.',
      ),
      ascent_height: term(
        'Ascent height',
        'Altura de ascenso',
        'Vertical height climbed, distinct from repetition count.',
        'Altura vertical ascendida, distinta del número de repeticiones.',
      ),
    },
  },
});

// Unknown keys never turn into plausible-looking labels or inherited properties.
export function getTerm(group, key) {
  if (!Object.hasOwn(taxonomy.groups, group)) return undefined;
  const terms = taxonomy.groups[group];
  return Object.hasOwn(terms, key) ? terms[key] : undefined;
}

export function getLabel(group, key, language = 'en') {
  if (language !== 'en' && language !== 'es') return undefined;
  return getTerm(group, key)?.labels[language];
}
