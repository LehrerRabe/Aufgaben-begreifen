/* Mathematik: Rationale Zahlen – „Geschickt rechnen“ (starteGeschickt)
   Rechengesetze mit rationalen Zahlen sinnvoll nutzen. Drei Reiter, je in drei Stufen (Ganze Zahlen, Kommazahlen, Brüche):
   1. Geschickt addieren: Summen aus 4–6 Zahlen liegen als Karten da – jede Karte trägt ihr Vorzeichen (aus „− 2,7“ wird die Karte −2,7).
      Zwei Karten antippen, Summe eintragen → die Karten verschmelzen. „Geschickt“ ist ein Schritt, wenn eine runde Zahl entsteht
      (Gegenzahlen → 0, Kommastellen ergänzen sich, gleiche Nenner ergeben ein Ganzes).
   2. Geschickt multiplizieren: dasselbe mit Faktoren (25 · 4, 0,5 · 2, ¾ · 4⁄3 …).
   3. Verteilungsgesetz: Ausklammern (a · b + a · c) und Zerlegen ((−7) · 98 = (−7) · (100 − 2)).
      Erst den geschicktesten Rechenweg wählen, dann die Zwischenschritte eintragen.
   Die Gestaltung (CSS) bringt der Baustein selbst mit (<style id="gk-stil">), app.css bleibt unverändert. */

import { geruest, zufall, wahl, mischen, bruchHtml, ggT, flip } from './geruest.js';

const STIL = `
.gk-stufen { display: flex; flex-wrap: wrap; gap: .35rem; margin: 0 0 .7rem; }
.gk-stufen button { font: 700 .95rem var(--schrift); padding: .3rem .7rem; border-radius: 999px; border: 2px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; }
.gk-stufen button[aria-pressed="true"] { border-color: var(--akzent); background: var(--akzent); color: var(--akzent-text, #fff); }
.gk-ausdruck { font: 800 1.6rem/1.5 var(--titel); text-align: center; margin: .3rem 0 1rem; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.gk-ausdruck .bruch, .gk-karte .bruch, .gk-zeile .bruch, .gk-wahl .bruch, .gk-verlauf .bruch { vertical-align: middle; }
.gk-karten { display: flex; flex-wrap: wrap; justify-content: center; gap: .8rem; min-height: 6rem; padding: .6rem; border-radius: 16px; background: var(--flaeche-2); }
.gk-karte { position: relative; min-width: 5.2rem; padding: .7rem .8rem; border-radius: 14px; border: 3px solid; background: var(--flaeche); font: 800 1.55rem/1.1 var(--titel); cursor: pointer; font-variant-numeric: tabular-nums; transition: transform .15s, box-shadow .15s; color: var(--text); }
.gk-karte.pos { border-color: #2f6fe4; } .gk-karte.pos .gk-vz { color: #2f6fe4; }
.gk-karte.neg { border-color: #e0262b; } .gk-karte.neg .gk-vz { color: #e0262b; }
.gk-karte.null { border-color: var(--leise); }
.gk-karte[aria-pressed="true"] { transform: translateY(-6px); box-shadow: 0 0 0 4px var(--akzent); }
.gk-karte.hinweis { animation: gk-puls 1s ease-in-out 3; }
.gk-karte.frisch { box-shadow: 0 0 0 4px var(--gut); }
@keyframes gk-puls { 50% { box-shadow: 0 0 0 6px #ffd34d; } }
.gk-karte:disabled { cursor: default; }
.gk-rand { font: 600 .95rem var(--schrift); color: var(--leise); text-align: center; margin: .5rem 0 0; }
.gk-zeile { font: 800 1.35rem/1.6 var(--titel); display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; margin: .35rem 0; font-variant-numeric: tabular-nums; }
.gk-ein { width: 5.6rem; padding: .25rem .3rem; font: 700 1.2rem var(--schrift); text-align: center; border: 2px solid var(--rand); border-radius: 10px; background: var(--bg); color: var(--text); }
.gk-ein:focus { border-color: var(--akzent); outline: none; }
.gk-ein.richtig { border-color: var(--gut); background: var(--gut-sanft); }
.gk-ein.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); }
.gk-verlauf { margin: .8rem 0 0; padding: .5rem .7rem; border-radius: 12px; background: var(--flaeche-2); font: 700 1.05rem/1.8 var(--schrift); font-variant-numeric: tabular-nums; }
.gk-verlauf h3 { font: 800 1rem var(--titel); margin: 0 0 .2rem; }
.gk-verlauf .ok { color: var(--gut); } .gk-verlauf .nein { color: var(--leise); }
.gk-wahl { display: grid; gap: .5rem; margin: .5rem 0; }
.gk-wahl button { text-align: left; font: 800 1.25rem/1.5 var(--titel); padding: .45rem .8rem; border-radius: 12px; border: 2px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; font-variant-numeric: tabular-nums; }
.gk-wahl button.gut { border-color: var(--gut); background: var(--gut-sanft); }
.gk-wahl button.geht { border-color: #d97706; }
.gk-wahl button.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); }
.gk-merk { border-left: 6px solid var(--akzent); background: var(--info-sanft); border-radius: 10px; padding: .6rem .8rem; margin: .7rem 0; }
.gk-merk b { color: var(--akzent); }
.gk-sterne { font: 800 1.1rem var(--titel); color: #d97706; }
.gk-bild { display: block; width: 100%; max-width: 30rem; height: auto; margin: .3rem auto; }
`;
function stil() {
  if (!document.getElementById('gk-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="gk-stil">${STIL}</style>`);
}

/* ---------- Zahlen ---------- */

const MINUS = '−';
/** Bruch [z, n] gekürzt, n > 0. */
function rat(z, n = 1) {
  if (n < 0) { z = -z; n = -n; }
  const t = ggT(Math.abs(z), n) || 1;
  return [z / t, n / t];
}
/** Kommazahl als Bruch (bis 3 Nachkommastellen). */
const dz = x => rat(Math.round(x * 1000), 1000);
const plus = (a, b) => rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const mal = (a, b) => rat(a[0] * b[0], a[1] * b[1]);
const gleich = (a, b) => a[0] * b[1] === b[0] * a[1];
const ganz = r => r[1] === 1;

/** Eingabe lesen: ganze Zahl, Kommazahl oder Bruch a/b (auch mit Minus). */
function liesRat(text) {
  const s = String(text ?? '').trim().replace(/[−–]/g, '-').replace(/\s+/g, '').replace('.', ',');
  if (!s) return null;
  let m = s.match(/^([+-]?)(\d+)\/(\d+)$/);
  if (m) return +m[3] === 0 ? null : rat((m[1] === '-' ? -1 : 1) * +m[2], +m[3]);
  m = s.match(/^([+-]?)(\d*)(?:,(\d+))?$/);
  if (!m || (m[2] === '' && !m[3])) return null;
  const nachk = m[3] || '';
  const n = 10 ** nachk.length;
  return rat((m[1] === '-' ? -1 : 1) * (+(m[2] || '0') * n + +(nachk || '0')), n);
}

/** Betrag als Kommazahl, falls endlich, sonst null. */
function dezText(b) {
  let n = b[1];
  while (n % 2 === 0) n /= 2;
  while (n % 5 === 0) n /= 5;
  if (n !== 1) return null;
  let k = 0; while (10 ** k % b[1] !== 0) k++;
  const s = String(b[0] * (10 ** k / b[1])).padStart(k + 1, '0');
  return k ? `${s.slice(0, -k)},${s.slice(-k)}` : s;
}
/** Betrag einer Zahl als HTML (art: 'ganz' | 'dez' | 'bruch'). */
function kern(r, art) {
  const b = [Math.abs(r[0]), r[1]];
  if (b[1] === 1) return String(b[0]);
  if (art !== 'bruch') { const d = dezText(b); if (d) return d; }
  return bruchHtml(b[0], b[1], 'klein');
}
/** Zahl in einer Rechnung: negative Zahlen in Klammern. */
const term = (r, art) => (r[0] < 0 ? `(${MINUS}${kern(r, art)})` : kern(r, art));
/** Zahl ohne Klammern. */
const zahl = (r, art) => (r[0] < 0 ? MINUS : '') + kern(r, art);
/** Ergebnis-Text (Bruch, wenn möglich auch Kommazahl). */
function ergebnis(r, art) {
  if (art === 'bruch' && !ganz(r)) {
    const d = dezText([Math.abs(r[0]), r[1]]);
    return zahl(r, 'bruch') + (d && r[1] <= 10 ? ` = ${zahl(r, 'dez')}` : '');
  }
  return zahl(r, art);
}

/* ---------- Aufgaben: Karten ---------- */

const vz = () => wahl([-1, 1]);
const runde10 = r => ganz(r) && r[0] % 10 === 0;
/** Gilt die Zahl als „schön“ (Ziel eines geschickten Schritts)? */
const schoen = (r, stufe) => (stufe === 'ganz' ? runde10(r) : ganz(r));

/** Karten so mischen, dass Paar-Partner nicht direkt nebeneinander liegen. */
function verteile(paare, einzeln = []) {
  const karten = [];
  paare.forEach((p, i) => p.forEach(r => karten.push({ r, paar: i })));
  einzeln.forEach(r => karten.push({ r, paar: -1 }));
  let beste = karten;
  for (let v = 0; v < 80; v++) {
    const m = mischen(karten);
    if (m.every((k, i) => i === 0 || k.paar < 0 || k.paar !== m[i - 1].paar)) { beste = m; break; }
  }
  return beste;
}

function summenKarten(stufe) {
  const paare = [];
  if (stufe === 'ganz') {
    let x; do { x = zufall(13, 89); } while (x % 10 === 0);
    paare.push([rat(x), rat(-x)]);
    const anz = wahl([1, 2]);
    for (let k = 0; k < anz; k++) {
      for (;;) {
        const t = vz() * 10 * zufall(1, 9), y = vz() * zufall(11, 89), z = t - y;
        if (y % 10 && z % 10 && Math.abs(z) > 10 && Math.abs(z) < 100) { paare.push([rat(y), rat(z)]); break; }
      }
    }
  } else if (stufe === 'dez') {
    let a; do { a = zufall(11, 199); } while (a % 10 === 0);
    const sg = vz(); paare.push([rat(sg * a, 10), rat(-sg * a, 10)]);
    const anz = wahl([1, 2]);
    for (let k = 0; k < anz; k++) {
      for (;;) {
        const t = vz() * zufall(1, 9);
        const hundert = Math.random() < 0.35;
        const n = hundert ? 100 : 10;
        const b = vz() * zufall(n + 1, 15 * n);
        if (b % (hundert ? 10 : 1) === 0 && hundert) continue;
        if (b % n === 0) continue;
        const y = rat(b, n), z = plus(rat(t), mal(y, [-1, 1]));
        if (Math.abs(z[0] / z[1]) < 20 && !ganz(z)) { paare.push([y, z]); break; }
      }
    }
  } else {
    const nenner = mischen([3, 4, 5, 6, 8]);
    const anz = wahl([2, 2, 3]);
    for (let k = 0; k < anz; k++) {
      const n = nenner[k];
      for (;;) {
        const s = vz() * zufall(1, 2) * n;
        const p = vz() * zufall(1, 2 * n);
        const q = s - p;
        if (p % n && q % n && Math.abs(q) <= 3 * n && q !== 0 && ggT(Math.abs(p), n) === 1 && ggT(Math.abs(q), n) === 1) { paare.push([rat(p, n), rat(q, n)]); break; }
      }
    }
  }
  return verteile(paare);
}

function produktKarten(stufe) {
  const paare = [], einzeln = [];
  if (stufe === 'ganz') {
    const liste = mischen([[25, 4], [5, 2], [50, 2], [125, 8], [20, 5], [5, 4], [25, 8]]);
    const anz = wahl([1, 2]);
    for (let k = 0; k < anz; k++) paare.push(liste[k].map(x => rat(vz() * x)));
    einzeln.push(rat(vz() * wahl([3, 7, 9, 11, 13, 17])));
  } else if (stufe === 'dez') {
    const liste = mischen([[rat(1, 2), rat(2)], [rat(1, 4), rat(4)], [rat(1, 5), rat(5)], [rat(5, 4), rat(8)], [rat(5, 2), rat(4)], [rat(2, 5), rat(5)], [rat(3, 2), rat(2)], [rat(1, 2), rat(6)]]);
    const anz = wahl([1, 2]);
    for (let k = 0; k < anz; k++) paare.push(liste[k].map(r => mal(r, [vz(), 1])));
    einzeln.push(rat(vz() * wahl([3, 7, 9, 11, 13])));
  } else {
    const liste = mischen([[rat(3, 4), rat(4, 3)], [rat(2, 5), rat(5, 2)], [rat(5, 6), rat(6, 5)], [rat(7, 3), rat(3)], [rat(3, 8), rat(8)], [rat(5, 6), rat(12)], [rat(2, 7), rat(7, 2)]]);
    const anz = wahl([1, 2]);
    for (let k = 0; k < anz; k++) paare.push(liste[k].map(r => mal(r, [vz(), 1])));
    einzeln.push(wahl([rat(vz() * wahl([5, 9, 11, 13])), rat(vz() * wahl([5, 7]), wahl([9, 11]))]));
  }
  // mindestens eine negative Zahl
  const k = verteile(paare, einzeln);
  if (k.every(x => x.r[0] > 0)) { const i = zufall(0, k.length - 1); k[i].r = mal(k[i].r, [-1, 1]); }
  return k;
}

/* ---------- Aufgaben: Verteilungsgesetz ---------- */

/** Liefert { aufgabe, optionen:[{html, art, text}], schritte:[{html, wert}], erg, gesetz } */
function verteilAufgabe(stufe) {
  const art = stufe;
  const T = r => term(r, art);
  if (stufe === 'ganz') {
    if (Math.random() < 0.5) {
      // Ausklammern
      const a = rat(vz() * zufall(3, 12));
      let b, c, s;
      for (;;) {
        s = vz() * wahl([10, 20, 100]); const bb = vz() * zufall(11, 95), cc = s - bb;
        if (bb % 10 && cc % 10 && Math.abs(cc) < 100 && Math.abs(cc) > 3) { b = rat(bb); c = rat(cc); break; }
      }
      const vorn = Math.random() < 0.5;   // gemeinsamer Faktor vorn oder hinten
      const p = (x, y) => (vorn ? `${T(x)} · ${T(y)}` : `${T(y)} · ${T(x)}`);
      return {
        typ: 'aus', aufgabe: `${p(a, b)} + ${p(a, c)}`,
        optionen: mischen([
          { html: vorn ? `${T(a)} · (${T(b)} + ${T(c)})` : `(${T(b)} + ${T(c)}) · ${T(a)}`, art: 'gut', text: `Genau: ${T(a)} kommt in beiden Produkten vor und wird ausgeklammert. In der Klammer entsteht eine runde Zahl.` },
          { html: `${T(a)} · ${T(b)} · ${T(c)}`, art: 'falsch', text: 'Das ist ein ganz anderes Produkt. Beim Ausklammern bleibt das Plus in der Klammer stehen.' },
          { html: `(${T(a)} + ${T(a)}) · (${T(b)} + ${T(c)})`, art: 'falsch', text: 'Der gemeinsame Faktor kommt nur einmal vor die Klammer.' },
        ]),
        schritte: [
          { html: `${T(b)} + ${T(c)} =`, wert: rat(s) },
          { html: `${T(a)} · ${T(rat(s))} =`, wert: mal(a, rat(s)), anzeige: `${T(a)} · (Klammer) =` },
        ],
        erg: mal(a, rat(s)),
        gesetz: 'Verteilungsgesetz rückwärts (Ausklammern): a · b + a · c = a · (b + c)',
      };
    }
    // Zerlegen
    const a = rat(vz() * zufall(3, 9));
    const [m, d] = wahl([[100, -2], [100, -1], [100, 1], [100, 2], [200, -1], [200, 1], [50, -1], [50, 1], [1000, -1], [100, -3]]);
    const n = m + d, fd = rat(d);
    const zerl = `${m} ${d < 0 ? MINUS : '+'} ${Math.abs(d)}`;
    const h = m / 2;
    return {
      typ: 'zer', aufgabe: `${T(a)} · ${n}`,
      optionen: mischen([
        { html: `${T(a)} · (${zerl})`, art: 'gut', text: `Genau: ${n} liegt nah an ${m}. Mit ${m} und ${Math.abs(d)} rechnet man leicht.` },
        { html: `${T(a)} · (${h} + ${n - h})`, art: 'geht', text: `Das stimmt zwar, aber ${T(a)} · ${n - h} ist mühsam. Gibt es eine runde Zahl ganz in der Nähe von ${n}?` },
        { html: `${T(a)} · ${m} ${d < 0 ? MINUS : '+'} ${Math.abs(d)}`, art: 'falsch', text: `Hier fehlt die Klammer: Dann wird ${Math.abs(d)} nicht mit ${T(a)} multipliziert.` },
      ]),
      schritte: [
        { html: `${T(a)} · ${m} =`, wert: mal(a, rat(m)) },
        { html: `${T(a)} · ${T(fd)} =`, wert: mal(a, fd) },
        { html: 'Ergebnis:', wert: mal(a, rat(n)) },
      ],
      erg: mal(a, rat(n)),
      hinweis: d < 0 ? `Das Minus gehört zur ${Math.abs(d)}: ${zerl} = ${m} + (${MINUS}${Math.abs(d)}). Also rechnest du ${T(a)} · ${T(fd)}.` : '',
      gesetz: 'Verteilungsgesetz (Zerlegen): a · (b + c) = a · b + a · c',
    };
  }
  if (stufe === 'dez') {
    if (Math.random() < 0.5) {
      // Ausklammern mit Kommazahlen
      const [a, b, c, s] = wahl([
        () => { const a = mal(wahl([rat(5, 2), rat(1, 4), rat(3, 2), rat(5, 4), rat(12, 5)]), [vz(), 1]); for (;;) { const s = vz() * 10, bb = vz() * zufall(11, 19), cc = s - bb; if (cc % 10 && Math.abs(cc) > 1) return [a, rat(bb), rat(cc), rat(s)]; } },
        () => { const a = rat(vz() * zufall(3, 9)); for (;;) { const s = vz() * wahl([1, 10]); const bb = vz() * zufall(11, 99); if (bb % 10 === 0) continue; const b = rat(bb, 10); const c = plus(rat(s), mal(b, [-1, 1])); if (!ganz(c) && Math.abs(c[0] / c[1]) < 10) return [a, b, c, rat(s)]; } },
      ])();
      return {
        typ: 'aus', aufgabe: `${T(a)} · ${T(b)} + ${T(a)} · ${T(c)}`,
        optionen: mischen([
          { html: `${T(a)} · (${T(b)} + ${T(c)})`, art: 'gut', text: `Genau: ${T(a)} kommt zweimal vor. In der Klammer entsteht eine runde Zahl.` },
          { html: `${T(a)} · ${T(b)} · ${T(c)}`, art: 'falsch', text: 'Beim Ausklammern bleibt das Plus in der Klammer stehen.' },
          { html: `(${T(a)} + ${T(a)}) · (${T(b)} + ${T(c)})`, art: 'falsch', text: 'Der gemeinsame Faktor kommt nur einmal vor die Klammer.' },
        ]),
        schritte: [
          { html: `${T(b)} + ${T(c)} =`, wert: s },
          { html: `${T(a)} · (Klammer) =`, wert: mal(a, s) },
        ],
        erg: mal(a, s),
        gesetz: 'Verteilungsgesetz rückwärts (Ausklammern): a · b + a · c = a · (b + c)',
      };
    }
    // Zerlegen: a · 1,99 = a · (2 − 0,01)
    const a = rat(vz() * zufall(3, 9));
    const [m, d] = wahl([[rat(2), rat(-1, 100)], [rat(5), rat(-1, 10)], [rat(10), rat(-1, 10)], [rat(3), rat(-2, 100)], [rat(20), rat(-1, 10)]]);
    const n = plus(m, d);
    const zerl = `${kern(m, 'dez')} ${d[0] < 0 ? MINUS : '+'} ${kern(d, 'dez')}`;
    const ganzT = Math.floor(n[0] / n[1]), rest = plus(n, rat(-ganzT));
    return {
      typ: 'zer', aufgabe: `${T(a)} · ${kern(n, 'dez')}`,
      optionen: mischen([
        { html: `${T(a)} · (${zerl})`, art: 'gut', text: `Genau: ${kern(n, 'dez')} liegt nah an ${kern(m, 'dez')}.` },
        { html: `${T(a)} · (${ganzT} + ${kern(rest, 'dez')})`, art: 'geht', text: `Das stimmt, aber ${T(a)} · ${kern(rest, 'dez')} ist mühsam. Welche runde Zahl liegt ganz nah an ${kern(n, 'dez')}?` },
        { html: `${T(a)} · ${kern(m, 'dez')} ${d[0] < 0 ? MINUS : '+'} ${kern(d, 'dez')}`, art: 'falsch', text: 'Hier fehlt die Klammer.' },
      ]),
      schritte: [
        { html: `${T(a)} · ${kern(m, 'dez')} =`, wert: mal(a, m) },
        { html: `${T(a)} · ${T(d)} =`, wert: mal(a, d) },
        { html: 'Ergebnis:', wert: mal(a, n) },
      ],
      erg: mal(a, n),
      hinweis: d[0] < 0 ? `Das Minus gehört zur ${kern(d, 'dez')}: Rechne ${T(a)} · ${T(d)}.` : '',
      gesetz: 'Verteilungsgesetz (Zerlegen): a · (b + c) = a · b + a · c',
    };
  }
  // Brüche
  if (Math.random() < 0.5) {
    // Ausmultiplizieren: k · (p/q + r/s)
    const k = rat(vz() * wahl([12, 24, 6, 18, 30, 20]));
    const teiler = [2, 3, 4, 5, 6, 8, 10, 12].filter(t => Math.abs(k[0]) % t === 0 && t < Math.abs(k[0]) || t === Math.abs(k[0]));
    let x, y;
    for (;;) {
      const q = wahl(teiler), s = wahl(teiler);
      if (q === s) continue;
      const p = zufall(1, q - 1), r = zufall(1, s - 1);
      x = rat(p, q); y = rat(vz() * r, s);
      if (x[1] === q && y[1] === s) break;
    }
    const summe = plus(x, y);
    const yT = y[0] < 0 ? `${MINUS} ${kern(y, 'bruch')}` : `+ ${kern(y, 'bruch')}`;
    return {
      typ: 'zer', aufgabe: `${T(k)} · (${kern(x, 'bruch')} ${yT})`,
      optionen: mischen([
        { html: `${T(k)} · ${kern(x, 'bruch')} + ${T(k)} · ${T(y)}`, art: 'gut', text: `Genau: ${T(k)} lässt sich durch beide Nenner kürzen – so entstehen ganze Zahlen.` },
        { html: `${T(k)} · ${zahl(summe, 'bruch')}`, art: 'geht', text: 'Das stimmt auch, aber dafür musst du erst die Brüche gleichnamig machen. Ausmultiplizieren ist hier einfacher.' },
        { html: `${T(k)} · ${kern(x, 'bruch')} ${yT}`, art: 'falsch', text: `Hier fehlt eine Multiplikation: Auch ${zahl(y, 'bruch')} muss mit ${T(k)} multipliziert werden.` },
      ]),
      schritte: [
        { html: `${T(k)} · ${kern(x, 'bruch')} =`, wert: mal(k, x) },
        { html: `${T(k)} · ${T(y)} =`, wert: mal(k, y) },
        { html: 'Ergebnis:', wert: mal(k, summe) },
      ],
      erg: mal(k, summe),
      gesetz: 'Verteilungsgesetz (Ausmultiplizieren): a · (b + c) = a · b + a · c',
    };
  }
  // Ausklammern mit Bruch als gemeinsamem Faktor
  const a = mal(wahl([rat(3, 5), rat(2, 3), rat(3, 4), rat(5, 6), rat(2, 7)]), [vz(), 1]);
  let b, c, s;
  for (;;) {
    const ss = vz() * a[1] * wahl([1, 2]);
    const bb = vz() * zufall(2, 12), cc = ss - bb;
    if (cc !== 0 && bb !== cc && bb % a[1] && cc % a[1] && Math.abs(cc) <= 15) { b = rat(bb); c = rat(cc); s = rat(ss); break; }
  }
  return {
    typ: 'aus', aufgabe: `${T(a)} · ${T(b)} + ${T(a)} · ${T(c)}`,
    optionen: mischen([
      { html: `${T(a)} · (${T(b)} + ${T(c)})`, art: 'gut', text: `Genau: ${T(a)} kommt zweimal vor. In der Klammer entsteht ${zahl(s, 'ganz')} – damit lässt sich ${T(a)} leicht kürzen.` },
      { html: `${T(a)} · ${T(b)} · ${T(c)}`, art: 'falsch', text: 'Beim Ausklammern bleibt das Plus in der Klammer stehen.' },
      { html: `(${T(a)} + ${T(a)}) · (${T(b)} + ${T(c)})`, art: 'falsch', text: 'Der gemeinsame Faktor kommt nur einmal vor die Klammer.' },
    ]),
    schritte: [
      { html: `${T(b)} + ${T(c)} =`, wert: s },
      { html: `${T(a)} · (Klammer) =`, wert: mal(a, s) },
    ],
    erg: mal(a, s),
    gesetz: 'Verteilungsgesetz rückwärts (Ausklammern): a · b + a · c = a · (b + c)',
  };
}

/* ===================================================================== */

export function starteGeschickt(root) {
  stil();
  let modus = 'summe', stufe = 'ganz';
  let karten = [], gewaehlt = [], verlauf = [], hinweis = [], idZaehler = 0, eing = {}, bewertung = null, tipps = 0, fertig = false, frisch = null;
  let va = null, vaPhase = 1, vaWahl = null, vaOk = {};

  const g = geruest(root, {
    etikett: 'Rationale Zahlen', titel: '',
    reiter: [
      { id: 'summe', titel: 'Geschickt addieren', unter: 'Vertauschen und zusammenfassen' },
      { id: 'produkt', titel: 'Geschickt multiplizieren', unter: 'Faktoren clever kombinieren' },
      { id: 'verteilen', titel: 'Verteilungsgesetz', unter: 'Ausklammern und zerlegen' },
    ],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-gk="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-gk="neu">＋ Neue Aufgabe</button>`,
  });

  root.addEventListener('input', e => {
    if (!e.target.matches('[data-gkein]')) return;
    e.target.value = e.target.value.replace(/[^\d,./+\-−]/g, '').replace('-', MINUS);
    eing[e.target.id] = e.target.value;
  });
  const feld = (id, label) => `<input class="gk-ein" id="${id}" data-gkein inputmode="text" autocomplete="off" aria-label="${label}" value="${eing[id] ?? ''}">`;
  const op = () => (modus === 'summe' ? '+' : '·');
  const verknuepfe = (a, b) => (modus === 'summe' ? plus(a, b) : mal(a, b));

  /* ---------- Karten-Modi ---------- */
  function neuKarten() {
    const roh = modus === 'summe' ? summenKarten(stufe) : produktKarten(stufe);
    karten = roh.map(k => ({ id: `k${idZaehler++}`, r: k.r }));
    gewaehlt = []; verlauf = []; hinweis = []; fertig = false; frisch = null;
  }
  function ausdruck() {
    {
      if (modus === 'summe') {
        return karten.map((k, i) => {
          const neg = k.r[0] < 0;
          if (i === 0) return zahl(k.r, stufe);
          return ` ${neg ? MINUS : '+'} ${kern(k.r, stufe)}`;
        }).join('');
      }
      return karten.map(k => term(k.r, stufe)).join(' · ');
    }
  }
  function kartenHtml() {
    return karten.map(k => {
      const neg = k.r[0] < 0, nul = k.r[0] === 0;
      const vzT = modus === 'summe' ? (neg ? MINUS : nul ? '' : '+') : (neg ? MINUS : '');
      const kl = ['gk-karte', neg ? 'neg' : nul ? 'null' : 'pos', hinweis.includes(k.id) ? 'hinweis' : '', frisch === k.id ? 'frisch' : ''].join(' ');
      return `<button type="button" class="${kl}" data-id="${k.id}" data-karte="${k.id}" aria-pressed="${gewaehlt.includes(k.id)}" ${fertig ? 'disabled' : ''}><span class="gk-vz">${vzT}</span>${kern(k.r, stufe)}</button>`;
    }).join('');
  }
  function linksKarten() {
    return `<div class="gk-ausdruck">${start}</div><div class="gk-karten">${kartenHtml()}</div>
      <p class="gk-rand">${modus === 'summe' ? 'Jede Karte trägt ihr Vorzeichen mit. Du darfst die Karten in beliebiger Reihenfolge zusammenfassen.' : 'Beim Multiplizieren darfst du die Faktoren in beliebiger Reihenfolge zusammenfassen.'}</p>`;
  }
  let start = '';
  function stufenHtml() {
    const s = [['ganz', 'Ganze Zahlen'], ['dez', 'Kommazahlen'], ['bruch', 'Brüche']];
    return `<div class="gk-stufen" role="group" aria-label="Stufe">${s.map(([id, t]) => `<button type="button" data-stufe="${id}" aria-pressed="${stufe === id}">${t}</button>`).join('')}</div>`;
  }
  function verlaufHtml() {
    if (!verlauf.length) return '';
    return `<div class="gk-verlauf"><h3>Dein Rechenweg</h3>${verlauf.map(v => `<div>${term(v.a, stufe)} ${op()} ${term(v.b, stufe)} = ${zahl(v.erg, stufe)} <span class="${v.geschickt ? 'ok' : 'nein'}">${v.geschickt ? '✓ geschickt' : '– geht auch geschickter'}</span></div>`).join('')}</div>`;
  }
  function rechtsKarten() {
    let h = stufenHtml();
    if (fertig) {
      const gut = verlauf.filter(v => v.geschickt).length;
      h += `<h2 class="bereich-titel">Fertig!</h2>
        <p class="gk-zeile">Ergebnis: ${ergebnis(karten[0].r, stufe)}</p>
        <p class="gk-sterne">${'★'.repeat(gut)}${'☆'.repeat(verlauf.length - gut)} ${gut} von ${verlauf.length} Schritten geschickt</p>
        ${verlaufHtml()}
        <div class="gk-merk"><b>${modus === 'summe' ? 'Vertauschungs- und Verbindungsgesetz' : 'Vertauschungs- und Verbindungsgesetz'}:</b>
        ${modus === 'summe' ? 'Summanden darf man – mit ihrem Vorzeichen! – vertauschen und beliebig zusammenfassen. Suche Gegenzahlen und Zahlen, die eine runde Summe ergeben.' : 'Faktoren darf man vertauschen und beliebig zusammenfassen. Suche Paare, die 1, 10, 100 … ergeben, und bestimme das Vorzeichen.'}</div>`;
      return h;
    }
    if (gewaehlt.length < 2) {
      h += `<h2 class="bereich-titel">${modus === 'summe' ? 'Welche zwei Zahlen passen gut zusammen?' : 'Welche zwei Faktoren passen gut zusammen?'}</h2>
        <p>Tippe zwei Karten an. ${gewaehlt.length === 1 ? '<b>Noch eine Karte!</b>' : ''}</p>`;
    } else {
      const [a, b] = gewaehlt.map(id => karten.find(k => k.id === id).r);
      h += `<h2 class="bereich-titel">Rechne aus</h2>
        <p class="gk-zeile">${term(a, stufe)} ${op()} ${term(b, stufe)} = ${feld('gk-erg', 'Ergebnis')}</p>
        <p class="leise">Brüche schreibst du so: 3/4, negative Zahlen mit Minus: −2,5</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-gk="pruefen">✓ Prüfen</button></div>`;
    }
    if (bewertung) h += `<p class="tb-antwort ${bewertung.ok ? 'gut' : 'schlecht'}">${bewertung.text}</p>`;
    h += verlaufHtml();
    return h;
  }
  async function pruefeKarten() {
    const [ia, ib] = gewaehlt;
    const A = karten.find(k => k.id === ia), B = karten.find(k => k.id === ib);
    const soll = verknuepfe(A.r, B.r), ist = liesRat(eing['gk-erg']);
    if (!ist) { bewertung = { ok: false, text: 'Trage ein Ergebnis ein.' }; zeichne(); return; }
    if (!gleich(ist, soll)) {
      bewertung = { ok: false, text: gleich(ist, [-soll[0], soll[1]]) && soll[0] !== 0 ? 'Fast! Das Vorzeichen stimmt nicht.' + (modus === 'summe' ? ' Welche Zahl hat den größeren Betrag?' : ' Wie viele negative Zahlen sind es?') : 'Noch nicht richtig. Rechne noch einmal.' };
      zeichne(); return;
    }
    const rest = karten.filter(k => k.id !== ia && k.id !== ib).map(k => k.r);
    const geschickt = schoen(soll, stufe) || rest.every(r => schoen(r, stufe)) || rest.length === 0;
    verlauf.push({ a: A.r, b: B.r, erg: soll, geschickt });
    const neu = { id: `k${idZaehler++}`, r: soll };
    const pos = karten.indexOf(A);
    eing = {}; gewaehlt = []; hinweis = []; tipps = 0;
    bewertung = { ok: true, text: geschickt ? 'Richtig – und geschickt!' : 'Richtig gerechnet. Aber es gibt einen geschickteren Schritt: Suche Zahlen, die zusammen eine runde Zahl ergeben.' };
    frisch = neu.id;
    await flip(root, () => {
      karten.splice(pos, 1, neu);
      karten = karten.filter(k => k.id !== ib);
      if (karten.length === 1) { fertig = true; g.sprich(verlauf.every(v => v.geschickt) ? 'Super – jeder Schritt war geschickt!' : 'Geschafft! Schau dir deinen Rechenweg an: Wo hättest du geschickter zusammenfassen können?', 'fertig'); }
      zeichne();
    }, 500);
    if (!fertig) fokus('[data-karte]');
  }
  function besterSchritt() {
    for (let i = 0; i < karten.length; i++) for (let j = i + 1; j < karten.length; j++) {
      const e = verknuepfe(karten[i].r, karten[j].r);
      if (schoen(e, stufe) && !(schoen(karten[i].r, stufe) && schoen(karten[j].r, stufe) && karten.length > 2)) return [karten[i].id, karten[j].id];
    }
    return karten.length >= 2 ? [karten[0].id, karten[1].id] : [];
  }
  function tippKarten() {
    tipps++;
    if (gewaehlt.length === 2) {
      g.sprich(modus === 'summe'
        ? 'Haben beide Zahlen dasselbe Vorzeichen, addierst du die Beträge. Sonst rechnest du großer Betrag minus kleiner Betrag; das Vorzeichen kommt von der Zahl mit dem größeren Betrag.'
        : 'Erst das Vorzeichen: gleiche Vorzeichen → plus, verschiedene → minus. Dann die Beträge multiplizieren.', 'tipp');
      return;
    }
    if (tipps === 1) {
      g.sprich({
        summe: { ganz: 'Suche Gegenzahlen (zusammen 0) und Zahlen, deren Einer sich zu einem Zehner ergänzen, z. B. −58 und 18.', dez: 'Suche Gegenzahlen und Zahlen, deren Kommastellen sich zu einer ganzen Zahl ergänzen, z. B. 2,7 und −1,7.', bruch: 'Fasse Brüche mit gleichem Nenner zusammen – dann entstehen ganze Zahlen.' },
        produkt: { ganz: 'Suche Paare, die 10, 100 oder 1000 ergeben: 25 · 4, 5 · 2, 125 · 8 …', dez: 'Suche Paare, die eine ganze Zahl ergeben: 0,5 · 2, 0,25 · 4, 1,25 · 8 …', bruch: 'Suche Kehrwerte (¾ · 4⁄3 = 1) oder Zahlen, mit denen sich der Nenner kürzen lässt.' },
      }[modus][stufe], 'tipp');
    } else {
      hinweis = besterSchritt();
      g.sprich('Die beiden leuchtenden Karten passen gut zusammen.', 'tipp');
      zeichne();
    }
  }

  /* ---------- Verteilungsgesetz ---------- */
  function neuVerteilen() { va = verteilAufgabe(stufe); vaPhase = 1; vaWahl = null; vaOk = {}; }
  function linksVerteilen() {
    return `<div class="gk-ausdruck">${va.aufgabe}</div>
      <div class="gk-merk"><b>Verteilungsgesetz</b><br>
        <span class="gk-zeile" style="justify-content:center">a · (b + c) = a · b + a · c</span>
        ${va.typ === 'aus' ? 'Kommt ein Faktor in beiden Produkten vor, kannst du ihn <b>ausklammern</b>.' : 'Eine Zahl kann man <b>zerlegen</b> (z. B. 98 = 100 − 2) und dann jeden Teil einzeln multiplizieren.'}</div>`;
  }
  function rechtsVerteilen() {
    let h = stufenHtml();
    h += `<h2 class="bereich-titel">1. Welcher Rechenweg ist am geschicktesten?</h2>
      <div class="gk-wahl">${va.optionen.map((o, i) => `<button type="button" data-option="${i}" class="${vaWahl?.includes(i) ? o.art : ''}" ${vaPhase > 1 ? 'disabled' : ''}>${o.html}</button>`).join('')}</div>`;
    if (bewertung && vaPhase === 1) h += `<p class="tb-antwort ${bewertung.ok ? 'gut' : 'schlecht'}">${bewertung.text}</p>`;
    if (vaPhase >= 2) {
      h += `<h2 class="bereich-titel">2. Rechne Schritt für Schritt</h2>`;
      if (va.hinweis) h += `<p class="leise">${va.hinweis}</p>`;
      h += va.schritte.map((s, i) => `<p class="gk-zeile">${s.anzeige ?? s.html} ${feld(`gk-s${i}`, `Schritt ${i + 1}`)}</p>`).join('');
      if (vaPhase === 2) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-gk="pruefen">✓ Prüfen</button></div>`;
      if (bewertung) h += `<p class="tb-antwort ${bewertung.ok ? 'gut' : 'schlecht'}">${bewertung.text}</p>`;
      if (vaPhase === 3) h += `<div class="gk-merk"><b>${va.gesetz}</b><br>${va.aufgabe} = ${ergebnis(va.erg, stufe)}</div>`;
    }
    return h;
  }
  function waehle(i) {
    const o = va.optionen[i];
    vaWahl = [...(vaWahl || []), i];
    if (o.art === 'gut') { vaPhase = 2; bewertung = { ok: true, text: o.text }; zeichne(); bewertung = null; g.sprich(o.text, 'info'); fokus('#gk-s0'); return; }
    bewertung = { ok: false, text: (o.art === 'geht' ? 'Richtig, aber nicht am geschicktesten. ' : 'Das stimmt nicht. ') + o.text };
    zeichne();
  }
  function pruefeVerteilen() {
    let alle = true;
    va.schritte.forEach((s, i) => { const r = liesRat(eing[`gk-s${i}`]); vaOk[i] = !!r && gleich(r, s.wert); if (!vaOk[i]) alle = false; });
    if (alle) { vaPhase = 3; bewertung = { ok: true, text: 'Alles richtig!' }; g.sprich('Geschickt gerechnet – mit dem Verteilungsgesetz!', 'fertig'); }
    else {
      const erster = va.schritte.findIndex((s, i) => !vaOk[i]);
      const r = liesRat(eing[`gk-s${erster}`]); const w = va.schritte[erster].wert;
      bewertung = { ok: false, text: r && gleich(r, [-w[0], w[1]]) && w[0] !== 0 ? `Schritt ${erster + 1}: Das Vorzeichen stimmt nicht.` : `Schritt ${erster + 1} stimmt noch nicht.` };
    }
    zeichne();
    va.schritte.forEach((s, i) => { const e = root.querySelector(`#gk-s${i}`); if (e && eing[`gk-s${i}`]) e.classList.add(vaOk[i] ? 'richtig' : 'falsch'); if (e && vaPhase === 3) e.disabled = true; });
  }
  function tippVerteilen() {
    tipps++;
    if (vaPhase === 1) {
      g.sprich(va.typ === 'aus'
        ? 'Welcher Faktor kommt in beiden Produkten vor? Den schreibst du einmal vor eine Klammer, in die Klammer kommt der Rest.'
        : 'Welche runde Zahl liegt ganz in der Nähe? Zerlege in „runde Zahl + kleiner Rest“ und vergiss die Klammer nicht.', 'tipp');
    } else {
      g.sprich(tipps > 2 ? `Lösung zum Vergleich: ${va.schritte.map(s => `${s.html} ${zahl(s.wert, stufe)}`).join(';  ')}` : 'Rechne jeden Schritt einzeln. Denk an die Vorzeichenregeln: gleiche Vorzeichen → plus, verschiedene → minus.', 'tipp');
    }
  }

  /* ---------- Allgemein ---------- */
  function fokus(sel) { requestAnimationFrame(() => root.querySelector(sel)?.focus({ preventScroll: true })); }
  function neu() {
    bewertung = null; tipps = 0; eing = {};
    if (modus === 'verteilen') neuVerteilen(); else { neuKarten(); start = ausdruck(); }
  }
  function zeichne() {
    g.reiter(modus);
    g.titel({ summe: 'Geschickt addieren', produkt: 'Geschickt multiplizieren', verteilen: 'Verteilungsgesetz nutzen' }[modus]);
    if (modus === 'verteilen') { g.links.innerHTML = linksVerteilen(); g.rechts.innerHTML = rechtsVerteilen(); }
    else { g.links.innerHTML = linksKarten(); g.rechts.innerHTML = rechtsKarten(); }
  }
  function startText() {
    g.sprich({
      summe: 'Fasse immer zwei Karten zusammen. Geschickt ist es, wenn dabei eine runde Zahl herauskommt.',
      produkt: 'Fasse immer zwei Faktoren zusammen. Geschickt ist es, wenn dabei 1, 10, 100 … oder eine ganze Zahl herauskommt.',
      verteilen: 'Wähle zuerst den geschicktesten Rechenweg. Dann rechnest du Schritt für Schritt.',
    }[modus]);
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const sf = e.target.closest('[data-stufe]');
    if (sf) { stufe = sf.dataset.stufe; neu(); zeichne(); startText(); return; }
    const ka = e.target.closest('[data-karte]');
    if (ka && !fertig && modus !== 'verteilen') {
      const id = ka.dataset.karte;
      if (gewaehlt.includes(id)) gewaehlt = gewaehlt.filter(x => x !== id);
      else if (gewaehlt.length < 2) gewaehlt.push(id);
      else gewaehlt = [gewaehlt[1], id];
      bewertung = null; eing = {}; frisch = null;
      zeichne();
      if (gewaehlt.length === 2) fokus('#gk-erg');
      return;
    }
    const opt = e.target.closest('[data-option]');
    if (opt && modus === 'verteilen' && vaPhase === 1) { waehle(Number(opt.dataset.option)); return; }
    const b = e.target.closest('[data-gk]');
    if (!b) return;
    const was = b.dataset.gk;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'tipp') (modus === 'verteilen' ? tippVerteilen : tippKarten)();
    if (was === 'pruefen') (modus === 'verteilen' ? pruefeVerteilen : pruefeKarten)();
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('[data-gkein]')) { e.preventDefault(); (modus === 'verteilen' ? pruefeVerteilen : pruefeKarten)(); }
  });

  neu(); zeichne(); startText();
}

/* Für das Arbeitsblatt / Tests */
export const _intern = { summenKarten, produktKarten, verteilAufgabe, liesRat, plus, mal, gleich, schoen };
