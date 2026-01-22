import { useState, useEffect, useMemo, startTransition } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Save,
  ArrowLeft,
  Users,
  Plus,
  Minus,
  Check,
  X,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  CreditCard,
  UserRoundCog,
  UserCog,
  Tag,
  Folder,
  Percent,
  MapPin,
  TrendingUp,
  Box,
  Layers,
  UserX,
  UserPlus,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
import usePermissions from "@/hooks/usePermissions";

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

// Map category names to icons
const categoryIconMap: Record<string, React.ElementType> = {
  "Analytics": TrendingUp,
  "Cashier/Pos": CreditCard,
  "Orders": ShoppingBag,
  "Discount": Percent,
  "Products": Package,
  "Categories": Folder,
  "Inventory": Box,
  "Customers": Users,
  "Staff": Users,
  "Pickup Location": MapPin,
  "Roles (Access Control)": Shield,
  "Settings": Settings,
};

const AdminAccessControlForm = () => {
  const navigate = useNavigate();
  const {
    add_role: can_add_role,
    delete_role: can_delete_role,
    edit_role: can_edit_role,
    view_roles: can_view_roles,
  } = usePermissions(["add_role", "delete_role", "edit_role", "view_roles"]);
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const isViewMode = window.location.search.includes("view=true");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bulkSelectCategory, setBulkSelectCategory] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  // Get unique categories from permissions
  const permissionCategories = useMemo(() => {
    return [...new Set(allPermissions.map(p => p.category))].sort();
  }, [allPermissions]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPermissions = allPermissions.length;
    const selectedCount = formData.permissions.length;
    const coveragePercentage = totalPermissions > 0 ? (selectedCount / totalPermissions) * 100 : 0;
    
    // Permissions by category
    const categoryStats = permissionCategories.map(category => {
      const categoryPerms = allPermissions.filter(p => p.category === category);
      const selectedInCategory = categoryPerms.filter(p => formData.permissions.includes(p.code)).length;
      const categoryPercentage = categoryPerms.length > 0 ? (selectedInCategory / categoryPerms.length) * 100 : 0;
      
      return {
        name: category,
        total: categoryPerms.length,
        selected: selectedInCategory,
        percentage: categoryPercentage,
      };
    });

    return {
      totalPermissions,
      selectedCount,
      coveragePercentage,
      categoryStats,
      isEmpty: selectedCount === 0,
    };
  }, [formData.permissions, allPermissions, permissionCategories]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setFetching(true);
        // Get permissions from the correct endpoint
        const res = await http.get("/get-roles/"); 
        const resp: ApiResp = res.data;
        if (!resp.error && resp.data) {
          // Transform API data to match Permission interface
          const permissions = resp.data.map((perm: any) => ({
            id: perm.id.toString(),
            code: perm.code,
            name: perm.name,
            description: perm.description,
            icon: Shield, // Default icon
            category: perm.category,
          }));
          setAllPermissions(permissions);
        } else {
          toast.error("Failed to load permissions");
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("Failed to load permissions");
      } finally {
        setFetching(false);
      }
    };

    fetchPermissions();
  }, []);

  // Load existing role data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      if (!can_edit_role) {
        startTransition(() => navigate("/unauthorized"));
        return;
      }
      const fetchRole = async () => {
        try {
          setLoading(true);
          // Get role details from the correct endpoint
          const res = await http.get(`/get-permissions/${id}/`);
          const resp: ApiResp = res.data;
          if (!resp.error && resp.data) {
            setFormData({
              name: resp.data.name || "",
              description: resp.data.description || "",
              permissions: resp.data.permissions || [],
            });
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          toast.error("Failed to load role data");
        } finally {
          setLoading(false);
        }
      };
      fetchRole();
    }else if (!can_add_role) {
      startTransition(() => navigate("/unauthorized"));
      return;
    }
  }, [id, isEditMode]);

  // Filter permissions based on search and category
  const filteredPermissions = useMemo(() => {
    return allPermissions.filter(perm => {
      const matchesSearch = 
        perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || perm.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allPermissions]);

  const handlePermissionToggle = (permissionCode: string) => {
    if (isViewMode) return;
    
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionCode)
        ? prev.permissions.filter(code => code !== permissionCode)
        : [...prev.permissions, permissionCode];
            
      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  const handleCategoryToggle = (category: string) => {
    if (isViewMode) return;
    
    const categoryPerms = allPermissions
      .filter(p => p.category === category)
      .map(p => p.code);
    
    const allSelected = categoryPerms.every(perm => 
      formData.permissions.includes(perm)
    );

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(perm => !categoryPerms.includes(perm))
        : [...new Set([...prev.permissions, ...categoryPerms])],
    }));
  };

  const handleSelectAll = () => {
    if (isViewMode) return;
    
    setFormData(prev => ({
      ...prev,
      permissions: allPermissions.map(p => p.code),
    }));
    toast.success("All permissions selected");
  };

  const handleClearAll = () => {
    if (isViewMode) return;
    
    setFormData(prev => ({
      ...prev,
      permissions: [],
    }));
    toast.success("All permissions cleared");
  };

  const handleBulkCategorySelect = () => {
    if (!bulkSelectCategory || isViewMode) return;
    
    const categoryPerms = allPermissions
      .filter(p => p.category === bulkSelectCategory)
      .map(p => p.code);
    
    setFormData(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...categoryPerms])],
    }));
    
    setBulkSelectCategory("");
    toast.success(`Added all ${bulkSelectCategory} permissions`);
  };

  const saveRole = async () => {
    if (!can_add_role) return;
    if (!formData.name.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a role description");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      };
      
      if (isEditMode) (payload as any).id = id;
                  
      const endpoint = isEditMode ? `/update-role/` : `/save-role/`;
      const res = await http.post(endpoint, payload);
      const resp: ApiResp = res.data;
            
      if (!resp.error && resp.data) {
        const action = isEditMode ? "updated" : "created";
        toast.success(`Role ${action} successfully`);
        navigate("/admin/access-control");
      } else {
        toast.error(resp.data || "Failed to save role");
      }
    } catch (error: any) {
      console.error("Error saving role:", error);
      toast.error(error.response?.data?.data || error.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!can_delete_role) return;
    // Implement actual delete API call here
    toast.success(`Access level "${formData.name}" deleted successfully`);
    setShowDeleteDialog(false);
    startTransition(() => navigate("/admin/access-control"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startTransition(() => navigate("/admin/access-control"))}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl mb-2">
              {isViewMode ? "View Access Role" : isEditMode ? "Edit Access Role" : "Create Access Role"}
            </h1>
            <p className="text-muted-foreground">
              {isViewMode 
                ? "View role details and permissions"
                : isEditMode 
                ? "Modify permissions for this access role"
                : "Create a new access role with specific permissions"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isEditMode && !isViewMode && can_delete_role && (
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Access Role</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{formData.name}"? This action cannot be undone.
                    Any staff members assigned this role will lose their permissions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Role
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!isViewMode && (
            <Button onClick={saveRole} className="gap-2" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : isEditMode ? "Update Role" : "Create Role"}
            </Button>
          )}
        </div>
      </div>

      {(loading || fetching) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            {fetching ? "Loading permissions..." : "Loading role data..."}
          </p>
        </div>
      )}

      {!loading && !fetching && (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Role Information & Stats */}
            <div className="space-y-6">
              {/* Role Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Details</CardTitle>
                  <CardDescription>
                    {isViewMode ? "View role information" : "Define the basic information for this role"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Role Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sales Manager, Inventory Staff"
                      value={formData.name}
                      onChange={(e) => !isViewMode && setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={isViewMode}
                      className="text-lg font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose and responsibilities of this role..."
                      value={formData.description}
                      onChange={(e) => !isViewMode && setFormData(prev => ({ ...prev, description: e.target.value }))}
                      disabled={isViewMode}
                      rows={4}
                    />
                  </div>
                  
                  {isEditMode && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Role ID</span>
                        <code className="text-xs px-2 py-1 bg-background rounded">{id}</code>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        This ID is used internally and cannot be changed
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Permissions Analytics</CardTitle>
                  <CardDescription>
                    Summary of selected permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Selected</p>
                      <p className="text-2xl font-bold">{stats.selectedCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                      <p className="text-2xl font-bold">{stats.coveragePercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Coverage</span>
                      <span className="text-sm font-medium">{stats.selectedCount}/{stats.totalPermissions}</span>
                    </div>
                    <Progress value={stats.coveragePercentage} className="h-2" />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Category Breakdown</h4>
                    {stats.categoryStats.map((category) => (
                      <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="text-sm font-medium">{category.selected}/{category.total}</span>
                        </div>
                        <Progress value={category.percentage} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              {!isViewMode && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Quickly manage permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSelectAll}
                        disabled={allPermissions.length === 0}
                        className="gap-2"
                      >
                        <Check className="h-3 w-3" />
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearAll}
                        className="gap-2"
                      >
                        <X className="h-3 w-3" />
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Add Entire Category</Label>
                      <div className="flex gap-2">
                        <Select value={bulkSelectCategory} onValueChange={setBulkSelectCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          size="icon"
                          onClick={handleBulkCategorySelect}
                          disabled={!bulkSelectCategory || allPermissions.length === 0}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Permissions Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* Permissions Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Permissions Management</h2>
                      <p className="text-sm text-muted-foreground">
                        {isViewMode 
                          ? "View all permissions assigned to this role" 
                          : "Select the permissions for this access role"}
                      </p>
                    </div>
                    
                    {!isViewMode && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {stats.selectedCount} selected
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Filters Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search permissions by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        disabled={isViewMode || allPermissions.length === 0}
                      />
                    </div>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                      disabled={allPermissions.length === 0}
                    >
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {permissionCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Category Quick Actions */}
              {!isViewMode && allPermissions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {permissionCategories.map(category => {
                    const categorySelected = allPermissions
                      .filter(p => p.category === category)
                      .every(p => formData.permissions.includes(p.code));
                    const Icon = categoryIconMap[category] || Shield;
                    
                    return (
                      <Button
                        key={category}
                        variant={categorySelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryToggle(category)}
                        className="gap-2"
                      >
                        {categorySelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        <Icon className="h-3 w-3" />
                        {category}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Permissions Grid - Grouped by Category */}
              <div className="space-y-6">
                {permissionCategories.map(category => {
                  const categoryPermissions = allPermissions.filter(p => p.category === category);
                  const selectedInCategory = categoryPermissions.filter(p => formData.permissions.includes(p.code));
                  const Icon = categoryIconMap[category] || Shield;
                  
                  // Skip category if no permissions match search/filter
                  if (selectedCategory !== "all" && selectedCategory !== category) return null;
                  
                  return (
                    <Card key={category} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{category}</CardTitle>
                              <CardDescription>
                                {selectedInCategory.length} of {categoryPermissions.length} permissions selected
                              </CardDescription>
                            </div>
                          </div>
                          {!isViewMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCategoryToggle(category)}
                              className="gap-2"
                            >
                              {categoryPermissions.every(p => formData.permissions.includes(p.code)) ? (
                                <>
                                  <X className="h-3 w-3" />
                                  Deselect All
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3" />
                                  Select All
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryPermissions.map((permission) => {
                            const isSelected = formData.permissions.includes(permission.code);
                            
                            return (
                              <motion.div
                                key={permission.id}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div 
                                  className={cn(
                                    "p-3 rounded-lg border transition-all duration-200",
                                    isSelected 
                                      ? "border-primary/50 bg-primary/5" 
                                      : "border-border hover:border-muted-foreground/30",
                                    !isViewMode && "cursor-pointer"
                                  )}
                                  // onClick={() => !isViewMode && handlePermissionToggle(permission.code)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={cn(
                                      "p-2 rounded-md flex-shrink-0",
                                      isSelected 
                                        ? "bg-primary/10 text-primary" 
                                        : "bg-muted text-muted-foreground"
                                    )}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h3 className="font-medium text-sm mb-1">{permission.name}</h3>
                                          <p className="text-xs text-muted-foreground">
                                            {permission.description}
                                          </p>
                                        </div>
                                        
                                        {!isViewMode ? (
                                          <div className="flex items-center gap-2">
                                            <Switch
                                              checked={isSelected}
                                              onCheckedChange={() => handlePermissionToggle(permission.code)}
                                              className="ml-2"
                                            />
                                          </div>
                                        ) : (
                                          <Badge variant={isSelected ? "default" : "outline"} className="ml-2 text-xs">
                                            {isSelected ? "Granted" : "Denied"}
                                          </Badge>
                                        )}
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
                  );
                })}
              </div>

              {filteredPermissions.length === 0 && allPermissions.length > 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No permissions found matching your search</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}

              {allPermissions.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No permissions available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Permissions will appear here once they are loaded from the server
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          {!isViewMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-6 z-10"
            >
              <Card className="shadow-xl border-primary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{formData.name || "New Access Role"}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {stats.selectedCount} permissions selected
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => navigate("/admin/access-control")}>
                        Cancel
                      </Button>
                      <Button onClick={saveRole} size="lg" className="gap-2" disabled={loading || allPermissions.length === 0}>
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : isEditMode ? "Update Role" : "Create Role"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAccessControlForm;