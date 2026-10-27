/* Mathematik: Raumvorstellung.
   Würfel kippen: Welche Zahl liegt nach mehreren Kippungen oben? Danach kippt ein 3D-Würfel zur Kontrolle.
   Bauplan: Ein Würfelbau ist zu sehen – trage ein, wie viele Würfel auf jedem Feld stehen.
   Körper erkennen: Körper drehen, benennen, Ecken, Kanten und Flächen zählen. */

import { geruest, zufall, wahl, mischen, warte, antwortHtml, zahlenMerken, zahlFeld, bewegung } from './geruest.js';

/* ---------- Würfel kippen ---------- */
const PFEIL = { r: '→', l: '←', v: '↓', h: '↑' };
const NAME = { r: 'nach rechts', l: 'nach links', v: 'nach vorne', h: 'nach hinten' };

/** Lage: oben, vorne, rechts. Gegenüberliegende Seiten ergeben zusammen 7. */
export function kippe({ o, v, r }, k) {
  if (k === 'r') return { o: 7 - r, v, r: o };
  if (k === 'l') return { o: r, v, r: 7 - o };
  if (k === 'v') return { o: 7 - v, v: o, r };
  return { o: v, v: 7 - o, r };
}

const DREH = { r: [0, 0, 1, 90], l: [0, 0, 1, -90], v: [1, 0, 0, -90], h: [1, 0, 0, 90] };

function augen(n) {
  const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]], 6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]] }[n];
  return `<svg viewBox="0 0 100 100">${P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join('')}</svg>`;
}

/* ---------- Körper ---------- */
function koerper(name) {
  const V = [], F = [];
  const poly = (pts, faces) => { pts.forEach(p => V.push(p)); faces.forEach(f => F.push(f)); };
  if (name === 'Würfel' || name === 'Quader') {
    const [a, b, c] = name === 'Würfel' ? [1, 1, 1] : [1.6, 0.8, 0.9];
    poly([[-a, -b, -c], [a, -b, -c], [a, b, -c], [-a, b, -c], [-a, -b, c], [a, -b, c], [a, b, c], [-a, b, c]],
      [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]);
    return { V, F, ecken: 8, kanten: 12, flaechen: 6 };
  }
  if (name === 'Pyramide') {
    poly([[-1, -1, -0.9], [1, -1, -0.9], [1, 1, -0.9], [-1, 1, -0.9], [0, 0, 1.2]], [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]]);
    return { V, F, ecken: 5, kanten: 8, flaechen: 5 };
  }
  if (name === 'Prisma') {
    poly([[-1.4, -0.9, -0.8], [1.4, -0.9, -0.8], [1.4, 0.9, -0.8], [-1.4, 0.9, -0.8], [-1.4, 0, 0.9], [1.4, 0, 0.9]],
      [[0, 1, 2, 3], [0, 1, 5, 4], [3, 2, 5, 4], [0, 3, 4], [1, 2, 5]]);
    return { V, F, ecken: 6, kanten: 9, flaechen: 5 };
  }
  const n = 32;
  if (name === 'Zylinder' || name === 'Kegel') {
    for (let i = 0; i < n; i++) V.push([Math.cos(i / n * 2 * Math.PI), Math.sin(i / n * 2 * Math.PI), -0.9]);
    if (name === 'Zylinder') {
      for (let i = 0; i < n; i++) V.push([Math.cos(i / n * 2 * Math.PI), Math.sin(i / n * 2 * Math.PI), 0.9]);
      F.push([...Array(n).keys()], [...Array(n).keys()].map(i => i + n));
      for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, (i + 1) % n + n, i + n]);
    } else {
      V.push([0, 0, 1.2]);
      F.push([...Array(n).keys()]);
      for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, n]);
    }
    return { V, F, rund: true };
  }
  // Kugel
  const m = 14;
  for (let a = 0; a <= m; a++) for (let b = 0; b < 2 * m; b++) {
    const t = (a / m) * Math.PI, p = (b / (2 * m)) * 2 * Math.PI;
    V.push([Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)]);
  }
  for (let a = 0; a < m; a++) for (let b = 0; b < 2 * m; b++) {
    const i = a * 2 * m + b, j = a * 2 * m + (b + 1) % (2 * m);
    F.push([i, j, j + 2 * m, i + 2 * m]);
  }
  return { V, F, rund: true };
}

function koerperSvg(k, winkel, kipp = -0.5) {
  const ca = Math.cos(winkel), sa = Math.sin(winkel), cb = Math.cos(kipp), sb = Math.sin(kipp);
  const P = k.V.map(([x, y, z]) => { const x1 = x * ca - y * sa, y1 = x * sa + y * ca; const y2 = y1 * cb - z * sb, z2 = y1 * sb + z * cb; return [x1, y2, z2]; });
  const licht = [0.4, -0.6, 0.7];
  const fl = k.F.map(f => {
    const pts = f.map(i => P[i]);
    const [a, b, c] = pts;
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let nrm = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const len = Math.hypot(...nrm) || 1; nrm = nrm.map(q => q / len);
    const mitte = pts.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map(q => q / pts.length);
    if (nrm[0] * mitte[0] + nrm[1] * mitte[1] + nrm[2] * mitte[2] < 0) nrm = nrm.map(q => -q);
    const hell = 0.55 + 0.45 * Math.abs(nrm[0] * licht[0] + nrm[1] * licht[1] + nrm[2] * licht[2]);
    return { pts, tiefe: mitte[1], hell, vorne: nrm[1] < 0 };
  }).sort((a, b) => b.tiefe - a.tiefe);
  const S = 70, pj = p => `${(110 + p[0] * S).toFixed(1)},${(110 - p[2] * S).toFixed(1)}`;
  const kante = k.rund ? 'none' : '#1b2340';
  return `<svg class="rm-koerper" viewBox="0 0 220 220">${fl.map(f => `<polygon points="${f.pts.map(pj).join(' ')}" fill="hsl(210 75% ${Math.round(40 + f.hell * 35)}%)" stroke="${k.rund ? `hsl(210 75% ${Math.round(40 + f.hell * 35)}%)` : kante}" stroke-width="${k.rund ? 0.8 : 2}" stroke-linejoin="round" fill-opacity="${k.rund ? 1 : 0.8}"/>`).join('')}</svg>`;
}

const KOERPER = ['Würfel', 'Quader', 'Pyramide', 'Prisma', 'Zylinder', 'Kegel', 'Kugel'];
const ANZEIGE = { Pyramide: 'Pyramide', Prisma: 'Prisma (Dreiecksprisma)' };

export function starteRaum(root) {
  let modus = 'kippen';
  let eing = {}, bewertung = null, beschaeftigt = false;
  let lage, folge, antwort, gezeigt;                  // kippen
  let bau, plan;                                      // bauplan
  let kname, winkel, nameWahl;                        // körper

  const g = geruest(root, {
    etikett: 'Raumvorstellung', titel: '',
    reiter: [{ id: 'kippen', titel: 'Würfel kippen' }, { id: 'bauplan', titel: 'Bauplan', unter: 'Würfel zählen' }, { id: 'koerper', titel: 'Körper erkennen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-rm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-rm="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; ['rm-e', 'rm-k', 'rm-f', 'rm-n'].forEach(k => (eing[k] = ''));
    if (modus === 'kippen') {
      const o = zufall(1, 6); let v; do { v = zufall(1, 6); } while (v === o || v === 7 - o);
      const r = wahl([1, 2, 3, 4, 5, 6].filter(x => x !== o && x !== 7 - o && x !== v && x !== 7 - v));
      lage = { o, v, r }; folge = Array.from({ length: zufall(2, 4) }, () => wahl(['r', 'l', 'v', 'h'])); antwort = null; gezeigt = false;
    }
    if (modus === 'bauplan') {
      do { bau = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => (Math.random() < 0.65 ? zufall(1, 3) : 0))); }
      while (bau.flat().filter(Boolean).length < 4);
      // Türme hinten höher als vorne, damit nichts völlig verdeckt ist
      for (let x = 0; x < 3; x++) for (let y = 1; y < 3; y++) if (bau[y][x] < bau[y - 1][x] && Math.random() < 0.5) [bau[y][x], bau[y - 1][x]] = [bau[y - 1][x], bau[y][x]];
      plan = Array.from({ length: 3 }, () => Array(3).fill(0));
    }
    if (modus === 'koerper') { let k; do { k = wahl(KOERPER); } while (k === kname); kname = k; winkel = 0.6; nameWahl = null; }
  }

  /* ----- Würfel kippen ----- */
  function wuerfel3d(l) {
    // Seiten: oben, vorne, rechts, unten, hinten, links
    const s = { oben: l.o, vorne: l.v, rechts: l.r, unten: 7 - l.o, hinten: 7 - l.v, links: 7 - l.r };
    return `<div class="rm-szene"><div class="rm-wuerfel" id="rm-wuerfel">
      ${Object.entries(s).map(([k, n]) => `<div class="rm-seite rm-${k}">${augen(n)}</div>`).join('')}</div></div>`;
  }

  function kippenLinks() {
    return `${wuerfel3d(lage)}
      <div class="rm-folge">${folge.map((k, i) => `<span class="rm-pfeil" data-schritt="${i}" title="${NAME[k]}">${PFEIL[k]}</span>`).join('')}</div>
      <p class="leise">Pfeile: → rechts, ← links, ↓ nach vorne (zu dir), ↑ nach hinten. Gegenüberliegende Seiten ergeben immer 7.</p>
      ${antwort !== null ? `<div class="gs-pruef"><button type="button" class="kn-gross" data-rm="zeigen">▶ Kippen zeigen</button></div>` : ''}`;
  }

  async function kippenZeigen() {
    if (beschaeftigt) return;
    beschaeftigt = true;
    g.links.innerHTML = kippenLinks();
    const w = root.querySelector('#rm-wuerfel');
    let l = lage;
    for (let i = 0; i < folge.length; i++) {
      root.querySelectorAll('.rm-pfeil').forEach((p, j) => p.classList.toggle('jetzt', j === i));
      if (bewegung()) {
        const [x, y, z, a] = DREH[folge[i]];
        await w.animate([{ transform: 'rotateX(-24deg) rotateY(-32deg)' }, { transform: `rotateX(-24deg) rotateY(-32deg) rotate3d(${x}, ${y}, ${z}, ${a}deg)` }],
          { duration: 700, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
      }
      l = kippe(l, folge[i]);
      const s = { oben: l.o, vorne: l.v, rechts: l.r, unten: 7 - l.o, hinten: 7 - l.v, links: 7 - l.r };
      Object.entries(s).forEach(([k, n]) => { w.querySelector(`.rm-${k}`).innerHTML = augen(n); });
      w.getAnimations().forEach(an => an.cancel());
      await warte(250);
    }
    gezeigt = true; beschaeftigt = false;
    g.sprich(`Oben liegt jetzt die ${l.o}.`, antwort === l.o ? 'fertig' : 'tipp');
  }

  /* ----- Bauplan ----- */
  function bauSvg() {
    const S = 40, K = 0.5 * Math.SQRT1_2, N = 3;
    const W = N * S + N * S * K + 60, H = 3 * S + N * S * K + 40;
    const P = (x, y, z) => [20 + x * S + y * S * K, H - 20 - z * S - y * S * K];
    const pt = q => q.join(',');
    let s = `<polygon points="${[P(0, 0, 0), P(N, 0, 0), P(N, N, 0), P(0, N, 0)].map(pt).join(' ')}" class="av-platte"/>`;
    for (let y = N - 1; y >= 0; y--) for (let x = 0; x < N; x++) for (let z = 0; z < bau[y][x]; z++) {
      const v = [P(x, y, z), P(x + 1, y, z), P(x + 1, y, z + 1), P(x, y, z + 1)], o = [P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], r = [P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)];
      s += `<polygon points="${v.map(pt).join(' ')}" class="av-v"/><polygon points="${o.map(pt).join(' ')}" class="av-o"/><polygon points="${r.map(pt).join(' ')}" class="av-r"/>`;
    }
    return `<svg class="av-bau" viewBox="0 0 ${W} ${H}">${s}<text x="${P(1.5, 0, 0)[0]}" y="${H - 2}" class="av-seite">vorne</text></svg>`;
  }

  function planHtml() {
    let h = '';
    for (let y = 2; y >= 0; y--) for (let x = 0; x < 3; x++) {
      const falsch = bewertung && !bewertung.ok && plan[y][x] !== bau[y][x];
      h += `<button type="button" class="rm-feld${plan[y][x] ? ' belegt' : ''}${falsch ? ' falsch' : ''}" data-feld="${x},${y}">${plan[y][x]}</button>`;
    }
    return `<div class="rm-plan">${h}</div><p class="leise rm-planvorne">vorne</p>`;
  }

  /* ----- Körper ----- */
  function koerperLinks() {
    return `<div class="rm-kbuehne">${koerperSvg(koerper(kname), winkel)}</div>
      <label class="bs-regler"><span>Drehen</span><input type="range" min="0" max="628" value="${Math.round(winkel * 100)}" data-drehen></label>`;
  }

  function koerperRechts() {
    const k = koerper(kname);
    const optionen = KOERPER.filter(n => n !== 'Quader' || kname !== 'Würfel');
    let h = `<h2 class="bereich-titel">Wie heißt der Körper?</h2>
      <div class="rm-namen">${optionen.map(n => `<button type="button" class="kn-gross${nameWahl === n ? (n === kname ? ' richtig' : ' falsch') : ''}" data-name="${n}">${ANZEIGE[n] || n}</button>`).join('')}</div>`;
    if (nameWahl === kname && !k.rund) {
      h += `<h3 class="eh-zwischen">Zähle</h3>
        <p class="ut-frage rm-zaehl">Ecken ${zahlFeld('rm-e', eing['rm-e'], 2, 'Ecken')} Kanten ${zahlFeld('rm-k', eing['rm-k'], 2, 'Kanten')} Flächen ${zahlFeld('rm-f', eing['rm-f'], 2, 'Flächen')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-rm="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Drehe den Körper, um auch die Rückseite zu sehen.</p>`;
    } else if (nameWahl === kname) {
      h += `<p class="tb-antwort gut">Richtig – ${kname === 'Kugel' ? 'die Kugel hat keine Ecken und keine Kanten, nur eine gekrümmte Fläche.' : kname === 'Zylinder' ? 'der Zylinder hat zwei Kreisflächen und eine gekrümmte Mantelfläche.' : 'der Kegel hat eine Kreisfläche, eine gekrümmte Mantelfläche und eine Spitze.'}</p>`;
    }
    return h;
  }

  function links() {
    if (modus === 'kippen') return kippenLinks();
    if (modus === 'bauplan') return bauSvg();
    return koerperLinks();
  }

  function rechts() {
    if (modus === 'kippen') {
      return `<h2 class="bereich-titel">Welche Zahl liegt am Ende oben?</h2>
        <p>Der Würfel kippt ${folge.map(k => NAME[k]).join(', dann ')}.</p>
        <div class="rm-zahlen">${[1, 2, 3, 4, 5, 6].map(n => `<button type="button" class="rm-z${antwort === n ? (gezeigt ? (n === folge.reduce(kippe, lage).o ? ' richtig' : ' falsch') : ' gewaehlt') : ''}" data-zahl-w="${n}">${augen(n)}</button>`).join('')}</div>
        ${antwortHtml(bewertung)}`;
    }
    if (modus === 'bauplan') {
      return `<h2 class="bereich-titel">Bauplan von oben</h2>
        <p>Tippe auf ein Feld, um die Zahl der Würfel zu erhöhen (nach 3 kommt wieder 0).</p>${planHtml()}
        <p class="ut-frage">Würfel insgesamt: ${zahlFeld('rm-n', eing['rm-n'], 2, 'Anzahl')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-rm="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    return koerperRechts();
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ kippen: 'Würfel kippen', bauplan: 'Bauplan zeichnen', koerper: 'Körper erkennen' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('input', e => {
    if (e.target.matches('[data-drehen]')) { winkel = Number(e.target.value) / 100; root.querySelector('.rm-kbuehne').innerHTML = koerperSvg(koerper(kname), winkel); }
  });

  root.addEventListener('click', async e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const z = e.target.closest('[data-zahl-w]');
    if (z && !gezeigt) {
      antwort = Number(z.dataset.zahlW);
      const soll = folge.reduce(kippe, lage).o;
      bewertung = antwort === soll ? { ok: true, text: 'Richtig gedacht! Schau dir das Kippen zur Kontrolle an.' } : { ok: false, text: 'Schau dir an, wie der Würfel kippt.' };
      zeichne(); await kippenZeigen(); g.rechts.innerHTML = rechts(); return;
    }
    const f = e.target.closest('[data-feld]');
    if (f) { const [x, y] = f.dataset.feld.split(',').map(Number); plan[y][x] = (plan[y][x] + 1) % 4; bewertung = null; g.rechts.innerHTML = rechts(); return; }
    const n = e.target.closest('[data-name]');
    if (n) { nameWahl = n.dataset.name; if (nameWahl === kname) g.sprich(`Richtig, das ist ${kname === 'Kugel' ? 'eine' : kname === 'Pyramide' ? 'eine' : 'ein'} ${ANZEIGE[kname] || kname}.`, 'fertig'); else g.sprich('Drehe den Körper und schau ihn dir von allen Seiten an.', 'tipp'); g.rechts.innerHTML = rechts(); return; }
    const b = e.target.closest('[data-rm]');
    if (!b) return;
    const was = b.dataset.rm;
    if (was === 'neu') { neu(); zeichne(); start(); }
    if (was === 'zeigen') { await kippenZeigen(); }
    if (was === 'pruefen') {
      if (modus === 'bauplan') {
        const ok = plan.every((r, y) => r.every((v, x) => v === bau[y][x])), summe = bau.flat().reduce((a, c) => a + c, 0);
        const okN = Number(eing['rm-n']) === summe;
        bewertung = ok && okN ? { ok: true, text: `Richtig! Der Bau hat ${summe} Würfel.` } : { ok: false, text: !ok ? 'Rot markierte Felder stimmen noch nicht. Denke an verdeckte Würfel hinten!' : 'Der Bauplan stimmt – zähle jetzt alle Zahlen zusammen.' };
      }
      if (modus === 'koerper') {
        const k = koerper(kname);
        const ok = Number(eing['rm-e']) === k.ecken && Number(eing['rm-k']) === k.kanten && Number(eing['rm-f']) === k.flaechen;
        bewertung = ok ? { ok, text: `Richtig: ${k.ecken} Ecken, ${k.kanten} Kanten, ${k.flaechen} Flächen. Probe: Ecken + Flächen − Kanten = ${k.ecken + k.flaechen - k.kanten}` } : { ok, text: 'Noch nicht. Drehe den Körper und zähle in Ruhe – auch die Rückseite.' };
      }
      if (bewertung.ok) g.sprich('Super!', 'fertig');
      g.rechts.innerHTML = rechts();
    }
    if (was === 'tipp') g.sprich({ kippen: 'Kippt der Würfel nach rechts, kommt die linke Seite nach oben. Die linke Seite ist 7 minus rechte Seite.', bauplan: 'Schau von oben auf jedes Feld: Wie hoch ist der Turm? Hinter hohen Türmen können Würfel versteckt sein.', koerper: 'Ecken sind Spitzen, Kanten sind Linien, wo zwei Flächen zusammenstoßen.' }[modus], 'tipp');
  });

  function start() { g.sprich({ kippen: 'Stell dir vor, wie der Würfel kippt. Welche Zahl liegt am Ende oben?', bauplan: 'Wie viele Würfel stehen auf jedem Feld? Trage es in den Bauplan ein.', koerper: 'Drehe den Körper mit dem Regler. Wie heißt er?' }[modus]); }
  neu(); zeichne(); start();
}
