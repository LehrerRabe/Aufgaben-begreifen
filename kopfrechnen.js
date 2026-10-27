/* Mathematik: Kopfrechnen.
   Plus und Minus: Aufgabenserien in drei Stufen. Daneben ein freier Abakus (Tausender, Hunderter, Zehner, Einer),
   auf dem die Kinder die Perlen selbst verschieben können – als Hilfe, nicht als Pflicht.
   Mal und Geteilt: kleines Einmaleins. Als Hilfe ein Punktefeld (Reihen · Punkte pro Reihe) in zwei Schritten:
   erst nur die Punkte mit den Anzahlen in beide Richtungen, dann auf Knopfdruck die Summen Reihe für Reihe. */

import { geruest, zufall, wahl, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const ANZAHL = 10;   // Aufgaben pro Serie

const STANGEN = [
  { kurz: 'T', name: 'Tausender', farbe: 'gruen' },
  { kurz: 'H', name: 'Hunderter', farbe: 'rot' },
  { kurz: 'Z', name: 'Zehner', farbe: 'blau' },
  { kurz: 'E', name: 'Einer', farbe: 'gruen' },
];

/* ---------- Gemeinsam: Serie mit Fortschrittsanzeige ---------- */

function serieHtml(ergebnisse) {
  return `<div class="kr-serie" aria-label="Fortschritt">${Array.from({ length: ANZAHL }, (_, i) => {
    const e = ergebnisse[i];
    return `<span class="${e === true ? 'ok' : e === false ? 'nein' : i === ergebnisse.length ? 'jetzt' : ''}"></span>`;
  }).join('')}</div>`;
}

function schlussHtml(ergebnisse) {
  const r = ergebnisse.filter(Boolean).length;
  return `<div class="kr-schluss"><p class="rr-gross">${r} von ${ANZAHL} richtig</p>
    <p>${r === ANZAHL ? 'Super – alles richtig!' : r >= 7 ? 'Gut gemacht!' : 'Übe noch ein bisschen weiter.'}</p>
    <button type="button" class="kn-gross kn-haupt" data-kr="nochmal">↺ Neue Serie</button></div>`;
}

/* ---------- Plus und Minus mit freiem Abakus ---------- */

/** Aufgabe in der Stufe 1 (bis 100), 2 (bis 1 000) oder 3 (bis 10 000). */
export function plusMinusAufgabe(stufe, art) {
  const plus = art === 'plus' || (art === 'gemischt' && Math.random() < 0.5);
  let a, b;
  for (let t = 0; t < 200; t++) {
    if (stufe === 1) {
      const muster = wahl(['ZE+E', 'ZE+Z', 'ZE+ZE']);
      if (muster === 'ZE+E') { a = zufall(11, 95); b = zufall(2, 9); }
      if (muster === 'ZE+Z') { a = zufall(11, 89); b = zufall(1, 8) * 10; }
      if (muster === 'ZE+ZE') { a = zufall(11, 79); b = zufall(11, 49); }
    } else if (stufe === 2) {
      const muster = wahl(['HZ+HZ', 'HZE+E', 'HZE+Z', 'H+ZE', 'HZE+H']);
      if (muster === 'HZ+HZ') { a = zufall(11, 89) * 10; b = zufall(11, 59) * 10; }
      if (muster === 'HZE+E') { a = zufall(101, 989); b = zufall(2, 9); }
      if (muster === 'HZE+Z') { a = zufall(101, 949); b = zufall(1, 9) * 10; }
      if (muster === 'H+ZE') { a = zufall(1, 9) * 100; b = zufall(11, 99); }
      if (muster === 'HZE+H') { a = zufall(101, 899); b = zufall(1, 8) * 100; }
    } else {
      const muster = wahl(['TH+TH', 'THZ+HZ', 'T+HZ', 'THZE+H']);
      if (muster === 'TH+TH') { a = zufall(11, 89) * 100; b = zufall(11, 59) * 100; }
      if (muster === 'THZ+HZ') { a = zufall(101, 899) * 10; b = zufall(11, 99) * 10; }
      if (muster === 'T+HZ') { a = zufall(1, 9) * 1000; b = zufall(11, 99) * 10; }
      if (muster === 'THZE+H') { a = zufall(1001, 8999); b = zufall(1, 9) * 100; }
    }
    const grenze = [0, 100, 1000, 10000][stufe];
    if (plus && a + b <= grenze) return { a, b, op: '+', soll: a + b };
    if (!plus) { const s = a + b; if (s <= grenze) return { a: s, b, op: '−', soll: a }; }
  }
  return { a: 10, b: 5, op: '+', soll: 15 };
}

export function starteKopfPlus(root) {
  let art = 'plus', stufe = 1, auf, ergebnisse = [], eing = {}, bewertung = null, versuche = 0;
  let perlen = [0, 0, 0, 0], zahlZeigen = true;

  const g = geruest(root, {
    etikett: 'Kopfrechnen', titel: '',
    reiter: [{ id: 'plus', titel: 'Plus' }, { id: 'minus', titel: 'Minus' }, { id: 'gemischt', titel: 'Gemischt' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-kr="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-kr="nochmal">↺ Neue Serie</button>`,
  });
  zahlenMerken(root, eing);

  const neueAufgabe = () => { auf = plusMinusAufgabe(stufe, art); eing['kr-e'] = ''; bewertung = null; versuche = 0; };
  const neueSerie = () => { ergebnisse = []; neueAufgabe(); };

  function abakusHtml() {
    return `<div class="kr-abakus">
      <div class="kr-rahmen">${STANGEN.map((s, i) => {
        const n = perlen[i];
        // gezählte Perlen unten, die übrigen oben geparkt
        const kugeln = Array.from({ length: 10 }, (_, k) => {
          const unten = k < n;
          const pos = unten ? k : 3 + k;   // oben geparkt, immer 3 Plätze Lücke zu den gezählten
          return `<button type="button" class="kr-perle ak-${s.farbe}${unten ? ' gezaehlt' : ''}" data-s="${i}" data-k="${k}" style="--pos:${pos}" aria-label="${s.name}: Perle ${k + 1}"></button>`;
        }).join('');
        return `<div class="kr-saeule"><div class="kr-stab">${kugeln}</div>
          <div class="kr-ziffer${n === 10 ? ' zehn' : ''}">${zahlZeigen ? n : ''}</div><div class="ak-name">${s.name}</div></div>`;
      }).join('')}</div>
      <div class="fl-knoepfe">
        <button type="button" class="kn-gross kn-leise" data-kr="leeren">Abakus leeren</button>
        <button type="button" class="kn-gross kn-leise" data-kr="zahlen">${zahlZeigen ? 'Ziffern verstecken' : 'Ziffern zeigen'}</button>
      </div>
      <p class="leise">Tippe eine Perle an: Sie wandert mit allen Perlen darüber nach unten – nur die Perlen unten zählen. Tippe eine untere Perle an, um sie wieder hochzuschieben. Liegen 10 Perlen unten, kannst du sie selbst gegen 1 Perle der Stange links tauschen.</p>
    </div>`;
  }

  function aufgabeHtml() {
    if (ergebnisse.length >= ANZAHL) return antwortHtml(bewertung) + schlussHtml(ergebnisse);
    return `<p class="kr-aufgabe">${zahlText(auf.a)} ${auf.op} ${zahlText(auf.b)} = ${zahlFeld('kr-e', eing['kr-e'], 6, 'Ergebnis')}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-kr="pruefen">✓ Prüfen</button>
      ${bewertung?.weiter ? '<button type="button" class="kn-gross" data-kr="weiter">Nächste Aufgabe ▶</button>' : ''}</div>
      ${antwortHtml(bewertung)}`;
  }

  function rechts() {
    return `<div class="kr-stufen" role="group" aria-label="Stufe">${[1, 2, 3].map(s => `<button type="button" class="kn-gross${s === stufe ? ' gewaehlt' : ''}" data-stufe="${s}">${['bis 100', 'bis 1 000', 'bis 10 000'][s - 1]}</button>`).join('')}</div>
      ${serieHtml(ergebnisse)}
      <h2 class="bereich-titel">Rechne im Kopf</h2>
      ${aufgabeHtml()}`;
  }

  function zeichne() {
    g.reiter(art);
    g.titel({ plus: 'Plus im Kopf', minus: 'Minus im Kopf', gemischt: 'Plus und Minus im Kopf' }[art]);
    g.links.innerHTML = abakusHtml();
    g.rechts.innerHTML = rechts();
    root.querySelector('#kr-e')?.focus({ preventScroll: true });
  }

  function pruefen() {
    if (ergebnisse.length >= ANZAHL || bewertung?.weiter) return;
    const roh = (eing['kr-e'] || '').replace(/\D/g, '');
    if (!roh) { bewertung = { ok: false, text: 'Trage zuerst ein Ergebnis ein.' }; g.rechts.innerHTML = rechts(); return; }
    const ok = Number(roh) === auf.soll;
    versuche++;
    if (ok) {
      ergebnisse.push(versuche === 1);
      bewertung = { ok: true, text: `Richtig: ${zahlText(auf.a)} ${auf.op} ${zahlText(auf.b)} = ${zahlText(auf.soll)}`, weiter: true };
      g.sprich(versuche === 1 ? 'Richtig!' : 'Jetzt stimmt es.', 'fertig');
    } else if (versuche < 2) {
      bewertung = { ok: false, text: 'Noch nicht. Probiere es noch einmal – lege die Aufgabe ruhig am Abakus.' };
    } else {
      ergebnisse.push(false);
      bewertung = { ok: false, text: `Das Ergebnis ist ${zahlText(auf.soll)}.`, weiter: true };
    }
    g.rechts.innerHTML = rechts();
    root.querySelector('#kr-e')?.focus({ preventScroll: true });
  }

  function tipp() {
    const { a, b, op } = auf;
    const st = [1000, 100, 10, 1].filter(w => Math.floor(b / w) % 10 > 0);
    const teile = st.map(w => Math.floor(b / w) % 10 * w);
    g.sprich(teile.length > 1
      ? `Rechne in Schritten: ${zahlText(a)} ${op} ${zahlText(teile[0])}, dann ${op} ${teile.slice(1).map(zahlText).join(` ${op} `)}. Am Abakus: erst ${zahlText(a)} legen, dann ${op === '+' ? 'dazulegen' : 'wegnehmen'}.`
      : `Lege ${zahlText(a)} am Abakus. Dann ${op === '+' ? 'lege' : 'nimm'} ${Math.floor(b / st[0]) % 10} ${STANGEN[[1000, 100, 10, 1].indexOf(st[0])].name} ${op === '+' ? 'dazu' : 'weg'}. Achte auf den Übergang!`, 'tipp');
  }

  /** Tauschen von Hand: 10 Perlen einer Stange gegen 1 Perle links (oder umgekehrt). */
  function setzePerlen(i, k) {
    const n = perlen[i];
    perlen[i] = k < n ? k : k + 1;
    g.links.innerHTML = abakusHtml();
    if (perlen[i] === 10 && i > 0) g.sprich(`10 ${STANGEN[i].name} liegen unten. Du kannst sie gegen 1 ${STANGEN[i - 1].name} tauschen: Schiebe die 10 hoch und 1 Perle links herunter.`, 'tipp');
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { art = rt.dataset.reiter; neueSerie(); zeichne(); startText(); return; }
    const st = e.target.closest('[data-stufe]');
    if (st) { stufe = Number(st.dataset.stufe); neueSerie(); zeichne(); return; }
    const p = e.target.closest('.kr-perle');
    if (p) { setzePerlen(Number(p.dataset.s), Number(p.dataset.k)); return; }
    const b = e.target.closest('[data-kr]');
    if (!b) return;
    const was = b.dataset.kr;
    if (was === 'nochmal') { neueSerie(); perlen = [0, 0, 0, 0]; zeichne(); startText(); }
    if (was === 'pruefen') pruefen();
    if (was === 'weiter') { neueAufgabe(); g.rechts.innerHTML = rechts(); root.querySelector('#kr-e')?.focus({ preventScroll: true }); g.sprich('Nächste Aufgabe.'); }
    if (was === 'leeren') { perlen = [0, 0, 0, 0]; g.links.innerHTML = abakusHtml(); }
    if (was === 'zahlen') { zahlZeigen = !zahlZeigen; g.links.innerHTML = abakusHtml(); }
    if (was === 'tipp') tipp();
  });
  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || (e.target.matches('input, button') && e.target.id !== 'kr-e' && !e.target.matches('[data-kr="pruefen"], [data-kr="weiter"]'))) return;
    e.preventDefault();
    if (ergebnisse.length >= ANZAHL) root.querySelector('.kr-schluss [data-kr="nochmal"]')?.click();
    else if (bewertung?.weiter) root.querySelector('[data-kr="weiter"]')?.click(); else pruefen();
  });

  function startText() { g.sprich('Rechne im Kopf. Wenn du Hilfe brauchst, lege die Aufgabe am Abakus.'); }

  neueSerie(); zeichne(); startText();
}

/* ---------- Kleines Einmaleins ---------- */

export function einmaleinsAufgabe(art, reihe) {
  const mal = art === 'mal' || (art === 'gemischt' && Math.random() < 0.5);
  const a = reihe || zufall(1, 10), b = zufall(1, 10);
  // a = Reihe (Punkte pro Reihe), b = Anzahl der Reihen
  return mal
    ? { text: Math.random() < 0.5 ? `${b} · ${a}` : `${a} · ${b}`, soll: a * b, op: '·', reihen: b, proReihe: a }
    : { text: `${a * b} : ${a}`, soll: b, op: ':', reihen: b, proReihe: a };
}

export function starteKopfMal(root) {
  let art = 'mal', reihe = 0, auf, ergebnisse = [], eing = {}, bewertung = null, versuche = 0, hilfe = 0;   // hilfe: 0 aus, 1 Punkte, 2 mit Summen

  const g = geruest(root, {
    etikett: 'Kleines Einmaleins', titel: '',
    reiter: [{ id: 'mal', titel: 'Mal' }, { id: 'geteilt', titel: 'Geteilt' }, { id: 'gemischt', titel: 'Gemischt' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-km="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-km="nochmal">↺ Neue Serie</button>`,
  });
  zahlenMerken(root, eing);

  const neueAufgabe = () => { auf = einmaleinsAufgabe(art, reihe); eing['km-e'] = ''; bewertung = null; versuche = 0; hilfe = 0; };
  const neueSerie = () => { ergebnisse = []; neueAufgabe(); };

  /** Punktefeld: reihen × proReihe. Schritt 1: Punkte mit den Anzahlen oben (pro Reihe) und links (Reihen).
      Schritt 2: rechts neben jeder Reihe die Summe bis dahin. Bei Geteilt bleibt die Reihenzahl links offen (?). */
  function punktefeld() {
    if (!hilfe) {
      return `<div class="km-leer"><p>Brauchst du ein Bild?</p><button type="button" class="kn-gross" data-km="hilfe">👀 Punktefeld zeigen</button></div>`;
    }
    const { reihen, proReihe, op } = auf;
    let zeilen = '';
    for (let r = 0; r < reihen; r++) {
      zeilen += `<div class="km-zeile" style="--r:${r}">${Array.from({ length: proReihe }, (_, k) => `<span class="km-punkt${k >= 5 ? ' zwei' : ''}" style="--k:${k}"></span>`).join('')}
        ${hilfe >= 2 ? `<span class="km-zahl neu" style="--r:${r}">${(r + 1) * proReihe}</span>` : ''}</div>`;
    }
    const text = op === '·'
      ? `${reihen} ${reihen === 1 ? 'Reihe' : 'Reihen'} mit je ${proReihe} ${proReihe === 1 ? 'Punkt' : 'Punkten'}`
      : `${reihen * proReihe} Punkte, immer ${proReihe} in eine Reihe – wie viele Reihen werden es?`;
    return `<div class="km-gitter${hilfe >= 2 ? ' summen' : ''}">
        <div class="km-oben" aria-label="${proReihe} Punkte in jeder Reihe"><span>${proReihe}</span></div>
        <div class="km-links" aria-label="${op === ':' ? 'Wie viele Reihen?' : `${reihen} Reihen`}"><span>${op === ':' ? '?' : reihen}</span></div>
        <div class="km-feld${op === ':' && hilfe < 2 ? ' teilen' : ''}">${zeilen}</div>
      </div>
      <p class="leise km-text">${text}</p>
      ${hilfe < 2 ? `<div class="gs-pruef"><button type="button" class="kn-gross" data-km="summen">➕ Zusammenzählen</button></div>`
        : `<p class="leise km-text">Rechts neben jeder Reihe steht, wie viele Punkte es bis dahin sind${op === ':' ? ` – zähle die Reihen bis ${reihen * proReihe}` : ''}.</p>`}`;
  }

  function rechts() {
    const aufgabe = ergebnisse.length >= ANZAHL ? antwortHtml(bewertung) + schlussHtml(ergebnisse).replace('data-kr="nochmal"', 'data-km="nochmal"')
      : `<p class="kr-aufgabe">${auf.text} = ${zahlFeld('km-e', eing['km-e'], 3, 'Ergebnis')}</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-km="pruefen">✓ Prüfen</button>
        ${bewertung?.weiter ? '<button type="button" class="kn-gross" data-km="weiter">Nächste Aufgabe ▶</button>' : ''}</div>${antwortHtml(bewertung)}`;
    return `<p class="leise">Reihe üben:</p>
      <div class="km-reihen">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => `<button type="button" class="kn${r === reihe ? ' gewaehlt' : ''}" data-reihe="${r}">${r || 'alle'}</button>`).join('')}</div>
      ${serieHtml(ergebnisse)}
      <h2 class="bereich-titel">Rechne im Kopf</h2>${aufgabe}`;
  }

  function zeichne() {
    g.reiter(art);
    g.titel({ mal: 'Einmaleins: Mal', geteilt: 'Einmaleins: Geteilt', gemischt: 'Einmaleins gemischt' }[art]);
    g.links.innerHTML = punktefeld();
    g.rechts.innerHTML = rechts();
    root.querySelector('#km-e')?.focus({ preventScroll: true });
  }

  function pruefen() {
    if (ergebnisse.length >= ANZAHL || bewertung?.weiter) return;
    const roh = (eing['km-e'] || '').replace(/\D/g, '');
    if (!roh) { bewertung = { ok: false, text: 'Trage zuerst ein Ergebnis ein.' }; g.rechts.innerHTML = rechts(); return; }
    const ok = Number(roh) === auf.soll;
    versuche++;
    if (ok) {
      ergebnisse.push(versuche === 1);
      bewertung = { ok: true, text: `Richtig: ${auf.text} = ${auf.soll}`, weiter: true };
      g.sprich('Richtig!', 'fertig');
    } else if (versuche < 2) {
      bewertung = { ok: false, text: 'Noch nicht. Schau dir das Punktefeld an.' };
      hilfe = Math.max(hilfe, 1); g.links.innerHTML = punktefeld();
    } else {
      ergebnisse.push(false);
      bewertung = { ok: false, text: `${auf.text} = ${auf.soll}`, weiter: true };
      hilfe = 2; g.links.innerHTML = punktefeld();
    }
    g.rechts.innerHTML = rechts();
    fokus();
  }
  const fokus = () => root.querySelector('#km-e')?.focus({ preventScroll: true });

  function tipp() {
    const { reihen, proReihe, op } = auf;
    if (op === '·') {
      const k = reihen > 5 ? `${reihen} · ${proReihe} = 5 · ${proReihe} + ${reihen - 5} · ${proReihe} = ${5 * proReihe} + ${(reihen - 5) * proReihe}` : reihen === 5 ? `5 · ${proReihe} ist die Hälfte von 10 · ${proReihe} = ${10 * proReihe}` : `Zähle in ${proReihe}er-Schritten: ${Array.from({ length: reihen }, (_, i) => (i + 1) * proReihe).join(', ')}`;
      g.sprich(reihen > 5 ? `Zerlege: ${k}.` : k + '.', 'tipp');
    } else g.sprich(`Frage dich: Wie oft passt ${proReihe} in ${reihen * proReihe}? Also: ? · ${proReihe} = ${reihen * proReihe}.`, 'tipp');
    hilfe = Math.max(hilfe, 1); g.links.innerHTML = punktefeld();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { art = rt.dataset.reiter; neueSerie(); zeichne(); startText(); return; }
    const r = e.target.closest('[data-reihe]');
    if (r) { reihe = Number(r.dataset.reihe); neueSerie(); zeichne(); return; }
    const b = e.target.closest('[data-km]');
    if (!b) return;
    const was = b.dataset.km;
    if (was === 'nochmal') { neueSerie(); zeichne(); startText(); }
    if (was === 'pruefen') pruefen();
    if (was === 'weiter') { neueAufgabe(); zeichne(); g.sprich('Nächste Aufgabe.'); }
    if (was === 'hilfe') { hilfe = 1; g.links.innerHTML = punktefeld(); fokus(); }
    if (was === 'summen') { hilfe = 2; g.links.innerHTML = punktefeld(); fokus(); }
    if (was === 'tipp') tipp();
  });
  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || (e.target.matches('input, button') && e.target.id !== 'km-e' && !e.target.matches('[data-km="pruefen"], [data-km="weiter"]'))) return;
    e.preventDefault();
    if (ergebnisse.length >= ANZAHL) root.querySelector('[data-km="nochmal"]')?.click();
    else if (bewertung?.weiter) root.querySelector('[data-km="weiter"]')?.click(); else pruefen();
  });

  function startText() { g.sprich('Aufgaben aus dem kleinen Einmaleins. Wenn du ein Bild brauchst, lass dir das Punktefeld zeigen.'); }

  neueSerie(); zeichne(); startText();
}
