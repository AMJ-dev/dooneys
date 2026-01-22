import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Loader2, Upload, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import UserContext from "@/lib/userContext";
import { User as MyUser } from "@/lib/types";
import { http } from "@/lib/httpClient";
import { ApiResp } from "@/lib/types";
import { resolveSrc } from "@/lib/functions";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const { my_details, setMyDetails } = useContext(UserContext);
  const [user, setUser] = useState<MyUser>({
    id: my_details.id || "",
    first_name: my_details.first_name || "",
    last_name: my_details.last_name || "",
    email: my_details.email || "",
    mobile_number: my_details.mobile_number || "",
    dob: my_details.dob || "",
    pics: my_details.pics || "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize image preview
  useEffect(() => {
    if (user.pics) {
      setImagePreview(resolveSrc(user.pics));
    }
  }, [user.pics]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
  };

  const upload_pics = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("pics", selectedFile);

      const res = await http.post("/update-pics/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        const newPics = resp.code?.pics || resp.data.pics || user.pics;
        
        // Update local state
        setMyDetails({ 
          ...my_details, 
          pics: newPics 
        });
        
        setUser(prev => ({ 
          ...prev, 
          pics: newPics 
        }));
        
        // Clean up old preview URL
        if (imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }
        
        // Update preview with new uploaded image
        setImagePreview(resolveSrc(newPics));
        setSelectedFile(null);
        
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(resp.data || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const cancelImageSelection = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setSelectedFile(null);
    
    // Reset to original image
    if (user.pics) {
      setImagePreview(resolveSrc(user.pics));
    } else {
      setImagePreview("");
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!user.first_name?.trim() || !user.last_name?.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.email && !emailRegex.test(user.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number (optional, basic validation)
    if (user.mobile_number && !/^[\d\s\-\+\(\)]{10,15}$/.test(user.mobile_number)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append("first_name", user.first_name.trim());
      formData.append("last_name", user.last_name.trim());
      if (user.email) formData.append("email", user.email.trim());
      if (user.mobile_number) formData.append("mobile_number", user.mobile_number.trim());
      if (user.dob) formData.append("dob", user.dob);

      const res = await http.post("/update-profile/", formData);
      const resp: ApiResp = res.data;
      
      if (!resp.error && resp.data) {
        setMyDetails({
          ...my_details,
          first_name: user.first_name.trim(),
          last_name: user.last_name.trim(),
          email: user.email?.trim() || my_details.email,
          mobile_number: user.mobile_number?.trim() || my_details.mobile_number,
          dob: user.dob || my_details.dob,
        });
        
        toast.success("Profile updated successfully!");
      } else {
        toast.error(resp.data || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setUser({
      id: my_details.id || "",
      first_name: my_details.first_name || "",
      last_name: my_details.last_name || "",
      email: my_details.email || "",
      mobile_number: my_details.mobile_number || "",
      dob: my_details.dob || "",
      pics: my_details.pics || "",
    });
    
    cancelImageSelection();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your personal information and profile photo
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Photo */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4">Profile Photo</h3>
                  
                  {/* Avatar Container */}
                  <div className="relative inline-block group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-primary/40" />
                      )}
                    </div>
                    
                    {/* Camera Button Overlay */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                        "bg-gradient-to-r from-primary to-accent text-white",
                        "hover:scale-110 hover:shadow-xl active:scale-95"
                      )}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    
                    {/* Selected Image Indicator */}
                    {selectedFile && (
                      <div className="absolute -top-2 -right-2">
                        <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Instructions */}
                  <div className="mt-6 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">File requirements:</span>
                      <br />
                      • JPG, PNG, GIF, or WebP
                      <br />
                      • Max file size: 5MB
                      <br />
                      • Recommended: Square image, at least 400x400px
                    </p>
                    
                    {/* Upload/Cancel Buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                      {selectedFile ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={upload_pics}
                            disabled={uploadingImage}
                            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-md"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={cancelImageSelection}
                            disabled={uploadingImage}
                            className="flex-shrink-0 border-destructive/20 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Choose Photo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />
                
                {/* Account Info */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Account Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-medium">—</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile Status</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-6">Personal Information</h3>
              
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="first_name"
                      value={user.first_name}
                      onChange={(e) => setUser({...user, first_name: e.target.value})}
                      placeholder="Enter your first name"
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="last_name"
                      value={user.last_name}
                      onChange={(e) => setUser({...user, last_name: e.target.value})}
                      placeholder="Enter your last name"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    placeholder="your.email@example.com"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your email address is used for account notifications and password recovery
                  </p>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="mobile_number" className="font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="mobile_number"
                    type="tel"
                    value={user.mobile_number}
                    onChange={(e) => setUser({...user, mobile_number: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for delivery notifications and account security
                  </p>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={user.dob}
                    onChange={(e) => setUser({...user, dob: e.target.value})}
                    className="h-11 max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for personalized offers and birthday surprises
                  </p>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={submitting || uploadingImage}
                    className="sm:flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-md"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Form Status */}
                {(submitting || uploadingImage) && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Please wait while we save your changes...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Security Note */}
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Your data is secure</h4>
                <p className="text-xs text-muted-foreground">
                  All your personal information is encrypted and protected. We never share your data with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;