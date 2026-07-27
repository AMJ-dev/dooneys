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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/lib/httpClient";
import { toast } from "react-toastify";
import { ApiResp, Order } from "@/lib/types";
import { format_currency, resolveSrc } from "@/lib/functions";

// Updated status config - matching API status values
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
  packaging: { 
    label: "Packaging", 
    icon: Package, 
    color: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50/60 to-orange-50/40",
    borderColor: "border-orange-200/40",
    step: 2,
    gradient: "from-orange-400/10 via-orange-300/5 to-orange-400/10",
    iconBg: "bg-gradient-to-br from-orange-100/80 to-orange-50/80",
    timelineColor: "bg-gradient-to-r from-orange-400 to-orange-300",
    glassBg: "bg-orange-50/30",
    lightColor: "text-orange-700"
  },
  processing: { 
    label: "Processing", 
    icon: Package, 
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50/60 to-indigo-50/40",
    borderColor: "border-blue-200/40",
    step: 2,
    gradient: "from-blue-400/10 via-indigo-300/5 to-blue-400/10",
    iconBg: "bg-gradient-to-br from-blue-100/80 to-indigo-50/80",
    timelineColor: "bg-gradient-to-r from-blue-400 to-indigo-300",
    glassBg: "bg-blue-50/30",
    lightColor: "text-blue-700"
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

// Map API status to statusConfig keys
const mapStatus = (status: string): keyof typeof statusConfig => {
  const statusMap: Record<string, keyof typeof statusConfig> = {
    'pending': 'pending',
    'packaging': 'packaging',
    'processing': 'processing',
    'shipped': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled'
  };
  return statusMap[status] || 'processing';
};

const OrdersPage = () => {
  const navigate = useNavigate();
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
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = (order: Order) => {
    // Navigate to the tracking page with the order number
    const orderNumber = order.orderNumber || order.id;
    navigate(`/account/track-order/${orderNumber}`);
  };

  const filteredOrders = orders.filter(order => {
    const statusKey = mapStatus(order.status);
    
    if (activeTab !== "all" && statusKey !== activeTab) {
      return false;
    }
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesOrderId = order.orderNumber?.toLowerCase().includes(query) || 
                            order.id?.toLowerCase().includes(query);
      const matchesItems = order.items?.some(item => 
        item.name?.toLowerCase().includes(query)
      );
      
      if (!matchesOrderId && !matchesItems) {
        return false;
      }
    }
    
    if (statusFilter !== "all" && statusKey !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => mapStatus(o.status) === "pending").length,
    packaging: orders.filter(o => mapStatus(o.status) === "packaging").length,
    processing: orders.filter(o => mapStatus(o.status) === "processing").length,
    shipped: orders.filter(o => mapStatus(o.status) === "shipped").length,
    delivered: orders.filter(o => mapStatus(o.status) === "delivered").length,
    cancelled: orders.filter(o => mapStatus(o.status) === "cancelled").length,
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

  const getProgressPercentage = (status: keyof typeof statusConfig) => {
    const step = statusConfig[status]?.step || 0;
    return (step / 4) * 100;
  };

  const getSpendingStats = () => {
    const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    const deliveredOrders = orders.filter(o => mapStatus(o.status) === "delivered").length;
    
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
      <div className="space-y-4 sm:space-y-6 animate-pulse px-4 sm:px-0">
        <Skeleton className="h-32 sm:h-40 rounded-2xl sm:rounded-3xl" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 sm:h-24 rounded-xl sm:rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <div className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 sm:h-48 rounded-xl sm:rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto pb-8">
      {/* Glassy Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/40 bg-gradient-to-br from-white/50 via-white/30 to-white/50 backdrop-blur-xl shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
        
        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    Order History
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Track and manage your premium beauty purchases</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium">{orders.length} Total Orders</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40">
                  <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium">{format_currency(spendingStats.totalSpent)} Spent</span>
                </div>
              </div>
            </div>
            
            <Button 
              size="default" 
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group w-full sm:w-auto text-sm sm:text-base"
              onClick={() => navigate('/shop')}
            >
              <Sparkle className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
              <span>Continue Shopping</span>
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Glassy Stats Overview */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Total Value</p>
                <p className="font-display text-base sm:text-xl font-bold text-foreground">{format_currency(spendingStats.totalSpent)}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-muted-foreground">Across {spendingStats.orderCount} orders</span>
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Delivered</p>
                <p className="font-display text-base sm:text-xl font-bold text-foreground">{spendingStats.deliveredOrders}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-100/20 to-green-100/20 group-hover:from-emerald-100/30 group-hover:to-green-100/30 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-muted-foreground">Successfully delivered</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] sm:text-xs font-medium">
                  {orders.length > 0 ? ((spendingStats.deliveredOrders / orders.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Avg Order</p>
                <p className="font-display text-base sm:text-xl font-bold text-foreground">{format_currency(spendingStats.averageOrderValue)}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent/10 to-highlight/10 group-hover:from-accent/20 group-hover:to-highlight/20 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-muted-foreground">Per order average</span>
                <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">In Progress</p>
                <p className="font-display text-base sm:text-xl font-bold text-foreground">
                  {statusCounts.packaging + statusCounts.processing + statusCounts.shipped + statusCounts.pending}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100/20 to-purple-100/20 group-hover:from-violet-100/30 group-hover:to-purple-100/30 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/30">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-muted-foreground">Active orders</span>
                <Clock4 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Glassy Filter Navigation */}
      <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 border border-white/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-1.5 sm:p-2">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 rounded-xl border-white/40 bg-white/40 text-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
              Filter Orders ({statusCounts.all})
            </Button>
          </div>

          {/* Desktop Status Tabs */}
          <div className="hidden md:block overflow-x-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white/40 backdrop-blur-sm border border-white/40 p-1 rounded-xl">
                {[
                  { value: "all", label: "All", count: statusCounts.all },
                  { value: "pending", label: "Pending", count: statusCounts.pending },
                  { value: "packaging", label: "Packaging", count: statusCounts.packaging },
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
                      className="relative rounded-lg px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-white/60 group/tab text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-3.5 w-3.5 ${status?.color || ''}`} />
                        <span className="font-medium">{tab.label}</span>
                        <Badge className="ml-1 bg-white/60 text-xs font-normal">
                          {tab.count}
                        </Badge>
                      </div>
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
              className="md:hidden space-y-1.5 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "all", label: "All", count: statusCounts.all },
                  { value: "pending", label: "Pending", count: statusCounts.pending },
                  { value: "packaging", label: "Packaging", count: statusCounts.packaging },
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
                      className={`justify-start gap-2 rounded-lg text-sm ${activeTab === tab.value ? "bg-gradient-to-r from-primary to-accent" : "bg-white/40 border-white/40"}`}
                      onClick={() => {
                        setActiveTab(tab.value);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <StatusIcon className={`h-3.5 w-3.5 ${activeTab === tab.value ? "text-white" : status?.color || ''}`} />
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 w-full rounded-xl bg-white/40 backdrop-blur-sm border-white/40 focus:border-primary/50 h-10 sm:h-11 text-sm"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-white/40 bg-white/40 h-10 w-10 sm:h-11 sm:w-11">
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
          className="text-center py-12 sm:py-16 md:py-20"
        >
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-highlight/10 rounded-full blur-xl" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-primary/20" />
            </div>
          </div>
          <h3 className="font-display text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3">No Orders Found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-xs md:max-w-md mx-auto px-4">
            {searchQuery || activeTab !== "all" 
              ? "Try different search terms or filters"
              : "Start your beauty journey with our premium collection"}
          </p>
          <Button 
            size="default" 
            className="gap-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 text-sm sm:text-base"
            onClick={() => navigate('/shop')}
          >
            <Sparkle className="h-4 w-4 sm:h-5 sm:w-5" />
            Browse Collection
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, index) => {
              const statusKey = mapStatus(order.status);
              const status = statusConfig[statusKey];
              const StatusIcon = status.icon;
              const progress = getProgressPercentage(statusKey);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className={`
                    relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/40 
                    ${status.bgColor} backdrop-blur-xl
                    transition-all duration-300 hover:shadow-xl hover:border-white/60
                    hover:translate-y-[-2px]
                  `}>
                    <div className={`absolute inset-0 ${status.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Top Bar with Status */}
                    <div className="relative p-3 sm:p-4 border-b border-white/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl ${status.iconBg} border ${status.borderColor} flex items-center justify-center shadow-sm flex-shrink-0`}>
                            <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${status.color}`} />
                          </div>
                          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <h3 className="font-display text-sm sm:text-lg font-semibold text-foreground truncate max-w-[120px] sm:max-w-xs">
                                #{order.orderNumber || order.id}
                              </h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 flex-shrink-0"
                                onClick={() => handleCopyOrderId(order.orderNumber || order.id)}
                              >
                                <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <Badge variant="outline" className={`text-[10px] sm:text-xs border ${status.borderColor} bg-white/60`}>
                                {status.label}
                              </Badge>
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {new Date(order.date).toLocaleDateString('en-US', { 
                                  month: 'short', day: 'numeric' 
                                })}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {order.items?.length || 0} items
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order Total - Desktop */}
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Total Amount</p>
                          <p className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {format_currency(order.total)}
                          </p>
                        </div>

                        {/* Mobile Total */}
                        <div className="md:hidden flex items-center justify-between w-full">
                          <span className="text-xs text-muted-foreground">Total:</span>
                          <span className="font-display text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {format_currency(order.total)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {statusKey !== "cancelled" && (
                        <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] sm:text-xs text-muted-foreground">Order Progress</span>
                            <span className="text-[10px] sm:text-xs font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {Math.round(progress)}% Complete
                            </span>
                          </div>
                          <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
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
                    <div className="p-3 sm:p-4">
                      <div className="space-y-2 sm:space-y-3">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ x: 4 }}
                            className="group/item relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm p-2 sm:p-3 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* Product Image */}
                              <div className="relative flex-shrink-0">
                                <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden border-2 border-white/30 shadow-md">
                                  <img 
                                    src={resolveSrc(item.image)} 
                                    alt={item.name} 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                                  <span className="text-[8px] sm:text-[10px] font-bold text-white">{item.quantity}</span>
                                </div>
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-xs sm:text-sm truncate group-hover/item:text-primary transition-colors">
                                      {item.name}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">{format_currency(item.price)} each</p>
                                  </div>
                                  <p className="text-xs sm:text-sm font-medium ml-2 flex-shrink-0">
                                    {format_currency(item.price * item.quantity)}
                                  </p>
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
                          className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/30"
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full gap-2 text-muted-foreground hover:text-primary group/more text-[10px] sm:text-xs"
                            onClick={() => handleViewDetails(order)}
                          >
                            <span>+ {order.items.length - 3} more items</span>
                            <ChevronRight className="h-3 w-3 group-hover/more:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3 sm:p-4 border-t border-white/30 bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        {/* Left Side - Shipping Info */}
                        {order.shippingAddress && (
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Shipping to</p>
                              <p className="text-[10px] sm:text-sm font-medium truncate max-w-[150px] sm:max-w-xs">{order.shippingAddress}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Right Side - Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 rounded-lg border-white/40 hover:border-primary/40 hover:bg-primary/5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          
                          {statusKey !== "cancelled" && (
                            <Button
                              size="sm"
                              className="gap-1 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md shadow-primary/20 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                              onClick={() => handleTrackOrder(order)}
                            >
                              <TruckIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span className="hidden sm:inline">Track</span>
                            </Button>
                          )}
                          
                          {statusKey === "delivered" && (
                            <Button
                              size="sm"
                              className="gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-md shadow-emerald/20 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                              onClick={() => handleReorder(order)}
                            >
                              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span className="hidden sm:inline">Reorder</span>
                            </Button>
                          )}
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
    </div>
  );
};

export default OrdersPage;