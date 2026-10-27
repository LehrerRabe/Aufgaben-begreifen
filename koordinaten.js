/* Mathematik: Koordinaten-Steckbrett.
   Punkte stecken: erst nach rechts (x), dann nach oben (y) – der Weg wird als Pfeil gezeigt.
   Ablesen und Verschieben einer Figur um einen Vektor. */

import { geruest, wahl, zufall, antwortHtml, zahlFeld, zahlenMerken } from './geruest.js';

const G = 10;
const FIGUREN = [
  { name: 'Haus', punkte: [[2, 1], [8, 1], [8, 6], [5, 9], [2, 6], [2, 1]] },
  { name: 'Boot', punkte: [[1, 3], [9, 3], [7, 1], [3, 1], [1, 3]] },
  { name: 'Pfeil', punkte: [[1, 4], [6, 4], [6, 2], [9, 5], [6, 8], [6, 6], [1, 6], [1, 4]] },
  { name: 'Stern', punkte: [[5, 9], [6, 6], [9, 6], [7, 4], [8, 1], [5, 3], [2, 1], [3, 4], [1, 6], [4, 6], [5, 9]] },
  { name: 'Fisch', punkte: [[1, 5], [3, 7], [6, 7], [8, 5], [9, 7], [9, 3], [8, 5], [6, 3], [3, 3], [1, 5]] },
];
const FORMEN = [[[1, 1], [4, 1], [2, 4]], [[1, 1], [3, 1], [3, 3], [1, 3]], [[1, 2], [3, 1], [4, 3], [2, 4]]];

export function starteKoordinaten(root) {
  let modus = 'stecken';
  let fig, schritt, gesteckt, falschPunkt, weg;
  let ablesen, eing = {}, bewertung;
  let form, vektor, bilder;

  const g = geruest(root, {
    etikett: 'Koordinatensystem', titel: '',
    reiter: [{ id: 'stecken', titel: 'Punkte stecken' }, { id: 'ablesen', titel: 'Ablesen' }, { id: 'verschieben', titel: 'Verschieben' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-ko="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-ko="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    falschPunkt = null; weg = null; bewertung = null; eing = Object.assign(eing, { 'ko-x': '', 'ko-y': '' });
    if (modus === 'stecken') { fig = wahl(FIGUREN); schritt = 0; gesteckt = []; }
    if (modus === 'ablesen') ablesen = [zufall(0, G), zufall(0, G)];
    if (modus === 'verschieben') {
      form = wahl(FORMEN);
      const maxX = G - Math.max(...form.map(p => p[0])), maxY = G - Math.max(...form.map(p => p[1]));
      do { vektor = [zufall(0, Math.min(6, maxX)), zufall(0, Math.min(5, maxY))]; } while (vektor[0] + vektor[1] < 3);
      bilder = [];
    }
  }

  const s = () => Math.min(46, ((g.links.clientWidth || 500) - 80) / G);
  const px = (p, z = s()) => [40 + p[0] * z, 40 + (G - p[1]) * z];

  function brett() {
    const z = s();
    let h = '';
    for (let i = 0; i <= G; i++) {
      const [x] = px([i, 0], z), [, y] = px([0, i], z);
      h += `<line x1="${x}" y1="${px([0, 0], z)[1]}" x2="${x}" y2="${px([0, G], z)[1]}" class="ko-linie"/>`;
      h += `<line x1="${px([0, 0], z)[0]}" y1="${y}" x2="${px([G, 0], z)[0]}" y2="${y}" class="ko-linie"/>`;
      h += `<text x="${x}" y="${px([0, 0], z)[1] + 18}" class="ko-zahl">${i}</text>`;
      if (i) h += `<text x="${px([0, 0], z)[0] - 12}" y="${y + 5}" class="ko-zahl">${i}</text>`;
    }
    const [ox, oy] = px([0, 0], z);
    h += `<line x1="${ox}" y1="${oy}" x2="${px([G, 0], z)[0] + 24}" y2="${oy}" class="ko-achse" marker-end="url(#ko-spitze)"/>
      <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${px([0, G], z)[1] - 24}" class="ko-achse" marker-end="url(#ko-spitze)"/>
      <text x="${px([G, 0], z)[0] + 34}" y="${oy + 5}" class="ko-zahl ko-achsname">x</text><text x="${ox + 18}" y="${px([0, G], z)[1] - 16}" class="ko-zahl ko-achsname">y</text>`;
    // Tippflächen auf allen Gitterpunkten
    let tipp = '';
    for (let x = 0; x <= G; x++) for (let y = 0; y <= G; y++) { const [X, Y] = px([x, y], z); tipp += `<circle cx="${X}" cy="${Y}" r="${z * 0.42}" class="ko-tipp" data-p="${x},${y}"/>`; }
    let inhalt = '';
    const zug = pts => pts.map(p => px(p, z).join(',')).join(' ');
    if (modus === 'stecken') {
      if (gesteckt.length > 1) inhalt += `<polyline points="${zug(gesteckt)}" class="ko-figur${schritt >= fig.punkte.length ? ' fertig' : ''}"/>`;
      gesteckt.forEach(p => { const [X, Y] = px(p, z); inhalt += `<circle cx="${X}" cy="${Y}" r="8" class="ko-pin"/>`; });
    }
    if (modus === 'ablesen') { const [X, Y] = px(ablesen, z); inhalt += `<circle cx="${X}" cy="${Y}" r="10" class="ko-pin ziel"/>`; }
    if (modus === 'verschieben') {
      inhalt += `<polygon points="${zug(form)}" class="ko-form"/>`;
      form.forEach((p, i) => { const [X, Y] = px(p, z); inhalt += `<circle cx="${X}" cy="${Y}" r="7" class="ko-pin"/><text x="${X - 14}" y="${Y - 10}" class="ko-buchst">${'ABCD'[i]}</text>`; });
      const [ax, ay] = px(form[0], z), [bx, by] = px([form[0][0] + vektor[0], form[0][1] + vektor[1]], z);
      inhalt += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" class="ko-vektor" marker-end="url(#ko-spitze-v)"/>`;
      if (bilder.length === form.length) inhalt += `<polygon points="${zug(bilder)}" class="ko-form bild"/>`;
      bilder.forEach((p, i) => { const [X, Y] = px(p, z); inhalt += `<circle cx="${X}" cy="${Y}" r="7" class="ko-pin bild"/><text x="${X - 16}" y="${Y - 10}" class="ko-buchst">${'ABCD'[i]}'</text>`; });
    }
    if (falschPunkt) { const [X, Y] = px(falschPunkt, z); inhalt += `<circle cx="${X}" cy="${Y}" r="9" class="ko-pin falsch"/>`; }
    if (weg) {
      const [a, b] = weg;
      const [x0, y0] = px(a, z), [x1] = px([b[0], a[1]], z), [, y1] = px(b, z);
      inhalt += `<path d="M${x0} ${y0} H${x1}" class="ko-weg x" marker-end="url(#ko-spitze-x)"/><path d="M${x1} ${y0} V${y1}" class="ko-weg y" marker-end="url(#ko-spitze-y)"/>`;
    }
    const breite = 90 + G * z, hoehe = 70 + G * z;
    return `<svg class="ko-brett" viewBox="0 0 ${breite} ${hoehe}">
      <defs>
        <marker id="ko-spitze" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="ko-spitze"/></marker>
        <marker id="ko-spitze-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="#e0457b"/></marker>
        <marker id="ko-spitze-x" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="#2f6fe4"/></marker>
        <marker id="ko-spitze-y" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="#1f9d55"/></marker>
      </defs>
      <rect width="${breite}" height="${hoehe}" rx="14" class="vk-holz"/>${h}${inhalt}${tipp}</svg>`;
  }

  const fmt = p => `(${p[0]}|${p[1]})`;

  function rechts() {
    if (modus === 'stecken') {
      const fertig = schritt >= fig.punkte.length;
      return `<h2 class="bereich-titel">Stecke die Punkte der Reihe nach</h2>
        <div class="ko-liste">${fig.punkte.map((p, i) => `<span class="ko-koord${i < schritt ? ' ok' : i === schritt ? ' jetzt' : ''}">${fmt(p)}</span>`).join('')}</div>
        ${fertig ? `<p class="tb-antwort gut">Fertig! Es ist ein ${fig.name}.</p>` : `<p class="ko-gross">${fmt(fig.punkte[schritt])}</p>
        <p class="leise">Die erste Zahl sagt, wie weit nach <b class="ko-x">rechts</b>, die zweite, wie weit nach <b class="ko-y">oben</b>.</p>`}`;
    }
    if (modus === 'ablesen') {
      return `<h2 class="bereich-titel">Welche Koordinaten hat der Punkt?</h2>
        <p class="ko-gross">( ${zahlFeld('ko-x', eing['ko-x'], 2, 'x-Koordinate')} | ${zahlFeld('ko-y', eing['ko-y'], 2, 'y-Koordinate')} )</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-ko="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    const fertig = bilder.length === form.length;
    return `<h2 class="bereich-titel">Verschiebe die Figur</h2>
      <p class="ko-gross"><span class="ko-x">${vektor[0]} nach rechts</span>, <span class="ko-y">${vektor[1]} nach oben</span></p>
      <p>Stecke die Bildpunkte ${form.map((_, i) => `${'ABCD'[i]}'`).join(', ')}. Der rote Pfeil zeigt die Verschiebung von A nach A'.</p>
      ${fertig ? '<p class="tb-antwort gut">Geschafft! Die Figur ist nur verschoben – sie ist gleich groß und gleich gedreht.</p>'
        : `<p>Jetzt: Wohin kommt <b>${'ABCD'[bilder.length]}</b> ${fmt(form[bilder.length])}?</p>`}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ stecken: 'Punkte stecken', ablesen: 'Koordinaten ablesen', verschieben: 'Figur verschieben' }[modus]);
    g.links.innerHTML = brett();
    g.rechts.innerHTML = rechts();
  }

  function steck(p) {
    falschPunkt = null; weg = null;
    if (modus === 'stecken') {
      if (schritt >= fig.punkte.length) return;
      const soll = fig.punkte[schritt];
      if (p[0] === soll[0] && p[1] === soll[1]) {
        gesteckt.push(soll); schritt++;
        if (schritt >= fig.punkte.length) g.sprich(`Super! Alle Punkte stecken – das Bild zeigt einen ${fig.name}.`, 'fertig');
        else g.sprich(`${fmt(soll)} ✓ Weiter mit ${fmt(fig.punkte[schritt])}.`);
      } else {
        falschPunkt = p; weg = [[0, 0], soll];
        g.sprich(`Du hast ${fmt(p)} gesteckt. Für ${fmt(soll)} gehst du vom Ursprung <b class="ko-x">${soll[0]} nach rechts</b> und dann <b class="ko-y">${soll[1]} nach oben</b>.`, 'tipp');
      }
    } else if (modus === 'verschieben') {
      if (bilder.length >= form.length) return;
      const q = form[bilder.length], soll = [q[0] + vektor[0], q[1] + vektor[1]];
      if (p[0] === soll[0] && p[1] === soll[1]) {
        bilder.push(soll);
        if (bilder.length === form.length) { g.sprich(`Alle Bildpunkte stecken. Jeder Punkt ist ${vektor[0]} nach rechts und ${vektor[1]} nach oben gewandert.`, 'fertig'); zeichne(); animiere(); return; }
        g.sprich(`${'ABCD'[bilder.length - 1]}' ${fmt(soll)} ✓`);
      } else {
        falschPunkt = p; weg = [q, soll];
        g.sprich(`Von ${'ABCD'[bilder.length]} ${fmt(q)} aus: <b class="ko-x">${vektor[0]} nach rechts</b>, dann <b class="ko-y">${vektor[1]} nach oben</b>.`, 'tipp');
      }
    } else return;
    zeichne();
  }

  function animiere() {
    const poly = root.querySelector('.ko-form:not(.bild)');
    if (!poly || !poly.animate) return;
    const z = s();
    const geist = poly.cloneNode();
    geist.classList.add('geist');
    poly.parentNode.insertBefore(geist, poly.nextSibling);
    geist.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${vektor[0] * z}px, ${-vektor[1] * z}px)` }],
      { duration: 1400, easing: 'ease-in-out', fill: 'forwards', iterations: 2, direction: 'alternate' });
  }

  function tipp() {
    if (modus === 'stecken' && schritt < fig.punkte.length) { weg = [[0, 0], fig.punkte[schritt]]; zeichne(); g.sprich(`Folge den Pfeilen: erst ${fig.punkte[schritt][0]} nach rechts, dann ${fig.punkte[schritt][1]} nach oben.`, 'tipp'); }
    else if (modus === 'ablesen') { weg = [[0, 0], ablesen]; zeichne(); g.sprich('Zähle zuerst, wie weit der Punkt rechts liegt (blauer Pfeil), dann, wie weit oben (grüner Pfeil).', 'tipp'); }
    else if (modus === 'verschieben' && bilder.length < form.length) { const q = form[bilder.length]; weg = [q, [q[0] + vektor[0], q[1] + vektor[1]]]; zeichne(); g.sprich('Gehe vom Punkt aus genauso wie der rote Pfeil.', 'tipp'); }
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const p = e.target.closest('[data-p]');
    if (p) { steck(p.dataset.p.split(',').map(Number)); return; }
    const b = e.target.closest('[data-ko]');
    if (!b) return;
    if (b.dataset.ko === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.ko === 'tipp') tipp();
    if (b.dataset.ko === 'pruefen') {
      const ok = Number(eing['ko-x']) === ablesen[0] && Number(eing['ko-y']) === ablesen[1] && eing['ko-x'] !== '' && eing['ko-y'] !== '';
      bewertung = ok ? { ok: true, text: `Richtig: ${fmt(ablesen)}` } : { ok: false, text: 'Noch nicht. Erst nach rechts zählen, dann nach oben.' };
      if (!ok) weg = [[0, 0], ablesen];
      zeichne();
    }
  });

  function startText() {
    g.sprich({ stecken: 'Tippe die Punkte der Reihe nach an. Sie werden zu einem Bild verbunden.',
      ablesen: 'Lies die Koordinaten des roten Punktes ab: erst x (rechts), dann y (oben).',
      verschieben: 'Verschiebe die Figur so, wie der rote Pfeil es zeigt. Stecke dafür die Bildpunkte.' }[modus]);
  }

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (root.isConnected) zeichne(); }, 150); });
  neu(); zeichne(); startText();
  requestAnimationFrame(zeichne);
}
