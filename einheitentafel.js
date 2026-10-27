/* Mathematik: Größen umrechnen mit der Stellenwerttafel (Einheitentafel).
   Die Ziffern einer Größe stehen in der Tafel. Tippt man auf eine Einheit, wird bis zu ihr gelesen:
   ein Lesestrich erscheint, leere Felder davor füllen sich mit Nullen.
   Zwei Arten: „Ziffern stehen schon drin“ oder „Selbst eintragen“ – dann tragen die Kinder die Größe zuerst
   selbst in die Tafel ein (letzte Ziffer unter die Einer der Einheit) und rechnen danach um. */

import { geruest, zufall, wahl, warte, antwortHtml, zahlenMerken, zahlFeld } from './geruest.js';
import { zahlText } from './rechenrahmen.js';

const TAFELN = {
  laenge: {
    titel: 'Länge', farbe: '#2f6fe4',
    spalten: [['km', 'Z'], ['km', 'E'], ['m', 'H'], ['m', 'Z'], ['m', 'E'], ['dm', 'E'], ['cm', 'E'], ['mm', 'E']],
    paare: [['km', 'm'], ['m', 'dm'], ['m', 'cm'], ['dm', 'cm'], ['cm', 'mm'], ['m', 'mm'], ['dm', 'mm']],
  },
  masse: {
    titel: 'Masse', farbe: '#16a974',
    spalten: [['t', 'Z'], ['t', 'E'], ['kg', 'H'], ['kg', 'Z'], ['kg', 'E'], ['g', 'H'], ['g', 'Z'], ['g', 'E']],
    paare: [['t', 'kg'], ['kg', 'g']],
  },
  geld: {
    titel: 'Geld', farbe: '#d6336c',
    spalten: [['€', 'H'], ['€', 'Z'], ['€', 'E'], ['ct', 'Z'], ['ct', 'E']],
    paare: [['€', 'ct']],
  },
};

export function starteEinheitentafel(root) {
  let art = 'laenge';
  let auf, gelesen, eing = {}, bewertung = null, beschaeftigt = false;
  let selbst = false, eingetragen = true, ziffern = {};   // selbst eintragen: Ziffern je Spalte

  const g = geruest(root, {
    etikett: 'Einheitentafel', titel: '',
    reiter: Object.entries(TAFELN).map(([id, t]) => ({ id, titel: t.titel })),
    knoepfe: `<button type="button" class="kn-gross kn-tipp" data-et="tipp"><span aria-hidden="true">?</span> Tipp</button>
      <button type="button" class="kn-gross kn-leise" data-et="neu">＋ Neue Aufgabe</button>`,
  });
  zahlenMerken(root, eing);

  const T = () => TAFELN[art];
  const eIdx = u => T().spalten.findIndex(([e, s]) => e === u && s === 'E');
  const erstIdx = u => T().spalten.findIndex(([e]) => e === u);

  function neu() {
    bewertung = null; gelesen = null; ['et-a', 'et-b'].forEach(k => (eing[k] = ''));
    eingetragen = !selbst; ziffern = {};
    const [B, S] = wahl(T().paare);
    const d = eIdx(S) - eIdx(B), f = 10 ** d;
    const typ = wahl(['runter', 'gemischt', 'rauf']);
    const maxB = 10 ** (eIdx(B) + 1 - erstIdx(B)) - 1;   // so viele Stellen hat die große Einheit
    let a = zufall(1, Math.min(maxB, d >= 3 ? 25 : 9)), b = typ === 'runter' ? 0 : zufall(1, f - 1);
    if (typ !== 'runter' && f >= 100 && Math.random() < 0.5) b = zufall(1, 9) * (f / 10);   // z. B. 3 kg 500 g
    if (typ !== 'runter' && f >= 1000 && Math.random() < 0.3) b = zufall(1, 99);           // mit Null dazwischen
    const v = a * f + b;   // Wert in der kleinen Einheit
    auf = { typ, B, S, a, b, f, v };
  }

  /** Ziffern rechtsbündig bis zur E-Spalte der Einheit eintragen. */
  function belegung() {
    const { typ, B, S, a, v } = auf;
    const m = new Map();
    const zahl = typ === 'runter' ? a : v;
    const ende = typ === 'runter' ? eIdx(B) : eIdx(S);
    String(zahl).split('').reverse().forEach((z, k) => m.set(ende - k, z));
    return m;
  }

  function gegebenText() {
    const { typ, B, S, a, b, v } = auf;
    return typ === 'runter' ? `${zahlText(a)} ${B}` : typ === 'gemischt' ? `${zahlText(a)} ${B} ${zahlText(b)} ${S}` : `${zahlText(v)} ${S}`;
  }

  /** Eintrag prüfen: Ziffern wie in belegung(); leere Felder zwischen den Ziffern zählen als 0,
      die Einer-Spalte(n) der gegebenen Einheit(en) müssen aber ausgefüllt sein. */
  function eintragPruefen() {
    const soll = belegung(), sp = T().spalten;
    const von = Math.min(...soll.keys()), bis = Math.max(...soll.keys());
    const pflicht = auf.typ === 'runter' ? [eIdx(auf.B)] : auf.typ === 'gemischt' ? [eIdx(auf.B), eIdx(auf.S)] : [eIdx(auf.S)];
    const fehlt = pflicht.find(i => !ziffern[i]);
    if (fehlt !== undefined) return `Unter die Einer von ${sp[fehlt][0]} gehört die letzte Ziffer ${fehlt === eIdx(auf.B) && auf.typ !== 'rauf' ? `von ${zahlText(auf.a)} ${auf.B}` : `der ${auf.S}`}.`;
    for (let i = 0; i < sp.length; i++) {
      const ist = ziffern[i] ?? '', s_ = soll.get(i);
      if (i < von || i > bis) { if (ist && ist !== '0') return 'Da steht eine Ziffer an der falschen Stelle. Die letzte Ziffer gehört genau unter die Einer der Einheit.'; continue; }
      if ((ist || '0') !== s_) return 'Noch nicht richtig eingetragen. Fang mit der letzten Ziffer an: Sie steht unter den Einern der Einheit.';
    }
    return null;
  }

  function aufgabeText() {
    const { typ, B, S, a, b, v } = auf;
    if (typ === 'runter') return `${zahlText(a)} ${B} = ${zahlFeld('et-a', eing['et-a'], 7, `in ${S}`)} ${S}`;
    if (typ === 'gemischt') return `${zahlText(a)} ${B} ${zahlText(b)} ${S} = ${zahlFeld('et-a', eing['et-a'], 7, `in ${S}`)} ${S}`;
    return `${zahlText(v)} ${S} = ${zahlFeld('et-a', eing['et-a'], 3, `in ${B}`)} ${B} ${zahlFeld('et-b', eing['et-b'], 4, `Rest in ${S}`)} ${S}`;
  }

  function tafelHtml(nullenNeu = false) {
    const sp = T().spalten, bel = belegung();
    const erste = Math.min(...bel.keys()), letzte = Math.max(...bel.keys());
    const gruppen = [];
    sp.forEach(([e], i) => { if (!gruppen.length || gruppen[gruppen.length - 1].e !== e) gruppen.push({ e, von: i, anz: 0 }); gruppen[gruppen.length - 1].anz++; });
    const strich = gelesen ? eIdx(gelesen) : null;
    const grenze = new Set(gruppen.slice(1).map(gr => gr.von));
    if (!eingetragen) {
      const zellenE = sp.map(([e, s_], i) => `<td class="et-z et-eintrag${grenze.has(i) ? ' grenze' : ''}"><input class="et-ein" data-sp="${i}" inputmode="numeric" maxlength="1" value="${ziffern[i] ?? ''}" aria-label="${e}, ${s_}"></td>`).join('');
      return `<div class="et-huelle"><table class="et-tafel" style="--gf:${T().farbe}">
        <thead>
          <tr>${gruppen.map((gr, k) => `<th colspan="${gr.anz}" class="${k ? 'grenze' : ''}"><span class="et-einheit fest">${gr.e}</span></th>`).join('')}</tr>
          <tr class="et-unter">${sp.map(([, s_], i) => `<th class="${grenze.has(i) ? 'grenze' : ''}">${s_}</th>`).join('')}</tr>
        </thead>
        <tbody><tr>${zellenE}</tr></tbody>
      </table></div>`;
    }
    const zellen = sp.map(([e, s], i) => {
      let inhalt = bel.get(i) ?? '';
      let kl = '';
      if (gelesen && inhalt === '' && i > letzte && i <= strich) { inhalt = '0'; kl = ` null${nullenNeu ? ' neu' : ''}`; }
      const gelesenBereich = gelesen && i >= erste && i <= strich;
      return `<td class="et-z${kl}${grenze.has(i) ? ' grenze' : ''}${gelesenBereich ? ' lesen' : ''}${strich === i ? ' strich' : ''}${auf.typ === 'rauf' && gelesen && i > strich && i <= letzte ? ' rest' : ''}" style="--d:${(i - letzte) * 0.15}s">${inhalt}</td>`;
    }).join('');
    return `<div class="et-huelle"><table class="et-tafel" style="--gf:${T().farbe}">
      <thead>
        <tr>${gruppen.map((gr, k) => `<th colspan="${gr.anz}" class="${k ? 'grenze' : ''}"><button type="button" class="et-einheit${gelesen === gr.e ? ' gewaehlt' : ''}" data-lesen="${gr.e}">${gr.e}</button></th>`).join('')}</tr>
        <tr class="et-unter">${sp.map(([, s], i) => `<th class="${grenze.has(i) ? 'grenze' : ''}">${s}</th>`).join('')}</tr>
      </thead>
      <tbody><tr>${zellen}</tr></tbody>
    </table></div>`;
  }

  function wahlHtml() {
    return `<div class="an-darstellung" role="group" aria-label="Art der Aufgabe">
      <button type="button" class="an-dar${!selbst ? ' aktiv' : ''}" data-modus="fertig" aria-pressed="${!selbst}">Ziffern stehen schon drin</button>
      <button type="button" class="an-dar${selbst ? ' aktiv' : ''}" data-modus="selbst" aria-pressed="${selbst}">✎ Selbst eintragen</button></div>`;
  }

  function links() {
    if (!eingetragen) return `${wahlHtml()}${tafelHtml()}
      <ol class="et-schritte">
        <li>Trage <b>${gegebenText()}</b> in die Tafel ein: eine Ziffer pro Feld.</li>
        <li>Die letzte Ziffer gehört genau unter die Einer (E) der Einheit.${auf.typ === 'gemischt' ? ` Das gilt für die ${auf.B} und für die ${auf.S}.` : ''}</li>
        <li>Danach rechnest du um.</li>
      </ol>`;
    return `${wahlHtml()}${tafelHtml()}
      <ol class="et-schritte">
        <li>${selbst ? 'Deine Ziffern stehen jetzt in der Tafel' : 'Die Ziffern der Größe stehen schon in der Tafel'} – die letzte Ziffer unter ihrer Einheit.</li>
        <li>Tippe oben auf die Einheit, in der du die Größe lesen willst.</li>
        <li>Lies bis zum Strich. Leere Felder davor werden zu Nullen.</li>
      </ol>`;
  }

  function rechts() {
    if (!eingetragen) return `<h2 class="bereich-titel">Trage ein</h2>
      <p class="ut-frage">${gegebenText()}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-et="eintragen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      <p class="leise">Danach rechnest du um in: ${auf.typ === 'rauf' ? `${auf.B} und ${auf.S}` : auf.S}.</p>`;
    return `<h2 class="bereich-titel">Rechne um</h2>
      <p class="ut-frage">${aufgabeText()}</p>
      <div class="gs-pruef"><button type="button" class="kn-gross kn-haupt" data-et="pruefen">✓ Prüfen</button></div>${antwortHtml(bewertung)}
      <p class="leise">Benachbarte Spalten unterscheiden sich immer um den Faktor 10.</p>`;
  }

  function zeichne() {
    g.reiter(art);
    g.titel(`${T().titel}: umrechnen mit der Tafel`);
    g.links.innerHTML = links();
    g.rechts.innerHTML = rechts();
  }

  async function lesen(u) {
    beschaeftigt = true;
    gelesen = u;
    const { typ, B, S } = auf;
    const bel = belegung(), letzte = Math.max(...bel.keys());
    g.links.innerHTML = links().replace(tafelHtml(), tafelHtml(true));
    const st = eIdx(u);
    if (st < letzte && typ !== 'rauf') g.sprich(`Hinter dem Strich stehen noch Ziffern – in ${u} geht es nicht ohne Komma. Lies in einer kleineren Einheit.`, 'tipp');
    else if (typ === 'rauf') g.sprich(u === B ? `Links vom Strich stehen die ${B}, rechts davon die ${S}.` : `Gefragt ist, wie viele ganze ${B} es sind. Tippe auf ${B}.`, u === B ? 'info' : 'tipp');
    else g.sprich(u === S ? `Bis zum Strich gelesen: Das sind die ${S}.` : `Gefragt ist in ${S}. Tippe auf ${S}.`, u === S ? 'info' : 'tipp');
    await warte(600);
    beschaeftigt = false;
  }

  function pruefen() {
    const { typ, a, b, f, v, B, S } = auf;
    const x = Number((eing['et-a'] || '').replace(/\D/g, '')), y = Number((eing['et-b'] || '').replace(/\D/g, ''));
    let ok;
    if (typ === 'runter') ok = x === a * f;
    if (typ === 'gemischt') ok = x === v;
    if (typ === 'rauf') ok = x === Math.floor(v / f) && y === v % f && eing['et-b'] !== '';
    ok = ok && eing['et-a'] !== '';
    const loes = typ === 'rauf' ? `${zahlText(v)} ${S} = ${Math.floor(v / f)} ${B} ${zahlText(v % f)} ${S}` : `= ${zahlText(typ === 'runter' ? a * f : v)} ${S}`;
    bewertung = ok ? { ok, text: `Richtig! ${loes}` } : { ok, text: typ !== 'rauf' && x && (x === a * f / 10 || x === v / 10) ? 'Da fehlt eine Null. Lies bis zum Strich unter der Einheit.' : 'Noch nicht. Lies in der Tafel bis zum Strich.' };
    if (ok) g.sprich(`1 ${B} = ${zahlText(f)} ${S}`, 'fertig');
    g.rechts.innerHTML = rechts();
    void b;
  }

  root.addEventListener('click', e => {
    if (beschaeftigt) return;
    const rt = e.target.closest('[data-reiter]');
    if (rt) { art = rt.dataset.reiter; neu(); zeichne(); startText(); return; }
    const md = e.target.closest('[data-modus]');
    if (md) { selbst = md.dataset.modus === 'selbst'; neu(); zeichne(); startText(); return; }
    const l = e.target.closest('[data-lesen]');
    if (l) { lesen(l.dataset.lesen); return; }
    const b = e.target.closest('[data-et]');
    if (!b) return;
    if (b.dataset.et === 'neu') { neu(); zeichne(); startText(); }
    if (b.dataset.et === 'eintragen') {
      const fehler = eintragPruefen();
      if (fehler) { bewertung = { ok: false, text: fehler }; g.rechts.innerHTML = rechts(); return; }
      eingetragen = true; bewertung = null; zeichne();
      g.sprich(`Richtig eingetragen! Jetzt tippe oben auf die Einheit, in der du lesen willst.`, 'fertig');
    }
    if (b.dataset.et === 'pruefen') pruefen();
    if (b.dataset.et === 'tipp' && !eingetragen) { g.sprich(`Schreibe ${gegebenText()} so, dass die letzte Ziffer${auf.typ === 'gemischt' ? 'n' : ''} unter dem E der Einheit stehen. Fang hinten an.`, 'tipp'); return; }
    if (b.dataset.et === 'tipp') g.sprich(auf.typ === 'rauf' ? `Tippe auf „${auf.B}“: Alles links vom Strich sind ganze ${auf.B}, der Rest sind ${auf.S}.` : `Tippe auf „${auf.S}“ und lies die Zahl bis zum Strich – mit den Nullen.`, 'tipp');
  });

  function startText() { g.sprich(selbst ? 'Trage die Größe zuerst selbst in die Tafel ein. Dann rechne um.' : 'Rechne mit der Tafel um: Einheit antippen, bis zum Strich lesen.'); }

  /* Ziffern im Eintrag-Modus: nur eine Ziffer pro Feld, danach weiter zum nächsten Feld */
  root.addEventListener('input', e => {
    if (!e.target.matches('.et-ein')) return;
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    e.target.value = v; ziffern[e.target.dataset.sp] = v;
    if (v) root.querySelector(`.et-ein[data-sp="${+e.target.dataset.sp + 1}"]`)?.focus();
  });
  root.addEventListener('keydown', e => {
    if (!e.target.matches('.et-ein')) return;
    if (e.key === 'Backspace' && !e.target.value) root.querySelector(`.et-ein[data-sp="${+e.target.dataset.sp - 1}"]`)?.focus();
    if (e.key === 'ArrowLeft') root.querySelector(`.et-ein[data-sp="${+e.target.dataset.sp - 1}"]`)?.focus();
    if (e.key === 'ArrowRight') root.querySelector(`.et-ein[data-sp="${+e.target.dataset.sp + 1}"]`)?.focus();
  });

  neu(); zeichne(); startText();
}
