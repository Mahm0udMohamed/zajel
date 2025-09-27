# Redis Troubleshooting Guide - دليل استكشاف أخطاء Redis

## 🔍 **مشكلة Cache MISS المتكررة**

إذا كنت ترى رسائل مثل:

```
🔄 Cache MISS for upcoming occasions (limit: 1), fetching from database
🔄 Cache MISS for upcoming occasions (limit: 1), fetching from database
```

هذا يعني أن Redis لا يعمل بشكل صحيح.

## 🛠️ **خطوات التشخيص**

### **1. اختبار Redis Connection**

```bash
# تشغيل اختبار Redis
npm run test:redis

# أو اختبار مباشر
node scripts/testRedis.js
```

### **2. فحص Redis Status**

```bash
# فحص حالة Redis
curl -X GET "https://localhost:3002/api/hero-occasions/cache/diagnose" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **3. فحص Redis Stats**

```bash
# فحص إحصائيات الكاش
curl -X GET "https://localhost:3002/api/hero-occasions/cache/stats" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 **الحلول الشائعة**

### **المشكلة 1: Redis غير مثبت أو غير مشغل**

#### **الحل:**

```bash
# تثبيت Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# تشغيل Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# التحقق من الحالة
sudo systemctl status redis-server
```

#### **للـ Windows:**

```bash
# تحميل Redis for Windows
# أو استخدام Docker
docker run -d -p 6379:6379 redis:alpine
```

### **المشكلة 2: Redis URL غير صحيح**

#### **فحص متغير البيئة:**

```bash
# فحص REDIS_URL
echo $REDIS_URL

# أو في .env file
cat .env | grep REDIS_URL
```

#### **الحل:**

```bash
# إضافة إلى .env
REDIS_URL=redis://localhost:6379

# أو للـ production
REDIS_URL=rediss://username:password@host:port
```

### **المشكلة 3: Redis غير متاح على المنفذ المحدد**

#### **فحص المنفذ:**

```bash
# فحص المنفذ 6379
netstat -tulpn | grep 6379

# أو
lsof -i :6379
```

#### **الحل:**

```bash
# تشغيل Redis على منفذ مختلف
redis-server --port 6380

# تحديث REDIS_URL
REDIS_URL=redis://localhost:6380
```

### **المشكلة 4: مشاكل في الإعدادات**

#### **فحص إعدادات Redis:**

```bash
# فحص إعدادات Redis
redis-cli config get "*"

# فحص الذاكرة
redis-cli info memory
```

## 📊 **مراقبة الأداء**

### **1. Redis Monitor**

```bash
# مراقبة Redis في الوقت الفعلي
redis-cli monitor
```

### **2. Redis Info**

```bash
# معلومات شاملة عن Redis
redis-cli info

# معلومات محددة
redis-cli info stats
redis-cli info memory
redis-cli info clients
```

### **3. فحص الكاش Keys**

```bash
# فحص جميع مفاتيح hero-occasions
redis-cli keys "hero-occasions:*"

# فحص مفتاح محدد
redis-cli get "hero-occasions:upcoming:1"

# فحص TTL
redis-cli ttl "hero-occasions:upcoming:1"
```

## 🚨 **رسائل الخطأ الشائعة**

### **"Redis connection failed"**

```bash
# الحل:
1. تأكد من تشغيل Redis
2. فحص REDIS_URL
3. فحص Firewall
4. فحص المنفذ
```

### **"Redis not ready"**

```bash
# الحل:
1. انتظر حتى يصبح Redis ready
2. فحص redis.status
3. إعادة تشغيل Redis
```

### **"Command timeout"**

```bash
# الحل:
1. زيادة commandTimeout
2. فحص أداء Redis
3. فحص الشبكة
```

## 🔄 **إعادة تعيين الكاش**

### **مسح الكاش يدوياً:**

```bash
# عبر API
curl -X DELETE "https://localhost:3002/api/hero-occasions/cache/clear" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# عبر Redis CLI
redis-cli flushdb
```

### **إعادة تشغيل Redis:**

```bash
# إعادة تشغيل Redis
sudo systemctl restart redis-server

# أو
redis-cli shutdown
redis-server
```

## 📈 **تحسين الأداء**

### **1. إعدادات Redis محسنة:**

```bash
# في redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### **2. مراقبة الذاكرة:**

```bash
# فحص استخدام الذاكرة
redis-cli info memory | grep used_memory_human
```

### **3. تنظيف دوري:**

```bash
# تنظيف الكاش القديم
redis-cli --scan --pattern "hero-occasions:*" | xargs redis-cli del
```

## 🎯 **التحقق من الحل**

بعد تطبيق الحلول، يجب أن ترى:

```bash
✅ Redis connected successfully
✅ Redis ready for commands
✅ Cache HIT for upcoming occasions (limit: 1)
```

بدلاً من:

```bash
🔄 Cache MISS for upcoming occasions (limit: 1)
```

## 📞 **الدعم**

إذا استمرت المشكلة:

1. **فحص Logs:**

   ```bash
   tail -f logs/redis.log
   ```

2. **تشغيل اختبار شامل:**

   ```bash
   npm run test:redis
   ```

3. **فحص إعدادات الخادم:**

   ```bash
   redis-cli config get "*"
   ```

4. **مراجعة Redis Documentation:**
   - [Redis Official Docs](https://redis.io/documentation)
   - [ioredis Documentation](https://github.com/luin/ioredis)
