import { useState, useEffect, useRef, useMemo, useCallback, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Barcode,
  Camera,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Printer,
  DollarSign,
  X,
  Check,
  Monitor,
  Package,
  RefreshCw,
  Tag,
  Filter,
  ShoppingBag,
  ShoppingCart,
  Key,
  Type,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp, Product } from "@/lib/types";
import { format_currency, resolveSrc } from "@/lib/functions";
import { comp_address, comp_name, comp_phone } from "@/lib/constants";
import { debounce } from "lodash";
import usePermissions from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";

interface POSItem {
  product: Product;
  quantity: number;
  price: number;
  selectedVariants?: Record<string, string>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
}

interface PaymentFormData {
  items: Array<{
    product_id: string;
    quantity: number;
    variant_options: (string | number)[] | null; 
    
    variant_ids?: (string | number)[]; 
    price: number;
    product_name: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string;
  cash_received?: number;
  change?: number;
}

const buildSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/gi, "-");

const getCartItemKey = (
  productId: string,
  variants?: Record<string, string>
) => {
  if (!variants || Object.keys(variants).length === 0) return productId;
  return (
    productId +
    "|" +
    Object.keys(variants)
      .sort()
      .map((k) => `${k}:${variants[k]}`)
      .join("|")
  );
};

const calculateFinalPrice = (
  product: Product,
  variants?: Record<string, string>
): number => {
  let price = product.price;

  if (variants && product.variants) {
    product.variants.forEach((variant) => {
      const selectedValue = variants[variant.type];
      if (!selectedValue) return;

      const rawOption = variant.options.find(
        (o) => o.value === selectedValue
      );

      if (rawOption?.price_modifier) {
        price += parseFloat(rawOption.price_modifier);
      }
    });
  }

  return price;
};

const AdminPOS = () => {
  const navigate = useNavigate();
  const { manage_pos } = usePermissions(['manage_pos']);
  const [cartItems, setCartItems] = useState<POSItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const videoRef = useRef<HTMLVideoElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store_gst, setStoreGst] = useState(0);

  useEffect(() => {
    if(!manage_pos) startTransition(() => navigate("/unauthorized"));
    fetchProducts();
  }, []);

  // Focus barcode input when scanning mode is active
  useEffect(() => {
    if (isScanning && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isScanning]);

  // Focus search input when in search mode
  useEffect(() => {
    if (!isScanning && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isScanning]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await http.get("/get-store-products/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setCategories(resp.data.categories);
        setProducts(resp.data.products);
        setStoreGst(Number(resp.data.store_gst));
        return;
      }
      toast.error(resp.data || "Error fetching products");
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isScanning) {
      debouncedSearch(value);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery && selectedCategory === "all") {
      return products;
    }
    
    return products.filter((p) => {
      const matchesSearch = searchQuery 
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (store_gst / 100);
  const total = subtotal + tax;
  const change = cashReceived ? parseFloat(cashReceived) - total : 0;

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariants({});
    setShowProductModal(true);
  };

  const addToCart = (product: Product, variants?: Record<string, string>) => {
    const itemKey = getCartItemKey(product.id, variants);
    
    setCartItems((prev) => {
      const existing = prev.find((item) => {
        const itemKey = getCartItemKey(item.product.id, item.selectedVariants || {});
        return itemKey === getCartItemKey(product.id, variants || {});
      });
      
      if (existing) {
        return prev.map((item) => {
          const itemKey = getCartItemKey(item.product.id, item.selectedVariants || {});
          const newKey = getCartItemKey(product.id, variants || {});
          return itemKey === newKey
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
      }
      
      const price = calculateFinalPrice(product, variants);
      
      return [...prev, {
        product,
        quantity: 1,
        price,
        selectedVariants: variants || {}
      }];
    });
    
    toast.success(`${product.name} added to cart`);
    setShowProductModal(false);
  };

  const quickAddToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      openProductModal(product);
    } else {
      addToCart(product);
    }
  };

  const updateQuantity = (productId: string, variants: Record<string, string>, delta: number) => {
    const key = getCartItemKey(productId, variants);
    
    setCartItems((prev) =>
      prev
        .map((item) => {
          const itemKey = getCartItemKey(item.product.id, item.selectedVariants as Record<string, string>);
          return itemKey === key
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string, variants: Record<string, string>) => {
    const key = getCartItemKey(productId, variants);
    
    setCartItems((prev) =>
      prev.filter((item) => {
        const itemKey = getCartItemKey(item.product.id, item.selectedVariants as Record<string, string>);
        return itemKey !== key;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared");
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find((p) => 
      p.id === barcodeInput || 
      p.name.toLowerCase().includes(barcodeInput.toLowerCase())
    );
    
    if (product) {
      quickAddToCart(product);
      setBarcodeInput("");
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    } else {
      toast.error("Product not found");
    }
  };

  const toggleScanMode = () => {
    setIsScanning(!isScanning);
    setBarcodeInput("");
    setSearchQuery("");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      toast.error("Could not access camera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowCamera(false);
  };
  
  const processPayment = async () => {
    if (!paymentMethod) return;

    if (
      paymentMethod === "cash" &&
      (!cashReceived || parseFloat(cashReceived) < total)
    ) {
      toast.error("Insufficient cash amount");
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        items: cartItems.map(item => {
          const variantOptions: number[] = [];
          // console.log(item.product.variants);
          if (item.selectedVariants && item.product.variants) {
            Object.entries(item.selectedVariants).forEach(([type, value]) => {
              const variant = item.product.variants.find(v => v.type === type);
              const option = variant?.options.find(o => o.value === value);
              if (option?.option_id !== undefined && option?.option_id !== null) {
                variantOptions.push(Number(option.option_id));
              }
            });
          }

          return {
            product_id: Number(item.product.id),
            quantity: Number(item.quantity),
            price: Number(item.price),
            product_name: item.product.name,
            variant_options: variantOptions,
          };
        }),
        subtotal: Number(subtotal),
        tax: Number(tax),
        total: Number(total),
        payment_method: paymentMethod,
        ...(paymentMethod === "cash"
          ? {
              cash_received: Number(cashReceived),
              change: Number(change)
            }
          : {})
      };

      const res = await http.post("/process-pos/", payload);
      const resp: ApiResp = res.data;

      if (resp.error) {
        throw new Error(resp.data || "Payment failed");
      }

      const receipt = {
        id: resp.data?.receipt_id || `RCP-${Date.now()}`,
        date: new Date().toLocaleString(),
        items: cartItems,
        subtotal,
        tax,
        total,
        paymentMethod,
        cashReceived: paymentMethod === "cash" ? Number(cashReceived) : null,
        change: paymentMethod === "cash" ? change : null
      };

      setLastReceipt(receipt);
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      clearCart();
      toast.success("Payment successful");
    } catch (err: any) {
      toast.error(err.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };


  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && receiptRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; margin: 0; padding: 10px; }
              .header { text-align: center; margin-bottom: 10px; }
              .logo { font-size: 18px; font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 8px 0; }
              .item { display: flex; justify-content: space-between; margin: 4px 0; }
              .total { font-weight: bold; font-size: 14px; }
              .footer { text-align: center; margin-top: 10px; font-size: 10px; }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const finishTransaction = () => {
    printReceipt();
    clearCart();
    setShowReceiptModal(false);
    setPaymentMethod(null);
    setCashReceived("");
    setLastReceipt(null);
    toast.success("Transaction completed!");
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-warm">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Loading POS System</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-2">Point of Sale</h1>
          <p className="text-muted-foreground">Quick and efficient checkout system</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showCustomerDisplay ? "default" : "outline"} 
            onClick={() => setShowCustomerDisplay(!showCustomerDisplay)}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            {showCustomerDisplay ? "Hide Display" : "Show Display"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scanner & Search Toggle */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-md ${isScanning ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Barcode className="h-5 w-5" />
                  </div>
                  <span className="font-medium">
                    {isScanning ? "Barcode Scan Mode" : "Search Mode"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleScanMode}
                  className="gap-2"
                >
                  {isScanning ? (
                    <>
                      <Type className="h-4 w-4" />
                      Switch to Search
                    </>
                  ) : (
                    <>
                      <Barcode className="h-4 w-4" />
                      Switch to Scan
                    </>
                  )}
                </Button>
              </div>

              {isScanning ? (
                // Barcode Scan Mode
                <div className="space-y-3">
                  <form onSubmit={handleBarcodeSubmit}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={barcodeInputRef}
                          placeholder="Scan or type barcode..."
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                      <Button type="submit" variant="secondary" className="gap-2 whitespace-nowrap">
                        <Barcode className="h-4 w-4" />
                        Scan Product
                      </Button>
                    </div>
                  </form>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={showCamera ? stopCamera : startCamera}
                      className="gap-2 flex-1"
                    >
                      <Camera className="h-4 w-4" />
                      {showCamera ? "Stop Camera" : "Use Camera"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleScanMode}
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Search Instead
                    </Button>
                  </div>

                  {/* Camera View */}
                  <AnimatePresence>
                    {showCamera && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="relative overflow-hidden rounded-lg"
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg bg-black aspect-video"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-48 h-24 border-2 border-primary rounded-lg" />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={stopCamera}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Search Mode
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Type to search products..."
                        onChange={handleSearchChange}
                        defaultValue={searchQuery}
                        className="pl-9"
                        autoFocus
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={toggleScanMode}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Barcode className="h-4 w-4" />
                      Scan Barcode
                    </Button>
                  </div>
                  
                  {searchQuery && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {filteredProducts.length} products found
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          if (searchInputRef.current) {
                            searchInputRef.current.value = "";
                          }
                        }}
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Categories */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Categories</span>
                  </div>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="w-auto">
                    <TabsList className="h-8">
                      <TabsTrigger value="grid" className="px-3 text-xs">Grid</TabsTrigger>
                      <TabsTrigger value="list" className="px-3 text-xs">List</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className={cn(
                      "h-8",
                      selectedCategory === "all" && "bg-primary hover:bg-primary/90"
                    )}
                  >
                    All Products
                  </Button>
                  {categories.slice(0, 6).map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.name)}
                      className={cn(
                        "h-8",
                        selectedCategory === category.name && "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {category.name}
                    </Button>
                  ))}
                  {categories.length > 6 && (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue placeholder="More..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(6).map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left cursor-pointer"
                      onClick={() => quickAddToCart(product)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="aspect-square rounded-md overflow-hidden mb-2 bg-muted"
                      >
                        <img 
                          src={resolveSrc(product.image)} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </motion.div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Has variants</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <p className="text-primary font-semibold">{format_currency(product.price)}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              quickAddToCart(product);
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-primary/10"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left cursor-pointer group"
                      onClick={() => quickAddToCart(product)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted"
                      >
                        <img 
                          src={resolveSrc(product.image)} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Select variants</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-primary font-semibold">{format_currency(product.price)}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            quickAddToCart(product);
                          }}
                          className="h-6 w-6 p-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-primary/10 ml-auto"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart */}
        <div className="space-y-4">
          <Card className="sticky top-4 border-0 shadow-elevated">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </CardTitle>
                {cartItems.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive h-8 px-2">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground">Cart is empty</p>
                    <p className="text-sm text-muted-foreground/70">
                      {isScanning ? "Scan a barcode or switch to search" : "Search or scan products to add"}
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={getCartItemKey(item.product.id, item.selectedVariants as Record<string, string>)}
                      className="group flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <img src={resolveSrc(item.product.image)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm truncate">{item.product.name}</p>
                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(item.selectedVariants).map(([type, value]) => (
                                  <Badge key={type} variant="outline" className="text-xs py-0 px-1.5">
                                    {value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-primary font-semibold text-sm">{format_currency(item.price)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.selectedVariants as Record<string, string>, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.selectedVariants as Record<string, string>, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-medium">{format_currency((item.price * item.quantity))}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive flex-shrink-0" onClick={() => removeItem(item.product.id, item.selectedVariants as Record<string, string>)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{format_currency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({store_gst}%)</span>
                  <span>{format_currency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-xl">{format_currency(total)}</span>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button
                  className="h-12"
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    setPaymentMethod("cash");
                    setShowPaymentModal(true);
                  }}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Cash
                </Button>
                <Button
                  variant="secondary"
                  className="h-12"
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    setPaymentMethod("card");
                    setShowPaymentModal(true);
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex gap-4 pb-4 border-b">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img 
                    src={resolveSrc(selectedProduct.image)} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedProduct.category}</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-primary">{format_currency(selectedProduct.price)}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {format_currency(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="space-y-4">
                    {selectedProduct.variants.map((variant) => (
                      <div key={variant.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">{variant.type}</Label>
                          <span className="text-xs text-muted-foreground">
                            {selectedVariants[variant.type] || "Not selected"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {variant.options.map((option) => (
                            <Button
                              key={option.value}
                              variant={
                                selectedVariants[variant.type] === option.value 
                                  ? "default" 
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => {
                                setSelectedVariants(prev => ({
                                  ...prev,
                                  [variant.type]: option.value
                                }));
                              }}
                              className={cn(
                                "h-10",
                                selectedVariants[variant.type] === option.value && "bg-primary hover:bg-primary/90"
                              )}
                            >
                              <div className="text-xs">
                                {option.value}
                                {option.price_modifier && (
                                  <div className="text-[10px] opacity-75">
                                    {parseFloat(option.price_modifier) > 0 ? `+$${option.price_modifier}` : `$${option.price_modifier}`}
                                  </div>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Final Price:</span>
                  <span className="text-xl font-bold text-primary">
                    {format_currency(calculateFinalPrice(selectedProduct, selectedVariants))}
                  </span>
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProductModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => addToCart(selectedProduct, selectedVariants)}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Display */}
      <AnimatePresence>
        {showCustomerDisplay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="bg-primary text-primary-foreground p-3 text-center">
              <p className="text-xs opacity-90">Customer Display</p>
              <p className="text-2xl font-bold">{format_currency(total)}</p>
            </div>
            <div className="p-3 max-h-40 overflow-y-auto">
              {cartItems.map((item) => (
                <div 
                  key={getCartItemKey(item.product.id, item.selectedVariants as Record<string, string>)} 
                  className="flex justify-between text-xs py-1"
                >
                  <span className="truncate flex-1">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="ml-2">
                    {format_currency((item.price * item.quantity))}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentMethod === "cash" ? "Cash Payment" : "Card Payment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-primary">{format_currency(total)}</p>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-4">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Cash amount"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="pl-9 text-lg h-12"
                    step="0.01"
                    autoFocus
                  />
                </div>
                {cashReceived && change >= 0 && (
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-600">Change Due</p>
                    <p className="text-xl font-bold text-green-700">{format_currency(change)}</p>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setCashReceived(amount.toString())}
                      className="h-10"
                    >
                      {format_currency(amount)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Process card payment</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={processPayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Complete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {lastReceipt && (
            <div ref={receiptRef} className="bg-white p-4 rounded border text-black font-mono text-xs">
              <div className="header text-center mb-3">
                <div className="logo text-lg font-bold">{comp_name}</div>
                <p>{comp_address}</p>
                <p>Tel: {comp_phone}</p>
              </div>
              <div className="divider border-top border-dashed border-gray-400 my-2" />
              <p>Receipt: {lastReceipt.id}</p>
              <p>Date: {lastReceipt.date}</p>
              <div className="divider border-top border-dashed border-gray-400 my-2" />
              {lastReceipt.items.map((item: POSItem) => (
                <div key={getCartItemKey(item.product.id, item.selectedVariants as Record<string, string>)} className="item flex justify-between my-1">
                  <div>
                    <span>{item.product.name.substring(0, 20)} x{item.quantity}</span>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <div className="text-xs">
                        {Object.entries(item.selectedVariants).map(([type, value]) => (
                          <div key={type}>{type}: {value}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span>{format_currency((item.price * item.quantity))}</span>
                </div>
              ))}
              <div className="divider border-top border-dashed border-gray-400 my-2" />
              <div className="item flex justify-between">
                <span>Subtotal</span>
                <span>{format_currency(lastReceipt.subtotal)}</span>
              </div>
              <div className="item flex justify-between">
                <span>GST ({store_gst}%)</span>
                <span>{format_currency(lastReceipt.tax)}</span>
              </div>
              <div className="item flex justify-between total font-bold">
                <span>TOTAL</span>
                <span>{format_currency(lastReceipt.total)}</span>
              </div>
              <div className="divider border-top border-dashed border-gray-400 my-2" />
              <p>Payment: {lastReceipt.paymentMethod.toUpperCase()}</p>
              {lastReceipt.cashReceived && (
                <>
                  <p>Cash: {format_currency(lastReceipt.cashReceived)}</p>
                  <p>Change: {format_currency(lastReceipt.change)}</p>
                </>
              )}
              <div className="divider border-top border-dashed border-gray-400 my-2" />
              <p className="footer text-center mt-3">Thank you for shopping!</p>
              <p className="footer text-center">Visit us again</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptModal(false)}>
              Close
            </Button>
            <Button onClick={finishTransaction}>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPOS;
