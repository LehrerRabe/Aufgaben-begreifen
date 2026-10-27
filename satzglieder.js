/* Deutsch: Satzglieder.
   1. Umstellprobe: Ein Wort antippen – sein ganzes Satzglied rückt an den Anfang, das Verb bleibt an Stelle 2.
      Wörter, die immer zusammen wandern, bilden ein Satzglied.
   2. Satzglieder bestimmen: Symbole zuordnen (mit Fragen).
   Symbole: Prädikat roter Kreis, Subjekt großer schwarzer Kreis, Akkusativobjekt kleiner schwarzer Kreis
   (nach verbreiteten Satzzerlegungs-Materialien). Dativobjekt und Adverbiale: eigene Wahl, leicht änderbar. */

import { geruest, mischen, warte, bewegung, ESC } from './geruest.js';

export const SATZGLIEDER = {
  P: { name: 'Prädikat', frage: 'Was tut jemand? Was geschieht?', farbe: '#e0262b', r: 22, art: 'voll' },
  S: { name: 'Subjekt', frage: 'Wer oder was?', farbe: '#1b1b1b', r: 22, art: 'voll' },
  AO: { name: 'Akkusativobjekt', frage: 'Wen oder was?', farbe: '#1b1b1b', r: 13, art: 'voll' },
  DO: { name: 'Dativobjekt', frage: 'Wem?', farbe: '#1b1b1b', r: 13, art: 'ring' },
  AD: { name: 'Adverbiale', frage: 'Wann? Wo? Wie? Warum?', farbe: '#f28a12', r: 15, art: 'voll' },
};

/* Satzglieder durch | getrennt, Rolle vor dem Doppelpunkt. Nomen und Namen großgeschrieben. */
const SAETZE = [
  'S:Lina|P:malt|AD:heute|AO:ein Bild',
  'S:der Hund|P:frisst|AO:einen Knochen',
  'S:die Kinder|P:spielen|AD:auf dem Hof',
  'S:mein Bruder|P:schenkt|DO:der Oma|AO:eine Blume',
  'S:Tom|P:liest|AD:abends|AO:ein spannendes Buch',
  'S:die Lehrerin|P:erklärt|DO:den Kindern|AO:die Aufgabe',
  'S:wir|P:fahren|AD:morgen|AD:an den See',
  'S:der kleine Vogel|P:singt|AD:im Garten',
  'S:Opa|P:repariert|AO:das alte Fahrrad',
  'S:die Katze|P:gehört|DO:meiner Schwester',
  'S:Paul|P:hilft|DO:seinem Freund|AD:nach der Schule',
  'S:das Mädchen|P:trinkt|AO:einen warmen Kakao',
];

const zerlege = s => s.split('|').map((t, i) => { const [rolle, text] = t.split(':'); return { i, rolle, woerter: text.split(' ') }; });

export function symbolSatzglied(rolle, gross = 1) {
  const g = SATZGLIEDER[rolle];
  const r = g.r * gross;
  const kreis = g.art === 'ring'
    ? `<circle cx="25" cy="25" r="${r}" fill="${g.farbe}"/><circle cx="25" cy="25" r="${r * 0.45}" fill="#fff"/>`
    : `<circle cx="25" cy="25" r="${r}" fill="${g.farbe}" stroke="#fff" stroke-width="2"/>`;
  return `<svg class="sg-symbol" viewBox="0 0 50 50" aria-hidden="true">${kreis}</svg>`;
}

export function starteSatzglieder(root) {
  let liste = mischen(SAETZE), idx = 0;
  let glieder, reihenfolge, gewandert, phase, auswahl, zuordnung, geprueft, beschaeftigt = false;

  const g = geruest(root, {
    etikett: 'Satzglieder', titel: '',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-sg="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-sg="neu">Nächster Satz ▶</button>`,
    breitRechts: true,
  });

  function neu() {
    glieder = zerlege(liste[idx % liste.length]);
    reihenfolge = glieder.map(x => x.i);
    gewandert = new Set(); phase = 1; auswahl = null; zuordnung = {}; geprueft = false;
  }

  const pIdx = () => glieder.find(x => x.rolle === 'P').i;
  const gross = w => w[0].toUpperCase() + w.slice(1);

  function satzHtml() {
    let wortNr = 0;
    return `<div class="sg-satz">${reihenfolge.map((gi, pos) => {
      const gl = glieder[gi];
      const sichtbar = phase === 2 || gewandert.has(gi) || gl.rolle === 'P';
      const woerter = gl.woerter.map((w, k) => {
        const text = pos === 0 && k === 0 ? gross(w) : w;
        return `<span class="sg-wort" data-wort="${gi}-${k}" data-nr="${wortNr++}">${ESC(text)}</span>`;
      }).join(' ');
      const z = zuordnung[gi];
      const falsch = geprueft && z && z !== gl.rolle;
      return `<button type="button" class="sg-glied${sichtbar ? ' rahmen' : ''}${gl.rolle === 'P' ? ' praedikat' : ''}${phase === 2 && z ? ' belegt' : ''}${falsch ? ' falsch' : ''}${geprueft && z === gl.rolle ? ' richtig' : ''}" data-glied="${gi}" data-key="g${gi}">
        <span class="sg-oben">${phase === 2 && z ? symbolSatzglied(z) : ''}</span>
        <span class="sg-woerter">${woerter}</span>
        ${phase === 1 && pos < 2 ? `<span class="sg-stelle">${pos === 0 ? 'Stelle 1' : 'Stelle 2'}</span>` : ''}
      </button>`;
    }).join('')}<span class="sg-punkt">.</span></div>`;
  }

  function links() {
    if (phase === 1) {
      return `<h2 class="bereich-titel">1. Umstellprobe</h2>${satzHtml()}
        <p class="leise">Tippe ein Wort an. Alles, was mit ihm zusammen nach vorne wandert, ist ein Satzglied.</p>
        <p class="sg-fortschritt">${gewandert.size} von ${glieder.length - 1} Satzgliedern umgestellt</p>`;
    }
    const fertig = geprueft && glieder.every(x => zuordnung[x.i] === x.rolle);
    return `<h2 class="bereich-titel">2. Satzglieder bestimmen</h2>${satzHtml()}
      <div class="sg-palette" role="group" aria-label="Symbole">${Object.entries(SATZGLIEDER).map(([k, v]) => `
        <button type="button" class="sg-wahl${auswahl === k ? ' gewaehlt' : ''}" data-rolle="${k}">${symbolSatzglied(k)}<b>${v.name}</b><small>${v.frage}</small></button>`).join('')}</div>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-sg="pruefen">✓ Prüfen</button></div>
      ${fertig ? satzbild() : ''}`;
  }

  /** Satzbild: Prädikat in der Mitte, die anderen Satzglieder hängen mit ihrer Frage daran. */
  function satzbild() {
    const andere = glieder.filter(x => x.rolle !== 'P');
    const w = 560, h = 230, cx = w / 2, cy = 70;
    let s = '';
    andere.forEach((x, i) => {
      const px = andere.length === 1 ? cx : 80 + i * ((w - 160) / (andere.length - 1)), py = 170;
      s += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py - 22}" class="sg-ast"/>
        <text x="${px}" y="${py + 48}" class="sg-frage">${SATZGLIEDER[x.rolle].frage.split('?')[0]}?</text>
        <g transform="translate(${px - 22} ${py - 44}) scale(.9)">${symbolSatzglied(x.rolle).replace('<svg class="sg-symbol" viewBox="0 0 50 50" aria-hidden="true">', '').replace('</svg>', '')}</g>
        <text x="${px}" y="${py + 30}" class="sg-text">${ESC(x.woerter.join(' '))}</text>`;
    });
    const p = glieder.find(x => x.rolle === 'P');
    s += `<circle cx="${cx}" cy="${cy}" r="26" fill="${SATZGLIEDER.P.farbe}" stroke="#fff" stroke-width="3"/><text x="${cx}" y="${cy - 36}" class="sg-text">${ESC(p.woerter.join(' '))}</text>`;
    return `<h3 class="eh-zwischen">Satzbild</h3><svg class="sg-bild" viewBox="0 0 ${w} ${h + 20}">${s}</svg>`;
  }

  function rechts() {
    return `<h2 class="bereich-titel">Merke</h2>
      <ul class="sg-merke">
        <li><b>Satzglieder</b> sind Wörter oder Wortgruppen, die man nur gemeinsam umstellen kann.</li>
        <li>Das <b>Prädikat</b> (gebeugtes Verb) steht im Aussagesatz immer an <b>Stelle 2</b>.</li>
      </ul>
      <div class="sg-legende">${Object.entries(SATZGLIEDER).map(([k, v]) => `<div>${symbolSatzglied(k)}<span><b>${v.name}</b><br><small>${v.frage}</small></span></div>`).join('')}</div>`;
  }

  function zeichne() {
    g.titel(phase === 1 ? 'Satzglieder finden' : 'Satzglieder bestimmen');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  /** Satzglied an Stelle 1 rücken; Wörter gleiten (FLIP). */
  async function umstellen(gi) {
    if (gi === pIdx()) { g.sprich('Das ist das Prädikat. Es bleibt immer an Stelle 2 – egal, was vorne steht.', 'tipp'); return; }
    beschaeftigt = true;
    const warVorne = reihenfolge[0] === gi;
    const alt = new Map([...root.querySelectorAll('.sg-glied')].map(e => [e.dataset.key, e.getBoundingClientRect()]));
    const p = pIdx();
    reihenfolge = [gi, p, ...glieder.map(x => x.i).filter(i => i !== gi && i !== p)];
    gewandert.add(gi);
    g.links.innerHTML = links();
    if (bewegung()) {
      const anims = [...root.querySelectorAll('.sg-glied')].map(e => {
        const a = alt.get(e.dataset.key), b = e.getBoundingClientRect();
        return a ? e.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)' }).finished.catch(() => {}) : null;
      });
      await Promise.all(anims);
    }
    const gl = glieder[gi];
    if (warVorne) g.sprich(`„${gl.woerter.join(' ')}“ steht schon an Stelle 1 – ${gl.woerter.length > 1 ? `diese ${gl.woerter.length} Wörter bilden zusammen ein Satzglied` : 'ein Satzglied aus einem Wort'}. Tippe ein anderes Wort an.`);
    else g.sprich(gl.woerter.length > 1 ? `„${gl.woerter.join(' ')}“ ist zusammen gewandert – das ist ein Satzglied aus ${gl.woerter.length} Wörtern.` : `„${gl.woerter[0]}“ ist allein gewandert – ein Satzglied aus einem Wort.`);
    if (gewandert.size === glieder.length - 1) {
      await warte(900);
      phase = 2; reihenfolge = glieder.map(x => x.i); zeichne();
      g.sprich('Alle Satzglieder sind gefunden. Wähle unten ein Symbol und tippe dann das passende Satzglied an.', 'fertig');
    }
    beschaeftigt = false;
  }

  function pruefen() {
    geprueft = true;
    const offen = glieder.filter(x => !zuordnung[x.i]).length;
    const falsch = glieder.filter(x => zuordnung[x.i] && zuordnung[x.i] !== x.rolle);
    zeichne();
    if (!offen && !falsch.length) g.sprich('Alles richtig bestimmt! Unten siehst du das Satzbild.', 'fertig');
    else if (falsch.length) {
      const f = falsch[0];
      g.sprich(`„${f.woerter.join(' ')}“: Stell die Frage. ${f.rolle === 'P' ? '' : `Passt „${SATZGLIEDER[zuordnung[f.i]].frage}“?`}`, 'tipp');
    } else g.sprich(`Es ${offen === 1 ? 'fehlt noch 1 Symbol' : `fehlen noch ${offen} Symbole`}.`, 'tipp');
  }

  function tipp() {
    if (phase === 1) {
      const rest = glieder.find(x => x.rolle !== 'P' && !gewandert.has(x.i));
      g.sprich(rest ? `Tippe einmal auf „${rest.woerter[rest.woerter.length - 1]}“.` : 'Alles umgestellt.', 'tipp');
      return;
    }
    const p = glieder.find(x => x.rolle === 'P');
    const s = glieder.find(x => x.rolle === 'S');
    if (!zuordnung[p.i]) g.sprich(`Beginne mit dem Prädikat: Was tut jemand? → „${p.woerter.join(' ')}“.`, 'tipp');
    else if (!zuordnung[s.i]) g.sprich(`Frage nach dem Subjekt: Wer oder was ${p.woerter.join(' ')}?`, 'tipp');
    else {
      const o = glieder.find(x => !zuordnung[x.i] || zuordnung[x.i] !== x.rolle);
      if (!o) { g.sprich('Prüfe jetzt.', 'tipp'); return; }
      const fr = { AO: `Wen oder was ${p.woerter.join(' ')} ${s.woerter.join(' ')}?`, DO: `Wem ${p.woerter.join(' ')} ${s.woerter.join(' ')} …?`, AD: 'Frage: Wann? Wo? Wie? Warum?', S: 'Wer oder was?', P: 'Was tut jemand?' }[o.rolle];
      g.sprich(`„${o.woerter.join(' ')}“ – passt die Frage: ${fr}`, 'tipp');
    }
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const r = e.target.closest('[data-rolle]');
    if (r) { auswahl = r.dataset.rolle; g.links.innerHTML = links(); return; }
    const gl = e.target.closest('[data-glied]');
    if (gl) {
      const gi = Number(gl.dataset.glied);
      if (phase === 1) umstellen(gi);
      else if (auswahl) { zuordnung[gi] = zuordnung[gi] === auswahl ? undefined : auswahl; geprueft = false; g.links.innerHTML = links(); }
      else g.sprich('Wähle zuerst unten ein Symbol.', 'tipp');
      return;
    }
    const b = e.target.closest('[data-sg]');
    if (!b) return;
    if (b.dataset.sg === 'neu') { idx++; neu(); zeichne(); startText(); }
    if (b.dataset.sg === 'pruefen') pruefen();
    if (b.dataset.sg === 'tipp') tipp();
  });

  function startText() { g.sprich('Tippe ein Wort an – sein Satzglied rückt an den Anfang. So findest du heraus, welche Wörter zusammengehören.'); }

  neu(); zeichne(); startText();
}
