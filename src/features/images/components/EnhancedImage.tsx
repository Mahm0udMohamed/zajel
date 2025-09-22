import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import LogoPlaceholder from "./LogoPlaceholder";
import { imageCache } from "../utils/ImageCache";

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  onLoad?: () => void;
  onError?: () => void;
  enableBlurUp?: boolean;
  showPlaceholder?: boolean;
  placeholderSize?: number;
  fallbackSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  quality = 100,
  sizes,
  aspectRatio = "auto",
  onLoad,
  onError,
  enableBlurUp = true,
  placeholderSize = 40,
  fallbackSrc,
  threshold = 0.1,
  rootMargin = "100px",
}) => {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isInView, setIsInView] = useState(priority);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const aspectRatioClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  };

  // Generate optimized URLs
  const generateOptimizedUrl = useCallback(
    (originalSrc: string, targetQuality?: number, targetWidth?: number) => {
      if (originalSrc.includes("pexels.com")) {
        const url = new URL(originalSrc);
        if (targetWidth) url.searchParams.set("w", targetWidth.toString());
        // Only compress for very low quality images (blur-up effect)
        if (targetQuality && targetQuality <= 20) {
          url.searchParams.set("auto", "compress");
          url.searchParams.set("cs", "tinysrgb");
        }
        // For high quality images, use high DPR for crisp display
        if (targetQuality && targetQuality >= 90) {
          url.searchParams.set("dpr", "2");
        } else {
          url.searchParams.set("dpr", "1.5");
        }
        return url.toString();
      }
      return originalSrc;
    },
    []
  );

  // Reset states when src changes (for filtering scenarios)
  useEffect(() => {
    setImageState("loading");
    setImageSrc("");
    setLowQualityLoaded(false);
    if (!priority) {
      setIsInView(false);
    }
  }, [src, priority]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (priority || !imgRef.current) {
      if (priority) setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, threshold, rootMargin, src]);

  // Progressive loading effect
  useEffect(() => {
    if (!isInView || !src) return;

    const loadImage = async () => {
      try {
        // Load low quality version first for blur-up effect (only for non-priority images)
        if (enableBlurUp && !priority) {
          const lowQualitySrc = generateOptimizedUrl(
            src,
            20,
            Math.min(width || 100, 100)
          );
          const lowQualityImg = new Image();

          lowQualityImg.onload = () => {
            setLowQualityLoaded(true);
            setImageSrc(lowQualitySrc);
          };

          lowQualityImg.src = lowQualitySrc;
        }

        // Load high quality version with optimization but no compression
        const highQualitySrc = generateOptimizedUrl(src, quality, width);
        const cachedSrc = await imageCache.getImage(highQualitySrc);

        const highQualityImg = new Image();

        highQualityImg.onload = () => {
          setImageSrc(cachedSrc);
          setImageState("loaded");
          onLoad?.();
        };

        highQualityImg.onerror = () => {
          if (fallbackSrc) {
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              setImageSrc(fallbackSrc);
              setImageState("loaded");
            };
            fallbackImg.onerror = () => {
              setImageState("error");
              onError?.();
            };
            fallbackImg.src = fallbackSrc;
          } else {
            setImageState("error");
            onError?.();
          }
        };

        highQualityImg.src = cachedSrc;
      } catch (error) {
        console.warn("Image loading failed:", error);
        setImageState("error");
        onError?.();
      }
    };

    loadImage();
  }, [
    isInView,
    src,
    generateOptimizedUrl,
    quality,
    width,
    enableBlurUp,
    priority,
    fallbackSrc,
    onLoad,
    onError,
  ]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}
    >
      {/* Low Quality Image (Blur-up) - shows immediately for non-priority images */}
      {lowQualityLoaded && enableBlurUp && !priority && (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter"
          loading="eager"
          aria-hidden="true"
        />
      )}

      {/* High Quality Image - replaces everything seamlessly */}
      {imageState === "loaded" && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className="absolute inset-0 w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}

      {/* Error State - only shows on actual error */}
      {imageState === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
          <LogoPlaceholder
            size={Math.min(placeholderSize, 32)}
            animate={false}
            className="opacity-40 mb-2"
          />
          <span className="text-xs font-medium opacity-60">
            {alt || "Image unavailable"}
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(EnhancedImage);
