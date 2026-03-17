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
    <div className={cn("p-4 flex gap-4 border-b", className)}>
      <Avatar className="size-11 ring-2 ring-muted/20">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{userInitial}</AvatarFallback>
      </Avatar>

      <div className="flex-1 flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-xl resize-none placeholder:text-muted-foreground focus:ring-0 min-h-[80px]"
          disabled={isSubmitting}
        />

        {/* Media Previews */}
        {mediaPreviews.length > 0 && (
          <div
            className={cn(
              "grid gap-2 rounded-2xl overflow-hidden",
              mediaPreviews.length === 1 && "grid-cols-1",
              mediaPreviews.length === 2 && "grid-cols-2",
              mediaPreviews.length >= 3 && "grid-cols-2"
            )}
          >
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative">
                {mediaType === "video" ? (
                  <video
                    src={preview}
                    className="w-full h-full object-cover rounded-xl max-h-[200px]"
                  />
                ) : (
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover rounded-xl max-h-[200px]"
                  />
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/70 hover:bg-black/90"
                  onClick={() => removeMedia(index)}
                >
                  <X className="size-4 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 text-primary">
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
              className="size-9 rounded-full hover:bg-primary/10 disabled:opacity-50"
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
              className="size-9 rounded-full hover:bg-primary/10 disabled:opacity-50"
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
                  "text-sm",
                  remainingChars < 20 && "text-yellow-500",
                  isOverLimit && "text-red-500"
                )}
              >
                {remainingChars}
              </span>
            )}

            {/* Submit Button */}
            <Button
              className="rounded-full px-6 font-bold"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {isUploading ? "Uploading..." : "Posting..."}
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
