import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, Phone, MapPin, Mail } from "lucide-react";
import { ScrollReveal } from "@/components/ui/motion";
import logo from "@/assets/logo.png";
import { comp_name, comp_address, comp_whatsapp, comp_phone } from "@/lib/constants";

const Footer = () => {

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "Hair", path: "/shop/hair" },
      { name: "Wigs", path: "/shop/wigs" },
      { name: "Braids & Crochet", path: "/shop/braids-crochet" },
      { name: "Hair Care", path: "/shop/hair-care" },
      { name: "Skin & Body Care", path: "/shop/skin-body-care" },
      { name: "Tools & Appliances", path: "/shop/tools-appliances" },
    ],
    quickLinks: [
      { name: "Shop All", path: "/shop" },
      { name: "New Arrivals", path: "/deals" }, // Changed from /deals
      { name: "Book Appointment", path: "/contact" },
    ],
    support: [
      { name: "Admin Login", path: "/admin-login" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms & Conditions", path: "/terms" },
    ],
  };

  return (
    <ScrollReveal>
      <footer className="bg-secondary text-secondary-foreground">
        {/* Main footer */}
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <Link to="/">
                <img src={logo} alt={comp_name} className="h-14 w-auto mb-4" />
              </Link>
              <p className="text-secondary-foreground/80 text-sm mb-6">
                {comp_name} — your trusted beauty and lifestyle store in Edmonton.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{comp_address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{comp_phone}</span>
                </div>
                <p className="text-secondary-foreground/70 text-xs pl-7">
                  Online shopping available 24/7
                  <br />
                  In-store visits by appointment only
                </p>
              </div>
            </div>

            {/* <div>
              <h4 className="font-display text-lg mb-4">Shop Categories</h4>
              <ul className="space-y-2">
                {footerLinks.shop.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}

            <div>
              <h4 className="font-display text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="font-display text-lg mb-4 mt-8">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter / Social */}
            <div>
              <h4 className="font-display text-lg mb-4">Stay Connected</h4>
              <p className="text-sm text-secondary-foreground/80 mb-4">
                Follow us on social media for the latest updates and beauty inspiration.
              </p>
              <div className="flex gap-4">
                <motion.a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
              </div>

              <div className="mt-8">
                <h4 className="font-display text-lg mb-4">Contact Us</h4>
                <a
                  href={`https://wa.me/${comp_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#128C7E] transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Order on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-secondary-foreground/10">
          <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary-foreground/70">
            <p>© {currentYear} {comp_name}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link to="/admin-login" className="hover:text-primary transition-colors">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </ScrollReveal>
  );
};

export default Footer;