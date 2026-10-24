'use strict';
// Working flows for the services and the remaining buttons of the app.
// Loaded after app.js and uses its helpers (I, esc, S, render, passkey, sheet, toast, tr, newThread).

// ---------- shared helpers ----------
const field = (label, inner) => `<label class="field"><span>${esc(label)}</span>${inner}</label>`;
const heroFor = (s, title) => `<div class="hero-ic" style="background:${s.color}">${s.icon}</div><h2 class="stitle">${esc(title || s.title || s.label)}</h2>`;
const ctaBtn = (label, id = 'svcGo', extra = '') => `<div class="cta"><button class="btn" id="${id}">${esc(label)}</button>${extra}</div>`;
const choiceList = (name, opts, cur) => opts.map((o, i) => `<button class="choice ${cur === i ? 'on' : ''}" data-${name}="${i}"><div class="radio"></div><div><b>${esc(o[0])}</b>${o[1] ? `<span>${esc(o[1])}</span>` : ''}</div></button>`).join('');
const checkList = (name, opts, on) => opts.map((o, i) => `<button class="check ${on[i] ? 'on' : ''}" data-${name}="${i}"><span class="box">${I.check}</span><span><b>${esc(o[0])}</b>${o[1] ? `<small>${esc(o[1])}</small>` : ''}</span></button>`).join('');
// Dates come from <input type=date> as YYYY-MM-DD; show them the Polish way.
const plDate = iso => (iso || '').split('-').reverse().join('.');
function stv() { return S.view.st || (S.view.st = {}); }
function go(patch) { Object.assign(stv(), patch); render(); }

// Every action that sends or pays is a signed, traced case, as everywhere else in the app.
function signed({ title, rows, rule, office, result, onDone }) {
  const body = rows.map(r => r[0] + '=' + r[1]).join('|');
  const code = 'CZ-' + fnv(title + body).slice(0, 4).toUpperCase() + '-' + fnv(body).slice(4, 8).toUpperCase();
  passkey(title, code, fnv(body) + fnv(code) + fnv(title), () => {
    newThread(title);
    tr('prosba', 'Ty', title);
    tr('propozycja', 'Formularz usługi', rows.map(r => r[0] + ': ' + r[1]).join(', '));
    tr('regula', 'Kod aplikacji', rule);
    S.min++; $('#clock').textContent = now();
    tr('podpis', 'Ty, klucz urządzenia', 'Podpisano ' + title + ' (' + code + ')');
    tr('wykonanie', office, result);
    S.cur.status = 'zakończona';
    onDone(code);
  });
}
function summary(rows, rule) {
  return `<div class="card mt" style="margin-top:20px"><dl class="kv">${rows.map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl></div>
    <div class="rule">${I.lock}<span>${esc(rule)}</span></div>`;
}
function success(title, text, extra = '') {
  return `<div class="hero-ic" style="background:var(--ok)">${I.check}</div><h2 class="stitle">${esc(title)}</h2><p class="slead">${esc(text)}</p>${extra}
    <div class="cta"><button class="btn outline" data-goto="sprawy">Zobacz ślad sprawy</button><button class="btn mt" id="svcHome">Wróć do usług</button></div>`;
}
function bindSuccess() {
  const h = $('#svcHome'); if (h) h.onclick = () => openTab('uslugi');
  bindCommon($('#screen'));
}

// ---------- service data ----------
Object.assign(SERVICES, {
  eplatnosci: { label: 'ePłatności', color: '#0b4a96', icon: I.money },
  erecepta: { label: 'eRecepta', color: '#2e8b3e', icon: I.pill },
  pesel: { label: 'Zastrzeż PESEL', color: '#d92d45', icon: I.lock }
});
const PAY = [
  { id: 'p1', title: 'Opłata za gospodarowanie odpadami komunalnymi', who: 'Urząd Miasta Poznania', amount: '122,13 zł', due: '31.10.2026', acct: '12 1020 0000 0000 0000 0001 2345', paid: null },
  { id: 'p2', title: 'Podatek od nieruchomości, IV rata', who: 'Urząd Miasta Poznania', amount: '214,00 zł', due: '15.11.2026', acct: '12 1020 0000 0000 0000 0001 2345', paid: null },
  { id: 'p3', title: 'Opłata za wydanie dowodu rejestracyjnego', who: 'Starostwo Powiatowe w Poznaniu', amount: '54,50 zł', due: '12.09.2026', acct: '', paid: '12.09.2026' }
];
const POINTS = [
  ['12.09.2026', 'Przekroczenie prędkości o 11 do 15 km/h', '+3', 'Poznań, ul. Garbary'],
  ['04.03.2025', 'Niezastosowanie się do znaku B-36', '+2', 'Poznań, ul. Półwiejska, wygasły']
];
const COUNTRIES = [
  ['Niemcy', 'Brak przeciwwskazań do podróży', 'ok', 'Bez wizy, dowód osobisty wystarczy', 'euro (EUR)'],
  ['Hiszpania', 'Brak przeciwwskazań do podróży', 'ok', 'Bez wizy, dowód osobisty wystarczy', 'euro (EUR)'],
  ['Egipt', 'Zachowaj szczególną ostrożność', 'warn', 'Wiza turystyczna, paszport ważny 6 miesięcy', 'funt egipski (EGP)'],
  ['Tajlandia', 'Zachowaj ostrożność', 'warn', 'Bez wizy do 30 dni, paszport', 'bat (THB)']
];
const TRAINS = [
  ['IC 1610', '07:05', '09:47', '2 h 42 min', '79,00 zł'],
  ['EIP 3510', '08:15', '10:41', '2 h 26 min', '149,00 zł'],
  ['TLK 18101', '10:22', '13:40', '3 h 18 min', '59,90 zł']
];

// ---------- flows ----------
const FLOWS = {
  punkty: {
    view: () => { const s = SERVICES.punkty; return `${heroFor(s)}<p class="slead">${esc(s.lead)}</p>
      <div class="pay mt center" style="margin-top:20px"><span class="status ok"><i></i>Stan na 23.10.2026</span><b style="font-size:46px;margin-top:8px">${me.dl.points}</b><p>punkty karne z 24 możliwych</p></div>
      <div class="sh"><h2>Historia</h2></div>
      ${POINTS.map(p => `<div class="lrow" style="align-items:flex-start"><span class="li" style="color:var(--navy)">${I.police}</span><span class="lt"><b>${esc(p[1])}</b><small>${esc(p[0])} · ${esc(p[3])}</small></span><span class="status ${p[3].includes('wygasły') ? '' : 'warn'}"><i></i>${esc(p[2])} pkt</span></div>`).join('')}
      <p class="muted" style="margin:6px 4px">Punkty wygasają po roku od opłacenia mandatu. Najbliższe 3 punkty wygasną 12.09.2027.</p>`; },
    bind: () => {}
  },
  autobus: {
    view: st => { const s = SERVICES.autobus; return `${heroFor(s)}<p class="slead">${esc(s.lead)}</p>
      <div class="card mt" style="margin-top:22px">${field('Numer rejestracyjny', `<input id="plate" placeholder="Wpisz numer" value="${esc(st.plate || '')}">`)}</div>
      ${st.err ? '<p class="err">Wpisz numer rejestracyjny.</p>' : ''}
      ${st.plate && !st.err ? `<div class="pay mt"><span class="status ok"><i></i>Można jechać</span><b>Autobus ${esc(st.plate)}</b>
        <p class="meta">Badanie techniczne: <strong>ważne do 14.02.2027</strong><br>Polisa OC: <strong>ważna do 30.06.2027</strong><br>Przewoźnik: <strong>Przykładowe Linie Sp. z o.o.</strong></p></div>` : ''}
      ${ctaBtn('Dalej')}`; },
    bind: () => { $('#svcGo').onclick = () => { const p = ($('#plate').value || '').trim().toUpperCase(); go(p ? { plate: p, err: false } : { err: true, plate: '' }); }; }
  },
  srodowisko: {
    view: st => {
      const s = SERVICES.srodowisko, step = st.step || 0;
      const types = [['Nielegalne wysypisko', 'Odpady porzucone w lesie, na łące, przy drodze'], ['Spalanie odpadów', 'Dym z palenia śmieci w piecu albo na działce'], ['Zanieczyszczenie wody', 'Ścieki, olej albo martwe ryby w rzece'], ['Wycinka drzew', 'Wycinka bez zezwolenia']];
      if (step === 0) return `${heroFor(s)}<ul class="steps">${s.steps.map(x => `<li><span style="color:${s.color};display:grid">${x[0]}</span>${esc(x[1])}</li>`).join('')}</ul>${ctaBtn(s.cta)}`;
      if (step === 1) return `<p class="stepno">Krok 1 z 3</p><h2 class="stitle" style="text-align:left">Wybierz rodzaj naruszenia</h2><div class="mt">${choiceList('type', types, st.type)}</div>${ctaBtn('Dalej')}`;
      if (step === 2) return `<p class="stepno">Krok 2 z 3</p><h2 class="stitle" style="text-align:left">Opisz naruszenie</h2>
        <div class="card mt">${field('Opis', `<textarea id="desc" rows="4" placeholder="Co widzisz i od kiedy?">${esc(st.desc || '')}</textarea>`)}
        <div class="field"><span>Zdjęcie</span>${st.photo ? '<div class="thumb"><span>zdjęcie_1.jpg</span></div>' : `<button class="btn outline small" id="addPhoto">${I.plus}Dodaj zdjęcie</button>`}</div>
        <div class="field"><span>Miejsce</span><div class="map"><i></i><b>Poznań, ul. Wiejska, przy garażach</b><small>z lokalizacji telefonu</small></div></div></div>
        ${st.err ? '<p class="err">Dodaj krótki opis.</p>' : ''}${ctaBtn('Dalej')}`;
      if (step === 3) return `<p class="stepno">Krok 3 z 3</p><h2 class="stitle" style="text-align:left">Sprawdź i wyślij</h2>
        ${summary([['Rodzaj', types[st.type][0]], ['Opis', st.desc], ['Zdjęcie', st.photo ? '1 plik' : 'brak'], ['Miejsce', 'Poznań, ul. Wiejska'], ['Zgłaszająca', me.first + ' ' + me.last]], 'Wysłanie zgłoszenia w Twoim imieniu wymaga podpisu.')}${ctaBtn('Podpisz i wyślij')}`;
      return success('Zgłoszenie wysłane', `Wojewódzki inspektorat ochrony środowiska przyjął zgłoszenie nr ${st.no}. Dostaniesz powiadomienie, gdy ktoś je sprawdzi.`);
    },
    bind: st => {
      const step = st.step || 0;
      if (step === 4) return bindSuccess();
      document.querySelectorAll('[data-type]').forEach(b => b.onclick = () => go({ type: +b.dataset.type }));
      const ph = $('#addPhoto'); if (ph) ph.onclick = () => go({ photo: true, desc: $('#desc').value });
      $('#svcGo').onclick = () => {
        if (step === 1 && st.type === undefined) return toast('Wybierz rodzaj naruszenia.');
        if (step === 2) { const d = $('#desc').value.trim(); if (!d) return go({ err: true }); return go({ desc: d, err: false, step: 3 }); }
        if (step === 3) return signed({ title: 'Zgłoszenie naruszenia środowiskowego', rows: [['Rodzaj', st.type], ['Opis', st.desc]], rule: 'Wysłanie zgłoszenia w Twoim imieniu wymaga podpisu.', office: 'Inspektorat ochrony środowiska', result: 'zgłoszenie przyjęte, nr WIOŚ/2026/4471', onDone: () => go({ step: 4, no: 'WIOŚ/2026/4471' }) });
        go({ step: step + 1 });
      };
    }
  },
  granica: {
    view: st => {
      const s = SERVICES.granica, step = st.step || 0;
      if (step === 0) return `${heroFor(s)}<p class="slead">${esc(s.lead)}</p><div class="sh"><h2>Dokąd jedziesz?</h2></div>${choiceList('country', COUNTRIES.map(c => [c[0], c[1]]), st.c)}${ctaBtn('Dalej')}`;
      const c = COUNTRIES[st.c];
      if (step === 1) return `<h2 class="stitle" style="text-align:left">${esc(c[0])}</h2>
        <div class="pay mt"><span class="status ${c[2]}"><i></i>${esc(c[1])}</span>
          <p class="meta">Dokumenty: <strong>${esc(c[3])}</strong><br>Waluta: <strong>${esc(c[4])}</strong><br>Ubezpieczenie: <strong>${c[2] === 'ok' ? 'karta EKUZ działa' : 'kup prywatne ubezpieczenie'}</strong></p></div>
        <div class="lrow"><span class="li">${I.info}</span><span class="lt"><b>Zgłoś podróż</b><small>Konsul skontaktuje się z Tobą w razie kryzysu, np. katastrofy albo zamieszek</small></span></div>${ctaBtn('Zgłoś podróż')}`;
      if (step === 2) return `<h2 class="stitle" style="text-align:left">Zgłoszenie podróży</h2>
        <div class="card mt">${field('Kraj', `<input value="${esc(c[0])}" disabled>`)}${field('Wyjazd', `<input type="date" id="d1" value="${st.d1 || '2026-11-14'}">`)}${field('Powrót', `<input type="date" id="d2" value="${st.d2 || '2026-11-21'}">`)}</div>
        <div class="sh"><h2>Kto jedzie?</h2></div>${checkList('who', [['Anna Nowak', 'Ty'], ['Kuba Nowak', 'Syn, 9 lat, władza rodzicielska']], st.who || [true, false])}${ctaBtn('Dalej')}`;
      if (step === 3) { const who = (st.who || [true, false]).map((v, i) => v ? ['Anna Nowak', 'Kuba Nowak'][i] : null).filter(Boolean).join(', ');
        return `<h2 class="stitle" style="text-align:left">Sprawdź zgłoszenie</h2>${summary([['Kraj', c[0]], ['Termin', plDate(st.d1) + ' do ' + plDate(st.d2)], ['Podróżni', who], ['Kontakt', 'telefon z mObywatela']], 'Przekazanie danych konsulowi wymaga Twojego podpisu.')}${ctaBtn('Podpisz i zgłoś')}`; }
      return success('Podróż zgłoszona', `Konsul w kraju ${c[0]} wie o Twoim pobycie od ${plDate(st.d1)} do ${plDate(st.d2)}. Zgłoszenie usunie się samo po powrocie.`);
    },
    bind: st => {
      const step = st.step || 0;
      if (step === 4) return bindSuccess();
      document.querySelectorAll('[data-country]').forEach(b => b.onclick = () => go({ c: +b.dataset.country }));
      document.querySelectorAll('[data-who]').forEach(b => b.onclick = () => { const w = (st.who || [true, false]).slice(); w[+b.dataset.who] = !w[+b.dataset.who]; go({ who: w, d1: $('#d1').value, d2: $('#d2').value }); });
      $('#svcGo').onclick = () => {
        if (step === 0 && st.c === undefined) return toast('Wybierz kraj.');
        if (step === 2) { if (!(st.who || [true, false]).some(Boolean)) return toast('Wybierz co najmniej jedną osobę.'); return go({ d1: $('#d1').value, d2: $('#d2').value, step: 3 }); }
        if (step === 3) return signed({ title: 'Zgłoszenie podróży: ' + COUNTRIES[st.c][0], rows: [['Kraj', COUNTRIES[st.c][0]], ['Termin', st.d1 + ' do ' + st.d2]], rule: 'Przekazanie danych konsulowi wymaga Twojego podpisu.', office: 'Konsulat RP', result: 'podróż zarejestrowana', onDone: () => go({ step: 4 }) });
        go({ step: step + 1 });
      };
    }
  },
  prad: {
    view: st => {
      const s = SERVICES.prad, step = st.step || 0;
      if (step === 0) return `${heroFor(s)}<p class="slead">${esc(s.lead)}</p>
        <div class="pay mt" style="margin-top:20px"><span class="status navy"><i></i>Sprawdziłam za Ciebie</span><b>Spełniasz warunki dodatku</b><p>Ogrzewasz dom pompą ciepła zgłoszoną w Centralnej Ewidencji Emisyjności Budynków.</p></div>${ctaBtn('Złóż wniosek')}`;
      if (step === 1) return `<h2 class="stitle" style="text-align:left">Wniosek o dodatek elektryczny</h2><p class="muted mt">Dane wzięłam z rejestrów. Sprawdź je, niczego nie musisz przepisywać.</p>
        ${summary([['Wnioskodawczyni', me.first + ' ' + me.last], ['PESEL', me.pesel], ['Adres', 'ul. Wiejska 12, 60-101 Poznań'], ['Źródło ogrzewania', 'pompa ciepła (CEEB)'], ['Punkt poboru energii', 'PL0037000012345678'], ['Konto do wypłaty', '•••• 4521 (z Twojego profilu)']], 'Wniosek trafi do urzędu dopiero po Twoim podpisie.')}
        ${checkList('ok', [['Oświadczam, że dane są prawdziwe', 'Wymagane do złożenia wniosku']], [!!st.ok])}${ctaBtn('Podpisz i złóż')}`;
      return success('Wniosek złożony', 'Urząd Miasta Poznania ma 30 dni na decyzję. Status sprawdzisz w Śladach spraw, a o decyzji dostaniesz powiadomienie.');
    },
    bind: st => {
      const step = st.step || 0;
      if (step === 2) return bindSuccess();
      document.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => go({ ok: !st.ok }));
      $('#svcGo').onclick = () => {
        if (step === 1) {
          if (!st.ok) return toast('Zaznacz oświadczenie.');
          return signed({ title: 'Wniosek o dodatek elektryczny', rows: [['PPE', 'PL0037000012345678'], ['Konto', '4521']], rule: 'Wniosek trafi do urzędu dopiero po Twoim podpisie.', office: 'Urząd Miasta Poznania', result: 'wniosek przyjęty, nr DE/2026/30114', onDone: () => go({ step: 2 }) });
        }
        go({ step: 1 });
      };
    }
  },
  bilkom: {
    view: st => {
      const s = SERVICES.bilkom, step = st.step || 0;
      if (step === 0) return `${heroFor(s)}<p class="slead">${esc(s.lead)}</p>
        <div class="card mt" style="margin-top:20px">${field('Skąd', `<input id="from" value="${esc(st.from || 'Poznań Główny')}">`)}${field('Dokąd', `<input id="to" value="${esc(st.to || 'Warszawa Centralna')}">`)}${field('Data', `<input type="date" id="date" value="${st.date || '2026-10-24'}">`)}</div>${ctaBtn('Szukaj połączeń')}`;
      if (step === 1) return `<h2 class="stitle" style="text-align:left">${esc(st.from)} → ${esc(st.to)}</h2><p class="muted mt">${esc(plDate(st.date))}</p><div class="mt"></div>
        ${TRAINS.map((t, i) => `<button class="train" data-train="${i}"><span class="tt"><b>${t[1]}</b><small>${t[0]}</small></span><span class="tline"><small>${t[3]}</small><i></i></span><span class="tt"><b>${t[2]}</b><small>bez przesiadek</small></span><span class="price">${t[4]}</span></button>`).join('')}`;
      const t = TRAINS[st.t];
      if (step === 2) return `<h2 class="stitle" style="text-align:left">Bilet ${esc(t[0])}</h2>
        ${summary([['Trasa', st.from + ' → ' + st.to], ['Odjazd', plDate(st.date) + ', ' + t[1]], ['Przyjazd', t[2]], ['Pasażer', me.first + ' ' + me.last + ', normalny'], ['Miejsce', 'wagon 7, miejsce 45, okno'], ['Cena', t[4]]], 'Płatność zawsze wymaga Twojego podpisu, każda kwota.')}${ctaBtn('Zapłać ' + t[4])}`;
      return `<div class="ticket"><div class="th"><b>${esc(t[0])}</b><span>${esc(plDate(st.date))}</span></div>
          <div class="tr"><div><b>${t[1]}</b><small>${esc(st.from)}</small></div><span>→</span><div style="text-align:right"><b>${t[2]}</b><small>${esc(st.to)}</small></div></div>
          ${qrSvg(t[0] + st.date)}<p class="muted center">Wagon 7, miejsce 45 · ${me.first} ${me.last}</p></div>
        <div class="cta"><button class="btn outline" data-goto="sprawy">Zobacz ślad sprawy</button><button class="btn mt" id="svcHome">Wróć do usług</button></div>`;
    },
    bind: st => {
      const step = st.step || 0;
      if (step === 3) return bindSuccess();
      document.querySelectorAll('[data-train]').forEach(b => b.onclick = () => go({ t: +b.dataset.train, step: 2 }));
      const g = $('#svcGo'); if (!g) return;
      g.onclick = () => {
        if (step === 0) { const f = $('#from').value.trim(), t = $('#to').value.trim(); if (!f || !t) return toast('Wpisz stację początkową i docelową.'); return go({ from: f, to: t, date: $('#date').value, step: 1 }); }
        if (step === 2) { const t = TRAINS[st.t]; return signed({ title: 'Zakup biletu ' + t[0], rows: [['Trasa', st.from + '-' + st.to], ['Cena', t[4]]], rule: 'Płatność zawsze wymaga Twojego podpisu, każda kwota.', office: 'Bilkom', result: 'bilet kupiony, wagon 7, miejsce 45', onDone: () => go({ step: 3 }) }); }
      };
    }
  },
  eplatnosci: {
    view: st => {
      if (st.pay) { const p = PAY.find(x => x.id === st.pay);
        if (st.done) return success('Zapłacono', `${p.amount} trafiło do: ${p.who}. Potwierdzenie jest w Historii.`);
        return `<h2 class="stitle" style="text-align:left">${esc(p.title)}</h2>${summary([['Odbiorca', p.who], ['Kwota', p.amount], ['Termin', p.due], ['Konto', p.acct], ['Płacisz z', 'karta •••• 4521']], 'Płatność zawsze wymaga Twojego podpisu, każda kwota.')}${ctaBtn('Zapłać ' + p.amount)}`; }
      const hist = !!st.hist;
      const list = PAY.filter(p => hist ? p.paid : !p.paid);
      return `<div class="seg two"><button data-h="0" class="${hist ? '' : 'on'}">Do zapłaty</button><button data-h="1" class="${hist ? 'on' : ''}">Historia</button></div>
        ${list.length ? list.map(p => `<div class="pay"><span class="status ${p.paid ? 'ok' : 'red'}"><i></i>${p.paid ? 'Zapłacono ' + p.paid : 'Do zapłaty'}</span><b>${esc(p.title)}</b><p class="meta">Kwota: <strong>${p.amount}</strong></p>${p.paid ? '' : `<button class="btn" data-pay="${p.id}">Zobacz szczegóły</button>`}</div>`).join('') : '<div class="card center"><p class="muted">Nie masz nic do zapłaty.</p></div>'}`;
    },
    bind: st => {
      if (st.done) return bindSuccess();
      document.querySelectorAll('[data-h]').forEach(b => b.onclick = () => go({ hist: b.dataset.h === '1' }));
      document.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => go({ pay: b.dataset.pay }));
      const g = $('#svcGo'); if (g) g.onclick = () => { const p = PAY.find(x => x.id === st.pay);
        signed({ title: 'Płatność: ' + p.title, rows: [['Kwota', p.amount], ['Odbiorca', p.who]], rule: 'Płatność zawsze wymaga Twojego podpisu, każda kwota.', office: p.who, result: 'wpłata zaksięgowana, ' + p.amount, onDone: () => { p.paid = '23.10.2026'; go({ done: true }); } }); };
    }
  },
  erecepta: {
    view: () => `${heroFor(SERVICES.erecepta)}
      <div class="sh"><h2>Twoje recepty</h2></div>
      <div class="pay"><span class="status ok"><i></i>Do wykupienia do 21.11.2026</span><b>Ibuprofen 400 mg, 30 tabletek</b><p class="meta">Kod: <strong>8814</strong> · lek. Ewa Zielińska</p></div>
      <div class="pay"><span class="status"><i></i>Wykupiona 02.10.2026</span><b>Amoksycylina 1000 mg</b><p class="meta">Apteka „Pod Lipą”</p></div>
      <div class="sh"><h2>Recepty bliskich</h2></div>
      <button class="lrow" data-run="mama"><span class="li" style="color:var(--trust)">${I.users}</span><span class="lt"><b>Halina Nowak (mama)</b><small>2 recepty do wykupu · pełnomocnictwo</small></span>${I.chev}</button>`,
    bind: () => bindCommon($('#screen'))
  },
  pesel: {
    view: st => {
      const on = !!S.peselLocked;
      return `${heroFor(SERVICES.pesel, 'Zastrzeżenie numeru PESEL')}
        <p class="slead">Zastrzeżony PESEL chroni Cię przed kredytem albo umową zawartą na Twoje dane. Bank i notariusz sprawdzą zastrzeżenie przed podpisaniem umowy.</p>
        <div class="pay mt center" style="margin-top:20px"><span class="status ${on ? 'ok' : 'red'}"><i></i>${on ? 'Zastrzeżony od ' + S.peselLocked : 'Niezastrzeżony'}</span><b>${esc(me.pesel)}</b></div>
        ${ctaBtn(on ? 'Cofnij zastrzeżenie' : 'Zastrzeż PESEL')}`;
    },
    bind: () => {
      $('#svcGo').onclick = () => {
        const on = !!S.peselLocked;
        signed({ title: on ? 'Cofnięcie zastrzeżenia PESEL' : 'Zastrzeżenie PESEL', rows: [['PESEL', me.pesel]], rule: 'Zmiana zastrzeżenia zawsze wymaga Twojego podpisu.', office: 'Rejestr Zastrzeżeń PESEL', result: on ? 'zastrzeżenie cofnięte' : 'PESEL zastrzeżony',
          onDone: () => { S.peselLocked = on ? null : now(); render(); toast(on ? 'Zastrzeżenie cofnięte.' : 'PESEL zastrzeżony. Banki widzą to od razu.'); } });
      };
    }
  }
};

// app.js renders services through these two hooks.
viewService = id => FLOWS[id].view(stv());
bindService = id => { bindCommon($('#screen')); FLOWS[id].bind(stv()); };

// ---------- notifications ----------
function showNotifications() {
  const n = [
    [I.car, 'var(--warn)', 'OC Toyoty kończy się za 6 dni', 'dziś, 08:00'],
    [I.pill, 'var(--trust)', 'Mama: 2 recepty czekają na wykup', 'wczoraj, 18:20'],
    [I.eye, 'var(--navy)', 'Urząd Skarbowy odczytał dane Twojego pojazdu', '21.10, 13:40'],
    [I.money, 'var(--red)', 'Nowa opłata: odpady komunalne, 122,13 zł', '20.10, 09:00']
  ];
  sheet(`<h3>Powiadomienia</h3><div class="mt">${n.map(x => `<div class="lrow" style="box-shadow:none;background:var(--bg)"><span class="li" style="color:${x[1]}">${x[0]}</span><span class="lt"><b>${esc(x[2])}</b><small>${esc(x[3])}</small></span></div>`).join('')}</div>
    <button class="btn outline mt" onclick="closeSheet()">Zamknij</button>`);
}

// ---------- documents: add and reorder ----------
DOCS.ekuz = { name: 'Karta EKUZ', color: '#1b56b8', icon: I.heart, share: false,
  rows: [['Imię i nazwisko', me.first + ' ' + me.last], ['Numer karty', '80616 00020 00123 4567'], ['Ważna do', '31.12.2028'], ['Wydał', 'NFZ']] };
function addDocument() {
  const avail = [['ekuz', 'Karta EKUZ', 'Europejska karta ubezpieczenia zdrowotnego'], ['leg', 'Legitymacja emeryta-rencisty', 'Nie masz tego uprawnienia w ZUS'], ['stud', 'mLegitymacja studencka', 'Nie jesteś studentką w rejestrze POL-on']];
  sheet(`<h3>Dodaj dokument</h3><p class="sub">Sprawdziłam rejestry. Możesz dodać tylko dokumenty, które Ci przysługują.</p><div class="mt">
    ${avail.map(a => { const has = S.docOrder.includes(a[0]); const ok = a[0] === 'ekuz';
      return `<div class="lrow" style="box-shadow:none;background:var(--bg)"><span class="lt"><b>${esc(a[1])}</b><small>${esc(has ? 'Już dodany' : a[2])}</small></span>${ok && !has ? `<button class="pillbtn" id="addEkuz">Dodaj</button>` : ''}</div>`; }).join('')}</div>
    <button class="btn outline mt" onclick="closeSheet()">Zamknij</button>`);
  const b = $('#addEkuz');
  if (b) b.onclick = () => passkey('Dodanie dokumentu: Karta EKUZ', 'DD-EKUZ', fnv('ekuz' + now()), () => { S.docOrder.push('ekuz'); render(); toast('Karta EKUZ jest w Twoich dokumentach.'); });
}
function customizeDocs() {
  const draw = () => {
    sheet(`<h3>Dostosuj kolejność</h3><p class="sub">Pierwszy dokument zobaczysz od razu na ekranie Start.</p><div class="mt">
      ${S.docOrder.map((k, i) => `<div class="lrow" style="box-shadow:none;background:var(--bg)"><span class="li" style="color:${DOCS[k].color}">${DOCS[k].icon}</span><span class="lt"><b>${esc(DOCS[k].name)}</b></span>
        <button class="iconbtn" data-up="${i}" aria-label="W górę" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${svg('<path d="M12 19V5M6 11l6-6 6 6"/>')}</button>
        <button class="iconbtn" data-down="${i}" aria-label="W dół" ${i === S.docOrder.length - 1 ? 'disabled style="opacity:.3"' : ''}>${svg('<path d="M12 5v14M6 13l6 6 6-6"/>')}</button></div>`).join('')}</div>
      <button class="btn mt" id="orderDone">Gotowe</button>`);
    const swap = (a, b) => { const o = S.docOrder; [o[a], o[b]] = [o[b], o[a]]; draw(); };
    document.querySelectorAll('[data-up]').forEach(b => b.onclick = () => swap(+b.dataset.up, +b.dataset.up - 1));
    document.querySelectorAll('[data-down]').forEach(b => b.onclick = () => swap(+b.dataset.down, +b.dataset.down + 1));
    $('#orderDone').onclick = () => { closeSheet(); render(); };
  };
  draw();
}

// ---------- QR scan: someone asks for your data ----------
function scanFlow() {
  const vf = document.querySelector('.viewfinder');
  if (vf) { vf.classList.add('scanning'); vf.querySelector('span').textContent = 'Szukam kodu…'; }
  setTimeout(() => {
    if (vf) { vf.classList.remove('scanning'); vf.querySelector('span').textContent = 'Skieruj aparat na kod QR'; }
    const fields = [['Imię i nazwisko', 'wymagane'], ['Numer dokumentu', 'wymagane'], ['Data urodzenia', 'opcjonalne'], ['Adres zamieszkania', 'opcjonalne']];
    let on = [true, true, false, false];
    const draw = () => {
      sheet(`<span class="status navy"><i></i>Prośba o dane</span><h3 style="margin-top:10px">Hotel „Pod Wawelem”, Kraków</h3>
        <p class="sub">Meldunek gościa, 24 do 26.10. Firma zweryfikowana w rejestrze przedsiębiorców.</p>
        <div class="mt">${fields.map((f, i) => `<button class="check ${on[i] ? 'on' : ''}" data-f="${i}" ${i < 2 ? 'data-req="1"' : ''}><span class="box">${I.check}</span><span><b>${esc(f[0])}</b><small>${esc(f[1])}</small></span></button>`).join('')}</div>
        <div class="rule">${I.lock}<span>Udostępnienie danych zawsze wymaga podpisu i trafia do Moich danych. Zgodę cofniesz jednym ruchem.</span></div>
        <button class="btn mt" id="shareOk">Udostępnij zaznaczone</button><button class="btn outline mt" id="shareNo">Odmów</button>`);
      document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { if (b.dataset.req) return toast('Te dane są wymagane do meldunku.'); on[+b.dataset.f] = !on[+b.dataset.f]; draw(); });
      $('#shareNo').onclick = () => { closeSheet(); toast('Odmówiłaś. Hotel nie dostał żadnych danych.'); };
      $('#shareOk').onclick = () => {
        const what = fields.filter((_, i) => on[i]).map(f => f[0]).join(', ');
        signed({ title: 'Udostępnienie danych: Hotel „Pod Wawelem”', rows: [['Zakres', what]], rule: 'Udostępnienie danych zawsze wymaga podpisu.', office: 'Hotel „Pod Wawelem”', result: 'dane przekazane: ' + what,
          onDone: () => {
            S.consents.unshift({ id: 'c' + Date.now(), who: 'Hotel „Pod Wawelem”, Kraków', what, why: 'Meldunek 24 do 26.10', until: 'do 26.10.2026', icon: 'bank' });
            S.access.unshift({ when: 'dziś, ' + now(), who: 'Hotel „Pod Wawelem”', what, basis: 'Twoja zgoda przez kod QR', kind: 'company' });
            toast('Dane przekazane. Zgoda jest w Moich danych.');
          } });
      };
    };
    draw();
  }, FAST ? 0 : 1300);
}

// ---------- voice input ----------
function voice() {
  sheet(`<div class="passkey"><h3>Słucham…</h3><div class="listen"><i></i><i></i><i></i><i></i><i></i></div><p class="sub" id="heard">Powiedz, co chcesz załatwić</p></div>`);
  const phrase = 'Sprzedaję auto';
  let i = 0;
  const t = setInterval(() => {
    i++; const h = $('#heard'); if (!h) return clearInterval(t);
    h.textContent = phrase.slice(0, Math.round(phrase.length * Math.min(1, i / 8)));
    if (i >= 12) { clearInterval(t); closeSheet(); openTab('start', { k: 'chat' }); ask(phrase); }
  }, FAST ? 0 : 140);
}

// ---------- delegations ----------
function addDelegation() {
  const scopes = [['e-Recepty', ''], ['Wizyty NFZ', ''], ['Opłaty do 300 zł', ''], ['Odbiór e-Doręczeń', '']];
  const terms = [['3 miesiące', 'do 23.01.2027'], ['1 rok', 'do 23.10.2027'], ['Do odwołania', 'możesz je cofnąć w każdej chwili']];
  let step = 0, on = [true, true, false, false], term = 1;
  const draw = () => {
    if (step === 0) {
      sheet(`<h3>Nowe pełnomocnictwo</h3><p class="sub">Poproś bliską osobę, żeby pokazała swój kod w mObywatelu, i zeskanuj go.</p>
        <div class="viewfinder" style="height:180px;margin-top:14px"><i></i><i></i><i></i><i></i><span>Kod osoby</span></div>
        <button class="btn mt" id="dStep">Symuluj: skanuję kod babci</button>`);
    } else if (step === 1) {
      sheet(`<span class="status ok"><i></i>Tożsamość potwierdzona</span><h3 style="margin-top:10px">Zofia Nowak, 81 lat</h3><p class="sub">W czym chcesz jej pomagać?</p>
        <div class="mt">${scopes.map((s, i) => `<button class="check ${on[i] ? 'on' : ''}" data-s="${i}"><span class="box">${I.check}</span><span><b>${esc(s[0])}</b></span></button>`).join('')}</div>
        <p class="sub" style="margin-top:14px">Na jak długo?</p><div class="mt">${choiceList('t', terms, term)}</div>
        <button class="btn mt" id="dStep">Wyślij do podpisu</button>`);
    }
    document.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { on[+b.dataset.s] = !on[+b.dataset.s]; draw(); });
    document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { term = +b.dataset.t; draw(); });
    $('#dStep').onclick = () => {
      if (step === 0) { step = 1; return draw(); }
      const sc = scopes.filter((_, i) => on[i]).map(s => s[0]);
      if (!sc.length) return toast('Wybierz co najmniej jeden zakres.');
      signed({ title: 'Pełnomocnictwo od Zofii Nowak', rows: [['Zakres', sc.join(', ')], ['Termin', terms[term][0]]], rule: 'Pełnomocnictwo podpisujecie oboje, każde swoim kluczem.', office: 'Rejestr pełnomocnictw', result: 'czeka na podpis Zofii Nowak',
        onDone: () => {
          const p = { id: 'babcia', name: 'Zofia Nowak', rel: 'Babcia, 81 lat', initials: 'ZN', color: '#8a5a12', scope: sc, until: terms[term][1], pending: true, log: [] };
          S.forOthers.push(p); render(); toast('Wysłano. Czekamy na podpis Zofii w jej aplikacji.');
          setTimeout(() => { p.pending = false; p.log.unshift({ when: 'dziś, ' + now(), what: 'Zofia Nowak podpisała pełnomocnictwo' }); if (S.view && S.view.k === 'bliscy') render(); toast('Zofia Nowak podpisała pełnomocnictwo.'); }, FAST ? 10 : 3500);
        } });
    };
  };
  draw();
}
function endDelegation(id) {
  const p = S.forOthers.find(x => x.id === id);
  sheet(`<h3>Zakończyć pełnomocnictwo?</h3><p class="sub">Przestaniesz działać w imieniu: <b>${esc(p.name)}</b>. ${esc(p.name.split(' ')[0])} dostanie powiadomienie.</p>
    <div class="rule">${I.lock}<span>Zakończenie nie wymaga podpisu. Łatwiej zabrać niż dać.</span></div>
    <button class="btn mt" id="endOk" style="background:var(--red)">Zakończ</button><button class="btn outline mt" onclick="closeSheet()">Zostaw</button>`);
  $('#endOk').onclick = () => { S.forOthers = S.forOthers.filter(x => x.id !== id); closeSheet(); openView({ k: 'bliscy' }); toast('Pełnomocnictwo zakończone.'); };
}

// ---------- report a suspicious read ----------
function reportRead() {
  const list = S.access.filter(a => a.kind !== 'me' && !a.reported);
  sheet(`<h3>Który odczyt Cię niepokoi?</h3><p class="sub">Zgłoszenie trafi do inspektora ochrony danych tej instytucji. Musi odpowiedzieć w 30 dni.</p><div class="mt">
    ${list.map((a, i) => `<button class="choice" data-r="${i}"><div class="radio"></div><div><b>${esc(a.who)}</b><span>${esc(a.when)} · ${esc(a.what)}</span></div></button>`).join('')}</div>`);
  document.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
    const a = list[+b.dataset.r];
    signed({ title: 'Zgłoszenie podejrzanego odczytu: ' + a.who, rows: [['Odczyt', a.when + ', ' + a.what]], rule: 'Wysłanie zgłoszenia w Twoim imieniu wymaga podpisu.', office: 'Inspektor ochrony danych: ' + a.who, result: 'zgłoszenie przyjęte, odpowiedź w 30 dni',
      onDone: () => { a.reported = true; a.basis += ' · zgłoszone przez Ciebie'; render(); toast('Zgłoszenie wysłane. Odpowiedź dostaniesz w aplikacji.'); } });
  });
}

// ---------- settings and help ----------
S.settings = [['Powiadomienia', 'O terminach, odczytach danych i sprawach bliskich', true], ['Logowanie biometrią', 'Odcisk palca albo twarz zamiast kodu PIN', true], ['Ukryj dane w podglądzie aplikacji', 'Na liście otwartych aplikacji nie widać dokumentów', true], ['Asystent głosowy', 'Rozmowa głosem na ekranie Start', true]];
function viewSettings() {
  return `${S.settings.map((s, i) => `<button class="lrow" data-set="${i}"><span class="lt"><b>${esc(s[0])}</b><small>${esc(s[1])}</small></span><span class="switch ${s[2] ? 'on' : ''}"></span></button>`).join('')}
    <div class="lgroup mt"><div class="lrow"><span class="lt"><b>Język</b></span><span class="muted">Polski</span></div><div class="lrow"><span class="lt"><b>Wersja</b></span><span class="muted">koncepcja 1.0</span></div></div>
    <button class="btn outline mt" id="logout">Wyloguj</button>`;
}
function bindSettings() {
  document.querySelectorAll('[data-set]').forEach(b => b.onclick = () => { const s = S.settings[+b.dataset.set]; s[2] = !s[2]; render(); });
  $('#logout').onclick = () => { try { localStorage.removeItem('mob-onb'); } catch (e) { /* ignore */ } location.reload(); };
}
const FAQ = [
  ['Czy asystent może coś zrobić beze mnie?', 'Nie. Asystent sprawdza rejestry i przygotowuje czynności, ale każdą, która coś zmienia, płaci albo wysyła, podpisujesz sama kluczem telefonu. Ta zasada jest w kodzie, a nie w rozmowie.'],
  ['Co jeśli ktoś każe asystentowi zrobić coś w SMS-ie?', 'Treść SMS-ów, maili i stron trafia do asystenta jako dane, nigdy jako polecenia. Nawet jeśli wiadomość zawiera rozkaz, asystent go nie wykona.'],
  ['Skąd wiem, kto czytał moje dane?', 'Dziennik w Moich danych zasilają rejestry państwowe. Widzisz każdy odczyt, z podstawą prawną, także te przez urzędy i policję.'],
  ['Jak cofnąć zgodę?', 'W Moich danych, w zakładce Zgody. Cofnięcie nie wymaga podpisu i działa od razu.'],
  ['Czy to prawdziwa aplikacja?', 'Nie. To koncepcja na mObywatel Challenge z fikcyjnymi danymi. Nie łączy się z żadnym rejestrem.']
];
function viewHelp() {
  return `${FAQ.map(f => `<details class="faq"><summary>${esc(f[0])}${I.chev}</summary><p>${esc(f[1])}</p></details>`).join('')}`;
}
