/* Raster für das schriftliche Rechnen und die Auswertung der Eingaben */

/**
 * Zellen:
 *  { t: 'z', v: '4', klasse? }            feste Ziffer / Zeichen
 *  { t: 'i', key, weiter?, klein?, max? } Eingabefeld
 *  { t: '' }                               leer
 * Zeilen: { zellen: [...], klasse?: string }
 */
export function rasterHtml(spalten, zeilen, ui) {
  let html = '';
  for (const zeile of zeilen) {
    for (const z of zeile.zellen) {
      const kl = ['zelle', zeile.klasse || '', z.klasse || ''].filter(Boolean).join(' ');
      if (z.t === 'i') {
        const wert = ui.eingaben[z.key] ?? '';
        const bew = ui.bewertung[z.key] || '';
        html += `<div class="${kl}"><input class="ziffer${z.klein ? ' klein' : ''}${bew ? ' ' + bew : ''}${z.cue ? ' cue' : ''}"
          data-key="${z.key}"${z.weiter ? ` data-weiter="${z.weiter}"` : ''} inputmode="numeric" pattern="[0-9]*"
          maxlength="${z.max || 1}" value="${wert}" autocomplete="off" autocorrect="off" spellcheck="false"
          aria-label="${z.label || 'Ziffer'}"></div>`;
      } else if (z.t === 'z') {
        html += `<div class="${kl}">${z.v}</div>`;
      } else {
        html += `<div class="${kl}"></div>`;
      }
    }
  }
  return `<div class="raster" style="--sp:${spalten}">${html}</div>`;
}

/**
 * Erwartungen: [{ key, soll: '3' | '', art: 'pflicht' | 'optional' | 'leer' }]
 *  pflicht  – muss ausgefüllt und richtig sein
 *  optional – darf leer bleiben; wenn ausgefüllt, wird geprüft (z. B. Überträge)
 *  leer     – Feld vor der Zahl: leer oder 0 ist richtig
 */
export function auswerten(erwartungen, eingaben) {
  const bewertung = {};
  let falsch = 0, fehlt = 0;
  for (const e of erwartungen) {
    const ist = (eingaben[e.key] ?? '').trim();
    if (e.art === 'leer') {
      if (ist !== '' && Number(ist) !== 0) { bewertung[e.key] = 'falsch'; falsch++; }
    } else if (e.art === 'optional') {
      if (ist === '') continue;
      if (ist === e.soll || (e.soll === '' && Number(ist) === 0)) bewertung[e.key] = 'ok';
      else { bewertung[e.key] = 'falsch'; falsch++; }
    } else {
      if (ist === '') { fehlt++; bewertung[e.key] = 'fehlt'; continue; }
      if (ist === e.soll) bewertung[e.key] = 'ok';
      else { bewertung[e.key] = 'falsch'; falsch++; }
    }
  }
  return { bewertung, falsch, fehlt, richtig: falsch === 0 && fehlt === 0 };
}

export function loesungAus(erwartungen) {
  const e = {};
  for (const x of erwartungen) if (x.soll !== '' && x.art !== 'leer') e[x.key] = x.soll;
  return e;
}

export const leer = () => ({ t: '' });
export const fest = (v, klasse) => ({ t: 'z', v: String(v), klasse });
