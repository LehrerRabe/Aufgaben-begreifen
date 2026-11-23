/* Mathematik: Brüche dividieren (Klasse 6).
   Stufe 1 „Bruch : Zahl“ (gerecht teilen): Messer schneidet quer in k Zeilen, eine Zeile antippen = ein k-tel vom blauen Teil
     → Nenner · Zahl (die Stücke werden k-mal kleiner). Wenn der Zähler teilbar ist, geht auch Zähler : Zahl.
   Stufe 2 „Bruch : Bruch“ (Wie oft passt …?): 1. gemeinsamen Nenner finden, 2. Messer verfeinert, 3. erweiterte Zähler,
     4. Messstreifen so oft wie möglich anlegen (auch teilweise), 5. Ergebnis als Bruch, kürzen/gemischte Zahl,
     6. Kontrolle mit dem Kehrwert: a/b : c/d = a/b · d/c. */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, bruchFeld, zahlenMerken, ggT, kgV, warte } from './geruest.js';
import {
  meldungHtml, streifenSvg, streifenHoehe, stueckPos, schneiden, schneidenQuer, flug, vielfacheHtml, folgeKette, ketteFertig, ketteHtml, kettePruefen,
  liesBruch, merkeHtml, filmKnopf, ueber1Html, ueber1Lesen, ueber1Setzen, bruchWort, nennerName, zahlHtml, gleich, kuerze,
} from './bruchbild.js';
import { zeigeFilm, bruchSvg, textSvg } from './erklaerfilm.js';
import { messerText } from './bruchplus.js';

const PAARE = [[2, 4], [4, 2], [2, 8], [8, 2], [4, 8], [8, 4], [2, 6], [6, 2], [3, 6], [6, 3], [2, 3], [3, 2], [3, 4], [4, 3], [4, 6], [6, 4], [4, 12], [12, 4], [6, 12], [12, 6], [3, 12], [12, 3]];
const MAX_N = 24;

export function neueDurchAufgabe(stufe, ueber1) {
  for (let v = 0; v < 1000; v++) {
    if (stufe === 'zahl') {
      const k = zufall(2, 4), b = zufall(2, 6);
      const a = ueber1 ? zufall(b + 1, 2 * b - 1) : zufall(1, b - 1);
      if (ggT(a, b) !== 1 || b * k > 24) continue;
      return { a, b, k };
    }
    const [b, d] = wahl(PAARE), N = kgV(b, d);
    const a = ueber1 ? zufall(b + 1, 2 * b - 1) : zufall(1, b - 1), c = zufall(1, d - 1);
    if (ggT(a, b) !== 1 || ggT(c, d) !== 1) continue;
    const A = a * N / b, C = c * N / d;
    if (C >= A || A / C > 6) continue;
    const [, rn] = kuerze(A, C);
    if (rn > 4) continue;
    return { a, b, c, d };
  }
  return stufe === 'zahl' ? { a: 3, b: 4, k: 2 } : { a: 3, b: 4, c: 3, d: 8 };
}

const X = 104, W = 420, H = 50, ABST = 14, ZEILE = 40;

export function starteBruchDurch(root) {
  let stufe = 'zahl', ueber1 = ueber1Lesen();
  let auf, phase, eing = {}, bewertung = null, laeuft = false, tippStufe = 0, kette;
  let zeileGewaehlt, N, A, C, k1, k2, gewaehlt, falscherNenner, anlagen;

  const g = geruest(root, {
    etikett: 'Brüche',
    titel: 'Brüche dividieren',
    reiter: [{ id: 'zahl', titel: 'Bruch : Zahl', unter: '¾ : 2 – gerecht teilen' }, { id: 'bruch', titel: 'Bruch : Bruch', unter: 'Wie oft passt ⅜ in ¾?' }],
    knoepfe: `${filmKnopf}<button type="button" class="kn-gross kn-tipp" data-bd="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bd="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    auf = neueDurchAufgabe(stufe, ueber1);
    root.dataset.aufgabe = JSON.stringify(auf); // für Tests
    phase = stufe === 'zahl' ? 'schneiden' : 'nenner';
    zeileGewaehlt = null; kette = null; gewaehlt = null; falscherNenner = null; anlagen = 0;
    if (stufe === 'bruch') { N = null; A = auf.a; C = auf.c; k1 = k2 = 1; }
    for (const k of Object.keys(eing)) delete eing[k];
    bewertung = null; tippStufe = 0;
  }
  const soll = () => (stufe === 'zahl' ? [auf.a, auf.b * auf.k] : [auf.a * auf.d, auf.b * auf.c]);

  /* ---------- Stufe 1: Quadrate ---------- */
  const ganzeZ = () => Math.ceil(auf.a / auf.b);
  const quadrate = () => (ganzeZ() === 1 ? [{ x: 190, y: 34, s: 270 }] : [{ x: 60, y: 34, s: 240 }, { x: 340, y: 34, s: 240 }]);
  const geschnitten = () => phase !== 'schneiden';
  function bildZahl() {
    const qs = quadrate(), R = geschnitten() ? auf.k : 1, b = auf.b;
    let s = `<svg class="br-svg" viewBox="0 0 640 ${qs[0].y + qs[0].s + 18}" role="img" aria-label="Quadrate als Ganze">`;
    qs.forEach((q, w) => {
      const cw = q.s / b, rh = q.s / R;
      for (let c = 0; c < b; c++) for (let r = 0; r < R; r++) {
        const blau = w * b + c < auf.a, gruen = blau && zeileGewaehlt === r;
        s += `<rect x="${q.x + c * cw}" y="${q.y + r * rh}" width="${cw}" height="${rh}" class="br-st br-${gruen ? 'c' : blau ? 'a' : 'leer'}"/>`;
      }
      for (let c = 1; c < b; c++) s += `<line x1="${q.x + c * cw}" x2="${q.x + c * cw}" y1="${q.y}" y2="${q.y + q.s}" class="br-linie"/>`;
      for (let r = 1; r < R; r++) s += `<line x1="${q.x}" x2="${q.x + q.s}" y1="${q.y + r * rh}" y2="${q.y + r * rh}" class="br-linie"/>`;
      if (phase === 'waehlen') for (let r = 0; r < R; r++) s += `<rect x="${q.x}" y="${q.y + r * rh}" width="${q.s}" height="${rh}" class="br-wahl" data-zeile="${r}" role="button" tabindex="0" aria-label="Zeile ${r + 1}"/>`;
      s += `<rect x="${q.x}" y="${q.y}" width="${q.s}" height="${q.s}" rx="3" class="br-rand"/>`;
      if (qs.length > 1) s += `<text x="${q.x + q.s / 2}" y="${q.y - 10}" class="br-achse">${w + 1}. Ganzes</text>`;
    });
    return s + '</svg>';
  }

  /* ---------- Stufe 2: Streifen + Messstreifen ---------- */
  const vorher = () => phase === 'nenner' || phase === 'schneiden';
  function zeilenBruch() {
    const nA = vorher() ? auf.b : N, nC = vorher() ? auf.d : N;
    const gA = Math.max(1, Math.ceil(auf.a / auf.b));
    const a = { id: 'a', y: 14, N: nA, ganze: gA, anz: vorher() ? auf.a : A };
    const m = { id: 'm', y: 14 + streifenHoehe(gA, H, ABST) + ZEILE, N: nC, ganze: 1, anz: vorher() ? auf.c : C };
    return { a, m, hoehe: m.y + H + 18 };
  }
  const opt = r => ({ x: X, y: r.y, w: W, h: H, N: r.N, ganze: r.ganze, abstand: ABST });
  const klein = (x, y, z, n, kl = '') => { const b = Math.max(String(z).length, String(n).length) * 13 + 8; return `<g class="br-label ${kl}"><text x="${x}" y="${y - 5}">${z}</text><line x1="${x - b / 2}" x2="${x + b / 2}" y1="${y}" y2="${y}"/><text x="${x}" y="${y + 19}">${n}</text></g>`; };
  /** Klammern für die angelegten Messstreifen (über Zeilenumbrüche hinweg) */
  function anlagenSvg(r) {
    let s = '';
    const o = opt(r), pw = W / N;
    for (let p = 0; p < anlagen; p++) {
      const von = p * C, bis = Math.min((p + 1) * C, A), teil = bis - von < C;
      let i = von;
      while (i < bis) {
        const zeile = Math.floor(i / N), ende = Math.min(bis, (zeile + 1) * N), pos = stueckPos(o, i);
        s += `<rect x="${pos.x + 2}" y="${pos.y + 3}" width="${(ende - i) * pw - 4}" height="${H - 6}" rx="8" class="br-mess${teil ? ' teil' : ''}" data-anlage="${p}"/>`;
        if (i === von) s += `<text x="${pos.x + ((ende - i) * pw) / 2}" y="${pos.y + H / 2 + 7}" class="br-mess-zahl${teil ? ' teil' : ''}">${teil ? `${bis - von}/${C}` : p + 1}</text>`;
        i = ende;
      }
    }
    return s;
  }
  function bildBruch() {
    const { a, m, hoehe } = zeilenBruch();
    let s = `<svg class="br-svg" viewBox="0 0 640 ${hoehe}" role="img" aria-label="Bruchstreifen und Messstreifen">`;
    s += klein(64, a.y + H / 2, ...(vorher() ? [auf.a, auf.b] : [A, N]), 'br-label-a');
    s += streifenSvg({ ...opt(a), id: 'a', art: i => (i < a.anz ? 'a' : 'leer') });
    if (!vorher() && phase !== 'erweitert') s += anlagenSvg(a);
    s += `<text x="20" y="${m.y + H / 2 + 10}" class="br-zeichen">:</text>`;
    s += klein(64, m.y + H / 2, ...(vorher() ? [auf.c, auf.d] : [C, N]), 'br-label-b');
    s += streifenSvg({ ...opt(m), id: 'm', art: i => (i < m.anz ? 'b' : 'leer') });
    s += `<text x="${X + W + 8}" y="${m.y + H / 2 + 5}" class="br-ganz-text">Messstreifen</text>`;
    return s + '</svg>';
  }

  /* ---------- Rechts ---------- */
  const zeile = (nr, t, f) => `<p class="vz-schritt${f ? ' fertig' : ''}">${f ? '✓' : nr + '.'} ${t}</p>`;
  const aufgabeHtml = () => (stufe === 'zahl' ? `${zahlHtml(auf.a, auf.b, ueber1)} : ${auf.k}` : `${zahlHtml(auf.a, auf.b, ueber1)} : ${bruchHtml(auf.c, auf.d)}`);
  const gleichHtml = () => `${bruchHtml(A, N)} : ${bruchHtml(C, N)}`;

  function rechts() {
    let h = `<h2 class="bereich-titel">Aufgabe</h2><div class="rr-gross br-aufgabe">${aufgabeHtml()} = ?</div>`;
    if (stufe === 'zahl') {
      const ord = ['schneiden', 'waehlen', 'ergebnis', 'kette', 'fertig'], pos = ord.indexOf(phase);
      h += `<p class="leise br-deutung">${aufgabeHtml()} heißt: ${bruchHtml(auf.a, auf.b)} gerecht in ${auf.k} gleiche Teile teilen. Wie groß ist ein Teil?</p>`;
      h += zeile(1, `Schneide quer in ${auf.k} gleiche Zeilen`, pos > 0);
      if (phase === 'schneiden') h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-bd="schneiden" ${laeuft ? 'disabled' : ''}>🔪 Quer schneiden</button></div>`;
      if (pos >= 1) h += zeile(2, 'Tippe eine Zeile an – das ist ein Teil', pos > 1);
      if (pos >= 2) {
        h += zeile(3, 'Wie groß ist ein Teil vom Ganzen?', pos > 2);
        if (phase === 'ergebnis') h += `<p class="leise">Zähle die grünen Stücke. In wie viele Stücke ist ein Ganzes jetzt geteilt?</p>
          <div class="gs-pruef br-gl">${aufgabeHtml()} = ${bruchFeld('bd-ez', 'bd-en', eing)}<button type="button" class="kn-gross" data-bd="pruefen">✓ Prüfen</button></div>`;
        else h += `<p class="br-kette-zeile">${aufgabeHtml()} = ${bruchHtml(kette.alt.z, kette.alt.n)}</p>`;
      }
      if (kette) h += ketteHtml(kette, eing, 'bd');
    } else {
      const ord = ['nenner', 'schneiden', 'erweitert', 'messen', 'ergebnis', 'kette', 'kehrwert', 'fertig'], pos = ord.indexOf(phase);
      h += `<p class="leise br-deutung">${aufgabeHtml()} heißt: <b>Wie oft passt</b> ${bruchHtml(auf.c, auf.d)} in ${bruchHtml(auf.a, auf.b)}?</p>`;
      h += zeile(1, `Gemeinsamen Nenner finden${pos > 0 ? `: <b>${gewaehlt ?? N}</b>` : ''}`, pos > 0);
      if (phase === 'nenner') h += `<p class="leise">Tippe eine Zahl an, die in <b>beiden</b> Reihen vorkommt.</p>${vielfacheHtml(auf.b, auf.d, gewaehlt, falscherNenner)}`;
      if (pos >= 2) {
        h += zeile(2, 'Gleichnamig machen', pos > 2);
        if (phase === 'erweitert') h += `<p class="leise">Zähle im Bild die ${nennerName(N)}.</p>
          <div class="br-erw-zeile">${zahlHtml(auf.a, auf.b, ueber1)} = ${bruchFeld('bd-z1', 'bd-n1', { ...eing, 'bd-n1': eing['bd-n1'] ?? String(N) })}</div>
          <div class="br-erw-zeile">${bruchHtml(auf.c, auf.d)} = ${bruchFeld('bd-z2', 'bd-n2', { ...eing, 'bd-n2': eing['bd-n2'] ?? String(N) })}</div>
          <div class="gs-pruef"><button type="button" class="kn-gross" data-bd="pruefen">✓ Prüfen</button></div>`;
        else h += `<p class="br-kette-zeile">${aufgabeHtml()} = ${gleichHtml()}</p>`;
      }
      if (pos >= 3) {
        h += zeile(3, 'Messstreifen anlegen: Wie oft passt er?', pos > 3);
        if (phase === 'messen') h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-bd="anlegen" ${laeuft ? 'disabled' : ''}>📏 Messstreifen anlegen</button>${anlagen >= 2 && anlagen * C < A ? `<button type="button" class="kn-gross kn-leise" data-bd="restanlegen" ${laeuft ? 'disabled' : ''}>⏩ Bis zum Ende</button>` : ''}</div>`;
      }
      if (pos >= 4) {
        h += zeile(4, 'Ergebnis als Bruch', pos > 4);
        if (phase === 'ergebnis') h += `<p class="leise">Wie oft passt der Messstreifen? Schreibe die Zahl als Bruch (auch eine ganze Zahl geht als Bruch, z. B. ²⁄₁).</p>
          <div class="gs-pruef br-gl">${gleichHtml()} = ${bruchFeld('bd-ez', 'bd-en', eing)}<button type="button" class="kn-gross" data-bd="pruefen">✓ Prüfen</button></div>`;
        else h += `<p class="br-kette-zeile">${gleichHtml()} = ${bruchHtml(kette.alt.z, kette.alt.n)}</p>`;
      }
      if (kette) h += ketteHtml(kette, eing, 'bd');
      if (pos >= 6) {
        h += zeile(5, 'Kontrolle mit dem Kehrwert', pos > 6);
        if (phase === 'kehrwert') h += `<p class="leise">Durch einen Bruch teilen = mit dem <b>Kehrwert</b> malnehmen (Zähler und Nenner tauschen).</p>
          <div class="gs-pruef br-gl">${bruchHtml(auf.a, auf.b)} · ${bruchFeld('bd-kz', 'bd-kn', eing)} = ${bruchFeld('bd-pz', 'bd-pn', eing)}<button type="button" class="kn-gross" data-bd="pruefen">✓ Prüfen</button></div>`;
        else h += `<p class="br-kette-zeile">${bruchHtml(auf.a, auf.b)} · ${bruchHtml(auf.d, auf.c)} = ${bruchHtml(auf.a * auf.d, auf.b * auf.c)} ✓</p>`;
      }
    }
    if (phase === 'fertig') h += `<p class="br-fertig" data-fertig>Fertig!</p>`;
    h += meldungHtml(bewertung, phase === 'fertig');
    h += merkeHtml('Merke', `<p><b>Bruch : Zahl:</b> Den Nenner mit der Zahl malnehmen – jedes Stück wird in so viele Teile geschnitten.</p>
      <p class="br-merke-bsp">${bruchHtml(3, 4)} : 2 = ${bruchHtml(3, '4 · 2')} = ${bruchHtml(3, 8)}</p>
      <p class="leise">Ist der Zähler durch die Zahl teilbar, geht auch: ${bruchHtml(6, 7)} : 3 = ${bruchHtml('6 : 3', 7)} = ${bruchHtml(2, 7)}</p>
      <p><b>Bruch : Bruch:</b> Wie oft passt der zweite Bruch in den ersten? Gleichnamig machen und die Zähler teilen – oder schneller: <b>mit dem Kehrwert malnehmen</b>.</p>
      <p class="br-merke-bsp">${bruchHtml(3, 4)} : ${bruchHtml(3, 8)} = ${bruchHtml(3, 4)} · ${bruchHtml(8, 3)} = ${bruchHtml(24, 12)} = 2</p>`);
    return h;
  }

  function links() {
    if (stufe === 'zahl') return ueber1Html(ueber1, 'Start mit mehr als 1 Ganzem') + `<div class="br-bild br-bild-quadrat">${bildZahl()}</div><div class="br-unter"><p class="br-zaehler">${zaehlerZahl()}</p></div>`;
    let h = ueber1Html(ueber1, 'Start mit mehr als 1 Ganzem') + `<div class="br-bild">${bildBruch()}</div><div class="br-unter">`;
    if (phase === 'nenner') h += `<p class="br-hinweis">Die Stücke sind <b>verschieden groß</b> (${nennerName(auf.b)} und ${nennerName(auf.d)}). Um zu messen, brauchen beide dieselbe Einteilung.</p>`;
    if (phase === 'messen' || pos('ergebnis')) h += `<p class="br-zaehler">Angelegt: <b>${anlagenText()}</b></p>`;
    return h + '</div>';
  }
  const pos = p => { const ord = ['nenner', 'schneiden', 'erweitert', 'messen', 'ergebnis', 'kette', 'kehrwert', 'fertig']; return ord.indexOf(phase) >= ord.indexOf(p); };
  function anlagenText() {
    const ganz = Math.min(anlagen, Math.floor(A / C)), rest = A - ganz * C;
    if (anlagen > ganz && rest) return `${ganz}-mal ganz und ${rest} von ${C} Stücken`;
    return `${anlagen}-mal`;
  }
  function zaehlerZahl() {
    if (phase === 'schneiden') return `Blau: ${zahlHtml(auf.a, auf.b, ueber1)} – in ${auf.k} gleiche Teile teilen`;
    if (phase === 'waehlen') return `Jetzt hat jedes Ganze ${auf.b * auf.k} Stücke.`;
    if (phase === 'ergebnis') return 'Zähle die grünen Stücke – und alle Stücke eines Ganzen.';
    return `Ein Teil: <b>${auf.a}</b> grüne Stücke · Ein Ganzes: <b>${auf.b * auf.k}</b> Stücke`;
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); g.reiter(stufe); }

  /* ---------- Ablauf Stufe 1 ---------- */
  async function quer() {
    if (phase !== 'schneiden' || laeuft) return;
    laeuft = true; zeichne();
    const svg = root.querySelector('.br-svg');
    for (const q of quadrate()) await schneidenQuer(svg, { x: q.x, y: q.y, w: q.s, h: q.s }, auf.k);
    laeuft = false;
    phase = 'waehlen'; zeichne();
    g.sprich(`Der blaue Teil ist jetzt in ${auf.k} gleiche Zeilen geteilt. Tippe eine Zeile an.`);
  }
  function zeileTippen(r) {
    if (phase !== 'waehlen') return;
    zeileGewaehlt = r; phase = 'ergebnis'; zeichne();
    g.sprich(`Grün ist ein ${auf.k === 2 ? 'halber' : `${auf.k}.`} Teil. Wie groß ist er – gemessen am ganzen Quadrat?`);
    root.querySelector('#bd-ez')?.focus({ preventScroll: true });
  }

  /* ---------- Ablauf Stufe 2 ---------- */
  async function nennerGewaehlt(m) {
    if (laeuft) return;
    const inA = m % auf.b === 0, inB = m % auf.d === 0;
    if (!(inA && inB)) { falscherNenner = m; gewaehlt = null; bewertung = { ok: false, text: `${m} steht nicht in der Reihe von ${inA ? auf.d : auf.b}. Suche eine Zahl, die in <b>beiden</b> Reihen vorkommt.` }; return zeichne(); }
    if (m > MAX_N) { falscherNenner = m; bewertung = { ok: false, text: `${m} geht – aber die Stücke würden winzig. Nimm einen kleineren gemeinsamen Nenner.` }; return zeichne(); }
    gewaehlt = m; falscherNenner = null;
    const kv = kgV(auf.b, auf.d);
    bewertung = { ok: true, text: m === kv ? `${m} ist der kleinste gemeinsame Nenner.` : `${m} geht! Der kleinste gemeinsame Nenner wäre ${kv}.` };
    phase = 'schneiden'; laeuft = true; zeichne();
    k1 = m / auf.b; k2 = m / auf.d;
    g.sprich(messerText(auf.b, k1, auf.d, k2, m));
    await warte(450);
    const svg = root.querySelector('.br-svg'), { a, m: ms } = zeilenBruch();
    if (k1 > 1) await schneiden(svg, opt(a), k1);
    if (k2 > 1) await schneiden(svg, opt(ms), k2);
    await warte(250);
    if (!root.isConnected || phase !== 'schneiden') { laeuft = false; return; }
    N = m; A = auf.a * k1; C = auf.c * k2;
    phase = 'erweitert'; laeuft = false; bewertung = null; tippStufe = 0; zeichne();
    g.sprich(`Jetzt sind alle Stücke ${nennerName(N)}. Trage die neuen Zähler ein.`);
    root.querySelector('#bd-z1')?.focus({ preventScroll: true });
  }
  function pruefeErweitert() {
    const z1 = eing['bd-z1'], z2 = eing['bd-z2'];
    const n1 = Number(eing['bd-n1'] ?? N), n2 = Number(eing['bd-n2'] ?? N);
    if (!z1 || !z2) { bewertung = { ok: false, text: 'Trage beide neuen Zähler ein.' }; return zeichne(); }
    if (n1 !== N || n2 !== N) { bewertung = { ok: false, text: `Beide Brüche sollen den Nenner ${N} bekommen.` }; return zeichne(); }
    const f = [];
    if (+z1 !== A) f.push(`Erster Bruch: zähle die blauen Stücke – oder rechne ${auf.a} · ${k1}.`);
    if (+z2 !== C) f.push(`Messstreifen: zähle die orangen Stücke – oder rechne ${auf.c} · ${k2}.`);
    if (f.length) { bewertung = { ok: false, text: f.join('<br>') }; return zeichne(); }
    bewertung = { ok: true, text: `Gleichnamig: ${gleichHtml()}` };
    phase = 'messen'; tippStufe = 0; zeichne();
    g.sprich(`Jetzt messen: Wie oft passen ${C} Stücke in ${A} Stücke? Lege den Messstreifen an.`);
  }
  async function anlegen() {
    if (phase !== 'messen' || laeuft || anlagen * C >= A) return;
    laeuft = true;
    anlagen++;
    zeichne();
    const { a, m } = zeilenBruch();
    const von = (anlagen - 1) * C, ziel = stueckPos(opt(a), von), start = stueckPos(opt(m), 0);
    const el = root.querySelectorAll(`[data-anlage="${anlagen - 1}"]`);
    await Promise.all([...el].map(e => flug(e, start.x - ziel.x, start.y - ziel.y, 560)));
    laeuft = false;
    if (anlagen * C >= A) {
      const rest = A - (anlagen - 1) * C;
      phase = 'ergebnis'; zeichne();
      g.sprich(rest < C ? `Der letzte Messstreifen ist nur zu ${rest} von ${C} Stücken gefüllt – das ist ${bruchWort(rest, C)} Messstreifen. Wie oft passt er also insgesamt?` : `Er passt ohne Rest. Wie oft genau?`);
      root.querySelector('#bd-ez')?.focus({ preventScroll: true });
    } else zeichne();
  }
  function pruefeKehrwert() {
    const k = liesBruch(eing, 'bd-kz', 'bd-kn'), p = liesBruch(eing, 'bd-pz', 'bd-pn');
    if (!k || !p || !k.n || !p.n) { bewertung = { ok: false, text: 'Trage den Kehrwert und das Ergebnis ein.' }; return zeichne(); }
    if (!(k.z === auf.d && k.n === auf.c)) { bewertung = { ok: false, text: k.z === auf.c && k.n === auf.d ? `Kehrwert heißt: Zähler und Nenner <b>tauschen</b>. Aus ${bruchHtml(auf.c, auf.d)} wird …` : `Der Kehrwert von ${bruchHtml(auf.c, auf.d)}: Zähler und Nenner tauschen.` }; return zeichne(); }
    if (!gleich(p.z, p.n, auf.a * auf.d, auf.b * auf.c)) { bewertung = { ok: false, text: 'Kehrwert stimmt! Jetzt Zähler · Zähler und Nenner · Nenner.' }; return zeichne(); }
    bewertung = { ok: true, text: `Stimmt! ${bruchHtml(p.z, p.n)} ist dasselbe Ergebnis wie beim Messen.` };
    phase = 'fertig'; zeichne(); g.sprich('Super! Messen und Kehrwert-Regel liefern dasselbe Ergebnis.', 'fertig');
  }

  /* ---------- Ergebnis ---------- */
  function pruefe() {
    const e = liesBruch(eing, 'bd-ez', 'bd-en');
    if (!e || !e.n) { bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' }; return zeichne(); }
    const [sz, sn] = soll();
    if (gleich(e.z, e.n, sz, sn)) {
      kette = folgeKette(e.z, e.n, stufe === 'bruch' || ueber1);
      bewertung = { ok: true, text: `Richtig: ${bruchHtml(e.z, e.n)}` };
      phase = ketteFertig(kette) ? (stufe === 'bruch' ? 'kehrwert' : 'fertig') : 'kette';
      zeichne();
      if (phase === 'fertig') g.sprich('Super gerechnet!', 'fertig');
      else if (phase === 'kehrwert') g.sprich('Richtig! Jetzt die Kontrolle mit dem Kehrwert.');
      else g.sprich(kette.schritte[0].art === 'kuerzen' ? 'Richtig! Kann man noch kürzen?' : kette.schritte[0].art === 'ganz' ? 'Richtig! Das ist eine ganze Zahl.' : 'Richtig! Schreibe es als gemischte Zahl.');
      return;
    }
    if (stufe === 'zahl') {
      if (gleich(e.z, e.n, auf.a, auf.b)) bewertung = { ok: false, text: 'Das ist noch der ganze blaue Teil. Gesucht ist nur <b>ein</b> Teil (eine Zeile).' };
      else if (e.z === auf.a && e.n !== auf.b * auf.k) bewertung = { ok: false, text: `Der Zähler stimmt. In wie viele Stücke ist <b>ein</b> Ganzes jetzt geteilt? (${auf.b} Spalten · ${auf.k} Zeilen)` };
      else if (e.n === auf.b && e.z * auf.k !== auf.a) bewertung = { ok: false, text: `Die Stücke sind kleiner geworden – zähle die Stücke in einem Ganzen.` };
      else bewertung = { ok: false, text: 'Zähle die grünen Stücke (Zähler) und alle Stücke eines Ganzen (Nenner).' };
    } else {
      if (gleich(e.z, e.n, sn, sz)) bewertung = { ok: false, text: 'Umgekehrt! Gefragt ist: Wie oft passt der <b>Messstreifen</b> in den blauen Streifen?' };
      else bewertung = { ok: false, text: `Der Messstreifen hat ${C} Stücke, der blaue Teil ${A} Stücke. ${A} : ${C} als Bruch: ${bruchHtml(A, '?')}` };
    }
    zeichne();
  }
  function pruefeKette() {
    bewertung = kettePruefen(kette, eing, 'bd');
    if (ketteFertig(kette)) {
      if (stufe === 'bruch') { phase = 'kehrwert'; g.sprich('Richtig! Jetzt die Kontrolle mit dem Kehrwert.'); }
      else { phase = 'fertig'; g.sprich('Super gerechnet!', 'fertig'); }
    }
    zeichne();
  }

  function tipp() {
    tippStufe++;
    const t = {
      schneiden: stufe === 'zahl' ? ['Tippe auf „Quer schneiden“ – das Messer teilt in gleich große Zeilen.'] : ['Warte kurz – das Messer arbeitet.'],
      waehlen: ['Tippe irgendeine Zeile an – alle Zeilen sind gleich groß.'],
      nenner: [`Welche Zahl steht in der ${auf?.b}er- und in der ${auf?.d}er-Reihe?`, `Probiere ${stufe === 'bruch' ? kgV(auf.b, auf.d) : ''}.`],
      erweitert: ['Zähle die gefärbten Stücke nach dem Schneiden.'],
      messen: ['Tippe so oft auf „Messstreifen anlegen“, bis der blaue Teil bedeckt ist.'],
      ergebnis: stufe === 'zahl'
        ? [`Ein Ganzes hat jetzt ${auf.b} · ${auf.k} = ${auf.b * auf.k} Stücke.`, `Nenner · Zahl: ${auf.b} · ${auf.k}. Der Zähler bleibt ${auf.a}.`]
        : [`Zähle die ganzen Messstreifen und den Teil vom letzten.`, `Der Messstreifen passt ${A} : ${C}-mal. Als Bruch: Zähler ${A}, Nenner ${C}.`],
      kette: [kette?.schritte[kette.i]?.art === 'gemischt' ? 'Wie viele Ganze passen hinein? Der Rest bleibt als Bruch.' : 'Suche eine Zahl, durch die Zähler und Nenner beide teilbar sind.'],
      kehrwert: [stufe === 'bruch' ? `Kehrwert von ${bruchHtml(auf.c, auf.d)} ist ${bruchHtml(auf.d, auf.c)}.` : ''],
    }[phase];
    if (!t) return g.sprich('Fertig! Mit „Neue Aufgabe“ geht es weiter.', 'tipp');
    g.sprich(t[Math.min(tippStufe, t.length) - 1], 'tipp');
  }

  function start() {
    g.sprich(stufe === 'zahl' ? 'Teilen heißt: gerecht aufteilen. Das Messer hilft dir dabei.' : 'Durch einen Bruch teilen heißt: Wie oft passt er hinein? Dafür brauchen beide dieselbe Einteilung.');
  }

  root.addEventListener('click', e => {
    const ze = e.target.closest('[data-zeile]'); if (ze) return zeileTippen(+ze.dataset.zeile);
    const vf = e.target.closest('[data-vf]'); if (vf && phase === 'nenner') return nennerGewaehlt(+vf.dataset.vf);
    const r = e.target.closest('[data-reiter]');
    if (r && !laeuft) { stufe = r.dataset.reiter; neu(); zeichne(); start(); return; }
    const u = e.target.closest('[data-ueber1]');
    if (u && !laeuft) { ueber1 = u.dataset.ueber1 === '1'; ueber1Setzen(ueber1); neu(); zeichne(); start(); return; }
    if (e.target.closest('[data-film]')) return zeigeFilm('Brüche dividieren', filmDurch());
    if (e.target.closest('[data-kette="pruefen"]')) return pruefeKette();
    const b = e.target.closest('[data-bd]');
    if (!b) return;
    const a = b.dataset.bd;
    if (a === 'neu' && !laeuft) { neu(); zeichne(); start(); }
    if (a === 'tipp') tipp();
    if (a === 'schneiden') quer();
    if (a === 'anlegen') anlegen();
    if (a === 'restanlegen') (async () => { while (phase === 'messen' && anlagen * C < A) { await anlegen(); await warte(60); } })();
    if (a === 'pruefen') { if (phase === 'erweitert') pruefeErweitert(); else if (phase === 'ergebnis') pruefe(); else if (phase === 'kehrwert') pruefeKehrwert(); }
  });
  root.addEventListener('keydown', e => {
    const t = e.target.closest?.('[data-zeile]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); zeileTippen(+t.dataset.zeile); }
  });

  neu(); zeichne(); start();
}

/* ====================== Erklärfilm ====================== */
function filmDurch() {
  const FX = 120, FW = 400, FH = 44;
  const st = (y, N, art, { bis = N } = {}) => {
    let s = '';
    for (let j = 0; j < N; j++) s += `<rect x="${FX + j * FW / N}" y="${y}" width="${FW / N}" height="${FH}" class="br-st br-${j < bis ? art(j) : 'leer'}"/>`;
    return s + `<rect x="${FX}" y="${y}" width="${FW}" height="${FH}" rx="3" class="br-rand"/>`;
  };
  const ein = [{ opacity: 0 }, { opacity: 1 }];
  const QX = 90, QY = 30, QS = 240;
  const quadrat = (S, R, art) => {
    let q = '';
    for (let c = 0; c < S; c++) for (let r = 0; r < R; r++) q += `<rect x="${QX + c * QS / S}" y="${QY + r * QS / R}" width="${QS / S}" height="${QS / R}" class="br-st br-${art(c, r)}"/>`;
    for (let c = 1; c < S; c++) q += `<line x1="${QX + c * QS / S}" x2="${QX + c * QS / S}" y1="${QY}" y2="${QY + QS}" class="br-linie"/>`;
    for (let r = 1; r < R; r++) q += `<line x1="${QX}" x2="${QX + QS}" y1="${QY + r * QS / R}" y2="${QY + r * QS / R}" class="br-linie"/>`;
    return q + `<rect x="${QX}" y="${QY}" width="${QS}" height="${QS}" rx="3" class="br-rand"/>`;
  };
  const klammer = (y, von, bis, N, txt, kl) => `<g class="${kl}"><rect x="${FX + von * FW / N + 2}" y="${y + 3}" width="${(bis - von) * FW / N - 4}" height="${FH - 6}" rx="8" class="br-mess"/>${textSvg(FX + (von + bis) / 2 * FW / N, y + FH / 2 + 8, txt, 22, 'br-mess-zahl')}</g>`;
  return [
    { text: '{6/7} : 3 heißt: {6/7} gerecht in 3 Teile teilen.', dauer: 5000,
      bild: `${bruchSvg(60, 82, 6, 7, 26, 'ef-a')}${st(60, 7, () => 'a', { bis: 6 })}`,
      anim: [['.br-a', [{ opacity: 0 }, { opacity: 1 }], { duration: 300, stufe: 200 }]] },
    { text: 'Jeder bekommt 2 Stücke: {6/7} : 3 = {2/7}. Hier geht es leicht, weil 6 durch 3 teilbar ist.', dauer: 6200,
      bild: `${st(60, 7, j => ['c', 'd', 'e'][Math.floor(j / 2)], { bis: 6 })}${[0, 1, 2].map(k => `<g class="gr">${textSvg(FX + (2 * k + 1) * FW / 7, 50, `${k + 1}. Teil`, 20, 'ef-leise')}</g>`).join('')}
        <g class="gl">${bruchSvg(200, 200, 6, 7, 34, 'ef-a')}${textSvg(250, 212, ':', 34)}${textSvg(290, 212, '3', 34)}${textSvg(330, 212, '=', 34)}${bruchSvg(380, 200, 2, 7, 34, 'ef-c')}</g>`,
      anim: [['.gr', ein, { duration: 400, stufe: 600 }], ['.gl', ein, { duration: 600, delay: 2200 }]] },
    { text: 'Und {3/4} : 2? 3 Viertel kann man nicht gerecht in 2 Stücke aufteilen. Das Messer schneidet quer: jetzt hat das Quadrat 8 Stücke.', dauer: 8000,
      bild: `${quadrat(4, 2, c => (c < 3 ? 'a' : 'leer'))}<g class="vorher">${quadrat(4, 1, c => (c < 3 ? 'a' : 'leer'))}</g><line x1="${QX}" x2="${QX + QS}" y1="${QY + QS / 2}" y2="${QY + QS / 2}" class="br-schnitt quer ef-q" style="stroke-dasharray:${QS};"/>${bruchSvg(470, 120, 3, 4, 34, 'ef-a')}${textSvg(530, 132, ': 2', 34)}`,
      anim: [['.vorher', [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 3500, delay: 400 }], ['.ef-q', [{ strokeDashoffset: QS }, { strokeDashoffset: 0 }], { duration: 1200, delay: 1500 }]] },
    { text: 'Eine Hälfte vom blauen Teil sind 3 kleine Stücke – von 8 Stücken im Ganzen. Also {3/4} : 2 = {3/8}. Der Nenner wird mal 2 genommen.', dauer: 8200,
      bild: `${quadrat(4, 2, (c, r) => (c < 3 && r === 0 ? 'c' : c < 3 ? 'a' : 'leer'))}<g class="gl">${bruchSvg(420, 110, 3, 4, 32, 'ef-a')}${textSvg(470, 122, ': 2 =', 32, '', 'start')}${bruchSvg(580, 110, 3, '4 · 2', 32, 'ef-c')}${textSvg(500, 230, '= ⅜', 36, 'ef-merke')}</g>`,
      anim: [['.br-c', [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 500, stufe: 300 }], ['.gl', ein, { duration: 600, delay: 2400 }]] },
    { text: 'Jetzt {3/4} : {3/8}. Das heißt: Wie oft passt {3/8} in {3/4}? Erst gleichnamig machen: {3/4} = {6/8}.', dauer: 7600,
      bild: `${bruchSvg(60, 72, 6, 8, 26, 'ef-a')}${st(50, 8, () => 'a', { bis: 6 })}${textSvg(22, 190, ':', 34)}${bruchSvg(60, 182, 3, 8, 26, 'ef-b')}${st(160, 8, () => 'b', { bis: 3 })}${textSvg(FX + FW + 10, 188, 'Messstreifen', 18, 'ef-leise', 'start')}`,
      anim: [['.br-b', ein, { duration: 400, delay: 1500, stufe: 300 }]] },
    { text: 'Wir legen den Messstreifen an: einmal, zweimal – er passt genau 2-mal. Also {3/4} : {3/8} = 2.', dauer: 7000,
      bild: `${st(50, 8, () => 'a', { bis: 6 })}${klammer(50, 0, 3, 8, '1', 'k1')}${klammer(50, 3, 6, 8, '2', 'k2')}${st(160, 8, () => 'b', { bis: 3 })}<g class="gl">${textSvg(320, 285, '3/4 : 3/8 = 2', 34, 'ef-merke')}</g>`,
      anim: [['.k1', [{ transform: 'translate(0px, 110px)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 700 }], ['.k2', [{ transform: 'translate(-150px, 110px)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 2200 }], ['.gl', ein, { duration: 600, delay: 3600 }]] },
    { text: 'Der Trick: Durch einen Bruch teilen heißt mit dem Kehrwert malnehmen. {3/4} · {8/3} = {24/12} = 2. Gleiches Ergebnis!', dauer: 8000,
      bild: `${bruchSvg(110, 140, 3, 4, 38, 'ef-a')}<g class="geteilt">${textSvg(165, 153, ':', 38)}</g><g class="alt">${bruchSvg(215, 140, 3, 8, 38, 'ef-b')}</g><g class="neu">${bruchSvg(215, 140, 8, 3, 38, 'ef-b')}</g><g class="mal">${textSvg(165, 153, '·', 46)}</g>
        <g class="gl">${textSvg(270, 153, '=', 38)}${bruchSvg(330, 140, 24, 12, 38, 'ef-c')}${textSvg(395, 153, '= 2', 38, '', 'start')}</g>${textSvg(215, 70, 'Kehrwert: tauschen!', 22, 'ef-leise kw')}`,
      anim: [['.alt', [{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, transform: 'rotate(180deg)' }], { duration: 2200, delay: 600 }], ['.neu', [{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: 2400, delay: 600 }], ['.kw', ein, { duration: 500, delay: 1200 }],
        ['.mal', [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 2900 }], ['.geteilt', [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 2900 }], ['.gl', ein, { duration: 600, delay: 3600 }]] },
    { text: 'Merke: Bruch durch Zahl – Nenner mal Zahl. Bruch durch Bruch – mit dem Kehrwert malnehmen.', dauer: 7000,
      bild: `${['Bruch : Zahl:', 'Nenner · Zahl', 'Bruch : Bruch:', 'mit dem Kehrwert malnehmen'].map((t, k) => `<g class="regel">${textSvg(70, 70 + k * 62, t, k % 2 ? 28 : 30, k % 2 ? 'ef-merke' : 'ef-leise', 'start')}</g>`).join('')}`,
      anim: [['.regel', [{ transform: 'translate(0px,-20px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, stufe: 1100 }]] },
  ];
}
