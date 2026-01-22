import { useState, useEffect, useMemo, startTransition } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  Key,
  Percent,
  UserCheck,
  Search,
  AlertTriangle,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { str_to_url } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  staffCount: number;
  createdAt: string;
  lastModified: string;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
}

const AdminAccessControl = () => {
  const navigate = useNavigate();

  const {
    add_role: can_add_role,
    delete_role: can_delete_role,
    edit_role: can_edit_role,
    view_roles: can_view_roles,
  } = usePermissions(["add_role", "delete_role", "edit_role", "view_roles",]);

  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // console.log({can_view_roles});
    if(!can_view_roles) {
      startTransition(() => navigate("/unauthorized"));
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const rolesRes = await http.get("/get-permissions/");
      const rolesResp: ApiResp = rolesRes.data;
      
      if (!rolesResp.error && rolesResp.data) {
        const transformedRoles: Role[] = rolesResp.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions || [],
          staffCount: role.staffCount || 0,
          createdAt: role.createdAt,
          lastModified: role.lastModified || role.createdAt,
        }));
        setRoles(transformedRoles);
      } else {
        toast.error("Failed to load roles");
      }
      
      // This endpoint returns permissions list (based on your response)
      const permsRes = await http.get("/get-roles/");
      const permsResp: ApiResp = permsRes.data;
      
      if (!permsResp.error && permsResp.data) {
        // Transform the data to match Permission interface
        const transformedPerms: Permission[] = permsResp.data.map((perm: any) => ({
          id: perm.id.toString(),
          code: perm.code,
          name: perm.name,
          description: perm.description,
          category: perm.category,
        }));
        setAllPermissions(transformedPerms);
      } else {
        toast.error("Failed to load permissions");
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalRoles = roles.length;
    const totalStaff = roles.reduce((sum, role) => sum + role.staffCount, 0);
    
    // Average permissions per role
    const avgPermissions = totalRoles > 0 
      ? roles.reduce((sum, role) => sum + role.permissions.length, 0) / totalRoles 
      : 0;
    
    // Most used role
    const mostUsedRole = roles.length > 0
      ? roles.reduce((prev, current) => 
          (prev.staffCount > current.staffCount) ? prev : current
        )
      : null;
    
    // Permission coverage (if we have permissions data)
    const totalPossiblePermissions = allPermissions.length;
    const uniquePermissionsUsed = new Set(
      roles.flatMap(role => role.permissions)
    ).size;
    const coveragePercentage = totalPossiblePermissions > 0
      ? (uniquePermissionsUsed / totalPossiblePermissions) * 100
      : 0;
    
    // Staff distribution
    const staffDistribution = roles.map(role => ({
      name: role.name,
      count: role.staffCount,
      percentage: totalStaff > 0 ? (role.staffCount / totalStaff) * 100 : 0,
    })).sort((a, b) => b.count - a.count);
    
    // Recently modified roles
    const recentlyModified = [...roles]
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 3);

    return {
      totalRoles,
      totalStaff,
      avgPermissions: avgPermissions.toFixed(1),
      mostUsedRole,
      coveragePercentage: coveragePercentage.toFixed(1),
      staffDistribution,
      recentlyModified,
      totalPermissions: allPermissions.length,
      unusedPermissions: totalPossiblePermissions - uniquePermissionsUsed,
    };
  }, [roles, allPermissions]);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (role: Role) => {
    if(!can_delete_role) return;
    if (role.staffCount > 0) {
      toast.error("Cannot delete role with assigned staff. Reassign staff first.");
      return;
    }
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if(!can_delete_role) return;
    if (!roleToDelete) return;

    try {
      setDeleting(true);
      const res = await http.post(`/delete-role/`, {
        id: roleToDelete.id
      });
      const resp: ApiResp = res.data;
      
      if (!resp.error) {
        setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
        toast.success("Role deleted successfully");
        startTransition(()=>navigate("/admin/access-control"));
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
      } else {
        toast.error(resp.data || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    } finally {
      setDeleting(false);
    }
  };

  const getRoleColor = (roleId: string) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-purple-100 text-purple-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-orange-100 text-orange-800",
      "bg-cyan-100 text-cyan-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    const index = roleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getPermissionName = (code: string) => {
    const perm = allPermissions.find(p => p.code === code);
    return perm ? perm.name : code;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading access control data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-2">Access Control</h1>
          <p className="text-muted-foreground">
            Manage role-based permissions and access levels
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {can_add_role && (
            <Button onClick={() => navigate("/admin/access-control/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Roles</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.totalRoles}</h3>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.totalStaff} staff members assigned
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Avg Permissions</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.avgPermissions}
                  </h3>
                  <p className="text-xs text-green-600 mt-1">
                    Per role
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Key className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Permission Coverage</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.coveragePercentage}%
                  </h3>
                  <p className="text-xs text-purple-600 mt-1">
                    {stats.unusedPermissions} unused permissions
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Percent className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Most Used Role</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.mostUsedRole?.name || "None"}
                  </h3>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.mostUsedRole?.staffCount || 0} staff
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Staff Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Distribution</CardTitle>
          <CardDescription>
            Staff members by role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.staffDistribution.map((dist) => (
            <div key={dist.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary/60" />
                  <span className="text-sm font-medium">{dist.name}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{dist.count}</span>
                  <span className="text-muted-foreground ml-1">({dist.percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <Progress value={dist.percentage} className="h-1.5 bg-primary/10" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Access Levels Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div>
              <h2 className="font-display text-xl mb-1">Access Levels Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage all access levels with detailed permissions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search access levels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Access Levels Grid */}
        <div className="p-5">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No access levels found</p>
              {
                can_add_role && 
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/admin/access-control/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Role
                </Button>
              }
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-border p-5 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{role.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                      </div>
                    </div>
                    <Badge className={cn("font-medium", getRoleColor(role.id))}>
                      {role.staffCount} staff
                    </Badge>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {role.permissions.length} permissions
                      </p>
                      {allPermissions.length > 0 && (
                        <Progress 
                          value={(role.permissions.length / allPermissions.length) * 100} 
                          className="h-1 w-24" 
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.slice(0, 4).map(permCode => {
                        const permName = getPermissionName(permCode);
                        return (
                          <Badge key={permCode} variant="secondary" className="text-xs">
                            {permName.length > 12 ? permName.substring(0, 12) + '...' : permName}
                          </Badge>
                        );
                      })}
                      {role.permissions.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => startTransition(() => navigate(`/admin/access-control/${role.id}/${str_to_url(role.name)}/details`))}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </Button>
                    {
                      can_edit_role && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => navigate(`/admin/access-control/${role.id}/${str_to_url(role.name)}`)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}
                      {
                        can_delete_role && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(role)}
                        >   
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        )
                      }
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                    <span>Created: {new Date(role.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>Modified: {new Date(role.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Permissions Reference Table */}
      {allPermissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl mb-1">Permissions Reference</h2>
                <p className="text-sm text-muted-foreground">
                  Complete list of all available permissions across {Array.from(new Set(allPermissions.map(p => p.category))).length} categories
                </p>
              </div>
              <Badge variant="outline">{allPermissions.length} Permissions</Badge>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Assigned Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPermissions.map(perm => {
                  const assignedRoles = roles.filter(role => role.permissions.includes(perm.code)).length;
                  
                  return (
                    <TableRow key={perm.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{perm.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{perm.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{perm.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{perm.description}</TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">{assignedRoles}</div>
                        <div className="text-xs text-muted-foreground">
                          {roles.length > 0 ? ((assignedRoles / roles.length * 100).toFixed(0) + '% of roles') : 'No roles'}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}
      {
        can_delete_role && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the role "{roleToDelete?.name}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete Role"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        )
      }
    </div>
  );
};

export default AdminAccessControl;