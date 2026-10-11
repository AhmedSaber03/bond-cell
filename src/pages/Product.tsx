import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/layout/SiteFooter";
import { AUTH_SYSTEM_LABEL, BRAND_NAME } from "@/lib/brand";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  ArrowLeft,
  Award,
  AlertTriangle,
  BadgeCheck,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  images: string[];
  details: Record<string, unknown> | null;
  specifications?: Record<string, unknown> | null;
}

interface VerificationData {
  product: Product;
  session_expires_at: string;
  first_verification: boolean;
  verified_at: string;
}

const Product = () => {
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = sessionStorage.getItem("verification_data");
    if (!storedData) {
      navigate("/");
      return;
    }

    let data: VerificationData;
    try {
      data = JSON.parse(storedData) as VerificationData;
    } catch {
      sessionStorage.removeItem("verification_data");
      navigate("/");
      return;
    }

    if (!data?.product?.id || !data.session_expires_at) {
      sessionStorage.removeItem("verification_data");
      navigate("/");
      return;
    }

    const expiresAt = new Date(data.session_expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      sessionStorage.removeItem("verification_data");
      navigate("/");
      return;
    }

    setVerificationData(data);

    const updateCountdown = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        sessionStorage.removeItem("verification_data");
        navigate("/");
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCountdown();

    const fetchOtherProducts = async () => {
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .neq("id", data.product.id)
        .limit(4);

      if (products) {
        setOtherProducts(products as Product[]);
      }
    };

    fetchOtherProducts();

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!verificationData) {
    return null;
  }

  const { product, verified_at, first_verification } = verificationData;

  const certifications = [
    { name: "ISO 9001:2015", description: "Quality Management", icon: "🏆" },
    { name: "ISO 13485:2016", description: "Medical Devices QMS", icon: "⚕️" },
    { name: "CE Certified", description: "European Conformity", icon: "✓" },
    { name: "GMP Compliant", description: "Good Manufacturing", icon: "🔬" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-200">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-bold text-orange-600">
                {timeRemaining}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-primary/5 text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Verification
        </Button>

        {/* Session Warning - Enhanced */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 shadow-lg animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900 mb-1">
                ⏰ Time-Limited Access
              </h3>
              <p className="text-orange-700 leading-relaxed">
                This verification page is valid for{" "}
                <strong>60 minutes only</strong>. After that, this code is
                permanently locked and cannot be verified again. Save or
                screenshot if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner - Enhanced */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-2xl animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black text-green-900">
                  ✓ 100% Authentic Product
                </h2>
                <Badge className="bg-green-600 text-white px-3 py-1.5">
                  {first_verification !== false
                    ? "First Verification"
                    : "Session Active"}
                </Badge>
              </div>
              <p className="text-lg text-green-700 mb-4">
                This product is genuine and manufactured by{" "}
                <strong>{BRAND_NAME}</strong>.
              </p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Verified:</span>
                  <span>
                    {verified_at
                      ? new Date(verified_at).toLocaleString()
                      : "Just now"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Made in:</span>
                  <span>{product.manufacturer}</span>
                </div>
              </div>
            </div>
            {/* Flag Badge */}
            <div className="flex flex-col items-center gap-2 bg-white/80 px-6 py-4 rounded-2xl shadow-lg">
              <div className="text-6xl">🇩🇪</div>
              <span className="text-sm font-bold text-gray-700">Germany</span>
            </div>
          </div>
        </div>

        {/* Certifications - Enhanced */}
        {/* <div
          className="mb-10 p-6 rounded-2xl bg-white border border-gray-200 shadow-lg animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary">
              Certifications & Compliance
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cert.icon}</span>
                  <BadgeCheck className="w-4 h-4 text-primary" />
                </div>
                <p className="font-bold text-primary text-sm mb-1">
                  {cert.name}
                </p>
                <p className="text-xs text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Product Details Grid - Enhanced */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Product Images */}
          <div className="space-y-4 animate-slide-up">
            <div className="aspect-square rounded-3xl bg-white border-2 border-gray-200 overflow-hidden relative shadow-2xl">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="w-32 h-32 text-gray-400" />
                </div>
              )}
              {/* Verified Badge Overlay */}
              <div className="absolute top-6 left-6">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 text-base shadow-xl">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Verified Original
                </Badge>
              </div>
              {/* German Flag Badge */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2.5">
                <span className="text-3xl">🇩🇪</span>
                <span className="text-sm font-bold text-gray-800">
                  Made in Germany
                </span>
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl bg-white border border-gray-200 overflow-hidden hover:scale-105 transition-transform duration-300 shadow-md"
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Enhanced */}
          <div
            className="space-y-6 animate-slide-up"
            style={{ animationDelay: "150ms" }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                100% Original
              </Badge>
              {/* <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2">
                🇩🇪 German Quality
              </Badge> */}
              <Badge className="bg-gradient-to-r from-primary to-primary-600 text-white px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Authenticated
              </Badge>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Specifications */}
            {product.specifications &&
              typeof product.specifications === "object" &&
              Object.keys(product.specifications).length > 0 && (
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Specifications
                  </h3>
                  <div className="space-y-3">
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

            {/* Authenticity Card - Enhanced */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">
                    Authenticity Guaranteed
                  </h3>
                  <p className="text-sm text-gray-600">
                    Verified by {AUTH_SYSTEM_LABEL}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-blue-200">
                <div className="bg-white/80 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Manufacturer</p>
                  <p className="font-bold text-primary flex items-center gap-2">
                    <span className="text-2xl">🇩🇪</span>
                    {product.manufacturer}
                  </p>
                </div>
                <div className="bg-white/80 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-bold text-green-600 text-lg">
                    100% Original
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Products */}
        {otherProducts.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h2 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
              <Package className="w-8 h-8" />
              More from {BRAND_NAME}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <SiteFooter />
    </div>
  );
};

export default Product;
