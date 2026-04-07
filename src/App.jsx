import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";

// ✅ STABIELE, OPSCHOONGEMAAKTE VERSIE
// ✅ Reactietijd per antwoord
// ✅ Segmentatie (0–120s / 120–240s)
// ✅ Fouten + tijden in PDF
// ✅ Build‑proof (Vite / Netlify / esbuild)
// ✅ STABIELE, OPSCHOONGEMAAKTE VERSIE
// ✅ Reactietijd per antwoord
// ✅ Segmentatie (0–120s / 120–240s)
// ✅ Fouten + tijden in PDF
// ✅ Build‑proof (Vite / Netlify / esbuild)
export default function App() {
  const TEST_DURATION = 240; // seconden
  const HALF = TEST_DURATION / 2;
  const COLORS = ["red", "blue", "green", "yellow"]

  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result
  const [candidateId, setCandidateId] = useState("");
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [timer, setTimer] = useState(0);
  const [responses, setResponses] = useState([]); // ⬅️ alle antwoorden
  const roundStart = useRef(0);
  const T = {
    nl: {
      welcome: "Welkom bij de Focus Test",
      intro: "Voer je kandidaat-ID in om te starten.",
      start: "Start",
      result: "Testresultaat",
      backLang: "Terug naar taalkeuze",
      export: "PDF exporteren",
      score: "Score",
      errors: "Fouten",
      rt: "Reactietijd (ms)",
      segment: "Segmentanalyse",
      first: "Eerste helft (0–120s)",
      second: "Tweede helft (120–240s)",
      export: "PDF exporteren",
      score: "Score",
      errors: "Fouten",
      rt: "Reactietijd (ms)",
      segment: "Segmentanalyse",
      first: "Eerste helft (0–120s)",
      second: "Tweede helft (120–240s)",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    }
  };

  const L = language ? T[language] : {};

  // ⏱️ timer
  // ⏱️ timer
  useEffect(() => {
    if (step !== "test") return;
    if (timer >= TEST_DURATION) {
      setStep("result");
      return;
    }
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const nextRound = () => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWord(w);
    setColor(c);
    roundStart.current = performance.now();
    roundStart.current = performance.now();
  };

  const startTest = () => {
    setCandidateId(candidateId.trim());
    setResponses([]);
    setCandidateId(candidateId.trim());
    setResponses([]);
    setTimer(0);
    nextRound();
    setStep("test");
  };

  const answer = chosen => {
    const rt = Math.round(performance.now() - roundStart.current);
    setResponses(r => [...r, {
      t: timer,
      reactionTime: rt,
      correct: chosen === color
    }]);

    nextRound();
  };

  const stats = segment => {
    const seg = responses.filter(r => segment === 1 ? r.t < HALF : r.t >= HALF);
    if (seg.length === 0) return { avgRT: 0, errors: 0, acc: 0 };
    const avgRT = Math.round(seg.reduce((s, r) => s + r.reactionTime, 0) / seg.length);
    const errors = seg.filter(r => !r.correct).length;
    const acc = Math.round(((seg.length - errors) / seg.length) * 100);
    return { avgRT, errors, acc };
  };

  const overall = stats(1);
  const second = stats(2);


  const exportPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Focus Test Rapport", 14, 20)
    pdf.setFontSize(12);
    pdf.text(`${L.score}: ${overall.acc}%`, 14, 35);
    pdf.text(`${L.rt}: ${overall.avgRT} ms`, 14, 45);
    pdf.text(`${L.errors}: ${overall.errors}`, 14, 55);
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text(L.segment, 14, 20);
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text(L.segment, 14, 20);
    pdf.setFontSize(12);
    pdf.text(L.first, 14, 35);
    pdf.text(`RT: ${overall.avgRT} ms | Fouten: ${overall.errors} | Acc: ${overall.acc}%`, 14, 45);
    pdf.text(L.first, 14, 35);
    pdf.text(`RT: ${overall.avgRT} ms | Fouten: ${overall.errors} | Acc: ${overall.acc}%`, 14, 45);
    pdf.text(L.second, 14, 65);
    pdf.text(`RT: ${second.avgRT} ms | Fouten: ${second.errors} | Acc: ${second.acc}%`, 14, 75);
    pdf.text(L.second, 14, 65);
    pdf.text(`RT: ${second.avgRT} ms | Fouten: ${second.errors} | Acc: ${second.acc}%`, 14, 75);
    pdf.save(`focus-${candidateId || "result"}.pdf`);
    pdf.save(`focus-${candidateId || "result"}.pdf`);
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      {step === "welcome" && (
        <div>
          <h1>Focus Test</h1>
          <button onClick={() => { setLanguage("nl"); setStep("menu"); }}>Start</button>
        </div>
      )}
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      {step === "welcome" && (
        <div>
          <h1>Focus Test</h1>
          <button onClick={() => { setLanguage("nl"); setStep("menu"); }}>Start</button>
        </div>
      )}
      {step === "menu" && (
        <div>
          <p>{L.intro}</p>
          <input value={candidateId} onChange={e => setCandidateId(e.target.value)} />
          <button onClick={startTest}>{L.start}</button>
        </div>
      )}
      {step === "menu" && (
        <div>
          <p>{L.intro}</p>
          <input value={candidateId} onChange={e => setCandidateId(e.target.value)} />
          <button onClick={startTest}>{L.start}</button>
        </div>
      )}
      {step === "test" && (
        <div>
          <p>{timer}s</p>
          <h2 style={{ color }}>{L.colors[word]}</h2>
          {COLORS.map(c => (
            <button key={c} onClick={() => answer(c)}>{L.colors[c]}</button>
          ))}
      {step === "test" && (
        </div>
        <div>
      )}
          <p>{timer}s</p>
          <h2 style={{ color }}>{L.colors[word]}</h2>
          {COLORS.map(c => (
            <button key={c} onClick={() => answer(c)}>{L.colors[c]}</button>
          ))}
        </div>
      )}
      {step === "result" && (
        <div>
          <h1>{L.result}</h1>
          <p>{L.score}: {overall.acc}%</p>
          <p>{L.rt}: {overall.avgRT} ms</p>
          <p>{L.errors}: {overall.errors}</p>
          <button onClick={exportPDF}>{L.export}</button>
          <button onClick={() => { setLanguage(null); setStep("welcome"); }}>{L.backLang}</button>
        </div>
      )}
      {step === "r                <h1>{L.result}</h1>
          <p>{L.score}: {overall.acc}%</p>
          <p>{L.rt}: {overall.avgRT} ms          <p>{L.errors}: {overall.errors}</p>
          <button onClick={exportPDF}>{L.export}</button>
          <button onClick={() => { setLanguage(null); setStep("welcome"); }}>{L.backLang}</button>
        </div>
      )}
    </div>
  );
}

