/* Mathematik: Prozentrechnung mit dem Formeldreieck.
   Dreieck: oben W (Prozentwert), unten links G (Grundwert), unten rechts p % (Prozentsatz).
   1. Im Dreieck antippen, was gesucht ist → das Feld wird abgedeckt.
   2. Kleine Animation: Die übrigen Teile des Dreiecks wandern in die Formel
      (nebeneinander = mal, übereinander = geteilt).
   3. Werte aus der Aufgabe in die Formel einsetzen.  4. Ausrechnen.
   Vier Aufgabentypen (Reiter): Prozentwert, Grundwert, Prozentsatz berechnen und „Was ist gesucht?“ (gemischt,
   ohne Hinweis auf die gesuchte Größe). */

import { geruest, zufall, wahl, antwortHtml, zahlenMerken, bewegung, ESC } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const NAME = { W: 'Prozentwert', G: 'Grundwert', p: 'Prozentsatz' };
const ZEICHEN = { W: 'W', G: 'G', p: 'p %' };

/* Sachsituationen: G-Bereich (min, max, Schritt), sinnvolle Prozentsätze, Texte je gesuchter Größe */
const KONTEXTE = [
  { e: '€', G: [20, 240, 5], p: [10, 15, 20, 25, 30, 40, 50],
    W: (G, p) => `Eine Jacke kostet ${G} €. Im Schlussverkauf gibt es ${p} % Rabatt. Wie viel Euro spart man?`,
    Gt: (W, p) => `Im Schlussverkauf spart man bei einer Jacke ${W} €. Das sind ${p} % Rabatt. Wie viel hat die Jacke vorher gekostet?`,
    pt: (G, W) => `Eine Jacke hat ${G} € gekostet. Im Schlussverkauf spart man ${W} €. Wie viel Prozent Rabatt sind das?` },
  { e: 'Kinder', G: [20, 32, 1], p: [10, 20, 25, 40, 50, 60, 75, 80],
    W: (G, p) => `In der Klasse 6b sind ${G} Kinder. ${p} % von ihnen kommen mit dem Fahrrad. Wie viele Kinder sind das?`,
    Gt: (W, p) => `In der Klasse 6b kommen ${W} Kinder mit dem Fahrrad. Das sind ${p} % der Klasse. Wie viele Kinder sind in der Klasse?`,
    pt: (G, W) => `In der Klasse 6b sind ${G} Kinder. ${W} von ihnen kommen mit dem Fahrrad. Wie viel Prozent sind das?` },
  { e: 'Personen', G: [200, 1000, 50], p: [5, 10, 12, 15, 20, 30, 35, 40, 45, 60],
    W: (G, p) => `Bei einer Umfrage wurden ${G} Personen befragt. ${p} % essen am liebsten Pizza. Wie viele Personen sind das?`,
    Gt: (W, p) => `Bei einer Umfrage essen ${W} Personen am liebsten Pizza. Das sind ${p} % aller Befragten. Wie viele Personen wurden befragt?`,
    pt: (G, W) => `Bei einer Umfrage wurden ${G} Personen befragt. ${W} essen am liebsten Pizza. Wie viel Prozent sind das?` },
  { e: 'ml', G: [200, 1500, 50], p: [10, 20, 25, 30, 40, 50, 60],
    W: (G, p) => `Eine Flasche Saftschorle enthält ${G} ml. ${p} % davon sind Apfelsaft. Wie viele ml Apfelsaft sind das?`,
    Gt: (W, p) => `In einer Flasche Saftschorle sind ${W} ml Apfelsaft. Das sind ${p} % des Inhalts. Wie viele ml passen in die Flasche?`,
    pt: (G, W) => `Eine Flasche Saftschorle enthält ${G} ml, davon sind ${W} ml Apfelsaft. Wie viel Prozent sind das?` },
  { e: 'km', G: [8, 60, 2], p: [10, 20, 25, 40, 50, 75],
    W: (G, p) => `Eine Wanderung ist ${G} km lang. ${p} % der Strecke sind schon geschafft. Wie viele Kilometer sind das?`,
    Gt: (W, p) => `Bei einer Wanderung sind ${W} km geschafft. Das sind ${p} % der Strecke. Wie lang ist die ganze Wanderung?`,
    pt: (G, W) => `Eine Wanderung ist ${G} km lang. ${W} km sind schon geschafft. Wie viel Prozent der Strecke sind das?` },
  { e: '€', G: [10, 80, 2], p: [10, 20, 25, 50],
    W: (G, p) => `Mia bekommt im Monat ${G} € Taschengeld. Sie spart ${p} % davon. Wie viel Euro spart sie?`,
    Gt: (W, p) => `Mia spart jeden Monat ${W} €. Das sind ${p} % ihres Taschengeldes. Wie viel Taschengeld bekommt sie?`,
    pt: (G, W) => `Mia bekommt im Monat ${G} € Taschengeld und spart davon ${W} €. Wie viel Prozent spart sie?` },
];

const fmt = n => (Number.isInteger(n) ? zahlText(n) : String(Math.round(n * 1000) / 1000).replace('.', ','));
const lies = s => { const t = String(s ?? '').replace(/\s/g, '').replace(',', '.'); return t === '' || t === '.' ? NaN : Number(t); };
const gleich = (a, b) => Math.abs(a - b) < 1e-9;

export function aufgabeErzeugen(gesucht) {
  for (let t = 0; t < 500; t++) {
    const k = wahl(KONTEXTE), p = wahl(k.p);
    const [min, max, st] = k.G, G = min + st * zufall(0, Math.floor((max - min) / st));
    const W = (G * p) / 100;
    if (!Number.isInteger(W) || W <= 0) continue;
    const text = gesucht === 'W' ? k.W(G, p) : gesucht === 'G' ? k.Gt(W, p) : k.pt(G, W);
    return { G, W, p, e: k.e, gesucht, text };
  }
  return { G: 200, W: 30, p: 15, e: '€', gesucht, text: KONTEXTE[0].W(200, 15) };
}

export function starteProzent(root) {
  let typ = 'W', auf, schritt, eing = {}, bewertung = null, laeuft = false, frischAbgedeckt = false;

  const g = geruest(root, {
    etikett: 'Prozentrechnung', titel: 'Das Prozent-Dreieck',
    reiter: [
      { id: 'W', titel: 'Prozentwert', unter: 'W berechnen' },
      { id: 'G', titel: 'Grundwert', unter: 'G berechnen' },
      { id: 'p', titel: 'Prozentsatz', unter: 'p % berechnen' },
      { id: 'mix', titel: 'Was ist gesucht?', unter: 'selbst herausfinden' },
    ],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-pz="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-pz="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    auf = aufgabeErzeugen(typ === 'mix' ? wahl(['W', 'G', 'p']) : typ);
    schritt = 1; bewertung = null; laeuft = false;
    ['pz-W', 'pz-G', 'pz-p', 'pz-e'].forEach(k => (eing[k] = ''));
  }

  const wert = x => auf[x];
  const einheit = x => (x === 'p' ? '%' : auf.e);
  const andere = () => ['W', 'G', 'p'].filter(x => x !== auf.gesucht);

  /* ---------- Dreieck ---------- */
  function dreieckHtml() {
    const gs = schritt >= 2 ? auf.gesucht : null;
    const teil = (x, pkt, lx, ly) => `<g class="pz-teil pz-${x}${gs === x ? ' abgedeckt' + (frischAbgedeckt ? ' frisch' : '') : ''}${schritt === 1 ? ' waehlbar' : ''}" data-teil="${x}" role="button" tabindex="${schritt === 1 ? 0 : -1}" aria-label="${NAME[x]} ${ZEICHEN[x]}">
        <polygon points="${pkt}"/>
        <text x="${lx}" y="${ly}" class="pz-buchst" data-l="${x}">${gs === x ? '?' : ZEICHEN[x]}</text>
        <text x="${lx}" y="${ly + 24}" class="pz-name">${NAME[x]}</text></g>`;
    return `<svg class="pz-dreieck" viewBox="0 0 300 262" role="group" aria-label="Formeldreieck">
      ${teil('W', '150,8 80,130 220,130', 150, 96)}
      ${teil('G', '80,130 150,130 150,252 10,252', 94, 196)}
      ${teil('p', '150,130 220,130 290,252 150,252', 210, 196)}
      <circle cx="150" cy="186" r="11" class="pz-malkreis"/><text x="150" y="193" class="pz-mal">·</text>
      <polygon points="150,8 10,252 290,252" class="pz-umriss"/></svg>`;
  }

  /* ---------- Formel ---------- */
  const buchst = x => `<span class="pz-b pz-${x}" data-l="${x}">${ZEICHEN[x]}</span>`;
  const feld = x => `<span class="pz-einsatz pz-${x}"><input class="gs-ein pz-ein" id="pz-${x}" data-zahl inputmode="decimal" maxlength="7" value="${ESC(eing['pz-' + x] ?? '')}" aria-label="${NAME[x]}"${schritt > 2 ? ' readonly tabindex="-1"' : ''}><small>${ESC(einheit(x))}</small></span>`;

  /** Rechte Seite der Formel: W → G · p %, G → W / p %, p → W / G */
  function rechteSeite(teil) {
    const s = auf.gesucht;
    if (s === 'W') return `${teil('G')} <span class="pz-op">·</span> ${teil('p')}`;
    return `<span class="bruch pz-bruch">${teil('W')}${teil(s === 'G' ? 'p' : 'G')}</span>`;
  }

  function formelHtml() {
    if (schritt < 2) return '';
    const s = auf.gesucht;
    let h = `<div class="pz-formel"><div class="pz-zeile pz-allg">${buchst(s)} <span class="pz-gl">=</span> ${rechteSeite(buchst)}</div>`;
    h += `<div class="pz-zeile pz-ein-zeile${schritt === 2 ? ' aktiv' : ''}">${buchst(s)} <span class="pz-gl">=</span> ${rechteSeite(feld)}</div>`;
    if (schritt >= 3) {
      h += `<div class="pz-zeile pz-erg-zeile${schritt === 3 ? ' aktiv' : ''}">${buchst(s)} <span class="pz-gl">=</span>
        <span class="pz-einsatz pz-${s}"><input class="gs-ein pz-ein" id="pz-e" data-zahl inputmode="decimal" maxlength="8" value="${ESC(eing['pz-e'] ?? '')}" aria-label="Ergebnis"${schritt > 3 ? ' readonly tabindex="-1"' : ''}><small>${ESC(einheit(s))}</small></span></div>`;
    }
    return h + '</div>';
  }

  function links() {
    const anw = {
      1: '<b>1.</b> Was ist gesucht? Tippe den Teil im Dreieck an.',
      2: '<b>2.</b> Setze die Werte aus der Aufgabe in die Formel ein.',
      3: '<b>3.</b> Rechne aus.',
      4: '✓ Fertig!',
    }[schritt];
    return `<div class="pz-buehne${schritt >= 2 ? ' mit-formel' : ''}">${dreieckHtml()}${formelHtml()}</div>
      <p class="pz-anweisung">${anw}</p>
      ${schritt === 2 || schritt === 3 ? '<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pz="pruefen">✓ Prüfen</button></div>' : ''}
      <p class="leise pz-regel">Nebeneinander heißt <b>mal</b>, übereinander heißt <b>geteilt</b>.</p>`;
  }

  function rechts() {
    const hinweis = typ !== 'mix' ? `<p class="pz-gesucht">Gesucht: <b>${NAME[auf.gesucht]}</b> <span class="pz-b pz-${auf.gesucht}">${ZEICHEN[auf.gesucht]}</span></p>` : '';
    let rechnung = '';
    if (schritt >= 4) {
      const s = auf.gesucht, { G, W, p, e } = auf;
      rechnung = `<div class="pz-loesung">${s === 'W' ? `W = ${fmt(G)} ${e} · ${p} % = ${fmt(G)} ${e} · ${fmt(p / 100)} = <b>${fmt(W)} ${e}</b>`
        : s === 'G' ? `G = ${fmt(W)} ${e} : ${p} % = ${fmt(W)} ${e} : ${fmt(p / 100)} = <b>${fmt(G)} ${e}</b>`
          : `p % = ${fmt(W)} ${e} : ${fmt(G)} ${e} = ${fmt(p / 100)} = <b>${p} %</b>`}</div>`;
    }
    return `<h2 class="bereich-titel">Aufgabe</h2><p class="tl-geschichte">${auf.text}</p>${hinweis}${rechnung}${antwortHtml(bewertung)}`;
  }

  function zeichne() { g.reiter(typ); g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  /* ---------- Animation: Teile wandern aus dem Dreieck in die Formel ---------- */
  async function formelAnimieren(vorher) {
    if (!bewegung()) return;
    const ziele = [...root.querySelectorAll('.pz-allg [data-l]')];
    const anims = ziele.map((el, i) => {
      const von = vorher[el.dataset.l]; if (!von) return null;
      const r = el.getBoundingClientRect();
      const dx = von.left + von.width / 2 - (r.left + r.width / 2), dy = von.top + von.height / 2 - (r.top + r.height / 2);
      return el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.25)`, opacity: .3 }, { transform: 'none', opacity: 1 }],
        { duration: 750, delay: 120 + i * 180, easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'backwards' }).finished;
    });
    root.querySelectorAll('.pz-op, .pz-bruch, .pz-allg .pz-gl').forEach(el => el.animate([{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { duration: 1100 }));
    root.querySelectorAll('.pz-ein-zeile').forEach(el => el.animate([{ opacity: 0 }, { opacity: 0, offset: .75 }, { opacity: 1 }], { duration: 1500 }));
    await Promise.all(anims.filter(Boolean).map(a => a.catch(() => {})));
  }

  async function waehle(x) {
    if (schritt !== 1 || laeuft) return;
    if (x !== auf.gesucht) {
      bewertung = { ok: false, text: `Der ${NAME[x]} ist in der Aufgabe schon gegeben: ${fmt(wert(x))} ${einheit(x)}. Was fehlt noch?` };
      g.rechts.innerHTML = rechts();
      g.sprich(`Suche in der Aufgabe: Welche der drei Größen kommt nicht als Zahl vor?`, 'tipp');
      return;
    }
    laeuft = true; bewertung = null;
    const vorher = {};
    root.querySelectorAll('.pz-dreieck [data-l]').forEach(t => { vorher[t.dataset.l] = t.getBoundingClientRect(); });
    schritt = 2; frischAbgedeckt = true; zeichne(); frischAbgedeckt = false;
    g.sprich(`Richtig: Gesucht ist der ${NAME[x]}. Deck ihn ab – die anderen beiden Teile bilden die Formel.`, 'fertig');
    await formelAnimieren(vorher);
    laeuft = false;
    root.querySelector('.pz-ein:not([readonly])')?.focus({ preventScroll: true });
  }

  /* ---------- Prüfen ---------- */
  function pruefen() {
    if (laeuft) return;
    if (schritt === 2) {
      const fehl = andere().filter(x => !gleich(lies(eing['pz-' + x]), wert(x)));
      if (!fehl.length) {
        schritt = 3; bewertung = null; zeichne();
        g.sprich(auf.gesucht === 'W' ? `Jetzt rechnen: ${p100()}.` : auf.gesucht === 'G' ? `Jetzt rechnen: geteilt durch ${auf.p} %, also geteilt durch ${fmt(auf.p / 100)}.` : 'Jetzt rechnen: Teile und schreibe das Ergebnis in Prozent.');
        root.querySelector('#pz-e')?.focus({ preventScroll: true });
        return;
      }
      const [a, b] = andere(), va = lies(eing['pz-' + a]), vb = lies(eing['pz-' + b]);
      let text;
      if (gleich(va, wert(b)) && gleich(vb, wert(a))) text = `Die Werte sind vertauscht. Wo steht ${ZEICHEN[a]} und wo ${ZEICHEN[b]}?`;
      else if (fehl.some(x => !eing['pz-' + x])) text = 'Trage beide Werte ein.';
      else {
        const x = fehl[0];
        text = x === 'p' ? 'Der Prozentsatz ist die Zahl mit dem Prozentzeichen.' : x === 'G' ? 'Der Grundwert ist das Ganze – also 100 %.' : 'Der Prozentwert ist der Teil vom Ganzen.';
      }
      bewertung = { ok: false, text }; g.rechts.innerHTML = rechts(); return;
    }
    if (schritt === 3) {
      const s = auf.gesucht, v = lies(eing['pz-e']), soll = wert(s);
      if (isNaN(v)) { bewertung = { ok: false, text: 'Trage das Ergebnis ein.' }; g.rechts.innerHTML = rechts(); return; }
      if (gleich(v, soll)) {
        schritt = 4;
        bewertung = { ok: true, text: `Richtig: ${s === 'p' ? `${soll} %` : `${fmt(soll)} ${auf.e}`}.` };
        g.sprich(`Super! ${NAME[s]} abdecken, Formel ablesen, einsetzen, ausrechnen.`, 'fertig');
        zeichne(); return;
      }
      let text = 'Noch nicht. Rechne noch einmal nach.';
      if (s === 'p' && gleich(v, soll / 100)) text = `${fmt(v)} stimmt als Dezimalzahl – schreibe es in Prozent: ${fmt(v)} = ${fmt(v * 100)} %.`;
      else if (s === 'W' && gleich(v, auf.G * auf.p)) text = `Du hast mit ${auf.p} malgenommen. ${auf.p} % sind aber ${auf.p}/100 = ${fmt(auf.p / 100)}.`;
      else if (s === 'G' && gleich(v, auf.W / auf.p)) text = `Du hast durch ${auf.p} geteilt. ${auf.p} % sind aber ${fmt(auf.p / 100)} – teile durch ${fmt(auf.p / 100)}.`;
      bewertung = { ok: false, text }; g.rechts.innerHTML = rechts();
    }
  }
  const p100 = () => `${auf.p} % = ${auf.p}/100 = ${fmt(auf.p / 100)}`;

  function tipp() {
    const s = auf.gesucht;
    const t = {
      1: 'Lies die Aufgabe: Welche Zahl hat ein %-Zeichen (Prozentsatz)? Welche Zahl ist das Ganze (Grundwert)? Welche ist der Teil (Prozentwert)? Was davon fehlt?',
      2: `Grundwert = das Ganze (100 %). Prozentsatz = die Zahl mit %. Prozentwert = der Teil.`,
      3: s === 'W' ? `${p100()}. Rechne ${fmt(auf.G)} · ${fmt(auf.p / 100)}.` : s === 'G' ? `${p100()}. Rechne ${fmt(auf.W)} : ${fmt(auf.p / 100)}.` : `Rechne ${fmt(auf.W)} : ${fmt(auf.G)}. Das Ergebnis mal 100 ergibt die Prozent.`,
      4: 'Neue Aufgabe?',
    }[schritt];
    g.sprich(t, 'tipp');
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { typ = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const tl = e.target.closest('[data-teil]');
    if (tl) { waehle(tl.dataset.teil); return; }
    const b = e.target.closest('[data-pz]');
    if (!b) return;
    if (b.dataset.pz === 'neu' && !laeuft) { neu(); zeichne(); start(); }
    if (b.dataset.pz === 'pruefen') pruefen();
    if (b.dataset.pz === 'tipp') tipp();
  });
  root.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-teil]')) { e.preventDefault(); waehle(e.target.dataset.teil); }
  });

  function start() {
    g.sprich(typ === 'mix' ? 'Lies die Aufgabe genau: Welche Größe ist gesucht? Tippe sie im Dreieck an.' : `Tippe im Dreieck an, was gesucht ist: der ${NAME[typ]}.`);
  }

  neu(); zeichne(); start();
}
