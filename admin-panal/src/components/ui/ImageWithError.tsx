import { useState } from "react";
import { Image } from "lucide-react";

interface ImageWithErrorProps {
  src: string;
  alt: string;
  className: string;
  onError?: () => void;
  onLoad?: () => void;
  [key: string]: unknown;
}

export function ImageWithError({
  src,
  alt,
  className,
  onError,
  onLoad,
  ...props
}: ImageWithErrorProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const handleImageError = () => {
    setImageLoadFailed(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setImageLoadFailed(false);
    onLoad?.();
  };

  if (imageLoadFailed || !src) {
    return (
      <div
        className={`${className} bg-gray-800 flex items-center justify-center`}
        {...props}
      >
        <div className="text-center px-1">
          <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mx-auto mb-1" />
          <span className="text-[10px] xs:text-xs text-gray-500 leading-tight">
            صورة غير صحيحة
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    />
  );
}
