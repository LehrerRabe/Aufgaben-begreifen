/* Deutsch: Wortarten untersuchen.
   Über jedes Wort eines einfachen Satzes wird das passende Wortartensymbol gelegt –
   per Antippen (Symbol wählen, dann Wort) oder per Ziehen aus dem Symbolkasten. */

import { WORTARTEN, symbolSvg } from './wortsymbole.js';

const ESC = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const REIHENFOLGE = ['N', 'A', 'J', 'V', 'P', 'R', 'K', 'D'];

export const STUFEN_WA = [
  { stufe: 1, titel: 'Stufe 1', arten: ['N', 'A', 'J', 'V'], text: 'Nomen, Artikel, Adjektiv, Verb' },
  { stufe: 2, titel: 'Stufe 2', arten: ['N', 'A', 'J', 'V', 'P', 'R', 'K'], text: 'Dazu Pronomen, Präposition, Konjunktion' },
  { stufe: 3, titel: 'Stufe 3', arten: ['N', 'A', 'J', 'V', 'P', 'R', 'K', 'D'], text: 'Dazu Adverb' },
];

/* Schreibweise: Wort:Kürzel, Satzzeichen ohne Kürzel. */
const SAETZE = {
  1: [
    'Der:A Hund:N bellt:V .',
    'Die:A Katze:N schläft:V .',
    'Das:A kleine:J Kind:N lacht:V .',
    'Der:A rote:J Ball:N rollt:V .',
    'Die:A alte:J Frau:N liest:V ein:A Buch:N .',
    'Ein:A großer:J Vogel:N singt:V .',
    'Der:A Lehrer:N schreibt:V eine:A lange:J Aufgabe:N .',
    'Das:A Mädchen:N trinkt:V warme:J Milch:N .',
    'Die:A müden:J Kinder:N schlafen:V .',
    'Ein:A frecher:J Hund:N klaut:V die:A Wurst:N .',
    'Der:A Bäcker:N backt:V frisches:J Brot:N .',
    'Die:A bunte:J Blume:N blüht:V .',
  ],
  2: [
    'Er:P spielt:V mit:R dem:A Ball:N .',
    'Sie:P liest:V ein:A spannendes:J Buch:N .',
    'Der:A Hund:N liegt:V unter:R dem:A Tisch:N .',
    'Wir:P gehen:V in:R die:A Schule:N .',
    'Die:A Katze:N schläft:V und:K der:A Hund:N bellt:V .',
    'Ich:P esse:V einen:A Apfel:N oder:K eine:A Birne:N .',
    'Das:A Kind:N spielt:V auf:R der:A grünen:J Wiese:N .',
    'Du:P malst:V ein:A Bild:N mit:R dem:A Pinsel:N .',
    'Ihr:P wartet:V vor:R der:A großen:J Tür:N .',
    'Der:A Vogel:N sitzt:V auf:R dem:A Dach:N , aber:K die:A Katze:N sieht:V ihn:P .',
    'Tom:N und:K Lea:N laufen:V über:R die:A Brücke:N .',
    'Sie:P trinkt:V heißen:J Tee:N , denn:K sie:P friert:V .',
  ],
  3: [
    'Heute:D regnet:V es:P .',
    'Wir:P spielen:V gern:D Fußball:N .',
    'Der:A Hund:N wartet:V dort:D .',
    'Morgen:D fahren:V wir:P mit:R dem:A Zug:N .',
    'Die:A Kinder:N spielen:V draußen:D auf:R dem:A Hof:N .',
    'Oma:N backt:V oft:D einen:A leckeren:J Kuchen:N .',
    'Ich:P lese:V gern:D , aber:K du:P spielst:V lieber:D .',
    'Der:A kleine:J Igel:N schläft:V jetzt:D unter:R dem:A Laub:N .',
    'Bald:D beginnen:V die:A Ferien:N und:K wir:P freuen:V uns:P .',
    'Gestern:D sah:V ich:P hier:D einen:A bunten:J Vogel:N .',
    'Sie:P wartet:V oben:D , denn:K er:P kommt:V gleich:D .',
    'Der:A Ball:N liegt:V immer:D hinter:R dem:A Schrank:N .',
  ],
};

function zerlege(satz) {
  return satz.split(' ').map(t => {
    const [wort, art] = t.split(':');
    return art ? { wort, art } : { zeichen: wort };
  });
}

function mischen(liste) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Merkkarte mit allen Symbolen (für die Auswahlseite). */
export function merkkarteHtml(arten = REIHENFOLGE) {
  return `<div class="merkkarte">${arten.map(k => {
    const w = WORTARTEN[k];
    return `<div class="merk-eintrag">
      <span class="merk-symbol">${symbolSvg(k)}</span>
      <span class="merk-text"><b>${w.name}</b><small>${w.zusatz}</small><em>${ESC(w.beispiele)}</em></span>
    </div>`;
  }).join('')}</div>`;
}

/** Prüft die Satzdaten (für Tests). */
export function alleSaetze() {
  return Object.fromEntries(Object.entries(SAETZE).map(([s, l]) => [s, l.map(zerlege)]));
}

/**
 * Startet die Übung.
 * @param {HTMLElement} root
 * @param {number} stufe
 * @param {{ andereStufe: () => void }} nav
 */
export function starte(root, stufe, { andereStufe } = {}) {
  const info = STUFEN_WA.find(s => s.stufe === stufe) || STUFEN_WA[0];
  const arten = info.arten;
  let reihe = mischen(SAETZE[info.stufe]).map(zerlege);
  let idx = 0, gewaehlt = null, namen = true, tippWort = -1;
  let gelegt = [], bewertung = [], geprueft = false, geloest = false, ohneFehler = 0, fehlerImSatz = false;
  let meldung = { text: 'Wähle ein Symbol und tippe auf ein Wort. Du kannst Symbole auch auf die Wörter ziehen.', art: 'info' };

  const satz = () => reihe[idx];
  const woerter = () => satz().map((t, i) => ({ ...t, i })).filter(t => t.wort);

  function neuerSatz() {
    gelegt = satz().map(() => null);
    bewertung = satz().map(() => '');
    geprueft = false; geloest = false; fehlerImSatz = false; tippWort = -1;
  }
  neuerSatz();

  function setze(i, k) {
    if (!satz()[i]?.wort || geloest) return;
    gelegt[i] = gelegt[i] === k ? null : k;
    bewertung[i] = '';
    tippWort = -1;
    if (geprueft) geprueft = false;
    meldung = null;
  }

  function fertigGelegt() { return woerter().every(t => gelegt[t.i]); }
  function allesRichtig() { return woerter().every(t => gelegt[t.i] === t.art); }

  function zeichne() {
    if (idx >= reihe.length) { zeichneEnde(); return; }
    const punkte = reihe.map((_, i) => `<span class="wa-punkt${i < idx ? ' fertig' : i === idx ? ' jetzt' : ''}"></span>`).join('');
    const kasten = arten.map(k => `
      <button type="button" class="wa-kastenknopf${gewaehlt === k ? ' gewaehlt' : ''}" data-symbol="${k}" aria-pressed="${gewaehlt === k}"
        aria-label="${WORTARTEN[k].name}">
        <span class="wa-kastenbild">${symbolSvg(k)}</span>
        ${namen ? `<span class="wa-kastenname">${WORTARTEN[k].name}</span>` : ''}
      </button>`).join('');
    const teile = satz().map((t, i) => t.wort
      ? `<button type="button" class="wa-wort${bewertung[i] ? ' ' + bewertung[i] : ''}${tippWort === i ? ' tipp-ziel' : ''}" data-wort="${i}"
          aria-label="${ESC(t.wort)}${gelegt[i] ? ', ' + WORTARTEN[gelegt[i]].name : ''}">
          <span class="wa-slot">${gelegt[i] ? symbolSvg(gelegt[i]) : ''}</span>
          <span class="wa-text">${ESC(t.wort)}</span>
        </button>`
      : `<span class="wa-satzzeichen">${ESC(t.zeichen)}</span>`).join('');
    const richtig = geprueft && allesRichtig();

    root.innerHTML = `
    <section class="wa">
      <div class="wa-leiste">
        <div><span class="etikett">${info.titel} · Satz ${idx + 1} von ${reihe.length}</span>
          <div class="wa-punkte" aria-hidden="true">${punkte}</div></div>
        <label class="haken"><input type="checkbox" id="wa-namen"${namen ? ' checked' : ''}> Namen zeigen</label>
      </div>

      <div class="wa-kasten" role="group" aria-label="Symbolkasten">${kasten}</div>

      <div class="wa-blatt">
        <div class="wa-satz">${teile}</div>
      </div>

      <div class="sprechblase ${meldung ? meldung.art : 'info'}" role="status" aria-live="polite">
        <span class="blase-symbol" aria-hidden="true">${meldung?.art === 'fertig' ? '★' : meldung?.art === 'tipp' ? '?' : 'i'}</span>
        <span>${ESC(meldung ? meldung.text : gewaehlt ? `Du hast das Symbol für ${WORTARTEN[gewaehlt].name}. Tippe auf die passenden Wörter.` : 'Wähle ein Symbol und tippe auf ein Wort.')}</span>
      </div>

      <div class="wa-knoepfe">
        <button type="button" class="kn-gross kn-tipp" data-wa="tipp"><span aria-hidden="true">?</span> Tipp</button>
        <button type="button" class="kn-gross kn-haupt" data-wa="pruefen"${richtig ? ' hidden' : ''}>✓ Prüfen</button>
        <button type="button" class="kn-gross kn-weiter" data-wa="weiter"${richtig || geloest ? '' : ' hidden'}>Nächster Satz ➜</button>
        <button type="button" class="kn-gross kn-leise" data-wa="loesung"${richtig || geloest ? ' hidden' : ''}>Lösung zeigen</button>
      </div>
    </section>`;
  }

  function zeichneEnde() {
    const sterne = ohneFehler >= reihe.length - 1 ? 3 : ohneFehler >= reihe.length / 2 ? 2 : 1;
    root.innerHTML = `
    <section class="wa wa-ende">
      <div class="wa-sterne" aria-hidden="true">${'★'.repeat(sterne)}${'☆'.repeat(3 - sterne)}</div>
      <h2>Geschafft!</h2>
      <p>Du hast ${reihe.length} Sätze untersucht. ${ohneFehler} davon waren beim ersten Prüfen ganz richtig.</p>
      <div class="wa-knoepfe">
        <button type="button" class="kn-gross kn-haupt" data-wa="nochmal">Noch einmal</button>
        ${andereStufe ? '<button type="button" class="kn-gross" data-wa="stufe">Andere Stufe wählen</button>' : ''}
      </div>
    </section>`;
  }

  function aktion(name) {
    switch (name) {
      case 'tipp': {
        const t = woerter().find(w => gelegt[w.i] !== w.art);
        if (!t) { meldung = { text: 'Alle Symbole liegen richtig. Tippe auf „Prüfen“.', art: 'tipp' }; tippWort = -1; break; }
        tippWort = t.i;
        const w = WORTARTEN[t.art];
        meldung = gelegt[t.i]
          ? { text: `Schau dir „${t.wort}“ noch einmal an. ${w.frage}`, art: 'tipp' }
          : { text: `Schau dir „${t.wort}“ an. ${w.frage}`, art: 'tipp' };
        break;
      }
      case 'pruefen': {
        if (!fertigGelegt()) {
          const offen = woerter().filter(t => !gelegt[t.i]).length;
          meldung = { text: `Über ${offen === 1 ? 'einem Wort' : `${offen} Wörtern`} liegt noch kein Symbol.`, art: 'info' };
          satz().forEach((t, i) => { bewertung[i] = t.wort && !gelegt[i] ? 'leer' : ''; });
          break;
        }
        geprueft = true; tippWort = -1;
        let falsch = 0;
        satz().forEach((t, i) => {
          if (!t.wort) return;
          bewertung[i] = gelegt[i] === t.art ? 'ok' : 'falsch';
          if (bewertung[i] === 'falsch') falsch++;
        });
        if (!falsch) {
          if (!fehlerImSatz) ohneFehler++;
          meldung = { text: 'Alles richtig! Super gemacht.', art: 'fertig' };
        } else {
          fehlerImSatz = true;
          meldung = { text: `${falsch} ${falsch === 1 ? 'Symbol passt' : 'Symbole passen'} noch nicht. Ändere die rot markierten Wörter.`, art: 'info' };
        }
        break;
      }
      case 'loesung': {
        const b = root.querySelector('[data-wa="loesung"]');
        if (b && b.dataset.sicher !== '1') {
          b.dataset.sicher = '1'; b.textContent = 'Wirklich? Nochmal tippen';
          setTimeout(() => { if (b.isConnected) { b.dataset.sicher = ''; b.textContent = 'Lösung zeigen'; } }, 4000);
          return;
        }
        satz().forEach((t, i) => { if (t.wort) { gelegt[i] = t.art; bewertung[i] = 'ok'; } });
        geloest = true; fehlerImSatz = true; tippWort = -1;
        meldung = { text: 'So liegen die Symbole richtig. Schau sie dir in Ruhe an.', art: 'info' };
        break;
      }
      case 'weiter': idx++; if (idx < reihe.length) neuerSatz(); meldung = null; gewaehlt = null; break;
      case 'nochmal': reihe = mischen(SAETZE[info.stufe]).map(zerlege); idx = 0; ohneFehler = 0; neuerSatz(); meldung = null; break;
      case 'stufe': andereStufe?.(); return;
      default: return;
    }
    zeichne();
  }

  /* ---------- Bedienung: Antippen und Ziehen ---------- */
  let zug = null;

  root.addEventListener('pointerdown', e => {
    const k = e.target.closest('[data-symbol]');
    if (!k) return;
    zug = { k: k.dataset.symbol, x: e.clientX, y: e.clientY, geist: null, id: e.pointerId };
  });

  root.addEventListener('pointermove', e => {
    if (!zug || e.pointerId !== zug.id) return;
    if (!zug.geist && Math.hypot(e.clientX - zug.x, e.clientY - zug.y) > 8) {
      zug.geist = document.createElement('div');
      zug.geist.className = 'wa-geist';
      zug.geist.innerHTML = symbolSvg(zug.k);
      document.body.appendChild(zug.geist);
    }
    if (zug.geist) {
      e.preventDefault();
      zug.geist.style.transform = `translate(${e.clientX - 32}px, ${e.clientY - 56}px)`;
      root.querySelectorAll('.wa-wort.ueber').forEach(w => w.classList.remove('ueber'));
      document.elementFromPoint(e.clientX, e.clientY)?.closest('.wa-wort')?.classList.add('ueber');
    }
  });

  const zugEnde = e => {
    if (!zug || e.pointerId !== zug.id) return;
    const z = zug; zug = null;
    if (z.geist) {
      z.geist.remove();
      const w = e.type === 'pointerup' ? document.elementFromPoint(e.clientX, e.clientY)?.closest('.wa-wort') : null;
      if (w && root.contains(w) && !geloest) { const i = Number(w.dataset.wort); setze(i, z.k); gelegt[i] = z.k; zeichne(); }
      else root.querySelectorAll('.wa-wort.ueber').forEach(x => x.classList.remove('ueber'));
      unterdrueckeKlick = true;
      setTimeout(() => { unterdrueckeKlick = false; }, 60);
    }
  };
  let unterdrueckeKlick = false;
  root.addEventListener('pointerup', zugEnde);
  root.addEventListener('pointercancel', zugEnde);

  root.addEventListener('click', e => {
    // Nach dem Ziehen löst der Browser manchmal noch einen Klick auf Symbol oder Wort aus – den ignorieren
    const nachZug = unterdrueckeKlick; unterdrueckeKlick = false;
    if (nachZug && e.target.closest('[data-symbol],[data-wort]')) return;
    const sym = e.target.closest('[data-symbol]');
    if (sym) { gewaehlt = gewaehlt === sym.dataset.symbol ? null : sym.dataset.symbol; meldung = null; zeichne(); return; }
    const wort = e.target.closest('[data-wort]');
    if (wort) {
      const i = Number(wort.dataset.wort);
      if (gewaehlt) setze(i, gewaehlt);
      else if (gelegt[i]) setze(i, gelegt[i]);
      else { meldung = { text: 'Wähle zuerst oben ein Symbol aus dem Kasten.', art: 'info' }; }
      zeichne();
      return;
    }
    const knopf = e.target.closest('[data-wa]');
    if (knopf) aktion(knopf.dataset.wa);
  });

  root.addEventListener('change', e => {
    if (e.target.id === 'wa-namen') { namen = e.target.checked; zeichne(); }
  });

  zeichne();
}
