# 🖼️ Categories Image Upload API

## 📋 نظرة عامة

نظام بسيط لرفع وإدارة صورة الفئة الواحدة مع دعم Cloudinary.

## 🚀 المميزات

- ✅ رفع صورة واحدة للفئة
- ✅ إنشاء فئة مع رفع صورة في نفس الوقت
- ✅ حذف الصور من Cloudinary
- ✅ تحسين تلقائي للصور (800x600)
- ✅ حد أقصى 5MB للصورة

## 🔗 المسارات

### 1. رفع صورة واحدة

**POST** `/api/categories/upload`

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body:**

```
image: [file] (required)
```

**Response:**

```json
{
  "success": true,
  "message": "تم رفع صورة الفئة بنجاح",
  "data": {
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "categories/xyz123",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "size": 245760
  }
}
```

### 2. إنشاء فئة مع صورة

**POST** `/api/categories/create-with-image`

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body:**

```
image: [file] (required)
nameAr: "اسم الفئة بالعربية" (required)
nameEn: "Category Name in English" (required)
descriptionAr: "وصف الفئة بالعربية" (optional)
descriptionEn: "Category description in English" (optional)
isActive: true (optional, default: true)
sortOrder: 0 (optional, default: 0)
showInHomePage: true (optional, default: true)
showInNavigation: true (optional, default: true)
metaTitleAr: "عنوان SEO بالعربية" (optional)
metaTitleEn: "SEO title in English" (optional)
metaDescriptionAr: "وصف SEO بالعربية" (optional)
metaDescriptionEn: "SEO description in English" (optional)
```

### 3. حذف صورة

**DELETE** `/api/categories/image/:publicId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

## 📝 مثال الاستخدام

```javascript
// رفع صورة واحدة
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/categories/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
  });

  return await response.json();
};

// إنشاء فئة مع صورة
const createCategoryWithImage = async (categoryData, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  Object.keys(categoryData).forEach((key) => {
    formData.append(key, categoryData[key]);
  });

  const response = await fetch("/api/categories/create-with-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
  });

  return await response.json();
};
```

## ⚠️ حدود النظام

- **حجم الملف:** 5MB كحد أقصى
- **أنواع الملفات:** الصور فقط
- **المصادقة:** مطلوبة لجميع العمليات

---

**نظام بسيط ومباشر** - آخر تحديث: 2024-01-15
