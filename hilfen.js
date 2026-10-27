/* Gemeinsame Bausteine für die Rechenarten */

import { stellenName, fmt, gleich } from './stellen.js';

/** Plus-/Minus-Knöpfe zum Legen einer Zahl. */
export function legeKnoepfe(anzahlen, p, max = 9) {
  return [
    { aktion: 'minus', text: '−', art: 'minus', label: `1 ${stellenName(p)} wegnehmen`, aus: anzahlen[p] <= 0 },
    { aktion: 'plus', text: '+', art: 'plus', label: `1 ${stellenName(p)} dazulegen`, aus: anzahlen[p] >= max },
  ];
}

/** Plus/Minus beim Legen ausführen. */
export function legeAktion(anzahlen, aktion, p, max = 9) {
  if (aktion === 'plus' && anzahlen[p] < max) { anzahlen[p]++; return { neu: { stelle: p, anzahl: 1 } }; }
  if (aktion === 'minus' && anzahlen[p] > 0) { anzahlen[p]--; return {}; }
  return null;
}

/**
 * Tipp, solange eine Zahl noch nicht richtig liegt.
 * Liefert null, wenn alles passt.
 */
export function legeTipp({ anzahlen, soll, zahl, tablett, wer }) {
  if (gleich(anzahlen, soll)) return null;
  for (let p = soll.length - 1; p >= 0; p--) {
    const diff = soll[p] - anzahlen[p];
    if (diff === 0) continue;
    const name = stellenName(p);
    const text = diff > 0
      ? `Lege ${wer} ${fmt(zahl)}. Bei den ${name}n fehlen noch ${diff}.`
      : `Lege ${wer} ${fmt(zahl)}. Bei den ${name}n liegen ${-diff} zu viel.`;
    return {
      text,
      ziel: { aktion: diff > 0 ? 'plus' : 'minus', tablett, stelle: p },
      vor: { aktion: 'legen', tablett },
      vorText: `Ich lege ${wer} ${fmt(zahl)} für dich.`,
    };
  }
  return null;
}

/** Dativ Plural der Stellennamen: "bei den Zehnern", "bei den Einern". */
export function beiDen(p) {
  return `bei den ${stellenName(p)}n`;
}

/** "1 Zehner" / "3 Zehner" – die Stellennamen ändern sich im Plural nicht. */
export function anzahlText(a, p) {
  return `${a} ${stellenName(p)}`;
}
