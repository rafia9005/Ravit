import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { UserList } from "@/components/users";
import { useProfile } from "@/hooks/useProfile";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FollowersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const {
    profile,
    followers,
    following,
    loading,
    hasMore,
    fetchProfileByUsername,
    fetchFollowers,
    fetchFollowing,
  } = useProfile();
  const { followUser, unfollowUser, checkIsFollowing } = useFollow();

  // Determine initial tab from URL
  const initialTab = location.pathname.includes("/following") ? "following" : "followers";
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [offset, setOffset] = useState(0);
  const [followingMap, setFollowingMap] = useState<Map<number, boolean>>(new Map());
  const limit = 20;

  const profileId = profile?.id;

  // Fetch profile and initial data
  useEffect(() => {
    const loadData = async () => {
      if (username) {
        const profileData = await fetchProfileByUsername(username);
        if (profileData && profileData.id) {
          if (initialTab === "following") {
            fetchFollowing(profileData.id, { limit, offset: 0 });
          } else {
            fetchFollowers(profileData.id, { limit, offset: 0 });
          }
        }
      }
      setOffset(0);
      setActiveTab(initialTab);
    };
    
    loadData();
  }, [username, initialTab, fetchProfileByUsername, fetchFollowers, fetchFollowing]);

  // Check follow status for each user in the list
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser) return;

      const users = activeTab === "followers" ? followers : following;
      const newMap = new Map<number, boolean>();

      for (const user of users) {
        if (user.user_id !== currentUser.id) {
          const isFollowing = await checkIsFollowing(user.user_id);
          newMap.set(user.user_id, isFollowing);
        }
      }

      setFollowingMap(newMap);
    };

    checkFollowStatus();
  }, [followers, following, activeTab, currentUser, checkIsFollowing]);

  const handleTabChange = (tab: string) => {
    const newTab = tab as "followers" | "following";
    setActiveTab(newTab);
    setOffset(0);

    if (!username || !profileId) return;

    // Update URL without full navigation
    const newPath = `/u/${username}/${newTab}`;
    navigate(newPath, { replace: true });

    if (newTab === "followers") {
      fetchFollowers(profileId, { limit, offset: 0 });
    } else {
      fetchFollowing(profileId, { limit, offset: 0 });
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!profileId) return;

    const newOffset = offset + limit;
    setOffset(newOffset);

    if (activeTab === "followers") {
      fetchFollowers(profileId, { limit, offset: newOffset });
    } else {
      fetchFollowing(profileId, { limit, offset: newOffset });
    }
  }, [offset, activeTab, profileId, fetchFollowers, fetchFollowing]);

  const handleFollow = useCallback(
    async (targetUserId: number) => {
      const success = await followUser(targetUserId);
      if (success) {
        setFollowingMap((prev) => new Map(prev).set(targetUserId, true));
      }
      return success;
    },
    [followUser]
  );

  const handleUnfollow = useCallback(
    async (targetUserId: number) => {
      const success = await unfollowUser(targetUserId);
      if (success) {
        setFollowingMap((prev) => new Map(prev).set(targetUserId, false));
      }
      return success;
    },
    [unfollowUser]
  );

  const users = activeTab === "followers" ? followers : following;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {profile?.name || profile?.username || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">
              @{profile?.username}
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          <TabsTrigger
            value="followers"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            Followers
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="mt-0">
          <UserList
            users={users}
            loading={loading}
            hasMore={hasMore}
            currentUserId={currentUser?.id}
            onLoadMore={handleLoadMore}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            followingMap={followingMap}
            emptyMessage="No followers yet"
          />
        </TabsContent>

        <TabsContent value="following" className="mt-0">
          <UserList
            users={users}
            loading={loading}
            hasMore={hasMore}
            currentUserId={currentUser?.id}
            onLoadMore={handleLoadMore}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            followingMap={followingMap}
            emptyMessage="Not following anyone yet"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
