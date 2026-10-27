/* Mathematik: Würfelbauten von allen Seiten.
   Ein Bau aus Würfeln steht auf einer Platte (3 × 3). Er kann gedreht werden.
   Frage: Wie sieht der Bau von vorne, rechts, hinten, links oder oben aus? */

import { geruest, zufall, wahl, mischen, antwortHtml } from './geruest.js';

const N = 3;
const SEITEN = ['vorne', 'rechts', 'hinten', 'links'];
const S = 40, K = 0.5 * Math.SQRT1_2;

/** h[y][x]: Höhe auf Feld x (links→rechts), y (vorne→hinten). */
function zufallsBau() {
  let h;
  do {
    h = Array.from({ length: N }, () => Array.from({ length: N }, () => (Math.random() < 0.6 ? zufall(1, 3) : 0)));
  } while (h.flat().filter(Boolean).length < 4 || h.flat().reduce((a, b) => a + b) > 14);
  return h;
}

/** Bau im Uhrzeigersinn (von oben gesehen) drehen: die rechte Seite kommt nach vorne. */
function drehe(h) {
  const r = Array.from({ length: N }, () => Array(N).fill(0));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) r[N - 1 - x][y] = h[y][x];
  return r;
}

/** Ansicht als Liste von Spaltenhöhen (links → rechts im Bild) bzw. Draufsicht als Raster. */
export function ansicht(h, seite) {
  let g = h;
  const k = { vorne: 0, rechts: 1, hinten: 2, links: 3 }[seite];
  if (seite === 'oben') return h.map(z => z.map(v => (v > 0 ? 1 : 0)));
  for (let i = 0; i < k; i++) g = drehe(g);
  return Array.from({ length: N }, (_, x) => Math.max(...g.map(z => z[x])));
}

function ansichtSvg(v, oben = false) {
  const q = 26;
  let s = '';
  if (oben) {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) s += `<rect x="${6 + x * q}" y="${6 + (N - 1 - y) * q}" width="${q}" height="${q}" class="${v[y][x] ? 'av-voll' : 'av-leer'}"/>`;
    return `<svg class="av-svg" viewBox="0 0 ${N * q + 12} ${N * q + 12}">${s}</svg>`;
  }
  const H = 3;
  for (let x = 0; x < N; x++) for (let z = 0; z < H; z++) s += `<rect x="${6 + x * q}" y="${6 + (H - 1 - z) * q}" width="${q}" height="${q}" class="${z < v[x] ? 'av-voll' : 'av-leer'}"/>`;
  return `<svg class="av-svg" viewBox="0 0 ${N * q + 12} ${H * q + 12}">${s}<line x1="2" y1="${H * q + 7}" x2="${N * q + 10}" y2="${H * q + 7}" class="av-boden"/></svg>`;
}

export function starteAnsichten(root) {
  let bau, dreh, frage, optionen, wahlI, bewertung;

  const g = geruest(root, {
    etikett: 'Würfelbauten', titel: '',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-av="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-av="neu">＋ Neuer Bau</button>`,
  });

  function neu() {
    bau = zufallsBau(); dreh = 0; wahlI = null; bewertung = null;
    frage = wahl(['vorne', 'rechts', 'hinten', 'links', 'oben']);
    const richtig = ansicht(bau, frage);
    const key = v => JSON.stringify(v);
    const kandidaten = (frage === 'oben'
      ? [ansicht(bau, 'oben').map(z => [...z].reverse()), ansicht(bau, 'oben').slice().reverse(), ansicht(drehe(bau), 'oben')]
      : ['vorne', 'rechts', 'hinten', 'links'].filter(s => s !== frage).map(s => ansicht(bau, s)).concat([richtig.map((v, i) => (i === 1 ? Math.min(3, v + 1) : v)), [...richtig].reverse()]));
    const opt = [richtig];
    for (const k of mischen(kandidaten)) if (opt.length < 4 && !opt.some(o => key(o) === key(k))) opt.push(k);
    if (opt.length < 3) { neu(); return; }
    optionen = mischen(opt.map(v => ({ v, ok: key(v) === key(richtig) })));
  }

  function bauSvg() {
    let h = bau;
    for (let i = 0; i < dreh; i++) h = drehe(h);
    const W = N * S + N * S * K + 170, H = 3 * S + N * S * K + 110;
    const P = (x, y, z) => [85 + x * S + y * S * K, H - 50 - z * S - y * S * K];
    const pt = q => q.join(',');
    // Platte
    const platte = [P(0, 0, 0), P(N, 0, 0), P(N, N, 0), P(0, N, 0)];
    let s = `<polygon points="${platte.map(pt).join(' ')}" class="av-platte"/>`;
    for (let i = 1; i < N; i++) s += `<line x1="${P(i, 0, 0)[0]}" y1="${P(i, 0, 0)[1]}" x2="${P(i, N, 0)[0]}" y2="${P(i, N, 0)[1]}" class="av-fuge"/><line x1="${P(0, i, 0)[0]}" y1="${P(0, i, 0)[1]}" x2="${P(N, i, 0)[0]}" y2="${P(N, i, 0)[1]}" class="av-fuge"/>`;
    // Würfel von hinten nach vorn, unten nach oben, links nach rechts
    for (let y = N - 1; y >= 0; y--) for (let x = 0; x < N; x++) for (let z = 0; z < h[y][x]; z++) {
      const vorne = [P(x, y, z), P(x + 1, y, z), P(x + 1, y, z + 1), P(x, y, z + 1)];
      const oben = [P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)];
      const rechts = [P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)];
      s += `<g class="av-w"><polygon points="${vorne.map(pt).join(' ')}" class="av-v"/><polygon points="${oben.map(pt).join(' ')}" class="av-o"/><polygon points="${rechts.map(pt).join(' ')}" class="av-r"/></g>`;
    }
    // Beschriftung der Seiten (dreht mit)
    const name = p => SEITEN[(p + dreh) % 4];
    const [vx, vy] = P(N / 2, 0, 0), [rx, ry] = P(N, N / 2, 0), [hx, hy] = P(N / 2, N, 0), [lx, ly] = P(0, N / 2, 0);
    s += `<text x="${vx}" y="${vy + 26}" class="av-seite${name(0) === frage ? ' gefragt' : ''}">${name(0)}</text>
      <text x="${rx + 12}" y="${ry + 8}" class="av-seite links${name(1) === frage ? ' gefragt' : ''}">${name(1)}</text>
      <text x="${hx}" y="${hy - 6}" class="av-seite${name(2) === frage ? ' gefragt' : ''}">${name(2)}</text>
      <text x="${lx - 10}" y="${ly + 8}" class="av-seite rechts${name(3) === frage ? ' gefragt' : ''}">${name(3)}</text>`;
    return `<svg class="av-bau" viewBox="0 0 ${W} ${H}" role="img" aria-label="Würfelbau">${s}</svg>`;
  }

  function links() {
    return `<div class="av-buehne">${bauSvg()}</div>
      <div class="fl-knoepfe">
        <button type="button" class="kn-gross" data-av="links">⟲ Drehen</button>
        <button type="button" class="kn-gross" data-av="rechts">Drehen ⟳</button>
      </div>
      <p class="leise">Drehe den Bau. Die Beschriftung auf der Platte dreht mit.</p>`;
  }

  function rechts() {
    return `<h2 class="bereich-titel">So sieht der Bau von <span class="av-frage">${frage}</span> aus:</h2>
      <p class="leise">${frage === 'oben' ? 'Von oben siehst du nur, welche Felder belegt sind. Vorne ist unten im Bild.' : `Stell dich in Gedanken auf die Seite „${frage}“ und schau auf den Bau.`}</p>
      <div class="av-optionen">${optionen.map((o, i) => `<button type="button" class="av-option${wahlI === i ? (o.ok ? ' richtig' : ' falsch') : ''}${bewertung && o.ok ? ' richtig' : ''}" data-opt="${i}" aria-label="Ansicht ${i + 1}">${ansichtSvg(o.v, frage === 'oben')}</button>`).join('')}</div>
      ${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.titel('Würfelbauten von allen Seiten');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    const o = e.target.closest('[data-opt]');
    if (o && !bewertung?.ok) {
      wahlI = Number(o.dataset.opt);
      const ok = optionen[wahlI].ok;
      bewertung = ok ? { ok, text: 'Richtig!' } : { ok, text: frage === 'oben' ? 'Nicht ganz. Achte darauf, wo vorne ist.' : `Nicht ganz. Drehe den Bau so, dass „${frage}“ vorne steht – dann siehst du die Ansicht direkt.` };
      if (ok) g.sprich(`Genau so sieht der Bau von ${frage} aus.`, 'fertig');
      g.rechts.innerHTML = rechts();
      if (ok) bewertung = { ok: true, text: 'Richtig!' };
      return;
    }
    const b = e.target.closest('[data-av]');
    if (!b) return;
    if (b.dataset.av === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.av === 'rechts') { dreh = (dreh + 1) % 4; g.links.innerHTML = links(); }
    if (b.dataset.av === 'links') { dreh = (dreh + 3) % 4; g.links.innerHTML = links(); }
    if (b.dataset.av === 'tipp') g.sprich(frage === 'oben' ? 'Zähle von oben: Auf welchen Feldern steht mindestens ein Würfel?' : `Drehe den Bau, bis „${frage}“ vorne auf der Platte steht. Was du dann von vorne siehst, ist die gesuchte Ansicht. Hohe Türme verdecken die dahinter.`, 'tipp');
  });

  function startText() { g.sprich('Schau dir den Würfelbau genau an. Welches Bild zeigt ihn von der gefragten Seite?'); }

  neu(); zeichne(); startText();
}
