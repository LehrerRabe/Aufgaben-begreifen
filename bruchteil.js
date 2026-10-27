/* Mathematik: Mit Anteilen rechnen – am Bruchstreifen.
   Teil berechnen: Anteil und Ganzes sind bekannt (3/4 von 24).
   Ganzes berechnen: Anteil und Teil sind bekannt (2/5 sind 12).
   Weg: 1. Das Gegebene am Streifen eintragen. 2. Ausrechnen, wie viel in einem Stück steckt.
        3. Aus dem Stück den Teil bzw. das Ganze berechnen. */

import { geruest, zufall, wahl, antwortHtml, bruchHtml, zahlenMerken, ggT } from './geruest.js';

const NENNER_NAME = { 2: 'Halbe', 3: 'Drittel', 4: 'Viertel', 5: 'Fünftel', 6: 'Sechstel', 8: 'Achtel', 10: 'Zehntel' };
const EINEM = { 2: 'einem Halben', 3: 'einem Drittel', 4: 'einem Viertel', 5: 'einem Fünftel', 6: 'einem Sechstel', 8: 'einem Achtel', 10: 'einem Zehntel' };
const EIN_STUECK = { 2: 'ein Halbes', 3: 'ein Drittel', 4: 'ein Viertel', 5: 'ein Fünftel', 6: 'ein Sechstel', 8: 'ein Achtel', 10: 'ein Zehntel' };

/* Sachsituationen: {e} Einheit, Texte für beide Richtungen */
const KONTEXTE = [
  { e: '€', teil: (G, b, n) => `Lea hat ${G} €. Sie gibt ${b} davon für ein Buch aus. Wie viel kostet das Buch?`, ganz: (T, b) => `Lea gibt ${b} ihres Geldes für ein Buch aus. Das Buch kostet ${T} €. Wie viel Geld hatte Lea?` },
  { e: 'Kinder', teil: (G, b) => `In der Klasse sind ${G} Kinder. ${b} davon fahren mit dem Bus. Wie viele Kinder fahren mit dem Bus?`, ganz: (T, b) => `${b} der Klasse fahren mit dem Bus. Das sind ${T} Kinder. Wie viele Kinder sind in der Klasse?` },
  { e: 'min', teil: (G, b) => `Ein Film dauert ${G} Minuten. ${b} davon sind schon vorbei. Wie viele Minuten sind vorbei?`, ganz: (T, b) => `${b} eines Films sind vorbei, das sind ${T} Minuten. Wie lange dauert der ganze Film?` },
  { e: 'km', teil: (G, b) => `Eine Radtour ist ${G} km lang. ${b} der Strecke sind geschafft. Wie viele Kilometer sind das?`, ganz: (T, b) => `${b} einer Radtour sind ${T} km. Wie lang ist die ganze Tour?` },
  { e: 'Murmeln', teil: (G, b) => `Tom hat ${G} Murmeln. ${b} davon sind blau. Wie viele Murmeln sind blau?`, ganz: (T, b) => `${b} von Toms Murmeln sind blau. Das sind ${T} Murmeln. Wie viele Murmeln hat Tom insgesamt?` },
];

export const starteTeilBerechnen = root => starteBruchteil(root, 'teil');
export const starteGanzesBerechnen = root => starteBruchteil(root, 'ganz');

export function starteBruchteil(root, art) {
  let a, n, k, ktx, schritt, eing = {}, bewertung = null, frisch = false;

  const g = geruest(root, {
    etikett: art === 'teil' ? 'Teil berechnen' : 'Ganzes berechnen',
    titel: art === 'teil' ? 'Wie groß ist der Teil?' : 'Wie groß ist das Ganze?',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bt="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bt="neu">＋ Neue Aufgabe</button>`,
    breitRechts: false,
  });
  zahlenMerken(root, eing);

  function neu() {
    do { n = wahl([2, 3, 4, 5, 6, 8, 10]); a = zufall(1, n - 1); } while (ggT(a, n) !== 1);
    k = zufall(2, n >= 8 ? 9 : 12);
    ktx = wahl(KONTEXTE);
    schritt = 1; bewertung = null; frisch = false;
    ['bt-ganz', 'bt-teil', 'bt-stueck'].forEach(x => (eing[x] = ''));
  }

  const G = () => n * k, T = () => a * k;
  const b = () => `${a}/${n}`;
  const feld = (id, aktiv, wert, label) => `<input class="gs-ein bt-ein${aktiv ? '' : ' fest'}" id="${id}" data-zahl inputmode="numeric" maxlength="4" value="${wert ?? ''}" aria-label="${label}" ${aktiv ? '' : 'readonly tabindex="-1"'}>`;

  function streifen() {
    const gegeben = art === 'teil' ? 'ganz' : 'teil';
    // Schritt 1: beide Klammern sind Eingabefelder (das Gegebene muss an die richtige Stelle).
    const ganzAktiv = schritt === 1 || (schritt === 3 && art === 'ganz');
    const teilAktiv = schritt === 1 || (schritt === 3 && art === 'teil');
    const ganzWert = schritt === 1 || (schritt === 3 && art === 'ganz') ? eing['bt-ganz'] : gegeben === 'ganz' || schritt > 3 ? G() : '';
    const teilWert = schritt === 1 || (schritt === 3 && art === 'teil') ? eing['bt-teil'] : gegeben === 'teil' || schritt > 3 ? T() : '';
    const zellen = Array.from({ length: n }, (_, i) => {
      let inhalt = '';
      if (schritt === 2 && i === 0) inhalt = feld('bt-stueck', true, eing['bt-stueck'], 'Wert eines Stücks');
      else if (schritt >= 3) inhalt = `<span class="bt-wert${frisch ? ' neu' : ''}" style="--i:${i}">${k}</span>`;
      return `<div class="bt-zelle${i < a ? ' an' : ''}${schritt === 2 && i === 0 ? ' fokus' : ''}"><small>${bruchHtml(1, n, 'klein')}</small>${inhalt}</div>`;
    }).join('');
    return `<div class="bt-streifen" style="--n:${n}; --a:${a}">
      <div class="bt-oben"><span class="bt-klammer oben"></span><label class="bt-beschr">Ganzes ${feld('bt-ganz', ganzAktiv, ganzWert, 'Ganzes')} <span>${ktx.e}</span></label></div>
      <div class="bt-zellen">${zellen}</div>
      <div class="bt-unten"><span class="bt-klammer unten"></span><label class="bt-beschr">${bruchHtml(a, n, 'klein')} = ${feld('bt-teil', teilAktiv, teilWert, 'Teil')} <span>${ktx.e}</span></label></div>
    </div>`;
  }

  function weg() {
    const z = [];
    if (schritt >= 2) z.push(art === 'teil' ? `Ganzes: ${G()} ${ktx.e}` : `${b()} sind ${T()} ${ktx.e}`);
    if (schritt >= 3) z.push(`${EIN_STUECK[n]}: ${art === 'teil' ? `${G()} : ${n}` : `${T()} : ${a}`} = ${k}`);
    if (schritt >= 4) z.push(art === 'teil' ? `${b()}: ${a} · ${k} = ${T()}` : `das Ganze (${n}/${n}): ${n} · ${k} = ${G()}`);
    return z.length ? `<ol class="bt-weg">${z.map(x => `<li>${x}</li>`).join('')}</ol>` : '';
  }

  function links() {
    const anweisung = {
      1: `<b>1.</b> Trage ein, was du weißt: ${art === 'teil' ? 'Das Ganze gehört über den ganzen Streifen.' : 'Der Teil gehört unter die gefärbten Stücke.'}`,
      2: `<b>2.</b> Wie viel steckt in einem Stück, also in ${EINEM[n]}? Trage es in das erste Stück ein.`,
      3: `<b>3.</b> ${art === 'teil' ? `Jetzt kennst du jedes Stück. Wie viel sind ${a} ${a === 1 ? 'Stück' : 'Stücke'}?` : `Jetzt kennst du jedes Stück. Wie viel sind alle ${n} Stücke zusammen?`}`,
      4: '✓ Fertig!',
    }[schritt];
    return `${streifen()}<p class="bt-anweisung">${anweisung}</p>
      ${schritt < 4 ? '<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-bt="pruefen">✓ Prüfen</button></div>' : ''}`;
  }

  function rechts() {
    const text = art === 'teil' ? ktx.teil(G(), b(), n) : ktx.ganz(T(), b());
    return `<h2 class="bereich-titel">Aufgabe</h2><p class="tl-geschichte">${text}</p>
      <p class="bt-anteil">Anteil: ${bruchHtml(a, n)} <span class="leise">– der Streifen hat ${n} gleiche Stücke (${NENNER_NAME[n]}), ${a} davon sind gefärbt.</span></p>
      ${weg()}${antwortHtml(bewertung)}`;
  }

  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); frisch = false; }

  function pruefen() {
    const zahl = id => Number((eing[id] || '').replace(/\D/g, ''));
    if (schritt === 1) {
      const sollId = art === 'teil' ? 'bt-ganz' : 'bt-teil', falschId = art === 'teil' ? 'bt-teil' : 'bt-ganz';
      const soll = art === 'teil' ? G() : T();
      if (eing[falschId]) { bewertung = { ok: false, text: art === 'teil' ? `Den Teil kennst du noch nicht – gegeben ist das Ganze (${G()} ${ktx.e}). Es gehört über den ganzen Streifen.` : `Das Ganze kennst du noch nicht – gegeben ist der Teil (${T()} ${ktx.e}). Er gehört unter die gefärbten Stücke.` }; eing[falschId] = ''; }
      else if (zahl(sollId) === soll) { schritt = 2; bewertung = null; g.sprich(art === 'teil' ? `Richtig: Das Ganze, ${G()} ${ktx.e}, verteilt sich auf ${n} gleiche Stücke.` : `Richtig: ${T()} ${ktx.e} verteilen sich auf die ${a} gefärbten Stücke.`, 'fertig'); }
      else bewertung = { ok: false, text: 'Lies die Aufgabe noch einmal: Welche Zahl ist gegeben?' };
    } else if (schritt === 2) {
      if (zahl('bt-stueck') === k) { schritt = 3; frisch = true; bewertung = null; g.sprich(`Ein Stück sind ${k} ${ktx.e}. Jetzt steht in jedem Stück ${k}.`, 'fertig'); }
      else bewertung = { ok: false, text: art === 'teil' ? `Das Ganze (${G()}) wird in ${n} gleiche Stücke geteilt: ${G()} : ${n} = ?` : `Die ${T()} gehören zu ${a} Stücken. Ein Stück: ${T()} : ${a} = ?` };
    } else if (schritt === 3) {
      const id = art === 'teil' ? 'bt-teil' : 'bt-ganz', soll = art === 'teil' ? T() : G();
      if (zahl(id) === soll) { schritt = 4; bewertung = { ok: true, text: `Richtig: ${art === 'teil' ? `${b()} von ${G()} ${ktx.e} sind ${T()} ${ktx.e}` : `Das Ganze sind ${G()} ${ktx.e}`}.` }; g.sprich('Super! Erst ein Stück, dann der Rest – so geht es immer.', 'fertig'); }
      else bewertung = { ok: false, text: art === 'teil' ? `Zähle die gefärbten Stücke zusammen: ${a} · ${k} = ?` : `Zähle alle ${n} Stücke zusammen: ${n} · ${k} = ?` };
    }
    zeichne();
    root.querySelector('.bt-ein:not(.fest)')?.focus({ preventScroll: true });
  }

  root.addEventListener('click', e => {
    const bt = e.target.closest('[data-bt]');
    if (!bt) return;
    if (bt.dataset.bt === 'neu') { neu(); zeichne(); start(); }
    if (bt.dataset.bt === 'pruefen') pruefen();
    if (bt.dataset.bt === 'tipp') g.sprich({
      1: art === 'teil' ? 'Gegeben ist das Ganze – das ist der ganze Streifen.' : `Gegeben ist der Teil – das sind die ${a} gefärbten Stücke.`,
      2: art === 'teil' ? `Teile das Ganze durch die Anzahl aller Stücke (${n}).` : `Teile den Teil durch die Anzahl der gefärbten Stücke (${a}).`,
      3: art === 'teil' ? `Nimm den Wert eines Stücks mal die Anzahl der gefärbten Stücke (${a}).` : `Nimm den Wert eines Stücks mal die Anzahl aller Stücke (${n}).`,
      4: 'Neue Aufgabe?',
    }[schritt], 'tipp');
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.bt-ein')) { e.preventDefault(); pruefen(); } });

  function start() { g.sprich(art === 'teil' ? 'Du kennst das Ganze und den Anteil. Rechne über ein Stück zum Teil.' : 'Du kennst den Teil und den Anteil. Rechne über ein Stück zum Ganzen.'); }

  neu(); zeichne(); start();
}
