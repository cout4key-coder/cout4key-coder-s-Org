import React, { useState } from 'react';
import { useApp, ViewMode } from '../context/AppContext';
import { ShoppingBag, Menu, X, Shield, BookOpen, PhoneCall } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartTotalCount,
    setIsCartDrawerOpen,
    settings
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const navLinks: { label: string; view: ViewMode }[] = [
    { label: 'الرئيسية', view: 'home' },
    { label: 'الكتب والمراجع', view: 'books' },
    { label: 'مسابقات التوظيف', view: 'recruitment' },
    { label: 'مسابقات الترقية', view: 'promotion' },
    { label: 'الاختبارات التدريبية', view: 'practice-tests' },
    { label: 'مركز المعرفة', view: 'knowledge-center' },
    { label: 'الموارد المجانية', view: 'free-resources' }
  ];

  const handleNavClick = (view: ViewMode) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Quiet Announcement Ribbon */}
      {settings.announcementBannerActive && !bannerDismissed && (
        <div className="bg-[#123B5D] text-slate-100 text-xs py-2 px-4 border-b border-[#0E283F] flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full">
            <span className="font-semibold text-[#D9A441]">خدمة التوصيل السريع:</span>
            <span>{settings.announcementBannerText}</span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-slate-300 hover:text-white p-0.5 rounded cursor-pointer"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Strict 1-row, 3-zone Header Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single clean text element) */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-right group cursor-pointer shrink-0"
        >
          <img
            src="/covers/logo_bewaba_tarbia.png"
            alt="شعار بوابة التربية"
            className="w-12 h-12 object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
          />
          <div>
            <span className="text-xl font-extrabold text-[#123B5D] tracking-tight block leading-tight">
              بوابة التربية
            </span>
            <span className="text-[10px] font-bold text-slate-500 block tracking-widest uppercase font-sans">
              BAWABA TARBIA
            </span>
          </div>
        </button>

        {/* Zone 2: Single-line clean text links with subtle hover indicator */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-semibold text-slate-700 shrink-0">
          {navLinks.map(link => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                  isActive
                    ? 'text-[#123B5D] font-bold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#123B5D]'
                    : 'text-slate-600 hover:text-[#123B5D]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action CTA + Quick Cart & Admin Access */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart Icon Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#123B5D] transition-colors cursor-pointer"
            aria-label="عرض سلة الكتب"
            title="سلة الكتب"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D9A441] text-slate-950 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs font-mono">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* Admin shortcut button */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="لوحة الإدارة والطلبيات"
          >
            <Shield className="w-4 h-4 text-[#D9A441]" />
            <span className="hidden sm:inline">الإدارة</span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => handleNavClick('books')}
            className="hidden md:inline-flex px-4.5 py-2.5 bg-[#123B5D] hover:bg-[#0E283F] text-white text-xs font-bold rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            اكتشف المراجع
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-hidden"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl">
          <div className="space-y-1">
            {navLinks.map(link => (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`w-full text-right px-3 py-2.5 rounded-md text-sm font-semibold transition-colors block ${
                  currentView === link.view
                    ? 'bg-slate-100 text-[#123B5D] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('books')}
              className="w-full py-2.5 bg-[#123B5D] text-white font-bold text-sm rounded-lg text-center"
            >
              اكتشف كتب ومراجع المسابقات
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="w-full py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#123B5D]" />
              <span>اتصل بنا / طلب استشارة</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
