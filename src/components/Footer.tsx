import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Shield, Truck, MessageSquare, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, settings, generateWhatsAppLink } = useApp();

  return (
    <footer className="bg-[#123B5D] text-slate-300 pt-12 pb-8 border-t border-[#0E283F] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-700/60">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/covers/logo_bewaba_tarbia.png"
                alt="شعار بوابة التربية"
                className="w-12 h-12 object-contain bg-white rounded-xl p-1"
              />
              <div>
                <span className="text-xl font-black text-white block leading-tight">
                  بوابة التربية
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  The Gateway to Professional Progress
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              منصة نشر وتجارة تعليمية متخصصة في مراجع التحضير لمسابقات التوظيف والامتحانات المهنية في قطاع التربية الوطنية بالجزائر.
            </p>

            <div className="pt-1">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>الطلب المباشر عبر الواتساب</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <span>أقسام المنصة</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('books')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  الكتالوج الكامل للكتب والمراجع
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('recruitment')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  مسابقات التوظيف (الأساتذة والمشرفون)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('promotion')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  مسابقات الترقية والامتحانات المهنية
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('practice-tests')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  بنك الاختبارات التدريبية الموقوتة
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('free-resources')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  الموارد والملفات التعليمية المجانية
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('knowledge-center')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-300"
                >
                  مركز المعرفة ومقالات التشريع المدرسي
                </button>
              </li>
            </ul>
          </div>

          {/* Algerian Commerce & Delivery Policy */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#D9A441]" />
              <span>التوصيل والدفع في الجزائر</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p>
                • <strong>تغطية 58 ولاية:</strong> نوصل المراجع لكافة ولايات الوطن من أدرار إلى المنيعة.
              </p>
              <p>
                • <strong>الدفع عند الاستلام (COD):</strong> تدفع نقداً بالدينار الجزائري بعد استلام الطرد ومعاينة المرجع.
              </p>
              <p>
                • <strong>خيار التوصيل للمكتب أو المنزل:</strong> يمكنك اختيار الاستلام من مكتب التوصيل الولائي بسعر اقتصادي مخفض.
              </p>
            </div>
          </div>

          {/* Legal Transparency & Disclaimer */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#D9A441]" />
              <span>إشعار الشفافية والمسؤولية</span>
            </h4>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 leading-relaxed space-y-2">
              <p>
                <strong>تنويه قانوني هام:</strong> منصة «بوابة التربية» هي مشروع نشر وإعداد مهني مستقل، <em>ولا تدعي أي انتماء أو تبعية رسمية لوزارة التربية الوطنية</em> أو أي هيئة حكومية جزائرية.
              </p>
              <p className="text-slate-400">
                المحتويات المنشورة تمثل قراءات منهجية وتحليلات بيداغوجية للنصوص الرسمية المعلنة وفق القوانين الجزائرية.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} بوابة التربية | Bewaba Tarbia.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setCurrentView('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              من نحن
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentView('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              اتصل بنا
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentView('admin')}
              className="hover:text-[#D9A441] transition-colors cursor-pointer font-bold"
            >
              مدخل الإدارة
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
