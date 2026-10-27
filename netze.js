/* Mathematik: Würfelnetze.
   Sechs Quadrate werden zu einem Netz gelegt und dann in 3D gefaltet.
   Ob ein Netz passt, wird geprüft, indem der Würfel über das Netz „abgerollt“ wird:
   Jedes Quadrat muss auf einer anderen Würfelseite landen. */

import { geruest, zufall, wahl, warte, antwortHtml, bewegung } from './geruest.js';

const BR = 5, HO = 4;   // Raster für das Netz
const RICHTUNG = { r: [1, 0], l: [-1, 0], u: [0, 1], o: [0, -1] };

/* 90°-Drehungen als ganzzahlige Matrizen (Spalten = lokale Achsen) */
const mal = (A, B) => A.map((z, i) => B[0].map((_, j) => z.reduce((s, _, k) => s + A[i][k] * B[k][j], 0)));
const ROT = {
  r: [[0, 0, -1], [0, 1, 0], [1, 0, 0]],    // um die y-Achse
  l: [[0, 0, 1], [0, 1, 0], [-1, 0, 0]],
  u: [[1, 0, 0], [0, 0, -1], [0, 1, 0]],    // um die x-Achse
  o: [[1, 0, 0], [0, 0, 1], [0, -1, 0]],
};

/** Baum über die Felder (Breitensuche) und Prüfung durch Abrollen. */
export function analysiere(felder) {
  const set = new Set(felder.map(f => f.join(',')));
  if (felder.length !== 6) return { gueltig: false, grund: 'anzahl' };
  const start = felder[0];
  const knoten = new Map([[start.join(','), { f: start, eltern: null, richtung: null, M: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], kinder: [] }]]);
  const schlange = [start];
  while (schlange.length) {
    const f = schlange.shift();
    const k = knoten.get(f.join(','));
    for (const [d, [dx, dy]] of Object.entries(RICHTUNG)) {
      const n = [f[0] + dx, f[1] + dy], key = n.join(',');
      if (!set.has(key) || knoten.has(key)) continue;
      const kind = { f: n, eltern: k, richtung: d, M: mal(k.M, ROT[d]), kinder: [] };
      knoten.set(key, kind); k.kinder.push(kind); schlange.push(n);
    }
  }
  if (knoten.size !== 6) return { gueltig: false, grund: 'zusammenhang' };
  const normalen = [...knoten.values()].map(k => k.M.map(z => z[2]).join(','));
  const doppelt = normalen.length - new Set(normalen).size;
  [...knoten.values()].forEach((k, i) => { k.doppelt = normalen.filter(n => n === normalen[i]).length > 1; });
  return { gueltig: doppelt === 0, grund: doppelt ? 'doppelt' : null, wurzel: knoten.get(start.join(',')), knoten };
}

/** Zufälliges zusammenhängendes Sechsling-Muster im Raster. */
function zufallsNetz() {
  const f = [[zufall(1, BR - 2), zufall(1, HO - 2)]];
  while (f.length < 6) {
    const [x, y] = wahl(f), [dx, dy] = wahl(Object.values(RICHTUNG));
    const n = [x + dx, y + dy];
    if (n[0] < 0 || n[1] < 0 || n[0] >= BR || n[1] >= HO || f.some(q => q[0] === n[0] && q[1] === n[1])) continue;
    f.push(n);
  }
  return f;
}

const FARBEN = ['#f8cf4a', '#e0457b', '#2f6fe4', '#16a974', '#f07d2a', '#8a4bd6'];

export function starteNetze(root) {
  let modus = 'legen';
  let felder = [], gefaltet = false, bewertung = null, antwort = null, beschaeftigt = false, quizNetz;

  const g = geruest(root, {
    etikett: 'Würfelnetze', titel: '',
    reiter: [{ id: 'legen', titel: 'Netz legen', unter: 'und falten' }, { id: 'quiz', titel: 'Ist das ein Würfelnetz?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-nz="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-nz="neu">＋ Neu</button>`,
  });

  function neu() {
    gefaltet = false; bewertung = null; antwort = null;
    if (modus === 'legen') felder = [];
    else {
      const gueltigGewuenscht = Math.random() < 0.5;
      let n, t = 0;
      do { n = zufallsNetz(); t++; } while (analysiere(n).gueltig !== gueltigGewuenscht && t < 500);
      quizNetz = n; felder = n;
    }
  }

  /** Verschachtelter 3D-Aufbau: jedes Kind-Quadrat hängt an einer Kante seines Elternquadrats. */
  function faltHtml(k, i = { n: 0 }) {
    const nr = i.n++;
    const kinder = k.kinder.map(c => faltHtml(c, i)).join('');
    return `<div class="nz-flaeche${k.richtung ? ` nz-${k.richtung}` : ''}${k.doppelt ? ' doppelt' : ''}" style="--f:${FARBEN[nr % 6]}" data-nr="${nr + 1}"><span>${nr + 1}</span>${kinder}</div>`;
  }

  function links() {
    let raster = '';
    for (let y = 0; y < HO; y++) for (let x = 0; x < BR; x++) {
      const an = felder.findIndex(f => f[0] === x && f[1] === y);
      raster += `<button type="button" class="nz-zelle${an >= 0 ? ' an' : ''}" ${modus === 'legen' && !gefaltet ? `data-zelle="${x},${y}"` : 'tabindex="-1"'} aria-label="Feld ${x + 1}, ${y + 1}"></button>`;
    }
    const a = analysiere(felder);
    let falt = '';
    if (felder.length === 6 && a.knoten) {
      // Wurzel so platzieren, dass das flache Netz genau über dem Raster liegt
      const [x0, y0] = felder[0];
      falt = `<div class="nz-szene${gefaltet ? ' zu' : ''}${a.gueltig ? '' : ' kaputt'}"><div class="nz-wurzel" style="--x:${x0}; --y:${y0}; --cx:${(BR - 1) / 2 - x0}; --cy:${(HO - 1) / 2 - y0}">${faltHtml(a.wurzel)}</div></div>`;
    }
    return `<div class="nz-buehne" style="--br:${BR}; --ho:${HO}">
        <div class="nz-raster${falt ? ' mit-falt' : ''}">${raster}</div>${falt}
      </div>
      <div class="gs-pruef">
        ${felder.length === 6 && a.knoten ? `<button type="button" class="kn-gross" data-nz="falten">${gefaltet ? '↺ Auffalten' : '📦 Falten'}</button>` : ''}
        ${modus === 'legen' ? `<span class="nz-zahl">${felder.length} / 6 Quadrate</span>` : ''}
      </div>`;
  }

  function rechts() {
    if (modus === 'legen') {
      const a = analysiere(felder);
      let txt = '<p>Tippe 6 Felder an. Sie müssen an Kanten zusammenhängen.</p>';
      if (felder.length === 6 && !a.knoten) txt = '<p class="tb-antwort schlecht">Die Quadrate hängen nicht alle zusammen.</p>';
      if (gefaltet && a.knoten) txt = a.gueltig ? '<p class="tb-antwort gut">Das ist ein Würfelnetz! Alle 6 Seiten sind belegt.</p>' : '<p class="tb-antwort schlecht">Kein Würfelnetz: Zwei Quadrate landen auf derselben Seite – dafür fehlt eine andere.</p>';
      return `<h2 class="bereich-titel">Lege ein Würfelnetz</h2>${txt}
        <p class="leise">Es gibt genau 11 verschiedene Würfelnetze. Wie viele findest du?</p>`;
    }
    return `<h2 class="bereich-titel">Kann man daraus einen Würfel falten?</h2>
      <div class="rr-wahl"><button type="button" class="kn-gross${antwort === true ? ' gewaehlt' : ''}" data-ja="1">✓ Ja</button><button type="button" class="kn-gross${antwort === false ? ' gewaehlt' : ''}" data-ja="0">✗ Nein</button></div>
      ${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'legen' ? 'Würfelnetze legen und falten' : 'Würfelnetz oder nicht?');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  async function falten() {
    beschaeftigt = true;
    gefaltet = !gefaltet;
    const sz = root.querySelector('.nz-szene');
    if (sz) sz.classList.toggle('zu', gefaltet);
    g.rechts.innerHTML = rechts();
    root.querySelector('[data-nz="falten"]').textContent = gefaltet ? '↺ Auffalten' : '📦 Falten';
    await warte(gefaltet ? 2200 : 900);
    beschaeftigt = false;
    if (gefaltet) {
      const a = analysiere(felder);
      g.sprich(a.gueltig ? 'Gefaltet: Ein geschlossener Würfel!' : 'Beim Falten liegen zwei Quadrate übereinander – eine Seite bleibt offen.', a.gueltig ? 'fertig' : 'tipp');
    }
  }

  async function beantworte(ja) {
    if (beschaeftigt || bewertung) return;
    antwort = ja;
    const ok = analysiere(quizNetz).gueltig === ja;
    bewertung = { ok, text: ok ? 'Richtig! Schau beim Falten zu.' : 'Leider falsch. Schau beim Falten zu.' };
    g.rechts.innerHTML = rechts();
    await warte(300);
    if (!gefaltet) await falten();
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const z = e.target.closest('[data-zelle]');
    if (z) {
      const [x, y] = z.dataset.zelle.split(',').map(Number);
      const i = felder.findIndex(f => f[0] === x && f[1] === y);
      if (i >= 0) felder.splice(i, 1); else if (felder.length < 6) felder.push([x, y]); else { g.sprich('Es liegen schon 6 Quadrate. Nimm erst eins weg.', 'tipp'); return; }
      zeichne(); return;
    }
    const j = e.target.closest('[data-ja]');
    if (j) { beantworte(j.dataset.ja === '1'); return; }
    const b = e.target.closest('[data-nz]');
    if (!b) return;
    if (b.dataset.nz === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.nz === 'falten') falten();
    if (b.dataset.nz === 'tipp') g.sprich(modus === 'legen'
      ? 'Tipp: Lege 4 Quadrate in eine Reihe (das wird der Mantel) und je eins oben und unten daran.'
      : 'Stell dir vor, ein Quadrat ist der Boden. Klappe in Gedanken die anderen hoch. Liegen zwei aufeinander?', 'tipp');
  });

  function startText() {
    g.sprich(modus === 'legen' ? 'Lege 6 Quadrate so, dass man daraus einen Würfel falten kann. Dann tippe auf „Falten“.' : 'Entscheide: Kann man aus diesem Netz einen Würfel falten?');
  }

  void bewegung;
  neu(); zeichne(); startText();
}
