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
import { Plus, Edit, Trash2, Tag, Upload } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import type {
  Category,
  CategoryFormData,
  CategoriesTabProps,
} from "../../types/categories";

export default function CategoriesTab({
  categories,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
}: CategoriesTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<CategoryFormData>({
    nameAr: "",
    nameEn: "",
    imageUrl: "",
    isActive: true,
    sortOrder: 1,
  });
  const [originalCategory, setOriginalCategory] =
    useState<CategoryFormData | null>(null);

  const { toast } = useToast();

  const handleAdd = () => {
    if (!newCategory.nameAr || !newCategory.nameEn) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    onAdd(newCategory);
    resetForm();
    setIsAddOpen(false);
    toast({
      title: "تم بنجاح",
      description: "تم إضافة الفئة بنجاح",
    });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    const categoryData = {
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    };
    setNewCategory(categoryData);
    setOriginalCategory(categoryData);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    if (!newCategory.nameAr || !newCategory.nameEn) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    onUpdate(editingId, newCategory);
    resetForm();
    setIsEditOpen(false);
    setEditingId(null);
    setOriginalCategory(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث الفئة بنجاح",
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
        description: "تم حذف الفئة بنجاح",
      });
      setDeletingId(null);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewCategory({ ...newCategory, imageUrl });
    }
  };

  const resetForm = () => {
    setNewCategory({
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
    setOriginalCategory(null);
  };

  const hasChanges = () => {
    if (!originalCategory) return false;

    return (
      newCategory.nameAr !== originalCategory.nameAr ||
      newCategory.nameEn !== originalCategory.nameEn ||
      newCategory.imageUrl !== originalCategory.imageUrl ||
      newCategory.isActive !== originalCategory.isActive ||
      newCategory.sortOrder !== originalCategory.sortOrder
    );
  };

  const hasData = () => {
    return (
      newCategory.nameAr.trim() !== "" ||
      newCategory.nameEn.trim() !== "" ||
      newCategory.imageUrl.trim() !== "" ||
      newCategory.sortOrder !== 1
    );
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

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              الفئات
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              إدارة فئات المنتجات المعروضة في الموقع
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                إضافة فئة
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[85vh] flex flex-col"
              onPointerDownOutside={handlePointerDownOutside}
              onEscapeKeyDown={handleEscapeKeyDown}
            >
              <DialogHeader>
                <DialogTitle className="text-white">
                  إضافة فئة جديدة
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  أضف فئة جديدة للمنتجات
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
                          value={newCategory.nameAr}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              nameAr: e.target.value,
                            })
                          }
                          placeholder="الورد"
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
                          value={newCategory.nameEn}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              nameEn: e.target.value,
                            })
                          }
                          placeholder="Flowers"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* الصورة */}
                  <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                    <Label className="text-white font-medium">صورة الفئة</Label>
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
                      {newCategory.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={newCategory.imageUrl}
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
                          value={newCategory.sortOrder}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
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
                        checked={newCategory.isActive}
                        onCheckedChange={(checked) =>
                          setNewCategory({
                            ...newCategory,
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
                  إضافة الفئة
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
              <TableHead className="w-20 min-w-[80px]">الصورة</TableHead>
              <TableHead className="w-40 min-w-[160px]">الاسم</TableHead>
              <TableHead className="w-20 min-w-[80px]">الترتيب</TableHead>
              <TableHead className="w-24 min-w-[96px]">الحالة</TableHead>
              <TableHead className="w-32 min-w-[128px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <img
                      src={category.imageUrl || "/placeholder.svg"}
                      alt={category.nameAr}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{category.nameAr}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.nameEn}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell>
                    <Badge
                      variant={category.isActive ? "default" : "secondary"}
                    >
                      {category.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 px-2 text-xs"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline mr-1">تعديل</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleActive(category.id)}
                        className="h-8 px-2 text-xs"
                      >
                        <span className="text-xs">
                          {category.isActive ? "إخفاء" : "إظهار"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(category.id)}
                        className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 shadow-red-500/20 h-8 px-2 text-xs"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline mr-1">حذف</span>
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
            <DialogTitle className="text-white">تعديل الفئة</DialogTitle>
            <DialogDescription className="text-gray-400">
              تعديل بيانات الفئة
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
                      value={newCategory.nameAr}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          nameAr: e.target.value,
                        })
                      }
                      placeholder="الورد"
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
                      value={newCategory.nameEn}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          nameEn: e.target.value,
                        })
                      }
                      placeholder="Flowers"
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* الصورة */}
              <div className="bg-black/20 border border-gray-800/50 rounded-lg p-4">
                <Label className="text-white font-medium">صورة الفئة</Label>
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
                  {newCategory.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={newCategory.imageUrl}
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
                      value={newCategory.sortOrder}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
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
                    checked={newCategory.isActive}
                    onCheckedChange={(checked) =>
                      setNewCategory({ ...newCategory, isActive: checked })
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
        title="تأكيد حذف الفئة"
        description="هل أنت متأكد من أنك تريد حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />
    </Card>
  );
}
