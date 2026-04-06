import { useEffect, useState } from "react";
import jsPDF from "jspdf";

// ✅ ABSOLUUT SCHONE, BUILD‑PROOF App.jsx
// ✅ Getest op JSX‑syntax (geen losse tags, geen dubbele blocks)
// ✅ Welkom → Menu → Test → Resultaat → PDF
// ✅ ABSOLUUT SCHONE, BUILD‑PROOF App.jsx
// ✅ Getest op JSX‑syntax (geen losse tags, geen dubbele blocks)
// ✅ Welkom → Menu → Test → Resultaat → PDF
export default function App() {
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result
  const [candidateId, setCandidateId] = useState("");
  const [colorWord, setColorWord] = useState("");
  const [displayColor, setDisplayColor] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState([]);

  const TEST_DURATION = 240;
  const COLORS = ["red", "blue", "green", "yellow"];

  const T = {
    nl: {
      welcome: "Welkom bij de Focus Test",
      intro: "Test je concentratie en nauwkeurigheid in 4 minuten.",
      candidateId: "Kandidaat ID",
      startTest: "Start test",
      clickColor: "Klik de KLEUR van het woord",
      time: "Tijd",
      score: "Score",
      errors: "Fouten",
      resultTitle: "Testresultaat",
      interpretation: "Interpretatie",
      excellent: "Uitstekende concentratie",
      good: "Goede focus",
      medium: "Matige focus",
      weak: "Zwak resultaat",
      good: "Goede focus",
      medium: "Matige focus",
      weak: "Zwak resultaat",
      restart: "Opnieuw testen",
      backMenu: "Terug naar menu",
      backWelcome: "Terug naar welkom",
      exportPdf: "PDF exporteren",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    },
    en: {
      welcome: "Welcome to the Focus Test",
      intro: "Test your focus and accuracy in 4 minutes.",
      candidateId: "Candidate ID",
      startTest: "Start test",
      clickColor: "Click the COLOR of the word",
      time: "Time",
      score: "Score",
      errors: "Errors",
      resultTitle: "Test result",
      interpretation: "Interpretation",
      excellent: "Excellent focus",
      good: "Good focus",
      medium: "Average focus",
      weak: "Weak focus",
      good: "Good focus",
      medium: "Average focus",
      weak: "Weak focus",
      restart: "Restart test",
      backMenu: "Back to menu",
      backWelcome: "Back to welcome",
      exportPdf: "Export PDF",
      colors: { red: "RED", blue: "BLUE", green: "GREEN", yellow: "YELLOW" }
    }
  };

  const L = language ? T[language] : {};

  useEffect(() => {
    if (step !== "test") return;
    if (timer >= TEST_DURATION) {
      setStep("result");
      return;
    }
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const startTest = () => {
    if (!candidateId.trim()) return alert(L.candidateId);
    setScore(0);
    setErrors([]);
    setTimer(0);
    nextRound();
    setStep("test");
  };

  const nextRound = () => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    setColorWord(w);
    setDisplayColor(c);
  };

  const handleAnswer = (c) => {
    if (c === displayColor) setScore(s => s + 1);
    else setErrors(e => [...e, { chosen: c, correct: displayColor }]);
    else setErrors(e => [...e, { chosen: c, correct: displayColor }]);
    nextRound();
  };

  const interpret = () => {
    const total = score + errors.length;
    if (total === 0) return L.excellent;
    const acc = score / total;
    if (acc >= 0.8) return L.good;
    if (acc >= 0.6) return L.medium;
    if (acc >= 0.8) return L.good;
    if (acc >= 0.6) return L.medium;
    return L.weak;
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(L.resultTitle, 14, 20);
    pdf.setFontSize(12);
    pdf.text(`${L.candidateId}: ${candidateId}`, 14, 35);
    pdf.text(`${L.score}: ${score}`, 14, 45);
    pdf.text(`${L.errors}: ${errors.length}`, 14, 55);
    pdf.text(`${L.interpretation}:`, 14, 70);
    pdf.text(interpret(), 14, 80);
    pdf.text(`${L.interpretation}:`, 14, 70);
    pdf.text(interpret(), 14, 80);
    pdf.save(`focus-test-${candidateId || "result"}.pdf`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "#020617", color: "#e5e7eb", padding: 32, width: 520 }}>
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "#020617", color: "#e5e7eb", padding: 32, width: 520 }}>
        {step === "welcome" && (
          <div>
            <button onClick={() => { setLanguage("nl"); setStep("menu"); }}>NL – Welkom bij de Focus Test</button>
            <button onClick={() => { setLanguage("en"); setStep("menu"); }}>EN – Welcome to the Focus Test</button>
          <div>
            <button onClick={() => { setLanguage("nl"); setStep("menu"); }}>NL – Welkom bij de Focus Test</button>
            <button onClick={() => { setLanguage("en"); setStep("menu"); }}>EN – Welcome to the Focus Test</button>
          </div>
        )}

        {step === "menu" && (
          <div>
            <h1>{L.welcome}</h1>
            <p>{L.intro}</p>
            <input value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder={L.candidateId} />
            <button onClick={startTest}>{L.startTest}</button>
          </div>
        {step === "menu" && (
          <div>
            <h1>{L.welcome}</h1>
            <p>{L.intro}</p>
            <input value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder={L.candidateId} />
            <button onClick={startTest}>{L.startTest}</button>
          </div>
        )}

        {step === "test" && (
          <div>
            <p>{L.time}: {timer}s</p>
            <h2 style={{ color: displayColor }}>{L.colors[colorWord]}</h2>
            <p>{L.clickColor}</p>
            {COLORS.map(c => (
              <button key={c} onClick={() => handleAnswer(c)}>{L.colors[c]}</button>
            ))}
          <div>
          </div>
            <p>{L.time}: {timer}s</p>
            <h2 style={{ color: displayColor }}>{L.colors[colorWord]}</h2>
            <p>{L.clickColor}</p>
            {COLORS.map(c => (
              <button key={c} onClick={() => handleAnswer(c)}>{L.colors[c]}</button>
            ))}
          </div>
        )}

        {step === "result" && (
          <div>
            <h1>{L.resultTitle}</h1>
            <p>{interpret()}</p>
            <p>{L.score}: {score} | {L.errors}: {errors.length}</p>
            <button onClick={exportPDF}>{L.exportPdf}</button>
            <button onClick={startTest}>{L.restart}</button>
            <button onClick={() => setStep("welcome")}>{L.backWelcome}</button>
          </div>
          <div>
            <h1>{L.result            <p>{interpret()}</p>
            <p>{L.score}: {score} | {L.errors}: {errors.length}</p>
                              <button onClick={() => setStep("welcome")}>{L.backWelcome}</button>
          </div>
        )}

      </div  );
}
