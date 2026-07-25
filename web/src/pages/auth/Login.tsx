import { useState, startTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff,
  Sparkles,
  Shield,
  CheckCircle,
  Fingerprint,
  Heart
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect"); 
  console.log(redirect)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("email");
    
    if(redirect) sessionStorage.setItem('redirect', String(redirect));
    else sessionStorage.removeItem('redirect');

  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    } 
    setLoading(true);
    try {
      const res = await http.post("/sign-in/", {email, password});
      const resp: ApiResp = res.data;
      console.log(resp)
      if(resp?.error === false && resp?.data){
        const jwt = resp?.code?.jwt;  
        if (!jwt) {
          toast.error("Authentication token missing in response");
          return;
        }
        
        toast.success(String(resp?.data));
        if (rememberMe) sessionStorage.setItem('remember', 'true');
        else sessionStorage.removeItem('remember');
        sessionStorage.setItem('jwt', String(resp?.code?.jwt ?? ''));
        sessionStorage.setItem('email', String(resp?.code?.email ?? email.trim()));
        
        setTimeout(() => startTransition(() => navigate(`/verify-user-otp`)), 1500);
        return;
      }
      toast.error(resp?.data || "Invalid credentials");
      
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-primary/10 to-accent/10"
              style={{
                width: Math.random() * 120 + 30,
                height: Math.random() * 120 + 30,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.random() * 30 - 15, 0],
              }}
              transition={{
                duration: Math.random() * 12 + 8,
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
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6 md:hidden"
          >
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-xl">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold">Doonneys Beauty</h1>
            <p className="text-sm text-muted-foreground">Premium Beauty Experience</p>
          </motion.div>

          {/* Login Form */}
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
              isHovered ? "opacity-70" : "opacity-30",
              "hidden md:block"
            )} />

            <Card className="relative bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-sm border-border/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-4 pt-6 px-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="mx-auto mb-3"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <Fingerprint className="h-7 w-7 text-primary-foreground" />
                  </div>
                </motion.div>
                <CardTitle className="font-display text-2xl">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Sign in to your premium account
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4 px-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className={cn(
                          "pl-9 h-11 text-sm rounded-lg border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50"
                        )}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "pl-9 pr-9 h-11 text-sm rounded-lg border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50"
                        )}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-xs font-medium cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full h-11 text-sm font-medium rounded-lg",
                      "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
                      "shadow-lg hover:shadow-xl transition-all duration-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing In...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          Continue to Your Account
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="border-t border-border/50 pt-4 px-5 pb-5">
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                    >
                      Create account
                    </Link>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="text-primary hover:underline">Terms</a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Mobile Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 md:hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-xs">Secure Login</h3>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Your security first
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-xs">Premium Access</h3>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Exclusive benefits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex justify-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-full border border-border/50 shadow-md">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium">256-bit SSL Encrypted</span>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Login;