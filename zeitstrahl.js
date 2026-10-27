/* Deutsch: Zeitformen am Zeitstrahl (Klasse 5/6).
   „Wann passiert es?“: Ein Satz wird auf den Zeitstrahl gelegt (vor der Vergangenheit – Vergangenheit – jetzt – Zukunft),
     dann wird die Zeitform benannt. Die Verbteile werden farbig hervorgehoben.
   „Was war zuerst?“: Satzgefüge mit „nachdem“ – das frühere Ereignis steht im Plusquamperfekt, das spätere im Präteritum.
     Beide Ereignisse werden in die richtige Reihenfolge auf den Zeitstrahl gelegt. */

import { geruest, wahl, mischen, antwortHtml, ESC } from './geruest.js';

/* [Infinitiv, Präsens (er/sie), Präteritum, Partizip II, Hilfsverb sein?, Ergänzung] */
export const VERBEN = [
  ['lesen', 'liest', 'las', 'gelesen', false, 'ein Buch'],
  ['schwimmen', 'schwimmt', 'schwamm', 'geschwommen', true, 'im See'],
  ['spielen', 'spielt', 'spielte', 'gespielt', false, 'Fußball'],
  ['gehen', 'geht', 'ging', 'gegangen', true, 'in die Schule'],
  ['schreiben', 'schreibt', 'schrieb', 'geschrieben', false, 'einen Brief'],
  ['essen', 'isst', 'aß', 'gegessen', false, 'einen Apfel'],
  ['fahren', 'fährt', 'fuhr', 'gefahren', true, 'nach Berlin'],
  ['backen', 'backt', 'backte', 'gebacken', false, 'einen Kuchen'],
  ['laufen', 'läuft', 'lief', 'gelaufen', true, 'zum Bus'],
  ['singen', 'singt', 'sang', 'gesungen', false, 'ein Lied'],
];
const PERSONEN = [['Lena', 'sie'], ['Tom', 'er'], ['Oma', 'sie'], ['Ali', 'er'], ['Mia', 'sie']];
export const ZEITEN = [
  { id: 'plusq', name: 'Plusquamperfekt', zone: 0 },
  { id: 'praet', name: 'Präteritum', zone: 1 },
  { id: 'perf', name: 'Perfekt', zone: 1 },
  { id: 'praes', name: 'Präsens', zone: 2 },
  { id: 'fut', name: 'Futur I', zone: 3 },
];
const ZONEN = ['vor der Vergangenheit', 'Vergangenheit', 'jetzt', 'Zukunft'];
const DANACH = [['ging', 'ins Bett'], ['rief', 'Opa an'], ['aß', 'zu Abend'], ['ging', 'nach draußen']];

/** Satz in einer Zeitform; Verbteile als markierte Spans */
function satzIn(zeit, [inf, praes, praet, part, sein, erg], person) {
  const v = t => `<span class="zs-verb">${t}</span>`;
  if (zeit === 'praes') return `${person} ${v(praes)} ${erg}.`;
  if (zeit === 'praet') return `${person} ${v(praet)} ${erg}.`;
  if (zeit === 'perf') return `${person} ${v(sein ? 'ist' : 'hat')} ${erg} ${v(part)}.`;
  if (zeit === 'plusq') return `${person} ${v(sein ? 'war' : 'hatte')} ${erg} ${v(part)}.`;
  return `${person} ${v('wird')} ${erg} ${v(inf)}.`;
}

export function starteZeitstrahl(root) {
  let modus = 'wann', bewertung = null;
  let az;   // wann: { zeit, verb, person, schritt, zone, name }
  let rf;   // reihenfolge: { verb, person, pron, danach, ereignisse:[früh, spät] gemischt, gelegt:[], schritt }

  const g = geruest(root, {
    etikett: 'Zeitformen', titel: '',
    reiter: [{ id: 'wann', titel: 'Wann passiert es?', unter: 'Satz auf den Zeitstrahl' }, { id: 'reihe', titel: 'Was war zuerst?', unter: 'Plusquamperfekt' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-zs="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-zs="neu">＋ Neuer Satz</button>`,
  });

  function neu() {
    bewertung = null;
    const verb = wahl(VERBEN), [person, pron] = wahl(PERSONEN);
    if (modus === 'wann') az = { zeit: wahl(ZEITEN).id, verb, person, schritt: 1, zone: null, name: null };
    else {
      const [dv, drest] = wahl(DANACH);
      const frueh = `${person} ${verb[4] ? 'war' : 'hatte'} ${verb[5]} ${verb[3]}`, spaet = `${pron[0].toUpperCase() + pron.slice(1)} ${dv} ${drest}`;
      rf = { verb, person, pron, satz: `Nachdem ${person} ${verb[5]} <span class="zs-verb">${verb[3]} ${verb[4] ? 'war' : 'hatte'}</span>, <span class="zs-verb">${dv}</span> ${pron} ${drest}.`,
        frueh, spaet, karten: mischen(['frueh', 'spaet']), gelegt: [], schritt: 1, name: null };
    }
  }
  const zeitVon = id => ZEITEN.find(z => z.id === id);

  /* ---------------- Zeitstrahl ---------------- */
  function strahlSvg(inhalt) {
    const W = 680, y = 120, xs = [100, 270, 430, 590];
    let s = `<defs><marker id="zs-sp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="zs-spitze"/></marker></defs>
      <line x1="20" y1="${y}" x2="${W - 14}" y2="${y}" class="zs-linie" marker-end="url(#zs-sp)"/>
      <line x1="430" y1="${y - 26}" x2="430" y2="${y + 26}" class="zs-jetzt"/><text x="430" y="${y + 46}" class="zs-jetzt-text">jetzt</text>`;
    ZONEN.forEach((z, i) => {
      if (i === 2) return;
      s += `<text x="${xs[i]}" y="${y + 46}" class="zs-zonen-text">${z}</text>`;
    });
    return `<svg class="zs-svg" viewBox="0 0 ${W} 180" role="img" aria-label="Zeitstrahl">${s}${inhalt}</svg>`;
  }
  function zonenKnoepfe(aktiv) {
    const xs = [100, 270, 430, 590];
    return xs.map((x, i) => `<rect x="${x - (i === 2 ? 40 : 75)}" y="62" width="${i === 2 ? 80 : 150}" height="56" rx="10" class="zs-zone${aktiv ? ' aktiv' : ''}${az?.zone === i ? (i === zeitVon(az.zeit).zone ? ' richtig' : ' falsch') : ''}" data-zone="${i}"><title>${ZONEN[i]}</title></rect>`).join('');
  }
  function linksWann() {
    const z = zeitVon(az.zeit);
    let inhalt = zonenKnoepfe(az.schritt === 1);
    if (az.schritt >= 2) inhalt += `<g class="zs-karte-g"><rect x="${[100, 270, 430, 590][z.zone] - 70}" y="68" width="140" height="44" rx="10" class="zs-karte"/><text x="${[100, 270, 430, 590][z.zone]}" y="96" class="zs-karte-text">${ESC(az.verb[0])}</text></g>`;
    return `${strahlSvg(inhalt)}<p class="leise">${az.schritt === 1 ? 'Tippe auf den Abschnitt des Zeitstrahls, zu dem der Satz passt.' : 'Die Verbteile sind farbig: Sie verraten die Zeitform.'}</p>`;
  }
  function rechtsWann() {
    const z = zeitVon(az.zeit);
    let h = `<h2 class="bereich-titel">Wann passiert es?</h2><p class="tl-geschichte zs-satz${az.schritt >= 2 ? ' mit-verb' : ''}">${satzIn(az.zeit, az.verb, az.person)}</p>`;
    h += `<p class="vz-schritt${az.schritt > 1 ? ' fertig' : ''}">1. Lege den Satz auf den Zeitstrahl.${az.schritt > 1 ? ` ✓ ${ZONEN[z.zone]}` : ''}</p>`;
    if (az.schritt >= 2) {
      h += `<p class="vz-schritt${az.schritt > 2 ? ' fertig' : ''}">2. Wie heißt die Zeitform?</p><div class="wf-optionen">${ZEITEN.map(t => `<button type="button" class="kn-gross${az.name === t.id ? (t.id === az.zeit ? ' richtig' : ' falsch') : ''}" data-zeit="${t.id}" ${az.schritt > 2 ? 'disabled' : ''}>${t.name}</button>`).join('')}</div>`;
    }
    if (az.schritt === 3) h += `<div class="fl-formel zs-alle">${ZEITEN.map(t => `<div class="${t.id === az.zeit ? 'an' : ''}"><b>${t.name}:</b> ${satzIn(t.id, az.verb, az.person)}</div>`).join('')}</div>`;
    return h + antwortHtml(bewertung);
  }

  /* ---------------- Reihenfolge ---------------- */
  function linksReihe() {
    const plaetze = [270, 430 - 2];   // früher (Vorvergangenheit/Vergangenheit) – später
    let inhalt = '';
    if (rf.gelegt.length) {
      rf.gelegt.forEach((k, i) => {
        const x = i === 0 ? 150 : 330, txt = k === 'frueh' ? rf.frueh : rf.spaet;
        inhalt += `<g><rect x="${x - 85}" y="56" width="170" height="54" rx="10" class="zs-karte ${k}"/><text x="${x}" y="80" class="zs-karte-text klein">${ESC(txt.length > 24 ? txt.slice(0, 24) + '…' : txt)}</text><text x="${x}" y="100" class="zs-karte-nr">${i + 1}.</text></g>`;
      });
      void plaetze;
    }
    return `${strahlSvg(inhalt)}
      <div class="zs-karten">${rf.karten.filter(k => !rf.gelegt.includes(k)).map(k => `<button type="button" class="zs-kartenknopf ${k}" data-ereignis="${k}">${ESC(k === 'frueh' ? rf.frueh : rf.spaet)}</button>`).join('')}</div>
      <p class="leise">${rf.schritt === 1 ? 'Tippe zuerst das Ereignis an, das <b>früher</b> passiert ist – dann das spätere.' : 'Das frühere Ereignis liegt weiter links auf dem Zeitstrahl.'}</p>`;
  }
  function rechtsReihe() {
    let h = `<h2 class="bereich-titel">Was war zuerst?</h2><p class="tl-geschichte zs-satz${rf.schritt >= 2 ? ' mit-verb' : ''}">${rf.satz}</p>`;
    h += `<p class="vz-schritt${rf.schritt > 1 ? ' fertig' : ''}">1. Lege die Ereignisse in der richtigen Reihenfolge auf den Zeitstrahl.${rf.schritt > 1 ? ' ✓' : ''}</p>`;
    if (rf.schritt >= 2) {
      h += `<p class="vz-schritt${rf.schritt > 2 ? ' fertig' : ''}">2. In welcher Zeitform steht das <b>frühere</b> Ereignis?</p>
        <div class="wf-optionen">${['plusq', 'praet', 'perf'].map(id => `<button type="button" class="kn-gross${rf.name === id ? (id === 'plusq' ? ' richtig' : ' falsch') : ''}" data-zeit="${id}" ${rf.schritt > 2 ? 'disabled' : ''}>${zeitVon(id).name}</button>`).join('')}</div>`;
    }
    if (rf.schritt === 3) h += `<p class="fl-formel">Was <b>vor</b> einem Ereignis in der Vergangenheit passiert ist, steht im <b>Plusquamperfekt</b> (hatte/war + Partizip). Das spätere Ereignis steht im Präteritum.</p>`;
    return h + antwortHtml(bewertung);
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'wann' ? 'Zeitformen am Zeitstrahl' : 'Vorher und nachher');
    g.links.innerHTML = modus === 'wann' ? linksWann() : linksReihe();
    g.rechts.innerHTML = modus === 'wann' ? rechtsWann() : rechtsReihe();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const zn = e.target.closest('[data-zone]');
    if (zn && modus === 'wann' && az.schritt === 1) {
      az.zone = +zn.dataset.zone;
      const soll = zeitVon(az.zeit).zone;
      if (az.zone === soll) { az.schritt = 2; bewertung = null; g.sprich('Richtig gelegt. Jetzt schau auf die Verbteile.'); }
      else bewertung = { ok: false, text: az.zone === 0 || soll === 0 ? 'Schau genau: „hatte“ oder „war“ mit Partizip zeigt, dass etwas schon vor einem anderen vergangenen Ereignis passiert ist.' : 'Achte auf das Verb: Was zeigt es – passiert es gerade, ist es schon vorbei oder kommt es noch?' };
      zeichne(); return;
    }
    const zt = e.target.closest('[data-zeit]');
    if (zt && modus === 'wann' && az.schritt === 2) {
      az.name = zt.dataset.zeit;
      if (az.name === az.zeit) { az.schritt = 3; bewertung = { ok: true, text: `Richtig: ${zeitVon(az.zeit).name}` }; g.sprich('Unten siehst du denselben Satz in allen Zeitformen.', 'fertig'); }
      else bewertung = { ok: false, text: ({ plusq: 'Plusquamperfekt: hatte/war + Partizip (hatte gelesen).', praet: 'Präteritum: nur ein Verbteil in der Vergangenheitsform (las).', perf: 'Perfekt: hat/ist + Partizip (hat gelesen).', praes: 'Präsens: die Gegenwartsform (liest).', fut: 'Futur I: wird + Infinitiv (wird lesen).' })[az.name] + ' Vergleiche mit dem Satz.' };
      zeichne(); return;
    }
    if (zt && modus === 'reihe' && rf.schritt === 2) {
      rf.name = zt.dataset.zeit;
      if (rf.name === 'plusq') { rf.schritt = 3; bewertung = { ok: true, text: 'Richtig: Plusquamperfekt – die Vorvergangenheit.' }; g.sprich('Plusquamperfekt = Vorvergangenheit: was noch früher war.', 'fertig'); }
      else bewertung = { ok: false, text: `„${rf.verb[4] ? 'war' : 'hatte'} … ${rf.verb[3]}“ – das ist hatte/war + Partizip.` };
      zeichne(); return;
    }
    const er = e.target.closest('[data-ereignis]');
    if (er && modus === 'reihe' && rf.schritt === 1) {
      const k = er.dataset.ereignis;
      if (rf.gelegt.length === 0 && k !== 'frueh') { bewertung = { ok: false, text: '„Nachdem“ zeigt: Das Ereignis im Nachdem-Teil war zuerst. Lies noch einmal.' }; zeichne(); return; }
      rf.gelegt.push(k); bewertung = null;
      if (rf.gelegt.length === 2) { rf.schritt = 2; g.sprich('Richtig: Erst das eine, dann das andere.'); }
      zeichne(); return;
    }
    const b = e.target.closest('[data-zs]');
    if (!b) return;
    if (b.dataset.zs === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.zs === 'tipp') g.sprich(modus === 'wann' ? 'Suche das Verb. Ein Teil (liest) = Präsens oder (las) = Präteritum. hat/ist + Partizip = Perfekt. hatte/war + Partizip = Plusquamperfekt. wird + Infinitiv = Futur.' : 'Der Teil mit „nachdem“ ist zuerst passiert.', 'tipp');
  });

  function start() { g.sprich(modus === 'wann' ? 'Jede Zeitform hat ihren Platz auf dem Zeitstrahl.' : 'Zwei Ereignisse in der Vergangenheit – welches war zuerst?'); }
  neu(); zeichne(); start();
}
