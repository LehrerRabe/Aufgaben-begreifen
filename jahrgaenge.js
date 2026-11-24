/* Jahrgangsstufen der Kacheln.
   Mathematik: schulinternes Curriculum Mathematik SI (G9), Jg. 5–6, 7–8, 9–10 (Lambacher Schweizer, Kapitel wie dort benannt).
   Deutsch: Kernlehrplan Deutsch Gymnasium G9 NRW (2019). Er unterscheidet nur Stufen:
     „Ende der Erprobungsstufe“ = Klasse 5–6, „Ende Sek I, erste Stufe“ (die Grenze legt die Schule fest – hier als Klasse 7–8 gelesen).
   Schlüssel = Pfad der Kachel im Menü (ohne Fach-Präfix gilt nicht – immer voller Pfad).
   jg: Jahrgangsstufen · quelle: kurzer Verweis (erscheint auf der Kachel und wird mitdurchsucht). */

const LS5 = 'Kl. 5', LS6 = 'Kl. 6', LS7 = 'Kl. 7', LS8 = 'Kl. 8';
const BR5 = 'auch in Kl. 5 möglich';
const KLP = 'KLP Deutsch, Erprobungsstufe (Kl. 5–6)';

export const JAHRGAENGE = {
  /* ---------- Mathematik ---------- */
  'mathematik.kopfrechnen.plusminus': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Grundrechenarten` },
  'mathematik.kopfrechnen.einmaleins': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Grundrechenarten` },

  'mathematik.verstehen.teilen': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Grundrechenarten (Division)` },
  'mathematik.verstehen.streifen': { jg: [5], quelle: `${LS5} · Rechnen: Sachaufgaben systematisch lösen` },
  'mathematik.verstehen.unterschied': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Grundrechenarten` },
  'mathematik.verstehen.ueberschlag': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Große Zahlen und Runden, schriftliches Rechnen` },

  'mathematik.stellenwerte.abakus': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Zählen und Darstellen` },
  'mathematik.stellenwerte.stellenwerttafel': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Zählen und Darstellen (Stellenwerttafel)` },
  'mathematik.stellenwerte.einheitentafel': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Rechnen mit Längen-, Gewichts- und Zeitangaben` },
  'mathematik.stellenwerte.schrittstrahl': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Zahlen ordnen (Zahlenstrahl)` },

  'mathematik.groessen.rechenrahmen': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Große Zahlen und Runden` },
  'mathematik.groessen.zahlenstrahl': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Zahlen ordnen` },
  'mathematik.groessen.umtauschen': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Rechnen mit Geld, Längen, Gewichten und Zeit` },
  'mathematik.groessen.geld': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Rechnen mit Geld` },
  'mathematik.groessen.schaetzen': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Größen und Einheiten (schätzen)` },
  'mathematik.groessen.uhr': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Rechnen mit Zeitangaben` },
  'mathematik.groessen.diagramm': { jg: [5], quelle: `${LS5} · Zahlen und Größen: Zählen und Darstellen (Strichliste, Säulendiagramm)` },

  'mathematik.schriftlich.addition': { jg: [5], quelle: `${LS5} · Schriftliches Addieren und Subtrahieren` },
  'mathematik.schriftlich.subtraktion': { jg: [5], quelle: `${LS5} · Schriftliches Addieren und Subtrahieren` },
  'mathematik.schriftlich.multiplikation': { jg: [5], quelle: `${LS5} · Schriftliches Multiplizieren` },
  'mathematik.schriftlich.division': { jg: [5], quelle: `${LS5} · Schriftliches Dividieren` },

  'mathematik.teiler.steckbrett': { jg: [5], quelle: `${LS5} · Rechnen: Teilbarkeit` },
  'mathematik.teiler.sieb': { jg: [5], quelle: `${LS5} · Rechnen: Primzahlen und Primfaktorzerlegung` },
  'mathematik.teiler.primbaum': { jg: [5], quelle: `${LS5} · Rechnen: Primzahlen und Primfaktorzerlegung` },
  'mathematik.teiler.gesetze': { jg: [5], quelle: `${LS5} · Rechnen: Rechenvorteile, Ausklammern und Ausmultiplizieren` },
  'mathematik.teiler.potenzen': { jg: [5], quelle: `${LS5} · Rechnen: Potenzieren` },

  'mathematik.symmetrie.spiegel': { jg: [5], quelle: `${LS5} · Symmetrie: achsen- und punktsymmetrische Figuren` },
  'mathematik.symmetrie.vierecke': { jg: [5], quelle: `${LS5} · Symmetrie: Eigenschaften von Vielecken` },
  'mathematik.symmetrie.koordinaten': { jg: [5, 6], quelle: `${LS5} · Symmetrie: Koordinatensystem · ${LS6} · Muster und Figuren: Verschiebungen` },
  'mathematik.symmetrie.dreiecke': { jg: [5], quelle: `${LS5} · Symmetrie: senkrechte und parallele Geraden, Vielecke` },
  'mathematik.symmetrie.winkel': { jg: [6], quelle: `${LS6} · Muster und Figuren: Winkel, mit dem Geodreieck messen und zeichnen` },

  'mathematik.flaechen.auslegen': { jg: [5], quelle: `${LS5} · Flächen: Flächeninhalt eines Rechtecks` },
  'mathematik.flaechen.zerlegen': { jg: [5], quelle: `${LS5} · Flächen: rechtwinklige Dreiecke, Zerlegen und Ergänzen` },
  'mathematik.flaechen.umfang': { jg: [5], quelle: `${LS5} · Flächen: Umfang von Figuren` },
  'mathematik.flaechen.einheiten': { jg: [5], quelle: `${LS5} · Flächen: Flächeneinheiten` },

  'mathematik.koerper.netze': { jg: [5], quelle: `${LS5} · Körper: Netze von Quadern und Würfeln` },
  'mathematik.koerper.quader': { jg: [5], quelle: `${LS5} · Körper: Volumeneinheiten, Volumen eines Quaders` },
  'mathematik.koerper.ansichten': { jg: [5], quelle: `${LS5} · Körper: Körper und Netze, Schrägbilder` },
  'mathematik.koerper.raum': { jg: [5], quelle: `${LS5} · Körper: Körper und Netze` },

  'mathematik.brueche.bruchkreise': { jg: [5, 6], quelle: `${LS6} · Brüche: Bruch und Anteil, Brüche vergleichen (${BR5})` },
  'mathematik.brueche.bruchstreifen': { jg: [5, 6], quelle: `${LS6} · Brüche: Kürzen und Erweitern, Brüche vergleichen (${BR5})` },
  'mathematik.brueche.anteile': { jg: [5, 6], quelle: `${LS6} · Brüche: Bruch und Anteil (${BR5})` },
  'mathematik.brueche.anteilvom': { jg: [6], quelle: `${LS6} · Zahlen multiplizieren und dividieren: Brüche multiplizieren (Anteil eines Anteils)` },
  'mathematik.brueche.quotient': { jg: [5, 6], quelle: `${LS6} · Brüche: Brüche als Quotienten (${BR5})` },
  'mathematik.brueche.bruchstrahl': { jg: [5, 6], quelle: `${LS6} · Brüche: Brüche auf dem Zahlenstrahl (${BR5})` },
  'mathematik.brueche.erweitern': { jg: [5, 6], quelle: `${LS6} · Brüche: Kürzen und Erweitern (${BR5})` },
  'mathematik.brueche.kuerzen': { jg: [5, 6], quelle: `${LS6} · Brüche: Kürzen und Erweitern (${BR5})` },
  'mathematik.brueche.plus': { jg: [6], quelle: `${LS6} · Zahlen addieren und subtrahieren: Brüche addieren und subtrahieren` },
  'mathematik.brueche.minus': { jg: [6], quelle: `${LS6} · Zahlen addieren und subtrahieren: Brüche addieren und subtrahieren` },
  'mathematik.brueche.mal': { jg: [6], quelle: `${LS6} · Zahlen multiplizieren und dividieren: Brüche vervielfachen, Brüche multiplizieren` },
  'mathematik.brueche.durch': { jg: [6], quelle: `${LS6} · Zahlen multiplizieren und dividieren: Brüche teilen, durch Brüche dividieren` },
  'mathematik.brueche.hundertstel': { jg: [5, 6], quelle: `${LS6} · Brüche: Prozente (${BR5})` },
  'mathematik.brueche.teilberechnen': { jg: [5, 6], quelle: `${LS6} · Brüche: Bruchteil, Anteil und Ganzes berechnen (${BR5})` },
  'mathematik.brueche.ganzesberechnen': { jg: [5, 6], quelle: `${LS6} · Brüche: Bruchteil, Anteil und Ganzes berechnen (${BR5})` },

  'mathematik.dezimal.verstehen': { jg: [6], quelle: `${LS6} · Brüche in Dezimalschreibweise: Dezimalschreibweise, Dezimalzahlen vergleichen` },
  'mathematik.dezimal.bruchdezimal': { jg: [6], quelle: `${LS6} · Brüche in Dezimalschreibweise: abbrechende und periodische Dezimalzahlen` },
  'mathematik.dezimal.dreiformen': { jg: [6], quelle: `${LS6} · Brüche: Prozente · Brüche in Dezimalschreibweise` },
  'mathematik.dezimal.runden': { jg: [6], quelle: `${LS6} · Brüche in Dezimalschreibweise: Dezimalzahlen vergleichen und runden` },
  'mathematik.dezimal.plausibel': { jg: [6], quelle: `${LS6} · Brüche in Dezimalschreibweise: Dezimalschreibweise bei Größen` },
  'mathematik.dezimal.periode': { jg: [6], quelle: `${LS6} · Brüche in Dezimalschreibweise: abbrechende und periodische Dezimalzahlen` },

  'mathematik.rational.plusminus': { jg: [7], quelle: `${LS7} · Rechnen mit rationalen Zahlen: positive und negative Zahlen addieren und subtrahieren` },
  'mathematik.rational.vorzeichen': { jg: [7], quelle: `${LS7} · Rechnen mit rationalen Zahlen: Multiplizieren und Dividieren rationaler Zahlen` },
  'mathematik.rational.geschickt': { jg: [6, 7], quelle: `${LS6} · Geschicktes Rechnen mit Brüchen und Dezimalzahlen · ${LS7} · Rechenvorteile nutzen` },

  'mathematik.prozent.dreieck': { jg: [7], quelle: `${LS7} · Prozent- und Zinsrechnung: Prozentsätze, Prozentwerte, Grundwerte berechnen` },
  'mathematik.prozent.dreiformen': { jg: [6], quelle: `${LS6} · Brüche: Prozente · Brüche in Dezimalschreibweise` },

  'mathematik.zuordnungen.variablen': { jg: [6, 7], quelle: `${LS6} · Abhängigkeiten mit Termen beschreiben · ${LS7} · Terme mit einer Variablen, Zuordnungen mit Formeln` },
  'mathematik.zuordnungen.darstellungen': { jg: [7], quelle: `${LS7} · Zuordnungen: Zuordnungen darstellen und mit Formeln beschreiben` },
  'mathematik.zuordnungen.graphen': { jg: [6, 7], quelle: `${LS6} · Abhängigkeiten grafisch darstellen · ${LS7} · Zuordnungen darstellen` },
  'mathematik.zuordnungen.doppelskala': { jg: [6, 7], quelle: `${LS6} · Rechnen mit dem Dreisatz · ${LS7} · Proportionale Zuordnungen` },
  'mathematik.zuordnungen.antiprop': { jg: [7], quelle: `${LS7} · Zuordnungen: Antiproportionale Zuordnungen, Zuordnungstypen erkennen` },

  'mathematik.terme.muster': { jg: [6, 7], quelle: `${LS6} · Strukturen erkennen und fortsetzen · ${LS7} · Terme und Gleichungen: Gleichungen lösen` },

  'mathematik.zufall.versuche': { jg: [7, 8], quelle: `${LS7} · Wahrscheinlichkeit, Baumdiagramme und Pfadregel (${LS8} · Wiederholung; laut Curriculum in Kl. 8 verschiebbar)` },

  /* ---------- Deutsch (Kernlehrplan) ---------- */
  'deutsch.wortarten.untersuchen': { jg: [5, 6], quelle: `${KLP}: Wortarten unterscheiden` },
  'deutsch.wortarten.nomenprobe': { jg: [5, 6], quelle: `${KLP}: Rechtschreibstrategien, Wortarten (Nomen)` },
  'deutsch.wortarten.zeitformen': { jg: [5, 6], quelle: `${KLP}: Flexionsformen unterscheiden – Tempus` },
  'deutsch.wortarten.steigerung': { jg: [5, 6], quelle: `${KLP}: Flexionsformen unterscheiden – Komparation` },
  'deutsch.wortarten.pronomen': { jg: [5, 6], quelle: `${KLP}: Wortarten unterscheiden (Pronomen)` },

  'deutsch.satzbau.satzglieder': { jg: [5, 6], quelle: `${KLP}: Satzglieder (Subjekt, Prädikat, Objekt, Adverbial), Umstellprobe` },
  'deutsch.satzbau.wortbausteine': { jg: [5, 6], quelle: `${KLP}: Wortbildung (Derivation)` },
  'deutsch.satzbau.felder': { jg: [5, 6], quelle: `${KLP}: Strukturen von Sätzen, Hauptsatz und Nebensatz (Feldermodell selbst nicht genannt)` },
  'deutsch.satzbau.komposita': { jg: [5, 6], quelle: `${KLP}: Wortbildung (Komposition)` },
  'deutsch.satzbau.faelle': { jg: [5, 6], quelle: `${KLP}: Flexionsformen unterscheiden – Kasus` },

  'deutsch.satzzeichen.satzmelodie': { jg: [5, 6], quelle: `${KLP}: Satzarten (Aussage-, Frage-, Aufforderungssatz)` },
  'deutsch.satzzeichen.rede': { jg: [5, 6], quelle: `${KLP}: Zeichensetzung – wörtliche Rede` },
  'deutsch.satzzeichen.satzzug': { jg: [5, 6], quelle: `${KLP}: Satzgefüge, Zeichensetzung für einfache Satzstrukturen` },

  'deutsch.rechtschreibung.silbenhaus': { jg: [5, 6], quelle: `${KLP}: Rechtschreibstrategien – silbierendes Sprechen` },
  'deutsch.rechtschreibung.ableiten': { jg: [5, 6], quelle: `${KLP}: Rechtschreibstrategien – Verlängern, Ableiten` },
  'deutsch.rechtschreibung.dassdas': { jg: [5, 6], quelle: `${KLP}: Ersatzprobe, Satzgefüge (das/dass selbst nicht genannt)` },
  'deutsch.rechtschreibung.vokallaenge': { jg: [5, 6], quelle: `${KLP}: Rechtschreibstrategien – silbierendes Sprechen, Ausnahmeschreibung merken` },

  'deutsch.wortschatz.wortfeld': { jg: [5, 6], quelle: `${KLP}: Wörter in Wortfeldern und -familien einordnen` },
  'deutsch.wortschatz.oberbegriffe': { jg: [5, 6], quelle: `${KLP}: Wortbedeutungen ordnen (Ober-/Unterbegriffe selbst nicht genannt)` },

  'deutsch.lesen.textmapping': { jg: [5, 6], quelle: `${KLP}: Lesestrategien zielführend einsetzen` },

  'deutsch.schreiben.spannungsberg': { jg: [5, 6], quelle: `${KLP}: Erzählen mit Gestaltungsmitteln (Steigerung, Vorausdeutung, Pointierung)` },
  'deutsch.schreiben.argument': { jg: [5, 6, 7, 8], quelle: `${KLP}: Urteile begründen · KLP Deutsch, erste Stufe Sek I (hier Kl. 7–8): Positionen begründen` },
};

/** Jahrgänge einer Kachel oder (bei Ordnern) aller Kacheln darunter. */
export function jahrgaengeVon(pfad, knoten) {
  const schluessel = pfad.join('.');
  if (JAHRGAENGE[schluessel]) return JAHRGAENGE[schluessel].jg;
  if (!knoten?.kinder) return [];
  const s = new Set();
  knoten.kinder.forEach(k => jahrgaengeVon([...pfad, k.id], k).forEach(j => s.add(j)));
  return [...s].sort((a, b) => a - b);
}

/** „Kl. 5“, „Kl. 5–6“, „Kl. 5, 7“ */
export function jgText(jg) {
  if (!jg.length) return '';
  const zus = jg.every((j, i) => i === 0 || j === jg[i - 1] + 1);
  return `Kl. ${zus && jg.length > 1 ? `${jg[0]}–${jg.at(-1)}` : jg.join(', ')}`;
}
