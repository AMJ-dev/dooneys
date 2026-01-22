import { useState, useMemo, useEffect, startTransition } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Plus,
  Trash2,
  Edit,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  ExternalLink,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Store,
  Home,
  Building,
  Shield,
  Users,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { str_to_url } from "@/lib/functions";
import { toast } from "react-toastify";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import usePermissions from "@/hooks/usePermissions";

interface PickupAddress {
  id: string;
  name: string;
  type: "store" | "warehouse" | "partner";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  contactEmail: string;
  manager: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  status: "active" | "inactive" | "maintenance";
  createdAt: string;
  lastUpdated: string;
  notes?: string;
}

const AdminPickupAddresses = () => {
  const {
    activate_deactivate_pickup_location: can_activate_deactivate_pickup_location,
    add_pickup_location: can_add_pickup_location,
    delete_pickup_location: can_delete_pickup_location,
    edit_pickup_location: can_edit_pickup_location,
    view_pickup_location: can_view_pickup_location,
  } = usePermissions([
    "activate_deactivate_pickup_location",
    "add_pickup_location",
    "delete_pickup_location",
    "edit_pickup_location",
    "view_pickup_location",
  ]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pickupAddresses, setPickupAddresses] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<PickupAddress | null>(null);

  useEffect(() => {
    if (!can_view_pickup_location) {
      startTransition(()=>navigate("/unauthorized"))
      return;
    }
    fetch_locations();
  }, []);
  
  const fetch_locations = async () => {
    try {
      const res = await http.get("/get-pickup-locations/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setPickupAddresses(resp.data);
        return;
      }
      toast.error("Error fetching pickup locations");
    } catch (error) {
      console.error("Error fetching pickup locations:", error);
      toast.error("Error fetching pickup locations");
    }
  };

  // Calculate statistics (removed capacity/utilization)
  const stats = useMemo(() => {
    const totalAddresses = pickupAddresses.length;
    const activeAddresses = pickupAddresses.filter(addr => addr.status === "active").length;
    const stores = pickupAddresses.filter(addr => addr.type === "store").length;
    const warehouses = pickupAddresses.filter(addr => addr.type === "warehouse").length;
    const partners = pickupAddresses.filter(addr => addr.type === "partner").length;
    
    // Cities breakdown
    const cities = Array.from(new Set(pickupAddresses.map(addr => addr.city)));
    const cityStats = cities.map(city => {
      const cityAddresses = pickupAddresses.filter(addr => addr.city === city);
      return {
        name: city,
        count: cityAddresses.length,
        active: cityAddresses.filter(addr => addr.status === "active").length,
      };
    }).sort((a, b) => b.count - a.count);

    // Recent updates
    const recentlyUpdated = [...pickupAddresses]
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 3);

    return {
      totalAddresses,
      activeAddresses,
      stores,
      warehouses,
      partners,
      cities: cityStats,
      recentlyUpdated,
    };
  }, [pickupAddresses]);

  const filteredAddresses = pickupAddresses.filter(
    (addr) =>
      (addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       addr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
       addr.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedType === "all" || addr.type === selectedType) &&
      (selectedStatus === "all" || addr.status === selectedStatus)
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "store":
        return <Store className="h-4 w-4" />;
      case "warehouse":
        return <Building className="h-4 w-4" />;
      case "partner":
        return <Users className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "store":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Store className="h-3 w-3 mr-1" /> Store
        </Badge>;
      case "warehouse":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Building className="h-3 w-3 mr-1" /> Warehouse
        </Badge>;
      case "partner":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Users className="h-3 w-3 mr-1" /> Partner
        </Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Active
        </Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" /> Inactive
        </Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" /> Maintenance
        </Badge>;
      default:
        return null;
    }
  };

  const handleDelete = (address: PickupAddress) => {
    setAddressToDelete(address);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if(!can_delete_pickup_location) return;
    if (!addressToDelete) return;

    try {
      const res = await http.post("/delete-pickup-location/", { id: addressToDelete.id });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${addressToDelete.name} has been removed from pickup locations.`);
        setPickupAddresses(prev => prev.filter(addr => addr.id !== addressToDelete.id));
        return;
      }
      toast.error(`${addressToDelete.name} could not be removed from pickup locations.`);
      setDeleteDialog(false);
      setAddressToDelete(null);
    } catch (error) {
      toast.error(`${addressToDelete.name} could not be removed from pickup locations.`);
      setDeleteDialog(false);
      setAddressToDelete(null);
    }
  };


  const toggleStatus = async (id: string) => {
    if(!can_activate_deactivate_pickup_location) return;
    try {
      const res = await http.post("/toggle-pickup-location/", { id });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success(`${resp.data.name} status has been updated.`);
        fetch_locations()
        return;
      }
      toast.error(`${resp.data.name} status could not be updated.`);
    } catch (error) {
      toast.error("An error occurred while updating the status.");
    }

  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-2">Pickup Locations</h1>
          <p className="text-muted-foreground">
            Manage all pickup locations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {can_add_pickup_location && (
            <Button asChild>
              <Link to="/admin/pickup-location/new" className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Location
              </Link>
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
                  <p className="text-sm font-medium text-blue-800">Total Locations</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.totalAddresses}</h3>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.activeAddresses} active • {stats.stores} stores
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <Progress value={(stats.activeAddresses / stats.totalAddresses) * 100} className="h-1 mt-4 bg-blue-200" />
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
                  <p className="text-sm font-medium text-green-800">Active Locations</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.activeAddresses}
                  </h3>
                  <p className="text-xs text-green-600 mt-1">
                    {Math.round((stats.activeAddresses / stats.totalAddresses) * 100)}% active rate
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <Progress value={(stats.activeAddresses / stats.totalAddresses) * 100} className="h-1 mt-4 bg-green-200" />
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
                  <p className="text-sm font-medium text-purple-800">Cities Coverage</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.cities.length}
                  </h3>
                  <p className="text-xs text-purple-600 mt-1">
                    {stats.totalAddresses} total locations
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <Progress 
                value={Math.min((stats.activeAddresses / stats.totalAddresses) * 100, 100)} 
                className="h-1 mt-4 bg-purple-200" 
              />
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
                  <p className="text-sm font-medium text-orange-800">Partner Locations</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.partners}
                  </h3>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.warehouses} warehouses • {stats.stores} stores
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <Progress 
                value={(stats.partners / stats.totalAddresses) * 100} 
                className="h-1 mt-4 bg-orange-200" 
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pickup Addresses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pickup Locations</CardTitle>
          <CardDescription>
            Manage pickup addresses, edit details, and update status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, address, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <Shield className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {can_add_pickup_location && (
                <Button asChild>
                  <Link to="/admin/pickup-location/new" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Link>
                </Button>
            )}
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAddresses.map((address) => (
                    <TableRow key={address.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(address.type)}
                          <span>{address.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{address.manager}</p>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(address.type)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{address.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {address.contactPhone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{address.contactEmail}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            Mon-Fri: {address.hours.monday.split(' - ')[0]}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Today: {new Date().getDay() === 0 ? address.hours.sunday : 
                                   new Date().getDay() === 6 ? address.hours.saturday : 
                                   address.hours.monday}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(address.status)}
                          {
                            can_activate_deactivate_pickup_location && (                              
                              <Switch
                                checked={address.status === "active"}
                                onCheckedChange={() => toggleStatus(address.id)}
                              />
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {can_edit_pickup_location && (
                            <Button asChild variant="ghost" size="icon">
                              <Link to={`/admin/pickup-location/${address.id}/${str_to_url(address.name)}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {address.coordinates.lat && address.coordinates.lng && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(
                                `https://maps.google.com/?q=${address.coordinates.lat},${address.coordinates.lng}`,
                                '_blank'
                              )}
                            >
                              <Navigation className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {can_edit_pickup_location && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link to={`/admin/pickup-location/${address.id}/${str_to_url(address.name)}`} className="cursor-pointer">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Details
                                    </Link>
                                  </DropdownMenuItem>
                                </>
                              )}
                              {address.coordinates.lat && address.coordinates.lng && (
                                <>
                                  <DropdownMenuItem onClick={() => window.open(
                                    `https://maps.google.com/?q=${address.coordinates.lat},${address.coordinates.lng}`,
                                    '_blank'
                                  )}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in Maps
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {can_delete_pickup_location && (
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(address)}
                                  className="text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Location
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAddresses.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No pickup locations found</p>
                {can_add_pickup_location && (
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/admin/pickup-location/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Location
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {can_delete_pickup_location && (
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pickup Location</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{addressToDelete?.name}</strong>? This action cannot be undone.
                This will remove the location from all customer pickup options.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAddressToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Location
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AdminPickupAddresses;


/*

*/