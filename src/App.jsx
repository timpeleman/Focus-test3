import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  /* ========= CONFIG ========= */
  const TEST_DURATION = 240;
  const COLORS = ["red", "blue", "green", "yellow"];
  const STORAGE_KEY = "focus_test_results";

  /* ========= STATE ========= */
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result | history
  const [candidateId, setCandidateId] = useState("");
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [timer, setTimer] = useState(0);
  const [responses, setResponses] = useState([]); // { t, reactionTime, correct }
  const [history, setHistory] = useState([]);

  const roundStart = useRef(0);

  /* ========= TEKSTEN ========= */
  const L = {
    welcome: "Focus Test",
    intro: "Voer kandidaat‑ID in om te starten",
    start: "Start test",
    result: "Testresultaat",
    history: "Resultaten",
    export: "PDF exporteren",
    back: "Terug",
    score: "Score",
    rt: "Gem. reactietijd (ms)",
    chart: "Reactietijd over tijd",
    colors: {
      red: "ROOD",
      blue: "BLAUW",
      green: "GROEN",
      yellow: "GEEL",
    },
  };

  /* ========= EFFECTS ========= */
  useEffect(() => {
    if (step !== "test") return;

    if (timer >= TEST_DURATION) {
      finishTest();
      return;
    }

    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  /* ========= LOGICA ========= */
  const nextRound = () => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWord(w);
    setColor(c);
    roundStart.current = performance.now();
  };

  const startTest = () => {
    if (!candidateId.trim()) return;
    setResponses([]);
    setTimer(0);
    nextRound();
    setStep("test");
  };

  const answer = chosen => {
    const rt = Math.round(performance.now() - roundStart.current);
    setResponses(r => [...r, { t: timer, reactionTime: rt, correct: chosen === color }]);
    nextRound();
  };

  const accuracy = () => {
    if (responses.length === 0) return 0;
    const correct = responses.filter(r => r.correct).length;
    return Math.round((correct / responses.length) * 100);
  };

  const avgRT = () => {
    if (responses.length === 0) return 0;
    return Math.round(
      responses.reduce((sum, r) => sum + r.reactionTime, 0) / responses.length
    );
  };

  const finishTest = () => {
    const entry = {
      id: Date.now(),
      candidateId,
      date: new Date().toISOString(),
      score: accuracy(),
    };

    setHistory(h => {
      const updated = [entry, ...h];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setStep("result");
  };

  /* ========= PDF ========= */
  const exportPDF = () => {
    const pdf = new jsPDF();

    // Overzicht
    pdf.setFontSize(18);
    pdf.text("Focus Test Rapport", 14, 20);
    pdf.setFontSize(12);
    pdf.text(`Kandidaat-ID: ${candidateId}`, 14, 35);
    pdf.text(`${L.score}: ${accuracy()}%`, 14, 45);
    pdf.text(`${L.rt}: ${avgRT()}`, 14, 55);

    // Grafiek
    if (responses.length > 1) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text(L.chart, 14, 20);

      const x0 = 20;
      const y0 = 170;
      const w = 170;
      const h = 100;

      pdf.line(x0, y0, x0 + w, y0);      // X-as
      pdf.line(x0, y0, x0, y0 - h);      // Y-as

      const maxRT = Math.max(...responses.map(r => r.reactionTime), 1);
      let px = null;
      let py = null;

      responses.forEach((r, i) => {
        const x = x0 + (i / (responses.length - 1)) * w;
        const y = y0 - (r.reactionTime / maxRT) * h;
        if (px !== null) pdf.line(px, py, x, y);
        px = x;
        py = y;
      });
    }

    pdf.save(`focus-${candidateId}.pdf`);
  };

  /* ========= UI ========= */
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {step === "welcome" && (
          <div style={styles.center}>
            <h1>{L.welcome}</h1>
            <button style={styles.primary} onClick={() => setStep("menu")}>
              Start
            </button>
          </div>
        )}

        {step === "menu" && (
          <>
            <p>{L.intro}</p>
            <input
              style={styles.input}
              value={candidateId}
              onChange={e => setCandidateId(e.target.value)}
            />
            <button style={styles.primary} onClick={startTest}>
              {L.start}
            </button>
            <button style={styles.secondary} onClick={() => setStep("history")}>
              {L.history}
            </button>
          </>
        )}

        {step === "test" && (
          <div style={styles.center}>
            <p>⏱ {timer}s</p>
            <h2 style={{ color }}>{L.colors[word]}</h2>
            {COLORS.map(c => (
              <button
                key={c}
                style={styles.secondary}
                onClick={() => answer(c)}
              >
                {L.colors[c]}
              </button>
            ))}
          </div>
        )}

        {step === "result" && (
          <div style={styles.center}>
            <h1>{L.result}</h1>
            <p>{L.score}: {accuracy()}%</p>
            <p>{L.rt}: {avgRT()} ms</p>
            <button style={styles.primary} onClick={exportPDF}>
              {L.export}
            </button>
            <button style={styles.secondary} onClick={() => setStep("menu")}>
              {L.back}
            </button>
          </div>
        )}

        {step === "history" && (
          <div>
            <h1>{L.history}</h1>
            {history.map(h => (
              <div key={h.id}>
                {h.candidateId} – {h.score}%
              </div>
            ))}
            <button style={styles.secondary} onClick={() => setStep("menu")}>
              {L.back}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ========= STYLES ========= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  card: {
    background: "#020617",
    padding: 32,
    width: 420,
    borderRadius: 12,
  },
  center: { textAlign: "center" },
  input: { width: "100%", padding: 12, marginBottom: 12 },
  primary: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    background: "#4f46e5",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    cursor: "pointer",
  },
  secondary: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    border: "1px solid #64748b",
    background: "transparent",
    color: "#c7d2fe",
    borderRadius: 8,
    cursor: "pointer",
  },
};
