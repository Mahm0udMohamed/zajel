import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import { Textarea } from "./textarea";
import { FormModal, type FormModalProps } from "./FormModal";
import { Upload, Loader2, Image, Calendar } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { Occasion, OccasionFormData } from "../../types/occasions";

export interface OccasionModalProps extends Omit<FormModalProps, "children"> {
  occasion?: Occasion | null;
  onSuccess?: (occasion: Occasion) => void;
  mode: "add" | "edit";
}

export function OccasionModal({
  occasion,
  onSuccess,
  mode,
  ...props
}: OccasionModalProps) {
  const [formData, setFormData] = useState<OccasionFormData>({
    nameAr: occasion?.nameAr || "",
    nameEn: occasion?.nameEn || "",
    descriptionAr: occasion?.descriptionAr || "",
    descriptionEn: occasion?.descriptionEn || "",
    imageUrl: occasion?.imageUrl || "",
    isActive: occasion?.isActive ?? true,
    sortOrder: occasion?.sortOrder || 1,
    showInHomePage: occasion?.showInHomePage ?? true,
    metaTitleAr: occasion?.metaTitleAr || "",
    metaTitleEn: occasion?.metaTitleEn || "",
    metaDescriptionAr: occasion?.metaDescriptionAr || "",
    metaDescriptionEn: occasion?.metaDescriptionEn || "",
  });

  const [originalData, setOriginalData] = useState<OccasionFormData | null>(
    occasion ? { ...formData } : null
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // تحديث البيانات عند تغيير المناسبة
  useEffect(() => {
    if (occasion) {
      const updatedFormData = {
        nameAr: occasion.nameAr || "",
        nameEn: occasion.nameEn || "",
        descriptionAr: occasion.descriptionAr || "",
        descriptionEn: occasion.descriptionEn || "",
        imageUrl: occasion.imageUrl || "",
        isActive: occasion.isActive ?? true,
        sortOrder: occasion.sortOrder || 1,
        showInHomePage: occasion.showInHomePage ?? true,
        metaTitleAr: occasion.metaTitleAr || "",
        metaTitleEn: occasion.metaTitleEn || "",
        metaDescriptionAr: occasion.metaDescriptionAr || "",
        metaDescriptionEn: occasion.metaDescriptionEn || "",
      };
      setFormData(updatedFormData);
      setOriginalData(updatedFormData);
    } else {
      // إعادة تعيين البيانات للوضع الإضافة
      const resetFormData = {
        nameAr: "",
        nameEn: "",
        descriptionAr: "",
        descriptionEn: "",
        imageUrl: "",
        isActive: true,
        sortOrder: 1,
        showInHomePage: true,
        metaTitleAr: "",
        metaTitleEn: "",
        metaDescriptionAr: "",
        metaDescriptionEn: "",
      };
      setFormData(resetFormData);
      setOriginalData(null);
    }
  }, [occasion]);

  // مسح البيانات عند إغلاق النافذة
  useEffect(() => {
    if (!props.open) {
      if (mode === "add") {
        const resetFormData = {
          nameAr: "",
          nameEn: "",
          descriptionAr: "",
          descriptionEn: "",
          imageUrl: "",
          isActive: true,
          sortOrder: 1,
          showInHomePage: true,
          metaTitleAr: "",
          metaTitleEn: "",
          metaDescriptionAr: "",
          metaDescriptionEn: "",
        };
        setFormData(resetFormData);
        setOriginalData(null);
      } else if (mode === "edit" && occasion) {
        // إعادة تعيين البيانات إلى القيم الأصلية عند إغلاق نافذة التعديل
        const resetFormData = {
          nameAr: occasion.nameAr || "",
          nameEn: occasion.nameEn || "",
          descriptionAr: occasion.descriptionAr || "",
          descriptionEn: occasion.descriptionEn || "",
          imageUrl: occasion.imageUrl || "",
          isActive: occasion.isActive ?? true,
          sortOrder: occasion.sortOrder || 1,
          showInHomePage: occasion.showInHomePage ?? true,
          metaTitleAr: occasion.metaTitleAr || "",
          metaTitleEn: occasion.metaTitleEn || "",
          metaDescriptionAr: occasion.metaDescriptionAr || "",
          metaDescriptionEn: occasion.metaDescriptionEn || "",
        };
        setFormData(resetFormData);
        setOriginalData(resetFormData);
      }
    }
  }, [props.open, mode, occasion]);

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.nameAr !== originalData.nameAr ||
      formData.nameEn !== originalData.nameEn ||
      formData.descriptionAr !== originalData.descriptionAr ||
      formData.descriptionEn !== originalData.descriptionEn ||
      formData.imageUrl !== originalData.imageUrl ||
      formData.isActive !== originalData.isActive ||
      formData.sortOrder !== originalData.sortOrder ||
      formData.showInHomePage !== originalData.showInHomePage ||
      formData.metaTitleAr !== originalData.metaTitleAr ||
      formData.metaTitleEn !== originalData.metaTitleEn ||
      formData.metaDescriptionAr !== originalData.metaDescriptionAr ||
      formData.metaDescriptionEn !== originalData.metaDescriptionEn
    );
  };

  const hasData = () => {
    return (
      formData.nameAr.trim() !== "" ||
      formData.nameEn.trim() !== "" ||
      (formData.descriptionAr || "").trim() !== "" ||
      (formData.descriptionEn || "").trim() !== "" ||
      formData.imageUrl.trim() !== "" ||
      (formData.metaTitleAr || "").trim() !== "" ||
      (formData.metaTitleEn || "").trim() !== "" ||
      (formData.metaDescriptionAr || "").trim() !== "" ||
      (formData.metaDescriptionEn || "").trim() !== ""
    );
  };

  const isFormValid = () => {
    const hasNameAr = formData.nameAr.trim() !== "";
    const hasNameEn = formData.nameEn.trim() !== "";
    const hasImageUrl = formData.imageUrl.trim() !== "";

    return hasNameAr && hasNameEn && hasImageUrl;
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

    setIsUploading(true);

    try {
      const result = await apiService.uploadOccasionImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: result.imageUrl }));

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
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateOccasionData(formData);
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
      const occasionData = {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        descriptionAr: (formData.descriptionAr || "").trim(),
        descriptionEn: (formData.descriptionEn || "").trim(),
        imageUrl: formData.imageUrl.trim(),
        isActive: Boolean(formData.isActive),
        sortOrder: Number(formData.sortOrder) || 1,
        showInHomePage: Boolean(formData.showInHomePage),
        metaTitleAr: (formData.metaTitleAr || "").trim(),
        metaTitleEn: (formData.metaTitleEn || "").trim(),
        metaDescriptionAr: (formData.metaDescriptionAr || "").trim(),
        metaDescriptionEn: (formData.metaDescriptionEn || "").trim(),
      };

      let createdOccasion: Occasion;
      if (mode === "add") {
        createdOccasion = (await apiService.createOccasion(
          occasionData
        )) as Occasion;
      } else {
        if (!occasion?._id) {
          throw new Error("معرف المناسبة غير موجود");
        }
        createdOccasion = (await apiService.updateOccasion(
          occasion._id,
          occasionData
        )) as Occasion;
      }

      onSuccess?.(createdOccasion);
      toast({
        title: "تم بنجاح",
        description: `تم ${mode === "add" ? "إضافة" : "تحديث"} المناسبة بنجاح`,
      });
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "creating" : "updating"} occasion:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في ${
          mode === "add" ? "إضافة" : "تحديث"
        } المناسبة: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateOccasionData = (data: OccasionFormData) => {
    const errors: string[] = [];

    if (!data.nameAr?.trim()) {
      errors.push("الاسم العربي مطلوب");
    }
    if (!data.nameEn?.trim()) {
      errors.push("الاسم الإنجليزي مطلوب");
    }
    if (!data.imageUrl?.trim()) {
      errors.push("صورة المناسبة مطلوبة");
    }

    if (data.metaTitleAr && data.metaTitleAr.length > 60) {
      errors.push("عنوان SEO بالعربية يجب أن يكون أقل من 60 حرف");
    }
    if (data.metaTitleEn && data.metaTitleEn.length > 60) {
      errors.push("عنوان SEO بالإنجليزية يجب أن يكون أقل من 60 حرف");
    }
    if (data.metaDescriptionAr && data.metaDescriptionAr.length > 160) {
      errors.push("وصف SEO بالعربية يجب أن يكون أقل من 160 حرف");
    }
    if (data.metaDescriptionEn && data.metaDescriptionEn.length > 160) {
      errors.push("وصف SEO بالإنجليزية يجب أن يكون أقل من 160 حرف");
    }

    return errors;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, ...restProps } = props;

  return (
    <FormModal
      description={
        mode === "add"
          ? "أضف مناسبة جديدة للمنتجات"
          : "تعديل بيانات المناسبة المحددة"
      }
      onSubmit={handleSubmit}
      submitText={mode === "add" ? "إضافة المناسبة" : "حفظ التغييرات"}
      isValid={isFormValid()}
      hasChanges={hasChanges()}
      hasData={hasData()}
      isSubmitting={isSubmitting}
      mode={mode}
      icon={<Calendar className="w-5 h-5 text-purple-500" />}
      title={mode === "add" ? "إضافة مناسبة جديدة" : "تعديل المناسبة"}
      {...restProps}
    >
      <div className="grid gap-6">
        {/* الأسماء */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nameAr" className="text-white font-medium">
              الاسم بالعربية *
            </Label>
            <Input
              id="nameAr"
              value={formData.nameAr}
              onChange={(e) =>
                setFormData({ ...formData, nameAr: e.target.value })
              }
              placeholder="مثال: عيد ميلاد"
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameEn" className="text-white font-medium">
              الاسم بالإنجليزية *
            </Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) =>
                setFormData({ ...formData, nameEn: e.target.value })
              }
              placeholder="Example: Birthday"
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 placeholder-ltr"
            />
          </div>
        </div>

        {/* الأوصاف */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="descriptionAr" className="text-sm text-gray-400">
              الوصف بالعربية
            </Label>
            <Textarea
              id="descriptionAr"
              value={formData.descriptionAr}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descriptionAr: e.target.value,
                })
              }
              placeholder="وصف المناسبة بالعربية"
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 min-h-[80px]"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descriptionEn" className="text-sm text-gray-400">
              الوصف بالإنجليزية
            </Label>
            <Textarea
              id="descriptionEn"
              value={formData.descriptionEn}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descriptionEn: e.target.value,
                })
              }
              placeholder="Occasion description in English"
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 min-h-[80px] placeholder-ltr"
              rows={3}
            />
          </div>
        </div>

        {/* الصورة */}
        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="flex items-center gap-2 text-white font-medium">
            <Image className="w-4 h-4 text-purple-400" />
            صورة المناسبة
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="رابط الصورة أو ارفع صورة"
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
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  رفع
                </Button>
              </div>
            </div>
            {formData.imageUrl ? (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="معاينة الصورة"
                  className="w-20 h-20 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* الترتيب والحالة */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sortOrder" className="text-white font-medium">
              ترتيب العرض
            </Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: Number(e.target.value) || 1,
                })
              }
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
              min="0"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
                className="data-[state=checked]:bg-purple-600 shadow-purple-500/20"
              />
              <Label htmlFor="isActive" className="text-white font-medium">
                نشط
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showInHomePage"
                checked={formData.showInHomePage}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showInHomePage: checked })
                }
                className="data-[state=checked]:bg-purple-600 shadow-purple-500/20"
              />
              <Label
                htmlFor="showInHomePage"
                className="text-white font-medium"
              >
                عرض في الصفحة الرئيسية
              </Label>
            </div>
          </div>
        </div>

        {/* إعدادات SEO */}
        <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <h3 className="text-white font-medium text-lg">إعدادات SEO</h3>

          {/* عناوين SEO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitleAr" className="text-sm text-gray-400">
                عنوان SEO بالعربية
              </Label>
              <Input
                id="metaTitleAr"
                value={formData.metaTitleAr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaTitleAr: e.target.value,
                  })
                }
                placeholder="عنوان SEO بالعربية"
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                maxLength={60}
              />
              <p className="text-xs text-gray-400">
                {(formData.metaTitleAr || "").length}/60 حرف
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaTitleEn" className="text-sm text-gray-400">
                عنوان SEO بالإنجليزية
              </Label>
              <Input
                id="metaTitleEn"
                value={formData.metaTitleEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaTitleEn: e.target.value,
                  })
                }
                placeholder="SEO Title in English"
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 placeholder-ltr"
                maxLength={60}
              />
              <p className="text-xs text-gray-400">
                {(formData.metaTitleEn || "").length}/60 حرف
              </p>
            </div>
          </div>

          {/* أوصاف SEO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="metaDescriptionAr"
                className="text-sm text-gray-400"
              >
                وصف SEO بالعربية
              </Label>
              <Textarea
                id="metaDescriptionAr"
                value={formData.metaDescriptionAr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescriptionAr: e.target.value,
                  })
                }
                placeholder="وصف SEO بالعربية"
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 min-h-[80px]"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-400">
                {(formData.metaDescriptionAr || "").length}/160 حرف
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="metaDescriptionEn"
                className="text-sm text-gray-400"
              >
                وصف SEO بالإنجليزية
              </Label>
              <Textarea
                id="metaDescriptionEn"
                value={formData.metaDescriptionEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescriptionEn: e.target.value,
                  })
                }
                placeholder="SEO Description in English"
                className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 min-h-[80px] placeholder-ltr"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-400">
                {(formData.metaDescriptionEn || "").length}/160 حرف
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
