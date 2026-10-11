import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import SiteFooter from "@/components/layout/SiteFooter";
import { BRAND_NAME } from "@/lib/brand";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import StockRequestDialog from "@/components/StockRequestDialog";
import { Shield, Package, Loader2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  images: string[] | null;
  in_stock: boolean;
  specifications?: Record<string, unknown> | null;
}

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(
    searchParams.get("search") || ""
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const searchTerm = localSearch.toLowerCase();
    if (searchTerm) {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm)
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [localSearch, products]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, description, manufacturer, images, in_stock, specifications"
      )
      .order("name");

    if (data) {
      setProducts(data as unknown as Product[]);
      setFilteredProducts(data as unknown as Product[]);
    }
    setIsLoading(false);
  };

  const handleRequestStock = (product: Product) => {
    setSelectedProduct(product);
    setShowRequestDialog(true);
  };

  const handleProductClick = (product: Product) => {
    setDetailProduct(product);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-bondcell">
      <Header />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 border border-primary/10 rounded-full text-primary text-sm font-bold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Peptide catalog
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
              Explore {BRAND_NAME}
              <span className="block text-transparent bg-clip-text bg-gradient-accent">
                research peptides
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Browse SKUs, review specifications, and request bulk availability.
              Every unit includes serial verification for guaranteed authenticity.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-14 pr-6 py-7 text-lg rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-lg transition-all"
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                <Loader2 className="relative w-16 h-16 text-primary animate-spin" />
              </div>
              <p className="mt-6 text-lg text-gray-600 font-medium">
                Loading products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6 shadow-lg">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or browse all products
              </p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-8 flex items-center justify-between">
                <p className="text-lg text-gray-600">
                  <span className="font-bold text-primary">
                    {filteredProducts.length}
                  </span>
                  {filteredProducts.length === 1 ? " product" : " products"}{" "}
                  found
                </p>
              </div>

              {/* Products Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-slide-up">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductCard
                      product={product}
                      showStockStatus
                      onRequestStock={() => handleRequestStock(product)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Trust Section */}
          {!isLoading && filteredProducts.length > 0 && (
            <div className="mt-20 p-10 rounded-3xl bg-white/90 border border-primary/10 shadow-xl">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-lg shadow-primary/20 mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-4">
                  Authenticity built in
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Every {BRAND_NAME} product ships with a unique serial number
                  and one-time verification code so you can confirm genuine
                  peptides before they reach your lab.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Footer */}
      {/* <footer className="border-t-2 border-gray-200 bg-white shadow-inner">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Protected by Nexa Biotech Authentication System
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 font-medium">
                <span className="text-2xl">🇩🇪</span>
                <span>Made in Germany</span>
              </div>
              <span className="hidden md:inline text-gray-300">•</span>
              <span>© {new Date().getFullYear()} Nexa Biotech Solutions. All rights reserved.</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p className="font-medium">Nexa Biotech Solutions • Innovation Drive 123 • Tech Park, CA 94000</p>
          </div>
        </div>
      </footer> */}

      <SiteFooter />

      {/* Product Details Dialog */}
      <ProductDetailModal
        product={detailProduct}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onRequestStock={handleRequestStock}
      />

      {/* Stock Request Dialog */}
      <StockRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        product={selectedProduct}
      />
    </div>
  );
};

export default AllProducts;
