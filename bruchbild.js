/* Gemeinsame Bilder und Hilfen für die Bruchrechen-Bausteine (Plus, Minus, Mal, Geteilt):
   Bruchstreifen als SVG, Messer-Animation zum Verfeinern (gleichnamig machen), Vielfachen-Leisten,
   Ergebnis-Kette (kürzen, gemischte Zahl) und der Schalter „auch über 1“. */

import { ESC, bruchHtml, bruchFeld, zahlFeld, ggT, bewegung, warte } from './geruest.js';

const SVGNS = 'http://www.w3.org/2000/svg';

/* ---------- Schalter „auch über 1“ (gemerkt für alle vier Bausteine) ---------- */
const SPEICHER = 'ab-bruchrechnen-ueber1';
let ueber1Fallback = false;
export function ueber1Lesen() { try { return localStorage.getItem(SPEICHER) === '1'; } catch { return ueber1Fallback; } }
export function ueber1Setzen(w) { ueber1Fallback = w; try { localStorage.setItem(SPEICHER, w ? '1' : '0'); } catch { /* egal */ } }
export const ueber1Html = (an, hinweis = '') => `<div class="br-schalter">
    <div class="umschalter" role="group" aria-label="Zahlenraum">
      <button type="button" data-ueber1="0" aria-pressed="${!an}">bis 1</button><button type="button" data-ueber1="1" aria-pressed="${an}">auch über 1</button>
    </div>${hinweis ? `<span class="leise br-schalter-hinweis">${hinweis}</span>` : ''}</div>`;

/* ---------- Brüche als Text ---------- */
const NAMEN = { 1: 'Ganze', 2: 'Halbe', 3: 'Drittel', 4: 'Viertel', 5: 'Fünftel', 6: 'Sechstel', 7: 'Siebtel', 8: 'Achtel', 9: 'Neuntel', 10: 'Zehntel', 11: 'Elftel', 12: 'Zwölftel', 13: 'Dreizehntel', 14: 'Vierzehntel', 15: 'Fünfzehntel', 16: 'Sechzehntel', 18: 'Achtzehntel' };
export const nennerName = n => NAMEN[n] ?? `${n}stel`;
/** „3 Achtel“ (für Sprechblase und Vorlesen) */
export const bruchWort = (z, n) => (n === 2 && z === 1 ? 'ein Halb' : `${z} ${nennerName(n)}`);
/** Gemischte Zahl als HTML, z. B. 1 ⅚ */
export function gemischtHtml(z, n) {
  const g = Math.floor(z / n), r = z % n;
  if (!r) return `<b class="br-ganz">${g}</b>`;
  return g ? `<span class="br-gemischt"><b>${g}</b>${bruchHtml(r, n)}</span>` : bruchHtml(r, n);
}
/** Bruch, bei Bedarf als gemischte Zahl (für Aufgabenstellungen mit Zahlen über 1). */
export const zahlHtml = (z, n, gemischt = true) => (gemischt && z > n ? gemischtHtml(z, n) : bruchHtml(z, n));

export function kuerze(z, n) { const t = ggT(z, n) || 1; return [z / t, n / t]; }
export const gleich = (z1, n1, z2, n2) => z1 * n2 === z2 * n1;

/* ---------- Bruchstreifen ---------- */
/**
 * Streifen für ein oder mehrere Ganze, jeder Streifen in N gleiche Stücke.
 * art(i) liefert die Klasse für Stück i (0 … ganze·N−1), z. B. 'a', 'b', 'leer', 'weg'.
 * Ein Stück mit tipp(i) = true bekommt data-stueck und ist antippbar.
 */
export function streifenSvg(o) {
  const { x = 10, y = 10, w = 500, h = 52, N, ganze = 1, abstand = 16, art = () => 'leer', tipp = () => false, id = 's', beschriftung = true, klasse = '' } = o;
  const pw = w / N;
  let s = `<g class="br-streifen ${klasse}" data-sid="${id}">`;
  for (let g = 0; g < ganze; g++) {
    const yy = y + g * (h + abstand);
    for (let j = 0; j < N; j++) {
      const i = g * N + j, k = art(i), t = tipp(i);
      s += `<rect x="${x + j * pw}" y="${yy}" width="${pw}" height="${h}" class="br-st br-${k}${t ? ' br-tipp' : ''}"${t ? ` data-stueck="${i}" data-sid="${id}" role="button" tabindex="0" aria-label="Stück ${i + 1}"` : ''} data-i="${i}"/>`;
    }
    s += `<rect x="${x}" y="${yy}" width="${w}" height="${h}" rx="3" class="br-rand"/>`;
    if (beschriftung && ganze > 1) s += `<text x="${x + w + 8}" y="${yy + h / 2 + 5}" class="br-ganz-text">${g + 1}. Ganzes</text>`;
  }
  return s + '</g>';
}
/** Höhe, die streifenSvg für eine Anzahl Ganzer braucht */
export const streifenHoehe = (ganze, h = 52, abstand = 16) => ganze * h + (ganze - 1) * abstand;
/** Linke obere Ecke von Stück i */
export const stueckPos = (o, i) => {
  const { x = 10, y = 10, w = 500, h = 52, N, abstand = 16 } = o;
  return { x: x + (i % N) * (w / N), y: y + Math.floor(i / N) * (h + abstand) };
};

/* ---------- Werkzeuge ---------- */
export const MESSER = `<path d="M-5 -6 L0 4 L5 -6 L5 -46 Q0 -52 -5 -46 Z" fill="#dfe6ee" stroke="#5b6675" stroke-width="2"/>
  <rect x="-7" y="-78" width="14" height="32" rx="5" fill="#8b5a2b" stroke="#5a3a1b" stroke-width="2"/><circle cx="0" cy="-70" r="2" fill="#f3d9b1"/><circle cx="0" cy="-56" r="2" fill="#f3d9b1"/>`;

/**
 * Messer-Animation: schneidet jedes Stück eines Streifens in k gleiche Teile (senkrechte Schnitte).
 * svg: das <svg>-Element; o: Streifen-Optionen wie bei streifenSvg.
 */
export async function schneiden(svg, o, k) {
  if (!svg || k < 2) return;
  const { x = 10, y = 10, w = 500, h = 52, N, ganze = 1, abstand = 16 } = o;
  const pw = w / N, linien = [];
  for (let g = 0; g < ganze; g++) for (let j = 0; j < N; j++) for (let t = 1; t < k; t++) linien.push({ lx: x + (j + t / k) * pw, ly: y + g * (h + abstand) });
  const gruppe = document.createElementNS(SVGNS, 'g');
  gruppe.setAttribute('class', 'br-schnitte');
  linien.forEach(l => {
    const e = document.createElementNS(SVGNS, 'line');
    e.setAttribute('x1', l.lx); e.setAttribute('x2', l.lx); e.setAttribute('y1', l.ly); e.setAttribute('y2', l.ly + h);
    e.setAttribute('class', 'br-schnitt'); e.style.strokeDasharray = h; gruppe.appendChild(e); l.el = e;
  });
  const messer = document.createElementNS(SVGNS, 'g');
  messer.setAttribute('class', 'br-messer'); messer.innerHTML = MESSER;
  gruppe.appendChild(messer);
  svg.appendChild(gruppe);
  if (!bewegung()) { messer.remove(); return; }
  const proLinie = Math.max(70, Math.min(240, 2400 / linien.length));
  const gesamt = proLinie * linien.length;
  const frames = [];
  linien.forEach((l, i) => {
    frames.push({ transform: `translate(${l.lx}px, ${l.ly - 4}px)`, offset: i / linien.length });
    frames.push({ transform: `translate(${l.lx}px, ${l.ly + h}px)`, offset: (i + 0.7) / linien.length });
  });
  frames.push({ transform: `translate(${linien.at(-1).lx}px, ${linien.at(-1).ly - 20}px)`, offset: 1 });
  const lauf = messer.animate(frames, { duration: gesamt, easing: 'linear', fill: 'forwards' });
  linien.forEach((l, i) => l.el.animate([{ strokeDashoffset: h }, { strokeDashoffset: 0 }], { duration: proLinie * 0.7, delay: proLinie * i, fill: 'backwards', easing: 'ease-in' }));
  await lauf.finished.catch(() => {});
  await warte(150);
  messer.remove();
}

/** Messer-Animation mit waagerechten Schnitten über ein Rechteck (für Mal und Geteilt). */
export async function schneidenQuer(svg, r, k) {
  if (!svg || k < 2) return;
  const gruppe = document.createElementNS(SVGNS, 'g');
  gruppe.setAttribute('class', 'br-schnitte');
  const linien = [];
  for (let t = 1; t < k; t++) {
    const e = document.createElementNS(SVGNS, 'line'), ly = r.y + (t / k) * r.h;
    e.setAttribute('x1', r.x); e.setAttribute('x2', r.x + r.w); e.setAttribute('y1', ly); e.setAttribute('y2', ly);
    e.setAttribute('class', 'br-schnitt quer'); e.style.strokeDasharray = r.w; gruppe.appendChild(e); linien.push({ el: e, ly });
  }
  const messer = document.createElementNS(SVGNS, 'g');
  messer.setAttribute('class', 'br-messer'); messer.innerHTML = `<g transform="rotate(-90)">${MESSER}</g>`;
  gruppe.appendChild(messer);
  svg.appendChild(gruppe);
  if (!bewegung()) { messer.remove(); return; }
  const pro = 520, frames = [];
  linien.forEach((l, i) => {
    frames.push({ transform: `translate(${r.x - 6}px, ${l.ly}px)`, offset: i / linien.length });
    frames.push({ transform: `translate(${r.x + r.w}px, ${l.ly}px)`, offset: (i + 0.8) / linien.length });
  });
  frames.push({ transform: `translate(${r.x + r.w + 30}px, ${linien.at(-1).ly}px)`, offset: 1 });
  const lauf = messer.animate(frames, { duration: pro * linien.length, fill: 'forwards' });
  linien.forEach((l, i) => l.el.animate([{ strokeDashoffset: r.w }, { strokeDashoffset: 0 }], { duration: pro * 0.8, delay: pro * i, fill: 'backwards' }));
  await lauf.finished.catch(() => {});
  await warte(150);
  messer.remove();
}

/** Ein Stück fliegt von (vx|vy) an seinen neuen Platz (SVG-Einheiten). */
export function flug(el, dx, dy, dauer = 520) {
  if (!el || !bewegung() || (!dx && !dy)) return Promise.resolve();
  return el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: dauer, easing: 'cubic-bezier(.4,0,.2,1)' }).finished.catch(() => {});
}

/* ---------- Gemeinsamen Nenner finden ---------- */
export function vielfache(n, bis) { const v = []; for (let m = n; m <= bis; m += n) v.push(m); return v; }
/** Zwei Leisten mit Vielfachen; antippen wählt einen Nenner. */
export function vielfacheHtml(n1, n2, gewaehlt = null, falsch = null) {
  const bis = Math.max(n1 * n2, 2 * Math.max(n1, n2));
  const reihe = (n, farbe) => `<div class="br-vf-reihe"><span class="br-vf-kopf ${farbe}">Vielfache von ${n}</span>${vielfache(n, bis).map(m => {
    const gemeinsam = gewaehlt === m;
    return `<button type="button" class="br-vf${gemeinsam ? ' gewaehlt' : ''}${falsch === m ? ' falsch' : ''}" data-vf="${m}">${m}</button>`;
  }).join('')}</div>`;
  return `<div class="br-vf-box">${reihe(n1, 'a')}${reihe(n2, 'b')}</div>`;
}

/* ---------- Ergebnis-Kette: kürzen, ganze Zahl, gemischte Zahl ---------- */
/** Schritte nach dem ersten Ergebnis z/n. */
export function folgeKette(z, n, gemischt) {
  const s = [];
  const [kz, kn] = kuerze(z, n);
  if (kn === 1) s.push({ art: 'ganz', wert: kz });
  else {
    if (kz !== z) s.push({ art: 'kuerzen', z: kz, n: kn });
    if (gemischt && kz > kn) s.push({ art: 'gemischt', g: Math.floor(kz / kn), z: kz % kn, n: kn });
  }
  return { schritte: s, i: 0, alt: { z, n } };
}
export const ketteFertig = k => !k || k.i >= k.schritte.length;

/** HTML: erledigte Schritte als Gleichungskette, offener Schritt mit Eingabe. */
export function ketteHtml(k, eing, p = 'br') {
  if (!k) return '';
  let h = '';
  k.schritte.forEach((s, i) => {
    if (i > k.i) return;
    const offen = i === k.i;
    if (s.art === 'kuerzen') h += offen
      ? `<p class="vz-schritt">Kürze so weit wie möglich:</p><div class="gs-pruef br-gl">= ${bruchFeld(`${p}-kz`, `${p}-kn`, eing)}<button type="button" class="kn-gross" data-kette="pruefen">✓ Prüfen</button></div>`
      : `<p class="br-kette-zeile">= ${bruchHtml(s.z, s.n)} <span class="leise">gekürzt</span></p>`;
    if (s.art === 'ganz') h += offen
      ? `<p class="vz-schritt">Das ist eine ganze Zahl. Welche?</p><div class="gs-pruef br-gl">= ${zahlFeld(`${p}-g`, eing[`${p}-g`] ?? '', 3, 'Ganze Zahl')}<button type="button" class="kn-gross" data-kette="pruefen">✓ Prüfen</button></div>`
      : `<p class="br-kette-zeile">= <b class="br-ganz">${s.wert}</b></p>`;
    if (s.art === 'gemischt') h += offen
      ? `<p class="vz-schritt">Schreibe als gemischte Zahl (Ganze und Rest):</p><div class="gs-pruef br-gl">= ${zahlFeld(`${p}-mg`, eing[`${p}-mg`] ?? '', 2, 'Ganze')} ${bruchFeld(`${p}-mz`, `${p}-mn`, eing)}<button type="button" class="kn-gross" data-kette="pruefen">✓ Prüfen</button></div>`
      : `<p class="br-kette-zeile">= ${gemischtHtml(s.g * s.n + s.z, s.n)}</p>`;
  });
  return h;
}

/** Prüft den offenen Schritt; gibt eine Bewertung zurück und schaltet weiter. */
export function kettePruefen(k, eing, p = 'br') {
  const s = k.schritte[k.i];
  const zahl = id => (eing[id] === undefined || eing[id] === '' ? NaN : Number(eing[id]));
  if (s.art === 'kuerzen') {
    const z = zahl(`${p}-kz`), n = zahl(`${p}-kn`);
    if (Number.isNaN(z) || Number.isNaN(n) || !n) return { ok: false, text: 'Trage Zähler und Nenner ein.' };
    if (!gleich(z, n, s.z, s.n)) return { ok: false, text: 'Der Wert hat sich verändert. Teile Zähler <b>und</b> Nenner durch dieselbe Zahl.' };
    if (n !== s.n) return { ok: false, text: `Richtig gekürzt – aber es geht noch weiter. Suche eine Zahl, durch die ${z} und ${n} beide teilbar sind.` };
    k.i++; return { ok: true, text: `Gekürzt: ${bruchHtml(s.z, s.n)}` };
  }
  if (s.art === 'ganz') {
    const g = zahl(`${p}-g`);
    if (Number.isNaN(g)) return { ok: false, text: 'Trage die ganze Zahl ein.' };
    if (g !== s.wert) return { ok: false, text: `Wie viele Ganze sind ${bruchHtml(k.alt.z, k.alt.n)}? Rechne Zähler : Nenner.` };
    k.i++; return { ok: true, text: `Genau ${s.wert} Ganze.` };
  }
  const g = zahl(`${p}-mg`), z = zahl(`${p}-mz`), n = zahl(`${p}-mn`);
  if ([g, z, n].some(Number.isNaN) || !n) return { ok: false, text: 'Trage die Ganzen und den Rest-Bruch ein.' };
  if (g * n + z === s.g * n + s.z * (n / s.n) && n === s.n && z === s.z) { k.i++; return { ok: true, text: 'Gemischte Zahl stimmt.' }; }
  if (z >= n) return { ok: false, text: 'Der Rest-Bruch muss kleiner als 1 sein – nimm noch ein Ganzes heraus.' };
  if (g !== s.g) return { ok: false, text: `Wie oft passt ${s.n} in den Zähler? So viele Ganze sind es.` };
  return { ok: false, text: `Die ${s.g} Ganze stimmen. Wie viele ${nennerName(s.n)} bleiben übrig?` };
}

/* ---------- Eingabe eines Bruchs lesen ---------- */
export function liesBruch(eing, idZ, idN) {
  const z = eing[idZ], n = eing[idN];
  if (z === undefined || z === '' || n === undefined || n === '') return null;
  return { z: Number(z), n: Number(n) };
}

/** Rückmeldung: grün „gut“ nur, wenn die Aufgabe ganz fertig ist (sonst würde Enter zur nächsten Aufgabe springen). */
export const meldungHtml = (b, fertig) => (b ? `<p class="tb-antwort ${b.ok ? (fertig ? 'gut' : 'zwischen') : 'schlecht'}">${b.text}</p>` : '');

/** Merke-Kasten (aufklappbar) */
export const merkeHtml = (titel, inhalt, offen = false) => `<details class="br-merke"${offen ? ' open' : ''}><summary>📘 ${ESC(titel)}</summary><div class="br-merke-inhalt">${inhalt}</div></details>`;

/** Knopf für den Erklärfilm (Kopfzeile) */
export const filmKnopf = '<button type="button" class="kn-gross br-filmknopf" data-film><span aria-hidden="true">🎬</span> Erklärfilm</button>';
