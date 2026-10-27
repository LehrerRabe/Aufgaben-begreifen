/* Mathematik: Rechnen mit Geld.
   Münzen und Scheine aus der Kasse auf die Ablage legen.
   „Betrag legen“ und „Wechselgeld“ (vom Preis aus hochzählen). */

import { geruest, zufall, wahl, antwortHtml } from './geruest.js';

/** Werte in Cent. Generische Gestaltung (keine Nachbildung echter Scheine). */
const GELD = [
  { w: 5000, art: 'schein', farbe: '#f0a14a' }, { w: 2000, art: 'schein', farbe: '#5b8fd8' }, { w: 1000, art: 'schein', farbe: '#e0726b' }, { w: 500, art: 'schein', farbe: '#9aa4b2' },
  { w: 200, art: 'bi', farbe: '' }, { w: 100, art: 'bi2', farbe: '' },
  { w: 50, art: 'gold' }, { w: 20, art: 'gold' }, { w: 10, art: 'gold' },
  { w: 5, art: 'kupfer' }, { w: 2, art: 'kupfer' }, { w: 1, art: 'kupfer' },
];

export const euro = c => `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')} €`;
const wertText = w => (w >= 100 ? `${w / 100} €` : `${w} ct`);

export function geldHtml(w, attrs = '') {
  const x = GELD.find(g => g.w === w);
  if (x.art === 'schein') return `<span class="gd-stueck gd-schein" style="--f:${x.farbe}" ${attrs}><b>${w / 100}</b><small>EURO</small></span>`;
  const gr = { 200: 3.1, 100: 2.9, 50: 2.8, 20: 2.6, 10: 2.3, 5: 2.5, 2: 2.25, 1: 1.95 }[w];
  return `<span class="gd-stueck gd-muenze gd-${x.art}" style="--d:${gr}rem" ${attrs}><b>${w >= 100 ? w / 100 : w}</b><small>${w >= 100 ? 'EURO' : 'CENT'}</small></span>`;
}

/** Wechselgeld mit möglichst wenigen Stücken. */
function gierig(betrag) {
  const r = []; let rest = betrag;
  for (const { w } of GELD) while (rest >= w) { r.push(w); rest -= w; }
  return r;
}

export function starteGeld(root) {
  let modus = 'legen';
  let ziel, preis, bezahlt, ablage = [], bewertung = null;

  const g = geruest(root, {
    etikett: 'Geld', titel: '',
    reiter: [{ id: 'legen', titel: 'Betrag legen' }, { id: 'wechsel', titel: 'Wechselgeld', unter: 'hochzählen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-gd="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-gd="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    ablage = []; bewertung = null;
    if (modus === 'legen') ziel = zufall(1, 60) * 100 + wahl([0, 5, 10, 20, 25, 40, 50, 75, 80, 95, zufall(1, 99)]);
    else {
      bezahlt = wahl([500, 1000, 2000, 5000]);
      do { preis = zufall(1, bezahlt / 10 - 1) * 10 + wahl([0, 0, 5, 9]); } while (preis >= bezahlt || bezahlt - preis < 20);
      ziel = bezahlt - preis;
    }
  }

  const summe = () => ablage.reduce((a, w) => a + w, 0);

  function links() {
    const sortiert = [...ablage.map((w, i) => [w, i])].sort((a, b) => b[0] - a[0]);
    let hoch = '';
    if (modus === 'wechsel' && ablage.length) {
      let s = preis;
      hoch = `<div class="gd-hoch"><span>${euro(preis)}</span>${sortiert.slice().reverse().map(([w]) => { s += w; return `<span class="gd-schritt">+ ${wertText(w)}</span><span>${euro(s)}</span>`; }).join('')}</div>`;
    }
    return `<div class="gd-ablage" aria-label="Ablage">
        ${ablage.length ? sortiert.map(([w, i]) => geldHtml(w, `data-weg="${i}" role="button" tabindex="0" aria-label="${wertText(w)} zurücklegen"`)).join('') : '<p class="leise">Tippe unten auf Geld, um es hierher zu legen. Tippe es hier an, um es zurückzulegen.</p>'}
      </div>
      ${hoch}
      <div class="gd-kasse" aria-label="Kasse">${GELD.map(({ w }) => `<button type="button" class="gd-fach" data-geld="${w}" aria-label="${wertText(w)}">${geldHtml(w)}</button>`).join('')}</div>`;
  }

  function rechts() {
    if (modus === 'legen') {
      return `<h2 class="bereich-titel">Lege genau diesen Betrag</h2>
        <p class="rr-gross">${euro(ziel)}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-gd="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Profi-Aufgabe: Schaffst du es mit ${gierig(ziel).length} Stücken?</p>`;
    }
    return `<h2 class="bereich-titel">Gib das Wechselgeld heraus</h2>
      <p class="gd-kauf">Preis: <b>${euro(preis)}</b><br>Bezahlt mit: ${geldHtml(bezahlt)}</p>
      <p class="leise">Zähle vom Preis aus hoch, bis du bei ${euro(bezahlt)} bist.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-gd="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'legen' ? 'Geldbeträge legen' : 'Wechselgeld herausgeben');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  function pruefen() {
    const s = summe();
    if (s === ziel) {
      const min = gierig(ziel).length;
      bewertung = { ok: true, text: `Richtig: ${euro(s)}.${ablage.length === min ? ' Mit so wenigen Stücken wie möglich!' : ` Es ginge auch mit nur ${min} Stücken.`}` };
      g.sprich(modus === 'wechsel' ? `${euro(preis)} + ${euro(ziel)} = ${euro(bezahlt)}. Das Wechselgeld ist ${euro(ziel)}.` : `Genau ${euro(ziel)}!`, 'fertig');
    } else {
      bewertung = { ok: false, text: `Auf der Ablage liegen ${euro(s)}. Das ist ${s > ziel ? 'zu viel' : 'zu wenig'}.` };
    }
    g.rechts.innerHTML = rechts();
  }

  function tipp() {
    if (modus === 'legen') {
      const fehlt = ziel - summe();
      if (fehlt < 0) { g.sprich(`Das ist ${euro(-fehlt)} zu viel. Lege etwas zurück.`, 'tipp'); return; }
      g.sprich(fehlt ? `Fang mit dem größten Geldstück an, das noch passt. Es fehlen ${euro(fehlt)}.` : 'Der Betrag stimmt – drücke auf Prüfen.', 'tipp');
    } else {
      const s = preis + summe();
      const naechst = s % 10 ? Math.ceil(s / 10) * 10 : s % 100 ? Math.ceil(s / 100) * 100 : Math.ceil(s / 500) * 500;
      g.sprich(s >= bezahlt ? (s === bezahlt ? 'Du bist beim bezahlten Betrag – drücke auf Prüfen.' : 'Das ist zu viel Wechselgeld.') : `Du bist bei ${euro(s)}. Zähle bis zur nächsten runden Zahl hoch: ${euro(Math.min(naechst, bezahlt))}.`, 'tipp');
    }
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const k = e.target.closest('[data-geld]');
    if (k) { ablage.push(Number(k.dataset.geld)); bewertung = null; zeichne(); return; }
    const w = e.target.closest('[data-weg]');
    if (w) { ablage.splice(Number(w.dataset.weg), 1); bewertung = null; zeichne(); return; }
    const b = e.target.closest('[data-gd]');
    if (!b) return;
    if (b.dataset.gd === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.gd === 'pruefen') pruefen();
    if (b.dataset.gd === 'tipp') tipp();
  });
  root.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-weg]')) { e.preventDefault(); e.target.click(); } });

  function startText() {
    g.sprich(modus === 'legen' ? 'Lege den Betrag mit Münzen und Scheinen.' : 'Jemand kauft etwas und bezahlt. Lege das Wechselgeld hin – du siehst, wie du hochzählst.');
  }

  neu(); zeichne(); startText();
}
