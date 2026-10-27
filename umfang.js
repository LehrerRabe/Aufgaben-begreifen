/* Mathematik: Umfang mit der Schnur.
   Eine Schnur wird um das Rechteck gelegt und dann gerade gezogen – ihre Länge ist der Umfang.
   „Gleiche Fläche, anderer Umfang“: Rechtecke mit gleichem Flächeninhalt vergleichen. */

import { geruest, zufall, wahl, warte, antwortHtml, zahlenMerken, zahlFeld, bewegung } from './geruest.js';

const SEITEN_FARBEN = ['#e0262b', '#2f6fe4', '#e0262b', '#2f6fe4'];

export function starteUmfang(root) {
  let modus = 'schnur';
  let a, b, phase, eing = {}, bewertung = null, beschaeftigt = false;
  let flaeche, gewaehlt, gesehen;

  const g = geruest(root, {
    etikett: 'Umfang', titel: '',
    reiter: [{ id: 'schnur', titel: 'Schnur legen' }, { id: 'gleich', titel: 'Gleiche Fläche', unter: 'anderer Umfang' }],
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-um="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-um="neu">＋ Neues Rechteck</button>`,
  });
  zahlenMerken(root, eing);

  function neu() {
    bewertung = null; eing['um-u'] = ''; phase = 0;
    if (modus === 'schnur') { a = zufall(3, 9); b = zufall(2, 6); }
    else { flaeche = wahl([12, 16, 18, 24, 36]); gewaehlt = 1; gesehen = new Map(); a = flaeche; b = 1; gesehen.set(1, 2 * (flaeche + 1)); }
  }

  const S = 34;

  function schnurSvg() {
    const u = 2 * (a + b);
    const W = Math.max(a * S, u * S) + 60;
    const X = 30, Y = 20;
    // Rechteck und Schnur darum (gestrichelt animiert)
    const rand = `M${X} ${Y + b * S} h${a * S} v${-b * S} h${-a * S} Z`;
    let gitter = '';
    for (let i = 1; i < a; i++) gitter += `<line x1="${X + i * S}" y1="${Y}" x2="${X + i * S}" y2="${Y + b * S}" class="zl-gitter"/>`;
    for (let j = 1; j < b; j++) gitter += `<line x1="${X}" y1="${Y + j * S}" x2="${X + a * S}" y2="${Y + j * S}" class="zl-gitter"/>`;
    const rechteck = `<rect x="${X}" y="${Y}" width="${a * S}" height="${b * S}" class="um-flaeche"/>${gitter}`;
    // gerade gezogene Schnur: Teilstücke a, b, a, b in den Seitenfarben, gleicher Maßstab
    const s2 = S, y2 = Y + b * S + 60;
    let x = X, gerade = '', marken = '';
    [a, b, a, b].forEach((l, i) => {
      gerade += `<line x1="${x}" y1="${y2}" x2="${x + l * s2}" y2="${y2}" stroke="${SEITEN_FARBEN[i]}" class="um-gerade" style="animation-delay:${i * 0.45}s"/>`;
      marken += `<text x="${x + l * s2 / 2}" y="${y2 - 10}" class="um-marke" style="animation-delay:${i * 0.45}s">${l}</text>`;
      x += l * s2;
    });
    let lineal = '';
    for (let i = 0; i <= u; i++) lineal += `<line x1="${X + i * s2}" y1="${y2 + 8}" x2="${X + i * s2}" y2="${y2 + (i % 5 ? 14 : 20)}" class="um-strich"/>${i % 5 === 0 ? `<text x="${X + i * s2}" y="${y2 + 34}" class="um-zahl">${i}</text>` : ''}`;
    const seiten = [[X, Y + b * S, X + a * S, Y + b * S], [X + a * S, Y + b * S, X + a * S, Y], [X + a * S, Y, X, Y], [X, Y, X, Y + b * S]]
      .map(([x1, y1, x22, y22], i) => `<line x1="${x1}" y1="${y1}" x2="${x22}" y2="${y22}" stroke="${SEITEN_FARBEN[i]}" class="um-seite"/>`).join('');
    return `<svg class="um-svg" viewBox="0 0 ${W} ${Y + b * S + 110}">
      ${rechteck}
      ${phase >= 1 ? `${seiten}<path d="${rand}" class="um-schnur${phase === 1 ? ' laeuft' : ''}" pathLength="100"/>` : ''}
      <text x="${X + a * S / 2}" y="${Y - 4}" class="zl-mass">${a} cm</text>
      <text x="${X + a * S + 8}" y="${Y + b * S / 2 + 5}" class="zl-mass links">${b} cm</text>
      ${phase >= 2 ? `<g class="um-ziehen">${gerade}${marken}${lineal}</g>` : ''}
    </svg>`;
  }

  function gleichSvg() {
    const S2 = Math.min(26, 520 / flaeche);
    const W = a * S2 + 40, H = b * S2 + 40;
    let gitter = '';
    for (let i = 1; i < a; i++) gitter += `<line x1="${20 + i * S2}" y1="20" x2="${20 + i * S2}" y2="${20 + b * S2}" class="zl-gitter"/>`;
    for (let j = 1; j < b; j++) gitter += `<line x1="20" y1="${20 + j * S2}" x2="${20 + a * S2}" y2="${20 + j * S2}" class="zl-gitter"/>`;
    return `<svg class="um-svg gleich" viewBox="0 0 ${Math.max(W, 200)} ${Math.max(H, 80)}">
      <rect x="20" y="20" width="${a * S2}" height="${b * S2}" class="um-flaeche"/>${gitter}
      <rect x="20" y="20" width="${a * S2}" height="${b * S2}" class="um-rand"/></svg>`;
  }

  const teiler = () => { const t = []; for (let i = 1; i * i <= flaeche; i++) if (flaeche % i === 0) t.push(i); return t; };

  function links() {
    if (modus === 'schnur') {
      return `${schnurSvg()}
        <div class="gs-pruef">
          <button type="button" class="kn-gross" data-um="legen" ${phase >= 1 ? 'disabled' : ''}>① Schnur herumlegen</button>
          <button type="button" class="kn-gross" data-um="ziehen" ${phase !== 1 || beschaeftigt ? 'disabled' : ''}>② Schnur gerade ziehen</button>
        </div>`;
    }
    return `${gleichSvg()}
      <p>Wähle die Breite des Rechtecks (alle haben ${flaeche} Kästchen):</p>
      <div class="um-breiten">${teiler().map(t => `<button type="button" class="kn-gross${t === gewaehlt ? ' gewaehlt' : ''}" data-breite="${t}">${flaeche / t} × ${t}</button>`).join('')}</div>`;
  }

  function rechts() {
    if (modus === 'schnur') {
      return `<h2 class="bereich-titel">Wie lang ist der Umfang?</h2>
        <p>Das Rechteck ist <b>${a} cm</b> lang und <b>${b} cm</b> breit.</p>
        <p class="ut-frage">u = ${zahlFeld('um-u', eing['um-u'], 3, 'Umfang')} cm</p>
        <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-um="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
        ${bewertung?.ok ? `<p class="fl-formel">u = ${a} + ${b} + ${a} + ${b} = ${2 * (a + b)} cm<br>oder u = 2 · ${a} + 2 · ${b}</p>` : ''}`;
    }
    const zeilen = teiler().map(t => {
      const l = flaeche / t, u = gesehen.get(t);
      return `<tr class="${t === gewaehlt ? 'jetzt' : ''}"><td>${l} cm × ${t} cm</td><td>${flaeche} cm²</td><td>${u !== undefined ? `${u} cm` : '?'}</td></tr>`;
    }).join('');
    const alle = gesehen.size === teiler().length;
    return `<h2 class="bereich-titel">Gleiche Fläche – gleicher Umfang?</h2>
      <table class="um-tabelle"><thead><tr><th>Rechteck</th><th>Fläche</th><th>Umfang</th></tr></thead><tbody>${zeilen}</tbody></table>
      ${alle ? `<p class="tb-antwort gut">Alle Rechtecke haben ${flaeche} cm² – aber der Umfang ist verschieden! Am kleinsten ist er, wenn das Rechteck fast ein Quadrat ist.</p>` : '<p class="leise">Probiere alle Rechtecke aus.</p>'}`;
  }

  function zeichne() {
    g.reiter(modus);
    g.titel(modus === 'schnur' ? 'Umfang mit der Schnur' : 'Gleiche Fläche, anderer Umfang');
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  async function legen() {
    phase = 1; beschaeftigt = true; g.links.innerHTML = links();
    g.sprich('Die Schnur wird einmal ganz um das Rechteck gelegt.');
    await warte(bewegung() ? 2200 : 0);
    beschaeftigt = false; g.links.innerHTML = links();
  }
  async function ziehen() {
    phase = 2; g.links.innerHTML = links();
    g.sprich(`Jetzt ist die Schnur gerade. Sie besteht aus den vier Seiten: ${a} + ${b} + ${a} + ${b}. Lies die Länge am Lineal ab.`);
  }

  function pruefen() {
    const u = 2 * (a + b), ein = Number(eing['um-u']);
    const ok = ein === u && eing['um-u'] !== '';
    bewertung = ok ? { ok, text: `Richtig: ${u} cm` } : { ok, text: ein === a * b ? 'Das ist der Flächeninhalt. Der Umfang ist die Länge der Schnur ringsherum.' : ein === a + b ? 'Das sind nur zwei Seiten. Ein Rechteck hat vier.' : 'Noch nicht. Lege die Schnur und ziehe sie gerade.' };
    g.rechts.innerHTML = rechts();
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { modus = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const br = e.target.closest('[data-breite]');
    if (br) {
      gewaehlt = Number(br.dataset.breite); b = gewaehlt; a = flaeche / b; gesehen.set(b, 2 * (a + b));
      zeichne(); g.sprich(`${a} cm × ${b} cm: Fläche ${flaeche} cm², Umfang ${a} + ${b} + ${a} + ${b} = ${2 * (a + b)} cm.`); return;
    }
    const b2 = e.target.closest('[data-um]');
    if (!b2) return;
    const was = b2.dataset.um;
    if (was === 'neu') { neu(); zeichne(); startText(); }
    if (was === 'legen') legen();
    if (was === 'ziehen') ziehen();
    if (was === 'pruefen') pruefen();
    if (was === 'tipp') g.sprich(modus === 'schnur' ? 'Der Umfang ist der Weg einmal ganz um das Rechteck: unten, rechts, oben, links.' : 'Tippe nacheinander alle Rechtecke an und vergleiche die Umfänge in der Tabelle.', 'tipp');
  });

  function startText() {
    g.sprich(modus === 'schnur'
      ? 'Wie lang ist eine Schnur, die genau einmal um das Rechteck reicht? Lege sie herum und ziehe sie gerade.'
      : 'Alle diese Rechtecke bestehen aus gleich vielen Kästchen. Haben sie auch den gleichen Umfang?');
  }

  neu(); zeichne(); startText();
}
