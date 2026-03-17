import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import { useAuth } from "@/hooks/useAuth";

interface CommentComposerProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function CommentComposer({
  onSubmit,
  placeholder = "Write a comment...",
  className,
}: CommentComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const avatarUrl = user?.avatar || getAvatarUrl(user?.name || "User");
  const userInitial = user?.name?.[0]?.toUpperCase() || "U";
  const canSubmit = content.trim().length > 0 && !isSubmitting;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className={`p-4 flex gap-3 border-b ${className || ""}`}>
      <Avatar className="size-9">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{userInitial}</AvatarFallback>
      </Avatar>

      <div className="flex-1 flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-sm resize-none placeholder:text-muted-foreground focus:ring-0 min-h-[60px]"
          disabled={isSubmitting}
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            className="rounded-full px-4 font-semibold"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Reply"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
