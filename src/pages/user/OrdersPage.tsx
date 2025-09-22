import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  RotateCcw,
  Calendar,
  MapPin,
  Phone,
  Star,
  Filter,
  Search,
  User,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  ChevronDown,
  X,
  Gift,
} from "lucide-react";
import { ProductImage } from "../../features/images";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Array<{
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  trackingNumber?: string;
}

const OrdersPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Mock orders data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "1",
        orderNumber: "ZS-2025-001",
        date: "2025-01-15T10:30:00Z",
        status: "delivered",
        total: 299,
        items: [
          {
            id: 101,
            name: isRtl ? "باقة ورد أحمر" : "Red Rose Bouquet",
            image:
              "https://images.pexels.com/photos/4466492/pexels-photo-4466492.jpeg?auto=compress&cs=tinysrgb&w=300",
            price: 199,
            quantity: 1,
          },
          {
            id: 201,
            name: isRtl ? "قلادة سحر فضية" : "Silver Charm Necklace",
            image:
              "https://images.pexels.com/photos/135620/pexels-photo-135620.jpeg?auto=compress&cs=tinysrgb&w=300",
            price: 100,
            quantity: 1,
          },
        ],
        shippingAddress: {
          name: isRtl ? "أحمد محمد" : "Ahmed Mohamed",
          phone: "+966 50 123 4567",
          address: isRtl
            ? "شارع الملك فهد، الرياض"
            : "King Fahd Street, Riyadh",
          city: isRtl ? "الرياض" : "Riyadh",
        },
        trackingNumber: "ZS123456789",
      },
      {
        id: "2",
        orderNumber: "ZS-2025-002",
        date: "2025-01-18T14:20:00Z",
        status: "shipped",
        total: 449,
        items: [
          {
            id: 501,
            name: isRtl ? "طقم عناية فاخر بالبشرة" : "Luxury Skincare Set",
            image:
              "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=300",
            price: 449,
            quantity: 1,
          },
        ],
        shippingAddress: {
          name: isRtl ? "فاطمة علي" : "Fatima Ali",
          phone: "+966 50 765 4321",
          address: isRtl ? "حي النخيل، جدة" : "Al Nakheel District, Jeddah",
          city: isRtl ? "جدة" : "Jeddah",
        },
        trackingNumber: "ZS987654321",
      },
      {
        id: "3",
        orderNumber: "ZS-2025-003",
        date: "2025-01-20T09:15:00Z",
        status: "processing",
        total: 599,
        items: [
          {
            id: 401,
            name: isRtl ? "عطر عود فاخر" : "Luxury Oud Perfume",
            image:
              "https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=300",
            price: 599,
            quantity: 1,
          },
        ],
        shippingAddress: {
          name: isRtl ? "سارة أحمد" : "Sarah Ahmed",
          phone: "+966 55 987 6543",
          address: isRtl
            ? "طريق الملك عبدالعزيز، الدمام"
            : "King Abdulaziz Road, Dammam",
          city: isRtl ? "الدمام" : "Dammam",
        },
      },
      {
        id: "4",
        orderNumber: "ZS-2025-004",
        date: "2025-01-22T16:45:00Z",
        status: "pending",
        total: 179,
        items: [
          {
            id: 103,
            name: isRtl ? "زهور موسمية متنوعة" : "Mixed Seasonal Flowers",
            image:
              "https://images.pexels.com/photos/132474/pexels-photo-132474.jpeg?auto=compress&cs=tinysrgb&w=300",
            price: 179,
            quantity: 1,
          },
        ],
        shippingAddress: {
          name: isRtl ? "محمد علي" : "Mohamed Ali",
          phone: "+966 50 111 2222",
          address: isRtl ? "شارع التحلية، الخبر" : "Tahlia Street, Khobar",
          city: isRtl ? "الخبر" : "Khobar",
        },
      },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, [isRtl]);

  const getStatusInfo = (status: Order["status"]) => {
    const statusMap = {
      pending: {
        label: isRtl ? "في الانتظار" : "Pending",
        color: "text-amber-700 bg-amber-100 border-amber-200",
        icon: <Clock size={16} />,
        bgGradient: "from-amber-50 to-yellow-50",
      },
      processing: {
        label: isRtl ? "قيد المعالجة" : "Processing",
        color: "text-blue-700 bg-blue-100 border-blue-200",
        icon: <Package size={16} />,
        bgGradient: "from-blue-50 to-cyan-50",
      },
      shipped: {
        label: isRtl ? "تم الشحن" : "Shipped",
        color: "text-purple-700 bg-purple-100 border-purple-200",
        icon: <Truck size={16} />,
        bgGradient: "from-purple-50 to-pink-50",
      },
      delivered: {
        label: isRtl ? "تم التسليم" : "Delivered",
        color: "text-green-700 bg-green-100 border-green-200",
        icon: <CheckCircle size={16} />,
        bgGradient: "from-green-50 to-emerald-50",
      },
      cancelled: {
        label: isRtl ? "ملغي" : "Cancelled",
        color: "text-red-700 bg-red-100 border-red-200",
        icon: <RotateCcw size={16} />,
        bgGradient: "from-red-50 to-pink-50",
      },
    };
    return statusMap[status];
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 font-serif text-neutral-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mb-6 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-purple-800 leading-tight">
            {isRtl ? "طلباتي" : "My Orders"}
          </h1>
          <p className="mt-2.5 text-sm sm:text-base max-w-xs sm:max-w-md md:max-w-lg mx-auto leading-relaxed text-gray-600">
            {isRtl
              ? "تتبع وإدارة طلباتك بسهولة"
              : "Track and manage your orders easily"}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {isRtl ? "إجمالي الطلبات" : "Total Orders"}
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {orders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {isRtl ? "تم التسليم" : "Delivered"}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {isRtl ? "قيد المعالجة" : "Processing"}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    orders.filter(
                      (o) => o.status === "processing" || o.status === "shipped"
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {isRtl ? "إجمالي المبلغ" : "Total Spent"}
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {orders.reduce((sum, order) => sum + order.total, 0)}{" "}
                  {isRtl ? "ر.س" : "SAR"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={isRtl ? "البحث في الطلبات..." : "Search orders..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Filter size={18} className="text-purple-600" />
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 pr-10 font-medium"
                >
                  <option value="all">
                    {isRtl ? "جميع الطلبات" : "All Orders"}
                  </option>
                  <option value="pending">
                    {isRtl ? "في الانتظار" : "Pending"}
                  </option>
                  <option value="processing">
                    {isRtl ? "قيد المعالجة" : "Processing"}
                  </option>
                  <option value="shipped">
                    {isRtl ? "تم الشحن" : "Shipped"}
                  </option>
                  <option value="delivered">
                    {isRtl ? "تم التسليم" : "Delivered"}
                  </option>
                  <option value="cancelled">
                    {isRtl ? "ملغي" : "Cancelled"}
                  </option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {filteredOrders.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              {isRtl ? "عرض" : "Showing"}{" "}
              <span className="font-bold text-purple-600">
                {filteredOrders.length}
              </span>{" "}
              {isRtl ? "من" : "of"}{" "}
              <span className="font-bold">{orders.length}</span>{" "}
              {isRtl ? "طلب" : "orders"}
            </div>
          )}
        </motion.div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 font-medium">
              {isRtl ? "جاري تحميل الطلبات..." : "Loading orders..."}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag size={48} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {searchTerm || filterStatus !== "all"
                ? isRtl
                  ? "لا توجد نتائج"
                  : "No Results Found"
                : isRtl
                ? "لا توجد طلبات"
                : "No Orders Yet"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              {searchTerm || filterStatus !== "all"
                ? isRtl
                  ? "لا توجد طلبات تطابق معايير البحث. جرب تعديل الفلاتر."
                  : "No orders match your search criteria. Try adjusting the filters."
                : isRtl
                ? "لم تقم بأي طلبات بعد. ابدأ في اكتشاف هداياً رائعة!"
                : "You haven't placed any orders yet. Start discovering amazing gifts!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-md font-medium"
                >
                  <X size={18} />
                  {isRtl ? "مسح الفلاتر" : "Clear Filters"}
                </button>
              )}
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg font-medium"
              >
                <Gift size={18} />
                <span>{isRtl ? "ابدأ التسوق" : "Start Shopping"}</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const isExpanded = expandedOrder === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header */}
                  <div
                    className={`bg-gradient-to-r ${statusInfo.bgGradient} p-6 border-b border-gray-100`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                          <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {isRtl ? "طلب رقم:" : "Order #"} {order.orderNumber}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>
                                {new Date(order.date).toLocaleDateString(
                                  isRtl ? "ar-EG" : "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package size={14} />
                              <span>
                                {order.items.length} {isRtl ? "منتج" : "items"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          <span className="font-medium text-sm">
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-right rtl:text-left">
                          <div className="text-xl font-bold text-purple-800">
                            {order.total} {isRtl ? "ر.س" : "SAR"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {isRtl ? "شامل الضريبة" : "Tax included"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Gift size={16} className="text-purple-600" />
                        {isRtl ? "المنتجات" : "Items"}
                      </h4>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                      >
                        <span>
                          {isExpanded
                            ? isRtl
                              ? "إخفاء التفاصيل"
                              : "Hide Details"
                            : isRtl
                            ? "عرض التفاصيل"
                            : "View Details"}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {order.items
                        .slice(0, isExpanded ? order.items.length : 3)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                          >
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover shadow-sm"
                              width={64}
                              height={64}
                              aspectRatio="square"
                              sizes="64px"
                              quality={100}
                              showZoom={false}
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-800 text-sm line-clamp-2">
                                {item.name}
                              </h5>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-purple-600 font-bold text-sm">
                                  {item.price} {isRtl ? "ر.س" : "SAR"}
                                </p>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                  {isRtl ? "الكمية:" : "Qty:"} {item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {!isExpanded && order.items.length > 3 && (
                        <div className="flex items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                          <span className="text-gray-500 text-sm font-medium">
                            +{order.items.length - 3}{" "}
                            {isRtl ? "منتج آخر" : "more items"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-100 pt-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Shipping Information */}
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                                <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                                  <MapPin size={18} />
                                  {isRtl
                                    ? "معلومات الشحن"
                                    : "Shipping Information"}
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex items-center gap-3">
                                    <User size={16} className="text-blue-600" />
                                    <span className="font-medium">
                                      {order.shippingAddress.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Phone
                                      size={16}
                                      className="text-blue-600"
                                    />
                                    <span>{order.shippingAddress.phone}</span>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <MapPin
                                      size={16}
                                      className="text-blue-600 mt-0.5"
                                    />
                                    <div>
                                      <p>{order.shippingAddress.address}</p>
                                      <p className="text-blue-600 font-medium">
                                        {order.shippingAddress.city}
                                      </p>
                                    </div>
                                  </div>
                                  {order.trackingNumber && (
                                    <div className="flex items-center gap-3 pt-2 border-t border-blue-200">
                                      <Truck
                                        size={16}
                                        className="text-blue-600"
                                      />
                                      <div>
                                        <p className="font-medium text-blue-800">
                                          {isRtl
                                            ? "رقم التتبع:"
                                            : "Tracking Number:"}
                                        </p>
                                        <p className="font-mono text-blue-600">
                                          {order.trackingNumber}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                                <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                                  <CreditCard size={18} />
                                  {isRtl ? "ملخص الطلب" : "Order Summary"}
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      {isRtl ? "المجموع الفرعي:" : "Subtotal:"}
                                    </span>
                                    <span className="font-medium">
                                      {(order.total * 0.86).toFixed(2)}{" "}
                                      {isRtl ? "ر.س" : "SAR"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      {isRtl ? "الضريبة (14%):" : "Tax (14%):"}
                                    </span>
                                    <span className="font-medium">
                                      {(order.total * 0.14).toFixed(2)}{" "}
                                      {isRtl ? "ر.س" : "SAR"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      {isRtl ? "الشحن:" : "Shipping:"}
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {isRtl ? "مجاني" : "Free"}
                                    </span>
                                  </div>
                                  <div className="border-t border-purple-200 pt-3">
                                    <div className="flex justify-between">
                                      <span className="font-bold text-purple-800">
                                        {isRtl ? "المجموع:" : "Total:"}
                                      </span>
                                      <span className="font-bold text-purple-800 text-lg">
                                        {order.total} {isRtl ? "ر.س" : "SAR"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all shadow-sm font-medium"
                      >
                        <Eye size={16} />
                        <span>
                          {isExpanded
                            ? isRtl
                              ? "إخفاء"
                              : "Hide"
                            : isRtl
                            ? "عرض"
                            : "View"}
                        </span>
                      </button>

                      {order.trackingNumber && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all shadow-sm font-medium">
                          <Truck size={16} />
                          <span>{isRtl ? "تتبع الطلب" : "Track Order"}</span>
                        </button>
                      )}

                      {order.status === "delivered" && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all shadow-sm font-medium">
                          <Star size={16} />
                          <span>{isRtl ? "تقييم الطلب" : "Rate Order"}</span>
                        </button>
                      )}

                      {(order.status === "pending" ||
                        order.status === "processing") && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all shadow-sm font-medium">
                          <RotateCcw size={16} />
                          <span>{isRtl ? "إلغاء الطلب" : "Cancel Order"}</span>
                        </button>
                      )}

                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all shadow-sm font-medium">
                        <Package size={16} />
                        <span>{isRtl ? "إعادة الطلب" : "Reorder"}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isRtl ? "هل تحتاج مساعدة؟" : "Need Help?"}
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              {isRtl
                ? "فريق خدمة العملاء لدينا متاح على مدار الساعة لمساعدتك في أي استفسارات حول طلباتك."
                : "Our customer service team is available 24/7 to help you with any questions about your orders."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg font-medium"
              >
                <Phone size={18} />
                <span>{isRtl ? "تواصل معنا" : "Contact Us"}</span>
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-md font-medium"
              >
                <AlertCircle size={18} />
                <span>{isRtl ? "الأسئلة الشائعة" : "FAQ"}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
