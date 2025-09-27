# Cache Service الموحد - دليل شامل

## 🎯 نظرة عامة

تم إنشاء نظام كاش موحد ومتقدم يوفر واجهة سهلة الاستخدام لإدارة الكاش عبر التطبيق بأكمله. النظام مصمم ليكون مرناً وقابلاً للتوسع وسهل الصيانة.

## 📁 هيكل الملفات

```
back-end/
├── services/
│   ├── cacheService.js          # الخدمة الأساسية للكاش
│   └── cacheManager.js          # مدير الكاش المتقدم
├── decorators/
│   └── cacheDecorators.js       # ديكوراتورات الكاش
├── controllers/
│   └── heroOccasionsControllerV2.js  # مثال على الاستخدام
├── examples/
│   └── cacheUsageExamples.js    # أمثلة شاملة للاستخدام
└── README_CACHE_SERVICE.md      # هذا الملف
```

## 🚀 الميزات الرئيسية

### 1. **Cache Service الأساسي**

- واجهة موحدة لجميع عمليات الكاش
- معالجة شاملة للأخطاء مع fallback
- إحصائيات مفصلة للأداء
- دعم الضغط والتحسين
- اختبار الاتصال التلقائي

### 2. **Cache Manager المتقدم**

- إدارة namespaces منظمة
- تسجيل controllers مع إعدادات مخصصة
- Cache invalidation ذكي
- إحصائيات شاملة
- تنظيف تلقائي للكاش القديم

### 3. **Cache Decorators**

- ديكوراتورات جاهزة للاستخدام
- كاش تلقائي مع `@cacheable`
- مسح الكاش مع `@cacheInvalidate`
- كاش مشروط مع `@cacheWhen`
- TTL ديناميكي مع `@cacheWithDynamicTTL`
- ضغط البيانات مع `@cacheWithCompression`

## 📖 دليل الاستخدام

### 1. الإعداد الأساسي

```javascript
import cacheManager from "./services/cacheManager.js";
import { cacheable, cacheInvalidate } from "./decorators/cacheDecorators.js";

// تسجيل namespace جديد
cacheManager.registerNamespace("products", {
  ttl: 3600, // ساعة واحدة
  compression: true, // تفعيل الضغط
  invalidationStrategy: "immediate",
  keyPrefix: "products",
});

// تسجيل controller
cacheManager.registerController("productController", {
  namespace: "products",
  ttl: 1800,
  compression: true,
  invalidationStrategy: "immediate",
  keyPatterns: {
    single: "single:{id}",
    list: "list:{page}:{limit}",
    search: "search:{query}:{category}",
  },
});
```

### 2. الاستخدام الأساسي

```javascript
class ProductController {
  // الحصول من الكاش
  async getProduct(productId) {
    const cached = await cacheManager.get("products", "single", {
      id: productId,
    });

    if (cached) {
      return cached;
    }

    // Cache MISS - الحصول من قاعدة البيانات
    const product = await this.fetchFromDB(productId);

    // حفظ في الكاش
    await cacheManager.set("products", "single", product, { id: productId });

    return product;
  }

  // مسح الكاش عند التحديث
  async updateProduct(productId, updateData) {
    const updated = await this.updateInDB(productId, updateData);

    // مسح الكاش المتعلق
    await cacheManager.invalidate("products", "immediate");

    return updated;
  }
}
```

### 3. استخدام Decorators

```javascript
class ProductController {
  // كاش تلقائي
  @cacheable({
    namespace: "products",
    operation: "single",
    ttl: 3600,
    keyParams: ["productId"],
  })
  async getProduct(productId) {
    return await this.fetchFromDB(productId);
  }

  // مسح الكاش عند التحديث
  @cacheInvalidate({
    namespace: "products",
    strategy: "immediate",
  })
  async createProduct(productData) {
    return await this.createInDB(productData);
  }

  // كاش مشروط
  @cacheWhen((productId) => productId && productId.length > 0, {
    namespace: "products",
    operation: "details",
    ttl: 1800,
    keyParams: ["productId"],
  })
  async getProductDetails(productId) {
    return await this.fetchDetailsFromDB(productId);
  }
}
```

### 4. Cache Middleware

```javascript
import { cacheMiddleware } from "./examples/cacheUsageExamples.js";

// تطبيق middleware على route
app.get(
  "/api/products/:id",
  cacheMiddleware({
    namespace: "products",
    operation: "single",
    ttl: 3600,
    keyParams: ["id"],
  }),
  productController.getProduct
);
```

## 🔧 API Reference

### Cache Service

#### `get(key, options)`

```javascript
const value = await cacheService.get("user:123", {
  parse: true,
  defaultValue: null,
  namespace: "users",
});
```

#### `set(key, value, options)`

```javascript
await cacheService.set("user:123", userData, {
  ttl: 3600,
  namespace: "users",
  compress: true,
  onlyIfNotExists: false,
});
```

#### `del(key, options)`

```javascript
await cacheService.del("user:123", {
  namespace: "users",
  pattern: false,
});
```

### Cache Manager

#### `registerNamespace(name, config)`

```javascript
cacheManager.registerNamespace("users", {
  ttl: 1800,
  compression: true,
  invalidationStrategy: "immediate",
  keyPrefix: "users",
});
```

#### `get(namespace, operation, params, options)`

```javascript
const cached = await cacheManager.get("users", "profile", { userId: 123 });
```

#### `set(namespace, operation, value, params, options)`

```javascript
await cacheManager.set(
  "users",
  "profile",
  userData,
  { userId: 123 },
  { ttl: 1800 }
);
```

#### `invalidate(namespace, strategy, options)`

```javascript
// مسح فوري
await cacheManager.invalidate("users", "immediate");

// مسح بنمط محدد
await cacheManager.invalidate("users", "pattern", { pattern: "profile:*" });

// مسح انتقائي
await cacheManager.invalidate("users", "selective", {
  operations: ["profile", "stats"],
});
```

## 📊 إدارة الكاش

### الحصول على الإحصائيات

```javascript
// إحصائيات شاملة
const stats = await cacheManager.getAllStats();

// إحصائيات namespace محدد
const userStats = await cacheManager.getNamespaceStats("users");

// إحصائيات الخدمة الأساسية
const serviceStats = cacheManager.cacheService.getStats();
```

### تنظيف الكاش

```javascript
// تنظيف الكاش القديم
const cleanupResult = await cacheManager.cleanup({
  maxAge: 24 * 60 * 60, // 24 ساعة
  dryRun: false,
  namespaces: ["users", "products"],
});

// مسح namespace محدد
const deletedKeys = await cacheManager.clearNamespace("users");

// مسح بنمط محدد
const deletedKeys = await cacheManager.clearNamespace("users", "profile:*");
```

## 🎨 أمثلة متقدمة

### 1. كاش مع TTL ديناميكي

```javascript
@cacheWithDynamicTTL(
  (userId, userType) => {
    return userType === 'premium' ? 7200 : 1800;
  },
  {
    namespace: 'users',
    operation: 'profile',
    keyParams: ['userId', 'userType']
  }
)
async getUserProfile(userId, userType) {
  return await this.fetchUserFromDB(userId);
}
```

### 2. كاش مع ضغط البيانات

```javascript
@cacheWithCompression({
  namespace: 'products',
  operation: 'list',
  ttl: 1800,
  keyParams: ['page', 'limit'],
  compressionThreshold: 2048
})
async getProductsList(page, limit) {
  return await this.fetchProductsFromDB(page, limit);
}
```

### 3. كاش مع Background Refresh

```javascript
@cacheWithBackgroundRefresh({
  namespace: 'products',
  operation: 'stats',
  ttl: 3600,
  refreshThreshold: 0.8,
  keyParams: ['categoryId']
})
async getProductStats(categoryId) {
  return await this.calculateStats(categoryId);
}
```

## 🔍 استكشاف الأخطاء

### 1. فحص حالة Redis

```javascript
const testResult = await cacheManager.cacheService.testConnection();
console.log("Redis connection test:", testResult);
```

### 2. فحص الإحصائيات

```javascript
const stats = cacheManager.cacheService.getStats();
console.log("Cache stats:", stats);
```

### 3. فحص المفاتيح

```javascript
const keys = await cacheManager.cacheService.getKeys("users:*");
console.log("User cache keys:", keys);
```

## 📈 أفضل الممارسات

### 1. تسمية المفاتيح

- استخدم أسماء واضحة ومتسقة
- استخدم namespaces للتنظيم
- تجنب المفاتيح الطويلة جداً

### 2. TTL Management

- اضبط TTL حسب طبيعة البيانات
- استخدم TTL ديناميكي للبيانات المتغيرة
- راقب hit rate لتحسين TTL

### 3. Cache Invalidation

- استخدم invalidation فوري للبيانات الحساسة
- استخدم invalidation انتقائي لتوفير الأداء
- راقب invalidation patterns

### 4. Monitoring

- راقب hit rate بانتظام
- راقب حجم الكاش
- راقب أخطاء الكاش

## 🚀 التطوير المستقبلي

### 1. ميزات مخططة

- [ ] Cache warming عند بدء الخادم
- [ ] Cache versioning
- [ ] Distributed caching
- [ ] Cache analytics dashboard

### 2. تحسينات الأداء

- [ ] Connection pooling محسن
- [ ] Batch operations
- [ ] Pipeline operations
- [ ] Memory optimization

### 3. مراقبة متقدمة

- [ ] Real-time monitoring
- [ ] Alerting system
- [ ] Performance metrics
- [ ] Cache optimization suggestions

## 📞 الدعم

للحصول على المساعدة أو الإبلاغ عن مشاكل:

1. راجع ملفات الأمثلة في `examples/`
2. تحقق من logs للتشخيص
3. استخدم أدوات المراقبة المدمجة
4. راجع الوثائق التفصيلية

---

**ملاحظة**: هذا النظام مصمم ليكون مرناً وقابلاً للتوسع. يمكن تخصيصه حسب احتياجات التطبيق المحددة.
