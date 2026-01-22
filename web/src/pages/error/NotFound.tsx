import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Search,
  Compass,
  Sparkles,
  Package,
  Heart,
  ShoppingBag,
  Brush,
  User,
  ShoppingCart
} from "lucide-react";

const NotFound = () => {
  const popularLinks = [
    { name: "Shop All", path: "/shop", icon: ShoppingBag },
    { name: "Best Sellers", path: "/shop?category=bestsellers", icon: Heart },
    { name: "Skincare", path: "/shop?category=skincare", icon: Brush },
    { name: "My Account", path: "/account", icon: User },
    { name: "Cart", path: "/cart", icon: ShoppingCart },
    { name: "New Arrivals", path: "/shop?sort=newest", icon: Package },
  ];

  const errorCodeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.3
      }
    }
  };

  const floatingOrbs = [
    { x: '10%', y: '20%', size: '120px', delay: 0 },
    { x: '85%', y: '30%', size: '80px', delay: 0.2 },
    { x: '20%', y: '70%', size: '60px', delay: 0.4 },
    { x: '75%', y: '80%', size: '100px', delay: 0.6 },
  ];

  return (
    <Layout>
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Gradient Orbs */}
          {floatingOrbs.map((orb, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full opacity-5"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.x,
                top: orb.y,
                background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.05, 0.1, 0.05],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                delay: orb.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-5" 
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Error Code & Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col items-center lg:items-start"
            >
              <motion.div
                variants={errorCodeVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="relative mb-8"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl rounded-3xl" />
                
                {/* Error Number */}
                <div className="relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-12 border border-border/50 shadow-elevated">
                  <div className="flex items-baseline justify-center gap-4">
                    <span className="font-display text-8xl md:text-9xl font-bold text-gradient bg-gradient-primary">
                      4
                    </span>
                    <div className="relative">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 0.9, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="inline-block"
                      >
                        <Sparkles className="h-16 w-16 text-primary" />
                      </motion.div>
                    </div>
                    <span className="font-display text-8xl md:text-9xl font-bold text-gradient bg-gradient-primary">
                      4
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Animated Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center lg:text-left"
              >
                <h2 className="font-display text-2xl md:text-3xl mb-3">
                  Beauty <span className="text-primary">Lost</span> in Translation
                </h2>
                <p className="text-muted-foreground">
                  This page has wandered off like a misplaced lipstick. Let's find something beautiful instead.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Column - Content & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-b from-card to-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-elevated overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <AlertTriangle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-3xl">
                    Page Not Found
                  </CardTitle>
                  <CardDescription className="text-base">
                    The beauty product or page you're looking for has been moved or doesn't exist.
                  </CardDescription>
                </CardHeader>

                <Separator className="mb-6" />

                <CardContent className="space-y-6">
                  {/* Primary Actions */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button asChild className="h-12 gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-card-hover">
                      <Link to="/">
                        <Home className="h-4 w-4" />
                        Go to Homepage
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-12 gap-2 border-primary/30 hover:bg-primary/5"
                      asChild
                    >
                      <Link to={-1 as unknown as string}>
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                      </Link>
                    </Button>
                  </div>

                </CardContent>

                {/* Footer Note */}
                <div className="px-6 pb-6 pt-4 border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent">
                  <p className="text-xs text-muted-foreground text-center">
                    Need help? Contact our{" "}
                    <Link to="/contact" className="text-primary hover:underline font-medium">
                      customer support
                    </Link>
                    {" "}for assistance
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Decorative Bottom Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Every wrong turn leads to new beauty discoveries
              </span>
            </div>
          </motion.div>
        </div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </section>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
};

export default NotFound;