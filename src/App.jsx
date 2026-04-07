import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";

// ✅ G+ — MODERNE UI (card layout, grotere knoppen)
// ✅ Reactietijd + segmentatie + fouten
// ✅ PDF + localStorage
// ✅ Build‑proof (Vite / Netlify)


export default function App() {
  /* ================= CONFIG ================= */
  const TEST_DURATION = 240; // seconden
  const HALF = TEST_DURATION / 2;
  const COLORS = ["red", "blue", "green", "yellow"];
  const STORAGE_KEY = "focus_test_results";


  /* ================= STATE ================= */
  const [language, setLanguage] = useState(null); // nl | en
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result | history
  const [candidateId, setCandidateId] = useState("");

  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [timer, setTimer] = useState(0);

  const [responses, setResponses] = useState([]);
  const [errors, setErrors] = useState([]);
  const [history, setHistory] = useState([]);

  const roundStart = useRef(0);

  /* ================= TEKSTEN ================= */
  const T = {
    nl: {
      welcome: "Welkom bij de Focus Test",
      intro: "Voer je kandidaat‑ID in om te starten.",
      start: "Start test",
      history: "Resultaten",
      result: "Testresultaat",
      backMenu: "Terug naar menu",
      backLang: "Terug naar taalkeuze",
      export: "PDF exporteren",
      clear: "Geschiedenis wissen",
      score: "Score",
      errors: "Fouten",
      rt: "Gem. reactietijd",
      segment: "Segmentanalyse",
      first: "Eerste helft (0–120s)",
      second: "Tweede helft (120–240s)",
      errorStats: "Foutenstatistiek",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    },
    en: {
      welcome: "Welcome to the Focus Test",
      intro: "Enter your candidate ID to start.",
      start: "Start test",
      history: "Results",
      result: "Test result",
      backMenu: "Back to menu",
      backLang: "Back to language selection",
      export: "Export PDF",
      clear: "Clear history",
      score: "Score",
      errors: "Errors",
      rt: "Avg reaction time",
      segment: "Segment analysis",
      first: "First half (0–120s)",
      second: "Second half (120–240s)",
      errorStats: "Error statistics",
      colors: { red: "RED", blue: "BLUE", green: "GREEN", yellow: "YELLOW" }
    }
  };

  const L = language ? T[language] : {};

  /* ================= EFFECTS ================= */
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

  /* ================= LOGICA ================= */
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
    setErrors([]);
    setTimer(0);
    nextRound();
    setStep("test");
  };

  const answer = (chosen) => {
    const rt = Math.round(performance.now() - roundStart.current);
    const correct = chosen === color;
    setResponses(r => [...r, { t: timer, reactionTime: rt, correct }]);
    if (!correct) setErrors(e => [...e, { t: timer, chosen, correctColor: color }]);
    nextRound();
  };

  const computeStats = (from, to) => {
    const seg = responses.filter(r => r.t >= from && r.t < to);
    if (seg.length === 0) return { avgRT: 0, errors: 0, acc: 0 };
    const avgRT = Math.round(seg.reduce((s, r) => s + r.reactionTime, 0) / seg.length);
    const err = seg.filter(r => !r.correct).length;
    const acc = Math.round(((seg.length - err) / seg.length) * 100);
    return { avgRT, errors: err, acc };
  };

  const firstHalf = computeStats(0, HALF);
  const secondHalf = computeStats(HALF, TEST_DURATION);

  const finishTest = () => {
    const entry = {
      id: Date.now(),
      candidateId,
      date: new Date().toISOString(),
      score: firstHalf.acc
    };
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setStep("result");
  };

  /* ================= PDF ================= */
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Focus Test Rapport", 14, 20);
    pdf.setFontSize(12);
    pdf.text(`Kandidaat-ID: ${candidateId}`, 14, 35);
    pdf.text(`Score: ${firstHalf.acc}%`, 14, 45);
    pdf.text(`${L.rt}: ${firstHalf.avgRT} ms`, 14, 55);
    pdf.text(`${L.errors}: ${errors.length}`, 14, 65);


    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text(L.segment, 14, 20);

    pdf.setFontSize(12);
    pdf.text(L.first, 14, 35);
    pdf.text(`RT: ${firstHalf.avgRT} ms | ${L.errors}: ${firstHalf.errors} | Acc: ${firstHalf.acc}%`, 14, 45);
    pdf.text(L.second, 14, 65);
    pdf.text(`RT: ${secondHalf.avgRT} ms | ${L.errors}: ${secondHalf.errors} | Acc: ${secondHalf.acc}%`, 14, 75);


    if (errors.length > 0) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text(L.errorStats, 14, 20);
      pdf.setFontSize(10);
      let y = 32;
      errors.forEach(e => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.text(`${e.t}s: ${L.colors[e.chosen]} → ${L.colors[e.correctColor]}`, 14, y);
        y += 6;
      });
    }

    pdf.save(`focus-${candidateId}.pdf`);
  };

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {step === "welcome" && (
          <div style={styles.center}>
            <h1 style={styles.title}>Focus Test</h1>
            <button style={styles.primary} onClick={() => { setLanguage("nl"); setStep("menu"); }}>NL</button>
            <button style={styles.primary} onClick={() => { setLanguage("en"); setStep("menu"); }}>EN</button>
          </div>
        )}
        {step === "menu" && (
          <>
            <h1 style={styles.title}>{L.welcome}</h1>
            <p style={styles.text}>{L.intro}</p>
            <input style={styles.input} value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder="Kandidaat ID" />
            <button style={styles.primary} onClick={startTest}>{L.start}</button>
            <button style={styles.secondary} onClick={() => setStep("history")}>{L.history}</button>
          </>
        )}
        {step === "test" && (
          <div style={styles.center}>
            <p style={styles.text}>⏱ {timer}s</p>
            <h2 style={{ ...styles.word, color }}>{L.colors[word]}</h2>
            <div style={styles.grid}>
              {COLORS.map(c => (
                <button key={c} style={styles.secondary} onClick={() => answer(c)}>{L.colors[c]}</button>
              ))}
            </div>
          </div>
        )}
        {step === "result" && (
          <div style={styles.center}>
            <h1 style={styles.title}>{L.result}</h1>
            <p style={styles.big}>{L.score}: {firstHalf.acc}%</p>
            <p style={styles.text}>{L.rt}: {firstHalf.avgRT} ms</p>
            <p style={styles.text}>{L.errors}: {errors.length}</p>
            <button style={styles.primary} onClick={exportPDF}>{L.export}</button>
            <button style={styles.secondary} onClick={() => setStep("menu")}>{L.backMenu}</button>
            <button style={styles.secondary} onClick={() => { setLanguage(null); setStep("welcome"); }}>{L.backLang}</button>
          </div>
        )}
        {step === "history" && (
          <div>
            <h1 style={styles.title}>{L.history}</h1>
            {history.length === 0 && <p style={styles.text}>—</p>}
            {history.map(h => (
              <div key={h.id} style={styles.historyItem}>
                {h.candidateId} — {new Date(h.date).toLocaleDateString()} — {h.score}%
              </div>
            ))}
            <button style={styles.secondary} onClick={() => { localStorage.removeItem(STORAGE_KEY); setHistory([]); }}>{L.clear}</button>
            <button style={styles.primary} onClick={() => setStep("menu")}>{L.backMenu}</button>
          </div>
        )}


      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, Arial, sans-serif"
  },
  card: {
    background: "#020617",
    color: "#e5e7eb",
    padding: 32,
    width: 420,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.4)"
  },
  center: { textAlign: "center" },
  title: { marginBottom: 16 },
  text: { marginBottom: 12, color: "#c7d2fe" },
  big: { fontSize: 28, marginBottom: 12 },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#020617",
    color: "#f8fafc"
  },
  primary: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontSize: 16,
    cursor: "pointer"
  },
  secondary: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "transparent",
    color: "#c7d2fe",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  word: {
    fontSize: 36,
    margin: "16px 0"
  },
  historyItem: {
    padding: 8,
    borderBottom: "1px solid #334155"
  }
};
