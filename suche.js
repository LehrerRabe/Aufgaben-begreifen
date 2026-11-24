/* Suche über alle Kacheln (Titel, Untertitel, Ordner und Curriculum-Verweis).
   - Groß-/Kleinschreibung und Umlaute sind egal: „bruche“, „BRÜCHE“ und „brueche“ finden „Brüche“.
     faltung() schreibt klein, ersetzt ä/ö/ü/ß durch ae/oe/ue/ss und zieht doppelte Buchstaben zusammen
     („komma“ = „koma“, „masstab“ = „maßstab“). Ziffern bleiben unangetastet.
   - Tippfehler werden toleriert: ab 4 Buchstaben ein Fehler, ab 8 Buchstaben zwei
     (vertauschte, fehlende, zusätzliche oder falsche Buchstaben; Damerau-Levenshtein-Abstand).
     Auch Wortanfänge zählen („wink“ findet „Winkel“, „brueche ad“ findet „Brüche addieren“).
   - Mehrere Wörter grenzen ein (alle müssen passen, Reihenfolge egal).
   - Ein paar Alltagswörter werden mitgedacht: „plus“ → addieren, „geteilt“ → dividieren …
   - Der Jahrgangsfilter schränkt zusätzlich ein (auch ganz ohne Suchwort). */

import { MENUE } from './menue.js';
import { JAHRGAENGE } from './jahrgaenge.js';

export function faltung(x) {
  return String(x ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/([a-z])\1+/g, '$1')
    .trim();
}

/** Wörter, die dasselbe meinen (beide Richtungen werden mitgesucht). */
const SYNONYME = [
  ['plus', 'addieren', 'addition', 'summe'],
  ['minus', 'subtrahieren', 'subtraktion', 'differenz', 'abziehen'],
  ['mal', 'multiplizieren', 'multiplikation', 'produkt'],
  ['geteilt', 'dividieren', 'division', 'teilen', 'quotient'],
  ['prozent', 'prozente', 'prozentrechnung'],
  ['komma', 'kommazahl', 'kommazahlen', 'dezimalzahl', 'dezimalzahlen'],
  ['bruch', 'brueche', 'bruchrechnung', 'bruchrechnen'],
  ['flaeche', 'flaechen', 'flaecheninhalt'],
  ['volumen', 'rauminhalt', 'koerper'],
  ['negativ', 'negative', 'vorzeichen', 'rational', 'rationale'],
  ['wahrscheinlichkeit', 'zufall'],
  ['satzzeichen', 'zeichensetzung'],
  ['grammatik', 'wortarten', 'satzglieder'],
].map(g => g.map(faltung));
function varianten(w) {
  const g = SYNONYME.find(gr => gr.includes(w));
  return g ? [...new Set([w, ...g])] : [w];
}

/** Damerau-Levenshtein (eingeschränkt), bricht ab, sobald grenze überschritten ist. */
function abstand(a, b, grenze) {
  if (Math.abs(a.length - b.length) > grenze) return grenze + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let zeilenMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const k = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + k);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      zeilenMin = Math.min(zeilenMin, d[i][j]);
    }
    if (zeilenMin > grenze) return grenze + 1;
  }
  return d[a.length][b.length];
}
const toleranz = w => (w.length >= 8 ? 2 : w.length >= 4 ? 1 : 0);

/** Wie gut passt ein Suchwort zu einem Wort aus dem Index? 0 = gar nicht. */
function passt(w, t) {
  if (t === w) return 5;
  if (t.startsWith(w)) return 4;
  if (w.length >= 3 && t.includes(w)) return 3;
  const tol = toleranz(w);
  if (!tol) return 0;
  if (abstand(w, t, tol) <= tol) return 2;
  // Tippfehler am Wortanfang: „bruchstrei“ ≈ „bruchstreifen“ (erst ab 5 Buchstaben, sonst zu ungenau)
  if (w.length < 5) return 0;
  for (let l = w.length - 1; l <= w.length + 1; l++) {
    if (l < 3 || l >= t.length) continue;
    if (abstand(w, t.slice(0, l), tol) <= tol) return 1;
  }
  return 0;
}

/* ---------- Index ---------- */
let INDEX = null;
export function index() {
  if (INDEX) return INDEX;
  INDEX = [];
  const geh = (knoten, pfad, ordner) => {
    for (const k of knoten.kinder ?? []) {
      const p = [...pfad, k.id];
      if (k.kinder) geh(k, p, [...ordner, k.titel]);
      else {
        const info = JAHRGAENGE[p.join('.')] ?? { jg: [], quelle: '' };
        const titel = faltung(k.titel);
        const rest = faltung([k.text, ...ordner, info.quelle].join(' '));
        INDEX.push({
          pfad: p, knoten: k, ordner, jg: info.jg, quelle: info.quelle,
          titelWoerter: [...new Set(titel.split(' ').filter(Boolean))],
          woerter: [...new Set(`${titel} ${rest}`.split(' ').filter(Boolean))],
        });
      }
    }
  };
  geh(MENUE, [], []);
  return INDEX;
}

/** Suche: liefert passende Einträge (beste zuerst; ohne Suchwort in Menü-Reihenfolge). */
export function suche(eingabe, jg = null) {
  const woerter = faltung(eingabe).split(' ').filter(Boolean);
  const liste = index().filter(e => !jg || e.jg.includes(jg));
  if (!woerter.length) return liste.map(e => ({ ...e, wert: 0 }));
  const treffer = [];
  for (const e of liste) {
    let summe = 0, ok = true;
    for (const w of woerter) {
      let best = 0;
      for (const v of varianten(w)) {
        const abzug = v === w ? 0 : 2; // verwandte Wörter zählen etwas weniger als das eingetippte
        let b = 0;
        for (const t of e.woerter) { const s = passt(v, t); if (s > b) b = s; if (b === 5) break; }
        if (b && e.titelWoerter.some(t => passt(v, t) >= 2)) b += 3;
        if (b) best = Math.max(best, Math.max(1, b - abzug));
      }
      if (!best) { ok = false; break; }
      summe += best;
    }
    if (ok) treffer.push({ ...e, wert: summe });
  }
  return treffer.sort((a, b) => b.wert - a.wert);
}

/** Alle Jahrgänge, die im Menü vorkommen. */
export function alleJahrgaenge() {
  return [...new Set(index().flatMap(e => e.jg))].sort((a, b) => a - b);
}
