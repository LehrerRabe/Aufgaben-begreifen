/* Mathematik: Periodisch per Division (Klasse 6, UV „Brüche in Dezimalschreibweise“ → Ausblick / UV schriftliche Division).
   Zähler : Nenner schriftlich, Schritt für Schritt: Rest · 10, durch den Nenner teilen → nächste Ziffer und neuer Rest.
   Die Reste-Leiste sammelt alle Reste. Rest 0 → die Division geht auf → abbrechende Dezimalzahl.
   Kommt ein Rest zum zweiten Mal, wiederholt sich ab da alles → periodische Dezimalzahl (Periodenstrich). */

import { geruest, wahl, antwortHtml, bruchHtml, ESC } from './geruest.js';

const BRUECHE = [[1, 3], [2, 3], [1, 6], [5, 6], [1, 7], [3, 7], [2, 9], [5, 9], [4, 11], [17, 11], [5, 12], [1, 12], [7, 15], [2, 15],
  [7, 3], [3, 8], [7, 16], [9, 40], [7, 4], [25, 8], [3, 20], [1, 13]];
const MAX = 8;

/** vollständige Division: Ziffern, Reste, Beginn und Länge der Periode */
function teile(z, n) {
  const q0 = Math.floor(z / n); let r = z % n;
  const schritte = [], gesehen = new Map([[r, 0]]);
  while (r !== 0 && schritte.length < 12) {
    const x = r * 10, d = Math.floor(x / n), r2 = x % n;
    schritte.push({ r, x, d, r2 });
    r = r2;
    if (gesehen.has(r)) return { q0, r0: z % n, schritte, start: gesehen.get(r), periodisch: true };
    gesehen.set(r, schritte.length);
  }
  return { q0, r0: z % n, schritte, start: -1, periodisch: false };
}
const dezText = (t, mitStrich = true) => {
  const ziff = t.schritte.map(s => s.d).join('');
  if (!t.periodisch) return `${t.q0},${ziff}`;
  const vor = ziff.slice(0, t.start), per = ziff.slice(t.start);
  return mitStrich ? `${t.q0},${vor}<span class="pd-strich">${per}</span>` : `${t.q0},${vor}${per}${per}…`;
};

const STIL = `<style id="pd-stil">
.pd-auf { font: 800 clamp(1.8rem, 5vw, 2.6rem)/1.2 var(--titel); display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
.pd-rech { font: 700 1.35rem/1 var(--schrift); font-variant-numeric: tabular-nums; border-collapse: collapse; margin: .6rem 0; }
.pd-rech td { padding: .25rem .45rem; }
.pd-rech tr.neu td { background: color-mix(in srgb, var(--akzent) 10%, transparent); }
.pd-rech tr.wdh td { background: var(--tipp); }
.pd-rech .gs-ein { width: 3.2rem; font-size: 1.2rem; padding: .2rem; }
.pd-rech .leise { font-size: .95rem; font-weight: 400; }
.pd-reste { display: flex; flex-wrap: wrap; gap: .4rem; margin: .5rem 0; align-items: center; }
.pd-rest { min-width: 2.4rem; height: 2.4rem; border-radius: 50%; display: inline-grid; place-items: center; font-weight: 800; background: var(--bg); border: 2px solid var(--rand); }
.pd-rest.wdh { background: var(--tipp); border-color: #c99a00; }
.pd-rest.null { background: var(--gut-sanft); border-color: var(--gut); }
.pd-erg { font: 800 clamp(1.6rem, 5vw, 2.4rem) var(--titel); }
.pd-strich { text-decoration: overline; text-decoration-thickness: 3px; }
.pd-merk { line-height: 1.7; margin-top: .6rem; padding: .5rem .7rem; border-left: 4px solid var(--akzent); background: color-mix(in srgb, var(--akzent) 10%, transparent); border-radius: 6px; }
.pd-wahl { display: flex; gap: .5rem; flex-wrap: wrap; margin: .5rem 0; }
</style>`;

export function startePeriode(root) {
  let z, n, T, fertig, eing = {}, bewertung = null, art = null, letzte = '';

  const g = geruest(root, {
    etikett: 'Dezimalzahlen', titel: 'Periodisch per Division',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-pd="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-pd="vormachen">▶ Schritt vormachen</button>
      <button type="button" class="kn-gross kn-leise" data-pd="neu">＋ Neue Aufgabe</button>`,
  });
  root.insertAdjacentHTML('afterbegin', STIL);

  function neu() {
    let b; do { b = wahl(BRUECHE); } while (`${b}` === letzte); letzte = `${b}`;
    [z, n] = b; T = teile(z, n); fertig = 0; eing = {}; bewertung = null; art = null;
  }
  const ende = () => (T.periodisch ? T.schritte.length : T.schritte.length);   // Anzahl Schritte bis Wiederholung/Rest 0
  const geschafft = () => fertig >= ende() || fertig >= MAX;

  function rechnung() {
    let h = `<tr><td colspan="4"><b>${z} : ${n} = ${T.q0}</b> Rest <b>${T.r0}</b> <span class="leise">→ ${T.q0} vor dem Komma</span></td></tr>`;
    T.schritte.slice(0, Math.min(ende(), MAX)).forEach((s, i) => {
      if (i > fertig) return;
      const aktiv = i === fertig && !geschafft();
      const wdh = geschafft() && T.periodisch && (i === T.start || i === ende() - 1);
      h += `<tr class="${aktiv ? 'neu' : ''}${wdh ? ' wdh' : ''}"><td>Rest ${s.r} · 10 = <b>${s.x}</b></td><td>${s.x} : ${n} =</td>
        <td>${aktiv ? `<input class="gs-ein" id="pd-d" data-pdein inputmode="numeric" maxlength="1" value="${ESC(eing['pd-d'] ?? '')}" aria-label="nächste Ziffer">` : `<b>${s.d}</b>`}</td>
        <td>Rest ${aktiv ? `<input class="gs-ein" id="pd-r" data-pdein inputmode="numeric" maxlength="3" value="${ESC(eing['pd-r'] ?? '')}" aria-label="neuer Rest">` : `<b>${s.r2}</b>`}</td></tr>`;
    });
    return `<table class="pd-rech" aria-label="schriftliche Division">${h}</table>`;
  }

  function reste() {
    const liste = [T.r0, ...T.schritte.slice(0, Math.min(fertig, MAX)).map(s => s.r2)];
    const wiederholt = geschafft() && T.periodisch ? T.schritte[ende() - 1].r2 : null;
    return `<div class="pd-reste"><span class="leise">Reste:</span>${liste.map(r => `<span class="pd-rest${r === 0 ? ' null' : ''}${r === wiederholt ? ' wdh' : ''}">${r}</span>`).join('')}</div>`;
  }

  function zwischen() {
    const ziff = T.schritte.slice(0, fertig).map(s => s.d).join('');
    return `<p class="pd-erg">${bruchHtml(z, n)} = ${geschafft() && art ? dezText(T) : `${T.q0},${ziff}${geschafft() ? '' : '…'}`}</p>`;
  }

  function rechts() {
    let h = '';
    if (!geschafft()) {
      h = `<h2 class="bereich-titel">Nächste Ziffer und neuer Rest</h2><p>Teile ${T.schritte[fertig].x} durch ${n}. Wie oft passt ${n} hinein, und was bleibt übrig?</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pd="pruefen">✓ Prüfen</button></div>`;
    } else if (!art) {
      h = `<h2 class="bereich-titel">Was ist passiert?</h2><p>${T.periodisch ? `Der Rest <b>${T.schritte[ende() - 1].r2}</b> war schon einmal da.` : 'Der Rest ist <b>0</b>.'} Was für eine Dezimalzahl ist ${bruchHtml(z, n, 'klein')}?</p>
        <div class="pd-wahl"><button type="button" class="kn-gross kn-leise" data-art="ab">abbrechend</button><button type="button" class="kn-gross kn-leise" data-art="per">periodisch</button></div>`;
    } else {
      h = `<div class="pd-merk" data-fertig>${T.periodisch
        ? `Ein Rest kommt wieder → ab da wiederholen sich die Ziffern immer wieder: ${dezText(T, false)}<br>Man schreibt einen <b>Strich über die Periode</b>: ${dezText(T)}${T.start > 0 ? `<br>Die Ziffer${T.start > 1 ? 'n' : ''} vor der Periode gehör${T.start > 1 ? 'en' : 't'} nicht dazu.` : ''}`
        : `Rest 0 → die Division geht auf. ${bruchHtml(z, n, 'klein')} = ${dezText(T)} ist eine <b>abbrechende</b> Dezimalzahl.`}</div>`;
    }
    return h + antwortHtml(bewertung);
  }

  function zeichne() { g.links.innerHTML = `<p class="pd-auf">${bruchHtml(z, n)} = ${z} : ${n}</p>${rechnung()}${reste()}`; g.rechts.innerHTML = zwischen() + rechts(); }

  function weiter() {
    fertig++; eing = {};
    if (geschafft()) {
      bewertung = null;
      g.sprich(T.periodisch ? `Halt! Der Rest ${T.schritte[ende() - 1].r2} war schon einmal da. Ab hier wiederholt sich alles.` : 'Rest 0 – fertig!', 'fertig');
    }
  }

  function pruefen() {
    if (geschafft()) return;
    const s = T.schritte[fertig], d = eing['pd-d'], r = eing['pd-r'];
    if (d === undefined || d === '' || r === undefined || r === '') bewertung = { ok: false, text: 'Trage die Ziffer und den Rest ein.' };
    else if (+d === s.d && +r === s.r2) { bewertung = null; weiter(); if (!geschafft()) g.sprich(`Richtig: ${s.x} : ${n} = ${s.d} Rest ${s.r2}.`, 'fertig'); }
    else if (+d === s.d) bewertung = { ok: false, text: `Die Ziffer stimmt. Rest: ${s.x} − ${s.d} · ${n} = ?` };
    else if (+d * n > s.x) bewertung = { ok: false, text: `${d} · ${n} = ${+d * n} ist mehr als ${s.x}.` };
    else bewertung = { ok: false, text: `${n} passt öfter in ${s.x}: ${+d + 1} · ${n} = ${(+d + 1) * n}.` };
    zeichne();
    g.links.querySelector('#pd-d')?.focus({ preventScroll: true });
  }

  root.addEventListener('input', e => {
    if (!e.target.matches('[data-pdein]')) return;
    e.target.value = e.target.value.replace(/\D/g, '');
    eing[e.target.id] = e.target.value;
    if (e.target.id === 'pd-d' && e.target.value) g.links.querySelector('#pd-r')?.focus({ preventScroll: true });
  });
  root.addEventListener('click', e => {
    const k = e.target.closest('[data-art]');
    if (k && geschafft() && !art) {
      const ok = (k.dataset.art === 'per') === T.periodisch;
      if (ok) { art = k.dataset.art; bewertung = { ok: true, text: T.periodisch ? 'Richtig – periodisch.' : 'Richtig – abbrechend.' }; }
      else bewertung = { ok: false, text: T.periodisch ? 'Schau auf die Reste: Einer kommt doppelt vor. Dann hört die Division nie auf.' : 'Der Rest ist 0 – die Division hört auf.' };
      zeichne(); return;
    }
    const b = e.target.closest('[data-pd]');
    if (!b) return;
    if (b.dataset.pd === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.pd === 'pruefen') pruefen();
    if (b.dataset.pd === 'vormachen' && !geschafft()) { const s = T.schritte[fertig]; g.sprich(`${s.x} : ${n} = ${s.d} Rest ${s.r2}, denn ${s.d} · ${n} = ${s.d * n}.`, 'tipp'); weiter(); bewertung = null; zeichne(); }
    if (b.dataset.pd === 'tipp') {
      if (!geschafft()) { const s = T.schritte[fertig]; g.sprich(`Das Einmaleins mit ${n}: ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => i * n).filter(x => x <= s.x + n).join(', ')} … Welches ist am nächsten unter ${s.x}?`, 'tipp'); }
      else g.sprich('Ist ein Rest 0, endet die Zahl. Kommt ein Rest doppelt vor, wiederholt sich ab da alles.', 'tipp');
    }
  });

  function start() { g.sprich('Ein Bruch ist eine Division: Zähler geteilt durch Nenner. Rechne Schritt für Schritt und beobachte die Reste.'); }
  neu(); zeichne(); start();
}
