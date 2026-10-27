/* Mathematik: Dezimalzahlen verstehen (Klasse 6).
   „Stellentafel“: Eine Dezimalzahl mit Plättchen legen (+/−), zehn Plättchen einer Stelle werden zu einem der Stelle links
     gebündelt – oder umgekehrt: die gelegte Zahl ablesen und mit Komma schreiben. Zwischennullen werden sichtbar.
   „Lupe“: Zahlenstrahl, in jeden Abschnitt kann man hineinzoomen (Zehntel → Hundertstel → Tausendstel).
     Aufgaben: Wo liegt 2,37? / Finde eine Zahl zwischen 2,22 und 2,23.
   „Vergleichen“: Welche Zahl ist größer? Danach stehen beide Zahlen untereinander in der Stellentafel (mit Nullen aufgefüllt)
     und als Streifen. Typische Fallen: 0,5 und 0,45 – die längere Zahl ist nicht größer. */

import { geruest, zufall, wahl, antwortHtml, ESC } from './geruest.js';

const SPALTEN = [
  { k: 'Z', name: 'Zehner', w: 10, farbe: '#2f6fe4' },
  { k: 'E', name: 'Einer', w: 1, farbe: '#2fae58' },
  { k: 'z', name: 'Zehntel', w: 0.1, farbe: '#f07d2a' },
  { k: 'h', name: 'Hundertstel', w: 0.01, farbe: '#d6336c' },
  { k: 't', name: 'Tausendstel', w: 0.001, farbe: '#7a3cc2' },
];

/** Zahl in Tausendsteln (ganzzahlig, damit nichts gerundet werden muss). */
const tausend = s => Math.round(Number(String(s).replace(',', '.')) * 1000);
/** Tausendstel → Text mit Komma, ohne überflüssige Nullen. */
function text(t) {
  const neg = t < 0; t = Math.abs(t);
  const g = Math.floor(t / 1000); let r = String(t % 1000).padStart(3, '0').replace(/0+$/, '');
  return (neg ? '−' : '') + g + (r ? ',' + r : '');
}
/** Ziffern je Spalte aus Tausendsteln: [Z, E, z, h, t] */
const ziffern = t => [Math.floor(t / 10000) % 10, Math.floor(t / 1000) % 10, Math.floor(t / 100) % 10, Math.floor(t / 10) % 10, t % 10];
const wertVon = anz => anz.reduce((s, a, i) => s + a * [10000, 1000, 100, 10, 1][i], 0);
const lies = s => { const v = String(s ?? '').trim().replace(/\s/g, '').replace('.', ','); if (!/^\d+(,\d+)?$/.test(v)) return null; return tausend(v); };

export function starteDezimal(root) {
  let modus = 'tafel', bewertung = null, eing = '';
  let tf;      // tafel: { ziel, art: 'legen'|'lesen', anz:[5] }
  let lu;      // lupe: { art: 'wo'|'zwischen', ziel, a, b, lo, stufe, gewaehlt }
  let vg;      // vergleichen: { a, b, wahl }

  const g = geruest(root, {
    etikett: 'Dezimalzahlen', titel: '',
    reiter: [{ id: 'tafel', titel: 'Stellentafel', unter: 'legen und lesen' }, { id: 'lupe', titel: 'Zahlenstrahl mit Lupe', unter: 'hineinzoomen' }, { id: 'vergleichen', titel: 'Vergleichen', unter: 'Welche ist größer?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-dz="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-dz="neu">＋ Neue Aufgabe</button>`,
  });

  /* ---------------- Aufgaben ---------------- */
  function zufallsZahl() {
    // oft mit Zwischennullen (3,07 / 12,405 / 0,09)
    const muster = wahl(['E,z', 'E,zh', 'E,0h', 'ZE,zh', 'E,zht', 'E,0ht', '0,0h', 'ZE,z0t', '0,zh']);
    let t = 0;
    if (muster.startsWith('ZE')) t += zufall(1, 9) * 10000;
    if (!muster.startsWith('0')) t += zufall(muster.startsWith('ZE') ? 0 : 1, 9) * 1000;
    const nach = muster.split(',')[1];
    [...nach].forEach((c, i) => { if (c !== '0') t += zufall(1, 9) * [100, 10, 1][i]; });
    return t;
  }

  function neu() {
    bewertung = null; eing = '';
    if (modus === 'tafel') {
      const ziel = zufallsZahl();
      const art = wahl(['legen', 'legen', 'lesen']);
      tf = { ziel, art, anz: art === 'lesen' ? ziffern(ziel) : [0, 0, 0, 0, 0] };
      if (art === 'lesen' && Math.random() < 0.5) {   // ungebündelt: z. B. 12 Hundertstel
        const i = wahl([2, 3, 4].filter(j => tf.anz[j - 1] > 0));
        if (i) { tf.anz[i - 1]--; tf.anz[i] += 10; }
      }
    }
    if (modus === 'lupe') {
      const g0 = zufall(0, 8);
      if (Math.random() < 0.5) {
        const st = wahl([2, 2, 3]);
        const ziel = g0 * 1000 + (st === 2 ? zufall(1, 99) * 10 : zufall(1, 999));
        lu = { art: 'wo', ziel, lo: g0 * 1000, stufe: 0, gewaehlt: null };
      } else {
        const st = wahl([1, 2]);   // Zehntel- oder Hundertstel-Nachbarn
        const schritt = st === 1 ? 100 : 10;
        const a = g0 * 1000 + zufall(1, 1000 / schritt - 2) * schritt;
        lu = { art: 'zwischen', a, b: a + schritt, lo: g0 * 1000, stufe: 0, gewaehlt: null };
      }
    }
    if (modus === 'vergleichen') {
      const g0 = zufall(0, 9) * 1000;
      const fallen = [
        () => { const z = zufall(2, 8) * 100; return [g0 + z, g0 + z - zufall(1, 9) * 10 + zufall(1, 9)]; },       // 0,5 / 0,45…
        () => { const z = zufall(1, 9) * 100; return [g0 + z, g0 + z]; },                                         // 0,4 / 0,40 (gleich)
        () => { const z = zufall(11, 99) * 10; return [g0 + z, g0 + Math.floor(z / 100) * 100 + zufall(1, 9)]; }, // 0,35 / 0,307
        () => [g0 + zufall(1, 9) * 10, g0 + zufall(1, 9) * 100],                                                    // 0,07 / 0,3
      ];
      let [a, b] = wahl(fallen)();
      if (Math.random() < 0.5) [a, b] = [b, a];
      const anzeige = (t, mitNull) => { let s = text(t); if (mitNull && !s.includes(',')) s += ',0'; else if (mitNull) s += '0'; return s; };
      const gleich = a === b;
      vg = { a, b, ta: text(a), tb: gleich ? anzeige(b, true) : text(b), wahl: null };
    }
  }

  /* ---------------- Stellentafel ---------------- */
  function plaettchen(n, farbe) {
    return Array.from({ length: n }, (_, i) => `<span class="dz-pl" style="--f:${farbe}; --i:${i}"></span>`).join('');
  }
  function tafelHtml() {
    const legen = tf.art === 'legen' && !bewertung?.ok;
    return `<div class="dz-tafel">
      ${SPALTEN.map((s, i) => `<div class="dz-spalte${i === 2 ? ' nachkomma' : ''}">
        <div class="dz-kopf" style="--f:${s.farbe}" title="${s.name}">${s.k}<small>${s.name}</small></div>
        <div class="dz-feld${tf.anz[i] >= 10 ? ' voll' : ''}">${plaettchen(tf.anz[i], s.farbe)}</div>
        <div class="dz-zahl">${tf.anz[i]}</div>
        ${legen ? `<div class="dz-pm"><button type="button" class="kn-gross" data-plus="${i}" aria-label="${s.name} plus">＋</button><button type="button" class="kn-gross kn-leise" data-minus="${i}" aria-label="${s.name} minus">−</button></div>` : ''}
        ${tf.anz[i] >= 10 && i > 0 ? `<button type="button" class="kn-gross dz-buendel" data-buendel="${i}">10 → 1 ${SPALTEN[i - 1].k}</button>` : ''}
        ${legen && tf.anz[i] === 0 && i < 4 && tf.anz[i] < 10 && i > 0 ? '' : ''}
      </div>`).join('')}
      <div class="dz-komma" aria-hidden="true">,</div>
    </div>`;
  }
  function rechtsTafel() {
    if (tf.art === 'legen') {
      return `<h2 class="bereich-titel">Lege die Zahl</h2><p class="rr-gross">${text(tf.ziel)}</p>
        <p class="leise">Jede Ziffer gehört in ihre Spalte. Die erste Stelle nach dem Komma sind die Zehntel.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-dz="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    return `<h2 class="bereich-titel">Welche Zahl liegt in der Tafel?</h2>
      <p class="dz-zeile">${feld('dz-e', 'Zahl mit Komma')}</p>
      <p class="leise">Liegen 10 oder mehr Plättchen in einer Spalte, bündle zuerst: 10 Hundertstel sind 1 Zehntel.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-dz="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }
  const feld = (id, label) => `<input class="gs-ein dz-ein" id="${id}" data-dzein inputmode="decimal" autocomplete="off" value="${ESC(eing)}" aria-label="${label}">`;

  function pruefeTafel() {
    if (tf.art === 'legen') {
      const ist = wertVon(tf.anz);
      const ok = ist === tf.ziel && tf.anz.every(a => a < 10);
      if (ok) bewertung = { ok, text: `Richtig gelegt: ${text(tf.ziel)}` };
      else if (ist === tf.ziel) bewertung = { ok: false, text: 'Der Wert stimmt – aber bündle noch: In jeder Spalte dürfen höchstens 9 Plättchen liegen.' };
      else {
        const soll = ziffern(tf.ziel), falsch = SPALTEN.filter((s, i) => soll[i] !== tf.anz[i]).map(s => s.name);
        bewertung = { ok: false, text: `Noch nicht. Schau auf: ${falsch.join(', ')}.${soll[2] === 0 && tf.ziel % 1000 ? ' Eine Null nach dem Komma heißt: 0 Zehntel.' : ''}` };
      }
    } else {
      const v = lies(eing), soll = wertVon(tf.anz);
      if (v === null) bewertung = { ok: false, text: 'Schreibe eine Zahl mit Komma, z. B. 3,07.' };
      else if (v === soll) bewertung = { ok: true, text: `Richtig: ${text(soll)}` };
      else {
        const ohneNull = Number(String(text(soll)).replace(/,0+/, ','));
        bewertung = { ok: false, text: lies(text(soll).replace(/,0+(\d)/, ',$1')) === v ? 'Achte auf die Null: Eine leere Spalte zwischen den Ziffern schreibt man als 0.' : 'Noch nicht. Lies Spalte für Spalte – bündle vorher, wenn 10 oder mehr in einer Spalte liegen.' };
        void ohneNull;
      }
    }
    if (bewertung.ok) g.sprich('Jede Stelle ist zehnmal so viel wert wie die Stelle rechts daneben.', 'fertig');
    zeichne();
  }

  /* ---------------- Lupe ---------------- */
  const BREITE = 660, X0 = 30, X1 = 630;
  const schrittT = () => [1000, 100, 10, 1][lu.stufe];          // Abstand der Striche in Tausendsteln
  const spanneT = () => schrittT() * 10;
  function lupeHtml() {
    const s = schrittT(), lo = lu.lo, X = t => X0 + ((t - lo) / (s * 10)) * (X1 - X0);
    let h = `<line x1="${X0 - 10}" y1="90" x2="${X1 + 14}" y2="90" class="dz-linie"/>`;
    for (let i = 0; i <= 10; i++) {
      const t = lo + i * s, x = X(t);
      h += `<line x1="${x}" y1="${i % 5 ? 80 : 72}" x2="${x}" y2="${i % 5 ? 100 : 108}" class="dz-strich"/>`;
      h += `<text x="${x}" y="${i % 2 && lu.stufe ? 140 : 128}" class="dz-st-zahl${i % 5 ? ' klein' : ''}">${text(t)}</text>`;
      if (lu.stufe < 3) {
        if (i < 10) h += `<rect x="${x + 2}" y="40" width="${(X1 - X0) / 10 - 4}" height="28" rx="6" class="dz-zoom" data-zoom="${i}"><title>hineinzoomen</title></rect>`;
      }
      h += `<circle cx="${x}" cy="90" r="11" class="dz-tick${lu.gewaehlt === t ? (bewertung?.ok ? ' richtig' : ' falsch') : ''}" data-tick="${t}"/>`;
    }
    if (lu.stufe < 3) h += `<text x="${X0}" y="32" class="dz-hinweis">🔍 Tippe über einen Abschnitt, um hineinzuzoomen</text>`;
    return `<svg class="dz-svg" viewBox="0 0 ${BREITE} 150" role="img" aria-label="Zahlenstrahl von ${text(lo)} bis ${text(lo + spanneT())}">${h}</svg>`;
  }
  function linksLupe() {
    const stufen = ['Einer', 'Zehntel', 'Hundertstel', 'Tausendstel'];
    return `<div class="dz-huelle">${lupeHtml()}</div>
      <div class="dz-lupe-leiste"><span class="dz-stufe">Einteilung: ${stufen[lu.stufe]}</span>
        <button type="button" class="kn-gross kn-leise" data-dz="raus" ${lu.stufe ? '' : 'disabled'}>🔍− herauszoomen</button></div>`;
  }
  function rechtsLupe() {
    const auf = lu.art === 'wo' ? `<h2 class="bereich-titel">Wo liegt diese Zahl?</h2><p class="rr-gross">${text(lu.ziel)}</p><p>Zoome hinein, bis es einen Strich für diese Zahl gibt, und tippe ihn an.</p>`
      : `<h2 class="bereich-titel">Finde eine Zahl dazwischen</h2><p class="rr-gross">${text(lu.a)} &lt; ? &lt; ${text(lu.b)}</p><p>Zoome so lange hinein, bis zwischen den beiden Zahlen Striche liegen. Tippe einen davon an.</p>`;
    return auf + antwortHtml(bewertung);
  }
  function tickGetippt(t) {
    lu.gewaehlt = t;
    if (lu.art === 'wo') {
      bewertung = t === lu.ziel ? { ok: true, text: `Richtig: ${text(t)}` } : { ok: false, text: `Das ist ${text(t)}. Gesucht ist ${text(lu.ziel)}.${t < lu.ziel ? ' Weiter rechts.' : ' Weiter links.'}` };
    } else {
      bewertung = t > lu.a && t < lu.b ? { ok: true, text: `Richtig: ${text(lu.a)} < ${text(t)} < ${text(lu.b)}` }
        : { ok: false, text: t === lu.a || t === lu.b ? 'Das ist eine der beiden Zahlen selbst – gesucht ist eine Zahl dazwischen. Zoome hinein!' : `${text(t)} liegt nicht dazwischen.` };
    }
    if (bewertung.ok) g.sprich(lu.art === 'zwischen' ? 'Zwischen zwei Dezimalzahlen findest du immer noch eine – du musst nur fein genug einteilen.' : 'Mit der Lupe wird jeder Abschnitt in 10 kleinere geteilt.', 'fertig');
    zeichne();
  }

  /* ---------------- Vergleichen ---------------- */
  function linksVergleich() {
    if (!vg.wahl) return `<div class="dz-vg-start"><p class="rr-gross">${vg.ta} <span class="dz-frage">?</span> ${vg.tb}</p><p class="leise">Entscheide zuerst. Danach siehst du beide Zahlen in der Stellentafel und als Streifen.</p></div>`;
    const za = ziffern(vg.a), zb = ziffern(vg.b);
    const reihe = (z, t, f) => `<tr>${z.map((d, i) => `<td class="${i === 2 ? 'nk' : ''}${zifferAuffuellen(t, i) ? ' aufgefuellt' : ''}" style="color:${f}">${i === 0 && d === 0 ? '' : d}</td>`).join('')}</tr>`;
    const max = Math.max(vg.a, vg.b), basis = Math.floor(Math.min(vg.a, vg.b) / 1000) * 1000;
    const sp = Math.max(1000, Math.ceil((max - basis) / 1000) * 1000);
    const breite = t => ((t - basis) / sp) * 100;
    return `<table class="dz-vgtab"><thead><tr>${SPALTEN.map((s, i) => `<th class="${i === 2 ? 'nk' : ''}" style="color:${s.farbe}">${s.k}</th>`).join('')}</tr></thead>
        <tbody>${reihe(za, vg.ta, '#e0262b')}${reihe(zb, vg.tb, '#2f6fe4')}</tbody></table>
      <p class="leise">Grau: aufgefüllte Nullen – sie ändern den Wert nicht.</p>
      <div class="dz-balken"><div class="dz-bal a" style="width:${breite(vg.a)}%"><span>${vg.ta}</span></div><div class="dz-bal b" style="width:${breite(vg.b)}%"><span>${vg.tb}</span></div>
        <div class="dz-skala"><span>${text(basis)}</span><span>${text(basis + sp)}</span></div></div>`;
  }
  /** Ist diese Stelle nur zum Vergleichen mit 0 aufgefüllt? */
  function zifferAuffuellen(t, i) {
    const nk = (t.split(',')[1] || '').length;
    return i >= 2 && i - 2 >= nk;
  }
  function rechtsVergleich() {
    return `<h2 class="bereich-titel">Welche Zahl ist größer?</h2>
      <p class="bk-gross"><span style="color:#e0262b">${vg.ta}</span> <span class="bk-zeichen">${vg.wahl ?? '?'}</span> <span style="color:#2f6fe4">${vg.tb}</span></p>
      <div class="bk-zeichenwahl">${['<', '=', '>'].map(z => `<button type="button" class="kn-gross${vg.wahl === z ? ' gewaehlt' : ''}" data-z="${z}" ${bewertung?.ok ? 'disabled' : ''}>${z}</button>`).join('')}</div>${antwortHtml(bewertung)}`;
  }
  function vergleiche(z) {
    vg.wahl = z;
    const soll = vg.a < vg.b ? '<' : vg.a > vg.b ? '>' : '=';
    bewertung = z === soll ? { ok: true, text: soll === '=' ? `Richtig: ${vg.ta} und ${vg.tb} sind gleich – Nullen am Ende ändern nichts.` : 'Richtig!' }
      : { ok: false, text: 'Leider nicht. Vergleiche Stelle für Stelle von links – nicht, welche Zahl länger ist.' };
    if (bewertung.ok) g.sprich('Vergleiche von links: erst die Einer, dann die Zehntel, dann die Hundertstel.', 'fertig');
    zeichne();
  }

  /* ---------------- gemeinsam ---------------- */
  function zeichne() {
    g.reiter(modus);
    g.titel({ tafel: 'Dezimalzahlen in der Stellentafel', lupe: 'Zahlenstrahl mit Lupe', vergleichen: 'Dezimalzahlen vergleichen' }[modus]);
    if (modus === 'tafel') { g.links.innerHTML = tafelHtml(); g.rechts.innerHTML = rechtsTafel(); }
    if (modus === 'lupe') { g.links.innerHTML = linksLupe(); g.rechts.innerHTML = rechtsLupe(); }
    if (modus === 'vergleichen') { g.links.innerHTML = linksVergleich(); g.rechts.innerHTML = rechtsVergleich(); }
  }
  function tipp() {
    if (modus === 'tafel') g.sprich(tf.art === 'legen' ? 'Lies die Zahl Ziffer für Ziffer: vor dem Komma Zehner und Einer, danach Zehntel, Hundertstel, Tausendstel.' : 'Tippe auf „10 → 1“, wenn in einer Spalte 10 oder mehr liegen. Dann lies die Ziffern von links nach rechts.', 'tipp');
    if (modus === 'lupe') g.sprich(lu.art === 'wo' ? `Die Zahl hat ${(text(lu.ziel).split(',')[1] || '').length} Stellen nach dem Komma – so oft musst du hineinzoomen.` : 'Zoome in den Abschnitt, der bei der kleineren Zahl beginnt.', 'tipp');
    if (modus === 'vergleichen') g.sprich('Fülle mit Nullen auf, bis beide gleich viele Stellen nach dem Komma haben: 0,5 = 0,50.', 'tipp');
  }

  root.addEventListener('input', e => { if (e.target.matches('[data-dzein]')) { e.target.value = e.target.value.replace(/[^\d,.]/g, '').replace('.', ','); eing = e.target.value; } });
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const p = e.target.closest('[data-plus]'), m = e.target.closest('[data-minus]');
    if (p && tf.anz[+p.dataset.plus] < 10) { tf.anz[+p.dataset.plus]++; bewertung = null; zeichne(); if (tf.anz[+p.dataset.plus] === 10 && +p.dataset.plus > 0) g.sprich('10 Plättchen! Bündle sie zu einem Plättchen der Stelle links.', 'tipp'); return; }
    if (m && tf.anz[+m.dataset.minus] > 0) { tf.anz[+m.dataset.minus]--; bewertung = null; zeichne(); return; }
    const b = e.target.closest('[data-buendel]');
    if (b) { const i = +b.dataset.buendel; tf.anz[i] -= 10; tf.anz[i - 1]++; g.sprich(`10 ${SPALTEN[i].name} = 1 ${SPALTEN[i - 1].name.replace(/n$/, '').replace('Einer', 'Einer')}`); zeichne(); return; }
    const zo = e.target.closest('[data-zoom]');
    if (zo && modus === 'lupe' && lu.stufe < 3) { lu.lo += +zo.dataset.zoom * schrittT(); lu.stufe++; bewertung = null; zeichne(); return; }
    const tk = e.target.closest('[data-tick]');
    if (tk && modus === 'lupe' && !bewertung?.ok) { tickGetippt(+tk.dataset.tick); return; }
    const z = e.target.closest('[data-z]');
    if (z && modus === 'vergleichen') { vergleiche(z.dataset.z); return; }
    const k = e.target.closest('[data-dz]');
    if (!k) return;
    if (k.dataset.dz === 'neu') { neu(); zeichne(); start(); }
    if (k.dataset.dz === 'pruefen') pruefeTafel();
    if (k.dataset.dz === 'tipp') tipp();
    if (k.dataset.dz === 'raus' && lu.stufe) { lu.stufe--; const s = schrittT() * 10; lu.lo = Math.floor(lu.lo / s) * s; bewertung = null; zeichne(); }
  });

  function start() {
    g.sprich({
      tafel: 'Dezimalzahlen haben Stellen wie die natürlichen Zahlen – nach dem Komma kommen Zehntel, Hundertstel und Tausendstel.',
      lupe: 'Mit der Lupe teilst du jeden Abschnitt wieder in 10 Teile.',
      vergleichen: 'Ist die längere Zahl immer die größere? Probiere es aus!',
    }[modus]);
  }
  neu(); zeichne(); start();
}
