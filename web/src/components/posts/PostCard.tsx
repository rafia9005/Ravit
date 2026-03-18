import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageViewer } from "@/components/ui/image-viewer";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  MoreHorizontal,
  Bookmark,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar";
import { parseMediaUrls, isVideoUrl, getMediaUrl } from "@/lib/images";
import type { Post, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  currentUserId?: number;
  onLike?: (postId: number) => void;
  onUnlike?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
  onRemoveBookmark?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onReply?: (postId: number) => void;
  onRepost?: (postId: number) => void;
  user?: User;
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onUnlike,
  onBookmark,
  onRemoveBookmark,
  onDelete,
  onReply,
  onRepost,
  user,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Sync state when post prop changes
  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikeCount(post.like_count);
    setIsBookmarked(post.is_bookmarked || false);
  }, [post.id, post.is_liked, post.like_count, post.is_bookmarked]);

  const isOwner = currentUserId === post.user_id;
  const displayUser = user || post.user;
  const avatarUrl = displayUser?.avatar ? getMediaUrl(displayUser.avatar) : getAvatarUrl(displayUser?.name || "User");
  const userInitial = displayUser?.name?.[0]?.toUpperCase() || "U";
  const displayUsername = displayUser?.username || displayUser?.email?.split("@")[0] || "user";

  // Parse media URLs using the utility
  const mediaUrls = parseMediaUrls(post.media_urls);
  // Filter only images for the viewer (not videos)
  const imageUrls = mediaUrls.filter(url => !isVideoUrl(url));

  const handleLike = async () => {
    if (isLikeLoading) return; // Prevent double-click
    
    setIsLikeLoading(true);
    try {
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
        await onUnlike?.(post.id);
      } else {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        await onLike?.(post.id);
      }
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      setIsBookmarked(false);
      onRemoveBookmark?.(post.id);
    } else {
      setIsBookmarked(true);
      onBookmark?.(post.id);
    }
  };

  const handleImageClick = (url: string) => {
    // Find the index of this image in the imageUrls array
    const index = imageUrls.indexOf(url);
    if (index !== -1) {
      setViewerIndex(index);
      setViewerOpen(true);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: false });
    } catch {
      return "";
    }
  };

  return (
    <>
      <article className="bg-card border rounded-xl overflow-hidden hover:border-muted-foreground/30 transition-all group">
        <div className="p-4 flex flex-col gap-2 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link to={`/u/${displayUsername}`}>
              <Avatar className="size-10">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <Link
                to={`/u/${displayUsername}`}
                className="text-sm font-semibold hover:underline truncate"
              >
                {displayUser?.name || displayUsername}
              </Link>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <span>@{displayUsername}</span>
                <span>·</span>
                <Link
                  to={`/post/${post.id}`}
                  className="hover:underline"
                >
                  {formatTime(post.created_at)}
                </Link>
              </div>
            </div>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-auto size-8 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => onDelete?.(post.id)}>
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleBookmark}>
                  <Bookmark className="size-4 mr-2" />
                  {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply indicator */}
          {post.reply_to_id && (
            <p className="text-xs text-muted-foreground">
              Replying to{" "}
              <Link
                to={`/post/${post.reply_to_id}`}
                className="text-primary hover:underline"
              >
                a post
              </Link>
            </p>
          )}

          {/* Content */}
          <Link to={`/post/${post.id}`}>
            <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </Link>

          {/* Media */}
          {mediaUrls.length > 0 && (
            <div
              className={cn(
                "mt-1 grid gap-1 rounded-xl overflow-hidden",
                mediaUrls.length === 1 && "grid-cols-1",
                mediaUrls.length === 2 && "grid-cols-2",
                mediaUrls.length >= 3 && "grid-cols-2"
              )}
            >
              {mediaUrls.slice(0, 4).map((url, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative",
                    mediaUrls.length === 3 && index === 0 && "row-span-2",
                    // For single image, don't constrain height
                    mediaUrls.length === 1 ? "" : "aspect-square"
                  )}
                >
                  {isVideoUrl(url) ? (
                    <video
                      src={url}
                      controls
                      className={cn(
                        "w-full bg-muted rounded-lg",
                        mediaUrls.length === 1 
                          ? "max-h-[500px] object-contain" 
                          : "h-full object-cover"
                      )}
                    />
                  ) : (
                    <img
                      src={url}
                      alt=""
                      onClick={() => handleImageClick(url)}
                      className={cn(
                        "w-full bg-muted rounded-lg cursor-pointer hover:opacity-90 transition-opacity",
                        mediaUrls.length === 1 
                          ? "max-h-[500px] object-contain" 
                          : "h-full object-cover"
                      )}
                    />
                  )}
                  {/* Show +N overlay for 4th image if there are more */}
                  {index === 3 && mediaUrls.length > 4 && (
                    <div 
                      className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(url)}
                    >
                      <span className="text-white text-2xl font-bold">
                        +{mediaUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-muted-foreground">
            {/* Like */}
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-500/10 transition-colors",
                isLiked ? "text-rose-500" : "hover:text-rose-500"
              )}
            >
              <Heart className={cn("size-[18px]", isLiked && "fill-current")} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>

            {/* Reply */}
            <button
              onClick={() => onReply?.(post.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <MessageCircle className="size-[18px]" />
              <span className="text-sm font-medium">{post.reply_count}</span>
            </button>

            {/* Repost */}
            <button
              onClick={() => onRepost?.(post.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-green-500/10 hover:text-green-500 transition-colors"
            >
              <Repeat2 className="size-[18px]" />
              <span className="text-sm font-medium">{post.repost_count}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors",
                isBookmarked ? "text-primary" : "hover:text-primary"
              )}
            >
              <Bookmark className={cn("size-[18px]", isBookmarked && "fill-current")} />
            </button>

            {/* Share */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
              <Share2 className="size-[18px]" />
            </button>
          </div>
        </div>
      </article>

      {/* Image Viewer Modal */}
      <ImageViewer
        images={imageUrls}
        currentIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onNavigate={setViewerIndex}
      />
    </>
  );
}
