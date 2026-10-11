import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { collectVerificationMeta } from "@/lib/verificationMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Key, Lock } from "lucide-react";
import { LOGO_CLASS_FORM, LOGO_SRC } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface VerifyResult {
  success: boolean;
  error?: string;
  product?: unknown;
  session_expires_at?: string;
  verified_at?: string;
  first_verification?: boolean;
}

interface VerificationFormProps {
  showLogo?: boolean;
  className?: string;
}

const VerificationForm = ({
  showLogo = true,
  className,
}: VerificationFormProps) => {
  const [serialNumber, setSerialNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const meta = await collectVerificationMeta();

      const { data, error } = await supabase.rpc("verify_product", {
        _serial_number: serialNumber.trim().toUpperCase(),
        _password: password.trim().toUpperCase(),
        _ip_address: meta.ip,
        _country: meta.country,
        _city: meta.city,
        _user_agent: meta.userAgent,
      });

      if (error) throw error;

      const result = data as VerifyResult;

      if (result.success && result.product) {
        sessionStorage.setItem(
          "verification_data",
          JSON.stringify({
            product: result.product,
            session_expires_at: result.session_expires_at,
            first_verification: result.first_verification ?? true,
            verified_at: result.verified_at || new Date().toISOString(),
          })
        );

        toast({
          title: "✓ Verification Successful!",
          description: result.first_verification
            ? "Product authenticated successfully"
            : "Session restored — product is still authenticated",
          className: "bg-green-50 border-green-200",
        });

        navigate("/product");
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Verification failed";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={cn("card-premium-dark p-8 md:p-10", className)}>
      <div className={cn("mb-8", showLogo ? "text-center" : "text-left")}>
        {showLogo && (
          <img
            src={LOGO_SRC}
            alt="Bond&Cell"
            width={400}
            height={100}
            className={cn(LOGO_CLASS_FORM, "mx-auto mb-6")}
          />
        )}
        <p
          className={cn(
            "accent-chip mb-4 w-fit",
            showLogo ? "mx-auto" : "mx-0"
          )}
        >
          Peptide verification
        </p>
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-primary mb-2">
          Check authenticity
        </h2>
        <p className="text-muted-foreground">
          Serial number plus scratch-off code from your vial packaging
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="serial"
            className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-primary" />
            Serial number
          </Label>
          <Input
            id="serial"
            type="text"
            placeholder="BNC-XXXX-XXXX-XXXX"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
            className="input-bondcell font-mono text-lg rounded-md"
            required
            disabled={isVerifying}
          />
          <p className="text-xs text-muted-foreground">
            Printed on the outer label
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-primary" />
            Verification code
          </Label>
          <Input
            id="password"
            type="text"
            placeholder="XXXXXXXX"
            value={password}
            onChange={(e) => setPassword(e.target.value.toUpperCase())}
            className="input-bondcell font-mono text-lg rounded-md"
            required
            disabled={isVerifying}
          />
          <p className="text-xs text-muted-foreground">
            8 characters under the scratch panel
          </p>
        </div>

        <Button
          type="submit"
          disabled={isVerifying}
          className="w-full btn-bondcell text-lg py-6 rounded-md"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Verify product
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-muted border border-primary/10 rounded-md">
        <div className="text-sm">
          <p className="font-semibold text-primary mb-1">One-time secure check</p>
          <p className="text-muted-foreground leading-relaxed">
            Each code works once. After a successful verify you have a 60-minute
            viewing window, then the code locks permanently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
