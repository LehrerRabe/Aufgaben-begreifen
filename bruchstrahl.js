/* Mathematik: Brüche – zwei neue Bausteine
   1. „Bruch als Quotient“ (starteBruchQuotient)
      Verteilen: z runde Dinge (Pizzen, Kuchen …) werden gerecht an n Kinder verteilt.
        1. Die Kinder wählen selbst, in wie viele Stücke jedes Ganze geschnitten wird
           (jede Zahl m geht, wenn z · m Stücke sich gerecht auf n Kinder verteilen lassen – auch Vielfache von n).
        2. „Verteilen“: Die Stücke werden reihum ausgeteilt, jedes Kind hat eine Farbe; auf jedem Teller liegt der Anteil.
        3. Anteil eintragen → Gleichung z : n = z/n.
      Übersetzen: a : b als Bruch, Bruch als Division, kurze Sachaufgaben (gleichwertige Brüche werden akzeptiert).
   2. „Brüche am Zahlenstrahl“ (starteBruchStrahl)
      Ablesen (Pfeil zeigt auf einen Strich), Eintragen (Strich antippen), Lücken füllen – auch über 1 hinaus.
   Die Gestaltung (CSS) bringt der Baustein selbst mit (einmal in <head> eingefügt). */

import { geruest, zufall, wahl, mischen, antwortHtml, bruchHtml, bruchFeld, zahlFeld, zahlenMerken, ggT, bewegung } from './geruest.js';

/* ---------- gemeinsame Hilfen ---------- */

const STIL = `
.bq-huelle { overflow-x: auto; }
.bq-svg { display: block; width: 100%; height: auto; }
.bq-pizza { fill: #f6c453; stroke: #d98c2b; stroke-width: 4; }
.bq-stueck { stroke: #fff; stroke-width: 2.5; transition: fill .5s; }
.bq-leer { fill: none; stroke: var(--rand); stroke-width: 2; stroke-dasharray: 5 4; }
.bq-teller { fill: var(--flaeche-2); stroke: var(--rand); stroke-width: 2; }
.bq-name { font: 800 15px var(--titel); text-anchor: middle; fill: var(--text); }
.bq-messer { font: 800 16px var(--titel); text-anchor: middle; fill: var(--leise); }
.bq-wahl { display: flex; flex-wrap: wrap; gap: .4rem; margin: .5rem 0; }
.bq-wahl .kn-gross { min-width: 3.2rem; justify-content: center; font-size: 1.3rem; }
.bq-merk { border-left: 6px solid var(--akzent); background: var(--info-sanft); border-radius: 10px; padding: .6rem .8rem; margin: .7rem 0; }
.bq-merk b { color: var(--akzent); }
.bq-zeile { font: 800 1.6rem/1.6 var(--titel); display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; margin: .4rem 0; font-variant-numeric: tabular-nums; }
.bq-zeile .gs-ein { width: 3.6rem; font-size: 1.3rem; padding: .2rem; }
.bq-sach { font-size: 1.1rem; }
.bq-satz { font-size: 1.15rem; }
.bq-linie { stroke: var(--text); stroke-width: 3; }
.bq-spitze { fill: var(--text); }
.bq-strich { stroke: var(--text); stroke-width: 2; }
.bq-strich.ganz { stroke-width: 3.5; }
.bq-ganz { font: 800 20px var(--titel); text-anchor: middle; fill: var(--text); }
.bq-bz { font: 800 14px var(--titel); text-anchor: middle; fill: var(--text); }
.bq-bz.blass { fill: var(--leise); opacity: .75; }
.bq-bl { stroke: var(--text); stroke-width: 1.6; }
.bq-bl.blass { stroke: var(--leise); opacity: .75; }
.bq-pfeil { fill: #e0262b; }
.bq-pfeil-text { font: 800 20px var(--titel); text-anchor: middle; fill: #e0262b; }
.bq-ok .bq-bz { fill: var(--gut); } .bq-ok .bq-bl { stroke: var(--gut); }
.bq-tipp { fill: transparent; stroke: transparent; stroke-width: 3; cursor: pointer; }
.bq-tipp:hover { fill: rgba(90, 70, 240, .15); stroke: var(--akzent); }
.bq-tipp.richtig { fill: var(--gut-sanft); stroke: var(--gut); }
.bq-tipp.falsch { fill: var(--schlecht-sanft); stroke: var(--schlecht); }
.bq-felder { position: relative; height: 8.4rem; }
.bq-felder > span { position: absolute; top: calc(var(--reihe) * 4.1rem); transform: translateX(-50%); }
.bq-felder .bruch-ein .gs-ein { width: 3rem; font-size: 1.1rem; }
.bq-felder .gs-ein.richtig { border-color: var(--gut); background: var(--gut-sanft); }
.bq-felder .gs-ein.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); }
.bq-nimm { cursor: pointer; }
.bq-nimm:hover { filter: brightness(1.12); }
.bq-weg { fill: none; stroke: var(--rand); stroke-dasharray: 4 3; }
.bq-dran { fill: none; stroke: var(--akzent); stroke-width: 4; stroke-dasharray: 7 5; animation: bq-dreh 6s linear infinite; transform-box: fill-box; transform-origin: center; }
@keyframes bq-dreh { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .bq-dran { animation: none; } }
.bq-bild { margin-bottom: .8rem; }
.bq-bild svg { margin: .4rem 0; }
.bq-streifenwerk { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .6rem; }
.bq-streifenwerk .kn-gross { display: inline-flex; align-items: center; gap: .35rem; }
.bq-st-zahl { font: 800 1.15rem var(--titel); display: inline-flex; align-items: center; gap: .3rem; }
.bq-st.neu { animation: bq-st-rein .35s cubic-bezier(.3,1.3,.5,1); transform-box: fill-box; transform-origin: left center; }
@keyframes bq-st-rein { from { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) { .bq-st.neu { animation: none; } }
.bq-st-text { font: 800 12px var(--titel); fill: #fff; text-anchor: middle; pointer-events: none; }
.bq-st-linie { stroke: var(--akzent); stroke-width: 2; stroke-dasharray: 5 4; }
.bq-dteil { fill: var(--flaeche-2); stroke: var(--leise); stroke-width: 1.5; }
.bq-dteil.an { fill: #2f6fe4; }
.bq-drand { fill: none; stroke: var(--text); stroke-width: 2.5; }
`;
function stil() {
  if (!document.getElementById('bq-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="bq-stil">${STIL}</style>`);
}

/** Wert einer Zahleneingabe (leer → NaN). */
const lies = (eing, id) => { const v = String(eing[id] ?? '').replace(/\D/g, ''); return v === '' ? NaN : Number(v); };
/** Sind a/b und c/d gleich viel? */
const gleich = (a, b, c, d) => b > 0 && d > 0 && a * d === c * b;
/** Gekürzter Bruch als [z, n]. */
const kuerze = (z, n) => { const t = ggT(z, n) || 1; return [z / t, n / t]; };

/** Bruch in SVG (Zähler, Strich, Nenner). */
function svgBruch(x, y, z, n, kl = '') {
  const w = Math.max(String(z).length, String(n).length) * 8 + 6;
  return `<text x="${x}" y="${y}" class="bq-bz ${kl}">${z}</text>
    <line x1="${x - w / 2}" y1="${y + 5}" x2="${x + w / 2}" y2="${y + 5}" class="bq-bl ${kl}"/>
    <text x="${x}" y="${y + 21}" class="bq-bz ${kl}">${n}</text>`;
}

/* =====================================================================
   1. Bruch als Quotient
   ===================================================================== */

const KINDFARBEN = ['#e0262b', '#2f6fe4', '#2fae58', '#a64ad6', '#f07d2a', '#13a39b'];
const NAMEN = ['Ali', 'Ben', 'Cem', 'Dana', 'Ella', 'Finn'];
const DINGE = [
  { ein: 'Pizza', mehr: 'Pizzen', pizza: '#f6c453', rand: '#d98c2b' },
  { ein: 'Kuchen', mehr: 'Kuchen', pizza: '#e8b07a', rand: '#a8662c' },
  { ein: 'Pfannkuchen', mehr: 'Pfannkuchen', pizza: '#f3d58a', rand: '#c4923a' },
];

/** Tortenstück j von m im Kreis (cx, cy, r). */
function stueck(cx, cy, r, j, m, fill, kl = 'bq-stueck') {
  if (m === 1) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" class="${kl}"/>`;
  const a0 = -Math.PI / 2 + (2 * Math.PI * j) / m, a1 = a0 + (2 * Math.PI) / m;
  const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(v => v.toFixed(2));
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `<path d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${m === 2 ? 0 : 0} 1 ${x1} ${y1}Z" fill="${fill}" class="${kl}"/>`;
}

function kind(x, y, farbe) {
  return `<g transform="translate(${x} ${y})">
    <circle cx="0" cy="-30" r="11" fill="${farbe}" stroke="#fff" stroke-width="2"/>
    <path d="M-15 8c0-14 6-24 15-24s15 10 15 24Z" fill="${farbe}" stroke="#fff" stroke-width="2"/></g>`;
}

export function starteBruchQuotient(root) {
  stil();
  let modus = 'verteilen';
  let eing = {}, bewertung = null;
  let z, n, ding, m, phase;      // verteilen: phase 0 ganz, 1 geschnitten (Kinder verteilen selbst), 2 alles verteilt
  let genommen = [];             // verteilen: Reihenfolge der ausgeteilten Stücke als 'p,j' – Stück Nr. t geht an Kind t % n
  let neuStueck = null;          // zuletzt ausgeteiltes Stück (für die Flug-Animation)
  let bildZeigen = false;        // übersetzen: Bild zur Division
  let schnittFehler = null;
  let ue;                        // übersetzen: { typ, a, b, text }
  let reihe = 0;

  const g = geruest(root, {
    etikett: 'Bruch als Quotient', titel: '',
    reiter: [{ id: 'verteilen', titel: 'Gerecht verteilen', unter: 'mit Pizzen und Kuchen' }, { id: 'uebersetzen', titel: 'Übersetzen', unter: 'Division ↔ Bruch' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bq="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bq="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; schnittFehler = null; Object.keys(eing).forEach(k => (eing[k] = ''));
    if (modus === 'verteilen') {
      // abwechslungsreich: weniger Ganze als Kinder, aber auch mehr (unechter Bruch)
      const paare = [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [1, 6], [2, 4], [3, 2], [4, 3], [5, 4], [5, 3], [5, 2], [4, 6], [3, 6]];
      let p; do { p = wahl(paare); } while (p[0] === z && p[1] === n);
      [z, n] = p; ding = wahl(DINGE); m = null; phase = 0; genommen = []; neuStueck = null;
    } else {
      reihe++;
      const typ = ['div2bruch', 'bruch2div', 'sach'][reihe % 3];
      let a, b; do { b = zufall(2, 12); a = zufall(1, 15); } while (a === b || a % b === 0);
      const texte = [
        `${a} Liter Saft werden gleichmäßig auf ${b} Flaschen verteilt. Wie viel Liter kommen in jede Flasche?`,
        `${a} m Band werden in ${b} gleich lange Stücke geschnitten. Wie lang ist ein Stück?`,
        `${a} Tafeln Schokolade werden gerecht an ${b} Kinder verteilt. Wie viele Tafeln bekommt jedes Kind?`,
        `${a} kg Äpfel werden auf ${b} gleich schwere Tüten verteilt. Wie schwer ist eine Tüte?`,
      ];
      const einheit = ['Liter', 'm', 'Tafel(n)', 'kg'];
      const i = zufall(0, 3);
      ue = { typ, a, b, text: texte[i], einheit: einheit[i] }; bildZeigen = false;
    }
  }

  /* ----- Zeichnung „Verteilen“ -----
     Phase 1: Die Kinder tippen ein Stück auf einer Pizza an. Es fliegt auf den Teller des Kindes, das gerade dran ist
     (reihum), auf der Pizza bleibt eine leere Stelle. */
  const PIZZA_Y = 74, TELLER_Y = 306;
  function bild() {
    const W = 640, H = 360;
    const rP = Math.min(54, (W - 40) / z / 2 - 12);
    const abst = (W - 40) / z;
    const d = ding;
    const weg = new Set(genommen);
    const dran = genommen.length % n;
    let s = '';
    for (let p = 0; p < z; p++) {
      const cx = 20 + abst * (p + 0.5);
      if (phase === 0 || !m) s += `<circle cx="${cx}" cy="${PIZZA_Y}" r="${rP}" fill="${d.pizza}" stroke="${d.rand}" stroke-width="4"/>`;
      else {
        s += `<circle cx="${cx}" cy="${PIZZA_Y}" r="${rP + 2}" fill="none" stroke="${d.rand}" stroke-width="4"/>`;
        for (let j = 0; j < m; j++) {
          const key = `${p},${j}`;
          s += weg.has(key) ? stueck(cx, PIZZA_Y, rP, j, m, 'none', 'bq-stueck bq-weg')
            : stueck(cx, PIZZA_Y, rP, j, m, d.pizza, `bq-stueck${phase === 1 ? ' bq-nimm' : ''}" data-stueck="${key}`);
        }
      }
    }
    // Kinder und Teller
    const slot = (W - 20) / n;
    const kreise = Math.max(1, Math.ceil(z / n));
    const rT = Math.min(30, (slot - 16) / kreise / 2 - 3);
    const anzahl = k => genommen.filter((_, t) => t % n === k).length;
    for (let k = 0; k < n; k++) {
      const x = 10 + slot * (k + 0.5);
      if (phase === 1) s += k === dran ? `<circle cx="${x}" cy="196" r="34" class="bq-dran"/>` : '';
      s += kind(x, 214, KINDFARBEN[k]);
      s += `<text x="${x}" y="244" class="bq-name">${NAMEN[k]}</text>`;
      s += `<ellipse cx="${x}" cy="${TELLER_Y}" rx="${Math.min(slot / 2 - 4, kreise * (rT + 4) + 8)}" ry="${rT + 14}" class="bq-teller"/>`;
      const hat = anzahl(k);
      for (let c = 0; c < kreise; c++) {
        const cx = x + (c - (kreise - 1) / 2) * (2 * rT + 6);
        s += `<circle cx="${cx}" cy="${TELLER_Y}" r="${rT}" class="bq-leer"/>`;
        if (m) for (let j = 0; j < m; j++) {
          const nr = c * m + j;
          if (nr < hat) {
            const istNeu = neuStueck && neuStueck.kind === k && neuStueck.nr === nr;
            s += stueck(cx, TELLER_Y, rT, j, m, KINDFARBEN[k], `bq-stueck${istNeu ? '" data-neu="1' : ''}`);
          }
        }
      }
    }
    return `<svg class="bq-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${z} ${z === 1 ? d.ein : d.mehr} für ${n} Kinder">${s}</svg>`;
  }

  /** Mittelpunkt eines Pizza- bzw. Tellerstücks (für die Flug-Animation). */
  function stueckMitte(cx, cy, r, j) {
    const a = -Math.PI / 2 + (2 * Math.PI * (j + 0.5)) / m;
    return [cx + r * 0.6 * Math.cos(a), cy + r * 0.6 * Math.sin(a)];
  }

  function austeilen(key) {
    if (phase !== 1 || genommen.includes(key)) return;
    const [p, j] = key.split(',').map(Number);
    const t = genommen.length, k = t % n, nr = Math.floor(t / n);
    genommen.push(key);
    neuStueck = { kind: k, nr };
    // Start- und Zielpunkt in SVG-Koordinaten
    const W = 640, rP = Math.min(54, (W - 40) / z / 2 - 12), abst = (W - 40) / z;
    const slot = (W - 20) / n, kreise = Math.max(1, Math.ceil(z / n)), rT = Math.min(30, (slot - 16) / kreise / 2 - 3);
    const [x0, y0] = stueckMitte(20 + abst * (p + 0.5), PIZZA_Y, rP, j);
    const c = Math.floor(nr / m), jj = nr % m;
    const [x1, y1] = stueckMitte(10 + slot * (k + 0.5) + (c - (kreise - 1) / 2) * (2 * rT + 6), TELLER_Y, rT, jj);
    if (genommen.length === z * m) phase = 2;
    zeichne();
    const el = root.querySelector('[data-neu]');
    if (el && bewegung()) el.animate([{ transform: `translate(${x0 - x1}px, ${y0 - y1}px) scale(${rP / rT})`, transformOrigin: `${x1}px ${y1}px` }, { transform: 'none', transformOrigin: `${x1}px ${y1}px` }], { duration: 450, easing: 'cubic-bezier(.3,.9,.4,1)' });
    neuStueck = null;
    if (phase === 2) { g.sprich('Alle Stücke sind verteilt. Schau auf die Teller!'); root.querySelector('#bq-z')?.focus({ preventScroll: true }); }
    else if (genommen.length % n === 0) g.sprich(`Eine Runde ist fertig – jedes Kind hat ${genommen.length / n} ${genommen.length / n === 1 ? 'Stück' : 'Stücke'}. Weiter so!`);
  }

  function restVerteilen() {
    const alle = [];
    for (let p = 0; p < z; p++) for (let j = 0; j < m; j++) alle.push(`${p},${j}`);
    alle.filter(k => !genommen.includes(k)).forEach(k => genommen.push(k));
    phase = 2; zeichne();
    g.sprich('Alle Stücke sind verteilt. Schau auf die Teller!');
    root.querySelector('#bq-z')?.focus({ preventScroll: true });
  }

  /** Übersetzen: a Ganze (Streifen), jedes in b gleiche Teile – ein Kind bekommt von jedem Ganzen 1/b. */
  function divisionsBild(a, b) {
    const spalten = a <= 5 ? 1 : a <= 10 ? 2 : 3, zeilen = Math.ceil(a / spalten);
    const bw = 200, bh = 26, gx = 30, gy = 10, W = spalten * bw + (spalten - 1) * gx + 20, H = zeilen * (bh + gy) + 10;
    let s = '';
    for (let i = 0; i < a; i++) {
      const x = 10 + (i % spalten) * (bw + gx), y = 10 + Math.floor(i / spalten) * (bh + gy);
      for (let t = 0; t < b; t++) s += `<rect x="${x + (t * bw) / b}" y="${y}" width="${bw / b}" height="${bh}" class="bq-dteil${t === 0 ? ' an' : ''}"/>`;
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" class="bq-drand"/>`;
    }
    return `<svg class="bq-svg" viewBox="0 0 ${W} ${H}" style="max-width:${W * 1.4}px" role="img" aria-label="${a} Ganze, jedes in ${b} Teile">${s}</svg>`;
  }

  function rechtsVerteilen() {
    const d = ding, ganze = `${z} ${z === 1 ? d.ein : d.mehr}`;
    let h = `<h2 class="bereich-titel">Gerecht verteilen</h2>
      <p class="bq-sach"><b>${ganze}</b> ${z === 1 ? 'wird' : 'werden'} gerecht an <b>${n} Kinder</b> verteilt. Wie viel ${d.ein} bekommt jedes Kind?</p>`;
    if (phase === 0) {
      h += `<p><b>1.</b> In wie viele gleich große Stücke schneidest du ${z === 1 ? 'die' : 'jede'} ${d.ein}?</p>
        <div class="bq-wahl">${[2, 3, 4, 5, 6, 8, 9, 10, 12].map(x => `<button type="button" class="kn-gross" data-schnitt="${x}">${x}</button>`).join('')}</div>
        ${schnittFehler ? `<p class="tb-antwort schlecht">${schnittFehler}</p>` : ''}`;
    }
    if (phase === 1) {
      h += `<p><b>2.</b> Jede ${d.ein} hat jetzt ${m} Stücke, zusammen ${z * m} Stücke. Tippe ein Stück an – es kommt auf den Teller von <b style="color:${KINDFARBEN[genommen.length % n]}">${NAMEN[genommen.length % n]}</b>. Teile reihum aus, bis alles verteilt ist.</p>
        <p class="leise">Verteilt: ${genommen.length} von ${z * m} Stücken</p>
        ${genommen.length >= n ? '<div class="gs-pruef"><button type="button" class="kn-gross kn-leise" data-bq="verteile">⏩ Rest verteilen</button></div>' : ''}`;
    }
    if (phase === 2) {
      const st = (z * m) / n;
      h += `<p><b>3.</b> Jedes Kind hat ${st} ${st === 1 ? 'Stück' : 'Stücke'}. Ein Stück ist ${bruchHtml(1, m, 'klein')} ${d.ein}.</p>
        <p class="bq-zeile bq-satz">Jedes Kind bekommt ${bruchFeld('bq-z', 'bq-n', eing)} ${d.ein}.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bq="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
      if (bewertung?.ok) {
        h += `<p class="fl-formel">${z} : ${n} = ${bruchHtml(z, n)}</p>
          <div class="bq-merk"><b>Merke:</b> Teilt man ${z} Ganze gerecht in ${n} Teile, bekommt jeder ${bruchHtml(z, n, 'klein')}.<br>Der Zähler ist die Zahl, die geteilt wird, der Nenner die Zahl, durch die geteilt wird.</div>`;
      }
    }
    return h;
  }

  function rechtsUebersetzen() {
    const { typ, a, b, text, einheit } = ue;
    let h = '';
    if (typ === 'div2bruch') {
      h = `<h2 class="bereich-titel">Schreibe als Bruch</h2>
        <p class="bq-zeile">${a} : ${b} = ${bruchFeld('bq-z', 'bq-n', eing)}</p>`;
    } else if (typ === 'bruch2div') {
      h = `<h2 class="bereich-titel">Schreibe als Division</h2>
        <p class="bq-zeile">${bruchHtml(a, b)} = ${zahlFeld('bq-a', eing['bq-a'] ?? '', 3, 'erste Zahl')} : ${zahlFeld('bq-b', eing['bq-b'] ?? '', 3, 'zweite Zahl')}</p>`;
    } else {
      h = `<h2 class="bereich-titel">Sachaufgabe</h2><p class="bq-sach">${text}</p>
        <p class="bq-zeile">${bruchFeld('bq-z', 'bq-n', eing)} <span style="font-size:1.1rem">${einheit}</span></p>`;
    }
    h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bq="pruefen">✓ Prüfen</button>
      ${bildZeigen ? '' : '<button type="button" class="kn-gross" data-bq="bild">👀 Bild zeigen</button>'}</div>${antwortHtml(bewertung)}`;
    if (bewertung?.ok) {
      const ganz = Math.floor(a / b), rest = a % b;
      h += `<p class="fl-formel">${a} : ${b} = ${bruchHtml(a, b)}${a > b ? ` = ${ganz} ${bruchHtml(rest, b, 'klein')}` : ''}</p>`;
      if (a > b) h += `<p class="leise">Mehr als ein Ganzes: ${a} : ${b} ist ${ganz} Rest ${rest} – also ${ganz} Ganze und noch ${bruchHtml(rest, b, 'klein')}.</p>`;
    }
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'verteilen' ? 'Gerecht verteilen' : 'Division und Bruch übersetzen');
    if (modus === 'verteilen') {
      g.links.innerHTML = `<div class="bq-huelle">${bild()}</div>`;
      g.rechts.innerHTML = rechtsVerteilen();
    } else {
      const { a, b } = ue;
      const bildHtml = bildZeigen ? `<div class="bq-bild"><p><b>${a} : ${b}</b> – ${a} ${a === 1 ? 'Ganzes wird' : 'Ganze werden'} gerecht in ${b} Teile geteilt.</p>
        ${divisionsBild(a, b)}
        <p>Jeder bekommt von ${a === 1 ? 'dem' : 'jedem'} Ganzen ${bruchHtml(1, b, 'klein')} (farbig) – zusammen ${a} · ${bruchHtml(1, b, 'klein')} = ${bruchHtml(a, b, 'klein')}.</p></div>` : '';
      g.links.innerHTML = `${bildHtml}<div class="bq-merk" style="font-size:1.15rem"><b>Bruch = Division</b><br>
        <span class="bq-zeile" style="font-size:1.5rem">3 : 4 = ${bruchHtml(3, 4)}</span>
        Der Bruchstrich bedeutet „geteilt durch“.<br>Zähler : Nenner = Bruch</div>
        <p class="leise">Ist der Zähler größer als der Nenner, ist der Bruch größer als 1.</p>`;
      g.rechts.innerHTML = rechtsUebersetzen();
    }
  }

  function pruefen() {
    if (modus === 'verteilen') {
      const a = lies(eing, 'bq-z'), b = lies(eing, 'bq-n');
      if (isNaN(a) || isNaN(b)) { bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' }; }
      else if (gleich(a, b, z, n)) {
        const st = (z * m) / n;
        bewertung = { ok: true, text: a === z && b === n ? 'Richtig!' : `Richtig! ${bruchHtml(a, b, 'klein')} ist dasselbe wie ${bruchHtml(z, n, 'klein')}.` };
        g.sprich(`${st} ${st === 1 ? 'Stück' : 'Stücke'} zu je ${bruchHtml(1, m, 'klein')} – das sind ${bruchHtml(st, m, 'klein')}${st !== z || m !== n ? ` = ${bruchHtml(z, n, 'klein')}` : ''}. Also ${z} : ${n} = ${bruchHtml(z, n, 'klein')}.`, 'fertig');
      } else if (b !== m && b !== n) bewertung = { ok: false, text: `Der Nenner sagt, wie groß ein Stück ist. Ein Stück ist ${bruchHtml(1, m, 'klein')} ${ding.ein}.` };
      else bewertung = { ok: false, text: 'Zähle noch einmal die Stücke auf einem Teller.' };
    } else {
      const { typ, a, b } = ue;
      if (typ === 'bruch2div') {
        const p = lies(eing, 'bq-a'), q = lies(eing, 'bq-b');
        if (isNaN(p) || isNaN(q)) bewertung = { ok: false, text: 'Trage beide Zahlen ein.' };
        else if (p === b && q === a) bewertung = { ok: false, text: 'Vertauscht! Der Zähler kommt nach vorn, der Nenner nach hinten.' };
        else if (gleich(p, q, a, b)) bewertung = { ok: true, text: p === a ? 'Richtig!' : `Richtig – ${p} : ${q} ergibt dasselbe wie ${a} : ${b}.` };
        else bewertung = { ok: false, text: 'Noch nicht. Zähler : Nenner.' };
      } else {
        const p = lies(eing, 'bq-z'), q = lies(eing, 'bq-n');
        if (isNaN(p) || isNaN(q)) bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' };
        else if (p === b && q === a) bewertung = { ok: false, text: 'Vertauscht! Die Zahl, die geteilt wird, steht oben.' };
        else if (gleich(p, q, a, b)) {
          const [kz, kn] = kuerze(a, b);
          bewertung = { ok: true, text: p === a && q === b ? 'Richtig!' : `Richtig! ${bruchHtml(p, q, 'klein')} = ${bruchHtml(kz, kn, 'klein')}.` };
        } else bewertung = { ok: false, text: 'Noch nicht. Was wird geteilt, und durch wie viel?' };
      }
      if (bewertung.ok) g.sprich('Der Bruchstrich ist ein Geteiltzeichen.', 'fertig');
    }
    zeichne();
  }

  function tipp() {
    if (modus === 'verteilen') {
      if (phase === 0) g.sprich(`Am einfachsten: Schneide jede ${ding.ein} in so viele Stücke, wie Kinder da sind – also in ${n}.`, 'tipp');
      else if (phase === 1) g.sprich('Tippe ein Stück auf einer Pizza an. Es kommt auf den Teller des Kindes mit dem Ring. Dann ist das nächste Kind dran.', 'tipp');
      else g.sprich(`Ein Stück ist ${bruchHtml(1, m, 'klein')}. Wie viele solche Stücke liegen auf einem Teller? Diese Zahl ist der Zähler.`, 'tipp');
    } else {
      const { typ, a, b } = ue;
      if (!bildZeigen) { bildZeigen = true; zeichne(); }
      if (typ === 'bruch2div') g.sprich(`Lies den Bruchstrich als „geteilt durch“: ${a} geteilt durch …`, 'tipp');
      else g.sprich(`Die Zahl, die verteilt wird, kommt in den Zähler: ${a}. Durch wie viele wird geteilt? Das ist der Nenner.`, 'tipp');
    }
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const sc = e.target.closest('[data-schnitt]');
    if (sc && phase === 0) {
      const x = Number(sc.dataset.schnitt);
      if ((z * x) % n === 0) {
        m = x; phase = 1; schnittFehler = null;
        g.sprich(x === n ? `Gut: ${n} Stücke für ${n} Kinder.` : (x % n === 0 ? `Auch gut: ${x} Stücke – jedes Kind bekommt von jeder ${ding.ein} ${x / n}.` : `Das geht: ${z * x} Stücke lassen sich gerecht auf ${n} Kinder verteilen.`));
      } else {
        schnittFehler = `Dann hast du ${z * x} Stücke. ${z * x} Stücke kann man nicht gerecht auf ${n} Kinder verteilen – es bleiben welche übrig.`;
      }
      zeichne(); return;
    }
    const nimm = e.target.closest('[data-stueck]');
    if (nimm && modus === 'verteilen') { austeilen(nimm.dataset.stueck); return; }
    const b = e.target.closest('[data-bq]');
    if (!b) return;
    const was = b.dataset.bq;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'tipp') tipp();
    if (was === 'verteile' && phase === 1) restVerteilen();
    if (was === 'bild') { bildZeigen = true; zeichne(); g.sprich('Jedes Ganze wird in gleich viele Teile geteilt. Ein Kind bekommt von jedem Ganzen ein Teil.'); }
    if (was === 'pruefen') pruefen();
  });

  function startText() {
    g.sprich(modus === 'verteilen'
      ? 'Verteile gerecht: Erst schneiden, dann austeilen. Wie viel bekommt jedes Kind?'
      : 'Übersetze zwischen Division und Bruch. Gleichwertige Brüche gelten auch.');
  }

  neu(); zeichne(); startText();
}

/* =====================================================================
   2. Brüche am Zahlenstrahl
   ===================================================================== */

export function starteBruchStrahl(root) {
  stil();
  let modus = 'ablesen';
  let eing = {}, bewertung = null, tipps = 0;
  let M, n, ziel, getippt, luecken, zielBruch;
  let gelegt = 0;   // angelegte Bruchstreifen-Stücke (Größe 1/einheit()) ab 0

  const g = geruest(root, {
    etikett: 'Zahlenstrahl', titel: '',
    reiter: [{ id: 'ablesen', titel: 'Ablesen', unter: 'Wohin zeigt der Pfeil?' }, { id: 'eintragen', titel: 'Eintragen', unter: 'Strich antippen' }, { id: 'luecken', titel: 'Lücken füllen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bz="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bz="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  const T = () => M * n;

  function neu() {
    bewertung = null; tipps = 0; getippt = null; gelegt = 0; letzteFalsch = null; Object.keys(eing).forEach(k => (eing[k] = ''));
    if (modus === 'ablesen') {
      M = wahl([1, 1, 2, 2, 3]);
      n = wahl(M === 1 ? [2, 3, 4, 5, 6, 8, 10, 12] : M === 2 ? [2, 3, 4, 5, 6, 8] : [2, 3, 4, 5]);
      do { ziel = zufall(1, T() - 1); } while (ziel % n === 0);
    }
    if (modus === 'eintragen') {
      const b = wahl([2, 3, 4, 5, 6, 8, 10]);
      let a; do { a = zufall(1, 3 * b - 1); } while (a % b === 0);
      // manchmal ist der Strahl feiner eingeteilt als der Nenner (dann erweitern!)
      const fein = 2 * b <= 12 && Math.random() < 0.35;
      n = fein ? 2 * b : b;
      M = Math.min(3, Math.max(1, Math.ceil(a / b) + (Math.random() < 0.5 ? 1 : 0)));
      if (M * n > 24) M = Math.ceil(a / b);
      zielBruch = [a, b];
    }
    if (modus === 'luecken') {
      M = wahl([1, 2, 2]);
      n = wahl(M === 1 ? [3, 4, 5, 6, 8, 10] : [2, 3, 4, 5, 6]);
      const kand = [...Array(T()).keys()].filter(i => i % n !== 0);
      luecken = mischen(kand).slice(0, Math.min(4, kand.length)).sort((x, y) => x - y);
    }
  }

  /** Größe der Streifenstücke: beim Eintragen der Nenner des gesuchten Bruchs, sonst die Einteilung des Strahls. */
  const einheit = () => (modus === 'eintragen' ? zielBruch[1] : n);
  const STREIFENFARBE = { 2: '#f07d2a', 3: '#f2b72e', 4: '#9ccc3a', 5: '#2fae58', 6: '#18b0a8', 7: '#2fa3e0', 8: '#2f6fe4', 9: '#6b54e0', 10: '#a64ad6', 12: '#e0457b' };
  const maxStreifen = () => M * einheit();

  const geo = () => {
    const schritt = Math.max(44, 600 / T());
    return { schritt, W: schritt * T() + 90, X: i => 40 + i * schritt };
  };

  function strahl() {
    const { W, X, schritt } = geo();
    let s = `<defs><marker id="bq-spitze" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="bq-spitze"/></marker></defs>
      <line x1="20" y1="110" x2="${W - 8}" y2="110" class="bq-linie" marker-end="url(#bq-spitze)"/>`;
    for (let i = 0; i <= T(); i++) {
      const ganz = i % n === 0;
      s += `<line x1="${X(i)}" y1="${ganz ? 92 : 100}" x2="${X(i)}" y2="${ganz ? 128 : 120}" class="bq-strich${ganz ? ' ganz' : ''}"/>`;
      if (ganz) s += `<text x="${X(i)}" y="158" class="bq-ganz">${i / n}</text>`;
      else if (modus === 'ablesen' && tipps >= 2 && i !== ziel) s += svgBruch(X(i), 146, i, n, 'blass');
      else if (modus === 'eintragen' && tipps >= 2) s += svgBruch(X(i), 146, i, n, 'blass');
      if (modus === 'eintragen') {
        const r = Math.min(16, schritt / 2 - 2);
        s += `<circle cx="${X(i)}" cy="110" r="${r}" class="bq-tipp${getippt === i ? (bewertung?.ok ? ' richtig' : ' falsch') : ''}" data-tick="${i}"/>`;
      }
    }
    if (modus === 'ablesen') {
      const x = X(ziel);
      s += `<path d="M${x - 10} 36 L${x + 10} 36 L${x} 58Z" class="bq-pfeil"/>`;
      s += bewertung?.ok ? `<g class="bq-ok">${svgBruch(x, 6, ziel, n)}</g>` : `<text x="${x}" y="28" class="bq-pfeil-text">?</text>`;
    }
    if (modus === 'eintragen' && bewertung?.ok) s += `<g class="bq-ok">${svgBruch(X(getippt), 26, zielBruch[0], zielBruch[1])}</g>`;
    // angelegte Bruchstreifen-Stücke über dem Strahl
    const u = einheit(), breite = (n / u) * schritt, farbe = STREIFENFARBE[u] || '#2f6fe4';
    for (let k = 0; k < gelegt; k++) {
      s += `<rect x="${X(0) + k * breite}" y="64" width="${breite}" height="24" rx="3" fill="${farbe}" stroke="#fff" stroke-width="2" class="bq-st${k === gelegt - 1 ? ' neu' : ''}"/>`;
      if (breite >= 26) s += `<text x="${X(0) + (k + 0.5) * breite}" y="81" class="bq-st-text">1/${u}</text>`;
    }
    if (gelegt) s += `<line x1="${X(0) + gelegt * breite}" y1="58" x2="${X(0) + gelegt * breite}" y2="128" class="bq-st-linie"/>`;
    return `<svg class="bq-svg" viewBox="0 -14 ${W} 194" style="min-width:${Math.round(W * 0.8)}px">${s}</svg>`;
  }

  function streifenHtml() {
    const u = einheit();
    return `<div class="bq-streifenwerk">
      <button type="button" class="kn-gross" data-bz="legen" ${gelegt >= maxStreifen() ? 'disabled' : ''}>＋ Streifen ${bruchHtml(1, u, 'klein')} anlegen</button>
      <button type="button" class="kn-gross kn-leise" data-bz="wegnehmen" ${gelegt ? '' : 'disabled'}>− einen weg</button>
      <span class="bq-st-zahl">${gelegt ? `${gelegt} · ${bruchHtml(1, u, 'klein')} = ${bruchHtml(gelegt, u, 'klein')}` : 'Lege Bruchstreifen ab 0 an.'}</span></div>`;
  }

  function links() {
    if (modus !== 'luecken') return `<div class="bq-huelle">${strahl()}</div>${streifenHtml()}`;
    const { W, X } = geo();
    const felder = luecken.map((i, k) => `<span style="left:${(X(i) / W) * 100}%; --reihe:${k % 2}">${bruchFeld(`bl-z-${i}`, `bl-n-${i}`, eing)}</span>`).join('');
    return `<div class="bq-huelle"><div style="min-width:${Math.round(W * 0.8)}px">${strahl()}<div class="bq-felder">${felder}</div></div></div>${streifenHtml()}`;
  }

  function rechts() {
    if (modus === 'ablesen') {
      return `<h2 class="bereich-titel">Welcher Bruch gehört an den Pfeil?</h2>
        <p class="bq-zeile">Der Pfeil zeigt auf ${bruchFeld('bz-z', 'bz-n', eing)}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bz="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${bewertung?.ok ? `<p class="leise">Von 0 bis 1 sind es ${n} Abschnitte – jeder ist ${bruchHtml(1, n, 'klein')}. Bis zum Pfeil sind es ${ziel} Abschnitte.</p>` : ''}`;
    }
    if (modus === 'eintragen') {
      const [a, b] = zielBruch;
      return `<h2 class="bereich-titel">Wo liegt dieser Bruch?</h2>
        <p class="rr-gross">${bruchHtml(a, b)}</p>
        <p>Tippe auf den passenden Strich.</p>${antwortHtml(bewertung)}
        ${n !== b && !bewertung?.ok ? '<p class="leise">Achtung: Der Strahl ist feiner eingeteilt als der Nenner.</p>' : ''}`;
    }
    return `<h2 class="bereich-titel">Welche Brüche fehlen?</h2>
      <p>Trage unter den Strichen die passenden Brüche ein.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bz="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${bewertung?.ok ? `<p class="leise">Jeder Abschnitt ist ${bruchHtml(1, n, 'klein')}.</p>` : '<p class="leise">Zähle zuerst: In wie viele Abschnitte ist die Strecke von 0 bis 1 geteilt?</p>'}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ ablesen: 'Brüche ablesen', eintragen: 'Brüche eintragen', luecken: 'Lücken am Zahlenstrahl' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  function pruefen() {
    if (modus === 'ablesen') {
      const a = lies(eing, 'bz-z'), b = lies(eing, 'bz-n');
      if (isNaN(a) || isNaN(b)) bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' };
      else if (gleich(a, b, ziel, n)) {
        bewertung = { ok: true, text: a === ziel && b === n ? 'Richtig!' : `Richtig! ${bruchHtml(a, b, 'klein')} = ${bruchHtml(ziel, n, 'klein')} – gekürzt oder erweitert ist es dieselbe Stelle.` };
        g.sprich(ziel > n ? `Über 1 hinaus zählst du einfach weiter: ${bruchHtml(n + 1, n, 'klein')}, ${bruchHtml(n + 2, n, 'klein')}, …` : 'Gut abgelesen!', 'fertig');
      } else if (b !== n && ggT(b, n) === 1 && b !== 1) bewertung = { ok: false, text: 'Schau auf den Nenner: In wie viele gleiche Abschnitte ist die Strecke von 0 bis 1 geteilt?' };
      else if (a === ziel % n && b === n) bewertung = { ok: false, text: 'Du hast erst ab der letzten ganzen Zahl gezählt. Zähle die Abschnitte ab 0!' };
      else bewertung = { ok: false, text: 'Zähle die Abschnitte von 0 bis zum Pfeil.' };
    }
    if (modus === 'luecken') {
      const falsch = luecken.filter(i => !gleich(lies(eing, `bl-z-${i}`), lies(eing, `bl-n-${i}`), i, n));
      bewertung = falsch.length ? { ok: false, text: `${falsch.length === 1 ? 'Ein Bruch stimmt' : `${falsch.length} Brüche stimmen`} noch nicht.` } : { ok: true, text: 'Alle Lücken richtig gefüllt!' };
      if (!falsch.length) g.sprich(`Von Strich zu Strich kommt immer ${bruchHtml(1, n, 'klein')} dazu.`, 'fertig');
      letzteFalsch = falsch;
      zeichne(); feldFarben();
      return;
    }
    zeichne();
  }

  let letzteFalsch = null;
  function feldFarben() {
    if (modus !== 'luecken' || !letzteFalsch) return;
    root.querySelectorAll('.bq-felder .bruch-ein').forEach(f => {
      const i = Number(f.querySelector('input').id.split('-')[2]);
      f.querySelectorAll('input').forEach(inp => { inp.classList.toggle('falsch', letzteFalsch.includes(i)); inp.classList.toggle('richtig', !letzteFalsch.includes(i)); });
    });
  }

  function tipp() {
    tipps++;
    if (tipps >= 2) { zeichne(); g.sprich('Jetzt stehen an allen Strichen die Brüche (blass). Zähle mit!', 'tipp'); return; }
    if (modus === 'ablesen') g.sprich(`Zähle die Abschnitte zwischen 0 und 1: Es sind ${n}. Jeder Abschnitt ist also ${bruchHtml(1, n, 'klein')}. Jetzt zähle ab 0 bis zum Pfeil. (Noch ein Tipp: Brüche anzeigen.)`, 'tipp');
    if (modus === 'eintragen') {
      const [a, b] = zielBruch;
      g.sprich(n === b
        ? `Die Strecke von 0 bis 1 ist in ${n} Abschnitte geteilt. Gehe ${a} Abschnitte ab 0 nach rechts.`
        : `Die Strecke von 0 bis 1 hat ${n} Abschnitte, der Nenner ist aber ${b}. Erweitere: ${bruchHtml(a, b, 'klein')} = ${bruchHtml(a * n / b, n, 'klein')}.`, 'tipp');
    }
    if (modus === 'luecken') g.sprich(`Zwischen 0 und 1 sind ${n} Abschnitte. Der erste Strich nach 0 ist ${bruchHtml(1, n, 'klein')}, der nächste ${bruchHtml(2, n, 'klein')} …`, 'tipp');
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const t = e.target.closest('[data-tick]');
    if (t && modus === 'eintragen' && !bewertung?.ok) {
      getippt = Number(t.dataset.tick);
      const [a, b] = zielBruch;
      if (gleich(getippt, n, a, b)) {
        bewertung = { ok: true, text: n === b ? 'Richtig!' : `Richtig: ${bruchHtml(a, b, 'klein')} = ${bruchHtml(getippt, n, 'klein')}.` };
        g.sprich(a > b ? `${bruchHtml(a, b, 'klein')} ist größer als 1 – es liegt rechts von der 1.` : 'Genau getroffen!', 'fertig');
      } else {
        const [kz, kn] = kuerze(getippt, n);
        bewertung = { ok: false, text: `Das ist ${bruchHtml(getippt, n, 'klein')}${kn !== n ? ` = ${bruchHtml(kz, kn, 'klein')}` : ''}. Gesucht ist ${bruchHtml(a, b, 'klein')}.` };
      }
      zeichne(); return;
    }
    const b = e.target.closest('[data-bz]');
    if (!b) return;
    if (b.dataset.bz === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.bz === 'legen' && gelegt < maxStreifen()) { gelegt++; g.links.innerHTML = links(); feldFarben(); }
    if (b.dataset.bz === 'wegnehmen' && gelegt) { gelegt--; g.links.innerHTML = links(); feldFarben(); }
    if (b.dataset.bz === 'tipp') tipp();
    if (b.dataset.bz === 'pruefen') pruefen();
  });

  function startText() {
    g.sprich({
      ablesen: 'Finde heraus, in wie viele Teile die Strecke von 0 bis 1 geteilt ist. Lege Bruchstreifen an, bis du beim Pfeil bist.',
      eintragen: 'Lege so viele Bruchstreifen an, wie der Zähler sagt – dann tippe auf den Strich am Ende.',
      luecken: 'Welche Brüche stehen an den leeren Strichen?',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
