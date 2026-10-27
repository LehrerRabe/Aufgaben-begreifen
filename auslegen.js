/* Mathematik: Flächen auslegen.
   Ein Rechteck wird mit Einheitsquadraten (1 cm²) ausgelegt: einzeln, reihenweise oder alle Reihen auf einmal.
   So wird sichtbar: Flächeninhalt = Anzahl der Quadrate = Länge · Breite. */

import { geruest, zufall, warte, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';

export function starteAuslegen(root) {
  let modus = 'auslegen';
  let a, b, gelegt, eing = {}, bewertung = null, beschaeftigt = false;
  let zielA;   // Seite gesucht: Flächeninhalt vorgegeben

  const g = geruest(root, {
    etikett: 'Flächen auslegen', titel: '',
    reiter: [{ id: 'auslegen', titel: 'Rechteck auslegen' }, { id: 'seite', titel: 'Seite gesucht', unter: 'Fläche ist bekannt' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-fl="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-fl="neu">＋ Neues Rechteck</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; gelegt = new Set(); ['fl-a', 'fl-b'].forEach(k => (eing[k] = ''));
    a = zufall(3, 9); b = zufall(2, 6);
    if (modus === 'seite') { zielA = a * b; }
  }

  /** a = Länge (waagerecht), b = Breite (senkrecht). In „Seite gesucht“ ist b unbekannt. */
  function brett() {
    const hoehe = modus === 'seite' ? 8 : b;
    let zellen = '';
    for (let r = 0; r < hoehe; r++) for (let c = 0; c < a; c++) {
      const k = r * a + c;
      zellen += `<button type="button" class="fl-z${gelegt.has(k) ? ' gelegt' : ''}" data-z="${k}" aria-label="Feld ${r + 1}, ${c + 1}"></button>`;
    }
    const reihen = Math.ceil(gelegt.size / a);
    return `<div class="fl-wrap">
      <div class="fl-mass-o">${a} cm</div>
      <div class="fl-mitte">
        ${modus === 'auslegen' ? `<div class="fl-mass-l"><span>${b} cm</span></div>` : '<div class="fl-mass-l"><span>? cm</span></div>'}
        <div class="fl-rechteck${modus === 'seite' ? ' offen' : ''}" style="--a:${a}; --b:${hoehe}">${zellen}</div>
      </div>
    </div>
    <div class="fl-knoepfe">
      <button type="button" class="kn-gross" data-fl="eins">＋ 1 Quadrat</button>
      <button type="button" class="kn-gross" data-fl="reihe">＋ 1 Reihe</button>
      ${modus === 'auslegen' ? '<button type="button" class="kn-gross" data-fl="alle">＋ alle Reihen</button>' : ''}
      <button type="button" class="kn-gross kn-leise" data-fl="leeren">Leeren</button>
    </div>
    <p class="fl-zaehler">${gelegt.size} ${gelegt.size === 1 ? 'Quadrat' : 'Quadrate'} = ${gelegt.size} cm²${reihen && gelegt.size % a === 0 ? ` · ${reihen} ${reihen === 1 ? 'Reihe' : 'Reihen'} mit je ${a}` : ''}</p>
    <p class="leise">Jedes Quadrat ist 1 cm lang und 1 cm breit: 1 cm² (Quadratzentimeter).</p>`;
  }

  function rechts() {
    if (modus === 'auslegen') {
      return `<h2 class="bereich-titel">Wie groß ist die Fläche?</h2>
        <p>Das Rechteck ist <b>${a} cm</b> lang und <b>${b} cm</b> breit.</p>
        <p class="ut-frage">A = ${zahlFeld('fl-a', eing['fl-a'], 3, 'Flächeninhalt')} cm²</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-fl="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${bewertung?.ok ? `<p class="fl-formel">A = Länge · Breite<br>A = ${a} cm · ${b} cm = ${a * b} cm²</p>` : ''}`;
    }
    return `<h2 class="bereich-titel">Wie breit ist das Rechteck?</h2>
      <p>Das Rechteck hat einen Flächeninhalt von <b>${zielA} cm²</b>. Es ist <b>${a} cm</b> lang.</p>
      <p class="ut-frage">Breite = ${zahlFeld('fl-b', eing['fl-b'], 2, 'Breite')} cm</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-fl="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${bewertung?.ok ? `<p class="fl-formel">${zielA} cm² : ${a} cm = ${b} cm<br>denn ${a} · ${b} = ${zielA}</p>` : ''}
      <p class="leise">Lege Reihen zu je ${a} Quadraten, bis ${zielA} Quadrate liegen.</p>`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'auslegen' ? 'Flächen mit Quadraten auslegen' : 'Fehlende Seite finden');
    g.links.innerHTML = brett();
    g.rechts.innerHTML = rechts();
  }

  const max = () => (modus === 'seite' ? 8 * a : a * b);

  async function legen(anzahl, schritt = 60) {
    if (beschaeftigt) return;
    beschaeftigt = true;
    for (let i = 0; i < anzahl && gelegt.size < max(); i++) {
      let k = 0; while (gelegt.has(k)) k++;
      gelegt.add(k);
      const el = root.querySelector(`[data-z="${k}"]`);
      if (el) { el.classList.add('gelegt', 'neu'); }
      root.querySelector('.fl-zaehler').textContent = `${gelegt.size} ${gelegt.size === 1 ? 'Quadrat' : 'Quadrate'} = ${gelegt.size} cm²`;
      await warte(schritt);
    }
    beschaeftigt = false;
    g.links.innerHTML = brett();
    if (modus === 'auslegen' && gelegt.size === a * b) g.sprich(`Ausgelegt: ${b} Reihen mit je ${a} Quadraten – das sind ${b} · ${a} = ${a * b} Quadrate.`, 'fertig');
    if (modus === 'seite' && gelegt.size === zielA) g.sprich(`${zielA} Quadrate liegen – in ${b} Reihen.`, 'fertig');
    if (modus === 'seite' && gelegt.size > zielA) g.sprich(`Jetzt liegen mehr als ${zielA} Quadrate. Nimm wieder welche weg.`, 'tipp');
  }

  function pruefen() {
    if (modus === 'auslegen') {
      const ok = Number(eing['fl-a']) === a * b;
      bewertung = ok ? { ok, text: `Richtig: ${a * b} cm²` } : { ok, text: 'Noch nicht. Lege das Rechteck aus und zähle die Quadrate.' };
    } else {
      const ok = Number(eing['fl-b']) === b;
      bewertung = ok ? { ok, text: `Richtig: ${b} cm breit` } : { ok, text: `Noch nicht. Wie viele Reihen mit je ${a} Quadraten brauchst du für ${zielA} Quadrate?` };
    }
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const z = e.target.closest('[data-z]');
    if (z) { const k = Number(z.dataset.z); gelegt.has(k) ? gelegt.delete(k) : gelegt.add(k); g.links.innerHTML = brett(); return; }
    const b2 = e.target.closest('[data-fl]');
    if (!b2) return;
    const was = b2.dataset.fl;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'eins') legen(1);
    if (was === 'reihe') legen(a, 70);
    if (was === 'alle') legen(max(), 25);
    if (was === 'leeren') { gelegt = new Set(); g.links.innerHTML = brett(); }
    if (was === 'pruefen') pruefen();
    if (was === 'tipp') g.sprich(modus === 'auslegen'
      ? `In eine Reihe passen ${a} Quadrate. Wie viele solche Reihen passen übereinander? Dann rechne: Reihen · Quadrate pro Reihe.`
      : `Eine Reihe hat ${a} Quadrate. Lege Reihe für Reihe und zähle mit: ${a}, ${2 * a}, ${3 * a}, …`, 'tipp');
  });

  function startText() {
    g.sprich(modus === 'auslegen'
      ? 'Lege das Rechteck mit Quadraten aus. Du kannst einzelne Quadrate, eine ganze Reihe oder alle Reihen legen.'
      : 'Die Länge und die Fläche sind bekannt. Lege Reihen, bis die Fläche erreicht ist – dann siehst du die Breite.');
  }

  neu(); zeichne(); startText();
}
