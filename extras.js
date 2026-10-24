'use strict';
// Senior mode, mom's view, the guided tour for the jury and installing as an app.
// Loaded after app.js and uslugi.js; wraps a few of their screen functions.

const realSleep = ms => new Promise(r => setTimeout(r, FAST ? 0 : ms));

// ---------- senior mode ----------
S.senior = false;
function setSenior(on) {
  S.senior = on;
  $('#phone').classList.toggle('senior', on);
  render();
  toast(on ? 'Tryb seniora włączony: duży tekst i prosty ekran Start.' : 'Wrócił zwykły widok.');
}
const baseStart = viewStart, baseBindStart = bindStart;
viewStart = () => {
  if (!S.senior) return baseStart();
  const tile = (attr, icon, label, color) => `<button class="bigtile" ${attr}><span style="color:${color}">${icon}</span>${label}</button>`;
  return `<h1 class="ptitle">Dobry wieczór, Anno</h1>
    <div class="bigtiles">
      ${tile('data-goto="dokumenty"', I.id, 'Moje dokumenty', '#0b4a96')}
      ${tile('id="sVoice"', I.mic, 'Powiedz, co załatwić', '#0b4a96')}
      ${tile('data-svc="erecepta"', I.pill, 'Moje recepty', '#2e8b3e')}
      ${tile('data-svc="eplatnosci"', I.money, 'Płatności', '#d92d45')}
    </div>
    <div class="sh"><h2>Do załatwienia</h2></div>
    ${S.carSold ? '' : `<div class="pay"><span class="status red"><i></i>Kończy się 29.10</span><b>OC samochodu</b><button class="btn" data-run="oc">Sprawdź</button></div>`}
    <button class="btn outline mt" id="seniorOff">Wróć do zwykłego widoku</button>`;
};
bindStart = () => {
  if (!S.senior) return baseBindStart();
  bindCommon($('#screen'));
  $('#sVoice').onclick = voice;
  $('#seniorOff').onclick = () => setSenior(false);
};
const baseViewSettings = viewSettings, baseBindSettings = bindSettings;
viewSettings = () => `<button class="lrow" id="seniorSw"><span class="lt"><b>Tryb seniora</b><small>Duży tekst, wysoki kontrast i prosty ekran Start</small></span><span class="switch ${S.senior ? 'on' : ''}"></span></button>` + baseViewSettings();
bindSettings = () => { baseBindSettings(); $('#seniorSw').onclick = () => setSenior(!S.senior); };

// ---------- mom's view: the other side of a delegation ----------
let mamaReserved = false;
const baseMamaLog = FX.mamaLog;
FX.mamaLog = () => { baseMamaLog(); mamaReserved = true; };
function openMama() {
  const el = $('#mamaView');
  const mama = S.forOthers.find(p => p.id === 'mama');
  const log = mama ? mama.log : [];
  el.innerHTML = `<div class="mamabar">${I.eye}<span>Tak widzi to mama, Halina Nowak</span><button id="mamaBack">Wróć do Anny</button></div>
    <div class="mamascroll">
      <div class="topbar root" style="padding:8px 0 4px"><span class="avatar" style="background:#a14a76">HN</span><span class="iconbtn">${I.bell}</span></div>
      <h1 class="ptitle">Dzień dobry, Halino</h1>
      <div class="sh" style="margin-top:6px"><h2>Powiadomienia</h2></div>
      ${mamaReserved ? `<div class="pay"><span class="status trust"><i></i>Od córki, dziś</span><b>Anna udostępniła Twoje recepty aptece „Pod Lipą”</b><p>Leki będą do odbioru jutro od 10:00.</p></div>` : ''}
      <div class="pay"><span class="status trust"><i></i>Od córki, 14.10</span><b>Anna umówiła Ci wizytę u kardiologa</b><p>5 listopada, 10:30, Przychodnia „Zdrowa Wilda”.</p></div>
      <div class="sh"><h2>Kto działa w moim imieniu</h2></div>
      ${mama ? `<div class="pay"><div class="person"><div class="face" style="background:#0b4a96">AN</div><div><b style="margin:0">Anna Nowak</b><div class="muted">Córka</div></div></div>
        <div class="scope">${mama.scope.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div><div class="pfoot"><span>Ważne: ${esc(mama.until)}</span></div></div>
        <div class="sh"><h2>Wszystko, co zrobiła Anna</h2></div>
        <div class="mama-log">${log.map(l => `<div class="lrow"><span class="li" style="color:var(--ok)">${I.done}</span><span class="lt"><b>${esc(l.what)}</b><small>${esc(l.when)}</small></span></div>`).join('')}</div>
        <p class="muted" style="margin:4px 4px 0">Anna nie może niczego z tej listy usunąć.</p>
        <button class="btn danger mt" id="mamaRevoke">Cofnij pełnomocnictwo</button>`
      : `<div class="pay"><span class="status red"><i></i>Cofnięte</span><b>Nikt nie działa teraz w Twoim imieniu</b><p>Anna straciła dostęp do Twoich spraw.</p></div>`}
      <div class="sh"><h2>Moje recepty</h2></div>
      <div class="pay"><span class="status ${mamaReserved ? 'ok' : 'warn'}"><i></i>${mamaReserved ? 'Zarezerwowane przez Annę' : 'Do wykupienia'}</span><b>Atorwastatyna 20 mg</b></div>
      <div class="pay"><span class="status ${mamaReserved ? 'ok' : 'warn'}"><i></i>${mamaReserved ? 'Zarezerwowane przez Annę' : 'Do wykupienia'}</span><b>Metformina 500 mg</b></div>
    </div>`;
  el.hidden = false;
  $('#mamaBack').onclick = closeMama;
  const rv = $('#mamaRevoke');
  if (rv) rv.onclick = () => {
    sheet(`<h3>Cofnąć pełnomocnictwo dla Anny?</h3><p class="sub">Anna od razu straci dostęp do Twoich recept, wizyt i opłat. Dostanie o tym powiadomienie.</p>
      <div class="rule">${I.lock}<span>Cofnięcie nie wymaga podpisu. Łatwiej zabrać niż dać.</span></div>
      <button class="btn mt" id="mrOk" style="background:var(--red)">Cofnij</button><button class="btn outline mt" onclick="closeSheet()">Zostaw</button>`);
    $('#mrOk').onclick = () => { S.forOthers = S.forOthers.filter(p => p.id !== 'mama'); closeSheet(); openMama(); render(); toast('Pełnomocnictwo cofnięte. Anna dostała powiadomienie.'); };
  };
}
function closeMama() { $('#mamaView').hidden = true; }

// ---------- install as an app ----------
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
function install() {
  if (installEvt) { installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; }); return; }
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return toast('Aplikacja jest już zainstalowana.');
  sheet(`<h3>Zainstaluj na telefonie</h3><p class="sub">Prototyp działa jak aplikacja: ikona na ekranie głównym, pełny ekran i działanie bez internetu.</p>
    <div class="sh"><h2>iPhone (Safari)</h2></div><ul class="steps" style="margin-top:4px"><li><span style="color:var(--navy);display:grid">${I.send}</span>Stuknij „Udostępnij”</li><li><span style="color:var(--navy);display:grid">${I.plus}</span>Wybierz „Do ekranu początkowego”</li></ul>
    <div class="sh"><h2>Android (Chrome)</h2></div><ul class="steps" style="margin-top:4px"><li><span style="color:var(--navy);display:grid">${I.info}</span>Otwórz menu przeglądarki</li><li><span style="color:var(--navy);display:grid">${I.plus}</span>Wybierz „Zainstaluj aplikację”</li></ul>
    <button class="btn mt" onclick="closeSheet()" style="margin-top:20px">Rozumiem</button>`);
}
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode is optional */ }));
}

// ---------- extra rows in "Więcej" ----------
const baseViewMore = viewMore, baseBindMore = bindMore;
viewMore = () => baseViewMore().replace('<div class="secl">Aplikacja</div>', `<div class="secl">Dla jury</div>
  <div class="lgroup">
    <button class="lrow" id="mTour"><span class="li" style="color:#dc143c">${svg('<path d="M8 5.5v13l11-6.5z"/>')}</span><span class="lt"><b>Pokaż mi w 2 minuty</b><small>Przewodnik po najważniejszych pomysłach</small></span>${I.chev}</button>
    <button class="lrow" id="mMama"><span class="li" style="color:#a14a76">${I.eye}</span><span class="lt"><b>Zobacz, co widzi mama</b><small>Druga strona pełnomocnictwa</small></span>${I.chev}</button>
    <button class="lrow" id="mSenior"><span class="li" style="color:#0b4a96">${I.user}</span><span class="lt"><b>Tryb seniora</b><small>${S.senior ? 'Włączony' : 'Duży tekst, prosty ekran Start'}</small></span><span class="switch ${S.senior ? 'on' : ''}"></span></button>
    <button class="lrow" id="mInstall"><span class="li" style="color:#0b4a96">${I.plus}</span><span class="lt"><b>Zainstaluj na telefonie</b><small>Ikona na ekranie głównym, działa bez internetu</small></span>${I.chev}</button>
  </div>
  <div class="secl">Aplikacja</div>`);
bindMore = () => {
  baseBindMore();
  $('#mTour').onclick = startTour;
  $('#mMama').onclick = openMama;
  $('#mSenior').onclick = () => setSenior(!S.senior);
  $('#mInstall').onclick = install;
};

// ---------- side panel shortcuts ----------
const baseSideAction = sideAction;
sideAction = b => {
  if (b.dataset.go === 'mama') { $('#onb').hidden = true; return openMama(); }
  if (b.dataset.go === 'senior') { $('#onb').hidden = true; closeMama(); return setSenior(!S.senior); }
  return baseSideAction(b);
};

// ---------- guided tour for the jury ----------
let tour = null;
// Polling uses real timers even in fast mode, so the tour never races the scripted assistant.
const tick = ms => new Promise(r => setTimeout(r, ms));
async function waitIdle() { await tick(60); for (let i = 0; i < 400 && S.busy; i++) await tick(50); await realSleep(250); }
function clickIn(text) {
  const b = [...document.querySelectorAll('#phone button')].filter(x => x.offsetParent && x.textContent.trim().includes(text) && !x.disabled).pop();
  if (b) b.click();
  return !!b;
}
async function signAuto() {
  clickIn('Podpisz');
  await tick(60);
  for (let i = 0; i < 120 && document.querySelector('.faceid'); i++) await tick(50);
  await realSleep(300);
}
function hl(sel, first) {
  document.querySelectorAll('.tour-hl').forEach(x => x.classList.remove('tour-hl'));
  const all = document.querySelectorAll(sel);
  const el = first ? all[0] : all[all.length - 1];
  if (!el) return;
  el.classList.add('tour-hl');
  el.scrollIntoView({ block: 'center', behavior: FAST ? 'auto' : 'smooth' });
}
const TOUR = [
  ['To mObywatel, który znasz', 'Dokumenty i usługi są tam, gdzie zawsze. Nowości oznaczyliśmy czerwonym „Nowe”.',
    async () => { closeMama(); closeSheet(); if (S.senior) setSenior(false); openTab('start'); await realSleep(300); hl('.bigdocs', true); }],
  ['Życie, nie urzędy', 'Zamiast szukać czterech urzędów wybierasz sprawę życiową, na przykład sprzedaż auta.',
    async () => { hl('[data-event="sprzedaz"]', true); }],
  ['Asystent rozpisuje plan', 'Pokazuje, co się wydarzy, zanim cokolwiek zrobi. Ty decydujesz, czy zaczynamy.',
    async () => { openTab('start', { k: 'event', id: 'sprzedaz' }); await realSleep(300); hl('.steps', true); }],
  ['Asystent sam sprawdza rejestry', 'Każdy odczyt z CEPiK czy UFG jest widoczny i zapisany w Twoich danych.',
    async () => { startCase('sprzedaz'); await waitIdle(); hl('.read', true); }],
  ['Podpisujesz to, co widzisz', 'Każda czynność to karta z dokładną treścią. Kod w rogu to odcisk tej treści, a podpis daje klucz telefonu.',
    async () => { clickIn('Zaczynamy'); await waitIdle(); clickIn('Symuluj'); await waitIdle(); hl('.confirm'); }],
  ['Ślad całej sprawy', 'Od prośby, przez każdy odczyt i regułę, do decyzji urzędu. Asystent nie może niczego z niego usunąć.',
    async () => { await signAuto(); await waitIdle(); await signAuto(); await waitIdle(); goLink('trace'); await realSleep(300); hl('.tl', true); }],
  ['Oszust próbuje wydać polecenie', 'SMS każe asystentowi zapłacić. Nic z tego: treść z zewnątrz to dane, nie polecenia. Ta zasada jest w kodzie.',
    async () => { startCase('sms'); await waitIdle(); hl('.untrusted'); }],
  ['Kto ma Twoje dane', 'Widzisz każdą zgodę i każdy odczyt z podstawą prawną. Zgodę cofasz jednym ruchem, bez podpisu.',
    async () => { goLink('dane'); await realSleep(300); hl('.consent', true); }],
  ['Druga strona pełnomocnictwa', 'Tak widzi to mama: każdy krok córki w jej imieniu. Może cofnąć pełnomocnictwo w każdej chwili.',
    async () => { startCase('mama'); await waitIdle(); clickIn('Tak, zarezerwuj'); await waitIdle(); await signAuto(); await waitIdle(); openMama(); await realSleep(300); hl('#mamaView .mama-log', true); }],
  ['To wszystko w 2 minuty', 'Teraz klikaj sam. Wszystkie usługi działają, a w Więcej znajdziesz tryb seniora i instalację na telefonie.',
    async () => { closeMama(); openTab('start'); }]
];
function startTour() {
  if (tour) return;
  $('#onb').hidden = true;
  tour = { i: 0 };
  runTourStep();
}
async function runTourStep() {
  const [title, text, act] = TOUR[tour.i];
  const box = $('#coach');
  const last = tour.i === TOUR.length - 1;
  box.innerHTML = `<div class="ch"><span>${tour.i + 1} z ${TOUR.length}</span><button id="tourEnd">Zakończ</button></div>
    <b>${esc(title)}</b><p>${esc(text)}</p><button class="btn" id="tourNext" disabled>Chwileczkę…</button>`;
  box.hidden = false;
  $('#tourEnd').onclick = endTour;
  try { await act(); } catch (e) { /* a step can fail if the user clicked around; keep going */ }
  if (!tour) return;
  const nx = $('#tourNext');
  nx.disabled = false; nx.textContent = last ? 'Zakończ przewodnik' : 'Dalej';
  nx.onclick = () => { if (last) return endTour(); tour.i++; runTourStep(); };
}
function endTour() {
  tour = null;
  $('#coach').hidden = true;
  document.querySelectorAll('.tour-hl').forEach(x => x.classList.remove('tour-hl'));
}
$('#tourBtn').onclick = startTour;

// The mobile "O koncepcji" sheet copies the side panel, so its tour button needs wiring too.
const baseShowAbout = showAbout;
showAbout = () => { baseShowAbout(); const b = $('#sheet .tourbtn'); if (b) { b.removeAttribute('id'); b.onclick = () => { closeSheet(); startTour(); }; } };

// Composer extras: the microphone starts voice input, the camera reads a letter.
$('#askMic').onclick = voice;
$('#askCam').onclick = () => {
  if (S.busy) return;
  sheet(`<h3>Zrób zdjęcie pisma</h3><p class="sub">Asystent odczyta pismo albo dokument i powie, co z nim zrobić. Treść ze zdjęcia traktuje jak dane, nie jak polecenia.</p>
    <div class="viewfinder" style="height:200px;margin-top:14px"><i></i><i></i><i></i><i></i><span>Skieruj aparat na pismo</span></div>
    <button class="btn mt" id="camShot">Symuluj: zdjęcie podejrzanego SMS-a</button>`);
  $('#camShot').onclick = () => { closeSheet(); chatEl.querySelectorAll('.chips:not(.used)').forEach(c => c.classList.add('used')); play('sms'); };
};

// ---------- motion: push when going deeper, pop when going back, cascade on tab change ----------
let lastTab = null, lastDepth = 0, lastStep = null;
const baseRender = render;
render = () => {
  const depth = S.view ? (S.view.from ? 2 : 1) : 0;
  const step = S.view && S.view.st ? JSON.stringify([S.view.st.step, S.view.st.pay, S.view.st.done, S.view.st.hist]) : null;
  let kind = null;
  if (S.tab !== lastTab) kind = 'fade';
  else if (depth > lastDepth) kind = 'push';
  else if (depth < lastDepth) kind = 'pop';
  else if (step !== lastStep && step !== null) kind = 'push';
  baseRender();
  lastTab = S.tab; lastDepth = depth; lastStep = step;
  if (kind) animateScreen(kind);
};
function animateScreen(kind) {
  const sc = $('#screen'), tb = $('#topbar');
  sc.classList.remove('a-push', 'a-pop', 'a-fade'); tb.classList.remove('a-title');
  void sc.offsetWidth;
  [...sc.children].slice(0, 16).forEach((c, i) => c.style.setProperty('--i', i));
  sc.classList.add('a-' + kind); tb.classList.add('a-title');
}
