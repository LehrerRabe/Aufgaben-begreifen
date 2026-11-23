/* Mathematik: Brüche addieren und subtrahieren (Klasse 6) – zwei Kacheln, ein Baustein.
   Stufe 1 „Gleiche Nenner“: Die Stücke sind gleich groß – Plus: Stücke antippen, sie rutschen zusammen; Minus: Stücke antippen und wegnehmen.
     Danach Ergebnis eintragen (Zähler addieren/subtrahieren, Nenner bleibt), ggf. kürzen und gemischte Zahl.
   Stufe 2 „Verschiedene Nenner“: 1. Stücke passen nicht – gemeinsamen Nenner aus zwei Vielfachen-Reihen antippen,
     2. Messer schneidet jedes Stück fein (Animation), 3. erweiterte Zähler eintragen, 4. wie Stufe 1.
   Schalter „auch über 1“: Ergebnisse (Plus) bzw. Minuend (Minus) größer als 1, mit gemischter Zahl. */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, bruchFeld, zahlenMerken, ggT, kgV, warte } from './geruest.js';
import {
  meldungHtml, streifenSvg, streifenHoehe, stueckPos, schneiden, flug, vielfacheHtml, folgeKette, ketteFertig, ketteHtml, kettePruefen,
  liesBruch, merkeHtml, filmKnopf, ueber1Html, ueber1Lesen, ueber1Setzen, bruchWort, nennerName, zahlHtml, gleich, MESSER,
} from './bruchbild.js';
import { zeigeFilm, bruchSvg, textSvg } from './erklaerfilm.js';

export const starteBruchAddition = root => starteBruchPlus(root, 'plus');
export const starteBruchSubtraktion = root => starteBruchPlus(root, 'minus');

const PAARE = [[2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 4], [3, 6], [3, 9], [4, 6], [4, 8], [3, 5], [2, 10], [5, 10], [3, 12], [4, 12], [6, 8], [4, 10], [6, 9]];
const MAX_N = 24;

/* ---------- Aufgaben ---------- */
export function neueAufgabe(art, stufe, ueber1) {
  for (let v = 0; v < 500; v++) {
    let n1, n2;
    if (stufe === 'gleich') { n1 = n2 = wahl([3, 4, 5, 6, 7, 8, 9, 10, 12]); }
    else { [n1, n2] = wahl(PAARE); if (Math.random() < 0.5) [n1, n2] = [n2, n1]; }
    let a, b;
    if (art === 'plus') {
      a = zufall(1, n1 - 1); b = zufall(1, n2 - 1);
      if (stufe === 'verschieden' && (ggT(a, n1) !== 1 || ggT(b, n2) !== 1)) continue;
      const sz = a * n2 + b * n1, sn = n1 * n2; // Summe (ungekürzt)
      if (ueber1 ? (sz <= sn || sz % sn === 0) : sz >= sn) continue;
      if (stufe === 'gleich' && n1 > 8 && a + b < 3) continue;
    } else {
      a = ueber1 ? zufall(n1 + 1, 2 * n1 - 1) : zufall(2, n1 - 1);
      b = zufall(1, n2 - 1);
      if (stufe === 'verschieden' && (ggT(a, n1) !== 1 || ggT(b, n2) !== 1)) continue;
      const dz = a * n2 - b * n1;
      if (dz <= 0) continue;
      if (ueber1 && stufe === 'gleich' && b <= a - n1) continue; // es soll „über das Ganze“ gehen
    }
    return { n1, a, n2, b };
  }
  return art === 'plus' ? { n1: 8, a: 2, n2: 8, b: 3 } : { n1: 6, a: 5, n2: 6, b: 2 };
}

/* ---------- Geometrie ---------- */
const X = 104, W = 420, H = 50, ABST = 14, ZEILE = 34; // Abstand zwischen den Zeilen
const VB = 640;

/** „Das Messer schneidet jedes Drittel in 2 Teile. Die Sechstel bleiben, wie sie sind.“ */
export function messerText(n1, k1, n2, k2, m) {
  const einzahl = n => (n === 2 ? 'Halbe' : nennerName(n));
  const teil = (n, k) => `jedes ${einzahl(n)} in ${k} Teile`;
  const t = [k1 > 1 ? teil(n1, k1) : '', k2 > 1 ? teil(n2, k2) : ''].filter(Boolean).join(' und ');
  const bleibt = k1 === 1 ? n1 : k2 === 1 ? n2 : 0;
  return `Das Messer schneidet ${t}. ${bleibt ? `Die ${nennerName(bleibt)} bleiben, wie sie sind. ` : ''}Dann sind alle Stücke ${nennerName(m)}.`;
}

export function starteBruchPlus(root, art) {
  const plus = art === 'plus';
  let stufe = 'gleich', ueber1 = ueber1Lesen();
  let auf, N, k1, k2, A, B, phase, eing = {}, bewertung = null, laeuft = false, tippStufe = 0;
  let gelegt, weg, kette, falscherNenner, gewaehlt;

  const g = geruest(root, {
    etikett: 'Brüche',
    titel: plus ? 'Brüche addieren' : 'Brüche subtrahieren',
    reiter: [{ id: 'gleich', titel: 'Gleiche Nenner', unter: plus ? '²⁄₈ + ³⁄₈' : '⁵⁄₆ − ²⁄₆' }, { id: 'verschieden', titel: 'Verschiedene Nenner', unter: 'erst gleichnamig machen' }],
    knoepfe: `${filmKnopf}<button type="button" class="kn-gross kn-tipp" data-bp="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bp="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  const ganzeA = () => Math.max(1, Math.ceil(A / N));
  const ganzeErg = () => Math.max(1, Math.ceil((A + B) / N));

  function neu() {
    auf = neueAufgabe(art, stufe, ueber1);
    root.dataset.aufgabe = JSON.stringify(auf); // für Tests
    k1 = k2 = 1; N = auf.n1; A = auf.a; B = auf.b;
    phase = stufe === 'gleich' ? 'legen' : 'nenner';
    gelegt = []; weg = new Set(); kette = null; falscherNenner = null; gewaehlt = null;
    for (const k of Object.keys(eing)) delete eing[k];
    bewertung = null; tippStufe = 0;
  }

  /* --- Zeilen des Bildes --- */
  function zeilen() {
    const z = [];
    let y = 14;
    const verschieden = phase === 'nenner' || phase === 'schneiden';
    const nA = verschieden ? auf.n1 : N, nB = verschieden ? auf.n2 : N;
    const anzA = verschieden ? auf.a : A, anzB = verschieden ? auf.b : B;
    const gA = Math.max(1, Math.ceil(anzA / nA));
    z.push({ id: 'a', y, N: nA, anz: anzA, ganze: gA, label: [auf.a, auf.n1], zeichen: '' });
    y += streifenHoehe(gA, H, ABST) + ZEILE;
    z.push({ id: 'b', y, N: nB, anz: anzB, ganze: 1, label: [auf.b, auf.n2], zeichen: plus ? '+' : '−' });
    y += H + ZEILE;
    if (plus && !['nenner', 'schneiden', 'erweitert'].includes(phase)) { z.push({ id: 'e', y, N, ganze: ganzeErg(), zeichen: '=' }); y += streifenHoehe(ganzeErg(), H, ABST) + 10; }
    return { z, hoehe: y + 8 };
  }
  const opt = r => ({ x: X, y: r.y, w: W, h: H, N: r.N, ganze: r.ganze, abstand: ABST });

  function bildSvg() {
    const { z, hoehe } = zeilen();
    let s = `<svg class="br-svg" viewBox="0 0 ${VB} ${hoehe}" role="img" aria-label="Bruchstreifen">`;
    const legbar = phase === 'legen';
    for (const r of z) {
      const mitte = r.y + H / 2;
      if (r.zeichen) s += `<text x="20" y="${mitte + 10}" class="br-zeichen">${r.zeichen}</text>`;
      if (r.label) s += bruchSvgKlein(64, mitte, ...(r.id === 'a' && phase !== 'nenner' && phase !== 'schneiden' && N !== auf.n1 ? [A, N] : r.id === 'b' && phase !== 'nenner' && phase !== 'schneiden' && N !== auf.n2 ? [B, N] : r.label), r.id);
      if (r.id === 'a') {
        s += streifenSvg({
          ...opt(r), id: 'a',
          art: i => (i >= r.anz ? 'leer' : plus ? (gelegt.includes(`a${i}`) ? 'geist' : 'a') : (weg.has(i) ? 'weg' : 'a')),
          tipp: i => legbar && i < r.anz && (plus ? !gelegt.includes(`a${i}`) : !weg.has(i)),
        });
      } else if (r.id === 'b') {
        s += streifenSvg({
          ...opt(r), id: 'b',
          art: i => (i >= r.anz ? 'leer' : plus && gelegt.includes(`b${i}`) ? 'geist' : plus ? 'b' : 'b-rand'),
          tipp: i => plus && legbar && i < r.anz && !gelegt.includes(`b${i}`),
        });
        if (!plus) s += `<text x="${X + W + 8}" y="${r.y + H / 2 + 5}" class="br-ganz-text">soll weg</text>`;
      } else {
        s += streifenSvg({ ...opt(r), id: 'e', art: i => (i < gelegt.length ? gelegt[i][0] : 'leer') });
        s += `<text x="${X + W + 8}" y="${r.y + H / 2 + 5}" class="br-ganz-text">${ganzeErg() > 1 ? '' : 'zusammen'}</text>`;
      }
    }
    return s + '</svg>';
  }
  function bruchSvgKlein(x, y, z, n, id) {
    const breit = Math.max(String(z).length, String(n).length) * 13 + 8;
    return `<g class="br-label br-label-${id}"><text x="${x}" y="${y - 5}">${z}</text><line x1="${x - breit / 2}" x2="${x + breit / 2}" y1="${y}" y2="${y}"/><text x="${x}" y="${y + 19}">${n}</text></g>`;
  }

  /* --- Texte --- */
  const aufgabeHtml = () => `${zahlHtml(auf.a, auf.n1, ueber1)} ${plus ? '+' : '−'} ${bruchHtml(auf.b, auf.n2)}`;
  const gleichHtml = () => `${bruchHtml(A, N)} ${plus ? '+' : '−'} ${bruchHtml(B, N)}`;
  const ergebnisWert = () => (plus ? A + B : A - B);

  function schrittZeile(nr, text, fertig) { return `<p class="vz-schritt${fertig ? ' fertig' : ''}">${fertig ? '✓' : nr + '.'} ${text}</p>`; }

  function rechts() {
    const ord = stufe === 'gleich' ? ['legen', 'ergebnis', 'kette', 'fertig'] : ['nenner', 'schneiden', 'erweitert', 'legen', 'ergebnis', 'kette', 'fertig'];
    const pos = ord.indexOf(phase), erl = p => ord.indexOf(p) < pos;
    let h = `<h2 class="bereich-titel">Aufgabe</h2><div class="rr-gross br-aufgabe">${aufgabeHtml()} = ?</div>`;
    let nr = 1;
    if (stufe === 'verschieden') {
      h += schrittZeile(nr++, `Gemeinsamen Nenner finden${erl('nenner') ? `: <b>${gewaehlt ?? N}</b>` : ''}`, erl('nenner'));
      if (phase === 'nenner') h += `<p class="leise">Tippe eine Zahl an, die in <b>beiden</b> Reihen vorkommt.</p>${vielfacheHtml(auf.n1, auf.n2, gewaehlt, falscherNenner)}`;
      if (pos >= ord.indexOf('erweitert')) {
        h += schrittZeile(nr++, 'Gleichnamig machen (erweitern)', erl('erweitert'));
        if (phase === 'erweitert') h += `<p class="leise">Zähle im Bild: Wie viele ${nennerName(N)} sind es jetzt?</p>
          <div class="br-erw-zeile">${zahlHtml(auf.a, auf.n1, ueber1)} = ${bruchFeld('bp-z1', 'bp-n1', { ...eing, 'bp-n1': eing['bp-n1'] ?? String(N) })}</div>
          <div class="br-erw-zeile">${bruchHtml(auf.b, auf.n2)} = ${bruchFeld('bp-z2', 'bp-n2', { ...eing, 'bp-n2': eing['bp-n2'] ?? String(N) })}</div>
          <div class="gs-pruef"><button type="button" class="kn-gross" data-bp="pruefen">✓ Prüfen</button></div>`;
        else if (erl('erweitert')) h += `<p class="br-kette-zeile">${aufgabeHtml()} = ${gleichHtml()}</p>`;
      }
    }
    if (pos >= ord.indexOf('legen')) {
      h += schrittZeile(nr++, plus ? 'Stücke zusammenlegen' : `${B} ${nennerName(N)} wegnehmen`, erl('legen'));
      if (phase === 'legen') h += `<p class="leise">${plus ? 'Tippe die farbigen Stücke an – sie rutschen nach unten zusammen.' : `Tippe ${B} blaue Stücke an, um sie wegzunehmen.`}</p>`;
    }
    if (pos >= ord.indexOf('ergebnis')) {
      h += schrittZeile(nr++, 'Ergebnis als Bruch', erl('ergebnis'));
      if (phase === 'ergebnis') h += `<div class="gs-pruef br-gl">${gleichHtml()} = ${bruchFeld('bp-ez', 'bp-en', eing)}<button type="button" class="kn-gross" data-bp="pruefen">✓ Prüfen</button></div>`;
      else h += `<p class="br-kette-zeile">${gleichHtml()} = ${bruchHtml(kette?.alt.z ?? ergebnisWert(), kette?.alt.n ?? N)}</p>`;
    }
    if (kette && kette.schritte.length) h += ketteHtml(kette, eing, 'bp');
    if (phase === 'fertig') h += `<p class="br-fertig" data-fertig>Fertig! ${aufgabeHtml()} = ${ergebnisEndHtml()}</p>`;
    h += meldungHtml(bewertung, phase === 'fertig');
    h += merkeHtml('Merke', merkeText(), false);
    return h;
  }
  function ergebnisEndHtml() {
    const s = kette?.schritte.at(-1);
    if (!s) return bruchHtml(kette?.alt.z ?? ergebnisWert(), kette?.alt.n ?? N);
    if (s.art === 'ganz') return `<b>${s.wert}</b>`;
    if (s.art === 'gemischt') return zahlHtml(s.g * s.n + s.z, s.n);
    return bruchHtml(s.z, s.n);
  }
  function merkeText() {
    const zeichen = plus ? '+' : '−', wort = plus ? 'addieren' : 'subtrahieren';
    return `<p><b>Gleiche Nenner:</b> Die Stücke sind gleich groß. Nur die Zähler ${wort}, der Nenner bleibt.</p>
      <p class="br-merke-bsp">${bruchHtml(2, 7)} ${zeichen} ${bruchHtml(plus ? 3 : 1, 7)} = ${bruchHtml(`2 ${zeichen} ${plus ? 3 : 1}`, 7)} = ${bruchHtml(plus ? 5 : 1, 7)}</p>
      <p><b>Verschiedene Nenner:</b> Erst gleichnamig machen: einen gemeinsamen Nenner suchen (am besten den kleinsten = Hauptnenner) und beide Brüche erweitern. Dann wie oben.</p>
      <p class="br-merke-bsp">${bruchHtml(1, 2)} ${zeichen} ${bruchHtml(1, 3)} = ${bruchHtml(3, 6)} ${zeichen} ${bruchHtml(2, 6)} = ${bruchHtml(plus ? 5 : 1, 6)}</p>
      <p>Zum Schluss: <b>kürzen</b>, wenn es geht${ueber1 ? ', und als gemischte Zahl schreiben' : ''}.</p>
      <p class="leise">Achtung: Nenner werden <b>nie</b> ${plus ? 'addiert' : 'subtrahiert'} – die Stücke werden dadurch nicht ${plus ? 'kleiner' : 'größer'}.</p>`;
  }

  function links() {
    let h = ueber1Html(ueber1, plus ? 'Ergebnis größer als 1' : 'Start mit mehr als 1 Ganzem');
    h += `<div class="br-bild">${bildSvg()}</div>`;
    h += `<div class="br-unter">`;
    if (phase === 'nenner') h += `<p class="br-hinweis">Die Stücke sind <b>verschieden groß</b> (${nennerName(auf.n1)} und ${nennerName(auf.n2)}). So kann man nicht einfach zählen.</p>`;
    if (phase === 'legen') {
      const ziel = plus ? A + B : B, getan = plus ? gelegt.length : weg.size;
      h += `<p class="br-zaehler">${plus ? `Zusammengelegt: <b>${getan}</b> von ${ziel} Stücken` : `Weggenommen: <b>${getan}</b> von ${ziel}`}</p>`;
      if (getan >= 2 && getan < ziel) h += `<button type="button" class="kn-gross kn-leise" data-bp="rest">⏩ ${plus ? 'Rest zusammenlegen' : 'Rest wegnehmen'}</button>`;
    }
    if (phase === 'ergebnis') h += `<p class="br-zaehler">${plus ? 'Zähle alle Stücke im unteren Streifen.' : 'Zähle die blauen Stücke, die übrig sind.'}</p>`;
    else if (pos('kette') && !plus) h += `<p class="br-zaehler">Übrig: <b>${A - B}</b> ${nennerName(N)}</p>`;
    else if (pos('kette') && plus) h += `<p class="br-zaehler">Zusammen: <b>${A + B}</b> ${nennerName(N)}</p>`;
    return h + '</div>';
  }
  const pos = p => { const ord = ['nenner', 'schneiden', 'erweitert', 'legen', 'ergebnis', 'kette', 'fertig']; return ord.indexOf(phase) >= ord.indexOf(p); };

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); g.reiter(stufe); }

  /* --- Ablauf --- */
  async function nennerGewaehlt(m) {
    if (laeuft) return;
    const inA = m % auf.n1 === 0, inB = m % auf.n2 === 0;
    if (!(inA && inB)) {
      falscherNenner = m; gewaehlt = null;
      bewertung = { ok: false, text: `${m} steht nicht in der Reihe von ${inA ? auf.n2 : auf.n1}. Suche eine Zahl, die in <b>beiden</b> Reihen vorkommt.` };
      zeichne(); return;
    }
    if (m > MAX_N) { falscherNenner = m; bewertung = { ok: false, text: `${m} geht – aber die Stücke würden winzig. Nimm einen kleineren gemeinsamen Nenner.` }; zeichne(); return; }
    gewaehlt = m; falscherNenner = null;
    const kv = kgV(auf.n1, auf.n2);
    bewertung = { ok: true, text: m === kv ? `${m} ist der kleinste gemeinsame Nenner (Hauptnenner).` : `${m} geht! Der kleinste gemeinsame Nenner wäre ${kv}.` };
    phase = 'schneiden'; laeuft = true; zeichne();
    k1 = m / auf.n1; k2 = m / auf.n2;
    g.sprich(messerText(auf.n1, k1, auf.n2, k2, m));
    await warte(500);
    const svg = root.querySelector('.br-svg');
    const { z } = zeilen();
    if (k1 > 1) await schneiden(svg, opt(z[0]), k1);
    if (k2 > 1) await schneiden(svg, opt(z[1]), k2);
    await warte(300);
    if (!root.isConnected || phase !== 'schneiden') { laeuft = false; return; }
    N = m; A = auf.a * k1; B = auf.b * k2;
    phase = 'erweitert'; laeuft = false; bewertung = null; tippStufe = 0;
    zeichne();
    g.sprich(`Jetzt sind alle Stücke ${nennerName(N)}. Zähle und trage die neuen Zähler ein.`);
    root.querySelector('#bp-z1')?.focus({ preventScroll: true });
  }

  function pruefeErweitert() {
    const e1 = liesBruch(eing, 'bp-z1', 'bp-n1') ?? (eing['bp-z1'] ? { z: +eing['bp-z1'], n: N } : null);
    const e2 = liesBruch(eing, 'bp-z2', 'bp-n2') ?? (eing['bp-z2'] ? { z: +eing['bp-z2'], n: N } : null);
    if (!e1 || !e2) { bewertung = { ok: false, text: 'Trage beide neuen Zähler ein.' }; return zeichne(); }
    if (e1.n !== N || e2.n !== N) { bewertung = { ok: false, text: `Beide Brüche sollen den Nenner ${N} bekommen.` }; return zeichne(); }
    const f = [];
    if (e1.z !== A) f.push(`Erster Bruch: ${e1.z === auf.a ? `Den Zähler auch mal ${k1} nehmen!` : `Zähle die blauen Stücke – oder rechne ${auf.a} · ${k1}.`}`);
    if (e2.z !== B) f.push(`Zweiter Bruch: ${e2.z === auf.b ? `Den Zähler auch mal ${k2} nehmen!` : `Zähle die orangen Stücke – oder rechne ${auf.b} · ${k2}.`}`);
    if (f.length) { bewertung = { ok: false, text: f.join('<br>') }; return zeichne(); }
    bewertung = { ok: true, text: `Gleichnamig: ${gleichHtml()}` };
    phase = 'legen'; tippStufe = 0; zeichne();
    g.sprich(plus ? 'Jetzt sind alle Stücke gleich groß. Lege sie zusammen!' : `Jetzt sind alle Stücke gleich groß. Nimm ${bruchWort(B, N)} weg!`);
  }

  async function stueckTippen(sid, i) {
    if (phase !== 'legen') return;
    if (plus) {
      const key = `${sid}${i}`;
      if (gelegt.includes(key)) return;
      const { z } = zeilen();
      const quelle = stueckPos(opt(sid === 'a' ? z[0] : z[1]), i);
      gelegt.push(key);
      const ziel = stueckPos(opt(z[2]), gelegt.length - 1);
      bewertung = null;
      zeichne();
      const el = root.querySelector(`.br-streifen[data-sid="e"] [data-i="${gelegt.length - 1}"]`);
      const fertigNach = gelegt.length === A + B, meine = auf;
      await flug(el, quelle.x - ziel.x, quelle.y - ziel.y, 420);
      if (fertigNach && phase === 'legen' && auf === meine) legenFertig();
    } else {
      if (sid !== 'a' || weg.has(i) || i >= A) return;
      weg.add(i);
      zeichne();
      const el = root.querySelector(`.br-streifen[data-sid="a"] [data-i="${i}"]`);
      if (el) el.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0.2, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 420 });
      if (weg.size === B) { const meine = auf; await warte(300); if (phase === 'legen' && auf === meine) legenFertig(); }
    }
  }
  async function restLegen() {
    if (phase !== 'legen') return;
    if (plus) {
      if (gelegt.length >= A + B) return;
      const meine = auf;
      const { z } = zeilen();
      const offen = [];
      for (let i = 0; i < A; i++) if (!gelegt.includes(`a${i}`)) offen.push(['a', i]);
      for (let i = 0; i < B; i++) if (!gelegt.includes(`b${i}`)) offen.push(['b', i]);
      const starts = offen.map(([s, i]) => ({ key: s + i, p: stueckPos(opt(s === 'a' ? z[0] : z[1]), i) }));
      const vorher = gelegt.length;
      starts.forEach(s => gelegt.push(s.key));
      zeichne();
      const fluege = starts.map((s, k) => {
        const idx = vorher + k, ziel = stueckPos(opt(zeilen().z[2]), idx);
        return warte(k * 50).then(() => flug(root.querySelector(`.br-streifen[data-sid="e"] [data-i="${idx}"]`), s.p.x - ziel.x, s.p.y - ziel.y, 480));
      });
      await Promise.all(fluege);
      if (phase === 'legen' && auf === meine) legenFertig();
    } else {
      for (let i = A - 1; i >= 0 && weg.size < B; i--) weg.add(i);
      zeichne();
      const meine = auf;
      await warte(250);
      if (phase === 'legen' && auf === meine) legenFertig();
    }
  }
  function legenFertig() {
    phase = 'ergebnis'; tippStufe = 0; bewertung = null;
    zeichne();
    g.sprich(plus ? `Alle Stücke liegen zusammen. Wie viele ${nennerName(N)} sind es? Trage das Ergebnis ein.` : `Weggenommen! Wie viele ${nennerName(N)} bleiben übrig? Trage das Ergebnis ein.`);
    root.querySelector('#bp-ez')?.focus({ preventScroll: true });
  }

  function pruefeErgebnis() {
    const e = liesBruch(eing, 'bp-ez', 'bp-en');
    if (!e || !e.n) { bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' }; return zeichne(); }
    const soll = ergebnisWert();
    if (gleich(e.z, e.n, soll, N)) {
      kette = folgeKette(e.z, e.n, ueber1);
      bewertung = { ok: true, text: e.n === N ? `Richtig: ${bruchHtml(e.z, e.n)}` : `Richtig – sogar schon umgeformt: ${bruchHtml(e.z, e.n)}` };
      phase = ketteFertig(kette) ? 'fertig' : 'kette';
      zeichne();
      if (phase === 'fertig') g.sprich('Super gerechnet!', 'fertig');
      else g.sprich(kette.schritte[0].art === 'kuerzen' ? 'Richtig! Kann man das Ergebnis noch kürzen?' : kette.schritte[0].art === 'ganz' ? 'Richtig! Das ist sogar eine ganze Zahl.' : 'Richtig! Das ist mehr als ein Ganzes – schreibe es als gemischte Zahl.');
      return;
    }
    if (plus && e.z === A + B && (e.n === 2 * N || e.n === auf.n1 + auf.n2)) bewertung = { ok: false, text: 'Der Nenner wird nicht addiert! Die Stücke bleiben gleich groß – es sind nur mehr Stücke. Der Nenner bleibt.' };
    else if (!plus && e.z === A - B && e.n === 0) bewertung = { ok: false, text: 'Der Nenner wird nicht subtrahiert! Die Stücke bleiben gleich groß. Der Nenner bleibt.' };
    else if (e.n !== N) bewertung = { ok: false, text: `Die Stücke im Bild sind ${nennerName(N)}. Der Nenner ist also ${N}.` };
    else bewertung = { ok: false, text: plus ? `Zähle alle Stücke im unteren Streifen – oder rechne ${A} + ${B}.` : `Zähle die blauen Stücke, die übrig sind – oder rechne ${A} − ${B}.` };
    zeichne();
  }

  function pruefeKette() {
    bewertung = kettePruefen(kette, eing, 'bp');
    if (ketteFertig(kette)) { phase = 'fertig'; g.sprich('Super gerechnet!', 'fertig'); }
    zeichne();
  }

  /* --- Tipps (gestuft) --- */
  function tipp() {
    tippStufe++;
    const t = {
      nenner: [`Schreibe im Kopf die Einmaleins-Reihen von ${auf.n1} und ${auf.n2} auf. Welche Zahl kommt in beiden vor?`, `Probiere ${kgV(auf.n1, auf.n2)}: Steht die Zahl in beiden Reihen?`],
      erweitert: [`Jedes Stück wurde zerschnitten. Zähle die gefärbten Stücke im Bild.`, `Erweitern: ${bruchHtml(auf.a, auf.n1)} = ${bruchHtml(`${auf.a} · ${k1}`, `${auf.n1} · ${k1}`)}, ${bruchHtml(auf.b, auf.n2)} = ${bruchHtml(`${auf.b} · ${k2}`, `${auf.n2} · ${k2}`)}`],
      legen: [plus ? 'Tippe ein blaues oder oranges Stück an.' : 'Tippe auf ein blaues Stück, um es wegzunehmen.'],
      ergebnis: [`Die Stücke sind ${nennerName(N)} – der Nenner bleibt ${N}.`, plus ? `Zähler: ${A} + ${B} = ?` : `Zähler: ${A} − ${B} = ?`],
      kette: [kette?.schritte[kette.i]?.art === 'gemischt' ? `Wie oft passt ${kette.schritte[kette.i].n} ganz in den Zähler? Das sind die Ganzen. Der Rest bleibt als Bruch.` : 'Suche eine Zahl, durch die Zähler und Nenner beide teilbar sind (2, 3, 5, …).'],
    }[phase];
    if (!t) return g.sprich('Fertig! Mit „Neue Aufgabe“ geht es weiter.', 'tipp');
    g.sprich(t[Math.min(tippStufe, t.length) - 1], 'tipp');
  }

  function start() {
    if (stufe === 'gleich') g.sprich(plus ? 'Die Stücke sind gleich groß. Lege sie zusammen und zähle!' : 'Die Stücke sind gleich groß. Nimm Stücke weg und zähle, was übrig bleibt.');
    else g.sprich('Die Stücke sind verschieden groß. Zuerst brauchst du einen gemeinsamen Nenner.');
  }

  root.addEventListener('click', e => {
    const st = e.target.closest('[data-stueck]');
    if (st) return stueckTippen(st.dataset.sid, +st.dataset.stueck);
    const vf = e.target.closest('[data-vf]');
    if (vf && phase === 'nenner') return nennerGewaehlt(+vf.dataset.vf);
    const r = e.target.closest('[data-reiter]');
    if (r && !laeuft) { stufe = r.dataset.reiter; neu(); zeichne(); start(); return; }
    const u = e.target.closest('[data-ueber1]');
    if (u && !laeuft) { ueber1 = u.dataset.ueber1 === '1'; ueber1Setzen(ueber1); neu(); zeichne(); start(); return; }
    if (e.target.closest('[data-film]')) return zeigeFilm(plus ? 'Brüche addieren' : 'Brüche subtrahieren', plus ? filmPlus() : filmMinus());
    if (e.target.closest('[data-kette="pruefen"]')) return pruefeKette();
    const b = e.target.closest('[data-bp]');
    if (!b) return;
    const a = b.dataset.bp;
    if (a === 'neu' && !laeuft) { neu(); zeichne(); start(); }
    if (a === 'tipp') tipp();
    if (a === 'rest') restLegen();
    if (a === 'pruefen') { if (phase === 'erweitert') pruefeErweitert(); else if (phase === 'ergebnis') pruefeErgebnis(); }
  });
  root.addEventListener('keydown', e => {
    const st = e.target.closest?.('[data-stueck]');
    if (st && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); stueckTippen(st.dataset.sid, +st.dataset.stueck); }
  });

  neu(); zeichne(); start();
}

/* ====================== Erklärfilme ====================== */
const FX = 120, FW = 400, FH = 46;
function fStreifen(y, N, farbe, { x = FX, w = FW, h = FH, klasse = '', bis = N } = {}) {
  let s = `<g class="${klasse}">`;
  for (let j = 0; j < N; j++) s += `<rect x="${x + j * w / N}" y="${y}" width="${w / N}" height="${h}" class="br-st br-${j < bis ? farbe(j) : 'leer'}"/>`;
  return s + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="br-rand"/></g>`;
}
const fTeil = (y, N, j, klasse, art, { x = FX, w = FW, h = FH } = {}) => `<rect x="${x + j * w / N}" y="${y}" width="${w / N}" height="${h}" class="br-st br-${art} ${klasse}"/>`;
function fSchnitte(y, N, k, klasse = 'ef-schnitt', { x = FX, w = FW, h = FH } = {}) {
  let s = '';
  for (let j = 0; j < N; j++) for (let t = 1; t < k; t++) { const lx = x + (j + t / k) * w / N; s += `<line x1="${lx}" x2="${lx}" y1="${y}" y2="${y + h}" class="br-schnitt ${klasse}" style="stroke-dasharray:${h};"/>`; }
  return s;
}
const fMesser = (x, y) => `<g class="ef-messer" transform="translate(${x} ${y})"><g class="ef-messer-innen">${MESSER}</g></g>`;
const fVielfache = (y, n, bis, mark) => {
  let s = textSvg(60, y + 8, `${n}er:`, 22, 'ef-leise', 'start');
  for (let m = n, k = 0; m <= bis; m += n, k++) s += `<g class="${m === mark ? 'ef-mark' : ''}"><circle cx="${150 + k * 62}" cy="${y}" r="22" class="ef-kreis"/>${textSvg(150 + k * 62, y + 8, String(m), 22)}</g>`;
  return s;
};
const ein = [{ opacity: 0 }, { opacity: 1 }];
const runter = d => [{ transform: `translate(0px, ${-d}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }];
const zeichnen = h => [{ strokeDashoffset: h }, { strokeDashoffset: 0 }];
const pop = [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }];
const blau = () => 'a', orange = () => 'b';

function filmPlus() {
  const y1 = 40, y2 = 140;
  const s8 = (y, bis) => fStreifen(y, 8, blau, { bis });
  return [
    { text: 'Wir rechnen {2/8} + {3/8}. Beide Streifen sind in Achtel geteilt.', dauer: 5200,
      bild: `<g class="e1">${bruchSvg(60, y1 + 22, 2, 8, 26, 'ef-a')}${s8(y1, 2)}</g><g class="e2">${textSvg(22, y2 + 32, '+', 34)}${bruchSvg(60, y2 + 22, 3, 8, 26, 'ef-b')}${fStreifen(y2, 8, orange, { bis: 3 })}</g>`,
      anim: [['.e1', ein, { duration: 700 }], ['.e2', ein, { duration: 700, delay: 900 }]] },
    { text: 'Die Stücke sind gleich groß. Die 3 orangen Stücke rutschen zu den 2 blauen.', dauer: 5200,
      bild: `${bruchSvg(60, y1 + 22, 2, 8, 26, 'ef-a')}${s8(y1, 2)}${[2, 3, 4].map(j => fTeil(y1, 8, j, 'flieg', 'b')).join('')}${textSvg(22, y2 + 32, '+', 34)}${fStreifen(y2, 8, () => 'geist', { bis: 3 })}`,
      anim: [['.flieg', [{ transform: `translate(${-2 * 50}px, ${y2 - y1}px)` }, { transform: 'none' }], { duration: 900, delay: 600, stufe: 350 }]] },
    { text: 'Jetzt zählen wir die Stücke: 2 + 3 = 5 Achtel.', dauer: 5200,
      bild: `${fStreifen(y1, 8, j => (j < 2 ? 'a' : 'b'), { bis: 5 })}${[0, 1, 2, 3, 4].map(j => `<g class="zahl">${textSvg(FX + j * 50 + 25, y1 - 8, String(j + 1), 24, 'ef-zahl')}</g>`).join('')}
        <g class="gl">${bruchSvg(170, 210, 2, 8, 34, 'ef-a')}${textSvg(222, 222, '+', 34)}${bruchSvg(274, 210, 3, 8, 34, 'ef-b')}${textSvg(326, 222, '=', 34)}${bruchSvg(378, 210, 5, 8, 34, 'ef-c')}</g>`,
      anim: [['.zahl', pop, { duration: 450, stufe: 450 }], ['.gl', ein, { duration: 600, delay: 2400 }]] },
    { text: 'Merke: Bei gleichen Nennern addierst du nur die Zähler. Der Nenner bleibt – die Stücke werden ja nicht kleiner!', dauer: 6500,
      bild: `${bruchSvg(150, 120, '2 + 3', 8, 40, 'ef-c')}${textSvg(240, 135, '=', 40)}${bruchSvg(310, 120, 5, 8, 40, 'ef-c')}<g class="kreuz">${textSvg(470, 105, '8 + 8 ?', 30, 'ef-falsch')}<line x1="420" y1="96" x2="520" y2="96" class="ef-durch"/></g>${textSvg(320, 240, 'Zähler + Zähler, Nenner bleibt', 28, 'ef-merke')}`,
      anim: [['.kreuz', ein, { duration: 500, delay: 1800 }], ['.ef-merke', ein, { duration: 600, delay: 3000 }]] },
    { text: 'Und {1/2} + {1/3}? Die Stücke sind verschieden groß – das Drittel passt nicht in das Halbe-Raster.', dauer: 6200,
      bild: `${bruchSvg(60, y1 + 22, 1, 2, 26, 'ef-a')}${fStreifen(y1, 2, blau, { bis: 1 })}${textSvg(22, y2 + 32, '+', 34)}${bruchSvg(60, y2 + 22, 1, 3, 26, 'ef-b')}${fStreifen(y2, 3, orange, { bis: 1 })}
        ${fTeil(y1, 3, 0, 'wackel', 'b', { x: FX + 200 })}${textSvg(FX + 340, y1 + 32, '?', 36, 'ef-falsch frage')}`,
      anim: [['.wackel', [{ transform: `translate(-200px, ${y2 - y1}px)` }, { transform: 'translate(0px,0px)', offset: 0.55 }, { transform: 'translate(8px,0px)', offset: 0.7 }, { transform: 'translate(-8px,0px)', offset: 0.85 }, { transform: 'translate(0px,0px)' }], { duration: 2200, delay: 800 }], ['.frage', pop, { duration: 500, delay: 3000 }]] },
    { text: 'Wir suchen einen gemeinsamen Nenner: eine Zahl, die in der 2er- und in der 3er-Reihe vorkommt. Die 6!', dauer: 6200,
      bild: `${fVielfache(90, 2, 12, 6)}${fVielfache(190, 3, 12, 6)}<line x1="274" y1="112" x2="212" y2="168" class="ef-verbind" style="stroke-dasharray:90"/>`,
      anim: [['.ef-mark', pop, { duration: 600, delay: 2200, stufe: 300 }], ['.ef-verbind', [{ strokeDashoffset: 90 }, { strokeDashoffset: 0 }], { duration: 600, delay: 3000 }]] },
    { text: 'Das Messer schneidet: Jedes Halbe in 3 Teile, jedes Drittel in 2 Teile. Jetzt sind beides Sechstel: {1/2} = {3/6} und {1/3} = {2/6}.', dauer: 8200,
      bild: `${fStreifen(y1, 2, blau, { bis: 1 })}${fSchnitte(y1, 2, 3, 's1')}${textSvg(22, y2 + 32, '+', 34)}${fStreifen(y2, 3, orange, { bis: 1 })}${fSchnitte(y2, 3, 2, 's2')}
        <g class="m1">${fMesser(0, 0)}</g><g class="l1">${bruchSvg(60, y1 + 22, 3, 6, 26, 'ef-a')}</g><g class="l2">${bruchSvg(60, y2 + 22, 2, 6, 26, 'ef-b')}</g>`,
      anim: [['.s1', zeichnen(FH), { duration: 500, delay: 600, stufe: 500 }], ['.s2', zeichnen(FH), { duration: 500, delay: 2800, stufe: 500 }],
        ['.m1', [{ transform: `translate(${FX + 67}px, ${y1}px)` }, { transform: `translate(${FX + 333}px, ${y1}px)`, offset: 0.4 }, { transform: `translate(${FX + 200}px, ${y2}px)`, offset: 0.55 }, { transform: `translate(${FX + 333}px, ${y2}px)`, offset: 0.85 }, { transform: `translate(${FX + 450}px, ${y2 - 40}px)`, opacity: 0 }], { duration: 4200, delay: 400 }],
        ['.l1', ein, { duration: 500, delay: 2300 }], ['.l2', ein, { duration: 500, delay: 4600 }]] },
    { text: 'Jetzt geht es wie vorher: {3/6} + {2/6} = {5/6}.', dauer: 5600,
      bild: `${bruchSvg(60, y1 + 22, 3, 6, 26, 'ef-a')}${fStreifen(y1, 6, blau, { bis: 3 })}${[3, 4].map(j => fTeil(y1, 6, j, 'flieg', 'b')).join('')}${textSvg(22, y2 + 32, '+', 34)}${fStreifen(y2, 6, () => 'geist', { bis: 2 })}
        <g class="gl">${bruchSvg(200, 250, 3, 6, 32, 'ef-a')}${textSvg(250, 261, '+', 32)}${bruchSvg(300, 250, 2, 6, 32, 'ef-b')}${textSvg(350, 261, '=', 32)}${bruchSvg(400, 250, 5, 6, 32, 'ef-c')}</g>`,
      anim: [['.flieg', [{ transform: `translate(${-3 * 400 / 6}px, ${y2 - y1}px)` }, { transform: 'none' }], { duration: 900, delay: 500, stufe: 350 }], ['.gl', ein, { duration: 600, delay: 2200 }]] },
    { text: 'Merke: 1. Gleichnamig machen. 2. Zähler addieren, Nenner bleibt. 3. Kürzen, wenn es geht.', dauer: 6500,
      bild: `${['1. gleichnamig machen', '2. Zähler addieren, Nenner bleibt', '3. kürzen, wenn es geht'].map((t, k) => `<g class="regel">${textSvg(80, 90 + k * 70, t, 30, 'ef-merke', 'start')}</g>`).join('')}`,
      anim: [['.regel', runter(20), { duration: 600, stufe: 1300 }]] },
  ];
}

function filmMinus() {
  const y1 = 50, y2 = 160;
  return [
    { text: 'Wir rechnen {5/6} − {2/6}. Wir haben 5 Sechstel.', dauer: 5000,
      bild: `${bruchSvg(60, y1 + 22, 5, 6, 26, 'ef-a')}${fStreifen(y1, 6, blau, { bis: 5 })}`,
      anim: [['.br-a', pop, { duration: 400, stufe: 250 }]] },
    { text: 'Davon nehmen wir 2 Stücke weg.', dauer: 4600,
      bild: `${bruchSvg(60, y1 + 22, 5, 6, 26, 'ef-a')}${fStreifen(y1, 6, j => (j < 3 ? 'a' : 'weg'), { bis: 5 })}${[3, 4].map(j => fTeil(y1, 6, j, 'raus', 'a')).join('')}`,
      anim: [['.raus', [{ transform: 'none', opacity: 1 }, { transform: 'translate(40px, 150px) rotate(10deg)', opacity: 0 }], { duration: 1100, delay: 700, stufe: 500 }]] },
    { text: 'Es bleiben 3 Sechstel übrig: {5/6} − {2/6} = {3/6}. Der Nenner bleibt, denn die Stücke sind gleich groß.', dauer: 6600,
      bild: `${fStreifen(y1, 6, j => (j < 3 ? 'a' : 'weg'), { bis: 5 })}${[0, 1, 2].map(j => `<g class="zahl">${textSvg(FX + j * 400 / 6 + 33, y1 - 8, String(j + 1), 24, 'ef-zahl')}</g>`).join('')}
        <g class="gl">${bruchSvg(200, 210, 5, 6, 34, 'ef-a')}${textSvg(252, 222, '−', 34)}${bruchSvg(304, 210, 2, 6, 34, 'ef-b')}${textSvg(356, 222, '=', 34)}${bruchSvg(408, 210, 3, 6, 34, 'ef-c')}</g>`,
      anim: [['.zahl', pop, { duration: 450, stufe: 450 }], ['.gl', ein, { duration: 600, delay: 1800 }]] },
    { text: 'Kürzen: {3/6} ist so viel wie {1/2} – das sieht man am Streifen.', dauer: 5200,
      bild: `${bruchSvg(60, y1 + 22, 3, 6, 26, 'ef-a')}${fStreifen(y1, 6, blau, { bis: 3 })}<g class="k">${bruchSvg(60, y2 + 22, 1, 2, 26, 'ef-a')}${fStreifen(y2, 2, blau, { bis: 1 })}</g><line x1="${FX + 200}" x2="${FX + 200}" y1="${y1 - 10}" y2="${y2 + FH + 10}" class="ef-hilfslinie"/>`,
      anim: [['.k', runter(30), { duration: 700, delay: 900 }], ['.ef-hilfslinie', ein, { duration: 500, delay: 2000 }]] },
    { text: 'Bei {3/4} − {1/3} sind die Stücke verschieden groß. Gemeinsamer Nenner: 12 – die steht in der 4er- und in der 3er-Reihe.', dauer: 7600,
      bild: `${fVielfache(90, 4, 12, 12)}${fVielfache(190, 3, 12, 12)}<line x1="274" y1="112" x2="336" y2="168" class="ef-verbind" style="stroke-dasharray:90"/>`,
      anim: [['.ef-mark', pop, { duration: 600, delay: 3000, stufe: 300 }], ['.ef-verbind', [{ strokeDashoffset: 90 }, { strokeDashoffset: 0 }], { duration: 600, delay: 3800 }]] },
    { text: 'Das Messer macht Zwölftel: jedes Viertel in 3 Teile, jedes Drittel in 4 Teile. So wird {3/4} zu {9/12} und {1/3} zu {4/12}.', dauer: 8400,
      bild: `${fStreifen(y1, 4, blau, { bis: 3 })}${fSchnitte(y1, 4, 3, 's1')}${textSvg(22, y2 + 32, '−', 34)}${fStreifen(y2, 3, () => 'b-rand', { bis: 1 })}${fSchnitte(y2, 3, 4, 's2')}
        <g class="l1">${bruchSvg(60, y1 + 22, 9, 12, 24, 'ef-a')}</g><g class="l2">${bruchSvg(60, y2 + 22, 4, 12, 24, 'ef-b')}</g>`,
      anim: [['.s1', zeichnen(FH), { duration: 300, delay: 500, stufe: 220 }], ['.s2', zeichnen(FH), { duration: 300, delay: 3000, stufe: 200 }], ['.l1', ein, { duration: 500, delay: 2600 }], ['.l2', ein, { duration: 500, delay: 5600 }]] },
    { text: 'Jetzt nehmen wir 4 Zwölftel weg. Es bleiben {9/12} − {4/12} = {5/12}.', dauer: 6600,
      bild: `${fStreifen(y1, 12, j => (j < 5 ? 'a' : 'weg'), { bis: 9 })}${[5, 6, 7, 8].map(j => fTeil(y1, 12, j, 'raus', 'a')).join('')}
        <g class="gl">${bruchSvg(200, 210, 9, 12, 32, 'ef-a')}${textSvg(254, 221, '−', 32)}${bruchSvg(308, 210, 4, 12, 32, 'ef-b')}${textSvg(362, 221, '=', 32)}${bruchSvg(416, 210, 5, 12, 32, 'ef-c')}</g>`,
      anim: [['.raus', [{ transform: 'none', opacity: 1 }, { transform: 'translate(30px, 140px)', opacity: 0 }], { duration: 900, delay: 500, stufe: 300 }], ['.gl', ein, { duration: 600, delay: 2600 }]] },
    { text: 'Merke: 1. Gleichnamig machen. 2. Zähler subtrahieren, Nenner bleibt. 3. Kürzen, wenn es geht.', dauer: 6500,
      bild: `${['1. gleichnamig machen', '2. Zähler subtrahieren, Nenner bleibt', '3. kürzen, wenn es geht'].map((t, k) => `<g class="regel">${textSvg(80, 90 + k * 70, t, 30, 'ef-merke', 'start')}</g>`).join('')}`,
      anim: [['.regel', runter(20), { duration: 600, stufe: 1300 }]] },
  ];
}
