/* Mathematik: Zahlenstrahl mit Lupe.
   „Wo liegt die Zahl?“ – erst den richtigen Abschnitt antippen, dann wird er vergrößert, bis zu den Einern.
   „Ablesen“ – Schrittweite erkennen und die markierte Zahl bestimmen. */

import { geruest, zufall, wahl, warte, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const SCHRITTE = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

export function starteZahlenstrahl(root) {
  let modus = 'suchen';
  let ziel, start, einheit, weg, fehler, fertig;
  let ab, eing = {}, bewertung = null, beschaeftigt = false, alleZahlen = false;

  const g = geruest(root, {
    etikett: 'Zahlenstrahl', titel: '',
    reiter: [{ id: 'suchen', titel: 'Zahl suchen', unter: 'mit der Lupe' }, { id: 'ablesen', titel: 'Ablesen', unter: 'Schrittweite finden' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-zs="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-zs="neu">＋ Neue Zahl</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; fehler = null; fertig = false; alleZahlen = false; eing['zs-ein'] = '';
    if (modus === 'suchen') {
      const gross = Math.random() < 0.5;
      ziel = gross ? zufall(10001, 99999) : zufall(1001, 9999);
      einheit = gross ? 10000 : 1000; start = 0; weg = [];
      if (ziel % 10 === 0) ziel += zufall(1, 9);
    } else {
      const s = wahl(SCHRITTE);
      const a = s * zufall(0, 30);
      ab = { a, s, k: zufall(1, 9) };
    }
  }

  function strahlSuchen() {
    const letzte = einheit === 1;
    const segmente = Array.from({ length: 10 }, (_, i) => `<button type="button" class="zs-seg${fehler === i ? ' falsch' : ''}" data-seg="${i}" aria-label="von ${start + i * einheit} bis ${start + (i + 1) * einheit}"></button>`).join('');
    const striche = Array.from({ length: 11 }, (_, i) => {
      const z = start + i * einheit;
      return `<span class="zs-strich${i % 5 === 0 ? ' lang' : ''}" style="left:${i * 10}%"></span>
        <span class="zs-zahl${letzte && i % 5 && i !== 10 ? ' klein' : ''}" style="left:${i * 10}%">${zahlText(z)}</span>
        ${letzte ? `<button type="button" class="zs-tick${fertig && z === ziel ? ' ziel' : ''}${fehler === 100 + i ? ' falsch' : ''}" style="left:${i * 10}%" data-tick="${z}" aria-label="${z}"></button>` : ''}`;
    }).join('');
    return `<div class="zs-strahl${letzte ? ' letzte' : ''}">
        <div class="zs-spur" data-spur>${letzte ? '<span class="zs-linie"></span>' : segmente}</div>
        <div class="zs-skala">${striche}</div>
      </div>
      <p class="leise">${letzte ? 'Tippe auf den Strich, an dem die Zahl liegt.' : `Jeder Abschnitt ist ${zahlText(einheit)} lang. Tippe auf den Abschnitt, in dem die Zahl liegt.`}</p>`;
  }

  function strahlAblesen() {
    const { a, s, k } = ab;
    const striche = Array.from({ length: 11 }, (_, i) => `<span class="zs-strich${i % 5 === 0 ? ' lang' : ''}" style="left:${i * 10}%"></span>
      ${i === 0 || i === 10 || alleZahlen ? `<span class="zs-zahl${alleZahlen && i % 10 ? ' klein' : ''}" style="left:${i * 10}%">${zahlText(a + i * s)}</span>` : ''}`).join('');
    return `<div class="zs-strahl">
      <div class="zs-spur"><span class="zs-linie"></span></div>
      <div class="zs-skala">${striche}<span class="zs-pfeil" style="left:${k * 10}%">▼</span></div>
    </div>`;
  }

  function rechts() {
    if (modus === 'suchen') {
      return `<h2 class="bereich-titel">Wo liegt diese Zahl?</h2>
        <p class="rr-gross">${zahlText(ziel)}</p>
        <ol class="zs-weg">${weg.map(w => `<li>zwischen ${zahlText(w[0])} und ${zahlText(w[1])}</li>`).join('')}${fertig ? `<li><b>genau bei ${zahlText(ziel)}</b></li>` : ''}</ol>
        ${fertig ? `<p class="tb-antwort gut">Gefunden! ${zerlegung()}</p>` : ''}`;
    }
    return `<h2 class="bereich-titel">Welche Zahl zeigt der Pfeil?</h2>
      <p>${zahlFeld('zs-ein', eing['zs-ein'], 6, 'Zahl am Pfeil')}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zs="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      <p class="leise">Zuerst: Wie groß ist ein Schritt von Strich zu Strich?</p>`;
  }

  const zerlegung = () => {
    const teile = String(ziel).split('').map((d, i, a) => Number(d) * 10 ** (a.length - 1 - i)).filter(Boolean);
    return `${zahlText(ziel)} = ${teile.map(zahlText).join(' + ')}`;
  };

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'suchen' ? 'Zahlen auf dem Zahlenstrahl' : 'Zahlenstrahl ablesen');
    g.links.innerHTML = modus === 'suchen' ? strahlSuchen() : strahlAblesen();
    g.rechts.innerHTML = rechts();
  }

  async function segment(i) {
    const von = start + i * einheit, bis = von + einheit;
    if (ziel < von || ziel >= bis) {
      fehler = i; zeichne(); fehler = null;
      g.sprich(`${zahlText(ziel)} liegt nicht zwischen ${zahlText(von)} und ${zahlText(bis)}. Ist sie ${ziel < von ? 'kleiner' : 'größer'}?`, 'tipp');
      return;
    }
    beschaeftigt = true;
    weg.push([von, bis]);
    g.rechts.innerHTML = rechts();
    const spur = root.querySelector('[data-spur]');
    root.querySelector(`[data-seg="${i}"]`)?.classList.add('gewaehlt');
    spur.style.setProperty('--i', i);
    root.querySelector('.zs-strahl').classList.add('zoom');
    g.sprich(`Richtig: zwischen ${zahlText(von)} und ${zahlText(bis)}. Die Lupe vergrößert diesen Abschnitt.`);
    await warte(900);
    start = von; einheit /= 10;
    zeichne();
    root.querySelector('.zs-strahl').classList.add('rein');
    beschaeftigt = false;
  }

  function tick(z) {
    if (z === ziel) {
      fertig = true; zeichne();
      g.sprich(`Super! Du hast ${zahlText(ziel)} Schritt für Schritt gefunden.`, 'fertig');
    } else {
      fehler = 100 + (z - start); zeichne(); fehler = null;
      g.sprich(`Das ist ${zahlText(z)}. Gesucht ist ${zahlText(ziel)} – geh ${Math.abs(ziel - z)} ${ziel > z ? 'nach rechts' : 'nach links'}.`, 'tipp');
    }
  }

  function tipp() {
    if (modus === 'suchen') {
      if (fertig) return;
      const stelle = Math.floor((ziel - start) / einheit);
      g.sprich(einheit === 1 ? `Die Einerziffer von ${zahlText(ziel)} ist ${ziel % 10}.` : `Schau auf die Ziffer an der ${{ 10000: 'Zehntausender', 1000: 'Tausender', 100: 'Hunderter', 10: 'Zehner' }[einheit]}-Stelle: Es ist eine ${stelle}. Also der Abschnitt ab ${zahlText(start + stelle * einheit)}.`, 'tipp');
    } else {
      alleZahlen = true; zeichne();
      g.sprich(`Von ${zahlText(ab.a)} bis ${zahlText(ab.a + 10 * ab.s)} sind es 10 Schritte. Ein Schritt ist also ${zahlText(10 * ab.s)} : 10 = ${zahlText(ab.s)}.`, 'tipp');
    }
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const sg = e.target.closest('[data-seg]');
    if (sg) { segment(Number(sg.dataset.seg)); return; }
    const tk = e.target.closest('[data-tick]');
    if (tk && !fertig) { tick(Number(tk.dataset.tick)); return; }
    const b = e.target.closest('[data-zs]');
    if (!b) return;
    if (b.dataset.zs === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.zs === 'tipp') tipp();
    if (b.dataset.zs === 'pruefen') {
      const soll = ab.a + ab.k * ab.s, ein = Number(eing['zs-ein']);
      bewertung = ein === soll && eing['zs-ein'] !== '' ? { ok: true, text: `Richtig: ${zahlText(soll)}. Ein Schritt ist ${zahlText(ab.s)}.` } : { ok: false, text: 'Noch nicht. Finde zuerst heraus, wie groß ein Schritt ist.' };
      if (bewertung.ok) alleZahlen = true;
      zeichne();
    }
  });

  function startText() {
    g.sprich(modus === 'suchen'
      ? 'Suche die Zahl auf dem Zahlenstrahl. Tippe den richtigen Abschnitt an – die Lupe vergrößert ihn.'
      : 'Nur der Anfang und das Ende sind beschriftet. Welche Zahl zeigt der Pfeil?');
  }

  neu(); zeichne(); startText();
}
