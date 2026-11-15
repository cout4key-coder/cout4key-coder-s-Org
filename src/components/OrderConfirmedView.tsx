import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Copy, Check, MessageSquare, ArrowLeft, Printer, PhoneCall, Truck } from 'lucide-react';

export const OrderConfirmedView: React.FC = () => {
  const { lastConfirmedOrder, setCurrentView, generateWhatsAppLink } = useApp();
  const [copied, setCopied] = useState(false);

  if (!lastConfirmedOrder) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-600 mb-4">لا توجد طلبية معروضة حالياً</p>
        <button
          onClick={() => setCurrentView('books')}
          className="px-4 py-2 bg-[#123B5D] text-white text-xs font-bold rounded-lg"
        >
          العودة للكتب والمراجع
        </button>
      </div>
    );
  }

  const o = lastConfirmedOrder;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(o.referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = `السلام عليكم ورحمة الله،\nأنا الزبون: *${o.customerName}*\nلقد قمت بتسجيل طلبية على موقع بوابة التربية برمز: *${o.referenceCode}*\nالمبلغ الإجمالي: *${o.totalDZD} دج*\nالولاية: *${o.wilayaName}*\nأود تأكيد طلبي وشكراً.`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006233] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          تم تسجيل طلبيتك بنجاح!
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          شكراً لثقتكم ببوابة التربية. تم إرسال بيانات طلبك إلى مصلحة التوزيع والشحن.
        </p>

        {/* Reference Code Box */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl inline-flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">رمز متابعة الطلبية:</span>
          <span className="text-xl font-black font-mono text-[#123B5D] tracking-wider">
            {o.referenceCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded bg-white border border-slate-200 shadow-2xs text-xs flex items-center gap-1 cursor-pointer"
            title="نسخ رمز الطلب"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>

        {/* Timeline / Next Steps */}
        <div className="my-8 text-right bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="text-xs font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            ماذا سيحدث بعد الآن؟ (مراحل معالجة الطلب):
          </h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <strong className="block text-xs font-bold text-slate-900">الاتصال الهاتفي للتأكيد</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  سيتصل بكم أحد ممثلي فريق التوزيع على الرقم <strong className="font-mono">{o.phone}</strong> خلال 24 ساعة لتأكيد رغبتكم وتحديد موعد التسليم.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <strong className="block text-xs font-bold text-slate-900">تجهيز وشحن الطرد</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  تُغلّف كتبكم بعناية وتُسلّم إلى شركة التوصيل السريع المتوجهة لولاية <strong>{o.wilayaName}</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#006233] text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <strong className="block text-xs font-bold text-slate-900">المعاينة والدفع عند الاستلام</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  يصلكم الطرد {o.deliveryType === 'home' ? 'لباب المنزل' : 'لمكتب الاستلام'}، وتدفعون المبلغ نقداً للموزع بعد التحقق من الكتب.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Receipt */}
        <div className="text-right border border-slate-200 rounded-xl p-5 mb-8">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3 text-xs text-slate-500">
            <span>الزبون: <strong className="text-slate-800">{o.customerName}</strong></span>
            <span>الوجهة: <strong className="text-slate-800">{o.wilayaName} - {o.commune}</strong></span>
          </div>

          <div className="space-y-2 mb-4">
            {o.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-slate-700">
                <span>{item.productTitle} × {item.quantity}</span>
                <span className="font-mono font-bold">{(item.productPriceDZD * item.quantity).toLocaleString()} دج</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>مصاريف التوصيل:</span>
              <span className="font-mono font-semibold">{o.deliveryFeeDZD.toLocaleString()} دج</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#123B5D] pt-2 border-t border-slate-200">
              <span>المجموع الكلي للدفع عند الاستلام:</span>
              <span className="font-mono font-black text-base">{o.totalDZD.toLocaleString()} دج</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={generateWhatsAppLink(null, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-[#006233] hover:bg-[#004e28] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>تأكيد أسرع عبر الواتساب</span>
          </a>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوصل</span>
          </button>

          <button
            onClick={() => setCurrentView('books')}
            className="w-full sm:w-auto px-5 py-3 bg-[#123B5D] hover:bg-[#0E283F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>مواصلة تصفح المراجع</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
