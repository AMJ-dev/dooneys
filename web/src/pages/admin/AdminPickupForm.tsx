import { useState, useEffect, startTransition } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Building, 
  Store, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Separator } from "@/components/ui/separator";
import {http} from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import usePermissions from "@/hooks/usePermissions";

interface PickupAddressFormData {
  id?: string;
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
  notes?: string;
  lastUpdated?: string;
}

const defaultFormData: PickupAddressFormData = {
  name: "",
  type: "store",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "USA",
  coordinates: { lat: 40.7128, lng: -74.0060 },
  contactPhone: "",
  contactEmail: "",
  manager: "",
  hours: {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 8:00 PM",
    saturday: "10:00 AM - 6:00 PM",
    sunday: "11:00 AM - 5:00 PM"
  },
  status: "active",
  notes: "",
};

const AdminPickupForm = () => {
  const {
    add_pickup_location: can_add_pickup_location,
    edit_pickup_location: can_edit_pickup_location
  } = usePermissions([
    "add_pickup_location",
    "edit_pickup_location",
  ]);
  const navigate = useNavigate();
  const {id} = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PickupAddressFormData>(defaultFormData);

  // Load data for edit mode
  useEffect(() => {
    if (id) {
      if (!can_edit_pickup_location) {
        startTransition(()=>navigate("/unauthorized"))
        return;
      }
        (async () => {
            const res = await http.get(`/get-pickup-location/${id}/`);
            const resp: ApiResp = res.data;
            if (!resp.error && resp.data) {
                setFormData(resp.data);
                return;
            }
            toast.error(resp.data || `Failed to load pickup location`);
        })()
    } else {
      if (!can_add_pickup_location) {
        startTransition(()=>navigate("/unauthorized"))
        return;
      }
      setFormData(defaultFormData);
    }
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await http.post("/save-pickup-location/", formData);
      const resp:ApiResp = res.data;
      if(!resp.error && resp.data){
        toast.success(`${formData.name} has been ${id ? 'updated' : 'added as a pickup location'}.`);        
        startTransition(()=>navigate("/admin/pickup-locations"));
        return;
      }
      toast.error(resp.data || `Failed to ${id ? 'update' : 'create'} pickup location`);

    } catch (error) {
      toast.error(`Failed to ${id ? 'update' : 'create'} pickup location`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: string) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const getCurrentDayHours = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return formData.hours[today as keyof typeof formData.hours];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/pickup-locations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl mb-2">
              {id ? 'Edit Pickup Location' : 'Add New Pickup Location'}
            </h1>
            <p className="text-muted-foreground">
              {id 
                ? 'Update location details and settings' 
                : 'Add a new pickup location for customer orders'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/admin/pickup-locations">
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : id ? 'Update Location' : 'Create Location'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the location details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Downtown Flagship Store"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Location Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="store">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            Store
                          </div>
                        </SelectItem>
                        <SelectItem value="warehouse">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Warehouse
                          </div>
                        </SelectItem>
                        <SelectItem value="partner">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Partner
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleChange('zipCode', e.target.value)}
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => handleChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 absolute ml-3 text-muted-foreground" />
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleChange('contactPhone', e.target.value)}
                        placeholder="+1 (212) 555-1234"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 absolute ml-3 text-muted-foreground" />
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                        placeholder="contact@example.com"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Manager/Contact Person *</Label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 absolute ml-3 text-muted-foreground" />
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => handleChange('manager', e.target.value)}
                      placeholder="Sarah Johnson"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Section */}
            <Card>
              <CardHeader>
                <CardTitle>Location Status</CardTitle>
                <CardDescription>
                  Control the availability and visibility of this location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Location Status</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.status === 'active' 
                        ? 'This location is visible to customers' 
                        : formData.status === 'maintenance'
                        ? 'This location is under maintenance'
                        : 'This location is hidden from customers'}
                    </p>
                  </div>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500" />
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          <span>Maintenance</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Add any additional notes, instructions, or special information about this location..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Hours & Additional Info */}
          <div className="space-y-6">
            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>
                  Set pickup hours for each day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</span>
                    </div>
                    <Badge variant="outline">{getCurrentDayHours()}</Badge>
                  </div>

                  {Object.entries(formData.hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between">
                      <Label htmlFor={`hours-${day}`} className="capitalize w-24">
                        {day}
                      </Label>
                      <Input
                        id={`hours-${day}`}
                        value={hours}
                        onChange={(e) => handleHoursChange(day, e.target.value)}
                        className="w-48"
                        placeholder="9:00 AM - 6:00 PM"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coordinates */}
            <Card>
              <CardHeader>
                <CardTitle>Map Coordinates</CardTitle>
                <CardDescription>
                  Set location coordinates for maps and navigation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="lat" className="text-xs">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.000001"
                        value={formData.coordinates.lat}
                        onChange={(e) => handleCoordinatesChange('lat', e.target.value)}
                        placeholder="40.7128"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lng" className="text-xs">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="0.000001"
                        value={formData.coordinates.lng}
                        onChange={(e) => handleCoordinatesChange('lng', e.target.value)}
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for maps and location services. These coordinates will be used for customer navigation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Preview</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        How customers will see this location
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100">
                      {getTypeIcon(formData.type)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">{formData.name || 'Location Name'}</p>
                      <p className="text-muted-foreground">
                        {formData.address || 'Address not set'}
                      </p>
                      <p className="text-muted-foreground">
                        {formData.city && formData.state && `${formData.city}, ${formData.state} ${formData.zipCode}`}
                      </p>
                    </div>
                    
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{formData.contactPhone || 'No phone set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Today: {getCurrentDayHours()}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mt-2 ${
                        formData.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : formData.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          formData.status === 'active' ? 'bg-green-600' :
                          formData.status === 'maintenance' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`} />
                        <span className="capitalize">{formData.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {id ? `Last updated: ${formData.lastUpdated}` : 'All fields marked with * are required'}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild type="button">
              <Link to="/admin/pickup-locations">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : id ? 'Update Location' : 'Create Location'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminPickupForm;