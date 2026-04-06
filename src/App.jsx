import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import jsPDF from "jspdf";
// ✅ MODERNE UI + BUILD‑PROOF App.jsx (Vite + React 18)
// ✅ B — EINDRESULTAATSCHERM na de test
// ✅ PDF‑exportknop toegevoegd
// ✅ PDF‑exportknop toegevoegd
// ✅ Welkom‑scherm: tekst = taalkeuze
// ✅ Modern kleurenschema (Slate / Indigo)
// ✅ 4‑minuten Focus (Stroop) test
// ✅ Talen: NL / EN / AR (RTL) / TR

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
      good: "Goede focus met enkele fouten",
      medium: "Matige focus – mogelijk concentratieproblemen",
      weak: "Zwak resultaat – duidelijke aandachtsproblemen",
      restart: "Opnieuw testen",
      backMenu: "Terug naar menu",
      backWelcome: "Terug naar welkom",
      exportPdf: "PDF exporteren",
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
      good: "Good focus with minor mistakes",
      medium: "Average focus – possible issues",
      weak: "Weak focus – clear attention problems",
      restart: "Restart test",
      backMenu: "Back to menu",
      backWelcome: "Back to welcome",
      exportPdf: "Export PDF",
      exportPdf: "Export PDF",
      colors: { red: "RED", blue: "BLUE", green: "GREEN", yellow: "YELLOW" }
    },
    ar: {
      welcome: "مرحبًا بك في اختبار التركيز",
      intro: "اختبر تركيزك ودقتك خلال 4 دقائق.",
      candidateId: "رقم المترشح",
      startTest: "ابدأ الاختبار",
      clickColor: "اضغط على لون الكلمة",
      time: "الوقت",
      score: "النتيجة",
      errors: "الأخطاء",
      resultTitle: "نتيجة الاختبار",
      interpretation: "التقييم",
      excellent: "تركيز ممتاز",
      good: "تركيز جيد مع بعض الأخطاء",
      medium: "تركيز متوسط",
      weak: "تركيز ضعيف",
      restart: "إعادة الاختبار",
      backMenu: "العودة إلى القائمة",
      backWelcome: "العودة إلى الترحيب",
      exportPdf: "تصدير PDF",
      exportPdf: "تصدير PDF",
      colors: { red: "أحمر", blue: "أزرق", green: "أخضر", yellow: "أصفر" }
    },
    tr: {
      welcome: "Odak Testine Hoş Geldiniz",
      intro: "4 dakikada odak ve doğruluk seviyenizi test edin.",
      candidateId: "Aday Numarası",
      startTest: "Teste başla",
      clickColor: "KELİMENİN rengini tıklayın",
      time: "Süre",
      score: "Skor",
      errors: "Hatalar",
      resultTitle: "Test sonucu",
      interpretation: "Yorum",
      excellent: "Mükemmel odak",
      good: "İyi odak, birkaç hata",
      medium: "Orta seviye odak",
      weak: "Zayıf odak",
      restart: "Testi tekrar et",
      backMenu: "Menüye dön",
      backWelcome: "Hoş geldine dön",
      exportPdf: "PDF dışa aktar",
      exportPdf: "PDF dışa aktar",
      colors: { red: "KIRMIZI", blue: "MAVİ", green: "YEŞİL", yellow: "SARI" }
    }
  };

  const L = language ? T[language] : {};
  const isRTL = language === "ar";

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
    else setErrors(e => [...e, { time: timer, chosen: c, correct: displayColor }]);
    nextRound();
  };

  const interpret = () => {
    const total = score + errors.length;
    if (total === 0) return L.excellent;
    const acc = score / total;
    if (acc >= 0.9) return L.excellent;
    if (acc >= 0.75) return L.good;
    if (acc >= 0.55) return L.medium;
    return L.weak;
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(L.resultTitle, 14, 20);
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(L.resultTitle, 14, 20);
    pdf.setFontSize(12);
    pdf.text(`${L.candidateId}: ${candidateId}`, 14, 35);
    pdf.text(`${L.score}: ${score}`, 14, 45);
    pdf.text(`${L.errors}: ${errors.length}`, 14, 55);


    pdf.text(L.interpretation + ":", 14, 70);
    pdf.text(interpret(), 14, 80, { maxWidth: 180 });


    pdf.save(`focus-test-${candidateId || "result"}.pdf`);
  };


    pdf.setFontSize(12);
    pdf.text(`${L.candidateId}: ${candidateId}`, 14, 35);
    pdf.text(`${L.score}: ${score}`, 14, 45);
    pdf.text(`${L.errors}: ${errors.length}`, 14, 55);


    pdf.text(L.interpretation + ":", 14, 70);
    pdf.text(interpret(), 14, 80, { maxWidth: 180 });


    pdf.save(`focus-test-${candidateId || "result"}.pdf`);
  };


  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #020617)", display: "flex", justifyContent: "center", alignItems: "center", direction: isRTL ? "rtl" : "ltr" }}>
      <div style={{ background: "#020617", color: "#e5e7eb", padding: 40, borderRadius: 20, width: "100%", maxWidth: 560, boxShadow: "0 20px 40px rgba(0,0,0,.4)" }}>

        {step === "welcome" && (
          <div style={{ display: "grid", gap: 16 }}>
            <button style={btn} onClick={() => { setLanguage("nl"); setStep("menu"); }}>🇳🇱 Welkom bij de Focus Test</button>
            <button style={btn} onClick={() => { setLanguage("en"); setStep("menu"); }}>🇬🇧 Welcome to the Focus Test</button>
            <button style={btn} onClick={() => { setLanguage("ar"); setStep("menu"); }}>🇸🇦 مرحبًا بك في اختبار التركيز</button>
            <button style={btn} onClick={() => { setLanguage("tr"); setStep("menu"); }}>🇹🇷 Odak Testine Hoş Geldiniz</button>
          </div>
        )}

        {step === "menu" && language && (
          <>
            <h1 style={{ textAlign: "center", marginBottom: 16, color: "#e0e7ff" }}>{L.welcome}</h1>
            <p style={{ color: "#c7d2fe" }}>{L.intro}</p>
            <input value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder={L.candidateId} style={input} />
            <button style={{ ...btn, marginTop: 18 }} onClick={startTest}>{L.startTest}</button>
            <button style={{ ...btnSecondary, marginTop: 12 }} onClick={() => setStep("welcome")}>{L.backWelcome}</button>
          </>
        )}

        {step === "test" && (
          <>
            <p style={{ color: "#a5b4fc" }}><strong>{L.time}:</strong> {timer}s</p>
            <h2 style={{ color: displayColor, textAlign: "center", fontSize: 44, margin: "20px 0" }}>{L.colors[colorWord]}</h2>
            <p style={{ textAlign: "center", color: "#c7d2fe" }}>{L.clickColor}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {COLORS.map(c => (
                <button key={c} s              ))}
            </div>
          </>
        )}

        {step === "result" && (
          <>
            <h1 style={{ textAlign: "center", color: "#e0e7ff" }}>{L.resultTitle}</h1>
            <p style={{ textAlign: "center", color: "#c7d2fe" }}>{L.interpretation}</p>
            <h2 style={{ textAlign: "center", margin: "1            <p style={{ textAlign: "center" }}>{L.score}: {score}             <button style={{ ...btn, marginTop: 18 }} onClick={exportPDF}>{L.exportPdf}</button>            <button style={{ ...btnSecondary, marginTop: 12 }} onClick={startTest}>{L.restart}</button>| {L.errors}: {errors.length}</p>
            <button style={{ ...btn, marginTop: 18 }} onClick={exportPDF}>{L.exportPdf}</button>
            <button style={{ ...btnSecondary, marginTop: 12 }} onClick={startTest}>{L.restart}</button>
            <button style={{ ...btnSecondary, marginTop: 12 }} onClick={() => setStep("menu")}>{L.backMenu}</button>
            <button style={{ ...btnSecondary, marginTop: 12 }} onClick={() => { setLanguage(null); setStep("welcome"); }}>{L.backWelcome}</button>
          </>
        )}

      </div>
    </div>
  );
}

const btn = {
  padding: "16px",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 12,
  border: "none",
  background: "#4f46e5",
  color: "#f8fafc",
  cursor: "pointer",
  transition: "all .2s ease"
};

const btnSecondary = {
  padding: "14px",
  fontSize: 15,
  fontWeight: 500,
  borderRadius: 12,
  border: "1px solid #334155",
  background: "transparent",
  color: "#c7d2fe",
  cursor: "pointer"
};

const input = {
  width: "100%",
  padding: "16px",
  fontSize: 16,
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "#f8fafc",
  marginTop: 14
};
