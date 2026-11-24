/* Aufgaben be-greifen – Zugang, Menü, Aufgabenwahl, Arbeitsplatz */

import { MENUE, kette } from './menue.js';
import { JAHRGAENGE, jahrgaengeVon, jgText } from './jahrgaenge.js';
import { suche, alleJahrgaenge } from './suche.js';
import { kachelBild } from './bilder.js';
import { STUFEN, neueAufgabe, pruefeEigene } from './aufgaben.js';
import { arbeitsplatz } from './arbeitsplatz.js';
import { svgDefs } from './material.js';
import { iconSvg } from './logo.js';
import { hintergrundHtml } from './hintergrund.js';
import * as addition from './addition.js';
import * as subtraktion from './subtraktion.js';
import * as multiplikation from './multiplikation.js';
import * as division from './division.js';
import { STUFEN_WA, merkkarteHtml, starte as starteWortarten } from './wortarten.js';
import { STUFEN_T, zufallsZahl, starteTeiler } from './teiler.js';
import { starteSieb } from './sieb.js';
import { STUFEN_PB, zufallsZahlPB, startePrimbaum } from './primbaum.js';
import { starteGesetze } from './gesetze.js';
import { startePotenzen } from './potenzen.js';
import { starteSpiegel } from './spiegel.js';
import { starteVierecke } from './vierecke.js';
import { starteKoordinaten } from './koordinaten.js';
import { starteBruchkreise } from './bruchkreise.js';
import { starteBruchstreifen } from './bruchstreifen.js';
import { starteAnteile, starteAnteilWelcher, starteAnteilVom } from './anteile.js';
import { starteTeilBerechnen, starteGanzesBerechnen } from './bruchteil.js';
import { starteProzentBruch } from './prozentbruch.js';
import { starteErweitern, starteKuerzen } from './bruchumformen.js';
import { starteBruchQuotient, starteBruchStrahl } from './bruchstrahl.js';
import { starteVorzeichen } from './vorzeichen.js';
import { starteGeschickt } from './geschickt.js';
import { starteRechenrahmen } from './rechenrahmen.js';
import { starteZahlenstrahl } from './zahlenstrahl.js';
import { starteUmtauschen } from './umtauschen.js';
import { starteGeld } from './geld.js';
import { starteDiagramm } from './diagramm.js';
import { starteAuslegen } from './auslegen.js';
import { starteZerlegen } from './zerlegen.js';
import { starteUmfang } from './umfang.js';
import { starteEinheiten } from './einheiten.js';
import { starteNetze } from './netze.js';
import { starteQuader } from './quader.js';
import { starteAnsichten } from './ansichten.js';
import { starteSatzglieder } from './satzglieder.js';
import { starteAbakus } from './abakus.js';
import { starteKopfPlus, starteKopfMal } from './kopfrechnen.js';
import { starteTeilen } from './teilen.js';
import { starteStreifen } from './streifen.js';
import { starteUnterschied } from './unterschied.js';
import { starteUeberschlag } from './ueberschlag.js';
import { starteSchaetzen } from './schaetzen.js';
import { starteUhr } from './uhr.js';
import { starteRaum } from './raum.js';
import { starteDreiecke } from './dreiecke.js';
import { starteStellenwerttafel } from './stellenwerttafel.js';
import { starteEinheitentafel } from './einheitentafel.js';
import { starteSchrittstrahl } from './schrittstrahl.js';
import { starteWortbausteine } from './wortbausteine.js';
import { starteNomenprobe } from './nomenprobe.js';
import { enterSteuerung } from './enter.js';
import { starteProzent } from './prozent.js';
import { starteDezimal } from './dezimal.js';
import { starteDreiformen } from './dreiformen.js';
import { starteRunden } from './runden.js';
import { starteBruchDezimal } from './bruchdezimal.js';
import { startePeriode } from './periode.js';
import { startePlausibel } from './plausibel.js';
import { startePlusMinus } from './plusminus.js';
import { starteZuordnung } from './zuordnung.js';
import { starteDarstellungen } from './darstellungen.js';
import { starteAntiprop } from './antiprop.js';
import { starteGraphenGeschichten } from './graphengeschichten.js';
import { starteVariablen } from './variablen.js';
import { starteTerme } from './terme.js';
import { starteZufall } from './zufall.js';
import { starteWinkel } from './winkel.js';
import { starteFelder } from './felder.js';
import { starteSilbenhaus } from './silbenhaus.js';
import { starteWortfamilie } from './wortfamilie.js';
import { starteZeitstrahl } from './zeitstrahl.js';
import { starteDassDas } from './dassdas.js';
import { starteTextmapping } from './textmapping.js';
import { starteSatzzug } from './satzzug.js';
import { starteRede } from './rede.js';
import { starteKomposita } from './komposita.js';
import { starteFaelle } from './faelle.js';
import { starteSteigerung } from './steigerung.js';
import { starteSatzmelodie } from './satzmelodie.js';
import { starteWortfeld } from './wortfeld.js';
import { starteOberbegriffe } from './oberbegriffe.js';
import { starteVokallaenge } from './vokallaenge.js';
import { starteSpannungsberg } from './spannungsberg.js';
import { startePronomen } from './pronomen.js';
import { starteArgument } from './argument.js';
import { starteBruchAddition, starteBruchSubtraktion } from './bruchplus.js';
import { starteBruchMal } from './bruchmal.js';
import { starteBruchDurch } from './bruchdurch.js';


/** Bausteine, die ohne Aufgabenwahl direkt starten. */
const DIREKT = {
  bruchplus: starteBruchAddition, bruchminus: starteBruchSubtraktion, bruchmal: starteBruchMal, bruchdurch: starteBruchDurch,
  sieb: starteSieb, gesetze: starteGesetze, potenzen: startePotenzen,
  spiegel: starteSpiegel, vierecke: starteVierecke, koordinaten: starteKoordinaten,
  bruchkreise: starteBruchkreise, bruchstreifen: starteBruchstreifen, anteile: starteAnteile, anteilwelcher: starteAnteilWelcher, anteilvom: starteAnteilVom, erweitern: starteErweitern, kuerzen: starteKuerzen, prozent: starteProzent, dezimal: starteDezimal, dreiformen: starteDreiformen, runden: starteRunden, bruchdezimal: starteBruchDezimal, periode: startePeriode, plausibel: startePlausibel, plusminus: startePlusMinus, zuordnung: starteZuordnung, darstellungen: starteDarstellungen, antiprop: starteAntiprop, graphen: starteGraphenGeschichten, variablen: starteVariablen, terme: starteTerme, zufall: starteZufall, winkel: starteWinkel, felder: starteFelder, silbenhaus: starteSilbenhaus, wortfamilie: starteWortfamilie, zeitstrahl: starteZeitstrahl, dassdas: starteDassDas, textmapping: starteTextmapping, teilberechnen: starteTeilBerechnen, ganzesberechnen: starteGanzesBerechnen, bruchquotient: starteBruchQuotient, bruchstrahl: starteBruchStrahl, prozentbruch: starteProzentBruch, vorzeichen: starteVorzeichen, geschickt: starteGeschickt,
  rechenrahmen: starteRechenrahmen, zahlenstrahl: starteZahlenstrahl, umtauschen: starteUmtauschen, geld: starteGeld, diagramm: starteDiagramm,
  auslegen: starteAuslegen, zerlegen: starteZerlegen, umfang: starteUmfang, einheiten: starteEinheiten,
  netze: starteNetze, quader: starteQuader, ansichten: starteAnsichten,
  kopfplus: starteKopfPlus, kopfmal: starteKopfMal,
  teilen: starteTeilen, streifen: starteStreifen, unterschied: starteUnterschied, ueberschlag: starteUeberschlag,
  schaetzen: starteSchaetzen, uhr: starteUhr, raum: starteRaum, dreiecke: starteDreiecke,
  abakus: starteAbakus, stellenwerttafel: starteStellenwerttafel, einheitentafel: starteEinheitentafel, schrittstrahl: starteSchrittstrahl,
  satzglieder: starteSatzglieder, wortbausteine: starteWortbausteine, nomenprobe: starteNomenprobe,
  satzzug: starteSatzzug, rede: starteRede, komposita: starteKomposita, faelle: starteFaelle, steigerung: starteSteigerung, satzmelodie: starteSatzmelodie,
  wortfeld: starteWortfeld, oberbegriffe: starteOberbegriffe, vokallaenge: starteVokallaenge, spannungsberg: starteSpannungsberg, pronomen: startePronomen, argument: starteArgument,
};

const MODULE = { addition, subtraktion, multiplikation, division };

/* Passwort: Hier steht nur eine Prüfsumme. Das ist ein Sichtschutz, keine echte Sicherheit.
   Groß- und Kleinschreibung spielt keine Rolle. */
const PRUEFSUMME = 'lg5oniyqe4';   // Passwort „intelligere“
const SPEICHER = 'aufgaben-begreifen-frei';

const ERKLAERUNG = {
  addition: 'Du legst beide Zahlen mit Material und schiebst sie zusammen. Liegen bei einer Stelle 10 oder mehr, tauschst du 10 gegen 1 der nächsten Stelle. Das ist der Übertrag.',
  subtraktion: 'Du legst die erste Zahl und nimmst die zweite weg. Reicht es bei einer Stelle nicht, entbündelst du: 1 der nächsten Stelle wird zu 10.',
  multiplikation: 'Auf dem Schachbrett legst du jedes Teilprodukt als Perlenstäbchen. Dann schiebst du alles schräg nach unten und bündelst 10 Perlen zu 1.',
  division: 'Du legst die Zahl und verteilst sie gerecht auf Figuren, von der größten Stelle an. Was nicht reicht, entbündelst du. Was am Ende übrig bleibt, ist der Rest.',
};

const STUFEN_FARBEN = ['#18b0bf', '#8a63ff', '#ff6a3d'];

const ESC = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const app = document.getElementById('app');
document.body.insertAdjacentHTML('afterbegin', svgDefs() + '<div class="hintergrund" id="hintergrund" aria-hidden="true"></div>');
let aktuellesThema = null;
/** Hintergrund passend zum Fach (erste Ebene des Pfads) – Startseite: Mischung. */
function setzeHintergrund(pfad) {
  const thema = pfad[0] || 'start';
  document.body.classList.add('mit-hintergrund');
  if (thema === aktuellesThema) return;
  aktuellesThema = thema;
  const el = document.getElementById('hintergrund');
  el.dataset.thema = thema;
  el.innerHTML = hintergrundHtml(thema);
}
let aktuelleWaStufe = null;
let aktuelleTeiler = null; // { stufe, n }
let aktuellerBaum = null;   // { stufe, n }
let aktuelleAufgabe = null;

/* ---------- Zugang ---------- */

function cyrb53(str, seed = 7) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function istFrei() {
  try { return localStorage.getItem(SPEICHER) === PRUEFSUMME; } catch { return sessionFrei; }
}
let sessionFrei = false;
function setzeFrei(wert) {
  sessionFrei = wert;
  try { wert ? localStorage.setItem(SPEICHER, PRUEFSUMME) : localStorage.removeItem(SPEICHER); } catch { /* egal */ }
}

function zeigeZugang() {
  document.body.className = 'ist-zugang';
  app.innerHTML = `
  <main class="zugang">
    <form class="zugang-karte" id="zugang-form" novalidate>
      <h1>Aufgaben <span class="nowrap">be-greifen</span></h1>
      <label for="zugang-pw">Passwort</label>
      <input id="zugang-pw" type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" required>
      <button type="submit">Öffnen</button>
      <p class="zugang-fehler" id="zugang-fehler" role="alert"></p>
    </form>
  </main>`;
  const form = document.getElementById('zugang-form');
  const feld = document.getElementById('zugang-pw');
  feld.focus();
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (cyrb53(feld.value.trim().toLowerCase()) === PRUEFSUMME) {
      setzeFrei(true);
      route();
    } else {
      document.getElementById('zugang-fehler').textContent = 'Das Passwort stimmt nicht. Versuche es noch einmal.';
      form.classList.remove('wackeln'); void form.offsetWidth; form.classList.add('wackeln');
      feld.select();
    }
  });
}

/* ---------- Gerüst ---------- */

function kopf(k, pfad, extra = []) {
  const teile = [];
  k.forEach((knoten, i) => {
    const href = '#' + pfad.slice(0, i).join('.');
    const letzter = i === k.length - 1 && !extra.length;
    const text = i === 0
      ? '<span class="haus" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" fill="currentColor"/></svg></span>Start'
      : ESC(knoten.titel);
    const kl = i === 0 ? 'reiter reiter-start' : 'reiter';
    teile.push(letzter
      ? `<span class="${kl}" aria-current="page">${text}</span>`
      : `<a class="${kl}" href="${href}">${text}</a>`);
  });
  extra.forEach(t => teile.push(`<span class="reiter" aria-current="page">${ESC(t)}</span>`));
  const zurueck = pfad.length || extra.length
    ? `<a class="zurueck" href="#${(extra.length ? pfad : pfad.slice(0, -1)).join('.')}"><span aria-hidden="true">←</span> Zurück</a>`
    : '';
  return `<header class="kopf">
    <nav class="pfad" aria-label="Ordner">${teile.join('<span class="pfad-trenner" aria-hidden="true">›</span>')}</nav>
    ${zurueck}
  </header>`;
}

const fuss = () => `<footer class="fuss"><button type="button" class="link-knopf" id="abmelden">Abmelden</button></footer>`;

function kachel({ href, titel, text, bild, farbe, attrs = '', jg = [], quelle = '', ort = '' }) {
  const tag = href ? 'a' : 'button';
  const badge = jg.length ? `<span class="kachel-jg" title="Jahrgangsstufe">${jgText(jg)}</span>` : '';
  return `<${tag} class="kachel" ${href ? `href="${href}"` : 'type="button"'} ${attrs} style="--farbe:${farbe}">
    <span class="kachel-bild">${kachelBild(bild, farbe)}${badge}</span>
    <span class="kachel-text">
      ${ort ? `<span class="kachel-ort">${ESC(ort)}</span>` : ''}
      <span class="kachel-titel">${ESC(titel)}</span>
      <span class="kachel-zusatz">${ESC(text)}</span>
      ${quelle ? `<span class="kachel-quelle"><span aria-hidden="true">📘</span> ${ESC(quelle)}</span>` : ''}
    </span>
  </${tag}>`;
}

/* ---------- Suche ---------- */

let suchZustand = { q: '', jg: null };
function sucheLeiste({ q, jg }, fokus = false) {
  const stufen = alleJahrgaenge();
  return `<div class="suche-leiste" role="search">
    <label class="suche-feld"><span class="suche-lupe" aria-hidden="true">🔍</span>
      <input type="search" id="suche-eingabe" value="${ESC(q)}" placeholder="Suchen – z. B. Brüche, Winkel, Komma …" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Kacheln suchen"${fokus ? ' data-fokus' : ''}>
    </label>
    <div class="jg-filter" role="group" aria-label="Jahrgangsstufe">
      <span class="jg-filter-titel">Klasse:</span>
      <button type="button" class="jg-knopf" data-jg="" aria-pressed="${!jg}">alle</button>
      ${stufen.map(s => `<button type="button" class="jg-knopf" data-jg="${s}" aria-pressed="${jg === s}">${s}</button>`).join('')}
    </div>
  </div>`;
}
function suchHash({ q, jg }) {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (jg) p.set('j', String(jg));
  return '#?' + p.toString();
}
function trefferHtml({ q, jg }) {
  const liste = suche(q, jg);
  const was = [q ? `„${ESC(q)}“` : '', jg ? `Klasse ${jg}` : ''].filter(Boolean).join(' · ');
  if (!q && !jg) return '<p class="suche-info">Tippe ein Suchwort ein oder wähle eine Klasse.</p>';
  if (!liste.length) return `<p class="suche-info">Nichts gefunden für ${was}. Probiere ein anderes Wort${jg ? ' oder „alle“ Klassen' : ''}.</p>`;
  const kacheln = liste.map(e => kachel({
    href: '#' + e.pfad.join('.'), titel: e.knoten.titel, text: e.knoten.text, bild: e.knoten.bild, farbe: e.knoten.farbe,
    jg: e.jg, quelle: e.quelle, ort: e.ordner.join(' › '),
  })).join('');
  return `<p class="suche-info" aria-live="polite"><b>${liste.length}</b> ${liste.length === 1 ? 'Kachel' : 'Kacheln'} für ${was}</p><div class="kacheln">${kacheln}</div>`;
}
function zeigeSuche(params) {
  suchZustand = { q: params.get('q') ?? '', jg: Number(params.get('j')) || null };
  setzeHintergrund([]);
  app.innerHTML = `${kopf([MENUE], [], ['Suche'])}
  <main class="seite" id="inhalt">
    <div class="seiten-titel"><h1>Suche</h1><p>In allen Kacheln – Groß- und Kleinschreibung und kleine Tippfehler sind egal.</p></div>
    ${sucheLeiste(suchZustand, true)}
    <div id="suche-treffer">${trefferHtml(suchZustand)}</div>
  </main>${fuss()}`;
}
let suchUhr = null, basisHash = '#';
/** Suche aktualisieren – im Menü direkt auf der Seite (Tastatur bleibt offen), Adresse merkt sich die Suche. */
function sucheAendern(neu) {
  suchZustand = { ...suchZustand, ...neu };
  const treffer = document.getElementById('suche-treffer');
  if (!treffer) return;
  const aktiv = Boolean(suchZustand.q.trim() || suchZustand.jg);
  const menue = document.getElementById('menue-kacheln');
  const istSuchAdresse = location.hash.startsWith('#?');
  if (menue) {
    if (aktiv && !istSuchAdresse) { basisHash = location.hash || '#'; history.pushState(null, '', suchHash(suchZustand)); }
    else if (aktiv) history.replaceState(null, '', suchHash(suchZustand));
    else if (istSuchAdresse) history.replaceState(null, '', basisHash);
    menue.hidden = aktiv;
    treffer.hidden = !aktiv;
    const titel = document.querySelector('.start-held, .seiten-titel');
    if (titel) titel.classList.toggle('gedimmt', aktiv);
  } else history.replaceState(null, '', suchHash(suchZustand));
  treffer.innerHTML = trefferHtml(suchZustand);
  document.querySelectorAll('.jg-knopf').forEach(b => b.setAttribute('aria-pressed', String((Number(b.dataset.jg) || null) === suchZustand.jg)));
}
document.addEventListener('input', e => {
  if (e.target.id !== 'suche-eingabe') return;
  clearTimeout(suchUhr);
  const q = e.target.value;
  suchUhr = setTimeout(() => sucheAendern({ q }), 140);
});
document.addEventListener('click', e => {
  const b = e.target.closest('.jg-knopf');
  if (b) sucheAendern({ jg: Number(b.dataset.jg) || null });
});
document.addEventListener('keydown', e => {
  if (e.target.id === 'suche-eingabe' && e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); clearTimeout(suchUhr); sucheAendern({ q: e.target.value }); e.target.blur(); }
}, true);

/* ---------- Seiten ---------- */

function zeigeMenue(k, pfad) {
  suchZustand = { q: '', jg: null };
  const knoten = k[k.length - 1];
  const kacheln = knoten.kinder.map(kind => {
    const p = [...pfad, kind.id], info = JAHRGAENGE[p.join('.')];
    return kachel({
      href: '#' + p.join('.'), titel: kind.titel, text: kind.text, bild: kind.bild, farbe: kind.farbe,
      jg: jahrgaengeVon(p, kind), quelle: info?.quelle ?? '',
    });
  }).join('');
  const titel = pfad.length === 0
    ? `<div class="start-held">
        <span class="start-logo">${iconSvg(undefined, { id: 'held', xmlns: false })}</span>
        <div class="start-text">
          <h1 class="start-titel">Aufgaben <span class="nowrap">be-greifen</span></h1>
          <p>${ESC(knoten.text)}</p>
        </div>
      </div>`
    : `<div class="seiten-titel">
        <h1>${ESC(knoten.titel)}</h1>
        ${knoten.text ? `<p>${ESC(knoten.text)}</p>` : ''}
      </div>`;
  setzeHintergrund(pfad);
  app.innerHTML = `${kopf(k, pfad)}
  <main class="seite${pfad.length === 0 ? ' startseite' : ''}" id="inhalt">
    ${titel}
    ${sucheLeiste({ q: '', jg: null })}
    <div class="kacheln" id="menue-kacheln">${kacheln}</div>
    <div id="suche-treffer" hidden></div>
  </main>${fuss()}`;
}

function zeigeWahl(k, pfad) {
  const knoten = k[k.length - 1];
  const art = knoten.modul;
  const zeichen = MODULE[art].INFO.zeichen;
  setzeHintergrund(pfad);
  const stufen = STUFEN[art].map((s, i) => kachel({
    titel: s.titel, text: s.text, bild: `stufe${s.stufe}`, farbe: STUFEN_FARBEN[i], attrs: `data-stufe="${s.stufe}"`,
  })).join('');

  app.innerHTML = `${kopf(k, pfad)}
  <main class="seite" id="inhalt">
    <div class="seiten-titel" style="--farbe:${knoten.farbe}">
      <h1>${ESC(knoten.titel)}</h1>
      <p>${ESC(ERKLAERUNG[art])}</p>
    </div>

    <h2 class="abschnitt">Aufgabe bekommen</h2>
    <div class="kacheln">${stufen}</div>

    <h2 class="abschnitt">Eigene Aufgabe</h2>
    <form class="eigene" id="eigene" novalidate style="--farbe:${knoten.farbe}">
      <span class="eigene-bild">${kachelBild('eigene', '#ec5fa8')}</span>
      <div class="eigene-inhalt">
        <p>Gib eine Aufgabe ein, zum Beispiel aus deinem Buch.</p>
        <div class="eigene-zeile">
          <label class="vh" for="eigene-a">Erste Zahl</label>
          <input id="eigene-a" inputmode="numeric" autocomplete="off" placeholder="${art === 'division' ? '847' : '4578'}">
          <span class="eigene-zeichen" aria-hidden="true">${zeichen}</span>
          <label class="vh" for="eigene-b">Zweite Zahl</label>
          <input id="eigene-b" inputmode="numeric" autocomplete="off" placeholder="${art === 'division' ? '3' : art === 'multiplikation' ? '25' : '2645'}">
          <button type="submit" class="kn-gross kn-haupt">Los geht's</button>
        </div>
        <p class="eigene-fehler" id="eigene-fehler" role="alert"></p>
      </div>
    </form>
  </main>${fuss()}`;

  app.querySelectorAll('[data-stufe]').forEach(b => b.addEventListener('click', () => {
    const stufe = Number(b.dataset.stufe);
    aktuelleAufgabe = { art, stufe, ...neueAufgabe(art, stufe) };
    location.hash = [...pfad, 'rechnen'].join('.');
  }));

  document.getElementById('eigene').addEventListener('submit', e => {
    e.preventDefault();
    const lies = id => {
      const roh = document.getElementById(id).value.replace(/[\s. ]/g, '');
      return /^\d+$/.test(roh) ? Number(roh) : NaN;
    };
    const a = lies('eigene-a'), b = lies('eigene-b');
    const fehler = pruefeEigene(art, a, b);
    if (fehler) { document.getElementById('eigene-fehler').textContent = fehler; return; }
    aktuelleAufgabe = { art, stufe: null, a, b };
    location.hash = [...pfad, 'rechnen'].join('.');
  });
}

function zeigeArbeit(k, pfad) {
  const knoten = k[k.length - 1];
  const art = knoten.modul;
  if (!aktuelleAufgabe || aktuelleAufgabe.art !== art) {
    location.replace('#' + pfad.join('.'));
    return;
  }
  app.innerHTML = `${kopf(k, pfad, [aktuelleAufgabe.stufe ? `Stufe ${aktuelleAufgabe.stufe}` : 'Eigene Aufgabe'])}
    <main class="seite seite-breit" id="inhalt"></main>${fuss()}`;
  const stufe = aktuelleAufgabe.stufe;
  arbeitsplatz(document.getElementById('inhalt'), MODULE[art], aktuelleAufgabe, {
    neueAufgabe: stufe ? () => {
      aktuelleAufgabe = { art, stufe, ...neueAufgabe(art, stufe) };
      return aktuelleAufgabe;
    } : null,
  });
}

/* ---------- Deutsch: Wortarten ---------- */

const WA_FARBEN = ['#13a39b', '#2b4bb5', '#e0457b'];

function zeigeWortartenWahl(k, pfad) {
  const knoten = k[k.length - 1];
  setzeHintergrund(pfad);
  const stufen = STUFEN_WA.map((s, i) => kachel({
    titel: s.titel, text: s.text, bild: `wa${s.stufe}`, farbe: WA_FARBEN[i], attrs: `data-wa-stufe="${s.stufe}"`,
  })).join('');
  app.innerHTML = `${kopf(k, pfad)}
  <main class="seite" id="inhalt">
    <div class="seiten-titel" style="--farbe:${knoten.farbe}">
      <h1>${ESC(knoten.titel)}</h1>
      <p>Lege über jedes Wort das Symbol seiner Wortart. Wähle ein Symbol aus dem Kasten und tippe auf das Wort, oder ziehe das Symbol auf das Wort.</p>
    </div>
    <h2 class="abschnitt">Stufe wählen</h2>
    <div class="kacheln">${stufen}</div>
    <h2 class="abschnitt">Merkkarte: die Symbole</h2>
    ${merkkarteHtml()}
  </main>${fuss()}`;
  app.querySelectorAll('[data-wa-stufe]').forEach(b => b.addEventListener('click', () => {
    aktuelleWaStufe = Number(b.dataset.waStufe);
    location.hash = [...pfad, 'rechnen'].join('.');
  }));
}

function zeigeWortartenArbeit(k, pfad) {
  if (!aktuelleWaStufe) { location.replace('#' + pfad.join('.')); return; }
  app.innerHTML = `${kopf(k, pfad, [`Stufe ${aktuelleWaStufe}`])}
    <main class="seite seite-breit" id="inhalt"></main>${fuss()}`;
  starteWortarten(document.getElementById('inhalt'), aktuelleWaStufe, {
    andereStufe: () => { location.hash = pfad.join('.'); },
  });
}

/* ---------- Mathematik: Teiler und Primzahlen ---------- */

function zeigeTeilerWahl(k, pfad) {
  const knoten = k[k.length - 1];
  setzeHintergrund(pfad);
  const stufen = STUFEN_T.map((s, i) => kachel({
    titel: s.titel, text: s.text, bild: `stufe${s.stufe}`, farbe: STUFEN_FARBEN[i], attrs: `data-t-stufe="${s.stufe}"`,
  })).join('');
  app.innerHTML = `${kopf(k, pfad)}
  <main class="seite" id="inhalt">
    <div class="seiten-titel" style="--farbe:${knoten.farbe}">
      <h1>${ESC(knoten.titel)}</h1>
      <p>Stecke die Perlen in gleich lange Reihen. Geht es ohne Rest auf, ist die Reihenlänge ein Teiler – und die Zahl der Reihen auch.</p>
    </div>
    <h2 class="abschnitt">Zahl bekommen</h2>
    <div class="kacheln">${stufen}</div>
    <h2 class="abschnitt">Eigene Zahl</h2>
    <form class="eigene" id="eigene" novalidate style="--farbe:${knoten.farbe}">
      <span class="eigene-bild">${kachelBild('eigene', '#ec5fa8')}</span>
      <div class="eigene-inhalt">
        <p>Welche Zahl möchtest du untersuchen? (2 bis 100)</p>
        <div class="eigene-zeile">
          <label class="vh" for="eigene-a">Zahl</label>
          <input id="eigene-a" inputmode="numeric" autocomplete="off" placeholder="24">
          <button type="submit" class="kn-gross kn-haupt">Los geht's</button>
        </div>
        <p class="eigene-fehler" id="eigene-fehler" role="alert"></p>
      </div>
    </form>
  </main>${fuss()}`;
  app.querySelectorAll('[data-t-stufe]').forEach(b => b.addEventListener('click', () => {
    const stufe = Number(b.dataset.tStufe);
    aktuelleTeiler = { stufe, n: zufallsZahl(stufe) };
    location.hash = [...pfad, 'rechnen'].join('.');
  }));
  document.getElementById('eigene').addEventListener('submit', e => {
    e.preventDefault();
    const roh = document.getElementById('eigene-a').value.trim();
    const n = /^\d+$/.test(roh) ? Number(roh) : NaN;
    if (!(n >= 2 && n <= 100)) { document.getElementById('eigene-fehler').textContent = 'Bitte gib eine ganze Zahl von 2 bis 100 ein.'; return; }
    aktuelleTeiler = { stufe: null, n };
    location.hash = [...pfad, 'rechnen'].join('.');
  });
}

function zeigeTeilerArbeit(k, pfad) {
  if (!aktuelleTeiler) { location.replace('#' + pfad.join('.')); return; }
  const { stufe } = aktuelleTeiler;
  app.innerHTML = `${kopf(k, pfad, [stufe ? `Stufe ${stufe}` : 'Eigene Zahl'])}
    <main class="seite seite-breit" id="inhalt"></main>${fuss()}`;
  starteTeiler(document.getElementById('inhalt'), aktuelleTeiler.n, {
    neueZahl: stufe ? () => (aktuelleTeiler.n = zufallsZahl(stufe, aktuelleTeiler.n)) : null,
  });
}

function zeigeDirekt(k, pfad, starte) {
  app.innerHTML = `${kopf(k, pfad)}
    <main class="seite seite-breit" id="inhalt"></main>${fuss()}`;
  starte(document.getElementById('inhalt'));
}

function zeigeBaumWahl(k, pfad) {
  const knoten = k[k.length - 1];
  setzeHintergrund(pfad);
  const stufen = STUFEN_PB.map((s, i) => kachel({
    titel: s.titel, text: s.text, bild: `stufe${s.stufe}`, farbe: STUFEN_FARBEN[i], attrs: `data-pb-stufe="${s.stufe}"`,
  })).join('');
  app.innerHTML = `${kopf(k, pfad)}
  <main class="seite" id="inhalt">
    <div class="seiten-titel" style="--farbe:${knoten.farbe}">
      <h1>${ESC(knoten.titel)}</h1>
      <p>Spalte eine Zahl in zwei Faktoren, und die Faktoren wieder – bis nur noch Primzahlen übrig sind. Sie sind die Bausteine der Zahl.</p>
    </div>
    <h2 class="abschnitt">Zahl bekommen</h2>
    <div class="kacheln">${stufen}</div>
    <h2 class="abschnitt">Eigene Zahl</h2>
    <form class="eigene" id="eigene" novalidate style="--farbe:${knoten.farbe}">
      <span class="eigene-bild">${kachelBild('eigene', '#ec5fa8')}</span>
      <div class="eigene-inhalt">
        <p>Welche Zahl möchtest du zerlegen? (4 bis 1000)</p>
        <div class="eigene-zeile">
          <label class="vh" for="eigene-a">Zahl</label>
          <input id="eigene-a" inputmode="numeric" autocomplete="off" placeholder="360">
          <button type="submit" class="kn-gross kn-haupt">Los geht's</button>
        </div>
        <p class="eigene-fehler" id="eigene-fehler" role="alert"></p>
      </div>
    </form>
  </main>${fuss()}`;
  app.querySelectorAll('[data-pb-stufe]').forEach(b => b.addEventListener('click', () => {
    const stufe = Number(b.dataset.pbStufe);
    aktuellerBaum = { stufe, n: zufallsZahlPB(stufe) };
    location.hash = [...pfad, 'rechnen'].join('.');
  }));
  document.getElementById('eigene').addEventListener('submit', e => {
    e.preventDefault();
    const roh = document.getElementById('eigene-a').value.trim();
    const n = /^\d+$/.test(roh) ? Number(roh) : NaN;
    if (!(n >= 4 && n <= 1000)) { document.getElementById('eigene-fehler').textContent = 'Bitte gib eine ganze Zahl von 4 bis 1000 ein.'; return; }
    aktuellerBaum = { stufe: null, n };
    location.hash = [...pfad, 'rechnen'].join('.');
  });
}

function zeigeBaumArbeit(k, pfad) {
  if (!aktuellerBaum) { location.replace('#' + pfad.join('.')); return; }
  const { stufe } = aktuellerBaum;
  app.innerHTML = `${kopf(k, pfad, [stufe ? `Stufe ${stufe}` : 'Eigene Zahl'])}
    <main class="seite seite-breit" id="inhalt"></main>${fuss()}`;
  startePrimbaum(document.getElementById('inhalt'), aktuellerBaum.n, {
    neueZahl: stufe ? () => (aktuellerBaum.n = zufallsZahlPB(stufe, aktuellerBaum.n)) : null,
  });
}

/* ---------- Navigation ---------- */

function route() {
  if (!istFrei()) { zeigeZugang(); return; }
  document.body.className = 'ist-app';
  const roh = location.hash.replace(/^#/, '');
  if (roh.startsWith('?')) { zeigeSuche(new URLSearchParams(roh.slice(1))); window.scrollTo(0, 0); return; }
  let pfad = roh ? roh.split('.').filter(Boolean) : [];
  const rechnen = pfad[pfad.length - 1] === 'rechnen';
  if (rechnen) pfad = pfad.slice(0, -1);

  const k = kette(pfad);
  if (!k) { location.replace('#'); return; }
  const knoten = k[k.length - 1];

  if (DIREKT[knoten.modul]) {
    zeigeDirekt(k, pfad, DIREKT[knoten.modul]);
  } else if (knoten.modul === 'primbaum') {
    if (rechnen) zeigeBaumArbeit(k, pfad); else zeigeBaumWahl(k, pfad);
  } else if (knoten.modul === 'teiler') {
    if (rechnen) zeigeTeilerArbeit(k, pfad); else zeigeTeilerWahl(k, pfad);
  } else if (knoten.modul === 'wortarten') {
    if (rechnen) zeigeWortartenArbeit(k, pfad); else zeigeWortartenWahl(k, pfad);
  } else if (knoten.modul) {
    if (rechnen) zeigeArbeit(k, pfad); else zeigeWahl(k, pfad);
  } else {
    zeigeMenue(k, pfad);
  }
  window.scrollTo(0, 0);
}

document.addEventListener('click', e => {
  if (e.target.id === 'abmelden') {
    setzeFrei(false);
    location.hash = '';
    zeigeZugang();
  }
});

window.addEventListener('hashchange', route);
enterSteuerung();
route();
