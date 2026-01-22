import { useState, useEffect, startTransition } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Save, ArrowLeft, Shield, Mail, Phone, Loader2, User, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { cn } from "@/lib/utils";
import usePermissions from "@/hooks/usePermissions";

interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  role_id?: string;
}

interface AccessLevel {
  id: string;
  name: string;
  description: string;
  staffCount: number;
}

const defaultFormData: StaffFormData = {
  first_name: "",
  last_name: "",
  email: "",
  mobile_number: "",
  role_id: "",
};

export const AdminStaffForm = () => {
    const {
      edit_staff: can_edit_staff,
      add_staff: can_add_staff,
    } = usePermissions([
      "edit_staff",
      "add_staff",
    ])
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<StaffFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);

  useEffect(() => {
    fetchRoles();
    if (isEditMode) {
      if(!can_edit_staff){      
        startTransition(()=>navigate("/unauthorized"))
        return;
      }
      fetchStaffData();
    }else{
      if(!can_add_staff){
        startTransition(()=>navigate("/unauthorized"))
        return;
      }
    }
  }, [id]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/get-user/${id}/`);
      const resp: ApiResp = response.data;

      if (!resp.error && resp.data) {
        const staffData = resp.data;
        const nameParts = (staffData.name || "").split(" ");
        setFormData({
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          email: staffData.email || "",
          mobile_number: staffData.mobile_number || "",
          role_id: staffData.role_id || "",
        });
      } else {
        toast.error("Failed to load staff data");
        navigate("/admin/staffs");
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
      toast.error("Failed to load staff data");
      navigate("/admin/staffs");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await http.get(`/get-permissions/`);
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data && Array.isArray(resp.data)) {
        setAccessLevels(resp.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load role data");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please check the form for errors");
      return;
    }

    try {
      setSubmitting(true);

      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      const selectedRole = accessLevels.find(role => role.id === formData.role_id);
      
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        role_id: formData.role_id || undefined,
        ...(isEditMode && { id }),
      };

      const endpoint = isEditMode 
        ? `/update-staff/`
        : "/add-user/";
      
      const response = await http.post(endpoint, payload);
      const resp: ApiResp = response.data;

      if (!resp.error) {
        toast.success(`${fullName} has been ${isEditMode ? 'updated' : 'added'}.`);
        setTimeout(() => {
          navigate("/admin/staffs");
        }, 1200);
      } else {
        toast.error(resp.data || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getFullName = () => {
    return `${formData.first_name} ${formData.last_name}`.trim();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (index: number) => {
    const colors = [
      { gradient: "from-blue-500/10 via-blue-600/5 to-blue-500/10", border: "border-blue-300/30", text: "text-blue-600", bg: "bg-blue-500/10" },
      { gradient: "from-emerald-500/10 via-emerald-600/5 to-emerald-500/10", border: "border-emerald-300/30", text: "text-emerald-600", bg: "bg-emerald-500/10" },
      { gradient: "from-amber-500/10 via-amber-600/5 to-amber-500/10", border: "border-amber-300/30", text: "text-amber-600", bg: "bg-amber-500/10" },
      { gradient: "from-rose-500/10 via-rose-600/5 to-rose-500/10", border: "border-rose-300/30", text: "text-rose-600", bg: "bg-rose-500/10" },
      { gradient: "from-purple-500/10 via-purple-600/5 to-purple-500/10", border: "border-purple-300/30", text: "text-purple-600", bg: "bg-purple-500/10" },
      { gradient: "from-cyan-500/10 via-cyan-600/5 to-cyan-500/10", border: "border-cyan-300/30", text: "text-cyan-600", bg: "bg-cyan-500/10" },
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
            />
          </div>
          <div>
            <p className="text-lg font-medium text-muted-foreground mb-2">Loading staff information</p>
            <p className="text-sm text-muted-foreground/70">Please wait a moment...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/staffs")}
              className="gap-2 h-12 px-4 rounded-xl hover:bg-white/60 hover:shadow-soft transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Staff</span>
            </Button>
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
                {isEditMode ? "Edit Staff Member" : "Add New Staff"}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {isEditMode 
                  ? "Update staff member information and permissions"
                  : "Add a new member to your beauty store Staff"
                }
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            <Card className="border-0 shadow-elevated overflow-hidden bg-white/80 backdrop-blur-lg">
              <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-primary shadow-soft">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-base">
                      Basic details about the staff member
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="first_name" className="text-base font-medium">
                      First Name *
                    </Label>
                    <div className="relative">
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, first_name: e.target.value }));
                          setErrors(prev => ({ ...prev, first_name: "" }));
                        }}
                        placeholder="Enter first name"
                        className={cn(
                          "h-14 text-base pl-12 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm",
                          errors.first_name 
                            ? "border-destructive focus:border-destructive/80 shadow-sm" 
                            : "border-border/50 focus:border-primary/50 hover:border-primary/30 focus:shadow-card"
                        )}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.first_name && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-destructive px-4 py-2 bg-destructive/5 rounded-lg"
                        >
                          {errors.first_name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="last_name" className="text-base font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, last_name: e.target.value }));
                        setErrors(prev => ({ ...prev, last_name: "" }));
                      }}
                      placeholder="Enter last name"
                      className={cn(
                        "h-14 text-base rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm",
                        errors.last_name 
                          ? "border-destructive focus:border-destructive/80 shadow-sm" 
                          : "border-border/50 focus:border-primary/50 hover:border-primary/30 focus:shadow-card"
                      )}
                    />
                    <AnimatePresence>
                      {errors.last_name && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-destructive px-4 py-2 bg-destructive/5 rounded-lg"
                        >
                          {errors.last_name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        placeholder="staff@doonneys.com"
                        className={cn(
                          "h-14 text-base pl-12 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm",
                          errors.email 
                            ? "border-destructive focus:border-destructive/80 shadow-sm" 
                            : "border-border/50 focus:border-primary/50 hover:border-primary/30 focus:shadow-card"
                        )}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-destructive px-4 py-2 bg-destructive/5 rounded-lg"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="mobile_number" className="text-base font-medium">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Input
                        id="mobile_number"
                        value={formData.mobile_number}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, mobile_number: e.target.value }));
                          setErrors(prev => ({ ...prev, mobile_number: "" }));
                        }}
                        placeholder="+1 (825) 000-0000"
                        className={cn(
                          "h-14 text-base pl-12 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm",
                          errors.mobile_number 
                            ? "border-destructive focus:border-destructive/80 shadow-sm" 
                            : "border-border/50 focus:border-primary/50 hover:border-primary/30 focus:shadow-card"
                        )}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Phone className="h-5 w-5" />
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.mobile_number && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-destructive px-4 py-2 bg-destructive/5 rounded-lg"
                        >
                          {errors.mobile_number}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elevated overflow-hidden bg-white/80 backdrop-blur-lg">
              <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-primary shadow-soft">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl">
                      Access Level
                    </CardTitle>
                    <CardDescription className="text-base">
                      Choose the appropriate role and permissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-8">
                <div className="space-y-4">
                  <motion.button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      role_id: "" 
                    }))}
                    className={cn(
                      "w-full p-5 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group",
                      !formData.role_id 
                        ? "border-primary shadow-card-hover" 
                        : "border-border/50 hover:border-primary/30 hover:shadow-soft",
                      "border-border/50",
                      "bg-gradient-to-r from-white/80 via-white/40 to-white/80"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn(
                        "p-3 rounded-lg transition-all duration-300 shadow-sm",
                        !formData.role_id 
                          ? "bg-gradient-primary shadow-primary/30" 
                          : "bg-white/80 shadow-border/30 group-hover:shadow-primary/20"
                      )}>
                        <Sparkles className={cn(
                          "h-5 w-5 transition-all duration-300",
                          !formData.role_id ? "text-white" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "font-display font-semibold text-lg",
                            !formData.role_id ? "text-primary" : "text-foreground"
                          )}>
                            No Role Assigned
                          </p>
                          {!formData.role_id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-md"
                            >
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Staff member will have no specific permissions
                        </p>
                      </div>
                    </div>
                    
                    {!formData.role_id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
                      />
                    )}
                  </motion.button>

                  {accessLevels.map((level, index) => {
                    const isSelected = formData.role_id === level.id;
                    const colors = getRoleColor(index);
                    
                    return (
                      <motion.button
                        key={level.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          role_id: level.id
                        }))}
                        className={cn(
                          "w-full p-5 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group",
                          isSelected 
                            ? "border-primary shadow-card-hover" 
                            : "border-border/50 hover:border-primary/30 hover:shadow-soft",
                          colors.border,
                          "bg-gradient-to-r", colors.gradient
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn(
                            "p-3 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center w-11 h-11",
                            isSelected 
                              ? "bg-gradient-primary shadow-primary/30" 
                              : "bg-white/80 shadow-border/30 group-hover:shadow-primary/20",
                            colors.bg
                          )}>
                            <span className={cn(
                              "font-bold text-sm",
                              isSelected ? "text-white" : colors.text
                            )}>
                              {getInitials(level.name)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "font-display font-semibold text-lg",
                                isSelected ? "text-primary" : "text-foreground"
                              )}>
                                {level.name}
                              </p>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-md"
                                >
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                </motion.div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {level.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                colors.text,
                                colors.bg
                              )}>
                                {level.staffCount} staff assigned
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <Card className="border-0 shadow-elevated overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-lg">
                <CardContent className="p-0">
                  <div className="p-8 text-center space-y-8">
                    <div className="relative inline-block">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-28 h-28 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl"
                      >
                        {(formData.first_name[0] || "") + (formData.last_name[0] || "") || "?"}
                      </motion.div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-sm font-medium">
                          {accessLevels.find(a => a.id === formData.role_id)?.name || "No Role"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-display text-2xl font-semibold mb-2">
                          {getFullName() || "New Staff Member"}
                        </h3>
                        <p className="text-muted-foreground text-lg">
                          {formData.email || "email@doonneys.com"}
                        </p>
                      </div>

                      <Separator className="bg-border/50" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Phone</p>
                          <p className="font-medium text-lg">{formData.mobile_number || "—"}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Role</p>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {accessLevels.find(a => a.id === formData.role_id)?.name.split(" ")[0] || "No Role"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-white/80 backdrop-blur-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-semibold">Quick Tips</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground">
                          Ensure the email address is valid for system communications
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground">
                          Choose the appropriate access level based on the staff member's responsibilities
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground">
                          All fields marked with * are required for submission
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-border/30"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-elevated border border-border/20">
              <div className="text-center sm:text-left">
                <h3 className="font-display text-xl font-semibold mb-2">
                  {isEditMode ? "Update Staff Member" : "Create New Staff"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isEditMode 
                    ? "Review changes and save updates" 
                    : "Double-check information before creating"
                  }
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/staffs")}
                  className="h-12 px-6 rounded-xl border-2 hover:shadow-soft transition-all duration-300 backdrop-blur-sm"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={() => setFormData(defaultFormData)}
                  variant="ghost"
                  className="h-12 px-6 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  Clear Form
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="h-12 px-8 rounded-xl bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {isEditMode ? "Update Staff" : "Create Staff"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminStaffForm;