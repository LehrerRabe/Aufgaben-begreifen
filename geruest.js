/* Gemeinsames Gerüst für die Material-Bausteine:
   Kopf (Etikett + Titel + Knöpfe), optional Reiter, Sprechblase, links das Material, rechts Aufgabe und Prüfen. */

export const ESC = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const wahl = liste => liste[Math.floor(Math.random() * liste.length)];
export const mischen = liste => { const a = [...liste]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const bewegung = () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const warte = ms => new Promise(r => setTimeout(r, bewegung() ? ms : 0));

/**
 * @param {HTMLElement} root
 * @param {{ etikett?: string, titel?: string, reiter?: {id:string,titel:string,unter?:string}[], knoepfe?: string, linksTitel?: string, breitRechts?: boolean }} o
 */
export function geruest(root, o = {}) {
  root.innerHTML = `
  <section class="mg">
    <div class="tb-kopf">
      <div class="mg-titelblock">
        ${o.etikett ? `<span class="etikett" data-g="etikett">${ESC(o.etikett)}</span>` : ''}
        <div class="mg-titel" data-g="titel">${o.titel ?? ''}</div>
      </div>
      <div class="tb-kopf-knoepfe" data-g="knoepfe">${o.knoepfe ?? ''}</div>
    </div>
    ${o.reiter ? `<div class="gs-reiter" role="tablist">${o.reiter.map(r => `
      <button type="button" role="tab" class="gs-tab" data-reiter="${r.id}"><b>${ESC(r.titel)}</b>${r.unter ? `<small>${ESC(r.unter)}</small>` : ''}</button>`).join('')}</div>` : ''}
    <div class="sprechblase info" data-g="blase" role="status" aria-live="polite"></div>
    <div class="tb-flaeche${o.breitRechts ? ' breit-rechts' : ''}">
      <div class="tb-links">${o.linksTitel ? `<h2 class="bereich-titel">${ESC(o.linksTitel)}</h2>` : ''}<div data-g="links"></div></div>
      <aside class="tb-rechts" data-g="rechts"></aside>
    </div>
  </section>`;
  const q = n => root.querySelector(`[data-g="${n}"]`);
  return {
    links: q('links'),
    rechts: q('rechts'),
    titel: t => { q('titel').innerHTML = t; },
    etikett: t => { const e = q('etikett'); if (e) e.textContent = t; },
    reiter: id => root.querySelectorAll('[data-reiter]').forEach(r => r.setAttribute('aria-selected', String(r.dataset.reiter === id))),
    sprich(text, art = 'info') {
      const b = q('blase');
      b.className = `sprechblase ${art}`;
      b.innerHTML = `<span class="blase-symbol" aria-hidden="true">${art === 'fertig' ? '★' : art === 'tipp' ? '?' : 'i'}</span><span>${text}</span>`;
    },
  };
}

/** Rückmeldung nach dem Prüfen. */
export const antwortHtml = b => (b ? `<p class="tb-antwort ${b.ok ? 'gut' : 'schlecht'}">${b.text}</p>` : '');

/** Zahleneingabe (nur Ziffern). */
export function zahlFeld(id, wert = '', breite = 5, label = 'Ergebnis') {
  return `<input class="gs-ein" id="${id}" data-zahl inputmode="numeric" maxlength="${breite}" value="${ESC(wert)}" aria-label="${ESC(label)}">`;
}

/** Zahleneingaben bereinigen und Werte in ein Objekt schreiben. */
export function zahlenMerken(root, ziel) {
  root.addEventListener('input', e => {
    if (!e.target.matches('[data-zahl]')) return;
    e.target.value = e.target.value.replace(/[^\d,]/g, '');
    ziel[e.target.id] = e.target.value;
  });
}

/** Wiederholt eine Funktion bei Größenänderung (gedrosselt), solange root im Dokument ist. */
export function beiGroesse(root, f) {
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (root.isConnected) f(); }, 120); });
}

/** Bruch in Bruchschreibweise. */
export const bruchHtml = (z, n, klasse = '') => `<span class="bruch ${klasse}"><span>${z}</span><span>${n}</span></span>`;

/** Eingabe eines Bruchs (Zähler über Nenner). */
export function bruchFeld(idZ, idN, eing = {}) {
  return `<span class="bruch bruch-ein">${zahlFeld(idZ, eing[idZ] ?? '', 3, 'Zähler')}${zahlFeld(idN, eing[idN] ?? '', 3, 'Nenner')}</span>`;
}

export const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
export const kgV = (a, b) => (a / ggT(a, b)) * b;

/** Elemente mit data-id gleiten nach dem Neuzeichnen von ihrem alten an den neuen Platz (FLIP). */
export async function flip(root, neuZeichnen, dauer = 600) {
  const alt = new Map([...root.querySelectorAll('[data-id]')].map(e => [e.dataset.id, e.getBoundingClientRect()]));
  neuZeichnen();
  if (!bewegung()) return;
  const anims = [];
  root.querySelectorAll('[data-id]').forEach(e => {
    const a = alt.get(e.dataset.id), b = e.getBoundingClientRect();
    if (!a || (Math.abs(a.left - b.left) < 1 && Math.abs(a.top - b.top) < 1)) return;
    anims.push(e.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], { duration: dauer, easing: 'cubic-bezier(.4,0,.2,1)' }).finished.catch(() => {}));
  });
  await Promise.all(anims);
}
