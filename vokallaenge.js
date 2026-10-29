/* Deutsch: Lange und kurze Vokale mit dem Gummiband (Klasse 5/6).
   Langer Vokal: Das Gummiband wird gedehnt (Wiese, Fuß). Kurzer Vokal: Das Band schnappt zurück (Kiste, Fluss).
   1. Wort anhören (Sprachausgabe des Geräts, falls vorhanden) oder selbst sprechen, dann entscheiden: lang ziehen oder kurz schnappen.
   2. Dann die Schreibung wählen: „ie oder i?“ bzw. „ß oder ss?“.
   Zwielaute (ei, au, eu) zählen wie lange Vokale: heißen, draußen.
   Ergänzt das Silbenhaus (doppelte Mitlaute). Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, ESC } from './geruest.js';

/* ie / i: [davor, danach, lang?] */
const IE = [
  ['B', 'ne', true], ['K', 'ste', false], ['L', 'be', true], ['L', 'cht', false], ['Sp', 'l', true], ['St', 'ft', false],
  ['W', 'se', true], ['W', 'nd', false], ['fl', 'gen', true], ['F', 'sch', false], ['Br', 'f', true], ['b', 'tten', false],
  ['T', 'r', true], ['Z', 'mmer', false], ['Z', 'ge', true], ['S', 'lber', false],
];
/* ß / ss: [davor (bis einschließlich Vokal), danach, lang?, Länge des Vokals in Buchstaben (2 = Zwielaut)] */
const SZ = [
  ['Fu', '', true, 1], ['Flu', '', false, 1], ['Stra', 'e', true, 1], ['Ta', 'e', false, 1], ['Spa', '', true, 1], ['Ku', '', false, 1],
  ['gro', '', true, 1], ['Schlo', '', false, 1], ['sü', '', true, 1], ['na', '', false, 1], ['hei', 'en', true, 2], ['e', 'en', false, 1],
  ['So', 'e', true, 1], ['Kla', 'e', false, 1], ['wei', '', true, 2], ['Bi', '', false, 1], ['drau', 'en', true, 2], ['Wa', 'er', false, 1],
  ['Gru', '', true, 1], ['Schu', '', false, 1],
];

const STIL = `
.gu-wort { display: flex; justify-content: center; align-items: flex-end; font: 800 clamp(2.4rem, 7vw, 3.6rem)/1 var(--titel); margin: 1rem 0 0; gap: .02em; }
.gu-teil { position: relative; display: inline-flex; flex-direction: column; align-items: center; }
.gu-vokal { color: var(--akzent); }
.gu-luecke { min-width: 1.4em; padding: 0 .1em; border-bottom: 5px solid var(--akzent); color: var(--akzent); text-align: center; }
.gu-luecke.richtig { color: var(--gut); border-color: var(--gut); }
.gu-bandzeile { display: flex; justify-content: center; height: 3.4rem; align-items: center; }
.gu-band { position: relative; height: 1.1rem; width: 4.5rem; border-radius: .55rem; background: #e0457b; box-shadow: inset 0 -3px 0 rgba(0,0,0,.18); transition: width .6s cubic-bezier(.3,1.6,.5,1), height .6s; }
.gu-band::before, .gu-band::after { content: ''; position: absolute; top: 50%; width: 1.2rem; height: 1.2rem; margin-top: -.6rem; border-radius: 50%; background: #f4c59a; border: 2px solid #c99263; }
.gu-band::before { left: -.9rem; } .gu-band::after { right: -.9rem; }
.gu-band.lang { width: min(70%, 22rem); height: .55rem; }
.gu-band.kurz { width: 1.6rem; height: 1.5rem; animation: gu-schnapp .5s ease-out; }
@keyframes gu-schnapp { 0% { transform: scaleX(1.6); } 40% { transform: scaleX(.6); } 70% { transform: scaleX(1.15); } 100% { transform: none; } }
.gu-wahl { display: flex; gap: .6rem; flex-wrap: wrap; justify-content: center; margin: .6rem 0; }
.gu-wahl .kn-gross { font-size: 1.15rem; }
.gu-wahl .kn-gross.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); color: var(--schlecht); }
.gu-buchst .kn-gross { min-width: 4.5rem; justify-content: center; font: 900 1.8rem/1 var(--titel); }
.gu-hoeren { display: flex; justify-content: center; margin-top: .4rem; }
.gu-regel { display: grid; grid-template-columns: auto 1fr; gap: .5rem .8rem; align-items: center; }
.gu-mini { height: .7rem; border-radius: .35rem; background: #e0457b; }
`;

export function starteVokallaenge(root) {
  if (!document.getElementById('gu-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="gu-stil">${STIL}</style>`);
  const kannSprechen = 'speechSynthesis' in window;
  let modus = 'ie', lIE = mischen(IE), lSZ = mischen(SZ), iIE = 0, iSZ = 0, w, schritt, band, falsch, gewaehlt;

  const g = geruest(root, {
    etikett: 'Rechtschreibung', titel: '',
    reiter: [{ id: 'ie', titel: 'ie oder i?', unter: 'Biene – Kiste' }, { id: 'sz', titel: 'ß oder ss?', unter: 'Fuß – Fluss' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-gu="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-gu="neu">＋ Neue Aufgabe</button>`,
  });

  const loesung = () => (modus === 'ie' ? (w[2] ? 'ie' : 'i') : (w[2] ? 'ß' : 'ss'));
  const ganz = () => w[0] + loesung() + w[1];

  function neu() {
    w = modus === 'ie' ? lIE[iIE++ % lIE.length] : lSZ[iSZ++ % lSZ.length];
    schritt = 1; band = null; falsch = []; gewaehlt = null;
  }

  function sprich() {
    if (!kannSprechen) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(ganz());
    u.lang = 'de-DE'; u.rate = 0.75;
    const v = speechSynthesis.getVoices().find(x => x.lang?.startsWith('de'));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  function wortHtml() {
    const fertig = schritt === 3;
    const bandHtml = `<span class="gu-band${band ? ' ' + band : ''}"></span>`;
    if (modus === 'ie') {
      const l = `<span class="gu-luecke${fertig ? ' richtig' : ''}">${fertig ? loesung() : '?'}</span>`;
      return `<div class="gu-wort"><span>${ESC(w[0])}</span>${l}<span>${ESC(w[1])}</span></div><div class="gu-bandzeile">${bandHtml}</div>`;
    }
    const vor = w[0].slice(0, w[0].length - w[3]), vokal = w[0].slice(-w[3]);
    const l = `<span class="gu-luecke${fertig ? ' richtig' : ''}">${fertig ? loesung() : '?'}</span>`;
    return `<div class="gu-wort"><span>${ESC(vor)}</span><span class="gu-vokal">${ESC(vokal)}</span>${l}<span>${ESC(w[1])}</span></div><div class="gu-bandzeile">${bandHtml}</div>`;
  }

  function links() {
    let h = wortHtml();
    if (kannSprechen) h += '<div class="gu-hoeren"><button type="button" class="kn-gross" data-gu="hoeren">🔊 Anhören</button></div>';
    if (schritt === 1) {
      h += `<h3 class="eh-zwischen" style="text-align:center">Wie klingt der ${modus === 'ie' ? 'i-Laut' : 'Vokal vor dem s-Laut'}?</h3>
        <div class="gu-wahl"><button type="button" class="kn-gross${falsch.includes('lang') ? ' falsch' : ''}" data-band="lang">↔ lang ziehen</button>
        <button type="button" class="kn-gross${falsch.includes('kurz') ? ' falsch' : ''}" data-band="kurz">⟩⟨ kurz schnappen</button></div>`;
    }
    if (schritt >= 2) {
      const opts = modus === 'ie' ? ['ie', 'i'] : ['ß', 'ss'];
      h += `<h3 class="eh-zwischen" style="text-align:center">Was schreibst du?</h3>
        <div class="gu-wahl gu-buchst">${opts.map(o => `<button type="button" class="kn-gross${falsch.includes(o) ? ' falsch' : ''}" data-buchst="${o}" ${schritt === 3 ? 'disabled' : ''}>${o}</button>`).join('')}</div>`;
    }
    return h;
  }

  function rechts() {
    const zwei = modus === 'ie'
      ? [['lang', 'Langes i → meist <b>ie</b>: Biene, Wiese'], ['kurz', 'Kurzes i → <b>i</b>: Kiste, Wind']]
      : [['lang', 'Nach langem Vokal oder Zwielaut → <b>ß</b>: Fuß, heißen'], ['kurz', 'Nach kurzem Vokal → <b>ss</b>: Fluss, Tasse']];
    let h = `<h2 class="bereich-titel">Das Gummiband</h2><div class="gu-regel">${zwei.map(([a, t]) => `<span class="gu-mini" style="width:${a === 'lang' ? '4.5rem' : '1.4rem'}"></span><span>${t}</span>`).join('')}</div>`;
    if (modus === 'sz') h += '<p class="leise">Zwielaute (<b>ei, au, eu</b>) zählen wie lange Vokale.</p>';
    else h += '<p class="leise">Ausnahmen gibt es: Tiger, Igel, Kino schreibt man mit langem i, aber ohne e. Die musst du dir merken.</p>';
    if (schritt === 3) h += `<p class="tb-antwort gut">Richtig: ${ESC(ganz())} – der Vokal ist ${w[2] ? 'lang' : 'kurz'}, darum <b>${loesung()}</b>.</p>`;
    else if (falsch.length) h += `<p class="tb-antwort schlecht">${schritt === 1 ? 'Hör noch einmal genau hin. Sprich das Wort langsam und übertrieben deutlich.' : `Das Gummiband ist ${w[2] ? 'gedehnt – der Vokal ist lang' : 'geschnappt – der Vokal ist kurz'}. Schau auf die Regel.`}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'ie' ? 'Lang oder kurz? ie oder i' : 'Lang oder kurz? ß oder ss');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  /* Band erst ohne Zustand zeichnen und dann umschalten, damit es sichtbar dehnt oder schnappt */
  function bandAnimieren(art) {
    band = null; falsch = []; zeichne();
    const el = root.querySelector('.gu-band');
    void el?.offsetWidth;
    band = art; el?.classList.add(art);
    setTimeout(() => { if (root.querySelector('.gu-band') === el) zeichne(); }, 650);
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const bd = e.target.closest('[data-band]');
    if (bd && schritt === 1) {
      const art = bd.dataset.band;
      if ((art === 'lang') === w[2]) { schritt = 2; bandAnimieren(art); g.sprich(art === 'lang' ? 'Das Band wird lang gezogen – der Vokal ist lang.' : 'Schnapp! Das Band springt zurück – der Vokal ist kurz.'); }
      else { falsch.push(art); zeichne(); }
      return;
    }
    const bu = e.target.closest('[data-buchst]');
    if (bu && schritt === 2) {
      if (bu.dataset.buchst === loesung()) { schritt = 3; falsch = []; zeichne(); g.sprich(`${ganz()} – richtig geschrieben!`, 'fertig'); }
      else { falsch.push(bu.dataset.buchst); zeichne(); }
      return;
    }
    const b = e.target.closest('[data-gu]');
    if (!b) return;
    if (b.dataset.gu === 'hoeren') sprich();
    if (b.dataset.gu === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.gu === 'tipp') g.sprich(schritt === 1 ? 'Sprich das Wort und halte den Vokal dabei fest. Kannst du ihn lang ziehen wie ein Gummiband – oder ist er ganz kurz?' : 'Langes Band → ' + (modus === 'ie' ? 'ie' : 'ß') + '. Kurzes Band → ' + (modus === 'ie' ? 'i' : 'ss') + '.', 'tipp');
  });

  function start() { g.sprich(kannSprechen ? 'Hör dir das Wort an. Ist der Vokal lang oder kurz?' : 'Sprich das Wort leise vor dich hin. Ist der Vokal lang oder kurz?'); }

  neu(); zeichne(); start();
}
