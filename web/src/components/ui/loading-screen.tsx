import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minimumLoadTime?: number;
}

const LoadingScreen = ({ 
  onLoadingComplete, 
  minimumLoadTime = 2200 
}: LoadingScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, minimumLoadTime / 100);

    const timer = setTimeout(() => {
      setIsLoading(false);
      onLoadingComplete?.();
      clearInterval(interval);
    }, minimumLoadTime);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [minimumLoadTime, onLoadingComplete]);

  // Beauty product categories
  const categories = ["HAIR", "WIGS", "BRAIDS", "SKIN CARE", "FASHION", "ACCESSORIES"];

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-warm overflow-hidden"
        >
          {/* Elegant background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
            
            {/* Beauty-inspired floating particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Ornamental corners */}
            <motion.div
              className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-primary/20"
              initial={{ opacity: 0, x: -20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.div
              className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-primary/20"
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center px-4 max-w-md w-full">
            {/* Brand Logo - Elegant typography */}
            <motion.div
              className="mb-8 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {/* Logo glow */}
              <motion.div
                className="absolute -inset-4 bg-gradient-primary rounded-full opacity-20 blur-xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Beauty icon/emblem */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="relative"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 1,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  {/* Blossom/Flower inspired icon */}
                  <div className="relative w-16 h-16">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0"
                        animate={{ rotate: i * 60 }}
                      >
                        <motion.div
                          className="absolute top-0 left-1/2 w-6 h-6 -ml-3 bg-gradient-primary rounded-full"
                          style={{
                            transform: `rotate(${i * 60}deg) translateY(-12px)`,
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.6 + i * 0.1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </motion.div>
                    ))}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-warm border-2 border-white shadow-soft" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              className="text-center mb-2 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-display font-bold text-gradient tracking-wide"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                {"Doonneys".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.7 + i * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p
                className="text-sm tracking-[0.3em] uppercase text-secondary mt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                Beauty & Style
              </motion.p>
            </motion.div>

            {/* Categories carousel */}
            <motion.div
              className="h-6 mb-8 overflow-hidden relative w-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                animate={{
                  y: [0, -360], // Move through all categories
                }}
                transition={{
                  duration: categories.length * 1.5,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {[...categories, ...categories].map((category, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="h-6 flex items-center justify-center"
                  >
                    <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
                      {category}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="w-full max-w-xs mb-6"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <div className="relative h-px bg-border overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: minimumLoadTime / 1000, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-primary shadow-elevated"
                  animate={{ left: `${progress}%` }}
                  transition={{ duration: minimumLoadTime / 1000, ease: "linear" }}
                />
              </div>
            </motion.div>

            {/* Loading text with dots animation */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                Curating Your Beauty Experience
              </span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Beauty quote */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9 }}
            >
              <p className="text-xs italic text-muted-foreground max-w-xs">
                "Where beauty meets elegance, and style becomes you."
              </p>
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;