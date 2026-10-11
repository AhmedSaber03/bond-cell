import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ImagePlus,
  X,
  CheckCircle,
  AlertCircle,
  Upload,
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  images: string[];
  details: unknown;
  specifications: Record<string, string> | null;
  in_stock: boolean;
  created_at: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manufacturer: "Germany",
    images: [] as string[],
    specifications: {} as Record<string, string>,
    in_stock: true,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    fetchProducts();
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        manufacturer: product.manufacturer || "Germany",
        images: product.images || [],
        specifications: (product.specifications as Record<string, string>) || {},
        in_stock: product.in_stock !== false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        manufacturer: "Germany",
        images: [],
        specifications: {},
        in_stock: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl("");
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, publicUrl],
      }));

      toast({ title: "Image uploaded successfully!" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast({
        title: "Error uploading image",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleToggleStock = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ in_stock: !currentStatus })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, in_stock: !currentStatus } : p
        )
      );

      toast({
        title: `Product marked as ${!currentStatus ? "In Stock" : "Out of Stock"}`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update";
      toast({
        title: "Error updating stock",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        manufacturer: formData.manufacturer,
        images: formData.images,
        specifications: formData.specifications,
        in_stock: formData.in_stock,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Product updated successfully!" });
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;
        toast({ title: "Product created successfully!" });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.manufacturer?.toLowerCase().includes(term);
    const inStock = product.in_stock !== false;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && inStock) ||
      (stockFilter === "out_of_stock" && !inStock);
    return matchesSearch && matchesStock;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Product deleted successfully!" });
      fetchProducts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product catalog
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="btn-hero">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer Location</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        manufacturer: e.target.value,
                      }))
                    }
                    placeholder="e.g., Germany"
                  />
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">In Stock</Label>
                    <p className="text-xs text-muted-foreground">
                      Toggle product availability
                    </p>
                  </div>
                  <Switch
                    checked={formData.in_stock}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, in_stock: checked }))
                    }
                  />
                </div>

                {/* Specifications */}
                <div className="space-y-2">
                  <Label>Product Specifications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      placeholder="Specification name"
                      className="flex-1"
                    />
                    <Input
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleAddSpec}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {Object.keys(formData.specifications).length > 0 && (
                    <div className="space-y-2 mt-2">
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <span className="text-sm">
                            <span className="font-medium">{key}:</span> {value}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(key)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Images */}
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {isUploadingImage ? "Uploading..." : "Click to upload image from your PC"}
                      </span>
                    </label>
                  </div>

                  {/* URL Input (optional) */}
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or enter image URL"
                    />
                    <Button type="button" variant="outline" onClick={handleAddImage} disabled={!imageUrl.trim()}>
                      <ImagePlus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="flex-1 btn-hero">
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingProduct ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Stock status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products yet</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add your first product
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products match your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                      {product.description}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.in_stock !== false}
                          onCheckedChange={() =>
                            handleToggleStock(product.id, product.in_stock !== false)
                          }
                        />
                        {product.in_stock !== false ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Products;
