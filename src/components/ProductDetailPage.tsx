import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { 
  ArrowRight, 
  ShoppingBag, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Clock,
  Share2
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { 
    selectedProduct, 
    setCurrentView, 
    products, 
    addToCart, 
    checkoutProductDirectly,
    generateWhatsAppLink 
  } = useApp();

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'toc' | 'faqs'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-600 mb-4">لم يتم اختيار أي كتاب للمعاينة</p>
        <button
          onClick={() => setCurrentView('books')}
          className="px-4 py-2 bg-[#123B5D] text-white text-xs font-bold rounded-lg"
        >
          العودة إلى الكتب والمراجع
        </button>
      </div>
    );
  }

  const p = selectedProduct;

  // Related products in the same track or role
  const relatedProducts = products
    .filter(item => item.id !== p.id && (item.track === p.track || item.targetRole === p.targetRole))
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: p.title,
        text: p.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button 
          onClick={() => setCurrentView('home')} 
          className="hover:text-[#123B5D] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <button 
          onClick={() => setCurrentView('books')} 
          className="hover:text-[#123B5D] transition-colors cursor-pointer"
        >
          الكتب والمراجع
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{p.title}</span>
      </nav>

      {/* Main 2-Column Split: Sticky Purchase Module (Right in RTL, or Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Visual Cover & Gallery Slot (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-center aspect-[3/4] relative">
            <img
              src={p.coverImage}
              alt={`غلاف كتاب ${p.title}`}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain drop-shadow-xl"
            />

            <div className="absolute top-4 right-4 bg-[#123B5D] text-[#D9A441] text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
              {p.edition}
            </div>
          </div>

          {/* Quick Details Badges Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="block text-[11px] text-slate-500">نوع النسخة</span>
              <strong className="block text-xs font-bold text-slate-800 mt-0.5">{p.format}</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="block text-[11px] text-slate-500">عدد الصفحات</span>
              <strong className="block text-xs font-bold text-slate-800 font-mono mt-0.5">
                {p.pages ? `${p.pages} ص` : 'غير محدد'}
              </strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="block text-[11px] text-slate-500">المسار</span>
              <strong className="block text-xs font-bold text-[#123B5D] mt-0.5 truncate">{p.track}</strong>
            </div>
          </div>
        </div>

        {/* Purchase Module & Editorial Description (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Unboxed Metadata (Zero-Pill Rule) */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-bold text-[#123B5D] text-sm">{p.targetRole}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{p.track}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-[#006233] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {p.stockStatusLabel || 'متوفر بالمخزن'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {p.title}
            </h1>

            {p.subtitle && (
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                {p.subtitle}
              </p>
            )}

            {/* Pricing Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-3xl font-black text-[#123B5D] font-mono tabular-nums">
                    {p.priceDZD.toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-slate-700 mr-2">دينار جزائري (دج)</span>
                  {p.originalPriceDZD && (
                    <span className="text-sm text-slate-400 line-through mr-3 font-mono">
                      {p.originalPriceDZD.toLocaleString()} دج
                    </span>
                  )}
                </div>

                <button
                  onClick={handleShare}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                  title="مشاركة رابط الكتاب"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'مشاركة'}</span>
                </button>
              </div>

              {/* Quantity Stepper & Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex items-center justify-between border border-slate-300 rounded-lg bg-white px-3 py-2 w-full sm:w-36">
                  <span className="text-xs text-slate-500">الكمية:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-slate-600 font-bold hover:text-slate-900 px-1 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-slate-900 text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-slate-600 font-bold hover:text-slate-900 px-1 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => checkoutProductDirectly(p)}
                  className="flex-1 py-3 px-6 bg-[#D9A441] hover:bg-[#B8852B] text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>اطلب الآن (الدفع عند الاستلام)</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>

                <button
                  onClick={() => addToCart(p, quantity)}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة للسلة</span>
                </button>
              </div>

              {/* WhatsApp direct order */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Truck className="w-4 h-4" />
                  <span>توصيل لكافة الـ 58 ولاية · الدفع نقداً عند الاستلام</span>
                </div>
                <a
                  href={generateWhatsAppLink(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold self-start sm:self-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>طلب مباشر عبر الواتساب</span>
                </a>
              </div>
            </div>

            {/* Guarantees Strip */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 py-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#123B5D]" />
                <span>محتوى منهجي مطابق للمحاور الرسمية للمسابقة</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#123B5D]" />
                <span>تأكيد هاتفي سريع خلال 24 ساعة من التسجيل</span>
              </div>
            </div>

            {/* Tabbed Content: Overview / Table of contents / FAQs */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#123B5D] text-white'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  وصف الكتاب والمحتوى
                </button>
                {p.tableOfContents && (
                  <button
                    onClick={() => setActiveTab('toc')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      activeTab === 'toc'
                        ? 'bg-[#123B5D] text-white'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                    }`}
                  >
                    فهرس المحتويات ({p.tableOfContents.length} أبواب)
                  </button>
                )}
                {p.faqs && p.faqs.length > 0 && (
                  <button
                    onClick={() => setActiveTab('faqs')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      activeTab === 'faqs'
                        ? 'bg-[#123B5D] text-white'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                    }`}
                  >
                    الأسئلة الشائعة
                  </button>
                )}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <p>{p.description}</p>

                  {p.features && p.features.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold text-slate-900 mb-2 text-xs">أبرز ما يميز هذا الإصدار:</h4>
                      <ul className="space-y-1.5">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="text-[#006233] font-bold mt-0.5">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.intendedAudience && p.intendedAudience.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2 text-xs">الفئة المستهدفة من هذا المرجع:</h4>
                      <ul className="space-y-1">
                        {p.intendedAudience.map((aud, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#123B5D]" />
                            <span>{aud}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Table of contents */}
              {activeTab === 'toc' && p.tableOfContents && (
                <div className="space-y-3">
                  {p.tableOfContents.map((chap, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#123B5D]" />
                          <span>{chap.chapter}</span>
                        </div>
                        {chap.pagesRange && (
                          <span className="text-slate-500 font-mono font-normal">{chap.pagesRange}</span>
                        )}
                      </div>
                      {chap.topics && (
                        <ul className="mt-2 space-y-1 pr-6 list-disc list-inside text-xs text-slate-600">
                          {chap.topics.map((top, tIdx) => (
                            <li key={tIdx}>{top}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: FAQs */}
              {activeTab === 'faqs' && p.faqs && (
                <div className="space-y-3">
                  {p.faqs.map((faq, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <HelpCircle className="w-4 h-4 text-[#D9A441]" />
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-xs text-slate-600 pr-5 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">مراجع أخرى ذات صلة</h2>
              <p className="text-xs text-slate-500 mt-0.5">كتب مكملة للتحضير لنفس الرتبة أو المسار</p>
            </div>
            <button
              onClick={() => setCurrentView('books')}
              className="text-xs font-bold text-[#123B5D] hover:underline"
            >
              عرض الكتالوج الكامل ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
