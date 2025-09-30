import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { FormModal, type FormModalProps } from "./FormModal";
import { Upload, Loader2, Tag, Calendar, Link, Image } from "lucide-react";
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

export interface HeroPromotionModalProps
  extends Omit<FormModalProps, "children"> {
  promotion?: HeroPromotion | null;
  onSuccess?: (promotion: HeroPromotion) => void;
  mode: "add" | "edit";
}

export function HeroPromotionModal({
  promotion,
  onSuccess,
  mode,
  ...props
}: HeroPromotionModalProps) {
  const [formData, setFormData] = useState<HeroPromotionFormData>({
    image: promotion?.image || "",
    titleAr: promotion?.titleAr || "",
    titleEn: promotion?.titleEn || "",
    subtitleAr: promotion?.subtitleAr || "",
    subtitleEn: promotion?.subtitleEn || "",
    buttonTextAr: promotion?.buttonTextAr || "",
    buttonTextEn: promotion?.buttonTextEn || "",
    link: promotion?.link || "",
    gradient: promotion?.gradient || "from-red-500/80 to-pink-600/80",
    isActive: promotion?.isActive ?? true,
    priority: promotion?.priority || 1,
    startDate: promotion?.startDate
      ? new Date(promotion.startDate).toISOString().slice(0, 16)
      : "",
    endDate: promotion?.endDate
      ? new Date(promotion.endDate).toISOString().slice(0, 16)
      : "",
  });

  const [originalData, setOriginalData] =
    useState<HeroPromotionFormData | null>(promotion ? { ...formData } : null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // تحديث البيانات عند تغيير promotion
  useEffect(() => {
    if (promotion) {
      const updatedFormData = {
        image: promotion.image || "",
        titleAr: promotion.titleAr || "",
        titleEn: promotion.titleEn || "",
        subtitleAr: promotion.subtitleAr || "",
        subtitleEn: promotion.subtitleEn || "",
        buttonTextAr: promotion.buttonTextAr || "",
        buttonTextEn: promotion.buttonTextEn || "",
        link: promotion.link || "",
        gradient: promotion.gradient || "from-red-500/80 to-pink-600/80",
        isActive: promotion.isActive ?? true,
        priority: promotion.priority || 1,
        startDate: promotion.startDate
          ? new Date(promotion.startDate).toISOString().slice(0, 16)
          : "",
        endDate: promotion.endDate
          ? new Date(promotion.endDate).toISOString().slice(0, 16)
          : "",
      };
      setFormData(updatedFormData);
      setOriginalData(updatedFormData);
    } else {
      // إعادة تعيين البيانات للوضع الإضافة
      const resetFormData = {
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
      };
      setFormData(resetFormData);
      setOriginalData(null);
    }
  }, [promotion]);

  // مسح البيانات عند إغلاق النافذة
  useEffect(() => {
    if (!props.open) {
      if (mode === "add") {
        const resetFormData = {
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
        };
        setFormData(resetFormData);
        setOriginalData(null);
      } else if (mode === "edit" && promotion) {
        // إعادة تعيين البيانات إلى القيم الأصلية عند إغلاق نافذة التعديل
        const resetFormData = {
          image: promotion.image || "",
          titleAr: promotion.titleAr || "",
          titleEn: promotion.titleEn || "",
          subtitleAr: promotion.subtitleAr || "",
          subtitleEn: promotion.subtitleEn || "",
          buttonTextAr: promotion.buttonTextAr || "",
          buttonTextEn: promotion.buttonTextEn || "",
          link: promotion.link || "",
          gradient: promotion.gradient || "from-red-500/80 to-pink-600/80",
          isActive: promotion.isActive ?? true,
          priority: promotion.priority || 1,
          startDate: promotion.startDate
            ? new Date(promotion.startDate).toISOString().slice(0, 16)
            : "",
          endDate: promotion.endDate
            ? new Date(promotion.endDate).toISOString().slice(0, 16)
            : "",
        };
        setFormData(resetFormData);
        setOriginalData(resetFormData);
      }
      // إعادة تعيين حالة فشل الصورة
      setImageLoadFailed(false);
    }
  }, [props.open, mode, promotion]);

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.image !== originalData.image ||
      formData.titleAr !== originalData.titleAr ||
      formData.titleEn !== originalData.titleEn ||
      formData.subtitleAr !== originalData.subtitleAr ||
      formData.subtitleEn !== originalData.subtitleEn ||
      formData.buttonTextAr !== originalData.buttonTextAr ||
      formData.buttonTextEn !== originalData.buttonTextEn ||
      formData.link !== originalData.link ||
      formData.gradient !== originalData.gradient ||
      formData.isActive !== originalData.isActive ||
      formData.priority !== originalData.priority ||
      formData.startDate !== originalData.startDate ||
      formData.endDate !== originalData.endDate
    );
  };

  const hasData = () => {
    return (
      formData.image.trim() !== "" ||
      formData.titleAr.trim() !== "" ||
      formData.titleEn.trim() !== "" ||
      formData.subtitleAr.trim() !== "" ||
      formData.subtitleEn.trim() !== "" ||
      formData.buttonTextAr.trim() !== "" ||
      formData.buttonTextEn.trim() !== "" ||
      formData.link.trim() !== "" ||
      formData.startDate !== "" ||
      formData.endDate !== ""
    );
  };

  const isFormValid = () => {
    return (
      formData.titleAr.trim() !== "" &&
      formData.titleEn.trim() !== "" &&
      formData.subtitleAr.trim() !== "" &&
      formData.subtitleEn.trim() !== "" &&
      formData.buttonTextAr.trim() !== "" &&
      formData.buttonTextEn.trim() !== "" &&
      formData.link.trim() !== "" &&
      formData.image.trim() !== "" &&
      formData.startDate !== "" &&
      formData.endDate !== "" &&
      formData.priority >= 1 &&
      formData.priority <= 100
    );
  };

  const handleImageError = () => {
    setImageLoadFailed(true);
  };

  const handleImageLoad = () => {
    setImageLoadFailed(false);
  };

  const handleImageChange = (value: string) => {
    setFormData({ ...formData, image: value });
    // إعادة تعيين حالة فشل الصورة عند تغيير الرابط
    setImageLoadFailed(false);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صحيح",
        variant: "destructive",
      });
      return;
    }

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
      setFormData({ ...formData, image: response.secure_url });
      setImageLoadFailed(false); // إعادة تعيين حالة فشل الصورة عند رفع صورة جديدة
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
  };

  const handleSubmit = async () => {
    const validationErrors = validatePromotionData(formData);
    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في التحقق",
        description: validationErrors.join("، "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const promotionData = {
        titleAr: formData.titleAr.trim(),
        titleEn: formData.titleEn.trim(),
        subtitleAr: formData.subtitleAr.trim(),
        subtitleEn: formData.subtitleEn.trim(),
        buttonTextAr: formData.buttonTextAr.trim(),
        buttonTextEn: formData.buttonTextEn.trim(),
        link: formData.link.trim(),
        image: formData.image.trim(),
        gradient: formData.gradient,
        isActive: Boolean(formData.isActive),
        priority: Number(formData.priority),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      let createdPromotion: HeroPromotion;
      if (mode === "add") {
        createdPromotion = (await apiService.createHeroPromotion(
          promotionData
        )) as HeroPromotion;
      } else {
        if (!promotion?._id) {
          throw new Error("معرف العرض الترويجي غير موجود");
        }
        createdPromotion = (await apiService.updateHeroPromotion(
          promotion._id,
          promotionData
        )) as HeroPromotion;
      }

      onSuccess?.(createdPromotion);
      toast({
        title: "تم بنجاح",
        description: `تم ${
          mode === "add" ? "إضافة" : "تحديث"
        } العرض الترويجي بنجاح`,
      });
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "creating" : "updating"} promotion:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في ${
          mode === "add" ? "إضافة" : "تحديث"
        } العرض الترويجي: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePromotionData = (data: HeroPromotionFormData) => {
    const errors: string[] = [];

    if (!data.titleAr?.trim()) errors.push("العنوان العربي مطلوب");
    if (!data.titleEn?.trim()) errors.push("العنوان الإنجليزي مطلوب");
    if (!data.subtitleAr?.trim()) errors.push("العنوان الفرعي العربي مطلوب");
    if (!data.subtitleEn?.trim()) errors.push("العنوان الفرعي الإنجليزي مطلوب");
    if (!data.buttonTextAr?.trim()) errors.push("نص الزر العربي مطلوب");
    if (!data.buttonTextEn?.trim()) errors.push("نص الزر الإنجليزي مطلوب");
    if (!data.link?.trim()) errors.push("الرابط مطلوب");
    if (!data.image?.trim()) errors.push("الصورة مطلوبة");

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, ...restProps } = props;

  return (
    <FormModal
      description={
        mode === "add"
          ? "أضف عرض ترويجي جديد للعرض في شريحة الهيرو"
          : "تعديل بيانات العرض الترويجي المحدد"
      }
      onSubmit={handleSubmit}
      submitText={mode === "add" ? "إضافة العرض" : "حفظ التغييرات"}
      isValid={isFormValid()}
      hasChanges={hasChanges()}
      hasData={hasData()}
      isSubmitting={isSubmitting}
      mode={mode}
      icon={<Tag className="w-5 h-5 text-purple-500" />}
      title={mode === "add" ? "إضافة عرض ترويجي جديد" : "تعديل العرض الترويجي"}
      {...restProps}
    >
      <div className="grid gap-6">
        <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
          <Label htmlFor="image" className="text-white font-medium">
            صورة العرض *
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleImageChange(e.target.value)}
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
          {formData.image && (
            <div className="mt-3">
              {imageLoadFailed ? (
                <div className="w-20 h-20 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                  <div className="text-center px-1">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mx-auto mb-1" />
                    <span className="text-[10px] xs:text-xs text-gray-500 leading-tight">
                      صورة غير صحيحة
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={formData.image}
                  alt="معاينة الصورة"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              )}
            </div>
          )}
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleAr" className="text-white font-medium">
                العنوان بالعربية *
              </Label>
              <Input
                id="titleAr"
                value={formData.titleAr}
                onChange={(e) =>
                  setFormData({ ...formData, titleAr: e.target.value })
                }
                placeholder="مثال: خصم 50% على جميع الهدايا"
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEn" className="text-white font-medium">
                العنوان بالإنجليزية *
              </Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) =>
                  setFormData({ ...formData, titleEn: e.target.value })
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
              <Label htmlFor="subtitleAr" className="text-white font-medium">
                العنوان الفرعي بالعربية
              </Label>
              <Input
                id="subtitleAr"
                value={formData.subtitleAr}
                onChange={(e) =>
                  setFormData({ ...formData, subtitleAr: e.target.value })
                }
                placeholder="مثال: عرض محدود لفترة قصيرة"
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitleEn" className="text-white font-medium">
                العنوان الفرعي بالإنجليزية
              </Label>
              <Input
                id="subtitleEn"
                value={formData.subtitleEn}
                onChange={(e) =>
                  setFormData({ ...formData, subtitleEn: e.target.value })
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
              <Label htmlFor="buttonTextAr" className="text-white font-medium">
                نص الزر بالعربية
              </Label>
              <Input
                id="buttonTextAr"
                value={formData.buttonTextAr}
                onChange={(e) =>
                  setFormData({ ...formData, buttonTextAr: e.target.value })
                }
                placeholder="مثال: تسوق الآن"
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonTextEn" className="text-white font-medium">
                نص الزر بالإنجليزية
              </Label>
              <Input
                id="buttonTextEn"
                value={formData.buttonTextEn}
                onChange={(e) =>
                  setFormData({ ...formData, buttonTextEn: e.target.value })
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
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="/products?sale=50"
            className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
          />
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
          <Label htmlFor="gradient" className="text-white font-medium">
            التدرج اللوني
          </Label>
          <Select
            value={formData.gradient}
            onValueChange={(value) =>
              setFormData({ ...formData, gradient: value })
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
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
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
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white font-medium">
                الأولوية
              </Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: Number(e.target.value) })
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
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
                className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
              />
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
