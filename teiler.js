/* Mathematik: Teiler finden mit dem Steckbrett.
   n Perlen werden in Reihen gleicher Länge gesteckt. Geht es ohne Rest auf, ist die Reihenlänge ein Teiler –
   und die Anzahl der Reihen auch (Teilerpaar). Bei Primzahlen klappt das nur als eine lange Reihe. */

const ESC = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export const STUFEN_T = [
  { stufe: 1, titel: 'Stufe 1', text: 'Zahlen bis 20', min: 6, max: 20 },
  { stufe: 2, titel: 'Stufe 2', text: 'Zahlen bis 48', min: 21, max: 48 },
  { stufe: 3, titel: 'Stufe 3', text: 'Zahlen bis 100', min: 49, max: 100 },
];

export function teilerVon(n) {
  const t = [];
  for (let k = 1; k <= n; k++) if (n % k === 0) t.push(k);
  return t;
}
export const istPrim = n => n > 1 && teilerVon(n).length === 2;

/** Zufallszahl: meist zusammengesetzt (viele Teiler zum Entdecken), manchmal eine Primzahl. */
export function zufallsZahl(stufe, ausser) {
  const s = STUFEN_T.find(x => x.stufe === stufe) || STUFEN_T[0];
  const prim = Math.random() < 0.22;
  for (let i = 0; i < 200; i++) {
    const n = zufall(s.min, s.max);
    if (n !== ausser && istPrim(n) === prim) return n;
  }
  return zufall(s.min, s.max);
}

export function starteTeiler(root, startZahl, { neueZahl } = {}) {
  let n = startZahl;
  let k = null;                 // aktuelle Reihenlänge
  let status = new Map();       // Reihenlänge -> 'teiler' | 'kein' | 'partner'
  let antwortPrim = null;       // Antwort auf die Schlussfrage
  let tippK = null;
  let haufen = [];              // Zufallslage der Perlen vor dem ersten Legen

  function neu(zahl) {
    n = zahl; k = null; status = new Map(); antwortPrim = null; tippK = null;
    haufen = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), w: Math.random() * 360 }));
  }
  neu(n);

  const teiler = () => teilerVon(n);
  const alleGefunden = () => teiler().every(t => status.get(t) === 'teiler' || status.get(t) === 'partner');

  /* ---------- Gerüst ---------- */
  root.innerHTML = `
  <section class="tb">
    <div class="tb-kopf">
      <div>
        <span class="etikett">Untersuche die Zahl</span>
        <div class="tb-zahl" id="tb-zahl"></div>
      </div>
      <div class="tb-kopf-knoepfe">
        <button type="button" class="kn-gross kn-tipp" data-tb="tipp"><span aria-hidden="true">?</span> Tipp</button>
        ${neueZahl ? '<button type="button" class="kn-gross kn-leise" data-tb="neu">＋ Neue Zahl</button>' : ''}
      </div>
    </div>
    <div class="sprechblase info" id="tb-blase" role="status" aria-live="polite"></div>
    <div class="tb-flaeche">
      <div class="tb-links">
        <h2 class="bereich-titel">Steckbrett</h2>
        <div class="tb-brett" id="tb-brett"></div>
        <p class="tb-ergebnis" id="tb-ergebnis"></p>
      </div>
      <aside class="tb-rechts">
        <h2 class="bereich-titel">Wie viele Perlen in eine Reihe?</h2>
        <div class="tb-leiste" id="tb-leiste" role="group" aria-label="Reihenlänge wählen"></div>
        <h2 class="bereich-titel">Gefundene Teiler</h2>
        <div class="tb-paare" id="tb-paare"></div>
        <div id="tb-frage"></div>
      </aside>
    </div>
  </section>`;

  const $ = s => root.querySelector(s);
  const brett = $('#tb-brett');

  function sprich(text, art = 'info') {
    const b = $('#tb-blase');
    b.className = `sprechblase ${art}`;
    b.innerHTML = `<span class="blase-symbol" aria-hidden="true">${art === 'fertig' ? '★' : art === 'tipp' ? '?' : 'i'}</span><span>${text}</span>`;
  }

  /* ---------- Brett mit Perlen (Positionen werden animiert) ---------- */
  function perlenAnlegen() {
    brett.innerHTML = Array.from({ length: n }, (_, i) => `<i class="tb-perle" data-i="${i}"></i>`).join('');
  }

  function lege() {
    const breite = brett.clientWidth || 600;
    const hoeheMax = Math.min(420, Math.max(260, window.innerHeight * 0.45));
    const perlen = brett.querySelectorAll('.tb-perle');
    if (!k) {
      const g = Math.min(34, Math.max(12, Math.sqrt((breite * 220) / n) * 0.55));
      brett.style.height = `240px`;
      perlen.forEach((p, i) => {
        const h = haufen[i];
        p.style.cssText = `--g:${g}px;left:${h.x * (breite - g)}px;top:${20 + h.y * (200 - g)}px`;
        p.className = 'tb-perle haufen';
      });
      return;
    }
    const reihen = Math.ceil(n / k);
    const zelle = Math.max(4, Math.min(44, (breite - 8) / k, hoeheMax / reihen));
    const g = zelle * 0.8;
    const rest = n % k;
    const breiteFeld = k * zelle;
    const x0 = Math.max(0, (breite - breiteFeld) / 2);
    brett.style.height = `${reihen * zelle + 16}px`;
    perlen.forEach((p, i) => {
      const r = Math.floor(i / k), c = i % k;
      const inRest = rest && r === reihen - 1;
      p.style.cssText = `--g:${g}px;left:${x0 + c * zelle + (zelle - g) / 2}px;top:${8 + r * zelle + (zelle - g) / 2}px;transition-delay:${Math.min(i * 6, 500)}ms`;
      p.className = `tb-perle ${inRest ? 'rest' : r % 2 ? 'reihe-b' : 'reihe-a'}`;
    });
  }

  /* ---------- Anzeige ---------- */
  function zeichne() {
    $('#tb-zahl').textContent = n;
    // Zahlenleiste
    let leiste = '';
    for (let t = 1; t <= n; t++) {
      const st = status.get(t) || '';
      leiste += `<button type="button" class="tb-k ${st}${k === t ? ' aktiv' : ''}${tippK === t ? ' tipp-ziel' : ''}" data-k="${t}"
        aria-label="Reihen mit ${t} ${t === 1 ? 'Perle' : 'Perlen'}${st === 'kein' ? ', kein Teiler' : st ? ', Teiler' : ''}">${t}</button>`;
    }
    $('#tb-leiste').innerHTML = leiste;

    // Teilerpaare
    const paare = teiler().filter(t => t * t <= n).map(t => {
      const m = n / t;
      const gef = status.get(t) === 'teiler' || status.get(t) === 'partner';
      return gef
        ? `<span class="tb-paar"><b>${t}</b> · <b>${m}</b> = ${n}</span>`
        : `<span class="tb-paar offen">? · ? = ${n}</span>`;
    });
    const gefundene = teiler().filter(t => status.get(t) === 'teiler' || status.get(t) === 'partner');
    $('#tb-paare').innerHTML = `
      <div class="tb-menge" aria-label="Teilermenge">T(${n}) = { ${gefundene.join(', ')}${alleGefunden() ? '' : gefundene.length ? ', …' : '…'} }</div>
      <div class="tb-paarliste">${paare.join('')}</div>`;

    // Ergebnis zur aktuellen Reihenlänge
    const erg = $('#tb-ergebnis');
    if (!k) {
      erg.innerHTML = `${n} Perlen liegen auf einem Haufen. Wähle rechts, wie viele Perlen in eine Reihe sollen.`;
      erg.className = 'tb-ergebnis';
    } else if (n % k === 0) {
      const m = n / k;
      erg.innerHTML = `${m} ${m === 1 ? 'Reihe' : 'Reihen'} mit je ${k} ${k === 1 ? 'Perle' : 'Perlen'} – es geht auf! <b>${m} · ${k} = ${n}</b>.
        Also sind <b>${k}</b> und <b>${m}</b> Teiler von ${n}.`;
      erg.className = 'tb-ergebnis gut';
    } else {
      const m = Math.floor(n / k), r = n % k;
      erg.innerHTML = `${m} volle ${m === 1 ? 'Reihe' : 'Reihen'} mit je ${k} Perlen, aber <b>${r} ${r === 1 ? 'Perle bleibt' : 'Perlen bleiben'} übrig</b>.
        ${k} ist kein Teiler von ${n}.`;
      erg.className = 'tb-ergebnis schlecht';
    }

    // Schlussfrage
    const frage = $('#tb-frage');
    if (alleGefunden()) {
      const prim = istPrim(n);
      frage.innerHTML = `
        <div class="tb-schluss">
          <p><b>Alle ${teiler().length} Teiler gefunden!</b> Ist ${n} eine Primzahl?</p>
          <div class="tb-ja-nein">
            <button type="button" class="kn-gross${antwortPrim === true ? ' gewaehlt' : ''}" data-tb="ja">Ja</button>
            <button type="button" class="kn-gross${antwortPrim === false ? ' gewaehlt' : ''}" data-tb="nein">Nein</button>
          </div>
          ${antwortPrim === null ? '' : antwortPrim === prim
            ? `<p class="tb-antwort gut">${prim
              ? `Richtig! ${n} hat genau zwei Teiler: 1 und ${n}. Die Perlen lassen sich nur zu einer langen Reihe legen.`
              : `Richtig! ${n} hat ${teiler().length} Teiler. Eine Primzahl hat genau zwei: 1 und sich selbst.`}</p>`
            : `<p class="tb-antwort schlecht">Schau noch einmal: Eine Primzahl hat genau zwei Teiler. ${n} hat ${teiler().length}.</p>`}
        </div>`;
    } else {
      frage.innerHTML = '';
    }
  }

  /* ---------- Aktionen ---------- */
  function waehle(t) {
    k = t; tippK = null;
    if (n % t === 0) {
      const m = n / t;
      const warNeu = !status.has(t) || status.get(t) === 'partner';
      status.set(t, 'teiler');
      if (!status.has(m)) status.set(m, 'partner');
      if (alleGefunden()) sprich(`Super! Du hast alle Teiler von ${n} gefunden. Beantworte rechts die Frage.`, 'fertig');
      else if (m !== t && warNeu) sprich(`${t} passt! Und weil ${m} · ${t} = ${n} ist, ist auch <b>${m}</b> ein Teiler. Teiler kommen immer als Paar.`, 'info');
      else if (m === t) sprich(`${t} · ${t} = ${n}: Die Perlen bilden ein Quadrat! ${t} ist sein eigener Partner.`, 'info');
      else sprich(`${t} ist ein Teiler von ${n}.`, 'info');
    } else {
      status.set(t, 'kein');
      sprich(`Bei ${t} bleibt ein Rest. Probiere eine andere Reihenlänge.`, 'info');
    }
    zeichne();
    lege();
  }

  function tipp() {
    if (alleGefunden()) { sprich('Alle Teiler sind gefunden. Beantworte rechts die Frage.', 'tipp'); return; }
    const offen = [];
    for (let t = 1; t * t <= n; t++) if (!status.has(t)) offen.push(t);
    const t = offen[0];
    if (t) {
      tippK = t;
      const wurzel = Math.floor(Math.sqrt(n));
      sprich(`Probiere Reihen mit <b>${t}</b> ${t === 1 ? 'Perle' : 'Perlen'}. Du musst nur bis ${wurzel} probieren: Bei noch längeren Reihen gibt es weniger Reihen als Perlen in einer Reihe – diese Teiler hast du dann schon als Partner gefunden.`, 'tipp');
    } else {
      sprich('Schau dir die Teilerpaare an: Zu jedem gefundenen Teiler gehört ein Partner.', 'tipp');
    }
    zeichne();
  }

  root.addEventListener('click', e => {
    const kb = e.target.closest('[data-k]');
    if (kb) { waehle(Number(kb.dataset.k)); return; }
    const b = e.target.closest('[data-tb]');
    if (!b) return;
    switch (b.dataset.tb) {
      case 'tipp': tipp(); break;
      case 'neu': neu(neueZahl()); perlenAnlegen(); zeichne(); lege(); sprich(`Neue Zahl: ${n}. Lege die Perlen in Reihen.`); break;
      case 'ja': antwortPrim = true; zeichne(); break;
      case 'nein': antwortPrim = false; zeichne(); break;
      default: break;
    }
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (root.isConnected) lege(); }, 120); });

  perlenAnlegen();
  zeichne();
  lege();
  sprich(`Lege die ${n} Perlen in gleich lange Reihen. Geht es ohne Rest auf, hast du einen Teiler gefunden.`);
}
