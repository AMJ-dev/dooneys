import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useParams } from "react-router-dom";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/ui/motion";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  X, 
  Grid3X3, 
  LayoutGrid, 
  Filter,
  ChevronDown,
  Star,
  Tag,
  Sparkles,
  Package,
  RefreshCw,
  Check,
  SortDesc,
  Filter as FilterIcon,
  ArrowUpDown,
  Diamond,
  Crown,
  Gem
} from "lucide-react";
import { cn } from "@/lib/utils";
import productsDisplay from "@/assets/products-display.jpg";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { resolveSrc, gen_random_string } from "@/lib/functions";
import UserContext from "@/lib/userContext";

const Shop = () => {
  const {auth} = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShop()
  }, []);
  const fetchShop = async () => {
    try {
      const res = await http.post("/get-store-products/", {auth: auth?"1":"0"});
      const resp:ApiResp = res.data;
      if (!resp.error && resp.data) {
        setCategories(resp.data.categories);
        setProducts(resp.data.products);
      }
    } catch (error) {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const sortOptions = [
    { id: "featured", label: "Featured", icon: Sparkles, color: "text-primary" },
    { id: "newest", label: "New Arrivals", icon: Package, color: "text-blue-500" },
    { id: "price-low", label: "Price: Low to High", icon: Tag, color: "text-green-500" },
    { id: "price-high", label: "Price: High to Low", icon: Tag, color: "text-purple-500" },
    { id: "rating", label: "Top Rated", icon: Star, color: "text-yellow-500" },
    { id: "best-sellers", label: "Best Sellers", icon: Crown, color: "text-red-500" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "best-sellers":
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      default:
        return 0;
    }
  });

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setPriceRange([0, 500]);
    setSortBy("featured");
    setShowFilters(false);
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0);

  return (
    <Layout>
      {/* Premium Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={productsDisplay}
            alt="Shop All Products"
            className="h-full w-full object-cover object-center scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/75 to-foreground/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/30" />
        </div>
        
        {/* Animated floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`${i}-${gen_random_string()}`}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl rounded-full border border-primary/30 mb-6"
            >
              <Gem className="h-5 w-5 text-accent animate-pulse" />
              <span className="text-sm md:text-base text-card font-medium tracking-wider">
                PREMIUM BEAUTY COLLECTION
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-card mb-4 md:mb-6">
                Discover <span className="text-gradient bg-gradient-to-r from-primary via-accent to-highlight">Luxury</span>
              </h1>
              <p className="text-card/90 text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
                Experience the finest beauty products, meticulously curated for elegance and excellence
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 text-card/60" />
        </motion.div>
      </section>

      {/* Floating Mobile Controls - Always Visible */}
      {isMobile && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-lg">
          <div className="bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-2">
            <div className="flex items-center justify-between gap-2">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search luxury products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/30 border-border/50 text-sm h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <Button
                size="sm"
                variant="secondary"
                className={cn(
                  "gap-2 h-9 px-3 rounded-lg",
                  activeFiltersCount > 0 && "bg-primary/20 text-primary border-primary/30"
                )}
                onClick={() => setShowFilters(true)}
              >
                <FilterIcon className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="text-xs font-bold">{activeFiltersCount}</span>
                )}
              </Button>

              {/* Sort Button */}
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 h-9 px-3 rounded-lg"
                onClick={() => setShowMobileSort(true)}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          {/* Desktop Controls Bar */}
          <div className="hidden lg:block mb-8">
            <div className="bg-gradient-to-b from-card to-card/80 rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search our premium collection..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-lg bg-background/30 border-border/50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Active Filters Indicator */}
                  {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <span className="text-sm font-medium text-primary">
                        {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Sort Dropdown */}
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-3 border-border/50 bg-card/50"
                    >
                      <SortDesc className="h-5 w-5" />
                      <span>{sortOptions.find(opt => opt.id === sortBy)?.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border/50 rounded-2xl shadow-elevated z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-sm">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={`${option.id}-${gen_random_string()}`}
                            onClick={() => setSortBy(option.id)}
                            className={cn(
                              "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted/50 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl group/item",
                              sortBy === option.id && "bg-primary/10 text-primary"
                            )}
                          >
                            <Icon className={cn("h-5 w-5", option.color)} />
                            <span className="font-medium">{option.label}</span>
                            {sortBy === option.id && (
                              <Check className="h-5 w-5 ml-auto text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center bg-muted/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        viewMode === "grid" 
                          ? "bg-background shadow-md text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        viewMode === "compact" 
                          ? "bg-background shadow-md text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Grid3X3 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-80 flex-shrink-0"
            >
              <div className="sticky top-32 space-y-8">
                {/* Premium Filter Card */}
                <div className="bg-gradient-to-b from-card to-card/90 rounded-3xl p-8 shadow-soft border border-border/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                        <Filter className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium">Refine Your Search</h3>
                        <p className="text-sm text-muted-foreground">Discover your perfect match</p>
                      </div>
                    </div>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="gap-2 text-primary"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Categories Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Diamond className="h-4 w-4 text-primary" />
                        Categories
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {products.length} products
                      </span>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group",
                          !selectedCategory
                            ? "bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 text-primary"
                            : "hover:bg-muted/50 border border-transparent"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                          !selectedCategory 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-muted-foreground/30 group-hover:border-primary"
                        )}>
                          {!selectedCategory && <Check className="h-3 w-3" />}
                        </div>
                        <span className="font-medium">All Products</span>
                        <span className="ml-auto text-xs px-2 py-1 bg-muted rounded-full">
                          {products.length}
                        </span>
                      </button>
                      
                      {categories.map((cat) => {
                        const count = products.filter(p => p.category === cat.name).length;
                        return (
                          <button
                            key={`${cat.id}-${gen_random_string()}`}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group",
                              selectedCategory === cat.name
                                ? "bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 text-primary"
                                : "hover:bg-muted/50 border border-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                              selectedCategory === cat.name
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "border-muted-foreground/30 group-hover:border-primary"
                            )}>
                              {selectedCategory === cat.name && <Check className="h-3 w-3" />}
                            </div>
                            <img src={resolveSrc(cat.image)} alt={cat.name} className="h-5 w-5" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium truncate">{cat.name}</span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-muted rounded-full min-w-[2rem] text-center">
                              {cat.product_count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Price Range
                      </h4>
                      <span className="text-sm font-medium text-primary">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500}
                      min={0}
                      step={10}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">$0</span>
                      <span className="text-muted-foreground">$250</span>
                      <span className="text-muted-foreground">$500+</span>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="pt-6 border-t border-border/50">
                      <h4 className="font-medium mb-3">Active Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory && (
                          <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-sm flex items-center gap-2 border border-primary/20">
                            <span className="font-medium text-primary">{selectedCategory}</span>
                            <button 
                              onClick={() => setSelectedCategory(null)}
                              className="p-1 hover:bg-primary/10 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {searchQuery && (
                          <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-sm flex items-center gap-2 border border-primary/20">
                            <span className="font-medium text-primary">"{searchQuery}"</span>
                            <button 
                              onClick={() => setSearchQuery("")}
                              className="p-1 hover:bg-primary/10 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {(priceRange[0] > 0 || priceRange[1] < 500) && (
                          <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-sm flex items-center gap-2 border border-primary/20">
                            <span className="font-medium text-primary">${priceRange[0]} - ${priceRange[1]}</span>
                            <button 
                              onClick={() => setPriceRange([0, 500])}
                              className="p-1 hover:bg-primary/10 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Premium Features */}
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <h4 className="font-medium mb-4">Premium Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Package className="h-4 w-4 text-green-500" />
                        </div>
                        <span>Free Shipping Over $100</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Star className="h-4 w-4 text-blue-500" />
                        </div>
                        <span>Authentic Products Guaranteed</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Crown className="h-4 w-4 text-purple-500" />
                        </div>
                        <span>Premium Quality Ingredients</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Mobile Category Chips */}
              <div className="lg:hidden mb-6">
                <ScrollReveal>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl">Categories</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setViewMode(viewMode === "grid" ? "compact" : "grid")}
                      >
                        {viewMode === "grid" ? (
                          <LayoutGrid className="h-4 w-4" />
                        ) : (
                          <Grid3X3 className="h-4 w-4" />
                        )}
                        {viewMode === "grid" ? "Grid" : "Compact"}
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
                
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 text-sm font-medium",
                      !selectedCategory
                        ? "bg-gradient-to-r from-primary to-accent border-transparent text-primary-foreground shadow-lg"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={`${cat.id}-${gen_random_string()}`}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 flex items-center gap-2",
                        selectedCategory === cat.name
                          ? "bg-gradient-to-r from-primary to-accent border-transparent text-primary-foreground shadow-lg"
                          : "bg-card border-border hover:border-primary/50"
                      )}
                    >
                      <img src={resolveSrc(cat.image)} alt={cat.name} className="h-5 w-5" />
                      <span className="font-medium whitespace-nowrap">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="text-foreground font-medium">{sortedProducts.length}</span> of{" "}
                    <span className="text-foreground font-medium">{products.length}</span> premium products
                  </p>
                  {selectedCategory && (
                    <p className="text-sm text-primary font-medium flex items-center gap-2 mt-1">
                      <span className="bg-primary/10 px-3 py-1 rounded-full">{selectedCategory}</span>
                    </p>
                  )}
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <div className="flex items-center bg-muted/50 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2 rounded transition-all duration-300",
                        viewMode === "grid" 
                          ? "bg-background shadow-sm text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={cn(
                        "p-2 rounded transition-all duration-300",
                        viewMode === "compact" 
                          ? "bg-background shadow-sm text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Grid3X3 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Sort Bottom Sheet */}
              <AnimatePresence>
                {showMobileSort && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setShowMobileSort(false)}
                  >
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-card to-card/95 border-t border-border/50 shadow-2xl rounded-t-3xl overflow-hidden max-h-[85vh]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                              <ArrowUpDown className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="font-display text-xl">Sort Products</h2>
                          </div>
                          <button
                            onClick={() => setShowMobileSort(false)}
                            className="p-2 hover:bg-muted/50 rounded-lg"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {sortOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={`${option.id}-${gen_random_string()}`}
                                onClick={() => {
                                  setSortBy(option.id);
                                  setShowMobileSort(false);
                                }}
                                className={cn(
                                  "w-full px-4 py-4 text-left flex items-center gap-4 hover:bg-muted/30 transition-all duration-200 rounded-xl group",
                                  sortBy === option.id && "bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30"
                                )}
                              >
                                <Icon className={cn("h-5 w-5", option.color)} />
                                <span className="font-medium flex-1">{option.label}</span>
                                {sortBy === option.id && (
                                  <div className="p-1 bg-primary rounded-full">
                                    <Check className="h-4 w-4 text-primary-foreground" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Filters Bottom Sheet */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setShowFilters(false)}
                  >
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-card to-card/95 border-t border-border/50 shadow-2xl rounded-t-3xl overflow-y-auto max-h-[90vh]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                              <Filter className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h2 className="font-display text-xl">Filters</h2>
                              <p className="text-sm text-muted-foreground">Refine your search</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {activeFiltersCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="gap-2 text-primary"
                              >
                                <RefreshCw className="h-4 w-4" />
                                Clear All
                              </Button>
                            )}
                            <button
                              onClick={() => setShowFilters(false)}
                              className="p-2 hover:bg-muted/50 rounded-lg"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-6 pb-6">
                          {/* Search in Filters */}
                          <div>
                            <label className="font-medium mb-3 block">Search</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12"
                              />
                            </div>
                          </div>

                          {/* Categories */}
                          <div>
                            <label className="font-medium mb-3 block">Categories</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                  "px-4 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-300",
                                  !selectedCategory
                                    ? "bg-gradient-to-r from-primary to-accent border-transparent text-primary-foreground shadow-lg"
                                    : "bg-background border-border hover:border-primary"
                                )}
                              >
                                All Products
                              </button>
                              {categories.map((cat) => (
                                <button
                                  key={`${cat.id}-${gen_random_string()}`}
                                  onClick={() => setSelectedCategory(cat.name)}
                                  className={cn(
                                    "px-4 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-300 flex flex-col items-center gap-2",
                                    selectedCategory === cat.name
                                      ? "bg-gradient-to-r from-primary to-accent border-transparent text-primary-foreground shadow-lg"
                                      : "bg-background border-border hover:border-primary"
                                  )}
                                >
                                  <img src={resolveSrc(cat.image)} alt={cat.name} className="h-5 w-5" />
                                  <span>{cat.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Price Range */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <label className="font-medium">Price Range</label>
                              <span className="text-lg font-bold text-primary">
                                ${priceRange[0]} - ${priceRange[1]}
                              </span>
                            </div>
                            <Slider
                              value={priceRange}
                              onValueChange={setPriceRange}
                              max={500}
                              step={10}
                              className="mb-4"
                            />
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>$0</span>
                              <span>$250</span>
                              <span>$500+</span>
                            </div>
                          </div>

                          {/* Active Filters */}
                          {activeFiltersCount > 0 && (
                            <div className="pt-4 border-t border-border/50">
                              <h4 className="font-medium mb-3">Active Filters</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCategory && (
                                  <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-sm flex items-center gap-2 border border-primary/20">
                                    <span className="font-medium text-primary">{selectedCategory}</span>
                                    <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-primary/10 rounded">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                {searchQuery && (
                                  <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-sm flex items-center gap-2 border border-primary/20">
                                    <span className="font-medium text-primary">"{searchQuery}"</span>
                                    <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-primary/10 rounded">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                {(priceRange[0] > 0 || priceRange[1] < 500) && (
                                  <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-sm flex items-center gap-2 border border-primary/20">
                                    <span className="font-medium text-primary">${priceRange[0]} - ${priceRange[1]}</span>
                                    <button onClick={() => setPriceRange([0, 500])} className="p-1 hover:bg-primary/10 rounded">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Apply Buttons */}
                          <div className="flex gap-3 pt-4">
                            <Button
                              variant="outline"
                              className="flex-1 h-14 text-base"
                              onClick={handleClearFilters}
                            >
                              <RefreshCw className="h-5 w-5 mr-2" />
                              Clear All
                            </Button>
                            <Button
                              className="flex-1 h-14 text-base bg-gradient-to-r from-primary to-accent"
                              onClick={() => setShowFilters(false)}
                            >
                              <Check className="h-5 w-5 mr-2" />
                              Apply Filters
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${viewMode}-${selectedCategory}-${sortBy}-${gen_random_string()}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sortedProducts.length > 0 ? (
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className={cn(
                        "grid gap-4 md:gap-6",
                        viewMode === "grid"
                          ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
                          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                      )}
                    >
                      {sortedProducts.map((product, index) => (
                        <motion.div key={`${product.id}-${gen_random_string()}`} variants={staggerItem}>
                          <ProductCard 
                            product={product} 
                            index={index}
                            compact={viewMode === "compact"}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-card to-card/50 rounded-3xl border border-border/50">
                      <div className="max-w-md mx-auto px-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Package className="h-12 w-12 text-primary/60" />
                        </div>
                        <h3 className="font-display text-2xl mb-3">No products found</h3>
                        <p className="text-muted-foreground mb-8">
                          Try adjusting your search or filter criteria to find what you're looking for.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={handleClearFilters}
                            className="gap-3 bg-gradient-to-r from-primary to-accent"
                          >
                            <RefreshCw className="h-5 w-5" />
                            Clear All Filters
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedCategory(null)}
                            className="gap-3"
                          >
                            View All Products
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;