/* Mathematik: Zuordnungen (Klasse 7) – Antiproportional begreifen.
   „Perlenrechteck“ – Immer gleich viele Perlen (z. B. 24) werden in Reihen gelegt. Breite x, Höhe y:
                     Die Perlen wandern sichtbar um, jedes Rechteck wird ein Punkt im Graphen, x · y bleibt gleich.
   „Dreisatz“       – Pfeiltabelle für antiproportionale Aufgaben: links : m, rechts · m (gegensinnig).
   „Typ erkennen“   – Tabelle: proportional, antiproportional oder keins von beiden? Danach Quotient,
                     Produkt und Graph als Begründung (auch Fallen wie „je mehr – desto weniger“, aber nicht antiproportional). */

import { geruest, wahl, mischen, zufall, ESC, antwortHtml } from './geruest.js';
import { perlenBuehne } from './buehne.js';
import { zt, lies, gleich, kosy, kurve, zug, stile } from './kosy.js';

const MENGEN = [12, 18, 24, 36];
const teiler = n => Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0);

const DREISATZ = [
  { a: 'Kinder', eins: 'Kind', b: 'Bonbons je Kind', satz: (m, w) => `${m} Kinder teilen sich Bonbons gerecht. Jedes Kind bekommt ${w} Bonbons.`, frage: n => `Wie viele bekommt jedes Kind, wenn es ${n} Kinder sind?`, k: [24, 36, 48, 60, 72] },
  { a: 'Bagger', eins: 'Bagger', b: 'Tage', satz: (m, w) => `${m} gleich starke Bagger brauchen ${w} Tage für eine Baugrube.`, frage: n => `Wie lange brauchen ${n} Bagger?`, k: [24, 36, 48, 60] },
  { a: 'Pumpen', eins: 'Pumpe', b: 'Stunden', satz: (m, w) => `Mit ${m} Pumpen ist ein Becken in ${w} Stunden leer.`, frage: n => `Wie lange dauert es mit ${n} Pumpen?`, k: [12, 24, 36, 48] },
  { a: 'km/h', eins: 'km/h', b: 'Stunden', satz: (m, w) => `Mit ${m} km/h dauert eine Fahrt ${w} Stunden.`, frage: n => `Wie lange dauert sie mit ${n} km/h?`, k: [120, 240, 360], m: [40, 60, 80, 120] },
  { a: 'Personen', eins: 'Person', b: '€ je Person', satz: (m, w) => `Ein Gewinn wird gerecht geteilt: Bei ${m} Personen bekommt jede ${w} €.`, frage: n => `Wie viel bekommt jede, wenn es ${n} Personen sind?`, k: [60, 120, 240] },
];

/* Tabellen für „Typ erkennen“ */
function typAufgabe() {
  const art = wahl(['prop', 'anti', 'linear', 'falle', 'fastprop', 'fastanti']);
  const xs = mischen([1, 2, 3, 4, 5, 6, 8, 10, 12]).slice(0, 5).sort((a, b) => a - b);
  let f, typ, warum, text;
  if (art === 'prop') { const q = wahl([1.5, 2, 2.5, 3, 4]); f = x => q * x; typ = 'prop'; warum = `Der Quotient y : x ist immer ${zt(q)}. Der Graph ist eine Gerade durch (0 | 0).`; }
  if (art === 'anti') { const k = wahl([24, 60, 120]); f = x => k / x; typ = 'anti'; warum = `Das Produkt x · y ist immer ${k}. Der Graph ist eine Hyperbel und berührt die Achsen nicht.`; }
  if (art === 'linear') { const m = wahl([2, 3]), b = wahl([4, 5, 10]); f = x => m * x + b; typ = 'keins'; warum = 'Je mehr – desto mehr, aber y : x ist nicht gleich. Der Graph beginnt nicht bei 0.'; }
  if (art === 'falle') { const a = wahl([40, 50, 60]); f = x => a - 3 * x; typ = 'keins'; warum = 'Je mehr – desto weniger, aber x · y ist nicht gleich. Das reicht nicht für antiproportional!'; }
  if (art === 'fastprop') { const q = wahl([2, 3, 4]); const aus = xs[3]; f = x => (x === aus ? q * x + 1 : q * x); typ = 'keins'; warum = `Fast alle Paare passen zu y = ${q} · x – aber bei x = ${aus} nicht. Ein Paar reicht, um „proportional“ auszuschließen.`; }
  if (art === 'fastanti') { const k = wahl([60, 120]); const aus = xs[4]; f = x => (x === aus ? k / x + 2 : k / x); typ = 'keins'; warum = `Fast alle Paare haben das Produkt ${k} – aber bei x = ${aus} nicht. Darum ist die Zuordnung nicht antiproportional.`; }
  return { xs, f, typ, warum, art, wahl: null };
}

export function starteAntiprop(root) {
  stile();
  let modus = 'rechteck', bewertung = null, eing = {};
  let re, ds, ty;

  const g = geruest(root, {
    etikett: 'Zuordnungen', titel: '',
    reiter: [{ id: 'rechteck', titel: 'Perlenrechteck', unter: 'gleiche Menge, andere Form' }, { id: 'dreisatz', titel: 'Dreisatz', unter: 'gegensinnig rechnen' }, { id: 'typ', titel: 'Typ erkennen', unter: 'Quotient oder Produkt?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-ap="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-ap="neu">＋ Neue Aufgabe</button>`,
  });

  /* ================= Perlenrechteck ================= */
  let buehne = null;
  function neuRechteck() {
    const n = wahl(MENGEN);
    re = { n, x: teiler(n)[1], besucht: new Set(), kurve: false, frage: null, antwort: null };
    re.besucht.add(re.x);
  }
  function reLinks() {
    const { n, x } = re, y = n / x;
    const pk = [...re.besucht].sort((a, b) => a - b);
    const k = kosy({ W: 440, H: 300, xmax: n + 1, ymax: n + 1, xlab: 'x Breite', ylab: 'y Höhe', xs: n > 24 ? 6 : n > 12 ? 4 : 2, ys: n > 24 ? 6 : n > 12 ? 4 : 2 });
    let s = k.svg;
    if (re.kurve) s += `<path d="${kurve(k, t => n / t, 0.4, n + 1, n + 1, 300)}" class="ks-graph wachsend"/>`;
    pk.forEach(t => { s += `<circle cx="${k.X(t)}" cy="${k.Y(n / t)}" r="6" class="ks-punkt alt"/>`; });
    s += `<rect x="${k.L}" y="${k.Y(y)}" width="${k.X(x) - k.L}" height="${k.B - k.Y(y)}" class="ks-flaeche"/>`;
    s += `<circle cx="${k.X(x)}" cy="${k.Y(y)}" r="9" class="ks-punkt spur"/><text x="${k.X(x) + (x > n * 0.6 ? -12 : 12)}" y="${k.Y(y) - 12}" class="ks-wert" text-anchor="${x > n * 0.6 ? 'end' : 'start'}">(${x} | ${zt(y)})</text>`;
    const tab = `<table class="zw-tab"><tr><th>Breite x</th>${pk.map(t => `<td class="${t === x ? 'an' : ''}">${t}</td>`).join('')}</tr>
      <tr><th>Höhe y</th>${pk.map(t => `<td class="${t === x ? 'an' : ''}">${zt(n / t)}</td>`).join('')}</tr>
      <tr class="pruef"><th>x · y</th>${pk.map(t => `<td>${n}</td>`).join('')}</tr></table>`;
    return `<p class="tl-geschichte">${n} Perlen werden zu einem Rechteck gelegt. x Perlen in jeder Reihe – wie viele Reihen (y) gibt es?</p>
      <div class="zw-buehne" id="ap-buehne"></div>
      ${tab}<svg class="ks-svg" viewBox="0 0 ${k.W} ${k.H}" role="img" aria-label="Graph Breite und Höhe">${s}</svg>
      <p class="leise">Die blasse Fläche unter dem gelben Punkt ist genau so groß wie das Perlenrechteck: immer ${n} Kästchen.</p>`;
  }
  function reRechts() {
    const ts = teiler(re.n);
    return `<h2 class="bereich-titel">Gleiche Menge – andere Form</h2>
      <label class="zw-regler"><span>Breite x</span><input type="range" min="0" max="${ts.length - 1}" step="1" value="${ts.indexOf(re.x)}" data-breite><output>${re.x}</output></label>
      <div class="zw-formel"><span class="var">${re.x}</span> · <b>${zt(re.n / re.x)}</b> = ${re.n} &nbsp;→&nbsp; y = ${re.n} : <span class="var">x</span></div>
      <p class="leise">Probiere alle Breiten aus (${re.besucht.size} von ${ts.length}).</p>
      <div class="gs-pruef"><button type="button" class="kn-gross" data-ap="kurve" ${re.besucht.size >= 4 ? '' : 'disabled'}>〰 Punkte verbinden?</button></div>
      ${re.kurve ? '<p class="leise">Die Kurve heißt <b>Hyperbel</b>. Für die Perlen gibt es nur die Punkte – für Flächen in cm² (ein Rechteck aus Papier) auch alle Zwischenwerte.</p>' : ''}
      ${reFrage()}${antwortHtml(bewertung)}`;
  }
  function reFrage() {
    const ts = teiler(re.n);
    if (re.besucht.size < ts.length) return '';
    if (!re.frage) { const i = zufall(0, Math.floor(ts.length / 2) - 1); const a = ts[i], b = ts.find(t => t !== a && re.n % (t) === 0 && t % a === 0 && t / a > 1) ?? ts[i + 1]; re.frage = { a, b, f: b / a }; }
    const { a, b, f } = re.frage;
    const kn = [['geteilt', `durch ${zt(f)} geteilt`], ['mal', `mal ${zt(f)} genommen`], ['gleich', 'bleibt gleich']];
    return `<p class="zw-h">Wenn die Breite von ${a} auf ${b} wächst (· ${zt(f)}), dann wird die Höhe …</p>
      <div class="zw-wahl">${kn.map(([id, t]) => `<button type="button" class="kn-gross${re.antwort === id ? ' gewaehlt' : ''}" data-refrage="${id}">${t}</button>`).join('')}</div>`;
  }
  function legePerlen() {
    const el = root.querySelector('#ap-buehne'); if (!el) return;
    if (!buehne || buehne.el !== el) { el.innerHTML = ''; buehne = { ...perlenBuehne(el), el }; }
    const W = buehne.breite(), { n, x } = re, y = n / x;
    const zelle = Math.max(12, Math.min(34, Math.floor((W - 20) / x), Math.floor(260 / y)));
    const x0 = (W - x * zelle) / 2, pl = [];
    for (let i = 0; i < n; i++) { const r = Math.floor(i / x), c = i % x; pl.push({ x: x0 + c * zelle + zelle / 2, y: 10 + r * zelle + zelle / 2, klasse: r % 2 ? 'gold' : '', verzoegerung: i * 8 }); }
    buehne.setze(pl, zelle - 4, y * zelle + 20);
  }

  /* ================= Dreisatz (antiproportional) ================= */
  function neuDreisatz() {
    const kont = wahl(DREISATZ), k = wahl(kont.k);
    const ms = (kont.m || teiler(k).filter(d => d >= 2 && d <= 12)).filter(d => k % d === 0);
    let m, n; do { m = wahl(ms); n = wahl(ms); } while (n === m);
    ds = { kont, k, m, n, schritt: 1 };
    eing = {};
  }
  const ein = (id, label) => `<input class="gs-ein" id="${id}" data-apein inputmode="decimal" value="${ESC(eing[id] ?? '')}" aria-label="${label}">`;
  function dsLinks() {
    const { kont, k, m, n, schritt } = ds;
    const zeile = (a, b, opL = '', opR = '', kl = '') => `<span></span><span>${a}</span><span>→</span><span>${b}</span><span></span>`;
    let h = `<p class="tl-geschichte">${kont.satz(m, zt(k / m))} ${kont.frage(n)}</p>
      <div class="zw-pfeiltab"><span></span><span class="zw-pk">${ESC(kont.a)}</span><span></span><span class="zw-pk">${ESC(kont.b)}</span><span></span>
      <span class="op">: ${m} ↓</span><span>${m}</span><span>→</span><span>${zt(k / m)}</span><span class="op">↓ · ${m}</span>
      <span class="op b">${schritt >= 2 ? `· ${n} ↓` : ''}</span><span>1</span><span>→</span><span>${schritt >= 2 ? `<b>${zt(k)}</b>` : ein('ap-1', 'Wert für 1')}</span><span class="op b">${schritt >= 2 ? `↓ : ${n}` : ''}</span>
      ${schritt >= 2 ? `<span></span><span>${n}</span><span>→</span><span>${schritt >= 3 ? `<b>${zt(k / n)}</b>` : ein('ap-n', `Wert für ${n}`)}</span><span></span>` : ''}
      </div>`;
    void zeile;
    h += `<p class="leise">Antiproportional: Was links geteilt wird, wird rechts malgenommen – und umgekehrt. Die Pfeile laufen gegensinnig.</p>`;
    return h;
  }
  function dsRechts() {
    const { kont, k, m, n, schritt } = ds;
    let h = `<h2 class="bereich-titel">Dreisatz – antiproportional</h2>`;
    h += `<p class="vz-schritt${schritt > 1 ? ' fertig' : ''}">1. Auf 1 zurück: 1 ${ESC(kont.eins)} → ${schritt > 1 ? `${zt(k)} ✓` : '?'}</p>`;
    if (schritt === 1) h += `<p class="leise">Weniger ${ESC(kont.a)} → mehr ${ESC(kont.b)}. Links : ${m}, also rechts · ${m}.</p>`;
    if (schritt >= 2) h += `<p class="vz-schritt${schritt > 2 ? ' fertig' : ''}">2. Von 1 auf ${n}: ${schritt > 2 ? `${zt(k / n)} ✓` : '?'}</p>`;
    if (schritt === 2) h += `<p class="leise">Links · ${n}, also rechts : ${n}.</p>`;
    if (schritt < 3) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-ap="dspruef">✓ Prüfen</button></div>`;
    if (schritt === 3) h += `<div class="zw-formel">Probe: ${m} · ${zt(k / m)} = ${n} · ${zt(k / n)} = ${zt(k)}</div><p class="leise">Das Produkt bleibt gleich – daran erkennst du antiproportionale Zuordnungen.</p>`;
    return h + antwortHtml(bewertung);
  }
  function dsPruefen() {
    const { k, m, n } = ds;
    if (ds.schritt === 1) {
      const v = lies(eing['ap-1']);
      if (gleich(v, k)) { ds.schritt = 2; bewertung = null; g.sprich(`Für 1 sind es ${zt(k)} – also ${m}-mal so viel.`); }
      else bewertung = { ok: false, text: gleich(v, k / m / m) ? `Du hast geteilt. Aber: Weniger ${ESC(ds.kont.a)} → mehr ${ESC(ds.kont.b)}. Rechne ${zt(k / m)} · ${m}.` : `Rechne ${zt(k / m)} · ${m}.` };
    } else if (ds.schritt === 2) {
      const v = lies(eing['ap-n']);
      if (gleich(v, k / n)) { ds.schritt = 3; bewertung = { ok: true, text: `Richtig: ${zt(k / n)}` }; g.sprich('Gegensinnig rechnen: links mal, rechts geteilt.', 'fertig'); }
      else bewertung = { ok: false, text: gleich(v, k * n) ? `Mehr ${ESC(ds.kont.a)} → weniger ${ESC(ds.kont.b)}. Teile ${zt(k)} durch ${n}.` : `Teile ${zt(k)} durch ${n}.` };
    }
    zeichne();
    root.querySelector('.tb-links input')?.focus({ preventScroll: true });
  }

  /* ================= Typ erkennen ================= */
  function tyLinks() {
    const { xs, f, wahl: w } = ty;
    const zeigen = w !== null;
    let h = `<table class="zw-tab"><tr><th>x</th>${xs.map(x => `<td>${zt(x)}</td>`).join('')}</tr><tr><th>y</th>${xs.map(x => `<td>${zt(f(x))}</td>`).join('')}</tr>
      ${zeigen ? `<tr class="pruef"><th>y : x</th>${xs.map(x => `<td>${zt(f(x) / x)}</td>`).join('')}</tr><tr class="pruef"><th>x · y</th>${xs.map(x => `<td>${zt(f(x) * x)}</td>`).join('')}</tr>` : ''}</table>`;
    if (zeigen) {
      const xmax = Math.max(...xs) * 1.1, ymax = Math.max(...xs.map(f)) * 1.15;
      const k = kosy({ W: 420, H: 280, xmax, ymax });
      h += `<svg class="ks-svg" viewBox="0 0 ${k.W} ${k.H}" role="img" aria-label="Graph">${k.svg}<path d="${zug(k, xs.map(x => [x, f(x)]))}" class="ks-graph leise"/>${xs.map(x => `<circle cx="${k.X(x)}" cy="${k.Y(f(x))}" r="6" class="ks-punkt"/>`).join('')}</svg>`;
    }
    return h;
  }
  function tyRechts() {
    const kn = [['prop', 'proportional'], ['anti', 'antiproportional'], ['keins', 'keins von beiden']];
    return `<h2 class="bereich-titel">Welcher Zuordnungstyp?</h2>
      <p>Prüfe <b>alle</b> Wertepaare – nicht nur zwei!</p>
      <div class="zw-wahl">${kn.map(([id, t]) => `<button type="button" class="kn-gross${ty.wahl === id ? ' gewaehlt' : ''}" data-typw="${id}" ${ty.wahl ? 'disabled' : ''}>${t}</button>`).join('')}</div>
      ${antwortHtml(bewertung)}
      <div class="fl-formel" style="margin-top:.6rem">proportional ⇔ y : x immer gleich (q)<br>antiproportional ⇔ x · y immer gleich (k)</div>`;
  }
  function tyAntwort(w) {
    ty.wahl = w;
    const ok = w === ty.typ;
    bewertung = { ok, text: `${ok ? 'Richtig!' : 'Nicht ganz.'} ${ty.warum}` };
    if (ok) g.sprich('Begriffe ordnen: Jede proportionale und jede antiproportionale Zuordnung ist eine Zuordnung – aber nicht jede Zuordnung ist eins von beiden.', 'fertig');
    zeichne();
  }

  /* ================= gemeinsam ================= */
  function neu() {
    bewertung = null;
    if (modus === 'rechteck') neuRechteck();
    if (modus === 'dreisatz') neuDreisatz();
    if (modus === 'typ') ty = typAufgabe();
  }
  function zeichne() {
    g.reiter(modus);
    g.titel({ rechteck: `${re?.n ?? ''} Perlen – immer gleich viele`, dreisatz: 'Dreisatz bei antiproportionalen Zuordnungen', typ: 'Proportional, antiproportional oder keins?' }[modus]);
    g.links.innerHTML = modus === 'rechteck' ? reLinks() : modus === 'dreisatz' ? dsLinks() : tyLinks();
    g.rechts.innerHTML = modus === 'rechteck' ? reRechts() : modus === 'dreisatz' ? dsRechts() : tyRechts();
    if (modus === 'rechteck') requestAnimationFrame(legePerlen);
  }
  function start() {
    g.sprich({
      rechteck: 'Schiebe den Regler: Die Perlen bleiben dieselben – nur die Form ändert sich. Was passiert mit der Höhe?',
      dreisatz: 'Erst auf 1 zurückrechnen, dann auf die gesuchte Anzahl. Achtung: gegensinnig!',
      typ: 'Schau dir die Tabelle an und entscheide. Danach siehst du Quotient, Produkt und Graph.',
    }[modus]);
  }
  /* Beim Rechteck nur die Perlen neu legen, damit sie gleiten */
  function reNeu() {
    g.links.querySelector('table')?.remove();
    const alt = root.querySelector('#ap-buehne');
    const html = reLinks(), tmp = document.createElement('div'); tmp.innerHTML = html;
    tmp.querySelector('#ap-buehne').replaceWith(alt);
    g.links.replaceChildren(...tmp.childNodes);
    g.rechts.innerHTML = reRechts();
    g.titel(`${re.n} Perlen – immer gleich viele`);
    legePerlen();
  }

  root.addEventListener('input', e => {
    if (e.target.matches('[data-breite]')) {
      const ts = teiler(re.n); re.x = ts[Number(e.target.value)]; re.besucht.add(re.x);
      reNeu();
      if (re.besucht.size === ts.length && !re.frage) g.sprich('Alle Rechtecke gefunden! Beantworte die Frage rechts.');
    }
    if (e.target.matches('[data-apein]')) { e.target.value = e.target.value.replace(/[^\d,.]/g, ''); eing[e.target.id] = e.target.value; }
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-apein]')) { e.preventDefault(); dsPruefen(); } });
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const tw = e.target.closest('[data-typw]');
    if (tw && !ty.wahl) { tyAntwort(tw.dataset.typw); return; }
    const rf = e.target.closest('[data-refrage]');
    if (rf) {
      re.antwort = rf.dataset.refrage;
      const ok = re.antwort === 'geteilt';
      bewertung = { ok, text: ok ? `Richtig: Doppelte (dreifache …) Breite → halbe (drittel …) Höhe. Das Produkt bleibt ${re.n}. So eine Zuordnung heißt antiproportional.` : 'Schau in die Tabelle: Wird die Höhe wirklich größer? Vergleiche die beiden Spalten.' };
      if (ok) g.sprich('Merke: y = k : x. Hier ist k = ' + re.n + '.', 'fertig');
      g.rechts.innerHTML = reRechts(); return;
    }
    const k = e.target.closest('[data-ap]');
    if (!k) return;
    const a = k.dataset.ap;
    if (a === 'neu') { neu(); zeichne(); start(); }
    if (a === 'kurve') { re.kurve = true; reNeu(); }
    if (a === 'dspruef') dsPruefen();
    if (a === 'tipp') g.sprich({
      rechteck: `Rechne für jede Breite: Breite · Höhe. Was fällt dir auf?`,
      dreisatz: ds?.schritt === 1 ? `Wie viel wäre es für 1 ${ESC(ds.kont.eins)}? Bei weniger ${ESC(ds.kont.a)} wird es mehr: ${zt(ds.k / ds.m)} · ${ds.m}.` : `Bei ${ds?.n} ${ESC(ds?.kont.a ?? '')} wird es weniger als für 1: ${zt(ds?.k)} : ${ds?.n}.`,
      typ: 'Rechne für jede Spalte y : x und x · y. Ist eins davon immer gleich?',
    }[modus], 'tipp');
  });

  neu(); zeichne(); start();
}
