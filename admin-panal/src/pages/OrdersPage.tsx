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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  products: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  orderDate: string;
  deliveryDate?: string;
  address: string;
  notes?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1001,
      customerName: "أحمد محمد",
      customerPhone: "0501234567",
      customerEmail: "ahmed@example.com",
      products: [
        { name: "باقة ورود حمراء", quantity: 1, price: 150 },
        { name: "شوكولاتة فاخرة", quantity: 2, price: 75 },
      ],
      totalAmount: 300,
      status: "pending",
      orderDate: "2024-01-15",
      address: "الرياض، حي النخيل، شارع الملك فهد",
      notes: "يرجى التسليم في المساء",
    },
    {
      id: 1002,
      customerName: "فاطمة علي",
      customerPhone: "0507654321",
      customerEmail: "fatima@example.com",
      products: [{ name: "هدية عيد ميلاد", quantity: 1, price: 200 }],
      totalAmount: 200,
      status: "confirmed",
      orderDate: "2024-01-14",
      deliveryDate: "2024-01-16",
      address: "جدة، حي الصفا، شارع التحلية",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { toast } = useToast();

  const statusOptions = [
    { value: "all", label: "جميع الحالات" },
    { value: "pending", label: "في الانتظار" },
    { value: "confirmed", label: "مؤكد" },
    { value: "preparing", label: "قيد التحضير" },
    { value: "shipped", label: "تم الشحن" },
    { value: "delivered", label: "تم التسليم" },
    { value: "cancelled", label: "ملغي" },
  ];

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { label: "في الانتظار", variant: "secondary" as const },
      confirmed: { label: "مؤكد", variant: "default" as const },
      preparing: { label: "قيد التحضير", variant: "outline" as const },
      shipped: { label: "تم الشحن", variant: "default" as const },
      delivered: { label: "تم التسليم", variant: "default" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const },
    };

    return (
      <Badge variant={statusConfig[status].variant}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  const updateOrderStatus = (orderId: number, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast({
      title: "تم التحديث",
      description: "تم تحديث حالة الطلب بنجاح",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">إدارة الطلبات</h1>
        <div className="text-sm text-muted-foreground">
          إجمالي الطلبات: {orders.length}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات جديدة</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التحضير</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "preparing").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تم التسليم</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "delivered").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملغية</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "cancelled").length}
            </div>
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
                placeholder="البحث برقم الطلب أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات ({filteredOrders.length})</CardTitle>
          <CardDescription>إدارة جميع طلبات العملاء</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد طلبات متاحة</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المنتجات</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الطلب</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customerPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.products.map((product, index) => (
                          <div key={index}>
                            {product.name} (×{product.quantity})
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{order.totalAmount} ر.س</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {(() => {
                        const date = new Date(order.orderDate);
                        const day = String(date.getUTCDate()).padStart(2, "0");
                        const month = String(date.getUTCMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const year = date.getUTCFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                تفاصيل الطلب #{order.id}
                              </DialogTitle>
                              <DialogDescription>
                                معلومات مفصلة عن الطلب
                              </DialogDescription>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      معلومات العميل
                                    </h4>
                                    <p>
                                      <strong>الاسم:</strong>{" "}
                                      {selectedOrder.customerName}
                                    </p>
                                    <p>
                                      <strong>الهاتف:</strong>{" "}
                                      {selectedOrder.customerPhone}
                                    </p>
                                    <p>
                                      <strong>البريد:</strong>{" "}
                                      {selectedOrder.customerEmail}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      معلومات الطلب
                                    </h4>
                                    <p>
                                      <strong>التاريخ:</strong>{" "}
                                      {(() => {
                                        const date = new Date(
                                          selectedOrder.orderDate
                                        );
                                        const day = String(
                                          date.getUTCDate()
                                        ).padStart(2, "0");
                                        const month = String(
                                          date.getUTCMonth() + 1
                                        ).padStart(2, "0");
                                        const year = date.getUTCFullYear();
                                        return `${day}/${month}/${year}`;
                                      })()}
                                    </p>
                                    <p>
                                      <strong>الحالة:</strong>{" "}
                                      {getStatusBadge(selectedOrder.status)}
                                    </p>
                                    <p>
                                      <strong>المبلغ:</strong>{" "}
                                      {selectedOrder.totalAmount} ر.س
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    العنوان
                                  </h4>
                                  <p>{selectedOrder.address}</p>
                                </div>
                                {selectedOrder.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      ملاحظات
                                    </h4>
                                    <p>{selectedOrder.notes}</p>
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    المنتجات
                                  </h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>المنتج</TableHead>
                                        <TableHead>الكمية</TableHead>
                                        <TableHead>السعر</TableHead>
                                        <TableHead>الإجمالي</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedOrder.products.map(
                                        (product, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              {product.name}
                                            </TableCell>
                                            <TableCell>
                                              {product.quantity}
                                            </TableCell>
                                            <TableCell>
                                              {product.price} ر.س
                                            </TableCell>
                                            <TableCell>
                                              {product.quantity * product.price}{" "}
                                              ر.س
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                                <div className="flex gap-2">
                                  <Select
                                    value={selectedOrder.status}
                                    onValueChange={(value) =>
                                      updateOrderStatus(
                                        selectedOrder.id,
                                        value as Order["status"]
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">
                                        في الانتظار
                                      </SelectItem>
                                      <SelectItem value="confirmed">
                                        مؤكد
                                      </SelectItem>
                                      <SelectItem value="preparing">
                                        قيد التحضير
                                      </SelectItem>
                                      <SelectItem value="shipped">
                                        تم الشحن
                                      </SelectItem>
                                      <SelectItem value="delivered">
                                        تم التسليم
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        ملغي
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
