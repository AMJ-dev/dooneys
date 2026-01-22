import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2, Package, TrendingUp, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import UserContext from "@/lib/userContext";

const ProductsCarousel = () => {
  const { auth } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<"new" | "best">("new");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [new_products, setNewProducts] = useState([]);
  const [best_sellers, setBestSellers] = useState([]);
  const [display_products, setDisplayProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update display products when active tab changes
  useEffect(() => {
    const products = activeTab === "new" ? new_products : best_sellers;
    setDisplayProducts(products);
  }, [activeTab, new_products, best_sellers]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await http.post("/get-home-products/", {auth: auth?"1":"0"});
        const resp: ApiResp = res.data;

        if (!resp.error && resp.data) {
          setNewProducts(resp.data.new_products || []);
          setBestSellers(resp.data.best_sellers || []);
          
          // Set initial display products
          setDisplayProducts(resp.data.new_products || []);
        } else {
          setError(resp.data || "Failed to load products");
        }
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setError(error.message || "Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
                  New Arrivals & Best Sellers
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Discover our newest additions and customer favourites — products people keep coming back for.
                </p>
              </div>
            </div>
          </ScrollReveal>
          
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
                  New Arrivals & Best Sellers
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Discover our newest additions and customer favourites — products people keep coming back for.
                </p>
              </div>
            </div>
          </ScrollReveal>
          
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Unable to load products</h3>
            <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const hasProducts = display_products && display_products.length > 0;
  const hasNewProducts = new_products && new_products.length > 0;
  const hasBestSellers = best_sellers && best_sellers.length > 0;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
                New Arrivals & Best Sellers
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Discover our newest additions and customer favourites — products people keep coming back for.
              </p>
            </div>

            {(hasNewProducts || hasBestSellers) && (
              <div className="flex items-center gap-4">
                {/* Tab buttons */}
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("new")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "new"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    New Arrivals
                  </button>
                  <button
                    onClick={() => setActiveTab("best")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "best"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Best Sellers
                  </button>
                </div>

                {/* Navigation arrows - only show if current tab has products */}
                {hasProducts && (
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => scroll("left")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => scroll("right")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Products Carousel or Empty State */}
        {hasProducts ? (
          <div className="relative">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:-mx-0 md:px-0"
            >
              {display_products.map((product, index) => (
                <div key={product.id} className="flex-shrink-0 w-[260px] md:w-[280px]">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <ScrollReveal>
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border p-12 text-center">
              {activeTab === "new" ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No New Arrivals Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We're preparing some exciting new products for you. Check back soon for our latest additions!
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No Best Sellers Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Our customers haven't discovered their favourites yet. Be the first to rate our products!
                  </p>
                </>
              )}
              
              {/* Show alternative tab if current is empty */}
              {(activeTab === "new" && hasBestSellers) || 
               (activeTab === "best" && hasNewProducts) ? (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab(activeTab === "new" ? "best" : "new")}
                  className="gap-2"
                >
                  View {activeTab === "new" ? "Best Sellers" : "New Arrivals"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link to="/shop">
                    <Package className="h-4 w-4 mr-2" />
                    Browse All Products
                  </Link>
                </Button>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* View All Button - Only show if we have any products at all */}
        {(hasNewProducts || hasBestSellers) && (
          <ScrollReveal className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/shop" className="group">
                View All Products
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default ProductsCarousel;