import { useState, useEffect, useRef, startTransition } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  Camera,
  Trash2,
  Edit2,
  Eye,
  ChevronDown,
  Plus,
  Package,
  Tag,
  DollarSign,
  FileText,
  Loader2,
  AlertTriangle,
  ShoppingCart,
  Package2,
  Scale,
  Maximize2,
  Info,
  ChevronLeft,
  Sparkles,
  Trophy,
  CheckCircle,
  X,
  GripVertical,
  Ruler,
  Palette,
  Scissors,
  Hash,
  Minus,
  Scan,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BarcodeScanner from "@/components/BarcodeScanner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { resolveSrc, gen_random_string, format_currency } from "@/lib/functions";
import usePermissions from "@/hooks/usePermissions";

interface CategoryFromAPI {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  status: "active" | "inactive";
  product_count: number;
  sub_categories?: SubCategoryFromAPI[];
}

interface SubCategoryFromAPI {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  status: "active" | "inactive";
}

interface ProductImage {
  id: number;
  image: string;
  sort_order: number;
  isRemoved?: boolean;
}

interface ProductFeature {
  id?: number;
  feature: string;
  sort_order: number;
  isRemoved?: boolean;
}

interface VariantOption {
  id?: number;
  value: string;
  sort_order: number;
  price_modifier?: string;
  isRemoved?: boolean;
}

interface ProductVariant {
  id?: number;
  type: string;
  options: VariantOption[];
  isRemoved?: boolean;
}

interface ProductFormData {
  id?: number;
  name: string;
  description: string;
  category_id: number | null;
  category_name?: string;
  sub_category_id: number | null;
  sub_category?: {
    id: number;
    name: string;
    slug: string;
    status: string;
  };
  price: string;
  originalPrice: string;
  sku: string;
  weight: string;
  item_height: string;
  item_width: string;
  item_depth: string;
  status: "active" | "inactive";
  inStock: boolean;
  stockQuantity: string;
  lowStockAlert: string;
  manage_stock?: boolean;
  isBestSeller: boolean;
  isNew: boolean;
}

const formSteps = [
  { id: "basic", label: "Basic Info", icon: Package },
  { id: "variants", label: "Variants", icon: Palette },
  { id: "features", label: "Features", icon: CheckCircle },
  { id: "images", label: "Images", icon: Camera },
  { id: "inventory", label: "Inventory", icon: ShoppingCart },
  { id: "shipping", label: "Shipping", icon: Package2 },
];

interface CategorySelectProps {
  value: number | null;
  subCategoryValue: number | null;
  onChange: (categoryId: number | null, subCategoryId: number | null) => void;
  categories: CategoryFromAPI[];
}

const CategorySelect = ({ value, subCategoryValue, onChange, categories }: CategorySelectProps) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  
  const selectedCategory = categories.find(cat => cat.id === value);
  const subCategories = selectedCategory?.sub_categories?.filter(sub => sub.status === "active") || [];
  
  const getSelectedCategoryName = () => {
    if (value === null) return "Select a category";
    return selectedCategory?.name || "Select a category";
  };

  const getSelectedSubCategoryName = () => {
    if (subCategoryValue === null) return "Select a subcategory (optional)";
    const selectedSub = subCategories.find(sub => sub.id === subCategoryValue);
    return selectedSub?.name || "Select a subcategory (optional)";
  };

  return (
    <div className="space-y-4">
      {/* Main Category Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Category *
        </Label>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between border-input hover:bg-accent/50"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <span className={value ? "" : "text-muted-foreground"}>
              {getSelectedCategoryName()}
            </span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
          
          {isCategoryOpen && (
            <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95">
              <div className="p-2 max-h-60 overflow-y-auto">
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Categories
                  </div>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <button
                        key={`${category.id}-${gen_random_string()}`}
                        type="button"
                        onClick={() => {
                          onChange(category.id, null);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                          {category.sub_categories && category.sub_categories.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {category.sub_categories.length} sub
                            </Badge>
                          )}
                        </div>
                        {value === category.id && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
                      No categories found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub Category Selector - Only shown if selected category has subcategories */}
      {selectedCategory && subCategories.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary/70" />
            Sub Category
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between border-input hover:bg-accent/50"
              onClick={() => setIsSubCategoryOpen(!isSubCategoryOpen)}
            >
              <span className={subCategoryValue ? "" : "text-muted-foreground"}>
                {getSelectedSubCategoryName()}
              </span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            
            {isSubCategoryOpen && (
              <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95">
                <div className="p-2 max-h-60 overflow-y-auto">
                  <div className="mb-2">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Subcategories for {selectedCategory.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(selectedCategory.id, null);
                        setIsSubCategoryOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-between transition-colors"
                    >
                      <span className="text-muted-foreground">None (Main Category)</span>
                      {subCategoryValue === null && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                    <div className="my-1 border-t" />
                    {subCategories.map((sub) => (
                      <button
                        key={`${sub.id}-${gen_random_string()}`}
                        type="button"
                        onClick={() => {
                          onChange(selectedCategory.id, sub.id);
                          setIsSubCategoryOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center justify-between transition-colors"
                      >
                        <span>{sub.name}</span>
                        {subCategoryValue === sub.id && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {subCategoryValue && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="bg-primary/5 border-primary/20">
                {selectedCategory.name} → {subCategories.find(s => s.id === subCategoryValue)?.name}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Quick stats */}
      {selectedCategory && (
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center justify-between">
            <span>Products in category:</span>
            <span className="font-medium">{selectedCategory.product_count || 0}</span>
          </div>
          {selectedCategory.sub_categories && (
            <div className="flex items-center justify-between mt-1">
              <span>Available subcategories:</span>
              <span className="font-medium">{selectedCategory.sub_categories.length}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ImageUploadGalleryProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
  isEditMode?: boolean;
  onImageDelete?: (imageId: number) => Promise<void>;
}

const ImageUploadGallery = ({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  isEditMode = false,
  onImageDelete
}: ImageUploadGalleryProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.filter(img => !img.isRemoved).length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - Not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} - Exceeds 5MB limit`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: ProductImage = {
          id: -Date.now(),
          image: reader.result as string,
          sort_order: images.filter(img => !img.isRemoved).length
        };
        onImagesChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    
    if (isEditMode && image.id > 0 && !image.isRemoved) {
      setDeletingImageId(image.id);
      try {
        if (onImageDelete) {
          await onImageDelete(image.id);
        }
        
        const newImages = [...images];
        newImages[index] = { ...image, isRemoved: true };
        onImagesChange(newImages);
        
        toast.success("Image deleted successfully");
      } catch (error) {
        toast.error("Failed to delete image");
      } finally {
        setDeletingImageId(null);
      }
    } else {
      const newImages = [...images];
      newImages.splice(index, 1);
      onImagesChange(newImages);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (images.filter(img => !img.isRemoved).length >= maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }

      if (images.filter(img => !img.isRemoved).length + validFiles.length < maxImages) {
        validFiles.push(file);
      }
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: ProductImage = {
          id: -Date.now(),
          image: reader.result as string,
          sort_order: images.filter(img => !img.isRemoved).length
        };
        onImagesChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const activeImages = images.filter(img => !img.isRemoved);
    const [movedImage] = activeImages.splice(fromIndex, 1);
    activeImages.splice(toIndex, 0, movedImage);
    
    const updatedImages = activeImages.map((img, idx) => ({
      ...img,
      sort_order: idx
    }));
    
    const removedImages = images.filter(img => img.isRemoved);
    onImagesChange([...updatedImages, ...removedImages]);
  };

  const getImageUrl = (image: ProductImage) => {
    if (image.image.startsWith('data:')) {
      return image.image;
    }
    return resolveSrc(image.image);
  };

  const activeImages = images.filter(img => !img.isRemoved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Product Images</Label>
          <p className="text-sm text-muted-foreground">
            Upload up to {maxImages} images for your product
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={activeImages.length >= maxImages}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "aspect-square rounded-lg border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/0 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary hover:bg-primary/10 group",
            activeImages.length >= maxImages && "opacity-50 cursor-not-allowed"
          )}
        >
          <Camera className="h-10 w-10 text-primary/60 group-hover:text-primary mb-3 transition-colors" />
          <p className="text-sm font-medium text-foreground">Drop images here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
          <p className="text-xs text-primary font-medium mt-2">
            {maxImages - activeImages.length} slots remaining
          </p>
        </div>

        {activeImages.map((image, index) => (
          <motion.div 
            key={`${image.id}-${gen_random_string()}`}
            className="relative aspect-square group"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', index.toString());
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('ring-2', 'ring-primary');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
              reorderImages(fromIndex, index);
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <img
              src={getImageUrl(image)}
              alt={`Product image ${index + 1}`}
              className="w-full h-full rounded-lg object-cover border shadow-sm cursor-move"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center p-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(images.indexOf(image));
                }}
                disabled={deletingImageId === image.id}
                className="bg-red-600 hover:bg-red-700 shadow-lg"
              >
                {deletingImageId === image.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            {index === 0 && (
              <Badge className="absolute top-2 left-2 text-xs bg-primary shadow-md">
                <div className="h-2 w-2 rounded-full bg-white mr-1" />
                Main
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className="absolute top-2 right-2 text-xs bg-background/90 backdrop-blur-sm"
            >
              {index + 1}
            </Badge>
          </motion.div>
        ))}

        {Array.from({ length: Math.max(0, maxImages - activeImages.length - 1) }).map((_, index) => (
          <div
            key={`${index}-${gen_random_string()}`}
            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/10 bg-gradient-to-br from-muted/5 to-transparent flex items-center justify-center"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/50">Available Slot</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">
              {activeImages.length} image{activeImages.length !== 1 ? 's' : ''} uploaded
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/30" />
            <span className="text-muted-foreground">
              {maxImages - activeImages.length} slot{maxImages - activeImages.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductFeaturesManagerProps {
  features: ProductFeature[];
  onFeaturesChange: (features: ProductFeature[]) => void;
  isReadOnly?: boolean;
}

const ProductFeaturesManager = ({ 
  features, 
  onFeaturesChange, 
  isReadOnly = false 
}: ProductFeaturesManagerProps) => {
  const [newFeatureText, setNewFeatureText] = useState("");

  const addFeature = () => {
    if (!newFeatureText.trim()) {
      toast.error("Please enter a feature");
      return;
    }

    const feature: ProductFeature = {
      feature: newFeatureText.trim(),
      sort_order: features.filter(f => !f.isRemoved).length,
    };

    onFeaturesChange([...features, feature]);
    setNewFeatureText("");
    toast.success("Feature added successfully");
  };

  const removeFeature = (index: number) => {
    const feature = features[index];
    if (feature.id && feature.id > 0) {
      const newFeatures = [...features];
      newFeatures[index] = { ...feature, isRemoved: true };
      onFeaturesChange(newFeatures);
    } else {
      const newFeatures = [...features];
      newFeatures.splice(index, 1);
      onFeaturesChange(newFeatures);
    }
    toast.success("Feature removed");
  };

  const updateFeature = (index: number, value: string) => {
    if (isReadOnly) return;
    
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], feature: value };
    onFeaturesChange(newFeatures);
  };

  const reorderFeatures = (fromIndex: number, toIndex: number) => {
    const activeFeatures = features.filter(f => !f.isRemoved);
    const [movedFeature] = activeFeatures.splice(fromIndex, 1);
    activeFeatures.splice(toIndex, 0, movedFeature);
    
    const updatedFeatures = activeFeatures.map((feature, idx) => ({
      ...feature,
      sort_order: idx
    }));
    
    const removedFeatures = features.filter(f => f.isRemoved);
    onFeaturesChange([...updatedFeatures, ...removedFeatures]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addFeature();
    }
  };

  const activeFeatures = features.filter(f => !f.isRemoved);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base">Product Features</Label>
          <p className="text-sm text-muted-foreground">
            Add key features of your product (e.g., "100% Virgin Hair", "24 Inches Length")
          </p>
        </div>

        {!isReadOnly && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/0 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-feature">Add New Feature *</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-feature"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., 100% Virgin Brazilian Hair"
                    disabled={isReadOnly}
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    disabled={!newFeatureText.trim()}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to add, or click the Add button
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Features ({activeFeatures.length})
            </Label>
            {activeFeatures.length > 0 && (
              <Badge variant="outline">
                Drag to reorder
              </Badge>
            )}
          </div>

          {activeFeatures.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center">
                  No features added yet. Add your first feature above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeFeatures.map((feature, index) => (
                <motion.div
                  key={`${feature.id}-${gen_random_string()}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={cn(
                      "group relative transition-all hover:shadow-md",
                      !isReadOnly && "cursor-move"
                    )}
                    draggable={!isReadOnly}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('ring-2', 'ring-primary');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('ring-2', 'ring-primary');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ring-2', 'ring-primary');
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      reorderFeatures(fromIndex, index);
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {!isReadOnly && (
                          <div className="cursor-move text-muted-foreground hover:text-foreground transition-colors">
                            <GripVertical className="h-5 w-5" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          {isReadOnly ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-foreground">{feature.feature}</span>
                            </div>
                          ) : (
                            <Input
                              value={feature.feature}
                              onChange={(e) => updateFeature(features.indexOf(feature), e.target.value)}
                              className="border-transparent hover:border-input focus:border-input"
                              placeholder="Enter feature"
                            />
                          )}
                        </div>
                        
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(features.indexOf(feature))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      {!isReadOnly && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <Badge variant="outline" className="text-xs">
                            Position #{index + 1}
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <GripVertical className="h-3 w-3" />
                            Drag handle to reorder
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProductVariantsManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice?: string;
  isReadOnly?: boolean;
}

const ProductVariantsManager = ({ 
  variants, 
  onVariantsChange, 
  basePrice = "",
  isReadOnly = false 
}: ProductVariantsManagerProps) => {
  const [variantType, setVariantType] = useState("");
  const [variantValue, setVariantValue] = useState("");
  const [priceModifier, setPriceModifier] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [editingOption, setEditingOption] = useState<{variantIndex: number, optionIndex: number} | null>(null);
  
  const commonTypes = ["Length", "Color", "Size", "Texture", "Density", "Style"];
  const commonValues: Record<string, string[]> = {
    "Length": ["10\"", "12\"", "14\"", "16\"", "18\"", "20\"", "22\"", "24\"", "26\"", "28\"", "30\""],
    "Color": ["Natural Black", "Jet Black", "Off Black", "Dark Brown", "Medium Brown", "Light Brown", "Burgundy", "Blonde", "Highlighted"],
    "Size": ["Small", "Medium", "Large", "XL", "XXL", "One Size"],
    "Texture": ["Straight", "Body Wave", "Deep Wave", "Loose Wave", "Curly", "Kinky"],
    "Density": ["130%", "150%", "180%", "200%", "250%"],
    "Style": ["Lace Front", "Full Lace", "360 Lace", "Closure", "Frontal"]
  };

  const addVariant = () => {
    let finalValue = variantValue;
    
    if (showCustomInput && customValue.trim()) {
      finalValue = customValue.trim();
    }
    
    if (!variantType.trim() || !finalValue.trim()) {
      toast.error("Please select both type and value");
      return;
    }

    const priceModifierValue = priceModifier.trim() || "0";
    if (priceModifier && isNaN(parseFloat(priceModifierValue))) {
      toast.error("Price modifier must be a valid number");
      return;
    }

    const existingVariantIndex = variants.findIndex(v => v.type === variantType && !v.isRemoved);
    
    if (existingVariantIndex >= 0) {
      const updatedVariants = [...variants];
      const newOption: VariantOption = {
        id: -Date.now(),
        value: finalValue,
        sort_order: updatedVariants[existingVariantIndex].options.filter(opt => !opt.isRemoved).length,
        price_modifier: priceModifierValue
      };
      updatedVariants[existingVariantIndex].options.push(newOption);
      onVariantsChange(updatedVariants);
    } else {
      const newVariant: ProductVariant = {
        id: -Date.now(),
        type: variantType.trim(),
        options: [{
          id: -Date.now(),
          value: finalValue,
          sort_order: 0,
          price_modifier: priceModifierValue
        }]
      };
      onVariantsChange([...variants, newVariant]);
    }
    
    setVariantValue("");
    setCustomValue("");
    setPriceModifier("");
    setShowCustomInput(false);
    toast.success("Variant added successfully");
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const variant = variants[variantIndex];
    const option = variant.options[optionIndex];
    
    if (option.id && option.id > 0) {
      const newVariants = [...variants];
      newVariants[variantIndex].options[optionIndex] = { 
        ...option, 
        isRemoved: true 
      };
      onVariantsChange(newVariants);
    } else {
      const newVariants = [...variants];
      newVariants[variantIndex].options.splice(optionIndex, 1);
      
      if (newVariants[variantIndex].options.filter(opt => !opt.isRemoved).length === 0) {
        newVariants[variantIndex] = { ...variant, isRemoved: true };
      }
      
      onVariantsChange(newVariants);
    }
    toast.success("Variant option removed");
  };

  const removeVariantType = (variantIndex: number) => {
    const variant = variants[variantIndex];
    
    if (variant.id && variant.id > 0) {
      const newVariants = [...variants];
      newVariants[variantIndex] = {
        ...variant,
        isRemoved: true
      };
      onVariantsChange(newVariants);
    } else {
      const newVariants = [...variants];
      newVariants.splice(variantIndex, 1);
      onVariantsChange(newVariants);
    }
    toast.success("Variant type removed");
  };

  const handleVariantValueChange = (value: string) => {
    setVariantValue(value);
    if (value === "custom") {
      setShowCustomInput(true);
      setCustomValue("");
    } else {
      setShowCustomInput(false);
    }
  };

  const startEditOption = (variantIndex: number, optionIndex: number) => {
    if (isReadOnly) return;
    
    const option = variants[variantIndex].options[optionIndex];
    setEditingOption({ variantIndex, optionIndex });
    setVariantValue(option.value);
    setPriceModifier(option.price_modifier || "");
  };

  const saveEditOption = () => {
    if (!editingOption) return;
    
    const { variantIndex, optionIndex } = editingOption;
    if (!variantValue.trim()) {
      toast.error("Option value cannot be empty");
      return;
    }

    const priceModifierValue = priceModifier.trim() || "0";
    if (priceModifier && isNaN(parseFloat(priceModifierValue))) {
      toast.error("Price modifier must be a valid number");
      return;
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIndex].options[optionIndex] = {
      ...updatedVariants[variantIndex].options[optionIndex],
      value: variantValue,
      price_modifier: priceModifierValue
    };
    
    onVariantsChange(updatedVariants);
    setEditingOption(null);
    setVariantValue("");
    setPriceModifier("");
    toast.success("Option updated successfully");
  };

  const cancelEdit = () => {
    setEditingOption(null);
    setVariantValue("");
    setPriceModifier("");
  };

  const updateOptionPriceModifier = (variantIndex: number, optionIndex: number, value: string) => {
    if (isReadOnly) return;
    
    const priceModifierValue = value.trim() || "0";
    if (value && isNaN(parseFloat(priceModifierValue))) {
      toast.error("Price modifier must be a valid number");
      return;
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIndex].options[optionIndex] = {
      ...updatedVariants[variantIndex].options[optionIndex],
      price_modifier: priceModifierValue
    };
    
    onVariantsChange(updatedVariants);
  };

  const activeVariants = variants.filter(v => !v.isRemoved);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Product Variants
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add variants like Length, Color, Size, etc. with optional price adjustments
              </p>
            </div>
          </div>
          
          {activeVariants.length > 0 && (
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/15 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-foreground">
                  {activeVariants.length} variant{activeVariants.length !== 1 ? 's' : ''} added
                </span>
              </div>
              <div className="h-4 w-px bg-primary/20" />
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-xs">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Price modifiers active
              </Badge>
            </div>
          )}
        </div>

        {/* Add Variant Form Section - Only show when not read-only */}
        {!isReadOnly && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/[0.02] shadow-soft">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01] pointer-events-none" />
              <CardHeader className="relative pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-primary" />
                  Add New Variant
                </CardTitle>
                <CardDescription>
                  Select a variant type and add options with optional price adjustments
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative space-y-6">
                {/* Variant Type Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-4 w-4 text-primary" />
                      Variant Type *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select a variant type from common options or use a custom type
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                      {commonTypes.map((type, index) => (
                        <motion.button
                          key={`${index}-${gen_random_string()}`}
                          type="button"
                          onClick={() => setVariantType(type)}
                          className={cn(
                            "px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200",
                            variantType === type
                              ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-sm"
                              : "border-input/50 bg-gradient-to-b from-background to-primary/[0.02] text-foreground hover:border-primary/30 hover:bg-primary/5"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {type}
                        </motion.button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Or enter custom type</Label>
                      <Input
                        value={variantType}
                        onChange={(e) => setVariantType(e.target.value)}
                        placeholder="e.g., Material, Finish, Pattern"
                        className="h-11 border-input/50 bg-gradient-to-b from-background to-primary/[0.02] focus:border-primary/50"
                      />
                    </div>
                  </div>

                  {/* Variant Value Section */}
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Scissors className="h-4 w-4 text-primary" />
                        Variant Options *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Add one or more options for this variant type
                      </p>
                    </div>

                    {/* Option Value Input */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Option Value *</Label>
                          <div className="space-y-2">
                            {variantType && commonValues[variantType] ? (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Select from common {variantType.toLowerCase()} options:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {commonValues[variantType].map((value, index) => (
                                    <motion.button
                                      key={`${index}-${gen_random_string()}`}
                                      type="button"
                                      onClick={() => {
                                        setVariantValue(value);
                                        setShowCustomInput(false);
                                      }}
                                      className={cn(
                                        "px-3 py-1.5 rounded-lg border text-sm transition-all",
                                        variantValue === value
                                          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                                          : "border-input/30 bg-gradient-to-b from-background to-primary/[0.01] hover:border-primary/30 hover:bg-primary/5"
                                      )}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {value}
                                    </motion.button>
                                  ))}
                                </div>
                                <div className="pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowCustomInput(true);
                                      setVariantValue("");
                                    }}
                                    className="h-9 gap-1.5 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Custom Value
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  Enter custom option values for {variantType || "this variant"}
                                </p>
                                <Input
                                  value={variantValue}
                                  onChange={(e) => setVariantValue(e.target.value)}
                                  placeholder={`e.g., Enter ${variantType ? `${variantType.toLowerCase()} value` : 'option value'}`}
                                  className="h-11 border-input/50 bg-gradient-to-b from-background to-primary/[0.02] focus:border-primary/50"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price Modifier Input */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Price Modifier
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent className="border-primary/10 bg-background shadow-elevated max-w-xs p-4">
                                  <div className="space-y-2">
                                    <p className="font-medium text-sm">Price Adjustment Guide</p>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex items-center gap-2 p-2 rounded bg-primary/5">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span>+10 = Adds $10 to base price</span>
                                      </div>
                                      <div className="flex items-center gap-2 p-2 rounded bg-green-500/5">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span>-5 = $5 discount from base price</span>
                                      </div>
                                      <div className="flex items-center gap-2 p-2 rounded bg-muted-foreground/5">
                                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                                        <span>Empty = No price change</span>
                                      </div>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <div className="space-y-2">
                            <Input
                              value={priceModifier}
                              onChange={(e) => setPriceModifier(e.target.value)}
                              placeholder="+10 or -5"
                              className="h-11 border-input/50 bg-gradient-to-b from-background to-primary/[0.02] focus:border-primary/50"
                            />
                            {basePrice && priceModifier && !isNaN(parseFloat(priceModifier)) && (
                              <div className="text-xs text-muted-foreground">
                                <span>Total: </span>
                                <span className="font-medium text-primary">
                                  {format_currency(parseFloat(basePrice) + parseFloat(priceModifier))}
                                </span>
                                <span className="text-muted-foreground"> (Base: {format_currency(parseFloat(basePrice))})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Custom Value Input (if needed) */}
                      {showCustomInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2"
                        >
                          <Label className="text-sm font-medium">Custom Value</Label>
                          <div className="flex gap-2">
                            <Input
                              value={customValue}
                              onChange={(e) => setCustomValue(e.target.value)}
                              placeholder={`Enter custom ${variantType} value`}
                              className="h-11 flex-1 border-input/50 focus:border-primary/50"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addVariant();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCustomInput(false);
                                setVariantValue("");
                                setCustomValue("");
                              }}
                              className="h-11 px-3 border-input/50 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Add Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={editingOption ? saveEditOption : addVariant}
                      disabled={!variantType.trim() || (!variantValue.trim() && !customValue.trim())}
                      className={cn(
                        "h-11 gap-2 px-6 rounded-lg transition-all duration-300",
                        editingOption 
                          ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary shadow-lg shadow-primary/25" 
                          : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                      )}
                    >
                      {editingOption ? (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Update Option</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Add Variant Option</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Existing Variants Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                Existing Variants
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage your product variants and their price adjustments
              </p>
            </div>
            {activeVariants.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/20 bg-primary/5">
                  Total Options: {activeVariants.reduce((sum, v) => sum + v.options.filter(o => !o.isRemoved).length, 0)}
                </Badge>
              </div>
            )}
          </div>

          {activeVariants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent overflow-hidden group hover:border-primary/30 transition-colors">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="relative mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <Palette className="h-12 w-12 text-primary/30 group-hover:text-primary/40 transition-colors" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                  </div>
                  <h4 className="font-display text-lg font-medium mb-2 text-foreground">
                    No variants added yet
                  </h4>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    Start by adding variants like different lengths, colors, or sizes for your product.
                    Each variant can have multiple options with individual price adjustments.
                  </p>
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Variant
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {activeVariants.map((variant, variantIndex) => {
                const activeOptions = variant.options.filter(opt => !opt.isRemoved);
                
                return (
                  <motion.div
                    key={`${variant.id}-${gen_random_string()}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: variantIndex * 0.1 }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/[0.02] shadow-soft hover:shadow-card-hover transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                              <Hash className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-semibold">{variant.type}</CardTitle>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                  <span>{activeOptions.length} option{activeOptions.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                <div className="flex items-center gap-1.5">
                                  <DollarSign className="h-3.5 w-3.5 text-primary/70" />
                                  <span>
                                    {activeOptions.filter(o => o.price_modifier && o.price_modifier !== "0").length} with price adjustments
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {!isReadOnly && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariantType(variantIndex)}
                              className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {activeOptions.map((option, optionIndex) => {
                            const isEditing = editingOption?.variantIndex === variantIndex && 
                                            editingOption?.optionIndex === optionIndex;
                            const modifier = parseFloat(option.price_modifier || "0");
                            const hasModifier = modifier !== 0;
                            
                            return (
                              <motion.div
                                key={`${option.id}-${gen_random_string()}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: optionIndex * 0.05 }}
                                className="group/option"
                              >
                                <div className={cn(
                                  "relative p-4 rounded-xl border transition-all duration-300 h-full",
                                  isEditing 
                                    ? "border-primary/40 bg-gradient-to-br from-primary/5 via-primary/5 to-primary/[0.02] ring-2 ring-primary/20" 
                                    : "border-primary/10 bg-gradient-to-br from-background to-primary/[0.02] hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:via-primary/2 hover:to-primary/[0.01]"
                                )}>
                                  
                                  {isEditing ? (
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Option Value</Label>
                                        <Input
                                          value={variantValue}
                                          onChange={(e) => setVariantValue(e.target.value)}
                                          className="h-10 border-primary/20 focus:border-primary/40"
                                          placeholder="Option value"
                                          autoFocus
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Price Modifier</Label>
                                        <div className="flex gap-2">
                                          <Input
                                            value={priceModifier}
                                            onChange={(e) => setPriceModifier(e.target.value)}
                                            placeholder="+10 or -5"
                                            className="h-10 border-primary/20 focus:border-primary/40"
                                          />
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={saveEditOption}
                                            className="h-10 px-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary"
                                          >
                                            <Save className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        {basePrice && priceModifier && !isNaN(parseFloat(priceModifier)) && (
                                          <p className="text-xs text-muted-foreground">
                                            Total: {format_currency(parseFloat(basePrice) + parseFloat(priceModifier))}
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={cancelEdit}
                                          className="flex-1 h-9 border-input/50 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary/60" />
                                            <span className="font-medium text-foreground">{option.value}</span>
                                          </div>
                                          
                                          {hasModifier && (
                                            <div className={cn(
                                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                              modifier > 0 
                                                ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary" 
                                                : "bg-gradient-to-r from-green-500/10 to-green-400/5 text-green-600"
                                            )}>
                                              <DollarSign className={cn(
                                                "h-3 w-3",
                                                modifier > 0 ? "text-primary" : "text-green-600"
                                              )} />
                                              <span>
                                                {modifier > 0 ? '+' : ''}
                                                {modifier.toFixed(2)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {!isReadOnly && (
                                          <div className="flex items-center gap-1 opacity-0 group-hover/option:opacity-100 transition-all">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => startEditOption(variantIndex, optionIndex)}
                                              className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                                            >
                                              <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => removeVariantOption(variantIndex, optionIndex)}
                                              className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {hasModifier && basePrice && (
                                        <div className="text-xs text-muted-foreground pt-2 border-t border-primary/10">
                                          <span>Final price: </span>
                                          <span className="font-medium text-foreground">
                                            {format_currency(parseFloat(basePrice) + modifier)}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {!isReadOnly && (
                                        <div className="pt-3 border-t border-primary/10">
                                          <Label className="text-xs text-muted-foreground mb-1.5 block">
                                            Quick price adjustment
                                          </Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              value={option.price_modifier || ""}
                                              onChange={(e) => updateOptionPriceModifier(variantIndex, optionIndex, e.target.value)}
                                              placeholder="+10 or -5"
                                              className="h-8 text-xs flex-1 border-primary/20 focus:border-primary/40"
                                            />
                                            {basePrice && option.price_modifier && !isNaN(parseFloat(option.price_modifier)) && (
                                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                → {format_currency(parseFloat(basePrice) + parseFloat(option.price_modifier))}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {!isReadOnly && (
                          <div className="flex justify-end pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setVariantType(variant.type);
                                setVariantValue("");
                                setPriceModifier("");
                                window.scrollTo({ top: 200, behavior: 'smooth' });
                              }}
                              className="h-9 gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Another {variant.type} Option
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Section */}
        {activeVariants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <Scissors className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Variant Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          Total options and price adjustments
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Variant Types</span>
                        <span className="font-medium text-foreground">{activeVariants.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Options</span>
                        <span className="font-medium text-foreground">
                          {activeVariants.reduce((sum, v) => sum + v.options.filter(o => !o.isRemoved).length, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Options with Price Adjustments</span>
                        <span className="font-medium text-primary">
                          {activeVariants.reduce((sum, v) => sum + v.options.filter(o => o.price_modifier && o.price_modifier !== "0").length, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Price Adjustment Guide</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="text-foreground">Positive (+)</span>
                        <span className="text-muted-foreground">Adds to base price</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="text-foreground">Negative (-)</span>
                        <span className="text-muted-foreground">Discount from base price</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                        <span className="text-foreground">Empty or 0</span>
                        <span className="text-muted-foreground">No price change</span>
                      </div>
                    </div>
                  </div>
                  
                  {basePrice && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Price Preview</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Base Price</span>
                          <span className="font-medium">{format_currency(parseFloat(basePrice))}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">With Selected Modifiers</span>
                          <span className="text-lg font-semibold text-primary">
                            {format_currency(parseFloat(basePrice) + activeVariants
                              .filter(v => !v.isRemoved)
                              .flatMap(v => v.options.filter(o => !o.isRemoved))
                              .reduce((sum, option) => {
                                const modifier = parseFloat(option.price_modifier || "0") || 0;
                                return sum + modifier;
                              }, 0))}
                          </span>
                        </div>
                        <div className="pt-2">
                          <div className="text-xs text-muted-foreground">
                            Prices update based on selected variant options
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AdminProductForm = () => {
  const {
    edit_product:can_edit_product,
    add_product: can_add_product
  } = usePermissions([
    "edit_product",
    "add_product",
  ])
  const { id, name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const isViewMode = searchParams.get('view') === 'true';
  const isReadOnly = isViewMode;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category_id: null,
    sub_category_id: null,
    price: "",
    originalPrice: "",
    sku: "",
    weight: "",
    item_height: "",
    item_width: "",
    item_depth: "",
    status: "active",
    inStock: true,
    stockQuantity: "0",
    lowStockAlert: "10",
    manage_stock: true,
    isBestSeller: false,
    isNew: false,
  });

  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [productFeatures, setProductFeatures] = useState<ProductFeature[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<CategoryFromAPI[]>([]);
  const [scanning, setScanning] = useState(false);

  const progress = ((currentStep + 1) / formSteps.length) * 100;

  useEffect(() => {
    fetchCategories();
    
    if (isEditMode) {
      if(!can_edit_product){
        startTransition(()=>navigate("/unauthorized"))
        return;
      }
      loadProductData();
    }else{
      if(!can_add_product){
        startTransition(()=>navigate("/unauthorized"))
        return;
      } 
    }
  }, [id, isEditMode]);

  const fetchCategories = async () => {
    try {
      const res = await http.get(`/get-categories/`);
      const resp: ApiResp = res.data;
      
      if (resp.error === false && resp.data && Array.isArray(resp.data)) {
        setAvailableCategories(resp.data);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadProductData = async () => {
    setIsLoading(true);
    try {
      const res = await http.get(`/get-product/${id}/`);
      const resp: ApiResp = res.data;      
      
      if (resp.error === false && resp.data) {
        const productData = resp.data;
        
        setFormData({
          id: productData.id,
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          category_name: productData.category_name,
          sub_category_id: productData.sub_category_id || null,
          sub_category: productData.sub_category,
          price: productData.price?.toString() || "",
          originalPrice: productData.original_price?.toString() || "",
          sku: productData.sku || "",
          weight: productData.weight?.toString() || "",
          item_height: productData.item_height?.toString() || "",
          item_width: productData.item_width?.toString() || "",
          item_depth: productData.item_depth?.toString() || "",
          status: productData.status as "active" | "inactive",
          inStock: Boolean(productData.in_stock),
          stockQuantity: productData.stock_quantity?.toString() || "0",
          lowStockAlert: productData.low_stock_alert?.toString() || "10",
          manage_stock: Boolean(productData.manage_stock),
          isBestSeller: Boolean(productData.is_best_seller == "1"),
          isNew: Boolean(productData.is_new == "1"),
        });

        const galleryImages: ProductImage[] = (productData.gallery || []).map((img: any) => ({
          id: img.id,
          image: img.image,
          sort_order: img.sort_order || 0
        }));
        setProductImages(galleryImages);

        const features: ProductFeature[] = (productData.features || []).map((feature: any) => ({
          id: feature.id,
          feature: feature.feature,
          sort_order: feature.sort_order || 0
        }));
        setProductFeatures(features);

        const variants: ProductVariant[] = (productData.variants || []).map((variantGroup: any) => ({
          id: variantGroup.id,
          type: variantGroup.type,
          options: (variantGroup.options || []).map((option: any) => ({
            id: option.id,
            value: option.value,
            sort_order: option.sort_order || 0,
            price_modifier: option.price_modifier || "0"
          }))
        }));
        setProductVariants(variants);
      } else {
        toast.error("Failed to load product data");
      }
    } catch (error) {
      console.error("Error loading product data:", error);
      toast.error("Failed to load product data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await http.post("/delete-product-image/", { id: imageId });
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (categoryId: number | null, subCategoryId: number | null) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      sub_category_id: subCategoryId
    }));
  };

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push("Product name is required");
    if (!formData.category_id) errors.push("Category is required");
    if (!formData.price) errors.push("Price is required");
    if (productImages.filter(img => !img.isRemoved).length === 0) errors.push("At least one product image is required");
    
    if (errors.length > 0) {
      toast.error(`Validation Error: ${errors.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.category_id!.toString());
      
      if (formData.sub_category_id) {
        formDataToSend.append("sub_category_id", formData.sub_category_id.toString());
      }
      
      formDataToSend.append("price", formData.price);
      formDataToSend.append("original_price", formData.originalPrice || "0");
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("weight", formData.weight);
      formDataToSend.append("item_height", formData.item_height);
      formDataToSend.append("item_width", formData.item_width);
      formDataToSend.append("item_depth", formData.item_depth);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("in_stock", formData.inStock ? "1" : "0");
      formDataToSend.append("stock_quantity", formData.stockQuantity || "0");
      formDataToSend.append("low_stock_alert", formData.lowStockAlert || "10");
      formDataToSend.append("manage_stock", "1");
      formDataToSend.append("is_best_seller", formData.isBestSeller ? "1" : "0");
      formDataToSend.append("is_new", formData.isNew ? "1" : "0");

      if (isEditMode && formData.id) {
        formDataToSend.append("id", formData.id.toString());
      }

      // Handle images
      const existingImages = productImages.filter(img => !img.isRemoved && img.id > 0);
      existingImages.forEach((img, index) => {
        formDataToSend.append(`existing_images[${index}][id]`, img.id.toString());
        formDataToSend.append(`existing_images[${index}][sort_order]`, img.sort_order.toString());
      });

      const newImages = productImages.filter(img => !img.isRemoved && img.id < 0);
      newImages.forEach((img, index) => {
        if (img.image.startsWith('data:')) {
          const base64Data = img.image.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          formDataToSend.append(`new_images[${index}]`, blob, `image_${Date.now()}_${index}.jpg`);
        }
      });

      const removedImages = productImages.filter(img => img.isRemoved && img.id > 0);
      removedImages.forEach((img, index) => {
        formDataToSend.append(`removed_images[${index}]`, img.id.toString());
      });

      // Handle features
      const existingFeatures = productFeatures.filter(f => !f.isRemoved && f.id && f.id > 0);
      existingFeatures.forEach((feature, index) => {
        formDataToSend.append(`existing_features[${index}][id]`, feature.id!.toString());
        formDataToSend.append(`existing_features[${index}][feature]`, feature.feature);
        formDataToSend.append(`existing_features[${index}][sort_order]`, feature.sort_order.toString());
      });

      const newFeatures = productFeatures.filter(f => !f.isRemoved && !f.id);
      newFeatures.forEach((feature, index) => {
        formDataToSend.append(`new_features[${index}][feature]`, feature.feature);
        formDataToSend.append(`new_features[${index}][sort_order]`, feature.sort_order.toString());
      });

      const removedFeatures = productFeatures.filter(f => f.isRemoved && f.id && f.id > 0);
      removedFeatures.forEach((feature, index) => {
        formDataToSend.append(`removed_features[${index}]`, feature.id!.toString());
      });

      // Handle variants
      const existingVariants = productVariants.filter(v => !v.isRemoved && v.id && v.id > 0);
      existingVariants.forEach((variant, variantIndex) => {
        formDataToSend.append(`existing_variants[${variantIndex}][id]`, variant.id!.toString());
        formDataToSend.append(`existing_variants[${variantIndex}][type]`, variant.type);
        
        const existingOptions = variant.options.filter(opt => !opt.isRemoved && opt.id && opt.id > 0);
        existingOptions.forEach((option, optionIndex) => {
          formDataToSend.append(`existing_variants[${variantIndex}][options][${optionIndex}][id]`, option.id!.toString());
          formDataToSend.append(`existing_variants[${variantIndex}][options][${optionIndex}][value]`, option.value);
          formDataToSend.append(`existing_variants[${variantIndex}][options][${optionIndex}][sort_order]`, option.sort_order.toString());
          formDataToSend.append(`existing_variants[${variantIndex}][options][${optionIndex}][price_modifier]`, option.price_modifier || "0");
        });
        
        const newOptions = variant.options.filter(opt => !opt.isRemoved && (!opt.id || opt.id <= 0));
        newOptions.forEach((option, optionIndex) => {
          formDataToSend.append(`existing_variants[${variantIndex}][new_options][${optionIndex}][value]`, option.value);
          formDataToSend.append(`existing_variants[${variantIndex}][new_options][${optionIndex}][sort_order]`, option.sort_order.toString());
          formDataToSend.append(`existing_variants[${variantIndex}][new_options][${optionIndex}][price_modifier]`, option.price_modifier || "0");
        });
      });

      const newVariants = productVariants.filter(v => !v.isRemoved && (!v.id || v.id <= 0));
      newVariants.forEach((variant, variantIndex) => {
        formDataToSend.append(`new_variants[${variantIndex}][type]`, variant.type);
        
        variant.options.filter(opt => !opt.isRemoved).forEach((option, optionIndex) => {
          formDataToSend.append(`new_variants[${variantIndex}][options][${optionIndex}][value]`, option.value);
          formDataToSend.append(`new_variants[${variantIndex}][options][${optionIndex}][sort_order]`, option.sort_order.toString());
          formDataToSend.append(`new_variants[${variantIndex}][options][${optionIndex}][price_modifier]`, option.price_modifier || "0");
        });
      });

      const removedVariants = productVariants.filter(v => v.isRemoved && v.id && v.id > 0);
      removedVariants.forEach((variant, index) => {
        formDataToSend.append(`removed_variants[${index}]`, variant.id!.toString());
      });

      productVariants.forEach((variant) => {
        const removedOptions = variant.options.filter(opt => opt.isRemoved && opt.id && opt.id > 0);
        removedOptions.forEach((option) => {
          formDataToSend.append(`removed_options[]`, option.id!.toString());
        });
      });

      const endpoint = isEditMode ? "/update-product/" : "/save-product/";
      const res = await http.post(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const resp: ApiResp = res.data;
      
      if (resp.error === false) {
        toast.success(`${formData.name} has been ${isEditMode ? 'updated' : 'created'} successfully.`);
        navigate("/admin/products");
      } else {
        toast.error(resp.data || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = () => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      inStock: !prev.inStock
    }));
  };

  const handleBestSellerToggle = () => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      isBestSeller: !prev.isBestSeller
    }));
  };

  const handleNewToggle = () => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      isNew: !prev.isNew
    }));
  };
  
  const handleScan = (code: string) => {
    setFormData(prev => ({ ...prev, sku: code })); 
    toast.success(`Barcode scanned: ${code}`, {
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      autoClose: 3000,
    });
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  };

  const stockQuantity = parseInt(formData.stockQuantity) || 0;
  const lowStockThreshold = parseInt(formData.lowStockAlert) || 10;
  const isLowStock = stockQuantity <= lowStockThreshold;
  const stockPercentage = stockQuantity > 0 ? Math.min((stockQuantity / 100) * 100, 100) : 0;

  const calculateVariantPrice = () => {
    const basePrice = parseFloat(formData.price) || 0;
    const variantPriceModifiers = productVariants
      .filter(v => !v.isRemoved)
      .flatMap(v => v.options.filter(o => !o.isRemoved))
      .reduce((sum, option) => {
        const modifier = parseFloat(option.price_modifier || "0") || 0;
        return sum + modifier;
      }, 0);
    
    return basePrice + variantPriceModifiers;
  };

  const previewPrice = calculateVariantPrice();

  if (isLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
     <BarcodeScanner onScan={handleScan} enabled={scanning} />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/products")}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl md:text-3xl mb-1">
                {isViewMode ? `View Product: ${formData.name || name}` : 
                isEditMode ? `Edit Product: ${formData.name || name}` : 
                "Create New Product"}
              </h1>
              <p className="text-muted-foreground">
                {isViewMode ? "View product details and images" : 
                isEditMode ? "Update product details, images, and settings" : 
                "Add a new product to your catalog"}
              </p>
            </div>
          </div>
          
          {!isViewMode && (
            <div className="flex items-center gap-3">
              {currentStep === formSteps.length - 1 ? (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditMode ? "Update Product" : "Create Product"}
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          {isViewMode && (
            <Button onClick={() => navigate(`/admin/products/${id}/${name}`)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Product
            </Button>
          )}
        </div>

        {!isViewMode && (
          <Card className="bg-gradient-to-r from-background to-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    Step {currentStep + 1} of {formSteps.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                  {formSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.button
                        key={`${step.id}-${gen_random_string()}`}
                        type="button"
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg transition-all",
                          index === currentStep 
                            ? "bg-primary/10 border border-primary/20 shadow-sm" 
                            : "hover:bg-accent/50"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className={cn(
                          "h-5 w-5 mb-2",
                          index === currentStep ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          index === currentStep ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </span>
                        <div className={cn(
                          "h-1 w-8 rounded-full mt-2",
                          index === currentStep ? "bg-primary" : "bg-muted"
                        )} />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Enter the essential details for your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          Product Name *
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This is the name customers will see</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g., Luxury Brazilian Hair Bundle"
                          disabled={isReadOnly}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe your product features, benefits, and specifications..."
                          rows={4}
                          disabled={isReadOnly}
                        />
                      </div>

                      <CategorySelect
                        value={formData.category_id}
                        subCategoryValue={formData.sub_category_id}
                        onChange={handleCategoryChange}
                        categories={availableCategories}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="sku">SKU</Label>
                          {!isReadOnly && (
                            <div className="flex gap-2">
                              <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => handleInputChange('sku', e.target.value)}
                                placeholder="e.g., DON-000001"
                                className="font-mono"
                                disabled={isReadOnly || scanning}
                              />
                              <Button
                                type="button"
                                variant={scanning ? "destructive" : "outline"}
                                onClick={() => {
                                  if (!scanning) {
                                    setScanning(true);
                                    toast.info("Ready to scan. Point camera at barcode...", {autoClose: 3000,});
                                  } else setScanning(false);
                                }}
                                className="gap-2"
                                disabled={isSubmitting}
                              >
                                {scanning ? (
                                  <>
                                    <div className="relative">
                                      <Camera className="h-4 w-4 animate-pulse" />
                                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                                    </div>
                                    <span className="relative">
                                      Scanning...
                                      <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Scan className="h-4 w-4" />
                                    <span>Scan Barcode</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {scanning && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                              onClick={() => setScanning(false)}
                            >
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <div className="relative w-64 h-64 md:w-80 md:h-80">
                                  <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl" />
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_linear_infinite]" />
                                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                                
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                      <div className="w-32 h-32 border-2 border-primary/40 rounded-full animate-pulse" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-primary/20 rounded-full animate-ping" />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="absolute -bottom-16 left-0 right-0 text-center">
                                    <motion.div
                                      animate={{ y: [0, -5, 0] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-center gap-2">
                                        <Camera className="h-5 w-5 text-primary animate-pulse" />
                                        <h3 className="text-xl font-display font-semibold text-white">
                                          Scanning...
                                        </h3>
                                      </div>
                                      <p className="text-sm text-primary/80">
                                        Point camera at barcode
                                      </p>
                                      <div className="flex items-center justify-center gap-1.5 text-xs text-white/60">
                                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-150" />
                                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-300" />
                                        <span className="ml-2">Looking for barcode</span>
                                      </div>
                                    </motion.div>
                                  </div>
                                </div>
                                
                                <motion.div
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="mt-12 bg-black/40 backdrop-blur-md rounded-xl p-6 max-w-md mx-auto border border-white/10"
                                >
                                  <h4 className="font-display font-medium text-white mb-3 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    Scanning Tips
                                  </h4>
                                  <ul className="space-y-2 text-sm text-white/70">
                                    <li className="flex items-start gap-2">
                                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                                      Ensure good lighting on the barcode
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                                      Hold camera steady for 2-3 seconds
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                                      Keep barcode within the scanning frame
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                                      Scan will auto-populate SKU field
                                    </li>
                                  </ul>
                                  
                                  <div className="mt-4 pt-4 border-t border-white/10">
                                    <Button
                                      onClick={() => setScanning(false)}
                                      variant="destructive"
                                      size="sm"
                                      className="w-full gap-2"
                                    >
                                      <X className="h-4 w-4" />
                                      Stop Scanning
                                    </Button>
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Base Price *
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="originalPrice" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Original Price
                          </Label>
                          <Input
                            id="originalPrice"
                            type="number"
                            value={formData.originalPrice}
                            onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            <div>
                              <Label htmlFor="bestSeller">Best Seller</Label>
                              <p className="text-sm text-muted-foreground">
                                Mark this product as a best seller
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="bestSeller"
                            checked={formData.isBestSeller}
                            onCheckedChange={handleBestSellerToggle}
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            <div>
                              <Label htmlFor="newProduct">New Arrival</Label>
                              <p className="text-sm text-muted-foreground">
                                Mark this product as new
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="newProduct"
                            checked={formData.isNew}
                            onCheckedChange={handleNewToggle}
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Product Variants
                    </CardTitle>
                    <CardDescription>
                      Add variants like Length, Color, Size, etc. with optional price adjustments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ProductVariantsManager 
                      variants={productVariants}
                      onVariantsChange={setProductVariants}
                      basePrice={formData.price}
                      isReadOnly={isReadOnly}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Product Features
                    </CardTitle>
                    <CardDescription>
                      Add key features of your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ProductFeaturesManager 
                      features={productFeatures}
                      onFeaturesChange={setProductFeatures}
                      isReadOnly={isReadOnly}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Product Images
                    </CardTitle>
                    <CardDescription>
                      Upload high-quality images to showcase your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ImageUploadGallery 
                      images={productImages}
                      onImagesChange={setProductImages}
                      maxImages={5}
                      isEditMode={isEditMode}
                      onImageDelete={handleDeleteImage}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Inventory Management
                    </CardTitle>
                    <CardDescription>
                      Configure stock levels and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stockQuantity">Current Stock *</Label>
                          <Input
                            id="stockQuantity"
                            type="number"
                            value={formData.stockQuantity}
                            onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                            placeholder="e.g., 100"
                            min="0"
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lowStockAlert" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Low Stock Alert
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Get notified when stock falls below this level. Helps prevent stockouts.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            id="lowStockAlert"
                            type="number"
                            value={formData.lowStockAlert}
                            onChange={(e) => handleInputChange('lowStockAlert', e.target.value)}
                            placeholder="e.g., 10"
                            min="0"
                            disabled={isReadOnly}
                          />
                          <p className="text-xs text-muted-foreground">
                            Alert when stock ≤ {formData.lowStockAlert || 10}
                          </p>
                        </div>
                      </div>

                      {formData.stockQuantity && (
                        <div className="space-y-3 p-4 rounded-lg border bg-gradient-to-r from-background to-primary/5">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Stock Status</Label>
                            <Badge 
                              variant={isLowStock ? "destructive" : "default"}
                              className="gap-1"
                            >
                              {isLowStock ? (
                                <>
                                  <AlertTriangle className="h-3 w-3" />
                                  Low Stock
                                </>
                              ) : (
                                "In Stock"
                              )}
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={stockPercentage} 
                            className={cn(
                              "h-2",
                              isLowStock ? "bg-destructive/20" : "bg-primary/20"
                            )}
                          />
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                              Current: {stockQuantity} units
                            </div>
                            <div className={cn(
                              "font-medium",
                              isLowStock ? "text-destructive" : "text-primary"
                            )}>
                              Alert at: {lowStockThreshold} units
                            </div>
                          </div>
                          
                          {isLowStock && (
                            <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Stock is running low! Consider restocking soon.</span>
                            </div>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="status">Product Status</Label>
                          <p className="text-sm text-muted-foreground">
                            {formData.inStock ? "Product is visible to customers" : "Product is hidden from customers"}
                          </p>
                        </div>
                        <Switch
                          id="status"
                          checked={formData.inStock}
                          onCheckedChange={handleStatusToggle}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/0">
                    <CardTitle className="flex items-center gap-2">
                      <Package2 className="h-5 w-5 text-primary" />
                      Shipping & Dimensions
                    </CardTitle>
                    <CardDescription>
                      Product specifications for shipping calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          Weight (kg)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="weight"
                            type="number"
                            value={formData.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                            placeholder="e.g., 0.2"
                            min="0"
                            step="0.001"
                            disabled={isReadOnly}
                          />
                          <div className="flex items-center px-3 border rounded-lg bg-muted text-sm">
                            kg
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter weight in kilograms (1 kg = 1000 grams)
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">Dimensions (cm)</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="item_height">Height</Label>
                            <div className="flex gap-2">
                              <Input
                                id="item_height"
                                type="number"
                                value={formData.item_height}
                                onChange={(e) => handleInputChange('item_height', e.target.value)}
                                placeholder="e.g., 24"
                                min="0"
                                step="0.1"
                                disabled={isReadOnly}
                              />
                              <div className="flex items-center px-3 border rounded-lg bg-muted text-sm">
                                cm
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="item_width">Width</Label>
                            <div className="flex gap-2">
                              <Input
                                id="item_width"
                                type="number"
                                value={formData.item_width}
                                onChange={(e) => handleInputChange('item_width', e.target.value)}
                                placeholder="e.g., 8"
                                min="0"
                                step="0.1"
                                disabled={isReadOnly}
                              />
                              <div className="flex items-center px-3 border rounded-lg bg-muted text-sm">
                                cm
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="item_depth">Depth</Label>
                            <div className="flex gap-2">
                              <Input
                                id="item_depth"
                                type="number"
                                value={formData.item_depth}
                                onChange={(e) => handleInputChange('item_depth', e.target.value)}
                                placeholder="e.g., 2"
                                min="0"
                                step="0.1"
                                disabled={isReadOnly}
                              />
                              <div className="flex items-center px-3 border rounded-lg bg-muted text-sm">
                                cm
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-gradient-to-r from-background to-primary/5">
                          <h4 className="font-medium mb-2">Dimension Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Dimensions:</span>
                              <span className="font-medium">
                                {formData.item_height || "?"} × {formData.item_width || "?"} × {formData.item_depth || "?"} cm
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Weight:</span>
                              <span className="font-medium">{formData.weight || "?"} kg</span>
                            </div>
                            {formData.item_height && formData.item_width && formData.item_depth && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Volume:</span>
                                <span className="font-medium">
                                  {(parseFloat(formData.item_height) * parseFloat(formData.item_width) * parseFloat(formData.item_depth)).toFixed(2)} cm³
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-blue-100">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Shipping Calculation Info</p>
                            <p className="text-xs text-blue-700 mt-1">
                              These dimensions and weight are used to calculate shipping costs. 
                              Accurate measurements ensure correct shipping rates for customers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!isViewMode && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {formSteps.length}
                </div>
                
                <Button
                  onClick={currentStep === formSteps.length - 1 ? handleSubmit : handleNext}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {currentStep === formSteps.length - 1 ? (
                    isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditMode ? "Update Product" : "Create Product"}
                      </>
                    )
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Product Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/0 border">
                  {productImages.filter(img => !img.isRemoved).length > 0 ? (
                    <img
                      src={resolveSrc(productImages.filter(img => !img.isRemoved)[0]?.image)}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <Package className="h-12 w-12 text-primary/30 mb-3" />
                      <p className="text-sm text-muted-foreground text-center">
                        No preview available
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{formData.name || "Product Name"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.description || "Product description will appear here"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <div className="text-right">
                        <Badge variant="outline">
                          {availableCategories.find(cat => cat.id === formData.category_id)?.name || "Uncategorized"}
                        </Badge>
                        {formData.sub_category_id && (
                          <div className="mt-1">
                            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-xs">
                              <Layers className="h-3 w-3 mr-1" />
                              {(() => {
                                const category = availableCategories.find(cat => cat.id === formData.category_id);
                                return category?.sub_categories?.find(sub => sub.id === formData.sub_category_id)?.name;
                              })()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-lg">
                            {format_currency(previewPrice)}
                          </span>
                          {previewPrice !== parseFloat(formData.price || "0") && (
                            <Badge variant="outline" className="text-xs h-5">
                              {previewPrice > parseFloat(formData.price || "0") ? "+" : ""}
                              {format_currency(Math.abs(previewPrice - parseFloat(formData.price || "0")))}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {formData.originalPrice && parseFloat(formData.originalPrice) > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              {format_currency(parseFloat(formData.originalPrice))}
                            </span>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Base: {formData.price ? format_currency(parseFloat(formData.price)) : "0.00"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={formData.inStock ? "default" : "secondary"}>
                        {formData.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {formData.isBestSeller && (
                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 gap-1">
                          <Trophy className="h-3 w-3" />
                          Best Seller
                        </Badge>
                      )}
                      {formData.isNew && (
                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 gap-1">
                          <Sparkles className="h-3 w-3" />
                          New
                        </Badge>
                      )}
                    </div>

                    {productVariants.filter(v => !v.isRemoved).length > 0 && (
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-2">Available Variants:</h4>
                        <div className="space-y-2">
                          {productVariants
                            .filter(v => !v.isRemoved)
                            .slice(0, 2)
                            .map((variant) => {
                              const activeOptions = variant.options.filter(opt => !opt.isRemoved);
                              const optionsWithPrice = activeOptions
                                .slice(0, 2)
                                .map(opt => {
                                  const modifier = parseFloat(opt.price_modifier || "0");
                                  const sign = modifier > 0 ? "+" : modifier < 0 ? "-" : "";
                                  const priceText = modifier !== 0 ? ` (${sign}${format_currency(Math.abs(modifier))})` : "";
                                  return `${opt.value}${priceText}`;
                                })
                                .join(', ');
                              
                              return (
                                <div key={`${variant.id}-${gen_random_string()}`} className="text-sm">
                                  <span className="text-muted-foreground">{variant.type}: </span>
                                  <span className="font-medium">
                                    {optionsWithPrice}
                                  </span>
                                  {activeOptions.length > 2 && (
                                    <span className="text-muted-foreground text-xs">
                                      {' '}+{activeOptions.length - 2} more
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          {productVariants.filter(v => !v.isRemoved).length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{productVariants.filter(v => !v.isRemoved).length - 2} more variant types
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {formData.stockQuantity && parseInt(formData.stockQuantity) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stock Level:</span>
                        <Badge 
                          variant={isLowStock ? "destructive" : "default"}
                          className="gap-1"
                        >
                          {formData.stockQuantity} units
                        </Badge>
                      </div>
                    )}

                    {(formData.weight || formData.item_height || formData.item_width || formData.item_depth) && (
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-2">Shipping Info:</h4>
                        <div className="space-y-1 text-sm">
                          {formData.weight && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Weight:</span>
                              <span className="font-medium">{formData.weight} kg</span>
                            </div>
                          )}
                          {(formData.item_height || formData.item_width || formData.item_depth) && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dimensions:</span>
                              <span className="font-medium">
                                {formData.item_height || "?"} × {formData.item_width || "?"} × {formData.item_depth || "?"} cm
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {productFeatures.filter(f => !f.isRemoved).length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                      <div className="space-y-1">
                        {productFeatures
                          .filter(f => !f.isRemoved)
                          .slice(0, 3)
                          .map((feature, index) => (
                            <div key={`${index}-${gen_random_string()}`} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">{feature.feature}</span>
                            </div>
                          ))}
                        {productFeatures.filter(f => !f.isRemoved).length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{productFeatures.filter(f => !f.isRemoved).length - 3} more features
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!isViewMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Completion Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Basic Information</span>
                    <Badge variant={formData.name && formData.category_id && formData.price ? "default" : "secondary"}>
                      {formData.name && formData.category_id && formData.price ? "✓" : "—"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sub Category</span>
                    <Badge variant={formData.sub_category_id ? "default" : "secondary"}>
                      {formData.sub_category_id ? "✓" : "Optional"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Variants</span>
                    <Badge variant={productVariants.filter(v => !v.isRemoved).length > 0 ? "default" : "secondary"}>
                      {productVariants.filter(v => !v.isRemoved).length} added
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Features</span>
                    <Badge variant={productFeatures.filter(f => !f.isRemoved).length > 0 ? "default" : "secondary"}>
                      {productFeatures.filter(f => !f.isRemoved).length} added
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Images Uploaded</span>
                    <Badge variant={productImages.filter(img => !img.isRemoved).length > 0 ? "default" : "secondary"}>
                      {productImages.filter(img => !img.isRemoved).length} / 5
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock Information</span>
                    <Badge variant={formData.stockQuantity && parseInt(formData.stockQuantity) > 0 ? "default" : "secondary"}>
                      {formData.stockQuantity && parseInt(formData.stockQuantity) > 0 ? "✓" : "—"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Details</span>
                    <Badge variant={formData.weight ? "default" : "secondary"}>
                      {formData.weight ? "✓" : "—"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProductForm;