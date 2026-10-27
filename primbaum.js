/* Mathematik: Primfaktor-Baum.
   Eine Zahl wird so lange in zwei Faktoren gespalten, bis nur noch Primzahlen übrig sind.
   Die Primzahlen erscheinen als goldene Perlen – sie sind die Bausteine der Zahl. */

const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const istPrim = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
const kleinsterFaktor = n => { for (let k = 2; k * k <= n; k++) if (n % k === 0) return k; return n; };
const HOCH = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const hoch = n => String(n).split('').map(z => HOCH[z]).join('');

export const STUFEN_PB = [
  { stufe: 1, titel: 'Stufe 1', text: 'Zahlen bis 60', min: 12, max: 60 },
  { stufe: 2, titel: 'Stufe 2', text: 'Zahlen bis 200', min: 60, max: 200 },
  { stufe: 3, titel: 'Stufe 3', text: 'Zahlen bis 1000', min: 200, max: 1000 },
];

export function primfaktoren(n) {
  const f = [];
  let x = n;
  for (let k = 2; k * k <= x; k++) while (x % k === 0) { f.push(k); x /= k; }
  if (x > 1) f.push(x);
  return f;
}

/** Produkt in Potenzschreibweise, z. B. 2³ · 3 */
export function potenzSchreibweise(n) {
  const anz = new Map();
  for (const p of primfaktoren(n)) anz.set(p, (anz.get(p) || 0) + 1);
  return [...anz].map(([p, e]) => (e > 1 ? `${p}${hoch(e)}` : `${p}`)).join(' · ');
}

/** Zusammengesetzte Zahl mit mindestens drei Primfaktoren (gibt einen schönen Baum). */
export function zufallsZahlPB(stufe, ausser) {
  const s = STUFEN_PB.find(x => x.stufe === stufe) || STUFEN_PB[0];
  for (let i = 0; i < 500; i++) {
    const n = zufall(s.min, s.max);
    const f = primfaktoren(n);
    if (n !== ausser && f.length >= 3 && Math.max(...f) <= 31) return n;
  }
  return 24;
}

export function startePrimbaum(root, startZahl, { neueZahl } = {}) {
  let wurzel, aktiv, neuIds, meldungFehler;
  let idZaehler = 0;

  function knoten(wert) { return { id: ++idZaehler, wert, kinder: null }; }
  function neu(n) { wurzel = knoten(n); aktiv = istPrim(n) ? null : wurzel; neuIds = new Set([wurzel.id]); meldungFehler = null; }
  neu(startZahl);

  const blaetter = (k = wurzel) => (k.kinder ? k.kinder.flatMap(blaetter) : [k]);
  const fertig = () => blaetter().every(b => istPrim(b.wert));
  const finde = (id, k = wurzel) => (k.id === id ? k : k.kinder ? (finde(id, k.kinder[0]) || finde(id, k.kinder[1])) : null);
  const naechsterOffener = () => blaetter().find(b => !istPrim(b.wert)) || null;

  root.innerHTML = `
  <section class="pb">
    <div class="tb-kopf">
      <div><span class="etikett">Zerlege in Primfaktoren</span><div class="tb-zahl" id="pb-zahl"></div></div>
      <div class="tb-kopf-knoepfe">
        <button type="button" class="kn-gross kn-tipp" data-pb="tipp"><span aria-hidden="true">?</span> Tipp</button>
        <button type="button" class="kn-gross kn-leise" data-pb="vonvorn">↺ Anders zerlegen</button>
        ${neueZahl ? '<button type="button" class="kn-gross kn-leise" data-pb="neu">＋ Neue Zahl</button>' : ''}
      </div>
    </div>
    <div class="sprechblase info" id="pb-blase" role="status" aria-live="polite"></div>
    <div class="tb-flaeche">
      <div class="tb-links"><h2 class="bereich-titel">Faktorbaum</h2><div class="pb-baum" id="pb-baum"></div></div>
      <aside class="tb-rechts" id="pb-rechts"></aside>
    </div>
  </section>`;
  const $ = s => root.querySelector(s);

  function sprich(text, art = 'info') {
    const b = $('#pb-blase');
    b.className = `sprechblase ${art}`;
    b.innerHTML = `<span class="blase-symbol" aria-hidden="true">${art === 'fertig' ? '★' : art === 'tipp' ? '?' : 'i'}</span><span>${text}</span>`;
  }

  /* ---------- Baum zeichnen ---------- */
  function baumSvg() {
    const tiefe = k => (k.kinder ? 1 + Math.max(tiefe(k.kinder[0]), tiefe(k.kinder[1])) : 1);
    const T = tiefe(wurzel);
    const bl = blaetter();
    const dx = 76, dy = 92, r = 28;
    const pos = new Map();
    let i = 0;
    (function lege(k, d) {
      if (!k.kinder) { pos.set(k.id, { x: 50 + i * dx, y: 44 + d * dy }); i++; return; }
      lege(k.kinder[0], d + 1); lege(k.kinder[1], d + 1);
      const a = pos.get(k.kinder[0].id), b = pos.get(k.kinder[1].id);
      pos.set(k.id, { x: (a.x + b.x) / 2, y: 44 + d * dy });
    })(wurzel, 0);
    const W = Math.max(260, 100 + (bl.length - 1) * dx), H = 88 + (T - 1) * dy;
    let linien = '', kreise = '';
    (function male(k) {
      const p = pos.get(k.id);
      if (k.kinder) {
        for (const c of k.kinder) {
          const q = pos.get(c.id);
          linien += `<line class="pb-ast${neuIds.has(c.id) ? ' neu' : ''}" x1="${p.x}" y1="${p.y + r}" x2="${q.x}" y2="${q.y - r}"/>`;
          male(c);
        }
      }
      const prim = istPrim(k.wert);
      const kl = ['pb-knoten', prim ? 'prim' : k.kinder ? 'zerlegt' : 'offen', aktiv?.id === k.id ? 'aktiv' : '', neuIds.has(k.id) ? 'neu' : ''].join(' ');
      kreise += `<g class="${kl}" data-knoten="${k.id}" tabindex="0" role="button" aria-label="${k.wert}${prim ? ', Primzahl' : ''}">
        <circle cx="${p.x}" cy="${p.y}" r="${r}"/>
        <text x="${p.x}" y="${p.y + 8}" text-anchor="middle">${k.wert}</text></g>`;
    })(wurzel);
    return `<svg viewBox="0 0 ${W} ${H}" style="max-width:${W * 1.25}px" role="img" aria-label="Faktorbaum">${linien}${kreise}</svg>`;
  }

  function rechtsHtml() {
    if (fertig()) {
      const f = primfaktoren(wurzel.wert);
      return `
        <h2 class="bereich-titel">Ergebnis</h2>
        <div class="pb-ergebnis">
          <div class="pb-perlen">${f.map(p => `<span class="pb-perle">${p}</span>`).join('<span class="pb-mal">·</span>')}</div>
          <p class="pb-gleichung">${wurzel.wert} = ${f.join(' · ')}</p>
          ${f.length > new Set(f).size ? `<p class="pb-gleichung">${wurzel.wert} = ${potenzSchreibweise(wurzel.wert)}</p>` : ''}
          <p class="leise">Probiere „Anders zerlegen“: Egal wie du anfängst – am Ende stehen immer dieselben Primzahlen da.</p>
        </div>`;
    }
    if (!aktiv) return '<p>Tippe im Baum auf eine Zahl, die noch keine Primzahl ist.</p>';
    const w = aktiv.wert;
    let tasten = '';
    for (let d = 2; d <= Math.min(13, w - 1); d++) tasten += `<button type="button" class="tb-k" data-teile="${d}">${d}</button>`;
    return `
      <h2 class="bereich-titel">Womit teilst du ${w}?</h2>
      <p class="leise">Wähle einen Teiler. Dann wachsen zwei Äste: der Teiler und das Ergebnis.</p>
      <div class="tb-leiste">${tasten}</div>
      <form class="pb-andere" id="pb-andere">
        <label for="pb-zahl-ein">Andere Zahl:</label>
        <input id="pb-zahl-ein" inputmode="numeric" autocomplete="off">
        <button type="submit" class="kn-gross">Teilen</button>
      </form>
      ${meldungFehler ? `<p class="tb-ergebnis schlecht">${meldungFehler}</p>` : ''}`;
  }

  function zeichne() {
    $('#pb-zahl').textContent = wurzel.wert;
    $('#pb-baum').innerHTML = baumSvg();
    $('#pb-rechts').innerHTML = rechtsHtml();
    neuIds = new Set();
  }

  /* ---------- Aktionen ---------- */
  function teile(d) {
    if (!aktiv) return;
    const w = aktiv.wert;
    if (!(d > 1 && d < w)) { meldungFehler = `Wähle eine Zahl größer als 1 und kleiner als ${w}.`; zeichne(); return; }
    if (w % d !== 0) {
      meldungFehler = `${w} : ${d} = ${Math.floor(w / d)} Rest ${w % d}. ${d} ist kein Teiler von ${w}.`;
      zeichne(); return;
    }
    meldungFehler = null;
    const a = Math.min(d, w / d), b = Math.max(d, w / d);
    aktiv.kinder = [knoten(a), knoten(b)];
    neuIds = new Set(aktiv.kinder.map(k => k.id));
    const geteilt = aktiv;
    const primText = aktiv.kinder.filter(k => istPrim(k.wert)).map(k => k.wert);
    aktiv = naechsterOffener();
    if (fertig()) sprich(`Geschafft! Unten im Baum stehen nur noch Primzahlen: ${wurzel.wert} = ${primfaktoren(wurzel.wert).join(' · ')}.`, 'fertig');
    else sprich(`${geteilt.wert} = ${a} · ${b}.${primText.length ? ` ${primText.join(' und ')} ${primText.length > 1 ? 'sind Primzahlen' : 'ist eine Primzahl'} – ${primText.length > 1 ? 'sie werden' : 'sie wird'} zur goldenen Perle.` : ''} Jetzt zerlege ${aktiv.wert}.`);
    zeichne();
  }

  function tipp() {
    if (fertig()) { sprich('Der Baum ist fertig. Probiere, ihn anders zu zerlegen.', 'tipp'); return; }
    const w = aktiv.wert, p = kleinsterFaktor(w);
    const qs = String(w).split('').reduce((s, z) => s + Number(z), 0);
    let text;
    if (p === 2) text = `${w} ist gerade (letzte Ziffer ${w % 10}). Gerade Zahlen sind durch 2 teilbar.`;
    else if (p === 3) text = `Die Quersumme von ${w} ist ${qs}, und ${qs} ist durch 3 teilbar. Also ist auch ${w} durch 3 teilbar.`;
    else if (p === 5) text = `${w} endet auf ${w % 10}. Zahlen, die auf 0 oder 5 enden, sind durch 5 teilbar.`;
    else text = `${w} ist nicht durch 2, 3 oder 5 teilbar. Probiere ${p}.`;
    sprich(text, 'tipp');
    root.querySelector(`[data-teile="${p}"]`)?.classList.add('tipp-ziel');
  }

  root.addEventListener('click', e => {
    const k = e.target.closest('[data-knoten]');
    if (k) {
      const kn = finde(Number(k.dataset.knoten));
      if (!kn) return;
      if (istPrim(kn.wert)) { sprich(`${kn.wert} ist eine Primzahl: Sie hat nur die Teiler 1 und ${kn.wert}. Hier wächst kein Ast mehr.`); return; }
      if (kn.kinder) { sprich(`${kn.wert} ist schon zerlegt: ${kn.wert} = ${kn.kinder[0].wert} · ${kn.kinder[1].wert}.`); return; }
      aktiv = kn; meldungFehler = null; zeichne(); return;
    }
    const t = e.target.closest('[data-teile]');
    if (t) { teile(Number(t.dataset.teile)); return; }
    const b = e.target.closest('[data-pb]');
    if (!b) return;
    if (b.dataset.pb === 'tipp') tipp();
    if (b.dataset.pb === 'vonvorn') { neu(wurzel.wert); zeichne(); sprich('Der Baum ist wieder leer. Fang diesmal mit einem anderen Teiler an!'); }
    if (b.dataset.pb === 'neu') { neu(neueZahl()); zeichne(); sprich(`Neue Zahl: ${wurzel.wert}. Womit kannst du sie teilen?`); }
  });

  root.addEventListener('submit', e => {
    if (e.target.id !== 'pb-andere') return;
    e.preventDefault();
    const v = Number(root.querySelector('#pb-zahl-ein').value.trim());
    if (Number.isInteger(v)) teile(v);
  });

  zeichne();
  sprich(istPrim(startZahl)
    ? `${startZahl} ist schon eine Primzahl – sie lässt sich nicht zerlegen.`
    : `Zerlege ${startZahl} in zwei Faktoren. Wähle rechts einen Teiler.`);
}
