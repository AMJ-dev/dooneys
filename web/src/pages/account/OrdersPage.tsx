import { useState, startTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MapPin, 
  ShoppingBag,
  Calendar,
  ShoppingCart,
  Eye,
  Copy,
  Download,
  Filter,
  Search,
  ArrowRight,
  Sparkles,
  Shield,
  RefreshCw,
  Truck as TruckIcon,
  X,
  Info,
  TrendingUp,
  Star,
  Zap,
  Activity,
  Target,
  Crown,
  Gem,
  Sparkle,
  ChevronRight,
  Heart,
  Share2,
  MessageCircle,
  Phone,
  Mail,
  Gift,
  Award,
  Clock4,
  ShieldCheck,
  DollarSign,
  Users,
  ArrowUpRight,
  Box,
  Menu,
  List,
  MoreVertical,
  CreditCard,
  User,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/lib/httpClient";
import { toast } from "react-toastify";
import { ApiResp, Order } from "@/lib/types";
import { format_currency, resolveSrc } from "@/lib/functions";

// Updated status config without blue colors - FIXED progress steps
const statusConfig = {
  pending: { 
    label: "Pending", 
    icon: Clock, 
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50/60 to-amber-50/40",
    borderColor: "border-amber-200/40",
    step: 1,
    gradient: "from-amber-400/10 via-amber-300/5 to-amber-400/10",
    iconBg: "bg-gradient-to-br from-amber-100/80 to-amber-50/80",
    timelineColor: "bg-gradient-to-r from-amber-400 to-amber-300",
    glassBg: "bg-amber-50/30",
    lightColor: "text-amber-700"
  },
  processing: { 
    label: "Processing", 
    icon: Package, 
    color: "text-orange-600", // Changed from terracotta to orange
    bgColor: "bg-gradient-to-br from-orange-50/60 to-orange-50/40", // Changed from terracotta
    borderColor: "border-orange-200/40",
    step: 2,
    gradient: "from-orange-400/10 via-orange-300/5 to-orange-400/10",
    iconBg: "bg-gradient-to-br from-orange-100/80 to-orange-50/80",
    timelineColor: "bg-gradient-to-r from-orange-400 to-orange-300",
    glassBg: "bg-orange-50/30",
    lightColor: "text-orange-700"
  },
  shipped: { 
    label: "Shipped", 
    icon: Truck, 
    color: "text-violet-600",
    bgColor: "bg-gradient-to-br from-violet-50/60 to-purple-50/40",
    borderColor: "border-violet-200/40",
    step: 3,
    gradient: "from-violet-400/10 via-purple-300/5 to-violet-400/10",
    iconBg: "bg-gradient-to-br from-violet-100/80 to-violet-50/80",
    timelineColor: "bg-gradient-to-r from-violet-400 to-purple-300",
    glassBg: "bg-violet-50/30",
    lightColor: "text-violet-700"
  },
  delivered: { 
    label: "Delivered", 
    icon: CheckCircle, 
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50/60 to-green-50/40",
    borderColor: "border-emerald-200/40",
    step: 4,
    gradient: "from-emerald-400/10 via-green-300/5 to-emerald-400/10",
    iconBg: "bg-gradient-to-br from-emerald-100/80 to-emerald-50/80",
    timelineColor: "bg-gradient-to-r from-emerald-400 to-green-300",
    glassBg: "bg-emerald-50/30",
    lightColor: "text-emerald-700"
  },
  cancelled: { 
    label: "Cancelled", 
    icon: XCircle, 
    color: "text-rose-600",
    bgColor: "bg-gradient-to-br from-rose-50/60 to-pink-50/40",
    borderColor: "border-rose-200/40",
    step: 0,
    gradient: "from-rose-400/10 via-pink-300/5 to-rose-400/10",
    iconBg: "bg-gradient-to-br from-rose-100/80 to-rose-50/80",
    timelineColor: "bg-gradient-to-r from-rose-400 to-pink-300",
    glassBg: "bg-rose-50/30",
    lightColor: "text-rose-700"
  },
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch_order();
  }, []);

  const fetch_order = async () => {
    try {
      setIsLoading(true);
      const res = await http.get("/my-orders/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setOrders(resp.data);
      } else {
        toast.error(resp.data || "Failed to load orders");
        // Keep mock data for display
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders. Please try again.");
      // Keep mock data for display
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = async (order: Order) => {
    try {
      const res = await http.get(`/track-order/${order.id}/`);
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        setSelectedOrder({
          ...order,
          trackingData: resp.data
        });
        setIsTrackingOpen(true);
      } else {
        toast.info("Tracking information is not available yet. Please check back later.");
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
      toast.info("Tracking information will be available once your order is shipped.");
    }
  };

  // FIXED: Simplified filtering logic
  const filteredOrders = orders.filter(order => {
    // First check if matches active tab
    if (activeTab !== "all" && order.status !== activeTab) {
      return false;
    }
    
    // Then check search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesOrderId = order.id.toLowerCase().includes(query);
      const matchesItems = order.items?.some(item => 
        item.name.toLowerCase().includes(query)
      );
      
      if (!matchesOrderId && !matchesItems) {
        return false;
      }
    }
    
    // Then check status filter (if not using tabs)
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied!");
  };

  const handleViewDetails = (order: Order) => {
    startTransition(() => navigate(`/account/order-details/${order.id}`));
  };

  const handleReorder = (order: Order) => {
    toast.success("✨ Items added to cart!");
  };

  // FIXED: Correct progress calculation
  const getProgressPercentage = (status: keyof typeof statusConfig) => {
    const step = statusConfig[status].step;
    return (step / 4) * 100;
  };

  const getSpendingStats = () => {
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    
    return {
      totalSpent,
      averageOrderValue,
      deliveredOrders,
      orderCount: orders.length
    };
  };

  const spendingStats = getSpendingStats();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Debug Info - Remove in production */}
      <div className="hidden text-xs text-muted-foreground p-2 bg-white/20 rounded-lg">
        Showing {filteredOrders.length} of {orders.length} orders | 
        Active Tab: {activeTab} | 
        Search: "{searchQuery}" | 
        Filter: "{statusFilter}"
      </div>

      {/* Glassy Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/50 via-white/30 to-white/50 backdrop-blur-xl shadow-xl"
      >
        {/* Glassy Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <Crown className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Order History
                  </h1>
                  <p className="text-muted-foreground mt-1">Track and manage your premium beauty purchases</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs md:text-sm font-medium">{orders.length} Total Orders</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40">
                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs md:text-sm font-medium">{format_currency(spendingStats.totalSpent)} Spent</span>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="gap-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group w-full lg:w-auto"
            >
              <Sparkle className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>Continue Shopping</span>
              <ArrowUpRight className="h-5 w-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Glassy Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                <p className="font-display text-xl font-bold text-foreground">{format_currency(spendingStats.totalSpent)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 flex items-center justify-center">
                <Gem className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Across {spendingStats.orderCount} orders</span>
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Delivered</p>
                <p className="font-display text-xl font-bold text-foreground">{spendingStats.deliveredOrders}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100/20 to-green-100/20 group-hover:from-emerald-100/30 group-hover:to-green-100/30 transition-all duration-300 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Successfully delivered</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                  {((spendingStats.deliveredOrders / orders.length) * 100 || 0).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Order</p>
                <p className="font-display text-xl font-bold text-foreground">{format_currency(spendingStats.averageOrderValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/10 to-highlight/10 group-hover:from-accent/20 group-hover:to-highlight/20 transition-all duration-300 flex items-center justify-center">
                <Target className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Per order average</span>
                <ArrowUpRight className="h-3 w-3 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                <p className="font-display text-xl font-bold text-foreground">
                  {statusCounts.processing + statusCounts.shipped + statusCounts.pending}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-100/20 to-purple-100/20 group-hover:from-violet-100/30 group-hover:to-purple-100/30 transition-all duration-300 flex items-center justify-center">
                <Package className="h-5 w-5 text-violet-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active orders</span>
                <Clock4 className="h-3 w-3 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Glassy Filter Navigation */}
      <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-2 border border-white/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 rounded-xl border-white/40 bg-white/40"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
              Filter Orders
            </Button>
          </div>

          {/* Desktop Status Tabs */}
          <div className="hidden md:block">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white/40 backdrop-blur-sm border border-white/40 p-1 rounded-xl">
                {[
                  { value: "all", label: "All", count: statusCounts.all },
                  { value: "pending", label: "Pending", count: statusCounts.pending },
                  { value: "processing", label: "Processing", count: statusCounts.processing },
                  { value: "shipped", label: "Shipped", count: statusCounts.shipped },
                  { value: "delivered", label: "Delivered", count: statusCounts.delivered },
                  { value: "cancelled", label: "Cancelled", count: statusCounts.cancelled }
                ].map((tab) => {
                  const StatusIcon = statusConfig[tab.value as keyof typeof statusConfig]?.icon || Package;
                  const status = statusConfig[tab.value as keyof typeof statusConfig];
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="relative rounded-lg px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-white/60 group/tab"
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-3.5 w-3.5 ${status?.color}`} />
                        <span className="font-medium text-sm">{tab.label}</span>
                        <Badge className="ml-1 bg-white/60 text-xs font-normal">
                          {tab.count}
                        </Badge>
                      </div>
                      {status && (
                        <div className={`absolute inset-0 rounded-lg opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity duration-300 ${status.gradient}`} />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* Mobile Status Tabs */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden space-y-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "all", label: "All", count: statusCounts.all },
                  { value: "pending", label: "Pending", count: statusCounts.pending },
                  { value: "processing", label: "Processing", count: statusCounts.processing },
                  { value: "shipped", label: "Shipped", count: statusCounts.shipped },
                  { value: "delivered", label: "Delivered", count: statusCounts.delivered },
                  { value: "cancelled", label: "Cancelled", count: statusCounts.cancelled }
                ].map((tab) => {
                  const StatusIcon = statusConfig[tab.value as keyof typeof statusConfig]?.icon || Package;
                  const status = statusConfig[tab.value as keyof typeof statusConfig];
                  return (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "outline"}
                      size="sm"
                      className={`justify-start gap-2 rounded-lg ${activeTab === tab.value ? "bg-gradient-to-r from-primary to-accent" : "bg-white/40 border-white/40"}`}
                      onClick={() => {
                        setActiveTab(tab.value);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <StatusIcon className={`h-3.5 w-3.5 ${activeTab === tab.value ? "text-white" : status?.color}`} />
                      <span>{tab.label}</span>
                      <Badge className={`ml-auto ${activeTab === tab.value ? "bg-white/30" : "bg-white/60"}`}>
                        {tab.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl bg-white/40 backdrop-blur-sm border-white/40 focus:border-primary/50"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-white/40 bg-white/40">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-white/40 bg-white/50 backdrop-blur-xl">
                <DropdownMenuLabel>More Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => fetch_order()}
                  className="rounded-lg cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Orders
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toast.success("Exporting orders...")}
                  className="rounded-lg cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* LIST VIEW Orders */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 md:py-20"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-highlight/10 rounded-full blur-xl" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-primary/20" />
            </div>
            <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <h3 className="font-display text-xl md:text-2xl mb-3">No Orders Found</h3>
          <p className="text-muted-foreground mb-6 md:mb-8 max-w-xs md:max-w-md mx-auto">
            {searchQuery || statusFilter !== "all" 
              ? "Try different search terms or filters"
              : "Start your beauty journey with our premium collection"}
          </p>
          <Button 
            size="lg" 
            className="gap-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20"
          >
            <Sparkle className="h-5 w-5" />
            Browse Collection
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, index) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const progress = getProgressPercentage(order.status);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  {/* LIST VIEW Glassy Order Card */}
                  <div className={`
                    relative overflow-hidden rounded-2xl border border-white/40 
                    ${status.bgColor} backdrop-blur-xl
                    transition-all duration-300 hover:shadow-xl hover:border-white/60
                    hover:translate-y-[-2px]
                  `}>
                    {/* Glassy Overlay */}
                    <div className={`absolute inset-0 ${status.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Top Bar with Status */}
                    <div className="relative p-4 border-b border-white/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl ${status.iconBg} border ${status.borderColor} flex items-center justify-center shadow-sm`}>
                            <StatusIcon className={`h-5 w-5 ${status.color}`} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display text-lg font-semibold text-foreground">
                                Order #{order.id}
                              </h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
                                onClick={() => handleCopyOrderId(order.id)}
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={`text-xs border ${status.borderColor} bg-white/60`}>
                                {status.label}
                              </Badge>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.date).toLocaleDateString('en-US', { 
                                  month: 'short', day: 'numeric', year: 'numeric' 
                                })}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ShoppingCart className="h-3 w-3" />
                                {order.items?.length || 0} items
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order Total - Desktop */}
                        <div className="hidden md:block text-right">
                          <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                          <p className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {format_currency(order.total)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar - Mobile & Desktop */}
                      {order.status !== "cancelled" && (
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Order Progress</span>
                            <span className="text-xs font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {Math.round(progress)}% Complete
                            </span>
                          </div>
                          <div className="relative h-1.5 bg-white/30 rounded-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
                            <motion.div 
                              className={`absolute left-0 top-0 h-full ${status.timelineColor} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items List */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ x: 4 }}
                            className="group/item relative overflow-hidden rounded-xl bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm p-3 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              {/* Product Image */}
                              <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg blur-sm" />
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-md">
                                  <img 
                                    src={resolveSrc(item.image)} 
                                    alt={item.name} 
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                </div>
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                                  <span className="text-[10px] font-bold text-white">{item.quantity}</span>
                                </div>
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm truncate group-hover/item:text-primary transition-colors">
                                      {item.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-xs text-muted-foreground">{format_currency(item.price)} each</p>
                                      {item.isBestSeller && (
                                        <Badge className="text-xs bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200">
                                          <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500" />
                                          Best Seller
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">
                                      {format_currency(item.price * item.quantity)}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-primary/10"
                                      onClick={() => toast.success("Added to wishlist")}
                                    >
                                      <Heart className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* More Items Indicator */}
                      {order.items?.length > 3 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 pt-3 border-t border-white/30"
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full gap-2 text-muted-foreground hover:text-primary group/more text-xs"
                          >
                            <span>+ {order.items.length - 3} more items in this order</span>
                            <ChevronRight className="h-3 w-3 group-hover/more:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-4 border-t border-white/30 bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Left Side - Shipping Info */}
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Shipping to</p>
                            <p className="text-sm font-medium truncate max-w-xs">{order.shippingAddress}</p>
                          </div>
                        </div>
                        
                        {/* Right Side - Actions & Total (Mobile) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Order Total - Mobile */}
                          <div className="md:hidden text-right">
                            <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                            <p className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {format_currency(order.total)}
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 rounded-lg border-white/40 hover:border-primary/40 hover:bg-primary/5 flex-1 sm:flex-none"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Details</span>
                            </Button>
                            
                            {order.status !== "cancelled" && order.status !== "delivered" && (
                              <Button
                                size="sm"
                                className="gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md shadow-primary/20 flex-1 sm:flex-none"
                                onClick={() => handleTrackOrder(order)}
                              >
                                <TruckIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Track</span>
                              </Button>
                            )}
                            
                            {order.status === "delivered" && (
                              <Button
                                size="sm"
                                className="gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-md shadow-emerald/20 flex-1 sm:flex-none"
                                onClick={() => handleReorder(order)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Reorder</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Glassy Tracking Dialog */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 rounded-2xl md:rounded-3xl border border-white/40 bg-white/50 backdrop-blur-xl shadow-2xl">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              {/* Glassy Dialog Header */}
              <DialogHeader className="relative p-6 md:p-8 bg-gradient-to-br from-white/60 via-white/40 to-white/60 border-b border-white/40">
                <div className="absolute inset-0 bg-gradient-primary opacity-5" />
                <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/4 translate-x-1/4 blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <TruckIcon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="font-display text-xl md:text-2xl font-bold text-foreground">
                          Order Tracking
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1">
                          Track order #{selectedOrder.id}
                        </DialogDescription>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsTrackingOpen(false)}
                      className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/60"
                    >
                      <X className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs md:text-sm">
                      {statusConfig[selectedOrder.status].label}
                    </Badge>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Placed on {new Date(selectedOrder.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${statusConfig[selectedOrder.status].iconBg} border ${statusConfig[selectedOrder.status].borderColor} flex items-center justify-center`}>
                            <StatusIcon className={`h-5 w-5 md:h-6 md:w-6 ${statusConfig[selectedOrder.status].color}`} />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-semibold">Current Status</h3>
                            <p className="text-sm text-muted-foreground">Live updates</p>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 rounded-lg border-white/40 hover:border-primary/40 w-full md:w-auto"
                          onClick={() => fetch_order().then(() => toast.success("Status refreshed"))}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                      </div>
                      
                      {selectedOrder.trackingData ? (
                        <div className="space-y-4 md:space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                              <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Tracking Number</p>
                              <p className="font-mono font-bold text-base md:text-lg break-all">{selectedOrder.trackingData.trackingNumber}</p>
                            </div>
                            <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                              <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Carrier</p>
                              <p className="font-medium text-base md:text-lg">{selectedOrder.trackingData.carrier}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 md:py-8">
                          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <Clock className="h-8 w-8 md:h-10 md:w-10 text-primary/30" />
                          </div>
                          <h4 className="font-display text-lg mb-2">Preparing Your Order</h4>
                          <p className="text-muted-foreground mb-6 text-sm md:text-base">
                            Your items are being prepared. Tracking will appear once shipped.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Support Card */}
                  <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                          <Users className="h-6 w-6 md:h-7 md:w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display text-lg font-semibold mb-2 md:mb-3">Need Help?</h4>
                          <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                            Our support team is here to help with any questions.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Button variant="outline" className="gap-2 rounded-xl h-auto py-3 justify-start hover:border-primary/40 hover:bg-primary/5 text-xs md:text-sm">
                              <Phone className="h-4 w-4 text-primary" />
                              <div className="text-left">
                                <p className="font-medium">Call Us</p>
                                <p className="text-muted-foreground">24/7 Support</p>
                              </div>
                            </Button>
                            <Button variant="outline" className="gap-2 rounded-xl h-auto py-3 justify-start hover:border-primary/40 hover:bg-primary/5 text-xs md:text-sm">
                              <Mail className="h-4 w-4 text-primary" />
                              <div className="text-left">
                                <p className="font-medium">Email</p>
                                <p className="text-muted-foreground">Quick Response</p>
                              </div>
                            </Button>
                            <Button variant="outline" className="gap-2 rounded-xl h-auto py-3 justify-start hover:border-primary/40 hover:bg-primary/5 text-xs md:text-sm">
                              <MessageCircle className="h-4 w-4 text-primary" />
                              <div className="text-left">
                                <p className="font-medium">Live Chat</p>
                                <p className="text-muted-foreground">Instant Help</p>
                              </div>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              {/* Glassy Dialog Footer */}
              <div className="p-4 md:p-6 border-t border-white/40 bg-gradient-to-br from-white/50 to-white/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                  <div className="flex flex-wrap gap-2 md:gap-4">
                    <Button 
                      variant="outline" 
                      className="gap-2 rounded-xl border-white/40 hover:border-primary/40 text-xs md:text-sm"
                      onClick={() => handleViewDetails(selectedOrder)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2 rounded-xl border-white/40 hover:border-primary/40 text-xs md:text-sm"
                      onClick={() => toast.success("Invoice shared")}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <Button 
                      variant="outline" 
                      className="gap-2 rounded-xl border-white/40 hover:border-primary/40 text-xs md:text-sm"
                      onClick={() => setIsTrackingOpen(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      className="gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md shadow-primary/20 text-xs md:text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;