import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Bell, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Mail, 
  Shield, 
  Loader2, 
  Trash2, 
  Key,
  AlertTriangle,
  LogOut,
  Check,
  ShieldCheck,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import UserContext from "@/lib/userContext";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { logout } = useContext(UserContext);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    smsAlerts: false,
    securityNotifications: true,
  });

  useEffect(()=>{
    const fetchNotifications = async () => {
      try {
        const res = await http.get("/get-notifications/");
        const resp: ApiResp = res.data;
        
        if (!resp.error && resp.data) {

          setNotifications({
            orderUpdates: resp.data.order_updates=="1",
            smsAlerts: resp.data.sms_alerts=="1",
            securityNotifications: resp.data.security_notifications=="1",
          });
        } else {
          toast.error(resp.data || "Failed to fetch notification preferences");
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        toast.error("Failed to fetch notification preferences");
      }
    };
    fetchNotifications();
  }, []);

  const validatePasswordForm = () => {
    if (!passwordForm.current.trim()) {
      toast.error("Current password is required");
      return false;
    }
    
    if (!passwordForm.new.trim()) {
      toast.error("New password is required");
      return false;
    }
    
    if (passwordForm.new.length < 8) {
      toast.error("New password must be at least 8 characters");
      return false;
    }
    
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return false;
    }
    
    if (passwordForm.current === passwordForm.new) {
      toast.error("New password must be different from current password");
      return false;
    }
    
    return true;
  };

  const handleSavePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setSavingPassword(true);
    try {
      const res = await http.post("/change-password/", {
        opassword: passwordForm.current,
        npassword: passwordForm.new,
        cpassword: passwordForm.confirm
      });
      
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        toast.success("Your password has been updated successfully");
        // Clear form
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        toast.error(resp.data || "Failed to update password");
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.data || "Failed to update password. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      let formData = new FormData();
      formData.append("orderUpdates", notifications.orderUpdates ? "1" : "0");
      formData.append("smsAlerts", notifications.smsAlerts ? "1" : "0");
      formData.append("securityNotifications", notifications.securityNotifications ? "1" : "0");
      const res = await http.post("/update-notifications/", formData);
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        toast.success("Notification preferences updated");
      } else {
        toast.error(resp.data || "Failed to update notification preferences");
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notification preferences");
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await http.post("/delete-my-account/");
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        toast.success("Your account has been deleted successfully");
        setTimeout(() => logout(), 1500);
      } else {
        toast.error(resp.data || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and notification preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Change Password Card */}
        <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Change Password</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your account password for enhanced security
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password" className="font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword.current ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword.new ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword.confirm ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                    className={cn(
                      "h-11 pr-10",
                      passwordForm.confirm && passwordForm.new !== passwordForm.confirm && "border-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                onClick={handleSavePassword}
                disabled={savingPassword || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-md"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences Card */}
        <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/10 to-highlight/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Notifications</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose how you want to be notified
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-muted-foreground">Shipping and delivery notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, orderUpdates: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">SMS Alerts</p>
                    <p className="text-sm text-muted-foreground">Text message notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.smsAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, smsAlerts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-muted-foreground">Account security notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.securityNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, securityNotifications: checked }))
                  }
                />
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                className="w-full mt-6"
              >
                {savingNotifications ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notification Preferences"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary/10 to-muted-foreground/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">Security</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your account security and access
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">

            {/* Delete Account - DANGER ZONE */}
            <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once you delete your account, there is no going back. 
                    All your data, orders, and preferences will be permanently deleted.
                  </p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="gap-2 hover:bg-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Your Account?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action cannot be undone. This will permanently:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Delete your account and all personal information</li>
                        <li>Remove all your orders and wishlist items</li>
                        <li>Delete your saved addresses and payment methods</li>
                        <li>Cancel any pending subscriptions or orders</li>
                      </ul>
                      <p className="font-medium mt-2">Are you absolutely sure?</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                      disabled={deletingAccount}
                    >
                      {deletingAccount ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;