import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Package, RefreshCw } from "lucide-react";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/products/CategoryCard";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await http.get("/get-public-categories/");
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data && Array.isArray(resp.data)) {
        setCategories(resp.data);
      } else {
        setError(resp.data || "Failed to fetch categories");
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setError(error.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-warm">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
                Shop by Category
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore our wide range of products carefully selected to meet everyday beauty needs and trending styles.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Skeleton loading cards */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-muted" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted/50 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 md:py-24 bg-gradient-warm">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
                Shop by Category
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore our wide range of products carefully selected to meet everyday beauty needs and trending styles.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Unable to Load Categories</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
            <Button onClick={fetchCategories} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gradient-warm">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
                Shop by Category
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore our wide range of products carefully selected to meet everyday beauty needs and trending styles.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-background/50 to-background/30 rounded-2xl border border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Categories Available</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              We're currently setting up our product categories. Please check back soon!
            </p>
            <Button variant="outline" onClick={fetchCategories} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-warm">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our wide range of products carefully selected to meet everyday beauty needs and trending styles.
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((category, index) => (
            <motion.div key={category.id} variants={staggerItem}>
              <CategoryCard category={category} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;