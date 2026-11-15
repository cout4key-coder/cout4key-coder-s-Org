import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, Product, TargetRole, CompetitionTrack, Wilaya, PracticeQuiz, QuizQuestion, FreeResource } from '../types';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Settings, 
  Phone, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  RefreshCw, 
  Search, 
  MessageSquare,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  BookOpen,
  X,
  Database,
  Copy,
  Server,
  Award,
  FileText,
  Link2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { products, wilayas, quizzes, resources, settings, refreshData, navigateToBook, startQuiz } = useApp();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bt_admin_logged') === 'true';
    } catch {
      return false;
    }
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Tabs & Data
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'quizzes' | 'resources' | 'wilayas' | 'settings'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('الكل');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Practice Quizzes Management State
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<PracticeQuiz | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const createEmptyQuestion = (idx = 1): QuizQuestion => ({
    id: `q-${Date.now()}-${idx}`,
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    topic: ''
  });
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTargetRole, setQuizTargetRole] = useState<TargetRole>('مشرف التربية');
  const [quizTrack, setQuizTrack] = useState<CompetitionTrack>('مسابقات التوظيف');
  const [quizSubject, setQuizSubject] = useState('');
  const [quizDuration, setQuizDuration] = useState<number>(15);
  const [quizDescription, setQuizDescription] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([createEmptyQuestion(1)]);

  // Free Resources Management State (Including Direct Google Drive Links)
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<FreeResource | null>(null);
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState('التشريع المدرسي');
  const [resTargetRole, setResTargetRole] = useState<TargetRole>('جميع الرتب');
  const [resFormat, setResFormat] = useState('PDF');
  const [resFileSize, setResFileSize] = useState('Google Drive');
  const [resDownloadUrl, setResDownloadUrl] = useState('');
  const [resAutoConvertDrive, setResAutoConvertDrive] = useState(true);
  const [resDescription, setResDescription] = useState('');

  const previewDirectDriveUrl = (url: string, autoConvert: boolean): string => {
    const trimmed = url.trim();
    if (!trimmed || !autoConvert) return trimmed;
    const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
    }
    const idMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
    return trimmed;
  };

  // New Product Form State
  const initialNewProduct: Partial<Product> = {
    title: '',
    subtitle: '',
    targetRole: 'مشرف التربية',
    track: 'مسابقات التوظيف',
    priceDZD: 1900,
    originalPriceDZD: 2300,
    edition: 'طبعة 2026',
    pages: 300,
    format: 'مطبوع غلاف ملون فاخر',
    coverImage: '/covers/book_dalil_mouchrif.png',
    inStock: true,
    stockStatusLabel: 'متوفر بالمخزن',
    description: '',
    features: ['محتوى مطابق للبرنامج الرسمي للمسابقة', 'مواضيع سابقة محلولة مع سلالم التنقيط'],
    intendedAudience: ['المترشحون لمسابقات قطاع التربية الوطنية']
  };

  const [newProductForm, setNewProductForm] = useState<Partial<Product>>(initialNewProduct);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Settings State
  const [adminWhatsapp, setAdminWhatsapp] = useState(settings.whatsappNumber);
  const [adminPhone, setAdminPhone] = useState(settings.contactPhone);
  const [adminEmail, setAdminEmail] = useState(settings.contactEmail);
  const [adminBanner, setAdminBanner] = useState(settings.announcementBannerText);
  const [adminBannerActive, setAdminBannerActive] = useState(settings.announcementBannerActive);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Change Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passChangeMsg, setPassChangeMsg] = useState({ text: '', isError: false });

  // Wilaya Rates Editing State
  const [editingWilaya, setEditingWilaya] = useState<Wilaya | null>(null);
  const [wilayaDeskFee, setWilayaDeskFee] = useState<number>(400);
  const [wilayaHomeFee, setWilayaHomeFee] = useState<number>(600);
  const [wilayaDelay, setWilayaDelay] = useState<string>('24 - 48 ساعة');
  const [isSavingWilaya, setIsSavingWilaya] = useState<boolean>(false);

  // Standard Available Real Covers for Quick Selection
  const availableCovers = [
    { label: 'كتاب الدليل (مشرف تربية)', path: '/covers/book_dalil_mouchrif.png' },
    { label: 'كتاب المرشد (مستشار التوجيه)', path: '/covers/book_murchid_tawdjih.png' },
    { label: 'كتاب القائد (مدير متوسطة وثانوية)', path: '/covers/book_qaid_moudir.png' },
    { label: 'كتاب القائد (مدير مدرسة ابتدائية)', path: '/covers/book_qaid_moudir_ibtidai.png' },
    { label: 'كتاب الدليل (مربي متخصص)', path: '/covers/book_dalil_morabi_khas.png' },
    { label: 'الوجيز في علوم التربية (أساتذة)', path: '/covers/cover_ouloum_tarbia.svg' },
    { label: 'دليل الترقية (أستاذ رئيسي ومكون)', path: '/covers/cover_tarqiya.svg' },
    { label: 'التسيير المالي (مقتصد ومساعد)', path: '/covers/cover_mouqtasid.svg' }
  ];

  const allRoles: TargetRole[] = [
    'أستاذ التعليم الابتدائي',
    'أستاذ التعليم المتوسط',
    'أستاذ التعليم الثانوي',
    'مشرف التربية',
    'مربي متخصص',
    'مستشار التوجيه والإرشاد المدرسي والمهني',
    'مدير متوسطة',
    'مدير مدرسة ابتدائية',
    'مقتصد ومساعد مصالح اقتصادية',
    'مفتش التعليم',
    'جميع الرتب'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('bt_admin_token') || 'bt-admin-session-default';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchOrdersAndStats = async () => {
    try {
      setLoadingOrders(true);
      const [ordRes, statRes] = await Promise.all([
        fetch('/api/orders', { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : []),
        fetch('/api/stats', { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : null),
      ]);
      setOrders(ordRes);
      setStats(statRes);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Supabase Database Connection State
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [checkingSupabase, setCheckingSupabase] = useState<boolean>(false);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  const checkSupabaseStatus = async () => {
    setCheckingSupabase(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err: any) {
      setSupabaseStatus({ connected: false, error: err.message });
    } finally {
      setCheckingSupabase(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrdersAndStats();
      checkSupabaseStatus();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginEmail.trim(), password: loginPassword.trim() })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل تسجيل الدخول');
      }

      const data = await res.json();
      sessionStorage.setItem('bt_admin_logged', 'true');
      if (data.token) {
        sessionStorage.setItem('bt_admin_token', data.token);
      }
      setIsAuthenticated(true);
      showToast('تم تسجيل الدخول بنجاح! مرحباً بكم في لوحة الإدارة.');
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick Auto-fill for convenience
  const handleAutoFillLogin = () => {
    setLoginEmail('admin@bewaba-tarbia.dz');
    setLoginPassword('admin2026');
    setLoginError('');
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('bt_admin_logged');
    sessionStorage.removeItem('bt_admin_token');
    setIsAuthenticated(false);
  };

  // Handle Add Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.title || !newProductForm.priceDZD) {
      showToast('يرجى ملء عنوان وسعر الكتاب على الأقل');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const payload = {
        ...newProductForm,
        slug: newProductForm.title
          .trim()
          .toLowerCase()
          .replace(/[^\w\u0621-\u064A]+/g, '-') + `-${Date.now().toString().slice(-4)}`
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('فشل إضافة الكتاب');

      setIsAddModalOpen(false);
      setNewProductForm(initialNewProduct);
      await refreshData();
      showToast('تمت إضافة الكتاب الجديد بنجاح ونشره في الكتالوج!');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إضافة الكتاب');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Handle Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) throw new Error('فشل حذف الكتاب');

      setDeletingProduct(null);
      await refreshData();
      showToast('تم حذف الكتاب بنجاح من المنصة.');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حذف الكتاب');
    }
  };

  // Handle Save Edited Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingProduct)
      });
      if (!res.ok) throw new Error('فشل تعديل الكتاب');

      setEditingProduct(null);
      await refreshData();
      showToast('تم تحديث بيانات الكتاب بنجاح!');
    } catch (e: any) {
      showToast(e.message || 'فشل حفظ التعديلات');
    }
  };

  // Quick Toggle Stock Status
  const handleToggleStock = async (product: Product) => {
    const updated = {
      ...product,
      inStock: !product.inStock,
      stockStatusLabel: !product.inStock ? 'متوفر بالمخزن' : 'غير متوفر / قيد الطبع'
    };

    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updated)
      });
      await refreshData();
      showToast(updated.inStock ? 'تم تحديد الكتاب كمتوفر بالمخزن' : 'تم تحديد الكتاب كغير متوفر');
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        fetchOrdersAndStats();
        showToast(`تم تغيير حالة الطلبية إلى: ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          whatsappNumber: adminWhatsapp,
          contactPhone: adminPhone,
          contactEmail: adminEmail,
          announcementBannerText: adminBanner,
          announcementBannerActive: adminBannerActive,
        })
      });
      if (res.ok) {
        setSettingsSavedMsg('تم حفظ الإعدادات ورقم الواتساب بنجاح!');
        setTimeout(() => setSettingsSavedMsg(''), 3000);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeMsg({ text: '', isError: false });

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تغيير كلمة المرور');
      }

      setPassChangeMsg({ text: 'تم تغيير كلمة المرور بنجاح!', isError: false });
      setCurrentPass('');
      setNewPass('');
      setTimeout(() => setPassChangeMsg({ text: '', isError: false }), 4000);
    } catch (err: any) {
      setPassChangeMsg({ text: err.message || 'حدث خطأ أثناء تغيير كلمة المرور', isError: true });
    }
  };

  // --------------------------------------------------------------------------
  // Unauthenticated: Show Admin Login Card
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-8 text-right">
          {/* Logo Header */}
          <div className="text-center mb-6">
            <img
              src="/covers/logo_bewaba_tarbia.png"
              alt="شعار بوابة التربية"
              className="w-20 h-20 object-contain mx-auto mb-3"
            />
            <h1 className="text-xl font-extrabold text-slate-900">
              تسجيل دخول إدارة بوابة التربية
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              أدخل بيانات حساب الإدارة لإدارة المنتجات، الطلبيات، وإعدادات المنصة
            </p>
          </div>

          {/* Quick Auto-Fill Hint Box */}
          <div className="mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#006233]" />
                بيانات الدخول الافتراضية للإدارة:
              </span>
              <button
                type="button"
                onClick={handleAutoFillLogin}
                className="text-[11px] font-bold text-[#123B5D] hover:underline bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs cursor-pointer"
              >
                تعبئة تلقائية بنقرة واحدة
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-600 flex justify-between pr-2">
              <span>البريد: admin@bewaba-tarbia.dz</span>
              <span>كلمة المرور: admin2026</span>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@bewaba-tarbia.dz"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#123B5D] font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#123B5D] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="إظهار كلمة المرور"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#123B5D] hover:bg-[#0E283F] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-[#D9A441]" />
              <span>{loginLoading ? 'جاري التحقق...' : 'تسجيل الدخول إلى لوحة التحكم'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Products for Admin
  const filteredProducts = products.filter(p => {
    if (!productSearchQuery) return true;
    const q = productSearchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.targetRole.toLowerCase().includes(q) ||
      p.track.toLowerCase().includes(q)
    );
  });

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'الكل' && o.status !== orderStatusFilter) return false;
    if (orderSearchQuery) {
      const q = orderSearchQuery.toLowerCase();
      return (
        o.referenceCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.wilayaName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#D9A441]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Admin Info & Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/covers/logo_bewaba_tarbia.png"
              alt="شعار"
              className="w-10 h-10 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">لوحة الإدارة والتحكم</h1>
                <span className="text-[11px] bg-[#006233] text-white px-2 py-0.5 rounded-full font-bold">
                  حساب نشط
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                إدارة الكتب، إضافة وحذف المراجع، متابعة الطلبيات، ومصفوفة تسعيرات التوصيل
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchOrdersAndStats}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#123B5D]" />
            <span>تحديث البيانات</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">إجمالي المراجع</span>
              <BookOpen className="w-4 h-4 text-[#123B5D]" />
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {products.length}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">كتب منشورة بالكتالوج</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">إجمالي الطلبيات</span>
              <Package className="w-4 h-4 text-[#123B5D]" />
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {stats.totalOrders}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">طلبات مسجلة</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">قيد التأكيد (الاتصال)</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-amber-600 font-mono tabular-nums">
              {stats.pendingOrders}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">بحاجة لمكالمة</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">المبيعات المؤكدة</span>
              <DollarSign className="w-4 h-4 text-[#D9A441]" />
            </div>
            <span className="text-2xl font-black text-[#123B5D] font-mono tabular-nums">
              {stats.deliveredRevenueDZD?.toLocaleString()} دج
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">المبلغ الإجمالي</span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-[#123B5D] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الكتب والمراجع ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quizzes'
              ? 'bg-[#123B5D] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>الاختبارات التدريبية ({quizzes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'resources'
              ? 'bg-[#123B5D] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>الموارد المجانية ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#123B5D] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>الطلبيات ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wilayas')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'wilayas'
              ? 'bg-[#123B5D] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>تسعيرات الـ 58 ولاية</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#123B5D] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>الإعدادات</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* Tab 1: Products Management (Add, Edit, Delete, Stock Toggle)          */}
      {/* ==================================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={productSearchQuery}
                onChange={e => setProductSearchQuery(e.target.value)}
                placeholder="ابحث بالعنوان، الرتبة، أو المسار..."
                className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#123B5D]"
              />
            </div>

            {/* Prominent Add Product Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#006233] hover:bg-[#004e28] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كتاب أو مرجع جديد</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">الغلاف والعنوان</th>
                    <th className="p-3.5">الرتبة والمسار</th>
                    <th className="p-3.5">السعر (دج)</th>
                    <th className="p-3.5">توفر المخزن</th>
                    <th className="p-3.5 text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        لا توجد كتب مطابقة لبحثك
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <div className="w-12 h-16 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 p-0.5">
                            <img
                              src={prod.coverImage}
                              alt={prod.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <strong className="text-slate-900 block font-bold text-xs leading-snug">
                              {prod.title}
                            </strong>
                            <span className="text-[11px] text-slate-500 block truncate max-w-sm mt-0.5">
                              {prod.subtitle || prod.edition}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-[#123B5D] block">{prod.targetRole}</span>
                          <span className="text-slate-500 text-[11px] block">{prod.track}</span>
                        </td>

                        <td className="p-3.5 font-mono font-black text-[#123B5D] text-sm tabular-nums whitespace-nowrap">
                          {prod.priceDZD.toLocaleString()} دج
                          {prod.originalPriceDZD && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              {prod.originalPriceDZD.toLocaleString()} دج
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(prod)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border cursor-pointer transition-colors ${
                              prod.inStock
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            }`}
                            title="انقر لتبديل حالة التوفر"
                          >
                            {prod.inStock ? '✓ متوفر بالمخزن' : '✕ غير متوفر'}
                          </button>
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Preview on live site */}
                            <button
                              onClick={() => navigateToBook(prod)}
                              className="p-1.5 text-slate-600 hover:text-[#123B5D] hover:bg-slate-100 rounded-lg border border-slate-200"
                              title="معاينة في الموقع"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingProduct({ ...prod })}
                              className="p-1.5 text-[#123B5D] hover:bg-blue-50 rounded-lg border border-slate-200 flex items-center gap-1 font-bold text-[11px]"
                              title="تعديل الكتاب"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingProduct(prod)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1 font-bold text-[11px]"
                              title="حذف الكتاب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Modal 1: Add New Product                                             */}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#006233]/10 text-[#006233] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  إضافة كتاب أو مرجع جديد إلى المنصة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Title & Subtitle */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  عنوان الكتاب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.title}
                  onChange={e => setNewProductForm({ ...newProductForm, title: e.target.value })}
                  placeholder="مثال: كتاب الدليل: المرجع الشامل لاجتياز مسابقة أستاذ..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  العنوان الفرعي والمحاور والتأطير
                </label>
                <input
                  type="text"
                  value={newProductForm.subtitle}
                  onChange={e => setNewProductForm({ ...newProductForm, subtitle: e.target.value })}
                  placeholder="مثال: علوم التربية · التشريع المدرسي — إعداد: الأستاذ..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Target Role & Competition Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    الرتبة المستهدفة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProductForm.targetRole}
                    onChange={e => setNewProductForm({ ...newProductForm, targetRole: e.target.value as TargetRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    {allRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    نوع المسار <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProductForm.track}
                    onChange={e => setNewProductForm({ ...newProductForm, track: e.target.value as CompetitionTrack })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="مسابقات التوظيف">مسابقات التوظيف</option>
                    <option value="مسابقات الترقية">مسابقات الترقية</option>
                    <option value="كلاهما">كلاهما</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    سعر البيع بالدينار الجزائري (دج) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductForm.priceDZD}
                    onChange={e => setNewProductForm({ ...newProductForm, priceDZD: parseInt(e.target.value, 10) || 0 })}
                    placeholder="مثال: 1950"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    السعر الأصلي للمقارنة (اختياري للخصم)
                  </label>
                  <input
                    type="number"
                    value={newProductForm.originalPriceDZD || ''}
                    onChange={e => setNewProductForm({ ...newProductForm, originalPriceDZD: parseInt(e.target.value, 10) || undefined })}
                    placeholder="مثال: 2400"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Cover Image Quick Selection or Custom Path */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  اختيار صورة الغلاف
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {availableCovers.map((cov, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewProductForm({ ...newProductForm, coverImage: cov.path })}
                      className={`p-1.5 rounded-lg border text-right transition-all flex items-center gap-2 cursor-pointer ${
                        newProductForm.coverImage === cov.path
                          ? 'border-[#006233] bg-emerald-50 ring-1 ring-[#006233]'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <img src={cov.path} alt="" className="w-6 h-8 object-contain shrink-0" />
                      <span className="text-[10px] truncate leading-tight font-medium">{cov.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">أو أدخل مسار / رابط الغلاف يدوياً:</span>
                  <input
                    type="text"
                    value={newProductForm.coverImage}
                    onChange={e => setNewProductForm({ ...newProductForm, coverImage: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Edition, Pages, Format */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">الطبعة</label>
                  <input
                    type="text"
                    value={newProductForm.edition}
                    onChange={e => setNewProductForm({ ...newProductForm, edition: e.target.value })}
                    placeholder="طبعة 2026"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">عدد الصفحات</label>
                  <input
                    type="number"
                    value={newProductForm.pages}
                    onChange={e => setNewProductForm({ ...newProductForm, pages: parseInt(e.target.value, 10) || undefined })}
                    placeholder="320"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">نوع النسخة</label>
                  <select
                    value={newProductForm.format}
                    onChange={e => setNewProductForm({ ...newProductForm, format: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="مطبوع غلاف ملون فاخر">مطبوع غلاف ملون فاخر</option>
                    <option value="مطبوع غلاف عادي">مطبوع غلاف عادي</option>
                    <option value="مطبوع غلاف مقوى">مطبوع غلاف مقوى</option>
                    <option value="رقمي PDF">رقمي PDF</option>
                  </select>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">حالة توفر المخزن</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockStatus"
                      checked={newProductForm.inStock === true}
                      onChange={() => setNewProductForm({ ...newProductForm, inStock: true, stockStatusLabel: 'متوفر بالمخزن' })}
                    />
                    <span className="font-medium text-emerald-800">متوفر وجاهز للشحن الفوري</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockStatus"
                      checked={newProductForm.inStock === false}
                      onChange={() => setNewProductForm({ ...newProductForm, inStock: false, stockStatusLabel: 'غير متوفر / قيد الطبع' })}
                    />
                    <span className="font-medium text-red-800">غير متوفر حالياً</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">الوصف التفصيلي للكتاب</label>
                <textarea
                  rows={3}
                  value={newProductForm.description}
                  onChange={e => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  placeholder="اكتب نبذة عن الكتاب ومحتواه البيداغوجي..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-6 py-2 bg-[#006233] hover:bg-[#004e28] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingProduct ? 'جاري الحفظ...' : 'نشر الكتاب في الكتالوج'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Modal 2: Delete Confirmation Modal                                   */}
      {/* ==================================================================== */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                تأكيد حذف الكتاب نهائياً
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من رغبتك في حذف هذا المرجع من المنصة والكتالوج؟
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <img
                src={deletingProduct.coverImage}
                alt=""
                className="w-10 h-14 object-contain rounded bg-white border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <strong className="text-xs font-bold text-slate-900 block truncate">
                  {deletingProduct.title}
                </strong>
                <span className="text-[11px] text-slate-500 block">
                  {deletingProduct.targetRole} · {deletingProduct.priceDZD} دج
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                تراجع وإلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                تأكيد الحذف النهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Modal 3: Edit Product Modal                                          */}
      {/* ==================================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-right">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              تعديل بيانات الكتاب: {editingProduct.title}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">عنوان الكتاب</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">العنوان الفرعي والمحاور</label>
                <input
                  type="text"
                  value={editingProduct.subtitle || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">السعر الفعلي (دج)</label>
                  <input
                    type="number"
                    value={editingProduct.priceDZD}
                    onChange={e => setEditingProduct({ ...editingProduct, priceDZD: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">السعر الأصلي (دج)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPriceDZD || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, originalPriceDZD: parseInt(e.target.value, 10) || undefined })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">حالة توفر المخزن</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editingProduct.inStock === true}
                      onChange={() => setEditingProduct({ ...editingProduct, inStock: true, stockStatusLabel: 'متوفر بالمخزن' })}
                    />
                    <span className="font-bold text-emerald-800">متوفر بالمخزن</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editingProduct.inStock === false}
                      onChange={() => setEditingProduct({ ...editingProduct, inStock: false, stockStatusLabel: 'غير متوفر / قيد الطبع' })}
                    />
                    <span className="font-bold text-red-800">غير متوفر / قيد الطبع</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">الوصف التفصيلي</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#123B5D] text-white font-bold rounded-lg hover:bg-[#0E283F] cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Tab 2: Orders Management                                             */}
      {/* ==================================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                placeholder="بحث برمز الطلب، الاسم، أو الولاية..."
                className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-[#123B5D]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">الحالة:</span>
              {['الكل', 'جديد', 'قيد التأكيد', 'مؤكد', 'قيد الشحن', 'تم التسليم', 'ملغى'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    orderStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">الرمز والزبون</th>
                  <th className="p-3.5">رقم الهاتف</th>
                  <th className="p-3.5">الولاية والبلدية</th>
                  <th className="p-3.5">الكتب المطلوبة</th>
                  <th className="p-3.5">المجموع الكلي</th>
                  <th className="p-3.5">حالة الطلبية</th>
                  <th className="p-3.5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      لا توجد طلبيات مطابقة للفلتر المحدد
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <strong className="font-mono text-slate-900 block">{ord.referenceCode}</strong>
                        <span className="text-slate-600">{ord.customerName}</span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700">
                        <a href={`tel:${ord.phone}`} className="hover:text-[#123B5D] font-bold">
                          {ord.phone}
                        </a>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 block">{ord.wilayaName}</span>
                        <span className="text-slate-500 text-[11px] block">{ord.commune}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5 max-w-xs">
                          {ord.items.map((it, idx) => (
                            <span key={idx} className="block text-slate-700 truncate">
                              • {it.productTitle} <strong className="font-mono">({it.quantity})</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-black text-[#123B5D] text-sm tabular-nums whitespace-nowrap">
                        {ord.totalDZD.toLocaleString()} دج
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <select
                          value={ord.status}
                          onChange={e => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className={`px-2 py-1 rounded text-xs font-bold border ${
                            ord.status === 'جديد'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : ord.status === 'قيد التأكيد'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : ord.status === 'مؤكد'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : ord.status === 'قيد الشحن'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : ord.status === 'تم التسليم'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          <option value="جديد">جديد</option>
                          <option value="قيد التأكيد">قيد التأكيد</option>
                          <option value="مؤكد">مؤكد</option>
                          <option value="قيد الشحن">قيد الشحن</option>
                          <option value="تم التسليم">تم التسليم</option>
                          <option value="ملغى">ملغى</option>
                        </select>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <a
                          href={`https://wa.me/${ord.phone.replace(/^0/, '213')}?text=${encodeURIComponent(
                            `السلام عليكم أستاذ ${ord.customerName}، نتواصل معكم من إدارة بوابة التربية بخصوص طلبيتكم رقم ${ord.referenceCode}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 rounded border border-emerald-200 inline-flex items-center gap-1 text-[11px] font-bold"
                          title="مراسلة الزبون واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Tab 3: Wilayas Rates                                                 */}
      {/* ==================================================================== */}
      {activeTab === 'wilayas' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-800">
              تسعيرات التوصيل لولايات الوطن الـ 58
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              تُطبّق هذه الأسعار فورياً على نموذج الدفع عند الاستلام للزبائن
            </p>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3">الرمز</th>
                  <th className="p-3">الولاية</th>
                  <th className="p-3">Nom</th>
                  <th className="p-3">استلام من المكتب (Stop-Desk)</th>
                  <th className="p-3">توصيل لباب المنزل (Domicile)</th>
                  <th className="p-3">مدة التسليم المقدرة</th>
                  <th className="p-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {wilayas.map(w => (
                  <tr key={w.code} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#123B5D]">{w.code}</td>
                    <td className="p-3 font-sans font-bold text-slate-900">{w.nameAr}</td>
                    <td className="p-3 font-sans text-slate-600">{w.nameFr}</td>
                    <td className="p-3 font-bold text-emerald-800">{w.deskDeliveryFeeDZD} دج</td>
                    <td className="p-3 font-bold text-slate-800">{w.homeDeliveryFeeDZD} دج</td>
                    <td className="p-3 font-sans text-slate-500 text-[11px]">{w.deliveryDelayHours}</td>
                    <td className="p-3 font-sans">
                      <button
                        onClick={() => {
                          setEditingWilaya(w);
                          setWilayaDeskFee(w.deskDeliveryFeeDZD);
                          setWilayaHomeFee(w.homeDeliveryFeeDZD);
                          setWilayaDelay(w.deliveryDelayHours || '24 - 48 ساعة');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#123B5D] hover:text-white text-slate-700 rounded text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        تعديل التسعيرة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Edit Wilaya Shipping Rates */}
      {editingWilaya && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                تعديل تسعيرة التوصيل: {editingWilaya.code} - {editingWilaya.nameAr} ({editingWilaya.nameFr})
              </h3>
              <button
                onClick={() => setEditingWilaya(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingWilaya(true);
                try {
                  const res = await fetch(`/api/wilayas/${editingWilaya.code}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                      deskDeliveryFeeDZD: Number(wilayaDeskFee),
                      homeDeliveryFeeDZD: Number(wilayaHomeFee),
                      deliveryDelayHours: wilayaDelay
                    })
                  });
                  if (!res.ok) throw new Error('فشل حفظ تسعيرة الولاية');
                  await refreshData();
                  setEditingWilaya(null);
                  showToast(`تم تحديث تسعيرة التوصيل لولاية ${editingWilaya.nameAr} بنجاح!`);
                } catch (err: any) {
                  showToast(err.message || 'حدث خطأ أثناء تعديل التسعيرة');
                } finally {
                  setIsSavingWilaya(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  سعر الاستلام من المكتب الولائي (Stop-Desk) بالدينار
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={wilayaDeskFee}
                  onChange={e => setWilayaDeskFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  سعر التوصيل لباب المنزل (Domicile) بالدينار
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={wilayaHomeFee}
                  onChange={e => setWilayaHomeFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مدة التسليم المقدرة
                </label>
                <input
                  type="text"
                  value={wilayaDelay}
                  onChange={e => setWilayaDelay(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingWilaya}
                  className="flex-1 py-2.5 bg-[#123B5D] text-white font-bold rounded-lg hover:bg-[#0E283F] disabled:opacity-50 cursor-pointer"
                >
                  {isSavingWilaya ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWilaya(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Tab 2B: Practice Quizzes Management                                  */}
      {/* ==================================================================== */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">إدارة مواضيع الاختبارات التدريبية</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أضف مواضيع اختبارات تدريبية جديدة مع الأسئلة والخيارات والتعليل البيداغوجي لتظهر فوراً في المنصة
              </p>
            </div>
            <button
              onClick={() => {
                setQuizTitle('');
                setQuizSubject('');
                setQuizDescription('');
                setQuizDuration(15);
                setQuizQuestions([createEmptyQuestion(1)]);
                setIsAddQuizModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#006233] hover:bg-[#004e28] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موضوع اختبار جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">عنوان الاختبار التدريبي</th>
                    <th className="p-3.5">الرتبة والمسار</th>
                    <th className="p-3.5">المادة</th>
                    <th className="p-3.5">المدة والأسئلة</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizzes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        لا توجد اختبارات تدريبية حالياً
                      </td>
                    </tr>
                  ) : (
                    quizzes.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <strong className="text-slate-900 block font-bold">{q.title}</strong>
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-md">{q.description}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-[#123B5D] block">{q.targetRole}</span>
                          <span className="text-[11px] text-slate-500 block">{q.track}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{q.subject}</td>
                        <td className="p-3.5 font-mono text-slate-700 whitespace-nowrap">
                          {q.durationMinutes} دقيقة · {q.questions.length} سؤال
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => startQuiz(q)}
                              className="px-2.5 py-1.5 text-[#123B5D] hover:bg-blue-50 rounded-lg border border-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="معاينة وتشغيل الاختبار"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>معاينة</span>
                            </button>
                            <button
                              onClick={() => setDeletingQuiz(q)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                              title="حذف الاختبار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Practice Quiz Modal */}
          {isAddQuizModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto text-right">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                  <div>
                    <h3 className="text-base font-black text-slate-900">إضافة موضوع جديد في الاختبارات التدريبية</h3>
                    <p className="text-xs text-slate-500">أدخل بيانات الاختبار وأضف أسئلته مع تحديد الإجابة الصحيحة والتعليل</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddQuizModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmittingQuiz(true);
                    try {
                      const res = await fetch('/api/quizzes', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                          title: quizTitle,
                          targetRole: quizTargetRole,
                          track: quizTrack,
                          subject: quizSubject,
                          durationMinutes: quizDuration,
                          description: quizDescription,
                          questions: quizQuestions
                        })
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(data.error || 'فشل إضافة الاختبار التدريبي');
                      setIsAddQuizModalOpen(false);
                      await refreshData();
                      showToast('تمت إضافة موضوع الاختبار التدريبي الجديد بنجاح!');
                    } catch (err: any) {
                      showToast(err.message || 'حدث خطأ أثناء حفظ الاختبار');
                    } finally {
                      setIsSubmittingQuiz(false);
                    }
                  }}
                  className="space-y-5 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-800 mb-1">
                        عنوان موضوع الاختبار <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={quizTitle}
                        onChange={e => setQuizTitle(e.target.value)}
                        placeholder="مثال: اختبار تدريبي في التشريع المدرسي والنظام التربوي 2026"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">الرتبة المستهدفة</label>
                      <select
                        value={quizTargetRole}
                        onChange={e => setQuizTargetRole(e.target.value as TargetRole)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        {allRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">المسار</label>
                      <select
                        value={quizTrack}
                        onChange={e => setQuizTrack(e.target.value as CompetitionTrack)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="مسابقات التوظيف">مسابقات التوظيف</option>
                        <option value="مسابقات الترقية">مسابقات الترقية</option>
                        <option value="تكوين مستمر">تكوين مستمر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        المادة / التخصص <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={quizSubject}
                        onChange={e => setQuizSubject(e.target.value)}
                        placeholder="مثال: علوم التربية أو التشريع المدرسي"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">المدة الزمنية (بالدقائق)</label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        required
                        value={quizDuration}
                        onChange={e => setQuizDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-800 mb-1">وصف مختصر للاختبار</label>
                      <textarea
                        rows={2}
                        value={quizDescription}
                        onChange={e => setQuizDescription(e.target.value)}
                        placeholder="نبذة عن محاور الاختبار والنصوص القانونية أو البيداغوجية المستهدفة..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Dynamic Questions Builder */}
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-[#123B5D]">
                        أسئلة الاختبار ({quizQuestions.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setQuizQuestions(prev => [...prev, createEmptyQuestion(prev.length + 1)])}
                        className="px-3 py-1.5 bg-[#123B5D] hover:bg-[#0E283F] text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة سؤال جديد</span>
                      </button>
                    </div>

                    {quizQuestions.map((q, qIdx) => (
                      <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800">السؤال رقم {qIdx + 1}</span>
                          {quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setQuizQuestions(prev => prev.filter((_, i) => i !== qIdx))}
                              className="text-red-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف السؤال</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 mb-1">نص السؤال *</label>
                            <input
                              type="text"
                              required
                              value={q.questionText}
                              onChange={e => {
                                const val = e.target.value;
                                setQuizQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, questionText: val } : item));
                              }}
                              placeholder="اكتب نص السؤال هنا..."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">المحور الفرعي</label>
                            <input
                              type="text"
                              value={q.topic}
                              onChange={e => {
                                const val = e.target.value;
                                setQuizQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, topic: val } : item));
                              }}
                              placeholder="مثال: المواظبة والانضباط"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1.5">
                            الخيارات (حدّد الدائرة بجانب الإجابة الصحيحة) *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={q.correctIndex === optIdx}
                                  onChange={() => {
                                    setQuizQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, correctIndex: optIdx } : item));
                                  }}
                                  title="تعيين كإجابة صحيحة"
                                  className="cursor-pointer text-[#006233]"
                                />
                                <input
                                  type="text"
                                  required={optIdx < 2}
                                  value={opt}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setQuizQuestions(prev => prev.map((item, i) => {
                                      if (i !== qIdx) return item;
                                      const nextOpts = [...item.options];
                                      nextOpts[optIdx] = val;
                                      return { ...item, options: nextOpts };
                                    }));
                                  }}
                                  placeholder={`الخيار ${optIdx + 1}`}
                                  className="w-full text-xs outline-hidden bg-transparent"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            التعليل البيداغوجي / السند القانوني (يظهر للمترشح بعد الاختبار)
                          </label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={e => {
                              const val = e.target.value;
                              setQuizQuestions(prev => prev.map((item, i) => i === qIdx ? { ...item, explanation: val } : item));
                            }}
                            placeholder="مثال: وفقاً للمادة 84 من المرسوم التنفيذي 08-315..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsAddQuizModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingQuiz}
                      className="px-6 py-2.5 bg-[#006233] hover:bg-[#004e28] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingQuiz ? 'جاري النشر...' : 'حفظ ونشر الاختبار التدريبي'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Quiz Confirmation Modal */}
          {deletingQuiz && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right">
                <h3 className="text-base font-bold text-slate-900 mb-2">تأكيد حذف الاختبار التدريبي</h3>
                <p className="text-xs text-slate-600 mb-5">
                  هل أنت متأكد من رغبتك في حذف اختبار <strong>{deletingQuiz.title}</strong> نهائياً؟
                </p>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => setDeletingQuiz(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/quizzes/${deletingQuiz.id}`, {
                          method: 'DELETE',
                          headers: getAuthHeaders()
                        });
                        if (!res.ok) throw new Error('فشل حذف الاختبار');
                        setDeletingQuiz(null);
                        await refreshData();
                        showToast('تم حذف الاختبار التدريبي بنجاح.');
                      } catch (err: any) {
                        showToast(err.message || 'حدث خطأ أثناء الحذف');
                      }
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    تأكيد الحذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* Tab 2C: Free Resources Management (Add / Delete / Google Drive Links) */}
      {/* ==================================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">إدارة بنك الموارد المجانية وروابط Google Drive</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أضف ملفات ومواضيع مجانية مع ربطها بروابط تحميل مباشر من Google Drive، أو احذف أي موضوع بضغطة زر
              </p>
            </div>
            <button
              onClick={() => {
                setResTitle('');
                setResCategory('التشريع المدرسي');
                setResTargetRole('جميع الرتب');
                setResFormat('PDF');
                setResFileSize('Google Drive');
                setResDownloadUrl('');
                setResAutoConvertDrive(true);
                setResDescription('');
                setIsAddResourceModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#006233] hover:bg-[#004e28] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مورد / رابط Google Drive</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">عنوان الموضوع / الملف</th>
                    <th className="p-3.5">التصنيف والرتبة</th>
                    <th className="p-3.5">الصيغة والحجم</th>
                    <th className="p-3.5">رابط التحميل</th>
                    <th className="p-3.5">التحميلات</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        لا توجد موارد مجانية مضافة حالياً
                      </td>
                    </tr>
                  ) : (
                    resources.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <strong className="text-slate-900 block font-bold">{res.title}</strong>
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-md">{res.description}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-[#123B5D] block">{res.category}</span>
                          <span className="text-[11px] text-slate-500 block">{res.targetRole}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-slate-700 block">{res.format}</span>
                          <span className="text-[11px] text-slate-500">{res.fileSize}</span>
                        </td>
                        <td className="p-3.5">
                          {res.downloadUrl && res.downloadUrl.startsWith('http') ? (
                            <a
                              href={res.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>{res.downloadUrl.includes('drive.google.com') ? 'Google Drive مباشر' : 'رابط مباشر'}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">رابط افتراضي</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-700">{res.downloadCount || 0}</td>
                        <td className="p-3.5 whitespace-nowrap text-center">
                          <button
                            onClick={() => setDeletingResource(res)}
                            className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 inline-flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                            title="حذف الموضوع"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Free Resource Modal */}
          {isAddResourceModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                  <div>
                    <h3 className="text-base font-black text-slate-900">إضافة موضوع أو رابط تحميل في الموارد المجانية</h3>
                    <p className="text-xs text-slate-500">يدعم روابط Google Drive مع تحويل تلقائي إلى تحميل مباشر</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddResourceModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmittingResource(true);
                    try {
                      const res = await fetch('/api/resources', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                          title: resTitle,
                          category: resCategory,
                          targetRole: resTargetRole,
                          format: resFormat,
                          fileSize: resFileSize,
                          downloadUrl: resDownloadUrl,
                          autoConvertDrive: resAutoConvertDrive,
                          description: resDescription
                        })
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(data.error || 'فشل إضافة المورد المجاني');
                      setIsAddResourceModalOpen(false);
                      await refreshData();
                      showToast('تمت إضافة المورد المجاني وربط التحميل المباشر بنجاح!');
                    } catch (err: any) {
                      showToast(err.message || 'حدث خطأ أثناء حفظ المورد');
                    } finally {
                      setIsSubmittingResource(false);
                    }
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      عنوان الملف أو الموضوع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resTitle}
                      onChange={e => setResTitle(e.target.value)}
                      placeholder="مثال: ملخص شامل للتشريع المدرسي ومراسيم التربية 2026"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">التصنيف</label>
                      <input
                        type="text"
                        required
                        value={resCategory}
                        onChange={e => setResCategory(e.target.value)}
                        placeholder="التشريع المدرسي / مسابقات التوظيف..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">الرتبة المستهدفة</label>
                      <select
                        value={resTargetRole}
                        onChange={e => setResTargetRole(e.target.value as TargetRole)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        {allRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">صيغة الملف</label>
                      <input
                        type="text"
                        value={resFormat}
                        onChange={e => setResFormat(e.target.value)}
                        placeholder="PDF / DOCX / مجلد Drive"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">حجم الملف</label>
                      <input
                        type="text"
                        value={resFileSize}
                        onChange={e => setResFileSize(e.target.value)}
                        placeholder="مثال: 3.5 ميغابايت"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-[#006233]" />
                      <span>رابط Google Drive أو رابط التحميل المباشر <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="url"
                      required
                      dir="ltr"
                      value={resDownloadUrl}
                      onChange={e => setResDownloadUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-left"
                    />
                    <label className="flex items-center gap-2 mt-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={resAutoConvertDrive}
                        onChange={e => setResAutoConvertDrive(e.target.checked)}
                        className="rounded border-slate-300 text-[#006233]"
                      />
                      <span className="font-semibold">
                        تحويل رابط ملف Google Drive تلقائياً إلى رابط تحميل مباشر (Direct Download)
                      </span>
                    </label>

                    {resDownloadUrl.includes('drive.google.com') && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 break-all" dir="ltr">
                        <span className="font-bold block text-right mb-0.5" dir="rtl">الرابط الفعلي المستخدم للزوار:</span>
                        <code className="font-mono">{previewDirectDriveUrl(resDownloadUrl, resAutoConvertDrive)}</code>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">وصف مختصر للملف</label>
                    <textarea
                      rows={3}
                      value={resDescription}
                      onChange={e => setResDescription(e.target.value)}
                      placeholder="اشرح محتوى الملف وكيف يستفيد منه المترشح..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsAddResourceModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingResource}
                      className="px-6 py-2.5 bg-[#006233] hover:bg-[#004e28] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingResource ? 'جاري الحفظ...' : 'حفظ ونشر المورد المجاني'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Resource Confirmation Modal */}
          {deletingResource && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right">
                <h3 className="text-base font-bold text-slate-900 mb-2">تأكيد حذف المورد المجاني</h3>
                <p className="text-xs text-slate-600 mb-5">
                  هل أنت متأكد من رغبتك في حذف <strong>{deletingResource.title}</strong> من قسم الموارد المجانية؟
                </p>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => setDeletingResource(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/resources/${deletingResource.id}`, {
                          method: 'DELETE',
                          headers: getAuthHeaders()
                        });
                        if (!res.ok) throw new Error('فشل حذف المورد');
                        setDeletingResource(null);
                        await refreshData();
                        showToast('تم حذف المورد بنجاح من قسم الموارد المجانية.');
                      } catch (err: any) {
                        showToast(err.message || 'حدث خطأ أثناء الحذف');
                      }
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    تأكيد الحذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* Tab 4: Settings & Security                                           */}
      {/* ==================================================================== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site & WhatsApp Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              إعدادات المنصة ورقم الواتساب
            </h3>

            {settingsSavedMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{settingsSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>رقم الواتساب الرسمي للطلبات</span>
                </label>
                <input
                  type="text"
                  value={adminWhatsapp}
                  onChange={e => setAdminWhatsapp(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">رقم الهاتف للاتصال</label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={e => setAdminPhone(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">نص الشريط الإعلاني العلوي</label>
                <input
                  type="text"
                  value={adminBanner}
                  onChange={e => setAdminBanner(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminBannerActive}
                    onChange={e => setAdminBannerActive(e.target.checked)}
                    className="rounded border-slate-300 text-[#123B5D]"
                  />
                  <span className="font-bold text-slate-800">تفعيل شريط التوصيل العلوي</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#123B5D] hover:bg-[#0E283F] text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات التواصل</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Admin Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D9A441]" />
              <span>تغيير كلمة مرور حساب الإدارة</span>
            </h3>

            {passChangeMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2 border ${
                passChangeMsg.isError
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {passChangeMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{passChangeMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  كلمة المرور الجديدة (5 أحرف على الأقل)
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>تحديث كلمة المرور</span>
                </button>
              </div>
            </form>
          </div>

          {/* Full-width Supabase Database Status Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ربط قاعدة بيانات سوبابيز (Supabase Database)
                  </h3>
                  <p className="text-xs text-slate-500">
                    تخزين ومزامنة كافة بيانات طلبيات الزبائن مباشرة في قاعدة بيانات سحابية دائمة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={checkSupabaseStatus}
                disabled={checkingSupabase}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingSupabase ? 'animate-spin' : ''}`} />
                <span>{checkingSupabase ? 'جاري الفحص...' : 'فحص الاتصال الآن'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">اسم المشروع (Project):</span>
                <strong className="text-slate-900 font-bold block text-sm font-sans">BEWABA TARBIA</strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">معرّف المشروع (Project ID):</span>
                <code className="text-[#123B5D] font-mono font-bold block text-sm">kucidgholhqrslsjpdya</code>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">حالة الاتصال والجدول:</span>
                {supabaseStatus?.connected ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>متصل · جدول orders جاهز ({supabaseStatus.ordersCount} طلبية)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-800 font-bold font-sans">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>الاعتماد مسجل · في انتظار تشغيل كود إنشاء الجدول</span>
                  </span>
                )}
              </div>
            </div>

            {/* Information Notice */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-2 text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-[#123B5D]">
                <Server className="w-4 h-4 text-[#2D8FCB]" />
                <span>نظام الحفظ المزدوج الذكي (Dual-Storage Resilience):</span>
              </div>
              <p>
                جميع طلبيات الزبائن من نموذج الدفع عند الاستلام تُحفظ فورياً في الخادم وتُرسل مباشرة إلى جدول <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-900 font-bold">public.orders</code> في مشروعكم على سوبابيز.
              </p>
              <p className="text-slate-600">
                في حال لم تنشئ جدول <code className="font-mono">orders</code> بعد في لوحة تحكم سوبابيز، يمكنك نسخ الكود البرمجي أدناه ولصقه في <strong>SQL Editor</strong> بسوبابيز وتشغيله بنقرة زر واحدة.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const sql = `-- BEWABA TARBIA | بوابة التربية\n-- جدول الطلبيات Orders Table\nCREATE TABLE IF NOT EXISTS public.orders (\n    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n    name TEXT NOT NULL,\n    email TEXT,\n    address TEXT NOT NULL,\n    product TEXT NOT NULL,\n    total_amount NUMERIC NOT NULL DEFAULT 0,\n    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),\n    phone TEXT DEFAULT '',\n    reference_code TEXT DEFAULT '',\n    wilaya_name TEXT DEFAULT '',\n    delivery_type TEXT DEFAULT 'home',\n    items JSONB DEFAULT '[]'::jsonb,\n    status TEXT DEFAULT 'جديد'\n);\n\n-- تفعيل نظام الحماية RLS وسياسات الوصول للنموذج ولوحة التحكم\nALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;\nDROP POLICY IF EXISTS "Allow anon order insert" ON public.orders;\nCREATE POLICY "Allow anon order insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);\nDROP POLICY IF EXISTS "Allow anon order select" ON public.orders;\nCREATE POLICY "Allow anon order select" ON public.orders FOR SELECT TO anon, authenticated USING (true);\nDROP POLICY IF EXISTS "Allow anon order update" ON public.orders;\nCREATE POLICY "Allow anon order update" ON public.orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);`;
                    navigator.clipboard.writeText(sql);
                    setSqlCopied(true);
                    setTimeout(() => setSqlCopied(false), 3000);
                    showToast('تم نسخ كود إنشاء الجدول في سوبابيز بنجاح!');
                  }}
                  className="px-4 py-2 bg-[#123B5D] hover:bg-[#0E283F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'تم نسخ كود SQL' : 'نسخ كود إنشاء الجدول (SQL Schema)'}</span>
                </button>

                <a
                  href="https://supabase.com/dashboard/project/kucidgholhqrslsjpdya/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح SQL Editor في سوبابيز</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
