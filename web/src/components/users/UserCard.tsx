import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAvatarUrl, getInitials } from "@/lib/avatar";
import { getMediaUrl } from "@/lib/images";
import type { UserFollow } from "@/types";

interface UserCardProps {
  user: UserFollow;
  currentUserId?: number;
  isFollowing?: boolean;
  onFollow?: (userId: number) => Promise<boolean>;
  onUnfollow?: (userId: number) => Promise<boolean>;
  showFollowButton?: boolean;
}

export function UserCard({
  user,
  currentUserId,
  isFollowing: initialIsFollowing = false,
  onFollow,
  onUnfollow,
  showFollowButton = true,
}: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const isOwnProfile = currentUserId === user.user_id;
  const avatarUrl = user.avatar
    ? getMediaUrl(user.avatar)
    : getAvatarUrl(user.name || user.username);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || !onFollow || !onUnfollow) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        const success = await onUnfollow(user.user_id);
        if (success) setIsFollowing(false);
      } else {
        const success = await onFollow(user.user_id);
        if (success) setIsFollowing(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      to={`/u/${user.username}`}
      className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} alt={user.username} />
        <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold truncate">
            {user.name || user.username}
          </span>
        </div>
        <span className="text-muted-foreground text-sm truncate block">
          @{user.username}
        </span>
      </div>

      {showFollowButton && !isOwnProfile && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleFollowClick}
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </Link>
  );
}
