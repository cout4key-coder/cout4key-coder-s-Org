import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Wilaya, Order, PracticeQuiz, Article, FreeResource, SiteSettings } from '../types';

export type ViewMode = 
  | 'home'
  | 'books'
  | 'book-detail'
  | 'recruitment'
  | 'promotion'
  | 'practice-tests'
  | 'test-runner'
  | 'knowledge-center'
  | 'article-detail'
  | 'free-resources'
  | 'order-checkout'
  | 'order-confirmed'
  | 'about'
  | 'contact'
  | 'admin';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (a: Article | null) => void;
  selectedQuiz: PracticeQuiz | null;
  setSelectedQuiz: (q: PracticeQuiz | null) => void;
  lastConfirmedOrder: Order | null;
  setLastConfirmedOrder: (o: Order | null) => void;

  // Data lists
  products: Product[];
  wilayas: Wilaya[];
  articles: Article[];
  quizzes: PracticeQuiz[];
  resources: FreeResource[];
  settings: SiteSettings;
  loading: boolean;
  refreshData: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  cartTotalCount: number;
  cartSubtotalDZD: number;

  // WhatsApp Helper
  generateWhatsAppLink: (product?: Product | null, customText?: string) => string;
  
  // Navigation helpers
  navigateToBook: (product: Product) => void;
  navigateToArticle: (article: Article) => void;
  startQuiz: (quiz: PracticeQuiz) => void;
  checkoutProductDirectly: (product: Product) => void;
}

const defaultSettings: SiteSettings = {
  brandName: 'بوابة التربية | Bewaba Tarbia',
  brandDescriptor: 'مراجع متخصصة للتحضير لمسابقات التوظيف والترقية في قطاع التربية الوطنية بالجزائر',
  whatsappNumber: '213550000000',
  contactPhone: '0550 00 00 00',
  contactEmail: 'contact@bewaba-tarbia.dz',
  addressOffice: 'الجزائر العاصمة، الجزائر',
  socialFacebook: 'https://facebook.com/bewaba.tarbia',
  socialTelegram: 'https://t.me/bewaba_tarbia',
  socialYoutube: 'https://youtube.com/@bewaba_tarbia',
  announcementBannerText: 'توصيل سريع متاح لكافة الـ 58 ولاية · الدفع نقداً عند استلام طلبيتك للمنزل أو المكتب الولائي',
  announcementBannerActive: true,
  freeShippingThresholdDZD: 8000,
  orderVerificationNotice: 'تنبيه هام: يتصل بكم فريق التوزيع هاتفياً خلال 24 ساعة من تسجيل الطلب لتأكيد العنوان وموعد التسليم.'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<PracticeQuiz | null>(null);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [quizzes, setQuizzes] = useState<PracticeQuiz[]>([]);
  const [resources, setResources] = useState<FreeResource[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Cart state persisted
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bt_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('bt_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Load initial backend data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodsRes, wilayasRes, artsRes, quizRes, resRes, setsRes] = await Promise.all([
        fetch('/api/products').then(r => r.ok ? r.json() : []),
        fetch('/api/wilayas').then(r => r.ok ? r.json() : []),
        fetch('/api/articles').then(r => r.ok ? r.json() : []),
        fetch('/api/quizzes').then(r => r.ok ? r.json() : []),
        fetch('/api/resources').then(r => r.ok ? r.json() : []),
        fetch('/api/settings').then(r => r.ok ? r.json() : defaultSettings),
      ]);

      setProducts(prodsRes);
      setWilayas(wilayasRes);
      setArticles(artsRes);
      setQuizzes(quizRes);
      setResources(resRes);
      if (setsRes && setsRes.brandName) {
        setSettings(setsRes);
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalDZD = cart.reduce(
    (sum, item) => sum + item.product.priceDZD * item.quantity,
    0
  );

  const generateWhatsAppLink = (product?: Product | null, customText?: string) => {
    const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '213550000000';
    let message = '';

    if (customText) {
      message = customText;
    } else if (product) {
      message = `السلام عليكم ورحمة الله،\nأود الاستفسار وطلب هذا المرجع من منصة بوابة التربية:\n\n*${product.title}*\nالسعر: ${product.priceDZD} دج\nالرتبة المستهدفة: ${product.targetRole}\n\nيرجى تزويدي بتفاصيل التوصيل لولايتي وشكراً.`;
    } else {
      message = `السلام عليكم ورحمة الله،\nأود الاستفسار عن مراجع وكتب مسابقات قطاع التربية الوطنية المتاحة في بوابة التربية.`;
    }

    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  };

  const navigateToBook = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('book-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startQuiz = (quiz: PracticeQuiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('test-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const checkoutProductDirectly = (product: Product) => {
    // Add product to cart if not present
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (!exists) {
        return [...prev, { product, quantity: 1 }];
      }
      return prev;
    });
    setCurrentView('order-checkout');
    setIsCartDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        selectedArticle,
        setSelectedArticle,
        selectedQuiz,
        setSelectedQuiz,
        lastConfirmedOrder,
        setLastConfirmedOrder,
        products,
        wilayas,
        articles,
        quizzes,
        resources,
        settings,
        loading,
        refreshData: fetchData,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cartTotalCount,
        cartSubtotalDZD,
        generateWhatsAppLink,
        navigateToBook,
        navigateToArticle,
        startQuiz,
        checkoutProductDirectly
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
