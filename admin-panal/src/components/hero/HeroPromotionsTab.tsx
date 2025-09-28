import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Link,
  Upload,
  Loader2,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { HeroPromotion, HeroPromotionFormData } from "../../types/hero";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newPromotion, setNewPromotion] = useState<HeroPromotionFormData>({
    image: "",
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    buttonTextAr: "",
    buttonTextEn: "",
    link: "",
    gradient: "from-red-500/80 to-pink-600/80",
    isActive: true,
    priority: 1,
    startDate: "",
    endDate: "",
  });
  const [originalPromotion, setOriginalPromotion] =
    useState<HeroPromotionFormData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast({
          title: "خطأ",
          description: "يرجى اختيار ملف صورة صحيح",
          variant: "destructive",
        });
        return;
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ",
          description: "حجم الصورة يجب أن يكون أقل من 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploadingImage(true);

      try {
        const response = await apiService.uploadHeroPromotionImage(file);
        setNewPromotion({ ...newPromotion, image: response.secure_url });
        toast({
          title: "تم رفع الصورة",
          description: "تم رفع الصورة بنجاح",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "خطأ",
          description: "فشل في رفع الصورة",
          variant: "destructive",
        });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const resetForm = () => {
    setNewPromotion({
      image: "",
      titleAr: "",
      titleEn: "",
      subtitleAr: "",
      subtitleEn: "",
      buttonTextAr: "",
      buttonTextEn: "",
      link: "",
      gradient: "from-red-500/80 to-pink-600/80",
      isActive: true,
      priority: 1,
      startDate: "",
      endDate: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingId(null);
    setOriginalPromotion(null);
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

  const hasChanges = () => {
    if (!originalPromotion) return false;

    return (
      newPromotion.image !== originalPromotion.image ||
      newPromotion.titleAr !== originalPromotion.titleAr ||
      newPromotion.titleEn !== originalPromotion.titleEn ||
      newPromotion.subtitleAr !== originalPromotion.subtitleAr ||
      newPromotion.subtitleEn !== originalPromotion.subtitleEn ||
      newPromotion.buttonTextAr !== originalPromotion.buttonTextAr ||
      newPromotion.buttonTextEn !== originalPromotion.buttonTextEn ||
      newPromotion.link !== originalPromotion.link ||
      newPromotion.gradient !== originalPromotion.gradient ||
      newPromotion.isActive !== originalPromotion.isActive ||
      newPromotion.priority !== originalPromotion.priority ||
      newPromotion.startDate !== originalPromotion.startDate ||
      newPromotion.endDate !== originalPromotion.endDate
    );
  };

  const hasData = () => {
    return (
      newPromotion.image.trim() !== "" ||
      newPromotion.titleAr.trim() !== "" ||
      newPromotion.titleEn.trim() !== "" ||
      newPromotion.subtitleAr.trim() !== "" ||
      newPromotion.subtitleEn.trim() !== "" ||
      newPromotion.buttonTextAr.trim() !== "" ||
      newPromotion.buttonTextEn.trim() !== "" ||
      newPromotion.link.trim() !== "" ||
      newPromotion.startDate !== "" ||
      newPromotion.endDate !== ""
    );
  };

  const handlePointerDownOutside = (e: Event) => {
    if (isEditOpen && hasChanges()) {
      e.preventDefault();
    } else if (isAddOpen && hasData()) {
      e.preventDefault();
    }
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (isEditOpen && hasChanges()) {
      e.preventDefault();
    } else if (isAddOpen && hasData()) {
      e.preventDefault();
    }
  };

  const validatePromotionData = (data: HeroPromotionFormData) => {
    const errors: string[] = [];

    if (!data.titleAr?.trim()) {
      errors.push("العنوان العربي مطلوب");
    }

    if (!data.titleEn?.trim()) {
      errors.push("العنوان الإنجليزي مطلوب");
    }

    if (!data.subtitleAr?.trim()) {
      errors.push("العنوان الفرعي العربي مطلوب");
    }

    if (!data.subtitleEn?.trim()) {
      errors.push("العنوان الفرعي الإنجليزي مطلوب");
    }

    if (!data.buttonTextAr?.trim()) {
      errors.push("نص الزر العربي مطلوب");
    }

    if (!data.buttonTextEn?.trim()) {
      errors.push("نص الزر الإنجليزي مطلوب");
    }

    if (!data.link?.trim()) {
      errors.push("الرابط مطلوب");
    }

    if (!data.image?.trim()) {
      errors.push("الصورة مطلوبة");
    }

    if (!data.startDate) {
      errors.push("تاريخ البداية مطلوب");
    } else {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push("تاريخ البداية غير صحيح");
      }
    }

    if (!data.endDate) {
      errors.push("تاريخ الانتهاء مطلوب");
    } else {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push("تاريخ الانتهاء غير صحيح");
      } else if (endDate <= new Date(data.startDate)) {
        errors.push("تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية");
      }
    }

    if (data.priority < 1 || data.priority > 100) {
      errors.push("الأولوية يجب أن تكون بين 1 و 100");
    }

    return errors;
  };

  const handleAdd = async () => {
    const validationErrors = validatePromotionData(newPromotion);

    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في التحقق",
        description: validationErrors.join("، "),
        variant: "destructive",
      });
      return;
    }

    try {
      const promotionData = {
        titleAr: newPromotion.titleAr.trim(),
        titleEn: newPromotion.titleEn.trim(),
        subtitleAr: newPromotion.subtitleAr.trim(),
        subtitleEn: newPromotion.subtitleEn.trim(),
        buttonTextAr: newPromotion.buttonTextAr.trim(),
        buttonTextEn: newPromotion.buttonTextEn.trim(),
        link: newPromotion.link.trim(),
        image: newPromotion.image.trim(),
        gradient: newPromotion.gradient,
        isActive: Boolean(newPromotion.isActive),
        priority: Number(newPromotion.priority),
        startDate: new Date(newPromotion.startDate).toISOString(),
        endDate: new Date(newPromotion.endDate).toISOString(),
      };

      console.log("Sending promotion data:", promotionData);

      // إرسال البيانات إلى الباك إند والحصول على العرض الترويجي الجديد
      const createdPromotion = await apiService.createHeroPromotion(
        promotionData
      );

      // إضافة العرض الترويجي الجديد محلياً فوراً لتحسين تجربة المستخدم
      if (
        createdPromotion &&
        typeof createdPromotion === "object" &&
        "_id" in createdPromotion
      ) {
        const newPromotionItem: HeroPromotion = {
          _id: createdPromotion._id as string,
          titleAr: promotionData.titleAr,
          titleEn: promotionData.titleEn,
          subtitleAr: promotionData.subtitleAr,
          subtitleEn: promotionData.subtitleEn,
          buttonTextAr: promotionData.buttonTextAr,
          buttonTextEn: promotionData.buttonTextEn,
          link: promotionData.link,
          image: promotionData.image,
          gradient: promotionData.gradient,
          isActive: promotionData.isActive,
          priority: promotionData.priority,
          startDate: promotionData.startDate,
          endDate: promotionData.endDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setPromotions((prevPromotions) => [
          ...prevPromotions,
          newPromotionItem,
        ]);
      }

      resetForm();
      setIsAddOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة العرض الترويجي بنجاح",
      });
    } catch (error) {
      console.error("Error creating promotion:", error);
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في إضافة العرض الترويجي: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (promotion: HeroPromotion) => {
    const promotionId = promotion._id || `promotion-${Date.now()}`;
    setEditingId(promotionId);

    // تحويل التواريخ إلى تنسيق datetime-local
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    const formattedStartDate = isNaN(startDate.getTime())
      ? ""
      : startDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    const formattedEndDate = isNaN(endDate.getTime())
      ? ""
      : endDate.toISOString().slice(0, 16);

    const promotionData = {
      image: promotion.image,
      titleAr: promotion.titleAr,
      titleEn: promotion.titleEn,
      subtitleAr: promotion.subtitleAr,
      subtitleEn: promotion.subtitleEn,
      buttonTextAr: promotion.buttonTextAr,
      buttonTextEn: promotion.buttonTextEn,
      link: promotion.link,
      gradient: promotion.gradient,
      isActive: promotion.isActive,
      priority: promotion.priority,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };
    setNewPromotion(promotionData);
    setOriginalPromotion(promotionData);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId) {
      toast({
        title: "خطأ",
        description: "معرف العرض الترويجي غير صحيح",
        variant: "destructive",
      });
      return;
    }

    const validationErrors = validatePromotionData(newPromotion);

    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في التحقق",
        description: validationErrors.join("، "),
        variant: "destructive",
      });
      return;
    }

    // حفظ البيانات الأصلية للتراجع في حالة الخطأ
    const originalPromotions = [...promotions];
    const promotionIndex = promotions.findIndex(
      (promo) => promo._id === editingId
    );

    if (promotionIndex === -1) {
      toast({
        title: "خطأ",
        description: "العرض الترويجي غير موجود",
        variant: "destructive",
      });
      return;
    }

    try {
      const promotionData = {
        titleAr: newPromotion.titleAr.trim(),
        titleEn: newPromotion.titleEn.trim(),
        subtitleAr: newPromotion.subtitleAr.trim(),
        subtitleEn: newPromotion.subtitleEn.trim(),
        buttonTextAr: newPromotion.buttonTextAr.trim(),
        buttonTextEn: newPromotion.buttonTextEn.trim(),
        link: newPromotion.link.trim(),
        image: newPromotion.image.trim(),
        gradient: newPromotion.gradient,
        isActive: Boolean(newPromotion.isActive),
        priority: Number(newPromotion.priority),
        startDate: new Date(newPromotion.startDate).toISOString(),
        endDate: new Date(newPromotion.endDate).toISOString(),
      };

      console.log("Updating promotion data:", promotionData);

      // تحديث البيانات محلياً فوراً لتحسين تجربة المستخدم
      const updatedPromotion = {
        ...promotions[promotionIndex],
        ...promotionData,
        _id: editingId,
        updatedAt: new Date().toISOString(),
      };

      setPromotions((prevPromotions) =>
        prevPromotions.map((promo) =>
          promo._id === editingId ? updatedPromotion : promo
        )
      );

      // إرسال التحديث إلى الباك إند
      await apiService.updateHeroPromotion(editingId, promotionData);

      setEditingId(null);
      setIsEditOpen(false);
      setOriginalPromotion(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث العرض الترويجي بنجاح",
      });
    } catch (error) {
      console.error("Error updating promotion:", error);

      // إعادة البيانات الأصلية في حالة الخطأ
      setPromotions(originalPromotions);

      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في تحديث العرض الترويجي: ${errorMessage}`,
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                إضافة عرض
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[85vh] flex flex-col"
              onPointerDownOutside={handlePointerDownOutside}
              onEscapeKeyDown={handleEscapeKeyDown}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white">
                  إضافة عرض ترويجي جديد
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  أضف عرض ترويجي جديد للعرض في شريحة الهيرو
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="grid gap-6 py-6">
                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <Label htmlFor="image" className="text-white font-medium">
                      صورة العرض *
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="image"
                        value={newPromotion.image}
                        onChange={(e) =>
                          setNewPromotion({
                            ...newPromotion,
                            image: e.target.value,
                          })
                        }
                        placeholder="رابط صورة العرض أو ارفع صورة"
                        className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingImage}
                          className="bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20 disabled:opacity-50"
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-1" />
                          )}
                          {uploadingImage ? "جاري الرفع..." : "رفع"}
                        </Button>
                      </div>
                    </div>
                    {newPromotion.image && (
                      <div className="mt-3">
                        <img
                          src={newPromotion.image}
                          alt="معاينة الصورة"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="titleAr"
                          className="text-white font-medium"
                        >
                          العنوان بالعربية *
                        </Label>
                        <Input
                          id="titleAr"
                          value={newPromotion.titleAr}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              titleAr: e.target.value,
                            })
                          }
                          placeholder="مثال: خصم 50% على جميع الهدايا"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="titleEn"
                          className="text-white font-medium"
                        >
                          العنوان بالإنجليزية *
                        </Label>
                        <Input
                          id="titleEn"
                          value={newPromotion.titleEn}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              titleEn: e.target.value,
                            })
                          }
                          placeholder="Example: 50% Off All Gifts"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="subtitleAr"
                          className="text-white font-medium"
                        >
                          العنوان الفرعي بالعربية
                        </Label>
                        <Input
                          id="subtitleAr"
                          value={newPromotion.subtitleAr}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              subtitleAr: e.target.value,
                            })
                          }
                          placeholder="مثال: عرض محدود لفترة قصيرة"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="subtitleEn"
                          className="text-white font-medium"
                        >
                          العنوان الفرعي بالإنجليزية
                        </Label>
                        <Input
                          id="subtitleEn"
                          value={newPromotion.subtitleEn}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              subtitleEn: e.target.value,
                            })
                          }
                          placeholder="Example: Limited Time Offer"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="buttonTextAr"
                          className="text-white font-medium"
                        >
                          نص الزر بالعربية
                        </Label>
                        <Input
                          id="buttonTextAr"
                          value={newPromotion.buttonTextAr}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              buttonTextAr: e.target.value,
                            })
                          }
                          placeholder="مثال: تسوق الآن"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="buttonTextEn"
                          className="text-white font-medium"
                        >
                          نص الزر بالإنجليزية
                        </Label>
                        <Input
                          id="buttonTextEn"
                          value={newPromotion.buttonTextEn}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              buttonTextEn: e.target.value,
                            })
                          }
                          placeholder="Example: Shop Now"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <Label
                      htmlFor="link"
                      className="flex items-center gap-2 text-white font-medium"
                    >
                      <Link className="w-4 h-4 text-blue-400" />
                      رابط التوجيه
                    </Label>
                    <Input
                      id="link"
                      value={newPromotion.link}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          link: e.target.value,
                        })
                      }
                      placeholder="/products?sale=50"
                      className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <Label
                      htmlFor="gradient"
                      className="text-white font-medium"
                    >
                      التدرج اللوني
                    </Label>
                    <Select
                      value={newPromotion.gradient}
                      onValueChange={(value) =>
                        setNewPromotion({
                          ...newPromotion,
                          gradient: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue placeholder="اختر التدرج اللوني" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADIENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="startDate"
                          className="flex items-center gap-2 text-white font-medium"
                        >
                          <Calendar className="w-4 h-4 text-blue-400" />
                          تاريخ البداية
                        </Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newPromotion.startDate}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              startDate: e.target.value,
                            })
                          }
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="endDate"
                          className="flex items-center gap-2 text-white font-medium"
                        >
                          <Calendar className="w-4 h-4 text-blue-400" />
                          تاريخ النهاية
                        </Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newPromotion.endDate}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              endDate: e.target.value,
                            })
                          }
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="priority"
                          className="text-white font-medium"
                        >
                          الأولوية
                        </Label>
                        <Input
                          id="priority"
                          type="number"
                          min="1"
                          value={newPromotion.priority}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              priority: Number(e.target.value),
                            })
                          }
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-6">
                        <Label
                          htmlFor="isActive"
                          className="order-2 text-white font-medium"
                        >
                          نشط
                        </Label>
                        <Switch
                          id="isActive"
                          checked={newPromotion.isActive}
                          onCheckedChange={(checked) =>
                            setNewPromotion({
                              ...newPromotion,
                              isActive: checked,
                            })
                          }
                          className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-start gap-3 bg-black/20 border-t border-gray-800/50 p-4 -mx-6 -mb-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 shadow-gray-500/20"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAdd}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30"
                >
                  إضافة العرض
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                            <Switch
                              checked={promotion.isActive}
                              onCheckedChange={() =>
                                handleToggleActive(promotionId)
                              }
                              className="flex-shrink-0 scale-75"
                            />
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] flex flex-col"
          onPointerDownOutside={handlePointerDownOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              تعديل العرض الترويجي
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              تعديل بيانات العرض الترويجي المحدد
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="grid gap-6 py-6">
              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <Label htmlFor="edit-image" className="text-white font-medium">
                  صورة العرض *
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="edit-image"
                    value={newPromotion.image}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        image: e.target.value,
                      })
                    }
                    placeholder="رابط صورة العرض أو ارفع صورة"
                    className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="edit-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      className="bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-1" />
                      )}
                      {uploadingImage ? "جاري الرفع..." : "رفع"}
                    </Button>
                  </div>
                </div>
                {newPromotion.image && (
                  <div className="mt-3">
                    <img
                      src={newPromotion.image}
                      alt="معاينة الصورة"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                    />
                  </div>
                )}
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-titleAr"
                      className="text-white font-medium"
                    >
                      العنوان بالعربية *
                    </Label>
                    <Input
                      id="edit-titleAr"
                      value={newPromotion.titleAr}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          titleAr: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-titleEn"
                      className="text-white font-medium"
                    >
                      العنوان بالإنجليزية *
                    </Label>
                    <Input
                      id="edit-titleEn"
                      value={newPromotion.titleEn}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          titleEn: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-subtitleAr"
                      className="text-white font-medium"
                    >
                      العنوان الفرعي بالعربية
                    </Label>
                    <Input
                      id="edit-subtitleAr"
                      value={newPromotion.subtitleAr}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          subtitleAr: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-subtitleEn"
                      className="text-white font-medium"
                    >
                      العنوان الفرعي بالإنجليزية
                    </Label>
                    <Input
                      id="edit-subtitleEn"
                      value={newPromotion.subtitleEn}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          subtitleEn: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-buttonTextAr"
                      className="text-white font-medium"
                    >
                      نص الزر بالعربية
                    </Label>
                    <Input
                      id="edit-buttonTextAr"
                      value={newPromotion.buttonTextAr}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          buttonTextAr: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-buttonTextEn"
                      className="text-white font-medium"
                    >
                      نص الزر بالإنجليزية
                    </Label>
                    <Input
                      id="edit-buttonTextEn"
                      value={newPromotion.buttonTextEn}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          buttonTextEn: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <Label
                  htmlFor="edit-link"
                  className="flex items-center gap-2 text-white font-medium"
                >
                  <Link className="w-4 h-4 text-blue-400" />
                  رابط التوجيه
                </Label>
                <Input
                  id="edit-link"
                  value={newPromotion.link}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      link: e.target.value,
                    })
                  }
                  placeholder="/products?sale=50"
                  className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <Label
                  htmlFor="edit-gradient"
                  className="text-white font-medium"
                >
                  التدرج اللوني
                </Label>
                <Select
                  value={newPromotion.gradient}
                  onValueChange={(value) =>
                    setNewPromotion({
                      ...newPromotion,
                      gradient: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20">
                    <SelectValue placeholder="اختر التدرج اللوني" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-startDate"
                      className="flex items-center gap-2 text-white font-medium"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
                      تاريخ البداية
                    </Label>
                    <Input
                      id="edit-startDate"
                      type="datetime-local"
                      value={newPromotion.startDate}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          startDate: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-endDate"
                      className="flex items-center gap-2 text-white font-medium"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
                      تاريخ النهاية
                    </Label>
                    <Input
                      id="edit-endDate"
                      type="datetime-local"
                      value={newPromotion.endDate}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          endDate: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-priority"
                      className="text-white font-medium"
                    >
                      الأولوية
                    </Label>
                    <Input
                      id="edit-priority"
                      type="number"
                      min="1"
                      value={newPromotion.priority}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          priority: Number(e.target.value),
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-6">
                    <Label
                      htmlFor="edit-isActive"
                      className="order-2 text-white font-medium"
                    >
                      نشط
                    </Label>
                    <Switch
                      id="edit-isActive"
                      checked={newPromotion.isActive}
                      onCheckedChange={(checked) =>
                        setNewPromotion({ ...newPromotion, isActive: checked })
                      }
                      className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-start gap-3 bg-black/20 border-t border-gray-800/50 p-4 -mx-6 -mb-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 shadow-gray-500/20"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30"
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
