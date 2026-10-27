/* Arbeitsplatz: Aufgabe, Material, schriftliche Rechnung und Hilfen.
   Die Rechenarten liefern nur Daten und HTML, hier wird alles verbunden. */

import { buendeln, entbuendeln, feldTauschen, mitBewegung } from './animation.js';
import { stellenName } from './stellen.js';

const ESC = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Selektor aus allen Angaben des Ziels, z. B. { aktion: 'feld', r: 0, c: 2 } */
function zielSelektor(z) {
  return Object.entries(z).filter(([, v]) => v !== undefined)
    .map(([k, v]) => `[data-${k}="${v}"]`).join('');
}

/** data-Attribute eines Knopfs; Zahlen werden zu Zahlen. */
function datenVon(el) {
  const d = {};
  for (const [k, v] of Object.entries(el.dataset)) d[k] = /^-?\d+$/.test(v) ? Number(v) : v;
  return d;
}

export function arbeitsplatz(root, modul, aufgabe, { neueAufgabe } = {}) {
  let op = modul.erzeuge(aufgabe);
  const ui = {
    modus: op.kannPerlen ? 'perlen' : 'plaettchen',
    anzahl: true, rechenweg: true,
    eingaben: {}, bewertung: {}, neu: null, tippZiel: null,
  };
  let warFertig = false;
  let laeuft = false;

  /** Passende Animation zu einer Aktion (oder null). Läuft, bevor sich der Zustand ändert. */
  function animationFuer(name, d) {
    if (!mitBewegung()) return null;
    const spalte = (t, p) => root.querySelector(`.spalte[data-tablett="${t}"][data-stelle="${p}"]`);
    const feld = (r, c) => root.querySelector(`.feld[data-r="${r}"][data-c="${c}"]`);
    if (name === 'tauschen') {
      const p = d.stelle;
      return () => buendeln({ quelle: spalte(d.tablett, p), ziel: spalte(d.tablett, p + 1), p, modus: ui.modus,
        text: `10 ${stellenName(p)} = <b>1 ${stellenName(p + 1)}</b>` });
    }
    if (name === 'entbuendeln' || name === 'entbuendelnAlle') {
      const p = d.stelle;
      if (!p) return null;
      return () => entbuendeln({ quelle: spalte(d.tablett, p), ziel: spalte(d.tablett, p - 1), p, modus: ui.modus,
        text: `1 ${stellenName(p)} = <b>10 ${stellenName(p - 1)}</b>` });
    }
    if (name === 'feldTauschen') {
      const q = feld(d.r, d.c);
      if (!q) return null;
      const staebe = [...q.querySelectorAll('.pstab')].map(e => Number(e.style.getPropertyValue('--l')));
      const n = staebe.reduce((x, y) => x + y, 0);
      const w = d.r + d.c;
      const text = n >= 10
        ? `${n} ${stellenName(w)} = <b>${Math.floor(n / 10)} ${stellenName(w + 1)}</b>${n % 10 ? ` + ${n % 10} ${stellenName(w)}` : ''}`
        : `${staebe.join(' + ')} = <b>${n}</b>`;
      return () => feldTauschen({ quelle: q, ziel: feld(d.r, d.c + 1), staebe, text });
    }
    return null;
  }

  async function mitAnimation(name, d) {
    const anim = animationFuer(name, d);
    if (!anim) return;
    laeuft = true;
    root.querySelector('.arbeitsplatz').classList.add('animiert');
    try { await anim(); } catch (e) { console.warn(e); }
    root.querySelector('.arbeitsplatz').classList.remove('animiert');
    laeuft = false;
  }

  root.innerHTML = `
  <section class="arbeitsplatz">
    <div class="aufgabenleiste">
      <div class="aufgabe-box">
        <span class="etikett">Deine Aufgabe</span>
        <span class="aufgabe-gross">${ESC(op.aufgabeText)}</span>
      </div>
      <div class="schalter-gruppe">
        ${op.ohneUmschalter ? '' : `
        <div class="umschalter" role="group" aria-label="Material">
          <button type="button" data-ui="perlen" ${op.kannPerlen ? '' : 'disabled title="Perlen gibt es nur bis 9999"'}>Perlen</button>
          <button type="button" data-ui="plaettchen">Plättchen</button>
        </div>`}
        <label class="haken"><input type="checkbox" id="ui-anzahl" checked> Anzahl zeigen</label>
        ${op.mitRechenweg ? '<label class="haken"><input type="checkbox" id="ui-rechenweg" checked> Rechenweg mitschreiben</label>' : ''}
      </div>
    </div>

    <div class="hilfeleiste">
      <button type="button" class="kn-gross kn-tipp" data-ui="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross" data-ui="vormachen"><span aria-hidden="true">▶</span> Schritt vormachen</button>
      <button type="button" class="kn-gross kn-leise" data-ui="vonvorn"><span aria-hidden="true">↺</span> Von vorn</button>
      ${neueAufgabe ? '<button type="button" class="kn-gross kn-leise" data-ui="neu"><span aria-hidden="true">＋</span> Neue Aufgabe</button>' : ''}
    </div>

    <div class="sprechblase" id="sprechblase" role="status" aria-live="polite" hidden></div>

    <div class="arbeitsflaeche">
      <div class="material-bereich">
        <h2 class="bereich-titel">Mit Material legen</h2>
        <div id="material"></div>
      </div>
      <aside class="schrift-bereich">
        <h2 class="bereich-titel">Schriftlich rechnen</h2>
        <div class="raster-huelle" id="schrift"></div>
        <div class="pruef-knoepfe">
          <button type="button" class="kn-gross kn-haupt" data-ui="pruefen">✓ Prüfen</button>
          <button type="button" class="kn-gross kn-leise" data-ui="loesung">Lösung zeigen</button>
        </div>
        <div class="rueckmeldung" id="rueckmeldung" role="status" aria-live="polite" hidden></div>
      </aside>
    </div>
  </section>`;

  const $ = s => root.querySelector(s);
  const material = $('#material'), schrift = $('#schrift');
  const blase = $('#sprechblase'), rueck = $('#rueckmeldung');

  function sprich(text, art = 'info') {
    // Die Blase bleibt immer sichtbar, damit das Material darunter nicht springt
    if (!text) { text = 'Wenn du nicht weiterweißt, tippe auf „Tipp“.'; art = 'info'; }
    blase.hidden = false;
    blase.className = `sprechblase ${art}`;
    blase.innerHTML = `<span class="blase-symbol" aria-hidden="true">${art === 'fertig' ? '★' : art === 'tipp' ? '?' : 'i'}</span><span>${ESC(text)}</span>`;
  }

  function melde(text, art) {
    if (!text) { rueck.hidden = true; return; }
    rueck.hidden = false;
    rueck.className = `rueckmeldung ${art}`;
    rueck.textContent = text;
  }

  function zeichneSchrift() {
    const aktiv = document.activeElement?.dataset?.key;
    schrift.innerHTML = op.schriftHtml(ui);
    if (aktiv) schrift.querySelector(`[data-key="${aktiv}"]`)?.focus();
  }

  function zeichne() {
    material.innerHTML = op.materialHtml(ui);
    zeichneSchrift();
    root.querySelectorAll('[data-ui="perlen"],[data-ui="plaettchen"]').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.ui === ui.modus)));
    if (ui.tippZiel) {
      const el = root.querySelector(zielSelektor(ui.tippZiel));
      if (el) {
        el.classList.add('tipp-ziel');
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
    ui.neu = null;
  }

  function nachAktion(res) {
    ui.neu = res?.neu || null;
    ui.tippZiel = null;
    zeichne();
    if (op.fertigMaterial() && !warFertig) {
      warFertig = true;
      sprich(op.tipp().text, 'fertig');
    } else if (res?.meldung) {
      sprich(res.meldung, 'info');
    } else {
      sprich('');
    }
  }

  function neuStart(nextAufgabe) {
    if (nextAufgabe) aufgabe = nextAufgabe;
    op = modul.erzeuge(aufgabe);
    ui.eingaben = {}; ui.bewertung = {}; ui.tippZiel = null;
    if (!op.kannPerlen) ui.modus = 'plaettchen';
    warFertig = false;
    $('.aufgabe-gross').textContent = op.aufgabeText;
    const perlenKnopf = $('[data-ui="perlen"]');
    if (perlenKnopf) {
      perlenKnopf.disabled = !op.kannPerlen;
      perlenKnopf.title = op.kannPerlen ? '' : 'Perlen gibt es nur bis 9999';
    }
    sprich(''); melde('');
    zeichne();
  }

  root.addEventListener('click', async e => {
    const el = e.target.closest('[data-aktion],[data-ui]');
    if (!el || el.disabled || !root.contains(el) || laeuft) return;

    if (el.dataset.aktion) {
      const d = datenVon(el);
      await mitAnimation(el.dataset.aktion, d);
      const res = op.aktion(el.dataset.aktion, d);
      if (res === null) { zeichne(); return; }
      nachAktion(res);
      return;
    }

    switch (el.dataset.ui) {
      case 'perlen':
      case 'plaettchen':
        if (el.dataset.ui === 'perlen' && !op.kannPerlen) return;
        ui.modus = el.dataset.ui; zeichne(); break;
      case 'tipp': {
        const t = op.tipp();
        ui.tippZiel = t.ziel || null;
        zeichne();
        sprich(t.text, t.fertig ? 'fertig' : 'tipp');
        break;
      }
      case 'vormachen': {
        const t = op.tipp();
        if (!t.vor) { sprich(t.fertig ? 'Am Material ist alles erledigt. Schreib jetzt das Ergebnis in die Rechnung.' : t.text, t.fertig ? 'fertig' : 'tipp'); break; }
        await mitAnimation(t.vor.aktion, t.vor);
        const res = op.aktion(t.vor.aktion, t.vor);
        ui.neu = res?.neu || null; ui.tippZiel = null;
        zeichne();
        if (op.fertigMaterial() && !warFertig) { warFertig = true; sprich(op.tipp().text, 'fertig'); }
        else sprich([t.vorText, res?.meldung].filter(Boolean).join(' '), 'info');
        break;
      }
      case 'vonvorn': neuStart(); break;
      case 'neu': neuStart(neueAufgabe()); break;
      case 'pruefen': {
        const r = op.pruefe(ui.eingaben);
        ui.bewertung = r.bewertung;
        zeichneSchrift();
        if (r.richtig) melde('Alles richtig! Super gemacht.', 'gut');
        else {
          const teile = [];
          if (r.falsch) teile.push(`${r.falsch} ${r.falsch === 1 ? 'Feld stimmt' : 'Felder stimmen'} noch nicht`);
          if (r.fehlt) teile.push(`${r.fehlt} ${r.fehlt === 1 ? 'Feld ist' : 'Felder sind'} noch leer`);
          melde(teile.join(' und ') + '.' + (op.fertigMaterial() ? ' Vergleiche mit deinem Material.' : ' Leg die Aufgabe mit dem Material, dann siehst du das Ergebnis.'), 'schlecht');
        }
        break;
      }
      case 'loesung': {
        if (el.dataset.sicher !== '1') {
          el.dataset.sicher = '1';
          el.textContent = 'Wirklich? Nochmal tippen';
          setTimeout(() => { el.dataset.sicher = ''; el.textContent = 'Lösung zeigen'; }, 4000);
          break;
        }
        el.dataset.sicher = ''; el.textContent = 'Lösung zeigen';
        ui.eingaben = { ...ui.eingaben, ...op.loesung() };
        ui.bewertung = {};
        zeichneSchrift();
        melde('Das ist die Lösung. Vergleiche sie mit deinem Material.', 'info');
        break;
      }
    }
  });

  root.addEventListener('change', e => {
    if (e.target.id === 'ui-anzahl') { ui.anzahl = e.target.checked; zeichne(); }
    if (e.target.id === 'ui-rechenweg') { ui.rechenweg = e.target.checked; zeichneSchrift(); }
  });

  root.addEventListener('input', e => {
    const el = e.target;
    if (!el.classList.contains('ziffer')) return;
    const max = Number(el.getAttribute('maxlength')) || 1;
    const v = el.value.replace(/\D/g, '').slice(-max);
    el.value = v;
    ui.eingaben[el.dataset.key] = v;
    delete ui.bewertung[el.dataset.key];
    el.classList.remove('ok', 'falsch', 'fehlt', 'cue');
    rueck.hidden = true;
    if (v.length >= max && el.dataset.weiter) {
      const n = schrift.querySelector(`[data-key="${el.dataset.weiter}"]`);
      if (n) { n.focus(); n.select?.(); }
    }
  });

  root.addEventListener('focusin', e => {
    if (e.target.classList?.contains('ziffer')) e.target.select?.();
  });

  zeichne();
  sprich('Lege die Aufgabe mit dem Material. Wenn du nicht weiterweißt, tippe auf „Tipp“.', 'info');
  return { neuStart };
}
