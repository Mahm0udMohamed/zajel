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
import { ImageWithError } from "../ui/ImageWithError";
import ProductFormPage from "./ProductFormPage";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Loader2,
  Eye,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiService } from "../../services/api";
import type { Product } from "../../types/products";

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "add" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  // تحميل البيانات من الباك إند
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      setProducts(
        Array.isArray(response.data) ? (response.data as Product[]) : []
      );
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنتجات",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند بدء المكون
  useEffect(() => {
    loadProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSuccess = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setViewMode("list");
  };

  const handleEditSuccess = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setViewMode("list");
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setViewMode("edit");
  };

  const handleDeleteClick = (id: string) => {
    if (!id) {
      toast({
        title: "خطأ",
        description: "معرف المنتج غير صحيح",
        variant: "destructive",
      });
      return;
    }
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    const productToDelete = products.find(
      (product) => product._id === deletingId
    );

    if (!productToDelete) {
      toast({
        title: "خطأ",
        description: "المنتج غير موجود",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await apiService.deleteProduct(deletingId);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== deletingId)
      );
      toast({
        title: "تم بنجاح",
        description: `تم حذف المنتج "${productToDelete.nameAr}" بنجاح`,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `فشل في حذف المنتج: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updatedProduct = await apiService.toggleProductStatus(id);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? (updatedProduct as Product) : product
        )
      );
      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة المنتج بنجاح",
      });
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المنتج",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getProductStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      "الأكثر مبيعًا": "bg-green-500/20 border-green-500/50 text-green-300",
      "المجموعات المميزة":
        "bg-purple-500/20 border-purple-500/50 text-purple-300",
      "هدايا فاخرة": "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
      "مناسبة خاصة": "bg-pink-500/20 border-pink-500/50 text-pink-300",
    };

    return (
      <Badge
        variant="outline"
        className={`text-xs ${
          statusColors[status] ||
          "bg-gray-500/20 border-gray-500/50 text-gray-300"
        }`}
      >
        {status}
      </Badge>
    );
  };

  const getTargetAudienceBadge = (audience: string) => {
    const audienceColors: Record<string, string> = {
      له: "bg-blue-500/20 border-blue-500/50 text-blue-300",
      لها: "bg-pink-500/20 border-pink-500/50 text-pink-300",
      لكابلز: "bg-purple-500/20 border-purple-500/50 text-purple-300",
    };

    return (
      <Badge
        variant="outline"
        className={`text-xs ${
          audienceColors[audience] ||
          "bg-gray-500/20 border-gray-500/50 text-gray-300"
        }`}
      >
        {audience}
      </Badge>
    );
  };

  // إذا كان في وضع الإضافة أو التعديل، اعرض النموذج
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <ProductFormPage
        mode={viewMode}
        product={editingProduct}
        onCancel={() => {
          setViewMode("list");
          setEditingProduct(null);
        }}
        onSuccess={viewMode === "add" ? handleAddSuccess : handleEditSuccess}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                إدارة المنتجات
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                إدارة جميع المنتجات في المتجر مع إمكانية الإضافة والتعديل والحذف
              </CardDescription>
            </div>
            <Button onClick={() => setViewMode("add")}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة منتج
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
                  <TableHead className="w-40 min-w-[160px]">المنتج</TableHead>
                  <TableHead className="w-32 min-w-[128px]">السعر</TableHead>
                  <TableHead className="w-40 min-w-[160px]">التصنيف</TableHead>
                  <TableHead className="w-32 min-w-[128px]">الحالة</TableHead>
                  <TableHead className="w-24 min-w-[96px]">
                    الإحصائيات
                  </TableHead>
                  <TableHead className="w-32 min-w-[128px]">
                    تاريخ الإنشاء
                  </TableHead>
                  <TableHead className="w-32 min-w-[128px]">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-8 h-8 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          لا توجد منتجات
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((product, index) => {
                      const productId =
                        product._id || `product-${index}-${Date.now()}`;
                      return (
                        <TableRow key={productId}>
                          <TableCell>
                            <div className="flex justify-center">
                              <ImageWithError
                                src={product.mainImage}
                                alt={product.nameAr}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-600/50"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center justify-center">
                              <div className="font-medium text-center">
                                {product.nameAr}
                              </div>
                              <div className="text-sm text-muted-foreground text-center">
                                {product.nameEn}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <div className="font-medium">
                                {formatPrice(product.price)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center justify-center gap-1">
                              <div className="text-sm font-medium text-center">
                                {product.category?.nameAr}
                              </div>
                              <div className="flex flex-wrap justify-center gap-1">
                                {getProductStatusBadge(product.productStatus)}
                                {getTargetAudienceBadge(product.targetAudience)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Badge
                                variant={
                                  product.isActive ? "default" : "secondary"
                                }
                                className={
                                  product.isActive
                                    ? "bg-green-500/20 border-green-500/50 text-green-300 flex-shrink-0"
                                    : "flex-shrink-0"
                                }
                              >
                                {product.isActive ? "نشط" : "غير نشط"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleActive(productId)}
                                className="flex-shrink-0 scale-75"
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    product.isActive
                                      ? "bg-green-500 border-green-500"
                                      : "bg-gray-400 border-gray-400"
                                  }`}
                                />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center justify-center gap-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{product.viewCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="w-3 h-3" />
                                <span>{product.purchaseCount || 0}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <div className="text-sm text-center">
                                {new Date(product.createdAt).toLocaleDateString(
                                  "ar-SA"
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
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
                                onClick={() => handleDeleteClick(productId)}
                                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 shadow-red-500/20 h-8 px-2 text-xs"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline mr-1">
                                  حذف
                                </span>
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف المنتج"
        description="هل أنت متأكد من أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
