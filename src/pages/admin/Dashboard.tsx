import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import RecentVerifications from "@/components/admin/RecentVerifications";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Key,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShoppingCart,
  Bell,
  Loader2,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Stats {
  totalProducts: number;
  totalSerials: number;
  verifiedCount: number;
  pendingCount: number;
  inStockCount: number;
  outOfStockCount: number;
  stockRequestsCount: number;
}

type RequestStatus = "pending" | "contacted" | "fulfilled" | "cancelled";

interface StockRequest {
  id: string;
  customer_name: string;
  phone_number: string;
  quantity: number;
  status: RequestStatus;
  created_at: string;
  products: {
    name: string;
  } | null;
}

const STATUS_OPTIONS: RequestStatus[] = [
  "pending",
  "contacted",
  "fulfilled",
  "cancelled",
];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/10 text-warning";
    case "contacted":
      return "bg-primary/10 text-primary";
    case "fulfilled":
      return "bg-success/10 text-success";
    case "cancelled":
      return "bg-destructive/10 text-destructive";
    default:
      return "";
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalSerials: 0,
    verifiedCount: 0,
    pendingCount: 0,
    inStockCount: 0,
    outOfStockCount: 0,
    stockRequestsCount: 0,
  });
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminAccess = roles?.some(
        (r: { role: string }) => r.role === "admin" || r.role === "super_admin"
      );

      if (!hasAdminAccess) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      fetchStats();
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [
        productsRes,
        serialsRes,
        verifiedRes,
        inStockRes,
        outOfStockRes,
        stockRequestsRes,
        recentRequestsRes,
      ] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase
          .from("serial_numbers")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("serial_numbers")
          .select("id", { count: "exact", head: true })
          .eq("is_verified", true),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("in_stock", true),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("in_stock", false),
        supabase
          .from("stock_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("stock_requests")
          .select("*, products(name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const totalProducts = productsRes.count || 0;
      const totalSerials = serialsRes.count || 0;
      const verifiedCount = verifiedRes.count || 0;

      setStats({
        totalProducts,
        totalSerials,
        verifiedCount,
        pendingCount: totalSerials - verifiedCount,
        inStockCount: inStockRes.count || 0,
        outOfStockCount: outOfStockRes.count || 0,
        stockRequestsCount: stockRequestsRes.count || 0,
      });

      if (recentRequestsRes.data) {
        setStockRequests(recentRequestsRes.data as StockRequest[]);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    const previous = stockRequests.find((r) => r.id === id);
    if (!previous || previous.status === status) return;

    setUpdatingId(id);
    const { error } = await supabase
      .from("stock_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStockRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );

      const wasPending = previous.status === "pending";
      const isPending = status === "pending";
      if (wasPending !== isPending) {
        setStats((prev) => ({
          ...prev,
          stockRequestsCount: Math.max(
            0,
            prev.stockRequestsCount + (isPending ? 1 : -1)
          ),
        }));
      }

      toast({ title: "Status updated", description: `Marked as ${status}` });
    }
    setUpdatingId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your product authentication system
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="primary"
            isLoading={isLoading}
          />
          <StatsCard
            title="Serial Numbers"
            value={stats.totalSerials}
            icon={Key}
            color="accent"
            isLoading={isLoading}
          />
          <StatsCard
            title="Verified Products"
            value={stats.verifiedCount}
            icon={CheckCircle2}
            color="success"
            isLoading={isLoading}
          />
          <StatsCard
            title="Pending Verification"
            value={stats.pendingCount}
            icon={Clock}
            color="warning"
            isLoading={isLoading}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold text-success">
                  {stats.inStockCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.outOfStockCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <Package className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/stock-requests")}
            className="bg-card rounded-2xl border border-border p-6 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Requests</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.stockRequestsCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Bell className="w-5 h-5 text-warning" />
              </div>
            </div>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <RecentVerifications />

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Stock Requests
              </h2>
              <div className="flex items-center gap-2">
                {stats.stockRequestsCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-warning/10 text-warning"
                  >
                    {stats.stockRequestsCount} pending
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => navigate("/admin/stock-requests")}
                >
                  Manage all
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {stockRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No stock requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stockRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {request.products?.name || "Unknown Product"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.customer_name} • Qty: {request.quantity}
                      </p>
                      <a
                        href={`tel:${request.phone_number}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {request.phone_number}
                      </a>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Select
                      value={request.status}
                      onValueChange={(value) =>
                        handleStatusChange(request.id, value as RequestStatus)
                      }
                      disabled={updatingId === request.id}
                    >
                      <SelectTrigger className="w-[130px] h-9 shrink-0">
                        {updatingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span
                              className={`capitalize text-xs px-1.5 py-0.5 rounded ${statusBadgeClass(status)}`}
                            >
                              {status}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Add New Product</p>
                <p className="text-sm text-muted-foreground">
                  Create a new product entry
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/serials")}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="p-3 rounded-xl bg-accent/10">
                <Key className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Generate Serials</p>
                <p className="text-sm text-muted-foreground">
                  Create new serial numbers
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/stock-requests")}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="p-3 rounded-xl bg-warning/10">
                <ShoppingCart className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">Stock Requests</p>
                <p className="text-sm text-muted-foreground">
                  Manage customer pre-orders
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/faqs")}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Manage FAQ</p>
                <p className="text-sm text-muted-foreground">
                  Add and edit homepage questions
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/analytics")}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">View Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Track verification trends
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
