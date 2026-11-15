import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CompetitionTrack, TargetRole, Product } from '../types';
import { ProductCard } from './ProductCard';
import { Compass, RotateCcw, Check, Sparkles, BookOpen } from 'lucide-react';

export const SmartFinderWizard: React.FC = () => {
  const { products, setCurrentView } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<CompetitionTrack | null>(null);
  const [selectedRole, setSelectedRole] = useState<TargetRole | null>(null);

  const rolesList: TargetRole[] = [
    'أستاذ التعليم الابتدائي',
    'أستاذ التعليم المتوسط',
    'أستاذ التعليم الثانوي',
    'مشرف التربية',
    'مربي متخصص',
    'مستشار التوجيه والإرشاد المدرسي والمهني',
    'مدير متوسطة',
    'مدير مدرسة ابتدائية',
    'مقتصد ومساعد مصالح اقتصادية'
  ];

  const handleSelectTrack = (track: CompetitionTrack) => {
    setSelectedTrack(track);
    setStep(2);
  };

  const handleSelectRole = (role: TargetRole) => {
    setSelectedRole(role);
    setStep(3);
  };

  const handleReset = () => {
    setSelectedTrack(null);
    setSelectedRole(null);
    setStep(1);
  };

  // Filter matching products
  const matchingProducts: Product[] = products.filter(p => {
    if (selectedTrack && selectedTrack !== 'كلاهما') {
      if (p.track !== selectedTrack && p.track !== 'كلاهما') return false;
    }
    if (selectedRole && selectedRole !== 'جميع الرتب') {
      if (p.targetRole !== selectedRole && p.targetRole !== 'جميع الرتب') return false;
    }
    return true;
  });

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs my-8">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-[#123B5D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">البوصلة الذكية لاختيار مراجعك</h2>
              <span className="text-[11px] bg-[#D9A441]/20 text-amber-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D9A441]" />
                مساعد التحضير
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              حدد مسارك ورتبتك للحصول على الحقيبة والمراجع المعتمدة لبرنامج مسابقتك بدقة
            </p>
          </div>
        </div>

        {step > 1 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#123B5D] font-medium border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة التحديد</span>
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="py-4">
        <div className="flex items-center justify-between max-w-md mx-auto text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#123B5D]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step > 1 ? 'bg-[#006233] text-white' : step === 1 ? 'bg-[#123B5D] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span>نوع المسابقة</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-200"></div>

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#123B5D]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step > 2 ? 'bg-[#006233] text-white' : step === 2 ? 'bg-[#123B5D] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span>الرتبة أو المنصب</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-200"></div>

          <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#123B5D]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 3 ? 'bg-[#123B5D] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </span>
            <span>المراجع المطابقة</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Track */}
      {step === 1 && (
        <div className="py-6 max-w-2xl mx-auto">
          <h3 className="text-center text-base font-bold text-slate-900 mb-6">
            الخطوة 1: ما هو نوع المسابقة التي تستعد لها؟
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectTrack('مسابقات التوظيف')}
              className="p-6 rounded-xl border-2 border-slate-200 hover:border-[#123B5D] bg-white text-right hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center mb-3 group-hover:bg-[#123B5D] group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">مسابقات التوظيف المباشر</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                للخريجين الجدد وحاملي شهادات الليسانس والماستر الراغبين في الالتحاق بسلك الأساتذة، مشرفي التربية، ومستشاري التوجيه.
              </p>
            </button>

            <button
              onClick={() => handleSelectTrack('مسابقات الترقية')}
              className="p-6 rounded-xl border-2 border-slate-200 hover:border-[#123B5D] bg-white text-right hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-[#D9A441]/10 text-[#D9A441] flex items-center justify-center mb-3 group-hover:bg-[#D9A441] group-hover:text-slate-950 transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">الامتحانات المهنية والترقية</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                لموظفي قطاع التربية الممارسين للترقية إلى رتبة أستاذ رئيسي، أستاذ مكون، مدير متوسطة، مدير مدرسة ابتدائية، ومفتش.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Role */}
      {step === 2 && (
        <div className="py-6 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs text-[#123B5D] font-bold">
              المسار المختار: {selectedTrack}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              الخطوة 2: اختر الرتبة أو التخصص الذي تريد التحضير له
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rolesList.map(role => (
              <button
                key={role}
                onClick={() => handleSelectRole(role)}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#123B5D] hover:bg-slate-50 bg-white text-right transition-all text-sm font-bold text-slate-800 hover:text-[#123B5D] shadow-2xs flex items-center justify-between group cursor-pointer"
              >
                <span>{role}</span>
                <span className="text-slate-300 group-hover:text-[#123B5D] text-lg font-light">←</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Matching Results */}
      {step === 3 && (
        <div className="py-6">
          <div className="bg-slate-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-600">
                نتائج مطابقة لـ: <strong className="text-slate-900">{selectedTrack}</strong> · الرتبة: <strong className="text-[#123B5D]">{selectedRole}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                تم العثور على {matchingProducts.length} {matchingProducts.length === 1 ? 'مرجع موجه' : 'مراجع موجهة'} لهذا التخصص
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                تغيير الرتبة
              </button>
              <button
                onClick={() => setCurrentView('books')}
                className="text-xs px-3 py-1.5 bg-[#123B5D] text-white rounded-lg font-bold hover:bg-[#0E283F] cursor-pointer"
              >
                عرض كامل الكتالوج
              </button>
            </div>
          </div>

          {matchingProducts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 p-6">
              <p className="text-sm font-bold text-slate-800 mb-1">
                المراجع الخاصة بهذه الرتبة قيد الإعداد أو التوزيع التبادلي
              </p>
              <p className="text-xs text-slate-500 mb-4">
                يمكنك طلب استشارة مخصصة عبر واتساب أو تصفح المراجع العامة في علوم التربية والتشريع المدرسي.
              </p>
              <button
                onClick={() => handleReset()}
                className="px-4 py-2 bg-[#123B5D] text-white text-xs font-bold rounded-lg"
              >
                إعادة البحث برتبة أخرى
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
