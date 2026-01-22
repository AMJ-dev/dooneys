import { useState, useEffect, useMemo, startTransition, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Grid3X3,
  List,
  Download,
  TrendingUp,
  BarChart3,
  Package,
  Layers,
  DollarSign,
  RefreshCw,
  MoreHorizontal,
  AlertTriangle,
  Eye,
  Users,
  ShoppingCart,
  Percent,
  ChevronRight,
  Sparkles,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import LoadingScreen from "@/components/ui/loading-screen";
import { str_to_url, resolveSrc, format_currency, gen_random_string } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  status: "active" | "inactive";
  product_count: number;
  productCount: number;
  total_revenue: string;
  totalRevenue: number;
  orders_count: number;
  views: number;
  conversion_rate: string;
  conversionRate: number;
  growth?: number;
  lastUpdated?: string;
}

const AdminCategories = () => {
  const navigate = useNavigate();
  
  const { 
    add_category:can_add_category,
    delete_category:can_delete_category,
    edit_category:can_edit_category,
    view_categories:can_view_categories,
    activate_deactivate_categories:can_activate_deactivate_categories
  } = usePermissions([
    'add_category',
    'delete_category',
    'edit_category',
    'view_categories',
    'activate_deactivate_categories'
  ]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"revenue" | "products" | "conversion" | "name">("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Memoize fetchCategories to prevent unnecessary re-creations
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await http.get("/get-categories/");
      const resp: ApiResp = res.data;
      if (resp.error === false && resp.data) {
        const mappedCategories: AdminCategory[] = resp.data.map((cat: any) => ({
          ...cat,
          productCount: cat.product_count || 0,
          totalRevenue: parseFloat(cat.total_revenue) || 0,
          orders_count: cat.orders_count || 0,
          views: cat.views || 0,
          conversionRate: parseFloat(cat.conversion_rate) || 0,
          growth: 0, // Calculate growth based on previous data if available
        }));
        setCategories(mappedCategories);
      } else {
        toast.error("Failed to fetch categories.");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(!can_view_categories) startTransition(() => navigate("/unauthorized"));
    fetchCategories();
  }, [fetchCategories]);

  // Calculate statistics from categories
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(cat => cat.status === "active").length;
    const inactiveCategories = categories.filter(cat => cat.status === "inactive").length;
    const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
    const totalRevenue = categories.reduce((sum, cat) => sum + cat.totalRevenue, 0);
    const totalOrders = categories.reduce((sum, cat) => sum + cat.orders_count, 0);
    const totalViews = categories.reduce((sum, cat) => sum + cat.views, 0);
    
    const avgConversionRate = categories.length > 0 
      ? categories.reduce((sum, cat) => sum + cat.conversionRate, 0) / totalCategories
      : 0;
    
    const topPerforming = [...categories]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    const attentionCategories = categories.filter(cat => 
      cat.status === "inactive" || 
      cat.conversionRate < 1 ||
      cat.productCount === 0
    );

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      totalProducts,
      totalRevenue,
      totalOrders,
      totalViews,
      avgConversionRate,
      topPerforming,
      attentionCategories: attentionCategories.length,
    };
  }, [categories]);

  // Sort and filter categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(
      (cat) =>
        (cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
         cat.slug.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || cat.status === statusFilter)
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "revenue":
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case "products":
          aValue = a.productCount;
          bValue = b.productCount;
          break;
        case "conversion":
          aValue = a.conversionRate;
          bValue = b.conversionRate;
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "desc") {
        return (bValue as number) - (aValue as number);
      } else {
        return (aValue as number) - (bValue as number);
      }
    });

    return filtered;
  }, [categories, searchQuery, statusFilter, sortBy, sortOrder]);

  const getCategoryImage = useCallback((category: AdminCategory) => {
    if (category.image) {
      return resolveSrc(category.image);
    }
    return "/placeholder-category.jpg";
  }, []);

  const handleDeleteCategory = useCallback(async() => {
    if(!can_delete_category) return;

    if (!selectedCategory) return;
    try {
      const res = await http.post("/delete-category/", {id: selectedCategory.id});
      const resp: ApiResp = res.data;
      if (resp.error === false) {
        setCategories(prev => prev.filter((cat) => cat.id !== selectedCategory.id));
        setShowDeleteDialog(false);
        setSelectedCategory(null);
        toast.success("Category has been removed successfully.");
      } else {
        toast.error(resp.data || "Failed to remove category.");
      }
    } catch (error) {
      toast.error("Failed to remove category.");
    }
  }, [selectedCategory]);

  const openDeleteDialog = useCallback((category: AdminCategory) => {
    if(!can_delete_category) return;
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  }, []);

  const toggleStatus = useCallback(async (categoryId: number) => {
    if(!can_activate_deactivate_categories) return;
    try {
      const res = await http.post("/activate-category/", {id: categoryId});
      const resp: ApiResp = res.data;
      if (resp.error === false) {
        setCategories(prev => prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, status: cat.status === "active" ? "inactive" : "active" }
            : cat
        ));
        toast.success("Category status has been changed.");
      } else {
        toast.error(resp.data || "Failed to change category status.");
      }
    } catch (error) {
      toast.error("Failed to change category status.");
    }
  }, []);

  const handleAddCategory = useCallback(() => {
    if(!can_add_category) return;
    startTransition(() => navigate("/admin/categories/new"));
  }, [navigate]);

  const handleEditCategory = useCallback((category: AdminCategory) => {
    if(!can_edit_category) return;
    startTransition(() => navigate(`/admin/categories/${category.id}/${str_to_url(category.name)}`));
  }, [navigate]);

  const handleViewCategory = useCallback((id:number, slug: string) => {
    startTransition(() => navigate(`/category/${id}/${slug}`));
  }, [navigate]);


  const handleBulkActivate = useCallback(async () => {
    if(!can_activate_deactivate_categories) return;
    try {
      const res = await http.post("/bulk-activate-categories/");
      const resp: ApiResp = res.data;
      if (resp.error === false) {
        setCategories(prev => prev.map(cat => ({
          ...cat,
          status: "active"
        })));
        toast.success("All categories have been activated");
      } else {
        toast.error(resp.data || "Failed to activate categories.");
      }
    } catch (error) {
      toast.error("Failed to activate categories.");
    }
  }, []);

  const getPerformanceColor = (revenue: number) => {
    if (revenue > 1000) return "text-emerald-600";
    if (revenue > 100) return "text-green-600";
    if (revenue > 0) return "text-amber-600";
    return "text-gray-500";
  };

  const getConversionColor = (rate: number) => {
    if (rate > 10) return "text-emerald-600";
    if (rate > 5) return "text-green-600";
    if (rate > 1) return "text-amber-600";
    return "text-gray-500";
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" 
                                : "bg-rose-500/10 text-rose-700 border-rose-500/20";
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/90 via-muted/20 to-background/90 p-4 sm:p-6 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-primary" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
                Category Management
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage product categories with real-time analytics and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/10"
              onClick={fetchCategories}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            {
              can_add_category && (
                <Button
                  onClick={handleAddCategory}
                  className="gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Category</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              )
            }
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Categories</p>
                      <h3 className="text-2xl font-bold mt-2">{stats.totalCategories}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                          {stats.activeCategories} active
                        </Badge>
                        <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20">
                          {stats.inactiveCategories} inactive
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                      <Layers className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <h3 className="text-2xl font-bold mt-2">{stats.totalProducts}</h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        Avg {stats.totalCategories > 0 ? Math.round(stats.totalProducts / stats.totalCategories) : 0} per category
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                      <Package className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-2">{format_currency(stats.totalRevenue)}</h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        From {stats.totalOrders} orders
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                      <DollarSign className="h-6 w-6 text-violet-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Conversion</p>
                      <h3 className="text-2xl font-bold mt-2">{stats.avgConversionRate.toFixed(2)}%</h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        {stats.totalViews} total views
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                      <TrendingUp className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Attention Required Section */}
        {stats.attentionCategories > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 backdrop-blur-2xl shadow-xl rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800">Attention Required</h3>
                      <p className="text-sm text-amber-700/80 mt-1">
                        {stats.attentionCategories} categories need immediate attention
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {categories
                          .filter(cat => cat.status === "inactive" || cat.conversionRate < 1 || cat.productCount === 0)
                          .slice(0, 3)
                          .map((cat) => (
                            <Badge 
                              key={`${cat.id}-attention`}
                              variant="outline" 
                              className="bg-white/80 border-amber-500/30 text-amber-700"
                            >
                              <span className="font-medium">{cat.name}</span>
                              <span className="ml-2 text-xs opacity-75">
                                {cat.status === "inactive" ? "Inactive" : 
                                 cat.productCount === 0 ? "No Products" : 
                                 `${cat.conversionRate.toFixed(2)}% conversion`}
                              </span>
                            </Badge>
                          ))}
                        {stats.attentionCategories > 3 && (
                          <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                            +{stats.attentionCategories - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  { can_activate_deactivate_categories && (
                      <Button 
                        onClick={handleBulkActivate} 
                        className="gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20"
                      >
                      <Zap className="h-4 w-4" />
                      Activate All
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top Performing & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span>Top Performing Categories</span>
              </CardTitle>
              <CardDescription>
                Highest revenue generating categories
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {stats.topPerforming.map((cat, index) => {
                  const revenuePercentage = stats.totalRevenue > 0 ? (cat.totalRevenue / stats.totalRevenue) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={`${cat.id}-top-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/20 via-white/10 to-white/20 backdrop-blur-xl border border-white/20 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20">
                            <img
                              src={getCategoryImage(cat)}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-category.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{cat.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-white/20 border-white/30 text-xs">
                                {cat.productCount} products
                              </Badge>
                              <Badge className={cn("text-xs", getStatusColor(cat.status))}>
                                {cat.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("font-bold text-lg", getPerformanceColor(cat.totalRevenue))}>
                          {format_currency(cat.totalRevenue)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cat.orders_count} orders • {cat.views} views
                        </p>
                        <div className="w-32 mt-2">
                          <Progress value={revenuePercentage} className="h-1.5 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {revenuePercentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters Card */}
          <Card className="border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <CardHeader className="relative z-10">
              <CardTitle>Filters & Actions</CardTitle>
              <CardDescription>
                Customize your view and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">View Mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    className="flex-1 gap-2 rounded-xl border-white/30 bg-white/20 hover:bg-white/30"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    className="flex-1 gap-2 rounded-xl border-white/30 bg-white/20 hover:bg-white/30"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    List
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-xl border-white/30 bg-white/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-white/30 border-white/20">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="space-y-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="rounded-xl border-white/30 bg-white/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/30 border-white/20">
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="products">Product Count</SelectItem>
                      <SelectItem value="conversion">Conversion Rate</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant={sortOrder === "desc" ? "default" : "outline"}
                      className="flex-1 rounded-xl border-white/30 bg-white/20 hover:bg-white/30"
                      onClick={() => setSortOrder("desc")}
                    >
                      Descending
                    </Button>
                    <Button
                      variant={sortOrder === "asc" ? "default" : "outline"}
                      className="flex-1 rounded-xl border-white/30 bg-white/20 hover:bg-white/30"
                      onClick={() => setSortOrder("asc")}
                    >
                      Ascending
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Quick Actions</label>
                <div className="space-y-2">
                  { can_add_category && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 rounded-xl border-white/30 bg-white/20 hover:bg-white/30"
                      onClick={handleAddCategory}
                    >
                      <Plus className="h-4 w-4" />
                      Add New Category
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl border border-white/20">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories by name, description, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-white/30 bg-white/20 backdrop-blur-xl"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedCategories.length} categories found
            </div>
          </div>
        </div>

        {/* Categories Display */}
        {viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedCategories.map((category, index) => (
              <motion.div
                key={`${category.id}-grid`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl group-hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  {/* Category Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-category.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge className={cn("backdrop-blur-sm", getStatusColor(category.status))}>
                        {category.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white/30 border-white/20">
                          { can_edit_category && (
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleViewCategory(category.id, category.slug)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Category
                          </DropdownMenuItem>
                          { can_activate_deactivate_categories && (
                            <DropdownMenuItem onClick={() => toggleStatus(category.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Toggle Status
                            </DropdownMenuItem>
                          )}
                          { can_delete_category && (
                            <>
                              <DropdownMenuSeparator className="bg-white/20" />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(category)}
                                className="text-rose-600 focus:text-rose-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Category
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>                          
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {category.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground">Products</p>
                        <p className="font-semibold">{category.productCount}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className={cn("font-semibold", getPerformanceColor(category.totalRevenue))}>
                          {format_currency(category.totalRevenue)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="font-semibold">{category.orders_count}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground">Conversion</p>
                        <p className={cn("font-semibold", getConversionColor(category.conversionRate))}>
                          {category.conversionRate.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <CardContent className="p-6 relative z-10">
                <div className="rounded-xl overflow-hidden border border-white/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Category</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground text-right">Products</TableHead>
                        <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                        <TableHead className="text-muted-foreground text-right">Orders</TableHead>
                        <TableHead className="text-muted-foreground text-right">Views</TableHead>
                        <TableHead className="text-muted-foreground text-right">Conversion</TableHead>
                        <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedCategories.map((category) => (
                        <TableRow 
                          key={`${category.id}-list`} 
                          className="border-white/20 hover:bg-white/5"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20">
                                <img
                                  src={getCategoryImage(category)}
                                  alt={category.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder-category.jpg";
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-xs text-muted-foreground">/{category.slug}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("min-w-[70px]", getStatusColor(category.status))}>
                              {category.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {category.productCount}
                          </TableCell>
                          <TableCell className="text-right">
                            <p className={cn("font-medium", getPerformanceColor(category.totalRevenue))}>
                              {format_currency(category.totalRevenue)}
                            </p>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {category.orders_count}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {category.views}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress 
                                value={category.conversionRate} 
                                className="h-1.5 w-20 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
                              />
                              <span className={cn("text-xs font-medium min-w-[50px]", getConversionColor(category.conversionRate))}>
                                {category.conversionRate.toFixed(2)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              { can_edit_category && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                              { can_activate_deactivate_categories && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30"
                                  onClick={() => toggleStatus(category.id)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              { can_delete_category && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600"
                                  onClick={() => openDeleteDialog(category)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-xl rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <CardContent className="p-12 text-center relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Layers className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "Try adjusting your search query" : "Start by adding your first category"}
                </p>
                {
                  can_add_category && (
                    <Button 
                      onClick={handleAddCategory}
                      className="gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Category
                    </Button>
                  )
                }
                
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Delete Dialog */}
      { can_delete_category && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="border-0 bg-gradient-to-br from-white/30 via-white/20 to-white/30 backdrop-blur-3xl rounded-2xl">
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent" />
            <AlertDialogHeader className="relative z-10">
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
                {selectedCategory?.productCount > 0 && (
                  <span className="block mt-2 text-amber-600 font-medium">
                    ⚠️ {selectedCategory.productCount} products will be affected and need to be reassigned.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="relative z-10">
              <AlertDialogCancel className="rounded-xl border-white/30 bg-white/20 hover:bg-white/30 backdrop-blur-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCategory} 
                className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/20"
              >
                Delete Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AdminCategories;