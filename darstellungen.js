/* Mathematik: Zuordnungen (Klasse 7) – Darstellungs-Werkstatt.
   Ein Multirepräsentationssystem im Kleinen (KLP NRW: Funktionen (4) und (7), Ope-11):
   „Erkunden“      – Situation, Formel, Tabelle und Graph hängen zusammen. Regler für q / k / m, b und für x.
                     Tippen in der Tabelle oder Ziehen im Graphen bewegt dieselbe Stelle überall mit.
   „Zuordnen“      – Zu einer Situation passende Formel, Tabelle und Graph finden (je drei Karten).
   „Tabellenkalkulation“ – Kleines Rechenblatt: in B2 eine Formel wie =1,5*A2+3 eintragen, nach unten ausfüllen,
                     Diagramm erscheint. Geprüft wird, ob die Werte zur Aufgabe passen. */

import { geruest, wahl, mischen, ESC, antwortHtml } from './geruest.js';
import { zt, lies, gleich, kosy, kurve, zeigerX, stile } from './kosy.js';

const TYPEN = {
  prop: {
    name: 'proportional', formel: (p, x) => `y = <span class="par">${zt(p.q)}</span> · ${x}`,
    f: p => x => p.q * x, regler: [{ id: 'q', name: 'q', min: 0.5, max: 5, step: 0.5 }], start: { q: 2 },
    sit: p => `Äpfel: 1 kg kostet ${zt(p.q)} €. x = Gewicht (in kg), y = Preis (in €).`, xlab: 'kg', ylab: '€',
    pruef: { name: 'y : x', f: (x, y) => y / x }, xmin: 0,
  },
  anti: {
    name: 'antiproportional', formel: (p, x) => `y = <span class="par">${zt(p.k)}</span> : ${x}`,
    f: p => x => p.k / x, regler: [{ id: 'k', name: 'k', min: 6, max: 60, step: 6 }], start: { k: 24 },
    sit: p => `${zt(p.k)} Gummibärchen werden gerecht verteilt. x = Anzahl Kinder, y = Gummibärchen je Kind.`, xlab: 'Kinder', ylab: 'Stück',
    pruef: { name: 'x · y', f: (x, y) => x * y }, xmin: 0.5,
  },
  linear: {
    name: 'mit Grundgebühr', formel: (p, x) => `y = <span class="par">${zt(p.m)}</span> · ${x} + <span class="par">${zt(p.b)}</span>`,
    f: p => x => p.m * x + p.b, regler: [{ id: 'm', name: 'Preis je km', min: 0.5, max: 3, step: 0.5 }, { id: 'b', name: 'Grundgebühr', min: 0, max: 6, step: 0.5 }], start: { m: 1.5, b: 4 },
    sit: p => `Taxi: ${zt(p.b)} € Grundgebühr und ${zt(p.m)} € je km. x = Strecke (in km), y = Preis (in €).`, xlab: 'km', ylab: '€',
    pruef: { name: 'y : x', f: (x, y) => y / x }, xmin: 0,
  },
};
const XS = [1, 2, 3, 4, 5, 6, 8];

/* Aufgaben für „Zuordnen“: jede mit eigener Funktion */
const ZUORDNEN = [
  { sit: 'Ein Heft kostet 1,50 €.', f: x => 1.5 * x, formel: 'y = 1,5 · x', falsch: ['y = x + 1,5', 'y = 1,5 : x'] },
  { sit: '36 Bonbons werden gerecht auf x Kinder verteilt.', f: x => 36 / x, formel: 'y = 36 : x', falsch: ['y = 36 · x', 'y = 36 − x'] },
  { sit: 'Ein Kino-Abo kostet 5 € im Monat und 3 € je Film.', f: x => 3 * x + 5, formel: 'y = 3 · x + 5', falsch: ['y = 5 · x + 3', 'y = 8 · x'] },
  { sit: 'Eine Kerze ist 24 cm lang und brennt 2 cm pro Stunde ab.', f: x => 24 - 2 * x, formel: 'y = 24 − 2 · x', falsch: ['y = 24 : x', 'y = 2 · x + 24'], xs: [0, 2, 4, 6, 8, 10] },
  { sit: 'Ein Wanderer geht 4 km pro Stunde.', f: x => 4 * x, formel: 'y = 4 · x', falsch: ['y = 4 : x', 'y = x + 4'] },
  { sit: 'Ein Beet ist 12 m² groß. x = Breite, y = Länge (in m).', f: x => 12 / x, formel: 'y = 12 : x', falsch: ['y = 12 · x', 'y = 12 − x'] },
  { sit: 'Fitnessstudio: 20 € Aufnahmegebühr und 10 € im Monat.', f: x => 10 * x + 20, formel: 'y = 10 · x + 20', falsch: ['y = 20 · x + 10', 'y = 30 · x'] },
];
const fausFormel = t => {
  const s = t.replace('y = ', '').replace(/·/g, '*').replace(/:/g, '/').replace(/−/g, '-').replace(/,/g, '.');
  return x => Function('x', `return ${s};`)(x);   // nur feste Texte aus dieser Datei
};

/* Aufgaben für die Tabellenkalkulation */
const BLATT = [
  { text: 'Taxi: 4 € Grundgebühr und 1,50 € je km. Spalte A: km, Spalte B: Preis in €.', a: 'Strecke (km)', b: 'Preis (€)', f: x => 1.5 * x + 4, muster: '=1,5*A2+4' },
  { text: 'Äpfel kosten 2,40 € je kg. Spalte A: kg, Spalte B: Preis in €.', a: 'Gewicht (kg)', b: 'Preis (€)', f: x => 2.4 * x, muster: '=2,4*A2' },
  { text: '48 € Gewinn werden gerecht geteilt. Spalte A: Anzahl Personen, Spalte B: € je Person.', a: 'Personen', b: '€ je Person', f: x => 48 / x, muster: '=48/A2' },
  { text: 'Handytarif: 5 € im Monat und 0,90 € je GB. Spalte A: GB, Spalte B: Kosten in €.', a: 'GB', b: 'Kosten (€)', f: x => 0.9 * x + 5, muster: '=0,9*A2+5' },
  { text: 'Ein Wasserhahn tropft: in 30 min steigt das Wasser um 6 cm. Spalte A: Minuten (10, 20, …), Spalte B: Höhe in cm.', a: 'Minuten', b: 'Höhe (cm)', f: x => 0.2 * x, muster: '=0,2*A2', start: 10, schritt: 10 },
];

/* sehr kleiner, sicherer Formel-Rechner: Zahlen, A1…A99, + − * / ( ) */
function rechne(formel, zeile, werteA) {
  let t = String(formel).trim();
  if (!t.startsWith('=')) return { fehler: 'Eine Formel beginnt mit =' };
  t = t.slice(1).replace(/\s/g, '').replace(/,/g, '.').replace(/·/g, '*').replace(/:/g, '/').replace(/−/g, '-').toUpperCase();
  if (!/^[0-9.+\-*/()A]*$/.test(t.replace(/A\d+/g, 'A'))) return { fehler: 'Erlaubt sind Zahlen, Zellen wie A2 und + − * / ( ).' };
  let falsch = null;
  const js = t.replace(/A(\d+)/g, (_, n) => { const v = werteA[Number(n)]; if (v === undefined) falsch = `A${n} ist leer.`; return `(${v})`; });
  if (falsch) return { fehler: falsch };
  try { const v = Function(`return (${js});`)(); return isFinite(v) ? { wert: v } : { fehler: 'Das Ergebnis ist keine Zahl (Teilen durch 0?).' }; }
  catch { return { fehler: 'Die Formel ist unvollständig.' }; }
}
/* „Nach unten ausfüllen“: relative Bezüge wandern mit (A2 → A3 …) */
const verschiebe = (formel, d) => formel.replace(/([aA])(\d+)/g, (_, a, n) => `${a.toUpperCase()}${Number(n) + d}`);

export function starteDarstellungen(root) {
  stile();
  let modus = 'erkunden', bewertung = null;
  let er = { typ: 'prop', p: { ...TYPEN.prop.start }, x: 3, pruef: false };
  let zo, bl;

  const g = geruest(root, {
    etikett: 'Zuordnungen', titel: '',
    reiter: [{ id: 'erkunden', titel: 'Erkunden', unter: 'Tabelle · Graph · Formel' }, { id: 'zuordnen', titel: 'Zuordnen', unter: 'Was gehört zusammen?' }, { id: 'blatt', titel: 'Tabellenkalkulation', unter: 'Formel nach unten ziehen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-dw="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-dw="neu">＋ Neue Aufgabe</button>`,
  });

  /* ================= Erkunden ================= */
  const T = () => TYPEN[er.typ];
  function grenzen() {
    const f = T().f(er.p), xmax = 9;
    return { xmax, ymax: er.typ === 'anti' ? er.p.k * 1.05 : Math.ceil(f(xmax) * 1.08) };
  }
  function erLinks() {
    const t = T(), f = t.f(er.p), { xmax, ymax } = grenzen();
    const k = kosy({ W: 460, H: 330, xmax, ymax, xlab: `x (${t.xlab})`, ylab: `y (${t.ylab})` });
    const y = f(er.x);
    let s = k.svg + `<path d="${kurve(k, f, Math.max(t.xmin, 0.01), xmax, ymax, 200)}" class="ks-graph"/>`;
    XS.forEach(x => { const v = f(x); if (v <= ymax) s += `<circle cx="${k.X(x)}" cy="${k.Y(v)}" r="5" class="ks-punkt alt"/>`; });
    if (y <= ymax) s += `<line x1="${k.X(er.x)}" y1="${k.B}" x2="${k.X(er.x)}" y2="${k.Y(y)}" class="ks-hilfe"/><line x1="${k.L}" y1="${k.Y(y)}" x2="${k.X(er.x)}" y2="${k.Y(y)}" class="ks-hilfe"/>
      <circle cx="${k.X(er.x)}" cy="${k.Y(y)}" r="9" class="ks-punkt spur"/><text x="${k.X(er.x) + 12}" y="${k.Y(y) - 10}" class="ks-wert">(${zt(er.x)} | ${zt(y)})</text>`;
    const tab = `<table class="zw-tab"><tr><th>x</th>${XS.map(x => `<td class="knopf${x === er.x ? ' an' : ''}" data-x="${x}">${zt(x)}</td>`).join('')}</tr>
      <tr><th>y</th>${XS.map(x => `<td class="knopf${x === er.x ? ' an' : ''}" data-x="${x}">${zt(f(x))}</td>`).join('')}</tr>
      ${er.pruef ? `<tr class="pruef"><th>${t.pruef.name}</th>${XS.map(x => `<td>${zt(t.pruef.f(x, f(x)))}</td>`).join('')}</tr>` : ''}</table>`;
    return `<p class="tl-geschichte">${ESC(t.sit(er.p))}</p>${tab}
      <svg class="ks-svg" viewBox="0 0 ${k.W} ${k.H}" data-graph role="img" aria-label="Graph – ziehen, um x zu verändern">${s}</svg>
      <p class="leise">Ziehe im Graphen oder tippe in der Tabelle: Der gelbe Punkt, die markierte Spalte und die Rechnung rechts gehören immer zusammen.</p>`;
  }
  function erRechts() {
    const t = T(), f = t.f(er.p), y = f(er.x);
    const typKn = Object.entries(TYPEN).map(([id, ty]) => `<button type="button" class="kn-gross${id === er.typ ? ' gewaehlt' : ''}" data-typ="${id}">${ty.name}</button>`).join('');
    const regler = t.regler.map(r => `<label class="zw-regler"><span>${r.name}</span><input type="range" min="${r.min}" max="${r.max}" step="${r.step}" value="${er.p[r.id]}" data-par="${r.id}"><output>${zt(er.p[r.id])}</output></label>`).join('');
    const formelX = t.formel(er.p, `<span class="var">${zt(er.x)}</span>`);
    return `<h2 class="bereich-titel">Eine Zuordnung – vier Darstellungen</h2>
      <div class="zw-wahl">${typKn}</div>
      <p class="zw-h">Formel</p><div class="zw-formel">${t.formel(er.p, '<span class="var">x</span>')}</div>
      ${regler}
      <label class="zw-regler"><span>x</span><input type="range" min="${t.xmin || 0}" max="8" step="0.5" value="${er.x}" data-xr><output>${zt(er.x)}</output></label>
      <div class="zw-formel">${formelX} = <b>${zt(y)}</b></div>
      <div class="gs-pruef"><button type="button" class="kn-gross" data-dw="pruef">${er.pruef ? 'Prüfzeile ausblenden' : `Prüfzeile ${t.pruef.name} zeigen`}</button></div>
      <p class="leise">Forscherfragen: Was passiert mit dem Graphen, wenn du ${t.regler[0].name} größer machst? Wo siehst du ${t.regler[0].name} in der Tabelle? Geht der Graph durch (0 | 0)?</p>`;
  }

  /* ================= Zuordnen ================= */
  function neuZuordnen() {
    const a = wahl(ZUORDNEN), xs = a.xs || [1, 2, 3, 4, 6];
    const andere = mischen(ZUORDNEN.filter(b => b !== a)).slice(0, 2);
    const fs = [a.f, ...a.falsch.map(fausFormel)];
    zo = {
      a, xs,
      formeln: mischen([{ t: a.formel, ok: true }, ...a.falsch.map(t => ({ t, ok: false }))]),
      tabellen: mischen([{ f: a.f, ok: true }, { f: fs[1], ok: false }, { f: fs[2], ok: false }]),
      graphen: mischen([{ f: a.f, ok: true }, { f: andere[0].f, ok: false }, { f: fs[1], ok: false }]),
      wahl: { formel: null, tabelle: null, graph: null }, geprueft: false,
    };
  }
  const miniTab = (f, xs) => `<table class="zw-tab"><tr><th>x</th>${xs.map(x => `<td>${zt(x)}</td>`).join('')}</tr><tr><th>y</th>${xs.map(x => `<td>${zt(f(x))}</td>`).join('')}</tr></table>`;
  function miniGraph(f) {
    const xmax = 10, ymax = 40, k = kosy({ W: 220, H: 170, xmax, ymax, klein: true, xlab: 'x', ylab: 'y' });
    return `<svg class="ks-svg klein" viewBox="0 0 ${k.W} ${k.H}" aria-hidden="true">${k.svg}<path d="${kurve(k, f, 0.3, xmax, ymax)}" class="ks-graph"/></svg>`;
  }
  function zoLinks() {
    const karte = (art, i, inhalt, ok) => {
      const gew = zo.wahl[art] === i, kl = zo.geprueft && gew ? (ok ? ' gut' : ' schlecht') : gew ? ' gewaehlt' : '';
      return `<button type="button" class="zw-karte${kl}" data-karte="${art}" data-i="${i}">${inhalt}</button>`;
    };
    return `<p class="tl-geschichte">${ESC(zo.a.sit)}</p>
      <p class="zw-h">1. Welche Formel passt?</p><div class="zw-karten">${zo.formeln.map((k, i) => karte('formel', i, `<span class="zw-formel" style="display:block">${k.t}</span>`, k.ok)).join('')}</div>
      <p class="zw-h">2. Welche Tabelle passt?</p><div class="zw-karten">${zo.tabellen.map((k, i) => karte('tabelle', i, miniTab(k.f, zo.xs), k.ok)).join('')}</div>
      <p class="zw-h">3. Welcher Graph passt?</p><div class="zw-karten">${zo.graphen.map((k, i) => karte('graph', i, miniGraph(k.f), k.ok)).join('')}</div>`;
  }
  function zoRechts() {
    const fertig = Object.values(zo.wahl).every(v => v !== null);
    return `<h2 class="bereich-titel">Darstellungen zuordnen</h2>
      <p>Wähle zu der Situation je eine Karte aus jeder Reihe.</p>
      <p class="leise">Alle drei Graphen sind gleich skaliert: x bis 10, y bis 40.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-dw="zopruef" ${fertig && !zo.geprueft ? '' : 'disabled'}>✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${zo.geprueft ? `<p class="leise">Begründe im Heft: Woran hast du jede Karte erkannt? (Startwert, Steigung, „je mehr – desto weniger“ …)</p>` : ''}`;
  }
  function zoPruefen() {
    zo.geprueft = true;
    const ok = { formel: zo.formeln[zo.wahl.formel].ok, tabelle: zo.tabellen[zo.wahl.tabelle].ok, graph: zo.graphen[zo.wahl.graph].ok };
    const n = Object.values(ok).filter(Boolean).length;
    bewertung = n === 3 ? { ok: true, text: 'Alles richtig – drei Darstellungen derselben Zuordnung.' }
      : { ok: false, text: `${n} von 3 richtig. Rot umrandet: ${Object.entries(ok).filter(e => !e[1]).map(e => e[0]).join(', ')}. Setze x = 1 und x = 2 in die richtige Formel ein und vergleiche.` };
    if (n === 3) g.sprich('Tipp für später: Rechne mit der Formel zwei Wertepaare aus – dann findest du Tabelle und Graph schnell.', 'fertig');
    zeichne();
  }

  /* ================= Tabellenkalkulation ================= */
  function neuBlatt() {
    const a = wahl(BLATT), st = a.start ?? 1, sw = a.schritt ?? 1;
    const A = {}; for (let z = 2; z <= 9; z++) A[z] = st + (z - 2) * sw;
    bl = { a, A, B: {}, aktiv: 'B2', eingabe: '', fehler: null, geprueft: false };
  }
  function blattLinks() {
    const { a, A, B, aktiv } = bl;
    let rows = `<tr><th></th><th>A</th><th>B</th></tr><tr><th>1</th><td class="zw-k">${ESC(a.a)}</td><td class="zw-k">${ESC(a.b)}</td></tr>`;
    for (let z = 2; z <= 9; z++) {
      const b = B[z], bw = b ? rechne(b, z, A) : null;
      rows += `<tr><th>${z}</th><td data-zelle="A${z}" class="${aktiv === `A${z}` ? 'aktiv' : ''}">${zt(A[z])}</td>
        <td data-zelle="B${z}" class="${aktiv === `B${z}` ? 'aktiv' : ''}${bw?.fehler ? ' fehler' : ''}">${bw ? (bw.fehler ? '#FEHLER' : zt(bw.wert)) : ''}</td></tr>`;
    }
    const pkte = []; for (let z = 2; z <= 9; z++) { const r = B[z] ? rechne(B[z], z, A) : null; if (r && !r.fehler) pkte.push([A[z], r.wert]); }
    let diag = '';
    if (pkte.length >= 2) {
      const xmax = Math.max(...pkte.map(p => p[0])) * 1.1, ymax = Math.max(1, ...pkte.map(p => p[1])) * 1.15;
      const k = kosy({ W: 440, H: 280, xmax, ymax, xlab: ESC(a.a), ylab: ESC(a.b) });
      diag = `<p class="zw-h">Diagramm (Punktdiagramm)</p><svg class="ks-svg" viewBox="0 0 ${k.W} ${k.H}" role="img" aria-label="Diagramm">${k.svg}${pkte.map(([x, y]) => y >= 0 && y <= ymax ? `<circle cx="${k.X(x)}" cy="${k.Y(y)}" r="6" class="ks-punkt"/>` : '').join('')}</svg>`;
    }
    return `<p class="tl-geschichte">${ESC(a.text)}</p><div class="vz-huelle"><table class="zw-blatt">${rows}</table></div>${diag}`;
  }
  function blattRechts() {
    const { aktiv, A, B } = bl, spalte = aktiv[0], z = Number(aktiv.slice(1));
    const inhalt = spalte === 'A' ? String(A[z]).replace('.', ',') : (B[z] ?? '');
    return `<h2 class="bereich-titel">Wie eine Tabellenkalkulation</h2>
      <p>Ausgewählte Zelle: <b>${aktiv}</b></p>
      <div class="zw-zeile"><span class="fx">fx</span><input id="dw-fx" value="${ESC(bl.eingabe || inhalt)}" ${spalte === 'A' ? 'disabled' : ''} aria-label="Formel" autocomplete="off" spellcheck="false"></div>
      <div class="gs-pruef"><button type="button" class="kn-gross" data-dw="eintragen" ${spalte === 'A' ? 'disabled' : ''}>⏎ Eintragen</button>
        <button type="button" class="kn-gross" data-dw="runter" ${B[2] ? '' : 'disabled'}>⬇ B2 nach unten ausfüllen</button></div>
      ${bl.fehler ? `<p class="tb-antwort schlecht">${ESC(bl.fehler)}</p>` : ''}
      <p class="leise">So geht's: Tippe in Spalte B auf B2. Schreibe eine Formel, die mit dem Wert in A2 rechnet, z. B. <b>=3*A2</b>. Dann „nach unten ausfüllen“ – aus A2 wird in jeder Zeile automatisch A3, A4 …</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-dw="blattpruef" ${B[9] ? '' : 'disabled'}>✓ Spalte B prüfen</button></div>${antwortHtml(bewertung)}`;
  }
  function blattEintragen() {
    const z = Number(bl.aktiv.slice(1)), v = (root.querySelector('#dw-fx')?.value ?? '').trim();
    bl.eingabe = ''; bl.fehler = null;
    if (v === '') { delete bl.B[z]; zeichne(); return; }
    const f = v.startsWith('=') ? v : (lies(v) !== null ? `=${v}` : v);
    const r = rechne(f, z, bl.A);
    if (r.fehler) { bl.fehler = r.fehler; bl.eingabe = v; }
    bl.B[z] = f;
    zeichne();
  }
  function blattRunter() {
    const f = bl.B[2]; if (!f) return;
    for (let z = 3; z <= 9; z++) bl.B[z] = verschiebe(f, z - 2);
    g.sprich(`Ausgefüllt: In B3 steht jetzt ${ESC(bl.B[3])}, in B9 ${ESC(bl.B[9])}. Der Bezug auf Spalte A wandert mit.`);
    zeichne();
  }
  function blattPruefen() {
    let alle = true;
    for (let z = 2; z <= 9; z++) { const r = rechne(bl.B[z] ?? '', z, bl.A); if (r.fehler || !gleich(r.wert, bl.a.f(bl.A[z]))) alle = false; }
    bewertung = alle ? { ok: true, text: `Richtig! Eine passende Formel für B2 ist z. B. ${bl.a.muster}.` }
      : { ok: false, text: 'Noch nicht alle Werte passen. Rechne B2 einmal von Hand nach: Was muss mit A2 passieren?' };
    if (alle) g.sprich('Mit einer einzigen Formel hast du die ganze Tabelle berechnet – das ist der Trick der Tabellenkalkulation.', 'fertig');
    zeichne();
  }

  /* ================= gemeinsam ================= */
  function neu() {
    bewertung = null;
    if (modus === 'zuordnen') neuZuordnen();
    if (modus === 'blatt') neuBlatt();
    if (modus === 'erkunden') { const ids = Object.keys(TYPEN); er.typ = wahl(ids); er.p = { ...TYPEN[er.typ].start }; er.x = 3; er.pruef = false; }
  }
  function zeichne() {
    g.reiter(modus);
    g.titel({ erkunden: 'Tabelle, Graph und Formel erkunden', zuordnen: 'Passende Darstellungen finden', blatt: 'Rechnen mit der Tabellenkalkulation' }[modus]);
    g.links.innerHTML = modus === 'erkunden' ? erLinks() : modus === 'zuordnen' ? zoLinks() : blattLinks();
    g.rechts.innerHTML = modus === 'erkunden' ? erRechts() : modus === 'zuordnen' ? zoRechts() : blattRechts();
  }
  function start() {
    g.sprich({
      erkunden: 'Bewege die Regler. Beobachte, was sich in Tabelle, Graph und Formel gleichzeitig ändert.',
      zuordnen: 'Eine Situation – drei Darstellungen. Finde jeweils die passende Karte.',
      blatt: 'Eine Formel für die ganze Spalte: Schreibe sie in B2 und fülle nach unten aus.',
    }[modus]);
  }

  /* Ziehen im Graphen */
  let zieht = false;
  root.addEventListener('pointerdown', e => { const s = e.target.closest('[data-graph]'); if (s && modus === 'erkunden') { zieht = true; s.setPointerCapture?.(e.pointerId); setzeX(s, e); } });
  root.addEventListener('pointermove', e => { if (!zieht) return; const s = e.target.closest('[data-graph]') || root.querySelector('[data-graph]'); if (s) setzeX(s, e); });
  root.addEventListener('pointerup', () => { zieht = false; });
  function setzeX(svg, e) {
    const k = kosy({ W: 460, H: 330, ...grenzen() });
    let x = Math.round(zeigerX(svg, e, k) * 2) / 2;
    x = Math.min(8, Math.max(T().xmin || 0, x));
    if (x !== er.x) { er.x = x; zeichne(); }
  }

  root.addEventListener('input', e => {
    if (e.target.matches('[data-par]')) { er.p[e.target.dataset.par] = Number(e.target.value); e.target.nextElementSibling.value = zt(Number(e.target.value)); g.links.innerHTML = erLinks(); const fz = g.rechts.querySelectorAll('.zw-formel'); fz[0].innerHTML = T().formel(er.p, '<span class="var">x</span>'); fz[1].innerHTML = `${T().formel(er.p, `<span class="var">${zt(er.x)}</span>`)} = <b>${zt(T().f(er.p)(er.x))}</b>`; }
    if (e.target.matches('[data-xr]')) { er.x = Number(e.target.value); e.target.nextElementSibling.value = zt(er.x); g.links.innerHTML = erLinks(); g.rechts.querySelectorAll('.zw-formel')[1].innerHTML = `${T().formel(er.p, `<span class="var">${zt(er.x)}</span>`)} = <b>${zt(T().f(er.p)(er.x))}</b>`; }
    if (e.target.id === 'dw-fx') bl.eingabe = e.target.value;
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'dw-fx') { e.preventDefault(); blattEintragen(); } });
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const ty = e.target.closest('[data-typ]');
    if (ty) { er.typ = ty.dataset.typ; er.p = { ...TYPEN[er.typ].start }; er.x = Math.max(er.x, TYPEN[er.typ].xmin); zeichne(); g.sprich(`${TYPEN[er.typ].name}: Schau, wo der Graph beginnt und wie er verläuft.`); return; }
    const tx = e.target.closest('[data-x]');
    if (tx && modus === 'erkunden') { er.x = Number(tx.dataset.x); zeichne(); return; }
    const ka = e.target.closest('[data-karte]');
    if (ka && !zo.geprueft) { zo.wahl[ka.dataset.karte] = Number(ka.dataset.i); zeichne(); return; }
    const ze = e.target.closest('[data-zelle]');
    if (ze) { bl.aktiv = ze.dataset.zelle; bl.eingabe = ''; bl.fehler = null; zeichne(); root.querySelector('#dw-fx:not([disabled])')?.focus(); return; }
    const k = e.target.closest('[data-dw]');
    if (!k) return;
    const a = k.dataset.dw;
    if (a === 'neu') { neu(); zeichne(); start(); }
    if (a === 'pruef') { er.pruef = !er.pruef; zeichne(); if (er.pruef) g.sprich(er.typ === 'prop' ? 'Bei proportionalen Zuordnungen ist y : x immer gleich – das ist q.' : er.typ === 'anti' ? 'Bei antiproportionalen Zuordnungen ist x · y immer gleich – das ist k.' : 'Hier ist y : x nicht gleich – wegen der Grundgebühr ist die Zuordnung nicht proportional.'); }
    if (a === 'zopruef') zoPruefen();
    if (a === 'eintragen') blattEintragen();
    if (a === 'runter') blattRunter();
    if (a === 'blattpruef') blattPruefen();
    if (a === 'tipp') g.sprich({
      erkunden: er.typ === 'prop' ? 'Proportional: Der Graph ist eine Gerade durch (0 | 0). q ist der y-Wert bei x = 1.' : er.typ === 'anti' ? 'Antiproportional: Verdoppelst du x, halbiert sich y. Der Graph berührt die Achsen nie.' : 'Mit Grundgebühr: Der Graph ist eine Gerade, beginnt aber nicht bei 0, sondern bei der Grundgebühr.',
      zuordnen: 'Setze x = 1 und x = 2 in jede Formel ein. Welche Tabelle hat diese Werte? Wo beginnt der Graph?',
      blatt: `Schreibe in B2 zum Beispiel =Zahl*A2 oder =Zahl*A2+Zahl. Bei dieser Aufgabe: ${ESC(bl.a.text.split('.')[0])}.`,
    }[modus], 'tipp');
  });

  neu(); er = { typ: 'prop', p: { ...TYPEN.prop.start }, x: 3, pruef: false };
  zeichne(); start();
}
