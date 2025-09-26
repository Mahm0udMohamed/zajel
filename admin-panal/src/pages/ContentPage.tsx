import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import HeroOccasionsTab from "../components/hero/HeroOccasionsTab";
import HeroPromotionsTab from "../components/hero/HeroPromotionsTab";
import CategoriesTab from "../components/categories/CategoriesTab";
import OccasionsTab from "../components/occasions/OccasionsTab";
import type { HeroOccasion, HeroPromotion } from "../types/hero";
import type { Category, CategoryFormData } from "../types/categories";
import type { Occasion, OccasionFormData } from "../types/occasions";

export default function ContentPage() {
  // Hero Occasions State
  const [heroOccasions, setHeroOccasions] = useState<HeroOccasion[]>([
    {
      id: "1",
      nameKey: "occasion.eidFitr",
      nameAr: "عيد الفطر",
      nameEn: "Eid Fitr",
      date: "2025-04-05T00:00:00",
      images: [
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756383070/eid-adha_ntz2zh.png",
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756383081/eid-adha2_dkr1x0.png",
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756383069/eid-adha3_timrvu.png",
      ],
      celebratoryMessageAr: "عيد فطر مبارك! تقبل الله منا ومنكم",
      celebratoryMessageEn:
        "Eid Fitr Mubarak! May Allah accept from us and you",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Hero Promotions State
  const [heroPromotions, setHeroPromotions] = useState<HeroPromotion[]>([
    {
      id: "1",
      type: "promotion",
      image:
        "https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg?auto=compress&cs=tinysrgb&w=1200",
      titleAr: "خصم 50% على جميع الهدايا",
      titleEn: "50% Off All Gifts",
      subtitleAr: "عرض محدود لفترة قصيرة",
      subtitleEn: "Limited Time Offer",
      buttonTextAr: "تسوق الآن",
      buttonTextEn: "Shop Now",
      link: "/products?sale=50",
      gradient: "from-red-500/80 to-pink-600/80",
      isActive: true,
      priority: 1,
      startDate: "2025-01-01T00:00:00",
      endDate: "2025-12-31T23:59:59",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: "flowers",
      nameAr: "الورود",
      nameEn: "Flowers",
      imageUrl:
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756380621/1_kxxw33.png",
      isActive: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "jewelry",
      nameAr: "المجوهرات",
      nameEn: "Jewelry",
      imageUrl:
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756380621/2_lfbu29.png",
      isActive: true,
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: "plants",
      nameAr: "النباتات",
      nameEn: "Plants",
      imageUrl:
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756380626/3_w12azk.png",
      isActive: true,
      sortOrder: 3,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [occasions, setOccasions] = useState<Occasion[]>([
    {
      id: "birthday",
      nameAr: "عيد ميلاد",
      nameEn: "Birthday",
      imageUrl:
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756383070/eid-adha_ntz2zh.png",
      isActive: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "wedding",
      nameAr: "زفاف",
      nameEn: "Wedding",
      imageUrl:
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756383081/eid-adha2_dkr1x0.png",
      isActive: true,
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: "graduation",
      nameAr: "تخرج",
      nameEn: "Graduation",
      imageUrl:
        "https://res.cloudinary.com/djpl34pm6/image/upload/v1756383069/eid-adha3_timrvu.png",
      isActive: true,
      sortOrder: 3,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Hero Occasions Handlers
  const handleAddHeroOccasion = (occasion: HeroOccasion) => {
    setHeroOccasions([...heroOccasions, occasion]);
  };

  const handleUpdateHeroOccasion = (
    id: string,
    updatedOccasion: HeroOccasion
  ) => {
    setHeroOccasions(
      heroOccasions.map((occ) => (occ.id === id ? updatedOccasion : occ))
    );
  };

  const handleDeleteHeroOccasion = (id: string) => {
    setHeroOccasions(heroOccasions.filter((occ) => occ.id !== id));
  };

  const handleToggleHeroOccasionActive = (id: string) => {
    setHeroOccasions(
      heroOccasions.map((occ) =>
        occ.id === id ? { ...occ, isActive: !occ.isActive } : occ
      )
    );
  };

  // Hero Promotions Handlers
  const handleAddPromotion = (promotion: HeroPromotion) => {
    setHeroPromotions([...heroPromotions, promotion]);
  };

  const handleUpdatePromotion = (
    id: string,
    updatedPromotion: HeroPromotion
  ) => {
    setHeroPromotions(
      heroPromotions.map((promo) =>
        promo.id === id ? updatedPromotion : promo
      )
    );
  };

  const handleDeletePromotion = (id: string) => {
    setHeroPromotions(heroPromotions.filter((promo) => promo.id !== id));
  };

  const handleTogglePromotionActive = (id: string) => {
    setHeroPromotions(
      heroPromotions.map((promo) =>
        promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
      )
    );
  };

  const handleAddCategory = (categoryData: CategoryFormData) => {
    const category: Category = {
      id: Date.now().toString(),
      ...categoryData,
      createdAt: new Date().toISOString(),
    };
    setCategories([...categories, category]);
  };

  const handleUpdateCategory = (id: string, categoryData: CategoryFormData) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id
          ? { ...cat, ...categoryData, updatedAt: new Date().toISOString() }
          : cat
      )
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleToggleCategoryActive = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  const handleReorderCategories = (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories);
  };

  const handleAddOccasion = (occasionData: OccasionFormData) => {
    const occasion: Occasion = {
      id: Date.now().toString(),
      ...occasionData,
      createdAt: new Date().toISOString(),
    };
    setOccasions([...occasions, occasion]);
  };

  const handleUpdateOccasion = (id: string, occasionData: OccasionFormData) => {
    setOccasions(
      occasions.map((occ) =>
        occ.id === id
          ? { ...occ, ...occasionData, updatedAt: new Date().toISOString() }
          : occ
      )
    );
  };

  const handleDeleteOccasion = (id: string) => {
    setOccasions(occasions.filter((occ) => occ.id !== id));
  };

  const handleToggleOccasionActive = (id: string) => {
    setOccasions(
      occasions.map((occ) =>
        occ.id === id ? { ...occ, isActive: !occ.isActive } : occ
      )
    );
  };

  const handleReorderOccasions = (reorderedOccasions: Occasion[]) => {
    setOccasions(reorderedOccasions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">إدارة المحتوى</h1>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
          <TabsTrigger value="hero">الهيرو</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
          <TabsTrigger value="occasions">المناسبات</TabsTrigger>
        </TabsList>

        {/* Hero Tab */}
        <TabsContent value="hero" className="space-y-4">
          <Tabs defaultValue="hero-occasions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              <TabsTrigger value="hero-occasions">مناسبات الهيرو</TabsTrigger>
              <TabsTrigger value="hero-promotions">عروض الهيرو</TabsTrigger>
            </TabsList>

            {/* Hero Occasions Sub-Tab */}
            <TabsContent value="hero-occasions" className="space-y-4">
              <HeroOccasionsTab
                occasions={heroOccasions}
                onAdd={handleAddHeroOccasion}
                onUpdate={handleUpdateHeroOccasion}
                onDelete={handleDeleteHeroOccasion}
                onToggleActive={handleToggleHeroOccasionActive}
              />
            </TabsContent>

            {/* Hero Promotions Sub-Tab */}
            <TabsContent value="hero-promotions" className="space-y-4">
              <HeroPromotionsTab
                promotions={heroPromotions}
                onAdd={handleAddPromotion}
                onUpdate={handleUpdatePromotion}
                onDelete={handleDeletePromotion}
                onToggleActive={handleTogglePromotionActive}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <CategoriesTab
            categories={categories}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            onToggleActive={handleToggleCategoryActive}
            onReorder={handleReorderCategories}
          />
        </TabsContent>

        {/* Occasions Tab */}
        <TabsContent value="occasions" className="space-y-4">
          <OccasionsTab
            occasions={occasions}
            onAdd={handleAddOccasion}
            onUpdate={handleUpdateOccasion}
            onDelete={handleDeleteOccasion}
            onToggleActive={handleToggleOccasionActive}
            onReorder={handleReorderOccasions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
