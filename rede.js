/* Deutsch: Wörtliche Rede mit der Sprechblase (Klasse 5).
   Eine Person sagt etwas – das Gesagte steht in einer Sprechblase. In der Schreibzeile ist die Rede ebenfalls eine
   Sprechblase: Wo die Blase aufgeht, steht „ (unten), wo sie zugeht, steht “ (oben).
   Die Satzzeichen werden in die Lücken getippt: erst Lücke wählen, dann Zeichen antippen.
   Reiter: Begleitsatz vorne (Lea sagt: „…“) und Begleitsatz hinten („…“, sagt Lea.).
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, ESC } from './geruest.js';

/* wer, Verb (sagt/fragt/ruft), Rede ohne Endzeichen, Endzeichen der Rede */
const REDEN = [
  { wer: 'Lea', verb: 'sagt', rede: 'Ich habe Hunger', z: '.' },
  { wer: 'Tom', verb: 'fragt', rede: 'Kommst du mit ins Kino', z: '?' },
  { wer: 'Mama', verb: 'ruft', rede: 'Das Essen ist fertig', z: '!' },
  { wer: 'Oma', verb: 'erzählt', rede: 'Früher hatten wir keinen Fernseher', z: '.' },
  { wer: 'Ben', verb: 'fragt', rede: 'Wo ist mein Turnbeutel', z: '?' },
  { wer: 'die Trainerin', verb: 'ruft', rede: 'Lauft schneller', z: '!' },
  { wer: 'Mia', verb: 'sagt', rede: 'Morgen schreiben wir einen Test', z: '.' },
  { wer: 'Papa', verb: 'fragt', rede: 'Hast du deine Hausaufgaben gemacht', z: '?' },
  { wer: 'der Lehrer', verb: 'ruft', rede: 'Seid bitte leise', z: '!' },
  { wer: 'Emil', verb: 'erklärt', rede: 'Mein Hund heißt Bello', z: '.' },
  { wer: 'Lina', verb: 'fragt', rede: 'Darf ich mitspielen', z: '?' },
  { wer: 'Paul', verb: 'jubelt', rede: 'Wir haben gewonnen', z: '!' },
];

const ZEICHEN = ['„', '“', ':', ',', '.', '?', '!'];
const gross = s => s[0].toUpperCase() + s.slice(1);

const STIL = `
.wr-szene { display: flex; align-items: flex-end; gap: .5rem; margin: .2rem 0 1rem; }
.wr-person { width: 5.5rem; flex: none; }
.wr-person svg { width: 100%; height: auto; display: block; }
.wr-person b { display: block; text-align: center; font: 700 1rem var(--schrift); }
.wr-blase { position: relative; background: var(--flaeche); border: 4px solid var(--text); border-radius: 26px; padding: .7rem 1rem; font: 700 1.3rem/1.35 var(--schrift); margin-bottom: 3.2rem; max-width: 26rem; }
.wr-blase::after { content: ''; position: absolute; left: -14px; bottom: -4px; width: 26px; height: 22px; background: var(--flaeche); border-left: 4px solid var(--text); border-bottom: 4px solid var(--text); transform: skewX(35deg); border-radius: 0 0 0 6px; }
.wr-zeile { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem .2rem; font: 700 1.35rem/1.4 var(--schrift); background: var(--flaeche);
  border: 2px solid var(--rand); border-radius: 14px; padding: .9rem .7rem; background-image: linear-gradient(to bottom, transparent 78%, var(--rand) 78%, var(--rand) calc(78% + 2px), transparent calc(78% + 2px)); }
.wr-redeteil { border: 3px solid var(--text); border-radius: 18px; padding: .1rem .55rem; background: var(--info-sanft); }
.wr-luecke { min-width: 2.2rem; height: 2.4rem; padding: 0 .3rem; border: 3px dashed var(--rand); border-radius: 10px; background: var(--bg); color: var(--akzent);
  font: 900 1.7rem/1 var(--titel); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.wr-luecke.an { border-color: var(--akzent); border-style: solid; box-shadow: 0 0 0 3px color-mix(in srgb, var(--akzent) 30%, transparent); }
.wr-luecke.richtig { border-color: var(--gut); border-style: solid; background: var(--gut-sanft); color: var(--gut); }
.wr-luecke.falsch { border-color: var(--schlecht); border-style: solid; background: var(--schlecht-sanft); color: var(--schlecht); }
.wr-zeichen { display: flex; flex-wrap: wrap; gap: .45rem; margin: .6rem 0; }
.wr-zeichen .kn-gross { min-width: 3.3rem; justify-content: center; font: 900 1.8rem/1 var(--titel); }
.wr-merk { display: grid; grid-template-columns: auto 1fr; gap: .3rem .7rem; align-items: center; margin: .5rem 0; }
.wr-merk .q { font: 900 2.2rem/1 var(--titel); color: var(--akzent); text-align: center; }
`;

export function starteRede(root) {
  if (!document.getElementById('wr-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="wr-stil">${STIL}</style>`);
  let modus = 'vorne', liste = mischen(REDEN), idx = 0, r, luecken, aktiv, geprueft, bewertung;

  const g = geruest(root, {
    etikett: 'Satzzeichen', titel: '',
    reiter: [{ id: 'vorne', titel: 'Begleitsatz vorne', unter: 'Lea sagt: „…“' }, { id: 'hinten', titel: 'Begleitsatz hinten', unter: '„…“, sagt Lea.' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-wr="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-wr="neu">＋ Neue Aufgabe</button>`,
  });

  /* Lücken: 0 vor dem ersten Teil, 1 zwischen den Teilen, 2 am Ende */
  function soll() {
    if (modus === 'vorne') return ['', ':„', r.z + '“'];
    return ['„', (r.z === '.' ? '' : r.z) + '“,', '.'];
  }
  function begleit() { return modus === 'vorne' ? gross(`${r.wer} ${r.verb}`) : `${r.verb} ${r.wer}`; }

  function neu() { r = liste[idx++ % liste.length]; luecken = ['', '', '']; aktiv = 0; geprueft = false; bewertung = null; }

  const person = () => `<svg viewBox="0 0 80 110" aria-hidden="true"><circle cx="40" cy="28" r="20" fill="#f4c59a"/>
    <circle cx="33" cy="25" r="3" fill="#1b2340"/><circle cx="47" cy="25" r="3" fill="#1b2340"/><ellipse cx="40" cy="37" rx="7" ry="${r.z === '!' ? 6 : 4}" fill="#b3161b"/>
    <path d="M14 108 Q14 58 40 54 Q66 58 66 108Z" fill="${r.z === '?' ? '#13a3a8' : r.z === '!' ? '#d7263d' : '#1f5fd1'}"/></svg>`;

  function luecke(i) {
    const s = soll();
    const kl = geprueft ? (luecken[i] === s[i] ? ' richtig' : ' falsch') : aktiv === i ? ' an' : '';
    return `<button type="button" class="wr-luecke${kl}" data-luecke="${i}" aria-label="Lücke ${i + 1}">${ESC(luecken[i]) || '&nbsp;'}</button>`;
  }

  function links() {
    const teil = `<span class="wr-redeteil">${ESC(r.rede)}</span>`;
    const b = `<span>${ESC(begleit())}</span>`;
    const zeile = modus === 'vorne' ? luecke(0) + b + luecke(1) + teil + luecke(2) : luecke(0) + teil + luecke(1) + b + luecke(2);
    return `<div class="wr-szene"><div class="wr-person">${person()}<b>${ESC(gross(r.wer))}</b></div><div class="wr-blase">${ESC(r.rede)}${ESC(r.z)}</div></div>
      <h3 class="eh-zwischen">Schreib es auf – setze die Zeichen in die Lücken</h3>
      <div class="wr-zeile">${zeile}</div>
      <div class="wr-zeichen">${ZEICHEN.map(z => `<button type="button" class="kn-gross" data-zeichen="${z}" ${geprueft && bewertung?.ok ? 'disabled' : ''}>${z}</button>`).join('')}
        <button type="button" class="kn-gross kn-leise" data-wr="loeschen" aria-label="Lücke leeren">⌫</button></div>
      <p class="leise">Manche Lücken brauchen zwei Zeichen, eine Lücke bleibt vielleicht leer.</p>`;
  }

  function rechts() {
    return `<h2 class="bereich-titel">Die Sprechblase</h2>
      <div class="wr-merk"><span class="q">„</span><span>Hier geht die Blase <b>auf</b> – Anführungszeichen <b>unten</b>.</span>
        <span class="q">“</span><span>Hier geht die Blase <b>zu</b> – Anführungszeichen <b>oben</b>.</span></div>
      <p class="fl-formel">${modus === 'vorne' ? 'Lea sagt<b>: „</b>Ich habe Hunger<b>.“</b>' : '<b>„</b>Ich habe Hunger<b>“,</b> sagt Lea<b>.</b><br><b>„</b>Hast du Hunger<b>?“,</b> fragt Lea<b>.</b>'}</p>
      ${modus === 'hinten' ? '<p class="leise">Steht der Begleitsatz hinten, fällt der Punkt der Rede weg. Fragezeichen und Ausrufezeichen bleiben.</p>' : '<p class="leise">Steht der Begleitsatz vorne, kommt ein Doppelpunkt dahinter. Das Satzzeichen der Rede bleibt in der Blase.</p>'}
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-wr="pruefen">✓ Prüfen</button></div>
      ${bewertung ? `<p class="tb-antwort ${bewertung.ok ? 'gut' : 'schlecht'}">${bewertung.text}</p>` : ''}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'vorne' ? 'Wörtliche Rede: Begleitsatz vorne' : 'Wörtliche Rede: Begleitsatz hinten');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  function pruefen() {
    const s = soll();
    geprueft = true;
    const falsch = luecken.map((l, i) => (l === s[i] ? null : i)).filter(i => i !== null);
    if (!falsch.length) {
      const text = modus === 'vorne' ? `${begleit()}: „${r.rede}${r.z}“` : `„${r.rede}${r.z === '.' ? '' : r.z}“, ${begleit()}.`;
      bewertung = { ok: true, text: `Richtig: ${ESC(text)}` };
      g.sprich('Die Blase ist richtig auf- und zugemacht!', 'fertig');
    } else {
      const namen = ['am Anfang', 'in der Mitte', 'am Ende'];
      bewertung = { ok: false, text: `Schau noch einmal ${falsch.map(i => namen[i]).join(' und ')}.` };
    }
    zeichne();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const l = e.target.closest('[data-luecke]');
    if (l) { if (bewertung?.ok) return; aktiv = Number(l.dataset.luecke); if (geprueft) { geprueft = false; bewertung = null; } zeichne(); return; }
    const z = e.target.closest('[data-zeichen]');
    if (z) {
      if (bewertung?.ok) return;
      if (geprueft) { geprueft = false; bewertung = null; }
      if (luecken[aktiv].length < 3) luecken[aktiv] += z.dataset.zeichen;
      zeichne(); return;
    }
    const b = e.target.closest('[data-wr]');
    if (!b) return;
    const was = b.dataset.wr;
    if (was === 'loeschen' && !bewertung?.ok) { luecken[aktiv] = luecken[aktiv].slice(0, -1); geprueft = false; bewertung = null; zeichne(); }
    if (was === 'pruefen') pruefen();
    if (was === 'neu') { neu(); zeichne(); start(); }
    if (was === 'tipp') g.sprich(modus === 'vorne' ? 'Hinter dem Begleitsatz steht ein Doppelpunkt. Dann geht die Blase auf: „ unten. Das Zeichen der Rede kommt noch in die Blase, dann geht sie zu: “ oben.'
      : 'Die Blase geht ganz am Anfang auf. Nach der Rede geht sie zu, dann kommt ein Komma. Ganz am Ende steht ein Punkt.', 'tipp');
  });

  function start() { g.sprich(`${gross(r.wer)} sagt etwas. Tippe eine Lücke an und dann die Zeichen, die hineingehören.`); }

  neu(); zeichne(); start();
}
