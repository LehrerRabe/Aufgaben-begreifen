/* Multiplizieren mit dem großen Multiplikationsbrett ("Schachbrett"):
   1. Ziffernkarten legen: 1. Zahl mit weißen Karten unter das Brett, 2. Zahl mit grauen Karten rechts daneben.
   2. Für jede Ziffer der 2. Zahl eine Reihe legen: so viele Perlenstäbchen der Ziffer der 1. Zahl
      wie die Ziffer der 2. Zahl angibt (z. B. 3 Vierer-Stäbchen für 4 · 3).
   3. In jedem Feld tauschen: alle Perlen zählen, ein Stäbchen mit dem Einer-Rest bleibt liegen,
      die Zehner wandern als Stäbchen ins Feld links daneben.
   4. Obere Reihen schräg nach unten schieben und dort noch einmal tauschen.
   In jedem Feld der untersten Reihe liegt dann höchstens ein Stäbchen: Das ist das Ergebnis. */

import { ziffern, stellenAnzahl, stellenName, fmt, STELLEN } from './stellen.js';
import { rasterHtml, auswerten, loesungAus, leer, fest } from './schrift.js';

export const INFO = { id: 'multiplikation', titel: 'Multiplizieren', zeichen: '·' };

const farbeVon = p => (STELLEN[p] || STELLEN[p % 3]).farbe;
const WERT = ['1', '10', '100', '1000', '10 000', '100 000', '1 Mio.', '10 Mio.'];
const summe = s => s.reduce((x, y) => x + y, 0);

/** Zahl als Stäbchen (höchstens 9 Perlen je Stäbchen). */
function staebeFuer(n) {
  const s = [];
  while (n > 0) { s.push(Math.min(9, n)); n -= Math.min(9, n); }
  return s;
}

function stabHtml(l, extra = '') {
  return `<i class="pstab pf-${l}${extra}" style="--l:${l}"></i>`;
}

export function erzeuge({ a, b }) {
  const prod = a * b;
  const la = stellenAnzahl(a), lb = stellenAnzahl(b);
  const W = la + lb;
  const za = ziffern(a, la), zb = ziffern(b, lb);
  const lenP = stellenAnzahl(prod);

  const z = {
    karteA: Array(W).fill(null), karteB: Array(lb).fill(null), kartenOk: false,
    wahl: null,           // Kartenplatz, für den gerade eine Ziffer gewählt wird
    auswahl: null,        // gewähltes Stäbchen im Kasten (1–9)
    feld: Array.from({ length: lb }, () => Array.from({ length: W }, () => [])),
    gelegt: Array(lb).fill(false),
    geschoben: lb === 1,
  };

  const soll = (r, c) => (c < la && za[c] > 0 && zb[r] > 0 ? Array(zb[r]).fill(za[c]) : []);
  const gleichSortiert = (x, y) => x.length === y.length && [...x].sort().every((v, i) => v === [...y].sort()[i]);
  const feldOk = (r, c) => gleichSortiert(z.feld[r][c], soll(r, c));
  const reiheOk = r => Array.from({ length: W }, (_, c) => feldOk(r, c)).every(Boolean);
  const mussTauschen = (r, c) => z.feld[r][c].length >= 2 || summe(z.feld[r][c]) >= 10;
  const darfTauschen = r => z.gelegt[r] || (z.geschoben && r === 0);
  const kannTauschen = (r, c) => darfTauschen(r) && mussTauschen(r, c) && (c + 1 < W || summe(z.feld[r][c]) < 10);

  function pruefeKarten() {
    const okA = z.karteA.every((k, c) => k === (c < la ? za[c] : null));
    const okB = z.karteB.every((k, r) => k === zb[r]);
    if (okA && okB) { z.kartenOk = true; z.wahl = null; pruefeReihen(); }
    return { okA, okB };
  }
  function pruefeReihen() {
    for (let r = 0; r < lb; r++) if (!z.gelegt[r] && reiheOk(r)) z.gelegt[r] = true;
  }
  const alleGelegt = () => z.gelegt.every(Boolean);
  const fertigMaterial = () => z.kartenOk && alleGelegt() && z.geschoben
    && z.feld.slice(1).every(r => r.every(f => f.length === 0))
    && z.feld[0].every(f => f.length <= 1);

  // ---------- Zeichnen ----------
  function feldHtml(r, c, ui) {
    const staebe = z.feld[r][c];
    const n = summe(staebe);
    const neu = ui.neu && ui.neu.r === r && ui.neu.c === c ? ui.neu.anzahl ?? 1 : 0;
    const stabListe = staebe.map((l, i) => stabHtml(l, i >= staebe.length - neu ? ' neu' : '')).join('');
    const knoepfe = [];
    if (z.kartenOk && !z.gelegt[r] && staebe.length) {
      knoepfe.push(`<button type="button" class="feld-knopf zurueck-knopf" data-aktion="feldZurueck" data-r="${r}" data-c="${c}" aria-label="Letztes Stäbchen zurücknehmen" title="Letztes Stäbchen zurücknehmen">↩</button>`);
    }
    if (kannTauschen(r, c)) {
      knoepfe.push(`<button type="button" class="feld-knopf tausch-knopf" data-aktion="feldTauschen" data-r="${r}" data-c="${c}" aria-label="Im Feld tauschen">tauschen</button>`);
    }
    return `<div class="feld f-${farbeVon(r + c)}${n >= 10 ? ' zuviel' : ''}" data-r="${r}" data-c="${c}">
      <button type="button" class="feld-flaeche" data-aktion="feld" data-r="${r}" data-c="${c}"
        aria-label="Feld ${stellenName(r + c)}"${z.kartenOk && !z.gelegt[r] ? '' : ' tabindex="-1"'}></button>
      <div class="pstaebe${staebe.length > 9 ? ' voll' : ''}">${stabListe}</div>
      ${ui.anzahl && n > 0 ? `<span class="anzahl">${n}</span>` : ''}
      ${r === 0 ? `<span class="feld-wert">${WERT[c] ?? ''}</span>` : ''}
      ${knoepfe.join('')}
    </div>`;
  }

  function karteHtml(art, i, ziffer, farbe) {
    const aktiv = z.wahl && z.wahl.art === art && z.wahl.i === i;
    return `<button type="button" class="karte karte-${art === 'a' ? 'weiss' : 'grau'} f-${farbe}${ziffer === null ? ' leer' : ''}${aktiv ? ' aktiv' : ''}"
      data-aktion="karteWaehlen" data-art="${art}" data-i="${i}"${z.kartenOk ? ' disabled' : ''}
      aria-label="${art === 'a' ? 'Karte der 1. Zahl' : 'Karte der 2. Zahl'}, ${stellenName(i)}">${ziffer ?? ''}</button>`;
  }

  function werkzeugHtml() {
    if (!z.kartenOk) {
      if (!z.wahl) {
        return `<p class="werkzeug-text">Lege zuerst die Aufgabe ${fmt(a)} · ${fmt(b)}: Tippe auf einen Kartenplatz
          und wähle die Ziffer. Die 1. Zahl kommt mit weißen Karten unter das Brett, die 2. Zahl mit grauen Karten rechts daneben.</p>`;
      }
      const wo = z.wahl.art === 'a' ? `unter dem Feld ${WERT[z.wahl.i]}` : `rechts neben der ${z.wahl.i + 1}. Reihe`;
      let tasten = '';
      for (let d = 0; d <= 9; d++) tasten += `<button type="button" class="ziffer-taste" data-aktion="karte" data-ziffer="${d}">${d}</button>`;
      tasten += '<button type="button" class="ziffer-taste leer-taste" data-aktion="karte" data-ziffer="-1">leer</button>';
      return `<p class="werkzeug-text">Welche Ziffer kommt ${wo}?</p><div class="ziffer-tasten">${tasten}</div>`;
    }
    let kasten = '';
    for (let l = 1; l <= 9; l++) {
      kasten += `<button type="button" class="kasten-fach${z.auswahl === l ? ' gewaehlt' : ''}" data-aktion="waehle" data-laenge="${l}"
        aria-pressed="${z.auswahl === l}" aria-label="Stäbchen mit ${l} Perlen">
        <span class="kasten-stab">${stabHtml(l, ' liegend')}</span><span class="kasten-zahl">${l}</span></button>`;
    }
    const text = fertigMaterial()
      ? `Fertig! In der untersten Reihe liegt das Ergebnis ${fmt(prod)}: Lies die Stäbchen von links nach rechts ab.`
      : alleGelegt()
      ? 'Alle Reihen liegen. Tausche in den Feldern, schiebe nach unten und tausche noch einmal.'
      : z.auswahl ? `Du hast das Stäbchen mit ${z.auswahl} Perlen. Tippe auf ein Feld, um es hinzulegen.`
        : 'Nimm ein Perlenstäbchen aus dem Kasten und lege es in ein Feld.';
    return `<p class="werkzeug-text">${text}</p><div class="kasten" role="group" aria-label="Kasten mit Perlenstäbchen">${kasten}</div>`;
  }

  function materialHtml(ui) {
    let gitter = '';
    for (let r = lb - 1; r >= 0; r--) {
      for (let c = W - 1; c >= 0; c--) gitter += feldHtml(r, c, ui);
      gitter += `<div class="kartenplatz rechts">${karteHtml('b', r, z.karteB[r], farbeVon(r))}</div>`;
    }
    for (let c = W - 1; c >= 0; c--) gitter += `<div class="kartenplatz unten">${karteHtml('a', c, z.karteA[c], farbeVon(c))}</div>`;
    gitter += '<div></div>';

    const werte = [];
    for (let r = lb - 1; r >= 0; r--) {
      if (!z.gelegt[r]) continue;
      const einheit = r === 0 ? '' : ` ${stellenName(r)}`;
      werte.push(`<li><span class="punkt f-${farbeVon(r)}"></span>${fmt(a)} · ${zb[r]}${einheit} = <b>${fmt(a * zb[r])}${einheit}</b></li>`);
    }
    const fertig = fertigMaterial();
    return `
      <div class="brett-holz"><div class="mbrett" style="--w:${W}">${gitter}</div></div>
      <div class="werkzeug">${werkzeugHtml()}</div>
      <div class="zwischenknopf">
        ${lb > 1 ? `<button type="button" class="kn kn-haupt" data-aktion="schieben"${z.geschoben || !alleGelegt() ? ' disabled' : ''}>↙ Schräg nach unten schieben</button>` : ''}
        ${fertig ? `<span class="status ok">= ${fmt(prod)}</span>` : ''}
      </div>
      ${werte.length ? `<ul class="reihen-werte" aria-label="Teilprodukte">${werte.join('')}</ul>` : ''}`;
  }

  // ---------- schriftliche Rechnung ----------
  const G = la + lb + 1;
  const teil = r => a * zb[r];

  function uebertraege() {
    const u = {};
    if (lb === 1) {
      for (let p = 0, c = 0; p < la; p++) {
        const t = za[p] * zb[0] + c; c = Math.floor(t / 10);
        if (c > 0) u[p + 1] = String(c);
      }
    } else {
      const reihen = Array.from({ length: lb }, (_, r) => ({ r, z: ziffern(teil(r)) }));
      for (let o = 0, c = 0; o < lenP; o++) {
        let s = c;
        for (const { r, z: zz } of reihen) { const i = o - r; if (i >= 0 && i < zz.length) s += zz[i]; }
        c = Math.floor(s / 10);
        if (c > 0) u[o + 1] = String(c);
      }
    }
    return u;
  }

  function erwartungen() {
    const e = [];
    if (lb > 1) {
      for (let r = 0; r < lb; r++) {
        ziffern(teil(r)).forEach((d, i) => e.push({ key: `t${r}_${r + i}`, soll: String(d), art: 'pflicht' }));
      }
    }
    const u = uebertraege();
    for (let o = 1; o < lenP; o++) e.push({ key: `u${o}`, soll: u[o] || '', art: 'optional' });
    ziffern(prod).forEach((d, o) => e.push({ key: `e${o}`, soll: String(d), art: 'pflicht' }));
    return e;
  }

  function schriftHtml(ui) {
    const spalten = f => Array.from({ length: G }, (_, i) => f(G - 1 - i));
    const kopf = { zellen: spalten(o => {
      if (o > lb) { const p = o - lb - 1; return p < la ? fest(za[p]) : leer(); }
      if (o === lb) return fest('·', 'zeichen');
      return fest(zb[o]);
    }) };
    const zeilen = [kopf];
    if (lb > 1) {
      for (let r = lb - 1; r >= 0; r--) {
        const len = stellenAnzahl(teil(r));
        zeilen.push({
          klasse: r === lb - 1 ? 'linie-oben' : '',
          zellen: spalten(o => (o >= r && o < r + len)
            ? { t: 'i', key: `t${r}_${o}`, weiter: o + 1 < r + len ? `t${r}_${o + 1}` : '', label: `${fmt(a)} mal ${zb[r]}` }
            : leer()),
        });
      }
    }
    zeilen.push({ klasse: 'uebertrag-zeile' + (lb === 1 ? ' linie-oben' : ''), zellen: spalten(o =>
      o >= 1 && o < lenP ? { t: 'i', key: `u${o}`, klein: true, label: 'Übertrag' } : leer()) });
    zeilen.push({ klasse: 'ergebnis-zeile', zellen: spalten(o =>
      o < lenP ? { t: 'i', key: `e${o}`, weiter: o + 1 < lenP ? `e${o + 1}` : '', label: 'Ergebnis' } : leer()) });

    const hinweis = lb > 1
      ? 'Beginne mit der vordersten Ziffer der 2. Zahl. Jedes Teilergebnis endet genau unter seiner Ziffer. Danach addierst du.'
      : 'Rechne von rechts nach links. Überträge kannst du klein aufschreiben.';
    return rasterHtml(G, zeilen, ui) + `<p class="schrift-hinweis">${hinweis}</p>`;
  }

  // ---------- Aktionen ----------
  function tauschen(r, c) {
    const n = summe(z.feld[r][c]);
    const rest = n % 10, zehner = Math.floor(n / 10);
    z.feld[r][c] = rest ? [rest] : [];
    if (zehner) z.feld[r][c + 1].push(...staebeFuer(zehner));
    return { n, rest, zehner };
  }

  function aktion(name, d) {
    const { r, c } = d;
    switch (name) {
      case 'karteWaehlen': {
        if (z.kartenOk) return null;
        z.wahl = { art: d.art, i: d.i };
        return {};
      }
      case 'karte': {
        if (!z.wahl || z.kartenOk) return null;
        const wert = d.ziffer < 0 ? null : d.ziffer;
        if (z.wahl.art === 'a') z.karteA[z.wahl.i] = wert; else z.karteB[z.wahl.i] = wert;
        z.wahl = null;
        pruefeKarten();
        return z.kartenOk ? { meldung: `Die Aufgabe ${fmt(a)} · ${fmt(b)} liegt. Jetzt kommen die Perlenstäbchen.` } : {};
      }
      case 'kartenLegen': {
        if (z.kartenOk) return null;
        z.karteA = Array.from({ length: W }, (_, i) => (i < la ? za[i] : null));
        z.karteB = [...zb];
        pruefeKarten();
        return {};
      }
      case 'waehle': {
        if (!z.kartenOk) return null;
        z.auswahl = z.auswahl === d.laenge ? null : d.laenge;
        return {};
      }
      case 'feld': {
        if (!z.kartenOk || z.gelegt[r]) return null;
        if (!z.auswahl) return { meldung: 'Nimm zuerst ein Perlenstäbchen aus dem Kasten.' };
        z.feld[r][c].push(z.auswahl);
        const warVorher = z.gelegt[r];
        pruefeReihen();
        const res = { neu: { r, c, anzahl: 1 } };
        if (!warVorher && z.gelegt[r]) {
          res.meldung = `Die Reihe für ${zb[r]} ${r === 0 ? '' : stellenName(r) + ' '}liegt. Jetzt wird getauscht.`;
          z.auswahl = null;
        }
        return res;
      }
      case 'feldRichtig': {
        if (!z.kartenOk || z.gelegt[r]) return null;
        z.feld[r][c] = soll(r, c);
        pruefeReihen();
        if (z.gelegt[r]) z.auswahl = null;
        return { neu: { r, c, anzahl: z.feld[r][c].length } };
      }
      case 'feldZurueck': {
        if (z.gelegt[r] || !z.feld[r][c].length) return null;
        z.feld[r][c].pop();
        return {};
      }
      case 'feldTauschen': {
        if (!kannTauschen(r, c)) return null;
        const t = tauschen(r, c);
        const teile = [];
        if (t.rest) teile.push(`${t.rest} ${t.rest === 1 ? 'bleibt' : 'bleiben'} liegen`);
        if (t.zehner) teile.push(`${t.zehner} ${t.zehner === 1 ? 'wandert' : 'wandern'} als ${stellenName(r + c + 1)} ins Feld links`);
        return {
          neu: t.zehner ? { r, c: c + 1, anzahl: staebeFuer(t.zehner).length } : { r, c, anzahl: 1 },
          meldung: `${t.n} ${stellenName(r + c)}: ${teile.join(', ')}.`,
        };
      }
      case 'schieben': {
        if (z.geschoben || !alleGelegt()) return null;
        for (let rr = 1; rr < lb; rr++) {
          for (let cc = 0; cc < W; cc++) {
            if (!z.feld[rr][cc].length) continue;
            z.feld[0][rr + cc].push(...z.feld[rr][cc]);
            z.feld[rr][cc] = [];
          }
        }
        z.geschoben = true;
        return { meldung: 'Alles liegt jetzt in der untersten Reihe. Felder mit gleicher Farbe auf einer Schräge haben denselben Stellenwert.' };
      }
      default: return null;
    }
  }

  function tipp() {
    if (!z.kartenOk) {
      const { okA } = pruefeKarten();
      if (!okA) {
        const c = z.karteA.findIndex((k, i) => k !== (i < la ? za[i] : null));
        return {
          text: c < la
            ? `Lege die 1. Zahl ${fmt(a)} mit weißen Karten unter das Brett. Unter das Feld ${WERT[c]} gehört die ${za[c]}.`
            : `Unter dem Feld ${WERT[c]} darf keine Karte liegen. Wähle dort „leer“.`,
          ziel: { aktion: 'karteWaehlen', art: 'a', i: c },
          vor: { aktion: 'kartenLegen' }, vorText: 'Ich lege die Ziffernkarten für dich.',
        };
      }
      const r = z.karteB.findIndex((k, i) => k !== zb[i]);
      return {
        text: `Lege die 2. Zahl ${fmt(b)} mit grauen Karten rechts neben das Brett, die Einer unten. In die ${r + 1}. Reihe von unten gehört die ${zb[r]}.`,
        ziel: { aktion: 'karteWaehlen', art: 'b', i: r },
        vor: { aktion: 'kartenLegen' }, vorText: 'Ich lege die Ziffernkarten für dich.',
      };
    }
    for (let r = 0; r < lb; r++) {
      if (!z.gelegt[r]) {
        for (let c = 0; c < W; c++) {
          if (feldOk(r, c)) continue;
          const ist = z.feld[r][c], s = soll(r, c);
          const falsch = ist.some(l => l !== (s[0] ?? -1)) || ist.length > s.length;
          if (falsch) {
            return {
              text: `Im leuchtenden Feld liegt ein Stäbchen, das dort nicht hingehört. Nimm es mit ↩ zurück.`,
              ziel: { aktion: 'feldZurueck', r, c }, vor: { aktion: 'feldRichtig', r, c }, vorText: 'Ich lege das Feld richtig.',
            };
          }
          const reihe = r === 0 ? 'unterste Reihe' : `${r + 1}. Reihe (die ${zb[r]} ${stellenName(r)})`;
          const fehlt = s.length - ist.length;
          return {
            text: `${reihe[0].toUpperCase() + reihe.slice(1)}: ${za[c]} · ${zb[r]}. Lege ${fehlt === s.length ? '' : 'noch '}${fehlt} ${fehlt === 1 ? 'Stäbchen' : 'Stäbchen'} mit ${za[c]} Perlen in das leuchtende Feld.`,
            ziel: z.auswahl === za[c] ? { aktion: 'feld', r, c } : { aktion: 'waehle', laenge: za[c] },
            vor: { aktion: 'feldRichtig', r, c }, vorText: `Ich lege ${zb[r]} Stäbchen mit ${za[c]} Perlen.`,
          };
        }
      }
      if (!z.geschoben || r === 0) {
        for (let c = 0; c < W; c++) {
          if (r > 0 && z.geschoben) break;
          if (!kannTauschen(r, c)) continue;
          const n = summe(z.feld[r][c]);
          return {
            text: n >= 10
              ? `Im leuchtenden Feld liegen ${n} Perlen. Tausche: ${n % 10 ? `Ein Stäbchen mit ${n % 10} Perlen bleibt liegen, ` : 'Hier bleibt nichts liegen, '}${Math.floor(n / 10)} ${Math.floor(n / 10) === 1 ? 'Perle wandert' : 'Perlen wandern'} ins Feld links daneben.`
              : `Im leuchtenden Feld liegen ${n} Perlen auf mehreren Stäbchen. Tausche sie gegen ein Stäbchen mit ${n} Perlen.`,
            ziel: { aktion: 'feldTauschen', r, c }, vor: { aktion: 'feldTauschen', r, c },
            vorText: 'Ich tausche im Feld.',
          };
        }
      }
    }
    if (!z.geschoben) {
      return {
        text: 'Alle Reihen liegen. Schiebe jetzt alle Stäbchen schräg nach links unten in die unterste Reihe.',
        ziel: { aktion: 'schieben' }, vor: { aktion: 'schieben' }, vorText: 'Ich schiebe alles nach unten.',
      };
    }
    return { text: `Fertig! In der untersten Reihe liegt das Ergebnis: ${fmt(prod)}. Schreib die Rechnung auf und tippe auf „Prüfen“.`, fertig: true };
  }

  return {
    aufgabeText: `${fmt(a)} · ${fmt(b)}`,
    kannPerlen: false,
    ohneUmschalter: true,
    materialHtml, schriftHtml, aktion, tipp, erwartungen,
    pruefe: ein => auswerten(erwartungen(), ein),
    loesung: () => loesungAus(erwartungen()),
    fertigMaterial,
  };
}
