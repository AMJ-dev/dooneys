import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  Box,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { toast } from "react-toastify";
import { ApiResp } from "@/lib/types";
import { format_currency, resolveSrc } from "@/lib/functions";

interface TrackingStep {
  status: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
  current: boolean;
}

interface TrackingData {
  order: {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    created_at: string;
    tracking_number: string | null;
    shipping_carrier: string | null;
    shipping_eta: string | null;
    payment_status: string;
    fulfillment_method: string;
    order_source: string;
    order_source_display?: string;
  };
  history: Array<{
    id: number;
    status: string;
    note: string | null;
    created_at: string;
    changed_by: string;
    formatted_date?: string;
  }>;
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    image: string | null;
    variants?: Array<any>;
  }>;
  address: {
    id: number;
    name: string;
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
  } | null;
  payment?: {
    id: number;
    method: string;
    amount: number;
    status: string;
    currency: string;
    created_at: string;
  } | null;
  pickup?: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  } | null;
  discount?: {
    id: number;
    code: string;
    discount_type: string;
    discount_value: number;
    applied_amount: number;
  } | null;
  summary?: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
  };
  trackingNumber: string | null;
  carrier: string | null;
  status: string;
  estimatedDelivery: string | null;
  currentStep: number;
  trackingDetails: {
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
    events: Array<{
      date: string;
      location: string;
      description: string;
      status?: string;
    }>;
    carrierUrl?: string;
    lastUpdate?: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  packaging: { label: "Packaging", color: "bg-orange-100 text-orange-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-violet-100 text-violet-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-rose-100 text-rose-800", icon: XCircle },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
};

const trackingSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "packaging", label: "Packaging", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const getStepIndex = (status: string): number => {
  const map: Record<string, number> = {
    pending: 0,
    processing: 1,
    packaging: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
  };
  return map[status] ?? 0;
};

const TrackOrder = () => {
  const { order_no } = useParams<{ order_no: string }>();
  const navigate = useNavigate();
  const [orderIdInput, setOrderIdInput] = useState(order_no || "");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(!!order_no);

  useEffect(() => {
    if (order_no) {
      fetchTracking(order_no);
    }
  }, [order_no]);

  const fetchTracking = async (orderNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await http.get(`/track-order/${encodeURIComponent(orderNumber)}/`);
      const resp: ApiResp = res.data;

      if (!resp.error && resp.data) {
        const data = resp.data;
        
        const tracking: TrackingData = {
          order: {
            id: data.order?.id || 0,
            order_number: data.order?.order_number || orderNumber,
            status: data.order?.order_status || data.order?.status || "pending",
            total_amount: parseFloat(data.order?.total_amount || data.order?.total || 0),
            subtotal: parseFloat(data.order?.subtotal || 0),
            tax_amount: parseFloat(data.order?.tax_amount || 0),
            shipping_cost: parseFloat(data.order?.shipping_cost || 0),
            discount_amount: parseFloat(data.order?.discount_amount || 0),
            created_at: data.order?.created_at || new Date().toISOString(),
            tracking_number: data.order?.tracking_number || null,
            shipping_carrier: data.order?.shipping_carrier || null,
            shipping_eta: data.order?.shipping_eta || null,
            payment_status: data.order?.payment_status || "pending",
            fulfillment_method: data.order?.fulfillment_method || "shipping",
            order_source: data.order?.order_source || "checkout",
            order_source_display: data.orderSourceDisplay || "Online Checkout",
          },
          history: data.history || [],
          items: data.items || [],
          address: data.address || null,
          payment: data.payment || null,
          pickup: data.pickup || null,
          discount: data.discount || null,
          summary: data.summary || {
            subtotal: parseFloat(data.order?.subtotal || 0),
            tax: parseFloat(data.order?.tax_amount || 0),
            shipping: parseFloat(data.order?.shipping_cost || 0),
            discount: parseFloat(data.order?.discount_amount || 0),
            total: parseFloat(data.order?.total_amount || data.order?.total || 0),
            currency: data.order?.currency || "CAD",
          },
          trackingNumber: data.trackingNumber || data.order?.tracking_number || null,
          carrier: data.carrier || data.order?.shipping_carrier || null,
          status: data.status || data.order?.order_status || data.order?.status || "pending",
          estimatedDelivery: data.estimatedDelivery || data.order?.shipping_eta || null,
          currentStep: data.currentStep || getStepIndex(data.status || data.order?.order_status || data.order?.status || "pending"),
          trackingDetails: data.trackingDetails || null,
        };

        setTrackingData(tracking);
        setSearched(true);
        setError(null);
      } else {
        setError(resp.data || "Order not found");
        setTrackingData(null);
        setSearched(true);
      }
    } catch (error: any) {
      console.error("Error fetching tracking:", error);
      setError(error?.response?.data?.data || "Failed to fetch tracking information");
      setTrackingData(null);
      setSearched(true);
      toast.error("Failed to load tracking information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) {
      toast.warning("Please enter an order number");
      return;
    }

    const trimmedOrder = orderIdInput.trim();
    
    // Update URL without page reload
    navigate(`/account/track-order/${encodeURIComponent(trimmedOrder)}`, { replace: true });
    
    // Fetch the data
    await fetchTracking(trimmedOrder);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status];
    if (config?.icon) {
      const Icon = config.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status]?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    return statusConfig[status]?.label || status;
  };

  // Build tracking steps from history
  const buildTrackingSteps = (): TrackingStep[] => {
    if (!trackingData) return [];

    const steps = trackingSteps.map((step, index) => {
      // Find matching history entry
      const historyEntry = trackingData.history?.find(
        (h) => h.status === step.key
      );

      const currentStatus = trackingData.status;
      const stepIndex = getStepIndex(currentStatus);
      const isCompleted = index <= stepIndex;
      const isCurrent = index === stepIndex;

      return {
        status: step.label,
        location: historyEntry?.note || 
                  (step.key === "pending" ? "Order placed online" : 
                   step.key === "processing" ? "Processing your order" :
                   step.key === "packaging" ? "Packaging your items" :
                   step.key === "shipped" ? "Order is in transit" :
                   step.key === "delivered" ? "Order delivered" : ""),
        date: historyEntry?.created_at ? formatDate(historyEntry.created_at) : "",
        time: historyEntry?.created_at ? formatTime(historyEntry.created_at) : "",
        completed: isCompleted,
        current: isCurrent,
      };
    });

    return steps;
  };

  // Get carrier tracking URL
  const getCarrierTrackingUrl = (carrier: string | null, trackingNumber: string | null) => {
    if (!carrier || !trackingNumber) return null;
    
    const carrierLower = carrier.toLowerCase();
    const urls: Record<string, string> = {
      "canada post": `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${trackingNumber}`,
      "canadapost": `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${trackingNumber}`,
      "fedex": `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`,
      "ups": `https://www.ups.com/track?tracknum=${trackingNumber}`,
      "dhl": `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      "purolator": `https://www.purolator.com/en/shipping/tracker?trackingnumber=${trackingNumber}`,
    };
    
    return urls[carrierLower] || null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl mb-4">Track Your Order</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter your order ID to see the current status of your delivery.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trackingStepsData = trackingData ? buildTrackingSteps() : [];
  const carrierUrl = trackingData ? getCarrierTrackingUrl(trackingData.carrier, trackingData.trackingNumber) : null;

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl mb-4">Track Your Order</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter your order ID to see the current status of your delivery.
          </p>
        </div>
      </ScrollReveal>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="sr-only">Order ID</Label>
                <Input
                  placeholder="Enter order ID (e.g., 7D653486 or C83AA36D)"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button type="submit" size="lg" className="sm:w-auto w-full">
                <Search className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error State */}
      {searched && error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
              <h3 className="font-medium text-lg mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error || "We couldn't find an order with that ID. Please check and try again."}
              </p>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tracking Results */}
      {!isLoading && !error && trackingData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Order #{trackingData.order.order_number}</CardTitle>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <p className="text-muted-foreground text-sm">
                      {trackingData.order.created_at ? formatDate(trackingData.order.created_at) : "N/A"}
                    </p>
                    {trackingData.order.order_source_display && (
                      <Badge variant="outline" className="text-xs">
                        {trackingData.order.order_source_display}
                      </Badge>
                    )}
                    {trackingData.carrier && (
                      <p className="text-muted-foreground text-sm">
                        {trackingData.carrier}
                      </p>
                    )}
                    {trackingData.trackingNumber && (
                      <p className="text-muted-foreground text-sm font-mono">
                        #{trackingData.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-sm px-3 py-1", getStatusColor(trackingData.status))}>
                    {getStatusIcon(trackingData.status)}
                    <span className="ml-1">{getStatusLabel(trackingData.status)}</span>
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {trackingData.order.payment_status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium">{format_currency(trackingData.order.total_amount)}</p>
                  </div>
                </div>
                {trackingData.estimatedDelivery && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Delivery</p>
                      <p className="font-medium">{trackingData.estimatedDelivery}</p>
                    </div>
                  </div>
                )}
                {trackingData.address && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg col-span-1 sm:col-span-2">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Shipping Address</p>
                      <p className="font-medium truncate">
                        {trackingData.address.name}, {trackingData.address.street_address}, {trackingData.address.city}, {trackingData.address.province}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {trackingStepsData.map((step, index) => {
                  const IconComponent = trackingSteps[index]?.icon || Clock;
                  return (
                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                      {/* Timeline Line */}
                      <div className="relative flex flex-col items-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center z-10 border-2",
                            step.current
                              ? "bg-primary text-primary-foreground border-primary"
                              : step.completed
                              ? "bg-green-100 text-green-600 border-green-400"
                              : "bg-muted text-muted-foreground border-muted-foreground/30"
                          )}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <IconComponent className="h-5 w-5" />
                          )}
                        </div>
                        {index < trackingStepsData.length - 1 && (
                          <div
                            className={cn(
                              "absolute top-10 w-0.5 h-full",
                              step.completed ? "bg-green-300" : "bg-muted-foreground/20"
                            )}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1.5">
                        <p
                          className={cn(
                            "font-medium",
                            step.current && "text-primary"
                          )}
                        >
                          {step.status}
                          {step.current && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Current
                            </Badge>
                          )}
                        </p>
                        {step.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {step.location}
                          </p>
                        )}
                        {step.date && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {step.date} {step.time && `at ${step.time}`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Events from API */}
          {trackingData.trackingDetails?.events && trackingData.trackingDetails.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingData.trackingDetails.events.map((event, index) => (
                    <div key={index} className="flex gap-4 pb-4 last:pb-0 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(event.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items in This Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingData.items && trackingData.items.length > 0 ? (
                  trackingData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={resolveSrc(item.image)}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {format_currency(item.unit_price)}
                        </p>
                        {item.variants && item.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.variants.map((variant, vIdx) => (
                              <Badge key={vIdx} variant="outline" className="text-xs">
                                {variant.option_value || variant.variant_value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium">{format_currency(item.total_price)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No items found for this order.
                  </p>
                )}
              </div>

              {/* Order Summary */}
              {trackingData.summary && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{format_currency(trackingData.summary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{format_currency(trackingData.summary.shipping)}</span>
                    </div>
                    {trackingData.summary.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{format_currency(trackingData.summary.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{format_currency(trackingData.summary.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{format_currency(trackingData.summary.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/account/order-details/${trackingData.order.id}`}>
                    <Box className="h-4 w-4 mr-2" />
                    View Order Details
                  </Link>
                </Button>
                {carrierUrl && (
                  <Button variant="outline" asChild>
                    <a href={carrierUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track on Carrier Site
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (trackingData) {
                      fetchTracking(trackingData.order.order_number);
                      toast.info("Refreshing tracking information...");
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TrackOrder;