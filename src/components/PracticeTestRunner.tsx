import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PracticeQuiz, QuizQuestion } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Award, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const PracticeTestRunner: React.FC = () => {
  const { selectedQuiz, setSelectedQuiz, quizzes, setCurrentView, navigateToBook, products } = useApp();

  const [activeQuiz, setActiveQuiz] = useState<PracticeQuiz | null>(selectedQuiz || (quizzes[0] || null));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showImmediateExplanation, setShowImmediateExplanation] = useState<boolean>(true);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(activeQuiz ? activeQuiz.durationMinutes * 60 : 900);
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  useEffect(() => {
    if (selectedQuiz) {
      setActiveQuiz(selectedQuiz);
      setTimeLeftSeconds(selectedQuiz.durationMinutes * 60);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsTestFinished(false);
      setTimerActive(true);
    }
  }, [selectedQuiz]);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || isTestFinished) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTestFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isTestFinished]);

  if (!activeQuiz) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-600 mb-4">لا يوجد اختبار تدريبي متاح حالياً</p>
        <button
          onClick={() => setCurrentView('books')}
          className="px-4 py-2 bg-[#123B5D] text-white text-xs font-bold rounded-lg"
        >
          تصفح المراجع والكتب
        </button>
      </div>
    );
  }

  const currentQ: QuizQuestion = activeQuiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQ.id] !== undefined;
  const userAnswer = selectedAnswers[currentQ.id];
  const isCorrect = userAnswer === currentQ.correctIndex;

  const handleSelectOption = (optIndex: number) => {
    if (isTestFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleFinishTest = () => {
    setIsTestFinished(true);
    setTimerActive(false);
  };

  const handleRestartTest = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsTestFinished(false);
    setTimeLeftSeconds(activeQuiz.durationMinutes * 60);
    setTimerActive(true);
  };

  // Score Calculation
  const totalQuestions = activeQuiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = activeQuiz.questions.filter(q => selectedAnswers[q.id] === q.correctIndex).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Matching books for recommended reading
  const recommendedBooks = products.filter(p => p.targetRole === activeQuiz.targetRole || p.track === activeQuiz.track).slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-3">
        <div>
          <span className="text-xs font-bold text-[#123B5D] block">
            {activeQuiz.targetRole} · {activeQuiz.subject}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            {activeQuiz.title}
          </h1>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
            timeLeftSeconds < 120 
              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              : 'bg-slate-50 text-slate-800 border-slate-200'
          }`}>
            <Clock className="w-4 h-4 text-[#123B5D]" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setCurrentView('practice-tests')}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            تغيير الاختبار
          </button>
        </div>
      </div>

      {!isTestFinished ? (
        <div className="space-y-6">
          {/* Progress and settings */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              السؤال <strong className="text-slate-900 font-mono text-sm">{currentQuestionIndex + 1}</strong> من{' '}
              <span className="font-mono">{totalQuestions}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showImmediateExplanation}
                onChange={e => setShowImmediateExplanation(e.target.checked)}
                className="rounded border-slate-300 text-[#123B5D] focus:ring-[#123B5D]"
              />
              <span>إظهار التصحيح والشرح البيداغوجي فور الإجابة</span>
            </label>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#123B5D] h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-[#123B5D]/10 text-[#123B5D] font-bold text-sm flex items-center justify-center shrink-0">
                {currentQuestionIndex + 1}
              </span>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  المحور: {currentQ.topic}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.questionText}
                </h2>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = userAnswer === oIdx;
                const isThisCorrect = oIdx === currentQ.correctIndex;
                let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';

                if (isAnswered && showImmediateExplanation) {
                  if (isThisCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                  } else if (isSelected && !isThisCorrect) {
                    optionStyle = 'border-red-500 bg-red-50/60 text-red-950 ring-1 ring-red-500';
                  } else {
                    optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-400';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-[#123B5D] bg-[#123B5D]/5 text-[#123B5D] font-bold ring-1 ring-[#123B5D]';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-xl border text-right transition-all flex items-start justify-between gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="text-sm leading-relaxed">{opt}</span>
                    </div>

                    {isAnswered && showImmediateExplanation && isThisCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {isAnswered && showImmediateExplanation && isSelected && !isThisCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Immediate Explanation Box */}
            {isAnswered && showImmediateExplanation && (
              <div className={`mt-6 p-4 rounded-xl border text-xs leading-relaxed ${
                isCorrect 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1 text-sm">
                  <Sparkles className="w-4 h-4 text-[#D9A441]" />
                  <span>{isCorrect ? 'إجابة صحيحة! التعليل البيداغوجي:' : 'إجابة غير دقيقة. التوضيح والتعليل البيداغوجي:'}</span>
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}
          </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="px-5 py-2.5 bg-[#123B5D] hover:bg-[#0E283F] text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <span>السؤال الموالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishTest}
                className="px-6 py-2.5 bg-[#D9A441] hover:bg-[#B8852B] text-slate-950 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
              >
                إنهاء الاختبار وعرض النتيجة
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Test Finished Results View */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#D9A441] flex items-center justify-center mx-auto border border-amber-200">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              نتيجة تقييم الاختبار التدريبي
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeQuiz.title} · {activeQuiz.targetRole}
            </p>
          </div>

          {/* Score Badge */}
          <div className="inline-block p-6 bg-slate-50 rounded-2xl border border-slate-200 min-w-60">
            <span className="text-4xl font-black text-[#123B5D] font-mono tabular-nums">
              {scorePercent}%
            </span>
            <div className="text-xs font-bold text-slate-600 mt-1">
              أجبت بشكل صحيح على {correctCount} من أصل {totalQuestions} أسئلة
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              نسبة الإنجاز: {Math.round((answeredCount / totalQuestions) * 100)}%
            </div>
          </div>

          {/* Performance analysis */}
          <div className="max-w-md mx-auto text-xs text-slate-600 leading-relaxed text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">قراءة النتيجة والتوصيات:</h4>
            {scorePercent >= 75 ? (
              <p className="text-emerald-800">
                ممتاز! استيعابك للنصوص التشريعية والمفاهيم البيداغوجية لهذا التخصص قوي جداً. ننصحك بالاطلاع على نماذج المقابلات الشفوية والوضعيات المعقدة لتثبيت مستواك.
              </p>
            ) : scorePercent >= 50 ? (
              <p className="text-amber-800">
                مستوى متوسط واعد. لديك إلمام بالخطوط العريضة ولكنك تحتاج إلى تدقيق المصطلحات القانونية المحددة في القرارات الوزارية ونظريات التعلم.
              </p>
            ) : (
              <p className="text-red-800">
                تحتاج إلى مراجعة وتأطير منهجي منظم. مادة المسابقة تتطلب معرفة دقيقة بالمواد القانونية وحل مواضيع سابقة لتفادي الأخطاء الشائعة.
              </p>
            )}
          </div>

          {/* Recommended Books for this Quiz */}
          {recommendedBooks.length > 0 && (
            <div className="text-right pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#123B5D]" />
                <span>المراجع المقترحة لتعميق معارفك واجتياز المسابقة بتفوق:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedBooks.map(b => (
                  <div
                    key={b.id}
                    onClick={() => navigateToBook(b)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#123B5D] bg-slate-50 hover:bg-white flex gap-3 items-center cursor-pointer transition-colors text-right"
                  >
                    <div className="w-12 h-16 rounded bg-white overflow-hidden border border-slate-200 shrink-0">
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{b.title}</h4>
                      <span className="text-[11px] font-mono font-bold text-[#123B5D]">{b.priceDZD} دج</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">الدفع عند الاستلام</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestartTest}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#123B5D] text-white text-xs font-bold rounded-lg hover:bg-[#0E283F] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الاختبار</span>
            </button>

            <button
              onClick={() => setCurrentView('practice-tests')}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 bg-white text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              اختيار اختبار آخر
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
