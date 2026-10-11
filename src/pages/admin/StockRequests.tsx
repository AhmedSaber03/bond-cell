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
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Pencil,
  Trash2,
  Loader2,
  Phone,
  Search,
} from "lucide-react";

type RequestStatus = "pending" | "contacted" | "fulfilled" | "cancelled";

interface StockRequest {
  id: string;
  customer_name: string;
  phone_number: string;
  quantity: number;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  product_id: string;
  products: {
    name: string;
    in_stock: boolean | null;
  } | null;
}

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "contacted":
      return "bg-primary/10 text-primary border-primary/20";
    case "fulfilled":
      return "bg-success/10 text-success border-success/20";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "";
  }
};

const StockRequests = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StockRequest | null>(null);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    phone_number: "",
    quantity: 1,
    status: "pending" as RequestStatus,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
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

    fetchRequests();
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("stock_requests")
      .select("*, products(name, in_stock)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setRequests(data as StockRequest[]);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (id: string, status: RequestStatus) => {
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
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      toast({ title: "Status updated", description: `Marked as ${status}` });
    }
    setUpdatingId(null);
  };

  const openEdit = (request: StockRequest) => {
    setEditing(request);
    setEditForm({
      customer_name: request.customer_name,
      phone_number: request.phone_number,
      quantity: request.quantity,
      status: request.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editForm.customer_name.trim() || !editForm.phone_number.trim()) {
      toast({
        title: "Validation error",
        description: "Name and phone are required",
        variant: "destructive",
      });
      return;
    }
    if (editForm.quantity < 1) {
      toast({
        title: "Validation error",
        description: "Quantity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("stock_requests")
      .update({
        customer_name: editForm.customer_name.trim(),
        phone_number: editForm.phone_number.trim(),
        quantity: editForm.quantity,
        status: editForm.status,
      })
      .eq("id", editing.id);

    if (error) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
                ...r,
                customer_name: editForm.customer_name.trim(),
                phone_number: editForm.phone_number.trim(),
                quantity: editForm.quantity,
                status: editForm.status,
              }
            : r
        )
      );
      toast({ title: "Request updated" });
      setEditing(null);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("stock_requests")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== deleteId));
      toast({ title: "Request deleted" });
    }
    setIsDeleting(false);
    setDeleteId(null);
  };

  const productOptions = Array.from(
    new Map(
      requests
        .filter((r) => r.products?.name)
        .map((r) => [r.product_id, r.products!.name])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const filtered = requests.filter((r) => {
    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;
    const matchesProduct =
      productFilter === "all" || r.product_id === productFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      r.customer_name.toLowerCase().includes(term) ||
      r.phone_number.toLowerCase().includes(term) ||
      r.products?.name.toLowerCase().includes(term);
    return matchesStatus && matchesProduct && matchesSearch;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
    cancelled: requests.filter((r) => r.status === "cancelled").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer pre-orders from out-of-stock products
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["contacted", "Contacted"],
              ["fulfilled", "Fulfilled"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                statusFilter === key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground">
                {counts[key]}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or product..."
              className="pl-9"
            />
          </div>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {productOptions.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No stock requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {request.products?.name || "Unknown Product"}
                          </p>
                          {request.products && (
                            <p className="text-xs text-muted-foreground">
                              {request.products.in_stock
                                ? "Now in stock"
                                : "Still out of stock"}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{request.customer_name}</TableCell>
                      <TableCell>
                        <a
                          href={`tel:${request.phone_number}`}
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {request.phone_number}
                        </a>
                      </TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>
                        <Select
                          value={request.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              request.id,
                              value as RequestStatus
                            )
                          }
                          disabled={updatingId === request.id}
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            {updatingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${statusBadgeClass(opt.value)}`}
                                >
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(request.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(request)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(request.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stock Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Product: </span>
              <span className="font-medium">
                {editing?.products?.name || "Unknown"}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name</Label>
              <Input
                id="edit-name"
                value={editForm.customer_name}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    customer_name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editForm.phone_number}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-qty">Quantity</Label>
              <Input
                id="edit-qty"
                type="number"
                min={1}
                max={1000}
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: value as RequestStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete stock request?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default StockRequests;
