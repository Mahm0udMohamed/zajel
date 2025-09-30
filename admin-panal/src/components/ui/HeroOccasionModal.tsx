import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import { DatePicker } from "./DatePicker";
import { FormModal, type FormModalProps } from "./FormModal";
import { Plus, Trash2, Upload, Loader2, Image } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { HeroOccasion, HeroOccasionFormData } from "../../types/hero";

export interface HeroOccasionModalProps
  extends Omit<FormModalProps, "children"> {
  occasion?: HeroOccasion | null;
  onSuccess?: (occasion: HeroOccasion) => void;
  mode: "add" | "edit";
}

export function HeroOccasionModal({
  occasion,
  onSuccess,
  mode,
  ...props
}: HeroOccasionModalProps) {
  const [formData, setFormData] = useState<HeroOccasionFormData>({
    nameAr: occasion?.nameAr || "",
    nameEn: occasion?.nameEn || "",
    startDate: occasion?.startDate
      ? new Date(occasion.startDate).toISOString().split("T")[0]
      : "",
    endDate: occasion?.endDate
      ? new Date(occasion.endDate).toISOString().split("T")[0]
      : "",
    images: occasion?.images || [""],
    celebratoryMessageAr: occasion?.celebratoryMessageAr || "",
    celebratoryMessageEn: occasion?.celebratoryMessageEn || "",
    isActive: occasion?.isActive ?? true,
  });

  const [originalData, setOriginalData] = useState<HeroOccasionFormData | null>(
    occasion ? { ...formData } : null
  );

  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // تحديث البيانات عند تغيير occasion
  useEffect(() => {
    if (occasion) {
      const updatedFormData = {
        nameAr: occasion.nameAr || "",
        nameEn: occasion.nameEn || "",
        startDate: occasion.startDate
          ? new Date(occasion.startDate).toISOString().split("T")[0]
          : "",
        endDate: occasion.endDate
          ? new Date(occasion.endDate).toISOString().split("T")[0]
          : "",
        images: occasion.images || [""],
        celebratoryMessageAr: occasion.celebratoryMessageAr || "",
        celebratoryMessageEn: occasion.celebratoryMessageEn || "",
        isActive: occasion.isActive ?? true,
      };
      setFormData(updatedFormData);
      setOriginalData(updatedFormData);
    } else {
      // إعادة تعيين البيانات للوضع الإضافة
      const resetFormData = {
        nameAr: "",
        nameEn: "",
        startDate: "",
        endDate: "",
        images: [""],
        celebratoryMessageAr: "",
        celebratoryMessageEn: "",
        isActive: true,
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
          startDate: "",
          endDate: "",
          images: [""],
          celebratoryMessageAr: "",
          celebratoryMessageEn: "",
          isActive: true,
        };
        setFormData(resetFormData);
        setOriginalData(null);
      } else if (mode === "edit" && occasion) {
        // إعادة تعيين البيانات إلى القيم الأصلية عند إغلاق نافذة التعديل
        const resetFormData = {
          nameAr: occasion.nameAr || "",
          nameEn: occasion.nameEn || "",
          startDate: occasion.startDate
            ? new Date(occasion.startDate).toISOString().split("T")[0]
            : "",
          endDate: occasion.endDate
            ? new Date(occasion.endDate).toISOString().split("T")[0]
            : "",
          images: occasion.images || [""],
          celebratoryMessageAr: occasion.celebratoryMessageAr || "",
          celebratoryMessageEn: occasion.celebratoryMessageEn || "",
          isActive: occasion.isActive ?? true,
        };
        setFormData(resetFormData);
        setOriginalData(resetFormData);
      }
      // إعادة تعيين حالة فشل الصور
      setFailedImages(new Set());
    }
  }, [props.open, mode, occasion]);

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.nameAr !== originalData.nameAr ||
      formData.nameEn !== originalData.nameEn ||
      formData.startDate !== originalData.startDate ||
      formData.endDate !== originalData.endDate ||
      formData.celebratoryMessageAr !== originalData.celebratoryMessageAr ||
      formData.celebratoryMessageEn !== originalData.celebratoryMessageEn ||
      formData.isActive !== originalData.isActive ||
      JSON.stringify(formData.images) !== JSON.stringify(originalData.images)
    );
  };

  const hasData = () => {
    return (
      formData.nameAr.trim() !== "" ||
      formData.nameEn.trim() !== "" ||
      formData.startDate !== "" ||
      formData.endDate !== "" ||
      formData.celebratoryMessageAr.trim() !== "" ||
      formData.celebratoryMessageEn.trim() !== "" ||
      formData.images.some((img) => img.trim() !== "")
    );
  };

  const isFormValid = () => {
    const hasNameAr = formData.nameAr.trim() !== "";
    const hasNameEn = formData.nameEn.trim() !== "";
    const hasStartDate = formData.startDate !== "";
    const hasEndDate = formData.endDate !== "";
    const hasValidImages = formData.images.some((img) => img.trim() !== "");

    // التحقق من أن تاريخ الانتهاء بعد أو يساوي تاريخ البداية
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const isDateRangeValid = hasStartDate && hasEndDate && endDate >= startDate;

    return hasNameAr && hasNameEn && isDateRangeValid && hasValidImages;
  };

  const handleImageError = (imageIndex: number) => {
    setFailedImages((prev) => new Set(prev).add(imageIndex));
  };

  const handleImageLoad = (imageIndex: number) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageIndex);
      return newSet;
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageIndex: number
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

    setUploadingImages((prev) => new Set(prev).add(imageIndex));

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "https://localhost:3002/api"
        }/hero-occasions/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiService.getAccessToken()}`,
          },
          body: uploadFormData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const cloudinaryUrl = data.secure_url;

        const updatedImages = [...formData.images];
        updatedImages[imageIndex] = cloudinaryUrl;
        setFormData({ ...formData, images: updatedImages });

        toast({
          title: "تم رفع الصورة",
          description: "تم رفع الصورة بنجاح",
        });
      } else {
        throw new Error("فشل في رفع الصورة");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploadingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageIndex);
        return newSet;
      });
    }
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ""],
    });
    // إعادة تعيين حالة فشل الصور عند إضافة صورة جديدة
    setFailedImages(new Set());
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index),
      });
    }
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages,
    });
    // إعادة تعيين حالة فشل الصورة عند تغيير الرابط
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
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
      const validImages = formData.images.filter((img) => img.trim() !== "");
      const occasionData = {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        images: validImages,
        celebratoryMessageAr: formData.celebratoryMessageAr.trim(),
        celebratoryMessageEn: formData.celebratoryMessageEn.trim(),
        isActive: Boolean(formData.isActive),
      };

      let createdOccasion: HeroOccasion;
      if (mode === "add") {
        createdOccasion = (await apiService.createHeroOccasion(
          occasionData
        )) as HeroOccasion;
      } else {
        if (!occasion?._id) {
          throw new Error("معرف المناسبة غير موجود");
        }
        createdOccasion = (await apiService.updateHeroOccasion(
          occasion._id,
          occasionData
        )) as HeroOccasion;
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

  const validateOccasionData = (data: HeroOccasionFormData) => {
    const errors: string[] = [];

    if (!data.nameAr?.trim()) {
      errors.push("الاسم العربي مطلوب");
    }
    if (!data.nameEn?.trim()) {
      errors.push("الاسم الإنجليزي مطلوب");
    }
    if (!data.startDate) {
      errors.push("تاريخ بداية المناسبة مطلوب");
    } else {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push("تاريخ بداية المناسبة غير صحيح");
      }
    }

    if (!data.endDate) {
      errors.push("تاريخ انتهاء المناسبة مطلوب");
    } else {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push("تاريخ انتهاء المناسبة غير صحيح");
      }
    }

    // التحقق من أن تاريخ الانتهاء بعد أو يساوي تاريخ البداية
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (endDate < startDate) {
        errors.push("تاريخ الانتهاء يجب أن يكون بعد أو يساوي تاريخ البداية");
      }
    }

    const validImages = data.images.filter((img) => img.trim() !== "");
    if (validImages.length === 0) {
      errors.push("يجب إضافة صورة واحدة على الأقل");
    }

    for (const image of validImages) {
      if (image.startsWith("data:image")) {
        if (!image.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
          errors.push(
            "تنسيق الصورة غير مدعوم. يرجى استخدام JPG, PNG, GIF, أو WebP"
          );
          break;
        }
      } else if (image.startsWith("http")) {
        try {
          new URL(image);
        } catch {
          errors.push("جميع الصور يجب أن تكون روابط صحيحة");
          break;
        }
      } else {
        errors.push("تنسيق الصورة غير صحيح");
        break;
      }
    }

    if (!data.celebratoryMessageAr?.trim()) {
      errors.push("الرسالة التهنئة العربية مطلوبة");
    }
    if (!data.celebratoryMessageEn?.trim()) {
      errors.push("الرسالة التهنئة الإنجليزية مطلوبة");
    }

    return errors;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, ...restProps } = props;

  return (
    <FormModal
      description={
        mode === "add"
          ? "أضف مناسبة جديدة للعرض في شريحة الهيرو"
          : "تعديل بيانات المناسبة المحددة"
      }
      onSubmit={handleSubmit}
      submitText={mode === "add" ? "إضافة المناسبة" : "حفظ التغييرات"}
      isValid={isFormValid()}
      hasChanges={hasChanges()}
      hasData={hasData()}
      isSubmitting={isSubmitting}
      mode={mode}
      icon={<Image className="w-5 h-5 text-blue-500" />}
      title={mode === "add" ? "إضافة مناسبة جديدة" : "تعديل المناسبة"}
      {...restProps}
    >
      <div className="grid gap-6">
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
              placeholder="مثال: عيد الفطر"
              className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
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
              placeholder="Example: Eid Fitr"
              className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 placeholder-ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label="تاريخ بداية المناسبة"
            value={formData.startDate}
            onChange={(value) => setFormData({ ...formData, startDate: value })}
            placeholder="اختر تاريخ البداية"
            required
            className="w-full"
          />
          <DatePicker
            label="تاريخ انتهاء المناسبة"
            value={formData.endDate}
            onChange={(value) => setFormData({ ...formData, endDate: value })}
            placeholder="اختر تاريخ الانتهاء"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="text-white font-medium">رسائل التهنئة</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="celebratoryMessageAr"
                className="text-sm text-gray-400"
              >
                الرسالة بالعربية
              </Label>
              <Input
                id="celebratoryMessageAr"
                value={formData.celebratoryMessageAr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    celebratoryMessageAr: e.target.value,
                  })
                }
                placeholder="مثال: عيد فطر مبارك!"
                className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="celebratoryMessageEn"
                className="text-sm text-gray-400"
              >
                الرسالة بالإنجليزية
              </Label>
              <Input
                id="celebratoryMessageEn"
                value={formData.celebratoryMessageEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    celebratoryMessageEn: e.target.value,
                  })
                }
                placeholder="Example: Eid Fitr Mubarak!"
                className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 placeholder-ltr"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="flex items-center gap-2 text-white font-medium">
            <Image className="w-4 h-4 text-blue-400" />
            صور المناسبة
          </Label>
          {formData.images.map((image, index) => (
            <div key={`image-${index}-${image}`} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={image}
                  onChange={(e) => updateImageField(index, e.target.value)}
                  placeholder="رابط الصورة أو ارفع صورة"
                  className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                />
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id={`image-upload-${index}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20"
                  >
                    <Upload className="w-4 h-4" />
                    رفع
                  </Button>
                </div>
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageField(index)}
                    className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {uploadingImages.has(index) ? (
                <div className="mt-2 flex items-center justify-center w-20 h-20 bg-gray-800 rounded border">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-xs text-gray-400">جاري الرفع...</span>
                  </div>
                </div>
              ) : image ? (
                <div className="mt-2">
                  {failedImages.has(index) ? (
                    <div className="w-20 h-20 bg-gray-800 rounded border flex items-center justify-center">
                      <div className="text-center px-1">
                        <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mx-auto mb-1" />
                        <span className="text-[10px] xs:text-xs text-gray-500 leading-tight">
                          صورة غير صحيحة
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={`معاينة الصورة ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                      onError={() => handleImageError(index)}
                      onLoad={() => handleImageLoad(index)}
                    />
                  )}
                </div>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageField}
            className="w-full bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 shadow-purple-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة صورة أخرى
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Label htmlFor="isActive" className="order-2 text-white font-medium">
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
    </FormModal>
  );
}
