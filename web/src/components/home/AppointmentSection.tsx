import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MapPin } from "lucide-react";
import { comp_address, comp_phone, comp_whatsapp, comp_name} from "@/lib/constants";
import storeImage from "@/assets/store-interior.jpg";

const AppointmentSection = () => {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={storeImage}
                alt={comp_name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-overlay" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-xs bg-card/95 backdrop-blur-sm rounded-xl p-5 shadow-elevated"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium">{comp_address}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  In-store visits by appointment only
                </p>
              </motion.div>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="lg:pl-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                In-Store Experience
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
                Book an In-Store Appointment
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Our store operates by appointment only to ensure every customer receives personal attention. 
                To book an in-store visit, please call or send us a message in advance.
              </p>
              <p className="text-muted-foreground mb-8">
                Prefer to shop in person? Visit our Edmonton store for personalized service and a chance to see products up close before you buy.
              </p>

              <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-muted">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Call or WhatsApp</p>
                  <p className="font-medium">{comp_phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/contact">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book an Appointment
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href={`tel:${comp_whatsapp}`}>
                    <Phone className="h-5 w-5 mr-2" />
                    Call Now
                  </a>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
