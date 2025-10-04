import { useState, useEffect } from "react";
import { FormModal } from "./FormModal";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import { Button } from "./button";
import { ImageWithError } from "./ImageWithError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Package, Image, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { Product, ProductFormData } from "../../types/products";
import type { Category } from "../../types/categories";
import type { Occasion } from "../../types/occasions";
import type { Brand } from "../../types/brands";
import { validateProductData } from "../../utils/productValidation";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  product?: Product | null;
  onSuccess?: (product: Product) => void;
}

export function ProductModal({
  open,
  onOpenChange,
  mode,
  product,
  onSuccess,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    nameAr: product?.nameAr || "",
    nameEn: product?.nameEn || "",
    mainImage: product?.mainImage || "",
    additionalImages: product?.additionalImages || [],
    price: product?.price?.toString() || "",
    category: product?.category?._id || "",
    occasion: product?.occasion?._id || "",
    brand: product?.brand?._id || "",
    descriptionAr: product?.descriptionAr || "",
    descriptionEn: product?.descriptionEn || "",
    careInstructionsAr: product?.careInstructionsAr || "",
    careInstructionsEn: product?.careInstructionsEn || "",
    arrangementContentsAr: product?.arrangementContentsAr || "",
    arrangementContentsEn: product?.arrangementContentsEn || "",
    productStatus: Array.isArray(product?.productStatus)
      ? product?.productStatus || []
      : product?.productStatus
      ? [product.productStatus]
      : [],
    dimensions: {
      height: product?.dimensions?.height?.toString() || "",
      width: product?.dimensions?.width?.toString() || "",
      unit: product?.dimensions?.unit || "سم",
    },
    weight: {
      value: product?.weight?.value?.toString() || "",
      unit: product?.weight?.unit || "جرام",
    },
    metaTitleAr: product?.metaTitleAr || "",
    metaTitleEn: product?.metaTitleEn || "",
    metaDescriptionAr: product?.metaDescriptionAr || "",
    metaDescriptionEn: product?.metaDescriptionEn || "",
    targetAudience: product?.targetAudience || "",
    isActive: product?.isActive ?? true,
    showInHomePage: product?.showInHomePage ?? false,
  });

  const [originalData, setOriginalData] = useState<ProductFormData | null>(
    product ? { ...formData } : null
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // تحميل البيانات المساعدة
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, occasionsRes, brandsRes] = await Promise.all([
          apiService.getCategories(),
          apiService.getOccasions(),
          apiService.getBrands(),
        ]);

        setCategories((categoriesRes?.data || []) as Category[]);
        setOccasions((occasionsRes?.data || []) as Occasion[]);
        setBrands((brandsRes?.data || []) as Brand[]);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل البيانات المساعدة",
          variant: "destructive",
        });
      }
    };

    if (open) {
      loadData();
    }
  }, [open, toast]);

  // تحديث البيانات عند تغيير المنتج
  useEffect(() => {
    if (product) {
      const updatedFormData = {
        nameAr: product.nameAr || "",
        nameEn: product.nameEn || "",
        mainImage: product.mainImage || "",
        additionalImages: product.additionalImages || [],
        price: product.price?.toString() || "",
        category: product.category?._id || "",
        occasion: product.occasion?._id || "",
        brand: product.brand?._id || "",
        descriptionAr: product.descriptionAr || "",
        descriptionEn: product.descriptionEn || "",
        careInstructionsAr: product.careInstructionsAr || "",
        careInstructionsEn: product.careInstructionsEn || "",
        arrangementContentsAr: product.arrangementContentsAr || "",
        arrangementContentsEn: product.arrangementContentsEn || "",
        productStatus: Array.isArray(product.productStatus)
          ? product.productStatus || []
          : product.productStatus
          ? [product.productStatus]
          : [],
        dimensions: {
          height: product.dimensions?.height?.toString() || "",
          width: product.dimensions?.width?.toString() || "",
          unit: product.dimensions?.unit || "سم",
        },
        weight: {
          value: product.weight?.value?.toString() || "",
          unit: product.weight?.unit || "جرام",
        },
        metaTitleAr: product.metaTitleAr || "",
        metaTitleEn: product.metaTitleEn || "",
        metaDescriptionAr: product.metaDescriptionAr || "",
        metaDescriptionEn: product.metaDescriptionEn || "",
        targetAudience: product.targetAudience || "",
        isActive: product.isActive ?? true,
        showInHomePage: product.showInHomePage ?? false,
      };
      setFormData(updatedFormData);
      setOriginalData(updatedFormData);
    } else {
      // إعادة تعيين البيانات للوضع الإضافة
      const resetFormData = {
        nameAr: "",
        nameEn: "",
        mainImage: "",
        additionalImages: [],
        price: "",
        category: "",
        occasion: "",
        brand: "",
        descriptionAr: "",
        descriptionEn: "",
        careInstructionsAr: "",
        careInstructionsEn: "",
        arrangementContentsAr: "",
        arrangementContentsEn: "",
        productStatus: [],
        dimensions: {
          height: "",
          width: "",
          unit: "سم",
        },
        weight: {
          value: "",
          unit: "جرام",
        },
        metaTitleAr: "",
        metaTitleEn: "",
        metaDescriptionAr: "",
        metaDescriptionEn: "",
        targetAudience: "",
        isActive: true,
        showInHomePage: false,
      };
      setFormData(resetFormData);
      setOriginalData(null);
    }
  }, [product]);

  // مسح البيانات عند إغلاق النافذة
  useEffect(() => {
    if (!open) {
      if (mode === "add") {
        const resetFormData = {
          nameAr: "",
          nameEn: "",
          mainImage: "",
          additionalImages: [],
          price: "",
          category: "",
          occasion: "",
          brand: "",
          descriptionAr: "",
          descriptionEn: "",
          careInstructionsAr: "",
          careInstructionsEn: "",
          arrangementContentsAr: "",
          arrangementContentsEn: "",
          dimensions: {
            height: "",
            width: "",
            unit: "سم",
          },
          weight: {
            value: "",
            unit: "جرام",
          },
          metaTitleAr: "",
          metaTitleEn: "",
          metaDescriptionAr: "",
          metaDescriptionEn: "",
          productStatus: [],
          targetAudience: "",
          isActive: true,
          showInHomePage: false,
        };
        setFormData(resetFormData);
        setOriginalData(null);
      } else if (mode === "edit" && product) {
        // إعادة تعيين البيانات إلى القيم الأصلية عند إغلاق نافذة التعديل
        const resetFormData = {
          nameAr: product.nameAr || "",
          nameEn: product.nameEn || "",
          mainImage: product.mainImage || "",
          additionalImages: product.additionalImages || [],
          price: product.price?.toString() || "",
          category: product.category?._id || "",
          occasion: product.occasion?._id || "",
          brand: product.brand?._id || "",
          descriptionAr: product.descriptionAr || "",
          descriptionEn: product.descriptionEn || "",
          careInstructionsAr: product.careInstructionsAr || "",
          careInstructionsEn: product.careInstructionsEn || "",
          arrangementContentsAr: product.arrangementContentsAr || "",
          arrangementContentsEn: product.arrangementContentsEn || "",
          productStatus: Array.isArray(product.productStatus)
            ? product.productStatus || []
            : product.productStatus
            ? [product.productStatus]
            : [],
          dimensions: {
            height: product.dimensions?.height?.toString() || "",
            width: product.dimensions?.width?.toString() || "",
            unit: product.dimensions?.unit || "سم",
          },
          weight: {
            value: product.weight?.value?.toString() || "",
            unit: product.weight?.unit || "جرام",
          },
          metaTitleAr: product.metaTitleAr || "",
          metaTitleEn: product.metaTitleEn || "",
          metaDescriptionAr: product.metaDescriptionAr || "",
          metaDescriptionEn: product.metaDescriptionEn || "",
          targetAudience: product.targetAudience || "",
          isActive: product.isActive ?? true,
          showInHomePage: product.showInHomePage ?? false,
        };
        setFormData(resetFormData);
        setOriginalData(resetFormData);
      }
      // إعادة تعيين حالة فشل الصور
      setFailedImages(new Set());
    }
  }, [open, mode, product]);

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.nameAr !== originalData.nameAr ||
      formData.nameEn !== originalData.nameEn ||
      formData.mainImage !== originalData.mainImage ||
      formData.price !== originalData.price ||
      formData.category !== originalData.category ||
      formData.occasion !== originalData.occasion ||
      formData.brand !== originalData.brand ||
      formData.descriptionAr !== originalData.descriptionAr ||
      formData.descriptionEn !== originalData.descriptionEn ||
      formData.careInstructionsAr !== originalData.careInstructionsAr ||
      formData.careInstructionsEn !== originalData.careInstructionsEn ||
      formData.arrangementContentsAr !== originalData.arrangementContentsAr ||
      formData.arrangementContentsEn !== originalData.arrangementContentsEn ||
      JSON.stringify(formData.productStatus) !==
        JSON.stringify(originalData.productStatus) ||
      formData.targetAudience !== originalData.targetAudience ||
      formData.isActive !== originalData.isActive ||
      formData.showInHomePage !== originalData.showInHomePage ||
      JSON.stringify(formData.additionalImages) !==
        JSON.stringify(originalData.additionalImages)
    );
  };

  const hasData = () => {
    return (
      formData.nameAr.trim() !== "" ||
      formData.nameEn.trim() !== "" ||
      formData.mainImage.trim() !== "" ||
      formData.price.trim() !== "" ||
      formData.category !== "" ||
      formData.occasion !== "" ||
      formData.brand !== "" ||
      formData.descriptionAr.trim() !== "" ||
      formData.descriptionEn.trim() !== "" ||
      formData.careInstructionsAr.trim() !== "" ||
      formData.careInstructionsEn.trim() !== "" ||
      formData.arrangementContentsAr.trim() !== "" ||
      formData.arrangementContentsEn.trim() !== "" ||
      formData.productStatus.length > 0 ||
      formData.targetAudience !== "" ||
      formData.additionalImages.some((img) => img.trim() !== "")
    );
  };

  const isFormValid = () => {
    const hasNameAr = formData.nameAr.trim() !== "";
    const hasNameEn = formData.nameEn.trim() !== "";
    const hasMainImage = formData.mainImage.trim() !== "";
    const hasPrice =
      formData.price.trim() !== "" &&
      !isNaN(Number(formData.price)) &&
      Number(formData.price) > 0;
    const hasCategory = formData.category !== "";
    const hasOccasion = formData.occasion !== "";
    const hasBrand = formData.brand !== "";
    const hasProductStatus = formData.productStatus.length > 0;
    const hasTargetAudience = formData.targetAudience !== "";

    return (
      hasNameAr &&
      hasNameEn &&
      hasMainImage &&
      hasPrice &&
      hasCategory &&
      hasOccasion &&
      hasBrand &&
      hasProductStatus &&
      hasTargetAudience
    );
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
    imageIndex: number,
    isMainImage = false
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
      const result = await apiService.uploadProductImage(file);

      if (isMainImage) {
        setFormData({ ...formData, mainImage: result.imageUrl });
      } else {
        const updatedImages = [...formData.additionalImages];
        updatedImages[imageIndex] = result.imageUrl;
        setFormData({ ...formData, additionalImages: updatedImages });
      }

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
      additionalImages: [...formData.additionalImages, ""],
    });
    // إعادة تعيين حالة فشل الصور عند إضافة صورة جديدة
    setFailedImages(new Set());
  };

  const removeImageField = (index: number) => {
    if (formData.additionalImages.length > 0) {
      setFormData({
        ...formData,
        additionalImages: formData.additionalImages.filter(
          (_, i) => i !== index
        ),
      });
    }
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...formData.additionalImages];
    newImages[index] = value;
    setFormData({
      ...formData,
      additionalImages: newImages,
    });
    // إعادة تعيين حالة فشل الصورة عند تغيير الرابط
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleSubmit = async () => {
    const validationErrors = validateProductData(formData);
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
      const validAdditionalImages = formData.additionalImages.filter(
        (img) => img.trim() !== ""
      );
      const productData = {
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        mainImage: formData.mainImage.trim(),
        additionalImages: validAdditionalImages,
        price: Number(formData.price),
        category: formData.category,
        occasion: formData.occasion,
        brand: formData.brand,
        descriptionAr: formData.descriptionAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        careInstructionsAr: formData.careInstructionsAr.trim(),
        careInstructionsEn: formData.careInstructionsEn.trim(),
        arrangementContentsAr: formData.arrangementContentsAr.trim(),
        arrangementContentsEn: formData.arrangementContentsEn.trim(),
        dimensions: {
          height: formData.dimensions.height
            ? parseFloat(formData.dimensions.height)
            : undefined,
          width: formData.dimensions.width
            ? parseFloat(formData.dimensions.width)
            : undefined,
          unit: formData.dimensions.unit,
        },
        weight: {
          value: formData.weight.value
            ? parseFloat(formData.weight.value)
            : undefined,
          unit: formData.weight.unit,
        },
        metaTitleAr: formData.metaTitleAr.trim(),
        metaTitleEn: formData.metaTitleEn.trim(),
        metaDescriptionAr: formData.metaDescriptionAr.trim(),
        metaDescriptionEn: formData.metaDescriptionEn.trim(),
        productStatus: formData.productStatus,
        targetAudience: formData.targetAudience,
        isActive: Boolean(formData.isActive),
        showInHomePage: Boolean(formData.showInHomePage),
      };

      let createdProduct: Product;
      if (mode === "add") {
        createdProduct = (await apiService.createProduct(
          productData
        )) as Product;
      } else {
        if (!product?._id) {
          throw new Error("معرف المنتج غير موجود");
        }
        createdProduct = (await apiService.updateProduct(
          product._id,
          productData
        )) as Product;
      }

      onSuccess?.(createdProduct);
      toast({
        title: "تم بنجاح",
        description: `تم ${mode === "add" ? "إضافة" : "تحديث"} المنتج بنجاح`,
      });
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "creating" : "updating"} product:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في ${
          mode === "add" ? "إضافة" : "تحديث"
        } المنتج: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "add" ? "إضافة منتج جديد" : "تعديل المنتج"}
      description={
        mode === "add"
          ? "أضف منتج جديد إلى المتجر"
          : "تعديل بيانات المنتج المحدد"
      }
      size="full"
      onSubmit={handleSubmit}
      submitText={mode === "add" ? "إضافة المنتج" : "حفظ التغييرات"}
      isValid={isFormValid()}
      hasChanges={hasChanges()}
      hasData={hasData()}
      isSubmitting={isSubmitting}
      mode={mode}
      icon={<Package className="w-5 h-5 text-purple-500" />}
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
              placeholder="أدخل اسم المنتج بالعربية"
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
              placeholder="Enter product name in English"
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 placeholder-ltr"
            />
          </div>
        </div>

        {/* الصورة الأساسية */}
        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="flex items-center gap-2 text-white font-medium">
            <Image className="w-4 h-4 text-purple-400" />
            الصورة الأساسية
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={formData.mainImage}
                onChange={(e) =>
                  setFormData({ ...formData, mainImage: e.target.value })
                }
                placeholder="رابط الصورة الأساسية أو ارفع صورة"
                className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
              />
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, -1, true)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="main-image-upload"
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
            </div>
            {uploadingImages.has(-1) ? (
              <div className="mt-2 flex items-center justify-center w-20 h-20 bg-gray-800 rounded border">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-xs text-gray-400">جاري الرفع...</span>
                </div>
              </div>
            ) : formData.mainImage ? (
              <div className="mt-2">
                <ImageWithError
                  src={formData.mainImage}
                  alt="معاينة الصورة الأساسية"
                  className="w-20 h-20 object-cover rounded border"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* الصور الإضافية */}
        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="flex items-center gap-2 text-white font-medium">
            <Image className="w-4 h-4 text-purple-400" />
            الصور الإضافية
          </Label>
          {formData.additionalImages.map((image, index) => (
            <div
              key={`additional-image-${index}-${image}`}
              className="space-y-2"
            >
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
                    id={`additional-image-upload-${index}`}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImageField(index)}
                  className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 shadow-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {uploadingImages.has(index) ? (
                <div className="mt-2 flex items-center justify-center w-20 h-20 bg-gray-800 rounded border">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
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
                    <ImageWithError
                      src={image}
                      alt={`معاينة الصورة الإضافية ${index + 1}`}
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

        {/* السعر والعلاقات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white font-medium">
              السعر *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0.00"
              className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-white font-medium">
              الفئة *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-white">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion" className="text-white font-medium">
              المناسبة *
            </Label>
            <Select
              value={formData.occasion}
              onValueChange={(value) =>
                setFormData({ ...formData, occasion: value })
              }
            >
              <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-white">
                <SelectValue placeholder="اختر المناسبة" />
              </SelectTrigger>
              <SelectContent>
                {occasions.map((occasion) => (
                  <SelectItem key={occasion._id} value={occasion._id}>
                    {occasion.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-white font-medium">
              العلامة التجارية *
            </Label>
            <Select
              value={formData.brand}
              onValueChange={(value) =>
                setFormData({ ...formData, brand: value })
              }
            >
              <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-white">
                <SelectValue placeholder="اختر العلامة التجارية" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* حالة المنتج والجمهور المستهدف */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productStatus" className="text-white font-medium">
              حالة المنتج *
            </Label>
            <Select
              value={formData.productStatus[0] || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, productStatus: [value] })
              }
            >
              <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-white">
                <SelectValue placeholder="اختر حالة المنتج" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الأكثر مبيعًا">الأكثر مبيعًا</SelectItem>
                <SelectItem value="المجموعات المميزة">
                  المجموعات المميزة
                </SelectItem>
                <SelectItem value="هدايا فاخرة">هدايا فاخرة</SelectItem>
                <SelectItem value="مناسبة خاصة">مناسبة خاصة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-white font-medium">
              الجمهور المستهدف *
            </Label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) =>
                setFormData({ ...formData, targetAudience: value })
              }
            >
              <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-white">
                <SelectValue placeholder="اختر الجمهور المستهدف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="له">له</SelectItem>
                <SelectItem value="لها">لها</SelectItem>
                <SelectItem value="لكابلز">لكابلز</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* الأوصاف */}
        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="text-white font-medium">أوصاف المنتج</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descriptionAr" className="text-sm text-gray-400">
                الوصف بالعربية
              </Label>
              <textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionAr: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 resize-none"
                rows={4}
                placeholder="أدخل وصف المنتج بالعربية"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn" className="text-sm text-gray-400">
                الوصف بالإنجليزية
              </Label>
              <textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 resize-none"
                rows={4}
                placeholder="Enter product description in English"
              />
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
          <Label className="text-white font-medium">معلومات إضافية</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="careInstructions"
                className="text-sm text-gray-400"
              >
                نصائح العناية
              </Label>
              <textarea
                id="careInstructions"
                value={formData.careInstructionsAr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    careInstructionsAr: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 resize-none"
                rows={3}
                placeholder="أدخل نصائح العناية بالمنتج"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="arrangementContents"
                className="text-sm text-gray-400"
              >
                محتويات التنسيق
              </Label>
              <textarea
                id="arrangementContents"
                value={formData.arrangementContentsAr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    arrangementContentsAr: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 resize-none"
                rows={3}
                placeholder="أدخل محتويات التنسيق"
              />
            </div>
          </div>
        </div>

        {/* خيارات العرض */}
        <div className="flex items-center justify-end gap-6">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            <Label
              htmlFor="showInHomePage"
              className="order-2 text-white font-medium"
            >
              عرض في الصفحة الرئيسية
            </Label>
            <Switch
              id="showInHomePage"
              checked={formData.showInHomePage}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showInHomePage: checked })
              }
              className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
            />
          </div>
        </div>
      </div>
    </FormModal>
  );
}
