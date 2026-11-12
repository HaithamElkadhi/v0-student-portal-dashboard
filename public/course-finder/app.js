'use strict';

const el = id => document.getElementById(id);
const filterKeys = ['university', 'degree', 'language', 'status'];
const pageSize = 15;
const unknown = 'To be confirmed';
const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
const labels = {Triennale:'Bachelor', Magistrale:'Master', 'Ciclo unico':'Single-cycle degree', Equipollente:'Equivalent degree', mu:'Multiple languages', 'Magistrale a ciclo unico':'Single-cycle degree', IT:'Italian', EN:'English', FR:'French', DE:'German', ES:'Spanish'};
const label = value => labels[value] ?? value;
const synonyms = [
  ['computer science','informatica','informatique'],
  ['engineering','ingegneria','ingenierie'],
  ['medicine','medicina','medecine'],
  ['law','giurisprudenza','droit'],
  ['architecture','architettura','architecture'],
  ['economics','economia','economie'],
  ['psychology','psicologia','psychologie'],
  ['data science','scienza dei dati','science des donnees'],
  ['design','progettazione'],
  ['english','anglais','inglese'],
  ['italian','italien','italiano'],
  ['bachelor','triennale','licence'],
  ['master','magistrale'],
];
const stopWords = new Set(['in','at','of','the','for','a','de','di','en','du','la','un','des','universita','university','universite']);
const collator = new Intl.Collator('en', {sensitivity:'base', numeric:true});
let catalog = [], byId = new Map(), view = 'explore', page = 1, query = '', loaded = false, loadError = false, toastTimer;

const favorites = new Set();
let saved = [];
let savesReady = false;
let saving = false;

async function savesRequest(method, body) {
  const student = JSON.parse(sessionStorage.getItem('studentInfo') || 'null');
  if (!student) throw new Error('Sign in to the student portal to access your saves.');
  const account = encodeURIComponent(JSON.stringify([
    String(student.email ?? '').trim().toLowerCase(),
    String(student.folderId ?? '').trim(),
  ]));
  const response = await fetch('/api/student-courses', {
    method,
    cache: 'no-store',
    headers: {'Content-Type': 'application/json', 'x-course-account': account},
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

async function loadSaves() {
  el('saves-status').textContent = 'Loading your saved items…';
  el('saves-retry').hidden = true;
  el('saves-retry').parentElement.hidden = false;
  try {
    const result = await savesRequest('GET');
    favorites.clear();
    result.favorites.forEach(id => favorites.add(id));
    saved = result.searches;
    savesReady = true;
    el('saves-retry').parentElement.hidden = true;
  } catch (error) {
    el('saves-status').textContent = error instanceof TypeError ? 'Your saved items could not be loaded.' : error.message;
    el('saves-retry').hidden = false;
  }
  render();
}

async function updateSave(kind, value, active, apply, focus) {
  if (!savesReady || saving) return;
  saving = true;
  render();
  try {
    await savesRequest('PUT', {kind, value, active});
    apply();
    toast(kind === 'favorite' ? (active ? 'Course saved' : 'Course removed') : (active ? 'Search saved' : 'Search removed'));
  } catch (error) {
    toast(error instanceof TypeError ? 'Your changes could not be saved. Try again.' : error.message);
  } finally {
    saving = false;
    render();
    focus()?.focus({preventScroll: true});
  }
}
function toast(message) {
  clearTimeout(toastTimer);
  el('toast').textContent = message;
  el('toast').hidden = false;
  toastTimer = setTimeout(() => { el('toast').hidden = true; }, 2600);
}
function course(row) {
  const [id, it, en, university, campus, degree, language, year, admission, method, teaching, delivery, code, discipline, level, area, partners, updated, url, duration, credits, fee, deadline, status] = row;
  const title = en || it || 'Course name unavailable';
  const searchable = normalize([it, en, university, campus, degree, label(degree), language, label(language), code, discipline, area].join(' '));
  return {id,it,en,university,campus,degree,language,year,admission,method,teaching,delivery,code,discipline,level,area,partners,updated,url,duration,credits,fee,deadline,status:status || unknown,title,searchable,words:[...new Set(searchable.split(' '))],titleKey:normalize([it,en].join(' '))};
}
function fill(id, values, title) {
  el(id).innerHTML = '<option value="">' + title + '</option>' + [...new Set(values.filter(Boolean))]
    .sort((a,b) => collator.compare(label(a), label(b)))
    .map(v => '<option value="' + escape(v) + '">' + escape(label(v)) + '</option>').join('');
}
function groups(text) {
  let terms = normalize(text);
  const found = [];
  for (const family of synonyms) {
    const phrase = family.find(word => (' ' + terms + ' ').includes(' ' + word + ' '));
    if (!phrase) continue;
    found.push(family);
    terms = (' ' + terms + ' ').replace(' ' + phrase + ' ', ' ').trim();
  }
  return found.concat(terms.split(' ').filter(word => word && !stopWords.has(word)).map(word => [word]));
}
function near(a, b) {
  if (a.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i+1] && a[i+1] === b[i] && a.slice(i+2) === b.slice(i+2));
  return a.length > b.length ? a.slice(i+1) === b.slice(i) : a.slice(i) === b.slice(i+1);
}
function match(c, terms, exact) {
  let points = exact && c.titleKey.includes(exact) ? 20 : 0;
  for (const group of terms) {
    let best = 0;
    for (const term of group) {
      if ((' ' + c.titleKey + ' ').includes(' ' + term + ' ')) best = Math.max(best, 10);
      else if ((' ' + c.searchable + ' ').includes(' ' + term + ' ')) best = Math.max(best, 6);
      else if (!term.includes(' ') && c.words.some(word => word.startsWith(term) || near(term, word))) best = Math.max(best, 2);
    }
    if (!best) return -1;
    points += best;
  }
  return points;
}
function state() {
  return Object.fromEntries([['query',query],['sort',el('sort').value],...filterKeys.map(k => [k,el(k).value])]);
}
function updateView(next) {
  view = next;
  page = 1;
  render();
}
function runSearch(value) {
  query = value.trim().slice(0,160);
  el('query').value = query;
  updateView('explore');
}
function searchLabel(s) {
  return [s.query && '“' + s.query + '”', ...filterKeys.map(k => label(s[k]))].filter(Boolean).join(' · ') || 'All courses';
}
function card(c) {
  const liked = favorites.has(c.id);
  const meta = [label(c.language),c.campus,c.duration && c.duration + ' years'].filter(Boolean).join(' · ');
  return '<article class="card"><div class="card-head"><span class="pill">' + escape(label(c.degree) || 'Degree unspecified') +
    '</span><button class="heart" data-favorite="' + c.id + '" aria-label="' + (liked ? 'Remove from favorites' : 'Add to favorites') + '" aria-pressed="' + liked + '"' + (!savesReady || saving ? ' disabled' : '') + '>' + (liked ? '♥' : '♡') +
    '</button></div><div><p class="uni">' + (c.university ? '<button data-uni="' + escape(c.university) + '">' + escape(c.university) + '</button>' : 'University unspecified') +
    '</p><h3>' + escape(c.title) + '</h3></div><div class="meta">' + escape(meta) + '</div><div class="card-foot"><span class="status" data-status="' +
    escape(c.status) + '">' + escape(c.status) + (c.deadline ? ' · ' + escape(formatDate(c.deadline)) : '') +
    '</span><button class="details" data-details="' + c.id + '">View details →</button></div></article>';
}
function formatDate(value) {
  const date = new Date(String(value).slice(0,10) + 'T12:00:00Z');
  return Number.isNaN(+date) ? value : new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
}
function render() {
  const s = state();
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed',button.dataset.tab === view));
  el('fav-count').textContent = favorites.size;
  el('browse').hidden = view === 'saved';
  el('saved').hidden = view !== 'saved';
  el('filters').hidden = view !== 'explore';
  el('save').hidden = view !== 'explore';
  el('save').disabled = !loaded || !savesReady || saving;
  el('pagination').hidden = true;
  el('cards').innerHTML = '';
  if (view === 'saved') {
    el('saved-list').innerHTML = saved.map((item,i) => '<div class="saved-row"><strong>' + escape(searchLabel(item)) + '</strong><div><button data-apply="' + i + '"' + (!loaded ? ' disabled' : '') + '>Run search</button><button data-remove="' + i + '"' + (saving ? ' disabled' : '') + '>Remove</button></div></div>').join('') || (savesReady ? '<div class="empty">Your saved searches will appear here.</div>' : '');
    return;
  }
  el('scope').textContent = view === 'favorites' ? 'YOUR SHORTLIST' : 'COURSE CATALOG';
  el('result-title').textContent = view === 'favorites' ? 'Favorite courses' : s.university || 'Explore courses';
  if (view === 'favorites' && !savesReady) {
    el('count').textContent = '';
    return;
  }
  if (!loaded) {
    el('count').textContent = loadError ? 'The catalog could not be loaded. Reload this page to try again.' : 'Loading the catalog…';
    return;
  }
  const exact = normalize(query), terms = groups(query), today = new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome'}).format(new Date());
  const due = c => c.deadline && c.deadline >= today && c.status !== 'Closed' ? c.deadline : '9999';
  const results = (view === 'favorites' ? catalog.filter(c => favorites.has(c.id)) : catalog)
    .filter(c => view === 'favorites' || filterKeys.every(k => !s[k] || c[k] === s[k]))
    .map(c => ({c,score:view === 'favorites' ? 0 : match(c,terms,exact)})).filter(row => row.score >= 0)
    .sort((a,b) => (s.sort === 'deadline' ? collator.compare(due(a.c),due(b.c)) : s.sort === 'relevance' ? b.score - a.score : 0) || collator.compare(a.c.title,b.c.title) || collator.compare(a.c.university,b.c.university));
  const pages = Math.ceil(results.length / pageSize);
  page = Math.min(page,Math.max(1,pages));
  el('count').textContent = results.length.toLocaleString() + (results.length === 1 ? ' course' : ' courses');
  el('cards').innerHTML = results.slice((page-1)*pageSize,page*pageSize).map(row => card(row.c)).join('') ||
    '<div class="empty">' + (view === 'favorites' ? 'Save a course using the heart button to see it here.' : 'No matching courses. Try a shorter search or clear a filter.') + '</div>';
  el('pagination').hidden = pages < 2;
  el('page').textContent = 'Page ' + page + ' of ' + pages;
  el('prev').disabled = page <= 1;
  el('next').disabled = page >= pages;
}
function detail(c) {
  const facts = [
    ['Degree',label(c.degree)],['Teaching language',label(c.language)],['Campus',c.campus],['Academic year',c.year],
    ['Duration',c.duration && c.duration + ' years'],['Credits',c.credits && c.credits + ' CFU'],
    ['Class code',c.code],['Admission type',c.admission],['Admission method',c.method],['Delivery method',c.delivery],
    ['Application status',c.status],['Application deadline',c.deadline ? formatDate(c.deadline) : unknown],['Application fee',c.fee || unknown],
  ];
  let url;
  try { const parsed = new URL(c.url); if (['http:','https:'].includes(parsed.protocol)) url = parsed.href; } catch {}
  el('detail-content').innerHTML = '<p class="uni">' + escape(c.university) + '</p><h2 id="detail-title">' + escape(c.title) + '</h2>' +
    (c.it && c.it !== c.title ? '<p>' + escape(c.it) + '</p>' : '') + '<dl class="facts">' +
    facts.filter(([,v]) => v).map(([k,v]) => '<div><dt>' + k + '</dt><dd>' + escape(v) + '</dd></div>').join('') + '</dl>' +
    (url ? '<a class="primary" href="' + escape(url) + '" target="_blank" rel="noopener noreferrer">Visit course website ↗</a>' : '');
  el('detail').showModal();
}
el('search').addEventListener('submit',event => { event.preventDefault(); runSearch(el('query').value); });
for (const k of [...filterKeys,'sort']) el(k).addEventListener('change',() => { page = 1; render(); });
el('reset').addEventListener('click',() => { filterKeys.forEach(k => {el(k).value = '';}); el('sort').value = 'relevance'; runSearch(''); });
el('saves-retry').addEventListener('click', loadSaves);
el('save').addEventListener('click',() => {
  const s = state();
  if (saved.some(item => JSON.stringify(item) === JSON.stringify(s))) return toast('Search already saved');
  void updateSave('search', s, true, () => saved.unshift(s), () => el('save'));
});
document.addEventListener('click',event => {
  const button = event.target.closest('button');
  if (!button) return;
  const d = button.dataset;
  if (d.tab) updateView(d.tab);
  if (d.query) runSearch(d.query);
  if (d.uni) { filterKeys.forEach(k => {el(k).value = '';}); el('university').value = d.uni; runSearch(''); }
  if (d.details) detail(byId.get(d.details));
  if (d.favorite) {
    const active = !favorites.has(d.favorite);
    void updateSave('favorite', d.favorite, active, () => {
      if (active) favorites.add(d.favorite);
      else favorites.delete(d.favorite);
    }, () => document.querySelector('[data-favorite="' + d.favorite + '"]') || document.querySelector('[data-tab="' + view + '"]'));
  }
  if (d.apply !== undefined) {
    const s = saved[Number(d.apply)];
    for (const k of [...filterKeys,'sort']) el(k).value = s[k] || '';
    runSearch(s.query || '');
  }
  if (d.remove !== undefined) {
    const index = Number(d.remove);
    void updateSave('search', saved[index], false, () => saved.splice(index, 1),
      () => document.querySelector('[data-remove="' + index + '"]') || document.querySelector('[data-tab="saved"]'));
  }
});
for (const [id,delta] of [['prev',-1],['next',1]]) el(id).addEventListener('click',() => { page += delta; render(); el('result-title').scrollIntoView({block:'start'}); });
el('close').addEventListener('click',() => el('detail').close());
el('detail').addEventListener('click',event => { if (event.target === el('detail')) el('detail').close(); });

async function loadCatalog() {
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error('Catalog request failed');
    catalog = (await response.json()).map(course);
    byId = new Map(catalog.map(c => [c.id,c]));
    fill('university',catalog.map(c => c.university),'All universities');
    fill('degree',catalog.map(c => c.degree),'All degrees');
    fill('language',catalog.map(c => c.language),'All languages');
    fill('status',['Open','Closed','Opening soon',unknown],'Any status');
    loaded = true;
  } catch { loadError = true; }
  render();
}
loadCatalog();
loadSaves();
