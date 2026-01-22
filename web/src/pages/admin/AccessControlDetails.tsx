import { useState, useMemo, useEffect, startTransition } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  Search,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  BarChart3,
  ShoppingBag,
  Package,
  Settings,
  Tag,
  Folder,
  MessageSquare,
  Bell,
  CreditCard,
  Truck,
  ChevronRight,
  Download,
  AlertTriangle,
  MoreVertical,
  Star,
  TrendingUp,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { str_to_url } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  join_date: string;
  last_active: string;
  pics?: string;
  role_id?: string;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  created_at: string;
}

interface AccessLevel {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  staffCount: number;
  createdAt: string;
  lastModified: string;
  assignedStaff: StaffMember[];
}

const AccessControlDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    add_role: can_add_role,
    delete_role: can_delete_role,
    edit_role: can_edit_role,
    view_roles: can_view_roles,
    assign_users: can_assign_users,
    remove_user_access: can_remove_user_access,
  } = usePermissions(["add_role", "delete_role", "edit_role", "view_roles", "assign_users", "remove_user_access"]);
  
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);
  const [assignedStaff, setAssignedStaff] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addUserSearch, setAddUserSearch] = useState("");
  const [selectedUserToRemove, setSelectedUserToRemove] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [permissionView, setPermissionView] = useState<"grid" | "list">("grid");
  const [addingUser, setAddingUser] = useState(false);
  const [removingUser, setRemovingUser] = useState(false);

  useEffect(() => {
    if(!can_view_roles) {
      startTransition(() => navigate("/unauthorized"));
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await http.get(`/get-permissions-details/${id}/`);
        const resp: ApiResp = res.data;
        
        if (!resp.error && resp.data) {
          if (resp.data.permissions) {
            setAllPermissions(resp.data.permissions);
          }
          
          if (resp.data.access_levels) {
            const level = resp.data.access_levels.find((level: any) => level.id === id);
            if (level) {
              setAccessLevel(level);
              setAssignedStaff(level.assignedStaff || []);
            } else {
              toast.error("Access level not found");
              navigate("/admin/access-control");
            }
          } else if (resp.data.id) {
            setAccessLevel(resp.data);
            setAssignedStaff(resp.data.assignedStaff || []);
          }
          
          if (resp.data.staffs) {
            setAvailableStaff(resp.data.staffs);
          }
        } else {
          toast.error(resp.data || "Failed to load data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);
  
  const permissionCategories = useMemo(() => {
    return [...new Set(allPermissions.map(p => p.category))];
  }, [allPermissions]);

  const stats = useMemo(() => {
    if (!accessLevel) return null;

    const totalPermissions = allPermissions.length;
    const selectedCount = accessLevel.permissions.length;
    const coveragePercentage = totalPermissions > 0 ? (selectedCount / totalPermissions) * 100 : 0;
    
    const categoryStats = permissionCategories.map(category => {
      const categoryPerms = allPermissions.filter(p => p.category === category);
      const selectedInCategory = categoryPerms.filter(p => accessLevel.permissions.includes(p.code)).length;
      const categoryPercentage = categoryPerms.length > 0 ? (selectedInCategory / categoryPerms.length) * 100 : 0;
      
      return {
        name: category,
        total: categoryPerms.length,
        selected: selectedInCategory,
        percentage: categoryPercentage,
      };
    });

    const activeStaff = assignedStaff.filter(s => s.status === "active" || s.status === "1").length;
    const inactiveStaff = assignedStaff.filter(s => s.status !== "active" && s.status !== "1").length;
    
    const recentlyAdded = [...assignedStaff]
      .sort((a, b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime())
      .slice(0, 3);

    return {
      totalPermissions,
      selectedCount,
      coveragePercentage,
      categoryStats,
      assignedStaffCount: assignedStaff.length,
      activeStaff,
      inactiveStaff,
      recentlyAdded,
    };
  }, [accessLevel, assignedStaff, allPermissions, permissionCategories]);

  const filteredStaff = useMemo(() => {
    return assignedStaff.filter(staff => {
      const matchesSearch = 
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" ? (staff.status === "active" || staff.status === "1") : 
         staff.status !== "active" && staff.status !== "1");
      return matchesSearch && matchesStatus;
    });
  }, [assignedStaff, searchQuery, statusFilter]);

  const staffToAdd = useMemo(() => {
    const assignedIds = new Set(assignedStaff.map(s => s.id));
    return availableStaff
      .filter(staff => !assignedIds.has(staff.id))
      .filter(staff => 
        staff.name.toLowerCase().includes(addUserSearch.toLowerCase()) ||
        staff.email.toLowerCase().includes(addUserSearch.toLowerCase())
      );
  }, [assignedStaff, availableStaff, addUserSearch]);

  const handleAddUser = async (staffMember: StaffMember) => {
    if(!can_assign_users) return;
    try {
      setAddingUser(true);
      const res = await http.post(`/assign-staff-access/`, {
        access_level_id: accessLevel?.id,
        staff_id: staffMember.id
      });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setAssignedStaff(prev => [...prev, staffMember]);
        setAddUserSearch("");
        toast.success(`${staffMember.name} has been assigned to this role`);
        return;
      }
      toast.error(resp.data || "Failed to assign user");
    } catch (error) {
      toast.error("Failed to assign user");
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (staffMember: StaffMember) => {
    if(!can_remove_user_access) return;
    try {
      setRemovingUser(true);
      const res = await http.post(`/remove-staff-access/`, {
        access_level_id: accessLevel?.id,
        staff_id: staffMember.id
      });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${staffMember.name} has been removed from this role`);
        setAssignedStaff(prev => prev.filter(s => s.id !== staffMember.id));
        setSelectedUserToRemove(null);
        return;
      }
      toast.error(resp.data || "Failed to remove user");
    } catch (error) {
      toast.error("Failed to remove user");
    } finally {
      setRemovingUser(false);
    }
  };
  
  const handleRemoveAllUsers = async() => {
    if(!can_remove_user_access) return;
    try {
      const res = await http.post(`/remove-all-staff-access/`, {
        access_level_id: accessLevel?.id
      });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setAssignedStaff([]);
        toast.success("All staff members have been removed from this role");
        return;
      }
      toast.error(resp.data || "Failed to remove users");
    } catch (error) {
      toast.error("Failed to remove users");
    }
  };

  const handleDeleteRole = async () => {
    if(!can_delete_role) return;
    try {
      const res = await http.post(`/delete-role/`, {
        access_level_id: id
      });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        navigate("/admin/access-control");
        toast.success("Role deleted successfully");
        return;
      }
      toast.error(resp.data || "Failed to delete role");
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };


  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      Shield, Users, BarChart3, ShoppingBag, Package, Settings, Tag,
      Folder, MessageSquare, Bell, CreditCard, Truck, Star, Zap,
      Lock, Unlock, UserCheck, UserX,
    };
    return iconMap[iconName] || Shield;
  };

  const getStatusColor = (status: string) => {
    if (status === "active" || status === "1") {
      return "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-700 border-emerald-200/50";
    }
    return "bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700 border-rose-200/50";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accessLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
          <Shield className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6 relative z-10" />
        </motion.div>
        <h2 className="font-display text-2xl font-semibold mb-2">Access Level Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          The access level you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          onClick={() => navigate("/admin/access-control")}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Access Control
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-6 border border-border/50 shadow-soft">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin/access-control")}
                className="hover:bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                    {accessLevel.name}
                  </h1>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "border-primary/30 bg-primary/10 text-primary shadow-sm",
                      accessLevel.id === "admin" && "border-amber-300/30 bg-amber-500/10 text-amber-600"
                    )}
                  >
                    {accessLevel.id === "admin" ? (
                      <>
                        <Star className="h-3 w-3 mr-1" />
                        Administrator
                      </>
                    ) : (
                      "Custom Role"
                    )}
                  </Badge>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  {accessLevel.description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {
                can_edit_role && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/admin/access-control/${id}/${str_to_url(accessLevel.name)}`)}
                        className="gap-2 hover:bg-background border-border/50 backdrop-blur-sm shadow-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Permissions
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit role permissions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                )
              }

              {can_delete_role && (
                <AlertDialog>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="gap-2 border-rose-200/50 text-rose-600 hover:bg-rose-50 hover:text-rose-700 backdrop-blur-sm shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Role
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete this role permanently</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent className="border-border/50 backdrop-blur-lg shadow-elevated">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        Delete Role Confirmation
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Are you sure you want to delete <span className="font-semibold text-foreground">{accessLevel.name}</span>?
                        </p>
                        <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200">
                          <p className="text-sm text-rose-700">
                            ⚠️ This action cannot be undone. All {assignedStaff.length} staff members will lose this role.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteRole}
                        className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-sm"
                      >
                        Delete Role
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 backdrop-blur-sm overflow-hidden group hover:shadow-card-hover transition-all duration-300 shadow-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-300" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Assigned Staff</p>
                  <h3 className="text-3xl font-bold mb-2">{stats?.assignedStaffCount || 0}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-200/50 px-2 py-0.5 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {stats?.activeStaff || 0} active
                    </Badge>
                    <Badge className="bg-rose-500/20 text-rose-700 border-rose-200/50 px-2 py-0.5 text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      {stats?.inactiveStaff || 0} inactive
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-blue-100/50 dark:bg-blue-900/30 shadow-sm">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Progress 
                value={stats?.assignedStaffCount ? (stats.activeStaff / stats.assignedStaffCount) * 100 : 0} 
                className="h-2 mt-4 bg-blue-200/50 dark:bg-blue-900/30" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10 backdrop-blur-sm overflow-hidden group hover:shadow-card-hover transition-all duration-300 shadow-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-300" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Permissions</p>
                  <h3 className="text-3xl font-bold mb-2">{stats?.selectedCount || 0}</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {stats?.coveragePercentage?.toFixed(1)}% coverage
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 shadow-sm">
                  <Key className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <Progress 
                value={stats?.coveragePercentage || 0} 
                className="h-2 mt-4 bg-emerald-200/50 dark:bg-emerald-900/30" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 backdrop-blur-sm overflow-hidden group hover:shadow-card-hover transition-all duration-300 shadow-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-300" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">Last Modified</p>
                  <h3 className="text-3xl font-bold mb-2">
                    {new Date(accessLevel.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Role updated
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-100/50 dark:bg-amber-900/30 shadow-sm">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <Progress 
                value={100} 
                className="h-2 mt-4 bg-amber-200/50 dark:bg-amber-900/30" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 backdrop-blur-sm overflow-hidden group hover:shadow-card-hover transition-all duration-300 shadow-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-300" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Created</p>
                  <h3 className="text-3xl font-bold mb-2">
                    {new Date(accessLevel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Role creation date
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100/50 dark:bg-purple-900/30 shadow-sm">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="h-2 mt-4 bg-purple-200/50 dark:bg-purple-900/30 rounded-full" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <TabsList className="bg-muted/50 backdrop-blur-sm border border-border/50 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:shadow-sm">
              <Users className="h-4 w-4 mr-2" />
              Staff ({assignedStaff.length})
            </TabsTrigger>
            <TabsTrigger value="permissions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:shadow-sm">
              <Key className="h-4 w-4 mr-2" />
              Permissions ({stats?.selectedCount || 0})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {activeTab === "permissions" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-2 hover:bg-background/50", permissionView === "grid" && "bg-background shadow-sm")}
                  onClick={() => setPermissionView("grid")}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-2 hover:bg-background/50", permissionView === "list" && "bg-background shadow-sm")}
                  onClick={() => setPermissionView("list")}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Role Information
                  </CardTitle>
                  <CardDescription>
                    Detailed information about this access level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Role ID</p>
                          <p className="font-medium font-mono bg-muted/50 px-2 py-1 rounded text-xs">{accessLevel.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Staff Count</p>
                          <p className="font-medium">{stats?.assignedStaffCount || 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Created Date</p>
                          <p className="font-medium">{new Date(accessLevel.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Last Modified</p>
                          <p className="font-medium">{new Date(accessLevel.lastModified).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      Permissions Summary by Category
                    </h4>
                    <div className="space-y-2">
                      {stats?.categoryStats.map((category) => {
                        const Icon = getIconComponent(category.name);
                        return (
                          <div key={`${category.name}-${category.total}`} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{category.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {category.selected} of {category.total} permissions
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className={cn(
                              "border-border/50",
                              category.percentage === 100 && "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                            )}>
                              {category.percentage.toFixed(0)}%
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recently Added Staff */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Recently Added Staff
                    </CardTitle>
                    <CardDescription>
                      Latest members assigned to this role
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 shadow-sm">
                    {assignedStaff.length} total
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
                      stats.recentlyAdded.map((staff, index) => (
                        <motion.div
                          key={`${staff.id}-recent`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-background/50 to-background/30 border border-border/50 hover:border-primary/30 transition-all group shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background group-hover:border-primary/30 transition-colors shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{staff.name}</p>
                              <p className="text-xs text-muted-foreground">{staff.email}</p>
                            </div>
                          </div>
                          <Badge 
                            className={cn(
                              "border-0 shadow-sm",
                              getStatusColor(staff.status)
                            )}
                          >
                            {staff.status === "active" || staff.status === "1" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {staff.status === "active" || staff.status === "1" ? "Active" : "Inactive"}
                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No staff members assigned yet</p>
                        {can_assign_users && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                className="mt-3 gap-2 shadow-sm"
                                variant="outline"
                              >
                                <UserPlus className="h-3 w-3" />
                                Add Staff Members
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-border/50 backdrop-blur-lg shadow-elevated max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <UserPlus className="h-5 w-5 text-primary" />
                                  Add Staff to Role
                                </DialogTitle>
                                <DialogDescription>
                                  Search and select staff members to assign to this role
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                <div>
                                  <Label>Search Staff Members</Label>
                                  <div className="relative mt-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Search by name or email..."
                                      value={addUserSearch}
                                      onChange={(e) => setAddUserSearch(e.target.value)}
                                      className="pl-9 border-border/50"
                                    />
                                  </div>
                                </div>
                                
                                <ScrollArea className="h-[300px] pr-4">
                                  <div className="space-y-2">
                                    {staffToAdd.length > 0 ? (
                                      staffToAdd.map((staff) => (
                                        <motion.div
                                          key={`${staff.id}-available`}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                                          onClick={() => handleAddUser(staff)}
                                        >
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium text-sm">{staff.name}</p>
                                              <p className="text-xs text-muted-foreground">{staff.email}</p>
                                            </div>
                                          </div>
                                          <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                                            {addingUser ? (
                                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            ) : (
                                              <UserPlus className="h-4 w-4 text-primary" />
                                            )}
                                          </Button>
                                        </motion.div>
                                      ))
                                    ) : (
                                      <div className="text-center py-8">
                                        <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="text-muted-foreground">No staff members found</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Try a different search term
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
                {assignedStaff.length > 0 && (
                  <CardFooter className="border-t border-border/50 pt-4">
                    <Button 
                      onClick={() => setActiveTab("staff")}
                      variant="ghost" 
                      className="w-full justify-center gap-2 text-primary hover:text-primary/90 hover:bg-primary/5"
                    >
                      View All Staff
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Manage this role with quick actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {can_edit_role && (
                  <Button
                    onClick={() => navigate(`/admin/access-control/${id}/${str_to_url(accessLevel.name)}`)}
                    variant="outline"
                    className="h-auto py-6 flex-col gap-3 border-border/50 hover:border-primary/50 hover:bg-primary/5 group shadow-sm"
                  >
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Edit className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Edit Permissions</p>
                      <p className="text-xs text-muted-foreground mt-1">Modify role permissions</p>
                    </div>
                  </Button>
                )}
                {
                  can_assign_users && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto py-6 flex-col gap-3 border-border/50 hover:border-primary/50 hover:bg-primary/5 group shadow-sm"
                        >
                          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <UserPlus className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Add Staff</p>
                            <p className="text-xs text-muted-foreground mt-1">Assign staff to this role</p>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-border/50 backdrop-blur-lg shadow-elevated max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Add Staff to Role
                          </DialogTitle>
                          <DialogDescription>
                            Search and select staff members to assign to this role
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div>
                            <Label>Search Staff Members</Label>
                            <div className="relative mt-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by name or email..."
                                value={addUserSearch}
                                onChange={(e) => setAddUserSearch(e.target.value)}
                                className="pl-9 border-border/50"
                              />
                            </div>
                          </div>
                          
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                              {staffToAdd.length > 0 ? (
                                staffToAdd.map((staff) => (
                                  <motion.div
                                    key={`${staff.id}-available`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                                    onClick={() => handleAddUser(staff)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                                          {staff.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">{staff.name}</p>
                                        <p className="text-xs text-muted-foreground">{staff.email}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                                      {addingUser ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                      ) : (
                                        <UserPlus className="h-4 w-4 text-primary" />
                                      )}
                                    </Button>
                                  </motion.div>
                                ))
                              ) : (
                                <div className="text-center py-8">
                                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                  <p className="text-muted-foreground">No staff members found</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Try a different search term
                                  </p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          {/* Staff Management Header */}
          <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Assigned Staff Management</h2>
                  <p className="text-muted-foreground">
                    Manage staff members assigned to <span className="font-semibold text-primary">{accessLevel.name}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {can_assign_users && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-sm">
                          <UserPlus className="h-3 w-3" />
                          Add Staff
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-border/50 backdrop-blur-lg shadow-elevated max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Add Staff to Role
                          </DialogTitle>
                          <DialogDescription>
                            Search and select staff members to assign to this role
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div>
                            <Label>Search Staff Members</Label>
                            <div className="relative mt-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by name or email..."
                                value={addUserSearch}
                                onChange={(e) => setAddUserSearch(e.target.value)}
                                className="pl-9 border-border/50"
                              />
                            </div>
                          </div>
                          
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                              {staffToAdd.length > 0 ? (
                                staffToAdd.map((staff) => (
                                  <motion.div
                                    key={`${staff.id}-available`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                                    onClick={() => handleAddUser(staff)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                                          {staff.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">{staff.name}</p>
                                        <p className="text-xs text-muted-foreground">{staff.email}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                                      {addingUser ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                      ) : (
                                        <UserPlus className="h-4 w-4 text-primary" />
                                      )}
                                    </Button>
                                  </motion.div>
                                ))
                              ) : (
                                <div className="text-center py-8">
                                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                  <p className="text-muted-foreground">No staff members found</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Try a different search term
                                  </p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-border/50 bg-background/50"
                  />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] border-border/50 bg-background/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="border-border/50 backdrop-blur-lg shadow-elevated">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                          className="border-border/50"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear filters</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Table */}
          <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card overflow-hidden">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-semibold">Staff Member</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="font-semibold">Last Active</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredStaff.map((staff, index) => (
                      <motion.tr
                        key={`${staff.id}-row`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-border/50 hover:bg-muted/30 transition-colors group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background group-hover:border-primary/30 transition-colors shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-sm text-muted-foreground">{staff.email}</div>
                              <div className="text-xs text-muted-foreground mt-1">{staff.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "border-0 px-3 py-1 shadow-sm",
                              getStatusColor(staff.status)
                            )}
                          >
                            {staff.status === "active" || staff.status === "1" ? (
                              <CheckCircle className="h-3 w-3 mr-1.5" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1.5" />
                            )}
                            {staff.status === "active" || staff.status === "1" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {new Date(staff.join_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor((Date.now() - new Date(staff.join_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months ago
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {staff.last_active ? new Date(staff.last_active).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              }) : 'Never'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last seen
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          { can_remove_user_access && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-border/50 backdrop-blur-lg shadow-elevated w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {accessLevel.id !== "admin" && (
                                  <DropdownMenuItem
                                    className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                    onClick={() => setSelectedUserToRemove(staff)}
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remove from Role
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No staff members found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "No staff members are currently assigned to this role."}
                </p>
                <div className="flex gap-3 justify-center">
                  { can_assign_users && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-sm">
                          <UserPlus className="h-4 w-4" />
                          Add Staff Members
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-border/50 backdrop-blur-lg shadow-elevated max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Add Staff to Role
                          </DialogTitle>
                          <DialogDescription>
                            Search and select staff members to assign to this role
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div>
                            <Label>Search Staff Members</Label>
                            <div className="relative mt-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by name or email..."
                                value={addUserSearch}
                                onChange={(e) => setAddUserSearch(e.target.value)}
                                className="pl-9 border-border/50"
                              />
                            </div>
                          </div>
                          
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                              {staffToAdd.length > 0 ? (
                                staffToAdd.map((staff) => (
                                  <motion.div
                                    key={`${staff.id}-available`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                                    onClick={() => handleAddUser(staff)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                                          {staff.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">{staff.name}</p>
                                        <p className="text-xs text-muted-foreground">{staff.email}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                                      {addingUser ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                      ) : (
                                        <UserPlus className="h-4 w-4 text-primary" />
                                      )}
                                    </Button>
                                  </motion.div>
                                ))
                              ) : (
                                <div className="text-center py-8">
                                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                  <p className="text-muted-foreground">No staff members found</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Try a different search term
                                  </p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {(searchQuery || statusFilter !== "all") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="border-border/50 shadow-sm"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}

            {assignedStaff.length > 0 && (
              <div className="p-4 border-t border-border/50 bg-muted/10">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredStaff.length}</span> of{" "}
                    <span className="font-semibold text-foreground">{assignedStaff.length}</span> staff members
                  </div>
                  
                  {can_remove_user_access && assignedStaff.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-rose-200/50 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300/50 shadow-sm"
                        >
                          <UserMinus className="h-3 w-3" />
                          Remove All Staff
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-border/50 backdrop-blur-lg shadow-elevated">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                            Remove All Staff Members
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>
                              Are you sure you want to remove all {assignedStaff.length} staff members from{" "}
                              <span className="font-semibold text-foreground">{accessLevel.name}</span>?
                            </p>
                            <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200">
                              <p className="text-sm text-rose-700">
                                ⚠️ This action will remove all assigned staff from this role. They will lose all permissions associated with this role.
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleRemoveAllUsers}
                            className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-sm"
                          >
                            Remove All Staff
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {/* Permissions Header */}
          <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Role Permissions</h2>
                  <p className="text-muted-foreground">
                    Manage permissions granted by <span className="font-semibold text-primary">{accessLevel.name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary shadow-sm">
                    {stats?.selectedCount || 0} permissions granted
                  </Badge>
                  <Badge variant="outline" className="border-border/50 shadow-sm">
                    {stats?.coveragePercentage?.toFixed(1)}% coverage
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Grid/List */}
          <div className="space-y-6">
            {permissionCategories.map((category) => {
              const categoryPermissions = allPermissions.filter(p => p.category === category);
              const grantedPermissions = categoryPermissions.filter(p => 
                accessLevel?.permissions.includes(p.code)
              );
              
              if (grantedPermissions.length === 0) return null;

              return (
                <motion.div
                  key={`${category}-permissions`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 shadow-sm">
                        {(() => {
                          const Icon = getIconComponent(category);
                          return <Icon className="h-5 w-5 text-primary" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {grantedPermissions.length} of {categoryPermissions.length} permissions granted
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "border-border/50 shadow-sm",
                        grantedPermissions.length === categoryPermissions.length && "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                      )}
                    >
                      {Math.round((grantedPermissions.length / categoryPermissions.length) * 100)}%
                    </Badge>
                  </div>
                  
                  {permissionView === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grantedPermissions.map((permission) => {
                        const Icon = getIconComponent(permission.icon);
                        return (
                          <motion.div
                            key={`${permission.id}-detail`}
                            whileHover={{ scale: 1.02 }}
                            className="group relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm hover:border-primary/30 transition-all relative z-10 shadow-card hover:shadow-card-hover">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-1">{permission.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {permission.description}
                                    </p>
                                    <div className="mt-2">
                                      <Badge variant="outline" className="text-xs border-border/50">
                                        {permission.code}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-card">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="font-semibold">Permission</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="font-semibold">Code</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grantedPermissions.map((permission) => {
                            const Icon = getIconComponent(permission.icon);
                            return (
                              <TableRow key={`${permission.id}-row`} className="border-border/50 hover:bg-muted/30">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">{permission.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">{permission.description}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono text-xs border-border/50">
                                    {permission.code}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  )}
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {
        can_remove_user_access && (
        <AlertDialog open={!!selectedUserToRemove} onOpenChange={() => setSelectedUserToRemove(null)}>
          <AlertDialogContent className="border-border/50 backdrop-blur-lg shadow-elevated">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-rose-500" />
                Remove Staff Member
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-foreground">{selectedUserToRemove?.name}</span> from{" "}
                  <span className="font-semibold text-primary">{accessLevel.name}</span>?
                </p>
                <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200">
                  <p className="text-sm text-rose-700">
                    ⚠️ This staff member will lose all permissions associated with this role.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => selectedUserToRemove && handleRemoveUser(selectedUserToRemove)}
                className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-sm"
              >
                {removingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove from Role"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </motion.div>
  );
};

export default AccessControlDetails;