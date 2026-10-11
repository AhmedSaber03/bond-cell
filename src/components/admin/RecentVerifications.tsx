import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Package,
  Key,
  Globe,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface VerificationLog {
  id: string;
  action: string;
  country: string | null;
  city: string | null;
  ip_address: string | null;
  created_at: string;
  serial_number_id: string;
  serial_numbers: {
    serial_number: string;
    products: {
      id: string;
      name: string;
      manufacturer: string | null;
      images: string[] | null;
    } | null;
  } | null;
}

const RecentVerifications = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    const fetchLogs = async () => {
      let query = supabase
        .from("verification_logs")
        .select(
          `
          id,
          action,
          country,
          city,
          ip_address,
          created_at,
          serial_number_id,
          serial_numbers!verification_logs_serial_number_id_fkey (
            serial_number,
            products (
              id,
              name,
              manufacturer,
              images
            )
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const { data, error } = await query;

      if (!error && data) {
        setLogs((data as unknown as VerificationLog[]).slice(0, 8));
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    fetchLogs();
  }, [actionFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "failed_password":
      case "verification_blocked":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "verified":
        return "Verified";
      case "failed_password":
        return "Failed Password";
      case "verification_blocked":
        return "Already Verified";
      default:
        return action;
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "verified":
        return "bg-success/10 text-success";
      case "failed_password":
      case "verification_blocked":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filterButtons = (
    <div className="flex flex-wrap gap-1.5">
      {(
        [
          ["all", "All"],
          ["verified", "Verified"],
          ["failed_password", "Failed"],
          ["verification_blocked", "Blocked"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          onClick={() => setActionFilter(value)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            actionFilter === value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Verifications
        </h2>
        {filterButtons}
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No verifications yet
        </p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const product = log.serial_numbers?.products;
            const serial = log.serial_numbers?.serial_number;
            const image = product?.images?.[0];

            return (
              <div
                key={log.id}
                className="flex gap-3 p-3 rounded-xl bg-muted/50"
              >
                <div className="w-12 h-12 rounded-xl bg-background border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt={product?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground/60" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {product?.name || "Unknown Product"}
                      </p>
                      {product?.manufacturer && (
                        <p className="text-xs text-muted-foreground">
                          {product.manufacturer}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 text-xs ${getActionBadgeClass(log.action)}`}
                    >
                      <span className="mr-1">{getActionIcon(log.action)}</span>
                      {getActionLabel(log.action)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {serial && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Key className="w-3 h-3" />
                        {serial}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(log.created_at)}
                    </span>
                    {(log.city || log.country) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[log.city, log.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {log.ip_address && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {log.ip_address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentVerifications;
