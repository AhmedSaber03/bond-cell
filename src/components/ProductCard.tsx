import { Package, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  images: string[] | null;
  in_stock?: boolean;
}

interface ProductCardProps {
  product: Product;
  showStockStatus?: boolean;
  onRequestStock?: () => void;
}

const ProductCard = ({
  product,
  showStockStatus,
  onRequestStock,
}: ProductCardProps) => {
  const isInStock = product.in_stock !== false;

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="aspect-[3/3] bg-muted overflow-hidden relative">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        {showStockStatus && (
          <div className="absolute top-2 right-2">
            {isInStock ? (
              <Badge className="bg-success/90 text-white hover:bg-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                In Stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-destructive/90">
                <AlertCircle className="w-3 h-3 mr-1" />
                Out of Stock
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            Made in {product.manufacturer || "Germany"}
          </p>
          {showStockStatus && !isInStock && onRequestStock && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRequestStock();
              }}
            >
              Request Stock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
