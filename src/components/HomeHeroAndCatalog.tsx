import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { SmartFinderWizard } from './SmartFinderWizard';
import { 
  BookOpen, 
  Compass, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Award, 
  PhoneCall, 
  GraduationCap,
  Briefcase
} from 'lucide-react';

export const HomeHeroAndCatalog: React.FC = () => {
  const { products, setCurrentView, navigateToBook, checkoutProductDirectly, quizzes, startQuiz } = useApp();

  const featuredBooks = products.filter(p => p.isFeatured);
  const topShowcaseBooks = (featuredBooks.length > 0 ? featuredBooks : products).slice(0, 5);
  const newReleases = products.filter(p => p.isNewRelease).slice(0, 5);
  const sampleQuiz = quizzes[0];

  const rolePills = [
    { label: 'أستاذ (ابتدائي / متوسط / ثانوي)', track: 'مسابقات التوظيف' },
    { label: 'مشرف التربية', track: 'مسابقات التوظيف' },
    { label: 'مستشار التوجيه والإرشاد', track: 'مسابقات التوظيف' },
    { label: 'مربي متخصص', track: 'مسابقات التوظيف' },
    { label: 'مدير متوسطة وابتدائية', track: 'مسابقات الترقية' },
    { label: 'أستاذ رئيسي وأستاذ مكون', track: 'مسابقات الترقية' },
    { label: 'مقتصد ومساعد مصالح اقتصادية', track: 'مسابقات التوظيف' }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Editorial Hero Section with Top Book Covers Gallery */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#123B5D] via-[#0F314E] to-[#0A2236] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric framing */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D9A441_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          {/* Top Hero Header & Primary Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-7">
            <div className="space-y-3 text-right max-w-3xl">
              {/* Quiet Trust Kicker */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#D9A441] font-bold">
                <span>الناشر المتخصص لمسابقات التربية الوطنية بالجزائر</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-300 font-normal">طبعات 2026 المحينة</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-300 font-normal">توصيل 58 ولاية والدفع عند الاستلام</span>
              </div>

              {/* Hero Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black text-white leading-tight tracking-tight text-balance">
                استعد لمسابقات التوظيف والترقية بثقة وتنظيم
              </h1>

              {/* Supporting Message */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-medium">
                مراجع متخصصة وموارد عملية تساعدك على تنظيم تحضيرك المهني في قطاع التربية؛ كتب ورقية مطبوعة، مواضيع محلولة، واختبارات تدريبية تفاعلية.
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setCurrentView('books')}
                className="px-6 py-3 bg-[#D9A441] hover:bg-[#B8852B] text-slate-950 font-black text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>تصفح كامل الكتب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('smart-finder');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#D9A441]" />
                <span>اختر رتبتك</span>
              </button>
            </div>
          </div>

          {/* Top-of-Page Book Covers Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <BookOpen className="w-4 h-4 text-[#D9A441]" />
                <span>إصدارات ومراجع بوابة التربية المعتمدة — طبعات 2026</span>
              </div>
              <button
                onClick={() => setCurrentView('books')}
                className="text-[#D9A441] hover:text-amber-300 font-bold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>عرض الكل ({products.length})</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {topShowcaseBooks.map((book, idx) => (
                <article
                  key={book.id}
                  onClick={() => navigateToBook(book)}
                  className={`group bg-white rounded-xl p-2.5 shadow-xl border border-white/20 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    idx === 4 && topShowcaseBooks.length === 5
                      ? 'col-span-2 sm:col-span-1 max-w-[220px] sm:max-w-none mx-auto w-full'
                      : ''
                  }`}
                >
                  <div>
                    {/* Book Cover Image */}
                    <div className="aspect-[10/14] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-100 relative">
                      <img
                        src={book.coverImage}
                        alt={`غلاف ${book.title}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>

                    {/* Clean Unboxed Book Info */}
                    <div className="pt-2.5 px-1 text-right">
                      <span className="text-[11px] font-bold text-[#006233] block truncate">
                        {book.targetRole}
                      </span>
                      <h2 className="text-xs sm:text-[13px] font-extrabold text-slate-900 group-hover:text-[#123B5D] transition-colors line-clamp-2 leading-snug mt-0.5 min-h-[2.25rem]">
                        {book.title}
                      </h2>
                    </div>
                  </div>

                  {/* Price & Direct Order CTA */}
                  <div className="mt-2 pt-2 px-1 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-[#123B5D] text-sm tabular-nums whitespace-nowrap">
                      {book.priceDZD.toLocaleString()} <span className="text-[11px] font-bold">دج</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        checkoutProductDirectly(book);
                      }}
                      className="px-2.5 py-1 bg-[#123B5D] group-hover:bg-[#D9A441] text-white group-hover:text-slate-950 text-[11px] font-bold rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      اطلب الآن
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Value Metrics Strip */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <strong className="text-lg font-bold font-mono text-white tabular-nums shrink-0">58 ولاية</strong>
              <span className="text-slate-300">توصيل سريع لباب المنزل والمكتب الولائي</span>
            </div>
            <div className="flex items-center gap-3">
              <strong className="text-lg font-bold font-mono text-[#D9A441] tabular-nums shrink-0">100%</strong>
              <span className="text-slate-300">معاينة الطرد والتأكد من الكتاب قبل الدفع نقداً</span>
            </div>
            <div className="flex items-center gap-3">
              <strong className="text-lg font-bold font-mono text-white tabular-nums shrink-0">2026</strong>
              <span className="text-slate-300">نصوص ومراسيم محينة ومطابقة للبرامج الرسمية</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Role Quick Selection Bar */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                استكشف المراجع حسب رتبتك المهنية
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اضغط على رتبتك لعرض الحقائب والكتب المتخصصة مباشرة
              </p>
            </div>
            <button
              onClick={() => setCurrentView('books')}
              className="text-xs font-bold text-[#123B5D] hover:underline self-start md:self-auto cursor-pointer"
            >
              عرض جميع الرتب (10 رتب) ←
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-2">
            {rolePills.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentView('books')}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-50 hover:bg-[#123B5D] hover:text-white border border-slate-200 transition-all whitespace-nowrap cursor-pointer text-slate-700 shadow-2xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Separate Pathways: التوظيف المباشر vs الامتحانات المهنية والترقية */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setCurrentView('recruitment')}
            className="p-8 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-[#123B5D] shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center mb-4 group-hover:bg-[#123B5D] group-hover:text-white transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#123B5D]">المسار الأول</span>
            <h3 className="text-xl font-black text-slate-900 mt-1 mb-2">
              مسابقات التوظيف المباشر في التربية
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              حقائب متكاملة لمسابقات أساتذة التعليم الابتدائي، المتوسط، والثانوي، مشرفي التربية، ومستشاري التوجيه والإرشاد المدرسي. تتضمن علوم التربية، التشريع، والثقافة العامة.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123B5D] group-hover:underline">
              <span>تصفح مراجع مسابقات التوظيف</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => setCurrentView('promotion')}
            className="p-8 rounded-2xl bg-gradient-to-br from-white to-amber-50/40 border border-slate-200 hover:border-[#D9A441] shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#D9A441]/10 text-[#D9A441] flex items-center justify-center mb-4 group-hover:bg-[#D9A441] group-hover:text-slate-950 transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-800">المسار الثاني</span>
            <h3 className="text-xl font-black text-slate-900 mt-1 mb-2">
              الامتحانات المهنية ومسابقات الترقية
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              مراجع متقدمة لرتبة أستاذ رئيسي وأستاذ مكون، مدراء المتوسطات والمدارس الابتدائية، والمفتشين. تشمل تحليل الممارسات التعليمية، التشريع المدرسي، والتسيير الإداري والمالي.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 group-hover:underline">
              <span>تصفح مراجع الامتحانات المهنية</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>
        </section>

        {/* Smart Book Finder Wizard Anchor */}
        <div id="smart-finder">
          <SmartFinderWizard />
        </div>

        {/* Featured Books Collection */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-3">
            <div>
              <span className="text-xs font-bold text-[#123B5D]">إصدارات مختارة</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                أبرز المراجع الأكثر طلباً وتحضيراً
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('books')}
              className="text-xs font-bold text-[#123B5D] hover:underline self-start sm:self-auto cursor-pointer"
            >
              عرض كامل الإصدارات ({products.length} كتب) ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBooks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Practice Test Banner Interactive Teaser */}
        {sampleQuiz && (
          <section className="bg-gradient-to-r from-[#123B5D] to-[#1F4C74] text-white rounded-2xl p-6 sm:p-10 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3 text-right">
                <span className="text-xs font-bold text-[#D9A441] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  محاكاة الامتحانات الكتابية
                </span>
                <h3 className="text-2xl font-black text-white">
                  اختبر معلوماتك في التشريع المدرسي وعلوم التربية مجاناً
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                  جرّب محاكي الاختبار الموقوت مع توضيح فوري للتعليل البيداغوجي والسند القانوني لكل إجابة لتقييم جاهزيتك قبل موعد المسابقة.
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <button
                  onClick={() => startQuiz(sampleQuiz)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#D9A441] hover:bg-[#B8852B] text-slate-950 font-black text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  بدء الاختبار التجريبي الآن ({sampleQuiz.durationMinutes} دقيقة)
                </button>
              </div>
            </div>
          </section>
        )}

        {/* New Releases Collection */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-3">
            <div>
              <span className="text-xs font-bold text-[#006233]">حديثاً في المخزن</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                طبعات 2026 المنقحة حديثاً
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('books')}
              className="text-xs font-bold text-[#123B5D] hover:underline self-start sm:self-auto cursor-pointer"
            >
              استكشاف كافة الكتب ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newReleases.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Trust Section Based on Genuine Capabilities */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl font-extrabold text-slate-900">
              لماذا يعتمد المترشحون على مراجع «بوابة التربية»؟
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              التزامنا بالمعايير المهنية في النشر التعليمي وخدمة المترشح
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">مطابقة للمناهج الرسمية</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                كل مرجع يخضع للتدقيق من أساتذة ومفتشين ذوي خبرة لضمان توافقه مع المحاور المحددة في القرارات الوزارية.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-[#006233]/10 text-[#006233] flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">الدفع نقداً بعد المعاينة</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                لا نطلب أي دفع مسبق؛ يمكنك فتح الطرد والتأكد من سلامة وجودة الكتب قبل تسليم المبلغ لموزع الطرود.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-[#D9A441]/10 text-[#D9A441] flex items-center justify-center mb-3">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">متابعة عبر الواتساب</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                فريق متخصص للرد على استفساراتكم حول محتوى الكتب وتتبع طلبياتكم حتى وصولها إلى باب منزلكم أو مكتب ولايتكم.
              </p>
            </div>
          </div>
        </section>

        {/* Final Conversion Call to Action */}
        <section className="text-center py-12 px-6 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-[#123B5D]">ابدأ تحضيرك مبكراً</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            احصل على نسختك المطبوعة الآن واستعد بتميز
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            التوصيل متوفر لجميع الـ 58 ولاية جزائرية مع تأكيد هاتفي سريع وضمان الدفع عند الاستلام.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('books')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#123B5D] hover:bg-[#0E283F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              تصفح كتالوج الكتب واطلب الآن
            </button>
            <button
              onClick={() => setCurrentView('free-resources')}
              className="w-full sm:w-auto px-6 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              استكشف الموارد المجانية
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
