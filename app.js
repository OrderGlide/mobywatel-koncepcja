'use strict';
// Clickable prototype engine: screens, scripted assistant, confirm cards, case traces.
const D = window.DATA, SCEN = window.SCEN;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
const sleep = ms => new Promise(r => setTimeout(r, FAST ? 0 : ms));
const FAST = /[?&]fast\b/.test(location.search);

const I = {
  chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  done: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2zM12 10v5M12 18v.5"/></svg>',
  car: '<svg viewBox="0 0 24 24"><path d="M4 16v-4l2-5h12l2 5v4zM4 16v2h3v-2M17 16v2h3v-2M7.5 13h.5M16 13h.5"/></svg>',
  pill: '<svg viewBox="0 0 24 24"><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.5 8.5l5 7"/></svg>',
  bank: '<svg viewBox="0 0 24 24"><path d="M3 9l9-5 9 5zM5 10v7M10 10v7M14 10v7M19 10v7M3 20h18"/></svg>',
  id: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14.5 10h3.5M14.5 13.5h3.5"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/></svg>',
  office: '<svg viewBox="0 0 24 24"><path d="M4 21V7l8-4 8 4v14M9 21v-5h6v5M8 10h.5M12 10h.5M16 10h.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
  baby: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="M10 9h.3M14 9h.3M10.5 11.3c.9.6 2.1.6 3 0M7 20c.8-2.3 2.8-4 5-4s4.2 1.7 5 4"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 9.5V20h5v-5h4v5h5V9.5"/></svg>',
  wallet: '<svg viewBox="0 0 24 24"><path d="M4 7h14a2 2 0 012 2v9a2 2 0 01-2 2H4zM4 7l11-3v3M15 13.5h2"/></svg>',
  msg: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v3.5M12 13.6v.4"/></svg>',
  trace: '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 8v8M8 6.5c5 .5 8 2.5 8.5 4M8 17.5c5-.5 8-2.5 8.5-4"/></svg>',
  finger: '<svg viewBox="0 0 24 24"><path d="M7 11a5 5 0 0110 0v2M12 11v4c0 2-.8 3.6-2 5M9.5 11.5v2.5c0 1.5-.5 2.8-1.3 3.8M14.5 12v3c0 2.2-.6 4-1.6 5.5M17 15.5c0 1.4-.3 2.7-.8 3.8M4.8 15c.3-.9.4-1.9.4-3a6.8 6.8 0 0113.6 0"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
  police: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3-1 4H5L4 6zM6 10v3a6 6 0 0012 0v-3"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 1.8 6 5.5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>'
};

const S = {
  tab: 'start', view: null, dataTab: 'zgody', busy: false, carSold: false,
  consents: JSON.parse(JSON.stringify(D.consents)),
  access: JSON.parse(JSON.stringify(D.access)),
  forOthers: JSON.parse(JSON.stringify(D.forOthers)),
  rules: JSON.parse(JSON.stringify(D.rules)),
  threads: [], cur: null, min: 14
};
const chatEl = document.createElement('div');
chatEl.className = 'chat';

// Fake clock so all timestamps in the demo agree with each other.
const now = () => '21:' + String(S.min).padStart(2, '0');
setInterval(() => { S.min = Math.min(59, S.min + 1); $('#clock').textContent = now(); }, 60000);

// Polish plural for "krok": 1 krok, 2-4 kroki, 5+ kroków (12-14 kroków).
function kroki(n) {
  const w = n === 1 ? 'krok' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'kroki' : 'kroków';
  return n + ' ' + w;
}
function fnv(str) { let h = 0x811c9dc5; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }

// ---------- trace ----------
const KIND = { prosba: 'Prośba', odczyt: 'Odczyt', zewn: 'Treść z zewnątrz', propozycja: 'Propozycja', regula: 'Reguła', podpis: 'Podpis', anulowano: 'Anulowano', wykonanie: 'Wykonanie', powiadomienie: 'Powiadomienie' };
function newThread(title) {
  S.cur = { id: 'S-' + (1040 + S.threads.length), title, status: 'w toku', started: now(), events: [] };
  S.threads.unshift(S.cur);
}
function tr(kind, who, text) {
  if (!S.cur) newThread('Rozmowa');
  const ev = S.cur.events;
  ev.push({ n: ev.length + 1, parent: ev.length || null, t: now(), kind, who, text });
}

// ---------- chat rendering ----------
function add(html, cls, tag = 'div') {
  const sc = $('#screen');
  if (S.tab === 'asystent' && !S.view && chatEl.parentNode !== sc) sc.replaceChildren(chatEl);
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  el.innerHTML = html;
  chatEl.appendChild(el);
  scrollChat();
  return el;
}
function scrollChat() { if (S.tab === 'asystent' && !S.view) { const sc = $('#screen'); requestAnimationFrame(() => { sc.scrollTop = sc.scrollHeight; }); } }
function line(icon, src, text, color) {
  return add(`${icon}<span><b>${esc(src)}</b> · ${esc(text)}</span>`, 'read' + (color ? ' ' + color : ''));
}

async function step(s) {
  if (s.u !== undefined) { add(esc(s.u), 'msg u'); tr('prosba', 'Ty', s.u); await sleep(350); return; }
  if (s.acting) { add(I.users + esc(s.acting), 'actingas'); tr('regula', 'Kod aplikacji', s.acting); await sleep(250); return; }
  if (s.read) { await sleep(320); line(I.check, s.read[0], s.read[1]); tr('odczyt', 'Asystent → ' + s.read[0], s.read[1]); logAccess(s.read[0], s.read[1]); return; }
  if (s.exec) { await sleep(450); const el = line(I.done, s.exec[0], s.exec[1]); el.querySelector('svg').style.color = 'var(--ok)'; tr('wykonanie', s.exec[0], s.exec[1]); return; }
  if (s.notify) { await sleep(300); const el = line(I.bell, 'Powiadomienie', s.notify); el.querySelector('svg').style.color = 'var(--warn)'; tr('powiadomienie', 'Kod aplikacji', s.notify); return; }
  if (s.rule) { await sleep(300); const el = line(I.lock, 'Reguła', s.rule); el.querySelector('svg').style.color = 'var(--trust)'; tr('regula', 'Kod aplikacji', s.rule); return; }
  if (s.say) {
    const ty = add('<i></i><i></i><i></i>', 'typing'); await sleep(750); ty.remove();
    let html = md(s.say);
    if (s.src) html += `<br><button class="src">${I.info}Skąd to wiem? · ${s.src.length}</button><div class="srclist">${s.src.map(x => '• ' + esc(x)).join('<br>')}</div>`;
    const el = add(`<div class="av">${I.spark}</div><div class="msg a">${html}</div>`, 'arow');
    const b = el.querySelector('.src'); if (b) b.onclick = () => el.querySelector('.srclist').classList.toggle('on');
    await sleep(200); return;
  }
  if (s.plan) {
    await sleep(300);
    add(`<h4>${esc(s.plan.title)}</h4><ol>${s.plan.items.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`, 'plan');
    tr('propozycja', 'Asystent', s.plan.title + ' (' + kroki(s.plan.items.length) + ')'); return;
  }
  if (s.untrusted) {
    await sleep(300);
    add(`<div class="lbl">${I.warn}Treść z zewnątrz · tylko dane</div><div class="from">${esc(s.untrusted.from)}</div><p>${esc(s.untrusted.text)}</p>`, 'untrusted');
    tr('zewn', 'SMS (niezaufane)', s.untrusted.text); return;
  }
  if (s.result) {
    await sleep(350);
    add(`<div class="ic">${I.check}</div><div><b>${esc(s.result.title)}</b><span>${esc(s.result.text)}</span></div>`, 'result');
    return;
  }
  if (s.links) {
    const el = add(s.links.map((l, i) => `<button class="link" data-i="${i}">${I.trace}${esc(l.l)}</button>`).join(''), 'links');
    el.querySelectorAll('button').forEach(b => b.onclick = () => goLink(s.links[+b.dataset.i].to, S.cur));
    return;
  }
  if (s.fx) { FX[s.fx](); return; }
  if (s.end) { if (S.cur) S.cur.status = s.end; return; }
  if (s.go) { await play(s.go); return 'stop'; }
  if (s.chips) {
    await sleep(200);
    const el = add(s.chips.map((c, i) => `<button class="chip" data-i="${i}">${esc(c.l)}</button>`).join(''), 'chips');
    el.querySelectorAll('button').forEach(b => b.onclick = () => {
      if (S.busy) return;
      el.classList.add('used'); b.style.background = 'var(--brandSoft)';
      play(s.chips[+b.dataset.i].go);
    });
    return 'stop';
  }
  if (s.qr) { qrStep(s.qr); return 'stop'; }
  if (s.confirm) { confirmStep(s.confirm); return 'stop'; }
}

async function play(id, opts = {}) {
  const sc = SCEN[id];
  if (!sc) return;
  if (sc.title) newThread(sc.title);
  S.busy = true;
  for (let s of sc.steps) {
    if (opts.userText && s.u !== undefined) { s = { u: opts.userText }; opts.userText = null; }
    if (await step(s) === 'stop') break;
  }
  S.busy = false;
  refreshBadges();
}

function startCase(id) {
  openTab('asystent');
  if (S.busy) return;
  chatEl.querySelectorAll('.chips:not(.used)').forEach(c => c.classList.add('used'));
  play(id);
}

// ---------- QR handoff ----------
function qrSvg(seed, n = 25) {
  let h = parseInt(fnv(seed), 16), cells = '';
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h % 100; };
  const finder = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let on;
    if (finder(x, y)) { const fx = x >= n - 7 ? x - (n - 7) : x, fy = y >= n - 7 ? y - (n - 7) : y; on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4); }
    else on = rnd() < 47;
    if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg class="qr" viewBox="-1 -1 ${n + 2} ${n + 2}" style="fill:#14213a;stroke:none">${cells}</svg>`;
}
function qrStep(q) {
  const el = add(`<h4>${esc(q.title)}</h4>${qrSvg(q.title + now())}<ul>${q.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="muted">Kod jest ważny 2 minuty i działa tylko raz.</p><button class="btn small mt">Symuluj: kupujący skanuje kod</button>`, 'qrwait');
  tr('podpis', 'Ty', 'Pokazałaś kod. Zakres: ' + q.items.join(', '));
  el.querySelector('button').onclick = e => {
    e.target.disabled = true; e.target.textContent = q.who + ' zeskanował kod';
    e.target.className = 'pill ok mt';
    play(q.next);
  };
}

// ---------- confirm card + passkey ----------
function confirmStep(c) {
  const body = c.rows.map(r => r[0] + '=' + r[1]).join('|');
  const code = 'CZ-' + fnv(c.title + body).slice(0, 4).toUpperCase() + '-' + fnv(body).slice(4, 8).toUpperCase();
  tr('propozycja', 'Asystent', 'Proponuje: ' + c.title + ' (' + code + ')');
  tr('regula', 'Kod aplikacji', c.rule);
  const el = add(`<div class="ch"><div class="t"><small>Do podpisu</small><b>${esc(c.title)}</b></div><span class="code">${code}</span></div>
    <div class="cb"><dl class="kv">${c.rows.map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>
    <p class="effect">${esc(c.effect)}</p><div class="rule">${I.lock}<span>${esc(c.rule)}</span></div></div>
    <div class="cf"><button class="btn ghost">Anuluj</button><button class="btn">${I.finger}Podpisz</button></div>`, 'confirm');
  const [cancel, sign] = el.querySelectorAll('.cf button');
  cancel.onclick = () => {
    if (S.busy) return;
    finish('Anulowano. Nic nie zostało wysłane.', 'no');
    tr('anulowano', 'Ty', c.title + ' (' + code + ')');
    play(c.cancel || 'anuluj');
  };
  sign.onclick = () => {
    if (S.busy) return;
    passkey(c.title, code, fnv(body) + fnv(code) + fnv(c.title), () => {
      S.min++; $('#clock').textContent = now();
      finish(`Podpisano o ${now()} kluczem tego telefonu`, 'ok');
      tr('podpis', 'Ty, klucz urządzenia', 'Podpisano ' + c.title + ' (' + code + ')');
      play(c.ok);
    });
  };
  function finish(text, kind) {
    el.classList.add('done');
    el.querySelector('.cf').outerHTML = `<div class="stamp ${kind}">${kind === 'ok' ? I.check : I.x}${esc(text)}</div>`;
  }
}

function passkey(title, code, hash, onOk) {
  sheet(`<div class="passkey"><h3>Potwierdź podpisem</h3>
    <p class="sub">${esc(title)}</p>
    <div class="fp" id="fp">${I.finger}</div>
    <p class="muted" id="fpTxt">Dotknij czytnika albo spójrz w kamerę</p>
    <div class="hash">Kod czynności: <b>${code}</b><br>Skrót treści: ${hash.slice(0, 24)}…</div>
    <p class="muted mt">Podpisujesz dokładnie tę treść. Serwer wykona czynność tylko wtedy, gdy skrót się zgadza.</p>
    <button class="btn mt" id="fpGo">Użyj klucza dostępu</button>
    <button class="btn ghost mt" id="fpNo">Anuluj</button></div>`);
  $('#fpNo').onclick = closeSheet;
  $('#fpGo').onclick = async () => {
    $('#fpGo').disabled = true; $('#fp').classList.add('scan'); $('#fpTxt').textContent = 'Sprawdzam…';
    await sleep(900);
    $('#fp').classList.remove('scan'); $('#fp').classList.add('ok'); $('#fp').innerHTML = I.check; $('#fpTxt').textContent = 'Podpisano';
    await sleep(450);
    closeSheet(); onOk();
  };
}

// ---------- side effects from scenarios ----------
function logAccess(src, text) {
  if (!/CEPiK|UFG|Rejestr/.test(src)) return;
  S.access.unshift({ when: 'dziś, ' + now(), who: 'Ty, przez asystenta', what: src + ': ' + text, basis: 'Twoja prośba w rozmowie (' + (S.cur ? S.cur.id : '') + ')', kind: 'me' });
}
const FX = {
  shareBuyer() {
    S.consents.unshift({ id: 'c' + Date.now(), who: 'Piotr Wiśniewski (kupujący)', what: 'Imię, nazwisko, dane pojazdu PO 4R521', why: 'Umowa kupna-sprzedaży Toyoty', until: 'jednorazowo, wykorzystana dziś', icon: 'car', used: true, fresh: true });
    S.access.unshift({ when: 'dziś, ' + now(), who: 'Piotr Wiśniewski, przez Twój kod', what: 'Imię, nazwisko, dane pojazdu', basis: 'Pokazany przez Ciebie kod z zakresem', kind: 'company' });
  },
  carSold() { S.carSold = true; },
  mamaLog() { S.forOthers[0].log.unshift({ when: 'dziś, ' + now(), what: 'Udostępniono 2 e-recepty aptece „Pod Lipą”' }); }
};

// ---------- composer ----------
function ask(text) {
  text = text.trim();
  if (!text || S.busy) return;
  $('#ask').value = '';
  chatEl.querySelectorAll('.chips:not(.used)').forEach(c => c.classList.add('used'));
  if (/zignoruj|omiń|omin|bez podpisu|zapła[cć]|zaplac|przelej|opła[cć]/i.test(text)) return injection(text);
  const hit = window.MATCH.find(([re]) => re.test(text));
  if (hit) return play(hit[1], { userText: text });
  fallback(text);
}
async function injection(text) {
  newThread('Prośba o pominięcie zasad');
  S.busy = true;
  await step({ u: text });
  await step({ rule: 'Płatności i pisma zawsze wymagają podpisu na karcie' });
  await step({ say: 'Tego nie zmienię w rozmowie. Nie dlatego, że nie chcę, tylko dlatego, że nie ja pilnuję tej zasady, lecz kod aplikacji. Mogę przygotować płatność albo pismo, a Ty zatwierdzisz je na karcie.' });
  await step({ links: [{ l: 'Zobacz granice asystenta', to: 'rules' }] });
  S.cur.status = 'zakończona'; S.busy = false;
}
async function fallback(text) {
  newThread('Pytanie');
  S.busy = true;
  await step({ u: text });
  await step({ say: 'W tym prototypie rozumiem tylko kilka spraw. Wybierz jedną z nich:' });
  await step({ chips: STARTERS.map(s => ({ l: s[1], go: s[0] })) });
  S.cur.status = 'zakończona'; S.busy = false;
}
const STARTERS = [['sprzedaz', 'Sprzedaję auto'], ['portfel', 'Zgubiłam portfel'], ['mama', 'Wykup recepty mamy'], ['sms', 'Sprawdź podejrzany SMS'], ['oc', 'Co z moim OC?'], ['dziecko', 'Rodzi się nam dziecko'], ['przeprowadzka', 'Przeprowadzam się']];
const STARTER_ICON = { sprzedaz: I.car, portfel: I.wallet, mama: I.pill, sms: I.msg, oc: I.shield, dziecko: I.baby, przeprowadzka: I.home };
const STARTER_TINT = { sprzedaz: 'warn', portfel: 'red', mama: 'trust', sms: 'red', oc: '', dziecko: 'pink', przeprowadzka: 'teal' };

// ---------- navigation ----------
function openTab(tab, view = null) {
  S.tab = tab; S.view = view;
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  render();
}
function openView(view) { S.view = view; render(); }
function goLink(to, thread) {
  if (to === 'trace') return openTab('dane', { k: 'trace', id: (thread || S.cur).id });
  if (to === 'dane') { S.dataTab = 'zgody'; return openTab('dane'); }
  if (to === 'dane-log') { S.dataTab = 'log'; return openTab('dane'); }
  if (to === 'sprawy') { S.dataTab = 'sprawy'; return openTab('dane'); }
  if (to === 'start-todo') { const s = $('#todoSec'); if (s) $('#screen').scrollTo({ top: s.offsetTop - 8 }); return; }
  if (to === 'rules') return openTab(S.tab, { k: 'rules' });
  openTab(to);
}

function topbar(title, back) {
  const tb = $('#topbar');
  const home = S.tab === 'start' && !S.view;
  $('#phone').classList.toggle('dark-top', home);
  if (home) {
    tb.innerHTML = `<div class="brandmark"><div class="logo">m</div><div><b>mObywatel</b><small>pod Twoją kontrolą · koncepcja</small></div></div>
      <button class="iconbtn infobtn" id="infoBtn" aria-label="O koncepcji">${I.info}</button>
      <button class="avatar" id="avBtn" aria-label="Granice asystenta">AN</button>`;
  } else {
    tb.innerHTML = `${back ? `<button class="back" id="backBtn" aria-label="Wstecz">${I.back}</button>` : ''}<h1>${esc(title)}</h1>
      <button class="iconbtn infobtn" id="infoBtn" aria-label="O koncepcji">${I.info}</button>
      ${back ? '' : '<button class="avatar" id="avBtn" aria-label="Granice asystenta">AN</button>'}`;
  }
  const bb = $('#backBtn'); if (bb) bb.onclick = () => openView(null);
  const av = $('#avBtn'); if (av) av.onclick = () => openView({ k: 'rules' });
  $('#infoBtn').onclick = () => sheet($('#about').innerHTML.replace(/<button class="reset"[^>]*>.*?<\/button>/, '')
    .replace('<h1>', '<h1 class="about-h1">').replace('<h2>', '<h2 class="about-h2">'), true);
}

function render() {
  const sc = $('#screen');
  $('#composer').hidden = !(S.tab === 'asystent' && !S.view);
  const v = S.view;
  if (v && v.k === 'rules') { topbar('Granice asystenta', true); sc.innerHTML = viewRules(); bindRules(); }
  else if (v && v.k === 'trace') { topbar('Ślad sprawy', true); sc.innerHTML = viewTrace(v.id); }
  else if (v && v.k === 'doc') { topbar(DOCS[v.id].name, true); sc.innerHTML = viewDoc(v.id); bindDoc(v.id); }
  else if (v && v.k === 'person') { topbar('Pełnomocnictwo', true); sc.innerHTML = viewPerson(v.id); bindPerson(v.id); }
  else if (S.tab === 'start') { topbar(); sc.innerHTML = viewStart(); bindStart(); }
  else if (S.tab === 'dokumenty') { topbar('Dokumenty'); sc.innerHTML = viewDocs(); bindDocs(); }
  else if (S.tab === 'asystent') { topbar('Asystent'); renderChat(); return; }
  else if (S.tab === 'dane') { topbar('Moje dane'); sc.innerHTML = viewData(); bindData(); }
  else if (S.tab === 'bliscy') { topbar('Bliscy'); sc.innerHTML = viewPeople(); bindPeople(); }
  sc.scrollTop = 0;
}
function refreshBadges() { /* tabs re-render on open; nothing to badge for now */ }

// ---------- screens ----------
function viewStart() {
  const todo = [];
  if (!S.carSold) todo.push(`<button class="todo" data-run="oc"><div class="ic warn">${I.car}</div><div class="tx"><b>OC Toyoty kończy się za 6 dni</b><span>Wznowi się samo. Sprawdź, czy tego chcesz.</span></div><span class="pill warn">29.10</span></button>`);
  todo.push(`<button class="todo" data-run="mama"><div class="ic trust">${I.pill}</div><div class="tx"><b>Recepty mamy czekają na wykup</b><span>Działasz jako pełnomocniczka Haliny Nowak</span></div><span class="pill trust">2 leki</span></button>`);
  const active = S.consents.filter(c => !c.used && !c.revoked);
  if (active.length) todo.push(`<button class="todo" data-goto="dane"><div class="ic">${I.shield}</div><div class="tx"><b>${active.length} ${active.length === 1 ? 'firma ma' : 'firmy mają'} teraz Twoje dane</b><span>${esc(active[0].who)}, ${esc(active[0].until)}</span></div>${I.chev}</button>`);
  const recent = S.threads.slice(0, 3);
  const reads = S.access.filter(a => a.kind !== 'me').length;
  return `<section class="hero">
      <div class="date">Piątek, 23 października</div>
      <h2>Dobry wieczór, Anno</h2>
      <div class="stats">
        <button class="stat" data-goto="start-todo"><b>${todo.length}</b><span>${todo.length === 1 ? 'sprawa' : 'sprawy'} do załatwienia</span></button>
        <button class="stat" data-goto="dane"><b>${active.length}</b><span>aktywne zgody na Twoje dane</span></button>
        <button class="stat" data-goto="dane-log"><b>${reads}</b><span>odczyty przez instytucje</span></button>
      </div>
      <button class="askbox" id="askBox"><span class="sp">${I.spark}</span><span class="q">Powiedz, co chcesz załatwić…</span><span class="mic">${I.mic}</span></button>
    </section>
    <div class="sec" id="todoSec">Do załatwienia</div>${todo.join('')}
    <div class="sec">Co się dzieje w Twoim życiu?</div>
    <div class="events">
      <button class="event ev-car" data-run="sprzedaz"><div class="em">${I.car}</div><div><b>Sprzedaję auto</b><small>umowa, starosta, OC</small></div></button>
      <button class="event ev-wallet" data-run="portfel"><div class="em">${I.wallet}</div><div><b>Zgubiłam portfel</b><small>zastrzeżenie w minutę</small></div></button>
      <button class="event ev-baby" data-run="dziecko"><div class="em">${I.baby}</div><div><b>Rodzi się dziecko</b><small>PESEL, 800 plus, meldunek</small></div></button>
      <button class="event ev-home" data-run="przeprowadzka"><div class="em">${I.home}</div><div><b>Przeprowadzam się</b><small>jeden adres, wszędzie</small></div></button>
    </div>
    <button class="scam" data-run="sms"><div class="ic">${I.msg}</div><div style="flex:1"><b>Podejrzany SMS albo mail?</b><span>Sprawdzę go, nie wykonując żadnych poleceń z treści</span></div><span class="go">Sprawdź</span></button>
    <div class="sec">Dokumenty <small data-goto="dokumenty" style="cursor:pointer">Wszystkie</small></div>
    <div class="docstrip">${Object.entries(DOCS).map(([k, d]) => `<button class="minidoc ${d.g}" data-doc="${k}"><b>${esc(d.name)}</b><span>${esc(d.short())}</span></button>`).join('')}</div>
    ${recent.length ? `<div class="sec">Ostatnie sprawy <small data-goto="sprawy" style="cursor:pointer">Wszystkie</small></div><div class="list">${recent.map(threadRow).join('')}</div>` : ''}`;
}
function threadRow(t) {
  const cls = { 'zakończona': 'ok', 'anulowana': 'red', 'w toku': 'warn', 'odłożona': 'grey', 'zaplanowana': 'grey' }[t.status] || 'grey';
  return `<button class="row" data-trace="${t.id}"><div class="ic trust">${I.trace}</div><div class="tx"><b>${esc(t.title)}</b><span>${t.id} · ${t.started} · ${kroki(t.events.length)}</span></div><span class="pill ${cls}">${t.status}</span></button>`;
}
function bindCommon(root) {
  root.querySelectorAll('[data-run]').forEach(b => b.onclick = () => startCase(b.dataset.run));
  root.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => goLink(b.dataset.goto));
  root.querySelectorAll('[data-doc]').forEach(b => b.onclick = () => openTab('dokumenty', { k: 'doc', id: b.dataset.doc }));
  root.querySelectorAll('[data-trace]').forEach(b => b.onclick = () => openTab('dane', { k: 'trace', id: b.dataset.trace }));
}
function bindStart() {
  const sc = $('#screen'); bindCommon(sc);
  $('#askBox').onclick = () => { openTab('asystent'); setTimeout(() => $('#ask').focus(), 50); };
}

const me = D.me;
const DOCS = {
  dowod: { name: 'mDowód', g: 'g-id', short: () => 'ważny do ' + me.idValid, share: true,
    rows: [['Imię i nazwisko', me.first + ' ' + me.last], ['PESEL', me.pesel], ['Data urodzenia', me.born], ['Numer', me.idNo], ['Ważny do', me.idValid]] },
  prawojazdy: { name: 'Prawo jazdy', g: 'g-dl', short: () => 'kat. ' + me.dl.cat + ', ' + me.dl.points + ' pkt karne', share: true,
    rows: [['Kategorie', me.dl.cat], ['Numer blankietu', me.dl.no], ['Ważne do', me.dl.valid], ['Punkty karne', String(me.dl.points)]] },
  pojazd: { name: 'Mój pojazd', g: 'g-car', short: () => S.carSold ? 'zbyty 23.10' : me.car.plate + ', OC do ' + me.car.oc, share: false,
    rows: [['Pojazd', me.car.name], ['Rejestracja', me.car.plate], ['VIN', me.car.vin], ['OC do', me.car.oc], ['Badanie do', me.car.inspection]] }
};
function docCard(k, tag) {
  const d = DOCS[k];
  const name = k === 'pojazd' ? me.car.name : me.first + ' ' + me.last;
  const sub = k === 'pojazd' ? (S.carSold ? 'zgłoszono zbycie 23.10.2026' : me.car.plate) : k === 'dowod' ? 'PESEL ' + me.pesel : 'kategoria ' + me.dl.cat;
  const meta = tag === 'button' ? `<div class="dmeta">${d.rows.slice(-2).map(r => `<div>${esc(r[0])}<b>${esc(r[1])}</b></div>`).join('')}</div>` : '';
  return `<${tag} class="doc ${d.g}" ${tag === 'button' ? `data-doc="${k}"` : ''}>
    <div class="dhead"><span class="dtype">${esc(d.name)}</span><span class="chip"></span></div>
    <div class="dbody">${k === 'dowod' ? '<div class="photo"></div>' : ''}<div><div class="dname">${esc(name)}</div><div class="dsub">${esc(sub)}</div></div></div>
    ${meta}</${tag}>`;
}
function viewDocs() {
  return Object.keys(DOCS).map(k => docCard(k, 'button')).join('')
    + `<p class="muted" style="margin:6px 4px">Dokumenty i dane są fikcyjne. Wygląd nie odwzorowuje prawdziwych dokumentów.</p>`;
}
function bindDocs() { bindCommon($('#screen')); }
function viewDoc(id) {
  const d = DOCS[id];
  return `${docCard(id, 'div')}
    <div class="card"><dl class="kv">${d.rows.map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl></div>
    ${d.share ? `<button class="btn mt" id="shareBtn">${I.eye}Pokaż komuś</button><p class="muted mt" style="text-align:center">Wybierzesz, co dokładnie zobaczy druga osoba.</p>` : ''}
    <div class="list mt"><button class="row" data-goto="dane-log"><div class="ic">${I.shield}</div><div class="tx"><b>Kto czytał ten dokument</b><span>Dziennik odczytów z rejestrów</span></div>${I.chev}</button></div>`;
}
const SHARE = {
  dowod: [['Tylko: mam ukończone 18 lat', 'np. zakup w sklepie. Bez imienia, PESEL-u i daty urodzenia.', ['Pełnoletność: tak', 'Zdjęcie']],
          ['Imię, nazwisko i zdjęcie', 'np. odbiór przesyłki, hotel', ['Imię i nazwisko', 'Zdjęcie']],
          ['Pełne dane dowodu', 'np. notariusz, umowa najmu', ['Imię i nazwisko', 'PESEL', 'Data urodzenia', 'Numer dowodu', 'Zdjęcie']]],
  prawojazdy: [['Uprawnienia do prowadzenia', 'np. wypożyczalnia, kontrola', ['Imię i nazwisko', 'Kategorie', 'Ważność', 'Zdjęcie']],
               ['Pełne dane z punktami karnymi', 'np. pracodawca zatrudniający kierowców', ['Imię i nazwisko', 'Kategorie', 'Ważność', 'Punkty karne', 'Zdjęcie']]]
};
function bindDoc(id) {
  bindCommon($('#screen'));
  const b = $('#shareBtn'); if (!b) return;
  b.onclick = () => {
    let pick = 0;
    const opts = SHARE[id];
    const draw = () => {
      sheet(`<h3>Co chcesz pokazać?</h3><p class="sub">Druga osoba zobaczy tylko zaznaczony zakres. Nic więcej nie da się odczytać z kodu.</p><div class="mt">
        ${opts.map((o, i) => `<button class="choice ${i === pick ? 'on' : ''}" data-i="${i}"><div class="radio"></div><div><b>${esc(o[0])}</b><span>${esc(o[1])}</span></div></button>`).join('')}</div>
        <button class="btn mt" id="showQr">Pokaż kod</button>`);
      document.querySelectorAll('.choice').forEach(c => c.onclick = () => { pick = +c.dataset.i; draw(); });
      $('#showQr').onclick = () => {
        const o = opts[pick];
        passkey('Pokazanie danych: ' + o[0], 'UD-' + fnv(o[0]).slice(0, 4).toUpperCase(), fnv(o.join()) + fnv(now()), () => showQr(o));
      };
    };
    draw();
  };
}
function showQr(o) {
  let left = 120;
  sheet(`<h3 style="text-align:center">Pokaż ten kod</h3>${qrSvg(o[0] + now())}
    <div class="timer" id="qrT">Kod wygaśnie za 2:00</div>
    <div class="card mt" style="box-shadow:none;background:var(--bg)"><b style="font-size:14px">Odbiorca zobaczy:</b><div class="scope">${o[2].map(x => `<span class="pill">${esc(x)}</span>`).join('')}</div></div>
    <p class="muted mt">Kto zeskanuje kod, trafi do dziennika w Moich danych.</p><button class="btn ghost mt" id="qrClose">Zamknij</button>`);
  const t = setInterval(() => {
    left--; const el = $('#qrT');
    if (!el || left <= 0) { clearInterval(t); if (el) el.textContent = 'Kod wygasł'; return; }
    el.textContent = `Kod wygaśnie za ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  }, 1000);
  $('#qrClose').onclick = () => { clearInterval(t); closeSheet(); };
}

function renderChat() {
  const sc = $('#screen');
  if (!chatEl.children.length) {
    sc.innerHTML = `<div class="intro"><div class="orb">${I.spark}</div><h2>W czym pomóc, Anno?</h2><p>Rejestry sprawdzam sama. Wszystko, co coś zmienia, potwierdzasz podpisem na karcie.</p></div>
      <div class="starters">${STARTERS.map(s => `<button class="starter" data-run="${s[0]}"><span class="ic ${STARTER_TINT[s[0]]}">${STARTER_ICON[s[0]]}</span>${esc(s[1])}</button>`).join('')}</div>
      <p class="muted" style="margin:16px 6px 0;text-align:center">W prototypie asystent działa na przygotowanych scenariuszach. Możesz też wpisać własne pytanie.</p>`;
    sc.querySelectorAll('[data-run]').forEach(b => b.onclick = () => { if (!S.busy) { sc.replaceChildren(chatEl); play(b.dataset.run); } });
    return;
  }
  sc.replaceChildren(chatEl);
  sc.scrollTop = sc.scrollHeight;
}

function viewData() {
  const seg = `<div class="seg"><button data-seg="zgody" class="${S.dataTab === 'zgody' ? 'on' : ''}">Zgody</button><button data-seg="log" class="${S.dataTab === 'log' ? 'on' : ''}">Kto czytał</button><button data-seg="sprawy" class="${S.dataTab === 'sprawy' ? 'on' : ''}">Ślady spraw</button></div>`;
  let body = '';
  if (S.dataTab === 'zgody') {
    body = `<p class="muted" style="margin:8px 4px 12px">Kto ma teraz Twoje dane i po co. Zgodę cofasz jednym ruchem, bez podpisu.</p>`
      + S.consents.map(c => `<div class="consent ${c.revoked ? 'revoked' : ''} ${c.fresh ? 'fresh' : ''}"><div class="ic ${CONSENT_TINT[c.icon] || ''}">${CONSENT_ICON[c.icon] || I.shield}</div><div class="body"><div class="top"><b>${esc(c.who)}</b>${c.revoked ? '<span class="pill red">cofnięta</span>' : c.used ? '<span class="pill grey">wykorzystana</span>' : '<span class="pill ok">aktywna</span>'}</div>
        <div class="what">${esc(c.what)}</div><div class="meta"><span>${esc(c.why)} · ${esc(c.revoked ? 'cofnięta dziś, ' + c.revoked : c.until)}</span>
        ${!c.used && !c.revoked ? `<button class="revoke" data-rev="${c.id}">Cofnij</button>` : ''}</div></div></div>`).join('');
  } else if (S.dataTab === 'log') {
    const ic = { me: ['', I.user], office: ['warn', I.office], police: ['red', I.police], company: ['trust', I.bank] };
    body = `<p class="muted" style="margin:8px 4px 12px">Każdy odczyt Twoich danych z rejestrów państwowych, z podstawą prawną. Dziennik prowadzą rejestry, nie aplikacja.</p>
      <div class="list">${S.access.map(a => `<div class="row"><div class="ic ${ic[a.kind][0]}">${ic[a.kind][1]}</div><div class="tx"><b>${esc(a.who)}</b><span>${esc(a.what)}</span><span>${esc(a.when)} · ${esc(a.basis)}</span></div></div>`).join('')}</div>
      <button class="btn ghost mt" id="notMe">To nie byłam ja? Zgłoś odczyt</button>`;
  } else {
    body = `<p class="muted" style="margin:8px 4px 12px">Każda sprawa z asystentem zostawia ślad: od Twojej prośby, przez każdy odczyt i regułę, do decyzji urzędu.</p>`
      + (S.threads.length ? `<div class="list">${S.threads.map(threadRow).join('')}</div>` : `<div class="card muted">Jeszcze nic tu nie ma. Załatw coś z asystentem, na przykład <button class="link" data-run="sprzedaz" style="margin-top:8px">Sprzedaję auto</button></div>`);
  }
  const active = S.consents.filter(c => !c.used && !c.revoked).length;
  const inst = new Set(S.access.filter(a => a.kind !== 'me').map(a => a.who)).size;
  return `<div class="kpis"><div class="kpi ok"><b>${active}</b><span>aktywne zgody</span></div><div class="kpi warn"><b>${inst}</b><span>${inst === 1 ? 'instytucja czytała' : (inst % 10 >= 2 && inst % 10 <= 4 && (inst % 100 < 12 || inst % 100 > 14)) ? 'instytucje czytały' : 'instytucji czytało'} dane</span></div><div class="kpi trust"><b>${S.threads.length}</b><span>ślady spraw</span></div></div>
    <div class="list" style="margin:0 0 10px"><button class="row" data-goto="rules"><div class="ic trust">${I.lock}</div><div class="tx"><b>Granice asystenta</b><span>Czego asystent nigdy nie zrobi bez Ciebie</span></div>${I.chev}</button></div>${seg}${body}`;
}
const CONSENT_ICON = { car: I.car, med: I.pill, bank: I.bank };
const CONSENT_TINT = { car: 'warn', med: 'pink', bank: 'trust' };
function bindData() {
  const sc = $('#screen'); bindCommon(sc);
  sc.querySelectorAll('[data-seg]').forEach(b => b.onclick = () => { S.dataTab = b.dataset.seg; render(); });
  sc.querySelectorAll('[data-rev]').forEach(b => b.onclick = () => {
    const c = S.consents.find(x => x.id === b.dataset.rev);
    sheet(`<h3>Cofnąć zgodę?</h3><p class="sub"><b>${esc(c.who)}</b> straci dostęp do: ${esc(c.what.toLowerCase())}.</p>
      <div class="rule" style="display:flex;gap:8px;font-size:13px;color:var(--trust);background:var(--trustSoft);border-radius:10px;padding:10px 12px;margin-top:14px">${I.lock}<span>Cofnięcie nie wymaga podpisu. Łatwiej zabrać niż dać.</span></div>
      <button class="btn red mt" id="revOk">Cofnij zgodę</button><button class="btn ghost mt" id="revNo">Zostaw</button>`);
    $('#revNo').onclick = closeSheet;
    $('#revOk').onclick = () => { c.revoked = now(); closeSheet(); render(); toast(`Zgoda cofnięta o ${now()}. ${c.who} nie ma już dostępu.`); };
  });
  const nm = $('#notMe'); if (nm) nm.onclick = () => toast('Zgłoszenie trafiłoby do inspektora ochrony danych instytucji, która odczytała dane.');
}

function viewTrace(id) {
  const t = S.threads.find(x => x.id === id);
  if (!t) return '<p class="muted">Nie ma takiej sprawy.</p>';
  return `<div class="tcard"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:19px">${esc(t.title)}</b><span class="pill ${t.status === 'zakończona' ? 'ok' : t.status === 'anulowana' ? 'red' : 'warn'}">${t.status}</span></div>
      <p class="muted" style="margin-top:4px">Sprawa ${t.id} · rozpoczęta ${t.started} · ${kroki(t.events.length)}</p>
      <div class="legend"><span class="pill">Ty</span><span class="pill ok">rejestry i urzędy</span><span class="pill trust">reguły w kodzie</span></div></div>
    <div class="tl mt">${t.events.map(e => `<div class="ev ${e.kind}"><div class="eh"><b>${KIND[e.kind]}</b><span>#${e.n}${e.parent ? ' ← #' + e.parent : ''} · ${e.t}</span></div><p>${esc(e.text)}</p><div class="who">${esc(e.who)}</div></div>`).join('')}</div>
    <p class="muted" style="margin:0 4px">Każdy krok ma numer sprawy i poprzedniego kroku, więc da się odtworzyć cały łańcuch od prośby do skutku. Asystent nie może niczego z tej listy usunąć.</p>`;
}

function viewRules() {
  return `<div class="rulehero"><div class="ic">${I.lock}</div><div><b>Tego nie zmieni żadna rozmowa</b><p>Zasady z kłódką są zapisane w kodzie aplikacji i sprawdza je serwer. Asystent ich nie zmieni, nawet gdy ktoś go o to poprosi w rozmowie, SMS-ie czy mailu.</p></div></div>
    <div class="sec">Zawsze, bez wyjątków</div>
    <div class="list rules">${S.rules.map((r, i) => r.locked ? `<div class="row"><div class="tx"><b>${esc(r.t)}</b><span>${esc(r.d)}</span></div><span class="lock">${I.lock}w kodzie</span></div>` : '').join('')}</div>
    <div class="sec">Twoje ustawienia</div>
    <div class="list rules">${S.rules.map((r, i) => !r.locked ? `<button class="row" data-rule="${i}"><div class="tx"><b>${esc(r.t)}</b><span>${esc(r.d)}</span></div><span class="switch ${r.on ? 'on' : ''}"></span></button>` : '').join('')}</div>`;
}
function bindRules() {
  document.querySelectorAll('[data-rule]').forEach(b => b.onclick = () => { const r = S.rules[+b.dataset.rule]; r.on = !r.on; render(); toast(r.t + ': ' + (r.on ? 'włączone' : 'wyłączone')); });
}

function viewPeople() {
  const card = (p, mine) => `<${mine ? 'button' : 'div'} class="card pcard" ${mine ? `data-person="${p.id}"` : ''}>
    <div class="person"><div class="face" style="background:${p.color}">${p.initials}</div><div style="flex:1"><b style="font-size:16px">${esc(p.name)}</b><div class="muted">${esc(p.rel)}</div></div>${mine ? I.chev : ''}</div>
    <div class="scope">${p.scope.map(s => `<span class="pill ${mine ? 'trust' : ''}">${esc(s)}</span>`).join('')}</div>
    <div class="pfoot"><span>Ważne: ${esc(p.until)}</span>${mine && p.log[0] ? `<span>Ostatnio ${esc(p.log[0].when)}</span>` : ''}</div></${mine ? 'button' : 'div'}>`;
  return `<div class="sec">Działasz w ich imieniu</div>${S.forOthers.map(p => card(p, true)).join('')}
    <p class="muted" style="margin:-2px 4px 6px">Każdy Twój krok w ich sprawach widzą od razu w swoich aplikacjach.</p>
    <div class="sec">Działają w Twoim imieniu</div>${D.forMe.map(p => card(p, false)).join('')}
    <button class="btn ghost mt" id="addDel">${I.plus}Dodaj pełnomocnictwo</button>`;
}
function bindPeople() {
  const sc = $('#screen');
  sc.querySelectorAll('[data-person]').forEach(b => b.onclick = () => openView({ k: 'person', id: b.dataset.person }));
  $('#addDel').onclick = () => sheet(`<h3>Nowe pełnomocnictwo</h3><p class="sub">Bez urzędu i bez notariusza dla spraw codziennych.</p>
    <ol style="margin:14px 0 0 20px;display:grid;gap:10px;font-size:14.5px;line-height:1.45;color:var(--ink2)">
      <li><b style="color:var(--ink)">Wybierz osobę.</b> Skanujesz jej kod w mObywatelu.</li>
      <li><b style="color:var(--ink)">Wybierz zakres.</b> Na przykład tylko recepty i wizyty, albo płatności do określonej kwoty.</li>
      <li><b style="color:var(--ink)">Ustal termin.</b> Pełnomocnictwo wygasa samo.</li>
      <li><b style="color:var(--ink)">Podpisujecie oboje.</b> Każde z Was swoim kluczem.</li></ol>
    <p class="muted mt">Osoba, która daje pełnomocnictwo, widzi każdy krok pełnomocnika i może je cofnąć w każdej chwili. W prototypie to tylko podgląd.</p>
    <button class="btn mt" onclick="closeSheet()">Rozumiem</button>`);
}
function viewPerson(id) {
  const p = S.forOthers.find(x => x.id === id);
  return `<div class="card"><div class="person"><div class="face" style="background:${p.color}">${p.initials}</div><div><b style="font-size:17px">${esc(p.name)}</b><div class="muted">${esc(p.rel)}</div></div></div>
      <div class="scope">${p.scope.map(s => `<span class="pill trust">${esc(s)}</span>`).join('')}</div><p class="muted mt">Ważne: ${esc(p.until)}</p></div>
    <div class="sec">Co zrobiłaś w imieniu tej osoby</div>
    <div class="list">${p.log.map(l => `<div class="row"><div class="ic trust">${I.check}</div><div class="tx"><b>${esc(l.what)}</b><span>${esc(l.when)} · ${esc(p.name.split(' ')[0])} dostała powiadomienie</span></div></div>`).join('')}</div>
    <p class="muted" style="margin:10px 4px">Tę samą listę widzi ${esc(p.name.split(' ')[0])} w swojej aplikacji. Nie da się z niej niczego usunąć.</p>
    ${id === 'mama' ? `<button class="btn mt" data-run="mama">Wykup recepty mamy</button>` : ''}
    <button class="btn ghost mt" id="endDel">Zakończ pełnomocnictwo</button>`;
}
function bindPerson() {
  bindCommon($('#screen'));
  $('#endDel').onclick = () => toast('W prototypie pełnomocnictwo zostaje. W prawdziwej aplikacji obie strony mogą je zakończyć w każdej chwili.');
}

// ---------- sheet & toast ----------
function sheet(html, about) {
  $('#sheet').innerHTML = html;
  $('#sheetWrap').hidden = false;
  if (about) $('#sheet').querySelectorAll('[data-run],[data-go]').forEach(b => b.onclick = () => { closeSheet(); sideAction(b); });
}
function closeSheet() { $('#sheetWrap').hidden = true; $('#sheet').innerHTML = ''; }
window.closeSheet = closeSheet;
$('#sheetWrap').onclick = e => { if (e.target.id === 'sheetWrap') closeSheet(); };
let toastT;
function toast(text) { const t = $('#toast'); t.textContent = text; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200); }

// ---------- wiring ----------
function sideAction(b) {
  if (b.dataset.run) return startCase(b.dataset.run);
  if (b.dataset.go === 'dane') { S.dataTab = 'log'; return openTab('dane'); }
  if (b.dataset.go === 'dowod') return openTab('dokumenty', { k: 'doc', id: 'dowod' });
}
document.querySelectorAll('.tabbar button').forEach(b => b.onclick = () => openTab(b.dataset.tab));
document.querySelectorAll('#tryList button').forEach(b => b.onclick = () => sideAction(b));
$('#resetBtn').onclick = () => location.reload();
$('#askSend').onclick = () => ask($('#ask').value);
$('#ask').addEventListener('keydown', e => { if (e.key === 'Enter') ask($('#ask').value); });
$('#clock').textContent = now();
openTab('start');
