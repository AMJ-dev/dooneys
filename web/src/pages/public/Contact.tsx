import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, Clock, MessageCircle, Calendar, Send } from "lucide-react";
import storeInterior from "@/assets/store-interior.jpg";
import { comp_address, comp_phone, comp_whatsapp, comp_name } from "@/lib/constants";

const Contact = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={storeInterior}
            alt={`${comp_name} Store`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-card mb-4">
              Contact & Appointments
            </h1>
            <p className="text-card/90 text-lg md:text-xl">
              To place an order, ask questions, or book an in-store appointment, please contact us.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <ScrollReveal>
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-6">Get In Touch</h2>
                  <p className="text-muted-foreground text-lg">
                    We're here to help you with any questions about our products, orders, 
                    or to schedule your in-store visit.
                  </p>
                </div>

                <div className="space-y-6">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone / WhatsApp</h3>
                      <a
                        href={`tel:${comp_phone}`}
                        className="text-primary hover:underline text-lg"
                      >
                        {comp_phone}
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Location</h3>
                      <p className="text-muted-foreground">{comp_address}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Store Hours</h3>
                      <p className="text-muted-foreground">
                        By Appointment Only
                        <br />
                        <span className="text-sm">Online shopping available 24/7</span>
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Appointment Notice */}
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">In-Store Appointments</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    In-store visits are by appointment only. Please call or send us a message 
                    to book your visit before coming to the store.
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <a href={`tel:${comp_phone}`}>
                      <Phone className="h-5 w-5 mr-2" />
                      Call to Book Appointment
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-[#25D366]/10 border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366] hover:text-card"
                    asChild
                  >
                    <a href={`https://wa.me/${comp_whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Message on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </ScrollReveal>

            {/* Contact Form */}
            <ScrollReveal delay={0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-2xl p-6 md:p-8 shadow-card"
              >
                <h2 className="font-display text-2xl md:text-3xl mb-6">Send Us a Message</h2>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input placeholder="Your phone number" type="tel" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input placeholder="your@email.com" type="email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                    />
                  </div>
                  <Button size="lg" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] bg-muted">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Map Integration Coming Soon</p>
            <p className="text-sm text-muted-foreground">{comp_address}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
