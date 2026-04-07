import { useEffect, useState } from "react";
import jsPDF from "jspdf";

// ✅ H1+ — Resultaten + Foutenanalyse in PDF
// ✅ Aantal fouten + tijdstippen (statistiek)
// ✅ Meertalig + RTL + build‑proof


// ✅ H1+ — Resultaten + Foutenanalyse in PDF
// ✅ Aantal fouten + tijdstippen (statistiek)
// ✅ Meertalig + RTL + build‑proof


export default function App() {
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("welcome");
  const [step, setStep] = useState("welcome");
  const [candidateId, setCandidateId] = useState("");
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState([]); // ⬅️ foutenlog


  const [errors, setErrors] = useState([]); // ⬅️ foutenlog


  const COLORS = ["red", "blue", "green", "yellow"];
  const TEST_DURATION = 240;

  const T = {
    nl: {
      welcome: "Welkom bij de Focus Test",
      intro: "Voer je kandidaat‑ID in om te starten.",
      candidateId: "Kandidaat ID",
      start: "Start",
      click: "Klik de KLEUR van het woord",
      score: "Score",
      errors: "Fouten",
      errorStats: "Foutenstatistiek",
      errors: "Fouten",
      errorStats: "Foutenstatistiek",
      result: "Testresultaat",
      interpretation: "Interpretatie",
      excellent: "Uitstekende concentratie",
      good: "Goede focus",
      average: "Matige focus",
      weak: "Zwak resultaat",
      export: "PDF exporteren",
      backLang: "Terug naar taalkeuze",
      backLang: "Terug naar taalkeuze",
      report: "Focus Test Rapport",
      date: "Datum",
      time: "Tijd (s)",
      color: "Kleur",
      time: "Tijd (s)",
      color: "Kleur",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    }
  };

  const L = language ? T[language] : {};
  const isRTL = language === "ar";

  useEffect(() => {
    if (step !== "test") return;
    if (timer >= TEST_DURATION) {
      setStep("result");
      return;
    }
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const nextRound = () => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWord(w);
    setColor(c);
  };

  const startTest = () => {
    if (!candidateId) return;
    setScore(0);
    setErrors([]);
    setErrors([]);
    setTimer(0);
    nextRound();
    setStep("test");
  };

  const answer = (c) => {
    if (c === color) {
      setScore(s => s + 1);
    } else {
      setErrors(e => [...e, { time: timer, chosen: c, correct: color }]);
    }
    if (c === color) {
      setScore(s => s + 1);
    } else {
      setErrors(e => [...e, { time: timer, chosen: c, correct: color }]);
    }
    nextRound();
  };

  const accuracy = () => {
    const total = score + errors.length;
    if (total === 0) return 0;
    return Math.round((score / total) * 100);
  };
  const accuracy = () => {
    const total = score + errors.length;
    if (total === 0) return 0;
    return Math.round((score / total) * 100);
  };
  const interpretationText = () => {
    const a = accuracy();
    if (a >= 85) return L.excellent;
    if (a >= 70) return L.good;
    if (a >= 50) return L.average;
    return L.weak;
  };

  const exportPDF = () => {
    const pdf = new jsPDF();


    // Titel


    // Titel
    pdf.setFontSize(18);
    pdf.text(L.report, 14, 20);


    // Metadata


    // Metadata
    pdf.setFontSize(11);
    pdf.text(`${L.candidateId}: ${candidateId}`, 14, 32);
    pdf.text(`${L.date}: ${new Date().toLocaleDateString()}`, 14, 40);


    // Resultaat


    // Resultaat
    pdf.setFontSize(12);
    pdf.text(`${L.score}: ${accuracy()}%`, 14, 55);
    pdf.text(`${L.errors}: ${errors.length}`, 14, 63);
    pdf.text(`${L.interpretation}:`, 14, 73);
    pdf.text(interpretationText(), 14, 83, { maxWidth: 180 });


    // Foutenstatistiek
    if (errors.length > 0) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text(L.errorStats, 14, 20);


      pdf.setFontSize(10);
      let y = 32;
      pdf.text(`${L.time} | ${L.color}`, 14, y);
      y += 6;


      errors.forEach(err => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(`${err.time}s | ${L.colors[err.chosen]} → ${L.colors[err.correct]}`, 14, y);
    pdf.text(`${L.score}: ${accuracy()}%`, 14, 55);
        y += 6;
    pdf.text(`${L.errors}: ${errors.length}`, 14, 63);
      });
    pdf.text(`${L.interpretation}:`, 14, 73);
    }
    pdf.text(interpretationText(), 14, 83, { maxWidth: 180 });




    // Foutenstatistiek
    if (errors.length > 0) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text(L.errorStats, 14, 20);


      pdf.setFontSize(10);
      let y = 32;
      pdf.text(`${L.time} | ${L.color}`, 14, y);
      y += 6;


      errors.forEach(err => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(`${err.time}s | ${L.colors[err.chosen]} → ${L.colors[err.correct]}`, 14, y);
        y += 6;
      });
    }


    pdf.save(`focus-test-${candidateId || "result"}.pdf`);
  };

  return (
    <div style={styles.page} dir={isRTL ? "rtl" : "ltr"}>
      <div style={styles.card}>

        {step === "welcome" && (
          <div style={styles.center}>
            <h1>Focus Test</h1>
            <button style={styles.primary} onClick={() => { setLanguage("nl"); setStep("menu"); }}>Start</button>
            <h1>Focus Test</h1>
            <button style={styles.primary} onClick={() => { setLanguage("nl"); setStep("menu"); }}>Start</button>
          </div>
        )}

        {step === "menu" && (
          <>
            <p>{L.intro}</p>
            <p>{L.intro}</p>
            <input style={styles.input} value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder={L.candidateId} />
            <button style={styles.primary} onClick={startTest}>{L.start}</button>
          </>
        )}

        {step === "test" && (
          <div style={styles.center}>
            <p>⏱ {timer}s</p>
            <p>⏱ {timer}s</p>
            <h2 style={{ ...styles.word, color }}>{L.colors[word]}</h2>
            <p>{L.click}</p>
            <p>{L.click}</p>
            <div style={styles.grid}>
              {COLORS.map(c => (
                <button key={c} style={styles.secondary} onClick={() => answer(c)}>{L.colors[c]}</button>
              ))}
            </div>
          </div>
        )}

        {step === "result" && (
          <div style={styles.center}>
            <h1>{L.result}</h1>
            <p>{L.score}: {accuracy()}%</p>
            <p>{L.errors}: {errors.length}</p>
            <p>{interpretationText()}</p>
            <button style={styles.primary} onClick={exportPDF}>{L.export}</button>
            <button style={styles.secondary} onClick={() => { setLanguage(null); setStep("welcome"); }}>{L.backLang}</button>
            <h1>{L.result}</h1>
            <p>{L.score}: {accuracy()}%</p>
            <p>{L.errors}: {errors.length}</p>
            <p>{interpretationText()}</p>
            <button style={styles.primary} onClick={exportPDF}>{L.export}</button>
            <button style={styles.secondary} onClick={() => { setLanguage(null); setStep("welcome"); }}>{L.backLang}</button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#020617", display: "flex", justifyContent: "center", alignItems: "center" },
  card: { background: "#020617", color: "#e5e7eb", padding: 32, width: 420 },
  center: { textAlign: "center" },
  primary: { width: "100%", padding: 12, marginBott  secondary: { width: "100%", padding: 12, marginBottom: 12, border: "1px solid #334155", background: "transparent", color: "#c7d2fe" },
  grid:  word:};

  
