import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";
import storeInterior from "@/assets/store-interior.jpg";
import productsDisplay from "@/assets/products-display.jpg";
import { comp_name } from "@/lib/constants";

const slides = [
  {
    image: heroImage,
    title: "Your One-Stop Beauty & Lifestyle Store in Edmonton",
    subtitle: "Hair • Wigs • Braids • Skin Care • Fashion • Accessories",
    description: "Shop online or book an appointment to visit in store.",
  },
  {
    image: storeInterior,
    title: "Visit Our Store",
    subtitle: "In-Store Experience Available",
    description: "Book an appointment to explore our full collection in person.",
  },
  {
    image: productsDisplay,
    title: "Premium Quality Products",
    subtitle: "Curated Selection for You",
    description: "From wigs to skincare, we have everything you need.",
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleManualNavigation = (direction: "next" | "prev") => {
    setIsAutoPlaying(false);
    if (direction === "next") nextSlide();
    else prevSlide();
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative h-screen max-h-[1080px] min-h-[700px] flex items-center overflow-hidden">
      {/* Background Images with Transition */}
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: currentSlide === index ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover object-center"
            initial={{ scale: 1.1 }}
            animate={{ scale: currentSlide === index ? 1 : 1.1 }}
            transition={{ duration: 6, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="container relative z-20 px-4 md:px-6">
        <div className="max-w-3xl">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: currentSlide === index ? 1 : 0,
                y: currentSlide === index ? 0 : 30,
                display: currentSlide === index ? "block" : "none"
              }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium backdrop-blur-sm border border-primary/30"
              >
                Welcome to {comp_name}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-5xl lg:text-7xl text-white leading-tight md:leading-tight lg:leading-tight font-bold drop-shadow-lg"
              >
                {slide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-4 font-light drop-shadow-md"
              >
                {slide.subtitle}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl drop-shadow"
              >
                {slide.description}
              </motion.p>
            </motion.div>
          ))}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10"
          >
            <Button 
              size="lg" 
              className="group bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer" 
              asChild
            >
              <Link to="/shop">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Shop Now
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-foreground px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer" 
              asChild
            >
              <Link to="/contact">
                <Calendar className="h-5 w-5 mr-2" />
                Book Appointment
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows - Positioned better */}
      <div className="absolute left-4 md:left-8 right-4 md:right-8 top-1/2 -translate-y-1/2 flex justify-between z-30 pointer-events-none">
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 hover:scale-110 transition-all duration-300 cursor-pointer"
          onClick={() => handleManualNavigation("prev")}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 hover:scale-110 transition-all duration-300 cursor-pointer"
          onClick={() => handleManualNavigation("next")}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide Indicators - Modern styling */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className={`group relative cursor-pointer py-2 px-1`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={`transition-all duration-500 rounded-full ${
                currentSlide === index
                  ? "w-12 h-2 bg-primary"
                  : "w-3 h-3 bg-white/50 group-hover:bg-white/80 group-hover:scale-110"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll Indicator - Subtle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/60 z-30 pointer-events-none"
        style={{ bottom: '5rem' }}
      >
        <span className="text-xs uppercase tracking-wider font-light">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-1 h-1.5 bg-white/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;