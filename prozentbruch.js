/* Mathematik (Klasse 6, Kapitel Brüche): Prozente als Hundertstel – ganz ohne Dezimalzahlen.
   Vier Reiter:
   1. Hunderterfeld – ein gefärbter Anteil wird als Prozent und als Bruch mit Nenner 100 abgelesen.
   2. Bruch → Prozent – Bruch auf den Nenner 100 erweitern (oder kürzen), dann als Prozent schreiben;
      manchmal umgekehrt: Prozent als gekürzten Bruch schreiben. Nach dem Lösen wird der Anteil im Hunderterfeld gezeigt.
   3. Vergleichen – zwei Kinder, verschieden viele Versuche: erst beide Anteile in Prozent, dann entscheiden, wer besser ist.
   4. Prozent von – „25 % von 80 €“: Prozent als Bruch schreiben, dann den Teil berechnen (Streifenbild mit n Teilen).
   Gleichwertige Brüche werden akzeptiert. Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, bruchFeld, zahlFeld, zahlenMerken, ggT } from './geruest.js';

const STIL = `
.pb-feld { display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px; max-width: 22rem; margin: .4rem auto; padding: 6px; background: var(--flaeche-2); border: 2px solid var(--rand); border-radius: 10px; }
.pb-feld i { aspect-ratio: 1; border-radius: 3px; background: var(--flaeche); border: 1px solid var(--rand); }
.pb-feld i.an { background: #2f6fe4; border-color: #1f4fb0; }
.pb-feld i.an2 { background: #f07d2a; border-color: #b85a17; }
.pb-zeile { font: 800 1.5rem/1.6 var(--titel); display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; margin: .45rem 0; font-variant-numeric: tabular-nums; }
.pb-zeile .gs-ein { width: 3.6rem; font-size: 1.25rem; padding: .2rem; }
.pb-text { font-size: 1.1rem; }
.pb-merk { border-left: 6px solid var(--akzent); background: var(--info-sanft); border-radius: 10px; padding: .6rem .8rem; margin: .7rem 0; }
.pb-merk b { color: var(--akzent); }
.pb-kinder { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
.pb-kind { border: 2px solid var(--rand); border-radius: 12px; padding: .6rem; text-align: center; background: var(--flaeche); }
.pb-kind h3 { margin: 0 0 .3rem; font: 800 1.2rem var(--titel); }
.pb-kind .pb-feld { max-width: 11rem; gap: 2px; padding: 4px; }
.pb-wahl { display: flex; flex-wrap: wrap; gap: .5rem; margin: .5rem 0; }
.pb-streifen { display: block; width: 100%; height: auto; margin: .5rem 0; }
.pb-st { stroke: #fff; stroke-width: 2; }
.pb-st-t { font: 800 15px var(--titel); text-anchor: middle; fill: #fff; }
.pb-st-g { font: 800 16px var(--titel); text-anchor: middle; fill: var(--text); }
`;
function stil() {
  if (!document.getElementById('pb-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="pb-stil">${STIL}</style>`);
}

const lies = (eing, id) => { const v = String(eing[id] ?? '').replace(/\D/g, ''); return v === '' ? NaN : Number(v); };
const gleich = (a, b, c, d) => b > 0 && d > 0 && a * d === c * b;
const kuerze = (z, n) => { const t = ggT(z, n) || 1; return [z / t, n / t]; };

/** Hunderterfeld: k Kästchen blau (zeilenweise), optional k2 weitere orange. */
function feld(k, k2 = 0) {
  let s = '';
  for (let i = 0; i < 100; i++) s += `<i class="${i < k ? 'an' : i < k + k2 ? 'an2' : ''}"></i>`;
  return `<div class="pb-feld" role="img" aria-label="${k} von 100 Kästchen gefärbt">${s}</div>`;
}

/** Streifen mit n gleichen Teilen, a davon gefärbt, darüber das Ganze. */
function streifen(n, a, ganzText, teilText) {
  const W = 600, x0 = 10, b = (W - 2 * x0) / n;
  let s = `<text x="${W / 2}" y="20" class="pb-st-g">${ganzText}</text>
    <path d="M${x0} 30 v-6 H${W - x0} v6" fill="none" stroke="var(--text)" stroke-width="2"/>`;
  for (let i = 0; i < n; i++) {
    s += `<rect x="${x0 + i * b}" y="36" width="${b}" height="46" rx="4" fill="${i < a ? '#2f6fe4' : 'var(--flaeche-2)'}" class="pb-st"/>`;
    if (teilText && n <= 10) s += `<text x="${x0 + (i + 0.5) * b}" y="65" class="pb-st-t" style="fill:${i < a ? '#fff' : 'var(--leise)'}">${teilText}</text>`;
  }
  return `<svg class="pb-streifen" viewBox="0 0 ${W} 90" role="img" aria-label="Streifen in ${n} Teilen, ${a} gefärbt">${s}</svg>`;
}

/* Brüche, deren Nenner ein Teiler von 100 ist */
const NENNER = [2, 4, 5, 10, 20, 25, 50];
const PERSONEN = ['Lea', 'Tim', 'Sophie', 'Jonas', 'Mia', 'Paul', 'Emma', 'Felix'];
const SPORT = [
  { was: 'Freiwürfe', tut: 'trifft' }, { was: 'Elfmeter', tut: 'verwandelt' }, { was: 'Torwandschüsse', tut: 'trifft' }, { was: 'Korbwürfe', tut: 'trifft' },
];

export function starteProzentBruch(root) {
  stil();
  let modus = 'feld';
  let eing = {}, bewertung = null, schritt = 1, tipps = 0;
  let k;                 // feld
  let bp;                // bruch→prozent: { a, b, umgekehrt, p }
  let vg;                // vergleichen: { A:{name,t,v,p}, B:{…}, sport }
  let pv;                // prozent von: { p, G, einheit, z, n, W, text }

  const g = geruest(root, {
    etikett: 'Prozente', titel: '',
    reiter: [
      { id: 'feld', titel: 'Hunderterfeld', unter: 'ablesen' },
      { id: 'bruch', titel: 'Bruch ↔ Prozent', unter: 'auf 100 erweitern' },
      { id: 'vergleich', titel: 'Vergleichen', unter: 'Wer ist besser?' },
      { id: 'von', titel: 'Prozent von', unter: '25 % von 80 €' },
    ],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-pb="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-pb="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; schritt = 1; tipps = 0; Object.keys(eing).forEach(x => (eing[x] = ''));
    if (modus === 'feld') {
      let alt = k; do { k = wahl([zufall(1, 99), wahl([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]), zufall(1, 9) * 10 + zufall(1, 9)]); } while (k === alt);
    }
    if (modus === 'bruch') {
      const b = wahl(NENNER);
      let a; do { a = zufall(1, b - 1); } while (ggT(a, b) !== 1 && Math.random() < 0.7);
      const umgekehrt = Math.random() < 0.35;
      bp = { a, b, umgekehrt, p: (a * 100) / b };
    }
    if (modus === 'vergleich') {
      const [n1, n2] = (() => { let x, y; do { x = wahl(PERSONEN); y = wahl(PERSONEN); } while (x === y); return [x, y]; })();
      const mach = () => { const t = wahl([10, 20, 25, 50]); const v = zufall(Math.ceil(t * 0.4), t - 1); return { t, v, p: (v * 100) / t }; };
      let A, B; do { A = mach(); B = mach(); } while (A.t === B.t || Math.abs(A.p - B.p) > 20);
      vg = { A: { name: n1, ...A }, B: { name: n2, ...B }, sport: wahl(SPORT) };
    }
    if (modus === 'von') {
      const kont = [
        { e: '€', t: (p, G) => `Ein Pullover kostet ${G} €. Im Sale gibt es ${p} % Rabatt. Wie viel Euro spart man?` },
        { e: 'Kinder', t: (p, G) => `In der Jahrgangsstufe 6 sind ${G} Kinder. ${p} % fahren mit dem Bus. Wie viele Kinder sind das?` },
        { e: 'ml', t: (p, G) => `Eine Flasche Saftschorle enthält ${G} ml. ${p} % davon sind Apfelsaft. Wie viel ml Apfelsaft sind das?` },
        { e: 'Seiten', t: (p, G) => `Ein Buch hat ${G} Seiten. Mia hat schon ${p} % gelesen. Wie viele Seiten sind das?` },
        { e: 'km', t: (p, G) => `Eine Radtour ist ${G} km lang. ${p} % sind geschafft. Wie viele Kilometer sind das?` },
        { e: '', t: (p, G) => `Berechne ${p} % von ${G}.` },
      ];
      const p = wahl([10, 20, 25, 50, 75, 40, 30, 60, 5, 1, 80]);
      const [z, n] = kuerze(p, 100);
      const fak = wahl(n <= 10 ? [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30] : n === 20 ? [1, 2, 3, 4, 5, 10] : [1, 2, 3, 5, 10, 20, 30]);
      const G = n * fak;
      const K = wahl(kont);
      pv = { p, G, einheit: K.e, z, n, W: (G * p) / 100, text: K.t(p, G) };
    }
  }

  /* ---------- Darstellung ---------- */
  function links() {
    if (modus === 'feld') return `${feld(k)}<p class="leise" style="text-align:center">Das ganze Feld hat 100 Kästchen.</p>`;
    if (modus === 'bruch') {
      const zeig = bewertung?.ok;
      return `${zeig ? feld(bp.p) : feld(0)}
        <div class="pb-merk"><b>Prozent heißt „von Hundert“.</b><br>${bruchHtml(1, 100, 'klein')} = 1 %   ·   ${bruchHtml(25, 100, 'klein')} = 25 %<br>
        Erweitere oder kürze den Bruch so, dass im Nenner <b>100</b> steht.</div>`;
    }
    if (modus === 'vergleich') {
      const { A, B, sport } = vg;
      const fertig = bewertung?.ok;
      return `<div class="pb-kinder">
        ${[A, B].map(x => `<div class="pb-kind"><h3>${x.name}</h3><p>${x.v} von ${x.t} ${sport.was}</p>${fertig ? feld(x.p) + `<p><b>${x.p} %</b></p>` : ''}</div>`).join('')}
      </div>
      <p class="leise">Wer öfter trifft, ist nicht automatisch besser – es kommt auf den <b>Anteil</b> an.</p>`;
    }
    const { z, n, G, einheit } = pv;
    const tt = schritt >= 2 ? `${G / n}${einheit ? ' ' + einheit : ''}` : '';
    return `${streifen(n, schritt >= 2 ? z : 0, `Das Ganze: ${G}${einheit ? ' ' + einheit : ''}`, n <= 10 ? tt : '')}
      <p class="leise">${schritt >= 2 ? `Der Streifen hat ${n} gleiche Teile – ${z} davon sind gefärbt.` : 'Der Streifen ist das Ganze (100 %).'}</p>`;
  }

  function rechts() {
    const pruef = `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pb="pruefen">✓ Prüfen</button></div>`;
    if (modus === 'feld') {
      return `<h2 class="bereich-titel">Wie viel ist gefärbt?</h2>
        <p class="pb-zeile">${zahlFeld('pb-p', eing['pb-p'] ?? '', 3, 'Prozent')} %</p>
        <p class="pb-zeile">= ${bruchFeld('pb-z', 'pb-n', eing)}</p>${pruef}${antwortHtml(bewertung)}
        ${bewertung?.ok ? `<p class="fl-formel">${k} % = ${bruchHtml(k, 100)}${ggT(k, 100) > 1 ? ` = ${bruchHtml(...kuerze(k, 100))}` : ''}</p>` : ''}`;
    }
    if (modus === 'bruch') {
      const { a, b, umgekehrt, p } = bp;
      if (umgekehrt) {
        return `<h2 class="bereich-titel">Schreibe als gekürzten Bruch</h2>
          <p class="pb-zeile">${p} % = ${bruchFeld('pb-z1', 'pb-n1', eing)} = ${bruchFeld('pb-z', 'pb-n', eing)}</p>
          <p class="leise">Erst als Bruch mit Nenner 100, dann so weit wie möglich kürzen.</p>${pruef}${antwortHtml(bewertung)}`;
      }
      return `<h2 class="bereich-titel">Schreibe in Prozent</h2>
        <p class="pb-zeile">${bruchHtml(a, b)} = ${bruchFeld('pb-z1', 'pb-n1', eing)} = ${zahlFeld('pb-p', eing['pb-p'] ?? '', 3, 'Prozent')} %</p>
        <p class="leise">Womit musst du erweitern, damit im Nenner 100 steht?</p>${pruef}${antwortHtml(bewertung)}`;
    }
    if (modus === 'vergleich') {
      const { A, B, sport } = vg;
      let h = `<h2 class="bereich-titel">Wer ist besser?</h2>
        <p class="pb-text">${A.name} ${sport.tut} ${A.v} von ${A.t} ${sport.was}. ${B.name} ${sport.tut} ${B.v} von ${B.t}.</p>
        <p class="pb-zeile" style="font-size:1.2rem">${A.name}: ${bruchHtml(A.v, A.t)} = ${zahlFeld('pb-a', eing['pb-a'] ?? '', 3, `Prozent ${A.name}`)} %</p>
        <p class="pb-zeile" style="font-size:1.2rem">${B.name}: ${bruchHtml(B.v, B.t)} = ${zahlFeld('pb-b', eing['pb-b'] ?? '', 3, `Prozent ${B.name}`)} %</p>`;
      if (schritt === 1) h += `${pruef}${antwortHtml(bewertung)}`;
      else {
        h += `<p><b>Wer hat den größeren Anteil getroffen?</b></p>
          <div class="pb-wahl"><button type="button" class="kn-gross" data-sieger="A">${A.name}</button><button type="button" class="kn-gross" data-sieger="B">${B.name}</button><button type="button" class="kn-gross" data-sieger="gleich">gleich gut</button></div>${antwortHtml(bewertung)}`;
      }
      return h;
    }
    const { p, G, einheit, text } = pv;
    let h = `<h2 class="bereich-titel">Prozent von einer Größe</h2><p class="pb-text">${text}</p>
      <p class="pb-zeile" style="font-size:1.25rem"><b>1.</b> ${p} % = ${bruchFeld('pb-z', 'pb-n', eing)}</p>`;
    if (schritt >= 2) h += `<p class="pb-zeile" style="font-size:1.25rem"><b>2.</b> ${bruchHtml(pv.z, pv.n, 'klein')} von ${G} ${einheit} = ${zahlFeld('pb-w', eing['pb-w'] ?? '', 5, 'Ergebnis')} ${einheit}</p>`;
    h += `${pruef}${antwortHtml(bewertung)}`;
    if (bewertung?.ok && schritt === 3) h += `<p class="fl-formel">${p} % von ${G} ${einheit} = ${pv.W} ${einheit}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ feld: 'Prozente im Hunderterfeld', bruch: 'Bruch und Prozent', vergleich: 'Anteile vergleichen', von: 'Prozent von einer Größe' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  /* ---------- Prüfen ---------- */
  function pruefen() {
    if (modus === 'feld') {
      const p = lies(eing, 'pb-p'), z = lies(eing, 'pb-z'), n = lies(eing, 'pb-n');
      if (isNaN(p) || isNaN(z) || isNaN(n)) bewertung = { ok: false, text: 'Trage die Prozentzahl und den Bruch ein.' };
      else if (p !== k) bewertung = { ok: false, text: 'Die Prozentzahl stimmt noch nicht. Zähle: Jede volle Reihe sind 10 Kästchen.' };
      else if (!gleich(z, n, k, 100)) bewertung = { ok: false, text: `${k} % heißt „${k} von 100“. Was steht dann im Zähler, was im Nenner?` };
      else { bewertung = { ok: true, text: 'Richtig!' }; g.sprich(`${k} von 100 Kästchen – das sind ${k} Hundertstel, also ${k} %.`, 'fertig'); }
    }
    if (modus === 'bruch') {
      const { a, b, umgekehrt, p } = bp;
      const z1 = lies(eing, 'pb-z1'), n1 = lies(eing, 'pb-n1');
      if (umgekehrt) {
        const z = lies(eing, 'pb-z'), n = lies(eing, 'pb-n');
        const [kz, kn] = kuerze(p, 100);
        if ([z1, n1, z, n].some(isNaN)) bewertung = { ok: false, text: 'Fülle beide Brüche aus.' };
        else if (!(z1 === p && n1 === 100)) bewertung = { ok: false, text: `${p} % = ${p} Hundertstel. Schreibe zuerst den Bruch mit Nenner 100.` };
        else if (!gleich(z, n, p, 100)) bewertung = { ok: false, text: 'Beim Kürzen ist etwas schiefgegangen: Teile Zähler und Nenner durch dieselbe Zahl.' };
        else if (z !== kz) bewertung = { ok: false, text: `Der Wert stimmt, aber du kannst noch weiter kürzen.` };
        else { bewertung = { ok: true, text: 'Richtig!' }; g.sprich(`${p} % = ${bruchHtml(p, 100, 'klein')} = ${bruchHtml(kz, kn, 'klein')}`, 'fertig'); }
      } else {
        const pp = lies(eing, 'pb-p');
        if ([z1, n1, pp].some(isNaN)) bewertung = { ok: false, text: 'Fülle den Bruch mit Nenner 100 und die Prozentzahl aus.' };
        else if (n1 !== 100) bewertung = { ok: false, text: `Im Nenner soll 100 stehen. ${b} · ${100 / b} = 100.` };
        else if (z1 !== p) bewertung = { ok: false, text: `Erweitere auch den Zähler mit ${100 / b}: ${a} · ${100 / b} = ?` };
        else if (pp !== p) bewertung = { ok: false, text: `${bruchHtml(p, 100, 'klein')} sind wie viel Prozent?` };
        else { bewertung = { ok: true, text: 'Richtig!' }; g.sprich(`${bruchHtml(a, b, 'klein')} = ${bruchHtml(p, 100, 'klein')} = ${p} %`, 'fertig'); }
      }
    }
    if (modus === 'vergleich') {
      const { A, B } = vg;
      const a = lies(eing, 'pb-a'), b = lies(eing, 'pb-b');
      if (isNaN(a) || isNaN(b)) bewertung = { ok: false, text: 'Trage beide Prozentzahlen ein.' };
      else if (a !== A.p || b !== B.p) bewertung = { ok: false, text: `${a !== A.p ? A.name : B.name}: Erweitere den Bruch auf den Nenner 100.` };
      else { bewertung = null; schritt = 2; g.sprich('Jetzt kannst du die Anteile direkt vergleichen.'); }
    }
    if (modus === 'von') {
      const { p, z, n, W, G } = pv;
      const bz = lies(eing, 'pb-z'), bn = lies(eing, 'pb-n');
      if (isNaN(bz) || isNaN(bn)) bewertung = { ok: false, text: 'Schreibe die Prozentzahl als Bruch.' };
      else if (!gleich(bz, bn, p, 100)) bewertung = { ok: false, text: `${p} % = ${bruchHtml(p, 100, 'klein')}. Kürze, wenn es geht.` };
      else if (schritt === 1) { schritt = 2; bewertung = { ok: true, text: bz === z ? 'Gut! Jetzt berechnest du den Teil.' : `Stimmt! Gekürzt ist das ${bruchHtml(z, n, 'klein')} – damit rechnet es sich leichter.` }; }
      else {
        const w = lies(eing, 'pb-w');
        if (isNaN(w)) bewertung = { ok: false, text: 'Trage das Ergebnis ein.' };
        else if (w === W) { schritt = 3; bewertung = { ok: true, text: 'Richtig!' }; g.sprich(`${G} : ${n} = ${G / n} (ein Teil). ${z} Teile: ${G / n} · ${z} = ${W}.`, 'fertig'); }
        else if (w === G / n) bewertung = { ok: false, text: `Das ist erst ein Teil (${bruchHtml(1, n, 'klein')}). Du brauchst ${z} Teile.` };
        else bewertung = { ok: false, text: `Teile zuerst das Ganze durch ${n}, dann nimm das Ergebnis mal ${z}.` };
      }
    }
    zeichne();
  }

  function tipp() {
    tipps++;
    if (modus === 'feld') g.sprich(tipps === 1 ? 'Zähle zuerst die vollen Reihen (je 10 Kästchen), dann die einzelnen Kästchen.' : `Es sind ${Math.floor(k / 10)} volle Reihen und ${k % 10} einzelne Kästchen.`, 'tipp');
    if (modus === 'bruch') {
      const { a, b, umgekehrt, p } = bp;
      if (umgekehrt) g.sprich(tipps === 1 ? `${p} % bedeutet ${p} von 100.` : `${bruchHtml(p, 100, 'klein')}: Suche die größte Zahl, durch die du ${p} und 100 teilen kannst (${ggT(p, 100)}).`, 'tipp');
      else g.sprich(tipps === 1 ? `Womit musst du ${b} malnehmen, um 100 zu bekommen?` : `${b} · ${100 / b} = 100. Erweitere also mit ${100 / b}: ${a} · ${100 / b} = ${p}.`, 'tipp');
    }
    if (modus === 'vergleich') {
      const { A } = vg;
      g.sprich(tipps === 1 ? 'Schreibe beide Anteile als Bruch mit Nenner 100.' : `${A.name}: ${bruchHtml(A.v, A.t, 'klein')} – erweitere mit ${100 / A.t}.`, 'tipp');
    }
    if (modus === 'von') {
      const { p, z, n, G } = pv;
      if (schritt === 1) g.sprich(tipps === 1 ? `${p} % = ${bruchHtml(p, 100, 'klein')}. Kann man kürzen?` : `${bruchHtml(p, 100, 'klein')} = ${bruchHtml(z, n, 'klein')}`, 'tipp');
      else g.sprich(tipps <= 2 ? `Ein Teil: ${G} : ${n}. Dann mal ${z}.` : `${G} : ${n} = ${G / n}.`, 'tipp');
    }
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const s = e.target.closest('[data-sieger]');
    if (s && modus === 'vergleich' && schritt === 2) {
      const { A, B } = vg;
      const richtig = A.p > B.p ? 'A' : A.p < B.p ? 'B' : 'gleich';
      if (s.dataset.sieger === richtig) {
        schritt = 3;
        bewertung = { ok: true, text: richtig === 'gleich' ? `Beide treffen ${A.p} % – gleich gut!` : `Richtig: ${richtig === 'A' ? A.name : B.name} trifft ${Math.max(A.p, B.p)} %, ${richtig === 'A' ? B.name : A.name} nur ${Math.min(A.p, B.p)} %.` };
        g.sprich('Mit Prozenten kann man Anteile gut vergleichen, auch wenn die Anzahl der Versuche verschieden ist.', 'fertig');
      } else bewertung = { ok: false, text: 'Vergleiche die Prozentzahlen, nicht die Anzahl der Treffer.' };
      zeichne(); return;
    }
    const b = e.target.closest('[data-pb]');
    if (!b) return;
    if (b.dataset.pb === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.pb === 'tipp') tipp();
    if (b.dataset.pb === 'pruefen') pruefen();
  });

  function startText() {
    g.sprich({
      feld: 'Prozent heißt „von Hundert“. Wie viele von 100 Kästchen sind gefärbt?',
      bruch: 'Bringe den Bruch auf den Nenner 100 – dann kannst du die Prozentzahl ablesen.',
      vergleich: 'Wer trifft besser? Rechne beide Anteile in Prozent um.',
      von: 'Schreibe die Prozentzahl als Bruch. Dann berechnest du den Teil wie bei „¾ von 24 €“.',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
