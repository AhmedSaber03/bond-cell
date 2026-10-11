import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, CheckCircle2, Shield, Phone, User, Hash } from "lucide-react";
import { z } from "zod";

interface Product {
  id: string;
  name: string;
  images?: string[] | null;
}

interface StockRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const requestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().min(8, "Phone number must be at least 8 characters").max(20),
  quantity: z.number().min(1, "Quantity must be at least 1").max(1000),
});

const StockRequestDialog = ({ open, onOpenChange, product }: StockRequestDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = requestSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      quantity: formData.quantity,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!product) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("stock_requests").insert({
        product_id: product.id,
        customer_name: formData.name.trim(),
        phone_number: formData.phone.trim(),
        quantity: formData.quantity,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Request submitted!",
        description: "We'll contact you when the product is available.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit request";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", phone: "", quantity: 1 });
    setErrors({});
    setIsSuccess(false);
    onOpenChange(false);
  };

  if (!product) return null;

  const productImage = product.images?.[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-[#002447] via-[#003d75] to-[#0062F7] px-6 pt-6 pb-8 text-white">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_55%)]" />
          <DialogHeader className="relative space-y-3">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5" />
              Priority Stock Request
            </div>
            <DialogTitle className="text-xl text-white">
              Reserve Your Product
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Leave your details and our team will contact you as soon as this
              item is back in stock.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-5 flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/15">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-white/70" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/70">Requesting</p>
              <p className="font-semibold truncate">{product.name}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  Request Received
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Thank you, {formData.name}. We&apos;ll reach you at{" "}
                  <span className="font-medium text-foreground">
                    {formData.phone}
                  </span>{" "}
                  when <span className="font-medium text-foreground">{product.name}</span>{" "}
                  is available again.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full btn-hero">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  maxLength={100}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  maxLength={20}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="inline-flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  Quantity Needed
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={1000}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))
                  }
                />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 btn-hero">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockRequestDialog;
