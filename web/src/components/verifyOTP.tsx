import { useState, useRef, useContext, useEffect, startTransition } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Loader2, 
  Mail,
  Smartphone,
  Lock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Fingerprint,
  Smartphone as DeviceIcon,
  MapPin,
  ChevronLeft,
  Eye,
  EyeOff,
  Key,
  Sparkles,
  BadgeCheck,
  Shield
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { useLocationInfo } from "@/hooks/useLocationInfo";
import userContext from "@/lib/userContext";
import LoadingScreen from "@/components/ui/loading-screen";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;
type Role = "account" | "admin";

const VerifyOTP = ({role}: {role: Role}) => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect"); 
  
  const navigate = useNavigate();
  const context = useContext(userContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  const { login } = context;
  const deviceInfo = useDeviceInfo();
  const { locationInfo, loading: locationLoading } = useLocationInfo();

  const [jwt, setJwt] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [submited, setSubmited] = useState(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>("");

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  useEffect(() => {
    const JWT = sessionStorage.getItem("jwt");
    const Email = sessionStorage.getItem("email");
    const Redirect = sessionStorage.getItem("redirect");

    if (!JWT || !Email) {
      startTransition(() => navigate(`/login`));
      return;
    }

    setJwt(JWT);
    setEmail(Email);
    
    const savedCountdown = sessionStorage.getItem("otpCountdown");
    if (savedCountdown) {
      const remainingTime = parseInt(savedCountdown, 10);
      if (remainingTime > 0) {
        setCountdown(remainingTime);
        setCanResend(false);
      } else {
        setCanResend(true);
      }
    }

    // Auto-focus first input
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 300);
  }, []);

  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => {
          const newCountdown = c - 1;
          sessionStorage.setItem("otpCountdown", newCountdown.toString());
          return newCountdown;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (!canResend && countdown === 0) {
      setCanResend(true);
      sessionStorage.removeItem("otpCountdown");
    }
  }, [countdown, canResend]);


  const formatDeviceInfo = () =>
    `${deviceInfo.browser} on ${deviceInfo.os} (${deviceInfo.deviceType})`;

  const formatLocationInfo = () => {
    if (!locationInfo) return "Location information not available";
    return `${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setVerificationError("");

    if (value && index < OTP_LENGTH - 1) {
      setTimeout(() => focusInput(index + 1), 10);
    }

    // Auto-submit if last digit entered
    if (value && index === OTP_LENGTH - 1) {
      const fullCode = next.join("");
      if (fullCode.length === OTP_LENGTH) {
        setTimeout(() => handleSubmit(), 300);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        focusInput(index - 1);
      } else {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = pasted.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);
    setOtp(next);
    setVerificationError("");
    
    setTimeout(() => {
      focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
      
      // Auto-submit if full code pasted
      if (pasted.length === OTP_LENGTH) {
        setTimeout(() => handleSubmit(), 300);
      }
    }, 10);
  };

  const handleResend = async () => {
    if (!canResend) return;

    setSubmited(true);
    try {
      const res = await http.post("/resend-otp/", { jwt });
      const resp: ApiResp = res.data;

      if (resp?.error === false && resp?.data) {
        toast.success("New verification code sent to your email");

        setCountdown(60);
        setCanResend(false);
        setOtp(Array(OTP_LENGTH).fill(""));
        setVerificationError("");
        
        sessionStorage.setItem("otpCountdown", "60");
        
        setTimeout(() => {
          inputsRef.current[0]?.focus();
        }, 100);
        
        return;
      }

      toast.error(resp.data || "Failed to resend code");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setSubmited(false);
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setVerificationError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const email = sessionStorage.getItem("email");
      if (!email) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      const res = await http.post("/verify-otp/", {
        email,
        otp: code, 
        jwt,
        device_info: formatDeviceInfo(),
        location_info: formatLocationInfo(),
        device_type: deviceInfo.deviceType, 
        platform: deviceInfo.os, 
        browser: deviceInfo.browser, 
      });


      const resp: ApiResp = res.data;

      if (resp.error) {
        setVerificationError(resp.data || "Invalid verification code");
        return;
      }

      toast.success("Identity verified successfully!");
      login({token: resp.code?.jwt, remember: true})
      const page = sessionStorage.getItem('redirect') || `/${role}`;
      sessionStorage.removeItem('redirect');
      sessionStorage.removeItem("otpCountdown");
      
      setTimeout(() => location.href = page, 2000);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to verify code";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <section className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-primary/10 to-accent/10"
              style={{
                width: `${Math.random() * 80 + 40}px`,
                height: `${Math.random() * 80 + 40}px`,
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-6 px-2"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm rounded-full border border-primary/20">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Secure Identity Verification</span>
            </div>
          </motion.div>

          <Card className="relative bg-gradient-to-b from-card/95 to-card/70 backdrop-blur-sm border-border/50 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden mx-1 sm:mx-0">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-primary/20 via-accent/20 to-transparent rounded-2xl sm:rounded-3xl blur-xl opacity-20" />

            <CardHeader className="text-center pb-4 sm:pb-6 relative z-10 px-4 sm:px-6 pt-6 sm:pt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Fingerprint className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
                </div>
              </motion.div>
              <CardTitle className="font-display text-2xl sm:text-3xl md:text-4xl mb-2">
                Verify Your Identity
              </CardTitle>
              <CardDescription className="text-base sm:text-lg break-words px-2">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-primary break-all">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-4 sm:pb-6 relative z-10 px-4 sm:px-6">
              {/* Device & Location Info */}
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl sm:rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <DeviceIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="font-medium text-sm sm:text-base">Device Information</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">{formatDeviceInfo()}</p>
                
                {locationInfo && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-medium text-sm sm:text-base">Location</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">{formatLocationInfo()}</p>
                  </>
                )}
              </div>

              {/* OTP Input Section */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-sm sm:text-base font-medium block mb-3 sm:mb-4 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div
                    className="flex justify-center gap-2 sm:gap-3 mb-4"
                    onPaste={handlePaste}
                  >
                    {otp.map((value, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0"
                      >
                        <Input
                          ref={(el) => (inputsRef.current[index] = el)}
                          value={value}
                          inputMode="numeric"
                          maxLength={1}
                          autoFocus={index === 0}
                          onChange={(e) => handleChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className={cn(
                            "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16",
                            "text-center text-xl sm:text-2xl md:text-3xl font-bold",
                            "border-2 bg-background/70 backdrop-blur-sm",
                            "focus:border-primary focus:ring-2 focus:ring-primary/20",
                            "transition-all duration-200 rounded-xl sm:rounded-2xl",
                            value && "border-primary/50 bg-primary/5 shadow-inner",
                            "px-0" // Remove horizontal padding to prevent overflow
                          )}
                          style={{ 
                            minWidth: "0", // Prevent flexbox from expanding
                            maxWidth: "100%" // Ensure it doesn't overflow
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {verificationError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-destructive/10 border border-destructive/20 rounded-lg sm:rounded-xl mb-3 sm:mb-4"
                      >
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-destructive leading-tight">{verificationError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Countdown Timer */}
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    {!canResend ? (
                      <motion.div
                        key="countdown"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                      >
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
                        <div className="text-left">
                          <p className="text-xs sm:text-sm font-medium text-primary">
                            Resend code in {formatTime(countdown)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Check your email for the code
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="resend"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-sm text-muted-foreground"
                      >
                        <p className="mb-2">Didn't receive the code?</p>
                        <Button
                          onClick={handleResend}
                          variant="outline"
                          size="sm"
                          disabled={!canResend || submited}
                          className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-xs sm:text-sm px-3 sm:px-4"
                        >
                          <AnimatePresence mode="wait">
                            {submited ? (
                              <motion.span
                                key="loading"
                                initial={{ opacity: 0, rotate: -180 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 180 }}
                              >
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              </motion.span>
                            ) : (
                              <motion.span
                                key="icon"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {submited ? "Sending..." : "Resend Code"}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={otp.join("").length !== OTP_LENGTH || isVerifying}
                  className={cn(
                    "w-full h-12 sm:h-14 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl",
                    "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
                    "shadow-lg hover:shadow-xl transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "group mt-4"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isVerifying ? (
                      <motion.div
                        key="verifying"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Verifying...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        Verify & Continue
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                {/* Auto-submit notice */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3">
                  <CheckCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="text-center">Will auto-submit when all digits are entered</span>
                </div>
              </div>

              <Separator className="my-4 sm:my-6" />

              {/* Security Info */}
              <div className="p-3 sm:p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl sm:rounded-2xl border border-border/50">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Shield className="h-4 w-4 text-primary" />
                  Security Notice
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  This code expires in 10 minutes. Never share your verification code with anyone.
                  Doonneys Beauty will never ask for this code.
                </p>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-4 sm:pt-6 relative z-10 px-4 sm:px-6 pb-6">
              <div className="w-full text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm px-3"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  Back to login
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Need help? Contact{" "}
                  <a 
                    href="mailto:support@doonneysbeauty.com" 
                    className="text-primary hover:underline break-words"
                  >
                    support@doonneysbeauty.com
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
            className="mt-4 sm:mt-6 flex items-center justify-center px-2"
          >
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/50 shadow-lg max-w-full">
              <Lock className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-xs font-medium truncate">256-bit SSL • Encrypted Connection</span>
            </div>
          </motion.div>

          {/* Mobile Helper Tips */}
          <div className="mt-4 sm:hidden">
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Tip: Tap and hold to paste code</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-3 w-3 text-primary" />
                <span>Code will auto-submit when complete</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default VerifyOTP;