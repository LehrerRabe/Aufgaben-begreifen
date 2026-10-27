/* Deutsch: Nomenprobe – groß oder klein?
   Ein Wort ist kleingeschrieben markiert. Mit der Begleiterprobe (der/die/das davor?) und der
   Adjektivprobe (ein Eigenschaftswort davor?) wird geprüft, ob es ein Nomen ist. */

import { geruest, mischen, warte, ESC } from './geruest.js';

/* vor | Wort | nach, Nomen?, Begleiter-Info, Adjektiv für die Probe */
const AUFGABEN = [
  { vor: 'Das', wort: 'schwimmen', nach: 'macht mir Spaß.', nomen: true, begl: { art: 'da', text: 'Das' }, adj: 'lange' },
  { vor: 'Ich kann gut', wort: 'schwimmen', nach: '.', nomen: false, adj: 'langes' },
  { vor: 'Beim', wort: 'laufen', nach: 'werde ich müde.', nomen: true, begl: { art: 'versteckt', text: 'Beim = bei dem' }, adj: 'schnellen' },
  { vor: 'Wir', wort: 'laufen', nach: 'zur Schule.', nomen: false, adj: 'schnelles' },
  { vor: 'Der', wort: 'hund', nach: 'bellt laut.', nomen: true, begl: { art: 'da', text: 'Der' }, adj: 'kleine' },
  { vor: 'Der Ball ist', wort: 'rot', nach: '.', nomen: false, adj: 'helles' },
  { vor: 'Das', wort: 'rot', nach: 'der Ampel leuchtet.', nomen: true, begl: { art: 'da', text: 'Das' }, adj: 'helle' },
  { vor: 'Die', wort: 'freude', nach: 'ist groß.', nomen: true, begl: { art: 'da', text: 'Die' }, adj: 'riesige' },
  { vor: 'Wir', wort: 'freuen', nach: 'uns sehr.', nomen: false, adj: 'große' },
  { vor: 'Zum', wort: 'lesen', nach: 'brauche ich Ruhe.', nomen: true, begl: { art: 'versteckt', text: 'Zum = zu dem' }, adj: 'ruhigen' },
  { vor: 'Ich', wort: 'lese', nach: 'ein Buch.', nomen: false, adj: 'dicke' },
  { vor: 'Er rennt', wort: 'schnell', nach: 'weg.', nomen: false, adj: 'flinke' },
  { vor: 'Im', wort: 'winter', nach: 'fahren wir Schlitten.', nomen: true, begl: { art: 'versteckt', text: 'Im = in dem' }, adj: 'kalten' },
  { vor: 'Mein', wort: 'fahrrad', nach: 'ist neu.', nomen: true, begl: { art: 'da', text: 'Mein' }, adj: 'rotes' },
  { vor: 'Wir', wort: 'malen', nach: 'ein Bild.', nomen: false, adj: 'bunte' },
  { vor: 'Das', wort: 'malen', nach: 'macht Spaß.', nomen: true, begl: { art: 'da', text: 'Das' }, adj: 'bunte' },
];

const gross = w => w[0].toUpperCase() + w.slice(1);

export function starteNomenprobe(root) {
  let liste = mischen(AUFGABEN), idx = 0, a, proben, wahl, punkte = 0, runde = 0;

  const g = geruest(root, {
    etikett: 'Nomenprobe', titel: 'Groß oder klein?',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-np="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-np="neu">Nächster Satz ▶</button>`,
  });

  function neu() { a = liste[idx % liste.length]; proben = { begl: null, adj: null }; wahl = null; }

  /** Satz mit optional eingeschobenem Wort vor dem Prüfwort. */
  function satz({ einschub = '', markierung = '', zeigeWort } = {}) {
    const wort = zeigeWort ?? a.wort;
    const n = a.nach === '.' ? '.' : ` ${a.nach}`;
    return `<p class="np-satz">${ESC(a.vor)} ${einschub ? `<span class="np-einschub ${markierung}">${ESC(einschub)}</span> ` : ''}<span class="np-wort${wahl ? (wahl === (a.nomen ? 'gross' : 'klein') ? ' richtig' : ' falsch') : ''}">${ESC(wort)}</span>${ESC(n)}</p>`;
  }

  function probeHtml(art) {
    const p = proben[art];
    if (!p) return '';
    if (art === 'begl') {
      if (a.nomen && a.begl.art === 'da') return `<div class="np-probe gut"><b>Begleiterprobe:</b> „${ESC(a.begl.text)}“ steht schon als Begleiter davor. ✓</div>`;
      if (a.nomen) return `<div class="np-probe gut"><b>Begleiterprobe:</b> Der Begleiter steckt im Wort davor: ${ESC(a.begl.text)}. ✓</div>`;
      return `<div class="np-probe schlecht"><b>Begleiterprobe:</b> ${satz({ einschub: 'das', markierung: 'falsch' })}<span>Das klingt falsch. ✗</span></div>`;
    }
    const zeig = a.nomen ? gross(a.wort) : a.wort;
    return `<div class="np-probe ${a.nomen ? 'gut' : 'schlecht'}"><b>Adjektivprobe:</b> ${satz({ einschub: a.adj, markierung: a.nomen ? 'gut' : 'falsch', zeigeWort: zeig })}<span>${a.nomen ? 'Das passt! ✓' : 'Das klingt falsch. ✗'}</span></div>`;
  }

  function links() {
    const fertig = !!wahl;
    return `<div class="np-tafel">${fertig ? satz({ zeigeWort: a.nomen ? gross(a.wort) : a.wort }) : satz()}</div>
      <div class="np-proben">
        <button type="button" class="kn-gross" data-probe="begl" ${proben.begl ? 'disabled' : ''}>der/die/das davor?</button>
        <button type="button" class="kn-gross" data-probe="adj" ${proben.adj ? 'disabled' : ''}>Adjektiv davor?</button>
      </div>
      <div class="np-ergebnisse">${probeHtml('begl')}${probeHtml('adj')}</div>
      <h3 class="eh-zwischen">Wie schreibt man das markierte Wort?</h3>
      <div class="np-wahl">
        <button type="button" class="kn-gross${wahl === 'gross' ? ' gewaehlt' : ''}" data-wahl="gross">${ESC(gross(a.wort))}</button>
        <button type="button" class="kn-gross${wahl === 'klein' ? ' gewaehlt' : ''}" data-wahl="klein">${ESC(a.wort)}</button>
      </div>
      ${wahl ? `<p class="tb-antwort ${wahl === (a.nomen ? 'gross' : 'klein') ? 'gut' : 'schlecht'}">${wahl === (a.nomen ? 'gross' : 'klein') ? 'Richtig!' : 'Leider nicht.'} „${ESC(a.nomen ? gross(a.wort) : a.wort)}“ ist hier ${a.nomen ? 'ein Nomen – darum groß.' : 'kein Nomen – darum klein.'}</p>` : ''}`;
  }

  function rechts() {
    return `<h2 class="bereich-titel">So prüfst du</h2>
      <ol class="sg-merke">
        <li><b>Begleiterprobe:</b> Kann <i>der, die, das</i> (oder <i>ein, mein, …</i>) davor stehen? Manchmal steckt er versteckt in <i>beim, zum, im</i>.</li>
        <li><b>Adjektivprobe:</b> Kann ein Eigenschaftswort davor stehen – <i>das schöne …</i>?</li>
      </ol>
      <p>Klappt eine Probe, ist das Wort ein <b>Nomen</b> und wird <b>großgeschrieben</b>.</p>
      <p class="np-stand">${punkte} von ${runde} richtig</p>`;
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  root.addEventListener('click', async e => {
    const p = e.target.closest('[data-probe]');
    if (p) {
      proben[p.dataset.probe] = true; zeichne();
      const el = root.querySelector(`.np-ergebnisse .np-probe:last-child .np-einschub`);
      if (el) { el.classList.add('rein'); await warte(10); }
      return;
    }
    const w = e.target.closest('[data-wahl]');
    if (w && !wahl) {
      wahl = w.dataset.wahl; runde++;
      if (wahl === (a.nomen ? 'gross' : 'klein')) { punkte++; g.sprich(a.nomen ? 'Die Probe klappt – also ein Nomen. Nomen schreibt man groß.' : 'Keine Probe klappt – also kein Nomen. Darum klein.', 'fertig'); }
      else g.sprich('Mach beide Proben. Klappt eine davon, ist es ein Nomen.', 'tipp');
      zeichne(); return;
    }
    const b = e.target.closest('[data-np]');
    if (!b) return;
    if (b.dataset.np === 'neu') { idx++; neu(); zeichne(); startText(); }
    if (b.dataset.np === 'tipp') g.sprich('Probiere beide Proben aus. Lies den Satz mit dem eingeschobenen Wort laut: Klingt er richtig?', 'tipp');
  });

  function startText() { g.sprich('Ist das markierte Wort ein Nomen? Mach die Proben und entscheide: groß oder klein.'); }

  neu(); zeichne(); startText();
}
