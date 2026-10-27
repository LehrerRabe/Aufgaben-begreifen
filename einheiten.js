/* Mathematik: Flächeneinheiten mit der Lupe.
   1 dm² wird unter der Lupe zu 10 Reihen mit je 10 cm² – also 100 cm².
   Daneben der Vergleich mit Längen: 1 dm = 10 cm. Dazu Umrechnungsaufgaben mit Bild. */

import { geruest, zufall, wahl, warte, antwortHtml, zahlenMerken, zahlFeld, bewegung } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const E = ['m', 'dm', 'cm', 'mm'];
const FARBE = ['#2f6fe4', '#16a974', '#f29a12', '#e0457b'];

export function starteEinheiten(root) {
  let modus = 'lupe';
  let stufe = 0, teilung = 0, beschaeftigt = false;   // teilung: 0 = ganz, 1 = eine Reihe, 2 = alle
  let auf, eing = {}, bewertung = null;

  const g = geruest(root, {
    etikett: 'Flächeneinheiten', titel: '',
    reiter: [{ id: 'lupe', titel: 'Lupe', unter: 'genau hinsehen' }, { id: 'umrechnen', titel: 'Umrechnen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-eh="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-eh="neu">↺ Von vorn</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; eing['eh-a'] = '';
    if (modus === 'lupe') { stufe = 0; teilung = 0; }
    else {
      const i = zufall(0, 2);
      const typ = wahl(['runter', 'runter2', 'rauf']);
      const k = zufall(1, 6);
      auf = { i, typ, k, rest: typ === 'runter2' ? zufall(1, 99) : 0 };
    }
  }

  function quadratSvg(i, t, klick) {
    const N = 10, Q = 300 / N;
    let s = `<rect x="10" y="10" width="300" height="300" class="eh-gross" style="--f:${FARBE[i]}"/>`;
    if (t >= 1) {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (t === 1 && r > 0) continue;
        s += `<rect x="${10 + c * Q}" y="${10 + r * Q}" width="${Q}" height="${Q}" class="eh-klein${r === 0 ? ' reihe' : ''}" style="--f:${FARBE[i + 1]}; animation-delay:${(r * N + c) * (t === 1 ? 40 : 6)}ms" ${klick ? `data-klein="${r * N + c}"` : ''}/>`;
      }
    }
    s += `<rect x="10" y="10" width="300" height="300" class="eh-rand"/>`;
    s += `<text x="160" y="345" class="eh-mass">${i < 3 ? `1 ${E[i]} = 10 ${E[i + 1]}` : `1 ${E[i]}`}</text>`;
    s += `<text x="340" y="160" class="eh-mass senk" transform="rotate(90 340 160)">1 ${E[i]}</text>`;
    return `<svg class="eh-svg" viewBox="0 0 360 360" role="img" aria-label="1 ${E[i]}²">${s}</svg>`;
  }

  function laengeSvg(i) {
    let s = `<line x1="10" y1="30" x2="310" y2="30" class="eh-laenge" style="--f:${FARBE[i]}"/>`;
    for (let k = 0; k <= 10; k++) s += `<line x1="${10 + k * 30}" y1="${k % 10 ? 22 : 16}" x2="${10 + k * 30}" y2="${k % 10 ? 38 : 44}" class="eh-strich"/>`;
    return `<svg class="eh-svg flach" viewBox="0 0 320 70"><text x="160" y="64" class="eh-mass">1 ${E[i]} = 10 ${E[i + 1]}</text>${s}</svg>`;
  }

  function links() {
    if (modus === 'lupe') {
      const i = stufe;
      return `<div class="eh-buehne">${quadratSvg(i, teilung, teilung === 2 && i < 2)}</div>
        <div class="gs-pruef">
          ${teilung < 2 && i < 3 ? `<button type="button" class="kn-gross" data-eh="lupe">🔍 ${teilung === 0 ? 'Lupe: eine Reihe zeigen' : 'Lupe: alle Reihen zeigen'}</button>` : ''}
          ${teilung === 2 && i < 2 ? '<p class="leise">Tippe auf ein kleines Quadrat, um es mit der Lupe zu vergrößern.</p>' : ''}
        </div>
        <h3 class="eh-zwischen">Zum Vergleich: Länge</h3>
        ${i < 3 ? laengeSvg(i) : ''}`;
    }
    const { i, typ, k, rest } = auf;
    let bilder = '';
    for (let n = 0; n < k; n++) bilder += `<span class="eh-mini">${quadratSvg(i, 2, false).replace(/<text[^>]*>[^<]*<\/text>/g, '')}</span>`;
    if (rest) bilder += `<span class="eh-mini rest" title="${rest} ${E[i + 1]}²">${restSvg(i, rest)}</span>`;
    return `<div class="eh-reihe">${bilder}</div>
      <p class="leise">Jedes große Quadrat ist 1 ${E[i]}² und besteht aus 100 kleinen Quadraten zu je 1 ${E[i + 1]}².</p>`;
  }

  function restSvg(i, n) {
    let s = '';
    for (let q = 0; q < n; q++) s += `<rect x="${10 + (q % 10) * 30}" y="${10 + Math.floor(q / 10) * 30}" width="30" height="30" class="eh-klein" style="--f:${FARBE[i + 1]}"/>`;
    return `<svg class="eh-svg" viewBox="0 0 320 320"><rect x="10" y="10" width="300" height="300" class="eh-leer"/>${s}</svg>`;
  }

  function rechts() {
    if (modus === 'lupe') {
      const i = stufe;
      const txt = teilung === 0
        ? `<p>Das ist <b>1 ${E[i]}²</b>: ein Quadrat, 1 ${E[i]} lang und 1 ${E[i]} breit.</p>`
        : teilung === 1
          ? `<p>In eine Reihe passen <b>10 kleine Quadrate</b> zu je 1 ${E[i + 1]}² – denn 1 ${E[i]} = 10 ${E[i + 1]}.</p>`
          : `<p><b>10 Reihen</b> mit je <b>10</b> kleinen Quadraten:</p><p class="fl-formel">1 ${E[i]}² = 10 · 10 ${E[i + 1]}² = 100 ${E[i + 1]}²</p>
             <p>Bei Längen ist die Umrechnungszahl <b>10</b>, bei Flächen <b>100</b>.</p>`;
      const kette = E.slice(0, 4).map((e, k) => `<span class="eh-kette-e${k === i ? ' jetzt' : ''}${k === i + 1 && teilung ? ' jetzt2' : ''}">${e}²</span>`).join('<span class="eh-pfeil">·100→</span>');
      return `<h2 class="bereich-titel">Was siehst du?</h2>${txt}<div class="eh-kette">${kette}</div>`;
    }
    const { i, typ, k, rest } = auf;
    const U = `${E[i]}²`, u = `${E[i + 1]}²`;
    let frage, soll;
    if (typ === 'runter') { frage = `${k} ${U} = ${zahlFeld('eh-a', eing['eh-a'], 5, `in ${u}`)} ${u}`; soll = k * 100; }
    if (typ === 'runter2') { frage = `${k} ${U} ${rest} ${u} = ${zahlFeld('eh-a', eing['eh-a'], 5, `in ${u}`)} ${u}`; soll = k * 100 + rest; }
    if (typ === 'rauf') { frage = `${zahlText(k * 100)} ${u} = ${zahlFeld('eh-a', eing['eh-a'], 3, `in ${U}`)} ${U}`; soll = k; }
    auf.soll = soll;
    return `<h2 class="bereich-titel">Rechne um</h2><p class="ut-frage">${frage}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-eh="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      <p class="leise">1 ${U} = 100 ${u}</p>`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'lupe' ? `Wie viel ist 1 ${E[stufe]}²?` : 'Flächeneinheiten umrechnen');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  async function zoom(n) {
    beschaeftigt = true;
    const el = root.querySelector(`[data-klein="${n}"]`);
    if (el && bewegung()) {
      const svg = el.ownerSVGElement;
      const x = Number(el.getAttribute('x')), y = Number(el.getAttribute('y')), w = Number(el.getAttribute('width'));
      el.classList.add('lupe');
      Object.assign(el.style, { transformBox: 'view-box', transformOrigin: `${x}px ${y}px` });
      svg.querySelectorAll('.eh-klein').forEach(k => { if (k !== el) k.style.opacity = '.25'; });
      await el.animate([{ transform: 'none' }, { transform: `translate(${10 - x}px, ${10 - y}px) scale(${300 / w})` }], { duration: 900, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
    }
    stufe += 1; teilung = 0;
    zeichne();
    g.sprich(`Unter der Lupe: Ein kleines Quadrat ist 1 ${E[stufe]}². Es ist selbst wieder ein Quadrat – und lässt sich weiter einteilen.`);
    beschaeftigt = false;
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const k = e.target.closest('[data-klein]');
    if (k) { zoom(Number(k.dataset.klein)); return; }
    const b = e.target.closest('[data-eh]');
    if (!b) return;
    const was = b.dataset.eh;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'lupe') { teilung += 1; zeichne(); if (teilung === 2) g.sprich(`1 ${E[stufe]}² = 100 ${E[stufe + 1]}²`, 'fertig'); }
    if (was === 'pruefen') {
      const ok = Number(eing['eh-a']) === auf.soll && eing['eh-a'] !== '';
      bewertung = ok ? { ok, text: 'Richtig!' } : { ok, text: Number(eing['eh-a']) * 10 === auf.soll || Number(eing['eh-a']) === auf.k * 10 ? 'Vorsicht: Bei Flächen ist die Umrechnungszahl 100, nicht 10.' : 'Noch nicht. Zähle die kleinen Quadrate im Bild.' };
      g.rechts.innerHTML = rechts();
    }
    if (was === 'tipp') g.sprich(modus === 'lupe' ? 'Ein Quadrat mit 10 kleinen Quadraten pro Reihe hat 10 Reihen. 10 · 10 = 100.' : 'Jedes große Quadrat sind 100 kleine. Zähle in Hunderterschritten.', 'tipp');
  });

  function startText() {
    g.sprich(modus === 'lupe' ? 'Schau mit der Lupe genau hin: Wie viele kleine Quadrate passen in das große?' : 'Rechne die Flächeneinheiten um. Das Bild hilft dir.');
  }

  neu(); zeichne(); startText();
}
