/* Zeichnet das Material: Perlen (Perle, Zehnerstange, Hunderterplatte, Tausenderwürfel)
   und Stellenwert-Plättchen. Dazu die "Tabletts" mit Spalten je Stelle. */

import { STELLEN } from './stellen.js';

const PLAETTCHEN_TEXT = ['1', '10', '100', '1000', '10 000', '100 000', '1 000 000'];

/* Bauteile als SVG-Symbole: einmal definiert, beliebig oft verwendet.
   Stange = 10 einzelne Perlen auf einem Draht, Platte = 10 x 10 Perlen,
   Würfel = 10 Platten (sichtbar: Vorderseite, Deckel, Seite mit je 10 x 10 Perlen). */
function perlenRaster(dx = 0, dy = 0) {
  let s = '';
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
    s += `<circle cx="${dx + j + 0.5}" cy="${dy + i + 0.5}" r=".43"/>`;
  }
  return s;
}

export function svgDefs() {
  let stange = '';
  for (let i = 0; i < 10; i++) stange += `<circle cx="5" cy="${5 + 10 * i}" r="4.35"/>`;
  let plattenDraht = '';
  for (let i = 0; i < 10; i++) plattenDraht += `<rect x=".6" y="${i + 0.44}" width="8.8" height=".12"/>`;
  const flaeche = `<rect width="10" height="10" rx=".25" fill="#8a5a06"/>
    <g fill="#5e3c03">${plattenDraht}</g>
    <g fill="url(#ab-perle)">${perlenRaster()}</g>`;
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="ab-perle" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#fff3c2"/><stop offset=".45" stop-color="#eab232"/><stop offset="1" stop-color="#a06b0a"/>
    </radialGradient>
    <pattern id="ab-perlmuster" patternUnits="userSpaceOnUse" width="1" height="1">
      <rect width="1" height="1" fill="#8a5a06"/><circle cx=".5" cy=".5" r=".43" fill="url(#ab-perle)"/>
    </pattern>
    <symbol id="ab-stange" viewBox="0 0 10 100">
      <rect x="4.3" y="0" width="1.4" height="100" rx=".7" fill="#6b4504"/>
      <g fill="url(#ab-perle)" stroke="#7a5208" stroke-width=".5">${stange}</g>
    </symbol>
    <symbol id="ab-platte" viewBox="0 0 10 10">${flaeche}</symbol>
    <symbol id="ab-wuerfel" viewBox="0 0 28 31">
      <g transform="matrix(1.8,0,0,1.8,0,12)">${flaeche}</g>
      <g transform="matrix(1.8,0,0.9,-0.9,0,12)">${flaeche}</g>
      <g transform="matrix(0.9,-0.9,0,1.8,18,12)">${flaeche}</g>
      <path d="M18 12 27 3 27 21 18 30Z" fill="#000" opacity=".2"/>
      <path d="M0 12 9 3 27 3 18 12Z" fill="#fff" opacity=".15"/>
      <path d="M0 12H18V30H0Z M18 12 27 3 M18 30 27 21 27 3 9 3 0 12" fill="none" stroke="#5e3c03" stroke-width=".3"/>
    </symbol>
  </defs>
</svg>`;
}

/** Verkleinerung, damit auch viele Teile in eine Spalte passen. */
export function faktor(anzahl) {
  if (anzahl <= 10) return 1;
  if (anzahl <= 20) return 0.8;
  if (anzahl <= 40) return 0.6;
  return 0.45;
}

function stueck(p, modus, extra) {
  if (modus === 'plaettchen' || p > 3) {
    const farbe = STELLEN[p] ? STELLEN[p].farbe : 'gruen';
    return `<i class="pl pl-${farbe}${extra}">${PLAETTCHEN_TEXT[p] ?? ''}</i>`;
  }
  if (p === 0) return `<i class="perle${extra}"></i>`;
  if (p === 1) return `<svg class="stange${extra}" viewBox="0 0 10 100" aria-hidden="true"><use href="#ab-stange"/></svg>`;
  if (p === 2) return `<svg class="platte${extra}" viewBox="0 0 10 10" aria-hidden="true"><use href="#ab-platte"/></svg>`;
  return `<svg class="wuerfel${extra}" viewBox="0 0 28 31" aria-hidden="true"><use href="#ab-wuerfel"/></svg>`;
}

/** Ein einzelnes Teil (für Animationen). */
export function einzelStueckHtml(p, modus) {
  return stueck(p, modus === 'plaettchen' || p > 3 ? 'plaettchen' : 'perlen', '');
}

/** Platten und Würfel liegen nebeneinander in einem Raster, nie übereinander. */
function proReihe(anzahl) {
  if (anzahl <= 1) return 1;
  if (anzahl <= 4) return 2;
  if (anzahl <= 9) return 3;
  if (anzahl <= 16) return 4;
  return 5;
}

/**
 * Ein Stapel Material einer Stelle.
 * @param {number} p      Stelle (0 = Einer)
 * @param {number} anzahl Anzahl der Teile
 * @param {'perlen'|'plaettchen'} modus
 * @param {{neu?: number, k?: number}} opt  neu = so viele der letzten Teile werden eingeblendet
 */
export function stapelHtml(p, anzahl, modus, { neu = 0, k, plaetze = 0 } = {}) {
  // plaetze: so viele Teile werden im Lauf der Aufgabe höchstens gebraucht.
  // Der Platz dafür wird von Anfang an freigehalten (unsichtbare Platzhalter), damit nichts springt.
  const gesamt = Math.max(anzahl, plaetze);
  const kk = k ?? faktor(gesamt);
  const art = modus === 'plaettchen' || p > 3 ? 'plaettchen' : 'perlen';
  let teile = '';
  for (let i = 0; i < anzahl; i++) teile += stueck(p, art, i >= anzahl - neu ? ' neu' : '');
  for (let i = anzahl; i < gesamt; i++) teile += stueck(p, art, ' platz');
  return `<div class="stapel ${art} st-${Math.min(p, 3)}" style="--k:${kk};--reihe:${proReihe(gesamt)}">${teile}</div>`;
}

/** Kopfzeile mit den Stellenwerten über den Tabletts. */
export function stellenKopfHtml(n, { mitLeerspalte = false } = {}) {
  let s = '';
  for (let p = n - 1; p >= 0; p--) {
    const st = STELLEN[p];
    s += `<span class="stellenchip f-${st.farbe}" title="${st.name}">${st.kurz}<small>${st.name}</small></span>`;
  }
  return `<div class="stellenkopf${mitLeerspalte ? ' mit-leer' : ''}" style="--n:${n}">${s}</div>`;
}

/**
 * Ein Tablett: eine Zeile mit einer Spalte je Stelle.
 * knoepfe(p) liefert die Knöpfe unter der Spalte:
 *   { aktion, text, label?, art?: 'plus'|'minus'|'tausch'|'haupt', aus?: boolean }
 */
export function tablettHtml({ id, titel, zusatz = '', anzahlen, n, modus, knoepfe, anzahlZeigen, neu, warnAb, klasse = '', plaetze }) {
  let spalten = '';
  for (let p = n - 1; p >= 0; p--) {
    const st = STELLEN[p];
    const a = anzahlen[p];
    const kn = (knoepfe ? knoepfe(p) : []).filter(Boolean).map(k =>
      `<button type="button" class="kn kn-${k.art || 'neutral'}" data-aktion="${k.aktion}" data-tablett="${id}" data-stelle="${p}"${k.aus ? ' disabled' : ''} aria-label="${k.label || k.text}" title="${k.label || k.text}">${k.text}</button>`
    ).join('');
    const nNeu = !neu || neu.tablett !== id ? 0
      : neu.alle ? a
      : neu.stelle === p ? neu.anzahl : 0;
    spalten += `<div class="spalte f-${st.farbe}${warnAb && a >= warnAb ? ' zuviel' : ''}" data-tablett="${id}" data-stelle="${p}">
      ${anzahlZeigen ? `<span class="anzahl" aria-label="${a} ${st.name}">${a}</span>` : ''}
      ${stapelHtml(p, a, modus, { neu: nNeu, plaetze: plaetze ? plaetze[p] : 0 })}
      <div class="spalten-knoepfe">${kn}</div>
    </div>`;
  }
  return `<div class="tablett ${klasse}" data-id="${id}">
    <div class="tablett-kopf"><span class="tablett-titel">${titel}</span>${zusatz}</div>
    <div class="tablett-spalten" style="--n:${n}">${spalten}</div>
  </div>`;
}

/** Spielfigur für das Verteilen beim Dividieren. */
export function figurSvg(nummer) {
  return `<svg class="figur-bild" viewBox="0 0 40 56" aria-hidden="true" focusable="false">
    <ellipse cx="20" cy="53" rx="14" ry="3" fill="#000" opacity=".12"/>
    <path d="M20 22c-9 0-13 10-13 20 0 6 2 10 2 10h22s2-4 2-10c0-10-4-20-13-20Z" fill="var(--fig)"/>
    <circle cx="20" cy="13" r="10" fill="var(--fig)"/>
    <circle cx="16.5" cy="11.5" r="1.6" fill="#fff"/><circle cx="23.5" cy="11.5" r="1.6" fill="#fff"/>
    <path d="M15.5 16.5q4.5 3.5 9 0" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
    <text x="20" y="43" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="inherit">${nummer}</text>
  </svg>`;
}
