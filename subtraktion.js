/* Subtrahieren: erste Zahl legen, wegnehmen, bei Bedarf entbündeln (1 gegen 10) */

import { ziffern, stellenAnzahl, stellenName, fmt, gleich, PERLEN_GRENZE } from './stellen.js';
import { tablettHtml, stellenKopfHtml } from './material.js';
import { rasterHtml, auswerten, loesungAus, leer, fest } from './schrift.js';
import { legeKnoepfe, legeAktion, legeTipp, beiDen } from './hilfen.js';

export const INFO = { id: 'subtraktion', titel: 'Subtrahieren', zeichen: '−' };

const gross = s => s[0].toUpperCase() + s.slice(1);

export function erzeuge({ a, b }) {
  const diff = a - b;
  const n = stellenAnzahl(a);
  const za = ziffern(a, n), zb = ziffern(b, n), zd = ziffern(diff, n);
  const lenD = stellenAnzahl(diff);

  const z = {
    V: Array(n).fill(0), W: Array(n).fill(0), gelegt: false,
    entb: Array(n).fill(0), dazu: Array(n).fill(0),
  };

  // Platzbedarf: Ziffer der Zahl plus 10, wenn in diese Stelle entbündelt wird
  const platzV = Array(n).fill(0);
  for (let p = 0, c = 0; p < n; p++) {
    const x = za[p] - c - zb[p];
    c = x < 0 ? 1 : 0;
    platzV[p] = za[p] + (x < 0 ? 10 : 0);
  }

  const fertigMaterial = () => z.gelegt && gleich(z.W, zb);
  const pruefeGelegt = () => { if (!z.gelegt && gleich(z.V, za)) z.gelegt = true; };

  function materialHtml(ui) {
    const fertig = fertigMaterial();
    return `${stellenKopfHtml(n)}
      ${tablettHtml({
        id: 'V', n, modus: ui.modus, anzahlen: z.V, anzahlZeigen: ui.anzahl, neu: ui.neu, plaetze: platzV,
        titel: z.gelegt ? 'Das liegt da' : `Lege die Zahl ${fmt(a)}`,
        zusatz: fertig ? `<span class="status ok">übrig: ${fmt(diff)}</span>`
          : z.gelegt ? `<span class="status">nimm ${fmt(b)} weg</span>` : '',
        knoepfe: !z.gelegt ? p => legeKnoepfe(z.V, p) : p => [
          p > 0 ? { aktion: 'entbuendeln', text: '1 ➜ 10', art: 'tausch', aus: z.V[p] === 0,
            label: `1 ${stellenName(p)} in 10 ${stellenName(p - 1)} entbündeln` } : null,
          { aktion: 'weg', text: '− weg', art: 'minus', aus: z.V[p] === 0 || z.W[p] >= zb[p],
            label: `1 ${stellenName(p)} wegnehmen` },
        ],
      })}
      ${tablettHtml({
        id: 'W', n, modus: ui.modus, anzahlen: z.W, anzahlZeigen: ui.anzahl, neu: ui.neu, plaetze: zb,
        klasse: 'weg-tablett',
        titel: `Weggenommen (${fmt(b)})`,
        zusatz: gleich(z.W, zb) ? '<span class="status ok">✓ alles weggenommen</span>' : '',
        knoepfe: !z.gelegt ? null : p => [
          { aktion: 'zurueck', text: '↩', art: 'neutral', aus: z.W[p] === 0, label: `1 ${stellenName(p)} zurücklegen` },
        ],
      })}`;
  }

  function erwartungen() {
    const e = [];
    for (let p = 0; p < n; p++) {
      e.push({ key: `e${p}`, soll: p < lenD ? String(zd[p]) : '', art: p < lenD ? 'pflicht' : 'leer' });
    }
    return e;
  }

  function schriftHtml(ui) {
    const geaendert = p => z.entb[p] > 0 || z.dazu[p] > 0;
    const spalte = f => Array.from({ length: n }, (_, i) => f(n - 1 - i));
    const lenB = stellenAnzahl(b);
    const hilfs = { klasse: 'hilfs-zeile', zellen: [leer(), ...spalte(p =>
      geaendert(p) ? fest(za[p] - z.entb[p] + 10 * z.dazu[p], 'neu-wert') : leer())] };
    const min = { zellen: [fest('', 'zeichen'), ...spalte(p => fest(za[p], geaendert(p) ? 'durch' : ''))] };
    const sub = { zellen: [fest('−', 'zeichen'), ...spalte(p => p < lenB ? fest(zb[p]) : leer())] };
    const erg = { klasse: 'ergebnis-zeile', zellen: [leer(), ...spalte(p =>
      ({ t: 'i', key: `e${p}`, weiter: p + 1 < n ? `e${p + 1}` : '', label: `Ergebnis ${beiDen(p)}` }))] };
    return rasterHtml(n + 1, [hilfs, min, sub, erg], ui)
      + '<p class="schrift-hinweis">Rechne von rechts nach links. Wenn du am Material entbündelst, erscheint hier oben die neue Zahl und die alte Ziffer wird durchgestrichen.</p>';
  }

  function aktion(name, d) {
    const p = d.stelle;
    if (name === 'plus' || name === 'minus') {
      if (z.gelegt || d.tablett !== 'V') return null;
      const r = legeAktion(z.V, name, p);
      if (r?.neu) r.neu.tablett = 'V';
      pruefeGelegt();
      if (z.gelegt) return { ...r, meldung: `${fmt(a)} liegt. Jetzt nimm ${fmt(b)} weg.` };
      return r;
    }
    if (name === 'legen') {
      if (z.gelegt) return null;
      z.V = [...za]; pruefeGelegt();
      return { neu: { tablett: 'V', alle: true } };
    }
    if (!z.gelegt) return null;
    if (name === 'weg') {
      if (z.V[p] === 0) return null;
      if (z.W[p] >= zb[p]) return { meldung: `${gross(beiDen(p))} musst du nur ${zb[p]} wegnehmen.` };
      z.V[p]--; z.W[p]++;
      return { neu: { tablett: 'W', stelle: p, anzahl: 1 } };
    }
    if (name === 'wegAlle') {
      const k = Math.min(zb[p] - z.W[p], z.V[p]);
      if (k <= 0) return null;
      z.V[p] -= k; z.W[p] += k;
      return { neu: { tablett: 'W', stelle: p, anzahl: k } };
    }
    if (name === 'zurueck') {
      if (z.W[p] === 0) return null;
      z.W[p]--; z.V[p]++;
      return { neu: { tablett: 'V', stelle: p, anzahl: 1 } };
    }
    if (name === 'entbuendeln') {
      if (p === 0 || z.V[p] === 0) return null;
      z.V[p]--; z.V[p - 1] += 10; z.entb[p]++; z.dazu[p - 1]++;
      return {
        neu: { tablett: 'V', stelle: p - 1, anzahl: 10 },
        meldung: `1 ${stellenName(p)} sind 10 ${stellenName(p - 1)}. Schau in die Rechnung: Dort steht jetzt die neue Zahl.`,
      };
    }
    return null;
  }

  function tipp() {
    if (!z.gelegt) return legeTipp({ anzahlen: z.V, soll: za, zahl: a, tablett: 'V', wer: 'die Zahl' });
    for (let p = 0; p < n; p++) {
      const noetig = zb[p] - z.W[p];
      if (noetig <= 0) continue;
      if (z.V[p] >= noetig) {
        return {
          text: `Nimm ${beiDen(p)} ${noetig} weg.`,
          ziel: { aktion: 'weg', tablett: 'V', stelle: p },
          vor: { aktion: 'wegAlle', tablett: 'V', stelle: p }, vorText: `Ich nehme ${beiDen(p)} ${noetig} weg.`,
        };
      }
      let q = p + 1;
      while (q < n && z.V[q] === 0) q++;
      if (q >= n) return { text: 'Hier stimmt etwas nicht. Tippe auf „Von vorn“.' };
      const text = q === p + 1
        ? `${gross(beiDen(p))} liegen nur ${z.V[p]}, du musst aber ${noetig} wegnehmen. Entbündle 1 ${stellenName(q)} in 10 ${stellenName(p)}.`
        : `${gross(beiDen(p))} liegen nur ${z.V[p]}, und ${beiDen(p + 1)} liegt nichts. Entbündle zuerst 1 ${stellenName(q)} in 10 ${stellenName(q - 1)}.`;
      return {
        text, ziel: { aktion: 'entbuendeln', tablett: 'V', stelle: q },
        vor: { aktion: 'entbuendeln', tablett: 'V', stelle: q },
        vorText: `Ich entbündle 1 ${stellenName(q)} in 10 ${stellenName(q - 1)}.`,
      };
    }
    return { text: `Fertig! Übrig bleiben ${fmt(diff)}. Schreib das Ergebnis in die Rechnung und tippe auf „Prüfen“.`, fertig: true };
  }

  return {
    aufgabeText: `${fmt(a)} − ${fmt(b)}`,
    kannPerlen: a <= PERLEN_GRENZE,
    materialHtml, schriftHtml, aktion, tipp, erwartungen,
    pruefe: ein => auswerten(erwartungen(), ein),
    loesung: () => loesungAus(erwartungen()),
    fertigMaterial,
  };
}
