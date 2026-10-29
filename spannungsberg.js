/* Deutsch: Der Spannungsberg einer Erzählung (Klasse 5/6).
   Eine Geschichte ist wie ein Berg: Einleitung unten (Wer? Wo? Wann?), im Hauptteil steigt die Spannung,
   am Gipfel steht der Höhepunkt, im Schluss geht es wieder hinunter.
   Die Abschnitte einer Geschichte sind durcheinander. Abschnitt antippen, dann die Stelle am Berg.
   Ein Wanderer steigt mit jedem richtig gelegten Abschnitt weiter.
   Die Gestaltung (CSS) bringt der Baustein selbst mit. */

import { geruest, mischen, ESC } from './geruest.js';

const STELLEN = [
  { name: 'Einleitung', frage: 'Wer? Wo? Wann?', x: 70, y: 232 },
  { name: 'Hauptteil', frage: 'Etwas passiert …', x: 190, y: 170 },
  { name: 'Hauptteil', frage: 'Die Spannung steigt …', x: 270, y: 108 },
  { name: 'Höhepunkt', frage: 'Am spannendsten!', x: 360, y: 42 },
  { name: 'Schluss', frage: 'Wie geht es aus?', x: 540, y: 232 },
];

const GESCHICHTEN = [
  { titel: 'Mimi ist weg', teile: [
    'Am Samstagmorgen spielte Lina im Garten mit ihrer Katze Mimi.',
    'Plötzlich sprang Mimi über den Zaun und war verschwunden.',
    'Lina suchte überall: im Park, auf dem Spielplatz, hinter den Garagen. Langsam wurde es dunkel.',
    'Da hörte sie ein leises Miauen – hoch oben in einer Tanne saß Mimi und zitterte.',
    'Mit Papas Leiter holten sie Mimi herunter. Am Abend schlief die Katze zufrieden auf Linas Bett.'] },
  { titel: 'Das Endspiel', teile: [
    'Am letzten Schultag spielte die 5b im Fußball-Endspiel gegen die 5a.',
    'Kurz vor der Pause schoss die 5a das 1:0. Die 5b ließ die Köpfe hängen.',
    'In der zweiten Hälfte kämpfte die 5b. Tom traf den Pfosten, dann die Latte. Nur noch eine Minute!',
    'Da bekam Ayla den Ball, lief an zwei Spielern vorbei und schoss – Tor! Ausgleich in letzter Sekunde!',
    'Im Elfmeterschießen gewann die 5b. Den Pokal stellten sie stolz in ihren Klassenraum.'] },
  { titel: 'Die Nachtwanderung', teile: [
    'Auf der Klassenfahrt im Harz machte unsere Klasse an einem Abend eine Nachtwanderung.',
    'Mitten im Wald ging plötzlich Bens Taschenlampe aus. Es war stockdunkel.',
    'Hinter uns knackte es im Gebüsch. Die Geräusche kamen immer näher. Niemand traute sich, etwas zu sagen.',
    'Auf einmal sprang etwas Großes auf den Weg – und blieb vor uns stehen.',
    'Es war nur ein Reh. Wir lachten erleichtert und gingen fröhlich zurück zur Jugendherberge.'] },
  { titel: 'Der verlorene Schlüssel', teile: [
    'Am Montag kam Emil nach der Schule allein nach Hause. Seine Eltern waren noch bei der Arbeit.',
    'Vor der Haustür griff er in seine Tasche – der Schlüssel war weg!',
    'Er durchsuchte seinen Ranzen, lief den ganzen Schulweg zurück und fragte im Sekretariat. Nichts!',
    'Erschöpft setzte er sich auf die Treppe. Da glitzerte etwas im Blumenkübel neben der Tür – sein Schlüssel!',
    'Er war ihm am Morgen aus der Jacke gefallen. Seitdem hängt der Schlüssel an einem Band um seinen Hals.'] },
  { titel: 'Das Gewitter', teile: [
    'In den Sommerferien zeltete Mia mit ihrem Opa an einem See.',
    'Am Nachmittag zogen dunkle Wolken auf, und es begann zu donnern.',
    'Der Wind riss an den Zeltstangen, der Regen prasselte immer stärker. Blitze zuckten über den See.',
    'Mit einem lauten Knall brach ein dicker Ast ab und landete direkt neben dem Zelt!',
    'Sie verbrachten den Rest der Nacht im Auto. Am Morgen schien wieder die Sonne, und Mia erzählte allen von dem Abenteuer.'] },
];

const STIL = `
.bg-berg { display: block; width: 100%; height: auto; max-width: 40rem; margin: 0 auto .4rem; }
.bg-flagge text { font: 800 15px var(--schrift); }
.bg-plaetze { display: grid; gap: .45rem; margin: .4rem 0 .8rem; }
.bg-platz { display: grid; grid-template-columns: 2rem 8.5rem 1fr; align-items: center; gap: .5rem; text-align: left; font: inherit; color: var(--text);
  background: var(--flaeche); border: 3px dashed var(--rand); border-radius: 12px; padding: .45rem .6rem; cursor: pointer; min-height: 3.2rem; }
.bg-platz.an { border-color: var(--akzent); border-style: solid; }
.bg-platz.falsch { border-color: var(--schlecht); border-style: solid; animation: wackeln .35s; }
.bg-platz.voll { border-style: solid; border-color: var(--gut); background: var(--gut-sanft); cursor: default; }
.bg-nr { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 50%; background: var(--f); color: #fff; font: 800 1rem var(--titel); }
.bg-name { font: 800 1rem/1.15 var(--titel); } .bg-name small { display: block; font: 600 .82rem var(--schrift); color: var(--leise); }
.bg-text { font: 600 1rem/1.35 var(--schrift); }
.bg-karten { display: grid; gap: .45rem; }
.bg-karte { text-align: left; font: 600 1.02rem/1.35 var(--schrift); padding: .55rem .8rem; border-radius: 12px; border: 3px solid var(--rand); background: var(--flaeche); color: var(--text); cursor: pointer; box-shadow: 0 3px 0 var(--rand); }
.bg-karte.gewaehlt { border-color: var(--akzent); background: var(--info-sanft); }
.bg-wanderer { transition: transform .8s cubic-bezier(.4,0,.2,1); }
@media (max-width: 560px) { .bg-platz { grid-template-columns: 2rem 1fr; } .bg-text { grid-column: 1 / -1; } }
`;

const FARBEN = ['#1f5fd1', '#e8a317', '#e07a12', '#d7263d', '#2a9d5c'];

export function starteSpannungsberg(root) {
  if (!document.getElementById('bg-stil')) document.head.insertAdjacentHTML('beforeend', `<style id="bg-stil">${STIL}</style>`);
  let liste = mischen(GESCHICHTEN), idx = 0, ge, karten, gelegt, gewaehlt, falsch, meldung;

  const g = geruest(root, {
    etikett: 'Schreiben', titel: '',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-bg="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-bg="neu">＋ Neue Aufgabe</button>`,
  });

  function neu() { ge = liste[idx++ % liste.length]; karten = mischen([0, 1, 2, 3, 4]); gelegt = [false, false, false, false, false]; gewaehlt = null; falsch = null; meldung = null; }

  function bergSvg() {
    const pfad = 'M20 250 L70 232 C130 215 160 190 190 170 S250 120 270 108 S330 40 360 42 S420 120 460 180 S520 240 580 250 Z';
    const linie = 'M20 250 L70 232 C130 215 160 190 190 170 S250 120 270 108 S330 40 360 42 S420 120 460 180 S520 240 580 250';
    let s = `<defs><linearGradient id="bg-verlauf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9fd8b2"/><stop offset="1" stop-color="#e8f3ff"/></linearGradient></defs>
      <path d="${pfad}" fill="url(#bg-verlauf)"/><path d="${linie}" fill="none" stroke="#2a9d5c" stroke-width="5" stroke-linecap="round"/>
      <path d="M335 58 L360 42 L385 58" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>`;
    STELLEN.forEach((p, i) => {
      const an = gelegt[i];
      s += `<g class="bg-flagge"><line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${p.y - 34}" stroke="#555" stroke-width="3"/>
        <path d="M${p.x} ${p.y - 34} l26 8 l-26 8z" fill="${an ? FARBEN[i] : '#c9d3e4'}"/>
        <text x="${p.x + 4}" y="${p.y - 40}" fill="${an ? FARBEN[i] : '#8a94ad'}">${i + 1}</text></g>`;
    });
    let hoch = -1; for (let i = 0; i < 4; i++) { if (gelegt[i]) hoch = i; else break; }
    const ziel = gelegt.every(Boolean) ? STELLEN[4] : hoch >= 0 ? STELLEN[hoch] : { x: 30, y: 250 };
    s += `<g class="bg-wanderer" style="transform: translate(${ziel.x - 14}px, ${ziel.y - 30}px)"><circle cx="8" cy="4" r="5" fill="#f4c59a"/>
      <path d="M8 9 L8 20 M8 20 L3 30 M8 20 L13 30 M8 12 L1 17 M8 12 L15 15" stroke="#1b2340" stroke-width="3" stroke-linecap="round"/>
      <rect x="9" y="9" width="7" height="9" rx="2" fill="#d7263d"/></g>`;
    return `<svg class="bg-berg" viewBox="0 -30 600 292" role="img" aria-label="Spannungsberg">${s}</svg>`;
  }

  function links() {
    const plaetze = STELLEN.map((p, i) => {
      const kl = gelegt[i] ? ' voll' : falsch === i ? ' falsch' : gewaehlt !== null ? ' an' : '';
      return `<button type="button" class="bg-platz${kl}" data-platz="${i}" style="--f:${FARBEN[i]}"><span class="bg-nr">${i + 1}</span>
        <span class="bg-name">${p.name}<small>${p.frage}</small></span><span class="bg-text">${gelegt[i] ? ESC(ge.teile[i]) : ''}</span></button>`;
    }).join('');
    const rest = karten.filter(k => !gelegt[k]);
    return `${bergSvg()}<div class="bg-plaetze">${plaetze}</div>
      <div class="bg-karten">${rest.map(k => `<button type="button" class="bg-karte${gewaehlt === k ? ' gewaehlt' : ''}" data-karte="${k}">${ESC(ge.teile[k])}</button>`).join('')}</div>`;
  }

  function rechts() {
    let h = `<h2 class="bereich-titel">Der Spannungsberg</h2>
      <ul class="sg-merke"><li><b>Einleitung:</b> Wer? Wo? Wann? Noch ruhig.</li><li><b>Hauptteil:</b> Etwas passiert. Die Spannung steigt Schritt für Schritt.</li>
      <li><b>Höhepunkt:</b> Die spannendste Stelle – der Gipfel.</li><li><b>Schluss:</b> Die Spannung löst sich. Wie geht es aus?</li></ul>
      <p class="leise">Tippe einen Abschnitt an und dann die Stelle am Berg.</p>`;
    if (gelegt.every(Boolean)) h += `<p class="tb-antwort gut">Der Berg ist geschafft! „${ESC(ge.titel)}“ ist richtig geordnet.</p>`;
    else if (meldung) h += `<p class="tb-antwort schlecht">${meldung}</p>`;
    return h;
  }

  function zeichne() { g.titel(`Spannungsberg: ${ESC(ge.titel)}`); g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); }

  root.addEventListener('click', e => {
    const k = e.target.closest('[data-karte]');
    if (k) { const n = Number(k.dataset.karte); gewaehlt = gewaehlt === n ? null : n; falsch = null; meldung = null; zeichne(); return; }
    const p = e.target.closest('[data-platz]');
    if (p) {
      const i = Number(p.dataset.platz);
      if (gelegt[i]) return;
      if (gewaehlt === null) { g.sprich('Tippe zuerst einen Abschnitt der Geschichte an.', 'tipp'); return; }
      if (gewaehlt === i) {
        gelegt[i] = true; gewaehlt = null; falsch = null; meldung = null;
        const alterWanderer = root.querySelector('.bg-wanderer')?.style.transform;
        zeichne();
        const w = root.querySelector('.bg-wanderer');
        if (w && alterWanderer) { const neu_ = w.style.transform; w.style.transition = 'none'; w.style.transform = alterWanderer; void w.getBoundingClientRect(); w.style.transition = ''; w.style.transform = neu_; }
        if (gelegt.every(Boolean)) g.sprich('Gipfel erreicht und sicher wieder unten angekommen – die Geschichte ist geordnet!', 'fertig');
        else g.sprich(`${STELLEN[i].name}: ${STELLEN[i].frage}`);
      } else {
        falsch = i;
        meldung = i === 0 ? 'In der Einleitung ist noch alles ruhig: Wer? Wo? Wann?' : i === 3 ? 'Ist das wirklich die spannendste Stelle?' : i === 4 ? 'Im Schluss ist die Gefahr oder das Problem schon vorbei.' : 'Passt das an diese Stelle? Steigt die Spannung von hier aus weiter?';
        zeichne();
      }
      return;
    }
    const b = e.target.closest('[data-bg]');
    if (!b) return;
    if (b.dataset.bg === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.bg === 'tipp') g.sprich('Suche zuerst den Anfang (Wer? Wo? Wann?) und das Ende. Dann die spannendste Stelle für den Gipfel.', 'tipp');
  });

  function start() { g.sprich('Die Geschichte ist durcheinander geraten. Lege die Abschnitte an die richtige Stelle am Spannungsberg.'); }

  neu(); zeichne(); start();
}
