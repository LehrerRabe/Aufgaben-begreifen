/* Enter-Taste in allen Aufgaben:
   – Ist die Aufgabe gelöst (grüne Rückmeldung oder [data-fertig]) und wartet kein leeres Eingabefeld mehr, kommt die nächste Aufgabe.
   – Sonst wird „Prüfen“ gedrückt (falls sichtbar).
   Bausteine mit eigener Enter-Behandlung rufen preventDefault() auf und werden hier übergangen. */

const sichtbar = el => !!el && el.getClientRects().length > 0 && !el.closest('[hidden]');
const editierbar = el => el.matches('input:not([type=hidden]):not([readonly]):not([disabled])') && sichtbar(el);

function finde(main, test) {
  return [...main.querySelectorAll('button')].find(b => sichtbar(b) && !b.disabled && test(b.textContent.replace(/\s+/g, ' ').trim()));
}

export function enterSteuerung() {
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const main = document.getElementById('inhalt');
    if (!main || !main.querySelector('.mg')) return;
    const t = e.target;
    if (t !== document.body && !main.contains(t)) return;
    if (t.matches('textarea, select')) return;

    const pruef = finde(main, x => /Prüfen/.test(x));
    const neu = finde(main, x => /Neue Aufgabe/.test(x));
    // andere Knöpfe behalten ihr normales Verhalten (Enter = antippen)
    if (t.matches('button, a, [role="button"], [tabindex]:not(input)') && t !== pruef && t !== neu) return;

    const felder = [...main.querySelectorAll('input')].filter(editierbar);
    const leer = felder.find(f => !f.value);
    const geloest = [...main.querySelectorAll('.tb-antwort.gut')].some(sichtbar) || !!main.querySelector('[data-fertig]');

    if (geloest && !leer && neu) {
      e.preventDefault();
      neu.click();
      requestAnimationFrame(() => [...main.querySelectorAll('input')].find(editierbar)?.focus({ preventScroll: true }));
      return;
    }
    if (pruef) {
      e.preventDefault();
      const war = t.matches('input') ? t : null;
      pruef.click();
      requestAnimationFrame(() => {
        const zurueck = war && (war.isConnected ? war : war.id && document.getElementById(war.id));
        if (zurueck && editierbar(zurueck)) zurueck.focus({ preventScroll: true });
        else [...main.querySelectorAll('input')].filter(editierbar).find(f => !f.value)?.focus({ preventScroll: true });
      });
      return;
    }
    if (leer && t !== leer) { e.preventDefault(); leer.focus({ preventScroll: true }); }
  });
}
