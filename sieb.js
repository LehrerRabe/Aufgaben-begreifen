/* Mathematik: Primzahlsieb auf der Hundertertafel.
   Nacheinander werden die Vielfachen von 2, 3, 5 und 7 gestrichen – selbst angetippt oder vorgemacht.
   Jede Primzahl hat eine Farbe; so werden die Muster (Spalten, Schrägen) sichtbar.
   Was übrig bleibt, sind die Primzahlen. */

const SIEB = [2, 3, 5, 7];
const FARBE = { 2: 'p2', 3: 'p3', 5: 'p5', 7: 'p7' };
const NAME_FARBE = { 2: 'blau', 3: 'grün', 5: 'orange', 7: 'lila' };
const GRENZE = 100;

export function starteSieb(root) {
  let breite = 10;                       // Zeilenlänge der Tafel (10 oder 6)
  let schritt = 0;                       // Index in SIEB; SIEB.length = fertig gesiebt
  let gestrichen = new Map();            // Zahl -> Set der Primzahlen, durch die gestrichen
  let eingekreist = new Set();           // erkannte Primzahlen
  let fehlerZahl = null;
  let laeuft = false;
  let musterNur = null;                  // Muster einer Primzahl hervorheben

  const p = () => SIEB[schritt];
  const vielfache = q => { const v = []; for (let x = 2 * q; x <= GRENZE; x += q) v.push(x); return v; };
  const offen = q => vielfache(q).filter(x => !gestrichen.has(x));
  const fertigGesiebt = () => schritt >= SIEB.length;
  const primzahlen = () => { const r = []; for (let x = 2; x <= GRENZE; x++) if (!gestrichen.has(x)) r.push(x); return r; };

  root.innerHTML = `
  <section class="sb">
    <div class="sb-leiste">
      <div class="sb-schritte" id="sb-schritte"></div>
      <div class="sb-schalter">
        <div class="umschalter" role="group" aria-label="Zeilenlänge der Tafel">
          <button type="button" data-sb="b10" aria-pressed="true">10 je Zeile</button>
          <button type="button" data-sb="b6" aria-pressed="false">6 je Zeile</button>
        </div>
      </div>
    </div>
    <div class="sprechblase info" id="sb-blase" role="status" aria-live="polite"></div>
    <div class="sb-flaeche">
      <div class="sb-tafel-huelle"><div class="sb-tafel" id="sb-tafel"></div></div>
      <aside class="sb-rechts">
        <div class="sb-knoepfe">
          <button type="button" class="kn-gross kn-tipp" data-sb="tipp"><span aria-hidden="true">?</span> Tipp</button>
          <button type="button" class="kn-gross" data-sb="vor"><span aria-hidden="true">▶</span> Vormachen</button>
          <button type="button" class="kn-gross kn-leise" data-sb="neu">↺ Von vorn</button>
        </div>
        <div id="sb-info"></div>
      </aside>
    </div>
  </section>`;

  const $ = s => root.querySelector(s);

  function sprich(text, art = 'info') {
    const b = $('#sb-blase');
    b.className = `sprechblase ${art}`;
    b.innerHTML = `<span class="blase-symbol" aria-hidden="true">${art === 'fertig' ? '★' : art === 'tipp' ? '?' : 'i'}</span><span>${text}</span>`;
  }

  function zelleHtml(x) {
    const s = gestrichen.get(x);
    const kl = ['sb-z'];
    if (x === 1) kl.push('eins');
    if (s) kl.push('weg');
    if (SIEB.includes(x) && (SIEB.indexOf(x) < schritt || (x === p() && !fertigGesiebt()))) kl.push('prim', FARBE[x]);
    if (eingekreist.has(x)) kl.push('prim');
    if (x === fehlerZahl) kl.push('fehler');
    if (musterNur && s && !s.has(musterNur)) kl.push('blass');
    const punkte = s ? `<span class="sb-punkte">${[...s].sort((a, b) => a - b).map(q => `<i class="${FARBE[q]}"></i>`).join('')}</span>` : '';
    return `<button type="button" class="${kl.join(' ')}" data-z="${x}" aria-label="${x}${s ? ', gestrichen' : ''}">${x}${punkte}</button>`;
  }

  function zeichne() {
    const tafel = $('#sb-tafel');
    tafel.style.setProperty('--b', breite);
    let html = '';
    for (let x = 1; x <= GRENZE; x++) html += zelleHtml(x);
    tafel.innerHTML = html;

    $('#sb-schritte').innerHTML = SIEB.map((q, i) => `
      <button type="button" class="sb-schritt ${FARBE[q]}${i < schritt ? ' fertig' : i === schritt ? ' jetzt' : ''}" data-muster="${q}"
        ${i < schritt ? '' : 'disabled'} title="${i < schritt ? `Muster der ${q} hervorheben` : ''}">
        <b>${q}</b><small>${i < schritt ? '✓' : i === schritt ? 'jetzt' : ''}</small></button>`).join('')
      + `<span class="sb-schritt ende${fertigGesiebt() ? ' jetzt' : ''}"><b>P</b><small>Primzahlen</small></span>`;

    root.querySelectorAll('[data-sb="b10"],[data-sb="b6"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sb === `b${breite}`)));

    const info = $('#sb-info');
    if (!fertigGesiebt()) {
      const q = p();
      const rest = offen(q).length;
      info.innerHTML = `
        <div class="sb-karte ${FARBE[q]}">
          <span class="sb-gross">${q}</span>
          <p>Streiche alle <b>Vielfachen von ${q}</b>: ${2 * q}, ${3 * q}, ${4 * q}, … Tippe sie an.</p>
          <p class="leise">Noch ${rest} zu streichen. Schon gestrichene Zahlen musst du nicht noch einmal antippen.</p>
        </div>`;
    } else {
      const pr = primzahlen();
      const alle = pr.every(x => eingekreist.has(x));
      info.innerHTML = `
        <div class="sb-karte ende">
          <p><b>Gesiebt!</b> Alle Zahlen, die nicht gestrichen sind, haben genau zwei Teiler: Es sind die <b>Primzahlen</b>.</p>
          ${alle
            ? `<p class="sb-liste">${pr.join(', ')}</p><p>Es gibt <b>${pr.length} Primzahlen</b> bis 100.</p>`
            : '<p>Tippe die übrigen Zahlen an, um sie einzukreisen – oder lass sie einkreisen.</p><button type="button" class="kn-gross kn-haupt" data-sb="kreise">Primzahlen einkreisen</button>'}
          <p class="leise">Warum reicht es, bis 7 zu sieben? Die nächste Primzahl ist 11, und 11 · 11 = 121 ist schon größer als 100.
            Jede Zahl bis 100, die durch 11 oder eine größere Primzahl teilbar ist, hat auch einen Teiler kleiner als 10 – sie ist also schon gestrichen.</p>
          <p class="leise">Tipp: Stell die Tafel auf <b>6 je Zeile</b>. Wo stehen die Primzahlen dann?</p>
        </div>`;
    }
  }

  function abschliessen(q) {
    // Primzahl q bleibt stehen; Hinweis auf die Muster
    const muster = { 2: 'Die Vielfachen von 2 stehen in jeder zweiten Spalte.', 3: 'Die Vielfachen von 3 liegen auf Schrägen.', 5: 'Die Vielfachen von 5 stehen in zwei Spalten: …5 und …0.', 7: 'Die Vielfachen von 7 liegen auf steilen Schrägen.' };
    schritt++;
    if (fertigGesiebt()) {
      sprich(`Alle Vielfachen von ${q} sind gestrichen. ${breite === 10 ? muster[q] : ''} Jetzt ist das Sieb fertig!`, 'fertig');
    } else {
      sprich(`Alle Vielfachen von ${q} sind gestrichen. ${breite === 10 ? muster[q] : ''} ${q} selbst bleibt stehen: ${q} ist eine Primzahl. Weiter mit ${p()}.`, 'fertig');
    }
  }

  function streiche(x, q) {
    if (!gestrichen.has(x)) gestrichen.set(x, new Set());
    gestrichen.get(x).add(q);
  }

  function tippeZahl(x) {
    if (laeuft) return;
    fehlerZahl = null;
    if (fertigGesiebt()) {
      if (gestrichen.has(x) || x === 1) { sprich(`${x === 1 ? '1 hat nur einen Teiler und ist keine Primzahl.' : `${x} ist gestrichen, es ist keine Primzahl.`}`); }
      else { eingekreist.add(x); }
      zeichne();
      return;
    }
    const q = p();
    if (x === 1) { sprich('1 ist besonders: Sie hat nur einen Teiler. Darum ist 1 keine Primzahl und wird nicht gestrichen.', 'tipp'); return; }
    if (x === q) { sprich(`${q} selbst bleibt stehen – ${q} ist eine Primzahl. Streiche nur die Vielfachen: ${2 * q}, ${3 * q}, …`, 'tipp'); return; }
    if (gestrichen.has(x) && x % q === 0 && !gestrichen.get(x).has(q)) {
      streiche(x, q); zeichne();
      sprich(`${x} war schon gestrichen. Jetzt siehst du: ${x} ist auch ein Vielfaches von ${q}.`);
    } else if (gestrichen.has(x)) {
      sprich(`${x} ist schon gestrichen.`);
      return;
    } else if (x % q === 0) {
      streiche(x, q);
      zeichne();
      sprich(`${x} = ${x / q} · ${q} ✓`);
    } else {
      fehlerZahl = x;
      const unten = Math.floor(x / q) * q, oben = unten + q;
      sprich(`${x} ist kein Vielfaches von ${q}: ${unten / q} · ${q} = ${unten} und ${oben / q} · ${q} = ${oben}.`, 'tipp');
      zeichne();
      return;
    }
    if (offen(q).length === 0) {
      // bereits gestrichene Vielfache bekommen auch die Farbe von q – so sieht man gemeinsame Vielfache
      vielfache(q).forEach(v => streiche(v, q));
      abschliessen(q);
      zeichne();
    }
  }

  async function vormachen() {
    if (laeuft) return;
    if (fertigGesiebt()) {
      primzahlen().forEach(x => eingekreist.add(x)); zeichne();
      sprich('Alle Primzahlen bis 100 sind eingekreist.', 'fertig');
      return;
    }
    laeuft = true;
    const q = p();
    sprich(`Ich streiche alle Vielfachen von ${q}: Immer ${q} weiter zählen.`);
    for (const v of vielfache(q)) {
      streiche(v, q);
      const el = root.querySelector(`[data-z="${v}"]`);
      if (el) { el.outerHTML = zelleHtml(v); root.querySelector(`[data-z="${v}"]`)?.classList.add('blitz'); }
      await new Promise(r => setTimeout(r, window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 70));
      if (!root.isConnected) return;
    }
    laeuft = false;
    abschliessen(q);
    zeichne();
  }

  function tipp() {
    if (fertigGesiebt()) { sprich('Alle Zahlen, die noch nicht gestrichen sind, sind Primzahlen. Kreise sie ein.', 'tipp'); return; }
    const q = p();
    const naechste = offen(q)[0];
    sprich(`Zähle in ${q}er-Schritten: ${2 * q}, ${3 * q}, ${4 * q} … Die nächste Zahl, die du streichen musst, ist <b>${naechste}</b>.`, 'tipp');
    root.querySelector(`[data-z="${naechste}"]`)?.classList.add('tipp-ziel');
  }

  root.addEventListener('click', e => {
    const z = e.target.closest('[data-z]');
    if (z) { tippeZahl(Number(z.dataset.z)); return; }
    const m = e.target.closest('[data-muster]');
    if (m && !m.disabled) { const q = Number(m.dataset.muster); musterNur = musterNur === q ? null : q; zeichne(); return; }
    const b = e.target.closest('[data-sb]');
    if (!b) return;
    switch (b.dataset.sb) {
      case 'b10': breite = 10; zeichne(); break;
      case 'b6':
        breite = 6; zeichne();
        if (fertigGesiebt()) sprich('Sieh genau hin: Außer 2 und 3 stehen alle Primzahlen in nur zwei Spalten – in der Spalte von 1, 7, 13 … und in der Spalte von 5, 11, 17 …. Sie sind also immer 1 mehr oder 1 weniger als ein Vielfaches von 6.', 'tipp');
        break;
      case 'tipp': tipp(); break;
      case 'vor': vormachen(); break;
      case 'kreise': primzahlen().forEach(x => eingekreist.add(x)); zeichne(); sprich('Das sind alle Primzahlen bis 100.', 'fertig'); break;
      case 'neu': schritt = 0; gestrichen = new Map(); eingekreist = new Set(); musterNur = null; fehlerZahl = null; zeichne();
        sprich('Die Tafel ist wieder leer. Fang mit den Vielfachen von 2 an.'); break;
      default: break;
    }
  });

  zeichne();
  sprich(`Auf der Tafel stehen die Zahlen bis 100. Streiche zuerst alle Vielfachen von 2 (${NAME_FARBE[2]}). Die 2 selbst bleibt stehen.`);
}
