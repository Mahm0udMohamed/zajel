import { useState, useEffect, useCallback } from "react";
import { heroOccasionsApi, HeroOccasion, ApiError } from "../services/api";

interface UseHeroOccasionsOptions {
  autoFetch?: boolean;
  limit?: number;
  isActive?: boolean;
  language?: "ar" | "en";
}

interface UseHeroOccasionsReturn {
  occasions: HeroOccasion[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getActiveOccasions: () => Promise<void>;
  getUpcomingOccasions: () => Promise<void>;
  searchOccasions: (query: string) => Promise<void>;
}

export const useHeroOccasions = (
  options: UseHeroOccasionsOptions = {}
): UseHeroOccasionsReturn => {
  const {
    autoFetch = true,
    limit = 10,
    isActive = true,
    language = "ar",
  } = options;

  const [occasions, setOccasions] = useState<HeroOccasion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOccasions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await heroOccasionsApi.getAll({
        limit,
        isActive,
        language,
        sortBy: "date",
        sortOrder: "asc",
      });

      if (response.success) {
        setOccasions(response.data);
      } else {
        throw new Error("Failed to fetch occasions");
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "An unknown error occurred";

      setError(errorMessage);
      console.error("Error fetching hero occasions:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, isActive, language]);

  const getActiveOccasions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await heroOccasionsApi.getActive(limit);

      if (response.success) {
        setOccasions(response.data);
      } else {
        throw new Error("Failed to fetch active occasions");
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "An unknown error occurred";

      setError(errorMessage);
      console.error("Error fetching active hero occasions:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const getUpcomingOccasions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await heroOccasionsApi.getUpcoming(limit);

      if (response.success) {
        setOccasions(response.data);
      } else {
        throw new Error("Failed to fetch upcoming occasions");
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "An unknown error occurred";

      setError(errorMessage);
      console.error("Error fetching upcoming hero occasions:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const searchOccasions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        await fetchOccasions();
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await heroOccasionsApi.search(query, language, limit);

        if (response.success) {
          setOccasions(response.data);
        } else {
          throw new Error("Failed to search occasions");
        }
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "An unknown error occurred";

        setError(errorMessage);
        console.error("Error searching hero occasions:", err);
      } finally {
        setLoading(false);
      }
    },
    [language, limit, fetchOccasions]
  );

  const refetch = useCallback(async () => {
    await fetchOccasions();
  }, [fetchOccasions]);

  useEffect(() => {
    if (autoFetch) {
      fetchOccasions();
    }
  }, [autoFetch, fetchOccasions]);

  return {
    occasions,
    loading,
    error,
    refetch,
    getActiveOccasions,
    getUpcomingOccasions,
    searchOccasions,
  };
};

// Hook specifically for the hero slider
export const useHeroSliderOccasions = () => {
  const { occasions, loading, error, refetch } = useHeroOccasions({
    autoFetch: true,
    isActive: true,
    limit: 50, // Get more occasions for the slider
  });

  // Find the nearest upcoming occasion
  const nearestOccasion = occasions.reduce((nearest, occasion) => {
    const occasionDate = new Date(occasion.date).getTime();
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // Skip past occasions (more than 1 day old)
    if (occasionDate < now - oneDayInMs) return nearest;

    if (!nearest || occasionDate < new Date(nearest.date).getTime()) {
      return occasion;
    }
    return nearest;
  }, null as HeroOccasion | null);

  // Get active occasions sorted by priority
  const activeOccasions = occasions
    .filter((occasion) => occasion.isActive)
    .sort((a, b) => a.priority - b.priority);

  return {
    occasions,
    activeOccasions,
    nearestOccasion,
    loading,
    error,
    refetch,
  };
};
