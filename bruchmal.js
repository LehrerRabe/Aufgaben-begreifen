/* Mathematik: Brüche multiplizieren (Klasse 6).
   Stufe 1 „Bruch · Zahl“ (vervielfachen): k-mal den Bruch dazulegen (Stücke fliegen in den Ergebnis-Streifen) → Zähler · Zahl, Nenner bleibt.
   Stufe 2 „Bruch · Bruch“ (Anteil vom Anteil, Flächenmodell): 1. Spalten färben (zweiter Faktor), 2. Messer schneidet quer,
     3. Zeilen wählen (erster Faktor) → doppelt gefärbte Stücke, 4. Ergebnis: Zähler · Zähler, Nenner · Nenner. Danach kürzen. */

import { geruest, zufall, antwortHtml, bruchHtml, bruchFeld, zahlenMerken, ggT, warte } from './geruest.js';
import {
  meldungHtml, streifenSvg, streifenHoehe, stueckPos, schneidenQuer, flug, folgeKette, ketteFertig, ketteHtml, kettePruefen,
  liesBruch, merkeHtml, filmKnopf, ueber1Html, ueber1Lesen, ueber1Setzen, bruchWort, nennerName, zahlHtml, gleich, MESSER,
} from './bruchbild.js';
import { zeigeFilm, bruchSvg, textSvg } from './erklaerfilm.js';

export function neueMalAufgabe(stufe, ueber1) {
  for (let v = 0; v < 500; v++) {
    if (stufe === 'zahl') {
      const k = zufall(2, 5), b = zufall(3, 10), a = zufall(1, b - 1);
      if (ggT(a, b) !== 1) continue;
      if (ueber1 ? (k * a <= b || (k * a) % b === 0 || k * a > 3 * b) : k * a >= b) continue;
      return { k, a, b };
    }
    const q = zufall(2, 5), s = zufall(2, 6), p = zufall(1, q - 1), r = zufall(1, s - 1);
    if (ggT(p, q) !== 1 || ggT(r, s) !== 1 || q * s > 30) continue;
    return { p, q, r, s };
  }
  return stufe === 'zahl' ? { k: 3, a: 2, b: 7 } : { p: 2, q: 3, r: 3, s: 4 };
}

const FARBEN = ['a', 'c', 'd', 'e', 'f'];
const X = 104, W = 420, H = 50, ABST = 14;
const Q = { x: 170, y: 40, s: 300 }; // Quadrat (Stufe 2)

export function starteBruchMal(root) {
  let stufe = 'zahl', ueber1 = ueber1Lesen();
  let auf, phase, eing = {}, bewertung = null, laeuft = false, tippStufe = 0, kette;
  let runden, spalten, zeilen;

  const g = geruest(root, {
    etikett: 'Brüche',
    titel: 'Brüche multiplizieren',
    reiter: [{ id: 'zahl', titel: 'Bruch · Zahl', unter: '3 · ²⁄₅ – vervielfachen' }, { id: 'bruch', titel: 'Bruch · Bruch', unter: '⅔ · ¾ – Anteil vom Anteil' }],
    knoepfe: `${filmKnopf}<button type="button" class="kn-gross kn-tipp" data-bm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bm="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    auf = neueMalAufgabe(stufe, ueber1);
    root.dataset.aufgabe = JSON.stringify(auf); // für Tests
    phase = stufe === 'zahl' ? 'legen' : 'spalten';
    runden = 0; spalten = new Set(); zeilen = new Set(); kette = null;
    for (const k of Object.keys(eing)) delete eing[k];
    bewertung = null; tippStufe = 0;
  }
  const soll = () => (stufe === 'zahl' ? [auf.k * auf.a, auf.b] : [auf.p * auf.r, auf.q * auf.s]);

  /* ---------- Stufe 1: Bild ---------- */
  const ganzeErg = () => Math.max(1, Math.ceil((auf.k * auf.a) / auf.b));
  const optVorlage = () => ({ x: X, y: 14, w: W, h: H, N: auf.b, ganze: 1 });
  const optErg = () => ({ x: X, y: 14 + H + 46, w: W, h: H, N: auf.b, ganze: ganzeErg(), abstand: ABST });
  function bildZahl() {
    const oE = optErg(), hoehe = oE.y + streifenHoehe(oE.ganze, H, ABST) + 16;
    let s = `<svg class="br-svg" viewBox="0 0 640 ${hoehe}" role="img" aria-label="Bruchstreifen">`;
    s += `<text x="10" y="${14 + H / 2 + 6}" class="br-klein">1 ·</text>` + klein(70, 14 + H / 2, auf.a, auf.b);
    s += streifenSvg({ ...optVorlage(), id: 'v', art: i => (i < auf.a ? 'a' : 'leer') });
    s += `<text x="10" y="${oE.y + H / 2 + 6}" class="br-klein">${auf.k} ·</text>`;
    const gelegt = runden * auf.a;
    s += streifenSvg({ ...oE, id: 'e', art: i => (i < gelegt ? FARBEN[Math.floor(i / auf.a) % FARBEN.length] : 'leer') });
    for (let r = 0; r < runden; r++) {
      const p0 = stueckPos(oE, r * auf.a), p1 = stueckPos(oE, r * auf.a + auf.a - 1);
      if (p0.y === p1.y) s += `<text x="${(p0.x + p1.x + W / auf.b) / 2}" y="${p0.y - 6}" class="br-runde">${r + 1}.</text>`;
      else s += `<text x="${p0.x + 6}" y="${p0.y - 6}" class="br-runde" style="text-anchor:start">${r + 1}.</text>`;
    }
    return s + '</svg>';
  }
  const klein = (x, y, z, n) => { const b = Math.max(String(z).length, String(n).length) * 13 + 8; return `<g class="br-label"><text x="${x}" y="${y - 5}">${z}</text><line x1="${x - b / 2}" x2="${x + b / 2}" y1="${y}" y2="${y}"/><text x="${x}" y="${y + 19}">${n}</text></g>`; };

  /* ---------- Stufe 2: Quadrat ---------- */
  const geschnitten = () => ['zeilen', 'ergebnis', 'kette', 'fertig'].includes(phase);
  function bildBruch() {
    const { s: S } = auf, R = geschnitten() ? auf.q : 1, cw = Q.s / S, rh = Q.s / R;
    let s = `<svg class="br-svg" viewBox="0 0 640 ${Q.y + Q.s + 20}" role="img" aria-label="Quadrat als Ganzes">`;
    for (let c = 0; c < S; c++) for (let r = 0; r < R; r++) {
      const sp = spalten.has(c), ze = zeilen.has(r);
      s += `<rect x="${Q.x + c * cw}" y="${Q.y + r * rh}" width="${cw}" height="${rh}" class="br-st br-${sp && ze ? 'c' : sp ? 'a' : 'leer'}${ze && !sp ? ' br-zeile-an' : ''}"/>`;
    }
    // Spalten- und Zeilen-Knöpfe
    if (phase === 'spalten') for (let c = 0; c < S; c++) s += `<rect x="${Q.x + c * cw}" y="${Q.y}" width="${cw}" height="${Q.s}" class="br-wahl" data-spalte="${c}" role="button" tabindex="0" aria-label="Spalte ${c + 1}"/>`;
    if (phase === 'zeilen') for (let r = 0; r < R; r++) s += `<rect x="${Q.x}" y="${Q.y + r * rh}" width="${Q.s}" height="${rh}" class="br-wahl" data-zeile="${r}" role="button" tabindex="0" aria-label="Zeile ${r + 1}"/>`;
    for (let c = 1; c < S; c++) s += `<line x1="${Q.x + c * cw}" x2="${Q.x + c * cw}" y1="${Q.y}" y2="${Q.y + Q.s}" class="br-linie"/>`;
    for (let r = 1; r < R; r++) s += `<line x1="${Q.x}" x2="${Q.x + Q.s}" y1="${Q.y + r * rh}" y2="${Q.y + r * rh}" class="br-linie"/>`;
    s += `<rect x="${Q.x}" y="${Q.y}" width="${Q.s}" height="${Q.s}" rx="3" class="br-rand"/>`;
    // Beschriftung: oben der zweite Faktor, links der erste
    s += `<text x="${Q.x + Q.s / 2}" y="${Q.y - 12}" class="br-achse a">${spalten.size} von ${auf.s} Spalten</text>`;
    if (geschnitten()) s += `<text x="${Q.x - 14}" y="${Q.y + Q.s / 2}" class="br-achse b" transform="rotate(-90 ${Q.x - 14} ${Q.y + Q.s / 2})">${zeilen.size} von ${auf.q} Zeilen</text>`;
    return s + '</svg>';
  }

  /* ---------- Rechts ---------- */
  const zeile = (nr, t, f) => `<p class="vz-schritt${f ? ' fertig' : ''}">${f ? '✓' : nr + '.'} ${t}</p>`;
  const aufgabeHtml = () => (stufe === 'zahl' ? `${auf.k} · ${bruchHtml(auf.a, auf.b)}` : `${bruchHtml(auf.p, auf.q)} · ${bruchHtml(auf.r, auf.s)}`);
  function rechts() {
    let h = `<h2 class="bereich-titel">Aufgabe</h2><div class="rr-gross br-aufgabe">${aufgabeHtml()} = ?</div>`;
    if (stufe === 'zahl') {
      const ord = ['legen', 'ergebnis', 'kette', 'fertig'], pos = ord.indexOf(phase);
      h += `<p class="leise br-deutung">${auf.k} · ${bruchHtml(auf.a, auf.b)} heißt: ${auf.k}-mal ${bruchHtml(auf.a, auf.b)} – also ${Array(auf.k).fill(bruchHtml(auf.a, auf.b)).join(' + ')}</p>`;
      h += zeile(1, `${auf.k}-mal ${bruchHtml(auf.a, auf.b)} hinlegen`, pos > 0);
      if (phase === 'legen') h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-bm="legen" ${laeuft ? 'disabled' : ''}>＋ ${bruchHtml(auf.a, auf.b)} dazulegen</button><span class="br-zaehler">${runden} von ${auf.k}</span></div>`;
      if (pos >= 1) {
        h += zeile(2, 'Ergebnis als Bruch', pos > 1);
        if (phase === 'ergebnis') h += `<div class="gs-pruef br-gl">${aufgabeHtml()} = ${bruchFeld('bm-ez', 'bm-en', eing)}<button type="button" class="kn-gross" data-bm="pruefen">✓ Prüfen</button></div>`;
        else h += `<p class="br-kette-zeile">${aufgabeHtml()} = ${bruchHtml(`${auf.k} · ${auf.a}`, auf.b)} = ${bruchHtml(kette.alt.z, kette.alt.n)}</p>`;
      }
    } else {
      const ord = ['spalten', 'schneiden', 'zeilen', 'ergebnis', 'kette', 'fertig'], pos = ord.indexOf(phase);
      h += `<p class="leise br-deutung">${bruchHtml(auf.p, auf.q)} · ${bruchHtml(auf.r, auf.s)} heißt: ${bruchHtml(auf.p, auf.q)} <b>von</b> ${bruchHtml(auf.r, auf.s)}</p>`;
      h += zeile(1, `Färbe ${bruchHtml(auf.r, auf.s)} des Quadrats: tippe ${auf.r} von ${auf.s} Spalten an`, pos > 0);
      if (pos >= 1) {
        h += zeile(2, `Schneide quer in ${auf.q} gleiche Zeilen`, pos > 1);
        if (phase === 'schneiden') h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-bm="schneiden" ${laeuft ? 'disabled' : ''}>🔪 Quer schneiden</button></div>`;
      }
      if (pos >= 2) h += zeile(3, `Nimm ${bruchHtml(auf.p, auf.q)} davon: tippe ${auf.p} von ${auf.q} Zeilen an`, pos > 2);
      if (pos >= 3) {
        h += zeile(4, 'Grüne Stücke zählen – und alle Stücke', pos > 3);
        if (phase === 'ergebnis') h += `<p class="leise">Grün sind die Stücke, die zu beiden gehören. Wie groß ist ein Stück?</p>
          <div class="gs-pruef br-gl">${aufgabeHtml()} = ${bruchFeld('bm-ez', 'bm-en', eing)}<button type="button" class="kn-gross" data-bm="pruefen">✓ Prüfen</button></div>`;
        else h += `<p class="br-kette-zeile">${aufgabeHtml()} = ${bruchHtml(`${auf.p} · ${auf.r}`, `${auf.q} · ${auf.s}`)} = ${bruchHtml(kette.alt.z, kette.alt.n)}</p>`;
      }
    }
    if (kette) h += ketteHtml(kette, eing, 'bm');
    if (phase === 'fertig') h += `<p class="br-fertig" data-fertig>Fertig!</p>`;
    h += meldungHtml(bewertung, phase === 'fertig');
    h += merkeHtml('Merke', `<p><b>Bruch · Zahl:</b> Zähler mal Zahl, der Nenner bleibt (die Stücke bleiben gleich groß, es werden nur mehr).</p>
      <p class="br-merke-bsp">3 · ${bruchHtml(2, 5)} = ${bruchHtml('3 · 2', 5)} = ${bruchHtml(6, 5)}</p>
      <p><b>Bruch · Bruch:</b> Zähler mal Zähler, Nenner mal Nenner. „·“ heißt hier „von“: ${bruchHtml(2, 3)} · ${bruchHtml(3, 4)} ist ${bruchHtml(2, 3)} von ${bruchHtml(3, 4)}.</p>
      <p class="br-merke-bsp">${bruchHtml(2, 3)} · ${bruchHtml(3, 4)} = ${bruchHtml('2 · 3', '3 · 4')} = ${bruchHtml(6, 12)} = ${bruchHtml(1, 2)}</p>
      <p class="leise">Tipp: Man darf schon vor dem Ausrechnen kürzen (über Kreuz).</p>`);
    return h;
  }

  function links() {
    if (stufe === 'zahl') return ueber1Html(ueber1, 'Ergebnis größer als 1') + `<div class="br-bild">${bildZahl()}</div>`
      + `<div class="br-unter"><p class="br-zaehler">${!runden ? 'Oben siehst du einmal den Bruch.' : phase === 'legen' ? `${runden}-mal gelegt` : phase === 'ergebnis' ? `Zähle die ${nennerName(auf.b)} unten.` : `Gelegt: <b>${runden * auf.a}</b> ${nennerName(auf.b)}`}</p></div>`;
    return `<div class="br-bild br-bild-quadrat">${bildBruch()}</div><div class="br-unter"><p class="br-zaehler">${zaehlerText()}</p></div>`;
  }
  function zaehlerText() {
    if (phase === 'spalten') return `Blau gefärbt: <b>${spalten.size}</b> von ${auf.s} Spalten`;
    if (phase === 'schneiden') return `Blau: ${bruchHtml(auf.r, auf.s)} des Quadrats`;
    if (phase === 'zeilen') return `Gewählt: <b>${zeilen.size}</b> von ${auf.q} Zeilen`;
    if (phase === 'ergebnis') return 'Zähle die grünen Stücke – und alle Stücke des Quadrats.';
    return `Grün: <b>${auf.p * auf.r}</b> Stücke · Ganzes: <b>${auf.q * auf.s}</b> Stücke`;
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); g.reiter(stufe); }

  /* ---------- Ablauf ---------- */
  async function legen() {
    if (laeuft || runden >= auf.k) return;
    laeuft = true;
    const start = runden * auf.a;
    runden++;
    zeichne();
    const oV = optVorlage(), oE = optErg();
    await Promise.all(Array.from({ length: auf.a }, (_, j) => {
      const q = stueckPos(oV, j), z = stueckPos(oE, start + j);
      return warte(j * 60).then(() => flug(root.querySelector(`.br-streifen[data-sid="e"] [data-i="${start + j}"]`), q.x - z.x, q.y - z.y, 520));
    }));
    laeuft = false;
    if (runden === auf.k) {
      phase = 'ergebnis'; zeichne();
      g.sprich(`${auf.k}-mal ${bruchWort(auf.a, auf.b)} liegen unten. Wie viele ${nennerName(auf.b)} sind das zusammen?`);
      root.querySelector('#bm-ez')?.focus({ preventScroll: true });
    } else { zeichne(); g.sprich(`${runden}-mal gelegt. Noch ${auf.k - runden}-mal!`); }
  }

  function spalteTippen(c) {
    if (phase !== 'spalten') return;
    spalten.has(c) ? spalten.delete(c) : spalten.add(c);
    bewertung = null;
    if (spalten.size === auf.r) {
      phase = 'schneiden'; zeichne();
      g.sprich(`${bruchWort(auf.r, auf.s)} sind blau. Jetzt brauchst du ${bruchWort(auf.p, auf.q)} davon – schneide quer in ${auf.q} Zeilen.`);
    } else {
      zeichne();
      if (spalten.size > auf.r) g.sprich(`Das sind zu viele: Du brauchst nur ${auf.r} Spalten. Tippe eine Spalte nochmal an, um sie wieder abzuwählen.`, 'tipp');
    }
  }
  async function quer() {
    if (phase !== 'schneiden' || laeuft) return;
    laeuft = true; zeichne();
    await schneidenQuer(root.querySelector('.br-svg'), { x: Q.x, y: Q.y, w: Q.s, h: Q.s }, auf.q);
    laeuft = false;
    phase = 'zeilen'; zeichne();
    g.sprich(`Jetzt gibt es ${auf.q} Zeilen. Tippe ${auf.p} davon an – das ist ${bruchWort(auf.p, auf.q)}.`);
  }
  function zeileTippen(r) {
    if (phase !== 'zeilen') return;
    zeilen.has(r) ? zeilen.delete(r) : zeilen.add(r);
    if (zeilen.size === auf.p) {
      phase = 'ergebnis'; zeichne();
      g.sprich(`Grün ist ${bruchWort(auf.p, auf.q)} von ${bruchWort(auf.r, auf.s)}. Zähle: Wie viele grüne Stücke? Wie viele Stücke hat das ganze Quadrat?`);
      root.querySelector('#bm-ez')?.focus({ preventScroll: true });
    } else zeichne();
  }

  function pruefe() {
    const e = liesBruch(eing, 'bm-ez', 'bm-en');
    if (!e || !e.n) { bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' }; return zeichne(); }
    const [sz, sn] = soll();
    if (gleich(e.z, e.n, sz, sn)) {
      kette = folgeKette(e.z, e.n, stufe === 'zahl' ? ueber1 : false);
      kette.alt = { z: e.z, n: e.n };
      bewertung = { ok: true, text: `Richtig: ${bruchHtml(e.z, e.n)}` };
      phase = ketteFertig(kette) ? 'fertig' : 'kette';
      zeichne();
      g.sprich(phase === 'fertig' ? 'Super gerechnet!' : kette.schritte[0].art === 'kuerzen' ? 'Richtig! Kann man noch kürzen?' : kette.schritte[0].art === 'ganz' ? 'Richtig! Das ist sogar eine ganze Zahl.' : 'Richtig! Schreibe es noch als gemischte Zahl.', phase === 'fertig' ? 'fertig' : 'info');
      return;
    }
    if (stufe === 'zahl') {
      if (e.z === auf.k * auf.a && e.n === auf.k * auf.b) bewertung = { ok: false, text: 'Den Nenner nicht mal nehmen! Die Stücke bleiben gleich groß – es werden nur mehr Stücke.' };
      else if (e.n !== auf.b) bewertung = { ok: false, text: `Die Stücke im Bild sind ${nennerName(auf.b)} – der Nenner bleibt ${auf.b}.` };
      else bewertung = { ok: false, text: `Zähle die farbigen Stücke unten – oder rechne ${auf.k} · ${auf.a}.` };
    } else {
      if (e.z === auf.p * auf.r && e.n !== auf.q * auf.s) bewertung = { ok: false, text: `Der Zähler stimmt. Wie viele Stücke hat das <b>ganze</b> Quadrat? (${auf.q} Zeilen · ${auf.s} Spalten)` };
      else if (e.n === auf.q * auf.s) bewertung = { ok: false, text: `Der Nenner stimmt. Zähle nur die <b>grünen</b> Stücke (${auf.p} Zeilen · ${auf.r} Spalten).` };
      else if (e.z === auf.p + auf.r || e.n === auf.q + auf.s) bewertung = { ok: false, text: 'Beim Malnehmen wird nicht addiert. Zähle die Stücke im Bild.' };
      else bewertung = { ok: false, text: 'Zähle im Bild: grüne Stücke oben in den Bruch, alle Stücke unten.' };
    }
    zeichne();
  }
  function pruefeKette() {
    bewertung = kettePruefen(kette, eing, 'bm');
    if (ketteFertig(kette)) { phase = 'fertig'; g.sprich('Super gerechnet!', 'fertig'); }
    zeichne();
  }

  function tipp() {
    tippStufe++;
    const t = {
      legen: ['Tippe auf „dazulegen“ – jedes Mal kommt der Bruch noch einmal dazu.'],
      spalten: [`Das Quadrat ist in ${auf.s} Spalten geteilt. Tippe ${auf.r} Spalten an.`],
      schneiden: ['Tippe auf „Quer schneiden“.'],
      zeilen: [`Tippe ${auf.p} der ${auf.q} Zeilen an.`],
      ergebnis: stufe === 'zahl'
        ? [`Der Nenner bleibt ${auf.b}. Wie viele Stücke liegen unten?`, `Zähler: ${auf.k} · ${auf.a} = ?`]
        : [`Ein kleines Stück ist ein ${nennerName(auf.q * auf.s).replace(/l$/, 'l')} vom Quadrat: ${auf.q} · ${auf.s} = ${auf.q * auf.s} Stücke.`, `Zähler · Zähler: ${auf.p} · ${auf.r}, Nenner · Nenner: ${auf.q} · ${auf.s}`],
      kette: [kette?.schritte[kette.i]?.art === 'gemischt' ? 'Wie viele Ganze passen hinein? Der Rest bleibt als Bruch.' : 'Suche eine Zahl, durch die Zähler und Nenner beide teilbar sind.'],
    }[phase];
    if (!t) return g.sprich('Fertig! Mit „Neue Aufgabe“ geht es weiter.', 'tipp');
    g.sprich(t[Math.min(tippStufe, t.length) - 1], 'tipp');
  }

  function start() {
    g.sprich(stufe === 'zahl' ? `Malnehmen mit einer Zahl heißt: mehrmals dazulegen.` : `„Mal“ heißt hier „von“: Erst ${bruchWort(auf.r, auf.s)} färben, dann ${bruchWort(auf.p, auf.q)} davon nehmen.`);
  }

  root.addEventListener('click', e => {
    const sp = e.target.closest('[data-spalte]'); if (sp) return spalteTippen(+sp.dataset.spalte);
    const ze = e.target.closest('[data-zeile]'); if (ze) return zeileTippen(+ze.dataset.zeile);
    const r = e.target.closest('[data-reiter]');
    if (r && !laeuft) { stufe = r.dataset.reiter; neu(); zeichne(); start(); return; }
    const u = e.target.closest('[data-ueber1]');
    if (u && !laeuft) { ueber1 = u.dataset.ueber1 === '1'; ueber1Setzen(ueber1); neu(); zeichne(); start(); return; }
    if (e.target.closest('[data-film]')) return zeigeFilm('Brüche multiplizieren', filmMal());
    if (e.target.closest('[data-kette="pruefen"]')) return pruefeKette();
    const b = e.target.closest('[data-bm]');
    if (!b) return;
    const a = b.dataset.bm;
    if (a === 'neu' && !laeuft) { neu(); zeichne(); start(); }
    if (a === 'tipp') tipp();
    if (a === 'legen') legen();
    if (a === 'schneiden') quer();
    if (a === 'pruefen' && phase === 'ergebnis') pruefe();
  });
  root.addEventListener('keydown', e => {
    const t = e.target.closest?.('[data-spalte], [data-zeile]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.dataset.spalte ? spalteTippen(+t.dataset.spalte) : zeileTippen(+t.dataset.zeile); }
  });

  neu(); zeichne(); start();
}

/* ====================== Erklärfilm ====================== */
function filmMal() {
  const FX = 120, FW = 400, FH = 44, y1 = 30, y2 = 120;
  const st = (y, N, art, { x = FX, w = FW, bis = N, klasse = '' } = {}) => {
    let s = `<g class="${klasse}">`;
    for (let j = 0; j < N; j++) s += `<rect x="${x + j * w / N}" y="${y}" width="${w / N}" height="${FH}" class="br-st br-${j < bis ? art(j) : 'leer'}"/>`;
    return s + `<rect x="${x}" y="${y}" width="${w}" height="${FH}" rx="3" class="br-rand"/></g>`;
  };
  const teil = (y, N, j, art, klasse) => `<rect x="${FX + j * FW / N}" y="${y}" width="${FW / N}" height="${FH}" class="br-st br-${art} ${klasse}"/>`;
  const ein = [{ opacity: 0 }, { opacity: 1 }];
  const pop = [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }];
  const quadrat = (x, y, s, S, R, art) => {
    let q = '';
    for (let c = 0; c < S; c++) for (let r = 0; r < R; r++) q += `<rect x="${x + c * s / S}" y="${y + r * s / R}" width="${s / S}" height="${s / R}" class="br-st br-${art(c, r)}"/>`;
    for (let c = 1; c < S; c++) q += `<line x1="${x + c * s / S}" x2="${x + c * s / S}" y1="${y}" y2="${y + s}" class="br-linie"/>`;
    return q + `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="3" class="br-rand"/>`;
  };
  const QX = 200, QY = 30, QS = 240;
  const quer = k => Array.from({ length: k - 1 }, (_, t) => `<line x1="${QX}" x2="${QX + QS}" y1="${QY + (t + 1) * QS / k}" y2="${QY + (t + 1) * QS / k}" class="br-schnitt quer ef-q" style="stroke-dasharray:${QS};"/>`).join('');
  const farbe = ['a', 'c', 'd'];
  return [
    { text: '3 · {2/5} heißt: 3-mal {2/5}. Oben siehst du {2/5} einmal.', dauer: 5200,
      bild: `${bruchSvg(60, y1 + 20, 2, 5, 24, 'ef-a')}${st(y1, 5, () => 'a', { bis: 2 })}${textSvg(40, y2 + 30, '3 ·', 26)}${st(y2, 5, () => 'leer')}${st(y2 + 62, 5, () => 'leer')}`,
      anim: [['.br-a', pop, { duration: 500, stufe: 300 }]] },
    { text: 'Wir legen {2/5} dreimal hin: {2/5} + {2/5} + {2/5}. Ein Ganzes reicht nicht – wir brauchen ein zweites.', dauer: 7000,
      bild: `${st(y1, 5, () => 'a', { bis: 2 })}${textSvg(40, y2 + 30, '3 ·', 26)}${st(y2, 5, () => 'leer')}${st(y2 + 62, 5, () => 'leer')}
        ${[0, 1, 2, 3, 4, 5].map(i => teil(i < 5 ? y2 : y2 + 62, 5, i % 5, farbe[Math.floor(i / 2)], `f f${i}`)).join('')}`,
      anim: [0, 1, 2, 3, 4, 5].map(i => [`.f${i}`, [{ transform: `translate(${((i % 2) - (i % 5)) * 80}px, ${-((i < 5 ? y2 : y2 + 62) - y1)}px)`, opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 800, delay: 500 + Math.floor(i / 2) * 1500 + (i % 2) * 100 }]) },
    { text: 'Zusammen sind es 6 Fünftel: 3 · {2/5} = {6/5} = 1 {1/5}. Nur der Zähler wird mal 3 genommen – die Stücke bleiben Fünftel.', dauer: 7600,
      bild: `${st(y2 - 70, 5, j => farbe[Math.floor(j / 2)])}${st(y2 - 8, 5, () => 'd', { bis: 1 })}
        <g class="gl">${textSvg(150, 250, '3 ·', 34)}${bruchSvg(215, 238, 2, 5, 34, 'ef-a')}${textSvg(265, 250, '=', 34)}${bruchSvg(330, 238, '3 · 2', 5, 34, 'ef-c')}${textSvg(395, 250, '=', 34)}${bruchSvg(445, 238, 6, 5, 34, 'ef-c')}</g>`,
      anim: [['.gl', ein, { duration: 700, delay: 900 }]] },
    { text: 'Und {2/3} · {3/4}? Das heißt: {2/3} von {3/4}. Zuerst färben wir {3/4} vom Quadrat.', dauer: 6400,
      bild: `${quadrat(QX, QY, QS, 4, 1, c => (c < 3 ? 'a' : 'leer'))}${textSvg(QX + QS / 2, QY + QS + 34, '3 von 4 Spalten', 24, 'ef-leise')}`,
      anim: [['.br-a', [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 800, stufe: 400 }]] },
    { text: 'Das Messer schneidet quer in 3 Zeilen. 2 Zeilen davon sind {2/3} vom blauen Teil – die doppelt gefärbten Stücke werden grün.', dauer: 8000,
      bild: `${quadrat(QX, QY, QS, 4, 3, (c, r) => (c < 3 && r < 2 ? 'c' : c < 3 ? 'a' : 'leer'))}<g class="vorher">${quadrat(QX, QY, QS, 4, 1, c => (c < 3 ? 'a' : 'leer'))}</g>${quer(3)}`,
      anim: [['.ef-q', [{ strokeDashoffset: QS }, { strokeDashoffset: 0 }], { duration: 700, delay: 500, stufe: 800 }], ['.vorher', [{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], { duration: 2400, delay: 2200 }]] },
    { text: 'Grün sind 2 · 3 = 6 Stücke. Das ganze Quadrat hat 3 · 4 = 12 Stücke. Also {2/3} · {3/4} = {6/12} = {1/2}.', dauer: 8000,
      bild: `<g transform="translate(-90 0)">${quadrat(QX, QY, QS, 4, 3, (c, r) => (c < 3 && r < 2 ? 'c' : c < 3 ? 'a' : 'leer'))}${quer(3)}</g>
        <g class="gl">${bruchSvg(450, 120, '2 · 3', '3 · 4', 30, 'ef-c')}${textSvg(530, 131, '=', 30)}${bruchSvg(580, 120, 6, 12, 30, 'ef-c')}${textSvg(500, 230, '= ½', 34, 'ef-merke')}</g>`,
      anim: [['.gl', ein, { duration: 700, delay: 1500 }]] },
    { text: 'Merke: Bruch mal Zahl – Zähler mal Zahl, Nenner bleibt. Bruch mal Bruch – Zähler mal Zähler, Nenner mal Nenner.', dauer: 7200,
      bild: `${['Bruch · Zahl:', 'Zähler · Zahl, Nenner bleibt', 'Bruch · Bruch:', 'Zähler · Zähler, Nenner · Nenner'].map((t, k) => `<g class="regel">${textSvg(70, 70 + k * 62, t, k % 2 ? 28 : 30, k % 2 ? 'ef-merke' : 'ef-leise', 'start')}</g>`).join('')}`,
      anim: [['.regel', [{ transform: 'translate(0px,-20px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, stufe: 1100 }]] },
  ];
}
