/* Deutsch: Ober- und Unterbegriffe als Schrank mit Schubladen (Klasse 5).
   Der Schrank trägt den Oberbegriff (Tiere), jede Schublade einen Unterbegriff (Vögel, Fische, Säugetiere),
   in den Schubladen liegen die einzelnen Wörter (Amsel, Hai, Hund).
   „Einräumen“: Wortkarte antippen, dann die Schublade – sie geht auf und die Karte fällt hinein.
   „Beschriften“: Die Schubladen sind schon voll. Die Schilder für den Schrank und die Schubladen fehlen.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, flip, ESC } from './geruest.js';

const SCHRAENKE = [
  { ober: 'Tiere', laden: [['Vögel', ['Amsel', 'Meise', 'Adler']], ['Fische', ['Hai', 'Forelle', 'Karpfen']], ['Säugetiere', ['Hund', 'Katze', 'Pferd']]] },
  { ober: 'Lebensmittel', laden: [['Obst', ['Apfel', 'Birne', 'Kirsche']], ['Gemüse', ['Möhre', 'Gurke', 'Paprika']], ['Getränke', ['Saft', 'Milch', 'Tee']]] },
  { ober: 'Fahrzeuge', laden: [['Schienenfahrzeuge', ['Zug', 'Straßenbahn', 'U-Bahn']], ['Straßenfahrzeuge', ['Auto', 'Bus', 'Lkw']], ['Luftfahrzeuge', ['Flugzeug', 'Hubschrauber', 'Heißluftballon']]] },
  { ober: 'Kleidung', laden: [['Kopfbedeckungen', ['Mütze', 'Hut', 'Kappe']], ['Schuhe', ['Stiefel', 'Sandale', 'Turnschuh']], ['Oberteile', ['Pullover', 'Hemd', 'Bluse']]] },
  { ober: 'Musikinstrumente', laden: [['Saiteninstrumente', ['Gitarre', 'Geige', 'Harfe']], ['Blasinstrumente', ['Flöte', 'Trompete', 'Saxofon']], ['Schlaginstrumente', ['Trommel', 'Pauke', 'Becken']]] },
  { ober: 'Möbel', laden: [['Sitzmöbel', ['Stuhl', 'Sessel', 'Sofa']], ['Schränke', ['Kleiderschrank', 'Regal', 'Kommode']], ['Tische', ['Esstisch', 'Schreibtisch', 'Couchtisch']]] },
  { ober: 'Sportarten', laden: [['Ballsportarten', ['Fußball', 'Volleyball', 'Handball']], ['Wassersportarten', ['Schwimmen', 'Rudern', 'Segeln']], ['Wintersportarten', ['Skifahren', 'Rodeln', 'Eislaufen']]] },
];
const FALSCH_OBER = ['Dinge', 'Sachen', 'Natur', 'Haushalt', 'Freizeit', 'Schule'];

const STIL = `
.sk-schrank { max-width: 34rem; margin: .4rem auto 1rem; background: #b07b4a; border-radius: 14px; padding: .6rem .6rem .9rem; box-shadow: inset 0 0 0 4px #8b5e34, 0 8px 18px rgba(0,0,0,.15); }
.sk-oben { display: flex; justify-content: center; margin: -1.5rem 0 .6rem; }
.sk-schild { font: 800 1.25rem/1.1 var(--titel); background: #fff8e6; color: #3a2c00; border: 3px solid #8b5e34; border-radius: 10px; padding: .35rem 1rem; min-width: 9rem; text-align: center; }
.sk-schild.leer { color: var(--leise); border-style: dashed; cursor: pointer; background: #fff8e6; }
.sk-schild.an { box-shadow: 0 0 0 4px var(--akzent); }
.sk-schild.falsch { box-shadow: 0 0 0 4px var(--schlecht); animation: wackeln .35s; }
.sk-lade { display: block; width: 100%; background: none; border: 0; padding: 0; margin: .45rem 0; cursor: pointer; font: inherit; color: inherit; text-align: left; }
.sk-front { position: relative; display: flex; align-items: center; justify-content: space-between; gap: .5rem; background: linear-gradient(#d9a46c, #c48a52);
  border-radius: 8px; padding: .55rem .8rem; box-shadow: inset 0 0 0 3px #8b5e34; transition: transform .45s cubic-bezier(.4,0,.2,1); }
.sk-griff { width: 3.2rem; height: .7rem; border-radius: .35rem; background: #6b4423; flex: none; }
.sk-lade .sk-schild { font-size: 1rem; min-width: 7rem; padding: .25rem .6rem; }
.sk-inhalt { display: flex; flex-wrap: wrap; gap: .3rem; padding: .4rem .7rem 0; min-height: 0; }
.sk-ding { font: 700 1rem var(--schrift); background: var(--flaeche); color: var(--text); border-radius: 8px; padding: .2rem .5rem; border: 2px solid var(--rand); }
.sk-lade.auf .sk-front { transform: translateY(-2px); }
.sk-lade.auf .sk-inhalt { background: rgba(0,0,0,.12); border-radius: 0 0 8px 8px; padding-bottom: .4rem; }
.sk-lade.an .sk-front { box-shadow: inset 0 0 0 3px #8b5e34, 0 0 0 4px var(--akzent); }
.sk-lade.falsch .sk-front { animation: wackeln .35s; box-shadow: inset 0 0 0 3px #8b5e34, 0 0 0 4px var(--schlecht); }
.sk-karten { display: flex; flex-wrap: wrap; justify-content: center; gap: .45rem; min-height: 3.2rem; }
.sk-karte { font: 800 1.15rem var(--schrift); padding: .45rem .8rem; border-radius: 12px; border: 3px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; box-shadow: 0 3px 0 var(--rand); }
.sk-karte.gewaehlt { border-color: var(--akzent); transform: translateY(-3px); }
.sk-karte.schild { background: #fff8e6; color: #3a2c00; border-color: #c9a227; }
.sk-karte.schild.gewaehlt { border-color: var(--akzent); }
`;

export function starteOberbegriffe(root) {
  if (!document.getElementById('sk-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="sk-stil">${STIL}</style>`);
  let modus = 'einraeumen', liste = mischen(SCHRAENKE), idx = 0, sch, karten, inLade, gewaehlt, falsch, schilder, meldung;

  const g = geruest(root, {
    etikett: 'Wortschatz', titel: '',
    reiter: [{ id: 'einraeumen', titel: 'Einräumen', unter: 'Wörter in die Schubladen' }, { id: 'beschriften', titel: 'Beschriften', unter: 'Schilder anbringen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-sk="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-sk="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    sch = liste[idx++ % liste.length];
    meldung = null; gewaehlt = null; falsch = null;
    if (modus === 'einraeumen') {
      karten = mischen(sch.laden.flatMap(([, ws], l) => ws.map(w => ({ w, l }))));
      inLade = [[], [], []];
    } else {
      const fremd = mischen(SCHRAENKE.filter(x => x !== sch)).slice(0, 1).map(x => x.laden[0][0]);
      karten = mischen([sch.ober, ...sch.laden.map(l => l[0]), ...fremd, ...mischen(FALSCH_OBER).slice(0, 1)]).map(w => ({ w }));
      schilder = { ober: null, 0: null, 1: null, 2: null };
    }
  }

  const fertig = () => (modus === 'einraeumen' ? karten.every(k => k.drin) : Object.values(schilder).every(Boolean));

  function schild(ziel, text) {
    if (modus === 'einraeumen' || schilder[ziel]) return `<span class="sk-schild" data-id="s-${ESC(text)}">${ESC(text)}</span>`;
    const kl = (gewaehlt !== null ? ' an' : '') + (falsch === 'schild-' + ziel ? ' falsch' : '');
    return `<span class="sk-schild leer${kl}" data-schild="${ziel}">?</span>`;
  }

  function links() {
    const laden = sch.laden.map(([name, ws], l) => {
      const inhalt = modus === 'einraeumen' ? inLade[l] : ws;
      const kl = (inhalt.length ? ' auf' : '') + (modus === 'einraeumen' && gewaehlt !== null ? ' an' : '') + (falsch === 'lade-' + l ? ' falsch' : '');
      return `<div class="sk-lade${kl}" data-lade="${l}" role="button" tabindex="-1">
        <span class="sk-front">${schild(l, name)}<span class="sk-griff"></span></span>
        ${inhalt.length ? `<span class="sk-inhalt">${inhalt.map(w => `<span class="sk-ding" data-id="d-${ESC(w)}">${ESC(w)}</span>`).join('')}</span>` : ''}</div>`;
    }).join('');
    const rest = karten.map((k, i) => ({ k, i })).filter(x => !x.k.drin);
    const kartenHtml = rest.map(({ k, i }) => {
      const text = k.w;
      return `<button type="button" class="sk-karte${modus === 'beschriften' ? ' schild' : ''}${gewaehlt === i ? ' gewaehlt' : ''}" data-karte="${i}" data-id="${modus === 'einraeumen' ? 'd-' : 's-'}${ESC(text)}">${ESC(text)}</button>`;
    }).join('');
    return `<div class="sk-schrank"><div class="sk-oben">${schild('ober', sch.ober)}</div>${laden}</div>
      <div class="sk-karten">${kartenHtml}</div>`;
  }

  function rechts() {
    let h = `<h2 class="bereich-titel">Der Wörter-Schrank</h2>
      <p><b>Oberbegriff</b> = das Schild am Schrank. Er passt zu <b>allen</b> Wörtern im Schrank.</p>
      <p><b>Unterbegriffe</b> = die Schilder an den Schubladen. Sie sortieren genauer.</p>`;
    h += modus === 'einraeumen' ? '<p class="leise">Tippe ein Wort an und dann die passende Schublade.</p>' : '<p class="leise">Tippe ein Schild an und dann die Stelle, an die es gehört. Zwei Schilder bleiben übrig.</p>';
    if (fertig()) h += `<p class="tb-antwort gut">Alles aufgeräumt! ${ESC(sch.ober)}: ${sch.laden.map(l => ESC(l[0])).join(', ')}.</p>`;
    else if (meldung) h += `<p class="tb-antwort schlecht">${meldung}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'einraeumen' ? 'Ober- und Unterbegriffe: Einräumen' : 'Ober- und Unterbegriffe: Beschriften');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  async function ablegen(ziel) {
    if (gewaehlt === null) { g.sprich(modus === 'einraeumen' ? 'Tippe zuerst ein Wort an.' : 'Tippe zuerst ein Schild an.', 'tipp'); return; }
    const k = karten[gewaehlt];
    if (modus === 'einraeumen') {
      if (k.l === ziel) { k.drin = true; inLade[ziel].push(k.w); gewaehlt = null; falsch = null; meldung = null; await flip(root, zeichne, 450); }
      else { falsch = 'lade-' + ziel; meldung = `Gehört „${ESC(k.w)}“ zu den ${ESC(sch.laden[ziel][0])}? Probiere eine andere Schublade.`; zeichne(); }
    } else {
      const soll = ziel === 'ober' ? sch.ober : sch.laden[ziel][0];
      if (k.w === soll) { schilder[ziel] = true; k.drin = true; gewaehlt = null; falsch = null; meldung = null; await flip(root, zeichne, 450); }
      else {
        falsch = 'schild-' + ziel;
        meldung = ziel === 'ober' ? `Passt „${ESC(k.w)}“ zu allen Wörtern im Schrank – und ist es genau genug?` : `Passt „${ESC(k.w)}“ zu allen Wörtern in dieser Schublade?`;
        zeichne();
      }
    }
    if (fertig()) g.sprich('Der Schrank ist fertig! Oberbegriff oben, Unterbegriffe an den Schubladen.', 'fertig');
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const k = e.target.closest('[data-karte]');
    if (k) { const i = Number(k.dataset.karte); gewaehlt = gewaehlt === i ? null : i; falsch = null; meldung = null; zeichne(); return; }
    const s = e.target.closest('[data-schild]');
    if (s && modus === 'beschriften') { ablegen(s.dataset.schild === 'ober' ? 'ober' : Number(s.dataset.schild)); return; }
    const l = e.target.closest('[data-lade]');
    if (l && modus === 'einraeumen') { ablegen(Number(l.dataset.lade)); return; }
    const b = e.target.closest('[data-sk]');
    if (!b) return;
    if (b.dataset.sk === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.sk === 'tipp') g.sprich(modus === 'einraeumen' ? 'Frag dich bei jedem Wort: Was ist das für ein Ding oder Tier?' : 'Der Oberbegriff passt zu allen Wörtern. Ein Schubladenschild passt nur zu den drei Wörtern in dieser Schublade.', 'tipp');
  });

  function start() { g.sprich(modus === 'einraeumen' ? `Räum den Schrank „${sch.ober}“ auf: Jedes Wort kommt in die passende Schublade.` : 'Die Schubladen sind voll, aber die Schilder fehlen. Welches Schild gehört wohin?'); }

  neu(); zeichne(); start();
}
