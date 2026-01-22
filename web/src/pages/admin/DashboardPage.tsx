import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Users,
  ChevronRight,
  BarChart3,
  Target,
  Monitor,
  Smartphone,
  User,
} from "lucide-react";
import { format_currency } from "@/lib/functions";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalStaff: number;
  outOfStockItems: number;
  newCustomersThisWeek: number;
};

type RecentOrder = {
  id: string;
  customer: string;
  source_label: string;
  total: number;
  status: string;
  date: string;
  items: number;
};

type RecentLogin = {
  ip_address: string;
  device_type: string;
  browser: string;
  platform: string;
  created_at: string;
};

type PendingTasks = {
  pendingShipments: number;
  lowStockItems: number;
  outOfStockItems: number;
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTasks | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await http.get("/get-admin-dashboard/");
        const resp: ApiResp = res.data;
        if (!resp.error && resp.data) {
          setDashboardStats(resp.data.dashboard_stats);
          setRecentOrders(resp.data.recent_orders || []);
          setRecentLogins(resp.data.recent_logins || []);
          setPendingTasks(resp.data.pending_tasks);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs"><Package className="h-3 w-3 mr-1" /> Shipped</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device === "Mobile") return <Smartphone className="h-4 w-4 text-muted-foreground" />;
    return <Monitor className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardStats
    ? [
        {
          label: "Total Revenue",
          value: `$${dashboardStats.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: "text-green-600",
          bgColor: "bg-gradient-to-br from-green-50 to-green-100/50",
          borderColor: "border-green-200",
          description: "All paid orders this month",
        },
        {
          label: "Total Orders",
          value: dashboardStats.totalOrders.toString(),
          icon: ShoppingBag,
          color: "text-blue-600",
          bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/50",
          borderColor: "border-blue-200",
          description: "Including all statuses",
        },
        {
          label: "Total Customers",
          value: dashboardStats.totalCustomers.toString(),
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-gradient-to-br from-purple-50 to-purple-100/50",
          borderColor: "border-purple-200",
          description: "Registered accounts",
        },
        {
          label: "Total Products",
          value: dashboardStats.totalProducts.toString(),
          icon: Package,
          color: "text-orange-600",
          bgColor: "bg-gradient-to-br from-orange-50 to-orange-100/50",
          borderColor: "border-orange-200",
          description: "Active SKUs in catalog",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`rounded-xl border ${stat.borderColor} p-5 hover:shadow-elevated transition-all duration-300 ${stat.bgColor}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center ${stat.color} border ${stat.borderColor}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-gradient-warm rounded-xl border border-border overflow-hidden"
        >
          <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-background to-background/80">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Recent Orders
              </h2>
              <p className="text-sm text-muted-foreground">Latest customer orders</p>
            </div>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-border/50">
              {recentOrders.slice(0, 10).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-5 flex items-center justify-between hover:bg-background/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      {order.status === "processing" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-background animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.date} • <span className="font-medium text-primary">{order.source_label}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold text-lg">{format_currency(order.total)}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.items} item{order.items > 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-60" />
              <p className="text-muted-foreground">No recent orders found.</p>
            </div>
          )}
        </motion.div>

        <div className="space-y-6">
          {dashboardStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-warm rounded-xl border border-border overflow-hidden"
            >
              <div className="p-5 border-b border-border bg-gradient-to-r from-background to-background/80">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Performance Metrics
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg. Order Value</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {dashboardStats.totalOrders > 0
                        ? format_currency(dashboardStats.totalRevenue / dashboardStats.totalOrders)
                        : "$0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Based on {dashboardStats.totalOrders} order{dashboardStats.totalOrders !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Staff Members</p>
                      <p className="text-xs text-muted-foreground">Active team</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{dashboardStats.totalStaff}</p>
                    <p className="text-xs text-muted-foreground">All roles included</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Customers</p>
                      <p className="text-xs text-muted-foreground">Registered this week</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{dashboardStats.newCustomersThisWeek}</p>
                    <p className="text-xs text-muted-foreground">First-time accounts</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {pendingTasks && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-warm rounded-xl border border-border overflow-hidden"
            >
              <div className="p-5 border-b border-border bg-gradient-to-r from-background to-background/80">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Pending Tasks
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50/50 rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Orders awaiting shipment</p>
                    <p className="text-xs text-muted-foreground">Need to be processed today</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {pendingTasks.pendingShipments}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Low stock items</p>
                    <p className="text-xs text-muted-foreground">Need restocking soon</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {pendingTasks.lowStockItems}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                  <Package className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Out of stock items</p>
                    <p className="text-xs text-muted-foreground">Unavailable for sale</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {pendingTasks.outOfStockItems}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-warm rounded-xl border border-border overflow-hidden"
          >
            <div className="p-5 border-b border-border bg-gradient-to-r from-background to-background/80">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Recent Logins
              </h3>
            </div>
            {recentLogins.length > 0 ? (
              <div className="p-5 space-y-3">
                {recentLogins.slice(0, 4).map((login, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-background/50 rounded-lg hover:bg-background transition-colors"
                  >
                    <div className="mt-0.5 text-muted-foreground">
                      {getDeviceIcon(login.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded inline-block">
                        {login.ip_address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {login.browser} on {login.platform} • {login.device_type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {login.created_at}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Monitor className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <p className="text-sm text-muted-foreground">No recent logins</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;