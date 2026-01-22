import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Package, Tag, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format_currency, resolveSrc } from "@/lib/functions";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { str_to_url } from "@/lib/functions";

interface SearchResult {
  type: "product" | "category";
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    const fetchResults = async () => {
      try {
        const res = await http.post("/search-products/", { query }, { signal: controller.signal });
        const resp: ApiResp = res.data;
        
        if (!resp.error && resp.data && !controller.signal.aborted) {
          const formattedResults: SearchResult[] = resp.data.map((item: any) => {
            if (item.type === "product") {
              return {
                type: "product",
                id: item.id,
                title: item.name,
                subtitle: `${item.category_name} • ${format_currency(item.price)}`,
                image: item.image,
                url: `/product/${item.id}/${str_to_url(item.name)}`,
              };
            } else {
              return {
                type: "category",
                id: item.id,
                title: item.name,
                subtitle: "Browse category",
                url: `/category/${item.id}/${str_to_url(item.name)}`,
              };
            }
          });
          setResults(formattedResults);
          setSelectedIndex(0);
        }
      } catch (error: any) {
        if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
          console.error("Search error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
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
                  placeholder="Search products, categories..."
                  className="border-0 focus-visible:ring-0 text-lg p-0"
                />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {loading && query.trim() && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              )}

              {!loading && results.length > 0 && (
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
                            src={resolveSrc(result.image)}
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

              {!loading && query.trim() && results.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No results found for "{query}"
                  </p>
                </div>
              )}

              {/* {!query.trim() && (
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
              )} */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;