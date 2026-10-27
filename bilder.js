import { symbolForm } from './wortsymbole.js';

/* Bilder für die Kacheln – alles als Vektorgrafik im Code, keine Bilddateien.
   Koordinatensystem 600 × 300. */

const GRUEN = '#2fae58', BLAU = '#3b7bf0', ROT = '#e04848';

function dunkler(hex, t = 0.35) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.round(c * (1 - t));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

const perle = (x, y, r = 9) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#ab-perle)" stroke="#8a5a06" stroke-width="${r / 9}"/>`;

function stange(x, y, r = 8, farbe) {
  let s = `<rect x="${x - r - 2}" y="${y - r - 2}" width="${2 * r + 4}" height="${20 * r + 4}" rx="${r + 2}" fill="#7a4e05" opacity=".35"/>`;
  for (let i = 0; i < 10; i++) {
    s += farbe
      ? `<circle cx="${x}" cy="${y + i * 2 * r}" r="${r}" fill="${farbe}" stroke="#fff" stroke-width="1.5"/>`
      : perle(x, y + i * 2 * r, r);
  }
  return s;
}

function platte(x, y, r = 6) {
  let s = `<rect x="${x - r - 2}" y="${y - r - 2}" width="${20 * r + 4}" height="${20 * r + 4}" rx="4" fill="#7a4e05" opacity=".35"/>`;
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) s += perle(x + j * 2 * r, y + i * 2 * r, r);
  return s;
}

function wuerfel(x, y, s = 4) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect width="10" height="10" fill="url(#ab-perlmuster)" transform="matrix(1.8,0,0,1.8,0,12)"/>
    <rect width="10" height="10" fill="url(#ab-perlmuster)" transform="matrix(1.8,0,0.9,-0.9,0,12)"/>
    <rect width="10" height="10" fill="url(#ab-perlmuster)" transform="matrix(0.9,-0.9,0,1.8,18,12)"/>
    <path d="M18 12 27 3 27 21 18 30Z" fill="#000" opacity=".18"/>
    <path d="M0 12 9 3 27 3 18 12Z" fill="#fff" opacity=".22"/>
  </g>`;
}

const plaettchen = (x, y, farbe, text, w = 64, h = 40) =>
  `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${farbe}" stroke="#fff" stroke-width="3"/>
   <text x="${x + w / 2}" y="${y + h / 2 + 7}" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="Baloo 2, system-ui, sans-serif">${text}</text></g>`;

const zeichen = (x, y, t, gr = 90, farbe = '#fff') =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${gr}" font-weight="800" fill="${farbe}" font-family="Baloo 2, system-ui, sans-serif">${t}</text>`;

function figur(x, y, s = 1, farbe = GRUEN) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="20" cy="54" rx="15" ry="4" fill="#000" opacity=".15"/>
    <path d="M20 22c-9 0-13 10-13 20 0 6 2 10 2 10h22s2-4 2-10c0-10-4-20-13-20Z" fill="${farbe}" stroke="#fff" stroke-width="2"/>
    <circle cx="20" cy="13" r="10" fill="${farbe}" stroke="#fff" stroke-width="2"/>
    <circle cx="16.5" cy="11.5" r="1.7" fill="#fff"/><circle cx="23.5" cy="11.5" r="1.7" fill="#fff"/>
    <path d="M15.5 16.5q4.5 3.5 9 0" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>
  </g>`;
}

function stern(x, y, r = 34) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const w = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(x + rr * Math.cos(w)).toFixed(1)} ${(y + rr * Math.sin(w)).toFixed(1)}`;
  }
  return `<path d="${d}Z" fill="#ffd34d" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`;
}

const schale = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff" opacity=".22"/>`;

const ZEICHNUNGEN = {
  mathematik: () => `
    ${[['+', 120, 120, GRUEN], ['−', 250, 95, ROT], ['·', 380, 120, BLAU], [':', 500, 95, '#f29a12']].map(([t, x, y, f]) =>
      `<circle cx="${x}" cy="${y}" r="52" fill="#fff"/>${zeichen(x, y + 30, t, 88, f)}`).join('')}
    ${perle(150, 230, 13)}${perle(185, 240, 13)}${perle(220, 232, 13)}
    ${zeichen(310, 262, '1 2 3', 64)}
    ${perle(430, 236, 13)}${perle(465, 226, 13)}`,

  schriftlich: () => `
    ${perle(80, 200, 14)}
    ${stange(150, 70, 13)}
    ${platte(205, 70, 7)}
    ${wuerfel(380, 70, 6.2)}
    ${plaettchen(70, 40, GRUEN, '1', 54, 40)}${plaettchen(500, 230, BLAU, '10', 70, 44)}`,

  addition: () => `
    ${schale(40, 60, 150, 190)}${stange(80, 85, 8)}${stange(110, 85, 8)}${perle(150, 120)}${perle(150, 150)}${perle(150, 180)}
    ${zeichen(230, 185, '+')}
    ${schale(270, 60, 120, 190)}${stange(305, 85, 8)}${perle(340, 120)}${perle(340, 150)}
    ${zeichen(430, 180, '➜', 60)}
    ${schale(470, 60, 110, 190)}${stange(495, 85, 8)}${stange(520, 85, 8)}${stange(545, 85, 8)}${perle(565, 230, 8)}`,

  subtraktion: () => `
    ${schale(60, 50, 270, 210)}
    ${stange(100, 80, 8)}${stange(130, 80, 8)}${stange(160, 80, 8)}
    ${perle(210, 100)}${perle(240, 100)}${perle(210, 130)}${perle(240, 130)}
    <g opacity=".55">${perle(450, 90)}${perle(485, 120)}${perle(520, 90)}</g>
    <path d="M300 115 C350 70 380 70 420 95" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 14"/>
    ${zeichen(470, 245, '−', 120)}`,

  multiplikation: () => {
    const f = [GRUEN, BLAU, ROT];
    let s = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const x = 360 - c * 68, y = 190 - r * 68;
      s += `<rect x="${x}" y="${y}" width="64" height="64" rx="6" fill="${f[(r + c) % 3]}" opacity=".95" stroke="#fff" stroke-width="2"/>`;
    }
    s += stange(380, 200, 3.3, '#ffd34d') + stange(390, 200, 3.3, '#ffd34d') + stange(400, 200, 3.3, '#ffd34d');
    s += stange(312, 132, 3.3, '#ffd34d') + stange(322, 132, 3.3, '#ffd34d');
    s += `<rect x="436" y="54" width="54" height="64" rx="8" fill="#fff"/>${zeichen(463, 104, '3', 50, ROT)}`;
    s += `<rect x="436" y="190" width="54" height="64" rx="8" fill="#fff"/>${zeichen(463, 240, '5', 50, GRUEN)}`;
    s += zeichen(545, 200, '·', 140);
    return s;
  },

  division: () => `
    ${figur(110, 120, 2.2)}${figur(255, 120, 2.2)}${figur(400, 120, 2.2)}
    ${[150, 295, 440].map(x => perle(x, 92, 11) + perle(x + 26, 92, 11) + perle(x + 13, 70, 11)).join('')}
    ${zeichen(555, 190, ':', 130)}`,


  deutsch: () => `
    ${[['A', 120, 120, '#e0457b'], ['b', 250, 95, '#2b4bb5'], ['?', 380, 120, '#13a39b'], ['!', 500, 95, '#f29a12']].map(([t, x, y, f]) =>
      `<circle cx="${x}" cy="${y}" r="52" fill="#fff"/>${zeichen(x, y + 30, t, 84, f)}`).join('')}
    ${symbolForm('N', 130, 205, 50)}${symbolForm('V', 190, 205, 50)}
    ${zeichen(320, 262, 'A B C', 60)}
    ${symbolForm('J', 420, 205, 50)}${symbolForm('R', 478, 205, 50)}`,

  'wortarten-ordner': () => {
    const karte = (x, w, wort) => `<rect x="${x}" y="170" width="${w}" height="70" rx="12" fill="#fff"/>
      <text x="${x + w / 2}" y="218" text-anchor="middle" font-size="36" font-weight="700" fill="#1b2340" font-family="Andika, system-ui, sans-serif">${wort}</text>`;
    return `${karte(60, 150, 'Hund')}${karte(225, 150, 'bellt')}${karte(390, 150, 'laut')}
      ${symbolForm('N', 95, 80, 80)}${symbolForm('V', 260, 80, 80)}${symbolForm('J', 425, 80, 80)}`;
  },

  wortarten: () => {
    const woerter = [['Die', 'A', 30, 110], ['Katze', 'N', 150, 150], ['schläft', 'V', 310, 160], ['.', '', 480, 30]];
    return woerter.map(([w, k, x, b]) => k
      ? `<rect x="${x}" y="175" width="${b}" height="66" rx="12" fill="#fff"/>
         <text x="${x + b / 2}" y="220" text-anchor="middle" font-size="34" font-weight="700" fill="#1b2340" font-family="Andika, system-ui, sans-serif">${w}</text>
         ${symbolForm(k, x + b / 2 - 40, 82, 80)}`
      : `<text x="${x}" y="225" font-size="48" font-weight="800" fill="#fff">.</text>`).join('')
;
  },

  wa1: () => ['N', 'A', 'J', 'V'].map((k, i) => symbolForm(k, 90 + i * 110, 90, 100)).join('') + stern(540, 60, 26),
  wa2: () => ['N', 'A', 'J', 'V', 'P', 'R', 'K'].map((k, i) => symbolForm(k, 35 + i * 76, 110, 72)).join('') + stern(500, 55, 22) + stern(552, 55, 22),
  wa3: () => ['N', 'A', 'J', 'V', 'P', 'R', 'K', 'D'].map((k, i) => symbolForm(k, 22 + i * 70, 115, 66)).join('') + stern(470, 52, 20) + stern(515, 52, 20) + stern(560, 52, 20),

  'teiler-ordner': () => {
    let s = `<rect x="60" y="45" width="300" height="210" rx="16" fill="#c8935a" stroke="#fff" stroke-width="4"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) s += `<circle cx="${100 + c * 44}" cy="${85 + r * 44}" r="16" fill="${r % 2 ? '#ffd34d' : '#fff'}" stroke="#7a4e05" stroke-width="2"/>`;
    return s + zeichen(470, 140, '24', 90) + zeichen(470, 230, '4 · 6', 52);
  },

  steckbrett: () => {
    let s = `<rect x="40" y="40" width="380" height="220" rx="16" fill="#c8935a" stroke="#fff" stroke-width="4"/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) s += `<circle cx="${80 + c * 46}" cy="${82 + r * 46}" r="17" fill="${r % 2 ? '#ffd34d' : '#fff'}" stroke="#7a4e05" stroke-width="2"/>`;
    for (let c = 0; c < 2; c++) s += `<circle cx="${80 + c * 46}" cy="${220}" r="17" fill="#ff6b6b" stroke="#fff" stroke-width="3"/>`;
    return s + zeichen(515, 150, '?', 110) + zeichen(515, 240, 'Rest 2', 34);
  },

  sieb: () => {
    const farbe = n => n % 2 === 0 ? '#3b7bf0' : n % 3 === 0 ? '#2fae58' : n % 5 === 0 ? '#ff8a3d' : n % 7 === 0 ? '#9b5de5' : null;
    let s = '';
    for (let i = 0; i < 40; i++) {
      const n = i + 1, x = 70 + (i % 10) * 46, y = 50 + Math.floor(i / 10) * 52;
      const f = n > 1 && ![2, 3, 5, 7].includes(n) ? farbe(n) : null;
      s += `<rect x="${x}" y="${y}" width="40" height="44" rx="8" fill="${f || '#fff'}" opacity="${f ? .9 : 1}"/>`;
      s += `<text x="${x + 20}" y="${y + 30}" text-anchor="middle" font-size="20" font-weight="800" fill="${f ? '#fff' : '#1b2340'}" font-family="Baloo 2, system-ui, sans-serif">${n}</text>`;
      if (!f && n > 1) s += `<circle cx="${x + 20}" cy="${y + 22}" r="21" fill="none" stroke="#ffd34d" stroke-width="4"/>`;
    }
    return s;
  },

  primbaum: () => {
    const k = (x, y, t, gold) => `<circle cx="${x}" cy="${y}" r="30" fill="${gold ? 'url(#ab-perle)' : '#fff'}" stroke="${gold ? '#8a5a06' : '#fff'}" stroke-width="3"/>
      <text x="${x}" y="${y + 10}" text-anchor="middle" font-size="28" font-weight="800" fill="#1b2340" font-family="Baloo 2, system-ui, sans-serif">${t}</text>`;
    const l = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    return l(300, 70, 200, 150) + l(300, 70, 400, 150) + l(400, 150, 340, 235) + l(400, 150, 460, 235)
      + k(300, 60, '24') + k(200, 150, '2', true) + k(400, 150, '12') + k(340, 240, '3', true) + k(460, 240, '4');
  },

  gesetze: () => {
    let s = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) s += `<circle cx="${70 + c * 30 + (c >= 5 ? 14 : 0)}" cy="${80 + r * 30}" r="12" fill="${c >= 5 ? '#ffd34d' : '#fff'}"/>`;
    s += `<line x1="${70 + 4.5 * 30 + 7}" y1="55" x2="${70 + 4.5 * 30 + 7}" y2="205" stroke="#fff" stroke-width="4" stroke-dasharray="8 6"/>`;
    return s + zeichen(440, 120, 'a·b', 64) + zeichen(440, 200, '= b·a', 52);
  },

  potenzen: () => {
    let s = '';
    const f = '#ffd34d';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += `<circle cx="${60 + i * 108 + j * 24}" cy="70" r="11" fill="${f}" stroke="#fff" stroke-width="2"/>`;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += `<circle cx="${190 + j * 26}" cy="${135 + i * 26}" r="11" fill="${f}" stroke="#fff" stroke-width="2"/>`;
    return s + zeichen(420, 200, '4²', 96) + zeichen(520, 140, '= 16', 44);
  },

  /* ---- Rechnen verstehen und Ergänzungen ---- */
  'verstehen-ordner': () => `<rect x="70" y="80" width="200" height="44" rx="6" fill="#9cc4ff" stroke="#fff" stroke-width="4"/><rect x="270" y="80" width="130" height="44" rx="6" fill="#ffd98a" stroke="#fff" stroke-width="4"/>
      <path d="M70 140 q0 14 14 14 H225 l10 12 l10 -12 H386 q14 0 14 -14" fill="none" stroke="#fff" stroke-width="5"/>` + zeichen(235, 230, '?', 60) + zeichen(500, 140, '💡', 80),
  teilen: () => {
    let s = '';
    [120, 300, 480].forEach(x => { s += `<ellipse cx="${x}" cy="200" rx="70" ry="26" fill="#fff" opacity=".95"/>`; for (let k = 0; k < 3; k++) s += `<circle cx="${x - 30 + k * 30}" cy="192" r="13" fill="#d99a4e" stroke="#fff" stroke-width="2"/>`; });
    return s + `<circle cx="300" cy="90" r="13" fill="#d99a4e" stroke="#fff" stroke-width="2"/>` + zeichen(300, 60, 'Rest 1', 30);
  },
  streifen: () => `<rect x="70" y="70" width="460" height="50" rx="6" fill="#9cc4ff" stroke="#fff" stroke-width="4"/>${zeichen(300, 106, '48', 34, '#1b2340')}
      ${[0, 1, 2, 3].map(i => `<rect x="${70 + i * 115}" y="150" width="115" height="50" rx="6" fill="#ffd98a" stroke="#fff" stroke-width="4"/>`).join('')}${zeichen(127, 186, '?', 34, '#1b2340')}`,
  unterschied: () => {
    let s = '';
    for (let i = 0; i < 12; i++) s += `<circle cx="${80 + i * 36}" cy="100" r="15" fill="#6a9cf0" stroke="#fff" stroke-width="2"/>`;
    for (let i = 0; i < 8; i++) s += `<circle cx="${80 + i * 36}" cy="160" r="15" fill="#f6cf5c" stroke="#fff" stroke-width="2"/>`;
    return s + `<rect x="58" y="78" width="290" height="104" rx="12" fill="#fff" opacity=".45"/><path d="M362 200 h130" stroke="#fff" stroke-width="6"/>` + zeichen(427, 245, '? mehr', 34);
  },
  ueberschlag: () => `<line x1="60" y1="170" x2="540" y2="170" stroke="#fff" stroke-width="6"/><rect x="250" y="145" width="140" height="50" rx="10" fill="#ffd34d" opacity=".7"/>` + zeichen(320, 120, '≈ 600', 46) + zeichen(150, 240, '61', 30) + zeichen(320, 240, '612', 30) + zeichen(480, 240, '6 120', 30),
  schaetzen: () => `<rect x="80" y="60" width="40" height="190" rx="6" fill="#fff" opacity=".9"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<line x1="80" y1="${80 + i * 20}" x2="100" y2="${80 + i * 20}" stroke="#d6336c" stroke-width="3"/>`).join('')}` + zeichen(300, 180, '🚪', 120) + zeichen(480, 170, '≈ 2 m', 48),
  uhr: () => `<circle cx="200" cy="150" r="100" fill="#fff" stroke="#1b2340" stroke-width="6"/><line x1="200" y1="150" x2="200" y2="70" stroke="#2f6fe4" stroke-width="8" stroke-linecap="round"/><line x1="200" y1="150" x2="250" y2="170" stroke="#1b2340" stroke-width="10" stroke-linecap="round"/>` + zeichen(450, 170, '+45 min', 44),
  raum: () => `<g transform="translate(150 70)"><path d="M0 40 L60 10 L120 40 L60 70Z" fill="#fff3c4"/><path d="M0 40 L60 70 V150 L0 120Z" fill="#fff"/><path d="M60 70 L120 40 V120 L60 150Z" fill="#e6e9f2"/>
      <circle cx="60" cy="40" r="7" fill="#1b2340"/><circle cx="30" cy="85" r="7" fill="#1b2340"/><circle cx="30" cy="110" r="7" fill="#1b2340"/><circle cx="90" cy="75" r="7" fill="#1b2340"/><circle cx="90" cy="100" r="7" fill="#1b2340"/><circle cx="90" cy="120" r="7" fill="#1b2340"/></g>` + zeichen(420, 170, '→ ↓', 70),
  dreiecke: () => `<path d="M100 240 L300 240 L200 60Z" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="6"/><line x1="150" y1="150" x2="164" y2="142" stroke="#ffd34d" stroke-width="5"/><line x1="236" y1="142" x2="250" y2="150" stroke="#ffd34d" stroke-width="5"/>
      <line x1="370" y1="80" x2="540" y2="80" stroke="#fff" stroke-width="6"/><line x1="370" y1="130" x2="540" y2="130" stroke="#fff" stroke-width="6"/><line x1="455" y1="160" x2="455" y2="260" stroke="#ffd34d" stroke-width="6"/><line x1="380" y1="210" x2="530" y2="210" stroke="#fff" stroke-width="6"/>`,

  /* ---- Kopfrechnen ---- */
  'kopf-ordner': () => `<circle cx="190" cy="150" r="95" fill="#fff" opacity=".92"/>
      <path d="M150 110 q40 -40 80 0 q30 30 0 60 q-20 20 -40 10" fill="none" stroke="#13a39b" stroke-width="10" stroke-linecap="round"/>
      <circle cx="160" cy="190" r="10" fill="#f2b72e"/><circle cx="215" cy="200" r="7" fill="#e04848"/>` + zeichen(430, 135, '7·8', 80) + zeichen(430, 225, '48+35', 54),
  kopfplus: () => {
    let s = `<rect x="70" y="240" width="300" height="16" rx="6" fill="#8b5a2b"/>`;
    [['#2fae58', 3], ['#e04848', 5], ['#3b7bf0', 2], ['#2fae58', 7]].forEach(([f, n], i) => {
      const x = 110 + i * 75;
      s += `<rect x="${x - 3}" y="40" width="6" height="200" rx="3" fill="#eee"/>`;
      for (let k = 0; k < n; k++) s += `<ellipse cx="${x}" cy="${228 - k * 17}" rx="24" ry="8" fill="${f}" stroke="#fff" stroke-width="2"/>`;
    });
    return s + zeichen(490, 160, '+', 120);
  },
  kopfmal: () => {
    let s = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) s += `<circle cx="${90 + c * 34 + (c >= 5 ? 12 : 0)}" cy="${80 + r * 40}" r="13" fill="${c >= 5 ? '#ffd34d' : '#fff'}"/>`;
    return s + zeichen(470, 140, '4·7', 80) + zeichen(470, 225, '= 28', 54);
  },

  /* ---- Stellenwerte ---- */
  'stellen-ordner': () => {
    const sp = [['H', '#e04848'], ['Z', '#3b7bf0'], ['E', '#2fae58']];
    let s = '';
    sp.forEach(([t, f], i) => {
      const x = 120 + i * 130;
      s += `<rect x="${x}" y="50" width="110" height="200" rx="10" fill="#fff" opacity=".92"/><rect x="${x}" y="50" width="110" height="40" rx="10" fill="${f}"/>` + zeichen(x + 55, 82, t, 32);
      const n = [3, 0, 7][i];
      for (let k = 0; k < n; k++) s += `<circle cx="${x + 25 + (k % 3) * 30}" cy="${115 + Math.floor(k / 3) * 32}" r="12" fill="${f}"/>`;
    });
    return s;
  },
  abakus: () => {
    let s = `<rect x="90" y="235" width="420" height="22" rx="8" fill="#8b5a2b"/>`;
    [['#e04848', 2], ['#3b7bf0', 9], ['#2fae58', 10]].forEach(([f, n], i) => {
      const x = 170 + i * 130;
      s += `<rect x="${x - 4}" y="40" width="8" height="196" rx="4" fill="#eee"/>`;
      for (let k = 0; k < n; k++) s += `<ellipse cx="${x}" cy="${222 - k * 18}" rx="26" ry="9" fill="${f}" stroke="#fff" stroke-width="2"/>`;
    });
    return s + `<path d="M420 60 C380 20 330 20 300 55" stroke="#ffd34d" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M296 40 300 58 316 50" stroke="#ffd34d" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  },
  stellentafel: () => {
    let s = '';
    ['T', 'H', 'Z', 'E'].forEach((t, i) => {
      const x = 90 + i * 110, f = ['#2fae58', '#e04848', '#3b7bf0', '#2fae58'][i];
      s += `<rect x="${x}" y="50" width="104" height="200" fill="#fff" opacity=".92"/><rect x="${x}" y="50" width="104" height="38" fill="${f}"/>` + zeichen(x + 52, 80, t, 30);
      const n = [2, 0, 12, 4][i];
      for (let k = 0; k < n; k++) s += `<circle cx="${x + 20 + (k % 4) * 21}" cy="${110 + Math.floor(k / 4) * 24}" r="9" fill="${f}"/>`;
    });
    return s;
  },
  einheitentafel: () => {
    let s = '';
    ['m', 'dm', 'cm', 'mm'].forEach((t, i) => {
      const x = 90 + i * 110;
      s += `<rect x="${x}" y="70" width="104" height="60" fill="#fff" opacity=".92"/>` + zeichen(x + 52, 112, t, 34, '#5a2a9e');
      s += `<rect x="${x}" y="136" width="104" height="80" fill="#fff" opacity=".8"/>` + zeichen(x + 52, 196, ['3', '4', '5', '0'][i], 56, i === 3 ? '#1f9d55' : '#1b2340');
    });
    return s + `<line x1="524" y1="60" x2="524" y2="230" stroke="#e0262b" stroke-width="7"/>`;
  },
  schrittstrahl: () => {
    let s = `<line x1="40" y1="210" x2="560" y2="210" stroke="#fff" stroke-width="6"/>`;
    for (let i = 0; i <= 8; i++) s += `<line x1="${60 + i * 60}" y1="196" x2="${60 + i * 60}" y2="224" stroke="#fff" stroke-width="4"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M${120 + i * 60} 200 Q${150 + i * 60} 120 ${180 + i * 60} 200" stroke="#ffd34d" stroke-width="5" fill="none" stroke-dasharray="10 6"/>`;
    s += `<ellipse cx="360" cy="190" rx="22" ry="16" fill="#2fae58" stroke="#fff" stroke-width="3"/><circle cx="350" cy="174" r="7" fill="#2fae58" stroke="#fff" stroke-width="3"/><circle cx="370" cy="174" r="7" fill="#2fae58" stroke="#fff" stroke-width="3"/>`;
    return s + zeichen(300, 95, '+25 +25 +25 +25', 34);
  },

  /* ---- Block 2: Symmetrie ---- */
  'symmetrie-ordner': () => {
    let s = `<line x1="300" y1="30" x2="300" y2="270" stroke="#fff" stroke-width="6" stroke-dasharray="14 10"/>`;
    s += `<path d="M290 150 C250 60 150 50 120 110 C100 160 170 200 290 160Z" fill="#ffd34d" stroke="#fff" stroke-width="4"/>`;
    s += `<path d="M310 150 C350 60 450 50 480 110 C500 160 430 200 310 160Z" fill="#ffd34d" stroke="#fff" stroke-width="4"/>`;
    s += `<path d="M290 165 C220 190 180 250 230 260 C260 265 285 220 292 175Z" fill="#ff9ec4" stroke="#fff" stroke-width="4"/>`;
    s += `<path d="M310 165 C380 190 420 250 370 260 C340 265 315 220 308 175Z" fill="#ff9ec4" stroke="#fff" stroke-width="4"/>`;
    return s;
  },
  spiegel: () => {
    let s = '';
    const muster = [[0, 1], [1, 1], [1, 2], [2, 0], [2, 1], [3, 1]];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) s += `<rect x="${130 + c * 44}" y="${60 + r * 44}" width="40" height="40" rx="6" fill="#fff" opacity="${c < 4 ? .55 : .35}"/>`;
    muster.forEach(([r, c]) => { s += `<rect x="${130 + c * 44}" y="${60 + r * 44}" width="40" height="40" rx="6" fill="#ffd34d"/><rect x="${130 + (7 - c) * 44}" y="${60 + r * 44}" width="40" height="40" rx="6" fill="#ffd34d" opacity=".75"/>`; });
    return s + `<line x1="304" y1="40" x2="304" y2="260" stroke="#c4182f" stroke-width="6"/>`;
  },
  vierecke: () => {
    const st = (a, b, c, d, f) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${f}" stroke-width="14" stroke-linecap="round"/>`;
    return st(140, 220, 300, 220, '#ffd34d') + st(300, 220, 380, 90, '#fff') + st(380, 90, 220, 90, '#ffd34d') + st(220, 90, 140, 220, '#fff')
      + [[140, 220], [300, 220], [380, 90], [220, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="#1b2340" stroke-width="4"/>`).join('')
      + zeichen(490, 180, '▱', 110);
  },
  koordinaten: () => {
    let s = '';
    for (let i = 0; i <= 6; i++) s += `<line x1="${110 + i * 40}" y1="40" x2="${110 + i * 40}" y2="260" stroke="#fff" opacity=".35" stroke-width="2"/><line x1="110" y1="${260 - i * 37}" x2="350" y2="${260 - i * 37}" stroke="#fff" opacity=".35" stroke-width="2"/>`;
    s += `<line x1="110" y1="260" x2="370" y2="260" stroke="#fff" stroke-width="5"/><line x1="110" y1="260" x2="110" y2="30" stroke="#fff" stroke-width="5"/>`;
    s += `<path d="M110 260 H270" stroke="#7fb0ff" stroke-width="7" stroke-dasharray="12 8"/><path d="M270 260 V112" stroke="#8ff0b4" stroke-width="7" stroke-dasharray="12 8"/>`;
    s += `<circle cx="270" cy="112" r="16" fill="#e0262b" stroke="#fff" stroke-width="4"/>`;
    return s + zeichen(475, 175, '(4|4)', 64);
  },

  /* ---- Block 3: Brüche ---- */
  'brueche-ordner': () => {
    const teil = (cx, cy, r, a0, a1, f) => { const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}Z" fill="${f}" stroke="#fff" stroke-width="4"/>`; };
    let s = '';
    for (let i = 0; i < 4; i++) s += teil(200, 150, 105, -Math.PI / 2 + i * Math.PI / 2, i * Math.PI / 2, i < 3 ? '#ff5a5a' : 'rgba(255,255,255,.25)');
    return s + zeichen(440, 140, '3', 90) + `<line x1="400" y1="160" x2="480" y2="160" stroke="#fff" stroke-width="7"/>` + zeichen(440, 240, '4', 90);
  },
  bruchkreise: () => {
    const teil = (cx, cy, r, a0, a1, f) => { const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}Z" fill="${f}" stroke="#fff" stroke-width="3"/>`; };
    let s = '';
    for (let i = 0; i < 2; i++) s += teil(170, 150, 95, -Math.PI / 2 + i * Math.PI, Math.PI / 2 + i * Math.PI - 0.001, i < 1 ? '#ff5a5a' : 'rgba(255,255,255,.25)');
    for (let i = 0; i < 4; i++) s += teil(430, 150, 95, -Math.PI / 2 + i * Math.PI / 2, i * Math.PI / 2, i < 2 ? '#ff5a5a' : 'rgba(255,255,255,.25)');
    return s + zeichen(300, 172, '=', 80);
  },
  bruchstreifen: () => {
    let s = '';
    [1, 2, 3, 4, 6].forEach((n, r) => { for (let i = 0; i < n; i++) s += `<rect x="${80 + i * 440 / n}" y="${40 + r * 46}" width="${440 / n - 4}" height="38" rx="6" fill="${['#ff5a5a', '#ff9f43', '#ffd34d', '#4cd387', '#55b7ff'][r]}" stroke="#fff" stroke-width="2"/>`; });
    return s + `<line x1="300" y1="25" x2="300" y2="275" stroke="#fff" stroke-width="6" stroke-dasharray="10 7"/>`;
  },
  'bruch-quotient': () => {
    const teil = (cx, cy, r, i, m, f) => { const a0 = -Math.PI / 2 + i * 2 * Math.PI / m, a1 = a0 + 2 * Math.PI / m; return `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z" fill="${f}" stroke="#fff" stroke-width="3"/>`; };
    const farben = ['#ff5a5a', '#55b7ff', '#4cd387', '#ffd34d'];
    let s = '';
    [110, 240, 370].forEach(cx => { for (let i = 0; i < 4; i++) s += teil(cx, 105, 58, i, 4, farben[i]); });
    return s + zeichen(300, 260, '3 : 4 = ¾', 70);
  },
  'bruch-strahl': () => {
    let s = `<line x1="50" y1="170" x2="560" y2="170" stroke="#fff" stroke-width="7"/><path d="M560 155 585 170 560 185Z" fill="#fff"/>`;
    for (let i = 0; i <= 8; i++) s += `<line x1="${70 + i * 60}" y1="${i % 4 ? 152 : 140}" x2="${70 + i * 60}" y2="${i % 4 ? 188 : 200}" stroke="#fff" stroke-width="${i % 4 ? 4 : 7}"/>`;
    s += zeichen(70, 250, '0', 46) + zeichen(310, 250, '1', 46) + zeichen(550, 250, '2', 46);
    s += `<path d="M238 95 262 95 250 125Z" fill="#ffd34d"/>` + zeichen(250, 82, '¾', 52, '#ffd34d');
    return s;
  },
  anteile: () => {
    let s = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s += `<rect x="${90 + c * 70}" y="${55 + r * 64}" width="66" height="60" rx="4" fill="${r * 4 + c < 5 ? '#ffd34d' : 'rgba(255,255,255,.3)'}" stroke="#fff" stroke-width="3"/>`;
    return s + zeichen(480, 175, '= ?', 70);
  },

  'anteile-vom': () => {
    let s = '';
    for (let c = 0; c < 3; c++) s += `<rect x="${90 + c * 140}" y="60" width="136" height="70" rx="6" fill="${c === 0 ? '#ffd34d' : 'rgba(255,255,255,.3)'}" stroke="#fff" stroke-width="3"/>`;
    s += `<rect x="90" y="60" width="68" height="70" rx="6" fill="#7a2bd6" stroke="#fff" stroke-width="3"/>`;
    s += `<line x1="158" y1="50" x2="158" y2="140" stroke="#fff" stroke-width="4" stroke-dasharray="8 6"/>`;
    return s + zeichen(300, 230, '½ von ⅓', 64);
  },
  erweitern: () => {
    let s = '';
    for (let i = 0; i < 3; i++) s += `<rect x="${70 + i * 150}" y="90" width="146" height="90" rx="6" fill="${i < 2 ? '#ffd34d' : 'rgba(255,255,255,.3)'}" stroke="#fff" stroke-width="4"/>`;
    for (let i = 0; i < 3; i++) s += `<line x1="${143 + i * 150}" y1="90" x2="${143 + i * 150}" y2="180" stroke="#fff" stroke-width="4" stroke-dasharray="9 7"/>`;
    s += `<g transform="translate(443 70) rotate(8)"><path d="M-7 -8 L0 6 L7 -8 L7 -60 Q0 -68 -7 -60 Z" fill="#eef2f6" stroke="#5b6675" stroke-width="3"/><rect x="-9" y="-104" width="18" height="44" rx="6" fill="#8b5a2b"/></g>`;
    return s + zeichen(300, 255, '⅔ = ⁴⁄₆', 54);
  },
  kuerzen: () => {
    let s = '';
    for (let i = 0; i < 6; i++) s += `<rect x="${70 + i * 76}" y="90" width="72" height="90" rx="6" fill="${i < 4 ? '#ffd34d' : 'rgba(255,255,255,.3)'}" stroke="#fff" stroke-width="4"/>`;
    s += `<g transform="translate(220 70)"><rect x="-15" y="-70" width="30" height="54" rx="7" fill="#ffd34d" stroke="#fff" stroke-width="3"/><rect x="-15" y="-55" width="30" height="14" fill="#2f6fe4"/><path d="M-4 0 L4 0 L6 -16 L-6 -16 Z" fill="#fff"/></g>`;
    return s + zeichen(300, 255, '⁴⁄₆ = ⅔', 54);
  },
  'rational-ordner': () => {
    let s = `<line x1="60" y1="190" x2="540" y2="190" stroke="#fff" stroke-width="7"/><path d="M540 175 565 190 540 205Z" fill="#fff"/>`;
    for (let i = -4; i <= 4; i++) s += `<line x1="${300 + i * 55}" y1="${i ? 175 : 165}" x2="${300 + i * 55}" y2="${i ? 205 : 215}" stroke="#fff" stroke-width="${i ? 4 : 7}"/>`;
    return s + zeichen(300, 255, '0', 46) + zeichen(150, 120, '−', 120, '#ffd34d') + zeichen(450, 130, '+', 110, '#ffd34d');
  },
  vorzeichen: () => {
    const kreis = (x, y, t, f) => `<circle cx="${x}" cy="${y}" r="42" fill="${f}" stroke="#fff" stroke-width="5"/>` + zeichen(x, y + 26, t, 78);
    return kreis(120, 95, '−', '#e0262b') + zeichen(205, 118, '·', 70) + kreis(290, 95, '−', '#e0262b') + zeichen(380, 120, '=', 70) + kreis(470, 95, '+', '#1f5fd1')
      + zeichen(300, 260, '(−3) · (−4) = 12', 50);
  },
  'prozent-ordner': () => zeichen(300, 190, '%', 190) + `<circle cx="140" cy="80" r="26" fill="#ffd34d"/><circle cx="460" cy="230" r="26" fill="#ffd34d"/>`,
  'prozent-dreieck': () => {
    const t = (pk, f) => `<polygon points="${pk}" fill="${f}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>`;
    return t('300,30 230,145 370,145', '#f08c00') + t('230,145 300,145 300,265 160,265', '#2f6fe4') + t('300,145 370,145 440,265 300,265', '#2fae58')
      + zeichen(300, 125, 'W', 54) + zeichen(250, 230, 'G', 54) + zeichen(355, 230, 'p%', 44) + `<rect x="60" y="60" width="90" height="70" rx="10" fill="rgba(255,255,255,.9)"/>` + zeichen(105, 112, '?', 54, '#0e9f6e');
  },
  'teil-berechnen': () => {
    let s = `<path d="M80 60 q0 -18 18 -18 h404 q18 0 18 18" fill="none" stroke="#fff" stroke-width="5"/>` + zeichen(300, 34, '24 €', 34);
    for (let i = 0; i < 4; i++) s += `<rect x="${80 + i * 110}" y="80" width="106" height="80" rx="6" fill="${i < 3 ? '#ffd34d' : 'rgba(255,255,255,.3)'}" stroke="#fff" stroke-width="3"/>` + zeichen(133 + i * 110, 135, '6', 40, i < 3 ? '#7a4e05' : '#fff');
    return s + `<path d="M80 180 q0 18 18 18 h294 q18 0 18 -18" fill="none" stroke="#fff" stroke-width="5"/>` + zeichen(245, 260, '¾ = ?', 50);
  },
  'ganzes-berechnen': () => {
    let s = `<path d="M80 60 q0 -18 18 -18 h404 q18 0 18 18" fill="none" stroke="#fff" stroke-width="5"/>` + zeichen(300, 34, '?', 38);
    for (let i = 0; i < 5; i++) s += `<rect x="${80 + i * 88}" y="80" width="84" height="80" rx="6" fill="${i < 2 ? '#ffd34d' : 'rgba(255,255,255,.3)'}" stroke="#fff" stroke-width="3"/>` + zeichen(122 + i * 88, 135, '6', 40, i < 2 ? '#7a4e05' : '#fff');
    return s + `<path d="M80 180 q0 18 18 18 h140 q18 0 18 -18" fill="none" stroke="#fff" stroke-width="5"/>` + zeichen(168, 260, '⅖ = 12', 50);
  },

  /* ---- Block 4: Zahlen und Größen ---- */
  'groessen-ordner': () => {
    let s = `<rect x="70" y="200" width="460" height="40" rx="8" fill="#ffd34d" stroke="#fff" stroke-width="4"/>`;
    for (let i = 0; i <= 10; i++) s += `<line x1="${90 + i * 42}" y1="200" x2="${90 + i * 42}" y2="${i % 5 ? 218 : 232}" stroke="#7a4e05" stroke-width="3"/>`;
    s += `<circle cx="180" cy="120" r="42" fill="#f2c94c" stroke="#fff" stroke-width="5"/>` + zeichen(180, 138, '1€', 46, '#7a4e05');
    s += `<rect x="290" y="70" width="90" height="100" rx="10" fill="#fff"/><path d="M335 85 v35 l22 14" stroke="#1b2340" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    return s + zeichen(470, 160, 'kg', 70);
  },
  rechenrahmen: () => {
    let s = `<rect x="90" y="40" width="420" height="220" rx="12" fill="none" stroke="#fff" stroke-width="10"/>`;
    const farben = ['#ff5a5a', '#55b7ff', '#4cd387', '#ff5a5a', '#55b7ff', '#4cd387'];
    for (let r = 0; r < 4; r++) {
      s += `<line x1="95" y1="${80 + r * 50}" x2="505" y2="${80 + r * 50}" stroke="#fff" stroke-width="4"/>`;
      const n = [3, 7, 1, 5][r];
      for (let i = 0; i < n; i++) s += `<circle cx="${120 + i * 26}" cy="${80 + r * 50}" r="13" fill="${farben[r + 2]}" stroke="#fff" stroke-width="2"/>`;
      for (let i = 0; i < 10 - n; i++) s += `<circle cx="${480 - i * 26}" cy="${80 + r * 50}" r="13" fill="${farben[r + 2]}" stroke="#fff" stroke-width="2"/>`;
    }
    return s;
  },
  zahlenstrahl: () => {
    let s = `<line x1="50" y1="200" x2="550" y2="200" stroke="#fff" stroke-width="6"/>`;
    for (let i = 0; i <= 10; i++) s += `<line x1="${60 + i * 48}" y1="185" x2="${60 + i * 48}" y2="215" stroke="#fff" stroke-width="4"/>`;
    s += `<rect x="240" y="60" width="160" height="70" rx="12" fill="none" stroke="#ffd34d" stroke-width="6"/><path d="M252 130 L252 190 M396 130 L396 190" stroke="#ffd34d" stroke-width="4" stroke-dasharray="8 6"/>`;
    return s + `<circle cx="370" cy="200" r="14" fill="#e0262b" stroke="#fff" stroke-width="4"/>` + zeichen(320, 112, '3 700', 44);
  },
  umtauschen: () => {
    let s = `<rect x="70" y="80" width="140" height="140" rx="12" fill="#fff" opacity=".9"/>` + zeichen(140, 172, '1 m', 56, '#1b2340');
    s += zeichen(285, 172, '⇄', 80);
    for (let i = 0; i < 10; i++) s += `<rect x="${360 + (i % 5) * 38}" y="${85 + Math.floor(i / 5) * 72}" width="32" height="64" rx="6" fill="#ffd34d" stroke="#fff" stroke-width="3"/>`;
    return s + zeichen(455, 270, '10 dm', 34);
  },
  geld: () => {
    const muenze = (x, y, r, t, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="#fff" stroke-width="4"/>` + zeichen(x, y + r * .35, t, r * .9, '#5a3c00');
    return `<rect x="70" y="70" width="230" height="120" rx="10" fill="#9fd3a8" stroke="#fff" stroke-width="5"/>` + zeichen(185, 150, '10 €', 56, '#1d5c2a')
      + muenze(380, 110, 52, '2€', '#f2c94c') + muenze(480, 170, 44, '1€', '#e9c46a') + muenze(360, 220, 32, '50', '#e8b04b') + muenze(270, 240, 26, '10', '#e8b04b');
  },
  diagramm: () => {
    let s = `<line x1="90" y1="250" x2="520" y2="250" stroke="#fff" stroke-width="5"/><line x1="90" y1="250" x2="90" y2="40" stroke="#fff" stroke-width="5"/>`;
    [120, 190, 80, 160].forEach((h, i) => { s += `<rect x="${130 + i * 95}" y="${250 - h}" width="60" height="${h}" rx="6" fill="${['#ffd34d', '#ff8a5a', '#55b7ff', '#4cd387'][i]}" stroke="#fff" stroke-width="3"/>`; });
    return s + `<g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M430 50v40M445 50v40M460 50v40M475 50v40M422 85 485 55"/></g>`;
  },

  /* ---- Block 5: Flächen ---- */
  'flaechen-ordner': () => {
    let s = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) s += `<rect x="${100 + c * 52}" y="${70 + r * 52}" width="48" height="48" rx="5" fill="${r === 0 ? '#ffd34d' : 'rgba(255,255,255,.35)'}" stroke="#fff" stroke-width="3"/>`;
    return s + zeichen(480, 140, 'A', 90) + zeichen(480, 220, '= a·b', 46);
  },
  auslegen: () => {
    let s = `<rect x="80" y="60" width="300" height="180" fill="none" stroke="#fff" stroke-width="5"/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) if (r < 2 || c < 2) s += `<rect x="${84 + c * 59}" y="${64 + r * 59}" width="55" height="55" rx="5" fill="#ffd34d" stroke="#fff" stroke-width="2"/>`;
    return s + zeichen(490, 165, '5 · 3', 64);
  },
  zerlegen: () => `<rect x="90" y="70" width="280" height="160" fill="rgba(255,255,255,.25)" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/>
      <path d="M90 230 L370 230 L230 70Z" fill="#ffd34d" stroke="#fff" stroke-width="5"/>
      <path d="M90 230 L230 70 L90 70Z" fill="#ff8a5a" opacity=".75" stroke="#fff" stroke-width="3"/>` + zeichen(490, 160, '½', 110),
  umfang: () => {
    return `<rect x="90" y="70" width="230" height="140" rx="4" fill="rgba(255,255,255,.25)" stroke="#e0262b" stroke-width="8"/>
      <path d="M90 250 H520" stroke="#e0262b" stroke-width="8" stroke-linecap="round"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<line x1="${90 + i * 53.75}" y1="238" x2="${90 + i * 53.75}" y2="262" stroke="#fff" stroke-width="3"/>`).join('')}
      <circle cx="320" cy="70" r="12" fill="#fff"/>` + zeichen(450, 150, 'u', 100);
  },
  einheiten: () => {
    let s = `<rect x="70" y="70" width="160" height="160" fill="#55b7ff" stroke="#fff" stroke-width="5"/>`;
    s += `<circle cx="150" cy="150" r="40" fill="none" stroke="#fff" stroke-width="6"/><line x1="180" y1="180" x2="235" y2="235" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`;
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) s += `<rect x="${310 + c * 18}" y="${60 + r * 18}" width="16" height="16" fill="#55b7ff" stroke="#fff" stroke-width="1"/>`;
    return s + zeichen(400, 280, '1 dm² = 100 cm²', 30);
  },

  /* ---- Block 6: Körper ---- */
  'koerper-ordner': () => {
    const w = (x, y, a, f) => `<path d="M${x} ${y} l${a} ${-a / 2} l${a} ${a / 2} l${-a} ${a / 2}Z" fill="#fff"/><path d="M${x} ${y} l${a} ${a / 2} v${a} l${-a} ${-a / 2}Z" fill="${f}"/><path d="M${x + a} ${y + a / 2} l${a} ${-a / 2} v${a} l${-a} ${a / 2}Z" fill="${f}" opacity=".7"/>`;
    return w(150, 110, 80, '#ffd34d') + w(330, 150, 55, '#55b7ff') + w(410, 90, 40, '#ff8a5a');
  },
  netze: () => {
    let s = '';
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]].forEach(([c, r]) => { s += `<rect x="${110 + c * 70}" y="${45 + r * 70}" width="66" height="66" rx="4" fill="${r === 1 && c === 1 ? '#ffd34d' : 'rgba(255,255,255,.85)'}" stroke="#1b2340" stroke-width="3"/>`; });
    return s + zeichen(500, 175, '⬚', 90);
  },
  quader: () => {
    const a = 34;
    let s = '';
    for (let z = 0; z < 2; z++) for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) {
      const X = 140 + x * a - y * a * .55, Y = 210 - z * a + y * a * .45 - 30;
      s += `<path d="M${X} ${Y} h${a} l${a * .55} ${-a * .45} h${-a}Z" fill="#fff6c7" stroke="#7a4e05" stroke-width="1.5"/><rect x="${X}" y="${Y}" width="${a}" height="${a}" fill="#ffd34d" stroke="#7a4e05" stroke-width="1.5"/><path d="M${X + a} ${Y} l${a * .55} ${-a * .45} v${a} l${-a * .55} ${a * .45}Z" fill="#e0a51f" stroke="#7a4e05" stroke-width="1.5"/>`;
    }
    return s + zeichen(480, 175, 'V', 90);
  },
  ansichten: () => {
    let s = '';
    const a = 40;
    [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(([x, y, z]) => {
      const X = 130 + x * a - y * a * .55, Y = 190 - z * a + y * a * .45;
      s += `<path d="M${X} ${Y} h${a} l${a * .55} ${-a * .45} h${-a}Z" fill="#fff"/><rect x="${X}" y="${Y}" width="${a}" height="${a}" fill="#55b7ff" stroke="#fff" stroke-width="2"/><path d="M${X + a} ${Y} l${a * .55} ${-a * .45} v${a} l${-a * .55} ${a * .45}Z" fill="#2f6fe4" stroke="#fff" stroke-width="2"/>`;
    });
    s += `<path d="M420 120 q30 -40 60 0 q-30 40 -60 0Z" fill="#fff"/><circle cx="450" cy="120" r="12" fill="#1b2340"/>`;
    return s;
  },

  /* ---- Block 7: Deutsch ---- */
  'satzbau-ordner': () => `<path d="M100 150 H500" stroke="#fff" stroke-width="6" marker-end=""/>
      <circle cx="160" cy="150" r="42" fill="#1b2340" stroke="#fff" stroke-width="4"/><circle cx="300" cy="150" r="38" fill="#e0262b" stroke="#fff" stroke-width="4"/>
      <circle cx="440" cy="150" r="26" fill="#1b2340" stroke="#fff" stroke-width="4"/>`,
  satzglieder: () => {
    const k = (x, w, t, f) => `<rect x="${x}" y="110" width="${w}" height="70" rx="12" fill="${f}" stroke="#fff" stroke-width="4"/>` + zeichen(x + w / 2, 158, t, 34, f === '#fff' ? '#1b2340' : '#fff');
    return k(40, 140, 'Heute', '#fff') + k(190, 110, 'malt', '#e0262b') + k(310, 110, 'Lina', '#fff') + k(430, 130, 'ein Bild', '#fff')
      + `<path d="M110 100 C110 40 340 40 365 100" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="10 7"/>`;
  },
  wortbausteine: () => {
    const b = (x, w, t, f) => `<rect x="${x}" y="105" width="${w}" height="90" rx="10" fill="${f}" stroke="#fff" stroke-width="5"/>` + zeichen(x + w / 2, 165, t, 50);
    return b(70, 130, 'ver', '#2f6fe4') + b(205, 170, 'fahr', '#e0262b') + b(380, 110, 'en', '#1f9d55');
  },
  nomenprobe: () => `<rect x="60" y="100" width="130" height="80" rx="12" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="4" stroke-dasharray="10 6"/>`
      + zeichen(125, 155, 'das', 44) + `<rect x="210" y="90" width="320" height="100" rx="14" fill="#fff"/>` + zeichen(370, 162, 'Laufen', 64, '#1b2340')
      + `<path d="M226 110 q14 -30 30 0" stroke="#e0262b" stroke-width="6" fill="none"/>`,

  stufe1: () => `${stern(300, 140, 70)}${perle(140, 220)}${perle(170, 230)}${perle(460, 225)}`,
  stufe2: () => `${stern(220, 140, 62)}${stern(380, 140, 62)}${perle(110, 230)}${perle(500, 225)}`,
  stufe3: () => `${stern(150, 150, 54)}${stern(300, 120, 62)}${stern(450, 150, 54)}${perle(300, 245)}`,

  eigene: () => `
    <rect x="170" y="45" width="220" height="215" rx="14" fill="#fff"/>
    ${[95, 135, 175, 215].map(y => `<line x1="195" y1="${y}" x2="365" y2="${y}" stroke="#c9d4ea" stroke-width="3"/>`).join('')}
    ${zeichen(280, 190, '?', 130, '#ec5fa8')}
    <g transform="translate(410 70) rotate(35)">
      <rect width="34" height="170" rx="6" fill="#ffd34d" stroke="#fff" stroke-width="3"/>
      <path d="M0 170 17 210 34 170Z" fill="#f4c59a" stroke="#fff" stroke-width="3"/>
      <path d="M11 196 17 210 23 196Z" fill="#333"/>
    </g>`,
};

/** Kopfband einer Kachel. */
export function kachelBild(name, farbe) {
  const zeichnung = (ZEICHNUNGEN[name] || ZEICHNUNGEN.mathematik)();
  return `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"
      style="background: linear-gradient(135deg, ${farbe}, ${dunkler(farbe)})">
    <circle cx="560" cy="20" r="90" fill="#fff" opacity=".1"/>
    <circle cx="30" cy="290" r="70" fill="#fff" opacity=".08"/>
    ${zeichnung}
  </svg>`;
}
