import { useState, useEffect, useContext, startTransition } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/ui/motion";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutGrid, ChevronRight, Badge } from "lucide-react";
import { Link } from "react-router-dom";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { resolveSrc, gen_random_string, format_currency } from "@/lib/functions";
import userContext from "@/lib/userContext";

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  sub_categories?: SubCategory[];
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  status: "active" | "inactive";
}

interface CategoryFromList {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
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

interface ApiResponse {
  error: boolean;
  data: {
    store_gst: string;
    category: CategoryData;
    products: Product[];
    categories: CategoryFromList[];
  };
}

const Category = () => {
  const { auth } = useContext(userContext);
  const { id, slug } = useParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [categories, setCategories] = useState<CategoryFromList[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchShop();
  }, [id, auth]);

  const fetchShop = async () => {
    setLoading(true);
    try {
      const res = await http.post("/get-store-products/", {
        cat_id: id,
        auth: auth ? "1" : "0"
      });
      
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        const data = resp.data as ApiResponse['data'];
        setCategory(data.category);
        setCategories(data.categories);
        setProducts(data.products);
        
        // Reset subcategory filter when category changes
        setActiveSubCategory(null);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters when category changes
  useEffect(() => {
    setSearchQuery("");
    setPriceRange([0, 500]);
    setActiveSubCategory(null);
  }, [id]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    // Subcategory filter (if active)
    let matchesSubCategory = true;
    if (activeSubCategory) {
      // This assumes products have a sub_category_id or sub_category field
      // You'll need to adjust this based on your actual product data structure
      matchesSubCategory = (product as any).sub_category_id === activeSubCategory;
    }
    
    return matchesSearch && matchesPrice && matchesSubCategory;
  });

  // Get active subcategories (only active status)
  const activeSubCategories = category?.sub_categories?.filter(
    sub => sub.status === "active"
  ) || [];

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mx-auto mb-4"></div>
            <div className="h-4 w-96 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/shop">Browse All Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={resolveSrc(category.image)}
            alt={category.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-card/70 text-sm mb-4"
            >
              <Link to="/" className="hover:text-card transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/shop" className="hover:text-card transition-colors">Shop</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-card">{category.name}</span>
            </motion.nav>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-card mb-4"
            >
              {category.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-card/90 text-lg md:text-xl mb-6"
            >
              {category.description}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="sticky top-32 space-y-8">
                {/* Search */}
                <div>
                  <label className="font-medium mb-3 block">Search in {category.name}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Sub Categories */}
                {activeSubCategories.length > 0 && (
                  <div>
                    <label className="font-medium mb-3 block flex items-center gap-2">
                      <span>Sub Categories</span>
                      {activeSubCategory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveSubCategory(null)}
                          className="h-6 px-2 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </label>
                    <div className="space-y-1">
                      <Link
                        to={`/category/${category.id}/${category.slug}`}
                        onClick={() => setActiveSubCategory(null)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          !activeSubCategory
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All {category.name}
                      </Link>
                      {activeSubCategories.map((sub) => (
                        <button
                          key={`${sub.id}-${gen_random_string()}`}
                          onClick={() => startTransition(() => {
                            navigate(`/subcategory/${sub.id}/${sub.slug}`);
                          })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeSubCategory === sub.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                    
                    {/* Subcategory count badge */}
                    {activeSubCategory && (
                      <div className="mt-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Showing products in subcategory
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <label className="font-medium mb-3 block">Price Range</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    step={10}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{format_currency(priceRange[0])}</span>
                    <span className="text-muted-foreground">{format_currency(priceRange[1])}</span>
                  </div>
                  {(priceRange[0] > 0 || priceRange[1] < 500) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPriceRange([0, 500])}
                      className="mt-2 w-full text-xs"
                    >
                      Reset Price
                    </Button>
                  )}
                </div>

                {/* Category Stats */}
                <div className="pt-4 border-t">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Products:</span>
                      <span className="font-medium">{products.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filtered:</span>
                      <span className="font-medium">{filteredProducts.length}</span>
                    </div>
                    {activeSubCategories.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subcategories:</span>
                        <span className="font-medium">{activeSubCategories.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Top bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">
                    Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
                  </p>
                  {activeSubCategory && (
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">
                      {activeSubCategories.find(s => s.id === activeSubCategory)?.name}
                      <button
                        onClick={() => setActiveSubCategory(null)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Mobile filter toggle */}
                  <Button
                    variant="outline"
                    className="lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  {/* View mode toggle */}
                  <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid" 
                          ? "bg-background shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "compact" 
                          ? "bg-background shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="lg:hidden mb-6 overflow-hidden"
                  >
                    <div className="p-4 bg-muted rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Filters</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Mobile Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Mobile Subcategories */}
                      {activeSubCategories.length > 0 && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Sub Categories</label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant={!activeSubCategory ? "default" : "outline"}
                              size="sm"
                              onClick={() => setActiveSubCategory(null)}
                              className="text-xs"
                            >
                              All
                            </Button>
                            {activeSubCategories.map((sub) => (
                              <Button
                                key={`mobile-${sub.id}`}
                                variant={activeSubCategory === sub.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveSubCategory(sub.id)}
                                className="text-xs"
                              >
                                {sub.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mobile Price Range */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Price Range</label>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={500}
                          step={10}
                          className="mb-2"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{format_currency(priceRange[0])}</span>
                          <span>{format_currency(priceRange[1])}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Grid */}
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
                    <motion.div key={`${product.id}-${gen_random_string()}`} variants={staggerItem}>
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-xl mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || activeSubCategory || priceRange[0] > 0 || priceRange[1] < 500
                        ? "Try adjusting your filters to find what you're looking for."
                        : "This category doesn't have any products yet."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {(searchQuery || activeSubCategory || priceRange[0] > 0 || priceRange[1] < 500) && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setActiveSubCategory(null);
                            setPriceRange([0, 500]);
                          }}
                        >
                          Clear All Filters
                        </Button>
                      )}
                      <Button asChild>
                        <Link to="/shop">Browse All Products</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories */}
      {categories.length > 0 && (
        <ScrollReveal>
          <section className="py-12 bg-muted/30">
            <div className="container">
              <h2 className="font-display text-2xl md:text-3xl mb-8 text-center">
                Explore More Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories
                  .filter(c => c.id !== category.id)
                  .slice(0, 4)
                  .map((cat, index) => (
                    <motion.div
                      key={`${cat.id}-${gen_random_string()}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        to={`/category/${cat.id}/${cat.slug}`}
                        className="group relative block aspect-[4/3] rounded-xl overflow-hidden"
                      >
                        <img
                          src={resolveSrc(cat.image)}
                          alt={cat.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-card font-display text-lg">{cat.name}</h3>
                          <p className="text-card/70 text-sm mt-1">
                            {cat.product_count} products
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}
    </Layout>
  );
};

export default Category;