import { useState, useEffect, startTransition } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Download,
  Calendar,
  User,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  RefreshCw,
  Crown,
  Gem,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/lib/httpClient";
import { toast } from "react-toastify";
import { ApiResp, Order } from "@/lib/types";
import { format_currency } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

const statusConfig = {
  pending: { 
    label: "Pending", 
    icon: Clock, 
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50/60 to-amber-50/40",
    borderColor: "border-amber-200/40",
    gradient: "from-amber-400/10 via-amber-300/5 to-amber-400/10",
    iconBg: "bg-gradient-to-br from-amber-100/80 to-amber-50/80",
    timelineColor: "bg-gradient-to-r from-amber-400 to-amber-300",
    lightColor: "text-amber-700"
  },
  processing: { 
    label: "Processing", 
    icon: Package, 
    color: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50/60 to-orange-50/40",
    borderColor: "border-orange-200/40",
    gradient: "from-orange-400/10 via-orange-300/5 to-orange-400/10",
    iconBg: "bg-gradient-to-br from-orange-100/80 to-orange-50/80",
    timelineColor: "bg-gradient-to-r from-orange-400 to-orange-300",
    lightColor: "text-orange-700"
  },
  packaging: { 
    label: "Packaging", 
    icon: Package, 
    color: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50/60 to-orange-50/40",
    borderColor: "border-orange-200/40",
    gradient: "from-orange-400/10 via-orange-300/5 to-orange-400/10",
    iconBg: "bg-gradient-to-br from-orange-100/80 to-orange-50/80",
    timelineColor: "bg-gradient-to-r from-orange-400 to-orange-300",
    lightColor: "text-orange-700"
  },
  shipped: { 
    label: "Shipped", 
    icon: Truck, 
    color: "text-violet-600",
    bgColor: "bg-gradient-to-br from-violet-50/60 to-purple-50/40",
    borderColor: "border-violet-200/40",
    gradient: "from-violet-400/10 via-purple-300/5 to-violet-400/10",
    iconBg: "bg-gradient-to-br from-violet-100/80 to-violet-50/80",
    timelineColor: "bg-gradient-to-r from-violet-400 to-purple-300",
    lightColor: "text-violet-700"
  },
  ready_for_pickup: { 
    label: "Ready for pickup", 
    icon: Truck, 
    color: "text-violet-600",
    bgColor: "bg-gradient-to-br from-violet-50/60 to-purple-50/40",
    borderColor: "border-violet-200/40",
    gradient: "from-violet-400/10 via-purple-300/5 to-violet-400/10",
    iconBg: "bg-gradient-to-br from-violet-100/80 to-violet-50/80",
    timelineColor: "bg-gradient-to-r from-violet-400 to-purple-300",
    lightColor: "text-violet-700"
  },
  delivered: { 
    label: "Delivered", 
    icon: CheckCircle, 
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50/60 to-green-50/40",
    borderColor: "border-emerald-200/40",
    gradient: "from-emerald-400/10 via-green-300/5 to-emerald-400/10",
    iconBg: "bg-gradient-to-br from-emerald-100/80 to-emerald-50/80",
    timelineColor: "bg-gradient-to-r from-emerald-400 to-green-300",
    lightColor: "text-emerald-700"
  },
  cancelled: { 
    label: "Cancelled", 
    icon: XCircle, 
    color: "text-rose-600",
    bgColor: "bg-gradient-to-br from-rose-50/60 to-pink-50/40",
    borderColor: "border-rose-200/40",
    gradient: "from-rose-400/10 via-pink-300/5 to-rose-400/10",
    iconBg: "bg-gradient-to-br from-rose-100/80 to-rose-50/80",
    timelineColor: "bg-gradient-to-r from-rose-400 to-pink-300",
    lightColor: "text-rose-700"
  },
};

interface AdminOrder extends Order {
  order_number: string;
  order_source?: string;
  customer?: string | null;
  email?: string;
  phone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  carrier?: string;
  trackingNumber?: string;
}

const AdminOrders = () => {
  const {
    process_orders: can_process_orders,
    view_orders: can_view_orders
  }= usePermissions([
    "view_orders",
    "process_orders",
  ])
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [dateRange, setDateRange] = useState("today");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if(!can_view_orders){
      startTransition(()=>navigate("/unauthorized"))
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await http.get("/admin-orders/");
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        // Transform API data to match our interface
        const transformedOrders = (resp.data as any[]).map(order => ({
          ...order,
          // Extract customer from shipping address or use default
          customer: order.shippingAddress 
            ? order.shippingAddress.split(',')[0]?.trim() || "Guest Customer"
            : "Guest Customer",
          email: "customer@example.com",
          phone: order.shippingAddress 
            ? order.shippingAddress.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "N/A"
            : "N/A",
          paymentMethod: "Card",
          paymentStatus: "Paid",
          carrier: order.carrier || "Canada Post",
          trackingNumber: order.trackingNumber || "Not assigned"
        }));
        
        setOrders(transformedOrders);
      } else {
        toast.error(resp.data || "Failed to load orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders. Please try again.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics from real data
  const calculateStats = (orders: AdminOrder[]) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    const today = new Date();
    const last7Days = orders.filter(order => {
      const orderDate = new Date(order.date);
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    const last30Days = orders.filter(order => {
      const orderDate = new Date(order.date);
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    });

    const last7DaysRevenue = last7Days.reduce((sum, order) => sum + order.total, 0);
    const last30DaysRevenue = last30Days.reduce((sum, order) => sum + order.total, 0);

    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Monthly data for chart
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthKey = month.toLocaleString('default', { month: 'short', year: 'numeric' });
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === month.getMonth() && 
               orderDate.getFullYear() === month.getFullYear();
      });
      return {
        month: monthKey,
        revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orders: monthOrders.length,
      };
    }).reverse();

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts,
      last7DaysRevenue,
      last30DaysRevenue,
      completionRate,
      monthlyRevenue,
    };
  };

  const stats = calculateStats(orders);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: AdminOrder) => {
    // Navigate to order detail page
    const customerNameSlug = order.customer 
      ? order.customer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'guest';
    navigate(`/admin/order/${order.id}/${customerNameSlug}`);
  };


  if(isLoading){
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-48 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Glassy Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/50 via-white/30 to-white/50 backdrop-blur-xl shadow-xl p-6 md:p-8"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Orders Management
                  </h1>
                  <p className="text-muted-foreground mt-1">Track, process, and analyze all customer orders</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] rounded-xl border-white/40 bg-white/40 backdrop-blur-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/40 bg-white/50 backdrop-blur-xl">
                  <SelectItem value="today" className="rounded-lg">Today</SelectItem>
                  <SelectItem value="week" className="rounded-lg">Last 7 Days</SelectItem>
                  <SelectItem value="month" className="rounded-lg">This Month</SelectItem>
                  <SelectItem value="quarter" className="rounded-lg">This Quarter</SelectItem>
                  <SelectItem value="year" className="rounded-lg">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20"
                onClick={fetchOrders}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Glassy Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {format_currency(stats.totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    {format_currency(stats.last7DaysRevenue)} last 7 days
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 flex items-center justify-center">
                  <Gem className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={75} className="h-1.5 bg-primary/20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {stats.totalOrders}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.completionRate.toFixed(1)}% completion rate
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100/20 to-green-100/20 group-hover:from-emerald-100/30 group-hover:to-green-100/30 transition-all duration-300 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats.completionRate} className="h-1.5 bg-emerald-200 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg. Order Value</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {format_currency(stats.avgOrderValue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    {(stats.avgOrderValue > 0 ? 12.5 : 0).toFixed(1)}% increase
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/10 to-highlight/10 group-hover:from-accent/20 group-hover:to-highlight/20 transition-all duration-300 flex items-center justify-center">
                  <Target className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={65} className="h-1.5 bg-accent/20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Orders</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {stats.statusCounts.processing + stats.statusCounts.shipped}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.statusCounts.pending} pending, {stats.statusCounts.cancelled} cancelled
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100/20 to-purple-100/20 group-hover:from-violet-100/30 group-hover:to-purple-100/30 transition-all duration-300 flex items-center justify-center">
                  <Package className="h-6 w-6 text-violet-500" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={40} className="h-1.5 bg-violet-200 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Breakdown & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Order Status Breakdown
              </CardTitle>
              <CardDescription>
                Distribution of orders by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.statusCounts).map(([status, count]) => {
                  const config = statusConfig[status as keyof typeof statusConfig];
                  const percentage = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg ${config.iconBg} border ${config.borderColor} flex items-center justify-center`}>
                            <config.icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <span className="font-medium">{config.label}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{count}</span>
                          <span className="text-muted-foreground ml-1">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 rounded-full bg-gradient-to-r ${config.gradient}`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Performance
            </CardTitle>
            <CardDescription>
              Key metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { 
                label: "7-Day Revenue", 
                value: format_currency(stats.last7DaysRevenue), 
                percentage: 70,
                color: "bg-gradient-to-r from-emerald-400 to-green-300"
              },
              { 
                label: "30-Day Revenue", 
                value: format_currency(stats.last30DaysRevenue), 
                percentage: 85,
                color: "bg-gradient-to-r from-blue-400 to-cyan-300"
              },
              { 
                label: "Order Completion", 
                value: `${stats.completionRate.toFixed(1)}%`, 
                percentage: stats.completionRate,
                color: "bg-gradient-to-r from-violet-400 to-purple-300"
              },
              { 
                label: "Cancellation Rate", 
                value: `${stats.totalOrders > 0 ? ((stats.statusCounts.cancelled / stats.totalOrders) * 100).toFixed(1) : 0}%`, 
                percentage: stats.totalOrders > 0 ? (stats.statusCounts.cancelled / stats.totalOrders) * 100 : 0,
                color: "bg-gradient-to-r from-rose-400 to-pink-300"
              }
            ].map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="font-medium">{metric.value}</span>
                </div>
                <Progress 
                  value={metric.percentage} 
                  className="h-1.5 bg-white/30 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl">
        <div className="p-5 border-b border-white/30">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <h2 className="font-display text-xl mb-1">Recent Orders</h2>
              <p className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl bg-white/40 backdrop-blur-sm border-white/40"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-white/40 bg-white/40 backdrop-blur-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/40 bg-white/50 backdrop-blur-xl">
                  <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                  <SelectItem value="pending" className="rounded-lg">Pending</SelectItem>
                  <SelectItem value="processing" className="rounded-lg">Processing</SelectItem>
                  <SelectItem value="shipped" className="rounded-lg">Shipped</SelectItem>
                  <SelectItem value="delivered" className="rounded-lg">Delivered</SelectItem>
                  <SelectItem value="cancelled" className="rounded-lg">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/30">
                <TableHead className="font-medium">Order ID</TableHead>
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Items</TableHead>
                <TableHead className="font-medium">Total</TableHead>
                <TableHead className="font-medium">Source</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, i) => {
                const status = statusConfig[order.status];
                console.log(order.status)
                const StatusIcon = status.icon;

                return (
                  <TableRow key={order.id} className="border-white/30 hover:bg-white/20 transition-colors">
                    <TableCell className="font-medium">{i+1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span>{order.customer || "Guest Customer"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {order.items?.length || 0} item(s)
                        {order.items?.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-white/50">
                            <Package className="h-2.5 w-2.5 mr-1" />
                            {order.items.length}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {format_currency(order.total)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {order.order_source}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1.5 px-3 py-1.5 rounded-full border ${status.borderColor} ${status.iconBg} backdrop-blur-sm`}>
                        <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                        <span className={status.lightColor}>{status.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 rounded-lg hover:bg-primary/10"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary/30" />
            </div>
            <p className="text-muted-foreground">No orders found</p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            )}
          </div>
        )}
      </Card>

      {/* Monthly Revenue Chart */}
      <Card className="overflow-hidden border-white/40 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Revenue Trend
          </CardTitle>
          <CardDescription>
            Revenue performance over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyRevenue.map((month, index) => {
              const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
              const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="text-sm">
                      <span className="font-medium">{format_currency(month.revenue)}</span>
                      <span className="text-muted-foreground ml-2">({month.orders} orders)</span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-primary/20 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;