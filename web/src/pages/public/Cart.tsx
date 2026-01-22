import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Calendar, 
  Truck,
  Shield,
  Percent,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { resolveSrc, format_currency, str_to_url, gen_random_string } from "@/lib/functions";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart, refreshCart } = useCart();

  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    const total = getTotalPrice();
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setSubtotal(total);
    setItemCount(count);
  }, [items]);

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Shopping Cart</span>
          </nav>

          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-2">
                  Your Shopping Cart
                </h1>
                <p className="text-muted-foreground text-lg">
                  Review and manage your selected items
                </p>
              </div>
              {items.length > 0 && (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                    <p className="font-display text-xl text-primary">{format_currency(subtotal)}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          {items.length === 0 ? (
            <ScrollReveal>
              <div className="text-center py-20 bg-gradient-to-br from-card to-card/50 rounded-3xl shadow-soft border border-border/50">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShoppingBag className="h-16 w-16 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl mb-3">Your cart is empty</h2>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Looks like you haven't added anything to your cart yet. Start exploring our premium beauty collection.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                      <Link to="/shop">
                        Start Shopping
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="gap-2">
                      <Link to="/deals">
                        <Percent className="h-4 w-4" />
                        View Deals
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    />
                  </div>
                </motion.div>

                {/* Cart Items List */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => {
                      // Calculate base price from variant details
                      let basePrice = item.product.price;
                      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
                        // If we have variant details, show the price breakdown
                        basePrice = item.product.price;
                        Object.values(item.selectedVariants).forEach((option: any) => {
                          if (option.price_modifier) {
                            basePrice -= parseFloat(option.price_modifier);
                          }
                        });
                      }
                      
                      return (
                        <motion.div
                          key={`${item.product.id}-${gen_random_string()}`}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                          className="group relative"
                        >
                          <div className={cn(
                            "flex gap-4 md:gap-6 p-5 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-card border border-border/50",
                            "hover:shadow-card-hover hover:border-primary/30 transition-all duration-300"
                          )}>
                            {/* Product Image */}
                            <Link
                              to={`/product/${item.product.id}/${str_to_url(item.product.name)}`}
                              className="flex-shrink-0 relative"
                            >
                              <div className="relative">
                                <motion.img
                                  whileHover={{ scale: 1.05 }}
                                  src={resolveSrc(item.product.image)}
                                  alt={item.product.name}
                                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-xl border border-border"
                                />
                                {item.quantity > 1 && (
                                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                                    {item.quantity}
                                  </div>
                                )}
                              </div>
                            </Link>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0 py-1">
                              <div className="flex justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <Link to={`/product/${item.product.id}/${str_to_url(item.product.name)}`}>
                                    <h3 className="font-display text-lg font-medium hover:text-primary transition-colors line-clamp-2 mb-1">
                                      {item.product.name}
                                    </h3>
                                  </Link>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {item.product.category}
                                  </p>
                                  
                                  {/* Show Selected Variants */}
                                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                    <div className="mb-4">
                                      <div className="flex flex-wrap gap-2 mb-2">
                                        {Object.entries(item.selectedVariants).map(
                                          ([key, option]) => {
                                            return (
                                              <Badge 
                                                key={`${key}-${gen_random_string()}`}
                                                variant="secondary" 
                                                className="text-xs px-3 py-1.5"
                                              >
                                                <span className="font-semibold">{key}:</span>
                                                <span className="ml-1">{option.value}</span>
                                                {option.price_modifier && parseFloat(option.price_modifier) !== 0 && (
                                                  <span className={cn(
                                                    "ml-1",
                                                    parseFloat(option.price_modifier) > 0 
                                                      ? "text-green-600"
                                                      : "text-red-600"
                                                  )}>
                                                    ({parseFloat(option.price_modifier) > 0 ? '+' : ''}{format_currency(parseFloat(option.price_modifier))})
                                                  </span>
                                                )}
                                              </Badge>
                                            );
                                          }
                                        )}
                                      </div>
                                      
                                      {/* Price Breakdown */}
                                      <div className="text-sm space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground">Base price:</span>
                                          <span>{format_currency(basePrice)}</span>
                                        </div>
                                        {Object.values(item.selectedVariants).some((opt: any) => opt.price_modifier && parseFloat(opt.price_modifier) !== 0) && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Variant adjustments:</span>
                                            <span className={cn(
                                              Object.values(item.selectedVariants).reduce((sum: number, opt: any) => 
                                                sum + (opt.price_modifier ? parseFloat(opt.price_modifier) : 0), 0
                                              ) > 0 ? "text-green-600" : "text-red-600"
                                            )}>
                                              {format_currency(
                                                Object.values(item.selectedVariants).reduce((sum: number, opt: any) => 
                                                  sum + (opt.price_modifier ? parseFloat(opt.price_modifier) : 0), 0
                                                )
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2 pt-1 border-t">
                                          <span className="font-medium">Final price:</span>
                                          <span className="font-display text-primary font-medium">
                                            {format_currency(item.product.price)} each
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Quantity Controls */}
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center border border-input rounded-xl overflow-hidden bg-background/50">
                                      <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                        className="p-3 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                        disabled={item.quantity <= 1}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="w-12 text-center text-sm font-medium">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                        className="p-3 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="flex flex-col items-end justify-between">
                                  {/* Remove Button */}
                                  <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>

                                  {/* Price */}
                                  <div className="text-right">
                                    <p className="font-display text-2xl text-primary">
                                      {format_currency(item.product.price * item.quantity)}
                                    </p>
                                    {item.quantity > 1 && (
                                      <p className="text-sm text-muted-foreground">
                                        {item.quantity} × {format_currency(item.product.price)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Continue Shopping */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
                  <Button variant="outline" asChild className="gap-2">
                    <Link to="/shop">
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Continue Shopping
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={clearCart} className="text-muted-foreground hover:text-destructive gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear Entire Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-32"
                >
                  {/* Summary Card */}
                  <div className="bg-gradient-to-b from-card to-card/80 rounded-2xl p-6 shadow-elevated border border-border/50 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl">Order Summary</h2>
                        <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{format_currency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-muted-foreground">Taxes</span>
                        <span className="font-medium">Calculated at checkout</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-lg">Estimated Total</span>
                          <p className="text-xs text-muted-foreground">Tax and shipping calculated at checkout</p>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-3xl text-primary">{format_currency(subtotal)}</span>
                          <p className="text-xs text-muted-foreground">before tax & shipping</p>
                        </div>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button 
                      size="lg" 
                      className="w-full mb-4 gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
                      asChild
                    >
                      <Link to="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Secure checkout • 256-bit encryption</span>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-4">
                    {/* In-Store Appointment */}
                    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-5 shadow-soft border border-border/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Need personalized advice?</h3>
                          <p className="text-sm text-muted-foreground">Book an in-store consultation</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <Link to="/contact">
                          <Calendar className="h-4 w-4" />
                          Book Appointment
                        </Link>
                      </Button>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-5 shadow-soft border border-border/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Shipping Information</h3>
                          <p className="text-sm text-muted-foreground">Fast & reliable delivery</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Express shipping</span>
                          <span className="font-medium">2-3 business days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order by 3 PM</span>
                          <span className="font-medium">Same-day processing</span>
                        </div>
                      </div>
                    </div>

                    {/* Return Policy */}
                    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-5 shadow-soft border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">30-Day Return Policy</h3>
                          <p className="text-sm text-muted-foreground">Easy returns & exchanges</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;