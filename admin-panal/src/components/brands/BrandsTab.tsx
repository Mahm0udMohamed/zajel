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
import { BrandModal } from "../ui/BrandModal";
import { Plus, Edit, Trash2, Building2, Loader2, Image } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { Brand } from "../../types/brands";

// مكون لعرض الصور مع معالجة الأخطاء
function ImageWithError({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt: string;
  className: string;
  [key: string]: unknown;
}) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const handleImageError = () => {
    setImageLoadFailed(true);
  };

  const handleImageLoad = () => {
    setImageLoadFailed(false);
  };

  if (imageLoadFailed || !src) {
    return (
      <div
        className={`${className} bg-gray-800/90 rounded-lg border border-gray-600/50 flex items-center justify-center backdrop-blur-sm`}
      >
        <Image className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    />
  );
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const { toast } = useToast();

  // تحميل البيانات من الباك إند
  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBrands({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        language: "ar",
        sortBy: "sortOrder",
        sortOrder: "asc",
      });

      if (response.success && Array.isArray(response.data)) {
        setBrands(response.data as Brand[]);
        setPagination(response.pagination);
      } else {
        console.warn("Unexpected response format:", response);
        setBrands([]);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل العلامات التجارية",
        variant: "destructive",
      });
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند بدء المكون
  useEffect(() => {
    loadBrands();
  }, [pagination.currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSuccess = (newBrand: Brand) => {
    setBrands((prevBrands) => [...prevBrands, newBrand]);
    setIsAddOpen(false);
  };

  const handleEditSuccess = (updatedBrand: Brand) => {
    setBrands((prevBrands) =>
      prevBrands.map((brand) =>
        brand._id === updatedBrand._id ? updatedBrand : brand
      )
    );
    setIsEditOpen(false);
    setEditingBrand(null);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (!id) {
      toast({
        title: "خطأ",
        description: "معرف العلامة التجارية غير صحيح",
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
        description: "معرف العلامة التجارية غير صحيح",
        variant: "destructive",
      });
      return;
    }

    const brandToDelete = brands.find((brand) => brand._id === deletingId);

    if (!brandToDelete) {
      toast({
        title: "خطأ",
        description: "العلامة التجارية غير موجودة",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);

      // إرسال طلب الحذف إلى الباك إند أولاً
      await apiService.deleteBrand(deletingId);

      // إزالة العلامة التجارية من القائمة فقط بعد نجاح العملية في الباك إند
      setBrands((prevBrands) =>
        prevBrands.filter((brand) => brand._id !== deletingId)
      );

      toast({
        title: "تم الحذف",
        description: "تم حذف العلامة التجارية بنجاح",
      });
      setDeletingId(null);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting brand:", error);

      toast({
        title: "خطأ",
        description: "فشل في حذف العلامة التجارية",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!id) {
      toast({
        title: "خطأ",
        description: "معرف العلامة التجارية غير صحيح",
        variant: "destructive",
      });
      return;
    }

    // حفظ الحالة الأصلية للتراجع في حالة الخطأ
    const originalBrands = [...brands];
    const brandIndex = brands.findIndex((brand) => brand._id === id);

    if (brandIndex === -1) {
      toast({
        title: "خطأ",
        description: "العلامة التجارية غير موجودة",
        variant: "destructive",
      });
      return;
    }

    const originalStatus = brands[brandIndex].isActive;
    const newStatus = !originalStatus;

    // تحديث الحالة محلياً فوراً لتحسين تجربة المستخدم
    setBrands((prevBrands) =>
      prevBrands.map((brand) =>
        brand._id === id ? { ...brand, isActive: newStatus } : brand
      )
    );

    try {
      await apiService.toggleBrandStatus(id);
      toast({
        title: "تم بنجاح",
        description: `تم ${
          newStatus ? "تفعيل" : "إلغاء تفعيل"
        } العلامة التجارية`,
      });
    } catch (error) {
      console.error("Error toggling brand status:", error);

      // إعادة الحالة الأصلية في حالة الخطأ
      setBrands(originalBrands);

      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة العلامة التجارية",
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
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              العلامات التجارية
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              إدارة العلامات التجارية المعروضة في الموقع
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة علامة تجارية
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
                <TableHead className="w-40 min-w-[160px]">الاسم</TableHead>
                <TableHead className="w-20 min-w-[80px]">الترتيب</TableHead>
                <TableHead className="w-24 min-w-[96px]">الحالة</TableHead>
                <TableHead className="w-20 min-w-[80px]">المنتجات</TableHead>
                <TableHead className="w-32 min-w-[128px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        لا توجد علامات تجارية
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brands
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((brand) => {
                    const brandId = brand._id || `brand-${Date.now()}`;
                    return (
                      <TableRow key={brandId}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <ImageWithError
                              src={brand.imageUrl || "/placeholder.svg"}
                              alt={brand.nameAr}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center justify-center">
                            <div className="font-medium">{brand.nameAr}</div>
                            <div className="text-sm text-muted-foreground">
                              {brand.nameEn}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {brand.sortOrder}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Badge
                              variant={brand.isActive ? "default" : "secondary"}
                              className={
                                brand.isActive
                                  ? "bg-green-500/20 border-green-500/50 text-green-300"
                                  : "bg-gray-500/20 border-gray-500/50 text-gray-300"
                              }
                            >
                              {brand.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(brandId)}
                              className="flex-shrink-0 scale-75"
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  brand.isActive
                                    ? "bg-green-500 border-green-500"
                                    : "bg-gray-400 border-gray-400"
                                }`}
                              />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Badge variant="outline" className="text-xs">
                              {brand.productCount || 0}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(brand)}
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
                              onClick={() => handleDeleteClick(brandId)}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              عرض {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
              إلى{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              من {pagination.totalItems} علامة تجارية
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={!pagination.hasPrevPage}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={!pagination.hasNextPage}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Modal */}
      <BrandModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="add"
        onSuccess={handleAddSuccess}
        title="إضافة علامة تجارية جديدة"
      />

      {/* Edit Modal */}
      <BrandModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        brand={editingBrand}
        onSuccess={handleEditSuccess}
        title="تعديل العلامة التجارية"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف العلامة التجارية"
        description="هل أنت متأكد من أنك تريد حذف هذه العلامة التجارية؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Card>
  );
}
