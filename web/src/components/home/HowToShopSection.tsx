import { motion } from "framer-motion";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/ui/motion";
import { ShoppingCart, Store, Instagram, MessageCircle } from "lucide-react";

const shoppingMethods = [
  {
    icon: ShoppingCart,
    title: "Shop Online",
    description: "Buy directly on our website with secure checkout and fast delivery options.",
  },
  {
    icon: Store,
    title: "Visit Our Store",
    description: "Book an appointment for an in-store visit and personalized shopping experience.",
  },
  {
    icon: Instagram,
    title: "Shop via Social",
    description: "Order through Instagram & Facebook for convenient social shopping.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Orders",
    description: "Order easily via WhatsApp for quick and direct communication.",
  },
];

const HowToShopSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
              How You Can Shop
            </h2>
            <p className="text-muted-foreground text-lg">
              Shop the way that works best for you
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {shoppingMethods.map((method, index) => (
            <motion.div
              key={method.title}
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
              >
                <method.icon className="h-7 w-7 text-primary" />
              </motion.div>
              <h3 className="font-display text-xl mb-2">{method.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {method.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowToShopSection;
