/* Wortartensymbole: Form, Farbe und Größe je Wortart, dazu Merkfragen für die Tipps.
   Eigene Farbzuordnung der App (bewusst nicht die klassischen Materialfarben):
   Nomen blau, Verb rot, Adjektiv grün wie in vielen Schulbüchern; Begleiter und Stellvertreter des
   Nomens in Nachbarfarben (Artikel gelb, Pronomen türkis), Adverb beerenrot nahe beim Verb.
   Alle Farben lassen sich hier zentral ändern. */

export const WORTARTEN = {
  N: { name: 'Nomen', zusatz: 'Namenwort', farbe: '#1f5fd1', form: 'dreieck', groesse: 1,
    frage: 'Kann man es sehen, anfassen oder benennen? Nomen schreibt man groß, und man kann der, die oder das davorsetzen.',
    beispiele: 'Hund, Haus, Lea' },
  A: { name: 'Artikel', zusatz: 'Begleiter', farbe: '#e8a317', form: 'dreieck', groesse: 0.55,
    frage: 'Es ist ein kleiner Begleiter, der vor einem Nomen steht: der, die, das, ein, eine.',
    beispiele: 'der, die, das, ein, eine' },
  J: { name: 'Adjektiv', zusatz: 'Eigenschaftswort', farbe: '#2a9d5c', form: 'dreieck', groesse: 0.78,
    frage: 'Es sagt, wie etwas oder jemand ist. Frage: Wie ist das …?',
    beispiele: 'groß, rot, alt' },
  V: { name: 'Verb', zusatz: 'Tunwort', farbe: '#d7263d', form: 'kreis', groesse: 1,
    frage: 'Es sagt, was jemand tut oder was geschieht. Probiere: ich …, du …, er …',
    beispiele: 'laufen, singt, liest' },
  D: { name: 'Adverb', zusatz: 'Umstandswort', farbe: '#c2407f', form: 'kreis', groesse: 0.55,
    frage: 'Es sagt, wann, wo oder wie gern etwas geschieht: heute, dort, gern, oft …',
    beispiele: 'heute, dort, gern' },
  P: { name: 'Pronomen', zusatz: 'Fürwort', farbe: '#13a3a8', form: 'spitz', groesse: 1,
    frage: 'Es steht für ein Nomen: ich, du, er, sie, es, wir, ihr, uns …',
    beispiele: 'ich, du, er, sie' },
  R: { name: 'Präposition', zusatz: 'Verhältniswort', farbe: '#9a6233', form: 'mond', groesse: 0.95,
    frage: 'Es zeigt, wie Dinge zueinander stehen, oft einen Ort: auf, unter, in, mit, hinter …',
    beispiele: 'auf, unter, mit' },
  K: { name: 'Konjunktion', zusatz: 'Bindewort', farbe: '#6b7280', form: 'balken', groesse: 0.9,
    frage: 'Es verbindet Wörter oder Sätze: und, oder, aber, denn.',
    beispiele: 'und, oder, aber' },
};

/** Form im Feld 100 × 100, auf der Grundlinie y = 96 stehend. */
function form(f, s, farbe) {
  switch (f) {
    case 'dreieck': {
      const w = 92 * s, h = w * 0.866;
      return `<path d="M${50 - w / 2} 96 L${50 + w / 2} 96 L50 ${96 - h}Z" fill="${farbe}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    }
    case 'spitz': {
      const w = 52 * s, h = 92 * s;
      return `<path d="M${50 - w / 2} 96 L${50 + w / 2} 96 L50 ${96 - h}Z" fill="${farbe}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    }
    case 'kreis': {
      const r = 45 * s;
      return `<circle cx="50" cy="${96 - r}" r="${r}" fill="${farbe}" stroke="#fff" stroke-width="3"/>`;
    }
    case 'mond': {
      const R = 46 * s, r = 28 * s;
      return `<path d="M${50 - R} 96 A${R} ${R} 0 0 1 ${50 + R} 96 L${50 + r} 96 A${r} ${r} 0 0 0 ${50 - r} 96Z" fill="${farbe}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    }
    case 'balken': {
      const w = 90 * s;
      return `<rect x="${50 - w / 2}" y="78" width="${w}" height="18" rx="4" fill="${farbe}" stroke="#fff" stroke-width="3"/>`;
    }
    default: return '';
  }
}

/** Symbol einer Wortart als SVG (skaliert mit der Schriftgröße bzw. CSS). */
export function symbolSvg(kuerzel) {
  const w = WORTARTEN[kuerzel];
  if (!w) return '';
  return `<svg class="wa-symbol" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${form(w.form, w.groesse, w.farbe)}</svg>`;
}

/** Nur die Form (für Kachelbilder und Hintergründe), an beliebiger Stelle. */
export function symbolForm(kuerzel, x, y, groesse, extra = '') {
  const w = WORTARTEN[kuerzel];
  return `<g transform="translate(${x} ${y}) scale(${groesse / 100})"${extra}>${form(w.form, w.groesse, w.farbe)}</g>`;
}
