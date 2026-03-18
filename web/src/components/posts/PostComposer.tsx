import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image, Video, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar";
import { useAuth } from "@/hooks/useAuth";
import type { CreatePostInput } from "@/types";

interface PostComposerProps {
  onSubmit: (input: CreatePostInput) => Promise<void>;
  onUploadImages?: (files: File[]) => Promise<string[]>;
  onUploadVideos?: (files: File[]) => Promise<string[]>;
  placeholder?: string;
  replyToId?: number;
  repostId?: number;
  maxLength?: number;
  className?: string;
}

export function PostComposer({
  onSubmit,
  onUploadImages,
  onUploadVideos,
  placeholder = "What's happening?",
  replyToId,
  repostId,
  maxLength = 280,
  className,
}: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = user?.avatar || getAvatarUrl(user?.name || "User");
  const userInitial = user?.name?.[0]?.toUpperCase() || "U";
  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Max 10 images
    const newFiles = files.slice(0, 10 - mediaFiles.length);
    setMediaFiles((prev) => [...prev, ...newFiles]);
    setMediaType("image");

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Max 5 videos
    const newFiles = files.slice(0, 5 - mediaFiles.length);
    setMediaFiles((prev) => [...prev, ...newFiles]);
    setMediaType("video");

    // Generate previews
    newFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setMediaPreviews((prev) => [...prev, url]);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    if (mediaFiles.length === 1) {
      setMediaType(null);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      let mediaUrls: string[] = [];

      // Upload media if any
      if (mediaFiles.length > 0) {
        setIsUploading(true);
        if (mediaType === "image" && onUploadImages) {
          mediaUrls = await onUploadImages(mediaFiles);
        } else if (mediaType === "video" && onUploadVideos) {
          mediaUrls = await onUploadVideos(mediaFiles);
        }
        setIsUploading(false);
      }

      await onSubmit({
        content: content.trim(),
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        reply_to_id: replyToId,
        repost_id: repostId,
      });

      // Reset form
      setContent("");
      setMediaFiles([]);
      setMediaPreviews([]);
      setMediaType(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("bg-card border rounded-lg overflow-hidden flex flex-col", className)}>
      <div className="p-3 flex gap-3">
        <Avatar className="size-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="flex-1 bg-muted/30 border rounded-md p-2 outline-none text-[15px] resize-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 min-h-[60px] transition-all"
          disabled={isSubmitting}
        />
      </div>

      {/* Media Previews */}
      {mediaPreviews.length > 0 && (
        <div
          className={cn(
            "px-3 pb-3 grid gap-2",
            mediaPreviews.length === 1 && "grid-cols-1",
            mediaPreviews.length === 2 && "grid-cols-2",
            mediaPreviews.length >= 3 && "grid-cols-2"
          )}
        >
          {mediaPreviews.map((preview, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden border">
              {mediaType === "video" ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover max-h-[160px]"
                />
              ) : (
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover max-h-[160px]"
                />
              )}
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-1 right-1 size-6 rounded-full bg-black/70 hover:bg-black/90"
                onClick={() => removeMedia(index)}
              >
                <X className="size-3 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Actions Row */}
      <div className="px-3 py-2 bg-muted/10 flex items-center justify-between border-t">
        <div className="flex gap-1 text-muted-foreground">
          {/* Image Upload */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={handleImageSelect}
            disabled={mediaType === "video" || mediaFiles.length >= 10}
          />
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded hover:bg-muted disabled:opacity-50"
            onClick={() => imageInputRef.current?.click()}
            disabled={mediaType === "video" || mediaFiles.length >= 10 || isSubmitting}
          >
            <Image className="size-4" />
          </Button>

          {/* Video Upload */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={handleVideoSelect}
            disabled={mediaType === "image" || mediaFiles.length >= 5}
          />
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded hover:bg-muted disabled:opacity-50"
            onClick={() => videoInputRef.current?.click()}
            disabled={mediaType === "image" || mediaFiles.length >= 5 || isSubmitting}
          >
            <Video className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Character Count */}
          {content.length > 0 && (
            <span
              className={cn(
                "text-xs font-medium",
                remainingChars < 20 && "text-yellow-500",
                isOverLimit && "text-red-500"
              )}
            >
              {remainingChars}
            </span>
          )}

          {/* Submit Button */}
          <Button
            className="rounded-full px-4 h-8 text-sm font-bold shadow-sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3 mr-2 animate-spin" />
                {isUploading ? "Uploading..." : "Posting..."}
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
