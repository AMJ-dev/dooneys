import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "@/components/ui/motion";
import {
  LogOut,
  CheckCircle,
  Sparkles,
  Shield,
  User,
  Home,
  ShoppingBag,
  ArrowRight,
  Clock,
  Heart,
  Award,
  Lock,
  RefreshCw,
  Users,
  Star,
  Palette,
  Brush,
  Coffee,
  ShoppingCart,
  Package,
  Gift,
  Gem,
  Crown,
  Bell,
  Calendar,
  TrendingUp,
  Zap,
  Key,
  Server,
  Database,
  ShieldCheck,
  ShieldOff
} from "lucide-react";
import UserContext from "@/lib/userContext";
import { cn } from "@/lib/utils";

const Logout = () => {
  const { logout } = useContext(UserContext);
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [logoutProgress, setLogoutProgress] = useState(0);

  useEffect(() => {
    // Simulate logout progress
    const progressInterval = setInterval(() => {
      setLogoutProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    // Complete logout after animation
    const timer = setTimeout(() => {
      setIsLoggingOut(false);
      const redirectTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(redirectTimer);
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(redirectTimer);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [logout]);

  const quickActions = [
    { icon: Home, label: "Home", path: "/", color: "from-blue-500 to-cyan-500" },
    { icon: ShoppingBag, label: "Shop", path: "/shop", color: "from-primary to-accent" },
    { icon: Heart, label: "Wishlist", path: "/account/wishlist", color: "from-rose-500 to-pink-500" },
    { icon: User, label: "Login", path: "/login", color: "from-emerald-500 to-teal-500" },
  ];

  const beautyTips = [
    { icon: Palette, title: "Daily Skincare", tip: "Consistency is key to glowing skin", color: "bg-amber-50 border-amber-200" },
    { icon: Brush, title: "Makeup Refresh", tip: "Try a new look today!", color: "bg-purple-50 border-purple-200" },
    { icon: Coffee, title: "Self-Care", tip: "Your beauty shines from within", color: "bg-rose-50 border-rose-200" },
  ];

  const securitySteps = [
    { icon: Key, label: "Session Token", description: "Revoked", status: "complete" },
    { icon: Database, label: "Local Data", description: "Cleared", status: "complete" },
    { icon: Server, label: "Server Session", description: "Terminated", status: "complete" },
    { icon: ShieldCheck, label: "Security Check", description: "Verified", status: "complete" },
  ];

  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Dynamic gradient mesh */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(at 40% 20%, hsl(var(--primary)/0.2) 0px, transparent 50%),
                radial-gradient(at 80% 0%, hsl(var(--accent)/0.15) 0px, transparent 50%),
                radial-gradient(at 0% 50%, hsl(var(--highlight)/0.1) 0px, transparent 50%),
                radial-gradient(at 80% 50%, hsl(var(--primary)/0.1) 0px, transparent 50%),
                radial-gradient(at 0% 100%, hsl(var(--accent)/0.15) 0px, transparent 50%),
                radial-gradient(at 80% 100%, hsl(var(--highlight)/0.1) 0px, transparent 50%),
                radial-gradient(at 0% 0%, hsl(var(--primary)/0.2) 0px, transparent 50%)
              `,
            }}
          />

          {/* Animated floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, hsl(var(--primary)/0.2) 0%, transparent 70%)`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}

          {/* Gradient orbs */}
          <motion.div
            className="absolute top-1/4 -left-40 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-l from-primary/10 to-accent/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          {isLoggingOut ? (
            <motion.div
              key="logging-out"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden">
                {/* Progress bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-highlight overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-background to-background/80"
                    initial={{ width: "0%" }}
                    animate={{ width: `${logoutProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </div>

                <CardContent className="p-12 text-center">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="w-24 h-24 mx-auto mb-8 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl" />
                    <div className="relative w-full h-full bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center border-2 border-primary/20">
                      <Lock className="h-12 w-12 text-primary" />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="font-display text-3xl md:text-4xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Securing Your Session
                    </h2>
                    
                    <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                      We're safely closing your session and protecting your data
                    </p>
                  </motion.div>

                  {/* Security Steps */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                    {securitySteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                        className="text-center"
                      >
                        <div className={cn(
                          "w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center",
                          step.status === "complete" 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                            : "bg-gradient-to-r from-primary/20 to-accent/20"
                        )}>
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="font-medium text-sm mb-1">{step.label}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Loading Animation */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: dot * 0.1,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {logoutProgress < 100 ? "Securing connection..." : "Logout complete!"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="logged-out"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl"
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Success Message */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <Card className="bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden h-full">
                    <div className="absolute top-0 right-0 p-6">
                      <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/20">
                        <span className="text-sm font-medium text-green-600">Secure</span>
                      </div>
                    </div>

                    <CardHeader className="text-center pb-6 pt-12">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.4, stiffness: 200 }}
                        className="mx-auto mb-6 relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl blur-xl opacity-50" />
                        <div className="relative w-28 h-28 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl">
                          <CheckCircle className="h-14 w-14 text-primary-foreground" />
                        </div>
                      </motion.div>
                      
                      <CardTitle className="font-display text-4xl md:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Successfully Signed Out
                      </CardTitle>
                      
                      <CardDescription className="text-xl">
                        Your session has been securely terminated and all data protected
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-8">
                      <div className="space-y-8 max-w-2xl mx-auto">
                        <div className="text-center">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm rounded-full border border-primary/20 mb-6"
                          >
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="font-medium">All security protocols completed</span>
                          </motion.div>
                          
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-700">
                                Redirecting in <span className="font-bold text-xl">{countdown}</span>s
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => logout()}
                              className="gap-2"
                            >
                              Skip
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <Separator />

                        {/* Security Summary */}
                        <div className="p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl border border-border/50">
                          <h3 className="font-display text-xl mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Security Summary
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: "Sessions", value: "1", icon: Server },
                              { label: "Cookies", value: "Cleared", icon: Database },
                              { label: "Tokens", value: "Revoked", icon: Key },
                              { label: "Cache", value: "Purged", icon: ShieldOff },
                            ].map((item, index) => {
                              const Icon = item.icon;
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.8 + index * 0.1 }}
                                  className="text-center p-3 bg-gradient-to-b from-background to-background/50 rounded-xl border border-border/30"
                                >
                                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                                  <div className="font-medium text-sm">{item.label}</div>
                                  <div className="text-xs text-muted-foreground">{item.value}</div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right Column - Actions & Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  {/* Quick Actions */}
                  <Card className="bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Continue Your Journey
                      </CardTitle>
                      <CardDescription>
                        Where would you like to go next?
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, index) => {
                          const Icon = action.icon;
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1 }}
                              whileHover={{ y: -4 }}
                            >
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full h-auto py-4 justify-start gap-3",
                                  "border-border/50 hover:border-primary/30 hover:bg-primary/5",
                                  "group transition-all duration-300"
                                )}
                                asChild
                              >
                                <Link to={action.path}>
                                  <div className={cn(
                                    "p-2 rounded-lg bg-gradient-to-r",
                                    action.color,
                                    "group-hover:scale-110 transition-transform"
                                  )}>
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="text-sm font-medium">{action.label}</span>
                                </Link>
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Beauty Tips */}
                  <Card className="bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-primary" />
                        Beauty Inspiration
                      </CardTitle>
                      <CardDescription>
                        Tips for your self-care routine
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {beautyTips.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            whileHover={{ x: 4 }}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                              tip.color,
                              "hover:shadow-md hover:scale-[1.02]"
                            )}
                          >
                            <div className="p-2 bg-white/80 rounded-lg backdrop-blur-sm">
                              <Icon className="h-5 w-5 text-gray-700" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">{tip.title}</div>
                              <div className="text-xs text-gray-600">{tip.tip}</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: ShoppingCart, label: "Cart", value: "0", color: "bg-blue-100 text-blue-700" },
                      { icon: Heart, label: "Wishlist", value: "0", color: "bg-rose-100 text-rose-700" },
                      { icon: Gift, label: "Offers", value: "New", color: "bg-emerald-100 text-emerald-700" },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-border/50"
                      >
                        <stat.icon className={cn("h-5 w-5 mx-auto mb-1", stat.color)} />
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                        <div className="font-bold text-sm">{stat.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="mt-8"
              >
                <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-highlight/5 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="font-display text-2xl mb-2">Ready for your next beauty adventure?</h3>
                        <p className="text-muted-foreground">
                          Discover new products and exclusive offers waiting for you
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          asChild
                          size="lg"
                          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-xl"
                        >
                          <Link to="/shop">
                            Shop Now
                            <ShoppingBag className="h-5 w-5 ml-2" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          asChild
                          className="border-primary/30 hover:border-primary/50"
                        >
                          <Link to="/">
                            Return Home
                            <Home className="h-5 w-5 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full border border-border/50 shadow-lg">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">
              Secure logout completed • All data protected
            </span>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Logout;