/* Mathematik: Spiegelbrett.
   Auf einer Seite liegt ein Muster. Das Kind malt das Spiegelbild auf die andere Seite.
   „Spiegel klappen“ klappt die Vorlage sichtbar über die Achse (bzw. dreht sie um den Punkt). */

import { geruest, zufall, wahl, warte, antwortHtml } from './geruest.js';

const N = 10;
const FARBEN = ['f1', 'f2', 'f3'];

const MODI = {
  senkrecht: { titel: 'Achse senkrecht', unter: 'links ↔ rechts', bild: (r, c) => [r, N - 1 - c], vorlage: (r, c) => c < N / 2, klappen: 'rotateY(180deg)' },
  waagerecht: { titel: 'Achse waagerecht', unter: 'oben ↕ unten', bild: (r, c) => [N - 1 - r, c], vorlage: (r) => r < N / 2, klappen: 'rotateX(180deg)' },
  schraeg: { titel: 'Achse schräg', unter: 'diagonal', bild: (r, c) => [c, r], vorlage: (r, c) => r > c, klappen: 'rotate3d(1, 1, 0, 180deg)' },
  punkt: { titel: 'Punktspiegelung', unter: 'halbe Drehung', bild: (r, c) => [N - 1 - r, N - 1 - c], vorlage: (r, c) => c < N / 2, klappen: 'rotate(180deg)' },
  frei: { titel: 'Frei gestalten', unter: 'Spiegelbild live', bild: (r, c) => [r, N - 1 - c], vorlage: (r, c) => c < N / 2, klappen: 'rotateY(180deg)' },
};

export function starteSpiegel(root) {
  let modus = 'senkrecht';
  let vorgabe = new Map();   // "r,c" -> Farbe (auf der Vorlagenseite)
  let gemalt = new Map();    // "r,c" -> Farbe (auf der Bildseite)
  let farbe = 'f1';
  let geklappt = false;
  let bewertung = null, markiert = new Map();

  const g = geruest(root, {
    etikett: 'Spiegelbrett', titel: 'Male das Spiegelbild',
    reiter: Object.entries(MODI).map(([id, m]) => ({ id, titel: m.titel, unter: m.unter })),
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-sp="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-sp="neu">＋ Neues Muster</button>`,
  });

  const m = () => MODI[modus];
  const key = (r, c) => `${r},${c}`;
  const istVorlage = (r, c) => m().vorlage(r, c) && !(modus === 'schraeg' && r === c);
  const istBild = (r, c) => !m().vorlage(r, c) && !(modus === 'schraeg' && r === c);

  function neuesMuster() {
    vorgabe = new Map(); gemalt = new Map(); geklappt = false; bewertung = null; markiert = new Map();
    if (modus === 'frei') return;
    const ziel = zufall(7, 12);
    let r, c;
    do { r = zufall(0, N - 1); c = zufall(0, N - 1); } while (!istVorlage(r, c));
    const farben = [wahl(FARBEN)]; if (Math.random() < 0.6) farben.push(wahl(FARBEN.filter(f => f !== farben[0])));
    let schritte = 0;
    while (vorgabe.size < ziel && schritte++ < 400) {
      vorgabe.set(key(r, c), farben[vorgabe.size % farben.length === 0 || Math.random() < 0.7 ? 0 : 1] ?? farben[0]);
      const [dr, dc] = wahl([[0, 1], [1, 0], [0, -1], [-1, 0]]);
      if (r + dr >= 0 && r + dr < N && c + dc >= 0 && c + dc < N && istVorlage(r + dr, c + dc)) { r += dr; c += dc; }
    }
  }

  function brettHtml() {
    let zellen = '';
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const k = key(r, c);
      const v = vorgabe.get(k), p = gemalt.get(k);
      const seite = istVorlage(r, c) ? 'vorlage' : istBild(r, c) ? 'bild' : 'achse';
      const f = v || p || '';
      const mk = markiert.get(k) || '';
      zellen += `<button type="button" class="sp-z ${seite} ${f} ${mk}" data-z="${k}" aria-label="Feld ${r + 1}, ${c + 1}"></button>`;
    }
    let geist = '';
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const v = modus === 'frei' ? gemalt.get(key(r, c)) && istVorlage(r, c) ? gemalt.get(key(r, c)) : '' : vorgabe.get(key(r, c));
      geist += `<i class="sp-g ${v || ''}"></i>`;
    }
    const achse = { senkrecht: 'sp-achse-s', waagerecht: 'sp-achse-w', schraeg: 'sp-achse-d', punkt: 'sp-punkt', frei: 'sp-achse-s' }[modus];
    return `
      <div class="sp-brett-huelle">
        <div class="sp-brett">${zellen}</div>
        <div class="sp-klapp${geklappt ? ' zu' : ''}" id="sp-klapp" style="--klappen:${m().klappen}">${geist}</div>
        <div class="${achse}" aria-hidden="true"></div>
      </div>
      <div class="sp-palette" role="group" aria-label="Farbe wählen">
        ${FARBEN.map(f => `<button type="button" class="sp-farbe ${f}${farbe === f ? ' gewaehlt' : ''}" data-farbe="${f}" aria-label="Farbe ${f.slice(1)}"></button>`).join('')}
        <button type="button" class="sp-farbe radierer${farbe === '' ? ' gewaehlt' : ''}" data-farbe="" aria-label="Radiergummi">⌫</button>
      </div>`;
  }

  function rechtsHtml() {
    if (modus === 'frei') {
      return `<h2 class="bereich-titel">Frei gestalten</h2>
        <p>Male auf der linken Seite. Das Spiegelbild erscheint sofort rechts – wie in einem Spiegel.</p>
        <p class="leise">Achte darauf: Was links nah an der Achse liegt, liegt auch rechts nah an der Achse.</p>
        <button type="button" class="kn-gross kn-leise" data-sp="leeren">Brett leeren</button>`;
    }
    const text = {
      senkrecht: 'Jedes Feld hat auf der anderen Seite der Achse einen Partner – genauso weit von der Achse entfernt.',
      waagerecht: 'Was oben nah an der Achse liegt, liegt unten genauso nah an der Achse.',
      schraeg: 'Bei der schrägen Achse wird aus „Zeile“ „Spalte“: Ein Feld 3 rechts und 5 runter landet 5 rechts und 3 runter.',
      punkt: 'Bei der Punktspiegelung wird alles um den Punkt halb herumgedreht: Oben wird unten, links wird rechts.',
    }[modus];
    return `<h2 class="bereich-titel">${m().titel}</h2>
      <p>${text}</p>
      <div class="gs-pruef">
        <button type="button" class="kn-gross kn-haupt" data-sp="pruefen">✓ Prüfen</button>
        <button type="button" class="kn-gross" data-sp="klappen">${geklappt ? 'Spiegel zurück' : modus === 'punkt' ? '⟳ Vorlage drehen' : '⇋ Spiegel klappen'}</button>
      </div>
      ${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'frei' ? 'Gestalte ein Spiegelbild' : modus === 'punkt' ? 'Spiegele am Punkt' : 'Male das Spiegelbild');
    g.links.innerHTML = brettHtml();
    g.rechts.innerHTML = rechtsHtml();
  }

  function soll() {
    const s = new Map();
    for (const [k, f] of vorgabe) { const [r, c] = k.split(',').map(Number); const [r2, c2] = m().bild(r, c); s.set(key(r2, c2), f); }
    return s;
  }

  function pruefen() {
    const s = soll();
    markiert = new Map();
    let falsch = 0, fehlt = 0;
    for (const [k, f] of s) if (gemalt.get(k) !== f) { markiert.set(k, gemalt.has(k) ? 'falsch' : 'fehlt'); gemalt.has(k) ? falsch++ : fehlt++; }
    for (const [k] of gemalt) if (!s.has(k)) { markiert.set(k, 'falsch'); falsch++; }
    bewertung = !falsch && !fehlt
      ? { ok: true, text: 'Perfekt gespiegelt!' }
      : { ok: false, text: `${fehlt ? `${fehlt} ${fehlt === 1 ? 'Feld fehlt' : 'Felder fehlen'}` : ''}${fehlt && falsch ? ', ' : ''}${falsch ? `${falsch} ${falsch === 1 ? 'Feld ist' : 'Felder sind'} falsch` : ''}. Klapp den Spiegel, um zu vergleichen.` };
    if (bewertung.ok) g.sprich('Super! Vorlage und Spiegelbild passen genau aufeinander.', 'fertig');
    zeichne();
  }

  async function klappen() {
    geklappt = !geklappt;
    const el = root.querySelector('#sp-klapp');
    if (el) el.classList.toggle('zu', geklappt);
    g.rechts.innerHTML = rechtsHtml();
    if (geklappt) {
      await warte(900);
      g.sprich(modus === 'punkt'
        ? 'Die Vorlage wurde um den Punkt halb gedreht. Wo sie jetzt liegt, gehört das Bild hin.'
        : 'Die Vorlage ist über die Achse geklappt. Wo sie jetzt liegt, gehört das Spiegelbild hin.', 'tipp');
    }
  }

  function tipp() {
    if (modus === 'frei') { g.sprich('Male links ein Muster und beobachte die rechte Seite.', 'tipp'); return; }
    const s = soll();
    for (const [k, f] of s) {
      if (gemalt.get(k) === f) continue;
      const [r, c] = k.split(',').map(Number);
      const herkunft = [...vorgabe.keys()].find(v => { const [a, b] = v.split(',').map(Number); const [x, y] = m().bild(a, b); return x === r && y === c; });
      const [a, b] = herkunft.split(',').map(Number);
      let erkl;
      if (modus === 'senkrecht') { const d = Math.abs(b - (N / 2 - 0.5)) + 0.5; erkl = `Das Feld in Zeile ${a + 1} liegt ${d} ${d === 1 ? 'Feld' : 'Felder'} links von der Achse. Sein Spiegelbild liegt in derselben Zeile ${d} ${d === 1 ? 'Feld' : 'Felder'} rechts davon.`; }
      else if (modus === 'waagerecht') { const d = Math.abs(a - (N / 2 - 0.5)) + 0.5; erkl = `Das Feld in Spalte ${b + 1} liegt ${d} ${d === 1 ? 'Feld' : 'Felder'} über der Achse. Sein Spiegelbild liegt ${d} ${d === 1 ? 'Feld' : 'Felder'} darunter.`; }
      else if (modus === 'schraeg') erkl = `Das Feld in Zeile ${a + 1}, Spalte ${b + 1} landet in Zeile ${b + 1}, Spalte ${a + 1}.`;
      else erkl = `Das Feld in Zeile ${a + 1}, Spalte ${b + 1} landet nach der halben Drehung in Zeile ${r + 1}, Spalte ${c + 1}.`;
      markiert = new Map([[k, 'tipp-ziel']]);
      zeichne();
      g.sprich(erkl, 'tipp');
      return;
    }
    g.sprich('Alle nötigen Felder sind richtig gemalt. Entferne nur noch Felder, die zu viel sind – dann prüfen.', 'tipp');
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neuesMuster(); zeichne(); startText(); return; }
    const fb = e.target.closest('[data-farbe]');
    if (fb) { farbe = fb.dataset.farbe; zeichne(); return; }
    const z = e.target.closest('[data-z]');
    if (z) {
      const [r, c] = z.dataset.z.split(',').map(Number);
      const k = z.dataset.z;
      if (modus === 'frei') {
        if (!istVorlage(r, c)) { g.sprich('Male auf der linken Seite – rechts erscheint das Spiegelbild von selbst.'); return; }
        const [r2, c2] = m().bild(r, c);
        if (!farbe || gemalt.get(k) === farbe) { gemalt.delete(k); gemalt.delete(key(r2, c2)); }
        else { gemalt.set(k, farbe); gemalt.set(key(r2, c2), farbe); }
        zeichne(); return;
      }
      if (!istBild(r, c)) { g.sprich(modus === 'schraeg' && r === c ? 'Felder auf der Achse bleiben, wo sie sind.' : 'Das ist die Seite mit der Vorlage. Male auf der anderen Seite.'); return; }
      if (!farbe || gemalt.get(k) === farbe) gemalt.delete(k); else gemalt.set(k, farbe);
      markiert.delete(k); bewertung = null;
      zeichne(); return;
    }
    const b = e.target.closest('[data-sp]');
    if (!b) return;
    ({ neu: () => { neuesMuster(); zeichne(); startText(); }, pruefen, klappen, tipp,
      leeren: () => { gemalt = new Map(); zeichne(); } })[b.dataset.sp]?.();
  });

  function startText() {
    g.sprich(modus === 'frei'
      ? 'Male links ein Bild. Rechts entsteht sofort sein Spiegelbild.'
      : modus === 'punkt'
        ? 'Drehe die Vorlage in Gedanken um den Punkt in der Mitte – halb herum. Male, wo sie dann liegt.'
        : 'Male auf der leeren Seite das Spiegelbild der Vorlage. Wähle unten die passende Farbe.');
  }

  neuesMuster(); zeichne(); startText();
}
