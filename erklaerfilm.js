/* Erklärfilm: kurzer animierter Film in einem Fenster über dem Baustein.
   Eine Szene = { text, bild (SVG-Inhalt, viewBox 0 0 640 320), anim: [[Selektor, Keyframes, {duration, delay, stufe}]], dauer }.
   Steuerung: Abspielen/Pause, Szene zurück/vor, Kapitelpunkte, Vorlesen (Sprachausgabe des Browsers), Schließen (auch Esc).
   In Texten schreibt man Brüche als {3/8}: angezeigt als Bruch, vorgelesen als „3 Achtel“. */

import { ESC, bruchHtml, bewegung } from './geruest.js';
import { bruchWort } from './bruchbild.js';

const SPEICHER = 'ab-film-vorlesen';
const lesen = () => { try { return localStorage.getItem(SPEICHER) === '1'; } catch { return false; } };
const merken = w => { try { localStorage.setItem(SPEICHER, w ? '1' : '0'); } catch { /* egal */ } };
const sprachAusgabe = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

const textHtml = t => ESC(t).replace(/\{(\d+)\/(\d+)\}/g, (_, z, n) => bruchHtml(z, n)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const textSprache = t => t.replace(/\{(\d+)\/(\d+)\}/g, (_, z, n) => bruchWort(+z, +n))
  .replace(/\*\*/g, '').replace(/ · /g, ' mal ').replace(/ : /g, ' geteilt durch ').replace(/ − /g, ' minus ').replace(/ \+ /g, ' plus ').replace(/ = /g, ' gleich ');

/** Bruch als SVG-Text (Mitte bei x, Bruchstrich bei y) */
export function bruchSvg(x, y, z, n, gr = 30, klasse = '') {
  const b = Math.max(String(z).length, String(n).length) * gr * 0.62 + 8;
  return `<g class="ef-bruch ${klasse}"><text x="${x}" y="${y - gr * 0.18}" font-size="${gr}" text-anchor="middle">${z}</text>
    <line x1="${x - b / 2}" x2="${x + b / 2}" y1="${y}" y2="${y}" stroke-width="${gr / 11}"/>
    <text x="${x}" y="${y + gr * 0.92}" font-size="${gr}" text-anchor="middle">${n}</text></g>`;
}
/** Normaler SVG-Text */
export const textSvg = (x, y, t, gr = 26, klasse = '', anker = 'middle') => `<text x="${x}" y="${y}" font-size="${gr}" class="ef-t ${klasse}" style="text-anchor:${anker}">${ESC(t)}</text>`;

let offen = null;

export function zeigeFilm(titel, szenen) {
  offen?.schliessen();
  let i = 0, spielt = true, anims = [], meister = null, vorlesen = lesen() && sprachAusgabe(), aeusserung = null, wartetAufSprache = false;
  const vorher = document.activeElement;

  const huelle = document.createElement('div');
  huelle.className = 'ef-huelle';
  huelle.innerHTML = `
    <div class="ef-karte" role="dialog" aria-modal="true" aria-label="Erklärfilm: ${ESC(titel)}">
      <div class="ef-kopf"><b><span aria-hidden="true">🎬</span> ${ESC(titel)}</b><button type="button" class="ef-zu" data-ef="zu" aria-label="Film schließen">✕</button></div>
      <div class="ef-buehne"><svg viewBox="0 0 640 320" role="img" aria-hidden="true"></svg></div>
      <p class="ef-text" aria-live="polite"></p>
      <div class="ef-balken"><span></span></div>
      <div class="ef-steuer">
        <button type="button" class="ef-kn" data-ef="zurueck" aria-label="Szene zurück">⏮</button>
        <button type="button" class="ef-kn ef-haupt" data-ef="spiel" aria-label="Pause">⏸</button>
        <button type="button" class="ef-kn" data-ef="vor" aria-label="Nächste Szene">⏭</button>
        <span class="ef-punkte">${szenen.map((_, k) => `<button type="button" class="ef-punkt" data-szene="${k}" aria-label="Szene ${k + 1}"></button>`).join('')}</span>
        ${sprachAusgabe() ? `<button type="button" class="ef-kn ef-vorlesen" data-ef="vorlesen" aria-pressed="${vorlesen}">🔊 Vorlesen</button>` : ''}
      </div>
    </div>`;
  document.body.appendChild(huelle);
  const svg = huelle.querySelector('svg'), text = huelle.querySelector('.ef-text'), balken = huelle.querySelector('.ef-balken span');
  const spielKnopf = huelle.querySelector('[data-ef="spiel"]');

  function stopSprache() { if (sprachAusgabe()) { wartetAufSprache = false; aeusserung = null; window.speechSynthesis.cancel(); } }
  function sprechen() {
    stopSprache();
    if (!vorlesen || !spielt) return;
    const u = new SpeechSynthesisUtterance(textSprache(szenen[i].text));
    u.lang = 'de-DE'; u.rate = 0.95;
    const stimme = window.speechSynthesis.getVoices().find(v => /^de/i.test(v.lang));
    if (stimme) u.voice = stimme;
    u.onend = () => { if (aeusserung !== u) return; aeusserung = null; if (wartetAufSprache) { wartetAufSprache = false; weiter(); } };
    aeusserung = u;
    window.speechSynthesis.speak(u);
  }
  const dauer = s => {
    const d = s.dauer ?? 5000;
    if (!vorlesen) return d;
    return Math.max(d, textSprache(s.text).split(/\s+/).length * 400 + 900);
  };

  function weiter() {
    if (i < szenen.length - 1) zeige(i + 1);
    else ende();
  }
  function ende() {
    spielt = false;
    spielKnopf.textContent = '↺'; spielKnopf.setAttribute('aria-label', 'Nochmal ansehen'); spielKnopf.dataset.nochmal = '1';
  }

  function zeige(n) {
    anims.forEach(a => a.cancel()); meister?.cancel();
    i = Math.max(0, Math.min(szenen.length - 1, n));
    const s = szenen[i];
    svg.innerHTML = s.bild;
    text.innerHTML = textHtml(s.text);
    huelle.querySelectorAll('.ef-punkt').forEach((p, k) => { p.classList.toggle('an', k === i); p.classList.toggle('gesehen', k < i); });
    delete spielKnopf.dataset.nochmal;
    const schnell = !bewegung();
    anims = (s.anim ?? []).flatMap(([sel, kf, o = {}]) => [...svg.querySelectorAll(sel)].map((el, k) => {
      const { stufe = 0, delay = 0, duration = 800, ...rest } = o;
      return el.animate(kf, { fill: 'both', easing: 'ease-in-out', ...rest, delay: schnell ? 0 : delay + stufe * k, duration: schnell ? 1 : duration });
    }));
    meister = balken.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: dauer(s), fill: 'forwards', easing: 'linear' });
    meister.onfinish = () => {
      if (!spielt) return;
      if (vorlesen && aeusserung && window.speechSynthesis.speaking) { wartetAufSprache = true; return; }
      weiter();
    };
    if (!spielt) { anims.forEach(a => a.pause()); meister.pause(); stopSprache(); }
    else sprechen();
    spielKnopf.textContent = spielt ? '⏸' : '▶';
    spielKnopf.setAttribute('aria-label', spielt ? 'Pause' : 'Abspielen');
  }

  function umschalten() {
    if (spielKnopf.dataset.nochmal) { spielt = true; zeige(0); return; }
    spielt = !spielt;
    if (spielt) { anims.forEach(a => a.play()); meister.play(); sprechen(); }
    else { anims.forEach(a => a.pause()); meister.pause(); stopSprache(); }
    spielKnopf.textContent = spielt ? '⏸' : '▶';
    spielKnopf.setAttribute('aria-label', spielt ? 'Pause' : 'Abspielen');
  }

  function schliessen() {
    anims.forEach(a => a.cancel()); meister?.cancel(); stopSprache();
    huelle.remove(); document.removeEventListener('keydown', taste, true); window.removeEventListener('hashchange', schliessen);
    offen = null;
    if (vorher?.isConnected) vorher.focus({ preventScroll: true });
  }
  function taste(e) {
    if (e.key === 'Escape') { e.preventDefault(); schliessen(); }
    else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); umschalten(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); zeige(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); zeige(i - 1); }
    else if (e.key === 'Enter') e.stopPropagation();
  }

  huelle.addEventListener('click', e => {
    if (e.target === huelle) return schliessen();
    const b = e.target.closest('[data-ef], [data-szene]');
    if (!b) return;
    if (b.dataset.szene) return zeige(+b.dataset.szene);
    const a = b.dataset.ef;
    if (a === 'zu') schliessen();
    if (a === 'spiel') umschalten();
    if (a === 'vor') zeige(i + 1);
    if (a === 'zurueck') zeige(i - 1);
    if (a === 'vorlesen') { vorlesen = !vorlesen; merken(vorlesen); b.setAttribute('aria-pressed', String(vorlesen)); if (vorlesen) zeige(i); else stopSprache(); }
  });
  document.addEventListener('keydown', taste, true);
  window.addEventListener('hashchange', schliessen);

  offen = { schliessen };
  zeige(0);
  huelle.querySelector('[data-ef="spiel"]').focus({ preventScroll: true });
  return offen;
}
