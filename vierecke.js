/* Mathematik: Geometrische Stäbe – Vierecke formen.
   Vier Stäbe sind an den Ecken beweglich verbunden. Gleich lange Stäbe haben dieselbe Farbe.
   Die App erkennt rechte Winkel, parallele Seiten und benennt das Viereck im „Haus der Vierecke“. */

import { geruest, wahl, ESC } from './geruest.js';

const W = 12, H = 9;
const STAB_FARBEN = ['#e0262b', '#2f6fe4', '#1f9d55', '#f29a12', '#7d3cc2'];

const NAMEN = ['Quadrat', 'Rechteck', 'Raute', 'Parallelogramm', 'Drachenviereck', 'Trapez', 'Viereck'];
const EIGENSCHAFT = {
  Quadrat: '4 gleich lange Seiten und 4 rechte Winkel',
  Rechteck: '4 rechte Winkel, gegenüberliegende Seiten gleich lang',
  Raute: '4 gleich lange Seiten, gegenüberliegende Seiten parallel',
  Parallelogramm: 'zwei Paare paralleler Seiten',
  Drachenviereck: 'zwei Paare benachbarter Seiten gleich lang',
  Trapez: 'mindestens ein Paar paralleler Seiten',
  Viereck: 'vier Ecken, vier Seiten',
};

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const kreuz = (u, v) => u[0] * v[1] - u[1] * v[0];
const punkt = (u, v) => u[0] * v[0] + u[1] * v[1];
const l2 = u => punkt(u, u);

function schneiden(p1, p2, p3, p4) {
  const d1 = kreuz(sub(p4, p3), sub(p1, p3)), d2 = kreuz(sub(p4, p3), sub(p2, p3));
  const d3 = kreuz(sub(p2, p1), sub(p3, p1)), d4 = kreuz(sub(p2, p1), sub(p4, p1));
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Analyse eines Vierecks mit ganzzahligen Ecken. */
export function analysiere(P) {
  const s = [0, 1, 2, 3].map(i => sub(P[(i + 1) % 4], P[i]));          // Seitenvektoren
  const len = s.map(l2);
  const ecken = new Set(P.map(p => p.join(','))).size === 4;
  const ueberschlagen = schneiden(P[0], P[1], P[2], P[3]) || schneiden(P[1], P[2], P[3], P[0]);
  const flaeche = Math.abs(P.reduce((a, p, i) => a + kreuz(p, P[(i + 1) % 4]), 0)) / 2;
  const kreuzWerte = [0, 1, 2, 3].map(i => kreuz(s[i], s[(i + 1) % 4]));
  const konvex = kreuzWerte.every(k => k > 0) || kreuzWerte.every(k => k < 0);
  const rechts = [0, 1, 2, 3].map(i => punkt(s[(i + 3) % 4], s[i]) === 0);   // Winkel an Ecke i
  const par02 = kreuz(s[0], s[2]) === 0, par13 = kreuz(s[1], s[3]) === 0;
  const gueltig = ecken && !ueberschlagen && flaeche > 0 && kreuzWerte.every(k => k !== 0);
  const klassen = new Set();
  if (gueltig) {
    klassen.add('Viereck');
    if (konvex && (par02 || par13)) klassen.add('Trapez');
    if (konvex && ((len[0] === len[1] && len[2] === len[3]) || (len[1] === len[2] && len[3] === len[0]))) klassen.add('Drachenviereck');
    if (par02 && par13) klassen.add('Parallelogramm');
    if (par02 && par13 && len.every(x => x === len[0])) klassen.add('Raute');
    if (rechts.every(Boolean)) klassen.add('Rechteck');
    if (rechts.every(Boolean) && len.every(x => x === len[0])) klassen.add('Quadrat');
    if (klassen.has('Raute')) { klassen.add('Drachenviereck'); klassen.add('Trapez'); }
    if (klassen.has('Rechteck')) { klassen.add('Parallelogramm'); klassen.add('Trapez'); }
  }
  const name = NAMEN.find(n => klassen.has(n)) || null;
  return { gueltig, ueberschlagen, konvex, flaeche, len, rechts, par02, par13, klassen, name };
}

const START = [[[2, 2], [9, 3], [8, 7], [3, 6]], [[2, 6], [5, 2], [10, 3], [8, 7]], [[1, 7], [4, 2], [9, 2], [11, 7]]];

export function starteVierecke(root) {
  let P = wahl(START).map(p => [...p]);
  let ziel = null;
  let ziehen = null;

  const g = geruest(root, {
    etikett: 'Geometrische Stäbe', titel: 'Forme ein Viereck',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-vk="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross" data-vk="aufgabe">🎯 Aufgabe</button>
      <button type="button" class="kn-gross kn-leise" data-vk="neu">↺ Neu</button>`,
  });

  function zeichneBrett() {
    const s = Math.min(54, (g.links.clientWidth - 30) / W || 50);
    const px = p => [15 + p[0] * s, 15 + p[1] * s];
    const a = analysiere(P);
    // Farben nach Länge
    const laengen = [...new Set(a.len)].sort((x, y) => x - y);
    const farbe = i => STAB_FARBEN[laengen.indexOf(a.len[i]) % STAB_FARBEN.length];
    let punkte = '';
    for (let x = 0; x <= W; x++) for (let y = 0; y <= H; y++) { const [X, Y] = px([x, y]); punkte += `<circle cx="${X}" cy="${Y}" r="2.6" class="vk-loch"/>`; }
    let staebe = '', marken = '';
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = px(P[i]), [x2, y2] = px(P[(i + 1) % 4]);
      staebe += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${farbe(i)}" class="vk-stab"/>`;
    }
    if (a.gueltig) {
      // rechte Winkel
      for (let i = 0; i < 4; i++) if (a.rechts[i]) {
        const p = px(P[i]), u = sub(px(P[(i + 3) % 4]), p), v = sub(px(P[(i + 1) % 4]), p);
        const nu = Math.hypot(...u), nv = Math.hypot(...v), d = 16;
        const q1 = [p[0] + u[0] / nu * d, p[1] + u[1] / nu * d], q2 = [p[0] + v[0] / nv * d, p[1] + v[1] / nv * d];
        const q3 = [q1[0] + v[0] / nv * d, q1[1] + v[1] / nv * d];
        marken += `<path d="M${q1} L${q3} L${q2}" class="vk-winkel"/><circle cx="${(p[0] + q3[0]) / 2}" cy="${(p[1] + q3[1]) / 2}" r="2.5" class="vk-punkt"/>`;
      }
      // Parallelpfeile
      const pfeil = (i, anzahl, ref) => {
        const p1 = px(P[i]), p2 = px(P[(i + 1) % 4]);
        const m = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2], n = Math.hypot(...sub(p2, p1));
        let d = sub(p2, p1); if (punkt(d, ref) < 0) d = [-d[0], -d[1]];   // beide Pfeile zeigen in dieselbe Richtung
        const e = [d[0] / n, d[1] / n], q = [-e[1], e[0]];
        let h = '';
        for (let k = 0; k < anzahl; k++) {
          const c = [m[0] + e[0] * (k * 9 - (anzahl - 1) * 4.5), m[1] + e[1] * (k * 9 - (anzahl - 1) * 4.5)];
          h += `<path d="M${c[0] - e[0] * 7 + q[0] * 6} ${c[1] - e[1] * 7 + q[1] * 6} L${c[0]} ${c[1]} L${c[0] - e[0] * 7 - q[0] * 6} ${c[1] - e[1] * 7 - q[1] * 6}" class="vk-pfeil"/>`;
        }
        return h;
      };
      if (a.par02) marken += pfeil(0, 1, sub(P[1], P[0])) + pfeil(2, 1, sub(P[1], P[0]));
      if (a.par13) marken += pfeil(1, 2, sub(P[2], P[1])) + pfeil(3, 2, sub(P[2], P[1]));
    }
    let gelenke = '';
    P.forEach((p, i) => { const [X, Y] = px(p); gelenke += `<circle cx="${X}" cy="${Y}" r="13" class="vk-gelenk" data-ecke="${i}"/><text x="${X}" y="${Y + 5}" class="vk-buchst">${'ABCD'[i]}</text>`; });
    g.links.innerHTML = `<svg class="vk-brett" viewBox="0 0 ${30 + W * s} ${30 + H * s}" data-s="${s}" style="touch-action:none">
      <rect x="0" y="0" width="${30 + W * s}" height="${30 + H * s}" rx="14" class="vk-holz"/>${punkte}
      ${a.gueltig ? `<polygon points="${P.map(px).join(' ')}" class="vk-flaeche"/>` : ''}${staebe}${marken}${gelenke}</svg>
      <p class="leise">Ziehe die Ecken A, B, C, D. Gleiche Farbe = gleich lange Stäbe. Pfeile = parallele Seiten. Quadrat in der Ecke = rechter Winkel.</p>`;
    return a;
  }

  function haus(a) {
    const b = n => `<span class="vk-haus-k${a.klassen.has(n) ? ' an' : ''}${a.name === n ? ' genau' : ''}">${n === 'Drachenviereck' ? 'Drachen' : n}</span>`;
    return `<div class="vk-haus" aria-label="Haus der Vierecke">
      <div class="vk-dach">${b('Viereck')}</div>
      <div class="vk-stock">${b('Trapez')}${b('Drachenviereck')}</div>
      <div class="vk-stock">${b('Parallelogramm')}</div>
      <div class="vk-stock">${b('Rechteck')}${b('Raute')}</div>
      <div class="vk-stock">${b('Quadrat')}</div>
    </div>`;
  }

  function zeichne() {
    const a = zeichneBrett();
    let text;
    if (!a.gueltig) text = a.ueberschlagen ? '<p class="tb-antwort schlecht">Die Stäbe kreuzen sich – das ist kein richtiges Viereck.</p>' : '<p class="tb-antwort schlecht">Drei Ecken liegen auf einer Linie oder zwei Ecken aufeinander.</p>';
    else {
      const auch = [...a.klassen].filter(n => n !== a.name && n !== 'Viereck');
      text = `<p class="vk-name">Das ist ein <b>${a.name === 'Viereck' ? (a.konvex ? 'allgemeines Viereck' : 'eingedelltes Viereck') : a.name}</b>.</p>
        <p>${EIGENSCHAFT[a.name]}.</p>
        ${auch.length ? `<p class="leise">Es ist auch: ${auch.join(', ')}.</p>` : ''}`;
    }
    let zielText = '';
    if (ziel) {
      const ok = a.gueltig && a.name === ziel;
      zielText = `<div class="vk-ziel${ok ? ' ok' : ''}"><b>Aufgabe:</b> Forme ein <b>${ziel}</b>${['Parallelogramm', 'Trapez', 'Drachenviereck'].includes(ziel) ? ' (kein besonderes)' : ''}.
        ${ok ? '<br>✓ Geschafft!' : ''}</div>`;
      if (ok) g.sprich(`Super! Das ist ein ${ziel}: ${EIGENSCHAFT[ziel]}.`, 'fertig');
    }
    g.rechts.innerHTML = `${zielText}<h2 class="bereich-titel">Was ist es?</h2>${text}<h2 class="bereich-titel">Haus der Vierecke</h2>${haus(a)}
      <p class="leise">Jedes Viereck gehört auch zu allen Vierecken darüber, mit denen es verbunden ist.</p>`;
  }

  function tipp() {
    const a = analysiere(P);
    const t = {
      Quadrat: 'Für ein Quadrat brauchst du 4 gleich lange Stäbe (gleiche Farbe) und rechte Winkel.',
      Rechteck: 'Für ein Rechteck brauchst du überall rechte Winkel. Gegenüberliegende Stäbe sind gleich lang.',
      Raute: 'Für eine Raute brauchst du 4 gleich lange Stäbe – aber die Winkel müssen nicht recht sein. Schiebe ein Quadrat schief.',
      Parallelogramm: 'Gegenüberliegende Seiten müssen parallel sein. Tipp: Gehe von A nach B genauso viele Kästchen wie von D nach C.',
      Drachenviereck: 'Zwei benachbarte Stäbe gleich lang (gleiche Farbe), die anderen zwei auch.',
      Trapez: 'Ein Trapez braucht ein Paar paralleler Seiten. Lege zum Beispiel A–B und D–C beide waagerecht.',
    };
    g.sprich(ziel ? t[ziel] : a.gueltig ? `Verschiebe eine Ecke und beobachte, wann aus dem ${a.name} etwas anderes wird.` : 'Ziehe die Ecken so, dass sich die Stäbe nicht kreuzen.', 'tipp');
  }

  /* Ziehen der Ecken */
  root.addEventListener('pointerdown', e => {
    const c = e.target.closest('[data-ecke]');
    if (!c) return;
    ziehen = Number(c.dataset.ecke);
    e.target.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  root.addEventListener('pointermove', e => {
    if (ziehen === null) return;
    const svg = root.querySelector('.vk-brett');
    const r = svg.getBoundingClientRect(), s = Number(svg.dataset.s);
    const fak = svg.viewBox.baseVal.width / r.width;
    const x = Math.round(((e.clientX - r.left) * fak - 15) / s), y = Math.round(((e.clientY - r.top) * fak - 15) / s);
    const nx = Math.max(0, Math.min(W, x)), ny = Math.max(0, Math.min(H, y));
    if (P[ziehen][0] !== nx || P[ziehen][1] !== ny) { P[ziehen] = [nx, ny]; zeichne(); }
  });
  const ende = () => { ziehen = null; };
  root.addEventListener('pointerup', ende);
  root.addEventListener('pointercancel', ende);

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-vk]');
    if (!b) return;
    if (b.dataset.vk === 'tipp') tipp();
    if (b.dataset.vk === 'neu') { P = wahl(START).map(p => [...p]); ziel = null; zeichne(); g.sprich('Ziehe an den Ecken und forme verschiedene Vierecke.'); }
    if (b.dataset.vk === 'aufgabe') {
      const a = analysiere(P);
      ziel = wahl(NAMEN.slice(0, 6).filter(n => n !== a.name && n !== ziel));
      zeichne(); g.sprich(`Forme ein ${ziel}. Ziehe dazu an den Ecken.`);
    }
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (root.isConnected) zeichne(); }, 150); });
  zeichne();
  g.sprich('Ziehe an den Ecken A, B, C oder D. Rechts siehst du, welches Viereck entsteht.');
  requestAnimationFrame(zeichne);
}

export { ESC };
