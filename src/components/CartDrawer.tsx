import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotalDZD,
    cartTotalCount,
    setCurrentView
  } = useApp();

  if (!isCartDrawerOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    setCurrentView('order-checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 md:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#123B5D]" />
              <h2 className="text-lg font-bold text-slate-900">سلة المراجع المطلوبة</h2>
              <span className="text-xs bg-[#123B5D]/10 text-[#123B5D] px-2 py-0.5 rounded-full font-medium">
                {cartTotalCount} {cartTotalCount === 1 ? 'مرجع' : 'مراجع'}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-slate-800 mb-1">سلة الطلبات فارغة حالياً</p>
                <p className="text-sm text-slate-500 mb-6">تصفح مراجع مسابقات التوظيف والترقية واختر كتبك المفضلة</p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setCurrentView('books');
                  }}
                  className="px-5 py-2.5 bg-[#123B5D] text-white text-sm font-semibold rounded-lg hover:bg-[#0E283F] transition-colors"
                >
                  استعراض كتالوج الكتب
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="py-4 first:pt-0 flex gap-4">
                  <div className="w-18 h-24 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                    <img
                      src={item.product.coverImage}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.product.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.product.targetRole}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#123B5D] font-mono tabular-nums">
                          {(item.product.priceDZD * item.quantity).toLocaleString()} دج
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="حذف من السلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>المجموع الفرعي للكتب:</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums">
                    {cartSubtotalDZD.toLocaleString()} دج
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>مصاريف التوصيل:</span>
                  <span>تحتسب بحسب الولاية ونوع الاستلام</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-[#123B5D]">
                  <span>المجموع التقديري:</span>
                  <span className="font-mono tabular-nums text-lg">
                    {cartSubtotalDZD.toLocaleString()} دج
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 px-4 bg-[#D9A441] hover:bg-[#B8852B] text-slate-950 font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>متابعة إتمام الطلب (الدفع عند الاستلام)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <p className="text-center text-[11px] text-slate-500">
                  توصيل إلى 58 ولاية · الدفع نقداً عند معاينة واستلام الطرد
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
