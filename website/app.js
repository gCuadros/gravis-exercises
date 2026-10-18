import { cataloguePage, detailPage, resultGrid, copy } from './render.js';
const payload = JSON.parse(document.getElementById('page-data').textContent);
const app = document.getElementById('app');
let lang = 'en';
try {
  if (localStorage.getItem('gravis-language') === 'es') lang = 'es';
} catch {}
const params = new URLSearchParams(location.search);
let state = {
  lang,
  query: params.get('q') || '',
  discipline: params.get('discipline') || 'all',
  equipment: params.get('equipment') || 'all',
};
if (!['all', 'strength', 'calisthenics', 'functional'].includes(state.discipline))
  state.discipline = 'all';
if (!['all', ...payload.exercises.flatMap((e) => e.equipment)].includes(state.equipment))
  state.equipment = 'all';
const entry = payload.slug ? payload.exercises.find((e) => e.slug === payload.slug) : null;
function render() {
  document.documentElement.lang = state.lang;
  document.title = entry ? `${entry.names[state.lang]} — Gravis` : 'Gravis Exercise Library';
  app.innerHTML = entry ? detailPage(entry, state.lang) : cataloguePage(payload.exercises, state);
}
function update() {
  const result = resultGrid(payload.exercises, state);
  document.getElementById('results').innerHTML = result.html;
  document.getElementById('result-count').textContent =
    `${result.count} ${copy[state.lang].results}`;
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
  if (event.target.id === 'query') {
    state.query = event.target.value;
    update();
  }
});
app.addEventListener('change', (event) => {
  if (['discipline', 'equipment'].includes(event.target.id)) {
    state[event.target.id] = event.target.value;
    update();
  }
});
app.addEventListener('submit', (event) => event.preventDefault());
app.addEventListener('click', async (event) => {
  if (event.target.closest('#language')) {
    state.lang = state.lang === 'en' ? 'es' : 'en';
    try {
      localStorage.setItem('gravis-language', state.lang);
    } catch {}
    render();
    document.getElementById('language').focus();
  }
  if (event.target.closest('[data-clear]')) {
    state = { ...state, query: '', discipline: 'all', equipment: 'all' };
    render();
    update();
    document.getElementById('query').focus();
  }
  if (event.target.closest('#copy-link')) {
    try {
      await navigator.clipboard.writeText(location.href);
      document.getElementById('copy-status').textContent = copy[state.lang].copied;
      document.getElementById('copy-link').textContent = copy[state.lang].copied;
    } catch {
      document.getElementById('copy-status').classList.remove('sr-only');
      document.getElementById('copy-status').textContent = copy[state.lang].copyFailed;
    }
  }
});
render();
