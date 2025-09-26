import { useState } from "react";
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
import { Plus, Edit, Trash2, Calendar, Upload } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import type {
  Occasion,
  OccasionFormData,
  OccasionsTabProps,
} from "../../types/occasions";

export default function OccasionsTab({
  occasions,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
  onReorder,
}: OccasionsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newOccasion, setNewOccasion] = useState<OccasionFormData>({
    nameAr: "",
    nameEn: "",
    imageUrl: "",
    isActive: true,
    sortOrder: 1,
  });

  const { toast } = useToast();

  const handleAdd = () => {
    if (!newOccasion.nameAr || !newOccasion.nameEn) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    onAdd(newOccasion);
    resetForm();
    setIsAddOpen(false);
    toast({
      title: "تم بنجاح",
      description: "تم إضافة المناسبة بنجاح",
    });
  };

  const handleEdit = (occasion: Occasion) => {
    setEditingId(occasion.id);
    setNewOccasion({
      nameAr: occasion.nameAr,
      nameEn: occasion.nameEn,
      imageUrl: occasion.imageUrl,
      isActive: occasion.isActive,
      sortOrder: occasion.sortOrder,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    if (!newOccasion.nameAr || !newOccasion.nameEn) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    onUpdate(editingId, newOccasion);
    resetForm();
    setIsEditOpen(false);
    setEditingId(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث المناسبة بنجاح",
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      onDelete(deletingId);
      toast({
        title: "تم الحذف",
        description: "تم حذف المناسبة بنجاح",
      });
      setDeletingId(null);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewOccasion({ ...newOccasion, imageUrl });
    }
  };

  const resetForm = () => {
    setNewOccasion({
      nameAr: "",
      nameEn: "",
      imageUrl: "",
      isActive: true,
      sortOrder: 1,
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingId(null);
  };

  const hasData = () => {
    return (
      newOccasion.nameAr.trim() !== "" ||
      newOccasion.nameEn.trim() !== "" ||
      newOccasion.imageUrl.trim() !== "" ||
      newOccasion.sortOrder !== 1
    );
  };

  const handlePointerDownOutside = (e: Event) => {
    if (hasData()) {
      e.preventDefault();
    }
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (hasData()) {
      e.preventDefault();
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-5 h-5 text-purple-500" />
              المناسبات
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              إدارة المناسبات الخاصة بالمنتجات
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
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
                <DialogTitle className="text-white">
                  إضافة مناسبة جديدة
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  أضف مناسبة جديدة للمنتجات
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto scrollbar-hide flex-1">
                <div className="space-y-6 p-1">
                  {/* الأسماء */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                      <div className="space-y-2">
                        <Label className="text-white font-medium">
                          الاسم بالعربية *
                        </Label>
                        <Input
                          value={newOccasion.nameAr}
                          onChange={(e) =>
                            setNewOccasion({
                              ...newOccasion,
                              nameAr: e.target.value,
                            })
                          }
                          placeholder="عيد الميلاد"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                    <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                      <div className="space-y-2">
                        <Label className="text-white font-medium">
                          الاسم بالإنجليزية *
                        </Label>
                        <Input
                          value={newOccasion.nameEn}
                          onChange={(e) =>
                            setNewOccasion({
                              ...newOccasion,
                              nameEn: e.target.value,
                            })
                          }
                          placeholder="Birthday"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* الصورة */}
                  <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                    <Label className="text-white font-medium">
                      صورة المناسبة
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          رفع صورة
                        </Button>
                      </div>
                      {newOccasion.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={newOccasion.imageUrl}
                            alt="معاينة الصورة"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* الترتيب والحالة */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                      <div className="space-y-2">
                        <Label className="text-white font-medium">
                          ترتيب العرض
                        </Label>
                        <Input
                          type="number"
                          value={newOccasion.sortOrder}
                          onChange={(e) =>
                            setNewOccasion({
                              ...newOccasion,
                              sortOrder: Number(e.target.value),
                            })
                          }
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Label className="order-2 text-white font-medium">
                        نشط
                      </Label>
                      <Switch
                        checked={newOccasion.isActive}
                        onCheckedChange={(checked) =>
                          setNewOccasion({
                            ...newOccasion,
                            isActive: checked,
                          })
                        }
                        className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                      />
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
                  إضافة المناسبة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {occasions
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((occasion) => (
                <TableRow key={occasion.id}>
                  <TableCell>
                    <img
                      src={occasion.imageUrl || "/placeholder.svg"}
                      alt={occasion.nameAr}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{occasion.nameAr}</div>
                      <div className="text-sm text-muted-foreground">
                        {occasion.nameEn}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{occasion.sortOrder}</TableCell>
                  <TableCell>
                    <Badge
                      variant={occasion.isActive ? "default" : "secondary"}
                    >
                      {occasion.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(occasion)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleActive(occasion.id)}
                      >
                        {occasion.isActive ? "إخفاء" : "إظهار"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(occasion.id)}
                        className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 shadow-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] flex flex-col"
          onPointerDownOutside={handlePointerDownOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <DialogHeader>
            <DialogTitle className="text-white">تعديل المناسبة</DialogTitle>
            <DialogDescription className="text-gray-400">
              تعديل بيانات المناسبة
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto scrollbar-hide flex-1">
            <div className="space-y-6 p-1">
              {/* الأسماء */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      الاسم بالعربية *
                    </Label>
                    <Input
                      value={newOccasion.nameAr}
                      onChange={(e) =>
                        setNewOccasion({
                          ...newOccasion,
                          nameAr: e.target.value,
                        })
                      }
                      placeholder="عيد الميلاد"
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      الاسم بالإنجليزية *
                    </Label>
                    <Input
                      value={newOccasion.nameEn}
                      onChange={(e) =>
                        setNewOccasion({
                          ...newOccasion,
                          nameEn: e.target.value,
                        })
                      }
                      placeholder="Birthday"
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* الصورة */}
              <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                <Label className="text-white font-medium">صورة المناسبة</Label>
                <div className="mt-2 space-y-3">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      رفع صورة
                    </Button>
                  </div>
                  {newOccasion.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={newOccasion.imageUrl}
                        alt="معاينة الصورة"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* الترتيب والحالة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      ترتيب العرض
                    </Label>
                    <Input
                      type="number"
                      value={newOccasion.sortOrder}
                      onChange={(e) =>
                        setNewOccasion({
                          ...newOccasion,
                          sortOrder: Number(e.target.value),
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Label className="order-2 text-white font-medium">نشط</Label>
                  <Switch
                    checked={newOccasion.isActive}
                    onCheckedChange={(checked) =>
                      setNewOccasion({
                        ...newOccasion,
                        isActive: checked,
                      })
                    }
                    className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                  />
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
        title="تأكيد حذف المناسبة"
        description="هل أنت متأكد من أنك تريد حذف هذه المناسبة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />
    </Card>
  );
}
