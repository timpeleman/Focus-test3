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
// ===== SEGMENT ANALYSE =====
const segmentStats = (from, to) => {
  const seg = responses.filter(r => r.t >= from && r.t < to);
  if (seg.length === 0) return { avgRT: 0, acc: 0 };

  const avgRT = Math.round(
    seg.reduce((s, r) => s + r.reactionTime, 0) / seg.length
  );
  const acc = Math.round(
    (seg.filter(r => r.correct).length / seg.length) * 100
  );

  return { avgRT, acc };
};

const firstHalf = segmentStats(0, TEST_DURATION / 2);
const secondHalf = segmentStats(TEST_DURATION / 2, TEST_DURATION);

// ===== CONCLUSIE =====
const focusConclusion = () => {
  if (secondHalf.avgRT > firstHalf.avgRT + 100 && secondHalf.acc < firstHalf.acc) {
    return "Concentratie neemt af gedurende de test.";
  }
  if (secondHalf.avgRT < firstHalf.avgRT && secondHalf.acc > firstHalf.acc) {
    return "Prestatie verbetert naarmate de test vordert.";
  }
  return "Concentratie blijft stabiel gedurende de test.";
};

// ===== LABEL =====
const focusLabel = () => {
  const acc = accuracy();
  if (acc >= 85) return "Sterk";
  if (acc >= 70) return "Voldoende";
  return "Aandachtspunt";
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
    pdf.text(`Label: ${focusLabel()}`, 14, 65);
    pdf.text(focusConclusion(), 14, 75, { maxWidth: 180 });

    // Grafiek
    if (responses.length > 1) {
      pdf.addPage();
      pdf.setFontSize(14);
      const x0 = 20;
const y0 = 170;
const w = 170;
const h = 100;

// assen
pdf.line(x0, y0, x0 + w, y0);     // X-as
pdf.line(x0, y0, x0, y0 - h);     // Y-as

const maxRT = Math.max(...responses.map(r => r.reactionTime), 1);

// ---- CORRECTE ANTWOORDEN (blauwe lijn) ----
pdf.setDrawColor(37, 99, 235); // blauw
let pxC = null;
let pyC = null;

responses.forEach((r, i) => {
  const x = x0 + (i / (responses.length - 1)) * w;
  const y = y0 - (r.reactionTime / maxRT) * h;

  if (px !== null) pdf.line(px, py, x, y);

  // 🔴 fout markeren
  if (!r.correct) {
    pdf.setDrawColor(220, 38, 38);
    pdf.circle(x, y, 2, "F");
    pdf.setDrawColor(0, 0, 0);
  }

  px = x;
  py = y;
});

// ---- FOUTE ANTWOORDEN (rode lijn + punten) ----
pdf.setDrawColor(220, 38, 38); // rood
let pxF = null;
let pyF = null;

responses.forEach((r, i) => {
  if (r.correct) return;

  const x = x0 + (i / (responses.length - 1)) * w;
  const y = y0 - (r.reactionTime / maxRT) * h;

  if (pxF !== null) pdf.line(pxF, pyF, x, y);
  pdf.circle(x, y, 2, "F"); // punt markeren
  pxF = x;
  pyF = y;
});

// ---- Legenda ----
pdf.setFontSize(10);

// blauw
pdf.setDrawColor(37, 99, 235);
pdf.line(x0, y0 - h - 10, x0 + 12, y0 - h - 10);
pdf.text("Correct antwoord", x0 + 16, y0 - h - 8);

// rood
pdf.setDrawColor(220, 38, 38);
pdf.line(x0 + 90, y0 - h - 10, x0 + 102, y0 - h - 10);
pdf.text("Fout antwoord", x0 + 106, y0 - h - 8);

// reset kleur
pdf.setDrawColor(0, 0, 0);
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
            <p><strong>Label:</strong> {focusLabel()}</p>
            <p><em>{focusConclusion()}</em></p>
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
