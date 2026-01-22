import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShieldOff,
  ArrowLeft,
  Home,
  LogIn,
  UserPlus,
  Lock,
  Key,
  Shield,
  AlertTriangle,
  EyeOff,
  Crown,
  Sparkles,
  Users,
  UserCheck,
  Settings,
  ChevronRight
} from "lucide-react";

const UnAuthorized = () => {
  const accountOptions = [
    { 
      name: "Customer Account", 
      path: "/login", 
      icon: UserCheck,
      description: "Access your orders & wishlist"
    },
    { 
      name: "Register", 
      path: "/register", 
      icon: UserPlus,
      description: "Create new account"
    },
  ];

  const securityFeatures = [
    { 
      icon: Shield, 
      title: "Secure Authentication",
      description: "Multi-layer protection"
    },
    { 
      icon: Lock, 
      title: "Encrypted Sessions",
      description: "End-to-end encryption"
    },
    { 
      icon: Key, 
      title: "Role-Based Access",
      description: "Granular permissions"
    },
  ];

  const floatingElements = [
    { x: '15%', y: '25%', size: '100px', delay: 0, color: 'primary' },
    { x: '80%', y: '35%', size: '70px', delay: 0.3, color: 'destructive' },
    { x: '25%', y: '75%', size: '50px', delay: 0.6, color: 'accent' },
    { x: '70%', y: '85%', size: '90px', delay: 0.9, color: 'primary' },
  ];

  return (
    <Layout>
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Security Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, hsl(var(--primary)/0.3) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, hsl(var(--destructive)/0.2) 0%, transparent 50%),
                linear-gradient(45deg, transparent 48%, hsl(var(--border)) 49%, hsl(var(--border)) 51%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, hsl(var(--border)) 49%, hsl(var(--border)) 51%, transparent 52%)
              `,
              backgroundSize: '80px 80px'
            }}
          />

          {/* Floating Elements */}
          {floatingElements.map((element, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full opacity-5"
              style={{
                width: element.size,
                height: element.size,
                left: element.x,
                top: element.y,
                background: `radial-gradient(circle, hsl(var(--${element.color})) 0%, transparent 70%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.05, 0.08, 0.05],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Corner Gradients */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-destructive/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Security Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col items-center lg:items-start"
            >
              {/* Animated Shield */}
              <motion.div
                animate={{ 
                  rotateY: [0, 180, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="relative mb-8"
              >
                <div className="relative w-48 h-48">
                  {/* Outer Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-primary/20 blur-2xl rounded-full" />
                  
                  {/* Shield Container */}
                  <div className="relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-full p-8 border-2 border-destructive/30 shadow-elevated">
                    {/* Shield Icon */}
                    <div className="relative">
                      <ShieldOff className="h-32 w-32 text-destructive" />
                      
                      {/* Animated Lock */}
                      <motion.div
                        animate={{ 
                          y: [0, -5, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <Lock className="h-20 w-20 text-foreground/80" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center lg:text-left max-w-md"
              >
                <h2 className="font-display text-2xl md:text-3xl mb-3">
                  Protected <span className="text-destructive">Access</span> Required
                </h2>
                <p className="text-muted-foreground">
                  This area is reserved for authorized personnel only. Your security is our priority.
                </p>

                {/* Security Features */}
                <div className="mt-6 space-y-3">
                  {securityFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-card/50 to-card/30 rounded-xl border border-border/30"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{feature.title}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-b from-card to-card/80 backdrop-blur-sm rounded-2xl border border-destructive/20 shadow-elevated overflow-hidden">
                <CardHeader className="text-center pb-6 relative">
                  {/* Warning Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 px-3 py-1 bg-destructive/10 rounded-full border border-destructive/20">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span className="text-xs font-medium text-destructive">403</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                    <EyeOff className="h-8 w-8 text-destructive" />
                  </div>
                  
                  <CardTitle className="font-display text-3xl">
                    Access Denied
                  </CardTitle>
                  <CardDescription className="text-base">
                    You don't have permission to view this page
                  </CardDescription>
                </CardHeader>

                <Separator className="mb-6" />

                <CardContent className="space-y-6">
                  {/* Primary Action */}
                  <div className="space-y-4">
                    <Button 
                      asChild 
                      className="w-full h-12 gap-2 bg-gradient-to-r from-destructive to-destructive/80 hover:shadow-card-hover"
                    >
                      <Link to="/login">
                        <LogIn className="h-4 w-4" />
                        Switch Account
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-12 gap-2 border-primary/30 hover:bg-primary/5"
                      asChild
                    >
                      <Link to="/">
                        <Home className="h-4 w-4" />
                        Return to Homepage
                      </Link>
                    </Button>
                  </div>

                  {/* Quick Navigation */}
                  <div className="pt-4">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Quick Access
                    </p>
                    <div className="space-y-2">
                      {accountOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.div
                            key={option.name}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              variant="ghost"
                              className="w-full h-auto py-3 justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              asChild
                            >
                              <Link to={option.path}>
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-medium text-sm">{option.name}</div>
                                  <div className="text-xs text-muted-foreground">{option.description}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                              </Link>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Help Section */}
                  <div className="pt-4 pb-2">
                    <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm mb-1">Need Help?</div>
                          <p className="text-xs text-muted-foreground">
                            Contact our support team for access requests or account issues
                          </p>
                          <Link 
                            to="/contact" 
                            className="text-primary hover:underline text-xs font-medium inline-block mt-2"
                          >
                            Contact Support →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Security Notice</div>
                    <p className="text-xs text-muted-foreground">
                      Unauthorized access attempts are logged for security purposes
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-destructive/10 to-primary/10 rounded-full border border-destructive/20">
              <Lock className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">
                Your security is our top priority
              </span>
            </div>
          </motion.div>
        </div>

        {/* Animated Security Dots */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-destructive/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Scanning Line Effect */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent"
          style={{ top: '30%' }}
          animate={{
            top: ['30%', '70%', '30%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes lockShake {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-2px) rotate(-1deg); }
          75% { transform: translateX(2px) rotate(1deg); }
        }
        
        .lock-shake {
          animation: lockShake 0.5s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
};

export default UnAuthorized;