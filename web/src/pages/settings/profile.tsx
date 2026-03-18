import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getAvatarUrl, getInitials } from "@/lib/avatar";
import { getMediaUrl } from "@/lib/images";
import { useToast } from "@/hooks/use-toast";
import PostService from "@/services/post.service";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const { updateProfile, loading } = useProfile();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setBanner(user.banner || "");
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const response = await PostService.uploadMedia([file]);
      if (response.data?.media_urls?.[0]) {
        // Store only the path, not the full URL
        // Backend will handle full URL conversion on frontend when fetching
        const mediaPath = response.data.media_urls[0];
        setAvatar(mediaPath);
        toast({
          title: "Success",
          description: "Avatar uploaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const response = await PostService.uploadMedia([file]);
      if (response.data?.media_urls?.[0]) {
        // Store only the path, not the full URL
        // Backend will handle full URL conversion on frontend when fetching
        const mediaPath = response.data.media_urls[0];
        setBanner(mediaPath);
        toast({
          title: "Success",
          description: "Banner uploaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profileData = { name, bio, avatar, banner };
    console.log('Submitting profile update:', profileData);
    console.log('Profile data JSON:', JSON.stringify(profileData));
    console.log('Banner value:', banner, 'Type:', typeof banner, 'Length:', banner?.length);

    try {
      await updateProfile(profileData);

      // Refresh user data in auth context
      await fetchUser();

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const isFormDirty = 
    name !== (user?.name || "") ||
    bio !== (user?.bio || "") ||
    avatar !== (user?.avatar || "") ||
    banner !== (user?.banner || "");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || isUploading || !isFormDirty}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Banner */}
         <div className="relative">
           <div
             className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/40 bg-cover bg-center"
             style={banner ? { backgroundImage: `url(${getMediaUrl(banner)})` } : undefined}
           >
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="size-10 rounded-full bg-black/50 flex items-center justify-center">
                <Camera className="size-5 text-white" />
              </div>
            </button>
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />
        </div>

        {/* Avatar & Form */}
        <div className="px-4 pb-6">
          {/* Avatar */}
           <div className="relative -mt-12 sm:-mt-16 mb-4">
             <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
               <AvatarImage
                 src={avatar?.startsWith("http") ? avatar : getMediaUrl(avatar)}
                 alt={user?.username}
               />
              <AvatarFallback className="text-2xl sm:text-4xl">
                {user?.name ? (
                  getInitials(user.name)
                ) : (
                  <User className="size-8" />
                )}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Camera className="size-5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-6 mt-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground text-right">
                {name.length}/50
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/500
              </p>
            </div>

            {/* Username (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={`@${user?.username || ""}`}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed from here
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
