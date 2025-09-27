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
  Plus,
  Edit,
  Trash2,
  Calendar,
  Image,
  Upload,
  Loader2,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { HeroOccasion, HeroOccasionFormData } from "../../types/hero";

export default function HeroOccasionsTab() {
  const [occasions, setOccasions] = useState<HeroOccasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newOccasion, setNewOccasion] = useState<HeroOccasionFormData>({
    nameAr: "",
    nameEn: "",
    date: "",
    images: [""],
    celebratoryMessageAr: "",
    celebratoryMessageEn: "",
    isActive: true,
  });
  const [originalOccasion, setOriginalOccasion] =
    useState<HeroOccasionFormData | null>(null);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );

  const { toast } = useToast();

  // تحميل البيانات من الباك إند
  const loadOccasions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHeroOccasions();

      // معالجة مبسطة للاستجابة
      if (Array.isArray(response)) {
        setOccasions(response as HeroOccasion[]);
      } else {
        console.warn("Unexpected response format:", response);
        setOccasions([]);
      }
    } catch (error) {
      console.error("Error loading occasions:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المناسبات",
        variant: "destructive",
      });
      setOccasions([]);
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند بدء المكون
  useEffect(() => {
    loadOccasions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageIndex: number
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

      // إضافة مؤشر التحميل
      setUploadingImages((prev) => new Set(prev).add(imageIndex));

      // إرسال الصورة إلى الباك اند لرفعها إلى Cloudinary
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "https://localhost:3002/api"
          }/hero-occasions/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiService.getAccessToken()}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const cloudinaryUrl = data.secure_url;

          // تحديث الصورة بالرابط من Cloudinary
          const updatedImages = [...newOccasion.images];
          updatedImages[imageIndex] = cloudinaryUrl;
          setNewOccasion({ ...newOccasion, images: updatedImages });

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
        // إزالة مؤشر التحميل
        setUploadingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(imageIndex);
          return newSet;
        });
      }
    }
  };

  const resetForm = () => {
    setNewOccasion({
      nameAr: "",
      nameEn: "",
      date: "",
      images: [""],
      celebratoryMessageAr: "",
      celebratoryMessageEn: "",
      isActive: true,
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingId(null);
    setOriginalOccasion(null);
  };

  const handleAddClick = () => {
    resetForm(); // مسح البيانات قبل فتح نافذة الإضافة
    setIsAddOpen(true);
  };

  const handleEditClose = () => {
    resetForm(); // مسح البيانات عند إغلاق نافذة التعديل
    setIsEditOpen(false);
    setEditingId(null);
    setOriginalOccasion(null);
  };

  const handleDeleteClick = (id: string) => {
    if (!id) {
      toast({
        title: "خطأ",
        description: "معرف المناسبة غير صحيح",
        variant: "destructive",
      });
      return;
    }
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) {
      toast({
        title: "خطأ",
        description: "معرف المناسبة غير صحيح",
        variant: "destructive",
      });
      return;
    }

    // حفظ البيانات الأصلية للتراجع في حالة الخطأ
    const originalOccasions = [...occasions];
    const occasionToDelete = occasions.find((occ) => occ._id === deletingId);

    if (!occasionToDelete) {
      toast({
        title: "خطأ",
        description: "المناسبة غير موجودة",
        variant: "destructive",
      });
      return;
    }

    try {
      // إزالة المناسبة محلياً فوراً لتحسين تجربة المستخدم
      setOccasions((prevOccasions) =>
        prevOccasions.filter((occ) => occ._id !== deletingId)
      );

      // إرسال طلب الحذف إلى الباك إند
      await apiService.deleteHeroOccasion(deletingId);

      toast({
        title: "تم الحذف",
        description: "تم حذف المناسبة بنجاح",
      });
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting occasion:", error);

      // إعادة البيانات الأصلية في حالة الخطأ
      setOccasions(originalOccasions);

      toast({
        title: "خطأ",
        description: "فشل في حذف المناسبة",
        variant: "destructive",
      });
    }
  };

  const hasChanges = () => {
    if (!originalOccasion) return false;

    return (
      newOccasion.nameAr !== originalOccasion.nameAr ||
      newOccasion.nameEn !== originalOccasion.nameEn ||
      newOccasion.date !== originalOccasion.date ||
      newOccasion.celebratoryMessageAr !==
        originalOccasion.celebratoryMessageAr ||
      newOccasion.celebratoryMessageEn !==
        originalOccasion.celebratoryMessageEn ||
      newOccasion.isActive !== originalOccasion.isActive ||
      JSON.stringify(newOccasion.images) !==
        JSON.stringify(originalOccasion.images)
    );
  };

  const hasData = () => {
    return (
      newOccasion.nameAr.trim() !== "" ||
      newOccasion.nameEn.trim() !== "" ||
      newOccasion.date !== "" ||
      newOccasion.celebratoryMessageAr.trim() !== "" ||
      newOccasion.celebratoryMessageEn.trim() !== "" ||
      newOccasion.images.some((img) => img.trim() !== "")
    );
  };

  const isFormValid = () => {
    // التحقق من أن جميع البيانات المطلوبة مملوءة
    const hasNameAr = newOccasion.nameAr.trim() !== "";
    const hasNameEn = newOccasion.nameEn.trim() !== "";
    const hasDate = newOccasion.date !== "";
    const hasValidImages = newOccasion.images.some((img) => img.trim() !== "");

    return hasNameAr && hasNameEn && hasDate && hasValidImages;
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

  const validateOccasionData = (data: HeroOccasionFormData) => {
    const errors: string[] = [];

    if (!data.nameAr?.trim()) {
      errors.push("الاسم العربي مطلوب");
    }

    if (!data.nameEn?.trim()) {
      errors.push("الاسم الإنجليزي مطلوب");
    }

    if (!data.date) {
      errors.push("تاريخ المناسبة مطلوب");
    } else {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.push("تاريخ المناسبة غير صحيح");
      }
    }

    const validImages = data.images.filter((img) => img.trim() !== "");
    if (validImages.length === 0) {
      errors.push("يجب إضافة صورة واحدة على الأقل");
    }

    // التحقق من صحة روابط الصور
    for (const image of validImages) {
      if (image.startsWith("data:image")) {
        // صورة base64 - تحقق من التنسيق
        if (!image.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
          errors.push(
            "تنسيق الصورة غير مدعوم. يرجى استخدام JPG, PNG, GIF, أو WebP"
          );
          break;
        }
      } else if (image.startsWith("http")) {
        // رابط HTTP - تحقق من صحة الرابط
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

  const handleAdd = async () => {
    const validationErrors = validateOccasionData(newOccasion);

    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في التحقق",
        description: validationErrors.join("، "),
        variant: "destructive",
      });
      return;
    }

    try {
      // فلترة الصور الصحيحة فقط
      const validImages = newOccasion.images.filter((img) => img.trim() !== "");

      // التحقق من وجود صورة واحدة على الأقل
      if (validImages.length === 0) {
        toast({
          title: "خطأ في التحقق",
          description: "يجب إضافة صورة واحدة على الأقل",
          variant: "destructive",
        });
        return;
      }

      const occasionData = {
        nameAr: newOccasion.nameAr.trim(),
        nameEn: newOccasion.nameEn.trim(),
        date: new Date(newOccasion.date).toISOString(),
        images: validImages,
        celebratoryMessageAr: newOccasion.celebratoryMessageAr.trim(),
        celebratoryMessageEn: newOccasion.celebratoryMessageEn.trim(),
        isActive: Boolean(newOccasion.isActive),
      };

      console.log("Sending occasion data:", occasionData);

      // إرسال البيانات إلى الباك إند والحصول على المناسبة الجديدة
      const createdOccasion = await apiService.createHeroOccasion(occasionData);

      // إضافة المناسبة الجديدة محلياً فوراً لتحسين تجربة المستخدم
      if (
        createdOccasion &&
        typeof createdOccasion === "object" &&
        "_id" in createdOccasion
      ) {
        const newOccasion: HeroOccasion = {
          _id: createdOccasion._id as string,
          nameAr: occasionData.nameAr,
          nameEn: occasionData.nameEn,
          date: occasionData.date,
          images: occasionData.images,
          celebratoryMessageAr: occasionData.celebratoryMessageAr,
          celebratoryMessageEn: occasionData.celebratoryMessageEn,
          isActive: occasionData.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setOccasions((prevOccasions) => [...prevOccasions, newOccasion]);
      }

      resetForm();
      setIsAddOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المناسبة بنجاح",
      });
    } catch (error) {
      console.error("Error creating occasion:", error);
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في إضافة المناسبة: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (occasion: HeroOccasion) => {
    const occasionId = occasion._id || `occasion-${Date.now()}`;
    setEditingId(occasionId);

    // تحويل التاريخ إلى تنسيق datetime-local
    const date = new Date(occasion.date);
    const formattedDate = isNaN(date.getTime())
      ? ""
      : date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

    const occasionData = {
      nameAr: occasion.nameAr,
      nameEn: occasion.nameEn,
      date: formattedDate,
      images: [...occasion.images],
      celebratoryMessageAr: occasion.celebratoryMessageAr,
      celebratoryMessageEn: occasion.celebratoryMessageEn,
      isActive: occasion.isActive,
    };
    setNewOccasion(occasionData);
    setOriginalOccasion(occasionData);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId) {
      toast({
        title: "خطأ",
        description: "معرف المناسبة غير صحيح",
        variant: "destructive",
      });
      return;
    }

    const validationErrors = validateOccasionData(newOccasion);

    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في التحقق",
        description: validationErrors.join("، "),
        variant: "destructive",
      });
      return;
    }

    // حفظ البيانات الأصلية للتراجع في حالة الخطأ
    const originalOccasions = [...occasions];
    const occasionIndex = occasions.findIndex((occ) => occ._id === editingId);

    if (occasionIndex === -1) {
      toast({
        title: "خطأ",
        description: "المناسبة غير موجودة",
        variant: "destructive",
      });
      return;
    }

    try {
      // فلترة الصور الصحيحة فقط
      const validImages = newOccasion.images.filter((img) => img.trim() !== "");

      // التحقق من وجود صورة واحدة على الأقل
      if (validImages.length === 0) {
        toast({
          title: "خطأ في التحقق",
          description: "يجب إضافة صورة واحدة على الأقل",
          variant: "destructive",
        });
        return;
      }

      const occasionData = {
        nameAr: newOccasion.nameAr.trim(),
        nameEn: newOccasion.nameEn.trim(),
        date: new Date(newOccasion.date).toISOString(),
        images: validImages,
        celebratoryMessageAr: newOccasion.celebratoryMessageAr.trim(),
        celebratoryMessageEn: newOccasion.celebratoryMessageEn.trim(),
        isActive: Boolean(newOccasion.isActive),
      };

      console.log("Updating occasion data:", occasionData);

      // تحديث البيانات محلياً فوراً لتحسين تجربة المستخدم
      const updatedOccasion = {
        ...occasions[occasionIndex],
        ...occasionData,
        _id: editingId,
        updatedAt: new Date().toISOString(),
      };

      setOccasions((prevOccasions) =>
        prevOccasions.map((occ) =>
          occ._id === editingId ? updatedOccasion : occ
        )
      );

      // إرسال التحديث إلى الباك إند
      await apiService.updateHeroOccasion(editingId, occasionData);

      setEditingId(null);
      setIsEditOpen(false);
      setOriginalOccasion(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المناسبة بنجاح",
      });
    } catch (error) {
      console.error("Error updating occasion:", error);

      // إعادة البيانات الأصلية في حالة الخطأ
      setOccasions(originalOccasions);

      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في تحديث المناسبة: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const addImageField = () => {
    setNewOccasion({
      ...newOccasion,
      images: [...newOccasion.images, ""],
    });
  };

  const removeImageField = (index: number) => {
    if (newOccasion.images.length > 1) {
      setNewOccasion({
        ...newOccasion,
        images: newOccasion.images.filter((_, i) => i !== index),
      });
    }
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...newOccasion.images];
    newImages[index] = value;
    setNewOccasion({
      ...newOccasion,
      images: newImages,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "تاريخ غير صحيح";
      }
      // استخدام التقويم الميلادي مع التنسيق الرقمي
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        calendar: "gregory", // التأكد من استخدام التقويم الميلادي
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "تاريخ غير صحيح";
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const handleToggleActive = async (id: string) => {
    if (!id) {
      toast({
        title: "خطأ",
        description: "معرف المناسبة غير صحيح",
        variant: "destructive",
      });
      return;
    }

    // حفظ الحالة الأصلية للتراجع في حالة الخطأ
    const originalOccasions = [...occasions];
    const occasionIndex = occasions.findIndex((occ) => occ._id === id);

    if (occasionIndex === -1) {
      toast({
        title: "خطأ",
        description: "المناسبة غير موجودة",
        variant: "destructive",
      });
      return;
    }

    const originalStatus = occasions[occasionIndex].isActive;
    const newStatus = !originalStatus;

    // تحديث الحالة محلياً فوراً لتحسين تجربة المستخدم
    setOccasions((prevOccasions) =>
      prevOccasions.map((occ) =>
        occ._id === id ? { ...occ, isActive: newStatus } : occ
      )
    );

    try {
      await apiService.toggleHeroOccasionStatus(id);
      toast({
        title: "تم بنجاح",
        description: `تم ${newStatus ? "تفعيل" : "إلغاء تفعيل"} المناسبة`,
      });
    } catch (error) {
      console.error("Error toggling occasion status:", error);

      // إعادة الحالة الأصلية في حالة الخطأ
      setOccasions(originalOccasions);

      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المناسبة",
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
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              مناسبات الهيرو
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              إدارة المناسبات الخاصة التي تظهر في شريحة الهيرو الرئيسية
            </CardDescription>
          </div>
          <Dialog
            open={isAddOpen}
            onOpenChange={(open) => {
              if (!open) {
                resetForm();
                setIsAddOpen(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={handleAddClick}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة مناسبة
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[85vh] flex flex-col"
              onPointerDownOutside={handlePointerDownOutside}
              onEscapeKeyDown={handleEscapeKeyDown}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white">
                  إضافة مناسبة جديدة
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  أضف مناسبة جديدة للعرض في شريحة الهيرو
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="grid gap-6 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="nameAr"
                        className="text-white font-medium"
                      >
                        الاسم بالعربية *
                      </Label>
                      <Input
                        id="nameAr"
                        value={newOccasion.nameAr}
                        onChange={(e) =>
                          setNewOccasion({
                            ...newOccasion,
                            nameAr: e.target.value,
                          })
                        }
                        placeholder="مثال: عيد الفطر"
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="nameEn"
                        className="text-white font-medium"
                      >
                        الاسم بالإنجليزية *
                      </Label>
                      <Input
                        id="nameEn"
                        value={newOccasion.nameEn}
                        onChange={(e) =>
                          setNewOccasion({
                            ...newOccasion,
                            nameEn: e.target.value,
                          })
                        }
                        placeholder="Example: Eid Fitr"
                        className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white font-medium">
                      تاريخ المناسبة *
                    </Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newOccasion.date}
                      onChange={(e) =>
                        setNewOccasion({
                          ...newOccasion,
                          date: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
                    <Label className="text-white font-medium">
                      رسائل التهنئة
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="celebratoryMessageAr"
                          className="text-sm text-gray-400"
                        >
                          الرسالة بالعربية
                        </Label>
                        <Input
                          id="celebratoryMessageAr"
                          value={newOccasion.celebratoryMessageAr}
                          onChange={(e) =>
                            setNewOccasion({
                              ...newOccasion,
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
                          value={newOccasion.celebratoryMessageEn}
                          onChange={(e) =>
                            setNewOccasion({
                              ...newOccasion,
                              celebratoryMessageEn: e.target.value,
                            })
                          }
                          placeholder="Example: Eid Fitr Mubarak!"
                          className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
                    <Label className="flex items-center gap-2 text-white font-medium">
                      <Image className="w-4 h-4 text-blue-400" />
                      صور المناسبة
                    </Label>
                    {newOccasion.images.map((image, index) => (
                      <div
                        key={`add-image-${index}-${image}`}
                        className="space-y-2"
                      >
                        <div className="flex gap-2">
                          <Input
                            value={image}
                            onChange={(e) =>
                              updateImageField(index, e.target.value)
                            }
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
                          {newOccasion.images.length > 1 && (
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
                              <span className="text-xs text-gray-400">
                                جاري الرفع...
                              </span>
                            </div>
                          </div>
                        ) : image ? (
                          <div className="mt-2">
                            <img
                              src={image}
                              alt={`معاينة الصورة ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
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
                    <Label
                      htmlFor="isActive"
                      className="order-2 text-white font-medium"
                    >
                      نشط
                    </Label>
                    <Switch
                      id="isActive"
                      checked={newOccasion.isActive}
                      onCheckedChange={(checked) =>
                        setNewOccasion({ ...newOccasion, isActive: checked })
                      }
                      className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                    />
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
                  disabled={!isFormValid()}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  إضافة المناسبة
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
                <TableHead className="w-40 min-w-[160px]">الاسم</TableHead>
                <TableHead className="w-32 min-w-[128px]">التاريخ</TableHead>
                <TableHead className="w-24 min-w-[96px]">الصور</TableHead>
                <TableHead className="w-24 min-w-[96px]">الحالة</TableHead>
                <TableHead className="w-32 min-w-[128px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occasions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        لا توجد مناسبات
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                occasions
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((occasion, index) => {
                    // التأكد من وجود ID
                    const occasionId =
                      occasion._id || `occasion-${index}-${Date.now()}`;
                    return (
                      <TableRow key={occasionId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{occasion.nameAr}</div>
                            <div className="text-sm text-muted-foreground">
                              {occasion.nameEn}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{formatDate(occasion.date)}</span>
                            {isUpcoming(occasion.date) && (
                              <Badge variant="secondary" className="text-xs">
                                قادمة
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {occasion.images
                              .slice(0, 3)
                              .map((image, imageIndex) => (
                                <img
                                  key={`${occasion._id}-image-${imageIndex}`}
                                  src={image || "/placeholder.svg"}
                                  alt={`صورة ${imageIndex + 1}`}
                                  className="w-8 h-8 object-cover rounded flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              ))}
                            {occasion.images.length > 3 && (
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs flex-shrink-0">
                                +{occasion.images.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                occasion.isActive ? "default" : "secondary"
                              }
                              className="flex-shrink-0"
                            >
                              {occasion.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                            <Switch
                              checked={occasion.isActive}
                              onCheckedChange={() =>
                                handleToggleActive(occasionId)
                              }
                              className="flex-shrink-0"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(occasion)}
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
                              onClick={() => handleDeleteClick(occasionId)}
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
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleEditClose();
          }
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[85vh] flex flex-col"
          onPointerDownOutside={handlePointerDownOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              تعديل المناسبة
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              تعديل بيانات المناسبة المحددة
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-nameAr"
                    className="text-white font-medium"
                  >
                    الاسم بالعربية *
                  </Label>
                  <Input
                    id="edit-nameAr"
                    value={newOccasion.nameAr}
                    onChange={(e) =>
                      setNewOccasion({
                        ...newOccasion,
                        nameAr: e.target.value,
                      })
                    }
                    placeholder="مثال: عيد الفطر"
                    className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-nameEn"
                    className="text-white font-medium"
                  >
                    الاسم بالإنجليزية *
                  </Label>
                  <Input
                    id="edit-nameEn"
                    value={newOccasion.nameEn}
                    onChange={(e) =>
                      setNewOccasion({
                        ...newOccasion,
                        nameEn: e.target.value,
                      })
                    }
                    placeholder="Example: Eid Fitr"
                    className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-white font-medium">
                  تاريخ المناسبة *
                </Label>
                <Input
                  id="edit-date"
                  type="datetime-local"
                  value={newOccasion.date}
                  onChange={(e) =>
                    setNewOccasion({
                      ...newOccasion,
                      date: e.target.value,
                    })
                  }
                  className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
                <Label className="text-white font-medium">رسائل التهنئة</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-celebratoryMessageAr"
                      className="text-sm text-gray-400"
                    >
                      الرسالة بالعربية
                    </Label>
                    <Input
                      id="edit-celebratoryMessageAr"
                      value={newOccasion.celebratoryMessageAr}
                      onChange={(e) =>
                        setNewOccasion({
                          ...newOccasion,
                          celebratoryMessageAr: e.target.value,
                        })
                      }
                      placeholder="مثال: عيد فطر مبارك!"
                      className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-celebratoryMessageEn"
                      className="text-sm text-gray-400"
                    >
                      الرسالة بالإنجليزية
                    </Label>
                    <Input
                      id="edit-celebratoryMessageEn"
                      value={newOccasion.celebratoryMessageEn}
                      onChange={(e) =>
                        setNewOccasion({
                          ...newOccasion,
                          celebratoryMessageEn: e.target.value,
                        })
                      }
                      placeholder="Example: Eid Fitr Mubarak!"
                      className="bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-gray-800/50">
                <Label className="flex items-center gap-2 text-white font-medium">
                  <Image className="w-4 h-4 text-blue-400" />
                  صور المناسبة
                </Label>
                {newOccasion.images.map((image, index) => (
                  <div
                    key={`edit-image-${index}-${image}`}
                    className="space-y-2"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) =>
                          updateImageField(index, e.target.value)
                        }
                        placeholder="رابط الصورة أو ارفع صورة"
                        className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          id={`edit-image-upload-${index}`}
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
                      {newOccasion.images.length > 1 && (
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
                          <span className="text-xs text-gray-400">
                            جاري الرفع...
                          </span>
                        </div>
                      </div>
                    ) : image ? (
                      <div className="mt-2">
                        <img
                          src={image}
                          alt={`معاينة الصورة ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
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
                <Label
                  htmlFor="edit-isActive"
                  className="order-2 text-white font-medium"
                >
                  نشط
                </Label>
                <Switch
                  id="edit-isActive"
                  checked={newOccasion.isActive}
                  onCheckedChange={(checked) =>
                    setNewOccasion({ ...newOccasion, isActive: checked })
                  }
                  className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                />
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
              disabled={!isFormValid()}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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
        title="تأكيد حذف المناسبة"
        description="هل أنت متأكد من أنك تريد حذف هذه المناسبة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />
    </Card>
  );
}
