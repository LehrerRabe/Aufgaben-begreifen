/* Mathematik: Quadrat- und Kubikketten.
   Die Quadratkette von n besteht aus n Stäbchen mit je n Perlen; gefaltet wird sie zum Quadrat (n²).
   Die Kubikkette besteht aus n Quadraten; gestapelt werden sie zum Würfel (n³). */

const HOCH = { 2: '²', 3: '³' };

export function startePotenzen(root) {
  let n = 4;
  let art = 2;          // 2 = Quadrat, 3 = Würfel
  let stufe = 0;        // 0 = Kette, 1 = gefaltet (Quadrat bzw. Quadrate), 2 = gestapelt (nur Würfel)
  let aufgabe = null;   // Übung: { n, art }
  let antwort = '';
  let bewertung = null;

  root.innerHTML = `
  <section class="pk">
    <div class="pk-leiste">
      <div class="umschalter" role="group" aria-label="Kette">
        <button type="button" data-art="2">Quadratkette</button><button type="button" data-art="3">Kubikkette</button>
      </div>
      <div class="pk-zahlen" role="group" aria-label="Zahl wählen" id="pk-zahlen"></div>
    </div>
    <div class="sprechblase info" id="pk-blase" role="status" aria-live="polite"></div>
    <div class="tb-flaeche">
      <div class="tb-links">
        <div class="pk-buehne" id="pk-buehne"></div>
        <div class="pk-steuer" id="pk-steuer"></div>
      </div>
      <aside class="tb-rechts" id="pk-rechts"></aside>
    </div>
  </section>`;
  const $ = s => root.querySelector(s);
  const buehne = $('#pk-buehne');

  function sprich(text, a = 'info') {
    const b = $('#pk-blase');
    b.className = `sprechblase ${a}`;
    b.innerHTML = `<span class="blase-symbol" aria-hidden="true">${a === 'fertig' ? '★' : a === 'tipp' ? '?' : 'i'}</span><span>${text}</span>`;
  }

  /* Stäbchen anlegen: n (Quadrat) bzw. n² (Würfel) Stäbchen mit je n Perlen */
  function staebeAnlegen() {
    const anzahl = art === 2 ? n : n * n;
    buehne.innerHTML = Array.from({ length: anzahl }, (_, i) => `<i class="pk-stab pf-${n === 10 ? 'g' : n}" data-i="${i}"></i>`).join('')
      + '<div class="pk-marken" id="pk-marken"></div>';
  }

  function lege() {
    const W = buehne.clientWidth || 640;
    const stabe = buehne.querySelectorAll('.pk-stab');
    const anzahl = stabe.length;
    const marken = [];
    let H;
    if (stufe === 0) {
      // Kette: Stäbchen hintereinander, bei Bedarf in Schlangenlinie
      const b = Math.max(4, Math.min(art === 2 ? 28 : 18, (W - 20 - 4 * Math.min(anzahl, 12)) / Math.min(anzahl * n, art === 3 ? 120 : 60)));
      const proZeile = Math.max(1, Math.floor((W - 20) / (n * b + 4)));
      const zeilen = Math.ceil(anzahl / proZeile);
      stabe.forEach((s, i) => {
        const z = Math.floor(i / proZeile), pos = i % proZeile;
        const sp = z % 2 ? proZeile - 1 - pos : pos;
        const x = 10 + sp * (n * b + 4), y = 20 + z * (b + 34);
        s.style.cssText = `--b:${b}px;--n:${n};left:${x}px;top:${y}px;transform:none;transition-delay:${i * 15}ms`;
        if (art === 2 || (i + 1) % n === 0) marken.push({ x: x + n * b - 6, y: y + b + 4, t: art === 2 ? (i + 1) * n : ((i + 1) / n) * n * n });
      });
      H = zeilen * (b + 34) + 30;
    } else {
      // Quadrate: je n Stäbchen untereinander
      const quadrate = art === 2 ? 1 : n;
      const gestapelt = stufe === 2;
      const versatz = gestapelt ? Math.max(3, Math.min(14, 120 / n)) : 0;
      const b = gestapelt
        ? Math.max(5, Math.min(24, (Math.min(W, 520) - 40 - versatz * (quadrate - 1)) / n))
        : Math.max(4, Math.min(24, (W - 20 - (quadrate - 1) * 14) / (quadrate * n), 320 / n));
      const qb = n * b;
      const gesamtB = gestapelt ? qb + versatz * (quadrate - 1) : quadrate * qb + (quadrate - 1) * 14;
      const x0 = (W - gesamtB) / 2;
      const y0 = 20 + (gestapelt ? versatz * (quadrate - 1) : 0);
      stabe.forEach((s, i) => {
        const q = Math.floor(i / n), r = i % n;
        const x = gestapelt ? x0 + q * versatz : x0 + q * (qb + 14);
        const y = gestapelt ? y0 - q * versatz + r * b : y0 + r * b;
        s.style.cssText = `--b:${b}px;--n:${n};left:${x}px;top:${y}px;z-index:${q};transition-delay:${gestapelt ? q * 90 : i * 20}ms`;
        if (!gestapelt && art === 3 && r === n - 1) marken.push({ x: x + qb - 10, y: y + b + 6, t: (q + 1) * n * n });
      });
      H = y0 + qb + 40;
    }
    buehne.style.height = `${H}px`;
    $('#pk-marken').innerHTML = marken.map(m => `<span class="pk-marke" style="left:${m.x}px;top:${m.y}px">${m.t}</span>`).join('');
  }

  function steuer() {
    const knoepfe = [];
    if (stufe > 0) knoepfe.push('<button type="button" class="kn-gross kn-leise" data-pk="kette">↩ Wieder als Kette</button>');
    if (stufe === 0) knoepfe.push(`<button type="button" class="kn-gross kn-haupt" data-pk="falten">${art === 2 ? '▦ Zum Quadrat falten' : '▦ In Quadrate falten'}</button>`);
    if (art === 3 && stufe === 1) knoepfe.push('<button type="button" class="kn-gross kn-haupt" data-pk="stapeln">▣ Zum Würfel stapeln</button>');
    $('#pk-steuer').innerHTML = knoepfe.join('');
  }

  function rechts() {
    const wert = n ** art;
    const faktoren = Array(art).fill(n).join(' · ');
    let html = `
      <h2 class="bereich-titel">${art === 2 ? 'Quadratzahl' : 'Kubikzahl'}</h2>
      <p class="pk-formel">${n}${HOCH[art]} = ${faktoren} = <b>${wert}</b></p>
      <p>${art === 2
        ? `${n} Stäbchen mit je ${n} Perlen. Gefaltet ergeben sie ein Quadrat mit ${n} Reihen und ${n} Spalten.`
        : `${n} Quadrate mit je ${n} · ${n} = ${n * n} Perlen. Gestapelt ergeben sie einen Würfel.`}</p>
      <p class="leise">Gesprochen: „${n} hoch ${art}“${art === 2 ? ` oder „${n} Quadrat“` : ''}. ${n} ist die <b>Basis</b>, ${art} ist der <b>Exponent</b>: Er sagt, wie oft ${n} mit sich selbst malgenommen wird.</p>
      <h2 class="bereich-titel">Übung</h2>`;
    if (!aufgabe) {
      html += '<button type="button" class="kn-gross" data-pk="uebung">Aufgabe bekommen</button>';
    } else {
      html += `
        <p class="pk-formel">${aufgabe.n}${HOCH[aufgabe.art]} = <input class="gs-ein" id="pk-antwort" inputmode="numeric" maxlength="4" value="${antwort}" aria-label="Ergebnis"></p>
        <div class="gs-pruef">
          <button type="button" class="kn-gross" data-pk="pruefen">✓ Prüfen</button>
          <button type="button" class="kn-gross kn-leise" data-pk="zeigen">Mit Kette zeigen</button>
          ${bewertung ? `<span class="tb-antwort ${bewertung.ok ? 'gut' : 'schlecht'}">${bewertung.text}</span>` : ''}
        </div>
        ${bewertung?.ok ? '<button type="button" class="kn-gross kn-leise" data-pk="uebung">Nächste Aufgabe</button>' : ''}`;
    }
    $('#pk-rechts').innerHTML = html;
  }

  function zahlen() {
    $('#pk-zahlen').innerHTML = Array.from({ length: 9 }, (_, i) => i + 2).map(z =>
      `<button type="button" class="tb-k pf-${z === 10 ? 'g' : z}${z === n ? ' aktiv' : ''}" data-n="${z}" aria-label="Kette der ${z}"><span class="pk-punkt"></span>${z}</button>`).join('');
    root.querySelectorAll('[data-art]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.art) === art)));
  }

  function alles(neuAnlegen = true) {
    if (neuAnlegen) staebeAnlegen();
    zahlen(); steuer(); rechts();
    requestAnimationFrame(lege);
  }

  function erklaere() {
    if (stufe === 0) sprich(art === 2
      ? `Das ist die Quadratkette der ${n}: ${n} Stäbchen mit je ${n} Perlen. Zähle in ${n}er-Schritten mit: ${Array.from({ length: Math.min(n, 5) }, (_, i) => (i + 1) * n).join(', ')}${n > 5 ? ' …' : ''}`
      : `Das ist die Kubikkette der ${n}: ${n * n} Stäbchen mit je ${n} Perlen. Nach je ${n} Stäbchen ist ein Quadrat voll.`);
    else if (stufe === 1) sprich(art === 2
      ? `Gefaltet: ein Quadrat aus ${n} · ${n} = ${n * n} Perlen. Darum heißt ${n * n} Quadratzahl.`
      : `${n} Quadrate mit je ${n * n} Perlen. Stapelst du sie, entsteht ein Würfel.`, 'fertig');
    else sprich(`Ein Würfel aus ${n} · ${n} · ${n} = ${n ** 3} Perlen. Darum heißt ${n ** 3} Kubikzahl (Würfelzahl).`, 'fertig');
  }

  root.addEventListener('click', e => {
    const z = e.target.closest('[data-n]');
    if (z) { n = Number(z.dataset.n); stufe = 0; alles(); erklaere(); return; }
    const a = e.target.closest('[data-art]');
    if (a) { art = Number(a.dataset.art); stufe = 0; alles(); erklaere(); return; }
    const b = e.target.closest('[data-pk]');
    if (!b) return;
    switch (b.dataset.pk) {
      case 'falten': stufe = 1; steuer(); lege(); erklaere(); break;
      case 'stapeln': stufe = 2; steuer(); lege(); erklaere(); break;
      case 'kette': stufe = 0; steuer(); lege(); erklaere(); break;
      case 'uebung': {
        let neuA;
        do { neuA = { n: 2 + Math.floor(Math.random() * 9), art: Math.random() < 0.6 ? 2 : 3 }; }
        while (aufgabe && neuA.n === aufgabe.n && neuA.art === aufgabe.art);
        if (neuA.art === 3 && neuA.n > 6) neuA.n -= 4;
        aufgabe = neuA; antwort = ''; bewertung = null; rechts(); break;
      }
      case 'pruefen': {
        const soll = aufgabe.n ** aufgabe.art;
        bewertung = Number(antwort) === soll
          ? { ok: true, text: `Richtig! ${aufgabe.n}${HOCH[aufgabe.art]} = ${soll}` }
          : { ok: false, text: `Noch nicht. Tipp: ${Array(aufgabe.art).fill(aufgabe.n).join(' · ')}` };
        rechts(); break;
      }
      case 'zeigen': n = aufgabe.n; art = aufgabe.art; stufe = 0; alles(); erklaere(); break;
      default: break;
    }
  });

  root.addEventListener('input', e => {
    if (e.target.id === 'pk-antwort') { e.target.value = e.target.value.replace(/\D/g, ''); antwort = e.target.value; }
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (root.isConnected) lege(); }, 120); });

  alles();
  erklaere();
}
