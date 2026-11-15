import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FreeResource } from '../types';
import { Download, FileText, CheckCircle2, ExternalLink, Plus, Search } from 'lucide-react';

export const FreeResources: React.FC = () => {
  const { resources, setCurrentView, refreshData } = useApp();
  const [downloadModalResource, setDownloadModalResource] = useState<FreeResource | null>(null);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAdminLogged = (() => {
    try {
      return sessionStorage.getItem('bt_admin_logged') === 'true';
    } catch {
      return false;
    }
  })();

  const categories = ['الكل', ...Array.from(new Set(resources.map(r => r.category).filter(Boolean)))];

  const filteredResources = resources.filter(res => {
    if (selectedCategory !== 'الكل' && res.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.targetRole.toLowerCase().includes(q) ||
        res.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isExternalLink = (url?: string) => Boolean(url && (url.startsWith('http://') || url.startsWith('https://')));
  const isGoogleDriveLink = (url?: string) => Boolean(url && url.includes('drive.google.com'));

  const handleDownloadClick = (res: FreeResource) => {
    setDownloadModalResource(res);
    setDownloadSuccess(false);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadModalResource) return;

    try {
      await fetch(`/api/resources/${downloadModalResource.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leadName, phone: leadPhone })
      });
      await refreshData();
      setDownloadSuccess(true);
    } catch (err) {
      console.error(err);
      setDownloadSuccess(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          بنك الموارد والملفات التعليمية المجانية
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          نماذج استمارات المسابقات الرسمية، ملخصات المواد التشريعية، وروابط التحميل المباشر من Google Drive متاحة مجاناً للمترشحين
        </p>

        {isAdminLogged && (
          <div className="mt-4">
            <button
              onClick={() => setCurrentView('admin')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006233] hover:bg-[#004e28] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إدارة الموارد (إضافة / حذف / روابط Google Drive)</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن ملف، ملخص، أو مسابقة..."
            className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#123B5D]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#123B5D] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          لا توجد موارد مطابقة لخيار البحث المحدد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map(res => (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-[#123B5D] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[#123B5D] truncate">{res.category}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-500 truncate">{res.targetRole}</span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0">{res.fileSize}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {res.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                  <span>
                    الصيغة: <strong className="font-mono text-slate-700">{res.format}</strong>
                  </span>
                  {isGoogleDriveLink(res.downloadUrl) && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-[#006233] font-bold">Google Drive مباشر</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleDownloadClick(res)}
                  className="px-4 py-2 bg-[#123B5D] hover:bg-[#0E283F] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الملف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead & Download Modal */}
      {downloadModalResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            {!downloadSuccess ? (
              <>
                <div className="w-10 h-10 rounded-lg bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  تحميل: {downloadModalResource.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  أدخل بياناتك الأساسية للوصول الفوري إلى رابط التحميل المباشر وتلقي مستجدات مسابقات قطاع التربية
                </p>

                <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">الاسم واللقب</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={e => setLeadName(e.target.value)}
                      placeholder="مثال: أمين بلقاسم"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">رقم الهاتف للتواصل</label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={e => setLeadPhone(e.target.value)}
                      placeholder="05 / 06 / 07 XX XX XX XX"
                      dir="ltr"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-right"
                    />
                  </div>

                  <p className="text-[10px] text-slate-400">
                    نحترم خصوصية بياناتك ولا نشاركها إطلاقاً مع أي أطراف ثالثة.
                  </p>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setDownloadModalResource(null)}
                      className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#123B5D] text-white font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>بدء التحميل الآن</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#006233] mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  الرابط جاهز للتحميل المباشر!
                </h3>
                <p className="text-xs text-slate-500">
                  {isExternalLink(downloadModalResource.downloadUrl)
                    ? 'اضغط على الزر أدناه لبدء تحميل الملف مباشرة من Google Drive / المصدر المعتمد.'
                    : 'تم تسجيل طلب التحميل. يرجى من الإدارة ربط رابط Google Drive لهذا المورد أو طلبه عبر واتساب.'}
                </p>
                <div className="pt-2 flex flex-col items-center gap-2">
                  {isExternalLink(downloadModalResource.downloadUrl) ? (
                    <a
                      href={downloadModalResource.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setTimeout(() => {
                          setDownloadModalResource(null);
                          setDownloadSuccess(false);
                        }, 1500);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006233] hover:bg-[#004e28] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isGoogleDriveLink(downloadModalResource.downloadUrl)
                          ? 'تحميل مباشر من Google Drive'
                          : 'فتح وتحميل الملف الآن'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadModalResource(null);
                        setDownloadSuccess(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#123B5D] hover:bg-[#0E283F] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      <span>حسناً</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDownloadModalResource(null);
                      setDownloadSuccess(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 mt-1 cursor-pointer"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
