/* Mathematik: Bruchstreifen (Bruchwand).
   Jede Zeile ist ein Ganzes, geteilt in 1, 2, 3, … 12 gleiche Teile.
   Ein senkrechtes Lineal zeigt, welche Brüche gleich viel sind.
   Vergleichen: Die Kinder legen beide Brüche zuerst selbst durch Antippen in ihrer Zeile (rot und blau),
   erst dann wird verglichen. Die beiden Brüche haben verschiedene Nenner (sonst lägen sie in derselben Zeile). */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, ggT } from './geruest.js';

const NENNER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
const FARBE = { 1: '#e0262b', 2: '#f07d2a', 3: '#f2b72e', 4: '#9ccc3a', 5: '#2fae58', 6: '#18b0a8', 7: '#2fa3e0', 8: '#2f6fe4', 9: '#6b54e0', 10: '#a64ad6', 12: '#e0457b' };

/** Alle Linealstellen k/n (gekürzt, ohne Doppelte), sortiert. */
const STELLEN = (() => {
  const m = new Map();
  for (const n of NENNER) for (let k = 0; k <= n; k++) { const t = ggT(k, n) || n; m.set(`${k / t}/${n / t}`, [k / t, n / t]); }
  return [...m.values()].sort((p, q) => p[0] / p[1] - q[0] / q[1]);
})();

export function starteBruchstreifen(root) {
  let modus = 'entdecken';
  let lineal = STELLEN.findIndex(([k, n]) => k === 1 && n === 2);
  let bewertung = null;
  let paar, wahlZ, gelegt;  // vergleichen – gelegt: [Anzahl rot, Anzahl blau]
  let luecke, gefuellt;     // lücken: { a, b, m }
  let zeigeLineal = true;

  const g = geruest(root, {
    etikett: 'Bruchstreifen', titel: '',
    reiter: [{ id: 'entdecken', titel: 'Entdecken', unter: 'mit dem Lineal' }, { id: 'vergleichen', titel: 'Vergleichen' }, { id: 'luecken', titel: 'Gleich viel?', unter: 'Lücken füllen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bs="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bs="neu">＋ Neue Aufgabe</button>`,
    breitRechts: false,
  });

  function neu() {
    bewertung = null; wahlZ = null; gelegt = [0, 0];
    if (modus === 'entdecken') zeigeLineal = true;
    if (modus === 'vergleichen') {
      zeigeLineal = false;
      let p, q;
      do { const b = wahl(NENNER.slice(1)), d = wahl(NENNER.slice(1)); p = [zufall(1, b - 1), b]; q = [zufall(1, d - 1), d]; }
      while (p[1] === q[1] || (p[0] * q[1] === q[0] * p[1] && Math.random() < 0.6));
      paar = [p, q];
    }
    if (modus === 'luecken') {
      zeigeLineal = false; gefuellt = 0;
      const moeglich = [];
      for (const b of NENNER.slice(1)) for (const m of NENNER) if (m > b && m % b === 0) moeglich.push([b, m]);
      const [b, m] = wahl(moeglich);
      luecke = { a: zufall(1, b - 1), b, m };
    }
  }

  const wert = () => STELLEN[lineal];
  const amLineal = n => { const [k, d] = wert(); return (k * n) % d === 0 ? (k * n) / d : null; };

  function wand() {
    const [k, d] = wert();
    let zeilen = '';
    for (const n of NENNER) {
      let mark = 0, art = '';
      if (modus === 'entdecken') { const t = amLineal(n); if (t !== null) { mark = t; art = 'lin'; } }
      if (modus === 'vergleichen') { if (n === paar[0][1]) { mark = gelegt[0]; art = 'a'; } if (n === paar[1][1]) { mark = gelegt[1]; art = 'b'; } }
      if (modus === 'luecken') { if (n === luecke.b) { mark = luecke.a; art = 'a'; } if (n === luecke.m) { mark = gefuellt; art = 'b'; } }
      const blass = (modus !== 'entdecken' && !art) || (modus === 'entdecken' && art !== 'lin' && k > 0 && k < d);
      let zellen = '';
      for (let i = 0; i < n; i++) {
        let an = '';
        if (i < mark) an = art === 'b' ? ' an-b' : art === 'a' ? ' an-a' : ' an';
        zellen += `<button type="button" class="bs-z${an}" style="--f:${FARBE[n]}" ${modus === 'luecken' && n === luecke.m ? `data-fuell="${i + 1}"` : modus === 'vergleichen' && art && !bewertung?.ok ? `data-lege="${art}" data-i="${i + 1}"` : 'tabindex="-1"'}>${n <= 10 ? `<span>${n === 1 ? '1' : `<sup>1</sup>⁄<sub>${n}</sub>`}</span>` : ''}</button>`;
      }
      const ziel = modus === 'vergleichen' && art ? ` ziel-${art}${gelegt[art === 'a' ? 0 : 1] === paar[art === 'a' ? 0 : 1][0] ? ' passt' : ''}` : '';
      zeilen += `<div class="bs-zeile${blass ? ' blass' : ''}${ziel}" data-zeile="${n}"><span class="bs-name">${n === 1 ? '1' : `1/${n}`}</span><div class="bs-teile">${zellen}</div></div>`;
    }
    const pos = (k / d) * 100;
    let lin = '';
    if (zeigeLineal) lin = `<div class="bs-lineal" style="left:${pos}%" data-lineal><span class="bs-griff">${bruchHtml(k, d, 'klein')}</span></div>`;
    if (modus === 'vergleichen' && bewertung) {
      lin = paar.map(([a, b], i) => `<div class="bs-lineal ${i ? 'b' : 'a'}" style="left:${(a / b) * 100}%"></div>`).join('');
    }
    return `<div class="bs-wand" style="touch-action:${modus === 'entdecken' ? 'none' : 'auto'}"><div class="bs-feld">${zeilen}<div class="bs-bahn">${lin}</div></div></div>
      ${modus === 'entdecken' ? `<label class="bs-regler"><span class="vh">Lineal verschieben</span><input type="range" min="0" max="${STELLEN.length - 1}" value="${lineal}" data-regler></label>
      <p class="leise">Ziehe das Lineal über die Wand oder benutze den Regler.</p>` : ''}`;
  }

  function rechts() {
    if (modus === 'entdecken') {
      const [k, d] = wert();
      const gleich = NENNER.filter(n => amLineal(n) !== null).map(n => bruchHtml(amLineal(n), n));
      return `<h2 class="bereich-titel">Am Lineal</h2>
        <p class="bs-kette">${gleich.join(' <span class="bs-gl">=</span> ')}</p>
        <p>${gleich.length > 1 ? `Diese ${gleich.length} Brüche sind <b>gleich viel</b>. Sie enden an derselben Stelle.` : 'Nur dieser eine Bruch endet hier.'}</p>
        <p class="leise">Probiere: Wo enden besonders viele Streifen? Bei welchen Stellen nur einer?</p>
`;
    }
    if (modus === 'vergleichen') {
      const [p, q] = paar;
      const fertig = gelegt[0] === p[0] && gelegt[1] === q[0];
      const stand = (k, f, farbe) => `<li class="${gelegt[k] === f[0] ? 'ok' : ''}"><span class="bs-marke ${farbe}">${bruchHtml(f[0], f[1], 'klein')}</span> in der ${f[1]}er-Zeile: ${gelegt[k]} von ${f[0]} Teilen ${gelegt[k] === f[0] ? '✓' : ''}</li>`;
      return `<h2 class="bereich-titel">Welcher Bruch ist größer?</h2>
        ${fertig ? '' : `<p>Lege zuerst beide Brüche: Tippe in ihren Zeilen so viele Teile an, wie der Zähler sagt.</p><ul class="bs-stand">${stand(0, p, 'a')}${stand(1, q, 'b')}</ul>`}
        <p class="bk-gross"><span class="bs-marke a">${bruchHtml(p[0], p[1])}</span> <span class="bk-zeichen">${wahlZ ?? '?'}</span> <span class="bs-marke b">${bruchHtml(q[0], q[1])}</span></p>
        <div class="bk-zeichenwahl">${['<', '=', '>'].map(z => `<button type="button" class="kn-gross${wahlZ === z ? ' gewaehlt' : ''}" data-z="${z}"${fertig ? '' : ' disabled'}>${z}</button>`).join('')}</div>
        ${antwortHtml(bewertung)}`;
    }
    const { a, b, m } = luecke;
    return `<h2 class="bereich-titel">Fülle die Lücke</h2>
      <p class="bk-gross">${bruchHtml(a, b)} = ${bruchHtml(gefuellt || '?', m)}</p>
      <p>Tippe in der ${m === 12 ? '12er' : `${m}er`}-Zeile so viele Teile an, dass sie genauso lang sind wie ${bruchHtml(a, b, 'klein')}.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bs="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ entdecken: 'Gleich viel – anders geteilt', vergleichen: 'Brüche vergleichen', luecken: 'Gleichwertige Brüche finden' }[modus]);
    g.links.innerHTML = wand();
    g.rechts.innerHTML = rechts();
  }

  function setzeLineal(i) {
    if (i === lineal) return;
    lineal = i;
    g.links.innerHTML = wand();
    g.rechts.innerHTML = rechts();
  }

  /* Ziehen des Lineals */
  let zieht = false;
  const vonPunkt = e => {
    const feld = root.querySelector('.bs-teile'); if (!feld) return;
    const r = feld.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    let best = 0, bd = 9;
    STELLEN.forEach(([k, d], i) => { const dd = Math.abs(k / d - v); if (dd < bd) { bd = dd; best = i; } });
    setzeLineal(best);
  };
  root.addEventListener('pointerdown', e => {
    if (modus !== 'entdecken' || !e.target.closest('.bs-wand')) return;
    zieht = true; vonPunkt(e); e.preventDefault();
  });
  root.addEventListener('pointermove', e => { if (zieht) vonPunkt(e); });
  window.addEventListener('pointerup', () => { zieht = false; });
  root.addEventListener('input', e => {
    if (!e.target.matches('[data-regler]')) return;
    lineal = Number(e.target.value);
    g.links.innerHTML = wand();
    g.rechts.innerHTML = rechts();
    root.querySelector('[data-regler]')?.focus();
  });

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const lg = e.target.closest('[data-lege]');
    if (lg && modus === 'vergleichen') {
      const k = lg.dataset.lege === 'a' ? 0 : 1, i = Number(lg.dataset.i);
      gelegt[k] = gelegt[k] === i ? i - 1 : i; bewertung = null; wahlZ = null;
      zeichne();
      const [p, q] = paar;
      if (gelegt[0] === p[0] && gelegt[1] === q[0]) g.sprich('Beide Brüche liegen. Welcher Streifen reicht weiter nach rechts?');
      else if (gelegt[k] > paar[k][0]) g.sprich(`Das sind zu viele: ${paar[k][0]} Teile reichen.`, 'tipp');
      return;
    }
    const f = e.target.closest('[data-fuell]');
    if (f) { const i = Number(f.dataset.fuell); gefuellt = gefuellt === i ? i - 1 : i; bewertung = null; zeichne(); return; }
    const z = e.target.closest('[data-z]');
    if (z) {
      if (gelegt[0] !== paar[0][0] || gelegt[1] !== paar[1][0]) return;
      wahlZ = z.dataset.z;
      const [p, q] = paar, s = Math.sign(p[0] * q[1] - q[0] * p[1]), soll = s < 0 ? '<' : s > 0 ? '>' : '=';
      bewertung = wahlZ === soll ? { ok: true, text: soll === '=' ? 'Richtig – beide Streifen enden an derselben Stelle.' : 'Richtig! Die gestrichelten Linien zeigen, wo die Streifen enden.' }
        : { ok: false, text: 'Leider nicht. Schau, wo die Streifen enden (gestrichelte Linien).' };
      if (bewertung.ok) g.sprich('Der Bruch, dessen Streifen weiter nach rechts reicht, ist größer.', 'fertig');
      zeichne(); return;
    }
    const b = e.target.closest('[data-bs]');
    if (!b) return;
    if (b.dataset.bs === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.bs === 'tipp') tipp();
    if (b.dataset.bs === 'pruefen') {
      const { a, b: bb, m } = luecke, soll = a * m / bb;
      bewertung = gefuellt === soll ? { ok: true, text: `Richtig: ${a}/${bb} = ${soll}/${m}.` } : { ok: false, text: gefuellt > soll ? 'Zu lang. Vergleiche mit dem oberen Streifen.' : 'Noch zu kurz.' };
      if (bewertung.ok) { zeigeLineal = true; lineal = STELLEN.findIndex(([k, d]) => k * bb === a * d); g.sprich(`Beide Streifen enden an derselben Stelle. Der Nenner wurde mal ${m / bb} genommen – der Zähler auch.`, 'fertig'); }
      zeichne();
    }
  });

  function tipp() {
    if (modus === 'entdecken') g.sprich('Schiebe das Lineal genau auf die Mitte. Welche Streifen enden dort alle?', 'tipp');
    if (modus === 'vergleichen') { const [p, q] = paar; g.sprich(gelegt[0] !== p[0] || gelegt[1] !== q[0] ? `Der Nenner sagt die Zeile, der Zähler, wie viele Teile du antippst: ${p[0]} in der ${p[1]}er-Zeile, ${q[0]} in der ${q[1]}er-Zeile.` : 'Vergleiche, welcher farbige Streifen weiter nach rechts reicht.', 'tipp'); }
    if (modus === 'luecken') { zeigeLineal = true; lineal = STELLEN.findIndex(([k, d]) => k * luecke.b === luecke.a * d); zeichne(); g.sprich('Das Lineal zeigt, wo der obere Streifen endet. Fülle die untere Zeile bis dorthin.', 'tipp'); }
  }

  function startText() {
    g.sprich({
      entdecken: 'Jede Zeile ist ein Ganzes. Ziehe das Lineal: Alle Streifen, die genau dort enden, sind gleich viel.',
      vergleichen: 'Lege die beiden Brüche in der Wand: Tippe die Teile an. Dann vergleiche.',
      luecken: 'Tippe die Teile an, bis beide Streifen gleich lang sind.',
    }[modus]);
  }

  neu(); zeichne(); startText();
}
