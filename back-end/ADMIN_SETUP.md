# إعداد نظام المدير - لوحة التحكم

## نظرة عامة

تم إنشاء نظام مصادقة آمن للمدير في لوحة التحكم باستخدام JWT tokens وحماية متقدمة.

## الملفات المضافة

### 1. موديل المدير

- `models/Admin.js` - موديل قاعدة البيانات للمدير مع تشفير كلمة المرور

### 2. Controller

- `controllers/adminController.js` - معالجة طلبات تسجيل الدخول والخروج

### 3. Middleware

- `middlewares/adminAuthMiddleware.js` - التحقق من صحة توكن المدير

### 4. Routes

- `routes/adminRoutes.js` - مسارات API للمدير

### 5. Scripts

- `scripts/createAdmin.js` - سكريبت لإنشاء المدير الأول

## إعداد النظام

### 1. إعداد متغيرات البيئة

أضف المتغيرات التالية إلى ملف `.env`:

```env
# Admin Credentials
ADMIN_EMAIL=admin@appzajel.com
ADMIN_PASSWORD=Admin123456
ADMIN_NAME=مدير النظام
```

### 2. إنشاء المدير الأول

```bash
npm run create-admin
```

### 3. تشغيل الخادم

```bash
npm run dev
```

## API Endpoints

### تسجيل الدخول

```
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@appzajel.com",
  "password": "Admin123456"
}
```

### تحديث التوكن

```
POST /api/admin/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### الحصول على معلومات المدير

```
GET /api/admin/profile
Authorization: Bearer your-access-token
```

### تسجيل الخروج

```
POST /api/admin/logout
Authorization: Bearer your-access-token
```

## ميزات الأمان

1. **تشفير كلمة المرور**: استخدام bcrypt مع salt rounds = 12
2. **JWT Tokens**: توكنات آمنة مع انتهاء صلاحية
3. **قفل الحساب**: قفل مؤقت بعد 5 محاولات فاشلة
4. **Rate Limiting**: حماية من هجمات Brute Force
5. **Validation**: التحقق من صحة البيانات المدخلة

## الاستخدام في Frontend

```javascript
// تسجيل الدخول
const loginResponse = await fetch("/api/admin/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@appzajel.com",
    password: "Admin123456",
  }),
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken } = data;

// استخدام التوكن في الطلبات
const profileResponse = await fetch("/api/admin/profile", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

## ملاحظات مهمة

1. تأكد من تحديث `allowedOrigins` في `server.js` لتشمل عنوان لوحة التحكم
2. استخدم HTTPS في الإنتاج
3. احتفظ بمعلومات المدير في مكان آمن
4. قم بتغيير كلمة المرور الافتراضية فوراً
