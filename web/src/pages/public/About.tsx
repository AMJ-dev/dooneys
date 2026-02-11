import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Heart,
  Users,
  Star,
  Sparkles,
  MapPin,
  Clock,
  ShoppingBag,
  Shield,
  Award,
  Gem,
  Palette,
  Camera,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle,
  Store,
  Truck,
  Package,
  Globe,
  RefreshCw,
  Target,
  Eye,
  TrendingUp,
  Layers,
  Infinity,
  Wind,
  Flower2,
  Leaf,
  Sparkle
} from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import storeInterior from "@/assets/store-interior.jpg";
import { comp_name } from "@/lib/constants";

const values = [
  {
    icon: Gem,
    title: "Premium Quality",
    description: "Curated selection of luxury beauty products that meet our exacting standards.",
    color: "primary"
  },
  {
    icon: Users,
    title: "Personalized Service",
    description: "One-on-one consultations and personalized beauty recommendations.",
    color: "accent"
  },
  {
    icon: Shield,
    title: "Authenticity Guaranteed",
    description: "100% genuine products from authorized distributors and trusted brands.",
    color: "secondary"
  },
  {
    icon: Sparkles,
    title: "Beauty Innovation",
    description: "Stay ahead with the latest trends and innovative beauty solutions.",
    color: "highlight"
  },
  {
    icon: Heart,
    title: "Community Focused",
    description: "Supporting local beauty enthusiasts and building lasting relationships.",
    color: "destructive"
  },
  {
    icon: Award,
    title: "Excellence Driven",
    description: "Committed to excellence in every product and customer interaction.",
    color: "primary"
  },
];

const milestones = [
  { year: "2020", title: "A Humble Beginning", description: "Founded with passion and purpose in Edmonton" },
  { year: "2021", title: "Digital Expansion", description: "Launched our flagship e-commerce platform" },
  { year: "2022", title: "Flagship Boutique", description: "Opened our first luxury retail space" },
  { year: "2023", title: "Curated Excellence", description: "Expanded to 500+ premium beauty products" },
  { year: "2024", title: "Community Milestone", description: "Celebrating 10,000+ cherished customers" },
];

const aboutContent = {
  hero: {
    title: "Redefining Beauty Retail",
    subtitle: "At {comp_name}, we blend luxury beauty with personalized service. What started as a passion project in Edmonton has grown into a destination for beauty enthusiasts seeking authenticity and quality."
  },
  mission: {
    title: "Our Vision",
    description: "To create a beauty destination where every customer feels valued, every product tells a story, and every purchase becomes a memorable experience. We're not just selling beauty products—we're curating confidence and self-expression."
  },
  store: {
    title: "Experience Luxury In Store",
    description: "Our beautifully curated store offers an intimate shopping experience. Book a private appointment to explore our collection with personalized guidance from our beauty experts.",
    features: [
      "Private shopping appointments",
      "Personal beauty consultations",
      "Product testing & demonstrations"
    ]
  }
};

const About = () => {
  return (
    <Layout>
      {/* Hero Section - Cinematic Experience */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Premium Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,_hsl(var(--accent)/0.15),transparent_50%)]" />
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-background via-background/50 to-transparent" />
          
          {/* Animated Orbs */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                background: `radial-gradient(circle, hsl(var(--${i % 2 === 0 ? 'primary' : 'accent'})/0.03) 0%, transparent 70%)`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Content - Premium Typography */}
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-full border border-primary/20 backdrop-blur-sm"
                >
                  <Sparkle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium tracking-wide">Since 2020 • Edmonton</span>
                  <Sparkle className="h-4 w-4 text-accent" />
                </motion.div>
                
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight">
                  Redefining
                  <span className="relative ml-4">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
                      Beauty
                    </span>
                    <motion.span
                      className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/20 blur-xl"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </span>
                  <br />Retail
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground/90 leading-relaxed max-w-xl font-light">
                  {aboutContent.hero.subtitle.replace('{comp_name}', comp_name)}
                </p>

                <div className="flex flex-wrap gap-5 pt-4">
                  <Button 
                    size="lg" 
                    asChild 
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-7 text-lg shadow-2xl hover:shadow-primary/25 transition-all duration-500"
                  >
                    <Link to="/shop">
                      <span className="relative z-10 flex items-center gap-2">
                        Shop Collection
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%", skewX: -15 }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.8 }}
                      />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    asChild 
                    className="group px-8 py-7 text-lg border-2 hover:bg-card/80 backdrop-blur-sm transition-all duration-300"
                  >
                    <Link to="/contact">
                      <Calendar className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Right Image - Sculptural */}
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl">
                  <img
                    src={aboutHero}
                    alt={`${comp_name} Beauty Experience`}
                    className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  
                  {/* Floating Card */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute bottom-8 left-8 right-8"
                  >
                    <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-5 border border-border/50 shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">Edmonton Based</div>
                          <div className="text-sm text-muted-foreground">Serving beauty lovers worldwide</div>
                        </div>
                        <div className="ml-auto">
                          <div className="flex -space-x-2">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-card" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light">Discover</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-px h-12 bg-gradient-to-b from-primary to-accent"
          />
        </motion.div>
      </section>

      {/* Stats Section - Minimal Luxury */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="container relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Luxury Products", icon: Package, suffix: "SKU" },
              { value: "10K+", label: "Happy Customers", icon: Users, suffix: "worldwide" },
              { value: "100%", label: "Authentic Brands", icon: Shield, suffix: "verified" },
              { value: "24/7", label: "Concierge", icon: MessageSquare, suffix: "support" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="font-display text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground/80 uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-1 font-light">
                      {stat.suffix}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section - Editorial */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.05)_0%,_transparent_70%)]" />
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2.5rem] blur-2xl opacity-30" />
                <Card className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl" />
                  
                  <CardHeader className="text-center pb-8 pt-16 px-8 md:px-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-8 mx-auto"
                    >
                      <Target className="h-10 w-10 text-primary" />
                    </motion.div>
                    
                    <CardTitle className="font-display text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight">
                      Our{" "}
                      <span className="relative">
                        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                          Vision
                        </span>
                        <motion.span
                          className="absolute -bottom-2 left-0 right-0 h-4 bg-primary/10 blur-lg"
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 }}
                        />
                      </span>
                    </CardTitle>
                    
                    <CardDescription className="text-2xl md:text-3xl text-muted-foreground/90 leading-relaxed font-light max-w-3xl mx-auto">
                      "{aboutContent.mission.description}"
                    </CardDescription>
                  </CardHeader>

                  <Separator className="my-8 opacity-50" />

                  <CardContent className="px-8 md:px-16 pb-16">
                    <div className="grid md:grid-cols-3 gap-10">
                      {[
                        { icon: Globe, title: "Global Standards", text: "International quality assurance", gradient: "from-primary/10 to-primary/5" },
                        { icon: Truck, title: "Seamless Delivery", text: "Reliable shipping across Canada", gradient: "from-accent/10 to-accent/5" },
                        { icon: RefreshCw, title: "Satisfaction Guaranteed", text: "30-day premium return policy", gradient: "from-secondary/10 to-secondary/5" },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="text-center group"
                          >
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="h-7 w-7 text-primary" />
                            </div>
                            <h4 className="font-medium text-lg mb-2">{item.title}</h4>
                            <p className="text-sm text-muted-foreground/80">{item.text}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section - Contemporary Grid */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/20" />
        <div className="container relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "80px" }}
                viewport={{ once: true }}
                className="h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6"
              />
              <h2 className="font-display text-5xl md:text-6xl mb-6 tracking-tight">
                Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Core Values
                </span>
              </h2>
              <p className="text-xl text-muted-foreground/80 font-light max-w-2xl mx-auto">
                The principles that guide every decision and interaction
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <ScrollReveal key={value.title} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -12, scale: 1.02 }}
                    className="group relative h-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />
                    <Card className="relative bg-gradient-to-b from-card to-card/80 backdrop-blur-sm border border-border/50 h-full group-hover:border-primary/30 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      <CardContent className="p-8">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-${value.color}/20 to-${value.color}/5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-8 w-8 text-${value.color}`} />
                        </div>
                        <CardTitle className="text-2xl mb-4 group-hover:text-primary transition-colors">
                          {value.title}
                        </CardTitle>
                        <p className="text-muted-foreground/80 leading-relaxed">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section - Elegant Journey */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "80px" }}
                viewport={{ once: true }}
                className="h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6"
              />
              <h2 className="font-display text-5xl md:text-6xl mb-6 tracking-tight">
                Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Journey
                </span>
              </h2>
              <p className="text-xl text-muted-foreground/80 font-light">
                From passion to destination: Edmonton's premier beauty experience
              </p>
            </div>
          </ScrollReveal>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-primary via-accent to-transparent" />
            
            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Year Marker */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-50" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-2xl">
                        <span className="font-display text-xl font-bold text-primary-foreground">
                          {milestone.year}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-16' : 'pl-16'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: index % 2 === 0 ? 5 : -5 }}
                      className="group"
                    >
                      <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-xl">
                        <CardContent className="p-8">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-1.5 h-1.5 rounded-full bg-${index % 2 === 0 ? 'primary' : 'accent'}`} />
                            <h3 className="font-display text-2xl font-semibold">
                              {milestone.title}
                            </h3>
                          </div>
                          <p className="text-muted-foreground/80 text-lg font-light">
                            {milestone.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Store Section - Immersive Experience */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <ScrollReveal>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-2xl">
                  <img
                    src={storeInterior}
                    alt={`${comp_name} Luxury Store`}
                    className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="absolute bottom-8 left-8 right-8"
                  >
                    <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                            <Store className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-lg">Our Sanctuary</div>
                            <div className="text-sm text-muted-foreground">By appointment only</div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="space-y-8">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium tracking-wide">Edmonton, Alberta</span>
                </motion.div>
                
                <h2 className="font-display text-5xl md:text-6xl leading-tight tracking-tight">
                  {aboutContent.store.title}
                </h2>
                
                <p className="text-xl text-muted-foreground/80 leading-relaxed font-light">
                  {aboutContent.store.description}
                </p>

                <div className="space-y-5 pt-4">
                  {aboutContent.store.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg group-hover:scale-110 transition-transform">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-lg">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-5 pt-8">
                  <Button 
                    size="lg" 
                    asChild 
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent px-8 py-7 text-lg shadow-2xl"
                  >
                    <Link to="/contact">
                      <Calendar className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                      Book Appointment
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%", skewX: -15 }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.8 }}
                      />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    asChild 
                    className="group px-8 py-7 text-lg border-2 hover:bg-card/80 backdrop-blur-sm"
                  >
                    <Link to="/contact">
                      <Phone className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section - High-Impact */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.1)_0%,_transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)/0.05)_30%,_transparent_80%)]" />
        </div>
        
        <div className="container relative z-10">
          <ScrollReveal>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[3rem] blur-3xl opacity-30" />
              <Card className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
                
                <CardContent className="p-16 md:p-24 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-8"
                  >
                    <Sparkles className="h-12 w-12 text-primary" />
                  </motion.div>
                  
                  <h2 className="font-display text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight">
                    Ready to Experience{" "}
                    <span className="relative">
                      <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        True Beauty
                      </span>
                      <motion.span
                        className="absolute -bottom-2 left-0 right-0 h-4 bg-primary/20 blur-lg"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                      />
                    </span>
                    ?
                  </h2>
                  
                  <p className="text-2xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 font-light">
                    Join thousands of satisfied customers who trust {comp_name} for their beauty journey
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button 
                      size="lg" 
                      asChild 
                      className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent px-10 py-7 text-lg shadow-2xl hover:shadow-primary/30"
                    >
                      <Link to="/shop">
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        Begin Your Journey
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          initial={{ x: "-100%", skewX: -15 }}
                          whileHover={{ x: "200%" }}
                          transition={{ duration: 0.8 }}
                        />
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      asChild 
                      className="group px-10 py-7 text-lg border-2 hover:bg-card/80 backdrop-blur-sm"
                    >
                      <Link to="/contact">
                        <MessageSquare className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        Connect With Us
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Brand Bar - Minimal */}
      <div className="py-12 border-y border-border/30">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
            {["Premium Beauty", "Luxury Edit", "Expert Curation", "Authentic Only"].map((brand, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-light"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;