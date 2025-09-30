# Categories API Documentation

## نظرة عامة

تم إنشاء نظام إدارة الفئات الكامل في الباك اند مع دعم الكاش والترجمة والفلترة المتقدمة.

## الملفات المُنشأة/المُحدثة

### 1. النماذج (Models)

- **`models/Category.js`**: نموذج الفئات مع جميع الحقول المطلوبة

### 2. المتحكمات (Controllers)

- **`controllers/categoryController.js`**: جميع عمليات إدارة الفئات

### 3. المسارات (Routes)

- **`routes/categoryRoutes.js`**: مسارات API العامة للفئات
- **`routes/adminRoutes.js`**: مسارات إدارة الفئات (للمديرين)

### 4. الإعدادات

- **`server.js`**: إضافة مسارات الفئات ومسح الكاش
- **`config/cacheConfig.js`**: إعدادات الكاش للفئات

## API Endpoints

### المسارات العامة (Public Routes)

#### 1. جلب جميع الفئات

```
GET /api/categories
```

**Query Parameters:**

- `page` (number): رقم الصفحة (افتراضي: 1)
- `limit` (number): عدد العناصر في الصفحة (افتراضي: 50)
- `isActive` (boolean): فلترة الفئات النشطة
- `language` (string): اللغة (ar/en) (افتراضي: ar)
- `search` (string): البحث في أسماء الفئات
- `sortBy` (string): ترتيب حسب (افتراضي: sortOrder)
- `sortOrder` (string): اتجاه الترتيب (asc/desc) (افتراضي: asc)
- `showInHomePage` (boolean): فلترة الفئات المعروضة في الصفحة الرئيسية
- `showInNavigation` (boolean): فلترة الفئات المعروضة في التنقل

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "اسم الفئة",
      "nameAr": "اسم الفئة بالعربية",
      "nameEn": "اسم الفئة بالإنجليزية",
      "description": "وصف الفئة",
      "imageUrl": "رابط الصورة",
      "isActive": true,
      "sortOrder": 1,
      "productCount": 0,
      "showInHomePage": true,
      "showInNavigation": true,
      "primaryColor": "#3B82F6",
      "secondaryColor": "#8B5CF6",
      "createdBy": {...},
      "updatedBy": {...},
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 10,
    "itemsPerPage": 50,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "message": "تم جلب الفئات بنجاح"
}
```

#### 2. جلب فئة محددة

```
GET /api/categories/:id
```

**Query Parameters:**

- `language` (string): اللغة (ar/en) (افتراضي: ar)

#### 3. جلب الفئات النشطة

```
GET /api/categories/active
```

**Query Parameters:**

- `language` (string): اللغة (ar/en) (افتراضي: ar)

#### 4. البحث في الفئات

```
GET /api/categories/search
```

**Query Parameters:**

- `q` (string): استعلام البحث (مطلوب)
- `language` (string): اللغة (ar/en) (افتراضي: ar)
- `limit` (number): الحد الأقصى للنتائج (افتراضي: 10)
- `page` (number): رقم الصفحة (افتراضي: 1)

### مسارات الإدارة (Admin Routes)

جميع المسارات التالية تحتاج مصادقة المدير:

#### 1. إنشاء فئة جديدة

```
POST /api/admin/categories
```

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**

```json
{
  "nameAr": "اسم الفئة بالعربية",
  "nameEn": "Category Name in English",
  "descriptionAr": "وصف الفئة بالعربية",
  "descriptionEn": "Category description in English",
  "imageUrl": "https://example.com/image.jpg",
  "isActive": true,
  "sortOrder": 1,
  "showInHomePage": true,
  "showInNavigation": true,
  "primaryColor": "#3B82F6",
  "secondaryColor": "#8B5CF6",
  "metaTitleAr": "عنوان SEO بالعربية",
  "metaTitleEn": "SEO Title in English",
  "metaDescriptionAr": "وصف SEO بالعربية",
  "metaDescriptionEn": "SEO Description in English"
}
```

#### 2. تحديث فئة

```
PUT /api/admin/categories/:id
```

#### 3. حذف فئة

```
DELETE /api/admin/categories/:id
```

#### 4. تفعيل/إلغاء تفعيل فئة

```
PATCH /api/admin/categories/:id/toggle
```

#### 5. إعادة ترتيب الفئات

```
PATCH /api/admin/categories/reorder
```

**Body:**

```json
{
  "categoryOrders": [
    {
      "categoryId": "category_id_1",
      "sortOrder": 1
    },
    {
      "categoryId": "category_id_2",
      "sortOrder": 2
    }
  ]
}
```

## ميزات النظام

### 1. دعم متعدد اللغات

- دعم كامل للعربية والإنجليزية
- إرجاع البيانات حسب اللغة المطلوبة
- دعم البحث في كلا اللغتين

### 2. نظام الكاش المتقدم

- كاش ذكي للفئات مع TTL مختلف حسب نوع البيانات
- مسح تلقائي للكاش عند التحديث
- دعم الضغط لتوفير المساحة

### 3. الفلترة والبحث

- بحث نصي في أسماء ووصف الفئات
- فلترة حسب حالة النشاط
- فلترة حسب إعدادات العرض
- ترتيب متقدم

### 4. إدارة متقدمة

- إعادة ترتيب الفئات
- تفعيل/إلغاء تفعيل
- تتبع من قام بإنشاء/تحديث كل فئة
- دعم SEO

### 5. التحقق من البيانات

- validation شامل لجميع الحقول
- رسائل خطأ بالعربية
- التحقق من صحة الروابط والألوان

## إعدادات الكاش

تم إضافة إعدادات كاش مخصصة للفئات:

- **categories**: TTL = 1 ساعة، ضغط مفعل
- **categories-active**: TTL = 2 ساعة، للفئات النشطة
- **category-details**: TTL = 4 ساعات، لتفاصيل فئة محددة

## الاستخدام في لوحة التحكم

يمكن استخدام هذه الـ APIs في لوحة التحكم لإدارة الفئات:

1. **عرض قائمة الفئات**: `GET /api/admin/categories`
2. **إنشاء فئة جديدة**: `POST /api/admin/categories`
3. **تعديل فئة**: `PUT /api/admin/categories/:id`
4. **حذف فئة**: `DELETE /api/admin/categories/:id`
5. **إعادة ترتيب**: `PATCH /api/admin/categories/reorder`

## ملاحظات مهمة

1. جميع المسارات العامة لا تحتاج مصادقة
2. مسارات الإدارة تحتاج مصادقة المدير
3. يتم مسح الكاش تلقائياً عند أي تحديث
4. النظام يدعم Pagination للقوائم الكبيرة
5. جميع الرسائل بالعربية مع دعم الإنجليزية
