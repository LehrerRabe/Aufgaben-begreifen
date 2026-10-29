/* Deutsch: Steigerung von Adjektiven als Siegertreppe (Klasse 5).
   Drei Stufen: Grundstufe (groß) – Vergleichsstufe (größer) – Höchststufe (am größten).
   Ein Männchen steigt Stufe für Stufe hinauf. Unregelmäßige Adjektive (gut – besser – am besten) haben eine goldene „Sondertreppe“.
   „Treppe bauen“: Wortkarten antippen und auf die passende Stufe legen.
   „Selbst steigern“: Die Formen für Stufe 2 und 3 selbst eintragen.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, antwortHtml, flip, ESC } from './geruest.js';

/* [Grundstufe, Vergleichsstufe, Höchststufe ohne „am“, unregelmäßig?] */
const ADJ = [
  ['klein', 'kleiner', 'kleinsten'], ['schnell', 'schneller', 'schnellsten'], ['laut', 'lauter', 'lautesten'],
  ['leise', 'leiser', 'leisesten'], ['alt', 'älter', 'ältesten'], ['jung', 'jünger', 'jüngsten'],
  ['groß', 'größer', 'größten'], ['kalt', 'kälter', 'kältesten'], ['warm', 'wärmer', 'wärmsten'],
  ['lang', 'länger', 'längsten'], ['hell', 'heller', 'hellsten'], ['dunkel', 'dunkler', 'dunkelsten'],
  ['schön', 'schöner', 'schönsten'], ['klug', 'klüger', 'klügsten'], ['stark', 'stärker', 'stärksten'],
  ['gut', 'besser', 'besten', true], ['viel', 'mehr', 'meisten', true], ['gern', 'lieber', 'liebsten', true],
  ['hoch', 'höher', 'höchsten', true], ['nah', 'näher', 'nächsten', true],
];
const STUFEN = ['Grundstufe', 'Vergleichsstufe', 'Höchststufe'];
const BEISPIEL = ['Tom ist groß.', 'Lea ist größer als Tom.', 'Ben ist am größten.'];

const STIL = `
.tr-treppe { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); align-items: end; gap: 0; margin: 1rem 0 .6rem; min-height: 19rem; }
.tr-stufe { position: relative; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; background: linear-gradient(#4a8ae8, #2f63c9);
  border: 3px solid #fff; border-bottom: 0; color: #fff; padding: .5rem .3rem; cursor: pointer; font: inherit; }
.tr-treppe.sonder .tr-stufe { background: linear-gradient(#f5cf5c, #d79f1c); color: #3a2c00; }
.tr-stufe:nth-child(1) { height: 5.5rem; border-radius: 12px 0 0 0; }
.tr-stufe:nth-child(2) { height: 9rem; }
.tr-stufe:nth-child(3) { height: 12.5rem; border-radius: 0 12px 0 0; }
.tr-stufe.an { box-shadow: inset 0 0 0 4px var(--akzent); }
.tr-stufe.falsch { animation: wackeln .35s; box-shadow: inset 0 0 0 4px var(--schlecht); }
.tr-nr { font: 800 2.2rem/1 var(--titel); opacity: .45; }
.tr-name { font: 700 .85rem/1.1 var(--schrift); margin-top: auto; padding-bottom: .2rem; opacity: .9; text-align: center; }
.tr-platz { position: absolute; bottom: calc(100% + .4rem); left: 50%; transform: translateX(-50%); white-space: nowrap; }
.tr-karte { font: 800 1.35rem var(--schrift); padding: .5rem .85rem; border-radius: 12px; border: 3px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; box-shadow: 0 3px 0 var(--rand); }
.tr-karte.gewaehlt { border-color: var(--akzent); transform: translateY(-3px); }
.tr-karte.liegt { border-color: var(--gut); cursor: default; }
.tr-karten { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; min-height: 3.6rem; margin-top: 4.2rem; }
.tr-figur { position: absolute; bottom: calc(100% + 3.6rem); left: 50%; width: 2.6rem; margin-left: -1.3rem; }
.tr-figur svg { width: 100%; height: auto; display: block; }
.tr-ein { width: 8.5rem; padding: .3rem .4rem; font: 800 1.25rem var(--schrift); text-align: center; border: 3px solid var(--rand); border-radius: 10px; background: var(--flaeche); color: var(--text); }
.tr-ein:focus { border-color: var(--akzent); outline: none; }
.tr-ein.richtig { border-color: var(--gut); background: var(--gut-sanft); }
.tr-ein.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); }
.tr-am { font: 800 1.25rem var(--schrift); color: var(--text); margin-right: .25rem; }
.tr-sonder { display: inline-block; background: #f5cf5c; color: #3a2c00; font-weight: 800; border-radius: 8px; padding: .1rem .5rem; }
`;

export function starteSteigerung(root) {
  if (!document.getElementById('tr-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="tr-stil">${STIL}</style>`);
  let modus = 'bauen', liste = mischen(ADJ), idx = 0, w, karten, gelegt, gewaehlt, falschStufe, eing, bewertung;

  const g = geruest(root, {
    etikett: 'Wortarten', titel: '',
    reiter: [{ id: 'bauen', titel: 'Treppe bauen', unter: 'Karten auf die Stufen' }, { id: 'selbst', titel: 'Selbst steigern', unter: 'Formen eintragen' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-st="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-st="neu">＋ Neue Aufgabe</button>`,
  });

  const form = (i, a = w) => (i === 2 ? `am ${a[2]}` : a[i]);

  function neu() {
    w = liste[idx++ % liste.length];
    karten = mischen([0, 1, 2]);
    gelegt = [null, null, null]; gewaehlt = null; falschStufe = null; eing = {}; bewertung = null;
    if (modus === 'selbst') gelegt[0] = 0;
  }

  const figur = () => `<span class="tr-figur" data-id="figur"><svg viewBox="0 0 40 60" aria-hidden="true"><circle cx="20" cy="11" r="9" fill="#f4c59a"/>
    <circle cx="16.5" cy="10" r="1.6" fill="#1b2340"/><circle cx="23.5" cy="10" r="1.6" fill="#1b2340"/><path d="M15 14 q5 4 10 0" stroke="#1b2340" stroke-width="1.6" fill="none"/>
    <path d="M8 58 L12 26 Q20 21 28 26 L32 58Z" fill="#d7263d"/><path d="M6 30 L2 18 M34 30 L38 18" stroke="#f4c59a" stroke-width="4" stroke-linecap="round"/></svg></span>`;

  function oben() { let h = -1; gelegt.forEach((k, i) => { if (k !== null) h = i; }); return h; }

  function stufe(i) {
    let platz = '';
    if (modus === 'bauen' && gelegt[i] !== null) platz = `<span class="tr-karte liegt" data-id="k${gelegt[i]}">${ESC(form(gelegt[i]))}</span>`;
    if (modus === 'selbst') {
      if (i === 0) platz = `<span class="tr-karte liegt">${ESC(w[0])}</span>`;
      else {
        const id = 'tr-e' + i, kl = bewertung ? (norm(eing[id]) === w[i] ? ' richtig' : ' falsch') : '';
        platz = `${i === 2 ? '<span class="tr-am">am</span>' : ''}<input class="tr-ein${kl}" id="${id}" value="${ESC(eing[id] ?? '')}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${STUFEN[i]}"${bewertung?.ok ? ' readonly' : ''}>`;
      }
    }
    const fig = oben() === i && (modus === 'bauen' || bewertung?.ok || i === 0) ? figur() : '';
    const kl = (modus === 'bauen' && gewaehlt !== null && gelegt[i] === null ? ' an' : '') + (falschStufe === i ? ' falsch' : '');
    return `<div class="tr-stufe${kl}" data-stufe="${i}" role="button" tabindex="-1"><span class="tr-platz">${platz}</span>${fig}<span class="tr-nr">${i + 1}</span><span class="tr-name">${STUFEN[i]}</span></div>`;
  }

  const norm = s => (s ?? '').trim().toLowerCase().replace(/^am\s+/, '');

  function links() {
    let h = `<div class="tr-treppe${w[3] ? ' sonder' : ''}">${[0, 1, 2].map(stufe).join('')}</div>`;
    if (modus === 'bauen') {
      const rest = karten.filter(k => !gelegt.includes(k));
      h += `<div class="tr-karten">${rest.map(k => `<button type="button" class="tr-karte${gewaehlt === k ? ' gewaehlt' : ''}" data-karte="${k}" data-id="k${k}">${ESC(form(k))}</button>`).join('') || ''}</div>`;
    } else h += '<div class="tr-karten"></div>';
    return h;
  }

  function rechts() {
    let h = `<h2 class="bereich-titel">Die Siegertreppe</h2>
      <ol class="sg-merke">${STUFEN.map((s, i) => `<li><b>${s}:</b> ${BEISPIEL[i]}</li>`).join('')}</ol>`;
    if (w[3]) h += '<p><span class="tr-sonder">Sondertreppe</span> Dieses Adjektiv verändert sich beim Steigern ganz. Diese Formen musst du dir merken.</p>';
    else h += '<p class="leise">Vergleichsstufe: <b>-er</b> anhängen. Höchststufe: <b>am …-sten</b> (manchmal <b>-esten</b>). Oft wird aus a, o, u ein ä, ö, ü.</p>';
    if (modus === 'selbst') h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-st="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}`;
    else if (!gelegt.includes(null)) h += `<p class="tb-antwort gut">Ganz oben! ${ESC(w[0])} – ${ESC(w[1])} – am ${ESC(w[2])}</p>`;
    else if (bewertung) h += antwortHtml(bewertung);
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(`Steigern: ${ESC(w[0])}`);
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  function pruefen() {
    const ok1 = norm(eing['tr-e1']) === w[1], ok2 = norm(eing['tr-e2']) === w[2];
    if (ok1 && ok2) { gelegt = [0, 1, 2]; bewertung = { ok: true, text: `Richtig: ${w[0]} – ${w[1]} – am ${w[2]}.` }; g.sprich('Das Männchen steht ganz oben!', 'fertig'); }
    else bewertung = { ok: false, text: !ok1 ? `Stufe 2: Hänge an „${w[0]}“ etwas an.${w[3] ? ' Achtung, Sondertreppe!' : ''}` : 'Stufe 3: am …-sten. Schau dir Stufe 2 an.' };
    zeichne();
    if (!bewertung.ok) root.querySelector('.tr-ein.falsch')?.focus({ preventScroll: true });
  }

  root.addEventListener('input', e => { if (e.target.matches('.tr-ein')) { eing[e.target.id] = e.target.value; } });
  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const k = e.target.closest('[data-karte]');
    if (k) { const n = Number(k.dataset.karte); gewaehlt = gewaehlt === n ? null : n; falschStufe = null; bewertung = null; zeichne(); return; }
    const s = e.target.closest('[data-stufe]');
    if (s && modus === 'bauen') {
      const i = Number(s.dataset.stufe);
      if (gewaehlt === null) { g.sprich('Tippe zuerst eine Wortkarte an.', 'tipp'); return; }
      if (gelegt[i] !== null) return;
      if (gewaehlt === i) {
        gelegt[i] = gewaehlt; gewaehlt = null; falschStufe = null; bewertung = null;
        await flip(root, zeichne, 550);
        if (!gelegt.includes(null)) g.sprich(`Ganz oben! ${w[0]} – ${w[1]} – am ${w[2]}.`, 'fertig');
      } else { falschStufe = i; bewertung = { ok: false, text: `„${ESC(form(gewaehlt))}“ gehört auf eine andere Stufe.` }; zeichne(); }
      return;
    }
    const b = e.target.closest('[data-st]');
    if (!b) return;
    if (b.dataset.st === 'pruefen') pruefen();
    if (b.dataset.st === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.st === 'tipp') g.sprich(w[3] ? 'Das ist eine Sondertreppe: Die Formen klingen ganz anders. Denk an „gut – besser – am besten“.'
      : `Sag laut: „Tom ist ${w[0]}. Lea ist noch … als Tom. Ben ist am …“`, 'tipp');
  });

  function start() { g.sprich(modus === 'bauen' ? 'Lege die Wortkarten auf die passenden Stufen. Wer steigt am höchsten?' : 'Trage die fehlenden Formen ein.'); if (modus === 'selbst') setTimeout(() => root.querySelector('#tr-e1')?.focus({ preventScroll: true }), 50); }

  neu(); zeichne(); start();
}
