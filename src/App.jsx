import { useEffect, useState } from "react";
import jsPDF from "jspdf";

// ✅ MINIMALE, GEGARANDEERD BUILD‑PROOF App.jsx (Vite + React 18)
// ✅ Welkom → Menu → Test → Resultaat → PDF
// ✅ Opzettelijk eenvoudig gehouden om elke syntaxfout te vermijden


export default function App() {
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result
  const [candidateId, setCandidateId] = useState("");
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);

  const COLORS = ["red", "blue", "green", "yellow"];
  const TEST_DURATION = 60; // korter om te testen
  const T = {
    nl: {
      welcome: "Welkom bij de Focus Test",
      intro: "Voer je kandidaat-ID in om te starten.",
      candidateId: "Kandidaat ID",
      start: "Start",
      click: "Klik de KLEUR van het woord",
      score: "Score",
      result: "Resultaat",
      export: "PDF exporteren",
      restart: "Opnieuw",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    },
    en: {
      welcome: "Welcome to the Focus Test",
      intro: "Enter your candidate ID to start.",
      candidateId: "Candidate ID",
      start: "Start",
      click: "Click the COLOR of the word",
      score: "Score",
      result: "Result",
      export: "Export PDF",
      restart: "Restart",
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
    const i = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(i);
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
    setTimer(0);
    nextRound();
    setStep("test");
  };

  const answer = (c) => {
    if (c === color) setScore(s => s + 1);
    nextRound();
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.text(L.result, 10, 20);
    pdf.text(`${L.score}: ${score}`, 10, 30);
    pdf.save(`focus-${candidateId || "result"}.pdf`);
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      {step === "welcome" && (
        <div>
          <button onClick={() => { setLanguage("nl"); setStep("menu"); }}>NL</button>
          <button onClick={() => { setLanguage("en"); setStep("menu"); }}>EN</button>
        </div>
      )}

      {step === "menu" && (
        <div>
          <h1>{L.welcome}</h1>
          <p>{L.intro}</p>
          <input value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder={L.candidateId} />
          <button onClick={startTest}>{L.start}</button>
        </div>
      )}

      {step === "test" && (
        <div>
          <p>{timer}s</p>
          <h2 style={{ color }}>{L.colors[word]}</h2>
          <p>{L.click}</p>
          {COLORS.map(c => (
            <button key={c} onClick={() => answer(c)}>{L.colors[c]}</button>
          ))}
        </div>
      )}

      {step === "result" && (
        <div>
          <h1>{L.result}</h1>
          <p>{L.score}: {score}</p>
          <button onClick={exportPDF}>{L.export}</button>
          <button onClick={() => setStep("menu")}>{L.restart}</button>
        </div>
      )}
    </div>
  );
}
