import { useState, useEffect, startTransition } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Package,
  Copy,
  Check,
  AlertCircle,
  Gift,
  X,
  Sparkles,
  Star,
  Zap,
  ShoppingCart,
  Loader2,
  Info,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { gen_random_string } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

interface DiscountFormData {
  name: string;
  description: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: string;
  code: string;
  usage_limit: string;
  usage_per_customer: string;
  min_purchase_amount: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price?: number;
}

interface DiscountData {
  discount: {
    id: string;
    name: string;
    code: string;
    description: string;
    discount_type: "percentage" | "fixed" | "free_shipping";
    discount_value: string;
    usage_limit: number;
    usage_per_customer: number;
    start_date: string;
    end_date: string;
    computed_status: string;
  };
  categories: Category[];
  products: Product[];
}

const discountTypes = [
  {
    id: "percentage",
    name: "Percentage Discount",
    description: "Apply a percentage discount to eligible items",
    icon: Percent,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "fixed",
    name: "Fixed Amount Discount",
    description: "Apply a fixed amount discount to eligible items",
    icon: DollarSign,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "free_shipping",
    name: "Free Shipping",
    description: "Offer free shipping on eligible orders",
    icon: ShoppingCart,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

interface DiscountPreviewProps {
  formData: DiscountFormData;
}

const DiscountPreview = ({ formData }: DiscountPreviewProps) => {
  const getDiscountDisplay = () => {
    if (formData.discount_type === "percentage") {
      return `${formData.discount_value || 0}% OFF`;
    } else if (formData.discount_type === "fixed") {
      return `$${formData.discount_value || 0} OFF`;
    } else {
      return "FREE SHIPPING";
    }
  };


  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Promotion Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Discount Card Preview */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 p-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative z-10">
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
              {formData.discount_type === "free_shipping" ? "Free Shipping" : "Discount Code"}
            </Badge>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{getDiscountDisplay()}</h3>
              <Tag className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {formData.name || "Discount Name"}
            </p>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono font-bold tracking-wider">
                  {formData.code || "DISCOUNTCODE"}
                </code>
                <Copy className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Discount Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={formData.is_active ? "default" : "secondary"}>
              {formData.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage Limit:</span>
            <span className="font-medium">{formData.usage_limit || "Unlimited"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Per Customer:</span>
            <span className="font-medium">{formData.usage_per_customer || "1"}</span>
          </div>
        </div>

        {/* Validity Period */}
        {(formData.start_date || formData.end_date) && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>Valid Period</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="font-medium">Starts</div>
                <div className="text-muted-foreground">
                  {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Immediately"}
                </div>
              </div>
              <div>
                <div className="font-medium">Ends</div>
                <div className="text-muted-foreground">
                  {formData.end_date ? new Date(formData.end_date).toLocaleDateString() : "No End Date"}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SelectorProps {
  type: "categories" | "products";
  items: { id: string; name: string; price?: number }[];
  selectedItems: string[];
  onSelectionChange: (selected: string[]) => void;
  isLoading?: boolean;
}

const MultiSelector = ({ type, items, selectedItems, onSelectionChange, isLoading = false }: SelectorProps) => {
  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(items.map(item => item.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              Select {type === "categories" ? "Categories" : "Products"}
            </CardTitle>
            <CardDescription>
              {selectedItems.length} of {items.length} selected
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
          {items.map((item) => (
            <motion.button
              key={`${item.id}-${gen_random_string()}`}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all hover:shadow-sm",
                selectedItems.includes(item.id)
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                  : "bg-background hover:bg-accent/50 border-border"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.price && (
                    <div className="text-xs text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  selectedItems.includes(item.id)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30"
                )}>
                  {selectedItems.includes(item.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        {items.length === 0 && (
          <div className="text-center py-6">
            <Package className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No {type} available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const generateDiscountCode = async () => {
  let code = "";
  try {
    const res = await http.post("/generate-discount/")
    const resp:ApiResp = res.data 
    if(!resp.error && resp.data){
      code = resp.data.code
    }
  } catch (error) {
    console.log(error)
  }
  return code
};

const AdminDiscountForm = () => {
  const {
    add_discount: can_add_discount,
    edit_discount: can_edit_discount,
  } = usePermissions([
    "add_discount",
    "edit_discount",
  ]);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<DiscountFormData>({
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    code: "",
    usage_limit: "",
    usage_per_customer: "1",
    min_purchase_amount: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Calculate form completion percentage
  const calculateCompletion = () => {
    const requiredFields = [
      formData.name,
      formData.code,
      formData.discount_type,
    ];
    const optionalFields = [
      formData.discount_value,
      formData.start_date,
      formData.end_date,
    ];
    
    const completedRequired = requiredFields.filter(f => f).length;
    const completedOptional = optionalFields.filter(f => f).length;
    
    return ((completedRequired / requiredFields.length) * 70) + 
           ((completedOptional / optionalFields.length) * 30);
  };

  // Load discount data in edit mode
  useEffect(() => {
    if (isEditMode) {
      if(!can_edit_discount){
        startTransition(()=>navigate("/unauthorized"));
        return;
      }
      loadDiscountData();
    } else {
      if(!can_add_discount){
        startTransition(()=>navigate("/unauthorized"));
        return;
      }
      (async()=>{
        const code = await generateDiscountCode();
        setFormData(prev => ({
          ...prev,
          code,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }));
      })()
    }
  }, [id, isEditMode]);

  const loadDiscountData = async () => {
    setIsLoading(true);
    try {
      const res = await http.get(`/get-discount/${id}/`);
      const resp: ApiResp = res.data;
      
      if (resp.error === false && resp.data) {
        const discountData: DiscountData = resp.data;
        const discount = discountData;
        
        setFormData({
          name: resp.data.name,
          description: resp.data.description || "",
          discount_type: resp.data.discount_type,
          discount_value: resp.data.discount_value,
          code: resp.data.code,
          usage_limit: resp.data.usage_limit?.toString() || "",
          usage_per_customer: resp.data.usage_per_customer?.toString() || "1",
          min_purchase_amount: "",
          start_date: resp.data.start_date || "",
          end_date: resp.data.end_date || "",
          is_active: resp.data.computed_status === "active",
        });
      } else {
        toast.error("Failed to load discount data");
      }
    } catch (error) {
      console.error("Error loading discount data:", error);
      toast.error("Failed to load discount data");
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (field: keyof DiscountFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = async () => {
    const code = await generateDiscountCode();
    setFormData(prev => ({
      ...prev,
      code,
    }));
    toast.info("Discount Code Generated");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formData.code);
    toast.info("Discount code copied to clipboard");
  };

  const handleSubmit = async () => {
    // Validation
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Discount name is required");
    if (!formData.code.trim()) errors.push("Discount code is required");
    if (formData.discount_type !== "free_shipping" && !formData.discount_value.trim()) {
      errors.push("Discount value is required");
    }
    if (formData.discount_type === "percentage" && parseFloat(formData.discount_value) > 100) {
      errors.push("Percentage discount cannot exceed 100%");
    }

    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    setIsSubmitting(true);

    try {
      const discountData: any = {
        name: formData.name,
        description: formData.description,
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === "free_shipping" ? "0" : formData.discount_value,
        usage_limit: formData.usage_limit || 0,
        usage_per_customer: formData.usage_per_customer || 1,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active ? 1 : 0,
      };

      // Add ID for edit mode
      if (isEditMode) {
        discountData.id = id;
      }

      const endpoint = isEditMode ? "/update-discount/" : "/save-discount/";
      const res = await http.post(endpoint, discountData);
      const resp: ApiResp = res.data;
      
      if (resp.error === false) {
        toast.success(`${formData.name} has been ${isEditMode ? 'updated' : 'created'} successfully.`);
        navigate("/admin/discounts");
      } else {
        toast.error(resp.data || `Failed to ${isEditMode ? 'update' : 'create'} discount`);
      }
    } catch (error) {
      console.error("Error submitting discount:", error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} discount`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionPercentage = calculateCompletion();

  if (isLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading discount data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/discounts")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl mb-1">
              {isEditMode ? `Edit Discount: ${formData.name}` : "Create New Discount"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Update discount details and settings" : "Create promotions and discount codes"}
            </p>
          </div>
        </div>
        
        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditMode ? "Update Discount" : "Create Discount"}
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      <Card className="bg-gradient-to-r from-background to-primary/5 border-primary/10">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Discount Setup Progress
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}% Complete
              </div>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>Basic Info</div>
              <div className="text-center">Discount Rules</div>
              <div className="text-right">Targeting</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Set up the basic details for your discount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Discount Name *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Name your discount for easy identification</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Summer Sale, Black Friday, Welcome Discount"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="flex items-center gap-2">
                    Discount Code *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unique code customers will enter at checkout</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="e.g., SUMMER20"
                      className="h-11 font-mono uppercase"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateCode}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this discount for internal reference..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Type & Value */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Discount Details
              </CardTitle>
              <CardDescription>
                Configure the type and value of your discount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label className="mb-4 block">Discount Type *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {discountTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.discount_type === type.id;
                    
                    return (
                      <motion.button
                        key={`${type.id}-${gen_random_string()}`}
                        type="button"
                        onClick={() => handleInputChange('discount_type', type.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          "hover:shadow-sm hover:scale-[1.02]",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            isSelected ? "bg-primary/20" : "bg-muted"
                          )}>
                            <Icon className={cn(
                              "h-5 w-5",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <Badge className={type.color}>{type.name.split(' ')[0]}</Badge>
                        </div>
                        <h4 className="font-medium mb-1">{type.name}</h4>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {formData.discount_type !== "free_shipping" && (
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value *
                    {formData.discount_type === "percentage" && (
                      <span className="ml-2 text-xs text-muted-foreground">(0-100%)</span>
                    )}
                  </Label>
                  <div className="relative">
                    {formData.discount_type === "percentage" ? (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => handleInputChange('discount_value', e.target.value)}
                      placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 25"}
                      min="0"
                      max={formData.discount_type === "percentage" ? "100" : undefined}
                      step={formData.discount_type === "percentage" ? "0.1" : "0.01"}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discount Rules */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Discount Rules & Limits
              </CardTitle>
              <CardDescription>
                Set conditions and limitations for your discount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">
                    Total Usage Limit
                    <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => handleInputChange('usage_limit', e.target.value)}
                    placeholder="e.g., 1000 (0 for unlimited)"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usagePerCustomer">
                    Usage Per Customer
                    <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="usagePerCustomer"
                    type="number"
                    value={formData.usage_per_customer}
                    onChange={(e) => handleInputChange('usage_per_customer', e.target.value)}
                    placeholder="e.g., 1 (0 for unlimited)"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPurchaseAmount">
                  Minimum Purchase Amount
                  <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="minPurchaseAmount"
                    type="number"
                    value={formData.min_purchase_amount}
                    onChange={(e) => handleInputChange('min_purchase_amount', e.target.value)}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.01"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
              <CardDescription>
                Set the validity period for your discount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Start Date
                    <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    End Date
                    <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Active Status</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.is_active ? "Discount is currently active" : "Discount is currently inactive"}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <DiscountPreview formData={formData} />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount Type:</span>
                <Badge variant="outline">
                  {discountTypes.find(t => t.id === formData.discount_type)?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Code Length:</span>
                <span className="font-medium">{formData.code.length} characters</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Validity:</span>
                <span className="font-medium">
                  {formData.start_date && formData.end_date ? "Limited" : "Unlimited"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => {
                  if (window.confirm('Are you sure you want to discard changes?')) {
                    navigate("/admin/discounts");
                  }
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Discard Changes
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleGenerateCode}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Code
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => handleInputChange('is_active', !formData.is_active)}
              >
                {formData.is_active ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Deactivate Discount
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Activate Discount
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Use clear, memorable codes (e.g., SUMMER20, WELCOME10)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Set reasonable usage limits to prevent abuse</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Test discounts before making them public</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Schedule discounts to align with promotions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-background border-t py-4">
        <div className="container flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isEditMode ? "Update this discount" : "Create a new discount"}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/discounts")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[140px] gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Update Discount" : "Create Discount"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDiscountForm;