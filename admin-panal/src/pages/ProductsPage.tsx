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
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  occasionId: string;
  descriptionAr: string;
  descriptionEn: string;
  isBestSeller: boolean;
  isSpecialGift: boolean;
  isActive: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    nameAr: "",
    nameEn: "",
    price: 0,
    imageUrl: "",
    categoryId: "",
    occasionId: "",
    descriptionAr: "",
    descriptionEn: "",
    isBestSeller: false,
    isSpecialGift: false,
    isActive: true,
  });

  const { toast } = useToast();

  const categories = [
    { id: "flowers", name: "الورود" },
    { id: "gifts", name: "الهدايا" },
    { id: "chocolates", name: "الشوكولاتة" },
  ];

  const occasions = [
    { id: "birthday", name: "عيد ميلاد" },
    { id: "wedding", name: "زفاف" },
    { id: "graduation", name: "تخرج" },
  ];

  const handleAddProduct = () => {
    if (!newProduct.nameAr || !newProduct.nameEn || !newProduct.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      id: Date.now(),
      nameAr: newProduct.nameAr!,
      nameEn: newProduct.nameEn!,
      price: newProduct.price!,
      imageUrl: newProduct.imageUrl || "/placeholder.svg?height=100&width=100",
      categoryId: newProduct.categoryId!,
      occasionId: newProduct.occasionId!,
      descriptionAr: newProduct.descriptionAr!,
      descriptionEn: newProduct.descriptionEn!,
      isBestSeller: newProduct.isBestSeller || false,
      isSpecialGift: newProduct.isSpecialGift || false,
      isActive: newProduct.isActive !== false,
    };

    setProducts([...products, product]);
    setNewProduct({
      nameAr: "",
      nameEn: "",
      price: 0,
      imageUrl: "",
      categoryId: "",
      occasionId: "",
      descriptionAr: "",
      descriptionEn: "",
      isBestSeller: false,
      isSpecialGift: false,
      isActive: true,
    });
    setIsAddDialogOpen(false);
    toast({
      title: "تم بنجاح",
      description: "تم إضافة المنتج بنجاح",
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    setProducts(
      products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث المنتج بنجاح",
    });
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    toast({
      title: "تم بنجاح",
      description: "تم حذف المنتج بنجاح",
    });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">إدارة المنتجات</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد</DialogTitle>
              <DialogDescription>أضف منتج جديد إلى المتجر</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="nameAr"
                    value={newProduct.nameAr}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, nameAr: e.target.value })
                    }
                    placeholder="اسم المنتج بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">الاسم بالإنجليزية *</Label>
                  <Input
                    id="nameEn"
                    value={newProduct.nameEn}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, nameEn: e.target.value })
                    }
                    placeholder="Product name in English"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">رابط الصورة</Label>
                  <Input
                    id="imageUrl"
                    value={newProduct.imageUrl}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">الفئة</Label>
                  <Select
                    value={newProduct.categoryId}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasionId">المناسبة</Label>
                  <Select
                    value={newProduct.occasionId}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, occasionId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المناسبة" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map((occasion) => (
                        <SelectItem key={occasion.id} value={occasion.id}>
                          {occasion.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">الوصف بالعربية</Label>
                  <Textarea
                    id="descriptionAr"
                    value={newProduct.descriptionAr}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        descriptionAr: e.target.value,
                      })
                    }
                    placeholder="وصف المنتج بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">الوصف بالإنجليزية</Label>
                  <Textarea
                    id="descriptionEn"
                    value={newProduct.descriptionEn}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        descriptionEn: e.target.value,
                      })
                    }
                    placeholder="Product description in English"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="isBestSeller"
                    checked={newProduct.isBestSeller}
                    onCheckedChange={(checked) =>
                      setNewProduct({ ...newProduct, isBestSeller: checked })
                    }
                  />
                  <Label htmlFor="isBestSeller">الأكثر مبيعاً</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="isSpecialGift"
                    checked={newProduct.isSpecialGift}
                    onCheckedChange={(checked) =>
                      setNewProduct({ ...newProduct, isSpecialGift: checked })
                    }
                  />
                  <Label htmlFor="isSpecialGift">هدية خاصة</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="isActive"
                    checked={newProduct.isActive}
                    onCheckedChange={(checked) =>
                      setNewProduct({ ...newProduct, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">نشط</Label>
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
              <Button onClick={handleAddProduct}>إضافة المنتج</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات ({filteredProducts.length})</CardTitle>
          <CardDescription>إدارة جميع منتجات المتجر</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد منتجات متاحة</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصورة</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المناسبة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>العلامات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.nameAr}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.nameAr}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.nameEn}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.price} ر.س</TableCell>
                    <TableCell>
                      {categories.find((c) => c.id === product.categoryId)
                        ?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {occasions.find((o) => o.id === product.occasionId)
                        ?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                      >
                        {product.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.isBestSeller && (
                          <Badge variant="outline" className="text-xs">
                            الأكثر مبيعاً
                          </Badge>
                        )}
                        {product.isSpecialGift && (
                          <Badge variant="outline" className="text-xs">
                            هدية خاصة
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
                            setEditingProduct(product);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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
            <DialogTitle>تعديل المنتج</DialogTitle>
            <DialogDescription>تعديل بيانات المنتج</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="edit-nameAr"
                    value={editingProduct.nameAr}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        nameAr: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nameEn">الاسم بالإنجليزية *</Label>
                  <Input
                    id="edit-nameEn"
                    value={editingProduct.nameEn}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        nameEn: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">السعر *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-imageUrl">رابط الصورة</Label>
                  <Input
                    id="edit-imageUrl"
                    value={editingProduct.imageUrl}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="edit-isBestSeller"
                    checked={editingProduct.isBestSeller}
                    onCheckedChange={(checked) =>
                      setEditingProduct({
                        ...editingProduct,
                        isBestSeller: checked,
                      })
                    }
                  />
                  <Label htmlFor="edit-isBestSeller">الأكثر مبيعاً</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="edit-isSpecialGift"
                    checked={editingProduct.isSpecialGift}
                    onCheckedChange={(checked) =>
                      setEditingProduct({
                        ...editingProduct,
                        isSpecialGift: checked,
                      })
                    }
                  />
                  <Label htmlFor="edit-isSpecialGift">هدية خاصة</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="edit-isActive"
                    checked={editingProduct.isActive}
                    onCheckedChange={(checked) =>
                      setEditingProduct({
                        ...editingProduct,
                        isActive: checked,
                      })
                    }
                  />
                  <Label htmlFor="edit-isActive">نشط</Label>
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
            <Button onClick={handleEditProduct}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
