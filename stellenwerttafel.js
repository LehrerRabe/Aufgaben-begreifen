/* Mathematik: Stellenwerttafel mit Plättchen.
   Zahl legen, Zahl lesen, Bündeln (mehr als 9 Plättchen in einer Spalte) und Umrechnen
   („Wie viele Hunderter hat 3 450?“ – durch Entbündeln sichtbar machen). */

import { geruest, zufall, antwortHtml, zahlenMerken, zahlFeld, bewegung } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const SP = [
  { kurz: 'HT', name: 'Hunderttausender', f: 'rot' },
  { kurz: 'ZT', name: 'Zehntausender', f: 'blau' },
  { kurz: 'T', name: 'Tausender', f: 'gruen' },
  { kurz: 'H', name: 'Hunderter', f: 'rot' },
  { kurz: 'Z', name: 'Zehner', f: 'blau' },
  { kurz: 'E', name: 'Einer', f: 'gruen' },
];
const W = i => 10 ** (5 - i);

export function starteStellenwerttafel(root) {
  let modus = 'legen';
  let n = [0, 0, 0, 0, 0, 0], ziel = 0, frage = null;
  let eing = {}, bewertung = null, beschaeftigt = false, neuSp = null;

  const g = geruest(root, {
    etikett: 'Stellenwerttafel', titel: '',
    reiter: [{ id: 'legen', titel: 'Zahl legen' }, { id: 'lesen', titel: 'Zahl lesen' }, { id: 'buendeln', titel: 'Bündeln', unter: 'mehr als 9?' }, { id: 'umrechnen', titel: 'Umrechnen', unter: 'Wie viele Zehner …?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-st="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-st="neu">＋ Neue Aufgabe</button>`,
    breitRechts: false,
  });
  zahlenMerken(root, eing);

  const wert = () => n.reduce((a, x, i) => a + x * W(i), 0);
  const ziffern = z => String(z).padStart(6, '0').split('').map(Number);

  function zufallsZahl(min = 3, max = 6) {
    const st = zufall(min, max);
    return Number(Array.from({ length: st }, (_, i) => (i === 0 ? zufall(1, 9) : Math.random() < 0.25 ? 0 : zufall(1, 9))).join(''));
  }

  function neu() {
    bewertung = null; eing['st-e'] = ''; neuSp = null; frage = null;
    if (modus === 'legen') { ziel = zufallsZahl(); n = [0, 0, 0, 0, 0, 0]; }
    if (modus === 'lesen') { ziel = zufallsZahl(); n = ziffern(ziel); }
    if (modus === 'buendeln') {
      ziel = zufallsZahl(3, 5); n = ziffern(ziel);
      // zwei- bis dreimal entbündeln, damit Spalten mit mehr als 9 Plättchen entstehen
      const k = zufall(2, 3);
      for (let t = 0, m = 0; t < 30 && m < k; t++) {
        const i = zufall(0, 4);
        if (n[i] > 0 && n[i + 1] + 10 <= 19) { n[i]--; n[i + 1] += 10; m++; }
      }
      if (n.every(x => x <= 9)) { neu(); return; }
    }
    if (modus === 'umrechnen') {
      const c = zufall(2, 5);                         // Zielspalte: T, H, Z oder E
      const kmax = c === 5 ? 60 : 59;
      const k = zufall(11, kmax);
      const rest = c === 5 ? 0 : zufall(0, W(c) - 1);
      ziel = k * W(c) + rest;
      if (ziel >= 1e6) { neu(); return; }
      n = ziffern(ziel);
      frage = { c, k };
    }
  }

  function plaettchen(anz, f, sp) {
    let s = '';
    for (let k = 0; k < anz; k++) s += `<span class="st-pl st-${f}${neuSp === sp ? ' neu' : ''}" style="--v:${k}"></span>`;
    return s;
  }

  function tafel() {
    const bedien = modus === 'legen';
    const tausch = modus === 'buendeln' || modus === 'umrechnen' || modus === 'legen';
    return `<div class="st-tafel">
      ${SP.map((s, i) => {
        const zuviel = n[i] > 9 && modus !== 'umrechnen';
        const ziel_ = frage && i === frage.c;
        return `<div class="st-spalte st-${s.f}-sp${zuviel ? ' zuviel' : ''}${ziel_ ? ' zielspalte' : ''}" data-sp="${i}">
          <div class="st-kopf" title="${s.name}">${s.kurz}</div>
          <div class="st-feld">${plaettchen(n[i], s.f, i)}</div>
          <div class="st-ziffer${zuviel ? ' zuviel' : ''}">${modus === 'lesen' && !bewertung?.ok ? '' : n[i]}</div>
          ${bedien ? `<div class="st-plusminus"><button type="button" class="kn" data-minus="${i}" aria-label="${s.name} weniger">−</button><button type="button" class="kn" data-plus="${i}" aria-label="${s.name} mehr">＋</button></div>` : ''}
          ${tausch ? `<div class="st-tausch">
            ${n[i] >= 10 && i > 0 && modus !== 'umrechnen' ? `<button type="button" class="kn-gross st-k" data-buendel="${i}" title="10 ${s.name} → 1 ${SP[i - 1].name}">⇦ 10 → 1</button>` : ''}
            ${n[i] >= 1 && i < 5 && modus !== 'legen' && !(modus === 'umrechnen' && i >= frage.c) ? `<button type="button" class="kn-gross st-k leise" data-ent="${i}" title="1 ${s.name} → 10 ${SP[i + 1].name}">1 → 10 ⇨</button>` : ''}
          </div>` : ''}
        </div>`;
      }).join('')}
    </div>
    <p class="leise st-merke">10 Plättchen in einer Spalte sind 1 Plättchen in der Spalte links daneben.</p>`;
  }

  function rechts() {
    if (modus === 'legen') {
      return `<h2 class="bereich-titel">Lege diese Zahl</h2>
        <p class="rr-gross">${zahlText(ziel)}</p>
        <p class="leise">Mit ＋ und − legst du Plättchen in die Spalten. Für eine 0 bleibt die Spalte leer.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-st="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    if (modus === 'lesen') {
      return `<h2 class="bereich-titel">Welche Zahl liegt in der Tafel?</h2>
        <p>${zahlFeld('st-e', eing['st-e'], 7, 'Zahl')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-st="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Zähle die Plättchen jeder Spalte. Eine leere Spalte ist eine 0.</p>`;
    }
    if (modus === 'buendeln') {
      const fertig = n.every(x => x <= 9);
      return `<h2 class="bereich-titel">Bündle und schreibe die Zahl</h2>
        <p>${n.map((x, i) => (x ? `${x} ${SP[i].kurz}` : null)).filter(Boolean).join(' + ')}</p>
        <p>${fertig ? 'Alle Spalten haben höchstens 9 Plättchen. Wie heißt die Zahl?' : 'In rot markierten Spalten liegen mehr als 9 Plättchen. Bündle 10 zu 1!'}</p>
        <p>${zahlFeld('st-e', eing['st-e'], 7, 'Zahl')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-st="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    const { c } = frage;
    return `<h2 class="bereich-titel">Umrechnen</h2>
      <p class="rr-gross">Wie viele ${SP[c].name} hat ${zahlText(ziel)}?</p>
      <p>Entbündle alles, was links von der ${SP[c].name}-Spalte liegt, bis es in der gelben Spalte ankommt. Dann zähle die Plättchen dort.</p>
      <p class="ut-frage">${zahlFeld('st-e', eing['st-e'], 4, 'Anzahl')} ${SP[c].name}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-st="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ legen: 'Zahlen in der Stellenwerttafel', lesen: 'Zahlen ablesen', buendeln: 'Bündeln: 10 → 1', umrechnen: 'Umrechnen mit der Stellenwerttafel' }[modus]);
    g.links.innerHTML = tafel();
    g.rechts.innerHTML = rechts();
    neuSp = null;
  }

  async function flug(von, nach, anzahl) {
    if (!bewegung()) return;
    const pl = [...root.querySelectorAll(`[data-sp="${von}"] .st-pl`)].slice(-anzahl);
    const z = root.querySelector(`[data-sp="${nach}"] .st-feld`).getBoundingClientRect();
    await Promise.all(pl.map((p, k) => {
      const r = p.getBoundingClientRect();
      return p.animate([{ transform: 'none' }, { transform: `translate(${z.left + z.width / 2 - r.left - r.width / 2}px, ${z.top + 14 - r.top}px) scale(${anzahl > 1 ? 0.5 : 1.3})`, opacity: anzahl > 1 ? 0.2 : 1 }],
        { duration: 650, delay: k * 20, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
    }));
  }

  async function buendeln(i) {
    beschaeftigt = true;
    await flug(i, i - 1, 10);
    n[i] -= 10; n[i - 1] += 1; neuSp = i - 1;
    zeichne();
    g.sprich(`10 ${SP[i].name} = 1 ${SP[i - 1]}.`);
    beschaeftigt = false;
  }

  async function entbuendeln(i) {
    beschaeftigt = true;
    await flug(i, i + 1, 1);
    n[i] -= 1; n[i + 1] += 10; neuSp = i + 1;
    zeichne();
    g.sprich(`1 ${SP[i]} = 10 ${SP[i + 1].name}.`);
    if (modus === 'umrechnen' && n.slice(0, frage.c).every(x => x === 0)) g.sprich(`Alles ist in der ${SP[frage.c].name}-Spalte angekommen. Zähle die Plättchen dort – in Zehnerreihen geht es schnell.`, 'tipp');
    beschaeftigt = false;
  }

  function pruefen() {
    const ein = Number((eing['st-e'] || '').replace(/\D/g, ''));
    if (modus === 'legen') {
      const ok = wert() === ziel && n.every(x => x <= 9);
      const zz = ziffern(ziel);
      bewertung = ok ? { ok, text: `Richtig: ${zahlText(ziel)}` } : { ok, text: n.some(x => x > 9) ? 'In einer Spalte liegen mehr als 9 Plättchen – bündle sie.' : `Schau noch einmal bei: ${SP.filter((_, i) => n[i] !== zz[i]).map(s => s.name).join(', ')}.` };
    }
    if (modus === 'lesen' || modus === 'buendeln') {
      const ok = ein === ziel && eing['st-e'] !== '';
      bewertung = ok ? { ok, text: `Richtig: ${zahlText(ziel)}` } : { ok, text: modus === 'buendeln' && n.some(x => x > 9) ? 'Bündle zuerst, bis keine Spalte mehr als 9 Plättchen hat. Dann kannst du die Zahl ablesen.' : 'Noch nicht. Lies Spalte für Spalte von links nach rechts.' };
    }
    if (modus === 'umrechnen') {
      const ok = ein === frage.k && eing['st-e'] !== '';
      const { c, k } = frage;
      bewertung = ok ? { ok, text: `Richtig: ${zahlText(ziel)} hat ${k} ${SP[c].name}${ziel % W(c) ? ` (und noch ${zahlText(ziel % W(c))} Rest)` : ''}.` }
        : { ok, text: n.slice(0, c).some(x => x > 0) ? `Links der gelben Spalte liegen noch Plättchen. Entbündle sie bis in die ${SP[c].name}-Spalte.` : 'Zähle die Plättchen in der gelben Spalte noch einmal.' };
      if (ok) g.sprich(`Merke: Bei ${zahlText(ziel)} streicht man die Ziffern rechts der ${SP[c].name}-Stelle weg: ${String(k)} ${SP[c].name}.`, 'fertig');
    }
    if (bewertung.ok && modus !== 'umrechnen') g.sprich('Super!', 'fertig');
    zeichne();
  }

  function tipp() {
    if (modus === 'legen') { const zz = ziffern(ziel); const i = n.findIndex((x, k) => x !== zz[k]); g.sprich(i < 0 ? 'Alles liegt richtig – prüfe!' : `In die Spalte ${SP[i].name} gehören ${zz[i]} Plättchen.`, 'tipp'); }
    if (modus === 'lesen') g.sprich('Schreibe die Anzahl jeder Spalte nacheinander auf – von links nach rechts. Leere Spalte: 0.', 'tipp');
    if (modus === 'buendeln') { const i = n.findIndex(x => x > 9); g.sprich(i >= 0 ? `In der Spalte ${SP[i].name} liegen ${n[i]} Plättchen. Tippe auf „⇦ 10 → 1“.` : 'Jetzt ablesen.', 'tipp'); }
    if (modus === 'umrechnen') { const i = n.findIndex((x, k) => k < frage.c && x > 0); g.sprich(i >= 0 ? `Entbündle in der Spalte ${SP[i].name}: Tippe auf „1 → 10 ⇨“, bis die Spalte leer ist.` : 'Zähle die Plättchen in der gelben Spalte.', 'tipp'); }
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const p = e.target.closest('[data-plus]');
    if (p) { const i = Number(p.dataset.plus); if (n[i] >= 10) { g.sprich('Schon 10 Plättchen – bündle sie zu 1 Plättchen links.', 'tipp'); return; } n[i]++; bewertung = null; neuSp = null; zeichne(); return; }
    const m = e.target.closest('[data-minus]');
    if (m) { const i = Number(m.dataset.minus); if (n[i] > 0) n[i]--; bewertung = null; zeichne(); return; }
    const b = e.target.closest('[data-buendel]');
    if (b) { buendeln(Number(b.dataset.buendel)); return; }
    const en = e.target.closest('[data-ent]');
    if (en) { const i = Number(en.dataset.ent); if (n[i + 1] + 10 > 99) { g.sprich('So viele Plättchen passen nicht in eine Spalte.', 'tipp'); return; } entbuendeln(i); return; }
    const k = e.target.closest('[data-st]');
    if (!k) return;
    if (k.dataset.st === 'neu') { neu(); zeichne(); startText(); }
    if (k.dataset.st === 'pruefen') pruefen();
    if (k.dataset.st === 'tipp') tipp();
  });

  function startText() {
    g.sprich({
      legen: 'Jede Spalte ist eine Stelle. Lege so viele Plättchen, wie die Ziffer sagt.',
      lesen: 'Zähle die Plättchen in jeder Spalte und schreibe die Zahl.',
      buendeln: 'Hier liegen zu viele Plättchen in einer Spalte. Bündle immer 10 zu 1 Plättchen links daneben.',
      umrechnen: 'Wie viele Zehner, Hunderter, … hat die Zahl? Entbündle nach rechts, bis alles in der gelben Spalte liegt.',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
