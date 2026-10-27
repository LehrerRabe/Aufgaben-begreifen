/* Mathematik: Uhr und Zeitspannen.
   Uhr stellen: Minutenzeiger ziehen (oder Knöpfe) – der Stundenzeiger läuft mit.
   Uhr lesen: Uhrzeit ablesen.
   Zeitspannen: Am Zeitstrahl von der Startzeit bis zur Endzeit springen (erst zur vollen Stunde). */

import { geruest, zufall, wahl, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';

const zz = n => String(n).padStart(2, '0');
const zeit = m => `${Math.floor(m / 60) % 24}:${zz(m % 60)}`;
const dauer = m => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);
const SPRUENGE = [5, 10, 15, 30, 60];

function uhrSvg(min, ziehbar = false) {
  const h = (min / 60) % 12, m = min % 60;
  let s = '';
  for (let i = 0; i < 60; i++) {
    const w = (i / 60) * 2 * Math.PI, gross = i % 5 === 0;
    s += `<line x1="${100 + Math.sin(w) * (gross ? 78 : 83)}" y1="${100 - Math.cos(w) * (gross ? 78 : 83)}" x2="${100 + Math.sin(w) * 88}" y2="${100 - Math.cos(w) * 88}" class="${gross ? 'uh-strich-g' : 'uh-strich'}"/>`;
  }
  for (let i = 1; i <= 12; i++) { const w = (i / 12) * 2 * Math.PI; s += `<text x="${100 + Math.sin(w) * 64}" y="${106 - Math.cos(w) * 64}" class="uh-zahl">${i}</text>`; }
  for (let i = 0; i < 12; i++) { const w = (i / 12) * 2 * Math.PI; s += `<text x="${100 + Math.sin(w) * 97}" y="${103 - Math.cos(w) * 97}" class="uh-min">${zz(i * 5)}</text>`; }
  return `<svg class="uh-svg" viewBox="-12 -12 224 224" style="touch-action:none">
    <circle cx="100" cy="100" r="92" class="uh-rand"/>${s}
    <line x1="100" y1="100" x2="100" y2="52" class="uh-stunde" style="transform: rotate(${h * 30}deg)"/>
    <line x1="100" y1="100" x2="100" y2="22" class="uh-minute${ziehbar ? ' ziehbar' : ''}" style="transform: rotate(${m * 6}deg)" ${ziehbar ? 'data-zeiger' : ''}/>
    ${ziehbar ? `<circle cx="${100 + Math.sin(m / 60 * 2 * Math.PI) * 74}" cy="${100 - Math.cos(m / 60 * 2 * Math.PI) * 74}" r="11" class="uh-griff" data-zeiger/>` : ''}
    <circle cx="100" cy="100" r="5" class="uh-mitte"/></svg>`;
}

export function starteUhr(root) {
  let modus = 'stellen';
  let ziel, ist, eing = {}, bewertung = null, ziehen = false;
  let start, ende, spruenge;

  const g = geruest(root, {
    etikett: 'Uhr und Zeit', titel: '',
    reiter: [{ id: 'stellen', titel: 'Uhr stellen' }, { id: 'lesen', titel: 'Uhr lesen' }, { id: 'spanne', titel: 'Zeitspannen', unter: 'am Zeitstrahl' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-uh="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-uh="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; ['uh-h', 'uh-m', 'uh-dh', 'uh-dm'].forEach(k => (eing[k] = ''));
    if (modus === 'stellen') { ziel = zufall(1, 12) * 60 + zufall(0, 11) * 5; ist = 12 * 60; }
    if (modus === 'lesen') ist = zufall(1, 12) * 60 + zufall(0, 59);
    if (modus === 'spanne') {
      start = zufall(7, 16) * 60 + wahl([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
      ende = start + zufall(2, 15) * 5 + zufall(0, 2) * 60 + 20;
      if (ende % 60 === 0) ende += 5;
      spruenge = [];
    }
  }

  const stand = () => start + spruenge.reduce((a, b) => a + b, 0);

  function zeitstrahl() {
    const h0 = Math.floor(start / 60), h1 = Math.ceil(ende / 60);
    const W = 640, x0 = 30, x1 = W - 30;
    const X = m => x0 + ((m - h0 * 60) / ((h1 - h0) * 60)) * (x1 - x0);
    let s = `<line x1="${x0 - 10}" y1="120" x2="${x1 + 10}" y2="120" class="ss-linie"/>`;
    for (let m = h0 * 60; m <= h1 * 60; m += 15) {
      const voll = m % 60 === 0;
      s += `<line x1="${X(m)}" y1="${voll ? 106 : 113}" x2="${X(m)}" y2="${voll ? 134 : 127}" class="ss-strich"/>`;
      if (voll) s += `<text x="${X(m)}" y="152" class="ss-zahl">${m / 60}:00</text>`;
    }
    s += `<circle cx="${X(start)}" cy="120" r="7" class="uh-start"/><text x="${X(start)}" y="96" class="ss-zahl start">${zeit(start)}</text>
      <circle cx="${X(ende)}" cy="120" r="7" class="uh-ende"/><text x="${X(ende)}" y="96" class="ss-zahl rot">${zeit(ende)}</text>`;
    let pos = start;
    spruenge.forEach((sp, i) => {
      const m = (X(pos) + X(pos + sp)) / 2, hh = Math.min(60, 14 + (X(pos + sp) - X(pos)) * 0.35);
      s += `<path d="M${X(pos)} 118 Q${m} ${118 - hh * 2} ${X(pos + sp)} 118" class="ss-bogen${i === spruenge.length - 1 ? ' neu' : ''}"/><text x="${m}" y="${118 - hh - 6}" class="ss-plus">+${dauer(sp)}</text>`;
      pos += sp;
    });
    return `<svg class="ss-svg" viewBox="0 0 ${W} 165">${s}<circle cx="${X(pos)}" cy="120" r="6" class="us-jetzt"/></svg>`;
  }

  function links() {
    if (modus === 'stellen') {
      return `<div class="uh-buehne">${uhrSvg(ist, true)}</div>
        <div class="fl-knoepfe">
          <button type="button" class="kn-gross" data-dreh="-60">− 1 h</button><button type="button" class="kn-gross" data-dreh="-5">− 5 min</button>
          <button type="button" class="kn-gross" data-dreh="5">+ 5 min</button><button type="button" class="kn-gross" data-dreh="60">+ 1 h</button>
        </div>
        <p class="leise">Ziehe den langen Zeiger. Der kurze Stundenzeiger läuft langsam mit – wie bei einer echten Uhr.</p>`;
    }
    if (modus === 'lesen') return `<div class="uh-buehne">${uhrSvg(ist)}</div>`;
    return `${zeitstrahl()}
      <p>Du bist bei <b>${zeit(stand())}</b>. Springe weiter:</p>
      <div class="us-spruenge">${SPRUENGE.map(s => `<button type="button" class="kn-gross" data-sprung="${s}" ${stand() + s > ende ? 'disabled' : ''}>+${dauer(s)}</button>`).join('')}
        <button type="button" class="kn-gross kn-leise" data-uh="zurueck" ${spruenge.length ? '' : 'disabled'}>↶</button></div>`;
  }

  function rechts() {
    if (modus === 'stellen') {
      return `<h2 class="bereich-titel">Stelle die Uhr auf</h2><p class="rr-gross">${zeit(ziel)} Uhr</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-uh="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Der lange Zeiger zeigt die Minuten (außen), der kurze die Stunden.</p>`;
    }
    if (modus === 'lesen') {
      return `<h2 class="bereich-titel">Wie spät ist es?</h2>
        <p class="ut-frage">${zahlFeld('uh-h', eing['uh-h'], 2, 'Stunden')} : ${zahlFeld('uh-m', eing['uh-m'], 2, 'Minuten')} Uhr</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-uh="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        <p class="leise">Erst den kurzen Zeiger lesen (Stunde), dann den langen (Minuten).</p>`;
    }
    const fertig = stand() === ende;
    return `<h2 class="bereich-titel">Wie lange dauert es?</h2>
      <p>Von <b>${zeit(start)}</b> bis <b>${zeit(ende)}</b> Uhr.</p>
      ${fertig ? `<p class="fl-formel">${spruenge.map(s => '+' + dauer(s)).join(' ')}</p>` : '<p class="leise">Springe erst bis zur vollen Stunde.</p>'}
      <p class="ut-frage">${zahlFeld('uh-dh', eing['uh-dh'], 2, 'Stunden')} h ${zahlFeld('uh-dm', eing['uh-dm'], 2, 'Minuten')} min</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-uh="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel({ stellen: 'Uhr stellen', lesen: 'Uhr lesen', spanne: 'Zeitspannen' }[modus]);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  function setzeIst(m) { ist = ((m % 720) + 720) % 720 || 720; bewertung = null; g.links.innerHTML = links(); }

  /* Minutenzeiger ziehen: über 12 hinweg zählt die Stunde weiter */
  root.addEventListener('pointerdown', e => { if (e.target.closest('[data-zeiger]')) { ziehen = true; e.preventDefault(); } });
  window.addEventListener('pointerup', () => { ziehen = false; });
  root.addEventListener('pointermove', e => {
    if (!ziehen || modus !== 'stellen') return;
    const svg = root.querySelector('.uh-svg'); if (!svg) return;
    const r = svg.getBoundingClientRect();
    const w = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)));
    let neuM = Math.round(((w / (2 * Math.PI)) * 60 + 60) % 60 / 5) * 5 % 60;
    const altM = ist % 60;
    let h = Math.floor(ist / 60);
    if (altM >= 45 && neuM <= 15) h++;
    if (altM <= 15 && neuM >= 45) h--;
    if (neuM !== altM || h !== Math.floor(ist / 60)) setzeIst(h * 60 + neuM);
  });

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start_(); return; }
    const d = e.target.closest('[data-dreh]');
    if (d) { setzeIst(ist + Number(d.dataset.dreh)); return; }
    const sp = e.target.closest('[data-sprung]');
    if (sp) { const s = Number(sp.dataset.sprung); if (stand() + s <= ende) { spruenge.push(s); zeichne(); if (stand() === ende) g.sprich('Angekommen! Zähle die Sprünge zusammen.', 'fertig'); } return; }
    const b = e.target.closest('[data-uh]');
    if (!b) return;
    const was = b.dataset.uh;
    if (was === 'neu') { neu(); zeichne(); start_(); }
    if (was === 'zurueck') { spruenge.pop(); zeichne(); }
    if (was === 'pruefen') {
      if (modus === 'stellen') {
        const ok = ist % 720 === ziel % 720;
        bewertung = ok ? { ok, text: `Richtig: ${zeit(ziel)} Uhr` } : { ok, text: ist % 60 !== ziel % 60 ? 'Der lange Zeiger (Minuten) steht noch nicht richtig.' : 'Die Minuten stimmen – jetzt noch die Stunde.' };
      }
      if (modus === 'lesen') {
        const h = Number(eing['uh-h']), m = Number(eing['uh-m']);
        const ok = h % 12 === Math.floor(ist / 60) % 12 && m === ist % 60 && eing['uh-h'] !== '' && eing['uh-m'] !== '';
        bewertung = ok ? { ok, text: `Richtig: ${zeit(ist)} Uhr${Math.floor(ist / 60) < 12 ? ` (oder ${zeit(ist + 720)} Uhr)` : ''}` } : { ok, text: 'Noch nicht. Achtung: Der kurze Zeiger steht kurz vor der vollen Stunde noch bei der alten Stunde.' };
      }
      if (modus === 'spanne') {
        const d_ = ende - start, ok = Number(eing['uh-dh'] || 0) * 60 + Number(eing['uh-dm'] || 0) === d_ && (eing['uh-dh'] || eing['uh-dm']);
        bewertung = ok ? { ok: true, text: `Richtig: ${dauer(d_)}` } : { ok: false, text: 'Noch nicht. Springe bis zur Endzeit und zähle Stunden und Minuten zusammen.' };
      }
      if (bewertung.ok) g.sprich('Super!', 'fertig');
      g.rechts.innerHTML = rechts();
    }
    if (was === 'tipp') {
      if (modus === 'spanne') { const s = stand(); g.sprich(s % 60 ? `Bis zur vollen Stunde fehlen ${60 - (s % 60)} Minuten.` : 'Jetzt ganze Stunden springen, dann die restlichen Minuten.', 'tipp'); }
      else g.sprich('Der lange Zeiger zeigt die Minuten: Bei der 1 sind es 5, bei der 2 sind es 10 … Der kurze Zeiger zeigt die Stunde.', 'tipp');
    }
  });

  function start_() { g.sprich({ stellen: 'Stelle die Uhr: Ziehe den langen Zeiger.', lesen: 'Lies die Uhrzeit ab.', spanne: 'Wie lange dauert es? Springe am Zeitstrahl von der Start- zur Endzeit.' }[modus]); }
  neu(); zeichne(); start_();
}
