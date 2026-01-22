import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "@/components/ui/motion";
import {
  FileText,
  Shield,
  Lock,
  ShoppingBag,
  Truck,
  CreditCard,
  RefreshCw,
  MessageSquare,
  CheckCircle,
  ArrowUpDown,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  BookOpen,
  Scale,
  Users,
  Eye,
  Download,
  Printer,
  Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TermsAndConditions = () => {
  const lastUpdated = "January 1, 2024";
  const effectiveDate = "January 1, 2024";

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: "Welcome to Doonneys Beauty. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms."
    },
    {
      id: "definitions",
      title: "2. Definitions",
      content: "Throughout these terms: 'Website' refers to doonneysbeauty.com, 'Services' refer to all products and services offered, 'User' or 'You' refers to any person accessing the website, 'We', 'Us', 'Our' refers to Doonneys Beauty."
    },
    {
      id: "account",
      title: "3. Account Registration",
      content: "To access certain features, you must register an account. You agree to provide accurate information and maintain confidentiality of your credentials. You are responsible for all activities under your account."
    },
    {
      id: "products",
      title: "4. Products and Services",
      content: "We reserve the right to modify product descriptions, prices, and availability without notice. All products are subject to availability. We make reasonable efforts to display accurate colors and images."
    },
    {
      id: "pricing",
      title: "5. Pricing and Payments",
      content: "All prices are in Canadian Dollars (CAD) and include applicable taxes unless stated otherwise. We accept major credit cards and Interac e-Transfer. Payment is required before order processing."
    },
    {
      id: "shipping",
      title: "6. Shipping and Delivery",
      content: "Shipping times are estimates and not guaranteed. We are not responsible for delays caused by carriers or customs. Shipping costs are calculated at checkout and vary by location."
    },
    {
      id: "returns",
      title: "7. Returns and Refunds",
      content: "We offer a 30-day return policy for unused, unopened products with original packaging. Refunds are processed within 7-10 business days. Shipping costs are non-refundable."
    },
    {
      id: "intellectual",
      title: "8. Intellectual Property",
      content: "All content on this website, including text, graphics, logos, and software, is our property and protected by copyright laws. You may not reproduce, distribute, or create derivative works without permission."
    },
    {
      id: "user-content",
      title: "9. User Content",
      content: "By submitting reviews, comments, or other content, you grant us a perpetual license to use, modify, and display such content. You represent that you own all rights to submitted content."
    },
    {
      id: "prohibited",
      title: "10. Prohibited Activities",
      content: "You agree not to: Use the website for illegal purposes, attempt to gain unauthorized access, interfere with website functionality, use automated systems to access the website, or harass other users."
    },
    {
      id: "liability",
      title: "11. Limitation of Liability",
      content: "To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products."
    },
    {
      id: "indemnification",
      title: "12. Indemnification",
      content: "You agree to indemnify and hold harmless Doonneys Beauty and its affiliates from any claims, damages, or expenses arising from your violation of these terms or use of our services."
    },
    {
      id: "termination",
      title: "13. Termination",
      content: "We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that violates these terms or is harmful to other users."
    },
    {
      id: "changes",
      title: "14. Changes to Terms",
      content: "We may modify these terms at any time. Continued use of our services after changes constitutes acceptance of new terms. We will notify users of significant changes via email or website notice."
    },
    {
      id: "governing",
      title: "15. Governing Law",
      content: "These terms are governed by the laws of Alberta, Canada. Any disputes shall be resolved in the courts of Alberta. The United Nations Convention on Contracts is excluded."
    },
    {
      id: "contact",
      title: "16. Contact Information",
      content: "For questions about these terms, contact us at legal@doonneysbeauty.com or at our registered office address."
    }
  ];

  const quickLinks = [
    { id: "introduction", label: "Introduction", icon: BookOpen },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "pricing", label: "Pricing", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "returns", label: "Returns", icon: RefreshCw },
    { id: "contact", label: "Contact", icon: MessageSquare },
  ];

  const policies = [
    {
      title: "Privacy Policy",
      description: "Learn how we collect, use, and protect your personal information",
      icon: Eye,
      link: "/privacy-policy"
    },
    {
      title: "Shipping Policy",
      description: "Detailed information about shipping methods, costs, and delivery times",
      icon: Truck,
      link: "/shipping-policy"
    },
    {
      title: "Return Policy",
      description: "Complete guide to our return process and refund procedures",
      icon: RefreshCw,
      link: "/return-policy"
    },
    {
      title: "Cookie Policy",
      description: "Information about cookies and tracking technologies we use",
      icon: Shield,
      link: "/cookie-policy"
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const text = document.querySelector(".terms-content")?.textContent || "";
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "doonneys-beauty-terms-and-conditions.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Doonneys Beauty - Terms and Conditions',
          text: 'Read our Terms and Conditions',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-card to-card/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Scale className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Legal Document</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                Terms & <span className="text-white bg-gradient-to-r from-primary to-accent">Conditions</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The legal agreement between you and Doonneys Beauty that governs your use of our services
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">Last Updated: {lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Effective: {effectiveDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Quick Links */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32">
                <Card className="bg-gradient-to-b from-card to-card/80 rounded-2xl p-6 shadow-soft border border-border/50">
                  <h3 className="font-display text-lg mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Quick Navigation
                  </h3>
                  
                  <nav className="space-y-2">
                    {quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.id}
                          href={`#${link.id}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">{link.label}</span>
                          <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      );
                    })}
                  </nav>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-medium mb-4">Need Help?</h4>
                    <div className="space-y-3">
                      <a
                        href="mailto:legal@doonneysbeauty.com"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        legal@doonneysbeauty.com
                      </a>
                      <a
                        href="tel:+18250000000"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        +1 (825) 000-0000
                      </a>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>123 Beauty Street, Edmonton, AB T5A 0A1</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Related Policies */}
                <div className="mt-6">
                  <h3 className="font-display text-lg mb-4">Related Policies</h3>
                  <div className="space-y-3">
                    {policies.map((policy) => {
                      const Icon = policy.icon;
                      return (
                        <Link
                          key={policy.title}
                          to={policy.link}
                          className="block p-4 bg-gradient-to-r from-card to-card/80 rounded-xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-sm group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {policy.title}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {policy.description}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="terms-content"
              >
                <Card className="bg-gradient-to-b from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-soft border border-border/50">
                  {/* Important Notice */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-display text-lg mb-2">Important Notice</h3>
                        <p className="text-muted-foreground">
                          Please read these Terms and Conditions carefully before using our website. 
                          By accessing or using our services, you acknowledge that you have read, 
                          understood, and agree to be bound by these terms. If you do not agree 
                          with any part of these terms, you must not use our services.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Content */}
                  <div className="space-y-8">
                    {sections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        id={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="scroll-mt-32"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-primary-foreground">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-display text-xl mb-3">{section.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {section.content}
                            </p>
                          </div>
                        </div>
                        
                        {section.id === "products" && (
                          <div className="ml-12 mt-4 p-4 bg-muted/30 rounded-xl">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              Product Information Accuracy
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                <span>Product images are for illustrative purposes only</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt=1.5 flex-shrink-0" />
                                <span>Actual colors may vary due to monitor settings</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt=1.5 flex-shrink-0" />
                                <span>Product specifications are subject to change</span>
                              </li>
                            </ul>
                          </div>
                        )}

                        {section.id === "returns" && (
                          <div className="ml-12 mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <h4 className="font-medium mb-2 flex items-center gap-2 text-green-800">
                              <RefreshCw className="h-4 w-4" />
                              30-Day Return Policy
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-700">Eligible for Return:</span>
                                <ul className="mt-1 space-y-1 text-green-600">
                                  <li>• Unused products</li>
                                  <li>• Original packaging</li>
                                  <li>• Within 30 days</li>
                                </ul>
                              </div>
                              <div>
                                <span className="font-medium text-red-700">Not Eligible:</span>
                                <ul className="mt-1 space-y-1 text-red-600">
                                  <li>• Opened products</li>
                                  <li>• Used testers</li>
                                  <li>• Final sale items</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.id === "contact" && (
                          <div className="ml-12 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <h4 className="font-medium mb-3 text-blue-800">Contact Our Legal Team</h4>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-blue-700">Legal Department</span>
                                <p className="mt-1 text-blue-600">
                                  For legal inquiries and official notices
                                </p>
                                <a 
                                  href="mailto:legal@doonneysbeauty.com" 
                                  className="text-primary hover:underline font-medium block mt-2"
                                >
                                  legal@doonneysbeauty.com
                                </a>
                              </div>
                              <div>
                                <span className="font-medium text-blue-700">Registered Office</span>
                                <p className="mt-1 text-blue-600">
                                  123 Beauty Street<br />
                                  Edmonton, AB T5A 0A1<br />
                                  Canada
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Acceptance Section */}
                  <Separator className="my-8" />
                  
                  <div className="text-center py-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">By using our services, you acknowledge acceptance</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
                      Your continued use of Doonneys Beauty's website and services constitutes 
                      your acceptance of these Terms and Conditions and any updates or modifications.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button 
                        asChild
                        className="gap-2 bg-gradient-to-r from-primary to-accent"
                      >
                        <Link to="/shop">
                          Continue Shopping
                          <ArrowUpDown className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline"
                        asChild
                        className="gap-2"
                      >
                        <Link to="/contact">
                          <MessageSquare className="h-4 w-4" />
                          Have Questions?
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Print Notice */}
                <div className="hidden print:block mt-8 p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Printed from doonneysbeauty.com/terms-and-conditions on {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This document is provided for reference only. Always refer to the online version for the most current terms.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-content {
            display: block !important;
          }
          body {
            font-size: 12pt;
            line-height: 1.5;
          }
          .terms-content h3 {
            page-break-after: avoid;
          }
          .terms-content p {
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
    </Layout>
  );
};

export default TermsAndConditions;