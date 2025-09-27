# Hero Occasions API Documentation

## نظرة عامة

هذا API مخصص لإدارة مناسبات الهيرو في تطبيق زاجل. يدعم العمليات الأساسية CRUD بالإضافة إلى ميزات متقدمة مثل البحث والفلترة.

## Base URL

```
https://localhost:3002/api/hero-occasions
```

## النماذج (Models)

### HeroOccasion

```javascript
{
  id: String,                    // معرف فريد للمناسبة
  nameAr: String,               // الاسم بالعربية
  nameEn: String,               // الاسم بالإنجليزية
  date: Date,                   // تاريخ المناسبة
  images: [String],             // مصفوفة روابط الصور
  celebratoryMessageAr: String, // الرسالة التهنئة بالعربية
  celebratoryMessageEn: String, // الرسالة التهنئة بالإنجليزية
  priority: Number,             // الأولوية (1-10)
  isActive: Boolean,            // حالة التفعيل
  createdBy: ObjectId,          // منشئ المناسبة
  updatedBy: ObjectId,          // آخر من حدث المناسبة
  createdAt: Date,              // تاريخ الإنشاء
  updatedAt: Date               // تاريخ آخر تحديث
}
```

## نقاط النهاية (Endpoints)

### 1. الحصول على جميع المناسبات

```http
GET /api/hero-occasions
```

#### المعاملات (Query Parameters)

- `page` (optional): رقم الصفحة (افتراضي: 1)
- `limit` (optional): عدد النتائج في الصفحة (افتراضي: 10)
- `isActive` (optional): فلترة حسب حالة التفعيل (true/false)
- `priority` (optional): فلترة حسب الأولوية (1-10)
- `search` (optional): البحث في الأسماء
- `language` (optional): لغة البحث (ar/en)
- `sortBy` (optional): حقل الترتيب (priority/date/nameAr/nameEn/createdAt)
- `sortOrder` (optional): اتجاه الترتيب (asc/desc)

#### مثال

```http
GET /api/hero-occasions?page=1&limit=5&isActive=true&sortBy=priority&sortOrder=asc
```

#### الاستجابة

```json
{
  "success": true,
  "data": [
    {
      "id": "eid-fitr",
      "nameAr": "عيد الفطر",
      "nameEn": "Eid Fitr",
      "date": "2026-04-05T00:00:00.000Z",
      "images": ["https://example.com/image1.jpg"],
      "celebratoryMessageAr": "عيد فطر مبارك!",
      "celebratoryMessageEn": "Eid Fitr Mubarak!",
      "priority": 1,
      "isActive": true,
      "createdBy": {
        "name": "مدير النظام",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 10,
    "itemsPerPage": 5
  }
}
```

### 2. الحصول على مناسبة واحدة

```http
GET /api/hero-occasions/:id
```

#### المعاملات

- `id`: معرف المناسبة

#### مثال

```http
GET /api/hero-occasions/eid-fitr
```

### 3. الحصول على المناسبات النشطة

```http
GET /api/hero-occasions/active
```

#### المعاملات

- `limit` (optional): عدد النتائج (افتراضي: 10)
- `priority` (optional): فلترة حسب الأولوية

### 4. الحصول على المناسبات القادمة

```http
GET /api/hero-occasions/upcoming
```

#### المعاملات

- `limit` (optional): عدد النتائج (افتراضي: 5)

### 5. البحث في المناسبات

```http
GET /api/hero-occasions/search
```

#### المعاملات

- `q`: كلمة البحث (مطلوبة)
- `language` (optional): لغة البحث (ar/en)
- `limit` (optional): عدد النتائج (افتراضي: 10)

#### مثال

```http
GET /api/hero-occasions/search?q=عيد&language=ar&limit=5
```

## نقاط النهاية المحمية (تحتاج مصادقة أدمن)

### 6. إنشاء مناسبة جديدة

```http
POST /api/hero-occasions
Authorization: Bearer <admin_token>
```

#### البيانات المطلوبة

```json
{
  "id": "new-occasion",
  "nameAr": "مناسبة جديدة",
  "nameEn": "New Occasion",
  "date": "2025-12-31T00:00:00.000Z",
  "images": ["https://example.com/image1.jpg"],
  "celebratoryMessageAr": "تهنئة بالعربية",
  "celebratoryMessageEn": "Congratulations in English",
  "priority": 5,
  "isActive": true
}
```

### 7. تحديث مناسبة موجودة

```http
PUT /api/hero-occasions/:id
Authorization: Bearer <admin_token>
```

#### البيانات (جميعها اختيارية)

```json
{
  "nameAr": "اسم محدث",
  "nameEn": "Updated Name",
  "date": "2025-12-31T00:00:00.000Z",
  "images": ["https://example.com/new-image.jpg"],
  "celebratoryMessageAr": "رسالة محدثة",
  "celebratoryMessageEn": "Updated Message",
  "priority": 3,
  "isActive": false
}
```

### 8. حذف مناسبة

```http
DELETE /api/hero-occasions/:id
Authorization: Bearer <admin_token>
```

### 9. تبديل حالة المناسبة

```http
PATCH /api/hero-occasions/:id/toggle
Authorization: Bearer <admin_token>
```

### 10. استيراد مناسبات من ملف JSON

```http
POST /api/hero-occasions/import
Authorization: Bearer <admin_token>
```

#### البيانات المطلوبة

```json
{
  "occasions": [
    {
      "id": "occasion-1",
      "nameAr": "مناسبة 1",
      "nameEn": "Occasion 1",
      "date": "2025-12-31T00:00:00.000Z",
      "images": ["https://example.com/image1.jpg"],
      "celebratoryMessageAr": "تهنئة 1",
      "celebratoryMessageEn": "Message 1",
      "priority": 1,
      "isActive": true
    }
  ]
}
```

## رموز الاستجابة

- `200` - نجح الطلب
- `201` - تم إنشاء المناسبة بنجاح
- `400` - بيانات غير صحيحة
- `401` - غير مصرح (تحتاج مصادقة)
- `404` - المناسبة غير موجودة
- `500` - خطأ في الخادم

## أمثلة على الاستخدام

### JavaScript (Fetch API)

```javascript
// الحصول على المناسبات النشطة
const response = await fetch(
  "https://localhost:3002/api/hero-occasions/active"
);
const data = await response.json();

// إنشاء مناسبة جديدة (تحتاج مصادقة)
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

### cURL

```bash
# الحصول على جميع المناسبات
curl -X GET "https://localhost:3002/api/hero-occasions"

# البحث في المناسبات
curl -X GET "https://localhost:3002/api/hero-occasions/search?q=عيد&language=ar"

# إنشاء مناسبة جديدة
curl -X POST "https://localhost:3002/api/hero-occasions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{
    "id": "test-occasion",
    "nameAr": "مناسبة تجريبية",
    "nameEn": "Test Occasion",
    "date": "2025-12-31T00:00:00.000Z",
    "images": ["https://example.com/test.jpg"],
    "celebratoryMessageAr": "تهنئة تجريبية",
    "celebratoryMessageEn": "Test Message",
    "priority": 5,
    "isActive": true
  }'
```

## ملاحظات مهمة

1. **المصادقة**: جميع عمليات الإنشاء والتحديث والحذف تحتاج إلى مصادقة أدمن
2. **التحقق من البيانات**: يتم التحقق من صحة جميع البيانات المدخلة
3. **الفهرسة**: تم إضافة فهارس لتحسين الأداء
4. **الترقيم**: يدعم API الترقيم للنتائج الكبيرة
5. **البحث**: يدعم البحث في الأسماء العربية والإنجليزية
6. **الفلترة**: يمكن فلترة النتائج حسب الحالة والأولوية
7. **الترتيب**: يمكن ترتيب النتائج حسب حقول مختلفة

## الأمان

- جميع الطلبات محمية بـ CORS
- يتم التحقق من صحة البيانات المدخلة
- المصادقة مطلوبة للعمليات الحساسة
- يتم تسجيل جميع التغييرات مع معرف المستخدم
