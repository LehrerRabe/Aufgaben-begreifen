/* Deutsch: Zusammengesetzte Nomen als Puzzle (Klasse 5).
   Bestimmungswort + Grundwort = zusammengesetztes Nomen. Jedes Puzzleteil trägt seine Artikel-Fahne.
   „Zusammensetzen“: Die zwei Teile in die richtige Reihenfolge legen (das letzte Teil sagt, was es ist),
     dann den Artikel wählen – die Fahne des letzten Teils wandert nach vorn. Der Großbuchstabe des zweiten Teils wird klein.
   „Zerlegen“: Ein langes Wort an der richtigen Stelle durchschneiden, dann das Teil antippen, das den Artikel bestimmt.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, flip, ESC } from './geruest.js';

/* b Bestimmungswort, ba Artikel, f Fugenlaut, gr Grundwort, ga Artikel, was Erklärung */
const WOERTER = [
  { b: 'Haus', ba: 'das', f: '', gr: 'Tür', ga: 'die', was: 'eine Tür am Haus' },
  { b: 'Hand', ba: 'die', f: '', gr: 'Schuh', ga: 'der', was: 'ein Schuh für die Hand' },
  { b: 'Fenster', ba: 'das', f: '', gr: 'Bank', ga: 'die', was: 'eine Bank am Fenster' },
  { b: 'Glas', ba: 'das', f: '', gr: 'Flasche', ga: 'die', was: 'eine Flasche aus Glas' },
  { b: 'Tasche', ba: 'die', f: 'n', gr: 'Messer', ga: 'das', was: 'ein Messer für die Tasche' },
  { b: 'Garten', ba: 'der', f: '', gr: 'Haus', ga: 'das', was: 'ein Haus im Garten' },
  { b: 'Auto', ba: 'das', f: '', gr: 'Bahn', ga: 'die', was: 'eine Bahn für Autos' },
  { b: 'Regen', ba: 'der', f: '', gr: 'Jacke', ga: 'die', was: 'eine Jacke für den Regen' },
  { b: 'Hand', ba: 'die', f: '', gr: 'Tuch', ga: 'das', was: 'ein Tuch für die Hände' },
  { b: 'Wasser', ba: 'das', f: '', gr: 'Flasche', ga: 'die', was: 'eine Flasche für Wasser' },
  { b: 'Baum', ba: 'der', f: '', gr: 'Haus', ga: 'das', was: 'ein Haus im Baum' },
  { b: 'Blume', ba: 'die', f: 'n', gr: 'Topf', ga: 'der', was: 'ein Topf für Blumen' },
  { b: 'Tisch', ba: 'der', f: '', gr: 'Decke', ga: 'die', was: 'eine Decke für den Tisch' },
  { b: 'Brot', ba: 'das', f: '', gr: 'Dose', ga: 'die', was: 'eine Dose für Brot' },
  { b: 'Sonne', ba: 'die', f: 'n', gr: 'Schirm', ga: 'der', was: 'ein Schirm gegen die Sonne' },
  { b: 'Nacht', ba: 'die', f: '', gr: 'Hemd', ga: 'das', was: 'ein Hemd für die Nacht' },
  { b: 'Geburt', ba: 'die', f: 's', gr: 'Tag', ga: 'der', was: 'der Tag, an dem man geboren wurde' },
  { b: 'Schnee', ba: 'der', f: '', gr: 'Ball', ga: 'der', was: 'ein Ball aus Schnee' },
];

const klein = s => s[0].toLowerCase() + s.slice(1);
const ganz = w => w.b + w.f + klein(w.gr);
const FARBE = { der: '#1f5fd1', die: '#d7263d', das: '#2a9d5c' };

const STIL = `
.kp-was { font: 700 1.25rem/1.4 var(--schrift); background: var(--info-sanft); border-radius: 12px; padding: .6rem .9rem; margin: 0 0 1rem; }
.kp-tisch { display: flex; flex-wrap: wrap; gap: 1.2rem 1.6rem; justify-content: center; min-height: 6.5rem; padding: 1.6rem .5rem .6rem; }
.kp-plaetze { display: flex; justify-content: center; align-items: flex-end; min-height: 7rem; padding: 1.8rem .5rem .6rem; border: 3px dashed var(--rand); border-radius: 16px; margin-bottom: .6rem; gap: 0; }
.kp-platz { min-width: 8rem; height: 4rem; border-radius: 12px; display: grid; place-items: center; color: var(--leise); font-weight: 700; }
.kp-teil { position: relative; font: 800 1.6rem/1 var(--titel); padding: 1rem 1.4rem; background: #ffd34d; color: #3a2c00; border: 0; border-radius: 12px; cursor: pointer;
  box-shadow: 0 4px 0 #c9a227; }
.kp-teil.grund { background: #9ad1ff; color: #0d2a52; box-shadow: 0 4px 0 #5d9bd6; }
.kp-teil.fuge { background: #e4e7ee; color: #3b3f4a; box-shadow: 0 4px 0 #b9bfcc; padding: 1rem .5rem 1rem .9rem; font-size: 1.3rem; border-radius: 6px; position: relative; z-index: 2; }
.kp-teil.knopf::after { content: ''; position: absolute; right: -14px; top: 50%; width: 26px; height: 26px; margin-top: -13px; border-radius: 50%; background: inherit; z-index: 1; }
.kp-plaetze .kp-teil { border-radius: 0; box-shadow: none; }
.kp-plaetze .kp-teil:first-child { border-radius: 12px 0 0 12px; }
.kp-plaetze .kp-teil:last-child { border-radius: 0 12px 12px 0; }
.kp-plaetze .kp-teil:only-child { border-radius: 12px; }
.kp-fahne { position: absolute; left: 6px; top: -1.55rem; font: 800 .95rem/1 var(--schrift); color: #fff; background: var(--f); padding: .2rem .45rem .25rem; border-radius: 4px 8px 8px 0;
  transition: opacity .4s; white-space: nowrap; }
.kp-fahne::before { content: ''; position: absolute; left: 0; top: 100%; width: 3px; height: .7rem; background: var(--f); }
.kp-fahne.blass { opacity: .25; }
.kp-wort { display: flex; justify-content: center; align-items: center; gap: .6rem; font: 800 2.2rem/1.2 var(--titel); margin: .4rem 0; flex-wrap: wrap; }
.kp-art { color: #fff; background: var(--f); border-radius: 8px; padding: .1rem .5rem; font-size: 1.6rem; }
.kp-wahl { display: flex; gap: .5rem; flex-wrap: wrap; margin: .4rem 0; }
.kp-wahl .kn-gross { min-width: 4.5rem; justify-content: center; font-size: 1.3rem; }
.kp-wahl .kn-gross.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); color: var(--schlecht); }
.kp-schnitt { display: flex; justify-content: center; flex-wrap: wrap; font: 800 2rem/1 var(--titel); background: #ffe9a8; color: #3a2c00; border-radius: 14px; padding: .9rem .6rem; margin: 1.5rem 0 .6rem; position: relative; }
.kp-schnitt .bu { padding: .2rem 0; }
.kp-messer { width: 1.1rem; align-self: stretch; margin: 0 .05rem; border: 0; background: transparent; cursor: pointer; position: relative; }
.kp-messer::after { content: ''; position: absolute; left: 50%; top: -.4rem; bottom: -.4rem; width: 3px; margin-left: -1.5px; background: var(--akzent); opacity: .18; border-radius: 2px; }
.kp-messer:hover::after { opacity: .7; }
.kp-messer.falsch::after { background: var(--schlecht); opacity: .9; }
.kp-merk { border-left: 6px solid #9ad1ff; background: var(--info-sanft); border-radius: 10px; padding: .6rem .8rem; }
`;

export function starteKomposita(root) {
  if (!document.getElementById('kp-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="kp-stil">${STIL}</style>`);
  let modus = 'bauen', liste = mischen(WOERTER), idx = 0, w, z, meldung = null;

  const g = geruest(root, {
    etikett: 'Sätze und Wörter', titel: '',
    reiter: [{ id: 'bauen', titel: 'Zusammensetzen', unter: 'zwei Teile, ein Wort' }, { id: 'zerlegen', titel: 'Zerlegen', unter: 'Wo ist die Naht?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-kp="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-kp="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() {
    do { w = liste[idx++ % liste.length]; } while (modus === 'bauen' && w.ba === w.ga && Math.random() < 0.7);
    z = { gelegt: [], tisch: mischen(['b', 'gr']), schritt: 1, falschArt: [], falschSchnitt: null, artWahl: null };
    meldung = null;
  }

  const fahne = (art, blass = false, id = '') => `<span class="kp-fahne${blass ? ' blass' : ''}"${id ? ` data-id="${id}"` : ''} style="--f:${FARBE[art]}">${art}</span>`;
  function teil(id, imPlatz) {
    const istB = id === 'b';
    const text = istB ? w.b : (imPlatz && z.gelegt[0] === 'b' && z.schritt >= 2 ? klein(w.gr) : w.gr);
    const blass = z.schritt >= 3 && istB;
    return `<button type="button" class="kp-teil ${istB ? 'knopf' : 'grund'}" data-id="t-${id}" data-teil="${id}">${z.schritt >= 3 && !istB ? '' : fahne(istB ? w.ba : w.ga, blass, istB ? '' : 'art')}${ESC(text)}</button>`;
  }

  function linksBauen() {
    const fuge = z.schritt >= 2 && w.f ? `<span class="kp-teil fuge" data-id="t-f">${w.f}</span>` : '';
    const plaetze = z.gelegt.length
      ? z.gelegt.map((id, i) => teil(id, true) + (i === 0 && z.gelegt.length === 2 ? fuge : '')).join('')
      : '<span class="kp-platz">Lege die Teile hier zusammen</span>';
    let h = `<p class="kp-was">Was ist es? <b>${ESC(w.was)}</b></p>
      <div class="kp-plaetze">${plaetze}</div>
      <div class="kp-tisch">${z.tisch.filter(id => !z.gelegt.includes(id)).map(id => teil(id, false)).join('') || '<span class="leise">Alle Teile liegen.</span>'}</div>`;
    if (z.schritt >= 3) h += `<div class="kp-wort"><span class="kp-art" data-id="art" style="--f:${FARBE[w.ga]}">${w.ga}</span>${ESC(ganz(w))}</div>`;
    return h;
  }

  function linksZerlegen() {
    const wort = ganz(w), naht = w.b.length + w.f.length;
    if (z.schritt === 1) {
      let s = '';
      [...wort].forEach((c, i) => {
        if (i > 0) s += `<button type="button" class="kp-messer${z.falschSchnitt === i ? ' falsch' : ''}" data-schnitt="${i}" aria-label="zwischen ${wort[i - 1]} und ${c} schneiden"></button>`;
        s += `<span class="bu">${c}</span>`;
      });
      return `<p class="kp-was">Schneide das lange Wort an der Naht durch. <b>Tippe zwischen zwei Buchstaben.</b></p><div class="kp-schnitt">${s}</div>`;
    }
    void naht;
    const fuge = w.f ? `<span class="kp-teil fuge">${w.f}</span>` : '';
    const zeigeFahnen = z.schritt >= 3;
    const tb = `<button type="button" class="kp-teil knopf" data-artteil="b">${zeigeFahnen ? fahne(w.ba, true) : ''}${ESC(w.b)}</button>`;
    const tg = `<button type="button" class="kp-teil grund" data-artteil="gr">${zeigeFahnen ? fahne(w.ga) : ''}${ESC(w.gr)}</button>`;
    return `<p class="kp-was">Aus <b>${ESC(wort)}</b> werden zwei Nomen:</p>
      <div class="kp-tisch">${tb}${fuge ? `<span style="align-self:center">${fuge}</span>` : ''}${tg}</div>
      ${zeigeFahnen ? `<div class="kp-wort"><span class="kp-art" style="--f:${FARBE[w.ga]}">${w.ga}</span>${ESC(wort)}</div>` : ''}`;
  }

  function rechts() {
    let h = '<h2 class="bereich-titel">Das Nomen-Puzzle</h2>';
    if (modus === 'bauen') {
      if (z.schritt === 1) h += '<p>Tippe die Teile an. Sie wandern auf den Bauplatz. Tippst du ein gelegtes Teil an, kommt es zurück.</p>';
      if (z.schritt === 2) {
        h += `<h3 class="eh-zwischen">Welcher Artikel gehört zu „${ESC(ganz(w))}“?</h3>
          <div class="kp-wahl">${['der', 'die', 'das'].map(a => `<button type="button" class="kn-gross${z.falschArt.includes(a) ? ' falsch' : ''}" data-art="${a}">${a}</button>`).join('')}</div>`;
      }
      if (z.schritt >= 3) h += `<p class="tb-antwort gut">Richtig: ${w.ga} ${ESC(ganz(w))}. Die Fahne kommt vom letzten Teil: ${w.ga} ${ESC(w.gr)}.</p>`;
    } else {
      if (z.schritt === 2) h += '<h3 class="eh-zwischen">Welches Teil bestimmt den Artikel?</h3><p>Tippe es an.</p>';
      if (z.schritt >= 3) h += `<p class="tb-antwort gut">Richtig: ${w.ga} ${ESC(w.gr)} → ${w.ga} ${ESC(ganz(w))}.</p>`;
    }
    h += `<div class="kp-merk"><b>Merke:</b> Das <b>letzte Teil</b> (Grundwort) sagt, <b>was</b> es ist, und gibt den <b>Artikel</b>. Das erste Teil (Bestimmungswort) sagt, <b>welche Art</b>.
      Im langen Wort wird das zweite Teil kleingeschrieben.${w.f ? ` Manchmal kommt ein Fugen-Buchstabe dazwischen (hier: <b>${w.f}</b>).` : ''}</div>`;
    if (meldung) h += `<p class="tb-antwort ${meldung.ok ? 'gut' : 'schlecht'}">${meldung.text}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'bauen' ? 'Zusammengesetzte Nomen bauen' : 'Zusammengesetzte Nomen zerlegen');
    g.links.innerHTML = modus === 'bauen' ? linksBauen() : linksZerlegen();
    g.rechts.innerHTML = rechts();
  }

  function start() {
    g.sprich(modus === 'bauen' ? 'Lege die beiden Puzzleteile so zusammen, dass das Wort passt.' : 'In diesem langen Wort stecken zwei Nomen. Wo ist die Naht?');
  }

  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const t = e.target.closest('[data-teil]');
    if (t && modus === 'bauen' && z.schritt === 1) {
      const id = t.dataset.teil;
      if (z.gelegt.includes(id)) z.gelegt = z.gelegt.filter(x => x !== id); else z.gelegt.push(id);
      meldung = null;
      await flip(root, zeichne, 400);
      if (z.gelegt.length === 2) {
        if (z.gelegt[0] === 'b') { z.schritt = 2; await flip(root, zeichne, 400); g.sprich(`Die Teile rasten ein: ${ganz(w)}. Das große ${w.gr[0]} wird klein.`); }
        else { meldung = { ok: false, text: `Das letzte Teil sagt, was es ist. Es ist ${ESC(w.was)} – also muss „${ESC(w.gr)}“ hinten stehen.` }; zeichne(); }
      }
      return;
    }
    const ar = e.target.closest('[data-art]');
    if (ar && z.schritt === 2) {
      if (ar.dataset.art === w.ga) { z.schritt = 3; meldung = null; await flip(root, zeichne, 700); g.sprich(`Die Fahne vom letzten Teil wandert nach vorn: ${w.ga} ${ganz(w)}.`, 'fertig'); }
      else { z.falschArt.push(ar.dataset.art); meldung = { ok: false, text: 'Schau auf die Fahnen. Welches Teil sagt, was es ist?' }; zeichne(); }
      return;
    }
    const sn = e.target.closest('[data-schnitt]');
    if (sn && modus === 'zerlegen' && z.schritt === 1) {
      const i = Number(sn.dataset.schnitt);
      const ok = i === w.b.length + w.f.length || (w.f && i === w.b.length);
      if (ok) { z.schritt = 2; meldung = null; zeichne(); g.sprich(`Geschnitten: ${w.b}${w.f ? ` + ${w.f}` : ''} + ${w.gr}. Beide Teile sind Nomen – darum groß.`); }
      else { z.falschSchnitt = i; meldung = { ok: false, text: 'Hier entstehen keine zwei sinnvollen Wörter. Probiere eine andere Stelle.' }; zeichne(); }
      return;
    }
    const at = e.target.closest('[data-artteil]');
    if (at && modus === 'zerlegen' && z.schritt === 2) {
      if (at.dataset.artteil === 'gr') { z.schritt = 3; meldung = null; zeichne(); g.sprich('Genau – das letzte Teil gibt den Artikel.', 'fertig'); }
      else { meldung = { ok: false, text: `Es ist ${ESC(w.was)}. Welches Teil sagt, was es ist?` }; zeichne(); }
      return;
    }
    const b = e.target.closest('[data-kp]');
    if (!b) return;
    if (b.dataset.kp === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.kp === 'tipp') g.sprich(modus === 'bauen' ? (z.schritt === 1 ? `Lies: ${w.was}. Was ist es? Das kommt nach hinten.` : 'Der Artikel kommt vom letzten Teil.')
      : (z.schritt === 1 ? `Suche das erste Nomen: Es ist ${w.was}.` : 'Das letzte Teil sagt, was es ist.'), 'tipp');
  });

  neu(); zeichne(); start();
}
