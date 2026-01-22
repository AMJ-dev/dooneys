import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Package, Tag, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/data/products";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "product" | "category" | "page";
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

const pages = [
  { id: "home", title: "Home", url: "/" },
  { id: "shop", title: "Shop All Products", url: "/shop" },
  { id: "deals", title: "Deals & New Arrivals", url: "/deals" },
  { id: "about", title: "About Us", url: "/about" },
  { id: "contact", title: "Contact & Appointments", url: "/contact" },
  { id: "cart", title: "Shopping Cart", url: "/cart" },
  { id: "account", title: "My Account", url: "/account" },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search products
    products.forEach((product) => {
      if (
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          type: "product",
          id: product.id,
          title: product.name,
          subtitle: `${product.category} • $${product.price.toFixed(2)}`,
          image: product.image,
          url: `/product/${product.id}`,
        });
      }
    });

    // Search categories
    categories.forEach((category) => {
      if (category.name.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: "category",
          id: category.id,
          title: category.name,
          subtitle: "Browse category",
          url: `/category/${category.slug}`,
        });
      }
    });

    // Search pages
    pages.forEach((page) => {
      if (page.title.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: "page",
          id: page.id,
          title: page.title,
          subtitle: "Page",
          url: page.url,
        });
      }
    });

    setResults(searchResults.slice(0, 10));
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].url);
      onClose();
      setQuery("");
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
    setQuery("");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "product":
        return Package;
      case "category":
        return Tag;
      default:
        return FileText;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-background rounded-2xl shadow-elevated overflow-hidden border border-border">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, categories, pages..."
                  className="border-0 focus-visible:ring-0 text-lg p-0"
                />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {results.length > 0 && (
                <div className="max-h-[400px] overflow-auto p-2">
                  {results.map((result, index) => {
                    const Icon = getIcon(result.type);
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          "w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors",
                          index === selectedIndex
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        {result.image ? (
                          <img
                            src={result.image}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-sm text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}

              {query && results.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No results found for "{query}"
                  </p>
                </div>
              )}

              {!query && (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Quick links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Wigs", "Braids", "Skin Care", "Tools"].map((term) => (
                      <Button
                        key={term}
                        variant="secondary"
                        size="sm"
                        onClick={() => setQuery(term)}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
