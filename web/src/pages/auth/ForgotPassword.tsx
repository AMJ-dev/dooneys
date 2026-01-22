import { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Mail, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  Shield, 
  Sparkles,
  Lock,
  RefreshCw,
  Send,
  AlertCircle,
  ChevronLeft,
  Smartphone,
  Mail as MailIcon
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

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await http.post("/reset-password/", { email, where: "send-link" });
      const resp: ApiResp = res.data;
      
      if (resp.error === false && resp.data) {
        toast.success(resp.data);
        setSubmitted(true);
        return;
      } 
      setError(resp.data || "Failed to send reset link");
      toast.error(resp.data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setSubmitted(false);
    setEmail("");
    setError("");
  };

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
                  <Lock className="h-10 w-10 text-primary-foreground" />
                </div>
              </motion.div>
              <CardTitle className="font-display text-3xl md:text-4xl mb-2">
                Reset Your Password
              </CardTitle>
              <CardDescription className="text-lg">
                {submitted 
                  ? "Check your email for next steps" 
                  : "Enter your email to receive a reset link"}
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
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Check Your Email
                    </h3>
                    
                    <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <MailIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium">Email Sent To:</span>
                      </div>
                      <p className="text-lg font-semibold text-primary break-all">
                        {email}
                      </p>
                    </div>
                    
                    <p className="text-muted-foreground mb-8">
                      We've sent a password reset link to your email address. 
                      The link will expire in 15 minutes for security.
                    </p>

                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        onClick={handleResend}
                        className="w-full h-12 gap-3 border-primary/30 hover:border-primary hover:bg-primary/5"
                      >
                        <RefreshCw className="h-5 w-5" />
                        Try Different Email
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">
                        Didn't receive the email?{" "}
                        <button
                          onClick={() => {
                            setSubmitted(false);
                            setTimeout(() => {
                              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                            }, 100);
                          }}
                          className="text-primary font-medium hover:underline"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
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
                      {/* Email Input */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <div className="relative group">
                          <Input
                            type="email"
                            placeholder="you@example.com"
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
                          />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                        </div>
                        
                        {/* Error Message */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-start gap-2 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl"
                            >
                              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-destructive">{error}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={loading}
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
                              Sending Reset Link...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="default"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-3"
                            >
                              Send Reset Link
                              <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </form>

                    <Separator className="my-6" />

                    {/* Security Guidelines */}
                    <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-2xl border border-border/50">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Security Guidelines
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>Reset links expire in 15 minutes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>Check your spam folder if you don't see the email</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt=1.5 flex-shrink-0" />
                          <span>Never share your password or reset links</span>
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
                  Need immediate assistance?{" "}
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

          {/* Additional Options */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            <Button
              variant="outline"
              className="gap-2 border-border/50 hover:border-primary/30"
              onClick={() => navigate("/contact")}
            >
              <Smartphone className="h-4 w-4" />
              Contact Support
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-border/50 hover:border-primary/30"
              onClick={() => navigate("/faq")}
            >
              <Sparkles className="h-4 w-4" />
              FAQ
            </Button>
          </motion.div>

          {/* Bottom Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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

export default ForgetPassword;