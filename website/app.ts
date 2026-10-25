import type { Exercise, SearchOptions } from '../src/index.js';
import type { Language } from '../src/taxonomy.types.ts';
import type { PageState } from './render.ts';
function element(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing page element: ${id}`);
  return node;
}
function discipline(value: string | null): SearchOptions['discipline'] {
  return value && Object.hasOwn(taxonomy.groups.disciplines, value)
    ? (value as Exercise['disciplines'][number])
    : 'all';
}
function equipment(value: string | null): SearchOptions['equipment'] {
  return value && payload.exercises.some((e) => e.equipment.some((key) => key === value))
    ? (value as Exercise['equipment'][number])
    : 'all';
}
import { taxonomy } from './catalogue.ts';
import { cataloguePage, detailPage, resultGrid, copy } from './render.ts';
const payload: { exercises: Exercise[]; slug: string | null; version: string } = JSON.parse(
  element('page-data').textContent ?? '',
);
const app = element('app');
let lang: Language = 'en';
try {
  if (localStorage.getItem('gravis-language') === 'es') lang = 'es';
} catch {}
const params = new URLSearchParams(location.search);
let state: PageState = {
  lang,
  version: payload.version,
  query: params.get('q') || '',
  discipline: discipline(params.get('discipline')),
  equipment: equipment(params.get('equipment')),
};
const entry = payload.slug ? payload.exercises.find((e) => e.slug === payload.slug) : null;
function render() {
  document.documentElement.lang = state.lang;
  document.title = entry ? `${entry.names[state.lang]} — Gravis` : 'Gravis Exercise Library';
  app.innerHTML = entry ? detailPage(entry, state.lang) : cataloguePage(payload.exercises, state);
}
function update() {
  const result = resultGrid(payload.exercises, state);
  element('results').innerHTML = result.html;
  element('result-count').textContent = `${result.count} ${copy[state.lang].results}`;
  const url = new URL(location.href);
  for (const [k, v] of Object.entries({
    q: state.query,
    discipline: state.discipline,
    equipment: state.equipment,
  })) {
    if (v && v !== 'all') url.searchParams.set(k, v);
    else url.searchParams.delete(k);
  }
  history.replaceState(null, '', url);
}
app.addEventListener('input', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.id === 'query') {
    state.query = event.target.value;
    update();
  }
});
app.addEventListener('change', (event) => {
  if (
    event.target instanceof HTMLSelectElement &&
    ['discipline', 'equipment'].includes(event.target.id)
  ) {
    if (event.target.id === 'discipline') state.discipline = discipline(event.target.value);
    else state.equipment = equipment(event.target.value);
    update();
  }
});
app.addEventListener('submit', (event) => event.preventDefault());
app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('#language')) {
    state.lang = state.lang === 'en' ? 'es' : 'en';
    try {
      localStorage.setItem('gravis-language', state.lang);
    } catch {}
    render();
    element('language').focus();
  }
  if (event.target.closest('[data-clear]')) {
    state = { ...state, query: '', discipline: 'all', equipment: 'all' };
    render();
    update();
    element('query').focus();
  }
  if (event.target.closest('#copy-link')) {
    try {
      await navigator.clipboard.writeText(location.href);
      element('copy-status').textContent = copy[state.lang].copied;
      element('copy-link').textContent = copy[state.lang].copied;
    } catch {
      element('copy-status').classList.remove('sr-only');
      element('copy-status').textContent = copy[state.lang].copyFailed;
    }
  }
});
render();
