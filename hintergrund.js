/* Verspielter Hintergrund für die Menüseiten – passend zum Fach.
   Startseite: Mischung aus allen Fächern. Mathematik: Rechenzeichen, Ziffern, Perlen.
   Deutsch: Buchstaben, Satzzeichen, Wortartensymbole, Stift.
   Neues Fach: einen Eintrag in THEMEN ergänzen (und Farben in app.css unter [data-thema="…"]). */

import { symbolForm } from './wortsymbole.js';

/* [Zeichen, x, y, Größe, Drehung, Farbe a–d] */
const MATHE = [
  ['+', 90, 150, 70, -12, 'a'], ['3', 260, 90, 64, 8, 'b'], ['·', 1080, 140, 90, 0, 'c'], ['7', 980, 300, 70, -10, 'd'],
  [':', 140, 560, 80, 0, 'b'], ['−', 1110, 620, 80, 0, 'a'], ['5', 720, 720, 60, 12, 'c'], ['=', 420, 760, 64, 0, 'd'],
  ['1', 610, 70, 56, -6, 'a'], ['9', 50, 380, 58, 10, 'c'], ['2', 1150, 460, 58, -8, 'b'], ['+', 860, 520, 52, 15, 'd'],
  ['0', 330, 640, 50, 0, 'a'], ['8', 820, 120, 52, 6, 'b'],
];

const DEUTSCH = [
  ['A', 90, 150, 76, -12, 'a'], ['b', 260, 90, 64, 8, 'b'], ['!', 1080, 150, 90, 0, 'c'], ['W', 980, 310, 70, -10, 'd'],
  ['?', 140, 570, 80, 6, 'b'], ['ß', 1110, 630, 72, 0, 'a'], ['z', 720, 730, 62, 12, 'c'], ['„“', 420, 770, 70, 0, 'd'],
  ['e', 610, 70, 60, -6, 'a'], ['Ä', 50, 390, 60, 10, 'c'], ['k', 1150, 470, 58, -8, 'b'], ['.', 860, 520, 80, 0, 'd'],
  ['ü', 330, 650, 54, 0, 'a'], ['M', 820, 120, 54, 6, 'b'],
];

const START = [
  ['+', 90, 150, 70, -12, 'a'], ['A', 260, 90, 64, 8, 'b'], ['·', 1080, 140, 90, 0, 'c'], ['b', 980, 300, 70, -10, 'd'],
  [':', 140, 560, 80, 0, 'b'], ['?', 1110, 620, 80, 0, 'a'], ['5', 720, 720, 60, 12, 'c'], ['!', 420, 760, 64, 0, 'd'],
  ['1', 610, 70, 56, -6, 'a'], ['W', 50, 380, 58, 10, 'c'], ['2', 1150, 460, 58, -8, 'b'], ['ß', 860, 520, 52, 15, 'd'],
  ['=', 330, 640, 50, 0, 'a'], ['e', 820, 120, 52, 6, 'b'],
];

function perle(x, y, r) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#hg-gold)"/>`;
}

function stange(x, y, r, winkel) {
  let s = '';
  for (let i = 0; i < 10; i++) s += perle(0, i * 2 * r, r);
  return `<g transform="translate(${x} ${y}) rotate(${winkel})">${s}</g>`;
}

function stift(x, y, winkel) {
  return `<g transform="translate(${x} ${y}) rotate(${winkel})">
    <rect width="22" height="130" rx="4" fill="#ffd34d"/><rect width="22" height="16" rx="3" fill="#f27bb0"/>
    <path d="M0 130 11 160 22 130Z" fill="#f4c59a"/><path d="M7 148 11 160 15 148Z" fill="#333"/></g>`;
}

const symbol = (k, x, y, gr, w = 0) => `<g transform="rotate(${w} ${x + gr / 2} ${y + gr / 2})">${symbolForm(k, x, y, gr)}</g>`;

const DEKO = {
  mathematik: () => `
    <g class="hg-perlen schwebe-1">${stange(1010, 360, 9, 28)}</g>
    <g class="hg-perlen schwebe-2">${stange(1150, 40, 8, 55)}</g>
    <g class="hg-perlen schwebe-0">${perle(660, 430, 13)}${perle(690, 448, 13)}${perle(674, 476, 13)}</g>
    <g class="hg-perlen schwebe-2">${perle(700, 610, 11)}${perle(726, 600, 11)}</g>
    <g class="hg-perlen schwebe-1">${perle(80, 690, 14)}</g>`,
  deutsch: () => `
    <g class="hg-symbole schwebe-1">${symbol('N', 960, 360, 90, 10)}</g>
    <g class="hg-symbole schwebe-2">${symbol('V', 1120, 40, 70)}</g>
    <g class="hg-symbole schwebe-0">${symbol('J', 650, 420, 70, -8)}</g>
    <g class="hg-symbole schwebe-2">${symbol('R', 690, 590, 70, 6)}</g>
    <g class="hg-symbole schwebe-1">${symbol('K', 40, 660, 80, -10)}</g>
    <g class="hg-symbole schwebe-0">${symbol('A', 540, 220, 50, 12)}</g>
    <g class="hg-perlen schwebe-2">${stift(1060, 520, 35)}</g>`,
  start: () => `
    <g class="hg-perlen schwebe-1">${stange(1010, 360, 9, 28)}</g>
    <g class="hg-symbole schwebe-2">${symbol('V', 1120, 40, 70)}</g>
    <g class="hg-perlen schwebe-0">${perle(660, 430, 13)}${perle(690, 448, 13)}${perle(674, 476, 13)}</g>
    <g class="hg-symbole schwebe-2">${symbol('N', 690, 580, 70, 6)}</g>
    <g class="hg-perlen schwebe-1">${perle(80, 690, 14)}</g>
    <g class="hg-perlen schwebe-0">${stift(1060, 540, 35)}</g>`,
};

const ZEICHEN = { mathematik: MATHE, deutsch: DEUTSCH, start: START };

export const THEMEN = Object.keys(DEKO);

export function hintergrundHtml(thema = 'start') {
  const t = DEKO[thema] ? thema : 'start';
  const zeichen = ZEICHEN[t].map(([z, x, y, gr, w, f], i) =>
    `<g class="schwebe-${i % 3}"><text class="hg-z hg-${f}" x="${x}" y="${y}" font-size="${gr}" transform="rotate(${w} ${x} ${y})">${z}</text></g>`).join('');
  return `<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" focusable="false">
    <defs>
      <radialGradient id="hg-gold" cx="35%" cy="30%" r="75%">
        <stop offset="0" stop-color="#fff6cf"/><stop offset=".45" stop-color="#f2b72e"/><stop offset="1" stop-color="#a5690a"/>
      </radialGradient>
      <filter id="hg-weich" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
    </defs>
    <g filter="url(#hg-weich)">
      <circle class="hg-fl hg-a" cx="140" cy="120" r="210"/>
      <circle class="hg-fl hg-b" cx="1080" cy="160" r="230"/>
      <circle class="hg-fl hg-c" cx="980" cy="760" r="250"/>
      <circle class="hg-fl hg-d" cx="180" cy="760" r="200"/>
    </g>
    <path class="hg-welle" d="M0 690 C200 640 380 740 600 700 S1000 640 1200 690 V800 H0Z"/>
    ${zeichen}
    ${DEKO[t]()}
  </svg>`;
}
