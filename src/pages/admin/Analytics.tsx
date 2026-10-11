import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  TrendingUp,
  Globe,
  Search,
} from "lucide-react";

interface VerificationLog {
  id: string;
  action: string;
  country: string | null;
  city: string | null;
  created_at: string;
  serial_number_id: string;
  serial_numbers: {
    serial_number: string;
    products: {
      name: string;
    } | null;
  } | null;
}

const Analytics = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [rangeFilter, setRangeFilter] = useState<string>("30");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    fetchLogs();
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("verification_logs")
      .select(
        `
        id,
        action,
        country,
        city,
        created_at,
        serial_number_id,
        serial_numbers!verification_logs_serial_number_id_fkey (
          serial_number,
          products ( name )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    if (!error && data) {
      setLogs(data as unknown as VerificationLog[]);
    }
    setIsLoading(false);
  };

  const toLocalDateKey = (value: Date) => {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const rangeMs =
      rangeFilter === "all"
        ? Infinity
        : Number(rangeFilter) * 24 * 60 * 60 * 1000;
    const term = search.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;
      const matchesRange =
        rangeFilter === "all" ||
        now - new Date(log.created_at).getTime() <= rangeMs;
      const matchesSearch =
        !term ||
        log.country?.toLowerCase().includes(term) ||
        log.city?.toLowerCase().includes(term) ||
        log.serial_numbers?.serial_number.toLowerCase().includes(term) ||
        log.serial_numbers?.products?.name.toLowerCase().includes(term);
      return matchesAction && matchesRange && matchesSearch;
    });
  }, [logs, actionFilter, rangeFilter, search]);

  const totalVerifications = filteredLogs.filter(
    (l) => l.action === "verified"
  ).length;
  const failedAttempts = filteredLogs.filter(
    (l) => l.action === "failed_password"
  ).length;
  const blockedAttempts = filteredLogs.filter(
    (l) => l.action === "verification_blocked"
  ).length;

  const actionData = [
    { name: "Verified", value: totalVerifications, color: "hsl(155, 70%, 40%)" },
    { name: "Failed", value: failedAttempts, color: "hsl(0, 84%, 60%)" },
    { name: "Blocked", value: blockedAttempts, color: "hsl(35, 90%, 50%)" },
  ];

  const countryData = filteredLogs
    .filter((l) => l.country && l.action === "verified")
    .reduce(
      (acc, log) => {
        const country = log.country!;
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  const topCountries = Object.entries(countryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const chartDays = rangeFilter === "7" ? 7 : rangeFilter === "30" ? 30 : 7;
  const lastDays = Array.from({ length: chartDays }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (chartDays - 1 - i));
    return toLocalDateKey(date);
  });

  const dailyData = lastDays.map((date) => {
    const dayLogs = filteredLogs.filter(
      (l) =>
        toLocalDateKey(new Date(l.created_at)) === date &&
        l.action === "verified"
    );
    const [y, m, d] = date.split("-").map(Number);
    return {
      date: new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: chartDays > 7 ? "short" : undefined,
        day: chartDays > 7 ? "numeric" : undefined,
        weekday: chartDays <= 7 ? "short" : undefined,
      }),
      verifications: dayLogs.length,
    };
  });

  const getActionLabel = (action: string) => {
    switch (action) {
      case "verified":
        return "Verified";
      case "failed_password":
        return "Failed";
      case "verification_blocked":
        return "Blocked";
      default:
        return action;
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "verified":
        return "bg-success/10 text-success";
      case "failed_password":
        return "bg-destructive/10 text-destructive";
      case "verification_blocked":
        return "bg-warning/10 text-warning";
      default:
        return "";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track verification trends and user activity
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, serial, or location..."
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="failed_password">Failed</SelectItem>
              <SelectItem value="verification_blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={rangeFilter} onValueChange={setRangeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="stats-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-foreground">
                    {totalVerifications}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Successful Verifications
                </p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-foreground">
                    {failedAttempts}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Failed Attempts</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-foreground">
                    {blockedAttempts}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Blocked (Already Verified)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Verifications ({rangeFilter === "all" ? "Last 7 Days" : `Last ${chartDays} Days`})
              </h2>
            </div>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="verifications"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Action Distribution
              </h2>
            </div>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={actionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={false}
                    >
                      {actionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {actionData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {entry.name}:{" "}
                        <span className="font-semibold text-foreground">
                          {entry.value}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Top Countries
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : topCountries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No location data available yet
            </p>
          ) : (
            <div className="space-y-4">
              {topCountries.map((country, index) => (
                <div
                  key={country.name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {country.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {country.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Activity Log
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredLogs.length} event{filteredLogs.length === 1 ? "" : "s"}
            </p>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No events match your filters
            </p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {filteredLogs.slice(0, 50).map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {log.serial_numbers?.products?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {log.serial_numbers?.serial_number || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="secondary"
                      className={getActionBadgeClass(log.action)}
                    >
                      {getActionLabel(log.action)}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
