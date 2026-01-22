import { useState, startTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  Fingerprint,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Smartphone,
  UserCog,
  Server,
  Database,
  Activity
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { cn } from "@/lib/utils";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);
  
  useEffect(() => {
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("admin_remember");
    
    // Check if account is temporarily locked
    const storedLock = localStorage.getItem("admin_lock_until");
    if (storedLock) {
      const lockTime = new Date(storedLock);
      if (lockTime > new Date()) {
        setLockUntil(lockTime);
      } else {
        localStorage.removeItem("admin_lock_until");
        localStorage.removeItem("failed_attempts");
      }
    }
    
    const storedAttempts = localStorage.getItem("failed_attempts");
    if (storedAttempts) {
      setFailedAttempts(parseInt(storedAttempts));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (lockUntil && lockUntil > new Date()) {
      const minutesLeft = Math.ceil((lockUntil.getTime() - new Date().getTime()) / 60000);
      toast.error(`Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`);
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await http.post("/sign-in/", { email, password });
      const resp: ApiResp = res.data;
      
      if (resp?.error === false && resp?.data) {
        const jwt = resp?.code?.jwt;
        if (!jwt) {
          toast.error("Authentication token missing");
          return;
        }
        
        // Reset failed attempts on successful login
        localStorage.removeItem("failed_attempts");
        localStorage.removeItem("admin_lock_until");
        setFailedAttempts(0);
        
        toast.success("Admin authentication successful");
        
        if (rememberMe) {
          sessionStorage.setItem('admin_remember', 'true');
        } else {
          sessionStorage.removeItem('admin_remember');
        }
        
        sessionStorage.setItem('jwt', String(resp?.code?.jwt ?? ''));
        sessionStorage.setItem('email', String(resp?.code?.email ?? email.trim()));
        
        // Add admin-specific data
        sessionStorage.setItem('is_admin', 'true');
        
        setTimeout(() => startTransition(() => navigate('/verify-admin-otp')), 1500);
        return;
      }
      
      // Handle failed login
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem("failed_attempts", newFailedAttempts.toString());
      
      if (newFailedAttempts >= 3) {
        const lockTime = new Date(Date.now() + 15 * 60000); // Lock for 15 minutes
        setLockUntil(lockTime);
        localStorage.setItem("admin_lock_until", lockTime.toISOString());
        toast.error("Too many failed attempts. Account locked for 15 minutes.");
      }
      
      setError(resp?.data || "Invalid admin credentials");
      toast.error(resp?.data || "Invalid admin credentials");
      
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Connection error. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getLockTimeRemaining = () => {
    if (!lockUntil) return null;
    const now = new Date();
    if (lockUntil <= now) return null;
    
    const diffMs = lockUntil.getTime() - now.getTime();
    const minutes = Math.ceil(diffMs / 60000);
    return minutes;
  };

  const lockTimeRemaining = getLockTimeRemaining();

  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-primary/10 to-accent/10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center"
        >
          {/* Left Side - Admin Features & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden md:block"
          >
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-2xl backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardContent className="p-10">
                <div className="space-y-8">
                  {/* Admin Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-2xl">
                      <Building2 className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl font-bold">Doonneys Beauty Admin</h2>
                      <p className="text-sm text-muted-foreground">Enterprise Management Portal</p>
                    </div>
                  </div>

                  {/* Admin Features */}
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Database className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Dashboard Analytics</h3>
                        <p className="text-sm text-muted-foreground">
                          Real-time sales data and business insights
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <UserCog className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">User Management</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete control over user accounts and permissions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Server className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Inventory Control</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage stock levels and product catalogs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Activity className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Order Processing</h3>
                        <p className="text-sm text-muted-foreground">
                          Process and track customer orders efficiently
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-2">Enhanced Security</h4>
                        <p className="text-sm text-muted-foreground">
                          This portal uses advanced encryption and requires multi-factor authentication for all administrative actions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Glow Effect */}
            <div className={cn(
              "absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-transparent rounded-3xl blur-xl transition-opacity duration-500",
              isHovered ? "opacity-70" : "opacity-30"
            )} />

            <Card className="relative bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-sm border-border/50 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="mx-auto mb-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <Fingerprint className="h-10 w-10 text-primary-foreground" />
                  </div>
                </motion.div>
                <CardTitle className="font-display text-3xl md:text-4xl">
                  Admin Portal
                </CardTitle>
                <CardDescription className="text-lg">
                  Secure access to management dashboard
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-6">
                {/* Account Lock Warning */}
                <AnimatePresence>
                  {lockTimeRemaining && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-destructive mb-1">
                            Account Temporarily Locked
                          </h4>
                          <p className="text-sm text-destructive/80">
                            Too many failed attempts. Try again in {lockTimeRemaining} minute{lockTimeRemaining > 1 ? 's' : ''}.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Failed Attempts Warning */}
                {failedAttempts > 0 && !lockTimeRemaining && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-700 mb-1">
                          Security Warning
                        </h4>
                        <p className="text-sm text-amber-600/80">
                          {failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''}. {3 - failedAttempts} attempt{3 - failedAttempts !== 1 ? 's' : ''} remaining before lock.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Admin Email Address
                    </Label>
                    <div className="relative group">
                      <Input
                        type="email"
                        placeholder="admin@doonneysbeauty.com"
                        className={cn(
                          "pl-12 h-14 text-base rounded-xl border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50",
                          error && "border-destructive focus:border-destructive"
                        )}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        required
                        disabled={!!lockTimeRemaining}
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Admin Password
                    </Label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        className={cn(
                          "pl-12 pr-12 h-14 text-base rounded-xl border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50",
                          error && "border-destructive focus:border-destructive"
                        )}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        required
                        disabled={!!lockTimeRemaining}
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                        disabled={!!lockTimeRemaining}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                      >
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <span className="text-sm text-destructive">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        disabled={!!lockTimeRemaining}
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Remember this device
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !!lockTimeRemaining}
                    className={cn(
                      "w-full h-14 text-base font-medium rounded-xl",
                      "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
                      "shadow-lg hover:shadow-xl transition-all duration-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "group"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-3"
                        >
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Authenticating...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-3"
                        >
                          Access Admin Dashboard
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">
                        Quick Access
                      </span>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-xl border-border/50 hover:border-primary/30"
                      onClick={() => navigate("/login")}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Customer Login
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-xl border-border/50 hover:border-primary/30"
                      onClick={() => navigate("/contact")}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </form>
              </CardContent>

              <CardFooter className="border-t border-border/50 pt-6">
                <div className="w-full text-center text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Authorized Access Only</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    All activities are logged and monitored for security purposes.
                    Unauthorized access is prohibited.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        {/* Mobile Admin Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:hidden mt-8 w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 rounded-2xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Analytics</h3>
                    <p className="text-xs text-muted-foreground">Real-time data</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Inventory</h3>
                    <p className="text-xs text-muted-foreground">Stock control</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/50 shadow-lg">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Enterprise-grade Security</span>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default AdminLogin;