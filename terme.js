/* Mathematik: Terme und Gleichungen (Klasse 7).
   „Muster“: Ein Muster wächst Bild für Bild (Tische mit Stühlen, Streichholz-Quadrate, …).
     1. Bilder weiterbauen und zählen (Tabelle), 2. den passenden Term wählen, 3. Probe für n = 10.
     Danach ist im Bild gefärbt, welcher Teil gleich bleibt und welcher mit n wächst.
   „Waage“: a·x + b = c·x + d als Waage mit Säckchen (x) und Würfeln (1).
     Antippen nimmt einen Gegenstand weg – die Waage kippt, bis auf der anderen Seite dasselbe weggenommen ist.
     Am Ende: die Würfel gerecht auf die Säckchen aufteilen. */

import { geruest, zufall, wahl, mischen, antwortHtml, bewegung, warte, ESC } from './geruest.js';

/* ---------- Muster ---------- */
const MUSTER = [
  { name: 'Tische und Stühle', ding: 'Stühle', a: 2, b: 2, falsch: ['4 · n', 'n + 2', '2 · n'],
    erkl: 'Jeder Tisch bringt 2 Stühle mit (oben und unten). Dazu kommen immer die 2 Stühle an den Enden.' },
  { name: 'Streichholz-Quadrate', ding: 'Streichhölzer', a: 3, b: 1, falsch: ['4 · n', '3 · n', 'n + 3'],
    erkl: 'Das erste Hölzchen links bleibt. Jedes Quadrat braucht dann 3 neue Hölzchen.' },
  { name: 'L aus Plättchen', ding: 'Plättchen', a: 2, b: 1, falsch: ['2 · n', 'n + 1', '3 · n'],
    erkl: 'Das Eck-Plättchen bleibt. Jeder Arm wächst um 1 – zusammen 2 pro Bild.' },
  { name: 'Dreiecke aus Hölzchen', ding: 'Streichhölzer', a: 2, b: 1, falsch: ['3 · n', 'n + 2', '2 · n'],
    erkl: 'Ein Hölzchen am Anfang. Jedes neue Dreieck braucht 2 weitere Hölzchen.' },
];
const termText = m => `${m.a} · n + ${m.b}`;

function musterSvg(m, n, farbig) {
  const W = 520, H = 200;
  const fest = farbig ? '#f07d2a' : '#8a6a3c', var_ = farbig ? '#2f6fe4' : '#8a6a3c';
  let s = '';
  if (m.name.startsWith('Tische')) {
    const tw = Math.min(70, (W - 80) / n), x0 = (W - n * tw) / 2, y = 80;
    for (let i = 0; i < n; i++) {
      s += `<rect x="${x0 + i * tw + 2}" y="${y}" width="${tw - 4}" height="44" rx="6" class="te-tisch"/>`;
      s += `<circle cx="${x0 + (i + 0.5) * tw}" cy="${y - 18}" r="11" fill="${var_}"/><circle cx="${x0 + (i + 0.5) * tw}" cy="${y + 62}" r="11" fill="${var_}"/>`;
    }
    s += `<circle cx="${x0 - 18}" cy="${y + 22}" r="11" fill="${fest}"/><circle cx="${x0 + n * tw + 18}" cy="${y + 22}" r="11" fill="${fest}"/>`;
  } else if (m.name.startsWith('Streichholz')) {
    const q = Math.min(60, (W - 60) / n), x0 = (W - n * q) / 2, y = 60;
    const holz = (x1, y1, x2, y2, f) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${f}" class="te-holz"/><circle cx="${x2}" cy="${y2}" r="0"/>`;
    s += holz(x0, y + 4, x0, y + q - 4, fest);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * q;
      s += holz(x + 4, y, x + q - 4, y, var_) + holz(x + 4, y + q, x + q - 4, y + q, var_) + holz(x + q, y + 4, x + q, y + q - 4, var_);
    }
  } else if (m.name.startsWith('L')) {
    const k = Math.min(30, 150 / (n + 1)), x0 = 150, y0 = 170;
    s += `<rect x="${x0}" y="${y0 - k}" width="${k - 3}" height="${k - 3}" rx="4" fill="${fest}"/>`;
    for (let i = 1; i <= n; i++) {
      s += `<rect x="${x0}" y="${y0 - k - i * k}" width="${k - 3}" height="${k - 3}" rx="4" fill="${var_}"/>`;
      s += `<rect x="${x0 + i * k}" y="${y0 - k}" width="${k - 3}" height="${k - 3}" rx="4" fill="${var_}"/>`;
    }
  } else {
    const d = Math.min(70, (W - 60) / ((n + 1) / 2 + 0.5)), x0 = (W - ((n + 1) / 2) * d) / 2, yU = 140, yO = 140 - d * 0.87;
    const holz = (x1, y1, x2, y2, f) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${f}" class="te-holz"/>`;
    s += holz(x0, yU, x0 + d / 2, yO, fest);
    for (let i = 0; i < n; i++) {
      // abwechselnd: Dreieck nach oben braucht Boden + rechte Seite, nach unten Dach + rechte Seite
      const xl = x0 + (i * d) / 2;
      if (i % 2 === 0) s += holz(xl, yU, xl + d, yU, var_) + holz(xl + d / 2, yO, xl + d, yU, var_);
      else s += holz(xl, yO, xl + d, yO, var_) + holz(xl + d, yO, xl + d / 2, yU, var_);
    }
  }
  return `<svg class="te-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${ESC(m.name)}, Bild ${n}">${s}</svg>`;
}

export function starteTerme(root) {
  let modus = 'muster', bewertung = null, eing = {};
  let mu;   // { m, n, schritt, optionen, gewaehlt }
  let wa;   // { l:{x,e}, r:{x,e}, x, offen:null|{seite,typ}, kipp:0, aufgeteilt, start }

  const g = geruest(root, {
    etikett: 'Terme und Gleichungen', titel: '',
    reiter: [{ id: 'muster', titel: 'Muster und Terme', unter: 'wachsende Bilder' }, { id: 'waage', titel: 'Gleichungen mit der Waage', unter: 'auf beiden Seiten dasselbe' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-te="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-te="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    bewertung = null; eing = {};
    if (modus === 'muster') {
      const m = wahl(MUSTER);
      mu = { m, n: 1, schritt: 1, optionen: mischen([termText(m), ...m.falsch.slice(0, 2)]), gewaehlt: null };
    } else {
      let a, c, x, b, d;
      do { a = zufall(2, 4); c = zufall(0, a - 1); x = zufall(1, 6); b = zufall(0, 5); d = (a - c) * x + b; } while (d > 16 || (b === 0 && c === 0 && Math.random() < 0.7));
      wa = { l: { x: a, e: b }, r: { x: c, e: d }, x, offen: null, aufgeteilt: false, start: { a, b, c, d } };
    }
  }

  /* ---------------- Muster ---------------- */
  const anzahl = (m, n) => m.a * n + m.b;
  function linksMuster() {
    const { m, n, schritt } = mu;
    return `<div class="te-bildkopf"><b>${ESC(m.name)}</b> – Bild ${n}</div>
      <div class="te-bild">${musterSvg(m, n, schritt >= 3)}</div>
      ${schritt >= 3 ? `<p class="te-legende"><span class="te-f fest"></span> bleibt immer gleich (${m.b}) <span class="te-f var"></span> wächst mit jedem Bild um ${m.a}</p>` : ''}
      <div class="gs-pruef"><button type="button" class="kn-gross" data-te="zurueck" ${n > 1 ? '' : 'disabled'}>◀ Bild ${n - 1 || ''}</button>
        <button type="button" class="kn-gross" data-te="weiter" ${n < (schritt >= 3 ? 10 : 4) ? '' : 'disabled'}>Bild ${n + 1} ▶</button></div>`;
  }
  const ein = (id, label) => `<input class="gs-ein te-ein" id="${id}" data-zahl inputmode="numeric" maxlength="4" value="${ESC(eing[id] ?? '')}" aria-label="${label}"${mu?.schritt > 1 && id.startsWith('te-n') ? ' readonly tabindex="-1"' : ''}>`;
  function rechtsMuster() {
    const { m, schritt, optionen, gewaehlt } = mu;
    let h = `<h2 class="bereich-titel">Wie viele ${ESC(m.ding)}?</h2>
      <table class="te-tab"><tr><th>Bild n</th>${[1, 2, 3, 4].map(n => `<td>${n}</td>`).join('')}</tr>
      <tr><th>${ESC(m.ding)}</th>${[1, 2, 3, 4].map(n => `<td>${ein('te-n' + n, `${m.ding} in Bild ${n}`)}</td>`).join('')}</tr></table>`;
    if (schritt === 1) h += `<p class="leise">Schau dir die Bilder 1 bis 4 an und zähle.</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-te="pruefen">✓ Prüfen</button></div>`;
    if (schritt >= 2) {
      h += `<h3 class="eh-zwischen">Welcher Term passt zu Bild n?</h3><div class="te-optionen">${optionen.map(o => `<button type="button" class="kn-gross${gewaehlt === o ? (o === termText(m) ? ' richtig' : ' falsch') : ''}" data-term="${ESC(o)}" ${schritt > 2 ? 'disabled' : ''}>${ESC(o)}</button>`).join('')}</div>`;
    }
    if (schritt >= 3) {
      h += `<h3 class="eh-zwischen">Probe: Bild 10</h3><p class="ut-frage">${termText(m).replace('n', '10')} = ${`<input class="gs-ein te-ein" id="te-p" data-zahl inputmode="numeric" maxlength="4" value="${ESC(eing['te-p'] ?? '')}" aria-label="Anzahl in Bild 10"${schritt > 3 ? ' readonly tabindex="-1"' : ''}>`}</p>
        ${schritt === 3 ? '<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-te="pruefen">✓ Prüfen</button></div>' : ''}`;
    }
    if (schritt === 4) h += `<p class="fl-formel">${ESC(m.erkl)}</p>`;
    return h + antwortHtml(bewertung);
  }
  function pruefeMuster() {
    const { m } = mu;
    if (mu.schritt === 1) {
      const falsch = [1, 2, 3, 4].filter(n => Number(eing['te-n' + n]) !== anzahl(m, n) || !eing['te-n' + n]);
      if (!falsch.length) { mu.schritt = 2; bewertung = null; g.sprich(`Von Bild zu Bild kommen immer ${m.a} ${m.ding} dazu. Welcher Term passt?`); }
      else bewertung = { ok: false, text: `Bei Bild ${falsch.join(', ')} stimmt die Anzahl noch nicht. Blättere zu dem Bild und zähle.` };
    } else if (mu.schritt === 3) {
      if (Number(eing['te-p']) === anzahl(m, 10)) { mu.schritt = 4; bewertung = { ok: true, text: `Richtig: ${anzahl(m, 10)} ${m.ding}. Blättere zu Bild 10 und prüfe es nach!` }; g.sprich('Der Term sagt dir die Anzahl für jedes Bild – ohne zu zählen.', 'fertig'); }
      else bewertung = { ok: false, text: `Setze 10 für n ein: ${m.a} · 10 + ${m.b} = ?` };
    }
    zeichne();
  }
  function termGewaehlt(o) {
    mu.gewaehlt = o;
    if (o === termText(mu.m)) { mu.schritt = 3; bewertung = null; g.sprich('Jetzt ist im Bild gefärbt, was gleich bleibt und was wächst.'); }
    else {
      const probe = [1, 2, 3, 4].find(n => { try { return Function('n', 'return ' + o.replace(/·/g, '*'))(n) !== anzahl(mu.m, n); } catch { return true; } });
      bewertung = { ok: false, text: `Setze ein: Bei Bild ${probe} ergibt ${o} nicht ${anzahl(mu.m, probe)}.` };
    }
    zeichne();
  }

  /* ---------------- Waage ---------------- */
  const gl = () => `${wa.l.x ? (wa.l.x === 1 ? 'x' : `${wa.l.x}x`) : ''}${wa.l.x && wa.l.e ? ' + ' : ''}${wa.l.e || (!wa.l.x ? '0' : '')} = ${wa.r.x ? (wa.r.x === 1 ? 'x' : `${wa.r.x}x`) : ''}${wa.r.x && wa.r.e ? ' + ' : ''}${wa.r.e || (!wa.r.x ? '0' : '')}`;
  function waageSvg() {
    const kipp = wa.offen ? (wa.offen.seite === 'l' ? 8 : -8) : 0;   // weggenommen → diese Seite wird leichter, geht hoch
    const schale = (seite, cx) => {
      const { x, e } = wa[seite];
      let s = `<path d="M${cx - 110} 0 Q${cx} 46 ${cx + 110} 0 Z" class="te-schale"/>`;
      const teile = [...Array(x).fill('x'), ...Array(e).fill('e')];
      const proReihe = 6, gr = 30;
      teile.forEach((t, i) => {
        const r = Math.floor(i / proReihe), c = i % proReihe, n = Math.min(proReihe, teile.length - r * proReihe);
        const px = cx + (c - (n - 1) / 2) * (gr + 4), py = -18 - r * (gr + 2);
        const klick = !wa.aufgeteilt ? `data-weg="${seite},${t}"` : '';
        s += t === 'x'
          ? `<g class="te-ding" ${klick}><path d="M${px - 13} ${py + 13} Q${px - 15} ${py - 6} ${px - 6} ${py - 10} L${px + 6} ${py - 10} Q${px + 15} ${py - 6} ${px + 13} ${py + 13} Z" class="te-sack"/><text x="${px}" y="${py + 7}" class="te-sacktext">x</text></g>`
          : `<g class="te-ding" ${klick}><rect x="${px - 12}" y="${py - 10}" width="24" height="24" rx="4" class="te-wuerfel"/><text x="${px}" y="${py + 7}" class="te-wtext">1</text></g>`;
      });
      return s;
    };
    return `<svg class="te-waage" viewBox="0 0 620 330" role="img" aria-label="Waage: ${gl()}">
      <path d="M310 300 L270 326 L350 326 Z" class="te-fuss"/><rect x="304" y="120" width="12" height="185" class="te-saeule"/>
      <g class="te-balken" style="transform: rotate(${kipp}deg); transform-origin: 310px 120px">
        <rect x="80" y="114" width="460" height="12" rx="6" class="te-arm"/>
        <line x1="120" y1="126" x2="120" y2="200" class="te-seil"/><line x1="500" y1="126" x2="500" y2="200" class="te-seil"/>
        <g transform="translate(0 200)"><g style="transform: rotate(${-kipp}deg); transform-origin: 120px 0">${schale('l', 120)}</g><g style="transform: rotate(${-kipp}deg); transform-origin: 500px 0">${schale('r', 500)}</g></g>
      </g></svg>`;
  }
  function linksWaage() {
    return `<div class="te-waage-huelle">${waageSvg()}</div>
      <p class="te-gleichung">${gl()}</p>
      <p class="leise">Tippe ein Säckchen oder einen Würfel an, um ihn wegzunehmen. Die Waage bleibt nur gerade, wenn du auf beiden Seiten dasselbe wegnimmst.</p>`;
  }
  const fertigZumTeilen = () => wa.l.e === 0 && wa.r.x === 0 && wa.l.x >= 1 && !wa.offen;
  function rechtsWaage() {
    const { a, b, c, d } = wa.start;
    let h = `<h2 class="bereich-titel">Wie schwer ist ein Säckchen?</h2>
      <p class="rr-gross">${a}x${b ? ` + ${b}` : ''} = ${c ? (c === 1 ? 'x' : `${c}x`) + (d ? ` + ${d}` : '') : d}</p>
      <p class="leise">Säckchen = x, Würfel = 1. Ziel: links nur Säckchen, rechts nur Würfel.</p>`;
    if (fertigZumTeilen() && !wa.aufgeteilt) {
      h += wa.l.x > 1 ? `<p>Links liegen nur noch ${wa.l.x} Säckchen, rechts ${wa.r.e} Würfel.</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-te="teilen">÷ Würfel auf ${wa.l.x} Säckchen aufteilen</button></div>`
        : `<p>Links liegt nur noch 1 Säckchen!</p>`;
    }
    if ((fertigZumTeilen() && wa.l.x === 1) || wa.aufgeteilt) {
      h += `<p class="ut-frage">x = <input class="gs-ein te-ein" id="te-x" data-zahl inputmode="numeric" maxlength="3" value="${ESC(eing['te-x'] ?? '')}" aria-label="x"></p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-te="pruefen">✓ Prüfen</button></div>`;
    }
    if (wa.aufgeteilt) h += `<div class="te-gruppen">${Array.from({ length: wa.l.x }, () => `<span class="te-gruppe"><span class="te-mini-sack">x</span> = ${Array.from({ length: wa.r.e / wa.l.x }, () => '<span class="te-mini-w"></span>').join('')}</span>`).join('')}</div>`;
    return h + antwortHtml(bewertung);
  }
  function wegnehmen(seite, typ) {
    const s = wa[seite];
    if (wa.offen) {
      if (wa.offen.seite === seite) { bewertung = { ok: false, text: `Nimm zuerst auf der ${wa.offen.seite === 'l' ? 'rechten' : 'linken'} Seite auch ${wa.offen.typ === 'x' ? 'ein Säckchen' : 'einen Würfel'} weg.` }; zeichne(); return; }
      if (wa.offen.typ !== typ) { bewertung = { ok: false, text: `Nimm dasselbe weg: ${wa.offen.typ === 'x' ? 'ein Säckchen' : 'einen Würfel'}.` }; zeichne(); return; }
      s[typ === 'x' ? 'x' : 'e']--; wa.offen = null; bewertung = null; zeichne();
      g.sprich(`Auf beiden Seiten ${typ === 'x' ? 'ein Säckchen' : 'einen Würfel'} weg – die Waage ist wieder im Gleichgewicht.`);
      return;
    }
    const andere = wa[seite === 'l' ? 'r' : 'l'];
    if ((typ === 'x' ? andere.x : andere.e) === 0) { bewertung = { ok: false, text: `Auf der anderen Seite gibt es ${typ === 'x' ? 'kein Säckchen' : 'keinen Würfel'} – dann würde die Waage kippen. Nimm etwas anderes weg.` }; zeichne(); return; }
    s[typ === 'x' ? 'x' : 'e']--; wa.offen = { seite, typ }; bewertung = null; zeichne();
    g.sprich('Die Waage kippt! Nimm auf der anderen Seite dasselbe weg.', 'tipp');
  }
  function pruefeWaage() {
    const v = Number(eing['te-x']);
    if (v === wa.x) { bewertung = { ok: true, text: `Richtig: x = ${wa.x}. Probe: ${wa.start.a} · ${wa.x}${wa.start.b ? ` + ${wa.start.b}` : ''} = ${wa.start.a * wa.x + wa.start.b}.` }; g.sprich('Auf beiden Seiten dasselbe tun – dann bleibt die Gleichung im Gleichgewicht.', 'fertig'); }
    else bewertung = { ok: false, text: wa.aufgeteilt ? 'Zähle die Würfel, die zu einem Säckchen gehören.' : 'Ein Säckchen wiegt so viel wie die Würfel rechts.' };
    zeichne();
  }

  /* ---------------- gemeinsam ---------------- */
  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'muster' ? 'Muster wachsen – Terme finden' : 'Gleichungen lösen mit der Waage');
    g.links.innerHTML = modus === 'muster' ? linksMuster() : linksWaage();
    g.rechts.innerHTML = modus === 'muster' ? rechtsMuster() : rechtsWaage();
  }
  root.addEventListener('input', e => { if (e.target.matches('.te-ein')) eing[e.target.id] = e.target.value; });
  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const t = e.target.closest('[data-term]');
    if (t && mu.schritt === 2) { termGewaehlt(t.dataset.term); return; }
    const w = e.target.closest('[data-weg]');
    if (w && modus === 'waage') { const [s, typ] = w.dataset.weg.split(','); wegnehmen(s, typ); return; }
    const k = e.target.closest('[data-te]');
    if (!k) return;
    const was = k.dataset.te;
    if (was === 'neu') { neu(); zeichne(); start(); }
    if (was === 'pruefen') modus === 'muster' ? pruefeMuster() : pruefeWaage();
    if (was === 'weiter' && mu.n < 10) { mu.n++; g.links.innerHTML = linksMuster(); }
    if (was === 'zurueck' && mu.n > 1) { mu.n--; g.links.innerHTML = linksMuster(); }
    if (was === 'teilen') { wa.aufgeteilt = true; zeichne(); g.sprich(`${wa.r.e} Würfel auf ${wa.l.x} Säckchen verteilt.`); root.querySelector('#te-x')?.focus({ preventScroll: true }); }
    if (was === 'tipp') {
      if (modus === 'muster') g.sprich(mu.schritt === 1 ? 'Blättere mit „Bild ▶“ weiter und zähle in jedem Bild.' : mu.schritt === 2 ? `Von Bild zu Bild kommen ${mu.m.a} dazu – also ${mu.m.a} · n. Was ist bei Bild 1 noch zusätzlich da?` : `Rechne ${mu.m.a} · 10 + ${mu.m.b}.`, 'tipp');
      else g.sprich(wa.offen ? 'Nimm auf der anderen Seite dasselbe weg.' : wa.l.e && wa.r.e ? 'Nimm zuerst auf beiden Seiten Würfel weg, bis links keine mehr sind.' : wa.r.x ? 'Nimm auf beiden Seiten ein Säckchen weg.' : 'Verteile die Würfel gerecht auf die Säckchen.', 'tipp');
    }
  });
  void bewegung; void warte;

  function start() { g.sprich(modus === 'muster' ? 'Das Muster wächst. Wie viele sind es in Bild 100? Finde einen Term!' : 'Die Waage ist im Gleichgewicht: Links ist genauso schwer wie rechts.'); }
  neu(); zeichne(); start();
}
