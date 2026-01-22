import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Calendar,
  DollarSign,
  ShoppingBag,
  Eye,
  Users,
  BarChart3,
  Target,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Filter,
  Award,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { toast } from "react-toastify";
import { format_currency } from "@/lib/functions";
import { Skeleton } from "@/components/ui/skeleton";

type Metric = {
  label: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
};

type RevenueDataPoint = {
  month: string;
  revenue: number;
  orders: number;
};

type CategoryDataPoint = {
  name: string;
  value: number;
  revenue: number;
};

type TrafficDataPoint = {
  day: string;
  visitors: number;
  pageViews: number;
};

type TopProduct = {
  name: string;
  sales: number;
  revenue: number;
};

type ConversionStage = {
  stage: string;
  value: number;
  percentage: number;
};

type AnalyticsData = {
  metrics: Metric[];
  revenueData: RevenueDataPoint[];
  categoryData: CategoryDataPoint[];
  trafficData: TrafficDataPoint[];
  topProducts: TopProduct[];
  conversionFunnel: ConversionStage[];
  overallConversionRate: number;
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#8B5CF6", "#F59E0B", "#10B981"];

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState("year");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await http.post('/get-analysis/', { date_range: dateRange });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setData(resp.data);
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (err) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="w-[160px] h-10" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>

        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl md:text-3xl mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-2xl md:text-3xl mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your store's performance and insights in real-time
            </p>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] bg-gradient-warm">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className={`bg-gradient-to-br ${metric.bgColor} ${metric.borderColor} border overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm border ${metric.borderColor}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-border overflow-hidden">
            <CardHeader className="bg-gradient-warm border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>Monthly revenue and orders trend</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span>Orders</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-xs" 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => format_currency(value).replace(/\.00$/, '')}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "var(--shadow-soft)",
                      }}
                      formatter={(value) => [format_currency(Number(value)), 'Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--secondary))"
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="bg-gradient-warm border-b">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.categoryData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, name]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {data.categoryData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{cat.value}%</span>
                        <span className="text-xs text-muted-foreground ml-2 block">
                          {format_currency(cat.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-border">
            <CardHeader className="bg-gradient-warm border-b">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Weekly Traffic
              </CardTitle>
              <CardDescription>Daily visitors and page views</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.trafficData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="day" 
                      className="text-xs" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-xs" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="visitors" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Visitors"
                    />
                    <Bar 
                      dataKey="pageViews" 
                      fill="hsl(var(--secondary))" 
                      radius={[4, 4, 0, 0]}
                      name="Page Views"
                    />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="bg-gradient-warm border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-primary" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                {data.conversionFunnel.map((step, index) => (
                  <div key={step.stage} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{step.stage}</span>
                      <span className="font-bold">{step.value.toLocaleString()} <span className="text-muted-foreground">({step.percentage}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${step.percentage}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-gradient-warm rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Conversion Rate</span>
                  <Badge className="bg-gradient-primary text-white border-0">{data.overallConversionRate}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-border overflow-hidden">
          <CardHeader className="bg-gradient-warm border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Selling Products
                </CardTitle>
                <CardDescription>Best performers this period</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                View All <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {data.topProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-4 flex items-center justify-between hover:bg-gradient-warm/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="font-bold text-primary">{index + 1}</span>
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1">
                          <Crown className="h-4 w-4 text-yellow-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{product.sales} units sold</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{format_currency(product.revenue)}</p>
                    <p className="text-sm text-muted-foreground">{format_currency(Math.round(product.revenue / product.sales))} avg.</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
