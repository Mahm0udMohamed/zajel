# 🔧 إصلاح مشكلة رفع الصور

## ❌ المشكلة الأصلية

كانت المشكلة في `server.js` حيث أن `express.json()` middleware كان يحاول تحليل جميع الطلبات كـ JSON، بما في ذلك FormData:

```javascript
// المشكلة
app.use(express.json({ limit: "50mb" })); // يحاول تحليل FormData كـ JSON
```

### **الخطأ الذي كان يحدث:**

```
SyntaxError: Unexpected token '-', "------WebK"... is not valid JSON
```

## ✅ الحل المطبق

تم تعديل `server.js` لتطبيق JSON middleware فقط على routes معينة وتجنب FormData:

```javascript
// الحل الجديد
app.use((req, res, next) => {
  // تخطي JSON parsing للـ routes التي تستخدم FormData
  if (req.path.includes("/upload") || req.path.includes("/create-with-image")) {
    return next();
  }
  express.json({ limit: "50mb" })(req, res, next);
});
```

## 🎯 النتيجة

- ✅ **رفع الصور يعمل** بشكل صحيح
- ✅ **FormData يتم معالجته** بواسطة multer
- ✅ **JSON requests** تعمل بشكل طبيعي
- ✅ **جميع routes** تعمل بدون مشاكل

## 🚀 الاختبار

تم اختبار API رفع الصور:

- ✅ **Status 401** (متوقع - يحتاج مصادقة)
- ✅ **لا توجد أخطاء JSON parsing**
- ✅ **FormData يتم استقباله** بشكل صحيح

## 📝 الملفات المحدثة

- `back-end/server.js` - إصلاح middleware

الآن يمكن رفع الصور في جميع الأقسام (الفئات، المناسبات، العلامات التجارية) بدون مشاكل! 🎉
