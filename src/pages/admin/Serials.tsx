import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Plus,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  Copy,
  Trash2,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
}

interface SerialNumber {
  id: string;
  serial_number: string;
  is_verified: boolean;
  verified_at: string | null;
  verification_country: string | null;
  verification_city: string | null;
  session_expires_at: string | null;
  created_at: string;
  product_id: string;
}

type SerialStatus = "pending" | "session_active" | "verified";

const getSerialStatus = (serial: SerialNumber): SerialStatus => {
  if (!serial.is_verified) return "pending";
  if (
    serial.session_expires_at &&
    new Date(serial.session_expires_at) > new Date()
  ) {
    return "session_active";
  }
  return "verified";
};

const serialStatusLabel = (status: SerialStatus) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "session_active":
      return "Session Active";
    case "verified":
      return "Verified";
  }
};

interface GeneratedSerial {
  serial_number: string;
  raw_password: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const Serials = () => {
  const [serials, setSerials] = useState<SerialNumber[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSerials, setGeneratedSerials] = useState<GeneratedSerial[]>(
    [],
  );
  const [showGenerated, setShowGenerated] = useState(false);
  const [deleteSerial, setDeleteSerial] = useState<SerialNumber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtering + pagination state
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    session_active: 0,
    verified: 0,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Refetch whenever filter, page, or page size changes
  useEffect(() => {
    fetchData();
    fetchStatusCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProduct, filterStatus, debouncedSearch, page, pageSize]);

  const checkAuthAndFetch = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    fetchProducts();
    fetchData();
    fetchStatusCounts();
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name");
    if (data) setProducts(data);
  };

  const fetchStatusCounts = async () => {
    const now = new Date().toISOString();

    const withBase = () => {
      let q = supabase
        .from("serial_numbers_public")
        .select("id", { count: "exact", head: true });
      if (filterProduct !== "all") q = q.eq("product_id", filterProduct);
      if (debouncedSearch) q = q.ilike("serial_number", `%${debouncedSearch}%`);
      return q;
    };

    const [allRes, pendingRes, activeRes, verifiedRes] = await Promise.all([
      withBase(),
      withBase().eq("is_verified", false),
      withBase().eq("is_verified", true).gt("session_expires_at", now),
      withBase()
        .eq("is_verified", true)
        .or(`session_expires_at.is.null,session_expires_at.lte.${now}`),
    ]);

    setStatusCounts({
      all: allRes.count || 0,
      pending: pendingRes.count || 0,
      session_active: activeRes.count || 0,
      verified: verifiedRes.count || 0,
    });
  };

  const fetchData = async () => {
    setIsLoading(true);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const now = new Date().toISOString();

    let query = supabase
      .from("serial_numbers_public")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filterProduct !== "all") {
      query = query.eq("product_id", filterProduct);
    }
    if (debouncedSearch) {
      query = query.ilike("serial_number", `%${debouncedSearch}%`);
    }
    if (filterStatus === "pending") {
      query = query.eq("is_verified", false);
    } else if (filterStatus === "session_active") {
      query = query.eq("is_verified", true).gt("session_expires_at", now);
    } else if (filterStatus === "verified") {
      query = query
        .eq("is_verified", true)
        .or(`session_expires_at.is.null,session_expires_at.lte.${now}`);
    }

    const { data, count, error } = await query;

    if (!error && data) setSerials(data as SerialNumber[]);
    if (typeof count === "number") setTotalCount(count);

    setIsLoading(false);
  };

  const clearFilters = () => {
    setFilterProduct("all");
    setFilterStatus("all");
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    filterProduct !== "all" || filterStatus !== "all" || !!search.trim();

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast({
        title: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc("generate_serial_numbers", {
        _product_id: selectedProduct,
        _count: quantity,
      });

      if (error) throw error;

      setGeneratedSerials(data as GeneratedSerial[]);
      setShowGenerated(true);
      toast({
        title: `Generated ${quantity} serial number(s)!`,
      });
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error generating serials",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSerial) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("serial_numbers")
        .delete()
        .eq("id", deleteSerial.id);

      if (error) throw error;

      toast({ title: "Serial number deleted successfully!" });
      setDeleteSerial(null);
      fetchData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete";
      toast({
        title: "Error deleting serial",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    if (generatedSerials.length === 0) return;

    const csv = [
      "Serial Number,Password",
      ...generatedSerials.map((s) => `${s.serial_number},${s.raw_password}`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `serial_numbers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exports ALL rows matching the current filters (not just the current page)
  const handleExportAll = async () => {
    const now = new Date().toISOString();
    let query = supabase
      .from("serial_numbers_public")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterProduct !== "all") {
      query = query.eq("product_id", filterProduct);
    }
    if (debouncedSearch) {
      query = query.ilike("serial_number", `%${debouncedSearch}%`);
    }
    if (filterStatus === "pending") {
      query = query.eq("is_verified", false);
    } else if (filterStatus === "session_active") {
      query = query.eq("is_verified", true).gt("session_expires_at", now);
    } else if (filterStatus === "verified") {
      query = query
        .eq("is_verified", true)
        .or(`session_expires_at.is.null,session_expires_at.lte.${now}`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      toast({
        title: "Nothing to export",
        description: "No serials match the current filters",
        variant: "destructive",
      });
      return;
    }

    const rows = data as SerialNumber[];

    const csv = [
      "Serial Number,Product,Status,Verified At,Location,Created At",
      ...rows.map((s) => {
        const product = getProductName(s.product_id);
        const status = serialStatusLabel(getSerialStatus(s));
        const verifiedAt = s.verified_at
          ? new Date(s.verified_at).toLocaleString()
          : "-";
        const location =
          [s.verification_city, s.verification_country]
            .filter(Boolean)
            .join(", ") || "-";
        const createdAt = new Date(s.created_at).toLocaleDateString();
        return `"${s.serial_number}","${product}","${status}","${verifiedAt}","${location}","${createdAt}"`;
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all_serials_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || "Unknown";
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Builds a compact page number list, e.g. [1, 2, 3, '...', 10]
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Serial Numbers
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate and manage product serial numbers
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExportAll}
              disabled={totalCount === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setShowGenerated(false)}
                  className="btn-hero"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Serials
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {showGenerated
                      ? "Generated Serial Numbers"
                      : "Generate Serial Numbers"}
                  </DialogTitle>
                </DialogHeader>

                {showGenerated ? (
                  <div className="space-y-4 mt-4">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <p className="text-sm text-success font-medium">
                        ✓ Successfully generated {generatedSerials.length}{" "}
                        serial number(s)
                      </p>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {generatedSerials.map((serial, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="font-mono text-sm">
                            <p className="text-foreground font-semibold">
                              {serial.serial_number}
                            </p>
                            <p className="text-primary">
                              Password:{" "}
                              <span className="font-bold">
                                {serial.raw_password}
                              </span>
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(
                                `Serial: ${serial.serial_number}\nPassword: ${serial.raw_password}`,
                              )
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowGenerated(false);
                          setGeneratedSerials([]);
                        }}
                        className="flex-1"
                      >
                        Generate More
                      </Button>
                      <Button
                        onClick={handleExport}
                        className="flex-1 btn-hero"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Select Product</Label>
                      <Select
                        value={selectedProduct}
                        onValueChange={setSelectedProduct}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 1)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Generate up to 100 serial numbers at once
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !selectedProduct}
                        className="flex-1 btn-hero"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status filter chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["session_active", "Session Active"],
              ["verified", "Verified"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setFilterStatus(key);
                setPage(1);
              }}
              className={`rounded-xl border p-3 text-left transition-colors ${
                filterStatus === key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground">
                {statusCounts[key]}
              </p>
            </button>
          ))}
        </div>

        {/* Filter + Page size row */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                placeholder="Search serial number..."
                className="pl-9 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-64">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select
                value={filterProduct}
                onValueChange={(value) => {
                  setFilterProduct(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-52">
              <Select
                value={filterStatus}
                onValueChange={(value) => {
                  setFilterStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Verification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="session_active">Session Active</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <X className="w-4 h-4" />
                Clear filters
              </Button>
            )}

            <div className="flex items-center gap-2 lg:ml-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Rows per page
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {totalCount} serial{totalCount === 1 ? "" : "s"}
            {hasActiveFilters ? " matching filters" : ""}
          </p>
        </div>

        {/* Serials Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : serials.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filterProduct !== "all"
                  ? "No serial numbers for this product"
                  : "No serial numbers yet"}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Generate your first serials
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Verified At
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serials.map((serial) => {
                    const verifiedDateTime = serial.verified_at
                      ? formatDateTime(serial.verified_at)
                      : null;
                    const status = getSerialStatus(serial);
                    return (
                      <TableRow key={serial.id}>
                        <TableCell className="font-mono text-sm">
                          {serial.serial_number}
                        </TableCell>
                        <TableCell>
                          {getProductName(serial.product_id)}
                        </TableCell>
                        <TableCell>
                          {status === "pending" ? (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          ) : status === "session_active" ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                              <Clock className="w-3 h-3 mr-1" />
                              Session Active
                            </Badge>
                          ) : (
                            <Badge className="bg-success/10 text-success hover:bg-success/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {verifiedDateTime ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{verifiedDateTime.date}</span>
                              <span className="text-foreground">
                                {verifiedDateTime.time}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {serial.verification_city ||
                          serial.verification_country ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {[
                                  serial.verification_city,
                                  serial.verification_country,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {new Date(serial.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteSerial(serial)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={serial.is_verified}
                            title={
                              serial.is_verified
                                ? "Cannot delete verified serials"
                                : "Delete serial"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination controls */}
          {!isLoading && serials.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-sm text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPage(p as number)}
                      className={p === page ? "btn-hero" : ""}
                    >
                      {p}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteSerial}
        onOpenChange={() => setDeleteSerial(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Serial Number?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete serial number{" "}
              <span className="font-mono font-semibold">
                {deleteSerial?.serial_number}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Serials;
