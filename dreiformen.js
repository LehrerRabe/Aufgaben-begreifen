/* Mathematik: Bruch – Dezimalzahl – Prozent am Hunderterfeld (Klasse 6/7).
   Ein Bild, drei Schreibweisen: 100 Kästchen sind das Ganze.
   1. Den gegebenen Anteil einfärben (Antippen färbt bis zu diesem Kästchen; ganze Zehnerreihen auf einmal).
   2. Die beiden anderen Schreibweisen eintragen (Bruch darf gekürzt oder ungekürzt sein).
   3. Kette: 3/4 = 75/100 = 0,75 = 75 %. */

import { geruest, wahl, antwortHtml, bruchHtml, ggT, ESC } from './geruest.js';

/* Anteile, die sich gut am Hunderterfeld zeigen lassen: [Zähler, Nenner] */
const BRUECHE = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [7, 20], [1, 25], [4, 25], [12, 25], [1, 50], [7, 50], [23, 100], [41, 100], [8, 100], [65, 100]];

const dez = p => (p === 100 ? '1' : '0,' + String(p).padStart(2, '0').replace(/0$/, ''));
const lies = s => String(s ?? '').trim().replace(/\s/g, '').replace('.', ',');

export function starteDreiformen(root) {
  let auf, gefaerbt, schritt, eing = {}, bewertung = null, letzte = null;

  const g = geruest(root, {
    etikett: 'Drei Schreibweisen', titel: 'Bruch, Dezimalzahl, Prozent',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-df="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-df="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    let b; do { b = wahl(BRUECHE); } while (letzte && b[0] === letzte[0] && b[1] === letzte[1]);
    letzte = b;
    const p = (b[0] * 100) / b[1];
    auf = { z: b[0], n: b[1], p, gegeben: wahl(['bruch', 'dez', 'proz']) };
    gefaerbt = 0; schritt = 1; bewertung = null; eing = { 'df-z': '', 'df-n': '', 'df-d': '', 'df-p': '' };
  }

  const gegebenHtml = () => auf.gegeben === 'bruch' ? bruchHtml(auf.z, auf.n) : auf.gegeben === 'dez' ? dez(auf.p) : `${auf.p} %`;

  function feldHtml() {
    let h = '';
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const i = r * 10 + c;
      h += `<button type="button" class="df-k${i < gefaerbt ? ' an' : ''}" data-k="${i + 1}" tabindex="-1" aria-label="${i + 1}"></button>`;
    }
    return `<div class="df-wrap"><div class="df-zeilen">${Array.from({ length: 10 }, (_, r) => `<button type="button" class="df-z" data-reihe="${r + 1}" title="bis Reihe ${r + 1}">${(r + 1) * 10}</button>`).join('')}</div>
      <div class="df-feld${schritt > 1 ? ' fest' : ''}">${h}</div></div>
      <p class="df-zaehler">Gefärbt: <b>${gefaerbt}</b> von 100 Kästchen</p>`;
  }

  const ein = (id, label, breite = 4) => `<input class="gs-ein df-ein" id="${id}" data-dfein inputmode="decimal" maxlength="${breite + 2}" value="${ESC(eing[id])}" aria-label="${label}"${schritt > 2 ? ' readonly tabindex="-1"' : ''}>`;

  function rechts() {
    let h = `<h2 class="bereich-titel">${schritt === 1 ? 'Färbe diesen Anteil' : 'Schreibe auf drei Arten'}</h2>
      <p class="rr-gross df-gegeben">${gegebenHtml()}</p>`;
    if (schritt === 1) {
      h += `<p class="leise">Tippe ein Kästchen an: Bis dorthin wird gefärbt. Die Zahlen links färben ganze Zehnerreihen.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-df="pruefen">✓ Prüfen</button></div>`;
    } else {
      const zeilen = [];
      if (auf.gegeben !== 'bruch') zeilen.push(`<div class="df-reihe"><span class="df-name">Bruch</span><span class="bruch bruch-ein">${ein('df-z', 'Zähler', 3)}${ein('df-n', 'Nenner', 3)}</span></div>`);
      if (auf.gegeben !== 'dez') zeilen.push(`<div class="df-reihe"><span class="df-name">Dezimalzahl</span>${ein('df-d', 'Dezimalzahl', 5)}</div>`);
      if (auf.gegeben !== 'proz') zeilen.push(`<div class="df-reihe"><span class="df-name">Prozent</span>${ein('df-p', 'Prozent', 3)} <span class="df-proz">%</span></div>`);
      h += zeilen.join('');
      if (schritt === 2) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-df="pruefen">✓ Prüfen</button></div>`;
    }
    h += antwortHtml(bewertung);
    if (schritt === 3) {
      const t = ggT(auf.z, auf.n);
      h += `<p class="fl-formel df-kette">${bruchHtml(auf.z / t, auf.n / t)}${auf.n / t !== 100 ? ` = ${bruchHtml(auf.p, 100)}` : ''} = ${dez(auf.p)} = ${auf.p} %</p>
        <p class="leise">Prozent heißt „von Hundert“: ${auf.p} % sind ${auf.p} von 100 Kästchen.</p>`;
    }
    return h;
  }

  function zeichne() { g.links.innerHTML = feldHtml(); g.rechts.innerHTML = rechts(); }

  function pruefen() {
    if (schritt === 1) {
      if (gefaerbt === auf.p) { schritt = 2; bewertung = null; g.sprich(`Richtig: ${auf.p} von 100 Kästchen. Jetzt schreibe den Anteil auf die anderen Arten.`, 'fertig'); zeichne(); g.rechts.querySelector('input')?.focus({ preventScroll: true }); return; }
      const tipp = auf.gegeben === 'bruch' ? `Teile die 100 Kästchen in ${auf.n} gleiche Teile: Jeder Teil hat ${100 / auf.n} Kästchen. Davon ${auf.z}.`
        : auf.gegeben === 'dez' ? 'Die erste Stelle nach dem Komma sind die Zehntel – also ganze Zehnerreihen.' : 'Prozent heißt „von Hundert“.';
      bewertung = { ok: false, text: `Du hast ${gefaerbt} Kästchen gefärbt. ${tipp}` };
      g.rechts.innerHTML = rechts(); return;
    }
    const fehler = [];
    if (auf.gegeben !== 'bruch') {
      const z = Number(eing['df-z']), n = Number(eing['df-n']);
      if (!eing['df-z'] || !eing['df-n'] || !n || z * auf.n !== n * auf.z) fehler.push(n === 100 || !eing['df-n'] ? 'Bruch' : 'Bruch (tipp: Nenner 100 geht immer)');
    }
    if (auf.gegeben !== 'dez') {
      const d = lies(eing['df-d']), soll = dez(auf.p);
      if (d !== soll && d.replace(/0+$/, '') !== soll && !(d === '0,' + String(auf.p).padStart(2, '0'))) fehler.push('Dezimalzahl');
    }
    if (auf.gegeben !== 'proz' && Number(lies(eing['df-p']).replace(',', '.')) !== auf.p) fehler.push('Prozent');
    if (!fehler.length) { schritt = 3; bewertung = { ok: true, text: 'Richtig – drei Schreibweisen für denselben Anteil!' }; g.sprich('Bruch, Dezimalzahl und Prozent zeigen dasselbe Bild.', 'fertig'); }
    else bewertung = { ok: false, text: `Noch nicht richtig: ${fehler.join(', ')}. ${auf.p} von 100 Kästchen sind gefärbt.` };
    zeichne();
  }

  root.addEventListener('input', e => {
    if (!e.target.matches('[data-dfein]')) return;
    e.target.value = e.target.value.replace(/[^\d,.]/g, '').replace('.', ',');
    eing[e.target.id] = e.target.value;
  });
  root.addEventListener('click', e => {
    const k = e.target.closest('[data-k]'), r = e.target.closest('[data-reihe]');
    if ((k || r) && schritt === 1) {
      const bis = k ? +k.dataset.k : +r.dataset.reihe * 10;
      gefaerbt = gefaerbt === bis ? bis - (r ? 10 : 1) : bis;
      bewertung = null;
      g.links.innerHTML = feldHtml(); g.rechts.innerHTML = rechts();
      return;
    }
    const b = e.target.closest('[data-df]');
    if (!b) return;
    if (b.dataset.df === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.df === 'pruefen') pruefen();
    if (b.dataset.df === 'tipp') g.sprich(schritt === 1 ? (auf.gegeben === 'bruch' ? `Wie viele Kästchen sind ${bruchHtml(1, auf.n, 'klein')} von 100? 100 : ${auf.n} = ${100 / auf.n}.` : 'Eine Zehnerreihe sind 10 Kästchen = 0,1 = 10 %.') : `Zähle die gefärbten Kästchen: ${auf.p}. Als Bruch: ${auf.p}/100. Als Dezimalzahl: 0,${String(auf.p).padStart(2, '0')}. Als Prozent: ${auf.p} %.`, 'tipp');
  });

  function start() { g.sprich('100 Kästchen sind das Ganze. Färbe den Anteil und schreibe ihn auf drei Arten.'); }
  neu(); zeichne(); start();
}
