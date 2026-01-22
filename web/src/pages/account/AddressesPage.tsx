import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Home, 
  Briefcase,
  Star,
  Shield,
  Package,
  ChevronRight,
  Loader2,
  Sparkle,
  Award,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { http } from "@/lib/httpClient";
import { ApiResp, Address } from "@/lib/types";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

const AddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    label: "Home",
    name: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    mobile_number: "",
    is_default: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetch_addresses();
  }, []);

  const fetch_addresses = async () => {
    try {
      setLoading(true);
      const res = await http.get("/get-addresses/");
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        setAddresses(resp.data);
        return;
      }
      toast.error(resp.data || "Failed to load addresses");
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const make_default = async (id: number) => {
    try {
      const res = await http.post("/make-default-address/", { id });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success("Default address updated");
        fetch_addresses();
        return;
      }
      toast.error("Failed to set default address");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address");
    }
  };

  const save_address = async () => {
    setIsSubmitting(true);
    try {
      const endpoint = editingAddress ? "/update-address/" : "/save-address/";
      const data = editingAddress 
        ? { ...formData, id: editingAddress.id }
        : formData;

      const res = await http.post(endpoint, data);
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        toast.success("Address saved");
        fetch_addresses();
        setIsDialogOpen(false);
        resetForm();
        return;
      }
      toast.error("Failed to save address");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const delete_address = async (id: number) => {
    try {
      const res = await http.post("/delete-address/", { id });
      const resp: ApiResp = res.data;
      if (!resp.error && resp.data) {
        toast.success("Address deleted");
        setAddresses((prev) => prev.filter((addr) => Number(addr.id) !== id));
        setAddressToDelete(null);
        return;
      }
      toast.error("Failed to delete address");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      name: "",
      street_address: "",
      city: "",
      province: "",
      postal_code: "",
      mobile_number: "",
      is_default: false
    });
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || "Home",
      name: address.name || "",
      street_address: address.street_address || "",
      city: address.city || "",
      province: address.province || "",
      postal_code: address.postal_code || "",
      mobile_number: address.mobile_number || "",
      is_default: address.is_default || false
    });
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return <Home className="h-5 w-5" />;
      case "work":
        return <Briefcase className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const getLabelColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return "bg-primary/10 text-primary border-primary/20";
      case "work":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-accent/10 text-accent border-accent/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              My <span className="text-gradient">Addresses</span>
            </h1>
          </motion.div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Manage your delivery addresses for seamless beauty experiences
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold">Add Address</h3>
                    <Sparkle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add a new delivery address for your beauty essentials
                  </p>
                  <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-0 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                          {editingAddress ? "Edit Address" : "Add Address"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-5 py-4">
                        <div>
                          <Label className="mb-2 block">Label</Label>
                          <Tabs defaultValue={formData.label} className="w-full">
                            <TabsList className="grid grid-cols-3">
                              {["Home", "Work", "Other"].map((label) => (
                                <TabsTrigger 
                                  key={label}
                                  value={label}
                                  onClick={() => setFormData(prev => ({ ...prev, label }))}
                                  className={cn(
                                    "data-[state=active]:bg-primary data-[state=active]:text-white"
                                  )}
                                >
                                  {label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </Tabs>
                        </div>

                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="Your full name"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Street Address</Label>
                          <Input
                            name="street_address"
                            value={formData.street_address}
                            onChange={handleFormChange}
                            placeholder="Street name and number"
                            className="h-11"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                              name="city"
                              value={formData.city}
                              onChange={handleFormChange}
                              placeholder="City"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Province</Label>
                            <Input
                              name="province"
                              value={formData.province}
                              onChange={handleFormChange}
                              placeholder="Province"
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                              name="postal_code"
                              value={formData.postal_code}
                              onChange={handleFormChange}
                              placeholder="Postal code"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              name="mobile_number"
                              value={formData.mobile_number}
                              onChange={handleFormChange}
                              placeholder="Phone number"
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={formData.is_default}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                            className="h-4 w-4 text-primary rounded"
                          />
                          <Label htmlFor="is_default" className="text-sm">
                            Set as default address
                          </Label>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-primary to-accent"
                            onClick={save_address}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Address"
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <h4 className="font-display text-lg font-semibold mb-4">Your Addresses</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total addresses</span>
                    <span className="font-semibold">{addresses.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Default address</span>
                    <span className="font-semibold text-primary">
                      {addresses.find(a => a.is_default) ? "✓ Set" : "Not set"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Security</span>
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Addresses List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading addresses...</p>
                </div>
              </div>
            ) : addresses.length === 0 ? (
              <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Package className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-2">No addresses yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Add your first address to start receiving your beauty essentials
                  </p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add First Address
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold">Saved Addresses</h3>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {addresses.length} addresses
                  </Badge>
                </div>

                <AnimatePresence>
                  <div className="space-y-4">
                    {addresses.map((address, index) => (
                      <motion.div
                        key={address.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={cn(
                          "border hover:border-primary/30 transition-all duration-300 group",
                          address.is_default && "border-primary/50 shadow-soft"
                        )}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "h-12 w-12 rounded-lg flex items-center justify-center",
                                  getLabelColor(address.label)
                                )}>
                                  {getAddressIcon(address.label)}
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-display text-lg font-semibold">
                                      {address.label}
                                    </h4>
                                    {address.is_default && (
                                      <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                                        <Star className="h-3 w-3 mr-1 fill-white" />
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-foreground font-medium">
                                      {address.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {address.street_address}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {address.city}, {address.province} {address.postal_code}
                                    </p>
                                    {address.mobile_number && (
                                      <p className="text-muted-foreground">
                                        {address.mobile_number}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  {!address.is_default && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 hover:bg-primary/10"
                                        onClick={() => handleEdit(address)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 hover:bg-primary/10"
                                        onClick={() => make_default(address.id!)}
                                      >
                                        <Star className="h-4 w-4" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 hover:bg-destructive/10 text-destructive"
                                            onClick={() => setAddressToDelete(address.id!)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this address?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              className="bg-destructive text-destructive-foreground"
                                              onClick={() => addressToDelete && delete_address(addressToDelete)}
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </>
                                  )}
                                  {address.is_default && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 hover:bg-primary/10"
                                      onClick={() => handleEdit(address)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                {!address.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => make_default(address.id!)}
                                  >
                                    Set as default
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}

            {/* Tips Section */}
            {addresses.length > 0 && (
              <Card className="mt-8 border-0 shadow-soft bg-gradient-to-br from-muted/30 to-background">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-6 w-6 text-primary" />
                    <h4 className="font-display text-lg font-semibold">Address Tips</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Default Address</p>
                      <p className="text-muted-foreground">
                        Set one address as default for faster checkout
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Clear Labels</p>
                      <p className="text-muted-foreground">
                        Use descriptive labels for easy identification
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Secure Storage</p>
                      <p className="text-muted-foreground">
                        Your addresses are encrypted and secure
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressesPage;