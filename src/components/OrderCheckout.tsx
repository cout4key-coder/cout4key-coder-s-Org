import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wilaya } from '../types';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Building,
  Mail
} from 'lucide-react';

export const OrderCheckout: React.FC = () => {
  const { 
    cart, 
    cartSubtotalDZD, 
    wilayas, 
    setCurrentView, 
    setLastConfirmedOrder,
    clearCart,
    settings 
  } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default Alger
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentWilaya: Wilaya | undefined = wilayas.find(w => w.code === selectedWilayaCode);

  const deliveryFeeDZD = deliveryType === 'desk'
    ? (currentWilaya?.deskDeliveryFeeDZD ?? 400)
    : (currentWilaya?.homeDeliveryFeeDZD ?? 600);

  const grandTotalDZD = cartSubtotalDZD + deliveryFeeDZD;

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedWilayaCode(code);
    const matched = wilayas.find(w => w.code === code);
    if (matched && matched.communes && matched.communes.length > 0) {
      setCommune(matched.communes[0]);
    } else {
      setCommune('');
    }
  };

  const validatePhone = (num: string): boolean => {
    const clean = num.replace(/[\s-]/g, '');
    // Standard Algerian phone check: 05, 06, 07 followed by 8 digits, or +213 / 00213
    return /^((00213|\+213|0)[567][0-9]{8})$/.test(clean);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cart.length) {
      setErrorMsg('سلة الطلبات فارغة، يرجى اختيار الكتب أولاً');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 3) {
      setErrorMsg('يرجى إدخال الاسم واللقب الكامل بشكل صحيح');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 مكون من 10 أرقام');
      return;
    }

    if (!commune.trim()) {
      setErrorMsg('يرجى تحديد أو كتابة البلدية');
      return;
    }

    if (deliveryType === 'home' && (!address.trim() || address.trim().length < 5)) {
      setErrorMsg('يرجى كتابة عنوان التوصيل الدقيق للمنزل أو مقر العمل');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneSecondary: phoneSecondary.trim(),
        wilayaCode: selectedWilayaCode,
        wilayaName: currentWilaya ? `${currentWilaya.code} - ${currentWilaya.nameAr}` : 'غير محدد',
        commune: commune.trim(),
        address: address.trim() || (deliveryType === 'desk' ? 'استلام من مكتب التوصيل الولائي' : ''),
        deliveryType,
        items: cart.map(item => ({
          productId: item.product.id,
          productTitle: item.product.title,
          productPriceDZD: item.product.priceDZD,
          quantity: item.quantity,
          coverImage: item.product.coverImage
        })),
        notes: notes.trim()
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل في تسجيل الطلبية');
      }

      const createdOrder = await res.json();
      setLastConfirmedOrder(createdOrder);
      clearCart();
      setCurrentView('order-confirmed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى أو الطلب عبر الواتساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">سلة الكتب فارغة</h2>
        <p className="text-sm text-slate-500 mb-6">
          لم تختر أي كتاب أو مرجع بعد لإتمام الطلب
        </p>
        <button
          onClick={() => setCurrentView('books')}
          className="px-6 py-2.5 bg-[#123B5D] text-white font-bold text-xs rounded-lg hover:bg-[#0E283F] transition-colors"
        >
          تصفح كتب المسابقات الآن
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          إتمام طلب المراجع (الدفع عند الاستلام)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          خدمة التوصيل السريع متاحة لكافة الـ 58 ولاية الجزائرية · الدفع نقداً عند استلام ومعاينة طرد الكتب
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-5">
            {/* Customer Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#123B5D]" />
                  <span>الاسم واللقب الكامل <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="مثال: يوسف بن أحمد"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#123B5D] focus:ring-1 focus:ring-[#123B5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>البريد الإلكتروني (اختياري)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com (لوصل الطلبية)"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#123B5D] focus:ring-1 focus:ring-[#123B5D] text-right font-sans"
                />
              </div>
            </div>

            {/* Phone numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#123B5D]" />
                  <span>رقم الهاتف الأساسي <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="05 / 06 / 07 XX XX XX XX"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#123B5D] focus:ring-1 focus:ring-[#123B5D] text-right font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  سيتصل بكم موزع الطرود لتأكيد الطلب
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>رقم هاتف ثانٍ (احتياطي)</span>
                </label>
                <input
                  type="tel"
                  value={phoneSecondary}
                  onChange={e => setPhoneSecondary(e.target.value)}
                  placeholder="اختياري للتواصل الاحتياطي"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#123B5D] focus:ring-1 focus:ring-[#123B5D] text-right font-mono"
                />
              </div>
            </div>

            {/* Wilaya & Delivery Mode */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#123B5D]" />
                <span>خيارات التوصيل والولاية</span>
              </h3>

              {/* Delivery Type Switch */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('home')}
                  className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
                    deliveryType === 'home'
                      ? 'border-[#123B5D] bg-white text-[#123B5D] shadow-xs ring-1 ring-[#123B5D]'
                      : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">توصيل لباب المنزل / العمل</span>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {currentWilaya?.homeDeliveryFeeDZD ?? 600} دج
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('desk')}
                  className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
                    deliveryType === 'desk'
                      ? 'border-[#123B5D] bg-white text-[#123B5D] shadow-xs ring-1 ring-[#123B5D]'
                      : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">استلام من المكتب (Stop-Desk)</span>
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {currentWilaya?.deskDeliveryFeeDZD ?? 400} دج (سعر مخفض)
                  </span>
                </button>
              </div>

              {/* Wilaya Selection (All 58) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    الولاية (58 ولاية) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWilayaCode}
                    onChange={handleWilayaChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:border-[#123B5D] bg-white"
                  >
                    {wilayas.map(w => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr} ({w.nameFr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    البلدية <span className="text-red-500">*</span>
                  </label>
                  {currentWilaya?.communes && currentWilaya.communes.length > 0 ? (
                    <select
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:border-[#123B5D] bg-white"
                    >
                      {currentWilaya.communes.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      placeholder="اسم البلدية"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#123B5D] bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Detailed Address */}
              {deliveryType === 'home' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    العنوان التفصيلي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="الحي، رقم الشارع، رقم العمارة أو معالم قريبة"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#123B5D] bg-white"
                  />
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                  سيتم تسليم الطرد إلى مكتب الاستلام المعتمد بولاية <strong>{currentWilaya?.nameAr}</strong> وستصلكم رسالة نصية قصيرة SMS فور وصول الشحنة.
                </div>
              )}

              {/* Delivery delay note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#123B5D]" />
                <span>المدة المقدرة للتسليم: {currentWilaya?.deliveryDelayHours || '24 إلى 48 ساعة'}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ملاحظات إضافية للتوصيل (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="أوقات الاتصال المفضلة أو أي تفاصيل تخص العنوان..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#123B5D]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#D9A441] hover:bg-[#B8852B] text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الطلبية...</span>
                ) : (
                  <>
                    <span>تأكيد الطلبية والدفع عند الاستلام ({grandTotalDZD.toLocaleString()} دج)</span>
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                بالضغط على تأكيد الطلب، فإنك توافق على شروط التوصيل والدفع نقداً عند استلام الطرد.
              </p>
            </div>
          </form>
        </div>

        {/* Order Summary Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-200">
              ملخص الكتب المطلوبة ({cart.length})
            </h3>

            <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto py-2">
              {cart.map(item => (
                <div key={item.product.id} className="py-3 flex gap-3 items-center">
                  <div className="w-12 h-16 rounded bg-white border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={item.product.coverImage}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      الكمية: {item.quantity} × {item.product.priceDZD.toLocaleString()} دج
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#123B5D] font-mono tabular-nums shrink-0">
                    {(item.product.priceDZD * item.quantity).toLocaleString()} دج
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>مجموع الكتب:</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {cartSubtotalDZD.toLocaleString()} دج
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  رسوم التوصيل ({deliveryType === 'desk' ? 'استلام من المكتب' : 'توصيل للمنزل'} - {currentWilaya?.nameAr}):
                </span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {deliveryFeeDZD.toLocaleString()} دج
                </span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-extrabold text-[#123B5D]">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="text-base font-black font-mono tabular-nums text-slate-950">
                  {grandTotalDZD.toLocaleString()} دج
                </span>
              </div>
            </div>
          </div>

          {/* Trust Callout */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-[#006233]" />
              <span>ضمان المعاينة قبل الدفع</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              يمكنك معاينة غلاف ومحتوى الكتب عند وصول الموزع إليك قبل تسليم المبلغ نقداً للموزع.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
