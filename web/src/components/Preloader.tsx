import { useEffect, useState } from "react";
import { Sparkles, Gem, Crown } from "lucide-react";
import { comp_name } from "@/lib/constants";

const Preloader = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsVisible(false), 800);
    }, 1800);
    
    return () => clearTimeout(fadeTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-white transition-all duration-700 ease-in-out ${
        fadeOut 
          ? "opacity-0 pointer-events-none" 
          : "opacity-100"
      }`}
    >
      {/* Minimalist floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center space-y-10 px-6">
        {/* Premium minimalist logo */}
        <div className="relative">
          {/* Subtle outer glow */}
          <div className="absolute -inset-6 bg-gradient-gold opacity-5 blur-xl rounded-full" />
          
          {/* Main logo container */}
          <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-2xl flex items-center justify-center group">
            {/* Reflective shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-3xl" />
            
            {/* Inner subtle shadow */}
            <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-white to-gray-50/50" />
            
            {/* Logo content */}
            <div className="relative z-10 flex flex-col items-center space-y-4">
              {/* Premium icon cluster */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Gem className="w-10 h-10 text-gold animate-logoBounce" />
                  <div className="absolute -inset-2 bg-gradient-gold rounded-full blur opacity-10" />
                </div>
                <Crown className="w-8 h-8 text-gold-dark animate-logoBounce" style={{ animationDelay: '0.1s' }} />
              </div>
              
              {/* Monogram with premium touch */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-gold rounded-full blur opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                <div className="relative">
                  <span className="font-heading font-black text-4xl tracking-tight bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
                    PG
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle corner accents */}
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t border-r border-gold/30" />
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-gold/30" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-gold/30" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b border-l border-gold/30" />
        </div>

        {/* Company name */}
        <div className="relative text-center">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {comp_name}
            </span>
          </h1>
          
          {/* Elegant underline */}
          <div className="relative mt-6">
            <div className="h-px w-48 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-gold-light via-gold to-gold-light" />
          </div>
        </div>

        {/* Premium loading indicator */}
        <div className="w-full max-w-xs space-y-6">
          {/* Minimalist progress bar */}
          <div className="relative">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold-light via-gold to-gold-light rounded-full animate-shimmer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ animationDuration: '2s' }} />
              </div>
            </div>
            
            {/* Progress dots */}
            <div className="flex justify-between mt-2">
              {[0, 25, 50, 75, 100].map((point) => (
                <div key={point} className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mb-1" />
                  <span className="text-xs text-gray-400 font-medium">{point}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status text */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              <p className="text-gray-600 font-medium tracking-wide">
                Loading Premium Experience
              </p>
            </div>
            <p className="text-sm text-gray-400 font-light">
              Initializing systems
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Preloader;