// utils/serviceChecker.js
import dotenv from "dotenv";

dotenv.config();

/**
 * فحص حالة جميع الخدمات المطلوبة
 */
export const checkAllServices = () => {
  const services = {
    database: {
      name: "MongoDB",
      configured: !!process.env.MONGO_URI,
      required: true,
      setupUrl: "https://www.mongodb.com/cloud/atlas",
    },
    twilio: {
      name: "Twilio (Phone Verification)",
      configured: !!(
        process.env.TWILIO_ACCOUNT_SID?.startsWith("AC") &&
        process.env.TWILIO_AUTH_TOKEN?.length === 32 &&
        process.env.TWILIO_VERIFY_SERVICE_SID?.startsWith("VA")
      ),
      required: false,
      setupUrl: "https://www.twilio.com/try-twilio",
    },
    sendgrid: {
      name: "SendGrid (Email Service)",
      configured: !!process.env.SENDGRID_API_KEY?.startsWith("SG."),
      required: false,
      setupUrl: "https://sendgrid.com/",
    },
    googleOAuth: {
      name: "Google OAuth",
      configured: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      required: false,
      setupUrl: "https://console.developers.google.com/",
    },
    recaptcha: {
      name: "reCAPTCHA",
      configured: !!process.env.RECAPTCHA_SECRET_KEY,
      required: false,
      setupUrl: "https://www.google.com/recaptcha/admin",
    },
    cloudinary: {
      name: "Cloudinary (Image Upload)",
      configured: !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ),
      required: false,
      setupUrl: "https://cloudinary.com/",
    },
    redis: {
      name: "Redis (Performance)",
      configured: !!process.env.REDIS_URL,
      required: false,
      setupUrl: "https://redis.io/",
    },
  };

  return services;
};

/**
 * طباعة تقرير حالة الخدمات
 */
export const printServiceStatus = () => {
  const services = checkAllServices();
  
  console.log("\n📋 Service Configuration Status:");
  console.log("=" .repeat(50));
  
  Object.entries(services).forEach(([key, service]) => {
    const status = service.configured ? "✅ Configured" : "❌ Not configured";
    const required = service.required ? "(Required)" : "(Optional)";
    
    console.log(`   ${service.name}: ${status} ${required}`);
    
    if (!service.configured && !service.required) {
      console.log(`     Setup: ${service.setupUrl}`);
    }
  });
  
  console.log("=" .repeat(50));
  
  // تحذيرات للخدمات المطلوبة غير المُعدّة
  const missingRequired = Object.entries(services).filter(
    ([_, service]) => service.required && !service.configured
  );
  
  if (missingRequired.length > 0) {
    console.log("\n⚠️  Missing Required Services:");
    missingRequired.forEach(([_, service]) => {
      console.log(`   - ${service.name}: ${service.setupUrl}`);
    });
  }
  
  // نصائح للخدمات الاختيارية
  const missingOptional = Object.entries(services).filter(
    ([_, service]) => !service.required && !service.configured
  );
  
  if (missingOptional.length > 0) {
    console.log("\n💡 Optional Services (for enhanced functionality):");
    missingOptional.forEach(([_, service]) => {
      console.log(`   - ${service.name}: ${service.setupUrl}`);
    });
  }
  
  console.log("\n");
};

/**
 * التحقق من خدمة معينة
 */
export const isServiceConfigured = (serviceName) => {
  const services = checkAllServices();
  return services[serviceName]?.configured || false;
};