# Hero Occasions Backend - دليل التهيئة والاستخدام

## نظرة عامة

تم إنشاء نظام إدارة مناسبات الهيرو في الباك إند لاستبدال ملف `heroOccasions.json` الثابت بنظام ديناميكي يدعم إدارة كاملة للبيانات.

## المكونات المُنشأة

### 1. النموذج (Model)

- **الملف**: `models/HeroOccasion.js`
- **الوظيفة**: تعريف هيكل بيانات مناسبات الهيرو
- **الميزات**:
  - فهرسة محسنة للأداء
  - التحقق من صحة البيانات
  - دوال مساعدة للبحث والفلترة
  - دعم متعدد اللغات

### 2. الكونترولر (Controller)

- **الملف**: `controllers/heroOccasionsController.js`
- **الوظيفة**: معالجة منطق العمل لجميع العمليات
- **العمليات المدعومة**:
  - `getAllOccasions` - الحصول على جميع المناسبات مع فلترة وترقيم
  - `getOccasionById` - الحصول على مناسبة واحدة
  - `getActiveOccasions` - الحصول على المناسبات النشطة
  - `getUpcomingOccasions` - الحصول على المناسبات القادمة
  - `createOccasion` - إنشاء مناسبة جديدة
  - `updateOccasion` - تحديث مناسبة موجودة
  - `deleteOccasion` - حذف مناسبة
  - `toggleOccasionStatus` - تبديل حالة المناسبة
  - `searchOccasions` - البحث في المناسبات
  - `importOccasions` - استيراد مناسبات من ملف JSON

### 3. المسارات (Routes)

- **الملف**: `routes/heroOccasionsRoutes.js`
- **الوظيفة**: تعريف نقاط النهاية API
- **المسارات**:
  - `GET /api/hero-occasions` - قائمة المناسبات
  - `GET /api/hero-occasions/active` - المناسبات النشطة
  - `GET /api/hero-occasions/upcoming` - المناسبات القادمة
  - `GET /api/hero-occasions/search` - البحث
  - `GET /api/hero-occasions/:id` - مناسبة واحدة
  - `POST /api/hero-occasions` - إنشاء مناسبة (محمي)
  - `PUT /api/hero-occasions/:id` - تحديث مناسبة (محمي)
  - `DELETE /api/hero-occasions/:id` - حذف مناسبة (محمي)
  - `PATCH /api/hero-occasions/:id/toggle` - تبديل الحالة (محمي)
  - `POST /api/hero-occasions/import` - استيراد (محمي)

### 4. سكريبت الاستيراد

- **الملف**: `scripts/importHeroOccasions.js`
- **الوظيفة**: استيراد البيانات من ملف JSON إلى قاعدة البيانات
- **الميزات**:
  - استيراد آمن مع التحقق من التكرار
  - واجهة تفاعلية للاختيار
  - تقارير مفصلة عن العملية
  - إحصائيات شاملة

## التهيئة والاستخدام

### 1. تثبيت التبعيات

```bash
cd back-end
npm install
```

### 2. إعداد متغيرات البيئة

تأكد من وجود المتغيرات التالية في ملف `.env`:

```env
MONGO_URI=mongodb://your-mongodb-connection-string
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
ADMIN_NAME=مدير النظام
```

### 3. تشغيل السيرفر

```bash
# للتطوير
npm run dev

# للتطوير مع HTTPS
npm run dev:https

# للإنتاج
npm run build
npm start
```

### 4. استيراد البيانات الموجودة

```bash
# استيراد مناسبات الهيرو من ملف JSON
npm run import:hero-occasions
```

## هيكل البيانات

### HeroOccasion Schema

```javascript
{
  id: String,                    // معرف فريد (مطلوب)
  nameAr: String,               // الاسم بالعربية (مطلوب)
  nameEn: String,               // الاسم بالإنجليزية (مطلوب)
  date: Date,                   // تاريخ المناسبة (مطلوب)
  images: [String],             // مصفوفة روابط الصور (مطلوب)
  celebratoryMessageAr: String, // الرسالة التهنئة بالعربية (مطلوب)
  celebratoryMessageEn: String, // الرسالة التهنئة بالإنجليزية (مطلوب)
  priority: Number,             // الأولوية 1-10 (افتراضي: 5)
  isActive: Boolean,            // حالة التفعيل (افتراضي: true)
  createdBy: ObjectId,          // منشئ المناسبة (مطلوب)
  updatedBy: ObjectId,          // آخر من حدث المناسبة
  createdAt: Date,              // تاريخ الإنشاء
  updatedAt: Date               // تاريخ آخر تحديث
}
```

## الميزات المتقدمة

### 1. الفهرسة المحسنة

- فهرس على `id` للبحث السريع
- فهرس مركب على `isActive` و `priority`
- فهرس على `date` للبحث الزمني
- فهرس نصي على `nameAr` و `nameEn` للبحث

### 2. التحقق من البيانات

- التحقق من صحة معرف المناسبة
- التحقق من صحة روابط الصور
- التحقق من نطاق الأولوية (1-10)
- التحقق من صحة التواريخ

### 3. البحث والفلترة

- البحث النصي في الأسماء
- فلترة حسب حالة التفعيل
- فلترة حسب الأولوية
- ترتيب متقدم حسب حقول مختلفة

### 4. الترقيم

- دعم الترقيم للنتائج الكبيرة
- إحصائيات شاملة للصفحات
- أداء محسن للاستعلامات

### 5. الأمان

- مصادقة مطلوبة للعمليات الحساسة
- تسجيل جميع التغييرات مع معرف المستخدم
- حماية من SQL Injection
- التحقق من صحة البيانات المدخلة

## أمثلة على الاستخدام

### 1. الحصول على المناسبات النشطة

```javascript
const response = await fetch(
  "https://localhost:3002/api/hero-occasions/active"
);
const data = await response.json();
console.log(data.data); // مصفوفة المناسبات النشطة
```

### 2. البحث في المناسبات

```javascript
const response = await fetch(
  "https://localhost:3002/api/hero-occasions/search?q=عيد&language=ar"
);
const data = await response.json();
console.log(data.data); // نتائج البحث
```

### 3. إنشاء مناسبة جديدة

```javascript
const newOccasion = {
  id: "test-occasion",
  nameAr: "مناسبة تجريبية",
  nameEn: "Test Occasion",
  date: "2025-12-31T00:00:00.000Z",
  images: ["https://example.com/test.jpg"],
  celebratoryMessageAr: "تهنئة تجريبية",
  celebratoryMessageEn: "Test Message",
  priority: 5,
  isActive: true,
};

const response = await fetch("https://localhost:3002/api/hero-occasions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-admin-token",
  },
  body: JSON.stringify(newOccasion),
});
```

## الاختبار

### 1. اختبار نقاط النهاية العامة

```bash
# الحصول على المناسبات النشطة
curl -X GET "https://localhost:3002/api/hero-occasions/active"

# البحث في المناسبات
curl -X GET "https://localhost:3002/api/hero-occasions/search?q=عيد&language=ar"

# الحصول على مناسبة واحدة
curl -X GET "https://localhost:3002/api/hero-occasions/eid-fitr"
```

### 2. اختبار نقاط النهاية المحمية

```bash
# إنشاء مناسبة جديدة (تحتاج مصادقة)
curl -X POST "https://localhost:3002/api/hero-occasions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{"id":"test","nameAr":"اختبار","nameEn":"Test","date":"2025-12-31T00:00:00.000Z","images":["https://example.com/test.jpg"],"celebratoryMessageAr":"تهنئة","celebratoryMessageEn":"Message","priority":5,"isActive":true}'
```

## استكشاف الأخطاء

### 1. مشاكل الاتصال بقاعدة البيانات

- تأكد من صحة `MONGO_URI`
- تأكد من إمكانية الوصول لقاعدة البيانات
- تحقق من إعدادات الشبكة

### 2. مشاكل المصادقة

- تأكد من وجود أدمن في قاعدة البيانات
- تحقق من صحة التوكن
- تأكد من إرسال التوكن في الهيدر

### 3. مشاكل التحقق من البيانات

- تحقق من صحة البيانات المدخلة
- تأكد من وجود جميع الحقول المطلوبة
- تحقق من صحة تنسيق البيانات

## الصيانة والتطوير

### 1. إضافة حقول جديدة

1. تحديث `HeroOccasion` schema
2. تحديث validation في المسارات
3. تحديث الكونترولر
4. تحديث التوثيق

### 2. تحسين الأداء

1. مراجعة الفهارس
2. تحسين الاستعلامات
3. إضافة cache إذا لزم الأمر
4. مراقبة الأداء

### 3. إضافة ميزات جديدة

1. إضافة endpoints جديدة
2. تحديث الكونترولر
3. إضافة validation
4. تحديث التوثيق

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:

1. راجع ملف `HERO_OCCASIONS_API.md` للتوثيق التفصيلي
2. تحقق من logs السيرفر
3. استخدم أدوات التطوير لفحص الطلبات
4. راجع ملفات الكونترولر والمسارات

---

**ملاحظة**: هذا النظام مصمم لاستبدال ملف `heroOccasions.json` الثابت بنظام ديناميكي يدعم إدارة كاملة للبيانات مع الحفاظ على نفس هيكل البيانات الأصلي.
