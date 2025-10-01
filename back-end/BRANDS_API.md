# Brands API Documentation

## نظرة عامة

هذا الملف يوثق API العلامات التجارية في النظام. العلامات التجارية تحتوي على:

- الاسم (بالعربية والإنجليزية)
- الصورة
- الوصف (بالعربية والإنجليزية)
- حالة النشاط (isActive)

## Base URL

```
https://localhost:3002/api/brands
```

## Authentication

جميع العمليات الإدارية تتطلب مصادقة المدير عبر `authenticateAdmin` middleware.

## Endpoints

### 1. جلب جميع العلامات التجارية

```http
GET /api/brands
```

**Query Parameters:**

- `page` (optional): رقم الصفحة (افتراضي: 1)
- `limit` (optional): عدد العناصر في الصفحة (افتراضي: 50)
- `isActive` (optional): فلترة حسب حالة النشاط (true/false)
- `language` (optional): اللغة (ar/en) (افتراضي: ar)
- `search` (optional): البحث في الأسماء والأوصاف
- `sortBy` (optional): ترتيب حسب (افتراضي: sortOrder)
- `sortOrder` (optional): اتجاه الترتيب (asc/desc) (افتراضي: asc)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "brand_id",
      "name": "اسم العلامة التجارية",
      "nameAr": "اسم العلامة التجارية بالعربية",
      "nameEn": "اسم العلامة التجارية بالإنجليزية",
      "description": "وصف العلامة التجارية",
      "descriptionAr": "وصف العلامة التجارية بالعربية",
      "descriptionEn": "وصف العلامة التجارية بالإنجليزية",
      "imageUrl": "https://example.com/image.jpg",
      "isActive": true,
      "sortOrder": 1,
      "productCount": 0,
      "createdBy": {
        "_id": "admin_id",
        "name": "اسم المدير",
        "email": "admin@example.com"
      },
      "updatedBy": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 50,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "message": "تم جلب العلامات التجارية بنجاح"
}
```

### 2. جلب علامة تجارية محددة

```http
GET /api/brands/:id
```

**Parameters:**

- `id`: معرف العلامة التجارية

**Query Parameters:**

- `language` (optional): اللغة (ar/en) (افتراضي: ar)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "brand_id",
    "name": "اسم العلامة التجارية",
    "nameAr": "اسم العلامة التجارية بالعربية",
    "nameEn": "اسم العلامة التجارية بالإنجليزية",
    "description": "وصف العلامة التجارية",
    "descriptionAr": "وصف العلامة التجارية بالعربية",
    "descriptionEn": "وصف العلامة التجارية بالإنجليزية",
    "imageUrl": "https://example.com/image.jpg",
    "isActive": true,
    "sortOrder": 1,
    "productCount": 0,
    "createdBy": {
      "_id": "admin_id",
      "name": "اسم المدير",
      "email": "admin@example.com"
    },
    "updatedBy": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم جلب العلامة التجارية بنجاح"
}
```

### 3. جلب العلامات التجارية النشطة

```http
GET /api/brands/active
```

**Query Parameters:**

- `language` (optional): اللغة (ar/en) (افتراضي: ar)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "nameAr": "اسم العلامة التجارية بالعربية",
      "nameEn": "اسم العلامة التجارية بالإنجليزية",
      "descriptionAr": "وصف العلامة التجارية بالعربية",
      "descriptionEn": "وصف العلامة التجارية بالإنجليزية",
      "imageUrl": "https://example.com/image.jpg",
      "sortOrder": 1
    }
  ],
  "message": "تم جلب العلامات التجارية النشطة بنجاح"
}
```

### 4. البحث في العلامات التجارية

```http
GET /api/brands/search
```

**Query Parameters:**

- `q` (required): استعلام البحث (على الأقل حرفين)
- `language` (optional): اللغة (ar/en) (افتراضي: ar)
- `limit` (optional): الحد الأقصى للنتائج (افتراضي: 10)
- `page` (optional): رقم الصفحة (افتراضي: 1)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "nameAr": "اسم العلامة التجارية بالعربية",
      "nameEn": "اسم العلامة التجارية بالإنجليزية",
      "descriptionAr": "وصف العلامة التجارية بالعربية",
      "descriptionEn": "وصف العلامة التجارية بالإنجليزية",
      "imageUrl": "https://example.com/image.jpg",
      "sortOrder": 1
    }
  ],
  "message": "تم البحث في العلامات التجارية بنجاح"
}
```

### 5. إنشاء علامة تجارية جديدة (Admin)

```http
POST /api/brands
```

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "nameAr": "اسم العلامة التجارية بالعربية",
  "nameEn": "اسم العلامة التجارية بالإنجليزية",
  "descriptionAr": "وصف العلامة التجارية بالعربية",
  "descriptionEn": "وصف العلامة التجارية بالإنجليزية",
  "imageUrl": "https://example.com/image.jpg",
  "isActive": true,
  "sortOrder": 0
}
```

**Validation Rules:**

- `nameAr`: مطلوب، 2-100 حرف
- `nameEn`: مطلوب، 2-100 حرف
- `imageUrl`: مطلوب، رابط صحيح
- `descriptionAr`: اختياري، أقل من 500 حرف
- `descriptionEn`: اختياري، أقل من 500 حرف
- `isActive`: اختياري، boolean
- `sortOrder`: اختياري، رقم صحيح ≥ 0

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "brand_id",
    "nameAr": "اسم العلامة التجارية بالعربية",
    "nameEn": "اسم العلامة التجارية بالإنجليزية",
    "descriptionAr": "وصف العلامة التجارية بالعربية",
    "descriptionEn": "وصف العلامة التجارية بالإنجليزية",
    "imageUrl": "https://example.com/image.jpg",
    "isActive": true,
    "sortOrder": 1,
    "productCount": 0,
    "createdBy": "admin_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم إنشاء العلامة التجارية بنجاح"
}
```

### 6. تحديث علامة تجارية (Admin)

```http
PUT /api/brands/:id
```

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Parameters:**

- `id`: معرف العلامة التجارية

**Request Body:**

```json
{
  "nameAr": "اسم العلامة التجارية المحدث بالعربية",
  "nameEn": "اسم العلامة التجارية المحدث بالإنجليزية",
  "descriptionAr": "وصف العلامة التجارية المحدث بالعربية",
  "descriptionEn": "وصف العلامة التجارية المحدث بالإنجليزية",
  "imageUrl": "https://example.com/new-image.jpg",
  "isActive": false,
  "sortOrder": 2
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "brand_id",
    "nameAr": "اسم العلامة التجارية المحدث بالعربية",
    "nameEn": "اسم العلامة التجارية المحدث بالإنجليزية",
    "descriptionAr": "وصف العلامة التجارية المحدث بالعربية",
    "descriptionEn": "وصف العلامة التجارية المحدث بالإنجليزية",
    "imageUrl": "https://example.com/new-image.jpg",
    "isActive": false,
    "sortOrder": 2,
    "productCount": 0,
    "createdBy": "admin_id",
    "updatedBy": "admin_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "تم تحديث العلامة التجارية بنجاح"
}
```

### 7. حذف علامة تجارية (Admin)

```http
DELETE /api/brands/:id
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Parameters:**

- `id`: معرف العلامة التجارية

**Response:**

```json
{
  "success": true,
  "message": "تم حذف العلامة التجارية بنجاح"
}
```

### 8. تفعيل/إلغاء تفعيل علامة تجارية (Admin)

```http
PATCH /api/brands/:id/toggle
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Parameters:**

- `id`: معرف العلامة التجارية

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "brand_id",
    "nameAr": "اسم العلامة التجارية بالعربية",
    "nameEn": "اسم العلامة التجارية بالإنجليزية",
    "isActive": false,
    "updatedBy": "admin_id",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "تم إلغاء تفعيل العلامة التجارية بنجاح"
}
```

### 9. إعادة ترتيب العلامات التجارية (Admin)

```http
PATCH /api/brands/reorder
```

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "brandOrders": [
    {
      "brandId": "brand_id_1",
      "sortOrder": 1
    },
    {
      "brandId": "brand_id_2",
      "sortOrder": 2
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "تم إعادة ترتيب العلامات التجارية بنجاح"
}
```

### 10. رفع صورة العلامة التجارية (Admin)

```http
POST /api/brands/upload
```

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body:**

- `image`: ملف الصورة (PNG, JPG, JPEG, GIF)

**Response:**

```json
{
  "success": true,
  "message": "تم رفع صورة العلامة التجارية بنجاح",
  "data": {
    "imageUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/brands/brand_image.jpg",
    "publicId": "brands/brand_image",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "size": 123456
  }
}
```

### 11. حذف صورة العلامة التجارية (Admin)

```http
DELETE /api/brands/image/:publicId
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Parameters:**

- `publicId`: معرف الصورة في Cloudinary

**Response:**

```json
{
  "success": true,
  "message": "تم حذف الصورة بنجاح",
  "data": {
    "publicId": "brands/brand_image",
    "result": "ok"
  }
}
```

### 12. إنشاء علامة تجارية مع رفع صورة (Admin)

```http
POST /api/brands/create-with-image
```

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body:**

- `nameAr`: اسم العلامة التجارية بالعربية
- `nameEn`: اسم العلامة التجارية بالإنجليزية
- `descriptionAr`: وصف العلامة التجارية بالعربية (اختياري)
- `descriptionEn`: وصف العلامة التجارية بالإنجليزية (اختياري)
- `isActive`: حالة النشاط (اختياري، افتراضي: true)
- `sortOrder`: ترتيب العلامة التجارية (اختياري، افتراضي: 0)
- `image`: ملف الصورة (مطلوب)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "brand_id",
    "nameAr": "اسم العلامة التجارية بالعربية",
    "nameEn": "اسم العلامة التجارية بالإنجليزية",
    "descriptionAr": "وصف العلامة التجارية بالعربية",
    "descriptionEn": "وصف العلامة التجارية بالإنجليزية",
    "imageUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/brands/brand_image.jpg",
    "isActive": true,
    "sortOrder": 1,
    "productCount": 0,
    "createdBy": "admin_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم إنشاء العلامة التجارية مع الصورة بنجاح"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "بيانات غير صحيحة",
  "errors": [
    {
      "field": "nameAr",
      "message": "اسم العلامة التجارية بالعربية مطلوب"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "غير مصرح لك بالوصول"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "العلامة التجارية غير موجودة"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "يوجد علامة تجارية بنفس الاسم بالفعل"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "حدث خطأ في جلب العلامات التجارية",
  "error": "Error details (في بيئة التطوير فقط)"
}
```

## Caching

جميع العمليات تدعم التخزين المؤقت (Caching) لتحسين الأداء:

- البيانات تُحفظ في الكاش لمدة 30 دقيقة
- البيانات النشطة تُحفظ لمدة ساعة
- يتم مسح الكاش تلقائياً عند التحديث

## Rate Limiting

- المستخدمون العاديون: 1000 طلب كل 15 دقيقة
- المستخدمون المصادق عليهم: 10000 طلب كل 15 دقيقة
