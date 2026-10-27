/* Deutsch: Sachtexte erschließen mit Textmapping (Klasse 5/6).
   1. Überschriften markieren (Haupt- und Zwischenüberschriften) – jede bekommt eine Farbe.
   2. Schlüsselwörter (fett gedruckt) markieren.
   3. Text-Karte: jedes Schlüsselwort an seine Zwischenüberschrift hängen – im Text nimmt es dieselbe Farbe an.
   4. Fragen beantworten – nach der richtigen Antwort leuchtet der Abschnitt, in dem es steht. */

import { geruest, wahl, mischen, antwortHtml, ESC } from './geruest.js';

const FARBEN = ['#2f6fe4', '#2fae58', '#f07d2a'];

/* Abschnitte: [Zwischenüberschrift, Text mit **Schlüsselwörtern**] */
export const TEXTE = [
  { titel: 'Der Igel', abschnitte: [
    ['Aussehen', 'Der Igel hat auf dem Rücken viele tausend **Stacheln**. Bei Gefahr kann er sich zu einer Kugel **zusammenrollen**. Dann sind Kopf und Bauch geschützt.'],
    ['Nahrung', 'Igel sind **nachtaktiv**. Erst in der Dämmerung gehen sie auf Nahrungssuche. Sie fressen vor allem **Insekten**, Würmer und Schnecken.'],
    ['Winterschlaf', 'Im Herbst frisst sich der Igel ein dickes **Fettpolster** an. Von etwa November bis März hält er **Winterschlaf** in einem Nest aus Laub.'],
  ], fragen: [
    ['Wovon ernährt sich der Igel vor allem?', ['von Insekten, Würmern und Schnecken', 'von Beeren und Nüssen', 'von Gras und Blättern'], 1],
    ['Was macht der Igel bei Gefahr?', ['Er rollt sich zu einer Kugel zusammen.', 'Er gräbt sich schnell ein.', 'Er klettert auf einen Baum.'], 0],
    ['Wovon lebt der Igel im Winterschlaf?', ['von seinem Fettpolster', 'von Vorräten in seinem Nest', 'Er wacht jede Nacht zum Fressen auf.'], 2],
  ] },
  { titel: 'Vulkane', abschnitte: [
    ['Aufbau', 'Tief unter einem Vulkan liegt eine **Magmakammer** mit flüssigem Gestein. Durch einen Kanal, den **Schlot**, steigt das Magma nach oben. Oben auf dem Berg liegt der **Krater**.'],
    ['Ausbruch', 'Bei einem Ausbruch tritt das Magma aus. An der Oberfläche heißt es **Lava**. Oft schleudert der Vulkan auch **Asche** hoch in die Luft.'],
    ['Leben am Vulkan', 'Trotz der Gefahr leben viele Menschen in der Nähe von Vulkanen. Der Boden aus verwitterter Lava und Asche ist sehr **fruchtbar**. Ein bekannter Vulkan in Europa ist der **Ätna** auf Sizilien.'],
  ], fragen: [
    ['Wie heißt das Magma, wenn es an der Oberfläche austritt?', ['Lava', 'Krater', 'Schlot'], 1],
    ['Durch welchen Teil steigt das Magma nach oben?', ['durch den Schlot', 'durch den Krater', 'durch die Asche'], 0],
    ['Warum leben trotz der Gefahr viele Menschen an Vulkanen?', ['Der Boden ist sehr fruchtbar.', 'Dort ist es immer warm.', 'Dort gibt es besonders viel Wasser.'], 2],
  ] },
  { titel: 'Die Honigbiene', abschnitte: [
    ['Das Bienenvolk', 'In einem Bienenstock leben im Sommer viele tausend Bienen. Die **Königin** legt die Eier. Die meisten Bienen sind **Arbeiterinnen**. Die männlichen Bienen heißen **Drohnen**.'],
    ['Vom Nektar zum Honig', 'Die Arbeiterinnen sammeln süßen **Nektar** aus den Blüten. Im Stock machen sie daraus Honig und lagern ihn in den **Waben**.'],
    ['Bienen helfen den Pflanzen', 'Beim Sammeln bleibt **Pollen** an den Bienen hängen. Sie tragen ihn zur nächsten Blüte. Diese **Bestäubung** brauchen viele Pflanzen, damit Früchte wachsen.'],
  ], fragen: [
    ['Wer legt im Bienenvolk die Eier?', ['die Königin', 'die Drohnen', 'die Arbeiterinnen'], 0],
    ['Woraus machen Bienen Honig?', ['aus Nektar', 'aus Pollen', 'aus Wachs'], 1],
    ['Warum sind Bienen für viele Pflanzen wichtig?', ['Sie bestäuben die Blüten.', 'Sie fressen Schädlinge.', 'Sie lockern den Boden.'], 2],
  ] },
];

export function starteTextmapping(root) {
  let t, schritt, markiertU, markiertS, falschGetippt, zuordnung, gewaehlt, fragenNr, fragen, antwort, bewertung = null, letzte = null;

  const g = geruest(root, {
    etikett: 'Lesen', titel: 'Sachtexte erschließen – Textmapping',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-tm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-tm="neu">＋ Anderer Text</button>`,
  });

  function neu() {
    let x; do { x = wahl(TEXTE); } while (x === letzte && TEXTE.length > 1);
    letzte = x; t = x;
    schritt = 1; markiertU = new Set(); markiertS = new Set(); falschGetippt = 0; zuordnung = {}; gewaehlt = null; fragenNr = 0; antwort = null; bewertung = null;
    fragen = mischen(t.fragen.map(([f, opt, abschnitt]) => ({ f, richtig: opt[0], opt: mischen(opt), abschnitt })));
  }
  /** Schlüsselwörter: [Wort, Abschnitt] */
  const schluessel = () => t.abschnitte.flatMap(([, txt], ai) => [...txt.matchAll(/\*\*(.+?)\*\*/g)].map(m => [m[1], ai]));

  function textHtml() {
    const kopf = id => {
      const an = markiertU.has(id), farbe = id === 'T' ? '#7a3cc2' : FARBEN[+id];
      return `style="${an ? `background:${farbe}; color:#fff;` : ''}" data-u="${id}" class="tm-u${an ? ' an' : ''}"`;
    };
    let h = `<article class="tm-text"><h3 ${kopf('T')}>${ESC(t.titel)}</h3>`;
    t.abschnitte.forEach(([ue, txt], ai) => {
      const hell = schritt === 4 && antwort !== null && bewertung?.ok && fragen[fragenNr]?.abschnitt === ai;
      const absatz = ESC(txt).replace(/\*\*(.+?)\*\*/g, (m, w) => {
        const zu = zuordnung[w], an = markiertS.has(w);
        const st = zu !== undefined ? `style="background:${FARBEN[zu]}; color:#fff"` : '';
        return `<b class="tm-s${an ? ' an' : ''}" data-s="${ESC(w)}" ${st}>${w}</b>`;
      });
      h += `<section class="tm-abschnitt${hell ? ' hell' : ''}" style="--f:${FARBEN[ai]}"><h4 ${kopf(String(ai))}>${ESC(ue)}</h4><p data-absatz="${ai}">${absatz}</p></section>`;
    });
    return h + '</article>';
  }

  function karteHtml() {
    const frei = schluessel().filter(([w]) => zuordnung[w] === undefined);
    return `<div class="tm-karte">
      <div class="tm-titelknoten">${ESC(t.titel)}</div>
      <div class="tm-aeste">${t.abschnitte.map(([ue], ai) => `<div class="tm-ast" data-ast="${ai}" style="--f:${FARBEN[ai]}">
        <div class="tm-knoten">${ESC(ue)}</div>
        <div class="tm-blaetter">${schluessel().filter(([w]) => zuordnung[w] === ai).map(([w, rich]) => `<button type="button" class="tm-chip in${bewertung && !bewertung.ok && rich !== ai ? ' falsch' : ''}" data-chip="${ESC(w)}">${ESC(w)}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="tm-vorrat">${frei.map(([w]) => `<button type="button" class="tm-chip${gewaehlt === w ? ' gewaehlt' : ''}" data-chip="${ESC(w)}">${ESC(w)}</button>`).join('') || '<span class="leise">Alle Schlüsselwörter hängen an der Karte.</span>'}</div></div>`;
  }

  function rechts() {
    const sch = (n, txt, fertig) => `<p class="vz-schritt${fertig ? ' fertig' : ''}">${n}. ${txt}${fertig ? ' ✓' : ''}</p>`;
    let h = `<h2 class="bereich-titel">Textmapping</h2>`;
    h += sch(1, 'Markiere alle Überschriften im Text (die Hauptüberschrift und die Zwischenüberschriften).', schritt > 1);
    if (schritt === 1) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-tm="pruefen">✓ Prüfen</button></div>`;
    if (schritt >= 2) h += sch(2, 'Markiere alle fett gedruckten Schlüsselwörter.', schritt > 2);
    if (schritt === 2) h += `<p class="leise">Markiert: ${markiertS.size} von ${schluessel().length}</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-tm="pruefen">✓ Prüfen</button></div>`;
    if (schritt >= 3) {
      h += sch(3, 'Häng jedes Schlüsselwort an seine Überschrift: erst das Wort antippen, dann die Überschrift.', schritt > 3);
      h += karteHtml();
      if (schritt === 3) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-tm="pruefen">✓ Prüfen</button></div>`;
    }
    if (schritt >= 4) {
      const fr = fragen[fragenNr];
      h += sch(4, `Beantworte die Fragen (${Math.min(fragenNr + 1, fragen.length)} von ${fragen.length}).`, schritt > 4);
      if (schritt === 4 && fr) h += `<p class="tm-frage">${ESC(fr.f)}</p><div class="tm-antworten">${fr.opt.map(o => `<button type="button" class="kn-gross${antwort === o ? (o === fr.richtig ? ' richtig' : ' falsch') : ''}" data-antwort="${ESC(o)}" ${bewertung?.ok ? 'disabled' : ''}>${ESC(o)}</button>`).join('')}</div>
        ${bewertung?.ok && fragenNr < fragen.length - 1 ? '<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-tm="naechste">Nächste Frage ▶</button></div>' : ''}`;
    }
    return h + antwortHtml(bewertung);
  }
  function zeichne() { g.links.innerHTML = textHtml(); g.rechts.innerHTML = rechts(); }

  function pruefen() {
    if (schritt === 1) {
      const alle = ['T', '0', '1', '2'], fehlt = alle.filter(i => !markiertU.has(i)).length;
      if (!fehlt) { schritt = 2; bewertung = null; g.sprich('Die Überschriften zeigen dir, worum es in jedem Abschnitt geht.'); }
      else bewertung = { ok: false, text: `Es ${fehlt === 1 ? 'fehlt noch eine Überschrift' : `fehlen noch ${fehlt} Überschriften`}.${falschGetippt ? ' Überschriften stehen über den Absätzen.' : ''}` };
    } else if (schritt === 2) {
      const fehlt = schluessel().length - markiertS.size;
      if (!fehlt) { schritt = 3; bewertung = null; g.sprich('Jetzt baust du eine Karte vom Text.'); }
      else bewertung = { ok: false, text: `Es ${fehlt === 1 ? 'fehlt noch ein Schlüsselwort' : `fehlen noch ${fehlt} Schlüsselwörter`}. Suche die fett gedruckten Wörter.` };
    } else if (schritt === 3) {
      const offen = schluessel().filter(([w]) => zuordnung[w] === undefined).length;
      const falsch = schluessel().filter(([w, ai]) => zuordnung[w] !== undefined && zuordnung[w] !== ai);
      if (offen) bewertung = { ok: false, text: `Es ${offen === 1 ? 'liegt noch ein Wort' : `liegen noch ${offen} Wörter`} unten.` };
      else if (falsch.length) bewertung = { ok: false, text: `${falsch.length === 1 ? 'Ein Wort hängt' : `${falsch.length} Wörter hängen`} am falschen Ast (rot). In welchem Abschnitt steht es im Text?` };
      else { schritt = 4; bewertung = null; g.sprich('Die Karte zeigt den ganzen Text auf einen Blick. Jetzt kannst du Fragen schnell beantworten.', 'fertig'); }
    }
    zeichne();
  }

  root.addEventListener('click', e => {
    const u = e.target.closest('[data-u]');
    if (u && schritt === 1) { const id = u.dataset.u; markiertU.has(id) ? markiertU.delete(id) : markiertU.add(id); bewertung = null; zeichne(); return; }
    const s = e.target.closest('[data-s]');
    if (s && schritt === 2) { const w = s.dataset.s; markiertS.has(w) ? markiertS.delete(w) : markiertS.add(w); bewertung = null; zeichne(); return; }
    if (schritt === 1 && e.target.closest('[data-absatz]')) { falschGetippt++; g.sprich('Das ist ein Absatz – gesucht sind die Überschriften.', 'tipp'); return; }
    const c = e.target.closest('[data-chip]');
    if (c && schritt === 3) {
      const w = c.dataset.chip;
      if (zuordnung[w] !== undefined) { delete zuordnung[w]; gewaehlt = null; }
      else gewaehlt = gewaehlt === w ? null : w;
      bewertung = null; zeichne(); return;
    }
    const a = e.target.closest('[data-ast]');
    if (a && gewaehlt && schritt === 3) { zuordnung[gewaehlt] = +a.dataset.ast; gewaehlt = null; bewertung = null; zeichne(); return; }
    const an = e.target.closest('[data-antwort]');
    if (an && schritt === 4 && !bewertung?.ok) {
      antwort = an.dataset.antwort;
      const fr = fragen[fragenNr];
      if (antwort === fr.richtig) {
        const letzteFrage = fragenNr === fragen.length - 1;
        bewertung = { ok: true, text: `Richtig! Das steht im Abschnitt „${t.abschnitte[fr.abschnitt][0]}“.${letzteFrage ? ' Alle Fragen beantwortet!' : ''}` };
        if (letzteFrage) g.sprich('Erst die Struktur, dann die Einzelheiten – so verstehst du Sachtexte schneller.', 'fertig');
      } else bewertung = { ok: false, text: `Schau auf deine Karte: Unter welcher Überschrift könnte die Antwort stehen?` };
      zeichne(); return;
    }
    const b = e.target.closest('[data-tm]');
    if (!b) return;
    if (b.dataset.tm === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.tm === 'pruefen') pruefen();
    if (b.dataset.tm === 'naechste') { fragenNr++; antwort = null; bewertung = null; zeichne(); }
    if (b.dataset.tm === 'tipp') g.sprich({ 1: 'Überschriften sind größer und stehen über den Absätzen. Es gibt eine Haupt- und drei Zwischenüberschriften.', 2: 'Schlüsselwörter sind fett gedruckt.', 3: 'Schau im Text nach, in welchem Abschnitt das Wort steht.', 4: 'Welche Überschrift passt zur Frage? Lies in diesem Abschnitt nach.' }[schritt], 'tipp');
  });

  function start() { g.sprich('Erst die Struktur des Textes erkennen – dann lesen.'); }
  neu(); zeichne(); start();
}
