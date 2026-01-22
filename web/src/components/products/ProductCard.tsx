import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Eye, 
  Heart, 
  Star, 
  Sparkles, 
  Zap, 
  Clock,
  CheckCircle,
  Plus,
  Award,
  ShoppingCart,
  X,
  Minus,
  Plus as PlusIcon
} from "lucide-react";
import { Product, ProductVariant, ProductVariantOption } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useState, useContext, useEffect } from "react";
import { resolveSrc, format_currency } from "@/lib/functions";
import UserContext from "@/lib/userContext";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import {str_to_url, gen_random_string} from "@/lib/functions";

interface ProductCardProps {
  product: Product;
  index?: number;
  compact?: boolean;
  showQuickView?: boolean;
}

interface VariantDetails {
  type: string;
  value: string;
  priceModifier: number;
}

const ProductCard = ({ product, index = 0, compact = false, showQuickView = true }: ProductCardProps) => {
  const { auth } = useContext(UserContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [modalQuantity, setModalQuantity] = useState(1);
  const [variantPrice, setVariantPrice] = useState(product.price);

  const calculateVariantPrice = (basePrice: number, selectedVariants: Record<string, string>) => {
    if (!product.variants || !selectedVariants || product.variants.length === 0) return basePrice;
    
    let totalPrice = basePrice;
    
    product.variants.forEach((variant: ProductVariant) => {
      if (variant.type && selectedVariants[variant.type]) {
        const selectedOption = variant.options.find(
          (opt: ProductVariantOption) => opt.value === selectedVariants[variant.type]
        );
        if (selectedOption && selectedOption.price_modifier) {
          totalPrice += parseFloat(selectedOption.price_modifier);
        }
      }
    });
    
    return totalPrice;
  };

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const initialVariants: Record<string, string> = {};
      product.variants.forEach((variant: ProductVariant) => {
        if (variant.options && variant.options.length > 0) {
          initialVariants[variant.type] = variant.options[0].value;
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [product]);

  useEffect(() => {
    const newPrice = calculateVariantPrice(product.price, selectedVariants);
    setVariantPrice(newPrice);
  }, [selectedVariants, product.price]);

  const hasDiscount = product.originalPrice && product.originalPrice > variantPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - variantPrice) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (product.variants && product.variants.length > 0) {
      setShowVariantModal(true);
    } else {
      addToCart(product, 1, undefined, false);
    }
  };

  const handleAddToCartFromModal = () => {
    const variantDetails: VariantDetails[] = [];
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: ProductVariant) => {
        const selectedOption = variant.options.find(
          (opt: ProductVariantOption) => opt.value === selectedVariants[variant.type]
        );
        if (selectedOption) {
          variantDetails.push({
            type: variant.type,
            value: selectedOption.value,
            priceModifier: selectedOption.price_modifier 
              ? parseFloat(selectedOption.price_modifier) 
              : 0
          });
        }
      });
    }
    
    const success = addToCart(
      product, 
      modalQuantity, 
      selectedVariants,
      false
    );
    
    if (success) {
      setShowVariantModal(false);
      setModalQuantity(1);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await http.post("/toggle-wishlist/", {id: product.id})
      const resp: ApiResp = res.data;
      if(!resp.error && resp.data){
        if(resp.data.action == "removed"){
          toast({
            title: "Added to Wishlist",
            description: `${product.name} has been added to your wishlist.`,
          });
        }else{
          toast({
            title: "Removed from Wishlist",
            description: `${product.name} has been removed from your wishlist.`,
          });
        }
        return;
      }
    } catch (error) {
      
    }
  };

  const areAllVariantsSelected = () => {
    if (!product.variants || product.variants.length === 0) return true;
    return product.variants.every((variant: ProductVariant) => selectedVariants[variant.type]);
  };

  const handleBuyNow = () => {
    const variantDetails: VariantDetails[] = [];
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: ProductVariant) => {
        const selectedOption = variant.options.find(
          (opt: ProductVariantOption) => opt.value === selectedVariants[variant.type]
        );
        if (selectedOption) {
          variantDetails.push({
            type: variant.type,
            value: selectedOption.value,
            priceModifier: selectedOption.price_modifier 
              ? parseFloat(selectedOption.price_modifier) 
              : 0
          });
        }
      });
    }
    
    const success = addToCart(
      product, 
      modalQuantity, 
      selectedVariants,
      false
    );
    
    if (success) {
      navigate("/checkout");
      setShowVariantModal(false);
    }
  };

  const quickAddVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    tap: { scale: 0.95 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: { 
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={`${i}-${gen_random_string()}`}
            className={cn(
              "h-3 w-3 sm:h-3.5 sm:w-3.5",
              i < Math.floor(rating) 
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-muted/20 text-muted"
            )}
          />
        ))}
        <span className="text-xs sm:text-sm font-medium ml-1">{Number(rating).toFixed(1)}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
          className="group relative"
        >
          <Link
            to={`/product/${product.id}/${str_to_url(product.name)}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl sm:rounded-2xl"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 group-hover:border-primary/30 transition-all duration-300">
              <div className="relative h-full w-full overflow-hidden">
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 animate-pulse" />
                )}
                <motion.img
                  src={resolveSrc(product.image)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  variants={imageVariants}
                  whileHover="hover"
                  onLoad={() => setIsImageLoading(false)}
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
                {product.isNew && (
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm sm:shadow-md text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                    <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    New
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-sm sm:shadow-md text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                    <Zap className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    {discountPercent}%
                  </Badge>
                )}
              </div>

              <button
                onClick={handleToggleWishlist}
                className={cn(
                  "absolute top-2 sm:top-3 right-2 sm:right-3 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shadow-sm sm:shadow-md backdrop-blur-xs sm:backdrop-blur-sm transition-all duration-300",
                  "touch-manipulation",
                  product.is_wishlist == "1"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/60 text-foreground hover:bg-card"
                )}
                aria-label={product.is_wishlist == "1" ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={cn(
                    "h-3 w-3 sm:h-4 sm:w-4 transition-all",
                    product.is_wishlist == "1" && "fill-current"
                  )}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 sm:group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/95 to-transparent p-2 sm:p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-left">
                    <span className="font-display text-sm sm:text-base text-primary block">
                      {format_currency(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        {format_currency(product.originalPrice!)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 bg-gradient-to-r from-primary to-accent hover:shadow-md"
                    onClick={handleAddToCart}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Add</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
              <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-display text-sm sm:text-lg text-primary">
                    {format_currency(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                      {format_currency(product.originalPrice!)}
                    </span>
                  )}
                </div>
                {product.rating && (
                  <div className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] sm:text-xs font-medium">{Number(product.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>

        <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Select Options</span>
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
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={resolveSrc(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display text-lg text-primary">
                      {format_currency(variantPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        {format_currency(product.originalPrice!)}
                      </span>
                    )}
                    {product.variants && product.variants.length > 0 && variantPrice !== product.price && (
                      <span className="text-xs text-muted-foreground">
                        (Base: {format_currency(product.price)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {product.variants.map((variant: ProductVariant) => (
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
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                              selectedVariants[variant.type] === option.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
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

              <div>
                <label className="font-medium text-sm mb-3 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={modalQuantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(q => q + 1)}
                      className="p-3 hover:bg-muted transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.inStock ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" /> In Stock
                      </span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={handleAddToCartFromModal}
                  disabled={!areAllVariantsSelected() || !product.inStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={!areAllVariantsSelected() || !product.inStock}
                >
                  Buy Now
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowVariantModal(false);
                  navigate(`/product/${product.id}/${str_to_url(product.name)}`);
                }}
              >
                View Full Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        className="group relative"
      >
        <Link
          to={`/product/${product.id}/${str_to_url(product.name)}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl lg:rounded-3xl"
          aria-label={`View ${product.name} - ${format_currency(product.price)}`}
        >
          <div className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-gradient-to-br from-card to-card/80 shadow-sm sm:shadow-soft border border-border/30 group-hover:shadow-card-hover group-hover:border-primary/20 transition-all duration-300">
            
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5">
              {isImageLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 animate-pulse" />
              )}
              <motion.img
                src={resolveSrc(product.image)}
                alt={product.name}
                className="h-full w-full object-cover"
                variants={imageVariants}
                whileHover="hover"
                onLoad={() => setIsImageLoading(false)}
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent lg:hidden" />

              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                {product.isNew && (
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm sm:shadow-md text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden xs:inline">New</span>
                    <span className="xs:hidden">N</span>
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-sm sm:shadow-md text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                    <Zap className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">{discountPercent}% OFF</span>
                    <span className="sm:hidden">-{discountPercent}%</span>
                  </Badge>
                )}
                {product.isBestSeller && !product.isNew && (
                  <Badge className="bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-sm sm:shadow-md text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                    <Award className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Best</span>
                  </Badge>
                )}
              </div>

              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1 sm:gap-2">
                {
                  auth && (
                    <button
                      onClick={handleToggleWishlist}
                      className={cn(
                        "h-8 w-8 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shadow-sm sm:shadow-md backdrop-blur-xs sm:backdrop-blur-sm transition-all duration-300",
                        "touch-manipulation",
                        product.is_wishlist == "1"
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                          : "bg-card/60 text-foreground hover:bg-card/80"
                      )}
                      aria-label={product.is_wishlist == "1" ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 transition-all",
                          product.is_wishlist == "1" && "fill-current"
                        )}
                      />
                    </button>
                  )
                }
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-2 sm:p-3 lg:p-4 opacity-0 lg:group-hover:opacity-100 lg:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-between text-card/90">
                  <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                    {product.inStock && (
                      <div className="flex items-center gap-1 bg-card/20 backdrop-blur-xs px-2 py-1 rounded-full whitespace-nowrap">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="text-[10px] sm:text-xs font-medium">In Stock</span>
                      </div>
                    )}
                  </div>
                  {product.stock === "low" && (
                    <div className="flex items-center gap-1 bg-card/20 backdrop-blur-xs px-2 py-1 rounded-full whitespace-nowrap">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="text-[10px] sm:text-xs font-medium">Low Stock</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={cn(
                  "absolute bottom-3 right-3 h-9 w-9 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 border",
                  "bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary/20",
                  "lg:opacity-0 lg:group-hover:opacity-100"
                )}
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                {product.rating && (
                  <div className="hidden sm:flex items-center">
                    {renderStars(Number(product.rating))}
                  </div>
                )}
              </div>

              <h3 className="font-display text-sm sm:text-lg lg:text-xl font-medium mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                {product.name}
              </h3>

              {product.description && (
                <p className="hidden sm:block text-sm text-muted-foreground mb-3 lg:mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-border/30">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-lg sm:text-xl lg:text-2xl text-primary">
                      {format_currency(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs sm:text-sm text-muted-foreground line-through">
                        {format_currency(product.originalPrice!)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -inset-1 rounded-xl lg:rounded-3xl bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </Link>
      </motion.div>

      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Select Options</span>
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
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={resolveSrc(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-lg text-primary">
                    {format_currency(variantPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-muted-foreground line-through">
                      {format_currency(product.originalPrice!)}
                    </span>
                  )}
                  {product.variants && product.variants.length > 0 && variantPrice !== product.price && (
                    <span className="text-xs text-muted-foreground">
                      (Base: {format_currency(product.price)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants.map((variant: ProductVariant) => (
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
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                            selectedVariants[variant.type] === option.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
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

            <div>
              <label className="font-medium text-sm mb-3 block">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                    disabled={modalQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{modalQuantity}</span>
                  <button
                    onClick={() => setModalQuantity(q => q + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.inStock ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" /> In Stock
                    </span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1"
                onClick={handleAddToCartFromModal}
                disabled={!areAllVariantsSelected() || !product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={!areAllVariantsSelected() || !product.inStock}
              >
                Buy Now
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowVariantModal(false);
                navigate(`/product/${product.id}/${str_to_url(product.name)}`);
              }}
            >
              View Full Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;