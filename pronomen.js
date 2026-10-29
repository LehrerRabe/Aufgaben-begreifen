/* Deutsch: Pronomen als Masken (Klasse 5).
   Ein Pronomen ist wie eine Maske: Dahinter steckt ein Nomen.
   „Wer steckt dahinter?“: Maske (Pronomen) antippen, dann das Nomen, für das sie steht. Die Maske bekommt die Farbe des Nomens.
     Manchmal ist nicht klar, wer gemeint ist – dann „Unklar!“ wählen. So entdeckt man unklare Bezüge in eigenen Texten.
   „Maske aufsetzen“: Ein Nomen wiederholt sich. Die passende Maske (Pronomen) auswählen.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, ESC } from './geruest.js';

/* [Wort|id] = Nomen, {Wort|id} = Pronomen (id ? = unklar) */
const TEXTE = [
  '[Lea|lea] hat einen [Hund|hund]. {Sie|lea} geht jeden Tag mit {ihm|hund} spazieren.',
  '[Tom|tom] sucht seinen [Ball|ball]. Endlich findet {er|tom} {ihn|ball} unter dem Sofa.',
  'Die [Kinder|kinder] füttern die [Ziege|ziege]. {Sie|ziege} frisst {ihnen|kinder} aus der Hand.',
  '[Ben|ben] und [Paul|paul] spielen Schach. {Er|?} gewinnt.',
  '[Mia|mia] malt ein [Bild|bild]. {Es|bild} hängt jetzt an der Wand.',
  'Die [Lehrerin|lehrerin] lobt [Emil|emil]. {Er|emil} hat {ihr|lehrerin} ein tolles Referat gehalten.',
  '[Lina|lina] und [Sara|sara] gehen ins Kino. {Sie|?} hat ihr Geld vergessen.',
  'Das [Auto|auto] steht vor der [Garage|garage]. {Es|auto} ist rot, {sie|garage} ist grau.',
  '[Opa|opa] erzählt den [Kindern|kinder] eine Geschichte. {Sie|kinder} hören {ihm|opa} gespannt zu.',
  'Der [Vater|vater] und der [Sohn|sohn] waschen das Auto. Danach ist {er|?} ganz nass.',
];

/* [erster Satz, vor der Wiederholung, Wiederholung, danach, richtige Maske, Auswahl] */
const WIEDER = [
  ['Lea hat einen Hund.', '', 'Lea', 'geht jeden Tag mit ihm spazieren.', 'Sie', ['Sie', 'Er', 'Es']],
  ['Tom hat einen neuen Ball.', 'Jeden Nachmittag spielt Tom mit', 'dem Ball', '.', 'ihm', ['ihm', 'ihn', 'er']],
  ['Die Katze ist hungrig.', 'Mia gibt', 'der Katze', 'Futter.', 'ihr', ['ihr', 'sie', 'ihm']],
  ['Opa hat ein altes Fahrrad.', 'Er repariert', 'das Fahrrad', 'jeden Sommer.', 'es', ['es', 'ihn', 'sie']],
  ['Mein Bruder ist krank.', 'Ich besuche', 'meinen Bruder', 'im Krankenhaus.', 'ihn', ['ihn', 'ihm', 'er']],
  ['Die Kinder spielen draußen.', '', 'Die Kinder', 'haben viel Spaß.', 'Sie', ['Sie', 'Er', 'Es']],
  ['Paul hat eine kleine Schwester.', 'Er hilft', 'seiner Schwester', 'bei den Hausaufgaben.', 'ihr', ['ihr', 'sie', 'ihm']],
  ['Das Baby schläft.', '', 'Das Baby', 'ist sehr müde.', 'Es', ['Es', 'Er', 'Sie']],
  ['Die Lehrerin kommt herein.', 'Alle Kinder begrüßen', 'die Lehrerin', '.', 'sie', ['sie', 'ihr', 'er']],
];

const FARBEN = ['#1f5fd1', '#d7263d', '#2a9d5c', '#8e44c9', '#e07a12'];

const STIL = `
.mk-text { font: 600 1.45rem/2.6 var(--schrift); background: var(--flaeche); border: 2px solid var(--rand); border-radius: 14px; padding: .6rem 1rem; }
.mk-nomen { font: inherit; font-weight: 800; color: var(--text); background: none; border: 0; border-bottom: 4px solid var(--f); padding: 0 .1rem; cursor: pointer; border-radius: 4px; }
.mk-nomen.an { background: color-mix(in srgb, var(--f) 18%, transparent); }
.mk-maske { position: relative; display: inline-flex; align-items: center; gap: .25rem; font: inherit; font-weight: 800; color: var(--text); background: var(--flaeche-2);
  border: 3px solid var(--rand); border-radius: 1.2rem .5rem 1.2rem .5rem; padding: 0 .55rem; cursor: pointer; line-height: 1.6; vertical-align: baseline; }
.mk-maske svg { width: 1.5rem; height: auto; }
.mk-maske.gewaehlt { border-color: var(--akzent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--akzent) 30%, transparent); }
.mk-maske.zu { border-color: var(--f); background: color-mix(in srgb, var(--f) 16%, var(--flaeche)); cursor: default; }
.mk-maske.unklar { border-color: var(--warn); background: var(--warn-sanft); cursor: default; }
.mk-wer { position: absolute; left: 50%; top: 100%; transform: translate(-50%, -.35rem); font: 800 .78rem/1 var(--schrift); color: #fff; background: var(--f); border-radius: 6px; padding: .12rem .35rem; white-space: nowrap; }
.mk-maske.unklar .mk-wer { background: var(--warn); }
.mk-maske.falsch { animation: wackeln .35s; border-color: var(--schlecht); }
.mk-knopfzeile { display: flex; gap: .5rem; flex-wrap: wrap; margin: .8rem 0; }
.mk-satz { font: 600 1.45rem/1.8 var(--schrift); background: var(--flaeche); border: 2px solid var(--rand); border-radius: 14px; padding: .7rem 1rem; }
.mk-wdh { background: #ffe58a; color: #3a2c00; border-radius: 6px; padding: 0 .25rem; font-weight: 800; text-decoration: line-through 3px rgba(58,44,0,.45); }
.mk-wahl { display: flex; gap: .6rem; flex-wrap: wrap; margin: .6rem 0; }
.mk-wahl .kn-gross { font-size: 1.3rem; min-width: 5rem; justify-content: center; }
.mk-wahl .kn-gross.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); color: var(--schlecht); }
`;

const maskeSvg = f => `<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 6 Q20 -2 38 6 Q38 20 26 20 Q22 20 20 15 Q18 20 14 20 Q2 20 2 6Z" fill="${f}"/>
  <ellipse cx="12" cy="10" rx="5" ry="3.4" fill="#fff"/><ellipse cx="28" cy="10" rx="5" ry="3.4" fill="#fff"/></svg>`;

function zerlege(t) {
  const teile = [], nomen = [];
  const re = /\[([^|\]]+)\|([^\]]+)\]|\{([^|}]+)\|([^}]+)\}/g;
  let i = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > i) teile.push({ text: t.slice(i, m.index) });
    if (m[1]) { if (!nomen.includes(m[2])) nomen.push(m[2]); teile.push({ nomen: m[2], text: m[1] }); }
    else teile.push({ maske: m[4], text: m[3] });
    i = re.lastIndex;
  }
  if (i < t.length) teile.push({ text: t.slice(i) });
  return { teile, nomen };
}

export function startePronomen(root) {
  if (!document.getElementById('mk-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="mk-stil">${STIL}</style>`);
  let modus = 'dahinter', tListe = mischen(TEXTE), wListe = mischen(WIEDER), ti = 0, wi = 0;
  let tx, geloest, gewaehlt, falschIdx, meldung, w, falschW, wFertig;

  const g = geruest(root, {
    etikett: 'Wortarten', titel: '',
    reiter: [{ id: 'dahinter', titel: 'Wer steckt dahinter?', unter: 'Masken zuordnen' }, { id: 'aufsetzen', titel: 'Maske aufsetzen', unter: 'Wiederholungen ersetzen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-mk="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-mk="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    meldung = null; gewaehlt = null; falschIdx = null;
    if (modus === 'dahinter') { tx = zerlege(tListe[ti++ % tListe.length]); geloest = {}; }
    else { w = wListe[wi++ % wListe.length]; falschW = []; wFertig = false; }
  }

  const farbe = id => FARBEN[tx.nomen.indexOf(id) % FARBEN.length];
  const nameVon = id => tx.teile.find(t => t.nomen === id)?.text;
  const masken = () => tx.teile.map((t, i) => ({ t, i })).filter(x => x.t.maske);
  const alleGeloest = () => masken().every(x => geloest[x.i]);

  function linksDahinter() {
    const html = tx.teile.map((t, i) => {
      if (t.nomen) return `<button type="button" class="mk-nomen${gewaehlt !== null ? ' an' : ''}" data-nomen="${t.nomen}" style="--f:${farbe(t.nomen)}">${ESC(t.text)}</button>`;
      if (t.maske) {
        const z = geloest[i];
        if (z === '?') return `<span class="mk-maske unklar">${maskeSvg('#a35f00')}${ESC(t.text)}<span class="mk-wer">unklar!</span></span>`;
        if (z) return `<span class="mk-maske zu" style="--f:${farbe(z)}">${maskeSvg(farbe(z))}${ESC(t.text)}<span class="mk-wer">${ESC(nameVon(z))}</span></span>`;
        return `<button type="button" class="mk-maske${gewaehlt === i ? ' gewaehlt' : ''}${falschIdx === i ? ' falsch' : ''}" data-maske="${i}">${maskeSvg('#8a94ad')}${ESC(t.text)}</button>`;
      }
      return ESC(t.text);
    }).join('');
    return `<p class="mk-text">${html}</p>
      <div class="mk-knopfzeile"><button type="button" class="kn-gross" data-mk="unklar" ${gewaehlt === null ? 'disabled' : ''}>🤔 Unklar, wer gemeint ist!</button></div>`;
  }

  function linksAufsetzen() {
    const ersatz = wFertig ? `<span class="mk-maske zu" style="--f:#2a9d5c">${maskeSvg('#2a9d5c')}${ESC(w[4])}<span class="mk-wer">${ESC(w[2])}</span></span>` : `<span class="mk-wdh">${ESC(w[2])}</span>`;
    const nach = w[3] === '.' ? '.' : ' ' + ESC(w[3]);
    return `<p class="mk-satz">${ESC(w[0])} ${w[1] ? ESC(w[1]) + ' ' : ''}${ersatz}${nach}</p>
      <h3 class="eh-zwischen">Welche Maske ersetzt „${ESC(w[2])}“?</h3>
      <div class="mk-wahl">${w[5].map(o => `<button type="button" class="kn-gross${falschW.includes(o) ? ' falsch' : ''}" data-ersatz="${ESC(o)}" ${wFertig ? 'disabled' : ''}>${ESC(o)}</button>`).join('')}</div>`;
  }

  function rechts() {
    let h = `<h2 class="bereich-titel">Pronomen sind Masken</h2>
      <p>Ein Pronomen (Fürwort) steht <b>für</b> ein Nomen. So musst du nicht immer dasselbe Wort wiederholen.</p>
      <p class="leise">Achtung: Wenn zwei Personen im Satz sind, weiß man manchmal nicht, wer hinter der Maske steckt. Dann schreib lieber den Namen.</p>`;
    if (modus === 'dahinter') {
      h += '<p class="leise">Tippe eine Maske an und dann das Nomen, das dahintersteckt.</p>';
      if (alleGeloest()) h += '<p class="tb-antwort gut">Alle Masken sind gelüftet!</p>';
      else if (meldung) h += `<p class="tb-antwort schlecht">${meldung}</p>`;
    } else {
      if (wFertig) h += `<p class="tb-antwort gut">Richtig: „${ESC(w[4])}“ steht für „${ESC(w[2])}“.</p>`;
      else if (falschW.length) h += '<p class="tb-antwort schlecht">Lies den Satz mit dieser Maske laut. Klingt er richtig? Ist das Nomen männlich, weiblich oder sächlich?</p>';
    }
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'dahinter' ? 'Pronomen: Wer steckt dahinter?' : 'Pronomen: Maske aufsetzen');
    g.links.innerHTML = modus === 'dahinter' ? linksDahinter() : linksAufsetzen();
    g.rechts.innerHTML = rechts();
  }

  function zuordnen(ziel) {
    const t = tx.teile[gewaehlt];
    if (t.maske === ziel) {
      geloest[gewaehlt] = ziel; gewaehlt = null; falschIdx = null; meldung = null;
      zeichne();
      if (alleGeloest()) g.sprich('Alle Masken sind gelüftet!', 'fertig');
      else if (ziel === '?') g.sprich('Genau – hier kann jeder von beiden gemeint sein. Das ist ein unklarer Bezug.');
    } else {
      falschIdx = gewaehlt;
      meldung = t.maske === '?' ? 'Bist du sicher? Lies noch einmal: Könnte auch jemand anderes gemeint sein?'
        : ziel === '?' ? 'Hier kann man es herausfinden. Achte darauf, ob das Pronomen zu einem männlichen, weiblichen, sächlichen Nomen oder zur Mehrzahl passt.'
          : 'Passt die Maske zu diesem Nomen? Achte auf männlich, weiblich, sächlich oder Mehrzahl – und auf den Sinn.';
      zeichne();
    }
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const m = e.target.closest('[data-maske]');
    if (m) { const i = Number(m.dataset.maske); gewaehlt = gewaehlt === i ? null : i; falschIdx = null; meldung = null; zeichne(); return; }
    const n = e.target.closest('[data-nomen]');
    if (n && modus === 'dahinter') { if (gewaehlt === null) { g.sprich('Tippe zuerst eine Maske an.', 'tipp'); return; } zuordnen(n.dataset.nomen); return; }
    const er = e.target.closest('[data-ersatz]');
    if (er && !wFertig) {
      if (er.dataset.ersatz === w[4]) { wFertig = true; zeichne(); g.sprich('Maske auf! Jetzt wiederholt sich das Nomen nicht mehr.', 'fertig'); }
      else { falschW.push(er.dataset.ersatz); zeichne(); }
      return;
    }
    const b = e.target.closest('[data-mk]');
    if (!b) return;
    if (b.dataset.mk === 'unklar' && gewaehlt !== null) zuordnen('?');
    if (b.dataset.mk === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.mk === 'tipp') g.sprich(modus === 'dahinter' ? 'er → männlich (der), sie → weiblich (die) oder Mehrzahl, es → sächlich (das). Achte auch darauf, was im Satz passiert.' : 'Frag nach dem Nomen: Wer? Wem? Wen? Dann passt die Maske: er/sie/es – ihm/ihr – ihn/sie/es.', 'tipp');
  });

  function start() { g.sprich(modus === 'dahinter' ? 'Hinter jeder Maske steckt ein Nomen. Finde heraus, wer es ist.' : 'Hier wiederholt sich ein Nomen. Setz ihm eine Maske auf!'); }

  neu(); zeichne(); start();
}
