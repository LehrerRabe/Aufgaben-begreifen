/* Mathematik: Abakus – Zehnerübergang üben.
   Drei senkrechte Stangen (Hunderter rot, Zehner blau, Einer grün). Auf eine Stange passen 10 Perlen.
   Ist eine Stange voll, müssen die Kinder selbst tauschen: 10 Perlen → 1 Perle auf der Stange links.
   Fehlt eine Perle, müssen sie entbündeln: 1 Perle → 10 Perlen auf der Stange rechts. */

import { geruest, zufall, antwortHtml, zahlenMerken, zahlFeld, bewegung } from './geruest.js';

const STANGEN = [
  { name: 'Hunderter', kurz: 'H', farbe: 'rot', eins: 'Hunderter' },
  { name: 'Zehner', kurz: 'Z', farbe: 'blau', eins: 'Zehner' },
  { name: 'Einer', kurz: 'E', farbe: 'gruen', eins: 'Einer' },
];

export function starteAbakus(root) {
  let modus = 'zaehlen';
  let d = [0, 0, 0];               // Perlen auf H, Z, E
  let auf, eing = {}, bewertung = null, beschaeftigt = false;
  let neu_ = new Set();            // Perlen, die gerade erscheinen ("i-k")
  let getauscht = 0, entbuendelt = 0, schritte = 0, zwischen = null;

  const g = geruest(root, {
    etikett: 'Abakus', titel: '',
    reiter: [{ id: 'zaehlen', titel: 'Weiterzählen', unter: 'über die Zehn' }, { id: 'plus', titel: 'Plus', unter: 'tauschen' }, { id: 'minus', titel: 'Minus', unter: 'entbündeln' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-ak="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-ak="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  const zahl = () => d[0] * 100 + d[1] * 10 + d[2];
  /** Richtung der Aufgabe: aufwärts (tauschen) oder abwärts (entbündeln). */
  const auf_ = () => modus === 'plus' || (modus === 'zaehlen' && !auf.rueck);
  const setze = n => { d = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10]; };

  function neu() {
    bewertung = null; eing['ak-e'] = ''; getauscht = 0; entbuendelt = 0; schritte = 0; zwischen = null; neu_ = new Set();
    if (modus === 'zaehlen') {
      const rueck = Math.random() < 0.35;
      let a;
      if (rueck) { a = zufall(2, 9) * 10 + zufall(0, 3); if (Math.random() < 0.3) a += 100 * zufall(1, 4); }
      else { a = zufall(1, 9) * 10 + zufall(5, 9); if (Math.random() < 0.3) a = zufall(1, 3) * 100 + 90 + zufall(4, 8); }
      const weite = zufall(4, 9);
      auf = { a, ziel: rueck ? a - weite : a + weite, rueck };
      setze(a);
    }
    if (modus === 'plus') {
      let a, b;
      do {
        a = Math.random() < 0.3 ? zufall(1, 8) * 100 + zufall(91, 98) : zufall(1, 89) + (Math.random() < 0.4 ? 100 * zufall(1, 7) : 0);
        b = zufall(3, 9);
      } while (a % 10 + b < 10 || a % 10 === 0 || a + b > 999);
      auf = { a, b }; setze(a);
    }
    if (modus === 'minus') {
      let a, b;
      do {
        a = Math.random() < 0.3 ? zufall(1, 8) * 100 + zufall(0, 6) : zufall(11, 99) + (Math.random() < 0.4 ? 100 * zufall(1, 7) : 0);
        b = zufall(3, 9);
      } while (a % 10 >= b || a - b < 1);
      auf = { a, b }; setze(a);
    }
  }

  function stangenHtml() {
    return `<div class="ak-rahmen">${STANGEN.map((s, i) => {
      const n = d[i];
      const perlen = Array.from({ length: n }, (_, k) => `<span class="ak-perle ak-${s.farbe}${neu_.has(`${i}-${k}`) ? ' neu' : ''}" data-perle="${i}-${k}" style="--k:${k}; --v:${[...neu_].indexOf(`${i}-${k}`)}"></span>`).join('');
      const voll = n === 10 && auf_();
      return `<div class="ak-saeule${voll ? ' voll' : ''}" data-saeule="${i}">
        <div class="ak-stab">${perlen}</div>
        <div class="ak-ziffer${voll ? ' zehn' : ''}">${n}</div>
        <div class="ak-name">${s.name}</div>
        <div class="ak-tausch">
          ${voll && i > 0 && auf_() ? `<button type="button" class="kn-gross ak-k-tausch" data-tausch="${i}">⇦ 10 ${s.eins} → 1 ${STANGEN[i - 1].eins}</button>` : ''}
          ${i < 2 && n > 0 && d[i + 1] === 0 && !auf_() ? `<button type="button" class="kn-gross ak-k-ent" data-ent="${i}">1 ${s.eins} → 10 ${STANGEN[i + 1].eins} ⇨</button>` : ''}
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  function links() {
    const darfPlus = modus !== 'minus', darfMinus = modus !== 'plus';
    return `${stangenHtml()}
      <div class="ak-knoepfe">
        ${darfMinus ? '<button type="button" class="kn-gross ak-gross" data-ak="minus">− 1 Einer</button>' : ''}
        ${darfPlus ? '<button type="button" class="kn-gross ak-gross" data-ak="plus">＋ 1 Einer</button>' : ''}
      </div>
       <p class="ak-zahl">${d.some(x => x === 10) && auf_() ? '<span class="leise">Erst tauschen, dann lesen!</span>' : `Auf dem Abakus: <b>${zahl()}</b>`}</p>`;
  }

  function rechts() {
    if (modus === 'zaehlen') {
      const { a, ziel, rueck } = auf;
      const fertig = zahl() === ziel && !d.includes(10);
      return `<h2 class="bereich-titel">${rueck ? 'Zähle rückwärts' : 'Zähle weiter'}</h2>
        <p class="rr-gross">${a} ${rueck ? '→' : '→'} ${ziel}</p>
        <p>${rueck ? 'Nimm Einer weg, bis du bei' : 'Lege Einer dazu, bis du bei'} <b>${ziel}</b> bist. ${rueck ? 'Sind keine Einer mehr da, musst du entbündeln.' : 'Ist die Einer-Stange voll, musst du tauschen.'}</p>
        ${fertig ? `<p class="tb-antwort gut">Geschafft! Du hast ${rueck ? `${entbuendelt}× entbündelt` : `${getauscht}× getauscht`}.</p>` : ''}`;
    }
    const { a, b } = auf;
    const plus = modus === 'plus';
    const rest = b - schritte;
    return `<h2 class="bereich-titel">${plus ? 'Lege dazu' : 'Nimm weg'}</h2>
      <p class="rr-gross">${a} ${plus ? '+' : '−'} ${b}</p>
      <div class="ak-zaehler">${Array.from({ length: b }, (_, i) => `<span class="${i < schritte ? 'an' : ''}"></span>`).join('')}</div>
      <p>${rest > 0 ? `Noch <b>${rest}</b> ${rest === 1 ? 'Einer' : 'Einer'} ${plus ? 'dazulegen' : 'wegnehmen'}.` : d.includes(10) ? 'Erst tauschen!' : 'Fertig gelegt. Wie heißt das Ergebnis?'}</p>
      <p class="ut-frage">${a} ${plus ? '+' : '−'} ${b} = ${zahlFeld('ak-e', eing['ak-e'], 3, 'Ergebnis')}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-ak="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${bewertung?.ok && zwischen ? `<p class="fl-formel">${zwischen}</p>` : ''}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ zaehlen: 'Über die Zehn zählen', plus: 'Plus über die Zehn', minus: 'Minus über die Zehn' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
    neu_ = new Set();
  }

  function wackle(i) {
    const s = root.querySelector(`[data-saeule="${i}"]`);
    s?.classList.remove('wackeln'); void s?.offsetWidth; s?.classList.add('wackeln');
  }

  function plusEins() {
    if (modus === 'plus' && schritte >= auf.b) { g.sprich(`Du hast schon alle ${auf.b} Einer dazugelegt.`, 'tipp'); return; }
    if (d[2] === 10) { wackle(2); g.sprich('Die Einer-Stange ist voll: 10 Einer! Tausche sie gegen 1 Zehner.', 'tipp'); return; }
    if (d.includes(10)) { g.sprich('Erst tauschen – eine Stange ist voll.', 'tipp'); return; }
    d[2]++; schritte += modus === 'plus' ? 1 : 0;
    neu_.add(`2-${d[2] - 1}`);
    if (modus === 'plus' && d[2] === 10 && !zwischen) {
      const bis = 10 - auf.a % 10;
      zwischen = `${auf.a} + ${bis} = ${zahl()}&nbsp;(volle Zehn)<br>${zahl()} + ${auf.b - bis} = ${auf.a + auf.b}`;
    }
    zeichne();
    if (d[2] === 10) g.sprich('10 Einer! Die Stange ist voll. Tausche 10 Einer gegen 1 Zehner.', 'tipp');
    else meldeStand();
  }

  function minusEins() {
    if (modus === 'minus' && schritte >= auf.b) { g.sprich(`Du hast schon alle ${auf.b} Einer weggenommen.`, 'tipp'); return; }
    if (d[2] === 0) {
      wackle(2);
      g.sprich(d[1] > 0 ? 'Keine Einer mehr da! Entbündle 1 Zehner in 10 Einer.' : 'Keine Einer und keine Zehner da! Entbündle zuerst 1 Hunderter in 10 Zehner.', 'tipp');
      return;
    }
    const weg = root.querySelector(`[data-perle="2-${d[2] - 1}"]`);
    const fertig = () => { d[2]--; if (modus === 'minus') { schritte++; if (!zwischen && d[2] === 0 && schritte < auf.b) zwischen = `${auf.a} − ${auf.a % 10} = ${zahl()}&nbsp;(volle Zehn)<br>${zahl()} − ${auf.b - schritte} = ${auf.a - auf.b}`; } zeichne(); meldeStand(); };
    if (weg && bewegung()) { beschaeftigt = true; weg.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(2.5rem)', opacity: 0 }], { duration: 250 }).finished.then(() => { beschaeftigt = false; fertig(); }); }
    else fertig();
  }

  function meldeStand() {
    if (modus === 'zaehlen') {
      if (zahl() === auf.ziel) g.sprich(`${auf.ziel} – geschafft!`, 'fertig');
      else g.sprich(`${zahl()}`);
    }
  }

  /** 10 Perlen wandern hoch und werden zu 1 Perle auf der Stange links. */
  async function tauschen(i) {
    beschaeftigt = true;
    if (bewegung()) {
      const ziel = root.querySelector(`[data-saeule="${i - 1}"] .ak-stab`).getBoundingClientRect();
      const perlen = [...root.querySelectorAll(`[data-saeule="${i}"] .ak-perle`)];
      const zx = ziel.left + ziel.width / 2, zy = ziel.bottom - (d[i - 1] + 0.5) * (perlen[0]?.offsetHeight || 20);
      await Promise.all(perlen.map((p, k) => {
        const r = p.getBoundingClientRect();
        return p.animate([{ transform: 'none' }, { transform: `translate(${(zx - r.left - r.width / 2) * 0.5}px, ${-40 - k * 2}px)`, offset: 0.45 },
          { transform: `translate(${zx - r.left - r.width / 2}px, ${zy - r.top - r.height / 2}px) scale(.5)`, opacity: 0.2 }],
        { duration: 900, delay: k * 25, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
      }));
    }
    d[i] = 0; d[i - 1] += 1; getauscht++;
    neu_.add(`${i - 1}-${d[i - 1] - 1}`);
    zeichne();
    g.sprich(`Getauscht: 10 ${STANGEN[i].eins} sind 1 ${STANGEN[i - 1].eins}.${d[i - 1] === 10 ? ` Jetzt ist die ${STANGEN[i - 1].name}-Stange voll – noch einmal tauschen!` : ''}`, d[i - 1] === 10 ? 'tipp' : 'info');
    if (modus === 'zaehlen' && zahl() === auf.ziel && !d.includes(10)) g.sprich(`${auf.ziel} – geschafft!`, 'fertig');
    beschaeftigt = false;
  }

  /** 1 Perle wandert nach rechts und zerfällt in 10 Perlen. */
  async function entbuendeln(i) {
    beschaeftigt = true;
    if (bewegung()) {
      const p = root.querySelector(`[data-perle="${i}-${d[i] - 1}"]`);
      const ziel = root.querySelector(`[data-saeule="${i + 1}"] .ak-stab`).getBoundingClientRect();
      if (p) {
        const r = p.getBoundingClientRect();
        await p.animate([{ transform: 'none' }, { transform: `translate(${ziel.left + ziel.width / 2 - r.left - r.width / 2}px, ${ziel.bottom - r.bottom - 4}px) scale(1.4)` }],
          { duration: 700, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
      }
    }
    d[i] -= 1; d[i + 1] = 10; entbuendelt++;
    for (let k = 0; k < 10; k++) neu_.add(`${i + 1}-${k}`);
    zeichne();
    g.sprich(`Entbündelt: 1 ${STANGEN[i].eins} sind 10 ${STANGEN[i + 1].eins}.`);
    beschaeftigt = false;
  }

  function pruefen() {
    const soll = modus === 'plus' ? auf.a + auf.b : auf.a - auf.b;
    const ein = Number(eing['ak-e']);
    const ok = ein === soll && eing['ak-e'] !== '';
    bewertung = ok ? { ok, text: `Richtig: ${auf.a} ${modus === 'plus' ? '+' : '−'} ${auf.b} = ${soll}` }
      : { ok, text: schritte < auf.b ? `Lege die Aufgabe zuerst am Abakus: noch ${auf.b - schritte} Einer ${modus === 'plus' ? 'dazu' : 'weg'}.` : 'Noch nicht. Lies die Zahl vom Abakus ab: Hunderter, Zehner, Einer.' };
    if (ok) g.sprich(modus === 'plus' ? 'Erst bis zur vollen Zehn, dann weiter – genau das ist der Zehnerübergang.' : 'Erst bis zur Zehn zurück, dann weiter – das ist der Zehnerübergang rückwärts.', 'fertig');
    g.rechts.innerHTML = rechts();
  }

  function tipp() {
    const voll = d.findIndex(x => x === 10);
    if (voll >= 0 && auf_()) { g.sprich(`Die ${STANGEN[voll].name}-Stange ist voll. Tippe auf „10 ${STANGEN[voll].eins} → 1 ${STANGEN[voll - 1]?.eins}“.`, 'tipp'); return; }
    if (modus === 'zaehlen') {
      g.sprich(auf.rueck ? (d[2] === 0 ? 'Keine Einer mehr? Entbündle einen Zehner.' : `Nimm noch ${zahl() - auf.ziel} Einer weg.`) : `Lege noch ${auf.ziel - zahl()} Einer dazu.`, 'tipp');
      return;
    }
    if (modus === 'plus') g.sprich(schritte < auf.b ? `Wie viele Einer fehlen bis zur vollen Zehn? ${10 - d[2]}. Leg sie dazu, dann tausche.` : 'Lies jetzt die Zahl ab.', 'tipp');
    else g.sprich(schritte < auf.b ? (d[2] === 0 ? 'Die Einer sind alle. Entbündle 1 Zehner.' : `Nimm erst die ${d[2]} Einer weg, die da sind. Dann entbündeln.`) : 'Lies jetzt die Zahl ab.', 'tipp');
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const t = e.target.closest('[data-tausch]');
    if (t) { tauschen(Number(t.dataset.tausch)); return; }
    const en = e.target.closest('[data-ent]');
    if (en) { entbuendeln(Number(en.dataset.ent)); return; }
    const b = e.target.closest('[data-ak]');
    if (!b) return;
    const was = b.dataset.ak;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'plus') plusEins();
    if (was === 'minus') minusEins();
    if (was === 'pruefen') pruefen();
    if (was === 'tipp') tipp();
  });

  function startText() {
    g.sprich({
      zaehlen: 'Auf eine Stange passen 10 Perlen. Ist sie voll, tauschst du 10 Perlen gegen 1 Perle auf der Stange links.',
      plus: 'Lege die Einer einzeln dazu. Wird die Einer-Stange voll, tausche!',
      minus: 'Nimm die Einer einzeln weg. Fehlen Einer, entbündle einen Zehner.',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
