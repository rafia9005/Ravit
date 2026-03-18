import { UserCard } from "./UserCard";
import { Loader2, Users } from "lucide-react";
import type { UserFollow } from "@/types";

interface UserListProps {
  users: UserFollow[];
  loading?: boolean;
  hasMore?: boolean;
  currentUserId?: number;
  onLoadMore?: () => void;
  onFollow?: (userId: number) => Promise<boolean>;
  onUnfollow?: (userId: number) => Promise<boolean>;
  emptyMessage?: string;
  showFollowButton?: boolean;
  followingMap?: Map<number, boolean>;
}

function UserCardSkeleton() {
  return (
    <div className="p-4 flex items-start gap-3 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="h-8 w-20 bg-muted rounded-full" />
    </div>
  );
}

export function UserList({
  users,
  loading = false,
  hasMore = false,
  currentUserId,
  onLoadMore,
  onFollow,
  onUnfollow,
  emptyMessage = "No users found",
  showFollowButton = true,
  followingMap,
}: UserListProps) {
  // Show skeletons on initial load
  if (loading && users.length === 0) {
    return (
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!loading && users.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          currentUserId={currentUserId}
          isFollowing={followingMap?.get(user.user_id) ?? false}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          showFollowButton={showFollowButton}
        />
      ))}

      {loading && (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full py-4 text-primary hover:bg-muted/50 transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}
