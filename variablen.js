/* Mathematik: Zuordnungen / Terme (Klasse 7) – Variablen-Maschine.
   KLP NRW Arithmetik/Algebra (4): Variablen als Veränderliche deuten, (5) Terme als Rechenvorschrift.
   „Maschine“       – Ein Term ist eine Rechenmaschine: x hinein, y heraus. x per Regler verändern –
                      jedes x wird ein Wertepaar in der Tabelle und ein Punkt im Graphen (x als Veränderliche).
   „Wann stimmt’s?“ – Gleichungen wie 4 · x + 3 = 35: Beide Seiten als Maschinen/Graphen. Nur für ein x stimmt es
                      (x als Unbekannte). Bildet den Unterschied Veränderliche ↔ Unbekannte ab.
   „Term finden“    – Die Maschine zeigt Wertepaare, gesucht ist ihre Rechenvorschrift y = a · x + b. */

import { geruest, wahl, mischen, zufall, ESC, antwortHtml } from './geruest.js';
import { zt, lies, gleich, kosy, kurve, stile } from './kosy.js';

const TERME = [
  { t: x => `4 · ${x} + 3`, f: x => 4 * x + 3 },
  { t: x => `2 · ${x}`, f: x => 2 * x },
  { t: x => `${x} + 5`, f: x => x + 5 },
  { t: x => `20 − 2 · ${x}`, f: x => 20 - 2 * x },
  { t: x => `3 · ${x} − 1`, f: x => 3 * x - 1 },
  { t: x => `${x} · ${x}`, f: x => x * x },
];
const GLEICHUNGEN = [
  { l: x => `4 · ${x} + 3`, fl: x => 4 * x + 3, r: () => '35', fr: () => 35, x: 8 },
  { l: x => `7 + 8 + ${x}`, fl: x => 15 + x, r: () => '21', fr: () => 21, x: 6 },
  { l: x => `3 · ${x} + 15`, fl: x => 3 * x + 15, r: x => `2 · ${x} + 20`, fr: x => 2 * x + 20, x: 5 },
  { l: x => `2 · ${x} + 4`, fl: x => 2 * x + 4, r: () => '16', fr: () => 16, x: 6 },
  { l: x => `5 · ${x} − 3`, fl: x => 5 * x - 3, r: x => `2 · ${x} + 9`, fr: x => 2 * x + 9, x: 4 },
  { l: x => `6 · ${x}`, fl: x => 6 * x, r: x => `${x} + 35`, fr: x => x + 35, x: 7 },
];
const V = x => `<span class="var">${x}</span>`;

export function starteVariablen(root) {
  stile();
  let modus = 'maschine', bewertung = null, eing = {};
  let ma, gl, tf;

  const g = geruest(root, {
    etikett: 'Zuordnungen', titel: '',
    reiter: [{ id: 'maschine', titel: 'Maschine', unter: 'x verändert sich' }, { id: 'gleichung', titel: 'Wann stimmt’s?', unter: 'x ist unbekannt' }, { id: 'finden', titel: 'Term finden', unter: 'Rechenvorschrift gesucht' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-vm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-vm="neu">＋ Neue Aufgabe</button>`,
  });

  /* ================= Maschine ================= */
  function maLinks() {
    const { term, paare } = ma;
    const ps = [...paare.entries()].sort((a, b) => a[0] - b[0]);
    const xmax = 10.5, ymax = Math.max(10, ...[0, 5, 10].map(term.f)) * 1.08;
    const k = kosy({ W: 440, H: 300, xmax, ymax });
    let s = k.svg;
    if (ma.linie) s += `<path d="${kurve(k, term.f, 0, xmax, ymax, 200)}" class="ks-graph leise"/>`;
    ps.forEach(([x, y]) => { if (y >= 0 && y <= ymax) s += `<circle cx="${k.X(x)}" cy="${k.Y(y)}" r="${x === ma.x ? 9 : 6}" class="ks-punkt${x === ma.x ? ' spur' : ''}"/>`; });
    const tab = ps.length ? `<table class="zw-tab"><tr><th>x</th>${ps.map(([x]) => `<td class="${x === ma.x ? 'an' : ''}">${zt(x)}</td>`).join('')}</tr><tr><th>y</th>${ps.map(([x, y]) => `<td class="${x === ma.x ? 'an' : ''}">${zt(y)}</td>`).join('')}</tr></table>` : '<p class="leise">Noch keine Wertepaare – schiebe den Regler.</p>';
    return `<div class="zw-maschine"><span class="ein">${zt(ma.x)}</span><span>→</span><span class="kasten" id="vm-kasten">y = ${term.t('x')}</span><span>→</span><span class="aus">${zt(term.f(ma.x))}</span></div>
      <div class="zw-formel">y = ${term.t(V(zt(ma.x)))} = <b>${zt(term.f(ma.x))}</b></div>
      ${tab}<svg class="ks-svg" viewBox="0 0 ${k.W} ${k.H}" role="img" aria-label="Punkte der Wertepaare">${s}</svg>`;
  }
  function maRechts() {
    return `<h2 class="bereich-titel">x kann sich verändern</h2>
      <div class="zw-wahl">${TERME.map((t, i) => `<button type="button" class="kn-gross${t === ma.term ? ' gewaehlt' : ''}" data-term="${i}">y = ${t.t('x')}</button>`).join('')}</div>
      <label class="zw-regler"><span>x</span><input type="range" min="0" max="10" step="${ma.komma ? 0.5 : 1}" value="${ma.x}" data-mx><output>${zt(ma.x)}</output></label>
      <div class="gs-pruef"><button type="button" class="kn-gross" data-vm="komma">${ma.komma ? 'nur ganze Zahlen' : 'auch Kommazahlen'}</button>
        <button type="button" class="kn-gross" data-vm="linie" ${ma.paare.size >= 5 ? '' : 'disabled'}>${ma.linie ? 'Linie aus' : 'Alle x auf einmal'}</button>
        <button type="button" class="kn-gross kn-leise" data-vm="leeren">Tabelle leeren</button></div>
      <p class="leise">Im Term ist x eine <b>Veränderliche</b>: Du darfst jede Zahl einsetzen. Jedem x wird genau ein y zugeordnet.</p>`;
  }

  /* ================= Wann stimmt's? ================= */
  function glLinks() {
    const { gl: q, x } = { gl: gl.q, x: gl.x };
    const L = q.fl(x), R = q.fr(x), ok = gleich(L, R);
    const xmax = 10.5, ymax = Math.max(...[0, 10].flatMap(t => [q.fl(t), q.fr(t)])) * 1.08;
    const k = kosy({ W: 440, H: 300, xmax, ymax });
    let s = k.svg + `<path d="${kurve(k, q.fl, 0, xmax, ymax)}" class="ks-graph"/><path d="${kurve(k, q.fr, 0, xmax, ymax)}" class="ks-graph zwei"/>`;
    s += `<line x1="${k.X(x)}" y1="${k.T}" x2="${k.X(x)}" y2="${k.B}" class="ks-hilfe"/>`;
    s += `<circle cx="${k.X(x)}" cy="${k.Y(L)}" r="7" class="ks-punkt alt"/><circle cx="${k.X(x)}" cy="${k.Y(R)}" r="7" class="ks-punkt"/>`;
    if (gl.geloest) s += `<circle cx="${k.X(q.x)}" cy="${k.Y(q.fl(q.x))}" r="11" class="ks-punkt spur"/>`;
    return `<div class="zw-formel" style="font-size:1.6rem">${q.l(V('x'))} = ${q.r(V('x'))}</div>
      <div class="zw-flex"><div><p class="zw-h" style="color:var(--akzent)">linke Seite</p><div class="zw-formel">${q.l(V(zt(x)))} = <b>${zt(L)}</b></div></div>
        <div><p class="zw-h" style="color:#e0262b">rechte Seite</p><div class="zw-formel">${q.r(V(zt(x)))} = <b>${zt(R)}</b></div></div></div>
      <p class="zw-gleich ${ok ? 'ja' : 'nein'}">${zt(L)} ${ok ? '=' : '≠'} ${zt(R)} ${ok ? '✓ stimmt!' : '✗ stimmt nicht'}</p>
      <svg class="ks-svg" viewBox="0 0 ${k.W} ${k.H}" role="img" aria-label="Graphen beider Seiten">${s}</svg>
      <p class="leise">Blau: linke Seite, rot: rechte Seite. Wo treffen sie sich?</p>`;
  }
  function glRechts() {
    return `<h2 class="bereich-titel">Für welches x stimmt die Gleichung?</h2>
      <label class="zw-regler"><span>x</span><input type="range" min="0" max="10" step="1" value="${gl.x}" data-gx><output>${gl.x}</output></label>
      <p class="ut-frage">x = <input class="gs-ein" id="vm-lsg" data-vmein inputmode="decimal" value="${ESC(eing['vm-lsg'] ?? '')}" aria-label="Lösung"></p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-vm="glpruef" ${gl.geloest ? 'disabled' : ''}>✓ Prüfen</button></div>${antwortHtml(bewertung)}
      ${gl.geloest ? `<div class="fl-formel" style="font-size:1rem;line-height:1.5">In der <b>Gleichung</b> ist x eine <b>Unbekannte</b>: ein Platzhalter für eine ganz bestimmte Zahl (hier ${gl.q.x}).<br>
        Im <b>Term</b> ${gl.q.l('x')} allein ist x eine <b>Veränderliche</b>: Es kann für alle Zahlen stehen.</div>` : ''}`;
  }

  /* ================= Term finden ================= */
  function neuFinden() {
    const a = wahl([2, 3, 4, 5, 0.5, 1.5]), b = wahl([0, 0, 1, 2, 3, 5]);
    const xs = mischen([1, 2, 3, 4, 5, 6, 8]).slice(0, 3).sort((p, q) => p - q);
    tf = { a, b, xs, geloest: false, test: null };
    eing = {};
  }
  function tfLinks() {
    const { a, b, xs } = tf, f = x => a * x + b;
    const reihen = xs.map(x => `<div class="zw-maschine"><span class="ein">${zt(x)}</span><span>→</span><span class="kasten">${tf.geloest ? `y = ${zt(a)} · x${b ? ` + ${b}` : ''}` : '?'}</span><span>→</span><span class="aus">${zt(f(x))}</span></div>`).join('');
    let test = '';
    if (tf.test !== null) {
      const au = lies(eing['vm-a']), bu = lies(eing['vm-b']) ?? 0;
      test = `<p class="zw-h">Test mit x = ${zt(tf.test)}</p><div class="zw-flex"><div class="zw-formel">Maschine: ${zt(f(tf.test))}</div><div class="zw-formel">dein Term: ${au === null ? '–' : zt(au * tf.test + bu)}</div></div>`;
    }
    return `<p class="tl-geschichte">Diese Maschine rechnet immer gleich. Finde ihre Rechenvorschrift!</p>${reihen}${test}`;
  }
  function tfRechts() {
    return `<h2 class="bereich-titel">Wie rechnet die Maschine?</h2>
      <p class="ut-frage">y = <input class="gs-ein" id="vm-a" data-vmein inputmode="decimal" value="${ESC(eing['vm-a'] ?? '')}" aria-label="Faktor vor x"> · x + <input class="gs-ein" id="vm-b" data-vmein inputmode="decimal" value="${ESC(eing['vm-b'] ?? '')}" aria-label="Zahl, die addiert wird"></p>
      <div class="gs-pruef"><button type="button" class="kn-gross" data-vm="testen">🔍 Mit neuem x testen</button>
        <button type="button" class="kn-gross kn-haupt" data-vm="tfpruef" ${tf.geloest ? 'disabled' : ''}>✓ Prüfen</button></div>${antwortHtml(bewertung)}
      <p class="leise">Ist die Zahl hinter dem + gleich 0, ist die Zuordnung proportional.</p>`;
  }

  /* ================= gemeinsam ================= */
  function neu() {
    bewertung = null; eing = {};
    if (modus === 'maschine') ma = { term: wahl(TERME), x: 3, paare: new Map(), komma: false, linie: false };
    if (modus === 'gleichung') { let q; do { q = wahl(GLEICHUNGEN); } while (gl && q === gl.q); gl = { q, x: 0, geloest: false }; }
    if (modus === 'finden') neuFinden();
    if (modus === 'maschine') ma.paare.set(ma.x, ma.term.f(ma.x));
  }
  function zeichne() {
    g.reiter(modus);
    g.titel({ maschine: 'Die Term-Maschine', gleichung: 'Gleichung: Wann stimmt’s?', finden: 'Rechenvorschrift finden' }[modus]);
    g.links.innerHTML = modus === 'maschine' ? maLinks() : modus === 'gleichung' ? glLinks() : tfLinks();
    g.rechts.innerHTML = modus === 'maschine' ? maRechts() : modus === 'gleichung' ? glRechts() : tfRechts();
  }
  function start() {
    g.sprich({
      maschine: 'Schiebe x hin und her. Jedes x bekommt genau ein Ergebnis – sammle viele Wertepaare!',
      gleichung: 'Probiere mit dem Regler verschiedene x aus. Für welches x sind beide Seiten gleich?',
      finden: 'Schau, wie sich y verändert, wenn x größer wird.',
    }[modus]);
  }

  root.addEventListener('input', e => {
    if (e.target.matches('[data-mx]')) {
      ma.x = Number(e.target.value); ma.paare.set(ma.x, ma.term.f(ma.x));
      g.links.innerHTML = maLinks(); e.target.nextElementSibling.value = zt(ma.x);
      root.querySelector('#vm-kasten')?.classList.add('puls');
      const lk = g.rechts.querySelector('[data-vm="linie"]'); if (lk) lk.disabled = ma.paare.size < 5;
      if (ma.paare.size === 6) g.sprich('Schau dir die Punkte an: Was fällt dir auf? Liegen sie auf einer Linie?');
    }
    if (e.target.matches('[data-gx]')) {
      gl.x = Number(e.target.value); e.target.nextElementSibling.value = gl.x;
      g.links.innerHTML = glLinks();
    }
    if (e.target.matches('[data-vmein]')) { e.target.value = e.target.value.replace(/[^\d,.\-]/g, ''); eing[e.target.id] = e.target.value; }
  });
  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !e.target.matches('[data-vmein]')) return;
    e.preventDefault(); (modus === 'gleichung' ? glPruefen : tfPruefen)();
  });
  function glPruefen() {
    const v = lies(eing['vm-lsg']), q = gl.q;
    if (v === null) { bewertung = { ok: false, text: 'Trage eine Zahl ein.' }; }
    else if (gleich(q.fl(v), q.fr(v))) { gl.geloest = true; gl.x = q.x; bewertung = { ok: true, text: `Richtig: Für x = ${q.x} ist ${q.l(q.x)} = ${q.r(q.x)} = ${zt(q.fl(q.x))}.` }; g.sprich('Die Gleichung stimmt nur für eine einzige Zahl – dort schneiden sich die Graphen.', 'fertig'); }
    else bewertung = { ok: false, text: `Für x = ${zt(v)} ist links ${zt(q.fl(v))}, rechts ${zt(q.fr(v))}. Ist links ${q.fl(v) < q.fr(v) ? 'zu klein – nimm ein größeres x' : 'zu groß – nimm ein kleineres x'}?` };
    zeichne();
  }
  function tfPruefen() {
    const au = lies(eing['vm-a']), bu = lies(eing['vm-b']) ?? 0;
    if (au === null) { bewertung = { ok: false, text: 'Trage die Zahl vor dem x ein.' }; zeichne(); return; }
    const ok = tf.xs.every(x => gleich(au * x + bu, tf.a * x + tf.b));
    if (ok) { tf.geloest = true; bewertung = { ok: true, text: `Richtig: y = ${zt(tf.a)} · x${tf.b ? ` + ${tf.b}` : ''}.${tf.b === 0 ? ' Diese Zuordnung ist proportional.' : ''}` }; g.sprich('Prima! Mit dem Term kannst du jetzt für jedes x das y ausrechnen.', 'fertig'); }
    else { const falsch = tf.xs.find(x => !gleich(au * x + bu, tf.a * x + tf.b)); bewertung = { ok: false, text: `Bei x = ${falsch} rechnet dein Term ${zt(au * falsch + bu)}, die Maschine aber ${zt(tf.a * falsch + tf.b)}.` }; }
    zeichne();
  }
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const te = e.target.closest('[data-term]');
    if (te) { ma.term = TERME[Number(te.dataset.term)]; ma.paare = new Map([[ma.x, ma.term.f(ma.x)]]); ma.linie = false; zeichne(); return; }
    const k = e.target.closest('[data-vm]');
    if (!k) return;
    const a = k.dataset.vm;
    if (a === 'neu') { neu(); zeichne(); start(); }
    if (a === 'komma') { ma.komma = !ma.komma; zeichne(); }
    if (a === 'linie') { ma.linie = !ma.linie; zeichne(); if (ma.linie) g.sprich('Setzt man alle (auch Komma-)Zahlen für x ein, liegen die Punkte so dicht, dass eine Linie entsteht: der Graph.'); }
    if (a === 'leeren') { ma.paare = new Map(); ma.linie = false; zeichne(); }
    if (a === 'glpruef') glPruefen();
    if (a === 'tfpruef') tfPruefen();
    if (a === 'testen') { let x; do { x = zufall(0, 12); } while (tf.xs.includes(x)); tf.test = x; zeichne(); }
    if (a === 'tipp') g.sprich({
      maschine: 'Setze x = 0, 1, 2, 3 … nacheinander ein. Um wie viel wächst y jedes Mal?',
      gleichung: 'Vergleiche beide Seiten: Ist links kleiner, probiere ein größeres x (oder umgekehrt).',
      finden: `Um wie viel wächst y, wenn x um 1 wächst? Das ist die Zahl vor dem x. Dann: Was müsste bei x = 0 herauskommen?`,
    }[modus], 'tipp');
  });

  neu(); zeichne(); start();
}
