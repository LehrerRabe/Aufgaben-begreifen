/* Deutsch: Satzarten und Satzzeichen mit der Stimmmelodie (Klasse 5).
   Eine Linie zeigt, wie die Stimme beim Sprechen verläuft:
   Aussagesatz – die Stimme geht am Ende nach unten (Punkt).
   Fragesatz (Ja-/Nein-Frage) – die Stimme geht am Ende nach oben (Fragezeichen).
   Ausrufe- und Aufforderungssatz – laut und kräftig, die Linie ist dick (Ausrufezeichen).
   Hinweis in der App: Bei W-Fragen geht die Stimme oft nicht hoch – das Fragewort am Anfang zeigt die Frage.
   „Melodie → Zeichen“: Linie ansehen (und anhören), dann das Satzzeichen wählen.
   „Zeichen → Melodie“: Satz mit Zeichen lesen, dann die passende Linie wählen.
   Anhören nutzt die Sprachausgabe des Geräts, falls vorhanden.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, ESC } from './geruest.js';

const ARTEN = {
  '.': { name: 'Aussagesatz', farbe: '#1f5fd1', text: 'Die Stimme geht am Ende nach unten.' },
  '?': { name: 'Fragesatz', farbe: '#13a3a8', text: 'Die Stimme geht am Ende nach oben.' },
  '!': { name: 'Ausrufe- oder Aufforderungssatz', farbe: '#d7263d', text: 'Laut und kräftig gesprochen.' },
};

const SAETZE = [
  ['Der Hund schläft im Körbchen', '.'], ['Morgen fahren wir in den Urlaub', '.'], ['Ich habe heute Mathe', '.'],
  ['Lea spielt gern Fußball', '.'], ['Im Herbst fallen die Blätter', '.'], ['Unsere Klasse macht einen Ausflug', '.'],
  ['Hast du heute Zeit', '?'], ['Kommst du mit ins Schwimmbad', '?'], ['Ist das dein Fahrrad', '?'],
  ['Magst du Pizza', '?'], ['Regnet es draußen', '?'], ['Darf ich mitspielen', '?'],
  ['Pass auf', '!'], ['Das ist ja toll', '!'], ['Komm sofort her', '!'], ['Hilfe', '!'], ['Hör auf damit', '!'], ['Was für ein schöner Tag', '!'],
];

const W = 600, H = 170;
/* Höhe der Stimme an der Stelle t (0…1) */
function hoehe(z, t) {
  if (z === '.') return t < 0.7 ? 78 : 78 + (t - 0.7) / 0.3 * 52;
  if (z === '?') return t < 0.7 ? 92 : 92 - (t - 0.7) / 0.3 * 64;
  return t < 0.15 ? 60 - t / 0.15 * 22 : t < 0.75 ? 38 : 38 + (t - 0.75) / 0.25 * 60;
}

function melodieSvg(z, woerter, { mitText = true, klein = false, zeichen = null, neutral = false } = {}) {
  const x0 = 30, x1 = W - 60;
  let d = '';
  for (let i = 0; i <= 40; i++) { const t = i / 40; d += `${i ? 'L' : 'M'}${(x0 + t * (x1 - x0)).toFixed(1)} ${hoehe(z, t).toFixed(1)} `; }
  const dick = z === '!' ? 14 : 5;
  const farbe = klein ? 'currentColor' : neutral ? 'var(--text)' : ARTEN[z].farbe;
  let s = `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="${klein ? dick * 1.4 : dick}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ende = hoehe(z, 1);
  if (!klein) s += `<circle cx="${x1}" cy="${ende}" r="${z === '!' ? 11 : 6}" fill="${farbe}"/>`;
  if (mitText) {
    const laenge = woerter.reduce((a, w) => a + w.length + 1, 0);
    let pos = 0;
    woerter.forEach(w => {
      const t = (pos + w.length / 2) / laenge; pos += w.length + 1;
      const x = x0 + t * (x1 - x0) * 0.98, y = hoehe(z, t) - 16;
      s += `<text x="${x}" y="${y}" text-anchor="middle" class="ml-wort${z === '!' ? ' laut' : ''}">${ESC(w)}</text>`;
    });
  }
  if (zeichen) s += `<text x="${x1 + 26}" y="${ende + 12}" text-anchor="middle" class="ml-zeichen" fill="${ARTEN[zeichen].farbe}">${zeichen}</text>`;
  return `<svg class="ml-svg${klein ? ' klein' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Stimmmelodie">${s}</svg>`;
}

const STIL = `
.ml-svg { display: block; width: 100%; max-width: none; height: auto; background: var(--flaeche); border: 2px solid var(--rand); border-radius: 14px; }
.ml-svg.klein { border: 0; background: none; }
.ml-wort { font: 700 21px var(--schrift); fill: var(--text); }
.ml-wort.laut { font-size: 25px; font-weight: 900; }
.ml-zeichen { font: 900 46px var(--titel); }
.ml-wahl { display: flex; gap: .6rem; flex-wrap: wrap; margin: .6rem 0; }
.ml-wahl .kn-gross { min-width: 4.2rem; justify-content: center; font: 900 2rem/1 var(--titel); }
.ml-wahl .kn-gross.falsch, .ml-karte.falsch { border-color: var(--schlecht); background: var(--schlecht-sanft); color: var(--schlecht); }
.ml-karten { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .6rem; margin: .8rem 0; }
.ml-karte { border: 3px solid var(--rand); border-radius: 14px; background: var(--flaeche); color: var(--text); padding: .3rem; cursor: pointer; }
.ml-karte.richtig { border-color: var(--gut); background: var(--gut-sanft); color: var(--gut); }
.ml-satz { font: 800 1.6rem/1.4 var(--schrift); text-align: center; background: var(--flaeche); border: 2px solid var(--rand); border-radius: 14px; padding: .8rem; }
.ml-satz.laut { font-size: 1.85rem; }
.ml-hoeren { margin: .6rem 0; }
.ml-art { font: 800 1.2rem var(--titel); }
`;

export function starteSatzmelodie(root) {
  if (!document.getElementById('ml-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="ml-stil">${STIL}</style>`);
  const kannSprechen = 'speechSynthesis' in window;
  let modus = 'zeichen', liste = mischen(SAETZE), idx = 0, s, falsch, geloest;

  const g = geruest(root, {
    etikett: 'Satzzeichen', titel: '',
    reiter: [{ id: 'zeichen', titel: 'Melodie → Zeichen', unter: 'Welches Zeichen passt?' }, { id: 'melodie', titel: 'Zeichen → Melodie', unter: 'Welche Linie passt?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-sm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-sm="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() { s = liste[idx++ % liste.length]; falsch = []; geloest = false; }

  function sprich() {
    if (!kannSprechen) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(s[0] + s[1]);
    u.lang = 'de-DE'; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find(x => x.lang?.startsWith('de'));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  function links() {
    const woerter = s[0].split(' ');
    const hoeren = kannSprechen ? '<div class="ml-hoeren"><button type="button" class="kn-gross" data-sm="hoeren">🔊 Anhören</button></div>' : '';
    if (modus === 'zeichen') {
      return `${melodieSvg(s[1], woerter, { zeichen: geloest ? s[1] : null, neutral: !geloest })}${hoeren}
        <h3 class="eh-zwischen">Welches Zeichen gehört ans Ende?</h3>
        <div class="ml-wahl">${['.', '?', '!'].map(z => `<button type="button" class="kn-gross${falsch.includes(z) ? ' falsch' : ''}" data-zeichen="${z}" ${geloest ? 'disabled' : ''} aria-label="${ARTEN[z].name}">${z}</button>`).join('')}</div>`;
    }
    return `<p class="ml-satz${s[1] === '!' ? ' laut' : ''}">${ESC(s[0])}${s[1]}</p>${hoeren}
      <h3 class="eh-zwischen">Wie verläuft deine Stimme? Tippe die passende Linie an.</h3>
      <div class="ml-karten">${['.', '?', '!'].map(z => `<button type="button" class="ml-karte${falsch.includes(z) ? ' falsch' : geloest && z === s[1] ? ' richtig' : ''}" data-linie="${z}" aria-label="${ARTEN[z].text}">${melodieSvg(z, [], { mitText: false, klein: true })}</button>`).join('')}</div>
      ${geloest ? melodieSvg(s[1], woerter, { zeichen: s[1] }) : ''}`;
  }

  function rechts() {
    let h = `<h2 class="bereich-titel">Die Stimme zeigt das Zeichen</h2><ul class="sg-merke">${Object.entries(ARTEN).map(([z, a]) => `<li><b style="color:${a.farbe}">${z} ${a.name}:</b> ${a.text}</li>`).join('')}</ul>
      <p class="leise">Bei Fragen mit einem <b>W-Wort</b> (Wo? Wann? Warum?) geht die Stimme oft <b>nicht</b> hoch. Da zeigt dir das Fragewort am Anfang, dass es eine Frage ist.</p>`;
    if (geloest) h += `<p class="tb-antwort gut">Richtig: <span class="ml-art">${ARTEN[s[1]].name}</span> – ${ESC(s[0])}${s[1]}</p>`;
    else if (falsch.length) h += `<p class="tb-antwort schlecht">${modus === 'zeichen' ? 'Schau auf das Ende der Linie: Geht sie hoch, runter – oder ist sie ganz dick?' : 'Lies den Satz laut. Was macht deine Stimme am Ende?'}</p>`;
    return h;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'zeichen' ? 'Satzmelodie: Welches Zeichen?' : 'Satzmelodie: Welche Linie?');
    g.links.innerHTML = links(); g.rechts.innerHTML = rechts();
  }

  function antwort(z) {
    if (geloest) return;
    if (z === s[1]) { geloest = true; g.sprich(`${ARTEN[z].name}: ${ARTEN[z].text}`, 'fertig'); }
    else if (!falsch.includes(z)) falsch.push(z);
    zeichne();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const z = e.target.closest('[data-zeichen]');
    if (z) { antwort(z.dataset.zeichen); return; }
    const l = e.target.closest('[data-linie]');
    if (l) { antwort(l.dataset.linie); return; }
    const b = e.target.closest('[data-sm]');
    if (!b) return;
    if (b.dataset.sm === 'hoeren') sprich();
    if (b.dataset.sm === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.sm === 'tipp') g.sprich(modus === 'zeichen' ? 'Fahre die Linie mit dem Finger nach und sprich den Satz so, wie die Linie geht.' : 'Sprich den Satz laut und achte auf das Ende: Geht deine Stimme hoch oder runter? Bist du laut?', 'tipp');
  });

  function start() { g.sprich(modus === 'zeichen' ? 'Die Linie zeigt, wie die Stimme beim Sprechen geht. Welches Satzzeichen passt?' : 'Lies den Satz. Welche Linie zeigt, wie deine Stimme dabei geht?'); }

  neu(); zeichne(); start();
}
