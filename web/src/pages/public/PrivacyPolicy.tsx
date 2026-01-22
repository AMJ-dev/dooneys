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
  Share2,
  Database,
  UserCheck,
  Cookie,
  Bell,
  Server,
  Key,
  Globe,
  ShieldCheck,
  EyeOff,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PrivacyPolicy = () => {
  const lastUpdated = "January 1, 2024";
  const effectiveDate = "January 1, 2024";

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: "Welcome to Doonneys Beauty's Privacy Policy. We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase."
    },
    {
      id: "data-collection",
      title: "2. Information We Collect",
      content: "We collect personal information that you voluntarily provide when you: create an account, place an order, subscribe to newsletters, contact customer service, or participate in promotions. This may include name, email, phone number, shipping/billing address, payment information, and purchase history."
    },
    {
      id: "automated-collection",
      title: "3. Automated Data Collection",
      content: "When you visit our site, we automatically collect certain information about your device, including browser type, IP address, time zone, and cookies. As you browse, we collect information about the web pages you view, referring sites, and interactions with the site."
    },
    {
      id: "cookies",
      title: "4. Cookies and Tracking Technologies",
      content: "We use cookies, web beacons, and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. Cookies are small data files stored on your device. You can control cookie settings through your browser preferences."
    },
    {
      id: "data-usage",
      title: "5. How We Use Your Information",
      content: "We use your personal information to: process and fulfill orders, communicate about orders/products/services, provide customer support, send marketing communications (with consent), improve our website and services, prevent fraud, and comply with legal obligations."
    },
    {
      id: "data-sharing",
      title: "6. Information Sharing and Disclosure",
      content: "We may share your information with: service providers (payment processors, shipping carriers), business partners (with your consent), legal authorities when required by law, and in connection with business transfers. We do not sell your personal information to third parties."
    },
    {
      id: "data-security",
      title: "7. Data Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal data. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but strive to use commercially acceptable means to protect your data."
    },
    {
      id: "data-retention",
      title: "8. Data Retention",
      content: "We retain your personal information only as long as necessary to fulfill the purposes for which it was collected, including for legal, accounting, or reporting requirements. When no longer needed, we securely delete or anonymize your data."
    },
    {
      id: "your-rights",
      title: "9. Your Rights and Choices",
      content: "Depending on your location, you may have rights to: access your personal data, correct inaccurate data, request deletion, restrict processing, data portability, and object to processing. You can also opt-out of marketing communications at any time."
    },
    {
      id: "third-party-links",
      title: "10. Third-Party Links",
      content: "Our website may contain links to third-party websites. This Privacy Policy does not apply to those sites. We encourage you to review the privacy policies of any third-party sites you visit. We are not responsible for the content or privacy practices of external sites."
    },
    {
      id: "children-privacy",
      title: "11. Children's Privacy",
      content: "Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware of such collection, we will take steps to delete the information promptly."
    },
    {
      id: "international-transfers",
      title: "12. International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions where applicable."
    },
    {
      id: "california-rights",
      title: "13. California Privacy Rights",
      content: "California residents have specific rights under the CCPA/CPRA, including: right to know what personal information is collected, right to delete personal information, right to opt-out of sale/sharing, and right to non-discrimination. See our separate California notice for details."
    },
    {
      id: "gdpr-rights",
      title: "14. GDPR Rights (EU/UK)",
      content: "If you are in the European Economic Area or United Kingdom, you have rights under GDPR including: right of access, rectification, erasure, restriction, portability, and objection. Contact us to exercise these rights. Our legal basis for processing includes consent, contract, and legitimate interests."
    },
    {
      id: "policy-changes",
      title: "15. Changes to Privacy Policy",
      content: "We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes via email or prominent notice on our website. Continued use after changes constitutes acceptance of the revised policy."
    },
    {
      id: "contact",
      title: "16. Contact Us",
      content: "For privacy-related questions or to exercise your rights, contact our Privacy Officer at privacy@doonneysbeauty.com or by mail at our registered office address."
    }
  ];

  const quickLinks = [
    { id: "introduction", label: "Introduction", icon: Shield },
    { id: "data-collection", label: "Data Collection", icon: Database },
    { id: "cookies", label: "Cookies", icon: Cookie },
    { id: "data-usage", label: "Data Usage", icon: Bell },
    { id: "data-security", label: "Security", icon: Lock },
    { id: "your-rights", label: "Your Rights", icon: UserCheck },
  ];

  const dataCategories = [
    {
      title: "Personal Information",
      items: ["Name", "Email Address", "Phone Number", "Shipping/Billing Address"],
      icon: UserCheck
    },
    {
      title: "Payment Information",
      items: ["Credit Card Details (encrypted)", "Billing Address", "Transaction History"],
      icon: CreditCard
    },
    {
      title: "Technical Data",
      items: ["IP Address", "Browser Type", "Device Information", "Cookies"],
      icon: Server
    },
    {
      title: "Usage Data",
      items: ["Pages Viewed", "Time Spent", "Click Patterns", "Purchase History"],
      icon: Eye
    }
  ];

  const userRights = [
    {
      title: "Right to Access",
      description: "Request copies of your personal data",
      icon: Eye
    },
    {
      title: "Right to Rectification",
      description: "Request correction of inaccurate data",
      icon: CheckCircle
    },
    {
      title: "Right to Erasure",
      description: "Request deletion of your personal data",
      icon: Trash2
    },
    {
      title: "Right to Restrict",
      description: "Request limitation of processing",
      icon: ShieldCheck
    },
    {
      title: "Right to Object",
      description: "Object to processing of your data",
      icon: EyeOff
    },
    {
      title: "Right to Portability",
      description: "Request transfer of your data",
      icon: ArrowUpDown
    }
  ];

  const policies = [
    {
      title: "Terms & Conditions",
      description: "Legal terms governing use of our website and services",
      icon: Scale,
      link: "/terms-and-conditions"
    },
    {
      title: "Cookie Policy",
      description: "Detailed information about cookies and tracking",
      icon: Cookie,
      link: "/cookie-policy"
    },
    {
      title: "Return Policy",
      description: "Information about returns and refunds",
      icon: RefreshCw,
      link: "/return-policy"
    },
    {
      title: "Shipping Policy",
      description: "Details about shipping methods and delivery",
      icon: Truck,
      link: "/shipping-policy"
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const text = document.querySelector(".privacy-content")?.textContent || "";
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "doonneys-beauty-privacy-policy.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Doonneys Beauty - Privacy Policy',
          text: 'Read our Privacy Policy',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
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
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Privacy & Security</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                Privacy <span className="text-white bg-gradient-to-r from-primary to-accent">Policy</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Protecting your personal information is our top priority. Learn how we collect, use, and safeguard your data.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">Last Updated: {lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm">GDPR & CCPA Compliant</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm">256-bit SSL Encryption</span>
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
                    <Lock className="h-5 w-5 text-primary" />
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

                  {/* Data We Collect */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Data We Collect
                    </h4>
                    <div className="space-y-3">
                      {dataCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <div key={category.title} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-medium">{category.title}</span>
                            </div>
                            <ul className="space-y-1">
                              {category.items.map((item) => (
                                <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-primary/50" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
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
                className="privacy-content"
              >
                <Card className="bg-gradient-to-b from-card to-card/80 rounded-2xl p-6 md:p-8 shadow-soft border border-border/50">
                  {/* Important Notice */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                    <div className="flex items-start gap-4">
                      <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-display text-lg mb-2">Your Privacy Matters</h3>
                        <p className="text-muted-foreground">
                          We are committed to protecting your personal information. This Privacy Policy 
                          explains how we handle your data. By using our services, you consent to the 
                          practices described below. If you have any questions, contact our Privacy Officer.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Principles */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {userRights.map((right) => {
                      const Icon = right.icon;
                      return (
                        <div key={right.title} className="p-4 bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-medium text-sm">{right.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{right.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Policy Content */}
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
                        
                        {section.id === "data-collection" && (
                          <div className="ml-12 mt-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-muted/30 rounded-xl">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <UserCheck className="h-4 w-4" />
                                  Information You Provide
                                </h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                  {["Account registration", "Order information", "Customer support requests", "Marketing preferences"].map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-4 bg-muted/30 rounded-xl">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Database className="h-4 w-4" />
                                  Automatically Collected
                                </h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                  {["IP address", "Browser type", "Device information", "Usage patterns"].map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.id === "cookies" && (
                          <div className="ml-12 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-800">
                              <Cookie className="h-4 w-4" />
                              Cookie Management
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-blue-700">Browser Settings:</span>
                                <p className="mt-1 text-blue-600">
                                  You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing ones.
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-blue-700">Essential Cookies:</span>
                                <p className="mt-1 text-blue-600">
                                  Some cookies are necessary for website functionality. Disabling them may affect your user experience.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.id === "data-security" && (
                          <div className="ml-12 mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <h4 className="font-medium mb-3 text-green-800 flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Security Measures
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-700">Technical Measures:</span>
                                <ul className="mt-1 space-y-1 text-green-600">
                                  <li>• 256-bit SSL encryption</li>
                                  <li>• Secure servers</li>
                                  <li>• Regular security audits</li>
                                </ul>
                              </div>
                              <div>
                                <span className="font-medium text-green-700">Organizational:</span>
                                <ul className="mt-1 space-y-1 text-green-600">
                                  <li>• Employee training</li>
                                  <li>• Access controls</li>
                                  <li>• Data minimization</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.id === "contact" && (
                          <div className="ml-12 mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                            <h4 className="font-medium mb-3">Contact Our Privacy Team</h4>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium">Privacy Officer</span>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  For privacy inquiries and data rights requests
                                </p>
                                <a 
                                  href="mailto:privacy@doonneysbeauty.com" 
                                  className="text-primary hover:underline font-medium block mt-2"
                                >
                                  privacy@doonneysbeauty.com
                                </a>
                              </div>
                              <div>
                                <span className="font-medium">Data Protection Officer</span>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  For GDPR-related inquiries
                                </p>
                                <a 
                                  href="mailto:dpo@doonneysbeauty.com" 
                                  className="text-primary hover:underline font-medium block mt-2"
                                >
                                  dpo@doonneysbeauty.com
                                </a>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <span className="font-medium">Registered Office</span>
                              <p className="mt-1 text-sm text-muted-foreground">
                                123 Beauty Street<br />
                                Edmonton, AB T5A 0A1<br />
                                Canada
                              </p>
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
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <span className="font-medium">Your Privacy is Protected</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
                      We regularly review and update our privacy practices to ensure compliance with 
                      applicable laws and best practices. Your trust is important to us.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button 
                        asChild
                        className="gap-2 bg-gradient-to-r from-primary to-accent"
                      >
                        <Link to="/account/settings">
                          <Key className="h-4 w-4" />
                          Manage Preferences
                        </Link>
                      </Button>
                      <Button 
                        variant="outline"
                        asChild
                        className="gap-2"
                      >
                        <Link to="/contact">
                          <MessageSquare className="h-4 w-4" />
                          Contact Privacy Team
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Print Notice */}
                <div className="hidden print:block mt-8 p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Printed from doonneysbeauty.com/privacy-policy on {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This document is provided for reference only. Always refer to the online version for the most current policy.
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
          .privacy-content h3 {
            page-break-after: avoid;
          }
          .privacy-content p {
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
    </Layout>
  );
};

export default PrivacyPolicy;