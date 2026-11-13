/* Mathematik: Vom Bruch zur Dezimalzahl (Klasse 6, UV „Brüche in Dezimalschreibweise“).
   1. Welcher Nenner? 10, 100, 1000 – oder „geht nicht“ (z. B. 1/3: keine Zehnerpotenz ist durch 3 teilbar).
   2. Neuen Zähler finden (erweitern; manchmal erst kürzen: 9/12 = 3/4 = 75/100).
   3. In der Stellenwerttafel: Der Nenner zeigt die Spalte der letzten Ziffer → Dezimalzahl schreiben.
   Auch gemischte Zahlen (2 3/4 = 2,75). Rechnet intern mit Tausendsteln. */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, ggT, ESC } from './geruest.js';

const ZP = [10, 100, 1000];
const SP = [
  { k: 'Z', name: 'Zehner', f: '#2f6fe4' }, { k: 'E', name: 'Einer', f: '#2fae58' },
  { k: 'z', name: 'Zehntel', f: '#f07d2a' }, { k: 'h', name: 'Hundertstel', f: '#d6336c' }, { k: 't', name: 'Tausendstel', f: '#7a3cc2' },
];
function text(t) {   // Tausendstel → Text
  const g = Math.floor(t / 1000), r = String(t % 1000).padStart(3, '0').replace(/0+$/, '');
  return g + (r ? ',' + r : '');
}
function lies(s) {
  s = String(s ?? '').trim().replace(/\s/g, '').replace('.', ',');
  if (!/^\d+(,\d{0,6})?$/.test(s)) return null;
  const [a, b = ''] = s.split(',');
  if (/[1-9]/.test(b.slice(3))) return -1;
  return Number(a) * 1000 + Number(b.slice(0, 3).padEnd(3, '0'));
}
const nurZweiFuenf = n => { while (n % 2 === 0) n /= 2; while (n % 5 === 0) n /= 5; return n === 1; };

function aufgabe() {
  const art = wahl(['zp', 'erw', 'erw', 'erw', 'kuerz', 'kuerz', 'gem', 'nicht', 'nicht']);
  let g = 0, z, n;
  if (art === 'zp') { n = wahl(ZP); z = zufall(1, n - 1); if (n === 1000 && Math.random() < .5) z = zufall(1, 99); }
  else if (art === 'erw' || art === 'gem') {
    n = wahl([2, 4, 5, 8, 20, 25, 40, 50, 125, 200, 250]);
    do { z = zufall(1, n - 1); } while (ggT(z, n) !== 1);
    if (art === 'gem') g = zufall(1, 5);
  } else if (art === 'kuerz') {
    const b = wahl([2, 4, 5, 10, 20, 25]); let a; do { a = zufall(1, b - 1); } while (ggT(a, b) !== 1);
    const k = wahl([3, 4, 6]); z = a * k; n = b * k;
  } else {
    n = wahl([3, 6, 7, 9, 11, 12, 15]); do { z = zufall(1, n - 1); } while (ggT(z, n) !== 1);
  }
  const t = ggT(z, n), geht = nurZweiFuenf(n / t);
  return { art, g, z, n, geht };
}
const passt = (a, N) => (a.z * N) % a.n === 0;

const STIL = `<style id="bd-stil">
.bd-gross { font: 800 clamp(2rem, 6vw, 3rem)/1.1 var(--titel); display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
.bd-gross .bruch { font-size: 1em; }
.bd-wahl { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; margin: .6rem 0; }
.bd-wahl button.gewaehlt { border-color: var(--akzent); background: var(--akzent); color: var(--akzent-text); }
.bd-kette { font: 700 1.5rem/1.6 var(--titel); display: flex; align-items: center; flex-wrap: wrap; gap: .4rem; margin: .6rem 0; }
.bd-op { font-size: .9rem; color: #e0457b; font-weight: 700; display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1; }
.bd-tafel { border-collapse: collapse; margin: .8rem 0; font: 700 1.5rem var(--schrift); }
.bd-tafel th, .bd-tafel td { border: 2px solid var(--rand); min-width: 3.1rem; height: 3rem; text-align: center; }
.bd-tafel th { color: #fff; font-size: 1.1rem; }
.bd-tafel th small { display: block; font-size: .6rem; font-weight: 400; }
.bd-tafel td.ziel { outline: 4px solid var(--tipp); outline-offset: -4px; }
.bd-tafel td.aufgef { color: var(--leise); }
.bd-tafel .km { border: none; min-width: .8rem; font-size: 2rem; }
.bd-merk { margin-top: .6rem; padding: .5rem .7rem; border-left: 4px solid var(--akzent); background: color-mix(in srgb, var(--akzent) 10%, transparent); border-radius: 6px; }
.bd-park { margin-top: .6rem; padding: .5rem .7rem; border-left: 4px solid #f29a12; background: #fff6e5; border-radius: 6px; color: #3a2c00; }
</style>`;

export function starteBruchDezimal(root) {
  let a, schritt, N, eing = {}, bewertung = null, gewaehlt = null, letzte = '';

  const g = geruest(root, {
    etikett: 'Dezimalzahlen', titel: 'Vom Bruch zur Dezimalzahl',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bd="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bd="neu">＋ Neue Aufgabe</button>`,
  });
  root.insertAdjacentHTML('afterbegin', STIL);

  function neu() {
    do { a = aufgabe(); } while (`${a.g}/${a.z}/${a.n}` === letzte);
    letzte = `${a.g}/${a.z}/${a.n}`;
    schritt = 1; N = null; eing = {}; bewertung = null; gewaehlt = null;
    if (a.art === 'zp') { N = a.n; schritt = 3; }
  }
  const bruch = () => (a.g ? `<span>${a.g}</span>` : '') + bruchHtml(a.z, a.n);
  const zaehlerNeu = () => (a.z * N) / a.n;
  const wert = () => a.g * 1000 + zaehlerNeu() * (1000 / N);

  function kette() {
    if (!N || N === a.n) return '';
    const t = ggT(a.z, a.n), zk = a.z / t, nk = a.n / t;
    let h = (a.g ? `${a.g}` : '') + bruchHtml(a.z, a.n);
    if (N % a.n !== 0) {
      h += ` <span class="bd-op"><span>: ${t}</span></span> = ${a.g ? a.g : ''}${bruchHtml(zk, nk)}`;
    }
    const basisN = N % a.n === 0 ? a.n : nk, basisZ = N % a.n === 0 ? a.z : zk, k = N / basisN;
    if (k > 1) h += ` <span class="bd-op"><span>· ${k}</span></span> = ${a.g ? a.g : ''}${bruchHtml(schritt >= 3 ? basisZ * k : '?', N)}`;
    else if (k < 1) h += ` <span class="bd-op"><span>: ${1 / k}</span></span> = ${a.g ? a.g : ''}${bruchHtml(schritt >= 3 ? basisZ * k : '?', N)}`;
    return `<div class="bd-kette">${h}</div>`;
  }

  function tafel() {
    const t = wert(), fertig = schritt >= 4;
    const ziff = [Math.floor(t / 10000) % 10, Math.floor(t / 1000) % 10, Math.floor(t / 100) % 10, Math.floor(t / 10) % 10, t % 10];
    const letzteSp = { 10: 2, 100: 3, 1000: 4 }[N];
    // Ziffern des neuen Zählers rechtsbündig bis zur Spalte des Nenners eintragen
    const zn = String(zaehlerNeu()), zeigen = Array(5).fill('');
    if (schritt >= 3) {
      [...zn].reverse().forEach((c, i) => { const sp = letzteSp - i; if (sp >= 0) zeigen[sp] = c; });
      if (a.g) { const gs = String(a.g); [...gs].reverse().forEach((c, i) => { const sp = 1 - i; zeigen[sp] = String(Number(zeigen[sp] || 0) + Number(c)); }); }
    }
    const zelle = i => {
      const ist = zeigen[i] !== '' && zeigen[i] !== undefined;
      if (fertig) return ist ? zeigen[i] : (i === 0 && ziff[0] === 0 ? '' : (i <= letzteSp ? `<span class="aufgef-z">${ziff[i]}</span>` : ''));
      return ist ? zeigen[i] : '';
    };
    const zahlenZeile = SP.map((s, i) => `<td class="${i === letzteSp ? 'ziel' : ''}${fertig && !(zeigen[i]) ? ' aufgef' : ''}">${zelle(i)}</td>${i === 1 ? '<td class="km">,</td>' : ''}`).join('');
    return `<table class="bd-tafel" aria-label="Stellenwerttafel"><tr>${SP.map((s, i) => `<th style="background:${s.f}">${s.k}<small>${s.name}</small></th>${i === 1 ? '<th class="km"></th>' : ''}`).join('')}</tr><tr>${zahlenZeile}</tr></table>`;
  }

  function links() {
    let h = `<div class="bd-gross">${bruch()}</div>`;
    if (schritt >= 2 && schritt <= 4 && N) h += kette();
    if (schritt >= 3 && schritt <= 4) h += tafel() + `<p class="leise">Der Nenner ${N} sagt: Die letzte Ziffer des Zählers steht bei den <b>${SP[{ 10: 2, 100: 3, 1000: 4 }[N]].name}n</b>. Leere Felder davor werden mit 0 aufgefüllt.</p>`;
    if (schritt === 5) h += `<div class="bd-park"><b>Parkplatz-Frage:</b> ${bruchHtml(a.z, a.n)} lässt sich auf keinen Nenner 10, 100, 1000, … bringen. Wie man solche Brüche trotzdem als Dezimalzahl schreibt, zeigt der Baustein <i>Periodisch per Division</i>.</div>`;
    return h;
  }

  function rechts() {
    let h = '';
    if (schritt === 1) {
      h = `<h2 class="bereich-titel">1. Auf welchen Nenner bringst du den Bruch?</h2>
        <p class="leise">Erweitern oder kürzen – im Nenner soll 10, 100 oder 1000 stehen. Manchmal geht das nicht.</p>
        <div class="bd-wahl">${ZP.map(n => `<button type="button" class="kn-gross kn-leise${gewaehlt === n ? ' gewaehlt' : ''}" data-nenner="${n}">${n}</button>`).join('')}
        <button type="button" class="kn-gross kn-leise${gewaehlt === 0 ? ' gewaehlt' : ''}" data-nenner="0">geht nicht</button></div>`;
    } else if (schritt === 2) {
      h = `<h2 class="bereich-titel">2. Wie heißt der neue Zähler?</h2>
        <div class="bd-kette">${a.g ? a.g : ''}${bruchHtml(a.z, a.n)} = ${a.g ? a.g : ''}<span class="bruch bruch-ein"><input class="gs-ein" id="bd-z" data-bdein inputmode="numeric" maxlength="5" value="${ESC(eing['bd-z'] ?? '')}" aria-label="neuer Zähler"><span>${N}</span></span></div>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bd="pruefen">✓ Prüfen</button></div>`;
    } else if (schritt === 3 || schritt === 4) {
      h = `<h2 class="bereich-titel">${a.art === 'zp' ? 'Schreibe als Dezimalzahl' : '3. Schreibe als Dezimalzahl'}</h2>
        <div class="bd-kette">${a.g ? a.g : ''}${bruchHtml(a.art === 'zp' ? a.z : zaehlerNeu(), N)} = <input class="gs-ein" style="width:7rem" id="bd-d" data-bdein inputmode="decimal" autocomplete="off" value="${ESC(eing['bd-d'] ?? '')}" aria-label="Dezimalzahl"${schritt === 4 ? ' readonly' : ''}></div>
        ${schritt === 3 ? '<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bd="pruefen">✓ Prüfen</button></div>' : ''}`;
    }
    if (schritt === 4) h += `<div class="bd-merk">${a.g ? a.g : ''}${bruchHtml(a.z, a.n)} = ${text(wert())}<br>So viele Nullen der Nenner hat, so viele Stellen stehen nach dem Komma.</div>`;
    return h + antwortHtml(bewertung);
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  function nennerGewaehlt(n) {
    gewaehlt = n;
    if (n === 0) {
      if (!a.geht) { schritt = 5; bewertung = { ok: true, text: `Richtig – das geht nicht. ${a.n / ggT(a.z, a.n)} ist kein Teiler von 10, 100 oder 1000.` }; g.sprich('Nur Brüche, deren Nenner (gekürzt) ein Teiler von 10, 100, 1000, … ist, kann man so umwandeln.', 'fertig'); }
      else bewertung = { ok: false, text: 'Doch, das geht! Probiere 10, 100 oder 1000 – vielleicht musst du vorher kürzen.' };
    } else if (passt(a, n)) {
      N = n; schritt = 2; bewertung = null; eing = {};
      g.sprich(n % a.n === 0 ? `Gut: ${n} : ${a.n} = ${n / a.n}. Erweitere mit ${n / a.n}.` : `Gut! Kürze zuerst durch ${ggT(a.z, a.n)}, dann klappt es mit ${n}.`, 'fertig');
    } else bewertung = { ok: false, text: a.geht ? `${n} klappt nicht: ${n} : ${a.n / ggT(a.z, a.n)} geht nicht auf. Versuche einen größeren Nenner${ggT(a.z, a.n) > 1 ? ' – und kürze zuerst' : ''}.` : `${n} klappt nicht. Teste auch die anderen – vielleicht geht es gar nicht?` };
    zeichne();
    g.rechts.querySelector('input')?.focus({ preventScroll: true });
  }

  function pruefen() {
    if (schritt === 2) {
      const v = Number(eing['bd-z']);
      if (!eing['bd-z']) bewertung = { ok: false, text: 'Trage den neuen Zähler ein.' };
      else if (v === zaehlerNeu()) { schritt = 3; bewertung = null; g.sprich(`Richtig: ${bruchHtml(zaehlerNeu(), N, 'klein')}. Schau in die Stellenwerttafel.`, 'fertig'); }
      else bewertung = { ok: false, text: N % a.n === 0 ? `Den Zähler musst du auch mit ${N / a.n} multiplizieren.` : `Kürze zuerst: ${bruchHtml(a.z / ggT(a.z, a.n), a.n / ggT(a.z, a.n), 'klein')}. Dann erweitere.` };
    } else if (schritt === 3) {
      const v = lies(eing['bd-d']);
      if (v === null) bewertung = { ok: false, text: 'Schreibe eine Zahl mit Komma.' };
      else if (v === wert()) { schritt = 4; bewertung = { ok: true, text: `Richtig: ${text(wert())}` }; g.sprich('Bruch und Dezimalzahl sind zwei Schreibweisen für dieselbe Zahl.', 'fertig'); }
      else {
        const z = zaehlerNeu();
        const falschOhneNull = lies(`${a.g},${z}`) === v;
        bewertung = { ok: false, text: falschOhneNull && String(z).length < String(N).length - 1 ? `Achte auf die Nullen: Die letzte Ziffer gehört zu den ${SP[{ 10: 2, 100: 3, 1000: 4 }[N]].name}n.` : 'Noch nicht. Lies die Zahl aus der Stellenwerttafel ab.' };
      }
    }
    zeichne();
    g.rechts.querySelector('input:not([readonly])')?.focus({ preventScroll: true });
  }

  function tipp() {
    if (schritt === 1) {
      const t = ggT(a.z, a.n);
      g.sprich(t > 1 ? `Kürze zuerst durch ${t}: ${bruchHtml(a.z / t, a.n / t, 'klein')}. Passt der neue Nenner in 10, 100 oder 1000?` : `Suche eine Zahl, mit der du ${a.n} multiplizieren kannst, damit 10, 100 oder 1000 herauskommt. Klappt das mit keiner?`, 'tipp');
    } else if (schritt === 2) g.sprich(N % a.n === 0 ? `${N} : ${a.n} = ${N / a.n}. Multipliziere den Zähler ${a.z} mit ${N / a.n}.` : `Kürze ${bruchHtml(a.z, a.n, 'klein')} durch ${ggT(a.z, a.n)} und erweitere dann.`, 'tipp');
    else g.sprich(`Die letzte Ziffer von ${zaehlerNeu()} steht in der markierten Spalte. Freie Felder davor sind Nullen.`, 'tipp');
  }

  root.addEventListener('input', e => {
    if (!e.target.matches('[data-bdein]')) return;
    e.target.value = e.target.value.replace(e.target.id === 'bd-z' ? /[^\d]/g : /[^\d,.]/g, '').replace('.', ',');
    eing[e.target.id] = e.target.value;
  });
  root.addEventListener('click', e => {
    const n = e.target.closest('[data-nenner]');
    if (n && schritt === 1) { nennerGewaehlt(+n.dataset.nenner); return; }
    const b = e.target.closest('[data-bd]');
    if (!b) return;
    if (b.dataset.bd === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.bd === 'pruefen') pruefen();
    if (b.dataset.bd === 'tipp') tipp();
  });

  function start() { g.sprich(a.art === 'zp' ? 'Der Nenner ist schon 10, 100 oder 1000 – nutze die Stellenwerttafel.' : 'Bringe den Bruch auf den Nenner 10, 100 oder 1000 – dann hilft die Stellenwerttafel.'); }
  neu(); zeichne(); start();
}
