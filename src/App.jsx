import { useEffect, useState } from "react";
import jsPDF from "jspdf";

// ✅ SCHONE, BUILD‑PROOF App.jsx (Vite + React 18)
// ✅ Startscherm + taalkeuze + startknop
// ✅ 4‑minuten Focus (Stroop) test
// ✅ HR‑PDF rapport met interpretatie en foutentabel
// ✅ Talen: NL / EN / AR (RTL) / TR

export default function App() {
  const [language, setLanguage] = useState(null); // nl | en | ar | tr
  const [step, setStep] = useState("start"); // start | menu | test
  const [candidateId, setCandidateId] = useState("");
  const [colorWord, setColorWord] = useState("");
  const [displayColor, setDisplayColor] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState([]); // { time, chosen, correct }


  const TEST_DURATION = 240; // 4 minuten
  const COLORS = ["red", "blue", "green", "yellow"];


  // ====== VERTALINGEN ======
  const T = {
    nl: {
      title: "🎯 Focus Test",
      intro: "Test je concentratie en nauwkeurigheid in 4 minuten.",
      chooseLang: "Kies een taal",
      candidateId: "Kandidaat ID",
      start: "🚀 Start",
      startTest: "Start test",
      clickColor: "Klik de KLEUR van het woord",
      time: "⏱ Tijd",
      score: "✅ Score",
      errors: "❌ Fouten",
      report: "HR‑rapport",
      correctAnswers: "Juiste antwoorden",
      totalErrors: "Totaal fouten",
      interpretation: "Interpretatie",
      errorList: "Foutenlijst",
      noErrors: "Geen fouten gemaakt",
      excellent: "Uitstekende concentratie",
      good: "Goede focus met enkele fouten",
      medium: "Matige focus — mogelijk concentratieproblemen",
      weak: "Zwak resultaat — duidelijke aandachtsproblemen",
      back: "🔙 Terug naar menu",
    },
    en: {
      title: "🎯 Focus Test",
      intro: "Test your focus and accuracy in 4 minutes.",
      chooseLang: "Choose a language",
      candidateId: "Candidate ID",
      start: "🚀 Start",
      startTest: "Start test",
      clickColor: "Click the COLOR of the word",
      time: "⏱ Time",
      score: "✅ Score",
      errors: "❌ Errors",
      report: "HR Report",
      correctAnswers: "Correct answers",
      totalErrors: "Total errors",
      interpretation: "Interpretation",
      errorList: "Error list",
      noErrors: "No errors",
      excellent: "Excellent focus",
      good: "Good focus with minor mistakes",
      medium: "Average focus — possible issues",
      weak: "Weak focus — significant attention problems",
      back: "🔙 Back to menu",
    },
    ar: {
      title: "🎯 اختبار التركيز",
      intro: "اختبر تركيزك ودقتك خلال 4 دقائق.",
      chooseLang: "اختر اللغة",
      candidateId: "رقم المترشح",
      start: "🚀 ابدأ",
      startTest: "ابدأ الاختبار",
      clickColor: "اضغط على لون الكلمة",
      time: "⏱ الوقت",
      score: "✅ النتيجة",
      errors: "❌ الأخطاء",
      report: "تقرير الموارد البشرية",
      correctAnswers: "الإجابات الصحيحة",
      totalErrors: "مجموع الأخطاء",
      interpretation: "التقييم",
      errorList: "قائمة الأخطاء",
      noErrors: "لا توجد أخطاء",
      excellent: "تركيز ممتاز",
      good: "تركيز جيد مع بعض الأخطاء",
      medium: "تركيز متوسط — ربما توجد مشاكل",
      weak: "تركيز ضعيف — مشاكل واضحة",
      back: "🔙 رجوع",
    },
    tr: {
      title: "🎯 Odak Testi",
      intro: "4 dakikada odak ve doğruluk seviyenizi test edin.",
      chooseLang: "Dil seçin",
      candidateId: "Aday Numarası",
      start: "🚀 Başla",
      startTest: "Teste başla",
      clickColor: "KELİMENİN rengini tıklayın",
      time: "⏱ Süre",
      score: "✅ Skor",
      errors: "❌ Hatalar",
      report: "İK Raporu",
      correctAnswers: "Doğru cevaplar",
      totalErrors: "Toplam hatalar",
      interpretation: "Yorum",
      errorList: "Hata listesi",
      noErrors: "Hata yok",
      excellent: "Mükemmel odak",
      good: "İyi odak, birkaç hata",
      medium: "Orta seviye — sorun olabilir",
      weak: "Zayıf odak — belirgin sorunlar",
      back: "🔙 Geri dön",
    },
  };

  const L = language ? T[language] : {};
  const isRTL = language === "ar";

  // ====== TIMER ======
  useEffect(() => {
    if (step !== "test") return;
    if (timer >= TEST_DURATION) {
      generatePDF();
      setStep("menu");
      return;
    }
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  // ====== ACTIES ======
  const startTest = () => {
    if (!candidateId.trim()) {
      alert(L.candidateId);
      return;
    }
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

  const interpretScore = () => {
    const total = score + errors.length;
    if (total === 0) return L.noErrors;
    const acc = score / total;
    if (acc >= 0.9) return L.excellent;
    if (acc >= 0.75) return L.good;
    if (acc >= 0.55) return L.medium;
    return L.weak;
  };

  // ====== PDF ======
  const generatePDF = () => {
    const pdf = new jsPDF();
    const interpretation = interpretScore();


    pdf.setFillColor(30, 30, 30);
    pdf.rect(0, 0, 220, 25, "F");
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text(L.report, 10, 17);


    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text(`${L.candidateId}: ${candidateId}`, 10, 40);
    pdf.text(`${L.correctAnswers}: ${score}`, 10, 50);
    pdf.text(`${L.totalErrors}: ${errors.length}`, 10, 60);

    pdf.setFontSize(16);
    pdf.text(L.interpretation + ":", 10, 85);
    pdf.setFontSize(14);
    pdf.text(interpretation, 10, 100, { maxWidth: 180 });


    pdf.setFontSize(16);
    pdf.text(L.errorList + ":", 10, 125);


    pdf.setFontSize(12);
    let y = 145;
    if (errors.length === 0) pdf.text(L.noErrors, 10, y);
    else errors.forEach((e, i) => {
      pdf.text(`${i + 1}. ${e.time}s — ${e.chosen.toUpperCase()} / ${e.correct.toUpperCase()}`, 10, y);
      y += 8;
      if (y > 270) { pdf.addPage(); y = 20; }
    });


    pdf.save(`rapport-${candidateId}.pdf`);
  };


  // ====== UI ======
  return (
    <div style={{ fontFamily: "Arial", maxWidth: 650, margin: "0 auto", padding: 30, direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}>
      <h1>{L.title}</h1>


      {step === "start" && (
        <div>
          <h2>{L.chooseLang}</h2>
          <button onClick={() => setLanguage("nl")}>🇳🇱 NL</button>
          <button onClick={() => setLanguage("en")}>🇬🇧 EN</button>
          <button onClick={() => setLanguage("ar")}>🇸🇦 AR</button>
          <button onClick={() => setLanguage("tr")}>🇹🇷 TR</button>
          {language && <button style={{ display: "block", marginTop: 16 }} onClick={() => setStep("menu")}>{L.start}</button>}
        </div>
      )}


      {step === "menu" && (
        <div>
          <p>{L.intro}</p>
          <input placeholder={L.candidateId} value={candidateId} onChange={e => setCandidateId(e.target.value)} />
          <div style={{ marginTop: 12 }}>
            <button onClick={startTest}>{L.startTest}</button>
          </div>
        </div>
      )}


      {step === "test" && (
        <div>
          <p>{L.time}: {timer}s</p>
          <h2 style={{ color: displayColor }}>{colorWord.toUpperCase()}</h2>
          <p>{L.clickColor}</p>
          {COLORS.map(c => (
            <button key={c} onClick={() => handleAnswer(c)} style={{ margin: 4 }}>
              {c.toUpperCase()}
            </button>
          ))}
          <p>{L.score}: {score} | {L.errors}: {errors.length}</p>
          <button onClick={() => setStep("menu")}>{L.back}</button>
        </div>
      )}
    </div>
  );
}
