import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, Clock, MessageCircle, Calendar, Send, Mail, User, Hash } from "lucide-react";
import storeInterior from "@/assets/store-interior.jpg";
import { comp_address, comp_phone, comp_whatsapp, comp_name, comp_email } from "@/lib/constants";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await http.post('/contact-us/', formData);
      const resp: ApiResp = res.data;
      
      if (resp.error === false) {
        toast.success(resp.data || 'Message sent successfully! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        toast.error(resp.data || 'Failed to send message. Please try again.');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(
        error.response?.data?.data || 
        error.message || 
        'Failed to send message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone & WhatsApp",
      content: comp_phone,
      href: `tel:${comp_phone}`,
      color: "bg-green-500/10 text-green-600",
      action: "Call Now",
    },
    {
      icon: Mail,
      title: "Email",
      content: comp_email,
      href: `mailto:${comp_email}`,
      color: "bg-blue-500/10 text-blue-600",
      action: "Send Email",
    },
    {
      icon: MapPin,
      title: "Location",
      content: comp_address,
      color: "bg-amber-500/10 text-amber-600",
      action: "View Map",
    },
    {
      icon: Clock,
      title: "Store Hours",
      content: "By Appointment Only",
      subtext: "Online shopping available 24/7",
      color: "bg-purple-500/10 text-purple-600",
      action: "Book Appointment",
    },
  ];

  return (
    <Layout>
      {/* Hero Section - Premium Design */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={storeInterior}
            alt={`${comp_name} Store Interior`}
            className="h-full w-full object-cover"
          />
        </motion.div>
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Contact Us</span>
            </motion.div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-card mb-6 tracking-tight">
              Connect With
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-highlight">
                Luxury Beauty
              </span>
            </h1>
            
            <p className="text-card/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Experience personalized service, expert consultations, and premium beauty solutions. 
              Let's create your perfect beauty journey together.
            </p>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="h-12 w-px bg-gradient-to-b from-primary via-accent to-transparent" />
        </motion.div>
      </section>

      {/* Contact Content Section */}
      <section className="py-20 md:py-28 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          {/* Section Header */}
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block mb-4"
              >
                <div className="h-1 w-16 bg-gradient-primary mx-auto rounded-full" />
              </motion.div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
                Get in <span className="text-primary">Touch</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our beauty experts are ready to assist you with product recommendations, 
                order inquiries, or to schedule your exclusive in-store experience.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Information - Premium Cards */}
            <ScrollReveal>
              <div className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="group"
                    >
                      <div className="h-full p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-white/10 shadow-card hover:shadow-card-hover transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{item.title}</h3>
                            <p className="text-foreground/90 mb-2">{item.content}</p>
                            {item.subtext && (
                              <p className="text-sm text-muted-foreground">{item.subtext}</p>
                            )}
                            {item.href && (
                              <a
                                href={item.href}
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-3"
                              >
                                {item.action}
                                <motion.span
                                  initial={{ x: 0 }}
                                  whileHover={{ x: 4 }}
                                  className="inline-block"
                                >
                                  →
                                </motion.span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Appointment Booking - Premium Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/20 p-8"
                >
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Exclusive In-Store Experience</h3>
                        <p className="text-sm text-muted-foreground">Personalized beauty consultation</p>
                      </div>
                    </div>
                    <p className="text-foreground/80 mb-6 leading-relaxed">
                      Enjoy a private shopping experience with our beauty experts. 
                      Book your appointment for personalized product recommendations 
                      and hands-on demonstrations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button size="lg" className="flex-1 bg-gradient-primary hover:shadow-lg hover:shadow-primary/25" asChild>
                        <a href={`tel:${comp_phone}`}>
                          <Phone className="h-5 w-5 mr-2" />
                          Call to Book
                        </a>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 border-green-500/30 text-green-600 hover:bg-green-500/10"
                        asChild
                      >
                        <a href={`https://wa.me/${comp_whatsapp}`} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-5 w-5 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Contact Form - Premium Design */}
            <ScrollReveal delay={0.2}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary via-accent to-highlight rounded-3xl blur opacity-30" />
                <div className="relative bg-card rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10">
                  <div className="mb-8">
                    <h2 className="font-display text-3xl md:text-4xl mb-3">
                      Send Us a <span className="text-primary">Message</span>
                    </h2>
                    <p className="text-muted-foreground">
                      Fill out the form below and our team will get back to you within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Your Name
                        </label>
                        <Input
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-12 bg-background/50 border-white/10 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="h-12 bg-background/50 border-white/10 focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-12 bg-background/50 border-white/10 focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Subject
                      </label>
                      <Input
                        name="subject"
                        placeholder="How can we help you today?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-12 bg-background/50 border-white/10 focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Your Message
                      </label>
                      <Textarea
                        name="message"
                        placeholder="Tell us more about your inquiry, questions, or appointment request..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                        className="bg-background/50 border-white/10 focus:border-primary/50 resize-none"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 text-lg bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          />
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      By submitting, you agree to our Privacy Policy. We respect your privacy.
                    </p>
                  </form>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Location Section - Premium Design */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
        
        <div className="container relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
                Visit Our <span className="text-primary">Studio</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Experience luxury beauty in our exclusive studio space. 
                By appointment only for a truly personalized service.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Map Placeholder - Premium Design */}
            <ScrollReveal>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <MapPin className="h-16 w-16 text-primary/50" />
                      <div className="absolute inset-0 animate-ping">
                        <MapPin className="h-16 w-16 text-primary/30" />
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/10">
                      <p className="text-lg font-semibold mb-2">📍 {comp_address}</p>
                      <p className="text-sm text-muted-foreground">Map integration coming soon</p>
                    </div>
                  </div>
                </div>
                {/* Animated Dots Pattern */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-1 w-1 bg-primary rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Location Info */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-white/10 shadow-card">
                  <h3 className="text-2xl font-semibold mb-6">Location Details</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Address</h4>
                        <p className="text-muted-foreground">{comp_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Visit Guidelines</h4>
                        <ul className="text-muted-foreground space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Appointment-only visits
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Private consultations available
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Free parking available
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Wheelchair accessible
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <h4 className="font-semibold mb-3">Need Directions?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact us for detailed directions and parking information before your visit.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    asChild
                  >
                    <a href={`tel:${comp_phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call for Directions
                    </a>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;