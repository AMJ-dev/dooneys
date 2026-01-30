import { useState, useEffect, startTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
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
  ExternalLink,
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
  Edit,
  MoreVertical,
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
  ShoppingCart,
  Store as StoreIcon,
  Smartphone,
  Laptop,
  Scissors,
  Hash,
  Ruler,
  Scale,
  BookOpen,
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
import { format_currency, resolveSrc } from "@/lib/functions";
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
import usePermissions from "@/hooks/usePermissions";

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
}

interface PaymentStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<any>;
  glow: string;
}

const STATUS_ORDER = ['pending', 'processing', 'packaging', 'shipped', 'ready_for_pickup', 'delivered'];

const orderStatusConfig: Record<string, StatusConfig> = {
  pending: { 
    label: "Order Placed", 
    icon: Sparkle, 
    color: "text-amber-300",
    bgColor: "bg-gradient-to-br from-amber-500/15 via-amber-400/10 to-amber-500/15",
    borderColor: "border-amber-400/40",
    gradient: "from-amber-500 via-amber-400 to-amber-300",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-amber-400/15",
    timelineColor: "from-amber-500/60 to-amber-400/40",
    lightColor: "text-amber-300",
    ringColor: "ring-amber-500/30",
    bgLight: "bg-amber-500/10",
    pulse: "shadow-[0_0_20px_rgba(245,158,11,0.15)]"
  },
  processing: { 
    label: "Processing", 
    icon: Zap, 
    color: "text-orange-300",
    bgColor: "bg-gradient-to-br from-orange-500/15 via-orange-400/10 to-orange-500/15",
    borderColor: "border-orange-400/40",
    gradient: "from-orange-500 via-orange-400 to-orange-300",
    iconBg: "bg-gradient-to-br from-orange-500/20 to-orange-400/15",
    timelineColor: "from-orange-500/60 to-orange-400/40",
    lightColor: "text-orange-300",
    ringColor: "ring-orange-500/30",
    bgLight: "bg-orange-500/10",
    pulse: "shadow-[0_0_20px_rgba(249,115,22,0.15)]"
  },
  packaging: { 
    label: "Packaging", 
    icon: Package, 
    color: "text-blue-300",
    bgColor: "bg-gradient-to-br from-blue-500/15 via-blue-400/10 to-blue-500/15",
    borderColor: "border-blue-400/40",
    gradient: "from-blue-500 via-blue-400 to-blue-300",
    iconBg: "bg-gradient-to-br from-blue-500/20 to-blue-400/15",
    timelineColor: "from-blue-500/60 to-blue-400/40",
    lightColor: "text-blue-300",
    ringColor: "ring-blue-500/30",
    bgLight: "bg-blue-500/10",
    pulse: "shadow-[0_0_20px_rgba(59,130,246,0.15)]"
  },
  shipped: { 
    label: "Shipped", 
    icon: Truck, 
    color: "text-violet-300",
    bgColor: "bg-gradient-to-br from-violet-500/15 via-purple-400/10 to-violet-500/15",
    borderColor: "border-violet-400/40",
    gradient: "from-violet-500 via-purple-400 to-violet-300",
    iconBg: "bg-gradient-to-br from-violet-500/20 to-violet-400/15",
    timelineColor: "from-violet-500/60 to-purple-400/40",
    lightColor: "text-violet-300",
    ringColor: "ring-violet-500/30",
    bgLight: "bg-violet-500/10",
    pulse: "shadow-[0_0_20px_rgba(139,92,246,0.15)]"
  },
  ready_for_pickup: { 
    label: "Ready for Pickup", 
    icon: ShoppingBag, 
    color: "text-indigo-300",
    bgColor: "bg-gradient-to-br from-indigo-500/15 via-indigo-400/10 to-indigo-500/15",
    borderColor: "border-indigo-400/40",
    gradient: "from-indigo-500 via-indigo-400 to-indigo-300",
    iconBg: "bg-gradient-to-br from-indigo-500/20 to-indigo-400/15",
    timelineColor: "from-indigo-500/60 to-indigo-400/40",
    lightColor: "text-indigo-300",
    ringColor: "ring-indigo-500/30",
    bgLight: "bg-indigo-500/10",
    pulse: "shadow-[0_0_20px_rgba(99,102,241,0.15)]"
  },
  delivered: { 
    label: "Delivered", 
    icon: CheckCircle, 
    color: "text-emerald-300",
    bgColor: "bg-gradient-to-br from-emerald-500/15 via-green-400/10 to-emerald-500/15",
    borderColor: "border-emerald-400/40",
    gradient: "from-emerald-500 via-green-400 to-emerald-300",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-emerald-400/15",
    timelineColor: "from-emerald-500/60 to-green-400/40",
    lightColor: "text-emerald-300",
    ringColor: "ring-emerald-500/30",
    bgLight: "bg-emerald-500/10",
    pulse: "shadow-[0_0_20px_rgba(16,185,129,0.15)]"
  },
  cancelled: { 
    label: "Cancelled", 
    icon: XCircle, 
    color: "text-rose-300",
    bgColor: "bg-gradient-to-br from-rose-500/15 via-pink-400/10 to-rose-500/15",
    borderColor: "border-rose-400/40",
    gradient: "from-rose-500 via-pink-400 to-rose-300",
    iconBg: "bg-gradient-to-br from-rose-500/20 to-rose-400/15",
    timelineColor: "from-rose-500/60 to-pink-400/40",
    lightColor: "text-rose-300",
    ringColor: "ring-rose-500/30",
    bgLight: "bg-rose-500/10",
    pulse: "shadow-[0_0_20px_rgba(244,63,94,0.15)]"
  },
  paid: { 
    label: "Payment Confirmed", 
    icon: Diamond, 
    color: "text-green-300",
    bgColor: "bg-gradient-to-br from-green-500/15 via-green-400/10 to-green-500/15",
    borderColor: "border-green-400/40",
    gradient: "from-green-500 via-green-400 to-green-300",
    iconBg: "bg-gradient-to-br from-green-500/20 to-green-400/15",
    timelineColor: "from-green-500/60 to-green-400/40",
    lightColor: "text-green-300",
    ringColor: "ring-green-500/30",
    bgLight: "bg-green-500/10",
    pulse: "shadow-[0_0_20px_rgba(34,197,94,0.15)]"
  },
};

const paymentStatusConfig: Record<string, PaymentStatusConfig> = {
  pending: {
    label: "Pending",
    color: "text-amber-300",
    bgColor: "bg-gradient-to-br from-amber-500/20 to-amber-400/15",
    borderColor: "border-amber-400/40",
    icon: Clock,
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]"
  },
  paid: {
    label: "Paid",
    color: "text-emerald-300",
    bgColor: "bg-gradient-to-br from-emerald-500/20 to-emerald-400/15",
    borderColor: "border-emerald-400/40",
    icon: CheckCircle,
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
  },
  failed: {
    label: "Failed",
    color: "text-rose-300",
    bgColor: "bg-gradient-to-br from-rose-500/20 to-rose-400/15",
    borderColor: "border-rose-400/40",
    icon: XCircle,
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]"
  },
  refunded: {
    label: "Refunded",
    color: "text-blue-300",
    bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-400/15",
    borderColor: "border-blue-400/40",
    icon: RefreshCw,
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]"
  }
};

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    sku?: string;
    weight?: string;
    dimensions?: {
      height?: string;
      width?: string;
      depth?: string;
    };
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
  order_source?: "pos" | "web";
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

const AdminOrderDetails = () => {
  const {
    process_orders: can_process_orders,
    view_orders: can_view_orders
  }= usePermissions([
    "view_orders",
    "process_orders",
  ])
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [newTrackingNumber, setNewTrackingNumber] = useState("");
  const [newCarrier, setNewCarrier] = useState("");
  const [statusUpdateNote, setStatusUpdateNote] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const printReceiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      if(!can_view_orders){
        startTransition(()=>navigate("/unauthorized"))
        return;
      }
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const res = await http.get(`/admin-order/${id}/`);
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

  const getAvailableNextStatuses = (currentStatus: string) => {
    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
      return [];
    }
    
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex === -1) return [];
    
    return STATUS_ORDER.slice(currentIndex + 1);
  };

  const canUpdateOrder = () => {
    if (!order?.order) return false;
    
    const currentOrderStatus = order.order.status.order;
    const currentPaymentStatus = order.payment?.status;
    
    if (currentOrderStatus === 'cancelled' || currentOrderStatus === 'delivered') {
      return false;
    }
    
    if (currentPaymentStatus !== 'paid') {
      return false;
    }
    
    return true;
  };

  const handleStatusUpdate = async () => {
    if (!order || !order.order || !id || !selectedOrderStatus) return;
    
    if (!canUpdateOrder()) {
      toast.error("Order cannot be updated at this time");
      return;
    }
    
    const currentStatus = order.order.status.order;
    const availableStatuses = getAvailableNextStatuses(currentStatus);
    
    if (!availableStatuses.includes(selectedOrderStatus)) {
      toast.error("Cannot update to this status");
      return;
    }
    
    try {
      setIsUpdatingStatus(true);
      const validStatus = selectedOrderStatus as keyof typeof orderStatusConfig;
      
      const res = await http.post(`/update-order-status/`, { 
        status: validStatus,
        note: statusUpdateNote || undefined,
        id
      });
      
      const resp = res.data;
      
      if (!resp.error) {
        await fetchOrderDetails();
        
        toast.success(`Order status updated to ${orderStatusConfig[validStatus].label}`);
        setSelectedOrderStatus("");
        setStatusUpdateNote("");
        setIsStatusDialogOpen(false);
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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

  const handlePrintReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && printReceiptRef.current) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - Order #${order?.order?.orderNumber}</title>
            <style>
              @media print {
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 11px !important;
                  width: 57mm !important;
                  max-width: 57mm !important;
                  margin: 0 !important;
                  padding: 2mm !important;
                  line-height: 1.1;
                  -webkit-print-color-adjust: exact;
                }
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                .receipt-container {
                  width: 100% !important;
                  max-width: 53mm !important;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  word-break: break-word;
                }
                .header {
                  text-align: center;
                  margin-bottom: 2mm;
                }
                .logo-main {
                  font-size: 12px;
                  font-weight: bold;
                  margin-bottom: 1mm;
                }
                .logo-sub {
                  font-size: 9px;
                  margin-bottom: 1mm;
                  color: #666;
                }
                .order-type {
                  font-size: 10px;
                  font-weight: bold;
                  text-transform: uppercase;
                  margin: 1mm 0;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 2mm 0;
                }
                .divider-thick {
                  border-top: 2px solid #000;
                  margin: 3mm 0;
                }
                .divider-total {
                  border-top: 1px solid #333;
                  margin: 1mm 0;
                }
                .section-title {
                  font-weight: bold;
                  font-size: 10px;
                  text-transform: uppercase;
                  margin-bottom: 1mm;
                  text-align: center;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 1mm 0;
                  font-size: 10px;
                }
                .info-row div:first-child {
                  font-weight: bold;
                  min-width: 40%;
                }
                .info-row div:last-child {
                  text-align: right;
                  min-width: 60%;
                }
                .truncate-text {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                .items-section {
                  margin: 2mm 0;
                }
                .item {
                  margin: 2mm 0;
                  padding-bottom: 1mm;
                  border-bottom: 1px dotted #ccc;
                  page-break-inside: avoid;
                }
                .item-main {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 0.5mm;
                }
                .item-name {
                  font-size: 10px;
                  font-weight: bold;
                  flex: 1;
                  line-height: 1.2;
                  word-break: break-word;
                  white-space: normal;
                  max-width: 70%;
                }
                .item-quantity {
                  font-size: 10px;
                  font-weight: bold;
                  margin-left: 1mm;
                  white-space: nowrap;
                }
                .item-price-row {
                  display: flex;
                  justify-content: space-between;
                  font-size: 9px;
                  color: #666;
                }
                .item-unit {
                  flex: 1;
                }
                .item-total {
                  font-weight: bold;
                  text-align: right;
                  min-width: 30%;
                }
                .payment-info {
                  margin: 2mm 0;
                }
                .totals {
                  margin: 2mm 0;
                }
                .total-item {
                  display: flex;
                  justify-content: space-between;
                  margin: 1mm 0;
                  font-size: 10px;
                }
                .total-amount {
                  font-weight: bold;
                  min-width: 35%;
                  text-align: right;
                }
                .total-item.discount {
                  color: #dc3545;
                }
                .total-item.paid {
                  color: #28a745;
                }
                .grand-total {
                  font-size: 11px;
                  margin-top: 1mm;
                  padding-top: 1mm;
                  border-top: 1px solid #000;
                }
                .footer {
                  text-align: center;
                  margin-top: 3mm;
                  font-size: 9px;
                  line-height: 1.2;
                }
                .thank-you {
                  font-weight: bold;
                  font-size: 10px;
                  margin-bottom: 1mm;
                }
                .store-info {
                  margin-bottom: 1mm;
                  color: #666;
                }
                .store-info div:first-child {
                  font-weight: bold;
                  font-size: 10px;
                }
                .receipt-number {
                  font-size: 8px;
                  color: #888;
                  margin-top: 1mm;
                }
                .print-date {
                  font-size: 8px;
                  color: #888;
                  margin-top: 0.5mm;
                }
                
                @page {
                  margin: 0;
                  size: 57mm auto;
                }
                body, html {
                  width: 57mm !important;
                  min-width: 57mm !important;
                  max-width: 57mm !important;
                }
                * {
                  max-width: 53mm !important;
                }
                
                .no-break {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              }
              
              @media screen {
                body {
                  background: white;
                  padding: 10px;
                }
                .receipt-container {
                  max-width: 57mm;
                  margin: 0 auto;
                  border: 1px solid #ccc;
                  padding: 5px;
                  box-shadow: 0 0 5px rgba(0,0,0,0.1);
                }
              }
            </style>
          </head>
          <body>
            ${printReceiptRef.current.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 250);
              };
              
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const isPOSOrder = order?.order_source === 'pos';
  const isWebOrder = order?.order_source === 'web';
  const customerName = order?.customer?.name || "Guest Customer";
  const recipientName = order?.recipient?.name;
  const isGiftOrder = !!recipientName;
  const orderStatus = order?.order ? orderStatusConfig[order.order.status.order] : null;
  const paymentStatus = order?.payment ? paymentStatusConfig[order.payment?.status || "pending"] : null;
  const OrderStatusIcon = orderStatus?.icon;
  const PaymentStatusIcon = paymentStatus?.icon;

  const sortedStatusHistory = order?.order_status_history 
    ? [...order.order_status_history].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : [];

  const isPickupOrder = order?.fulfillment?.method === 'pickup';

  const canUpdate = order?.order ? canUpdateOrder() : false;
  const currentOrderStatus = order?.order?.status.order || '';
  const availableNextStatuses = getAvailableNextStatuses(currentOrderStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background/90 via-muted/20 to-background/90 p-3 sm:p-4 md:p-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background/90 via-muted/20 to-background/90">
        <Card className="max-w-md w-full border-0 bg-gradient-to-br from-white/20 via-white/10 to-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-400/10 flex items-center justify-center mx-auto mb-6 ring-2 ring-white/20">
              <AlertCircle className="h-10 w-10 text-rose-400" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or failed to load.
            </p>
            <Button
              onClick={() => navigate("/admin/orders")}
              className="rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/90 via-muted/20 to-background/90 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 group"
                onClick={() => navigate("/admin/orders")}
              >
                <ArrowLeft className="h-5 sm:h-6 w-5 sm:w-6 transition-transform group-hover:-translate-x-0.5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/90 bg-clip-text text-transparent">
                      Order #{order.order.orderNumber}
                    </h1>
                    <div className="absolute -bottom-1 left-0 w-24 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      className={cn(
                        "px-4 py-2 rounded-full border backdrop-blur-xl transition-all duration-300 hover:scale-105",
                        orderStatus?.borderColor,
                        orderStatus?.bgColor,
                        orderStatus?.pulse
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {OrderStatusIcon && <OrderStatusIcon className={`h-4 w-4 ${orderStatus.color}`} />}
                        <span className={`font-medium ${orderStatus?.lightColor}`}>{orderStatus?.label}</span>
                      </div>
                    </Badge>
                    <Badge 
                      className={cn(
                        "px-4 py-2 rounded-full border backdrop-blur-xl transition-all duration-300 hover:scale-105",
                        paymentStatus?.borderColor,
                        paymentStatus?.bgColor,
                        paymentStatus?.glow
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {PaymentStatusIcon && <PaymentStatusIcon className={`h-4 w-4 ${paymentStatus.color}`} />}
                        <span className={`font-medium ${paymentStatus?.color}`}>{paymentStatus?.label}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {isPOSOrder && (
                    <Badge className="bg-gradient-to-r from-orange-500/20 to-amber-400/10 text-orange-400 border-orange-400/30 flex items-center gap-2">
                      <StoreIcon className="h-3.5 w-3.5" />
                      <span>POS Order</span>
                    </Badge>
                  )}
                  {isWebOrder && (
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-400/10 text-blue-400 border-blue-400/30 flex items-center gap-2">
                      <Laptop className="h-3.5 w-3.5" />
                      <span>Web Order</span>
                    </Badge>
                  )}

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/15">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{formatDate(order.order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-xl border border-primary/20">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{format_currency(order.totals?.grandTotal || 0)}</span>
                  </div>
                  {!canUpdate && currentOrderStatus !== 'cancelled' && currentOrderStatus !== 'delivered' && (
                    <Badge className="bg-gradient-to-r from-muted/20 to-muted/10 text-muted-foreground border-white/20">
                      Awaiting Payment
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
                      onClick={fetchOrderDetails}
                      disabled={isLoading}
                    >
                      <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="backdrop-blur-xl bg-white/30 border-white/20">
                    Refresh
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 sm:h-12 px-4 rounded-2xl border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 group"
                      onClick={handlePrintReceipt}
                    >
                      <Printer className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                      <span>Print Receipt</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="backdrop-blur-xl bg-white/30 border-white/20">
                    Print receipt for thermal printer
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-2xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <CardHeader className="pb-4 border-b border-white/20 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${orderStatus?.bgColor} ${orderStatus?.borderColor} border ${orderStatus?.pulse}`}>
                          {OrderStatusIcon && <OrderStatusIcon className={`h-6 w-6 ${orderStatus?.color}`} />}
                        </div>
                        <div>
                          <span className="text-xl font-display font-bold">Order Journey</span>
                          <CardDescription className="text-sm">
                            {sortedStatusHistory.length} updates • Last updated {sortedStatusHistory[0] ? formatTimeAgo(sortedStatusHistory[0].created_at) : 'Never'}
                          </CardDescription>
                        </div>
                      </CardTitle>
                      {canUpdate && can_process_orders &&(
                        <Button
                          onClick={() => setIsStatusDialogOpen(true)}
                          className="rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group"
                          disabled={!canUpdate}
                        >
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span>Update Status</span>
                          </div>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-accent/40 to-transparent" />
                        
                        <AnimatePresence>
                          {sortedStatusHistory.map((historyItem, index) => {
                            const statusConfig = orderStatusConfig[historyItem.status as keyof typeof orderStatusConfig] || {
                              label: historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1),
                              color: "text-muted-foreground",
                              icon: Info,
                              bgColor: "bg-gradient-to-br from-muted/10 via-muted/5 to-muted/10",
                              borderColor: "border-white/20",
                              gradient: "from-muted to-muted/80",
                              iconBg: "bg-gradient-to-br from-muted/15 to-muted/10",
                              timelineColor: "from-muted/60 to-muted/40",
                              lightColor: "text-muted-foreground",
                              ringColor: "ring-muted/30",
                              bgLight: "bg-muted/10",
                              pulse: ""
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
                                    <div className={`absolute inset-0 ${statusConfig.bgLight} rounded-full ${isCurrent ? 'animate-ping' : ''}`} />
                                    <div className={`relative h-10 w-10 rounded-xl border-2 flex items-center justify-center z-10 transition-all duration-300 ${statusConfig.bgColor} ${statusConfig.borderColor} ${isCurrent ? statusConfig.pulse : ''} group-hover/timeline:scale-110`}>
                                      <Icon className={`h-5 w-5 transition-all ${statusConfig.color}`} />
                                    </div>
                                    {index < sortedStatusHistory.length - 1 && (
                                      <div className="absolute top-10 left-1/2 -translate-x-1/2 h-8 w-0.5 bg-gradient-to-b from-white/20 to-transparent" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-3">
                                        <span className={`font-semibold text-lg transition-all ${isCurrent ? 'text-foreground' : 'text-muted-foreground group-hover/timeline:text-foreground'}`}>
                                          {statusConfig.label}
                                        </span>
                                        {isCurrent && (
                                          <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-white border-white/20">
                                            Current
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          {formatTimeAgo(historyItem.created_at)}
                                        </span>
                                        <span className="text-xs text-muted-foreground/60 hidden sm:inline">
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
                                        <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                                          <div className="flex items-start gap-3">
                                            <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-muted-foreground">{historyItem.note}</p>
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-2xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <CardHeader className="border-b border-white/20 relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <span className="text-xl font-display font-bold">Order Items</span>
                        <CardDescription>
                          {order.items?.length || 0} items • {format_currency(order.totals?.grandTotal || 0)} total
                        </CardDescription>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-4">
                      {order.items?.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group/item p-5 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl border border-white/10 hover:border-primary/30 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
                        >
                          <div className="flex flex-col sm:flex-row gap-5">
                            <div className="relative h-32 sm:h-28 w-full sm:w-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl flex-shrink-0 group-hover/item:scale-105 transition-transform duration-500">
                              <img 
                                src={resolveSrc(item.product.image)} 
                                alt={item.product.name} 
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5">
                                <span className="text-sm font-medium text-white">x{item.quantity}</span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                <span className="text-xs font-medium text-white/90">#{item.product.id}</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-lg truncate mb-1">{item.product.name}</h4>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className="bg-white/5 border-white/20 text-xs">
                                      Beauty Product
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    {format_currency(item.lineTotal)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {format_currency(item.product.price)} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                              
                              {item.variants && item.variants.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                  <p className="text-sm font-medium mb-2">Selected Options</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.variants.map((variant, vIndex) => (
                                      <Badge 
                                        key={vIndex} 
                                        variant="outline"
                                        className="bg-gradient-to-r from-white/10 to-white/5 border-white/20 backdrop-blur-sm"
                                      >
                                        <span className="text-primary/90 font-medium">{variant.variant_type}:</span>
                                        <span className="ml-1">{variant.option_value}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-2xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <CardHeader className="border-b border-white/20 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                          <Receipt className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-display font-bold">Order Summary</span>
                      </CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xl"
                              onClick={handlePrintReceipt}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="backdrop-blur-xl bg-white/30 border-white/20">
                            Print receipt for thermal printer
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">Order Number</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-base bg-gradient-to-r from-primary/20 to-accent/20 px-3 py-2 rounded-xl border border-primary/30">
                              #{order.order.orderNumber}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20"
                              onClick={() => handleCopyToClipboard(order.order.orderNumber)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">Order Date</p>
                          <p className="font-semibold text-sm bg-gradient-to-r from-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                            {formatShortDate(order.order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 h-0.5" />

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium">Customer</p>
                        </div>
                        <div className="space-y-2 pl-6">
                          <p className="font-semibold">{customerName}</p>
                          {order.customer?.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{order.customer.email}</span>
                            </div>
                          )}
                          {order.customer?.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{order.customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 h-0.5" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium">Items ({order.items?.length || 0})</p>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {format_currency(order.totals?.subtotal || 0)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {order.items?.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group/item p-3 rounded-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs h-5 bg-white/5">
                                        SKU: {item.product.sku || "N/A"}
                                      </Badge>
                                      {item.product.weight && (
                                        <Badge variant="outline" className="text-xs h-5 bg-white/5">
                                          <Scale className="h-2.5 w-2.5 mr-1" />
                                          {item.product.weight}kg
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-primary">{format_currency(item.lineTotal)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format_currency(item.product.price)} × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  <div className="space-y-1">
                                    {item.product.dimensions && (
                                      <div className="flex items-center gap-1.5">
                                        <Ruler className="h-3 w-3" />
                                        <span>
                                          {item.product.dimensions.height || "?"}×
                                          {item.product.dimensions.width || "?"}×
                                          {item.product.dimensions.depth || "?"} cm
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                      <Hash className="h-3 w-3" />
                                      <span>ID: {item.product.id}</span>
                                    </div>
                                  </div>
                                  
                                  {item.variants && item.variants.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="font-medium text-primary/80">Variants:</p>
                                      {item.variants.slice(0, 2).map((variant, vIndex) => (
                                        <div key={vIndex} className="flex items-center gap-1">
                                          <Scissors className="h-2.5 w-2.5" />
                                          <span>{variant.variant_type}: {variant.option_value}</span>
                                        </div>
                                      ))}
                                      {item.variants.length > 2 && (
                                        <p className="text-xs">+{item.variants.length - 2} more</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 h-0.5" />

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Payment Method</p>
                            <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-white p-3 flex items-center gap-2">
                              <CreditCard className="h-3.5 w-3.5" />
                              {order.payment?.method || "Card"}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Order Source</p>
                            <Badge className={cn(
                              "flex items-center gap-2 p-3",
                              isPOSOrder 
                                ? "bg-gradient-to-r from-orange-500/10 to-amber-400/10 text-white"
                                : "bg-gradient-to-r from-blue-500/10 to-indigo-400/10 text-white"
                            )}>
                              {isPOSOrder ? <StoreIcon className="h-3.5 w-3.5" /> : <Laptop className="h-3.5 w-3.5" />}
                              {isPOSOrder ? "POS" : "Web"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-muted-foreground">Subtotal</span>
                            <span className="font-medium">{format_currency(order.totals?.subtotal || 0)}</span>
                          </div>
                          
                          {order.totals?.shipping !== undefined && order.totals.shipping > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-muted-foreground">Shipping</span>
                              <span className="font-medium">{format_currency(order.totals.shipping)}</span>
                            </div>
                          )}
                          
                          {order.totals?.tax !== undefined && order.totals.tax > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-muted-foreground">Tax</span>
                              <span className="font-medium">{format_currency(order.totals.tax)}</span>
                            </div>
                          )}
                          
                          {order.totals?.discount !== undefined && order.totals.discount > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-muted-foreground">Discount</span>
                              <span className="font-medium text-emerald-400">-{format_currency(order.totals.discount)}</span>
                            </div>
                          )}
                          
                          <Separator className="bg-white/20" />
                          
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-display text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {format_currency(order.totals?.grandTotal || 0)}
                            </span>
                          </div>
                          
                          {order.payment?.status === 'paid' && order.payment?.paidAmount !== undefined && (
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>Paid Amount</span>
                              <span className="font-medium text-emerald-400">{format_currency(order.payment.paidAmount)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <div className="hidden">
              <div ref={printReceiptRef} className="receipt-container">
                <div className="header">
                  <div className="logo">
                    <div className="logo-main">DOONNEYS BEAUTY</div>
                    <div className="logo-sub">Premium Beauty & Cosmetics</div>
                  </div>
                  <div className="divider"></div>
                  <div className="order-type">{isPOSOrder ? "POS RECEIPT" : "ORDER RECEIPT"}</div>
                </div>
                
                <div className="divider"></div>
                
                <div className="order-info">
                  <div className="info-row">
                    <div><strong>ORDER #:</strong></div>
                    <div>{order.order.orderNumber}</div>
                  </div>
                  <div className="info-row">
                    <div><strong>DATE:</strong></div>
                    <div>{new Date(order.order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                  </div>
                  <div className="info-row">
                    <div><strong>TIME:</strong></div>
                    <div>{new Date(order.order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                
                <div className="divider"></div>
                
                <div className="customer-info">
                  <div className="section-title">CUSTOMER</div>
                  <div className="info-row">
                    <div><strong>NAME:</strong></div>
                    <div className="truncate-text">{customerName}</div>
                  </div>
                </div>
                
                <div className="divider"></div>
                
                <div className="items-section">
                  <div className="section-title">ORDER ITEMS</div>
                  {order.items?.map((item, index) => (
                    <div key={index} className="item">
                      <div className="item-main">
                        <div className="item-name">{item.product.name}</div>
                        <div className="item-quantity">×{item.quantity}</div>
                      </div>
                      <div className="item-price-row">
                        <div className="item-unit">{format_currency(item.product.price)} × {item.quantity}</div>
                        <div className="item-total">{format_currency(item.lineTotal)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="divider-thick"></div>
                
                <div className="payment-info">
                  <div className="section-title">PAYMENT</div>
                  <div className="info-row">
                    <div><strong>METHOD:</strong></div>
                    <div>{order.payment?.method?.toUpperCase() || "CARD"}</div>
                  </div>
                  <div className="info-row">
                    <div><strong>STATUS:</strong></div>
                    <div>{order.payment?.status?.toUpperCase() || "PENDING"}</div>
                  </div>
                  <div className="info-row">
                    <div><strong>SOURCE:</strong></div>
                    <div>{isPOSOrder ? "POS" : "WEB"}</div>
                  </div>
                </div>
                
                <div className="divider"></div>
                
                <div className="totals">
                  <div className="total-item">
                    <div>SUBTOTAL</div>
                    <div className="total-amount">{format_currency(order.totals?.subtotal || 0)}</div>
                  </div>
                  
                  {order.totals?.tax !== undefined && order.totals.tax > 0 && (
                    <div className="total-item">
                      <div>TAX</div>
                      <div className="total-amount">{format_currency(order.totals.tax)}</div>
                    </div>
                  )}
                  
                  {order.totals?.discount !== undefined && order.totals.discount > 0 && (
                    <div className="total-item discount">
                      <div>DISCOUNT</div>
                      <div className="total-amount">-{format_currency(order.totals.discount)}</div>
                    </div>
                  )}
                  
                  <div className="divider-total"></div>
                  
                  <div className="total-item grand-total">
                    <div><strong>TOTAL</strong></div>
                    <div className="total-amount"><strong>{format_currency(order.totals?.grandTotal || 0)}</strong></div>
                  </div>
                  
                  {order.payment?.status === 'paid' && order.payment?.paidAmount !== undefined && (
                    <div className="total-item paid">
                      <div>PAID</div>
                      <div className="total-amount"><strong>{format_currency(order.payment.paidAmount)}</strong></div>
                    </div>
                  )}
                </div>
                
                <div className="divider-thick"></div>
                
                <div className="footer">
                  <div className="thank-you">Thank you for your order!</div>
                  <div className="store-info">
                    <div>DOONNEYS BEAUTY</div>
                    <div>www.doonneys.com</div>
                  </div>
                  <div className="divider"></div>
                  <div className="receipt-number">RCPT: {order.order.orderNumber}</div>
                  <div className="print-date">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>

            {!isPOSOrder && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-2xl rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    <Tabs defaultValue="customer" className="w-full relative z-10">
                      <TabsList className="grid w-full grid-cols-2 rounded-xl bg-white/10 backdrop-blur-xl p-1 m-4 mb-0 border border-white/20">
                        <TabsTrigger 
                          value="customer" 
                          className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border data-[state=active]:border-primary/30"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Customer
                        </TabsTrigger>
                        {recipientName && (
                          <TabsTrigger 
                            value="recipient" 
                            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/20 data-[state=active]:to-rose-400/20 data-[state=active]:border data-[state=active]:border-pink-500/30"
                          >
                            <GiftIcon className="h-4 w-4 mr-2" />
                            Recipient
                          </TabsTrigger>
                        )}
                      </TabsList>
                      
                      <TabsContent value="customer" className="mt-0">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16 ring-2 ring-white/20">
                                <AvatarImage src={resolveSrc(order.customer?.pics)} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg">
                                  {getInitials(customerName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-lg">{customerName}</p>
                                <p className="text-sm text-muted-foreground">Primary Customer</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {order.customer?.email && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                                  <Mail className="h-5 w-5 text-primary" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium truncate">{order.customer.email}</p>
                                  </div>
                                </div>
                              )}
                              {order.customer?.phone && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                                  <Phone className="h-5 w-5 text-primary" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{order.customer.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </TabsContent>
                      
                      {recipientName && (
                        <TabsContent value="recipient" className="mt-0">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-400/20 flex items-center justify-center ring-2 ring-white/20">
                                  <GiftIcon className="h-7 w-7 text-pink-400" />
                                </div>
                                <div>
                                  <p className="font-bold text-lg">{recipientName}</p>
                                  <p className="text-sm text-muted-foreground">Gift Recipient</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {order.recipient?.email && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-400/5 backdrop-blur-sm border border-pink-500/20">
                                    <Mail className="h-5 w-5 text-pink-400" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-muted-foreground">Email</p>
                                      <p className="font-medium truncate">{order.recipient.email}</p>
                                    </div>
                                </div>
                                )}
                                {order.recipient?.phone && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-400/5 backdrop-blur-sm border border-pink-500/20">
                                    <Phone className="h-5 w-5 text-pink-400" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-muted-foreground">Phone</p>
                                      <p className="font-medium">{order.recipient.phone}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </TabsContent>
                      )}
                    </Tabs>
                  </Card>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-2xl rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <CardHeader className="border-b border-white/20 relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                        <CreditCardIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xl font-display font-bold">Payment & Shipping</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {PaymentStatusIcon && (
                              <PaymentStatusIcon className={`h-6 w-6 ${paymentStatus?.color}`} />
                            )}
                            <div>
                              <p className="font-medium">Payment</p>
                              <p className="text-sm text-muted-foreground">{order.payment?.method || "Card"}</p>
                            </div>
                          </div>
                          <Badge className={`${paymentStatus?.bgColor} ${paymentStatus?.borderColor} border ${paymentStatus?.glow}`}>
                            {paymentStatus?.label}
                          </Badge>
                        </div>
                        
                        {order.payment?.last4 && order.payment.card_brand && (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CreditCardIcon className="h-6 w-6 text-primary" />
                                <div>
                                  <p className="font-medium">{order.payment.card_brand}</p>
                                  <p className="text-sm text-muted-foreground">•••• {order.payment.last4}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white/10 border-white/20">
                                Verified
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-white/20" />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isPickupOrder ? (
                              <Store className="h-6 w-6 text-indigo-400" />
                            ) : (
                              <Truck className="h-6 w-6 text-violet-400" />
                            )}
                            <div>
                              <p className="font-medium">{isPickupOrder ? 'Store Pickup' : 'Shipping'}</p>
                              <p className="text-sm text-muted-foreground">
                                {isPickupOrder ? 'Customer will collect' : 'To be delivered'}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-indigo-500/20 to-violet-400/20 text-indigo-400 border-indigo-400/30">
                            {isPickupOrder ? 'Ready' : 'Processing'}
                          </Badge>
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

      {can_process_orders && (
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="max-w-md p-0 rounded-3xl border-0 overflow-hidden bg-gradient-to-br from-white/40 via-white/30 to-white/40 backdrop-blur-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent" />
            <DialogHeader className="relative p-6 border-b border-white/30">
              <div className="relative z-10">
                <DialogTitle className="font-display text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
                  Update Order Status
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  {canUpdate 
                    ? "Select the next status for this order"
                    : currentOrderStatus === 'cancelled' || currentOrderStatus === 'delivered'
                      ? "This order cannot be updated further"
                      : "Order can only be updated after payment is confirmed"}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-9 w-9 rounded-xl bg-white/30 hover:bg-white/40 backdrop-blur-xl"
                onClick={() => setIsStatusDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <div className="relative p-6 space-y-6">
              {canUpdate ? (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Next Status</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableNextStatuses.map((status) => {
                        const config = orderStatusConfig[status];
                        const Icon = config.icon;
                        
                        return (
                          <Button
                            key={status}
                            variant={selectedOrderStatus === status ? "default" : "outline"}
                            className={`h-auto py-4 rounded-xl flex flex-col gap-2 items-center justify-center transition-all duration-300 ${
                              selectedOrderStatus === status
                                ? `bg-gradient-to-r from-primary to-accent text-white shadow-2xl shadow-primary/40 ${config.pulse}`
                                : `border-white/30 bg-white/20 hover:bg-white/30 hover:border-white/40`
                            }`}
                            onClick={() => setSelectedOrderStatus(status)}
                          >
                            <Icon className={`h-6 w-6 ${selectedOrderStatus === status ? 'text-white' : config.color}`} />
                            <span className="font-medium">{config.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                    {availableNextStatuses.length === 0 && (
                      <div className="text-center py-6">
                        <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-muted-foreground">Order has reached its final status</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Internal Note (Optional)</label>
                    <Textarea
                      placeholder="Add notes about this status change..."
                      value={statusUpdateNote}
                      onChange={(e) => setStatusUpdateNote(e.target.value)}
                      className="rounded-xl border-white/30 bg-white/20 backdrop-blur-xl min-h-[100px] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-white/10"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  {currentOrderStatus === 'cancelled' || currentOrderStatus === 'delivered' ? (
                    <>
                      <XCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" />
                      <p className="font-medium text-lg mb-2">
                        {currentOrderStatus === 'cancelled' ? 'Order Cancelled' : 'Order Delivered'}
                      </p>
                      <p className="text-muted-foreground">
                        This order has been {currentOrderStatus} and cannot be updated.
                      </p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                      <p className="font-medium text-lg mb-2">Awaiting Payment</p>
                      <p className="text-muted-foreground">
                        Order status can only be updated after payment is confirmed as "Paid".
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-2">
                        Current payment status: <Badge className={`ml-2 ${paymentStatus?.bgColor} ${paymentStatus?.borderColor}`}>
                          {paymentStatus?.label}
                        </Badge>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="relative p-6 border-t border-white/30">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-white/30 bg-white/20 hover:bg-white/30 backdrop-blur-xl"
                  onClick={() => setIsStatusDialogOpen(false)}
                >
                  Cancel
                </Button>
                {canUpdate && availableNextStatuses.length > 0 && (
                  <Button
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/50 transition-all duration-300"
                    onClick={handleStatusUpdate}
                    disabled={!selectedOrderStatus || isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Update Status
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminOrderDetails;