/* Mathematik: Zerlegen und Ergänzen.
   Dreieck: Eine Kopie wird um 180° gedreht und ergänzt das Dreieck zu einem Rechteck – das Dreieck ist die Hälfte.
   Zusammengesetzte Figuren: in Rechtecke zerlegen oder zu einem großen Rechteck ergänzen. */

import { geruest, zufall, wahl, antwortHtml, zahlenMerken, zahlFeld, warte } from './geruest.js';

const FARBEN = ['#f8cf4a', '#7fc8f8', '#9be37a', '#f7a3c4'];

export function starteZerlegen(root) {
  let modus = 'dreieck';
  let eing = {}, bewertung = null;
  let dr, gedreht;           // Dreieck: { a, h, p }
  let fig, weg;              // Figur: { art, W, H, w, h, x0 }, gewählter Weg

  const g = geruest(root, {
    etikett: 'Zerlegen und Ergänzen', titel: '',
    reiter: [{ id: 'dreieck', titel: 'Dreieck', unter: 'halbes Rechteck' }, { id: 'figur', titel: 'Zusammengesetzte Figuren' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-zl="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-zl="neu">＋ Neue Figur</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; eing['zl-a'] = ''; gedreht = false; weg = null;
    if (modus === 'dreieck') {
      let a, h;
      do { a = zufall(3, 10); h = zufall(2, 7); } while ((a * h) % 2);
      const p = Math.random() < 0.5 ? 0 : zufall(1, a - 1);
      dr = { a, h, p };
    } else {
      const art = wahl(['L', 'U']);
      const W = zufall(6, 10), H = zufall(4, 7);
      const w = art === 'L' ? zufall(2, W - 3) : zufall(2, W - 4);
      const h = zufall(1, H - 2);
      const x0 = art === 'L' ? W - w : zufall(1, W - w - 1);
      fig = { art, W, H, w, h, x0 };
    }
  }

  const S = 40, R = 20;   // Kästchengröße, Rand

  function gitter(W, H) {
    let s = '';
    for (let x = 0; x <= W; x++) s += `<line x1="${R + x * S}" y1="${R}" x2="${R + x * S}" y2="${R + H * S}" class="zl-gitter"/>`;
    for (let y = 0; y <= H; y++) s += `<line x1="${R}" y1="${R + y * S}" x2="${R + W * S}" y2="${R + y * S}" class="zl-gitter"/>`;
    return s;
  }

  function dreieckSvg() {
    const { a, h, p } = dr;
    const W = a, H = h;
    const P = (x, y) => [R + x * S, R + (H - y) * S];
    const pts = arr => arr.map(q => P(...q).join(',')).join(' ');
    let teile = '';
    const stuecke = [];
    if (p > 0) stuecke.push({ tri: [[0, 0], [p, 0], [p, h]], m: [p / 2, h / 2] });
    if (p < a) stuecke.push({ tri: [[p, 0], [a, 0], [p, h]], m: [(a + p) / 2, h / 2] });
    stuecke.forEach((st, i) => {
      const [mx, my] = P(...st.m);
      teile += `<polygon points="${pts(st.tri)}" class="zl-kopie${gedreht ? ' gedreht' : ''}" style="transform-origin:${mx}px ${my}px; --f:${FARBEN[i + 1]}; transition-delay:${i * 0.5}s"/>`;
    });
    const haupt = `<polygon points="${pts([[0, 0], [a, 0], [p, h]])}" class="zl-dreieck"/>`;
    const hoehe = p > 0 && p < a ? `<line x1="${P(p, 0)[0]}" y1="${P(p, 0)[1]}" x2="${P(p, h)[0]}" y2="${P(p, h)[1]}" class="zl-hoehe"/>` : '';
    const rahmen = gedreht ? `<rect x="${R}" y="${R}" width="${a * S}" height="${h * S}" class="zl-rahmen"/>` : '';
    return `<svg class="zl-svg" viewBox="0 0 ${W * S + 2 * R} ${H * S + 2 * R + 30}">${gitter(W, H)}${teile}${haupt}${hoehe}${rahmen}
      <text x="${R + a * S / 2}" y="${R + H * S + 26}" class="zl-mass">${a} cm</text>
      <text x="${P(p, h / 2)[0] + (p === 0 ? -6 : 8)}" y="${P(p, h / 2)[1]}" class="zl-mass${p === 0 ? ' rechts' : ' links'}">${h} cm</text></svg>`;
  }

  function teileFigur() {
    const { art, W, H, w, h, x0 } = fig;
    if (weg === 'ergaenzen') return { plus: [[0, 0, W, H]], minus: [[x0, H - h, w, h]] };
    if (art === 'L') {
      if (weg === 'senkrecht') return { plus: [[0, 0, W - w, H], [W - w, 0, w, H - h]] };
      return { plus: [[0, 0, W, H - h], [0, H - h, W - w, h]] };
    }
    if (weg === 'senkrecht') return { plus: [[0, 0, x0, H], [x0, 0, w, H - h], [x0 + w, 0, W - x0 - w, H]] };
    return { plus: [[0, 0, W, H - h], [0, H - h, x0, h], [x0 + w, H - h, W - x0 - w, h]] };
  }

  function figurSvg() {
    const { W, H, w, h, x0 } = fig;
    const P = (x, y) => [R + x * S, R + (H - y) * S];
    const umriss = [[0, 0], [W, 0], [W, H], [x0 + w, H], [x0 + w, H - h], [x0, H - h], [x0, H], [0, H]].filter((q, i, arr) => !(i > 0 && q[0] === arr[i - 1][0] && q[1] === arr[i - 1][1]));
    let teile = '';
    if (weg) {
      const t = teileFigur();
      t.plus.forEach(([x, y, bw, bh], i) => {
        const [X, Y] = P(x, y + bh);
        teile += `<rect x="${X}" y="${Y}" width="${bw * S}" height="${bh * S}" class="zl-teil" style="--f:${FARBEN[i]}"/>
          <text x="${X + bw * S / 2}" y="${Y + bh * S / 2 + 6}" class="zl-teiltext">${bw}·${bh}</text>`;
      });
      (t.minus || []).forEach(([x, y, bw, bh]) => {
        const [X, Y] = P(x, y + bh);
        teile += `<rect x="${X}" y="${Y}" width="${bw * S}" height="${bh * S}" class="zl-minus"/><text x="${X + bw * S / 2}" y="${Y + bh * S / 2 + 6}" class="zl-teiltext minus">− ${bw}·${bh}</text>`;
      });
    }
    return `<svg class="zl-svg" viewBox="0 0 ${W * S + 2 * R} ${H * S + 2 * R + 30}">${gitter(W, H)}
      ${weg === 'ergaenzen' ? '' : `<polygon points="${umriss.map(q => P(...q).join(',')).join(' ')}" class="zl-figur"/>`}${teile}
      <polygon points="${umriss.map(q => P(...q).join(',')).join(' ')}" class="zl-umriss"/>
      <text x="${R + W * S / 2}" y="${R + H * S + 26}" class="zl-mass">${W} cm</text></svg>`;
  }

  function links() {
    if (modus === 'dreieck') {
      return `${dreieckSvg()}
        <div class="gs-pruef"><button type="button" class="kn-gross" data-zl="drehen">${gedreht ? '↺ Kopie wegnehmen' : '⟳ Kopie drehen und anlegen'}</button></div>
        <p class="leise">Ein Kästchen ist 1 cm². Die Kopie ist genauso groß wie ${dr.p > 0 && dr.p < dr.a ? 'das Teildreieck' : 'das Dreieck'}.</p>`;
    }
    return `${figurSvg()}
      <div class="gs-pruef">
        <button type="button" class="kn-gross${weg === 'senkrecht' ? ' gewaehlt' : ''}" data-weg="senkrecht">✂ senkrecht zerlegen</button>
        <button type="button" class="kn-gross${weg === 'waagerecht' ? ' gewaehlt' : ''}" data-weg="waagerecht">✂ waagerecht zerlegen</button>
        <button type="button" class="kn-gross${weg === 'ergaenzen' ? ' gewaehlt' : ''}" data-weg="ergaenzen">▭ ergänzen</button>
      </div>`;
  }

  function rechts() {
    if (modus === 'dreieck') {
      const { a, h } = dr;
      return `<h2 class="bereich-titel">Wie groß ist das Dreieck?</h2>
        <p>Grundseite <b>${a} cm</b>, Höhe <b>${h} cm</b>.</p>
        <p class="ut-frage">A = ${zahlFeld('zl-a', eing['zl-a'], 3, 'Flächeninhalt')} cm²</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zl="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${gedreht ? `<p class="fl-formel">Rechteck: ${a} cm · ${h} cm = ${a * h} cm²<br>Dreieck: die Hälfte davon</p>` : ''}`;
    }
    let rechnung = '';
    if (weg) {
      const t = teileFigur();
      rechnung = `<p class="fl-formel">${t.plus.map(([, , bw, bh]) => `${bw} · ${bh}`).join(' + ')}${(t.minus || []).map(([, , bw, bh]) => ` − ${bw} · ${bh}`).join('')}</p>`;
    }
    return `<h2 class="bereich-titel">Wie groß ist die Figur?</h2>
      <p>Wähle links, ob du zerlegen oder ergänzen möchtest. Ein Kästchen ist 1 cm².</p>${rechnung}
      <p class="ut-frage">A = ${zahlFeld('zl-a', eing['zl-a'], 3, 'Flächeninhalt')} cm²</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zl="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'dreieck' ? 'Das Dreieck ist ein halbes Rechteck' : 'Zerlegen oder Ergänzen');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  async function drehen() {
    if (gedreht) { gedreht = false; zeichne(); return; }
    g.links.innerHTML = links();                 // Kopien liegen deckungsgleich auf dem Dreieck
    root.querySelectorAll('.zl-kopie').forEach(k => k.classList.add('sichtbar'));
    await warte(400);
    gedreht = true;
    root.querySelectorAll('.zl-kopie').forEach(k => k.classList.add('gedreht'));
    await warte(1400);
    zeichne();
    g.sprich('Dreieck und gedrehte Kopie bilden zusammen ein Rechteck. Das Dreieck ist genau die Hälfte davon.', 'fertig');
  }

  function pruefen() {
    const soll = modus === 'dreieck' ? dr.a * dr.h / 2 : fig.W * fig.H - fig.w * fig.h;
    const ok = Number(eing['zl-a']) === soll && eing['zl-a'] !== '';
    bewertung = ok ? { ok, text: `Richtig: ${soll} cm²` }
      : { ok, text: modus === 'dreieck' ? (Number(eing['zl-a']) === dr.a * dr.h ? 'Das ist das ganze Rechteck. Das Dreieck ist nur die Hälfte.' : 'Noch nicht. Ergänze zum Rechteck und nimm die Hälfte.') : 'Noch nicht. Zerlege in Rechtecke oder ergänze – und rechne jedes Rechteck aus.' };
    if (ok && modus === 'figur') g.sprich('Egal ob zerlegt oder ergänzt – es kommt immer derselbe Flächeninhalt heraus.', 'fertig');
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const w = e.target.closest('[data-weg]');
    if (w) { weg = w.dataset.weg; zeichne(); return; }
    const b = e.target.closest('[data-zl]');
    if (!b) return;
    if (b.dataset.zl === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.zl === 'drehen') drehen();
    if (b.dataset.zl === 'pruefen') pruefen();
    if (b.dataset.zl === 'tipp') g.sprich(modus === 'dreieck'
      ? 'Drehe eine Kopie des Dreiecks und lege sie an. Welches Rechteck entsteht? Wie groß ist es?'
      : weg ? 'Rechne jedes farbige Rechteck aus: Länge · Breite. Dann zusammenzählen (oder abziehen).' : 'Tippe auf „zerlegen“ oder „ergänzen“.', 'tipp');
  });

  function startText() {
    g.sprich(modus === 'dreieck'
      ? 'Wie viele Quadratzentimeter hat das Dreieck? Tipp: Mit einer gedrehten Kopie wird daraus ein Rechteck.'
      : 'Diese Figur ist kein Rechteck. Zerlege sie in Rechtecke oder ergänze sie zu einem großen Rechteck.');
  }

  neu(); zeichne(); startText();
}
