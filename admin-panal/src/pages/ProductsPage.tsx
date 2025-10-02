import ProductsTab from "../components/products/ProductsTab";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          إدارة المنتجات
        </h1>
      </div>

      <ProductsTab />
    </div>
  );
}
