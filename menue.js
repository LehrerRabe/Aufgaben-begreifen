/* Menüstruktur. Neue Bereiche einfach hier ergänzen:
   - Knoten mit "kinder" werden als Kachel-Menü gezeigt
   - Knoten mit "modul" öffnen die Aufgabenwahl für eine Rechenart */

export const MENUE = {
  id: '',
  titel: 'Aufgaben be-greifen',
  text: 'Was möchtest du heute begreifen?',
  kinder: [
    {
      id: 'mathematik',
      titel: 'Mathematik',
      text: 'Rechnen mit Material, das man anfassen kann',
      bild: 'mathematik',
      farbe: '#ff7a3d',
      kinder: [
        {
          id: 'kopfrechnen',
          titel: 'Kopfrechnen',
          text: 'Plus und Minus mit Abakus, kleines Einmaleins',
          bild: 'kopf-ordner',
          farbe: '#13a39b',
          kinder: [
            { id: 'plusminus', titel: 'Plus und Minus', text: 'Im Kopf – mit freiem Abakus als Hilfe', bild: 'kopfplus', farbe: '#2fae58', modul: 'kopfplus' },
            { id: 'einmaleins', titel: 'Kleines Einmaleins', text: 'Mal und Geteilt – mit Punktefeld', bild: 'kopfmal', farbe: '#2f6fe4', modul: 'kopfmal' },
          ],
        },
        {
          id: 'verstehen',
          titel: 'Rechnen verstehen',
          text: 'Teilen, Rechengeschichten, Unterschied, Überschlag',
          bild: 'verstehen-ordner',
          farbe: '#6b54e0',
          kinder: [
            { id: 'teilen', titel: 'Was heißt Teilen?', text: 'Verteilen und Aufteilen mit Rest', bild: 'teilen', farbe: '#f07d2a', modul: 'teilen' },
            { id: 'streifen', titel: 'Rechengeschichten', text: 'Geschichte – Streifenbild – Rechnung', bild: 'streifen', farbe: '#2f6fe4', modul: 'streifen' },
            { id: 'unterschied', titel: 'Unterschied finden', text: 'Vergleichen und Ergänzen', bild: 'unterschied', farbe: '#16a974', modul: 'unterschied' },
            { id: 'ueberschlag', titel: 'Überschlagen', text: 'Kann das Ergebnis stimmen?', bild: 'ueberschlag', farbe: '#e0457b', modul: 'ueberschlag' },
          ],
        },
        {
          id: 'stellenwerte',
          titel: 'Stellenwerte',
          text: 'Abakus, Stellenwerttafel, Zahlenstrahl',
          bild: 'stellen-ordner',
          farbe: '#d6336c',
          kinder: [
            { id: 'abakus', titel: 'Abakus', text: 'Über die Zehn: tauschen und entbündeln', bild: 'abakus', farbe: '#2fae58', modul: 'abakus' },
            { id: 'stellenwerttafel', titel: 'Stellenwerttafel', text: 'Legen, lesen, bündeln, umrechnen', bild: 'stellentafel', farbe: '#2f6fe4', modul: 'stellenwerttafel' },
            { id: 'einheitentafel', titel: 'Größen in der Tafel', text: 'Umrechnen mit der Einheitentafel', bild: 'einheitentafel', farbe: '#8a4bd6', modul: 'einheitentafel' },
            { id: 'schrittstrahl', titel: 'Zahlenstrahl: Schritte', text: 'Springen, Lücken, eintragen', bild: 'schrittstrahl', farbe: '#f07d2a', modul: 'schrittstrahl' },
          ],
        },
        {
          id: 'groessen',
          titel: 'Zahlen und Größen',
          text: 'Große Zahlen, Größen schätzen, Uhr, Geld und Daten',
          bild: 'groessen-ordner',
          farbe: '#18a0c9',
          kinder: [
            { id: 'rechenrahmen', titel: 'Rechenrahmen', text: 'Große Zahlen legen, lesen, runden', bild: 'rechenrahmen', farbe: '#2fae58', modul: 'rechenrahmen' },
            { id: 'zahlenstrahl', titel: 'Zahlenstrahl mit Lupe', text: 'Zahlen suchen und ablesen', bild: 'zahlenstrahl', farbe: '#2f6fe4', modul: 'zahlenstrahl' },
            { id: 'umtauschen', titel: 'Größen umtauschen', text: 'Länge, Masse, Zeit, Geld', bild: 'umtauschen', farbe: '#8a4bd6', modul: 'umtauschen' },
            { id: 'geld', titel: 'Rechnen mit Geld', text: 'Beträge legen, Wechselgeld', bild: 'geld', farbe: '#16a974', modul: 'geld' },
            { id: 'schaetzen', titel: 'Größen schätzen', text: 'Mit Stützpunkten und Balkenwaage', bild: 'schaetzen', farbe: '#d6336c', modul: 'schaetzen' },
            { id: 'uhr', titel: 'Uhr und Zeitspannen', text: 'Uhr stellen, lesen, Zeit berechnen', bild: 'uhr', farbe: '#13a39b', modul: 'uhr' },
            { id: 'diagramm', titel: 'Daten darstellen', text: 'Strichliste und Säulendiagramm', bild: 'diagramm', farbe: '#f07d2a', modul: 'diagramm' },
          ],
        },
        {
          id: 'schriftlich',
          titel: 'Schriftliches Rechnen',
          text: 'Plus, Minus, Mal und Geteilt mit Perlen und Plättchen',
          bild: 'schriftlich',
          farbe: '#7a5cff',
          kinder: [
            { id: 'addition', titel: 'Addieren', text: 'Zusammenlegen und umtauschen', bild: 'addition', farbe: '#16a974', modul: 'addition' },
            { id: 'subtraktion', titel: 'Subtrahieren', text: 'Wegnehmen und entbündeln', bild: 'subtraktion', farbe: '#f0506e', modul: 'subtraktion' },
            { id: 'multiplikation', titel: 'Multiplizieren', text: 'Mit dem Schachbrett', bild: 'multiplikation', farbe: '#2f7bf5', modul: 'multiplikation' },
            { id: 'division', titel: 'Dividieren', text: 'Gerecht verteilen', bild: 'division', farbe: '#f29a12', modul: 'division' },
          ],
        },
        {
          id: 'teiler',
          titel: 'Rechnen mit natürlichen Zahlen',
          text: 'Teiler, Primzahlen, Rechengesetze und Potenzen',
          bild: 'teiler-ordner',
          farbe: '#0f9d8a',
          kinder: [
            { id: 'steckbrett', titel: 'Teiler finden', text: 'Perlen in gleich lange Reihen stecken', bild: 'steckbrett', farbe: '#2f7bf5', modul: 'teiler' },
            { id: 'sieb', titel: 'Primzahlsieb', text: 'Vielfache streichen, Primzahlen finden', bild: 'sieb', farbe: '#8a4bd6', modul: 'sieb' },
            { id: 'primbaum', titel: 'Primfaktor-Baum', text: 'Zahlen in Primzahlen zerlegen', bild: 'primbaum', farbe: '#e0457b', modul: 'primbaum' },
            { id: 'gesetze', titel: 'Rechengesetze', text: 'Vertauschen, zerlegen, zusammenfassen', bild: 'gesetze', farbe: '#16a974', modul: 'gesetze' },
            { id: 'potenzen', titel: 'Quadrat- und Kubikzahlen', text: 'Perlenketten falten und stapeln', bild: 'potenzen', farbe: '#f29a12', modul: 'potenzen' },
          ],
        },
        {
          id: 'symmetrie',
          titel: 'Symmetrie und Figuren',
          text: 'Spiegeln, Vierecke, Dreiecke, Koordinaten',
          bild: 'symmetrie-ordner',
          farbe: '#2b4bb5',
          kinder: [
            { id: 'spiegel', titel: 'Spiegelbrett', text: 'Muster an einer Achse spiegeln', bild: 'spiegel', farbe: '#e0457b', modul: 'spiegel' },
            { id: 'vierecke', titel: 'Vierecke formen', text: 'Stäbe ziehen, Vierecke erkennen', bild: 'vierecke', farbe: '#16a974', modul: 'vierecke' },
            { id: 'koordinaten', titel: 'Koordinaten-Steckbrett', text: 'Punkte stecken, ablesen, verschieben', bild: 'koordinaten', farbe: '#f29a12', modul: 'koordinaten' },
            { id: 'dreiecke', titel: 'Dreiecke und Geraden', text: 'Besondere Dreiecke, parallel, senkrecht', bild: 'dreiecke', farbe: '#7a3cc2', modul: 'dreiecke' },
          ],
        },
        {
          id: 'flaechen',
          titel: 'Flächen und Umfang',
          text: 'Auslegen, zerlegen, Schnur legen',
          bild: 'flaechen-ordner',
          farbe: '#e8890c',
          kinder: [
            { id: 'auslegen', titel: 'Flächen auslegen', text: 'Mit Quadraten auslegen: A = a · b', bild: 'auslegen', farbe: '#f2b72e', modul: 'auslegen' },
            { id: 'zerlegen', titel: 'Zerlegen und Ergänzen', text: 'Dreiecke und zusammengesetzte Figuren', bild: 'zerlegen', farbe: '#e0457b', modul: 'zerlegen' },
            { id: 'umfang', titel: 'Umfang mit der Schnur', text: 'Herumlegen und gerade ziehen', bild: 'umfang', farbe: '#2f6fe4', modul: 'umfang' },
            { id: 'einheiten', titel: 'Flächeneinheiten', text: 'Mit der Lupe: 1 dm² = 100 cm²', bild: 'einheiten', farbe: '#16a974', modul: 'einheiten' },
          ],
        },
        {
          id: 'koerper',
          titel: 'Körper und Volumen',
          text: 'Würfelnetze, Quader, Ansichten, Raumvorstellung',
          bild: 'koerper-ordner',
          farbe: '#7a3cc2',
          kinder: [
            { id: 'netze', titel: 'Würfelnetze', text: 'Netze legen und falten', bild: 'netze', farbe: '#f29a12', modul: 'netze' },
            { id: 'quader', titel: 'Quader füllen', text: 'Volumen mit Würfeln: V = a · b · c', bild: 'quader', farbe: '#e0457b', modul: 'quader' },
            { id: 'ansichten', titel: 'Würfelbauten', text: 'Von vorne, von der Seite, von oben', bild: 'ansichten', farbe: '#2f6fe4', modul: 'ansichten' },
            { id: 'raum', titel: 'Raumvorstellung', text: 'Würfel kippen, Bauplan, Körper erkennen', bild: 'raum', farbe: '#e8890c', modul: 'raum' },
          ],
        },
        {
          id: 'brueche',
          titel: 'Brüche',
          text: 'Teile sehen, verteilen, Zahlenstrahl, erweitern',
          bild: 'brueche-ordner',
          farbe: '#d6336c',
          kinder: [
            { id: 'bruchkreise', titel: 'Bruchkreise', text: 'Legen und vergleichen', bild: 'bruchkreise', farbe: '#e0262b', modul: 'bruchkreise' },
            { id: 'bruchstreifen', titel: 'Bruchstreifen', text: 'Gleich viel – anders geteilt', bild: 'bruchstreifen', farbe: '#2f6fe4', modul: 'bruchstreifen' },
            { id: 'anteile', titel: 'Welcher Anteil?', text: 'Felder, Streifen oder Kreis', bild: 'anteile', farbe: '#7a3cc2', modul: 'anteilwelcher' },
            { id: 'anteilvom', titel: 'Anteil vom Anteil', text: '½ von ⅓ – ein Teil vom Teil', bild: 'anteile-vom', farbe: '#5b3cc2', modul: 'anteilvom' },
            { id: 'quotient', titel: 'Bruch als Quotient', text: '3 Pizzen für 4 Kinder: 3 : 4 = ¾', bild: 'bruch-quotient', farbe: '#d97706', modul: 'bruchquotient' },
            { id: 'bruchstrahl', titel: 'Brüche am Zahlenstrahl', text: 'Ablesen, eintragen, Lücken füllen', bild: 'bruch-strahl', farbe: '#0e7490', modul: 'bruchstrahl' },
            { id: 'erweitern', titel: 'Erweitern', text: 'Mit dem Messer feiner schneiden', bild: 'erweitern', farbe: '#c2410c', modul: 'erweitern' },
            { id: 'kuerzen', titel: 'Kürzen', text: 'Mit dem Kleber gröber machen', bild: 'kuerzen', farbe: '#0f766e', modul: 'kuerzen' },
            { id: 'teilberechnen', titel: 'Teil berechnen', text: '¾ von 24 € – über ein Stück', bild: 'teil-berechnen', farbe: '#b8327a', modul: 'teilberechnen' },
            { id: 'ganzesberechnen', titel: 'Ganzes berechnen', text: '⅖ sind 12 – wie viel ist das Ganze?', bild: 'ganzes-berechnen', farbe: '#a2337f', modul: 'ganzesberechnen' },
          ],
        },
        {
          id: 'rational',
          titel: 'Rationale Zahlen',
          text: 'Malnehmen und Teilen mit Vorzeichen',
          bild: 'rational-ordner',
          farbe: '#c2410c',
          kinder: [
            { id: 'vorzeichen', titel: 'Mal und Geteilt mit Vorzeichen', text: 'Muster, Zahlenstrahl, Vorzeichen-Detektiv', bild: 'vorzeichen', farbe: '#2f6fe4', modul: 'vorzeichen' },
          ],
        },
        {
          id: 'prozent',
          titel: 'Prozentrechnung',
          text: 'Prozentwert, Grundwert, Prozentsatz',
          bild: 'prozent-ordner',
          farbe: '#0e9f6e',
          kinder: [
            { id: 'dreieck', titel: 'Prozent-Dreieck', text: 'W, G oder p % – abdecken, einsetzen, rechnen', bild: 'prozent-dreieck', farbe: '#0e9f6e', modul: 'prozent' },
          ],
        },
      ],
    },
    {
      id: 'deutsch',
      titel: 'Deutsch',
      text: 'Sprache untersuchen und Wörter sortieren',
      bild: 'deutsch',
      farbe: '#e0457b',
      kinder: [
        {
          id: 'wortarten',
          titel: 'Wortarten',
          text: 'Nomen, Verben, Adjektive und mehr erkennen',
          bild: 'wortarten-ordner',
          farbe: '#13a39b',
          kinder: [
            { id: 'untersuchen', titel: 'Wortarten untersuchen', text: 'Symbole über die Wörter legen', bild: 'wortarten', farbe: '#2b4bb5', modul: 'wortarten' },
            { id: 'nomenprobe', titel: 'Groß oder klein?', text: 'Die Nomenprobe', bild: 'nomenprobe', farbe: '#e0457b', modul: 'nomenprobe' },
          ],
        },
        {
          id: 'satzbau',
          titel: 'Sätze und Wörter',
          text: 'Satzglieder und Wortbausteine',
          bild: 'satzbau-ordner',
          farbe: '#f07d2a',
          kinder: [
            { id: 'satzglieder', titel: 'Satzglieder', text: 'Umstellen und bestimmen', bild: 'satzglieder', farbe: '#2b4bb5', modul: 'satzglieder' },
            { id: 'wortbausteine', titel: 'Wortbausteine', text: 'Vorsilbe, Stamm, Endung', bild: 'wortbausteine', farbe: '#13a39b', modul: 'wortbausteine' },
          ],
        },
      ],
    },
  ],
};

/** Knoten zu einem Pfad wie ['mathematik', 'schriftlich']. Liefert die Kette aller Knoten. */
export function kette(pfad) {
  const k = [MENUE];
  let knoten = MENUE;
  for (const id of pfad) {
    const kind = (knoten.kinder || []).find(x => x.id === id);
    if (!kind) return null;
    k.push(kind);
    knoten = kind;
  }
  return k;
}
