import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Plus, Edit, Trash2, Search, Gift, Star, Heart } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface GiftPackage {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category:
    | "romantic"
    | "birthday"
    | "congratulations"
    | "apology"
    | "thank_you";
  items: string[];
  isActive: boolean;
  isPopular: boolean;
  availableQuantity: number;
}

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftPackage[]>([
    {
      id: 1,
      nameAr: "باقة الحب الأبدي",
      nameEn: "Eternal Love Package",
      descriptionAr: "باقة رومانسية تحتوي على ورود حمراء وشوكولاتة فاخرة",
      descriptionEn: "Romantic package with red roses and premium chocolate",
      price: 299,
      originalPrice: 350,
      imageUrl: "/placeholder.svg?height=200&width=200",
      category: "romantic",
      items: [
        "12 وردة حمراء",
        "علبة شوكولاتة فاخرة",
        "بطاقة معايدة",
        "ورق تغليف أنيق",
      ],
      isActive: true,
      isPopular: true,
      availableQuantity: 25,
    },
    {
      id: 2,
      nameAr: "هدية عيد الميلاد المميزة",
      nameEn: "Special Birthday Gift",
      descriptionAr: "هدية مثالية لعيد الميلاد تحتوي على كعكة وبالونات",
      descriptionEn: "Perfect birthday gift with cake and balloons",
      price: 199,
      imageUrl: "/placeholder.svg?height=200&width=200",
      category: "birthday",
      items: ["كعكة عيد ميلاد", "بالونات ملونة", "شموع", "بطاقة تهنئة"],
      isActive: true,
      isPopular: true,
      availableQuantity: 15,
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftPackage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [newGift, setNewGift] = useState<Partial<GiftPackage>>({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    price: 0,
    originalPrice: 0,
    imageUrl: "",
    category: "romantic",
    items: [],
    isActive: true,
    isPopular: false,
    availableQuantity: 0,
  });

  const { toast } = useToast();

  const categories = [
    { value: "all", label: "جميع الفئات" },
    { value: "romantic", label: "رومانسية" },
    { value: "birthday", label: "عيد ميلاد" },
    { value: "congratulations", label: "تهنئة" },
    { value: "apology", label: "اعتذار" },
    { value: "thank_you", label: "شكر" },
  ];

  const handleAddGift = () => {
    if (!newGift.nameAr || !newGift.nameEn || !newGift.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const gift: GiftPackage = {
      id: Date.now(),
      nameAr: newGift.nameAr!,
      nameEn: newGift.nameEn!,
      descriptionAr: newGift.descriptionAr || "",
      descriptionEn: newGift.descriptionEn || "",
      price: newGift.price!,
      originalPrice: newGift.originalPrice,
      imageUrl: newGift.imageUrl || "/placeholder.svg?height=200&width=200",
      category: newGift.category as GiftPackage["category"],
      items: newGift.items || [],
      isActive: newGift.isActive !== false,
      isPopular: newGift.isPopular || false,
      availableQuantity: newGift.availableQuantity || 0,
    };

    setGifts([...gifts, gift]);
    setNewGift({
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      price: 0,
      originalPrice: 0,
      imageUrl: "",
      category: "romantic",
      items: [],
      isActive: true,
      isPopular: false,
      availableQuantity: 0,
    });
    setIsAddDialogOpen(false);
    toast({
      title: "تم بنجاح",
      description: "تم إضافة الهدية بنجاح",
    });
  };

  const handleEditGift = () => {
    if (!editingGift) return;

    setGifts(gifts.map((g) => (g.id === editingGift.id ? editingGift : g)));
    setIsEditDialogOpen(false);
    setEditingGift(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث الهدية بنجاح",
    });
  };

  const handleDeleteGift = (id: number) => {
    setGifts(gifts.filter((g) => g.id !== id));
    toast({
      title: "تم بنجاح",
      description: "تم حذف الهدية بنجاح",
    });
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  const filteredGifts = gifts.filter((gift) => {
    const matchesSearch =
      gift.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || gift.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">نظام الهدايا</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              إضافة هدية جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة هدية جديدة</DialogTitle>
              <DialogDescription>أضف باقة هدايا جديدة للمتجر</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gift-nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="gift-nameAr"
                    value={newGift.nameAr}
                    onChange={(e) =>
                      setNewGift({ ...newGift, nameAr: e.target.value })
                    }
                    placeholder="اسم الهدية بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift-nameEn">الاسم بالإنجليزية *</Label>
                  <Input
                    id="gift-nameEn"
                    value={newGift.nameEn}
                    onChange={(e) =>
                      setNewGift({ ...newGift, nameEn: e.target.value })
                    }
                    placeholder="Gift name in English"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gift-price">السعر *</Label>
                  <Input
                    id="gift-price"
                    type="number"
                    value={newGift.price}
                    onChange={(e) =>
                      setNewGift({ ...newGift, price: Number(e.target.value) })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift-originalPrice">السعر الأصلي</Label>
                  <Input
                    id="gift-originalPrice"
                    type="number"
                    value={newGift.originalPrice}
                    onChange={(e) =>
                      setNewGift({
                        ...newGift,
                        originalPrice: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gift-category">الفئة</Label>
                  <Select
                    value={newGift.category}
                    onValueChange={(value) =>
                      setNewGift({
                        ...newGift,
                        category: value as GiftPackage["category"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift-quantity">الكمية المتاحة</Label>
                  <Input
                    id="gift-quantity"
                    type="number"
                    value={newGift.availableQuantity}
                    onChange={(e) =>
                      setNewGift({
                        ...newGift,
                        availableQuantity: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-imageUrl">رابط الصورة</Label>
                <Input
                  id="gift-imageUrl"
                  value={newGift.imageUrl}
                  onChange={(e) =>
                    setNewGift({ ...newGift, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gift-descriptionAr">الوصف بالعربية</Label>
                  <Textarea
                    id="gift-descriptionAr"
                    value={newGift.descriptionAr}
                    onChange={(e) =>
                      setNewGift({ ...newGift, descriptionAr: e.target.value })
                    }
                    placeholder="وصف الهدية بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift-descriptionEn">الوصف بالإنجليزية</Label>
                  <Textarea
                    id="gift-descriptionEn"
                    value={newGift.descriptionEn}
                    onChange={(e) =>
                      setNewGift({ ...newGift, descriptionEn: e.target.value })
                    }
                    placeholder="Gift description in English"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="gift-isPopular"
                    checked={newGift.isPopular}
                    onCheckedChange={(checked) =>
                      setNewGift({ ...newGift, isPopular: checked })
                    }
                  />
                  <Label htmlFor="gift-isPopular">شائعة</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="gift-isActive"
                    checked={newGift.isActive}
                    onCheckedChange={(checked) =>
                      setNewGift({ ...newGift, isActive: checked })
                    }
                  />
                  <Label htmlFor="gift-isActive">نشطة</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button onClick={handleAddGift}>إضافة الهدية</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الهدايا
            </CardTitle>
            <Gift className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gifts.length}</div>
            <p className="text-xs text-muted-foreground">هدية متاحة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الهدايا الشائعة
            </CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gifts.filter((g) => g.isPopular).length}
            </div>
            <p className="text-xs text-muted-foreground">هدية شائعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط السعر</CardTitle>
            <Gift className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gifts.length > 0
                ? Math.round(
                    gifts.reduce((sum, g) => sum + g.price, 0) / gifts.length
                  )
                : 0}{" "}
              ر.س
            </div>
            <p className="text-xs text-muted-foreground">متوسط سعر الهدايا</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث في الهدايا..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gifts Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الهدايا ({filteredGifts.length})</CardTitle>
          <CardDescription>إدارة جميع باقات الهدايا</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGifts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد هدايا متاحة</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصورة</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>العلامات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGifts.map((gift) => (
                  <TableRow key={gift.id}>
                    <TableCell>
                      <img
                        src={gift.imageUrl || "/placeholder.svg"}
                        alt={gift.nameAr}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{gift.nameAr}</div>
                        <div className="text-sm text-muted-foreground">
                          {gift.nameEn}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{gift.price} ر.س</div>
                        {gift.originalPrice &&
                          gift.originalPrice > gift.price && (
                            <div className="text-sm text-muted-foreground line-through">
                              {gift.originalPrice} ر.س
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryLabel(gift.category)}</TableCell>
                    <TableCell>{gift.availableQuantity}</TableCell>
                    <TableCell>
                      <Badge variant={gift.isActive ? "default" : "secondary"}>
                        {gift.isActive ? "نشطة" : "غير نشطة"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {gift.isPopular && (
                          <Badge variant="outline" className="text-xs">
                            شائعة
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingGift(gift);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGift(gift.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الهدية</DialogTitle>
            <DialogDescription>تعديل بيانات الهدية</DialogDescription>
          </DialogHeader>
          {editingGift && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-gift-nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="edit-gift-nameAr"
                    value={editingGift.nameAr}
                    onChange={(e) =>
                      setEditingGift({ ...editingGift, nameAr: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gift-nameEn">الاسم بالإنجليزية *</Label>
                  <Input
                    id="edit-gift-nameEn"
                    value={editingGift.nameEn}
                    onChange={(e) =>
                      setEditingGift({ ...editingGift, nameEn: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-gift-price">السعر *</Label>
                  <Input
                    id="edit-gift-price"
                    type="number"
                    value={editingGift.price}
                    onChange={(e) =>
                      setEditingGift({
                        ...editingGift,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gift-originalPrice">السعر الأصلي</Label>
                  <Input
                    id="edit-gift-originalPrice"
                    type="number"
                    value={editingGift.originalPrice}
                    onChange={(e) =>
                      setEditingGift({
                        ...editingGift,
                        originalPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="edit-gift-isPopular"
                    checked={editingGift.isPopular}
                    onCheckedChange={(checked) =>
                      setEditingGift({ ...editingGift, isPopular: checked })
                    }
                  />
                  <Label htmlFor="edit-gift-isPopular">شائعة</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="edit-gift-isActive"
                    checked={editingGift.isActive}
                    onCheckedChange={(checked) =>
                      setEditingGift({ ...editingGift, isActive: checked })
                    }
                  />
                  <Label htmlFor="edit-gift-isActive">نشطة</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleEditGift}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
