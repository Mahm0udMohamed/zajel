import { useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
      reset: () => void;
    };
  }
}

interface UseRecaptchaOptions {
  siteKey: string;
  action: string;
}

export const useRecaptcha = ({ siteKey, action }: UseRecaptchaOptions) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.id = "recaptcha-script"; // إضافة ID للسكريبت

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsLoaded(true);
      });
    };

    script.onerror = () => {
      console.error("Failed to load reCAPTCHA script");
    };

    document.head.appendChild(script);

    return () => {
      // تنظيف شامل عند إلغاء تحميل المكون
      try {
        // إزالة السكريبت
        const existingScript = document.getElementById("recaptcha-script");
        if (existingScript) {
          document.head.removeChild(existingScript);
        }

        // إزالة جميع عناصر reCAPTCHA من الـ DOM
        const recaptchaElements = document.querySelectorAll(
          '[id^="___grecaptcha"]'
        );
        recaptchaElements.forEach((element) => {
          element.remove();
        });

        // إزالة عناصر reCAPTCHA الإضافية
        const recaptchaBadge = document.querySelector(".grecaptcha-badge");
        if (recaptchaBadge) {
          recaptchaBadge.remove();
        }

        // إزالة أي iframes خاصة بـ reCAPTCHA
        const recaptchaIframes = document.querySelectorAll(
          'iframe[src*="recaptcha"]'
        );
        recaptchaIframes.forEach((iframe) => {
          iframe.remove();
        });

        // إزالة أي divs خاصة بـ reCAPTCHA
        const recaptchaDivs = document.querySelectorAll(
          'div[style*="recaptcha"]'
        );
        recaptchaDivs.forEach((div) => {
          div.remove();
        });

        // إعادة تعيين متغير grecaptcha
        if (window.grecaptcha) {
          try {
            window.grecaptcha.reset();
          } catch {
            // تجاهل الأخطاء في reset
          }
          // @ts-expect-error - إزالة المتغير من window
          delete window.grecaptcha;
        }

        // إزالة أي CSS خاص بـ reCAPTCHA
        const recaptchaStyles = document.querySelectorAll(
          'style[data-styled*="recaptcha"], link[href*="recaptcha"]'
        );
        recaptchaStyles.forEach((style) => {
          style.remove();
        });

        setIsLoaded(false);
      } catch (error) {
        console.warn("Error during reCAPTCHA cleanup:", error);
      }
    };
  }, [siteKey]);

  const executeRecaptcha = async (): Promise<string> => {
    if (!isLoaded || !window.grecaptcha) {
      console.warn("reCAPTCHA not loaded yet");
      return "dummy-captcha-token"; // Fallback for development
    }

    setIsLoading(true);
    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      setIsLoading(false);
      return token;
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error);
      setIsLoading(false);
      return "dummy-captcha-token"; // Fallback on error
    }
  };

  return {
    isLoaded,
    isLoading,
    executeRecaptcha,
  };
};
