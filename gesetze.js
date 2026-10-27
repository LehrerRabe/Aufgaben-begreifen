/* Mathematik: Rechengesetze mit Perlenfeldern.
   Vertauschen (Kommutativgesetz), Zerlegen (Distributivgesetz), Zusammenfassen (Assoziativgesetz).
   Dieselben Perlen wandern in eine neue Anordnung – die Anzahl bleibt gleich. */

import { perlenBuehne } from './buehne.js';

const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

const MODI = [
  { id: 'tauschen', titel: 'Vertauschen', gesetz: 'Kommutativgesetz' },
  { id: 'zerlegen', titel: 'Zerlegen', gesetz: 'Distributivgesetz' },
  { id: 'zusammen', titel: 'Zusammenfassen', gesetz: 'Assoziativgesetz' },
];

function neueAufgabe(modus, art) {
  if (modus === 'tauschen') {
    if (art === 'plus') { const a = zufall(3, 14); let b; do { b = zufall(3, 14); } while (b === a); return { a, b }; }
    const a = zufall(2, 8); let b; do { b = zufall(3, 12); } while (b === a); return { a, b };
  }
  if (modus === 'zerlegen') return { a: zufall(3, 8), b: zufall(11, 18) };
  if (art === 'plus') return { a: zufall(3, 9), b: zufall(3, 9), c: zufall(3, 9) };
  for (;;) { const a = zufall(2, 5), b = zufall(2, 5), c = zufall(2, 5); if (a * b * c <= 60) return { a, b, c }; }
}

export function starteGesetze(root) {
  let modus = 'tauschen', art = 'mal';
  let auf = neueAufgabe(modus, art);
  let ansicht = 0;          // 0 = erste Anordnung, 1 = umgeordnet
  let schnitt = null;       // Zerlegen: Spaltenzahl links vom Schnitt
  const eing = {};

  root.innerHTML = `
  <section class="gs">
    <div class="gs-reiter" role="tablist">${MODI.map(m => `
      <button type="button" role="tab" class="gs-tab" data-modus="${m.id}"><b>${m.titel}</b><small>${m.gesetz}</small></button>`).join('')}
    </div>
    <div class="sprechblase info" id="gs-blase" role="status" aria-live="polite"></div>
    <div class="tb-flaeche">
      <div class="tb-links">
        <div class="gs-oben">
          <div class="umschalter" role="group" aria-label="Rechenart" id="gs-art">
            <button type="button" data-art="mal">Mal</button><button type="button" data-art="plus">Plus</button>
          </div>
          <button type="button" class="kn-gross kn-leise" data-gs="neu">＋ Neue Aufgabe</button>
        </div>
        <div class="gs-buehne" id="gs-buehne"><div class="gs-rahmen-schicht" id="gs-rahmen"></div></div>
        <div class="gs-steuer" id="gs-steuer"></div>
      </div>
      <aside class="tb-rechts" id="gs-rechts"></aside>
    </div>
  </section>`;
  const $ = s => root.querySelector(s);
  const buehneEl = $('#gs-buehne');
  const buehne = perlenBuehne(buehneEl);

  function sprich(text, art2 = 'info') {
    const b = $('#gs-blase');
    b.className = `sprechblase ${art2}`;
    b.innerHTML = `<span class="blase-symbol" aria-hidden="true">${art2 === 'fertig' ? '★' : art2 === 'tipp' ? '?' : 'i'}</span><span>${text}</span>`;
  }

  /* ---------- Anordnungen ---------- */
  function rahmen(liste) {
    $('#gs-rahmen').innerHTML = liste.map(r =>
      `<div class="gs-rahmen ${r.klasse || ''}" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"><span>${r.text || ''}</span></div>`).join('');
  }

  function lege() {
    const W = buehne.breite();
    const { a, b, c } = auf;
    const pl = [];
    let H = 200;
    const rf = [];

    if (modus === 'tauschen' && art === 'mal') {
      const r = ansicht ? b : a, s = ansicht ? a : b;
      const z = Math.min(40, (W - 20) / s, 300 / r);
      const x0 = (W - s * z) / 2, y0 = 14;
      for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
        const [ri, ci] = ansicht ? [j, i] : [i, j];
        pl.push({ x: x0 + ci * z + z / 2, y: y0 + ri * z + z / 2, klasse: i % 2 ? 'gold' : 'blau', verzoegerung: (i * b + j) * 8 });
      }
      H = r * z + 28;
      buehne.setze(pl, z * 0.8, H); rahmen([]);
      return;
    }

    if ((modus === 'tauschen' || modus === 'zusammen') && art === 'plus') {
      const teile = modus === 'tauschen' ? [a, b] : [a, b, c];
      const farben = ['blau', 'gold', 'rot'];
      const ordnung = modus === 'tauschen' && ansicht ? [1, 0] : teile.map((_, i) => i);
      const n = teile.reduce((x, y) => x + y, 0);
      const z = Math.min(34, (W - 40) / (n + 1.4 * (teile.length - 1)));
      const luecke = z * 1.4;
      // Gruppen: Tauschen -> keine Klammern; Zusammenfassen -> (a+b)+c oder a+(b+c)
      const gruppenEnde = modus === 'zusammen' ? (ansicht ? [0] : [1]) : [];
      let x = (W - (n * z + luecke * (teile.length - 1))) / 2;
      const start = [];
      ordnung.forEach((ti, pos) => {
        start[ti] = x;
        x += teile[ti] * z + (pos < ordnung.length - 1 ? (gruppenEnde.includes(pos) || modus === 'tauschen' ? luecke : z * 0.25) : 0);
      });
      const y = 60;
      teile.forEach((anz, ti) => { for (let k = 0; k < anz; k++) pl.push({ x: start[ti] + k * z + z / 2, y, klasse: farben[ti], verzoegerung: k * 10 }); });
      if (modus === 'zusammen') {
        const g = ansicht ? [[1, 2]] : [[0, 1]];
        for (const [p, q] of g) {
          const x1 = start[p] - 6, x2 = start[q] + teile[q] * z + 6;
          rf.push({ x: x1, y: y - z / 2 - 10, w: x2 - x1, h: z + 20, text: `${teile[p]} + ${teile[q]} = ${teile[p] + teile[q]}` });
        }
      }
      buehne.setze(pl, z * 0.82, 130); rahmen(rf);
      return;
    }

    if (modus === 'zerlegen') {
      const s = schnitt;
      const luecke = s ? 26 : 0;
      const z = Math.min(36, (W - 20 - luecke) / b, 320 / a);
      const x0 = (W - b * z - luecke) / 2, y0 = 34;
      for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
        const rechts = s && j >= s;
        pl.push({ x: x0 + j * z + (rechts ? luecke : 0) + z / 2, y: y0 + i * z + z / 2, klasse: s ? (rechts ? 'gold' : 'blau') : 'blau', verzoegerung: j * 12 });
      }
      if (s) {
        rf.push({ x: x0 - 5, y: y0 - 6, w: s * z + 10, h: a * z + 12, text: `${a} · ${s}`, klasse: 'blau' });
        rf.push({ x: x0 + s * z + luecke - 5, y: y0 - 6, w: (b - s) * z + 10, h: a * z + 12, text: `${a} · ${b - s}`, klasse: 'gold' });
      }
      H = a * z + 60;
      buehne.setze(pl, z * 0.8, H); rahmen(rf);
      // Schnitt-Knöpfe zwischen den Spalten
      $('#gs-steuer').innerHTML = `
        <div class="gs-schnitt">
          <button type="button" class="kn" data-gs="links" aria-label="Schnitt nach links">◀</button>
          <input type="range" id="gs-regler" min="1" max="${b - 1}" value="${s ?? Math.min(10, b - 1)}" aria-label="Wo schneidest du?">
          <button type="button" class="kn" data-gs="rechts" aria-label="Schnitt nach rechts">▶</button>
          <span>${s ? `Schnitt nach ${s} Spalten` : 'Schiebe den Regler, um das Feld zu zerschneiden.'}</span>
        </div>`;
      return;
    }

    // Zusammenfassen mit Mal: (a·b)·c  oder  a·(b·c)
    const gruppen = ansicht ? a : c, r = ansicht ? b : a, s = ansicht ? c : b;
    const zw = 22;
    const z = Math.min(30, (W - 20 - (gruppen - 1) * zw) / (gruppen * s), 220 / r);
    const breiteG = s * z;
    const x0 = (W - (gruppen * breiteG + (gruppen - 1) * zw)) / 2, y0 = 30;
    for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) for (let k = 0; k < c; k++) {
      const [g, ri, ci] = ansicht ? [i, j, k] : [k, i, j];
      pl.push({ x: x0 + g * (breiteG + zw) + ci * z + z / 2, y: y0 + ri * z + z / 2, klasse: ['blau', 'gold', 'rot', 'gruen', 'lila'][k % 5], verzoegerung: (i * b * c + j * c + k) * 6 });
    }
    for (let g = 0; g < gruppen; g++) {
      rf.push({ x: x0 + g * (breiteG + zw) - 5, y: y0 - 6, w: breiteG + 10, h: r * z + 12, text: ansicht ? `${b} · ${c} = ${b * c}` : `${a} · ${b} = ${a * b}` });
    }
    H = r * z + 64;
    buehne.setze(pl, z * 0.8, H); rahmen(rf);
  }

  /* ---------- Rechte Seite: Gleichung und Eingaben ---------- */
  function feld(key, breite = 4) {
    return `<input class="gs-ein" data-key="${key}" inputmode="numeric" maxlength="${breite}" value="${eing[key] ?? ''}" aria-label="Ergebnis">`;
  }

  function rechts() {
    const { a, b, c } = auf;
    let html = '';
    if (modus === 'tauschen') {
      const op = art === 'mal' ? '·' : '+';
      const erg = art === 'mal' ? a * b : a + b;
      html = `
        <h2 class="bereich-titel">Vertauschen</h2>
        <p class="gs-gleichung">${a} ${op} ${b} = ${b} ${op} ${a}</p>
        <button type="button" class="kn-gross kn-haupt" data-gs="umordnen">${art === 'mal' ? '⟳ Feld drehen' : '⇄ Tauschen'}</button>
        <p>${art === 'mal'
          ? (ansicht ? `Jetzt: ${b} Reihen mit je ${a} Perlen.` : `${a} Reihen mit je ${b} Perlen.`)
          : (ansicht ? `Jetzt liegen erst ${b}, dann ${a} Perlen.` : `Erst ${a}, dann ${b} Perlen.`)}</p>
        <p>Wie viele Perlen sind es? ${feld('e')}</p>`;
      html += pruefzeile();
      html += `<p class="leise">Beim ${art === 'mal' ? 'Multiplizieren' : 'Addieren'} darf man die Zahlen vertauschen. Das heißt <b>Kommutativgesetz</b>.</p>`;
      erwartet = { e: erg };
    } else if (modus === 'zerlegen') {
      const s = schnitt;
      html = `
        <h2 class="bereich-titel">Zerlegen</h2>
        <p class="gs-gleichung">${a} · ${b} = ?</p>
        ${s ? `
        <p class="gs-gleichung">${a} · ${b} = ${a} · ${s} + ${a} · ${b - s}</p>
        <p class="gs-zeile"><span class="gs-marke blau"></span>${a} · ${s} = ${feld('l')}</p>
        <p class="gs-zeile"><span class="gs-marke gold"></span>${a} · ${b - s} = ${feld('r')}</p>
        <p class="gs-zeile">zusammen: ${feld('e')}</p>` : '<p>Zerschneide das Feld in zwei Teile, die du leicht rechnen kannst.</p>'}`;
      if (s) html += pruefzeile();
      html += `<p class="leise">Man darf einen Faktor zerlegen und die Teile einzeln malnehmen. Das heißt <b>Distributivgesetz</b>.</p>`;
      erwartet = s ? { l: a * s, r: a * (b - s), e: a * b } : {};
    } else {
      const op = art === 'mal' ? '·' : '+';
      const erg = art === 'mal' ? a * b * c : a + b + c;
      html = `
        <h2 class="bereich-titel">Zusammenfassen</h2>
        <p class="gs-gleichung">(${a} ${op} ${b}) ${op} ${c} = ${a} ${op} (${b} ${op} ${c})</p>
        <button type="button" class="kn-gross kn-haupt" data-gs="umordnen">⇄ Anders zusammenfassen</button>
        <p>${art === 'mal'
          ? (ansicht ? `Jetzt: ${a} Felder mit je ${b} · ${c} = ${b * c} Perlen.` : `${c} Felder mit je ${a} · ${b} = ${a * b} Perlen.`)
          : (ansicht ? `Jetzt werden ${b} und ${c} zuerst zusammengefasst.` : `Zuerst werden ${a} und ${b} zusammengefasst.`)}</p>
        <p>Wie viele Perlen sind es? ${feld('e')}</p>`;
      html += pruefzeile();
      html += `<p class="leise">Beim ${art === 'mal' ? 'Multiplizieren' : 'Addieren'} ist egal, was man zuerst zusammenfasst. Das heißt <b>Assoziativgesetz</b>.</p>`;
      erwartet = { e: erg };
    }
    $('#gs-rechts').innerHTML = html;
  }

  let erwartet = {};
  let bewertung = null;
  function pruefzeile() {
    return `<div class="gs-pruef"><button type="button" class="kn-gross" data-gs="pruefen">✓ Prüfen</button>
      ${bewertung ? `<span class="tb-antwort ${bewertung.ok ? 'gut' : 'schlecht'}">${bewertung.text}</span>` : ''}</div>`;
  }

  function zeichne() {
    root.querySelectorAll('[data-modus]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.modus === modus)));
    $('#gs-art').hidden = modus === 'zerlegen';
    root.querySelectorAll('[data-art]').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.art === art)));
    if (modus !== 'zerlegen') $('#gs-steuer').innerHTML = '';
    rechts();
    lege();
  }

  function startText() {
    const { a, b, c } = auf;
    if (modus === 'tauschen') sprich(art === 'mal'
      ? `Hier liegen ${a} Reihen mit je ${b} Perlen. Drehe das Feld: Was ändert sich – und was nicht?`
      : `Hier liegen ${a} blaue und ${b} goldene Perlen. Tausche die Reihenfolge: Ändert sich die Anzahl?`);
    else if (modus === 'zerlegen') sprich(`${a} · ${b} ist schwer im Kopf. Zerschneide das Feld so, dass du die Teile leicht rechnen kannst – zum Beispiel nach 10 Spalten.`);
    else sprich(art === 'mal'
      ? `Hier liegen ${c} Felder mit je ${a} · ${b} Perlen. Fasse anders zusammen: Bleibt die Anzahl gleich?`
      : `${a} + ${b} + ${c}: Erst ${a} + ${b}, dann + ${c}? Oder erst ${b} + ${c}? Probiere beides.`);
  }

  function neu() {
    auf = neueAufgabe(modus, art); ansicht = 0; schnitt = null; bewertung = null;
    Object.keys(eing).forEach(k => delete eing[k]);
    zeichne(); startText();
  }

  root.addEventListener('click', e => {
    const m = e.target.closest('[data-modus]');
    if (m) { modus = m.dataset.modus; if (modus === 'zerlegen') art = 'mal'; neu(); return; }
    const a = e.target.closest('[data-art]');
    if (a) { art = a.dataset.art; neu(); return; }
    const b = e.target.closest('[data-gs]');
    if (!b) return;
    switch (b.dataset.gs) {
      case 'neu': neu(); break;
      case 'umordnen': {
        ansicht = 1 - ansicht; zeichne();
        const { a: x, b: y, c: w } = auf;
        if (modus === 'tauschen') sprich(art === 'mal'
          ? `Aus ${x} Reihen mit je ${y} wurden ${y} Reihen mit je ${x}. Es sind dieselben Perlen: ${x} · ${y} = ${y} · ${x} = ${x * y}.`
          : `Die Reihenfolge ist anders, die Perlen sind dieselben: ${x} + ${y} = ${y} + ${x} = ${x + y}.`, 'fertig');
        else sprich(art === 'mal'
          ? `Dieselben ${x * y * w} Perlen, nur anders gruppiert: (${x} · ${y}) · ${w} = ${x} · (${y} · ${w}).`
          : `Dieselben Perlen, nur anders zusammengefasst: (${x} + ${y}) + ${w} = ${x} + (${y} + ${w}) = ${x + y + w}.`, 'fertig');
        break;
      }
      case 'links': case 'rechts': {
        const r = auf.b - 1;
        schnitt = Math.max(1, Math.min(r, (schnitt ?? Math.min(10, r)) + (b.dataset.gs === 'links' ? -1 : 1)));
        bewertung = null; ['l', 'r', 'e'].forEach(k => delete eing[k]);
        zeichne(); break;
      }
      case 'pruefen': {
        const falsch = Object.entries(erwartet).filter(([k, v]) => Number(eing[k]) !== v);
        bewertung = falsch.length
          ? { ok: false, text: `${falsch.length === 1 ? 'Ein Ergebnis stimmt' : `${falsch.length} Ergebnisse stimmen`} noch nicht. Zähle die Perlen nach.` }
          : { ok: true, text: 'Richtig!' };
        if (!falsch.length && modus === 'zerlegen') sprich(`Genau: ${auf.a} · ${auf.b} = ${auf.a} · ${schnitt} + ${auf.a} · ${auf.b - schnitt} = ${auf.a * schnitt} + ${auf.a * (auf.b - schnitt)} = ${auf.a * auf.b}.`, 'fertig');
        rechts();
        break;
      }
      default: break;
    }
  });

  root.addEventListener('input', e => {
    if (e.target.id === 'gs-regler') {
      schnitt = Number(e.target.value); bewertung = null; ['l', 'r', 'e'].forEach(k => delete eing[k]);
      rechts(); lege();
      root.querySelector('#gs-regler')?.focus();
      return;
    }
    if (e.target.classList.contains('gs-ein')) {
      e.target.value = e.target.value.replace(/\D/g, '');
      eing[e.target.dataset.key] = e.target.value;
    }
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (root.isConnected) lege(); }, 120); });

  zeichne();
  startText();
}
