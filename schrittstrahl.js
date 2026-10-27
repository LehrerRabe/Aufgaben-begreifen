/* Mathematik: Zahlenstrahl mit verschiedenen Schrittgrößen.
   „Springen“: Ein Frosch springt in gleich großen Sprüngen – wo landet er?
   „Lücken füllen“: Welche Zahlen fehlen an den Strichen?
   „Zahl eintragen“: Den Strich antippen, an dem die Zahl steht. */

import { geruest, zufall, wahl, mischen, warte, antwortHtml, zahlenMerken, zahlFeld, bewegung } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const SCHRITTE = [2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 5000];
const N = 10;   // Abschnitte auf dem Strahl

export function starteSchrittstrahl(root) {
  let modus = 'springen';
  let s, a, eing = {}, bewertung = null, beschaeftigt = false;
  let sprung, gesprungen;        // springen: { start, k, rueck, fest } – fest: dritter beschrifteter Strich
  let luecken;                   // Indizes ohne Beschriftung
  let ziel, getippt;             // eintragen

  const g = geruest(root, {
    etikett: 'Zahlenstrahl', titel: '',
    reiter: [{ id: 'springen', titel: 'Springen', unter: 'gleich große Sprünge' }, { id: 'luecken', titel: 'Lücken füllen' }, { id: 'eintragen', titel: 'Zahl eintragen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-ss="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-ss="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; Object.keys(eing).forEach(k => (eing[k] = ''));
    s = wahl(SCHRITTE);
    a = s * zufall(0, 20);
    if (modus === 'springen') {
      const rueck = Math.random() < 0.3, k = zufall(3, 7);
      // Landestelle nie am Rand – dort steht eine feste Zahl, die die Lösung verraten würde
      const startI = rueck ? zufall(k + 1, N) : zufall(0, N - k - 1);
      const ziel_ = startI + (rueck ? -k : k);
      const fest = [5, 3, 7, 2, 8, 4, 6].find(i => i !== startI && i !== ziel_);
      sprung = { start: startI, k, rueck, fest }; gesprungen = 0;
    }
    if (modus === 'luecken') luecken = mischen([...Array(N + 1).keys()].filter(i => i !== 0)).slice(0, 4).sort((x, y) => x - y);
    if (modus === 'eintragen') { ziel = zufall(1, N - 1); getippt = null; if (ziel === 5) ziel = 7; }
  }

  const X = i => 40 + i * 62;   // Position eines Strichs (SVG-Einheiten)
  const zahl = i => a + i * s;

  function strahl() {
    const breite = X(N) + 40;
    let h = `<line x1="20" y1="110" x2="${breite - 10}" y2="110" class="ss-linie" marker-end="url(#ss-spitze)"/>`;
    for (let i = 0; i <= N; i++) {
      const lang = i % 5 === 0;
      h += `<line x1="${X(i)}" y1="${lang ? 96 : 100}" x2="${X(i)}" y2="${lang ? 124 : 120}" class="ss-strich"/>`;
      let beschr = true;
      if (modus === 'luecken') beschr = !luecken.includes(i);
      if (modus === 'eintragen') beschr = i === 0 || i === 5 || i === N;
      if (modus === 'springen') beschr = i === sprung.start || i === 0 || i === N || i === sprung.fest;
      if (beschr) h += `<text x="${X(i)}" y="150" class="ss-zahl${modus === 'springen' && i === sprung.start ? ' start' : ''}">${zahlText(zahl(i))}</text>`;
      if (modus === 'eintragen') h += `<circle cx="${X(i)}" cy="110" r="16" class="ss-tipp${getippt === i ? (i === ziel ? ' richtig' : ' falsch') : ''}" data-tick="${i}"/>`;
    }
    if (modus === 'springen') {
      const { start, rueck } = sprung;
      for (let j = 0; j < gesprungen; j++) {
        const i0 = start + (rueck ? -j : j), i1 = i0 + (rueck ? -1 : 1);
        const x0 = X(i0), x1 = X(i1), m = (x0 + x1) / 2;
        h += `<path d="M${x0} 104 Q${m} 30 ${x1} 104" class="ss-bogen${j === gesprungen - 1 ? ' neu' : ''}"/>
          <text x="${m}" y="54" class="ss-plus">${rueck ? '−' : '+'}${zahlText(s)}</text>`;
      }
      const jetzt = start + (rueck ? -gesprungen : gesprungen);
      h += `<g class="ss-frosch" style="transform: translate(${X(jetzt)}px, 86px)">${frosch()}</g>`;
    }
    return `<svg class="ss-svg" viewBox="0 0 ${breite} 170">
      <defs><marker id="ss-spitze" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="ss-spitze"/></marker></defs>${h}</svg>`;
  }

  const frosch = () => `<ellipse cx="0" cy="0" rx="13" ry="10" fill="#2fae58" stroke="#fff" stroke-width="2"/>
    <circle cx="-6" cy="-9" r="5" fill="#2fae58" stroke="#fff" stroke-width="2"/><circle cx="6" cy="-9" r="5" fill="#2fae58" stroke="#fff" stroke-width="2"/>
    <circle cx="-6" cy="-10" r="2" fill="#1b2340"/><circle cx="6" cy="-10" r="2" fill="#1b2340"/><path d="M-5 3 Q0 7 5 3" stroke="#fff" stroke-width="1.6" fill="none"/>`;

  function links() {
    let unten = '';
    if (modus === 'springen') {
      unten = `<div class="gs-pruef"><button type="button" class="kn-gross" data-ss="spring" ${gesprungen >= sprung.k ? 'disabled' : ''}>🐸 Springen (${gesprungen}/${sprung.k})</button></div>`;
    }
    if (modus === 'luecken') {
      unten = `<div class="ss-felder">${luecken.map((i, k) => `<span style="left:${(X(i) / (X(N) + 40)) * 100}%; --reihe:${k % 2}">${zahlFeld(`ss-${i}`, eing[`ss-${i}`], 6, `Zahl an Strich ${i + 1}`)}</span>`).join('')}</div>`;
    }
    return modus === 'luecken' ? `<div class="ss-huelle">${strahl()}${unten}</div>` : `<div class="ss-huelle">${strahl()}</div>${unten}`;
  }

  function rechts() {
    const schritt = `<p class="ss-schritt">Schrittgröße: <b>${zahlText(s)}</b></p>`;
    if (modus === 'springen') {
      const { start, k, rueck } = sprung;
      return `<h2 class="bereich-titel">Wo landet der Frosch?</h2>
        <p>Er startet bei <b>${zahlText(zahl(start))}</b> und springt <b>${k}-mal</b> um <b>${zahlText(s)}</b> ${rueck ? 'nach links' : 'nach rechts'}.</p>
        <p class="ut-frage">Er landet bei ${zahlFeld('ss-e', eing['ss-e'], 6, 'Landestelle')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-ss="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${bewertung?.ok ? `<p class="fl-formel">${zahlText(zahl(start))} ${rueck ? '−' : '+'} ${k} · ${zahlText(s)} = ${zahlText(zahl(start + (rueck ? -k : k)))}</p>` : ''}`;
    }
    if (modus === 'luecken') {
      return `<h2 class="bereich-titel">Welche Zahlen fehlen?</h2>
        <p>Trage unter den leeren Strichen die passenden Zahlen ein.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-ss="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${bewertung?.ok ? schritt : '<p class="leise">Finde zuerst heraus: Wie groß ist ein Schritt von Strich zu Strich?</p>'}`;
    }
    return `<h2 class="bereich-titel">Wo steht diese Zahl?</h2>
      <p class="rr-gross">${zahlText(zahl(ziel))}</p>
      <p>Tippe auf den passenden Strich.</p>${antwortHtml(bewertung)}
      ${bewertung?.ok ? schritt : '<p class="leise">Nur drei Striche sind beschriftet. Wie groß ist ein Schritt?</p>'}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ springen: 'Sprünge auf dem Zahlenstrahl', luecken: 'Lücken am Zahlenstrahl', eintragen: 'Zahlen eintragen' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  async function springen() {
    if (gesprungen >= sprung.k) return;
    beschaeftigt = true;
    const fr = root.querySelector('.ss-frosch');
    const vorher = sprung.start + (sprung.rueck ? -gesprungen : gesprungen);
    const nach = vorher + (sprung.rueck ? -1 : 1);
    if (fr && bewegung()) {
      await fr.animate([
        { transform: `translate(${X(vorher)}px, 86px)` },
        { transform: `translate(${(X(vorher) + X(nach)) / 2}px, 30px)` },
        { transform: `translate(${X(nach)}px, 86px)` },
      ], { duration: 450, easing: 'ease-in-out' }).finished.catch(() => {});
    }
    gesprungen++;
    g.links.innerHTML = links();
    if (gesprungen === sprung.k) g.sprich('Gelandet! Welche Zahl steht an diesem Strich?');
    await warte(50);
    beschaeftigt = false;
  }

  function pruefen() {
    if (modus === 'springen') {
      const soll = zahl(sprung.start + (sprung.rueck ? -sprung.k : sprung.k));
      const ein = Number((eing['ss-e'] || '').replace(/\D/g, ''));
      const ok = ein === soll && eing['ss-e'] !== '';
      bewertung = ok ? { ok, text: `Richtig: ${zahlText(soll)}` } : { ok, text: gesprungen < sprung.k ? 'Lass den Frosch erst alle Sprünge machen.' : `Noch nicht. Zähle vom Start aus ${sprung.k}-mal ${zahlText(s)} ${sprung.rueck ? 'zurück' : 'weiter'}.` };
      if (ok) g.sprich(`${sprung.k} Sprünge zu je ${zahlText(s)} sind ${zahlText(sprung.k * s)}.`, 'fertig');
    }
    if (modus === 'luecken') {
      const falsch = luecken.filter(i => Number((eing[`ss-${i}`] || '').replace(/\D/g, '')) !== zahl(i) || !eing[`ss-${i}`]);
      bewertung = falsch.length ? { ok: false, text: `${falsch.length === 1 ? 'Eine Zahl stimmt' : `${falsch.length} Zahlen stimmen`} noch nicht. Ein Schritt ist immer gleich groß.` } : { ok: true, text: 'Alle Lücken richtig gefüllt!' };
      if (!falsch.length) g.sprich(`Von Strich zu Strich geht es immer um ${zahlText(s)} weiter.`, 'fertig');
      g.links.innerHTML = links();
      root.querySelectorAll('.ss-felder .gs-ein').forEach(f => { const i = Number(f.id.slice(3)); f.classList.toggle('falsch', falsch.includes(i)); f.classList.toggle('richtig', !falsch.includes(i)); });
    }
    g.rechts.innerHTML = rechts();
  }

  function tipp() {
    const sch = `Von ${zahlText(zahl(0))} bis ${zahlText(zahl(5))} sind es 5 Schritte. Ein Schritt ist also ${zahlText(5 * s)} : 5 = ${zahlText(s)}.`;
    if (modus === 'springen') g.sprich(gesprungen < sprung.k ? 'Tippe auf „Springen“ und beobachte die Bögen. Jeder Bogen ist ein Schritt.' : `Zähle in ${zahlText(s)}er-Schritten: ${[1, 2, 3].map(j => zahlText(zahl(sprung.start + (sprung.rueck ? -j : j)))).join(', ')}, …`, 'tipp');
    if (modus === 'luecken') g.sprich(sch, 'tipp');
    if (modus === 'eintragen') g.sprich(sch, 'tipp');
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const t = e.target.closest('[data-tick]');
    if (t && modus === 'eintragen' && !bewertung?.ok) {
      getippt = Number(t.dataset.tick);
      bewertung = getippt === ziel ? { ok: true, text: `Richtig: ${zahlText(zahl(ziel))} steht am ${ziel + 1}. Strich.` } : { ok: false, text: `Das ist ${zahlText(zahl(getippt))}. Gesucht ist ${zahlText(zahl(ziel))}.` };
      if (bewertung.ok) g.sprich(`Von ${zahlText(zahl(0))} aus sind es ${ziel} Schritte zu je ${zahlText(s)}.`, 'fertig');
      zeichne(); return;
    }
    const b = e.target.closest('[data-ss]');
    if (!b) return;
    if (b.dataset.ss === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.ss === 'spring') springen();
    if (b.dataset.ss === 'pruefen') pruefen();
    if (b.dataset.ss === 'tipp') tipp();
  });

  function startText() {
    g.sprich({
      springen: 'Der Frosch macht lauter gleich große Sprünge. Lass ihn springen und finde heraus, wo er landet.',
      luecken: 'Die Striche haben immer den gleichen Abstand. Welche Zahlen fehlen?',
      eintragen: 'Finde die Schrittgröße und tippe die Zahl an.',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
