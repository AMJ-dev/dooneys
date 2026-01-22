import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/ui/motion";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { gen_random_string } from "@/lib/functions";
import UserContext from "@/lib/userContext";

const tabs = [
  { id: "new", name: "New Arrivals", icon: Sparkles },
  { id: "best", name: "Best Sellers", icon: TrendingUp },
];

const Deals = () => {
  const { auth } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("new");

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
        const res = await http.post("/get-deal-products/", {auth: auth?"1":"0"});
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
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-warm">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Deals & New
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                Save More on Your Favourite Products
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Browse our latest arrivals, popular items, and special offers available for a limited time.
                All items can be ordered online or reserved for in-store viewing by appointment.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 md:py-16">
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {tabs.map((tab) => (
                <motion.button
                  key={`${tab.id}-${gen_random_string()}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </motion.button>
              ))}
            </div>
          </ScrollReveal>

          {/* Products Grid */}
          <motion.div
            key={`${activeTab}-${gen_random_string()}`}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {display_products.map((product, index) => (
              <motion.div key={`${product.id}-${gen_random_string()}`} variants={staggerItem}>
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>

          {display_products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No products in this category right now.
              </p>
              <Button asChild>
                <Link to="/shop">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Bundle Offers CTA */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl text-secondary-foreground mb-4">
                Bundle & Save
              </h2>
              <p className="text-secondary-foreground/80 mb-8">
                Get more value when you purchase our carefully curated product bundles.
                Perfect for complete hair care routines or gift sets.
              </p>
              <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary" asChild>
                <Link to="/shop">View Bundle Offers</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Deals;
