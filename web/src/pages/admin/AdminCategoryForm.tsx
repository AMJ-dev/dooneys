import { useState, useEffect, startTransition } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Save, 
  Upload, 
  Eye,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {http} from "@/lib/httpClient"
import { ApiResp } from "@/lib/types";
import {toast} from "react-toastify"
import {resolveSrc} from "@/lib/functions"
import usePermissions from "@/hooks/usePermissions";

interface SubCategory {
  id?: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  isNew?: boolean;
  isDeleted?: boolean;
}

interface CategoryFormData {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "active" | "inactive";
  subCategories: SubCategory[];
}

const AdminCategoryForm = () => {
  const {
    add_category: can_add_category,
    edit_category: can_edit_category,
  } = usePermissions(["add_category", "edit_category"]);
  const { id, name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const isViewMode = searchParams.get('view') === 'true';
  const isReadOnly = isViewMode;

  const [formData, setFormData] = useState<CategoryFormData>({
    id: "",
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "active",
    subCategories: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isEditMode) {
      if(!can_edit_category){
        startTransition(()=>navigate("/unauthorized"));
        return;
      }
      setIsLoading(true);
      get_category()
    }else if(!can_add_category){
      startTransition(()=>navigate("/unauthorized"));
      return;
    }
  }, [id, isEditMode]);

  const get_category = async()=>{
    try {
      const res = await http.get(`/get-category/${id}/`)
      const resp:ApiResp = res.data;
      if(resp.error == false && resp.data){
        setFormData({
          id: resp.data.id.toString(),
          name: resp.data.name,
          slug: resp.data.slug,
          description: resp.data.description,
          image: resp.data.image || "",
          status: resp.data.status,
          subCategories: resp.data.sub_categories?.map((sub: any) => ({
            id: sub.id.toString(),
            name: sub.name,
            slug: sub.slug,
            status: sub.status,
            isNew: false,
            isDeleted: false
          })) || [],
        });
        if (resp.data.image) {
          setImagePreview(resolveSrc(resp.data.image));
        }
        setIsLoading(false);
        return
      }
    } catch (error) {
      toast.error("Failed to load category");
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'name' && !isEditMode) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSubCategoryChange = (index: number, field: keyof SubCategory, value: string) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.map((sub, i) => {
        if (i === index) {
          const updatedSub = { ...sub, [field]: value };
          
          // Auto-generate slug from name for new subcategories
          if (field === 'name' && (!sub.id || sub.isNew)) {
            updatedSub.slug = value
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-');
          }
          
          return updatedSub;
        }
        return sub;
      })
    }));
  };

  const handleSubCategoryStatusToggle = (index: number) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.map((sub, i) => 
        i === index 
          ? { ...sub, status: sub.status === "active" ? "inactive" : "active" }
          : sub
      )
    }));
  };

  const addSubCategory = () => {
    if (isReadOnly) return;
    
    const newSubCategory: SubCategory = {
      name: "",
      slug: "",
      status: "active",
      isNew: true
    };
    
    setFormData(prev => ({
      ...prev,
      subCategories: [...prev.subCategories, newSubCategory]
    }));
    
    // Auto-expand new subcategory
    setExpandedSubCategories(prev => {
      const newSet = new Set(prev);
      newSet.add(formData.subCategories.length);
      return newSet;
    });
  };

  const removeSubCategory = async (index: number) => {
    if (isReadOnly) return;
    
    const subCategory = formData.subCategories[index];
    
    // If it's an existing subcategory from the database, call API to remove it
    if (subCategory.id && !subCategory.isNew) {
      try {
        setIsLoading(true);
        const res = await http.post("/remove-subcat/", { id: subCategory.id });
        const resp: ApiResp = res.data;
        
        if (resp.error == false) {
          toast.success(`Subcategory "${subCategory.name}" removed successfully`);
          
          // Mark as deleted in UI
          setFormData(prev => ({
            ...prev,
            subCategories: prev.subCategories.map((sub, i) => 
              i === index ? { ...sub, isDeleted: true } : sub
            )
          }));
          
          // Remove from UI after successful API call
          setFormData(prev => ({
            ...prev,
            subCategories: prev.subCategories.filter((_, i) => i !== index)
          }));
        } else {
          toast.error(resp.data || "Failed to remove subcategory");
        }
      } catch (error: any) {
        console.error("Error removing subcategory:", error);
        toast.error(error.response?.data?.message || "Failed to remove subcategory");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new unsaved subcategories, just remove from UI
      setFormData(prev => ({
        ...prev,
        subCategories: prev.subCategories.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleSubCategoryExpand = (index: number) => {
    setExpandedSubCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (JPEG, PNG, etc.)")
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    setFormData(prev => ({
      ...prev,
      image: file.name
    }));

    toast.info(`${file.name} has been selected`);
  };

  const removeImage = () => {
    if (isReadOnly) return;
    
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      image: ""
    }));
  };

  const validateSubCategories = (): boolean => {
    for (let i = 0; i < formData.subCategories.length; i++) {
      const sub = formData.subCategories[i];
      if (!sub.name.trim()) {
        toast.error(`Subcategory #${i + 1} name is required`);
        return false;
      }
      if (!sub.slug.trim()) {
        toast.error(`Subcategory #${i + 1} slug is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    if (!formData.image && !imagePreview && !isEditMode) {
      toast.error("Please upload an image");
      return;
    }

    if (!validateSubCategories()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      if(isEditMode) formDataToSend.append("id", formData.id);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("status", formData.status);
      
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (formData.image && !imageFile) {
        formDataToSend.append("image", formData.image);
      }

      // Separate subcategories into new and existing
      const newSubCategories = formData.subCategories
        .filter(sub => sub.isNew && !sub.isDeleted)
        .map(({ name, slug, status }) => ({
          name,
          slug,
          status
        }));
      
      const existingSubCategories = formData.subCategories
        .filter(sub => !sub.isNew && !sub.isDeleted && sub.id)
        .map(({ id, name, slug, status }) => ({
          id,
          name,
          slug,
          status
        }));

      formDataToSend.append("new_subcategories", JSON.stringify(newSubCategories));
      formDataToSend.append("existing_subcategories", JSON.stringify(existingSubCategories));

      const endpoint = isEditMode ? "/update-category/" : "/save-category/";
      const res = await http.post(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const resp: ApiResp = res.data;
      if(resp.error == false){
        toast.success(`${formData.name} has been successfully ${isEditMode?"updated":"created"}.`);
        startTransition(()=>navigate("/admin/categories"));
        return;
      }
      toast.error(resp.data || "Operation failed");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = () => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active"
    }));
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-center">
          <div className="h-6 w-48 bg-muted rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/categories")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl mb-1">
              {isViewMode ? `View Category: ${formData.name || name}` : 
               isEditMode ? `Edit Category: ${formData.name || name}` : 
               "Create New Category"}
            </h1>
            <p className="text-muted-foreground">
              {isViewMode ? "View category details" : 
               isEditMode ? "Update category details and settings" : 
               "Add a new product category"}
            </p>
          </div>
        </div>
        
        {!isViewMode && (
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
          </Button>
        )}
        
        {isViewMode && (
          <Button onClick={() => navigate(`/admin/categories/${id}/${name}`)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Category
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Enter the basic information for your category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Hair Extensions"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="e.g., hair-extensions"
                      className="font-mono"
                      disabled={isReadOnly}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used in URLs: /category/{formData.slug || 'your-slug'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe this category..."
                    rows={4}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="status">Category Status</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formData.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        id="status"
                        checked={formData.status === "active"}
                        onCheckedChange={handleStatusToggle}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sub Categories Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Sub Categories</CardTitle>
                <CardDescription>
                  Add and manage subcategories under this category
                </CardDescription>
              </div>
              {!isReadOnly && (
                <Button onClick={addSubCategory} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subcategory
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.subCategories.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-3">
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">No subcategories added yet</p>
                  {!isReadOnly && (
                    <Button variant="outline" onClick={addSubCategory} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Subcategory
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.subCategories.map((sub, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden bg-card"
                    >
                      <div className="flex items-center gap-2 p-4 bg-muted/30">
                        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleSubCategoryExpand(index)}
                        >
                          {expandedSubCategories.has(index) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {sub.name || "New Subcategory"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Slug: {sub.slug || "not-set"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 mr-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              sub.status === "active" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          {!isReadOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubCategory(index)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {expandedSubCategories.has(index) && (
                        <div className="p-4 border-t space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Subcategory Name *</Label>
                              <Input
                                value={sub.name}
                                onChange={(e) => handleSubCategoryChange(index, 'name', e.target.value)}
                                placeholder="e.g., Clip-in Extensions"
                                disabled={isReadOnly}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Slug *</Label>
                              <Input
                                value={sub.slug}
                                onChange={(e) => handleSubCategoryChange(index, 'slug', e.target.value)}
                                placeholder="e.g., clip-in-extensions"
                                className="font-mono"
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label>Status</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {sub.status === "active" ? "Active" : "Inactive"}
                              </span>
                              <Switch
                                checked={sub.status === "active"}
                                onCheckedChange={() => handleSubCategoryStatusToggle(index)}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
              <CardDescription>
                Upload or change the category image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                {imagePreview || formData.image ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={imagePreview || formData.image}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                    {!isReadOnly && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      No image uploaded
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 800×800px, PNG or JPG
                    </p>
                  </div>
                )}
              </div>

              {!isReadOnly && (
                <>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{imagePreview || formData.image ? "Change Image" : "Upload Image"}</span>
                    </div>
                  </Label>
                </>
              )}

              {(imagePreview || formData.image) && (
                <div className="text-sm space-y-1">
                  <p className="font-medium">Current Image:</p>
                  <p className="text-muted-foreground break-all">
                    {imageFile ? imageFile.name : formData.image.split('/').pop()}
                  </p>
                  {imageFile && (
                    <p className="text-xs text-muted-foreground">
                      Size: {(imageFile.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {!isViewMode && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/categories")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
                
                {isEditMode && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/admin/categories/${id}/${name}?view=true`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Category
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to discard changes?')) {
                      navigate("/admin/categories");
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Discard Changes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {!isViewMode && (
        <div className="sticky bottom-0 bg-background border-t py-4">
          <div className="container flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isEditMode ? "Update this category" : "Create a new category"}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/categories")}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update Category" : "Create Category"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryForm;