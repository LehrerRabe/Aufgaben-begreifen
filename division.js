/* Dividieren: die Zahl legen und gerecht auf Figuren verteilen.
   Was nicht reicht, wird entbündelt (1 gegen 10). Was am Ende übrig bleibt, ist der Rest. */

import { ziffern, stellenAnzahl, stellenName, fmt, gleich, wertAus, PERLEN_GRENZE } from './stellen.js';
import { tablettHtml, stellenKopfHtml, stapelHtml, figurSvg } from './material.js';
import { rasterHtml, auswerten, loesungAus, leer, fest } from './schrift.js';
import { legeKnoepfe, legeAktion, legeTipp, beiDen } from './hilfen.js';

export const INFO = { id: 'division', titel: 'Dividieren', zeichen: ':' };

const gross = s => s[0].toUpperCase() + s.slice(1);

export function erzeuge({ a, b: d }) {
  const q = Math.floor(a / d), rest = a % d;
  const n = stellenAnzahl(a);
  const za = ziffern(a, n), zq = ziffern(q, n);
  const lq = stellenAnzahl(q);

  // Schritte des schriftlichen Verfahrens
  let s = 0;
  for (let p = n - 1; p >= 0; p--) if (Math.floor(a / 10 ** p) >= d) { s = p; break; }
  const schritte = [];
  {
    let cur = Math.floor(a / 10 ** s);
    for (let p = s; p >= 0; p--) {
      const qp = Math.floor(cur / d), sub = qp * d, rem = cur - sub;
      const naechste = p > 0 ? `${rem}${za[p - 1]}` : String(rem);
      schritte.push({ p, cur, sub, rem, naechste });
      if (p > 0) cur = rem * 10 + za[p - 1];
    }
  }

  // Platzbedarf je Stelle auf dem normalen Weg (verteilen, Rest entbündeln)
  const platzV = (() => {
    const v = [...za], spitze = Array(n).fill(0);
    for (let p = n - 1; p >= 0; p--) {
      spitze[p] = v[p];
      v[p] -= Math.floor(v[p] / d) * d;
      if (p > 0) { v[p - 1] += 10 * v[p]; v[p] = 0; }
    }
    return spitze;
  })();

  const z = {
    V: Array(n).fill(0), gelegt: false,
    F: Array.from({ length: d }, () => Array(n).fill(0)),
  };

  const fertigMaterial = () => z.gelegt && z.V.every((x, p) => p === 0 ? x < d : x === 0);
  const pruefeGelegt = () => { if (!z.gelegt && gleich(z.V, za)) z.gelegt = true; };
  const schrittFertig = p => z.gelegt && z.V.every((x, i) => i > p ? x === 0 : true)
    && z.V[p] < d && z.F[0][p] === zq[p];

  function materialHtml(ui) {
    const fertig = fertigMaterial();
    const vorrat = tablettHtml({
      id: 'V', n, modus: ui.modus, anzahlen: z.V, anzahlZeigen: ui.anzahl, neu: ui.neu, plaetze: platzV,
      titel: z.gelegt ? 'Zum Verteilen' : `Lege die Zahl ${fmt(a)}`,
      zusatz: fertig ? `<span class="status ${z.V[0] ? 'warn' : 'ok'}">${z.V[0] ? `Rest: ${z.V[0]}` : 'kein Rest'}</span>` : '',
      knoepfe: !z.gelegt ? p => legeKnoepfe(z.V, p) : p => [
        p > 0 ? { aktion: 'entbuendeln', text: '1 ➜ 10', art: 'tausch', aus: z.V[p] === 0,
          label: `1 ${stellenName(p)} in 10 ${stellenName(p - 1)} entbündeln` } : null,
        { aktion: 'verteilen', text: 'verteilen', art: 'haupt', aus: z.V[p] < d,
          label: `${stellenName(p)} an alle ${d} Figuren verteilen` },
      ],
    });

    let figuren = '';
    for (let k = 0; k < d; k++) {
      let mini = '';
      for (let p = n - 1; p >= 0; p--) {
        const neu = ui.neu && ui.neu.figuren && ui.neu.stelle === p ? ui.neu.anzahl : 0;
        mini += `<div class="mini-spalte">${stapelHtml(p, z.F[k][p], ui.modus, { neu, plaetze: zq[p] })}</div>`;
      }
      figuren += `<div class="figur" style="--fig:var(--st-gruen)">
        ${figurSvg(k + 1)}
        <div class="mini-tablett" style="--n:${n}">${mini}</div>
        ${ui.anzahl ? `<span class="figur-wert">${fmt(wertAus(z.F[k]))}</span>` : ''}
      </div>`;
    }

    return `${stellenKopfHtml(n)}${vorrat}
      <div class="figuren-kopf"><span class="tablett-titel">${d} Figuren</span>
        ${fertig ? `<span class="status ok">jede hat ${fmt(q)}</span>` : '<span class="status">jede bekommt gleich viel</span>'}</div>
      <div class="figuren">${figuren}</div>`;
  }

  function erwartungen() {
    const e = [];
    ziffern(q).reverse().forEach((dd, i) => e.push({ key: `q${i}`, soll: String(dd), art: 'pflicht' }));
    e.push({ key: 'rest', soll: rest ? String(rest) : '', art: rest ? 'pflicht' : 'leer' });
    return e;
  }

  function schriftHtml(ui) {
    const total = 1 + n + 3 + lq + 2;
    const kopf = { zellen: [
      leer(), ...Array.from({ length: n }, (_, i) => fest(za[n - 1 - i])),
      fest(':', 'zeichen'), fest(d), fest('=', 'zeichen'),
      ...Array.from({ length: lq }, (_, i) => ({ t: 'i', key: `q${i}`, weiter: i + 1 < lq ? `q${i + 1}` : 'rest', label: `Ergebnis, ${i + 1}. Ziffer` })),
      fest('R', 'zeichen rest-zeichen'), { t: 'i', key: 'rest', max: 1, label: 'Rest' },
    ] };
    const zeilen = [kopf];

    const spalteVon = p => 1 + (n - 1 - p);
    const zeileMit = (text, endeP, mitMinus, klasse) => {
      const zellen = Array.from({ length: total }, () => leer());
      const ende = spalteVon(endeP);
      const anfang = ende - text.length + 1;
      [...text].forEach((ch, i) => { zellen[anfang + i] = fest(ch, klasse); });
      if (mitMinus) zellen[anfang - 1] = fest('−', 'zeichen ' + klasse);
      return { zellen };
    };

    if (ui.rechenweg) {
      for (const st of schritte) {
        if (!schrittFertig(st.p)) break;
        zeilen.push(zeileMit(String(st.sub), st.p, true, 'unterstrich'));
        zeilen.push(zeileMit(st.naechste, st.p > 0 ? st.p - 1 : 0, false, ''));
      }
    }
    const hinweis = ui.rechenweg
      ? 'Der Rechenweg wächst mit, während du am Material verteilst und entbündelst.'
      : 'Der Rechenweg ist ausgeblendet. Du kannst ihn oben wieder einschalten.';
    return rasterHtml(total, zeilen, ui) + `<p class="schrift-hinweis">${hinweis}</p>`;
  }

  function verteilen(p) {
    if (z.V[p] < d) return false;
    z.V[p] -= d;
    for (const f of z.F) f[p]++;
    return true;
  }

  function aktion(name, dd) {
    const p = dd.stelle;
    if (name === 'plus' || name === 'minus') {
      if (z.gelegt) return null;
      const r = legeAktion(z.V, name, p);
      if (r?.neu) r.neu.tablett = 'V';
      pruefeGelegt();
      if (z.gelegt) return { ...r, meldung: `${fmt(a)} liegt. Jetzt wird gerecht verteilt.` };
      return r;
    }
    if (name === 'legen') {
      if (z.gelegt) return null;
      z.V = [...za]; pruefeGelegt();
      return { neu: { tablett: 'V', alle: true } };
    }
    if (!z.gelegt) return null;
    if (name === 'verteilen') {
      if (!verteilen(p)) return { meldung: `Es sind weniger als ${d} da. Das reicht nicht für jede Figur.` };
      return { neu: { figuren: true, stelle: p, anzahl: 1 } };
    }
    if (name === 'verteilenAlle') {
      let k = 0;
      while (verteilen(p)) k++;
      return k ? { neu: { figuren: true, stelle: p, anzahl: k } } : null;
    }
    if (name === 'entbuendeln' || name === 'entbuendelnAlle') {
      if (p === 0 || z.V[p] === 0) return null;
      const k = name === 'entbuendelnAlle' ? z.V[p] : 1;
      z.V[p] -= k; z.V[p - 1] += 10 * k;
      return {
        neu: { tablett: 'V', stelle: p - 1, anzahl: 10 * k },
        meldung: `${k} ${stellenName(p)} ${k === 1 ? 'ist' : 'sind'} ${10 * k} ${stellenName(p - 1)}.`,
      };
    }
    return null;
  }

  function tipp() {
    if (!z.gelegt) return legeTipp({ anzahlen: z.V, soll: za, zahl: a, tablett: 'V', wer: 'die Zahl' });
    for (let p = n - 1; p >= 0; p--) {
      if (z.V[p] === 0) continue;
      if (z.V[p] >= d) {
        return {
          text: `Verteile die ${stellenName(p)} gerecht auf die ${d} Figuren. Tippe auf „verteilen“, bis weniger als ${d} übrig sind.`,
          ziel: { aktion: 'verteilen', tablett: 'V', stelle: p },
          vor: { aktion: 'verteilenAlle', tablett: 'V', stelle: p }, vorText: `Ich verteile die ${stellenName(p)}.`,
        };
      }
      if (p > 0) {
        return {
          text: `${gross(beiDen(p))} ${z.V[p] === 1 ? 'liegt' : 'liegen'} noch ${z.V[p]}. Das reicht nicht für alle ${d} Figuren. Entbündle sie: 1 ${stellenName(p)} sind 10 ${stellenName(p - 1)}.`,
          ziel: { aktion: 'entbuendeln', tablett: 'V', stelle: p },
          vor: { aktion: 'entbuendelnAlle', tablett: 'V', stelle: p }, vorText: `Ich entbündle die ${stellenName(p)}.`,
        };
      }
      break;
    }
    return {
      text: `Fertig! Jede Figur hat ${fmt(q)} bekommen. ${z.V[0] ? `Es bleibt ein Rest von ${z.V[0]}.` : 'Es bleibt nichts übrig.'} Schreib das Ergebnis auf und tippe auf „Prüfen“.`,
      fertig: true,
    };
  }

  return {
    aufgabeText: `${fmt(a)} : ${d}`,
    kannPerlen: a <= PERLEN_GRENZE,
    mitRechenweg: true,
    materialHtml, schriftHtml, aktion, tipp, erwartungen,
    pruefe: ein => auswerten(erwartungen(), ein),
    loesung: () => loesungAus(erwartungen()),
    fertigMaterial,
  };
}
