import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Eye,
  Heart,
} from "lucide-react";

export default function AnalyticsPage() {
  const salesData = [
    { month: "يناير", sales: 45000, orders: 120 },
    { month: "فبراير", sales: 52000, orders: 140 },
    { month: "مارس", sales: 48000, orders: 130 },
    { month: "أبريل", sales: 61000, orders: 165 },
    { month: "مايو", sales: 55000, orders: 150 },
    { month: "يونيو", sales: 67000, orders: 180 },
  ];

  const topProducts = [
    { name: "باقة الورود الحمراء", sales: 45, revenue: 6750 },
    { name: "شوكولاتة فاخرة", sales: 38, revenue: 2850 },
    { name: "هدية عيد الميلاد", sales: 32, revenue: 6400 },
    { name: "باقة الحب الأبدي", sales: 28, revenue: 8372 },
    { name: "ورود بيضاء", sales: 25, revenue: 3750 },
  ];

  const customerInsights = [
    { segment: "عملاء جدد", count: 145, percentage: 35 },
    { segment: "عملاء عائدون", count: 230, percentage: 55 },
    { segment: "عملاء VIP", count: 42, percentage: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          التحليلات والتقارير
        </h1>
        <div className="text-sm text-muted-foreground">
          آخر تحديث: {new Date().toLocaleDateString("en-GB")}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المبيعات
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">328,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الطلبات
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">885</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              العملاء النشطون
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">417</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.3%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              متوسط قيمة الطلب
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">371 ر.س</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+4.1%</span> من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
        </TabsList>

        {/* Sales Analytics */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>المبيعات الشهرية</CardTitle>
                <CardDescription>
                  تطور المبيعات خلال الأشهر الستة الماضية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((data, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-12 text-sm font-medium">
                          {data.month}
                        </div>
                        <div className="flex-1">
                          <Progress
                            value={(data.sales / 70000) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {data.sales.toLocaleString()} ر.س
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الطلبات الشهرية</CardTitle>
                <CardDescription>
                  عدد الطلبات خلال الأشهر الستة الماضية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((data, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-12 text-sm font-medium">
                          {data.month}
                        </div>
                        <div className="flex-1">
                          <Progress
                            value={(data.orders / 200) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {data.orders} طلب
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Analytics */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
                <CardDescription>
                  المنتجات الأكثر مبيعاً هذا الشهر
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.sales} مبيعة
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {product.revenue.toLocaleString()} ر.س
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات المنتجات</CardTitle>
                <CardDescription>نظرة عامة على أداء المنتجات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">إجمالي المنتجات</span>
                    </div>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">منتجات نشطة</span>
                    </div>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Eye className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">الأكثر مشاهدة</span>
                    </div>
                    <span className="font-medium">باقة الورود الحمراء</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-sm">الأكثر إعجاباً</span>
                    </div>
                    <span className="font-medium">شوكولاتة فاخرة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Analytics */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>تحليل العملاء</CardTitle>
                <CardDescription>توزيع العملاء حسب الفئات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerInsights.map((segment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {segment.segment}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {segment.count} عميل
                        </span>
                      </div>
                      <Progress value={segment.percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {segment.percentage}% من إجمالي العملاء
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات العملاء</CardTitle>
                <CardDescription>معلومات مفصلة عن العملاء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">إجمالي العملاء</span>
                    <span className="font-medium">417</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">عملاء جدد هذا الشهر</span>
                    <span className="font-medium text-green-600">+32</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">معدل الاحتفاظ</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">متوسط الطلبات لكل عميل</span>
                    <span className="font-medium">2.1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">قيمة العميل مدى الحياة</span>
                    <span className="font-medium">780 ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Analytics */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>أداء الموقع</CardTitle>
                <CardDescription>إحصائيات الزيارات والتفاعل</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">الزيارات الشهرية</span>
                    <span className="font-medium">12,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">معدل التحويل</span>
                    <span className="font-medium text-green-600">3.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">متوسط وقت الجلسة</span>
                    <span className="font-medium">4:32 دقيقة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">معدل الارتداد</span>
                    <span className="font-medium">42%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأهداف والمؤشرات</CardTitle>
                <CardDescription>تقدم الأهداف الشهرية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">هدف المبيعات الشهرية</span>
                      <span className="text-sm text-muted-foreground">
                        67,000 / 80,000 ر.س
                      </span>
                    </div>
                    <Progress value={83.75} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      83.75% مكتمل
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">هدف الطلبات الشهرية</span>
                      <span className="text-sm text-muted-foreground">
                        180 / 200 طلب
                      </span>
                    </div>
                    <Progress value={90} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      90% مكتمل
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">هدف العملاء الجدد</span>
                      <span className="text-sm text-muted-foreground">
                        32 / 50 عميل
                      </span>
                    </div>
                    <Progress value={64} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      64% مكتمل
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
