/* Mathematik: Brüche erweitern und kürzen – mit Messer und Kleber.
   1. Anteil ablesen (Bild → Bruch) oder einen Bruch einfärben (Bruch → Bild).
   2. Erweitern: Messer schneidet jedes Stück in k gleiche Teile.
      Kürzen: Kleber klebt je k Stücke zusammen (geht nur, wenn keine gefärbten mit ungefärbten verklebt würden).
   3. Neuen Anteil ablesen.  4. Gleichung: a/b = (a·k)/(b·k) bzw. a/b = (a:k)/(b:k).
   Darstellungen: Streifen, Kreis, Rechteck. Die Stücke sind linear nummeriert;
   im Rechteck spaltenweise (Spalte = Index : R), damit Schneiden/Kleben immer in den Spalten passiert. */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, bruchFeld, zahlenMerken, ggT, bewegung } from './geruest.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const DAR = [['streifen', '▬ Streifen'], ['kreis', '<svg class="an-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8V1.5A6.5 6.5 0 0 1 14.5 8Z" fill="currentColor"/></svg> Kreis'], ['rechteck', '▦ Rechteck']];

export const starteErweitern = root => starteUmformen(root, 'erweitern');
export const starteKuerzen = root => starteUmformen(root, 'kuerzen');

/* ---------- Geometrie ---------- */
const MASS = {
  streifen: { w: 520, h: 150, x: 10, y: 20, bw: 500, bh: 110 },
  kreis: { w: 300, h: 300, m: 150, r: 138 },
  rechteck: { w: 420, h: 300, x: 10, y: 10, bw: 400, bh: 280 },
};

/** Form eines Stücks j bei Zerlegung z = { N, C, R } */
function stueckPfad(dar, z, j) {
  if (dar === 'streifen') { const m = MASS.streifen, w = m.bw / z.N; return `M${m.x + j * w} ${m.y}h${w}v${m.bh}h${-w}Z`; }
  if (dar === 'kreis') {
    const { m, r } = MASS.kreis, a0 = (j / z.N) * 2 * Math.PI, a1 = ((j + 1) / z.N) * 2 * Math.PI;
    const P = a => `${m + r * Math.sin(a)} ${m - r * Math.cos(a)}`;
    return `M${m} ${m} L${P(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${P(a1)} Z`;
  }
  const m = MASS.rechteck, col = Math.floor(j / z.R), row = j % z.R, w = m.bw / z.C, h = m.bh / z.R;
  return `M${m.x + col * w} ${m.y + row * h}h${w}v${h}h${-w}Z`;
}

const bruchKey = (i, n) => { const t = ggT(i, n); return `${i / t}/${n / t}`; };

/** Trennlinien einer Zerlegung, mit Schlüssel (gleiche Linie = gleicher Schlüssel, auch bei feinerer Zerlegung). */
function linien(dar, z) {
  const L = [];
  if (dar === 'streifen') {
    const m = MASS.streifen;
    for (let i = 1; i < z.N; i++) { const x = m.x + (i / z.N) * m.bw; L.push({ key: bruchKey(i, z.N), x1: x, y1: m.y, x2: x, y2: m.y + m.bh }); }
  } else if (dar === 'kreis') {
    const { m, r } = MASS.kreis;
    for (let i = 0; i < z.N; i++) { const a = (i / z.N) * 2 * Math.PI; L.push({ key: bruchKey(i, z.N), x1: m, y1: m, x2: m + r * Math.sin(a), y2: m - r * Math.cos(a) }); }
  } else {
    const m = MASS.rechteck;
    for (let i = 1; i < z.C; i++) { const x = m.x + (i / z.C) * m.bw; L.push({ key: 'v' + bruchKey(i, z.C), x1: x, y1: m.y, x2: x, y2: m.y + m.bh }); }
    for (let i = 1; i < z.R; i++) { const y = m.y + (i / z.R) * m.bh; L.push({ key: 'h' + bruchKey(i, z.R), x1: m.x, y1: y, x2: m.x + m.bw, y2: y }); }
  }
  return L;
}

function rand(dar) {
  if (dar === 'kreis') { const { m, r } = MASS.kreis; return `<circle cx="${m}" cy="${m}" r="${r}" class="bu-rand"/>`; }
  const m = MASS[dar]; return `<rect x="${m.x}" y="${m.y}" width="${m.bw}" height="${m.bh}" rx="4" class="bu-rand"/>`;
}

/* Werkzeuge: Spitze bei (0|0), zeigt nach unten */
const MESSER = `<g class="bu-messer"><path d="M-5 -6 L0 4 L5 -6 L5 -46 Q0 -52 -5 -46 Z" fill="#dfe6ee" stroke="#5b6675" stroke-width="2"/>
  <rect x="-7" y="-78" width="14" height="32" rx="5" fill="#8b5a2b" stroke="#5a3a1b" stroke-width="2"/><circle cx="0" cy="-70" r="2" fill="#f3d9b1"/><circle cx="0" cy="-56" r="2" fill="#f3d9b1"/></g>`;
const KLEBER = `<g class="bu-kleber"><path d="M-3 0 L3 0 L5 -14 L-5 -14 Z" fill="#f2f2f2" stroke="#5b6675" stroke-width="2"/>
  <rect x="-12" y="-58" width="24" height="44" rx="6" fill="#ffd34d" stroke="#9a7300" stroke-width="2"/><rect x="-12" y="-46" width="24" height="12" fill="#2f6fe4"/></g>`;

export function starteUmformen(root, art) {
  const erw = art === 'erweitern';
  let dar = 'streifen', z, an, richtung, schritt, verlauf, eing = {}, bewertung = null, laeuft = false;

  const g = geruest(root, {
    etikett: erw ? 'Erweitern' : 'Kürzen',
    titel: erw ? 'Brüche erweitern – mit dem Messer' : 'Brüche kürzen – mit dem Kleber',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bu="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bu="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  const a = () => an.size;
  const zerlegung = (N, R) => ({ N, R, C: N / R });

  function neu() {
    bewertung = null; schritt = 1; laeuft = false; eing['bu-z'] = ''; eing['bu-n'] = '';
    richtung = wahl(['lesen', 'faerben']);
    let za, nn, R;
    if (erw) {
      do { nn = zufall(2, 6); za = zufall(1, nn - 1); } while (ggT(za, nn) !== 1);
      R = 1;
    } else {
      let b0, a0, k;
      do { b0 = zufall(2, 6); a0 = zufall(1, b0 - 1); k = wahl([2, 2, 3, 4]); } while (ggT(a0, b0) !== 1 || b0 * k > 20);
      za = a0 * k; nn = b0 * k; R = k;
    }
    z = zerlegung(nn, R);
    an = new Set(richtung === 'lesen' ? [...Array(za).keys()] : []);
    verlauf = [{ z: za, n: nn }];
  }

  const ziel = () => verlauf[0];

  /* ---------- Zeichnen ---------- */
  function svgHtml() {
    const m = MASS[dar], klick = schritt === 1 && richtung === 'faerben';
    const stuecke = [...Array(z.N).keys()].map(j => `<path d="${stueckPfad(dar, z, j)}" class="bu-stueck${an.has(j) ? ' an' : ''}${klick ? ' klickbar' : ''}" data-j="${j}"/>`).join('');
    const ls = linien(dar, z).map(l => `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" class="bu-linie" data-key="${l.key}"/>`).join('');
    return `<svg class="bu-svg ${dar}" viewBox="0 0 ${m.w} ${m.h}" role="img" aria-label="${dar === 'kreis' ? 'Kreis' : dar === 'streifen' ? 'Streifen' : 'Rechteck'} aus ${z.N} gleichen Stücken, ${a()} gefärbt">
      <g class="bu-stuecke">${stuecke}</g><g class="bu-linien">${ls}</g>${rand(dar)}<g class="bu-werkzeug"></g></svg>`;
  }

  function wahlHtml() {
    return `<div class="an-darstellung" role="group" aria-label="Darstellung">${DAR.map(([id, t]) =>
      `<button type="button" class="an-dar${dar === id ? ' aktiv' : ''}" data-dar="${id}" aria-pressed="${dar === id}"${schritt > 1 ? ' disabled' : ''}>${t}</button>`).join('')}</div>`;
  }

  function werkzeugHtml() {
    if (schritt !== 2) return '';
    const N = z.N;
    const ks = erw ? [2, 3, 4, 5].filter(k => N * k <= 24) : [2, 3, 4, 5, 6].filter(k => k <= N);
    return `<div class="bu-werkzeuge"><p class="bu-frage">${erw ? '🔪 Messer: Schneide jedes Stück in' : '🧴 Kleber: Klebe immer'}</p>
      <div class="bu-kwahl">${ks.map(k => `<button type="button" class="kn-gross bu-k" data-k="${k}"${laeuft ? ' disabled' : ''}>${k}</button>`).join('')}</div>
      <p class="bu-frage">${erw ? 'gleiche Teile.' : 'Stücke zusammen.'}</p></div>`;
  }

  function links() {
    const t = ziel();
    const anweisung = {
      1: richtung === 'lesen' ? '<b>1.</b> Welcher Anteil ist gefärbt? Schreibe ihn rechts als Bruch.'
        : `<b>1.</b> Färbe ${bruchHtml(t.z, t.n, 'klein')} ein: Tippe die Stücke an.`,
      2: erw ? '<b>2.</b> Nimm das Messer: In wie viele Teile soll jedes Stück geschnitten werden?'
        : '<b>2.</b> Nimm den Kleber: Wie viele Stücke sollen jeweils zusammengeklebt werden?',
      3: '<b>3.</b> Wie heißt der gefärbte Anteil jetzt? Zähle die Stücke neu.',
      4: '✓ Fertig – der gefärbte Teil ist gleich groß geblieben.',
    }[schritt];
    return `${wahlHtml()}<div class="bu-bild">${svgHtml()}</div><p class="bu-anweisung">${anweisung}</p>${werkzeugHtml()}
      ${schritt === 1 && richtung === 'faerben' ? `<p class="leise bu-zaehler">Gefärbt: ${a()} von ${z.N} Stücken</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bu="pruefen">✓ Prüfen</button></div>` : ''}`;
  }

  function gleichungHtml() {
    const teile = [bruchHtml(verlauf[0].z, verlauf[0].n)];
    for (let i = 1; i < verlauf.length; i++) {
      const k = verlauf[i].k, op = erw ? '·' : ':';
      const bogen = (oben) => `<svg class="bu-bogen" viewBox="0 0 70 22" aria-hidden="true"><path d="${oben ? 'M6 20 Q35 -6 62 18' : 'M6 2 Q35 28 62 4'}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <path d="${oben ? 'M53 17 L63 19 L60 9' : 'M53 5 L63 3 L60 13'}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      teile.push(`<span class="bu-gl-schritt" aria-label="${erw ? 'mal' : 'geteilt durch'} ${k}"><span class="bu-pfeil">${op} ${k}</span>${bogen(true)}<span class="bu-gl">=</span>${bogen(false)}<span class="bu-pfeil">${op} ${k}</span></span>`, bruchHtml(verlauf[i].z, verlauf[i].n));
    }
    return `<div class="bu-gleichung" aria-label="Gleichung">${teile.join('')}</div>`;
  }

  function rechts() {
    const t = ziel(), letzt = verlauf[verlauf.length - 1];
    let h = '';
    if (schritt === 1 && richtung === 'lesen') h += `<h2 class="bereich-titel">Welcher Anteil ist gefärbt?</h2><p class="bk-gross">${bruchFeld('bu-z', 'bu-n', eing)}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bu="pruefen">✓ Prüfen</button></div>`;
    if (schritt === 1 && richtung === 'faerben') h += `<h2 class="bereich-titel">Färbe ein</h2><p class="bk-gross">${bruchHtml(t.z, t.n)}</p><p class="leise">Der Nenner sagt, in wie viele gleiche Stücke das Ganze geteilt ist. Der Zähler, wie viele du färbst.</p>`;
    if (schritt >= 2) h += `<h2 class="bereich-titel">Am Anfang</h2><p class="bk-gross">${bruchHtml(t.z, t.n)}</p>`;
    if (schritt === 3) h += `<h2 class="bereich-titel">Und jetzt?</h2><p class="bk-gross">${bruchFeld('bu-z', 'bu-n', eing)}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bu="pruefen">✓ Prüfen</button></div>`;
    if (schritt === 4) {
      h += `<span data-fertig hidden></span><h2 class="bereich-titel">Gleichung</h2>${gleichungHtml()}
        <p class="leise">${erw ? 'Erweitern: Zähler und Nenner mit derselben Zahl malnehmen. Die Stücke werden kleiner, aber es sind mehr – der Anteil bleibt gleich.'
          : 'Kürzen: Zähler und Nenner durch dieselbe Zahl teilen. Die Stücke werden größer, aber es sind weniger – der Anteil bleibt gleich.'}</p>`;
      if (!erw && ggT(letzt.z, letzt.n) > 1) h += `<p class="bu-hinweis">Es geht noch weiter: Du kannst noch einmal kleben.</p><div class="gs-pruef"><button type="button" class="kn-gross" data-bu="nochmal">🧴 Noch einmal kleben</button></div>`;
      else if (!erw) h += `<p class="bu-hinweis">${bruchHtml(letzt.z, letzt.n, 'klein')} ist vollständig gekürzt – größere Stücke gehen nicht mehr.</p>`;
    }
    return h + antwortHtml(bewertung);
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  /* ---------- Animation ---------- */
  function svgEl(tag, attr) { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attr)) e.setAttribute(k, v); return e; }

  async function werkzeugFahrt(spuren, html, proLinie) {
    const svg = root.querySelector('.bu-svg'), wz = svg.querySelector('.bu-werkzeug');
    wz.innerHTML = html;
    const ding = wz.firstElementChild;
    const frames = [];
    spuren.forEach((l, i) => {
      const t0 = i / spuren.length, t1 = (i + 0.85) / spuren.length;
      frames.push({ transform: `translate(${l.x1}px, ${l.y1}px)`, offset: t0 }, { transform: `translate(${l.x2}px, ${l.y2}px)`, offset: t1 });
    });
    frames[frames.length - 1].offset = 1;
    const dauer = proLinie * spuren.length;
    const anim = ding.animate(frames, { duration: dauer, easing: 'linear', fill: 'forwards' });
    spuren.forEach((l, i) => l.el && l.wirkung(l.el, { delay: (i / spuren.length) * dauer, duration: proLinie * 0.85 }));
    await anim.finished.catch(() => {});
    ding.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
    await new Promise(r => setTimeout(r, 260));
  }

  async function schneiden(k) {
    const alt = z, neuZ = dar === 'rechteck' ? zerlegung(z.N * k, z.R * k) : zerlegung(z.N * k, 1);
    const altKeys = new Set(linien(dar, alt).map(l => l.key));
    const neuL = linien(dar, neuZ).filter(l => !altKeys.has(l.key));
    if (bewegung()) {
      const gL = root.querySelector('.bu-linien');
      neuL.forEach(l => {
        const len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1);
        l.el = svgEl('line', { x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, class: 'bu-linie schnitt', 'stroke-dasharray': len, 'stroke-dashoffset': len });
        gL.appendChild(l.el);
        l.wirkung = (el, o) => el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { ...o, fill: 'forwards', easing: 'linear' });
      });
      await werkzeugFahrt(neuL, MESSER, Math.max(110, Math.min(420, 2000 / neuL.length)));
    }
    const neuAn = new Set();
    an.forEach(j => { for (let t = 0; t < k; t++) neuAn.add(j * k + t); });
    z = neuZ; an = neuAn;
  }

  async function kleben(k) {
    const alt = z, neuZ = dar === 'rechteck' ? zerlegung(z.N / k, z.R / k) : zerlegung(z.N / k, 1);
    const neuKeys = new Set(linien(dar, neuZ).map(l => l.key));
    const weg = linien(dar, alt).filter(l => !neuKeys.has(l.key));
    if (bewegung()) {
      weg.forEach(l => {
        l.el = root.querySelector(`.bu-linie[data-key="${CSS.escape(l.key)}"]`);
        l.wirkung = (el, o) => el.animate([{ opacity: 1, strokeWidth: 3 }, { opacity: 1, stroke: '#2f6fe4', strokeWidth: 7, offset: 0.4 }, { opacity: 0, strokeWidth: 7 }], { ...o, fill: 'forwards' });
      });
      await werkzeugFahrt(weg, KLEBER, Math.max(110, Math.min(420, 2000 / weg.length)));
      root.querySelector('.bu-svg')?.animate([{ transform: 'scale(1)' }, { transform: 'scale(.97)' }, { transform: 'scale(1)' }], { duration: 300 });
      await new Promise(r => setTimeout(r, 300));
    }
    const neuAn = new Set();
    an.forEach(j => { if (j % k === 0) neuAn.add(j / k); });
    z = neuZ; an = neuAn;
  }

  /** Beim Kürzen nach dem Färben: gefärbte Stücke rücken an den Anfang (Farbe gleitet über). */
  async function gefaerbteNachVorn() {
    const sortiert = new Set([...Array(a()).keys()]);
    if ([...an].every(j => sortiert.has(j))) return false;
    an = sortiert;
    root.querySelectorAll('.bu-stueck').forEach(e => e.classList.toggle('an', an.has(+e.dataset.j)));
    await new Promise(r => setTimeout(r, bewegung() ? 650 : 0));
    return true;
  }

  async function werkzeug(k) {
    if (laeuft) return;
    if (!erw) {
      if (z.N % k) { bewertung = { ok: false, text: `${z.N} Stücke kann man nicht in Gruppen zu je ${k} zusammenkleben – es bleiben Stücke übrig.` }; g.rechts.innerHTML = rechts(); return; }
      if (a() % k) { bewertung = { ok: false, text: `${a()} gefärbte Stücke lassen sich nicht in Gruppen zu je ${k} kleben – dann würde ein gefärbtes Stück mit einem weißen verklebt.` }; g.rechts.innerHTML = rechts(); return; }
    }
    laeuft = true; bewertung = null;
    root.querySelectorAll('.bu-k').forEach(b => (b.disabled = true));
    g.rechts.innerHTML = rechts();
    if (erw) await schneiden(k); else await kleben(k);
    const vorher = verlauf[verlauf.length - 1];
    verlauf.push({ z: erw ? vorher.z * k : vorher.z / k, n: erw ? vorher.n * k : vorher.n / k, k });
    laeuft = false; schritt = 3; eing['bu-z'] = ''; eing['bu-n'] = '';
    zeichne();
    g.sprich(erw ? `Jedes Stück ist jetzt in ${k} Teile geschnitten. Zähle neu!` : `Immer ${k} Stücke sind jetzt eins. Zähle neu!`);
    root.querySelector('#bu-z')?.focus({ preventScroll: true });
  }

  /* ---------- Prüfen ---------- */
  async function pruefen() {
    if (schritt === 1 && richtung === 'faerben') {
      const t = ziel();
      if (a() !== t.z) { bewertung = { ok: false, text: a() < t.z ? `Du hast ${a()} Stücke gefärbt – der Zähler sagt ${t.z}.` : `Du hast ${a()} Stücke gefärbt – das sind zu viele. Der Zähler sagt ${t.z}.` }; g.rechts.innerHTML = rechts(); return; }
      bewertung = null;
      if (!erw && await gefaerbteNachVorn()) g.sprich('Die gefärbten Stücke rücken zusammen – so kann man gleich besser kleben.');
      schritt = 2; zeichne();
      g.sprich(erw ? `Richtig: ${t.z} von ${t.n} Stücken. Jetzt kommt das Messer.` : `Richtig: ${t.z} von ${t.n} Stücken. Jetzt kommt der Kleber.`, 'fertig');
      return;
    }
    const zz = Number(eing['bu-z']), nn = Number(eing['bu-n']);
    if (!eing['bu-z'] || !eing['bu-n'] || !nn) { bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' }; g.rechts.innerHTML = rechts(); return; }
    const soll = schritt === 1 ? ziel() : verlauf[verlauf.length - 1];
    if (zz === soll.z && nn === soll.n) {
      bewertung = null;
      if (schritt === 1) { schritt = 2; g.sprich(erw ? `Richtig: ${soll.z}/${soll.n}. Jetzt kommt das Messer.` : `Richtig: ${soll.z}/${soll.n}. Jetzt kommt der Kleber.`, 'fertig'); }
      else { schritt = 4; const st = verlauf[0]; g.sprich(`${st.z}/${st.n} und ${soll.z}/${soll.n} sind gleich groß – nur die Stücke sind ${erw ? 'kleiner' : 'größer'}.`, 'fertig'); }
      zeichne(); return;
    }
    const gleichWert = zz * soll.n === nn * soll.z;
    bewertung = { ok: false, text: nn === soll.z && zz === soll.n ? 'Zähler und Nenner vertauscht? Unten steht die Anzahl aller Stücke.'
      : gleichWert ? `Das ist zwar gleich viel – aber zähle die Stücke, die du jetzt siehst: alle Stücke unten, gefärbte oben.`
        : 'Noch nicht. Zähle alle Stücke (Nenner) und die gefärbten Stücke (Zähler).' };
    g.rechts.innerHTML = rechts();
  }

  /* ---------- Ereignisse ---------- */
  root.addEventListener('click', e => {
    const st = e.target.closest('.bu-stueck.klickbar');
    if (st && schritt === 1 && richtung === 'faerben') {
      const j = +st.dataset.j; an.has(j) ? an.delete(j) : an.add(j);
      st.classList.toggle('an', an.has(j));
      const zl = root.querySelector('.bu-zaehler'); if (zl) zl.textContent = `Gefärbt: ${a()} von ${z.N} Stücken`;
      return;
    }
    const dw = e.target.closest('[data-dar]');
    if (dw && schritt === 1) { dar = dw.dataset.dar; const r = richtung, alt = verlauf[0]; neu(); richtung = r; verlauf = [alt]; z = zerlegung(alt.n, erw ? 1 : ggT(alt.z, alt.n)); an = new Set(r === 'lesen' ? [...Array(alt.z).keys()] : []); zeichne(); return; }
    const kb = e.target.closest('[data-k]');
    if (kb && schritt === 2) { werkzeug(+kb.dataset.k); return; }
    const b = e.target.closest('[data-bu]');
    if (!b) return;
    const was = b.dataset.bu;
    if (was === 'neu' && !laeuft) { neu(); zeichne(); start(); }
    if (was === 'pruefen') pruefen();
    if (was === 'nochmal') { schritt = 2; bewertung = null; zeichne(); g.sprich('Welche Stücke kannst du noch zusammenkleben?'); }
    if (was === 'tipp') {
      const letzt = verlauf[verlauf.length - 1];
      g.sprich({
        1: richtung === 'lesen' ? 'Nenner: Wie viele gleich große Stücke hat das Ganze? Zähler: Wie viele sind gefärbt?' : `Das Ganze hat ${z.N} Stücke. Färbe ${ziel().z} davon.`,
        2: erw ? 'Jede Zahl geht. Danach hat jedes Stück gleich viele kleinere Teile.' : `Die Zahl muss in ${z.N} (alle Stücke) und in ${a()} (gefärbte Stücke) aufgehen.`,
        3: 'Zähle alle Stücke für den Nenner und die gefärbten für den Zähler.',
        4: erw ? 'Neue Aufgabe? Probiere auch eine andere Darstellung.' : ggT(letzt.z, letzt.n) > 1 ? 'Es gibt noch eine Zahl, durch die Zähler und Nenner teilbar sind.' : 'Neue Aufgabe?',
      }[schritt], 'tipp');
    }
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('#bu-z, #bu-n')) { e.preventDefault(); pruefen(); } });

  function start() {
    g.sprich(erw ? 'Mit dem Messer werden die Stücke feiner. Was passiert mit dem Bruch?' : 'Mit dem Kleber werden die Stücke gröber. Was passiert mit dem Bruch?');
  }

  neu(); zeichne(); start();
}
