import { useState, useRef, useEffect, useMemo, startTransition } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal,
  Package,
  Eye,
  EyeOff,
  Barcode,
  Printer,
  Copy,
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  Download,
  RefreshCw,
  Percent,
  ShoppingBag,
  AlertTriangle,
  Star,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { format_currency, gen_random_string, resolveSrc, str_to_url } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

const generateBarcodeData = (code: string) => {
  const bars: number[] = [];
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    bars.push(charCode % 4 + 1);
    bars.push((charCode * 3) % 4 + 1);
  }
  return bars;
};

interface BarcodeProps {
  code: string;
  width?: number;
  height?: number;
}

const BarcodeDisplay = ({ code, width = 200, height = 80 }: BarcodeProps) => {
  const bars = generateBarcodeData(code);
  const totalUnits = bars.reduce((a, b) => a + b, 0);
  const unitWidth = width / totalUnits;

  let x = 0;
  return (
    <svg width={width} height={height + 20} className="bg-white p-2 rounded">
      <rect x="0" y="0" width={width} height={height + 20} fill="white" />
      {bars.map((barWidth, index) => {
        const rectX = x;
        x += barWidth * unitWidth;
        return index % 2 === 0 ? (
          <rect
            key={`${index}-${gen_random_string()}`}
            x={rectX}
            y={5}
            width={barWidth * unitWidth}
            height={height - 10}
            fill="black"
          />
        ) : null;
      })}
      <text
        x={width / 2}
        y={height + 12}
        textAnchor="middle"
        fontSize="12"
        fontFamily="monospace"
      >
        {code}
      </text>
    </svg>
  );
};

interface ProductFromAPI {
  id: number;
  name: string;
  description: string;
  price: string;
  original_price: string | null;
  sku: string;
  status: "active" | "inactive";
  in_stock: number;
  manage_stock: number;
  stock_quantity: number;
  low_stock_alert: number;
  weight: string | null;
  dimensions: string | null;
  created_at: string;
  updated_at: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  gallery_count: number;
  first_image: string;
  is_best_seller?: number;
  is_new?: number;
  rating?: number;
  sales_count?: number;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  hiddenProducts: number;
  stockValue: number;
  avgPrice: number;
  discountedProducts?: number;
  featuredProducts?: number;
  featuredPercentage?: number;
  newProductsCount: number;
  bestSellerCount: number;
  lowStockProducts: number;
  totalValue: number;
  totalSales: number;
  discountPercentage: number;
  categories: Array<{ name: string; count: number; value: number; active: number }>;
  topRatedProducts: ProductFromAPI[];
  lowStockProductsList: ProductFromAPI[];
}

const AdminProducts = () => {
  const {
    edit_product:can_edit_product,
    add_product: can_add_product,
    delete_product: can_delete_product,
    view_products: can_view_products,
    view_inventory: can_view_inventory
  } = usePermissions([
    "edit_product",
    "add_product",
    "delete_product",
    "view_products",
    "view_inventory"
  ])
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeProduct, setBarcodeProduct] = useState<ProductFromAPI | null>(null);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const barcodeRef = useRef<HTMLDivElement>(null);
  const [apiStats, setApiStats] = useState<any>(null);

  useEffect(() => {
    if(!can_view_products){
      startTransition(()=>navigate("/unauthorized"))
      return;
    }
    loadProducts();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await http.get("/get-product-stats/");
      const resp: ApiResp = res.data;      
      
      if (resp.error === false && resp.data) {
        setApiStats(resp.data);
      } else {
        toast.error("Failed to load stats");
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load stats");
    } 
  }

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await http.get(`/get-products/`);
      const resp: ApiResp = res.data;      
      
      if (resp.error === false && resp.data && Array.isArray(resp.data)) {
        setProducts(resp.data);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!products.length) return null;
    
    const activeProducts = products.filter(p => p.in_stock === 1).length;
    const hiddenProducts = products.filter(p => p.in_stock === 0).length;
    
    const totalValue = products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = product.stock_quantity || 0;
      return sum + (price * quantity);
    }, 0);
    
    const categoriesMap = new Map<string, { name: string; count: number; value: number; active: number }>();
    
    products.forEach(product => {
      const categoryName = product.category_name || "Uncategorized";
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          name: categoryName,
          count: 0,
          value: 0,
          active: 0
        });
      }
      
      const category = categoriesMap.get(categoryName)!;
      category.count++;
      
      const price = parseFloat(product.price) || 0;
      const quantity = product.stock_quantity || 0;
      category.value += price * quantity;
      
      if (product.in_stock === 1) category.active++;
    });
    
    const categories = Array.from(categoriesMap.values());
    
    const discountedProducts = products.filter(product => {
      const originalPrice = product.original_price ? parseFloat(product.original_price) : 0;
      const price = parseFloat(product.price) || 0;
      return originalPrice > price;
    }).length;
    
    const discountPercentage = products.length > 0 ? (discountedProducts / products.length) * 100 : 0;
    
    const bestSellerCount = products.filter(p => p.is_best_seller === 1).length;
    const newProductsCount = products.filter(p => p.is_new === 1).length;
    
    const totalSales = products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      const salesCount = product.sales_count || 0;
      return sum + (price * salesCount);
    }, 0);
    
    const topRatedProducts = products
      .filter(p => p.rating !== undefined && p.rating !== null)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
    
    const fallbackTopProducts = topRatedProducts.length === 0 
      ? [...products].sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0)).slice(0, 5)
      : topRatedProducts;
    
    const lowStockProductsList = products.filter(product => {
      const stock = product.stock_quantity || 0;
      const alertLevel = product.low_stock_alert || 0;
      return stock <= alertLevel;
    });
    
    const avgPrice = products.length > 0 
      ? products.reduce((sum, product) => sum + (parseFloat(product.price) || 0), 0) / products.length
      : 0;
    
    return {
      totalProducts: apiStats?.total_products || products.length,
      activeProducts,
      hiddenProducts,
      stockValue: apiStats?.stock_value ? parseFloat(apiStats.stock_value) : totalValue,
      avgPrice: apiStats?.avg_price ? parseFloat(apiStats.avg_price) : avgPrice,
      discountedProducts: apiStats?.discounted_products ? parseInt(apiStats.discounted_products) : discountedProducts,
      newProductsCount: apiStats?.new_products ? parseInt(apiStats.new_products) : newProductsCount,
      bestSellerCount: apiStats?.best_sellers ? parseInt(apiStats.best_sellers) : bestSellerCount,
      lowStockProducts: apiStats?.low_stock_products ? parseInt(apiStats.low_stock_products) : lowStockProductsList.length,
      totalValue,
      totalSales,
      discountPercentage,
      categories,
      topRatedProducts: fallbackTopProducts,
      lowStockProductsList
    } as ProductStats;
  }, [products, apiStats]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category_name === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && product.in_stock === 1) ||
      (statusFilter === "hidden" && product.in_stock === 0);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });



  const handlePrintBarcode = () => {
    if (!barcodeProduct) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow && barcodeRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode - ${barcodeProduct.sku}</title>
            <style>
              body { 
                display: flex; 
                flex-wrap: wrap;
                justify-content: center;
                padding: 20px;
                gap: 10px;
              }
              .barcode-container {
                text-align: center;
                padding: 10px;
                border: 1px dashed #ccc;
              }
              .product-name {
                font-size: 10px;
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .price {
                font-weight: bold;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            ${Array(6).fill(`
              <div class="barcode-container">
                ${barcodeRef.current.innerHTML}
                <div class="product-name">${barcodeProduct.name}</div>
                <div class="price">${format_currency(Number(barcodeProduct.price))}</div>
              </div>
            `).join("")}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyBarcode = () => {
    if (!barcodeProduct) return;
    navigator.clipboard.writeText(barcodeProduct.sku);
    toast.success(`SKU ${barcodeProduct.sku} copied to clipboard`);
  };

  const handleDeleteProduct = async (productId: number) => {
    if(!can_delete_product) return;
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await http.post("/delete-product/", { id: productId });
      const resp: ApiResp = res.data;
      
      if (resp.error === false) {
        toast.success("Product deleted successfully");
        loadProducts();
        loadStats();
      } else {
        toast.error(resp.data || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-2">Products Analytics</h1>
          <p className="text-muted-foreground">
            Manage your product catalog with advanced analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => { loadProducts(); loadStats(); }}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {can_add_product && (
            <Button onClick={() => startTransition(()=>navigate("/admin/product/new"))} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Products</p>
                  <h3 className="text-2xl font-bold mt-2">{stats?.totalProducts || 0}</h3>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats?.activeProducts || 0} active • {stats?.hiddenProducts || 0} hidden
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Stock Value</p>
                  <h3 className="text-2xl font-bold mt-2">
                    ${((stats?.stockValue || 0) / 1000).toFixed(1)}K
                  </h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {stats?.bestSellerCount || 0} best sellers
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Avg Price</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {format_currency(stats?.avgPrice || 0)}
                  </h3>
                  <p className="text-xs text-purple-600 mt-1">
                    {format_currency(stats?.totalSales || 0)} estimated sales
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Low Stock Alert</p>
                <h3 className="text-2xl font-bold mt-2">
                  {stats?.lowStockProducts || 0}
                </h3>
                <p className="text-xs text-orange-600 mt-1">
                  Products need restocking
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>


      {stats?.lowStockProductsList && stats.lowStockProductsList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Low Stock Alert</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {stats.lowStockProductsList.length} products have low stock levels
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {stats.lowStockProductsList
                    .slice(0, 5)
                    .map((product) => (
                      <Badge key={`${product.id}-${gen_random_string()}`} variant="outline" className="bg-white/80">
                        <span className="font-medium">{product.name}</span>
                        <span className="ml-2 text-xs opacity-75">
                          Stock: {product.stock_quantity}
                        </span>
                      </Badge>
                    ))}
                  {stats.lowStockProductsList.length > 5 && (
                    <Badge variant="secondary">+{stats.lowStockProductsList.length - 5} more</Badge>
                  )}
                </div>
              </div>
            </div>
            {can_view_inventory && (
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => startTransition(()=>navigate("/admin/inventory"))}>
                <Package className="h-4 w-4 mr-2" />
                View All
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Rated Products</CardTitle>
            <CardDescription>
              Highest rated products by customer reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topRatedProducts && stats.topRatedProducts.length > 0 ? (
                stats.topRatedProducts.map((product, index) => {
                  const rating = product.rating || 0;
                  const sales = product.sales_count || 0;
                  const price = parseFloat(product.price) || 0;
                  
                  return (
                    <motion.div 
                      key={`${product.id}-${gen_random_string()}`} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => startTransition(()=>navigate(`/product/${product.id}/${str_to_url(product.name)}`))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={resolveSrc(product.first_image)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-product.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs">{rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({sales} sales)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{format_currency(price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format_currency(price * sales)} total
                        </p>
                      </div>
                      <div className="w-32">
                        <Progress value={rating * 20} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {rating.toFixed(1)} / 5
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No rated products yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories Distribution</CardTitle>
            <CardDescription>
              Product distribution by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.categories && stats.categories.length > 0 ? (
              stats.categories.slice(0, 5).map((category) => {
                const percentage = stats.totalProducts > 0 ? (category.count / stats.totalProducts) * 100 : 0;
                
                return (
                  <div key={`${str_to_url(category.name)}-${gen_random_string()}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary/60" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{category.count}</span>
                        <span className="text-muted-foreground ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-1.5 bg-primary/10" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{format_currency(category.value)}</span>
                      <span>{category.active} active</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No categories found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <h2 className="font-display text-xl mb-1">Products Management</h2>
              <p className="text-sm text-muted-foreground">
                Detailed view of all products with advanced filtering
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Array.from(new Set(products.map(p => p.category_name))).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Gallery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const price = parseFloat(product.price) || 0;
                const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
                const isLowStock = product.stock_quantity <= product.low_stock_alert;
                const isActive = product.in_stock === 1;
                
                return (
                  <TableRow key={`${product.id}-${gen_random_string()}`}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                        <img
                          src={resolveSrc(product.first_image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-product.jpg";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{product.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {product.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{format_currency(price)}</div>
                      {originalPrice && originalPrice > price && (
                        <div className="text-sm text-muted-foreground line-through">
                          {format_currency(originalPrice)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "font-medium",
                        isLowStock ? "text-red-600" : "text-green-600"
                      )}>
                        {product.stock_quantity} units
                      </div>
                      {isLowStock && (
                        <div className="text-xs text-red-600">
                          Alert at: {product.low_stock_alert}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.gallery_count || 0} images
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {isActive ? (
                          <Badge className="bg-green-100 text-green-800 border-0">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-0">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                        {product.is_best_seller === 1 && (
                          <Badge className="bg-amber-100 text-amber-800 border-0">
                            <Trophy className="h-3 w-3 mr-1" />
                            Best Seller
                          </Badge>
                        )}
                        {product.is_new === 1 && (
                          <Badge className="bg-blue-100 text-blue-800 border-0">
                            <Sparkles className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {can_edit_product && (
                            <DropdownMenuItem onClick={() => startTransition(()=>navigate(`/admin/product/${product.id}/${str_to_url(product.name)}`))}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => startTransition(()=>navigate(`/product/${product.id}/${str_to_url(product.name)}`))}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          {can_delete_product && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No products found</p>
            {can_add_product && (
              <Button 
                className="mt-4" 
                onClick={() => startTransition(()=>navigate("/admin/product/new"))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        )}
      </motion.div>

      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Product Barcode</DialogTitle>
          </DialogHeader>
          {barcodeProduct && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="font-medium mb-2">{barcodeProduct.name}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {format_currency(parseFloat(barcodeProduct.price))}
                </p>
                <div ref={barcodeRef} className="flex justify-center">
                  <BarcodeDisplay code={barcodeProduct.sku} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handlePrintBarcode}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Labels
                </Button>
                <Button variant="outline" onClick={handleCopyBarcode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SKU
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Print generates 6 labels per page for easy cutting
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;