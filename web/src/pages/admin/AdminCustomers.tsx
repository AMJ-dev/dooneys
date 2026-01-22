import { useState, useMemo, useEffect, startTransition } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MoreHorizontal,
  Mail,
  Ban,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Download,
  Trash2,
  ArrowDown,
  Star,
  AlertTriangle,
  CheckCircle,
  Shield,
  ArrowRightLeft,
  Loader2,
  Clock,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { format_currency, resolveSrc } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  pics: string;
  email: string;
  status: string;
  joined_date: string;
  total_orders: number;
  total_spent: string;
  last_login: string | null;
}

const AdminCustomers = () => {
  const navigate = useNavigate();
  const {
    view_customers: can_view_customers,
    delete_customer: can_delete_customer,
    convert_to_staff: can_convert_to_staff,
    activate_deactivate_customer: can_activate_deactivate_customer,
  } = usePermissions([
    "view_customers",
    "delete_customer",
    "convert_to_staff",
    "activate_deactivate_customer",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isConvertToStaffOpen, setIsConvertToStaffOpen] = useState(false);

  useEffect(() => {
    if(!can_view_customers){
      startTransition(() => navigate("/unauthorized"));
      return;
    }
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await http.get("/get-customers/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setCustomers(resp.data);
        return;
      }
      toast.error(resp.data || "Failed to load customers");
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalUsers = customers.length;
    const activeUsers = customers.filter(customer => customer.status === "active").length;
    
    const totalRevenue = customers.reduce((sum, customer) => 
      sum + parseFloat(customer.total_spent || "0"), 0);
    
    const totalOrders = customers.reduce((sum, customer) => 
      sum + customer.total_orders, 0);
    
    const avgOrdersPerUser = totalUsers > 0 ? totalOrders / totalUsers : 0;
    
    const newUsersThisMonth = customers.filter(customer => {
      const joinedDate = new Date(customer.joined_date);
      const now = new Date();
      return joinedDate.getMonth() === now.getMonth() && 
             joinedDate.getFullYear() === now.getFullYear();
    }).length;
    
    const highValueUsers = customers.filter(customer => 
      parseFloat(customer.total_spent || "0") > 1000).length;
    
    const frequentBuyers = customers.filter(customer => 
      customer.total_orders > 10).length;
    
    const topSpendingCustomers = [...customers]
      .sort((a, b) => parseFloat(b.total_spent || "0") - parseFloat(a.total_spent || "0"))
      .slice(0, 5);
    
    const recentSignups = [...customers]
      .sort((a, b) => new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime())
      .slice(0, 5);

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      totalOrders,
      avgOrdersPerUser,
      newUsersThisMonth,
      highValueUsers,
      frequentBuyers,
      topSpendingCustomers,
      recentSignups,
    };
  }, [customers]);

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConvertToStaff = async () => {
    if(!can_convert_to_staff) return;
    if (!selectedCustomer) return;

    try {
      setProcessingAction(`convert-${selectedCustomer.id}`);
      const res = await http.post(`/convert-to-staff/`, { id: String(selectedCustomer.id) });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${selectedCustomer.first_name} has been converted to staff account`);
        setIsConvertToStaffOpen(false);
        setSelectedCustomer(null);
        fetchCustomers();
        return;
      }
      toast.error(resp.error || "Failed to convert customer to staff");
    } catch (error) {
      toast.error("Failed to convert customer to staff");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDelete = async (customerId: string, customerName: string) => {
    if(!can_delete_customer) return;

    try {
      setProcessingAction(`delete-${customerId}`);
      const res = await http.post(`/delete-user/`, { id: customerId });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${customerName}'s account has been deleted`);
        fetchCustomers();
        return;
      }
      toast.error(resp.data || "Failed to delete user account");
    } catch (error) {
      toast.error("Failed to delete user account");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string, name: string) => {
    if(!can_activate_deactivate_customer) return;
    try {
      setProcessingAction(`status-${id}`);
      const newStatus = currentStatus === "active" ? "2" : "1";
      const res = await http.post("/update-user-status/", { id, status: newStatus });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${name} has been ${newStatus === "1" ? "activated" : "suspended"}`);
        fetchCustomers();
        return;
      }
      toast.error(resp.data || "Failed to update user status");
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-800 border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-0">
        <Ban className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-warm">
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
            <p className="text-lg font-medium text-muted-foreground mb-2">Loading customer information</p>
            <p className="text-sm text-muted-foreground/70">Please wait a moment...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-2">Customers Analytics</h1>
          <p className="text-muted-foreground">
            Manage customer accounts and view analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchCustomers}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Customers</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.totalUsers}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <Progress 
                value={stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0} 
                className="h-1 mt-4 bg-blue-200" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {format_currency(stats.totalRevenue)}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <Progress value={75} className="h-1 mt-4 bg-green-200" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Total Orders</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.totalOrders}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <Progress value={Math.min(stats.totalOrders, 100)} className="h-1 mt-4 bg-purple-200" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">High Value Customers</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.highValueUsers}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <Progress 
                value={stats.totalUsers > 0 ? (stats.highValueUsers / stats.totalUsers) * 100 : 0} 
                className="h-1 mt-4 bg-orange-200" 
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Spending Customers</CardTitle>
            <CardDescription>Highest revenue generating customers</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topSpendingCustomers.length > 0 ? (
              <div className="space-y-4">
                {stats.topSpendingCustomers.map((customer, index) => {
                  const customerSpent = parseFloat(customer.total_spent || "0");
                  const percentage = stats.totalRevenue > 0 ? (customerSpent / stats.totalRevenue) * 100 : 0;
                  
                  return (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={resolveSrc(customer.pics)} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(customer.first_name, customer.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{customer.first_name} {customer.last_name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${customerSpent.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{customer.total_orders} orders</p>
                      </div>
                      <div className="w-32">
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No customer spending data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>New customers registered this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentSignups.length > 0 ? (
              stats.recentSignups.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={resolveSrc(customer.pics)} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(customer.first_name, customer.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{customer.first_name} {customer.last_name}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(customer.joined_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    {getStatusBadge(customer.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No recent signups</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <h2 className="font-display text-xl mb-1">Customers Management</h2>
              <p className="text-sm text-muted-foreground">
                Detailed view of all customers with advanced filtering
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Joined</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-center">Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const totalSpent = parseFloat(customer.total_spent || "0");
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={resolveSrc(customer.pics)} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(customer.first_name, customer.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(customer.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">
                        {new Date(customer.joined_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(customer.joined_date).toLocaleDateString('en-US', {
                          year: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {customer.total_orders}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      ${totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {can_activate_deactivate_customer && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-amber-600"
                                onClick={() => handleStatusChange(String(customer.id), customer.status, `${customer.first_name} ${customer.last_name}`)}
                                disabled={processingAction === `status-${customer.id}`}
                              >
                                {processingAction === `status-${customer.id}` ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : customer.status === "active" ? (
                                  <Ban className="h-4 w-4 mr-2" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                {customer.status === "active" ? "Suspend Customer" : "Activate Customer"}
                              </DropdownMenuItem>
                            </>
                          )}
                          {can_convert_to_staff && (
                            <DropdownMenuItem 
                              className="text-indigo-600"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setIsConvertToStaffOpen(true);
                              }}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Convert to Staff
                            </DropdownMenuItem>
                          )}
                          {can_delete_customer && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-rose-600" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Customer Account</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {customer.first_name}'s account? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(String(customer.id), `${customer.first_name} ${customer.last_name}`)}
                                    className="bg-rose-600 hover:bg-rose-700"
                                    disabled={processingAction === `delete-${customer.id}`}
                                  >
                                    {processingAction === `delete-${customer.id}` ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete Account"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No customers found</p>
          </div>
        )}
      </motion.div>

      {can_convert_to_staff && (
        <AlertDialog open={isConvertToStaffOpen} onOpenChange={setIsConvertToStaffOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Convert to Staff Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedCustomer && (
                  <>
                    Convert <span className="font-semibold">{selectedCustomer.first_name} {selectedCustomer.last_name}</span> from a customer account to a staff account?
                    This will grant them administrative access.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedCustomer(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConvertToStaff}
                disabled={!selectedCustomer || processingAction === `convert-${selectedCustomer?.id}`}
                className="bg-primary hover:bg-primary"
              >
                {processingAction === `convert-${selectedCustomer?.id}` ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to Staff"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AdminCustomers;