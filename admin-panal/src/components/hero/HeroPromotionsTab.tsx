import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { HeroPromotionModal } from "../ui/HeroPromotionModal";
import { Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { HeroPromotion } from "../../types/hero";

const GRADIENT_OPTIONS = [
  { value: "from-red-500/80 to-pink-600/80", label: "أحمر وردي" },
  { value: "from-green-500/80 to-emerald-600/80", label: "أخضر زمردي" },
  { value: "from-purple-500/80 to-indigo-600/80", label: "بنفسجي أزرق" },
  { value: "from-amber-500/80 to-orange-600/80", label: "ذهبي برتقالي" },
  { value: "from-blue-500/80 to-cyan-600/80", label: "أزرق سماوي" },
  { value: "from-pink-500/80 to-rose-600/80", label: "وردي" },
  { value: "from-teal-500/80 to-green-600/80", label: "تركوازي أخضر" },
  { value: "from-violet-500/80 to-purple-600/80", label: "بنفسجي" },
];

export default function HeroPromotionsTab() {
  const [promotions, setPromotions] = useState<HeroPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] =
    useState<HeroPromotion | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast } = useToast();

  // تحميل البيانات من الباك إند
  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHeroPromotions();

      // معالجة مبسطة للاستجابة
      if (Array.isArray(response)) {
        setPromotions(response as HeroPromotion[]);
      } else {
        console.warn("Unexpected response format:", response);
        setPromotions([]);
      }
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل العروض الترويجية",
        variant: "destructive",
      });
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند بدء المكون
  useEffect(() => {
    loadPromotions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSuccess = (newPromotion: HeroPromotion) => {
    setPromotions((prevPromotions) => [...prevPromotions, newPromotion]);
    setIsAddOpen(false);
  };

  const handleEditSuccess = (updatedPromotion: HeroPromotion) => {
    setPromotions((prevPromotions) =>
      prevPromotions.map((promo) =>
        promo._id === updatedPromotion._id ? updatedPromotion : promo
      )
    );
    setIsEditOpen(false);
    setEditingPromotion(null);
  };

  const handleEdit = (promotion: HeroPromotion) => {
    setEditingPromotion(promotion);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) {
      toast({
        title: "خطأ",
        description: "معرف العرض الترويجي غير صحيح",
        variant: "destructive",
      });
      return;
    }

    // حفظ البيانات الأصلية للتراجع في حالة الخطأ
    const originalPromotions = [...promotions];
    const promotionToDelete = promotions.find(
      (promo) => promo._id === deletingId
    );

    if (!promotionToDelete) {
      toast({
        title: "خطأ",
        description: "العرض الترويجي غير موجود",
        variant: "destructive",
      });
      return;
    }

    try {
      // إزالة العرض الترويجي محلياً فوراً لتحسين تجربة المستخدم
      setPromotions((prevPromotions) =>
        prevPromotions.filter((promo) => promo._id !== deletingId)
      );

      // إرسال طلب الحذف إلى الباك إند
      await apiService.deleteHeroPromotion(deletingId);

      toast({
        title: "تم الحذف",
        description: "تم حذف العرض الترويجي بنجاح",
      });
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting promotion:", error);

      // إعادة البيانات الأصلية في حالة الخطأ
      setPromotions(originalPromotions);

      toast({
        title: "خطأ",
        description: "فشل في حذف العرض الترويجي",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!id) {
      toast({
        title: "خطأ",
        description: "معرف العرض الترويجي غير صحيح",
        variant: "destructive",
      });
      return;
    }

    // حفظ الحالة الأصلية للتراجع في حالة الخطأ
    const originalPromotions = [...promotions];
    const promotionIndex = promotions.findIndex((promo) => promo._id === id);

    if (promotionIndex === -1) {
      toast({
        title: "خطأ",
        description: "العرض الترويجي غير موجود",
        variant: "destructive",
      });
      return;
    }

    const originalStatus = promotions[promotionIndex].isActive;
    const newStatus = !originalStatus;

    // تحديث الحالة محلياً فوراً لتحسين تجربة المستخدم
    setPromotions((prevPromotions) =>
      prevPromotions.map((promo) =>
        promo._id === id ? { ...promo, isActive: newStatus } : promo
      )
    );

    try {
      await apiService.toggleHeroPromotionStatus(id);
      toast({
        title: "تم بنجاح",
        description: `تم ${newStatus ? "تفعيل" : "إلغاء تفعيل"} العرض الترويجي`,
      });
    } catch (error) {
      console.error("Error toggling promotion status:", error);

      // إعادة الحالة الأصلية في حالة الخطأ
      setPromotions(originalPromotions);

      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة العرض الترويجي",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const getGradientLabel = (value: string) => {
    const option = GRADIENT_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              العروض الترويجية
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              إدارة العروض الترويجية التي تظهر في شريحة الهيرو الرئيسية
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة عرض
                        </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري التحميل...</span>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 min-w-[80px]">الصورة</TableHead>
                <TableHead className="w-40 min-w-[160px]">العنوان</TableHead>
                <TableHead className="w-24 min-w-[96px]">التدرج</TableHead>
                <TableHead className="w-32 min-w-[128px]">الفترة</TableHead>
                <TableHead className="w-20 min-w-[80px]">الأولوية</TableHead>
                <TableHead className="w-24 min-w-[96px]">الحالة</TableHead>
                <TableHead className="w-32 min-w-[128px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="w-8 h-8 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        لا توجد عروض ترويجية
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                promotions
                  .sort((a, b) => a.priority - b.priority)
                  .map((promotion, index) => {
                    // التأكد من وجود ID
                    const promotionId =
                      promotion._id || `promotion-${index}-${Date.now()}`;
                    return (
                      <TableRow key={promotionId}>
                        <TableCell>
                          <div className="flex justify-center">
                            <img
                              src={promotion.image || "/placeholder.svg"}
                              alt={promotion.titleAr}
                              className="w-16 h-10 object-cover rounded flex-shrink-0"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <div className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                              {promotion.titleAr}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                              {promotion.titleEn}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded bg-gradient-to-r ${promotion.gradient} flex-shrink-0`}
                            />
                            <span className="text-sm flex-shrink-0">
                              {getGradientLabel(promotion.gradient)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div
                              className={`flex items-center gap-1 ${
                                promotion.isActive
                                  ? "text-green-400"
                                  : "text-gray-400"
                              }`}
                            >
                              <span className="flex-shrink-0">من:</span>
                              <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                                {formatDate(promotion.startDate)}
                              </span>
                              <span className="flex-shrink-0">إلى:</span>
                              <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                                {formatDate(promotion.endDate)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center text-sm font-medium">
                            {promotion.priority}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant={
                                promotion.isActive ? "default" : "secondary"
                              }
                              className="flex-shrink-0 text-xs"
                            >
                              {promotion.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(promotionId)}
                              className="flex-shrink-0 scale-75"
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  promotion.isActive
                                    ? "bg-green-500 border-green-500"
                                    : "bg-gray-400 border-gray-400"
                                }`}
                              />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(promotion)}
                              className="h-8 px-2 text-xs"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline mr-1">
                                تعديل
                              </span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(promotionId)}
                              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 shadow-red-500/20 h-8 px-2 text-xs"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline mr-1">حذف</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Modal */}
      <HeroPromotionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="add"
        onSuccess={handleAddSuccess}
        title="إضافة عرض ترويجي جديد"
      />

      {/* Edit Modal */}
      <HeroPromotionModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        promotion={editingPromotion}
        onSuccess={handleEditSuccess}
        title="تعديل العرض الترويجي"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف العرض الترويجي"
        description="هل أنت متأكد من أنك تريد حذف هذا العرض الترويجي؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />
    </Card>
  );
}
