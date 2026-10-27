/* Deutsch: Das Feldermodell (Klasse 5–7).
   Das Verb bildet eine Klammer: linke Klammer (finites Verb bzw. Einleitewort), rechte Klammer (Partizip, Infinitiv,
   Verbteil). Davor das Vorfeld (genau ein Satzglied), dazwischen das Mittelfeld, dahinter das Nachfeld.
   „Hauptsätze“: Satzglieder antippen und in die Felder legen.
   „Nebensätze und Komma“: Hauptsatz und Nebensatz in zwei Reihen sortieren – im Nebensatz steht das Verb am Ende
   (rechte Klammer), das Einleitewort in der linken Klammer. Dann das Komma an die Grenze setzen. */

import { geruest, wahl, mischen, antwortHtml, ESC } from './geruest.js';

const FELDER = [
  { id: 'VF', name: 'Vorfeld' }, { id: 'LK', name: 'linke Klammer', klammer: true }, { id: 'MF', name: 'Mittelfeld' },
  { id: 'RK', name: 'rechte Klammer', klammer: true }, { id: 'NF', name: 'Nachfeld' },
];

/* Hauptsätze: [Text, Feld] in richtiger Reihenfolge; Satzzeichen am Ende */
export const HAUPTSAETZE = [
  [[['Lena', 'VF'], ['hat', 'LK'], ['gestern', 'MF'], ['im Garten', 'MF'], ['einen Igel', 'MF'], ['gesehen', 'RK']], '.'],
  [[['Morgen', 'VF'], ['fährt', 'LK'], ['unsere Klasse', 'MF'], ['mit dem Bus', 'MF'], ['ins Museum', 'MF']], '.'],
  [[['Der Hund', 'VF'], ['bellt', 'LK'], ['den Briefträger', 'MF'], ['laut', 'MF'], ['an', 'RK']], '.'],
  [[['Wir', 'VF'], ['werden', 'LK'], ['am Wochenende', 'MF'], ['einen Kuchen', 'MF'], ['backen', 'RK']], '.'],
  [[['Im Sommer', 'VF'], ['kann', 'LK'], ['man', 'MF'], ['im See', 'MF'], ['schwimmen', 'RK']], '.'],
  [[['Tom', 'VF'], ['ruft', 'LK'], ['seine Oma', 'MF'], ['jeden Sonntag', 'MF'], ['an', 'RK']], '.'],
  [[['Die Kinder', 'VF'], ['haben', 'LK'], ['in der Pause', 'MF'], ['Fußball', 'MF'], ['gespielt', 'RK']], '.'],
  [[['Nach der Schule', 'VF'], ['macht', 'LK'], ['Mia', 'MF'], ['ihre Hausaufgaben', 'MF']], '.'],
  [[['Mein Bruder', 'VF'], ['steht', 'LK'], ['jeden Morgen', 'MF'], ['um sechs Uhr', 'MF'], ['auf', 'RK']], '.'],
  [[['Gestern', 'VF'], ['hat', 'LK'], ['es', 'MF'], ['den ganzen Tag', 'MF'], ['geregnet', 'RK']], '.'],
  [[['Hast', 'LK'], ['du', 'MF'], ['deine Hausaufgaben', 'MF'], ['schon', 'MF'], ['gemacht', 'RK']], '?'],
  [[['Kommst', 'LK'], ['du', 'MF'], ['morgen', 'MF'], ['mit', 'RK']], '?'],
  [[['Ich', 'VF'], ['habe', 'LK'], ['mehr Bonbons', 'MF'], ['gegessen', 'RK'], ['als du', 'NF']], '.'],
  [[['Wann', 'VF'], ['beginnt', 'LK'], ['das Konzert', 'MF']], '?'],
];

/* Satzgefüge: Hauptsatz-Teile, Nebensatz-Teile, Stelle des Nebensatzes im Hauptsatz (VF oder NF) */
export const GEFUEGE = [
  { hs: [['Ich', 'VF'], ['bleibe', 'LK'], ['heute', 'MF'], ['zu Hause', 'MF']], ns: [['weil', 'LK'], ['ich', 'MF'], ['krank', 'MF'], ['bin', 'RK']], pos: 'NF' },
  { hs: [['bleiben', 'LK'], ['wir', 'MF'], ['drinnen', 'MF']], ns: [['Weil', 'LK'], ['es', 'MF'], ['regnet', 'RK']], pos: 'VF' },
  { hs: [['Wir', 'VF'], ['gehen', 'LK'], ['ins Kino', 'MF']], ns: [['wenn', 'LK'], ['du', 'MF'], ['Zeit', 'MF'], ['hast', 'RK']], pos: 'NF' },
  { hs: [['Lisa', 'VF'], ['weiß', 'LK']], ns: [['dass', 'LK'], ['Tom', 'MF'], ['morgen', 'MF'], ['Geburtstag', 'MF'], ['hat', 'RK']], pos: 'NF' },
  { hs: [['gingen', 'LK'], ['wir', 'MF'], ['nach Hause', 'MF']], ns: [['Als', 'LK'], ['der Film', 'MF'], ['zu Ende', 'MF'], ['war', 'RK']], pos: 'VF' },
  { hs: [['Das', 'VF'], ['ist', 'LK'], ['das Buch', 'MF']], ns: [['das', 'LK'], ['ich', 'MF'], ['dir', 'MF'], ['geliehen habe', 'RK']], pos: 'NF' },
  { hs: [['habe', 'LK'], ['ich', 'MF'], ['weitergelesen', 'RK']], ns: [['Obwohl', 'LK'], ['ich', 'MF'], ['müde', 'MF'], ['war', 'RK']], pos: 'VF' },
  { hs: [['Er', 'VF'], ['rennt', 'LK'], ['schnell', 'MF']], ns: [['damit', 'LK'], ['er', 'MF'], ['den Bus', 'MF'], ['noch', 'MF'], ['erreicht', 'RK']], pos: 'NF' },
];

export function starteFelder(root) {
  let modus = 'haupt', bewertung = null;
  let teile, ablage, gewaehlt, satz, schritt, komma;   // teile: [{id, text, feld, reihe}], ablage: id → 'reihe:feld' | null

  const g = geruest(root, {
    etikett: 'Feldermodell', titel: '',
    reiter: [{ id: 'haupt', titel: 'Hauptsätze', unter: 'Verbklammer' }, { id: 'neben', titel: 'Nebensätze und Komma', unter: 'Verb am Ende' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-fm="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-fm="neu">＋ Neuer Satz</button>`,
  });

  function neu() {
    bewertung = null; gewaehlt = null; schritt = 1; komma = null;
    if (modus === 'haupt') {
      const [t, zeichen] = wahl(HAUPTSAETZE);
      satz = { reihen: [{ teile: t, name: 'Satz' }], zeichen };
    } else {
      const s = wahl(GEFUEGE);
      satz = { reihen: [{ teile: s.hs, name: 'Hauptsatz', ns: s.pos }, { teile: s.ns, name: 'Nebensatz' }], zeichen: '.', pos: s.pos };
    }
    teile = [];
    satz.reihen.forEach((r, ri) => r.teile.forEach(([text, feld], i) => teile.push({ id: `${ri}-${i}`, text, feld, reihe: ri })));
    teile = mischen(teile);
    ablage = Object.fromEntries(teile.map(t => [t.id, null]));
  }

  /** Text in Satzreihenfolge – für die Komma-Aufgabe */
  function woerterInOrdnung() {
    const hs = satz.reihen[0].teile.map(t => t[0]), ns = satz.reihen[1]?.teile.map(t => t[0]);
    if (!ns) return { woerter: hs, grenze: -1 };
    const w = satz.pos === 'VF' ? [...ns, ...hs] : [...hs, ...ns];
    return { woerter: w, grenze: satz.pos === 'VF' ? ns.length : hs.length };
  }
  const grossErster = w => w.map((x, i) => (i === 0 ? x[0].toUpperCase() + x.slice(1) : x));

  function chip(t) {
    const liegt = ablage[t.id];
    const kl = bewertung && liegt ? (liegt === `${t.reihe}:${t.feld}` ? ' richtig' : ' falsch') : '';
    return `<button type="button" class="fm-chip${gewaehlt === t.id ? ' gewaehlt' : ''}${t.feld === 'LK' || t.feld === 'RK' ? (schritt > 1 ? ' verb' : '') : ''}${kl}" data-chip="${t.id}">${ESC(t.text)}</button>`;
  }
  function reiheHtml(ri) {
    const r = satz.reihen[ri];
    return `<div class="fm-reihe"><div class="fm-reihenname">${r.name}</div><div class="fm-felder">${FELDER.map(f => {
      const drin = teile.filter(t => ablage[t.id] === `${ri}:${f.id}`);
      const nsHier = r.ns === f.id;
      return `<div class="fm-feld${f.klammer ? ' klammer' : ''}${nsHier ? ' ns' : ''}" data-ziel="${ri}:${f.id}">
        <span class="fm-fname">${f.name}</span>
        <div class="fm-inhalt">${nsHier ? '<span class="fm-nsblock">Nebensatz</span>' : ''}${drin.map(chip).join('')}</div></div>`;
    }).join('')}</div></div>`;
  }
  function links() {
    const frei = teile.filter(t => !ablage[t.id]);
    let h = `<div class="fm-modell">${satz.reihen.map((_, ri) => reiheHtml(ri)).join('')}</div>
      <div class="fm-vorrat">${frei.length ? frei.map(chip).join('') : '<span class="leise">Alle Teile liegen in den Feldern.</span>'}</div>
      <p class="leise">Tippe ein Satzglied an, dann das Feld, in das es gehört. Tippe ein Teil im Feld an, um es zurückzulegen.</p>`;
    if (schritt >= 2 && modus === 'neben') {
      const { woerter, grenze } = woerterInOrdnung();
      const ww = grossErster(woerter);
      h += `<h3 class="eh-zwischen">Wo steht das Komma?</h3><p class="fm-kommasatz">${ww.map((w, i) => `${i ? `<button type="button" class="fm-luecke${komma === i ? (i === grenze ? ' richtig' : ' falsch') : ''}" data-komma="${i}" aria-label="Komma vor ${ESC(w)}">${komma === i ? ',' : ''}</button>` : ''}<span class="${satz.reihen[1].teile.some(t => t[0] === woerter[i]) && (satz.pos === 'VF' ? i < grenze : i >= grenze) ? 'fm-nswort' : ''}">${ESC(w)}</span>`).join('')}${satz.zeichen}</p>`;
    }
    return h;
  }
  function rechts() {
    let h = `<h2 class="bereich-titel">${modus === 'haupt' ? 'Sortiere den Satz in die Felder' : 'Hauptsatz und Nebensatz'}</h2>`;
    if (modus === 'haupt') {
      const w = satz.reihen[0].teile.map(t => t[0]);
      h += `<p class="tl-geschichte">${ESC(grossErster(w).join(' '))}${satz.zeichen}</p>`;
    } else {
      const { woerter } = woerterInOrdnung();
      h += `<p class="tl-geschichte">${ESC(grossErster(woerter).join(' '))}${satz.zeichen}</p><p class="leise">(Das Komma fehlt noch – das setzt du am Ende.)</p>`;
    }
    h += `<ul class="fm-regeln"><li><b>Linke Klammer:</b> ${modus === 'haupt' ? 'das gebeugte Verb' : 'im Hauptsatz das gebeugte Verb, im Nebensatz das Einleitewort (weil, dass, wenn …)'}</li>
      <li><b>Rechte Klammer:</b> ${modus === 'haupt' ? 'zweiter Verbteil (gespielt, backen, an …) – kann leer sein' : 'im Nebensatz das Verb am Ende'}</li>
      <li><b>Vorfeld:</b> genau ein Satzglied (bei Fragen ohne Fragewort leer)</li></ul>`;
    if (schritt === 1) h += `<div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-fm="pruefen">✓ Prüfen</button></div>`;
    return h + antwortHtml(bewertung);
  }
  function zeichne() { g.links.innerHTML = links(); g.rechts.innerHTML = rechts(); g.reiter(modus); g.titel(modus === 'haupt' ? 'Das Feldermodell: Hauptsätze' : 'Nebensatz und Komma'); }

  function pruefen() {
    const offen = teile.filter(t => !ablage[t.id]).length;
    if (offen) { bewertung = { ok: false, text: `Es ${offen === 1 ? 'liegt noch ein Teil' : `liegen noch ${offen} Teile`} unten.` }; zeichne(); return; }
    const falsch = teile.filter(t => ablage[t.id] !== `${t.reihe}:${t.feld}`);
    if (falsch.length) {
      const f = falsch[0], [r, feld] = ablage[f.id].split(':');
      let tipp = '';
      if (f.feld === 'LK' && satz.reihen[f.reihe].name === 'Nebensatz') tipp = `„${f.text}“ leitet den Nebensatz ein – es steht in der linken Klammer.`;
      else if (f.feld === 'RK' && satz.reihen[f.reihe].name === 'Nebensatz') tipp = `Im Nebensatz steht das Verb „${f.text}“ ganz am Ende – in der rechten Klammer.`;
      else if (f.feld === 'LK') tipp = `„${f.text}“ ist das gebeugte Verb – es steht in der linken Klammer.`;
      else if (f.feld === 'RK') tipp = `„${f.text}“ gehört zum Verb – es bildet die rechte Klammer.`;
      else if (+r !== f.reihe) tipp = `„${f.text}“ gehört in den ${satz.reihen[f.reihe].name}.`;
      else if (feld === 'VF' && f.feld === 'MF') tipp = 'Im Vorfeld steht nur genau ein Satzglied.';
      bewertung = { ok: false, text: `${falsch.length === 1 ? 'Ein Teil liegt' : `${falsch.length} Teile liegen`} noch falsch (rot). ${tipp}` };
    } else {
      schritt = 2;
      bewertung = modus === 'haupt' ? { ok: true, text: 'Richtig! Die beiden Verbteile bilden die Klammer um das Mittelfeld.' } : null;
      g.sprich(modus === 'haupt' ? 'Das Verb klammert den Satz ein – egal, wie lang das Mittelfeld ist.' : 'Richtig sortiert! Jetzt setze das Komma: Es trennt Hauptsatz und Nebensatz.', modus === 'haupt' ? 'fertig' : 'info');
    }
    zeichne();
  }

  root.addEventListener('click', e => {
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); start(); return; }
    const c = e.target.closest('[data-chip]');
    if (c && schritt === 1) {
      const id = c.dataset.chip;
      if (ablage[id]) { ablage[id] = null; gewaehlt = null; }
      else gewaehlt = gewaehlt === id ? null : id;
      bewertung = null; zeichne(); return;
    }
    const z = e.target.closest('[data-ziel]');
    if (z && gewaehlt && schritt === 1) { ablage[gewaehlt] = z.dataset.ziel; gewaehlt = null; bewertung = null; zeichne(); return; }
    const k = e.target.closest('[data-komma]');
    if (k && schritt === 2 && modus === 'neben') {
      komma = +k.dataset.komma;
      const { grenze } = woerterInOrdnung();
      bewertung = komma === grenze ? { ok: true, text: 'Richtig: Das Komma steht zwischen Hauptsatz und Nebensatz.' } : { ok: false, text: 'Das Komma gehört genau an die Grenze zwischen Hauptsatz und Nebensatz – vor das Einleitewort oder nach dem Verb am Ende des Nebensatzes.' };
      if (bewertung.ok) { schritt = 3; g.sprich('Merke: Nebensätze werden immer durch Komma abgetrennt. Du erkennst sie am Einleitewort und am Verb am Ende.', 'fertig'); }
      zeichne(); return;
    }
    const b = e.target.closest('[data-fm]');
    if (!b) return;
    if (b.dataset.fm === 'neu') { neu(); zeichne(); start(); }
    if (b.dataset.fm === 'pruefen') pruefen();
    if (b.dataset.fm === 'tipp') {
      const verb = teile.find(t => t.feld === 'LK' && t.reihe === 0);
      g.sprich(schritt === 1 ? `Suche zuerst die Verbteile. „${verb.text}“ kommt in die linke Klammer${modus === 'neben' ? ', das Einleitewort des Nebensatzes in seine linke Klammer' : ''}.` : 'Das Komma steht dort, wo der Nebensatz beginnt oder endet.', 'tipp');
    }
  });

  function start() { g.sprich(modus === 'haupt' ? 'Finde zuerst die Verbteile – sie bilden die Klammer.' : 'Im Nebensatz rutscht das Verb ans Ende.'); }
  neu(); zeichne(); start();
}
