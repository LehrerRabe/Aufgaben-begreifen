/* Mathematik: Winkel (Klasse 5/6, Wiederholung Klasse 7).
   „Drehen“: Ein Winkel entsteht durch Drehen eines Schenkels. Den Zeiger mit dem Finger auf die gesuchte Gradzahl
     drehen (Winkelmesser als Hilfe), danach die Winkelart bestimmen.
   „Vergleichen“: Zwei Winkel mit verschieden langen Schenkeln – welcher ist größer? Danach werden sie übereinandergelegt.
     (Fehlvorstellung: längere Schenkel = größerer Winkel.)
   „Schätzen“: Winkel schätzen, dann legt sich der Winkelmesser darüber. */

import { geruest, zufall, wahl, antwortHtml, ESC } from './geruest.js';

const ARTEN = [
  { id: 'spitz', name: 'spitz', test: a => a > 0 && a < 90, text: 'kleiner als 90°' },
  { id: 'recht', name: 'rechter Winkel', test: a => a === 90, text: 'genau 90°' },
  { id: 'stumpf', name: 'stumpf', test: a => a > 90 && a < 180, text: 'zwischen 90° und 180°' },
  { id: 'gestreckt', name: 'gestreckt', test: a => a === 180, text: 'genau 180°' },
  { id: 'ueber', name: 'überstumpf', test: a => a > 180 && a < 360, text: 'zwischen 180° und 360°' },
];
const rad = g => (g * Math.PI) / 180;
const P = (cx, cy, r, g) => [cx + r * Math.cos(rad(g)), cy - r * Math.sin(rad(g))];

/** Winkelmesser (Vollkreis, 10°-Striche, Beschriftung alle 30°) */
function messer(cx, cy, r) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" class="wk-messer"/>`;
  for (let g = 0; g < 360; g += 5) {
    const lang = g % 30 === 0 ? 14 : g % 10 === 0 ? 9 : 5;
    const [x1, y1] = P(cx, cy, r, g), [x2, y2] = P(cx, cy, r - lang, g);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="wk-mstrich"/>`;
    if (g % 30 === 0) { const [tx, ty] = P(cx, cy, r - 26, g); s += `<text x="${tx}" y="${ty + 4}" class="wk-mzahl">${g}</text>`; }
  }
  return s;
}
function winkelBogen(cx, cy, r, a, kl = '') {
  if (a <= 0) return '';
  if (a >= 360) return `<circle cx="${cx}" cy="${cy}" r="${r}" class="wk-bogen ${kl}"/>`;
  const [x1, y1] = P(cx, cy, r, 0), [x2, y2] = P(cx, cy, r, a);
  return `<path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${a > 180 ? 1 : 0} 0 ${x2} ${y2} Z" class="wk-flaeche ${kl}"/>`;
}

export function starteWinkel(root) {
  let modus = 'drehen', bewertung = null, eing = '';
  let dr;   // { ziel, ist, schritt, art }
  let vg;   // { a, b, la, lb, wahl }
  let sz;   // { a, dreh, geschaetzt }

  const g = geruest(root, {
    etikett: 'Winkel', titel: '',
    reiter: [{ id: 'drehen', titel: 'Winkel drehen', unter: 'mit dem Winkelmesser' }, { id: 'vergleichen', titel: 'Vergleichen', unter: 'übereinanderlegen' }, { id: 'schaetzen', titel: 'Schätzen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-wk="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-wk="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    bewertung = null; eing = '';
    if (modus === 'drehen') dr = { ziel: wahl([zufall(2, 17) * 5, zufall(19, 35) * 5, 90, 180, zufall(37, 70) * 5]), ist: 0, schritt: 1 };
    if (modus === 'vergleichen') {
      let a, b; do { a = zufall(4, 30) * 5; b = zufall(4, 30) * 5; } while (Math.abs(a - b) > 25 || (a !== b && Math.abs(a - b) < 5));
      if (Math.random() < 0.2) b = a;
      // Falle: der kleinere Winkel bekommt die längeren Schenkel
      const kurz = 55, lang = 120;
      vg = { a, b, la: a < b ? lang : a > b ? kurz : wahl([kurz, lang]), lb: a < b ? kurz : a > b ? lang : wahl([kurz, lang]), wahl: null };
    }
    if (modus === 'schaetzen') sz = { a: zufall(3, 68) * 5, dreh: zufall(0, 11) * 30, geschaetzt: null };
  }

  /* ---------------- Drehen ---------------- */
  const CX = 200, CY = 200, RZ = 160;
  function drehSvg() {
    const a = dr.ist, [zx, zy] = P(CX, CY, RZ, a);
    return `<svg class="wk-svg" id="wk-dreh" viewBox="0 0 400 400" role="img" aria-label="Winkel drehen">
      ${messer(CX, CY, 175)}
      ${winkelBogen(CX, CY, 46, a, dr.schritt > 1 ? 'fertig' : '')}
      <line x1="${CX}" y1="${CY}" x2="${CX + RZ}" y2="${CY}" class="wk-schenkel fest"/>
      <line x1="${CX}" y1="${CY}" x2="${zx}" y2="${zy}" class="wk-schenkel"/>
      <circle cx="${zx}" cy="${zy}" r="18" class="wk-griff" data-griff/>
      <circle cx="${CX}" cy="${CY}" r="6" class="wk-scheitel"/>
      ${dr.schritt > 1 ? `<text x="${CX + 60}" y="${CY - 14}" class="wk-grad">${a}°</text>` : ''}</svg>`;
  }
  function linksDrehen() {
    return `<div class="wk-buehne">${drehSvg()}</div>
      <div class="wk-fein" role="group" aria-label="Feineinstellung">${[-10, -1, 1, 10].map(d => `<button type="button" class="kn-gross kn-leise" data-fein="${d}" ${dr.schritt > 1 ? 'disabled' : ''}>${d > 0 ? '+' : '−'}${Math.abs(d)}°</button>`).join('')}</div>
      <p class="leise">Ziehe den grünen Punkt. Der untere Schenkel bleibt liegen – der andere dreht sich gegen den Uhrzeigersinn.</p>`;
  }
  function rechtsDrehen() {
    let h = `<h2 class="bereich-titel">Drehe den Winkel</h2><p class="rr-gross">${dr.ziel}°</p>`;
    if (dr.schritt === 1) h += `<p class="leise">Lies am Winkelmesser ab – innen stehen die Gradzahlen.</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-wk="pruefen">✓ Prüfen</button></div>`;
    if (dr.schritt >= 2) {
      h += `<h3 class="eh-zwischen">Welche Winkelart ist das?</h3><div class="wk-arten">${ARTEN.map(a => `<button type="button" class="kn-gross${dr.art === a.id ? (a.test(dr.ziel) ? ' richtig' : ' falsch') : ''}" data-art="${a.id}" ${dr.schritt > 2 ? 'disabled' : ''}>${a.name}</button>`).join('')}</div>`;
    }
    if (dr.schritt === 3) h += `<p class="fl-formel">${dr.ziel}° ist ${ARTEN.find(a => a.test(dr.ziel)).name}: ${ARTEN.find(a => a.test(dr.ziel)).text}.</p>`;
    return h + antwortHtml(bewertung);
  }

  /* ---------------- Vergleichen ---------------- */
  function einWinkel(a, l, farbe, titel) {
    const [x, y] = P(80, 150, l, a);
    return `<svg class="wk-klein" viewBox="0 0 220 220" role="img" aria-label="${titel}">
      <text x="10" y="24" class="wk-titel" fill="${farbe}">${titel}</text>
      ${winkelBogen(80, 150, 26, a, '')}
      <line x1="80" y1="150" x2="${80 + l}" y2="150" stroke="${farbe}" class="wk-sch"/><line x1="80" y1="150" x2="${x}" y2="${y}" stroke="${farbe}" class="wk-sch"/>
      <circle cx="80" cy="150" r="5" fill="${farbe}"/></svg>`;
  }
  function linksVergleich() {
    if (!vg.wahl) return `<div class="wk-paar">${einWinkel(vg.a, vg.la, '#e0262b', 'Winkel A')}${einWinkel(vg.b, vg.lb, '#2f6fe4', 'Winkel B')}</div>`;
    const [xa, ya] = P(150, 220, vg.la * 1.3, vg.a), [xb, yb] = P(150, 220, vg.lb * 1.3, vg.b);
    return `<svg class="wk-svg" viewBox="0 0 400 260" role="img" aria-label="Beide Winkel übereinander">
      <g class="wk-ueber">
        <path d="M150 220 L${150 + 60} 220 A60 60 0 0 0 ${P(150, 220, 60, vg.a).join(' ')} Z" fill="#e0262b" opacity=".18"/>
        <path d="M150 220 L${150 + 80} 220 A80 80 0 0 0 ${P(150, 220, 80, vg.b).join(' ')} Z" fill="#2f6fe4" opacity=".18"/>
        <line x1="150" y1="220" x2="${150 + Math.max(vg.la, vg.lb) * 1.3}" y2="220" class="wk-sch" stroke="var(--text)"/>
        <line x1="150" y1="220" x2="${xa}" y2="${ya}" class="wk-sch" stroke="#e0262b"/><line x1="150" y1="220" x2="${xb}" y2="${yb}" class="wk-sch neu" stroke="#2f6fe4"/>
        <text x="${xa}" y="${ya - 10}" class="wk-titel" fill="#e0262b">A ${vg.a}°</text><text x="${xb + 6}" y="${yb + 18}" class="wk-titel" fill="#2f6fe4">B ${vg.b}°</text></g></svg>
      <p class="leise">Übereinandergelegt: Beide Winkel beginnen am selben Scheitel und am selben Schenkel. Die Länge der Schenkel spielt keine Rolle.</p>`;
  }
  function rechtsVergleich() {
    return `<h2 class="bereich-titel">Welcher Winkel ist größer?</h2>
      <div class="gs-pruef">${[['A', 'Winkel A'], ['gleich', 'gleich groß'], ['B', 'Winkel B']].map(([id, t]) => `<button type="button" class="kn-gross${vg.wahl === id ? ' gewaehlt' : ''}" data-vgl="${id}" ${bewertung?.ok ? 'disabled' : ''}>${t}</button>`).join('')}</div>
      ${antwortHtml(bewertung)}<p class="leise">Ein Winkel ist umso größer, je weiter man drehen muss – nicht je länger die Schenkel sind.</p>`;
  }

  /* ---------------- Schätzen ---------------- */
  function schaetzSvg() {
    const cx = 200, cy = 200, [x, y] = P(cx, cy, 150, sz.a);
    const zeigen = sz.geschaetzt !== null;
    return `<svg class="wk-svg" viewBox="0 0 400 400" role="img" aria-label="Winkel schätzen">
      ${zeigen ? `<g class="wk-messer-rein">${messer(cx, cy, 175)}</g>` : ''}
      ${winkelBogen(cx, cy, 40, sz.a, zeigen ? 'fertig' : '')}
      <line x1="${cx}" y1="${cy}" x2="${cx + 150}" y2="${cy}" class="wk-schenkel fest"/><line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="wk-schenkel"/>
      <circle cx="${cx}" cy="${cy}" r="6" class="wk-scheitel"/>
      ${zeigen ? `<text x="${cx + 50}" y="${cy - 12}" class="wk-grad">${sz.a}°</text>` : ''}</svg>`;
  }
  function rechtsSchaetzen() {
    return `<h2 class="bereich-titel">Wie groß ist der Winkel?</h2>
      <p class="leise">Vergleiche mit Winkeln, die du kennst: 90° (rechter Winkel), 180° (gestreckt), 45° (halber rechter Winkel).</p>
      <p class="ut-frage">etwa <input class="gs-ein" id="wk-s" data-wkein inputmode="numeric" maxlength="3" value="${ESC(eing)}" aria-label="geschätzte Gradzahl"> °</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-wk="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  /* ---------------- Ziehen ---------------- */
  let zieht = false;
  function winkelAusPunkt(e) {
    const svg = root.querySelector('#wk-dreh'); if (!svg) return null;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    let a = Math.round((Math.atan2(CY - p.y, p.x - CX) * 180) / Math.PI);
    if (a < 0) a += 360;
    return a;
  }
  function setzeWinkel(a) {
    dr.ist = a;
    const svg = root.querySelector('#wk-dreh');
    if (svg) svg.outerHTML = drehSvg();
  }
  root.addEventListener('pointerdown', e => {
    if (modus !== 'drehen' || dr.schritt > 1 || !e.target.closest('#wk-dreh')) return;
    zieht = true; e.preventDefault();
    const a = winkelAusPunkt(e); if (a !== null) setzeWinkel(a);
  });
  root.addEventListener('pointermove', e => { if (zieht) { const a = winkelAusPunkt(e); if (a !== null && a !== dr.ist) setzeWinkel(a); } });
  window.addEventListener('pointerup', () => { zieht = false; });

  /* ---------------- Prüfen ---------------- */
  function pruefen() {
    if (modus === 'drehen' && dr.schritt === 1) {
      const d = Math.abs(dr.ist - dr.ziel);
      if (d <= 2 || (dr.ziel === 360 && dr.ist <= 2)) { dr.ist = dr.ziel; dr.schritt = 2; bewertung = null; g.sprich(`Genau: ${dr.ziel}°. Welche Winkelart ist das?`); }
      else bewertung = { ok: false, text: `Dein Winkel hat ${dr.ist}°. ${dr.ist < dr.ziel ? 'Drehe weiter.' : 'Drehe zurück.'}` };
    }
    if (modus === 'schaetzen') {
      const v = Number(eing);
      if (!eing) { bewertung = { ok: false, text: 'Trage deine Schätzung ein.' }; }
      else {
        sz.geschaetzt = v; const d = Math.abs(v - sz.a);
        bewertung = d <= 10 ? { ok: true, text: `Sehr gut geschätzt! Der Winkel hat ${sz.a}° (${d}° daneben).` } : d <= 25 ? { ok: true, text: `Gar nicht schlecht: ${sz.a}° (${d}° daneben).` } : { ok: false, text: `Der Winkel hat ${sz.a}° – ${d}° daneben. Vergleiche mit 90° und 180°.` };
        if (bewertung.ok) g.sprich('Der Winkelmesser zeigt den genauen Wert.', 'fertig');
      }
    }
    zeichne();
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ drehen: 'Winkel entstehen durch Drehen', vergleichen: 'Winkel vergleichen', schaetzen: 'Winkel schätzen' }[modus]);
    if (modus === 'drehen') { g.links.innerHTML = linksDrehen(); g.rechts.innerHTML = rechtsDrehen(); }
    if (modus === 'vergleichen') { g.links.innerHTML = linksVergleich(); g.rechts.innerHTML = rechtsVergleich(); }
    if (modus === 'schaetzen') { g.links.innerHTML = `<div class="wk-buehne">${schaetzSvg()}</div>`; g.rechts.innerHTML = rechtsSchaetzen(); }
  }

  root.addEventListener('input', e => { if (e.target.matches('[data-wkein]')) { e.target.value = e.target.value.replace(/\D/g, ''); eing = e.target.value; } });
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const f = e.target.closest('[data-fein]');
    if (f && dr.schritt === 1) { setzeWinkel(((dr.ist + +f.dataset.fein) % 360 + 360) % 360); bewertung = null; g.rechts.innerHTML = rechtsDrehen(); return; }
    const ar = e.target.closest('[data-art]');
    if (ar && dr.schritt === 2) {
      dr.art = ar.dataset.art; const a = ARTEN.find(x => x.id === dr.art);
      if (a.test(dr.ziel)) { dr.schritt = 3; bewertung = { ok: true, text: `Richtig: ${a.name}.` }; g.sprich('Winkelarten: spitz < 90° < stumpf < 180° < überstumpf.', 'fertig'); }
      else bewertung = { ok: false, text: `${a.name} heißt ${a.text}. Dein Winkel hat ${dr.ziel}°.` };
      zeichne(); return;
    }
    const v = e.target.closest('[data-vgl]');
    if (v && !bewertung?.ok) {
      vg.wahl = v.dataset.vgl;
      const soll = vg.a > vg.b ? 'A' : vg.b > vg.a ? 'B' : 'gleich';
      bewertung = vg.wahl === soll ? { ok: true, text: `Richtig: A hat ${vg.a}°, B hat ${vg.b}°.` } : { ok: false, text: `Übereinandergelegt sieht man es: A hat ${vg.a}°, B hat ${vg.b}°.${(soll === 'A' && vg.la < vg.lb) || (soll === 'B' && vg.lb < vg.la) ? ' Die längeren Schenkel haben dich getäuscht!' : ''}` };
      if (bewertung.ok) g.sprich('Nicht die Schenkellänge zählt, sondern wie weit gedreht wurde.', 'fertig');
      zeichne(); return;
    }
    const k = e.target.closest('[data-wk]');
    if (!k) return;
    if (k.dataset.wk === 'neu') { neu(); zeichne(); start(); }
    if (k.dataset.wk === 'pruefen') pruefen();
    if (k.dataset.wk === 'tipp') g.sprich(modus === 'drehen' ? (dr.schritt === 1 ? `Starte bei 0° (rechts) und drehe gegen den Uhrzeigersinn bis ${dr.ziel}°. 90° zeigt nach oben, 180° nach links.` : 'Vergleiche mit 90° und 180°.') : modus === 'vergleichen' ? 'Stell dir vor, du legst die Winkel so übereinander, dass Scheitel und ein Schenkel aufeinanderliegen.' : 'Ein rechter Winkel ist 90°. Ist dieser Winkel größer oder kleiner? Um wie viel?', 'tipp');
  });

  function start() { g.sprich({ drehen: 'Ein Winkel zeigt, wie weit sich ein Schenkel um den Scheitel gedreht hat.', vergleichen: 'Achtung, Falle: Lass dich nicht von langen Schenkeln täuschen!', schaetzen: 'Schätze zuerst – dann misst der Winkelmesser nach.' }[modus]); }
  neu(); zeichne(); start();
}
