import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Store,
  ChevronLeft,  
  ChevronRight,
  Check,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { ApiResp, Product, GalleryImage, ProductFeature } from "@/lib/types";
import { http } from "@/lib/httpClient";
import { toast } from "sonner";
import { format_currency, resolveSrc, str_to_url, gen_random_string } from "@/lib/functions";
import UserContext from "@/lib/userContext";

// Define interfaces for the API response structure
interface VariantOption {
  id: number;
  value: string;
  price_modifier: string;
  sort_order: number;
}

interface ProductVariant {
  id: number;
  type: string;
  options: VariantOption[];
}

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  category_id: number;
  price: string;
  original_price: string;
  sku: string;
  status: string;
  is_best_seller: number;
  is_new: number;
  in_stock: number;
  manage_stock: number;
  stock_quantity: number;
  low_stock_alert: number;
  weight: string | null;
  item_width: number | string | null;
  item_height: number | string | null;
  item_depth: number | string | null;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_slug: string;
  gallery: GalleryImage[];
  features: ProductFeature[];
  variants: ProductVariant[];
  is_wishlist?: string;
}

const ProductDetail = () => {
  const {auth} = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [variantDetails, setVariantDetails] = useState<Array<{type: string, value: string, priceModifier: number}>>([]);
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [allVariantsSelected, setAllVariantsSelected] = useState(false);
  const [variantPrice, setVariantPrice] = useState<number>(0);

  const calculateVariantPrice = (basePrice: number, variants: Record<string, string>) => {
    if (!product?.variants || !variants || Object.keys(variants).length === 0) {
      return basePrice;
    }
    
    let totalPrice = basePrice;
    const details: Array<{type: string, value: string, priceModifier: number}> = [];
    
    product.variants.forEach((variant) => {
      if (variant.type && variants[variant.type]) {
        const selectedValue = variants[variant.type];
        const selectedOption = variant.options?.find(
          (opt) => opt.value === selectedValue  // Compare opt.value (string) with selectedValue (string)
        );
        if (selectedOption) {
          const priceModifier = parseFloat(selectedOption.price_modifier || "0");
          totalPrice += priceModifier;
          details.push({
            type: variant.type,
            value: selectedOption.value,
            priceModifier: priceModifier
          });
        }
      }
    });
    
    setVariantDetails(details);
    return totalPrice;
  };

  // Update variant price when selected variants change
  useEffect(() => {
    if (product) {
      const newPrice = calculateVariantPrice(product.price, selectedVariants);
      setVariantPrice(newPrice);
    }
  }, [selectedVariants, product]);

  // Transform API product to our Product type
  const transformProduct = (apiProduct: ApiProduct): Product => {
    const mainImage = apiProduct.gallery.length > 0 
      ? resolveSrc(apiProduct.gallery[0].image) 
      : "/placeholder.jpg";
    
    const galleryImages = apiProduct.gallery.map((img: GalleryImage) => resolveSrc(img.image));
    
    const features = apiProduct.features
      .sort((a: ProductFeature, b: ProductFeature) => a.sort_order - b.sort_order)
      .map((f: ProductFeature) => f.feature);

    // Convert variants to the format expected by Product type
    const productVariants = apiProduct.variants?.map((variant: ProductVariant) => ({
      type: variant.type,
      options: variant.options.map((opt: VariantOption) => ({
        value: opt.value,
        price_modifier: opt.price_modifier
      }))
    })) || [];

    // Initialize selected variants with first option of each variant type
    const initialSelectedVariants: Record<string, string> = {};
    const initialVariantDetails: Array<{type: string, value: string, priceModifier: number}> = [];
    
    if (productVariants.length > 0) {
      productVariants.forEach((variant) => {
        if (variant.options && variant.options.length > 0) {
          const firstOption = variant.options[0];
          initialSelectedVariants[variant.type] = firstOption.value;
          const priceModifier = parseFloat(firstOption.price_modifier || "0");
          initialVariantDetails.push({
            type: variant.type,
            value: firstOption.value,
            priceModifier: priceModifier
          });
        }
      });
    }

    // Set initial selected variants and details
    setSelectedVariants(initialSelectedVariants);
    setVariantDetails(initialVariantDetails);
    
    // Check if all variants are initially selected
    const initiallyAllSelected = productVariants.every(variant => 
      initialSelectedVariants[variant.type] !== undefined
    );
    setAllVariantsSelected(initiallyAllSelected);

    // Calculate initial variant price
    const basePrice = parseFloat(apiProduct.price);
    const initialVariantPrice = basePrice + initialVariantDetails.reduce((sum, detail) => sum + detail.priceModifier, 0);
    setVariantPrice(initialVariantPrice);

    return {
      id: apiProduct.id.toString(),
      name: apiProduct.name,
      slug: str_to_url(apiProduct.name),
      category_id: apiProduct.category_id,
      category_slug: apiProduct.category_slug,
      category: apiProduct.category_name,
      description: apiProduct.description,
      price: basePrice,
      originalPrice: apiProduct.original_price ? parseFloat(apiProduct.original_price) : null,
      image: mainImage,
      gallery: galleryImages,
      features: features,
      isNew: apiProduct.is_new === 1,
      isBestSeller: apiProduct.is_best_seller === 1,
      inStock: apiProduct.in_stock === 1,
      is_wishlist: apiProduct.is_wishlist ? "1" : "0",
      createdAt: apiProduct.created_at,
      weight: apiProduct.weight,
      item_width: apiProduct.item_width,
      item_height: apiProduct.item_height,
      item_depth: apiProduct.item_depth,
      stockQuantity: apiProduct.stock_quantity,
      lowStockAlert: apiProduct.low_stock_alert,
      sku: apiProduct.sku,
      variants: productVariants,
    };
  };

  // Update allVariantsSelected when selectedVariants changes
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const allSelected = product.variants.every(variant => 
        selectedVariants[variant.type] !== undefined && selectedVariants[variant.type] !== ""
      );
      setAllVariantsSelected(allSelected);
    } else {
      // If no variants, it's always considered "selected"
      setAllVariantsSelected(true);
    }
  }, [selectedVariants, product]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    try {
      setTogglingWishlist(true);
      const res = await http.post("/toggle-wishlist/", { id: product.id, auth: auth?"1":"0" });
      const resp: ApiResp = res.data;
      
      if (!resp.error) {
        // Update local product state
        setProduct(prev => prev ? {
          ...prev,
          is_wishlist: prev.is_wishlist === "1" ? "0" : "1"
        } : null);
        
        if (resp.data?.action === "added") {
          toast.success(`${product.name} has been added to your wishlist.`);
        } else if (resp.data?.action === "removed") {
          toast.success(`${product.name} has been removed from your wishlist.`);
        }
      } else {
        toast.error(resp.data || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if product has variants and all are selected
    if (product.variants && product.variants.length > 0 && !allVariantsSelected) {
      toast.error("Please select all available variants before adding to cart");
      return;
    }
    
    // From product detail page, variants are NOT required if product has no variants
    const requireVariants = product.variants && product.variants.length > 0;
    const success = addToCart(product, quantity, selectedVariants, requireVariants);
    
    if (success) {
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Check if product has variants and all are selected
    if (product.variants && product.variants.length > 0 && !allVariantsSelected) {
      toast.error("Please select all available variants before adding to cart");
      return;
    }
    
    // From product detail page, variants are NOT required if product has no variants
    const requireVariants = product.variants && product.variants.length > 0;
    const success = addToCart(product, quantity, selectedVariants, requireVariants);
    
    if (success) {
      navigate("/checkout");
    }
  };

  // Handle variant selection
  const handleVariantSelect = (variantType: string, optionValue: string, priceModifier: number) => {
    setSelectedVariants(prev => ({ ...prev, [variantType]: optionValue }));
    
    // Update variant details
    setVariantDetails(prev => {
      const newDetails = prev.filter(detail => detail.type !== variantType);
      newDetails.push({ type: variantType, value: optionValue, priceModifier });
      return newDetails;
    });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await http.get(`/get-product/${id}/`);
        const resp: ApiResp = res.data;
        
        if (!resp.error && resp.data) {
          const apiProduct = resp.data as ApiProduct;
          const transformedProduct = transformProduct(apiProduct);
          setProduct(transformedProduct);
        } else {
          toast.error(resp.data || "Product not found");
          navigate("/shop");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={`${i}-${gen_random_string()}`} className="w-20 h-20 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-8 w-64 bg-muted rounded animate-pulse" />
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={`${i}-${gen_random_string()}`} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-medium mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Use gallery images if available, otherwise use main image multiple times
  const images = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image, product.image, product.image];

  const hasDiscount = product.originalPrice && product.originalPrice > variantPrice;
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - variantPrice) / product.originalPrice) * 100)
    : 0;

  // Check if product is disabled for cart
  const isCartDisabled = !product.inStock || 
    (product.variants && product.variants.length > 0 && !allVariantsSelected);

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <span>/</span>
            <Link 
              to={`/shop/${product.category_id}/${product.category_slug}`} 
              className="hover:text-primary transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <motion.img
                  key={`${selectedImage}-${gen_random_string()}`}
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-primary text-primary-foreground">New</Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-orange-500 text-white">Best Seller</Badge>
                  )}
                  {hasDiscount && discountPercent > 0 && (
                    <Badge className="bg-red-500 text-white">-{discountPercent}%</Badge>
                  )}
                </div>

                {/* Navigation */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg"
                      onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg"
                      onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={`${idx}-${gen_random_string()}`}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} - view ${idx + 1}`} 
                        className="h-full w-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <h1 className="font-display text-3xl md:text-4xl mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-display text-3xl text-primary">
                    {format_currency(variantPrice)}
                  </span>
                  {product.originalPrice && product.originalPrice > variantPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {format_currency(product.originalPrice)}
                      </span>
                      <Badge variant="outline" className="text-red-500 border-red-200">
                        Save {format_currency(product.originalPrice - variantPrice)}
                      </Badge>
                    </>
                  )}
                  {product.variants && product.variants.length > 0 && variantPrice !== product.price && (
                    <span className="text-sm text-muted-foreground">
                      (Base: {format_currency(product.price)})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="text-sm font-normal">
                    SKU: {product.sku}
                  </Badge>
                  {product.stockQuantity && product.stockQuantity > 0 && (
                    <span className={cn(
                      "text-sm",
                      product.lowStockAlert && product.stockQuantity <= product.lowStockAlert 
                        ? "text-orange-600" 
                        : "text-green-600"
                    )}>
                      {product.lowStockAlert && product.stockQuantity <= product.lowStockAlert 
                        ? `Low stock: ${product.stockQuantity} units` 
                        : `${product.stockQuantity} units available`
                      }
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {product.variants.map((variant) => (
                    <div key={`${variant.type}-${gen_random_string()}`}>
                      <label className="font-medium mb-3 block">{variant.type}</label>
                      <div className="flex flex-wrap gap-2">
                        {variant.options && variant.options.map((option) => (
                          <button
                            key={`${option.value}-${gen_random_string()}`}
                            onClick={() => handleVariantSelect(
                              variant.type, 
                              option.value,
                              parseFloat(option.price_modifier || "0")
                            )}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
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

              {/* Quantity */}
              <div>
                <label className="font-medium mb-3 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={product.stockQuantity && product.stockQuantity > 0 && quantity >= product.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.inStock ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" /> In Stock
                      </span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Variant Selection Warning */}
              {product.variants && product.variants.length > 0 && !allVariantsSelected && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please select all available variants before adding to cart
                  </p>
                </div>
              )}

              {/* Purchase Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isCartDisabled}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {isCartDisabled ? "Select Options" : "Add to Cart"}
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={isCartDisabled}
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-3">
                <Button size="lg" variant="outline" className="flex-1" asChild>
                  <Link to="/contact">
                    <Store className="h-5 w-5 mr-2" />
                    View In-Store
                  </Link>
                </Button>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  className={cn(product.is_wishlist === "1" && "text-primary")}
                >
                  {togglingWishlist ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className={cn("h-4 w-4 mr-2", product.is_wishlist === "1" && "fill-current")} />
                  )}
                  {product.is_wishlist === "1" ? "In Wishlist" : "Add to Wishlist"}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="pt-6 border-t">
                  <h3 className="font-medium mb-4">Product Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={`${idx}-${gen_random_string()}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-4 pt-6 border-t">
                {product.weight && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">{product.weight} KG</span>
                  </div>
                )}
                
                {product.item_height && product.item_width && product.item_depth && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium">{product.item_height}CM x {product.item_width}CM x {product.item_depth}CM</span>
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              <div className="p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping on Orders Over $100</p>
                    <p className="text-xs text-muted-foreground">
                      Delivery within 3-7 business days in Alberta
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;