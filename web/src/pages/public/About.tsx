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
  Layers
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
  { year: "2020", title: "Founded", description: "Started from a passion for beauty" },
  { year: "2021", title: "Online Launch", description: "Launched our e-commerce platform" },
  { year: "2022", title: "Store Opening", description: "Opened first physical location" },
  { year: "2023", title: "500+ Products", description: "Expanded our luxury collection" },
  { year: "2024", title: "Community", description: "10,000+ satisfied customers" },
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
      {/* Hero Section with Parallax */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          {/* Animated floating elements */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                background: `radial-gradient(circle, hsl(var(--primary)/0.05) 0%, transparent 70%)`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Since 2020</span>
                </div>
                
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight">
                  Redefining <span className="text-white bg-gradient-to-r from-primary to-accent">Beauty</span> Retail
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {aboutContent.hero.subtitle.replace('{comp_name}', comp_name)}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button size="lg" asChild className="gap-2 bg-gradient-to-r from-primary to-accent">
                    <Link to="/shop">
                      Shop Collection
                      <ShoppingBag className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2">
                    <Link to="/contact">
                      Book Appointment
                      <Calendar className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Right Image */}
            <ScrollReveal>
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative group"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-elevated">
                  <img
                    src={aboutHero}
                    alt={`${comp_name} Beauty Experience`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Edmonton Based</div>
                          <div className="text-sm text-muted-foreground">Serving beauty lovers worldwide</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Luxury Products", icon: Package },
              { value: "10K+", label: "Happy Customers", icon: Users },
              { value: "100%", label: "Authentic Brands", icon: Shield },
              { value: "24/7", label: "Support", icon: MessageSquare },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-gradient-to-b from-card to-card/80 rounded-2xl border border-border/50 shadow-soft"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="font-display text-3xl md:text-4xl font-bold mb-2 text-white bg-gradient-to-r from-primary to-accent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 shadow-elevated overflow-hidden">
                <CardHeader className="text-center pb-8 pt-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mb-6">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-4xl md:text-5xl mb-6">
                    {aboutContent.mission.title}
                  </CardTitle>
                  <CardDescription className="text-xl text-muted-foreground leading-relaxed">
                    {aboutContent.mission.description}
                  </CardDescription>
                </CardHeader>

                <Separator className="mb-8" />

                <CardContent>
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { icon: Globe, title: "Global Standards", text: "International quality assurance" },
                      { icon: Truck, title: "Seamless Delivery", text: "Reliable shipping across Canada" },
                      { icon: RefreshCw, title: "Easy Returns", text: "30-day satisfaction guarantee" },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="font-medium mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display text-4xl md:text-5xl mb-6">
                Our <span className="text-white bg-gradient-to-r from-primary to-accent">Core Values</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide every decision we make and every interaction we have
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <ScrollReveal key={value.title} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative h-full"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
                    <Card className="relative bg-gradient-to-b from-card to-card/80 backdrop-blur-sm border border-border/50 h-full group-hover:border-primary/30 transition-colors">
                      <CardContent className="p-8">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${value.color}/10 mb-6`}>
                          <Icon className={`h-7 w-7 text-${value.color}`} />
                        </div>
                        <CardTitle className="text-xl mb-3">{value.title}</CardTitle>
                        <p className="text-muted-foreground leading-relaxed">
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

      {/* Timeline Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display text-4xl md:text-5xl mb-6">
                Our <span className="text-white bg-gradient-to-r from-primary to-accent">Journey</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                From a small passion project to Edmonton's premier beauty destination
              </p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-primary via-accent to-transparent" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Year Circle */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                      <span className="font-display text-lg font-bold text-primary-foreground">
                        {milestone.year}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-16 text-right' : 'pl-16'}`}>
                    <Card className="bg-gradient-to-b from-card to-card/80 border border-border/50 shadow-soft">
                      <CardContent className="p-6">
                        <h3 className="font-display text-xl mb-2">{milestone.title}</h3>
                        <p className="text-muted-foreground text-sm">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Store Section - Using storeInterior */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative group"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden aspect-video shadow-elevated">
                  <img
                    src={storeInterior}
                    alt={`${comp_name} Luxury Store`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">Visit Our Sanctuary</div>
                            <div className="text-sm text-muted-foreground">By appointment only</div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Edmonton, Alberta</span>
                </div>
                
                <h2 className="font-display text-4xl md:text-5xl">
                  {aboutContent.store.title}
                </h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {aboutContent.store.description}
                </p>

                <div className="space-y-4 pt-4">
                  {aboutContent.store.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                  <Button size="lg" asChild className="gap-2 bg-gradient-to-r from-primary to-accent">
                    <Link to="/contact">
                      <Calendar className="h-4 w-4" />
                      Book Appointment
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2">
                    <Link to="/contact">
                      <Phone className="h-4 w-4" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container relative z-10">
          <ScrollReveal>
            <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 shadow-elevated overflow-hidden">
              <CardContent className="p-12 text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  Ready to Experience <span className="text-white bg-gradient-to-r from-primary to-accent">True Beauty</span>?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join thousands of satisfied customers who trust {comp_name} for their beauty journey
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="gap-2 bg-gradient-to-r from-primary to-accent">
                    <Link to="/shop">
                      <ShoppingBag className="h-4 w-4" />
                      Shop Now
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2">
                    <Link to="/contact">
                      <MessageSquare className="h-4 w-4" />
                      Get In Touch
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;