import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const isOwner = currentUserId === post.user_id;
  const displayUser = user || post.user;
  const avatarUrl = displayUser?.avatar ? getMediaUrl(displayUser.avatar) : getAvatarUrl(displayUser?.name || "User");
  const userInitial = displayUser?.name?.[0]?.toUpperCase() || "U";
  const displayName = displayUser?.name || "User";
  const displayUsername = displayUser?.username || displayUser?.email?.split("@")[0] || "user";
  console.log("fetch user", user)

  // Parse media URLs using the utility
  const mediaUrls = parseMediaUrls(post.media_urls);
  
  // Debug logging
  if (post.media_urls) {
    console.log("Raw media_urls:", post.media_urls);
    console.log("Parsed mediaUrls:", mediaUrls);
  }

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
      onUnlike?.(post.id);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      onLike?.(post.id);
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

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: false });
    } catch {
      return "";
    }
  };

  return (
    <article className="p-4 flex gap-4 border-b hover:bg-muted/30 transition-colors group cursor-pointer">
      <Link to={`/profile/${post.user_id}`}>
        <Avatar className="size-11">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <Link
            to={`/profile/${post.user_id}`}
            className="font-bold hover:underline truncate"
          >
            {displayName}
          </Link>
          <span className="text-muted-foreground text-[15px] truncate">
            @{displayUsername}
          </span>
          <span className="text-muted-foreground text-[15px]">·</span>
          <Link
            to={`/post/${post.id}`}
            className="text-muted-foreground text-[15px] hover:underline"
          >
            {formatTime(post.created_at)}
          </Link>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="ml-auto size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
          <p className="text-sm text-muted-foreground">
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
          <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </Link>

        {/* Media */}
        {mediaUrls.length > 0 && (
          <div
            className={cn(
              "mt-3 grid gap-2 rounded-2xl overflow-hidden",
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
                  mediaUrls.length === 3 && index === 0 && "row-span-2"
                )}
              >
                {isVideoUrl(url) ? (
                  <video
                    src={url}
                    controls
                    className="w-full h-full object-cover rounded-xl max-h-[300px]"
                  />
                ) : (
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover rounded-xl max-h-[300px]"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pr-8 text-muted-foreground max-w-md">
          {/* Reply */}
          <button
            onClick={() => onReply?.(post.id)}
            className="group/btn flex items-center gap-2 hover:text-primary transition-colors"
          >
            <div className="size-8 rounded-full flex items-center justify-center group-hover/btn:bg-primary/10 transition-colors">
              <MessageCircle className="size-4" />
            </div>
            <span className="text-sm">{post.reply_count}</span>
          </button>

          {/* Repost */}
          <button
            onClick={() => onRepost?.(post.id)}
            className="group/btn flex items-center gap-2 hover:text-green-500 transition-colors"
          >
            <div className="size-8 rounded-full flex items-center justify-center group-hover/btn:bg-green-500/10 transition-colors">
              <Repeat2 className="size-4" />
            </div>
            <span className="text-sm">{post.repost_count}</span>
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            className={cn(
              "group/btn flex items-center gap-2 transition-colors",
              isLiked ? "text-rose-500" : "hover:text-rose-500"
            )}
          >
            <div className="size-8 rounded-full flex items-center justify-center group-hover/btn:bg-rose-500/10 transition-colors">
              <Heart
                className={cn("size-4", isLiked && "fill-current")}
              />
            </div>
            <span className="text-sm">{likeCount}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={cn(
              "group/btn flex items-center gap-2 transition-colors",
              isBookmarked ? "text-primary" : "hover:text-primary"
            )}
          >
            <div className="size-8 rounded-full flex items-center justify-center group-hover/btn:bg-primary/10 transition-colors">
              <Bookmark
                className={cn("size-4", isBookmarked && "fill-current")}
              />
            </div>
          </button>

          {/* Share */}
          <button className="group/btn flex items-center gap-2 hover:text-primary transition-colors">
            <div className="size-8 rounded-full flex items-center justify-center group-hover/btn:bg-primary/10 transition-colors">
              <Share2 className="size-4" />
            </div>
          </button>
        </div>
      </div>
    </article>
  );
}
