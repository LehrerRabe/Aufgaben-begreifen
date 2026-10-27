/* Stellenwerte: Namen, Farben, Zerlegen und Zusammensetzen von Zahlen */

export const STELLEN = [
  { kurz: 'E',  name: 'Einer',            wert: 1,       farbe: 'gruen' },
  { kurz: 'Z',  name: 'Zehner',           wert: 10,      farbe: 'blau'  },
  { kurz: 'H',  name: 'Hunderter',        wert: 100,     farbe: 'rot'   },
  { kurz: 'T',  name: 'Tausender',        wert: 1000,    farbe: 'gruen' },
  { kurz: 'ZT', name: 'Zehntausender',    wert: 10000,   farbe: 'blau'  },
  { kurz: 'HT', name: 'Hunderttausender', wert: 100000,  farbe: 'rot'   },
  { kurz: 'M',  name: 'Millionen',        wert: 1000000, farbe: 'gruen' },
];

/** Bis zu dieser Zahl kann das Perlenmaterial (Perle, Stange, Platte, Würfel) gezeigt werden. */
export const PERLEN_GRENZE = 9999;

/** Größte Zahl, die in der App vorkommen darf. */
export const OBERGRENZE = 999999;

/** Name einer Stelle; für Stellen ohne Eintrag ein neutraler Ersatz. */
export function stellenName(p) {
  return STELLEN[p] ? STELLEN[p].name : `Stelle ${p + 1}`;
}

/** Anzahl der Ziffern einer Zahl (0 hat eine Ziffer). */
export function stellenAnzahl(zahl) {
  return String(Math.max(0, Math.trunc(zahl))).length;
}

/** Ziffern einer Zahl als Feld; Index 0 = Einer. */
export function ziffern(zahl, n = stellenAnzahl(zahl)) {
  const s = String(zahl);
  const z = [];
  for (let p = 0; p < n; p++) {
    const ch = s[s.length - 1 - p];
    z.push(ch === undefined ? 0 : Number(ch));
  }
  return z;
}

/** Wert aus Anzahlen je Stelle (auch wenn eine Stelle 10 oder mehr hat). */
export function wertAus(anzahlen) {
  return anzahlen.reduce((summe, a, p) => summe + a * 10 ** p, 0);
}

/** Zahl mit schmalem Leerzeichen als Tausendertrenner, wie in Schulbüchern. */
export function fmt(zahl) {
  const s = String(zahl);
  if (s.length <= 4) return s;
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function gleich(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}
