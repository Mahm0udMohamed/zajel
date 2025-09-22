/**
 * Image caching system for better performance
 */

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
}

class ImageCacheManager {
  private cache = new Map<string, CachedImage>();
  private maxCacheSize = 50; // Maximum number of cached images
  private maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds

  async getImage(url: string): Promise<string> {
    // Check if image is in cache and still valid
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return URL.createObjectURL(cached.blob);
    }

    try {
      // Fetch and cache the image
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();

      // Clean old entries if cache is full
      if (this.cache.size >= this.maxCacheSize) {
        this.cleanOldEntries();
      }

      // Cache the image
      this.cache.set(url, {
        url,
        blob,
        timestamp: Date.now(),
      });

      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn("Failed to cache image:", url, error);
      return url; // Fallback to original URL
    }
  }

  private cleanOldEntries() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [key, value] = entries[i];
      URL.revokeObjectURL(URL.createObjectURL(value.blob));
      this.cache.delete(key);
    }
  }

  clearCache() {
    this.cache.forEach((cached) => {
      URL.revokeObjectURL(URL.createObjectURL(cached.blob));
    });
    this.cache.clear();
  }
}

export const imageCache = new ImageCacheManager();
