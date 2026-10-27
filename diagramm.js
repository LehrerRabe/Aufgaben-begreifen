/* Mathematik: Daten sammeln und darstellen.
   Urliste → Strichliste (Fünferbündel) → Säulendiagramm → Frage beantworten. */

import { geruest, zufall, wahl, mischen, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';

const THEMEN = [
  { titel: 'Lieblingsobst', frage: 'Was ist dein Lieblingsobst?', werte: ['Apfel', 'Banane', 'Erdbeere', 'Kiwi', 'Traube'] },
  { titel: 'Haustiere', frage: 'Welches Haustier hast du (oder hättest du gern)?', werte: ['Hund', 'Katze', 'Hase', 'Fisch'] },
  { titel: 'Schulweg', frage: 'Wie kommst du zur Schule?', werte: ['zu Fuß', 'Fahrrad', 'Bus', 'Auto'] },
  { titel: 'Lieblingssport', frage: 'Welchen Sport machst du am liebsten?', werte: ['Fußball', 'Schwimmen', 'Turnen', 'Basketball', 'Tanzen'] },
];
const FARBEN = ['#e0457b', '#f2b72e', '#2fae58', '#2f6fe4', '#8a4bd6'];

/** Strichliste mit Fünferbündeln als SVG. */
function striche(n) {
  let s = '', x = 4;
  for (let b = 0; b < Math.ceil(n / 5); b++) {
    const k = Math.min(5, n - b * 5);
    for (let i = 0; i < Math.min(k, 4); i++) s += `<line x1="${x + i * 8}" y1="4" x2="${x + i * 8}" y2="30" class="dg-strich"/>`;
    if (k === 5) s += `<line x1="${x - 4}" y1="26" x2="${x + 28}" y2="8" class="dg-strich"/>`;
    x += 46;
  }
  return `<svg class="dg-striche" viewBox="0 0 ${Math.max(60, x)} 34" style="width:${Math.max(60, x) / 16}rem" aria-label="${n} Striche">${s}</svg>`;
}

export function starteDiagramm(root) {
  let thema, liste, schritt, pos, strichZahl, saeule, frage, eing = {}, bewertung = null, falsch = null, gepr = false;

  const g = geruest(root, {
    etikett: 'Daten', titel: '',
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-dg="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-dg="neu">＋ Neue Umfrage</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    thema = wahl(THEMEN);
    const k = thema.werte.length;
    let anz;
    do { anz = Array.from({ length: k }, () => zufall(1, 9)); } while (anz.reduce((a, b) => a + b) < 16 || anz.reduce((a, b) => a + b) > 28 || anz.filter(x => x === Math.max(...anz)).length > 1);
    liste = mischen(anz.flatMap((n, i) => Array(n).fill(i)));
    schritt = 1; pos = 0; strichZahl = Array(k).fill(0); saeule = Array(k).fill(0);
    bewertung = null; falsch = null; gepr = false; eing['dg-ein'] = '';
    const [a, b] = mischen([...Array(k).keys()]);
    frage = wahl([
      { art: 'max', text: `Was wurde am häufigsten genannt?` },
      { art: 'summe', text: 'Wie viele Kinder wurden insgesamt befragt?' },
      { art: 'diff', a: anz[a] >= anz[b] ? a : b, b: anz[a] >= anz[b] ? b : a, text: '' },
    ]);
    if (frage.art === 'diff') frage.text = `Wie viele Kinder mehr haben „${thema.werte[frage.a]}“ gewählt als „${thema.werte[frage.b]}“?`;
  }

  const anzahl = () => thema.werte.map((_, i) => liste.filter(x => x === i).length);

  function urliste() {
    return `<div class="dg-urliste" aria-label="Urliste">${liste.map((c, i) => `<span class="dg-karte${i < pos ? ' erledigt' : i === pos && schritt === 1 ? ' jetzt' : ''}" style="--f:${FARBEN[c]}">${thema.werte[c]}</span>`).join('')}</div>`;
  }

  function strichliste() {
    return `<table class="dg-tabelle"><thead><tr><th>${thema.titel}</th><th>Strichliste</th><th>Anzahl</th></tr></thead><tbody>
      ${thema.werte.map((w, i) => `<tr class="${falsch === i ? 'falsch' : ''}" ${schritt === 1 ? `data-kat="${i}" tabindex="0" role="button"` : ''}>
        <th><span class="dg-punkt" style="--f:${FARBEN[i]}"></span>${w}</th><td>${striche(strichZahl[i])}</td><td>${schritt > 1 ? strichZahl[i] : ''}</td></tr>`).join('')}
    </tbody></table>`;
  }

  function diagrammHtml() {
    const max = Math.max(10, Math.ceil(Math.max(...anzahl()) / 2) * 2);
    const k = thema.werte.length;
    const ist = anzahl();
    let gitter = '';
    for (let h = 1; h <= max; h++) gitter += `<span class="dg-gl" style="bottom:${(h / max) * 100}%"><i>${h % 2 === 0 ? h : ''}</i></span>`;
    const spalten = thema.werte.map((w, i) => {
      const felder = Array.from({ length: max }, (_, h) => `<button type="button" class="dg-feld" data-saeule="${i}" data-h="${h + 1}" aria-label="${w}: ${h + 1}"></button>`).join('');
      const fehl = gepr && saeule[i] !== ist[i];
      return `<div class="dg-spalte">
        <div class="dg-saeule-bahn">${schritt >= 2 ? felder : ''}<span class="dg-saeule${fehl ? ' falsch' : ''}" style="height:${(saeule[i] / max) * 100}%; --f:${FARBEN[i]}"></span></div>
        <span class="dg-name">${w}</span></div>`;
    }).join('');
    return `<div class="dg-diagramm" style="--k:${k}"><div class="dg-achse">${gitter}</div><div class="dg-spalten">${spalten}</div></div>`;
  }

  function links() {
    return `<h2 class="bereich-titel">Umfrage: ${thema.frage}</h2>
      ${urliste()}
      <div class="dg-unten">
        <div>${strichliste()}</div>
        ${schritt >= 2 ? `<div>${diagrammHtml()}</div>` : ''}
      </div>`;
  }

  function rechts() {
    const schritte = ['Strichliste führen', 'Säulendiagramm zeichnen', 'Frage beantworten'];
    let inhalt = '';
    if (schritt === 1) inhalt = `<p>Gehe die Urliste der Reihe nach durch. Tippe für jede Antwort die passende Zeile der Strichliste an.</p><p class="rr-gross">${pos} / ${liste.length}</p>`;
    if (schritt === 2) inhalt = `<p>Tippe in jeder Spalte auf die Höhe, die zur Anzahl passt.</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-dg="saeulen">✓ Diagramm prüfen</button></div>${antwortHtml(bewertung)}`;
    if (schritt === 3) {
      inhalt = `<p class="dg-frage">${frage.text}</p>
        ${frage.art === 'max' ? `<div class="dg-wahl">${thema.werte.map((w, i) => `<button type="button" class="kn-gross" data-max="${i}">${w}</button>`).join('')}</div>`
          : `<p>${zahlFeld('dg-ein', eing['dg-ein'], 3, 'Antwort')}</p><div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-dg="antwort">✓ Prüfen</button></div>`}
        ${antwortHtml(bewertung)}`;
    }
    return `<ol class="dg-schritte">${schritte.map((t, i) => `<li class="${i + 1 < schritt ? 'fertig' : i + 1 === schritt ? 'jetzt' : ''}">${t}</li>`).join('')}</ol>${inhalt}`;
  }

  function zeichne() {
    g.titel(`${thema.titel} in der Klasse`);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  function kategorie(i) {
    const soll = liste[pos];
    if (i !== soll) { falsch = i; zeichne(); falsch = null; g.sprich(`Die nächste Antwort in der Urliste ist „${thema.werte[soll]}“.`, 'tipp'); return; }
    strichZahl[i]++; pos++;
    if (pos === liste.length) {
      schritt = 2;
      g.sprich('Strichliste fertig! Jetzt wird daraus ein Säulendiagramm. Je mehr Striche, desto höher die Säule.');
    } else if (strichZahl[i] % 5 === 0) g.sprich('Der fünfte Strich geht quer – so kann man in Fünferbündeln zählen.');
    zeichne();
  }

  function saeulenPruefen() {
    const ist = anzahl();
    gepr = true;
    const ok = saeule.every((h, i) => h === ist[i]);
    bewertung = ok ? { ok: true, text: 'Alle Säulen stimmen!' } : { ok: false, text: 'Rot markierte Säulen haben noch nicht die richtige Höhe.' };
    if (ok) { schritt = 3; bewertung = null; g.sprich('Das Diagramm ist fertig. Jetzt kannst du Fragen auf einen Blick beantworten.', 'fertig'); }
    zeichne();
  }

  function antwort(wert) {
    const ist = anzahl();
    let ok, loes;
    if (frage.art === 'max') { const m = ist.indexOf(Math.max(...ist)); ok = wert === m; loes = `„${thema.werte[m]}“ hat die höchste Säule (${ist[m]}).`; }
    if (frage.art === 'summe') { const s = ist.reduce((a, b) => a + b); ok = wert === s; loes = `${ist.join(' + ')} = ${s}`; }
    if (frage.art === 'diff') { const d = ist[frage.a] - ist[frage.b]; ok = wert === d; loes = `${ist[frage.a]} − ${ist[frage.b]} = ${d}`; }
    bewertung = ok ? { ok: true, text: `Richtig! ${loes}` } : { ok: false, text: 'Noch nicht. Schau dir die Säulen genau an.' };
    if (ok) g.sprich('Super! Starte eine neue Umfrage, wenn du magst.', 'fertig');
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    const k = e.target.closest('[data-kat]');
    if (k) { kategorie(Number(k.dataset.kat)); return; }
    const f = e.target.closest('[data-saeule]');
    if (f && schritt === 2) { const i = Number(f.dataset.saeule), h = Number(f.dataset.h); saeule[i] = saeule[i] === h ? h - 1 : h; gepr = false; bewertung = null; zeichne(); return; }
    const m = e.target.closest('[data-max]');
    if (m) { antwort(Number(m.dataset.max)); return; }
    const b = e.target.closest('[data-dg]');
    if (!b) return;
    if (b.dataset.dg === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.dg === 'saeulen') saeulenPruefen();
    if (b.dataset.dg === 'antwort') antwort(Number(eing['dg-ein']));
    if (b.dataset.dg === 'tipp') {
      if (schritt === 1) g.sprich(`Die markierte Karte heißt „${thema.werte[liste[pos]]}“. Tippe diese Zeile in der Strichliste an.`, 'tipp');
      else if (schritt === 2) { const ist = anzahl(); const i = saeule.findIndex((h, j) => h !== ist[j]); g.sprich(i < 0 ? 'Alles richtig – prüfe das Diagramm.' : `Bei „${thema.werte[i]}“ stehen ${ist[i]} Striche. So hoch muss die Säule sein.`, 'tipp'); }
      else g.sprich(frage.art === 'max' ? 'Suche die höchste Säule.' : frage.art === 'summe' ? 'Zähle alle Anzahlen zusammen.' : 'Vergleiche die beiden Säulen: Wie viel ist die eine höher als die andere?', 'tipp');
    }
  });
  root.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-kat]')) { e.preventDefault(); e.target.click(); } });

  function startText() { g.sprich('Die Klasse wurde befragt. Oben steht die Urliste – die Antworten in der Reihenfolge, wie sie gegeben wurden.'); }

  neu(); zeichne(); startText();
}
