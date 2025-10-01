import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import { Textarea } from "./textarea";
import { FormModal, type FormModalProps } from "./FormModal";
import { Upload, Loader2, Image, Building2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { Brand, BrandFormData } from "../../types/brands";

export interface BrandModalProps extends Omit<FormModalProps, "children"> {
  brand?: Brand | null;
  onSuccess?: (brand: Brand) => void;
  mode: "add" | "edit";
}

export function BrandModal({
  brand,
  onSuccess,
  mode,
  ...props
}: BrandModalProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    nameAr: brand?.nameAr || "",
    nameEn: brand?.nameEn || "",
    descriptionAr: brand?.descriptionAr || "",
    descriptionEn: brand?.descriptionEn || "",
    imageUrl: brand?.imageUrl || "",
    isActive: brand?.isActive ?? true,
    sortOrder: brand?.sortOrder || 1,
  });

  const [originalData, setOriginalData] = useState<BrandFormData | null>(
    brand ? { ...formData } : null
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // تحديث البيانات عند تغيير العلامة التجارية
  useEffect(() => {
    if (brand) {
      const updatedFormData = {
        nameAr: brand.nameAr || "",
        nameEn: brand.nameEn || "",
        descriptionAr: brand.descriptionAr || "",
        descriptionEn: brand.descriptionEn || "",
        imageUrl: brand.imageUrl || "",
        isActive: brand.isActive ?? true,
        sortOrder: brand.sortOrder || 1,
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
      };
      setFormData(resetFormData);
      setOriginalData(null);
    }
  }, [brand]);

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
        };
        setFormData(resetFormData);
        setOriginalData(null);
      } else if (mode === "edit" && brand) {
        // إعادة تعيين البيانات إلى القيم الأصلية عند إغلاق نافذة التعديل
        const resetFormData = {
          nameAr: brand.nameAr || "",
          nameEn: brand.nameEn || "",
          descriptionAr: brand.descriptionAr || "",
          descriptionEn: brand.descriptionEn || "",
          imageUrl: brand.imageUrl || "",
          isActive: brand.isActive ?? true,
          sortOrder: brand.sortOrder || 1,
        };
        setFormData(resetFormData);
        setOriginalData(resetFormData);
      }
    }
  }, [props.open, mode, brand]);

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.nameAr !== originalData.nameAr ||
      formData.nameEn !== originalData.nameEn ||
      formData.descriptionAr !== originalData.descriptionAr ||
      formData.descriptionEn !== originalData.descriptionEn ||
      formData.imageUrl !== originalData.imageUrl ||
      formData.isActive !== originalData.isActive ||
      formData.sortOrder !== originalData.sortOrder
    );
  };

  const hasData = () => {
    return (
      formData.nameAr.trim() !== "" ||
      formData.nameEn.trim() !== "" ||
      (formData.descriptionAr || "").trim() !== "" ||
      (formData.descriptionEn || "").trim() !== "" ||
      formData.imageUrl.trim() !== ""
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

    try {
      setIsUploading(true);
      const result = await apiService.uploadBrandImage(file);
      setFormData((prev) => ({
        ...prev,
        imageUrl: result.imageUrl,
      }));
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
    const validationErrors = validateBrandData(formData);
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
      const brandData = {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        descriptionAr: (formData.descriptionAr || "").trim(),
        descriptionEn: (formData.descriptionEn || "").trim(),
        imageUrl: formData.imageUrl.trim(),
        isActive: Boolean(formData.isActive),
        sortOrder: Number(formData.sortOrder) || 1,
      };

      let createdBrand: Brand;
      if (mode === "add") {
        createdBrand = (await apiService.createBrand(brandData)) as Brand;
      } else {
        if (!brand?._id) {
          throw new Error("معرف العلامة التجارية غير موجود");
        }
        createdBrand = (await apiService.updateBrand(
          brand._id,
          brandData
        )) as Brand;
      }

      onSuccess?.(createdBrand);
      toast({
        title: "تم بنجاح",
        description: `تم ${
          mode === "add" ? "إضافة" : "تحديث"
        } العلامة التجارية بنجاح`,
      });
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "creating" : "updating"} brand:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في ${
          mode === "add" ? "إضافة" : "تحديث"
        } العلامة التجارية: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateBrandData = (data: BrandFormData) => {
    const errors: string[] = [];

    if (!data.nameAr?.trim()) {
      errors.push("الاسم العربي مطلوب");
    }
    if (!data.nameEn?.trim()) {
      errors.push("الاسم الإنجليزي مطلوب");
    }
    if (!data.imageUrl?.trim()) {
      errors.push("صورة العلامة التجارية مطلوبة");
    }

    return errors;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, ...restProps } = props;

  return (
    <FormModal
      description={
        mode === "add"
          ? "أضف علامة تجارية جديدة للمنتجات"
          : "تعديل بيانات العلامة التجارية المحددة"
      }
      onSubmit={handleSubmit}
      submitText={mode === "add" ? "إضافة العلامة التجارية" : "حفظ التغييرات"}
      isValid={isFormValid()}
      hasChanges={hasChanges()}
      hasData={hasData()}
      isSubmitting={isSubmitting}
      mode={mode}
      icon={<Building2 className="w-5 h-5 text-purple-500" />}
      title={
        mode === "add" ? "إضافة علامة تجارية جديدة" : "تعديل العلامة التجارية"
      }
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
              placeholder="مثال: نايك"
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
              placeholder="Example: Nike"
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
              placeholder="وصف العلامة التجارية بالعربية"
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
              placeholder="Brand description in English"
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 min-h-[80px] placeholder-ltr"
              rows={3}
            />
          </div>
        </div>

        {/* الصورة */}
        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="flex items-center gap-2 text-white font-medium">
            <Image className="w-4 h-4 text-purple-400" />
            صورة العلامة التجارية
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
          </div>
        </div>
      </div>
    </FormModal>
  );
}
