/* Mathematik: Wahrscheinlichkeit (Klasse 7/8).
   „Glücksrad“: Das Rad wird 1-, 10-, 100- oder 1000-mal gedreht. Die relative Häufigkeit einer Farbe wird als Kurve
     gezeichnet und pendelt sich ein (empirisches Gesetz der großen Zahlen). Dann: Wahrscheinlichkeit als Bruch angeben
     (Felder zählen, Laplace) – die Kurve bekommt die waagerechte Linie dazu.
   „Baumdiagramm“: Urne mit roten und blauen Kugeln, zweimal ziehen (mit oder ohne Zurücklegen).
     Erst die Zweige beschriften, dann die Pfadwahrscheinlichkeit (Pfadregel: entlang des Pfades malnehmen). */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, bruchFeld, zahlenMerken, ggT, bewegung } from './geruest.js';

const FARBEN = { rot: '#e0262b', blau: '#2f6fe4', gelb: '#f2b72e', gruen: '#2fae58' };
const NAMEN = { rot: 'Rot', blau: 'Blau', gelb: 'Gelb', gruen: 'Grün' };
const kuerze = (z, n) => { const t = ggT(z, n) || 1; return [z / t, n / t]; };
const gleich = (a, b, c, d) => b > 0 && d > 0 && a * d === b * c;

export function starteZufall(root) {
  let modus = 'rad', bewertung = null, eing = {};
  let rd;   // { felder:[farbe], ziel, n, treffer, verlauf:[[n, rel]], drehung, letzte }
  let bm;   // { r, b, zurueck, frage:[f1,f2], schritt }

  const g = geruest(root, {
    etikett: 'Wahrscheinlichkeit', titel: '',
    reiter: [{ id: 'rad', titel: 'Glücksrad', unter: 'oft drehen' }, { id: 'baum', titel: 'Baumdiagramm', unter: 'zweimal ziehen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-zf="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-zf="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; Object.keys(eing).forEach(k => (eing[k] = ''));
    if (modus === 'rad') {
      const n = wahl([4, 6, 8, 10]);
      let felder;
      do { felder = Array.from({ length: n }, () => wahl(['rot', 'blau', 'gelb', 'gruen'].slice(0, n <= 4 ? 3 : 4))); } while (new Set(felder).size < 2);
      const ziel = wahl([...new Set(felder)]);
      rd = { felder, ziel, n: 0, treffer: 0, zaehl: {}, verlauf: [], drehung: 0, letzte: null };
    } else {
      let r, b; do { r = zufall(1, 5); b = zufall(1, 5); } while (r + b > 8 || r + b < 3);
      const zurueck = Math.random() < 0.5;
      let frage; do { frage = wahl([['r', 'r'], ['b', 'b'], ['r', 'b'], ['b', 'r']]); } while (!zurueck && frage[0] === frage[1] && (frage[0] === 'r' ? r : b) < 2);
      bm = { r, b, zurueck, frage, schritt: 1 };
    }
  }

  /* ---------------- Glücksrad ---------------- */
  function drehe(k) {
    let letzter = 0;
    for (let i = 0; i < k; i++) {
      const f = Math.floor(Math.random() * rd.felder.length);
      letzter = f;
      const farbe = rd.felder[f];
      rd.zaehl[farbe] = (rd.zaehl[farbe] || 0) + 1;
      rd.n++; if (farbe === rd.ziel) rd.treffer++;
      // Verlauf: anfangs jeder Wurf, später seltener
      if (rd.n <= 50 || rd.n % Math.ceil(rd.n / 60) === 0) rd.verlauf.push([rd.n, rd.treffer / rd.n]);
    }
    rd.letzte = letzter;
    const winkel = 360 / rd.felder.length;
    rd.drehung += 360 * (k === 1 ? 3 : 1) + ((360 - (letzter + 0.5) * winkel - (rd.drehung % 360)) % 360 + 360) % 360;
  }
  function radSvg() {
    const n = rd.felder.length, R = 110, M = 125, w = (2 * Math.PI) / n;
    let s = '';
    rd.felder.forEach((f, i) => {
      const a0 = -Math.PI / 2 + i * w, a1 = a0 + w;
      s += `<path d="M${M} ${M} L${M + R * Math.cos(a0)} ${M + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${M + R * Math.cos(a1)} ${M + R * Math.sin(a1)} Z" fill="${FARBEN[f]}" stroke="#fff" stroke-width="3"/>`;
    });
    return `<svg class="zf-rad" viewBox="0 0 250 270" role="img" aria-label="Glücksrad mit ${n} gleich großen Feldern">
      <g class="zf-scheibe" style="transform: rotate(${rd.drehung}deg); transform-origin: ${M}px ${M}px">${s}</g>
      <circle cx="${M}" cy="${M}" r="12" fill="#fff" stroke="#1b2340" stroke-width="3"/>
      <path d="M${M - 12} 4 L${M + 12} 4 L${M} 30 Z" class="zf-zeiger"/></svg>`;
  }
  function kurveSvg() {
    const W = 460, H = 220, L = 44, B = 190, maxN = Math.max(10, rd.n);
    const X = n => L + (Math.log10(n) / Math.log10(maxN)) * (W - L - 14), Y = v => B - v * (B - 16);
    let s = `<line x1="${L}" y1="${B}" x2="${W - 8}" y2="${B}" class="zo-achse"/><line x1="${L}" y1="${B}" x2="${L}" y2="10" class="zo-achse"/>`;
    [0, 0.25, 0.5, 0.75, 1].forEach(v => { s += `<line x1="${L - 5}" y1="${Y(v)}" x2="${W - 8}" y2="${Y(v)}" class="zf-gitter"/><text x="${L - 8}" y="${Y(v) + 4}" class="zo-zahl" style="text-anchor:end">${String(v).replace('.', ',')}</text>`; });
    [1, 10, 100, 1000, 10000].filter(n => n <= maxN).forEach(n => { s += `<text x="${X(n)}" y="${B + 18}" class="zo-zahl"${X(n) > W - 30 ? ' style="text-anchor:end"' : ''}>${n}</text>`; });
    s += `<text x="${W - 8}" y="${B + 34}" class="zo-zahl" style="text-anchor:end">Anzahl Drehungen</text>`;
    if (bewertung?.ok) { const p = rd.felder.filter(f => f === rd.ziel).length / rd.felder.length; s += `<line x1="${L}" y1="${Y(p)}" x2="${W - 8}" y2="${Y(p)}" class="zf-laplace"/>`; }
    if (rd.verlauf.length) s += `<polyline points="${rd.verlauf.map(([n, v]) => `${X(n)},${Y(v)}`).join(' ')}" class="zf-kurve" style="stroke:${FARBEN[rd.ziel]}"/>`;
    return `<svg class="zf-kurve-svg" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Relative Häufigkeit">${s}</svg>`;
  }
  function linksRad() {
    const farben = [...new Set(rd.felder)];
    return `<div class="zf-oben">${radSvg()}
      <div class="zf-knoepfe"><p><b>Drehen:</b></p>${[1, 10, 100, 1000].map(k => `<button type="button" class="kn-gross" data-dreh="${k}">${k}×</button>`).join('')}
        <table class="zf-tab"><tr><th>Farbe</th><th>Anzahl</th></tr>${farben.map(f => `<tr><td><span class="zf-punkt" style="background:${FARBEN[f]}"></span>${NAMEN[f]}</td><td>${rd.zaehl[f] || 0}</td></tr>`).join('')}<tr><th>gesamt</th><th>${rd.n}</th></tr></table></div></div>
      <p class="zf-rel">Relative Häufigkeit von <b style="color:${FARBEN[rd.ziel]}">${NAMEN[rd.ziel]}</b>: ${rd.n ? `${rd.treffer} von ${rd.n} = ${String(Math.round((rd.treffer / rd.n) * 1000) / 1000).replace('.', ',')}` : '–'}</p>
      ${kurveSvg()}`;
  }
  function rechtsRad() {
    return `<h2 class="bereich-titel">Wie wahrscheinlich ist ${NAMEN[rd.ziel]}?</h2>
      <p>Drehe das Rad oft und beobachte die Kurve. Dann schau dir das Rad genau an.</p>
      <p class="bk-gross">P(${NAMEN[rd.ziel]}) = ${bruchFeld('zf-z', 'zf-n', eing)}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zf="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${bewertung?.ok ? '<p class="leise">Die waagerechte Linie zeigt die Wahrscheinlichkeit. Je öfter man dreht, desto näher kommt die Kurve an die Linie.</p>' : ''}`;
  }
  function pruefeRad() {
    const z = Number(eing['zf-z']), n = Number(eing['zf-n']);
    const t = rd.felder.filter(f => f === rd.ziel).length, m = rd.felder.length;
    if (!eing['zf-z'] || !eing['zf-n'] || !n) bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' };
    else if (rd.n < 100) bewertung = { ok: false, text: 'Drehe zuerst mindestens 100-mal und schau, wo die Kurve hinläuft.' };
    else if (gleich(z, n, t, m)) {
      const [kz, kn] = kuerze(t, m);
      bewertung = { ok: true, text: `Richtig: ${t} von ${m} gleich großen Feldern sind ${NAMEN[rd.ziel]} – P = ${t}/${m}${kn !== m ? ` = ${kz}/${kn}` : ''}.` };
      g.sprich('Bei gleich großen Feldern gilt: günstige Felder durch alle Felder.', 'fertig');
    } else bewertung = { ok: false, text: `Zähle die Felder: Wie viele sind ${NAMEN[rd.ziel]}, wie viele gibt es insgesamt?` };
    zeichne();
  }

  /* ---------------- Baumdiagramm ---------------- */
  const P1 = f => (f === 'r' ? [bm.r, bm.r + bm.b] : [bm.b, bm.r + bm.b]);
  const P2 = (f1, f2) => {
    const r = bm.r - (!bm.zurueck && f1 === 'r' ? 1 : 0), b = bm.b - (!bm.zurueck && f1 === 'b' ? 1 : 0);
    return [f2 === 'r' ? r : b, r + b];
  };
  const PFADE = [['r', 'r'], ['r', 'b'], ['b', 'r'], ['b', 'b']];
  const fname = f => (f === 'r' ? 'rot' : 'blau');
  function urneSvg(r, b, x0) {
    let s = `<path d="M${x0} 10 L${x0 + 8} 90 Q${x0 + 50} 104 ${x0 + 92} 90 L${x0 + 100} 10" class="zf-urne"/>`;
    const kugeln = [...Array(r).fill('rot'), ...Array(b).fill('blau')];
    kugeln.forEach((f, i) => { s += `<circle cx="${x0 + 22 + (i % 4) * 19}" cy="${78 - Math.floor(i / 4) * 19}" r="8.5" fill="${FARBEN[f]}" stroke="#fff" stroke-width="1.5"/>`; });
    return s;
  }
  function baumSvg() {
    const W = 560, H = 330, x0 = 40, x1 = 250, x2 = 470;
    const y1 = { r: 95, b: 245 }, y2 = { rr: 40, rb: 140, br: 190, bb: 290 };
    const zeige = bm.schritt >= 2;   // Zweige ausgefüllt?
    let s = '';
    const ast = (xa, ya, xb, yb, id, wert, hervor) => {
      const mx = (xa + xb) / 2, my = (ya + yb) / 2;
      return `<line x1="${xa}" y1="${ya}" x2="${xb}" y2="${yb}" class="zf-ast${hervor ? ' an' : ''}"/>
        <foreignObject x="${mx - 34}" y="${my - 36}" width="68" height="62"><div class="zf-astfeld">${zeige ? bruchHtml(wert[0], wert[1], 'klein') : bruchFeld(id + '-z', id + '-n', eing)}</div></foreignObject>`;
    };
    const hervor = bm.schritt >= 2 ? bm.frage : null;
    s += ast(x0, 165, x1, y1.r, 'zf-r', P1('r'), hervor && hervor[0] === 'r') + ast(x0, 165, x1, y1.b, 'zf-b', P1('b'), hervor && hervor[0] === 'b');
    for (const [f1, f2] of PFADE) s += ast(x1 + 20, y1[f1], x2, y2[f1 + f2], `zf-${f1}${f2}`, P2(f1, f2), hervor && hervor[0] === f1 && hervor[1] === f2);
    s += `<circle cx="${x0}" cy="165" r="7" class="zf-knoten"/>`;
    for (const f1 of ['r', 'b']) s += `<circle cx="${x1 + 10}" cy="${y1[f1]}" r="13" fill="${FARBEN[fname(f1)]}"/>`;
    for (const [f1, f2] of PFADE) s += `<circle cx="${x2 + 12}" cy="${y2[f1 + f2]}" r="11" fill="${FARBEN[fname(f1)]}"/><circle cx="${x2 + 38}" cy="${y2[f1 + f2]}" r="11" fill="${FARBEN[fname(f2)]}"/>`;
    return `<svg class="zf-baum" viewBox="0 0 ${W} ${H}" role="img" aria-label="Baumdiagramm">${s}</svg>`;
  }
  function linksBaum() {
    return `<div class="zf-urnen"><svg viewBox="0 0 130 110" class="zf-urne-svg" role="img" aria-label="Urne mit ${bm.r} roten und ${bm.b} blauen Kugeln">${urneSvg(bm.r, bm.b, 15)}</svg>
      <p><b>${bm.r} rote</b> und <b>${bm.b} blaue</b> Kugeln. Es wird zweimal gezogen – <b>${bm.zurueck ? 'mit' : 'ohne'} Zurücklegen</b>.
      ${bm.zurueck ? '' : '<br><span class="leise">Ohne Zurücklegen: Beim zweiten Zug fehlt die erste Kugel in der Urne.</span>'}</p></div>
      <div class="zf-baum-huelle">${baumSvg()}</div>`;
  }
  function rechtsBaum() {
    const [f1, f2] = bm.frage;
    let h = `<h2 class="bereich-titel">Baumdiagramm</h2>`;
    h += `<p class="vz-schritt${bm.schritt > 1 ? ' fertig' : ''}">1. Beschrifte alle Zweige mit Brüchen.${bm.schritt > 1 ? ' ✓' : ''}</p>`;
    if (bm.schritt === 1) h += `<p class="leise">1. Stufe: Anteil der Farbe in der Urne. 2. Stufe: ${bm.zurueck ? 'genauso – die Kugel kommt zurück.' : 'eine Kugel weniger in der Urne!'}</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zf="pruefen">✓ Prüfen</button></div>`;
    if (bm.schritt >= 2) {
      h += `<p class="vz-schritt${bm.schritt > 2 ? ' fertig' : ''}">2. Wie wahrscheinlich ist erst ${fname(f1)}, dann ${fname(f2)}?</p>
        <p class="bk-gross">P(${fname(f1)}, ${fname(f2)}) = ${bruchFeld('zf-pz', 'zf-pn', eing)}</p>
        ${bm.schritt === 2 ? '<p class="leise">Pfadregel: Entlang des hervorgehobenen Pfades malnehmen.</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zf="pruefen">✓ Prüfen</button></div>' : ''}`;
    }
    if (bm.schritt === 3) { const a = P1(f1), b = P2(f1, f2); h += `<p class="fl-formel">${bruchHtml(a[0], a[1])} · ${bruchHtml(b[0], b[1])} = ${bruchHtml(a[0] * b[0], a[1] * b[1])}</p>`; }
    return h + antwortHtml(bewertung);
  }
  function pruefeBaum() {
    if (bm.schritt === 1) {
      const ids = [['zf-r', P1('r')], ['zf-b', P1('b')], ...PFADE.map(([a, b]) => [`zf-${a}${b}`, P2(a, b)])];
      const falsch = ids.filter(([id, [z, n]]) => !gleich(Number(eing[id + '-z']), Number(eing[id + '-n']), z, n) || !eing[id + '-z']);
      if (!falsch.length) { bm.schritt = 2; bewertung = null; g.sprich('Alle Zweige stimmen. An jeder Verzweigung ergeben die Wahrscheinlichkeiten zusammen 1.'); }
      else bewertung = { ok: false, text: `${falsch.length === 1 ? 'Ein Zweig stimmt' : `${falsch.length} Zweige stimmen`} noch nicht.${!bm.zurueck && falsch.some(([id]) => id.length > 5) ? ' Ohne Zurücklegen: Im zweiten Zug ist eine Kugel weniger drin.' : ''}` };
    } else if (bm.schritt === 2) {
      const [f1, f2] = bm.frage, a = P1(f1), b = P2(f1, f2);
      if (gleich(Number(eing['zf-pz']), Number(eing['zf-pn']), a[0] * b[0], a[1] * b[1]) && eing['zf-pz']) {
        bm.schritt = 3; bewertung = { ok: true, text: 'Richtig – entlang des Pfades wird multipliziert.' }; g.sprich('Pfadregel: Die Wahrscheinlichkeiten entlang eines Pfades werden multipliziert.', 'fertig');
      } else bewertung = { ok: false, text: `Nimm die beiden Brüche auf dem hervorgehobenen Pfad mal: ${a[0]}/${a[1]} · ${b[0]}/${b[1]}.` };
    }
    zeichne();
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'rad' ? 'Zufall auf lange Sicht' : 'Zweimal ziehen – das Baumdiagramm');
    g.links.innerHTML = modus === 'rad' ? linksRad() : linksBaum();
    g.rechts.innerHTML = modus === 'rad' ? rechtsRad() : rechtsBaum();
  }
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const d = e.target.closest('[data-dreh]');
    if (d && modus === 'rad') {
      const k = +d.dataset.dreh;
      const vorher = rd.drehung;
      drehe(k);
      g.links.innerHTML = linksRad();
      const sch = root.querySelector('.zf-scheibe');
      if (sch && bewegung() && k <= 10) sch.animate([{ transform: `rotate(${vorher}deg)` }, { transform: `rotate(${rd.drehung}deg)` }], { duration: k === 1 ? 1400 : 700, easing: 'cubic-bezier(.2,.8,.3,1)' });
      if (rd.n >= 100 && rd.n - k < 100) g.sprich('Schon über 100 Drehungen – siehst du, wie sich die Kurve beruhigt?');
      return;
    }
    const k = e.target.closest('[data-zf]');
    if (!k) return;
    if (k.dataset.zf === 'neu') { neu(); zeichne(); start(); }
    if (k.dataset.zf === 'pruefen') modus === 'rad' ? pruefeRad() : pruefeBaum();
    if (k.dataset.zf === 'tipp') g.sprich(modus === 'rad' ? `Alle ${rd.felder.length} Felder sind gleich groß. Zähle die Felder mit ${NAMEN[rd.ziel]}.` : bm.schritt === 1 ? `Erster Zug: ${bm.r} von ${bm.r + bm.b} Kugeln sind rot.` : 'Multipliziere die Brüche entlang des Pfades.', 'tipp');
  });

  function start() { g.sprich(modus === 'rad' ? 'Was passiert, wenn man das Glücksrad sehr oft dreht?' : 'Mit einem Baumdiagramm behältst du bei zwei Zügen den Überblick.'); }
  neu(); zeichne(); start();
}
