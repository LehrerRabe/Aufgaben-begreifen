/* Mathematik: Passt das? Größen und Einheiten (Klasse 6, UV „Brüche in Dezimalschreibweise“, Abschnitt Größen).
   „Einheit wählen“: Ein Gegenstand mit Maßzahl (oft Dezimalzahl) – die passende Einheit antippen.
   „Fehlerdetektiv“: Stimmt die Angabe? Wenn nicht: richtige Einheit wählen. Danach Vergleich mit einem Stützpunkt
     und Umrechnung (z. B. 0,75 km = 750 m – so hoch ist kein Tisch). */

import { geruest, wahl, antwortHtml } from './geruest.js';

const EINHEITEN = {
  L: [['mm', 1], ['cm', 10], ['m', 1000], ['km', 1000000]],
  M: [['g', 1], ['kg', 1000], ['t', 1000000]],
  V: [['ml', 1], ['l', 1000]],
};
/* n: Gegenstand, w: Maßzahl (Text), e: richtige Einheit, h: Stützpunkt-Hinweis */
const DINGE = [
  { a: 'L', b: '🚌', n: 'Ein Linienbus ist', w: '12', e: 'm', h: 'Ein großer Schritt ist etwa 1 m – ein Bus ist etwa 12 große Schritte lang.' },
  { a: 'L', b: '🐜', n: 'Eine Ameise ist', w: '5', e: 'mm', h: 'Der kleine Finger ist etwa 1 cm = 10 mm breit – eine Ameise ist halb so lang.' },
  { a: 'L', b: '📄', n: 'Ein DIN-A4-Blatt ist', w: '29,7', e: 'cm', h: 'Drei Handbreiten (je etwa 10 cm) sind ungefähr so hoch wie ein Blatt.' },
  { a: 'L', b: '🎒', n: 'Mein Schulweg ist', w: '1,8', e: 'km', h: 'Für 1 km braucht man zu Fuß etwa 12 Minuten.' },
  { a: 'L', b: '🚪', n: 'Eine Tür ist', w: '2', e: 'm', h: 'Die Türhöhe ist selbst ein Stützpunkt: etwa 2 m.' },
  { a: 'L', b: '✏️', n: 'Ein neuer Bleistift ist', w: '17,5', e: 'cm', h: 'Ein Bleistift ist knapp zwei Handbreiten (je etwa 10 cm) lang.' },
  { a: 'L', b: '🐞', n: 'Ein Marienkäfer ist', w: '0,7', e: 'cm', h: '0,7 cm = 7 mm – etwas kleiner als die Breite des kleinen Fingers.' },
  { a: 'L', b: '🪑', n: 'Ein Schreibtisch ist', w: '0,75', e: 'm', h: '0,75 m = 75 cm – das reicht dir etwa bis zur Hüfte.' },
  { a: 'L', b: '🏃', n: 'Ein Marathon ist', w: '42,195', e: 'km', h: 'Zu Fuß bräuchte man dafür über 8 Stunden (12 Minuten pro km).' },
  { a: 'L', b: '🦒', n: 'Eine Giraffe ist', w: '5,5', e: 'm', h: 'Fast drei Türen übereinander (Tür: etwa 2 m).' },
  { a: 'L', b: '📃', n: 'Ein Blatt Papier ist', w: '0,1', e: 'mm', h: 'Ein Stapel aus 10 Blättern ist etwa 1 mm dick.' },
  { a: 'L', b: '🏫', n: 'Unser Klassenraum ist', w: '9', e: 'm', h: 'Etwa 9 große Schritte (je 1 m).' },
  { a: 'M', b: '🥚', n: 'Ein Ei wiegt', w: '60', e: 'g', h: 'Eine Tafel Schokolade wiegt 100 g – ein Ei etwas mehr als die Hälfte.' },
  { a: 'M', b: '🐘', n: 'Ein Elefant wiegt', w: '5', e: 't', h: 'Ein kleines Auto wiegt etwa 1 t – ein Elefant so viel wie 5 Autos.' },
  { a: 'M', b: '🚲', n: 'Ein Fahrrad wiegt', w: '14,5', e: 'kg', h: 'Ein Liter Milch wiegt 1 kg – ein Fahrrad so viel wie etwa 15 Milchtüten.' },
  { a: 'M', b: '🍫', n: 'Eine Tafel Schokolade wiegt', w: '0,1', e: 'kg', h: '0,1 kg = 100 g – die Tafel Schokolade ist selbst ein Stützpunkt.' },
  { a: 'M', b: '🍎', n: 'Ein Apfel wiegt', w: '0,15', e: 'kg', h: '0,15 kg = 150 g – etwa anderthalb Tafeln Schokolade.' },
  { a: 'M', b: '📎', n: 'Eine Büroklammer wiegt', w: '1', e: 'g', h: 'Die Büroklammer ist der Stützpunkt für 1 g.' },
  { a: 'M', b: '🚗', n: 'Ein Auto wiegt', w: '1,4', e: 't', h: '1,4 t = 1400 kg – so viel wie etwa 40 Kinder.' },
  { a: 'M', b: '🧈', n: 'Ein Päckchen Butter wiegt', w: '250', e: 'g', h: 'Zweieinhalb Tafeln Schokolade (je 100 g).' },
  { a: 'M', b: '🐕', n: 'Ein großer Hund wiegt', w: '30', e: 'kg', h: 'So viel wie 30 Liter Milch – ungefähr so schwer wie ein Kind in der 3. Klasse.' },
  { a: 'M', b: '🎒', n: 'Eine volle Schultasche wiegt', w: '5,5', e: 'kg', h: 'Etwa 5 bis 6 Milchtüten (je 1 kg).' },
  { a: 'V', b: '🥛', n: 'In ein Trinkglas passen', w: '0,2', e: 'l', h: '0,2 l = 200 ml – fünf Gläser füllen eine Milchtüte (1 l).' },
  { a: 'V', b: '🥄', n: 'Ein Teelöffel fasst', w: '5', e: 'ml', h: 'Etwa 200 Teelöffel füllen eine Milchtüte (1 l = 1000 ml).' },
  { a: 'V', b: '🛁', n: 'Eine Badewanne fasst', w: '150', e: 'l', h: 'Das sind 150 Milchtüten (je 1 l).' },
  { a: 'V', b: '🪣', n: 'Ein Putzeimer fasst', w: '10', e: 'l', h: 'Zehn Milchtüten (je 1 l).' },
  { a: 'V', b: '🍼', n: 'Eine Trinkflasche fasst', w: '0,75', e: 'l', h: '0,75 l = 750 ml – eine Dreiviertel-Milchtüte.' },
  { a: 'V', b: '☕', n: 'Eine Tasse fasst', w: '250', e: 'ml', h: '250 ml = 0,25 l – ein Viertel Liter.' },
  { a: 'V', b: '🐟', n: 'Ein kleines Aquarium fasst', w: '54', e: 'l', h: 'Über 50 Milchtüten (je 1 l).' },
];

const TIPP = {
  L: 'Stützpunkte Länge: kleiner Finger ≈ 1 cm · Handbreite ≈ 10 cm · großer Schritt ≈ 1 m · Tür ≈ 2 m · 12 Minuten zu Fuß ≈ 1 km.',
  M: 'Stützpunkte Masse: Büroklammer ≈ 1 g · Tafel Schokolade = 100 g · Liter Milch ≈ 1 kg · kleines Auto ≈ 1 t.',
  V: 'Stützpunkte Volumen: Teelöffel ≈ 5 ml · Trinkglas ≈ 0,2 l · Milchtüte = 1 l · Putzeimer ≈ 10 l.',
};
const zahl = w => Number(w.replace(',', '.'));
const fmt = x => x.toFixed(9).replace(/\.?0+$/, '').replace('.', ',');
function tausender(s) { const [g, r] = s.split(','); return g.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (r ? ',' + r : ''); }
/** Wert in Einheit e1 nach e2 umrechnen (Text) */
function um(w, a, e1, e2) {
  const f1 = EINHEITEN[a].find(x => x[0] === e1)[1], f2 = EINHEITEN[a].find(x => x[0] === e2)[1];
  return tausender(fmt((zahl(w) * f1) / f2));
}
/** passende Vergleichseinheit für die Umrechnung */
function vergleich(a, e) { return { L: { mm: 'cm', cm: 'm', m: 'cm', km: 'm' }, M: { g: 'kg', kg: 'g', t: 'kg' }, V: { ml: 'l', l: 'ml' } }[a][e]; }

const STIL = `<style id="pl-stil">
.pl-bild { font-size: 4.5rem; line-height: 1; margin: .3rem 0; }
.pl-satz { font: 700 clamp(1.4rem, 4vw, 1.9rem)/1.35 var(--titel); }
.pl-satz .luecke { display: inline-block; min-width: 3.2rem; border-bottom: 3px solid var(--akzent); text-align: center; }
.pl-satz .falsch { text-decoration: line-through; color: var(--schlecht); }
.pl-wahl { display: flex; flex-wrap: wrap; gap: .5rem; margin: .6rem 0; }
.pl-wahl button { min-width: 4.2rem; }
.pl-wahl button.gewaehlt { border-color: var(--akzent); background: var(--akzent); color: var(--akzent-text); }
.pl-merk { margin-top: .6rem; padding: .5rem .7rem; border-left: 4px solid var(--akzent); background: color-mix(in srgb, var(--akzent) 10%, transparent); border-radius: 6px; }
.pl-stuetz { margin-top: .6rem; padding: .5rem .7rem; border-left: 4px solid #f29a12; background: #fff6e5; border-radius: 6px; color: #3a2c00; }
</style>`;

export function startePlausibel(root) {
  let modus = 'einheit', d, gezeigt, stimmt, schritt, gewaehlt = null, bewertung = null, letzte = null;

  const g = geruest(root, {
    etikett: 'Größen', titel: 'Passt das? Größen und Einheiten',
    reiter: [{ id: 'einheit', titel: 'Einheit wählen', unter: 'Welche Einheit passt?' }, { id: 'detektiv', titel: 'Fehlerdetektiv', unter: 'Kann das stimmen?' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-pl="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-pl="neu">＋ Neue Aufgabe</button>`,
  });
  root.insertAdjacentHTML('afterbegin', STIL);

  function neu() {
    do { d = wahl(DINGE); } while (d === letzte); letzte = d;
    gewaehlt = null; bewertung = null; schritt = 1;
    stimmt = modus === 'detektiv' ? Math.random() < 0.35 : true;
    gezeigt = stimmt ? d.e : wahl(EINHEITEN[d.a].map(x => x[0]).filter(e => e !== d.e));
  }

  const knoepfe = attr => `<div class="pl-wahl">${EINHEITEN[d.a].map(x => x[0])
    .map(e => `<button type="button" class="kn-gross kn-leise${gewaehlt === e ? ' gewaehlt' : ''}" data-${attr}="${e}">${e}</button>`).join('')}</div>`;

  function aufloesung() {
    const v = vergleich(d.a, d.e);
    let h = `<div class="pl-merk" data-fertig>${d.n} ${d.w} ${d.e}${v ? ` = ${um(d.w, d.a, d.e, v)} ${v}` : ''}.`;
    if (modus === 'detektiv' && !stimmt) h += `<br>Mit „${gezeigt}“ wären es ${um(d.w, d.a, gezeigt, d.e)} ${d.e} – das kann nicht sein.`;
    return h + `</div><div class="pl-stuetz"><b>Stützpunkt:</b> ${d.h}</div>`;
  }

  function zeichne() {
    g.reiter(modus);
    const satzEinheit = modus === 'einheit'
      ? (schritt === 1 ? '<span class="luecke">?</span>' : `<span class="luecke">${d.e}</span>`)
      : (schritt >= 3 && !stimmt ? `<span class="falsch">${gezeigt}</span> ${d.e}` : gezeigt);
    g.links.innerHTML = `<p class="pl-bild" aria-hidden="true">${d.b}</p><p class="pl-satz">${d.n} ${d.w} ${satzEinheit}.</p>`;
    let r = '';
    if (modus === 'einheit') {
      r = schritt === 1 ? `<h2 class="bereich-titel">Welche Einheit passt?</h2>${knoepfe('einheit')}<p class="leise">Denke an einen Stützpunkt: Was kennst du, das ungefähr so groß oder so schwer ist?</p>` : aufloesung();
    } else if (schritt === 1) {
      r = `<h2 class="bereich-titel">Kann das stimmen?</h2><div class="pl-wahl"><button type="button" class="kn-gross kn-leise" data-urteil="ja">✓ passt</button><button type="button" class="kn-gross kn-leise" data-urteil="nein">✗ passt nicht</button></div>`;
    } else if (schritt === 2) {
      r = `<h2 class="bereich-titel">Welche Einheit wäre richtig?</h2>${knoepfe('einheit')}`;
    } else r = aufloesung();
    g.rechts.innerHTML = r + antwortHtml(bewertung);
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const u = e.target.closest('[data-urteil]');
    if (u && modus === 'detektiv' && schritt === 1) {
      const sagtJa = u.dataset.urteil === 'ja';
      if (sagtJa === stimmt) {
        if (stimmt) { schritt = 3; bewertung = { ok: true, text: 'Richtig – das passt.' }; }
        else { schritt = 2; bewertung = null; g.sprich('Richtig erkannt! Welche Einheit wäre passend?', 'fertig'); }
      } else bewertung = { ok: false, text: sagtJa ? `Rechne um: ${d.w} ${gezeigt} = ${um(d.w, d.a, gezeigt, d.e)} ${d.e}. Kann das sein?` : 'Doch – das passt! Vergleiche mit einem Stützpunkt.' };
      zeichne(); return;
    }
    const ein = e.target.closest('[data-einheit]');
    if (ein && ((modus === 'einheit' && schritt === 1) || (modus === 'detektiv' && schritt === 2))) {
      gewaehlt = ein.dataset.einheit;
      if (gewaehlt === d.e) { schritt = 3; bewertung = { ok: true, text: `Richtig: ${d.w} ${d.e}` }; g.sprich('Mit Stützpunkten kannst du prüfen, ob eine Angabe stimmen kann.', 'fertig'); }
      else if (modus === 'detektiv' && gewaehlt === gezeigt) bewertung = { ok: false, text: 'Diese Einheit stand schon da – sie passt ja gerade nicht.' };
      else bewertung = { ok: false, text: `${d.w} ${gewaehlt} = ${um(d.w, d.a, gewaehlt, d.e)} ${d.e}. ${EINHEITEN[d.a].findIndex(x => x[0] === gewaehlt) > EINHEITEN[d.a].findIndex(x => x[0] === d.e) ? 'Viel zu groß!' : 'Viel zu klein!'}` };
      zeichne(); return;
    }
    const b = e.target.closest('[data-pl]');
    if (!b) return;
    if (b.dataset.pl === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.pl === 'tipp') g.sprich(TIPP[d.a], 'tipp');
  });

  function start() { g.sprich(modus === 'einheit' ? 'Welche Einheit passt? Denke an Dinge, die du gut kennst.' : 'Stimmt die Angabe? Rechne um und vergleiche mit einem Stützpunkt.'); }
  neu(); zeichne(); start();
}
