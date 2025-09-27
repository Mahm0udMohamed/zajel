# دليل إعداد reCAPTCHA لحل مشكلة إنشاء الحساب

## المشكلة المكتشفة

عند محاولة إنشاء حساب جديد، يظهر الخطأ: "خطأ في إنشاء الحساب - CAPTCHA verification failed."

## السبب

مفاتيح reCAPTCHA غير مُعرّفة في متغيرات البيئة.

## الحل

### 1. إنشاء ملف .env في مجلد back-end

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/zajel

# JWT Configuration
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=https://localhost:5173

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_VERIFY_URL=https://www.google.com/recaptcha/api/siteverify

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3002
NODE_ENV=development
```

### 2. إنشاء ملف .env في مجلد Front-end

```bash
# reCAPTCHA Configuration
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# API Configuration
VITE_API_BASE_URL=https://localhost:3002/api

# App Configuration
VITE_APP_NAME=Zajel
VITE_APP_VERSION=1.0.0
```

### 3. الحصول على مفاتيح reCAPTCHA

1. اذهب إلى [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. سجل دخولك بحساب Google
3. اضغط على "Create" لإنشاء موقع جديد
4. اختر reCAPTCHA v3
5. أدخل اسم الموقع (مثل: Zajel App)
6. أدخل النطاق (مثل: localhost)
7. احفظ المفاتيح:
   - **Site Key**: ضعه في `VITE_RECAPTCHA_SITE_KEY`
   - **Secret Key**: ضعه في `RECAPTCHA_SECRET_KEY`

### 4. إعادة تشغيل الخوادم

```bash
# Back-end
cd back-end
npm start

# Front-end
cd Front-end
npm run dev
```

## ملاحظات مهمة

1. **تأكد من صحة المفاتيح**: المفاتيح يجب أن تكون صحيحة ومطابقة للموقع
2. **النطاق**: تأكد من إضافة `localhost` في قائمة النطاقات المسموحة
3. **البيئة**: في الإنتاج، استخدم مفاتيح منفصلة للإنتاج
4. **الأمان**: لا تشارك المفاتيح السرية مع أحد

## اختبار الحل

بعد إعداد المفاتيح:

1. أعد تشغيل الخوادم
2. اذهب إلى صفحة إنشاء الحساب
3. حاول إنشاء حساب جديد
4. يجب أن يعمل التحقق من CAPTCHA بنجاح

## استكشاف الأخطاء

إذا استمرت المشكلة:

1. تحقق من console في المتصفح للأخطاء
2. تحقق من logs الخادم
3. تأكد من أن المفاتيح صحيحة
4. تأكد من أن النطاق مُضاف في reCAPTCHA console
