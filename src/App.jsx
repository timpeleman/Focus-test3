import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";

// ✅ STABIELE BUILD‑PROOF VERSIE
// ✅ STABIELE BUILD‑PROOF VERSIE
// ✅ Reactietijd per antwoord
// ✅ Segmentatie (0–120s / 120–240s)
// ✅ Fouten + reactietijdanalyse in PDF


// ✅ Fouten + reactietijdanalyse in PDF


export default function App() {
  const TEST_DURATION = 240;
  const TEST_DURATION = 240;
  const HALF = TEST_DURATION / 2;
  const COLORS = ["red", "blue", "green", "yellow"];

  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result
  const [candidateId, setCandidateId] = useState("");
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [timer, setTimer] = useState(0);
  const [responses, setResponses] = useState([]);


  const [responses, setResponses] = useState([]);


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
      rt: "Gem. reactietijd",
      rt: "Gem. reactietijd",
      segment: "Segmentanalyse",
      first: "Eerste helft (0–120s)",
      second: "Tweede helft (120–240s)",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    }
  };

  const L = language ? T[language] : {};

  useEffect(() => {
    if (step !== "test") return;
    if (timer >= TEST_DURATION) {
      setStep("result");
      return;
    }
    const timerId = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerId);
    const timerId = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerId);
  }, [step, timer]);

  const nextRound = () => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWord(w);
    setColor(c);
    roundStart.current = performance.now();
  };

  const startTest = () => {
    if (!candidateId.trim()) return;
    if (!candidateId.trim()) return;
    setResponses([]);
    setTimer(0);
    nextRound();
    setStep("test");
  };

  const answer = chosen => {
    const rt = Math.round(performance.now() - roundStart.current);
    setResponses(r => [...r, { t: timer, reactionTime: rt, correct: chosen === color }]);
    setResponses(r => [...r, { t: timer, reactionTime: rt, correct: chosen === color }]);
    nextRound();
  };

  const computeStats = (from, to) => {
    const seg = responses.filter(r => r.t >= from && r.t < to);
  const computeStats = (from, to) => {
    const seg = responses.filter(r => r.t >= from && r.t < to);
    if (seg.length === 0) return { avgRT: 0, errors: 0, acc: 0 };
    const avgRT = Math.round(seg.reduce((s, r) => s + r.reactionTime, 0) / seg.length);
    const errors = seg.filter(r => !r.correct).length;
    const acc = Math.round(((seg.length - errors) / seg.length) * 100);
    return { avgRT, errors, acc };
  };

  const firstHalf = computeStats(0, HALF);
  const secondHalf = computeStats(HALF, TEST_DURATION);
  const firstHalf = computeStats(0, HALF);
  const secondHalf = computeStats(HALF, TEST_DURATION);
  const exportPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Focus Test Rapport", 14, 20);




    pdf.setFontSize(12);
    pdf.text(`${L.score}: ${firstHalf.acc}%`, 14, 35);
    pdf.text(`${L.rt}: ${firstHalf.avgRT} ms`, 14, 45);
    pdf.text(`${L.errors}: ${firstHalf.errors + secondHalf.errors}`, 14, 55);


    pdf.text(`${L.score}: ${firstHalf.acc}%`, 14, 35);
    pdf.text(`${L.rt}: ${firstHalf.avgRT} ms`, 14, 45);
    pdf.text(`${L.errors}: ${firstHalf.errors + secondHalf.errors}`, 14, 55);


    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text(L.segment, 14, 20);




    pdf.setFontSize(12);
    pdf.text(L.first, 14, 35);
    pdf.text(`RT: ${firstHalf.avgRT} ms | Fouten: ${firstHalf.errors} | Acc: ${firstHalf.acc}%`, 14, 45);


    pdf.text(`RT: ${firstHalf.avgRT} ms | Fouten: ${firstHalf.errors} | Acc: ${firstHalf.acc}%`, 14, 45);


    pdf.text(L.second, 14, 65);
    pdf.text(`RT: ${secondHalf.avgRT} ms | Fouten: ${secondHalf.errors} | Acc: ${secondHalf.acc}%`, 14, 75);


    pdf.text(`RT: ${secondHalf.avgRT} ms | Fouten: ${secondHalf.errors} | Acc: ${secondHalf.acc}%`, 14, 75);


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
          ))        </div      )

      {step === "result" && (
        <div>
          <h1>{L.result}</          <p>{L.score}: {firstHalf.acc}%</p>
          <p>{L.rt}: {firstHalf.avgRT} ms</p>
          <p>{L.errors}: {firstHalf.errors + secondHalf.errors}</p>
          <button           <but        </div>
      )}
    </div>
  );
}

