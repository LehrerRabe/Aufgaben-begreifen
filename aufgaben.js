/* Aufgaben: zufällig erzeugen (drei Stufen) und eigene Eingaben prüfen */

import { ziffern, stellenAnzahl, OBERGRENZE } from './stellen.js';

const zufall = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function uebertraegeAdd(a, b) {
  const n = Math.max(stellenAnzahl(a), stellenAnzahl(b)) + 1;
  const za = ziffern(a, n), zb = ziffern(b, n);
  let c = 0, k = 0;
  for (let p = 0; p < n; p++) { c = za[p] + zb[p] + c >= 10 ? 1 : 0; k += c; }
  return k;
}

function entbuendelnSub(a, b) {
  const n = stellenAnzahl(a);
  const za = ziffern(a, n), zb = ziffern(b, n);
  let c = 0, k = 0;
  for (let p = 0; p < n; p++) { const x = za[p] - zb[p] - c; c = x < 0 ? 1 : 0; k += c; }
  return k;
}

/** Wiederholt einen Zufallsversuch, bis die Bedingung passt. */
function suche(versuch, passt) {
  for (let i = 0; i < 500; i++) {
    const x = versuch();
    if (passt(x)) return x;
  }
  return versuch();
}

export const STUFEN = {
  addition: [
    { stufe: 1, titel: 'Stufe 1', text: 'Dreistellige Zahlen' },
    { stufe: 2, titel: 'Stufe 2', text: 'Vierstellige Zahlen' },
    { stufe: 3, titel: 'Stufe 3', text: 'Große Zahlen bis 999 999' },
  ],
  subtraktion: [
    { stufe: 1, titel: 'Stufe 1', text: 'Dreistellige Zahlen' },
    { stufe: 2, titel: 'Stufe 2', text: 'Vierstellig, auch mit Nullen' },
    { stufe: 3, titel: 'Stufe 3', text: 'Große Zahlen bis 999 999' },
  ],
  multiplikation: [
    { stufe: 1, titel: 'Stufe 1', text: 'Mal einstellige Zahl' },
    { stufe: 2, titel: 'Stufe 2', text: 'Mal zweistellige Zahl' },
    { stufe: 3, titel: 'Stufe 3', text: 'Große Zahlen, bis dreistellig' },
  ],
  division: [
    { stufe: 1, titel: 'Stufe 1', text: 'Dreistellig, ohne Rest' },
    { stufe: 2, titel: 'Stufe 2', text: 'Vierstellig, mit Rest' },
    { stufe: 3, titel: 'Stufe 3', text: 'Große Zahlen bis 999 999' },
  ],
};

export function neueAufgabe(art, stufe) {
  switch (art) {
    case 'addition': {
      if (stufe === 1) return suche(() => ({ a: zufall(100, 899), b: zufall(100, 899) }),
        ({ a, b }) => a + b <= 999 && uebertraegeAdd(a, b) >= 1);
      if (stufe === 2) return suche(() => ({ a: zufall(1000, 8999), b: zufall(100, 8999) }),
        ({ a, b }) => a + b <= 9999 && uebertraegeAdd(a, b) >= 2);
      return suche(() => ({ a: zufall(10000, 899999), b: zufall(1000, 899999) }),
        ({ a, b }) => a + b <= OBERGRENZE && uebertraegeAdd(a, b) >= 2);
    }
    case 'subtraktion': {
      if (stufe === 1) return suche(() => { const a = zufall(200, 999); return { a, b: zufall(100, a - 1) }; },
        ({ a, b }) => entbuendelnSub(a, b) >= 1);
      if (stufe === 2) return suche(() => {
        let a = zufall(1000, 9999);
        if (Math.random() < 0.4) { const z = ziffern(a, 4); z[zufall(1, 2)] = 0; a = Number(z.reverse().join('')); }
        return { a, b: zufall(100, a - 1) };
      }, ({ a, b }) => entbuendelnSub(a, b) >= 2 && a > b);
      return suche(() => { const a = zufall(10000, 999999); return { a, b: zufall(1000, a - 1) }; },
        ({ a, b }) => entbuendelnSub(a, b) >= 2);
    }
    case 'multiplikation': {
      if (stufe === 1) return suche(() => ({ a: zufall(12, 999), b: zufall(2, 9) }), ({ a, b }) => a * b <= 9999);
      if (stufe === 2) return suche(() => ({ a: zufall(12, 999), b: zufall(12, 99) }),
        ({ a, b }) => a * b <= 99999 && b % 10 !== 0);
      return suche(() => (Math.random() < 0.5
        ? { a: zufall(1000, 9999), b: zufall(12, 99) }
        : { a: zufall(100, 999), b: zufall(102, 999) }),
      ({ a, b }) => a * b <= OBERGRENZE && b % 10 !== 0);
    }
    case 'division': {
      if (stufe === 1) return suche(() => { const d = zufall(2, 9); const q = zufall(12, 199); return { a: q * d, b: d }; },
        ({ a }) => a >= 100 && a <= 999);
      if (stufe === 2) return suche(() => ({ a: zufall(1000, 9999), b: zufall(2, 9) }), ({ a, b }) => a % b !== 0);
      return { a: zufall(10000, 999999), b: zufall(2, 9) };
    }
    default: return null;
  }
}

/** Prüft eine eigene Aufgabe. Liefert einen Fehlertext oder null. */
export function pruefeEigene(art, a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return 'Bitte gib in beide Felder eine ganze Zahl ein.';
  if (a < 1 || b < 1) return 'Beide Zahlen müssen größer als 0 sein.';
  if (a > OBERGRENZE || b > OBERGRENZE) return 'Die Zahlen dürfen höchstens 999 999 groß sein.';
  switch (art) {
    case 'addition':
      if (a + b > OBERGRENZE) return 'Das Ergebnis wäre größer als 999 999. Wähle kleinere Zahlen.';
      return null;
    case 'subtraktion':
      if (b > a) return 'Die zweite Zahl ist größer als die erste. Das geht hier nicht.';
      return null;
    case 'multiplikation':
      if (b > 999) return 'Die zweite Zahl darf höchstens dreistellig sein.';
      if (a * b > OBERGRENZE) return 'Das Ergebnis wäre größer als 999 999. Wähle kleinere Zahlen.';
      return null;
    case 'division':
      if (b < 2 || b > 9) return 'Teilen kannst du hier durch 2 bis 9, denn es gibt höchstens 9 Figuren.';
      return null;
    default: return 'Unbekannte Rechenart.';
  }
}
