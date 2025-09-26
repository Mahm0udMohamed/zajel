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
import { Plus, Edit, Trash2, Calendar, Image, Upload } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import type { HeroOccasion, HeroOccasionFormData } from "../../types/hero";

interface HeroOccasionsTabProps {
  occasions: HeroOccasion[];
  onAdd: (occasion: HeroOccasion) => void;
  onUpdate: (id: string, occasion: HeroOccasion) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export default function HeroOccasionsTab({
  occasions,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
}: HeroOccasionsTabProps) {
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

  const { toast } = useToast();

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    imageIndex: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would typically upload to your backend/cloud storage
      // For now, we'll create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      const updatedImages = [...newOccasion.images];
      updatedImages[imageIndex] = imageUrl;
      setNewOccasion({ ...newOccasion, images: updatedImages });
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      });
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

  const handleAdd = () => {
    if (!newOccasion.nameAr || !newOccasion.nameEn || !newOccasion.date) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const occasion: HeroOccasion = {
      id: Date.now().toString(),
      nameKey: `occasion.${newOccasion.nameEn
        .toLowerCase()
        .replace(/\s+/g, "")}`,
      ...newOccasion,
      createdAt: new Date().toISOString(),
    };

    onAdd(occasion);
    setNewOccasion({
      nameAr: "",
      nameEn: "",
      date: "",
      images: [""],
      celebratoryMessageAr: "",
      celebratoryMessageEn: "",
      isActive: true,
    });
    setIsAddOpen(false);
    toast({
      title: "تم بنجاح",
      description: "تم إضافة المناسبة بنجاح",
    });
  };

  const handleEdit = (occasion: HeroOccasion) => {
    setEditingId(occasion.id);
    const occasionData = {
      nameAr: occasion.nameAr,
      nameEn: occasion.nameEn,
      date: occasion.date,
      images: [...occasion.images],
      celebratoryMessageAr: occasion.celebratoryMessageAr,
      celebratoryMessageEn: occasion.celebratoryMessageEn,
      isActive: occasion.isActive,
    };
    setNewOccasion(occasionData);
    setOriginalOccasion(occasionData);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    const updatedOccasion: HeroOccasion = {
      id: editingId,
      nameKey: `occasion.${newOccasion.nameEn
        .toLowerCase()
        .replace(/\s+/g, "")}`,
      ...newOccasion,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(editingId, updatedOccasion);
    setEditingId(null);
    setIsEditOpen(false);
    setOriginalOccasion(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث المناسبة بنجاح",
    });
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
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-5 h-5 text-blue-500" />
              مناسبات الهيرو
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              إدارة المناسبات الخاصة التي تظهر في شريحة الهيرو الرئيسية
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
                      <div key={index} className="space-y-2">
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
                        {image && (
                          <div className="mt-2">
                            <img
                              src={image}
                              alt={`معاينة الصورة ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
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
              <TableHead>الاسم</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الصور</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {occasions
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((occasion) => (
                <TableRow key={occasion.id}>
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
                      {occasion.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ))}
                      {occasion.images.length > 3 && (
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">
                          +{occasion.images.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={occasion.isActive ? "default" : "secondary"}
                      >
                        {occasion.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                      <Switch
                        checked={occasion.isActive}
                        onCheckedChange={() => onToggleActive(occasion.id)}
                      />
                    </div>
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
                        onClick={() => handleDeleteClick(occasion.id)}
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
                  <div key={index} className="space-y-2">
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
                    {image && (
                      <div className="mt-2">
                        <img
                          src={image}
                          alt={`معاينة الصورة ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
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
