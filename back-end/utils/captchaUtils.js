// captchaUtils.js

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = process.env.RECAPTCHA_VERIFY_URL;

/**
 * التحقق من صحة كود CAPTCHA
 * @param {string} captchaToken - رمز التحقق من المستخدم
 * @returns {Promise<boolean>} - true إذا كان التحقق ناجحًا، false إذا فشل
 */
export const verifyCaptcha = async (captchaToken) => {
  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: captchaToken,
      }),
    });

    const data = await response.json();
    return Boolean(data.success);
  } catch (error) {
    return false;
  }
};
