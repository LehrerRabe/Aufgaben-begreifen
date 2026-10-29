/* Deutsch: Ein Argument als Tisch mit drei Beinen (Klasse 6/7).
   Auf dem Tisch liegt die Streitfrage. Die drei Beine sind Behauptung, Begründung und Beispiel.
   Fehlt ein Bein oder steht ein falsches darunter, kippt der Tisch.
   „Tisch bauen“: Satzkarten antippen und unter das passende Bein legen. Eine Karte passt nicht – sie bleibt liegen.
   „Was fehlt?“: Ein Bein fehlt. Erst sagen, welches, dann den passenden Satz auswählen.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, ESC } from './geruest.js';

const BEINE = [
  { art: 'die', name: 'Behauptung', frage: 'Was meine ich?', signal: 'Ich finde …', farbe: '#1f5fd1' },
  { art: 'die', name: 'Begründung', frage: 'Warum?', signal: 'Denn … / weil …', farbe: '#d7263d' },
  { art: 'das', name: 'Beispiel', frage: 'Woran sieht man das?', signal: 'Zum Beispiel …', farbe: '#2a9d5c' },
];

/* [Streitfrage, Behauptung, Begründung, Beispiel, passt nicht] */
const ARGUMENTE = [
  ['Sollen Handys in der Pause erlaubt sein?', 'Ich finde, Handys sollten in der Pause nicht erlaubt sein.', 'Denn ohne Handy spielen und reden die Kinder mehr miteinander.',
    'Zum Beispiel haben wir in der handyfreien Projektwoche auf dem Schulhof Fußball und Fangen gespielt.', 'Mein Handy hat eine blaue Hülle.'],
  ['Sollte jede Klasse ein Haustier haben?', 'Ich bin dafür, dass jede Klasse ein Haustier bekommt.', 'Denn so lernen alle, Verantwortung zu übernehmen.',
    'Zum Beispiel müssten wir jeden Tag abwechselnd die Fische füttern und das Aquarium sauber halten.', 'Meine Tante hat zwei Katzen.'],
  ['Sollten Hausaufgaben abgeschafft werden?', 'Ich finde, Hausaufgaben sollten nicht abgeschafft werden.', 'Denn beim Üben zu Hause merkt man, was man schon kann und was nicht.',
    'Zum Beispiel habe ich erst bei den Hausaufgaben gemerkt, dass ich das schriftliche Teilen noch nicht verstanden hatte.', 'Hausaufgaben schreibt man in ein Heft.'],
  ['Sollte die große Pause länger sein?', 'Ich bin für eine längere große Pause.', 'Denn wer sich genug bewegt, kann danach besser aufpassen.',
    'Zum Beispiel sind viele aus meiner Klasse nach dem Sportunterricht viel konzentrierter.', 'Die große Pause beginnt um 9:35 Uhr.'],
  ['Sollte unsere Klassenfahrt ans Meer gehen?', 'Ich möchte, dass unsere Klassenfahrt ans Meer geht.', 'Denn dort kann man viel draußen unternehmen und die Natur erleben.',
    'Zum Beispiel könnten wir im Watt wandern und Krebse beobachten.', 'Das Meerwasser ist salzig.'],
  ['Sollte es in der Mensa jeden Tag ein vegetarisches Gericht geben?', 'Ich finde, es sollte jeden Tag ein vegetarisches Gericht geben.', 'Denn nicht alle Kinder essen Fleisch.',
    'Zum Beispiel essen in meiner Klasse vier Kinder kein Fleisch und bekommen manchmal nur Beilagen.', 'Die Mensa öffnet um 12 Uhr.'],
];

const STIL = `
.ti-svg { display: block; width: 100%; max-width: 34rem; height: auto; margin: 0 auto; overflow: visible; }
.ti-platte { transition: transform .7s cubic-bezier(.3,1.4,.5,1); transform-origin: 300px 280px; }
.ti-frage { font: 800 17px var(--schrift); fill: #3a2c00; }
.ti-beine { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; margin: .4rem 0 .8rem; }
.ti-bein { display: flex; flex-direction: column; gap: .3rem; text-align: left; font: inherit; color: var(--text); background: var(--flaeche);
  border: 3px dashed var(--rand); border-top: 8px solid var(--f); border-radius: 10px; padding: .5rem .55rem; min-height: 8rem; cursor: pointer; }
.ti-bein b { font: 800 1.05rem var(--titel); color: var(--f); }
.ti-bein small { color: var(--leise); font-size: .85rem; }
.ti-bein .ti-satz { font: 600 .98rem/1.3 var(--schrift); }
.ti-bein.an { border-color: var(--akzent); border-style: solid; border-top-color: var(--f); }
.ti-bein.falsch { border-color: var(--schlecht); border-style: solid; border-top-color: var(--f); animation: wackeln .35s; }
.ti-bein.voll { border-style: solid; border-color: var(--gut); border-top-color: var(--f); background: var(--gut-sanft); cursor: default; }
.ti-bein.fehlt { border-style: dashed; border-color: var(--schlecht); }
.ti-karten { display: grid; gap: .45rem; }
.ti-karte { text-align: left; font: 600 1.02rem/1.35 var(--schrift); padding: .55rem .8rem; border-radius: 12px; border: 3px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; box-shadow: 0 3px 0 var(--rand); }
.ti-karte.gewaehlt { border-color: var(--akzent); background: var(--info-sanft); }
.ti-karte.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); }
.ti-wahl { display: flex; gap: .5rem; flex-wrap: wrap; margin: .4rem 0 .8rem; }
.ti-wahl .kn-gross.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); color: var(--schlecht); }
@media (max-width: 600px) { .ti-beine { grid-template-columns: 1fr; } .ti-bein { min-height: 0; } }
`;

export function starteArgument(root) {
  if (!document.getElementById('ti-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="ti-stil">${STIL}</style>`);
  let modus = 'bauen', liste = mischen(ARGUMENTE), idx = 0, a, karten, gelegt, gewaehlt, falsch, meldung, fehlt, wf;

  const g = geruest(root, {
    etikett: 'Schreiben', titel: '',
    reiter: [{ id: 'bauen', titel: 'Tisch bauen', unter: 'Drei Beine darunter' }, { id: 'fehlt', titel: 'Was fehlt?', unter: 'Der Tisch wackelt' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-ti="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-ti="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    a = liste[idx++ % liste.length];
    gewaehlt = null; falsch = null; meldung = null;
    if (modus === 'bauen') { karten = mischen([0, 1, 2, 3]); gelegt = [false, false, false]; }
    else {
      fehlt = Math.floor(Math.random() * 3);
      gelegt = [0, 1, 2].map(i => i !== fehlt);
      const fremd = liste[(idx) % liste.length][1 + fehlt];
      wf = { schritt: 1, falschTeil: [], falschSatz: [], optionen: mischen([a[1 + fehlt], a[4], fremd]) };
    }
  }

  const anzahl = () => gelegt.filter(Boolean).length;

  function tischSvg() {
    const n = anzahl(), winkel = [-16, -11, -6, 0][n];
    const bein = (i, x) => gelegt[i]
      ? `<rect x="${x - 9}" y="160" width="18" height="120" rx="4" fill="${BEINE[i].farbe}"/>`
      : `<rect x="${x - 9}" y="160" width="18" height="120" rx="4" fill="none" stroke="#c9d3e4" stroke-width="3" stroke-dasharray="8 6"/>`;
    const zeilen = umbrechen(a[0], 36);
    return `<svg class="ti-svg" viewBox="0 0 600 290" role="img" aria-label="Tisch mit ${n} von 3 Beinen">
      <line x1="40" y1="282" x2="560" y2="282" stroke="#c9d3e4" stroke-width="4" stroke-linecap="round"/>
      <g class="ti-platte" style="transform: rotate(${winkel}deg)">
        ${bein(0, 130)}${bein(1, 300)}${bein(2, 470)}
        <rect x="70" y="${150 - zeilen.length * 22 - 14}" width="460" height="${zeilen.length * 22 + 14}" rx="10" fill="#fff8e6" stroke="#c9a227" stroke-width="3"/>
        ${zeilen.map((z, i) => `<text x="300" y="${150 - zeilen.length * 22 + 8 + i * 22}" text-anchor="middle" class="ti-frage">${ESC(z)}</text>`).join('')}
        <rect x="60" y="148" width="480" height="16" rx="6" fill="#b07b4a"/>
      </g></svg>`;
  }

  function umbrechen(t, max) {
    const z = []; let akt = '';
    t.split(' ').forEach(w => { if ((akt + ' ' + w).trim().length > max) { z.push(akt); akt = w; } else akt = (akt + ' ' + w).trim(); });
    if (akt) z.push(akt);
    return z;
  }

  function beine() {
    return `<div class="ti-beine">${BEINE.map((b, i) => {
      const kl = gelegt[i] ? ' voll' : falsch === i ? ' falsch' : (modus === 'fehlt' ? ' fehlt' : gewaehlt !== null ? ' an' : '');
      const satz = gelegt[i] ? `<span class="ti-satz">${ESC(a[1 + i])}</span>` : '';
      return `<div class="ti-bein${kl}" data-bein="${i}" role="button" tabindex="-1" style="--f:${b.farbe}"><b>${b.name}</b><small>${b.frage} · ${b.signal}</small>${satz}</div>`;
    }).join('')}</div>`;
  }

  function links() {
    let h = tischSvg() + beine();
    if (modus === 'bauen') {
      const rest = karten.filter(k => k === 3 || !gelegt[k]);
      h += `<div class="ti-karten">${rest.map(k => `<button type="button" class="ti-karte${gewaehlt === k ? ' gewaehlt' : ''}" data-karte="${k}">${ESC(a[1 + k])}</button>`).join('')}</div>`;
    } else if (wf.schritt === 1) {
      h += `<h3 class="eh-zwischen">Welches Bein fehlt?</h3><div class="ti-wahl">${BEINE.map((b, i) => `<button type="button" class="kn-gross${wf.falschTeil.includes(i) ? ' falsch' : ''}" data-teil="${i}">${b.name}</button>`).join('')}</div>`;
    } else if (wf.schritt === 2) {
      h += `<h3 class="eh-zwischen">Welcher Satz ist das fehlende Bein (${BEINE[fehlt].name})?</h3>
        <div class="ti-karten">${wf.optionen.map((o, i) => `<button type="button" class="ti-karte${wf.falschSatz.includes(i) ? ' falsch' : ''}" data-satz="${i}">${ESC(o)}</button>`).join('')}</div>`;
    }
    return h;
  }

  function rechts() {
    let h = `<h2 class="bereich-titel">Ein Argument hat drei Beine</h2>
      <ol class="sg-merke">${BEINE.map(b => `<li><b style="color:${b.farbe}">${b.name}:</b> ${b.frage} <span class="leise">(${b.signal})</span></li>`).join('')}</ol>
      <p class="leise">Ohne Begründung und Beispiel überzeugt eine Meinung niemanden – der Tisch kippt um.</p>`;
    const fertig = anzahl() === 3;
    if (fertig) h += '<p class="tb-antwort gut">Der Tisch steht! Behauptung, Begründung und Beispiel tragen das Argument.</p>';
    else if (meldung) h += `<p class="tb-antwort schlecht">${meldung}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'bauen' ? 'Argumentieren: Den Tisch bauen' : 'Argumentieren: Was fehlt?');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  /* Tisch mit altem Winkel zeichnen, dann auf den neuen schwenken */
  function zeichneMitSchwung() {
    const alt = root.querySelector('.ti-platte')?.style.transform;
    zeichne();
    const p = root.querySelector('.ti-platte');
    if (p && alt) { const neu_ = p.style.transform; p.style.transition = 'none'; p.style.transform = alt; void p.getBoundingClientRect(); p.style.transition = ''; p.style.transform = neu_; }
  }

  function fertigText() { g.sprich('Der Tisch steht fest auf drei Beinen!', 'fertig'); }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const k = e.target.closest('[data-karte]');
    if (k) { const n = Number(k.dataset.karte); gewaehlt = gewaehlt === n ? null : n; falsch = null; meldung = null; zeichne(); return; }
    const bn = e.target.closest('[data-bein]');
    if (bn && modus === 'bauen') {
      const i = Number(bn.dataset.bein);
      if (gelegt[i]) return;
      if (gewaehlt === null) { g.sprich('Tippe zuerst eine Satzkarte an.', 'tipp'); return; }
      if (gewaehlt === i) { gelegt[i] = true; gewaehlt = null; falsch = null; meldung = null; zeichneMitSchwung(); if (anzahl() === 3) fertigText(); }
      else {
        falsch = i;
        meldung = gewaehlt === 3 ? 'Dieser Satz passt zum Thema, trägt aber das Argument nicht. Er bleibt liegen.' : `Das ist ${BEINE[i].name === 'Beispiel' ? 'kein' : 'keine'} ${BEINE[i].name}. Achte auf die Signalwörter: ${BEINE[i].signal}`;
        zeichne();
      }
      return;
    }
    const t = e.target.closest('[data-teil]');
    if (t && modus === 'fehlt' && wf.schritt === 1) {
      const i = Number(t.dataset.teil);
      if (i === fehlt) { wf.schritt = 2; meldung = null; zeichne(); g.sprich(`Genau, ${BEINE[i].art} ${BEINE[i].name} fehlt. Welcher Satz ist es?`); }
      else { wf.falschTeil.push(i); meldung = `${BEINE[i].art === 'das' ? 'Das' : 'Die'} ${BEINE[i].name} steht schon unter dem Tisch.`; zeichne(); }
      return;
    }
    const s = e.target.closest('[data-satz]');
    if (s && modus === 'fehlt' && wf.schritt === 2) {
      const i = Number(s.dataset.satz), o = wf.optionen[i];
      if (o === a[1 + fehlt]) { gelegt[fehlt] = true; wf.schritt = 3; meldung = null; zeichneMitSchwung(); fertigText(); }
      else { wf.falschSatz.push(i); meldung = o === a[4] ? 'Dieser Satz trägt das Argument nicht.' : 'Dieser Satz gehört zu einer anderen Streitfrage.'; zeichne(); }
      return;
    }
    const b = e.target.closest('[data-ti]');
    if (!b) return;
    if (b.dataset.ti === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.ti === 'tipp') g.sprich('Achte auf die Signalwörter: „Ich finde …“ ist die Behauptung, „Denn …“ die Begründung, „Zum Beispiel …“ das Beispiel.', 'tipp');
  });

  function start() { g.sprich(modus === 'bauen' ? 'Der Tisch hat noch keine Beine. Lege die Sätze unter das passende Bein. Ein Satz passt nicht.' : 'Der Tisch wackelt – ein Bein fehlt. Welches?'); }

  neu(); zeichne(); start();
}
