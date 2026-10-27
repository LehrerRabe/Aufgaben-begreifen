/* Mathematik: Überschlagen.
   1. Jede Zahl auf eine „glatte“ Nachbarzahl runden (Auswahl am kleinen Zahlenstrahl).
   2. Überschlag ausrechnen – er erscheint als Markierung auf dem Zahlenstrahl.
   3. Welches der angebotenen Ergebnisse kann stimmen? Die Kandidaten liegen sichtbar nah oder weit weg. */

import { geruest, zufall, wahl, mischen, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

function aufgabe() {
  const op = wahl(['+', '−', '·']);
  let a, b;
  if (op === '+') { a = zufall(110, 890); b = zufall(110, 890); if (Math.random() < 0.4) { a = zufall(1010, 8990); b = zufall(1010, 4990); } }
  if (op === '−') { a = zufall(400, 990); b = zufall(110, a - 100); if (Math.random() < 0.4) { a = zufall(3010, 9990); b = zufall(1010, a - 1000); } }
  if (op === '·') { a = zufall(12, 98); b = zufall(12, 49); if (Math.random() < 0.5) { a = zufall(110, 890); b = zufall(3, 9); } }
  const soll = op === '+' ? a + b : op === '−' ? a - b : a * b;
  return { a, b, op, soll };
}

/** Glatte Nachbarzahlen: bei der höchsten Stelle. */
function nachbarn(z) {
  const st = 10 ** (String(z).length - 1);
  const ab = Math.floor(z / st) * st;
  return { ab, auf: ab + st, st, naeher: z - ab < ab + st - z ? ab : ab + st };
}

function falscheKandidaten(soll) {
  const k = new Set([soll]);
  const versuche = [soll * 10, Math.round(soll / 10), soll + 10 ** (String(soll).length - 1) * zufall(2, 4), Math.max(1, soll - 10 ** (String(soll).length - 1) * zufall(2, 3))];
  for (const v of mischen(versuche)) if (k.size < 4 && v > 0) k.add(v);
  return [...k];
}

export function starteUeberschlag(root) {
  let auf, wahlA, wahlB, eing = {}, kandidaten, gewaehlt, bewertung = null, schritt;

  const g = geruest(root, {
    etikett: 'Überschlagen', titel: 'Kann das Ergebnis stimmen?',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-ue="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-ue="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    eing['ue-s'] = ''; gewaehlt = null; bewertung = null; schritt = 1;
    do { auf = aufgabe(); } while (ueberMit(rund(auf.a).naeher, rund(auf.b).naeher) <= 0);
    wahlA = rund(auf.a).ab === rund(auf.a).auf ? auf.a : null;
    wahlB = rund(auf.b).ab === rund(auf.b).auf ? auf.b : null;
    kandidaten = mischen(falscheKandidaten(auf.soll));
  }

  const rund = z => (auf.op === '·' && z < 10 ? { ab: z, auf: z, st: 1, naeher: z } : nachbarn(z));
  const ueberMit = (x, y) => (auf.op === '+' ? x + y : auf.op === '−' ? x - y : x * y);
  const ueber = () => ueberMit(wahlA, wahlB);

  function rundeHtml(z, wahl_, key) {
    const n = rund(z);
    if (n.ab === n.auf) return `<div class="ue-runde"><b>${z}</b> bleibt ${z} (schon einfach)</div>`;
    const pos = ((z - n.ab) / n.st) * 100;
    return `<div class="ue-runde">
      <div class="ue-mini"><span class="ue-linie"></span><span class="ue-pkt" style="left:${pos}%"></span><span class="ue-zahl" style="left:${pos}%">${zahlText(z)}</span>
        <span class="ue-ende l">${zahlText(n.ab)}</span><span class="ue-ende r">${zahlText(n.auf)}</span></div>
      <div class="ue-knoepfe">${[n.ab, n.auf].map(v => `<button type="button" class="kn-gross${wahl_ === v ? (v === n.naeher ? ' richtig' : ' falsch') : ''}" data-runde="${key}" data-wert="${v}">${zahlText(v)}</button>`).join('')}</div></div>`;
  }

  function strahlHtml() {
    const u = ueber();
    const max = u * 2.2, min = 0;
    const X = v => Math.min(96, 4 + ((v - min) / (max - min)) * 92);   // weit Entferntes steht am rechten Rand
    return `<div class="ue-strahl">
      <span class="ue-band" style="left:${X(u * 0.8)}%; width:${X(u * 1.2) - X(u * 0.8)}%"></span>
      <span class="ue-achse"></span>
      <span class="ue-ueber" style="left:${X(u)}%"><b>≈ ${zahlText(u)}</b></span>
      ${[...kandidaten].sort((x, y) => x - y).map((k, i) => `<button type="button" class="ue-kand${gewaehlt === k ? (k === auf.soll ? ' richtig' : ' falsch') : ''}" style="left:${X(k)}%; --reihe:${i}" data-kand="${k}">${zahlText(k)}${k > max ? ' »' : ''}</button>`).join('')}
    </div>
    <p class="leise">Das gelbe Band zeigt, wo das Ergebnis ungefähr liegen muss.</p>`;
  }

  function links() {
    let h = `<p class="kr-aufgabe">${zahlText(auf.a)} ${auf.op} ${zahlText(auf.b)} = ?</p>
      <h3 class="eh-zwischen">1. Runde jede Zahl auf eine einfache Zahl</h3>
      ${rundeHtml(auf.a, wahlA, 'a')}${rundeHtml(auf.b, wahlB, 'b')}`;
    if (schritt >= 2) {
      h += `<h3 class="eh-zwischen">2. Rechne den Überschlag</h3>
        <p class="ut-frage">${zahlText(wahlA)} ${auf.op} ${zahlText(wahlB)} = ${zahlFeld('ue-s', eing['ue-s'], 6, 'Überschlag')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-ue="ueber">✓ Prüfen</button></div>`;
    }
    return h;
  }

  function rechts() {
    if (schritt < 3) return `<h2 class="bereich-titel">So geht's</h2><ol class="et-schritte"><li>Runde beide Zahlen.</li><li>Rechne mit den einfachen Zahlen im Kopf.</li><li>Prüfe, welches Ergebnis in der Nähe liegt.</li></ol>${antwortHtml(bewertung)}`;
    return `<h2 class="bereich-titel">3. Welches Ergebnis kann stimmen?</h2>${strahlHtml()}${antwortHtml(bewertung)}`;
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  root.addEventListener('click', e => {
    const r = e.target.closest('[data-runde]');
    if (r && schritt === 1) {
      const v = Number(r.dataset.wert), key = r.dataset.runde, z = key === 'a' ? auf.a : auf.b;
      if (key === 'a') wahlA = v; else wahlB = v;
      if (v !== rund(z).naeher) g.sprich(`${zahlText(z)} liegt näher an ${zahlText(rund(z).naeher)}. Schau auf den kleinen Zahlenstrahl.`, 'tipp');
      const okA = (wahlA ?? -1) === rund(auf.a).naeher || rund(auf.a).ab === rund(auf.a).auf, okB = (wahlB ?? -1) === rund(auf.b).naeher || rund(auf.b).ab === rund(auf.b).auf;
      if (okA && okB) { schritt = 2; g.sprich('Gut gerundet! Jetzt rechne mit den einfachen Zahlen.'); }
      zeichne(); root.querySelector('#ue-s')?.focus({ preventScroll: true }); return;
    }
    const k = e.target.closest('[data-kand]');
    if (k && schritt === 3 && !bewertung?.ok) {
      gewaehlt = Number(k.dataset.kand);
      const ok = gewaehlt === auf.soll;
      bewertung = ok ? { ok, text: `Richtig: ${zahlText(auf.a)} ${auf.op} ${zahlText(auf.b)} = ${zahlText(auf.soll)}. Es liegt nah am Überschlag ${zahlText(ueber())}.` }
        : { ok, text: `${zahlText(gewaehlt)} liegt zu weit weg vom Überschlag ${zahlText(ueber())}.` };
      if (ok) g.sprich('Mit dem Überschlag erkennst du falsche Ergebnisse, ohne genau zu rechnen.', 'fertig');
      g.rechts.innerHTML = rechts(); return;
    }
    const b = e.target.closest('[data-ue]');
    if (!b) return;
    if (b.dataset.ue === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.ue === 'ueber') {
      const ok = Number((eing['ue-s'] || '').replace(/\D/g, '')) === ueber();
      if (ok) { schritt = 3; bewertung = null; g.sprich(`Überschlag: etwa ${zahlText(ueber())}.`); zeichne(); }
      else { bewertung = { ok: false, text: 'Der Überschlag stimmt noch nicht – rechne mit den gerundeten Zahlen.' }; g.rechts.innerHTML = rechts(); }
    }
    if (b.dataset.ue === 'tipp') g.sprich(schritt === 1 ? 'Runde auf die höchste Stelle: Liegt die Zahl näher an der kleineren oder der größeren glatten Zahl?' : schritt === 2 ? 'Rechne nur mit den gerundeten Zahlen – das geht im Kopf.' : 'Das richtige Ergebnis liegt im gelben Band nahe beim Überschlag.', 'tipp');
  });

  function start() { g.sprich('Bevor du genau rechnest: Wie groß wird das Ergebnis ungefähr?'); }
  neu(); zeichne(); start();
}
