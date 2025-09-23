// config/twilio.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let client = null;
let isConfigured = false;

// التحقق من صحة إعدادات Twilio
const validateTwilioConfig = () => {
  if (!accountSid || !authToken || !verifyServiceSid) {
    return false;
  }
  
  // التحقق من صيغة Account SID
  if (!accountSid.startsWith("AC") || accountSid.length !== 34) {
    return false;
  }
  
  // التحقق من صيغة Verify Service SID
  if (!verifyServiceSid.startsWith("VA") || verifyServiceSid.length !== 34) {
    return false;
  }
  
  // التحقق من طول Auth Token
  if (authToken.length !== 32) {
    return false;
  }
  
  return true;
};

if (validateTwilioConfig()) {
  client = twilio(accountSid, authToken);
  isConfigured = true;
  console.log("✅ Twilio configured successfully");
} else {
  console.warn("⚠️  Twilio credentials not properly configured. Phone verification will be disabled.");
  console.warn("📋 Required environment variables:");
  console.warn("   - TWILIO_ACCOUNT_SID (starts with 'AC', 34 characters)");
  console.warn("   - TWILIO_AUTH_TOKEN (32 characters)");
  console.warn("   - TWILIO_VERIFY_SERVICE_SID (starts with 'VA', 34 characters)");
  console.warn("💡 Create a free Twilio account at: https://www.twilio.com/try-twilio");
}

/**
 * إرسال رمز OTP إلى رقم الهاتف
 */
export const sendOTP = async (phoneNumber) => {
  try {
    if (!isConfigured || !client || !verifyServiceSid) {
      throw new Error("Twilio service is not properly configured. Please check your environment variables.");
    }

    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    console.log(`📱 OTP sent successfully to ${phoneNumber}`);
    return {
      success: true,
      status: verification.status,
      sid: verification.sid,
    };
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    
    // تحسين رسائل الخطأ
    if (error.code === 20003) {
      throw new Error("Authentication failed. Please check your Twilio credentials.");
    } else if (error.code === 21211) {
      throw new Error("Invalid phone number format. Please use international format (+966xxxxxxxxx).");
    } else if (error.code === 21608) {
      throw new Error("The phone number is not verified for your Twilio account.");
    } else {
      throw new Error(`Failed to send verification code: ${error.message}`);
    }
  }
};

/**
 * التحقق من رمز OTP
 */
export const verifyOTP = async (phoneNumber, code) => {
  try {
    if (!isConfigured || !client || !verifyServiceSid) {
      throw new Error("Twilio service is not properly configured. Please check your environment variables.");
    }

    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });

    console.log(`✅ OTP verification result for ${phoneNumber}: ${verificationCheck.status}`);
    return {
      success: verificationCheck.status === "approved",
      status: verificationCheck.status,
    };
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    
    // تحسين رسائل الخطأ
    if (error.code === 20404) {
      return {
        success: false,
        status: "failed",
        error: "Verification code has expired or is invalid.",
      };
    } else if (error.code === 20003) {
      return {
        success: false,
        status: "failed",
        error: "Authentication failed. Please check your Twilio credentials.",
      };
    }
    
    return {
      success: false,
      status: "failed",
      error: error.message,
    };
  }
};

/**
 * التحقق من حالة إعدادات Twilio
 */
export const isTwilioConfigured = () => {
  return isConfigured;
};

/**
 * الحصول على معلومات إعدادات Twilio للتشخيص
 */
export const getTwilioConfigInfo = () => {
  return {
    isConfigured,
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasVerifyServiceSid: !!verifyServiceSid,
    accountSidFormat: accountSid ? accountSid.startsWith("AC") : false,
    verifyServiceSidFormat: verifyServiceSid ? verifyServiceSid.startsWith("VA") : false,
  };
};

export default client;
