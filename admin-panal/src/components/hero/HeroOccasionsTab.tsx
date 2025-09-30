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
import { HeroOccasionModal } from "../ui/HeroOccasionModal";
import { Plus, Edit, Trash2, Calendar, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { HeroOccasion } from "../../types/hero";

export default function HeroOccasionsTab() {
  const [occasions, setOccasions] = useState<HeroOccasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<HeroOccasion | null>(
    null
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleAddSuccess = (newOccasion: HeroOccasion) => {
    setOccasions((prevOccasions) => [...prevOccasions, newOccasion]);
    setIsAddOpen(false);
  };

  const handleEditSuccess = (updatedOccasion: HeroOccasion) => {
    setOccasions((prevOccasions) =>
      prevOccasions.map((occ) =>
        occ._id === updatedOccasion._id ? updatedOccasion : occ
      )
    );
    setIsEditOpen(false);
    setEditingOccasion(null);
  };

  const handleEdit = (occasion: HeroOccasion) => {
    setEditingOccasion(occasion);
    setIsEditOpen(true);
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
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة مناسبة
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
                          <div className="flex flex-col items-center justify-center">
                            <div className="font-medium">{occasion.nameAr}</div>
                            <div className="text-sm text-muted-foreground">
                              {occasion.nameEn}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <span>{formatDate(occasion.date)}</span>
                            {isUpcoming(occasion.date) && (
                              <Badge variant="secondary" className="text-xs">
                                قادمة
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
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
                          <div className="flex items-center justify-center gap-2">
                            <Badge
                              variant={
                                occasion.isActive ? "default" : "secondary"
                              }
                              className="flex-shrink-0"
                            >
                              {occasion.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(occasionId)}
                              className="flex-shrink-0 scale-75"
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  occasion.isActive
                                    ? "bg-green-500 border-green-500"
                                    : "bg-gray-400 border-gray-400"
                                }`}
                              />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
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

      {/* Add Modal */}
      <HeroOccasionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="add"
        onSuccess={handleAddSuccess}
        title="إضافة مناسبة جديدة"
      />

      {/* Edit Modal */}
      <HeroOccasionModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        occasion={editingOccasion}
        onSuccess={handleEditSuccess}
        title="تعديل المناسبة"
      />

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
