/* Mathematik: Unterschied und Ergänzen.
   Vergleichen: Zwei Perlenketten nebeneinander – der gleich lange Teil wird abgedeckt, der Unterschied bleibt sichtbar.
   Ergänzen: Am Zahlenstrahl von der kleineren zur größeren Zahl springen (erst zur vollen Zehn/Hundert). */

import { geruest, zufall, wahl, antwortHtml, zahlenMerken, zahlFeld, warte } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const SPRUENGE = [1, 2, 5, 10, 20, 50, 100, 200];
const NAMEN = ['Lea', 'Tom', 'Mia', 'Ben', 'Emma', 'Noah'];

export function starteUnterschied(root) {
  let modus = 'vergleichen';
  let a, b, nA, nB, abgedeckt, spruenge, eing = {}, bewertung = null;

  const g = geruest(root, {
    etikett: 'Unterschied', titel: '',
    reiter: [{ id: 'vergleichen', titel: 'Vergleichen', unter: 'Perlenketten' }, { id: 'ergaenzen', titel: 'Ergänzen', unter: 'am Zahlenstrahl' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-us="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-us="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; eing['us-e'] = ''; abgedeckt = false; spruenge = [];
    if (modus === 'vergleichen') { b = zufall(8, 40); a = b + zufall(3, 18); [nA, nB] = [wahl(NAMEN), wahl(NAMEN.filter(x => x !== nA))]; nB = wahl(NAMEN.filter(x => x !== nA)); }
    else {
      const gross = Math.random() < 0.5;
      b = gross ? zufall(11, 85) * 10 + zufall(1, 9) : zufall(12, 88);
      a = b + (gross ? zufall(30, 350) : zufall(12, 60));
      if (a % 10 === 0) a += zufall(1, 9);
    }
  }

  function ketten() {
    const P = 20, W = a * P + 20;
    const reihe = (n, y, farbe) => {
      let s = '';
      for (let i = 0; i < n; i++) {
        const zehner = Math.floor(i / 10) % 2;
        s += `<circle cx="${10 + i * P + P / 2}" cy="${y}" r="${P * 0.42}" class="us-perle ${farbe}${zehner ? ' dunkel' : ''}"/>`;
      }
      return s;
    };
    const decke = abgedeckt ? `<rect x="6" y="6" width="${b * P + 8}" height="78" rx="10" class="us-decke"/>
      <path d="M${10 + b * P + 2} 94 h${(a - b) * P - 4}" class="us-klammer"/><text x="${10 + b * P + ((a - b) * P) / 2}" y="112" class="us-text">Unterschied</text>` : '';
    return `<svg class="us-svg" viewBox="0 0 ${W} 120">
      ${reihe(a, 25, 'blau')}${reihe(b, 65, 'gold')}${decke}</svg>
      <div class="us-namen"><span class="blau">${nA}: ${a}</span><span class="gold">${nB}: ${b}</span></div>
      <div class="gs-pruef"><button type="button" class="kn-gross" data-us="decken">${abgedeckt ? 'Abdeckung wegnehmen' : '▭ Gleich viele abdecken'}</button></div>`;
  }

  function strahl() {
    const W = 640, x0 = 30, x1 = W - 30;
    const X = v => x0 + ((v - b) / (a - b)) * (x1 - x0);
    let pos = b, s = '', i = 0;
    for (const sp of spruenge) {
      const m = (X(pos) + X(pos + sp)) / 2, h = Math.min(70, 20 + (X(pos + sp) - X(pos)) * 0.4);
      s += `<path d="M${X(pos)} 120 Q${m} ${120 - h * 2} ${X(pos + sp)} 120" class="ss-bogen${i === spruenge.length - 1 ? ' neu' : ''}"/>
        <text x="${m}" y="${120 - h - 6}" class="ss-plus">+${zahlText(sp)}</text>`;
      pos += sp; i++;
      if (pos < a) s += `<line x1="${X(pos)}" y1="112" x2="${X(pos)}" y2="128" class="ss-strich"/><text x="${X(pos)}" y="146" class="ss-zahl klein">${zahlText(pos)}</text>`;
    }
    return `<svg class="ss-svg" viewBox="0 0 ${W} 160">
      <line x1="${x0 - 10}" y1="120" x2="${x1 + 10}" y2="120" class="ss-linie"/>
      <line x1="${x0}" y1="108" x2="${x0}" y2="132" class="ss-strich"/><line x1="${x1}" y1="108" x2="${x1}" y2="132" class="ss-strich"/>
      <text x="${x0}" y="150" class="ss-zahl start">${zahlText(b)}</text><text x="${x1}" y="150" class="ss-zahl">${zahlText(a)}</text>${s}
      <circle cx="${X(pos)}" cy="120" r="8" class="us-jetzt"/></svg>`;
  }

  const stand = () => b + spruenge.reduce((x, y) => x + y, 0);

  function links() {
    if (modus === 'vergleichen') return ketten();
    return `${strahl()}
      <p>Du bist bei <b>${zahlText(stand())}</b>. Springe weiter:</p>
      <div class="us-spruenge">${SPRUENGE.map(s => `<button type="button" class="kn-gross" data-sprung="${s}" ${stand() + s > a ? 'disabled' : ''}>+${s}</button>`).join('')}
        <button type="button" class="kn-gross kn-leise" data-us="zurueck" ${spruenge.length ? '' : 'disabled'}>↶</button></div>`;
  }

  function rechts() {
    if (modus === 'vergleichen') {
      return `<h2 class="bereich-titel">Wie viele mehr?</h2>
        <p>${nA} hat ${a} Perlen, ${nB} hat ${b}. Wie viele Perlen hat ${nA} mehr?</p>
        <p class="ut-frage">${zahlFeld('us-e', eing['us-e'], 3, 'Unterschied')} mehr</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-us="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${bewertung?.ok ? `<p class="fl-formel">${a} − ${b} = ${a - b}<br>${b} + ${a - b} = ${a}</p><p class="leise">Den Unterschied findest du durch Abziehen oder durch Ergänzen.</p>` : ''}`;
    }
    const fertig = stand() === a;
    return `<h2 class="bereich-titel">Wie viel fehlt von ${zahlText(b)} bis ${zahlText(a)}?</h2>
      <p class="leise">Tipp: Springe erst zur nächsten vollen Zehn oder Hundert.</p>
      ${fertig ? `<p>Du bist angekommen! Zähle deine Sprünge zusammen:</p><p class="fl-formel">${spruenge.map(s => '+' + zahlText(s)).join(' ')}</p>` : ''}
      <p class="ut-frage">${zahlText(a)} − ${zahlText(b)} = ${zahlFeld('us-e', eing['us-e'], 4, 'Unterschied')}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-us="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'vergleichen' ? 'Den Unterschied sehen' : 'Ergänzen statt abziehen');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const sp = e.target.closest('[data-sprung]');
    if (sp) {
      const s = Number(sp.dataset.sprung);
      if (stand() + s > a) return;
      spruenge.push(s); zeichne();
      if (stand() === a) g.sprich(`Angekommen bei ${zahlText(a)}! Du bist ${spruenge.length}-mal gesprungen.`, 'fertig');
      return;
    }
    const b2 = e.target.closest('[data-us]');
    if (!b2) return;
    const was = b2.dataset.us;
    if (was === 'neu') { neu(); zeichne(); start(); }
    if (was === 'zurueck') { spruenge.pop(); zeichne(); }
    if (was === 'decken') { abgedeckt = !abgedeckt; g.links.innerHTML = links(); if (abgedeckt) { await warte(300); g.sprich(`Unter der Abdeckung liegen bei beiden gleich viele Perlen. Sichtbar bleibt nur, was ${nA} mehr hat.`); } }
    if (was === 'pruefen') {
      const ok = Number(eing['us-e']) === a - b && eing['us-e'] !== '';
      bewertung = ok ? { ok, text: `Richtig: ${zahlText(a - b)}` } : { ok, text: modus === 'vergleichen' ? 'Noch nicht. Decke gleich viele ab und zähle, was übrig bleibt.' : 'Noch nicht. Springe bis zum Ziel und zähle die Sprünge zusammen.' };
      if (ok) g.sprich('Super!', 'fertig');
      g.rechts.innerHTML = rechts();
    }
    if (was === 'tipp') {
      if (modus === 'vergleichen') g.sprich('Tippe auf „Gleich viele abdecken“. Die Perlen, die dann noch zu sehen sind, sind der Unterschied. Zähle in Zehnern (Farbwechsel).', 'tipp');
      else { const s = stand(); const ziel = s % 10 ? Math.ceil(s / 10) * 10 : s % 100 && a - s >= 100 ? Math.ceil(s / 100) * 100 : a; g.sprich(`Du bist bei ${zahlText(s)}. Springe zuerst bis ${zahlText(Math.min(ziel, a))}.`, 'tipp'); }
    }
  });

  function start() { g.sprich(modus === 'vergleichen' ? 'Wer hat mehr – und wie viel mehr? Vergleiche die Perlenketten.' : 'Springe von der kleinen Zahl bis zur großen. Die Sprünge zusammen sind der Unterschied.'); }

  neu(); zeichne(); start();
}
