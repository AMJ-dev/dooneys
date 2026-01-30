import { useState, useEffect, useRef, useMemo, useCallback, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Barcode,
  Camera,
  Scan,
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
  Info,
  CheckCircle,
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
import BarcodeScanner from "@/components/BarcodeScanner";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store_gst, setStoreGst] = useState(0);

  useEffect(() => {
    if(!manage_pos) startTransition(() => navigate("/unauthorized"));
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!scanning && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [scanning]);

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

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!scanning) {
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

  const handleScan = (code: string) => {
    const product = products.find((p) => p.sku === code);
    if (product) quickAddToCart(product);
    else toast.error("Product not found");
    setTimeout(() => setScanning(false), 2000);
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
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @media print {
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 10px;
                  width: 58mm !important;
                  max-width: 58mm !important;
                  margin: 0 !important;
                  padding: 5px !important;
                  line-height: 1.2;
                  -webkit-print-color-adjust: exact;
                }
                * {
                  box-sizing: border-box;
                }
                .receipt-container {
                  width: 100% !important;
                  max-width: 58mm !important;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                .header {
                  text-align: center;
                  margin-bottom: 5px;
                }
                .logo {
                  font-size: 12px;
                  font-weight: bold;
                  margin-bottom: 2px;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 4px 0;
                }
                .item {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                  font-size: 9px;
                }
                .item-name {
                  flex: 1;
                  max-width: 70%;
                  word-break: break-word;
                }
                .item-price {
                  text-align: right;
                  min-width: 30%;
                }
                .total {
                  font-weight: bold;
                  font-size: 11px;
                }
                .footer {
                  text-align: center;
                  margin-top: 5px;
                  font-size: 8px;
                }
                .variants {
                  font-size: 8px;
                  padding-left: 5px;
                  color: #666;
                }
                .text-center {
                  text-align: center;
                }
                .text-right {
                  text-align: right;
                }
                .bold {
                  font-weight: bold;
                }
                .mt-2 {
                  margin-top: 2px;
                }
                .mb-2 {
                  margin-bottom: 2px;
                }
                .line-through {
                  text-decoration: line-through;
                }
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
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
    <>
      <BarcodeScanner onScan={handleScan} enabled={scanning} />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl mb-2">Point of Sale</h1>
            <p className="text-muted-foreground">Quick and efficient checkout system</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md ${scanning ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Barcode className="h-5 w-5" />
                    </div>
                    <span className="font-medium">
                      {scanning ? "Barcode Scan Mode" : "Search Mode"}
                    </span>
                  </div>
                </div>

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
                      type="button"
                      variant={scanning ? "destructive" : "outline"}
                      onClick={() => {
                        if (!scanning) {
                          setScanning(true);
                          toast.info("Ready to scan. Point camera at barcode...", {autoClose: 3000,});
                        } else setScanning(false);
                      }}
                      className="gap-2"
                    >
                      {scanning ? (
                        <>
                          <div className="relative">
                            <Camera className="h-4 w-4 animate-pulse" />
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                          </div>
                          <span className="relative">
                            Scanning...
                            <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                          </span>
                        </>
                      ) : (
                        <>
                          <Scan className="h-4 w-4" />
                          <span>Scan Barcode</span>
                        </>
                      )}
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

                {scanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setScanning(false)}
                  >
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <div className="relative w-64 h-64 md:w-80 md:h-80">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl" />
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_linear_infinite]" />
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                      
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="w-32 h-32 border-2 border-primary/40 rounded-full animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-primary/20 rounded-full animate-ping" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute -bottom-16 left-0 right-0 text-center">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Camera className="h-5 w-5 text-primary animate-pulse" />
                              <h3 className="text-xl font-display font-semibold text-white">
                                Scanning...
                              </h3>
                            </div>
                            <p className="text-sm text-primary/80">
                              Point camera at barcode
                            </p>
                            <div className="flex items-center justify-center gap-1.5 text-xs text-white/60">
                              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-150" />
                              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-300" />
                              <span className="ml-2">Looking for barcode</span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                      
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 bg-black/40 backdrop-blur-md rounded-xl p-6 max-w-md mx-auto border border-white/10"
                      >
                        <h4 className="font-display font-medium text-white mb-3 flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          Scanning Tips
                        </h4>
                        <ul className="space-y-2 text-sm text-white/70">
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                            Ensure good lighting on the barcode
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                            Hold camera steady for 2-3 seconds
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                            Keep barcode within the scanning frame
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                            Scan will auto-populate SKU field
                          </li>
                        </ul>
                        
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <Button
                            onClick={() => setScanning(false)}
                            variant="destructive"
                            size="sm"
                            className="w-full gap-2"
                          >
                            <X className="h-4 w-4" />
                            Stop Scanning
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
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
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 space-y-3">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="text-muted-foreground">Cart is empty</p>
                      <p className="text-sm text-muted-foreground/70">
                        {scanning ? "Scan a barcode or switch to search" : "Search or scan products to add"}
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

        <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Receipt</DialogTitle>
            </DialogHeader>
            {lastReceipt && (
              <div ref={receiptRef} className="receipt-container">
                <div className="header mb-2">
                  <div className="logo bold text-center mb-1">{comp_name}</div>
                  <div className="text-center text-xs mb-1">{comp_address}</div>
                  <div className="text-center text-xs mb-1">Tel: {comp_phone}</div>
                </div>
                <div className="divider"></div>
                <div className="text-xs mb-1">Receipt: {lastReceipt.id}</div>
                <div className="text-xs mb-2">Date: {lastReceipt.date}</div>
                <div className="divider"></div>
                {lastReceipt.items.map((item: POSItem) => (
                  <div key={getCartItemKey(item.product.id, item.selectedVariants as Record<string, string>)} className="item">
                    <div className="item-name">
                      <div className="bold">{item.product.name.substring(0, 20)}</div>
                      <div className="text-xs">Qty: {item.quantity} @ {format_currency(item.price)}</div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="variants">
                          {Object.entries(item.selectedVariants).map(([type, value]) => (
                            <div key={type} className="text-xs">• {type}: {value}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="item-price">
                      {format_currency((item.price * item.quantity))}
                    </div>
                  </div>
                ))}
                <div className="divider"></div>
                <div className="item">
                  <span>Subtotal</span>
                  <span>{format_currency(lastReceipt.subtotal)}</span>
                </div>
                <div className="item">
                  <span>GST ({store_gst}%)</span>
                  <span>{format_currency(lastReceipt.tax)}</span>
                </div>
                <div className="item total">
                  <span>TOTAL</span>
                  <span>{format_currency(lastReceipt.total)}</span>
                </div>
                <div className="divider"></div>
                <div className="item">
                  <span>Payment:</span>
                  <span className="bold">{lastReceipt.paymentMethod.toUpperCase()}</span>
                </div>
                {lastReceipt.cashReceived && (
                  <>
                    <div className="item">
                      <span>Cash:</span>
                      <span>{format_currency(lastReceipt.cashReceived)}</span>
                    </div>
                    <div className="item">
                      <span>Change:</span>
                      <span>{format_currency(lastReceipt.change)}</span>
                    </div>
                  </>
                )}
                <div className="divider"></div>
                <div className="footer mt-2">
                  <div className="text-center mb-1">Thank you for shopping!</div>
                  <div className="text-center">Visit us again</div>
                </div>
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
    </>
  );
};

export default AdminPOS;