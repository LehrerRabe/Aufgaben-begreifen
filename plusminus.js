/* Mathematik: Plus und Minus mit Vorzeichen (Klasse 7).
   „Plättchen“: blaue Plättchen sind +1, rote −1. Ein blaues und ein rotes zusammen sind ein Nullpaar (= 0).
     Plus: Plättchen dazulegen. Minus: Plättchen wegnehmen – fehlen welche, legt man Nullpaare dazu.
     Zum Schluss lösen sich die Nullpaare auf; was übrig bleibt, ist das Ergebnis.
   „Frosch“: Der Frosch startet bei der ersten Zahl. Plus: Blick nach rechts, Minus: umdrehen (Blick nach links).
     Positive Zahl: vorwärts hüpfen, negative Zahl: rückwärts hüpfen. Jeder Hüpfer wird angetippt. */

import { geruest, zufall, wahl, antwortHtml, bewegung, warte, ESC } from './geruest.js';

const M = '−';
const zt = v => (v < 0 ? M + Math.abs(v) : String(v));
const zk = v => (v < 0 ? `(${M}${Math.abs(v)})` : String(v));
const liesG = s => { const t = String(s ?? '').trim().replace(/[−–]/g, '-').replace(/\s/g, ''); return /^[+-]?\d+$/.test(t) ? Number(t) : null; };

export function startePlusMinus(root) {
  let modus = 'plaettchen', bewertung = null, eing = '';
  let a, b, op, phase;
  let blau, rot, weg, aufgeloest, fertigAufgeloest;            // Plättchen
  let blick, richtung, hops, laeuft;         // Frosch

  const g = geruest(root, {
    etikett: 'Rationale Zahlen', titel: '',
    reiter: [{ id: 'plaettchen', titel: 'Plättchen', unter: 'Nullpaare' }, { id: 'frosch', titel: 'Frosch am Zahlenstrahl', unter: 'umdrehen und hüpfen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-pm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-pm="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    bewertung = null; eing = '';
    do { a = wahl([-1, 1]) * zufall(1, 7); b = wahl([-1, 1]) * zufall(1, 7); op = wahl(['+', M]); }
    while (Math.abs(erg()) > 12 || (modus === 'plaettchen' && op === M && Math.random() < 0.15 && Math.sign(a) === Math.sign(b)));
    phase = 1;
    blau = a > 0 ? a : 0; rot = a < 0 ? -a : 0; weg = 0; aufgeloest = false; fertigAufgeloest = false;
    blick = null; richtung = null; hops = 0; laeuft = false;
  }
  const erg = () => (op === '+' ? a + b : a - b);
  const aufgabeText = () => `${zt(a)} ${op} ${zk(b)}`;

  /* ---------------- Plättchen ---------------- */
  const farbe = v => (v > 0 ? 'blau' : 'rot');
  const nb = () => Math.abs(b);
  const vorrat = () => (b > 0 ? blau : rot);           // passende Plättchen zum Wegnehmen
  function plaettchenHtml() {
    const paare = Math.min(blau, rot);
    const zeile = (n, art) => Array.from({ length: n }, (_, i) => {
      const paar = i < paare;
      const loest = aufgeloest && paar;
      return `<span class="pm-pl ${art}${paar ? ' paar' : ''}${loest ? ' weg' : ''}" style="--i:${i}">${art === 'blau' ? '+' : M}</span>`;
    }).join('');
    return `<div class="pm-tisch">
      <div class="pm-reihe"><span class="pm-label">+1</span>${zeile(blau, 'blau')}</div>
      <div class="pm-reihe"><span class="pm-label">${M}1</span>${zeile(rot, 'rot')}</div>
      ${paare && !aufgeloest ? `<p class="leise pm-paarhinweis">${paare} ${paare === 1 ? 'Nullpaar' : 'Nullpaare'} (+1 und ${M}1 = 0)</p>` : ''}
      ${weg ? `<div class="pm-ablage"><span class="pm-label">weg</span>${Array.from({ length: weg }, () => `<span class="pm-pl ${farbe(b)} raus">${b > 0 ? '+' : M}</span>`).join('')}</div>` : ''}
    </div>`;
  }
  function rechtsPlaettchen() {
    let h = `<h2 class="bereich-titel">Rechne mit Plättchen</h2><p class="rr-gross">${aufgabeText()}</p>`;
    const sch = (n, t, fertig) => `<p class="vz-schritt${fertig ? ' fertig' : ''}">${n}. ${t}${fertig ? ' ✓' : ''}</p>`;
    h += sch(1, `${zt(a)} liegt: ${Math.abs(a)} ${a > 0 ? 'blaue' : 'rote'} Plättchen.`, true);
    if (op === '+') {
      h += sch(2, `Lege ${zk(b)} dazu: ${nb()} ${b > 0 ? 'blaue' : 'rote'}.`, phase > 2);
      if (phase === 1 || phase === 2) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pm="dazu">＋ ${nb()} ${b > 0 ? 'blaue' : 'rote'} dazulegen</button></div>`;
    } else {
      h += sch(2, `Nimm ${zk(b)} weg: ${nb()} ${b > 0 ? 'blaue' : 'rote'}.`, phase > 2);
      if (phase <= 2) {
        const reicht = vorrat() >= nb();
        h += `<p class="leise">${reicht ? 'Es liegen genug da – nimm sie weg.' : `Es liegen nur ${vorrat()} ${b > 0 ? 'blaue' : 'rote'} da. Lege Nullpaare dazu – sie ändern den Wert nicht!`}</p>
          <div class="gs-pruef"><button type="button" class="kn-gross" data-pm="nullpaar">＋ Nullpaar dazulegen</button>
          <button type="button" class="kn-gross kn-haupt" data-pm="weg" ${reicht ? '' : 'disabled'}>− ${nb()} wegnehmen</button></div>`;
      }
    }
    if (phase >= 3) {
      h += sch(3, 'Nullpaare auflösen.', aufgeloest);
      if (!aufgeloest) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pm="aufloesen">✨ Nullpaare auflösen</button></div>`;
    }
    if (fertigAufgeloest) {
      h += sch(4, 'Was bleibt übrig?', bewertung?.ok);
      h += `<p class="vz-zeile">${aufgabeText()} = <input class="vz-ein" id="pm-e" data-pmein inputmode="text" autocomplete="off" value="${ESC(eing)}" aria-label="Ergebnis"></p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pm="pruefen">✓ Prüfen</button></div>`;
    }
    return h + antwortHtml(bewertung);
  }

  /* ---------------- Frosch ---------------- */
  const R = 15, W = 900, L0 = 30, L1 = W - 30;
  const X = v => L0 + ((v + R) * (L1 - L0)) / (2 * R);
  function froschHtml() {
    const y = 120;
    let s = `<rect x="${L0}" y="${y - 70}" width="${X(0) - L0}" height="100" class="vz-minusseite"/><rect x="${X(0)}" y="${y - 70}" width="${L1 - X(0)}" height="100" class="vz-plusseite"/>
      <line x1="${L0 - 14}" y1="${y}" x2="${L1 + 16}" y2="${y}" class="vz-linie"/>`;
    for (let v = -R; v <= R; v++) {
      const f = v % 5 === 0;
      s += `<line x1="${X(v)}" y1="${y - (f ? 11 : 6)}" x2="${X(v)}" y2="${y + (f ? 11 : 6)}" class="vz-strich${f ? ' fuenf' : ''}"/>`;
      s += `<text x="${X(v)}" y="${y + 30}" class="vz-zahl${v === 0 ? ' null' : ''}${f ? '' : ' klein'}">${zt(v)}</text>`;
    }
    const schrittRichtung = (blick === 'rechts' ? 1 : -1) * (richtung === 'vor' ? 1 : -1);
    for (let k = 0; k < hops; k++) {
      const x1 = X(a + k * schrittRichtung), x2 = X(a + (k + 1) * schrittRichtung), mx = (x1 + x2) / 2;
      s += `<path d="M${x1} ${y - 4} Q${mx} ${y - 46} ${x2} ${y - 4}" class="vz-bogen" stroke="${richtung === 'vor' ? '#2fae58' : '#f07d2a'}"/>`;
    }
    const pos = a + hops * (blick ? schrittRichtung : 0);
    const dreh = blick === 'links' ? -1 : 1;
    s += `<g class="pm-frosch" data-frosch style="transform: translate(${X(pos)}px, ${y - 14}px)"><g transform="scale(${dreh} 1)">
        <ellipse cx="0" cy="0" rx="15" ry="11" fill="#2fae58" stroke="#fff" stroke-width="2"/>
        <circle cx="7" cy="-10" r="5" fill="#fff"/><circle cx="8.5" cy="-10" r="2.2" fill="#123"/>
        <path d="M15 0 l7 -3" stroke="#2fae58" stroke-width="3" stroke-linecap="round"/>
        <path d="M9 4 Q13 7 16 4" stroke="#fff" stroke-width="1.8" fill="none"/></g></g>`;
    if (blick) s += `<text x="${X(pos)}" y="${y - 42}" class="pm-blick">${blick === 'rechts' ? '→' : '←'}</text>`;
    return `<div class="vz-huelle"><svg class="vz-svg" viewBox="0 0 ${W} 170" style="min-width:640px" role="img" aria-label="Zahlenstrahl mit Frosch">${s}</svg></div>
      <div class="vz-merk" style="font-size:1rem"><b>Regeln:</b> Plus → Blick nach rechts. Minus → umdrehen, Blick nach links.<br>
        Positive Zahl → vorwärts hüpfen. Negative Zahl → rückwärts hüpfen.</div>`;
  }
  function rechtsFrosch() {
    let h = `<h2 class="bereich-titel">Rechne mit dem Frosch</h2><p class="rr-gross">${aufgabeText()}</p>`;
    const sch = (n, t, fertig) => `<p class="vz-schritt${fertig ? ' fertig' : ''}">${n}. ${t}${fertig ? ' ✓' : ''}</p>`;
    h += sch(1, `Start bei ${zt(a)}.`, true);
    h += sch(2, `Rechenzeichen ${op}: Wohin schaut der Frosch?`, !!blick);
    if (!blick) h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-blick="links">← nach links</button><button type="button" class="kn-gross" data-blick="rechts">nach rechts →</button></div>`;
    if (blick) {
      h += sch(3, `Zahl ${zk(b)}: vorwärts oder rückwärts?`, !!richtung);
      if (!richtung) h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-richtung="vor">vorwärts</button><button type="button" class="kn-gross" data-richtung="rueck">rückwärts</button></div>`;
    }
    if (richtung) {
      h += sch(4, `${nb()}-mal hüpfen.`, hops === nb());
      if (hops < nb()) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pm="hupf" ${laeuft ? 'disabled' : ''}>🐸 Hüpfen (${hops}/${nb()})</button></div>`;
    }
    if (hops === nb() && richtung) {
      h += `<p class="vz-zeile">${aufgabeText()} = <input class="vz-ein" id="pm-e" data-pmein inputmode="text" autocomplete="off" value="${ESC(eing)}" aria-label="Ergebnis"></p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-pm="pruefen">✓ Prüfen</button></div>`;
    }
    return h + antwortHtml(bewertung);
  }
  async function hupf() {
    if (laeuft || hops >= nb()) return;
    laeuft = true;
    const sr = (blick === 'rechts' ? 1 : -1) * (richtung === 'vor' ? 1 : -1);
    const x0 = X(a + hops * sr);
    hops++;
    zeichne();
    const fr = root.querySelector('[data-frosch]'), x1 = X(a + hops * sr);
    if (fr && bewegung()) await fr.animate([{ transform: `translate(${x0}px, 106px)` }, { transform: `translate(${(x0 + x1) / 2}px, 64px)` }, { transform: `translate(${x1}px, 106px)` }], { duration: 380, easing: 'ease-in-out' }).finished.catch(() => {});
    laeuft = false;
    zeichne();
    if (hops === nb()) { g.sprich(`Der Frosch ist bei ${zt(erg())} gelandet.`); fokus(); }
    else root.querySelector('[data-pm="hupf"]')?.focus({ preventScroll: true });
    mitteZeigen();
  }
  function mitteZeigen() {
    const h = root.querySelector('.vz-huelle');
    if (!h || h.scrollWidth <= h.clientWidth + 2) return;
    const sr = (blick === 'rechts' ? 1 : -1) * (richtung === 'vor' ? 1 : -1);
    h.scrollLeft = (X(a + hops * (blick ? sr : 0)) / W) * h.scrollWidth - h.clientWidth / 2;
  }

  /* ---------------- gemeinsam ---------------- */
  function pruefen() {
    const v = liesG(eing);
    if (v === null) bewertung = { ok: false, text: 'Trage eine ganze Zahl ein (mit Minus, wenn sie negativ ist).' };
    else if (v === erg()) {
      bewertung = { ok: true, text: `Richtig: ${aufgabeText()} = ${zt(erg())}` };
      g.sprich(op === M && b < 0 ? `Minus eine negative Zahl ist wie Plus: ${zt(a)} − ${zk(b)} = ${zt(a)} + ${Math.abs(b)}.` : op === '+' && b < 0 ? `Plus eine negative Zahl ist wie Minus: ${zt(a)} + ${zk(b)} = ${zt(a)} − ${Math.abs(b)}.` : 'Gut gerechnet!', 'fertig');
    } else if (v === -erg()) bewertung = { ok: false, text: 'Die Zahl stimmt, aber das Vorzeichen nicht.' };
    else bewertung = { ok: false, text: modus === 'plaettchen' ? 'Zähle, was nach dem Auflösen übrig bleibt.' : 'Lies ab, wo der Frosch steht.' };
    zeichne();
  }
  function fokus() { requestAnimationFrame(() => root.querySelector('#pm-e')?.focus({ preventScroll: true })); }
  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'plaettchen' ? 'Plus und Minus mit Plättchen' : 'Plus und Minus am Zahlenstrahl');
    g.links.innerHTML = modus === 'plaettchen' ? plaettchenHtml() : froschHtml();
    g.rechts.innerHTML = modus === 'plaettchen' ? rechtsPlaettchen() : rechtsFrosch();
    if (modus === 'frosch') mitteZeigen();
  }
  function tipp() {
    if (modus === 'plaettchen') {
      if (phase <= 2 && op === M && vorrat() < nb()) g.sprich(`Du brauchst ${nb()} ${b > 0 ? 'blaue' : 'rote'} zum Wegnehmen. Lege so lange Nullpaare dazu, bis genug da sind.`, 'tipp');
      else if (!aufgeloest) g.sprich('Ein blaues und ein rotes Plättchen heben sich auf. Tippe auf „Nullpaare auflösen“.', 'tipp');
      else g.sprich('Zähle die Plättchen, die übrig sind. Rote bedeuten ein negatives Ergebnis.', 'tipp');
    } else {
      if (!blick) g.sprich(op === '+' ? 'Bei Plus schaut der Frosch nach rechts.' : 'Bei Minus dreht sich der Frosch um: Er schaut nach links.', 'tipp');
      else if (!richtung) g.sprich(b > 0 ? `${zt(b)} ist positiv: vorwärts hüpfen.` : `${zt(b)} ist negativ: rückwärts hüpfen.`, 'tipp');
      else g.sprich(`Hüpfe ${nb()}-mal und lies ab, wo der Frosch landet.`, 'tipp');
    }
  }

  root.addEventListener('input', e => {
    if (!e.target.matches('[data-pmein]')) return;
    e.target.value = e.target.value.replace(/[^\d+\-−]/g, '').replace('-', M);
    eing = e.target.value;
  });
  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const bl = e.target.closest('[data-blick]');
    if (bl && !blick) {
      const soll = op === '+' ? 'rechts' : 'links';
      if (bl.dataset.blick === soll) { blick = soll; bewertung = null; g.sprich(op === '+' ? 'Plus: Der Frosch schaut nach rechts.' : 'Minus: Der Frosch dreht sich um.'); }
      else { bewertung = { ok: false, text: op === '+' ? 'Bei Plus schaut der Frosch nach rechts.' : 'Bei Minus dreht sich der Frosch um – er schaut nach links.' }; }
      zeichne(); return;
    }
    const ri = e.target.closest('[data-richtung]');
    if (ri && blick && !richtung) {
      const soll = b > 0 ? 'vor' : 'rueck';
      if (ri.dataset.richtung === soll) { richtung = soll; bewertung = null; g.sprich(b > 0 ? 'Positive Zahl: vorwärts.' : 'Negative Zahl: rückwärts – der Frosch hüpft mit dem Rücken voran.'); }
      else bewertung = { ok: false, text: b > 0 ? `${zt(b)} ist positiv – also vorwärts.` : `${zt(b)} ist negativ – also rückwärts.` };
      zeichne(); return;
    }
    const k = e.target.closest('[data-pm]');
    if (!k) return;
    const was = k.dataset.pm;
    if (was === 'neu') { neu(); zeichne(); start(); }
    if (was === 'tipp') tipp();
    if (was === 'pruefen') pruefen();
    if (was === 'hupf') hupf();
    if (was === 'dazu' && phase <= 2) { if (b > 0) blau += nb(); else rot += nb(); phase = 3; bewertung = null; zeichne(); g.sprich('Dazugelegt. Jetzt heben sich die Nullpaare auf.'); }
    if (was === 'nullpaar' && phase <= 2) { blau++; rot++; phase = 2; bewertung = null; zeichne(); g.sprich('Ein Nullpaar ist 0 – der Wert bleibt gleich.'); }
    if (was === 'weg' && phase <= 2 && vorrat() >= nb()) { if (b > 0) blau -= nb(); else rot -= nb(); weg = nb(); phase = 3; bewertung = null; zeichne(); g.sprich(`${nb()} ${b > 0 ? 'blaue' : 'rote'} weggenommen.`); }
    if (was === 'aufloesen' && phase === 3 && !aufgeloest) aufloesen();
  });

  async function aufloesen() {
    aufgeloest = true;
    if (Math.min(blau, rot) && bewegung()) { zeichne(); await warte(650); if (!aufgeloest || modus !== 'plaettchen') return; }
    const p = Math.min(blau, rot); blau -= p; rot -= p; fertigAufgeloest = true;
    zeichne(); fokus();
    g.sprich(p ? `${p} ${p === 1 ? 'Nullpaar hat' : 'Nullpaare haben'} sich aufgelöst.` : 'Es gibt keine Nullpaare.');
  }

  function start() { g.sprich(modus === 'plaettchen' ? 'Blau ist +1, Rot ist −1. Ein blaues und ein rotes zusammen sind null.' : 'Der Frosch zeigt dir, wie Plus und Minus mit negativen Zahlen funktionieren.'); }
  neu(); zeichne(); start();
}
