/* Animationen für das Umtauschen (10 → 1) und Entbündeln (1 → 10).
   Gearbeitet wird mit Kopien in einer festen Ebene über der Seite; erst danach
   ändert die Rechenart ihren Zustand und die Spalten werden neu gezeichnet.
   Die Animation läuft neben dem liegenden Material (im freien Platz darunter),
   damit nichts verdeckt wird. */

import { einzelStueckHtml } from './material.js';

const warte = ms => new Promise(r => setTimeout(r, ms));

export const mitBewegung = () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function neueSchicht() {
  const s = document.createElement('div');
  s.className = 'anim-schicht';
  document.body.appendChild(s);
  return s;
}

/** Kopie eines Teils genau an seiner Stelle. */
function kopie(el, schicht) {
  const r = el.getBoundingClientRect();
  const c = el.cloneNode(true);
  c.classList.remove('neu');
  c.style.cssText += `;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;font-size:${getComputedStyle(el).fontSize}`;
  schicht.appendChild(c);
  return { el: c, x: r.left, y: r.top, w: r.width, h: r.height };
}

/** Neues Teil in einer Box. */
function box(html, x, y, w, h, schicht) {
  const d = document.createElement('div');
  d.className = 'anim-box';
  d.innerHTML = html;
  d.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
  schicht.appendChild(d);
  return d;
}

function schild(html, x, y, schicht) {
  const d = document.createElement('div');
  d.className = 'anim-schild';
  d.innerHTML = html;
  d.style.cssText = `left:${x}px;top:${Math.max(48, y)}px`;
  schicht.appendChild(d);
  d.animate([{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1.08' }, { opacity: 1, scale: '1' }],
    { duration: 380, easing: 'ease-out', fill: 'forwards' });
  return d;
}

const verschiebe = (o, nx, ny, dauer, extra = {}) => o.el.animate(
  [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${nx - o.x}px,${ny - o.y}px) scale(${extra.scale ?? 1})` }],
  { duration: dauer, delay: extra.delay || 0, easing: extra.easing || 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' },
).finished;

const ausblenden = (el, dauer = 260) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dauer, fill: 'forwards' }).finished;

/** Liegende Teile (ohne freigehaltene Plätze). */
const echte = stapel => [...stapel.children].filter(e => !e.classList.contains('platz'));
const freiePlaetze = stapel => [...stapel.children].filter(e => e.classList.contains('platz'));

/** Ort für die Animation: in der Spalte direkt unter den Teilen, die liegen bleiben. */
function freierOrt(spalte, stapel, bleibende) {
  const rs = stapel.getBoundingClientRect(), rc = spalte.getBoundingClientRect();
  let y = rs.top + 6;
  for (const e of bleibende) y = Math.max(y, e.getBoundingClientRect().bottom + 12);
  return { x: rc.left + rc.width / 2, y };
}

/** Spalte in die Bildmitte holen, damit die ganze Animation zu sehen ist. */
function insBild(el) {
  const r = el.getBoundingClientRect();
  if (r.top < 90 || r.bottom > window.innerHeight - 20) el.scrollIntoView({ block: 'center', behavior: 'instant' });
}

const glanz = el => el.animate(
  [{ filter: 'drop-shadow(0 0 0 #ffd34d)' }, { filter: 'drop-shadow(0 0 16px #ffd34d) brightness(1.15)' }, { filter: 'drop-shadow(0 0 0 #ffd34d)' }],
  { duration: 1000, easing: 'ease-in-out' });

/**
 * Wie die zehn kleinen Teile zusammenrücken und wie groß das neue Teil ist.
 * Alle Angaben relativ zu (Mitte, Oberkante) des freien Orts.
 */
function zielformen(p, modus, w, h) {
  const perlen = modus === 'perlen' && p < 3;
  if (perlen && p === 0) {           // 10 Perlen untereinander = Stange
    return { plaetze: i => ({ x: -w / 2, y: i * h }), neu: { x: -w / 2, y: 0, w, h: 10 * h } };
  }
  if (perlen && p === 1) {           // 10 Stangen nebeneinander = Platte
    return { plaetze: i => ({ x: -5 * w + i * w, y: 0 }), neu: { x: -5 * w, y: 0, w: 10 * w, h } };
  }
  if (perlen && p === 2) {           // 10 Platten aufeinander = Würfel
    const d = w * 0.055, cw = w * 1.35, ch = cw * 31 / 28;
    const hoehe = Math.max(h + 9 * d, ch);
    return {
      plaetze: i => ({ x: -w / 2 + (i - 4.5) * d, y: (hoehe - h) / 2 + (4.5 - i) * d }),
      neu: { x: -cw / 2, y: (hoehe - ch) / 2, w: cw, h: ch },
    };
  }
  // Plättchen: erst 2 Reihen zu je 5 (man sieht: zehn Stück), dann auf einen Stapel
  const ax = w * 1.15, ay = h * 1.3, hoehe = ay + h;
  return {
    plaetze: i => ({ x: ((i % 5) - 2) * ax - w / 2, y: Math.floor(i / 5) * ay }),
    stapel: i => ({ x: -w / 2 + i * 1.5, y: hoehe / 2 - h / 2 - i * 1.5 }),
    neu: { x: -w * 0.625, y: hoehe / 2 - h * 0.55, w: w * 1.25, h: h * 1.1 },
  };
}

/** Wohin ein neues Teil in der Zielspalte fliegt: auf den ersten freien Platz. */
function landeplatz(spalte, stapel) {
  const platz = freiePlaetze(stapel)[0];
  if (platz) { const r = platz.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }
  const liegend = echte(stapel);
  const r = (liegend.at(-1) || stapel).getBoundingClientRect();
  const rc = spalte.getBoundingClientRect();
  return { x: rc.left + rc.width / 2 - r.width / 2, y: r.bottom + 6, w: r.width, h: r.height };
}

/** 10 Teile einer Spalte werden zu einem Teil der nächsten Stelle gebündelt und wandern in die Nachbarspalte. */
export async function buendeln({ quelle, ziel, p, modus, text }) {
  const stapelQ = quelle?.querySelector('.stapel'), stapelZ = ziel?.querySelector('.stapel');
  if (!stapelQ || !stapelZ) return;
  const liegend = echte(stapelQ);
  if (liegend.length < 10) return;
  const teile = liegend.slice(-10), bleibende = liegend.slice(0, -10);

  insBild(quelle);
  const schicht = neueSchicht();
  try {
    const kopien = teile.map(t => kopie(t, schicht));
    teile.forEach(t => { t.style.visibility = 'hidden'; });
    const { w, h } = kopien[0];
    const o = freierOrt(quelle, stapelQ, bleibende);
    const form = zielformen(p, modus, w, h);

    // 1. Die zehn Teile rücken neben den liegenden Teilen zusammen
    await Promise.all(kopien.map((k, i) => {
      const z = form.plaetze(i);
      return verschiebe(k, o.x + z.x, o.y + z.y, 700, { delay: i * 45 });
    }));
    const s = schild(text, o.x, o.y - 10, schicht);
    await warte(500);
    if (form.stapel) {
      await Promise.all(kopien.map((k, i) => {
        const a = form.plaetze(i), z = form.stapel(i);
        return k.el.animate([{ transform: `translate(${o.x + a.x - k.x}px,${o.y + a.y - k.y}px)` },
          { transform: `translate(${o.x + z.x - k.x}px,${o.y + z.y - k.y}px)` }],
        { duration: 450, delay: i * 25, easing: 'ease-in', fill: 'forwards' }).finished;
      }));
    }

    // 2. Aus zehn wird eins
    const fx = o.x + form.neu.x, fy = o.y + form.neu.y;
    const neu = box(einzelStueckHtml(p + 1, modus), fx, fy, form.neu.w, form.neu.h, schicht);
    neu.animate([{ opacity: 0, scale: '.7' }, { opacity: 1, scale: '1.12' }, { opacity: 1, scale: '1' }],
      { duration: 500, easing: 'ease-out', fill: 'forwards' });
    glanz(neu);
    kopien.forEach(k => ausblenden(k.el, 350));
    await warte(1000);

    // 3. Das neue Teil wandert in die nächste Spalte auf seinen Platz
    const lp = landeplatz(ziel, stapelZ);
    const skala = lp.w > 0 ? lp.w / form.neu.w : 1;
    ausblenden(s, 400);
    await neu.animate(
      [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${lp.x - fx}px,${lp.y - fy}px) scale(${skala})` }],
      { duration: 850, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' },
    ).finished;
  } finally {
    schicht.remove();
  }
}

/** Ein Teil wandert eine Stelle nach rechts und zerfällt dort in zehn kleinere Teile. */
export async function entbuendeln({ quelle, ziel, p, modus, text }) {
  const stapelQ = quelle?.querySelector('.stapel'), stapelZ = ziel?.querySelector('.stapel');
  const teil = stapelQ && echte(stapelQ).at(-1);
  if (!teil || !stapelZ) return;

  insBild(ziel);
  const schicht = neueSchicht();
  try {
    const k = kopie(teil, schicht);
    teil.style.visibility = 'hidden';
    const o = freierOrt(ziel, stapelZ, echte(stapelZ));
    const bx = o.x - k.w / 2, by = o.y;

    // 1. Das große Teil wandert in die Nachbarspalte, neben die Teile, die dort schon liegen
    await verschiebe(k, bx, by, 800);
    const s = schild(text, o.x, by - 10, schicht);
    glanz(k.el);
    await warte(600);

    // 2. Es zerfällt in zehn Teile der kleineren Stelle
    const perlen = modus === 'perlen' && p <= 3;
    let kw, kh, platz;
    if (perlen && p === 1) { kw = k.w; kh = k.h / 10; platz = i => ({ x: bx, y: by + i * kh }); }
    else if (perlen && p === 2) { kw = k.w / 10; kh = k.h; platz = i => ({ x: bx + i * kw, y: by }); }
    else if (perlen && p === 3) {
      kw = k.w * 0.75; kh = kw; const d = kw * 0.055;
      platz = i => ({ x: o.x - kw / 2 + (i - 4.5) * d, y: by + (k.h - kh) / 2 + (4.5 - i) * d });
    } else { kw = k.w / 1.2; kh = k.h; platz = i => ({ x: o.x - kw / 2 + i * 1.5, y: by - i * 1.5 }); }

    const html = einzelStueckHtml(p - 1, modus);
    const kleine = Array.from({ length: 10 }, (_, i) => {
      const z = platz(i);
      const b = box(html, z.x, z.y, kw, kh, schicht);
      b.style.opacity = '0';
      return { el: b, x: z.x, y: z.y };
    });
    k.el.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '1.15' }], { duration: 450, fill: 'forwards' });
    await Promise.all(kleine.map(t => t.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' }).finished));
    await warte(550);

    // 3. Die zehn Teile gehen auf ihre Plätze in der Spalte
    const plaetze = freiePlaetze(stapelZ).slice(0, 10).map(e => e.getBoundingClientRect());
    ausblenden(s, 400);
    await Promise.all(kleine.map((t, i) => {
      let nx, ny, sx = 1, sy = 1;
      if (plaetze[i]) { nx = plaetze[i].left; ny = plaetze[i].top; sx = plaetze[i].width / kw; sy = plaetze[i].height / kh; }
      else { nx = o.x + ((i % 5) - 2) * kw * 1.3 - kw / 2; ny = by + Math.floor(i / 5) * kh * 1.3; }
      return t.el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${nx - t.x}px,${ny - t.y}px) scale(${sx},${sy})` }],
        { duration: 700, delay: i * 40, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished;
    }));
    await warte(150);
  } finally {
    schicht.remove();
  }
}

/**
 * Schachbrett: In einem Feld werden alle Perlen gezählt.
 * Je 10 Perlen werden zu einer Perle, die ins Feld links daneben wandert;
 * der Rest wird zu einem einzigen Stäbchen.
 */
export async function feldTauschen({ quelle, ziel, staebe, text }) {
  if (!quelle) return;
  insBild(quelle);
  const rq = quelle.getBoundingClientRect();
  const stabEls = [...quelle.querySelectorAll('.pstab')];
  if (!stabEls.length) return;
  const n = staebe.reduce((x, y) => x + y, 0);
  const zehner = Math.floor(n / 10), rest = n % 10;
  const spalten = Math.ceil(n / 10);
  const b = Math.max(4, Math.min(stabEls[0].getBoundingClientRect().width, (rq.height * 0.66) / 10, (rq.width * 0.84) / spalten - 2));
  const schicht = neueSchicht();
  try {
    // 1. Jede Perle einzeln an ihrem Platz
    const perlen = [];
    stabEls.forEach((el, si) => {
      const r = el.getBoundingClientRect();
      const l = staebe[si];
      const bb = r.width;
      for (let j = 0; j < l; j++) {
        const x = r.left, y = r.top + j * bb;
        const e = box(`<i class="anim-perle pf pf-${l}"></i>`, x, y, bb, bb, schicht);
        perlen.push({ el: e, x, y, s: b / bb });
      }
      el.style.visibility = 'hidden';
    });

    // 2. Sie ordnen sich in Säulen zu je 10 (links die vollen Zehner, rechts der Rest)
    const breite = spalten * (b + 2);
    const x0 = rq.left + rq.width / 2 - breite / 2;
    const unten = rq.top + rq.height * 0.82;
    const ziele = perlen.map((_, i) => ({ x: x0 + Math.floor(i / 10) * (b + 2), y: unten - (i % 10 + 1) * b }));
    await Promise.all(perlen.map((pp, i) => pp.el.animate(
      [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${ziele[i].x - pp.x}px,${ziele[i].y - pp.y}px) scale(${pp.s})` }],
      { duration: 750, delay: i * 18, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' }).finished));
    const s = schild(text, rq.left + rq.width / 2, rq.top - 6, schicht);
    await warte(700);

    // 3. Rest wird zu einem Stäbchen, jede volle Zehnersäule zu einer Perle
    if (rest) {
      const rx = x0 + zehner * (b + 2), ry = unten - rest * b;
      const stab = box(`<i class="pstab pf-${rest}" style="--l:${rest};--b:${b}px"></i>`, rx, ry, b, rest * b, schicht);
      stab.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
      perlen.slice(zehner * 10).forEach(pp => ausblenden(pp.el, 400));
    }
    if (!zehner) { await warte(800); return; }

    const traeger = [];
    for (let k = 0; k < zehner; k++) {
      const saeule = perlen.slice(k * 10, k * 10 + 10);
      const zx = x0 + k * (b + 2), zy = unten - b;
      saeule.forEach((pp, j) => pp.el.animate(
        [{ transform: `translate(${ziele[k * 10 + j].x - pp.x}px,${ziele[k * 10 + j].y - pp.y}px) scale(${pp.s})` },
         { transform: `translate(${zx - pp.x}px,${zy - pp.y}px) scale(${pp.s * (j === 0 ? 1.25 : 0.3)})`, opacity: j === 0 ? 1 : 0 }],
        { duration: 500, easing: 'ease-in', fill: 'forwards' }));
      traeger.push(saeule[0]);
    }
    await warte(650);

    // 4. Die neuen Perlen wandern ins Feld links daneben
    if (ziel) {
      const rz = ziel.getBoundingClientRect();
      const tx = rz.left + rz.width * 0.12, ty = rz.top + rz.height * 0.8 - b;
      ausblenden(s, 400);
      await Promise.all(traeger.map((pp, k) => pp.el.animate(
        [{ transform: `translate(${x0 + k * (b + 2) - pp.x}px,${unten - b - pp.y}px) scale(${pp.s * 1.25})` },
         { transform: `translate(${(x0 + tx) / 2 - pp.x}px,${Math.min(rq.top, rz.top) - 4 * b - pp.y}px) scale(${pp.s * 1.6})`, offset: 0.45 },
         { transform: `translate(${tx + k * (b + 2) - pp.x}px,${ty - pp.y}px) scale(${pp.s})` }],
        { duration: 900, delay: k * 60, easing: 'ease-in-out', fill: 'forwards' }).finished));
    }
    await warte(200);
  } finally {
    schicht.remove();
  }
}
