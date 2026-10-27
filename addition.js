/* Addieren: beide Zahlen legen, zusammenschieben, 10 gegen 1 umtauschen */

import { ziffern, stellenAnzahl, stellenName, fmt, gleich, PERLEN_GRENZE } from './stellen.js';
import { tablettHtml, stellenKopfHtml } from './material.js';
import { rasterHtml, auswerten, loesungAus, leer, fest } from './schrift.js';
import { legeKnoepfe, legeAktion, legeTipp, beiDen } from './hilfen.js';

export const INFO = { id: 'addition', titel: 'Addieren', zeichen: '+' };

export function erzeuge({ a, b }) {
  const summe = a + b;
  const n = Math.max(stellenAnzahl(summe), stellenAnzahl(a), stellenAnzahl(b));
  const za = ziffern(a, n), zb = ziffern(b, n), zs = ziffern(summe, n);
  const lenS = stellenAnzahl(summe);

  // Überträge des schriftlichen Verfahrens (in die Stelle p)
  const uebertrag = Array(n).fill(0);
  for (let p = 0, c = 0; p < n; p++) {
    const s = za[p] + zb[p] + c;
    c = s >= 10 ? 1 : 0;
    if (p + 1 < n) uebertrag[p + 1] = c;
  }

  const z = {
    A: Array(n).fill(0), B: Array(n).fill(0), S: Array(n).fill(0),
    zusammen: false, getauscht: Array(n).fill(0),
  };

  // höchstens so viele Teile liegen im Ergebnis-Tablett: beide Ziffern plus Übertrag
  const platzS = za.map((x, p) => x + zb[p] + uebertrag[p]);

  const fertigMaterial = () => z.zusammen && z.S.every(x => x < 10);

  function materialHtml(ui) {
    const t = (id, titel, zahl, anz, soll) => tablettHtml({
      id, titel, n, modus: ui.modus, anzahlen: anz, anzahlZeigen: ui.anzahl, neu: ui.neu,
      plaetze: soll,
      zusatz: z.zusammen ? '<span class="status">zusammengeschoben</span>'
        : gleich(anz, soll) ? `<span class="status ok">✓ ${fmt(zahl)} liegt</span>`
        : `<span class="status">lege ${fmt(zahl)}</span>`,
      knoepfe: z.zusammen ? null : p => legeKnoepfe(anz, p),
    });
    const bereit = gleich(z.A, za) && gleich(z.B, zb);
    return `${stellenKopfHtml(n)}
      ${t('A', `1. Zahl: ${fmt(a)}`, a, z.A, za)}
      ${t('B', `2. Zahl: ${fmt(b)}`, b, z.B, zb)}
      <div class="zwischenknopf">
        <button type="button" class="kn kn-haupt" data-aktion="zusammen"${z.zusammen ? ' disabled' : ''}>
          ⬇ Zusammenschieben</button>
        ${!z.zusammen && !bereit ? '<span class="leise">Lege zuerst beide Zahlen.</span>' : ''}
      </div>
      ${tablettHtml({
        id: 'S', titel: 'Zusammen', n, modus: ui.modus, anzahlen: z.S, anzahlZeigen: ui.anzahl, neu: ui.neu,
        warnAb: 10, klasse: 'ergebnis-tablett', plaetze: platzS,
        zusatz: fertigMaterial() ? `<span class="status ok">= ${fmt(summe)}</span>`
          : z.zusammen ? '<span class="status warn">Wo liegen 10 oder mehr?</span>' : '',
        knoepfe: !z.zusammen ? null : p => [
          p < n - 1 && z.S[p] >= 10
            ? { aktion: 'tauschen', text: `10 ➜ 1`, art: 'tausch', label: `10 ${stellenName(p)} gegen 1 ${stellenName(p + 1)} umtauschen` }
            : null,
        ],
      })}`;
  }

  function erwartungen() {
    const e = [];
    for (let p = 0; p < n; p++) {
      e.push({ key: `e${p}`, soll: p < lenS ? String(zs[p]) : '', art: p < lenS ? 'pflicht' : 'leer' });
      if (p > 0) e.push({ key: `u${p}`, soll: uebertrag[p] ? '1' : '', art: 'optional' });
    }
    return e;
  }

  function schriftHtml(ui) {
    const zeile = (zeichen, ziff, len) => ({
      zellen: [fest(zeichen, 'zeichen'), ...Array.from({ length: n }, (_, i) => {
        const p = n - 1 - i;
        return p < len ? fest(ziff[p]) : leer();
      })],
    });
    const ue = {
      klasse: 'uebertrag-zeile',
      zellen: [leer(), ...Array.from({ length: n }, (_, i) => {
        const p = n - 1 - i;
        if (p === 0) return leer();
        return { t: 'i', key: `u${p}`, klein: true, label: `Übertrag ${beiDen(p)}`,
          cue: z.getauscht[p] > 0 && !ui.eingaben[`u${p}`] };
      })],
    };
    const erg = {
      klasse: 'ergebnis-zeile',
      zellen: [leer(), ...Array.from({ length: n }, (_, i) => {
        const p = n - 1 - i;
        return { t: 'i', key: `e${p}`, weiter: p + 1 < n ? `e${p + 1}` : '', label: `Ergebnis ${beiDen(p)}` };
      })],
    };
    return rasterHtml(n + 1, [zeile('', za, stellenAnzahl(a)), zeile('+', zb, stellenAnzahl(b)), ue, erg], ui)
      + '<p class="schrift-hinweis">Rechne von rechts nach links. Den Übertrag schreibst du klein über den Strich.</p>';
  }

  function aktion(name, d) {
    const p = d.stelle;
    if (name === 'plus' || name === 'minus') {
      if (z.zusammen) return null;
      const r = legeAktion(d.tablett === 'A' ? z.A : z.B, name, p);
      if (r?.neu) r.neu.tablett = d.tablett;
      return r;
    }
    if (name === 'legen') {
      if (z.zusammen) return null;
      if (d.tablett === 'A') z.A = [...za]; else z.B = [...zb];
      return { neu: { tablett: d.tablett, alle: true } };
    }
    if (name === 'zusammen') {
      if (z.zusammen) return null;
      if (!gleich(z.A, za) || !gleich(z.B, zb)) {
        return { meldung: 'Lege zuerst beide Zahlen richtig. Dann kannst du sie zusammenschieben.' };
      }
      z.S = z.A.map((x, i) => x + z.B[i]);
      z.A = Array(n).fill(0); z.B = Array(n).fill(0);
      z.zusammen = true;
      return { neu: { tablett: 'S', alle: true } };
    }
    if (name === 'tauschen') {
      if (!z.zusammen || z.S[p] < 10 || p >= n - 1) return null;
      z.S[p] -= 10; z.S[p + 1] += 1; z.getauscht[p + 1]++;
      return {
        neu: { tablett: 'S', stelle: p + 1, anzahl: 1 },
        meldung: `10 ${stellenName(p)} sind 1 ${stellenName(p + 1)}. Schreib den Übertrag 1 ${beiDen(p + 1)} auf.`,
      };
    }
    return null;
  }

  function tipp() {
    if (!z.zusammen) {
      const ta = legeTipp({ anzahlen: z.A, soll: za, zahl: a, tablett: 'A', wer: 'die 1. Zahl' });
      if (ta) return ta;
      const tb = legeTipp({ anzahlen: z.B, soll: zb, zahl: b, tablett: 'B', wer: 'die 2. Zahl' });
      if (tb) return tb;
      return {
        text: 'Beide Zahlen liegen. Schiebe sie jetzt zusammen.',
        ziel: { aktion: 'zusammen' }, vor: { aktion: 'zusammen' }, vorText: 'Ich schiebe beide Zahlen zusammen.',
      };
    }
    for (let p = 0; p < n; p++) {
      if (z.S[p] >= 10) {
        return {
          text: `${beiDen(p)[0].toUpperCase() + beiDen(p).slice(1)} liegen ${z.S[p]}. Tausche 10 ${stellenName(p)} gegen 1 ${stellenName(p + 1)}. In der Rechnung ist das der Übertrag.`,
          ziel: { aktion: 'tauschen', tablett: 'S', stelle: p },
          vor: { aktion: 'tauschen', tablett: 'S', stelle: p },
          vorText: `Ich tausche 10 ${stellenName(p)} gegen 1 ${stellenName(p + 1)}.`,
        };
      }
    }
    return { text: `Fertig! Jetzt liegt ${fmt(summe)} da. Schreib das Ergebnis in die Rechnung und tippe auf „Prüfen“.`, fertig: true };
  }

  return {
    aufgabeText: `${fmt(a)} + ${fmt(b)}`,
    kannPerlen: Math.max(a, b, summe) <= PERLEN_GRENZE,
    materialHtml, schriftHtml, aktion, tipp, erwartungen,
    pruefe: ein => auswerten(erwartungen(), ein),
    loesung: () => loesungAus(erwartungen()),
    fertigMaterial,
  };
}
