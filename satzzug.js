/* Deutsch: Satzgefüge als Zug (Klasse 5/6).
   Der Hauptsatz ist ein Zug mit Lok (blau), der zweite Satz ein loser Zug (grün), das Verb ein roter Wagen.
   1. Kupplung wählen: Welche Konjunktion verbindet die beiden Sätze sinnvoll? Sie wird zum gelben Kupplungswagen.
   2. Im Nebensatz rollt der rote Verb-Wagen ans Ende (antippen).
   3. Nur bei „Wagen vorne“: Der Hauptsatz beginnt jetzt mit seinem Verb (roten Wagen antippen).
   4. Das Komma ist die Kupplung zwischen den Zügen: die richtige Lücke antippen.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, flip, ESC } from './geruest.js';

/* h: Hauptsatz, hv: Stelle des Verbs; n: zweiter Satz, nv: Stelle des Verbs; opts: Kupplungen zur Wahl, k: passende */
const SAETZE = [
  { h: ['wir', 'bleiben', 'drinnen'], hv: 1, n: ['es', 'regnet', 'heute'], nv: 1, opts: ['weil', 'obwohl', 'dass'], k: 'weil' },
  { h: ['Lina', 'geht', 'früh', 'ins', 'Bett'], hv: 1, n: ['sie', 'ist', 'sehr', 'müde'], nv: 1, opts: ['weil', 'obwohl', 'dass'], k: 'weil' },
  { h: ['Tom', 'kommt', 'zu', 'spät'], hv: 1, n: ['der', 'Bus', 'fährt', 'nicht', 'pünktlich'], nv: 2, opts: ['weil', 'obwohl', 'dass'], k: 'weil' },
  { h: ['wir', 'spielen', 'draußen'], hv: 1, n: ['es', 'ist', 'kalt'], nv: 1, opts: ['obwohl', 'weil', 'dass'], k: 'obwohl' },
  { h: ['Mia', 'lernt', 'Vokabeln'], hv: 1, n: ['sie', 'schreibt', 'morgen', 'einen', 'Test'], nv: 1, opts: ['weil', 'obwohl', 'dass'], k: 'weil' },
  { h: ['Paul', 'ist', 'froh'], hv: 1, n: ['er', 'hat', 'heute', 'Geburtstag'], nv: 1, opts: ['weil', 'obwohl', 'dass'], k: 'weil' },
  { h: ['ich', 'weiß'], hv: 1, n: ['du', 'kannst', 'gut', 'malen'], nv: 1, opts: ['dass', 'weil', 'obwohl'], k: 'dass' },
  { h: ['wir', 'gehen', 'schwimmen'], hv: 1, n: ['die', 'Sonne', 'scheint', 'morgen'], nv: 2, opts: ['wenn', 'obwohl', 'dass'], k: 'wenn' },
  { h: ['Oma', 'ruft', 'an'], hv: 1, n: ['wir', 'essen', 'gerade', 'Pizza'], nv: 1, opts: ['während', 'obwohl', 'dass'], k: 'während' },
  { h: ['Ben', 'trägt', 'einen', 'Helm'], hv: 1, n: ['er', 'fährt', 'Fahrrad'], nv: 1, opts: ['wenn', 'obwohl', 'dass'], k: 'wenn' },
  { h: ['die', 'Kinder', 'sind', 'leise'], hv: 2, n: ['die', 'Lehrerin', 'erzählt', 'eine', 'Geschichte'], nv: 2, opts: ['während', 'obwohl', 'dass'], k: 'während' },
  { h: ['Emma', 'lacht'], hv: 1, n: ['der', 'Clown', 'stolpert', 'über', 'seine', 'Schuhe'], nv: 2, opts: ['weil', 'obwohl', 'dass'], k: 'weil' },
];

const SINN = {
  dass: '„dass“ steht meist nach Verben wie wissen, glauben oder hoffen. Passt das hier?',
  obwohl: '„obwohl“ heißt: Es passiert trotzdem. Lies den Satz – passt das vom Sinn?',
  weil: '„weil“ nennt einen Grund. Ist der zweite Satz wirklich der Grund?',
  wenn: '„wenn“ nennt eine Bedingung. Passt das vom Sinn?',
  während: '„während“ heißt: zur gleichen Zeit. Passt das vom Sinn?',
};

const STIL = `
.zz-gleis { display: flex; flex-wrap: wrap; align-items: flex-end; gap: .5rem .15rem; padding: 1rem .6rem .4rem; margin: .6rem 0 1rem;
  background: linear-gradient(to bottom, transparent calc(100% - 10px), #8b7a66 calc(100% - 10px), #8b7a66 calc(100% - 6px), transparent calc(100% - 6px));
  min-height: 6rem; border-radius: 12px; }
.zz-zug { display: inline-flex; align-items: flex-end; gap: .15rem; flex-wrap: wrap; }
.zz-wagen { position: relative; font: 700 1.15rem/1.1 var(--schrift); padding: .55rem .7rem .7rem; border-radius: 10px 10px 6px 6px; color: #fff;
  border: 0; margin-bottom: 14px; min-width: 2.6rem; text-align: center; cursor: default; }
.zz-wagen::before, .zz-wagen::after { content: ''; position: absolute; bottom: -12px; width: 14px; height: 14px; border-radius: 50%; background: #3b3f4a; border: 3px solid #c9ced8; }
.zz-wagen::before { left: 18%; } .zz-wagen::after { right: 18%; }
.zz-wagen.haupt { background: #2f63c9; }
.zz-wagen.neben { background: #23935a; }
.zz-wagen.verb { background: #d7263d; }
.zz-wagen.konj { background: #f2b72e; color: #3a2c00; }
.zz-wagen.tippbar { cursor: pointer; box-shadow: 0 0 0 4px var(--akzent); animation: zz-wink 1.2s ease-in-out infinite; }
@keyframes zz-wink { 50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--akzent) 35%, transparent); } }
.zz-lok { position: relative; width: 4.2rem; height: 3.6rem; margin-bottom: 14px; }
.zz-lok svg { width: 100%; height: 100%; overflow: visible; }
.zz-lok.rechts svg { transform: scaleX(-1); }
.zz-luecke { align-self: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; border: 3px dashed var(--akzent); background: var(--flaeche); cursor: pointer; margin: 0 .1rem 14px; }
.zz-luecke:hover { background: var(--info-sanft); }
.zz-luecke.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); animation: wackeln .35s; }
.zz-komma { align-self: flex-end; font: 900 2.2rem/1 var(--titel); color: var(--akzent); margin: 0 .15rem 18px; position: relative; }
.zz-komma::before { content: ''; position: absolute; left: -.5rem; right: -.5rem; bottom: .55rem; height: 5px; background: #6b7280; border-radius: 3px; z-index: -1; }
.zz-abstand { width: 2.5rem; }
.zz-wahl { display: flex; flex-wrap: wrap; gap: .5rem; margin: .4rem 0 .8rem; }
.zz-wahl .kn-gross.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); color: var(--schlecht); }
.zz-satz { font: 700 1.35rem/1.5 var(--schrift); background: var(--flaeche); border: 2px solid var(--rand); border-radius: 12px; padding: .6rem .8rem; }
.zz-satz .v { color: #d7263d; } .zz-satz .k { background: #f2b72e; color: #3a2c00; border-radius: 6px; padding: 0 .2rem; } .zz-satz .ko { color: var(--akzent); font-weight: 900; }
.zz-legende { display: flex; flex-wrap: wrap; gap: .4rem 1rem; font-size: .95rem; color: var(--leise); }
.zz-legende span::before { content: ''; display: inline-block; width: .9rem; height: .9rem; border-radius: 3px; margin-right: .3rem; vertical-align: -2px; background: var(--f); }
`;

export function starteSatzzug(root) {
  if (!document.getElementById('zz-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="zz-stil">${STIL}</style>`);
  let modus = 'hinten', liste = mischen(SAETZE), idx = 0, a, z, meldung = null;

  const g = geruest(root, {
    etikett: 'Satzzeichen', titel: '',
    reiter: [{ id: 'hinten', titel: 'Wagen hinten', unter: 'Hauptsatz, Nebensatz' }, { id: 'vorne', titel: 'Wagen vorne', unter: 'Nebensatz, Hauptsatz' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-zz="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-zz="neu">＋ Neue Aufgabe</button>`,
  });

  /* Zustand: schritt 1 Kupplung, 2 Verb ans Ende, 3 (vorne) Hauptsatz-Verb nach vorne, 4 Komma, 5 fertig */
  function neu() {
    a = liste[idx++ % liste.length];
    z = {
      schritt: 1, konj: null, falschKonj: [],
      haupt: a.h.map((w, i) => ({ w, id: 'h' + i, verb: i === a.hv })),
      neben: a.n.map((w, i) => ({ w, id: 'n' + i, verb: i === a.nv })),
      nebenVerbHinten: false, hauptVerbVorne: false, falscheLuecke: null,
    };
    meldung = null;
  }

  const lok = (rechts = false) => `<div class="zz-lok${rechts ? ' rechts' : ''}" aria-hidden="true"><svg viewBox="0 0 70 60">
    <rect x="8" y="18" width="52" height="30" rx="6" fill="#1f4aa0"/><rect x="34" y="4" width="26" height="22" rx="4" fill="#1f4aa0"/>
    <rect x="39" y="9" width="16" height="11" rx="2" fill="#cfe0ff"/><rect x="14" y="8" width="9" height="12" rx="2" fill="#3b3f4a"/>
    <path d="M8 48 L0 56 L8 56Z" fill="#3b3f4a"/>
    <circle cx="20" cy="54" r="7" fill="#3b3f4a" stroke="#c9ced8" stroke-width="3"/><circle cx="48" cy="54" r="7" fill="#3b3f4a" stroke="#c9ced8" stroke-width="3"/></svg></div>`;

  function wagen(x, art, tippbar = false) {
    return `<button type="button" class="zz-wagen ${x.verb ? 'verb' : art}${tippbar ? ' tippbar' : ''}" data-id="${x.id}" ${tippbar ? `data-tipp="${x.id}"` : 'tabindex="-1"'}>${ESC(x.w)}</button>`;
  }

  function hauptZug() {
    const tipp = z.schritt === 3;
    return `<div class="zz-zug">${modus === 'hinten' ? lok() : ''}${z.haupt.map(x => wagen(x, 'haupt', tipp && x.verb)).join('')}${modus === 'vorne' ? lok(true) : ''}</div>`;
  }
  function nebenZug() {
    const tipp = z.schritt === 2;
    return `<div class="zz-zug">${z.konj ? `<span class="zz-wagen konj" data-id="konj">${ESC(z.konj)}</span>` : ''}${z.neben.map(x => wagen(x, 'neben', tipp && x.verb)).join('')}</div>`;
  }

  /* Alle Wagen in einer Reihe mit Lücken zum Antippen (Schritt 4) */
  function reiheMitLuecken() {
    const teile = modus === 'hinten'
      ? [{ lok: true }, ...z.haupt.map(x => ({ x, art: 'haupt' })), { konj: true }, ...z.neben.map(x => ({ x, art: 'neben' }))]
      : [{ konj: true }, ...z.neben.map(x => ({ x, art: 'neben' })), ...z.haupt.map(x => ({ x, art: 'haupt' })), { lok: true }];
    const grenze = modus === 'hinten' ? z.haupt.length + 1 : z.neben.length + 1;   // Index der Kupplungsstelle (nach diesem Teil)
    let s = '';
    teile.forEach((t, i) => {
      if (t.lok) s += lok(modus === 'vorne');
      else if (t.konj) s += `<span class="zz-wagen konj" data-id="konj">${ESC(z.konj)}</span>`;
      else s += wagen(t.x, t.art);
      if (i < teile.length - 1 && !(modus === 'hinten' && i === 0) && !(modus === 'vorne' && i === teile.length - 2)) {
        if (z.schritt === 4) s += `<button type="button" class="zz-luecke${z.falscheLuecke === i ? ' falsch' : ''}" data-luecke="${i}" aria-label="Komma hier setzen"></button>`;
        else if (z.schritt === 5 && i === grenze - 1) s += '<span class="zz-komma">,</span>';
      }
    });
    return `<div class="zz-zug">${s}</div>`;
  }

  function fertigerSatz() {
    const w = x => x.verb ? `<span class="v">${ESC(x.w)}</span>` : ESC(x.w);
    const h = z.haupt.map(w).join(' '), n = `<span class="k">${ESC(z.konj)}</span> ${z.neben.map(w).join(' ')}`;
    let s = modus === 'hinten' ? `${h}<span class="ko">,</span> ${n}.` : `${n}<span class="ko">,</span> ${h}.`;
    return s.replace(/^(<span class="k">)?(\p{L})/u, (m, sp, c) => (sp || '') + c.toUpperCase());
  }

  function links() {
    let h = '';
    if (z.schritt >= 4) h = `<div class="zz-gleis">${reiheMitLuecken()}</div>`;
    else if (modus === 'hinten') h = `<div class="zz-gleis">${hauptZug()}<span class="zz-abstand"></span>${nebenZug()}</div>`;
    else h = `<div class="zz-gleis">${nebenZug()}<span class="zz-abstand"></span>${hauptZug()}</div>`;
    h += `<div class="zz-legende"><span style="--f:#2f63c9">Hauptsatz</span><span style="--f:#23935a">Nebensatz</span><span style="--f:#d7263d">Verb</span><span style="--f:#f2b72e">Kupplung (Bindewort)</span></div>`;
    if (z.schritt === 5) h += `<h3 class="eh-zwischen">Der ganze Satz</h3><p class="zz-satz">${fertigerSatz()}</p>`;
    return h;
  }

  function rechts() {
    let h = '<h2 class="bereich-titel">So koppelst du</h2>';
    const titel = ['Kupplung wählen', 'Verb-Wagen ans Ende', 'Hauptsatz-Verb nach vorne', 'Komma setzen'];
    const schritte = modus === 'hinten' ? [1, 2, 4] : [1, 2, 3, 4];
    h += `<ol class="sg-merke">${schritte.map(s => `<li${z.schritt > s ? ' style="color:var(--gut)"' : z.schritt === s ? ' style="font-weight:800"' : ''}>${titel[s - 1]}${z.schritt > s ? ' ✓' : ''}</li>`).join('')}</ol>`;
    if (z.schritt === 1) {
      h += `<h3 class="eh-zwischen">Welche Kupplung passt?</h3><div class="zz-wahl">${a.opts.map(o => `<button type="button" class="kn-gross${z.falschKonj.includes(o) ? ' falsch' : ''}" data-konj="${o}">${ESC(o)}</button>`).join('')}</div>`;
    }
    if (z.schritt === 2) h += '<p>Im Nebensatz rollt das Verb ganz nach hinten. <b>Tippe den roten Verb-Wagen an.</b></p>';
    if (z.schritt === 3) h += '<p>Der Nebensatz hängt jetzt vorne. Darum fährt im Hauptsatz das Verb ganz nach vorn – direkt hinter die Kupplung. <b>Tippe den roten Wagen im Hauptsatz an.</b></p>';
    if (z.schritt === 4) h += '<p>Das Komma ist die Kupplung zwischen Hauptsatz und Nebensatz. <b>Tippe die Lücke an, in die das Komma gehört.</b></p>';
    if (z.schritt === 5) h += `<p class="tb-antwort gut">Gekoppelt! Das Komma steht vor dem Bindewort „${ESC(z.konj)}“.</p>
      <p class="fl-formel">${modus === 'hinten' ? 'Hauptsatz<b>,</b> Bindewort … Verb.' : 'Bindewort … Verb<b>,</b> Verb …'}</p>`;
    if (meldung) h += `<p class="tb-antwort ${meldung.ok ? 'gut' : 'schlecht'}">${meldung.text}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'hinten' ? 'Der Satzzug: Nebensatz hinten' : 'Der Satzzug: Nebensatz vorne');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  function start() {
    g.sprich(modus === 'hinten'
      ? 'Zwei Züge stehen auf dem Gleis. Wähle die Kupplung, die die beiden Sätze sinnvoll verbindet.'
      : 'Diesmal hängt der Nebensatz-Zug vorne. Wähle zuerst die passende Kupplung.');
  }

  root.addEventListener('click', async e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const k = e.target.closest('[data-konj]');
    if (k && z.schritt === 1) {
      const o = k.dataset.konj;
      if (o === a.k) { z.konj = o; z.schritt = 2; meldung = null; await flip(root, zeichne); g.sprich(`„${o}“ wird zum gelben Kupplungswagen. Jetzt ist der zweite Satz ein Nebensatz.`); }
      else { z.falschKonj.push(o); meldung = { ok: false, text: SINN[o] }; zeichne(); }
      return;
    }
    const t = e.target.closest('[data-tipp]');
    if (t && z.schritt === 2) {
      const v = z.neben.findIndex(x => x.verb);
      const [verb] = z.neben.splice(v, 1); z.neben.push(verb);
      z.schritt = modus === 'hinten' ? 4 : 3;
      await flip(root, zeichne);
      g.sprich(modus === 'hinten' ? 'Das Verb steht jetzt am Ende des Nebensatzes. Wo kommt die Kupplung – das Komma – hin?' : 'Das Verb steht am Ende des Nebensatzes. Jetzt ist der Hauptsatz dran.');
      return;
    }
    if (t && z.schritt === 3) {
      const v = z.haupt.findIndex(x => x.verb);
      const [verb] = z.haupt.splice(v, 1); z.haupt.unshift(verb);
      z.schritt = 4;
      await flip(root, zeichne);
      g.sprich('Verb, Komma, Verb – die beiden Verben stehen jetzt direkt nebeneinander. Wo kommt das Komma hin?');
      return;
    }
    const l = e.target.closest('[data-luecke]');
    if (l && z.schritt === 4) {
      const i = Number(l.dataset.luecke);
      const grenze = modus === 'hinten' ? z.haupt.length + 1 : z.neben.length + 1;
      if (i === grenze - 1) { z.schritt = 5; meldung = null; zeichne(); g.sprich('Richtig gekoppelt! Zwischen Hauptsatz und Nebensatz steht ein Komma.', 'fertig'); root.querySelector('.tb-antwort.gut')?.setAttribute('data-fertig', ''); }
      else { z.falscheLuecke = i; meldung = { ok: false, text: 'Hier ist keine Kupplung. Das Komma trennt den Hauptsatz (blau) vom Nebensatz (grün mit gelbem Wagen).' }; zeichne(); }
      return;
    }
    const b = e.target.closest('[data-zz]');
    if (!b) return;
    if (b.dataset.zz === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.zz === 'tipp') {
      g.sprich(z.schritt === 1 ? 'Lies den ganzen Satz mit jeder Kupplung leise vor. Welche ergibt einen sinnvollen Satz?'
        : z.schritt === 2 ? 'Im Nebensatz steht das Verb immer am Ende. Tippe den roten Wagen im grünen Zug an.'
          : z.schritt === 3 ? 'Steht der Nebensatz vorne, beginnt der Hauptsatz mit dem Verb.'
            : 'Das Komma kommt dorthin, wo der blaue und der grüne Zug zusammenstoßen – vor das Bindewort oder hinter das Verb des Nebensatzes.', 'tipp');
    }
  });

  neu(); zeichne(); start();
}
