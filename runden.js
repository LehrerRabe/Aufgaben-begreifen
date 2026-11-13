/* Mathematik: Dezimalzahlen runden (Klasse 6, UV „Brüche in Dezimalschreibweise“).
   „Mit der Lupe“: 1. Zwischen welchen Nachbarn liegt die Zahl? 2. Am vergrößerten Zahlenstrahl (mit Mitte) den näheren
     Nachbarn antippen. 3. Gerundete Zahl schreiben (Nullen am Ende mitschreiben: 7,0). Danach wird die entscheidende Ziffer markiert.
     Fallen: Übertrag (2,96 → 3,0), „nicht schrittweise runden“ (1,449 → 1,4), genau die Mitte (2,35 → 2,4).
   „Im Sachkontext“: Wie genau ist sinnvoll? Stelle wählen (mit Bedeutung: 1 Cent, 1 cm …), dann runden.
     Beim Weitsprung wird immer abgerundet. Rechnet intern mit Zehntausendsteln (ganze Zahlen). */

import { geruest, zufall, wahl, antwortHtml, ESC } from './geruest.js';

const N = 10000;
const STELLEN = [
  { name: 'Einer', s: 10000, d: 0 }, { name: 'Zehntel', s: 1000, d: 1 },
  { name: 'Hundertstel', s: 100, d: 2 }, { name: 'Tausendstel', s: 10, d: 3 },
];

/** Zehntausendstel → Text mit Komma; d = feste Anzahl Nachkommastellen (sonst ohne Endnullen). */
function txt(v, d = null) {
  const g = Math.floor(v / N);
  let r = String(v % N).padStart(4, '0');
  r = d === null ? r.replace(/0+$/, '') : r.slice(0, d);
  return g + (r ? ',' + r : '');
}
function lies(s) {
  s = String(s ?? '').trim().replace(/\s/g, '').replace('.', ',');
  if (!/^\d+(,\d{0,4})?$/.test(s)) return null;
  const [a, b = ''] = s.split(',');
  return { v: Number(a) * N + Number(b.padEnd(4, '0')), d: b.length };
}
const runde = (v, s, ab = false) => (ab ? Math.floor(v / s) * s : Math.floor((v + s / 2) / s) * s);

/* ---------- Sachkontexte ---------- */
const KONTEXTE = [
  () => { const v = zufall(155, 199) * 100 + zufall(1, 9) * 10; return {
    bild: '⛽', text: `An der Tankstelle kostet 1 Liter Benzin <b>${txt(v)} €</b>. Du tankst genau 1 Liter. Was zeigt die Kasse?`,
    v, einheit: '€', st: 2, bed: ['ganze Euro', '10 Cent', '1 Cent', 'ein Zehntel Cent'], warum: 'Bezahlen kann man nur ganze Cent – also auf Hundertstel Euro.' }; },
  () => { const v = zufall(13000, 16500) + zufall(1, 9); return {
    bild: '📏', text: `Das Messgerät beim Arzt zeigt: Lea ist <b>${txt(v)} m</b> groß. Was trägst du in den Sportpass ein?`,
    v, einheit: 'm', st: 2, bed: ['ganze Meter', 'Dezimeter', 'Zentimeter', 'Millimeter'], warum: 'Körpergrößen gibt man auf ganze Zentimeter an. 1 cm ist ein Hundertstel Meter.' }; },
  () => { const v = (zufall(250, 420) * 10 + zufall(1, 9)) * 10; return {
    bild: '🏃', text: `Ben springt beim Weitsprung <b>${txt(v)} m</b> weit. <i>Im Wettkampf wird auf ganze Zentimeter <u>ab</u>gerundet.</i> Was wird notiert?`,
    v, einheit: 'm', st: 2, ab: true, bed: ['ganze Meter', 'Dezimeter', 'Zentimeter', 'Millimeter'], warum: 'Weiten werden auf ganze Zentimeter notiert – und immer abgerundet. So bekommt niemand mehr gutgeschrieben, als er gesprungen ist.' }; },
  () => { const v = zufall(5, 28) * N + zufall(11, 99) * 100; return {
    bild: '🌡️', text: `Die Wetterstation misst <b>${txt(v)} °C</b>. Welche Temperatur sagt der Radiosprecher an?`,
    v, einheit: '°C', st: 0, bed: ['ganze Grad', 'Zehntelgrad', 'Hundertstelgrad', 'Tausendstelgrad'], warum: 'Im Wetterbericht reichen ganze Grad – genauer braucht das niemand.' }; },
  () => { const v = zufall(12, 79) * N + zufall(11, 99) * 100; return {
    bild: '🚗', text: `Der Routenplaner zeigt <b>${txt(v)} km</b> bis zu Oma. Du erzählst es deinem Freund.`,
    v, einheit: 'km', st: 0, bed: ['ganze Kilometer', '100 m', '10 m', '1 m'], warum: 'Beim Erzählen reicht ein ungefährer Wert in ganzen Kilometern.' }; },
  () => { const v = zufall(600, 999) * 10 + zufall(1, 9); return {
    bild: '⚖️', text: `Eine Rechnung ergibt für die Äpfel <b>${txt(v)} kg</b>. Die Küchenwaage zeigt aber nur ganze Gramm an. Was zeigt sie?`,
    v, einheit: 'kg', st: 3, bed: ['ganze Kilogramm', '100 g', '10 g', '1 g'], warum: '1 g ist ein Tausendstel Kilogramm – also auf Tausendstel runden.' }; },
  () => { const v = zufall(3, 19) * 1000 + zufall(1, 9) * 100 + zufall(1, 9) * 10; return {
    bild: '🥛', text: `Für einen Kuchen braucht man <b>${txt(v)} l</b> Milch. Dein Messbecher hat nur Striche für jeden Zehntelliter (100 ml). Wie viel misst du ab?`,
    v, einheit: 'l', st: 1, bed: ['ganze Liter', 'Zehntelliter (100 ml)', 'Hundertstelliter (10 ml)', 'Milliliter'], warum: 'Genauer als auf Zehntelliter kann man mit diesem Messbecher nicht abmessen.' }; },
];

const STIL = `<style id="rd-stil">
.rd-zahl { font: 800 clamp(2rem, 6vw, 3rem)/1.1 var(--titel); font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.rd-zahl .ent { background: var(--tipp); border-radius: 6px; padding: 0 .1em; }
.rd-zahl .ziel { text-decoration: underline 4px var(--akzent); text-underline-offset: 6px; }
.rd-svg { width: 100%; max-width: 680px; display: block; margin: .5rem auto; touch-action: manipulation; }
.rd-svg .linie { stroke: var(--text, #222); stroke-width: 3; }
.rd-svg .strich { stroke: var(--text, #222); stroke-width: 2; }
.rd-svg .mitte { stroke: #e0457b; stroke-width: 4; }
.rd-svg text { font: 700 17px var(--schrift); text-anchor: middle; fill: var(--text, #222); }
.rd-svg text.mt { fill: #e0457b; font-size: 15px; }
.rd-svg .nb { fill: #fff; stroke: var(--akzent); stroke-width: 4; cursor: pointer; }
.rd-svg .nb.richtig { fill: var(--gut-sanft); stroke: var(--gut); }
.rd-svg .nb.falsch { fill: var(--schlecht-sanft); stroke: var(--schlecht); }
.rd-svg .punkt { fill: #2f6fe4; }
.rd-reihe { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin: .5rem 0; font-size: 1.2rem; }
.rd-wahl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: .5rem 0; }
.rd-wahl button small { display: block; font-weight: 400; font-size: .85rem; }
.rd-wahl button.gewaehlt { border-color: var(--akzent); background: var(--akzent); color: var(--akzent-text); }
.rd-bild { font-size: 3.5rem; line-height: 1; }
.rd-kontext { font-size: 1.2rem; line-height: 1.45; }
.rd-merk { margin-top: .6rem; padding: .5rem .7rem; border-left: 4px solid var(--akzent); background: color-mix(in srgb, var(--akzent) 10%, transparent); border-radius: 6px; }
</style>`;

export function starteRunden(root) {
  let modus = 'lupe', a, schritt, eing = {}, bewertung = null, gewaehlt = null;

  const g = geruest(root, {
    etikett: 'Dezimalzahlen', titel: 'Runden',
    reiter: [{ id: 'lupe', titel: 'Mit der Lupe', unter: 'Welcher Nachbar ist näher?' }, { id: 'kontext', titel: 'Im Sachkontext', unter: 'Wie genau ist sinnvoll?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-rd="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-rd="neu">＋ Neue Aufgabe</button>`,
  });
  root.insertAdjacentHTML('afterbegin', STIL);

  function neu() {
    bewertung = null; eing = {}; gewaehlt = null; schritt = 1;
    if (modus === 'lupe') {
      const st = wahl([0, 1, 1, 2, 2]), s = STELLEN[st].s;
      const falle = wahl(['normal', 'normal', 'uebertrag', 'schrittweise', 'mitte']);
      let v, lo;
      const ganz = zufall(0, 19) * N;
      if (falle === 'uebertrag') {          // …9x → Übertrag (z. B. 2,96 → 3,0; 9,7 → 10)
        if (st === 0) v = wahl([9, 19, 99]) * N + zufall(5, 9) * 1000 + zufall(0, 9) * 100;
        else { lo = ganz + N - s; v = lo + s / 10 * zufall(5, 9) + (st < 2 ? zufall(1, 9) * s / 100 : 0); }
      } else if (falle === 'schrittweise') { // entscheidende Ziffer 4, danach groß (1,449)
        lo = ganz + zufall(0, Math.max(0, N / s - 1)) * s;
        v = lo + 4 * s / 10 + (s >= 100 ? 9 * s / 100 : 0) + (s >= 1000 ? 5 * s / 1000 : 0);
      } else if (falle === 'mitte') {
        lo = ganz + zufall(0, N / s - 1) * s; v = lo + s / 2;
      } else {
        lo = ganz + zufall(0, N / s - 1) * s;
        v = lo + zufall(1, 9) * s / 10 + (s >= 100 ? zufall(0, 9) * s / 100 : 0);
        if (v === lo) v += s / 10;
      }
      lo = Math.floor(v / s) * s;
      a = { v, st, s, lo, hi: lo + s, soll: runde(v, s), falle };
    } else {
      a = wahl(KONTEXTE)();
      a.s = STELLEN[a.st].s;
      a.soll = runde(a.v, a.s, a.ab);
    }
  }

  /* entscheidende Ziffer markieren */
  function zahlMarkiert(v, st) {
    const t = txt(v), [ganz, nach = ''] = t.split(',');
    if (st === 0) return `<span class="ziel">${ganz}</span>,<span class="ent">${nach[0] ?? '0'}</span>${nach.slice(1)}`;
    return `${ganz},${nach.slice(0, st - 1)}<span class="ziel">${nach[st - 1]}</span><span class="ent">${nach[st] ?? '0'}</span>${nach.slice(st + 1)}`;
  }
  const ent = (v, st) => Math.floor((v % STELLEN[st].s) / (STELLEN[st].s / 10));

  /* Zahlenstrahl zwischen den Nachbarn */
  function strahl() {
    const X0 = 60, X1 = 620, X = t => X0 + ((t - a.lo) / a.s) * (X1 - X0), st = a.st;
    let h = `<line x1="${X0 - 25}" y1="90" x2="${X1 + 25}" y2="90" class="linie"/>`;
    for (let i = 0; i <= 10; i++) {
      const t = a.lo + i * a.s / 10, x = X(t);
      h += `<line x1="${x}" y1="${i === 5 ? 64 : 80}" x2="${x}" y2="${i === 5 ? 116 : 100}" class="${i === 5 ? 'mitte' : 'strich'}"/>`;
      if (i > 0 && i < 10) h += `<text x="${x}" y="${i === 5 ? 140 : 124}" style="font-size:${i === 5 ? 15 : 12}px"${i === 5 ? ' class="mt"' : ''}>${txt(t)}</text>`;
    }
    h += `<text x="${X(a.lo + a.s / 2)}" y="52" class="mt">Mitte</text>`;
    const nb = (t, wo) => `<circle cx="${X(t)}" cy="90" r="22" class="nb${gewaehlt === wo ? (bewertung?.ok ? ' richtig' : ' falsch') : ''}" data-nb="${wo}"><title>${txt(t, STELLEN[st].d)}</title></circle>
      <text x="${X(t)}" y="152" style="font-size:20px">${txt(t, STELLEN[st].d)}</text>`;
    h += nb(a.lo, 'lo') + nb(a.hi, 'hi');
    h += `<circle cx="${X(a.v)}" cy="90" r="8" class="punkt"/><text x="${X(a.v)}" y="40" style="fill:#2f6fe4">${txt(a.v)}</text>
      <line x1="${X(a.v)}" y1="46" x2="${X(a.v)}" y2="82" stroke="#2f6fe4" stroke-width="2"/>`;
    return `<svg class="rd-svg" viewBox="0 0 680 165" role="img" aria-label="Zahlenstrahl von ${txt(a.lo)} bis ${txt(a.hi)}">${h}</svg>`;
  }

  const ein = (id, label, breite = '6.5rem') => `<input class="gs-ein" style="width:${breite}" id="${id}" data-rdein inputmode="decimal" autocomplete="off" value="${ESC(eing[id] ?? '')}" aria-label="${label}">`;
  const pruefKnopf = () => `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-rd="pruefen">✓ Prüfen</button></div>`;

  function zeichneLupe() {
    const S = STELLEN[a.st];
    g.titel(`Runde auf <b>${S.name}</b>`);
    let links = `<p class="rd-zahl">${schritt >= 4 ? zahlMarkiert(a.v, a.st) : txt(a.v)}</p>`;
    if (schritt >= 2) links += strahl() + `<p class="leise">Der Zahlenstrahl zeigt nur den Abschnitt zwischen den beiden Nachbarn. Der rosa Strich ist genau die Mitte.</p>`;
    else links += `<p class="leise">Runde auf ${S.name}: Die gerundete Zahl hat ${S.d === 0 ? 'keine Stelle' : S.d === 1 ? 'eine Stelle' : S.d + ' Stellen'} nach dem Komma.</p>`;
    let r = '';
    if (schritt === 1) {
      r = `<h2 class="bereich-titel">1. Zwischen welchen Nachbarn liegt die Zahl?</h2>
        <p class="leise">Beide Nachbarn haben ${S.d === 0 ? 'keine Nachkommastelle' : S.d + (S.d === 1 ? ' Nachkommastelle' : ' Nachkommastellen')}.</p>
        <div class="rd-reihe">${ein('rd-lo', 'kleinerer Nachbar')} &lt; ${txt(a.v)} &lt; ${ein('rd-hi', 'größerer Nachbar')}</div>${pruefKnopf()}`;
    } else if (schritt === 2) {
      r = `<h2 class="bereich-titel">2. Welcher Nachbar ist näher?</h2><p>Tippe am Zahlenstrahl den Nachbarn an, der näher an ${txt(a.v)} liegt.</p>`;
    } else {
      r = `<h2 class="bereich-titel">3. Schreibe die gerundete Zahl</h2>
        <div class="rd-reihe">${txt(a.v)} ≈ ${ein('rd-erg', 'gerundete Zahl')}</div>${schritt === 3 ? pruefKnopf() : ''}`;
    }
    if (schritt >= 4) {
      const z = ent(a.v, a.st);
      r += `<div class="rd-merk">Die Ziffer <b>${z}</b> direkt hinter der Rundungsstelle entscheidet: ${z >= 5 ? '5, 6, 7, 8, 9 → <b>aufrunden</b>' : '0, 1, 2, 3, 4 → <b>abrunden</b>'}.
        ${a.falle === 'schrittweise' ? '<br>Achtung: Nicht schrittweise runden! Nur diese eine Ziffer zählt.' : ''}${a.falle === 'mitte' ? '<br>Genau in der Mitte wird aufgerundet.' : ''}</div>`;
    }
    g.links.innerHTML = links;
    g.rechts.innerHTML = r + antwortHtml(bewertung);
  }

  function zeichneKontext() {
    g.titel('Sinnvoll runden');
    g.links.innerHTML = `<p class="rd-bild" aria-hidden="true">${a.bild}</p><p class="rd-kontext">${a.text}</p>
      ${schritt >= 3 ? `<div class="rd-merk">${a.warum}</div>` : ''}`;
    let r = '';
    if (schritt === 1) {
      r = `<h2 class="bereich-titel">1. Wie genau ist sinnvoll?</h2><div class="rd-wahl">${STELLEN.map((s, i) => `<button type="button" class="kn-gross kn-leise${gewaehlt === i ? ' gewaehlt' : ''}" data-stelle="${i}">auf ${s.name}<small>${a.bed[i]}</small></button>`).join('')}</div>`;
    } else {
      r = `<h2 class="bereich-titel">2. ${a.ab ? 'Runde ab' : 'Runde'} auf ${STELLEN[a.st].name} (${a.bed[a.st]})</h2>
        <div class="rd-reihe">${txt(a.v)} ${a.einheit} ≈ ${ein('rd-erg', 'gerundeter Wert')} ${a.einheit}</div>${schritt === 2 ? pruefKnopf() : ''}`;
    }
    g.rechts.innerHTML = r + antwortHtml(bewertung);
  }

  function zeichne() { if (modus === 'lupe') zeichneLupe(); else zeichneKontext(); g.reiter(modus); }

  function pruefeErgebnis(weiter) {
    const x = lies(eing['rd-erg']), d = STELLEN[a.st].d;
    if (!x) { bewertung = { ok: false, text: 'Schreibe eine Zahl, z. B. 3,4.' }; return; }
    if (x.v === a.soll && x.d === d) { bewertung = { ok: true, text: `Richtig: ${txt(a.v)} ≈ ${txt(a.soll, d)}` }; schritt = weiter; g.sprich(modus === 'lupe' ? 'Runden heißt: den näheren Nachbarn nehmen.' : 'Gut überlegt: Wie genau man rundet, hängt von der Situation ab.', 'fertig'); return; }
    if (x.v === a.soll) { bewertung = { ok: false, text: `Der Wert stimmt. Schreibe aber genau ${d === 0 ? 'ohne Nachkommastellen' : d + (d === 1 ? ' Nachkommastelle' : ' Nachkommastellen')} – auch eine Null am Ende: ${txt(a.soll, d)}.` }; return; }
    if (a.ab && x.v === runde(a.v, a.s)) { bewertung = { ok: false, text: 'Beim Weitsprung wird immer abgerundet!' }; return; }
    if (modus === 'lupe' && a.falle === 'schrittweise' && x.v === runde(runde(a.v, a.s / 10), a.s)) { bewertung = { ok: false, text: 'Du hast schrittweise gerundet. Schau nur auf die eine Ziffer direkt hinter der Rundungsstelle.' }; return; }
    bewertung = { ok: false, text: modus === 'lupe' ? 'Noch nicht. Du hast den näheren Nachbarn schon gefunden – schreibe ihn auf.' : 'Noch nicht. Schau auf die Ziffer direkt hinter der Rundungsstelle.' };
  }

  function pruefen() {
    if (modus === 'lupe' && schritt === 1) {
      const lo = lies(eing['rd-lo']), hi = lies(eing['rd-hi']);
      if (!lo || !hi) bewertung = { ok: false, text: 'Trage beide Nachbarn ein.' };
      else if (lo.v === a.lo && hi.v === a.hi) { bewertung = null; schritt = 2; g.sprich(`Richtig: ${txt(a.lo, STELLEN[a.st].d)} &lt; ${txt(a.v)} &lt; ${txt(a.hi, STELLEN[a.st].d)}. Jetzt vergrößern wir diesen Abschnitt.`, 'fertig'); }
      else if (hi.v - lo.v !== a.s) bewertung = { ok: false, text: `Die beiden Nachbarn unterscheiden sich genau um ${txt(a.s)}.` };
      else bewertung = { ok: false, text: `${txt(a.v)} liegt nicht zwischen diesen Zahlen.` };
    } else if (modus === 'lupe' && schritt === 3) pruefeErgebnis(4);
    else if (modus === 'kontext' && schritt === 2) pruefeErgebnis(3);
    zeichne();
    g.rechts.querySelector('input:not([readonly])')?.focus({ preventScroll: true });
  }

  function tipp() {
    const S = STELLEN[a.st];
    if (modus === 'lupe') {
      if (schritt === 1) g.sprich(`Streiche in Gedanken alles hinter den ${S.name + 'n'} weg: Das ist der kleinere Nachbar. Der größere ist ${txt(a.s)} mehr.`, 'tipp');
      else if (schritt === 2) g.sprich('Liegt der blaue Punkt links von der Mitte, ist der linke Nachbar näher – rechts davon der rechte. Genau auf der Mitte: aufrunden.', 'tipp');
      else g.sprich(`Schau auf die Ziffer direkt hinter den ${S.name + 'n'}: ${ent(a.v, a.st)}. Bei 0–4 abrunden, bei 5–9 aufrunden.`, 'tipp');
    } else {
      if (schritt === 1) g.sprich('Überlege: Kann man genauer überhaupt bezahlen, messen oder abmessen? Braucht man es genauer?', 'tipp');
      else g.sprich(a.ab ? 'Abrunden: Lass einfach alle Ziffern hinter der Rundungsstelle weg.' : `Schau auf die Ziffer direkt hinter der Rundungsstelle: ${ent(a.v, a.st)}.`, 'tipp');
    }
  }

  root.addEventListener('input', e => {
    if (!e.target.matches('[data-rdein]')) return;
    e.target.value = e.target.value.replace(/[^\d,.]/g, '').replace('.', ',');
    eing[e.target.id] = e.target.value;
  });
  root.addEventListener('click', e => {
    const r = e.target.closest('[data-reiter]');
    if (r) { modus = r.dataset.reiter; neu(); zeichne(); start(); return; }
    const nbk = e.target.closest('[data-nb]');
    if (nbk && modus === 'lupe' && schritt === 2) {
      gewaehlt = nbk.dataset.nb;
      const t = gewaehlt === 'lo' ? a.lo : a.hi;
      if (t === a.soll) { bewertung = { ok: true, text: `Richtig: ${txt(a.v)} liegt näher an ${txt(t, STELLEN[a.st].d)}.${a.falle === 'mitte' ? ' (Genau in der Mitte – dann wird aufgerundet.)' : ''}` }; schritt = 3; eing['rd-erg'] = ''; }
      else bewertung = { ok: false, text: a.falle === 'mitte' ? 'Die Zahl liegt genau in der Mitte. Dann wird immer aufgerundet.' : 'Schau, auf welcher Seite der Mitte der blaue Punkt liegt.' };
      zeichne();
      if (bewertung.ok) { bewertung = null; g.sprich(`Richtig, ${txt(t, STELLEN[a.st].d)} ist näher. Schreibe jetzt die gerundete Zahl.`, 'fertig'); zeichne(); g.rechts.querySelector('input')?.focus({ preventScroll: true }); }
      return;
    }
    const st = e.target.closest('[data-stelle]');
    if (st && modus === 'kontext' && schritt === 1) {
      gewaehlt = +st.dataset.stelle;
      if (gewaehlt === a.st) { bewertung = null; schritt = 2; g.sprich(`Ja – auf ${a.bed[a.st]}. ${a.warum}`, 'fertig'); zeichne(); g.rechts.querySelector('input')?.focus({ preventScroll: true }); }
      else { bewertung = { ok: false, text: gewaehlt > a.st ? 'Das ist genauer als nötig oder möglich.' : 'Das ist zu ungenau für diese Situation.' }; zeichne(); }
      return;
    }
    const b = e.target.closest('[data-rd]');
    if (!b) return;
    if (b.dataset.rd === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.rd === 'pruefen') pruefen();
    if (b.dataset.rd === 'tipp') tipp();
  });

  function start() { g.sprich(modus === 'lupe' ? 'Runden heißt: Welcher Nachbar ist näher? Die Lupe zeigt es dir.' : 'Wie genau soll man runden? Das hängt von der Situation ab.'); }
  neu(); zeichne(); start();
}
