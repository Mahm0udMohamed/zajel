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
import type { Occasion, OccasionFormData } from "../types/occasions";

export default function ContentPage() {
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

  const handleAddOccasion = (occasionData: OccasionFormData) => {
    const occasion: Occasion = {
      id: new Date().getTime().toString(),
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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          إدارة المحتوى
        </h1>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 h-auto">
          <TabsTrigger value="hero" className="text-sm sm:text-base py-2 px-3">
            الهيرو
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="text-sm sm:text-base py-2 px-3"
          >
            الفئات
          </TabsTrigger>
          <TabsTrigger
            value="occasions"
            className="text-sm sm:text-base py-2 px-3"
          >
            المناسبات
          </TabsTrigger>
        </TabsList>

        {/* Hero Tab */}
        <TabsContent value="hero" className="space-y-4">
          <Tabs defaultValue="hero-occasions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 gap-1 h-auto">
              <TabsTrigger
                value="hero-occasions"
                className="text-xs sm:text-sm py-2 px-2"
              >
                مناسبات الهيرو
              </TabsTrigger>
              <TabsTrigger
                value="hero-promotions"
                className="text-xs sm:text-sm py-2 px-2"
              >
                عروض الهيرو
              </TabsTrigger>
            </TabsList>

            {/* Hero Occasions Sub-Tab */}
            <TabsContent value="hero-occasions" className="space-y-4">
              <HeroOccasionsTab />
            </TabsContent>

            {/* Hero Promotions Sub-Tab */}
            <TabsContent value="hero-promotions" className="space-y-4">
              <HeroPromotionsTab />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <CategoriesTab />
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
