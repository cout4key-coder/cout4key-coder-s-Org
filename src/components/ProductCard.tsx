import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ShoppingBag, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateToBook, addToCart, checkoutProductDirectly, generateWhatsAppLink } = useApp();

  return (
    <article className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
      {/* 65% Card Height Cover Slot */}
      <div 
        onClick={() => navigateToBook(product)}
        className="relative bg-slate-100 aspect-[3/4] overflow-hidden cursor-pointer flex items-center justify-center p-4 border-b border-slate-100"
      >
        <img
          src={product.coverImage}
          alt={`غلاف ${product.title}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain drop-shadow-md group-hover:scale-102 transition-transform duration-300"
        />

        {/* Clean unboxed availability tag top left */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800 border border-slate-200/80 shadow-xs flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#006233]" />
          <span>{product.stockStatusLabel || 'متوفر بالمخزن'}</span>
        </div>

        {product.isNewRelease && (
          <div className="absolute top-3 right-3 bg-[#123B5D] text-[#D9A441] px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
            إصدار 2026
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean Unboxed Metadata with middots (Zero-Pill Rule) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 flex-wrap">
            <span className="font-medium text-[#123B5D]">{product.targetRole}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{product.track}</span>
            {product.pages && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-mono tabular-nums">{product.pages} صفحة</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => navigateToBook(product)}
            className="text-base font-bold text-slate-900 group-hover:text-[#123B5D] transition-colors leading-snug cursor-pointer line-clamp-2"
          >
            {product.title}
          </h3>

          {product.subtitle && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.subtitle}
            </p>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-extrabold text-[#123B5D] font-mono tabular-nums">
                {product.priceDZD.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-600 mr-1">دج</span>

              {product.originalPriceDZD && product.originalPriceDZD > product.priceDZD && (
                <span className="text-xs text-slate-400 line-through mr-2 font-mono tabular-nums">
                  {product.originalPriceDZD.toLocaleString()} دج
                </span>
              )}
            </div>
            
            <span className="text-[11px] text-slate-500">
              {product.format}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => checkoutProductDirectly(product)}
              className="py-2 px-3 bg-[#D9A441] hover:bg-[#B8852B] text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>اطلب الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => addToCart(product, 1)}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#123B5D]" />
              <span>إضافة للسلة</span>
            </button>
          </div>

          {/* Quick WhatsApp Order link */}
          <div className="mt-2 text-center">
            <a
              href={generateWhatsAppLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>استفسار أو طلب عبر واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
