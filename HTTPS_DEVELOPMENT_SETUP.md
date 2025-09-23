# تعليمات تشغيل التطبيق مع HTTPS للتطوير المحلي

## المتطلبات

- Node.js
- MongoDB
- Redis (اختياري)

## خطوات التشغيل

### 1. تشغيل السيرفر (Backend)

```bash
cd back-end
npm install
npm run dev
```

السيرفر سيعمل على: https://localhost:3002

### 2. تشغيل الفرونت إند (Frontend)

```bash
npm install
npm run dev
```

الفرونت إند سيعمل على: https://localhost:5173

## ملاحظات مهمة

### شهادات SSL

- تم إنشاء شهادات SSL للتطوير المحلي في مجلد `ssl/`
- المتصفح قد يظهر تحذير أمان - اضغط "Advanced" ثم "Proceed to localhost"
- الشهادات صالحة لـ localhost و 127.0.0.1

### متغيرات البيئة

تأكد من إنشاء ملف `.env` في مجلد `back-end/` مع المتغيرات التالية:

```
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://localhost:27017/appzajel_dev
SESSION_SECRET=your-development-session-secret-key
JWT_SECRET=your-development-jwt-secret-key
# ... باقي المتغيرات حسب الحاجة
```

### CORS

تم تحديث إعدادات CORS لتشمل:

- https://localhost:3002 (السيرفر)
- https://localhost:5173 (الفرونت إند)

### الجلسات

- تم تحديث إعدادات الجلسة لدعم HTTPS
- في الإنتاج: secure: true
- في التطوير: secure: false (لأن الشهادات محلية)

## استكشاف الأخطاء

### مشكلة "Certificate not trusted"

1. افتح المتصفح
2. اذهب إلى https://localhost:3002 أو https://localhost:5173
3. اضغط "Advanced" أو "Advanced Settings"
4. اضغط "Proceed to localhost (unsafe)" أو "Continue to this website"

### مشكلة الاتصال بين الفرونت والسيرفر

تأكد من أن:

1. السيرفر يعمل على https://localhost:3002
2. الفرونت إند يعمل على https://localhost:5173
3. متغيرات البيئة صحيحة
4. قاعدة البيانات MongoDB تعمل

## الإنتاج

هذه الإعدادات للتطوير المحلي فقط. في الإنتاج:

- استخدم شهادات SSL صالحة من مزود موثوق
- اضبط NODE_ENV=production
- استخدم متغيرات البيئة الآمنة
