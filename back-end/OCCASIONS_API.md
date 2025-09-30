# Occasions API Documentation

## Overview

This API provides endpoints for managing occasions in the application. Occasions can be seasonal (with start and end dates) or permanent, and support both Arabic and English languages.

## Base URL

```
/api/occasions
```

## Authentication

- Public endpoints: No authentication required
- Admin endpoints: Requires admin authentication via `authenticateAdmin` middleware

## Data Models

### Occasion Schema

```javascript
{
  _id: ObjectId,
  nameAr: String (required, 2-100 chars),
  nameEn: String (required, 2-100 chars),
  descriptionAr: String (optional, max 500 chars),
  descriptionEn: String (optional, max 500 chars),
  imageUrl: String (required, valid URL),
  isActive: Boolean (default: true),
  sortOrder: Number (default: 0, min: 0),
  createdBy: ObjectId (ref: Admin),
  updatedBy: ObjectId (ref: Admin),
  productCount: Number (default: 0),
  metaTitleAr: String (optional, max 60 chars),
  metaTitleEn: String (optional, max 60 chars),
  metaDescriptionAr: String (optional, max 160 chars),
  metaDescriptionEn: String (optional, max 160 chars),
  showInHomePage: Boolean (default: true),
  showInNavigation: Boolean (default: true),
  slug: String (required, unique, lowercase, alphanumeric with hyphens),
  occasionType: String (enum: ["seasonal", "permanent", "special"], default: "permanent"),
  startDate: Date (required for seasonal occasions),
  endDate: Date (required for seasonal occasions),
  celebratoryMessageAr: String (optional, max 200 chars),
  celebratoryMessageEn: String (optional, max 200 chars),
  createdAt: Date,
  updatedAt: Date
}
```

## Endpoints

### 1. Get All Occasions

**GET** `/api/occasions`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `isActive` (optional): Filter by active status (true/false)
- `language` (optional): Language preference (ar/en, default: ar)
- `search` (optional): Search term
- `sortBy` (optional): Sort field (default: sortOrder)
- `sortOrder` (optional): Sort direction (asc/desc, default: asc)
- `showInHomePage` (optional): Filter by home page visibility (true/false)
- `showInNavigation` (optional): Filter by navigation visibility (true/false)
- `occasionType` (optional): Filter by occasion type (seasonal/permanent/special)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "اسم المناسبة",
      "nameAr": "اسم المناسبة بالعربية",
      "nameEn": "Occasion Name in English",
      "description": "وصف المناسبة",
      "imageUrl": "https://example.com/image.jpg",
      "isActive": true,
      "sortOrder": 1,
      "productCount": 15,
      "showInHomePage": true,
      "showInNavigation": true,
      "slug": "occasion-slug",
      "occasionType": "permanent",
      "startDate": null,
      "endDate": null,
      "celebratoryMessage": "رسالة احتفالية",
      "isCurrentlyActive": true,
      "createdBy": { "name": "Admin Name", "email": "admin@example.com" },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "تم جلب المناسبات بنجاح"
}
```

### 2. Get Occasion by ID

**GET** `/api/occasions/:id`

**Parameters:**

- `id`: Occasion ID (MongoDB ObjectId)

**Query Parameters:**

- `language` (optional): Language preference (ar/en, default: ar)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "name": "اسم المناسبة",
    "nameAr": "اسم المناسبة بالعربية",
    "nameEn": "Occasion Name in English",
    "description": "وصف المناسبة",
    "imageUrl": "https://example.com/image.jpg",
    "isActive": true,
    "sortOrder": 1,
    "productCount": 15,
    "showInHomePage": true,
    "showInNavigation": true,
    "slug": "occasion-slug",
    "occasionType": "seasonal",
    "startDate": "2024-02-14T00:00:00.000Z",
    "endDate": "2024-02-14T23:59:59.000Z",
    "celebratoryMessage": "رسالة احتفالية",
    "isCurrentlyActive": true,
    "createdBy": { "name": "Admin Name", "email": "admin@example.com" },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم جلب المناسبة بنجاح"
}
```

### 3. Get Occasion by Slug

**GET** `/api/occasions/slug/:slug`

**Parameters:**

- `slug`: Occasion slug (e.g., "valentines-day")

**Query Parameters:**

- `language` (optional): Language preference (ar/en, default: ar)

**Response:** Same as Get Occasion by ID

### 4. Get Active Occasions

**GET** `/api/occasions/active`

**Query Parameters:**

- `language` (optional): Language preference (ar/en, default: ar)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "اسم المناسبة",
      "description": "وصف المناسبة",
      "imageUrl": "https://example.com/image.jpg",
      "sortOrder": 1,
      "slug": "occasion-slug",
      "occasionType": "permanent",
      "celebratoryMessage": "رسالة احتفالية"
    }
  ],
  "message": "تم جلب المناسبات النشطة بنجاح"
}
```

### 5. Get Current Seasonal Occasions

**GET** `/api/occasions/current-seasonal`

**Query Parameters:**

- `language` (optional): Language preference (ar/en, default: ar)

**Response:** Same as Get Active Occasions (only seasonal occasions active now)

### 6. Get Upcoming Occasions

**GET** `/api/occasions/upcoming`

**Query Parameters:**

- `language` (optional): Language preference (ar/en, default: ar)
- `limit` (optional): Maximum number of occasions (default: 5)

**Response:** Same as Get Active Occasions (only upcoming seasonal occasions)

### 7. Search Occasions

**GET** `/api/occasions/search`

**Query Parameters:**

- `q` (required): Search query (minimum 2 characters)
- `language` (optional): Language preference (ar/en, default: ar)
- `limit` (optional): Maximum results (default: 10, max: 100)
- `page` (optional): Page number (default: 1)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "اسم المناسبة",
      "description": "وصف المناسبة",
      "imageUrl": "https://example.com/image.jpg",
      "slug": "occasion-slug",
      "occasionType": "permanent"
    }
  ],
  "message": "تم البحث في المناسبات بنجاح"
}
```

## Admin Endpoints

### 8. Create Occasion

**POST** `/api/occasions`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "nameAr": "اسم المناسبة بالعربية",
  "nameEn": "Occasion Name in English",
  "descriptionAr": "وصف المناسبة بالعربية",
  "descriptionEn": "Occasion description in English",
  "imageUrl": "https://example.com/image.jpg",
  "slug": "occasion-slug",
  "isActive": true,
  "sortOrder": 1,
  "showInHomePage": true,
  "showInNavigation": true,
  "metaTitleAr": "عنوان SEO بالعربية",
  "metaTitleEn": "SEO Title in English",
  "metaDescriptionAr": "وصف SEO بالعربية",
  "metaDescriptionEn": "SEO Description in English",
  "occasionType": "permanent",
  "startDate": "2024-02-14T00:00:00.000Z",
  "endDate": "2024-02-14T23:59:59.000Z",
  "celebratoryMessageAr": "رسالة احتفالية بالعربية",
  "celebratoryMessageEn": "Celebratory message in English"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "nameAr": "اسم المناسبة بالعربية",
    "nameEn": "Occasion Name in English",
    "slug": "occasion-slug",
    "createdBy": "ObjectId",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم إنشاء المناسبة بنجاح"
}
```

### 9. Update Occasion

**PUT** `/api/occasions/:id`

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Occasion ID (MongoDB ObjectId)

**Request Body:** Same as Create Occasion (all fields optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "nameAr": "اسم المناسبة المحدث",
    "nameEn": "Updated Occasion Name",
    "updatedBy": "ObjectId",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم تحديث المناسبة بنجاح"
}
```

### 10. Delete Occasion

**DELETE** `/api/occasions/:id`

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Occasion ID (MongoDB ObjectId)

**Response:**

```json
{
  "success": true,
  "message": "تم حذف المناسبة بنجاح"
}
```

### 11. Toggle Occasion Status

**PATCH** `/api/occasions/:id/toggle`

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Occasion ID (MongoDB ObjectId)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "isActive": false,
    "updatedBy": "ObjectId",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "تم إلغاء تفعيل المناسبة بنجاح"
}
```

### 12. Reorder Occasions

**PATCH** `/api/occasions/reorder`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "occasionOrders": [
    {
      "occasionId": "ObjectId",
      "sortOrder": 1
    },
    {
      "occasionId": "ObjectId",
      "sortOrder": 2
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "تم إعادة ترتيب المناسبات بنجاح"
}
```

## Image Management

### 13. Upload Occasion Image

**POST** `/api/occasions/upload`

**Authentication:** Required (Admin)

**Request:** Multipart form data with `image` field

**Response:**

```json
{
  "success": true,
  "message": "تم رفع صورة المناسبة بنجاح",
  "data": {
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "occasions/image_id",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "size": 123456
  }
}
```

### 14. Delete Occasion Image

**DELETE** `/api/occasions/image/:publicId`

**Authentication:** Required (Admin)

**Parameters:**

- `publicId`: Cloudinary public ID

**Response:**

```json
{
  "success": true,
  "message": "تم حذف الصورة بنجاح",
  "data": {
    "publicId": "occasions/image_id",
    "result": "ok"
  }
}
```

### 15. Create Occasion with Image

**POST** `/api/occasions/create-with-image`

**Authentication:** Required (Admin)

**Request:** Multipart form data with `image` field and occasion data

**Response:** Same as Create Occasion

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "بيانات غير صحيحة",
  "errors": [
    {
      "field": "nameAr",
      "message": "اسم المناسبة بالعربية مطلوب"
    }
  ]
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "المناسبة غير موجودة"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "يوجد مناسبة بنفس الاسم أو المعرف بالفعل"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "حدث خطأ في جلب المناسبات",
  "error": "Error details (development only)"
}
```

## Caching

All endpoints support caching with the following TTL:

- General endpoints: 30 minutes
- Active occasions: 1 hour
- Individual occasions: 1 hour
- Search results: 30 minutes

Cache is automatically cleared when:

- Creating new occasions
- Updating existing occasions
- Deleting occasions
- Reordering occasions
- Uploading/deleting images

## Rate Limiting

- Public endpoints: 1000 requests per 15 minutes
- Authenticated endpoints: 10000 requests per 15 minutes

## Validation Rules

### Required Fields

- `nameAr`: 2-100 characters
- `nameEn`: 2-100 characters
- `imageUrl`: Valid URL
- `slug`: Alphanumeric with hyphens, unique

### Optional Fields

- `descriptionAr/En`: Max 500 characters
- `metaTitleAr/En`: Max 60 characters
- `metaDescriptionAr/En`: Max 160 characters
- `celebratoryMessageAr/En`: Max 200 characters
- `sortOrder`: Integer >= 0
- `startDate/endDate`: ISO 8601 date format (required for seasonal occasions)

### Occasion Types

- `permanent`: Always active (default)
- `seasonal`: Active between start and end dates
- `special`: Special occasions with custom logic

## Examples

### Creating a Valentine's Day Occasion

```bash
curl -X POST /api/occasions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "nameAr": "عيد الحب",
    "nameEn": "Valentine'\''s Day",
    "descriptionAr": "مناسبة رومانسية للاحتفال بالحب",
    "descriptionEn": "Romantic occasion to celebrate love",
    "imageUrl": "https://example.com/valentines.jpg",
    "slug": "valentines-day",
    "occasionType": "seasonal",
    "startDate": "2024-02-14T00:00:00.000Z",
    "endDate": "2024-02-14T23:59:59.000Z",
    "celebratoryMessageAr": "احتفل بحبك مع هدايا مميزة",
    "celebratoryMessageEn": "Celebrate your love with special gifts"
  }'
```

### Getting Active Occasions

```bash
curl -X GET "/api/occasions/active?language=ar"
```

### Searching Occasions

```bash
curl -X GET "/api/occasions/search?q=عيد&language=ar&limit=5"
```
