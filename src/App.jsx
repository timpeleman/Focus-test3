import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";

// ✅ SCHONE, STABIELE VERSIE
// ✅ Reactietijd per antwoord
// ✅ Segmentatie (0–120s / 120–240s)
// ✅ PDF met segmentanalyse
// ✅ Vite / Netlify / esbuild-proof

export default function App() {
  // --- Config ---
  const TEST_DURATION = 240; // seconden
  const HALF = TEST_DURATION / 2;
  const COLORS = ["red", "blue", "green", "yellow"];

  // --- State ---
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result
  const [candidateId, setCandidateId] = useState("");
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [timer, setTimer] = useState(0);
  const [responses, setResponses] = useState([]); // alle antwoorden

  // reactietijd startpunt
  const roundStart = useRef(0);

  // --- Teksten (NL) ---
  const T = {
    nl: {
      welcome: "Welkom bij de Focus Test",
      intro: "Voer je kandidaat‑ID in om te starten.",
      start: "Start test",
      result: "Testresultaat",
      backLang: "Terug naar taalkeuze",
      export: "PDF exporteren",
      score: "Score",
      errors: "Fouten",
      rt: "Gem. reactietijd",
      segment: "Segmentanalyse",
      first: "Eerste helft (0–120s)",
      second: "Tweede helft (120–240s)",
      colors: {
        red: "ROOD",
        blue: "BLAUW",
        green: "GROEN",
        yellow: "GEEL",
      },
    },
  };

  const L = language ? T[language] : {};

  // --- Timer ---
  useEffect(() => {
    if (step !== "test") return;

    if (timer >= TEST_DURATION) {
      setStep("result");
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [step, timer]);

  // --- Nieuwe ronde ---
  const nextRound = () => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWord(w);
    setColor(c);
    roundStart.current = performance.now();
  };

  // --- Start test ---
  const startTest = () => {
    if (!candidateId.trim()) return;
    setResponses([]);
    setTimer(0);
    nextRound();
    setStep("test");
  };

  // --- Antwoord ---
  const answer = (chosen) => {
    const reactionTime = Math.round(performance.now() - roundStart.current);

    setResponses((r) => [
      ...r,
      {
        t: timer,
        reactionTime,
        correct: chosen === color,
      },
    ]);

    nextRound();
  };

  // --- Statistieken ---
  const computeStats = (from, to) => {
    const seg = responses.filter((r) => r.t >= from && r.t < to);
    if (seg.length === 0) return { avgRT: 0, errors: 0, acc: 0 };

    const avgRT = Math.round(
      seg.reduce((sum, r) => sum + r.reactionTime, 0) / seg.length
    );
    const errors = seg.filter((r) => !r.correct).length;
    const acc = Math.round(((seg.length - errors) / seg.length) * 100);

    return { avgRT, errors, acc };
  };

  const firstHalf = computeStats(0, HALF);
  const secondHalf = computeStats(HALF, TEST_DURATION);

  // --- PDF ---
  const exportPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Focus Test Rapport", 14, 20);

    pdf.setFontSize(12);
    pdf.text(`${L.score}: ${firstHalf.acc}%`, 14, 35);
    pdf.text(`${L.rt}: ${firstHalf.avgRT} ms`, 14, 45);
    pdf.text(
      `${L.errors}: ${firstHalf.errors + secondHalf.errors}`,
      14,
      55
    );

    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text(L.segment, 14, 20);

    pdf.setFontSize(12);
    pdf.text(L.first, 14, 35);
    pdf.text(
      `RT: ${firstHalf.avgRT} ms | Fouten: ${firstHalf.errors} | Acc: ${firstHalf.acc}%`,
      14,
      45
    );

    pdf.text(L.second, 14, 65);
    pdf.text(
      `RT: ${secondHalf.avgRT} ms | Fouten: ${secondHalf.errors} | Acc: ${secondHalf.acc}%`,
      14,
      75
    );

    pdf.save(`focus-${candidateId || "result"}.pdf`);
  };

  // --- UI ---
  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      {step === "welcome" && (
        <div>
          <h1>Focus Test</h1>
          <button onClick={() => { setLanguage("nl"); setStep("menu"); }}>
            Start
          </button>
        </div>
      )}

      {step === "menu" && (
        <div>
          <p>{L.intro}</p>
          <input
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            placeholder="Kandidaat ID"
          />
          <br /><br />
          <button onClick={startTest}>{L.start}</button>
        </div>
      )}

      {step === "test" && (
        <div>
          <p>{timer}s</p>
          <h2 style={{ color }}>{L.colors[word]}</h2>
          {COLORS.map((c) => (
            <button key={c} onClick={() => answer(c)} style={{ margin: 4 }}>
              {L.colors[c]}
            </button>
          ))}
        </div>
      )}

      {step === "result" && (
        <div>
          <h1>{L.result}</h1>
          <p>{L.score}: {firstHalf.acc}%</p>
          <p>{L.rt}: {firstHalf.avgRT} ms</p>
          <p>{L.errors}: {firstHalf.errors + secondHalf.errors}</p>

          <button onClick={exportPDF}>{L.export}</button>
          <br /><br />
          <button onClick={() => { setLanguage(null); setStep("welcome"); }}>
            {L.backLang}
          </button>
        </div>
      )}
    </div>
  );
}
