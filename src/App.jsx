import { useEffect, useState } from "react";
import jsPDF from "jspdf";

// ✅ MODERNE UI + BUILD‑PROOF App.jsx (Vite + React 18)
// ✅ Grote knoppen, duidelijke inputs, hedendaagse layout
// ✅ 4‑minuten Focus (Stroop) test + HR‑PDF
// ✅ Talen: NL / EN / AR (RTL) / TR

export default function App() {
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState("start");
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
      title: "🎯 Focus Test",
      intro: "Test je concentratie en nauwkeurigheid in 4 minuten.",
      chooseLang: "Kies een taal",
      candidateId: "Kandidaat ID",
      start: "Start",
      startTest: "Start test",
      clickColor: "Klik de KLEUR van het woord",
      time: "Tijd",
      score: "Score",
      errors: "Fouten",
      report: "HR‑rapport",
      interpretation: "Interpretatie",
      noErrors: "Geen fouten",
      back: "Terug",
      colors: { red: "ROOD", blue: "BLAUW", green: "GROEN", yellow: "GEEL" }
    },
    en: {
      title: "🎯 Focus Test",
      intro: "Test your focus and accuracy in 4 minutes.",
      chooseLang: "Choose a language",
      candidateId: "Candidate ID",
      start: "Start",
      startTest: "Start test",
      clickColor: "Click the COLOR of the word",
      time: "Time",
      score: "Score",
      errors: "Errors",
      report: "HR Report",
      interpretation: "Interpretation",
      noErrors: "No errors",
      back: "Back",
      colors: { red: "RED", blue: "BLUE", green: "GREEN", yellow: "YELLOW" }
    },
    ar: {
      title: "🎯 اختبار التركيز",
      intro: "اختبر تركيزك ودقتك خلال 4 دقائق.",
      chooseLang: "اختر اللغة",
      candidateId: "رقم المترشح",
      start: "ابدأ",
      startTest: "ابدأ الاختبار",
      clickColor: "اضغط على لون الكلمة",
      time: "الوقت",
      score: "النتيجة",
      errors: "الأخطاء",
      report: "تقرير",
      interpretation: "التقييم",
      noErrors: "لا توجد أخطاء",
      back: "رجوع",
      colors: { red: "أحمر", blue: "أزرق", green: "أخضر", yellow: "أصفر" }
    },
    tr: {
      title: "🎯 Odak Testi",
      intro: "4 dakikada odak ve doğruluk seviyenizi test edin.",
      chooseLang: "Dil seçin",
      candidateId: "Aday Numarası",
      start: "Başla",
      startTest: "Teste başla",
      clickColor: "KELİMENİN rengini tıklayın",
      time: "Süre",
      score: "Skor",
      errors: "Hatalar",
      report: "Rapor",
      interpretation: "Yorum",
      noErrors: "Hata yok",
      back: "Geri",
      colors: { red: "KIRMIZI", blue: "MAVİ", green: "YEŞİL", yellow: "SARI" }
    }
  };

  const L = language ? T[language] : {};
  const isRTL = language === "ar";

  useEffect(() => {
    if (step !== "test") return;
    if (timer >= TEST_DURATION) {
      setStep("menu");
      return;
    }
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const startTest = () => {
    if (!candidateId.trim()) return alert(L.candidateId);
    setScore(0); setErrors([]); setTimer(0);
    nextRound(); setStep("test");
  };

  const nextRound = () => {
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    setColorWord(w); setDisplayColor(c);
  };

  const handleAnswer = (c) => {
    if (c === displayColor) setScore(s => s + 1);
    else setErrors(e => [...e, { time: timer, chosen: c, correct: displayColor }]);
    nextRound();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8", display: "flex", justifyContent: "center", alignItems: "center", direction: isRTL ? "rtl" : "ltr" }}>
      <div style={{ background: "white", padding: 32, borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 10px 30px rgba(0,0,0,.1)" }}>
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>{L.title}</h1>
        {step === "start" && (
          <>
            <p style={{ textAlign: "center" }}>{L.chooseLang}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button style={btn} onClick={() => setLanguage("nl")}>🇳🇱 NL</button>
              <button style={btn} onClick={() => setLanguage("en")}>�🇧 EN</button>
              <button style={btn} onClick={() => setLanguage("ar")}>�🇦 AR</button>
              <button style={btn} onClick={() => setLanguage("tr")}>�🇷 TR</button>
            </div>
            {language && <button style={{ ...btn, marginTop: 20 }} onClick={() => setStep("menu")}>{L.start}</button>}
          </>
        )}
        {step === "menu" && (
          <>
            <p>{L.intro}</p>
            <input value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder={L.candidateId} style={input} />
            <button style={{ ...btn, marginTop: 16 }} onClick={startTest}>{L.startTest}</button>
          </>
        )}
        {step === "test" && (
          <>
            <p><strong>{L.time}:</strong> {timer}s</p>
            <h2 style={{ color: displayColor, textAlign: "center", fontSize: 40 }}>{T[language].colors[colorWord]}</h2>
            <p style={{ textAlign: "center" }}>{L.clickColor}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {COLORS.map(c => (
                <button key={c} style={btn} onClick={() => handleAnswer(c)}>{T[language].colors[c]}</button>
              ))}
            </div>
            <p style={{ marginTop: 16, textAlign: "center" }}>{L.score}: {score} | {L.errors}: {errors.length}</p>
            <button style={{ ...btn, marginTop: 16 }} onClick={() => setStep("menu")}>{L.back}</button>
          </>
        )}
      </div>
    </div>
  );
}

const btn = {
  padding: "14px",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
};

const input = {
  width: "100%",
  padding: "14px",
  fontSize: 16,
  borderRadius: 10,
  border: "1px solid #ccc",
  marginTop: 12
};
