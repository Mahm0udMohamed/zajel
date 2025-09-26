import { useEffect, useRef } from "react";
import { imageCache } from "../utils/ImageCache";

interface UseImagePreloaderOptions {
  enabled?: boolean;
  priority?: boolean;
  quality?: number;
}

/**
 * Hook to preload images for better UX
 */
export const useImagePreloader = (
  images: string[],
  options: UseImagePreloaderOptions = {}
) => {
  const { enabled = true, priority = false, quality = 85 } = options;
  const preloadedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || images.length === 0) return;

    const preloadImages = async () => {
      const imagesToPreload = images.filter(
        (img) => img && !preloadedRef.current.has(img)
      );

      if (imagesToPreload.length === 0) return;

      // Preload images with appropriate delay
      for (let i = 0; i < imagesToPreload.length; i++) {
        const img = imagesToPreload[i];

        try {
          // Add delay for non-priority images to avoid blocking
          if (!priority && i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Generate optimized URL
          let optimizedSrc = img;
          if (img.includes("pexels.com")) {
            const url = new URL(img);
            url.searchParams.set("w", "400");
            if (quality < 90) {
              url.searchParams.set("auto", "compress");
              url.searchParams.set("cs", "tinysrgb");
            }
            url.searchParams.set("dpr", "2");
            optimizedSrc = url.toString();
          }

          // Cache the image
          await imageCache.getImage(optimizedSrc);
          preloadedRef.current.add(img);
        } catch (error) {
          console.warn(`Failed to preload image: ${img}`, error);
        }
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preloadImages);
    } else {
      setTimeout(preloadImages, priority ? 0 : 1000);
    }
  }, [images, enabled, priority, quality]);

  return {
    preloadedCount: preloadedRef.current.size,
    isPreloaded: (src: string) => preloadedRef.current.has(src),
  };
};

/**
 * Hook to preload critical images immediately
 */
export const usePreloadCriticalImages = (images: string[]) => {
  return useImagePreloader(images, { enabled: true, priority: true });
};

/**
 * Hook to preload images when component becomes visible
 */
export const usePreloadOnVisible = (
  images: string[],
  isVisible: boolean,
  options: UseImagePreloaderOptions = {}
) => {
  return useImagePreloader(images, { ...options, enabled: isVisible });
};
