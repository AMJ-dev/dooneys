import { useState, useEffect, useRef, forwardRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Package, 
  Mail, 
  Phone, 
  ArrowRight, 
  Truck, 
  CreditCard, 
  MapPin, 
  Calendar,
  Download,
  Share2,
  ShoppingBag,
  Star,
  Clock,
  ShieldCheck,
  Gift,
  Sparkles,
  Heart,
  Printer,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Tag,
  Globe,
  Store,
  User,
  X,
  ArrowLeft,
  Home,
  Receipt as ReceiptIcon,
  Building2,
  Clock4,
  Wallet,
  Banknote,
  Smartphone,
  Check,
  AlertCircle
} from "lucide-react";
import { comp_name, comp_phone, comp_email, comp_address } from "@/lib/constants";
import { format_currency, gen_random_string, resolveSrc } from "@/lib/functions";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { toast } from "react-toastify";
import LoadingScreen from "@/components/ui/loading-screen";

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const receiptRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [showReceiptPage, setShowReceiptPage] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: order ? `${comp_name}_Receipt_${order.order.orderNumber}` : "Receipt",
    onBeforeGetContent: () => {
      toast.info("Preparing receipt for print...");
      return Promise.resolve();
    },
    onAfterPrint: () => {
      toast.success("Print completed!");
    },
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await http.get(`/get-order-details/${id}/`);
        const resp: ApiResp = res.data;
        if (!resp.error && resp.data) {
          setOrder(resp.data);
          return;
        }
        setError(resp.error);
        toast.error(resp.error);
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order.orderNumber);
    toast.success("Order number copied!");
  };

  const handleShareOrder = async () => {
    if (!order) return;
    
    const shareData = {
      title: `My ${comp_name} Order`,
      text: `Check out my order #${order.order.orderNumber} at ${comp_name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Order link copied to clipboard!");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Order link copied to clipboard!");
      }
    }
  };

  const handleDownloadReceipt = () => {
    toast.success("Receipt download started!");
  };

  const openReceiptPage = () => {
    setShowReceiptPage(true);
    document.body.style.overflow = 'hidden';
  };

  const closeReceiptPage = () => {
    setShowReceiptPage(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="font-display text-3xl mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "Unable to load order details"}
            </p>
            <Button asChild size="lg">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const orderData = order;
  const displayItems = showAllItems ? orderData.items : orderData.items.slice(0, 3);

  // Enhanced Receipt Component
  const Receipt = forwardRef((props, ref) => (
    <div ref={ref} className="bg-white text-gray-900" style={{ minWidth: '210mm', padding: '20mm' }}>
      <style>
        {`
          @media print {
            body { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
          }
          @page { 
            size: A4;
            margin: 10mm;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
          }
          .receipt-table th {
            text-align: left;
            padding: 10px 8px;
            border-bottom: 2px solid #e5e7eb;
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .receipt-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
          }
          .receipt-table tr:last-child td {
            border-bottom: none;
          }
          .receipt-total-line {
            border-top: 2px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 4px;
          }
        `}
      </style>
      
      {/* Header */}
      <div className="text-center border-b-2 border-gray-200 pb-8 mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
            ✨
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">{comp_name}</h1>
        </div>
        <p className="text-gray-600 text-sm">Premium Beauty & Cosmetics</p>
        <p className="text-gray-500 text-xs mt-2">
          {comp_address || "123 Beauty Ave, Toronto, ON M5V 2A1"}
        </p>
        <p className="text-gray-500 text-xs">{comp_phone}</p>
      </div>

      {/* Receipt Info */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Receipt #</p>
          <p className="text-lg font-bold">{orderData.receipt.receiptNumber}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-3">Order #</p>
          <p className="text-lg font-bold">{orderData.order.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
          <p className="font-medium">
            {new Date(orderData.order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(orderData.order.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Name</p>
            <p className="font-medium">{orderData.customer.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Email</p>
            <p className="font-medium">{orderData.customer.email}</p>
          </div>
          {orderData.customer.phone && (
            <div>
              <p className="text-gray-500 text-xs">Phone</p>
              <p className="font-medium">{orderData.customer.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Items Purchased</h3>
        <table className="receipt-table">
          <thead>
            <tr>
              <th className="w-[45%]">Item</th>
              <th className="w-[15%] text-center">Qty</th>
              <th className="w-[20%] text-right">Price</th>
              <th className="w-[20%] text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <p className="font-medium text-sm">{item.product.name}</p>
                  {item.variants && item.variants.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.variants.map((v, i) => (
                        <span key={i}>
                          {v.variant_type}: {v.option_value}
                          {v.price_modifier && parseFloat(v.price_modifier) !== 0 && (
                            <span className={parseFloat(v.price_modifier) > 0 ? 'text-green-600' : 'text-red-600'}>
                              ({parseFloat(v.price_modifier) > 0 ? '+' : ''}{format_currency(parseFloat(v.price_modifier))})
                            </span>
                          )}
                          {i < item.variants.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{format_currency(item.product.price)}</td>
                <td className="text-right font-medium">{format_currency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t-2 border-gray-200 pt-4 mb-6">
        <div className="space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{format_currency(orderData.totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>{orderData.totals.shipping === 0 ? 'Free' : format_currency(orderData.totals.shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span>{format_currency(orderData.totals.tax)}</span>
          </div>
          {orderData.totals.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount {orderData.totals.discountCode && `(${orderData.totals.discountCode})`}</span>
              <span>-{format_currency(orderData.totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 receipt-total-line">
            <span>TOTAL</span>
            <span className="text-primary">{format_currency(orderData.totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t-2 border-gray-200 pt-6 mt-6">
        <p className="font-medium text-gray-700 mb-2">Thank you for your purchase!</p>
        <p className="text-xs">For questions about your order, contact us at {comp_phone}</p>
        <p className="text-xs mt-4">This is your official receipt. Please keep for your records.</p>
        <p className="text-xs text-gray-400 mt-2">Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  ));

  return (
    <>
      <Layout>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl hidden md:block" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl hidden md:block" />

          <section className="relative py-6 md:py-12">
            <div className="container max-w-6xl">
              {/* Mobile Top Action Bar */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center mb-6 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyOrderNumber}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy #{orderData.order.orderNumber}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openReceiptPage}
                    className="gap-2"
                  >
                    <ReceiptIcon className="h-4 w-4" />
                    Receipt
                  </Button>
                </motion.div>
              )}

              {/* Celebration Banner */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-full backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">Order Confirmed!</span>
                </div>
              </motion.div>

              {/* Main Content */}
              <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                  {/* Success Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-elevated border border-border/50 backdrop-blur-sm"
                  >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="relative"
                      >
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-lg">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 animate-ping opacity-20" />
                          <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-green-600 z-10" />
                        </div>
                      </motion.div>

                      <div className="flex-1 text-center md:text-left">
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="font-display text-2xl md:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent"
                        >
                          Thank You!
                          <span className="block text-lg md:text-xl mt-1">Your Order is Confirmed</span>
                        </motion.h1>
                        
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-muted-foreground mb-6 text-sm md:text-base"
                        >
                          Order #{orderData.order.orderNumber} has been received and is being processed.
                          A detailed confirmation has been sent to {orderData.customer.email}.
                        </motion.p>

                        {!isMobile && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap gap-3"
                          >
                            <Button onClick={openReceiptPage} variant="outline" className="gap-2">
                              <ReceiptIcon className="h-4 w-4" />
                              View Receipt
                            </Button>
                            <Button onClick={handlePrint} variant="outline" className="gap-2">
                              <Printer className="h-4 w-4" />
                              Print
                            </Button>
                            <Button onClick={handleShareOrder} variant="outline" className="gap-2">
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {isMobile && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 pt-6 border-t border-border/50 flex flex-wrap gap-3 justify-center"
                      >
                        <Button onClick={openReceiptPage} variant="outline" size="sm" className="gap-2 flex-1 min-w-[120px]">
                          <ReceiptIcon className="h-4 w-4" />
                          Receipt
                        </Button>
                        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2 flex-1 min-w-[120px]">
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                        <Button asChild className="gap-2 flex-1 min-w-[120px] bg-gradient-to-r from-primary to-accent">
                          <Link to="/shop">
                            <ShoppingBag className="h-4 w-4" />
                            Shop More
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Order Items */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-card to-card/95 rounded-2xl p-4 md:p-6 shadow-card border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        <h2 className="font-display text-lg md:text-xl">Order Items</h2>
                      </div>
                      <Badge variant="outline" className="text-xs md:text-sm">
                        {orderData.items.length} item{orderData.items.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      {displayItems.map((item, index) => (
                        <motion.div
                          key={`${item.product.id}-${gen_random_string()}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-gradient-to-r from-background/50 to-background/30 hover:from-background/70 hover:to-background/50 transition-all duration-300 group"
                        >
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg blur-sm" />
                            <img
                              src={resolveSrc(item.product.image)}
                              alt={item.product.name}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover relative z-10 border border-white/20"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs flex items-center justify-center font-bold shadow-lg">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                              {item.product.name}
                            </h4>
                            {item.variants && item.variants.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.variants.map((variant, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-xs px-2 py-0.5 h-5"
                                  >
                                    {variant.variant_type}: {variant.option_value}
                                    {variant.price_modifier && parseFloat(variant.price_modifier) !== 0 && (
                                      <span className={parseFloat(variant.price_modifier) > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {parseFloat(variant.price_modifier) > 0 ? ' +' : ' '}{format_currency(parseFloat(variant.price_modifier))}
                                      </span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-base md:text-lg">
                              {format_currency(item.lineTotal)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format_currency(item.product.price)} each
                            </p>
                          </div>
                        </motion.div>
                      ))}

                      {orderData.items.length > 3 && (
                        <div className="pt-3 md:pt-4 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="w-full gap-2"
                          >
                            {showAllItems ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Show {orderData.items.length - 3} More Items
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Order Details Toggle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-br from-card to-card/95 rounded-2xl p-4 md:p-6 shadow-card border border-border/50"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-left p-0 hover:bg-transparent"
                      onClick={() => setShowOrderDetails(!showOrderDetails)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-display text-lg">Order Details</span>
                      </div>
                      {showOrderDetails ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>

                    <AnimatePresence>
                      {showOrderDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="grid md:grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-border/50">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-5 w-5 text-primary" />
                                <h3 className="font-medium">Customer Information</h3>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Name</p>
                                  <p className="font-medium">{orderData.customer.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Email</p>
                                  <p className="font-medium">{orderData.customer.email}</p>
                                </div>
                                {orderData.customer.phone && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="font-medium">{orderData.customer.phone}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                {orderData.fulfillment.method === 'shipping' ? (
                                  <Truck className="h-5 w-5 text-primary" />
                                ) : (
                                  <Store className="h-5 w-5 text-primary" />
                                )}
                                <h3 className="font-medium">
                                  {orderData.fulfillment.method === 'shipping' ? 'Shipping' : 'Pickup'} Information
                                </h3>
                              </div>
                              {orderData.fulfillment.method === 'shipping' && orderData.shippingAddress ? (
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Address</p>
                                    <p className="font-medium text-sm">
                                      {orderData.shippingAddress.name}<br />
                                      {orderData.shippingAddress.street}<br />
                                      {orderData.shippingAddress.city}, {orderData.shippingAddress.province}<br />
                                      {orderData.shippingAddress.postal}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="font-medium">{orderData.shippingAddress.phone}</p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-muted-foreground">Ready for in-store pickup</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    We'll contact you to schedule pickup.
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-3 md:col-span-2">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <h3 className="font-medium">Payment Information</h3>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">Method</p>
                                  <Badge className="capitalize mt-1">
                                    {orderData.payment.method}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Status</p>
                                  <Badge className={`
                                    mt-1
                                    ${orderData.payment.status === 'paid' 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                      : orderData.payment.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                                    }
                                  `}>
                                    {orderData.payment.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Currency</p>
                                  <p className="font-medium mt-1">{orderData.payment.currency || 'CAD'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                                  <p className="font-display text-lg font-bold mt-1">
                                    {format_currency(orderData.payment.paidAmount || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 md:space-y-8">
                  {/* Order Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-b from-card to-card/95 rounded-2xl p-4 md:p-6 shadow-card border border-border/50"
                  >
                    <h3 className="font-display text-lg md:text-xl mb-4 md:mb-6 flex items-center gap-2">
                      <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      Order Summary
                    </h3>
                    
                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{format_currency(orderData.totals.subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          Shipping
                        </span>
                        <span className="font-medium">
                          {orderData.totals.shipping === 0 ? 'Free' : format_currency(orderData.totals.shipping)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Tax</span>
                        <span className="font-medium">{format_currency(orderData.totals.tax)}</span>
                      </div>
                      
                      {orderData.totals.discount > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-border/30">
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            Discount {orderData.totals.discountCode && `(${orderData.totals.discountCode})`}
                          </span>
                          <span className="text-green-600 font-medium">-{format_currency(orderData.totals.discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-border/50">
                        <span className="font-display text-base md:text-lg">Total</span>
                        <span className="font-display text-xl md:text-2xl text-primary">
                          {format_currency(orderData.totals.grandTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 md:p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20 mb-4 md:mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Order Status</span>
                        <Badge className={`
                          ${orderData.order.status.order === 'processing' 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : orderData.order.status.order === 'completed'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          }
                        `}>
                          {orderData.order.status.order}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Order placed on {new Date(orderData.order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button onClick={openReceiptPage} className="w-full gap-2">
                        <ReceiptIcon className="h-4 w-4" />
                        View Receipt
                      </Button>
                      <Button onClick={handlePrint} variant="outline" className="w-full gap-2">
                        <Printer className="h-4 w-4" />
                        Print Receipt
                      </Button>
                    </div>
                  </motion.div>

                  {/* Support Card */}
                  <motion.div                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-2xl p-4 md:p-6 border border-blue-200/50"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Need Help?</h3>
                        <p className="text-xs text-muted-foreground">Our team is here for you</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button asChild variant="outline" className="w-full gap-2 justify-start">
                        <a href={`tel:${comp_phone}`}>
                          <Phone className="h-4 w-4" />
                          Call Support
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="w-full gap-2 justify-start">
                        <a href={`mailto:${comp_email || 'support@example.com'}`}>
                          <Mail className="h-4 w-4" />
                          Email Support
                        </a>
                      </Button>
                    </div>
                  </motion.div>

                  {/* Continue Shopping */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 md:p-6 border border-primary/20"
                  >
                    <div className="text-center">
                      <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-3" />
                      <h4 className="font-display text-lg mb-2">Continue Shopping</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Discover more premium beauty products
                      </p>
                      <Button asChild className="w-full gap-2 bg-gradient-to-r from-primary to-accent">
                        <Link to="/shop">
                          <ArrowRight className="h-4 w-4" />
                          Explore Collection
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="mt-8 md:mt-12 text-center"
              >
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                  <h3 className="font-display text-xl md:text-2xl mb-3">Thank You for Choosing {comp_name}</h3>
                  <p className="text-muted-foreground mb-6 text-sm md:text-base max-w-xl mx-auto">
                    We appreciate your business and look forward to serving you again. 
                    Your satisfaction is our priority.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent">
                      <Link to="/account/orders">
                        View All Orders
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="gap-2">
                      <Link to="/">
                        Return Home
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </Layout>

      {/* Full-page Slide-in Receipt - Redesigned */}
      <AnimatePresence>
        {showReceiptPage && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background overflow-hidden"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-card border-b border-border/50 backdrop-blur-sm">
              <div className="container max-w-6xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                  <Button
                    variant="ghost"
                    onClick={closeReceiptPage}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="hidden md:inline">Back to Order</span>
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <ReceiptIcon className="h-4 w-4 text-white" />
                    </div>
                    <h1 className="font-display text-xl md:text-2xl">Receipt</h1>
                    <Badge variant="secondary" className="text-xs md:text-sm hidden sm:inline-block">
                      #{orderData.order.orderNumber}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 md:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrint}
                      className="h-9 w-9"
                      title="Print"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShareOrder}
                      className="h-9 w-9"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeReceiptPage}
                      className="h-9 w-9"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
              <div className="container max-w-4xl mx-auto px-4 md:px-6 py-8">
                {/* Hidden printable receipt */}
                <div className="hidden">
                  <Receipt ref={receiptRef} />
                </div>

                {/* Visible Receipt */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                >
                  {/* Receipt Header - Premium Design */}
                  <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-gray-200 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                          ✨
                        </div>
                        <div>
                          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{comp_name}</h2>
                          <p className="text-gray-600 text-sm">Premium Beauty & Cosmetics</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Receipt #{orderData.receipt.receiptNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(orderData.order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Info Bar */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-6 flex-wrap">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Order #</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{orderData.order.orderNumber}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleCopyOrderNumber}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="hidden md:block w-px h-8 bg-gray-200" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</p>
                        <Badge className={`
                          ${orderData.order.status.order === 'processing' 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : orderData.order.status.order === 'completed'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          }
                        `}>
                          {orderData.order.status.order}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                      <p className="font-display text-2xl font-bold text-primary">
                        {format_currency(orderData.totals.grandTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <h3 className="font-medium text-sm text-gray-700">Customer Information</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Name</p>
                        <p className="font-medium text-gray-900">{orderData.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p className="font-medium text-gray-900 truncate">{orderData.customer.email}</p>
                      </div>
                      {orderData.customer.phone && (
                        <div>
                          <p className="text-gray-500 text-xs">Phone</p>
                          <p className="font-medium text-gray-900">{orderData.customer.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="h-4 w-4 text-gray-400" />
                      <h3 className="font-medium text-sm text-gray-700">Items ({orderData.items.length})</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="text-center py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orderData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="py-3">
                                <div className="flex items-start gap-3">
                                  <img
                                    src={resolveSrc(item.product.image)}
                                    alt={item.product.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                  />
                                  <div>
                                    <p className="font-medium text-sm text-gray-900">{item.product.name}</p>
                                    {item.variants && item.variants.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {item.variants.map((v, i) => (
                                          <span key={i}>
                                            {v.variant_type}: {v.option_value}
                                            {v.price_modifier && parseFloat(v.price_modifier) !== 0 && (
                                              <span className={parseFloat(v.price_modifier) > 0 ? 'text-green-600' : 'text-red-600'}>
                                                ({parseFloat(v.price_modifier) > 0 ? '+' : ''}{format_currency(parseFloat(v.price_modifier))})
                                              </span>
                                            )}
                                            {i < item.variants.length - 1 && ', '}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="text-center py-3">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-medium">
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="text-right py-3 text-sm text-gray-600">{format_currency(item.product.price)}</td>
                              <td className="text-right py-3 font-medium text-gray-900">{format_currency(item.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="max-w-xs ml-auto space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{format_currency(orderData.totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5" />
                          Shipping
                        </span>
                        <span>{orderData.totals.shipping === 0 ? 'Free' : format_currency(orderData.totals.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span>{format_currency(orderData.totals.tax)}</span>
                      </div>
                      {orderData.totals.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            Discount {orderData.totals.discountCode && `(${orderData.totals.discountCode})`}
                          </span>
                          <span>-{format_currency(orderData.totals.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-200">
                        <span className="text-gray-900">TOTAL</span>
                        <span className="text-primary">{format_currency(orderData.totals.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Delivery */}
                  <div className="px-6 py-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <h4 className="font-medium text-sm text-gray-700">Payment</h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Method</span>
                          <span className="font-medium capitalize">{orderData.payment.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <Badge className={`
                            text-xs
                            ${orderData.payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                              : orderData.payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          `}>
                            {orderData.payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {orderData.fulfillment.method === 'shipping' ? (
                          <Truck className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Store className="h-4 w-4 text-gray-400" />
                        )}
                        <h4 className="font-medium text-sm text-gray-700">
                          {orderData.fulfillment.method === 'shipping' ? 'Delivery' : 'Pickup'}
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        {orderData.fulfillment.method === 'shipping' && orderData.shippingAddress ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Address</span>
                              <span className="font-medium text-right">
                                {orderData.shippingAddress.street}<br />
                                {orderData.shippingAddress.city}, {orderData.shippingAddress.province}<br />
                                {orderData.shippingAddress.postal}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">
                            Ready for in-store pickup
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Thank you for your purchase at {comp_name}!</p>
                    <p className="text-xs text-gray-500 mt-1">
                      For questions, contact us at {comp_phone}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      This is your official receipt. Please keep for your records.
                    </p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex flex-wrap gap-3 justify-center"
                >
                  <Button onClick={handlePrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Receipt
                  </Button>
                  <Button onClick={handleDownloadReceipt} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button onClick={closeReceiptPage} variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Order
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrderConfirmation;