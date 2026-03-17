import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Repeat2, UserPlus, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { getAvatarUrl } from "@/lib/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  like: <Heart className="size-4 text-rose-500 fill-rose-500" />,
  comment: <MessageCircle className="size-4 text-primary" />,
  reply: <MessageCircle className="size-4 text-primary" />,
  follow: <UserPlus className="size-4 text-primary" />,
  repost: <Repeat2 className="size-4 text-green-500" />,
};

const notificationText: Record<NotificationType, string> = {
  like: "liked your post",
  comment: "commented on your post",
  reply: "replied to your comment",
  follow: "started following you",
  repost: "reposted your post",
};

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchNotifications({ limit, offset: 0 });
  }, [fetchNotifications]);

  const handleLoadMore = useCallback(() => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchNotifications({ limit, offset: newOffset });
  }, [offset, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "like":
      case "comment":
      case "repost":
        return notification.target_id ? `/post/${notification.target_id}` : "#";
      case "reply":
        return notification.target_id ? `/post/${notification.target_id}` : "#";
      case "follow":
        return `/profile/${notification.actor_id}`;
      default:
        return "#";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center selection:bg-primary/20">
      <div className="flex w-full max-w-7xl">
        {/* Left Sidebar */}
        <aside className="w-16 lg:w-[275px] shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-[600px] border-x min-h-screen">
          <div className="flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
              {notifications.some((n) => !n.is_read) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-primary"
                >
                  <Check className="size-4 mr-1" />
                  Mark all as read
                </Button>
              )}
            </header>

            {/* Notification List */}
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col">
                {[...Array(5)].map((_, i) => (
                  <NotificationSkeleton key={i} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 flex gap-3 border-b hover:bg-muted/30 transition-colors",
                      !notification.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="size-8 rounded-full flex items-center justify-center bg-muted">
                      {notificationIcons[notification.type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={
                              notification.actor?.avatar ||
                              getAvatarUrl(`User${notification.actor_id}`)
                            }
                          />
                          <AvatarFallback>
                            {notification.actor?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm truncate">
                          {notification.actor?.name || "Someone"}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {notificationText[notification.type]}
                        </span>
                      </div>

                      {notification.content && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                      )}

                      <span className="text-xs text-muted-foreground mt-1 block">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>

                    {!notification.is_read && (
                      <div className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </Link>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="p-4 text-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load more"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-[350px] shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="p-4 flex gap-3 border-b">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>
    </div>
  );
}
