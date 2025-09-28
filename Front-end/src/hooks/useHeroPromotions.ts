import { useState, useEffect, useMemo } from "react";
import { heroPromotionsApi, HeroPromotion } from "../services/api";

interface UseHeroPromotionsReturn {
  promotions: HeroPromotion[];
  activePromotions: HeroPromotion[];
  upcomingPromotions: HeroPromotion[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHeroPromotions = (): UseHeroPromotionsReturn => {
  const [promotions, setPromotions] = useState<HeroPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await heroPromotionsApi.getAll({
        isActive: true,
        sortBy: "priority",
        sortOrder: "asc",
        limit: 10,
      });

      if (response.success && response.data) {
        setPromotions(response.data);
      } else {
        throw new Error("Failed to fetch promotions");
      }
    } catch (err) {
      console.error("Error fetching hero promotions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Filter active promotions based on current date
  const activePromotions = useMemo(() => {
    const now = new Date().getTime();
    return promotions.filter((promotion) => {
      if (!promotion.isActive) return false;

      const startDate = new Date(promotion.startDate).getTime();
      const endDate = new Date(promotion.endDate).getTime();

      return now >= startDate && now <= endDate;
    });
  }, [promotions]);

  // Filter upcoming promotions
  const upcomingPromotions = useMemo(() => {
    const now = new Date().getTime();
    return promotions.filter((promotion) => {
      if (!promotion.isActive) return false;

      const startDate = new Date(promotion.startDate).getTime();
      return now < startDate;
    });
  }, [promotions]);

  return {
    promotions,
    activePromotions,
    upcomingPromotions,
    loading,
    error,
    refetch: fetchPromotions,
  };
};

// Hook for getting only active promotions (optimized for hero slider)
export const useActiveHeroPromotions = (limit?: number) => {
  const [promotions, setPromotions] = useState<HeroPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await heroPromotionsApi.getActive(limit);

      if (response.success && response.data) {
        setPromotions(response.data);
      } else {
        throw new Error("Failed to fetch active promotions");
      }
    } catch (err) {
      console.error("Error fetching active hero promotions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePromotions();
  }, [limit]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    promotions,
    loading,
    error,
    refetch: fetchActivePromotions,
  };
};
