# 🚀 Cache Layer/Service System - نظام الكاش الموحد

## 📋 نظرة عامة

تم تطوير نظام Cache Layer/Service موحد لإدارة الكاش في التطبيق. يوفر هذا النظام واجهة موحدة وسهلة الاستخدام لجميع عمليات الكاش مع دعم متقدم للميزات.

## 🏗️ الهيكل

```
back-end/
├── config/
│   └── cacheConfig.js              # إعدادات الكاش الموحدة
├── services/
│   └── cache/
│       ├── CacheLayer.js           # الطبقة الرئيسية للكاش
│       ├── CacheMiddleware.js      # Middleware للكاش التلقائي
│       ├── CacheDecorators.js     # ديكوراتورات محسنة
│       └── index.js               # ملف التصدير
├── routes/
│   └── cacheRoutes.js             # مسارات إدارة الكاش
└── utils/
    └── cacheUtils.js              # أدوات مساعدة
```

## 🎯 الميزات الرئيسية

### 1. **Cache Layer الرئيسي**

- واجهة موحدة لجميع عمليات الكاش
- بناء مفاتيح الكاش تلقائياً
- إدارة الاستراتيجيات المختلفة
- مراقبة الصحة والإحصائيات

### 2. **استراتيجيات الكاش المحددة**

- `hero-occasions`: مناسبات الهيرو العامة
- `hero-occasions-active`: المناسبات النشطة
- `hero-occasions-upcoming`: المناسبات القادمة
- `user-tokens`: توكنات المستخدمين
- `user-data`: بيانات المستخدمين
- `products`: بيانات المنتجات (للمستقبل)
- `orders`: بيانات الطلبات (للمستقبل)
- `cart`: سلة التسوق (للمستقبل)
- `favorites`: قائمة المفضلة (للمستقبل)
- `analytics`: بيانات الإحصائيات
- `config`: إعدادات التطبيق

### 3. **Cache Middleware**

- تطبيق الكاش تلقائياً على المسارات
- دعم المعاملات المخصصة
- كاش مشروط
- TTL ديناميكي

### 4. **Cache Decorators**

- `@cacheable`: كاش تلقائي للدوال
- `@cacheInvalidate`: مسح الكاش عند التحديث
- `@cacheWhen`: كاش مشروط
- `@cacheWithDynamicTTL`: كاش مع TTL ديناميكي
- `@cacheWithBackgroundRefresh`: تحديث في الخلفية
- `@cacheWithRetry`: كاش مع إعادة المحاولة
- `@cacheWithCompression`: كاش مع ضغط

## 🚀 الاستخدام

### 1. **الاستخدام الأساسي**

```javascript
import { cacheLayer } from "./services/cache/index.js";

// الحصول من الكاش
const data = await cacheLayer.get("hero-occasions", "all", {
  page: 1,
  limit: 10,
});

// حفظ في الكاش
await cacheLayer.set(
  "hero-occasions",
  "all",
  data,
  {
    page: 1,
    limit: 10,
  },
  { ttl: 3600 }
);

// مسح الكاش
await cacheLayer.del("hero-occasions", "all", {
  page: 1,
  limit: 10,
});
```

### 2. **استخدام Middleware**

```javascript
import { cacheMiddleware } from "./services/cache/index.js";

// تطبيق كاش على مسار
app.get(
  "/api/hero-occasions",
  cacheMiddleware.create("hero-occasions", {
    keyParams: ["page", "limit"],
  }),
  getAllOccasions
);
```

### 3. **استخدام Decorators**

```javascript
import { cacheable, cacheInvalidate } from "./services/cache/index.js";

class HeroOccasionsController {
  @cacheable("hero-occasions", {
    keyParams: ["page", "limit"],
    ttl: 3600,
  })
  async getAllOccasions(page, limit) {
    // منطق الحصول على البيانات
  }

  @cacheInvalidate("hero-occasions", {
    keyParams: ["id"],
  })
  async updateOccasion(id, data) {
    // منطق التحديث
  }
}
```

## 🔧 الإعدادات

### 1. **إعدادات الاستراتيجيات**

```javascript
// config/cacheConfig.js
export const CACHE_CONFIG = {
  strategies: {
    "hero-occasions": {
      ttl: 3600, // ساعة واحدة
      compression: true,
      invalidationStrategy: "immediate",
      keyPattern: "hero-occasions:{operation}:{params}",
      description: "مناسبات الهيرو",
    },
  },
};
```

### 2. **إعدادات Redis**

```javascript
redis: {
  maxRetries: 3,
  retryDelay: 1000,
  commandTimeout: 10000,
  connectionTimeout: 10000,
  enableOfflineQueue: false,
  keepAlive: 30000,
}
```

## 📊 مراقبة الكاش

### 1. **إحصائيات الكاش**

```javascript
// الحصول على الإحصائيات
const stats = cacheLayer.getStats();

// إحصائيات شاملة
const comprehensiveStats = await cacheUtils.getComprehensiveStats();
```

### 2. **صحة الكاش**

```javascript
// فحص الصحة
const health = await cacheLayer.getHealth();

// فحص شامل
const healthCheck = await cacheUtils.checkCacheHealth();
```

## 🛠️ إدارة الكاش

### 1. **مسح الكاش**

```javascript
// مسح استراتيجية محددة
await cacheLayer.clear("hero-occasions", "*");

// مسح جميع الكاش
await cacheUtils.clearAllCache();

// مسح حسب المعاملات
await cacheUtils.clearCacheByParams("hero-occasions", "all", {
  page: 1,
  limit: 10,
});
```

### 2. **تنظيف الكاش**

```javascript
// تنظيف الكاش القديم
await cacheUtils.cleanupOldCache({
  maxAge: 24 * 60 * 60, // 24 ساعة
  dryRun: false,
});
```

## 🔌 API Endpoints

### 1. **إحصائيات الكاش**

- `GET /api/cache/stats` - إحصائيات شاملة
- `GET /api/cache/stats/simple` - إحصائيات بسيطة

### 2. **صحة الكاش**

- `GET /api/cache/health` - فحص الصحة
- `GET /api/cache/test` - اختبار الاتصال

### 3. **إدارة الكاش**

- `DELETE /api/cache/clear` - مسح جميع الكاش
- `DELETE /api/cache/clear/:strategy` - مسح استراتيجية محددة
- `DELETE /api/cache/invalidate/:strategy/:operation` - مسح حسب المعاملات

### 4. **معلومات الكاش**

- `GET /api/cache/keys` - الحصول على المفاتيح
- `GET /api/cache/size` - حجم الكاش
- `GET /api/cache/exists/:key` - فحص وجود مفتاح
- `GET /api/cache/ttl/:key` - TTL لمفتاح

### 5. **إدارة الاستراتيجيات**

- `GET /api/cache/strategies` - جميع الاستراتيجيات
- `POST /api/cache/strategies` - تسجيل استراتيجية جديدة

## 🎯 أفضل الممارسات

### 1. **اختيار الاستراتيجية المناسبة**

- استخدم استراتيجيات محددة لكل نوع بيانات
- اضبط TTL حسب طبيعة البيانات
- استخدم compression للبيانات الكبيرة

### 2. **إدارة الكاش**

- مسح الكاش عند التحديث
- استخدم invalidation strategies مناسبة
- راقب إحصائيات الكاش بانتظام

### 3. **الأداء**

- استخدم middleware للكاش التلقائي
- استخدم decorators للدوال المعقدة
- راقب hit rate وعدل TTL حسب الحاجة

## 🔍 استكشاف الأخطاء

### 1. **فحص الاتصال**

```javascript
const testResult = await cacheLayer.cacheService.testConnection();
console.log("Redis connection:", testResult);
```

### 2. **فحص المفاتيح**

```javascript
const keys = await cacheUtils.getCacheKeys("hero-occasions:*");
console.log("Cache keys:", keys);
```

### 3. **فحص TTL**

```javascript
const ttl = await cacheUtils.getKeyTTL("hero-occasions:all:1:10");
console.log("Key TTL:", ttl);
```

## 📈 المراقبة والتطوير

### 1. **إحصائيات مفصلة**

- Hit Rate
- Miss Rate
- Error Rate
- Total Operations
- Uptime

### 2. **توصيات تلقائية**

- تحسين TTL
- تحسين استراتيجيات الكاش
- فحص اتصال Redis
- إعادة تشغيل دورية

## 🚀 التطوير المستقبلي

### 1. **ميزات مخططة**

- Cache warming
- Distributed caching
- Cache analytics dashboard
- Automatic cache optimization

### 2. **تحسينات الأداء**

- Connection pooling
- Batch operations
- Compression algorithms
- Memory optimization

---

## 📞 الدعم

للمساعدة أو الاستفسارات حول نظام الكاش، يرجى التواصل مع فريق التطوير.

---

**تم تطوير هذا النظام بواسطة فريق AppZajel V3** 🚀
