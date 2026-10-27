/* Mathematik: Rationale Zahlen – „Mal und Geteilt mit Vorzeichen“ (starteVorzeichen)
   Drei Reiter:
   1. Muster entdecken: Malreihe läuft über die Null (z. B. 3 · 2, 3 · 1, 3 · 0, 3 · (−1) …).
      Die ersten drei Zeilen stehen da, den Rest trägt man selbst ein. Am Zahlenstrahl erscheinen die Ergebnisse als Punkte,
      Tipp 2 zeigt die gleich großen Schritte. Ergebnis: Vorzeichenregel.
   2. Am Zahlenstrahl: a · b als |a| Sprünge der Länge b (nach rechts bei b > 0, nach links bei b < 0).
      Ist a negativ, wird am Ende an der Null gespiegelt (Gegenzahl). Dann Ergebnis eintragen.
   3. Vorzeichen-Detektiv: Produkte und Quotienten mit 2–4 Zahlen (ganze Zahlen oder Brüche/Kommazahlen).
      1. alle negativen Zahlen antippen, 2. Vorzeichen wählen (je zwei Minus werden ein Plus), 3. Betrag ausrechnen.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, zufall, wahl, mischen, antwortHtml, bruchHtml, ggT, warte, bewegung } from './geruest.js';

const STIL = `
.vz-svg { display: block; width: 100%; height: auto; }
.vz-huelle { overflow-x: auto; }
.vz-linie { stroke: var(--text); stroke-width: 3; }
.vz-spitze { fill: var(--text); }
.vz-strich { stroke: var(--text); stroke-width: 1.4; }
.vz-strich.fuenf { stroke-width: 2.4; }
.vz-zahl { font: 700 15px var(--titel); text-anchor: middle; fill: var(--leise); }
.vz-zahl.null { font-size: 19px; fill: var(--text); font-weight: 800; }
.vz-minusseite { fill: #e0262b; opacity: .07; }
.vz-plusseite { fill: #2f6fe4; opacity: .07; }
.vz-punkt { stroke: #fff; stroke-width: 2; }
.vz-punkt-text { font: 800 14px var(--titel); text-anchor: middle; }
.vz-bogen { fill: none; stroke-width: 3; stroke-linecap: round; }
.vz-bogen-text { font: 800 14px var(--titel); text-anchor: middle; }
.vz-spiegel { stroke: var(--akzent); stroke-width: 2.5; stroke-dasharray: 6 5; }
.vz-frosch { transition: transform .45s cubic-bezier(.4,0,.2,1); }
.vz-tab { width: 100%; border-collapse: collapse; font: 800 1.35rem/1.2 var(--titel); font-variant-numeric: tabular-nums; }
.vz-tab td { padding: .22rem .3rem; border-bottom: 1px solid var(--rand); white-space: nowrap; }
.vz-tab td.r { text-align: right; } .vz-tab td.m { text-align: center; color: var(--leise); }
.vz-tab td.n { color: #c81e23; }
.vz-ein { width: 4.6rem; padding: .25rem .3rem; font: 700 1.2rem var(--schrift); text-align: center; border: 2px solid var(--rand); border-radius: 10px; background: var(--bg); color: var(--text); }
.vz-ein:focus { border-color: var(--akzent); outline: none; }
.vz-ein.richtig { border-color: var(--gut); background: var(--gut-sanft); }
.vz-ein.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); }
.vz-merk { border-left: 6px solid var(--akzent); background: var(--info-sanft); border-radius: 10px; padding: .6rem .8rem; margin: .7rem 0; }
.vz-merk b { color: var(--akzent); }
.vz-zeile { font: 800 1.6rem/1.6 var(--titel); display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; margin: .4rem 0; font-variant-numeric: tabular-nums; }
.vz-schritt { margin: .55rem 0 .25rem; font-weight: 700; }
.vz-schritt.fertig { color: var(--gut); }
.vz-ausdruck { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .3rem; font: 800 clamp(1.7rem, 4.6vw, 2.5rem)/1.3 var(--titel); margin: .8rem 0 1rem; font-variant-numeric: tabular-nums; }
.vz-op { color: var(--leise); padding: 0 .1rem; }
.vz-zahlknopf { font: inherit; color: var(--text); background: var(--flaeche); border: 3px solid var(--rand); border-radius: 14px; padding: .05rem .4rem; cursor: pointer; display: inline-flex; align-items: center; gap: .05rem; }
.vz-zahlknopf:hover { border-color: var(--akzent); }
.vz-zahlknopf.an { border-color: #e0262b; background: #fde4e4; color: #b3161b; }
.vz-zahlknopf[disabled] { cursor: default; }
.vz-zahlknopf .bruch { font-size: .8em; }
.vz-chips { display: flex; flex-wrap: wrap; gap: .8rem; align-items: center; justify-content: center; margin: .4rem 0 .6rem; }
.vz-paar { display: inline-flex; flex-direction: column; align-items: center; gap: .15rem; }
.vz-paar-oben { display: inline-flex; gap: .25rem; }
.vz-chip { width: 2.3rem; height: 2.3rem; border-radius: 50%; display: inline-grid; place-items: center; font: 800 1.6rem/1 var(--titel); color: #fff; background: #e0262b; }
.vz-chip.plus { background: #2f6fe4; }
.vz-paar-klammer { width: 5rem; height: .7rem; border: 3px solid #2f6fe4; border-top: 0; border-radius: 0 0 10px 10px; }
.vz-pfeil-text { font: 700 .95rem var(--schrift); color: var(--leise); }
.vz-vorz { display: flex; gap: .6rem; margin: .4rem 0; }
.vz-vorz .kn-gross { font-size: 2rem; min-width: 4.2rem; justify-content: center; }
.vz-stufe { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: .4rem; }
.vz-stufe .kn-gross { font-size: 1rem; }
.vz-stufe .kn-gross[aria-pressed="true"] { border-color: var(--akzent); background: var(--info-sanft); }
.vz-regel { display: grid; grid-template-columns: auto auto auto; gap: .2rem .9rem; font: 800 1.15rem/1.4 var(--titel); justify-content: start; margin: .3rem 0; }
.vz-regel .p { color: #2f6fe4; } .vz-regel .n { color: #c81e23; }
`;
function stil() {
  if (!document.getElementById('vz-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="vz-stil">${STIL}</style>`);
}

/* ---------- Zahlen ---------- */

const MINUS = '−';
/** Ganze Zahl mit echtem Minuszeichen. */
const zt = v => (v < 0 ? MINUS + Math.abs(v) : String(v));
/** Negative Zahl in Klammern (für Rechnungen). */
const zk = v => (v < 0 ? `(${zt(v)})` : String(v));

/** Bruch [z, n] gekürzt, n > 0. */
function rat(z, n = 1) {
  if (n < 0) { z = -z; n = -n; }
  const t = ggT(Math.abs(z), n) || 1;
  return [z / t, n / t];
}
const mal = (a, b) => rat(a[0] * b[0], a[1] * b[1]);
const durch = (a, b) => rat(a[0] * b[1], a[1] * b[0]);
const gleichR = (a, b) => a[0] * b[1] === b[0] * a[1];

/** Eingabe lesen: ganze Zahl, Kommazahl oder Bruch a/b (auch mit Minus). */
function liesRat(text) {
  const s = String(text ?? '').trim().replace(/[−–]/g, '-').replace(/\s+/g, '').replace('.', ',');
  if (!s) return null;
  let m = s.match(/^([+-]?)(\d+)\/(\d+)$/);
  if (m) return +m[3] === 0 ? null : rat((m[1] === '-' ? -1 : 1) * +m[2], +m[3]);
  m = s.match(/^([+-]?)(\d*)(?:,(\d+))?$/);
  if (!m || (m[2] === '' && !m[3])) return null;
  const nachk = m[3] || '';
  const n = 10 ** nachk.length;
  return rat((m[1] === '-' ? -1 : 1) * (+(m[2] || '0') * n + +(nachk || '0')), n);
}

/** Wie wird eine Zahl gezeigt? art: 'ganz' | 'dez' | 'bruch' */
function zahlHtml(r, art, klammern = true) {
  const neg = r[0] < 0, b = [Math.abs(r[0]), r[1]];
  let kern;
  if (art === 'bruch' && b[1] !== 1) kern = bruchHtml(b[0], b[1], 'klein');
  else if (art === 'dez' || (b[1] !== 1)) kern = dezText(b);
  else kern = String(b[0]);
  if (!neg) return kern;
  return klammern ? `(${MINUS}${kern})` : `${MINUS}${kern}`;
}
/** Betrag als Kommazahl, falls endlich, sonst als Bruch-Text. */
function dezText(b) {
  let n = b[1], k = 0;
  while (n % 2 === 0) n /= 2;
  while (n % 5 === 0) n /= 5;
  if (n !== 1) return `${b[0]}/${b[1]}`;
  let d = b[1]; while (10 ** k % d !== 0) k++;
  const wert = (b[0] * (10 ** k / d));
  const s = String(wert).padStart(k + 1, '0');
  return k ? `${s.slice(0, -k)},${s.slice(-k)}` : s;
}
/** Ergebnis schön: ganze Zahl, sonst Bruch (und wenn möglich Kommazahl). */
function ergebnisHtml(r) {
  const neg = r[0] < 0 ? MINUS : '';
  if (r[1] === 1) return neg + Math.abs(r[0]);
  const d = dezText([Math.abs(r[0]), r[1]]);
  return `${neg}${bruchHtml(Math.abs(r[0]), r[1], 'klein')}${d.includes(',') ? ` = ${neg}${d}` : ''}`;
}

/* ---------- Zahlenstrahl ---------- */

const R = 20;
const W = 880, L0 = 34, L1 = W - 34;
const X = v => L0 + ((v + R) * (L1 - L0)) / (2 * R);

function strahlGrund(y = 120) {
  let s = `<defs><marker id="vz-sp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="vz-spitze"/></marker></defs>
    <rect x="${L0}" y="${y - 70}" width="${X(0) - L0}" height="110" class="vz-minusseite"/>
    <rect x="${X(0)}" y="${y - 70}" width="${L1 - X(0)}" height="110" class="vz-plusseite"/>
    <line x1="${L0 - 18}" y1="${y}" x2="${L1 + 22}" y2="${y}" class="vz-linie" marker-end="url(#vz-sp)"/>`;
  for (let v = -R; v <= R; v++) {
    const f = v % 5 === 0;
    s += `<line x1="${X(v)}" y1="${y - (f ? 11 : 6)}" x2="${X(v)}" y2="${y + (f ? 11 : 6)}" class="vz-strich${f ? ' fuenf' : ''}"/>`;
    if (f) s += `<text x="${X(v)}" y="${y + 32}" class="vz-zahl${v === 0 ? ' null' : ''}">${zt(v)}</text>`;
  }
  return s;
}
const bogen = (a, b, y, h, farbe, text, oben = true) => {
  const x1 = X(a), x2 = X(b), mx = (x1 + x2) / 2, hy = oben ? y - h : y + h;
  return `<path d="M${x1} ${y - (oben ? 4 : -4)} Q${mx} ${hy} ${x2} ${y - (oben ? 4 : -4)}" class="vz-bogen" stroke="${farbe}"/>
    ${text ? `<text x="${mx}" y="${oben ? (y + hy) / 2 - 8 : (y + hy) / 2 + 18}" class="vz-bogen-text" fill="${farbe}">${text}</text>` : ''}`;
};
const punkt = (v, y, farbe, text) => `<circle cx="${X(v)}" cy="${y}" r="8" fill="${farbe}" class="vz-punkt"/>${text ? `<text x="${X(v)}" y="${y - 14}" class="vz-punkt-text" fill="${farbe}">${text}</text>` : ''}`;

/* =====================================================================
   Baustein
   ===================================================================== */

export function starteVorzeichen(root) {
  stil();
  let modus = 'muster';
  let bewertung = null, tipps = 0, eing = {};
  // Muster
  let mu;           // { fest, stelle: 'vorn'|'hinten', zeilen: [{a,b,w,gegeben}] , ok:Set }
  let musterNr = 0;
  // Zahlenstrahl
  let st;           // { a, b, phase: 0 bereit | 1 gesprungen | 2 gespiegelt, sprung: k }
  let strahlNr = 0;
  // Detektiv
  let stufe = 'ganz';
  let de;           // { zahlen:[{r,art}], ops:[], erg, phase:1|2|3, markiert:Set, vorz:null }

  const g = geruest(root, {
    etikett: 'Rationale Zahlen', titel: '',
    reiter: [
      { id: 'muster', titel: 'Muster entdecken', unter: 'Malreihen über die Null' },
      { id: 'strahl', titel: 'Am Zahlenstrahl', unter: 'Springen und spiegeln' },
      { id: 'detektiv', titel: 'Vorzeichen-Detektiv', unter: 'Erst das Vorzeichen, dann rechnen' },
    ],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-vz="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-vz="neu">＋ Neue Aufgabe</button>`,
  });

  root.addEventListener('input', e => {
    if (!e.target.matches('[data-vzein]')) return;
    const nurBetrag = e.target.dataset.vzein === 'betrag';
    e.target.value = e.target.value.replace(nurBetrag ? /[^\d,./]/g : /[^\d,./+\-−]/g, '').replace('-', MINUS);
    eing[e.target.id] = e.target.value;
  });
  const feld = (id, label, art = 'zahl') => `<input class="vz-ein" id="${id}" data-vzein="${art}" inputmode="text" autocomplete="off" aria-label="${label}" value="${eing[id] ?? ''}">`;

  /* ---------------- 1. Muster ---------------- */
  function neuMuster() {
    musterNr++;
    const varianten = [['vorn', 1], ['hinten', 1], ['vorn', -1], ['hinten', -1]];
    const [stelle, vz] = varianten[(musterNr - 1) % 4];
    const fest = vz * zufall(2, 6);
    const zeilen = [3, 2, 1, 0, -1, -2, -3].map((k, i) => {
      const a = stelle === 'vorn' ? fest : k, b = stelle === 'vorn' ? k : fest;
      return { a, b, w: a * b, gegeben: i < 3 };
    });
    mu = { fest, stelle, zeilen, ok: new Set() };
  }
  function linksMuster() {
    const y = 130;
    let s = strahlGrund(y);
    const z = mu.zeilen.filter((r, i) => r.gegeben || mu.ok.has(i));
    if (tipps >= 2 || bewertung?.ok) {
      for (let i = 0; i + 1 < mu.zeilen.length; i++) {
        const a = mu.zeilen[i].w, b = mu.zeilen[i + 1].w;
        if (a === b) continue;
        const d = b - a;
        s += bogen(a, b, y, 26 + (i % 2) * 14, d > 0 ? '#2f6fe4' : '#e0262b', (d > 0 ? '+' : MINUS) + Math.abs(d));
      }
    }
    z.forEach(r => { s += punkt(r.w, y, r.w < 0 ? '#e0262b' : r.w > 0 ? '#2f6fe4' : '#555', ''); });
    return `<div class="vz-huelle"><svg class="vz-svg" viewBox="0 0 ${W} 190" style="min-width:640px" role="img" aria-label="Zahlenstrahl mit den Ergebnissen">${s}</svg></div>
      <p class="leise">Jeder Punkt ist ein Ergebnis der Malreihe. ${tipps >= 2 || bewertung?.ok ? 'Die Bögen zeigen die Schritte von Zeile zu Zeile.' : ''}</p>`;
  }
  function rechtsMuster() {
    const zeilen = mu.zeilen.map((r, i) => {
      const erg = r.gegeben ? zt(r.w) : feld(`vz-m${i}`, `Ergebnis Zeile ${i + 1}`);
      return `<tr><td class="r${r.a < 0 ? ' n' : ''}">${zk(r.a)}</td><td class="m">·</td><td class="${r.b < 0 ? 'n' : ''}">${zk(r.b)}</td><td class="m">=</td><td>${erg}</td></tr>`;
    }).join('');
    let h = `<h2 class="bereich-titel">Setze die Malreihe fort</h2>
      <p>Die ersten drei Zeilen stehen schon da. Schau genau hin, wie sich die Ergebnisse verändern – und mach genauso weiter.</p>
      <table class="vz-tab"><tbody>${zeilen}</tbody></table>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-vz="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    if (bewertung?.ok) {
      const f = mu.fest, vorn = mu.stelle === 'vorn';
      const name = f < 0 ? 'Minus mal Minus ergibt Plus' : vorn ? 'Plus mal Minus ergibt Minus' : 'Minus mal Plus ergibt Minus';
      const bsp = vorn ? `${zk(f)} · (${MINUS}2)` : `(${MINUS}2) · ${zk(f)}`;
      h += `<div class="vz-merk"><b>${name}:</b> ${bsp} = ${zt(f * -2)}<br>
        Die Reihe läuft gleichmäßig weiter – deshalb muss das so sein.</div>`;
    }
    return h;
  }
  function pruefeMuster() {
    let fehlt = 0, falsch = 0;
    mu.zeilen.forEach((r, i) => {
      if (r.gegeben) return;
      const v = liesRat(eing[`vz-m${i}`]);
      if (!v) { fehlt++; mu.ok.delete(i); return; }
      if (gleichR(v, [r.w, 1])) mu.ok.add(i); else { falsch++; mu.ok.delete(i); }
    });
    const offen = mu.zeilen.filter((r, i) => !r.gegeben && !mu.ok.has(i));
    if (!offen.length) {
      bewertung = { ok: true, text: 'Alles richtig!' };
      g.sprich(`Von Zeile zu Zeile ändert sich das Ergebnis immer um ${Math.abs(mu.fest)}. Über die Null hinaus geht das einfach weiter.`, 'fertig');
    } else {
      const ersterFalsch = mu.zeilen.findIndex((r, i) => !r.gegeben && !mu.ok.has(i) && liesRat(eing[`vz-m${i}`]));
      let text = fehlt && !falsch ? 'Fülle alle leeren Felder aus.' : `${falsch === 1 ? 'Ein Ergebnis stimmt' : `${falsch} Ergebnisse stimmen`} noch nicht.`;
      if (ersterFalsch >= 0) {
        const r = mu.zeilen[ersterFalsch], v = liesRat(eing[`vz-m${ersterFalsch}`]);
        if (v && gleichR(v, [-r.w, 1]) && r.w !== 0) text += ' Schau beim roten Feld auf das Vorzeichen.';
      }
      bewertung = { ok: false, text };
    }
    zeichne();
    mu.zeilen.forEach((r, i) => {
      const f = root.querySelector(`#vz-m${i}`);
      if (f && eing[`vz-m${i}`]) f.classList.add(mu.ok.has(i) ? 'richtig' : 'falsch');
    });
  }
  function tippMuster() {
    tipps++;
    const [z0, z1] = mu.zeilen, d = z1.w - z0.w;
    if (tipps === 1) g.sprich(`Vergleiche die Ergebnisse der ersten Zeilen: ${zt(z0.w)}, ${zt(z1.w)}, ${zt(mu.zeilen[2].w)}. Um wie viel ändert sich das Ergebnis jedes Mal?`, 'tipp');
    else { g.sprich(`Das Ergebnis wird von Zeile zu Zeile um ${Math.abs(d)} ${d < 0 ? 'kleiner' : 'größer'}. Mach am Zahlenstrahl genauso weiter – auch über die Null hinaus.`, 'tipp'); zeichne(); }
  }

  /* ---------------- 2. Zahlenstrahl ---------------- */
  function neuStrahl() {
    strahlNr++;
    const kombi = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const [va, vb] = kombi[(strahlNr - 1 + (strahlNr > 4 ? zufall(0, 3) : 0)) % 4];
    const a = va * zufall(2, 4), b = vb * zufall(2, 5);
    st = { a, b, phase: 0, sprung: 0, laeuft: false };
  }
  function linksStrahl() {
    const y = 150, { a, b } = st;
    const n = Math.abs(a);
    let s = strahlGrund(y);
    for (let k = 0; k < st.sprung; k++) s += bogen(k * b, (k + 1) * b, y, 46, '#2fae58', k === 0 ? (b > 0 ? '+' : MINUS) + Math.abs(b) : '');
    const ziel = st.sprung * b;
    if (st.phase === 2) {
      s += `<line x1="${X(0)}" y1="${y - 105}" x2="${X(0)}" y2="${y + 40}" class="vz-spiegel"/>`;
      s += bogen(n * b, -n * b, y, 105, '#7a3cc2', 'spiegeln');
      s += punkt(n * b, y, '#9aa5bf', '');
    }
    const pos = st.phase === 2 ? a * b : ziel;
    s += `<g class="vz-frosch" data-frosch style="transform: translateX(${X(pos)}px)">
      <ellipse cx="0" cy="${y - 13}" rx="14" ry="10" fill="#2fae58" stroke="#fff" stroke-width="2"/>
      <circle cx="-6" cy="${y - 23}" r="4" fill="#fff"/><circle cx="6" cy="${y - 23}" r="4" fill="#fff"/>
      <circle cx="-6" cy="${y - 23}" r="1.8" fill="#123"/><circle cx="6" cy="${y - 23}" r="1.8" fill="#123"/></g>`;
    if (bewertung?.ok) s += `<text x="${X(a * b)}" y="${y + 58}" class="vz-punkt-text" fill="var(--gut)" style="font-size:20px">${zt(a * b)}</text>`;
    return `<div class="vz-huelle"><svg class="vz-svg" viewBox="0 0 ${W} 220" style="min-width:640px" role="img" aria-label="Zahlenstrahl mit Frosch">${s}</svg></div>
      <div class="vz-merk" style="font-size:1rem"><b>So geht's:</b> Bei ${zk(a)} · ${zk(b)} springt der Frosch <b>${n}-mal</b> um <b>${Math.abs(b)}</b> nach <b>${b > 0 ? 'rechts' : 'links'}</b>${b > 0 ? '' : ' (wegen des Minus vor ' + Math.abs(b) + ')'}.
      ${a < 0 ? `<br>Vor der ${n} steht ein Minus: Danach wird das Ergebnis an der Null <b>gespiegelt</b> – man nimmt die Gegenzahl.` : ''}</div>`;
  }
  function rechtsStrahl() {
    const { a, b } = st;
    let h = `<h2 class="bereich-titel">Rechne mit dem Frosch</h2><p class="rr-gross">${zk(a)} · ${zk(b)}</p>`;
    h += `<p class="vz-schritt${st.phase >= 1 ? ' fertig' : ''}">1. Springen${st.phase >= 1 ? ' ✓' : ''}</p>`;
    if (st.phase === 0) h += `<p class="leise">Tippe für jeden Sprung einmal.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-vz="springen" ${st.laeuft ? 'disabled' : ''}>🐸 Springen (${st.sprung}/${Math.abs(a)})</button></div>`;
    if (a < 0) {
      h += `<p class="vz-schritt${st.phase >= 2 ? ' fertig' : ''}">2. An der Null spiegeln${st.phase >= 2 ? ' ✓' : ''}</p>`;
      if (st.phase === 1) h += `<p class="leise">Der Frosch steht bei ${zt(Math.abs(a) * b)}. Wegen des Minus vor ${Math.abs(a)} wird gespiegelt.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-vz="spiegeln">↔ Spiegeln</button></div>`;
    }
    const fertig = a < 0 ? st.phase >= 2 : st.phase >= 1;
    if (fertig) {
      h += `<p class="vz-zeile">${zk(a)} · ${zk(b)} = ${feld('vz-s', 'Ergebnis')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-vz="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
      if (bewertung?.ok) {
        const t = a > 0 && b > 0 ? 'Plus mal Plus ergibt Plus.' : a > 0 ? 'Plus mal Minus ergibt Minus.' : b > 0 ? 'Minus mal Plus ergibt Minus.' : 'Minus mal Minus ergibt Plus: zweimal „umdrehen“ – man landet wieder rechts.';
        h += `<div class="vz-merk"><b>${t}</b></div>`;
      }
    }
    return h;
  }
  /** Ein Sprung pro Tipp – wie beim Zahlenstrahl mit Schritten. */
  async function springen() {
    if (st.sprung >= Math.abs(st.a)) return;
    st.laeuft = true;
    const x0 = X(st.sprung * st.b);
    st.sprung++; zeichne();
    const x1 = X(st.sprung * st.b), fr = root.querySelector('[data-frosch]');
    if (fr && bewegung()) {
      fr.style.transition = 'none';
      await fr.animate([{ transform: `translate(${x0}px, 0px)` }, { transform: `translate(${(x0 + x1) / 2}px, -46px)` }, { transform: `translate(${x1}px, 0px)` }],
        { duration: 420, easing: 'ease-in-out' }).finished.catch(() => {});
    }
    st.laeuft = false;
    if (st.sprung < Math.abs(st.a)) {
      zeichne();
      g.sprich(`${st.sprung}. Sprung: Der Frosch ist bei ${zt(st.sprung * st.b)}. Noch ${Math.abs(st.a) - st.sprung}-mal.`);
      root.querySelector('[data-vz="springen"]')?.focus({ preventScroll: true });
      return;
    }
    st.phase = 1; zeichne();
    if (st.a > 0) { g.sprich(`Der Frosch landet bei ${zt(st.a * st.b)}. Trage das Ergebnis ein.`); fokus('#vz-s'); }
    else g.sprich('Jetzt kommt das Minus vor der ersten Zahl: Spiegle an der Null.');
  }
  async function spiegeln() {
    st.phase = 2; zeichne();
    g.sprich(`Spiegeln heißt: die Gegenzahl nehmen. Aus ${zt(Math.abs(st.a) * st.b)} wird ${st.a * st.b === 0 ? 0 : '…'} – trage es ein.`);
    fokus('#vz-s');
  }
  function pruefeStrahl() {
    const v = liesRat(eing['vz-s']), soll = st.a * st.b;
    if (!v) bewertung = { ok: false, text: 'Trage das Ergebnis ein.' };
    else if (gleichR(v, [soll, 1])) { bewertung = { ok: true, text: 'Richtig!' }; g.sprich(`${zk(st.a)} · ${zk(st.b)} = ${zt(soll)}`, 'fertig'); }
    else if (gleichR(v, [-soll, 1])) bewertung = { ok: false, text: 'Die Zahl stimmt, aber das Vorzeichen nicht. Wo steht der Frosch – links oder rechts von der Null?' };
    else bewertung = { ok: false, text: 'Noch nicht. Lies am Zahlenstrahl ab, wo der Frosch steht.' };
    zeichne();
  }
  function tippStrahl() {
    tipps++;
    const { a, b } = st;
    if (st.phase === 0) g.sprich(`Tippe ${Math.abs(a)}-mal auf „Springen“. Jeder Sprung ist ${Math.abs(b)} lang – nach ${b > 0 ? 'rechts' : 'links'}.`, 'tipp');
    else if (st.phase === 1 && a < 0) g.sprich(`Spiegeln an der Null: ${zt(Math.abs(a) * b)} wird zu ${zt(-Math.abs(a) * b)}. Tippe auf „Spiegeln“.`, 'tipp');
    else g.sprich(`Der Frosch steht ${Math.abs(a * b)} Schritte ${a * b > 0 ? 'rechts' : 'links'} von der Null.`, 'tipp');
  }

  /* ---------------- 3. Vorzeichen-Detektiv ---------------- */
  function neuDetektiv() {
    let zahlen, ops;
    if (stufe === 'ganz') {
      const typ = wahl(['mal2', 'mal3', 'mal4', 'durch', 'gemischt', 'mal3']);
      const zz = () => wahl([-1, 1]) * zufall(2, 6);
      if (typ === 'durch') {
        let q, d; do { q = wahl([-1, 1]) * zufall(2, 9); d = wahl([-1, 1]) * zufall(2, 9); } while (q > 0 && d > 0);
        zahlen = [[q * d, 1], [d, 1]]; ops = [':'];
      } else if (typ === 'gemischt') {
        let a, b, c;
        do { a = wahl([-1, 1]) * zufall(2, 6); b = wahl([-1, 1]) * zufall(2, 6); c = wahl([-1, 1]) * wahl([2, 3, 4, 6].filter(t => (a * b) % t === 0).concat([Math.abs(a)])); } while (a > 0 && b > 0 && c > 0);
        zahlen = [[a, 1], [b, 1], [c, 1]]; ops = ['·', ':'];
      } else {
        const n = { mal2: 2, mal3: 3, mal4: 4 }[typ];
        do { zahlen = Array.from({ length: n }, () => [zz(), 1]); } while (zahlen.every(z => z[0] > 0) || Math.abs(zahlen.reduce((p, z) => p * z[0], 1)) > 150);
        ops = Array(n - 1).fill('·');
      }
      zahlen = zahlen.map(r => ({ r: rat(r[0], r[1]), art: 'ganz' }));
    } else {
      const typ = wahl(['bruchmal', 'bruchdurch', 'dez', 'dez3', 'gemischt']);
      const vz = () => wahl([-1, 1]);
      const br = () => { const n = wahl([2, 3, 4, 5, 6, 8]); let z; do { z = zufall(1, n + 3); } while (z % n === 0); return rat(vz() * z, n); };
      if (typ === 'bruchmal') { zahlen = [{ r: br(), art: 'bruch' }, { r: br(), art: 'bruch' }]; ops = ['·']; }
      else if (typ === 'bruchdurch') { zahlen = [{ r: br(), art: 'bruch' }, { r: br(), art: 'bruch' }]; ops = [':']; }
      else if (typ === 'dez') {
        const d = rat(vz() * wahl([5, 15, 25, 2, 12, 4, 35]), 10);
        zahlen = [{ r: d, art: 'dez' }, { r: rat(vz() * zufall(2, 8)), art: 'ganz' }]; ops = [wahl(['·', '·', ':'])];
        if (ops[0] === ':') zahlen = [{ r: mal(d, zahlen[1].r), art: 'dez' }, zahlen[1]];
      } else if (typ === 'dez3') {
        const [dz, dn] = wahl([[5, 10], [25, 10], [25, 100], [2, 10], [15, 10], [75, 100]]);
        zahlen = [{ r: rat(vz() * dz, dn), art: 'dez' }, { r: rat(vz() * zufall(2, 6)), art: 'ganz' }, { r: rat(vz() * zufall(2, 5)), art: 'ganz' }];
        ops = ['·', '·'];
      } else {
        zahlen = [{ r: br(), art: 'bruch' }, { r: rat(vz() * zufall(2, 6)), art: 'ganz' }, { r: br(), art: 'bruch' }]; ops = ['·', ':'];
      }
      if (zahlen.every(z => z.r[0] > 0)) zahlen[zufall(0, zahlen.length - 1)].r[0] *= -1;
    }
    let erg = zahlen[0].r;
    ops.forEach((o, i) => { erg = o === '·' ? mal(erg, zahlen[i + 1].r) : durch(erg, zahlen[i + 1].r); });
    de = { zahlen, ops, erg, phase: 1, markiert: new Set(), vorz: null, fehlerVorz: false };
  }
  const negAnzahl = () => de.zahlen.filter(z => z.r[0] < 0).length;
  function ausdruckHtml() {
    return de.zahlen.map((z, i) => {
      const knopf = `<button type="button" class="vz-zahlknopf${de.markiert.has(i) ? ' an' : ''}" data-zahlnr="${i}" ${de.phase !== 1 ? 'disabled' : ''} aria-pressed="${de.markiert.has(i)}">${zahlHtml(z.r, z.art)}</button>`;
      return knopf + (i < de.ops.length ? `<span class="vz-op">${de.ops[i]}</span>` : '');
    }).join('');
  }
  function chipsHtml() {
    const n = negAnzahl();
    if (!n) return '<p class="leise" style="text-align:center">Keine negative Zahl – das Ergebnis ist positiv.</p>';
    let s = '';
    for (let i = 0; i + 1 < n; i += 2) s += `<span class="vz-paar"><span class="vz-paar-oben"><span class="vz-chip">−</span><span class="vz-chip">−</span></span><span class="vz-paar-klammer"></span><span class="vz-chip plus">+</span></span>`;
    if (n % 2) s += `<span class="vz-paar"><span class="vz-chip">−</span><span class="vz-pfeil-text">bleibt übrig</span></span>`;
    return `<div class="vz-chips">${s}</div><p class="vz-pfeil-text" style="text-align:center">Je zwei Minus ergeben ein Plus. ${n % 2 ? 'Ein Minus bleibt übrig.' : 'Kein Minus bleibt übrig.'}</p>`;
  }
  function linksDetektiv() {
    let h = `<div class="vz-stufe" role="group" aria-label="Zahlen">
        <button type="button" class="kn-gross" data-stufe="ganz" aria-pressed="${stufe === 'ganz'}">Ganze Zahlen</button>
        <button type="button" class="kn-gross" data-stufe="bruch" aria-pressed="${stufe === 'bruch'}">Brüche und Kommazahlen</button></div>
      <div class="vz-ausdruck">${ausdruckHtml()}</div>`;
    if (de.phase >= 2) h += chipsHtml();
    if (bewertung?.ok && de.phase === 4) h += `<p class="fl-formel" style="text-align:center">${de.zahlen.map((z, i) => zahlHtml(z.r, z.art) + (i < de.ops.length ? ` ${de.ops[i]} ` : '')).join('')} = ${ergebnisHtml(de.erg)}</p>`;
    return h;
  }
  function rechtsDetektiv() {
    const n = negAnzahl();
    let h = `<h2 class="bereich-titel">Erst das Vorzeichen, dann rechnen</h2>`;
    h += `<p class="vz-schritt${de.phase > 1 ? ' fertig' : ''}">1. Tippe alle negativen Zahlen an.${de.phase > 1 ? ` ✓ (${n})` : ''}</p>`;
    if (de.phase === 1) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-vz="gezaehlt">✓ Fertig</button></div>${antwortHtml(bewertung)}`;
    if (de.phase >= 2) {
      h += `<p class="vz-schritt${de.phase > 2 ? ' fertig' : ''}">2. Welches Vorzeichen hat das Ergebnis?${de.phase > 2 ? ` ✓ ${de.erg[0] < 0 ? MINUS : '+'}` : ''}</p>`;
      if (de.phase === 2) h += `<div class="vz-vorz"><button type="button" class="kn-gross" data-vorz="+" aria-label="Plus">+</button><button type="button" class="kn-gross" data-vorz="-" aria-label="Minus">${MINUS}</button></div>${antwortHtml(bewertung)}`;
    }
    if (de.phase >= 3) {
      h += `<p class="vz-schritt${de.phase > 3 ? ' fertig' : ''}">3. Rechne ohne Vorzeichen (mit den Beträgen).</p>
        <p class="leise">${stufe === 'bruch' ? 'Du kannst als Bruch (z. B. 3/4) oder als Kommazahl eingeben.' : ''}</p>
        <p class="vz-zeile">= <span style="color:${de.erg[0] < 0 ? '#c81e23' : '#2f6fe4'}">${de.erg[0] < 0 ? MINUS : '+'}</span> ${feld('vz-d', 'Betrag des Ergebnisses', 'betrag')}</p>
        ${de.phase === 3 ? `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-vz="pruefen">✓ Prüfen</button></div>` : ''}${de.phase >= 3 ? antwortHtml(bewertung) : ''}`;
    }
    return h;
  }
  function gezaehlt() {
    const soll = new Set(de.zahlen.map((z, i) => (z.r[0] < 0 ? i : -1)).filter(i => i >= 0));
    const zuviel = [...de.markiert].filter(i => !soll.has(i)).length, fehlt = [...soll].filter(i => !de.markiert.has(i)).length;
    if (!zuviel && !fehlt) { de.phase = 2; bewertung = null; g.sprich(`${soll.size} negative ${soll.size === 1 ? 'Zahl' : 'Zahlen'}. Je zwei Minus heben sich auf.`); }
    else bewertung = { ok: false, text: zuviel ? 'Du hast eine positive Zahl angetippt. Negativ sind nur Zahlen mit Minus.' : `Es ${fehlt === 1 ? 'fehlt noch eine negative Zahl' : `fehlen noch ${fehlt} negative Zahlen`}.` };
    zeichne();
  }
  function vorzeichen(v) {
    const neg = de.erg[0] < 0;
    if ((v === '-') === neg) { de.phase = 3; bewertung = null; zeichne(); fokus('#vz-d'); g.sprich(neg ? 'Ungerade Anzahl Minus: Das Ergebnis ist negativ.' : 'Gerade Anzahl Minus: Das Ergebnis ist positiv.'); }
    else { bewertung = { ok: false, text: `Zähle die Minuszeichen: ${negAnzahl()} – ist das eine gerade oder eine ungerade Zahl?` }; zeichne(); }
  }
  function pruefeDetektiv() {
    const v = liesRat(eing['vz-d']);
    const soll = [Math.abs(de.erg[0]), de.erg[1]];
    if (!v) bewertung = { ok: false, text: 'Trage den Betrag ein.' };
    else if (gleichR(v, soll)) { bewertung = { ok: true, text: 'Richtig!' }; de.phase = 4; g.sprich('Vorzeichen bestimmt, Beträge gerechnet – fertig!', 'fertig'); }
    else {
      let text = 'Noch nicht.';
      if (de.ops.includes(':') && stufe === 'bruch') text += ' Teilen durch einen Bruch heißt: mit dem Kehrwert malnehmen.';
      else if (stufe === 'bruch') text += ' Brüche: Zähler mal Zähler, Nenner mal Nenner.';
      bewertung = { ok: false, text };
    }
    zeichne();
  }
  function tippDetektiv() {
    tipps++;
    if (de.phase === 1) g.sprich('Negative Zahlen erkennst du am Minuszeichen. Tippe jede davon an.', 'tipp');
    else if (de.phase === 2) g.sprich(`Es gibt ${negAnzahl()} negative Zahlen. Ist die Anzahl gerade, ist das Ergebnis positiv. Ist sie ungerade, ist es negativ.`, 'tipp');
    else {
      const b = de.zahlen.map((z, i) => zahlHtml([Math.abs(z.r[0]), z.r[1]], z.art) + (i < de.ops.length ? ` ${de.ops[i]} ` : '')).join('');
      g.sprich(`Rechne jetzt ohne Minus: ${b}${de.ops.includes(':') && stufe === 'bruch' ? ' – geteilt durch einen Bruch: mal den Kehrwert.' : ''}`, 'tipp');
    }
  }

  /* ---------------- gemeinsam ---------------- */
  function fokus(sel) { requestAnimationFrame(() => root.querySelector(sel)?.focus({ preventScroll: true })); }
  function neu() {
    bewertung = null; tipps = 0; eing = {};
    if (modus === 'muster') neuMuster();
    if (modus === 'strahl') neuStrahl();
    if (modus === 'detektiv') neuDetektiv();
  }
  function zeichne() {
    g.reiter(modus);
    g.titel({ muster: 'Malreihen über die Null', strahl: 'Multiplizieren am Zahlenstrahl', detektiv: 'Vorzeichen-Detektiv' }[modus]);
    if (modus === 'muster') { g.links.innerHTML = linksMuster(); g.rechts.innerHTML = rechtsMuster(); }
    if (modus === 'strahl') { g.links.innerHTML = linksStrahl(); g.rechts.innerHTML = rechtsStrahl(); }
    if (modus === 'detektiv') { g.links.innerHTML = linksDetektiv(); g.rechts.innerHTML = rechtsDetektiv(); }
    if (bewertung?.ok) g.rechts.setAttribute('data-fertig', ''); else g.rechts.removeAttribute('data-fertig');
    mitteZeigen();
  }
  /** Schmale Bildschirme: Der Zahlenstrahl ist breiter als der Platz – zum Frosch bzw. zur Null scrollen. */
  function mitteZeigen() {
    const h = root.querySelector('.vz-huelle');
    if (!h || h.scrollWidth <= h.clientWidth + 2) return;
    let wert = 0;
    if (modus === 'strahl' && st) wert = st.phase === 2 ? st.a * st.b : st.sprung * st.b / 2;
    h.scrollLeft = (X(wert) / W) * h.scrollWidth - h.clientWidth / 2;
  }
  function startText() {
    g.sprich({
      muster: 'Eine Malreihe läuft über die Null. Wie geht sie weiter?',
      strahl: 'Malnehmen heißt: mehrmals gleich weit springen. Ein Minus vor der ersten Zahl heißt: am Ende an der Null spiegeln.',
      detektiv: 'Bestimme zuerst das Vorzeichen: Zähle die negativen Zahlen. Danach rechnest du ohne Vorzeichen.',
    }[modus]);
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const sf = e.target.closest('[data-stufe]');
    if (sf) { stufe = sf.dataset.stufe; neu(); zeichne(); startText(); return; }
    const zn = e.target.closest('[data-zahlnr]');
    if (zn && modus === 'detektiv' && de.phase === 1) {
      const i = Number(zn.dataset.zahlnr);
      de.markiert.has(i) ? de.markiert.delete(i) : de.markiert.add(i);
      bewertung = null; zeichne(); return;
    }
    const vz = e.target.closest('[data-vorz]');
    if (vz && modus === 'detektiv' && de.phase === 2) { vorzeichen(vz.dataset.vorz); return; }
    const b = e.target.closest('[data-vz]');
    if (!b) return;
    const was = b.dataset.vz;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'tipp') ({ muster: tippMuster, strahl: tippStrahl, detektiv: tippDetektiv })[modus]();
    if (was === 'springen' && !st.laeuft) springen();
    if (was === 'spiegeln') spiegeln();
    if (was === 'gezaehlt') gezaehlt();
    if (was === 'pruefen') ({ muster: pruefeMuster, strahl: pruefeStrahl, detektiv: pruefeDetektiv })[modus]();
  });
  // Enter im Detektiv-Schritt 1: „Fertig“
  root.addEventListener('keydown', e => {
    if (e.key === 'Enter' && modus === 'detektiv' && de.phase === 1 && !e.target.matches('button')) { e.preventDefault(); gezaehlt(); }
  });

  neu(); zeichne(); startText();
}
