import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/ui/motion";
import { categoryData, getCategoryBySlug } from "@/data/categories";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutGrid, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { resolveSrc, gen_random_string } from "@/lib/functions";
import userContext from "@/lib/userContext";

const Category = () => {
  const {auth} = useContext(userContext)
  const { id, slug } = useParams();
  const category = getCategoryBySlug(slug || "");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShop()
  }, []);

  const fetchShop = async () => {
    try {
      const res = await http.post("/get-store-products/", {cat_id: id, auth: auth?"1":"0"});
      const resp:ApiResp = res.data;
      if (!resp.error && resp.data) {
        setCategories(resp.data.categories);
        setProducts(resp.data.products);
      }
    } catch (error) {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters when category changes
  useEffect(() => {
    setSearchQuery("");
    setPriceRange([0, 500]);
  }, [slug]);

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

  // Filter products by category name matching
  const categoryProducts = products.filter(
    product => product.category.toLowerCase() === category.name.toLowerCase() ||
    product.category.toLowerCase().includes(category.id.toLowerCase())
  );

  const filteredProducts = categoryProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={category.image}
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

                {/* Browse Other Categories */}
                <div>
                  <label className="font-medium mb-3 block">Other Categories</label>
                  <div className="space-y-1">
                    {categoryData
                      .filter(c => c.id !== category.id)
                      .slice(0, 5)
                      .map((cat) => (
                        <Link
                          key={`${cat.id}-${gen_random_string()}`}
                          to={`/category/${cat.slug}`}
                          className="block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {cat.name}
                        </Link>
                      ))}
                  </div>
                </div>

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
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
                </p>
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
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-2 rounded ${viewMode === "compact" ? "bg-background shadow-sm" : ""}`}
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
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
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
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-2 md:grid-cols-4"
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div key={`${product.id}-${gen_random_string()}`} variants={staggerItem}>
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-2">No products found in this category.</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Try adjusting your filters or browse other categories.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" onClick={() => {
                      setSearchQuery("");
                      setPriceRange([0, 500]);
                    }}>
                      Clear Filters
                    </Button>
                    <Button asChild>
                      <Link to="/shop">Browse All Products</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories */}
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
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </Layout>
  );
};

export default Category;
