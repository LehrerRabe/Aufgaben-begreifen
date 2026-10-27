/* Mathematik: Was heißt Teilen?
   Verteilen: Kekse gerecht auf Teller legen – Runde für Runde.
   Aufteilen: Kekse in Tüten zu je g Stück packen.
   Geschichte: Passt Verteilen oder Aufteilen? Beides ist dieselbe Geteilt-Aufgabe. */

import { geruest, zufall, wahl, antwortHtml, zahlenMerken, zahlFeld, flip } from './geruest.js';

const DINGE = [
  { ein: 'Keks', mehr: 'Kekse', farbe: '#d99a4e' },
  { ein: 'Murmel', mehr: 'Murmeln', farbe: '#4d86e6' },
  { ein: 'Erdbeere', mehr: 'Erdbeeren', farbe: '#e0262b' },
  { ein: 'Sticker', mehr: 'Sticker', farbe: '#f2b72e' },
];
const NAMEN = ['Lea', 'Tom', 'Mia', 'Ben', 'Emma', 'Noah', 'Lina', 'Paul'];

export function starteTeilen(root) {
  let modus = 'verteilen';
  let ding, n, k, ort, haufen, eing = {}, bewertung = null, beschaeftigt = false, geschichte = null, gewaehlt = null;

  const g = geruest(root, {
    etikett: 'Teilen verstehen', titel: '',
    reiter: [{ id: 'verteilen', titel: 'Verteilen', unter: 'gerecht auf Teller' }, { id: 'aufteilen', titel: 'Aufteilen', unter: 'in Tüten packen' }, { id: 'geschichte', titel: 'Geschichten', unter: 'Was passt?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-tl="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-tl="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  /** art: 'verteilen' (k Teller) oder 'aufteilen' (Tüten zu je k). */
  function neu() {
    bewertung = null; gewaehlt = null; ['tl-q', 'tl-r'].forEach(x => (eing[x] = ''));
    ding = wahl(DINGE);
    k = zufall(2, 6);
    const q = zufall(2, 6), r = Math.random() < 0.55 ? zufall(1, k - 1) : 0;
    n = k * q + r;
    haufen = Array.from({ length: n }, (_, i) => i);
    const art = modus === 'geschichte' ? wahl(['verteilen', 'aufteilen']) : modus;
    ort = art === 'verteilen' ? Array.from({ length: k }, () => []) : [];
    if (modus === 'geschichte') {
      const name = wahl(NAMEN);
      geschichte = { art, text: art === 'verteilen'
        ? `${name} hat ${n} ${ding.mehr} und verteilt sie gerecht an ${k} Kinder. Wie viele bekommt jedes Kind?`
        : `${name} hat ${n} ${ding.mehr} und packt immer ${k} in eine Tüte. Wie viele Tüten werden voll?` };
    } else geschichte = null;
  }

  const art = () => (modus === 'geschichte' ? geschichte.art : modus);
  const stueck = id => `<span class="tl-stueck" data-id="s${id}" style="--f:${ding.farbe}"></span>`;

  function bild() {
    if (modus === 'geschichte' && !gewaehlt) return '<div class="tl-platz"></div>';
    const verteilen = art() === 'verteilen';
    const behaelter = verteilen
      ? ort.map((t, i) => `<div class="tl-teller"><div class="tl-inhalt">${t.map(stueck).join('')}</div><small>Teller ${i + 1}</small></div>`).join('')
      : ort.map((t, i) => `<div class="tl-tuete"><div class="tl-inhalt">${t.map(stueck).join('')}</div><small>Tüte ${i + 1}</small></div>`).join('') + (haufen.length >= k ? '<div class="tl-tuete leer"><small>neue Tüte</small></div>' : '');
    return `<div class="tl-haufen" aria-label="Haufen">${haufen.map(stueck).join('')}${haufen.length ? '' : '<small class="leise">leer</small>'}</div>
      <div class="tl-behaelter">${behaelter}</div>
      <div class="gs-pruef">
        ${verteilen
          ? `<button type="button" class="kn-gross" data-tl="eins" ${haufen.length ? '' : 'disabled'}>Nächster Teller bekommt 1</button>
             <button type="button" class="kn-gross" data-tl="runde" ${haufen.length >= k ? '' : 'disabled'}>Eine Runde: jeder Teller 1</button>`
          : `<button type="button" class="kn-gross" data-tl="tuete" ${haufen.length >= k ? '' : 'disabled'}>Eine Tüte mit ${k} packen</button>`}
        <button type="button" class="kn-gross kn-leise" data-tl="zurueck">Alles zurück</button>
      </div>`;
  }

  function links() {
    let kopf = '';
    if (modus === 'geschichte') {
      kopf = `<p class="tl-geschichte">${geschichte.text}</p>
        <p>Was passiert in der Geschichte?</p>
        <div class="tl-wahl">
          <button type="button" class="tl-wahlk${gewaehlt === 'verteilen' ? (geschichte.art === 'verteilen' ? ' richtig' : ' falsch') : ''}" data-art="verteilen">${tellerIcon()}<b>Verteilen</b><small>gerecht auf ${k} Teller</small></button>
          <button type="button" class="tl-wahlk${gewaehlt === 'aufteilen' ? (geschichte.art === 'aufteilen' ? ' richtig' : ' falsch') : ''}" data-art="aufteilen">${tueteIcon()}<b>Aufteilen</b><small>immer ${k} in eine Tüte</small></button>
        </div>`;
    }
    return kopf + bild();
  }

  const tellerIcon = () => '<svg viewBox="0 0 60 40" aria-hidden="true"><ellipse cx="30" cy="26" rx="26" ry="10" fill="#fff" stroke="#8a95b5" stroke-width="2"/><circle cx="22" cy="22" r="5" fill="#d99a4e"/><circle cx="34" cy="22" r="5" fill="#d99a4e"/></svg>';
  const tueteIcon = () => '<svg viewBox="0 0 60 40" aria-hidden="true"><path d="M14 8h32l4 30H10Z" fill="#e8d3a8" stroke="#8a6a3a" stroke-width="2"/><circle cx="24" cy="26" r="5" fill="#d99a4e"/><circle cx="36" cy="26" r="5" fill="#d99a4e"/></svg>';

  function rechts() {
    const verteilen = art() === 'verteilen';
    if (modus === 'geschichte' && !gewaehlt) return '<h2 class="bereich-titel">Lies die Geschichte</h2><p>Entscheide links: Wird verteilt oder aufgeteilt?</p>';
    const frage = verteilen
      ? `<p>${n} ${ding.mehr} auf ${k} Teller verteilen.</p><p class="ut-frage">Jeder Teller: ${zahlFeld('tl-q', eing['tl-q'], 2, 'pro Teller')} · Rest: ${zahlFeld('tl-r', eing['tl-r'], 2, 'Rest')}</p>`
      : `<p>${n} ${ding.mehr}, immer ${k} in eine Tüte.</p><p class="ut-frage">Tüten: ${zahlFeld('tl-q', eing['tl-q'], 2, 'Tüten')} · Rest: ${zahlFeld('tl-r', eing['tl-r'], 2, 'Rest')}</p>`;
    return `<h2 class="bereich-titel">${verteilen ? 'Gerecht verteilen' : 'In Tüten aufteilen'}</h2>${frage}
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-tl="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${bewertung?.ok ? `<p class="fl-formel">${n} : ${k} = ${Math.floor(n / k)}${n % k ? ` Rest ${n % k}` : ''}</p>
        <p class="leise">${verteilen ? `Beim Verteilen suchst du, wie viele <b>jeder</b> bekommt.` : `Beim Aufteilen suchst du, <b>wie oft</b> ${k} hineinpasst.`} Beides rechnest du mit ${n} : ${k}.</p>` : ''}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ verteilen: 'Gerecht verteilen', aufteilen: 'Aufteilen: Wie oft passt es?', geschichte: 'Verteilen oder Aufteilen?' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }
  const bildNeu = () => { g.links.innerHTML = links(); };

  async function bewege(fn) {
    if (beschaeftigt) return;
    beschaeftigt = true;
    await flip(root, () => { fn(); bildNeu(); }, 550);
    beschaeftigt = false;
    if (art() === 'verteilen' && haufen.length < k && haufen.length >= 0 && ort.every(t => t.length === ort[0].length))
      g.sprich(haufen.length ? `Für eine weitere Runde reicht es nicht: ${haufen.length} bleiben übrig – das ist der Rest.` : 'Alles ist verteilt, nichts bleibt übrig.', 'tipp');
    if (art() === 'aufteilen' && haufen.length < k) g.sprich(haufen.length ? `Für eine volle Tüte reicht es nicht mehr: ${haufen.length} bleiben übrig.` : 'Alle sind in Tüten, nichts bleibt übrig.', 'tipp');
  }

  function pruefen() {
    const q = Math.floor(n / k), r = n % k;
    const ok = Number(eing['tl-q']) === q && Number(eing['tl-r'] || 0) === r && eing['tl-q'] !== '';
    bewertung = ok ? { ok, text: 'Richtig!' } : { ok, text: (art() === 'verteilen' ? 'Verteile die Kekse am Bild und zähle, wie viele auf einem Teller liegen.' : 'Packe die Tüten am Bild und zähle sie.').replace('Kekse', ding.mehr) };
    if (ok) g.sprich(`${n} : ${k} = ${q}${r ? ` Rest ${r}` : ''}`, 'fertig');
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const a = e.target.closest('[data-art]');
    if (a) {
      if (gewaehlt === geschichte.art) return;
      gewaehlt = a.dataset.art;
      if (gewaehlt !== geschichte.art) { g.sprich(geschichte.art === 'verteilen' ? 'Lies noch einmal: Die Anzahl der Kinder ist bekannt – es wird verteilt.' : `Lies noch einmal: Es kommen immer ${k} zusammen – es wird aufgeteilt.`, 'tipp'); g.links.innerHTML = links(); setTimeout(() => { gewaehlt = null; if (root.isConnected) g.links.innerHTML = links(); }, 1600); return; }
      g.sprich('Richtig erkannt! Jetzt probiere es mit dem Material aus.', 'fertig');
      zeichne(); return;
    }
    const b = e.target.closest('[data-tl]');
    if (!b) return;
    const was = b.dataset.tl;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'eins') bewege(() => { const t = ort.reduce((m, x, i) => (x.length < ort[m].length ? i : m), 0); ort[t].push(haufen.pop()); });
    if (was === 'runde') bewege(() => { for (const t of ort) t.push(haufen.pop()); });
    if (was === 'tuete') bewege(() => { ort.push(haufen.splice(-k, k)); });
    if (was === 'zurueck') bewege(() => { haufen = [...haufen, ...ort.flat()].sort((x, y) => x - y); ort = art() === 'verteilen' ? Array.from({ length: k }, () => []) : []; });
    if (was === 'pruefen') pruefen();
    if (was === 'tipp') g.sprich(art() === 'verteilen' ? 'Verteile Runde für Runde: Jeder Teller bekommt einen, bis es nicht mehr für alle reicht.' : `Packe immer ${k} in eine Tüte, bis weniger als ${k} übrig sind.`, 'tipp');
  });

  function startText() {
    g.sprich({ verteilen: 'Verteile gerecht: Jeder Teller bekommt gleich viele. Was nicht mehr reicht, ist der Rest.',
      aufteilen: 'Packe Tüten mit immer gleich vielen. Wie viele Tüten werden voll?',
      geschichte: 'Lies die Geschichte. Wird verteilt oder aufgeteilt? Beides ist eine Geteilt-Aufgabe.' }[modus]);
  }

  neu(); zeichne(); startText();
}
