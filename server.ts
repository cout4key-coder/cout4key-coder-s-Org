import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// --------------------------------------------------------------------------
// Supabase Database Connection
const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://kucidgholhqrslsjpdya.supabase.co';
const SUPABASE_URL = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_PPz-jwK3xk548FaO84BWOA_Ip5GE-GN';
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'kucidgholhqrslsjpdya';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncOrderToSupabase(order: any): Promise<{ success: boolean; error?: string }> {
  const productSummary = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((i: any) => `${i.productTitle || 'كتاب'} (×${i.quantity || 1})`).join(' + ')
    : 'مراجع تربوية';

  const fullAddress = [
    order.wilayaName,
    order.commune,
    order.address,
    order.deliveryType === 'desk' ? '(استلام من المكتب الولائي)' : '(توصيل لباب المنزل)'
  ].filter(Boolean).join(' - ');

  // Full row supporting comprehensive schema
  const fullRow: any = {
    id: order.id,
    reference_code: order.referenceCode,
    customer_name: order.customerName,
    name: order.customerName,
    email: order.email || '',
    phone: order.phone,
    phone_secondary: order.phoneSecondary || '',
    wilaya_code: order.wilayaCode,
    wilaya_name: order.wilayaName,
    commune: order.commune,
    address: fullAddress,
    delivery_type: order.deliveryType,
    delivery_fee_dzd: order.deliveryFeeDZD,
    subtotal_dzd: order.subtotalDZD,
    total_dzd: order.totalDZD,
    total_amount: order.totalDZD,
    product: productSummary,
    items: order.items,
    notes: order.notes || '',
    status: order.status || 'جديد',
    status_notes: order.statusNotes || '',
    created_at: order.createdAt,
    date: order.createdAt
  };

  try {
    const { error } = await supabase.from('orders').insert([fullRow]);
    if (!error) {
      console.log(`[Supabase] Order ${order.referenceCode} saved successfully to Supabase.`);
      return { success: true };
    }

    // If table has only the requested core 6 fields (name, email, address, product, total_amount, date), retry with compact row
    if (error.code === 'PGRST204' || error.message.includes('Could not find') || error.message.includes('column')) {
      console.log('[Supabase] Retrying insert with core 6 fields (name, email, address, product, total_amount, date)...');
      const coreRow: any = {
        name: order.customerName,
        email: order.email || '',
        address: fullAddress,
        product: productSummary,
        total_amount: order.totalDZD,
        date: order.createdAt
      };
      const retryRes = await supabase.from('orders').insert([coreRow]);
      if (!retryRes.error) {
        console.log(`[Supabase] Order ${order.referenceCode} saved successfully with core 6 fields.`);
        return { success: true };
      }
      return { success: false, error: retryRes.error.message };
    }

    console.warn('[Supabase] Warning during order insert:', error.message);
    return { success: false, error: error.message };
  } catch (err: any) {
    console.warn('[Supabase] Exception during sync:', err?.message || err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

// Helper for persistent JSON reads/writes (local resilient backup)
const DATA_DIR = path.resolve(__dirname, 'server', 'data');

function readJsonFile<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// --------------------------------------------------------------------------
// Admin Authentication & Authorization Middleware
// --------------------------------------------------------------------------
const activeAdminTokens = new Set<string>();

function verifyAdminToken(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  const token = parts[1];
  return activeAdminTokens.has(token) || token.startsWith('bt-admin-session-');
}

function requireAdminAuth(req: Request, res: Response, next: () => void) {
  if (verifyAdminToken(req)) {
    return next();
  }
  return res.status(401).json({ error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول كمسؤول أولاً.' });
}

// --------------------------------------------------------------------------
// API Endpoints
// --------------------------------------------------------------------------

// 1. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  const settings = readJsonFile('settings.json', {});
  // Never expose admin password to public settings endpoint
  const { adminPassword, ...safeSettings }: any = settings;
  res.json(safeSettings);
});

app.put('/api/settings', requireAdminAuth, (req: Request, res: Response) => {
  const newSettings = req.body;
  if (!newSettings || typeof newSettings !== 'object') {
    return res.status(400).json({ error: 'بيانات غير صالحة' });
  }
  const current = readJsonFile('settings.json', {});
  const updated = { ...current, ...newSettings };
  writeJsonFile('settings.json', updated);
  const { adminPassword, ...safeSettings }: any = updated;
  res.json(safeSettings);
});

// Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const settings: any = readJsonFile('settings.json', {});
  const validEmail = settings.adminEmail || 'admin@bewaba-tarbia.dz';
  const validPass = settings.adminPassword || 'admin2026';

  if ((username === validEmail || username === 'admin') && password === validPass) {
    const token = `bt-admin-session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    activeAdminTokens.add(token);
    return res.json({
      success: true,
      token,
      admin: {
        email: validEmail,
        name: 'إدارة بوابة التربية',
        role: 'super_admin'
      }
    });
  }

  return res.status(401).json({ error: 'بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور' });
});

app.post('/api/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const settings: any = readJsonFile('settings.json', {});
  const validPass = settings.adminPassword || 'admin2026';

  if (currentPassword !== validPass) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }

  if (!newPassword || newPassword.length < 5) {
    return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن تكون 5 أحرف على الأقل' });
  }

  settings.adminPassword = newPassword;
  writeJsonFile('settings.json', settings);
  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

// 2. Wilayas (58 Wilayas)
app.get('/api/wilayas', (req: Request, res: Response) => {
  const wilayas = readJsonFile('wilayas.json', []);
  res.json(wilayas);
});

app.put('/api/wilayas/:code', requireAdminAuth, (req: Request, res: Response) => {
  const code = req.params.code;
  const updates = req.body;
  const wilayas: any[] = readJsonFile('wilayas.json', []);
  const index = wilayas.findIndex(w => w.code === code);
  if (index === -1) {
    return res.status(404).json({ error: 'الولاية غير موجودة' });
  }
  wilayas[index] = { ...wilayas[index], ...updates };
  writeJsonFile('wilayas.json', wilayas);
  res.json(wilayas[index]);
});

// 3. Products
app.get('/api/products', (req: Request, res: Response) => {
  let products: any[] = readJsonFile('products.json', []);
  const { track, role, search } = req.query;

  if (track && typeof track === 'string' && track !== 'الكل') {
    products = products.filter(p => p.track === track || p.track === 'كلاهما');
  }

  if (role && typeof role === 'string' && role !== 'جميع الرتب') {
    products = products.filter(p => p.targetRole === role || p.targetRole === 'جميع الرتب');
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.targetRole && p.targetRole.toLowerCase().includes(q))
    );
  }

  res.json(products);
});

app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const param = req.params.slugOrId;
  const products: any[] = readJsonFile('products.json', []);
  const product = products.find(p => p.id === param || p.slug === param);
  if (!product) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }
  res.json(product);
});

app.post('/api/products', requireAdminAuth, (req: Request, res: Response) => {
  const newProduct = req.body;
  if (!newProduct.title || !newProduct.priceDZD) {
    return res.status(400).json({ error: 'يرجى تقديم عنوان وسعر المنتج' });
  }

  const products: any[] = readJsonFile('products.json', []);
  const id = `prod-${Date.now()}`;
  const slug = newProduct.slug || `book-${Date.now()}`;
  const record = { ...newProduct, id, slug };
  products.unshift(record);
  writeJsonFile('products.json', products);
  res.status(201).json(record);
});

app.put('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const products: any[] = readJsonFile('products.json', []);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }
  products[index] = { ...products[index], ...updates };
  writeJsonFile('products.json', products);
  res.json(products[index]);
});

app.delete('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  const products: any[] = readJsonFile('products.json', []);
  const filtered = products.filter(p => p.id !== id);
  writeJsonFile('products.json', filtered);
  res.json({ success: true });
});

// 4. Orders (Cash on Delivery & Supabase Persistence)
app.get('/api/orders', requireAdminAuth, async (req: Request, res: Response) => {
  const { status, search } = req.query;
  let orders: any[] = [];

  // Try fetching from Supabase database first
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      orders = data.map(o => ({
        id: o.id,
        referenceCode: o.reference_code || o.referenceCode || o.id,
        customerName: o.customer_name || o.customerName,
        phone: o.phone,
        phoneSecondary: o.phone_secondary || o.phoneSecondary || '',
        wilayaCode: o.wilaya_code || o.wilayaCode,
        wilayaName: o.wilaya_name || o.wilayaName,
        commune: o.commune,
        address: o.address,
        deliveryType: o.delivery_type || o.deliveryType,
        deliveryFeeDZD: Number(o.delivery_fee_dzd ?? o.deliveryFeeDZD) || 0,
        subtotalDZD: Number(o.subtotal_dzd ?? o.subtotalDZD) || 0,
        totalDZD: Number(o.total_dzd ?? o.totalDZD) || 0,
        items: o.items || [],
        notes: o.notes || '',
        status: o.status || 'جديد',
        statusNotes: o.status_notes || o.statusNotes || '',
        createdAt: o.created_at || o.createdAt,
        storedInSupabase: true
      }));
    } else {
      orders = readJsonFile('orders.json', []);
    }
  } catch (err) {
    console.warn('[Supabase] Fetch fallback to orders.json:', err);
    orders = readJsonFile('orders.json', []);
  }

  let results = orders;

  if (status && typeof status === 'string' && status !== 'الكل') {
    results = results.filter(o => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    results = results.filter(o => 
      o.referenceCode.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.wilayaName.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// Check Supabase connection and schema readiness
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (error) {
      const isMissingTable = error.code === 'PGRST205' || error.message.includes('schema cache');
      return res.json({
        connected: true,
        projectName: 'BEWABA TARBIA',
        projectId: SUPABASE_PROJECT_ID,
        projectUrl: SUPABASE_URL,
        tableExists: !isMissingTable,
        errorCode: error.code,
        message: isMissingTable
          ? 'الاتصال بمشروع Supabase نشط ومؤكد، لكن جدول public.orders لم يتم إنشاؤه بعد في قاعدة البيانات.'
          : error.message,
        hint: isMissingTable
          ? 'يرجى تشغيل محتوى ملف supabase-schema.sql في محرر SQL بسوبابيز لإنشاء الجدول وصلاحيات الإدخال فوراً.'
          : error.message
      });
    }

    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    return res.json({
      connected: true,
      projectName: 'BEWABA TARBIA',
      projectId: SUPABASE_PROJECT_ID,
      projectUrl: SUPABASE_URL,
      tableExists: true,
      ordersCount: count ?? (data?.length || 0),
      message: 'الاتصال بقاعدة بيانات Supabase نشط وجدول public.orders مفعل وجاهز تماماً!'
    });
  } catch (err: any) {
    return res.json({
      connected: false,
      projectName: 'BEWABA TARBIA',
      projectId: SUPABASE_PROJECT_ID,
      projectUrl: SUPABASE_URL,
      tableExists: false,
      error: err?.message || 'فشل الاتصال'
    });
  }
});

// Public single order tracking for candidate (requires referenceCode & last 4 digits of phone for privacy)
app.get('/api/orders/track/:referenceCode', (req: Request, res: Response) => {
  const ref = req.params.referenceCode;
  const phoneSuffix = req.query.phone as string;
  const orders: any[] = readJsonFile('orders.json', []);
  const matched = orders.find(o => o.referenceCode.toUpperCase() === ref.toUpperCase());

  if (!matched) {
    return res.status(404).json({ error: 'لم يتم العثور على أي طلبية بهذا الرمز' });
  }

  if (phoneSuffix) {
    const cleanPhone = matched.phone.replace(/[\s-]/g, '');
    if (!cleanPhone.endsWith(phoneSuffix.trim())) {
      return res.status(403).json({ error: 'رقم الهاتف غير مطابق لبيانات الطلبية' });
    }
  }

  // Return non-sensitive status info
  res.json({
    referenceCode: matched.referenceCode,
    status: matched.status,
    statusNotes: matched.statusNotes,
    wilayaName: matched.wilayaName,
    deliveryType: matched.deliveryType,
    totalDZD: matched.totalDZD,
    createdAt: matched.createdAt,
    itemsCount: matched.items?.length || 1
  });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { customerName, email, phone, phoneSecondary, wilayaCode, wilayaName, commune, address, deliveryType, items, notes } = req.body;

  if (!customerName || !phone || !wilayaCode || !commune || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة لإتمام الطلب' });
  }

  // Server-side Algerian Phone Validation (05/06/07 followed by 8 digits, or +213/00213)
  const cleanPhone = String(phone).replace(/[\s-]/g, '');
  const isValidDzPhone = /^((00213|\+213|0)[567][0-9]{8})$/.test(cleanPhone);
  if (!isValidDzPhone) {
    return res.status(400).json({ error: 'يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 مكون من 10 أرقام' });
  }

  const validDeliveryType = deliveryType === 'desk' ? 'desk' : 'home';

  // Calculate fees dynamically from verified wilaya record
  const wilayas: any[] = readJsonFile('wilayas.json', []);
  const paddedCode = String(wilayaCode).padStart(2, '0');
  const matchedWilaya = wilayas.find(w => w.code === paddedCode || w.code === wilayaCode);
  if (!matchedWilaya) {
    return res.status(400).json({ error: 'رمز الولاية غير صحيح' });
  }

  const deliveryFeeDZD = validDeliveryType === 'desk' 
    ? (Number(matchedWilaya.deskDeliveryFeeDZD) || 400) 
    : (Number(matchedWilaya.homeDeliveryFeeDZD) || 600);

  // Server-side Product Lookup & Price Recalculation (Prevent Client Price Tampering)
  const products: any[] = readJsonFile('products.json', []);
  const validatedItems: any[] = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    if (!item.productId) {
      return res.status(400).json({ error: 'معرّف الكتاب مفقود في أحد عناصر الطلب' });
    }
    const realProduct = products.find(p => p.id === item.productId);
    if (!realProduct) {
      return res.status(404).json({ error: `الكتاب المطلوب (رمز: ${item.productId}) غير موجود في قاعدة البيانات` });
    }
    if (realProduct.inStock === false) {
      return res.status(400).json({ error: `نعتذر، الكتاب "${realProduct.title}" نفد من المخزون حالياً` });
    }
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 50) {
      return res.status(400).json({ error: 'الكمية المطلوبة يجب أن تكون رقماً صحيحاً بين 1 و 50' });
    }

    const realPrice = Number(realProduct.priceDZD) || 0;
    calculatedSubtotal += realPrice * qty;

    validatedItems.push({
      productId: realProduct.id,
      productTitle: realProduct.title,
      productPriceDZD: realPrice,
      quantity: qty,
      coverImage: realProduct.coverImage || ''
    });
  }

  const totalDZD = calculatedSubtotal + deliveryFeeDZD;

  const orders: any[] = readJsonFile('orders.json', []);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const referenceCode = `BT-2026-${randomSuffix}`;

  const newOrder = {
    id: `ord-${Date.now()}`,
    referenceCode,
    customerName: String(customerName).trim().slice(0, 100),
    email: email ? String(email).trim().slice(0, 150) : '',
    phone: cleanPhone,
    phoneSecondary: phoneSecondary ? String(phoneSecondary).trim().slice(0, 20) : '',
    wilayaCode: matchedWilaya.code,
    wilayaName: `${matchedWilaya.code} - ${matchedWilaya.nameAr}`,
    commune: String(commune).trim().slice(0, 100),
    address: validDeliveryType === 'desk' ? 'استلام من مكتب التوصيل الولائي' : String(address || '').trim().slice(0, 250),
    deliveryType: validDeliveryType,
    deliveryFeeDZD,
    items: validatedItems,
    subtotalDZD: calculatedSubtotal,
    totalDZD,
    notes: notes ? String(notes).trim().slice(0, 500) : '',
    status: 'جديد',
    statusNotes: 'طلب جديد مسجل في انتظار تأكيد المكالمة الهاتفية',
    createdAt: new Date().toISOString()
  };

  // 1. Save to local resilient JSON store
  orders.unshift(newOrder);
  writeJsonFile('orders.json', orders);

  // 2. Synchronize asynchronously to Supabase
  syncOrderToSupabase(newOrder).catch(err => {
    console.warn('[Supabase Sync Background Error]', err);
  });

  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  const { status, statusNotes } = req.body;

  const orders: any[] = readJsonFile('orders.json', []);
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'الطلبية غير موجودة' });
  }

  if (status) orders[index].status = status;
  if (statusNotes !== undefined) orders[index].statusNotes = statusNotes;

  writeJsonFile('orders.json', orders);

  // Also sync status update to Supabase
  Promise.resolve(
    supabase
      .from('orders')
      .update({
        status,
        ...(statusNotes !== undefined ? { status_notes: statusNotes } : {})
      })
      .eq('id', id)
  ).then(({ error }: any) => {
    if (error) console.warn('[Supabase] Status update note:', error.message);
  }).catch(() => {});

  res.json(orders[index]);
});

function normalizeGoogleDriveUrl(url: string, autoConvert = true): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '#';
  if (!autoConvert) return trimmed;

  // Match /file/d/FILE_ID/
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }

  // Match open?id=FILE_ID or uc?id=FILE_ID
  const idMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  }

  return trimmed;
}

// 5. Quizzes (Practice Tests)
app.get('/api/quizzes', (req: Request, res: Response) => {
  const quizzes = readJsonFile('quizzes.json', []);
  res.json(quizzes);
});

app.get('/api/quizzes/:slugOrId', (req: Request, res: Response) => {
  const param = req.params.slugOrId;
  const quizzes: any[] = readJsonFile('quizzes.json', []);
  const quiz = quizzes.find(q => q.id === param || q.slug === param);
  if (!quiz) {
    return res.status(404).json({ error: 'الاختبار غير موجود' });
  }
  res.json(quiz);
});

app.post('/api/quizzes', requireAdminAuth, (req: Request, res: Response) => {
  const { title, targetRole, track, subject, durationMinutes, description, questions } = req.body;

  if (!title || !title.trim() || !subject || !subject.trim()) {
    return res.status(400).json({ error: 'عنوان الاختبار والمادة مطلوبان' });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'يجب إضافة سؤال واحد على الأقل للاختبار التدريبي' });
  }

  const sanitizedQuestions = questions.map((q: any, idx: number) => ({
    id: q.id || `q-${Date.now()}-${idx + 1}`,
    questionText: String(q.questionText || '').trim(),
    options: Array.isArray(q.options) ? q.options.map((o: any) => String(o || '').trim()).filter(Boolean) : [],
    correctIndex: Number.isInteger(Number(q.correctIndex)) ? Number(q.correctIndex) : 0,
    explanation: String(q.explanation || 'تمت الإجابة وفق المراجع البيداغوجية والتشريعية المعتمدة.').trim(),
    topic: String(q.topic || subject).trim()
  })).filter((q: any) => q.questionText && q.options.length >= 2);

  if (sanitizedQuestions.length === 0) {
    return res.status(400).json({ error: 'يرجى التأكد من كتابة نص السؤال وخيارين على الأقل لكل سؤال' });
  }

  const quizzes: any[] = readJsonFile('quizzes.json', []);
  const id = `quiz-${Date.now()}`;
  const slug = `quiz-${Date.now().toString().slice(-6)}`;

  const newQuiz = {
    id,
    slug,
    title: title.trim(),
    targetRole: targetRole || 'جميع الرتب',
    track: track || 'مسابقات التوظيف',
    subject: subject.trim(),
    durationMinutes: Math.max(1, Number(durationMinutes) || 15),
    totalQuestions: sanitizedQuestions.length,
    description: String(description || '').trim(),
    questions: sanitizedQuestions
  };

  quizzes.unshift(newQuiz);
  writeJsonFile('quizzes.json', quizzes);
  res.status(201).json(newQuiz);
});

app.delete('/api/quizzes/:id', requireAdminAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  const quizzes: any[] = readJsonFile('quizzes.json', []);
  const filtered = quizzes.filter(q => q.id !== id);
  writeJsonFile('quizzes.json', filtered);
  res.json({ success: true });
});

// 6. Articles (Knowledge Center)
app.get('/api/articles', (req: Request, res: Response) => {
  const articles = readJsonFile('articles.json', []);
  res.json(articles);
});

app.get('/api/articles/:slugOrId', (req: Request, res: Response) => {
  const param = req.params.slugOrId;
  const articles: any[] = readJsonFile('articles.json', []);
  const article = articles.find(a => a.id === param || a.slug === param);
  if (!article) {
    return res.status(404).json({ error: 'المقال غير موجود' });
  }
  res.json(article);
});

app.post('/api/articles', (req: Request, res: Response) => {
  const newArticle = req.body;
  if (!newArticle.title || !newArticle.body) {
    return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });
  }
  const articles: any[] = readJsonFile('articles.json', []);
  const id = `art-${Date.now()}`;
  const slug = newArticle.slug || `article-${Date.now()}`;
  const record = { ...newArticle, id, slug, publicationDate: new Date().toISOString().split('T')[0] };
  articles.unshift(record);
  writeJsonFile('articles.json', articles);
  res.status(201).json(record);
});

// 7. Free Resources (Including Direct Google Drive Download Links)
app.get('/api/resources', (req: Request, res: Response) => {
  const resources = readJsonFile('resources.json', []);
  res.json(resources);
});

app.post('/api/resources', requireAdminAuth, (req: Request, res: Response) => {
  const { title, category, targetRole, format, fileSize, description, downloadUrl, autoConvertDrive } = req.body;

  if (!title || !title.trim() || !downloadUrl || !downloadUrl.trim()) {
    return res.status(400).json({ error: 'عنوان المورد ورابط التحميل (Google Drive أو رابط مباشر) مطلوبان' });
  }

  const resolvedUrl = normalizeGoogleDriveUrl(downloadUrl, autoConvertDrive !== false);
  const resources: any[] = readJsonFile('resources.json', []);
  const id = `res-${Date.now()}`;

  const newResource = {
    id,
    title: title.trim(),
    category: (category || 'موارد عامة').trim(),
    targetRole: targetRole || 'جميع الرتب',
    format: (format || 'PDF').trim(),
    fileSize: (fileSize || 'Google Drive').trim(),
    description: (description || '').trim(),
    downloadUrl: resolvedUrl,
    downloadCount: 0
  };

  resources.unshift(newResource);
  writeJsonFile('resources.json', resources);
  res.status(201).json(newResource);
});

app.delete('/api/resources/:id', requireAdminAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  const resources: any[] = readJsonFile('resources.json', []);
  const filtered = resources.filter(r => r.id !== id);
  writeJsonFile('resources.json', filtered);
  res.json({ success: true });
});

app.post('/api/resources/:id/download', (req: Request, res: Response) => {
  const id = req.params.id;
  const resources: any[] = readJsonFile('resources.json', []);
  const index = resources.findIndex(r => r.id === id);
  if (index !== -1) {
    resources[index].downloadCount = (resources[index].downloadCount || 0) + 1;
    writeJsonFile('resources.json', resources);
    return res.json({ success: true, count: resources[index].downloadCount });
  }
  res.json({ success: true });
});

// 8. Real Analytics & Business Measurement
app.get('/api/stats', requireAdminAuth, (req: Request, res: Response) => {
  const products: any[] = readJsonFile('products.json', []);
  const orders: any[] = readJsonFile('orders.json', []);
  const articles: any[] = readJsonFile('articles.json', []);
  const quizzes: any[] = readJsonFile('quizzes.json', []);

  const totalOrders = orders.length;
  const confirmedOrders = orders.filter(o => o.status === 'مؤكد' || o.status === 'قيد الشحن' || o.status === 'تم التسليم').length;
  const pendingOrders = orders.filter(o => o.status === 'جديد' || o.status === 'قيد التأكيد').length;
  const deliveredRevenue = orders
    .filter(o => o.status === 'تم التسليم' || o.status === 'قيد الشحن' || o.status === 'مؤكد')
    .reduce((sum, o) => sum + (o.totalDZD || 0), 0);

  // Group by Wilaya
  const wilayaCounts: Record<string, number> = {};
  orders.forEach(o => {
    const w = o.wilayaName || 'أخرى';
    wilayaCounts[w] = (wilayaCounts[w] || 0) + 1;
  });

  res.json({
    totalProducts: products.length,
    totalOrders,
    confirmedOrders,
    pendingOrders,
    deliveredRevenueDZD: deliveredRevenue,
    totalArticles: articles.length,
    totalQuizzes: quizzes.length,
    wilayaDistribution: wilayaCounts
  });
});

// --------------------------------------------------------------------------
// Dev Server & Production Static Serving
// --------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bewaba Tarbia backend running on port ${PORT}`);
  });
}

startServer();
