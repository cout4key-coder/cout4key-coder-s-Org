import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Article } from '../types';
import { BookOpen, Clock, Calendar, ArrowLeft, ShieldCheck, Tag, Share2 } from 'lucide-react';

export const KnowledgeCenter: React.FC = () => {
  const { articles, selectedArticle, setSelectedArticle, currentView, setCurrentView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  const categories = [
    'الكل',
    'مسابقات التوظيف',
    'مسابقات الترقية',
    'علوم التربية',
    'التشريع المدرسي'
  ];

  const filteredArticles = articles.filter(a => {
    if (selectedCategory !== 'الكل' && a.category !== selectedCategory) return false;
    return true;
  });

  const handleOpenArticle = (art: Article) => {
    setSelectedArticle(art);
    setCurrentView('article-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in article detail mode
  if (currentView === 'article-detail' && selectedArticle) {
    const a = selectedArticle;
    return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={() => setCurrentView('home')} className="hover:text-[#123B5D]">الرئيسية</button>
          <span>/</span>
          <button onClick={() => setCurrentView('knowledge-center')} className="hover:text-[#123B5D]">مركز المعرفة</button>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{a.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#123B5D] font-bold mb-3">
            <span>{a.category}</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-500 font-normal">
              <Clock className="w-3.5 h-3.5" />
              {a.readingTimeMinutes} دقائق قراءة
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-500 font-normal">
              <Calendar className="w-3.5 h-3.5" />
              {a.publicationDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
            {a.title}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed font-medium pb-6 border-b border-slate-200">
            {a.excerpt}
          </p>

          {/* Official Verification Reference Ribbon */}
          {a.verifiedOfficialReference && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#006233] shrink-0" />
              <span>
                <strong>المرجع القانوني المعتمد:</strong> {a.verifiedOfficialReference}
              </span>
            </div>
          )}
        </header>

        {/* Article Body */}
        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-loose text-slate-800 space-y-6">
          {a.body.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-black text-[#123B5D] mt-8 mb-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={idx} className="space-y-2 list-disc list-inside pr-4 text-slate-700">
                  {items.map((it, i) => (
                    <li key={i}>{it.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={idx} className="leading-relaxed">{paragraph}</p>;
          })}
        </div>

        {/* Tags & Footer */}
        {a.tags && (
          <div className="mt-10 pt-6 border-t border-slate-200 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              الكلمات المفتاحية:
            </span>
            {a.tags.map((t, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => setCurrentView('knowledge-center')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#123B5D] hover:underline"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            <span>العودة لمقالات مركز المعرفة</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          مركز المعرفة والتشريع التربوي
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          مقالات منهجية، شروحات للنصوص القانونية والمراسيم التنفيذية، وتوجيهات بيداغوجية لمترشحي المسابقات
        </p>
      </div>

      {/* Category Filter Pills (Functional Buttons) */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-6 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#123B5D] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(art => (
          <article
            key={art.id}
            onClick={() => handleOpenArticle(art)}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer p-6 group"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-bold text-[#123B5D]">{art.category}</span>
                <span>·</span>
                <span>{art.readingTimeMinutes} د قراءة</span>
              </div>

              <h2 className="text-base font-bold text-slate-900 group-hover:text-[#123B5D] transition-colors leading-snug mb-3">
                {art.title}
              </h2>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {art.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">{art.publicationDate}</span>
              <span className="font-bold text-[#123B5D] flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                <span>قراءة المقال</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
