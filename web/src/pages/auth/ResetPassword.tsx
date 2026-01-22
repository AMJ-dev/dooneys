import { useState, useEffect, startTransition } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  Key,
  Lock as LockIcon
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingScreen from "@/components/ui/loading-screen";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { cn } from "@/lib/utils";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { link1, link2 } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    cpassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (link1 && link2) {
      setIsLoading(true);
      try {
        (async() => {
          const res = await http.post('/check-link/', { link1, link2 });
          const resp: ApiResp = res.data;
          if (resp?.error === false && resp?.data) return;
          toast.error(resp?.data || "Invalid or expired reset link");
          startTransition(() => navigate("/forgot-password"));
        })()
      } catch (error) {
        toast.error("Failed to validate reset link");
      } finally {
        setIsLoading(false);
      }
    }
  }, [link1, link2, navigate]);

  useEffect(() => {
    const checkPasswordStrength = (password: string) => {
      const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
      };
      
      setPasswordRequirements(requirements);
      
      const metRequirements = Object.values(requirements).filter(Boolean).length;
      const strength = (metRequirements / 5) * 100;
      setPasswordStrength(strength);
    };

    checkPasswordStrength(formData.password);
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 80) return "bg-emerald-500";
    if (passwordStrength >= 60) return "bg-amber-500";
    if (passwordStrength >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 80) return "Strong";
    if (passwordStrength >= 60) return "Good";
    if (passwordStrength >= 40) return "Fair";
    return "Weak";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength < 80) {
      newErrors.password = "Please meet all password requirements";
    }

    if (!formData.cpassword) {
      newErrors.cpassword = "Please confirm your password";
    } else if (formData.password !== formData.cpassword) {
      newErrors.cpassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const res = await http.post("/reset-password/", {
        link1,
        link2,
        password: formData.password,
        cpassword: formData.cpassword,
        where: "reset-link"
      });
      
      const resp: ApiResp = res.data;
      if (resp.error === false) {
        toast.success("Password reset successfully!");
        setSubmitted(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        toast.error(resp.data || "Failed to reset password");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

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
          className="w-full max-w-md"
        >
          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm rounded-full border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Secure Password Reset</span>
            </div>
          </motion.div>

          <Card 
            className="relative bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-sm border-border/50 shadow-2xl rounded-3xl overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Glow Effect */}
            <div className={cn(
              "absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-transparent rounded-3xl blur-xl transition-opacity duration-500",
              isHovered ? "opacity-70" : "opacity-30"
            )} />

            <CardHeader className="text-center pb-6 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="mx-auto mb-4"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <Key className="h-10 w-10 text-primary-foreground" />
                </div>
              </motion.div>
              <CardTitle className="font-display text-3xl md:text-4xl mb-2">
                Reset Password
              </CardTitle>
              <CardDescription className="text-lg">
                Create a new secure password for your account
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6 relative z-10">
              <AnimatePresence mode="wait">
                {submitted ? (
                  // Success State
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Password Updated!
                    </h3>
                    
                    <p className="text-muted-foreground mb-8">
                      Your password has been successfully reset. You will be redirected to the login page shortly.
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Redirecting in 3 seconds...</span>
                    </div>

                    <Button
                      onClick={() => navigate("/login")}
                      className="gap-2 bg-gradient-to-r from-primary to-accent"
                    >
                      Go to Login
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  // Form State
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* New Password Input */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <LockIcon className="h-4 w-4" />
                          New Password
                        </Label>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={cn(
                              "pl-12 pr-12 h-14 text-base rounded-xl border-2 bg-background/50",
                              "transition-all duration-300",
                              "focus:border-primary focus:ring-2 focus:ring-primary/20",
                              "group-hover:border-primary/50",
                              errors.password && "border-destructive focus:border-destructive"
                            )}
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            required
                          />
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Password Strength</span>
                              <span className={cn(
                                "text-xs font-bold",
                                passwordStrength >= 80 && "text-emerald-600",
                                passwordStrength >= 60 && passwordStrength < 80 && "text-amber-600",
                                passwordStrength >= 40 && passwordStrength < 60 && "text-orange-600",
                                passwordStrength < 40 && "text-red-600"
                              )}>
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all duration-300", getPasswordStrengthColor())}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Password Requirements */}
                        {formData.password && (
                          <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-border/50">
                            <h4 className="text-xs font-medium mb-2">Password Requirements:</h4>
                            <div className="space-y-1.5">
                              {[
                                { label: "At least 8 characters", met: passwordRequirements.length },
                                { label: "One uppercase letter", met: passwordRequirements.uppercase },
                                { label: "One lowercase letter", met: passwordRequirements.lowercase },
                                { label: "One number", met: passwordRequirements.number },
                                { label: "One special character", met: passwordRequirements.special },
                              ].map((req, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  {req.met ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <X className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span className={req.met ? "text-emerald-700" : "text-muted-foreground"}>
                                    {req.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {errors.password && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password Input */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <LockIcon className="h-4 w-4" />
                          Confirm Password
                        </Label>
                        <div className="relative group">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={cn(
                              "pl-12 pr-12 h-14 text-base rounded-xl border-2 bg-background/50",
                              "transition-all duration-300",
                              "focus:border-primary focus:ring-2 focus:ring-primary/20",
                              "group-hover:border-primary/50",
                              errors.cpassword && "border-destructive focus:border-destructive"
                            )}
                            value={formData.cpassword}
                            onChange={(e) => handleChange('cpassword', e.target.value)}
                            required
                          />
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        
                        {/* Password Match Indicator */}
                        {formData.cpassword && (
                          <div className="flex items-center gap-2 text-xs">
                            {formData.password === formData.cpassword ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-700">Passwords match</span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 text-destructive" />
                                <span className="text-destructive">Passwords do not match</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        {errors.cpassword && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.cpassword}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={loading || passwordStrength < 80}
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
                              Updating Password...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="default"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-3"
                            >
                              Reset Password
                              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </form>

                    <Separator className="my-6" />

                    {/* Security Tips */}
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Security Tips
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>Use a unique password for this account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>Consider using a password manager</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>Enable two-factor authentication after login</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-6 relative z-10">
              <div className="w-full text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Login
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Having issues?{" "}
                  <a 
                    href="mailto:support@doonneysbeauty.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Bottom Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/50 shadow-lg">
              <Lock className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium">256-bit SSL • Encrypted Connection</span>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default ResetPassword;