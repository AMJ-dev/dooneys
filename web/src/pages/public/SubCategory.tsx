import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/ui/motion";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Grid3X3, 
  LayoutGrid, 
  ChevronRight,
  Package,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Filter,
  Layers,
  CheckCircle,
  Star,
  Clock,
  Shield,
  Truck,
  Heart,
  Eye,
  ArrowRight,
  Menu,
  Grid,
  List
} from "lucide-react";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { resolveSrc, gen_random_string, format_currency } from "@/lib/functions";
import userContext from "@/lib/userContext";

interface SubCategoryData {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  status: "active" | "inactive";
  category_name?: string;
  category_slug?: string;
  category_image?: string;
}

interface Product {
  id: string | number;
  name: string;
  sku: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  sub_category_id?: number;
  sub_category_name?: string;
  description?: string;
  features?: string[];
  variants?: any[];
  isNew: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  stock?: string;
  is_wishlist?: number;
  rating?: number;
}

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface SubCategoryResponse {
  subcategory: SubCategoryData;
  products: Product[];
  category: CategoryInfo;
  related_subcategories: SubCategoryData[];
}

const SubCategory = () => {
  const { auth } = useContext(userContext);
  const { id, slug } = useParams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "newest" | "popular">("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [heroImageError, setHeroImageError] = useState(false);

  const [subcategory, setSubcategory] = useState<SubCategoryData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [relatedSubcategories, setRelatedSubcategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubCategoryData();
  }, [id, auth]);

  const fetchSubCategoryData = async () => {
    setLoading(true);
    setError(null);
    setHeroImageError(false);
    
    try {
        const res = await http.post("/get-store-subcat/", {
            subcat_id: id,
            auth: auth ? "1" : "0"
        });
      
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        const data = resp.data as SubCategoryResponse;
        setSubcategory(data.subcategory);
        setProducts(data.products || []);
        setCategory(data.category);
        
        // Filter out current subcategory from related list
        const filteredRelated = (data.related_subcategories || [])
          .filter(sub => sub.id !== data.subcategory.id);
        setRelatedSubcategories(filteredRelated);
      } else {
        setError(resp.data || "Failed to load subcategory");
      }
    } catch (error) {
      console.error("Failed to fetch subcategory:", error);
      setError("Failed to load subcategory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters when subcategory changes
  useEffect(() => {
    setSearchQuery("");
    setPriceRange([0, 500]);
    setSortBy("default");
    setSelectedFilters([]);
  }, [id]);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const inStock = product.inStock !== false;
      return matchesSearch && matchesPrice && inStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "newest": return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case "popular": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

  const productPrices = products.map(p => p.price);
  const minPrice = productPrices.length > 0 ? Math.min(...productPrices) : 0;
  const maxPrice = productPrices.length > 0 ? Math.max(...productPrices) : 500;
  
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange([minPrice, maxPrice]);
    setSortBy("default");
    setSelectedFilters([]);
  };

  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    priceRange[0] > minPrice || priceRange[1] < maxPrice ? 1 : 0,
    sortBy !== "default" ? 1 : 0,
    selectedFilters.length
  ].reduce((a, b) => a + b, 0);

  const heroImageUrl = category?.image && !heroImageError 
    ? resolveSrc(category.image) 
    : null;

  if (loading) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb Skeleton */}
            <div className="h-6 w-64 bg-muted/50 rounded-full animate-pulse mb-8"></div>
            
            {/* Hero Skeleton */}
            <div className="relative h-[50vh] min-h-[400px] rounded-3xl overflow-hidden mb-12 bg-muted/50 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-12">
                <div className="h-8 w-32 bg-white/20 rounded-full mb-4"></div>
                <div className="h-16 w-96 bg-white/20 rounded-lg mb-4"></div>
                <div className="h-6 w-48 bg-white/20 rounded-full"></div>
              </div>
            </div>
            
            {/* Filters Skeleton */}
            <div className="flex justify-between items-center mb-8">
              <div className="h-10 w-40 bg-muted/50 rounded-lg animate-pulse"></div>
              <div className="flex gap-3">
                <div className="h-10 w-24 bg-muted/50 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-muted/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
            
            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-muted/50 rounded-2xl animate-pulse"></div>
                  <div className="h-5 w-3/4 bg-muted/50 rounded-full animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-muted/50 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !subcategory) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-24 h-24 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-8"
            >
              <Package className="h-12 w-12 text-destructive" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl mb-4"
            >
              Subcategory Not Found
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-8"
            >
              {error || "The subcategory you're looking for doesn't exist or has been removed."}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/shop">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Link>
              </Button>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/categories">Browse Categories</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Premium Breadcrumb with Glass Effect */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <Link 
              to={`/category/${category?.id}/${category?.slug}`} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {category?.name || "Category"}
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {subcategory.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section with Category Background Image - Like Categories Page */}
      <section className="relative h-[50vh] min-h-[500px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt={category?.name || "Category"}
              className="h-full w-full object-cover"
              onError={() => setHeroImageError(true)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
          )}
          {/* Gradient Overlay - Matches Categories Page */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
        </div>

        {/* Content */}
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-4xl"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-6 border border-white/30 shadow-lg"
            >
              <Layers className="h-4 w-4" />
              <span>{category?.name} • Subcategory</span>
            </motion.div>
            
            {/* Title with Elegant Typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
            >
              {subcategory.name}
            </motion.h1>
            
            {/* Description or Category Link */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl"
            >
              Explore our collection of {subcategory.name.toLowerCase()} in the{' '}
              <Link 
                to={`/category/${category?.id}/${category?.slug}`}
                className="text-white font-semibold hover:text-white/90 underline decoration-white/30 hover:decoration-white/50 transition-all"
              >
                {category?.name}
              </Link>{' '}
              category
            </motion.p>
            
            {/* Stats with Premium Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                <div className="p-2 bg-white/30 rounded-xl">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-semibold text-white">{products.length}</p>
                  <p className="text-xs text-white/80">Products</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                <div className={`p-2 rounded-xl ${
                  subcategory.status === "active" 
                    ? "bg-green-500/30" 
                    : "bg-white/30"
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    subcategory.status === "active" 
                      ? "text-white" 
                      : "text-white/80"
                  }`} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-semibold text-white">
                    {products.filter(p => p.inStock).length}
                  </p>
                  <p className="text-xs text-white/80">In Stock</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop - Premium Design */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="hidden lg:block w-72 flex-shrink-0"
            >
              <div className="sticky top-32 space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={clearAllFilters}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Clear all ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Search Card */}
                <div className="bg-card rounded-2xl border p-5 space-y-4 shadow-sm">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Search className="h-4 w-4 text-primary" />
                    Search in {subcategory.name}
                  </label>
                  <div className="relative">
                    <Input
                      placeholder={`Search products...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Related Subcategories Card */}
                {relatedSubcategories.length > 0 && (
                  <div className="bg-card rounded-2xl border p-5 space-y-4 shadow-sm">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Layers className="h-4 w-4 text-primary" />
                      Related Subcategories
                    </label>
                    <div className="space-y-1.5">
                      {relatedSubcategories
                        .filter(sub => sub.status === "active")
                        .map((sub) => (
                          <Link
                            key={`${sub.id}-${gen_random_string()}`}
                            to={`/subcategory/${sub.id}/${sub.slug}`}
                            className="group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm hover:bg-muted/70 transition-all"
                          >
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {sub.name}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Price Range Card */}
                <div className="bg-card rounded-2xl border p-5 space-y-4 shadow-sm">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Filter className="h-4 w-4 text-primary" />
                    Price Range
                  </label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={minPrice}
                      max={maxPrice}
                      step={Math.max(1, Math.floor((maxPrice - minPrice) / 20))}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-2 bg-muted/50 rounded-xl">
                        <span className="text-xs text-muted-foreground">Min</span>
                        <p className="font-medium">{format_currency(priceRange[0])}</p>
                      </div>
                      <div className="w-4 h-px bg-border" />
                      <div className="px-3 py-2 bg-muted/50 rounded-xl text-right">
                        <span className="text-xs text-muted-foreground">Max</span>
                        <p className="font-medium">{format_currency(priceRange[1])}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back to Category Card */}
                {category && (
                  <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border p-5 shadow-sm">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors rounded-xl h-12"
                    >
                      <Link to={`/category/${category.id}/${category.slug}`}>
                        <ArrowLeft className="h-4 w-4 mr-3" />
                        <span className="font-medium">Back to {category.name}</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Top Bar - Premium */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-muted/30 rounded-xl">
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">{filteredProducts.length}</span>
                      <span className="text-muted-foreground ml-1">of {products.length} products</span>
                    </p>
                  </div>
                  
                  {/* Active Filters */}
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Badge variant="outline" className="px-3 py-1.5 bg-primary/5 border-primary/20 rounded-full text-xs">
                          <Search className="h-3 w-3 mr-1.5 inline" />
                          "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery("")}
                            className="ml-2 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Sort Dropdown - Premium */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="gap-2.5 h-11 px-5 rounded-xl border-2 hover:bg-muted/50 transition-all"
                    >
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {sortBy === "default" ? "Sort" : 
                         sortBy === "price_asc" ? "Price: Low to High" :
                         sortBy === "price_desc" ? "Price: High to Low" :
                         sortBy === "newest" ? "Newest" : "Popular"}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    <AnimatePresence>
                      {showSortDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 bg-popover border rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                          <div className="py-2">
                            {[
                              { value: "default", label: "Default", icon: Menu },
                              { value: "price_asc", label: "Price: Low to High", icon: TrendingUp },
                              { value: "price_desc", label: "Price: High to Low", icon: TrendingUp },
                              { value: "newest", label: "Newest First", icon: Clock },
                              { value: "popular", label: "Most Popular", icon: Star }
                            ].map((option) => {
                              const Icon = option.icon;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setSortBy(option.value as any);
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/70 transition-colors ${
                                    sortBy === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                  }`}
                                >
                                  <Icon className={`h-4 w-4 ${sortBy === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                                  {option.label}
                                  {sortBy === option.value && (
                                    <CheckCircle className="h-4 w-4 ml-auto" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile filter toggle */}
                  <Button
                    variant="outline"
                    className="lg:hidden h-11 px-5 rounded-xl border-2 relative"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                  
                  {/* View mode toggle - Premium */}
                  <div className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-xl border">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "grid" 
                          ? "bg-card shadow-md text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "compact" 
                          ? "bg-card shadow-md text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Filters - Premium Slide Down */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="lg:hidden mb-8 overflow-hidden"
                  >
                    <div className="bg-card rounded-2xl border p-6 space-y-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-semibold">Filters</h4>
                        <div className="flex items-center gap-3">
                          {activeFiltersCount > 0 && (
                            <button 
                              onClick={clearAllFilters}
                              className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                              Clear all
                            </button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="h-8 w-8 p-0 rounded-full">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Mobile Search */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="relative">
                          <Input
                            placeholder={`Search in ${subcategory.name}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 bg-muted/50 border-0 rounded-xl"
                          />
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Mobile Price Range */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Price Range</label>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          min={minPrice}
                          max={maxPrice}
                          step={Math.max(1, Math.floor((maxPrice - minPrice) / 20))}
                          className="mb-4"
                        />
                        <div className="flex items-center justify-between">
                          <div className="px-4 py-2 bg-muted/50 rounded-xl">
                            <span className="text-xs text-muted-foreground">Min</span>
                            <p className="font-medium">{format_currency(priceRange[0])}</p>
                          </div>
                          <div className="w-6 h-px bg-border" />
                          <div className="px-4 py-2 bg-muted/50 rounded-xl text-right">
                            <span className="text-xs text-muted-foreground">Max</span>
                            <p className="font-medium">{format_currency(priceRange[1])}</p>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Related Subcategories */}
                      {relatedSubcategories.length > 0 && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Related Subcategories</label>
                          <div className="flex flex-wrap gap-2">
                            {relatedSubcategories
                              .filter(sub => sub.status === "active")
                              .slice(0, 5)
                              .map((sub) => (
                                <Button
                                  key={`mobile-${sub.id}`}
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full border-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                                >
                                  <Link to={`/subcategory/${sub.id}/${sub.slug}`}>
                                    {sub.name}
                                  </Link>
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Grid - Premium Cards */}
              {filteredProducts.length > 0 ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div 
                      key={`${product.id}-${gen_random_string()}`} 
                      variants={staggerItem}
                      className="group"
                    >
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 px-4"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-muted-foreground/60" />
                    </div>
                    <h3 className="font-display text-2xl mb-3">No products found</h3>
                    <p className="text-muted-foreground mb-8">
                      {searchQuery || priceRange[0] > minPrice || priceRange[1] < maxPrice
                        ? "Try adjusting your filters to find what you're looking for."
                        : `There are no products in ${subcategory.name} yet.`}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {(searchQuery || priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                        <Button 
                          variant="outline" 
                          onClick={clearAllFilters}
                          size="lg"
                          className="rounded-full px-8"
                        >
                          Clear All Filters
                        </Button>
                      )}
                      <Button asChild size="lg" className="rounded-full px-8">
                        <Link to={`/category/${category?.id}/${category?.slug}`}>
                          Browse All {category?.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Subcategories Grid - Premium Showcase */}
      {relatedSubcategories.filter(sub => sub.status === "active").length > 0 && (
        <ScrollReveal>
          <section className="py-16 bg-muted/30">
            <div className="container">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                  <Layers className="h-4 w-4" />
                  <span>Explore More</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl mb-3">
                  More from {category?.name}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Discover other subcategories in this collection
                </p>
              </motion.div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedSubcategories
                  .filter(sub => sub.status === "active")
                  .slice(0, 4)
                  .map((sub, index) => (
                    <motion.div
                      key={`${sub.id}-${gen_random_string()}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        to={`/subcategory/${sub.id}/${sub.slug}`}
                        className="group relative block aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
                      >
                        {category?.image ? (
                          <img
                            src={resolveSrc(category.image)}
                            alt={sub.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-card font-display text-xl mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                            {sub.name}
                          </h3>
                          <div className="flex items-center gap-2 text-card/80 text-sm">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              View Products
                            </span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-center mt-12"
              >
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8 border-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                >
                  <Link to={`/category/${category?.id}/${category?.slug}`}>
                    View All Subcategories
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Features Section - Premium Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $100", color: "bg-blue-500/10", textColor: "text-blue-600" },
              { icon: Shield, title: "Premium Quality", desc: "100% authentic", color: "bg-green-500/10", textColor: "text-green-600" },
              { icon: Star, title: "Best Prices", desc: "Price match guarantee", color: "bg-amber-500/10", textColor: "text-amber-600" },
              { icon: Heart, title: "Easy Returns", desc: "30-day return policy", color: "bg-red-500/10", textColor: "text-red-600" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group bg-card rounded-2xl border p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 ${feature.textColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SubCategory;