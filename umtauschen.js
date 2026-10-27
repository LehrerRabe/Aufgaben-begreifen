/* Mathematik: Größen umtauschen.
   Zwei Spalten (große und kleine Einheit). Ein Plättchen der großen Einheit kann entbündelt werden
   (z. B. 1 m → 10 dm), genug kleine können gebündelt werden. Danach wird das Ergebnis eingetragen. */

import { geruest, zufall, wahl, warte, antwortHtml, zahlenMerken, zahlFeld, bewegung } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const GROESSEN = {
  laenge: { titel: 'Länge', e: ['km', 'm', 'dm', 'cm', 'mm'], f: [1000, 10, 10, 10], farbe: '#2f6fe4' },
  masse: { titel: 'Masse', e: ['t', 'kg', 'g'], f: [1000, 1000], farbe: '#16a974' },
  zeit: { titel: 'Zeit', e: ['d', 'h', 'min', 's'], f: [24, 60, 60], farbe: '#f29a12' },
  geld: { titel: 'Geld', e: ['€', 'ct'], f: [100], farbe: '#d6336c' },
};

/** Menge als Hunderter-Blöcke, Zehner-Stangen und Einzelplättchen. */
function mengeHtml(n, einheit, klein) {
  if (!klein) return Array.from({ length: n }, () => `<span class="ut-gross">1 ${einheit}</span>`).join('');
  const h = Math.floor(n / 100), z = Math.floor((n % 100) / 10), e = n % 10;
  return `${Array.from({ length: h }, () => `<span class="ut-block" title="100 ${einheit}"><b>100 ${einheit}</b></span>`).join('')}
    ${Array.from({ length: z }, () => `<span class="ut-stange" title="10 ${einheit}"><b>10</b></span>`).join('')}
    ${Array.from({ length: e }, () => `<span class="ut-eins">${einheit}</span>`).join('')}`;
}

export function starteUmtauschen(root) {
  let art = 'laenge';
  let auf, gross, klein, eing = {}, bewertung = null, beschaeftigt = false;

  const g = geruest(root, {
    etikett: 'Größen umtauschen', titel: '',
    reiter: Object.entries(GROESSEN).map(([id, x]) => ({ id, titel: x.titel })),
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-ut="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-ut="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; ['ut-a', 'ut-b'].forEach(k => (eing[k] = ''));
    const G = GROESSEN[art];
    const j = zufall(0, G.f.length - 1);
    const f = G.f[j];
    const typ = wahl(['zusammen', 'aufteilen']);
    const a = zufall(1, f >= 100 ? 3 : 4);
    let b = f >= 1000 ? zufall(1, 9) * wahl([100, 10, 1]) + zufall(0, 9) : zufall(1, f - 1);
    if (f >= 1000 && Math.random() < 0.5) b = zufall(1, 9) * 100;
    auf = { j, f, typ, a, b, U: G.e[j], u: G.e[j + 1] };
    gross = typ === 'zusammen' ? a : 0;
    klein = typ === 'zusammen' ? b : a * f + b;
  }

  function links() {
    const { U, u, f } = auf;
    return `<div class="ut-tafel" style="--gf:${GROESSEN[art].farbe}">
      <div class="ut-spalte" data-spalte="gross">
        <h3>${U}</h3>
        <div class="ut-menge">${mengeHtml(gross, U, false)}</div>
        <p class="ut-zahl">${gross} ${U}</p>
        <button type="button" class="kn-gross" data-ut="ent" ${gross ? '' : 'disabled'}>1 ${U} → ${zahlText(f)} ${u} ▶</button>
      </div>
      <div class="ut-bruecke"><span>1 ${U}</span><span>=</span><span>${zahlText(f)} ${u}</span></div>
      <div class="ut-spalte" data-spalte="klein">
        <h3>${u}</h3>
        <div class="ut-menge">${mengeHtml(klein, u, true)}</div>
        <p class="ut-zahl">${zahlText(klein)} ${u}</p>
        <button type="button" class="kn-gross" data-ut="bue" ${klein >= f ? '' : 'disabled'}>◀ ${zahlText(f)} ${u} → 1 ${U}</button>
      </div>
    </div>`;
  }

  function rechts() {
    const { typ, a, b, f, U, u } = auf;
    const frage = typ === 'zusammen'
      ? `<p class="ut-frage">${a} ${U} ${zahlText(b)} ${u} = ${zahlFeld('ut-a', eing['ut-a'], 6, `in ${u}`)} ${u}</p>`
      : `<p class="ut-frage">${zahlText(a * f + b)} ${u} = ${zahlFeld('ut-a', eing['ut-a'], 3, `in ${U}`)} ${U} ${zahlFeld('ut-b', eing['ut-b'], 4, `Rest in ${u}`)} ${u}</p>`;
    return `<h2 class="bereich-titel">${typ === 'zusammen' ? `Schreibe nur in ${u}` : 'Bündle so viel wie möglich'}</h2>${frage}
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-ut="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      <p class="leise">${typ === 'zusammen' ? `Entbündle alle ${U}: Jedes ${U}-Plättchen wird zu ${zahlText(f)} ${u}.` : `Bündle immer ${zahlText(f)} ${u} zu 1 ${U}.`}</p>`;
  }

  function zeichne() {
    g.reiter(art);
    g.titel(`${GROESSEN[art].titel}: umtauschen`);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  /** Ein Plättchen fliegt von einer Spalte in die andere. */
  async function fliegen(von, nach) {
    if (!bewegung()) return;
    const q = root.querySelector(`[data-spalte="${von}"] .ut-menge`), z = root.querySelector(`[data-spalte="${nach}"] .ut-menge`);
    const quelle = von === 'gross' ? q.lastElementChild : q.querySelector('.ut-block, .ut-stange, .ut-eins');
    if (!quelle || !z) return;
    const r0 = quelle.getBoundingClientRect(), r1 = z.getBoundingClientRect();
    const flug = quelle.cloneNode(true);
    flug.classList.add('ut-flug');
    Object.assign(flug.style, { left: `${r0.left}px`, top: `${r0.top}px`, width: `${r0.width}px`, height: `${r0.height}px` });
    document.body.appendChild(flug);
    quelle.style.visibility = 'hidden';
    await flug.animate([{ transform: 'none' }, { transform: `translate(${r1.left + r1.width / 2 - r0.left - r0.width / 2}px, ${r1.top + 20 - r0.top}px) scale(1.3)`, opacity: 0.2 }],
      { duration: 700, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
    flug.remove();
  }

  async function ent() {
    if (!gross) return;
    beschaeftigt = true;
    await fliegen('gross', 'klein');
    gross -= 1; klein += auf.f;
    g.links.innerHTML = links();
    root.querySelector('[data-spalte="klein"] .ut-menge')?.classList.add('ut-neu');
    g.sprich(`1 ${auf.U} wurde in ${zahlText(auf.f)} ${auf.u} getauscht.`);
    beschaeftigt = false;
  }

  async function bue() {
    if (klein < auf.f) return;
    beschaeftigt = true;
    await fliegen('klein', 'gross');
    klein -= auf.f; gross += 1;
    g.links.innerHTML = links();
    root.querySelector('[data-spalte="gross"] .ut-menge')?.classList.add('ut-neu');
    g.sprich(`${zahlText(auf.f)} ${auf.u} wurden zu 1 ${auf.U} gebündelt.`);
    beschaeftigt = false;
  }

  function pruefen() {
    const { typ, a, b, f, U, u } = auf;
    const x = Number(eing['ut-a']), y = Number(eing['ut-b']);
    if (typ === 'zusammen') {
      const soll = a * f + b;
      bewertung = x === soll ? { ok: true, text: `Richtig: ${a} ${U} ${zahlText(b)} ${u} = ${zahlText(soll)} ${u}` } : { ok: false, text: `Noch nicht. ${a} ${U} sind ${a} · ${zahlText(f)} ${u}.` };
    } else {
      const ok = x === a && y === b && eing['ut-a'] !== '' && eing['ut-b'] !== '';
      bewertung = ok ? { ok: true, text: `Richtig: ${zahlText(a * f + b)} ${u} = ${a} ${U} ${zahlText(b)} ${u}` }
        : { ok: false, text: y >= f ? `Bei den ${u} sind noch ${zahlText(f)} oder mehr – da kannst du noch bündeln.` : 'Noch nicht. Bündle im Material und zähle dann.' };
    }
    if (bewertung.ok) g.sprich(`Umrechnungszahl: 1 ${U} = ${zahlText(f)} ${u}.`, 'fertig');
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { art = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const b = e.target.closest('[data-ut]');
    if (!b) return;
    ({ neu: () => { neu(); zeichne(); startText(); }, ent, bue, pruefen,
      tipp: () => g.sprich(auf.typ === 'zusammen'
        ? `Tippe so oft auf „1 ${auf.U} → ${zahlText(auf.f)} ${auf.u}“, bis links nichts mehr liegt. Dann zähle rechts.`
        : `Tippe auf „${zahlText(auf.f)} ${auf.u} → 1 ${auf.U}“, so oft es geht. Was rechts übrig bleibt, ist der Rest.`, 'tipp') })[b.dataset.ut]?.();
  });

  function startText() { g.sprich('Tausche mit dem Material um. Große Einheit links, kleine Einheit rechts.'); }

  neu(); zeichne(); startText();
}
