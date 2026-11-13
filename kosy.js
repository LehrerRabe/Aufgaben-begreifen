/* Gemeinsame Helfer für die Zuordnungs-Bausteine (Klasse 7):
   Zahlen deutsch schreiben und lesen, Koordinatensystem als SVG, Graphen-Pfade,
   und die zusätzlichen Stile (werden einmal in den Kopf der Seite geschrieben – app.css bleibt unverändert). */

export const zt = (v, stellen = 2) => {
  if (v === null || v === undefined || !isFinite(v)) return '–';
  const f = 10 ** stellen;
  return String(Math.round(v * f) / f).replace('-', '−').replace('.', ',');
};
export const lies = s => {
  const t = String(s ?? '').trim().replace(/\s/g, '').replace('−', '-').replace(',', '.');
  return t === '' || t === '-' || isNaN(t) ? null : Number(t);
};
export const gleich = (a, b, eps = 0.011) => a !== null && b !== null && Math.abs(a - b) < eps;

/** Schöne Schrittweite (1, 2, 5 · 10^k) für etwa n Striche. */
export function schritt(max, n = 6) {
  const roh = max / n, p = 10 ** Math.floor(Math.log10(roh)), m = roh / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/**
 * Koordinatensystem (1. Quadrant).
 * @returns {{svg:string, X:(x:number)=>number, Y:(y:number)=>number, inv:(px:number)=>number, W:number, H:number, L:number, B:number, R:number, T:number}}
 */
export function kosy({ W = 440, H = 320, xmax, ymax, xlab = 'x', ylab = 'y', xs, ys, gitter = true, klein = false }) {
  const L = klein ? 30 : 52, B = H - (klein ? 24 : 40), R = W - 16, T = klein ? 10 : 22;
  const X = x => L + (x / xmax) * (R - L), Y = y => B - (y / ymax) * (B - T);
  xs = xs ?? schritt(xmax, klein ? 4 : 8); ys = ys ?? schritt(ymax, klein ? 4 : 6);
  let s = '';
  if (gitter) {
    for (let x = xs; x <= xmax + 1e-9; x += xs) s += `<line x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${B}" class="ks-gitter"/>`;
    for (let y = ys; y <= ymax + 1e-9; y += ys) s += `<line x1="${L}" y1="${Y(y)}" x2="${R}" y2="${Y(y)}" class="ks-gitter"/>`;
  }
  s += `<line x1="${L}" y1="${B}" x2="${R + 8}" y2="${B}" class="ks-achse" marker-end="url(#ks-pfeil)"/>
        <line x1="${L}" y1="${B}" x2="${L}" y2="${T - 8}" class="ks-achse" marker-end="url(#ks-pfeil)"/>`;
  if (!klein) {
    for (let x = xs; x <= xmax + 1e-9; x += xs) s += `<line x1="${X(x)}" y1="${B - 4}" x2="${X(x)}" y2="${B + 4}" class="ks-achse"/><text x="${X(x)}" y="${B + 19}" class="ks-zahl">${zt(x)}</text>`;
    for (let y = ys; y <= ymax + 1e-9; y += ys) s += `<line x1="${L - 4}" y1="${Y(y)}" x2="${L + 4}" y2="${Y(y)}" class="ks-achse"/><text x="${L - 8}" y="${Y(y) + 5}" class="ks-zahl rechts">${zt(y)}</text>`;
    s += `<text x="${L - 8}" y="${B + 19}" class="ks-zahl rechts">0</text>`;
  }
  s += `<text x="${R + 6}" y="${B - 10}" class="ks-lab rechts">${xlab}</text><text x="${L + 10}" y="${T + 2}" class="ks-lab">${ylab}</text>`;
  const defs = `<defs><marker id="ks-pfeil" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="ks-spitze"/></marker></defs>`;
  return { svg: defs + s, X, Y, inv: px => ((px - L) / (R - L)) * xmax, W, H, L, B, R, T };
}

/** Pfad einer Funktion f zwischen a und b; Teile außerhalb von [0, ymax] werden abgeschnitten. */
export function kurve(k, f, a, b, ymax, n = 120) {
  let d = '', an = false;
  for (let i = 0; i <= n; i++) {
    const x = a + (b - a) * i / n, y = f(x);
    if (!isFinite(y) || y < -1e-9 || y > ymax * 1.02) { an = false; continue; }
    d += `${an ? 'L' : 'M'}${k.X(x).toFixed(1)} ${k.Y(y).toFixed(1)}`; an = true;
  }
  return d;
}

/** Linienzug durch Punkte [[x,y],…]. */
export const zug = (k, pkte) => pkte.map(([x, y], i) => `${i ? 'L' : 'M'}${k.X(x).toFixed(1)} ${k.Y(y).toFixed(1)}`).join('');

/** x-Wert aus einem Zeiger-Ereignis auf dem SVG. */
export function zeigerX(svg, e, k) {
  const r = svg.getBoundingClientRect();
  const px = ((e.clientX - r.left) / r.width) * k.W;
  return k.inv(px);
}

const CSS = `
.ks-svg { display:block; width:100%; max-width:30rem; height:auto; margin:0 auto; touch-action:none; user-select:none; -webkit-user-select:none; }
.ks-svg.klein { max-width:13rem; }
.ks-gitter { stroke: var(--rand); stroke-width:1; }
.ks-achse { stroke: var(--text); stroke-width:2; }
.ks-spitze { fill: var(--text); }
.ks-zahl { font: 700 12px var(--titel); text-anchor: middle; fill: var(--leise); }
.ks-zahl.rechts, .ks-lab.rechts { text-anchor: end; }
.ks-lab { font: 700 13px var(--schrift); fill: var(--text); }
.ks-graph { fill:none; stroke: var(--akzent); stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round; }
.ks-graph.zwei { stroke:#e0262b; }
.ks-graph.drei { stroke:#16a974; }
.ks-graph.leise { stroke: var(--leise); stroke-dasharray:6 5; stroke-width:2.5; }
.ks-graph.wachsend { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: ks-zeichnen 1.6s forwards; }
@keyframes ks-zeichnen { to { stroke-dashoffset: 0; } }
.ks-punkt { fill:#e0262b; stroke:#fff; stroke-width:2; }
.ks-punkt.alt { fill: var(--akzent); }
.ks-punkt.spur { fill:#f2b72e; stroke: var(--text); stroke-width:2; r:9; }
.ks-hilfe { stroke: #f2b72e; stroke-width:2; stroke-dasharray:5 4; }
.ks-wert { font: 800 14px var(--titel); fill: var(--text); }
.ks-flaeche { fill: var(--akzent); opacity:.08; }
.zw-regler { display:flex; align-items:center; gap:.6rem; flex-wrap:wrap; margin:.35rem 0; font: 700 1.05rem var(--titel); }
.zw-regler input[type=range] { flex:1; min-width:9rem; accent-color: var(--akzent); height:2rem; }
.zw-regler output { min-width:3.2rem; text-align:right; font-variant-numeric: tabular-nums; }
.zw-tab { border-collapse:collapse; margin:.4rem auto; font: 700 1.02rem var(--titel); font-variant-numeric: tabular-nums; }
.zw-tab th, .zw-tab td { border:2px solid var(--rand); padding:.2rem .5rem; text-align:center; min-width:2.6rem; }
.zw-tab th { background: var(--flaeche-2); }
.zw-tab td.an { background:#f2b72e; color:#1b2340; }
.zw-tab tr.pruef td { color: var(--akzent); }
.zw-tab td.knopf { cursor:pointer; }
.zw-formel { font: 800 1.35rem/1.5 var(--titel); padding:.45rem .8rem; border-radius:12px; background: var(--info-sanft); font-variant-numeric: tabular-nums; text-align:center; }
.zw-formel .var { color:#e0262b; }
.zw-formel .par { color: var(--akzent); }
.zw-wahl { display:flex; flex-wrap:wrap; gap:.4rem; margin:.4rem 0; }
.zw-wahl .kn-gross { font-size:1rem; }
.zw-wahl .gewaehlt { border-color: var(--akzent); background: var(--akzent); color: var(--akzent-text); }
.zw-karten { display:grid; grid-template-columns: repeat(auto-fit, minmax(10.5rem,1fr)); gap:.5rem; margin:.4rem 0 .8rem; }
.zw-karte { border:3px solid var(--rand); border-radius:14px; background: var(--flaeche); padding:.4rem; cursor:pointer; font: 700 1rem var(--titel); color: var(--text); text-align:center; }
.zw-karte.gewaehlt { border-color: var(--akzent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--akzent) 35%, transparent); }
.zw-karte.gut { border-color: var(--gut); background: var(--gut-sanft); }
.zw-karte.schlecht { border-color: var(--schlecht); background: var(--schlecht-sanft); }
.zw-karte .zw-tab { font-size:.85rem; margin:0 auto; }
.zw-karte .zw-tab th, .zw-karte .zw-tab td { padding:.1rem .3rem; min-width:1.6rem; }
.zw-h { font: 800 1.05rem var(--titel); margin:.6rem 0 .1rem; }
.zw-buehne { position:relative; min-height:120px; margin: .4rem auto; max-width: 30rem; }
.zw-maschine { display:flex; align-items:center; justify-content:center; gap:.5rem; flex-wrap:wrap; margin:.6rem 0; font: 800 1.4rem var(--titel); font-variant-numeric: tabular-nums; }
.zw-maschine .ein, .zw-maschine .aus { min-width:3.4rem; padding:.35rem .6rem; border-radius:12px; text-align:center; color:#fff; }
.zw-maschine .ein { background:#e0262b; } .zw-maschine .aus { background:#16a974; }
.zw-maschine .kasten { padding:.6rem 1rem; border-radius:16px; background: var(--akzent); color: var(--akzent-text); box-shadow: 0 4px 0 color-mix(in srgb, var(--akzent) 55%, #000); }
.zw-maschine .kasten.puls { animation: zw-puls .45s; }
@keyframes zw-puls { 50% { transform: scale(1.08); } }
.zw-gleich { font: 800 1.6rem var(--titel); text-align:center; margin:.3rem 0; font-variant-numeric: tabular-nums; }
.zw-gleich.ja { color: var(--gut); } .zw-gleich.nein { color: var(--schlecht); }
.zw-blatt { border-collapse:collapse; font: 700 1rem var(--titel); font-variant-numeric: tabular-nums; margin:.3rem 0; }
.zw-blatt th { background: var(--flaeche-2); border:1px solid var(--rand); padding:.15rem .5rem; color: var(--leise); font-size:.85rem; }
.zw-blatt td { border:1px solid var(--rand); min-width:4.6rem; height:2rem; padding:0 .4rem; text-align:right; background: var(--flaeche); cursor:pointer; }
.zw-blatt td.zw-k { font-family: var(--schrift); text-align:left; background: var(--flaeche-2); }
.zw-blatt td.aktiv { outline:3px solid #16a974; outline-offset:-3px; }
.zw-blatt td.fehler { color: var(--schlecht); }
.zw-zeile { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; margin:.3rem 0; }
.zw-zeile .fx { font: italic 800 1rem var(--titel); color: var(--leise); }
.zw-zeile input { flex:1; min-width:10rem; font: 700 1.1rem var(--titel); padding:.35rem .6rem; border:2px solid var(--rand); border-radius:10px; background: var(--flaeche); color: var(--text); }
.zw-auswahl { font: 700 1rem var(--schrift); padding:.25rem .4rem; border:2px solid var(--rand); border-radius:10px; background: var(--flaeche); color: var(--text); max-width:100%; }
.zw-auswahl.gut { border-color: var(--gut); } .zw-auswahl.schlecht { border-color: var(--schlecht); }
.zw-text { width:100%; min-height:6rem; font: 1rem/1.5 var(--schrift); padding:.5rem; border:2px solid var(--rand); border-radius:12px; background: var(--flaeche); color: var(--text); box-sizing:border-box; }
.zw-gefaess { display:block; width:100%; max-width:12rem; height:auto; margin:0 auto; }
.zw-wasser { fill:#5aa7ff; opacity:.85; }
.zw-glas { fill:none; stroke: var(--text); stroke-width:4; stroke-linejoin:round; }
.zw-flex { display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-start; justify-content:center; }
.zw-flex > * { flex: 1 1 12rem; }
.zw-pfeiltab { display:grid; grid-template-columns: auto auto auto auto auto; align-items:center; gap:.15rem .6rem; justify-content:center; font: 800 1.25rem var(--titel); font-variant-numeric: tabular-nums; margin:.4rem 0; }
.zw-pfeiltab .op { font-size:.95rem; color:#f07d2a; } .zw-pfeiltab .op.b { color:#16a974; }
.zw-pfeiltab .zw-pk { font: 700 .9rem var(--schrift); color: var(--leise); }
.zw-pfeiltab .gs-ein { width:4.6rem; }
`;
let gesetzt = false;
export function stile() {
  if (gesetzt || document.getElementById('zw-stile')) return;
  const st = document.createElement('style');
  st.id = 'zw-stile'; st.textContent = CSS;
  document.head.appendChild(st);
  gesetzt = true;
}
