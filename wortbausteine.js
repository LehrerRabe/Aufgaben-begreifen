/* Deutsch: Wortbausteine und Wortfamilien.
   Vorsilbe (blau) + Wortstamm (rot) + Endung (grün).
   „Bauen“: Bausteine kombinieren und echte Wörter der Wortfamilie finden.
   „Zerlegen“: ein Wort an den richtigen Stellen in seine Bausteine schneiden. */

import { geruest, wahl, ESC } from './geruest.js';

const VORSILBEN = ['ab', 'an', 'auf', 'be', 'bei', 'er', 'mit', 'ver', 'vor'];
const ENDUNGEN = ['en', 'er', 'ung'];

/* Gültige Wörter je Wortstamm: [Vorsilbe, Endung, Nomen?] */
const FAMILIEN = {
  fahr: [['', 'en'], ['', 'er', 1], ['ab', 'en'], ['an', 'en'], ['auf', 'en'], ['be', 'en'], ['er', 'en'], ['mit', 'en'], ['ver', 'en'], ['vor', 'en'], ['er', 'ung', 1], ['mit', 'er', 1], ['bei', 'er', 1]],
  spiel: [['', 'en'], ['', 'er', 1], ['ab', 'en'], ['an', 'en'], ['auf', 'en'], ['be', 'en'], ['er', 'en'], ['mit', 'en'], ['ver', 'en'], ['vor', 'en'], ['mit', 'er', 1]],
  schreib: [['', 'en'], ['', 'er', 1], ['ab', 'en'], ['an', 'en'], ['auf', 'en'], ['be', 'en'], ['mit', 'en'], ['ver', 'en'], ['vor', 'en'], ['be', 'ung', 1], ['ver', 'ung', 1], ['ab', 'ung', 1]],
};

const wortVon = (v, st, e, nomen) => { const w = v + st + e; return nomen ? w[0].toUpperCase() + w.slice(1) : w; };

export function starteWortbausteine(root) {
  let modus = 'bauen';
  let stamm = 'fahr', vor = '', end = 'en', gefunden = { fahr: new Set(), spiel: new Set(), schreib: new Set() };
  let zw, schnitte, zwGeprueft;   // Zerlegen: { v, st, e, wort }

  const g = geruest(root, {
    etikett: 'Wortbausteine', titel: '',
    reiter: [{ id: 'bauen', titel: 'Wörter bauen', unter: 'Wortfamilien' }, { id: 'zerlegen', titel: 'Wörter zerlegen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-wb="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-wb="neu">＋ Neu</button>`,
  });

  function neuZerlegen() {
    const st = wahl(Object.keys(FAMILIEN));
    const kandidaten = FAMILIEN[st].filter(([v]) => v);   // mit Vorsilbe ist spannender
    const [v, e, n] = wahl(Math.random() < 0.8 ? kandidaten : FAMILIEN[st]);
    zw = { v, st, e, wort: wortVon(v, st, e, n) };
    schnitte = new Set(); zwGeprueft = null;
  }

  const gueltig = () => FAMILIEN[stamm].find(([v, e]) => v === vor && e === end);

  function baustein(text, art, attrs = '', an = false) {
    return `<button type="button" class="wb-stein wb-${art}${an ? ' an' : ''}" ${attrs}>${text || '—'}</button>`;
  }

  function links() {
    if (modus === 'bauen') {
      const t = gueltig();
      const wort = wortVon(vor, stamm, end, t?.[2]);
      return `<div class="wb-werkbank">
          <div class="wb-reihe"><span class="wb-label">Vorsilbe</span>${['', ...VORSILBEN].map(v => baustein(v || 'ohne', 'v', `data-vor="${v}"`, v === vor)).join('')}</div>
          <div class="wb-reihe"><span class="wb-label">Wortstamm</span>${Object.keys(FAMILIEN).map(s => baustein(s, 's', `data-stamm="${s}"`, s === stamm)).join('')}</div>
          <div class="wb-reihe"><span class="wb-label">Endung</span>${ENDUNGEN.map(e => baustein(e, 'e', `data-end="${e}"`, e === end)).join('')}</div>
        </div>
        <div class="wb-ergebnis ${t ? 'echt' : 'kein'}">
          <div class="wb-teile">${vor ? `<span class="wb-teil wb-v">${vor}</span>` : ''}<span class="wb-teil wb-s">${stamm}</span><span class="wb-teil wb-e">${end}</span></div>
          <div class="wb-wort">${t ? ESC(wort) : `<s>${ESC(vor + stamm + end)}</s>`}</div>
          <p>${t ? (t[2] ? 'Ein echtes Wort – ein <b>Nomen</b>, darum groß!' : 'Ein echtes Wort!') : 'Dieses Wort gibt es nicht – oder es ist so selten, dass es nicht in der Wortkiste steht.'}</p>
        </div>`;
    }
    const buchst = [...zw.wort];
    const loes = new Set([zw.v.length, zw.v.length + zw.st.length].filter(x => x > 0 && x < buchst.length));
    let html = '';
    buchst.forEach((b, i) => {
      if (i > 0) html += `<button type="button" class="wb-luecke${schnitte.has(i) ? ' schnitt' : ''}${zwGeprueft && loes.has(i) && !schnitte.has(i) ? ' fehlt' : ''}${zwGeprueft && schnitte.has(i) && !loes.has(i) ? ' falsch' : ''}" data-schnitt="${i}" aria-label="Schnitt nach ${i} Buchstaben"></button>`;
      const art = zwGeprueft?.ok ? (i < zw.v.length ? 'v' : i < zw.v.length + zw.st.length ? 's' : 'e') : '';
      html += `<span class="wb-buchst${art ? ` wb-${art}` : ''}">${ESC(b)}</span>`;
    });
    return `<div class="wb-zerlegen">${html}</div>
      <p class="leise">Tippe zwischen zwei Buchstaben, um dort zu schneiden. Noch einmal tippen nimmt den Schnitt zurück.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-wb="pruefen">✓ Prüfen</button></div>
      ${zwGeprueft ? `<p class="tb-antwort ${zwGeprueft.ok ? 'gut' : 'schlecht'}">${zwGeprueft.text}</p>` : ''}`;
  }

  function rechts() {
    if (modus === 'bauen') {
      const alle = FAMILIEN[stamm];
      const f = gefunden[stamm];
      return `<h2 class="bereich-titel">Wortfamilie „${stamm}“</h2>
        <p>Gefunden: <b>${f.size}</b> von ${alle.length}</p>
        <div class="wb-liste">${alle.map(([v, e, n]) => {
          const w = wortVon(v, stamm, e, n);
          if (!f.has(w)) return '<span class="wb-gefunden">?</span>';
          const teile = [[v, 'v'], [stamm, 's'], [e, 'e']].filter(([t]) => t);
          if (n) teile[0] = [teile[0][0][0].toUpperCase() + teile[0][0].slice(1), teile[0][1]];
          return `<span class="wb-gefunden ja">${teile.map(([t, k]) => `<span class="wb-${k}">${t}</span>`).join('')}</span>`;
        }).join('')}</div>
        <div class="wb-legende"><span class="wb-v">Vorsilbe</span> <span class="wb-s">Wortstamm</span> <span class="wb-e">Endung</span></div>
        <p class="leise">Alle Wörter einer Wortfamilie haben denselben Wortstamm.</p>`;
    }
    return `<h2 class="bereich-titel">Zerlege das Wort</h2>
      <p>In welche Bausteine lässt sich das Wort zerlegen?</p>
      <div class="wb-legende"><span class="wb-v">Vorsilbe</span> <span class="wb-s">Wortstamm</span> <span class="wb-e">Endung</span></div>
      <p class="leise">Tipp: Der Wortstamm ist der Teil, der in der ganzen Wortfamilie gleich bleibt.</p>`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'bauen' ? 'Wörter aus Bausteinen bauen' : 'Wörter in Bausteine zerlegen');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  function nachWahl() {
    const t = gueltig();
    if (t) {
      const w = wortVon(vor, stamm, end, t[2]);
      const neu = !gefunden[stamm].has(w);
      gefunden[stamm].add(w);
      if (neu) g.sprich(`„${w}“ – neu gefunden!${gefunden[stamm].size === FAMILIEN[stamm].length ? ' Du hast die ganze Wortfamilie!' : ''}`, 'fertig');
    }
    zeichne();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; if (modus === 'zerlegen') neuZerlegen(); zeichne(); startText(); return; }
    const v = e.target.closest('[data-vor]'); if (v) { vor = v.dataset.vor; nachWahl(); return; }
    const s = e.target.closest('[data-stamm]'); if (s) { stamm = s.dataset.stamm; nachWahl(); return; }
    const en = e.target.closest('[data-end]'); if (en) { end = en.dataset.end; nachWahl(); return; }
    const sc = e.target.closest('[data-schnitt]');
    if (sc) { const i = Number(sc.dataset.schnitt); schnitte.has(i) ? schnitte.delete(i) : schnitte.add(i); zwGeprueft = null; g.links.innerHTML = links(); return; }
    const b = e.target.closest('[data-wb]');
    if (!b) return;
    if (b.dataset.wb === 'neu') { if (modus === 'zerlegen') neuZerlegen(); else { vor = ''; end = 'en'; stamm = wahl(Object.keys(FAMILIEN)); } zeichne(); startText(); }
    if (b.dataset.wb === 'pruefen') {
      const loes = [zw.v.length, zw.v.length + zw.st.length].filter(x => x > 0 && x < zw.wort.length);
      const ok = loes.length === schnitte.size && loes.every(x => schnitte.has(x));
      zwGeprueft = { ok, text: ok ? `Richtig: ${[zw.v, zw.st, zw.e].filter(Boolean).join(' | ')}` : 'Noch nicht ganz. Rot markierte Schnitte sind falsch, gestrichelte fehlen.' };
      if (ok) g.sprich(`${zw.v ? `Vorsilbe „${zw.v}“, ` : ''}Wortstamm „${zw.st}“, Endung „${zw.e}“.`, 'fertig');
      g.links.innerHTML = links();
    }
    if (b.dataset.wb === 'tipp') {
      if (modus === 'bauen') {
        const offen = FAMILIEN[stamm].find(([vv, ee, n]) => !gefunden[stamm].has(wortVon(vv, stamm, ee, n)));
        g.sprich(offen ? `Probiere die Vorsilbe „${offen[0] || 'ohne'}“ mit der Endung „${offen[1]}“.` : 'Du hast alle Wörter gefunden. Wähle einen anderen Wortstamm.', 'tipp');
      } else g.sprich(`Der Wortstamm hier ist „${zw.st}“. Was steht davor, was dahinter?`, 'tipp');
    }
  });

  function startText() {
    g.sprich(modus === 'bauen' ? 'Setze Vorsilbe, Wortstamm und Endung zusammen. Welche echten Wörter entstehen?' : 'Schneide das Wort in seine Bausteine.');
  }

  zeichne(); startText();
}
