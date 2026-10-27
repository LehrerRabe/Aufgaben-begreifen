/* Mathematik: Besondere Dreiecke, parallel und senkrecht.
   Dreiecke formen: Ecken frei ziehen. Gleich lange Seiten bekommen dieselbe Farbe, rechte Winkel ein Winkelzeichen.
   Parallel und senkrecht: Zwei Geraden, eine davon beweglich. Ein Geodreieck kann angelegt werden. */

import { geruest, wahl, antwortHtml } from './geruest.js';

const W = 12, H = 9, S = 50;           // Zeichenfläche in cm (1 Kästchen = 1 cm)
const TOL_L = 0.015, TOL_W = 2;        // Toleranz: 1,5 % Länge, 2° Winkel
const FARBEN = ['#e0262b', '#2f6fe4', '#1f9d55'];

const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const winkelBei = (a, b, c) => { const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]]; return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))) * 180 / Math.PI; };
const gleich = (x, y) => Math.abs(x - y) <= TOL_L * Math.max(x, y);

/** Einordnung eines Dreiecks (mit Toleranz, weil frei gezogen wird). */
export function dreieckArt(P) {
  const l = [d(P[1], P[2]), d(P[2], P[0]), d(P[0], P[1])];           // Seite gegenüber Ecke i
  const w = [winkelBei(P[2], P[0], P[1]), winkelBei(P[0], P[1], P[2]), winkelBei(P[1], P[2], P[0])];
  const flaeche = Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])) / 2;
  const paare = [[0, 1], [1, 2], [0, 2]].filter(([i, j]) => gleich(l[i], l[j]));
  const gleichseitig = paare.length >= 2;
  const gleichschenklig = paare.length >= 1;
  const recht = w.findIndex(x => Math.abs(x - 90) <= TOL_W);
  let name = 'allgemeines Dreieck';
  if (gleichseitig) name = 'gleichseitiges Dreieck';
  else if (gleichschenklig && recht >= 0) name = 'gleichschenklig-rechtwinkliges Dreieck';
  else if (gleichschenklig) name = 'gleichschenkliges Dreieck';
  else if (recht >= 0) name = 'rechtwinkliges Dreieck';
  return { l, w, paare, gleichseitig, gleichschenklig, recht, name, gueltig: flaeche > 0.5 };
}

const ZIELE = ['gleichschenkliges Dreieck', 'gleichseitiges Dreieck', 'rechtwinkliges Dreieck', 'gleichschenklig-rechtwinkliges Dreieck'];

export function starteDreiecke(root) {
  let modus = 'dreieck';
  let P, ziel = null, ziehen = null;
  let g1, g2, geo, aufgabe, bewertung = null;   // parallel/senkrecht

  const g = geruest(root, {
    etikett: 'Dreiecke und Geraden', titel: '',
    reiter: [{ id: 'dreieck', titel: 'Dreiecke formen' }, { id: 'lage', titel: 'Parallel und senkrecht' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-dr="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross" data-dr="aufgabe">🎯 Aufgabe</button>
      <button type="button" class="kn-gross kn-leise" data-dr="neu">↺ Neu</button>`,
  });

  function neu() {
    ziel = null; bewertung = null;
    if (modus === 'dreieck') P = [[2, 7.5], [9.5, 7], [5, 1.5]];
    else {
      const w = Math.random() * Math.PI;
      const c = [6, 4.5];
      g1 = [[c[0] - Math.cos(w) * 5, c[1] - Math.sin(w) * 3.5], [c[0] + Math.cos(w) * 5, c[1] + Math.sin(w) * 3.5]];
      g2 = [[2, 8], [10, 6.5]];
      geo = false; aufgabe = wahl(['parallel', 'senkrecht']);
    }
  }

  const px = p => [20 + p[0] * S, 20 + p[1] * S];

  function gitter() {
    let s = '';
    for (let x = 0; x <= W; x++) s += `<line x1="${px([x, 0])[0]}" y1="20" x2="${px([x, 0])[0]}" y2="${px([0, H])[1]}" class="dr-gitter"/>`;
    for (let y = 0; y <= H; y++) s += `<line x1="20" y1="${px([0, y])[1]}" x2="${px([W, 0])[0]}" y2="${px([0, y])[1]}" class="dr-gitter"/>`;
    return s;
  }

  function dreieckSvg() {
    const a = dreieckArt(P);
    const farbe = i => { const pr = a.paare.find(p => p.includes(i)); return pr ? (a.gleichseitig ? FARBEN[0] : FARBEN[1]) : '#1b2340'; };
    let s = `<polygon points="${P.map(p => px(p).join(',')).join(' ')}" class="dr-flaeche"/>`;
    // Seite i liegt gegenüber Ecke i: von P[i+1] nach P[i+2]
    for (let i = 0; i < 3; i++) {
      const [p, q] = [px(P[(i + 1) % 3]), px(P[(i + 2) % 3])];
      s += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${farbe(i)}" class="dr-seite${a.paare.some(pr => pr.includes(i)) ? ' gleich' : ''}"/>
        <text x="${(p[0] + q[0]) / 2}" y="${(p[1] + q[1]) / 2 - 8}" class="dr-mass">${a.l[i].toFixed(1).replace('.', ',')} cm</text>`;
    }
    if (a.recht >= 0) {
      const b = P[a.recht], u = P[(a.recht + 1) % 3], v = P[(a.recht + 2) % 3];
      const e = (q) => { const n = d(q, b); return [(q[0] - b[0]) / n * 0.5, (q[1] - b[1]) / n * 0.5]; };
      const eu = e(u), ev = e(v);
      const pts = [[b[0] + eu[0], b[1] + eu[1]], [b[0] + eu[0] + ev[0], b[1] + eu[1] + ev[1]], [b[0] + ev[0], b[1] + ev[1]]].map(q => px(q).join(','));
      s += `<polyline points="${pts.join(' ')}" class="vk-winkel"/>`;
    }
    P.forEach((p, i) => { const [x, y] = px(p); s += `<circle cx="${x}" cy="${y}" r="13" class="vk-gelenk" data-ecke="${i}"/><text x="${x}" y="${y + 5}" class="vk-buchst">${'ABC'[i]}</text>`; });
    return { svg: `<svg class="dr-svg" viewBox="0 0 ${40 + W * S} ${40 + H * S}" style="touch-action:none"><rect width="${40 + W * S}" height="${40 + H * S}" rx="14" class="dr-papier"/>${gitter()}${s}</svg>`, a };
  }

  function richtung(gg) { return Math.atan2(gg[1][1] - gg[0][1], gg[1][0] - gg[0][0]) * 180 / Math.PI; }
  function lageWinkel() { let x = Math.abs(richtung(g1) - richtung(g2)) % 180; if (x > 90) x = 180 - x; return x; }

  function lageSvg() {
    const verl = (gg, k) => { const [a, b] = gg, dx = b[0] - a[0], dy = b[1] - a[1]; return [[a[0] - dx * k, a[1] - dy * k], [b[0] + dx * k, b[1] + dy * k]]; };
    const line = (gg, cls) => { const [a, b] = verl(gg, 0.6).map(px); return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}"/>`; };
    let s = line(g1, 'dr-gerade g') + line(g2, 'dr-gerade h');
    const w = lageWinkel();
    if (geo) {
      // Geodreieck: lange Seite auf g, Mitte am Mittelpunkt von g
      const m = px([(g1[0][0] + g1[1][0]) / 2, (g1[0][1] + g1[1][1]) / 2]), r = richtung(g1);
      let hilf = '';
      for (let k = 1; k <= 5; k++) hilf += `<line x1="${-150 + k * 25}" y1="${-k * 25}" x2="${150 - k * 25}" y2="${-k * 25}" class="dr-geo-hilf"/>`;
      s += `<g transform="translate(${m[0]} ${m[1]}) rotate(${r})" class="dr-geo">
        <path d="M-160 0 L160 0 L0 -160 Z" class="dr-geo-koerper"/>${hilf}
        <line x1="0" y1="0" x2="0" y2="-160" class="dr-geo-mitte"/>
        ${Array.from({ length: 13 }, (_, i) => `<line x1="${(i - 6) * 25}" y1="0" x2="${(i - 6) * 25}" y2="-8" class="dr-geo-hilf"/>`).join('')}</g>`;
    }
    [g2[0], g2[1]].forEach((p, i) => { const [x, y] = px(p); s += `<circle cx="${x}" cy="${y}" r="13" class="vk-gelenk" data-punkt="${i}"/>`; });
    return { svg: `<svg class="dr-svg" viewBox="0 0 ${40 + W * S} ${40 + H * S}" style="touch-action:none"><rect width="${40 + W * S}" height="${40 + H * S}" rx="14" class="dr-papier"/>${gitter()}${s}
      <text x="${px(g1[1])[0] + 10}" y="${px(g1[1])[1]}" class="dr-name g">g</text><text x="${px(g2[1])[0] + 10}" y="${px(g2[1])[1]}" class="dr-name h">h</text></svg>`, w };
  }

  function zeichne() {
    g.reiter(modus);
    if (modus === 'dreieck') {
      const { svg, a } = dreieckSvg();
      g.titel('Besondere Dreiecke');
      g.links.innerHTML = `${svg}<p class="leise">Ziehe die Ecken A, B, C. Gleich lange Seiten werden farbig (Toleranz ±1,5 %). Das Winkelzeichen erscheint bei einem rechten Winkel (±2°).</p>`;
      const auch = [a.gleichschenklig && !a.gleichseitig ? 'gleichschenklig' : null, a.recht >= 0 ? `rechtwinklig (bei ${'ABC'[a.recht]})` : null].filter(Boolean);
      let zt = '';
      if (ziel) { const ok = a.gueltig && a.name === ziel; zt = `<div class="vk-ziel${ok ? ' ok' : ''}"><b>Aufgabe:</b> Forme ein ${ziel}.${ok ? '<br>✓ Geschafft!' : ''}</div>`; if (ok) g.sprich(`Super – ein ${ziel}!`, 'fertig'); }
      g.rechts.innerHTML = `${zt}<h2 class="bereich-titel">Was ist es?</h2><p class="vk-name">Ein <b>${a.name}</b>.</p>
        ${auch.length && a.name === 'gleichschenklig-rechtwinkliges Dreieck' ? '' : auch.length ? `<p class="leise">Es ist ${auch.join(' und ')}.</p>` : ''}
        <ul class="sg-merke"><li><b>gleichschenklig:</b> 2 Seiten gleich lang</li><li><b>gleichseitig:</b> alle 3 Seiten gleich lang</li><li><b>rechtwinklig:</b> ein rechter Winkel</li></ul>`;
    } else {
      const { svg, w } = lageSvg();
      g.titel('Parallel und senkrecht');
      const rel = w <= TOL_W ? 'parallel' : Math.abs(w - 90) <= TOL_W ? 'senkrecht' : null;
      g.links.innerHTML = `${svg}<div class="gs-pruef"><button type="button" class="kn-gross" data-dr="geo">${geo ? 'Geodreieck wegnehmen' : '📐 Geodreieck an g anlegen'}</button></div>
        <p class="leise">Ziehe die Punkte der roten Geraden h. Das Geodreieck liegt mit der langen Seite auf g: Seine Mittellinie ist senkrecht zu g, die Hilfslinien sind parallel zu g.</p>`;
      const ok = rel === aufgabe;
      g.rechts.innerHTML = `<div class="vk-ziel${ok ? ' ok' : ''}"><b>Aufgabe:</b> Lege h <b>${aufgabe}</b> zu g.${ok ? '<br>✓ Geschafft!' : ''}</div>
        <h2 class="bereich-titel">Wie liegen g und h?</h2>
        <p class="vk-name">${rel === 'parallel' ? 'g ∥ h – <b>parallel</b>' : rel === 'senkrecht' ? 'g ⊥ h – <b>senkrecht</b>' : 'weder parallel noch senkrecht'}</p>
        <ul class="sg-merke"><li><b>parallel:</b> überall gleicher Abstand, sie schneiden sich nie</li><li><b>senkrecht:</b> sie schneiden sich im rechten Winkel</li></ul>${antwortHtml(bewertung)}`;
      if (ok) g.sprich(aufgabe === 'parallel' ? 'h ist parallel zu g – sie haben überall den gleichen Abstand.' : 'h ist senkrecht zu g – sie bilden einen rechten Winkel.', 'fertig');
    }
  }

  /* Ziehen (frei, auf 0,1 cm gerundet) */
  root.addEventListener('pointerdown', e => {
    const c = e.target.closest('[data-ecke],[data-punkt]');
    if (!c) return;
    ziehen = c.dataset.ecke !== undefined ? ['ecke', Number(c.dataset.ecke)] : ['punkt', Number(c.dataset.punkt)];
    e.preventDefault();
  });
  window.addEventListener('pointerup', () => { ziehen = null; });
  root.addEventListener('pointermove', e => {
    if (!ziehen) return;
    const svg = root.querySelector('.dr-svg'); if (!svg) return;
    const r = svg.getBoundingClientRect(), fak = svg.viewBox.baseVal.width / r.width;
    let x = ((e.clientX - r.left) * fak - 20) / S, y = ((e.clientY - r.top) * fak - 20) / S;
    x = Math.max(0, Math.min(W, Math.round(x * 10) / 10)); y = Math.max(0, Math.min(H, Math.round(y * 10) / 10));
    if (ziehen[0] === 'ecke') P[ziehen[1]] = [x, y]; else g2[ziehen[1]] = [x, y];
    zeichne();
  });

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const b = e.target.closest('[data-dr]');
    if (!b) return;
    const was = b.dataset.dr;
    if (was === 'neu') { neu(); zeichne(); start(); }
    if (was === 'geo') { geo = !geo; zeichne(); }
    if (was === 'aufgabe') {
      if (modus === 'dreieck') { ziel = wahl(ZIELE.filter(z => z !== ziel)); zeichne(); g.sprich(`Forme ein ${ziel}.`); }
      else { aufgabe = aufgabe === 'parallel' ? 'senkrecht' : 'parallel'; zeichne(); g.sprich(`Lege h ${aufgabe} zu g.`); }
    }
    if (was === 'tipp') g.sprich(modus === 'dreieck'
      ? ({ 'gleichseitiges Dreieck': 'Alle drei Seiten müssen gleich lang sein. Schau auf die Zentimeterangaben.', 'rechtwinkliges Dreieck': 'Lege zwei Seiten an die Kästchenlinien – eine waagerecht, eine senkrecht.', 'gleichschenkliges Dreieck': 'Zwei Seiten gleich lang: Lege C genau über die Mitte von A und B.', 'gleichschenklig-rechtwinkliges Dreieck': 'Zwei Seiten an die Kästchenlinien, beide gleich viele Kästchen lang.' }[ziel] || 'Ziehe an den Ecken und beobachte die Farben und Zahlen.')
      : 'Lege das Geodreieck an g. Für senkrecht: h entlang der Mittellinie. Für parallel: h entlang einer Hilfslinie.', 'tipp');
  });

  function start() { g.sprich(modus === 'dreieck' ? 'Ziehe an den Ecken. Rechts steht, was für ein Dreieck entsteht.' : `Lege die rote Gerade h ${aufgabe} zur blauen Geraden g.`); }
  neu(); zeichne(); start();
}
