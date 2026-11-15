export type ProductType = 'كتاب ورقي' | 'دليل رقمي' | 'ملف أو مورد تعليمي' | 'اختبار تدريبي' | 'دورة تكوينية' | 'عضوية مستقبلية';

export type TargetRole = 
  | 'أستاذ التعليم الابتدائي'
  | 'أستاذ التعليم المتوسط'
  | 'أستاذ التعليم الثانوي'
  | 'مشرف التربية'
  | 'مربي متخصص'
  | 'مستشار التوجيه والإرشاد المدرسي والمهني'
  | 'مدير مدرسة ابتدائية'
  | 'مدير متوسطة'
  | 'مقتصد ومساعد مصالح اقتصادية'
  | 'مفتش التعليم'
  | 'جميع الرتب';

export type CompetitionTrack = 'مسابقات التوظيف' | 'مسابقات الترقية' | 'تكوين مستمر' | 'كلاهما';

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  coverImage: string;
  gallery?: string[];
  productType: ProductType;
  targetRole: TargetRole;
  track: CompetitionTrack;
  edition: string;
  pages?: number;
  format: 'مطبوع غلاف مقوى' | 'مطبوع غلاف عادي' | 'مطبوع غلاف ملون فاخر' | 'رقمي PDF' | 'تفاعلي عبر المنصة';
  priceDZD: number;
  originalPriceDZD?: number;
  inStock: boolean;
  stockStatusLabel?: string;
  deliveryEstimateDays?: string;
  digitalAccessInfo?: string;
  description: string;
  intendedAudience: string[];
  features: string[];
  tableOfContents?: { chapter: string; pagesRange?: string; topics?: string[] }[];
  samplePreviewUrl?: string;
  faqs?: { question: string; answer: string }[];
  isFeatured?: boolean;
  isNewRelease?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  weightGrams?: number;
}

export interface Wilaya {
  code: string; // e.g. "16"
  nameAr: string; // e.g. "الجزائر"
  nameFr: string; // e.g. "Alger"
  deskDeliveryFeeDZD: number; // e.g. 450
  homeDeliveryFeeDZD: number; // e.g. 700
  deliveryDelayHours?: string; // e.g. "24-48 ساعة"
  communes?: string[];
}

export type OrderStatus = 'جديد' | 'قيد التأكيد' | 'مؤكد' | 'قيد الشحن' | 'تم التسليم' | 'ملغى';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productPriceDZD: number;
  quantity: number;
  coverImage?: string;
}

export interface Order {
  id: string;
  referenceCode: string; // e.g. "BT-2026-4821"
  customerName: string;
  phone: string;
  phoneSecondary?: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  address: string;
  deliveryType: 'home' | 'desk'; // باب المنزل or استلام من المكتب
  deliveryFeeDZD: number;
  items: OrderItem[];
  subtotalDZD: number;
  totalDZD: number;
  notes?: string;
  status: OrderStatus;
  statusNotes?: string;
  createdAt: string;
  storedInSupabase?: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface PracticeQuiz {
  id: string;
  slug: string;
  title: string;
  targetRole: TargetRole;
  track: CompetitionTrack;
  subject: string;
  durationMinutes: number;
  totalQuestions: number;
  description: string;
  questions: QuizQuestion[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: 'مسابقات التوظيف' | 'مسابقات الترقية' | 'علوم التربية' | 'علم النفس' | 'التشريع المدرسي' | 'التوجيه والإرشاد' | 'نصائح التحضير';
  author: string;
  featuredImage: string;
  publicationDate: string;
  readingTimeMinutes: number;
  verifiedOfficialReference?: string;
  tags?: string[];
}

export interface FreeResource {
  id: string;
  title: string;
  category: string;
  targetRole: TargetRole;
  format: string; // PDF, DOCX, إلخ
  fileSize: string;
  description: string;
  downloadUrl: string;
  downloadCount: number;
}

export interface SiteSettings {
  brandName: string;
  brandDescriptor: string;
  whatsappNumber: string; // e.g. "213550123456"
  contactPhone: string;
  contactEmail: string;
  addressOffice: string;
  socialFacebook: string;
  socialTelegram: string;
  socialYoutube: string;
  announcementBannerText: string;
  announcementBannerActive: boolean;
  freeShippingThresholdDZD: number; // e.g. 8000 DZD
  orderVerificationNotice: string;
}
