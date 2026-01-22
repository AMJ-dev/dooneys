import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, AlertCircle, Star, Sparkles, X, Minus, Plus, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp, Product, ProductVariant, ProductVariantOption } from "@/lib/types";
import { format_currency, resolveSrc, str_to_url, gen_random_string } from "@/lib/functions";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

const WishlistPage = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    get_wishlist();
  }, []);

  const get_wishlist = async () => {
    try {
      setLoading(true);
      const res = await http.get("/get-wishlist/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setItems(resp.data);
      } else {
        toast.error(resp.data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your wishlist?`)) {
      try {
        const res = await http.post("/delete-wishlist/", { id });
        const resp: ApiResp = res.data;
        if (!resp.error && resp.data) {
          setItems(items.filter(item => item.id !== id));
          toast.success("Item removed from wishlist");
        } else {
          toast.error(resp.data);
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Failed to remove item");
      }
    }
  };

  const clear_wishlist = async () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      try {
        const res = await http.post("/clear-wishlist/")
        const resp: ApiResp = res.data;
        if (!resp.error && resp.data) {
          setItems([]);
          toast.success("Wishlist cleared");
        } else {
          toast.error(resp.data);
        }
      } catch (error) {
        console.error("Error clearing wishlist:", error);
        toast.error("Failed to clear wishlist");
      }
    }
  }

  const handleAddToCartClick = (item: Product) => {
    setSelectedItem(item);
    // Initialize selected variants if item has variants
    if (item.variants && item.variants.length > 0) {
      const initialVariants: Record<string, string> = {};
      item.variants.forEach((variant: ProductVariant) => {
        if (variant.options && variant.options.length > 0) {
          initialVariants[variant.type] = variant.options[0].value;
        }
      });
      setSelectedVariants(initialVariants);
    } else {
      setSelectedVariants({});
    }
    setQuantity(1);
    setShowVariantModal(true);
  };

  const handleAddToCartConfirm = () => {
    if (!selectedItem) return;

    setAddingToCart(true);
    try {
      // Prepare variant details
      const variantDetails: Array<{ type: string, value: string, priceModifier: number }> = [];
      if (selectedItem.variants && selectedItem.variants.length > 0) {
        selectedItem.variants.forEach((variant: ProductVariant) => {
          const selectedValue = selectedVariants[variant.type];
          const selectedOption = variant.options?.find(
            (opt: ProductVariantOption) => opt.value === selectedValue
          );
          if (selectedOption) {
            variantDetails.push({
              type: variant.type,
              value: selectedOption.value,
              priceModifier: parseFloat(selectedOption.price_modifier || "0")
            });
          }
        });
      }

      // Calculate if variants are required
      const requireVariants = selectedItem.variants && selectedItem.variants.length > 0;
      const success = addToCart(selectedItem, quantity, selectedVariants, variantDetails, requireVariants);

      if (success) {
        toast.success(`${selectedItem.name} has been added to your cart!`);
        setShowVariantModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedItem) return;

    setAddingToCart(true);
    try {
      // Prepare variant details
      const variantDetails: Array<{ type: string, value: string, priceModifier: number }> = [];
      if (selectedItem.variants && selectedItem.variants.length > 0) {
        selectedItem.variants.forEach((variant: ProductVariant) => {
          const selectedValue = selectedVariants[variant.type];
          const selectedOption = variant.options?.find(
            (opt: ProductVariantOption) => opt.value === selectedValue
          );
          if (selectedOption) {
            variantDetails.push({
              type: variant.type,
              value: selectedOption.value,
              priceModifier: parseFloat(selectedOption.price_modifier || "0")
            });
          }
        });
      }

      // Calculate if variants are required
      const requireVariants = selectedItem.variants && selectedItem.variants.length > 0;
      const success = addToCart(selectedItem, quantity, selectedVariants, variantDetails, requireVariants);

      if (success) {
        toast.success(`${selectedItem.name} has been added to your cart!`);
        setShowVariantModal(false);
        setSelectedItem(null);
        // Navigate to checkout
        window.location.href = "/checkout";
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const areAllVariantsSelected = () => {
    if (!selectedItem?.variants || selectedItem.variants.length === 0) return true;
    return selectedItem.variants.every((variant: ProductVariant) => selectedVariants[variant.type]);
  };

  const calculateVariantPrice = (item: Product, variants: Record<string, string>) => {
    let price = item.price;
    
    if (item.variants && item.variants.length > 0) {
      item.variants.forEach((variant: ProductVariant) => {
        if (variant.type && variants[variant.type]) {
          const selectedValue = variants[variant.type];
          const selectedOption = variant.options?.find(
            (opt: ProductVariantOption) => opt.value === selectedValue
          );
          if (selectedOption && selectedOption.price_modifier) {
            price += parseFloat(selectedOption.price_modifier);
          }
        }
      });
    }
    
    return price;
  };

  const getDiscountPercent = (item: Product) => {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  };

  // Calculate current variant price for selected item
  const currentVariantPrice = selectedItem ? calculateVariantPrice(selectedItem, selectedVariants) : 0;
  const hasDiscount = selectedItem?.originalPrice && selectedItem.originalPrice > currentVariantPrice;
  const discountPercent = hasDiscount && selectedItem?.originalPrice
    ? Math.round(((selectedItem.originalPrice - currentVariantPrice) / selectedItem.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center gap-3 mb-2"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            My <span className="text-gradient">Wishlist</span>
          </h1>
        </motion.div>
        <p className="text-muted-foreground">
          {items.length === 0
            ? "Save your favorite beauty essentials for later"
            : `You have ${items.length} item${items.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="relative inline-block mb-6">
            <Heart className="h-20 w-20 text-muted-foreground/40" />
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-2xl" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Save items you love to create your personalized beauty collection
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-accent">
            <Link to="/products">
              Explore Products
            </Link>
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((item, index) => {
                const discountPercent = getDiscountPercent(item);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="relative bg-card rounded-2xl overflow-hidden border border-border/30 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300">
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5">
                        <Link to={`/product/${item.id}/${str_to_url(item.name)}`} className="block">
                          <img
                            src={resolveSrc(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {item.isNew && (
                            <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-md text-xs px-2 py-1">
                              <Sparkles className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          )}
                          {discountPercent > 0 && (
                            <Badge className="bg-gradient-to-r from-destructive to-destructive/90 text-white shadow-md text-xs px-2 py-1">
                              -{discountPercent}%
                            </Badge>
                          )}
                          {!item.inStock && (
                            <Badge variant="secondary" className="bg-white/95 text-foreground shadow-md text-xs px-2 py-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:text-white hover:scale-110"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        {/* Quick View Button */}
                        <Link
                          to={`/product/${item.id}/${str_to_url(item.name)}`}
                          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110"
                          aria-label="View product"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="mb-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>

                        <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/product/${item.id}/${str_to_url(item.name)}`}>
                            {item.name}
                          </Link>
                        </h3>

                        {/* Rating */}
                        {item.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={`${i}-${gen_random_string()}`}
                                  className={cn(
                                    "h-3 w-3",
                                    i < Math.floor(Number(item.rating))
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-muted/20 text-muted"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">
                              {Number(item.rating).toFixed(1)}
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="font-display text-lg text-primary">
                            {format_currency(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {format_currency(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-md transition-all"
                          size="sm"
                          disabled={!item.inStock}
                          onClick={() => handleAddToCartClick(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {item.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>

                        {/* Stock Status */}
                        {item.stock === "low" && item.inStock && (
                          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Low Stock
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Clear All Button */}
          {items.length > 0 && (
            <div className="text-center pt-8">
              <Button
                variant="outline"
                onClick={clear_wishlist}
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Items
              </Button>
            </div>
          )}
        </>
      )}

      {/* Variant Selection Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Add to Cart</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVariantModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-muted/20 to-muted/5">
                  <img
                    src={resolveSrc(selectedItem.image)}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">{selectedItem.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display text-lg text-primary">
                      {format_currency(currentVariantPrice)}
                    </span>
                    {selectedItem.originalPrice && selectedItem.originalPrice > currentVariantPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {format_currency(selectedItem.originalPrice)}
                      </span>
                    )}
                    {selectedItem.variants && selectedItem.variants.length > 0 && currentVariantPrice !== selectedItem.price && (
                      <span className="text-xs text-muted-foreground">
                        (Base: {format_currency(selectedItem.price)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Variant Selection */}
              {selectedItem.variants && selectedItem.variants.length > 0 && (
                <div className="space-y-4">
                  {selectedItem.variants.map((variant: ProductVariant) => (
                    <div key={`${variant.type}-${gen_random_string()}`}>
                      <label className="font-medium text-sm mb-2 block">{variant.type}</label>
                      <div className="flex flex-wrap gap-2">
                        {variant.options && variant.options.map((option: ProductVariantOption) => (
                          <button
                            key={`${option.value}-${gen_random_string()}`}
                            onClick={() => setSelectedVariants(prev => ({
                              ...prev,
                              [variant.type]: option.value
                            }))}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2",
                              "hover:border-primary/50 hover:scale-105",
                              selectedVariants[variant.type] === option.value
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-border"
                            )}
                          >
                            {option.value}
                            {option.price_modifier && (
                              <span className="text-xs opacity-75">
                                {parseFloat(option.price_modifier) > 0
                                  ? `+${format_currency(parseFloat(option.price_modifier))}`
                                  : format_currency(parseFloat(option.price_modifier))}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className="font-medium text-sm mb-3 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-muted transition-colors disabled:opacity-50 rounded-l-lg"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-3 hover:bg-muted transition-colors rounded-r-lg"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm">
                    {selectedItem.inStock ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" /> In Stock
                      </span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Variant Selection Warning */}
              {selectedItem.variants && selectedItem.variants.length > 0 && !areAllVariantsSelected() && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please select all available variants before adding to cart
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                  onClick={handleAddToCartConfirm}
                  disabled={!areAllVariantsSelected() || !selectedItem.inStock || addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={!areAllVariantsSelected() || !selectedItem.inStock || addingToCart}
                >
                  Buy Now
                </Button>
              </div>

              {/* View Details Button */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowVariantModal(false);
                }}
                asChild
              >
                <Link to={`/product/${selectedItem.id}/${str_to_url(selectedItem.name)}`}>
                  View Full Details
                </Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WishlistPage;