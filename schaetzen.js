/* Mathematik: Größen schätzen mit Stützpunkten.
   Schätzen: Gegenstand + vier Angebote. Danach wird mit einer bekannten Bezugsgröße verglichen
   (z. B. Bleistift ≈ 2 Handbreiten). Balkenwaage: Gewichte auflegen, bis die Waage im Gleichgewicht ist.
   Alle Werte sind übliche Richtwerte („ungefähr“). */

import { geruest, wahl, mischen, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

/* Werte in mm bzw. g */
const LAENGE = [
  { n: 'Ameise', e: '🐜', v: 5 }, { n: 'Radiergummi', e: '🧽', v: 50 }, { n: 'Smartphone', e: '📱', v: 150 },
  { n: 'Bleistift', e: '✏️', v: 170 }, { n: 'Schulheft (Höhe)', e: '📒', v: 300 }, { n: 'Tisch (Höhe)', e: '🪑', v: 750 },
  { n: 'Tür (Höhe)', e: '🚪', v: 2000 }, { n: 'Giraffe', e: '🦒', v: 5000 }, { n: 'Klassenraum (Länge)', e: '🏫', v: 9000 },
  { n: 'Linienbus', e: '🚌', v: 12000 }, { n: 'Fußballfeld', e: '⚽', v: 100000 },
];
const MASSE = [
  { n: 'Büroklammer', e: '📎', v: 1 }, { n: 'Brief', e: '✉️', v: 20 }, { n: 'Ei', e: '🥚', v: 60 },
  { n: 'Tafel Schokolade', e: '🍫', v: 100 }, { n: 'Apfel', e: '🍎', v: 150 }, { n: 'Liter Milch', e: '🥛', v: 1000 },
  { n: 'Schultasche', e: '🎒', v: 5000 }, { n: 'Fahrrad', e: '🚲', v: 15000 }, { n: 'Kind (10 Jahre)', e: '🧒', v: 35000 },
  { n: 'Auto', e: '🚗', v: 1500000 }, { n: 'Elefant', e: '🐘', v: 5000000 },
];
const STUETZ_L = [
  { n: 'Breite des kleinen Fingers', e: '🤙', v: 10, t: '1 cm' }, { n: 'Handbreite', e: '✋', v: 100, t: '10 cm' },
  { n: 'großer Schritt', e: '🚶', v: 1000, t: '1 m' }, { n: 'Türhöhe', e: '🚪', v: 2000, t: '2 m' }, { n: 'Fußballfeld', e: '⚽', v: 100000, t: '100 m' },
];
const STUETZ_M = [
  { n: 'Büroklammer', e: '📎', v: 1, t: '1 g' }, { n: 'Tafel Schokolade', e: '🍫', v: 100, t: '100 g' },
  { n: 'Liter Milch', e: '🥛', v: 1000, t: '1 kg' }, { n: 'Kind (10 Jahre)', e: '🧒', v: 35000, t: '35 kg' }, { n: 'Auto', e: '🚗', v: 1500000, t: '1,5 t' },
];
const GEWICHTE = [1000, 500, 200, 100, 50, 20, 10];
const WAAGE_DINGE = [
  { n: 'Apfel', art: 'der', e: '🍎', v: 150 }, { n: 'Banane', art: 'die', e: '🍌', v: 120 }, { n: 'Buch', art: 'das', e: '📕', v: 450 }, { n: 'Federmäppchen', art: 'das', e: '✏️', v: 280 },
  { n: 'Ball', art: 'der', e: '⚽', v: 430 }, { n: 'Trinkflasche', art: 'die', e: '🧴', v: 750 }, { n: 'Kürbis', art: 'der', e: '🎃', v: 1800 }, { n: 'Turnschuh', art: 'der', e: '👟', v: 320 },
];

/** Größe gut lesbar: mm → mm/cm/m/km, g → g/kg/t. */
export function textL(mm) { return mm >= 1000000 ? `${zahlText(mm / 1000000)} km` : mm >= 1000 ? `${zahlText(+(mm / 1000).toFixed(1)).replace('.', ',')} m` : mm >= 10 ? `${zahlText(Math.round(mm / 10))} cm` : `${mm} mm`; }
export function textM(g) { return g >= 1000000 ? `${String(+(g / 1000000).toFixed(1)).replace('.', ',')} t` : g >= 1000 ? `${String(+(g / 1000).toFixed(1)).replace('.', ',')} kg` : `${g} g`; }

export function starteSchaetzen(root) {
  let modus = 'laenge';
  let ding, optionen, gewaehlt, bewertung = null, eing = {};
  let schale = [], wdin;

  const g = geruest(root, {
    etikett: 'Größen schätzen', titel: '',
    reiter: [{ id: 'laenge', titel: 'Längen schätzen' }, { id: 'masse', titel: 'Gewichte schätzen' }, { id: 'waage', titel: 'Balkenwaage', unter: 'genau wiegen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-sz="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-sz="neu">＋ Neuer Gegenstand</button>`,
  });
  zahlenMerken(root, eing);

  const liste = () => (modus === 'laenge' ? LAENGE : MASSE);
  const stuetz = () => (modus === 'laenge' ? STUETZ_L : STUETZ_M);
  const fmt = v => (modus === 'laenge' ? textL(v) : textM(v));

  function neu() {
    gewaehlt = null; bewertung = null; eing['sz-w'] = '';
    if (modus === 'waage') { wdin = wahl(WAAGE_DINGE); schale = []; return; }
    let d;
    do { d = wahl(liste()); } while (d === ding);
    ding = d;
    const faktoren = mischen([10, 0.1, 100, 0.01, 3, 1 / 3]).slice(0, 3);
    const runde = v => { const st = 10 ** Math.floor(Math.log10(v)); return Math.max(1, Math.round(v / st) * st); };
    // Alle Angebote (auch das richtige) sind gerundet, damit keines durch „krumme“ Zahlen auffällt.
    ding.rund = runde(ding.v);
    const set = new Set([ding.rund]);
    for (const f of faktoren) { const v = runde(ding.v * f); if (!set.has(v) && ![...set].some(x => fmt(x) === fmt(v))) set.add(v); }
    optionen = mischen([...set].slice(0, 4));
  }

  /** Vergleich mit einer Bezugsgröße: die größte, die noch hineinpasst. */
  function vergleich() {
    const s = [...stuetz()].reverse().find(x => x.v <= ding.v) || stuetz()[0];
    const anz = ding.v / s.v;
    const n = anz >= 1 ? Math.round(anz) : anz;
    const zeigen = Math.min(10, Math.max(1, Math.round(anz)));
    if (modus === 'laenge') {
      const W = 300, einheit = anz < 1 ? W : W / anz, dingW = anz < 1 ? W * anz : W;
      let bloecke = '';
      for (let i = 0; i < zeigen && i * einheit < W; i++) bloecke += `<rect x="${10 + i * einheit}" y="58" width="${Math.min(einheit, W - i * einheit) - 2}" height="22" rx="4" class="sz-block"/>`;
      return `<svg class="sz-svg" viewBox="0 0 320 110"><rect x="10" y="18" width="${dingW}" height="26" rx="6" class="sz-ding"/><text x="${10 + Math.max(dingW, 150) / 2}" y="36" class="sm-t">${ding.n}</text>${bloecke}
        <text x="160" y="100" class="sm-t">${anz >= 1.5 ? `etwa ${zahlText(n)} × ${s.n} (${s.t})` : anz < 0.75 ? `etwa halb so lang wie ${s.n} (${s.t})` : `etwa so lang wie ${s.n} (${s.t})`}</text></svg>`;
    }
    return `<div class="sz-masse">${ding.e} <span>≈</span> ${zeigen > 1 ? `<b>${anz > 10 ? zahlText(n) + ' ×' : ''}</b> ${anz > 10 ? s.e : Array(zeigen).fill(s.e).join('')}` : s.e}</div>
      <p class="sm-t2">${ding.n} wiegt etwa ${anz >= 1.5 ? `so viel wie ${zahlText(n)} × ${s.n} (je ${s.t})` : `so viel wie ${s.n} (${s.t})`}.</p>`;
  }

  const summe = () => schale.reduce((a, b) => a + b, 0);

  function waageHtml() {
    const diff = wdin.v - summe();
    const winkel = Math.max(-14, Math.min(14, diff / 40));   // links schwerer → links runter
    return `<div class="sz-waage">
      <svg viewBox="0 0 400 230" class="sz-waage-svg">
        <rect x="190" y="70" width="20" height="140" rx="6" class="sz-saeule"/><rect x="130" y="205" width="140" height="16" rx="6" class="sz-saeule"/>
        <g class="sz-balken" style="transform: rotate(${-winkel}deg)">
          <rect x="40" y="62" width="320" height="10" rx="5" class="sz-holm"/>
          <g class="sz-schale" style="transform: rotate(${winkel}deg); transform-origin: 70px 67px"><line x1="70" y1="67" x2="70" y2="110" class="sz-seil"/><path d="M25 110h90l-12 22H37Z" class="sz-teller"/><text x="70" y="104" class="sz-gross">${wdin.e}</text></g>
          <g class="sz-schale" style="transform: rotate(${winkel}deg); transform-origin: 330px 67px"><line x1="330" y1="67" x2="330" y2="110" class="sz-seil"/><path d="M285 110h90l-12 22H297Z" class="sz-teller"/>
            ${schale.map((w, i) => `<g data-weg="${i}" class="sz-gewicht" transform="translate(${292 + (i % 5) * 16} ${100 - Math.floor(i / 5) * 18})"><rect width="15" height="16" rx="3"/><text x="7.5" y="11">${w >= 1000 ? '1k' : w}</text></g>`).join('')}</g>
        </g>
        <circle cx="200" cy="67" r="7" class="sz-achse"/>
      </svg>
      <p class="sz-anzeige">${diff === 0 ? '⚖️ Gleichgewicht!' : diff > 0 ? '⬅ Die linke Seite ist schwerer.' : 'Die rechte Seite ist schwerer. ➡'}</p>
      <div class="sz-gewichte">${GEWICHTE.map(w => `<button type="button" class="kn-gross" data-gewicht="${w}">${textM(w)}</button>`).join('')}</div>
      <p class="leise">Tippe ein Gewicht an, um es auf die rechte Schale zu legen. Tippe ein Gewicht auf der Schale an, um es wegzunehmen.</p>
    </div>`;
  }

  function links() {
    if (modus === 'waage') return waageHtml();
    return `<div class="sz-ding-gross"><span>${ding.e}</span><b>${ding.n}</b></div>
      <p>Wie ${modus === 'laenge' ? 'lang' : 'schwer'} ist das ungefähr?</p>
      <div class="sz-optionen">${optionen.map(v => `<button type="button" class="kn-gross${gewaehlt === v ? (v === ding.rund ? ' richtig' : ' falsch') : ''}" data-opt="${v}">${fmt(v)}</button>`).join('')}</div>
      ${gewaehlt !== null && gewaehlt === ding.rund ? vergleich() : ''}`;
  }

  function rechts() {
    if (modus === 'waage') {
      return `<h2 class="bereich-titel">Wie schwer ist ${wdin.art} ${wdin.n}?</h2>
        <p>Lege Gewichte auf, bis die Waage gerade steht. Dann zähle die Gewichte zusammen.</p>
        <p class="ut-frage">${zahlFeld('sz-w', eing['sz-w'], 5, 'Gewicht in g')} g</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-sz="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    return `<h2 class="bereich-titel">Stützpunkte</h2>
      <p class="leise">Diese Größen kennst du – vergleiche mit ihnen:</p>
      <ul class="sz-stuetz">${stuetz().map(s => `<li><span>${s.e}</span> ${s.n}: <b>${s.t}</b></li>`).join('')}</ul>
      ${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ laenge: 'Wie lang ist das?', masse: 'Wie schwer ist das?', waage: 'Wiegen mit der Balkenwaage' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const o = e.target.closest('[data-opt]');
    if (o && gewaehlt !== ding.rund) {
      gewaehlt = Number(o.dataset.opt);
      const ok = gewaehlt === ding.rund;
      bewertung = ok ? { ok, text: `Richtig: ${ding.n} – etwa ${fmt(ding.v)}.` } : { ok, text: `${fmt(gewaehlt)} ist ${gewaehlt > ding.rund ? 'viel zu viel' : 'viel zu wenig'}. Vergleiche mit den Stützpunkten.` };
      if (ok) g.sprich('Gut geschätzt! Unten siehst du den Vergleich mit einer bekannten Größe.', 'fertig');
      zeichne(); return;
    }
    const gw = e.target.closest('[data-gewicht]');
    if (gw) { if (schale.length >= 15) { g.sprich('Die Schale ist voll.', 'tipp'); return; } schale.push(Number(gw.dataset.gewicht)); bewertung = null; zeichne(); if (summe() === wdin.v) g.sprich('Gleichgewicht! Zähle jetzt die Gewichte zusammen.', 'fertig'); return; }
    const w = e.target.closest('[data-weg]');
    if (w) { schale.splice(Number(w.dataset.weg), 1); zeichne(); return; }
    const b = e.target.closest('[data-sz]');
    if (!b) return;
    if (b.dataset.sz === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.sz === 'pruefen') {
      const ok = Number(eing['sz-w']) === wdin.v && eing['sz-w'] !== '';
      bewertung = ok ? { ok, text: `Richtig: ${wdin.art[0].toUpperCase() + wdin.art.slice(1)} ${wdin.n} wiegt ${textM(wdin.v)}.` } : { ok, text: summe() !== wdin.v ? 'Die Waage ist noch nicht im Gleichgewicht.' : 'Zähle die Gewichte noch einmal zusammen.' };
      g.rechts.innerHTML = rechts();
    }
    if (b.dataset.sz === 'tipp') g.sprich(modus === 'waage' ? 'Beginne mit großen Gewichten. Wird die rechte Seite zu schwer, nimm eins weg und probiere ein kleineres.' : 'Stell dir eine bekannte Größe vor: Wie oft passt sie hinein?', 'tipp');
  });

  function start() { g.sprich(modus === 'waage' ? 'Lege Gewichte auf die rechte Schale, bis die Waage gerade steht.' : 'Schätze mit Hilfe der Stützpunkte rechts. Alle Werte sind ungefähre Werte.'); }
  neu(); zeichne(); start();
}
