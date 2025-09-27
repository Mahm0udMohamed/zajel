# Environment Setup - إعداد متغيرات البيئة

## نظرة عامة

تم إعداد متغيرات البيئة بالطريقة الصحيحة والمعترف بها في Vite.

## الملفات المُنشأة

### 1. ملف `.env`

```env
VITE_API_URL=https://localhost:3002/api
```

### 2. ملف `.env.example`

```env
VITE_API_URL=https://localhost:3002/api
```

### 3. تحديث `vite.config.ts`

```typescript
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    envPrefix: "VITE_",
    define: {
      __API_URL__: JSON.stringify(
        env.VITE_API_URL || "https://localhost:3002/api"
      ),
    },
  };
});
```

## كيفية العمل

### 1. تحميل متغيرات البيئة

```typescript
// Vite يحمل تلقائياً متغيرات البيئة من ملف .env
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://localhost:3002/api";
```

### 2. البادئة `VITE_`

- Vite يحمل فقط المتغيرات التي تبدأ بـ `VITE_`
- هذا يضمن الأمان ويمنع تسريب متغيرات حساسة

### 3. القيم الافتراضية

- إذا لم يتم العثور على المتغير، يتم استخدام القيمة الافتراضية
- هذا يضمن عمل التطبيق حتى بدون ملف `.env`

## البيئات المختلفة

### التطوير (Development)

```env
# .env.development
VITE_API_URL=https://localhost:3002/api
```

### الإنتاج (Production)

```env
# .env.production
VITE_API_URL=https://api.yourapp.com/api
```

### الاختبار (Test)

```env
# .env.test
VITE_API_URL=https://test-api.yourapp.com/api
```

## الأمان

### ✅ آمن

```env
VITE_API_URL=https://localhost:3002/api
VITE_APP_NAME=Admin Panel
```

### ❌ غير آمن (لن يتم تحميله)

```env
API_SECRET_KEY=secret123
DATABASE_PASSWORD=password
ADMIN_TOKEN=token123
```

## الاستخدام

### 1. في الكود

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

### 2. في HTML

```html
<script>
  console.log(import.meta.env.VITE_API_URL);
</script>
```

## التطوير

### 1. إضافة متغير جديد

```env
# .env
VITE_API_URL=https://localhost:3002/api
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
```

### 2. استخدام المتغير

```typescript
const version = import.meta.env.VITE_APP_VERSION;
const debugMode = import.meta.env.VITE_DEBUG_MODE === "true";
```

## استكشاف الأخطاء

### 1. المتغير غير محمل

- تأكد من أن المتغير يبدأ بـ `VITE_`
- تأكد من وجود ملف `.env` في المجلد الصحيح
- أعد تشغيل خادم التطوير

### 2. القيمة غير صحيحة

- تحقق من تنسيق الملف `.env`
- تأكد من عدم وجود مسافات إضافية
- تحقق من الاقتباسات

### 3. الملف غير موجود

- أنشئ ملف `.env` من `.env.example`
- تأكد من أن الملف في المجلد الصحيح

## أفضل الممارسات

1. **استخدم `.env.example`** كقالب
2. **لا تضع ملف `.env` في Git** (أضفه إلى `.gitignore`)
3. **استخدم أسماء واضحة** للمتغيرات
4. **ضع قيم افتراضية** آمنة
5. **وثق المتغيرات** في README

## مثال كامل

### `.env`

```env
VITE_API_URL=https://localhost:3002/api
VITE_APP_NAME=Admin Panel
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
```

### `vite.config.ts`

```typescript
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
    },
  };
});
```

### `api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL;
const APP_NAME = import.meta.env.VITE_APP_NAME;
const APP_VERSION = import.meta.env.VITE_APP_VERSION;
```

---

**ملاحظة**: هذا الإعداد يتبع أفضل الممارسات في Vite ويضمن الأمان والمرونة في إدارة متغيرات البيئة.
