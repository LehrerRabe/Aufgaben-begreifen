/* Deutsch: Wortfelder auf einem Regler (Klasse 5).
   Wörter mit ähnlicher Bedeutung liegen auf einer Skala: flüstern – murmeln – sagen – rufen – schreien,
   eiskalt – kalt – kühl – lauwarm – warm – heiß usw. Jede Stufe hat ein kleines Bild (Schallwellen, Thermometerfarbe …).
   „Ordnen“: Wortkarten antippen und auf die passende Stelle des Reglers legen.
   „Regler einstellen“: Im Satz fehlt ein Wort. Den Regler so weit schieben, bis das passende Wort in der Lücke steht.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, antwortHtml, flip, ESC } from './geruest.js';

const FELDER = {
  laut: { titel: 'Wie laut spricht jemand?', links: 'leise', rechts: 'laut', woerter: ['flüstern', 'murmeln', 'sagen', 'rufen', 'schreien'], farben: ['#c9d8ff', '#1f5fd1'], bild: 'wellen' },
  temp: { titel: 'Wie warm ist es?', links: 'kalt', rechts: 'heiß', woerter: ['eiskalt', 'kalt', 'kühl', 'lauwarm', 'warm', 'heiß'], farben: ['#2f8fe0', '#e0262b'], bild: 'thermo' },
  tempo: { titel: 'Wie schnell geht jemand?', links: 'langsam', rechts: 'schnell', woerter: ['schlendern', 'gehen', 'eilen', 'rennen'], farben: ['#bfe8cf', '#1d8a4c'], bild: 'tempo' },
  groesse: { titel: 'Wie groß ist etwas?', links: 'klein', rechts: 'groß', woerter: ['winzig', 'klein', 'groß', 'riesig'], farben: ['#ffe2a6', '#c77d00'], bild: 'kreis' },
  geraeusch: { titel: 'Wie laut ist ein Geräusch?', links: 'nichts zu hören', rechts: 'sehr laut', woerter: ['still', 'leise', 'laut', 'ohrenbetäubend'], farben: ['#e4dcff', '#6b3fd6'], bild: 'wellen' },
  licht: { titel: 'Wie hell ist es?', links: 'dunkel', rechts: 'hell', woerter: ['finster', 'dunkel', 'hell', 'grell'], farben: ['#1b2340', '#ffd34d'], bild: 'sonne' },
};

/* [Feld, Index, Satz mit ___, eingesetzte Form] */
const SAETZE = [
  ['laut', 0, 'In der Bibliothek ___ Mia ihrer Freundin etwas ins Ohr.', 'flüstert'],
  ['laut', 4, 'Bei dem Unfall ___ der Mann um Hilfe.', 'schreit'],
  ['laut', 3, 'Auf dem Sportplatz ___ die Trainerin: „Schneller!“', 'ruft'],
  ['laut', 2, 'Die Lehrerin ___: „Schlagt bitte das Buch auf.“', 'sagt'],
  ['laut', 1, 'Opa liest Zeitung und ___ etwas vor sich hin.', 'murmelt'],
  ['temp', 5, 'Die Suppe ist ___ – ich verbrenne mir die Zunge.', 'heiß'],
  ['temp', 0, 'Im Winter ist das Wasser im See ___.', 'eiskalt'],
  ['temp', 3, 'Das Badewasser ist nur noch ___. Mir wird kalt.', 'lauwarm'],
  ['temp', 2, 'Am Abend wird es draußen ___. Zieh eine dünne Jacke an.', 'kühl'],
  ['tempo', 0, 'Wir haben viel Zeit und ___ gemütlich durch den Park.', 'schlendern'],
  ['tempo', 3, 'Der Bus fährt gleich ab! Tim ___ zur Haltestelle.', 'rennt'],
  ['tempo', 2, 'Mama ist spät dran und ___ zur Arbeit.', 'eilt'],
  ['groesse', 0, 'Eine Ameise ist ___.', 'winzig'],
  ['groesse', 3, 'Ein Blauwal ist ___.', 'riesig'],
  ['geraeusch', 3, 'Der Presslufthammer ist ___. Ich halte mir die Ohren zu.', 'ohrenbetäubend'],
  ['geraeusch', 0, 'Nachts im Wald ist es ganz ___. Man hört nichts.', 'still'],
  ['licht', 0, 'Im Keller ohne Lampe ist es ___. Ich sehe gar nichts.', 'finster'],
  ['licht', 3, 'Die Sonne blendet. Das Licht ist ___.', 'grell'],
];

function mische(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
}

/* Kleines Bild für Stufe i von n */
function stufenBild(f, i, n) {
  const t = n > 1 ? i / (n - 1) : 1, c = mische(f.farben[0], f.farben[1], t);
  let s = '';
  if (f.bild === 'wellen') {
    s = `<path d="M6 16 h6 l8 -7 v22 l-8 -7 h-6z" fill="${c}"/>`;
    for (let k = 0; k < i; k++) s += `<path d="M${25 + k * 6} ${11 - k * 1.5} q${5 + k} ${9 + k * 1.5} 0 ${18 + k * 3}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`;
  } else if (f.bild === 'thermo') {
    const h = 6 + t * 20;
    s = `<rect x="17" y="3" width="10" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="33" r="6.5" fill="${c}"/><rect x="19.5" y="${31 - h}" width="5" height="${h}" rx="2.5" fill="${c}"/>`;
  } else if (f.bild === 'tempo') {
    s = `<circle cx="30" cy="9" r="4.5" fill="${c}"/><path d="M30 14 l-3 11 l-6 8 M27 25 l6 8 M29 17 l-7 4 M29 17 l7 3" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    for (let k = 0; k <= i; k++) s += `<line x1="${2 + k * 2}" y1="${14 + k * 5}" x2="${14}" y2="${14 + k * 5}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
  } else if (f.bild === 'kreis') {
    s = `<circle cx="22" cy="20" r="${3 + t * 15}" fill="${c}"/>`;
  } else {
    s = `<circle cx="22" cy="20" r="8" fill="${c}"/>`;
    if (t > 0.3) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r1 = 11, r2 = 11 + t * 7; s += `<line x1="${22 + Math.cos(a) * r1}" y1="${20 + Math.sin(a) * r1}" x2="${22 + Math.cos(a) * r2}" y2="${20 + Math.sin(a) * r2}" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`; }
  }
  return `<svg viewBox="0 0 44 40" aria-hidden="true">${s}</svg>`;
}

const STIL = `
.rg-regler { position: relative; margin: 1rem 0 .4rem; padding: 0 .2rem; }
.rg-bahn { height: 14px; border-radius: 7px; margin: 0 1.2rem; background: linear-gradient(90deg, var(--a), var(--b)); }
.rg-enden { display: flex; justify-content: space-between; font: 700 .95rem var(--schrift); color: var(--leise); margin: .3rem .4rem 0; }
.rg-plaetze { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: .35rem; margin-bottom: .6rem; }
.rg-platz { display: flex; flex-direction: column; align-items: center; gap: .3rem; border: 3px dashed var(--rand); border-radius: 14px; padding: .4rem .2rem; min-height: 7.2rem;
  background: var(--flaeche); cursor: pointer; font: inherit; color: var(--text); }
.rg-platz svg { width: 2.8rem; height: auto; color: var(--leise); }
.rg-platz.an { border-color: var(--akzent); border-style: solid; }
.rg-platz.falsch { border-color: var(--schlecht); border-style: solid; animation: wackeln .35s; }
.rg-platz.voll { border-style: solid; border-color: var(--gut); background: var(--gut-sanft); cursor: default; }
.rg-wort { font: 800 1.05rem/1.15 var(--schrift); word-break: break-word; text-align: center; }
.rg-karten { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; min-height: 3.4rem; margin-top: .8rem; }
.rg-karte { font: 800 1.2rem var(--schrift); padding: .5rem .85rem; border-radius: 12px; border: 3px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; box-shadow: 0 3px 0 var(--rand); }
.rg-karte.gewaehlt { border-color: var(--akzent); transform: translateY(-3px); }
.rg-satz { font: 700 1.4rem/1.6 var(--schrift); background: var(--flaeche); border: 2px solid var(--rand); border-radius: 14px; padding: .8rem 1rem; margin-bottom: 1rem; }
.rg-luecke { display: inline-block; min-width: 6rem; border-bottom: 3px solid var(--akzent); color: var(--akzent); text-align: center; font-weight: 900; padding: 0 .3rem; }
.rg-luecke.richtig { color: var(--gut); border-color: var(--gut); }
.rg-schieber { width: 100%; height: 3rem; accent-color: var(--akzent); }
.rg-skala { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); text-align: center; font: 700 .95rem var(--schrift); color: var(--leise); }
.rg-skala span.an { color: var(--akzent); font-weight: 900; }
.rg-skala svg { width: 2.2rem; display: block; margin: 0 auto .2rem; }
`;

export function starteWortfeld(root) {
  if (!document.getElementById('rg-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="rg-stil">${STIL}</style>`);
  let modus = 'ordnen', fListe = mischen(Object.keys(FELDER)), fi = 0, sListe = mischen(SAETZE), si = 0;
  let f, karten, gelegt, gewaehlt, falschPlatz, s, wert, bewertung;

  const g = geruest(root, {
    etikett: 'Wortschatz', titel: '',
    reiter: [{ id: 'ordnen', titel: 'Ordnen', unter: 'Wörter auf den Regler' }, { id: 'regler', titel: 'Regler einstellen', unter: 'Das passende Wort' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-wf="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-wf="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    bewertung = null; gewaehlt = null; falschPlatz = null;
    if (modus === 'ordnen') {
      f = FELDER[fListe[fi++ % fListe.length]];
      karten = mischen(f.woerter.map((_, i) => i));
      gelegt = f.woerter.map(() => false);
    } else {
      s = sListe[si++ % sListe.length]; f = FELDER[s[0]];
      wert = Math.floor((f.woerter.length - 1) / 2);
      if (wert === s[1]) wert = s[1] === 0 ? 1 : 0;
    }
  }

  function regler() {
    return `<div class="rg-regler" style="--a:${f.farben[0]};--b:${f.farben[1]}"><div class="rg-bahn"></div>
      <div class="rg-enden"><span>◀ ${ESC(f.links)}</span><span>${ESC(f.rechts)} ▶</span></div></div>`;
  }

  function links() {
    const n = f.woerter.length;
    if (modus === 'ordnen') {
      const plaetze = f.woerter.map((w, i) => {
        const kl = gelegt[i] ? ' voll' : (falschPlatz === i ? ' falsch' : gewaehlt !== null ? ' an' : '');
        return `<button type="button" class="rg-platz${kl}" data-platz="${i}">${stufenBild(f, i, n)}${gelegt[i] ? `<span class="rg-wort" data-id="k${i}">${ESC(w)}</span>` : ''}</button>`;
      }).join('');
      const rest = karten.filter(i => !gelegt[i]);
      return `<h3 class="eh-zwischen">${ESC(f.titel)}</h3>${regler()}<div class="rg-plaetze" style="--n:${n}">${plaetze}</div>
        <div class="rg-karten">${rest.map(i => `<button type="button" class="rg-karte${gewaehlt === i ? ' gewaehlt' : ''}" data-karte="${i}" data-id="k${i}">${ESC(f.woerter[i])}</button>`).join('')}</div>`;
    }
    const fertig = bewertung?.ok;
    const satz = ESC(s[2]).replace('___', `<span class="rg-luecke${fertig ? ' richtig' : ''}">${ESC(fertig ? s[3] : f.woerter[wert])}</span>`);
    return `<p class="rg-satz">${satz}</p>
      <h3 class="eh-zwischen">${ESC(f.titel)}</h3>${regler()}
      <input type="range" class="rg-schieber" min="0" max="${n - 1}" step="1" value="${wert}" aria-label="Regler" ${fertig ? 'disabled' : ''}>
      <div class="rg-skala" style="--n:${n}">${f.woerter.map((w, i) => `<span class="${i === wert ? 'an' : ''}">${stufenBild(f, i, n)}${ESC(w)}</span>`).join('')}</div>`;
  }

  function rechts() {
    let h = '<h2 class="bereich-titel">Wortfeld</h2><p>Diese Wörter bedeuten <b>ähnlich</b> viel, aber nicht genau dasselbe. Auf dem Regler siehst du, wie stark jedes Wort ist.</p>';
    if (modus === 'ordnen') {
      h += '<p class="leise">Tippe eine Wortkarte an und dann die Stelle auf dem Regler.</p>';
      if (!gelegt.includes(false)) h += `<p class="tb-antwort gut">Geordnet: ${f.woerter.map(ESC).join(' – ')}</p>`;
      else if (bewertung) h += antwortHtml(bewertung);
    } else {
      h += `<p class="leise">Schiebe den Regler, bis das passende Wort in der Lücke steht.</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-wf="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    }
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'ordnen' ? 'Wortfelder ordnen' : 'Den Regler einstellen');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  root.addEventListener('input', e => {
    if (!e.target.matches('.rg-schieber')) return;
    wert = Number(e.target.value); bewertung = null;
    const l = root.querySelector('.rg-luecke'); if (l) l.textContent = f.woerter[wert];
    root.querySelectorAll('.rg-skala span').forEach((x, i) => x.classList.toggle('an', i === wert));
    const a = root.querySelector('.tb-antwort'); if (a) a.remove();
  });

  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const k = e.target.closest('[data-karte]');
    if (k) { const i = Number(k.dataset.karte); gewaehlt = gewaehlt === i ? null : i; falschPlatz = null; bewertung = null; zeichne(); return; }
    const p = e.target.closest('[data-platz]');
    if (p && modus === 'ordnen') {
      const i = Number(p.dataset.platz);
      if (gelegt[i]) return;
      if (gewaehlt === null) { g.sprich('Tippe zuerst eine Wortkarte an.', 'tipp'); return; }
      if (gewaehlt === i) {
        gelegt[i] = true; gewaehlt = null; falschPlatz = null; bewertung = null;
        await flip(root, zeichne, 450);
        if (!gelegt.includes(false)) g.sprich('Alle Wörter liegen richtig auf dem Regler!', 'fertig');
      } else {
        falschPlatz = i;
        bewertung = { ok: false, text: `„${ESC(f.woerter[gewaehlt])}“ ist ${gewaehlt < i ? `schwächer – weiter nach links (${ESC(f.links)})` : `stärker – weiter nach rechts (${ESC(f.rechts)})`}.` };
        zeichne();
      }
      return;
    }
    const b = e.target.closest('[data-wf]');
    if (!b) return;
    if (b.dataset.wf === 'pruefen') {
      if (wert === s[1]) { bewertung = { ok: true, text: `Richtig: ${ESC(s[2].replace('___', s[3]))}` }; g.sprich('Der Regler steht genau richtig.', 'fertig'); }
      else bewertung = { ok: false, text: wert < s[1] ? 'Das ist noch zu schwach. Schiebe weiter nach rechts.' : 'Das ist zu stark. Schiebe weiter nach links.' };
      zeichne();
    }
    if (b.dataset.wf === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.wf === 'tipp') g.sprich(modus === 'ordnen' ? `Suche zuerst die beiden Enden: Welches Wort ist am schwächsten (${f.links}), welches am stärksten (${f.rechts})?` : 'Stell dir die Situation vor. Wie stark muss das Wort sein?', 'tipp');
  });

  function start() { g.sprich(modus === 'ordnen' ? `${f.titel} Ordne die Wörter von „${f.links}“ bis „${f.rechts}“.` : 'Welches Wort passt in die Lücke? Schiebe den Regler.'); }

  neu(); zeichne(); start();
}
