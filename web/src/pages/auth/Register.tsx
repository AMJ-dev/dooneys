import { useState, startTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Gift,
  Heart,
  ChevronLeft,
  Smartphone,
  Check,
  X
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { cn } from "@/lib/utils";

const Register = () => { 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    password: "",
    cpassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isHovered, setIsHovered] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.mobile_number.replace(/\D/g, ''))) {
      newErrors.mobile_number = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.cpassword) {
      newErrors.cpassword = "Please confirm your password";
    } else if (formData.password !== formData.cpassword) {
      newErrors.cpassword = "Passwords do not match";
    }

    if (!termsAccepted) {
      newErrors.terms = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    if (field === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const res = await http.post("/sign-up/", formData);
      const resp: ApiResp = res.data;
      
      if (resp.error === false && resp.data) {
        toast.success("Account created successfully!");
        setTimeout(() => {
          startTransition(() => navigate("/login"));
        }, 1500);
        return;
      } 
      toast.error(resp.data || "Registration failed");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
      
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return "bg-destructive";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-green-500";
      default: return "bg-muted";
    }
  };

  const passwordStrengthText = () => {
    switch (passwordStrength) {
      case 1: return "Very Weak";
      case 2: return "Weak";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated background elements - hidden on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          {[...Array(8)].map((_, i) => (
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
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-5 md:hidden"
          >
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-xl">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold">Join Doonneys Beauty</h1>
            <p className="text-sm text-muted-foreground">Premium Beauty Experience</p>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Glow Effect - hidden on mobile */}
            <div className={cn(
              "absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-transparent rounded-3xl blur-xl transition-opacity duration-500",
              isHovered ? "opacity-70" : "opacity-30",
              "hidden md:block"
            )} />

            <Card className="relative bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-sm border-border/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-3 pt-5 px-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="mx-auto mb-2"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-7 w-7 text-primary-foreground" />
                  </div>
                </motion.div>
                <CardTitle className="font-display text-2xl">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Join our premium beauty community
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-3 px-5">
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">First Name</Label>
                      <div className="relative group">
                        <Input
                          placeholder="John"
                          className={cn(
                            "pl-9 h-10 sm:h-11 text-sm rounded-lg border-2 bg-background/50",
                            "transition-all duration-300",
                            "focus:border-primary focus:ring-2 focus:ring-primary/20",
                            "group-hover:border-primary/50",
                            errors.first_name && "border-destructive focus:border-destructive"
                          )}
                          value={formData.first_name}
                          onChange={(e) => handleChange('first_name', e.target.value)}
                          required
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                      </div>
                      {errors.first_name && (
                        <p className="text-[10px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.first_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Last Name</Label>
                      <div className="relative group">
                        <Input
                          placeholder="Doe"
                          className={cn(
                            "pl-9 h-10 sm:h-11 text-sm rounded-lg border-2 bg-background/50",
                            "transition-all duration-300",
                            "focus:border-primary focus:ring-2 focus:ring-primary/20",
                            "group-hover:border-primary/50",
                            errors.last_name && "border-destructive focus:border-destructive"
                          )}
                          value={formData.last_name}
                          onChange={(e) => handleChange('last_name', e.target.value)}
                          required
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                      </div>
                      {errors.last_name && (
                        <p className="text-[10px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Email Address</Label>
                    <div className="relative group">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className={cn(
                          "pl-9 h-10 sm:h-11 text-sm rounded-lg border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50",
                          errors.email && "border-destructive focus:border-destructive"
                        )}
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                    </div>
                    {errors.email && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Phone Number</Label>
                    <div className="relative group">
                      <Input
                        type="tel"
                        placeholder="+1 (825) 000-0000"
                        className={cn(
                          "pl-9 h-10 sm:h-11 text-sm rounded-lg border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50",
                          errors.mobile_number && "border-destructive focus:border-destructive"
                        )}
                        value={formData.mobile_number}
                        onChange={(e) => handleChange('mobile_number', e.target.value)}
                        required
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                    </div>
                    {errors.mobile_number && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.mobile_number}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Password</Label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "pl-9 pr-9 h-10 sm:h-11 text-sm rounded-lg border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50",
                          errors.password && "border-destructive focus:border-destructive"
                        )}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
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
                    
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Password strength:</span>
                          <span className={cn(
                            "font-medium",
                            passwordStrength === 4 && "text-green-600",
                            passwordStrength === 3 && "text-yellow-600",
                            passwordStrength <= 2 && "text-destructive"
                          )}>
                            {passwordStrengthText()}
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-300", passwordStrengthColor())}
                            style={{ width: `${passwordStrength * 25}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Confirm Password</Label>
                    <div className="relative group">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "pl-9 pr-9 h-10 sm:h-11 text-sm rounded-lg border-2 bg-background/50",
                          "transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "group-hover:border-primary/50",
                          errors.cpassword && "border-destructive focus:border-destructive"
                        )}
                        value={formData.cpassword}
                        onChange={(e) => handleChange('cpassword', e.target.value)}
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.cpassword && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.cpassword}
                      </p>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-start space-x-2.5">
                      <button
                        type="button"
                        onClick={() => setTermsAccepted(!termsAccepted)}
                        className={cn(
                          "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                          termsAccepted 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-border hover:border-primary"
                        )}
                      >
                        {termsAccepted && <Check className="h-2.5 w-2.5" />}
                      </button>
                      <div className="flex-1">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          I agree to the{" "}
                          <a href="#" className="text-primary hover:underline font-medium">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:underline font-medium">
                            Privacy Policy
                          </a>
                        </p>
                        {errors.terms && (
                          <p className="text-[10px] text-destructive mt-0.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.terms}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full h-11 sm:h-12 text-sm font-medium rounded-lg",
                      "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
                      "shadow-lg hover:shadow-xl transition-all duration-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "group mt-1"
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
                          Creating Account...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          Create Premium Account
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="border-t border-border/50 pt-3.5 px-5 pb-5">
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                    >
                      Sign in here
                    </Link>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                    By creating an account, you agree to receive offers and updates
                  </p>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Mobile Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 md:hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-xs">15% Off</h3>
                    <p className="text-[10px] text-muted-foreground">First order</p>
                  </div>
                </div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-xs">Early Access</h3>
                    <p className="text-[10px] text-muted-foreground">New arrivals</p>
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
            className="mt-5 flex justify-center"
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

export default Register;