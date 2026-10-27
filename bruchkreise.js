/* Mathematik: Bruchkreise.
   Ein Kreis wird in gleich große Teile geteilt. Rote Teile zeigen den Bruch.
   Darstellen und Vergleichen: Beim Vergleichen werden die Kreise von Hand waagerecht verschoben;
   liegen sie fast übereinander, rasten sie genau übereinander ein. Erweitern/Kürzen steht in bruchumformen.js;
   der alte Modus 'erweitern' ist hier nicht mehr erreichbar (kein Reiter). */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, bruchFeld, zahlenMerken, ggT, warte } from './geruest.js';

const NAMEN = ['', 'Ganze', 'Halbe', 'Drittel', 'Viertel', 'Fünftel', 'Sechstel', 'Siebtel', 'Achtel', 'Neuntel', 'Zehntel', 'Elftel', 'Zwölftel'];

/** Kreis in n Teile, gefüllt = Menge der Teilnummern (oder Anzahl ab 0). */
export function kreisSvg(n, gefuellt, { klick = false, beschriften = true, klasse = '', farbe = 'rot', neu = false } = {}) {
  const voll = typeof gefuellt === 'number' ? new Set([...Array(gefuellt).keys()]) : gefuellt;
  const R = 100, C = 110;
  let teile = '', linien = '';
  if (n === 1) {
    teile = `<circle cx="${C}" cy="${C}" r="${R}" class="bk-teil ${voll.has(0) ? farbe : ''}" ${klick ? 'data-teil="0"' : ''}/>`;
  } else {
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
      const p = a => [(C + R * Math.cos(a)).toFixed(2), (C + R * Math.sin(a)).toFixed(2)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      teile += `<path d="M${C} ${C} L${x0} ${y0} A${R} ${R} 0 ${n === 2 ? 0 : 0} 1 ${x1} ${y1}Z" class="bk-teil ${voll.has(i) ? farbe : ''}" ${klick ? `data-teil="${i}"` : ''}/>`;
      linien += `<line x1="${C}" y1="${C}" x2="${x0}" y2="${y0}" class="bk-linie${neu ? ' neu' : ''}"/>`;
      if (beschriften && n <= 10) {
        const am = (a0 + a1) / 2, r = n <= 4 ? 58 : 68;
        teile += `<text x="${(C + r * Math.cos(am)).toFixed(1)}" y="${(C + r * Math.sin(am) + 5).toFixed(1)}" class="bk-beschr${voll.has(i) ? ' auf-farbe' : ''}">1/${n}</text>`;
      }
    }
  }
  return `<svg class="bk-kreis ${klasse}" viewBox="0 0 220 220" role="img" aria-label="Kreis in ${n} Teilen, ${voll.size} gefärbt">
    <circle cx="${C}" cy="${C}" r="${R + 6}" class="bk-rahmen"/>${teile}${linien}<circle cx="${C}" cy="${C}" r="${R}" class="bk-rand"/></svg>`;
}

export function starteBruchkreise(root) {
  let modus = 'darstellen';
  let eing = {}, bewertung = null;
  // darstellen
  let ziel, n, gewaehlt;
  // vergleichen
  let paar, wahlZ, posA, posB;   // Position der Kreise in % der Breite (0 … MAXPOS)
  const MAXPOS = 53.5, FANG = 6;
  // erweitern
  let aufgabe, basis, k;

  const g = geruest(root, {
    etikett: 'Bruchkreise', titel: '',
    reiter: [{ id: 'darstellen', titel: 'Darstellen', unter: 'Teile legen' }, { id: 'vergleichen', titel: 'Vergleichen', unter: 'übereinanderlegen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bk="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bk="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; Object.keys(eing).forEach(x => (eing[x] = ''));
    if (modus === 'darstellen') {
      const b = zufall(2, 10); ziel = [zufall(1, b - 1), b]; n = null; gewaehlt = new Set();
    }
    if (modus === 'vergleichen') {
      wahlZ = null; posA = 0; posB = MAXPOS;
      let a, b, c, d;
      do {
        b = zufall(2, 10); d = zufall(2, 10); a = zufall(1, b - 1); c = zufall(1, d - 1);
        if (Math.random() < 0.25) { const f = zufall(2, 3); if (b * f <= 10) { [c, d] = [a * f, b * f]; } }
      } while ((a === c && b === d) || (b === d && Math.random() < 0.6));
      paar = Math.random() < 0.5 ? [[a, b], [c, d]] : [[c, d], [a, b]];
    }
    if (modus === 'erweitern') {
      const art = wahl(['erweitern', 'kuerzen']);
      let a, b, f;
      do { b = zufall(2, 6); a = zufall(1, b - 1); f = zufall(2, 4); } while (ggT(a, b) !== 1 || b * f > 12);
      aufgabe = { art, a, b, f };
      basis = art === 'erweitern' ? [a, b] : [a * f, b * f]; k = 1;
    }
  }

  const cmp = (p, q) => Math.sign(p[0] * q[1] - q[0] * p[1]);
  const zeichen = s => (s < 0 ? '<' : s > 0 ? '>' : '=');

  function links() {
    if (modus === 'darstellen') {
      return `<div class="bk-buehne">${n ? kreisSvg(n, gewaehlt, { klick: true }) : kreisSvg(1, new Set(), { beschriften: false, klasse: 'leer' })}</div>
        <p class="leise">${n ? 'Tippe Teile an, um sie rot zu färben.' : 'Wähle zuerst, in wie viele Teile der Kreis geteilt ist.'}</p>
        <div class="bk-wahl" role="group" aria-label="Kreis wählen">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<button type="button" class="bk-mini${n === i ? ' gewaehlt' : ''}" data-n="${i}">${kreisSvg(i, new Set(), { beschriften: false })}<small>${NAMEN[i]}</small></button>`).join('')}
        </div>`;
    }
    if (modus === 'vergleichen') {
      const [p, q] = paar;
      return `<div class="bk-paar${Math.abs(posA - posB) < 46.5 ? ' drauf' : ''}">
          <div class="bk-a" data-zieh="a" style="left:${posA}%" aria-label="Roter Kreis ${p[0]}/${p[1]} – waagerecht verschieben">${kreisSvg(p[1], p[0], { beschriften: false })}<span class="bk-schild">${bruchHtml(p[0], p[1])}</span></div>
          <div class="bk-b" data-zieh="b" style="left:${posB}%" aria-label="Blauer Kreis ${q[0]}/${q[1]} – waagerecht verschieben">${kreisSvg(q[1], q[0], { farbe: "blau", beschriften: false })}<span class="bk-schild">${bruchHtml(q[0], q[1])}</span></div>
        </div>
        <p class="leise bk-ziehtext">↔ Schiebe die Kreise mit dem Finger übereinander.</p>`;
    }
    const [a, b] = basis;
    const nn = b * k, zz = a * k;
    const feiner = [2, 3].filter(f => nn * f <= 12);
    const groeber = [2, 3, 4, 5, 6].filter(f => zz % f === 0 && nn % f === 0);
    return `<div class="bk-buehne">${kreisSvg(nn, zz, { neu: true })}</div>
      <p class="bk-gross">${bruchHtml(zz, nn)}</p>
      <div class="bk-teilen">
        <div><b>Feiner teilen</b> (erweitern)<br>${feiner.length ? feiner.map(f => `<button type="button" class="kn-gross" data-feiner="${f}">jedes Teil in ${f}</button>`).join(' ') : '<span class="leise">feiner geht hier nicht</span>'}</div>
        <div><b>Gröber teilen</b> (kürzen)<br>${groeber.length ? groeber.map(f => `<button type="button" class="kn-gross" data-groeber="${f}">je ${f} Teile zusammen</button>`).join(' ') : '<span class="leise">gröber geht nicht mehr</span>'}</div>
      </div>`;
  }

  function rechts() {
    if (modus === 'darstellen') {
      return `<h2 class="bereich-titel">Lege den Bruch</h2>
        <p class="bk-gross">${bruchHtml(ziel[0], ziel[1])}</p>
        <p>${ziel[0]} ${ziel[0] === 1 ? 'Teil' : 'Teile'} von ${ziel[1]} gleich großen Teilen.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bk="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    if (modus === 'vergleichen') {
      const [p, q] = paar;
      return `<h2 class="bereich-titel">Welcher Bruch ist größer?</h2>
        <p class="bk-gross">${bruchHtml(p[0], p[1])} <span class="bk-zeichen">${wahlZ ?? '?'}</span> ${bruchHtml(q[0], q[1])}</p>
        <div class="bk-zeichenwahl">${['<', '=', '>'].map(z => `<button type="button" class="kn-gross${wahlZ === z ? ' gewaehlt' : ''}" data-z="${z}">${z}</button>`).join('')}</div>
        ${posA !== 0 || posB !== MAXPOS ? '<div class="gs-pruef"><button type="button" class="kn-gross kn-leise" data-bk="start">↺ Wieder nebeneinander</button></div>' : ''}
        ${antwortHtml(bewertung)}`;
    }
    const { art, a, b, f } = aufgabe;
    if (art === 'erweitern') {
      return `<h2 class="bereich-titel">Erweitern</h2>
        <p>Wie viele ${NAMEN[b * f]} sind so viel wie ${bruchHtml(a, b, 'klein')}?</p>
        <p class="bk-gross">${bruchHtml(a, b)} = <span class="bruch bruch-ein">${zahlFeldZ()}<span>${b * f}</span></span></p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bk="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Teile den Kreis links feiner und zähle die roten Teile.</p>`;
    }
    return `<h2 class="bereich-titel">Kürzen</h2>
      <p>Kürze so weit wie möglich. Gröber teilen heißt: Teile zusammenfassen.</p>
      <p class="bk-gross">${bruchHtml(a * f, b * f)} = ${bruchFeld('bk-z', 'bk-n', eing)}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bk="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }
  const zahlFeldZ = () => `<input class="gs-ein" id="bk-z" data-zahl inputmode="numeric" maxlength="3" value="${eing['bk-z'] ?? ''}" aria-label="Zähler">`;

  function zeichne() {
    g.reiter(modus);
    g.titel({ darstellen: 'Brüche legen', vergleichen: 'Brüche vergleichen', erweitern: 'Erweitern und Kürzen' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  function pruefen() {
    if (modus === 'darstellen') {
      if (!n) { bewertung = { ok: false, text: 'Wähle zuerst einen Kreis.' }; zeichne(); return; }
      const z = gewaehlt.size;
      if (z * ziel[1] === ziel[0] * n) {
        bewertung = { ok: true, text: n === ziel[1] ? 'Richtig gelegt!' : `Richtig! ${z}/${n} ist genauso viel wie ${ziel[0]}/${ziel[1]}.` };
        g.sprich(`${ziel[0]} von ${ziel[1]} Teilen sind rot.`, 'fertig');
      } else if (n !== ziel[1] && (ziel[0] * n) % ziel[1] !== 0) {
        bewertung = { ok: false, text: `Mit ${NAMEN[n]} kann man ${ziel[0]}/${ziel[1]} nicht genau legen. Nimm ${NAMEN[ziel[1]]}.` };
      } else {
        bewertung = { ok: false, text: z * ziel[1] > ziel[0] * n ? 'Das ist zu viel.' : 'Das ist noch zu wenig.' };
      }
    }
    if (modus === 'erweitern') {
      const { art, a, b, f } = aufgabe;
      if (art === 'erweitern') {
        const ok = Number(eing['bk-z']) === a * f;
        bewertung = ok ? { ok, text: `Richtig: ${a}/${b} = ${a * f}/${b * f}. Zähler und Nenner wurden mit ${f} multipliziert.` } : { ok, text: `Noch nicht. Teile den Kreis in ${NAMEN[b * f]} und zähle die roten Teile.` };
      } else {
        const z = Number(eing['bk-z']), nn = Number(eing['bk-n']);
        const ok = z === a && nn === b;
        const gleich = z && nn && z * b === a * nn;
        bewertung = ok ? { ok, text: `Richtig: ${a * f}/${b * f} = ${a}/${b}. Zähler und Nenner wurden durch ${f} geteilt.` }
          : { ok: false, text: gleich ? `${z}/${nn} ist gleich viel – aber man kann noch weiter kürzen.` : 'Das ist nicht gleich viel. Fasse im Kreis Teile zusammen.' };
      }
      if (bewertung.ok) g.sprich('Die rote Fläche bleibt gleich groß – nur die Teilung ändert sich.', 'fertig');
    }
    zeichne();
  }

  function tipp() {
    if (modus === 'darstellen') g.sprich(`Der Nenner ${ziel[1]} sagt, in wie viele gleiche Teile der Kreis geteilt ist: ${NAMEN[ziel[1]]}. Der Zähler ${ziel[0]} sagt, wie viele davon rot sind.`, 'tipp');
    if (modus === 'vergleichen') {
      const [p, q] = paar;
      g.sprich(p[1] === q[1] ? 'Gleiche Teile: Wer mehr Teile hat, hat mehr.' : p[0] === q[0] ? 'Gleich viele Teile: Je weniger Teile der Kreis hat, desto größer ist jedes Teil.' : 'Schiebe die Kreise übereinander. Welche Farbe reicht weiter?', 'tipp');
    }
    if (modus === 'erweitern') g.sprich(aufgabe.art === 'erweitern' ? `Tippe auf „jedes Teil in ${aufgabe.f}“. Dann zähle die roten Teile.` : 'Fasse immer gleich viele Teile zusammen, bis es nicht mehr geht.', 'tipp');
  }

  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const nb = e.target.closest('[data-n]');
    if (nb) { n = Number(nb.dataset.n); gewaehlt = new Set(); bewertung = null; zeichne(); return; }
    const t = e.target.closest('[data-teil]');
    if (t) { const i = Number(t.dataset.teil); gewaehlt.has(i) ? gewaehlt.delete(i) : gewaehlt.add(i); bewertung = null; zeichne(); return; }
    const z = e.target.closest('[data-z]');
    if (z) {
      wahlZ = z.dataset.z;
      const s = zeichen(cmp(paar[0], paar[1]));
      bewertung = wahlZ === s ? { ok: true, text: 'Richtig!' } : { ok: false, text: 'Leider nicht. Schiebe die Kreise übereinander und vergleiche.' };
      zeichne();
      if (wahlZ === s) g.sprich(s === '=' ? 'Beide roten Flächen sind genau gleich groß.' : 'Übereinander sieht man: Die eine rote Fläche reicht weiter.', 'fertig');
      return;
    }
    const fe = e.target.closest('[data-feiner]');
    if (fe) { k *= Number(fe.dataset.feiner); zeichne(); g.sprich(`Jedes Teil wurde in ${fe.dataset.feiner} geteilt: Zähler und Nenner mal ${fe.dataset.feiner}.`); return; }
    const gr = e.target.closest('[data-groeber]');
    if (gr) {
      const f = Number(gr.dataset.groeber);
      // basis * k / f: zurück auf ganze Zahlen
      let [a, b] = [basis[0] * k, basis[1] * k];
      basis = [a / f, b / f]; k = 1;
      zeichne(); g.sprich(`Je ${f} Teile wurden zu einem zusammengefasst: Zähler und Nenner geteilt durch ${f}.`); return;
    }
    const b = e.target.closest('[data-bk]');
    if (!b) return;
    if (b.dataset.bk === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.bk === 'tipp') tipp();
    if (b.dataset.bk === 'pruefen') pruefen();
    if (b.dataset.bk === 'start') { posA = 0; posB = MAXPOS; zeichne(); }
  });

  /* ---------- Kreise waagerecht verschieben ---------- */
  let zug = null;
  root.addEventListener('pointerdown', e => {
    const k = e.target.closest('[data-zieh]');
    if (!k || modus !== 'vergleichen') return;
    const paarEl = k.parentElement;
    zug = { k, wer: k.dataset.zieh, x0: e.clientX, p0: k.dataset.zieh === 'a' ? posA : posB, breite: paarEl.getBoundingClientRect().width, bewegt: false };
    k.setPointerCapture(e.pointerId);
    k.classList.add('ziehen');
    paarEl.querySelectorAll('[data-zieh]').forEach(x => x.classList.toggle('oben', x === k));
  });
  root.addEventListener('pointermove', e => {
    if (!zug) return;
    const p = Math.max(0, Math.min(MAXPOS, zug.p0 + ((e.clientX - zug.x0) / zug.breite) * 100));
    if (Math.abs(e.clientX - zug.x0) > 3) zug.bewegt = true;
    if (zug.wer === 'a') posA = p; else posB = p;
    zug.k.style.left = p + '%';
    zug.k.parentElement.classList.toggle('drauf', Math.abs(posA - posB) < 46.5);
  });
  const loslassen = () => {
    if (!zug) return;
    const { k } = zug;
    k.classList.remove('ziehen');
    let eingerastet = false;
    if (Math.abs(posA - posB) <= FANG && posA !== posB) {   // fast übereinander → einrasten
      if (zug.wer === 'a') posA = posB; else posB = posA;
      k.style.left = (zug.wer === 'a' ? posA : posB) + '%';
      eingerastet = true;
    }
    zug = null;
    const knopf = root.querySelector('[data-bk="start"]');
    if (!knopf) g.rechts.innerHTML = rechts();
    if (eingerastet || posA === posB) g.sprich('Genau übereinander! Welche Farbe reicht weiter – oder sind beide gleich groß?');
  };
  root.addEventListener('pointerup', loslassen);
  root.addEventListener('pointercancel', loslassen);

  function startText() {
    g.sprich({
      darstellen: 'Wähle den passenden Kreis und färbe so viele Teile, wie der Zähler sagt.',
      vergleichen: 'Welcher Bruch ist größer? Wähle <, = oder >. Schiebe die Kreise übereinander, um es zu sehen.',
      erweitern: 'Teile den Kreis feiner oder gröber. Die rote Fläche bleibt immer gleich groß.',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
