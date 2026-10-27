/* Deutsch: Ableiten und Verlängern (Klasse 5/6).
   ä oder e? äu oder eu? → ein verwandtes Wort mit a / au suchen (Räder ← Rad, Bäume ← Baum).
   d oder t? b oder p? g oder k? → das Wort verlängern, dann hört man es (Hund → Hunde).
   1. Das passende Hilfswort wählen (Wortfamilie / Verlängerung), 2. Buchstaben einsetzen.
   Danach leuchtet der gemeinsame Wortstamm in allen Wörtern der Familie gleich auf. */

import { geruest, wahl, mischen, antwortHtml, ESC } from './geruest.js';

/* [vorne, richtig, falsch, hinten, Hilfswort, Buchstabe im Hilfswort, falsche Hilfswörter, Wortfamilie, Art] */
export const AUFGABEN = [
  ['R', 'ä', 'e', 'der', 'Rad', 'a', ['Rede', 'rennen'], ['Rad', 'Räder', 'Fahrrad'], 'ableiten'],
  ['B', 'ä', 'e', 'cker', 'backen', 'a', ['Becher', 'Bett'], ['backen', 'Bäcker', 'Bäckerei'], 'ableiten'],
  ['Gl', 'ä', 'e', 'ser', 'Glas', 'a', ['glatt', 'Gelee'], ['Glas', 'Gläser', 'gläsern'], 'ableiten'],
  ['k', 'ä', 'e', 'lter', 'kalt', 'a', ['Keller', 'Kelle'], ['kalt', 'kälter', 'Kälte'], 'ableiten'],
  ['W', 'ä', 'e', 'lder', 'Wald', 'a', ['Welt', 'Welle'], ['Wald', 'Wälder', 'Waldweg'], 'ableiten'],
  ['G', 'ä', 'e', 'ste', 'Gast', 'a', ['Geste', 'gestern'], ['Gast', 'Gäste', 'Gastgeber'], 'ableiten'],
  ['F', 'e', 'ä', 'lder', 'Feld', 'e', ['fallen', 'Falter'], ['Feld', 'Felder', 'Feldweg'], 'ableiten'],
  ['W', 'e', 'ä', 'tter', 'Unwetter', 'e', ['waten', 'Watte'], ['Wetter', 'Unwetter', 'Wetterbericht'], 'ableiten'],
  ['B', 'äu', 'eu', 'me', 'Baum', 'au', ['Beule', 'bauen'], ['Baum', 'Bäume', 'Baumhaus'], 'ableiten'],
  ['H', 'äu', 'eu', 'ser', 'Haus', 'au', ['heute', 'Heu'], ['Haus', 'Häuser', 'häuslich'], 'ableiten'],
  ['M', 'äu', 'eu', 'se', 'Maus', 'au', ['Meute', 'Mauer'], ['Maus', 'Mäuse', 'Mausloch'], 'ableiten'],
  ['tr', 'äu', 'eu', 'men', 'Traum', 'au', ['treu', 'trauen'], ['Traum', 'träumen', 'Traumland'], 'ableiten'],
  ['L', 'eu', 'äu', 'te', 'Landsleute', 'eu', ['laut', 'laufen'], ['Leute', 'Bauersleute', 'Landsleute'], 'ableiten'],
  ['F', 'eu', 'äu', 'er', 'feurig', 'eu', ['Faust', 'faul'], ['Feuer', 'feurig', 'Feuerwehr'], 'ableiten'],
  ['Hun', 'd', 't', '', 'Hunde', 'd', ['Hut', 'hundert'], ['Hund', 'Hunde', 'Hundehütte'], 'verlaengern'],
  ['Wal', 'd', 't', '', 'Wälder', 'd', ['Walter', 'walten'], ['Wald', 'Wälder', 'waldig'], 'verlaengern'],
  ['Kin', 'd', 't', '', 'Kinder', 'd', ['Kinn', 'Kino'], ['Kind', 'Kinder', 'kindlich'], 'verlaengern'],
  ['Hu', 't', 'd', '', 'Hüte', 't', ['Hund', 'hupen'], ['Hut', 'Hüte', 'Sonnenhut'], 'verlaengern'],
  ['Bro', 't', 'd', '', 'Brote', 't', ['brodeln', 'braten'], ['Brot', 'Brote', 'Brötchen'], 'verlaengern'],
  ['Kor', 'b', 'p', '', 'Körbe', 'b', ['Korn', 'Korken'], ['Korb', 'Körbe', 'Papierkorb'], 'verlaengern'],
  ['Die', 'b', 'p', '', 'Diebe', 'b', ['dienen', 'Diele'], ['Dieb', 'Diebe', 'Diebstahl'], 'verlaengern'],
  ['Ber', 'g', 'k', '', 'Berge', 'g', ['Berta', 'Bericht'], ['Berg', 'Berge', 'bergig'], 'verlaengern'],
  ['Zu', 'g', 'k', '', 'Züge', 'g', ['Zucker', 'zu'], ['Zug', 'Züge', 'Zugfahrt'], 'verlaengern'],
  ['We', 'g', 'k', '', 'Wege', 'g', ['wecken', 'wehen'], ['Weg', 'Wege', 'Umweg'], 'verlaengern'],
];

const norm = s => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
/** Längster gemeinsamer Teil aller Wörter der Familie (Umlaute zählen wie ihr Grundvokal) */
function gemeinsamerStamm(woerter) {
  const n = woerter.map(norm), erstes = n[0];
  let best = '';
  for (let i = 0; i < erstes.length; i++) for (let j = i + 1; j <= erstes.length; j++) {
    const t = erstes.slice(i, j);
    if (t.length > best.length && n.every(w => w.includes(t))) best = t;
  }
  return best;
}
/** Wortstamm in einem Wort hervorheben */
function stammHtml(wort, stamm) {
  const i = norm(wort).indexOf(stamm);
  if (i < 0 || !stamm) return ESC(wort);
  return `${ESC(wort.slice(0, i))}<span class="wf-stamm">${ESC(wort.slice(i, i + stamm.length))}</span>${ESC(wort.slice(i + stamm.length))}`;
}

export function starteWortfamilie(root) {
  let a, schritt, hilfe, wahlB, bewertung = null, letzte = null, optionen;

  const g = geruest(root, {
    etikett: 'Rechtschreibung', titel: 'Ableiten und Verlängern',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-wf="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-wf="neu">＋ Neues Wort</button>`,
  });

  function neu() {
    let x; do { x = wahl(AUFGABEN); } while (x === letzte);
    letzte = x;
    const [vorne, richtig, falsch, hinten, hilfswort, hb, falscheHilfe, familie, art] = x;
    a = { vorne, richtig, falsch, hinten, hilfswort, hb, falscheHilfe, familie, art, wort: vorne + richtig + hinten };
    optionen = mischen([hilfswort, ...falscheHilfe]);
    schritt = 1; hilfe = null; wahlB = null; bewertung = null;
  }
  const istAbleiten = () => a.art === 'ableiten';
  const stamm = () => gemeinsamerStamm(a.familie);

  function links() {
    const luecke = `${ESC(a.vorne)}<span class="sh-luecke${schritt === 3 ? ' voll' : ''}">${schritt === 3 ? ESC(a.richtig) : '?'}</span>${ESC(a.hinten)}`;
    let h = `<div class="wf-karte"><p class="wf-wort">${luecke}</p>
      <p class="wf-frage">${ESC(a.richtig)} oder ${ESC(a.falsch)}?</p></div>`;
    if (schritt >= 2) {
      const pos = a.hilfswort.toLowerCase().indexOf(a.hb);
      const hw = pos >= 0 ? `${ESC(a.hilfswort.slice(0, pos))}<span class="wf-beweis">${ESC(a.hilfswort.slice(pos, pos + a.hb.length))}</span>${ESC(a.hilfswort.slice(pos + a.hb.length))}` : ESC(a.hilfswort);
      h += `<div class="wf-bruecke"><span class="wf-hilfswort">${hw}</span><span class="wf-pfeil">→</span>
        <span class="wf-ziel">${ESC(a.vorne)}<span class="wf-beweis">${schritt === 3 ? ESC(a.richtig) : '?'}</span>${ESC(a.hinten)}</span></div>
        <p class="sh-erkl">${istAbleiten() ? (a.hb === 'e' || a.hb === 'eu' ? `In der Wortfamilie gibt es kein Wort mit ${a.hb === 'e' ? 'a' : 'au'} – also bleibt es bei <b>${a.richtig}</b>.` : `Im verwandten Wort steht <b>${a.hb}</b> – darum schreibt man <b>${a.richtig}</b>.`) : `Verlängert hörst du es deutlich: <b>${ESC(a.hilfswort)}</b> – also <b>${a.richtig}</b>.`}</p>`;
    }
    if (schritt === 3) h += `<h3 class="eh-zwischen">Die Wortfamilie – der Stamm bleibt gleich</h3><div class="wf-familie">${a.familie.map(w => `<span class="wf-fw">${stammHtml(w, stamm())}</span>`).join('')}</div>`;
    return h;
  }
  function rechts() {
    let h = `<h2 class="bereich-titel">${istAbleiten() ? 'Ableiten' : 'Verlängern'}</h2>`;
    h += `<p class="vz-schritt${schritt > 1 ? ' fertig' : ''}">1. ${istAbleiten() ? 'Welches verwandte Wort hilft dir?' : 'Welche Verlängerung hilft dir?'}${schritt > 1 ? ' ✓' : ''}</p>
      <div class="wf-optionen">${optionen.map(o => `<button type="button" class="kn-gross${hilfe === o ? (o === a.hilfswort ? ' richtig' : ' falsch') : ''}" data-hilfe="${ESC(o)}" ${schritt > 1 ? 'disabled' : ''}>${ESC(o)}</button>`).join('')}</div>`;
    if (schritt >= 2) {
      h += `<p class="vz-schritt${schritt > 2 ? ' fertig' : ''}">2. Welcher Buchstabe gehört in die Lücke?</p>
        <div class="gs-pruef">${[a.richtig, a.falsch].sort().map(o => `<button type="button" class="kn-gross sh-opt${wahlB === o ? (o === a.richtig ? ' richtig' : ' falsch') : ''}" data-buchst="${ESC(o)}" ${schritt > 2 ? 'disabled' : ''}>${ESC(o)}</button>`).join('')}</div>`;
    }
    return h + antwortHtml(bewertung);
  }
  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  root.addEventListener('click', e => {
    const hf = e.target.closest('[data-hilfe]');
    if (hf && schritt === 1) {
      hilfe = hf.dataset.hilfe;
      if (hilfe === a.hilfswort) { schritt = 2; bewertung = null; g.sprich(istAbleiten() ? 'Genau – dieses Wort gehört zur selben Wortfamilie.' : 'Genau – verlängert hört man den Laut am Ende deutlich.'); }
      else bewertung = { ok: false, text: istAbleiten() ? `„${hilfe}“ klingt ähnlich, gehört aber nicht zur Wortfamilie von „${a.wort}“.` : `„${hilfe}“ ist keine Verlängerung von „${a.vorne}${a.richtig}“. Bilde die Mehrzahl.` };
      zeichne(); return;
    }
    const bu = e.target.closest('[data-buchst]');
    if (bu && schritt === 2) {
      wahlB = bu.dataset.buchst;
      if (wahlB === a.richtig) { schritt = 3; bewertung = { ok: true, text: `Richtig: ${a.wort}` }; g.sprich(istAbleiten() ? 'Wörter einer Familie schreibt man im Stamm gleich.' : 'Am Wortende klingt d wie t, b wie p, g wie k – verlängern hilft!', 'fertig'); }
      else bewertung = { ok: false, text: `Schau auf das Hilfswort „${a.hilfswort}“.` };
      zeichne(); return;
    }
    const b = e.target.closest('[data-wf]');
    if (!b) return;
    if (b.dataset.wf === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.wf === 'tipp') g.sprich(istAbleiten() ? 'Suche ein Wort aus derselben Familie, in dem statt ä ein a (statt äu ein au) steht.' : 'Bilde die Mehrzahl oder hänge eine Endung an – dann hörst du den letzten Laut deutlich.', 'tipp');
  });

  function start() { g.sprich('Nicht raten – beweisen! Ein verwandtes Wort oder die Verlängerung zeigt, wie man schreibt.'); }
  neu(); zeichne(); start();
}
