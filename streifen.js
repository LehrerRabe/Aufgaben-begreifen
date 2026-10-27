/* Mathematik: Rechengeschichten mit dem Streifenmodell.
   1. Welches Streifenbild passt zur Geschichte?  2. Welche Rechnung passt?  3. Ausrechnen.
   Typen: zusammen, wegnehmen, Unterschied, Vielfaches, Verteilen. */

import { geruest, zufall, wahl, mischen, antwortHtml, zahlenMerken, zahlFeld, ESC } from './geruest.js';

/** Neutrale Proportionen für die Auswahlbilder (ohne Zahlen). */
const MUSTER = { zusammen: [3, 2], weg: [5, 2], unterschied: [5, 3], vielfach: [1, 3], verteilen: [12, 4] };

const NAMEN = ['Lea', 'Tom', 'Mia', 'Ben', 'Emma', 'Noah', 'Lina', 'Paul', 'Ali', 'Sofia'];
const DINGE = ['Murmeln', 'Sticker', 'Karten', 'Euro', 'Bücher', 'Punkte'];

function aufgabe() {
  const typ = wahl(['zusammen', 'weg', 'unterschied', 'vielfach', 'verteilen']);
  const [x, y] = mischen(NAMEN), d = wahl(DINGE);
  if (typ === 'zusammen') { const a = zufall(12, 60), b = zufall(8, 40); return { typ, text: `${x} hat ${a} ${d}, ${y} hat ${b} ${d}. Wie viele ${d} haben beide zusammen?`, a, b, op: '+', soll: a + b }; }
  if (typ === 'weg') { const a = zufall(30, 90), b = zufall(8, a - 5); return { typ, text: `${x} hat ${a} ${d}. ${x} verschenkt ${b} davon. Wie viele ${d} bleiben übrig?`, a, b, op: '−', soll: a - b }; }
  if (typ === 'unterschied') { const b = zufall(10, 45), a = b + zufall(5, 30); return { typ, text: `${x} hat ${a} ${d}, ${y} hat ${b} ${d}. Wie viele ${d} hat ${x} mehr als ${y}?`, a, b, op: '−', soll: a - b }; }
  if (typ === 'vielfach') { const b = zufall(3, 12), f = zufall(2, 5); return { typ, text: `${y} hat ${b} ${d}. ${x} hat ${f}-mal so viele. Wie viele ${d} hat ${x}?`, a: b, b: f, op: '·', soll: b * f }; }
  const k = zufall(2, 6), q = zufall(3, 12);
  return { typ, text: `${x} verteilt ${k * q} ${d} gerecht an ${k} Kinder. Wie viele ${d} bekommt jedes Kind?`, a: k * q, b: k, op: ':', soll: q };
}

/** Streifenbild als SVG. Länge proportional zu den Zahlen, das Gesuchte als „?“. */
function streifenbild(typ, a, b, mitZahlen = true) {
  const W = 300, H = 110;
  const box = (x, y, w, text, f, gestrichelt = false) => `<rect x="${x}" y="${y}" width="${Math.max(w, 6)}" height="28" rx="4" fill="${f}" stroke="#1b2340" stroke-width="2" ${gestrichelt ? 'stroke-dasharray="6 4"' : ''}/>${text !== '' ? `<text x="${x + w / 2}" y="${y + 19}" class="sm-t">${text}</text>` : ''}`;
  const klammer = (x1, x2, y, text, oben = false) => {
    const dy = oben ? -1 : 1;
    return `<path d="M${x1} ${y} q0 ${8 * dy} 8 ${8 * dy} H${(x1 + x2) / 2 - 6} l6 ${6 * dy} l6 ${-6 * dy} H${x2 - 8} q8 0 8 ${-8 * dy}" fill="none" stroke="#1b2340" stroke-width="2"/><text x="${(x1 + x2) / 2}" y="${y + (oben ? -18 : 32)}" class="sm-t">${text}</text>`;
  };
  const z = v => (mitZahlen ? v : '');
  let s = '';
  if (typ === 'zusammen') {
    const s1 = (a / (a + b)) * 280;
    s = box(10, 30, s1, z(a), '#9cc4ff') + box(10 + s1, 30, 280 - s1, z(b), '#ffd98a') + klammer(10, 290, 62, '?');
  } else if (typ === 'weg') {
    const s1 = (b / a) * 280;
    s = box(10, 30, 280 - s1, '?', '#9cc4ff') + box(290 - s1, 30, s1, z(b), '#ffb3b3', true) + klammer(10, 290, 26, z(a), true);
  } else if (typ === 'unterschied') {
    const sa = 280, sb = (b / a) * 280;
    s = box(10, 8, sa, z(a), '#9cc4ff') + box(10, 52, sb, z(b), '#ffd98a') + `<rect x="${10 + sb}" y="52" width="${sa - sb}" height="28" rx="4" fill="none" stroke="#e0262b" stroke-width="2" stroke-dasharray="6 4"/><text x="${10 + sb + (sa - sb) / 2}" y="71" class="sm-t rot">?</text>`;
  } else if (typ === 'vielfach') {
    const e = 280 / (b + 1);
    s = box(10, 8, e, z(a), '#ffd98a');
    for (let i = 0; i < b; i++) s += box(10 + i * e, 52, e, z(a), '#9cc4ff');
    s += klammer(10, 10 + b * e, 84, '?');
  } else {
    const e = 280 / b;
    for (let i = 0; i < b; i++) s += box(10 + i * e, 30, e, i === 0 ? '?' : '', '#9cc4ff');
    s += klammer(10, 290, 26, z(a), true);
  }
  return `<svg class="sm-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
}

export function starteStreifen(root) {
  let auf, schritt, bildWahl, termWahl, bilder, terme, eing = {}, bewertung = null;

  const g = geruest(root, {
    etikett: 'Rechengeschichten', titel: 'Geschichte – Bild – Rechnung',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-sm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-sm="neu">＋ Neue Geschichte</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    auf = aufgabe(); schritt = 1; bildWahl = null; termWahl = null; bewertung = null; eing['sm-e'] = '';
    const typen = ['zusammen', 'weg', 'unterschied', 'vielfach', 'verteilen'];
    bilder = mischen([auf.typ, ...mischen(typen.filter(t => t !== auf.typ)).slice(0, 2)]);
    const { a, b } = auf;
    const alle = [`${a} + ${b}`, `${a} − ${b}`, `${a} · ${b}`, `${a} : ${b}`, `${b} − ${a}`].filter((t, i) => !(i === 3 && a % b) && !(i === 4 && b < a));
    const richtig = `${a} ${auf.op} ${b}`;
    terme = mischen([richtig, ...mischen(alle.filter(t => t !== richtig)).slice(0, 3)]);
  }

  function links() {
    return `<p class="tl-geschichte">${ESC(auf.text)}</p>
      <h3 class="eh-zwischen">1. Welches Bild passt?</h3>
      <div class="sm-bilder">${bilder.map(t => `<button type="button" class="sm-bild${bildWahl === t ? (t === auf.typ ? ' richtig' : ' falsch') : ''}" data-bild="${t}" ${schritt > 1 ? 'disabled' : ''}>${schritt > 1 && t === auf.typ ? streifenbild(t, auf.a, auf.b, true) : streifenbild(t, ...MUSTER[t], false)}</button>`).join('')}</div>`;
  }

  function rechts() {
    let h = '';
    if (schritt >= 2) {
      h += `<h3 class="eh-zwischen">2. Welche Rechnung passt?</h3>
        <div class="sm-terme">${terme.map(t => `<button type="button" class="kn-gross${termWahl === t ? (t === `${auf.a} ${auf.op} ${auf.b}` ? ' richtig' : ' falsch') : ''}" data-term="${t}" ${schritt > 2 ? 'disabled' : ''}>${t}</button>`).join('')}</div>`;
    }
    if (schritt >= 3) {
      h += `<h3 class="eh-zwischen">3. Rechne aus</h3>
        <p class="kr-aufgabe">${auf.a} ${auf.op} ${auf.b} = ${zahlFeld('sm-e', eing['sm-e'], 4, 'Ergebnis')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-sm="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    return `<h2 class="bereich-titel">Schritt ${Math.min(schritt, 3)} von 3</h2>${schritt === 1 ? '<p>Die Streifen zeigen, wie die Zahlen zusammenhängen. Das Fragezeichen ist das Gesuchte.</p>' : ''}${h}`;
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  const ERKL = {
    zusammen: 'Zwei Teile werden zusammengelegt – gesucht ist das Ganze.',
    weg: 'Vom Ganzen wird ein Teil weggenommen – gesucht ist, was bleibt.',
    unterschied: 'Zwei Streifen werden verglichen – gesucht ist das Stück, das der längere mehr hat.',
    vielfach: 'Der lange Streifen besteht aus mehreren gleichen kurzen Streifen.',
    verteilen: 'Das Ganze wird in gleich große Teile geteilt – gesucht ist ein Teil.',
  };

  root.addEventListener('click', e => {
    const bi = e.target.closest('[data-bild]');
    if (bi && schritt === 1) {
      bildWahl = bi.dataset.bild;
      if (bildWahl === auf.typ) { schritt = 2; g.sprich(`Richtig! ${ERKL[auf.typ]}`, 'fertig'); }
      else g.sprich(`Dieses Bild zeigt: ${ERKL[bildWahl]} Passt das zur Geschichte?`, 'tipp');
      zeichne(); return;
    }
    const te = e.target.closest('[data-term]');
    if (te && schritt === 2) {
      termWahl = te.dataset.term;
      if (termWahl === `${auf.a} ${auf.op} ${auf.b}`) { schritt = 3; g.sprich('Genau – die Rechnung passt zum Bild.', 'fertig'); }
      else g.sprich('Schau auf das Bild: Werden Teile zusammengelegt, weggenommen, verglichen, vervielfacht oder verteilt?', 'tipp');
      zeichne(); root.querySelector('#sm-e')?.focus({ preventScroll: true }); return;
    }
    const b = e.target.closest('[data-sm]');
    if (!b) return;
    if (b.dataset.sm === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.sm === 'pruefen') {
      const ok = Number(eing['sm-e']) === auf.soll && eing['sm-e'] !== '';
      bewertung = ok ? { ok, text: `Richtig: ${auf.soll}` } : { ok, text: 'Noch nicht – rechne noch einmal.' };
      if (ok) g.sprich('Super! Geschichte, Bild und Rechnung passen zusammen.', 'fertig');
      g.rechts.innerHTML = rechts();
    }
    if (b.dataset.sm === 'tipp') g.sprich(schritt === 1 ? 'Frage dich: Was ist bekannt, was wird gesucht? Wird etwas mehr, weniger, verglichen oder geteilt?' : ERKL[auf.typ], 'tipp');
  });

  function start() { g.sprich('Lies die Geschichte und finde das passende Streifenbild.'); }
  neu(); zeichne(); start();
}
