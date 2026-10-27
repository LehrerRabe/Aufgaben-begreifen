/* Mathematik: Quader mit Würfeln füllen.
   Im Schrägbild wird ein Quader mit Zentimeterwürfeln gefüllt: einzeln, als Reihe, als Schicht oder ganz.
   So wird sichtbar: Volumen = Länge · Breite · Höhe. */

import { geruest, zufall, warte, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';

const S = 34, K = 0.5 * Math.SQRT1_2;   // Würfelkante, Verkürzung der Tiefe im Schrägbild

export function starteQuader(root) {
  let modus = 'fuellen';
  let a, b, c, n, eing = {}, bewertung = null, beschaeftigt = false, start, neuAb = Infinity;

  const g = geruest(root, {
    etikett: 'Quader füllen', titel: '',
    reiter: [{ id: 'fuellen', titel: 'Quader füllen' }, { id: 'fehlen', titel: 'Wie viele fehlen?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-qd="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-qd="neu">＋ Neuer Quader</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; eing['qd-v'] = '';
    a = zufall(2, 6); b = zufall(2, 4); c = zufall(2, 4);
    n = 0;
    if (modus === 'fehlen') { const schichten = zufall(0, c - 1), reihen = zufall(0, b - 1); n = schichten * a * b + reihen * a + zufall(0, a - 1); if (n === 0) n = a; }
    start = n;
  }

  /** Reihenfolge: Schicht für Schicht von unten, in jeder Schicht von hinten nach vorn, in jeder Reihe von links nach rechts. */
  const pos = i => { const z = Math.floor(i / (a * b)), r = Math.floor((i % (a * b)) / a), x = i % a; return [x, b - 1 - r, z]; };

  function svg() {
    const W = a * S + b * S * K + 40, H = c * S + b * S * K + 40;
    const P = (x, y, z) => [20 + x * S + y * S * K, H - 20 - z * S - y * S * K];
    const pt = q => q.join(',');
    let wuerfel = '';
    for (let i = 0; i < n; i++) {
      const [x, y, z] = pos(i);
      const vorne = [P(x, y, z), P(x + 1, y, z), P(x + 1, y, z + 1), P(x, y, z + 1)];
      const oben = [P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)];
      const rechts = [P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)];
      const neu = i >= neuAb ? ' neu' : '';
      wuerfel += `<g class="qd-w${neu}${i >= start && modus === 'fehlen' ? ' ergaenzt' : ''}">
        <polygon points="${vorne.map(pt).join(' ')}" class="qd-v"/><polygon points="${oben.map(pt).join(' ')}" class="qd-o"/><polygon points="${rechts.map(pt).join(' ')}" class="qd-r"/></g>`;
    }
    // Kanten des Quaders: verdeckte Kanten gestrichelt
    const L = (p, q, k = '') => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" class="qd-kante ${k}"/>`;
    const e = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0], [0, 0, c], [a, 0, c], [a, b, c], [0, b, c]].map(q => P(...q));
    const verdeckt = L(e[0], e[3], 'hinten') + L(e[3], e[2], 'hinten') + L(e[3], e[7], 'hinten');
    const sichtbar = L(e[0], e[1]) + L(e[1], e[2]) + L(e[1], e[5]) + L(e[2], e[6]) + L(e[0], e[4]) + L(e[4], e[5]) + L(e[5], e[6]) + L(e[6], e[7]) + L(e[7], e[4]);
    const masse = `<text x="${(e[0][0] + e[1][0]) / 2}" y="${e[0][1] + 24}" class="zl-mass">${a} cm</text>
      <text x="${(e[1][0] + e[2][0]) / 2 + 10}" y="${(e[1][1] + e[2][1]) / 2 + 14}" class="zl-mass links">${b} cm</text>
      <text x="${e[0][0] - 8}" y="${(e[0][1] + e[4][1]) / 2 + 6}" class="zl-mass rechts">${c} cm</text>`;
    return `<svg class="qd-svg" viewBox="-30 -10 ${W + 70} ${H + 40}">${verdeckt}${wuerfel}${sichtbar}${masse}</svg>`;
  }

  function links() {
    return `${svg()}
      <div class="fl-knoepfe">
        <button type="button" class="kn-gross" data-qd="1">＋ 1 Würfel</button>
        <button type="button" class="kn-gross" data-qd="reihe">＋ 1 Reihe</button>
        <button type="button" class="kn-gross" data-qd="schicht">＋ 1 Schicht</button>
        <button type="button" class="kn-gross" data-qd="alle">＋ bis voll</button>
        <button type="button" class="kn-gross kn-leise" data-qd="leeren">${modus === 'fehlen' ? 'Zurück zum Anfang' : 'Leeren'}</button>
      </div>
      <p class="fl-zaehler">${modus === 'fehlen' ? `${start} Würfel lagen schon drin${n > start ? ` · ${n - start} dazugelegt` : ''}` : `${n} ${n === 1 ? 'Würfel' : 'Würfel'} = ${n} cm³`}</p>
      <p class="leise">Jeder Würfel ist 1 cm lang, 1 cm breit und 1 cm hoch: 1 cm³ (Kubikzentimeter).</p>`;
  }

  function rechts() {
    const v = a * b * c;
    if (modus === 'fuellen') {
      return `<h2 class="bereich-titel">Wie groß ist das Volumen?</h2>
        <p>Der Quader ist <b>${a} cm</b> lang, <b>${b} cm</b> breit und <b>${c} cm</b> hoch.</p>
        <p class="ut-frage">V = ${zahlFeld('qd-v', eing['qd-v'], 4, 'Volumen')} cm³</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-qd="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${bewertung?.ok ? `<p class="fl-formel">Eine Schicht: ${a} · ${b} = ${a * b} Würfel<br>${c} Schichten: ${a * b} · ${c} = ${v} Würfel<br>V = a · b · c = ${v} cm³</p>` : ''}`;
    }
    return `<h2 class="bereich-titel">Wie viele Würfel fehlen noch?</h2>
      <p>In den Quader (${a} cm · ${b} cm · ${c} cm) wurden schon <b>${start}</b> Würfel gelegt.</p>
      <p class="ut-frage">Es fehlen ${zahlFeld('qd-v', eing['qd-v'], 4, 'fehlende Würfel')} Würfel.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-qd="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${bewertung?.ok ? `<p class="fl-formel">Ganz voll: ${a} · ${b} · ${c} = ${v}<br>Es fehlen: ${v} − ${start} = ${v - start}</p>` : ''}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'fuellen' ? 'Volumen mit Würfeln' : 'Fehlende Würfel');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  async function legen(anzahl) {
    if (beschaeftigt) return;
    beschaeftigt = true;
    const ziel = Math.min(a * b * c, n + anzahl);
    const schritt = anzahl === 1 ? 0 : Math.max(30, Math.min(160, 1600 / anzahl));
    while (n < ziel) {
      neuAb = n; n++;
      g.links.innerHTML = links();
      await warte(schritt);
    }
    neuAb = Infinity;
    beschaeftigt = false;
    g.links.innerHTML = links();
    if (n === a * b * c && modus === 'fuellen') g.sprich(`Voll! ${c} Schichten mit je ${a} · ${b} = ${a * b} Würfeln.`, 'fertig');
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const bt = e.target.closest('[data-qd]');
    if (!bt) return;
    const was = bt.dataset.qd;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === '1') legen(1);
    if (was === 'reihe') legen(a - (n % a) || a);
    if (was === 'schicht') legen(a * b - (n % (a * b)) || a * b);
    if (was === 'alle') legen(a * b * c - n);
    if (was === 'leeren') { n = modus === 'fehlen' ? start : 0; g.links.innerHTML = links(); }
    if (was === 'pruefen') {
      const soll = modus === 'fuellen' ? a * b * c : a * b * c - start;
      const ok = Number(eing['qd-v']) === soll && eing['qd-v'] !== '';
      bewertung = ok ? { ok, text: `Richtig: ${soll}${modus === 'fuellen' ? ' cm³' : ' Würfel'}` }
        : { ok, text: modus === 'fuellen' && Number(eing['qd-v']) === a * b ? 'Das ist nur eine Schicht. Wie viele Schichten passen übereinander?' : 'Noch nicht. Fülle den Quader und zähle Schicht für Schicht.' };
      g.rechts.innerHTML = rechts();
    }
    if (was === 'tipp') g.sprich(`Unten passt eine Schicht aus ${b} Reihen mit je ${a} Würfeln. Wie viele Schichten passen übereinander?`, 'tipp');
  });

  function startText() {
    g.sprich(modus === 'fuellen' ? 'Fülle den Quader mit Zentimeterwürfeln. Wie viele passen hinein?' : 'Der Quader ist schon teilweise gefüllt. Wie viele Würfel fehlen, bis er voll ist?');
  }

  neu(); zeichne(); startText();
}
