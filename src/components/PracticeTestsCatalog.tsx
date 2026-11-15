import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, HelpCircle, ArrowLeft, Plus, Search, Filter, RotateCcw } from 'lucide-react';

export const PracticeTestsCatalog: React.FC = () => {
  const { quizzes, startQuiz, setCurrentView } = useApp();
  const [selectedTrack, setSelectedTrack] = useState<string>('الكل');
  const [selectedSubject, setSelectedSubject] = useState<string>('الكل');
  const [selectedRole, setSelectedRole] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAdminLogged = (() => {
    try {
      return sessionStorage.getItem('bt_admin_logged') === 'true';
    } catch {
      return false;
    }
  })();

  const tracks: { value: string; label: string }[] = [
    { value: 'الكل', label: 'جميع المسابقات' },
    { value: 'مسابقات التوظيف', label: 'مسابقات التوظيف' },
    { value: 'مسابقات الترقية', label: 'مسابقات الترقية' },
  ];

  // Extract unique subjects and roles dynamically from stored quizzes
  const availableSubjects = useMemo(
    () => Array.from(new Set(quizzes.map(q => q.subject).filter(Boolean))),
    [quizzes]
  );

  const availableRoles = useMemo(
    () => Array.from(new Set(quizzes.map(q => q.targetRole).filter(Boolean))),
    [quizzes]
  );

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      // Filter by competition track (توظيف / ترقية)
      if (selectedTrack !== 'الكل' && q.track !== selectedTrack && q.track !== 'كلاهما') {
        return false;
      }

      // Filter by subject (المادة)
      if (selectedSubject !== 'الكل' && q.subject !== selectedSubject) {
        return false;
      }

      // Filter by target role (الرتبة)
      if (selectedRole !== 'الكل' && q.targetRole !== selectedRole && q.targetRole !== 'جميع الرتب') {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const needle = searchQuery.trim().toLowerCase();
        const matches =
          q.title.toLowerCase().includes(needle) ||
          q.subject.toLowerCase().includes(needle) ||
          q.targetRole.toLowerCase().includes(needle) ||
          q.description.toLowerCase().includes(needle);
        if (!matches) return false;
      }

      return true;
    });
  }, [quizzes, selectedTrack, selectedSubject, selectedRole, searchQuery]);

  const hasActiveFilters =
    selectedTrack !== 'الكل' ||
    selectedSubject !== 'الكل' ||
    selectedRole !== 'الكل' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedTrack('الكل');
    setSelectedSubject('الكل');
    setSelectedRole('الكل');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold text-[#123B5D]">بنك الاختبارات التفاعلية</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          الاختبارات التدريبية الموقوتة
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          حاكي ظروف المسابقة الحقيقية مع أسئلة اختيارية متعددة، توقيت تنازلي، وتصحيح معلل بالسندات البيداغوجية والتشريعية الرسمية
        </p>

        {isAdminLogged && (
          <div className="mt-4">
            <button
              onClick={() => setCurrentView('admin')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006233] hover:bg-[#004e28] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة موضوع اختبار تدريبي جديد من لوحة الإدارة</span>
            </button>
          </div>
        )}
      </div>

      {/* Multi-Criteria Filter Panel: Track (توظيف/ترقية) + Subject (المادة) + Role + Search */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        {/* Top Row: Search, Subject Select, Role Select */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بعنوان الاختبار أو المادة أو المحور..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#123B5D] focus:ring-1 focus:ring-[#123B5D]"
            />
          </div>

          {/* Subject Select (المادة) */}
          <div className="md:col-span-4">
            <select
              aria-label="تصفية حسب المادة"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#123B5D] bg-white font-semibold text-slate-700"
            >
              <option value="الكل">جميع المواد والتخصصات ({availableSubjects.length})</option>
              {availableSubjects.map(subj => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Role Select (الرتبة) */}
          <div className="md:col-span-3">
            <select
              aria-label="تصفية حسب الرتبة"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#123B5D] bg-white font-semibold text-slate-700"
            >
              <option value="الكل">جميع الرتب</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Row: Track Segmented Tabs (توظيف / ترقية) + Subject Quick Filter + Result Counter */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 ml-1">
              <Filter className="w-3.5 h-3.5 text-[#123B5D]" />
              <span>نوع المسابقة:</span>
            </span>
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl flex-wrap">
              {tracks.map(track => {
                const count =
                  track.value === 'الكل'
                    ? quizzes.length
                    : quizzes.filter(q => q.track === track.value || q.track === 'كلاهما').length;
                return (
                  <button
                    key={track.value}
                    type="button"
                    onClick={() => setSelectedTrack(track.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedTrack === track.value
                        ? 'bg-[#123B5D] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {track.label} <span className="font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 text-xs">
            <span className="text-slate-500">
              عرض <strong className="font-mono text-slate-900 tabular-nums">{filteredQuizzes.length}</strong> من أصل{' '}
              <strong className="font-mono text-slate-900 tabular-nums">{quizzes.length}</strong> اختبار
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#123B5D] hover:text-[#0E283F] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>
        </div>

        {/* Subject Quick-Select Pills (interactive controls) */}
        {availableSubjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap ml-1">المادة:</span>
            <button
              type="button"
              onClick={() => setSelectedSubject('الكل')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === 'الكل'
                  ? 'bg-[#D9A441] text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            {availableSubjects.map(subj => (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-[#D9A441] text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtered Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <p className="text-slate-600 text-sm font-bold">
              لا توجد اختبارات تدريبية مطابقة لخيارات التصفية المحددة حالياً.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#123B5D] hover:bg-[#0E283F] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>عرض كافة الاختبارات المتاحة</span>
              </button>
            )}
          </div>
        ) : (
          filteredQuizzes.map(quiz => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-[#123B5D] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-[#123B5D] truncate">{quiz.targetRole}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-600 font-semibold truncate">{quiz.track}</span>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-[#123B5D]" />
                    {quiz.durationMinutes} دقيقة
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {quiz.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {quiz.description}
                </p>

                <div className="py-3 border-y border-slate-100 flex items-center justify-between text-xs text-slate-600 mb-6 gap-2">
                  <span>المادة: <strong className="text-slate-900">{quiz.subject}</strong></span>
                  <span className="font-mono tabular-nums shrink-0">
                    {quiz.questions.length} أسئلة باختيارات متعددة
                  </span>
                </div>
              </div>

              <button
                onClick={() => startQuiz(quiz)}
                className="w-full py-3 px-4 bg-[#123B5D] hover:bg-[#0E283F] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>بدء الاختبار التدريبي الآن</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Advisory section */}
      <div className="mt-12 bg-slate-50 rounded-2xl border border-slate-200 p-6 max-w-3xl mx-auto text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#D9A441]" />
          <span>كيف تستفيد من هذه الاختبارات التدريبية؟</span>
        </h4>
        <p className="leading-relaxed">
          • الاختبارات مجانية بالكامل ومصممة لمساعدتك على تقييم معلوماتك قبل موعد الامتحان الكتابي أو المقابلة الشفوية.
        </p>
        <p className="leading-relaxed">
          • عند الانتهاء من الاختبار، ستظهر لك النتيجة التفصيلية مع تحليل لنقاط القوة والمراجع الموصى بها للتعمق في الثغرات المعرفية.
        </p>
      </div>
    </div>
  );
};
