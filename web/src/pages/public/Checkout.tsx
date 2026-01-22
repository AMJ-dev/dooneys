import { useState, useEffect, useContext, FormEvent, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Discount, Address as AddressType, ApiResp, ProductVariantOption } from "@/lib/types";
import { http } from "@/lib/httpClient";
import { toast } from "react-toastify";
import {
  Truck,
  Store,
  CreditCard,
  ChevronRight,
  Check,
  Lock,
  ArrowLeft,
  MapPin,
  Tag,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Package,
  Calendar,
  Sparkles,
  LogIn,
  Home,
  Building,
  Loader2,
  Plus,
  Edit,
  Star,
  Wallet,
  Receipt,
  CreditCard as CreditCardIcon,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { format_currency, resolveSrc, gen_random_string } from "@/lib/functions";
import UserContext from "@/lib/userContext";
import { useTrackEvent } from "@/hooks/useTrackEvent"; 

import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  Elements
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe, StripeCardNumberElementChangeEvent } from "@stripe/stripe-js";

interface ShippingRate {
  id: string;
  carrier: string;
  price: number;
  delivery: string;
  serviceCode: string;
  deliveryDays?: string;
}

interface PickupLocation {
  id: string;
  name: string;
  type: "store" | "warehouse" | "partner";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  contactEmail: string;
  manager: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  status: "active" | "inactive" | "maintenance";
  createdAt: string;
  lastUpdated: string;
  notes?: string;
}

const stripeElementStyle = {
  base: {
    fontSize: "16px",
    color: "hsl(var(--foreground))",
    fontFamily: 'system-ui, -apple-system, sans-serif',
    "::placeholder": {
      color: "hsl(var(--muted-foreground))",
    },
    ":focus": {
      color: "hsl(var(--foreground))",
    },
  },
  invalid: { 
    color: "hsl(var(--destructive))",
    ":focus": {
      color: "hsl(var(--destructive))",
    },
  },
};

interface StripePaymentFormProps {
  amount: number;
  email: string;
  orderId: number;
  payload: any;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

const StripePaymentForm = ({ amount, email, orderId, payload, onPaymentSuccess, onPaymentError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const trackEvent = useTrackEvent();
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string>("");
  const [cardComplete, setCardComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      onPaymentError("Stripe not loaded");
      return;
    }

    if (!cardComplete.number || !cardComplete.expiry || !cardComplete.cvc) {
      setCardError("Please complete all card details");
      return;
    }

    setLoading(true);
    setCardError("");

    try {
      const intentRes = await http.post("/create-payment-intent/", payload);
      const resp: ApiResp = intentRes.data;
      
      if (resp.error || !resp.data?.clientSecret) {
        throw new Error(resp.data || "Failed to create payment intent");
      }

      const { clientSecret } = resp.data;
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) {
        throw new Error("Card element not found");
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            email: email,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || "Payment failed");
      }

      if (result.paymentIntent?.status === "succeeded") {
        
        const updateRes = await http.post("/confirm-payment/", {
          orderId,
          paymentIntentId: result.paymentIntent.id,
          amount: amount
        });
        if (updateRes.data.error) {
          throw new Error(updateRes.data.data || "Failed to update order");
        }
        trackEvent({
          event: "purchase",
          value: amount,
          metadata: {
            order_id: orderId,
            items: items
          }
        });
        onPaymentSuccess(result.paymentIntent.id);
      } else {
        throw new Error("Payment not successful");
      }
    } catch (error: any) {
      console.log(error);
      onPaymentError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (event: StripeCardNumberElementChangeEvent) => {
    if (event.elementType === "cardNumber") {
      setCardComplete(prev => ({ ...prev, number: event.complete }));
      setCardError(event.error?.message || "");
    } else if (event.elementType === "cardExpiry") {
      setCardComplete(prev => ({ ...prev, expiry: event.complete }));
      setCardError(event.error?.message || "");
    } else if (event.elementType === "cardCvc") {
      setCardComplete(prev => ({ ...prev, cvc: event.complete }));
      setCardError(event.error?.message || "");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <CreditCardIcon className="h-4 w-4" />
            Card Number
          </Label>
          <div className="p-3 border border-input rounded-lg bg-background/50">
            <CardNumberElement
              options={{
                style: stripeElementStyle,
                showIcon: true,
                placeholder: "1234 5678 9012 3456",
              }}
              onChange={handleCardChange}
              className="min-h-[40px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Expiry Date
            </Label>
            <div className="p-3 border border-input rounded-lg bg-background/50">
              <CardExpiryElement
                options={{
                  style: stripeElementStyle,
                  placeholder: "MM/YY",
                }}
                onChange={handleCardChange}
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <LockKeyhole className="h-4 w-4" />
              CVC
            </Label>
            <div className="p-3 border border-input rounded-lg bg-background/50">
              <CardCvcElement
                options={{
                  style: stripeElementStyle,
                  placeholder: "123",
                }}
                onChange={handleCardChange}
              />
            </div>
          </div>
        </div>

        {cardError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{cardError}</span>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Secure Payment</p>
              <p className="text-xs text-blue-700 mt-1">
                Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading || !cardComplete.number || !cardComplete.expiry || !cardComplete.cvc}
        className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Pay {format_currency(amount)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 pt-4 border-t">
        <div className="flex">
          {["visa", "mastercard", "amex", "discover"].map((type) => (
            <div key={`${type}-${gen_random_string()}`} className="w-8 h-6 bg-muted rounded flex items-center justify-center -ml-1 first:ml-0">
              <div className="text-xs font-medium">{type.charAt(0).toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Secured by <span className="font-medium">Stripe</span>
        </div>
      </div>
    </form>
  );
};

const Checkout = () => {
  const { auth, my_details } = useContext(UserContext);
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();
  const { items, getTotalPrice, clearCart, refreshCart } = useCart();
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"pickup" | "shipping">("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [availableShippingRates, setAvailableShippingRates] = useState<ShippingRate[]>([]);
  const [step, setStep] = useState<"information" | "shipping" | "payment" | "review">("information");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [store_gst, setStore_gst] = useState(18.00); // Updated to match database (18.00)
  const [store_free_shipping, setStore_free_shipping] = useState(true); // Updated to match database (1)
  const [store_free_shipping_threshold, setStore_free_shipping_threshold] = useState(0); // Updated to match database (0.00)
  const [store_address, setStore_address] = useState("");
  const [store_pickup_hours, setStore_pickup_hours] = useState("");
  const [loading, setLoading] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [pickup_locations, setPickupLocation] = useState<PickupLocation[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressType | null>(null);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home" as "Home" | "Work" | "Other",
    name: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    mobile_number: "",
    is_default: 0 as 0 | 1
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const hasTrackedCheckout = useRef(false);

  
  const [customerInfo, setCustomerInfo] = useState({
    firstName: my_details?.first_name || "",
    lastName: my_details?.last_name || "",
    email: my_details?.email || "",
    phone: my_details?.mobile_number || "",
  });

  useEffect(() => {
    if (auth) {
      fetch_addresses();
      fetchStore();
      fetch_pickup_location();
    }
    refreshCart();
  }, [auth]);

  useEffect(() => {
    if (selectedAddress && fulfillmentMethod === "shipping" && step === "shipping") {
      calculateShippingRates();
    }
  }, [selectedAddress, fulfillmentMethod, step]);

  useEffect(() => {
    if (fulfillmentMethod === "pickup" && paymentMethod === "cash") {
      setPaymentMethod("card");
    }
  }, [fulfillmentMethod]);

  useEffect(() => {
    if (!items.length) return;
    if (hasTrackedCheckout.current) return;

    trackEvent({
      event: "begin_checkout",
      value: getTotalPrice(),
      metadata: {
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity
        }))
      }
    });

    hasTrackedCheckout.current = true;
  }, [items, trackEvent, getTotalPrice]);

  const fetch_addresses = async () => {
    try {
      const res = await http.get("/get-addresses/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        const fetchedAddresses = resp.data;
        setAddresses(fetchedAddresses);
        const defaultAddress = fetchedAddresses.find(addr => addr.is_default === 1);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          setCustomerInfo(prev => ({
            ...prev,
            firstName: defaultAddress.name.split(' ')[0] || prev.firstName,
            lastName: defaultAddress.name.split(' ').slice(1).join(' ') || prev.lastName,
            phone: defaultAddress.mobile_number || prev.phone,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    }
  };

  const fetch_pickup_location = async()=>{
    try {
      const res = await http.get("/get-pickup-locations/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        const activeLocations = resp.data.filter((loc: PickupLocation) => loc.status === "active");
        setPickupLocation(activeLocations);
        if (activeLocations.length > 0) {
          setSelectedPickupLocation(activeLocations[0].id);
        }
        return;
      }
    } catch (error) {
      console.error("Error fetching pickup locations:", error);
      toast.error("Failed to load pickup locations");
    }
  };

  const fetchStore = async () => {
    try {
      setLoading(true);
      const res = await http.get("/get-settings/");
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        const settings = resp.data;
        setStore_gst(parseFloat(settings.store_gst) || 18.00);
        setStore_free_shipping(settings.store_free_shipping === "1" || settings.store_free_shipping === true);
        setStore_free_shipping_threshold(parseFloat(settings.store_free_shipping_threshold) || 0);
        setStore_address(settings.store_address || "");
        setStore_pickup_hours(settings.store_pickup_hours || "Mon-Fri: 10AM-6PM, Sat: 11AM-5PM");
        
        if (settings.stripe_publishable_key) {
          setStripePublishableKey(settings.stripe_publishable_key);
          setStripePromise(loadStripe(settings.stripe_publishable_key));
        }
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      toast.error("Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingRates = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address first");
      return;
    }

    try {
      setCalculatingShipping(true);
      const id_quantity = items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      }));

      const res = await http.post("/shipment-price/", {
        items: id_quantity,
        address: {
          postal_code: selectedAddress.postal_code,
          city: selectedAddress.city,
          province: selectedAddress.province,
          country: "CA"
        }
      });
      
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        const ratesData = resp.data;
        const rates: ShippingRate[] = [];
        
        if (ratesData.canada_post) {
          rates.push({
            id: "canada_post",
            carrier: ratesData.canada_post.carrier || "Canada Post",
            price: parseFloat(ratesData.canada_post.price) || 0,
            delivery: ratesData.canada_post.delivery || "2-7 business days",
            serviceCode: "CP",
            deliveryDays: ratesData.canada_post.delivery_days
          });
        }
        
        if (ratesData.fedex) {
          rates.push({
            id: "fedex",
            carrier: ratesData.fedex.carrier || "FedEx",
            price: parseFloat(ratesData.fedex.price) || 0,
            delivery: ratesData.fedex.delivery || "1-3 business days",
            serviceCode: "FX",
            deliveryDays: ratesData.fedex.delivery_days
          });
        }
        
        if (ratesData.dhl) {
          rates.push({
            id: "dhl",
            carrier: ratesData.dhl.carrier || "DHL",
            price: parseFloat(ratesData.dhl.price) || 0,
            delivery: ratesData.dhl.delivery || "2-5 business days",
            serviceCode: "DHL",
            deliveryDays: ratesData.dhl.delivery_days
          });
        }
        
        setAvailableShippingRates(rates);
        
        if (rates.length > 0) {
          const cheapest = rates.reduce((prev, current) => 
            prev.price < current.price ? prev : current
          );
          setSelectedShipping(cheapest.id);
        }
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
      toast.error("Failed to calculate shipping rates");
      setAvailableShippingRates([]);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleSelectAddress = (address: AddressType) => {
    setSelectedAddress(address);
    setCustomerInfo(prev => ({
      ...prev,
      firstName: address.name.split(' ')[0] || prev.firstName,
      lastName: address.name.split(' ').slice(1).join(' ') || prev.lastName,
      phone: address.mobile_number || prev.phone,
    }));
  };

  const handleSaveAddress = async () => {
    try {
      setSavingAddress(true);
      
      if (!newAddress.name.trim() || !newAddress.street_address.trim() || 
          !newAddress.city.trim() || !newAddress.province.trim() || 
          !newAddress.postal_code.trim()) {
        toast.error("Please fill in all required address fields");
        return;
      }

      const res = await http.post("/save-address/", newAddress);
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        toast.success("Address saved successfully");
        await fetch_addresses();
        setShowAddressModal(false);
        resetNewAddressForm();
      } else {
        toast.error(resp.data || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const resetNewAddressForm = () => {
    setNewAddress({
      label: "Home",
      name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
      street_address: "",
      city: "",
      province: "",
      postal_code: "",
      mobile_number: customerInfo.phone || "",
      is_default: 0
    });
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return <Home className="h-5 w-5" />;
      case "work":
        return <Building className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const subtotal = getTotalPrice();
  const selectedShippingRate = availableShippingRates.find(rate => rate.id === selectedShipping);
  
  // Fixed free shipping logic to match PHP exactly
  const isFreeShipping = (() => {
    if (fulfillmentMethod !== "shipping") return false;
    
    // Check store free shipping - matches PHP logic
    if (store_free_shipping) {
      if (store_free_shipping_threshold > 0) {
        // Threshold > 0: only free if subtotal >= threshold
        return subtotal >= store_free_shipping_threshold;
      } else {
        // Threshold = 0: ALL orders get free shipping (as per your database)
        return true;
      }
    }
    
    // Check free shipping discount
    if (appliedDiscount?.type === "free_shipping") {
      const minPurchase = appliedDiscount.minPurchase || 0;
      return minPurchase <= 0 || subtotal >= minPurchase;
    }
    
    return false;
  })();
  
  const shippingCost = isFreeShipping ? 0 : (selectedShippingRate?.price || 0);
  const gst = subtotal * (store_gst / 100);
  const totalTax = gst;
  
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      discountAmount = (subtotal * appliedDiscount.value) / 100;
    } else if (appliedDiscount.type === "fixed") {
      discountAmount = appliedDiscount.value;
    }
  }
  
  const total = subtotal + shippingCost + totalTax - discountAmount;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    try {
      setIsApplyingDiscount(true);
      setDiscountError("");

      const res = await http.post("/check-discount/", { code: discountCode.trim() });
      const resp: ApiResp = res.data;

      if (resp.error || !resp.data) {
        setDiscountError(resp.data || "Invalid discount code");
        return;
      }

      const discount = resp.data;

      if (discount.minPurchase && subtotal < Number(discount.minPurchase)) {
        setDiscountError(
          `Minimum purchase of ${format_currency(discount.minPurchase)} required`
        );
        return;
      }

      setAppliedDiscount({
        code: discount.code,
        type: discount.type,
        value: Number(discount.value),
        minPurchase: Number(discount.minPurchase || 0),
      });

      toast.success(`Discount ${discount.code} applied successfully`);
      setDiscountCode("");

    } catch (error) {
      console.error("Discount error:", error);
      setDiscountError("Failed to apply discount. Please try again.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  const getItemBasePrice = (item: any) => {
    let basePrice = item.product.price;
    
    if (item.selectedVariants) {
      Object.values(item.selectedVariants).forEach((option: any) => {
        if (option.price_modifier) {
          basePrice -= parseFloat(option.price_modifier);
        }
      });
    }
    
    return basePrice;
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessingPayment(true);
      setPaymentError("");

      const payload = {
        fulfillment_method: fulfillmentMethod,
        payment_method: paymentMethod,
        address_id: fulfillmentMethod === "shipping" ? selectedAddress?.id : null,
        pickup_id: fulfillmentMethod === "pickup" ? selectedPickupLocation : null,
        recipient_first_name: customerInfo.firstName,
        recipient_last_name: customerInfo.lastName,
        recipient_phone: customerInfo.phone,
        recipient_email: customerInfo.email,
        discount_code: appliedDiscount?.code ?? null,
        selected_shipping: fulfillmentMethod === "shipping" ? { carrier_id: selectedShipping } : null,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variants: item.selectedVariants ? Object.entries(item.selectedVariants).map(([type, option]) => ({
            variant_type: type,
            option_id: option.id,
          })) : [],
        })),
      };
      const res = await http.post("/create-order/", payload);
      const resp: ApiResp = res.data;

      if (resp.error || !resp.data?.orderId) {
        throw new Error(resp.data || "Order failed");
      }

      setOrderId(resp.data.orderId);

      if (paymentMethod === "cash") {
        clearCart();
        navigate(`/order-confirmation/${resp.data.orderId}`);
      } else {
        setStep("payment");
      }
    } catch (err: any) {
      setPaymentError(err.message || "Checkout failed");
      toast.error(err.message || "Checkout failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setOrderConfirmed(true);
    clearCart();
    toast.success("Payment successful! Order confirmed.");
    navigate(`/order-confirmation/${orderId}`);
  };

  const PaymentStep = () => {
    // If user somehow selected cash for shipping (shouldn't happen with the above changes)
    if (paymentMethod === "cash" && fulfillmentMethod === "shipping") {
      return (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border/50">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-display text-xl mb-2">Payment Method Not Available</h3>
              <p className="text-muted-foreground mb-4">
                Cash on Delivery is not available for shipping orders. Please select a different payment method.
              </p>
              <Button onClick={() => setPaymentMethod("card")} className="gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Switch to Card Payment
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (paymentMethod === "card" && stripePromise) {
      const payload = {
        fulfillment_method: fulfillmentMethod,
        payment_method: paymentMethod,
        address_id: fulfillmentMethod === "shipping" ? selectedAddress?.id : null,
        pickup_id: fulfillmentMethod === "pickup" ? selectedPickupLocation : null,
        discount_code: appliedDiscount?.code ?? null,
        selected_shipping: fulfillmentMethod === "shipping" ? { carrier_id: selectedShipping } : null,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variants: item.selectedVariants ? Object.entries(item.selectedVariants).map(([type, option]) => ({
            variant_type: type,
            option_id: option.id,
          })) : [],
        })),
      };

      return (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            amount={total}
            orderId={Number(orderId)}
            payload={payload}
            email={customerInfo.email}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={(error) => {
              setPaymentError(error);
              toast.error(`Payment failed: ${error}`);
            }}
          />
        </Elements>
      );
    }

    return (
      <div className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-display text-xl">Cash on Delivery</h3>
              <p className="text-sm text-muted-foreground">Pay with cash when you pick up your order</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Pickup Instructions</p>
                  <ul className="text-xs text-green-700 mt-1 space-y-1">
                    <li>• Bring exact cash amount when picking up your order</li>
                    <li>• Have your order confirmation ready</li>
                    <li>• Valid ID may be required for verification</li>
                    <li>• Pickup must be made within 7 days</li>
                  </ul>
                </div>
              </div>
            </div>

            {(() => {
              const selectedLocation = pickup_locations.find(loc => loc.id === selectedPickupLocation);
              if (selectedLocation) {
                return (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Store className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Pickup Location</p>
                        <p className="text-xs text-blue-700 mt-1">{selectedLocation.name}</p>
                        <p className="text-xs text-blue-700">{selectedLocation.address}</p>
                        <p className="text-xs text-blue-700">{selectedLocation.city}, {selectedLocation.state}</p>
                        <p className="text-xs text-blue-700 mt-2">
                          <strong>Hours:</strong> {selectedLocation.hours.monday}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            })()}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-background/50 rounded-lg border border-border">
                <p className="text-muted-foreground">Order Total</p>
                <p className="font-medium text-lg">{format_currency(total)}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border">
                <p className="text-muted-foreground">Payment Due</p>
                <p className="font-medium text-lg text-green-600">At Pickup</p>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={processingPayment}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-medium"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Confirm Cash Order
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!auth) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="font-display text-3xl mb-4">Login Required</h1>
              <p className="text-muted-foreground mb-6">
                Please login to continue with your checkout
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/login?redirect=checkout">
                  <LogIn className="h-4 w-4" />
                  Login to Continue
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0 && !orderConfirmed) {

    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">Add some items to checkout</p>
              <Button asChild size="lg">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container max-w-6xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Checkout</span>
          </nav>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {["information", "shipping", "payment", "review"].map((s, index) => {
                const stepsArray = ["information", "shipping", "payment", "review"];
                const currentStepIndex = stepsArray.indexOf(step);
                const stepIndex = stepsArray.indexOf(s);
                
                return (
                  <div key={`${s}-${gen_random_string()}`} className="flex flex-col items-center flex-1 relative">
                    <div className="w-full h-1 bg-muted absolute top-5 left-1/2 -z-10" />
                    <div 
                      className={cn(
                        "w-full h-1 absolute top-5 left-1/2 -z-10 transition-all duration-500",
                        step === s ? "bg-primary w-full" : 
                        stepIndex < currentStepIndex 
                          ? "bg-primary w-full" 
                          : "w-0"
                      )}
                    />
                    <button
                      onClick={() => {
                        if (stepIndex <= currentStepIndex) {
                          setStep(s as typeof step);
                        }
                      }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                        step === s 
                          ? "bg-primary text-primary-foreground shadow-primary/30 shadow-lg" 
                          : stepIndex < currentStepIndex
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </button>
                    <span className="text-xs font-medium capitalize">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <ScrollReveal>
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl md:text-4xl mb-2">Secure Checkout</h1>
              <p className="text-muted-foreground">
                Complete your order in a few simple steps
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {step === "information" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-elevated border border-border/50"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl">Customer Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block text-sm font-medium">
                        <User className="h-4 w-4 inline mr-2" />
                        First Name *
                      </Label>
                      <Input 
                        placeholder="John" 
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block text-sm font-medium">Last Name *</Label>
                      <Input 
                        placeholder="Doe" 
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="mb-2 block text-sm font-medium">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email *
                      </Label>
                      <Input 
                        type="email" 
                        placeholder="john@example.com" 
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="mb-2 block text-sm font-medium">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Phone Number *
                      </Label>
                      <Input 
                        type="tel" 
                        placeholder="+1 (825) 000-0000" 
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-background/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t flex justify-between items-center">
                    <Button variant="ghost" asChild>
                      <Link to="/cart">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Cart
                      </Link>
                    </Button>
                    <Button 
                      onClick={() => setStep("shipping")} 
                      size="lg"
                      disabled={!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone}
                    >
                      Continue to Delivery
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "shipping" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-elevated border border-border/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Truck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl">Delivery Method</h2>
                        <p className="text-sm text-muted-foreground">Choose how you want to receive your order</p>
                      </div>
                    </div>
                    
                    <RadioGroup
                      value={fulfillmentMethod}
                      onValueChange={(value) => setFulfillmentMethod(value as "pickup" | "shipping")}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <Label
                        htmlFor="pickup"
                        className={cn(
                          "flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md h-full",
                          fulfillmentMethod === "pickup"
                            ? "border-primary bg-primary/5 shadow-primary/10 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="pickup" id="pickup" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Store className="h-5 w-5 text-primary" />
                              <span className="font-medium text-base">In-store Pickup</span>
                              <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Free
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Pick up your order at our pickup locations
                            </p>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-green-700">No shipping fees</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-green-700">Schedule pickup time</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-green-700">Get expert advice</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-center">
                            <div className="font-bold text-lg text-green-600">Free</div>
                            <div className="text-xs text-muted-foreground">No shipping charges</div>
                          </div>
                        </div>
                      </Label>

                      <Label
                        htmlFor="shipping"
                        className={cn(
                          "flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md h-full",
                          fulfillmentMethod === "shipping"
                            ? "border-primary bg-primary/5 shadow-primary/10 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="shipping" id="shipping" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Truck className="h-5 w-5 text-primary" />
                              <span className="font-medium text-base">Shipping / Delivery</span>
                              {store_free_shipping && store_free_shipping_threshold > 0 ? (
                                <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Free over {format_currency(store_free_shipping_threshold)}
                                </span>
                              ) : store_free_shipping ? (
                                <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Free Shipping
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Get your order delivered to your address
                            </p>
                            
                            {store_free_shipping && store_free_shipping_threshold > 0 ? (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <p className="text-xs font-medium text-blue-800">Free Shipping Available</p>
                                    <p className="text-xs text-blue-700">
                                      Orders over {format_currency(store_free_shipping_threshold)} qualify for free shipping
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : store_free_shipping ? (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="text-xs font-medium text-green-800">Free Shipping</p>
                                    <p className="text-xs text-green-700">
                                      All orders qualify for free shipping
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-blue-600" />
                                <span className="text-blue-700">Doorstep delivery</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-blue-600" />
                                <span className="text-blue-700">Real-time tracking</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-blue-600" />
                                <span className="text-blue-700">Multiple carriers</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-center">
                            <div className="font-bold text-lg">
                              {isFreeShipping ? (
                                <span className="text-green-600">Free</span>
                              ) : selectedShippingRate ? (
                                format_currency(selectedShippingRate.price)
                              ) : (
                                "Calculate"
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {selectedAddress ? "Rates calculated" : "Select address for rates"}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>

                  {fulfillmentMethod === "pickup" && pickup_locations.length > 0 && (
                    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-elevated border border-border/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl">Select Pickup Location</h3>
                          <p className="text-sm text-muted-foreground">
                            Choose where you want to pick up your order
                          </p>
                        </div>
                      </div>
                      
                      <Select value={selectedPickupLocation} onValueChange={setSelectedPickupLocation}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a pickup location" />
                        </SelectTrigger>
                        <SelectContent>
                          {pickup_locations.map((location) => (
                            <SelectItem key={`${location.id}-${gen_random_string()}`} value={location.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{location.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {location.address}, {location.city}, {location.state}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedPickupLocation && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Store className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              {(() => {
                                const selectedLocation = pickup_locations.find(loc => loc.id === selectedPickupLocation);
                                if (!selectedLocation) return null;
                                return (
                                  <>
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-medium">{selectedLocation.name}</h4>
                                      <Badge className="text-xs bg-primary text-primary-foreground">
                                        {selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <p>{selectedLocation.address}</p>
                                      <p>{selectedLocation.city}, {selectedLocation.state} {selectedLocation.zipCode}</p>
                                      <p><strong>Phone:</strong> {selectedLocation.contactPhone}</p>
                                      <p><strong>Hours:</strong> Mon-Fri: {selectedLocation.hours.monday}</p>
                                      <p><strong>Manager:</strong> {selectedLocation.manager}</p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {fulfillmentMethod === "shipping" && (
                    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-elevated border border-border/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-display text-xl">Shipping Address</h3>
                            <p className="text-sm text-muted-foreground">
                              Select or add a delivery address
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            resetNewAddressForm();
                            setShowAddressModal(true);
                          }}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add New
                        </Button>
                      </div>
                      
                      {addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <h4 className="font-medium mb-2">No addresses saved</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add a shipping address to calculate delivery options
                          </p>
                          <Button onClick={() => setShowAddressModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Address
                          </Button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          {addresses.map((address) => (
                            <div
                              key={`${address.id}-${gen_random_string()}`}
                              onClick={() => handleSelectAddress(address)}
                              className={cn(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                                "hover:shadow-md hover:border-primary/50",
                                selectedAddress?.id === address.id
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                  selectedAddress?.id === address.id
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {getAddressIcon(address.label)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{address.label}</span>
                                    {address.is_default === 1 && (
                                      <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                                        <Star className="h-3 w-3 mr-1" />
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <p className="font-medium">{address.name}</p>
                                    <p className="text-muted-foreground">
                                      {address.street_address}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {address.city}, {address.province} {address.postal_code}
                                    </p>
                                    <p className="text-muted-foreground">{address.mobile_number}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedAddress && (
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl mb-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {getAddressIcon(selectedAddress.label)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">Selected Delivery Address</h4>
                                {selectedAddress.is_default === 1 && (
                                  <Badge className="text-xs bg-primary text-primary-foreground">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm space-y-1">
                                <p><strong>{selectedAddress.name}</strong></p>
                                <p>{selectedAddress.street_address}</p>
                                <p>{selectedAddress.city}, {selectedAddress.province} {selectedAddress.postal_code}</p>
                                <p>{selectedAddress.mobile_number}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAddressModal(true)}
                              className="text-primary hover:text-primary/80"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedAddress && availableShippingRates.length > 0 && (
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Available Shipping Options</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={calculateShippingRates}
                              disabled={calculatingShipping}
                              className="gap-1"
                            >
                              <Loader2 className={cn("h-3 w-3", calculatingShipping && "animate-spin")} />
                              Refresh Rates
                            </Button>
                          </div>
                          
                          <RadioGroup
                            value={selectedShipping}
                            onValueChange={setSelectedShipping}
                            className="space-y-3"
                          >
                            {availableShippingRates.map((rate) => (
                              <Label
                                key={`${rate.id}-${gen_random_string()}`}
                                htmlFor={rate.id}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                                  selectedShipping === rate.id
                                    ? "border-primary bg-primary/5 shadow-primary/10 shadow-sm"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <RadioGroupItem value={rate.id} id={rate.id} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="font-medium">{rate.carrier}</span>
                                    <span className="text-xs px-2 py-1 bg-muted rounded">
                                      {rate.delivery}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {rate.deliveryDays || "Standard delivery"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {isFreeShipping ? (
                                    <div>
                                      <div className="font-medium text-lg text-green-600">Free</div>
                                      <div className="text-xs text-muted-foreground line-through">
                                        {format_currency(rate.price)}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="font-medium text-lg">{format_currency(rate.price)}</div>
                                      <div className="text-xs text-muted-foreground">Shipping</div>
                                    </>
                                  )}
                                </div>
                              </Label>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      {selectedAddress && availableShippingRates.length === 0 && !isFreeShipping && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">No shipping rates available</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Please try refreshing rates or contact support for assistance
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={calculateShippingRates}
                              disabled={calculatingShipping}
                              className="ml-auto"
                            >
                              {calculatingShipping ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Calculating...
                                </>
                              ) : (
                                "Calculate Rates"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {!selectedAddress && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Please select a shipping address to view delivery options
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-elevated border border-border/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl">Payment Method</h3>
                        <p className="text-sm text-muted-foreground">Choose your preferred payment method</p>
                      </div>
                    </div>

                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as "card" | "cash")}
                      className="space-y-4"
                    >
                      <Label
                        htmlFor="card"
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5 shadow-primary/10 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <CreditCardIcon className="h-5 w-5 text-primary" />
                            <span className="font-medium">Credit/Debit Card</span>
                            <div className="flex gap-1 ml-auto">
                              {["visa", "mastercard", "amex", "discover"].map((type) => (
                                <div key={`${type}-${gen_random_string()}`} className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">
                                  {type.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Pay securely with your credit or debit card
                          </p>
                        </div>
                      </Label>

                      {fulfillmentMethod === "pickup" && (
                        <Label
                          htmlFor="cash"
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                            paymentMethod === "cash"
                              ? "border-primary bg-primary/5 shadow-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="cash" id="cash" />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Wallet className="h-5 w-5 text-primary" />
                              <span className="font-medium">Cash on Delivery</span>
                              <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Available for pickup
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Pay with cash when you pick up your order at the store
                            </p>
                          </div>
                        </Label>
                      )}

                      {fulfillmentMethod === "shipping" && (
                        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Cash on Delivery Not Available</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Cash payment is only available for in-store pickup. For shipping orders, please use card payment.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button variant="outline" onClick={() => setStep("information")} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Information
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      size="lg" 
                      className="gap-2"
                      disabled={
                        (fulfillmentMethod === "shipping" && (!selectedAddress || !selectedShipping)) ||
                        (fulfillmentMethod === "pickup" && !selectedPickupLocation) ||
                        processingPayment ||
                        (paymentMethod === "cash" && fulfillmentMethod === "shipping")  
                      }
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {paymentMethod === "cash" ? "Place Order" : "Continue to Payment"}
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-elevated border border-border/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl">Payment Details</h2>
                        <p className="text-sm text-muted-foreground">
                          Securely complete your payment
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Order Summary</h4>
                          <Badge className="bg-primary text-primary-foreground">
                            Order #{orderId}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Subtotal</p>
                            <p className="font-medium">{format_currency(subtotal)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Shipping</p>
                            <p className="font-medium">
                              {fulfillmentMethod === "pickup" 
                                ? "Free" 
                                : isFreeShipping 
                                  ? "Free" 
                                  : format_currency(shippingCost)
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tax (GST)</p>
                            <p className="font-medium">{format_currency(totalTax)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Discount</p>
                            <p className="font-medium text-green-600">
                              {discountAmount > 0 ? `-${format_currency(discountAmount)}` : "None"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-lg">Total</span>
                            <span className="font-display text-2xl text-primary">{format_currency(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <PaymentStep />

                    {paymentError && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Payment Error</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{paymentError}</p>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t flex justify-between items-center">
                      <Button variant="outline" onClick={() => setStep("shipping")} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Shipping
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        By continuing, you agree to our Terms of Service
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-32"
              >
                <div className="bg-gradient-to-b from-card to-card/80 rounded-2xl p-6 shadow-elevated border border-border/50 mb-6">
                  <h2 className="font-display text-xl mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${gen_random_string()}`}
                        className="flex gap-3 text-sm group"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={resolveSrc(item.product.image)}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover border border-border"
                          />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {item.product.name}
                          </p>
                          
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="space-y-1 mt-1">
                              {Object.entries(item.selectedVariants).map(([key, option]) => (
                                <div key={`${key}-${gen_random_string()}`} className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground">{key}:</span>
                                  <Badge variant="outline" className="px-2 py-0.5 h-5">
                                    {option.value}
                                    {option.price_modifier && parseFloat(option.price_modifier) !== 0 && (
                                      <span className={cn(
                                        "ml-1",
                                        parseFloat(option.price_modifier) > 0 ? "text-green-600" : "text-red-600"
                                      )}>
                                        ({parseFloat(option.price_modifier) > 0 ? '+' : ''}{format_currency(parseFloat(option.price_modifier))})
                                      </span>
                                    )}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-muted-foreground text-xs mt-1">
                            {format_currency(item.product.price)} each
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <p className="font-medium">
                            {format_currency(item.product.price * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {format_currency(item.product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    {appliedDiscount ? (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Discount Applied</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveDiscount}
                            className="h-6 w-6 p-0 hover:bg-green-100 text-green-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-green-700 mb-1">
                          {appliedDiscount.type === "percentage" && (
                            <span>{appliedDiscount.value}% off ({appliedDiscount.code})</span>
                          )}
                          {appliedDiscount.type === "fixed" && (
                            <span>${format_currency(appliedDiscount.value)} off ({appliedDiscount.code})</span>
                          )}
                          {appliedDiscount.type === "free_shipping" && (
                            <span>Free shipping ({appliedDiscount.code})</span>
                          )}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Minimum purchase: {format_currency(appliedDiscount.minPurchase)}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="flex-1 bg-background/50"
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                          />
                          <Button
                            variant="outline"
                            onClick={handleApplyDiscount}
                            disabled={isApplyingDiscount || !discountCode.trim()}
                            className="whitespace-nowrap"
                          >
                            {isApplyingDiscount ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : "Apply"}
                          </Button>
                        </div>
                        {discountError && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-red-600 p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{discountError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-b from-card to-card/80 rounded-2xl p-6 shadow-elevated border border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl">Order Total</h3>
                    <div className="text-right">
                      <div className="font-display text-3xl text-primary">{format_currency(total)}</div>
                      <p className="text-xs text-muted-foreground">Including all taxes and fees</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                        <span className="text-sm">Subtotal</span>
                      </div>
                      <span className="font-medium">{format_currency(subtotal)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-green-600" />
                          <div>
                            <span className="text-sm text-green-700">
                              Discount ({appliedDiscount?.code})
                              {appliedDiscount?.type === "percentage" && ` - ${appliedDiscount.value}% off`}
                              {appliedDiscount?.type === "fixed" && ` - ${format_currency(appliedDiscount.value)} off`}
                            </span>
                            {appliedDiscount?.minPurchase > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Min. purchase: {format_currency(appliedDiscount.minPurchase)}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-green-600 font-medium">-{format_currency(discountAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        {fulfillmentMethod === "pickup" ? (
                          <Store className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Truck className="h-3.5 w-3.5 text-primary" />
                        )}
                        <div>
                          <span className="text-sm">
                            {fulfillmentMethod === "pickup" 
                              ? "In-store Pickup" 
                              : "Shipping"
                            }
                          </span>
                          {fulfillmentMethod === "shipping" && selectedAddress && (
                            <p className="text-xs text-muted-foreground">
                              To: {selectedAddress.city}, {selectedAddress.province}
                            </p>
                          )}
                          {fulfillmentMethod === "pickup" && selectedPickupLocation && (
                            <p className="text-xs text-muted-foreground">
                              {pickup_locations.find(loc => loc.id === selectedPickupLocation)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {fulfillmentMethod === "pickup" ? (
                          <span className="text-green-600 font-medium">Free</span>
                        ) : isFreeShipping ? (
                          <div>
                            <span className="text-green-600 font-medium">Free</span>
                            {selectedShippingRate && store_free_shipping_threshold > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Over {format_currency(store_free_shipping_threshold)}
                              </div>
                            )}
                          </div>
                        ) : selectedShippingRate ? (
                          <div>
                            <div className="text-sm font-medium">
                              {format_currency(selectedShippingRate.price)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {selectedShippingRate.carrier}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Select address</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 py-3 border-b border-border/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                          <span className="text-sm font-medium">Taxes</span>
                        </div>
                        <span className="font-medium">{format_currency(totalTax)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pl-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                          <span className="text-muted-foreground">GST</span>
                          <span className="text-xs text-muted-foreground">({store_gst.toFixed(2)}%)</span>
                        </div>
                        <span>{format_currency(gst)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-lg">Total Amount</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount in CAD • {items.length} item{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-3xl text-primary">{format_currency(total)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {totalTax > 0 ? `Includes ${format_currency(totalTax)} in taxes` : "Tax included"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New Address
            </DialogTitle>
            <DialogDescription>
              Add a new delivery address for your order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Address Label</Label>
              <select
                value={newAddress.label}
                onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value as any }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <Label>Full Name *</Label>
              <Input
                value={newAddress.name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label>Street Address *</Label>
              <Input
                value={newAddress.street_address}
                onChange={(e) => setNewAddress(prev => ({ ...prev, street_address: e.target.value }))}
                placeholder="123 Main Street"
                className="mt-1"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City *</Label>
                <Input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Edmonton"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Province *</Label>
                <Input
                  value={newAddress.province}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="Alberta"
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Postal Code *</Label>
                <Input
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="T5A 0A1"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={newAddress.mobile_number}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, mobile_number: e.target.value }))}
                  placeholder="+1 (825) 000-0000"
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={newAddress.is_default === 1}
                onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked ? 1 : 0 }))}
                className="h-4 w-4 text-primary rounded"
              />
              <Label htmlFor="is_default" className="text-sm">
                Set as default address
              </Label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                {savingAddress ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddressModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Checkout;