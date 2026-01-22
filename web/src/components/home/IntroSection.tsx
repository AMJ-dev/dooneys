import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { comp_name } from "@/lib/constants";

const IntroSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="font-display text-3xl md:text-4xl lg:text-5xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Welcome to {comp_name}
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              At {comp_name}, we bring together quality beauty, hair, and lifestyle products all in one place. 
              You can shop conveniently online, browse and order through Instagram or WhatsApp, or book an appointment 
              to visit us in store for a personalized shopping experience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button size="lg" variant="outline" asChild>
                <Link to="/about" className="group">
                  Learn More About Us
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntroSection;
