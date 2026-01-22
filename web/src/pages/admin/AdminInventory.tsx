import { useState, useMemo, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  AlertTriangle,
  Package,
  Edit2,
  Check,
  X,
  TrendingDown,
  TrendingUp,
  BarChart3,
  ShoppingBag,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  Eye,
  PackageOpen,
  AlertCircle,
  Layers,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Zap,
  Award,
  Sparkles,
  Palette,
  Droplets,
  Scissors,
  Thermometer,
  Wand2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { http } from "@/lib/httpClient";
import { toast } from "react-toastify";
import { format_currency, resolveSrc } from "@/lib/functions";
import { ApiResp } from "@/lib/types";
import { cn } from "@/lib/utils";
import usePermissions from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";

interface ProductInventory {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  price: number;
  original_price: number | null;
  sku: string;
  status: "active" | "inactive";
  is_best_seller: boolean;
  is_new: boolean;
  in_stock: boolean;
  manage_stock: boolean;
  stock_quantity: number;
  low_stock_alert: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  stock_value: number;
  reorder_quantity: number;
  weight: number;
  item_width: number;
  item_height: number;
  item_depth: number;
  sold_last_30_days: number;
  total_ordered: number;
  average_monthly_sales: number;
  months_coverage: number;
  supplier: string;
  lead_time_days: number;
  created_at: string;
  updated_at: string;
  last_restocked: string;
  image: string;
  needs_reorder: boolean;
  stock_health: "healthy" | "warning" | "critical";
}

interface InventoryStats {
  total_products: number;
  total_stock_value: number;
  total_stock_units: number;
  in_stock_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_sold_last_month: number;
  total_revenue_last_month: number;
  attention_items: number;
  turnover_rate: number;
  average_stock_coverage: number;
  stock_health: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

interface ApiResponseData {
  inventory: ProductInventory[];
  stats: InventoryStats;
  top_selling: ProductInventory[];
  categories_distribution: Array<{
    category_id: number;
    category_name: string;
    product_count: number;
    total_value: number;
    total_stock: number;
    low_stock_count: number;
    percentage: number;
  }>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Wigs": <Sparkles className="h-4 w-4" />,
  "Braids & Crochet": <Scissors className="h-4 w-4" />,
  "Hair Care": <Droplets className="h-4 w-4" />,
  "Skin & Body Care": <Thermometer className="h-4 w-4" />,
  "Tools & Appliances": <Zap className="h-4 w-4" />,
  "Kids & Toys": <Heart className="h-4 w-4" />,
  "Makeup": <Palette className="h-4 w-4" />,
  "Fragrance": <Wand2 className="h-4 w-4" />,
};

const AdminInventory = () => {
  const {
    view_inventory: can_view_inventory,
    adjust_inventory: can_adjust_inventory,
  } = usePermissions([
    "view_inventory",
    "adjust_inventory",
  ])
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustmentDialog, setAdjustmentDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductInventory | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add");
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch inventory data using your existing API endpoint
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await http.get("get-inventory/");
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        const data = resp.data as ApiResponseData;
        setInventory(data.inventory);
        setStats(data.stats);
      } else {
        toast.error("Failed to load inventory");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!can_view_inventory){
      startTransition(()=>navigate("/unauthorized"))
      return;
    }
    fetchInventory();
  }, []);

  // Get unique categories from inventory
  const categories = useMemo(() => {
    const categoryMap = new Map<number, { id: number, name: string }>();
    inventory.forEach(item => {
      if (!categoryMap.has(item.category_id)) {
        categoryMap.set(item.category_id, {
          id: item.category_id,
          name: item.category_name
        });
      }
    });
    return Array.from(categoryMap.values());
  }, [inventory]);

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === "all" || 
        item.category_id.toString() === categoryFilter;
      
      const matchesStatus = 
        statusFilter === "all" || 
        item.status === statusFilter;
      
      const matchesStock = () => {
        if (stockFilter === "all") return true;
        if (stockFilter === "in_stock") return item.stock_status === "in_stock";
        if (stockFilter === "low_stock") return item.stock_status === "low_stock";
        if (stockFilter === "out_of_stock") return item.stock_status === "out_of_stock";
        if (stockFilter === "needs_reorder") return item.needs_reorder;
        if (stockFilter === "critical") return item.stock_health === "critical";
        return true;
      };

      return matchesSearch && matchesCategory && matchesStatus && matchesStock();
    });
  }, [inventory, searchQuery, categoryFilter, statusFilter, stockFilter]);

  // Get status badge with luxury styling
  const getStatusBadge = (item: ProductInventory) => {
    const baseClasses = "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm";
    
    if (item.stock_status === "out_of_stock") {
      return (
        <div className={cn(baseClasses, "bg-red-50/80 text-red-700 border-red-200")}>
          <AlertCircle className="h-3 w-3" />
          Out of Stock
        </div>
      );
    }
    
    if (item.stock_status === "low_stock") {
      return (
        <div className={cn(baseClasses, "bg-amber-50/80 text-amber-700 border-amber-200")}>
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </div>
      );
    }
    
    if (item.stock_health === "critical") {
      return (
        <div className={cn(baseClasses, "bg-rose-50/80 text-rose-700 border-rose-200")}>
          <AlertCircle className="h-3 w-3" />
          Critical
        </div>
      );
    }
    
    if (item.stock_health === "warning") {
      return (
        <div className={cn(baseClasses, "bg-yellow-50/80 text-yellow-700 border-yellow-200")}>
          <AlertTriangle className="h-3 w-3" />
          Warning
        </div>
      );
    }
    
    if (item.is_best_seller) {
      return (
        <div className={cn(baseClasses, "bg-emerald-50/80 text-emerald-700 border-emerald-200")}>
          <Award className="h-3 w-3" />
          Best Seller
        </div>
      );
    }
    
    if (item.is_new) {
      return (
        <div className={cn(baseClasses, "bg-blue-50/80 text-blue-700 border-blue-200")}>
          <Sparkles className="h-3 w-3" />
          New Arrival
        </div>
      );
    }
    
    return (
      <div className={cn(baseClasses, "bg-green-50/80 text-green-700 border-green-200")}>
        <Check className="h-3 w-3" />
        Active
      </div>
    );
  };

  // Handle stock adjustment
  const handleStockAdjustment = async () => {
    if(!can_adjust_inventory) return;
    if (!editingItem || !adjustmentValue) return;
    
    try {
      const res = await http.post("/inventory-adjust/", {
        id: editingItem.id,
        adjustment_type: adjustmentType,
        amount: parseInt(adjustmentValue),
        note: adjustmentNote || "Stock adjustment from admin panel",
      });
      const resp = res.data as ApiResp;
      if (!resp.error && resp.data) {
        toast.success("Stock adjusted successfully");
        fetchInventory();
        setAdjustmentDialog(false);
        setEditingItem(null);
        setAdjustmentValue("");
        setAdjustmentNote("");
        return;
      }
      toast.error(resp.data || "Failed to adjust stock");
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Failed to adjust stock");
    }
  };

  // Get stock health indicator
  const getStockHealthIndicator = (item: ProductInventory) => {
    const percentage = item.low_stock_alert > 0 
      ? Math.min((item.stock_quantity / item.low_stock_alert) * 100, 100)
      : 100;
    
    if (item.stock_health === "critical") {
      return (
        <div className="w-full bg-rose-100 rounded-full h-1.5">
          <div 
            className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      );
    }
    
    if (item.stock_health === "warning") {
      return (
        <div className="w-full bg-amber-100 rounded-full h-1.5">
          <div 
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      );
    }
    
    return (
      <div className="w-full bg-emerald-100 rounded-full h-1.5">
        <div 
          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };


  // Animated stats cards
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = "primary",
    trend,
    delay = 0 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color?: "primary" | "secondary" | "accent" | "highlight";
    trend?: "up" | "down" | "neutral";
    delay?: number;
  }) => {
    const colorClasses = {
      primary: "from-primary/10 to-primary/5 border-primary/20",
      secondary: "from-secondary/10 to-secondary/5 border-secondary/20",
      accent: "from-accent/10 to-accent/5 border-accent/20",
      highlight: "from-highlight/10 to-highlight/5 border-highlight/20",
    };

    const iconClasses = {
      primary: "bg-primary/10 text-primary",
      secondary: "bg-secondary/10 text-secondary",
      accent: "bg-accent/10 text-accent",
      highlight: "bg-highlight/10 text-highlight",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="relative"
      >
        <Card className={cn(
          "border bg-gradient-to-br backdrop-blur-sm overflow-hidden",
          colorClasses[color]
        )}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground/70">{title}</p>
                <h3 className="text-2xl font-display font-bold tracking-tight">
                  {value}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground/60">{subtitle}</p>
                  {trend && trend !== "neutral" && (
                    trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-500" />
                    )
                  )}
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-xl",
                iconClasses[color]
              )}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current/20 to-transparent opacity-20" />
        </Card>
      </motion.div>
    );
  };

  // Product Card for Grid View
  const ProductCard = ({ item }: { item: ProductInventory }) => {
    const isLowStock = item.stock_quantity <= item.low_stock_alert;
    const stockPercentage = (item.stock_quantity / item.low_stock_alert) * 100;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative"
      >
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-background">
            <img 
              src={resolveSrc(item.image)} 
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.png';
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {item.is_best_seller && (
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-medium text-white">
                  <Award className="h-3 w-3" />
                  Best Seller
                </div>
              )}
              {item.is_new && (
                <div className="rounded-full bg-gradient-to-r from-highlight to-pink-500 px-3 py-1 text-xs font-medium text-white">
                  New
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => {
                  setEditingItem(item);
                  setAdjustmentDialog(true);
                }}
              >
                <Edit2 className="h-4 w-4 text-primary" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-muted p-1.5">
                  {categoryIcons[item.category_name] || <Package className="h-3 w-3" />}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {item.category_name}
                </span>
              </div>

              {/* Product Name */}
              <h3 className="font-display font-semibold leading-tight line-clamp-1">
                {item.name}
              </h3>

              {/* SKU */}
              <p className="font-mono text-xs text-muted-foreground">
                {item.sku}
              </p>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{format_currency(item.price)}</span>
                {item.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {format_currency(item.original_price)}
                  </span>
                )}
              </div>

              {/* Stock Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stock Level</span>
                  <span className={cn(
                    "text-sm font-bold",
                    isLowStock ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {item.stock_quantity} units
                  </span>
                </div>
                {getStockHealthIndicator(item)}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Reorder: {item.low_stock_alert}</span>
                  <span>{item.months_coverage.toFixed(1)} mo coverage</span>
                </div>
              </div>

              {/* Sales Performance */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Sold (30d)</p>
                  <p className="font-bold text-lg">{item.sold_last_30_days}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Stock Value</p>
                  <p className="font-bold text-lg">{format_currency(item.stock_value)}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-3">
                {getStatusBadge(item)}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
            Inventory Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time stock monitoring and analytics for Doonneys Beauty
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              List
            </Button>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 shadow-soft"
            onClick={fetchInventory}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Stock Value"
            value={format_currency(stats.total_stock_value)}
            subtitle={`${stats.total_stock_units} units in stock`}
            icon={DollarSign}
            color="primary"
            trend="up"
            delay={0.1}
          />
          
          <StatCard
            title="Stock Health"
            value={`${((stats.in_stock_items / stats.total_products) * 100).toFixed(0)}%`}
            subtitle={`${stats.low_stock_items} low, ${stats.out_of_stock_items} out`}
            icon={BarChart3}
            color="accent"
            trend="up"
            delay={0.2}
          />
          
          <StatCard
            title="Monthly Turnover"
            value={`${stats.turnover_rate.toFixed(1)}%`}
            subtitle={`${stats.total_sold_last_month} units sold`}
            icon={TrendingUp}
            color="highlight"
            trend="up"
            delay={0.3}
          />
          
          <StatCard
            title="Stock Coverage"
            value={`${stats.average_stock_coverage.toFixed(1)} mo`}
            subtitle={`${stats.attention_items} need attention`}
            icon={Package}
            color="secondary"
            trend="neutral"
            delay={0.4}
          />
        </div>
      )}

      {/* Stock Health Breakdown */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 bg-gradient-to-br from-background to-muted/30">
            <CardHeader>
              <CardTitle>Stock Health Overview</CardTitle>
              <CardDescription>
                Distribution of inventory items by health status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Healthy Stock */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Healthy</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {stats.stock_health.healthy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {((stats.stock_health.healthy / stats.total_products) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(stats.stock_health.healthy / stats.total_products) * 100} 
                    className="h-2 bg-emerald-100" 
                  />
                </div>

                {/* Warning Stock */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Warning</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {stats.stock_health.warning}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {((stats.stock_health.warning / stats.total_products) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(stats.stock_health.warning / stats.total_products) * 100} 
                    className="h-2 bg-amber-100" 
                  />
                </div>

                {/* Critical Stock */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium">Critical</p>
                        <p className="text-2xl font-bold text-rose-600">
                          {stats.stock_health.critical}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {((stats.stock_health.critical / stats.total_products) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(stats.stock_health.critical / stats.total_products) * 100} 
                    className="h-2 bg-rose-100" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card/50 backdrop-blur-sm rounded-xl border p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="SKU, product name, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Stock Status</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <Package className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="needs_reorder">Needs Reorder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Product Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Check className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
                setStockFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Inventory Content */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-square rounded-xl bg-muted animate-pulse" />
              ))
            ) : filteredInventory.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
                  <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setStockFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredInventory.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Value</TableHead>
                      <TableHead className="text-center">Sales (30d)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={8}>
                            <div className="h-16 bg-muted/50 animate-pulse rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground">No inventory items found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-muted/30">
                          <TableCell>
                            <div className="h-16 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-background">
                              <img 
                                src={resolveSrc(item.image)} 
                                alt={item.name}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium line-clamp-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                              <p className="text-sm font-bold mt-1">{format_currency(item.price)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-muted p-1.5">
                                {categoryIcons[item.category_name] || <Package className="h-3 w-3" />}
                              </div>
                              <span className="text-sm">{item.category_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className={cn(
                                "font-bold text-lg",
                                item.stock_health === "critical" ? "text-rose-600" :
                                item.stock_health === "warning" ? "text-amber-600" :
                                "text-emerald-600"
                              )}>
                                {item.stock_quantity}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                of {item.low_stock_alert}
                              </p>
                              {getStockHealthIndicator(item)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {format_currency(item.stock_value)}
                          </TableCell>
                          <TableCell className="text-center">
                            <p className="font-bold">{item.sold_last_30_days}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.average_monthly_sales.toFixed(1)}/mo
                            </p>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2 transition-opacity">
                              {can_adjust_inventory && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setAdjustmentDialog(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Dialog */}
      {can_adjust_inventory && (
        <Dialog open={adjustmentDialog} onOpenChange={setAdjustmentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                <Edit2 className="inline h-5 w-5 mr-2" />
                Adjust Stock Level
              </DialogTitle>
              <DialogDescription>
                Update inventory for{" "}
                <span className="font-semibold text-primary">{editingItem?.name}</span>
              </DialogDescription>
            </DialogHeader>
            
            {editingItem && (
              <div className="space-y-6 py-4">
                {/* Product Summary */}
                <div className="bg-gradient-to-br from-muted/30 to-background rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                      <img 
                        src={resolveSrc(editingItem.image)} 
                        alt={editingItem.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{editingItem.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono truncate">
                        {editingItem.sku}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Stock</p>
                          <p className="font-bold text-lg">{editingItem.stock_quantity} units</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Reorder Point</p>
                          <p className="font-bold text-lg">{editingItem.low_stock_alert} units</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjustment Type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Adjustment Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={adjustmentType === "add" ? "default" : "outline"}
                      onClick={() => setAdjustmentType("add")}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                    <Button
                      variant={adjustmentType === "subtract" ? "default" : "outline"}
                      onClick={() => setAdjustmentType("subtract")}
                      className="flex-1"
                    >
                      <TrendingDownIcon className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    <Button
                      variant={adjustmentType === "set" ? "default" : "outline"}
                      onClick={() => setAdjustmentType("set")}
                      className="flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Set
                    </Button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value)}
                    placeholder="Enter quantity"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    New total:{" "}
                    <span className="font-semibold">
                      {adjustmentType === "add" 
                        ? editingItem.stock_quantity + parseInt(adjustmentValue || "0")
                        : adjustmentType === "subtract"
                        ? Math.max(0, editingItem.stock_quantity - parseInt(adjustmentValue || "0"))
                        : parseInt(adjustmentValue || "0")
                      } units
                    </span>
                  </p>
                </div>

                {/* Note */}
                <div>
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    placeholder="Add a note about this adjustment..."
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAdjustmentDialog(false);
                  setEditingItem(null);
                  setAdjustmentValue("");
                  setAdjustmentNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStockAdjustment}
                disabled={!adjustmentValue}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminInventory;