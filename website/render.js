import { label, filterExercises, taxonomy } from './catalogue.js';
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const E = escapeHTML;
export const copy = {
  en: {
    library: 'Library',
    developers: 'For developers',
    home: 'All exercises',
    eyebrow: 'THE GRAVIS EXERCISE LIBRARY',
    title: 'Movement,\nwell defined.',
    intro:
      'A shared foundation for strength, calisthenics and functional training. Built for people who train, and the people building for them.',
    browse: 'Explore the library',
    repo: 'View on GitHub',
    preview: 'Editorial preview',
    previewText:
      'These first entries await technical review. Visual demonstrations are not yet available.',
    catalogue: 'Find your next movement.',
    catalogueSmall: 'One library. Different ways to train.',
    search: 'Search exercises, muscles or equipment',
    searchLabel: 'Search the library',
    all: 'All disciplines',
    equipment: 'All equipment',
    results: 'exercises',
    clear: 'Clear filters',
    empty: 'No matching movements.',
    emptyText: 'Try another name or remove a filter.',
    detail: 'View exercise',
    draft: 'Draft',
    steps: 'The movement',
    cues: 'Keep in mind',
    tracking: 'What to record',
    optional: 'Optional',
    primary: 'Primary muscles',
    secondary: 'Supporting muscles',
    muscleNote: 'Proposed anatomy · awaiting review',
    equipmentLabel: 'Equipment',
    media: 'Demonstration pending',
    mediaText: 'This space is reserved for a reviewed demonstration of this exact variation.',
    required: 'Required',
    review: 'Technical review pending',
    reviewText: 'This is an editorial draft, not an approved coaching reference.',
    builderTitle: 'A library you can build on.',
    builderText:
      'Stable exercise identities. English and Spanish content. Explicit tracking fields. Versioned JSON, with drafts kept separate from reviewed releases.',
    download: 'Download preview JSON',
    schema: 'Exercise schema',
    published: 'Reviewed dataset',
    zero: 'No reviewed entries released yet.',
    copy: 'Copy link',
    copied: 'Link copied',
    copyFailed: 'Copy the URL from your address bar.',
    credit: 'An open project by Gravis.',
    footer: 'Training. Nutrition. Habits.',
    back: 'Back to library',
    readDocs: 'Read the documentation',
  },
  es: {
    library: 'Biblioteca',
    developers: 'Para desarrolladores',
    home: 'Todos los ejercicios',
    eyebrow: 'LA BIBLIOTECA DE EJERCICIOS DE GRAVIS',
    title: 'Cada movimiento,\nbien definido.',
    intro:
      'Una base compartida para fuerza, calistenia y entrenamiento funcional. Para quienes entrenan y para quienes crean herramientas para ellos.',
    browse: 'Explorar biblioteca',
    repo: 'Ver en GitHub',
    preview: 'Vista previa editorial',
    previewText:
      'Estas primeras fichas necesitan revisión técnica. Las demostraciones visuales aún no están disponibles.',
    catalogue: 'Encuentra tu próximo movimiento.',
    catalogueSmall: 'Una biblioteca. Distintas formas de entrenar.',
    search: 'Busca ejercicios, músculos o equipo',
    searchLabel: 'Buscar en la biblioteca',
    all: 'Todas las disciplinas',
    equipment: 'Todo el equipo',
    results: 'ejercicios',
    clear: 'Limpiar filtros',
    empty: 'No encontramos ese movimiento.',
    emptyText: 'Prueba otro nombre o elimina un filtro.',
    detail: 'Ver ejercicio',
    draft: 'Borrador',
    steps: 'El movimiento',
    cues: 'Ten en cuenta',
    tracking: 'Qué registrar',
    optional: 'Opcional',
    primary: 'Músculos principales',
    secondary: 'Músculos secundarios',
    muscleNote: 'Anatomía propuesta · pendiente de revisión',
    equipmentLabel: 'Equipo',
    media: 'Demostración pendiente',
    mediaText:
      'Este espacio está reservado para una demostración revisada de esta variante concreta.',
    required: 'Obligatorio',
    review: 'Revisión técnica pendiente',
    reviewText: 'Es un borrador editorial, no una referencia de entrenamiento aprobada.',
    builderTitle: 'Una biblioteca sobre la que construir.',
    builderText:
      'Identidades estables. Contenido en español e inglés. Campos de registro explícitos. JSON versionado, con borradores separados de las versiones revisadas.',
    download: 'Descargar JSON preliminar',
    schema: 'Formato de las fichas',
    published: 'Catálogo revisado',
    zero: 'Todavía no hay fichas revisadas publicadas.',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    copyFailed: 'Copia la URL de la barra del navegador.',
    credit: 'Un proyecto abierto de Gravis.',
    footer: 'Entrenamiento. Alimentación. Hábitos.',
    back: 'Volver a la biblioteca',
    readDocs: 'Leer documentación',
  },
};
export function header(lang) {
  const t = copy[lang];
  return `<a class="skip" href="#main">${lang === 'es' ? 'Ir al contenido' : 'Skip to content'}</a><header class="header"><a class="brand" href="/" aria-label="Gravis home">gravis<span class="brand-dot"></span><span class="brand-sub">/ exercises</span></a><nav aria-label="${lang === 'es' ? 'Principal' : 'Main'}"><a href="/#library">${t.library}</a><a class="dev-nav" href="/#developers">${t.developers}</a><button id="language" class="lang" aria-label="${lang === 'en' ? 'Cambiar a español' : 'Switch to English'}">${lang === 'en' ? 'ES' : 'EN'}</button><a class="github-nav" href="https://github.com/gCuadros/gravis-exercises" target="_blank" rel="noreferrer">GitHub ↗</a></nav></header>`;
}
export function footer(lang) {
  const t = copy[lang];
  return `<footer class="footer"><a class="brand" href="/">gravis<span class="brand-dot"></span></a><span>${t.credit}</span><span>${t.footer}</span></footer>`;
}
export function card(e, index, lang) {
  const t = copy[lang];
  return `<a class="exercise-card" href="/exercises/${E(e.slug)}/"><div class="card-top"><span class="index">${String(index + 1).padStart(2, '0')}</span><span class="draft">${e.status === 'published' ? (lang === 'es' ? 'Revisado' : 'Reviewed') : t.draft}</span></div><div class="card-body"><p class="category">${e.disciplines.map((d) => E(label('disciplines', d, lang))).join(' / ')}</p><h3>${E(e.names[lang])}</h3><p>${E(e.summary[lang])}</p></div><div class="card-bottom"><span>${e.equipment.map((d) => E(label('equipment', d, lang))).join(' · ')}</span><span class="arrow" aria-hidden="true">↗</span></div></a>`;
}
export function resultGrid(exercises, state) {
  const { lang } = state,
    t = copy[lang],
    filtered = filterExercises(exercises, state);
  return {
    count: filtered.length,
    html: filtered.length
      ? filtered.map((e) => card(e, exercises.indexOf(e), lang)).join('')
      : `<div class="empty"><h3>${t.empty}</h3><p>${t.emptyText}</p><button class="button" data-clear>${t.clear}</button></div>`,
  };
}
export function cataloguePage(exercises, state) {
  const { lang } = state,
    t = copy[lang],
    result = resultGrid(exercises, state);
  const equipments = [...new Set(exercises.flatMap((e) => e.equipment))].sort((a, b) =>
    label('equipment', a, lang).localeCompare(label('equipment', b, lang)),
  );
  return `${header(lang)}<main id="main"><section class="hero wrap"><div class="hero-copy"><p class="eyebrow">${t.eyebrow}</p><h1>${t.title.split('\n').map(E).join('<br>')}</h1><p class="intro">${t.intro}</p><a class="button primary" href="#library">${t.browse}<span aria-hidden="true">↗</span></a></div><aside class="hero-aside"><div class="edition"><span>GRAVIS / 001</span><span>${E(state.version || 'development')}</span></div><div class="hero-number">${String(exercises.length).padStart(2, '0')}<span>${t.results}</span></div><div class="discipline-list">${Object.keys(
    taxonomy.groups.disciplines,
  )
    .map(
      (d, i) =>
        `<div><span>0${i + 1}</span>${E(label('disciplines', d, lang))}<span aria-hidden="true">↗</span></div>`,
    )
    .join(
      '',
    )}</div></aside></section><div class="preview-banner wrap"><span class="status-dot"></span><strong>${t.preview}</strong><span>${t.previewText}</span></div><section id="library" class="library wrap"><div class="section-heading"><div><p class="eyebrow">${t.catalogueSmall}</p><h2>${t.catalogue}</h2></div><p id="result-count" role="status" aria-live="polite">${result.count} ${t.results}</p></div><form class="filters" id="filters" role="search"><label class="search-label"><span class="sr-only">${t.searchLabel}</span><input type="search" id="query" name="q" placeholder="${t.search}" value="${E(state.query)}" autocomplete="off"></label><label><span class="sr-only">${t.all}</span><select id="discipline" name="discipline"><option value="all">${t.all}</option>${Object.keys(
    taxonomy.groups.disciplines,
  )
    .map(
      (d) =>
        `<option value="${d}" ${state.discipline === d ? 'selected' : ''}>${E(label('disciplines', d, lang))}</option>`,
    )
    .join(
      '',
    )}</select></label><label><span class="sr-only">${t.equipment}</span><select id="equipment" name="equipment"><option value="all">${t.equipment}</option>${equipments.map((d) => `<option value="${E(d)}" ${state.equipment === d ? 'selected' : ''}>${E(label('equipment', d, lang))}</option>`).join('')}</select></label><button type="button" class="clear" data-clear>${t.clear}</button></form><div class="grid" id="results">${result.html}</div></section><section class="developers" id="developers"><div class="wrap developers-inner"><div><p class="eyebrow">OPEN DATA / MIT</p><h2>${t.builderTitle}</h2><p>${t.builderText}</p><div class="dev-actions"><a class="button primary" href="/data/catalogue.preview.json" download>${t.download} ↓</a><a href="https://github.com/gCuadros/gravis-exercises#readme">${t.readDocs} ↗</a></div></div><div class="dev-code"><div class="code-heading"><span>catalogue.preview.json</span><span>${E(state.version || 'development')}</span></div><pre><code>${E(JSON.stringify({ version: state.version || 'development', channel: 'preview', exercises: exercises.length, languages: ['en', 'es'], reviewed: exercises.filter((e) => e.status === 'published').length }, null, 2))}</code></pre><div class="code-links"><a href="/schema/exercise.schema.json">${t.schema} ↗</a><a href="/data/catalogue.published.json">${t.published} ↗</a></div>${exercises.some((e) => e.status === 'published') ? '' : `<p class="code-note">${t.zero}</p>`}</div></div></section></main>${footer(lang)}`;
}
function demonstration(e, lang) {
  const t = copy[lang],
    m = e.media.find(
      (m) => m.reviewStatus === 'approved' && ['video', 'animation'].includes(m.type),
    );
  if (!m)
    return `<div class="media-placeholder"><span class="media-mark" aria-hidden="true">G / ${E(e.id.slice(-3))}</span><div><p class="eyebrow">${t.preview}</p><h2>${t.media}</h2><p>${t.mediaText}</p></div></div>`;
  return `<figure class="demonstration">${m.type === 'video' ? `<video controls playsinline preload="metadata" src="${E(m.url)}" aria-label="${E(m.alt[lang])}"></video>` : `<a class="button" href="${E(m.url)}" target="_blank" rel="noreferrer">${lang === 'es' ? 'Abrir demostración' : 'Open demonstration'} ↗</a>`}<figcaption>${E(m.alt[lang])}<br>${E(m.creator)} · ${E(m.license)}</figcaption></figure>`;
}
export function detailPage(e, lang) {
  const t = copy[lang];
  return `${header(lang)}<main id="main" class="wrap detail"><a class="back" href="/#library">← ${t.back}</a><div class="detail-heading"><div><p class="eyebrow">${e.disciplines.map((d) => E(label('disciplines', d, lang))).join(' / ')}</p><h1>${E(e.names[lang])}</h1><p class="intro">${E(e.summary[lang])}</p></div><button class="button" id="copy-link">${t.copy} ↗</button></div><p id="copy-status" class="sr-only" role="status"></p><div class="detail-layout"><div>${demonstration(e, lang)}<section class="instructions"><h2>${t.steps}</h2><ol>${e.instructions[lang].map((x) => `<li>${E(x)}</li>`).join('')}</ol><h3>${t.cues}</h3><ul>${e.cues[lang].map((x) => `<li>${E(x)}</li>`).join('')}</ul></section></div><aside class="facts"><div class="review-note"><span class="status-dot"></span><strong>${e.review.technical === 'approved' ? (lang === 'es' ? 'Revisión técnica completada' : 'Technical review complete') : t.review}</strong><p>${e.review.technical === 'approved' ? `${E(e.review.reviewer)} · ${E(e.review.reviewedAt)}` : t.reviewText}</p></div><section><h3>${t.equipmentLabel}</h3><div class="tags">${e.equipment.map((k) => `<span>${E(label('equipment', k, lang))}</span>`).join('')}</div></section><section><h3>${t.tracking}</h3><p class="small-label">${t.required}</p><div class="tags">${e.tracking.required.map((k) => `<span>${E(label('metrics', k, lang))}</span>`).join('')}</div>${e.tracking.optional.length ? `<p class="small-label">${t.optional}</p><div class="tags">${e.tracking.optional.map((k) => `<span>${E(label('metrics', k, lang))}</span>`).join('')}</div>` : ''}<p>${E(e.tracking.notes[lang])}</p></section><section><h3>${t.primary}</h3><p>${e.muscles.primary.map((k) => E(label('muscles', k, lang))).join(', ')}</p><h3>${t.secondary}</h3><p>${e.muscles.secondary.map((k) => E(label('muscles', k, lang))).join(', ')}</p><small>${e.review.technical === 'approved' ? '' : t.muscleNote}</small></section></aside></div></main>${footer(lang)}`;
}
