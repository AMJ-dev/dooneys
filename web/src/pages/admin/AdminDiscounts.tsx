import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MoreHorizontal,
  Tag,
  Percent,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingDown,
  Calendar,
  Clock,
  Copy,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter,
  Download,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { str_to_url, gen_random_string, format_currency } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

interface Discount {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  status: "active" | "expired" | "scheduled" | "disabled";
  usage: {
    used: number;
    limit: number | null;
    perCustomer: number;
  };
  totalUsers: number;
  estimatedSavings: number;
  startDate: string;
  endDate: string | null;
  minPurchase: number | null;
  isActive: boolean;
}

interface ApiResp {
  error: boolean;
  data: any;
  message?: string;
}

const AdminDiscounts = () => {
    const {
    add_discount: can_add_discount,
    edit_discount: can_edit_discount,
    delete_discount: can_delete_discount,
    view_discount: can_view_discount,
    activate_deactivate_discount: can_activate_deactivate_discount,
  } = usePermissions([
    "add_discount",
    "edit_discount",
    "delete_discount",
    "view_discount",
  ]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to map API data to Discount interface
  const mapApiDataToDiscount = (apiData: any): Discount => {
    return {
      id: apiData.id?.toString() || "",
      name: apiData.name || "",
      code: apiData.code || "",
      type: apiData.type || "percentage",
      value: apiData.value || 0,
      status: apiData.status || "active",
      usage: {
        used: apiData.usage?.used || 0,
        limit: apiData.usage?.limit || null,
        perCustomer: apiData.usage?.perCustomer || 1
      },
      totalUsers: apiData.totalUsers || 0,
      estimatedSavings: apiData.estimatedSavings || 0,
      startDate: apiData.startDate || new Date().toISOString().split('T')[0],
      endDate: apiData.endDate || null,
      minPurchase: apiData.minPurchase || null,
      isActive: apiData.isActive || apiData.is_active || false
    };
  };

  // Check if discount is expired
  const isDiscountExpired = (discount: Discount): boolean => {
    if (!discount.endDate) return false;
    const today = new Date();
    const endDate = new Date(discount.endDate);
    return endDate < today;
  };

  // Load discounts from API
  const loadDiscounts = async () => {
    try {
      setIsLoading(true);
      const res = await http.get("/get-discounts/");
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data && Array.isArray(resp.data)) {
        // Map API data to Discount interface
        const mappedDiscounts = resp.data.map(mapApiDataToDiscount);
        setDiscounts(mappedDiscounts);
      } else {
        toast.error(resp.message || "Failed to load discounts");
      }
    } catch (error) {
      console.error("Error loading discounts:", error);
      toast.error("Failed to load discounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(!can_view_discount){
      startTransition(()=>navigate("/unauthorized"));
      return;
    }
    loadDiscounts();
  }, []);

  const refreshDiscounts = async () => {
    try {
      setIsRefreshing(true);
      await loadDiscounts();
      toast.success("Discounts refreshed successfully");
    } catch (error) {
      console.error("Error refreshing discounts:", error);
      toast.error("Failed to refresh discounts");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter discounts based on search and status
  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discount.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && discount.status === "active";
    if (filterStatus === "expired") return matchesSearch && discount.status === "expired";
    if (filterStatus === "scheduled") return matchesSearch && discount.status === "scheduled";
    if (filterStatus === "disabled") return matchesSearch && discount.status === "disabled";
    
    return matchesSearch;
  });

  // Statistics
  const activeDiscounts = discounts.filter(d => d.status === "active").length;
  const totalUsers = discounts.reduce((sum, discount) => sum + discount.totalUsers, 0);
  const totalEstimatedSavings = discounts.reduce((sum, discount) => sum + discount.estimatedSavings, 0);
  const totalUsage = discounts.reduce((sum, discount) => sum + discount.usage.used, 0);
  
  // Active discounts statistics
  const activeDiscountsData = discounts.filter(d => d.status === "active");
  const activeTotalUsers = activeDiscountsData.reduce((sum, d) => sum + d.totalUsers, 0);
  const activeEstimatedSavings = activeDiscountsData.reduce((sum, d) => sum + d.estimatedSavings, 0);

  const handleCreateDiscount = () => {
    startTransition(()=>navigate("/admin/discount/new"));
  };

  const handleEditDiscount = (discount: Discount) => {
    startTransition(()=>navigate(`/admin/discount/${discount.id}/${str_to_url(discount.name)}`));
  };

  const handleViewDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsViewDialogOpen(true);
  };

  const handleDeleteDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if(!can_delete_discount) return;
    if (!selectedDiscount) return;

    try {
      const res = await http.post("/delete-discount/", { id: selectedDiscount.id });
      const resp: ApiResp = res.data;
      
      if (!resp.error) {
        toast.success(`${selectedDiscount.name} has been deleted successfully.`);
        setDiscounts(prev => prev.filter(d => d.id !== selectedDiscount.id));
      } else {
        toast.error(resp.message || "Failed to delete discount");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDiscount(null);
    }
  };

  const toggleDiscountStatus = async (discount: Discount) => {
    if(!can_activate_deactivate_discount) return;
    try {
      const res = await http.post("/toggle-discount/", { id: discount.id });
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        const updatedDiscount = resp.data;
        setDiscounts(prev =>
          prev.map(d =>
            d.id === discount.id
              ? {
                  ...d,
                  isActive: updatedDiscount.is_active,
                  status: updatedDiscount.status || (updatedDiscount.is_active ? "active" : "disabled")
                }
              : d
          )
        );
        
        const statusText = updatedDiscount.is_active ? "activated" : "deactivated";
        toast.success(`${discount.name} has been ${statusText}`);
      } else {
        toast.error(resp.message || "Failed to update discount status");
      }
    } catch (error) {
      console.error("Error toggling discount status:", error);
      toast.error("Failed to update discount status");
    }
  };

  // Check if we should show activate/deactivate option for a discount
  const shouldShowActivateDeactivate = (discount: Discount): boolean => {
    // If discount is expired, don't show activate/deactivate
    if (isDiscountExpired(discount)) {
      return false;
    }
    
    // Only show if discount is either "active" or "disabled" status
    // Don't show for "scheduled" or "expired" status
    return discount.status === "active" || discount.status === "disabled";
  };

  // Get the appropriate action text for activate/deactivate
  const getActivateDeactivateText = (discount: Discount): { text: string; icon: React.ReactNode } => {
    if (discount.status === "active") {
      return {
        text: "Deactivate",
        icon: <AlertCircle className="h-4 w-4 mr-2" />
      };
    } else if (discount.status === "disabled") {
      return {
        text: "Activate",
        icon: <Zap className="h-4 w-4 mr-2" />
      };
    }
    return {
      text: "",
      icon: null
    };
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Discount code ${code} copied to clipboard`);
  };

  const getStatusBadge = (status: Discount["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case "disabled":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="h-3 w-3 mr-1" /> Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: Discount["type"]) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4 text-blue-500" />;
      case "fixed":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "free_shipping":
        return <ShoppingCart className="h-4 w-4 text-purple-500" />;
      default:
        return <Percent className="h-4 w-4 text-blue-500" />;
    }
  };

  const getDiscountDisplay = (discount: Discount) => {
    switch (discount.type) {
      case "percentage":
        return `${discount.value}% OFF`;
      case "fixed":
        return `$${discount.value} OFF`;
      case "free_shipping":
        return "FREE SHIPPING";
      default:
        return `${discount.value}% OFF`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    // Ensure valid date
    if (isNaN(end.getTime())) return null;
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Group discounts by status for tabs
  const allDiscounts = filteredDiscounts;
  const activeTabDiscounts = filteredDiscounts.filter(d => d.status === "active");
  const scheduledTabDiscounts = filteredDiscounts.filter(d => d.status === "scheduled");
  const expiredTabDiscounts = filteredDiscounts.filter(d => d.status === "expired");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-2">Discounts & Promotions</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for your store
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={refreshDiscounts}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Refresh
          </Button>
          {
            can_add_discount && (
              <Button onClick={handleCreateDiscount} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Discount
              </Button>
            )
          }
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading discounts...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Cards */}
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
                      <p className="text-sm font-medium text-blue-800">Active Discounts</p>
                      <h3 className="text-3xl font-bold mt-2">{activeDiscounts}</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        {activeDiscountsData.length} currently running
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <Tag className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <Progress value={100} className="h-1 mt-4 bg-blue-200" />
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
                      <p className="text-sm font-medium text-green-800">Total Users</p>
                      <h3 className="text-3xl font-bold mt-2">{totalUsers.toLocaleString()}</h3>
                      <p className="text-sm text-green-600 mt-1">
                        {activeTotalUsers.toLocaleString()} active users
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <Progress value={85} className="h-1 mt-4 bg-green-200" />
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
                      <p className="text-sm font-medium text-purple-800">Estimated Savings</p>
                      <h3 className="text-3xl font-bold mt-2">{format_currency(totalEstimatedSavings)}</h3>
                      <p className="text-sm text-purple-600 mt-1">
                        {format_currency(activeEstimatedSavings)} active savings
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <TrendingDown className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <Progress value={72} className="h-1 mt-4 bg-purple-200" />
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
                      <p className="text-sm font-medium text-orange-800">Total Usage</p>
                      <h3 className="text-3xl font-bold mt-2">{totalUsage.toLocaleString()}</h3>
                      <p className="text-sm text-orange-600 mt-1">
                        Discount codes redeemed
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <Progress value={45} className="h-1 mt-4 bg-orange-200" />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Discounts ({discounts.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeDiscounts})</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled ({scheduledTabDiscounts.length})</TabsTrigger>
                <TabsTrigger value="expired">Expired ({expiredTabDiscounts.length})</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                      Active Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("expired")}>
                      Expired Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("scheduled")}>
                      Scheduled Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("disabled")}>
                      Disabled Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              {allDiscounts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No discounts found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery ? "Try a different search term" : "Create your first discount code to get started"}
                    </p>
                    {
                      can_add_discount && (
                        <Button onClick={handleCreateDiscount}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Discount
                        </Button>
                      )
                    }
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Discount</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Total Users</TableHead>
                          <TableHead>Savings</TableHead>
                          <TableHead>Valid Until</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allDiscounts.map((discount, index) => {
                          const showActivateDeactivate = shouldShowActivateDeactivate(discount);
                          const activateDeactivateInfo = getActivateDeactivateText(discount);
                          
                          return (
                            <motion.tr
                              key={`${discount.id}-${gen_random_string()}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="font-medium">{discount.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {discount.minPurchase ? `Min. $${discount.minPurchase}` : "No minimum"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                    {discount.code}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopyCode(discount.code)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(discount.type)}
                                  <span className="font-medium">{getDiscountDisplay(discount)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(discount.status)}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{discount.usage.used}</span>
                                    <span className="text-muted-foreground">
                                      {discount.usage.limit ? `/ ${discount.usage.limit}` : "∞"}
                                    </span>
                                  </div>
                                  <Progress
                                    value={discount.usage.limit ? (discount.usage.used / discount.usage.limit) * 100 : 0}
                                    className="h-1"
                                  />
                                  <div className="text-xs text-muted-foreground">
                                    {discount.usage.perCustomer} per customer
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{discount.totalUsers}</div>
                                <div className="text-xs text-muted-foreground">
                                  {discount.usage.used > 0 
                                    ? `${Math.round((discount.totalUsers / discount.usage.used) * 100)}% retention`
                                    : "No usage yet"
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{format_currency(discount.estimatedSavings)}</div>
                                <div className="text-xs text-muted-foreground">
                                  Avg. {format_currency(discount.totalUsers > 0 ? Math.round(discount.estimatedSavings / discount.totalUsers) : 0)}/user
                                </div>
                              </TableCell>
                              <TableCell>
                                {discount.endDate ? (
                                  <div>
                                    <div className="text-sm">{formatDate(discount.endDate)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {getDaysRemaining(discount.endDate) !== null && (
                                        <span className={cn(
                                          "font-medium",
                                          getDaysRemaining(discount.endDate)! < 7 ? "text-red-600" : "text-green-600"
                                        )}>
                                          {getDaysRemaining(discount.endDate)} days left
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">No end date</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewDiscount(discount)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {
                                      can_edit_discount && (
                                        <DropdownMenuItem onClick={() => handleEditDiscount(discount)}>
                                          <Edit2 className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                    )}
                                    {showActivateDeactivate && (
                                      <DropdownMenuItem onClick={() => toggleDiscountStatus(discount)}>
                                        {activateDeactivateInfo.icon}
                                        {activateDeactivateInfo.text}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => handleCopyCode(discount.code)}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copy Code
                                    </DropdownMenuItem>
                                    {can_delete_discount && (
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteDiscount(discount)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    Active Discounts ({activeTabDiscounts.length})
                  </CardTitle>
                  <CardDescription>
                    Currently running promotions and discounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeTabDiscounts.length === 0 ? (
                    <div className="text-center py-12">
                      <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No active discounts at the moment</p>
                      { can_add_discount && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={handleCreateDiscount}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create a New Discount
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeTabDiscounts.map((discount, index) => {
                        const showActivateDeactivate = shouldShowActivateDeactivate(discount);
                        
                        return (
                          <motion.div
                            key={`${discount.id}-${gen_random_string()}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-green-200">
                              <div className="p-5 bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-lg">{discount.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {getDiscountDisplay(discount)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      Active
                                    </Badge>
                                    {showActivateDeactivate && (
                                      <Switch
                                        checked={discount.isActive}
                                        onCheckedChange={() => toggleDiscountStatus(discount)}
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded font-mono flex-1">
                                    {discount.code}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleCopyCode(discount.code)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <CardContent className="p-5">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <div className="text-sm text-muted-foreground">Used</div>
                                      <div className="font-semibold">
                                        {discount.usage.used} / {discount.usage.limit || "∞"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Users</div>
                                      <div className="font-semibold">{discount.totalUsers}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Savings</div>
                                      <div className="font-semibold">{format_currency(discount.estimatedSavings)}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Expires</div>
                                      <div className="font-semibold">
                                        {discount.endDate ? formatDate(discount.endDate) : "Never"}
                                      </div>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => handleViewDiscount(discount)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                    { can_edit_discount && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEditDiscount(discount)}
                                      >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scheduled">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Scheduled Discounts ({scheduledTabDiscounts.length})
                  </CardTitle>
                  <CardDescription>
                    Upcoming promotions scheduled to start in the future
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduledTabDiscounts.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No scheduled discounts at the moment</p>
                      {can_add_discount && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={handleCreateDiscount}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Schedule a New Discount
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scheduledTabDiscounts.map((discount, index) => (
                        <motion.div
                          key={`${discount.id}-${gen_random_string()}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow border-blue-200">
                            <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{discount.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {getDiscountDisplay(discount)}
                                  </p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  Scheduled
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono flex-1">
                                  {discount.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCopyCode(discount.code)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <CardContent className="p-5">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-sm text-muted-foreground">Starts</div>
                                    <div className="font-semibold">{formatDate(discount.startDate)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Ends</div>
                                    <div className="font-semibold">
                                      {discount.endDate ? formatDate(discount.endDate) : "Never"}
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleViewDiscount(discount)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                  {can_edit_discount && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => handleEditDiscount(discount)}
                                    >
                                      <Edit2 className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expired">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Expired Discounts ({expiredTabDiscounts.length})
                  </CardTitle>
                  <CardDescription>
                    Past promotions and their performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expiredTabDiscounts.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No expired discounts found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {expiredTabDiscounts.map((discount, index) => (
                        <motion.div
                          key={`${discount.id}-${gen_random_string()}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{discount.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {getDiscountDisplay(discount)}
                                  </p>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                  Expired
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono flex-1">
                                  {discount.code}
                                </code>
                              </div>
                            </div>
                            <CardContent className="p-5">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-sm text-muted-foreground">Total Usage</div>
                                    <div className="font-semibold">{discount.usage.used}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Total Users</div>
                                    <div className="font-semibold">{discount.totalUsers}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Total Savings</div>
                                    <div className="font-semibold">${discount.estimatedSavings.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Ended</div>
                                    <div className="font-semibold">
                                      {discount.endDate ? formatDate(discount.endDate) : "N/A"}
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleViewDiscount(discount)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* View Discount Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Discount Details
            </DialogTitle>
          </DialogHeader>
          {selectedDiscount && (
            <div className="space-y-6">
              {/* Discount Header */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold">{selectedDiscount.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-lg font-mono bg-background px-3 py-1 rounded">
                        {selectedDiscount.code}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(selectedDiscount.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {getStatusBadge(selectedDiscount.status)}
                </div>
                <div className="text-lg font-semibold text-primary">
                  {getDiscountDisplay(selectedDiscount)}
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedDiscount.usage.used}</div>
                  <div className="text-sm text-muted-foreground">Times Used</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedDiscount.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">${selectedDiscount.estimatedSavings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Savings</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {selectedDiscount.usage.limit || "∞"}
                  </div>
                  <div className="text-sm text-muted-foreground">Usage Limit</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{formatDate(selectedDiscount.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">
                    {selectedDiscount.endDate ? formatDate(selectedDiscount.endDate) : "No end date"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Minimum Purchase:</span>
                  <span className="font-medium">
                    {selectedDiscount.minPurchase ? `$${selectedDiscount.minPurchase}` : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Usage Per Customer:</span>
                  <span className="font-medium">{selectedDiscount.usage.perCustomer}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedDiscount) handleEditDiscount(selectedDiscount);
            }}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {can_delete_discount && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Discount</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>Are you sure you want to delete this discount?</p>
              </div>
              {selectedDiscount && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">{selectedDiscount.name}</div>
                  <code className="text-sm text-muted-foreground">{selectedDiscount.code}</code>
                  <div className="text-sm text-muted-foreground mt-1">
                    This discount has been used {selectedDiscount.usage.used} times by {selectedDiscount.totalUsers} users.
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. All usage data will be permanently deleted.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Discount
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDiscounts;