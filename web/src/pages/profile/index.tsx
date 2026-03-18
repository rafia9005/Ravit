import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Settings, User } from "lucide-react";
import { PostList } from "@/components/posts";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getInitials } from "@/lib/avatar";
import { getMediaUrl } from "@/lib/images";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const {
    profile,
    userPosts,
    userLikes,
    followCounts,
    loading,
    followLoading,
    hasMore,
    fetchProfileByUsername,
    fetchMyProfile,
    fetchUserPosts,
    fetchUserLikes,
    fetchFollowCounts,
    checkIsFollowing,
    followUser,
    unfollowUser,
  } = useProfile();
  const { likePost, unlikePost } = usePosts();
  const { addBookmark, removeBookmark } = useBookmarks();

  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");
  const [offset, setOffset] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const limit = 20;

  const isOwnProfile = !username || (currentUser && currentUser.username === username);
  const profileId = profile?.id;

  useEffect(() => {
    const loadProfile = async () => {
      if (isOwnProfile && currentUser) {
        await fetchMyProfile();
        if (currentUser.id) {
          fetchUserPosts(currentUser.id, { limit, offset: 0 });
          fetchFollowCounts(currentUser.id);
        }
      } else if (username) {
        const profileData = await fetchProfileByUsername(username);
        if (profileData && profileData.id) {
          fetchUserPosts(profileData.id, { limit, offset: 0 });
          fetchFollowCounts(profileData.id);
          
          // Check if following
          const isFollowingUser = await checkIsFollowing(profileData.id);
          setIsFollowing(isFollowingUser);
        }
      }
      setOffset(0);
      setActiveTab("posts");
    };
    
    loadProfile();
  }, [username, isOwnProfile, currentUser]);

  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.is_following || false);
    }
  }, [profile]);

  const handleTabChange = (tab: string) => {
    const newTab = tab as "posts" | "likes";
    setActiveTab(newTab);
    setOffset(0);

    if (!profileId) return;

    if (newTab === "posts") {
      fetchUserPosts(profileId, { limit, offset: 0 });
    } else {
      fetchUserLikes(profileId, { limit, offset: 0 });
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!profileId) return;

    const newOffset = offset + limit;
    setOffset(newOffset);

    if (activeTab === "posts") {
      fetchUserPosts(profileId, { limit, offset: newOffset });
    } else {
      fetchUserLikes(profileId, { limit, offset: newOffset });
    }
  }, [offset, activeTab, profileId, fetchUserPosts, fetchUserLikes]);

  const handleFollow = async () => {
    if (!profileId || followLoading) return;

    try {
      if (isFollowing) {
        await unfollowUser(profileId);
        setIsFollowing(false);
      } else {
        await followUser(profileId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    }
  };

  const handleReply = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: number) => {
    navigate(`/compose?repost=${postId}`);
  };

  const handleBookmark = async (postId: number) => {
    await addBookmark(postId);
  };

  const handleRemoveBookmark = async (postId: number) => {
    await removeBookmark(postId);
  };

  const posts = activeTab === "posts" ? userPosts : userLikes;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

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
              {profile?.username || profile?.username || "Profile"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {userPosts.length} posts
            </p>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      {profile && (
         <div className="border-b">
           {/* Cover Image */}
           <div 
             className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/40 bg-cover bg-center"
             style={profile.banner ? { backgroundImage: `url(${getMediaUrl(profile.banner)})` } : undefined}
           ></div>

          {/* Avatar & Actions */}
          <div className="px-4 pb-4">
            <div className="flex justify-between items-start -mt-12 sm:-mt-16">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
                <AvatarImage
                  src={getAvatarUrl(profile.avatar)}
                  alt={profile.username}
                />
                <AvatarFallback className="text-2xl sm:text-4xl">
                  {profile?.name ? (
                    getInitials(profile.name)
                  ) : (
                    <User className="size-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="mt-14 sm:mt-20">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/settings/profile")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit profile
                  </Button>
                ) : (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading
                      ? "..."
                      : isFollowing
                        ? "Following"
                        : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-4">
              <h3 className="text-xl font-bold">
                {profile.name || profile.username}
              </h3>
              <p className="text-muted-foreground">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-3 whitespace-pre-wrap">{profile.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {profile.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                )}
              </div>

               {/* Following/Followers */}
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => navigate(`/u/${profile.username}/following`)}
                  className="hover:underline"
                >
                  <span className="font-bold">{followCounts.following_count || profile.following_count || 0}</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </button>
                <button
                  onClick={() => navigate(`/u/${profile.username}/followers`)}
                  className="hover:underline"
                >
                  <span className="font-bold">{followCounts.followers_count || profile.followers_count || 0}</span>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          <TabsTrigger
            value="posts"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <PostList
            posts={posts}
            loading={loading}
            hasMore={hasMore}
            currentUserId={currentUser?.id}
            onLoadMore={handleLoadMore}
            onLike={likePost}
            onUnlike={unlikePost}
            onBookmark={handleBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            onReply={handleReply}
            onRepost={handleRepost}
            emptyMessage={
              isOwnProfile
                ? "You haven't posted anything yet"
                : "This user hasn't posted anything yet"
            }
          />
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          <PostList
            posts={posts}
            loading={loading}
            hasMore={hasMore}
            currentUserId={currentUser?.id}
            onLoadMore={handleLoadMore}
            onLike={likePost}
            onUnlike={unlikePost}
            onBookmark={handleBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            onReply={handleReply}
            onRepost={handleRepost}
            emptyMessage={
              isOwnProfile
                ? "You haven't liked any posts yet"
                : "This user hasn't liked any posts yet"
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
