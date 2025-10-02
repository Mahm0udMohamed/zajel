# 🛍️ Products API Documentation

## نظرة عامة

API شامل لإدارة المنتجات في نظام Zajel مع دعم كامل للفئات والمناسبات والعلامات التجارية.

## 📋 الحقول المطلوبة

### الحقول الأساسية

- **nameAr** (string, required): اسم المنتج بالعربية (2-200 حرف)
- **nameEn** (string, required): اسم المنتج بالإنجليزية (2-200 حرف)
- **mainImage** (string, required): الصورة الأساسية للمنتج (URL صحيح)
- **price** (number, required): سعر المنتج (أكبر من أو يساوي 0)

### العلاقات

- **category** (ObjectId, required): معرف الفئة
- **occasion** (ObjectId, required): معرف المناسبة
- **brand** (ObjectId, required): معرف العلامة التجارية

### الحقول الاختيارية

- **additionalImages** (array): مصفوفة من الصور الإضافية
- **descriptionAr** (string): وصف المنتج بالعربية (حتى 2000 حرف)
- **descriptionEn** (string): وصف المنتج بالإنجليزية (حتى 2000 حرف)
- **careInstructions** (string): نصائح العناية (حتى 1000 حرف)
- **arrangementContents** (string): محتويات التنسيق (حتى 1000 حرف)

### حالة المنتج (productStatus)

- **الأكثر مبيعًا**
- **المجموعات المميزة**
- **هدايا فاخرة**
- **مناسبة خاصة**

### الجمهور المستهدف (targetAudience)

- **له**
- **لها**
- **لكابلز**

### الأبعاد (dimensions)

```json
{
  "length": 10,
  "width": 15,
  "height": 20,
  "unit": "سم"
}
```

### الحقول الإضافية

- **isActive** (boolean): حالة النشاط (افتراضي: true)
- **sortOrder** (number): ترتيب العرض (افتراضي: 0)
- **showInHomePage** (boolean): عرض في الصفحة الرئيسية (افتراضي: true)
- **isFeatured** (boolean): منتج مميز (افتراضي: false)

### حقول SEO

- **metaTitleAr** (string): عنوان SEO بالعربية (حتى 60 حرف)
- **metaTitleEn** (string): عنوان SEO بالإنجليزية (حتى 60 حرف)
- **metaDescriptionAr** (string): وصف SEO بالعربية (حتى 160 حرف)
- **metaDescriptionEn** (string): وصف SEO بالإنجليزية (حتى 160 حرف)

## 🚀 API Endpoints

### Public Routes (لا تحتاج مصادقة)

#### 1. جلب جميع المنتجات

```http
GET /api/products
```

**Query Parameters:**

- `page` (number): رقم الصفحة (افتراضي: 1)
- `limit` (number): عدد العناصر في الصفحة (افتراضي: 50)
- `isActive` (boolean): فلترة المنتجات النشطة
- `language` (string): اللغة (ar/en) (افتراضي: ar)
- `search` (string): البحث في الأسماء والأوصاف
- `sortBy` (string): حقل الترتيب (افتراضي: sortOrder)
- `sortOrder` (string): اتجاه الترتيب (asc/desc) (افتراضي: asc)
- `category` (ObjectId): فلترة حسب الفئة
- `occasion` (ObjectId): فلترة حسب المناسبة
- `brand` (ObjectId): فلترة حسب العلامة التجارية
- `productStatus` (string): فلترة حسب حالة المنتج
- `targetAudience` (string): فلترة حسب الجمهور المستهدف
- `showInHomePage` (boolean): فلترة حسب العرض في الصفحة الرئيسية
- `isFeatured` (boolean): فلترة المنتجات المميزة
- `minPrice` (number): الحد الأدنى للسعر
- `maxPrice` (number): الحد الأقصى للسعر

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "اسم المنتج",
      "nameAr": "اسم المنتج بالعربية",
      "nameEn": "اسم المنتج بالإنجليزية",
      "mainImage": "url",
      "additionalImages": ["url1", "url2"],
      "price": 100,
      "category": {
        "_id": "category_id",
        "nameAr": "اسم الفئة",
        "nameEn": "Category Name",
        "imageUrl": "url"
      },
      "occasion": {
        "_id": "occasion_id",
        "nameAr": "اسم المناسبة",
        "nameEn": "Occasion Name",
        "imageUrl": "url"
      },
      "brand": {
        "_id": "brand_id",
        "nameAr": "اسم العلامة التجارية",
        "nameEn": "Brand Name",
        "imageUrl": "url"
      },
      "productStatus": "الأكثر مبيعًا",
      "targetAudience": "له",
      "careInstructions": "نصائح العناية",
      "dimensions": {
        "length": 10,
        "width": 15,
        "height": 20,
        "unit": "سم"
      },
      "arrangementContents": "محتويات التنسيق",
      "isActive": true,
      "sortOrder": 1,
      "viewCount": 0,
      "purchaseCount": 0,
      "isFeatured": false,
      "showInHomePage": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "تم جلب المنتجات بنجاح"
}
```

#### 2. جلب منتج محدد

```http
GET /api/products/:id
```

**Parameters:**

- `id` (ObjectId): معرف المنتج

**Query Parameters:**

- `language` (string): اللغة (ar/en) (افتراضي: ar)

#### 3. جلب المنتجات النشطة

```http
GET /api/products/active
```

**Query Parameters:**

- `language` (string): اللغة (ar/en) (افتراضي: ar)
- `filters` (object): فلاتر إضافية

#### 4. البحث في المنتجات

```http
GET /api/products/search?q=search_term
```

**Query Parameters:**

- `q` (string, required): استعلام البحث (على الأقل حرفين)
- `language` (string): اللغة (ar/en) (افتراضي: ar)
- `limit` (number): الحد الأقصى للنتائج (1-100) (افتراضي: 10)
- `page` (number): رقم الصفحة (افتراضي: 1)
- `filters` (object): فلاتر إضافية

#### 5. زيادة عدد المشاهدات

```http
PATCH /api/products/:id/views
```

#### 6. زيادة عدد المشتريات

```http
PATCH /api/products/:id/purchases
```

### Admin Routes (تحتاج مصادقة المدير)

#### 1. إنشاء منتج جديد

```http
POST /api/products
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "nameAr": "اسم المنتج بالعربية",
  "nameEn": "Product Name in English",
  "mainImage": "https://example.com/image.jpg",
  "additionalImages": ["https://example.com/image1.jpg"],
  "price": 100,
  "category": "category_id",
  "occasion": "occasion_id",
  "brand": "brand_id",
  "descriptionAr": "وصف المنتج بالعربية",
  "descriptionEn": "Product description in English",
  "productStatus": "الأكثر مبيعًا",
  "targetAudience": "له",
  "careInstructions": "نصائح العناية",
  "dimensions": {
    "length": 10,
    "width": 15,
    "height": 20,
    "unit": "سم"
  },
  "arrangementContents": "محتويات التنسيق",
  "isActive": true,
  "sortOrder": 1,
  "showInHomePage": true,
  "isFeatured": false,
  "metaTitleAr": "عنوان SEO بالعربية",
  "metaTitleEn": "SEO Title in English",
  "metaDescriptionAr": "وصف SEO بالعربية",
  "metaDescriptionEn": "SEO Description in English"
}
```

#### 2. تحديث منتج

```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
```

#### 3. حذف منتج

```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

#### 4. تفعيل/إلغاء تفعيل منتج

```http
PATCH /api/products/:id/toggle
Authorization: Bearer <admin_token>
```

#### 5. إعادة ترتيب المنتجات

```http
PATCH /api/products/reorder
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "productOrders": [
    {
      "productId": "product_id_1",
      "sortOrder": 1
    },
    {
      "productId": "product_id_2",
      "sortOrder": 2
    }
  ]
}
```

#### 6. رفع صورة منتج

```http
POST /api/products/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**

- `image` (file): ملف الصورة

#### 7. حذف صورة منتج

```http
DELETE /api/products/image/:publicId
Authorization: Bearer <admin_token>
```

#### 8. إنشاء منتج مع رفع صورة

```http
POST /api/products/create-with-image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**

- `image` (file): ملف الصورة الأساسية
- `nameAr` (string): اسم المنتج بالعربية
- `nameEn` (string): اسم المنتج بالإنجليزية
- `price` (number): سعر المنتج
- `category` (string): معرف الفئة
- `occasion` (string): معرف المناسبة
- `brand` (string): معرف العلامة التجارية
- `productStatus` (string): حالة المنتج
- `targetAudience` (string): الجمهور المستهدف
- ... (باقي الحقول)

## 🔧 الميزات المتقدمة

### 1. نظام الكاش (Caching)

- كاش ذكي لمدة 30 دقيقة للمنتجات
- كاش لمدة ساعة للمنتجات النشطة
- مسح تلقائي للكاش عند التحديث

### 2. البحث المتقدم

- بحث في الأسماء والأوصاف
- بحث في نصائح العناية ومحتويات التنسيق
- دعم البحث باللغة العربية والإنجليزية

### 3. الفلترة المتقدمة

- فلترة حسب الفئة والمناسبة والعلامة التجارية
- فلترة حسب حالة المنتج والجمهور المستهدف
- فلترة حسب السعر (حد أدنى وأقصى)
- فلترة حسب المنتجات المميزة

### 4. إدارة الصور

- رفع متعدد للصور
- تحسين تلقائي للصور
- دعم Cloudinary

### 5. الإحصائيات

- تتبع عدد المشاهدات
- تتبع عدد المشتريات
- تحديث تلقائي لإحصائيات الفئات والمناسبات والعلامات التجارية

## 📊 Response Codes

- **200**: نجح الطلب
- **201**: تم إنشاء المنتج بنجاح
- **400**: بيانات غير صحيحة
- **401**: غير مصرح
- **404**: المنتج غير موجود
- **409**: تعارض (منتج بنفس الاسم موجود)
- **500**: خطأ في الخادم

## 🔒 الأمان

- مصادقة JWT للمديرين
- التحقق من صحة البيانات
- حماية من SQL Injection
- Rate Limiting
- CORS Configuration

## 📝 ملاحظات مهمة

1. **العلاقات**: يجب أن تكون الفئة والمناسبة والعلامة التجارية موجودة قبل إنشاء المنتج
2. **الأسماء الفريدة**: لا يمكن وجود منتجين بنفس الاسم
3. **الصور**: الصورة الأساسية مطلوبة، الصور الإضافية اختيارية
4. **الترتيب**: يتم تعيين ترتيب تلقائي إذا لم يتم تحديده
5. **الإحصائيات**: يتم تحديث إحصائيات الفئات والمناسبات والعلامات التجارية تلقائياً

## 🚀 البدء السريع

```bash
# جلب جميع المنتجات
curl -X GET "https://localhost:3002/api/products"

# جلب منتج محدد
curl -X GET "https://localhost:3002/api/products/PRODUCT_ID"

# البحث في المنتجات
curl -X GET "https://localhost:3002/api/products/search?q=هدية"

# إنشاء منتج جديد (يتطلب مصادقة)
curl -X POST "https://localhost:3002/api/products" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "باقة ورد حمراء",
    "nameEn": "Red Rose Bouquet",
    "mainImage": "https://example.com/rose.jpg",
    "price": 150,
    "category": "CATEGORY_ID",
    "occasion": "OCCASION_ID",
    "brand": "BRAND_ID",
    "productStatus": "هدايا فاخرة",
    "targetAudience": "لها"
  }'
```
