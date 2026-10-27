/* Deutsch: „das“ oder „dass“? (Klasse 5/6)
   Ersatzprobe: Passt „dieses“, „welches“ oder „dies“ in die Lücke, schreibt man „das“ (mit einem s).
   Passt keines, ist es die Konjunktion „dass“ – sie leitet einen Nebensatz ein, das Verb steht am Ende.
   1. Ersatzwörter in die Lücke legen (die Karte dreht sich um, der Satz wird vorgelesen),
   2. entscheiden: das oder dass, 3. Bild: bei „dass“ leuchten Komma, Einleitewort und Verb am Ende. */

import { geruest, wahl, antwortHtml, ESC } from './geruest.js';

/* [Satz mit ___, Lösung, Ersatzwort das passt (bei das), Wortart, Verb am Ende (bei dass)] */
export const SAETZE = [
  ['Ich hoffe, ___ du morgen kommst.', 'dass', null, 'Konjunktion', 'kommst'],
  ['___ Fahrrad steht im Keller.', 'das', 'Dieses', 'Artikel', null],
  ['Das ist das Buch, ___ mir Oma geschenkt hat.', 'das', 'welches', 'Relativpronomen', null],
  ['Ich weiß, ___ du recht hast.', 'dass', null, 'Konjunktion', 'hast'],
  ['___ habe ich nicht gewusst.', 'das', 'Dies', 'Demonstrativpronomen', null],
  ['Es ist schön, ___ ihr gekommen seid.', 'dass', null, 'Konjunktion', 'seid'],
  ['Siehst du ___ Haus dort drüben?', 'das', 'dieses', 'Artikel', null],
  ['Das Kind, ___ dort spielt, ist mein Bruder.', 'das', 'welches', 'Relativpronomen', null],
  ['Mama sagt, ___ wir leise sein sollen.', 'dass', null, 'Konjunktion', 'sollen'],
  ['___ Wetter ist heute schön.', 'das', 'Dieses', 'Artikel', null],
  ['Er freut sich, ___ die Ferien beginnen.', 'dass', null, 'Konjunktion', 'beginnen'],
  ['Ich glaube, ___ es gleich regnet.', 'dass', null, 'Konjunktion', 'regnet'],
  ['Das Lied, ___ wir singen, ist neu.', 'das', 'welches', 'Relativpronomen', null],
  ['___ war ein toller Tag!', 'das', 'Dies', 'Demonstrativpronomen', null],
  ['Wir wussten nicht, ___ der Zug Verspätung hat.', 'dass', null, 'Konjunktion', 'hat'],
  ['Gib mir bitte ___ Heft.', 'das', 'dieses', 'Artikel', null],
  ['Es ist wichtig, ___ du pünktlich bist.', 'dass', null, 'Konjunktion', 'bist'],
  ['Das Pferd, ___ im Stall steht, heißt Luna.', 'das', 'welches', 'Relativpronomen', null],
  ['Ich finde es toll, ___ du mir hilfst.', 'dass', null, 'Konjunktion', 'hilfst'],
  ['Hast du ___ gesehen?', 'das', 'dies', 'Demonstrativpronomen', null],
];
const ERSATZ = ['dieses', 'welches', 'dies'];

export function starteDassDas(root) {
  let s, probe, wahlW, schritt, bewertung = null, letzte = null, probiert;

  const g = geruest(root, {
    etikett: 'Rechtschreibung', titel: '„das“ oder „dass“?',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-dd="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-dd="neu">＋ Neuer Satz</button>`,
  });

  function neu() {
    let x; do { x = wahl(SAETZE); } while (x === letzte);
    letzte = x;
    const [text, loes, ersatz, art, verb] = x;
    s = { text, loes, ersatz, art, verb, anfang: text.startsWith('___') };
    probe = null; wahlW = null; schritt = 1; bewertung = null; probiert = new Set();
  }
  const gross = w => w[0].toUpperCase() + w.slice(1);
  const passt = w => s.loes === 'das' && s.ersatz.toLowerCase() === w;

  function satzHtml() {
    let inhalt;
    if (schritt === 3) {
      const w = s.anfang ? gross(s.loes) : s.loes;
      inhalt = `<span class="dd-wort fertig ${s.loes}">${w}</span>`;
    } else if (probe) inhalt = `<span class="dd-wort probe">${ESC(s.anfang ? gross(probe) : probe)}</span>`;
    else inhalt = '<span class="dd-wort leer">?</span>';
    let html = ESC(s.text).replace('___', inhalt);
    if (schritt === 3 && s.loes === 'dass') {
      html = html.replace(/,(\s*<span class="dd-wort)/, '<span class="dd-komma">,</span>$1');
      const v = ESC(s.verb), i = html.lastIndexOf(v);
      if (i >= 0) html = html.slice(0, i) + `<span class="dd-verb">${v}</span>` + html.slice(i + v.length);
    }
    return html;
  }
  function links() {
    let h = `<p class="dd-satz">${satzHtml()}</p>`;
    if (schritt === 1) h += `<p class="leise">Lege ein Ersatzwort in die Lücke und lies den Satz leise. Klingt er richtig?</p>
      <div class="dd-ersatz">${ERSATZ.map(w => `<button type="button" class="dd-karte${probe === w ? ' an' : ''}${probiert.has(w) ? ' probiert' : ''}" data-probe="${w}">${w}</button>`).join('')}</div>`;
    if (schritt === 3) {
      h += s.loes === 'das'
        ? `<p class="sh-erkl"><b>„${ESC(s.ersatz)}“ passt</b> – darum schreibt man <b>das</b>. Hier ist es ein <b>${s.art}</b>.</p>`
        : `<p class="sh-erkl">Kein Ersatzwort passt – also <b>dass</b>. „dass“ leitet einen <b>Nebensatz</b> ein: davor steht ein <span class="dd-komma-t">Komma</span>, am Ende steht das <span class="dd-verb">Verb</span>.</p>`;
    }
    return h;
  }
  function rechts() {
    let h = `<h2 class="bereich-titel">Die Ersatzprobe</h2>
      <ul class="fm-regeln"><li>Passt <b>dieses</b>, <b>welches</b> oder <b>dies</b> → <b>das</b></li><li>Passt nichts davon → <b>dass</b></li></ul>`;
    h += `<p class="vz-schritt${schritt > 1 ? ' fertig' : ''}">1. Probiere die Ersatzwörter aus.${probiert.size ? ` (${probiert.size} von 3 probiert)` : ''}</p>`;
    if (schritt === 1) h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-dd="weiter" ${probiert.size ? '' : 'disabled'}>Weiter ▶</button></div>`;
    if (schritt >= 2) {
      h += `<p class="vz-schritt${schritt > 2 ? ' fertig' : ''}">2. Was gehört in die Lücke?</p>
        <div class="gs-pruef">${['das', 'dass'].map(w => `<button type="button" class="kn-gross sh-opt${wahlW === w ? (w === s.loes ? ' richtig' : ' falsch') : ''}" data-wahl="${w}" ${schritt > 2 ? 'disabled' : ''}>${s.anfang ? gross(w) : w}</button>`).join('')}</div>`;
    }
    return h + antwortHtml(bewertung);
  }
  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  root.addEventListener('click', e => {
    const p = e.target.closest('[data-probe]');
    if (p && schritt === 1) {
      probe = p.dataset.probe; probiert.add(probe); bewertung = null; zeichne();
      g.sprich(`Lies leise: „${s.text.replace('___', s.anfang ? gross(probe) : probe)}“ – klingt das richtig?`);
      return;
    }
    const w = e.target.closest('[data-wahl]');
    if (w && schritt === 2) {
      wahlW = w.dataset.wahl;
      if (wahlW === s.loes) { schritt = 3; probe = null; bewertung = { ok: true, text: `Richtig: ${s.loes}` }; g.sprich(s.loes === 'das' ? 'Ein Ersatzwort passt – „das“ mit einem s.' : 'Nichts passt – „dass“ mit Doppel-s leitet einen Nebensatz ein.', 'fertig'); }
      else bewertung = { ok: false, text: s.loes === 'das' ? `Probiere „${s.ersatz.toLowerCase()}“ – das passt! Also „das“.` : 'Keines der Ersatzwörter klingt richtig – also „dass“.' };
      zeichne(); return;
    }
    const b = e.target.closest('[data-dd]');
    if (!b) return;
    if (b.dataset.dd === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.dd === 'weiter' && probiert.size) { schritt = 2; zeichne(); }
    if (b.dataset.dd === 'tipp') g.sprich(schritt === 1 ? 'Setze nacheinander alle drei Wörter ein. Lies jedes Mal den ganzen Satz.' : s.loes === 'das' ? `„${s.ersatz.toLowerCase()}“ hat gut geklungen, oder?` : 'Hat eines der drei Wörter wirklich gepasst?', 'tipp');
  });
  void passt;

  function start() { g.sprich('Mit der Ersatzprobe musst du nicht raten.'); }
  neu(); zeichne(); start();
}
