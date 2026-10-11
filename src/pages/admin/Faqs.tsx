import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { FAQ_CATEGORIES, type FaqItem } from "@/data/faqContent";

interface FaqRow extends FaqItem {
  id: string;
  is_published: boolean;
}

const emptyForm = {
  category: FAQ_CATEGORIES[0] as string,
  question: "",
  answer: "",
  sort_order: 0,
  is_published: true,
};

const Faqs = () => {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FaqRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [customCategory, setCustomCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
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

    fetchFaqs();
  };

  const fetchFaqs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Could not load FAQs",
        description:
          error.message.includes("does not exist") || error.code === "42P01"
            ? "Run the faqs migration SQL in Supabase first."
            : error.message,
        variant: "destructive",
      });
      setFaqs([]);
    } else if (data) {
      setFaqs(data as FaqRow[]);
    }
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    const nextOrder =
      faqs.length > 0
        ? Math.max(...faqs.map((f) => f.sort_order)) + 1
        : 1;
    setForm({ ...emptyForm, sort_order: nextOrder });
    setCustomCategory("");
    setIsDialogOpen(true);
  };

  const openEdit = (faq: FaqRow) => {
    setEditing(faq);
    const known = FAQ_CATEGORIES.includes(
      faq.category as (typeof FAQ_CATEGORIES)[number]
    );
    setForm({
      category: known ? faq.category : "custom",
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
      is_published: faq.is_published,
    });
    setCustomCategory(known ? "" : faq.category);
    setIsDialogOpen(true);
  };

  const resolveCategory = () => {
    if (form.category === "custom") {
      return customCategory.trim();
    }
    return form.category.trim();
  };

  const handleSave = async () => {
    const category = resolveCategory();
    if (!category || !form.question.trim() || !form.answer.trim()) {
      toast({
        title: "Missing fields",
        description: "Category, question, and answer are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const payload = {
      category,
      question: form.question.trim(),
      answer: form.answer.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_published: form.is_published,
    };

    const { error } = editing
      ? await supabase.from("faqs").update(payload).eq("id", editing.id)
      : await supabase.from("faqs").insert(payload);

    if (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: editing ? "FAQ updated" : "FAQ created" });
      setIsDialogOpen(false);
      fetchFaqs();
    }
    setIsSaving(false);
  };

  const handleTogglePublish = async (faq: FaqRow) => {
    setTogglingId(faq.id);
    const { error } = await supabase
      .from("faqs")
      .update({ is_published: !faq.is_published })
      .eq("id", faq.id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === faq.id ? { ...f, is_published: !f.is_published } : f
        )
      );
    }
    setTogglingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const { error } = await supabase.from("faqs").delete().eq("id", deleteId);
    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setFaqs((prev) => prev.filter((f) => f.id !== deleteId));
      toast({ title: "FAQ deleted" });
    }
    setIsDeleting(false);
    setDeleteId(null);
  };

  const categories = Array.from(
    new Set([...FAQ_CATEGORIES, ...faqs.map((f) => f.category)])
  );

  const filtered = faqs.filter((faq) => {
    const matchesCategory =
      categoryFilter === "all" || faq.category === categoryFilter;
    const matchesPublish =
      publishFilter === "all" ||
      (publishFilter === "published" && faq.is_published) ||
      (publishFilter === "draft" && !faq.is_published);
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      faq.category.toLowerCase().includes(term);
    return matchesCategory && matchesPublish && matchesSearch;
  });

  const grouped = categories
    .map((category) => ({
      category,
      items: filtered.filter((f) => f.category === category),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">FAQ</h1>
            <p className="text-muted-foreground mt-1">
              Manage collapsed FAQ items shown on the homepage
            </p>
          </div>
          <Button onClick={openCreate} className="btn-hero">
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or answers..."
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={publishFilter} onValueChange={setPublishFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No FAQs found</p>
              <Button onClick={openCreate} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add your first FAQ
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map(({ category, items }) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {category}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({items.length})
                    </span>
                  </h2>
                  <Accordion type="multiple" className="w-full">
                    {items.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <div className="flex items-start gap-2">
                          <AccordionTrigger className="flex-1 text-left hover:no-underline">
                            <div className="pr-4 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">
                                  {faq.question}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={
                                    faq.is_published
                                      ? "bg-success/10 text-success"
                                      : "bg-muted text-muted-foreground"
                                  }
                                >
                                  {faq.is_published ? "Published" : "Hidden"}
                                </Badge>
                                <Badge variant="outline">
                                  #{faq.sort_order}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <div className="flex items-center gap-1 pt-3 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              title={
                                faq.is_published ? "Hide FAQ" : "Publish FAQ"
                              }
                              disabled={togglingId === faq.id}
                              onClick={() => handleTogglePublish(faq)}
                            >
                              {togglingId === faq.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : faq.is_published ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(faq)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(faq.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FAQ_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom category...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.category === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-category">Custom category name</Label>
                <Input
                  id="custom-category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Payments"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={form.question}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, question: e.target.value }))
                }
                placeholder="Enter the question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={form.answer}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Enter the answer"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort order</Label>
              <Input
                id="sort"
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sort_order: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium text-sm">Published</p>
                <p className="text-xs text-muted-foreground">
                  Show this FAQ on the homepage
                </p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_published: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editing ? (
                "Save Changes"
              ) : (
                "Create FAQ"
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
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the question from the homepage permanently.
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

export default Faqs;
