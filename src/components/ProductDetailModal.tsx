// src/components/ProductDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Shield, CheckCircle2, ShoppingCart, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  images: string[] | null;
  in_stock: boolean;
  specifications?: Record<string, unknown> | null;
}

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestStock: (product: Product) => void;
}

const ProductDetailModal = ({
  product,
  open,
  onOpenChange,
  onRequestStock,
}: ProductDetailModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 rounded-3xl border-2 overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Product Name Header */}
          <div className="p-6 pb-15">
            <DialogTitle className="text-3xl font-black text-primary">
              {product.name}
            </DialogTitle>
          </div>

          {/* Hero Image Section */}
          <div className="relative w-full aspect-[9/9] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-3xl overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
            {/* Badges on image */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge
                className={`px-3 py-1.5 text-white shadow-lg ${
                  product.in_stock
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              >
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            {/* <div className="absolute top-4 right-4">
              <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                <span className="text-2xl">🇩🇪</span>
                <span className="text-xs font-bold text-gray-700">
                  Made in Germany
                </span>
              </div>
            </div> */}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="px-6 pt-4 flex gap-3 overflow-x-auto">
              {product.images.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Name & Description */}
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white px-3 py-1">
                <Shield className="w-3 h-3 mr-1.5" />
                Authenticated
              </Badge>
              <Badge
                className={`px-3 py-1 text-white ${
                  product.in_stock
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              >
                {product.in_stock ? "✓ In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {/* Product Specs */}
            <div className="p-6 pb-3">
              {product.description && (
                <p className="text-base text-gray-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Manufacturer Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Manufacturer</p>
                <p className="font-bold text-primary flex items-center gap-2">
                  <span className="text-xl">🇩🇪</span>
                  {product.manufacturer || "Germany"}
                </p>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications &&
              typeof product.specifications === "object" &&
              Object.keys(product.specifications).length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Specifications
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-gray-600 font-medium capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="font-bold text-primary">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Action Button */}
            {!product.in_stock && (
              <div className="pt-2">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onRequestStock(product);
                  }}
                  className="w-full py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-xl"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Request Bulk Order
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
