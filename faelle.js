/* Deutsch: Die vier Fälle als vier Türen (Klasse 5/6).
   Jede Tür hat ihr Fragewort: Wer oder was? (Nominativ) · Wessen? (Genitiv) · Wem? (Dativ) · Wen oder was? (Akkusativ).
   „Durch die Türen“: Ein Nomen geht durch jede Tür und „zieht sich um“: Der Begleiter (und manchmal die Endung) ändert sich.
     Wortkarte antippen, dann die Tür, durch die sie gehört. Hinter der Tür steht ein Beispielsatz.
   „Welche Tür?“: Im Satz ist ein Satzteil markiert. Die Tür mit der passenden Frage antippen – die Frage wird gezeigt.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, ESC } from './geruest.js';

const TUEREN = [
  { id: 'N', frage: 'Wer oder was?', name: 'Nominativ', nr: 1, farbe: '#1f5fd1', satz: (f, mz) => `${f[0].toUpperCase() + f.slice(1)} ${mz ? 'sind' : 'ist'} auf dem Bild.`, satzFrage: 'Wer oder was ist auf dem Bild?' },
  { id: 'G', frage: 'Wessen?', name: 'Genitiv', nr: 2, farbe: '#8e44c9', satz: f => `Das ist die Farbe ${f}.`, satzFrage: 'Wessen Farbe ist das?' },
  { id: 'D', frage: 'Wem?', name: 'Dativ', nr: 3, farbe: '#e8a317', satz: f => `Ich gebe ${f} einen Namen.`, satzFrage: 'Wem gebe ich einen Namen?' },
  { id: 'A', frage: 'Wen oder was?', name: 'Akkusativ', nr: 4, farbe: '#2a9d5c', satz: f => `Ich male ${f}.`, satzFrage: 'Wen oder was male ich?' },
];

const NOMEN = [
  { N: 'der Hund', G: 'des Hundes', D: 'dem Hund', A: 'den Hund' },
  { N: 'die Katze', G: 'der Katze', D: 'der Katze', A: 'die Katze' },
  { N: 'das Pferd', G: 'des Pferdes', D: 'dem Pferd', A: 'das Pferd' },
  { N: 'der Junge', G: 'des Jungen', D: 'dem Jungen', A: 'den Jungen' },
  { N: 'die Blume', G: 'der Blume', D: 'der Blume', A: 'die Blume' },
  { N: 'das Auto', G: 'des Autos', D: 'dem Auto', A: 'das Auto' },
  { N: 'der Lehrer', G: 'des Lehrers', D: 'dem Lehrer', A: 'den Lehrer' },
  { N: 'die Kinder', G: 'der Kinder', D: 'den Kindern', A: 'die Kinder', mehrzahl: true },
  { N: 'das Buch', G: 'des Buches', D: 'dem Buch', A: 'das Buch' },
  { N: 'der Tisch', G: 'des Tisches', D: 'dem Tisch', A: 'den Tisch' },
];

/* [vor, markiert, nach, Fall, Frage] */
const SAETZE = [
  ['', 'Der Hund', 'bellt laut.', 'N', 'Wer bellt laut?'],
  ['Lea streichelt', 'den Hund', '.', 'A', 'Wen streichelt Lea?'],
  ['Lea gibt', 'dem Hund', 'einen Knochen.', 'D', 'Wem gibt Lea einen Knochen?'],
  ['Das ist der Napf', 'des Hundes', '.', 'G', 'Wessen Napf ist das?'],
  ['', 'Die Lehrerin', 'erklärt die Aufgabe.', 'N', 'Wer erklärt die Aufgabe?'],
  ['Die Lehrerin erklärt', 'die Aufgabe', '.', 'A', 'Was erklärt die Lehrerin?'],
  ['Tom hilft', 'seiner Schwester', '.', 'D', 'Wem hilft Tom?'],
  ['Das ist das Fahrrad', 'meines Bruders', '.', 'G', 'Wessen Fahrrad ist das?'],
  ['Wir besuchen', 'den Zoo', '.', 'A', 'Wen oder was besuchen wir?'],
  ['', 'Der Ball', 'rollt ins Tor.', 'N', 'Was rollt ins Tor?'],
  ['Mia schenkt', 'ihrer Oma', 'eine Blume.', 'D', 'Wem schenkt Mia eine Blume?'],
  ['Mia schenkt ihrer Oma', 'eine Blume', '.', 'A', 'Was schenkt Mia ihrer Oma?'],
  ['Die Farbe', 'des Autos', 'ist rot.', 'G', 'Wessen Farbe ist rot?'],
  ['Der Ball gehört', 'dem Jungen', '.', 'D', 'Wem gehört der Ball?'],
  ['', 'Die Kinder', 'spielen Fangen.', 'N', 'Wer spielt Fangen?'],
  ['Wir warten auf', 'den Bus', '.', 'A', 'Auf wen oder was warten wir?'],
];

const STIL = `
.fa-flur { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin: .4rem 0 1rem; }
.fa-tuer { display: flex; flex-direction: column; align-items: stretch; gap: .3rem; background: none; border: 0; padding: 0; cursor: pointer; font: inherit; color: inherit; text-align: center; }
.fa-schild { font: 800 1.05rem/1.15 var(--titel); color: #fff; background: var(--f); border-radius: 10px; padding: .35rem .2rem; }
.fa-rahmen { position: relative; height: 9.5rem; border: 6px solid #8b6b4a; border-bottom-width: 3px; border-radius: 10px 10px 0 0; background: var(--flaeche);
  perspective: 600px; display: grid; place-items: center; padding: .3rem; }
.fa-blatt { position: absolute; inset: 0; background: linear-gradient(135deg, var(--f), color-mix(in srgb, var(--f) 70%, #000)); border-radius: 4px 4px 0 0;
  transform-origin: left center; transition: transform .7s cubic-bezier(.4,0,.2,1); }
.fa-blatt::after { content: ''; position: absolute; right: 12%; top: 52%; width: 12px; height: 12px; border-radius: 50%; background: #ffd34d; box-shadow: 0 0 0 2px rgba(0,0,0,.2); }
.fa-tuer.offen .fa-blatt { transform: rotateY(-78deg); }
.fa-tuer.offen .fa-inhalt { padding-left: 1rem; }
.fa-inhalt { font: 800 1.2rem/1.2 var(--schrift); }
.fa-inhalt small { display: block; font: 600 .82rem/1.25 var(--schrift); color: var(--leise); margin-top: .35rem; }
.fa-name { font: 700 .9rem var(--schrift); color: var(--leise); }
.fa-tuer.an .fa-rahmen { box-shadow: 0 0 0 4px var(--akzent); }
.fa-tuer.falsch .fa-rahmen { animation: wackeln .35s; box-shadow: 0 0 0 4px var(--schlecht); }
.fa-karten { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; min-height: 3.4rem; }
.fa-karte { font: 800 1.2rem var(--schrift); padding: .55rem .9rem; border-radius: 12px; border: 3px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; box-shadow: 0 3px 0 var(--rand); }
.fa-karte.gewaehlt { border-color: var(--akzent); transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,.18); }
.fa-satz { font: 700 1.4rem/1.6 var(--schrift); background: var(--flaeche); border: 2px solid var(--rand); border-radius: 12px; padding: .7rem .9rem; margin-bottom: .8rem; }
.fa-satz mark { background: #ffe58a; color: #3a2c00; border-radius: 6px; padding: 0 .25rem; }
.fa-frage { font: 800 1.3rem/1.4 var(--titel); color: var(--akzent); }
@media (max-width: 640px) { .fa-flur { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;

export function starteFaelle(root) {
  if (!document.getElementById('fa-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="fa-stil">${STIL}</style>`);
  let modus = 'tueren', nListe = mischen(NOMEN), sListe = mischen(SAETZE), ni = 0, si = 0, n, karten, offen, gewaehlt, falschTuer, s, sGeloest, meldung;

  const g = geruest(root, {
    etikett: 'Sätze und Wörter', titel: '',
    reiter: [{ id: 'tueren', titel: 'Durch die Türen', unter: 'Das Nomen zieht sich um' }, { id: 'welche', titel: 'Welche Tür?', unter: 'Fall im Satz bestimmen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-fa="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-fa="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    meldung = null; falschTuer = null; gewaehlt = null;
    if (modus === 'tueren') {
      n = nListe[ni++ % nListe.length];
      offen = {};
      karten = mischen(TUEREN.map(t => ({ id: t.id, text: n[t.id] })));
    } else { s = sListe[si++ % sListe.length]; sGeloest = false; }
  }

  function tuer(t) {
    const istOffen = modus === 'tueren' ? !!offen[t.id] : sGeloest && s[3] === t.id;
    let inhalt = '';
    if (modus === 'tueren' && istOffen) inhalt = `${ESC(n[t.id])}<small>${ESC(t.satz(n[t.id], n.mehrzahl))}</small>`;
    if (modus === 'welche' && istOffen) inhalt = `${ESC(s[1])}<small>${ESC(t.name)}</small>`;
    const kl = (istOffen ? ' offen' : '') + (falschTuer === t.id ? ' falsch' : '') + (modus === 'tueren' && gewaehlt && !istOffen ? ' an' : '');
    return `<button type="button" class="fa-tuer${kl}" data-tuer="${t.id}" style="--f:${t.farbe}" aria-label="${t.frage} ${t.name}">
      <span class="fa-schild">${ESC(t.frage)}</span>
      <span class="fa-rahmen"><span class="fa-inhalt">${inhalt}</span><span class="fa-blatt"></span></span>
      <span class="fa-name">${t.nr}. Fall · ${t.name}</span></button>`;
  }

  function links() {
    let h = `<div class="fa-flur">${TUEREN.map(tuer).join('')}</div>`;
    if (modus === 'tueren') {
      const rest = karten.filter(k => !k.weg);
      h += `<h3 class="eh-zwischen">${ESC(n.N)}${n.mehrzahl ? ' (Mehrzahl)' : ''} – welche Form gehört hinter welche Tür?</h3>
        <div class="fa-karten">${rest.map((k, i) => `<button type="button" class="fa-karte${gewaehlt === k ? ' gewaehlt' : ''}" data-karte="${karten.indexOf(k)}">${ESC(k.text)}</button>`).join('') || '<span class="leise">Alle Türen sind offen.</span>'}</div>`;
      void rest;
    } else {
      h = `<p class="fa-satz">${ESC(s[0])} <mark>${ESC(s[1])}</mark>${s[2] === '.' ? '.' : ' ' + ESC(s[2])}</p>` + h;
      if (sGeloest) h += `<p class="fa-frage">${ESC(s[4])} – ${ESC(s[1])}.</p>`;
    }
    return h;
  }

  function rechts() {
    let h = '<h2 class="bereich-titel">Vier Türen, vier Fragen</h2>';
    if (modus === 'tueren') {
      h += '<p>Tippe eine Wortkarte an und dann die Tür, zu deren Frage sie passt. Hinter der Tür siehst du einen Satz mit dem Nomen.</p>';
      h += `<ul class="sg-merke">${TUEREN.map(t => `<li><b style="color:${t.farbe}">${ESC(t.frage)}</b> ${ESC(t.name)}</li>`).join('')}</ul>`;
      if (Object.keys(offen).length === 4) h += `<p class="tb-antwort gut">Alle Türen offen! Der Begleiter zeigt dir den Fall: ${TUEREN.map(t => `<b>${ESC(n[t.id])}</b>`).join(' · ')}</p>`;
    } else {
      h += '<p>Stelle die Frage nach dem gelben Satzteil. Mit welchem Fragewort klappt es? Tippe die Tür an.</p>';
      if (sGeloest) h += `<p class="tb-antwort gut">Richtig: „${ESC(s[1])}“ steht im ${TUEREN.find(t => t.id === s[3]).name}.</p>`;
    }
    h += '<p class="leise">Beim Genitiv bekommt das Nomen oft ein <b>-s</b> oder <b>-es</b> am Ende.</p>';
    if (meldung) h += `<p class="tb-antwort schlecht">${meldung}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'tueren' ? 'Die vier Fälle: Durch die Türen' : 'Die vier Fälle: Welche Tür?');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  /* Tür erst geschlossen zeichnen, dann öffnen – damit die Tür sichtbar aufschwingt */
  async function oeffne(id) {
    zeichne();
    const el = root.querySelector(`[data-tuer="${id}"]`);
    el?.classList.remove('offen');
    void el?.offsetWidth;
    el?.classList.add('offen');
  }

  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const k = e.target.closest('[data-karte]');
    if (k && modus === 'tueren') { const c = karten[Number(k.dataset.karte)]; gewaehlt = gewaehlt === c ? null : c; meldung = null; falschTuer = null; zeichne(); return; }
    const t = e.target.closest('[data-tuer]');
    if (t) {
      const id = t.dataset.tuer, tu = TUEREN.find(x => x.id === id);
      if (modus === 'tueren') {
        if (offen[id]) return;
        if (!gewaehlt) { g.sprich('Tippe zuerst eine Wortkarte an.', 'tipp'); return; }
        if (gewaehlt.text === n[id]) {
          offen[id] = true; gewaehlt.weg = true; gewaehlt = null; meldung = null; falschTuer = null;
          await oeffne(id);
          if (Object.keys(offen).length === 4) g.sprich(`${n.N[0].toUpperCase() + n.N.slice(1)} ist durch alle vier Türen gegangen. Achte darauf, wie sich der Begleiter verändert hat.`, 'fertig');
          else g.sprich(`${tu.satzFrage} – ${tu.satz(n[id], n.mehrzahl)}`);
        } else { falschTuer = id; meldung = `Setze ein: „${ESC(tu.satz(gewaehlt.text, n.mehrzahl))}“ – klingt das richtig?`; zeichne(); }
      } else if (!sGeloest) {
        if (id === s[3]) { sGeloest = true; meldung = null; falschTuer = null; await oeffne(id); g.sprich(`${s[4]} – ${s[1]}. Das ist der ${tu.name}.`, 'fertig'); }
        else { falschTuer = id; meldung = `Frag mit „${ESC(tu.frage)}“. Ist „${ESC(s[1])}“ eine passende Antwort? Probiere eine andere Tür.`; zeichne(); }
      }
      return;
    }
    const b = e.target.closest('[data-fa]');
    if (!b) return;
    if (b.dataset.fa === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.fa === 'tipp') g.sprich(modus === 'tueren' ? 'Setze die Wortkarte in den Satz hinter der Tür ein und lies ihn laut. Klingt er richtig?' : 'Ersetze den gelben Satzteil durch das Fragewort und stelle die Frage. Klingt sie richtig?', 'tipp');
  });

  function start() { g.sprich(modus === 'tueren' ? `${n.N[0].toUpperCase() + n.N.slice(1)} möchte durch alle vier Türen gehen. Hinter jeder Tür sieht es ein bisschen anders aus.` : 'Welche Frage passt zu dem gelben Satzteil?'); }

  neu(); zeichne(); start();
}
