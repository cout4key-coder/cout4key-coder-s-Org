import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { HomeHeroAndCatalog } from './components/HomeHeroAndCatalog';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { OrderCheckout } from './components/OrderCheckout';
import { OrderConfirmedView } from './components/OrderConfirmedView';
import { PracticeTestsCatalog } from './components/PracticeTestsCatalog';
import { PracticeTestRunner } from './components/PracticeTestRunner';
import { KnowledgeCenter } from './components/KnowledgeCenter';
import { FreeResources } from './components/FreeResources';
import { AboutContact } from './components/AboutContact';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { MessageSquare } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, generateWhatsAppLink } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#D9A441]/20 selection:text-[#123B5D]">
      {/* 1-Row 3-Zone Sticky Header */}
      <Header />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && <HomeHeroAndCatalog />}
        {currentView === 'books' && (
          <CatalogPage 
            pageTitle="كتالوج الكتب والمراجع التعليمية"
            pageSubtitle="مراجع مطبوعة متخصصة ومصنفة حسب الرتبة والمسار مع إمكانية التوصيل لـ 58 ولاية"
          />
        )}
        {currentView === 'book-detail' && <ProductDetailPage />}
        {currentView === 'recruitment' && (
          <CatalogPage 
            forcedTrack="مسابقات التوظيف"
            pageTitle="مراجع مسابقات التوظيف المباشر"
            pageSubtitle="حقائب تدريبية ومراجع بيداغوجية لمسابقات توظيف الأساتذة، مشرفي التربية، ومستشاري التوجيه"
          />
        )}
        {currentView === 'promotion' && (
          <CatalogPage 
            forcedTrack="مسابقات الترقية"
            pageTitle="مراجع الامتحانات المهنية والترقية"
            pageSubtitle="كتب وأدلة تحليل الممارسات والتشريع المدرسي لرتبة أستاذ رئيسي، أستاذ مكون، ومدراء المؤسسات"
          />
        )}
        {currentView === 'practice-tests' && <PracticeTestsCatalog />}
        {currentView === 'test-runner' && <PracticeTestRunner />}
        {(currentView === 'knowledge-center' || currentView === 'article-detail') && <KnowledgeCenter />}
        {currentView === 'free-resources' && <FreeResources />}
        {currentView === 'order-checkout' && <OrderCheckout />}
        {currentView === 'order-confirmed' && <OrderConfirmedView />}
        {currentView === 'about' && <AboutContact initialTab="about" />}
        {currentView === 'contact' && <AboutContact initialTab="contact" />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Non-intrusive floating WhatsApp assistance widget */}
      <aside aria-label="مساعدة واتساب السريعة" className="fixed bottom-6 left-6 z-30">
        <a
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          title="محادثة فورية عبر واتساب"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline-block text-xs font-bold pl-1 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            طلب أو استفسار واتساب
          </span>
        </a>
      </aside>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
