import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { collectVerificationMeta } from "@/lib/verificationMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Key, Lock } from "lucide-react";
import logo from "../../public/NexaLogo.png";

interface VerifyResult {
  success: boolean;
  error?: string;
  product?: unknown;
  session_expires_at?: string;
  verified_at?: string;
  first_verification?: boolean;
}

const VerificationForm = () => {
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
    <div className="card-premium p-8 md:p-10 shadow-2xl">
      <div className="text-center mb-8">
        <img src={logo} alt="Logo" className="w-40 mx-auto mb-8" />
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          Verify Authenticity
        </h2>
        <p className="text-gray-600">
          Enter your product credentials to verify
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="serial"
            className="text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-primary" />
            Serial Number
          </Label>
          <Input
            id="serial"
            type="text"
            placeholder="NXB-XXXX-XXXX-XXXX"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
            className="input-nexatech font-mono text-lg"
            required
            disabled={isVerifying}
          />
          <p className="text-xs text-gray-500">
            Found inside your product packaging
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-primary" />
            Password
          </Label>
          <Input
            id="password"
            type="text"
            placeholder="XXXXXXXX"
            value={password}
            onChange={(e) => setPassword(e.target.value.toUpperCase())}
            className="input-nexatech font-mono text-lg"
            required
            disabled={isVerifying}
          />
          <p className="text-xs text-gray-500">
            8-character verification code
          </p>
        </div>

        <Button
          type="submit"
          disabled={isVerifying}
          className="w-full btn-nexatech text-lg py-6"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Verify Product
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="text-sm">
          <p className="font-semibold text-blue-900 mb-1">Secure Verification</p>
          <p className="text-blue-700">
            Each code can be verified once. After verification you have a
            60-minute viewing window, then the code is permanently locked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
