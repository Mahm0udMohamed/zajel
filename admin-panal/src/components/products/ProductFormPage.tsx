import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ImageWithError } from "../ui/ImageWithError";
import {
  Package,
  Image,
  Upload,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  FileText,
  Eye,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { Product, ProductFormData } from "../../types/products";

interface Category {
  _id: string;
  nameAr: string;
  nameEn: string;
}

interface Occasion {
  _id: string;
  nameAr: string;
  nameEn: string;
}

interface Brand {
  _id: string;
  nameAr: string;
  nameEn: string;
}

interface ProductFormPageProps {
  mode: "add" | "edit";
  product?: Product | null;
  onCancel: () => void;
  onSuccess: (product: Product) => void;
}

const validateProductData = (data: ProductFormData) => {
  const errors: string[] = [];

  if (!data.nameAr?.trim()) {
    errors.push("الاسم العربي مطلوب");
  }
  if (!data.nameEn?.trim()) {
    errors.push("الاسم الإنجليزي مطلوب");
  }
  if (!data.mainImage?.trim()) {
    errors.push("الصورة الأساسية مطلوبة");
  }
  if (
    !data.price?.trim() ||
    isNaN(Number(data.price)) ||
    Number(data.price) <= 0
  ) {
    errors.push("السعر يجب أن يكون رقماً صحيحاً أكبر من صفر");
  }
  if (!data.category) {
    errors.push("الفئة مطلوبة");
  }
  if (!data.occasion) {
    errors.push("المناسبة مطلوبة");
  }
  if (!data.brand) {
    errors.push("العلامة التجارية مطلوبة");
  }
  if (!data.productStatus) {
    errors.push("حالة المنتج مطلوبة");
  }
  if (!data.targetAudience) {
    errors.push("الجمهور المستهدف مطلوب");
  }

  return errors;
};

export default function ProductFormPage({
  mode,
  product,
  onCancel,
  onSuccess,
}: ProductFormPageProps) {
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
    careInstructions: product?.careInstructions || "",
    arrangementContents: product?.arrangementContents || "",
    productStatus: product?.productStatus || "",
    targetAudience: product?.targetAudience || "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    showInHomePage: product?.showInHomePage ?? false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const { toast } = useToast();

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

    loadData();
  }, [toast]);

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
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateProductData(formData);
    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في التحقق",
        description: validationErrors.join("، "),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
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
        careInstructions: formData.careInstructions.trim(),
        arrangementContents: formData.arrangementContents.trim(),
        productStatus: formData.productStatus,
        targetAudience: formData.targetAudience,
        isActive: Boolean(formData.isActive),
        isFeatured: Boolean(formData.isFeatured),
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

      onSuccess(createdProduct);
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
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                {mode === "add" ? "إضافة منتج جديد" : "تعديل المنتج"}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                {mode === "add"
                  ? "أضف منتج جديد إلى المتجر"
                  : "تعديل بيانات المنتج المحدد"}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onCancel}>
              <ArrowRight className="w-4 h-4 mr-2" />
              العودة للقائمة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* تخطيط متجاوب للشاشات المختلفة */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
              {/* العمود الأيسر - إدارة الصور وإعدادات العرض */}
              <div className="xl:col-span-1 space-y-4 md:space-y-6 order-2 xl:order-2">
                {/* إدارة الصور */}
                <div className="space-y-4 p-4 md:p-6 bg-black/20 rounded-lg border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">إدارة الصور</h3>
                      <p className="text-sm text-gray-400">
                        ارفع وأدر صور المنتج
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">
                        الصورة الأساسية *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.mainImage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mainImage: e.target.value,
                            })
                          }
                          placeholder="رابط الصورة الأساسية"
                          className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                          required
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
                            className="bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 shadow-purple-500/20"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {uploadingImages.has(-1) ? (
                        <div className="flex items-center justify-center w-full h-24 md:h-32 bg-gray-800 rounded border">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            <span className="text-xs text-gray-400">
                              جاري الرفع...
                            </span>
                          </div>
                        </div>
                      ) : formData.mainImage ? (
                        <ImageWithError
                          src={formData.mainImage}
                          alt="معاينة الصورة الأساسية"
                          className="w-full h-24 md:h-32 object-cover rounded border"
                        />
                      ) : null}
                    </div>

                    {formData.additionalImages.map((image, index) => (
                      <div
                        key={`additional-image-${index}-${image}`}
                        className="space-y-2"
                      >
                        <div className="flex gap-2">
                          <Input
                            value={image}
                            onChange={(e) =>
                              updateImageField(index, e.target.value)
                            }
                            placeholder="رابط الصورة"
                            className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                          />
                          <div className="relative group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, index)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 shadow-purple-500/20"
                            >
                              <Upload className="w-4 h-4" />
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
                          <div className="flex items-center justify-center w-full h-16 md:h-20 bg-gray-800 rounded border">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          </div>
                        ) : image ? (
                          <div>
                            {failedImages.has(index) ? (
                              <div className="w-full h-16 md:h-20 bg-gray-800 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  صورة غير صحيحة
                                </span>
                              </div>
                            ) : (
                              <ImageWithError
                                src={image}
                                alt={`معاينة الصورة ${index + 1}`}
                                className="w-full h-16 md:h-20 object-cover rounded border"
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
                      إضافة صورة
                    </Button>
                  </div>
                </div>

                {/* إعدادات العرض */}
                <div className="space-y-4 p-4 md:p-6 bg-black/20 rounded-lg border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        إعدادات العرض
                      </h3>
                      <p className="text-sm text-gray-400">
                        تحكم في كيفية عرض المنتج للعملاء
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                        className="data-[state=checked]:bg-green-600 shadow-green-500/20"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="isActive"
                          className="text-sm font-medium text-white cursor-pointer"
                        >
                          نشط
                        </Label>
                        <p className="text-xs text-gray-400">
                          عرض المنتج للعملاء
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                      <Switch
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isFeatured: checked })
                        }
                        className="data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="isFeatured"
                          className="text-sm font-medium text-white cursor-pointer"
                        >
                          منتج مميز
                        </Label>
                        <p className="text-xs text-gray-400">
                          عرض في المنتجات المميزة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                      <Switch
                        id="showInHomePage"
                        checked={formData.showInHomePage}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, showInHomePage: checked })
                        }
                        className="data-[state=checked]:bg-blue-600 shadow-blue-500/20"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="showInHomePage"
                          className="text-sm font-medium text-white cursor-pointer"
                        >
                          الصفحة الرئيسية
                        </Label>
                        <p className="text-xs text-gray-400">
                          عرض في الصفحة الرئيسية
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* العمود الأيمن - المعلومات الأساسية والمحتوى */}
              <div className="xl:col-span-2 space-y-4 md:space-y-6 order-1 xl:order-1">
                {/* المعلومات الأساسية */}
                <div className="space-y-4 p-4 md:p-6 bg-black/20 rounded-lg border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        المعلومات الأساسية
                      </h3>
                      <p className="text-sm text-gray-400">
                        أدخل اسم المنتج والسعر والتصنيفات
                      </p>
                    </div>
                  </div>

                  {/* الأسماء */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nameAr" className="text-sm text-gray-400">
                        الاسم بالعربية *
                      </Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) =>
                          setFormData({ ...formData, nameAr: e.target.value })
                        }
                        placeholder="أدخل اسم المنتج بالعربية"
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameEn" className="text-sm text-gray-400">
                        الاسم بالإنجليزية *
                      </Label>
                      <Input
                        id="nameEn"
                        value={formData.nameEn}
                        onChange={(e) =>
                          setFormData({ ...formData, nameEn: e.target.value })
                        }
                        placeholder="Enter product name in English"
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 placeholder-ltr"
                        required
                      />
                    </div>
                  </div>

                  {/* السعر والتصنيفات */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">السعر *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="0.00"
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">الفئة *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
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
                      <Label className="text-sm text-gray-400">
                        المناسبة *
                      </Label>
                      <Select
                        value={formData.occasion}
                        onValueChange={(value) =>
                          setFormData({ ...formData, occasion: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
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
                      <Label className="text-sm text-gray-400">
                        العلامة التجارية *
                      </Label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) =>
                          setFormData({ ...formData, brand: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">
                        حالة المنتج *
                      </Label>
                      <Select
                        value={formData.productStatus}
                        onValueChange={(value) =>
                          setFormData({ ...formData, productStatus: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="اختر حالة المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="الأكثر مبيعًا">
                            الأكثر مبيعًا
                          </SelectItem>
                          <SelectItem value="المجموعات المميزة">
                            المجموعات المميزة
                          </SelectItem>
                          <SelectItem value="هدايا فاخرة">
                            هدايا فاخرة
                          </SelectItem>
                          <SelectItem value="مناسبة خاصة">
                            مناسبة خاصة
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">
                        الجمهور المستهدف *
                      </Label>
                      <Select
                        value={formData.targetAudience}
                        onValueChange={(value) =>
                          setFormData({ ...formData, targetAudience: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
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
                </div>

                {/* الأوصاف والمحتوى */}
                <div className="space-y-4 p-4 md:p-6 bg-black/20 rounded-lg border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        المحتوى والأوصاف
                      </h3>
                      <p className="text-sm text-gray-400">
                        أضف أوصاف المنتج والمعلومات التفصيلية
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">
                        الوصف بالعربية
                      </Label>
                      <Textarea
                        value={formData.descriptionAr}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descriptionAr: e.target.value,
                          })
                        }
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                        rows={4}
                        placeholder="أدخل وصف المنتج بالعربية"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">
                        الوصف بالإنجليزية
                      </Label>
                      <Textarea
                        value={formData.descriptionEn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descriptionEn: e.target.value,
                          })
                        }
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 placeholder-ltr"
                        rows={4}
                        placeholder="Enter product description in English"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">
                        نصائح العناية
                      </Label>
                      <Textarea
                        value={formData.careInstructions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            careInstructions: e.target.value,
                          })
                        }
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                        rows={3}
                        placeholder="أدخل نصائح العناية بالمنتج"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-400">
                        محتويات التنسيق
                      </Label>
                      <Textarea
                        value={formData.arrangementContents}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            arrangementContents: e.target.value,
                          })
                        }
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                        rows={3}
                        placeholder="أدخل محتويات التنسيق"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 md:pt-6 border-t border-gray-800/50">
              <Button type="button" variant="outline" onClick={onCancel}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading
                  ? "جاري الحفظ..."
                  : mode === "add"
                  ? "إضافة المنتج"
                  : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
