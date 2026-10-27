/* Logo und App-Symbol „Aufgaben be-greifen“.
   Reines SVG ohne DOM – wird im Browser (Kopfzeile, Startseite) und von icons.mjs (PNG-Symbole) benutzt.
   ENTWURF wählt das Motiv: 'greifen' (aktuell), 'hand', 'treppe' oder 'plus'. */

export const ENTWURF = 'greifen';

const GOLD = (id) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%">
  <stop offset="0" stop-color="#fff6cf"/><stop offset=".45" stop-color="#f2b72e"/><stop offset="1" stop-color="#a5690a"/></radialGradient>`;

function perle(x, y, r, g) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})" stroke="#8a5606" stroke-width="${r * 0.08}"/>`;
}

const MOTIVE = {
  /* „be-greifen“: Eine Faust umgreift eine Zehnerstange aus Perlen – oben und unten schaut die Stange heraus.
     Daneben ein Bruchstück und ein Würfel: Material zum Anfassen. */
  greifen: (g) => {
    let s = `<path d="M96 70 L96 170 A100 100 0 0 0 196 70 Z" fill="#ff5a5a" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
      <g transform="translate(392 84)"><path d="M0 -40 38 -19 38 25 0 46 -38 25 -38 -19Z" fill="#4cd387" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
        <path d="M0 4 38 -17M0 4 -38 -17M0 4 0 46" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/></g>`;
    // Stange
    s += `<rect x="233" y="48" width="46" height="420" rx="23" fill="#5a3404" opacity=".38"/>`;
    for (let i = 0; i < 10; i++) s += perle(256, 70 + i * 42, 19, g);
    // Faust: Unterarm von links unten, Handrücken links, vier Finger quer über der Stange, Daumen oben drüber
    s += `<path d="M70 512 L138 372 L232 396 L196 512 Z" fill="#ffd34d"/>
      <rect x="132" y="236" width="118" height="182" rx="46" fill="#fff"/>`;
    const finger = (y, x2) => `<rect x="168" y="${y}" width="${x2 - 168}" height="44" rx="22" fill="#fff" stroke="#d9cdfa" stroke-width="5"/>`;
    s += finger(244, 330) + finger(288, 338) + finger(332, 334) + finger(376, 318);
    s += `<rect x="128" y="206" width="170" height="46" rx="23" fill="#fff" stroke="#d9cdfa" stroke-width="5" transform="rotate(-10 213 229)"/>`;
    return s;
  },


  /* Eine Hand trägt eine Zehnerstange und eine Perle: Rechnen zum Anfassen. */
  hand: (g) => {
    let stange = `<rect x="219" y="80" width="46" height="290" rx="23" fill="#5a3404" opacity=".4"/>`;
    for (let i = 0; i < 10; i++) stange += perle(242, 103 + i * 27.5, 15.5, g);
    return `
      ${stange}
      ${perle(368, 292, 30, g)}
      <path d="M58 330c34-12 70-8 104 6l78 32c18 7 36 6 52-3l70-40c20-11 44-4 54 15 9 18 3 38-14 49l-104 66c-24 15-52 20-80 14L58 444Z"
        fill="#fff"/>
      <path d="M58 330c34-12 70-8 104 6l78 32c18 7 36 6 52-3" fill="none" stroke="#e7defc" stroke-width="10" stroke-linecap="round"/>
      <path d="M232 382c-24 4-52 0-76-8" fill="none" stroke="#d9cdfa" stroke-width="10" stroke-linecap="round"/>
      <path d="M318 392l48-31M338 404l40-26" fill="none" stroke="#e2d8fb" stroke-width="7" stroke-linecap="round"/>
      <rect x="20" y="318" width="52" height="138" rx="14" fill="#ffd34d"/>`;
  },

  /* Perle, Stange, Platte, Würfel als Treppe. */
  treppe: (g) => {
    let s = perle(92, 392, 26, g);
    for (let i = 0; i < 10; i++) s += perle(170, 182 + i * 23, 11.5, g);
    let platte = '';
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) platte += perle(224 + j * 12, 300 + i * 12, 5.6, g);
    s += `<rect x="216" y="292" width="124" height="124" rx="6" fill="#8a5606"/>${platte}`;
    s += `<g transform="translate(338 250) scale(5)">
      <rect width="10" height="10" fill="url(#pm)" transform="matrix(1.8,0,0,1.8,0,12)"/>
      <rect width="10" height="10" fill="url(#pm)" transform="matrix(1.8,0,0.9,-0.9,0,12)"/>
      <rect width="10" height="10" fill="url(#pm)" transform="matrix(0.9,-0.9,0,1.8,18,12)"/>
      <path d="M18 12 27 3 27 21 18 30Z" fill="#000" opacity=".2"/></g>`;
    return s;
  },

  /* Ein Pluszeichen aus Perlen. */
  plus: (g) => {
    let s = '';
    for (let i = -4; i <= 4; i++) s += perle(256 + i * 40, 256, 19, g);
    for (let i = -4; i <= 4; i++) if (i) s += perle(256, 256 + i * 40, 19, g);
    return s;
  },
};

const HINTERGRUND = {
  greifen: ['#8b5cff', '#4a2fd0'],
  hand: ['#8b5cff', '#5236d6'],
  treppe: ['#3d8bff', '#2349c7'],
  plus: ['#ff7a3d', '#d8452e'],
};

/** Vollständiges App-Symbol (512 × 512). id: Präfix, damit mehrere Symbole auf einer Seite nicht kollidieren. */
export function iconSvg(entwurf = ENTWURF, { id = 'ab', ecken = 112, xmlns = true } = {}) {
  const g = `${id}-gold`, h = `${id}-hg`;
  const [f1, f2] = HINTERGRUND[entwurf] || HINTERGRUND.hand;
  const motiv = MOTIVE[entwurf] || MOTIVE.hand;
  return `<svg ${xmlns ? 'xmlns="http://www.w3.org/2000/svg" ' : ''}viewBox="0 0 512 512" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${h}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></linearGradient>
    ${GOLD(g)}
    <pattern id="pm" patternUnits="userSpaceOnUse" width="1" height="1"><rect width="1" height="1" fill="#8a5606"/><circle cx=".5" cy=".5" r=".44" fill="url(#${g})"/></pattern>
  </defs>
  <rect width="512" height="512" rx="${ecken}" fill="url(#${h})"/>
  <circle cx="430" cy="78" r="120" fill="#fff" opacity=".09"/>
  <circle cx="70" cy="470" r="90" fill="#fff" opacity=".07"/>
  ${motiv(g).replaceAll('url(#pm)', `url(#${id}-pm)`)}
</svg>`.replace('<pattern id="pm"', `<pattern id="${id}-pm"`);
}
