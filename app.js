'use strict';
// Clickable prototype engine: screens, scripted assistant, confirm cards, case traces.
const D = window.DATA, SCEN = window.SCEN;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
const FAST = /[?&]fast\b/.test(location.search);
const sleep = ms => new Promise(r => setTimeout(r, FAST ? 0 : ms));
const svg = d => `<svg viewBox="0 0 24 24">${d}</svg>`;

const I = {
  chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M9 5.5l6.5 6.5L9 18.5"/></svg>',
  back: svg('<path d="M20 12H5M11 5l-7 7 7 7"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  done: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  bell: svg('<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/>'),
  warn: svg('<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>'),
  car: svg('<path d="M4 16v-4l2-5h12l2 5v4zM4 16v2.5h3V16M17 16v2.5h3V16M7.5 12.5h.5M16 12.5h.5"/>'),
  pill: svg('<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.5 8.5l5 7"/>'),
  bank: svg('<path d="M3 9l9-5 9 5zM5 10v7M10 10v7M14 10v7M19 10v7M3 20h18"/>'),
  id: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14.5 10h3.5M14.5 13.5h3.5"/>'),
  user: svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/>'),
  users: svg('<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 1.8 6 5.5"/>'),
  office: svg('<path d="M4 21V7l8-4 8 4v14M9 21v-5h6v5M8 10h.5M12 10h.5M16 10h.5"/>'),
  shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  baby: svg('<circle cx="12" cy="9" r="5"/><path d="M10 9h.3M14 9h.3M10.5 11.3c.9.6 2.1.6 3 0M7 20c.8-2.3 2.8-4 5-4s4.2 1.7 5 4"/>'),
  home: svg('<path d="M3 11l9-7 9 7M5 9.5V20h5v-5h4v5h5V9.5"/>'),
  wallet: svg('<path d="M4 7h14a2 2 0 012 2v9a2 2 0 01-2 2H4zM4 7l11-3v3M15 13.5h2"/>'),
  msg: svg('<path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v3.5M12 13.6v.4"/>'),
  trace: svg('<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 8v8M8 6.5c5 .5 8 2.5 8.5 4M8 17.5c5-.5 8-2.5 8.5-4"/>'),
  finger: svg('<path d="M7 11a5 5 0 0110 0v2M12 11v4c0 2-.8 3.6-2 5M9.5 11.5v2.5c0 1.5-.5 2.8-1.3 3.8M14.5 12v3c0 2.2-.6 4-1.6 5.5M17 15.5c0 1.4-.3 2.7-.8 3.8M4.8 15c.3-.9.4-1.9.4-3a6.8 6.8 0 0113.6 0"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  spark: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  police: svg('<path d="M12 3l8 3-1 4H5L4 6zM6 10v3a6 6 0 0012 0v-3"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  pen: svg('<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>'),
  file: svg('<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 16.5h6"/>'),
  scan: svg('<path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M7 12h10"/>'),
  money: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9v.5M17.5 14.5v.5"/>'),
  heart: svg('<path d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0112 7.5 4.5 4.5 0 0119.5 10c0 5.5-7.5 10-7.5 10z"/>'),
  vote: svg('<path d="M5 12l4 4 10-10M4 20h16"/>'),
  send: svg('<path d="M4 12l16-8-6 16-3-7z"/>'),
  bus: svg('<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8.5 14.5h.5M15 14.5h.5M7 17.5V20M17 17.5V20M9 6.5h6"/>'),
  tree: svg('<path d="M9 3l5 8h-2.5l4 6H4.5l4-6H6zM9 17v4"/><circle cx="17.5" cy="15" r="2.2"/><path d="M17.5 21s-3.5-3-3.5-6a3.5 3.5 0 017 0c0 3-3.5 6-3.5 6z"/>'),
  plane: svg('<path d="M10.5 13.5L4 11l1-1.5 7 .5 4.5-5c1-1 2.5-1.2 3-.7s.3 2-.7 3l-5 4.5.5 7L13 20l-2.5-6.5L7 17l.5 2.5-1 1L5 17.5 2.5 16l1-1L6 15.5z"/>'),
  plug: svg('<path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 01-11 0zM12 16.5V21"/>'),
  train: svg('<rect x="5" y="3" width="14" height="14" rx="4"/><path d="M5 10h14M9 13.5h.5M14.5 13.5h.5M8 17l-2 4M16 17l2 4"/>'),
  edit: svg('<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>'),
  help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 .5c0 1.7-2.5 2-2.5 3.5M12 17v.5"/>'),
  qr: svg('<path d="M4 8V5.5A1.5 1.5 0 015.5 4H8M16 4h2.5A1.5 1.5 0 0120 5.5V8M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16M8 20H5.5A1.5 1.5 0 014 18.5V16M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 13v3"/>')
};

const S = {
  tab: 'start', view: null, dataTab: 'zgody', busy: false, carSold: false,
  consents: JSON.parse(JSON.stringify(D.consents)),
  access: JSON.parse(JSON.stringify(D.access)),
  forOthers: JSON.parse(JSON.stringify(D.forOthers)),
  rules: JSON.parse(JSON.stringify(D.rules)),
  threads: [], cur: null, min: 14, docOrder: ['dowod', 'kdr', 'prawojazdy', 'pojazd'], peselLocked: null
};
const chatEl = document.createElement('div');
chatEl.className = 'chat';

// Fake clock so all timestamps in the demo agree with each other.
const now = () => '21:' + String(S.min).padStart(2, '0');
setInterval(() => { S.min = Math.min(59, S.min + 1); $('#clock').textContent = now(); }, 60000);

// Polish plurals: 1 krok, 2-4 kroki, 5+ kroków (12-14 kroków).
function plural(n, one, few, many) {
  if (n === 1) return one;
  return (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
}
const kroki = n => n + ' ' + plural(n, 'krok', 'kroki', 'kroków');
function fnv(str) { let h = 0x811c9dc5; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }

// Life events shown as services on the start screen, each with an intro page.
const EVENTS = {
  sprzedaz: { label: 'Sprzedaję auto', title: 'Sprzedajesz auto?', color: '#e8761a', icon: I.car, cta: 'Zacznij sprzedaż',
    lead: 'Umowa, zgłoszenie zbycia, ubezpieczyciel i podatek za jednym razem. Asystent wypełni wszystko danymi z rejestrów, a Ty tylko podpisujesz.',
    steps: [[I.scan, 'Kupujący skanuje Twój kod'], [I.pen, 'Podpisujecie umowę w aplikacji'], [I.office, 'Zgłoszenie zbycia trafia do starosty'], [I.shield, 'Ubezpieczyciel dostaje informację'], [I.bell, 'Kupujący dostaje przypomnienie o PCC']] },
  portfel: { label: 'Zgubiony portfel', title: 'Zgubiłaś portfel?', color: '#d92d45', icon: I.wallet, cta: 'Zabezpiecz dokumenty',
    lead: 'Zastrzeż dokumenty w minutę, zanim ktoś ich użyje. mDowód w telefonie działa dalej.',
    steps: [[I.id, 'Wskaż, co było w portfelu'], [I.lock, 'Zastrzeż dowód i prawo jazdy'], [I.file, 'Złóż wniosek o nowy dowód'], [I.bell, 'Dostaniesz powiadomienie o odbiorze']] },
  dziecko: { label: 'Narodziny dziecka', title: 'Spodziewacie się dziecka?', color: '#d0457f', icon: I.baby, cta: 'Zobacz plan',
    lead: 'Po narodzinach większość spraw zrobi się prawie sama. Asystent przygotuje wnioski z danymi z aktu urodzenia.',
    steps: [[I.file, 'Akt urodzenia i PESEL dziecka'], [I.home, 'Zameldowanie'], [I.money, '800 plus'], [I.users, 'Karta Dużej Rodziny'], [I.heart, 'Ubezpieczenie zdrowotne']] },
  przeprowadzka: { label: 'Przeprowadzka', title: 'Przeprowadzasz się?', color: '#0f957f', icon: I.home, cta: 'Zobacz plan',
    lead: 'Podaj nowy adres raz. Asystent rozpisze, kto powinien o nim wiedzieć, i przygotuje wnioski.',
    steps: [[I.home, 'Zameldowanie pod nowym adresem'], [I.office, 'ZUS i urząd skarbowy'], [I.car, 'Adres w dowodzie rejestracyjnym'], [I.heart, 'Nowa przychodnia'], [I.vote, 'Miejsce głosowania']] },
  sms: { label: 'Podejrzany SMS', title: 'Dostałaś dziwną wiadomość?', color: '#5a45c8', icon: I.msg, cta: 'Sprawdź wiadomość',
    lead: 'Asystent sprawdzi SMS albo mail. Treść wiadomości traktuje wyłącznie jako dane, więc żadne polecenie z niej go nie przekona.',
    steps: [[I.msg, 'Przekazujesz wiadomość'], [I.eye, 'Asystent sprawdza nadawcę i link'], [I.lock, 'Polecenia z treści są ignorowane'], [I.send, 'Możesz zgłosić oszustwo do CERT Polska']] },
  mama: { label: 'Recepty mamy', title: 'Sprawy bliskich', color: '#2e8b3e', icon: I.pill, cta: 'Wykup recepty mamy',
    lead: 'Załatwiaj sprawy mamy w ramach pełnomocnictwa. Mama widzi każdy Twój krok w swojej aplikacji.',
    steps: [[I.users, 'Pełnomocnictwo: recepty, wizyty, opłaty do 300 zł'], [I.pill, '2 recepty czekają na wykup'], [I.bell, 'Mama dostaje powiadomienie o każdym działaniu']] }
};

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
function add(html, cls) {
  const sc = $('#screen');
  if (inChat() && chatEl.parentNode !== sc) sc.replaceChildren(chatEl);
  const el = document.createElement('div');
  if (cls) el.className = cls;
  el.innerHTML = html;
  chatEl.appendChild(el);
  scrollChat();
  return el;
}
const inChat = () => !!(S.view && S.view.k === 'chat');
function scrollChat() { if (inChat()) { const sc = $('#screen'); requestAnimationFrame(() => { sc.scrollTop = sc.scrollHeight; }); } }
function line(icon, src, text, color) {
  const el = add(`${icon}<span><b>${esc(src)}</b> · ${esc(text)}</span>`, 'read');
  if (color) el.querySelector('svg').style.color = color;
  return el;
}

async function step(s) {
  if (s.u !== undefined) { add(esc(s.u), 'msg u'); tr('prosba', 'Ty', s.u); await sleep(350); return; }
  if (s.acting) { add(I.users + esc(s.acting), 'actingas'); tr('regula', 'Kod aplikacji', s.acting); await sleep(250); return; }
  if (s.read) { await sleep(320); line(I.check, s.read[0], s.read[1]); tr('odczyt', 'Asystent → ' + s.read[0], s.read[1]); logAccess(s.read[0], s.read[1]); return; }
  if (s.exec) { await sleep(450); line(I.done, s.exec[0], s.exec[1], 'var(--ok)'); tr('wykonanie', s.exec[0], s.exec[1]); return; }
  if (s.notify) { await sleep(300); line(I.bell, 'Powiadomienie', s.notify, '#e08a00'); tr('powiadomienie', 'Kod aplikacji', s.notify); return; }
  if (s.rule) { await sleep(300); line(I.lock, 'Reguła', s.rule, 'var(--trust)'); tr('regula', 'Kod aplikacji', s.rule); return; }
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
    add(`<div class="lbl">${I.warn}Treść z zewnątrz, tylko dane</div><div class="from">${esc(s.untrusted.from)}</div><p>${esc(s.untrusted.text)}</p>`, 'untrusted');
    tr('zewn', 'SMS (niezaufane)', s.untrusted.text); return;
  }
  if (s.result) {
    await sleep(350);
    add(`<div class="rc">${I.check}</div><div><b>${esc(s.result.title)}</b><span>${esc(s.result.text)}</span></div>`, 'result');
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
      el.classList.add('used'); b.style.background = 'var(--navySoft)';
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
}

function startCase(id) {
  openTab('start', { k: 'chat' });
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
  return `<svg class="qr" viewBox="-1 -1 ${n + 2} ${n + 2}" style="fill:#141a24;stroke:none">${cells}</svg>`;
}
function qrStep(q) {
  const el = add(`<h4>${esc(q.title)}</h4>${qrSvg(q.title + now())}<ul>${q.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="muted">Kod jest ważny 2 minuty i działa tylko raz.</p><button class="btn outline mt">Symuluj: kupujący skanuje kod</button>`, 'qrwait');
  tr('podpis', 'Ty', 'Pokazałaś kod. Zakres: ' + q.items.join(', '));
  el.querySelector('button').onclick = e => {
    const b = e.currentTarget;
    b.outerHTML = `<p class="status ok mt"><i></i>${esc(q.who)} zeskanował kod</p>`;
    play(q.next);
  };
}

// ---------- confirm card + passkey ----------
function confirmStep(c) {
  const body = c.rows.map(r => r[0] + '=' + r[1]).join('|');
  const code = 'CZ-' + fnv(c.title + body).slice(0, 4).toUpperCase() + '-' + fnv(body).slice(4, 8).toUpperCase();
  tr('propozycja', 'Asystent', 'Proponuje: ' + c.title + ' (' + code + ')');
  tr('regula', 'Kod aplikacji', c.rule);
  const el = add(`<div class="ch"><span class="status navy"><i></i>Do podpisu</span><span class="code">${code}</span></div>
    <b style="display:block;font-size:17px;font-weight:700;margin-top:10px">${esc(c.title)}</b>
    <dl class="kv">${c.rows.map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>
    <p class="effect">${esc(c.effect)}</p><div class="rule">${I.lock}<span>${esc(c.rule)}</span></div>
    <div class="cf"><button class="btn">${I.finger}Podpisz</button><button class="btn outline">Anuluj</button></div>`, 'confirm');
  const [sign, cancel] = el.querySelectorAll('.cf button');
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
    <button class="btn outline mt" id="fpNo">Anuluj</button></div>`);
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
    S.consents.unshift({ id: 'c' + Date.now(), who: 'Piotr Wiśniewski (kupujący)', what: 'Imię, nazwisko, dane pojazdu PO 4R521', why: 'Umowa kupna-sprzedaży Toyoty', until: 'jednorazowo, wykorzystana dziś', icon: 'car', used: true });
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
const STARTER_COLOR = { sprzedaz: '#e8761a', portfel: '#d92d45', mama: '#2e8b3e', sms: '#5a45c8', oc: '#0b4a96', dziecko: '#d0457f', przeprowadzka: '#0f957f' };

// ---------- navigation ----------
function openTab(tab, view = null) {
  S.tab = tab; S.view = view;
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  render();
}
function openView(view) { S.view = view; render(); }
function goLink(to, thread) {
  if (to === 'trace') return openTab('wiecej', { k: 'trace', id: (thread || S.cur).id });
  if (to === 'dane') { S.dataTab = 'zgody'; return openTab('wiecej', { k: 'dane' }); }
  if (to === 'dane-log') { S.dataTab = 'log'; return openTab('wiecej', { k: 'dane' }); }
  if (to === 'sprawy') { S.dataTab = 'sprawy'; return openTab('wiecej', { k: 'dane' }); }
  if (to === 'bliscy') return openTab('wiecej', { k: 'bliscy' });
  if (to === 'rules') return openTab('wiecej', { k: 'rules' });
  if (to === 'asystent') return openTab('start', { k: 'chat' });
  openTab(to);
}

// Header variants copied from the app: avatar + bell (Start), logo + bell (Dokumenty), centred title elsewhere.
function topbar(mode, title, opts = {}) {
  const tb = $('#topbar');
  const info = `<button class="iconbtn infobtn" id="infoBtn" aria-label="O koncepcji">${I.info}</button>`;
  const bell = `<button class="iconbtn" id="bellBtn" aria-label="Powiadomienia">${I.bell}</button>`;
  if (mode === 'home' || mode === 'logo') {
    tb.className = 'topbar root';
    tb.innerHTML = `${mode === 'home' ? '<button class="avatar" id="avBtn" aria-label="Twój profil">AN</button>' : '<span class="logo-sq">m</span>'}<div class="tb-right">${info}${bell}</div>`;
  } else {
    tb.className = 'topbar';
    tb.innerHTML = `${opts.back ? `<button class="iconbtn" id="backBtn" aria-label="Wstecz">${I.back}</button>` : '<span></span>'}
      <h1>${esc(title)}${opts.sub ? `<span class="sub">${esc(opts.sub)}</span>` : ''}</h1>
      <div class="tb-right" style="justify-content:flex-end">${info}${opts.right || ''}</div>`;
  }
  const bb = $('#backBtn'); if (bb) bb.onclick = () => openView(S.view && S.view.from ? S.view.from : null);
  const av = $('#avBtn'); if (av) av.onclick = () => openTab('wiecej');
  const bl = $('#bellBtn'); if (bl) bl.onclick = showNotifications;
  const ed = $('#editBtn'); if (ed) ed.onclick = () => toast('Tu ułożysz kolejność usług, jak w obecnej aplikacji.');
  $('#infoBtn').onclick = showAbout;
}
function showAbout() {
  sheet($('#about').innerHTML.replace(/<button class="reset"[^>]*>.*?<\/button>/, '')
    .replace('<h1>', '<h1 class="about-h1">').replace('<h2>', '<h2 class="about-h2">'), true);
}

function render() {
  const sc = $('#screen');
  const v = S.view;
  $('#composer').hidden = !inChat();
  if (v && v.k === 'chat') { topbar('center', 'Asystent', { back: true, sub: 'Granice ustala kod, nie rozmowa' }); renderChat(); return; }
  if (v && v.k === 'rules') { topbar('center', 'Granice asystenta', { back: true }); sc.innerHTML = viewRules(); bindRules(); }
  else if (v && v.k === 'trace') { topbar('center', 'Ślad sprawy', { back: true }); sc.innerHTML = viewTrace(v.id); }
  else if (v && v.k === 'doc') { topbar('center', DOCS[v.id].name, { back: true }); sc.innerHTML = viewDoc(v.id); bindDoc(v.id); }
  else if (v && v.k === 'person') { topbar('center', 'Pełnomocnictwo', { back: true }); sc.innerHTML = viewPerson(v.id); bindCommon(sc); bindPerson(v.id); }
  else if (v && v.k === 'settings') { topbar('center', 'Ustawienia', { back: true }); sc.innerHTML = viewSettings(); bindSettings(); }
  else if (v && v.k === 'help') { topbar('center', 'Pomoc', { back: true }); sc.innerHTML = viewHelp(); }
  else if (v && v.k === 'event') { topbar('center', EVENTS[v.id].label, { back: true }); sc.innerHTML = viewEvent(v.id); bindCommon(sc); }
  else if (v && v.k === 'svc') { topbar('center', SERVICES[v.id].label, { back: true }); sc.innerHTML = viewService(v.id); bindService(v.id); }
  else if (v && v.k === 'dane') { topbar('center', 'Moje dane', { back: true }); sc.innerHTML = viewData(); bindData(); }
  else if (v && v.k === 'bliscy') { topbar('center', 'Pełnomocnictwa', { back: true }); sc.innerHTML = viewPeople(); bindPeople(); }
  else if (S.tab === 'start') { topbar('home'); sc.innerHTML = viewStart(); bindStart(); }
  else if (S.tab === 'dokumenty') { topbar('logo'); sc.innerHTML = viewDocs(); bindDocs(); }
  else if (S.tab === 'uslugi') { topbar('center', 'Usługi', { right: `<button class="iconbtn" id="editBtn" aria-label="Edytuj">${I.edit}</button>` }); sc.innerHTML = viewServices(); bindCommon(sc); }
  else if (S.tab === 'qr') { topbar('center', 'Kod QR'); sc.innerHTML = viewQr(); bindQr(); }
  else if (S.tab === 'wiecej') { topbar('center', 'Więcej'); sc.innerHTML = viewMore(); bindMore(); }
  sc.scrollTop = 0;
}

function bindCommon(root) {
  root.querySelectorAll('[data-run]').forEach(b => b.onclick = () => startCase(b.dataset.run));
  root.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => goLink(b.dataset.goto));
  root.querySelectorAll('[data-doc]').forEach(b => b.onclick = () => openTab('dokumenty', { k: 'doc', id: b.dataset.doc }));
  root.querySelectorAll('[data-trace]').forEach(b => b.onclick = () => openTab('wiecej', { k: 'trace', id: b.dataset.trace, from: S.view && S.view.k === 'dane' ? S.view : null }));
  root.querySelectorAll('[data-event]').forEach(b => b.onclick = () => openTab(S.tab, { k: 'event', id: b.dataset.event }));
  root.querySelectorAll('[data-svc]').forEach(b => b.onclick = () => openTab(S.tab, { k: 'svc', id: b.dataset.svc }));
}

const statusCls = s => ({ 'zakończona': 'ok', 'anulowana': 'red', 'w toku': 'warn', 'odłożona': '', 'zaplanowana': 'navy' }[s] || '');
function threadRow(t) {
  return `<button class="lrow" data-trace="${t.id}"><span class="li">${I.trace}</span><span class="lt"><b>${esc(t.title)}</b><small>${t.id} · ${t.started} · ${kroki(t.events.length)}</small></span><span class="status ${statusCls(t.status)}"><i></i>${t.status}</span></button>`;
}

// ---------- data for screens ----------
const me = D.me;
const DOCS = {
  dowod: { name: 'mDowód', color: '#dc143c', icon: I.id, share: true,
    rows: [['Imię i nazwisko', me.first + ' ' + me.last], ['PESEL', me.pesel], ['Data urodzenia', me.born], ['Numer', me.idNo], ['Ważny do', me.idValid]] },
  kdr: { name: 'Karta Dużej Rodziny', color: '#13806d', icon: I.users, share: false,
    rows: [['Imię i nazwisko', me.first + ' ' + me.last], ['Numer karty', '2024/118 554'], ['Ważna', 'bezterminowo']] },
  prawojazdy: { name: 'mPrawo jazdy', color: '#4b3bb4', icon: I.car, share: true,
    rows: [['Kategorie', me.dl.cat], ['Numer blankietu', me.dl.no], ['Ważne do', me.dl.valid], ['Punkty karne', String(me.dl.points)]] },
  pojazd: { name: 'Moje pojazdy', color: '#e8761a', icon: I.car, share: false,
    rows: [['Pojazd', me.car.name], ['Rejestracja', me.car.plate], ['VIN', me.car.vin], ['OC do', me.car.oc], ['Badanie do', me.car.inspection]] }
};
// Existing services from the current app, shown as they are today.
const SERVICES = {
  punkty: { label: 'Punkty karne', color: '#0b4a96', icon: I.police, lead: 'Sprawdź, ile masz punktów karnych i kiedy wygasną.', kind: 'points' },
  autobus: { label: 'Bezpieczny autobus', color: '#43a047', icon: I.bus, lead: 'Znajdziesz tu najważniejsze informacje o pojeździe, na przykład czy ma ważne badania techniczne i polisę OC.', kind: 'plate', cta: 'Dalej' },
  srodowisko: { label: 'Naruszenie środowiskowe', color: '#2e6b3a', icon: I.tree, title: 'Zgłoś zdarzenie, które może źle wpłynąć na środowisko', kind: 'steps', cta: 'Zgłoś naruszenie',
    steps: [[I.qr, 'Wybierz rodzaj naruszenia'], [I.edit, 'Opisz naruszenie'], [I.eye, 'Dodaj zdjęcie'], [I.home, 'Wskaż miejsce naruszenia'], [I.user, 'Wpisz swoje dane'], [I.send, 'Wyślij zgłoszenie']] },
  granica: { label: 'Polak za granicą', color: '#ef7d1a', icon: I.plane, lead: 'Sprawdź informacje o kraju, do którego jedziesz, i zgłoś swoją podróż.', kind: 'info', cta: 'Zgłoś podróż' },
  prad: { label: 'Dodatek elektryczny', color: '#1e7ae0', icon: I.plug, lead: 'Złóż wniosek o dodatek elektryczny i sprawdź jego status.', kind: 'info', cta: 'Złóż wniosek' },
  bilkom: { label: 'Bilkom', color: '#d0457f', icon: I.train, lead: 'Kup bilet kolejowy i trzymaj go w aplikacji.', kind: 'info', cta: 'Kup bilet' }
};

// ---------- start ----------
function viewStart() {
  const todo = [];
  if (!S.carSold) todo.push(`<div class="pay"><span class="status red"><i></i>Kończy się 29.10</span><b>OC Toyoty Corolla PO 4R521</b>
    <p>Ubezpieczyciel wznowi polisę sam. Sprawdź, czy tego chcesz.</p><button class="btn" data-run="oc">Sprawdź z asystentem</button></div>`);
  todo.push(`<div class="pay"><span class="status trust"><i></i>W imieniu mamy</span><b>2 recepty Haliny Nowak do wykupu</b>
    <p>Atorwastatyna 20 mg i Metformina 500 mg</p><button class="btn" data-run="mama">Wykup z asystentem</button></div>`);
  return `<div class="sh" style="margin-top:6px"><h2>Dokumenty</h2><div class="pillrow"><button class="pillbtn" id="addDoc">Dodaj</button><button class="pillbtn" data-goto="dokumenty">Wszystkie</button></div></div>
    <div class="bigdocs">${S.docOrder.map(k => { const d = DOCS[k]; return `<button class="bigdoc" data-doc="${k}"><div class="dtop wave-${k}" style="position:relative"><span class="dbadge" style="background:${d.color}">${d.icon}</span></div><div class="dbot"><b>${esc(d.name)}</b>${I.chev}</div></button>`; }).join('')}</div>
    <div class="sh"><h2>Usługi</h2><button class="pillbtn" data-goto="uslugi">Wszystkie</button></div>
    <div class="grid3">${Object.entries(SERVICES).map(([k, s]) => `<button class="svc" data-svc="${k}"><span class="tile" style="color:${s.color}">${s.icon}</span>${esc(s.label)}</button>`).join('')}</div>
    <div class="sh"><h2>Sprawy życiowe<span class="newtag">Nowe</span></h2></div>
    <div class="grid3">${Object.entries(EVENTS).map(([k, e]) => `<button class="svc" data-event="${k}"><span class="tile" style="color:${e.color}">${e.icon}</span>${esc(e.label)}</button>`).join('')}</div>
    <div class="sh"><h2>Do załatwienia<span class="newtag">Nowe</span></h2></div>${todo.join('')}
    ${S.threads.length ? `<div class="sh"><h2>Ostatnie sprawy</h2><button class="pillbtn" data-goto="sprawy">Wszystkie</button></div>${S.threads.slice(0, 3).map(threadRow).join('')}` : ''}
    <div class="askbar"><button id="askBox"><span class="sp">${I.spark}</span><span class="q">Zapytaj asystenta, co chcesz załatwić</span><span class="mic">${I.mic}</span></button></div>`;
}
function bindStart() {
  const sc = $('#screen'); bindCommon(sc);
  $('#askBox').onclick = e => {
    if (e.target.closest('.mic')) return voice();
    openTab('start', { k: 'chat' }); setTimeout(() => $('#ask').focus(), 50);
  };
  $('#addDoc').onclick = addDocument;
}

function viewEvent(id) {
  const e = EVENTS[id];
  return `<div class="hero-ic" style="background:${e.color}">${e.icon}</div>
    <h2 class="stitle">${esc(e.title)}</h2><p class="slead">${esc(e.lead)}</p>
    <ul class="steps">${e.steps.map(s => `<li><span style="color:${e.color};display:grid">${s[0]}</span>${esc(s[1])}</li>`).join('')}</ul>
    <div class="cta"><button class="btn" data-run="${id}">${esc(e.cta)}</button></div>`;
}

// ---------- existing services ----------
function viewServices() {
  const row = (attr, color, icon, label) => `<button class="lrow" ${attr}><span class="li" style="color:${color}">${icon}</span><span class="lt"><b>${esc(label)}</b></span>${I.chev}</button>`;
  return `
    ${row('data-goto="asystent"', '#0b4a96', I.spark, 'Asystent')}
    <div class="secl">Sprawy życiowe</div>
    ${Object.entries(EVENTS).map(([k, e]) => row(`data-event="${k}"`, e.color, e.icon, e.label)).join('')}
    <div class="secl">Usługi</div>
    ${Object.entries(SERVICES).map(([k, s]) => row(`data-svc="${k}"`, s.color, s.icon, s.label)).join('')}`;
}
function viewService(id) {
  const s = SERVICES[id];
  let body = '';
  if (s.kind === 'plate') body = `<div class="card mt" style="margin-top:22px"><label style="font-size:14px;font-weight:600">Numer rejestracyjny</label>
      <input id="plate" placeholder="Wpisz numer" style="width:100%;margin-top:8px;border:1.5px solid #cfd5df;border-radius:10px;padding:12px 14px;font-size:15px;outline:none"></div>
      <div id="plateOut"></div>`;
  else if (s.kind === 'steps') body = `<ul class="steps">${s.steps.map(x => `<li><span style="color:${s.color};display:grid">${x[0]}</span>${esc(x[1])}</li>`).join('')}</ul>`;
  else if (s.kind === 'points') body = `<div class="pay mt" style="margin-top:22px;text-align:center"><span class="status ok"><i></i>Stan na 23.10.2026</span>
      <b style="font-size:44px;margin-top:10px">${me.dl.points}</b><p>punkty karne z 24 możliwych</p><p class="muted mt">Najbliższe 2 punkty wygasną 12.03.2027.</p></div>`;
  return `<div class="hero-ic" style="background:${s.color}">${s.icon}</div>
    <h2 class="stitle">${esc(s.title || s.label)}</h2>${s.lead ? `<p class="slead">${esc(s.lead)}</p>` : ''}${body}
    ${s.cta ? `<div class="cta"><button class="btn" id="svcGo">${esc(s.cta)}</button></div>` : ''}`;
}
function bindService(id) {
  const b = $('#svcGo'); if (!b) return;
  b.onclick = () => {
    if (id === 'autobus') {
      const p = ($('#plate').value || '').trim().toUpperCase();
      if (!p) { $('#plateOut').innerHTML = '<p class="muted mt" style="color:var(--red)">Wpisz numer rejestracyjny.</p>'; return; }
      $('#plateOut').innerHTML = `<div class="pay mt"><span class="status ok"><i></i>Można jechać</span><b>Autobus ${esc(p)}</b>
        <p class="meta">Badanie techniczne: <strong>ważne do 14.02.2027</strong><br>Polisa OC: <strong>ważna do 30.06.2027</strong></p></div>`;
      return;
    }
    toast('Ta usługa działa jak w obecnej aplikacji. Prototyp pokazuje nowe funkcje.');
  };
}

// ---------- documents ----------
function viewDocs() {
  return `<h1 class="ptitle" style="margin-bottom:4px">Dokumenty</h1>
    <div class="linkbtns"><button id="customize">Dostosuj</button><button id="addDoc2">Dodaj</button></div>
    <div class="wallet">${S.docOrder.map(k => { const d = DOCS[k]; return `<button class="wcard w-${k}" data-doc="${k}"><b>${esc(d.name)}</b><span class="wb">${d.icon}</span>
      <span class="wsub">${k === 'pojazd' ? esc(S.carSold ? 'Toyota Corolla, zgłoszono zbycie' : me.car.name + ', ' + me.car.plate) : esc(me.first + ' ' + me.last)}</span></button>`; }).join('')}</div>`;
}
function bindDocs() {
  bindCommon($('#screen'));
  $('#customize').onclick = customizeDocs;
  $('#addDoc2').onclick = addDocument;
}
function viewDoc(id) {
  const d = DOCS[id];
  let top;
  if (id === 'dowod') top = `<div class="idtop"><div class="idleft"><div class="photo"></div><div class="flag"></div></div><div class="fields">
      <div><b>${esc(me.first)}</b><span>Imię (imiona)</span></div><div><b>${esc(me.last)}</b><span>Nazwisko</span></div>
      <div><b>Polskie</b><span>Obywatelstwo</span></div><div><b>${esc(me.born)}</b><span>Data urodzenia</span></div><div><b>${esc(me.pesel)}</b><span>Numer PESEL</span></div></div></div>`;
  else if (id === 'prawojazdy') top = `<div class="idtop pj"><div class="photo"></div><div class="fields">
      <div><b>${esc(me.first + ' ' + me.last)}</b><span>Imię i nazwisko</span></div><div><b>${esc(me.dl.cat)}</b><span>Kategorie</span></div>
      <div><b>${esc(me.dl.valid)}</b><span>Ważne do</span></div><div><b>${me.dl.points} pkt</b><span>Punkty karne</span></div></div></div>`;
  else if (id === 'kdr') top = `<div class="idtop" style="background:repeating-radial-gradient(ellipse at 100% 100%,rgba(255,255,255,.6) 0 1px,transparent 1.5px 9px),linear-gradient(160deg,#e2f6f0,#b9e6d9)"><div class="photo"></div><div class="fields">
      <div><b>${esc(me.first + ' ' + me.last)}</b><span>Imię i nazwisko</span></div><div><b>2024/118 554</b><span>Numer karty</span></div><div><b>Bezterminowo</b><span>Ważna</span></div></div></div>`;
  else if (id !== 'pojazd') top = `<div class="idtop"><div class="photo"></div><div class="fields">${d.rows.slice(0, 4).map(r => `<div><b>${esc(r[1])}</b><span>${esc(r[0])}</span></div>`).join('')}</div></div>`;
  else top = `<div class="idtop car"><div class="fields">
      <div><b>${esc(me.car.name)}</b><span>Pojazd</span></div><div><b>${esc(me.car.plate)}</b><span>Numer rejestracyjny</span></div>
      <div><b>${esc(me.car.oc)}</b><span>OC ważne do</span></div><div><b>${esc(me.car.inspection)}</b><span>Badanie techniczne do</span></div></div></div>`;
  const valid = id === 'pojazd' && S.carSold
    ? `<div class="valid" style="color:var(--warn)"><span class="vc" style="border-color:var(--warn)">${I.info}</span>Zgłoszono zbycie 23.10.2026</div>`
    : `<div class="valid"><span class="vc">${I.check}</span>Dokument ważny</div>`;
  return `<p class="muted center" style="margin:2px 0 10px">Czas: ${now()}:07 23.10.2026</p>
    <div class="idcard">${top}${valid}</div><div class="mt"></div>
    ${d.share ? `<button class="lrow" id="shareBtn"><span class="li">${I.scan}</span><span class="lt"><b>Potwierdź swoje dane</b><small>Pokaż tylko to, co trzeba, np. „mam 18 lat”</small></span>${I.chev}</button>` : ''}
    <button class="lrow" id="detailsBtn"><span class="li">${I.id}</span><span class="lt"><b>Dane dokumentu</b></span>${I.chev}</button>
    <button class="lrow" data-goto="dane-log"><span class="li">${I.eye}</span><span class="lt"><b>Kto czytał ten dokument</b><small>Nowość: dziennik odczytów z rejestrów</small></span>${I.chev}</button>`;
}
const SHARE = {
  dowod: [['Tylko: mam ukończone 18 lat', 'np. zakup w sklepie. Bez imienia, PESEL-u i daty urodzenia.', ['Pełnoletność: tak', 'Zdjęcie']],
          ['Imię, nazwisko i zdjęcie', 'np. odbiór przesyłki, hotel', ['Imię i nazwisko', 'Zdjęcie']],
          ['Pełne dane dowodu', 'np. notariusz, umowa najmu', ['Imię i nazwisko', 'PESEL', 'Data urodzenia', 'Numer dowodu', 'Zdjęcie']]],
  prawojazdy: [['Uprawnienia do prowadzenia', 'np. wypożyczalnia, kontrola', ['Imię i nazwisko', 'Kategorie', 'Ważność', 'Zdjęcie']],
               ['Pełne dane z punktami karnymi', 'np. pracodawca zatrudniający kierowców', ['Imię i nazwisko', 'Kategorie', 'Ważność', 'Punkty karne', 'Zdjęcie']]]
};
function shareFlow(id) {
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
}
function bindDoc(id) {
  bindCommon($('#screen'));
  $('#detailsBtn').onclick = () => sheet(`<h3>Dane dokumentu</h3><div class="mt"><dl class="kv">${DOCS[id].rows.map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl></div>
    <button class="btn outline mt" onclick="closeSheet()">Zamknij</button>`);
  const b = $('#shareBtn'); if (b) b.onclick = () => shareFlow(id);
}
function showQr(o) {
  let left = 120;
  sheet(`<h3 class="center">Pokaż ten kod</h3>${qrSvg(o[0] + now())}
    <div class="timer" id="qrT">Kod wygaśnie za 2:00</div>
    <div class="card mt" style="box-shadow:none;background:var(--bg)"><b style="font-size:14px">Odbiorca zobaczy:</b><div class="scope">${o[2].map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div></div>
    <p class="muted mt">Kto zeskanuje kod, trafi do dziennika w Moich danych.</p><button class="btn outline mt" id="qrClose">Zamknij</button>`);
  const t = setInterval(() => {
    left--; const el = $('#qrT');
    if (!el || left <= 0) { clearInterval(t); if (el) el.textContent = 'Kod wygasł'; return; }
    el.textContent = `Kod wygaśnie za ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  }, 1000);
  $('#qrClose').onclick = () => { clearInterval(t); closeSheet(); };
}

// ---------- QR tab ----------
function viewQr() {
  return `<div class="viewfinder"><i></i><i></i><i></i><i></i><span>Skieruj aparat na kod QR</span></div>
    <button class="btn mt" id="scanBtn">${I.scan}Skanuj kod QR</button>
    <div class="secl">Pokaż swój kod</div>
    <div class="lgroup">
      <button class="lrow" id="qrId"><span class="li">${I.id}</span><span class="lt"><b>Potwierdź swoje dane</b><small>Wybierz, co dokładnie zobaczy druga osoba</small></span>${I.chev}</button>
      <button class="lrow" id="qrDl"><span class="li">${I.car}</span><span class="lt"><b>Uprawnienia do prowadzenia</b><small>Dla wypożyczalni albo przy kontroli</small></span>${I.chev}</button>
    </div>`;
}
function bindQr() {
  $('#scanBtn').onclick = scanFlow;
  $('#qrId').onclick = () => shareFlow('dowod');
  $('#qrDl').onclick = () => shareFlow('prawojazdy');
}

// ---------- More tab ----------
function viewMore() {
  const active = S.consents.filter(c => !c.used && !c.revoked).length;
  const r = (id, color, icon, title, sub) => `<button class="lrow" id="${id}"><span class="li" style="color:${color}">${icon}</span><span class="lt"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>${I.chev}</button>`;
  return `<div class="pay" style="display:flex;gap:14px;align-items:center"><span class="avatar" style="width:52px;height:52px;font-size:17px">AN</span><div><b style="margin:0">${esc(me.first + ' ' + me.last)}</b><p style="margin-top:2px">PESEL ${esc(me.pesel)}</p></div></div>
    <div class="secl">Twoje dane i bezpieczeństwo<span class="newtag">Nowe</span></div>
    <div class="lgroup">
      ${r('mData', '#0b4a96', I.shield, 'Moje dane', `${active} ${plural(active, 'aktywna zgoda', 'aktywne zgody', 'aktywnych zgód')}, dziennik odczytów`)}
      ${r('mTrace', '#5a45c8', I.trace, 'Ślady spraw', `${S.threads.length} ${plural(S.threads.length, 'sprawa', 'sprawy', 'spraw')} z asystentem`)}
      ${r('mRules', '#5a45c8', I.lock, 'Granice asystenta', 'Czego asystent nigdy nie zrobi bez Ciebie')}
      ${r('mPeople', '#2e8b3e', I.users, 'Pełnomocnictwa', 'Mama, syn i osoby, które działają w Twoim imieniu')}
    </div>
    <div class="secl">Aplikacja</div>
    <div class="lgroup">
      ${r('mSet', '#4b5563', I.gear, 'Ustawienia')}
      ${r('mHelp', '#4b5563', I.help, 'Pomoc')}
      ${r('mAbout', '#dc143c', I.info, 'O koncepcji', 'mObywatel Challenge')}
      ${r('mIntro', '#4b5563', I.spark, 'Pokaż wprowadzenie')}
    </div>`;
}
function bindMore() {
  $('#mData').onclick = () => { S.dataTab = 'zgody'; openView({ k: 'dane' }); };
  $('#mTrace').onclick = () => { S.dataTab = 'sprawy'; openView({ k: 'dane' }); };
  $('#mRules').onclick = () => openView({ k: 'rules' });
  $('#mPeople').onclick = () => openView({ k: 'bliscy' });
  $('#mSet').onclick = () => openView({ k: 'settings' });
  $('#mHelp').onclick = () => openView({ k: 'help' });
  $('#mAbout').onclick = showAbout;
  $('#mIntro').onclick = () => onboarding(true);
}

// ---------- assistant ----------
function renderChat() {
  const sc = $('#screen');
  if (!chatEl.children.length) {
    sc.innerHTML = `<div class="hero-ic soft" style="width:96px;height:96px;margin-top:10px">${I.spark}</div>
      <h2 class="stitle">W czym pomóc, Anno?</h2>
      <p class="slead">Rejestry sprawdzam sama. Wszystko, co coś zmienia, potwierdzasz podpisem na karcie.</p>
      <div style="margin-top:20px">${STARTERS.map(s => `<button class="lrow" data-start="${s[0]}"><span class="li" style="color:${STARTER_COLOR[s[0]]}">${STARTER_ICON[s[0]]}</span><span class="lt"><b>${esc(s[1])}</b></span>${I.chev}</button>`).join('')}</div>
      <p class="muted center" style="margin:6px 6px 0">W prototypie asystent działa na przygotowanych scenariuszach. Możesz też wpisać własne pytanie.</p>`;
    sc.querySelectorAll('[data-start]').forEach(b => b.onclick = () => { if (!S.busy) { sc.replaceChildren(chatEl); play(b.dataset.start); } });
    return;
  }
  sc.replaceChildren(chatEl);
  sc.scrollTop = sc.scrollHeight;
}

// ---------- my data ----------
function viewData() {
  const seg = `<div class="seg"><button data-seg="zgody" class="${S.dataTab === 'zgody' ? 'on' : ''}">Zgody</button><button data-seg="log" class="${S.dataTab === 'log' ? 'on' : ''}">Kto czytał</button><button data-seg="sprawy" class="${S.dataTab === 'sprawy' ? 'on' : ''}">Ślady spraw</button></div>`;
  let body = '';
  if (S.dataTab === 'zgody') {
    body = S.consents.map(c => {
      const st = c.revoked ? '<span class="status red"><i></i>Cofnięta</span>' : c.used ? '<span class="status"><i></i>Wykorzystana</span>' : '<span class="status ok"><i></i>Aktywna</span>';
      return `<div class="pay consent ${c.revoked ? 'revoked' : ''}">${st}<b>${esc(c.who)}</b><p class="what">${esc(c.what)}</p>
        <p class="meta">${esc(c.why)}<br>Ważna: <strong>${esc(c.revoked ? 'cofnięta dziś, ' + c.revoked : c.until)}</strong></p>
        ${!c.used && !c.revoked ? `<button class="btn danger" data-rev="${c.id}">Cofnij zgodę</button>` : ''}</div>`;
    }).join('');
  } else if (S.dataTab === 'log') {
    const ic = { me: I.user, office: I.office, police: I.police, company: I.bank };
    body = `<p class="muted" style="margin:0 4px 12px">Każdy odczyt Twoich danych z rejestrów, z podstawą prawną. Dziennik prowadzą rejestry, nie aplikacja.</p>
      ${S.access.map(a => `<div class="lrow" style="align-items:flex-start"><span class="li">${ic[a.kind]}</span><span class="lt"><b>${esc(a.who)}</b><small>${esc(a.what)}</small><small>${esc(a.when)} · ${esc(a.basis)}</small></span></div>`).join('')}
      <button class="btn outline mt" id="notMe">To nie byłam ja? Zgłoś odczyt</button>`;
  } else {
    body = `<p class="muted" style="margin:0 4px 12px">Każda sprawa z asystentem zostawia ślad: od Twojej prośby, przez każdy odczyt i regułę, do decyzji urzędu.</p>`
      + (S.threads.length ? S.threads.map(threadRow).join('') : `<div class="card center"><p class="muted">Jeszcze nic tu nie ma. Załatw coś z asystentem.</p><button class="btn mt" data-run="sprzedaz">Sprzedaję auto</button></div>`);
  }
  return `${seg}${body}`;
}
function bindData() {
  const sc = $('#screen'); bindCommon(sc);
  sc.querySelectorAll('[data-seg]').forEach(b => b.onclick = () => { S.dataTab = b.dataset.seg; render(); });
  sc.querySelectorAll('[data-rev]').forEach(b => b.onclick = () => {
    const c = S.consents.find(x => x.id === b.dataset.rev);
    sheet(`<h3>Cofnąć zgodę?</h3><p class="sub"><b>${esc(c.who)}</b> straci dostęp do: ${esc(c.what.toLowerCase())}.</p>
      <div class="rule">${I.lock}<span>Cofnięcie nie wymaga podpisu. Łatwiej zabrać niż dać.</span></div>
      <button class="btn mt" id="revOk" style="background:var(--red)">Cofnij zgodę</button><button class="btn outline mt" id="revNo">Zostaw</button>`);
    $('#revNo').onclick = closeSheet;
    $('#revOk').onclick = () => { c.revoked = now(); closeSheet(); render(); toast(`Zgoda cofnięta o ${now()}. ${c.who} nie ma już dostępu.`); };
  });
  const nm = $('#notMe'); if (nm) nm.onclick = reportRead;
}

function viewTrace(id) {
  const t = S.threads.find(x => x.id === id);
  if (!t) return '<p class="muted">Nie ma takiej sprawy.</p>';
  return `<div class="pay"><span class="status ${statusCls(t.status)}"><i></i>${t.status}</span><b>${esc(t.title)}</b>
      <p>Sprawa ${t.id} · rozpoczęta ${t.started} · ${kroki(t.events.length)}</p></div>
    <div class="tl">${t.events.map(e => `<div class="ev ${e.kind}"><div class="eh"><b>${KIND[e.kind]}</b><span>#${e.n}${e.parent ? ' ← #' + e.parent : ''} · ${e.t}</span></div><p>${esc(e.text)}</p><div class="who">${esc(e.who)}</div></div>`).join('')}</div>
    <p class="muted" style="margin:4px 4px 0">Każdy krok ma numer sprawy i poprzedniego kroku, więc da się odtworzyć cały łańcuch od prośby do skutku. Asystent nie może niczego z tej listy usunąć.</p>`;
}

function viewRules() {
  return `<div class="hero-ic soft" style="width:96px;height:96px">${I.lock}</div>
    <h2 class="stitle">Tego nie zmieni żadna rozmowa</h2>
    <p class="slead">Zasady z kłódką są zapisane w kodzie aplikacji i sprawdza je serwer. Asystent ich nie zmieni, nawet gdy ktoś go o to poprosi w rozmowie, SMS-ie czy mailu.</p>
    <div class="sh"><h2>Zawsze, bez wyjątków</h2></div>
    ${S.rules.map(r => r.locked ? `<div class="lrow"><span class="lt"><b>${esc(r.t)}</b><small>${esc(r.d)}</small></span><span class="lock">${I.lock}w kodzie</span></div>` : '').join('')}
    <div class="sh"><h2>Twoje ustawienia</h2></div>
    ${S.rules.map((r, i) => !r.locked ? `<button class="lrow" data-rule="${i}"><span class="lt"><b>${esc(r.t)}</b><small>${esc(r.d)}</small></span><span class="switch ${r.on ? 'on' : ''}"></span></button>` : '').join('')}`;
}
function bindRules() {
  document.querySelectorAll('[data-rule]').forEach(b => b.onclick = () => { const r = S.rules[+b.dataset.rule]; r.on = !r.on; render(); toast(r.t + ': ' + (r.on ? 'włączone' : 'wyłączone')); });
}

// ---------- people ----------
function viewPeople() {
  const card = (p, mine) => `<${mine ? 'button' : 'div'} class="pay" style="display:block;width:100%;text-align:left" ${mine ? `data-person="${p.id}"` : ''}>
    <div class="person"><div class="face" style="background:${p.color}">${p.initials}</div><div style="flex:1"><b style="margin:0">${esc(p.name)}</b><div class="muted">${esc(p.rel)}</div></div>${mine ? I.chev : ''}</div>
    <div class="scope">${p.scope.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>
    <div class="pfoot"><span>Ważne: ${esc(p.until)}</span>${p.pending ? '<span class="status warn"><i></i>Czeka na podpis</span>' : mine && p.log[0] ? `<span>Ostatnio ${esc(p.log[0].when)}</span>` : ''}</div></${mine ? 'button' : 'div'}>`;
  return `<div class="sh" style="margin-top:4px"><h2>Działasz w ich imieniu</h2></div>${S.forOthers.map(p => card(p, true)).join('')}
    <p class="muted" style="margin:-2px 4px 6px">Każdy Twój krok w ich sprawach widzą od razu w swoich aplikacjach.</p>
    <div class="sh"><h2>Działają w Twoim imieniu</h2></div>${D.forMe.map(p => card(p, false)).join('')}
    <button class="btn outline mt" id="addDel">${I.plus}Dodaj pełnomocnictwo</button>`;
}
function bindPeople() {
  const sc = $('#screen');
  sc.querySelectorAll('[data-person]').forEach(b => b.onclick = () => openView({ k: 'person', id: b.dataset.person, from: { k: 'bliscy' } }));
  $('#addDel').onclick = addDelegation;
}
function viewPerson(id) {
  const p = S.forOthers.find(x => x.id === id);
  const first = p.name.split(' ')[0];
  return `<div class="pay"><div class="person"><div class="face" style="background:${p.color}">${p.initials}</div><div><b style="margin:0">${esc(p.name)}</b><div class="muted">${esc(p.rel)}</div></div></div>
      <div class="scope">${p.scope.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div><div class="pfoot"><span>Ważne: ${esc(p.until)}</span></div></div>
    <div class="sh"><h2>Co zrobiłaś w imieniu tej osoby</h2></div>
    ${p.log.map(l => `<div class="lrow"><span class="li" style="color:var(--ok)">${I.done}</span><span class="lt"><b>${esc(l.what)}</b><small>${esc(l.when)} · ${esc(first)} dostała powiadomienie</small></span></div>`).join('')}
    <p class="muted" style="margin:4px 4px 0">Tę samą listę widzi ${esc(first)} w swojej aplikacji. Nie da się z niej niczego usunąć.</p>
    ${id === 'mama' ? `<button class="btn mt" data-run="mama">Wykup recepty mamy</button>` : ''}
    <button class="btn outline mt" id="endDel">Zakończ pełnomocnictwo</button>`;
}
function bindPerson(id) {
  $('#endDel').onclick = () => endDelegation(id);
}

// ---------- onboarding (same pattern as the app's first run) ----------
const ONB = [
  ['Asystent, który pyta', 'Załatwia sprawy za Ciebie, ale każdą czynność podpisujesz sama, na karcie z dokładną treścią.',
    '<circle cx="130" cy="130" r="110" fill="#eaf1fc" stroke="none"/><rect x="88" y="52" width="84" height="150" rx="14" fill="#fff" stroke="#0b4a96"/><rect x="100" y="78" width="60" height="10" rx="5" fill="#dde8f8" stroke="none"/><rect x="100" y="96" width="44" height="10" rx="5" fill="#dde8f8" stroke="none"/><rect x="100" y="122" width="60" height="40" rx="8" fill="#fff" stroke="#0b4a96"/><path d="M110 142l8 8 14-16" stroke="#2e8b3e" stroke-width="3"/><circle cx="178" cy="70" r="22" fill="#0b4a96" stroke="none"/><path d="M178 58l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff" stroke="none"/>'],
  ['Twoje dane pod kontrolą', 'Widzisz, kto i po co czytał Twoje dane. Każdą zgodę cofasz jednym ruchem.',
    '<circle cx="130" cy="130" r="110" fill="#eaf1fc" stroke="none"/><path d="M130 50l58 22v44c0 38-25 60-58 70-33-10-58-32-58-70V72z" fill="#fff" stroke="#0b4a96" stroke-width="3"/><path d="M106 124l16 16 32-34" stroke="#2e8b3e" stroke-width="5"/><circle cx="190" cy="186" r="20" fill="#dc143c" stroke="none"/><path d="M182 186h16" stroke="#fff" stroke-width="3"/>'],
  ['Życie, nie urzędy', 'Sprzedaż auta, zgubiony portfel czy recepty mamy załatwisz w jednym miejscu.',
    '<circle cx="130" cy="130" r="110" fill="#eaf1fc" stroke="none"/><rect x="58" y="70" width="64" height="64" rx="16" fill="#fff" stroke="#e8761a"/><rect x="138" y="70" width="64" height="64" rx="16" fill="#fff" stroke="#d92d45"/><rect x="58" y="148" width="64" height="64" rx="16" fill="#fff" stroke="#2e8b3e"/><rect x="138" y="148" width="64" height="64" rx="16" fill="#fff" stroke="#0f957f"/><path d="M76 108v-10l5-11h18l5 11v10zM82 100h1M97 100h1" stroke="#e8761a"/><path d="M156 92h24a4 4 0 014 4v18a4 4 0 01-4 4h-24zM176 105h4" stroke="#d92d45"/><rect x="78" y="170" width="24" height="12" rx="6" transform="rotate(-35 90 176)" stroke="#2e8b3e"/><path d="M156 186l14-12 14 12M160 184v14h20v-14" stroke="#0f957f"/>']
];
function onboarding(force) {
  let seen = false;
  try { seen = localStorage.getItem('mob-onb') === '1'; } catch (e) { /* storage blocked: show it */ }
  if (seen && !force) return;
  let i = 0;
  const el = $('#onb');
  const close = () => { el.hidden = true; try { localStorage.setItem('mob-onb', '1'); } catch (e) { /* ignore */ } };
  const draw = () => {
    const [t, p, art] = ONB[i];
    el.innerHTML = `<div class="brand"><span class="logo-sq" style="width:30px;height:30px;font-size:16px">m</span>mObywatel</div>
      <div class="ill"><svg viewBox="0 0 260 260">${art}</svg></div>
      <h2>${esc(t)}</h2><p>${esc(p)}</p>
      <div class="dots">${ONB.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
      <button class="btn" id="onbNext">${i === ONB.length - 1 ? 'Zaczynamy' : 'Dalej'}</button><button class="btn outline" id="onbSkip">Pomiń</button>`;
    $('#onbNext').onclick = () => { if (i < ONB.length - 1) { i++; draw(); } else close(); };
    $('#onbSkip').onclick = close;
  };
  el.hidden = false;
  draw();
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
  $('#onb').hidden = true;
  if (b.dataset.run) return startCase(b.dataset.run);
  if (b.dataset.go === 'dane') return goLink('dane-log');
  if (b.dataset.go === 'dowod') return openTab('dokumenty', { k: 'doc', id: 'dowod' });
}
document.querySelectorAll('.tabbar button').forEach(b => b.onclick = () => openTab(b.dataset.tab));
document.querySelectorAll('#tryList button').forEach(b => b.onclick = () => sideAction(b));
$('#resetBtn').onclick = () => { try { localStorage.removeItem('mob-onb'); } catch (e) { /* ignore */ } location.reload(); };
$('#askSend').onclick = () => ask($('#ask').value);
$('#ask').addEventListener('keydown', e => { if (e.key === 'Enter') ask($('#ask').value); });
$('#clock').textContent = now();
// Start after uslugi.js has added its services and flows.
document.addEventListener('DOMContentLoaded', () => { openTab('start'); if (!FAST) onboarding(false); });
