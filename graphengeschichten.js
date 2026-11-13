/* Mathematik: Zuordnungen (Klasse 7) – Graphen-Geschichten.
   KLP NRW Funktionen (2): zu gegebenen Zuordnungen passende Sachsituationen beschreiben; Funktionen (4).
   „Gefäße füllen“  – Gleichmäßig läuft Wasser in ein Gefäß. Erst den passenden Graphen (Zeit → Füllhöhe) vorhersagen,
                      dann füllen: Wasser steigt im Bild, der Graph wächst mit.
   „Welcher Graph?“ – Eine Geschichte, drei Graphen. Welcher passt?
   „Erzähl’s!“      – Ein Graph mit Abschnitten A, B, C: erst jeden Abschnitt beschreiben (geprüft),
                      dann eine eigene Geschichte schreiben (frei); Beispielgeschichte auf Wunsch. */

import { geruest, wahl, mischen, zufall, ESC, antwortHtml } from './geruest.js';
import { zt, kosy, zug, stile } from './kosy.js';

/* ---------- Gefäße: halbe Breite w(h) für h von 0 (Boden) bis 1 (Rand) ---------- */
const GEFAESSE = [
  { id: 'zyl', name: 'Zylinder (überall gleich breit)', w: () => 0.45 },
  { id: 'kegel', name: 'unten breit, oben schmal', w: h => 0.75 - 0.5 * h },
  { id: 'trichter', name: 'unten schmal, oben breit', w: h => 0.25 + 0.5 * h },
  { id: 'bauch', name: 'bauchige Vase', w: h => 0.28 + 0.42 * Math.sin(Math.PI * h) },
  { id: 'stufe', name: 'unten breit, oben schmal (Stufe)', w: h => (h < 0.5 ? 0.7 : 0.3) },
  { id: 'stufe2', name: 'unten schmal, oben breit (Stufe)', w: h => (h < 0.5 ? 0.3 : 0.7) },
];
/* Füllhöhe als Funktion der Zeit (0…1), weil gleichmäßig Wasser zuläuft: Volumen ~ Integral von w(h)² */
function fuellkurve(gef, n = 400) {
  const V = [0];
  for (let i = 1; i <= n; i++) { const h = (i - 0.5) / n; V.push(V[i - 1] + gef.w(h) ** 2 / n); }
  const ges = V[n];
  return t => {   // t von 0 bis 1 → Höhe von 0 bis 1
    const ziel = t * ges; let i = 0;
    while (i < n && V[i + 1] < ziel) i++;
    const anteil = V[i + 1] === V[i] ? 0 : (ziel - V[i]) / (V[i + 1] - V[i]);
    return Math.min(1, (i + anteil) / n);
  };
}

/* ---------- Geschichten mit stückweise linearen Graphen: [Dauer, Änderung] ---------- */
const GESCHICHTEN = [
  { text: 'Mia fährt mit dem Rad zur Schule. Unterwegs wartet sie an einer roten Ampel. Danach fährt sie genauso schnell weiter.', x: 'Zeit (min)', y: 'Entfernung von zu Hause (km)', y0: 0,
    richtig: [[4, 1.6], [2, 0], [4, 1.6]], falsch: [[[4, 1.6], [6, 1.6]], [[2, 0], [8, 3.2]]] },
  { text: 'Tom geht langsam zum Bäcker. Dort kauft er Brötchen. Dann rennt er nach Hause.', x: 'Zeit (min)', y: 'Entfernung von zu Hause (m)', y0: 0,
    richtig: [[6, 600], [2, 0], [2, -600]], falsch: [[[2, 600], [2, 0], [6, -600]], [[6, 600], [2, 0], [2, 600]]] },
  { text: 'Ein Heißluftballon steigt gleichmäßig auf. Eine Weile bleibt er auf gleicher Höhe, dann sinkt er langsam wieder.', x: 'Zeit (min)', y: 'Höhe (m)', y0: 0,
    richtig: [[3, 600], [4, 0], [5, -600]], falsch: [[[3, 600], [4, 0], [1, -600]], [[6, 600], [6, -600]]] },
  { text: 'Ein Handy-Akku ist zu 80 % geladen. Beim Spielen wird er schnell leer, im Ruhemodus danach nur noch ganz langsam. Zum Schluss wird er aufgeladen.', x: 'Zeit (h)', y: 'Akku (%)', y0: 80,
    richtig: [[2, -50], [5, -10], [2, 60]], falsch: [[[2, -10], [5, -50], [2, 60]], [[2, -50], [5, 0], [2, -20]]] },
  { text: 'In eine Badewanne läuft Wasser. Dann wird der Hahn zugedreht und Lea steigt hinein. Nach dem Baden zieht sie den Stöpsel.', x: 'Zeit (min)', y: 'Wasserhöhe (cm)', y0: 0,
    richtig: [[6, 30], [0.4, 8], [8, 0], [0.4, -8], [4, -30]], falsch: [[[6, 30], [8.4, 0], [4.4, -30]], [[6, 30], [0.4, -8], [8, 0], [0.4, 8], [4, -30]]] },
  { text: 'Ein Zug fährt von Station A zu Station B. Dort hält er kurz und fährt dann zurück – auf dem Rückweg ist er langsamer.', x: 'Zeit (min)', y: 'Entfernung von A (km)', y0: 0,
    richtig: [[5, 10], [2, 0], [8, -10]], falsch: [[[8, 10], [2, 0], [5, -10]], [[5, 10], [2, 0], [8, 10]]] },
];
const punkte = (y0, seg) => { const p = [[0, y0]]; seg.forEach(([dt, dy]) => { const [x, y] = p[p.length - 1]; p.push([x + dt, y + dy]); }); return p; };

/* ---------- Erzähl's: Abschnitte und Kontexte ---------- */
const ARTEN = [
  { id: 'ss', name: 'steigt schnell', m: 3 }, { id: 'sl', name: 'steigt langsam', m: 1 }, { id: 'gl', name: 'bleibt gleich', m: 0 },
  { id: 'fl', name: 'fällt langsam', m: -1 }, { id: 'fs', name: 'fällt schnell', m: -3 },
];
const KONTEXTE = [
  { x: 'Zeit (min)', y: 'Entfernung von zu Hause (100 m)', start: 'Jonas startet', satz: { ss: 'rennt er schnell von zu Hause weg', sl: 'geht er gemütlich weiter weg', gl: 'bleibt er stehen und unterhält sich', fl: 'schlendert er langsam zurück Richtung Hause', fs: 'rennt er schnell zurück nach Hause' } },
  { x: 'Zeit (min)', y: 'Höhe eines Ballons (10 m)', start: 'Ein Ballon schwebt', satz: { ss: 'steigt er schnell nach oben', sl: 'steigt er langsam', gl: 'bleibt er auf derselben Höhe', fl: 'sinkt er langsam', fs: 'sinkt er schnell' } },
  { x: 'Zeit (h)', y: 'Wasser in der Regentonne (cm)', start: 'In einer Regentonne steht Wasser', satz: { ss: 'regnet es stark', sl: 'nieselt es leicht', gl: 'regnet es nicht und niemand nimmt Wasser heraus', fl: 'gießt jemand mit einer kleinen Kanne die Blumen', fs: 'wird mit einem Eimer viel Wasser abgeschöpft' } },
];
function neuErzaehl() {
  for (;;) {
    const arten = [wahl(ARTEN), wahl(ARTEN), wahl(ARTEN)];
    if (arten[0].id === arten[1].id || arten[1].id === arten[2].id) continue;
    const y0 = zufall(2, 6) * 2, seg = arten.map(a => [zufall(2, 4), 0]).map(([dt], i) => [dt, arten[i].m * dt]);
    const p = punkte(y0, seg);
    if (p.every(([, y]) => y >= 0 && y <= 24)) return { arten, y0, seg, p, kont: wahl(KONTEXTE), wahl: [null, null, null], geprueft: false, beispiel: false, text: '' };
  }
}

export function starteGraphenGeschichten(root) {
  stile();
  let modus = 'gefaesse', bewertung = null;
  let gf, wg, ez, anim = null;

  const g = geruest(root, {
    etikett: 'Zuordnungen', titel: '',
    reiter: [{ id: 'gefaesse', titel: 'Gefäße füllen', unter: 'vorhersagen, dann füllen' }, { id: 'welcher', titel: 'Welcher Graph?', unter: 'Geschichte → Graph' }, { id: 'erzaehl', titel: 'Erzähl’s!', unter: 'Graph → Geschichte' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-gg="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-gg="neu">＋ Neue Aufgabe</button>`,
  });

  /* ================= Gefäße ================= */
  function neuGefaess() {
    const gef = wahl(GEFAESSE);
    const andere = mischen(GEFAESSE.filter(x => x !== gef)).slice(0, 2);
    gf = { gef, karten: mischen([gef, ...andere]), wahl: null, t: 0, fertig: false };
  }
  function gefaessSvg(gef, t) {
    const W = 220, H = 250, unten = 230, hoehe = 200, cx = W / 2, sk = 120, n = 60;
    const kante = s => Array.from({ length: n + 1 }, (_, i) => { const h = i / n; return [cx + s * gef.w(h) * sk, unten - h * hoehe]; });
    const rechts = kante(1), links = kante(-1).reverse();
    const glas = `M${links[0][0]} ${links[0][1]} ` + links.map(([x, y]) => `L${x} ${y}`).join(' ') + ' ' + rechts.map(([x, y]) => `L${x} ${y}`).join(' ');
    const hNow = fuellkurve(gef)(t), m = Math.max(1, Math.round(hNow * n));
    const wr = rechts.slice(0, m + 1), wl = kante(-1).slice(0, m + 1).reverse();
    const yS = unten - hNow * hoehe;
    const wasser = t > 0 ? `M${wl[0][0]} ${yS} ` + wl.map(([x, y]) => `L${x} ${Math.max(y, yS)}`).join(' ') + ' ' + wr.map(([x, y]) => `L${x} ${Math.max(y, yS)}`).join(' ') + 'Z' : '';
    return `<svg class="zw-gefaess" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gefäß: ${ESC(gef.name)}">
      ${t > 0 && t < 1 ? `<rect x="${cx - 4}" y="0" width="8" height="${yS}" class="zw-wasser" opacity=".6"/>` : ''}
      <path d="${wasser}" class="zw-wasser"/><path d="${glas}" class="zw-glas"/></svg>`;
  }
  function fuellGraph(gef, bis = 1, klein = false) {
    const k = kosy({ W: klein ? 220 : 400, H: klein ? 170 : 280, xmax: 1.05, ymax: 1.1, xlab: 'Zeit', ylab: 'Füllhöhe', klein, xs: 0.25, ys: 0.25, gitter: true });
    const f = fuellkurve(gef), p = [];
    for (let i = 0; i <= 80 * bis; i++) p.push([i / 80, f(i / 80)]);
    return `<svg class="ks-svg${klein ? ' klein' : ''}" viewBox="0 0 ${k.W} ${k.H}" aria-hidden="${klein}">${k.svg.replace(/<text[^>]*class="ks-zahl[^"]*"[^>]*>[^<]*<\/text>/g, '')}${p.length > 1 ? `<path d="${zug(k, p)}" class="ks-graph"/>` : ''}</svg>`;
  }
  function gfLinks() {
    return `<p class="tl-geschichte">In das Gefäß läuft gleichmäßig Wasser (jede Sekunde gleich viel). Wie steigt die Füllhöhe?</p>
      <div class="zw-flex"><div id="gg-glas">${gefaessSvg(gf.gef, gf.t)}</div><div id="gg-live">${gf.t > 0 ? fuellGraph(gf.gef, gf.t) : ''}</div></div>
      <p class="zw-h">Welcher Graph passt? Wähle, bevor du füllst!</p>
      <div class="zw-karten">${gf.karten.map((k, i) => `<button type="button" class="zw-karte${gf.wahl === i ? (gf.fertig ? (k === gf.gef ? ' gut' : ' schlecht') : ' gewaehlt') : gf.fertig && k === gf.gef ? ' gut' : ''}" data-gfk="${i}">${fuellGraph(k, 1, true)}</button>`).join('')}</div>`;
  }
  function gfRechts() {
    return `<h2 class="bereich-titel">Gefäße füllen</h2>
      <p>Wo das Gefäß <b>schmal</b> ist, steigt das Wasser <b>schnell</b> – der Graph ist dort steil. Wo es <b>breit</b> ist …?</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-gg="fuellen" ${gf.wahl === null || anim ? 'disabled' : ''}>💧 Füllen</button></div>
      ${antwortHtml(bewertung)}
      ${gf.fertig ? '<p class="leise">Beschreibe im Heft: In welchem Abschnitt steigt die Höhe schnell, wo langsam? Warum?</p>' : ''}`;
  }
  function fuellen() {
    if (anim) return;
    const t0 = performance.now(), dauer = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : 3200;
    const schritt = jetzt => {
      gf.t = Math.min(1, (jetzt - t0) / dauer);
      const glas = root.querySelector('#gg-glas'), live = root.querySelector('#gg-live');
      if (!glas) { anim = null; return; }
      glas.innerHTML = gefaessSvg(gf.gef, gf.t); live.innerHTML = fuellGraph(gf.gef, gf.t);
      if (gf.t < 1) anim = requestAnimationFrame(schritt);
      else {
        anim = null; gf.fertig = true;
        const ok = gf.karten[gf.wahl] === gf.gef;
        bewertung = { ok, text: ok ? 'Richtig vorhergesagt!' : 'Vergleiche: Der Graph, der beim Füllen entstanden ist, ist grün umrandet.' };
        if (ok) g.sprich('Schmal → schnell steigend (steil), breit → langsam steigend (flach).', 'fertig');
        zeichne();
      }
    };
    anim = requestAnimationFrame(schritt);
    g.rechts.innerHTML = gfRechts();
  }

  /* ================= Welcher Graph? ================= */
  function neuWelcher() {
    const ge = wahl(GESCHICHTEN);
    wg = { ge, karten: mischen([{ seg: ge.richtig, ok: true }, ...ge.falsch.map(seg => ({ seg, ok: false }))]), wahl: null };
  }
  function segGraph(ge, seg, klein = true) {
    const p = punkte(ge.y0, seg);
    const alle = [ge.richtig, ...ge.falsch].flatMap(s => punkte(ge.y0, s));
    const xmax = Math.max(...alle.map(q => q[0])) * 1.08, ymax = Math.max(...alle.map(q => q[1])) * 1.12;
    const k = kosy({ W: klein ? 230 : 420, H: klein ? 170 : 290, xmax, ymax, klein, xlab: 't', ylab: 'y' });
    return `<svg class="ks-svg${klein ? ' klein' : ''}" viewBox="0 0 ${k.W} ${k.H}" aria-hidden="true">${k.svg}<path d="${zug(k, p)}" class="ks-graph"/></svg>`;
  }
  function wgLinks() {
    return `<p class="tl-geschichte">${ESC(wg.ge.text)}</p>
      <p class="leise">x-Achse: ${ESC(wg.ge.x)} · y-Achse: ${ESC(wg.ge.y)}</p>
      <div class="zw-karten">${wg.karten.map((k, i) => `<button type="button" class="zw-karte${wg.wahl === i ? (k.ok ? ' gut' : ' schlecht') : ''}" data-wgk="${i}" ${wg.wahl !== null && wg.karten[wg.wahl].ok ? 'disabled' : ''}>${segGraph(wg.ge, k.seg)}</button>`).join('')}</div>`;
  }
  function wgRechts() {
    return `<h2 class="bereich-titel">Welcher Graph erzählt die Geschichte?</h2>
      <p>Lies Satz für Satz und suche den passenden Abschnitt im Graphen.</p>
      <ul class="leise"><li>steigt → wird mehr / weiter weg</li><li>waagerecht → bleibt gleich</li><li>fällt → wird weniger / kommt näher</li><li>steil → schnell, flach → langsam</li></ul>${antwortHtml(bewertung)}`;
  }

  /* ================= Erzähl's ================= */
  function ezLinks() {
    const { p, kont } = ez;
    const xmax = p[p.length - 1][0] * 1.06, k = kosy({ W: 440, H: 300, xmax, ymax: 26, xlab: ESC(kont.x), ylab: ESC(kont.y), xs: 1, ys: 4 });
    let s = k.svg + `<path d="${zug(k, p)}" class="ks-graph"/>`;
    ['A', 'B', 'C'].forEach((b, i) => {
      const [x1, y1] = p[i], [x2, y2] = p[i + 1];
      s += `<circle cx="${k.X(x1)}" cy="${k.Y(y1)}" r="4" class="ks-punkt alt"/><text x="${(k.X(x1) + k.X(x2)) / 2}" y="${(k.Y(y1) + k.Y(y2)) / 2 - 12}" class="ks-wert" text-anchor="middle">${b}</text>`;
    });
    return `<svg class="ks-svg" viewBox="0 0 ${k.W} ${k.H}" role="img" aria-label="Graph mit den Abschnitten A, B und C">${s}</svg>
      <p class="leise">x-Achse: ${ESC(kont.x)} · y-Achse: ${ESC(kont.y)}</p>`;
  }
  function ezRechts() {
    const opt = i => `<select class="zw-auswahl${ez.geprueft ? (ez.wahl[i] === ez.arten[i].id ? ' gut' : ' schlecht') : ''}" data-ezsel="${i}"><option value="">– wählen –</option>${ARTEN.map(a => `<option value="${a.id}" ${ez.wahl[i] === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}</select>`;
    const alleRichtig = ez.geprueft && ez.wahl.every((w, i) => w === ez.arten[i].id);
    const beispiel = () => {
      const { kont, arten, seg } = ez;
      const wann = ['Zuerst', 'Danach', 'Zum Schluss'];
      return `${kont.start}. ${arten.map((a, i) => `${wann[i]} ${kont.satz[a.id]} (${seg[i][0]} ${kont.x.match(/\((.*)\)/)[1]}).`).join(' ')}`;
    };
    return `<h2 class="bereich-titel">Erzähle die Geschichte zum Graphen</h2>
      <p class="zw-h">1. Was passiert in jedem Abschnitt?</p>
      ${['A', 'B', 'C'].map((b, i) => `<p class="zw-zeile"><b>${b}:</b> Der Graph ${opt(i)}</p>`).join('')}
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-gg="ezpruef" ${ez.wahl.every(Boolean) ? '' : 'disabled'}>✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${alleRichtig ? `<p class="zw-h">2. Erfinde eine passende Geschichte</p>
        <textarea class="zw-text" data-eztext placeholder="Schreibe deine Geschichte hier oder ins Heft …">${ESC(ez.text)}</textarea>
        <div class="gs-pruef"><button type="button" class="kn-gross" data-gg="beispiel">📖 ${ez.beispiel ? 'Beispiel ausblenden' : 'Beispielgeschichte zeigen'}</button></div>
        ${ez.beispiel ? `<p class="tl-geschichte">${ESC(beispiel())}</p><p class="leise">Deine Geschichte darf ganz anders sein – Hauptsache, sie passt zu A, B und C!</p>` : ''}` : ''}`;
  }

  /* ================= gemeinsam ================= */
  function neu() {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    bewertung = null;
    if (modus === 'gefaesse') neuGefaess();
    if (modus === 'welcher') neuWelcher();
    if (modus === 'erzaehl') ez = neuErzaehl();
  }
  function zeichne() {
    g.reiter(modus);
    g.titel({ gefaesse: 'Wie schnell steigt das Wasser?', welcher: 'Geschichte und Graph', erzaehl: 'Ein Graph erzählt eine Geschichte' }[modus]);
    g.links.innerHTML = modus === 'gefaesse' ? gfLinks() : modus === 'welcher' ? wgLinks() : ezLinks();
    g.rechts.innerHTML = modus === 'gefaesse' ? gfRechts() : modus === 'welcher' ? wgRechts() : ezRechts();
  }
  function start() {
    g.sprich({
      gefaesse: 'Erst überlegen, dann füllen: Welcher Graph gehört zu diesem Gefäß?',
      welcher: 'Nur ein Graph passt zu allen Sätzen der Geschichte.',
      erzaehl: 'Beschreibe zuerst jeden Abschnitt. Dann erfindest du eine eigene Geschichte dazu.',
    }[modus]);
  }

  root.addEventListener('change', e => { if (e.target.matches('[data-ezsel]')) { ez.wahl[Number(e.target.dataset.ezsel)] = e.target.value || null; ez.geprueft = false; bewertung = null; g.rechts.innerHTML = ezRechts(); } });
  root.addEventListener('input', e => { if (e.target.matches('[data-eztext]')) ez.text = e.target.value; });
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const gk = e.target.closest('[data-gfk]');
    if (gk && !gf.fertig && !anim) { gf.wahl = Number(gk.dataset.gfk); zeichne(); return; }
    const wk = e.target.closest('[data-wgk]');
    if (wk && !(wg.wahl !== null && wg.karten[wg.wahl].ok)) {
      wg.wahl = Number(wk.dataset.wgk);
      const ok = wg.karten[wg.wahl].ok;
      bewertung = { ok, text: ok ? 'Richtig! Jeder Satz der Geschichte findet sich in einem Abschnitt wieder.' : 'Dieser Graph passt an einer Stelle nicht. Lies die Geschichte noch einmal Satz für Satz.' };
      if (ok) g.sprich('Begründe im Heft, warum die anderen beiden Graphen nicht passen.', 'fertig');
      zeichne(); return;
    }
    const k = e.target.closest('[data-gg]');
    if (!k) return;
    const a = k.dataset.gg;
    if (a === 'neu') { neu(); zeichne(); start(); }
    if (a === 'fuellen') fuellen();
    if (a === 'ezpruef') {
      ez.geprueft = true;
      const n = ez.wahl.filter((w, i) => w === ez.arten[i].id).length;
      bewertung = n === 3 ? { ok: true, text: 'Alle drei Abschnitte richtig beschrieben!' } : { ok: false, text: `${n} von 3 richtig. Achte auf die Richtung (steigt/fällt) und darauf, wie steil der Abschnitt ist.` };
      g.rechts.innerHTML = ezRechts();
    }
    if (a === 'beispiel') { ez.beispiel = !ez.beispiel; g.rechts.innerHTML = ezRechts(); }
    if (a === 'tipp') g.sprich({
      gefaesse: 'Stell dir vor, du gießt immer einen Becher hinein: Steigt das Wasser im schmalen Teil mehr oder weniger als im breiten?',
      welcher: 'Suche den Satz, in dem sich nichts ändert (Warten, Pause): Dort muss der Graph waagerecht sein.',
      erzaehl: 'Vergleiche die Abschnitte: Steigt der Graph, fällt er oder bleibt er waagerecht? Und wie steil?',
    }[modus], 'tipp');
  });

  neu(); zeichne(); start();
}
