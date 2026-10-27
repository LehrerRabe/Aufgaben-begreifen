/* Perlenbühne: viele Perlen, die animiert an neue Plätze wandern.
   Jede Perle bleibt dasselbe Element – so sieht man, wohin sie geht. */

export function perlenBuehne(el) {
  let perlen = [];

  /**
   * @param {{x:number,y:number,klasse?:string}[]} plaetze  Mittelpunkte in px
   * @param {number} groesse  Durchmesser in px
   * @param {number} hoehe    Höhe der Bühne in px
   */
  function setze(plaetze, groesse, hoehe) {
    while (perlen.length < plaetze.length) {
      const p = document.createElement('i');
      p.className = 'bu-perle';
      p.style.cssText = `left:${el.clientWidth / 2}px;top:${hoehe / 2}px;opacity:0`;
      el.appendChild(p);
      perlen.push(p);
    }
    while (perlen.length > plaetze.length) perlen.pop().remove();
    el.style.height = `${hoehe}px`;
    // erzwingt den Startzustand neuer Perlen, damit auch sie gleiten
    void el.offsetWidth;
    perlen.forEach((p, i) => {
      const z = plaetze[i];
      p.className = `bu-perle ${z.klasse || ''}`;
      p.style.cssText = `--g:${groesse}px;left:${z.x - groesse / 2}px;top:${z.y - groesse / 2}px;opacity:1;transition-delay:${z.verzoegerung ?? 0}ms`;
    });
  }

  return { setze, breite: () => el.clientWidth || 600 };
}

/** Raster-Plätze für ein Feld mit r Reihen und s Spalten ab (x0, y0). */
export function rasterPlaetze(r, s, zelle, x0, y0, klasse = () => '') {
  const p = [];
  for (let i = 0; i < r; i++) for (let j = 0; j < s; j++) {
    p.push({ x: x0 + j * zelle + zelle / 2, y: y0 + i * zelle + zelle / 2, klasse: klasse(i, j) });
  }
  return p;
}
