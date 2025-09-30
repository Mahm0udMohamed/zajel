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

export default function ContentPage() {
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
          <OccasionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
