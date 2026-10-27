/* Mathematik: Großer Rechenrahmen mit 7 Stangen (Einer bis Millionen).
   Perlen werden nach links geschoben, um zu zählen. 10 Perlen auf einer Stange werden gegen 1 Perle der nächsten Stange getauscht.
   Modi: Zahl legen, Zahl lesen, Runden (mit Animation). */

import { geruest, zufall, wahl, warte, antwortHtml, zahlenMerken } from './geruest.js';

const STANGEN = [
  { name: 'Millionen', kurz: 'M', farbe: 'gruen' },
  { name: 'Hunderttausender', kurz: 'HT', farbe: 'rot' },
  { name: 'Zehntausender', kurz: 'ZT', farbe: 'blau' },
  { name: 'Tausender', kurz: 'T', farbe: 'gruen' },
  { name: 'Hunderter', kurz: 'H', farbe: 'rot' },
  { name: 'Zehner', kurz: 'Z', farbe: 'blau' },
  { name: 'Einer', kurz: 'E', farbe: 'gruen' },
];
const RUNDEN = [{ stelle: 5, name: 'Zehner' }, { stelle: 4, name: 'Hunderter' }, { stelle: 3, name: 'Tausender' }, { stelle: 2, name: 'Zehntausender' }, { stelle: 1, name: 'Hunderttausender' }];

/** Zahl mit schmalen Leerzeichen in Dreiergruppen. */
export const zahlText = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const ziffern = n => String(n).padStart(7, '0').split('').map(Number);
const ausZiffern = z => z.reduce((a, d) => a * 10 + d, 0);

export function starteRechenrahmen(root) {
  let modus = 'legen';
  let stand = [0, 0, 0, 0, 0, 0, 0];
  let ziel = 0, eing = {}, bewertung = null;
  let rund = null, beschaeftigt = false;

  const g = geruest(root, {
    etikett: 'Rechenrahmen', titel: '',
    reiter: [{ id: 'legen', titel: 'Zahl legen' }, { id: 'lesen', titel: 'Zahl lesen' }, { id: 'runden', titel: 'Runden' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-rr="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-rr="neu">＋ Neue Zahl</button>`,
  });
  zahlenMerken(root, eing);

  function zufallsZahl() {
    const stellen = zufall(4, 7);
    let z;
    do { z = Array.from({ length: stellen }, (_, i) => (i === 0 ? zufall(1, 9) : Math.random() < 0.2 ? 0 : zufall(0, 9))); } while (z.every(d => d === 0));
    return Number(z.join(''));
  }

  function neu() {
    bewertung = null; eing['rr-ein'] = ''; rund = null;
    ziel = zufallsZahl();
    if (modus === 'legen') stand = [0, 0, 0, 0, 0, 0, 0];
    if (modus === 'lesen') stand = ziffern(ziel);
    if (modus === 'runden') {
      const moeglich = RUNDEN.filter(r => String(ziel).length > 7 - r.stelle);
      const r = wahl(moeglich);
      const einheit = 10 ** (6 - r.stelle);
      const ab = Math.floor(ziel / einheit) * einheit;
      rund = { ...r, einheit, ab, auf: ab + einheit, gewaehlt: null };
      if (ab === ziel) { ziel += zufall(1, einheit - 1); rund.ab = Math.floor(ziel / einheit) * einheit; rund.auf = rund.ab + einheit; }
      if (rund.auf >= 1e7) { neu(); return; }
      stand = ziffern(ziel);
    }
  }

  /* ---------- Rahmen: einmal aufbauen, danach nur Perlen verschieben ---------- */
  function rahmenHtml() {
    return `<div class="rr-rahmen" role="group" aria-label="Rechenrahmen">
      ${STANGEN.map((s, i) => `
        <div class="rr-zeile${rund && i > rund.stelle ? ' rr-unter' : ''}${rund && i === rund.stelle ? ' rr-rundstelle' : ''}" data-zeile="${i}">
          <span class="rr-name" title="${s.name}">${s.kurz}</span>
          <div class="rr-stange">${Array.from({ length: 10 }, (_, k) => `<button type="button" class="rr-perle rr-${s.farbe}" data-s="${i}" data-k="${k}" aria-label="${s.name}, Perle ${k + 1}"></button>`).join('')}</div>
          <span class="rr-zahl" data-ziffer="${i}">0</span>
        </div>`).join('')}
    </div>`;
  }

  function setzePerlen() {
    root.querySelectorAll('.rr-zeile').forEach((z, i) => {
      const n = stand[i];
      z.querySelectorAll('.rr-perle').forEach((p, k) => {
        // gezählte Perlen links, der Rest rechts
        p.style.left = k < n ? `calc(${k} * var(--rr-p))` : `calc(100% - ${10 - k} * var(--rr-p))`;
        p.classList.toggle('gezaehlt', k < n);
      });
      const zf = z.querySelector('.rr-zahl');
      zf.textContent = modus === 'lesen' && !bewertung?.ok ? '' : n;
    });
    const anzeige = root.querySelector('[data-g="stand"]');
    if (anzeige) anzeige.textContent = zahlText(ausZiffern(stand.map(d => Math.min(d, 9)))) + (stand.some(d => d > 9) ? ' …' : '');
  }

  function rechts() {
    if (modus === 'legen') {
      return `<h2 class="bereich-titel">Lege diese Zahl</h2>
        <p class="rr-gross">${zahlText(ziel)}</p>
        <p class="leise">Tippe eine Perle an: Sie und alle davor wandern nach links. Links liegende Perlen zählen.</p>
        <p>Gelegt: <b data-g="stand"></b></p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-rr="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    if (modus === 'lesen') {
      return `<h2 class="bereich-titel">Welche Zahl ist gelegt?</h2>
        <p><input class="gs-ein rr-ein" id="rr-ein" data-zahl inputmode="numeric" maxlength="9" value="${eing['rr-ein'] ?? ''}" aria-label="Zahl"></p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-rr="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Zähle auf jeder Stange die Perlen links. Leere Stangen bedeuten eine 0.</p>`;
    }
    const { name, ab, auf, gewaehlt } = rund;
    return `<h2 class="bereich-titel">Runde auf ${name}</h2>
      <p class="rr-gross">${zahlText(ziel)}</p>
      <p>Liegt die Zahl näher an …</p>
      <div class="rr-wahl">
        <button type="button" class="kn-gross${gewaehlt === 'ab' ? ' gewaehlt' : ''}" data-rund="ab">${zahlText(ab)}</button>
        <button type="button" class="kn-gross${gewaehlt === 'auf' ? ' gewaehlt' : ''}" data-rund="auf">${zahlText(auf)}</button>
      </div>
      <div class="rr-strahl">${strahl()}</div>
      ${antwortHtml(bewertung)}`;
  }

  /** Kleiner Zahlenstrahl zwischen den beiden Nachbarzahlen. */
  function strahl() {
    const { ab, auf, einheit } = rund;
    const anteil = (ziel - ab) / einheit;
    return `<svg viewBox="0 0 300 70" aria-hidden="true">
      <line x1="40" y1="35" x2="260" y2="35" class="rr-s-linie"/>
      <line x1="150" y1="25" x2="150" y2="45" class="rr-s-mitte"/>
      <line x1="40" y1="22" x2="40" y2="48" class="rr-s-linie"/><line x1="260" y1="22" x2="260" y2="48" class="rr-s-linie"/>
      <text x="40" y="66" class="rr-s-text">${zahlText(ab)}</text><text x="260" y="66" class="rr-s-text">${zahlText(auf)}</text>
      <text x="150" y="18" class="rr-s-text klein">Mitte ${zahlText(ab + einheit / 2)}</text>
      <circle cx="${40 + anteil * 220}" cy="35" r="7" class="rr-s-punkt"/></svg>`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ legen: 'Große Zahlen legen', lesen: 'Große Zahlen lesen', runden: 'Runden' }[modus]);
    g.links.innerHTML = `${rahmenHtml()}<div class="rr-tafel">${STANGEN.map(s => `<span>${s.kurz}</span>`).join('')}</div>`;
    g.rechts.innerHTML = rechts();
    setzePerlen();
  }

  /** 10 Perlen auf einer Stange: zurückschieben und 1 Perle auf der nächsten Stange dazu. */
  async function tauschen(i) {
    if (i === 0) { stand[0] = 9; setzePerlen(); g.sprich('Mehr als 9 999 999 passt nicht auf den Rahmen.', 'tipp'); return; }
    beschaeftigt = true;
    g.sprich(`10 ${STANGEN[i].name} sind 1 ${STANGEN[i - 1].name === 'Millionen' ? 'Million' : STANGEN[i - 1].name}. Tauschen!`, 'tipp');
    root.querySelector(`[data-zeile="${i}"]`)?.classList.add('rr-blitz');
    await warte(700);
    stand[i] = 0; stand[i - 1] += 1; setzePerlen();
    root.querySelector(`[data-zeile="${i}"]`)?.classList.remove('rr-blitz');
    await warte(600);
    beschaeftigt = false;
    if (stand[i - 1] === 10) await tauschen(i - 1);
  }

  async function runden(richtung) {
    beschaeftigt = true;
    const { stelle, name, ab, auf } = rund;
    rund.gewaehlt = richtung;
    const soll = ziel - ab >= rund.einheit / 2 ? 'auf' : 'ab';
    const ziffer = stand[stelle + 1];
    bewertung = richtung === soll
      ? { ok: true, text: `Richtig: ${zahlText(ziel)} ≈ ${zahlText(soll === 'ab' ? ab : auf)}. Die Ziffer rechts neben den ${name}n ist ${ziffer} – ${ziffer >= 5 ? 'ab 5 wird aufgerundet' : 'unter 5 wird abgerundet'}.` }
      : { ok: false, text: `Schau auf die Stange rechts neben den ${name}n: Dort liegen ${ziffer} Perlen. ${ziffer >= 5 ? 'Ab 5 wird aufgerundet.' : 'Unter 5 wird abgerundet.'}` };
    g.rechts.innerHTML = rechts();
    if (richtung !== soll) { beschaeftigt = false; return; }
    // Animation: Stangen unter der Rundungsstelle leeren, ggf. eine Perle dazu
    for (let i = 6; i > stelle; i--) {
      if (!stand[i]) continue;
      stand[i] = 0; setzePerlen(); await warte(450);
    }
    if (soll === 'auf') {
      stand[stelle] += 1; setzePerlen(); await warte(500);
      if (stand[stelle] === 10) await tauschen(stelle);
    }
    g.sprich(`Gerundet: ${zahlText(soll === 'ab' ? ab : auf)}. Alle Stangen rechts von den ${name}n sind jetzt leer.`, 'fertig');
    beschaeftigt = false;
  }

  function pruefen() {
    if (modus === 'legen') {
      const ist = ausZiffern(stand);
      const zz = ziffern(ziel);
      const falsch = stand.map((d, i) => (d !== zz[i] ? STANGEN[i].name : null)).filter(Boolean);
      bewertung = ist === ziel ? { ok: true, text: 'Richtig gelegt!' } : { ok: false, text: `Noch nicht. Schau noch einmal bei: ${falsch.join(', ')}.` };
      if (bewertung.ok) g.sprich(`${zahlText(ziel)}: ${zz.map((d, i) => (d ? `${d} ${STANGEN[i].name}` : null)).filter(Boolean).join(', ')}.`, 'fertig');
    } else {
      const ein = Number((eing['rr-ein'] || '').replace(/\D/g, ''));
      bewertung = ein === ziel ? { ok: true, text: `Richtig: ${zahlText(ziel)}` } : { ok: false, text: 'Noch nicht. Lies Stange für Stange von oben nach unten – leere Stangen sind Nullen.' };
    }
    g.rechts.innerHTML = rechts(); setzePerlen();
  }

  function tipp() {
    if (modus === 'legen') {
      const zz = ziffern(ziel);
      const i = stand.findIndex((d, k) => d !== zz[k]);
      if (i < 0) { g.sprich('Alles richtig – drücke auf Prüfen.', 'tipp'); return; }
      g.sprich(`Auf die Stange der ${STANGEN[i].name} gehören ${zz[i]} Perlen.`, 'tipp');
      root.querySelector(`[data-zeile="${i}"]`)?.classList.add('rr-hinweis');
    }
    if (modus === 'lesen') {
      root.querySelectorAll('.rr-zahl').forEach(z => (z.textContent = stand[Number(z.dataset.ziffer)]));
      g.sprich('Die Ziffern stehen jetzt neben den Stangen. Schreibe sie der Reihe nach auf.', 'tipp');
    }
    if (modus === 'runden') g.sprich(`Entscheidend ist die Stange direkt unter den ${rund.name}n (blass): 0 bis 4 Perlen → abrunden, 5 bis 9 → aufrunden.`, 'tipp');
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt && !beschaeftigt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const p = e.target.closest('.rr-perle');
    if (p && modus === 'legen' && !beschaeftigt) {
      const i = Number(p.dataset.s), k = Number(p.dataset.k);
      stand[i] = k < stand[i] ? k : k + 1;   // gezählte Perle antippen = zurückschieben
      bewertung = null;
      root.querySelectorAll('.rr-hinweis').forEach(z => z.classList.remove('rr-hinweis'));
      setzePerlen(); g.rechts.innerHTML = rechts(); setzePerlen();
      if (stand[i] === 10) tauschen(i).then(() => { g.rechts.innerHTML = rechts(); setzePerlen(); });
      return;
    }
    const r = e.target.closest('[data-rund]');
    if (r && !beschaeftigt && !bewertung?.ok) { runden(r.dataset.rund); return; }
    const b = e.target.closest('[data-rr]');
    if (!b || beschaeftigt) return;
    if (b.dataset.rr === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.rr === 'pruefen') pruefen();
    if (b.dataset.rr === 'tipp') tipp();
  });

  function startText() {
    g.sprich({
      legen: 'Schiebe auf jeder Stange so viele Perlen nach links, wie die Ziffer sagt. Oben sind die Millionen, unten die Einer.',
      lesen: 'Lies die Zahl vom Rechenrahmen ab. Oben sind die Millionen, unten die Einer.',
      runden: 'Liegt die Zahl näher an der kleineren oder an der größeren Nachbarzahl?',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
