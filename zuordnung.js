/* Mathematik: Zuordnungen (Klasse 7).
   „Doppelskala“: Zwei Zahlenstrahlen übereinander (z. B. kg und €). Gegeben ist ein Paar, gesucht ein anderes.
     Weg: erst auf 1 zurückrechnen (: m), dann auf die gesuchte Menge (· n) – Dreisatz als Bild. Die Pfeile erscheinen mit.
   „Proportional?“: Tabelle und Graph. Erst entscheiden, dann zeigt die Ursprungsgerade und die Quotienten-Zeile, ob es stimmt.
     Bewusst auch Zuordnungen, die nur „fast“ proportional wirken (Grundgebühr, Alter und Größe). */

import { geruest, zufall, wahl, antwortHtml, ESC } from './geruest.js';

const lies = s => { const t = String(s ?? '').trim().replace(/\s/g, '').replace(',', '.'); return t === '' || isNaN(t) ? null : Number(t); };
const zt = v => String(Math.round(v * 100) / 100).replace('.', ',');

const SKALEN = [
  { oben: 'kg Äpfel', eins: 'kg Äpfel', unten: '€', k: [2, 3, 4], satz: (m, p) => `${m} kg Äpfel kosten ${p} €.`, frage: n => `Wie viel kosten ${n} kg?` },
  { oben: 'Hefte', eins: 'Heft', unten: '€', k: [2, 3, 5], satz: (m, p) => `${m} Hefte kosten ${p} €.`, frage: n => `Wie viel kosten ${n} Hefte?` },
  { oben: 'Stunden', eins: 'Stunde', unten: 'km', k: [4, 5, 6, 12], satz: (m, p) => `Eine Wandergruppe schafft in ${m} Stunden ${p} km.`, frage: n => `Wie weit kommt sie in ${n} Stunden (gleich schnell)?` },
  { oben: 'Minuten', eins: 'Minute', unten: 'Liter', k: [6, 8, 9], satz: (m, p) => `Aus einem Hahn fließen in ${m} Minuten ${p} Liter.`, frage: n => `Wie viele Liter sind es in ${n} Minuten?` },
  { oben: 'Personen', eins: 'Person', unten: 'g Nudeln', k: [100, 125, 150], satz: (m, p) => `Für ${m} Personen braucht man ${p} g Nudeln.`, frage: n => `Wie viel braucht man für ${n} Personen?` },
];

/* Situationen für „Proportional?“ – f(x) liefert y; prop gibt an, ob proportional */
const SITUATIONEN = [
  { text: 'Äpfel: Preis je nach Gewicht (2 € pro kg)', x: 'kg', y: '€', f: x => 2 * x, prop: true },
  { text: 'Tanken: Preis je nach Litern (2 € pro Liter)', x: 'Liter', y: '€', f: x => 2 * x, prop: true },
  { text: 'Radtour mit gleichbleibendem Tempo (15 km pro Stunde)', x: 'Stunden', y: 'km', f: x => 15 * x, prop: true },
  { text: 'Stifte: Preis je nach Anzahl (3 € pro Stift)', x: 'Stück', y: '€', f: x => 3 * x, prop: true },
  { text: 'Taxi: 4 € Grundgebühr und 2 € pro km', x: 'km', y: '€', f: x => 4 + 2 * x, prop: false, warum: 'Die Grundgebühr ist auch bei 0 km schon da – der Graph beginnt nicht bei 0.' },
  { text: 'Handytarif: 5 € im Monat und 1 € pro GB Daten', x: 'GB', y: '€', f: x => 5 + x, prop: false, warum: 'Der Grundpreis von 5 € kommt immer dazu.' },
  { text: 'Kerze: 20 cm lang, brennt 2 cm pro Stunde ab', x: 'Stunden', y: 'cm', f: x => 20 - 2 * x, prop: false, warum: 'Die Kerze wird kürzer statt länger – doppelte Zeit heißt nicht doppelte Länge.' },
  { text: 'Alter und Körpergröße eines Kindes', x: 'Jahre', y: 'cm', tabelle: [[2, 86], [4, 102], [6, 115], [8, 128]], prop: false, warum: 'Mit 4 Jahren ist man nicht doppelt so groß wie mit 2 Jahren.' },
];

export function starteZuordnung(root) {
  let modus = 'skala', bewertung = null, eing = {};
  let sk;   // { kont, k, m0, n, schritt }
  let pr;   // { sit, punkte, antwort }

  const g = geruest(root, {
    etikett: 'Zuordnungen', titel: '',
    reiter: [{ id: 'skala', titel: 'Doppelskala', unter: 'über die 1 rechnen' }, { id: 'prop', titel: 'Proportional?', unter: 'Tabelle und Graph' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-zo="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-zo="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    bewertung = null; eing = { 'zo-1': '', 'zo-n': '' };
    if (modus === 'skala') {
      const kont = wahl(SKALEN), k = wahl(kont.k);
      let m0, n; do { m0 = zufall(2, 6); n = zufall(2, 9); } while (n === m0);
      sk = { kont, k, m0, n, schritt: 1 };
    } else {
      const sit = wahl(SITUATIONEN);
      const punkte = sit.tabelle || [1, 2, 3, 4].map(x => [x, sit.f(x)]);
      pr = { sit, punkte, antwort: null };
    }
  }

  /* ---------------- Doppelskala ---------------- */
  function skalaHtml() {
    const { kont, k, m0, n, schritt } = sk;
    const max = Math.max(m0, n) + 1, W = 680, L = 40, Rr = W - 30, X = v => L + (v / max) * (Rr - L);
    let s = `<text x="${L - 30}" y="52" class="zo-einheit">${ESC(kont.oben)}</text><text x="${L - 30}" y="122" class="zo-einheit">${ESC(kont.unten)}</text>
      <line x1="${L}" y1="70" x2="${Rr + 10}" y2="70" class="zo-achse oben"/><line x1="${L}" y1="140" x2="${Rr + 10}" y2="140" class="zo-achse unten"/>`;
    for (let v = 0; v <= max; v++) {
      s += `<line x1="${X(v)}" y1="62" x2="${X(v)}" y2="78" class="zo-strich"/><text x="${X(v)}" y="98" class="zo-zahl">${v}</text>`;
      s += `<line x1="${X(v)}" y1="132" x2="${X(v)}" y2="148" class="zo-strich"/>`;
    }
    const unten = (v, txt, kl = '') => `<text x="${X(v)}" y="${170}" class="zo-wert ${kl}">${txt}</text><line x1="${X(v)}" y1="78" x2="${X(v)}" y2="132" class="zo-verb ${kl}"/>`;
    s += unten(0, '0') + unten(m0, zt(m0 * k), 'gegeben');
    if (schritt >= 2) s += unten(1, zt(k), 'neu');
    if (schritt >= 3) s += unten(n, zt(n * k), 'neu');
    // Pfeile oben: m0 → 1 (: m0) und 1 → n (· n)
    const bogen = (v1, v2, txt, y, kl, unten = false) => {
      const x1 = X(v1), x2 = X(v2), m = (x1 + x2) / 2, q = unten ? y + 38 : y - 38, ty = unten ? y + 30 : y - 24;
      return `<path d="M${x1} ${y} Q${m} ${q} ${x2} ${y}" class="zo-pfeil ${kl}" marker-end="url(#zo-spitze-${kl})"/><text x="${m}" y="${ty}" class="zo-pfeiltext ${kl}">${txt}</text>`;
    };
    s += bogen(m0, 1, `: ${m0}`, 58, 'a') + bogen(m0, 1, `: ${m0}`, 182, 'a', true);
    if (schritt >= 2) s += bogen(1, n, `· ${n}`, 58, 'b') + bogen(1, n, `· ${n}`, 182, 'b', true);
    return `<div class="vz-huelle"><svg class="zo-svg" viewBox="0 0 ${W} 236" style="min-width:560px" role="img" aria-label="Doppelskala">
      <defs>${['a', 'b'].map(c => `<marker id="zo-spitze-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="zo-spitze ${c}"/></marker>`).join('')}</defs>${s}</svg></div>
      <p class="leise">Oben und unten wird mit derselben Zahl gerechnet – deshalb passen die Striche immer übereinander.</p>`;
  }
  const ein = (id, label) => `<input class="gs-ein" id="${id}" data-zoein inputmode="decimal" value="${ESC(eing[id] ?? '')}" aria-label="${label}">`;
  function rechtsSkala() {
    const { kont, k, m0, n, schritt } = sk;
    let h = `<h2 class="bereich-titel">Dreisatz mit der Doppelskala</h2><p class="tl-geschichte">${kont.satz(m0, m0 * k)} ${kont.frage(n)}</p>`;
    h += `<p class="vz-schritt${schritt > 1 ? ' fertig' : ''}">1. Auf 1 zurück: 1 ${ESC(kont.eins)} ↔ ${schritt > 1 ? `${zt(k)} ${ESC(kont.unten)} ✓` : ''}</p>`;
    if (schritt === 1) h += `<p class="ut-frage">${zt(m0 * k)} : ${m0} = ${ein('zo-1', 'Wert für 1')} ${ESC(kont.unten)}</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zo="pruefen">✓ Prüfen</button></div>`;
    if (schritt >= 2) {
      h += `<p class="vz-schritt${schritt > 2 ? ' fertig' : ''}">2. Von 1 auf ${n}: ${schritt > 2 ? `${zt(n * k)} ${ESC(kont.unten)} ✓` : ''}</p>`;
      if (schritt === 2) h += `<p class="ut-frage">${zt(k)} · ${n} = ${ein('zo-n', `Wert für ${n}`)} ${ESC(kont.unten)}</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-zo="pruefen">✓ Prüfen</button></div>`;
    }
    if (schritt === 3) h += `<div class="fl-formel zo-tabelle"><table><tr><td>${m0}</td><td>→</td><td>${zt(m0 * k)}</td><td class="zo-op">: ${m0}</td></tr><tr><td>1</td><td>→</td><td>${zt(k)}</td><td class="zo-op">· ${n}</td></tr><tr><td>${n}</td><td>→</td><td><b>${zt(n * k)}</b></td><td></td></tr></table></div>`;
    return h + antwortHtml(bewertung);
  }
  function pruefeSkala() {
    const { k, m0, n } = sk;
    if (sk.schritt === 1) {
      const v = lies(eing['zo-1']);
      if (v === k) { sk.schritt = 2; bewertung = null; g.sprich(`Für 1 sind es ${zt(k)}. Oben und unten wurde durch ${m0} geteilt.`); }
      else bewertung = { ok: false, text: `Teile beide Werte durch ${m0}: oben ${m0} : ${m0} = 1, unten ${zt(m0 * k)} : ${m0} = ?` };
    } else if (sk.schritt === 2) {
      const v = lies(eing['zo-n']);
      if (v === n * k) { sk.schritt = 3; bewertung = { ok: true, text: `Richtig: ${zt(n * k)}` }; g.sprich('Erst auf 1, dann auf die gesuchte Menge – oben und unten dasselbe rechnen.', 'fertig'); }
      else bewertung = { ok: false, text: `Nimm beide Werte mal ${n}: oben 1 · ${n} = ${n}, unten ${zt(k)} · ${n} = ?` };
    }
    zeichne();
    root.querySelector('.tb-rechts input')?.focus({ preventScroll: true });
  }

  /* ---------------- Proportional? ---------------- */
  function propHtml() {
    const { sit, punkte, antwort } = pr;
    const maxX = Math.max(...punkte.map(p => p[0])) * 1.15, maxY = Math.max(...punkte.map(p => p[1])) * 1.15;
    const W = 420, H = 300, L = 50, B = 260, X = x => L + (x / maxX) * (W - L - 20), Y = y => B - (y / maxY) * (B - 20);
    let s = `<line x1="${L}" y1="${B}" x2="${W - 10}" y2="${B}" class="zo-achse"/><line x1="${L}" y1="${B}" x2="${L}" y2="12" class="zo-achse"/>
      <text x="${W - 10}" y="${B + 30}" class="zo-zahl" style="text-anchor:end">${ESC(sit.x)}</text><text x="${L - 8}" y="14" class="zo-zahl" style="text-anchor:end">${ESC(sit.y)}</text>
      <text x="${L - 8}" y="${B + 18}" class="zo-zahl" style="text-anchor:end">0</text>`;
    punkte.forEach(([x, y]) => { s += `<line x1="${X(x)}" y1="${B}" x2="${X(x)}" y2="${B + 6}" class="zo-strich"/><text x="${X(x)}" y="${B + 20}" class="zo-zahl">${zt(x)}</text>`; });
    if (antwort) {
      const [x1, y1] = punkte[0];
      const xe = maxX, ye = (y1 / x1) * xe;
      s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(xe)}" y2="${Y(Math.min(ye, maxY * 1.5))}" class="zo-gerade"/>`;
      s += `<circle cx="${X(0)}" cy="${Y(0)}" r="6" class="zo-ursprung"/>`;
    }
    punkte.forEach(([x, y]) => { s += `<circle cx="${X(x)}" cy="${Y(y)}" r="7" class="zo-punkt"/><text x="${X(x) + 10}" y="${Y(y) - 8}" class="zo-pwert">${zt(y)}</text>`; });
    const tab = `<table class="zo-wertetab"><tr><th>${ESC(sit.x)}</th>${punkte.map(p => `<td>${zt(p[0])}</td>`).join('')}</tr>
      <tr><th>${ESC(sit.y)}</th>${punkte.map(p => `<td>${zt(p[1])}</td>`).join('')}</tr>
      ${antwort ? `<tr class="zo-quot"><th>${ESC(sit.y)} : ${ESC(sit.x)}</th>${punkte.map(p => `<td>${zt(p[1] / p[0])}</td>`).join('')}</tr>` : ''}</table>`;
    return `${tab}<svg class="zo-graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="Graph">${s}</svg>
      ${antwort ? `<p class="leise">Gestrichelt: die Gerade durch den Nullpunkt und den ersten Punkt. Proportional heißt: alle Punkte liegen darauf.</p>` : ''}`;
  }
  function rechtsProp() {
    const { sit, antwort } = pr;
    return `<h2 class="bereich-titel">Ist das proportional?</h2><p class="tl-geschichte">${ESC(sit.text)}</p>
      <p class="leise">Proportional heißt: doppelt so viel → doppelt so viel, und 0 → 0.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross${antwort === 'ja' ? ' gewaehlt' : ''}" data-prop="ja" ${bewertung?.ok ? 'disabled' : ''}>✓ ja, proportional</button>
        <button type="button" class="kn-gross${antwort === 'nein' ? ' gewaehlt' : ''}" data-prop="nein" ${bewertung?.ok ? 'disabled' : ''}>✗ nein</button></div>${antwortHtml(bewertung)}`;
  }
  function antwortProp(w) {
    pr.antwort = w;
    const richtig = (w === 'ja') === pr.sit.prop;
    bewertung = richtig ? { ok: true, text: pr.sit.prop ? 'Richtig: Der Quotient ist immer gleich, alle Punkte liegen auf einer Geraden durch 0.' : `Richtig: nicht proportional. ${pr.sit.warum}` }
      : { ok: false, text: pr.sit.prop ? 'Schau auf die Quotienten-Zeile und den Graphen: Doch, es ist proportional.' : `Schau genau hin: ${pr.sit.warum}` };
    if (richtig) g.sprich('Prüfe immer: Liegt der Punkt (0|0) dabei, und ist y : x immer gleich?', 'fertig');
    zeichne();
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'skala' ? 'Dreisatz mit der Doppelskala' : 'Proportional oder nicht?');
    g.links.innerHTML = modus === 'skala' ? skalaHtml() : propHtml();
    g.rechts.innerHTML = modus === 'skala' ? rechtsSkala() : rechtsProp();
  }

  root.addEventListener('input', e => { if (e.target.matches('[data-zoein]')) { e.target.value = e.target.value.replace(/[^\d,.]/g, ''); eing[e.target.id] = e.target.value; } });
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const p = e.target.closest('[data-prop]');
    if (p && !bewertung?.ok) { antwortProp(p.dataset.prop); return; }
    const k = e.target.closest('[data-zo]');
    if (!k) return;
    if (k.dataset.zo === 'neu') { neu(); zeichne(); start(); }
    if (k.dataset.zo === 'pruefen') pruefeSkala();
    if (k.dataset.zo === 'tipp') g.sprich(modus === 'skala' ? (sk.schritt === 1 ? `Wie viel ist es für 1? Teile ${zt(sk.m0 * sk.k)} durch ${sk.m0}.` : `Für 1 sind es ${zt(sk.k)}. Für ${sk.n} also ${sk.n}-mal so viel.`) : 'Rechne y : x für jede Spalte. Ist es immer gleich? Und ist bei 0 auch 0?', 'tipp');
  });

  function start() { g.sprich(modus === 'skala' ? 'Zwei Zahlenstrahlen gehören zusammen: Was oben passiert, passiert auch unten.' : 'Nicht alles, was gleichmäßig wächst, ist proportional!'); }
  neu(); zeichne(); start();
}
