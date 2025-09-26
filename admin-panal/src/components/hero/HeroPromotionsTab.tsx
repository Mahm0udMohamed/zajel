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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Edit, Trash2, Tag, Calendar, Link, Upload } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import type { HeroPromotion, HeroPromotionFormData } from "../../types/hero";

interface HeroPromotionsTabProps {
  promotions: HeroPromotion[];
  onAdd: (promotion: HeroPromotion) => void;
  onUpdate: (id: string, promotion: HeroPromotion) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const GRADIENT_OPTIONS = [
  { value: "from-red-500/80 to-pink-600/80", label: "أحمر وردي" },
  { value: "from-green-500/80 to-emerald-600/80", label: "أخضر زمردي" },
  { value: "from-purple-500/80 to-indigo-600/80", label: "بنفسجي أزرق" },
  { value: "from-amber-500/80 to-orange-600/80", label: "ذهبي برتقالي" },
  { value: "from-blue-500/80 to-cyan-600/80", label: "أزرق سماوي" },
  { value: "from-pink-500/80 to-rose-600/80", label: "وردي" },
  { value: "from-teal-500/80 to-green-600/80", label: "تركوازي أخضر" },
  { value: "from-violet-500/80 to-purple-600/80", label: "بنفسجي" },
];

export default function HeroPromotionsTab({
  promotions,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
}: HeroPromotionsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newPromotion, setNewPromotion] = useState<HeroPromotionFormData>({
    image: "",
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    buttonTextAr: "",
    buttonTextEn: "",
    link: "",
    gradient: "from-red-500/80 to-pink-600/80",
    isActive: true,
    priority: 1,
    startDate: "",
    endDate: "",
  });
  const [originalPromotion, setOriginalPromotion] =
    useState<HeroPromotionFormData | null>(null);

  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would typically upload to your backend/cloud storage
      // For now, we'll create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setNewPromotion({ ...newPromotion, image: imageUrl });
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      });
    }
  };

  const resetForm = () => {
    setNewPromotion({
      image: "",
      titleAr: "",
      titleEn: "",
      subtitleAr: "",
      subtitleEn: "",
      buttonTextAr: "",
      buttonTextEn: "",
      link: "",
      gradient: "from-red-500/80 to-pink-600/80",
      isActive: true,
      priority: 1,
      startDate: "",
      endDate: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingId(null);
    setOriginalPromotion(null);
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
        description: "تم حذف العرض الترويجي بنجاح",
      });
      setDeletingId(null);
    }
  };

  const hasChanges = () => {
    if (!originalPromotion) return false;

    return (
      newPromotion.image !== originalPromotion.image ||
      newPromotion.titleAr !== originalPromotion.titleAr ||
      newPromotion.titleEn !== originalPromotion.titleEn ||
      newPromotion.subtitleAr !== originalPromotion.subtitleAr ||
      newPromotion.subtitleEn !== originalPromotion.subtitleEn ||
      newPromotion.buttonTextAr !== originalPromotion.buttonTextAr ||
      newPromotion.buttonTextEn !== originalPromotion.buttonTextEn ||
      newPromotion.link !== originalPromotion.link ||
      newPromotion.gradient !== originalPromotion.gradient ||
      newPromotion.isActive !== originalPromotion.isActive ||
      newPromotion.priority !== originalPromotion.priority ||
      newPromotion.startDate !== originalPromotion.startDate ||
      newPromotion.endDate !== originalPromotion.endDate
    );
  };

  const hasData = () => {
    return (
      newPromotion.image.trim() !== "" ||
      newPromotion.titleAr.trim() !== "" ||
      newPromotion.titleEn.trim() !== "" ||
      newPromotion.subtitleAr.trim() !== "" ||
      newPromotion.subtitleEn.trim() !== "" ||
      newPromotion.buttonTextAr.trim() !== "" ||
      newPromotion.buttonTextEn.trim() !== "" ||
      newPromotion.link.trim() !== "" ||
      newPromotion.startDate !== "" ||
      newPromotion.endDate !== ""
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
    if (!newPromotion.titleAr || !newPromotion.titleEn || !newPromotion.image) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const promotion: HeroPromotion = {
      id: Date.now().toString(),
      type: "promotion",
      ...newPromotion,
      createdAt: new Date().toISOString(),
    };

    onAdd(promotion);
    setNewPromotion({
      image: "",
      titleAr: "",
      titleEn: "",
      subtitleAr: "",
      subtitleEn: "",
      buttonTextAr: "",
      buttonTextEn: "",
      link: "",
      gradient: "from-red-500/80 to-pink-600/80",
      isActive: true,
      priority: 1,
      startDate: "",
      endDate: "",
    });
    setIsAddOpen(false);
    toast({
      title: "تم بنجاح",
      description: "تم إضافة العرض بنجاح",
    });
  };

  const handleEdit = (promotion: HeroPromotion) => {
    setEditingId(promotion.id);
    const promotionData = {
      image: promotion.image,
      titleAr: promotion.titleAr,
      titleEn: promotion.titleEn,
      subtitleAr: promotion.subtitleAr,
      subtitleEn: promotion.subtitleEn,
      buttonTextAr: promotion.buttonTextAr,
      buttonTextEn: promotion.buttonTextEn,
      link: promotion.link,
      gradient: promotion.gradient,
      isActive: promotion.isActive,
      priority: promotion.priority,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    };
    setNewPromotion(promotionData);
    setOriginalPromotion(promotionData);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    const updatedPromotion: HeroPromotion = {
      id: editingId,
      type: "promotion",
      ...newPromotion,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(editingId, updatedPromotion);
    setEditingId(null);
    setIsEditOpen(false);
    setOriginalPromotion(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث العرض بنجاح",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const isActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const getGradientLabel = (value: string) => {
    const option = GRADIENT_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Tag className="w-5 h-5 text-purple-500" />
              العروض الترويجية
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              إدارة العروض الترويجية التي تظهر في شريحة الهيرو الرئيسية
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                إضافة عرض
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[85vh] flex flex-col"
              onPointerDownOutside={handlePointerDownOutside}
              onEscapeKeyDown={handleEscapeKeyDown}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white">
                  إضافة عرض ترويجي جديد
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  أضف عرض ترويجي جديد للعرض في شريحة الهيرو
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="grid gap-6 py-6">
                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <Label htmlFor="image" className="text-white font-medium">
                      صورة العرض *
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="image"
                        value={newPromotion.image}
                        onChange={(e) =>
                          setNewPromotion({
                            ...newPromotion,
                            image: e.target.value,
                          })
                        }
                        placeholder="رابط صورة العرض أو ارفع صورة"
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
                          className="bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          رفع
                        </Button>
                      </div>
                    </div>
                    {newPromotion.image && (
                      <div className="mt-3">
                        <img
                          src={newPromotion.image}
                          alt="معاينة الصورة"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="titleAr"
                          className="text-white font-medium"
                        >
                          العنوان بالعربية *
                        </Label>
                        <Input
                          id="titleAr"
                          value={newPromotion.titleAr}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              titleAr: e.target.value,
                            })
                          }
                          placeholder="مثال: خصم 50% على جميع الهدايا"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="titleEn"
                          className="text-white font-medium"
                        >
                          العنوان بالإنجليزية *
                        </Label>
                        <Input
                          id="titleEn"
                          value={newPromotion.titleEn}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              titleEn: e.target.value,
                            })
                          }
                          placeholder="Example: 50% Off All Gifts"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="subtitleAr"
                          className="text-white font-medium"
                        >
                          العنوان الفرعي بالعربية
                        </Label>
                        <Input
                          id="subtitleAr"
                          value={newPromotion.subtitleAr}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              subtitleAr: e.target.value,
                            })
                          }
                          placeholder="مثال: عرض محدود لفترة قصيرة"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="subtitleEn"
                          className="text-white font-medium"
                        >
                          العنوان الفرعي بالإنجليزية
                        </Label>
                        <Input
                          id="subtitleEn"
                          value={newPromotion.subtitleEn}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              subtitleEn: e.target.value,
                            })
                          }
                          placeholder="Example: Limited Time Offer"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="buttonTextAr"
                          className="text-white font-medium"
                        >
                          نص الزر بالعربية
                        </Label>
                        <Input
                          id="buttonTextAr"
                          value={newPromotion.buttonTextAr}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              buttonTextAr: e.target.value,
                            })
                          }
                          placeholder="مثال: تسوق الآن"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="buttonTextEn"
                          className="text-white font-medium"
                        >
                          نص الزر بالإنجليزية
                        </Label>
                        <Input
                          id="buttonTextEn"
                          value={newPromotion.buttonTextEn}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              buttonTextEn: e.target.value,
                            })
                          }
                          placeholder="Example: Shop Now"
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <Label
                      htmlFor="link"
                      className="flex items-center gap-2 text-white font-medium"
                    >
                      <Link className="w-4 h-4 text-blue-400" />
                      رابط التوجيه
                    </Label>
                    <Input
                      id="link"
                      value={newPromotion.link}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          link: e.target.value,
                        })
                      }
                      placeholder="/products?sale=50"
                      className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <Label
                      htmlFor="gradient"
                      className="text-white font-medium"
                    >
                      التدرج اللوني
                    </Label>
                    <Select
                      value={newPromotion.gradient}
                      onValueChange={(value) =>
                        setNewPromotion({
                          ...newPromotion,
                          gradient: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue placeholder="اختر التدرج اللوني" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADIENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="startDate"
                          className="flex items-center gap-2 text-white font-medium"
                        >
                          <Calendar className="w-4 h-4 text-blue-400" />
                          تاريخ البداية
                        </Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newPromotion.startDate}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              startDate: e.target.value,
                            })
                          }
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="endDate"
                          className="flex items-center gap-2 text-white font-medium"
                        >
                          <Calendar className="w-4 h-4 text-blue-400" />
                          تاريخ النهاية
                        </Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newPromotion.endDate}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              endDate: e.target.value,
                            })
                          }
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="priority"
                          className="text-white font-medium"
                        >
                          الأولوية
                        </Label>
                        <Input
                          id="priority"
                          type="number"
                          min="1"
                          value={newPromotion.priority}
                          onChange={(e) =>
                            setNewPromotion({
                              ...newPromotion,
                              priority: Number(e.target.value),
                            })
                          }
                          className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-6">
                        <Label
                          htmlFor="isActive"
                          className="order-2 text-white font-medium"
                        >
                          نشط
                        </Label>
                        <Switch
                          id="isActive"
                          checked={newPromotion.isActive}
                          onCheckedChange={(checked) =>
                            setNewPromotion({
                              ...newPromotion,
                              isActive: checked,
                            })
                          }
                          className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                        />
                      </div>
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
                  إضافة العرض
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
              <TableHead>العنوان</TableHead>
              <TableHead>التدرج</TableHead>
              <TableHead>الفترة</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions
              .sort((a, b) => a.priority - b.priority)
              .map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    <img
                      src={promotion.image || "/placeholder.svg"}
                      alt={promotion.titleAr}
                      className="w-16 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.titleAr}</div>
                      <div className="text-sm text-muted-foreground">
                        {promotion.titleEn}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded bg-gradient-to-r ${promotion.gradient}`}
                      />
                      <span className="text-sm">
                        {getGradientLabel(promotion.gradient)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>من: {formatDate(promotion.startDate)}</div>
                      <div>إلى: {formatDate(promotion.endDate)}</div>
                      {isActive(promotion.startDate, promotion.endDate) && (
                        <Badge variant="default" className="text-xs mt-1">
                          نشط الآن
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{promotion.priority}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={promotion.isActive ? "default" : "secondary"}
                      >
                        {promotion.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                      <Switch
                        checked={promotion.isActive}
                        onCheckedChange={() => onToggleActive(promotion.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(promotion)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(promotion.id)}
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
              تعديل العرض الترويجي
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              تعديل بيانات العرض الترويجي المحدد
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="grid gap-6 py-6">
              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <Label htmlFor="edit-image" className="text-white font-medium">
                  صورة العرض *
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="edit-image"
                    value={newPromotion.image}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        image: e.target.value,
                      })
                    }
                    placeholder="رابط صورة العرض أو ارفع صورة"
                    className="flex-1 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="edit-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 group-hover:shadow-purple-500/40 transition-all duration-200 shadow-purple-500/20"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      رفع
                    </Button>
                  </div>
                </div>
                {newPromotion.image && (
                  <div className="mt-3">
                    <img
                      src={newPromotion.image}
                      alt="معاينة الصورة"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                    />
                  </div>
                )}
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-titleAr"
                      className="text-white font-medium"
                    >
                      العنوان بالعربية *
                    </Label>
                    <Input
                      id="edit-titleAr"
                      value={newPromotion.titleAr}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          titleAr: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-titleEn"
                      className="text-white font-medium"
                    >
                      العنوان بالإنجليزية *
                    </Label>
                    <Input
                      id="edit-titleEn"
                      value={newPromotion.titleEn}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          titleEn: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-subtitleAr"
                      className="text-white font-medium"
                    >
                      العنوان الفرعي بالعربية
                    </Label>
                    <Input
                      id="edit-subtitleAr"
                      value={newPromotion.subtitleAr}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          subtitleAr: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-subtitleEn"
                      className="text-white font-medium"
                    >
                      العنوان الفرعي بالإنجليزية
                    </Label>
                    <Input
                      id="edit-subtitleEn"
                      value={newPromotion.subtitleEn}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          subtitleEn: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-buttonTextAr"
                      className="text-white font-medium"
                    >
                      نص الزر بالعربية
                    </Label>
                    <Input
                      id="edit-buttonTextAr"
                      value={newPromotion.buttonTextAr}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          buttonTextAr: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-buttonTextEn"
                      className="text-white font-medium"
                    >
                      نص الزر بالإنجليزية
                    </Label>
                    <Input
                      id="edit-buttonTextEn"
                      value={newPromotion.buttonTextEn}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          buttonTextEn: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <Label
                  htmlFor="edit-link"
                  className="flex items-center gap-2 text-white font-medium"
                >
                  <Link className="w-4 h-4 text-blue-400" />
                  رابط التوجيه
                </Label>
                <Input
                  id="edit-link"
                  value={newPromotion.link}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      link: e.target.value,
                    })
                  }
                  placeholder="/products?sale=50"
                  className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <Label
                  htmlFor="edit-gradient"
                  className="text-white font-medium"
                >
                  التدرج اللوني
                </Label>
                <Select
                  value={newPromotion.gradient}
                  onValueChange={(value) =>
                    setNewPromotion({
                      ...newPromotion,
                      gradient: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-2 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20">
                    <SelectValue placeholder="اختر التدرج اللوني" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-startDate"
                      className="flex items-center gap-2 text-white font-medium"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
                      تاريخ البداية
                    </Label>
                    <Input
                      id="edit-startDate"
                      type="datetime-local"
                      value={newPromotion.startDate}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          startDate: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-endDate"
                      className="flex items-center gap-2 text-white font-medium"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
                      تاريخ النهاية
                    </Label>
                    <Input
                      id="edit-endDate"
                      type="datetime-local"
                      value={newPromotion.endDate}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          endDate: e.target.value,
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-priority"
                      className="text-white font-medium"
                    >
                      الأولوية
                    </Label>
                    <Input
                      id="edit-priority"
                      type="number"
                      min="1"
                      value={newPromotion.priority}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          priority: Number(e.target.value),
                        })
                      }
                      className="bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-6">
                    <Label
                      htmlFor="edit-isActive"
                      className="order-2 text-white font-medium"
                    >
                      نشط
                    </Label>
                    <Switch
                      id="edit-isActive"
                      checked={newPromotion.isActive}
                      onCheckedChange={(checked) =>
                        setNewPromotion({ ...newPromotion, isActive: checked })
                      }
                      className="order-1 data-[state=checked]:bg-purple-600 shadow-purple-500/20"
                    />
                  </div>
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
        title="تأكيد حذف العرض الترويجي"
        description="هل أنت متأكد من أنك تريد حذف هذا العرض الترويجي؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />
    </Card>
  );
}
