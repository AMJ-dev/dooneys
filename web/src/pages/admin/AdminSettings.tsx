import { useState, useEffect, startTransition } from "react";
import { motion } from "framer-motion";
import { 
  Store, 
  Truck, 
  Mail, 
  DollarSign, 
  AlertTriangle, 
  Save,
  Loader2,
  Shield,
  Bell,
  Package,
  Users,
  CreditCard,
  Globe,
  CheckCircle,
  XCircle,
  Key,
  Eye,
  EyeOff,
  Server,
  MapPin,
  Navigation,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { format_currency } from "@/lib/functions";
import { countries } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import usePermissions from "@/hooks/usePermissions";

// Define store interface
interface StoreSettings {
  id?: string;
  updated_at: string;
  store_gst: string;
  store_free_shipping: boolean;
  store_free_shipping_threshold: number;
  
  // Stripe
  stripe_secret_key: string;
  stripe_publishable_key: string;
  
  // Canada Post
  canadapost_customer_number: string;
  canadapost_username: string;
  canadapost_password: string;
  
  // FedEx
  fedex_client_id: string;
  fedex_client_secret: string;
  fedex_account_number: string;
  
  // DHL
  dhl_account_number: string;
  dhl_api_key: string;
  
  // Shipment Origin
  shipment_postal_code: string;
  shipment_city: string;
  shipment_province: string;
  shipment_country: string;
  
  // Notifications
  new_order_notification: boolean;
  order_cancel_notification: boolean;
  low_stock_notification: boolean;
  out_of_stock_notification: boolean;
  new_customer_notification: boolean;
  support_request_notification: boolean;
  product_review_notification: boolean;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const {manage_settings: can_manage_settings } = usePermissions(["manage_settings"])
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // State for showing/hiding sensitive keys
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripePublic, setShowStripePublic] = useState(false);
  const [showCanadaPostPassword, setShowCanadaPostPassword] = useState(false);
  const [showFedexClientSecret, setShowFedexClientSecret] = useState(false);
  const [showDhlApiKey, setShowDhlApiKey] = useState(false);
  
  const [store, setStore] = useState<StoreSettings>({
    updated_at: "",
    store_gst: "",
    store_free_shipping: false,
    store_free_shipping_threshold: 0,
    
    // Stripe
    stripe_secret_key: "",
    stripe_publishable_key: "",
    
    // Canada Post
    canadapost_customer_number: "",
    canadapost_username: "",
    canadapost_password: "",
    
    // FedEx
    fedex_client_id: "",
    fedex_client_secret: "",
    fedex_account_number: "",
    
    // DHL
    dhl_account_number: "",
    dhl_api_key: "",
    
    // Shipment Origin
    shipment_postal_code: "M5V3L9",
    shipment_city: "Toronto",
    shipment_province: "ON",
    shipment_country: "CA",
    
    // Notifications
    new_order_notification: false,
    order_cancel_notification: false,
    low_stock_notification: false,
    out_of_stock_notification: false,
    new_customer_notification: false,
    support_request_notification: false,
    product_review_notification: false,
  });

  useEffect(() => {
    if(!can_manage_settings){
      startTransition(()=>navigate("/unauthorized"))
      return;
    }
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const res = await http.get("/get-settings/");
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        setStore(resp.data);
      } else {
        toast.error(resp.data || "Failed to load settings");
      }
    } catch (error: any) {
      console.error("Error fetching store:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveStore = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!store.store_gst || parseFloat(store.store_gst) < 0) {
        toast.error("Please enter a valid GST rate");
        return;
      }

      // Validate shipment origin fields
      if (!store.shipment_postal_code?.trim()) {
        toast.error("Please enter a valid postal code");
        return;
      }
      
      if (!store.shipment_city?.trim()) {
        toast.error("Please enter a city");
        return;
      }
      
      if (!store.shipment_province?.trim()) {
        toast.error("Please enter a province");
        return;
      }
      
      if (!store.shipment_country?.trim()) {
        toast.error("Please enter a country");
        return;
      }

      const res = await http.post("/update-settings/", store);
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        setStore(resp.data);
        toast.success("Store settings saved successfully");
      } else {
        toast.error(resp.data || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Error saving store:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof StoreSettings, value: any) => {
    setStore(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Test connection functions
  const testStripeConnection = async () => {
    try {
      const res = await http.post("/test-stripe-connection/", {
        secret_key: store.stripe_secret_key,
        publishable_key: store.stripe_publishable_key
      });
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        toast.success("Stripe connection successful!");
      } else {
        toast.error(resp.data || "Stripe connection failed");
      }
    } catch (error) {
      toast.error("Failed to test Stripe connection");
    }
  };

  const testShippingConnection = async (provider: string) => {
    try {
      const res = await http.post("/test-shipping-connection/", {
        provider,
        credentials: provider === 'canadapost' ? {
          customer_number: store.canadapost_customer_number,
          username: store.canadapost_username,
          password: store.canadapost_password
        } : provider === 'fedex' ? {
          client_id: store.fedex_client_id,
          client_secret: store.fedex_client_secret,
          account_number: store.fedex_account_number
        } : provider === 'dhl' ? {
          account_number: store.dhl_account_number,
          api_key: store.dhl_api_key
        } : {},
        origin: {
          postal_code: store.shipment_postal_code,
          city: store.shipment_city,
          province: store.shipment_province,
          country: store.shipment_country
        }
      });
      
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${provider} connection successful!`);
      } else {
        toast.error(resp.data || `${provider} connection failed`);
      }
    } catch (error) {
      toast.error(`Failed to test ${provider} connection`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-muted/50 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-48 bg-muted/50 rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 w-full bg-muted rounded"></div>
                <div className="h-10 w-full bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-2">Store Settings</h1>
          <p className="text-muted-foreground">
            Configure your store preferences, notifications, and API integrations
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={saveStore}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs for different settings sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="origin">Origin</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          {/* Tax & Legal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Tax & Legal Settings</CardTitle>
                  <CardDescription>
                    Configure tax rates and legal compliance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="store_gst">GST Rate (%) *</Label>
                  <Input
                    id="store_gst"
                    type="number"
                    value={store.store_gst || ''}
                    onChange={(e) => handleInputChange("store_gst", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Federal Goods and Services Tax rate
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Tax Calculation</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Total tax rate: {store.store_gst || '0'}% (GST {store.store_gst || '0'}%). 
                      Applied to all taxable items. Make sure this complies with your local regulations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Shipping Settings</CardTitle>
                  <CardDescription>
                    Configure shipping options and delivery policies
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Enable Free Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    Offer free shipping on orders over a certain amount
                  </p>
                </div>
                <Switch
                  checked={store.store_free_shipping || false}
                  onCheckedChange={(checked) => handleInputChange("store_free_shipping", checked)}
                />
              </div>
              
              <Separator />
              
              {store.store_free_shipping && (
                <div>
                  <Label htmlFor="free_shipping_threshold">
                    Free Shipping Threshold ({format_currency(store.store_free_shipping_threshold || 0)})
                  </Label>
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    value={store.store_free_shipping_threshold || 0}
                    onChange={(e) => handleInputChange("store_free_shipping_threshold", Number(e.target.value))}
                    min="0"
                    step="1"
                    className="mt-1 w-48"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum order amount for free shipping
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Shipping Policy</p>
                    <p className="text-xs text-blue-700 mt-1">
                      {store.store_free_shipping 
                        ? `Free shipping available on orders above ${format_currency(store.store_free_shipping_threshold || 0)}`
                        : 'Free shipping is currently disabled. Standard shipping rates apply.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipment Origin Settings */}
        <TabsContent value="origin" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Shipment Origin Address</CardTitle>
                  <CardDescription>
                    Configure the origin address for shipping calculations (Canada Post, FedEx, DHL)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-start gap-3">
                  <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Shipping Origin</p>
                    <p className="text-xs text-blue-700 mt-1">
                      This address is used as the starting point for all shipping rate calculations. 
                      Shipping carriers need this information to calculate accurate delivery costs and times.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Postal Code */}
                <div>
                  <Label htmlFor="shipment_postal_code">Postal Code *</Label>
                  <Input
                    id="shipment_postal_code"
                    type="text"
                    value={store.shipment_postal_code || ''}
                    onChange={(e) => handleInputChange("shipment_postal_code", e.target.value.toUpperCase())}
                    placeholder="M5V3L9"
                    className="mt-1"
                    maxLength={7}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Canadian postal code (e.g., M5V3L9)
                  </p>
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="shipment_city">City *</Label>
                  <Input
                    id="shipment_city"
                    type="text"
                    value={store.shipment_city || ''}
                    onChange={(e) => handleInputChange("shipment_city", e.target.value)}
                    placeholder="Toronto"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    City where shipments originate
                  </p>
                </div>

                {/* Province */}
                <div>
                  <Label htmlFor="shipment_province">Province *</Label>
                  <select
                    id="shipment_province"
                    value={store.shipment_province || ''}
                    onChange={(e) => handleInputChange("shipment_province", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                  >
                    <option value="">Select Province</option>
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="YT">Yukon</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Province code (e.g., ON, BC, QC)
                  </p>
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="shipment_country">Country *</Label>
                  <select
                    id="shipment_country"
                    value={store.shipment_country || 'CA'} // Default to Canada if empty
                    onChange={(e) => handleInputChange("shipment_country", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Country where shipments originate
                  </p>
                </div>
              </div>

              {/* Current Origin Display */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-800">Current Shipment Origin</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Address:</span>{' '}
                        {store.shipment_city || 'Not set'}, {store.shipment_province || 'Not set'} {store.shipment_postal_code || 'Not set'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Country:</span> {store.shipment_country || 'Not set'}
                      </p>
                      <p className="text-xs text-indigo-700 mt-2">
                        This address will be used for all shipping rate calculations with Canada Post, FedEx, and DHL.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Accurate origin information is required for shipping carriers to calculate 
                  correct shipping rates and delivery times. Make sure this matches your actual warehouse or fulfillment location.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Stripe Payment Gateway</CardTitle>
                  <CardDescription>
                    Configure Stripe for secure payment processing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Publishable Key */}
                <div>
                  <Label htmlFor="stripe_publishable_key">Publishable Key</Label>
                  <div className="relative">
                    <Input
                      id="stripe_publishable_key"
                      type={showStripePublic ? "text" : "password"}
                      value={store.stripe_publishable_key || ''}
                      onChange={(e) => handleInputChange("stripe_publishable_key", e.target.value)}
                      placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripePublic(!showStripePublic)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showStripePublic ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Public key for Stripe.js integration
                  </p>
                </div>

                {/* Secret Key */}
                <div>
                  <Label htmlFor="stripe_secret_key">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripe_secret_key"
                      type={showStripeSecret ? "text" : "password"}
                      value={store.stripe_secret_key || ''}
                      onChange={(e) => handleInputChange("stripe_secret_key", e.target.value)}
                      placeholder="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showStripeSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Private key for server-side operations (keep secure!)
                  </p>
                </div>
              </div>

              {/* Test Connection */}
              <div className="pt-4 border-t">
                <Button
                  onClick={testStripeConnection}
                  variant="outline"
                  className="gap-2"
                >
                  <Server className="h-4 w-4" />
                  Test Stripe Connection
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Make sure to use live keys for production and test keys for development
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Security Note</p>
                    <p className="text-xs text-purple-700 mt-1">
                      Stripe secret keys should never be exposed to the client side. 
                      All payment processing should be handled server-side. 
                      Your keys are encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping API Settings */}
        <TabsContent value="shipping" className="space-y-6">
          {/* Origin Info Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-indigo-800">Shipment Origin</p>
                <p className="text-xs text-indigo-700">
                  Shipping rates will be calculated from: {store.shipment_city || 'Not set'}, {store.shipment_province || 'Not set'} {store.shipment_postal_code || 'Not set'}, {store.shipment_country || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Canada Post */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Canada Post API</CardTitle>
                  <CardDescription>
                    Configure Canada Post shipping integration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="canadapost_customer_number">Customer Number</Label>
                  <Input
                    id="canadapost_customer_number"
                    type="text"
                    value={store.canadapost_customer_number || ''}
                    onChange={(e) => handleInputChange("canadapost_customer_number", e.target.value)}
                    placeholder="0001234567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="canadapost_username">Username</Label>
                  <Input
                    id="canadapost_username"
                    type="text"
                    value={store.canadapost_username || ''}
                    onChange={(e) => handleInputChange("canadapost_username", e.target.value)}
                    placeholder="api_username"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="canadapost_password">Password</Label>
                  <div className="relative">
                    <Input
                      id="canadapost_password"
                      type={showCanadaPostPassword ? "text" : "password"}
                      value={store.canadapost_password || ''}
                      onChange={(e) => handleInputChange("canadapost_password", e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCanadaPostPassword(!showCanadaPostPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCanadaPostPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => testShippingConnection("canadapost")}
                  variant="outline"
                  className="gap-2"
                >
                  <Server className="h-4 w-4" />
                  Test Canada Post Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FedEx */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>FedEx API</CardTitle>
                  <CardDescription>
                    Configure FedEx shipping integration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fedex_client_id">Client ID</Label>
                  <Input
                    id="fedex_client_id"
                    type="text"
                    value={store.fedex_client_id || ''}
                    onChange={(e) => handleInputChange("fedex_client_id", e.target.value)}
                    placeholder="l7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fedex_client_secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="fedex_client_secret"
                      type={showFedexClientSecret ? "text" : "password"}
                      value={store.fedex_client_secret || ''}
                      onChange={(e) => handleInputChange("fedex_client_secret", e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFedexClientSecret(!showFedexClientSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showFedexClientSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fedex_account_number">Account Number</Label>
                  <Input
                    id="fedex_account_number"
                    type="text"
                    value={store.fedex_account_number || ''}
                    onChange={(e) => handleInputChange("fedex_account_number", e.target.value)}
                    placeholder="123456789"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => testShippingConnection("fedex")}
                  variant="outline"
                  className="gap-2"
                >
                  <Server className="h-4 w-4" />
                  Test FedEx Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* DHL */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>DHL API</CardTitle>
                  <CardDescription>
                    Configure DHL shipping integration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dhl_account_number">Account Number</Label>
                  <Input
                    id="dhl_account_number"
                    type="text"
                    value={store.dhl_account_number || ''}
                    onChange={(e) => handleInputChange("dhl_account_number", e.target.value)}
                    placeholder="123456789"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dhl_api_key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="dhl_api_key"
                      type={showDhlApiKey ? "text" : "password"}
                      value={store.dhl_api_key || ''}
                      onChange={(e) => handleInputChange("dhl_api_key", e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDhlApiKey(!showDhlApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showDhlApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => testShippingConnection("dhl")}
                  variant="outline"
                  className="gap-2"
                >
                  <Server className="h-4 w-4" />
                  Test DHL Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure email notifications for administrators
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Order Notifications</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'new_order_notification' as const, label: 'New Order Received', desc: 'Notify when a new order is placed' },
                    { key: 'order_cancel_notification' as const, label: 'Order Cancellation', desc: 'Notify when an order is cancelled' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={store[item.key] || false}
                        onCheckedChange={(checked) => handleInputChange(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Inventory Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Inventory Notifications</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'low_stock_notification' as const, label: 'Low Stock Alert', desc: 'Notify when products are low in stock' },
                    { key: 'out_of_stock_notification' as const, label: 'Out of Stock Alert', desc: 'Notify when products go out of stock' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={store[item.key] || false}
                        onCheckedChange={(checked) => handleInputChange(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Customer Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Customer Notifications</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'new_customer_notification' as const, label: 'New Customer Registration', desc: 'Notify when a new customer signs up' },
                    { key: 'support_request_notification' as const, label: 'Customer Support Request', desc: 'Notify when a customer submits support request' },
                    { key: 'product_review_notification' as const, label: 'Product Review Submitted', desc: 'Notify when a customer submits a review' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={store[item.key] || false}
                        onCheckedChange={(checked) => handleInputChange(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle>API Keys Summary</CardTitle>
                  <CardDescription>
                    Overview of all configured API credentials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Shipment Origin Summary */}
                <div className="p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    Shipment Origin
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Postal Code:</span>
                      <span className={store.shipment_postal_code ? 'text-green-600 font-medium' : 'text-red-600'}>
                        {store.shipment_postal_code || 'Not configured'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">City:</span>
                      <span className={store.shipment_city ? 'text-green-600 font-medium' : 'text-red-600'}>
                        {store.shipment_city || 'Not configured'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Province:</span>
                      <span className={store.shipment_province ? 'text-green-600 font-medium' : 'text-red-600'}>
                        {store.shipment_province || 'Not configured'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Country:</span>
                      <span className={store.shipment_country ? 'text-green-600 font-medium' : 'text-red-600'}>
                        {store.shipment_country || 'Not configured'}
                      </span>
                    </div>
                  </div>
                </div>

                {[
                  { label: 'Stripe', keys: [
                    { name: 'Publishable Key', value: store.stripe_publishable_key },
                    { name: 'Secret Key', value: store.stripe_secret_key }
                  ]},
                  { label: 'Canada Post', keys: [
                    { name: 'Customer Number', value: store.canadapost_customer_number },
                    { name: 'Username', value: store.canadapost_username },
                    { name: 'Password', value: store.canadapost_password ? '••••••••' : '' }
                  ]},
                  { label: 'FedEx', keys: [
                    { name: 'Client ID', value: store.fedex_client_id },
                    { name: 'Client Secret', value: store.fedex_client_secret ? '••••••••' : '' },
                    { name: 'Account Number', value: store.fedex_account_number }
                  ]},
                  { label: 'DHL', keys: [
                    { name: 'Account Number', value: store.dhl_account_number },
                    { name: 'API Key', value: store.dhl_api_key ? '••••••••' : '' }
                  ]}
                ].map((provider) => (
                  <div key={provider.label} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">{provider.label}</h4>
                    <div className="space-y-2">
                      {provider.keys.map((key) => (
                        <div key={key.name} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key.name}:</span>
                          <span className={key.value ? 'text-green-600 font-medium' : 'text-red-600'}>
                            {key.value ? (key.name.includes('Secret') || key.name.includes('Password') ? '••••••••' : key.value) : 'Not configured'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button Footer */}
      <div className="sticky bottom-6 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <p>Last updated: {formatDate(store.updated_at)}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={saveStore} 
            disabled={saving}
            className="gap-2"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;