/* Mathematik: Anteile sehen.
   „Welcher Anteil?“ – gefärbte Felder, Streifen oder Kreis: zählen, ordnen und als Bruch schreiben.
   „Anteil vom Anteil“ – im Rechteck erst einen Anteil nehmen, davon wieder einen Anteil. */

import { geruest, zufall, mischen, antwortHtml, bruchHtml, bruchFeld, zahlenMerken, ggT, bewegung } from './geruest.js';

export const starteAnteilWelcher = root => starteAnteile(root, 'welcher');
export const starteAnteilVom = root => starteAnteile(root, 'vom');

/** fest: 'welcher' oder 'vom' – dann ohne Reiter (eigene Kachel im Menü). */
export function starteAnteile(root, fest = null) {
  let modus = fest || 'welcher';
  let eing = {}, bewertung = null;
  let feld, geordnet;            // welcher: { r, c, an:Set }
  let dar = 'felder';            // welcher: 'felder' | 'streifen' | 'kreis'
  let aa, schritt;               // vom: { a, b, c, d }

  const g = geruest(root, {
    etikett: 'Anteile', titel: '',
    reiter: fest ? null : [{ id: 'welcher', titel: 'Welcher Anteil?' }, { id: 'vom', titel: 'Anteil vom Anteil' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-an="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-an="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; eing['an-z'] = ''; eing['an-n'] = '';
    if (modus === 'welcher') {
      let r, c;
      if (dar === 'felder') do { r = zufall(1, 4); c = zufall(2, 6); } while (r * c < 4 || r * c > 20);
      else { r = 1; c = zufall(2, 12); }
      const n = r * c, k = zufall(1, n - 1);
      feld = { r, c, an: new Set(mischen([...Array(n).keys()]).slice(0, k)) };
      geordnet = false;
    } else {
      let a, b, c, d;
      do { b = zufall(2, 4); a = zufall(1, b - 1); d = zufall(2, 5); c = zufall(1, d - 1); } while (b * d > 20 || ggT(a, b) !== 1 || ggT(c, d) !== 1);
      aa = { a, b, c, d }; schritt = 0;
    }
  }

  const reihenfolge = () => {
    const n = feld.r * feld.c, an = feld.an;
    return geordnet ? [...[...an].sort((x, y) => x - y), ...[...Array(n).keys()].filter(i => !an.has(i))] : [...Array(n).keys()];
  };

  /** Kreis: jedes Stück ist derselbe Sektor, der an seinen Platz gedreht wird – so kann es beim Ordnen wandern. */
  function kreisHtml() {
    const n = feld.c, R = 140, M = 150, w = (2 * Math.PI) / n;
    const pfad = n === 1 ? '' : `M${M} ${M} L${M} ${M - R} A${R} ${R} 0 ${n <= 2 ? 1 : 0} 1 ${M + R * Math.sin(w)} ${M - R * Math.cos(w)} Z`;
    const platz = new Map(reihenfolge().map((i, p) => [i, p]));
    return `<svg class="an-kreis" viewBox="0 0 300 300" role="img" aria-label="Kreis aus ${n} gleichen Stücken">
      ${[...Array(n).keys()].map(i => `<path d="${pfad}" class="an-sektor${feld.an.has(i) ? ' an' : ''}" data-i="${i}" style="transform: rotate(${(platz.get(i) * 360) / n}deg)"/>`).join('')}
      <circle cx="${M}" cy="${M}" r="${R}" class="an-kreisrand"/></svg>`;
  }

  function welcherLinks() {
    const { c } = feld;
    const wahlHtml = `<div class="an-darstellung" role="group" aria-label="Darstellung">${[['felder', '▦ Felder'], ['streifen', '▬ Streifen'], ['kreis', '<svg class="an-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8V1.5A6.5 6.5 0 0 1 14.5 8Z" fill="currentColor"/></svg> Kreis']]
      .map(([id, t]) => `<button type="button" class="an-dar${dar === id ? ' aktiv' : ''}" data-dar="${id}" aria-pressed="${dar === id}">${t}</button>`).join('')}</div>`;
    const bild = dar === 'kreis' ? kreisHtml()
      : `<div class="an-feld${dar === 'streifen' ? ' streifen' : ''}" style="--c:${c}">${reihenfolge().map(i => `<span class="an-z${feld.an.has(i) ? ' an' : ''}" data-i="${i}"></span>`).join('')}</div>`;
    return `${wahlHtml}${bild}
      <div class="gs-pruef"><button type="button" class="kn-gross" data-an="ordnen">${geordnet ? '↺ Wieder mischen' : `⇆ Gefärbte ${dar === 'felder' ? 'Felder' : 'Stücke'} nach vorn`}</button></div>`;
  }

  function vomSvg() {
    const { a, b, c, d } = aa;
    const W = 420, H = 280, x0 = 10, y0 = 10, w = W - 20, h = H - 20;
    const cw = w / d, rh = h / b;
    let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" class="an-ganz"/>`;
    if (schritt >= 1) {
      s += `<rect x="${x0}" y="${y0}" width="${cw * c}" height="${h}" class="an-gelb neu"/>`;
      for (let i = 1; i < d; i++) s += `<line x1="${x0 + i * cw}" y1="${y0}" x2="${x0 + i * cw}" y2="${y0 + h}" class="an-linie"/>`;
    }
    if (schritt >= 2) {
      s += `<rect x="${x0}" y="${y0}" width="${cw * c}" height="${rh * a}" class="an-lila neu"/>`;
      for (let j = 1; j < b; j++) s += `<line x1="${x0}" y1="${y0 + j * rh}" x2="${x0 + cw * c}" y2="${y0 + j * rh}" class="an-linie"/>`;
    }
    if (schritt >= 3) {
      for (let j = 1; j < b; j++) s += `<line x1="${x0 + cw * c}" y1="${y0 + j * rh}" x2="${x0 + w}" y2="${y0 + j * rh}" class="an-linie gestrichelt neu"/>`;
      for (let i = 0; i < d; i++) for (let j = 0; j < b; j++) s += `<text x="${x0 + (i + .5) * cw}" y="${y0 + (j + .5) * rh + 6}" class="an-nr${i < c && j < a ? ' lila' : ''}">${j * d + i + 1}</text>`;
    }
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" class="an-rand"/>`;
    return `<svg class="an-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Rechteck">${s}</svg>`;
  }

  function links() {
    if (modus === 'welcher') return welcherLinks();
    const { a, b, c, d } = aa;
    const texte = [
      'Das ganze Rechteck ist 1 Ganzes.',
      `Schritt 1: Teile in ${d} Spalten und nimm ${c} davon – das sind ${c}/${d} (gelb).`,
      `Schritt 2: Teile den gelben Teil in ${b} Zeilen und nimm ${a} davon – das ist ${a}/${b} vom gelben Teil (lila).`,
      `Schritt 3: Zieh die Linien durch das ganze Rechteck. Jetzt gibt es ${b * d} gleiche Felder, ${a * c} sind lila.`,
    ];
    return `${vomSvg()}<p class="an-schritt">${texte[schritt]}</p>
      <div class="gs-pruef">${schritt < 3 ? `<button type="button" class="kn-gross" data-an="weiter">Nächster Schritt ▶</button>` : ''}
        ${schritt > 0 ? '<button type="button" class="kn-gross kn-leise" data-an="zurueck">◀ Zurück</button>' : ''}</div>`;
  }

  function rechts() {
    if (modus === 'welcher') {
      return `<h2 class="bereich-titel">Welcher Anteil ist gefärbt?</h2>
        <p class="bk-gross">${bruchFeld('an-z', 'an-n', eing)}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-an="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Unten steht, in wie viele gleich große ${dar === 'felder' ? 'Felder' : 'Stücke'} das Ganze geteilt ist. Oben, wie viele davon gefärbt sind.</p>`;
    }
    const { a, b, c, d } = aa;
    return `<h2 class="bereich-titel">Wie viel ist</h2>
      <p class="bk-gross">${bruchHtml(a, b)} <span class="an-von">von</span> ${bruchHtml(c, d)} ?</p>
      <p class="bk-gross">= ${bruchFeld('an-z', 'an-n', eing)}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-an="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'welcher' ? 'Welcher Anteil ist gefärbt?' : 'Anteil vom Anteil');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  /** Felder sanft an ihren neuen Platz gleiten lassen. */
  function ordnen() {
    const alt = new Map([...root.querySelectorAll('.an-z')].map(e => [e.dataset.i, e.getBoundingClientRect()]));
    geordnet = !geordnet;
    if (dar === 'kreis') {   // Sektoren an Ort und Stelle weiterdrehen (CSS-Übergang)
      const platz = new Map(reihenfolge().map((i, p) => [i, p]));
      root.querySelectorAll('.an-sektor').forEach(e => { e.style.transform = `rotate(${(platz.get(+e.dataset.i) * 360) / feld.c}deg)`; });
      const kn = root.querySelector('[data-an="ordnen"]');
      if (kn) kn.textContent = geordnet ? '↺ Wieder mischen' : '⇆ Gefärbte Stücke nach vorn';
      return;
    }
    g.links.innerHTML = links();
    if (!bewegung()) return;
    root.querySelectorAll('.an-z').forEach(e => {
      const r0 = alt.get(e.dataset.i), r1 = e.getBoundingClientRect();
      if (!r0) return;
      e.animate([{ transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px)` }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' });
    });
  }

  function pruefen() {
    const z = Number(eing['an-z']), n = Number(eing['an-n']);
    if (!eing['an-z'] || !eing['an-n'] || !n) { bewertung = { ok: false, text: 'Trage Zähler und Nenner ein.' }; zeichne(); return; }
    const [sz, sn] = modus === 'welcher' ? [feld.an.size, feld.r * feld.c] : [aa.a * aa.c, aa.b * aa.d];
    const t = ggT(sz, sn), kz = sz / t, kn = sn / t;
    if (z * sn === sz * n) {
      const genau = z === sz && n === sn;
      bewertung = { ok: true, text: `Richtig: ${z}/${n}.${genau && t > 1 ? ` Gekürzt: ${kz}/${kn}.` : !genau ? ` Das ist gleich viel wie ${sz}/${sn}.` : ''}` };
      if (modus === 'vom') { schritt = 3; g.sprich(`${aa.a}/${aa.b} von ${aa.c}/${aa.d} = ${aa.a}·${aa.c} / ${aa.b}·${aa.d} = ${sz}/${sn}. Zähler mal Zähler, Nenner mal Nenner.`, 'fertig'); }
      else g.sprich(`${sz} von ${sn} gleich großen ${dar === 'felder' ? 'Feldern' : 'Stücken'} sind gefärbt.`, 'fertig');
    } else {
      bewertung = { ok: false, text: modus === 'welcher'
        ? (n !== sn && n === sz ? `Nenner und Zähler vertauscht? Der Nenner ist die Anzahl aller ${dar === 'felder' ? 'Felder' : 'Stücke'}.` : `Noch nicht. Zähle alle ${dar === 'felder' ? 'Felder' : 'Stücke'} (Nenner) und die gefärbten (Zähler).`)
        : 'Noch nicht. Gehe die Schritte links durch und zähle die lila Felder.' };
    }
    zeichne();
  }

  root.addEventListener('click', e => {
    const dw = e.target.closest('[data-dar]');
    if (dw) { dar = dw.dataset.dar; neu(); zeichne(); return; }
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const b = e.target.closest('[data-an]');
    if (!b) return;
    const was = b.dataset.an;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'ordnen') ordnen();
    if (was === 'pruefen') pruefen();
    if (was === 'weiter') { schritt = Math.min(3, schritt + 1); g.links.innerHTML = links(); }
    if (was === 'zurueck') { schritt = Math.max(0, schritt - 1); g.links.innerHTML = links(); }
    if (was === 'tipp') {
      if (modus === 'welcher') { if (!geordnet) ordnen(); g.sprich(`Das Ganze hat ${feld.r * feld.c} gleich große ${dar === 'felder' ? 'Felder' : 'Stücke'}. Zähle die gefärbten.`, 'tipp'); }
      else { schritt = 3; g.links.innerHTML = links(); g.sprich(`Das Ganze hat jetzt ${aa.b * aa.d} gleich große Felder. Wie viele sind lila?`, 'tipp'); }
    }
  });

  function startText() {
    g.sprich(modus === 'welcher'
      ? 'Wie viel vom Ganzen ist gefärbt? Schreibe es als Bruch.'
      : 'Gehe die Schritte links durch: erst den einen Anteil nehmen, dann davon den anderen.');
  }

  neu(); zeichne(); startText();
}
