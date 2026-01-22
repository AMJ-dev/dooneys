import { useState, useMemo, useEffect, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Mail,
  Ban,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Clock,
  Star,
  AlertTriangle,
  Users,
  Key,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
  UserX,
  UserCheck,
  Phone,
  Calendar,
  Sparkles,
  Crown,
  Palette,
  Gem,
  Brush,
  Package,
  Settings,
  Zap,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { resolveSrc } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  pics?: string;
  accessLevel: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  lastActive: string;
  lastLogin?: string;
}

interface AccessLevel {
  id: string;
  name: string;
  count: number;
}

const AdminStaffs = () => {
  const {
    delete_staff: can_delete_staff,
    edit_staff: can_edit_staff,
    view_staff: can_view_staff,
    activate_deactivate_staff: can_activate_deactivate_staff,
    add_staff: can_add_staff,
    staff_to_customer: can_staff_to_customer,
    assign_roles: can_assign_roles
  } = usePermissions([
    "delete_staff",
    "edit_staff",
    "view_staff",
    "activate_deactivate_staff",
    "add_staff",
    "staff_to_customer",
    "assign_roles",
  ])
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "lastActive" | "joinDate">("lastActive");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isConvertToCustomerOpen, setIsConvertToCustomerOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    if(!can_view_staff){
      startTransition(()=>navigate("/unauthorized"))
      return;
    }
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await http.get("/get-staffs/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        if (resp.data.users) setStaff(resp.data.users);
        if (resp.data.access_levels) setAccessLevels(resp.data.access_levels);
        return;
      }
      toast.error(resp.data || "Error fetching staff");
    } catch (error) {
      toast.error("Error fetching staff");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.status === "active").length;
    const inactiveStaff = staff.filter(s => s.status === "inactive").length;
    const suspendedStaff = staff.filter(s => s.status === "suspended").length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeLast7Days = staff.filter(s => 
      new Date(s.lastActive) >= sevenDaysAgo
    ).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newStaffLastMonth = staff.filter(s => 
      new Date(s.joinDate) >= thirtyDaysAgo
    ).length;
    
    const staffNeedingAttention = inactiveStaff + suspendedStaff;
    
    const topActiveStaff = [...staff]
      .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
      .slice(0, 5);

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      suspendedStaff,
      activeLast7Days,
      newStaffLastMonth,
      staffNeedingAttention,
      topActiveStaff,
    };
  }, [staff]);

  const filteredStaff = useMemo(() => {
    let filtered = staff.filter(staffMember => {
      const matchesSearch = staffMember.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staffMember.phone.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || staffMember.status === statusFilter;
      const matchesRole = roleFilter === "all" || staffMember.accessLevel === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "lastActive":
          aValue = new Date(a.lastActive).getTime();
          bValue = new Date(b.lastActive).getTime();
          break;
        case "joinDate":
          aValue = new Date(a.joinDate).getTime();
          bValue = new Date(b.joinDate).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [staff, searchQuery, statusFilter, roleFilter, sortBy, sortOrder]);

  const getRoleName = (accessLevelId: string) => {
    const role = accessLevels.find(l => l.id === accessLevelId);
    return role ? role.name : "Unknown Role";
  };

  const getRoleColor = (index: number) => {
    const colors = [
      { gradient: "from-primary/20 via-primary/10 to-primary/20", border: "border-primary/30", text: "text-primary", bg: "bg-primary/10" },
      { gradient: "from-accent/20 via-accent/10 to-accent/20", border: "border-accent/30", text: "text-accent", bg: "bg-accent/10" },
      { gradient: "from-highlight/20 via-highlight/10 to-highlight/20", border: "border-highlight/30", text: "text-highlight", bg: "bg-highlight/10" },
      { gradient: "from-secondary/20 via-secondary/10 to-secondary/20", border: "border-secondary/30", text: "text-secondary", bg: "bg-secondary/10" },
    ];
    return colors[index % colors.length];
  };

  const getRoleIcon = (roleName: string) => {
    switch(roleName.toLowerCase()) {
      case "admin":
        return <Crown className="h-4 w-4" />;
      case "manager":
        return <Settings className="h-4 w-4" />;
      case "beauty advisor":
        return <Brush className="h-4 w-4" />;
      case "inventory":
        return <Package className="h-4 w-4" />;
      case "customer service":
        return <Users className="h-4 w-4" />;
      case "marketing":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string, name: string) => {
    if(!can_activate_deactivate_staff) return;
    try {
      setProcessingAction(`status-${id}`);
      const newStatus = currentStatus === "suspended" ? "1" : "2";
      const res = await http.post("/update-user-status/", { id, status: newStatus });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${name} has been ${newStatus === "1" ? "activated" : "suspended"}`);
        fetchStaff();
        return;
      }
      toast.error(resp.data || "Failed to update user status");
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setProcessingAction(null); 
    }
  };

  const handleDelete = async(staffId: string, staffName: string) => {
    if(!can_delete_staff) return;
    try {
      setProcessingAction(`delete-${staffId}`);
      const res = await http.post(`/delete-user/`, {id: staffId});
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${staffName}'s account has been deleted`);
        fetchStaff();
        return;
      }
      toast.error(resp.error || "Failed to delete user account");
    } catch (error) {
      toast.error("Failed to delete user account");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleConvertToCustomer = async(staffId: string, staffName: string) => {
    if(!can_staff_to_customer) return;
    try {
      setProcessingAction(`convert-${staffId}`);
      const res = await http.post(`/convert-to-customer/`, {id: staffId});
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${staffName} has been converted to customer account`);
        setIsConvertToCustomerOpen(false);
        fetchStaff();
        return;
      }
      toast.error(resp.error || "Failed to convert staff to customer");
    } catch (error) {
      toast.error("Failed to convert staff to customer");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleAssignRole = async () => {
    if(!can_assign_roles) return;
    if (!selectedStaff || !selectedRole) return;

    try {
      setProcessingAction(`assign-${selectedStaff.id}`);
      const res = await http.post("/assign-staff-access/", {
        access_level_id: selectedRole,
        staff_id: selectedStaff.id
      });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${selectedStaff.name} has been assigned to ${getRoleName(selectedRole)}`);
        setIsAssignRoleOpen(false);
        fetchStaff();
        return;
      }
      toast.error(resp.data || "Failed to assign role");
    } catch (error) {
      toast.error("Failed to assign role");
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }}>
            <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-700 border-emerald-200/50 px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 mr-1.5" />
              Active
            </Badge>
          </motion.div>
        );
      case "inactive":
        return (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }}>
            <Badge className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 border-gray-200/50 px-3 py-1.5 backdrop-blur-sm">
              <Clock className="h-3 w-3 mr-1.5" />
              Inactive
            </Badge>
          </motion.div>
        );
      case "suspended":
        return (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }}>
            <Badge className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-700 border-primary-200/50 px-3 py-1.5 backdrop-blur-sm">
              <Ban className="h-3 w-3 mr-1.5" />
              Suspended
            </Badge>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const handleAddStaff = () => {
    navigate("/admin/staff/new");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5"
      >
        <div className="text-center space-y-8">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative mx-auto w-24 h-24"
          >
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 backdrop-blur-sm"></div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-primary border-b-accent/50"
            />
            <Gem className="absolute inset-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 text-primary/70" />
          </motion.div>
          <div className="space-y-3">
            <h3 className="font-display text-2xl font-medium text-foreground/80">Loading Beauty Staffs</h3>
            <p className="text-muted-foreground/70 max-w-sm mx-auto">
              Curating staff profiles with premium care...
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 backdrop-blur-sm border border-border/30 shadow-elevated"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Staff Management
                </h1>
                <p className="text-muted-foreground/80">
                  Curate and manage your luxury beauty staff with precision
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="gap-2 backdrop-blur-sm border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all"
              onClick={fetchStaff}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {can_add_staff && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleAddStaff} 
                  className="gap-2 bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary hover:to-accent shadow-lg shadow-primary/20"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Staff Member
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Staff",
            value: stats.totalStaff,
            description: `${stats.activeStaff} active • ${stats.newStaffLastMonth} new`,
            icon: <Users className="h-5 w-5" />,
            gradient: "from-primary/10 via-primary/5 to-transparent",
            border: "border-primary/20",
            color: "text-primary"
          },
          {
            title: "Active Members",
            value: stats.activeStaff,
            description: `${stats.activeLast7Days} active in 7 days`,
            icon: <Activity className="h-5 w-5" />,
            gradient: "from-emerald-500/10 via-emerald-400/5 to-transparent",
            border: "border-emerald-200/30",
            color: "text-emerald-600"
          },
          {
            title: "Requires Attention",
            value: stats.staffNeedingAttention,
            description: `${stats.suspendedStaff} suspended • ${stats.inactiveStaff} inactive`,
            icon: <AlertTriangle className="h-5 w-5" />,
            gradient: "from-amber-500/10 via-amber-400/5 to-transparent",
            border: "border-amber-200/30",
            color: "text-amber-600"
          },
          {
            title: "Access Levels",
            value: accessLevels.length,
            description: `${accessLevels.reduce((sum, level) => sum + level.count, 0)} assigned`,
            icon: <Shield className="h-5 w-5" />,
            gradient: "from-purple-500/10 via-purple-400/5 to-transparent",
            border: "border-purple-200/30",
            color: "text-purple-600"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
          >
            <Card className="border-0 bg-gradient-to-br backdrop-blur-sm shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-3xl font-bold font-display">{stat.value}</h3>
                    <p className={`text-sm ${stat.color}`}>{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.border} border bg-white/30 backdrop-blur-sm`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Access Levels & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-0 backdrop-blur-sm shadow-card">
          <CardHeader className="border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">Access Level Distribution</CardTitle>
                <CardDescription>Staff members categorized by permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {accessLevels.map((level, index) => {
                const colors = getRoleColor(index);
                const staffCount = level.count;
                const percentage = stats.totalStaff > 0 ? (staffCount / stats.totalStaff) * 100 : 0;
                
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="group relative overflow-hidden rounded-xl border bg-gradient-to-r from-background/50 to-background/30 p-5 backdrop-blur-sm transition-all hover:shadow-lg"
                    style={{ 
                      borderColor: colors.border,
                      background: `linear-gradient(to right, ${colors.bg}, transparent)`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-white/80 to-white/60 shadow-sm">
                          <div className={colors.text}>
                            {getRoleIcon(level.name)}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold font-display">{level.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{staffCount} staff members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold font-display">{percentage.toFixed(0)}%</p>
                        <div className="w-40 mt-3">
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-full rounded-full ${colors.bg.replace('bg-', 'bg-gradient-to-r ')}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 backdrop-blur-sm shadow-card">
          <CardHeader className="border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent/10 to-highlight/10">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="font-display">Most Recently Active</CardTitle>
                <CardDescription>Staff members with recent activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {stats.topActiveStaff.map((staffMember, index) => (
                <motion.div
                  key={staffMember.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-background/50 to-background/30 border border-border/30 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background group-hover:border-primary/30 transition-all">
                      <AvatarImage src={resolveSrc(staffMember.pics)} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
                        {getInitials(staffMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{staffMember.name}</p>
                      <p className="text-sm text-muted-foreground">{getRoleName(staffMember.accessLevel)}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(staffMember.lastActive)}
                    </p>
                    {getStatusBadge(staffMember.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-background/80 via-background/60 to-background/40 backdrop-blur-xl rounded-2xl border border-border/30 shadow-elevated overflow-hidden"
      >
        <div className="p-6 border-b border-border/30">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
            <div>
              <h2 className="font-display text-xl mb-2">Staff Directory</h2>
              <p className="text-sm text-muted-foreground">
                Manage and curate your beauty staff with precision
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-white/50 backdrop-blur-sm border-border/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-lg border-border/50">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[160px] bg-white/50 backdrop-blur-sm border-border/50">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-lg border-border/50">
                    <SelectItem value="all">All Roles</SelectItem>
                    {accessLevels.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="font-semibold">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => {
                      if (sortBy === "name") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy("name");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    Staff Member
                    {sortBy === "name" && (
                      sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold text-center">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => {
                      if (sortBy === "joinDate") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy("joinDate");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    Joined
                    {sortBy === "joinDate" && (
                      sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-center">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => {
                      if (sortBy === "lastActive") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy("lastActive");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    Last Active
                    {sortBy === "lastActive" && (
                      sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staffMember) => (
                <motion.tr 
                  key={staffMember.id} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border-border/30 hover:bg-gradient-to-r hover:from-primary/5 hover:via-accent/5 hover:to-transparent transition-all"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage src={resolveSrc(staffMember.pics)} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
                          {getInitials(staffMember.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{staffMember.name}</div>
                        <div className="text-sm text-muted-foreground">{staffMember.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border/30 bg-white/50 backdrop-blur-sm">
                      {getRoleIcon(getRoleName(staffMember.accessLevel))}
                      <span className="ml-1.5">{getRoleName(staffMember.accessLevel)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {formatDate(staffMember.joinDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(staffMember.joinDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {formatDate(staffMember.lastActive)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(staffMember.lastActive)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(staffMember.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="backdrop-blur-lg border-border/50 w-56"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedStaff(staffMember);
                            setIsViewOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {can_assign_roles && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedStaff(staffMember);
                              setSelectedRole(staffMember.accessLevel);
                              setIsAssignRoleOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Assign Role
                          </DropdownMenuItem>
                        )}
                        {can_activate_deactivate_staff && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(staffMember.id, staffMember.status, staffMember.name)}
                              disabled={processingAction === `status-${staffMember.id}`}
                              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              {processingAction === `status-${staffMember.id}` ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : staffMember.status === "suspended" ? (
                                <UserCheck className="h-4 w-4 mr-2" />
                              ) : (
                                <UserX className="h-4 w-4 mr-2" />
                              )}
                              {staffMember.status === "suspended" ? "Activate" : "Suspend"}
                            </DropdownMenuItem>
                          </>
                        )}
                        {can_staff_to_customer && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStaff(staffMember);
                              setIsConvertToCustomerOpen(true);
                            }}
                            className="cursor-pointer bg-red-50 text-red-600 focus:text-red-700 focus:bg-red-50"
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Convert to Customer
                          </DropdownMenuItem>
                        )}
                        {can_delete_staff && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent 
                              className="backdrop-blur-lg border-border/50"
                              onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <Trash2 className="h-5 w-5 text-red-500" />
                                  Delete Staff Account
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Are you sure you want to delete <span className="font-semibold text-foreground">{staffMember.name}</span>'s account? This action cannot be undone and will permanently remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(staffMember.id, staffMember.name)}
                                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                                >
                                  Delete Account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredStaff.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl" />
              <Users className="relative w-24 h-24 text-muted-foreground/30" />
            </div>
            <h3 className="font-display text-xl font-medium mb-3">No staff members found</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start building your beauty staff by adding new members."}
            </p>
            <div className="flex gap-3 justify-center">
              {can_add_staff && (
                <Button 
                  onClick={handleAddStaff}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20"
                >
                  <UserPlus className="h-4 w-4" />
                  Add New Staff Member
                </Button>
              )}
              {(searchQuery || statusFilter !== "all" || roleFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setRoleFilter("all");
                  }}
                  className="border-border/50 hover:border-primary/30"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* View Staff Details Dialog */}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="backdrop-blur-lg border-border/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Staff Member Details
            </DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={resolveSrc(selectedStaff.pics)} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-3xl">
                    {getInitials(selectedStaff.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <h3 className="font-display text-2xl font-semibold">{selectedStaff.name}</h3>
                  <p className="text-muted-foreground">{selectedStaff.email}</p>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedStaff.status)}
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      <Shield className="h-3 w-3 mr-1.5" />
                      {getRoleName(selectedStaff.accessLevel)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Contact Information</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedStaff.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-accent/5 to-transparent border border-accent/10">
                        <Mail className="h-4 w-4 text-accent" />
                        <span className="font-medium">{selectedStaff.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Role Information</p>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-highlight/5 to-transparent border border-highlight/10">
                      <p className="font-medium">{getRoleName(selectedStaff.accessLevel)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Access Level ID: {selectedStaff.accessLevel}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Activity Timeline</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-secondary/5 to-transparent border border-secondary/10">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-secondary" />
                          <span>Joined Date</span>
                        </div>
                        <span className="font-medium">{formatDate(selectedStaff.joinDate)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-primary" />
                          <span>Last Active</span>
                        </div>
                        <span className="font-medium">{formatDate(selectedStaff.lastActive)}</span>
                      </div>
                      {selectedStaff.lastLogin && (
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-accent/5 to-transparent border border-accent/10">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-accent" />
                            <span>Last Login</span>
                          </div>
                          <span className="font-medium">{formatDate(selectedStaff.lastLogin)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      {can_assign_roles && (
        <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
          <DialogContent className="backdrop-blur-lg border-border/50 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Assign Role 
              </DialogTitle>
              <DialogDescription>
                Select a new role for <span className="font-semibold text-foreground">{selectedStaff?.name}</span>
              </DialogDescription>
            </DialogHeader>
            {selectedStaff && (
              <div className="space-y-4 py-2">
                <div className="space-y-3">
                  {accessLevels.map((level, index) => {
                    const colors = getRoleColor(index);
                    const isSelected = selectedRole === level.id;
                    
                    return (
                      <motion.button
                        key={level.id}
                        onClick={() => setSelectedRole(level.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group",
                          isSelected 
                            ? "border-primary shadow-card-hover" 
                            : "border-border/50 hover:border-primary/30 hover:shadow-soft",
                          colors.border
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        style={{ 
                          background: isSelected 
                            ? `linear-gradient(to right, ${colors.bg.replace('bg-', '').split('/')[0]}/20, transparent)`
                            : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn(
                            "p-3 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center w-12 h-12",
                            isSelected 
                              ? "bg-gradient-primary shadow-primary/30" 
                              : "bg-white/80 shadow-border/30 group-hover:shadow-primary/20",
                            colors.bg
                          )}>
                            {getRoleIcon(level.name)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "font-semibold",
                                isSelected ? "text-primary" : "text-foreground"
                              )}>
                                {level.name}
                              </p>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-md"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </motion.div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {level.count} staff members
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                
                <DialogFooter className="pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignRoleOpen(false)}
                    className="border-border/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignRole}
                    disabled={!selectedRole || processingAction === `assign-${selectedStaff?.id}`}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    {processingAction === `assign-${selectedStaff?.id}` ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Role"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Convert to Customer Dialog */}
      {can_staff_to_customer && (
        <AlertDialog open={isConvertToCustomerOpen} onOpenChange={setIsConvertToCustomerOpen}>
          <AlertDialogContent className="backdrop-blur-lg border-border/50 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary-500" />
                Convert to Customer Account
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {selectedStaff && (
                  <>
                    Convert <span className="font-semibold text-foreground">{selectedStaff.name}</span> from a staff account to a customer account. This will:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Remove all administrative permissions</li>
                      <li>Preserve their account data and purchase history</li>
                      <li>Allow them to continue shopping as a regular customer</li>
                    </ul>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => selectedStaff && handleConvertToCustomer(selectedStaff.id, selectedStaff.name)}
                disabled={processingAction === `convert-${selectedStaff?.id}`}
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600"
              >
                {processingAction === `convert-${selectedStaff?.id}` ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to Customer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AdminStaffs;