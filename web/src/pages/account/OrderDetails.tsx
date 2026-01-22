import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Printer,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Copy,
  Save,
  X,
  Download,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Receipt,
  Loader2,
  Box,
  ShoppingBag,
  ChevronRight,
  Star,
  Shield,
  Gift,
  Tag,
  Calendar,
  Package2,
  Truck as TruckIcon,
  Eye,
  History,
  FileText,
  TrendingUp,
  Percent,
  DollarSign,
  CreditCard as CreditCardIcon,
  MapPin as MapPinIcon,
  Store,
  MessageCircle,
  Info,
  UserCheck,
  Gift as GiftIcon,
  Zap,
  Diamond,
  Sparkle,
  Heart,
  Share2,
  Gem,
  Crown,
  Sparkles,
  Users,
  Flower2,
  Palette,
  Sparkle as SparkleIcon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Camera,
  Scissors,
  Droplets,
  Leaf,
  Sun,
  Cloud,
  Star as StarIcon,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { http } from "@/lib/httpClient";
import { toast } from "react-toastify";
import { format_currency, resolveSrc, str_to_url } from "@/lib/functions";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiResp } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface OrderStatusHistoryItem {
  status: string;
  note: string | null;
  created_at: string;
}

interface StatusConfig {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  iconBg: string;
  timelineColor: string;
  lightColor: string;
  ringColor: string;
  bgLight: string;
  pulse: string;
  glow: string;
  iconColor: string;
}

interface PaymentStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<any>;
  glow: string;
}

const orderStatusConfig: Record<string, StatusConfig> = {
  pending: { 
    label: "Order Placed", 
    icon: Sparkle, 
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50/90 via-amber-50/80 to-amber-50/90",
    borderColor: "border-amber-200",
    gradient: "from-amber-400 via-amber-300 to-amber-200",
    iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
    timelineColor: "from-amber-400 to-amber-300",
    lightColor: "text-amber-700",
    ringColor: "ring-amber-200",
    bgLight: "bg-amber-50",
    pulse: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.08)]",
    iconColor: "text-amber-500"
  },
  processing: { 
    label: "Processing", 
    icon: Flower2, 
    color: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50/90 via-orange-50/80 to-orange-50/90",
    borderColor: "border-orange-200",
    gradient: "from-orange-400 via-orange-300 to-orange-200",
    iconBg: "bg-gradient-to-br from-orange-100 to-orange-50",
    timelineColor: "from-orange-400 to-orange-300",
    lightColor: "text-orange-700",
    ringColor: "ring-orange-200",
    bgLight: "bg-orange-50",
    pulse: "shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.08)]",
    iconColor: "text-orange-500"
  },
  packaging: { 
    label: "Packaging", 
    icon: Package, 
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50/90 via-blue-50/80 to-blue-50/90",
    borderColor: "border-blue-200",
    gradient: "from-blue-400 via-blue-300 to-blue-200",
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
    timelineColor: "from-blue-400 to-blue-300",
    lightColor: "text-blue-700",
    ringColor: "ring-blue-200",
    bgLight: "bg-blue-50",
    pulse: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.08)]",
    iconColor: "text-blue-500"
  },
  shipped: { 
    label: "Shipped", 
    icon: Truck, 
    color: "text-violet-600",
    bgColor: "bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-violet-50/90",
    borderColor: "border-violet-200",
    gradient: "from-violet-400 via-purple-300 to-violet-200",
    iconBg: "bg-gradient-to-br from-violet-100 to-violet-50",
    timelineColor: "from-violet-400 to-purple-300",
    lightColor: "text-violet-700",
    ringColor: "ring-violet-200",
    bgLight: "bg-violet-50",
    pulse: "shadow-[0_0_15px_rgba(139,92,246,0.1)]",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.08)]",
    iconColor: "text-violet-500"
  },
  ready_for_pickup: { 
    label: "Ready for Pickup", 
    icon: ShoppingBag, 
    color: "text-indigo-600",
    bgColor: "bg-gradient-to-br from-indigo-50/90 via-indigo-50/80 to-indigo-50/90",
    borderColor: "border-indigo-200",
    gradient: "from-indigo-400 via-indigo-300 to-indigo-200",
    iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-50",
    timelineColor: "from-indigo-400 to-indigo-300",
    lightColor: "text-indigo-700",
    ringColor: "ring-indigo-200",
    bgLight: "bg-indigo-50",
    pulse: "shadow-[0_0_15px_rgba(99,102,241,0.1)]",
    glow: "shadow-[0_0_20px_rgba(99,102,241,0.08)]",
    iconColor: "text-indigo-500"
  },
  delivered: { 
    label: "Delivered", 
    icon: CheckCircle, 
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-emerald-50/90",
    borderColor: "border-emerald-200",
    gradient: "from-emerald-400 via-green-300 to-emerald-200",
    iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    timelineColor: "from-emerald-400 to-green-300",
    lightColor: "text-emerald-700",
    ringColor: "ring-emerald-200",
    bgLight: "bg-emerald-50",
    pulse: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
    iconColor: "text-emerald-500"
  },
  cancelled: { 
    label: "Cancelled", 
    icon: XCircle, 
    color: "text-rose-600",
    bgColor: "bg-gradient-to-br from-rose-50/90 via-pink-50/80 to-rose-50/90",
    borderColor: "border-rose-200",
    gradient: "from-rose-400 via-pink-300 to-rose-200",
    iconBg: "bg-gradient-to-br from-rose-100 to-rose-50",
    timelineColor: "from-rose-400 to-pink-300",
    lightColor: "text-rose-700",
    ringColor: "ring-rose-200",
    bgLight: "bg-rose-50",
    pulse: "shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.08)]",
    iconColor: "text-rose-500"
  },
  paid: { 
    label: "Payment Confirmed", 
    icon: Diamond, 
    color: "text-green-600",
    bgColor: "bg-gradient-to-br from-green-50/90 via-green-50/80 to-green-50/90",
    borderColor: "border-green-200",
    gradient: "from-green-400 via-green-300 to-green-200",
    iconBg: "bg-gradient-to-br from-green-100 to-green-50",
    timelineColor: "from-green-400 to-green-300",
    lightColor: "text-green-700",
    ringColor: "ring-green-200",
    bgLight: "bg-green-50",
    pulse: "shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.08)]",
    iconColor: "text-green-500"
  },
};

const paymentStatusConfig: Record<string, PaymentStatusConfig> = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    icon: Clock,
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.08)]"
  },
  paid: {
    label: "Paid",
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
    icon: CheckCircle,
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.08)]"
  },
  failed: {
    label: "Failed",
    color: "text-rose-600",
    bgColor: "bg-gradient-to-br from-rose-50 to-rose-100",
    borderColor: "border-rose-200",
    icon: XCircle,
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.08)]"
  },
  refunded: {
    label: "Refunded",
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    icon: RefreshCw,
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.08)]"
  }
};

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
  quantity: number;
  lineTotal: number;
  variants: any[];
}

interface Payment {
  method: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paidAmount: number;
  currency: string | null;
  paymentIntentId: string | null;
  paidAt: string | null;
  last4?: string;
  card_brand?: string;
}

interface Customer {
  name: string;
  email: string | null;
  phone: string | null;
  pics?: string;
}

interface Recipient {
  name: string;
  email: string | null;
  phone: string | null;
}

interface OrderDetails {
  order?: {
    id: number;
    orderNumber: string;
    createdAt: string;
    status: {
      order: "pending" | "processing" | "packaging" | "shipped" | "ready_for_pickup" | "delivered" | "cancelled";
      payment: "pending" | "paid" | "failed" | "refunded";
    };
  };
  order_status_history: OrderStatusHistoryItem[];
  customer?: Customer;
  recipient?: Recipient;
  fulfillment?: {
    method: string;
    carrier: string | null;
    eta: string | null;
  };
  payment?: Payment;
  totals?: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    discountCode: string | null;
    grandTotal: number;
  };
  shippingAddress: any;
  items?: OrderItem[];
  receipt?: {
    receiptNumber: string;
    issuedAt: string;
    merchant: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
  };
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const res = await http.get(`/get-order-details/${id}/`);
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setOrder(resp.data);
        return;
      } 
      toast.error("Failed to load order details");
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handlePrintInvoice = () => {
    toast.success("✨ Preparing invoice for printing...");
    setTimeout(() => window.print(), 1000);
  };


  const handleShareOrder = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("🎀 Order link copied to clipboard!");
  };

  const handleContactSupport = () => {
    navigate("/contact");
  };

  const handleAddToWishlist = (itemId: string) => {
    toast.success("💝 Added to your wishlist!");
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProductIcon = (category?: string) => {
    switch(category?.toLowerCase()) {
      case 'skincare': return Droplets;
      case 'makeup': return Palette;
      case 'hair': return Scissors;
      case 'fragrance': return Flower2;
      default: return SparkleIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-3 sm:p-4 md:p-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 sm:h-10 w-40 sm:w-56" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl" />
              <Skeleton className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 sm:h-80 rounded-3xl" />
              <Skeleton className="h-96 sm:h-[500px] rounded-3xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 sm:h-56 rounded-3xl" />
              <Skeleton className="h-64 sm:h-72 rounded-3xl" />
              <Skeleton className="h-56 sm:h-64 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order || !order.order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Card className="max-w-md w-full border-2 border-white bg-white/95 shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-6 ring-4 ring-white shadow-lg">
              <AlertCircle className="h-10 w-10 text-rose-500" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3 text-gray-900">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist or failed to load.
            </p>
            <Button
              onClick={() => navigate("/account/orders")}
              className="rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderStatus = orderStatusConfig[order.order.status.order];
  const paymentStatus = paymentStatusConfig[order.payment?.status || "pending"];
  const OrderStatusIcon = orderStatus.icon;
  const PaymentStatusIcon = paymentStatus.icon;

  const sortedStatusHistory = [...(order.order_status_history || [])].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const isPickupOrder = order.fulfillment?.method === 'pickup';
  const customerName = order.customer?.name || "Guest Customer";
  const recipientName = order.recipient?.name;
  const isGiftOrder = !!recipientName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Light Theme Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-gradient-to-r from-primary/5 via-accent/5 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-gradient-to-r from-accent/5 via-primary/5 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl opacity-60" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl opacity-60" />
      </div>

      {/* Light Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -10, 10, -10],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Light & Airy Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <div className="relative overflow-hidden rounded-3xl border-2 border-white bg-white/95 shadow-xl p-6 sm:p-8">
            {/* Header Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl opacity-50" />

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 sm:h-14 w-12 sm:w-14 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 group"
                    onClick={() => navigate("/account/orders")}
                  >
                    <ArrowLeft className="h-5 sm:h-6 w-5 sm:w-6 text-gray-600 transition-transform group-hover:-translate-x-0.5" />
                  </Button>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative">
                        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                          Order #{order.order.orderNumber}
                        </h1>
                        <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          className={cn(
                            "px-4 py-2.5 rounded-full border-2 transition-all duration-300 hover:scale-105 group/status",
                            orderStatus.borderColor,
                            orderStatus.bgColor,
                            orderStatus.pulse
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${orderStatus.iconBg}`}>
                              <OrderStatusIcon className={`h-4 w-4 ${orderStatus.iconColor}`} />
                            </div>
                            <span className={`font-semibold ${orderStatus.color}`}>{orderStatus.label}</span>
                          </div>
                        </Badge>
                        <Badge 
                          className={cn(
                            "px-4 py-2.5 rounded-full border-2 transition-all duration-300 hover:scale-105",
                            paymentStatus.borderColor,
                            paymentStatus.bgColor,
                            paymentStatus.glow
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <PaymentStatusIcon className={`h-4 w-4 ${paymentStatus.color}`} />
                            <span className={`font-semibold ${paymentStatus.color}`}>{paymentStatus.label}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-gray-100 shadow-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm text-gray-600">{formatDate(order.order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 shadow-sm">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">{format_currency(order.totals?.grandTotal || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50"
                          onClick={fetchOrderDetails}
                          disabled={isLoading}
                        >
                          <RefreshCw className={cn("h-5 w-5 text-gray-600", isLoading && "animate-spin")} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white border-2 border-gray-100 shadow-lg">
                        Refresh
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    onClick={handleShareOrder}
                    className="h-12 px-4 rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
                  >
                    <Share2 className="h-4 w-4 mr-2 text-white transition-transform group-hover:rotate-12" />
                    <span className="font-medium text-white">Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Light Order Journey */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-2 border-white bg-white/95 shadow-xl rounded-3xl">
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl opacity-50" />
                  
                  <CardHeader className="pb-4 border-b border-gray-100 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-3.5 rounded-2xl border-2 ${orderStatus.borderColor} ${orderStatus.bgColor} ${orderStatus.pulse}`}>
                          <OrderStatusIcon className={`h-6 w-6 ${orderStatus.iconColor}`} />
                        </div>
                        <div>
                          <span className="text-xl sm:text-2xl font-display font-bold text-gray-900">Order Journey</span>
                          <CardDescription className="text-gray-600 text-sm">
                            {sortedStatusHistory.length} updates • Last updated {sortedStatusHistory[0] ? formatTimeAgo(sortedStatusHistory[0].created_at) : 'Never'}
                          </CardDescription>
                        </div>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-accent/30 to-transparent" />
                      
                      <AnimatePresence>
                        {sortedStatusHistory.map((historyItem, index) => {
                          const statusConfig = orderStatusConfig[historyItem.status as keyof typeof orderStatusConfig] || {
                            label: historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1),
                            color: "text-gray-600",
                            icon: Info,
                            bgColor: "bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50",
                            borderColor: "border-gray-200",
                            gradient: "from-gray-400 to-gray-300",
                            iconBg: "bg-gradient-to-br from-gray-100 to-gray-50",
                            timelineColor: "from-gray-400 to-gray-300",
                            lightColor: "text-gray-700",
                            ringColor: "ring-gray-200",
                            bgLight: "bg-gray-100",
                            pulse: "",
                            glow: "",
                            iconColor: "text-gray-500"
                          };
                          const Icon = statusConfig.icon;
                          const isCurrent = index === 0;
                          
                          return (
                            <motion.div
                              key={`${historyItem.status}-${historyItem.created_at}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative mb-8 last:mb-0 group/timeline"
                            >
                              <div className="flex gap-4">
                                <div className="relative">
                                  <div className={`absolute inset-0 ${statusConfig.bgLight} rounded-full ${isCurrent ? 'animate-ping' : ''} ${statusConfig.glow}`} />
                                  <div className={`relative h-11 w-11 rounded-2xl border-2 flex items-center justify-center z-10 transition-all duration-300 ${statusConfig.bgColor} ${statusConfig.borderColor} ${isCurrent ? statusConfig.pulse : ''} group-hover/timeline:scale-110`}>
                                    <Icon className={`h-5 w-5 transition-all ${statusConfig.iconColor}`} />
                                  </div>
                                  {index < sortedStatusHistory.length - 1 && (
                                    <div className="absolute top-11 left-1/2 -translate-x-1/2 h-8 w-0.5 bg-gradient-to-b from-gray-200 to-transparent" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className={`font-semibold text-lg sm:text-xl transition-all ${isCurrent ? 'text-gray-900' : 'text-gray-700 group-hover/timeline:text-gray-900'}`}>
                                        {statusConfig.label}
                                      </span>
                                      {isCurrent && (
                                        <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-white border-2 border-primary/20">
                                          Current Status
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">
                                        {formatTimeAgo(historyItem.created_at)}
                                      </span>
                                      <span className="text-xs text-gray-500 hidden sm:inline">
                                        {formatShortDate(historyItem.created_at)}
                                      </span>
                                    </div>
                                  </div>

                                  {historyItem.note && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-3 p-4 rounded-2xl bg-white border-2 border-gray-100 shadow-sm">
                                        <div className="flex items-start gap-3">
                                          <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                          <p className="text-sm text-gray-600">{historyItem.note}</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Light Product Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-2 border-white bg-white/95 shadow-xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                  
                  <CardHeader className="border-b border-gray-100 relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <span className="text-xl sm:text-2xl font-display font-bold text-gray-900">Your Beauty Selection</span>
                        <CardDescription className="text-gray-600">
                          {order.items?.length || 0} items • {format_currency(order.totals?.grandTotal || 0)} total
                        </CardDescription>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-4">
                      {order.items?.map((item, index) => {
                        const ProductIcon = getProductIcon(item.product.category);
                        const isExpanded = expandedItems.includes(item.product.id);
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group/item relative overflow-hidden rounded-2xl bg-white border-2 border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                          >
                            {/* Item Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                            
                            <div className="relative p-5">
                              <div className="flex flex-col sm:flex-row gap-5">
                                {/* Light Product Image */}
                                <Link 
                                  to={`/product/${item.product.id}/${str_to_url(item.product.name)}`}
                                  className="relative h-32 sm:h-28 w-full sm:w-28 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0 group-hover/item:scale-105 transition-transform duration-500 block"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                  <img 
                                    src={resolveSrc(item.product.image)} 
                                    alt={item.product.name} 
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
                                    <span className="text-sm font-semibold text-gray-900">x{item.quantity}</span>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/50 to-transparent p-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-700">#{item.product.id}</span>
                                      <div className="p-1 rounded-lg bg-white/80 backdrop-blur-sm">
                                        <ProductIcon className="h-3 w-3 text-primary" />
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <Link
                                            to={`/product/${item.product.id}/${str_to_url(item.product.name)}`}
                                            className="font-bold text-lg sm:text-xl text-gray-900 hover:text-primary transition-colors group-hover/item:underline"
                                          >
                                            {item.product.name}
                                          </Link>
                                          <div className="flex items-center gap-2 mt-1.5 mb-3">
                                            {index === 0 && (
                                              <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-2 border-amber-200 text-xs">
                                                <Star className="h-2.5 w-2.5 mr-1 fill-amber-500" />
                                                Best Seller
                                              </Badge>
                                            )}
                                            {item.product.category && (
                                              <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-2 border-primary/20 text-xs">
                                                {item.product.category}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-display font-bold text-2xl sm:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                            {format_currency(item.lineTotal)}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {format_currency(item.product.price)} × {item.quantity}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {item.variants && item.variants.length > 0 && (
                                        <Accordion type="single" collapsible>
                                          <AccordionItem value="variants" className="border-0">
                                            <AccordionTrigger 
                                              className="py-2 hover:no-underline text-gray-700"
                                              onClick={() => toggleItemExpansion(item.product.id)}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">View Selected Options</span>
                                                {isExpanded ? (
                                                  <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                  <ChevronDown className="h-4 w-4" />
                                                )}
                                              </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                              <div className="mt-2 pt-3 border-t border-gray-100">
                                                <div className="flex flex-wrap gap-2">
                                                  {item.variants.map((variant, vIndex) => (
                                                    <Badge 
                                                      key={vIndex} 
                                                      variant="outline"
                                                      className="bg-white border-2 border-gray-200 text-gray-700"
                                                    >
                                                      <span className="text-primary font-medium">{variant.variant_type}:</span>
                                                      <span className="ml-1">{variant.option_value}</span>
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                      )}

                                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-3">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 rounded-lg hover:bg-primary/10 text-gray-700"
                                            onClick={() => handleAddToWishlist(item.product.id)}
                                          >
                                            <Heart className="h-3.5 w-3.5 mr-2" />
                                            Save for later
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 rounded-lg hover:bg-primary/10 text-gray-700"
                                            asChild
                                          >
                                            <Link to={`/product/${item.product.id}/${str_to_url(item.product.name)}`}>
                                              <Eye className="h-3.5 w-3.5 mr-2" />
                                              View Details
                                            </Link>
                                          </Button>
                                        </div>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 text-gray-600"
                                                onClick={() => handleAddToWishlist(item.product.id)}
                                              >
                                                <Heart className="h-3.5 w-3.5" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white border-2 border-gray-100 shadow-lg">
                                              Add to wishlist
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Light Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-2 border-white bg-white/95 shadow-xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                  
                  <CardHeader className="border-b border-gray-100 relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                        <Gem className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xl font-display font-bold text-gray-900">Order Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Order Number</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-medium text-sm bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-1.5 rounded-xl border-2 border-primary/20">
                              #{order.order.orderNumber}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-100 border-2 border-gray-200"
                              onClick={() => handleCopyToClipboard(order.order.orderNumber)}
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Order Date</p>
                          <p className="font-medium text-sm text-gray-900">{formatShortDate(order.order.createdAt)}</p>
                        </div>
                      </div>

                      <Separator className="my-3 bg-gray-100" />

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Subtotal</span>
                          <span className="font-medium text-gray-900">{format_currency(order.totals?.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Shipping</span>
                          <span className="font-medium text-gray-900">{format_currency(order.totals?.shipping || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tax</span>
                          <span className="font-medium text-gray-900">{format_currency(order.totals?.tax || 0)}</span>
                        </div>
                        {order.totals?.discount && order.totals.discount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-emerald-600">Discount</span>
                            <span className="font-medium text-emerald-600">-{format_currency(order.totals.discount)}</span>
                          </div>
                        )}
                        
                        <Separator className="my-3 bg-gray-100" />
                        
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-bold text-lg text-gray-900">Total</span>
                          <span className="font-display text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {format_currency(order.totals?.grandTotal || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Customer & Recipient Tabs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-2 border-white bg-white/95 shadow-xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  <Tabs defaultValue="customer" className="w-full relative z-10">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-50 p-1 m-4 mb-0 border-2 border-gray-100">
                      <TabsTrigger 
                        value="customer" 
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:border-2 data-[state=active]:border-primary/20 data-[state=active]:text-primary"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Customer
                      </TabsTrigger>
                      <TabsTrigger 
                        value="recipient" 
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-rose-100 data-[state=active]:border-2 data-[state=active]:border-pink-200 data-[state=active]:text-pink-600"
                      >
                        <GiftIcon className="h-4 w-4 mr-2" />
                        Recipient
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="customer" className="mt-0">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 ring-2 ring-white shadow-sm">
                              <AvatarImage src={resolveSrc(order.customer?.pics)} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary text-lg">
                                {getInitials(customerName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-lg text-gray-900">{customerName}</p>
                              <p className="text-sm text-gray-600">Primary Customer</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {order.customer?.email && (
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-100">
                                <Mail className="h-5 w-5 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-600">Email</p>
                                  <p className="font-medium text-gray-900 truncate">{order.customer.email}</p>
                                </div>
                              </div>
                            )}
                            {order.customer?.phone && (
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-100">
                                <Phone className="h-5 w-5 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-600">Phone</p>
                                  <p className="font-medium text-gray-900">{order.customer.phone}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </TabsContent>
                    
                    <TabsContent value="recipient" className="mt-0">
                      <CardContent className="p-6">
                        {recipientName ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center ring-2 ring-white shadow-sm">
                                <GiftIcon className="h-7 w-7 text-pink-500" />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-gray-900">{recipientName}</p>
                                <p className="text-sm text-gray-600">Gift Recipient</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {order.recipient?.email && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border-2 border-pink-100">
                                  <Mail className="h-5 w-5 text-pink-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-900 truncate">{order.recipient.email}</p>
                                  </div>
                                </div>
                              )}
                              {order.recipient?.phone && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border-2 border-pink-100">
                                  <Phone className="h-5 w-5 text-pink-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium text-gray-900">{order.recipient.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 ring-2 ring-white shadow-sm">
                              <UserCheck className="h-8 w-8 text-gray-500" />
                            </div>
                            <p className="font-medium text-gray-700">No recipient specified</p>
                            <p className="text-sm text-gray-600 mt-1">This is a regular order</p>
                          </div>
                        )}
                      </CardContent>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </motion.div>

            {/* Payment & Shipping */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-2 border-white bg-white/95 shadow-xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  <CardHeader className="border-b border-gray-100 relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                        <CreditCardIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xl font-display font-bold text-gray-900">Payment & Shipping</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border-2 ${paymentStatus.borderColor} ${paymentStatus.bgColor}`}>
                              <PaymentStatusIcon className={`h-5 w-5 ${paymentStatus.color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Payment</p>
                              <p className="text-sm text-gray-600">{order.payment?.method || "Card"}</p>
                            </div>
                          </div>
                          <Badge className={`${paymentStatus.bgColor} ${paymentStatus.borderColor} border-2 ${paymentStatus.glow}`}>
                            {paymentStatus.label}
                          </Badge>
                        </div>
                        
                        {order.payment?.last4 && order.payment.card_brand && (
                          <div className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                                  <CreditCardIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{order.payment.card_brand}</p>
                                  <p className="text-sm text-gray-600">•••• {order.payment.last4}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white border-2 border-gray-200 text-gray-700">
                                Verified
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="my-3 bg-gray-100" />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border-2 ${isPickupOrder ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200' : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'}`}>
                              {isPickupOrder ? (
                                <Store className="h-5 w-5 text-indigo-500" />
                              ) : (
                                <Truck className="h-5 w-5 text-violet-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{isPickupOrder ? 'Store Pickup' : 'Shipping'}</p>
                              <p className="text-sm text-gray-600">
                                {isPickupOrder ? 'Ready for pickup' : 'Being prepared for shipment'}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border-2 border-indigo-200">
                            {isPickupOrder ? 'Ready for Pickup' : 'In Transit'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Light Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-2 border-white bg-white/95 shadow-xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                  
                  <CardHeader className="border-b border-gray-100 relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xl font-display font-bold text-gray-900">Order Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full gap-3 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 justify-start py-6 group/action"
                        onClick={handlePrintInvoice}
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                          <Printer className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Print Invoice</p>
                          <p className="text-xs text-gray-600">Professional receipt</p>
                        </div>
                      </Button>
                                            
                      <Separator className="my-3 bg-gray-100" />

                      <Button
                        variant="outline"
                        className="w-full gap-3 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 justify-start py-6 group/action"
                        onClick={handleContactSupport}
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Contact Support</p>
                          <p className="text-xs text-gray-600">24/7 assistance</p>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Light Support Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base text-gray-900 mb-2">Premium Support</h4>
                        <p className="text-xs text-gray-600 mb-4">
                          Our beauty concierge is here to assist you 24/7 with personalized care.
                        </p>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 rounded-lg border-2 border-primary/20 bg-white hover:bg-gray-50 text-xs py-2"
                            onClick={() => navigate("/contact")}
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-primary" />
                            Live Chat Support
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 rounded-lg border-2 border-primary/20 bg-white hover:bg-gray-50 text-xs py-2"
                            onClick={() => window.open(`mailto:support@doonneys.com`)}
                          >
                            <Mail className="h-3.5 w-3.5 text-primary" />
                            Email Support
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 rounded-lg border-2 border-primary/20 bg-white hover:bg-gray-50 text-xs py-2"
                            onClick={() => window.open(`tel:${order.receipt?.merchant.phone}`)}
                          >
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            Call Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;