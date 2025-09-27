// services/cache/index.js
// ملف التصدير الرئيسي لخدمات الكاش

import cacheLayer from "./CacheLayer.js";
import cacheMiddleware from "./CacheMiddleware.js";
import * as cacheDecorators from "./CacheDecorators.js";
import * as cacheUtils from "../../utils/cacheUtils.js";

// تصدير الخدمات الرئيسية
export { cacheLayer, cacheMiddleware, cacheDecorators, cacheUtils };

// تصدير افتراضي
export default {
  cacheLayer,
  cacheMiddleware,
  cacheDecorators,
  cacheUtils,
};
