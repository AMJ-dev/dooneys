import React, { useEffect, useState, useContext, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Lock, 
  Mail, 
  Phone, 
  Clock, 
  Shield, 
  LogOut,
  UserX,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Ban,
  FileText,
  HelpCircle,
  ChevronRight,
  Copy,
  Check,
  Settings,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { comp_email, comp_name, comp_phone } from "@/lib/constants";
import userContext from "@/lib/userContext";

const AccountSuspended = () => {
  const navigate = useNavigate();
  const { auth, my_details, logout } = useContext(userContext);
  const [logoutInProgress, setLogoutInProgress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const userEmail = my_details.email;
  const userName = my_details.first_name + " " + my_details.last_name;
  const userRole = my_details.role;
  const suspensionDate = new Date().toISOString(); // Replace with actual suspension date from API

  const adminContact = {
    email: comp_email,
    phone: comp_phone,
    name: "Administrator"
  };

  useEffect(() => {
    if (!auth) startTransition(() => navigate("/auth/login"));
  }, [auth]);

  const handleLogout = async () => {
    try {
      setLogoutInProgress(true);
      logout();
      toast.info("You have been logged out");
    } catch (error) {
      logout();
    } finally {
      setLogoutInProgress(false);
    }
  };

  const handleContactAdmin = () => {
    const subject = `Account Suspension Appeal - ${userName}`;
    const body = `Dear ${adminContact.name},\n\nMy account (${userEmail}) has been suspended. I would like to appeal this decision.\n\nPlease provide more information.\n\nRegards,\n${userName}`;
    
    window.location.href = `mailto:${adminContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-orange-50/30 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-red-100/5 to-orange-100/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-6xl relative z-10"
      >
        {/* Header with animated warning */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="mb-6"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-200">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <AlertTriangle className="h-8 w-8 text-red-600 drop-shadow-lg" />
              </motion.div>
            </motion.div>
            
            <div className="text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-700 to-orange-600 bg-clip-text text-transparent mb-2">
                Account Suspended
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Your access has been temporarily restricted by the system administrator
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Quick Stats Bar */}
          <motion.div variants={itemVariants}>
            <Card className="border-red-200/50 bg-gradient-to-r from-red-50/50 to-orange-50/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <Ban className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold">Suspended</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Since</p>
                      <p className="font-semibold">{formatDate(suspensionDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <ShieldAlert className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <p className="font-semibold">High</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Key className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Access Level</p>
                      <Badge variant="outline">{userRole}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs Section */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="actions" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Available Actions
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Contact Support
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User Profile Card */}
                  <Card className="lg:col-span-2 border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserX className="h-5 w-5" />
                        Account Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-bold text-xl">
                            {userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{userName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-red-100 text-red-800 border-0">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Suspended
                              </Badge>
                              <Badge variant="outline">{userRole}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Email</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{userEmail}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => copyToClipboard(userEmail)}
                                      >
                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy email</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">User ID</span>
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {my_details.id || "N/A"}
                              </code>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Suspension Date</span>
                              <span className="font-medium">{formatDate(suspensionDate)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Session Status</span>
                              <Badge variant="destructive">Active but Restricted</Badge>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Last Active</span>
                              <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Security Level</span>
                              <Badge className="bg-amber-100 text-amber-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Restricted
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-red-700 mb-2">Restrictions in Effect</h4>
                              <ul className="text-sm space-y-2">
                                <li className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                  <span>All system access has been revoked</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                  <span>Data modifications are blocked</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                  <span>Session will be terminated upon logout</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions Sidebar */}
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        onClick={handleLogout}
                        disabled={logoutInProgress}
                        variant="destructive"
                        className="w-full gap-3 h-12"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-semibold">Logout Immediately</span>
                      </Button>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3 h-11"
                          onClick={handleContactAdmin}
                        >
                          <Mail className="h-4 w-4" />
                          <span>Email Administrator</span>
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3 h-11"
                          onClick={() => setActiveTab("contact")}
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span>Request Support</span>
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </div>
                      
                      <div className="pt-4">
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium mb-1">Session Information</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Session ID:</span>
                              <code className="font-mono text-xs">
                                {Math.random().toString(36).substr(2, 8).toUpperCase()}
                              </code>
                            </div>
                            <div className="flex justify-between">
                              <span>IP Address:</span>
                              <span>•••.•••.•••.•••</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Action Cards */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <LogOut className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle>Logout & Exit</CardTitle>
                          <CardDescription>Terminate current session</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Safely end your session and return to the login screen. All unsaved work will be lost.
                      </p>
                      <Button 
                        onClick={handleLogout}
                        disabled={logoutInProgress}
                        variant="destructive"
                        className="w-full"
                      >
                        {logoutInProgress ? "Logging out..." : "Logout Now"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle>Submit Appeal</CardTitle>
                          <CardDescription>Request account review</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Submit a formal appeal to have your account reviewed by the administration team.
                      </p>
                      <Button 
                        variant="outline"
                        className="w-full border-green-300 text-green-700 hover:bg-green-50"
                        onClick={handleContactAdmin}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Request Appeal via Email
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <HelpCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle>View Policies</CardTitle>
                          <CardDescription>Read suspension policies</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Review company policies regarding account suspensions and user conduct.
                      </p>
                      <Button variant="ghost" className="w-full">
                        Open Policy Document
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <Phone className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle>Emergency Contact</CardTitle>
                          <CardDescription>Immediate assistance</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Phone className="h-4 w-4 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Emergency Line</p>
                            <p className="text-lg font-semibold">{comp_phone}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Contact Support Team
                    </CardTitle>
                    <CardDescription>
                      Multiple ways to reach out for assistance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Mail className="h-5 w-5 text-green-600" />
                            <div>
                              <h4 className="font-semibold">Email Support</h4>
                              <p className="text-sm text-muted-foreground">Recommended for appeals</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm">Primary Contact:</p>
                            <div className="flex items-center justify-between bg-white p-3 rounded border">
                              <code className="font-mono">{comp_email}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(comp_email)}
                              >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Phone className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-semibold">Phone Support</h4>
                              <p className="text-sm text-muted-foreground">Available during business hours</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-white p-3 rounded border">
                              <p className="font-semibold text-lg">{comp_phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Quick Contact Form</h4>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Your Message</label>
                              <textarea 
                                className="w-full h-32 p-3 border rounded-lg text-sm"
                                placeholder="Describe your issue or appeal request..."
                                defaultValue={`Dear Administrator,\n\nMy account (${userEmail}) has been suspended. I would like to request a review of this decision.\n\nPlease let me know the specific reasons for the suspension and what steps I can take to restore my account.\n\nThank you,\n${userName}`}
                              />
                            </div>
                            <Button 
                              className="w-full"
                              onClick={handleContactAdmin}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Message via Email
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Response Time</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Progress value={70} className="h-2" />
                            </div>
                            <span>Typically 1-2 business days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Level: Maximum</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Updated: {formatDate(new Date().toISOString())}</span>
                </div>
              </div>
              <p className="max-w-2xl mx-auto">
                This suspension screen is designed to protect system integrity. 
                All access attempts are logged for security purposes.
              </p>
              <Separator className="my-4" />
              <p>© {new Date().getFullYear()} {comp_name}. All rights reserved. • Suspension Protocol v2.1</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccountSuspended;