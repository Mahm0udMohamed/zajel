import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Package,
  ShoppingCart,
  Gift,
  BarChart3,
  Users,
  ImageIcon,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "إجمالي المنتجات",
      value: "0",
      description: "منتج متاح",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "الطلبات الجديدة",
      value: "0",
      description: "طلب جديد",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "الهدايا المتاحة",
      value: "0",
      description: "هدية متاحة",
      icon: Gift,
      color: "text-purple-600",
    },
    {
      title: "المستخدمين",
      value: "0",
      description: "مستخدم مسجل",
      icon: Users,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-GB")}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
          <CardDescription>الوصول السريع للمهام الأساسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">إضافة منتج جديد</h3>
                <p className="text-sm text-muted-foreground">
                  أضف منتج جديد للمتجر
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">إدارة المحتوى</h3>
                <p className="text-sm text-muted-foreground">
                  تحديث محتوى الموقع
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">عرض التقارير</h3>
                <p className="text-sm text-muted-foreground">
                  تحليل الأداء والمبيعات
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
