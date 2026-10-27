/* Deutsch: Doppelte Mitlaute mit dem Silbenhaus (Klasse 5/6, Förderung).
   Zweisilbige Wörter: Die betonte Silbe wohnt im Haus (Zimmer: Anfangslaut, Vokal, Schlusslaut), die zweite Silbe
   in der Garage. Ist der Vokal kurz, ist das Haus „zu“: Der Schlusslaut-Platz ist besetzt – und derselbe Laut
   steht auch am Anfang der Garage. Darum schreibt man ihn doppelt (Mut-ter). Ist der Vokal lang, bleibt das Haus offen (Hü-te).
   Statt kk schreibt man ck, statt zz schreibt man tz. */

import { geruest, wahl, antwortHtml, ESC } from './geruest.js';

/* [Anfang, Vokal, Mitlaut, Rest der Garage, kurz?, doppelte Schreibung, Hinweis] */
export const WOERTER = [
  ['M', 'u', 't', 'er', true, 'tt', 'Die Frau, die Kinder hat.'],
  ['B', 'u', 't', 'er', true, 'tt', 'Das streicht man aufs Brot.'],
  ['P', 'u', 'p', 'e', true, 'pp', 'Ein Spielzeug, das wie ein kleiner Mensch aussieht.'],
  ['S', 'u', 'p', 'e', true, 'pp', 'Man isst sie mit dem Löffel.'],
  ['T', 'a', 's', 'e', true, 'ss', 'Daraus trinkt man Kakao.'],
  ['W', 'a', 's', 'er', true, 'ss', 'Es kommt aus dem Wasserhahn.'],
  ['S', 'o', 'n', 'e', true, 'nn', 'Sie scheint am Himmel.'],
  ['K', 'a', 'n', 'e', true, 'nn', 'Daraus gießt man Tee.'],
  ['H', 'ü', 't', 'e', true, 'tt', 'Ein kleines Haus aus Holz im Wald.'],
  ['M', 'i', 't', 'e', true, 'tt', 'Nicht links, nicht rechts, sondern in der …'],
  ['W', 'o', 'l', 'e', true, 'll', 'Daraus strickt man Pullover.'],
  ['T', 'e', 'l', 'er', true, 'll', 'Darauf liegt das Essen.'],
  ['K', 'e', 'l', 'er', true, 'll', 'Ein Raum unter dem Haus.'],
  ['H', 'i', 'm', 'el', true, 'mm', 'Dort oben sind die Wolken.'],
  ['Z', 'i', 'm', 'er', true, 'mm', 'Ein Raum in der Wohnung.'],
  ['R', 'o', 'b', 'e', true, 'bb', 'Ein Meerestier mit Flossen, das auf dem Eis liegt.'],
  ['J', 'a', 'k', 'e', true, 'ck', 'Die zieht man an, wenn es kalt ist.'],
  ['K', 'a', 'z', 'e', true, 'tz', 'Ein Haustier, das miaut.'],
  ['H', 'e', 'k', 'e', true, 'ck', 'Viele Sträucher in einer Reihe am Gartenrand.'],
  ['Pf', 'ü', 'z', 'e', true, 'tz', 'Nach dem Regen steht Wasser auf dem Weg.'],
  ['H', 'ü', 't', 'e', false, 'tt', 'Mehrere Kopfbedeckungen: ein Hut, zwei …'],
  ['O', '', 'f', 'en', false, 'ff', 'Darin backt man Brot. (Der erste Laut ist ein langes O.)'],
  ['R', 'o', 's', 'e', false, 'ss', 'Eine Blume mit Dornen.'],
  ['N', 'a', 's', 'e', false, 'ss', 'Damit riecht man.'],
  ['H', 'a', 's', 'e', false, 'ss', 'Ein Tier mit langen Ohren.'],
  ['T', 'ü', 't', 'e', false, 'tt', 'Darin trägt man den Einkauf.'],
  ['Bl', 'u', 'm', 'e', false, 'mm', 'Sie wächst auf der Wiese und blüht.'],
  ['Sch', 'u', 'l', 'e', false, 'll', 'Dort lernst du jeden Tag.'],
  ['R', 'a', 'b', 'e', false, 'bb', 'Ein schwarzer Vogel.'],
  ['H', 'o', 's', 'e', false, 'ss', 'Ein Kleidungsstück für die Beine.'],
  ['L', 'u', 'p', 'e', false, 'pp', 'Damit sieht man Kleines groß.'],
  ['T', 'a', 'f', 'el', false, 'ff', 'Darauf schreibt die Lehrerin.'],
  ['H', 'a', 'k', 'en', false, 'ck', 'Daran hängt man die Jacke auf.'],
  ['Br', 'e', 'z', 'el', false, 'tz', 'Ein Gebäck mit Salz, geformt wie ein Knoten.'],
];

export function starteSilbenhaus(root) {
  let w, schritt, laenge, schreibung, bewertung = null, letzte = null;

  const g = geruest(root, {
    etikett: 'Rechtschreibung', titel: 'Doppelte Mitlaute – das Silbenhaus',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-sh="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-sh="neu">＋ Neues Wort</button>`,
  });

  function neu() {
    let x; do { x = wahl(WOERTER); } while (x === letzte);
    letzte = x;
    const [anf, vok, ml, rest, kurz, dopp, hinweis] = x;
    // „Ofen“: der Vokal ist der Anfang selbst
    w = { anf: vok ? anf : '', vok: vok || anf, ml, rest, kurz, dopp, hinweis };
    w.wort = w.anf + w.vok + (kurz ? dopp : ml) + rest;
    schritt = 1; laenge = null; schreibung = null; bewertung = null;
  }
  const luecke = () => `${w.anf}${w.vok}<span class="sh-luecke">${schritt === 3 ? (w.kurz ? w.dopp : w.ml) : '_'}</span>${w.rest}`;

  function hausSvg() {
    const zeig = schritt >= 2;
    const zu = zeig && w.kurz;
    const sl = zu ? (w.dopp === 'ck' ? 'k' : w.dopp === 'tz' ? 't' : w.ml) : '';
    const garageAnf = w.dopp === 'ck' && w.kurz && zeig ? 'k' : w.dopp === 'tz' && w.kurz && zeig ? 'z' : w.ml;
    const zimmer = (x, txt, kl) => `<rect x="${x}" y="120" width="70" height="70" rx="8" class="sh-zimmer ${kl}"/><text x="${x + 35}" y="168" class="sh-buchst ${kl}">${ESC(txt)}</text>`;
    return `<svg class="sh-svg" viewBox="0 0 520 240" role="img" aria-label="Silbenhaus">
      <path d="M20 110 L130 30 L240 110 Z" class="sh-dach"/>
      <rect x="20" y="110" width="220" height="90" class="sh-haus"/>
      ${zimmer(30, w.anf, 'anf')}${zimmer(105, w.vok + (zeig ? (w.kurz ? '•' : '–') : ''), 'vok' + (zeig ? (w.kurz ? ' kurz' : ' lang') : ''))}${zimmer(180, zeig ? sl : '', 'sl' + (zu ? ' besetzt' : zeig ? ' offen' : ''))}
      <path d="M${zu ? 240 : 290} 140 L${zu ? 240 : 290} 200 L${zu ? 500 : 500} 200 L500 140 Z" class="sh-garage"/>
      <rect x="${zu ? 240 : 290}" y="128" width="${zu ? 260 : 210}" height="14" class="sh-garagedach"/>
      <text x="${zu ? 290 : 330}" y="186" class="sh-buchst g ${zu ? 'doppel' : ''}">${ESC(zeig ? garageAnf : '?')}</text>
      <text x="${zu ? 370 : 410}" y="186" class="sh-buchst g">${ESC(w.rest)}</text>
      <text x="65" y="225" class="sh-lab">Anfang</text><text x="140" y="225" class="sh-lab">Vokal</text><text x="215" y="225" class="sh-lab">Schluss</text><text x="${zu ? 370 : 395}" y="225" class="sh-lab">Garage: 2. Silbe</text>
      ${zeig && !w.kurz ? '<text x="265" y="170" class="sh-luft">↔</text>' : ''}</svg>`;
  }
  function links() {
    let h = `<div class="sh-buehne">${hausSvg()}</div>`;
    if (schritt >= 2) h += w.kurz
      ? `<p class="sh-erkl"><b>Kurzer Vokal:</b> Das Haus ist zu – im Schluss-Zimmer wohnt ein Mitlaut. Derselbe Laut steht auch am Anfang der Garage. Darum schreibt man ihn <b>doppelt</b>.${w.dopp === 'ck' ? ' Statt <b>kk</b> schreibt man <b>ck</b>.' : w.dopp === 'tz' ? ' Statt <b>zz</b> schreibt man <b>tz</b>.' : ''}</p>`
      : `<p class="sh-erkl"><b>Langer Vokal:</b> Das Haus bleibt offen – das Schluss-Zimmer ist leer. Der Mitlaut steht nur einmal, am Anfang der Garage.</p>`;
    return h;
  }
  function rechts() {
    let h = `<h2 class="bereich-titel">Welches Wort ist gemeint?</h2><p class="tl-geschichte">${ESC(w.hinweis)}</p><p class="rr-gross sh-wort">${luecke()}</p>`;
    h += `<p class="vz-schritt${schritt > 1 ? ' fertig' : ''}">1. Sprich das Wort deutlich: Ist der Vokal „${ESC(w.vok)}“ lang oder kurz?${schritt > 1 ? ` ✓ ${w.kurz ? 'kurz' : 'lang'}` : ''}</p>`;
    if (schritt === 1) h += `<div class="gs-pruef"><button type="button" class="kn-gross" data-laenge="lang">lang (– wie in Ho-se)</button><button type="button" class="kn-gross" data-laenge="kurz">kurz (• wie in Tas-se)</button></div>`;
    if (schritt >= 2) {
      h += `<p class="vz-schritt${schritt > 2 ? ' fertig' : ''}">2. Welche Schreibung passt in die Lücke?</p>`;
      const opt = [w.ml, w.dopp];
      h += `<div class="gs-pruef">${opt.map(o => `<button type="button" class="kn-gross sh-opt${schreibung === o ? (o === (w.kurz ? w.dopp : w.ml) ? ' richtig' : ' falsch') : ''}" data-schreib="${ESC(o)}" ${schritt > 2 ? 'disabled' : ''}>${ESC(o)}</button>`).join('')}</div>`;
    }
    if (schritt === 3) h += `<p class="fl-formel">${ESC(w.wort)}: ${ESC(w.anf + w.vok + (w.kurz ? (w.dopp === 'ck' ? 'c' : w.dopp === 'tz' ? 't' : w.ml) : ''))} | ${ESC((w.kurz ? (w.dopp === 'ck' ? 'k' : w.dopp === 'tz' ? 'z' : w.ml) : w.ml) + w.rest)}</p>`;
    return h + antwortHtml(bewertung);
  }
  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  root.addEventListener('click', e => {
    const l = e.target.closest('[data-laenge]');
    if (l && schritt === 1) {
      laenge = l.dataset.laenge;
      if ((laenge === 'kurz') === w.kurz) { schritt = 2; bewertung = null; g.sprich(w.kurz ? 'Kurz! Schau, was im Haus passiert.' : 'Lang! Schau, was im Haus passiert.'); }
      else bewertung = { ok: false, text: `Sprich noch einmal langsam: ${w.wort.replace(w.kurz ? w.dopp : w.ml, w.kurz ? w.dopp.replace('ck', 'c-k').replace('tz', 't-z').replace(/^(.)\1$/, '$1-$1') : '-' + w.ml)}. Klingt das „${w.vok}“ ${w.kurz ? 'kurz und schnell' : 'lang gezogen'}?` };
      zeichne(); return;
    }
    const s = e.target.closest('[data-schreib]');
    if (s && schritt === 2) {
      schreibung = s.dataset.schreib;
      const soll = w.kurz ? w.dopp : w.ml;
      if (schreibung === soll) { schritt = 3; bewertung = { ok: true, text: `Richtig: ${w.wort}` }; g.sprich(w.kurz ? 'Kurzer Vokal – Haus zu – Mitlaut doppelt.' : 'Langer Vokal – Haus offen – Mitlaut einfach.', 'fertig'); }
      else bewertung = { ok: false, text: w.kurz ? 'Das Haus ist zu: Der Mitlaut steht im Haus UND in der Garage.' : 'Das Haus ist offen: Der Mitlaut steht nur einmal.' };
      zeichne(); return;
    }
    const b = e.target.closest('[data-sh]');
    if (!b) return;
    if (b.dataset.sh === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.sh === 'tipp') g.sprich(schritt === 1 ? 'Klatsche die Silben und sprich das Wort langsam. Ein kurzer Vokal klingt wie in „Mut-ter“, ein langer wie in „Hu-pe“.' : 'Schau ins Haus: Ist das Schluss-Zimmer besetzt?', 'tipp');
  });

  function start() { g.sprich('Erst hören, ob der Vokal lang oder kurz ist – dann weiß das Silbenhaus, wie man schreibt.'); }
  neu(); zeichne(); start();
}
