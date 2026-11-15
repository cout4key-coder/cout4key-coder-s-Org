import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { CompetitionTrack, TargetRole, Product } from '../types';
import { Search, Filter, BookOpen, RotateCcw } from 'lucide-react';

interface CatalogPageProps {
  forcedTrack?: CompetitionTrack;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  forcedTrack, 
  pageTitle = 'الكتب والمراجع البيداغوجية', 
  pageSubtitle = 'مراجع ورقية مطبوعة وأدلة منهجية معتمدة للتحضير لمسابقات التوظيف والترقية'
}) => {
  const { products } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('الكل');
  const [selectedTrack, setSelectedTrack] = useState<string>(forcedTrack || 'الكل');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const allRoles: TargetRole[] = [
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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Track filter
      if (forcedTrack && p.track !== forcedTrack && p.track !== 'كلاهما') {
        return false;
      } else if (!forcedTrack && selectedTrack !== 'الكل') {
        if (p.track !== selectedTrack && p.track !== 'كلاهما') return false;
      }

      // Role filter
      if (selectedRole !== 'الكل' && p.targetRole !== selectedRole && p.targetRole !== 'جميع الرتب') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSub = p.subtitle?.toLowerCase().includes(q) ?? false;
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesRole = p.targetRole.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesDesc && !matchesRole) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceDZD - b.priceDZD;
      if (sortBy === 'price-desc') return b.priceDZD - a.priceDZD;
      return 0;
    });
  }, [products, forcedTrack, selectedTrack, selectedRole, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('الكل');
    if (!forcedTrack) setSelectedTrack('الكل');
    setSortBy('default');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          {pageSubtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Field (5 cols) */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان، الرتبة، أو الكلمات المفتاحية..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#123B5D] focus:ring-1 focus:ring-[#123B5D]"
            />
          </div>

          {/* Role Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#123B5D] bg-white font-medium"
            >
              <option value="الكل">جميع الرتب والتخصصات</option>
              {allRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Track Filter (if not forced) (2 cols) */}
          {!forcedTrack && (
            <div className="sm:col-span-2">
              <select
                value={selectedTrack}
                onChange={e => setSelectedTrack(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#123B5D] bg-white font-medium"
              >
                <option value="الكل">جميع المسارات</option>
                <option value="مسابقات التوظيف">مسابقات التوظيف</option>
                <option value="مسابقات الترقية">مسابقات الترقية</option>
              </select>
            </div>
          )}

          {/* Sort By (2 cols) */}
          <div className={forcedTrack ? 'sm:col-span-4' : 'sm:col-span-2'}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#123B5D] bg-white font-medium"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {/* Active Filters Kicker & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            تم العثور على <strong className="text-slate-900 font-mono">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'مرجع متاح' : 'مراجع متاحة'}
          </span>

          {(searchQuery || selectedRole !== 'الكل' || (!forcedTrack && selectedTrack !== 'الكل') || sortBy !== 'default') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-[#123B5D] font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط التصفية</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">لم يتم العثور على مراجع مطابقة</h3>
          <p className="text-xs text-slate-500 mb-4">
            جرب تعديل كلمات البحث أو اختيار رتبة مختلفة من قائمة التصفية
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#123B5D] text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            عرض كافة المراجع
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
