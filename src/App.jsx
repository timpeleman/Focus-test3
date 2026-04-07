import { useEffect, useState } from "react";
import jsPDF from "jspdf";

// ✅ OPTIE H1 — RESULTATEN LOKAAL OPSLAAN (localStorage)
// ✅ Meertalig (NL / EN / AR RTL / TR)
// ✅ Resultaat + professioneel PDF behouden
// ✅ Build‑proof (Vite / Netlify)
export default function App() {
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("welcome"); // welcome | menu | test | result | history
  const [candidateId, setCandidateId] = useState("");
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [history, setHistory] = useState([]);
  const COLORS = ["red", "blue", "green", "yellow"];
  const TEST_DURATION = 240;

  const STORAGE_KEY = "focus_test_results";
  const T = {
    nl: {
      welcome: "Welkom bij de Focus Test",
      intro: "Voer je kandidaat‑ID in om te starten.",
      candidateId: "Kandidaat ID",
      start: "Start",
      click: "Klik de KLEUR van het woord",
      score: "Score",
      result: "Testresultaat",
      interpretation: "Interpretatie",
      history: "Resultaten",
      back: "Terug",
      clear: "Geschiedenis wissen",
      excellent: "Uitstekende concentratie",
      good: "Goede focus",
      average: "Matige focus",
      weak: "Zwak resultaat",
      export: "PDF exporteren",
      restart: "Opnieuw testen",
      report: "Focus Test Rapport",
      date: "Datum",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    },
    en: {
      welcome: "Welcome to the Focus Test",
      intro: "Enter your candidate ID to start.",
      candidateId: "Candidate ID",
      start: "Start",
      click: "Click the COLOR of the word",
      score: "Score",
      result: "Test result",
      interpretation: "Interpretation",
      history: "Results",
      back: "Back",
      clear: "Clear history",
      excellent: "Excellent focus",
      good: "Good focus",
      average: "Average focus",
      weak: "Weak focus",
      export: "Export PDF",
      restart: "Restart test",
      report: "Focus Test Report",
      date: "Date",
      colors: { red: "RED", blue: "BLUE", green: "GREEN", yellow: "YELLOW" }
    },
    ar: {
      welcome: "اختبار التركيز",
      intro: "أدخل رقم المرشح لبدء الاختبار.",
      candidateId: "رقم المرشح",
      start: "ابدأ",
      click: "اضغط على لون الكلمة",
      score: "النتيجة",
      result: "نتيجة الاختبار",
      interpretation: "التفسير",
      history: "النتائج",
      back: "رجوع",
      clear: "مسح السجل",
      excellent: "تركيز ممتاز",
      good: "تركيز جيد",
      average: "تركيز متوسط",
      weak: "تركيز ضعيف",
      export: "تصدير PDF",
      restart: "إعادة الاختبار",
      report: "تقرير اختبار التركيز",
      date: "التاريخ",
      colors: { red: "أحمر", blue: "أزرق", green: "أخضر", yellow: "أصفر" }
    },
    tr: {
      welcome: "Odak Testi",
      intro: "Başlamak için aday numarasını girin.",
      candidateId: "Aday Numarası",
      start: "Başla",
      click: "Kelimenin RENGİNE tıklayın",
      score: "Skor",
      result: "Test sonucu",
      interpretation: "Yorum",
      history: "Sonuçlar",
      back: "Geri",
      clear: "Geçmişi sil",
      excellent: "Mükemmel odak",
      good: "İyi odak",
      average: "Orta seviye odak",
      weak: "Zayıf odak",
      export: "PDF dışa aktar",
      restart: "Yeniden başlat",
      report: "Odak Testi Raporu",
      date: "Tarih",
      colors: { red: "KIRMIZI", blue: "MAVİ", green: "YEŞİL", yellow: "SARI" }
    }
  };

  const L = language ? T[language] : {};
  const isRTL = language === "ar";


  // laad opgeslagen resultaten
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);


  useEffect(() => {
    if (step !== "test") return;
    if (timer >= TEST_DURATION) {
      saveResult();
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

  const accuracy = () => Math.min(100, Math.round((score / (score + 10)) * 100));

  const interpretationText = () => {
    const a = accuracy();
    if (a >= 85) return L.excellent;
    if (a >= 70) return L.good;
    if (a >= 50) return L.average;
    return L.weak;
  };

  const saveResult = () => {
    const entry = {
      id: Date.now(),
      candidateId,
      language,
      score: accuracy(),
      interpretation: interpretationText(),
      date: new Date().toISOString()
    };
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };


  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };


  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(L.report, 14, 20);
    pdf.setFontSize(11);
    pdf.text(`${L.candidateId}: ${candidateId}`, 14, 32);
    pdf.text(`${L.date}: ${new Date().toLocaleDateString()}`, 14, 40);
    pdf.setFontSize(12);
    pdf.text(`${L.score}: ${accuracy()}%`, 14, 60);
    pdf.text(`${L.interpretation}:`, 14, 70);
    pdf.text(interpretationText(), 14, 80, { maxWidth: 180 });
    pdf.save(`focus-test-${candidateId || "result"}.pdf`);
  };

  return (
    <div style={styles.page} dir={isRTL ? "rtl" : "ltr"}>
      <div style={styles.card}>

        {step === "welcome" && (
          <div style={styles.center}>
            <h1 style={styles.title}>Focus Test</h1>
            <button style={styles.primary} onClick={() => { setLanguage("nl"); setStep("menu"); }}>🇳🇱 Nederlands</button>
            <button style={styles.primary} onClick={() => { setLanguage("en"); setStep("menu"); }}>🇬🇧 English</button>
            <button style={styles.primary} onClick={() => { setLanguage("ar"); setStep("menu"); }}>🇸🇦 العربية</button>
            <button style={styles.primary} onClick={() => { setLanguage("tr"); setStep("menu"); }}>🇹🇷 Türkçe</button>
          </div>
        )}

        {step === "menu" && (
          <>
            <h1 style={styles.title}>{L.welcome}</h1>
            <p style={styles.text}>{L.intro}</p>
            <input style={styles.input} value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder={L.candidateId} />
            <button style={styles.primary} onClick={startTest}>{L.start}</button>
            <button style={styles.secondary} onClick={() => setStep("history")}>{L.history}</button>
          </>
        )}

        {step === "test" && (
          <div style={styles.center}>
            <p style={styles.text}>⏱ {timer}s</p>
            <h2 style={{ ...styles.word, color }}>{L.colors[word]}</h2>
            <p style={styles.text}>{L.click}</p>
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
            <p style={styles.scoreText}>{accuracy()}%</p>
            <p style={styles.text}><strong>{L.interpretation}:</strong> {interpretationText()}</p>
            <button style={styles.primary} onClick={exportPDF}>{L.export}</button>
            <button style={styles.secondary} onClick={() => setStep("menu")}>{L.back}</button>
          </div>
        )}

        {step === "history" && (
          <div>
            <h1 style={styles.title}>{L.history}</h1>
            {history.length === 0 && <p style={styles.text}>—</p>}
            {history.map(h => (
              <div key={h.id} style={styles.historyItem}>
                <strong>{h.candidateId}</strong> — {new Date(h.date).toLocaleDateString()} — {h.score}%
              </div>
            ))}
            <button style={styles.secondary} onClick={clearHistory}>{L.clear}</button>
            <button style={styles.primary} onClick={() => setStep("menu")}>{L.back}</button>
          </div>
        )}


      </div>
    </div>
  );
}

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
  scoreText: {
    fontSize: 28,
    marginBottom: 8
  },
  historyItem: {
    padding: 8,
    borderBottom: "1px solid #334155",
    marginBottom: 4
  }
};
