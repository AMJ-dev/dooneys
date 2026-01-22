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
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className="absolute"
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: currentSlide === index ? 1 : 0,
                y: currentSlide === index ? 0 : 30,
              }}
              transition={{ duration: 0.6 }}
              style={{ pointerEvents: currentSlide === index ? "auto" : "none" }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm border border-primary/30">
                Welcome to {comp_name}
              </span>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-card leading-tight mb-6">
                {slide.title}
              </h1>

              <p className="text-xl md:text-2xl text-card/90 mb-4 font-light">
                {slide.subtitle}
              </p>

              <p className="text-card/80 text-lg mb-8 max-w-xl">
                {slide.description}
              </p>
            </motion.div>
          ))}

          {/* Static CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 mt-[280px] md:mt-[320px]"
          >
            <Button size="lg" className="group" asChild>
              <Link to="/shop">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Shop Now
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-card/10 border-card/30 text-card hover:bg-card hover:text-foreground" asChild>
              <Link to="/contact">
                <Calendar className="h-5 w-5 mr-2" />
                Book In-Store Appointment
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto shadow-lg bg-background/80 backdrop-blur-sm"
          onClick={() => handleManualNavigation("prev")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto shadow-lg bg-background/80 backdrop-blur-sm"
          onClick={() => handleManualNavigation("next")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setIsAutoPlaying(false);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-primary w-8"
                : "bg-card/50 hover:bg-card/80"
            }`}
          />
        ))}
      </div>

      {/* Decorative scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-card/50 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ height: ["0%", "50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1 bg-card/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
