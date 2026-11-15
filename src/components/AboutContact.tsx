import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building, 
  BookOpen, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const AboutContact: React.FC<{ initialTab?: 'about' | 'contact' }> = ({ initialTab = 'about' }) => {
  const { settings, generateWhatsAppLink } = useApp();
  const [tab, setTab] = useState<'about' | 'contact'>(initialTab);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setContactName('');
      setContactPhone('');
      setContactSubject('');
      setContactMessage('');
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Tab switch */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setTab('about')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'about'
                ? 'bg-white text-[#123B5D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            من نحن ورؤيتنا
          </button>
          <button
            onClick={() => setTab('contact')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'contact'
                ? 'bg-white text-[#123B5D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            اتصل بنا وقنوات الدعم
          </button>
        </div>
      </div>

      {tab === 'about' ? (
        /* About Us View */
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <img
              src="/covers/logo_bewaba_tarbia.png"
              alt="شعار بوابة التربية"
              className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-sm"
            />
            <span className="text-xs font-bold text-[#123B5D]">بوابة التربية · The Gateway to Professional Progress</span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
              مراجع متخصصة للتحضير المهني في قطاع التربية
            </h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              تأسست «بوابة التربية» استجابة لحاجة ملحة لدى المترشحين الجزائريين في مسابقات التوظيف والترقية إلى مراجع بيداغوجية وتشريعية موثقة، تحل محل المحتويات المشتتة وتوفر إعداداً أكاديمياً وعملياً رصيناً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">دقة المحتوى البيداغوجي</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                تُبنى كتبنا ومراجعنا بالاستناد إلى المحاور الرسمية الصادرة في القرارات الوزارية المنظمة للمسابقات، مع الاستعانة بمفتشين وأساتذة باحثين في علوم التربية.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#D9A441]/10 text-[#D9A441] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">الشفافية والمصداقية المهنية</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                نعتمد الشفافية التامة؛ لا ندعي أي صفة رسمية أو تمثيل لوزارة التربية الوطنية، بل نقدم عملاً نشر وتأطير مستقل مبني على معايير الجودة والنشر الرصين.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#006233]/10 text-[#006233] flex items-center justify-center mb-3">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">تغطية وطنية شاملة 58 ولاية</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                نوصل المراجع الورقية لكل مدن وقرى الجزائر مع تمكين الزبون من المعاينة قبل الدفع لضمان الثقة والراحة التامة للمترشحين.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Contact Us View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">يسعدنا تواصلكم واستفساراتكم</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                سواء كنت تستفسر عن توفر كتاب معين، أو تتابع شحنة طلبيتك، فريق بوابة التربية في خدمتكم طيلة أيام الأسبوع.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 hover:bg-emerald-100 transition-colors block"
              >
                <MessageSquare className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <strong className="block text-sm font-bold">التواصل الفوري عبر الواتساب</strong>
                  <span className="font-mono text-xs">{settings.whatsappNumber}</span>
                </div>
              </a>

              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-slate-700">
                <Phone className="w-5 h-5 text-[#123B5D] shrink-0" />
                <div>
                  <strong className="block text-xs font-bold text-slate-900">الهاتف المباشر</strong>
                  <span className="font-mono">{settings.contactPhone}</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-slate-700">
                <Mail className="w-5 h-5 text-[#123B5D] shrink-0" />
                <div>
                  <strong className="block text-xs font-bold text-slate-900">البريد الإلكتروني</strong>
                  <span className="font-mono">{settings.contactEmail}</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-[#123B5D] shrink-0" />
                <div>
                  <strong className="block text-xs font-bold text-slate-900">مقر الإدارة والتوزيع</strong>
                  <span>{settings.addressOffice}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              إرسال رسالة أو استفسار
            </h3>

            {sentSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">تم استلام رسالتكم بنجاح!</h4>
                <p className="text-xs text-emerald-700">
                  سيتواصل معكم فريق الدعم والتوزيع عبر الهاتف أو الواتساب في أقرب وقت.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">الاسم واللقب</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="اسمك الكامل"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="05 / 06 / 07 XX XX XX XX"
                      dir="ltr"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">موضوع الاستفسار</label>
                  <input
                    type="text"
                    required
                    value={contactSubject}
                    onChange={e => setContactSubject(e.target.value)}
                    placeholder="مثال: استفسار عن كتاب مسابقة مشرف التربية لولاية وهران"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">نص الرسالة</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    placeholder="اكتب استفسارك بالتفصيل..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#123B5D] hover:bg-[#0E283F] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الرسالة</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
