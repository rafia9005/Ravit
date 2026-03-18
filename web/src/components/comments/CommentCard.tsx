import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Edit, Loader2, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import type { Comment, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import commentService from "@/services/comment.service";

interface CommentCardProps {
  comment: Comment;
  postId: number;
  currentUserId?: number;
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => void;
  onReplyCreated?: (reply: Comment) => void;
  user?: User;
  depth?: number;
}

export function CommentCard({
  comment,
  postId,
  currentUserId,
  onDelete,
  onEdit,
  onReplyCreated,
  user,
  depth = 0,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.reply_count || 0);

  const isOwner = currentUserId === comment.user_id;
  const displayUser = user || comment.user;
  const avatarUrl = displayUser?.avatar || getAvatarUrl(displayUser?.name || "User");
  const userInitial = displayUser?.name?.[0]?.toUpperCase() || "U";
  const displayUsername = displayUser?.username || displayUser?.email?.split("@")[0] || "user";
  const maxDepth = 3; // Maximum nesting level

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit?.(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const response = await commentService.createReply(postId, comment.id, replyContent.trim());
      if (response.data) {
        setReplies((prev) => [...prev, response.data]);
        setReplyCount((prev) => prev + 1);
        setReplyContent("");
        setIsReplying(false);
        setShowReplies(true);
        onReplyCreated?.(response.data);
      }
    } catch (error) {
      console.error("Failed to create reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleToggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    if (replies.length === 0 && replyCount > 0) {
      setLoadingReplies(true);
      try {
        const response = await commentService.getReplies(comment.id, { limit: 20 });
        if (response.data) {
          setReplies(response.data);
        }
      } catch (error) {
        console.error("Failed to load replies:", error);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(true);
  };

  const handleDeleteReply = (replyId: number) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
    setReplyCount((prev) => Math.max(0, prev - 1));
    onDelete?.(replyId);
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className={`${depth > 0 ? "ml-3 sm:ml-6 border-l-2 border-muted pl-2 sm:pl-4" : ""}`}>
      <div className="p-3 sm:p-4 flex gap-2 sm:gap-3 hover:bg-muted/20 transition-colors">
        <Link to={`/u/${displayUsername}`}>
          <Avatar className="size-8 sm:size-9">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Link
              to={`/u/${displayUsername}`}
              className="font-semibold text-sm hover:underline"
            >
              {displayUser?.name || "User"}
            </Link>
            <span className="text-muted-foreground text-xs">
              @{displayUsername}
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">
              {formatTime(comment.created_at)}
            </span>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto size-7 rounded-full"
                  >
                    <MoreHorizontal className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg bg-background resize-none"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-2">
            {/* Reply button - only show if not at max depth */}
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-primary"
                onClick={() => setIsReplying(!isReplying)}
              >
                <MessageCircle className="size-4 mr-1" />
                Reply
              </Button>
            )}

            {/* Show replies button */}
            {replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-primary"
                onClick={handleToggleReplies}
                disabled={loadingReplies}
              >
                {loadingReplies ? (
                  <Loader2 className="size-4 mr-1 animate-spin" />
                ) : showReplies ? (
                  <ChevronUp className="size-4 mr-1" />
                ) : (
                  <ChevronDown className="size-4 mr-1" />
                )}
                {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </Button>
            )}
          </div>

          {/* Reply input */}
          {isReplying && (
            <div className="mt-3 flex flex-col gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to @${displayUsername}...`}
                className="w-full p-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmittingReply}
                >
                  {isSubmittingReply ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Replying...
                    </>
                  ) : (
                    "Reply"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replies.length > 0 && (
        <div className="border-t border-muted/50">
          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              onDelete={handleDeleteReply}
              onEdit={onEdit}
              onReplyCreated={onReplyCreated}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
