import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import type { Comment, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface CommentCardProps {
  comment: Comment;
  currentUserId?: number;
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => void;
  user?: User;
}

export function CommentCard({
  comment,
  currentUserId,
  onDelete,
  onEdit,
  user,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = currentUserId === comment.user_id;
  const displayUser = user || comment.user;
  const avatarUrl = displayUser?.avatar || getAvatarUrl(displayUser?.name || "User");
  const userInitial = displayUser?.name?.[0]?.toUpperCase() || "U";

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

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="p-4 flex gap-3 border-b hover:bg-muted/20 transition-colors">
      <Link to={`/profile/${comment.user_id}`}>
        <Avatar className="size-9">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Link
            to={`/profile/${comment.user_id}`}
            className="font-semibold text-sm hover:underline"
          >
            {displayUser?.name || "User"}
          </Link>
          <span className="text-muted-foreground text-xs">
            @{displayUser?.email?.split("@")[0] || "user"}
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
      </div>
    </div>
  );
}
