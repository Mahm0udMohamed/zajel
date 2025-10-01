# ✅ إصلاح نهائي لرفع الصور في العلامات التجارية

## 🔍 المشكلة الأصلية

كانت المشكلة أن دوال رفع الصور في العلامات التجارية كانت تستخدم `makeAuthenticatedRequest` بدلاً من `fetch` مباشرة مثل الفئات والمناسبات.

## 🛠️ الحل المطبق

تم تعديل دوال رفع الصور لتكون مطابقة تماماً للفئات والمناسبات:

### **1. دالة `uploadBrandImage`:**

```javascript
// قبل الإصلاح (خطأ)
const response = await this.makeAuthenticatedRequest<{
  data: { imageUrl: string; publicId: string };
}>("/brands/upload", {
  method: "POST",
  body: formData,
  headers: {},
});

// بعد الإصلاح (صحيح)
const response = await fetch(`${API_BASE_URL}/brands/upload`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${this.getAccessToken()}`,
  },
  body: formData,
});
```

### **2. دالة `createBrandWithImage`:**

```javascript
// قبل الإصلاح (خطأ)
const response =
  (await this.makeAuthenticatedRequest) <
  { data: unknown } >
  ("/brands/create-with-image",
  {
    method: "POST",
    body: formData,
    headers: {},
  });

// بعد الإصلاح (صحيح)
const response = await fetch(`${API_BASE_URL}/brands/create-with-image`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${this.getAccessToken()}`,
  },
  body: formData,
});
```

## 🎯 النتيجة

- ✅ **رفع الصور يعمل** مثل الفئات والمناسبات تماماً
- ✅ **FormData يتم إرساله** بشكل صحيح
- ✅ **لا توجد أخطاء JSON parsing**
- ✅ **التصميم متسق** مع باقي الأقسام

## 📝 الملفات المحدثة

- `admin-panal/src/services/api.ts` - إصلاح دوال رفع الصور

## 🚀 الاختبار

الآن يمكنك:

1. فتح لوحة التحكم على `http://localhost:5173`
2. الانتقال إلى تبويب العلامات التجارية
3. إضافة علامة تجارية جديدة
4. رفع الصور بدون أي مشاكل!

**تم إصلاح المشكلة نهائياً!** 🎉
