import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, TrendingUp, Users } from "lucide-react";
import { PostList } from "@/components/posts";
import { useExplore } from "@/hooks/useExplore";
import { usePosts } from "@/hooks/usePosts";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatar";
import type { User } from "@/types";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    trendingPosts,
    searchResults,
    userResults,
    loading,
    hasMore,
    fetchTrending,
    searchPosts,
    searchUsers,
    clearResults,
  } = useExplore();
  const { likePost, unlikePost } = usePosts();
  const { addBookmark, removeBookmark } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<"trending" | "posts" | "users">("trending");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Load trending on mount or when search is cleared
  useEffect(() => {
    const query = searchParams.get("q");
    if (!query) {
      fetchTrending({ limit, offset: 0 });
      setActiveTab("trending");
    } else {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        clearResults();
        setSearchParams({});
        fetchTrending({ limit, offset: 0 });
        setActiveTab("trending");
        return;
      }

      setSearchParams({ q: query });
      setOffset(0);

      if (activeTab === "users") {
        searchUsers({ query, limit, offset: 0 });
      } else {
        searchPosts({ query, limit, offset: 0 });
        setActiveTab("posts");
      }
    },
    [activeTab, searchPosts, searchUsers, clearResults, fetchTrending, setSearchParams]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleTabChange = (tab: string) => {
    const newTab = tab as "trending" | "posts" | "users";
    setActiveTab(newTab);
    setOffset(0);

    if (newTab === "trending") {
      clearResults();
      setSearchParams({});
      setSearchQuery("");
      fetchTrending({ limit, offset: 0 });
    } else if (searchQuery.trim()) {
      if (newTab === "users") {
        searchUsers({ query: searchQuery, limit, offset: 0 });
      } else {
        searchPosts({ query: searchQuery, limit, offset: 0 });
      }
    }
  };

  const handleLoadMore = useCallback(() => {
    const newOffset = offset + limit;
    setOffset(newOffset);

    if (activeTab === "trending") {
      fetchTrending({ limit, offset: newOffset });
    } else if (activeTab === "posts" && searchQuery) {
      searchPosts({ query: searchQuery, limit, offset: newOffset });
    } else if (activeTab === "users" && searchQuery) {
      searchUsers({ query: searchQuery, limit, offset: newOffset });
    }
  }, [offset, activeTab, searchQuery, fetchTrending, searchPosts, searchUsers]);

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

  const handleUserClick = (username: string) => {
    navigate(`/u/${username}`);
  };

  const posts = activeTab === "trending" ? trendingPosts : searchResults;

  return (
    <div className="flex flex-col">
      {/* Header with Search */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md">
        <h2 className="text-xl font-bold tracking-tight mb-4">Explore</h2>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </form>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          <TabsTrigger
            value="trending"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Trending & Posts Content */}
        <TabsContent value="trending" className="mt-0">
          <PostList
            posts={posts}
            loading={loading}
            hasMore={hasMore}
            currentUserId={user?.id}
            onLoadMore={handleLoadMore}
            onLike={likePost}
            onUnlike={unlikePost}
            onBookmark={handleBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            onReply={handleReply}
            onRepost={handleRepost}
            emptyMessage="No trending posts right now"
          />
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          <PostList
            posts={posts}
            loading={loading}
            hasMore={hasMore}
            currentUserId={user?.id}
            onLoadMore={handleLoadMore}
            onLike={likePost}
            onUnlike={unlikePost}
            onBookmark={handleBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            onReply={handleReply}
            onRepost={handleRepost}
            emptyMessage={
              searchQuery
                ? `No posts found for "${searchQuery}"`
                : "Enter a search term to find posts"
            }
          />
        </TabsContent>

        {/* Users Content */}
        <TabsContent value="users" className="mt-0">
          <UserList
            users={userResults}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onUserClick={handleUserClick}
            emptyMessage={
              searchQuery
                ? `No users found for "${searchQuery}"`
                : "Enter a search term to find users"
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// User List Component
interface UserListProps {
  users: User[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onUserClick: (username: string) => void;
  emptyMessage?: string;
}

function UserList({
  users,
  loading,
  hasMore,
  onLoadMore,
  onUserClick,
  emptyMessage = "No users found",
}: UserListProps) {
  if (!loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mb-4" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onUserClick(user.username)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.username} />
              <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.name || user.username}</p>
              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{user.bio}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="p-4 flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && users.length === 0 && (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
